import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Sparkles, Truck, Gift, Check, Smartphone, Wallet, ShieldCheck, Star, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

// Neo Pastel Theme Wrapper
const NeoPastelTheme = ({ children }: { children: React.ReactNode }) => (
  <div 
    className="neo-pastel-theme"
    style={{
      // Neo Pastel Palette
      '--pastel-bg': '#FFFBEB',
      '--pastel-bg-card': '#FFFFFF',
      '--pastel-fg': '#334155',
      '--pastel-fg-muted': '#64748B',
      '--pastel-primary': '#10B981',
      '--pastel-primary-light': '#34D399',
      '--pastel-coral': '#FB7185',
      '--pastel-coral-light': '#FDA4AF',
      '--pastel-orange': '#FDBA74',
      '--pastel-cream': '#FEF3C7',
      '--pastel-border': '#E2E8F0',
    } as React.CSSProperties}
  >
    {children}
  </div>
);

// Hero Section Neo Pastel
function HeroSectionNeoPastel() {
  return (
    <section className="relative overflow-hidden min-h-[85vh] md:min-h-screen flex flex-col" style={{ background: '#FFFBEB' }}>
      {/* Soft gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-amber-50 to-rose-50" />
        <div className="absolute top-20 left-1/4 w-80 h-80 bg-emerald-200/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-rose-200/40 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 right-10 w-64 h-64 bg-amber-200/30 rounded-full blur-[60px]" />
      </div>
      
      {/* Gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FFFBEB] to-transparent z-[1]" />

      <div className="container-custom relative z-10 py-8 md:py-12 flex-1 flex items-center w-full">
        <div 
          className="relative w-full rounded-3xl shadow-xl border px-6 py-12 md:px-12 md:py-16 lg:px-16 lg:py-20"
          style={{ 
            background: 'rgba(255, 255, 255, 0.8)',
            borderColor: 'rgba(16, 185, 129, 0.2)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Soft glow effects */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute top-10 right-10 w-32 h-32 rounded-full blur-3xl" style={{ background: 'rgba(251, 113, 133, 0.15)' }} />
            <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full blur-3xl" style={{ background: 'rgba(16, 185, 129, 0.15)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl" style={{ background: 'rgba(253, 186, 116, 0.2)' }} />
          </div>

          <div className="relative flex flex-col items-center text-center">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 animate-fade-up border"
              style={{ 
                background: 'rgba(16, 185, 129, 0.1)', 
                borderColor: 'rgba(16, 185, 129, 0.3)' 
              }}
            >
              <Leaf className="h-4 w-4" style={{ color: '#10B981' }} />
              <span className="text-sm font-medium" style={{ color: '#10B981' }}>Эко-материалы</span>
            </div>

            {/* Main heading */}
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-3xl animate-fade-up" 
              style={{ color: '#334155', animationDelay: '0.1s' }}
            >
              Нежные шары для{" "}
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                счастливых
              </span>{" "}
              моментов
            </h1>

            {/* Subheading */}
            <p 
              className="text-base md:text-lg lg:text-xl max-w-2xl mb-8 animate-fade-up" 
              style={{ color: '#64748B', animationDelay: '0.2s' }}
            >
              Современные пастельные композиции с заботой о природе. Создаём уют и атмосферу нежности для вашего праздника.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Button 
                size="lg" 
                asChild
                className="text-white font-semibold px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #FB7185 0%, #F43F5E 100%)' }}
              >
                <Link to="/catalog">Выбрать шары</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild
                className="px-8 py-6 text-lg rounded-xl transition-all duration-300"
                style={{ 
                  borderColor: 'rgba(16, 185, 129, 0.5)', 
                  color: '#10B981',
                  background: 'rgba(16, 185, 129, 0.05)'
                }}
              >
                <Link to="/catalog">Коллекции</Link>
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 md:gap-6 max-w-3xl animate-fade-up w-full" style={{ animationDelay: '0.4s' }}>
              {[
                { icon: Truck, title: "Бережная", subtitle: "доставка", color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
                { icon: Gift, title: "Подарочные", subtitle: "от 790 ₽", color: '#FB7185', bg: 'rgba(251, 113, 133, 0.1)' },
                { icon: Sparkles, title: "Уникальный", subtitle: "стиль", color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="flex flex-col md:flex-row items-center gap-2 md:gap-3 rounded-xl px-3 py-3 md:px-4 border"
                  style={{ 
                    background: item.bg, 
                    borderColor: 'rgba(226, 232, 240, 0.8)' 
                  }}
                >
                  <div 
                    className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'white' }}
                  >
                    <item.icon className="h-5 w-5" style={{ color: item.color }} />
                  </div>
                  <div className="text-center md:text-left">
                    <p className="font-medium text-xs md:text-sm" style={{ color: '#334155' }}>{item.title}</p>
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

// Advantages Section Neo Pastel
function AdvantagesSectionNeoPastel() {
  const advantages = [
    { icon: Truck, title: "Аккуратная доставка", description: "Доставим шары бережно, сохраняя их красоту и форму", color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
    { icon: Smartphone, title: "Простой заказ", description: "Выберите в каталоге или напишите — поможем подобрать", color: '#FB7185', bg: 'rgba(251, 113, 133, 0.1)' },
    { icon: Wallet, title: "Честные цены", description: "Прозрачное ценообразование без скрытых наценок", color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
    { icon: Leaf, title: "Эко-подход", description: "Используем биоразлагаемые материалы везде, где возможно", color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  ];

  return (
    <section className="py-16 md:py-24" style={{ background: '#FFFBEB' }}>
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#334155' }}>
            Почему мы
          </h2>
          <div className="h-px max-w-xs mx-auto mb-4" style={{ background: 'linear-gradient(90deg, transparent, #10B981, transparent)' }} />
          <p className="max-w-2xl mx-auto" style={{ color: '#64748B' }}>
            Внимание к деталям и забота о каждом клиенте
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((adv, index) => (
            <div
              key={adv.title}
              className="group p-6 rounded-2xl border transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{ 
                background: 'white',
                borderColor: '#E2E8F0',
              }}
            >
              <div 
                className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                style={{ background: adv.bg }}
              >
                <adv.icon className="h-7 w-7" style={{ color: adv.color }} />
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: '#334155' }}>{adv.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{adv.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// About Section Neo Pastel
function AboutSectionNeoPastel() {
  const features = [
    "Современный пастельный дизайн в тренде",
    "Натуральные и безопасные материалы",
    "Индивидуальный подбор цветовой гаммы",
    "Фотозоны и декор для Instagram",
  ];

  return (
    <section className="py-16 md:py-24" style={{ background: 'linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%)' }}>
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <div 
              className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-4"
              style={{ borderColor: 'white' }}
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop"
                alt="Pastel balloons"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full blur-3xl" style={{ background: 'rgba(251, 113, 133, 0.3)' }} />
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full blur-3xl" style={{ background: 'rgba(16, 185, 129, 0.3)' }} />
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#334155' }}>
              FlyArt <span style={{ color: '#10B981' }}>Neo</span>
            </h2>
            <div className="h-px max-w-xs mb-6" style={{ background: 'linear-gradient(90deg, #FB7185, transparent)' }} />
            
            <div className="space-y-4 leading-relaxed mb-8" style={{ color: '#64748B' }}>
              <p>
                Современная коллекция для тех, кто ценит эстетику и следит за трендами. 
                Мягкие пастельные оттенки, которые создают атмосферу уюта и нежности.
              </p>
              <p>
                Наши композиции идеально подходят для стильных фотосессий, 
                гендер-пати, baby shower и минималистичных торжеств.
              </p>
            </div>

            <ul className="space-y-3">
              {features.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div 
                    className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(16, 185, 129, 0.15)' }}
                  >
                    <Check className="h-4 w-4" style={{ color: '#10B981' }} />
                  </div>
                  <span style={{ color: '#334155' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// Reviews Section Neo Pastel
function ReviewsSectionNeoPastel() {
  const reviews = [
    { name: "Мария С.", text: "Очень нежные цвета! Идеально подошли для baby shower.", rating: 5 },
    { name: "Анна П.", text: "Стильно и современно. Все гости были в восторге!", rating: 5 },
    { name: "Ольга К.", text: "Наконец-то нашла шары без кричащих цветов. Спасибо!", rating: 5 },
  ];

  return (
    <section className="py-16 md:py-24" style={{ background: 'white' }}>
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#334155' }}>
            Отзывы клиентов
          </h2>
          <div className="h-px max-w-xs mx-auto mb-4" style={{ background: 'linear-gradient(90deg, transparent, #FB7185, transparent)' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div 
              key={i}
              className="p-6 rounded-2xl border"
              style={{ 
                background: 'rgba(16, 185, 129, 0.03)',
                borderColor: '#E2E8F0'
              }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} className="h-5 w-5 fill-current" style={{ color: '#FB7185' }} />
                ))}
              </div>
              <p className="mb-4 leading-relaxed" style={{ color: '#334155' }}>"{review.text}"</p>
              <p className="font-medium" style={{ color: '#10B981' }}>{review.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const IndexNeoPastel = () => {
  return (
    <NeoPastelTheme>
      <div className="min-h-screen flex flex-col" style={{ background: '#FFFBEB' }}>
        <SEO 
          title="FlyArt Neo Pastel — Нежные воздушные шары"
          description="Современные пастельные композиции для стильных праздников в Красноярске."
        />
        <Header />
        <main className="flex-1">
          <HeroSectionNeoPastel />
          <AdvantagesSectionNeoPastel />
          <AboutSectionNeoPastel />
          <ReviewsSectionNeoPastel />
        </main>
        <Footer />
      </div>
    </NeoPastelTheme>
  );
};

export default IndexNeoPastel;
