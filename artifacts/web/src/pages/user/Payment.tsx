import React from "react";
import { useApp } from "@/context/AppContext";
import { useLocation } from "wouter";
import { ArrowRight, Copy, CheckCircle2, Smartphone, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function PaymentScreen() {
  const { currentUser } = useApp();
  const [, setLocation] = useLocation();
  const CLIQ_NAME = "AYOUB272";

  const handleCopy = () => {
    navigator.clipboard.writeText(CLIQ_NAME).then(() => {
      toast.success("تم نسخ اسم الكليك!");
    });
  };

  if (!currentUser) return null;

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLocation("/user")}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">تسديد الذمة</h1>
          <p className="text-slate-500 text-sm font-medium">ادفع رصيدك عبر الكليك</p>
        </div>
      </div>

      {/* Debt Amount */}
      {currentUser.debt > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-amber-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-bold text-sm">المبلغ المستحق عليك</p>
          </div>
          <p className="font-black text-xl text-amber-700">{currentUser.debt.toFixed(2)} JD</p>
        </div>
      )}

      {/* CliQ Card */}
      <div className="bg-gradient-to-br from-[#009B3A] to-[#006B27] rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">الدفع عبر</p>
            <p className="text-white font-black text-xl">CliQ</p>
          </div>
        </div>

        <p className="text-white/60 text-xs font-bold mb-1">اسم الكليك</p>
        <div className="flex items-center justify-between bg-white/15 rounded-2xl px-5 py-4 backdrop-blur-sm">
          <span className="font-black text-2xl tracking-widest">{CLIQ_NAME}</span>
          <button
            onClick={handleCopy}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 transition-colors rounded-xl flex items-center justify-center"
          >
            <Copy className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-white/70">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <p className="text-xs font-medium">بنك الأردن — فوري وآمن</p>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
        <p className="font-black text-slate-900">خطوات الدفع عبر الكليك</p>
        {[
          { num: "١", text: 'افتح تطبيق البنك وادخل على "كليك"' },
          { num: "٢", text: `ابحث عن الاسم: ${CLIQ_NAME}` },
          { num: "٣", text: `أدخل المبلغ المستحق: ${currentUser.debt > 0 ? currentUser.debt.toFixed(2) + " JD" : "حسب ذمتك"}` },
          { num: "٤", text: "أرسل الدفعة وانتظر التأكيد من المتجر" },
        ].map((step) => (
          <div key={step.num} className="flex items-start gap-4">
            <div className="w-8 h-8 shrink-0 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-black text-sm">
              {step.num}
            </div>
            <p className="text-slate-600 font-medium text-sm pt-1">{step.text}</p>
          </div>
        ))}
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
        <CreditCard className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-blue-700 text-sm font-medium">
          بعد الدفع، تواصل مع المتجر لتأكيد التسديد وتصفير رصيد ذمتك.
        </p>
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-colors shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        <Copy className="w-5 h-5" />
        انسخ اسم الكليك: {CLIQ_NAME}
      </button>

    </div>
  );
}
