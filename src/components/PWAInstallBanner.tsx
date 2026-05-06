import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;

    // Check if dismissed recently (within 7 days)
    const dismissedAt = localStorage.getItem("pwa-banner-dismissed");
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Show iOS instruction banner after a delay
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // Handle Android/Chrome install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-banner-dismissed", new Date().toISOString());
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden animate-fade-up">
      <div className="bg-gradient-to-r from-tiffany to-tiffany-dark rounded-2xl p-4 shadow-xl flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img 
            src="/pwa-icon.png" 
            alt="Кошарик" 
            className="h-10 w-10 object-contain"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">Кошарик</p>
          {isIOS ? (
            <p className="text-white/80 text-xs">
              Нажмите <span className="font-medium">«Поделиться»</span> → <span className="font-medium">«На экран Домой»</span>
            </p>
          ) : (
            <p className="text-white/80 text-xs">Установите приложение для быстрого доступа</p>
          )}
        </div>

        {!isIOS && deferredPrompt && (
          <Button
            onClick={handleInstall}
            size="sm"
            className="bg-white text-tiffany hover:bg-white/90 flex-shrink-0 font-medium"
          >
            <Download className="h-4 w-4 mr-1" />
            Установить
          </Button>
        )}

        <button
          onClick={handleDismiss}
          className="text-white/70 hover:text-white transition-colors flex-shrink-0"
          aria-label="Закрыть"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
