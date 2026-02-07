import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { CollectionsSection } from "@/components/home/CollectionsSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { PopularProducts } from "@/components/home/PopularProducts";
import { VKClipsSection } from "@/components/home/VKClipsSection";
import { ContactForm } from "@/components/home/ContactForm";
import { AdvantagesSection } from "@/components/home/AdvantagesSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { AboutSection } from "@/components/home/AboutSection";
import { SEO } from "@/components/SEO";
import { LazySection } from "@/components/LazySection";
import { LocalBusinessSchema } from "@/components/schema/LocalBusinessSchema";
import { OrganizationSchema } from "@/components/schema/OrganizationSchema";
import { WebsiteSchema } from "@/components/schema/WebsiteSchema";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO />
      <LocalBusinessSchema />
      <OrganizationSchema />
      <WebsiteSchema />
      <Header />
      <main className="flex-1">
        {/* Critical above-the-fold content */}
        <HeroSection />
        <CollectionsSection />
        <CategoriesSection />
        <PopularProducts />
        
        {/* Lazy loaded sections - improve initial load */}
        <LazySection minHeight="400px">
          <VKClipsSection />
        </LazySection>
        
        <LazySection minHeight="300px">
          <ContactForm />
        </LazySection>
        
        <LazySection minHeight="400px">
          <AdvantagesSection />
        </LazySection>
        
        <LazySection minHeight="400px">
          <ReviewsSection />
        </LazySection>
        
        <LazySection minHeight="300px">
          <AboutSection />
        </LazySection>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
