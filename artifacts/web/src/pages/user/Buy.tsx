import React, { useState } from "react";
import { useApp, Operator } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Zap, X, ShieldCheck, ArrowRight, CheckCircle2, Ban } from "lucide-react";
import { useLocation } from "wouter";

const OP_CFG = {
  zain:   { name: "زين",   gradient: "from-[#00C4B3] to-[#0088A3]", color: "text-[#00A89C]", bg: "bg-[#00A89C]", light: "bg-[#E0F7F5]" },
  orange: { name: "أورنج", gradient: "from-[#FF6B00] to-[#FF9500]", color: "text-[#FF6B00]", bg: "bg-[#FF6B00]", light: "bg-[#FFF0E6]" },
  umniah: { name: "أمنية", gradient: "from-[#00A651] to-[#007A3D]", color: "text-[#00A651]", bg: "bg-[#00A651]", light: "bg-[#E8F8EF]" },
};

const OP_LOGO: Record<Operator, React.ReactNode> = {
  zain: (
    <svg viewBox="0 0 80 40" className="w-16 h-8 fill-white" xmlns="http://www.w3.org/2000/svg">
      <text x="4" y="30" fontSize="26" fontWeight="900" fontFamily="Arial" letterSpacing="2">زين</text>
    </svg>
  ),
  orange: (
    <svg viewBox="0 0 100 40" className="w-20 h-8 fill-white" xmlns="http://www.w3.org/2000/svg">
      <text x="4" y="30" fontSize="24" fontWeight="900" fontFamily="Arial" letterSpacing="1">أورنج</text>
    </svg>
  ),
  umniah: (
    <svg viewBox="0 0 90 40" className="w-18 h-8 fill-white" xmlns="http://www.w3.org/2000/svg">
      <text x="4" y="30" fontSize="24" fontWeight="900" fontFamily="Arial" letterSpacing="1">أمنية</text>
    </svg>
  ),
};

