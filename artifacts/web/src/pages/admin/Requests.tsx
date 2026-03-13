import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CheckCircle2, XCircle, Clock, MessageCircle, Zap, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";

const OP_COLORS: Record<string, string> = {
  zain: "text-[#00A651] bg-[#00A651]/10", 
  orange: "text-[#FF6B00] bg-[#FF6B00]/10", 
  umniah: "text-[#E31E24] bg-[#E31E24]/10",
};

function formatPhoneForWhatsApp(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("00")) return cleaned.slice(2);
  if (cleaned.startsWith("0")) return "962" + cleaned.slice(1);
  if (cleaned.startsWith("962")) return cleaned;
  return "962" + cleaned;
}

function sendWhatsApp(phone: string, cardName: string, cardPrice: number, isConfirmation = false) {
  const formatted = formatPhoneForWhatsApp(phone);
  const message = isConfirmation
    ? `السلام عليكم 🎉\nتم شحن طلبك بنجاح!\n\n✅ ${cardName} (${cardPrice} JD)\nتم الشحن على رقمك. شكراً لتعاملك معنا 🙏`
    : `السلام عليكم 👋\nطلبك لـ ${cardName} (${cardPrice} JD) جاهز للمعالجة.\n\nيرجى إتمام الدفع عبر رابط الدفع:\n*AYOUB272*\n\nبمجرد تأكيد الدفع سيتم شحن الرقم فوراً ✅`;
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${formatted}?text=${encoded}`;
  window.open(url, '_blank');
}

export default function RequestsScreen() {
  const { requests, approveRequest, rejectRequest, pendingRequestsCount } = useApp();
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  
  const [rejectReqId, setRejectReqId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const filtered = filter === "pending"
    ? requests.filter((r) => r.status === "pending")
    : requests;

  const handleApprove = (req: typeof requests[0]) => {
    approveRequest(req.id);
    toast("تم الشحن بنجاح", {
      description: "هل تريد إرسال رسالة تأكيد عبر واتساب؟",
      action: {
        label: "إرسال",
        onClick: () => sendWhatsApp(req.userPhone, req.cardName, req.cardPrice, true)
      },
      icon: <CheckCircle2 className="text-emerald-500" />
    });
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectReqId) {
      rejectRequest(rejectReqId, rejectNote);
      setRejectReqId(null);
      setRejectNote("");
      toast.success("تم رفض الطلب");
    }
  };

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-5xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">طلبات الشراء</h1>
            {pendingRequestsCount > 0 && (
              <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md shadow-red-500/20 animate-pulse">
                {pendingRequestsCount} جديد
              </span>
            )}
          </div>
          <p className="text-slate-500 mt-1 font-medium">إدارة طلبات الشحن من الزبائن</p>
        </div>
        
        <div className="flex p-1 bg-slate-200/60 rounded-xl">
          <button
            onClick={() => setFilter("pending")}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${filter === "pending" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            بانتظار الموافقة
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            جميع الطلبات
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="py-20 flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-100 rounded-3xl border-dashed"
            >
              <Clock className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-bold text-slate-500">
                {filter === "pending" ? "لا توجد طلبات معلقة حالياً" : "لم يتم العثور على أي طلبات"}
              </p>
            </motion.div>
          ) : (
            filtered.map((req) => {
              const isPending = req.status === "pending";
              const opColorClass = OP_COLORS[req.operator];
              
              return (
                <motion.div
                  layout
                  key={req.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white rounded-2xl border ${isPending ? 'border-amber-200 shadow-md shadow-amber-500/5' : 'border-slate-100 shadow-sm'} overflow-hidden transition-all`}
                >
                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${opColorClass}`}>
                          {req.userName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{req.userName}</h3>
                          <p className="text-slate-500 font-medium font-mono text-sm" dir="ltr">{req.userPhone}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${opColorClass}`}>{req.operator}</span>
                          <span className="font-bold text-slate-700">{req.cardName}</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900" dir="ltr">{req.cardPrice} JD</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-5 border-t border-slate-50 pt-4">
                      <Clock className="w-4 h-4" />
                      {format(new Date(req.requestDate), "dd MMMM yyyy - hh:mm a", { locale: ar })}
                    </div>

                    {isPending ? (
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => sendWhatsApp(req.userPhone, req.cardName, req.cardPrice)}
                          className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#15803D] hover:bg-[#25D366]/20 border border-[#25D366]/30 py-3 rounded-xl font-bold transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                          أرسل رابط الدفع AYOUB272 عبر واتساب
                          <ExternalLink className="w-4 h-4 opacity-50" />
                        </button>
                        
                        <div className="flex gap-3">
                          <button
                            onClick={() => setRejectReqId(req.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 transition-colors"
                          >
                            <X className="w-5 h-5" /> رفض
                          </button>
                          <button
                            onClick={() => handleApprove(req)}
                            className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                          >
                            <Zap className="w-5 h-5 fill-white" /> موافقة وشحن
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`flex items-center gap-2 p-3 rounded-xl font-bold text-sm ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {req.status === 'approved' ? (
                          <><CheckCircle2 className="w-5 h-5" /> تم الموافقة والشحن بنجاح</>
                        ) : (
                          <><XCircle className="w-5 h-5" /> مرفوض {req.adminNote && <span className="opacity-70 font-normal mr-2">السبب: {req.adminNote}</span>}</>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Reject Dialog */}
      <Dialog.Root open={!!rejectReqId} onOpenChange={(o) => !o && setRejectReqId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 z-50 animate-in zoom-in-95 duration-200 focus:outline-none">
            <form onSubmit={handleReject}>
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className="text-2xl font-black text-slate-900 text-red-600">رفض الطلب</Dialog.Title>
                <Dialog.Close asChild>
                  <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-sm font-bold text-slate-700">سبب الرفض (اختياري، يظهر للزبون)</label>
                <textarea
                  autoFocus
                  rows={3}
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="مثال: لم يتم تحويل المبلغ..."
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 text-base font-medium text-slate-900 focus:outline-none focus:border-red-500 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Dialog.Close asChild>
                  <button type="button" className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">إلغاء</button>
                </Dialog.Close>
                <button type="submit" className="flex-[2] py-4 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-[0.98] bg-red-500 hover:bg-red-600">
                  تأكيد الرفض
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
