import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
interface LoadingScreenProps {
  onComplete: () => void;
}
export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 60000); // Wait 60 seconds to account for retries and backoff
    return () => clearTimeout(timer);
  }, [onComplete]);
  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-brand-dark text-white items-center justify-center px-6 md:px-8 text-center">
      <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-brand-accent animate-spin mb-8 md:mb-10" />
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
        Building your Founder's Idea Kit...
      </h1>
      <p className="text-brand-surface/80 text-base md:text-lg mb-4">
        Generating your personalized documents with AI.
      </p>
      <p className="text-brand-surface/60 text-sm md:text-base">
        This may take 30-60 seconds with rate limit handling.
      </p>
    </div>);

}