import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { KitData, KitView } from './KitView';
import { LoadingScreen } from './LoadingScreen';

const DEMO_PREFIX = 'demo-';
const SLOW_PENDING_MS = 90_000;

function PendingKit({ createdAt }: {createdAt: number;}) {
  const [slow, setSlow] = useState(() => Date.now() - createdAt > SLOW_PENDING_MS);
  useEffect(() => {
    if (slow) return;
    const wait = Math.max(0, createdAt + SLOW_PENDING_MS - Date.now());
    const timer = setTimeout(() => setSlow(true), wait);
    return () => clearTimeout(timer);
  }, [createdAt, slow]);

  return (
    <LoadingScreen
      title="Building your kit"
      message="We're turning your answers into a step-by-step plan."
      note="This usually takes under a minute. This page updates on its own.">

      {slow &&
      <div className="mt-8 w-full max-w-md">
          <p className="text-brand-surface/90 text-base md:text-lg mb-4">
            Still working, this can take a minute.
          </p>
          <button
          type="button"
          onClick={() => window.location.reload()}
          className="w-full min-h-[44px] bg-white/10 text-white py-3 rounded-xl font-bold text-base md:text-lg hover:bg-white/20 transition-colors">

            Refresh
          </button>
        </div>
      }
    </LoadingScreen>);

}

function MessageScreen({ title, message }: {title: string;message: string;}) {
  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-brand-dark text-white items-center justify-center px-6 md:px-8 text-center">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">{title}</h1>
      <p className="text-brand-surface/80 text-base md:text-lg mb-8 md:mb-10">{message}</p>
      <a
        href="/"
        className="w-full max-w-md inline-flex items-center justify-center min-h-[44px] bg-brand-cta text-brand-dark py-4 md:py-5 rounded-xl font-bold text-lg md:text-xl hover:bg-brand-cta/90 transition-colors shadow-lg">

        Start again
      </a>
    </div>);

}

function KitContent({ kit }: {kit: KitData | null | undefined;}) {
  if (kit === undefined) {
    return <LoadingScreen title="Opening your kit..." message="One moment." note="" />;
  }
  if (kit === null) {
    return (
      <MessageScreen
        title="We couldn't find that kit."
        message="Check the link in your email, or answer the seven questions again to build a new one." />);

  }
  if (kit.status === 'pending') {
    return <PendingKit createdAt={kit.createdAt} />;
  }
  if (kit.status === 'failed' || !kit.summary || !kit.phases) {
    return (
      <MessageScreen
        title="Something went wrong building your kit."
        message="Your answers were saved, but we couldn't finish the plan. Please try again." />);

  }
  return <KitView kit={kit} />;
}

function LiveKit({ kitId }: {kitId: string;}) {
  const kit = useQuery(api.kits.getKit, { kitId });
  return <KitContent kit={kit} />;
}

function DemoKit({ name }: {name: string;}) {
  const [kit, setKit] = useState<KitData | null | undefined>(undefined);
  useEffect(() => {
    let active = true;
    import('../dev/demoKits').then(({ loadDemoKit }) => loadDemoKit(name)).then((data) => {
      if (active) setKit(data);
    });
    return () => {
      active = false;
    };
  }, [name]);
  return <KitContent kit={kit} />;
}

export function KitPage({ kitId }: {kitId: string;}) {
  if (import.meta.env.DEV && kitId.startsWith(DEMO_PREFIX)) {
    return <DemoKit name={kitId.slice(DEMO_PREFIX.length)} />;
  }
  return <LiveKit kitId={kitId} />;
}
