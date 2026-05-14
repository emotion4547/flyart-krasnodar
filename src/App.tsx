import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/hooks/useAuth";
import { ScrollToTop } from "@/components/ScrollToTop";
import { toast } from "sonner";
import { lazy, Suspense, useState, useEffect } from "react";

// Deferred non-critical components - loaded after initial render
const FloatingContactButton = lazy(() => import("@/components/FloatingContactButton").then(m => ({ default: m.FloatingContactButton })));
const PWAInstallBanner = lazy(() => import("@/components/PWAInstallBanner").then(m => ({ default: m.PWAInstallBanner })));
const FortuneWheelTrigger = lazy(() => import("@/components/wheel/FortuneWheelTrigger").then(m => ({ default: m.FortuneWheelTrigger })));
const PendingSpinHandler = lazy(() => import("@/components/wheel/PendingSpinHandler").then(m => ({ default: m.PendingSpinHandler })));

// Critical pages - loaded immediately
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Loading component for suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-tiffany border-t-transparent animate-spin" />
      <p className="text-muted-foreground text-sm">Загрузка...</p>
    </div>
  </div>
);

// Lazy loaded pages - code splitting
const Cart = lazy(() => import("./pages/Cart"));
const Catalog = lazy(() => import("./pages/Catalog"));
const Product = lazy(() => import("./pages/Product"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Delivery = lazy(() => import("./pages/Delivery"));
const Guarantee = lazy(() => import("./pages/Guarantee"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Offer = lazy(() => import("./pages/Offer"));
const DesignSystem = lazy(() => import("./pages/DesignSystem"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const Collection = lazy(() => import("./pages/Collection"));
const Partners = lazy(() => import("./pages/Partners"));
const SeoLanding = lazy(() => import("./pages/SeoLanding"));

// Auth & Account pages - lazy loaded
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/account/Profile"));
const AccountOrders = lazy(() => import("./pages/account/Orders"));
const AccountAddresses = lazy(() => import("./pages/account/Addresses"));
const AccountCoupons = lazy(() => import("./pages/account/Coupons"));
const AccountFavorites = lazy(() => import("./pages/account/Favorites"));
const AccountSettings = lazy(() => import("./pages/account/Settings"));

// Admin pages - lazy loaded
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ProductEdit = lazy(() => import("./pages/admin/ProductEdit"));
const Orders = lazy(() => import("./pages/admin/Orders"));
const Marketing = lazy(() => import("./pages/admin/Marketing"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const CatalogHub = lazy(() => import("./pages/admin/CatalogHub"));
const ClientsHub = lazy(() => import("./pages/admin/ClientsHub"));
const ContentHub = lazy(() => import("./pages/admin/ContentHub"));
const AdminWheelContent = lazy(() => import("./pages/admin/AdminWheelContent"));
const AdminCouponsContent = lazy(() => import("./pages/admin/AdminCouponsContent"));

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

/** Defers non-critical floating widgets by 3 seconds after mount */
function DeferredWidgets() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);
  if (!show) return null;
  return (
    <Suspense fallback={null}>
      <FloatingContactButton />
      <PWAInstallBanner />
      <FortuneWheelTrigger />
      <PendingSpinHandler />
    </Suspense>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
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
          <Route path="/collection/:slug" element={<Collection />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/design-system" element={<DesignSystem />} />

          {/* SEO landing pages */}
          {seoLandingList.map((cfg) => (
            <Route
              key={cfg.path}
              path={cfg.path}
              element={<SeoLanding config={cfg} />}
            />
          ))}
          
          {/* Auth routes */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Account routes */}
          <Route path="/account" element={<Profile />} />
          <Route path="/account/orders" element={<AccountOrders />} />
          <Route path="/account/addresses" element={<AccountAddresses />} />
          <Route path="/account/coupons" element={<AccountCoupons />} />
          <Route path="/account/favorites" element={<AccountFavorites />} />
          <Route path="/account/settings" element={<AccountSettings />} />
          
          {/* Admin routes */}
          <Route path="/admin4547/login" element={<AdminLogin />} />
          <Route path="/admin4547" element={<Suspense fallback={<PageLoader />}><AdminLayout><Dashboard /></AdminLayout></Suspense>} />
          <Route path="/admin4547/catalog" element={<Suspense fallback={<PageLoader />}><AdminLayout><CatalogHub /></AdminLayout></Suspense>} />
          <Route path="/admin4547/products/new" element={<Suspense fallback={<PageLoader />}><AdminLayout><ProductEdit /></AdminLayout></Suspense>} />
          <Route path="/admin4547/products/:id" element={<Suspense fallback={<PageLoader />}><AdminLayout><ProductEdit /></AdminLayout></Suspense>} />
          <Route path="/admin4547/catalog/:id" element={<Suspense fallback={<PageLoader />}><AdminLayout><ProductEdit /></AdminLayout></Suspense>} />
          <Route path="/admin4547/orders" element={<Suspense fallback={<PageLoader />}><AdminLayout><Orders /></AdminLayout></Suspense>} />
          <Route path="/admin4547/clients" element={<Suspense fallback={<PageLoader />}><AdminLayout><ClientsHub /></AdminLayout></Suspense>} />
          <Route path="/admin4547/content" element={<Suspense fallback={<PageLoader />}><AdminLayout><ContentHub /></AdminLayout></Suspense>} />
          <Route path="/admin4547/marketing" element={<Suspense fallback={<PageLoader />}><AdminLayout><Marketing /></AdminLayout></Suspense>} />
          <Route path="/admin4547/wheel" element={<Suspense fallback={<PageLoader />}><AdminLayout><AdminWheelContent /></AdminLayout></Suspense>} />
          <Route path="/admin4547/coupons" element={<Suspense fallback={<PageLoader />}><AdminLayout><AdminCouponsContent /></AdminLayout></Suspense>} />
          <Route path="/admin4547/settings" element={<Suspense fallback={<PageLoader />}><AdminLayout><Settings /></AdminLayout></Suspense>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isAdminRoute && <DeferredWidgets />}
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
