import { Loader2 } from 'lucide-react';
interface LoadingScreenProps {
  title?: string;
  message?: string;
  note?: string;
}
export function LoadingScreen({
  title = "Building your Founder's Idea Kit...",
  message = 'Turning your answers into a step-by-step plan.',
  note = 'This usually takes under a minute.'
}: LoadingScreenProps) {
  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-brand-dark text-white items-center justify-center px-6 md:px-8 text-center">
      <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-brand-accent animate-spin mb-8 md:mb-10" />
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
        {title}
      </h1>
      <p className="text-brand-surface/80 text-base md:text-lg mb-4">
        {message}
      </p>
      {note &&
      <p className="text-brand-surface/60 text-sm md:text-base">
          {note}
        </p>
      }
    </div>);

}