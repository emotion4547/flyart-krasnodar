import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreed) {
      toast({
        title: "Необходимо согласие",
        description: "Пожалуйста, примите условия обработки персональных данных",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);

    toast({
      title: "Заявка отправлена!",
      description: "Мы свяжемся с вами в ближайшее время",
    });

    // Reset form
    (e.target as HTMLFormElement).reset();
    setAgreed(false);
  };

  return (
    <section className="section-padding bg-gradient-to-br from-tiffany-light/30 via-background to-peach/20">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-peach/50 border border-peach-dark/30 mb-4">
              <Sparkles className="h-4 w-4 text-cta" />
              <span className="text-sm font-medium text-foreground">Индивидуальный заказ</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Не нашли, что искали?
            </h2>
            <div className="gold-line max-w-xs mx-auto mb-4" />
            <p className="text-muted-foreground">
              Оставьте заявку, и мы поможем подобрать идеальную композицию для вашего праздника
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ваше имя *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Как к вам обращаться?"
                  required
                  className="bg-card border-border focus:border-tiffany focus:ring-tiffany"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  required
                  className="bg-card border-border focus:border-tiffany focus:ring-tiffany"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Комментарий</Label>
              <Textarea
                id="comment"
                name="comment"
                placeholder="Опишите, какие шары вы ищете, для какого повода, пожелания по цвету..."
                rows={4}
                className="bg-card border-border focus:border-tiffany focus:ring-tiffany resize-none"
              />
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="agree"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="mt-1 data-[state=checked]:bg-tiffany data-[state=checked]:border-tiffany"
              />
              <Label htmlFor="agree" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                Я согласен на обработку персональных данных в соответствии с{" "}
                <a href="/privacy" className="text-tiffany hover:underline">
                  Политикой конфиденциальности
                </a>
              </Label>
            </div>

            <Button
              type="submit"
              variant="cta"
              size="lg"
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? (
                "Отправка..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Отправить заявку
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
