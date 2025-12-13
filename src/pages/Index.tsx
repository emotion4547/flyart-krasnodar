import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { PopularProducts } from "@/components/home/PopularProducts";
import { ContactForm } from "@/components/home/ContactForm";
import { AdvantagesSection } from "@/components/home/AdvantagesSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { AboutSection } from "@/components/home/AboutSection";
import { SEO } from "@/components/SEO";
import { ProductAdvisor } from "@/components/ProductAdvisor";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO />
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <PopularProducts />
        <ContactForm />
        <AdvantagesSection />
        <ReviewsSection />
        <AboutSection />
      </main>
      <Footer />
      <ProductAdvisor />
    </div>
  );
};

export default Index;
