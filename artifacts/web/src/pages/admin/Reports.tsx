import React, { useState } from "react";
import { useApp, Operator } from "@/context/AppContext";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { FileText, Search, Download, Filter } from "lucide-react";

const OP_CFG = {
  zain: { name: "زين", color: "text-[#00A651]", bg: "bg-[#00A651]" },
  orange: { name: "أورنج", color: "text-[#FF6B00]", bg: "bg-[#FF6B00]" },
  umniah: { name: "أمنية", color: "text-[#E31E24]", bg: "bg-[#E31E24]" },
};

export default function ReportsScreen() {
  const { sales } = useApp();
  const [search, setSearch] = useState("");
  const [filterOp, setFilterOp] = useState<Operator | "all">("all");

  const filteredSales = sales
    .filter(s => filterOp === "all" || s.operator === filterOp)
    .filter(s => s.customerName.includes(search) || s.customerPhone.includes(search))
    .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());

  const totalRev = filteredSales.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalDebt = filteredSales.reduce((acc, s) => acc + s.debt, 0);

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-6xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">التقارير والمبيعات</h1>
          <p className="text-slate-500 mt-1 font-medium">سجل بجميع الحركات المالية ({filteredSales.length} حركة)</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
          <Download size={18} /> تصدير CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-medium text-sm mb-1">الإيرادات (للفلتر الحالي)</p>
          <p className="text-3xl font-black text-slate-900">{totalRev.toFixed(2)} <span className="text-sm font-bold text-slate-400">JD</span></p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-medium text-sm mb-1">الديون المتولدة</p>
          <p className="text-3xl font-black text-red-500">{totalDebt.toFixed(2)} <span className="text-sm font-bold text-red-300">JD</span></p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm col-span-2 md:col-span-1">
          <p className="text-slate-500 font-medium text-sm mb-1">عدد العمليات</p>
          <p className="text-3xl font-black text-slate-900">{filteredSales.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="بحث باسم أو رقم العميل..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl pr-12 pl-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
        <div className="flex gap-2 p-1 bg-slate-50 rounded-xl overflow-x-auto no-scrollbar">
          {(["all", "zain", "orange", "umniah"] as const).map(op => (
            <button
              key={op}
              onClick={() => setFilterOp(op)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filterOp === op ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {op === 'all' ? 'الكل' : OP_CFG[op].name}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">التاريخ</th>
                <th className="px-6 py-4">العميل</th>
                <th className="px-6 py-4 whitespace-nowrap">البطاقة</th>
                <th className="px-6 py-4 whitespace-nowrap">المدفوع</th>
                <th className="px-6 py-4 whitespace-nowrap">الدين</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    لا توجد بيانات مطابقة
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const cfg = OP_CFG[sale.operator];
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-500 font-mono whitespace-nowrap" dir="ltr">
                        {format(new Date(sale.saleDate), "dd/MM/yyyy HH:mm")}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 whitespace-nowrap">{sale.customerName}</p>
                        <p className="text-xs text-slate-500 font-mono" dir="ltr">{sale.customerPhone}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border border-current/10 ${cfg.color} ${cfg.bg.replace('bg-', 'bg-').replace(']', ']/10')}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${cfg.bg}`} />
                          {sale.cardName}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900 whitespace-nowrap">
                        {sale.paidAmount.toFixed(2)} JD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sale.debt > 0 ? (
                          <span className="bg-red-50 text-red-600 px-2 py-1 rounded font-bold text-xs border border-red-100">
                            {sale.debt.toFixed(2)} JD
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
