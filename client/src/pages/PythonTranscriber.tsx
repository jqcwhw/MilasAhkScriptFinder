import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Code, Sparkles, CheckCircle2, Bug, Download, ArrowLeft, 
  Upload, FileCode, Trash2, Save, Gamepad2, Clock, Info
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";

interface ConversionHistory {
  timestamp: string;
  python: string;
  ahk: string;
}

export default function PythonTranscriber() {
  const [pythonCode, setPythonCode] = useState("");
  const [convertedCode, setConvertedCode] = useState("");
  const [validationResult, setValidationResult] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [conversionHistory, setConversionHistory] = useState<ConversionHistory[]>([]);
  
  // Game Helper state
  const [gameName, setGameName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [scriptType, setScriptType] = useState("Auto-Clicker");
  const [generatedGameScript, setGeneratedGameScript] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const convertMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/ai/transcribe", { pythonCode: code, operation: "convert" });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setConvertedCode(data.result);
      
      // Add to history
      const newHistory: ConversionHistory = {
        timestamp: new Date().toLocaleString(),
        python: pythonCode.slice(0, 100) + (pythonCode.length > 100 ? "..." : ""),
        ahk: data.result.slice(0, 100) + (data.result.length > 100 ? "..." : "")
      };
      setConversionHistory(prev => [...prev, newHistory]);
      
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

  const generateGameScriptMutation = useMutation({
    mutationFn: async (params: { gameName: string; taskDescription: string; scriptType: string }) => {
      const response = await apiRequest("POST", "/api/ai/game-script", params);
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setGeneratedGameScript(data.result);
      toast({
        title: "Script Generated",
        description: "Your game automation script is ready!",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Unable to generate the script. Please try again.",
        variant: "destructive",
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.py')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPythonCode(content);
        toast({
          title: "File Loaded",
          description: `Successfully loaded ${file.name}`,
        });
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a .py file",
        variant: "destructive",
      });
    }
  };

  const loadSampleCode = () => {
    const sample = `# Sample Python script
import time

def greet(name):
    print(f"Hello, {name}!")
    time.sleep(1)
    print("How are you today?")

greet("User")`;
    setPythonCode(sample);
    toast({
      title: "Sample Loaded",
      description: "Sample Python code loaded successfully",
    });
  };

  const clearAll = () => {
    setPythonCode("");
    setConvertedCode("");
    setValidationResult("");
    setIssueDescription("");
    toast({
      title: "Cleared",
      description: "All fields have been cleared",
    });
  };

  const downloadAHK = (code: string, filename: string = "converted_script.ahk") => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateGameScript = () => {
    if (!gameName.trim() || !taskDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both game name and task description.",
        variant: "destructive",
      });
      return;
    }
    generateGameScriptMutation.mutate({ gameName, taskDescription, scriptType });
  };

  const loadTemplate = (template: string) => {
    const templates: Record<string, string> = {
      autoclicker: "Create an auto-clicker that clicks the left mouse button every 100 milliseconds when F1 is pressed. Press F2 to pause/resume, and F3 to exit.",
      healing: "Monitor a specific screen region for low health (red color). When detected, press '1' to use a healing potion. Include a cooldown timer.",
      resource: "Repeat a sequence: Press 'E' to collect, wait 2 seconds, move mouse in a circle pattern, wait 1 second, repeat. F1 to start/stop."
    };
    setTaskDescription(templates[template]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900">
      <header className="border-b bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
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
            Convert Python scripts to AutoHotkey with AI-powered validation and debugging
          </p>
        </div>

        <Tabs defaultValue="convert" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-4xl mx-auto">
            <TabsTrigger value="convert" data-testid="tab-convert">Convert</TabsTrigger>
            <TabsTrigger value="saved" data-testid="tab-saved">Saved Scripts</TabsTrigger>
            <TabsTrigger value="game" data-testid="tab-game">Game Helper</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
            <TabsTrigger value="about" data-testid="tab-about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="convert" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="hover-elevate">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-600" />
                    Input Python Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="# Enter your Python code here...
def greet(name):
    print(f'Hello, {name}!')
    
greet('World')"
                    value={pythonCode}
                    onChange={(e) => setPythonCode(e.target.value)}
                    className="font-mono text-sm min-h-[300px] resize-none"
                    data-testid="textarea-python-code"
                  />
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Or upload a Python file (.py)</p>
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".py"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1"
                        data-testid="button-upload-file"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Browse files
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Quick Actions</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={loadSampleCode}
                        className="flex-1"
                        data-testid="button-load-sample"
                      >
                        <FileCode className="w-4 h-4 mr-2" />
                        Load Sample Code
                      </Button>
                      <Button
                        variant="outline"
                        onClick={clearAll}
                        data-testid="button-clear-all"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="w-5 h-5 text-green-600" />
                      AutoHotkey Code
                    </div>
                    {convertedCode && (
                      <Button
                        onClick={() => downloadAHK(convertedCode)}
                        variant="outline"
                        size="sm"
                        data-testid="button-download"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Converted AutoHotkey code will appear here..."
                    value={convertedCode}
                    onChange={(e) => setConvertedCode(e.target.value)}
                    className="font-mono text-sm min-h-[300px] resize-none"
                    data-testid="textarea-ahk-code"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleConvert}
                disabled={convertMutation.isPending || !pythonCode.trim()}
                className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600"
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

            {validationResult && (
              <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                    <CheckCircle2 className="w-5 h-5" />
                    Validation Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm whitespace-pre-wrap text-muted-foreground">{validationResult}</pre>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="w-5 h-5 text-orange-600" />
                  Debug & Fix Issues
                </CardTitle>
                <CardDescription>
                  Describe any issues with the converted code and get AI-powered debugging help
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe the issue you're experiencing..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Saved Scripts
                </CardTitle>
                <CardDescription>
                  Database functionality not yet implemented. Scripts can be downloaded from the Convert and Game Helper tabs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  No saved scripts yet. Convert some code and save it to get started!
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="game" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  AI Game Helper
                </CardTitle>
                <CardDescription>
                  Generate AutoHotkey game automation scripts with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Game Name</label>
                      <Input
                        placeholder="e.g., Minecraft, League of Legends, etc."
                        value={gameName}
                        onChange={(e) => setGameName(e.target.value)}
                        data-testid="input-game-name"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">What should the script do?</label>
                      <Textarea
                        placeholder="Describe the automation task in detail. For example:
- Auto-click at specific coordinates every 2 seconds
- Press 'Q' every time health drops below 50%
- Farm resources by repeating a sequence of actions
- Detect and click on specific colored pixels"
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        className="min-h-[200px]"
                        data-testid="textarea-task-description"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Script Type</label>
                      <Select value={scriptType} onValueChange={setScriptType}>
                        <SelectTrigger data-testid="select-script-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Auto-Clicker">Auto-Clicker</SelectItem>
                          <SelectItem value="Macro/Hotkey">Macro/Hotkey</SelectItem>
                          <SelectItem value="Resource Farmer">Resource Farmer</SelectItem>
                          <SelectItem value="Combat Assistant">Combat Assistant</SelectItem>
                          <SelectItem value="Movement Bot">Movement Bot</SelectItem>
                          <SelectItem value="Item Finder">Item Finder</SelectItem>
                          <SelectItem value="Screen Monitor">Screen Monitor</SelectItem>
                          <SelectItem value="Custom Script">Custom Script</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Common Templates</p>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          onClick={() => loadTemplate("autoclicker")}
                          className="w-full"
                          data-testid="button-template-autoclicker"
                        >
                          Simple Auto-Clicker
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => loadTemplate("healing")}
                          className="w-full"
                          data-testid="button-template-healing"
                        >
                          Healing Bot
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => loadTemplate("resource")}
                          className="w-full"
                          data-testid="button-template-resource"
                        >
                          Resource Collector
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateGameScript}
                  disabled={generateGameScriptMutation.isPending}
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
                  data-testid="button-generate-game-script"
                >
                  {generateGameScriptMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Gamepad2 className="w-4 h-4 mr-2" />
                      Generate Game Script
                    </>
                  )}
                </Button>

                {generatedGameScript && (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Generated Script</h3>
                      <Button
                        onClick={() => downloadAHK(generatedGameScript, `${gameName.replace(/\s+/g, '_')}_bot.ahk`)}
                        variant="outline"
                        size="sm"
                        data-testid="button-download-game-script"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <Card>
                      <CardContent className="pt-6">
                        <pre className="font-mono text-sm whitespace-pre-wrap overflow-auto max-h-[400px] p-4 bg-muted rounded-lg">
                          {generatedGameScript}
                        </pre>
                      </CardContent>
                    </Card>
                    <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
                      <CardHeader>
                        <CardTitle className="text-amber-900 dark:text-amber-100 text-base">⚠️ Important Safety Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Test scripts in a safe environment first</li>
                          <li>Many games have anti-cheat systems that may detect automation</li>
                          <li>Use automation responsibly and check game terms of service</li>
                          <li>Always include pause/exit hotkeys for safety</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Conversion History
                </CardTitle>
                <CardDescription>
                  {conversionHistory.length > 0 
                    ? `Total conversions this session: ${conversionHistory.length}`
                    : "No conversions yet"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {conversionHistory.length > 0 ? (
                  <div className="space-y-4">
                    {conversionHistory.slice().reverse().map((item, idx) => (
                      <Card key={idx} className="hover-elevate">
                        <CardHeader>
                          <CardTitle className="text-base">
                            Conversion {conversionHistory.length - idx} - {item.timestamp}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="font-semibold mb-2">Python:</p>
                              <pre className="text-sm bg-muted p-3 rounded-lg overflow-auto max-h-[200px]">
                                {item.python}
                              </pre>
                            </div>
                            <div>
                              <p className="font-semibold mb-2">AutoHotkey:</p>
                              <pre className="text-sm bg-muted p-3 rounded-lg overflow-auto max-h-[200px]">
                                {item.ahk}
                              </pre>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No conversions yet. Start converting Python code to AutoHotkey!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  About This App
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <h3>Python to AutoHotkey Converter & Game Helper</h3>
                <p>
                  This application uses AI to convert Python scripts into AutoHotkey (AHK) code and generate game automation scripts.
                </p>

                <h4>Features:</h4>
                <ul>
                  <li>🔄 AI-powered Python to AutoHotkey conversion</li>
                  <li>✅ Automatic validation of converted code</li>
                  <li>🐛 Interactive debugging with AI assistance</li>
                  <li>🎮 AI-powered game automation script generator</li>
                  <li>📊 Side-by-side code comparison</li>
                  <li>📥 Download converted scripts</li>
                  <li>📜 Session history tracking</li>
                </ul>

                <h4>How to use the Converter:</h4>
                <ol>
                  <li>Paste your Python code or upload a .py file</li>
                  <li>Click "Convert to AutoHotkey"</li>
                  <li>Review the converted code</li>
                  <li>Use "Validate Conversion" to check accuracy</li>
                  <li>Use "Debug Code" if you encounter issues</li>
                  <li>Download your AutoHotkey script</li>
                </ol>

                <h4>How to use the Game Helper:</h4>
                <ol>
                  <li>Go to the "Game Helper" tab</li>
                  <li>Enter the game name</li>
                  <li>Describe what you want the script to do</li>
                  <li>Select the script type</li>
                  <li>Generate your automation script</li>
                  <li>Download the generated script</li>
                </ol>

                <h4>Limitations:</h4>
                <ul>
                  <li>Complex Python libraries may not have direct AutoHotkey equivalents</li>
                  <li>Some Python features may require manual adaptation</li>
                  <li>Game automation may violate terms of service - use responsibly</li>
                  <li>Always test scripts before production use</li>
                </ul>

                <h4>Tips:</h4>
                <ul>
                  <li>Start with simple scripts to understand the conversion patterns</li>
                  <li>Use the validation feature to catch potential issues</li>
                  <li>Check game terms of service before using automation</li>
                  <li>Always include safety features like pause/exit hotkeys</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
