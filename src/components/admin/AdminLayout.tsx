import { ReactNode, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Upload,
  ChevronRight,
  UserCog,
  AlertTriangle,
  RefreshCw,
  Play,
  MessageSquareText,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { title: 'Дашборд', url: '/admin4547', icon: LayoutDashboard },
  { title: 'Каталог', url: '/admin4547/catalog', icon: Package },
  { title: 'Заказы', url: '/admin4547/orders', icon: ShoppingCart },
  { title: 'Клиенты', url: '/admin4547/clients', icon: Users },
  { title: 'Контент', url: '/admin4547/content', icon: FileText },
  { title: 'Маркетинг', url: '/admin4547/marketing', icon: BarChart3 },
  { title: 'Настройки', url: '/admin4547/settings', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAdmin, isLoading, roleStatus, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect to login if fully loaded and no user
    if (!isLoading && !user) {
      navigate('/admin4547/login');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    // Redirect non-admin users only after role check completed (not loading, not error)
    if (!isLoading && user && roleStatus === 'not-admin') {
      navigate('/');
    }
  }, [user, roleStatus, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin4547/login');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Show loading while checking auth state
  if (isLoading || roleStatus === 'loading') {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="space-y-4 w-64 text-center">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <p className="text-sm text-muted-foreground mt-4">Проверка доступа...</p>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (roleStatus === 'error') {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-6">
          <div className="h-16 w-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">Ошибка загрузки</h2>
          <p className="text-muted-foreground">
            Не удалось проверить права доступа. Возможно, проблема с сетью или сервером.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Повторить
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              Выйти
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No user - will redirect
  if (!user) {
    return null;
  }

  // Not admin - will redirect
  if (!isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="p-4 border-b border-border">
            <Link to="/admin4547" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">FA</span>
              </div>
              <span className="font-semibold text-lg">Кошарик Admin</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Меню</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.url || 
                      (item.url !== '/admin4547' && location.pathname.startsWith(item.url));
                    
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link 
                            to={item.url}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              isActive 
                                ? 'bg-primary/10 text-primary font-medium' 
                                : 'hover:bg-muted'
                            }`}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">Администратор</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border bg-background flex items-center px-4 gap-4">
            <SidebarTrigger />
            <div className="flex-1" />
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
              Перейти на сайт →
            </Link>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
