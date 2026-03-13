import React, { useState } from "react";
import { useApp, Operator } from "@/context/AppContext";
import { Edit2, Zap, Check, X, Search, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";

const OP_CFG = {
  zain: { name: "زين", color: "text-[#00A651]", bg: "bg-[#00A651]", light: "bg-[#E8F8EF]", border: "border-[#00A651]" },
  orange: { name: "أورنج", color: "text-[#FF6B00]", bg: "bg-[#FF6B00]", light: "bg-[#FFF0E6]", border: "border-[#FF6B00]" },
  umniah: { name: "أمنية", color: "text-[#E31E24]", bg: "bg-[#E31E24]", light: "bg-[#FDEAEA]", border: "border-[#E31E24]" },
};

export default function CardsScreen() {
  const { cards, updateCardPrice, addSale } = useApp();
  const [activeOp, setActiveOp] = useState<Operator>("zain");
  
  // Edit Price State
  const [editCard, setEditCard] = useState<typeof cards[0] | null>(null);
  const [newPrice, setNewPrice] = useState("");
  
  // Direct Sale State
  const [saleCard, setSaleCard] = useState<typeof cards[0] | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paidAmount, setPaidAmount] = useState("");

  const filtered = cards.filter((c) => c.operator === activeOp);

  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCard) return;
    const val = parseFloat(newPrice);
    if (isNaN(val) || val <= 0) {
      toast.error("أدخل سعر صحيح");
      return;
    }
    updateCardPrice(editCard.id, val);
    setEditCard(null);
    toast.success(`تم تحديث سعر ${editCard.name} بنجاح`);
  };

  const handleDirectSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleCard) return;
    
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("يرجى تعبئة اسم ورقم العميل");
      return;
    }
    
    const paid = parseFloat(paidAmount) || 0;
    const debt = Math.max(0, saleCard.price - paid);

    addSale({
      userId: Date.now().toString(), // anonymous direct sale
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      cardId: saleCard.id,
      cardName: saleCard.name,
      operator: saleCard.operator,
      cardValue: saleCard.value,
      paidAmount: paid,
      debt: debt,
    });

    setSaleCard(null);
    if (debt > 0) {
      toast.warning(`تم البيع. متبقي دين: ${debt.toFixed(2)} JD`);
    } else {
      toast.success("تم البيع نقداً بنجاح!");
    }
  };

  const openSaleModal = (card: typeof cards[0]) => {
    setSaleCard(card);
    setCustomerName("");
    setCustomerPhone("");
    setPaidAmount(card.price.toString());
  };

  const openEditModal = (card: typeof cards[0]) => {
    setEditCard(card);
    setNewPrice(card.price.toString());
  };

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-5xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">إدارة البطاقات</h1>
        <p className="text-slate-500 mt-1 font-medium">تعديل الأسعار وبيع مباشر</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((card) => {
            const cfg = OP_CFG[card.operator];
            const isCustom = card.price !== card.value;
            
            return (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex"
              >
                {/* Accent line */}
                <div className={`w-2 h-full ${cfg.bg}`} />
                
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{card.name}</h3>
                      {isCustom && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold">
                          <Check className="w-3 h-3" /> سعر مخصص
                        </span>
                      )}
                    </div>
                    <div className="text-left">
                      {isCustom && (
                        <p className="text-xs font-medium text-slate-400 line-through mb-0.5">{card.value} JD</p>
                      )}
                      <p className={`text-2xl font-black ${cfg.color}`}>{card.price} JD</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => openEditModal(card)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors border ${cfg.light} ${cfg.color} ${cfg.border} hover:bg-white`}
                    >
                      <Edit2 className="w-4 h-4" />
                      تعديل السعر
                    </button>
                    <button
                      onClick={() => openSaleModal(card)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${cfg.bg} hover:opacity-90 shadow-md`}
                    >
                      <Zap className="w-4 h-4" />
                      بيع مباشر
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Edit Price Dialog */}
      <Dialog.Root open={!!editCard} onOpenChange={(o) => !o && setEditCard(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 z-50 animate-in zoom-in-95 duration-200 focus:outline-none">
            {editCard && (
              <form onSubmit={handleSavePrice}>
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-2xl font-black text-slate-900">تعديل السعر</Dialog.Title>
                  <Dialog.Close asChild>
                    <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className={`p-4 rounded-2xl mb-6 ${OP_CFG[editCard.operator].light} border border-black/5`}>
                  <p className={`text-lg font-bold ${OP_CFG[editCard.operator].color}`}>{editCard.name}</p>
                  <p className="text-sm font-medium text-slate-600 mt-1">القيمة الأصلية للبطاقة: {editCard.value} JD</p>
                </div>

                <div className="space-y-2 mb-8">
                  <label className="text-sm font-bold text-slate-700">السعر الجديد (دينار أردني)</label>
                  <input
                    autoFocus
                    type="number" step="0.01" min="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 text-2xl font-black text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors text-left"
                    dir="ltr"
                  />
                </div>

                <div className="flex gap-3">
                  <Dialog.Close asChild>
                    <button type="button" className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">إلغاء</button>
                  </Dialog.Close>
                  <button type="submit" className={`flex-[2] py-4 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-[0.98] ${OP_CFG[editCard.operator].bg}`}>
                    حفظ التعديل
                  </button>
                </div>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Direct Sale Dialog */}
      <Dialog.Root open={!!saleCard} onOpenChange={(o) => !o && setSaleCard(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 z-50 animate-in zoom-in-95 duration-200 focus:outline-none">
            {saleCard && (
              <form onSubmit={handleDirectSale}>
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    <Zap className="text-amber-500 w-6 h-6 fill-amber-500" />
                    بيع مباشر نقدي
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="flex justify-between items-center p-4 rounded-2xl mb-6 bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-700">{saleCard.name}</span>
                  <span className={`text-xl font-black ${OP_CFG[saleCard.operator].color}`}>{saleCard.price} JD</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">اسم العميل</label>
                    <input
                      autoFocus
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="محمد أحمد"
                      className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-base font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">رقم الهاتف</label>
                    <div className="relative">
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="07XXXXXXXX"
                        className="w-full bg-white border-2 border-slate-200 rounded-xl px-12 py-3 text-base font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2 flex justify-between">
                      <span>المبلغ المدفوع (JD)</span>
                      {(parseFloat(paidAmount) || 0) < saleCard.price && (
                        <span className="text-red-500 text-xs bg-red-50 px-2 py-0.5 rounded">
                          دين: {(saleCard.price - (parseFloat(paidAmount) || 0)).toFixed(2)} JD
                        </span>
                      )}
                    </label>
                    <input
                      type="number" step="0.01" min="0" max={saleCard.price}
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-xl font-black text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Dialog.Close asChild>
                    <button type="button" className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">إلغاء</button>
                  </Dialog.Close>
                  <button type="submit" className={`flex-[2] py-4 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-[0.98] ${OP_CFG[saleCard.operator].bg}`}>
                    تأكيد البيع
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
