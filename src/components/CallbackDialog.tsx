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

export function CallbackDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

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
              onChange={(e) => setPhone(e.target.value)}
              required
              maxLength={20}
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
