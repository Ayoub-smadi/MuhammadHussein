import React from "react";
import { useApp } from "@/context/AppContext";
import { User, Phone, LogOut, ShieldAlert, Award, Wallet } from "lucide-react";
import { useLocation } from "wouter";

export default function AccountScreen() {
  const [, setLocation] = useLocation();
  const { currentUser, userLogout } = useApp();
  
  if (!currentUser) return null;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      
      <div className="bg-slate-900 rounded-3xl p-8 text-white text-center relative overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none" />
        
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl font-black shadow-lg shadow-emerald-500/30 relative z-10 border-4 border-slate-900">
          {currentUser.name.charAt(0)}
        </div>
        <h1 className="text-3xl font-black relative z-10">{currentUser.name}</h1>
        <p className="text-slate-400 font-mono mt-2 text-lg relative z-10 flex items-center justify-center gap-2">
          <Phone className="w-4 h-4" /> {currentUser.phone}
        </p>
      </div>

      {currentUser.debt > 0 ? (
        <div className="bg-red-50 rounded-3xl p-6 border-2 border-red-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-red-800">الرصيد المستحق (دين)</p>
                <p className="text-sm font-medium text-red-500">يرجى تسديد المبلغ المتبقي</p>
              </div>
            </div>
            <div className="text-3xl font-black text-red-600" dir="ltr">{currentUser.debt.toFixed(2)} JD</div>
          </div>
          <button
            onClick={() => setLocation("/user/payment")}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black transition-colors shadow-md shadow-red-600/30 active:scale-[0.98]"
          >
            <Wallet className="w-5 h-5" />
            اذهب للدفع
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-emerald-800">حسابك خالي من الديون</p>
            <p className="text-sm font-medium text-emerald-600">شكراً لالتزامك بالدفع</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center gap-4 text-slate-700">
          <User className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs font-bold text-slate-400 mb-0.5">الاسم</p>
            <p className="font-bold">{currentUser.name}</p>
          </div>
        </div>
        <div className="p-4 border-b border-slate-50 flex items-center gap-4 text-slate-700">
          <Phone className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs font-bold text-slate-400 mb-0.5">رقم الهاتف</p>
            <p className="font-bold font-mono" dir="ltr">{currentUser.phone}</p>
          </div>
        </div>
        <div className="p-4 bg-slate-50">
          <button 
            onClick={() => { userLogout(); setLocation("/auth"); }}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </div>

    </div>
  );
}
