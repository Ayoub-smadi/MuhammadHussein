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

export type Customer = {
  id: string;
  name: string;
  phone: string;
};

export type Sale = {
  id: string;
  customerId: string;
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

const CARDS: CardType[] = [
  { id: "z1", operator: "zain", name: "Zain 1 JD", value: 1, price: 1 },
  { id: "z2", operator: "zain", name: "Zain 2 JD", value: 2, price: 2 },
  { id: "z3", operator: "zain", name: "Zain 5 JD", value: 5, price: 5 },
  { id: "z4", operator: "zain", name: "Zain 10 JD", value: 10, price: 10 },
  { id: "o1", operator: "orange", name: "Orange 1 JD", value: 1, price: 1 },
  { id: "o2", operator: "orange", name: "Orange 2 JD", value: 2, price: 2 },
  { id: "o3", operator: "orange", name: "Orange 5 JD", value: 5, price: 5 },
  { id: "o4", operator: "orange", name: "Orange 10 JD", value: 10, price: 10 },
  { id: "u1", operator: "umniah", name: "Umniah 1 JD", value: 1, price: 1 },
  { id: "u2", operator: "umniah", name: "Umniah 2 JD", value: 2, price: 2 },
  { id: "u3", operator: "umniah", name: "Umniah 5 JD", value: 5, price: 5 },
  {
    id: "u4",
    operator: "umniah",
    name: "Umniah 10 JD",
    value: 10,
    price: 10,
  },
];

type AppContextType = {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  sales: Sale[];
  customers: Customer[];
  cards: CardType[];
  addSale: (sale: Omit<Sale, "id" | "saleDate">) => void;
  deleteSale: (id: string) => void;
  getTotalRevenue: () => number;
  getTotalDebt: () => number;
  getTotalSales: () => number;
  getOperatorSales: (operator: Operator) => number;
};

const AppContext = createContext<AppContextType | null>(null);

const ADMIN_PASSWORD = "admin123";
const SALES_KEY = "@telecom_sales";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(SALES_KEY).then((data) => {
      if (data) setSales(JSON.parse(data));
    });
  }, []);

  const persistSales = useCallback(async (newSales: Sale[]) => {
    await AsyncStorage.setItem(SALES_KEY, JSON.stringify(newSales));
    setSales(newSales);
  }, []);

  const login = useCallback((password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const addSale = useCallback(
    (sale: Omit<Sale, "id" | "saleDate">) => {
      const newSale: Sale = {
        ...sale,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        saleDate: new Date().toISOString(),
      };
      const updated = [newSale, ...sales];
      persistSales(updated);
    },
    [sales, persistSales]
  );

  const deleteSale = useCallback(
    (id: string) => {
      const updated = sales.filter((s) => s.id !== id);
      persistSales(updated);
    },
    [sales, persistSales]
  );

  const getTotalRevenue = useCallback(() => {
    return sales.reduce((sum, s) => sum + s.paidAmount, 0);
  }, [sales]);

  const getTotalDebt = useCallback(() => {
    return sales.reduce((sum, s) => sum + s.debt, 0);
  }, [sales]);

  const getTotalSales = useCallback(() => sales.length, [sales]);

  const getOperatorSales = useCallback(
    (operator: Operator) => {
      return sales.filter((s) => s.operator === operator).length;
    },
    [sales]
  );

  const customers: Customer[] = React.useMemo(() => {
    const map = new Map<string, Customer>();
    sales.forEach((s) => {
      if (!map.has(s.customerPhone)) {
        map.set(s.customerPhone, {
          id: s.customerId,
          name: s.customerName,
          phone: s.customerPhone,
        });
      }
    });
    return Array.from(map.values());
  }, [sales]);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        sales,
        customers,
        cards: CARDS,
        addSale,
        deleteSale,
        getTotalRevenue,
        getTotalDebt,
        getTotalSales,
        getOperatorSales,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
