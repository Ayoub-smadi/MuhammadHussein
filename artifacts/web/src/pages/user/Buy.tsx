import React, { useState } from "react";
import { useApp, Operator } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { CreditCard, Zap, Check, X, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";

const OP_CFG = {
  zain: { name: "زين", color: "text-[#00A651]", bg: "bg-[#00A651]", light: "bg-[#E8F8EF]", border: "border-[#00A651]" },
  orange: { name: "أورنج", color: "text-[#FF6B00]", bg: "bg-[#FF6B00]", light: "bg-[#FFF0E6]", border: "border-[#FF6B00]" },
  umniah: { name: "أمنية", color: "text-[#E31E24]", bg: "bg-[#E31E24]", light: "bg-[#FDEAEA]", border: "border-[#E31E24]" },
};

export default function BuyScreen() {
  const [, setLocation] = useLocation();
  const { cards, addRequest, currentUser } = useApp();
  const [activeOp, setActiveOp] = useState<Operator>("zain");
  const [selectedCard, setSelectedCard] = useState<typeof cards[0] | null>(null);
  
  const filtered = cards.filter((c) => c.operator === activeOp);

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedCard) return;

    addRequest({
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      cardId: selectedCard.id,
      cardName: selectedCard.name,
      operator: selectedCard.operator,
      cardValue: selectedCard.value,
      cardPrice: selectedCard.price,
    });

    setSelectedCard(null);
    toast.success("تم إرسال الطلب بنجاح", {
      description: "سيتم معالجة طلبك قريباً",
      action: {
        label: "عرض طلباتي",
        onClick: () => setLocation("/user/purchases")
      }
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      
      {/* Debt Banner Alert */}
      {currentUser && currentUser.debt > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 text-amber-700">
            <ShieldCheck className="w-6 h-6" />
            <div>
              <p className="font-bold text-sm">تنبيه ذمة مالية</p>
              <p className="text-xs font-medium opacity-80">يوجد رصيد مستحق على حسابك</p>
            </div>
          </div>
          <div className="font-black text-xl text-amber-700">{currentUser.debt.toFixed(2)} JD</div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">شراء بطاقة شحن</h1>
        <p className="text-slate-500 mt-1 font-medium">اختر الشركة والبطاقة المناسبة لك</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
        {(["zain", "orange", "umniah"] as Operator[]).map((op) => {
          const cfg = OP_CFG[op];
          const isActive = activeOp === op;
          return (
            <button
              key={op}
              onClick={() => setActiveOp(op)}
              className={`
                px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 relative
                ${isActive ? `text-white ${cfg.bg} shadow-md` : "text-slate-500 hover:bg-slate-200"}
              `}
            >
              {cfg.name}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((card) => {
            const cfg = OP_CFG[card.operator];
            return (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelectedCard(card)}
                className={`
                  bg-white rounded-3xl border-2 border-transparent shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col group
                  hover:${cfg.border}
                `}
              >
                <div className={`p-4 flex justify-end ${cfg.bg}`}>
                  <CreditCard className="text-white/30 w-12 h-12 transform -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                </div>
                
                <div className="p-5 flex-1 flex flex-col justify-between -mt-8 relative z-10">
                  <div className="bg-white rounded-xl p-3 shadow-sm inline-block w-fit mb-3 border border-slate-100">
                    <span className={`font-black text-xl ${cfg.color}`}>{card.value} JD</span>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 mb-1">{card.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">{card.price}</span>
                      <span className="text-sm font-bold text-slate-400">JD</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Request Dialog */}
      <Dialog.Root open={!!selectedCard} onOpenChange={(o) => !o && setSelectedCard(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-sm bg-white rounded-3xl shadow-2xl p-6 z-50 animate-in zoom-in-95 duration-200 focus:outline-none">
            {selectedCard && (
              <form onSubmit={handleRequest}>
                <div className="text-center mb-6">
                  <div className={`w-20 h-20 mx-auto rounded-2xl mb-4 flex items-center justify-center shadow-lg ${OP_CFG[selectedCard.operator].light} ${OP_CFG[selectedCard.operator].color}`}>
                    <Zap className="w-10 h-10" />
                  </div>
                  <Dialog.Title className="text-2xl font-black text-slate-900">تأكيد الطلب</Dialog.Title>
                  <p className="text-slate-500 font-medium mt-2">هل أنت متأكد من طلب هذه البطاقة؟</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 font-bold text-sm">البطاقة</span>
                    <span className="text-slate-900 font-black">{selectedCard.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-sm">السعر المطلوب</span>
                    <span className={`font-black text-xl ${OP_CFG[selectedCard.operator].color}`}>{selectedCard.price} JD</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Dialog.Close asChild>
                    <button type="button" className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">إلغاء</button>
                  </Dialog.Close>
                  <button type="submit" className={`flex-[2] py-4 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-[0.98] ${OP_CFG[selectedCard.operator].bg}`}>
                    تأكيد وإرسال الطلب
                  </button>
                </div>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
