import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Download, Star, FileCode } from "lucide-react";

export interface SearchResult {
  id: string;
  repository: string;
  owner: string;
  fileName: string;
  filePath: string;
  stars: number;
  description: string;
  codePreview: string;
  url: string;
  downloadUrl: string;
  language: "AHK v1" | "AHK v2";
}

interface SearchResultCardProps {
  result: SearchResult;
  onDownload: (result: SearchResult) => void;
}

export default function SearchResultCard({ result, onDownload }: SearchResultCardProps) {
  return (
    <Card className="hover-elevate group relative overflow-hidden transition-all duration-200" data-testid={`card-result-${result.id}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
      
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-bold flex items-center gap-2 flex-wrap tracking-tight">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                <FileCode className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <span className="truncate">{result.fileName}</span>
            </CardTitle>
            <CardDescription className="text-sm mt-2 flex items-center gap-2">
              <span className="font-semibold">{result.owner}</span>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">{result.repository}</span>
            </CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm">
            {result.language}
          </Badge>
        </div>
        
        <p className="text-xs font-mono text-muted-foreground bg-muted/50 rounded px-2 py-1 truncate" data-testid={`text-filepath-${result.id}`}>
          {result.filePath}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {result.description && (
          <p className="text-sm leading-relaxed">{result.description}</p>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Code Preview</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="font-medium" data-testid={`text-stars-${result.id}`}>{result.stars.toLocaleString()}</span>
            </div>
          </div>
          <div className="bg-slate-950 dark:bg-slate-900 rounded-lg p-4 overflow-x-auto border border-emerald-900/20">
            <pre className="text-xs font-mono text-emerald-100">
              <code>{result.codePreview}</code>
            </pre>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 flex-wrap border-t pt-4">
        <Button
          variant="outline"
          size="sm"
          asChild
          data-testid={`button-view-${result.id}`}
          className="flex-1 min-w-[140px]"
        >
          <a href={result.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            View on GitHub
          </a>
        </Button>
        <Button
          size="sm"
          onClick={() => onDownload(result)}
          data-testid={`button-download-${result.id}`}
          className="flex-1 min-w-[140px] bg-emerald-600 hover:bg-emerald-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Script
        </Button>
      </CardFooter>
    </Card>
  );
}