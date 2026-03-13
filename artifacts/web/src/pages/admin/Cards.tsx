import React, { useState } from "react";
import { useApp, Operator } from "@/context/AppContext";
import { Edit2, Check, X, Zap, Phone, Plus, Trash2, Type } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";

const OP_CFG = {
  zain:   { name: "زين",   gradient: "from-[#00C4B3] to-[#0088A3]", color: "text-[#00A89C]", bg: "bg-[#00A89C]", light: "bg-[#E0F7F5]", border: "border-[#00A89C]" },
  orange: { name: "أورنج", gradient: "from-[#FF6B00] to-[#FF9500]", color: "text-[#FF6B00]", bg: "bg-[#FF6B00]", light: "bg-[#FFF0E6]", border: "border-[#FF6B00]" },
  umniah: { name: "أمنية", gradient: "from-[#00A651] to-[#007A3D]", color: "text-[#00A651]", bg: "bg-[#00A651]", light: "bg-[#E8F8EF]", border: "border-[#00A651]" },
};

const DEFAULT_IDS = new Set(["z1","z2","z3","z4","o1","o2","o3","o4","u1","u2","u3","u4"]);

export default function CardsScreen() {
  const { cards, updateCardPrice, updateCardName, addCard, deleteCard, addSale } = useApp();
  const [activeOp, setActiveOp] = useState<Operator>("zain");

  const [editCard, setEditCard] = useState<typeof cards[0] | null>(null);
  const [editMode, setEditMode] = useState<"price" | "name">("price");
  const [newPrice, setNewPrice] = useState("");
  const [newName, setNewName] = useState("");

  const [saleCard, setSaleCard] = useState<typeof cards[0] | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paidAmount, setPaidAmount] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addValue, setAddValue] = useState("");
  const [addPrice, setAddPrice] = useState("");

  const filtered = cards.filter((c) => c.operator === activeOp);

  const openEditPrice = (card: typeof cards[0]) => {
    setEditCard(card);
    setEditMode("price");
    setNewPrice(card.price.toString());
  };

  const openEditName = (card: typeof cards[0]) => {
    setEditCard(card);
    setEditMode("name");
    setNewName(card.name);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCard) return;
    if (editMode === "price") {
      const val = parseFloat(newPrice);
      if (isNaN(val) || val <= 0) { toast.error("أدخل سعر صحيح"); return; }
      updateCardPrice(editCard.id, val);
      toast.success(`تم تحديث سعر ${editCard.name}`);
    } else {
      if (!newName.trim()) { toast.error("أدخل اسم صحيح"); return; }
      updateCardName(editCard.id, newName.trim());
      toast.success("تم تحديث اسم البطاقة");
    }
    setEditCard(null);
  };

  const handleDirectSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleCard) return;
    if (!customerName.trim() || !customerPhone.trim()) { toast.error("يرجى تعبئة اسم ورقم العميل"); return; }
    const paid = parseFloat(paidAmount) || 0;
    const debt = Math.max(0, saleCard.price - paid);
    addSale({
      userId: Date.now().toString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      cardId: saleCard.id,
      cardName: saleCard.name,
      operator: saleCard.operator,
      cardValue: saleCard.value,
      paidAmount: paid,
      debt,
    });
    setSaleCard(null);
    if (debt > 0) toast.warning(`تم البيع. متبقي دين: ${debt.toFixed(2)} JD`);
    else toast.success("تم البيع نقداً بنجاح!");
  };

  const openSaleModal = (card: typeof cards[0]) => {
    setSaleCard(card);
    setCustomerName("");
    setCustomerPhone("");
    setPaidAmount(card.price.toString());
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) { toast.error("أدخل اسم البطاقة"); return; }
    const val = parseFloat(addValue);
    const pr = parseFloat(addPrice);
    if (isNaN(val) || val <= 0) { toast.error("أدخل قيمة صحيحة"); return; }
    if (isNaN(pr) || pr <= 0) { toast.error("أدخل سعر صحيح"); return; }
    addCard(activeOp, addName.trim(), val, pr);
    setAddOpen(false);
    setAddName(""); setAddValue(""); setAddPrice("");
    toast.success("تمت إضافة البطاقة");
  };

  const handleDelete = (card: typeof cards[0]) => {
    if (!DEFAULT_IDS.has(card.id)) {
      deleteCard(card.id);
      toast.success("تم حذف البطاقة");
    }
  };

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">إدارة البطاقات</h1>
          <p className="text-slate-500 mt-1 font-medium">إضافة وتعديل الأسعار والأسماء</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold shadow-md transition-all active:scale-95 bg-gradient-to-l ${OP_CFG[activeOp].gradient}`}
        >
          <Plus className="w-5 h-5" />
          إضافة بطاقة
        </button>
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
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${isActive ? `text-white ${cfg.bg} shadow-md` : "text-slate-500 hover:bg-slate-200"}`}
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
            const isDeletable = !DEFAULT_IDS.has(card.id);
            return (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Card Header - branded gradient */}
                <div className={`bg-gradient-to-l ${cfg.gradient} px-5 py-4 flex justify-between items-center`}>
                  <div>
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{cfg.name}</p>
                    <p className="text-white font-black text-xl mt-0.5">{card.name}</p>
                  </div>
                  <div className="text-right">
                    {isCustom && (
                      <p className="text-white/60 text-xs font-bold line-through">{card.value} JD</p>
                    )}
                    <p className="text-white font-black text-2xl">{card.price} JD</p>
                    {isCustom && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/20 text-white text-xs font-bold mt-1">
                        <Check className="w-3 h-3" /> سعر مخصص
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 flex gap-2">
                  <button
                    onClick={() => openEditName(card)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-colors border ${cfg.light} ${cfg.color} ${cfg.border} hover:bg-white`}
                  >
                    <Type className="w-4 h-4" />
                    تعديل الاسم
                  </button>
                  <button
                    onClick={() => openEditPrice(card)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-colors border ${cfg.light} ${cfg.color} ${cfg.border} hover:bg-white`}
                  >
                    <Edit2 className="w-4 h-4" />
                    تعديل السعر
                  </button>
                  <button
                    onClick={() => openSaleModal(card)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${cfg.bg} hover:opacity-90 shadow-md`}
                  >
                    <Zap className="w-4 h-4" />
                    بيع
                  </button>
                  {isDeletable && (
                    <button
                      onClick={() => handleDelete(card)}
                      className="w-10 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-50 transition-colors border border-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Card Dialog */}
      <Dialog.Root open={addOpen} onOpenChange={setAddOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 z-50 animate-in zoom-in-95 duration-200 focus:outline-none">
            <form onSubmit={handleAddCard}>
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className="text-2xl font-black text-slate-900">إضافة بطاقة جديدة</Dialog.Title>
                <Dialog.Close asChild>
                  <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </Dialog.Close>
              </div>

              <div className={`p-3 rounded-2xl mb-6 bg-gradient-to-l ${OP_CFG[activeOp].gradient} flex items-center gap-3`}>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <p className="text-white font-bold">بطاقة {OP_CFG[activeOp].name} جديدة</p>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">اسم البطاقة</label>
                  <input
                    autoFocus
                    type="text"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="مثال: زين 3 دينار"
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-3 text-base font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">القيمة (JD)</label>
                    <input
                      type="number" step="0.01" min="0.01"
                      value={addValue}
                      onChange={(e) => setAddValue(e.target.value)}
                      placeholder="3.00"
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 text-xl font-black text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors text-left"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">سعر البيع (JD)</label>
                    <input
                      type="number" step="0.01" min="0.01"
                      value={addPrice}
                      onChange={(e) => setAddPrice(e.target.value)}
                      placeholder="2.80"
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 text-xl font-black text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Dialog.Close asChild>
                  <button type="button" className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">إلغاء</button>
                </Dialog.Close>
                <button type="submit" className={`flex-[2] py-4 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-[0.98] bg-gradient-to-l ${OP_CFG[activeOp].gradient}`}>
                  إضافة البطاقة
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Edit Dialog (price or name) */}
      <Dialog.Root open={!!editCard} onOpenChange={(o) => !o && setEditCard(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 z-50 animate-in zoom-in-95 duration-200 focus:outline-none">
            {editCard && (
              <form onSubmit={handleSaveEdit}>
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-2xl font-black text-slate-900">
                    {editMode === "price" ? "تعديل السعر" : "تعديل الاسم"}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className={`p-4 rounded-2xl mb-6 bg-gradient-to-l ${OP_CFG[editCard.operator].gradient} border border-black/5`}>
                  <p className="text-white font-black text-lg">{editCard.name}</p>
                  <p className="text-white/70 text-sm font-medium mt-1">
                    {editMode === "price" ? `القيمة الأصلية: ${editCard.value} JD` : `السعر الحالي: ${editCard.price} JD`}
                  </p>
                </div>

                {editMode === "price" ? (
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
                ) : (
                  <div className="space-y-2 mb-8">
                    <label className="text-sm font-bold text-slate-700">الاسم الجديد</label>
                    <input
                      autoFocus
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 text-xl font-black text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <Dialog.Close asChild>
                    <button type="button" className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">إلغاء</button>
                  </Dialog.Close>
                  <button type="submit" className={`flex-[2] py-4 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-[0.98] bg-gradient-to-l ${OP_CFG[editCard.operator].gradient}`}>
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

                <div className={`flex justify-between items-center p-4 rounded-2xl mb-6 bg-gradient-to-l ${OP_CFG[saleCard.operator].gradient}`}>
                  <span className="font-bold text-white">{saleCard.name}</span>
                  <span className="text-xl font-black text-white">{saleCard.price} JD</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">اسم العميل</label>
                    <input
                      autoFocus type="text"
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
                  <button type="submit" className={`flex-[2] py-4 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-[0.98] bg-gradient-to-l ${OP_CFG[saleCard.operator].gradient}`}>
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
