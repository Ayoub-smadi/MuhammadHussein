import React from "react";
import { useApp } from "@/context/AppContext";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Clock, CheckCircle2, XCircle, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const OP_COLORS: Record<string, string> = {
  zain: "text-[#00A651] bg-[#00A651]/10", 
  orange: "text-[#FF6B00] bg-[#FF6B00]/10", 
  umniah: "text-[#E31E24] bg-[#E31E24]/10",
};

export default function PurchasesScreen() {
  const { currentUser, getUserRequests } = useApp();
  
  if (!currentUser) return null;

  const myRequests = getUserRequests(currentUser.id).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  const pending = myRequests.filter((r) => r.status === "pending").length;
  const approved = myRequests.filter((r) => r.status === "approved").length;

  return (
    <div className="p-4 md:p-8 space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">طلباتي السابقة</h1>
          <p className="text-slate-500 mt-1 font-medium">سجل بجميع طلبات الشحن الخاصة بك</p>
        </div>
        
        <div className="flex gap-2">
          <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-amber-700 text-sm">{pending} معلق</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-emerald-700 text-sm">{approved} منجز</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {myRequests.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-100 rounded-3xl border-dashed">
            <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-bold text-slate-500">لم تقم بأي طلبات بعد</p>
          </div>
        ) : (
          myRequests.map((req, i) => {
            const opColorClass = OP_COLORS[req.operator];
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                key={req.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${opColorClass}`}>
                      {req.cardValue}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{req.cardName}</h3>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {format(new Date(req.requestDate), "dd MMM yyyy - hh:mm a", { locale: ar })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0">
                    <span className="text-xl font-black text-slate-900" dir="ltr">{req.cardPrice} JD</span>
                    
                    {req.status === 'pending' && (
                      <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-lg text-xs font-bold border border-amber-100 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> قيد المعالجة
                      </span>
                    )}
                    {req.status === 'approved' && (
                      <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-100 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> تم الشحن بنجاح
                      </span>
                    )}
                    {req.status === 'rejected' && (
                      <div className="flex flex-col items-end">
                        <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-bold border border-red-100 flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" /> مرفوض
                        </span>
                        {req.adminNote && <span className="text-[10px] text-red-400 mt-1 max-w-[150px] truncate">{req.adminNote}</span>}
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            );
          })
        )}
      </div>

    </div>
  );
}
