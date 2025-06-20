
import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if app is already installed (running in standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    console.log('PWA Status:', { iOS, standalone, userAgent: navigator.userAgent });

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show the prompt after a shorter delay and be more aggressive
      const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
      const lastDismissed = localStorage.getItem('pwa-install-prompt-last-dismissed');
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      
      // Show prompt if never dismissed, or if dismissed more than 1 day ago
      if (!hasSeenPrompt || (lastDismissed && (now - parseInt(lastDismissed)) > dayInMs)) {
        if (!standalone) {
          setTimeout(() => {
            console.log('Showing PWA install prompt');
            setShowPrompt(true);
          }, 2000); // Reduced delay
        }
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS or if beforeinstallprompt doesn't fire, show prompt after delay
    if ((iOS && !standalone) || (!iOS && !standalone)) {
      const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
      const lastDismissed = localStorage.getItem('pwa-install-prompt-last-dismissed');
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      
      if (!hasSeenPrompt || (lastDismissed && (now - parseInt(lastDismissed)) > dayInMs)) {
        setTimeout(() => {
          console.log('Showing PWA install prompt (fallback)');
          setShowPrompt(true);
        }, 3000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
    localStorage.setItem('pwa-install-prompt-dismissed', 'true');
    localStorage.setItem('pwa-install-prompt-last-dismissed', Date.now().toString());
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-prompt-dismissed', 'true');
    localStorage.setItem('pwa-install-prompt-last-dismissed', Date.now().toString());
  };

  // Don't show if already installed
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-pink-200 dark:border-pink-700 p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Smartphone size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">Install HCHAT</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Get the full app experience</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-button flex-shrink-0"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {isIOS ? (
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              To install this app on your iPhone/iPad:
            </p>
            <ol className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-decimal">
              <li>Tap the Share button <span className="inline-block w-4 h-4 bg-blue-500 rounded text-white text-center text-xs leading-4">↗</span> in Safari</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" to install the app</li>
            </ol>
            <button
              onClick={handleDismiss}
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 text-white py-2 rounded-xl font-medium text-sm transition-all duration-200 touch-button"
            >
              Got it!
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Install HCHAT for quick access and a better experience!
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 text-white py-2 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 touch-button"
              >
                <Download size={16} />
                <span>Install</span>
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm transition-colors touch-button"
              >
                Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;
