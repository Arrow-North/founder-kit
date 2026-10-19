import { useEffect, useRef, useState } from 'react';
import type { FunctionReturnType } from 'convex/server';
import { Check, ChevronDown, ChevronUp, Copy, Printer } from 'lucide-react';
import { api } from '../../convex/_generated/api';

export type KitData = NonNullable<FunctionReturnType<typeof api.kits.getKit>>;
type Phase = NonNullable<KitData['phases']>['validate'];
type Step = Phase['steps'][number];
type PhaseKey = 'validate' | 'design' | 'build';

export const ARROW_NORTH_URL = 'https://arrownorth.design';

const PHASE_TABS: { key: PhaseKey; label: string }[] = [
  { key: 'validate', label: 'Validate' },
  { key: 'design', label: 'Design' },
  { key: 'build', label: 'Build' },
];

const progressKey = (kitId: string) => `founder-kit-progress:${kitId}`;

function useProgress(kitId: string) {
  const [done, setDone] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(progressKey(kitId)) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(progressKey(kitId), JSON.stringify(done));
    } catch {
      // Storage unavailable (private mode); progress lasts for this visit only
    }
  }, [kitId, done]);

  const toggle = (id: string) =>
    setDone((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  return { done, toggle };
}

async function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the legacy copy below
    }
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!ok) throw new Error('Copy failed');
}

function SummaryItem({ label, value }: {label: string;value: string;}) {
  return (
    <div>
      <div className="text-brand-accent text-xs md:text-sm font-bold uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-brand-dark text-sm md:text-base leading-snug">{value}</div>
    </div>);

}

function CopyButton({ text }: {text: string;}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={() => copyText(text).then(() => setCopied(true), () => setCopied(false))}
      className="min-h-[44px] px-4 inline-flex items-center gap-2 bg-brand-accent text-white rounded-lg font-bold text-sm md:text-base hover:bg-brand-accent/90 transition-colors print:hidden">

      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? 'Copied' : 'Copy'}
    </button>);

}

function PromptBox({ text }: {text: string;}) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return;
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, expanded]);

  const clamped = !expanded && overflows;

  return (
    <div className="bg-brand-surface/60 border border-brand-dark/10 rounded-xl p-4 text-brand-dark text-sm md:text-base leading-relaxed print:bg-white">
      <div
        ref={textRef}
        className={`whitespace-pre-wrap break-words ${expanded ? '' : 'max-h-[13em] overflow-hidden'} ${
        clamped ? '[mask-image:linear-gradient(to_bottom,black_55%,transparent)]' : ''} print:max-h-none print:overflow-visible print:[mask-image:none]`}>

        {text}
      </div>
      {(overflows || expanded) &&
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="mt-1 -mb-2 min-h-[44px] inline-flex items-center gap-1 text-brand-accent font-bold text-sm md:text-base hover:underline print:hidden">

          {expanded ? 'Show less' : 'Show full prompt'}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      }
    </div>);

}

function StepCard({ step, number, isDone, onToggle }: {step: Step;number: number;isDone: boolean;onToggle: () => void;}) {
  return (
    <li className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-black/5 break-inside-avoid-page">
      <div className="flex items-start gap-3">
        <label className="flex-shrink-0 -m-2 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer print:hidden">
          <input
            type="checkbox"
            checked={isDone}
            onChange={onToggle}
            aria-label={`Mark step ${number} done`}
            className="w-6 h-6 accent-brand-accent cursor-pointer" />
        </label>
        <div className="min-w-0 flex-1">
          <h3 className={`text-lg md:text-xl font-bold text-brand-dark leading-snug ${isDone ? 'line-through text-brand-dark/50' : ''}`}>
            <span className="text-brand-accent">{number}.</span> {step.title}
          </h3>
          <p className="text-brand-dark/80 text-sm md:text-base mt-1 leading-relaxed">{step.goal}</p>
        </div>
      </div>

      {step.todo.length > 0 &&
      <div className="mt-4">
          <div className="text-brand-accent text-xs md:text-sm font-bold uppercase tracking-wider mb-2">What to do</div>
          <ul className="space-y-2">
            {step.todo.map((item, idx) =>
          <li key={idx} className="text-brand-dark text-sm md:text-base flex items-start gap-2">
                <span className="text-brand-accent mt-0.5">•</span>
                <span className="min-w-0">{item}</span>
              </li>
          )}
          </ul>
        </div>
      }

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="text-brand-accent text-xs md:text-sm font-bold uppercase tracking-wider">Your prompt</div>
          <CopyButton text={step.prompt} />
        </div>
        <PromptBox text={step.prompt} />
        {step.pasteInto !== 'ChatGPT or Claude' &&
        <p className="text-brand-dark/60 text-sm mt-2">
            Paste into: <span className="font-medium text-brand-dark">{step.pasteInto}</span>
          </p>
        }
      </div>

      {step.tip &&
      <div className="mt-4 bg-brand-accent/10 border border-brand-accent/30 rounded-xl p-4">
          <p className="text-brand-dark text-sm md:text-base">
            <span className="font-bold">Tip: </span>{step.tip}
          </p>
        </div>
      }
    </li>);

}

