import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, TrendingUp, Users, Utensils, Sparkles, ChevronRight,
  DollarSign, Clock, AlertCircle, RefreshCcw, BarChart3, Menu, X,
  Wallet, PieChart as PieChartIcon, Package, Settings, Calendar, AlertTriangle,
  Home, Send, User, Bot, Crown, Target, Activity, Zap, Store, RotateCw, Filter,
  Bell, ChefHat, TrendingDown, Clock3, BrainCircuit, Truck, Star, ChevronLeft
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, ComposedChart, Line, ScatterChart, Scatter, ZAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LabelList
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import Markdown from 'react-markdown';
import * as Types from './types';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

type ViewType = 'home' | 'overview' | 'finance' | 'sales' | 'staff' | 'stock' | 'operations' | 'ai' | 'executive' | 'branch' | 'advanced_ai' | 'menu_engineering';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isPopStateRef = React.useRef(false);

  // Mobil Geri Butonu & Geçmiş Yönetimi
  useEffect(() => {
    // Başlangıç durumu
    window.history.replaceState({ view: 'home' }, '');

    const handlePopState = (event: PopStateEvent) => {
      isPopStateRef.current = true;

      // Eğer Sidebar açıkken geri basılırsa, sadece Sidebar'ı kapat
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
        // History'i yerinde tutmak için bir ileri push yapabiliriz ama popstate zaten oldu.
        // Daha temiz çözüm: Sidebar açıldığında bir state push etmek.
      }

      if (event.state && event.state.view) {
        setActiveView(event.state.view);
      }

      setTimeout(() => {
        isPopStateRef.current = false;
      }, 50);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isSidebarOpen]);

  // Sidebar açıldığında history'e bir "durak" ekle (Geri basınca kapansın diye)
  useEffect(() => {
    if (isSidebarOpen) {
      window.history.pushState({ view: activeView, sidebar: true }, '');
    }
  }, [isSidebarOpen]);

  // activeView değiştiğinde history'e ekle
  useEffect(() => {
    if (!isPopStateRef.current && activeView !== (window.history.state?.view)) {
      window.history.pushState({ view: activeView }, '');
    }
  }, [activeView]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAiEnabled, setIsAiEnabled] = useState<boolean>(import.meta.env.VITE_ENABLE_AI === 'true');
  const [showNoLicenseModal, setShowNoLicenseModal] = useState(false);

  // Data States
  const today = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState({ start: today, end: today });

  const [stats, setStats] = useState<Types.DashboardStats | null>(null);
  const [trend, setTrend] = useState<Types.SalesTrend[]>([]);
  const [topProducts, setTopProducts] = useState<Types.TopProduct[]>([]);
  const [activeTables, setActiveTables] = useState<Types.ActiveTable[]>([]);

  const [finance, setFinance] = useState<Types.FinanceSummary | null>(null);
  const [hourlySales, setHourlySales] = useState<Types.HourlySale[]>([]);
  const [categorySales, setCategorySales] = useState<Types.CategorySale[]>([]);
  const [staffPerf, setStaffPerf] = useState<Types.StaffPerformance[]>([]);
  const [criticalStock, setCriticalStock] = useState<Types.CriticalStock[]>([]);
  const [stockAdvanced, setStockAdvanced] = useState<Types.StockAdvanced | null>(null);
  const [debtors, setDebtors] = useState<Types.Debtor[]>([]);
  const [reservations, setReservations] = useState<Types.Reservation[]>([]);
  const [opsMetrics, setOpsMetrics] = useState<Types.OperationsMetrics | null>(null);

  // Advanced Reports States
  const [heatmapData, setHeatmapData] = useState<Types.HeatmapData[]>([]);
  const [categoryProfit, setCategoryProfit] = useState<Types.CategoryProfit[]>([]);
  const [staffAdvanced, setStaffAdvanced] = useState<Types.StaffAdvanced[]>([]);
  const [pnlTrend, setPnlTrend] = useState<Types.PnlTrend[]>([]);
  const [foodCost, setFoodCost] = useState<Types.FoodCost[]>([]);
  const [basketAnalysis, setBasketAnalysis] = useState<Types.BasketAnalysis[]>([]);
  const [cancelAnalysis, setCancelAnalysis] = useState<Types.CancelAnalysis | null>(null);
  const [tableTurnover, setTableTurnover] = useState<Types.TableTurnover | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<Types.PaymentMethod[]>([]);
  const [topWastage, setTopWastage] = useState<Types.TopWastage[]>([]);
  const [branches, setBranches] = useState<Types.BranchData[]>([]);
  const [alerts, setAlerts] = useState<Types.SmartAlert[]>([]);
  const [menuEngineering, setMenuEngineering] = useState<Types.MenuEngineeringItem[]>([]);
  const [pricingSuggestions, setPricingSuggestions] = useState<Types.DynamicPricingSuggestion[]>([]);
  const [shiftOptimization, setShiftOptimization] = useState<Types.ShiftOptimization[]>([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionModalType, setActionModalType] = useState<'suppliers' | 'shifts' | 'warehouse' | null>(null);
  const [actionData, setActionData] = useState<any[]>([]);
  const [isActionLoading, setIsActionLoading] = useState(false);

  interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
  }
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    role: 'model',
    text: 'Merhaba! Ben PosNetX AI Danışmanınızım. İşletmenizin güncel verilerini inceledim. Bana "Bugün satışları artırmak için ne yapmalıyım?", "Hangi ürünleri öne çıkarmalıyım?" veya "Genel bir analiz yapar mısın?" gibi sorular sorabilirsiniz.'
  }]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  const getQuery = () => `?startDate=${dateRange.start}&endDate=${dateRange.end}`;
  const getTodayQuery = () => `?startDate=${today}&endDate=${today}`;

  const safeFetch = async (url: string, options?: RequestInit) => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    try {
      const res = await fetch(fullUrl, options);
      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP error! status: ${res.status}`);
      }
      if (contentType && contentType.includes("application/json")) {
        return await res.json();
      }
      const text = await res.text();
      return text;
    } catch (err: any) {
      console.error(`Fetch error for ${fullUrl}:`, err);
      // Handle network errors (when fetch itself fails)
      if (err.message === "Failed to fetch" || err.name === "TypeError") {
        throw new Error(`Sunucuya bağlanılamadı. Lütfen internet bağlantınızı ve sunucu adresini kontrol edin. URL: ${fullUrl}`);
      }
      throw err;
    }
  };

  const setQuickDate = (type: 'today' | 'yesterday' | 'week' | 'month') => {
    const today = new Date();
    // Adjust for local timezone offset to avoid UTC date shifting
    const offset = today.getTimezoneOffset() * 60000;
    const localToday = new Date(today.getTime() - offset);

    const end = localToday.toISOString().split('T')[0];
    let start = end;

    if (type === 'yesterday') {
      const y = new Date(localToday);
      y.setDate(y.getDate() - 1);
      start = y.toISOString().split('T')[0];
      setDateRange({ start, end: start });
      return;
    }
    if (type === 'week') {
      const w = new Date(localToday);
      w.setDate(w.getDate() - 6);
      start = w.toISOString().split('T')[0];
    }
    if (type === 'month') {
      const m = new Date(localToday);
      m.setDate(m.getDate() - 29);
      start = m.toISOString().split('T')[0];
    }
    setDateRange({ start, end });
  };

  const fetchOverview = async (forceToday = false) => {
    const q = forceToday ? getTodayQuery() : getQuery();
    const [s, t, p, at] = await Promise.all([
      safeFetch(`/api/dashboard/stats${q}`),
      safeFetch(`/api/reports/sales-trend${q}`),
      safeFetch(`/api/reports/top-products${q}`),
      safeFetch('/api/tables/active')
    ]);
    setStats(s); setTrend(t); setTopProducts(p); setActiveTables(at.length ? at : []);
  };

  const fetchFinance = async () => {
    const q = getQuery();
    const [f, pm, pnl] = await Promise.all([
      safeFetch(`/api/reports/finance${q}`),
      safeFetch(`/api/reports/payment-methods${q}`),
      safeFetch(`/api/reports/pnl-trend${q}`)
    ]);
    setFinance(f);
    setPaymentMethods(pm);
    setPnlTrend(pnl);
  };
  const fetchSales = async () => {
    const q = getQuery();
    const [hs, cs, ba, cp, hm] = await Promise.all([
      safeFetch(`/api/reports/hourly-sales${q}`),
      safeFetch(`/api/reports/category-sales${q}`),
      safeFetch(`/api/reports/basket-analysis${q}`),
      safeFetch(`/api/reports/category-profit${q}`),
      safeFetch(`/api/reports/heatmap${q}`)
    ]);
    setHourlySales(hs);
    setCategorySales(cs);
    setBasketAnalysis(ba);
    setCategoryProfit(cp);
    setHeatmapData(hm);
  };
  const fetchStaff = async () => setStaffPerf(await safeFetch(`/api/reports/staff-performance${getQuery()}`));
  const fetchStock = async () => {
    const q = getQuery();
    const [cs, sa, tw, fc] = await Promise.all([
      safeFetch(`/api/reports/critical-stocks${q}`),
      safeFetch(`/api/reports/stock-advanced${q}`),
      safeFetch(`/api/reports/top-wastage${q}`),
      safeFetch(`/api/reports/food-cost${q}`)
    ]);
    setCriticalStock(cs);
    setStockAdvanced(sa);
    setTopWastage(tw);
    setFoodCost(fc);
  };
  const fetchOperations = async () => {
    const q = getQuery();
    const [d, r, om, ca, tt] = await Promise.all([
      safeFetch(`/api/reports/debtors${q}`),
      safeFetch(`/api/reports/reservations${q}`),
      safeFetch(`/api/reports/operations-metrics${q}`),
      safeFetch(`/api/reports/cancel-analysis${q}`),
      safeFetch(`/api/reports/table-turnover${q}`)
    ]);
    setDebtors(d);
    setReservations(r);
    setOpsMetrics(om);
    setCancelAnalysis(ca);
    setTableTurnover(tt);
  };

  const fetchExecutive = async () => {
    const q = getQuery();
    const [hm, cp, sa, pnl, fc] = await Promise.all([
      safeFetch(`/api/reports/heatmap${q}`),
      safeFetch(`/api/reports/category-profit${q}`),
      safeFetch(`/api/reports/staff-advanced${q}`),
      safeFetch(`/api/reports/pnl-trend${q}`),
      safeFetch(`/api/reports/food-cost${q}`)
    ]);
    setHeatmapData(hm);
    setCategoryProfit(cp);
    setStaffAdvanced(sa);
    setPnlTrend(pnl);
    setFoodCost(fc);
  };

  const fetchBranches = async () => {
    try {
      const data = await safeFetch('/api/branches');
      setBranches(data.map((b: any) => ({
        id: b.id.toString(),
        name: b.name,
        location: b.location,
        manager: b.manager,
        todaySales: b.todaySales,
        monthlyTarget: b.monthly_target,
        currentMonthlySales: b.todaySales * 20, // Simplified monthly estimate
        staffCount: b.staffCount,
        status: b.status,
        rating: b.rating
      })));
    } catch (err) { console.error(err); }
  };

  const fetchAlerts = async () => {
    try {
      const data = await safeFetch('/api/alerts');
      setAlerts(data);
    } catch (err) { console.error(err); }
  };

  const fetchMenuEngineering = async () => {
    try {
      const data = await safeFetch('/api/reports/menu-engineering');
      setMenuEngineering(data);
    } catch (err) { console.error(err); }
  };

  const fetchPricingSuggestions = async () => {
    try {
      const data = await safeFetch('/api/ai/pricing-suggestions');
      setPricingSuggestions(data);
    } catch (err) { console.error(err); }
  };

  const fetchShiftOptimization = async () => {
    try {
      const data = await safeFetch('/api/ai/shift-optimization');
      setShiftOptimization(data);
    } catch (err) { console.error(err); }
  };

  const handleStrategicAction = async (type: 'suppliers' | 'shifts' | 'warehouse') => {
    setIsActionLoading(true);
    setActionModalType(type);
    setIsActionModalOpen(true);
    try {
      const endpoint = type === 'suppliers' ? '/api/suppliers' : type === 'shifts' ? '/api/shifts' : '/api/warehouse/check';
      const data = await safeFetch(endpoint);
      setActionData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const loadDataForView = async (view: ViewType, silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      if (view === 'home' || view === 'overview') await fetchOverview(view === 'home');
      if (view === 'finance') await fetchFinance();
      if (view === 'sales') await fetchSales();
      if (view === 'staff') await fetchStaff();
      if (view === 'stock') await fetchStock();
      if (view === 'operations') await fetchOperations();
      if (view === 'executive') await fetchExecutive();
      if (view === 'branch') await fetchBranches();
      if (view === 'menu_engineering') await fetchMenuEngineering();
      if (view === 'advanced_ai') {
        if (!isAiEnabled) {
          setError('Bu özellik için aktif bir AI lisansı gereklidir.');
          return;
        }
        await Promise.all([
          fetchPricingSuggestions(),
          fetchShiftOptimization(),
          fetchOverview(false),
          fetchFinance(),
          fetchSales(),
          fetchStaff(),
          fetchStock(),
          fetchOperations()
        ]);
      }
    } catch (err: any) {
      if (!silent) setError(err.message || 'Veri çekilirken hata oluştu.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    console.log('VITE_ENABLE_AI from env:', import.meta.env.VITE_ENABLE_AI);
    safeFetch('/api/config/features')
      .then(config => {
        console.log('Feature config from backend:', config);
        setIsAiEnabled(config.aiEnabled);
      })
      .catch(err => console.error('Feature config fetch failed:', err));
    fetchAlerts();
  }, []);

  useEffect(() => {
    loadDataForView(activeView);

    // 5 Saniyelik Otomatik Yenileme (Sadece Ana Sayfa ve Genel Bakış için)
    let interval: ReturnType<typeof setInterval>;
    if (activeView === 'home' || activeView === 'overview') {
      interval = setInterval(() => {
        loadDataForView(activeView, true);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeView, dateRange]);

  useEffect(() => {
    // Reset chat messages when date range changes so it gets fresh data context if needed
    // (Optional: clear chat or just let it be)
  }, [dateRange]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!isAiEnabled) return;
    if (!chatInput.trim() || isAiLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMsg }]);
    setIsAiLoading(true);

    try {
      // 1. Extract date range from user message
      const offset = new Date().getTimezoneOffset() * 60000;
      const localToday = new Date(Date.now() - offset).toISOString().split('T')[0];

      const datePrompt = `
        Bugünün tarihi: ${localToday}.
        Kullanıcının mesajı: "${userMsg}"
        Bu mesajdaki tarih aralığını çıkar. Eğer tarih belirtilmemişse, başlangıç ve bitiş olarak bugünün tarihini (${localToday}) kullan. "son bir hafta" diyorsa bugünden geriye 7 gün git.
        SADECE JSON formatında dön, başka hiçbir metin ekleme: {"start": "YYYY-MM-DD", "end": "YYYY-MM-DD"}
      `;

      const dateResponse = await safeFetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: datePrompt,
          systemInstruction: "Sen bir tarih çıkarıcı asistansın. Sadece JSON formatında yanıt ver."
        })
      });

      let extractedDates = { start: localToday, end: localToday };
      try {
        if (dateResponse && dateResponse.text) {
          // Clean potential markdown code blocks from response
          const cleanText = dateResponse.text.replace(/```json|```/g, '').trim();
          extractedDates = JSON.parse(cleanText || '{}');
          if (!extractedDates.start || !extractedDates.end) {
            extractedDates = { start: localToday, end: localToday };
          }
        } else if (dateResponse && dateResponse.error) {
          console.error("AI Date Extraction Error:", dateResponse.error);
        }
      } catch (e) {
        console.error("Date parsing error", e);
      }

      // 2. Fetch data for the extracted date range
      const q = `?startDate=${extractedDates.start}&endDate=${extractedDates.end}`;
      const [s, p, f, c, sp, cs, r, sa, cp, pnl, fc, om, ba, ca, tt, hm, pm, tw] = await Promise.all([
        safeFetch(`/api/dashboard/stats${q}`),
        safeFetch(`/api/reports/top-products${q}`),
        safeFetch(`/api/reports/finance${q}`),
        safeFetch(`/api/reports/category-sales${q}`),
        safeFetch(`/api/reports/staff-performance${q}`),
        safeFetch(`/api/reports/critical-stocks${q}`),
        safeFetch(`/api/reports/reservations${q}`),
        safeFetch(`/api/reports/staff-advanced${q}`),
        safeFetch(`/api/reports/category-profit${q}`),
        safeFetch(`/api/reports/pnl-trend${q}`),
        safeFetch(`/api/reports/food-cost${q}`),
        safeFetch(`/api/reports/operations-metrics${q}`),
        safeFetch(`/api/reports/basket-analysis${q}`),
        safeFetch(`/api/reports/cancel-analysis${q}`),
        safeFetch(`/api/reports/table-turnover${q}`),
        safeFetch(`/api/reports/heatmap${q}`),
        safeFetch(`/api/reports/payment-methods${q}`),
        safeFetch(`/api/reports/top-wastage${q}`)
      ]);

      const dataContext = `
        Kullanıcının İstediği Tarih Aralığı: ${extractedDates.start} - ${extractedDates.end}
        
        💰 FİNANS VE SATIŞ:
        - Seçili Dönem Cirosu: ${formatCurrency(s?.todaySales)}
        - Seçili Dönem Karı: ${formatCurrency(f?.dailyProfit)}
        - Tamamlanan Sipariş: ${s?.completedOrders}
        - Aktif Masa Sayısı: ${s?.activeTables}
        
        🍔 ÜRÜN SATIŞLARI (Seçili Dönemde Satılan Ürünler):
        ${p.length > 0 ? p.map((prod: any) => `- ${prod.name}: ${prod.totalQty} adet satıldı, ${formatCurrency(prod.totalRevenue)} ciro`).join('\n        ') : 'Veri yok'}
        
        Kategori Satışları:
        ${c.length > 0 ? c.map((cat: any) => `- ${cat.name}: ${cat.value} sipariş`).join('\n        ') : 'Veri yok'}
        
        Kategori Karlılığı:
        ${cp.length > 0 ? cp.map((cat: any) => `- ${cat.category}: %${cat.margin} marj, ${formatCurrency(cat.profit)} kar`).join('\n        ') : 'Veri yok'}
        
        Birlikte Satılan Ürünler (Sepet Analizi):
        ${ba.length > 0 ? ba.map((item: any) => `- ${item.productA} ve ${item.productB}: ${item.frequency} kez birlikte satıldı`).join('\n        ') : 'Veri yok'}
        
        Ödeme Yöntemleri:
        ${pm.length > 0 ? pm.map((item: any) => `- ${item.method}: ${item.count} işlem, ${formatCurrency(item.total)}`).join('\n        ') : 'Veri yok'}
        
        👥 OPERASYON VE PERSONEL:
        Personel Performansı:
        ${sp.length > 0 ? sp.map((staff: any) => `- ${staff.name}: ${staff.orders} sipariş, ${formatCurrency(staff.revenue)} ciro`).join('\n        ') : 'Veri yok'}
        
        Detaylı Personel Analizi:
        ${sa.length > 0 ? sa.map((staff: any) => `- ${staff.name}: Upsell Skoru: ${staff.upsellScore}, Hız Skoru: ${staff.speedScore}, İptal Oranı: %${staff.cancelRate}, Ciro Skoru: ${staff.revenueScore}`).join('\n        ') : 'Veri yok'}
        
        - Kritik Stoktaki Ürünler: ${cs.length > 0 ? cs.map((stock: any) => stock.name).join(', ') : 'Yok'}
        - En Çok Fire Verilen Ürünler: ${tw.length > 0 ? tw.map((item: any) => `${item.name} (${item.quantity} adet, ${formatCurrency(item.loss)} kayıp)`).join(', ') : 'Yok'}
        - Bekleyen Rezervasyonlar: ${r.filter((res: any) => res.status === 'Bekliyor' || res.status === 'Onaylandı').length}
        - İptal Analizi: Toplam ${ca?.count || 0} iptal, ${formatCurrency(ca?.loss || 0)} kayıp. En sık neden: ${ca?.reason || 'Bilinmiyor'}
        - Masa Devir Hızı: Ortalama ${tt?.avgDuration || 0} dk, Devir Oranı %${tt ? Math.round(tt.turnoverRate * 100) : 0}
      `;

      const systemInstruction = `
        Sen "PosNetX AI", üst düzey bir restoran, kafe ve bar (HORECA) işletme danışmanısın. 
        Kullanıcı (işletme sahibi) seninle sohbet ediyor. 
        
        GÖREVİN:
        1. Kullanıcının yazdığı mesaja DOĞRUDAN ve SOHBET havasında, kısa ve net cevap ver. 
        2. SADECE kullanıcı senden "rapor", "analiz", "özet" gibi genel bir değerlendirme isterse detaylı bir rapor sun.
        3. Kullanıcı spesifik bir soru sorarsa (örneğin "Amerikano satışlarım nasıl?", "En çok satan ürün ne?", "Ciro ne kadar?"), sana verilen "VERİ BAĞLAMI" içindeki tüm ürün, kategori ve personel listesini inceleyerek sadece o soruya odaklanarak cevap ver.
        4. Sana gönderilen veriler, kullanıcının sorduğu tarih aralığına aittir. "Geçmişe erişemiyorum" DEME, elindeki veriyi kullan.
        5. Sorulara cevap verirken veya analiz yaparken, güncel tarih aralığına ait verileri kullanarak DERİNLEMESİNE ANALİZLER yap. Operasyonel verimlilik (personel performansı, iptaller, aktif masalar vb.) ile finansal durum (ciro, karlılık) arasındaki bağlantıları kurarak stratejik öngörülerde ve tavsiyelerde bulun.
        
        KURALLAR:
        - Her mesaja koca bir raporla cevap VERME. Karşılıklı sohbet et.
        - Kullanıcı rapor isterse şu başlıkları kullan: 📊 Finansal Durum Özeti, 📈 Satış ve Pazarlama Fırsatları, ⚙️ Operasyonel Verimlilik, 💡 Günün Aksiyon Planı ve Öngörüler.
        - Önemli yerleri **kalın**, sektörel terimleri *eğik* yaz.
        - Ton: Profesyonel, samimi, vizyoner ve doğrudan sonuca odaklı.
        - Dil: Türkçe.
      `;

      const fullMessage = `
        Kullanıcının Mesajı: "${userMsg}"
        
        Bu mesaja cevap vermek için kullanman gereken GÜNCEL VERİ BAĞLAMI:
        ${dataContext}
        
        Lütfen sadece kullanıcının mesajına cevap ver. Veri bağlamını gördüğünü belli etme, sanki kendi hafızandan biliyormuş gibi doğal bir şekilde yanıtla.
      `;

      const response = await safeFetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fullMessage,
          systemInstruction
        })
      });

      if (response.error) throw new Error(response.error);

      setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response.text || 'Yanıt alınamadı.' }]);
    } catch (error: any) {
      console.error(error);
      setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: error.message || 'Yapay zeka şu an meşgul veya bir hata oluştu. Lütfen tekrar deneyin.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const formatCurrency = (val: number | null | undefined) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0);

  const navItems = [
    { id: 'home', label: 'Ana Sayfa', icon: Home },
    { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'executive', label: 'Patron Ekranı', icon: Crown },
    { id: 'branch', label: 'Şube Yönetimi', icon: Store },
    { id: 'finance', label: 'Finans & Kasa', icon: Wallet },
    { id: 'sales', label: 'Satış Analizi', icon: BarChart3 },
    { id: 'staff', label: 'Personel', icon: Users },
    { id: 'stock', label: 'Stok & Zayi', icon: Package },
    { id: 'operations', label: 'Operasyon', icon: Settings },
    { id: 'menu_engineering', label: 'Menü Mühendisliği', icon: ChefHat },
    { id: 'advanced_ai', label: 'Gelişmiş AI Analiz', icon: Zap },
    { id: 'ai', label: 'AI Danışman', icon: Sparkles },
  ];

  // Dynamic Greeting
  const hour = new Date().getHours();
  const greeting = (hour >= 5 && hour <= 10)
    ? 'Günaydın'
    : (hour >= 11 && hour <= 17)
      ? 'İyi Günler'
      : (hour >= 18 && hour <= 21)
        ? 'İyi Akşamlar'
        : 'İyi Geceler';
  const dateStr = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500/30 relative overflow-hidden">
      {/* Mesh Background */}
      <div className="mesh-bg" />

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-2 top-2 bottom-2 w-56 glass-dark rounded-xl z-50 flex flex-col p-3 shadow-2xl lg:translate-x-0 lg:static lg:h-[calc(100vh-16px)] lg:m-2"
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <div>
                  <h2 className="text-2xl font-display font-black tracking-tight">PosNetX</h2>
                  <p className="text-amber-500 text-[10px] font-bold tracking-[0.2em] uppercase">Boss Edition</p>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-white/10 rounded-lg lg:hidden">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-0.5 no-scrollbar">
                {navItems.filter(item => {
                  if ((item.id === 'ai' || item.id === 'advanced_ai') && !isAiEnabled) return false;
                  return true;
                }).map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if ((item.id === 'ai' || item.id === 'advanced_ai') && !isAiEnabled) {
                          setShowNoLicenseModal(true);
                        } else {
                          setActiveView(item.id as ViewType);
                        }
                        setIsSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-2.5 py-4 rounded-lg transition-all text-[14px] font-medium group",
                        isActive
                          ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                          : "text-white/50 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon className={cn("w-5.5 h-5.5 transition-transform group-hover:scale-110", isActive ? "text-black" : "text-amber-500/70")} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-30 glass-dark border-b border-white/5 px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5">
            {activeView === 'home' ? (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90 lg:hidden">
                <Menu className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90 lg:hidden">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-base font-display font-black tracking-tight text-white leading-none">
                {activeView === 'home' ? 'PosNetX BOSS' : (navItems.find(i => i.id === activeView)?.label || 'Genel Bakış')}
              </h1>
              <p className="text-[8px] sm:text-[9px] text-amber-500 font-bold tracking-[0.15em] uppercase mt-0.5">
                {activeView === 'home' ? dateStr : 'Yönetici Paneli'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Compact Date Filter Trigger */}
            {activeView !== 'home' && activeView !== 'ai' && (
              <button
                onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-white/90 active:scale-[0.98] transition-all hover:bg-white/10"
              >
                <Filter className="w-3 h-3 text-amber-500" />
                <span className="hidden xs:inline uppercase tracking-widest">
                  {dateRange.start === dateRange.end
                    ? (dateRange.start === today ? 'Bugün' : dateRange.start)
                    : `${dateRange.start.split('-').slice(1).join('/')}-${dateRange.end.split('-').slice(1).join('/')}`}
                </span>
                <span className="xs:hidden">Tarih</span>
              </button>
            )}

            <button
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className="p-2.5 hover:bg-white/10 rounded-2xl transition-all relative active:scale-90"
            >
              <Bell className="w-5 h-5 text-white/60" />
              {alerts.some(a => !a.isRead) && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#050505]" />
              )}
            </button>

            <button onClick={() => loadDataForView(activeView)} className="p-2.5 hover:bg-white/10 rounded-2xl transition-all active:scale-90">
              <RotateCw className={cn("w-5 h-5 text-white/60", loading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Date Filter Dropdown (Absolute positioned or below) */}
        {activeView !== 'home' && activeView !== 'ai' && (
          <AnimatePresence>
            {isDateFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 pb-1 space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => { setQuickDate('today'); setIsDateFilterOpen(false); }} className="py-1.5 rounded-xl bg-[#111] border border-white/10 text-xs font-medium text-white/80 hover:bg-white/10 active:scale-95">Bugün</button>
                    <button onClick={() => { setQuickDate('yesterday'); setIsDateFilterOpen(false); }} className="py-1.5 rounded-xl bg-[#111] border border-white/10 text-xs font-medium text-white/80 hover:bg-white/10 active:scale-95">Dün</button>
                    <button onClick={() => { setQuickDate('week'); setIsDateFilterOpen(false); }} className="py-1.5 rounded-xl bg-[#111] border border-white/10 text-xs font-medium text-white/80 hover:bg-white/10 active:scale-95">7 Gün</button>
                    <button onClick={() => { setQuickDate('month'); setIsDateFilterOpen(false); }} className="py-1.5 rounded-xl bg-[#111] border border-white/10 text-xs font-medium text-white/80 hover:bg-white/10 active:scale-95">30 Gün</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 bg-[#111] border border-white/10 rounded-xl p-2 flex items-center gap-2">
                      <span className="text-[10px] text-white/40 uppercase font-bold">Baş:</span>
                      <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))} className="bg-transparent text-xs font-medium text-white outline-none w-full [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]" />
                    </div>
                    <div className="relative flex-1 bg-[#111] border border-white/10 rounded-xl p-2 flex items-center gap-2">
                      <span className="text-[10px] text-white/40 uppercase font-bold">Bit:</span>
                      <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))} className="bg-transparent text-xs font-medium text-white outline-none w-full [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Alerts Dropdown */}
        <AnimatePresence>
          {isAlertsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-4 top-16 w-80 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-bold text-sm">Akıllı Bildirimler</h3>
                <button onClick={() => setAlerts(p => p.map(a => ({ ...a, isRead: true })))} className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Tümünü Oku</button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {alerts.length > 0 ? alerts.map(alert => (
                  <div key={alert.id} className={cn("p-4 border-b border-white/5 last:border-0 transition-colors", !alert.isRead && "bg-white/[0.02]")}>
                    <div className="flex gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        alert.type === 'critical' ? "bg-red-500/20 text-red-500" :
                          alert.type === 'warning' ? "bg-amber-500/20 text-amber-500" : "bg-blue-500/20 text-blue-500"
                      )}>
                        {alert.type === 'critical' ? <AlertTriangle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold">{alert.title}</p>
                        <p className="text-[11px] text-white/60 leading-relaxed">{alert.message}</p>
                        <p className="text-[9px] text-white/30">{new Date(alert.timestamp).toLocaleTimeString('tr-TR')}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-white/40 text-xs">Yeni bildirim yok.</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="pb-12 px-3 pt-4 max-w-2xl mx-auto relative z-10">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold mb-1">Hata</p>
              <p className="opacity-80">{error}</p>
            </div>
          </div>
        )}

        {loading && !error ? (
          <div className="flex justify-center py-20">
            <RefreshCcw className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">

            {/* HOME (Göz Boyayan Ana Sayfa) */}
            {activeView === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                {/* Hero Section - Ultra Compact Mobile Optimized */}
                <div className="relative overflow-hidden rounded-2xl xs:rounded-[28px] glass p-3 xs:p-4 shadow-2xl border-white/10">
                  {/* Decorative Background Elements */}
                  <div className="absolute -right-10 -top-10 w-48 h-48 bg-amber-500/20 rounded-full blur-[60px] animate-pulse" />
                  <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px]" />

                  <div className="relative flex flex-col gap-3">
                    {/* Top Row: Greeting & Profile */}
                    <div className="flex items-center justify-between">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex-1"
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Sistem Aktif</span>
                        </div>
                        <h2 className="text-lg xs:text-xl font-display font-black text-white tracking-tight leading-tight">
                          {greeting}, <br />
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Patron.</span>
                        </h2>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-9 h-9 xs:w-10 xs:h-10 rounded-xl glass border-white/20 flex items-center justify-center relative group overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <User className="w-4 h-4 xs:w-5 xs:h-5 text-white/80" />
                      </motion.div>
                    </div>

                    {/* Middle Row: Date & Quick Info */}
                    <div className="flex items-center justify-between py-1.5 border-y border-white/5">
                      <p className="text-white/40 text-[8px] xs:text-[9px] font-medium tracking-wide uppercase">{dateStr}</p>
                      <div className="flex items-center gap-1">
                        <div className="flex -space-x-1">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="w-3.5 h-3.5 rounded-full border border-black bg-white/10 flex items-center justify-center text-[6px] text-white/60">
                              {i}
                            </div>
                          ))}
                        </div>
                        <span className="text-[8px] text-white/30 font-medium">Aktif Personel</span>
                      </div>
                    </div>

                    {/* Bottom Row: Key Stats */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-2.5">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-dark rounded-xl p-2.5 border-white/5 flex flex-col justify-between h-16"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Bugünkü Ciro</p>
                          <TrendingUp className="w-2 h-2 text-amber-500/50" />
                        </div>
                        <p className="text-base xs:text-lg font-display font-bold text-amber-500 truncate">{formatCurrency(stats?.todaySales)}</p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-dark rounded-xl p-2.5 border-white/5 flex flex-col justify-between h-16"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Aktif Masa</p>
                          <Users className="w-2 h-2 text-blue-500/50" />
                        </div>
                        <div className="flex items-baseline gap-1">
                          <p className="text-base xs:text-lg font-display font-bold text-blue-400">{stats?.activeTables || 0}</p>
                          <span className="text-[12px] text-blue-400/40 font-medium">Masa</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* AI Teasers - Compact Layout */}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    whileHover={{ y: -2 }}
                    onClick={() => {
                      if (!isAiEnabled) {
                        setShowNoLicenseModal(true);
                      } else {
                        setActiveView('ai');
                      }
                    }}
                    className="relative p-[1px] rounded-2xl overflow-hidden group cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/40 via-purple-500/40 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative glass-dark rounded-[15px] p-3 h-full flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-display font-bold text-white text-xs truncate">AI Danışman</h4>
                          <p className="text-[9px] text-white/40 leading-tight truncate">Anlık analiz</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-500/40 group-hover:text-amber-500 transition-colors shrink-0" />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    whileHover={{ y: -2 }}
                    onClick={() => {
                      if (!isAiEnabled) {
                        setShowNoLicenseModal(true);
                      } else {
                        setActiveView('advanced_ai');
                      }
                    }}
                    className="relative p-[1px] rounded-2xl overflow-hidden group cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 via-purple-500/40 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative glass-dark rounded-[15px] p-3 h-full flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-display font-bold text-white text-xs truncate">Gelişmiş Analiz</h4>
                          <p className="text-[9px] text-white/40 leading-tight truncate">Stratejik öngörü</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-indigo-400/40 group-hover:text-indigo-400 transition-colors shrink-0" />
                    </div>
                  </motion.div>
                </div>

                {/* Quick Access Bento Grid */}
                <div>
                  <div className="flex items-center gap-2 px-2 mb-4">
                    <div className="w-1 h-3 bg-amber-500 rounded-full" />
                    <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Hızlı Erişim Kokpiti</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <QuickAccessCard
                      icon={PieChartIcon} title="Satış Analizi" desc="Kategori & Saatlik"
                      onClick={() => setActiveView('sales')} color="blue" delay={0.1}
                    />
                    <QuickAccessCard
                      icon={Wallet} title="Finans" desc="Kasa & Banka"
                      onClick={() => setActiveView('finance')} color="emerald" delay={0.2}
                    />
                    <QuickAccessCard
                      icon={Users} title="Personel" desc="Garson Performansı"
                      onClick={() => setActiveView('staff')} color="purple" delay={0.3}
                    />
                    <QuickAccessCard
                      icon={Package} title="Stok" desc="Kritik Uyarılar"
                      onClick={() => setActiveView('stock')} color="red" delay={0.4}
                    />
                  </div>
                </div>

                {/* Canlı Operasyon Takibi */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-3 bg-amber-500 rounded-full" />
                      <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Canlı Operasyon Takibi</h3>
                    </div>
                    {activeTables.length > 0 && (
                      <span className="text-[8px] font-bold text-amber-500/60 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        {activeTables.length} Masa Aktif
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {activeTables.length > 0 ? (
                      [...activeTables].sort((a, b) => b.currentTotal - a.currentTotal).slice(0, 3).map((table, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ x: 4 }}
                          onClick={() => setActiveView('sales')}
                          className="glass-dark rounded-xl p-3 border-white/5 flex items-center justify-between group cursor-pointer transition-all hover:bg-white/[0.04]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-500 font-display font-black group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-all">
                              {table.name.replace(/[^0-9]/g, '') || table.name.substring(0, 2)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white/90 group-hover:text-amber-500 transition-colors">{table.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <User className="w-2.5 h-2.5 text-white/30" />
                                <p className="text-[9px] text-white/40 font-medium">{table.waiterName}</p>
                                <span className="text-white/20 text-[8px]">/</span>
                                <Clock className="w-2.5 h-2.5 text-white/30" />
                                <p className="text-[9px] text-white/40 font-medium">
                                  {Math.max(5, Math.round((new Date().getTime() - new Date(table.orderStartTime).getTime()) / (1000 * 60)))} dk
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-display font-bold text-amber-500">{formatCurrency(table.currentTotal)}</p>
                            <div className="flex items-center justify-end gap-1 mt-0.5">
                              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                              <p className="text-[8px] text-emerald-400/60 font-bold uppercase tracking-widest">Açık</p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-6 text-center glass-dark rounded-xl border border-dashed border-white/10">
                        <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Şu an aktif masa bulunmuyor</p>
                      </div>
                    )}
                  </div>

                  {/* Smart Insight */}
                  {/* {activeTables.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 }}
                      className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-2.5 flex items-start gap-3"
                    >
                      <div className="bg-amber-500/20 p-1.5 rounded-lg shrink-0">
                        <BrainCircuit className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest leading-none">AI Öngörüsü</p>
                        <p className="text-[10px] text-white/60 leading-tight">
                          Şu an sistemde <span className="text-white font-bold">{activeTables.length}</span> aktif masa var.
                          <span className="text-amber-500 font-bold">{[...activeTables].sort((a, b) => b.currentTotal - a.currentTotal)[0].name}</span> en yüksek hacme sahip.
                          Operasyonel yoğunluk yönetilebilir seviyede.
                        </p>
                      </div>
                    </motion.div>
                  )} */}
                </motion.div>



              </motion.div>
            )}

            {/* OVERVIEW */}
            {activeView === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  <StatCard label="GÜNLÜK SATIŞ" value={formatCurrency(stats?.todaySales)} icon={<DollarSign />} color="amber" />
                  <StatCard label="AKTİF MASALAR" value={stats?.activeTables.toString() || "0"} icon={<Utensils />} color="blue" />
                </div>
                <Section title="Satış Trendi (7 Gün)" icon={<TrendingUp className="text-emerald-500" />}>
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" tick={{ fill: '#ffffff40', fontSize: 9 }} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                        <Area type="monotone" dataKey="total" name="Ciro" stroke="#6366f1" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2}>
                          <LabelList dataKey="total" position="top" offset={10} fill="#6366f1" fontSize={9} formatter={(val: number) => val > 0 ? `₺${(val / 1000).toFixed(1)}k` : ''} />
                        </Area>
                        <Area type="monotone" dataKey="profit" name="Net Kar" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
                <Section title="En Çok Satanlar">
                  <div className="space-y-2">
                    {topProducts.map((p, i) => (
                      <div key={i} className="bg-white/[0.03] rounded-xl p-3 flex items-center justify-between border border-white/5 hover:bg-white/[0.05] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-display font-bold text-xs border border-amber-500/20">{i + 1}</div>
                          <div>
                            <p className="font-display font-bold text-xs text-white/90">{p.name}</p>
                            <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{p.totalQty} Adet</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display font-bold text-amber-500 text-xs">{formatCurrency(p.totalRevenue)}</p>
                          <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Kar: {formatCurrency(p.profit)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              </motion.div>
            )}

            {/* FINANCE */}
            {activeView === 'finance' && (
              <motion.div key="finance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="glass rounded-2xl p-4 border-white/10 relative overflow-hidden group">
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity" />
                  <p className="micro-label mb-1">Toplam Kasa & Banka</p>
                  <p className="text-2xl font-display font-bold text-white mb-4 tracking-tight">{formatCurrency(finance?.totalBalance)}</p>

                  <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="micro-label mb-1">Günlük Net Kar</p>
                      <p className="text-base font-display font-bold text-emerald-400">{formatCurrency(finance?.dailyProfit)}</p>
                    </div>
                    <div className="text-right">
                      <p className="micro-label mb-1">Kar Marjı</p>
                      <p className="text-base font-display font-bold text-emerald-400">
                        {finance?.dailyIncome ? ((finance.dailyProfit / finance.dailyIncome) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  <StatCard label="GÜNLÜK GELİR" value={formatCurrency(finance?.dailyIncome)} icon={<TrendingUp />} color="amber" />
                  <StatCard label="GÜNLÜK GİDER" value={formatCurrency(finance?.dailyExpense)} icon={<TrendingUp className="rotate-180" />} color="blue" />
                </div>

                <Section title="Ödeme Yöntemleri" icon={<Wallet className="text-blue-500" />}>
                  <div className="space-y-2">
                    {paymentMethods.map((pm, i) => (
                      <div key={i} className="bg-white/[0.03] rounded-xl p-3 flex items-center justify-between border border-white/5 hover:bg-white/[0.05] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-white/90">{pm.method}</p>
                            <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{pm.count} İşlem</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display font-bold text-emerald-400 text-xs">{formatCurrency(pm.total)}</p>
                          <p className="text-[9px] text-white/30 font-bold">
                            %{finance?.dailyIncome ? ((pm.total / finance.dailyIncome) * 100).toFixed(1) : 0}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Kar/Zarar (P&L) Trendi" icon={<TrendingUp className="text-emerald-500" />}>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={pnlTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" tick={{ fill: '#ffffff40', fontSize: 9 }} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                        <Bar dataKey="revenue" name="Ciro" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expenses" name="Giderler" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="netProfit" name="Net Kar" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}>
                          <LabelList dataKey="netProfit" position="top" offset={10} fill="#10b981" fontSize={8} formatter={(val: number) => `₺${(val / 1000).toFixed(1)}k`} />
                        </Line>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
              </motion.div>
            )}

            {/* SALES */}
            {activeView === 'sales' && (
              <motion.div key="sales" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="glass rounded-2xl p-3 border-white/10 relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
                  <p className="micro-label mb-1">Ortalama Sepet Tutarı (AOV)</p>
                  <p className="text-lg font-display font-bold text-blue-400 tracking-tight">{formatCurrency(trend[trend.length - 1]?.aov || 0)}</p>
                </div>
                <Section title="Saatlik Yoğunluk" icon={<Clock />}>
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hourlySales} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="hour" tick={{ fill: '#ffffff40', fontSize: 9 }} tickFormatter={(val) => `${val}:00`} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                        <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                          <LabelList dataKey="total" position="top" offset={8} fill="#3b82f6" fontSize={8} formatter={(val: number) => val > 0 ? `₺${(val / 1000).toFixed(1)}k` : ''} />
                          {hourlySales.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.total > (trend[trend.length - 1]?.total / 24) ? '#6366f1' : '#3b82f680'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
                <Section title="Kategori Dağılımı" icon={<PieChartIcon />}>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categorySales}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {categorySales.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          <LabelList dataKey="name" position="outside" offset={10} fill="#ffffff60" fontSize={8} />
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {categorySales.map((cat, i) => (
                      <div key={i} className="flex items-center gap-1 text-[9px]">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-white/70">{cat.name}</span>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Kategori Karlılığı" icon={<TrendingUp className="text-emerald-500" />}>
                  <div className="space-y-2.5">
                    {categoryProfit.map((cp, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-white/80">{cp.category}</span>
                          <span className="text-emerald-400 font-medium">%{(cp.margin || 0).toFixed(1)} Marj</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1">
                          <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${Math.min(cp.margin || 0, 100)}%` }} />
                        </div>
                        <div className="flex justify-between text-[8px] text-white/40 mt-1">
                          <span>Ciro: {formatCurrency(cp.revenue)}</span>
                          <span>Kar: {formatCurrency(cp.profit)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Birlikte Satılan Ürünler (Sepet Analizi)" icon={<Package className="text-blue-500" />}>
                  <div className="space-y-2">
                    {basketAnalysis.map((item, i) => (
                      <div key={i} className="bg-white/[0.03] rounded-xl p-3 border border-white/5 hover:bg-white/[0.05] transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display font-bold text-white/90 text-xs">{item.productA}</span>
                          <span className="text-white/20 text-[10px]">+</span>
                          <span className="font-display font-bold text-white/90 text-xs">{item.productB}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-emerald-400 font-bold text-[9px] uppercase tracking-widest">Birlikte Satış: {item.frequency} kez</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Saatlik & Günlük Yoğunluk (Heatmap)" icon={<Clock className="text-amber-500" />}>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 15, right: 15, bottom: 15, left: 15 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" dataKey="hour" name="Saat" tick={{ fill: '#666', fontSize: 9 }} domain={[0, 23]} tickCount={12} />
                        <YAxis type="category" dataKey="day" name="Gün" tick={{ fill: '#666', fontSize: 9 }} />
                        <ZAxis type="number" dataKey="intensity" range={[15, 300]} name="Yoğunluk" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }} />
                        <Scatter name="Yoğunluk" data={heatmapData} fill="#f59e0b" opacity={0.8} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
              </motion.div>
            )}

            {/* STAFF */}
            {activeView === 'staff' && (
              <motion.div key="staff" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <Section title="Garson Performansı" icon={<Users />}>
                  <div className="space-y-2">
                    {staffPerf.length === 0 ? <p className="text-white/40 text-sm text-center py-4 font-display">Veri bulunamadı.</p> : staffPerf.map((staff, i) => (
                      <div key={i} className="bg-white/[0.03] rounded-xl p-3 flex flex-col gap-2 border border-white/5 hover:bg-white/[0.06] transition-all group">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-display font-bold text-xs text-white/90 group-hover:text-amber-500 transition-colors">{staff.name}</p>
                            <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{staff.orders} Sipariş</p>
                          </div>
                          <p className="font-display font-bold text-emerald-400 text-xs">{formatCurrency(staff.revenue)}</p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px]">
                          <div>
                            <span className="text-white/30 uppercase tracking-widest font-bold">Sepet Ortalaması: </span>
                            <span className="text-white/80 font-bold">{formatCurrency(staff.avgOrderValue)}</span>
                          </div>
                          {staff.cancelCount > 0 && (
                            <div className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded-lg font-bold uppercase tracking-widest border border-red-500/20">
                              {staff.cancelCount} İptal
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Detaylı Personel Analizi" icon={<Target className="text-purple-500" />}>
                  <div className="space-y-3">
                    {staffAdvanced.length === 0 ? <p className="text-white/40 text-sm text-center py-4 font-display">Veri bulunamadı.</p> : staffAdvanced.map((staff, i) => (
                      <div key={i} className="bg-white/[0.03] rounded-xl p-3 border border-white/5 hover:bg-white/[0.06] transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-display font-bold text-white/90 text-xs">{staff.name}</p>
                          <div className="flex gap-1.5">
                            <span className="text-[8px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-500/20">Ciro: {staff.revenueScore}/100</span>
                            <span className="text-[8px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-widest border border-blue-500/20">Hız: {staff.speedScore}/100</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-[9px] mb-1 uppercase tracking-widest font-bold">
                              <span className="text-white/30">Upsell Başarısı</span>
                              <span className="text-amber-500">{staff.upsellScore}/100</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                              <div className="bg-amber-500 h-full rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" style={{ width: `${staff.upsellScore}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[9px] mb-1 uppercase tracking-widest font-bold">
                              <span className="text-white/30">İptal Oranı</span>
                              <span className="text-red-400">%{staff.cancelRate}</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                              <div className="bg-red-500 h-full rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" style={{ width: `${Math.min(staff.cancelRate * 10, 100)}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              </motion.div>
            )}

            {/* STOCK */}
            {activeView === 'stock' && (
              <motion.div key="stock" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  <StatCard label="TOPLAM STOK MALİYETİ" value={formatCurrency(stockAdvanced?.totalInventoryValue)} icon={<Package />} color="blue" />
                  <StatCard label="GÜNLÜK FİRE (ZAYİ)" value={formatCurrency(stockAdvanced?.todayWastageCost)} icon={<TrendingDown />} color="amber" />
                </div>

                <Section title="Kritik Stok Uyarıları" icon={<AlertTriangle className="text-red-500" />}>
                  <div className="space-y-2">
                    {criticalStock.length === 0 ? <p className="text-white/40 text-sm text-center py-4">Kritik stok bulunmuyor.</p> : criticalStock.map((stock, i) => (
                      <div key={i} className="bg-red-500/10 rounded-xl p-3 flex items-center justify-between border border-red-500/20 hover:bg-red-500/15 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <Package className="w-4 h-4 text-red-400" />
                          </div>
                          <div>
                            <p className="font-display font-bold text-xs text-red-100">{stock.name}</p>
                            <p className="text-[9px] text-red-400/70 uppercase tracking-widest font-bold">Min: {stock.minStockLevel}</p>
                          </div>
                        </div>
                        <p className="font-display font-bold text-red-400 text-lg">{stock.quantity}</p>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Kategori Bazlı Food Cost" icon={<TrendingUp className="text-amber-500" />}>
                  <div className="space-y-3">
                    {foodCost.map((fc, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-white/80">{fc.category}</span>
                          <span className="text-amber-400 font-medium">%{(fc.ratio || 0).toFixed(1)} Cost</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1">
                          <div className="bg-amber-500 h-1 rounded-full" style={{ width: `${Math.min(fc.ratio || 0, 100)}%` }} />
                        </div>
                        <div className="flex justify-between text-[9px] text-white/40 mt-1">
                          <span>Maliyet: {formatCurrency(fc.cost)}</span>
                          <span>Ciro: {formatCurrency(fc.revenue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="En Çok Fire Verilen Ürünler" icon={<AlertTriangle className="text-red-500" />}>
                  <div className="space-y-2">
                    {topWastage.length === 0 ? <p className="text-white/40 text-sm text-center py-4">Fire kaydı bulunmuyor.</p> : topWastage.map((tw, i) => (
                      <div key={i} className="bg-red-500/10 rounded-xl p-3 flex items-center justify-between border border-red-500/20 hover:bg-red-500/15 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <Package className="w-4 h-4 text-red-400" />
                          </div>
                          <div>
                            <p className="font-display font-bold text-xs text-red-100">{tw.name}</p>
                            <p className="text-[9px] text-red-400/70 uppercase tracking-widest font-bold">{tw.quantity} Adet Fire</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display font-bold text-red-400 text-xs">Kayıp: {formatCurrency(tw.loss)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              </motion.div>
            )}

            {/* OPERATIONS */}
            {activeView === 'operations' && (
              <motion.div key="operations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  <StatCard label="GÜNLÜK İPTAL SAYISI" value={(opsMetrics?.cancelCount || 0).toString()} icon={<AlertCircle />} color="blue" />
                  <StatCard label="İPTAL KAYBI" value={formatCurrency(opsMetrics?.cancelLoss)} icon={<TrendingDown />} color="amber" />
                </div>

                <Section title="Açık Hesap (Cari) Müşteriler" icon={<Wallet />}>
                  <div className="space-y-2">
                    {debtors.length === 0 ? <p className="text-white/40 text-sm text-center py-4">Açık hesap bulunmuyor.</p> : debtors.map((d, i) => (
                      <div key={i} className="bg-white/[0.03] rounded-xl p-3 flex items-center justify-between border border-white/5 hover:bg-white/[0.05] transition-colors">
                        <div>
                          <p className="font-display font-bold text-xs text-white/90">{d.name}</p>
                          <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{d.phone || 'Telefon Yok'}</p>
                        </div>
                        <p className="font-display font-bold text-red-400 text-xs">{formatCurrency(d.currentBalance)}</p>
                      </div>
                    ))}
                  </div>
                </Section>
                <Section title="Yaklaşan Rezervasyonlar" icon={<Calendar />}>
                  <div className="space-y-2">
                    {reservations.length === 0 ? <p className="text-white/40 text-sm text-center py-4">Rezervasyon bulunmuyor.</p> : reservations.map((r, i) => (
                      <div key={i} className="bg-white/[0.03] rounded-xl p-3 flex items-center justify-between border border-white/5 hover:bg-white/[0.05] transition-colors">
                        <div>
                          <p className="font-display font-bold text-xs text-white/90">{r.customerName}</p>
                          <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{new Date(r.reservationTime).toLocaleString('tr-TR')} • {r.guestCount} Kişi</p>
                        </div>
                        <span className="text-[8px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-widest">{r.status}</span>
                      </div>
                    ))}
                  </div>
                </Section>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  <StatCard label="MASA DEVİR HIZI" value={`${tableTurnover ? Math.round(tableTurnover.avgDuration) : 0} dk`} icon={<Clock />} color="blue" />
                  <StatCard label="DEVİR ORANI" value={`%${tableTurnover ? Math.round(tableTurnover.turnoverRate * 100) : 0}`} icon={<RotateCw />} color="amber" />
                </div>

                <Section title="İptal ve İade Analizi" icon={<AlertTriangle className="text-red-500" />}>
                  <div className="space-y-3">
                    <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20 flex justify-between items-center">
                      <div>
                        <p className="micro-label mb-1 text-red-400/70">Toplam İptal Tutarı</p>
                        <p className="text-lg font-display font-bold text-red-400 tracking-tight">{formatCurrency(cancelAnalysis ? cancelAnalysis.loss : 0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="micro-label mb-1 text-red-400/70">İptal Sayısı</p>
                        <p className="text-lg font-display font-bold text-red-400 tracking-tight">{cancelAnalysis ? cancelAnalysis.count : 0}</p>
                      </div>
                    </div>

                    <div>
                      <p className="micro-label mb-2">En Sık İptal Nedeni</p>
                      <div className="space-y-2">
                        {cancelAnalysis && (
                          <div className="flex justify-between items-center bg-white/[0.03] p-3 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-white/80">{cancelAnalysis.reason}</span>
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">{cancelAnalysis.count} İşlem</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Section>
              </motion.div>
            )}

            {/* BRANCH MANAGEMENT */}
            {activeView === 'branch' && (
              <motion.div key="branch" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-lg font-display font-bold text-white flex items-center gap-2.5 tracking-tight">
                    <Home className="text-amber-500 w-5 h-5" /> Şube Yönetimi
                  </h2>
                  <button className="bg-amber-500 text-black px-3 py-1.5 rounded-xl font-bold text-[9px] hover:bg-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/20 uppercase tracking-widest">
                    Yeni Şube Ekle
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {branches.length === 0 ? (
                    <div className="col-span-full text-center py-10 glass rounded-2xl border-white/10">
                      <p className="text-white/30 uppercase tracking-widest font-bold text-[9px]">Şube verisi yükleniyor...</p>
                    </div>
                  ) : branches.map((branch) => (
                    <div key={branch.id} className="glass rounded-2xl p-4 border-white/10 hover:border-amber-500/30 transition-all group relative overflow-hidden">
                      <div className="absolute -right-12 -top-12 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />

                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                          <h3 className="text-sm font-display font-bold text-white group-hover:text-amber-500 transition-colors tracking-tight">{branch.name}</h3>
                          <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-0.5">{branch.location}</p>
                        </div>
                        <span className={cn(
                          "text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                          branch.status === 'open' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                        )}>
                          {branch.status === 'open' ? 'Açık' : 'Yoğun'}
                        </span>
                      </div>

                      <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="micro-label mb-1">Günlük Ciro</p>
                            <p className="text-lg font-display font-bold text-white tracking-tight">{formatCurrency(branch.todaySales)}</p>
                          </div>
                          <div className="text-right">
                            <p className="micro-label mb-1">Personel</p>
                            <p className="text-xs font-bold text-white/80">{branch.staffCount} Kişi</p>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[9px] mb-1.5 uppercase tracking-widest font-bold">
                            <span className="text-white/30">Aylık Hedef</span>
                            <span className="text-amber-500">%{Math.round((branch.currentMonthlySales / branch.monthlyTarget) * 100)}</span>
                          </div>
                          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${(branch.currentMonthlySales / branch.monthlyTarget) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] font-bold text-white">{branch.rating}</span>
                          </div>
                          <button className="text-[9px] text-amber-500 font-bold uppercase tracking-widest hover:underline">Detaylı Rapor</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ADVANCED AI ANALYSIS */}
            {activeView === 'advanced_ai' && isAiEnabled && (
              <motion.div key="advanced_ai" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-4">
                <div className="glass rounded-2xl p-5 border-indigo-500/30 relative overflow-hidden group">
                  <div className="absolute -right-24 -top-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] opacity-50 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute -left-24 -bottom-24 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] opacity-30" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-display font-bold text-white tracking-tight">AI Analiz Merkezi</h2>
                        <p className="text-indigo-300/40 text-[8px] uppercase tracking-[0.2em] font-bold">İşletmenizin geleceğini tahmin edin</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-white/[0.03] backdrop-blur-md rounded-xl p-3.5 border border-white/5 hover:bg-white/[0.06] transition-all">
                        <p className="micro-label mb-1 text-indigo-300/60">Haftalık Tahmin</p>
                        <p className="text-lg font-display font-black text-white tracking-tight">{formatCurrency(stats?.totalSalesAllTime ? stats.totalSalesAllTime * 0.15 : 250000)}</p>
                        <p className="text-[8px] font-bold text-emerald-400 mt-1 flex items-center gap-1 uppercase tracking-widest">
                          <TrendingUp className="w-2 h-2" /> %12 Artış
                        </p>
                      </div>
                      <div className="bg-white/[0.03] backdrop-blur-md rounded-xl p-3.5 border border-white/5 hover:bg-white/[0.06] transition-all">
                        <p className="micro-label mb-1 text-indigo-300/60">Sadakat Skoru</p>
                        <p className="text-lg font-display font-black text-white tracking-tight">84 / 100</p>
                        <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-indigo-500 w-[84%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        </div>
                      </div>
                      <div className="bg-white/[0.03] backdrop-blur-md rounded-xl p-3.5 border border-white/5 hover:bg-white/[0.06] transition-all">
                        <p className="micro-label mb-1 text-indigo-300/60">Verimlilik</p>
                        <p className="text-lg font-display font-black text-white tracking-tight">%92</p>
                        <p className="text-[8px] font-bold text-indigo-300/40 mt-1 uppercase tracking-widest">Sektörün %15 üzerinde</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Section title="Stratejik Öneriler" icon={<Target className="text-indigo-400" />}>
                    <div className="space-y-3">
                      {[
                        { title: 'Menü Optimizasyonu', insight: 'Pizza Margherita satışları artarken kar marjı düşüyor. Tedarikçi değişikliği önerilir.', impact: 'high', category: 'sales', action: 'Tedarikçileri İncele', type: 'suppliers' as const },
                        { title: 'Personel Verimliliği', insight: 'Cuma akşamları servis hızı %20 düşüyor. Ek 1 personel görevlendirilmesi önerilir.', impact: 'medium', category: 'staff', action: 'Vardiya Düzenle', type: 'shifts' as const },
                        { title: 'Stok Uyarısı', insight: 'Et ürünlerinde zayiat oranı yükseliyor. Saklama koşullarını kontrol edin.', impact: 'high', category: 'stock', action: 'Depo Kontrolü', type: 'warehouse' as const },
                      ].map((item, i) => (
                        <div key={i} className="bg-white/[0.03] rounded-xl p-3.5 border border-white/5 hover:bg-white/[0.06] transition-all group">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-display font-bold text-[11px] text-white/90 group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                            <span className={cn(
                              "text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest",
                              item.impact === 'high' ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                            )}>
                              {item.impact === 'high' ? 'Kritik' : 'Orta'}
                            </span>
                          </div>
                          <p className="text-[10px] text-white/40 leading-relaxed mb-3">{item.insight}</p>
                          <button
                            onClick={() => handleStrategicAction(item.type)}
                            className="text-[8px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase tracking-widest group-hover:gap-2 transition-all"
                          >
                            {item.action} <ChevronRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </Section>

                  <Section title="Talep Tahmini (7 Gün)" icon={<Activity className="text-indigo-400" />}>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { name: 'Pzt', actual: 4000, predicted: 4200 },
                          { name: 'Sal', actual: 3000, predicted: 3100 },
                          { name: 'Çar', actual: 2000, predicted: 2500 },
                          { name: 'Per', actual: 2780, predicted: 2900 },
                          { name: 'Cum', actual: 1890, predicted: 4800 },
                          { name: 'Cmt', actual: 2390, predicted: 5500 },
                          { name: 'Paz', actual: 3490, predicted: 5200 },
                        ]} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="name" stroke="#ffffff40" fontSize={9} tickLine={false} axisLine={false} />
                          <YAxis stroke="#ffffff40" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `₺${v / 1000}k`} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                            itemStyle={{ fontSize: '11px' }}
                          />
                          <Area type="monotone" dataKey="predicted" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorPredicted)" name="Tahmin" />
                          <Area type="monotone" dataKey="actual" stroke="#ffffff40" strokeWidth={1.5} fill="transparent" name="Gerçekleşen" strokeDasharray="5 5" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Section>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <Section title="Dinamik Fiyatlandırma Önerileri" icon={<TrendingDown className="text-emerald-400" />}>
                    <div className="space-y-3.5">
                      {pricingSuggestions.map((suggestion, i) => (
                        <div key={i} className="bg-white/5 rounded-2xl p-3.5 border border-white/5">
                          <div className="flex justify-between items-start mb-1.5">
                            <h4 className="font-bold text-xs">{suggestion.productName}</h4>
                            <div className="text-right">
                              <p className="text-[10px] line-through text-white/40">{formatCurrency(suggestion.currentPrice)}</p>
                              <p className="text-xs font-black text-emerald-400">{formatCurrency(suggestion.suggestedPrice)}</p>
                            </div>
                          </div>
                          <p className="text-[9px] text-white/60 mb-2.5">{suggestion.reason}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                              Etki: {suggestion.impact}
                            </span>
                            <button className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg hover:bg-emerald-500/30 transition-colors uppercase tracking-widest">
                              Uygula
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>

                  <Section title="Vardiya Optimizasyonu" icon={<Clock3 className="text-blue-400" />}>
                    <div className="h-56 w-full mb-3.5">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={shiftOptimization} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="hour" stroke="#ffffff40" fontSize={9} tickLine={false} axisLine={false} />
                          <YAxis stroke="#ffffff40" fontSize={9} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                            itemStyle={{ fontSize: '11px' }}
                          />
                          <Bar dataKey="suggestedStaffCount" fill="#6366f1" radius={[3, 3, 0, 0]} name="Önerilen Personel" />
                          <Bar dataKey="currentStaffCount" fill="#ffffff20" radius={[3, 3, 0, 0]} name="Mevcut Personel" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {shiftOptimization.filter(s => s.suggestedStaffCount > s.currentStaffCount).slice(0, 3).map((s, i) => (
                        <div key={i} className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                          <p className="text-[10px] text-red-200">
                            Saat <span className="font-bold">{s.hour}:00</span> için yetersiz personel! (+{s.suggestedStaffCount - s.currentStaffCount} kişi önerilir)
                          </p>
                        </div>
                      ))}
                    </div>
                  </Section>
                </div>
              </motion.div>
            )}

            {/* MENU ENGINEERING */}
            {activeView === 'menu_engineering' && (
              <motion.div key="menu_engineering" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                <Section title="Menü Mühendisliği Matrisi" icon={<ChefHat className="text-amber-500" />}>
                  <div className="h-64 w-full relative bg-white/[0.03] rounded-3xl p-4 border border-white/10 overflow-hidden">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">Yüksek Popülerlik</div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">Düşük Popülerlik</div>
                    <div className="absolute left-2 top-1/2 -rotate-90 origin-left -translate-y-1/2 text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">Yüksek Karlılık</div>
                    <div className="absolute right-2 top-1/2 rotate-90 origin-right -translate-y-1/2 text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">Düşük Karlılık</div>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-full h-px bg-white/5" />
                      <div className="h-full w-px bg-white/5" />
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 15, right: 15, bottom: 15, left: 15 }}>
                        <XAxis type="number" dataKey="popularity" hide domain={[0, 100]} />
                        <YAxis type="number" dataKey="profitability" hide domain={[0, 100]} />
                        <ZAxis type="number" dataKey="revenue" range={[80, 800]} />
                        <Tooltip
                          cursor={{ strokeDasharray: '3 3' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-[#0a0a0a] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
                                  <p className="text-[10px] font-display font-bold text-white mb-1.5">{data.name}</p>
                                  <div className="space-y-1">
                                    <p className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Kategori: <span className={cn(
                                      "font-bold",
                                      data.category === 'Star' ? "text-amber-400" :
                                        data.category === 'Plowhorse' ? "text-blue-400" :
                                          data.category === 'Puzzle' ? "text-purple-400" : "text-red-400"
                                    )}>{data.category}</span></p>
                                    <p className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Ciro: <span className="text-white/80">{formatCurrency(data.revenue)}</span></p>
                                    <p className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Kar: <span className="text-emerald-400">{formatCurrency(data.profit)}</span></p>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter name="Ürünler" data={menuEngineering}>
                          {menuEngineering.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={
                              entry.category === 'Star' ? '#f59e0b' :
                                entry.category === 'Plowhorse' ? '#3b82f6' :
                                  entry.category === 'Puzzle' ? '#8b5cf6' : '#ef4444'
                            } className="drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </Section>

                <div className="grid grid-cols-1 gap-2.5">
                  {menuEngineering.map((item, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-3.5 flex items-center justify-between hover:bg-white/[0.06] transition-all group">
                      <div className="flex items-center gap-3.5">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-xs border transition-transform group-hover:scale-105 shadow-lg",
                          item.category === 'Star' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                            item.category === 'Plowhorse' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                              item.category === 'Puzzle' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                          {item.category[0]}
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-xs text-white/90">{item.name}</h4>
                          <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-display font-bold text-white/90">{formatCurrency(item.revenue)}</p>
                        <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Kar: {formatCurrency(item.profit)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* EXECUTIVE */}
            {activeView === 'executive' && (
              <motion.div key="executive" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                {/* P&L Trend */}
                <Section title="Kar/Zarar (P&L) Trendi" icon={<Activity className="text-blue-500" />}>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={pnlTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" hide />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backdropFilter: 'blur(12px)' }}
                          itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="revenue" name="Ciro" fill="#3b82f6" radius={[3, 3, 0, 0]} opacity={0.6} />
                        <Bar dataKey="cogs" name="Maliyet" fill="#ef4444" radius={[3, 3, 0, 0]} opacity={0.6} />
                        <Line type="monotone" dataKey="netProfit" name="Net Kar" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981', strokeWidth: 1.5, stroke: '#fff' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Category Profitability */}
                  <Section title="Kategori Karlılığı" icon={<Target className="text-emerald-500" />}>
                    <div className="space-y-2.5">
                      {categoryProfit.slice(0, 4).map((cp, i) => (
                        <div key={i} className="bg-white/[0.03] rounded-xl p-3 border border-white/5 hover:bg-white/[0.06] transition-all">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-display font-bold text-[11px] text-white/90">{cp.category}</span>
                            <span className="text-emerald-400 font-display font-bold text-[11px]">%{cp.margin.toFixed(1)} Marj</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${Math.min(cp.margin, 100)}%` }} />
                          </div>
                          <div className="flex justify-between mt-2 text-[8px] text-white/30 uppercase tracking-widest font-bold">
                            <span>Ciro: <span className="text-white/70">{formatCurrency(cp.revenue)}</span></span>
                            <span>Kar: <span className="text-emerald-400">{formatCurrency(cp.profit)}</span></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* Staff Advanced Radar */}
                  <Section title="Personel Yetkinlik Analizi" icon={<Zap className="text-purple-500" />}>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={staffAdvanced.slice(0, 3)}>
                          <PolarGrid stroke="rgba(255,255,255,0.05)" />
                          <PolarAngleAxis dataKey="name" tick={{ fill: '#ffffff40', fontSize: 8, fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                          <Radar name="Upsell" dataKey="upsellScore" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={1.5} />
                          <Radar name="Hız" dataKey="speedScore" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={1.5} />
                          <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backdropFilter: 'blur(12px)' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-[8px] text-center text-white/20 mt-1 uppercase tracking-widest font-bold">* En aktif 3 personel karşılaştırması</p>
                  </Section>
                </div>

                {/* Heatmap (Scatter) */}
                <Section title="Saatlik Yoğunluk Haritası" icon={<Clock className="text-amber-500" />}>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" dataKey="hour" name="Saat" tick={{ fill: '#666', fontSize: 8 }} domain={[0, 23]} tickFormatter={(v) => `${v}:00`} />
                        <YAxis type="number" dataKey="day" name="Gün" tick={{ fill: '#666', fontSize: 8 }} domain={[1, 7]} tickFormatter={(v) => ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][v - 1] || v} />
                        <ZAxis type="number" dataKey="count" range={[30, 200]} name="Sipariş" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', fontSize: '10px' }} />
                        <Scatter name="Yoğunluk" data={heatmapData} fill="#f59e0b" opacity={0.8} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
              </motion.div>
            )}

            {/* AI */}
            {activeView === 'ai' && isAiEnabled && (
              <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col h-[calc(100vh-140px)]">
                <div className="flex-1 overflow-y-auto space-y-4 pb-3 pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full no-scrollbar">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={cn("flex gap-2 max-w-[94%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 shadow-lg", msg.role === 'user' ? "bg-amber-500 text-black" : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white")}>
                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={cn("rounded-2xl p-4 text-[13px] leading-relaxed shadow-xl", msg.role === 'user' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "glass-dark border border-white/10 text-white/80")}>
                        {msg.role === 'model' ? (
                          <div className="markdown-body [&>p]:mb-3 [&>h3]:text-base [&>h3]:font-display [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-4 [&>h3]:mb-1.5 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:mb-3 [&_strong]:text-amber-500 [&_strong]:font-bold [&_em]:italic [&_em]:text-white/90 last:[&>p]:mb-0">
                            <Markdown>{msg.text}</Markdown>
                          </div>
                        ) : (
                          <p className="font-medium">{msg.text}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex gap-2.5 max-w-[92%]">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-lg">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="rounded-2xl p-4 glass-dark border border-white/10 text-white/50 flex items-center gap-2.5 text-[13px] shadow-xl">
                        <RefreshCcw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        <span className="font-bold uppercase tracking-widest text-[9px]">Analiz Ediliyor...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="relative mt-4 shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-purple-500/20 blur-xl opacity-20" />
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="İşletmeniz hakkında bir soru sorun..."
                    className="relative w-full glass-dark border border-white/10 rounded-xl py-3.5 pl-5 pr-14 text-white outline-none focus:border-amber-500/50 transition-all text-[13px] shadow-2xl placeholder:text-white/20"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isAiLoading}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 bg-amber-500 text-black rounded-lg flex items-center justify-center hover:bg-amber-400 transition-all active:scale-90 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-amber-500/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* No License Modal */}
      <AnimatePresence>
        {showNoLicenseModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNoLicenseModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 z-[101] shadow-2xl text-center"
            >
              <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                <AlertCircle className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lisans Uyarısı</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                Lisansınız Yapayzeka Destekli Analiz modülünü içermiyor.
              </p>
              <button
                onClick={() => setShowNoLicenseModal(false)}
                className="w-full bg-amber-500 text-black font-bold py-4 rounded-2xl hover:bg-amber-400 transition-colors active:scale-[0.98]"
              >
                Anladım
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Strategic Action Modal */}
      <AnimatePresence>
        {isActionModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsActionModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[32px] p-6 z-[101] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-xl">
                    {actionModalType === 'suppliers' ? <Truck className="w-5 h-5 text-indigo-400" /> :
                      actionModalType === 'shifts' ? <Users className="w-5 h-5 text-indigo-400" /> :
                        <Package className="w-5 h-5 text-indigo-400" />}
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {actionModalType === 'suppliers' ? 'Tedarikçi Analizi' :
                      actionModalType === 'shifts' ? 'Vardiya Düzenleme' :
                        'Depo Kontrol Listesi'}
                  </h3>
                </div>
                <button onClick={() => setIsActionModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                {isActionLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <RefreshCcw className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-xs text-white/40">Veriler hazırlanıyor...</p>
                  </div>
                ) : (
                  <>
                    {actionModalType === 'suppliers' && actionData.map((s, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm">{s.name}</p>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{s.category}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end mb-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-bold">{s.rating}</span>
                          </div>
                          <span className={cn(
                            "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                            s.status === 'Aktif' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                          )}>{s.status}</span>
                        </div>
                      </div>
                    ))}

                    {actionModalType === 'shifts' && actionData.map((s, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                            {s.staffName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{s.staffName}</p>
                            <p className="text-[10px] text-white/40">{s.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-white/80">{s.shift}</p>
                          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{s.status}</p>
                        </div>
                      </div>
                    ))}

                    {actionModalType === 'warehouse' && actionData.map((s, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm">{s.name}</p>
                          <p className="text-[10px] text-white/40">Son Kontrol: {s.lastCheck}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-white mb-1">{s.stock}</p>
                          <span className={cn(
                            "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                            s.status === 'Kritik' ? "bg-red-500/20 text-red-400" :
                              s.status === 'Düşük' ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                          )}>{s.status}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-white/5">
                <button
                  onClick={() => setIsActionModalOpen(false)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-colors active:scale-[0.98] text-sm"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuickAccessCard({ icon: Icon, title, desc, onClick, color, delay }: any) {
  const colorMap = {
    blue: "from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20",
    emerald: "from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20",
    purple: "from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20",
    red: "from-red-500/20 to-red-600/5 text-red-400 border-red-500/20",
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="relative group overflow-hidden"
    >
      <div className="absolute inset-0 bg-white/[0.02] group-hover:bg-white/[0.05] transition-colors rounded-2xl border border-white/5" />
      <div className="relative p-3 flex items-center gap-3">
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center border bg-gradient-to-br shrink-0 transition-transform group-hover:scale-105 shadow-sm",
          colorMap[color as keyof typeof colorMap]
        )}>
          <Icon className="w-[18px] h-[18px]" />
        </div>
        <div className="min-w-0 text-left">
          <h4 className="font-display font-bold text-xs text-white/90 truncate leading-tight">{title}</h4>
          <p className="text-[9px] text-white/30 truncate leading-tight mt-0.5">{desc}</p>
        </div>
      </div>
    </motion.button>
  );
}

function Section({ title, icon, children }: { title: string, icon?: React.ReactNode, children: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl p-3 sm:p-4 shadow-2xl relative overflow-hidden group">
      <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl group-hover:bg-white/[0.05] transition-colors" />
      <div className="flex items-center justify-between mb-3 sm:mb-4 relative z-10">
        <h3 className="micro-label text-white/40">{title}</h3>
        {icon && <div className="text-white/10 group-hover:text-white/20 transition-colors">{icon}</div>}
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: 'amber' | 'blue' }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass rounded-2xl p-3 sm:p-4 relative overflow-hidden group transition-all hover:border-white/20 shadow-xl"
    >
      <div className={cn("absolute -right-8 -top-8 w-28 h-28 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20", color === 'amber' ? "bg-amber-500" : "bg-blue-500")} />
      <div className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 shadow-lg", color === 'amber' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20")}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-4 h-4 sm:w-4.5 sm:h-4.5" })}
      </div>
      <p className="micro-label mb-1 text-white/40">{label}</p>
      <p className="text-lg sm:text-xl font-display font-bold tracking-tight truncate text-white leading-tight">{value}</p>
    </motion.div>
  );
}
