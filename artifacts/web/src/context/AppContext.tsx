import React, { createContext, useCallback, useContext, useState, useEffect } from "react";

export type Operator = "zain" | "orange" | "umniah";

export type CardType = {
  id: string;
  operator: Operator;
  name: string;
  value: number;
  price: number;
};

export type AppUser = {
  id: string;
  name: string;
  phone: string;
  password: string;
  debt: number;
};

export type Sale = {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  cardId: string;
  cardName: string;
  operator: Operator;
  cardValue: number;
  paidAmount: number;
  debt: number;
  saleDate: string;
};

export type CardRequest = {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  cardId: string;
  cardName: string;
  operator: Operator;
  cardValue: number;
  cardPrice: number;
  status: "pending" | "approved" | "rejected";
  requestDate: string;
  resolvedDate?: string;
  adminNote?: string;
};

const DEFAULT_CARDS: CardType[] = [
  { id: "z1", operator: "zain", name: "زين 1 دينار", value: 1, price: 1 },
  { id: "z2", operator: "zain", name: "زين 2 دينار", value: 2, price: 2 },
  { id: "z3", operator: "zain", name: "زين 5 دينار", value: 5, price: 5 },
  { id: "z4", operator: "zain", name: "زين 10 دينار", value: 10, price: 10 },
  { id: "o1", operator: "orange", name: "أورنج 1 دينار", value: 1, price: 1 },
  { id: "o2", operator: "orange", name: "أورنج 2 دينار", value: 2, price: 2 },
  { id: "o3", operator: "orange", name: "أورنج 5 دينار", value: 5, price: 5 },
  { id: "o4", operator: "orange", name: "أورنج 10 دينار", value: 10, price: 10 },
  { id: "u1", operator: "umniah", name: "أمنية 1 دينار", value: 1, price: 1 },
  { id: "u2", operator: "umniah", name: "أمنية 2 دينار", value: 2, price: 2 },
  { id: "u3", operator: "umniah", name: "أمنية 5 دينار", value: 5, price: 5 },
  { id: "u4", operator: "umniah", name: "أمنية 10 دينار", value: 10, price: 10 },
];

const DEFAULT_ADMIN = { name: "Hussein", password: "Hussein123" };

const KEYS = {
  users: "@hussein_users_web",
  sales: "@hussein_sales_web",
  requests: "@hussein_requests_web",
  cardPrices: "@hussein_prices_web",
  cardNames: "@hussein_cardnames_web",
  customCards: "@hussein_customcards_web",
  auth: "@hussein_auth_web",
  adminCreds: "@hussein_admin_creds_web",
  cardStock: "@hussein_cardstock_web",
  stockAlerts: "@hussein_stockalerts_web",
  theme: "@hussein_theme_web",
};

type AppContextType = {
  adminLoggedIn: boolean;
  adminName: string;
  currentUser: AppUser | null;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  updateAdminCredentials: (currentPw: string, newName: string, newPw: string) => { success: boolean; error?: string };
  userLogin: (phone: string, password: string) => boolean;
  userRegister: (name: string, phone: string, password: string) => { success: boolean; error?: string };
  userLogout: () => void;

  cards: CardType[];
  updateCardPrice: (cardId: string, newPrice: number) => void;
  updateCardName: (cardId: string, newName: string) => void;
  addCard: (operator: Operator, name: string, value: number, price: number) => void;
  deleteCard: (cardId: string) => void;

  cardStock: Record<string, number>;
  setCardStock: (cardId: string, qty: number) => void;
  adjustStock: (cardId: string, delta: number) => void;
  stockAlerts: Record<string, number>;
  setStockAlert: (cardId: string, threshold: number) => void;
  getLowStockCards: () => (CardType & { stock: number; threshold: number })[];

  users: AppUser[];
  updateUserDebt: (userId: string, debt: number) => void;
  updateUser: (userId: string, updates: Partial<AppUser>) => void;
  deleteUser: (userId: string) => void;
  getDebtCustomers: () => (AppUser & { daysSinceLastPurchase: number })[];

  sales: Sale[];
  addSale: (sale: Omit<Sale, "id" | "saleDate">) => void;
  deleteSale: (id: string) => void;
  getUserSales: (userId: string) => Sale[];

  requests: CardRequest[];
  addRequest: (req: Omit<CardRequest, "id" | "requestDate" | "status">) => void;
  approveRequest: (reqId: string) => void;
  rejectRequest: (reqId: string, note?: string) => void;
  pendingRequestsCount: number;
  getUserRequests: (userId: string) => CardRequest[];

  getTotalRevenue: () => number;
  getTotalDebt: () => number;
  getOperatorSales: (operator: Operator) => number;
  getTodayRevenue: () => number;
  getTodaySalesCount: () => number;

  isDark: boolean;
  toggleDark: () => void;

  isReady: boolean;
};

