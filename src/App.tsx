import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/hooks/useAuth";
import { FloatingContactButton } from "@/components/FloatingContactButton";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";

import { ScrollToTop } from "@/components/ScrollToTop";
import { toast } from "sonner";
import Index from "./pages/Index";
import Cart from "./pages/Cart";
import Catalog from "./pages/Catalog";
import Product from "./pages/Product";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Delivery from "./pages/Delivery";
import Guarantee from "./pages/Guarantee";
import Contacts from "./pages/Contacts";
import Reviews from "./pages/Reviews";
import Privacy from "./pages/Privacy";
import Offer from "./pages/Offer";
import NotFound from "./pages/NotFound";
import DesignSystem from "./pages/DesignSystem";
import Sitemap from "./pages/Sitemap";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProductEdit from "./pages/admin/ProductEdit";
import Orders from "./pages/admin/Orders";
import Marketing from "./pages/admin/Marketing";
import Settings from "./pages/admin/Settings";
import CatalogHub from "./pages/admin/CatalogHub";
import ClientsHub from "./pages/admin/ClientsHub";
import ContentHub from "./pages/admin/ContentHub";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
      gcTime: 1000 * 60 * 30,
    },
    mutations: {
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error(`[QueryError] ${String(query.queryKey)}:`, error);
      // Only toast for user-facing queries when no cached data exists
      if (query.state.data === undefined) {
        toast.error("Ошибка загрузки данных", {
          description: error instanceof Error ? error.message : "Попробуйте обновить страницу",
        });
      }
    },
  }),
});

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/:category" element={<Catalog />} />
        <Route path="/product/:slug" element={<Product />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/guarantee" element={<Guarantee />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/offer" element={<Offer />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/design-system" element={<DesignSystem />} />
        
        {/* Admin routes */}
        <Route path="/admin4547/login" element={<AdminLogin />} />
        <Route path="/admin4547" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin4547/catalog" element={<AdminLayout><CatalogHub /></AdminLayout>} />
        <Route path="/admin4547/catalog/:id" element={<AdminLayout><ProductEdit /></AdminLayout>} />
        <Route path="/admin4547/orders" element={<AdminLayout><Orders /></AdminLayout>} />
        <Route path="/admin4547/clients" element={<AdminLayout><ClientsHub /></AdminLayout>} />
        <Route path="/admin4547/content" element={<AdminLayout><ContentHub /></AdminLayout>} />
        <Route path="/admin4547/marketing" element={<AdminLayout><Marketing /></AdminLayout>} />
        <Route path="/admin4547/settings" element={<AdminLayout><Settings /></AdminLayout>} />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdminRoute && (
        <>
          <FloatingContactButton />
          <PWAInstallBanner />
        </>
      )}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
