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
  X
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { adminLogout, pendingRequestsCount } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    adminLogout();
    setLocation("/auth");
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
            <span className="text-white font-black text-lg">H</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide">Hussein</h1>
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

      <div className="p-4 border-t border-slate-800">
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
            <span className="text-white font-black text-sm">H</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-wide">Hussein</h1>
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
    </div>
  );
}
