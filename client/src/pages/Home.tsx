import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import SearchResultCard, { SearchResult } from "@/components/SearchResultCard";
import ScriptCard, { Script } from "@/components/ScriptCard";
import AIGenerator from "@/components/AIGenerator";
import CodeViewer from "@/components/CodeViewer";
import AddScriptDialog from "@/components/AddScriptDialog";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const mockCuratedScripts: Script[] = [
  {
    id: 'c1',
    name: 'Window Snap Manager',
    description: 'Quickly move and resize windows with keyboard shortcuts. Supports multi-monitor setups and custom grid layouts.',
    tags: ['productivity', 'windows', 'shortcuts'],
    downloadCount: 5420,
    content: `; Window Snap Manager - AHK v2
#Requires AutoHotkey v2.0

; Win + Left Arrow - Snap window to left half
#Left::
{
    WinGetPos(&X, &Y, &W, &H, "A")
    MonitorGetWorkArea(, &Left, &Top, &Right, &Bottom)
    WinMove(Left, Top, (Right-Left)//2, Bottom-Top, "A")
}

; Win + Right Arrow - Snap window to right half
#Right::
{
    WinGetPos(&X, &Y, &W, &H, "A")
    MonitorGetWorkArea(, &Left, &Top, &Right, &Bottom)
    WinMove(Left+(Right-Left)//2, Top, (Right-Left)//2, Bottom-Top, "A")
}`,
    version: 'v2'
  },
  {
    id: 'c2',
    name: 'Text Expander',
    description: 'Expand abbreviations into full text snippets. Perfect for email templates and common phrases.',
    tags: ['productivity', 'typing', 'automation'],
    downloadCount: 3890,
    content: `; Text Expander - AHK v2
#Requires AutoHotkey v2.0

::btw::by the way
::omw::on my way
::brb::be right back
::@email::your.email@example.com
::@addr::123 Main St, City, State 12345`,
    version: 'v2'
  },
  {
    id: 'c3',
    name: 'Gaming Macro Suite',
    description: 'Collection of gaming macros for popular games. Includes auto-clicker and key rebinding.',
    tags: ['gaming', 'macros', 'automation'],
    downloadCount: 7215,
    content: `; Gaming Macro Suite - AHK v1
#Persistent
#NoEnv

; F1 - Auto Clicker Toggle
F1::
toggle := !toggle
if (toggle) {
    SetTimer, AutoClick, 100
} else {
    SetTimer, AutoClick, Off
}
return

AutoClick:
Click
return`,
    version: 'v1'
  }
];

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | undefined>();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewScript, setPreviewScript] = useState<Script | SearchResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest('POST', '/api/search/github', { query });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        const totalText = data.totalCount > data.results.length 
          ? `Found ${data.results.length} of ${data.totalCount} total AutoHotkey scripts`
          : `Found ${data.results.length} AutoHotkey scripts`;
        toast({
          title: "Search completed",
          description: totalText,
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Unable to search GitHub. Please check your GitHub token and try again.";
      toast({
        title: "Search failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const personalScriptsQuery = useQuery<{ scripts: Script[] }>({
    queryKey: ['/api/scripts/personal'],
  });

  const addScriptMutation = useMutation({
    mutationFn: async (script: Omit<Script, 'id'>) => {
      const response = await apiRequest('POST', '/api/scripts/personal', script);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scripts/personal'] });
      toast({
        title: "Script added",
        description: "Your script has been added to your library",
      });
    },
  });

  const deleteScriptMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/scripts/personal/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scripts/personal'] });
      toast({
        title: "Script deleted",
        description: "Script has been removed from your library",
      });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('POST', '/api/ai/generate', { prompt });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setGeneratedCode(data.code);
        toast({
          title: "Script generated",
          description: "Your AutoHotkey script has been generated successfully",
        });
      }
    },
    onError: () => {
      toast({
        title: "Generation failed",
        description: "Unable to generate script. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setHasSearched(true);
      searchMutation.mutate(searchQuery);
    }
  };

  const handleDownload = (item: SearchResult | Script) => {
    const fileName = 'fileName' in item ? item.fileName : `${item.name}.ahk`;
    const content = 'content' in item ? item.content : item.codePreview;
    const downloadUrl = 'downloadUrl' in item ? item.downloadUrl : null;

    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    } else {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }

    toast({
      title: "Download started",
      description: `Downloading ${fileName}`,
    });
  };

  const handlePreview = (item: Script | SearchResult) => {
    setPreviewScript(item);
    setPreviewDialogOpen(true);
  };

  const handleGenerate = () => {
    if (aiPrompt.trim()) {
      generateMutation.mutate(aiPrompt);
    }
  };

  const handleAddScript = (script: Omit<Script, 'id'>) => {
    addScriptMutation.mutate(script);
    setAddDialogOpen(false);
  };

  const handleDeleteScript = (script: Script) => {
    deleteScriptMutation.mutate(script.id);
  };

  const getPreviewCode = () => {
    if (!previewScript) return "";
    if ('content' in previewScript) {
      return previewScript.content;
    }
    return previewScript.codePreview;
  };

  const getPreviewTitle = () => {
    if (!previewScript) return "";
    if ('fileName' in previewScript) {
      return previewScript.fileName;
    }
    return previewScript.name;
  };

  const searchResults = (searchMutation.data?.results as SearchResult[]) || [];
  const personalScripts = (personalScriptsQuery.data?.scripts as Script[]) || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold" data-testid="text-app-title">
              AHK Script Finder
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />
        </div>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2">
            <TabsTrigger value="search" data-testid="tab-search">
              GitHub Search
            </TabsTrigger>
            <TabsTrigger value="curated" data-testid="tab-curated">
              Curated Library
            </TabsTrigger>
            <TabsTrigger value="personal" data-testid="tab-personal">
              My Scripts
            </TabsTrigger>
            <TabsTrigger value="ai" data-testid="tab-ai">
              AI Generator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            {searchMutation.isPending ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Searching GitHub for AutoHotkey scripts...</p>
              </div>
            ) : !hasSearched ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Enter a search query to find AutoHotkey scripts on GitHub
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try searching for: anti afk, window manager, clipboard, hotkeys, macros
                </p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No AutoHotkey scripts found for "{searchQuery}"
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try different keywords or check your spelling
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Found {searchResults.length} AutoHotkey scripts matching "{searchQuery}"
                  {searchMutation.data?.totalCount && searchMutation.data.totalCount > searchResults.length && (
                    <span> (showing first {searchResults.length} of {searchMutation.data.totalCount} total results)</span>
                  )}
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {searchResults.map((result: SearchResult) => (
                    <SearchResultCard
                      key={result.id}
                      result={result}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="curated" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockCuratedScripts.map((script) => (
                <ScriptCard
                  key={script.id}
                  script={script}
                  onDownload={handleDownload}
                  onPreview={handlePreview}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="personal" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setAddDialogOpen(true)} data-testid="button-add-script">
                <Plus className="h-4 w-4 mr-2" />
                Add Script
              </Button>
            </div>
            {personalScriptsQuery.isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading your scripts...</p>
              </div>
            ) : personalScripts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No personal scripts yet. Add your first script!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personalScripts.map((script: Script) => (
                  <ScriptCard
                    key={script.id}
                    script={script}
                    onDownload={handleDownload}
                    onPreview={handlePreview}
                    onDelete={handleDeleteScript}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <AIGenerator
              prompt={aiPrompt}
              onPromptChange={setAiPrompt}
              onGenerate={handleGenerate}
              isGenerating={generateMutation.isPending}
            />
            {generatedCode && (
              <CodeViewer code={generatedCode} title="Generated Script" />
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AddScriptDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleAddScript}
      />

      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getPreviewTitle()}</DialogTitle>
          </DialogHeader>
          <div className="bg-muted rounded-md p-4 max-h-96 overflow-auto">
            <pre className="text-sm font-mono text-foreground">
              <code>{getPreviewCode()}</code>
            </pre>
          </div>
        </DialogContent>
      </Dialog>

      <footer className="border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex gap-6 flex-wrap">
              <a href="#" className="hover:text-foreground">Documentation</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                GitHub Repo
              </a>
              <a href="#" className="hover:text-foreground">Report Issue</a>
            </div>
            <p>v1.0.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}