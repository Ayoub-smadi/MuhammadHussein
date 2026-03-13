import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  CreditCard, 
  Bell, 
  Users, 
  FileText, 
  LogOut,
  Menu,
  X,
  KeyRound,
  CheckCircle2,
  Lock,
  User
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { adminLogout, pendingRequestsCount, adminName, updateAdminCredentials } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [changeCurrent, setChangeCurrent] = useState("");
  const [changeNewName, setChangeNewName] = useState("");
  const [changeNewPw, setChangeNewPw] = useState("");
  const [changeConfirm, setChangeConfirm] = useState("");
  const [changeError, setChangeError] = useState("");
  const [changeSuccess, setChangeSuccess] = useState(false);

  const handleLogout = () => {
    adminLogout();
    setLocation("/auth");
  };

  const openChangePw = () => {
    setChangeCurrent(""); setChangeNewName(""); setChangeNewPw(""); setChangeConfirm("");
    setChangeError(""); setChangeSuccess(false);
    setShowChangePw(true);
    setIsMobileMenuOpen(false);
  };

  const handleChangeCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError("");
    if (changeNewPw !== changeConfirm) {
      setChangeError("كلمة المرور الجديدة وتأكيدها غير متطابقتين");
      return;
    }
    const res = updateAdminCredentials(changeCurrent, changeNewName, changeNewPw);
    if (res.success) setChangeSuccess(true);
    else setChangeError(res.error || "حدث خطأ");
  };

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "الرئيسية" },
    { href: "/admin/cards", icon: CreditCard, label: "البطاقات" },
    { href: "/admin/requests", icon: Bell, label: "الطلبات", badge: pendingRequestsCount },
    { href: "/admin/customers", icon: Users, label: "العملاء" },
    { href: "/admin/reports", icon: FileText, label: "التقارير" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      <div className="p-6 pb-8 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-bl from-[#00C4B3] to-[#0088A3] flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-white font-black text-lg">{adminName.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide">{adminName}</h1>
            <p className="text-xs font-medium text-slate-400">لوحة تحكم الأدمن</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
              <div
                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200
                  ${isActive 
                    ? "bg-emerald-500/10 text-emerald-400 font-bold shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]" 
                    : "hover:bg-slate-800 hover:text-white font-medium"}
                `}
              >
                <item.icon size={20} className={isActive ? "text-emerald-400" : "opacity-80"} />
                <span className="flex-1 text-base">{item.label}</span>
                {item.badge ? (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg shadow-red-500/30">
                    {item.badge}
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <button
          onClick={openChangePw}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all duration-200 font-medium cursor-pointer"
        >
          <KeyRound size={20} />
          <span className="text-base">تغيير كلمة المرور</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 font-medium cursor-pointer"
        >
          <LogOut size={20} />
          <span className="text-base">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="hidden md:block w-72 h-screen sticky top-0 shrink-0 shadow-2xl z-20">
        <SidebarContent />
      </aside>

      <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-bl from-[#00C4B3] to-[#0088A3] flex items-center justify-center shadow-md">
            <span className="text-white font-black text-sm">{adminName.charAt(0)}</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-wide">{adminName}</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-slate-900/80 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 w-3/4 max-w-sm h-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <SidebarContent />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full min-w-0">
        {children}
      </main>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showChangePw && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4"
            onClick={() => setShowChangePw(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              {changeSuccess ? (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-xl font-black text-slate-900">تم التغيير بنجاح!</p>
                  <p className="text-slate-500 font-medium text-center">تم تحديث بيانات حساب المشرف</p>
                  <button
                    onClick={() => setShowChangePw(false)}
                    className="mt-2 w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3.5 font-bold text-lg transition-all"
                  >
                    إغلاق
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-slate-900">تغيير كلمة المرور</h2>
                    <button onClick={() => setShowChangePw(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                      <X size={20} className="text-slate-400" />
                    </button>
                  </div>
                  <form onSubmit={handleChangeCredentials} className="space-y-4">
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        autoFocus
                        type="password" placeholder="كلمة المرور الحالية"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#00C4B3] transition-all text-left" dir="ltr"
                        value={changeCurrent} onChange={e => { setChangeCurrent(e.target.value); setChangeError(""); }}
                      />
                    </div>
                    <div className="w-full h-px bg-slate-100" />
                    <div className="relative">
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text" placeholder="الاسم الجديد (اتركه فارغاً للإبقاء على الاسم الحالي)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-12 pl-4 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#00C4B3] transition-all"
                        value={changeNewName} onChange={e => { setChangeNewName(e.target.value); setChangeError(""); }}
                      />
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="password" placeholder="كلمة المرور الجديدة (6 أحرف+)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#00C4B3] transition-all text-left" dir="ltr"
                        value={changeNewPw} onChange={e => { setChangeNewPw(e.target.value); setChangeError(""); }}
                      />
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="password" placeholder="تأكيد كلمة المرور الجديدة"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#00C4B3] transition-all text-left" dir="ltr"
                        value={changeConfirm} onChange={e => { setChangeConfirm(e.target.value); setChangeError(""); }}
                      />
                    </div>
                    {changeError && <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">{changeError}</p>}
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-l from-[#00C4B3] to-[#0088A3] hover:opacity-90 text-white rounded-xl py-4 font-bold text-lg shadow-xl shadow-cyan-500/20 transition-all active:scale-[0.98]"
                    >
                      حفظ التغييرات
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
