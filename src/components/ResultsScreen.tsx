import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ChevronDown, ChevronUp, Mail } from 'lucide-react';

interface ResultsScreenProps {
  onStartOver: () => void;
  userId: string;
  answers: Record<string, string>;
}

function AnswerItem({ label, value }: {label: string;value: string;}) {
  return (
    <div>
      <div className="text-brand-accent text-xs md:text-sm font-bold uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-brand-dark text-sm md:text-base leading-snug">{value}</div>
    </div>);

}

function SectionDivider({ label }: {label: string;}) {
  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-5 md:py-6 flex items-center gap-3">
      <div className="flex-1 h-px bg-brand-dark/20" />
      <span className="text-brand-dark/40 text-xs md:text-sm font-bold uppercase tracking-widest whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-brand-dark/20" />
    </div>);

}

function CollapsibleOutput({
  title,
  children



}: {title: string;children: React.ReactNode;}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="px-4 sm:px-6 md:px-8 pb-6 md:pb-8">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 mb-4 md:mb-6"
        aria-expanded={open}>

        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-brand-dark text-left">{title}</h2>
        <div className="text-brand-dark flex-shrink-0">
          {open ? <ChevronUp size={20} className="md:w-6 md:h-6" /> : <ChevronDown size={20} className="md:w-6 md:h-6" />}
        </div>
      </button>

      {open &&
      <div className="space-y-5 md:space-y-6 text-sm md:text-base leading-relaxed text-brand-dark">
          {children}
        </div>
      }
    </div>);

}

export function ResultsScreen({ onStartOver, userId, answers }: ResultsScreenProps) {
  // Fetch the user's generated documents
  const documents = useQuery(api.documents.getUserDocumentUrls, { userId });

  // Store fetched document content
  const [documentContent, setDocumentContent] = useState<Record<string, string>>({});

  // Fetch document content when documents are available
  useEffect(() => {
    if (!documents) return;

    const fetchDocumentContent = async () => {
      const content: Record<string, string> = {};

      for (const doc of documents) {
        if (doc.fileUrl && !documentContent[doc.docType]) {
          try {
            const response = await fetch(doc.fileUrl);
            const text = await response.text();

            // Extract first 10 meaningful lines (skip empty lines)
            const lines = text.split('\n')
              .filter(line => line.trim())
              .slice(0, 10)
              .join('\n');

            content[doc.docType] = lines || text.substring(0, 500);
          } catch (error) {
            console.error(`Error fetching ${doc.docType}:`, error);
            content[doc.docType] = "Generated content available";
          }
        }
      }

      if (Object.keys(content).length > 0) {
        setDocumentContent(prev => ({ ...prev, ...content }));
      }
    };

    fetchDocumentContent();
  }, [documents]);

  // Extract first line from each document type
  const getFirstLine = (docType: string): string => {
    if (documentContent[docType]) {
      return documentContent[docType];
    }

    const doc = documents?.find(d => d.docType === docType);
    if (!doc) return "Generating...";

    return "Loading content...";
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-surface text-brand-dark pb-16 md:pb-20">

      <div className="px-4 sm:px-6 md:px-8 pt-10 md:pt-12 lg:pt-14 pb-6 md:pb-8 bg-brand-dark">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 md:mb-2">Your Founder's Idea Kit</h1>
        <p className="text-brand-accent font-medium text-sm md:text-base">Built from your answers today.</p>
      </div>

      <div className="mx-4 sm:mx-6 md:mx-8 mt-5 md:mt-6 mb-2 bg-brand-accent/10 border border-brand-accent/30 rounded-xl p-4 md:p-5 flex items-start gap-3 md:gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <Mail size={18} className="text-brand-accent md:w-5 md:h-5" />
        </div>
        <div>
          <p className="text-brand-dark font-bold text-sm md:text-base">Check your inbox.</p>
          <p className="text-brand-dark/70 text-sm md:text-base mt-0.5">
            Your full Founder's Idea Kit, all three outputs, has been sent to your email. Everything below is a preview.
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 pt-6 md:pt-8 pb-4 md:pb-6">
        <div className="text-xs md:text-sm font-bold uppercase tracking-widest text-brand-dark/40 mb-3 md:mb-4">Your Brief</div>
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-black/5 space-y-4 md:space-y-5">
          <AnswerItem label="Idea" value={answers.q1 || "No answer provided"} />
          <AnswerItem label="User" value={answers.q2 || "No answer provided"} />
          <AnswerItem label="Pain point" value={answers.q3 || "No answer provided"} />
          <AnswerItem label="Workaround" value={answers.q4 || "No answer provided"} />
          <AnswerItem label="Solution" value={answers.q5 || "No answer provided"} />
          <AnswerItem label="Outcome" value={answers.q6 || "No answer provided"} />
          <AnswerItem label="Uncertainty" value={answers.q7 || "No answer provided"} />
        </div>
      </div>

      <SectionDivider label="Output 1" />

      <CollapsibleOutput title="Validation Doc">
        <div className="text-brand-dark/60 text-sm md:text-base whitespace-pre-wrap">
          {getFirstLine("VALIDATION")}
        </div>
      </CollapsibleOutput>

      <SectionDivider label="Output 2" />

      <CollapsibleOutput title="Vibe Coding Prompts">
        <div className="text-brand-dark/60 text-sm md:text-base whitespace-pre-wrap">
          {getFirstLine("VIBE_CODING")}
        </div>
      </CollapsibleOutput>

      <SectionDivider label="Output 3" />

      <CollapsibleOutput title="UX Playbook">
        <div className="text-brand-dark/60 text-sm md:text-base whitespace-pre-wrap">
          {getFirstLine("UX_PLAYBOOK")}
        </div>
      </CollapsibleOutput>

      <div className="px-4 sm:px-6 md:px-8 pt-4 md:pt-6 pb-12 md:pb-16 text-center">
        <div className="w-full h-px bg-brand-dark/10 mb-8 md:mb-10" />
        <p className="font-bold text-base md:text-lg mb-8 md:mb-10">This framework is reusable. Same seven questions. Any idea.</p>
        <button
          onClick={onStartOver}
          className="w-full max-w-md mx-auto bg-brand-accent text-white py-4 md:py-5 rounded-xl font-bold text-lg md:text-xl hover:bg-brand-accent/90 transition-colors shadow-lg">

          Start Over
        </button>
      </div>
    </div>);

}