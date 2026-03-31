export interface DashboardStats {
  totalSalesAllTime: number;
  todaySales: number | null;
  activeTables: number;
  completedOrders: number;
  todayIncome: number | null;
}

export interface SalesTrend { date: string; total: number; profit: number; aov: number; }
export interface TopProduct { name: string; totalQty: number; totalRevenue: number; profit: number; }
export interface ActiveTable { name: string; waiterName: string; currentTotal: number; orderStartTime: string; }

export interface FinanceSummary { totalBalance: number; dailyIncome: number; dailyExpense: number; dailyProfit: number; }
export interface HourlySale { hour: number; total: number; }
export interface CategorySale { name: string; value: number; }
export interface StaffPerformance { name: string; orders: number; revenue: number; avgOrderValue: number; cancelCount: number; }
export interface CriticalStock { name: string; quantity: number; minStockLevel: number; }
export interface StockAdvanced { totalInventoryValue: number; todayWastageCost: number; }
export interface Debtor { name: string; currentBalance: number; phone: string; }
export interface Reservation { customerName: string; guestCount: number; reservationTime: string; status: string; }
export interface OperationsMetrics { cancelCount: number; cancelLoss: number; }

// NEW ADVANCED REPORTS
export interface HeatmapData { day: number; hour: number; count: number; revenue: number; }
export interface CategoryProfit { category: string; revenue: number; profit: number; margin: number; }
export interface CancelAnalysis { reason: string; count: number; loss: number; }
export interface StaffAdvanced { name: string; upsellScore: number; speedScore: number; cancelRate: number; revenueScore: number; }
export interface TableTurnover { tableName: string; turnoverRate: number; avgDuration: number; revenue: number; }
export interface PnlTrend { date: string; revenue: number; cogs: number; expenses: number; netProfit: number; }
export interface FoodCost { category: string; cost: number; revenue: number; ratio: number; }
export interface BasketAnalysis { productA: string; productB: string; frequency: number; }
export interface PaymentMethod { method: string; count: number; total: number; }
export interface TopWastage { name: string; quantity: number; loss: number; }

export interface BranchData {
  id: string;
  name: string;
  location: string;
  manager: string;
  todaySales: number;
  monthlyTarget: number;
  currentMonthlySales: number;
  staffCount: number;
  status: 'open' | 'closed' | 'busy';
  rating: number;
}

export interface AIAnalysis {
  title: string;
  insight: string;
  impact: 'high' | 'medium' | 'low';
  category: 'sales' | 'staff' | 'stock' | 'customer';
  action: string;
}

export interface SmartAlert {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info';
  timestamp: string;
  isRead: boolean;
}

export interface MenuEngineeringItem {
  name: string;
  popularity: number;
  profitability: number;
  category: 'Star' | 'Plowhorse' | 'Puzzle' | 'Dog';
  revenue: number;
  profit: number;
}

export interface DynamicPricingSuggestion {
  productName: string;
  currentPrice: number;
  suggestedPrice: number;
  reason: string;
  impact: string;
}

export interface ShiftOptimization {
  day: string;
  hour: number;
  predictedCustomerCount: number;
  suggestedStaffCount: number;
  currentStaffCount: number;
}
