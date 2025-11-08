import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AIGeneratorProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generatedCode?: string;
}

export default function AIGenerator({ 
  prompt, 
  onPromptChange, 
  onGenerate, 
  isGenerating,
  generatedCode 
}: AIGeneratorProps) {
  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500" />
        
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-950/50 dark:to-violet-950/50">
              <Sparkles className="h-6 w-6 text-purple-700 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl tracking-tight">AI Script Generator</CardTitle>
              <CardDescription className="mt-1">
                Describe what you want your AutoHotkey script to do, and AI will generate it for you
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-purple-600 text-white hover:bg-purple-700 shadow-sm">
              AI Powered
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground">Describe Your Script</label>
            <Textarea
              placeholder="Example: Create a script that types my email address when I press Ctrl+Shift+E"
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              className="min-h-32 resize-none border-2 focus:border-purple-500"
              data-testid="input-ai-prompt"
            />
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={onGenerate}
              disabled={isGenerating || !prompt.trim()}
              size="lg"
              data-testid="button-generate"
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Script...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate AutoHotkey Script
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}