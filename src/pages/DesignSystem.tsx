import { SEO } from "@/components/SEO";

const ColorSwatch = ({ 
  name, 
  cssVar, 
  description 
}: { 
  name: string; 
  cssVar: string; 
  description?: string;
}) => (
  <div className="flex flex-col gap-2">
    <div 
      className="h-20 w-full rounded-lg shadow-md border border-border"
      style={{ backgroundColor: `hsl(var(${cssVar}))` }}
    />
    <div>
      <p className="font-medium text-foreground">{name}</p>
      <p className="text-xs text-muted-foreground font-mono">{cssVar}</p>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
  </div>
);

const ColorGroup = ({ 
  title, 
  children 
}: { 
  title: string; 
  children: React.ReactNode;
}) => (
  <div className="mb-12">
    <h2 className="text-2xl font-display font-semibold text-foreground mb-6 pb-2 border-b border-border">
      {title}
    </h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {children}
    </div>
  </div>
);

const DesignSystem = () => {
  return (
    <>
      <SEO
        title="Дизайн-система | Кошарик"
        description="Полная цветовая палитра и дизайн-система сайта Кошарик"
      />
      <div className="min-h-screen bg-background py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Дизайн-система Кошарик
          </h1>
          <p className="text-muted-foreground mb-12">
            Полная цветовая палитра и токены дизайн-системы
          </p>

          {/* Brand Colors */}
          <ColorGroup title="🎨 Фирменные цвета">
            <ColorSwatch 
              name="Tiffany" 
              cssVar="--tiffany" 
              description="Основной бренд-цвет"
            />
            <ColorSwatch 
              name="Tiffany Light" 
              cssVar="--tiffany-light" 
              description="Светлый вариант"
            />
            <ColorSwatch 
              name="Tiffany Dark" 
              cssVar="--tiffany-dark" 
              description="Тёмный вариант"
            />
            <ColorSwatch 
              name="Peach" 
              cssVar="--peach" 
              description="Персиковый"
            />
            <ColorSwatch 
              name="Peach Dark" 
              cssVar="--peach-dark" 
              description="Тёмный персиковый"
            />
            <ColorSwatch 
              name="Gold" 
              cssVar="--gold" 
              description="Золотой/шампань"
            />
            <ColorSwatch 
              name="Gold Light" 
              cssVar="--gold-light" 
              description="Светлое золото"
            />
            <ColorSwatch 
              name="Graphite" 
              cssVar="--graphite" 
              description="Графитовый"
            />
            <ColorSwatch 
              name="Graphite Light" 
              cssVar="--graphite-light" 
              description="Светлый графит"
            />
          </ColorGroup>

          {/* Base Colors */}
          <ColorGroup title="📐 Базовые цвета">
            <ColorSwatch 
              name="Background" 
              cssVar="--background" 
              description="Фон страницы"
            />
            <ColorSwatch 
              name="Foreground" 
              cssVar="--foreground" 
              description="Основной текст"
            />
            <ColorSwatch 
              name="Card" 
              cssVar="--card" 
              description="Фон карточек"
            />
            <ColorSwatch 
              name="Card Foreground" 
              cssVar="--card-foreground" 
              description="Текст в карточках"
            />
            <ColorSwatch 
              name="Popover" 
              cssVar="--popover" 
              description="Фон всплывающих окон"
            />
          </ColorGroup>

          {/* Semantic Colors */}
          <ColorGroup title="🎯 Семантические цвета">
            <ColorSwatch 
              name="Primary" 
              cssVar="--primary" 
              description="Основной акцент"
            />
            <ColorSwatch 
              name="Primary Foreground" 
              cssVar="--primary-foreground" 
              description="Текст на primary"
            />
            <ColorSwatch 
              name="Secondary" 
              cssVar="--secondary" 
              description="Вторичный цвет"
            />
            <ColorSwatch 
              name="Secondary Foreground" 
              cssVar="--secondary-foreground" 
              description="Текст на secondary"
            />
            <ColorSwatch 
              name="Accent" 
              cssVar="--accent" 
              description="Акцентный цвет"
            />
            <ColorSwatch 
              name="Muted" 
              cssVar="--muted" 
              description="Приглушённый фон"
            />
            <ColorSwatch 
              name="Muted Foreground" 
              cssVar="--muted-foreground" 
              description="Приглушённый текст"
            />
          </ColorGroup>

          {/* CTA & Destructive */}
          <ColorGroup title="🔥 CTA и акценты">
            <ColorSwatch 
              name="CTA" 
              cssVar="--cta" 
              description="Призыв к действию"
            />
            <ColorSwatch 
              name="CTA Hover" 
              cssVar="--cta-hover" 
              description="CTA при наведении"
            />
            <ColorSwatch 
              name="Destructive" 
              cssVar="--destructive" 
              description="Опасное действие"
            />
          </ColorGroup>

          {/* UI Colors */}
          <ColorGroup title="🔧 UI элементы">
            <ColorSwatch 
              name="Border" 
              cssVar="--border" 
              description="Границы элементов"
            />
            <ColorSwatch 
              name="Input" 
              cssVar="--input" 
              description="Поля ввода"
            />
            <ColorSwatch 
              name="Ring" 
              cssVar="--ring" 
              description="Фокус-кольцо"
            />
          </ColorGroup>

          {/* Warm Colors */}
          <ColorGroup title="☀️ Тёплые оттенки">
            <ColorSwatch 
              name="Warm White" 
              cssVar="--warm-white" 
              description="Тёплый белый"
            />
            <ColorSwatch 
              name="Warm Cream" 
              cssVar="--warm-cream" 
              description="Кремовый"
            />
          </ColorGroup>

          {/* Typography */}
          <div className="mb-12">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-6 pb-2 border-b border-border">
              ✍️ Типографика
            </h2>
            <div className="space-y-6">
              <div className="p-6 bg-card rounded-xl border border-border">
                <p className="text-sm text-muted-foreground mb-2">Display шрифт</p>
                <p className="font-display text-4xl text-foreground">Playfair Display</p>
                <p className="font-display text-xl text-muted-foreground mt-2">
                  Используется для заголовков и акцентов
                </p>
              </div>
              <div className="p-6 bg-card rounded-xl border border-border">
                <p className="text-sm text-muted-foreground mb-2">Основной шрифт</p>
                <p className="font-sans text-4xl text-foreground">Montserrat</p>
                <p className="font-sans text-xl text-muted-foreground mt-2">
                  Используется для основного текста и UI
                </p>
              </div>
            </div>
          </div>

          {/* Components */}
          <div className="mb-12">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-6 pb-2 border-b border-border">
              🧩 Компоненты
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-card rounded-xl border border-border">
                <p className="text-sm text-muted-foreground mb-4">CTA Кнопка</p>
                <button className="btn-cta px-6 py-3 rounded-lg font-medium">
                  Оформить заказ
                </button>
              </div>
              <div className="p-6 bg-card rounded-xl border border-border">
                <p className="text-sm text-muted-foreground mb-4">Бейджи</p>
                <div className="flex gap-2 flex-wrap">
                  <span className="badge-hit">Хит</span>
                  <span className="badge-new">Новинка</span>
                  <span className="badge-sale">Скидка</span>
                </div>
              </div>
              <div className="p-6 bg-card rounded-xl border border-border">
                <p className="text-sm text-muted-foreground mb-4">Золотая линия</p>
                <div className="gold-line w-full my-4"></div>
              </div>
            </div>
          </div>

          {/* Shadows */}
          <div className="mb-12">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-6 pb-2 border-b border-border">
              🌫️ Тени
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 bg-card rounded-xl" style={{ boxShadow: 'var(--shadow-soft)' }}>
                <p className="font-medium text-foreground">Shadow Soft</p>
                <p className="text-xs text-muted-foreground font-mono">--shadow-soft</p>
              </div>
              <div className="p-8 bg-card rounded-xl" style={{ boxShadow: 'var(--shadow-card)' }}>
                <p className="font-medium text-foreground">Shadow Card</p>
                <p className="text-xs text-muted-foreground font-mono">--shadow-card</p>
              </div>
              <div className="p-8 bg-card rounded-xl" style={{ boxShadow: 'var(--shadow-hover)' }}>
                <p className="font-medium text-foreground">Shadow Hover</p>
                <p className="text-xs text-muted-foreground font-mono">--shadow-hover</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DesignSystem;
