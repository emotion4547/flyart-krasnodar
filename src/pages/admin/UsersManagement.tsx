import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { escapeILike } from '@/lib/sanitize';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Search, Users, Shield, ShieldCheck, User } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const roleLabels: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  admin: { label: 'Администратор', icon: ShieldCheck, color: 'bg-red-100 text-red-700' },
  manager: { label: 'Менеджер', icon: Shield, color: 'bg-blue-100 text-blue-700' },
  user: { label: 'Пользователь', icon: User, color: 'bg-gray-100 text-gray-700' },
};

export default function UsersManagement() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['admin-profiles', search],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        const s = escapeILike(search);
        query = query.or(`email.ilike.%${s}%,full_name.ilike.%${s}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      toast.success('Роль пользователя обновлена');
    },
    onError: () => {
      toast.error('Ошибка при обновлении роли');
    },
  });

  const getRoleBadge = (role: string) => {
    const config = roleLabels[role] || roleLabels.user;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Пользователи</h1>
        <p className="text-muted-foreground">Управление пользователями и ролями</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Зарегистрированные пользователи
          </CardTitle>
          <CardDescription>
            Изменяйте роли пользователей для управления доступом к админ-панели
          </CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по email или имени..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : profiles && profiles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Имя</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Дата регистрации</TableHead>
                  <TableHead className="text-right">Изменить роль</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.email}</TableCell>
                    <TableCell>{profile.full_name || '—'}</TableCell>
                    <TableCell>{getRoleBadge(profile.role)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(profile.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={profile.role}
                        onValueChange={(value) => updateRoleMutation.mutate({ id: profile.id, role: value })}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Администратор</SelectItem>
                          <SelectItem value="manager">Менеджер</SelectItem>
                          <SelectItem value="user">Пользователь</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Пользователи не найдены</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Описание ролей</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium">Администратор</p>
              <p className="text-sm text-muted-foreground">
                Полный доступ ко всем разделам админ-панели, включая управление пользователями и настройки
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium">Менеджер</p>
              <p className="text-sm text-muted-foreground">
                Доступ к управлению товарами, заказами, категориями и клиентами
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-gray-600 mt-0.5" />
            <div>
              <p className="font-medium">Пользователь</p>
              <p className="text-sm text-muted-foreground">
                Без доступа к админ-панели (обычный покупатель)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
