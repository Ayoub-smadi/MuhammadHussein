import React, { useState } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Lock, User, ShieldAlert, ArrowRight, KeyRound, CheckCircle2 } from "lucide-react";

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const { adminLogin, userLogin, userRegister, updateAdminCredentials } = useApp();
  
  type View = "user-login" | "user-register" | "admin-login" | "admin-change";
  const [view, setView] = useState<View>("user-login");
  
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // change credentials form
  const [changeCurrent, setChangeCurrent] = useState("");
  const [changeNewName, setChangeNewName] = useState("");
  const [changeNewPw, setChangeNewPw] = useState("");
  const [changeConfirm, setChangeConfirm] = useState("");
  const [changeSuccess, setChangeSuccess] = useState(false);

  const reset = (...setters: React.Dispatch<React.SetStateAction<string>>[]) =>
    setters.forEach(s => s(""));

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) { setError("يرجى تعبئة جميع الحقول"); return; }
    const success = userLogin(phone, password);
    if (success) setLocation("/user");
    else setError("رقم الهاتف أو كلمة المرور غير صحيحة");
  };

  const handleUserRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !password) { setError("يرجى تعبئة جميع الحقول"); return; }
    const res = userRegister(name, phone, password);
    if (res.success) setLocation("/user");
    else setError(res.error || "حدث خطأ أثناء التسجيل");
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError("يرجى إدخال كلمة المرور"); return; }
    const success = adminLogin(password);
    if (success) setLocation("/admin");
    else setError("كلمة مرور المشرف غير صحيحة");
  };

  const handleChangeCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (changeNewPw !== changeConfirm) {
      setError("كلمة المرور الجديدة وتأكيدها غير متطابقتين");
      return;
    }
    const res = updateAdminCredentials(changeCurrent, changeNewName, changeNewPw);
    if (res.success) {
      setChangeSuccess(true);
    } else {
      setError(res.error || "حدث خطأ");
    }
  };

  const goToAdminLogin = () => {
    setView("admin-login");
    setError("");
    reset(setPassword, setChangeCurrent, setChangeNewName, setChangeNewPw, setChangeConfirm);
    setChangeSuccess(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}auth-bg.png`} 
          alt="" 
          className="w-full h-full object-cover opacity-[0.15]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-6 relative z-10"
      >
        <div className="glass-dark !bg-white/95 !border-slate-200/50 rounded-3xl p-8 shadow-2xl shadow-slate-200/50">
          
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-bl from-[#00C4B3] to-[#0088A3] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-cyan-500/30 transform rotate-3">
              <span className="text-white font-black text-3xl -rotate-3">H</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hussein</h1>
            <p className="text-slate-500 mt-2 font-medium">نظام بطاقات الاتصالات</p>
          </div>

          <AnimatePresence mode="wait">

            {/* ── User Login ── */}
            {view === "user-login" && (
              <motion.form 
                key="ul"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                onSubmit={handleUserLogin}
                className="space-y-4"
              >
                <div className="relative">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="tel" placeholder="رقم الهاتف (مثال: 0790000000)" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-left" dir="ltr"
                    value={phone} onChange={e => {setPhone(e.target.value); setError("");}}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="password" placeholder="كلمة المرور" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-left" dir="ltr"
                    value={password} onChange={e => {setPassword(e.target.value); setError("");}}
                  />
                </div>
                {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">{error}</p>}
                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-4 font-bold text-lg shadow-xl shadow-slate-900/20 transition-all active:scale-[0.98]">
                  تسجيل الدخول
                </button>
                <div className="pt-4 text-center space-y-4">
                  <button type="button" onClick={() => {setView("user-register"); setError(""); reset(setPhone, setPassword);}} className="text-slate-500 hover:text-emerald-600 font-bold transition-colors">
                    ليس لديك حساب؟ إنشاء حساب جديد
                  </button>
                  <div className="w-full h-px bg-slate-100" />
                  <button type="button" onClick={goToAdminLogin} className="flex items-center justify-center gap-2 w-full text-slate-400 hover:text-slate-700 font-medium transition-colors">
                    <ShieldAlert className="w-4 h-4" />
                    دخول المشرفين
                  </button>
                </div>
              </motion.form>
            )}

            {/* ── User Register ── */}
            {view === "user-register" && (
              <motion.form 
                key="ur"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                onSubmit={handleUserRegister}
                className="space-y-4"
              >
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" placeholder="الاسم الكامل" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-12 pl-4 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    value={name} onChange={e => {setName(e.target.value); setError("");}}
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="tel" placeholder="رقم الهاتف (مثال: 0790000000)" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-left" dir="ltr"
                    value={phone} onChange={e => {setPhone(e.target.value); setError("");}}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="password" placeholder="كلمة المرور" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-left" dir="ltr"
                    value={password} onChange={e => {setPassword(e.target.value); setError("");}}
                  />
                </div>
                {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">{error}</p>}
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-4 font-bold text-lg shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98]">
                  إنشاء الحساب
                </button>
                <div className="pt-4 text-center">
                  <button type="button" onClick={() => {setView("user-login"); setError("");}} className="flex items-center justify-center gap-2 w-full text-slate-500 hover:text-slate-800 font-bold transition-colors">
                    <ArrowRight className="w-4 h-4" />
                    العودة لتسجيل الدخول
                  </button>
                </div>
              </motion.form>
            )}

            {/* ── Admin Login ── */}
            {view === "admin-login" && (
              <motion.form 
                key="al"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                onSubmit={handleAdminLogin}
                className="space-y-4"
              >
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    autoFocus
                    type="password" placeholder="كلمة سر المشرف" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all text-left" dir="ltr"
                    value={password} onChange={e => {setPassword(e.target.value); setError("");}}
                  />
                </div>
                {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">{error}</p>}
                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-4 font-bold text-lg shadow-xl shadow-slate-900/20 transition-all active:scale-[0.98]">
                  دخول المشرف
                </button>

                {/* Change credentials option */}
                <button
                  type="button"
                  onClick={() => {
                    setView("admin-change");
                    setError("");
                    reset(setPassword, setChangeCurrent, setChangeNewName, setChangeNewPw, setChangeConfirm);
                    setChangeSuccess(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:text-[#0088A3] hover:border-[#00C4B3]/40 font-medium transition-colors text-sm"
                >
                  <KeyRound className="w-4 h-4" />
                  تغيير اسم وكلمة سر المشرف
                </button>

                <div className="pt-2 text-center">
                  <button type="button" onClick={() => {setView("user-login"); setError(""); setPassword("");}} className="flex items-center justify-center gap-2 w-full text-slate-500 hover:text-slate-800 font-bold transition-colors">
                    <ArrowRight className="w-4 h-4" />
                    دخول الزبائن
                  </button>
                </div>
              </motion.form>
            )}

            {/* ── Admin Change Credentials ── */}
            {view === "admin-change" && (
              <motion.div
                key="ac"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              >
                {changeSuccess ? (
                  <div className="flex flex-col items-center gap-4 py-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-xl font-black text-slate-900">تم التغيير بنجاح!</p>
                    <p className="text-slate-500 font-medium text-center">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة</p>
                    <button
                      onClick={goToAdminLogin}
                      className="mt-2 w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-4 font-bold text-lg transition-all active:scale-[0.98]"
                    >
                      الذهاب لتسجيل الدخول
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleChangeCredentials} className="space-y-4">
                    <p className="text-sm font-bold text-slate-500 text-center mb-2">تغيير بيانات حساب المشرف</p>

                    {/* Current password */}
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        autoFocus
                        type="password" placeholder="كلمة المرور الحالية" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#00C4B3] transition-all text-left" dir="ltr"
                        value={changeCurrent} onChange={e => {setChangeCurrent(e.target.value); setError("");}}
                      />
                    </div>

                    <div className="w-full h-px bg-slate-100" />

                    {/* New name */}
                    <div className="relative">
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="text" placeholder="الاسم الجديد للمشرف" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-12 pl-4 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#00C4B3] transition-all"
                        value={changeNewName} onChange={e => {setChangeNewName(e.target.value); setError("");}}
                      />
                    </div>

                    {/* New password */}
                    <div className="relative">
                      <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="password" placeholder="كلمة المرور الجديدة (6 أحرف+)" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#00C4B3] transition-all text-left" dir="ltr"
                        value={changeNewPw} onChange={e => {setChangeNewPw(e.target.value); setError("");}}
                      />
                    </div>

                    {/* Confirm new password */}
                    <div className="relative">
                      <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="password" placeholder="تأكيد كلمة المرور الجديدة" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#00C4B3] transition-all text-left" dir="ltr"
                        value={changeConfirm} onChange={e => {setChangeConfirm(e.target.value); setError("");}}
                      />
                    </div>

                    {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">{error}</p>}

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-l from-[#00C4B3] to-[#0088A3] hover:opacity-90 text-white rounded-xl py-4 font-bold text-lg shadow-xl shadow-cyan-500/20 transition-all active:scale-[0.98]"
                    >
                      حفظ التغييرات
                    </button>

                    <button type="button" onClick={goToAdminLogin} className="flex items-center justify-center gap-2 w-full text-slate-500 hover:text-slate-800 font-bold transition-colors pt-1">
                      <ArrowRight className="w-4 h-4" />
                      رجوع لدخول المشرف
                    </button>
                  </form>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
