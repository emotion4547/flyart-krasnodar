import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  User,
  Package,
  MapPin,
  Ticket,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useEffect } from 'react';

interface AccountLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

const menuItems = [
  { href: '/account', label: 'Профиль', icon: User },
  { href: '/account/orders', label: 'Мои заказы', icon: Package },
  { href: '/account/addresses', label: 'Адреса доставки', icon: MapPin },
  { href: '/account/coupons', label: 'Мои купоны', icon: Ticket },
  { href: '/account/favorites', label: 'Избранное', icon: Heart },
  { href: '/account/settings', label: 'Настройки', icon: Settings },
];

export function AccountLayout({ children, title, description }: AccountLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth?redirect=' + encodeURIComponent(location.pathname));
    }
  }, [user, isLoading, navigate, location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-tiffany" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={title} description={description} noindex />
      <Header />

      <main className="flex-1 section-padding bg-warm-cream">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border/50 overflow-hidden sticky top-24">
                {/* User info */}
                <div className="p-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-tiffany-light flex items-center justify-center">
                      <User className="h-6 w-6 text-tiffany" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {user.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Личный кабинет
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="p-2">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                          isActive
                            ? 'bg-tiffany-light text-tiffany font-medium'
                            : 'text-foreground hover:bg-muted'
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="h-4 w-4" />}
                      </Link>
                    );
                  })}
                </nav>

                {/* Sign out */}
                <div className="p-2 border-t border-border/50">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 w-full transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Выйти</span>
                  </button>
                </div>
              </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {title}
              </h1>
              <div className="gold-line max-w-xs mb-6" />
              
              {children}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
