import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { FortuneWheel } from './FortuneWheel';
import { useWheelSpins } from '@/hooks/useWheelSpins';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy, Check, Gift, Ticket, X, PartyPopper } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

interface FortuneWheelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WheelSegment {
  id: string;
  label: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  prize_type: 'discount' | 'gift' | 'nothing';
  gift_product_id: string | null;
  probability: number;
  color: string;
}

export function FortuneWheelDialog({ open, onOpenChange }: FortuneWheelDialogProps) {
  const { user } = useAuth();
  const { segments, canSpin, nextSpinDate, recordSpin, savePendingSpin } = useWheelSpins();
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ segment: WheelSegment; couponCode?: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSpinEnd = async (segment: WheelSegment) => {
    if (segment.prize_type === 'nothing') {
      setResult({ segment });
      return;
    }

    if (user) {
      // Авторизованный пользователь
      const spinResult = await recordSpin(segment);
      if (spinResult) {
        setResult({ segment, couponCode: spinResult.couponCode });
        
        // Confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        toast.error('Ошибка при сохранении приза');
      }
    } else {
      // Неавторизованный — сохраняем pending
      await savePendingSpin(segment);
      setResult({ segment });
      toast.info('Войдите, чтобы получить промокод', {
        action: {
          label: 'Войти',
          onClick: () => {
            onOpenChange(false);
          },
        },
      });
    }
  };

  const copyCode = () => {
    if (result?.couponCode) {
      navigator.clipboard.writeText(result.couponCode);
      setCopiedCode(true);
      toast.success('Код скопирован');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleClose = () => {
    setResult(null);
    setIsSpinning(false);
    onOpenChange(false);
  };

  // Format next spin date
  const formatNextSpin = () => {
    if (!nextSpinDate) return null;
    const diff = nextSpinDate.getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `через ${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-gradient-to-b from-warm-cream to-white">
        <VisuallyHidden>
          <DialogTitle>Колесо Фортуны</DialogTitle>
        </VisuallyHidden>
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-1.5 hover:bg-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 text-center">
          {!result ? (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                🎡 Колесо Фортуны
              </h2>
              <p className="text-muted-foreground mb-6">
                {canSpin 
                  ? 'Крутите и выигрывайте скидки!' 
                  : `Следующая попытка ${formatNextSpin()}`
                }
              </p>

              {canSpin ? (
                <FortuneWheel
                  segments={segments}
                  onSpinEnd={handleSpinEnd}
                  isSpinning={isSpinning}
                  setIsSpinning={setIsSpinning}
                />
              ) : (
                <div className="py-8">
                  <p className="text-muted-foreground">
                    Вы уже крутили колесо. Возвращайтесь {formatNextSpin()}!
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="py-4">
              {result.segment.prize_type === 'nothing' ? (
                <>
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">😢</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Не повезло...
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Попробуйте ещё раз через 15 дней!
                  </p>
                </>
              ) : (
                <>
                  <div className="h-20 w-20 rounded-full bg-tiffany-light flex items-center justify-center mx-auto mb-4">
                    <PartyPopper className="h-10 w-10 text-tiffany" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Поздравляем! 🎉
                  </h3>
                  
                  <div className="bg-gradient-to-r from-tiffany-light to-gold-light rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {result.segment.prize_type === 'gift' ? (
                        <Gift className="h-6 w-6 text-pink-500" />
                      ) : (
                        <Ticket className="h-6 w-6 text-tiffany" />
                      )}
                      <span className="text-2xl font-bold text-foreground">
                        {result.segment.prize_type === 'gift' 
                          ? 'Подарок!'
                          : result.segment.discount_type === 'percentage'
                            ? `−${result.segment.discount_value}%`
                            : `−${result.segment.discount_value} ₽`
                        }
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {result.segment.label}
                    </p>
                  </div>

                  {result.couponCode ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-2">
                        Ваш промокод:
                      </p>
                      <div className="flex items-center gap-2 bg-muted rounded-lg p-3 mb-4">
                        <code className="flex-1 font-mono text-lg font-bold text-foreground">
                          {result.couponCode}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={copyCode}
                        >
                          {copiedCode ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">
                        Купон действует 30 дней. Найти его можно в личном кабинете.
                      </p>
                    </>
                  ) : (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        Войдите, чтобы получить промокод
                      </p>
                      <Link to="/auth?redirect=/account/coupons">
                        <Button variant="cta" onClick={handleClose}>
                          Войти и получить
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}

              <Button variant="outline" onClick={handleClose} className="w-full">
                Закрыть
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
