import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
