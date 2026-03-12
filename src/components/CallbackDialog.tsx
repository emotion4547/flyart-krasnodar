import { useState } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const callbackSchema = z.object({
  name: z.string().trim().min(2, "Имя должно содержать минимум 2 символа").max(100),
  phone: z.string().trim().min(10, "Введите корректный номер телефона").max(20),
});

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  
  if (digits.length === 0) return "";
  if (digits.length <= 1) return `+7`;
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
};

interface CallbackDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export function CallbackDialog({ open: controlledOpen, onOpenChange, showTrigger = true }: CallbackDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = callbackSchema.safeParse({ name, phone });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("contact_requests")
        .insert({
          name: result.data.name,
          phone: result.data.phone,
          comment: "Заявка на обратный звонок",
        });

      if (error) throw error;

      // Telegram notification
      try {
        const message = `📞 <b>Заявка на обратный звонок</b>\n\n👤 Имя: ${result.data.name}\n📱 Телефон: ${result.data.phone}`;
        await supabase.functions.invoke("send-telegram", {
          body: { message },
        });
      } catch (tgErr) {
        console.error("Telegram notification failed:", tgErr);
      }

      toast.success("Заявка отправлена! Мы перезвоним вам в ближайшее время.");
      setName("");
      setPhone("");
      setOpen(false);
    } catch (error) {
      console.error("Error submitting callback request:", error);
      toast.error("Ошибка при отправке заявки. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button 
            variant="tiffany" 
            size="sm" 
            className="gap-2 hidden sm:flex"
          >
            <Phone className="h-4 w-4" />
            Обратный звонок
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Заказать обратный звонок
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Оставьте свои контакты и мы перезвоним вам в течение 15 минут
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="callback-name">Ваше имя</Label>
            <Input
              id="callback-name"
              placeholder="Введите имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="callback-phone">Телефон</Label>
            <Input
              id="callback-phone"
              type="tel"
              placeholder="+7 (___) ___-__-__"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              required
            />
          </div>
          <Button 
            type="submit" 
            variant="cta" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Отправка..." : "Перезвоните мне"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Нажимая кнопку, вы соглашаетесь с{" "}
            <a href="/privacy" className="text-primary hover:underline">
              политикой конфиденциальности
            </a>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
