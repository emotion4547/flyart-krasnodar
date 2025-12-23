import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Sparkles, Truck, Gift, Check, Smartphone, Wallet, ShieldCheck, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Premium Noir Theme Wrapper
const NoirTheme = ({ children }: { children: React.ReactNode }) => (
  <div 
    className="noir-theme"
    style={{
      // Premium Noir Palette
      '--noir-bg': '#020617',
      '--noir-bg-card': '#0F172A',
      '--noir-fg': '#F8FAFC',
      '--noir-fg-muted': '#94A3B8',
      '--noir-primary': '#581C87',
      '--noir-primary-light': '#7C3AED',
      '--noir-accent': '#BEF264',
      '--noir-platinum': '#E2E8F0',
      '--noir-cta': '#D8B4FE',
      '--noir-border': '#1E293B',
    } as React.CSSProperties}
  >
    {children}
  </div>
);

// Hero Section Noir
function HeroSectionNoir() {
  return (
    <section className="relative overflow-hidden min-h-[85vh] md:min-h-screen flex flex-col" style={{ background: 'var(--noir-bg)' }}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-slate-950 to-black" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-lime-400/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-violet-500/15 rounded-full blur-[80px]" />
      </div>
      
      {/* Gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020617] to-transparent z-[1]" />

      <div className="container-custom relative z-10 py-8 md:py-12 flex-1 flex items-center w-full">
        <div 
          className="relative w-full rounded-3xl shadow-2xl border px-6 py-12 md:px-12 md:py-16 lg:px-16 lg:py-20"
          style={{ 
            background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.3) 0%, rgba(15, 23, 42, 0.8) 100%)',
            borderColor: 'rgba(139, 92, 246, 0.3)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Neon glow effects */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute top-10 right-10 w-40 h-40 rounded-full blur-3xl" style={{ background: 'rgba(190, 242, 100, 0.15)' }} />
            <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full blur-3xl" style={{ background: 'rgba(139, 92, 246, 0.2)' }} />
          </div>

          <div className="relative flex flex-col items-center text-center">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 animate-fade-up border"
              style={{ 
                background: 'rgba(190, 242, 100, 0.1)', 
                borderColor: 'rgba(190, 242, 100, 0.3)' 
              }}
            >
              <Sparkles className="h-4 w-4" style={{ color: '#BEF264' }} />
              <span className="text-sm font-medium" style={{ color: '#BEF264' }}>VIP-сервис</span>
            </div>

            {/* Main heading */}
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-3xl animate-fade-up" 
              style={{ color: '#F8FAFC', animationDelay: '0.1s' }}
            >
              Эксклюзивные шары для{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                особых
              </span>{" "}
              событий
            </h1>

            {/* Subheading */}
            <p 
              className="text-base md:text-lg lg:text-xl max-w-2xl mb-8 animate-fade-up" 
              style={{ color: '#94A3B8', animationDelay: '0.2s' }}
            >
              Премиальные композиции для тех, кто ценит роскошь и индивидуальность. Создаём атмосферу настоящего праздника.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Button 
                size="lg" 
                asChild
                className="text-slate-900 font-semibold px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #BEF264 0%, #A3E635 100%)' }}
              >
                <Link to="/catalog">Заказать сейчас</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild
                className="px-8 py-6 text-lg rounded-xl transition-all duration-300"
                style={{ 
                  borderColor: 'rgba(216, 180, 254, 0.5)', 
                  color: '#D8B4FE',
                  background: 'transparent'
                }}
              >
                <Link to="/catalog">VIP-каталог</Link>
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 md:gap-6 max-w-3xl animate-fade-up w-full" style={{ animationDelay: '0.4s' }}>
              {[
                { icon: Truck, title: "Премиум", subtitle: "доставка", accent: '#BEF264' },
                { icon: Gift, title: "VIP-наборы", subtitle: "от 2990 ₽", accent: '#D8B4FE' },
                { icon: Sparkles, title: "Эксклюзив", subtitle: "дизайн", accent: '#E2E8F0' },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="flex flex-col md:flex-row items-center gap-2 md:gap-3 rounded-xl px-3 py-3 md:px-4 border"
                  style={{ 
                    background: 'rgba(15, 23, 42, 0.6)', 
                    borderColor: 'rgba(148, 163, 184, 0.1)' 
                  }}
                >
                  <div 
                    className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.accent}15` }}
                  >
                    <item.icon className="h-5 w-5" style={{ color: item.accent }} />
                  </div>
                  <div className="text-center md:text-left">
                    <p className="font-medium text-xs md:text-sm" style={{ color: '#F8FAFC' }}>{item.title}</p>
                    <p className="text-xs" style={{ color: '#64748B' }}>{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Advantages Section Noir
function AdvantagesSectionNoir() {
  const advantages = [
    { icon: Truck, title: "Экспресс-доставка", description: "VIP-доставка в течение часа по всему Красноярску", accent: '#BEF264' },
    { icon: Smartphone, title: "Персональный менеджер", description: "Индивидуальный подход и консультации 24/7", accent: '#D8B4FE' },
    { icon: Wallet, title: "Премиум качество", description: "Только лучшие материалы от мировых производителей", accent: '#E2E8F0' },
    { icon: ShieldCheck, title: "Гарантия эксклюзива", description: "Уникальные композиции, созданные специально для вас", accent: '#BEF264' },
  ];

  return (
    <section className="py-16 md:py-24" style={{ background: '#020617' }}>
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#F8FAFC' }}>
            Премиум-сервис
          </h2>
          <div className="h-px max-w-xs mx-auto mb-4" style={{ background: 'linear-gradient(90deg, transparent, #BEF264, transparent)' }} />
          <p className="max-w-2xl mx-auto" style={{ color: '#94A3B8' }}>
            Исключительный уровень обслуживания для требовательных клиентов
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((adv, index) => (
            <div
              key={adv.title}
              className="group p-6 rounded-2xl border transition-all duration-300 hover:scale-105"
              style={{ 
                background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
                borderColor: 'rgba(139, 92, 246, 0.2)',
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div 
                className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                style={{ background: `${adv.accent}15` }}
              >
                <adv.icon className="h-7 w-7" style={{ color: adv.accent }} />
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: '#F8FAFC' }}>{adv.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{adv.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// About Section Noir
function AboutSectionNoir() {
  const features = [
    "Эксклюзивные дизайны от ведущих декораторов",
    "Премиальные материалы мирового класса",
    "VIP-клиенты доверяют нам с 2018 года",
    "Полная конфиденциальность заказов",
  ];

  return (
    <section className="py-16 md:py-24" style={{ background: '#020617' }}>
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <div 
              className="aspect-[4/3] rounded-3xl overflow-hidden border"
              style={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}
            >
              <img
                src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop"
                alt="Premium balloons"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/60 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full blur-3xl" style={{ background: 'rgba(190, 242, 100, 0.2)' }} />
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full blur-3xl" style={{ background: 'rgba(139, 92, 246, 0.3)' }} />
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#F8FAFC' }}>
              FlyArt <span style={{ color: '#D8B4FE' }}>Premium</span>
            </h2>
            <div className="h-px max-w-xs mb-6" style={{ background: 'linear-gradient(90deg, #BEF264, transparent)' }} />
            
            <div className="space-y-4 leading-relaxed mb-8" style={{ color: '#94A3B8' }}>
              <p>
                Премиум-линейка для тех, кто выбирает лучшее. Мы создаём эксклюзивные композиции 
                для VIP-мероприятий, закрытых вечеринок и особых моментов.
              </p>
              <p>
                Каждый заказ — это индивидуальный проект, над которым работает команда 
                профессиональных декораторов с безупречным вкусом.
              </p>
            </div>

            <ul className="space-y-3">
              {features.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div 
                    className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(190, 242, 100, 0.15)' }}
                  >
                    <Check className="h-4 w-4" style={{ color: '#BEF264' }} />
                  </div>
                  <span style={{ color: '#F8FAFC' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// Reviews Section Noir
function ReviewsSectionNoir() {
  const reviews = [
    { name: "Александра М.", text: "Невероятный сервис! Шары для свадьбы были просто волшебными.", rating: 5 },
    { name: "Дмитрий К.", text: "VIP-обслуживание на высшем уровне. Рекомендую всем!", rating: 5 },
    { name: "Елена В.", text: "Эксклюзивный дизайн превзошёл все ожидания. Спасибо!", rating: 5 },
  ];

  return (
    <section className="py-16 md:py-24" style={{ background: '#0F172A' }}>
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#F8FAFC' }}>
            Отзывы VIP-клиентов
          </h2>
          <div className="h-px max-w-xs mx-auto mb-4" style={{ background: 'linear-gradient(90deg, transparent, #D8B4FE, transparent)' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div 
              key={i}
              className="p-6 rounded-2xl border"
              style={{ 
                background: 'rgba(88, 28, 135, 0.1)',
                borderColor: 'rgba(139, 92, 246, 0.2)'
              }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} className="h-5 w-5 fill-current" style={{ color: '#BEF264' }} />
                ))}
              </div>
              <p className="mb-4 leading-relaxed" style={{ color: '#E2E8F0' }}>"{review.text}"</p>
              <p className="font-medium" style={{ color: '#D8B4FE' }}>{review.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const IndexNoir = () => {
  return (
    <NoirTheme>
      <div className="min-h-screen flex flex-col" style={{ background: '#020617' }}>
        <SEO 
          title="FlyArt Premium Noir — Эксклюзивные воздушные шары"
          description="VIP-сервис воздушных шаров в Красноярске. Премиальные композиции для особых событий."
        />
        <Header />
        <main className="flex-1">
          <HeroSectionNoir />
          <AdvantagesSectionNoir />
          <AboutSectionNoir />
          <ReviewsSectionNoir />
        </main>
        <Footer />
      </div>
    </NoirTheme>
  );
};

export default IndexNoir;
