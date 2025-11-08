import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface CodeViewerProps {
  code: string;
  title?: string;
}

export default function CodeViewer({ code, title = "Code" }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
      
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
        <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
          <span className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400 tracking-wide">Generated</span>
          <span>{title}</span>
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          data-testid="button-copy-code"
          className="bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </>
          )}
        </Button>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="bg-slate-950 dark:bg-slate-900 p-6 max-h-96 overflow-auto border-t border-emerald-900/20">
          <pre className="text-sm font-mono text-emerald-100">
            <code data-testid="text-code-content">{code}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}