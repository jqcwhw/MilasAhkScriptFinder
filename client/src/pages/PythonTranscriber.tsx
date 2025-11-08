import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Sparkles, CheckCircle2, Bug, Download, Home } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";

export default function PythonTranscriber() {
  const [pythonCode, setPythonCode] = useState("");
  const [convertedCode, setConvertedCode] = useState("");
  const [validationResult, setValidationResult] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const { toast } = useToast();

  const convertMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/ai/transcribe", { pythonCode: code, operation: "convert" });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setConvertedCode(data.result);
      toast({
        title: "Conversion Complete",
        description: "Your Python code has been converted to AutoHotkey!",
      });
    },
    onError: () => {
      toast({
        title: "Conversion Failed",
        description: "Unable to convert the code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const validateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/transcribe", {
        pythonCode,
        ahkCode: convertedCode,
        operation: "validate",
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setValidationResult(data.result);
      toast({
        title: "Validation Complete",
        description: "Code has been analyzed for accuracy.",
      });
    },
  });

  const debugMutation = useMutation({
    mutationFn: async (issue: string) => {
      const response = await apiRequest("POST", "/api/ai/transcribe", {
        pythonCode,
        ahkCode: convertedCode,
        issue,
        operation: "debug",
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setConvertedCode(data.result);
      toast({
        title: "Debug Complete",
        description: "Code has been fixed and updated.",
      });
    },
  });

  const handleConvert = () => {
    if (!pythonCode.trim()) {
      toast({
        title: "No Code Provided",
        description: "Please enter Python code to convert.",
        variant: "destructive",
      });
      return;
    }
    convertMutation.mutate(pythonCode);
  };

  const handleValidate = () => {
    if (!pythonCode.trim() || !convertedCode.trim()) {
      toast({
        title: "Missing Code",
        description: "Both Python and AHK code are required for validation.",
        variant: "destructive",
      });
      return;
    }
    validateMutation.mutate();
  };

  const handleDebug = () => {
    if (!issueDescription.trim()) {
      toast({
        title: "No Issue Described",
        description: "Please describe the issue you're experiencing.",
        variant: "destructive",
      });
      return;
    }
    debugMutation.mutate(issueDescription);
  };

  const downloadAHK = () => {
    const blob = new Blob([convertedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted_script.ahk";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900">
      <header className="border-b bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="link-home">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent" data-testid="text-page-title">
              Python to AutoHotkey Converter
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Code Translation</span>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Convert your Python scripts to AutoHotkey with intelligent AI assistance. Validate accuracy, debug issues, and download ready-to-use AHK files.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6 hover-elevate">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-600" />
                Python Code
              </h2>
              <span className="text-xs text-muted-foreground">Input</span>
            </div>
            <Textarea
              placeholder="# Enter your Python code here...
def greet(name):
    print(f'Hello, {name}!')
    
greet('World')"
              value={pythonCode}
              onChange={(e) => setPythonCode(e.target.value)}
              className="font-mono text-sm min-h-[400px] resize-none"
              data-testid="textarea-python-code"
            />
            <Button
              onClick={handleConvert}
              disabled={convertMutation.isPending || !pythonCode.trim()}
              className="mt-4 w-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
              data-testid="button-convert"
            >
              {convertMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Converting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Convert to AHK
                </>
              )}
            </Button>
          </Card>

          <Card className="p-6 hover-elevate">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Code className="w-5 h-5 text-green-600" />
                AutoHotkey Code
              </h2>
              <div className="flex items-center gap-2">
                {convertedCode && (
                  <Button
                    onClick={downloadAHK}
                    variant="outline"
                    size="sm"
                    data-testid="button-download"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
                <span className="text-xs text-muted-foreground">Output</span>
              </div>
            </div>
            <Textarea
              placeholder="Converted AutoHotkey code will appear here..."
              value={convertedCode}
              onChange={(e) => setConvertedCode(e.target.value)}
              className="font-mono text-sm min-h-[400px] resize-none"
              data-testid="textarea-ahk-code"
            />
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleValidate}
                disabled={validateMutation.isPending || !convertedCode.trim()}
                variant="outline"
                className="flex-1"
                data-testid="button-validate"
              >
                {validateMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Validate
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {validationResult && (
          <Card className="p-6 mb-6 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Validation Results
            </h3>
            <pre className="text-sm whitespace-pre-wrap text-muted-foreground">{validationResult}</pre>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Bug className="w-5 h-5 text-orange-600" />
            Debug & Fix Issues
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Describe any issues with the converted code and get AI-powered debugging help.
          </p>
          <Textarea
            placeholder="Describe the issue you're experiencing..."
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            className="mb-4"
            data-testid="textarea-issue"
          />
          <Button
            onClick={handleDebug}
            disabled={debugMutation.isPending || !issueDescription.trim()}
            variant="outline"
            className="w-full"
            data-testid="button-debug"
          >
            {debugMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Debugging...
              </>
            ) : (
              <>
                <Bug className="w-4 h-4 mr-2" />
                Debug & Fix
              </>
            )}
          </Button>
        </Card>
      </main>
    </div>
  );
}
