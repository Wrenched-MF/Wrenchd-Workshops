import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Download, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show custom install prompt after a delay
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 5000); // Show after 5 seconds
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      console.log('PWA is already installed');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    setDeferredPrompt(null);
  };

  if (!showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Dialog open={showInstallPrompt} onOpenChange={setShowInstallPrompt}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img src="/icon-192.png" alt="WRENCH'D" className="w-8 h-8 rounded" />
            Install WRENCH'D App
          </DialogTitle>
          <DialogDescription>
            Install WRENCH'D Workshop Manager for a better experience with offline access and desktop shortcuts.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-8 py-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Mobile</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Monitor className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Desktop</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Benefits:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Works offline when internet is unavailable</li>
              <li>• Faster loading and better performance</li>
              <li>• Desktop shortcut for quick access</li>
              <li>• Full-screen app experience</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button onClick={handleInstallClick} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Install App
            </Button>
            <Button variant="outline" onClick={handleDismiss} className="flex-1">
              Not Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}