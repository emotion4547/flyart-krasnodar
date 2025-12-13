import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/hooks/useAuth";
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

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import ProductEdit from "./pages/admin/ProductEdit";
import Categories from "./pages/admin/Categories";
import Orders from "./pages/admin/Orders";
import Clients from "./pages/admin/Clients";
import Marketing from "./pages/admin/Marketing";
import Content from "./pages/admin/Content";
import Import from "./pages/admin/Import";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              
              {/* Admin routes */}
              <Route path="/admin4547/login" element={<AdminLogin />} />
              <Route path="/admin4547" element={<AdminLayout><Dashboard /></AdminLayout>} />
              <Route path="/admin4547/products" element={<AdminLayout><Products /></AdminLayout>} />
              <Route path="/admin4547/products/:id" element={<AdminLayout><ProductEdit /></AdminLayout>} />
              <Route path="/admin4547/categories" element={<AdminLayout><Categories /></AdminLayout>} />
              <Route path="/admin4547/orders" element={<AdminLayout><Orders /></AdminLayout>} />
              <Route path="/admin4547/clients" element={<AdminLayout><Clients /></AdminLayout>} />
              <Route path="/admin4547/marketing" element={<AdminLayout><Marketing /></AdminLayout>} />
              <Route path="/admin4547/content" element={<AdminLayout><Content /></AdminLayout>} />
              <Route path="/admin4547/import" element={<AdminLayout><Import /></AdminLayout>} />
              <Route path="/admin4547/settings" element={<AdminLayout><Settings /></AdminLayout>} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
