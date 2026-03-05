import { useState, useEffect } from 'react';
import { FortuneWheelDialog } from './FortuneWheelDialog';
import { useWheelSpins } from '@/hooks/useWheelSpins';

const WHEEL_SHOWN_KEY = 'flyart_wheel_shown'; // permanent localStorage key
const SHOW_DELAY_MS = 30000; // 30 seconds

export function FortuneWheelTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const { canSpin, isLoading, segments } = useWheelSpins();

  useEffect(() => {
    // Don't show if no segments or can't spin
    if (isLoading || !canSpin || segments.length === 0) return;

    // Don't show again if wheel was ever shown on this device
    if (localStorage.getItem(WHEEL_SHOWN_KEY)) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem(WHEEL_SHOWN_KEY, 'true');
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isLoading, canSpin, segments.length]);

  return (
    <FortuneWheelDialog open={isOpen} onOpenChange={setIsOpen} />
  );
}
