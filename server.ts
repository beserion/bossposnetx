import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import sql from "mssql";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

console.log("Environment Variables Loaded:");
console.log("ENABLE_AI:", process.env.ENABLE_AI);
console.log("ACTIVE_AI_PROVIDER:", process.env.ACTIVE_AI_PROVIDER);

// --- LICENSE CONFIGURATION ---
// This is controlled from the backend and cannot be changed from the frontend.

const LICENSE_CONFIG = {
  aiEnabled: process.env.ENABLE_AI === 'true', // Set to true to enable AI features globally
  activeProvider: process.env.ACTIVE_AI_PROVIDER || 'gemini'
};

const dbConfig: sql.config = {
  user: process.env.DB_USERNAME || "sa",
  password: process.env.DB_PASSWORD || "Oryx123!",
  server: process.env.DB_HOST || "149.34.201.35",
  port: parseInt(process.env.DB_PORT || "1433"),
  database: "AntigravityPOS", // Explicitly force AntigravityPOS
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectTimeout: 15000
  },
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Database Pool
  let pool: sql.ConnectionPool | null = null;
  const connectDB = async () => {
    try {
      console.log(`Attempting to connect to database: ${dbConfig.database} at ${dbConfig.server}`);
      pool = await sql.connect(dbConfig);
      console.log("Connected to MSSQL Server successfully");
    } catch (err) {
      console.error("Database connection failed critical error:", err);
    }
  };
  
  await connectDB();



  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      dbConnected: !!pool,
      time: new Date().toISOString(),
      env: process.env.NODE_ENV
    });
  });

  // Feature Config Endpoint
  app.get("/api/config/features", (req, res) => {
    res.json(LICENSE_CONFIG);
  });

  // AI Proxy Endpoint
  // Call init after pool is ready
  if (pool) {
    // No custom initialization needed as we use the provided schema
  }

  app.post("/api/ai/chat", async (req, res) => {
    if (!LICENSE_CONFIG.aiEnabled) {
      return res.status(403).json({ error: "AI modülü lisansınızda aktif değil." });
    }

    const { message, systemInstruction } = req.body;
    const provider = LICENSE_CONFIG.activeProvider;

    try {
      if (provider === 'gemini') {
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: message,
          config: { systemInstruction }
        });
        return res.json({ text: response.text });
      } 
      
      if (provider === 'openai') {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: message }
          ],
        });
        return res.json({ text: completion.choices[0].message.content });
      }

      if (provider === 'claude') {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const msg = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1024,
          system: systemInstruction,
          messages: [{ role: "user", content: message }],
        });
        // @ts-ignore
        return res.json({ text: msg.content[0].text });
      }

      if (provider === 'kimi') {
        const kimi = new OpenAI({ 
          apiKey: process.env.KIMI_API_KEY,
          baseURL: "https://api.moonshot.cn/v1"
        });
        const completion = await kimi.chat.completions.create({
          model: "moonshot-v1-8k",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: message }
          ],
        });
        return res.json({ text: completion.choices[0].message.content });
      }

      res.status(400).json({ error: "Bilinmeyen AI sağlayıcısı." });
    } catch (error: any) {
      console.error("AI Proxy Error:", error);
      res.status(500).json({ error: "AI yanıtı alınırken bir hata oluştu.", details: error.message });
    }
  });

  // Debug Endpoint
  app.get("/api/branches", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const result = await pool.request().query(`
        SELECT 
          l.id, 
          l.name, 
          l.address as location, 
          N'Yönetici Atanmadı' as manager, 
          1000000 as monthly_target, 
          CASE WHEN l.isActive = 1 THEN N'open' ELSE N'closed' END as status, 
          4.5 as rating,
          ISNULL((SELECT SUM(s.totalAmount) FROM sales s JOIN cash_registers cr ON s.cashRegisterId = cr.id WHERE cr.locationId = l.id AND CAST(s.createdAt AS DATE) = CAST(GETDATE() AS DATE) AND s.status != 'CANCELLED'), 0) as todaySales,
          ISNULL((SELECT COUNT(*) FROM shifts sh JOIN cash_registers cr ON sh.cashRegisterId = cr.id WHERE cr.locationId = l.id AND sh.status = 'OPEN'), 0) as staffCount
        FROM locations l
      `);
      res.json(result.recordset);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- HELPER FOR DATE PARAMS ---
  const getDateParams = (req: any) => {
    const start = req.query.startDate ? new Date(req.query.startDate as string) : new Date();
    const end = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    return { start, end };
  };

  // --- EXISTING OVERVIEW API ---
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      if (!pool) throw new Error("Database connection not established.");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT 
          ISNULL((SELECT SUM(totalAmount) FROM sales WHERE status != 'CANCELLED'), 0) as totalSalesAllTime,
          ISNULL((SELECT SUM(totalAmount) FROM sales WHERE CAST(createdAt AS DATE) BETWEEN @startDate AND @endDate AND status != 'CANCELLED'), 0) as todaySales,
          (SELECT COUNT(*) FROM tables WHERE status != 'BOŞ' AND isDeleted = 0) as activeTables,
          (SELECT COUNT(*) FROM sales WHERE status != 'CANCELLED') as completedOrders,
          ISNULL((SELECT SUM(amount) FROM account_transactions WHERE type = 'INCOME' AND CAST(createdAt AS DATE) BETWEEN @startDate AND @endDate), 0) as todayIncome
      `);
      res.json(result.recordset[0]);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/reports/sales-trend", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT 
          CAST(s.createdAt AS DATE) as date, 
          SUM(si.total) as total,
          SUM(si.total) - SUM(si.quantity * ISNULL(p.costPrice, 0)) as profit,
          ISNULL(SUM(si.total) / NULLIF(COUNT(DISTINCT s.id), 0), 0) as aov
        FROM sales s
        JOIN sale_items si ON s.id = si.saleId
        JOIN products p ON si.productId = p.id
        WHERE s.status != 'CANCELLED' AND CAST(s.createdAt AS DATE) BETWEEN @startDate AND @endDate
        GROUP BY CAST(s.createdAt AS DATE)
        ORDER BY date ASC
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/reports/top-products", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT TOP 10 
          p.name, 
          SUM(si.quantity) as totalQty, 
          SUM(si.total) as totalRevenue,
          SUM(si.total) - SUM(si.quantity * ISNULL(p.costPrice, 0)) as profit
        FROM sale_items si 
        JOIN products p ON si.productId = p.id
        JOIN sales s ON si.saleId = s.id
        WHERE s.status != 'CANCELLED' AND CAST(s.createdAt AS DATE) BETWEEN @startDate AND @endDate
        GROUP BY p.name 
        ORDER BY totalRevenue DESC
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/tables/active", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const result = await pool.request().query(`
        SELECT name, waiterName, currentTotal, orderStartTime 
        FROM tables WHERE status != 'BOŞ' AND isDeleted = 0
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // --- NEW DETAILED REPORTS API ---
  app.get("/api/reports/finance", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT 
          ISNULL((SELECT SUM(balance) FROM company_accounts), 0) as totalBalance,
          ISNULL((SELECT SUM(amount) FROM account_transactions WHERE type='INCOME' AND CAST(createdAt AS DATE) BETWEEN @startDate AND @endDate), 0) as dailyIncome,
          ISNULL((SELECT SUM(amount) FROM account_transactions WHERE type='EXPENSE' AND CAST(createdAt AS DATE) BETWEEN @startDate AND @endDate), 0) as dailyExpense,
          ISNULL((SELECT SUM(si.total) - SUM(si.quantity * ISNULL(p.costPrice, 0)) FROM sale_items si JOIN sales s ON si.saleId = s.id JOIN products p ON si.productId = p.id WHERE CAST(s.createdAt AS DATE) BETWEEN @startDate AND @endDate AND s.status != 'CANCELLED'), 0) as dailyProfit
      `);
      res.json(result.recordset[0]);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/reports/hourly-sales", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT DATEPART(HOUR, createdAt) as hour, SUM(totalAmount) as total 
        FROM sales 
        WHERE CAST(createdAt AS DATE) BETWEEN @startDate AND @endDate AND status != 'CANCELLED'
        GROUP BY DATEPART(HOUR, createdAt)
        ORDER BY hour
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/reports/category-sales", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT ISNULL(p.category, 'Diğer') as name, SUM(si.total) as value 
        FROM sale_items si 
        JOIN products p ON si.productId = p.id 
        JOIN sales s ON si.saleId = s.id
        WHERE CAST(s.createdAt AS DATE) BETWEEN @startDate AND @endDate AND s.status != 'CANCELLED'
        GROUP BY p.category
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/reports/staff-performance", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT 
          u.firstName + ' ' + u.lastName as name, 
          COUNT(s.id) as orders, 
          ISNULL(SUM(s.totalAmount), 0) as revenue,
          ISNULL(AVG(s.totalAmount), 0) as avgOrderValue,
          ISNULL((SELECT COUNT(*) FROM sales s2 WHERE s2.waiterId = u.id AND s2.status = 'CANCELLED' AND CAST(s2.createdAt AS DATE) BETWEEN @startDate AND @endDate), 0) as cancelCount
        FROM sales s 
        JOIN users u ON s.waiterId = u.id 
        WHERE CAST(s.createdAt AS DATE) BETWEEN @startDate AND @endDate AND s.status != 'CANCELLED'
        GROUP BY u.id, u.firstName, u.lastName
        ORDER BY revenue DESC
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/reports/critical-stocks", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const result = await pool.request().query(`
        SELECT p.name, s.quantity, ISNULL(p.minStockLevel, 5) as minStockLevel 
        FROM stocks s 
        JOIN products p ON s.productId = p.id 
        WHERE s.quantity <= ISNULL(p.minStockLevel, 5)
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/reports/debtors", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const result = await pool.request().query(`
        SELECT name, currentBalance, phone 
        FROM partners 
        WHERE currentBalance > 0 AND type = 'CUSTOMER'
        ORDER BY currentBalance DESC
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/reports/reservations", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT customerName, guestCount, reservationTime, status 
        FROM reservations 
        WHERE CAST(reservationTime AS DATE) BETWEEN @startDate AND @endDate
        ORDER BY reservationTime ASC
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/reports/stock-advanced", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT 
          ISNULL((SELECT SUM(s.quantity * ISNULL(p.costPrice, 0)) FROM stocks s JOIN products p ON s.productId = p.id), 0) as totalInventoryValue,
          ISNULL((SELECT SUM(w.quantity * ISNULL(p.costPrice, 0)) FROM wastages w JOIN products p ON w.productId = p.id WHERE CAST(w.createdAt AS DATE) BETWEEN @startDate AND @endDate), 0) as todayWastageCost
      `);
      res.json(result.recordset[0]);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/reports/operations-metrics", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT 
          ISNULL((SELECT COUNT(*) FROM sales WHERE status = 'CANCELLED' AND CAST(createdAt AS DATE) BETWEEN @startDate AND @endDate), 0) as cancelCount,
          ISNULL((SELECT SUM(totalAmount) FROM sales WHERE status = 'CANCELLED' AND CAST(createdAt AS DATE) BETWEEN @startDate AND @endDate), 0) as cancelLoss
      `);
      res.json(result.recordset[0]);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // --- ADVANCED REPORTS (EXECUTIVE DASHBOARD) ---
  app.get("/api/reports/heatmap", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT 
          DATEPART(WEEKDAY, createdAt) as day, 
          DATEPART(HOUR, createdAt) as hour, 
          COUNT(*) as count, 
          SUM(totalAmount) as revenue 
        FROM sales 
        WHERE status != 'CANCELLED' AND CAST(createdAt AS DATE) BETWEEN @startDate AND @endDate
        GROUP BY DATEPART(WEEKDAY, createdAt), DATEPART(HOUR, createdAt)
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/reports/category-profit", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT 
          ISNULL(p.category, 'Diğer') as category, 
          SUM(si.total) as revenue, 
          SUM(si.total) - SUM(si.quantity * ISNULL(p.costPrice, 0)) as profit,
          CASE WHEN SUM(si.total) = 0 THEN 0 ELSE ((SUM(si.total) - SUM(si.quantity * ISNULL(p.costPrice, 0))) / SUM(si.total)) * 100 END as margin
        FROM sale_items si 
        JOIN products p ON si.productId = p.id 
        JOIN sales s ON si.saleId = s.id
        WHERE s.status != 'CANCELLED' AND CAST(s.createdAt AS DATE) BETWEEN @startDate AND @endDate
        GROUP BY p.category
        ORDER BY profit DESC
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/reports/staff-advanced", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT 
          u.firstName + ' ' + u.lastName as name, 
          ISNULL(AVG(s.totalAmount), 0) as upsellScore,
          ISNULL(COUNT(s.id), 0) as speedScore,
          ISNULL((SELECT COUNT(*) FROM sales s2 WHERE s2.waiterId = u.id AND s2.status = 'CANCELLED' AND CAST(s2.createdAt AS DATE) BETWEEN @startDate AND @endDate), 0) as cancelRate,
          ISNULL(SUM(s.totalAmount), 0) as revenueScore
        FROM sales s 
        JOIN users u ON s.waiterId = u.id 
        WHERE CAST(s.createdAt AS DATE) BETWEEN @startDate AND @endDate
        GROUP BY u.id, u.firstName, u.lastName
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/reports/pnl-trend", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT 
          CAST(s.createdAt AS DATE) as date, 
          SUM(si.total) as revenue,
          SUM(si.quantity * ISNULL(p.costPrice, 0)) as cogs,
          ISNULL((SELECT SUM(amount) FROM account_transactions WHERE type='EXPENSE' AND CAST(createdAt AS DATE) = CAST(s.createdAt AS DATE)), 0) as expenses,
          SUM(si.total) - SUM(si.quantity * ISNULL(p.costPrice, 0)) - ISNULL((SELECT SUM(amount) FROM account_transactions WHERE type='EXPENSE' AND CAST(createdAt AS DATE) = CAST(s.createdAt AS DATE)), 0) as netProfit
        FROM sales s
        JOIN sale_items si ON s.id = si.saleId
        JOIN products p ON si.productId = p.id
        WHERE s.status != 'CANCELLED' AND CAST(s.createdAt AS DATE) BETWEEN @startDate AND @endDate
        GROUP BY CAST(s.createdAt AS DATE)
        ORDER BY date ASC
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/reports/food-cost", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT 
          ISNULL(p.category, 'Diğer') as category, 
          SUM(si.quantity * ISNULL(p.costPrice, 0)) as cost, 
          SUM(si.total) as revenue,
          CASE WHEN SUM(si.total) = 0 THEN 0 ELSE (SUM(si.quantity * ISNULL(p.costPrice, 0)) / SUM(si.total)) * 100 END as ratio
        FROM sale_items si 
        JOIN products p ON si.productId = p.id 
        JOIN sales s ON si.saleId = s.id
        WHERE s.status != 'CANCELLED' AND CAST(s.createdAt AS DATE) BETWEEN @startDate AND @endDate
        GROUP BY p.category
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/reports/basket-analysis", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT TOP 5
          p1.name as productA,
          p2.name as productB,
          COUNT(*) as frequency
        FROM sale_items si1
        JOIN sale_items si2 ON si1.saleId = si2.saleId AND si1.productId < si2.productId
        JOIN products p1 ON si1.productId = p1.id
        JOIN products p2 ON si2.productId = p2.id
        JOIN sales s ON si1.saleId = s.id
        WHERE s.status != 'CANCELLED' AND CAST(s.createdAt AS DATE) BETWEEN @startDate AND @endDate
        GROUP BY p1.name, p2.name
        ORDER BY frequency DESC
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/reports/cancel-analysis", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT 
          'Müşteri İptali' as reason,
          COUNT(*) as count,
          ISNULL(SUM(totalAmount), 0) as loss
        FROM sales
        WHERE status = 'CANCELLED' AND CAST(createdAt AS DATE) BETWEEN @startDate AND @endDate
      `);
      res.json(result.recordset[0]);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/reports/table-turnover", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT 
          'Genel Ortalama' as tableName,
          ISNULL(CAST(COUNT(*) AS FLOAT) / NULLIF((SELECT COUNT(*) FROM tables WHERE isDeleted = 0), 0), 0) as turnoverRate,
          45 as avgDuration,
          ISNULL(SUM(totalAmount), 0) as revenue
        FROM sales
        WHERE CAST(createdAt AS DATE) BETWEEN @startDate AND @endDate
      `);
      res.json(result.recordset[0]);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/reports/payment-methods", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT 
          ISNULL(paymentMethod, 'Nakit') as method,
          COUNT(*) as count,
          SUM(totalAmount) as total
        FROM sales
        WHERE status != 'CANCELLED' AND CAST(createdAt AS DATE) BETWEEN @startDate AND @endDate
        GROUP BY ISNULL(paymentMethod, 'Nakit')
      `);
      res.json(result.recordset);
    } catch (err: any) { 
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/reports/top-wastage", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const { start, end } = getDateParams(req);
      const result = await pool.request()
        .input('startDate', sql.Date, start)
        .input('endDate', sql.Date, end)
        .query(`
        SELECT TOP 5
          p.name,
          SUM(w.quantity) as quantity,
          SUM(w.quantity * ISNULL(p.costPrice, 0)) as loss
        FROM wastages w
        JOIN products p ON w.productId = p.id
        WHERE CAST(w.createdAt AS DATE) BETWEEN @startDate AND @endDate
        GROUP BY p.name
        ORDER BY loss DESC
      `);
      res.json(result.recordset);
    } catch (err: any) { 
      res.status(500).json({ error: err.message });
    }
  });

  // --- NEW ADVANCED FEATURES API (REAL SQL) ---
  app.get("/api/alerts", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const result = await pool.request().query(`
        SELECT TOP 20 
          id, 
          eventKey as title, 
          description as message, 
          severity as type, 
          createdAt as timestamp, 
          isRead 
        FROM alert_notifications 
        ORDER BY createdAt DESC
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/reports/menu-engineering", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const result = await pool.request().query(`
        WITH ItemStats AS (
            SELECT 
                p.name,
                SUM(si.quantity) as totalQty,
                SUM(si.total) as revenue,
                SUM(si.total - (si.quantity * ISNULL(p.costPrice, 0))) as profit
            FROM sale_items si
            JOIN products p ON si.productId = p.id
            JOIN sales s ON si.saleId = s.id
            WHERE s.status != 'CANCELLED'
            GROUP BY p.name
        ),
        Medians AS (
            SELECT 
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY totalQty) OVER () as medianQty,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY profit) OVER () as medianProfit
            FROM ItemStats
        )
        SELECT 
            name,
            totalQty as popularity,
            profit as profitability,
            revenue,
            profit,
            CASE 
                WHEN totalQty >= (SELECT TOP 1 medianQty FROM Medians) AND profit >= (SELECT TOP 1 medianProfit FROM Medians) THEN 'Star'
                WHEN totalQty >= (SELECT TOP 1 medianQty FROM Medians) AND profit < (SELECT TOP 1 medianProfit FROM Medians) THEN 'Plowhorse'
                WHEN totalQty < (SELECT TOP 1 medianQty FROM Medians) AND profit >= (SELECT TOP 1 medianProfit FROM Medians) THEN 'Puzzle'
                ELSE 'Dog'
            END as category
        FROM ItemStats
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/ai/pricing-suggestions", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const result = await pool.request().query(`
        SELECT TOP 5
            p.name as productName,
            p.price as currentPrice,
            p.price * 1.1 as suggestedPrice,
            N'Yüksek talep ve düşük marj nedeniyle fiyat artışı önerilir.' as reason,
            N'+%10 Kar Artışı' as impact
        FROM sale_items si
        JOIN products p ON si.productId = p.id
        GROUP BY p.name, p.price, p.costPrice
        HAVING SUM(si.quantity) > 10 AND (p.price - ISNULL(p.costPrice, 0)) / NULLIF(p.price, 0) < 0.3
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/ai/shift-optimization", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const result = await pool.request().query(`
        WITH HourlyDemand AS (
            SELECT 
                DATEPART(HOUR, createdAt) as hour,
                COUNT(*) / 7.0 as avgCustomers
            FROM sales
            WHERE status != 'CANCELLED'
            GROUP BY DATEPART(HOUR, createdAt)
        ),
        CurrentStaff AS (
            SELECT 
                DATEPART(HOUR, openedAt) as hour,
                COUNT(*) as staffCount
            FROM shifts
            WHERE status = 'OPEN'
            GROUP BY DATEPART(HOUR, openedAt)
        )
        SELECT 
            N'Bugün' as day,
            d.hour,
            CAST(d.avgCustomers AS INT) as predictedCustomerCount,
            CAST(d.avgCustomers / 5.0 + 1 AS INT) as suggestedStaffCount,
            ISNULL(s.staffCount, 0) as currentStaffCount
        FROM HourlyDemand d
        LEFT JOIN CurrentStaff s ON d.hour = s.hour
        ORDER BY d.hour
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/suppliers", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const result = await pool.request().query(`
        SELECT 
            id, 
            name, 
            N'Genel' as category, 
            4.5 as rating, 
            CAST(updatedAt AS DATE) as lastOrder, 
            CASE WHEN isActive = 1 THEN N'Aktif' ELSE N'Pasif' END as status 
        FROM partners 
        WHERE type = 'SUPPLIER'
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/shifts", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const result = await pool.request().query(`
        SELECT 
            s.id, 
            u.firstName + ' ' + u.lastName as staffName, 
            N'Personel' as role, 
            CAST(s.openedAt AS TIME) as shift,
            s.status 
        FROM shifts s
        JOIN users u ON s.userId = u.id
        WHERE s.status = 'OPEN'
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/warehouse/check", async (req, res) => {
    try {
      if (!pool) throw new Error("DB not connected");
      const result = await pool.request().query(`
        SELECT 
            s.id, 
            p.name, 
            CAST(s.quantity AS NVARCHAR) + ' ' + ISNULL(p.unit, 'adet') as stock,
            CASE 
                WHEN s.quantity <= ISNULL(p.minStockLevel, 5) THEN N'Kritik'
                WHEN s.quantity <= ISNULL(p.minStockLevel, 5) * 1.5 THEN N'Düşük'
                ELSE N'Normal'
            END as status,
            N'Bugün' as lastCheck
        FROM stocks s
        JOIN products p ON s.productId = p.id
        WHERE s.quantity <= ISNULL(p.minStockLevel, 5) * 2
      `);
      res.json(result.recordset);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
