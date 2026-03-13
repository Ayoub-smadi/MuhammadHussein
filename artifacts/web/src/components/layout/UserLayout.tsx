import React from "react";
import { Link, useLocation } from "wouter";
import { CreditCard, Clock, User, LogOut, Moon, Sun, MessageCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function UserLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { userLogout, currentUser, isDark, toggleDark, storeSettings } = useApp();
  const storeName = storeSettings.storeName || "Hussein";
  const storeLetter = storeName.charAt(0).toUpperCase();

  const handleLogout = () => {
    userLogout();
    setLocation("/auth");
  };

  const navItems = [
    { href: "/user", icon: CreditCard, label: "شراء بطاقة" },
    { href: "/user/purchases", icon: Clock, label: "طلباتي" },
    { href: "/user/account", icon: User, label: "حسابي" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-[72px] md:pb-0">
      {/* Desktop Topbar */}
      <header className="hidden md:flex bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm h-16 items-center px-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-bl from-[#00C4B3] to-[#0088A3] flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-white font-black text-base">{storeLetter}</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-wide">{storeName}</h1>
        </div>
        
        <nav className="flex-1 flex justify-center gap-2 px-8">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-full cursor-pointer transition-all duration-200
                    ${isActive 
                      ? "bg-slate-900 text-white shadow-md font-bold" 
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-medium"}
                  `}
                >
                  <item.icon size={18} className={isActive ? "" : "opacity-70"} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-500">{currentUser?.name}</span>
          <button
            onClick={toggleDark}
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 transition-all"
            title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 font-medium cursor-pointer"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-bl from-[#00C4B3] to-[#0088A3] flex items-center justify-center shadow-md">
            <span className="text-white font-black text-sm">{storeLetter}</span>
          </div>
          <h1 className="text-lg font-black text-slate-800 tracking-wide">{storeName}</h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleDark} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-full transition-colors">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto md:p-6">
        {children}
      </main>

      {/* WhatsApp Floating Button */}
      {storeSettings.whatsappPhone && (
        <a
          href={`https://wa.me/${storeSettings.whatsappPhone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-[88px] left-4 md:bottom-6 md:left-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          title="تواصل معنا على واتساب"
        >
          <MessageCircle className="w-7 h-7 fill-white stroke-none" />
        </a>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-[72px] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-40 px-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div className="flex flex-col items-center justify-center w-full h-full gap-1 cursor-pointer">
                <div className={`
                  p-1.5 rounded-full transition-all duration-300
                  ${isActive ? "bg-emerald-100 text-emerald-600" : "text-slate-400"}
                `}>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] transition-all duration-300 ${isActive ? "font-bold text-emerald-700" : "font-medium text-slate-500"}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
