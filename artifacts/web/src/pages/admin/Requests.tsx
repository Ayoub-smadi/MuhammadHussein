import React, { useState } from "react";
import { useApp, CardRequest } from "@/context/AppContext";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CheckCircle2, XCircle, Clock, MessageCircle, Zap, ExternalLink, X, FileText, Copy, Share2, Calendar, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";

const OP_COLORS: Record<string, string> = {
  zain:   "text-[#00A89C] bg-[#00A89C]/10",
  orange: "text-[#FF6B00] bg-[#FF6B00]/10",
  umniah: "text-[#00A651] bg-[#00A651]/10",
};

const OP_NAMES: Record<string, string> = {
  zain: "زين",
  orange: "أورنج",
  umniah: "أمنية",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "⏳ قيد الانتظار",
  approved: "✅ مقبول وتم الشحن",
  rejected: "❌ مرفوض",
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
  window.open(`https://wa.me/${formatted}?text=${encoded}`, '_blank');
}

function buildReport(req: CardRequest): string {
  const date = format(new Date(req.requestDate), "EEEE، dd MMMM yyyy", { locale: ar });
  const time = format(new Date(req.requestDate), "hh:mm a", { locale: ar });
  const resolvedDate = req.resolvedDate
    ? format(new Date(req.resolvedDate), "EEEE، dd MMMM yyyy - hh:mm a", { locale: ar })
    : null;

  return [
    `📋 تقرير طلب بطاقة شحن - Hussein`,
    `══════════════════════════`,
    ``,
    `📅 تاريخ الطلب: ${date}`,
    `⏰ وقت الطلب:  ${time}`,
    ``,
    `👤 بيانات الزبون:`,
    `   • الاسم:  ${req.userName}`,
    `   • الهاتف: ${req.userPhone}`,
    ``,
    `📱 تفاصيل البطاقة:`,
    `   • البطاقة:  ${req.cardName}`,
    `   • الشركة:   ${OP_NAMES[req.operator] ?? req.operator}`,
    `   • القيمة:   ${req.cardValue} JD`,
    `   • السعر:    ${req.cardPrice} JD`,
    ``,
    `📊 الحالة: ${STATUS_LABELS[req.status] ?? req.status}`,
    ...(req.adminNote ? [`📝 ملاحظة: ${req.adminNote}`] : []),
    ...(resolvedDate ? [`🕐 تاريخ المعالجة: ${resolvedDate}`] : []),
    ``,
    `══════════════════════════`,
    `Hussein - نظام بطاقات الاتصالات`,
  ].join("\n");
}

export default function RequestsScreen() {
  const { requests, approveRequest, rejectRequest, pendingRequestsCount } = useApp();
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [rejectReqId, setRejectReqId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [reportReq, setReportReq] = useState<CardRequest | null>(null);

  const filtered = filter === "pending"
    ? requests.filter((r) => r.status === "pending")
    : requests;

  const handleApprove = (req: CardRequest) => {
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

  const handleCopyReport = (req: CardRequest) => {
    const report = buildReport(req);
    navigator.clipboard.writeText(report).then(() => {
      toast.success("تم نسخ التقرير", { description: "يمكنك لصقه الآن في أي مكان" });
    }).catch(() => {
      toast.error("تعذّر النسخ، يرجى المحاولة يدوياً");
    });
  };

  const handleShareReportWhatsApp = (req: CardRequest) => {
    const report = buildReport(req);
    const formatted = formatPhoneForWhatsApp(req.userPhone);
    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(report)}`, '_blank');
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
                  className={`bg-white rounded-2xl border ${isPending ? 'border-amber-200 shadow-md shadow-amber-500/5' : 'border-slate-100 shadow-sm'} overflow-hidden`}
                >
                  <div className="p-5">
                    {/* Top row: customer + card info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
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
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${opColorClass}`}>{OP_NAMES[req.operator]}</span>
                          <span className="font-bold text-slate-700">{req.cardName}</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900" dir="ltr">{req.cardPrice} JD</p>
                      </div>
                    </div>

                    {/* Date & Time — prominent */}
                    <div className="flex items-center gap-4 py-3 px-4 mb-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold">
                          {format(new Date(req.requestDate), "EEEE، dd MMMM yyyy", { locale: ar })}
                        </span>
                      </div>
                      <div className="w-px h-4 bg-slate-200" />
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold" dir="ltr">
                          {format(new Date(req.requestDate), "hh:mm a", { locale: ar })}
                        </span>
                      </div>
                      {/* Report buttons */}
                      <div className="flex items-center gap-2 mr-auto">
                        <button
                          onClick={() => setReportReq(req)}
                          title="عرض التقرير الكامل"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          تقرير
                        </button>
                        <button
                          onClick={() => handleCopyReport(req)}
                          title="نسخ التقرير"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          نسخ
                        </button>
                        <button
                          onClick={() => handleShareReportWhatsApp(req)}
                          title="إرسال التقرير عبر واتساب"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#15803D] hover:bg-[#25D366]/10 transition-colors border border-[#25D366]/30"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          واتساب
                        </button>
                      </div>
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

      {/* Report Modal */}
      <Dialog.Root open={!!reportReq} onOpenChange={(o) => !o && setReportReq(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-lg bg-white rounded-3xl shadow-2xl p-6 z-50 animate-in zoom-in-95 duration-200 focus:outline-none">
            {reportReq && (
              <>
                <div className="flex justify-between items-center mb-5">
                  <Dialog.Title className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-500" />
                    تقرير الطلب الكامل
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </Dialog.Close>
                </div>

                <pre
                  className="bg-slate-950 text-slate-100 rounded-2xl p-5 text-sm font-mono leading-relaxed whitespace-pre-wrap overflow-auto max-h-96 text-right"
                  dir="rtl"
                >
                  {buildReport(reportReq)}
                </pre>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => handleCopyReport(reportReq)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    نسخ التقرير
                  </button>
                  <button
                    onClick={() => handleShareReportWhatsApp(reportReq)}
                    className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white font-bold hover:bg-[#20bd5a] transition-colors shadow-lg shadow-green-500/20"
                  >
                    <Phone className="w-4 h-4" />
                    إرسال للزبون عبر واتساب
                  </button>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Reject Dialog */}
      <Dialog.Root open={!!rejectReqId} onOpenChange={(o) => !o && setRejectReqId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 z-50 animate-in zoom-in-95 duration-200 focus:outline-none">
            <form onSubmit={handleReject}>
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className="text-2xl font-black text-red-600">رفض الطلب</Dialog.Title>
                <Dialog.Close asChild>
                  <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-sm font-bold text-slate-700">سبب الرفض (اختياري، يظهر للزبون)</label>
                <textarea
                  autoFocus rows={3}
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
