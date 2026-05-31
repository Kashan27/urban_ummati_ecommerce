import { Separator } from "@/components/ui/separator";

interface LegalProps {
  title: string;
  lastUpdated: string;
  content: React.ReactNode;
}

export function Legal({ title, lastUpdated, content }: LegalProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-4xl md:text-5xl mb-4 tracking-tight">{title}</h1>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Last Updated: {lastUpdated}
        </p>
      </div>
      
      <Separator className="mb-12" />
      
      <div className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:font-normal prose-p:text-slate-600 prose-p:leading-relaxed">
        {content}
      </div>
    </div>
  );
}
