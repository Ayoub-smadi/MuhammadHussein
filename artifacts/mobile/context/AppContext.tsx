import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

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

const ADMIN_PASSWORD = "admin123";

const KEYS = {
  users: "@hussein_users",
  sales: "@hussein_sales",
  requests: "@hussein_requests",
  cardPrices: "@hussein_prices",
};

type AppContextType = {
  // Auth
  adminLoggedIn: boolean;
  currentUser: AppUser | null;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  userLogin: (phone: string, password: string) => boolean;
  userRegister: (name: string, phone: string, password: string) => { success: boolean; error?: string };
  userLogout: () => void;

  // Cards
  cards: CardType[];
  updateCardPrice: (cardId: string, newPrice: number) => void;

  // Users management
  users: AppUser[];
  updateUserDebt: (userId: string, debt: number) => void;
  updateUser: (userId: string, updates: Partial<AppUser>) => void;

  // Sales
  sales: Sale[];
  addSale: (sale: Omit<Sale, "id" | "saleDate">) => void;
  deleteSale: (id: string) => void;
  getUserSales: (userId: string) => Sale[];

  // Requests
  requests: CardRequest[];
  addRequest: (req: Omit<CardRequest, "id" | "requestDate" | "status">) => void;
  approveRequest: (reqId: string) => void;
  rejectRequest: (reqId: string, note?: string) => void;
  pendingRequestsCount: number;
  getUserRequests: (userId: string) => CardRequest[];

  // Stats
  getTotalRevenue: () => number;
  getTotalDebt: () => number;
  getOperatorSales: (operator: Operator) => number;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [requests, setRequests] = useState<CardRequest[]>([]);
  const [cardPrices, setCardPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(KEYS.users),
      AsyncStorage.getItem(KEYS.sales),
      AsyncStorage.getItem(KEYS.requests),
      AsyncStorage.getItem(KEYS.cardPrices),
    ]).then(([u, s, r, p]) => {
      if (u) setUsers(JSON.parse(u));
      if (s) setSales(JSON.parse(s));
      if (r) setRequests(JSON.parse(r));
      if (p) setCardPrices(JSON.parse(p));
    });
  }, []);

  const persist = useCallback(
    async (key: string, data: unknown) => AsyncStorage.setItem(key, JSON.stringify(data)),
    []
  );

  const cards: CardType[] = DEFAULT_CARDS.map((c) => ({
    ...c,
    price: cardPrices[c.id] ?? c.price,
  }));

  // Auth
  const adminLogin = useCallback((pw: string) => {
    if (pw === ADMIN_PASSWORD) { setAdminLoggedIn(true); return true; }
    return false;
  }, []);

  const adminLogout = useCallback(() => setAdminLoggedIn(false), []);

  const userLogin = useCallback((phone: string, pw: string) => {
    const user = users.find((u) => u.phone === phone && u.password === pw);
    if (user) { setCurrentUser(user); return true; }
    return false;
  }, [users]);

  const userRegister = useCallback((name: string, phone: string, pw: string) => {
    if (users.find((u) => u.phone === phone)) {
      return { success: false, error: "رقم الهاتف مسجل مسبقاً" };
    }
    const newUser: AppUser = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
      name: name.trim(),
      phone: phone.trim(),
      password: pw,
      debt: 0,
    };
    const updated = [...users, newUser];
    setUsers(updated);
    persist(KEYS.users, updated);
    setCurrentUser(newUser);
    return { success: true };
  }, [users, persist]);

  const userLogout = useCallback(() => setCurrentUser(null), []);

  // Card prices
  const updateCardPrice = useCallback((cardId: string, price: number) => {
    const updated = { ...cardPrices, [cardId]: price };
    setCardPrices(updated);
    persist(KEYS.cardPrices, updated);
  }, [cardPrices, persist]);

  // User management
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

  // Sales
  const addSale = useCallback((sale: Omit<Sale, "id" | "saleDate">) => {
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
      saleDate: new Date().toISOString(),
    };
    const updated = [newSale, ...sales];
    setSales(updated);
    persist(KEYS.sales, updated);
  }, [sales, persist]);

  const deleteSale = useCallback((id: string) => {
    const updated = sales.filter((s) => s.id !== id);
    setSales(updated);
    persist(KEYS.sales, updated);
  }, [sales, persist]);

  const getUserSales = useCallback((userId: string) =>
    sales.filter((s) => s.userId === userId), [sales]);

  // Requests
  const addRequest = useCallback((req: Omit<CardRequest, "id" | "requestDate" | "status">) => {
    const newReq: CardRequest = {
      ...req,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
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
    // Create a sale
    addSale({
      userId: req.userId,
      customerName: req.userName,
      customerPhone: req.userPhone,
      cardId: req.cardId,
      cardName: req.cardName,
      operator: req.operator,
      cardValue: req.cardValue,
      paidAmount: 0,
      debt: req.cardPrice,
    });
    // Update user debt
    const user = users.find((u) => u.id === req.userId);
    if (user) {
      updateUserDebt(req.userId, user.debt + req.cardPrice);
    }
  }, [requests, persist, addSale, users, updateUserDebt]);

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
    sales.reduce((sum, s) => sum + s.debt, 0), [sales]);

  const getOperatorSales = useCallback((operator: Operator) =>
    sales.filter((s) => s.operator === operator).length, [sales]);

  return (
    <AppContext.Provider value={{
      adminLoggedIn, currentUser,
      adminLogin, adminLogout, userLogin, userRegister, userLogout,
      cards, updateCardPrice,
      users, updateUserDebt, updateUser,
      sales, addSale, deleteSale, getUserSales,
      requests, addRequest, approveRequest, rejectRequest,
      pendingRequestsCount, getUserRequests,
      getTotalRevenue, getTotalDebt, getOperatorSales,
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
