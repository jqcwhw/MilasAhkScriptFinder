import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Trash2, FileCode } from "lucide-react";

export interface Script {
  id: string;
  name: string;
  description: string;
  tags: string[];
  downloadCount?: number;
  content: string;
  version: "v1" | "v2";
  isPersonal?: boolean;
}

interface ScriptCardProps {
  script: Script;
  onDownload: (script: Script) => void;
  onPreview: (script: Script) => void;
  onDelete?: (script: Script) => void;
}

export default function ScriptCard({ script, onDownload, onPreview, onDelete }: ScriptCardProps) {
  return (
    <Card className="hover-elevate flex flex-col group relative overflow-hidden transition-all duration-200" data-testid={`card-script-${script.id}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
      
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
              <FileCode className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <Badge variant="secondary" className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm">
              AHK {script.version}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight" data-testid={`text-scriptname-${script.id}`}>
          {script.name}
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed min-h-[2.5rem]">
          {script.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        <div className="flex flex-wrap gap-2">
          {script.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="space-y-2">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Code Preview</span>
          <div className="bg-slate-950 dark:bg-slate-900 rounded-lg p-4 max-h-48 overflow-auto border border-emerald-900/20">
            <pre className="text-xs font-mono text-emerald-100 whitespace-pre-wrap">
              <code>{script.content.slice(0, 300)}{script.content.length > 300 ? '...' : ''}</code>
            </pre>
          </div>
        </div>
        
        {script.downloadCount !== undefined && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
            <Download className="h-3 w-3" />
            <span className="font-medium">{script.downloadCount.toLocaleString()} downloads</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2 flex-wrap border-t pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPreview(script)}
          data-testid={`button-preview-${script.id}`}
          className="flex-1 min-w-[100px]"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview Code
        </Button>
        <Button
          size="sm"
          onClick={() => onDownload(script)}
          data-testid={`button-download-${script.id}`}
          className="flex-1 min-w-[100px] bg-emerald-600 hover:bg-emerald-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        {script.isPersonal && onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(script)}
            data-testid={`button-delete-${script.id}`}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Script
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}