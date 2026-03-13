import React from "react";
import { Link } from "wouter";
import { useApp, Operator } from "@/context/AppContext";
import { 
  Users, 
  ShoppingBag, 
  Clock, 
  CreditCard, 
  Bell, 
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { motion } from "framer-motion";

const OP_CFG = {
  zain: { name: "زين", color: "text-[#00A651]", bg: "bg-[#00A651]", light: "bg-[#E8F8EF]", border: "border-[#00A651]" },
  orange: { name: "أورنج", color: "text-[#FF6B00]", bg: "bg-[#FF6B00]", light: "bg-[#FFF0E6]", border: "border-[#FF6B00]" },
  umniah: { name: "أمنية", color: "text-[#E31E24]", bg: "bg-[#E31E24]", light: "bg-[#FDEAEA]", border: "border-[#E31E24]" },
};

export default function Dashboard() {
  const {
    sales, users,
    getTotalRevenue, getTotalDebt, getOperatorSales,
    pendingRequestsCount, getTodayRevenue, getTodaySalesCount,
  } = useApp();

  const recentSales = [...sales].sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()).slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">نظرة عامة</h1>
          <p className="text-slate-500 mt-1 font-medium">ملخص أداء النظام والمبيعات</p>
        </div>
        
        {pendingRequestsCount > 0 && (
          <Link href="/admin/requests">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-3 bg-red-50 border border-red-100 px-5 py-3 rounded-2xl cursor-pointer hover:bg-red-100 transition-colors shadow-sm"
            >
              <div className="relative">
                <Bell className="text-red-500 w-5 h-5" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
              <span className="text-red-700 font-bold text-sm">لديك {pendingRequestsCount} طلب بانتظار موافقتك</span>
            </motion.div>
          </Link>
        )}
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <motion.div variants={itemVariants} className="md:col-span-3 bg-slate-900 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
          
          <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
              <TrendingUp className="text-emerald-400 w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-400 font-medium mb-1">إيرادات اليوم</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">{getTodayRevenue().toFixed(2)}</h2>
                <span className="text-xl text-emerald-400 font-bold">JD</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-8 relative z-10 w-full md:w-auto border-t border-slate-700 md:border-t-0 md:border-r md:pr-8 pt-6 md:pt-0">
            <div>
              <p className="text-slate-400 font-medium text-sm mb-1 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                إجمالي الإيرادات
              </p>
              <p className="text-2xl font-bold">{getTotalRevenue().toFixed(0)} <span className="text-sm text-slate-500">JD</span></p>
            </div>
            <div>
              <p className="text-slate-400 font-medium text-sm mb-1 flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4 text-red-400" />
                إجمالي الديون
              </p>
              <p className="text-2xl font-bold text-red-400">{getTotalDebt().toFixed(0)} <span className="text-sm text-red-500/50">JD</span></p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm mb-1">عدد العملاء</p>
            <p className="text-2xl font-black text-slate-900">{users.length}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm mb-1">إجمالي العمليات</p>
            <p className="text-2xl font-black text-slate-900">{sales.length}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm mb-1">عمليات اليوم</p>
            <p className="text-2xl font-black text-slate-900">{getTodaySalesCount()}</p>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions & Operators */}
        <div className="space-y-8 lg:col-span-1">
          
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-5">وصول سريع</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/cards">
                <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 cursor-pointer transition-colors border border-transparent hover:border-emerald-100">
                  <CreditCard className="w-6 h-6" />
                  <span className="text-sm font-bold">البطاقات</span>
                </div>
              </Link>
              <Link href="/admin/requests">
                <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-600 cursor-pointer transition-colors border border-transparent hover:border-amber-100">
                  <Bell className="w-6 h-6" />
                  <span className="text-sm font-bold">الطلبات</span>
                </div>
              </Link>
              <Link href="/admin/customers">
                <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 cursor-pointer transition-colors border border-transparent hover:border-blue-100">
                  <Users className="w-6 h-6" />
                  <span className="text-sm font-bold">العملاء</span>
                </div>
              </Link>
              <Link href="/admin/reports">
                <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-600 cursor-pointer transition-colors border border-transparent hover:border-purple-100">
                  <FileText className="w-6 h-6" />
                  <span className="text-sm font-bold">التقارير</span>
                </div>
              </Link>
            </div>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="show" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-5">المبيعات حسب الشركة</h3>
            <div className="space-y-4">
              {(["zain", "orange", "umniah"] as Operator[]).map((op) => {
                const cfg = OP_CFG[op];
                const count = getOperatorSales(op);
                const pct = sales.length > 0 ? Math.round((count / sales.length) * 100) : 0;
                
                return (
                  <div key={op} className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${cfg.light} ${cfg.color}`}>
                      {count}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-2">
                        <span className="font-bold text-slate-800">{cfg.name}</span>
                        <span className="text-sm font-bold text-slate-400">{pct}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`h-full rounded-full ${cfg.bg}`} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>

        {/* Recent Sales */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800">آخر العمليات</h3>
            <Link href="/admin/reports">
              <span className="text-sm font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-1">
                عرض الكل
              </span>
            </Link>
          </div>
          
          <div className="flex-1 p-2">
            {recentSales.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                <ShoppingBag className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">لا توجد عمليات بيع بعد</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentSales.map((sale) => {
                  const cfg = OP_CFG[sale.operator];
                  return (
                    <div key={sale.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between rounded-2xl group">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-12 rounded-full ${cfg.bg}`} />
                        <div>
                          <p className="font-bold text-slate-800 text-base">{sale.customerName}</p>
                          <p className="text-xs font-medium text-slate-400 mt-0.5" dir="ltr">
                            {format(new Date(sale.saleDate), "dd MMM yyyy - hh:mm a", { locale: ar })}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className={`font-black text-lg ${cfg.color}`}>{sale.paidAmount.toFixed(2)} JD</p>
                        <p className="text-xs font-bold text-slate-500 mt-0.5">{sale.cardName}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
