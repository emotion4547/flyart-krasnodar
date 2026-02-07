import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Handshake } from 'lucide-react';
import AdminCouponsContent from './AdminCouponsContent';
import AdminUserCouponsContent from './AdminUserCouponsContent';
import AdminReferralContent from './AdminReferralContent';

const AdminPromoCodesHub = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Промокоды</h2>
        <p className="text-sm text-muted-foreground">
          Управление скидочными кодами и реферальной программой
        </p>
      </div>

      <Tabs defaultValue="admin" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Администраторские</span>
            <span className="sm:hidden">Админ</span>
          </TabsTrigger>
          <TabsTrigger value="user" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Пользовательские</span>
            <span className="sm:hidden">Юзеры</span>
          </TabsTrigger>
          <TabsTrigger value="referral" className="flex items-center gap-2">
            <Handshake className="h-4 w-4" />
            <span className="hidden sm:inline">Реферальная</span>
            <span className="sm:hidden">Рефералы</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admin">
          <AdminCouponsContent />
        </TabsContent>

        <TabsContent value="user">
          <AdminUserCouponsContent />
        </TabsContent>

        <TabsContent value="referral">
          <AdminReferralContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPromoCodesHub;