export function KitView({ kit }: {kit: KitData;}) {
  const [activeTab, setActiveTab] = useState<PhaseKey>('validate');
  const { done, toggle } = useProgress(kit.kitId);
  const summary = kit.summary;
  const phases = kit.phases;
  if (!summary || !phases) return null;

  const stepId = (key: PhaseKey, index: number) => `${key}-${index}`;
  const doneCount = (key: PhaseKey) =>
    phases[key].steps.filter((_, i) => done.includes(stepId(key, i))).length;

  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-surface text-brand-dark pb-16 md:pb-20 print:bg-white print:pb-0">

      <div className="px-4 sm:px-6 md:px-8 pt-10 md:pt-12 lg:pt-14 pb-6 md:pb-8 bg-brand-dark print:bg-white print:pt-0 print:pb-4">
        <p className="text-brand-accent font-medium text-sm md:text-base mb-2">
          Hi {kit.firstName || 'there'}
        </p>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-3 break-words print:text-brand-dark">
          {summary.productName}
        </h1>
        <p className="text-brand-surface/80 text-base md:text-lg print:text-brand-dark/80">{summary.pitch}</p>
      </div>

      <div className="px-4 sm:px-6 md:px-8 pt-6 md:pt-8 pb-4 md:pb-6">
        <div className="text-xs md:text-sm font-bold uppercase tracking-widest text-brand-dark/40 mb-3 md:mb-4">Your product</div>
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-black/5 space-y-4 md:space-y-5 break-inside-avoid-page">
          <SummaryItem label="Target user" value={summary.targetUser} />
          <SummaryItem label="Problem" value={summary.problem} />
          <SummaryItem label="Core outcome" value={summary.coreOutcome} />
          <SummaryItem label="Riskiest assumption" value={summary.riskiestAssumption} />
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="w-full mt-4 md:mt-5 min-h-[44px] py-3 md:py-4 inline-flex items-center justify-center gap-2 bg-white text-brand-dark border border-brand-dark/15 rounded-xl font-bold text-base md:text-lg hover:bg-white/70 transition-colors print:hidden">

          <Printer size={18} />
          Save as PDF
        </button>
      </div>

      <div className="px-4 sm:px-6 md:px-8 pt-2 md:pt-4 print:hidden" role="tablist" aria-label="Kit phases">
        <div className="grid grid-cols-3 gap-2 bg-brand-dark/5 p-1 rounded-xl">
          {PHASE_TABS.map(({ key, label }) => {
            const isActive = key === activeTab;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                id={`tab-${key}`}
                aria-selected={isActive}
                aria-controls={`panel-${key}`}
                onClick={() => setActiveTab(key)}
                className={`min-h-[44px] py-2 px-1 rounded-lg transition-colors ${
                isActive ? 'bg-brand-dark text-white shadow-sm' : 'text-brand-dark hover:bg-white/60'}`
                }>

                <span className="block font-bold text-sm md:text-base">{label}</span>
                <span className={`block text-xs mt-0.5 ${isActive ? 'text-brand-surface/70' : 'text-brand-dark/50'}`}>
                  {doneCount(key)} of {phases[key].steps.length} done
                </span>
              </button>);

          })}
        </div>
      </div>

      {PHASE_TABS.map(({ key, label }) => {
        const phase = phases[key];
        const count = doneCount(key);
        return (
          <section
            key={key}
            id={`panel-${key}`}
            role="tabpanel"
            aria-labelledby={`tab-${key}`}
            className={`px-4 sm:px-6 md:px-8 pt-6 md:pt-8 ${key === activeTab ? 'block' : 'hidden'} print:block print:break-before-page`}>

            <h2 className="text-2xl md:text-3xl font-bold text-brand-dark mb-2">{label}</h2>
            <p className="text-brand-dark/80 text-base md:text-lg leading-relaxed mb-4">{phase.intro}</p>
            <div className="mb-5 md:mb-6 print:hidden">
              <div className="text-brand-dark/60 text-sm font-medium mb-2">
                {count} of {phase.steps.length} done
              </div>
              <div className="w-full h-1 bg-brand-dark/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-accent transition-all duration-300 ease-out"
                  style={{ width: `${count / phase.steps.length * 100}%` }} />
              </div>
            </div>
            <ol className="space-y-4 md:space-y-5">
              {phase.steps.map((step, i) =>
              <StepCard
                key={stepId(key, i)}
                step={step}
                number={i + 1}
                isDone={done.includes(stepId(key, i))}
                onToggle={() => toggle(stepId(key, i))} />
              )}
            </ol>
          </section>);

      })}

      <div className="px-4 sm:px-6 md:px-8 pt-10 md:pt-12 break-inside-avoid-page">
        <div className="bg-brand-dark rounded-xl p-6 md:p-8 text-center print:bg-white print:border print:border-brand-dark/20">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 print:text-brand-dark print:mb-2">Want help building it?</h2>
          <a
            href={ARROW_NORTH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-8 py-4 bg-brand-cta text-brand-dark rounded-xl font-bold text-lg md:text-xl hover:bg-brand-cta/90 transition-colors shadow-lg print:hidden">

            Talk to Arrow North
          </a>
          <p className="hidden print:block text-brand-dark font-medium">
            Talk to Arrow North: {ARROW_NORTH_URL.replace(/^https?:\/\//, '')}
          </p>
        </div>
      </div>
    </div>);

}