export default function BuyScreen() {
  const [, setLocation] = useLocation();
  const { cards, addRequest, currentUser, cardStock } = useApp();
  const [activeOp, setActiveOp] = useState<Operator>("zain");
  const [selectedCard, setSelectedCard] = useState<typeof cards[0] | null>(null);
  const [confirmed, setConfirmed] = useState(false);

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
    setConfirmed(false);
    toast.success("تم إرسال الطلب بنجاح", {
      description: "سيتم معالجة طلبك قريباً",
      action: { label: "عرض طلباتي", onClick: () => setLocation("/user/purchases") }
    });
  };

  const handleCloseDialog = () => {
    setSelectedCard(null);
    setConfirmed(false);
  };

  const handleChangeCard = () => {
    setSelectedCard(null);
    setConfirmed(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">

      {currentUser && currentUser.debt > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-amber-700">
              <ShieldCheck className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold text-sm">تنبيه ذمة مالية</p>
                <p className="text-xs font-medium opacity-80">يوجد رصيد مستحق على حسابك</p>
              </div>
            </div>
            <div className="font-black text-xl text-amber-700">{currentUser.debt.toFixed(2)} JD</div>
          </div>
          <div className="flex items-center justify-between border-t border-amber-200 pt-3">
            <p className="text-amber-700 font-bold text-sm">هل تريد التسديد؟</p>
            <button
              onClick={() => setLocation("/user/payment")}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl transition-colors shadow-sm active:scale-95"
            >
              اذهب لحسابي
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">شراء بطاقة شحن</h1>
        <p className="text-slate-500 mt-1 font-medium">اختر الشركة والبطاقة المناسبة لك</p>
      </div>

      {/* Operator Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
        {(["zain", "orange", "umniah"] as Operator[]).map((op) => {
          const cfg = OP_CFG[op];
          const isActive = activeOp === op;
          return (
            <button
              key={op}
              onClick={() => setActiveOp(op)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${isActive ? `text-white ${cfg.bg} shadow-md` : "text-slate-500 hover:bg-slate-200"}`}
            >
              {cfg.name}
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((card) => {
            const cfg = OP_CFG[card.operator];
            const stockVal = cardStock[card.id];
            const outOfStock = stockVal !== undefined && stockVal === 0;
            return (
              <motion.button
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                whileHover={outOfStock ? {} : { scale: 1.03, y: -2 }}
                whileTap={outOfStock ? {} : { scale: 0.97 }}
                onClick={() => !outOfStock && setSelectedCard(card)}
                disabled={outOfStock}
                className={`text-right focus:outline-none ${outOfStock ? "cursor-not-allowed" : ""}`}
              >
                {/* Card shape */}
                <div
                  className={`relative bg-gradient-to-bl ${cfg.gradient} rounded-2xl overflow-hidden shadow-lg transition-shadow ${outOfStock ? "opacity-50 grayscale" : "hover:shadow-xl"}`}
                  style={{ aspectRatio: "1.6/1" }}
                >
                  {/* Out of stock overlay */}
                  {outOfStock && (
                    <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center z-10 gap-1">
                      <Ban className="w-7 h-7 text-white drop-shadow-md" />
                      <span className="text-white font-black text-sm drop-shadow-md">غير متوفر</span>
                    </div>
                  )}

                  {/* Top row: operator name */}
                  <div className="px-4 pt-4 pb-2 flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full border-2 border-white/80" />
                    </div>
                    <span className="text-white font-black text-lg tracking-wide">{cfg.name}</span>
                  </div>

                  {/* Center: card value */}
                  <div className="px-4 flex items-center justify-center py-1">
                    <div className="bg-white/20 rounded-xl px-4 py-2 backdrop-blur-sm">
                      <span className="text-white font-black text-2xl">{card.value}</span>
                      <span className="text-white/80 font-bold text-sm mr-1">JD</span>
                    </div>
                  </div>

                  {/* Bottom: price */}
                  <div className="px-4 pb-3 pt-2 flex justify-between items-end">
                    <div className="text-white/60 text-xs font-bold">شحن رصيد</div>
                    <div className="text-left">
                      <div className="text-white font-black text-xl leading-none">{card.price}</div>
                      <div className="text-white/70 text-xs font-bold">دينار أردني</div>
                    </div>
                  </div>
                </div>

                {/* Card name below */}
                <p className={`text-xs font-bold mt-2 text-center truncate px-1 ${outOfStock ? "text-slate-400" : "text-slate-500"}`}>
                  {outOfStock ? "غير متوفر حالياً" : card.name}
                </p>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Confirm Dialog */}
      <Dialog.Root open={!!selectedCard} onOpenChange={(o) => !o && handleCloseDialog()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-sm bg-white rounded-3xl shadow-2xl p-6 z-50 animate-in zoom-in-95 duration-200 focus:outline-none">
            {selectedCard && (
              <AnimatePresence mode="wait">
                {!confirmed ? (
                  /* Step 1: Review card */
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Dialog.Title className="text-lg font-black text-slate-900">راجع اختيارك</Dialog.Title>
                      <button
                        type="button"
                        onClick={handleCloseDialog}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Card preview */}
                    <div className={`bg-gradient-to-bl ${OP_CFG[selectedCard.operator].gradient} rounded-2xl p-5 mb-4 mx-auto`} style={{ maxWidth: 260 }}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full border-2 border-white/80" />
                        </div>
                        <span className="text-white font-black text-xl">{OP_CFG[selectedCard.operator].name}</span>
                      </div>
                      <div className="text-center mb-4">
                        <span className="text-white font-black text-4xl">{selectedCard.value}</span>
                        <span className="text-white/80 font-bold text-lg mr-2">JD</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-white/60 text-xs font-bold">{selectedCard.name}</span>
                        <div className="text-left">
                          <div className="text-white font-black text-xl">{selectedCard.price} JD</div>
                        </div>
                      </div>
                    </div>

                    <p className="text-center text-slate-500 font-medium text-sm mb-5">هل هذه البطاقة الصحيحة التي تريدها؟</p>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleChangeCard}
                        className="flex-1 py-3.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        تغيير البطاقة
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmed(true)}
                        className={`flex-[2] py-3.5 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-[0.98] bg-gradient-to-l ${OP_CFG[selectedCard.operator].gradient} flex items-center justify-center gap-2`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        نعم، هذه البطاقة
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* Step 2: Final confirm & send */
                  <motion.form
                    key="confirm"
                    onSubmit={handleRequest}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={() => setConfirmed(false)}
                        className="flex items-center gap-1 text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                        تراجع
                      </button>
                      <button
                        type="button"
                        onClick={handleCloseDialog}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Confirmed card summary */}
                    <div className={`${OP_CFG[selectedCard.operator].light} rounded-2xl p-4 mb-5 flex items-center gap-4`}>
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-bl ${OP_CFG[selectedCard.operator].gradient} flex items-center justify-center shrink-0`}>
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className={`font-black text-base ${OP_CFG[selectedCard.operator].color}`}>{selectedCard.name}</p>
                        <p className="text-slate-500 text-sm font-medium">{OP_CFG[selectedCard.operator].name} · {selectedCard.value} JD شحن</p>
                        <p className="font-black text-slate-900 text-lg">{selectedCard.price} JD</p>
                      </div>
                    </div>

                    <Dialog.Title className="text-xl font-black text-slate-900 text-center mb-1">تأكيد وإرسال الطلب</Dialog.Title>
                    <p className="text-slate-500 font-medium text-sm text-center mb-5">سيتم إرسال الطلب للمراجعة والموافقة</p>

                    <button
                      type="submit"
                      className={`w-full py-4 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-[0.98] bg-gradient-to-l ${OP_CFG[selectedCard.operator].gradient} flex items-center justify-center gap-2`}
                    >
                      <Zap className="w-4 h-4 fill-white" />
                      إرسال الطلب
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
