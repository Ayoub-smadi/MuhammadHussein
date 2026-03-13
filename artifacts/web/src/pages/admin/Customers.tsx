import React, { useState, useMemo } from "react";
import { useApp, AppUser } from "@/context/AppContext";
import { Search, UserCircle, Edit2, ShieldAlert, Trash2, X, AlertTriangle, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";

type EditField = "name" | "phone" | "password" | "debt";

export default function CustomersScreen() {
  const { users, updateUser, updateUserDebt, deleteUser } = useApp();
  const [search, setSearch] = useState("");
  
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [editField, setEditField] = useState<EditField | null>(null);
  const [editVal, setEditVal] = useState("");
  
  const [addDebtAmt, setAddDebtAmt] = useState("");

  const filtered = useMemo(() =>
    users.filter((u) => u.name.includes(search) || u.phone.includes(search)),
    [users, search]
  );

  const openEdit = (field: EditField) => {
    if (!selectedUser) return;
    setEditField(field);
    setEditVal(
      field === "debt" ? selectedUser.debt.toString() :
      field === "name" ? selectedUser.name :
      field === "phone" ? selectedUser.phone : ""
    );
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !editField) return;
    
    if (editField === "debt") {
      const val = parseFloat(editVal);
      if (isNaN(val) || val < 0) { toast.error("أدخل قيمة صحيحة"); return; }
      updateUserDebt(selectedUser.id, val);
      setSelectedUser({ ...selectedUser, debt: val });
    } else {
      if (!editVal.trim()) { toast.error("الحقل مطلوب"); return; }
      updateUser(selectedUser.id, { [editField]: editVal.trim() });
      setSelectedUser({ ...selectedUser, [editField]: editVal.trim() });
    }
    
    setEditField(null);
    toast.success("تم التحديث بنجاح");
  };

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const amt = parseFloat(addDebtAmt);
    if (isNaN(amt) || amt <= 0) { toast.error("أدخل مبلغ صحيح"); return; }
    
    const newDebt = selectedUser.debt + amt;
    updateUserDebt(selectedUser.id, newDebt);
    setSelectedUser({ ...selectedUser, debt: newDebt });
    setAddDebtAmt("");
    toast.success(`تم إضافة ${amt.toFixed(2)} JD. المجموع: ${newDebt.toFixed(2)} JD`);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    if (window.confirm(`هل أنت متأكد من حذف حساب "${selectedUser.name}" نهائياً؟`)) {
      deleteUser(selectedUser.id);
      setSelectedUser(null);
      toast.success("تم حذف الحساب");
    }
  };

  const EDIT_LABELS: Record<EditField, string> = {
    name: "الاسم الكامل", phone: "رقم الهاتف", password: "كلمة المرور", debt: "الدين المستحق (JD)",
  };

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-start">
      
      {/* Main List Area */}
      <div className={`flex-1 w-full transition-all ${selectedUser ? 'hidden md:block md:w-1/2 lg:w-2/3' : 'block'}`}>
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">العملاء</h1>
          <p className="text-slate-500 mt-1 font-medium">إدارة الزبائن وحساباتهم والديون ({users.length})</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو رقم الهاتف..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pr-12 pl-4 py-3.5 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
          />
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center text-slate-400">
                <UserCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-bold">لا توجد نتائج</p>
              </motion.div>
            ) : (
              filtered.map((u) => (
                <motion.div
                  key={u.id}
                  layout
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedUser(u)}
                  className={`
                    p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between
                    ${selectedUser?.id === u.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${selectedUser?.id === u.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className={`font-bold text-base ${selectedUser?.id === u.id ? 'text-white' : 'text-slate-900'}`}>{u.name}</p>
                      <p className={`text-sm font-mono mt-0.5 ${selectedUser?.id === u.id ? 'text-slate-300' : 'text-slate-500'}`} dir="ltr">{u.phone}</p>
                    </div>
                  </div>
                  {u.debt > 0 && (
                    <div className={`px-3 py-1 rounded-lg text-sm font-bold ${selectedUser?.id === u.id ? 'bg-red-500/20 text-red-300' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                      دين: {u.debt.toFixed(1)} JD
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedUser && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-1/2 lg:w-1/3 shrink-0 sticky top-24 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          <div className="bg-slate-900 p-6 pt-8 text-white relative">
            <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors md:hidden">
              <X size={16} />
            </button>
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-emerald-500/30 mb-4">
              {selectedUser.name.charAt(0)}
            </div>
            <h2 className="text-2xl font-black">{selectedUser.name}</h2>
            <p className="text-slate-400 font-mono mt-1" dir="ltr">{selectedUser.phone}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
            
            {/* Info */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">بيانات الحساب</h3>
              <div className="space-y-2">
                {(["name", "phone", "password"] as EditField[]).map((f) => (
                  <div key={f} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
                    <div>
                      <p className="text-xs font-bold text-slate-400 mb-0.5">{EDIT_LABELS[f]}</p>
                      <p className="font-bold text-slate-800">{f === 'password' ? '••••••' : String(selectedUser[f as keyof AppUser])}</p>
                    </div>
                    <button onClick={() => openEdit(f)} className="p-2 text-slate-400 hover:text-emerald-600 bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                      <Edit2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Debt */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">الديون المالية</h3>
              
              <div className={`p-5 rounded-2xl border-2 mb-4 flex justify-between items-center ${selectedUser.debt > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <div>
                  <p className={`text-sm font-bold mb-1 ${selectedUser.debt > 0 ? 'text-red-500' : 'text-emerald-600'}`}>الرصيد المستحق</p>
                  <p className={`text-3xl font-black ${selectedUser.debt > 0 ? 'text-red-600' : 'text-emerald-700'}`}>{selectedUser.debt.toFixed(2)} <span className="text-base">JD</span></p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => openEdit('debt')} className="px-3 py-1.5 bg-white text-slate-600 rounded-lg text-xs font-bold shadow-sm hover:shadow">تعديل</button>
                  {selectedUser.debt > 0 && (
                    <button 
                      onClick={() => {
                        if(window.confirm("تأكيد تصفير الدين؟")) {
                          updateUserDebt(selectedUser.id, 0);
                          setSelectedUser({...selectedUser, debt: 0});
                        }
                      }} 
                      className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-emerald-600"
                    >
                      تصفير
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleAddDebt} className="flex gap-2">
                <input 
                  type="number" step="0.01" min="0.01" placeholder="مبلغ دين جديد..." value={addDebtAmt} onChange={e=>setAddDebtAmt(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors" dir="ltr"
                />
                <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors whitespace-nowrap">
                  إضافة دين
                </button>
              </form>
            </section>

            <div className="pt-4 border-t border-slate-100">
              <button 
                onClick={handleDeleteUser}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
              >
                <Trash2 size={18} />
                حذف الحساب نهائياً
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Edit Modal */}
      <Dialog.Root open={!!editField} onOpenChange={(o) => !o && setEditField(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-sm bg-white rounded-3xl shadow-2xl p-6 z-50 animate-in zoom-in-95 focus:outline-none">
            <form onSubmit={handleSaveEdit}>
              <h3 className="text-xl font-black text-slate-900 mb-6">{editField ? EDIT_LABELS[editField] : ''}</h3>
              <input
                autoFocus
                type={editField === 'debt' || editField === 'phone' ? 'number' : editField === 'password' ? 'password' : 'text'}
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors mb-6 text-left"
                dir={editField !== 'name' ? 'ltr' : 'rtl'}
              />
              <div className="flex gap-3">
                <Dialog.Close asChild>
                  <button type="button" className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold">إلغاء</button>
                </Dialog.Close>
                <button type="submit" className="flex-[2] py-3 rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all">حفظ</button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
