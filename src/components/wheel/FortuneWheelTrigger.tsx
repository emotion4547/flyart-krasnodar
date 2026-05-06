import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FortuneWheelDialog } from './FortuneWheelDialog';
import { useWheelSpins } from '@/hooks/useWheelSpins';

const WHEEL_SHOWN_KEY = 'flyart_wheel_shown'; // permanent localStorage key
const SHOW_DELAY_MS = 30000; // 30 seconds

export function FortuneWheelTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const { canSpin, isLoading, segments } = useWheelSpins();

  const { data: wheelEnabled = true, isLoading: settingLoading } = useQuery({
    queryKey: ['settings', 'wheel_enabled'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'wheel_enabled')
        .maybeSingle();
      if (error) throw error;
      return (data?.value as any)?.enabled !== false;
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    // Don't show if disabled, no segments or can't spin
    if (isLoading || settingLoading || !wheelEnabled || !canSpin || segments.length === 0) return;

    // Don't show again if wheel was ever shown on this device
    if (localStorage.getItem(WHEEL_SHOWN_KEY)) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem(WHEEL_SHOWN_KEY, 'true');
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isLoading, settingLoading, wheelEnabled, canSpin, segments.length]);

  if (!wheelEnabled) return null;

  return (
    <FortuneWheelDialog open={isOpen} onOpenChange={setIsOpen} />
  );
}
