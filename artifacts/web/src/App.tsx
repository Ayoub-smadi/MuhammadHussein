import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/context/AppContext";
import { useEffect } from "react";

// Layouts
import { AdminLayout } from "@/components/layout/AdminLayout";
import { UserLayout } from "@/components/layout/UserLayout";

// Pages
import AuthPage from "@/pages/Auth";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminCards from "@/pages/admin/Cards";
import AdminRequests from "@/pages/admin/Requests";
import AdminCustomers from "@/pages/admin/Customers";
import AdminReports from "@/pages/admin/Reports";
import UserBuy from "@/pages/user/Buy";
import UserPurchases from "@/pages/user/Purchases";
import UserAccount from "@/pages/user/Account";
import UserPayment from "@/pages/user/Payment";

const queryClient = new QueryClient();

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { adminLoggedIn, isReady } = useApp();
  if (!isReady) return null;
  if (!adminLoggedIn) return <Redirect to="/auth" />;
  return <AdminLayout><Component /></AdminLayout>;
}

function UserRoute({ component: Component }: { component: React.ComponentType }) {
  const { currentUser, isReady, adminLoggedIn } = useApp();
  if (!isReady) return null;
  if (adminLoggedIn) return <Redirect to="/admin" />;
  if (!currentUser) return <Redirect to="/auth" />;
  return <UserLayout><Component /></UserLayout>;
}

function InitialRoute() {
  const { currentUser, adminLoggedIn, isReady } = useApp();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isReady) return;
    if (adminLoggedIn) setLocation("/admin");
    else if (currentUser) setLocation("/user");
    else setLocation("/auth");
  }, [isReady, adminLoggedIn, currentUser, setLocation]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={InitialRoute} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin Routes */}
      <Route path="/admin">
        {() => <AdminRoute component={AdminDashboard} />}
      </Route>
      <Route path="/admin/cards">
        {() => <AdminRoute component={AdminCards} />}
      </Route>
      <Route path="/admin/requests">
        {() => <AdminRoute component={AdminRequests} />}
      </Route>
      <Route path="/admin/customers">
        {() => <AdminRoute component={AdminCustomers} />}
      </Route>
      <Route path="/admin/reports">
        {() => <AdminRoute component={AdminReports} />}
      </Route>

      {/* User Routes */}
      <Route path="/user">
        {() => <UserRoute component={UserBuy} />}
      </Route>
      <Route path="/user/purchases">
        {() => <UserRoute component={UserPurchases} />}
      </Route>
      <Route path="/user/account">
        {() => <UserRoute component={UserAccount} />}
      </Route>
      <Route path="/user/payment">
        {() => <UserRoute component={UserPayment} />}
      </Route>

      {/* Fallback */}
      <Route>
        {() => (
          <div className="min-h-screen flex items-center justify-center flex-col gap-4">
            <h1 className="text-4xl font-black">404</h1>
            <p>الصفحة غير موجودة</p>
          </div>
        )}
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster position="top-center" dir="rtl" />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
