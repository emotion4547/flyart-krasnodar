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

const IndexNoir = () => {
  return (
    <div className="theme-noir min-h-screen flex flex-col">
      <SEO 
        title="FlyArt Premium Noir — Эксклюзивные воздушные шары в Красноярске"
        description="VIP-сервис воздушных шаров в Красноярске. Премиальные композиции для особых событий."
      />
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
    </div>
  );
};

export default IndexNoir;