const AppContext = createContext<AppContextType | null>(null);

function getLocalData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminCreds, setAdminCreds] = useState(DEFAULT_ADMIN);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [requests, setRequests] = useState<CardRequest[]>([]);
  const [cardPrices, setCardPrices] = useState<Record<string, number>>({});
  const [cardNames, setCardNames] = useState<Record<string, string>>({});
  const [customCards, setCustomCards] = useState<CardType[]>([]);
  const [cardStock, setCardStockState] = useState<Record<string, number>>({});
  const [stockAlerts, setStockAlertsState] = useState<Record<string, number>>({});
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setUsers(getLocalData(KEYS.users, []));
    setSales(getLocalData(KEYS.sales, []));
    setRequests(getLocalData(KEYS.requests, []));
    setCardPrices(getLocalData(KEYS.cardPrices, {}));
    setCardNames(getLocalData(KEYS.cardNames, {}));
    setCustomCards(getLocalData(KEYS.customCards, []));
    setAdminCreds(getLocalData(KEYS.adminCreds, DEFAULT_ADMIN));
    setCardStockState(getLocalData(KEYS.cardStock, {}));
    setStockAlertsState(getLocalData(KEYS.stockAlerts, {}));

    const savedTheme = getLocalData<boolean>(KEYS.theme, false);
    setIsDark(savedTheme);
    if (savedTheme) {
      document.documentElement.classList.add("dark");
    }

    const authState = getLocalData<{type: 'admin' | 'user', id?: string} | null>(KEYS.auth, null);
    if (authState?.type === 'admin') {
      setAdminLoggedIn(true);
    } else if (authState?.type === 'user' && authState.id) {
      const u = getLocalData<AppUser[]>(KEYS.users, []).find(u => u.id === authState.id);
      if (u) setCurrentUser(u);
    }

    setIsReady(true);
  }, []);

  const persist = useCallback((key: string, data: unknown) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, []);

  const cards: CardType[] = [
    ...DEFAULT_CARDS.map((c) => ({
      ...c,
      price: cardPrices[c.id] ?? c.price,
      name: cardNames[c.id] ?? c.name,
    })),
    ...customCards.map((c) => ({
      ...c,
      price: cardPrices[c.id] ?? c.price,
      name: cardNames[c.id] ?? c.name,
    })),
  ];

  const adminLogin = useCallback((pw: string) => {
    const stored = getLocalData(KEYS.adminCreds, DEFAULT_ADMIN);
    if (pw === stored.password) {
      setAdminLoggedIn(true);
      persist(KEYS.auth, { type: 'admin' });
      return true;
    }
    return false;
  }, [persist]);

  const adminLogout = useCallback(() => {
    setAdminLoggedIn(false);
    localStorage.removeItem(KEYS.auth);
  }, []);

  const updateAdminCredentials = useCallback((currentPw: string, newName: string, newPw: string) => {
    const stored = getLocalData(KEYS.adminCreds, DEFAULT_ADMIN);
    if (currentPw !== stored.password) {
      return { success: false, error: "كلمة المرور الحالية غير صحيحة" };
    }
    if (!newName.trim()) {
      return { success: false, error: "يرجى إدخال الاسم" };
    }
    if (newPw.length < 6) {
      return { success: false, error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" };
    }
    const updated = { name: newName.trim(), password: newPw };
    setAdminCreds(updated);
    persist(KEYS.adminCreds, updated);
    return { success: true };
  }, [persist]);

  const userLogin = useCallback((phone: string, pw: string) => {
    const user = users.find((u) => u.phone === phone && u.password === pw);
    if (user) {
      setCurrentUser(user);
      persist(KEYS.auth, { type: 'user', id: user.id });
      return true;
    }
    return false;
  }, [users, persist]);

  const userRegister = useCallback((name: string, phone: string, pw: string) => {
    if (users.find((u) => u.phone === phone)) {
      return { success: false, error: "رقم الهاتف مسجل مسبقاً" };
    }
    const newUser: AppUser = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      phone: phone.trim(),
      password: pw,
      debt: 0,
    };
    const updated = [...users, newUser];
    setUsers(updated);
    persist(KEYS.users, updated);
    setCurrentUser(newUser);
    persist(KEYS.auth, { type: 'user', id: newUser.id });
    return { success: true };
  }, [users, persist]);

  const userLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(KEYS.auth);
  }, []);

  const updateCardPrice = useCallback((cardId: string, price: number) => {
    const updated = { ...cardPrices, [cardId]: price };
    setCardPrices(updated);
    persist(KEYS.cardPrices, updated);
  }, [cardPrices, persist]);

  const updateCardName = useCallback((cardId: string, name: string) => {
    const updated = { ...cardNames, [cardId]: name };
    setCardNames(updated);
    persist(KEYS.cardNames, updated);
  }, [cardNames, persist]);

  const addCard = useCallback((operator: Operator, name: string, value: number, price: number) => {
    const newCard: CardType = {
      id: "custom_" + Date.now().toString() + Math.random().toString(36).substring(2, 6),
      operator,
      name: name.trim(),
      value,
      price,
    };
    const updated = [...customCards, newCard];
    setCustomCards(updated);
    persist(KEYS.customCards, updated);
  }, [customCards, persist]);

  const deleteCard = useCallback((cardId: string) => {
    const updated = customCards.filter((c) => c.id !== cardId);
    setCustomCards(updated);
    persist(KEYS.customCards, updated);
    const updatedPrices = { ...cardPrices };
    delete updatedPrices[cardId];
    setCardPrices(updatedPrices);
    persist(KEYS.cardPrices, updatedPrices);
    const updatedNames = { ...cardNames };
    delete updatedNames[cardId];
    setCardNames(updatedNames);
    persist(KEYS.cardNames, updatedNames);
    const updatedStock = { ...cardStock };
    delete updatedStock[cardId];
    setCardStockState(updatedStock);
    persist(KEYS.cardStock, updatedStock);
  }, [customCards, cardPrices, cardNames, cardStock, persist]);

  const setCardStock = useCallback((cardId: string, qty: number) => {
    const updated = { ...cardStock, [cardId]: Math.max(0, qty) };
    setCardStockState(updated);
    persist(KEYS.cardStock, updated);
  }, [cardStock, persist]);

  const adjustStock = useCallback((cardId: string, delta: number) => {
    const current = cardStock[cardId] ?? 0;
    const updated = { ...cardStock, [cardId]: Math.max(0, current + delta) };
    setCardStockState(updated);
    persist(KEYS.cardStock, updated);
  }, [cardStock, persist]);

  const setStockAlert = useCallback((cardId: string, threshold: number) => {
    const updated = { ...stockAlerts, [cardId]: Math.max(0, threshold) };
    setStockAlertsState(updated);
    persist(KEYS.stockAlerts, updated);
  }, [stockAlerts, persist]);

  const getLowStockCards = useCallback(() => {
    return cards
      .filter(c => {
        const stock = cardStock[c.id] ?? 0;
        const threshold = stockAlerts[c.id] ?? 5;
        return stock <= threshold;
      })
      .map(c => ({
        ...c,
        stock: cardStock[c.id] ?? 0,
        threshold: stockAlerts[c.id] ?? 5,
      }));
  }, [cards, cardStock, stockAlerts]);

  const updateUserDebt = useCallback((userId: string, debt: number) => {
    const updated = users.map((u) => u.id === userId ? { ...u, debt } : u);
    setUsers(updated);
    persist(KEYS.users, updated);
    if (currentUser?.id === userId) setCurrentUser((u) => u ? { ...u, debt } : u);
  }, [users, currentUser, persist]);

  const updateUser = useCallback((userId: string, updates: Partial<AppUser>) => {
    const updated = users.map((u) => u.id === userId ? { ...u, ...updates } : u);
    setUsers(updated);
    persist(KEYS.users, updated);
    if (currentUser?.id === userId) setCurrentUser((u) => u ? { ...u, ...updates } : u);
  }, [users, currentUser, persist]);

  const deleteUser = useCallback((userId: string) => {
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    persist(KEYS.users, updated);
    if (currentUser?.id === userId) {
      setCurrentUser(null);
      localStorage.removeItem(KEYS.auth);
    }
  }, [users, currentUser, persist]);

  const getDebtCustomers = useCallback(() => {
    const now = Date.now();
    return users
      .filter(u => u.debt > 0)
      .map(u => {
        const lastSale = sales
          .filter(s => s.userId === u.id || s.customerPhone === u.phone)
          .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())[0];
        const daysSince = lastSale
          ? Math.floor((now - new Date(lastSale.saleDate).getTime()) / 86400000)
          : 999;
        return { ...u, daysSinceLastPurchase: daysSince };
      })
      .sort((a, b) => b.debt - a.debt);
  }, [users, sales]);

  const addSale = useCallback((sale: Omit<Sale, "id" | "saleDate">) => {
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      saleDate: new Date().toISOString(),
    };
    const updated = [newSale, ...sales];
    setSales(updated);
    persist(KEYS.sales, updated);
    if (cardStock[sale.cardId] !== undefined) {
      const updatedStock = { ...cardStock, [sale.cardId]: Math.max(0, (cardStock[sale.cardId] ?? 0) - 1) };
      setCardStockState(updatedStock);
      persist(KEYS.cardStock, updatedStock);
    }
  }, [sales, cardStock, persist]);

  const deleteSale = useCallback((id: string) => {
    const updated = sales.filter((s) => s.id !== id);
    setSales(updated);
    persist(KEYS.sales, updated);
  }, [sales, persist]);

  const getUserSales = useCallback((userId: string) =>
    sales.filter((s) => s.userId === userId), [sales]);

  const addRequest = useCallback((req: Omit<CardRequest, "id" | "requestDate" | "status">) => {
    const newReq: CardRequest = {
      ...req,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      requestDate: new Date().toISOString(),
      status: "pending",
    };
    const updated = [newReq, ...requests];
    setRequests(updated);
    persist(KEYS.requests, updated);
  }, [requests, persist]);

  const approveRequest = useCallback((reqId: string) => {
    const req = requests.find((r) => r.id === reqId);
    if (!req) return;
    const updatedReqs = requests.map((r) =>
      r.id === reqId ? { ...r, status: "approved" as const, resolvedDate: new Date().toISOString() } : r
    );
    setRequests(updatedReqs);
    persist(KEYS.requests, updatedReqs);
    addSale({
      userId: req.userId,
      customerName: req.userName,
      customerPhone: req.userPhone,
      cardId: req.cardId,
      cardName: req.cardName,
      operator: req.operator,
      cardValue: req.cardValue,
      paidAmount: req.cardPrice,
      debt: 0,
    });
  }, [requests, persist, addSale]);

  const rejectRequest = useCallback((reqId: string, note?: string) => {
    const updated = requests.map((r) =>
      r.id === reqId ? { ...r, status: "rejected" as const, resolvedDate: new Date().toISOString(), adminNote: note } : r
    );
    setRequests(updated);
    persist(KEYS.requests, updated);
  }, [requests, persist]);

  const getUserRequests = useCallback((userId: string) =>
    requests.filter((r) => r.userId === userId), [requests]);

  const pendingRequestsCount = requests.filter((r) => r.status === "pending").length;

  const getTotalRevenue = useCallback(() =>
    sales.reduce((sum, s) => sum + s.paidAmount, 0), [sales]);

  const getTotalDebt = useCallback(() =>
    users.reduce((sum, u) => sum + u.debt, 0), [users]);

  const getOperatorSales = useCallback((operator: Operator) =>
    sales.filter((s) => s.operator === operator).length, [sales]);

  const getTodayRevenue = useCallback(() => {
    const today = new Date().toDateString();
    return sales
      .filter((s) => new Date(s.saleDate).toDateString() === today)
      .reduce((sum, s) => sum + s.paidAmount, 0);
  }, [sales]);

  const getTodaySalesCount = useCallback(() => {
    const today = new Date().toDateString();
    return sales.filter((s) => new Date(s.saleDate).toDateString() === today).length;
  }, [sales]);

  const toggleDark = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem(KEYS.theme, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      isReady,
      adminLoggedIn, adminName: adminCreds.name, currentUser,
      adminLogin, adminLogout, updateAdminCredentials, userLogin, userRegister, userLogout,
      cards, updateCardPrice, updateCardName, addCard, deleteCard,
      cardStock, setCardStock, adjustStock, stockAlerts, setStockAlert, getLowStockCards,
      users, updateUserDebt, updateUser, deleteUser, getDebtCustomers,
      sales, addSale, deleteSale, getUserSales,
      requests, addRequest, approveRequest, rejectRequest,
      pendingRequestsCount, getUserRequests,
      getTotalRevenue, getTotalDebt, getOperatorSales,
      getTodayRevenue, getTodaySalesCount,
      isDark, toggleDark,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
