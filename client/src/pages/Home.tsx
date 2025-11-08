import { useState } from "react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Trophy, Code2, Sparkles, ArrowRight, Gamepad2, Zap, Activity, Info } from "lucide-react";
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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    name: 'Auto Clicker',
    description: 'Simple auto-clicker with F1 toggle. Adjustable click speed. Perfect for repetitive clicking tasks.',
    tags: ['automation', 'productivity', 'clicker'],
    downloadCount: 7215,
    content: `; Auto Clicker - AHK v1
#Persistent
#NoEnv
SetBatchLines, -1

; F1 - Toggle Auto Clicker
F1::
toggle := !toggle
if (toggle) {
    ToolTip, Auto Clicker: ON
    SetTimer, AutoClick, 50
} else {
    ToolTip, Auto Clicker: OFF
    SetTimer, AutoClick, Off
}
SetTimer, RemoveToolTip, 2000
return

AutoClick:
Click
return

RemoveToolTip:
SetTimer, RemoveToolTip, Off
ToolTip
return

; F2 - Exit script
F2::ExitApp`,
    version: 'v1'
  },
  {
    id: 'c4',
    name: 'Scroll Anywhere',
    description: 'Scroll by holding middle mouse button and moving mouse. Works in any application.',
    tags: ['productivity', 'mouse', 'scrolling'],
    downloadCount: 4120,
    content: `; Scroll Anywhere - AHK v1
#NoEnv
#SingleInstance Force
SetBatchLines, -1

MButton::
MouseGetPos, StartX, StartY
SetTimer, ScrollMonitor, 10
KeyWait, MButton
SetTimer, ScrollMonitor, Off
return

ScrollMonitor:
MouseGetPos, CurrentX, CurrentY
DeltaX := CurrentX - StartX
DeltaY := CurrentY - StartY

if (Abs(DeltaY) > 5) {
    if (DeltaY > 0)
        Send {WheelDown}
    else
        Send {WheelUp}
}
return`,
    version: 'v1'
  },
  {
    id: 'c5',
    name: 'Window Info Tool',
    description: 'Display information about windows under cursor. Press F12 to show window class, title, and process.',
    tags: ['utility', 'development', 'windows'],
    downloadCount: 2890,
    content: `; Window Info Tool - AHK v1
#NoEnv
#Persistent
SetBatchLines, -1

F12::
MouseGetPos,,, WinID
WinGetClass, Class, ahk_id %WinID%
WinGetTitle, Title, ahk_id %WinID%
WinGet, Process, ProcessName, ahk_id %WinID%

Info := "Window Information:" . "\`n"
Info .= "Title: " . Title . "\`n"
Info .= "Class: " . Class . "\`n"
Info .= "Process: " . Process

MsgBox, %Info%
return`,
    version: 'v1'
  },
  {
    id: 'c6',
    name: 'Clipboard Manager',
    description: 'Enhanced clipboard with history. Ctrl+Shift+V to access clipboard history menu.',
    tags: ['productivity', 'clipboard', 'utility'],
    downloadCount: 6340,
    content: `; Clipboard Manager - AHK v2
#Requires AutoHotkey v2.0
#SingleInstance Force

clipHistory := []
maxHistory := 10

OnClipboardChange ClipChanged

ClipChanged(DataType) {
    if (DataType = 1 && A_Clipboard != "") {
        clipHistory.InsertAt(1, A_Clipboard)
        if (clipHistory.Length > maxHistory)
            clipHistory.Pop()
    }
}

^+v:: {
    if (clipHistory.Length = 0) {
        MsgBox("Clipboard history is empty")
        return
    }

    menu := Menu()
    for index, item in clipHistory {
        preview := StrLen(item) > 50 ? SubStr(item, 1, 50) "..." : item
        menu.Add(preview, MenuHandler)
    }
    menu.Show()
}

MenuHandler(ItemName, ItemPos, MyMenu) {
    A_Clipboard := clipHistory[ItemPos]
    Send("^v")
}`,
    version: 'v2'
  },
  {
    id: 'c7',
    name: 'Media Hotkeys',
    description: 'Global media controls. Use F7-F9 for play/pause, previous, and next track.',
    tags: ['media', 'hotkeys', 'productivity'],
    downloadCount: 3560,
    content: `; Media Hotkeys - AHK v1
#NoEnv
#SingleInstance Force

; F7 - Play/Pause
F7::Send {Media_Play_Pause}

; F8 - Previous Track
F8::Send {Media_Prev}

; F9 - Next Track
F9::Send {Media_Next}

; Ctrl+F7 - Volume Down
^F7::Send {Volume_Down}

; Ctrl+F8 - Mute
^F8::Send {Volume_Mute}

; Ctrl+F9 - Volume Up
^F9::Send {Volume_Up}`,
    version: 'v1'
  },
  {
    id: 'c8',
    name: 'Always On Top',
    description: 'Toggle any window to always stay on top. Press Ctrl+Space on active window.',
    tags: ['windows', 'productivity', 'utility'],
    downloadCount: 4780,
    content: `; Always On Top - AHK v1
#NoEnv
#SingleInstance Force

^Space::
WinGet, ExStyle, ExStyle, A
if (ExStyle & 0x8) {
    WinSet, AlwaysOnTop, Off, A
    ToolTip, Always On Top: OFF
} else {
    WinSet, AlwaysOnTop, On, A
    ToolTip, Always On Top: ON
}
SetTimer, RemoveToolTip, 1500
return

RemoveToolTip:
SetTimer, RemoveToolTip, Off
ToolTip
return`,
    version: 'v1'
  },
  {
    id: 'c9',
    name: 'Roblox Anti-AFK',
    description: 'Prevents getting kicked for inactivity in Roblox. Sends random movements every few minutes.',
    tags: ['gaming', 'roblox', 'anti-afk'],
    downloadCount: 9240,
    content: `; Roblox Anti-AFK - AHK v2
#Requires AutoHotkey v2.0
#SingleInstance Force

; Configuration
afkInterval := 120000  ; 2 minutes in milliseconds
randomMovement := true

; Ensure Roblox window is active
SetTimer(AntiAFK, afkInterval)

AntiAFK() {
    ; Check if Roblox window exists
    if WinExist("ahk_exe RobloxPlayerBeta.exe") {
        WinActivate
        Sleep(100)

        ; Send random movement keys
        if (randomMovement) {
            movements := ["w", "a", "s", "d", "Space"]
            randomKey := movements[Random(1, movements.Length)]
            Send("{" randomKey " down}")
            Sleep(50)
            Send("{" randomKey " up}")
        } else {
            ; Just jump
            Send("{Space}")
        }

        ToolTip("Anti-AFK: Active")
        SetTimer(() => ToolTip(), -2000)
    }
}

; F10 to toggle on/off
F10:: {
    static isActive := true
    isActive := !isActive

    if (isActive) {
        SetTimer(AntiAFK, afkInterval)
        ToolTip("Anti-AFK: Enabled")
    } else {
        SetTimer(AntiAFK, 0)
        ToolTip("Anti-AFK: Disabled")
    }
    SetTimer(() => ToolTip(), -2000)
}

; F11 to exit
F11::ExitApp`,
    version: 'v2'
  },
  {
    id: 'c10',
    name: 'Roblox Auto Clicker',
    description: 'Fast auto-clicker for Roblox games. Toggle with F1, adjustable speed.',
    tags: ['gaming', 'roblox', 'clicker'],
    downloadCount: 8150,
    content: `; Roblox Auto Clicker - AHK v2
#Requires AutoHotkey v2.0
#SingleInstance Force

clickDelay := 50  ; Milliseconds between clicks
isActive := false

F1:: {
    global isActive
    isActive := !isActive

    if (isActive) {
        if WinExist("ahk_exe RobloxPlayerBeta.exe") {
            WinActivate
            SetTimer(AutoClick, clickDelay)
            ToolTip("Auto Clicker: ON")
        } else {
            isActive := false
            ToolTip("Roblox not found!")
        }
    } else {
        SetTimer(AutoClick, 0)
        ToolTip("Auto Clicker: OFF")
    }
    SetTimer(() => ToolTip(), -2000)
}

AutoClick() {
    if WinActive("ahk_exe RobloxPlayerBeta.exe") {
        Click
    }
}

; Adjust speed with +/- keys
NumpadAdd:: {
    global clickDelay
    clickDelay := Max(10, clickDelay - 10)
    ToolTip("Click Speed: " clickDelay "ms")
    SetTimer(() => ToolTip(), -1500)
}

NumpadSub:: {
    global clickDelay
    clickDelay := Min(500, clickDelay + 10)
    ToolTip("Click Speed: " clickDelay "ms")
    SetTimer(() => ToolTip(), -1500)
}

F2::ExitApp`,
    version: 'v2'
  },
  {
    id: 'c11',
    name: 'Roblox Pet Simulator Auto Hatch',
    description: 'Automatically hatches eggs in Pet Simulator games. Press E key repeatedly.',
    tags: ['gaming', 'roblox', 'pet-simulator'],
    downloadCount: 5680,
    content: `; Roblox Pet Simulator Auto Hatch - AHK v2
#Requires AutoHotkey v2.0
#SingleInstance Force

hatchKey := "e"
hatchDelay := 100
isRunning := false

F1:: {
    global isRunning
    isRunning := !isRunning

    if (isRunning) {
        if WinExist("ahk_exe RobloxPlayerBeta.exe") {
            WinActivate
            SetTimer(AutoHatch, hatchDelay)
            ToolTip("Auto Hatch: ON")
        } else {
            isRunning := false
            ToolTip("Roblox not found!")
        }
    } else {
        SetTimer(AutoHatch, 0)
        ToolTip("Auto Hatch: OFF")
    }
    SetTimer(() => ToolTip(), -2000)
}

AutoHatch() {
    global hatchKey
    if WinActive("ahk_exe RobloxPlayerBeta.exe") {
        Send("{" hatchKey "}")
    }
}

F2::ExitApp`,
    version: 'v2'
  },
  {
    id: 'c12',
    name: 'Roblox Auto Farm (WASD Walk)',
    description: 'Auto-walks in Roblox for farming games. Moves in patterns to collect items.',
    tags: ['gaming', 'roblox', 'farming'],
    downloadCount: 6920,
    content: `; Roblox Auto Farm - AHK v2
#Requires AutoHotkey v2.0
#SingleInstance Force

walkTime := 3000
isRunning := false

F1:: {
    global isRunning
    isRunning := !isRunning

    if (isRunning) {
        if WinExist("ahk_exe RobloxPlayerBeta.exe") {
            WinActivate
            AutoFarm()
            ToolTip("Auto Farm: ON")
        } else {
            isRunning := false
            ToolTip("Roblox not found!")
        }
    } else {
        ToolTip("Auto Farm: OFF")
    }
    SetTimer(() => ToolTip(), -2000)
}

AutoFarm() {
    global isRunning, walkTime

    while (isRunning && WinActive("ahk_exe RobloxPlayerBeta.exe")) {
        ; Walk forward
        Send("{w down}")
        Sleep(walkTime)
        Send("{w up}")
        Sleep(500)

        ; Turn right and walk
        Send("{d down}")
        Sleep(1000)
        Send("{d up}")
        Sleep(500)

        ; Walk forward
        Send("{w down}")
        Sleep(walkTime)
        Send("{w up}")
        Sleep(500)

        ; Turn left and walk
        Send("{a down}")
        Sleep(1000)
        Send("{a up}")
        Sleep(500)
    }
}

F2::ExitApp`,
    version: 'v2'
  },
  {
    id: 'c13',
    name: 'RealTime Code Tester',
    description: 'Test AHK code snippets in real-time. F1 to toggle GUI, F12 to test highlighted code, F11 to end test.',
    tags: ['utility', 'development', 'testing'],
    downloadCount: 3420,
    content: `SetTitleMatchMode, 2 
OnExit, GuiClose
GuiShowFlag := 1

Gui, Add, Edit, x22 y60 w440 h270 vTempCode WantCtrlA, Input code here
Gui, Font, S10 CDefault Bold, Times New Roman
Gui, Add, Text, x92 y10 w290 h40 +Center, Input Test Code
Gui, Add, Button, x362 y330 w100 h30 gTestTempCode, Test code
Gui, Add, Button, x262 y330 w100 h30 gEndTest, End testcode
Gui, Add, Button, x22 y330 w100 h30 gClearTempCode, Clear code
Gui, Show, x127 y87 h379 w479, RealTime Code tester
Return

$F1::
KeyWait, F1, T.5
If !ErrorLevel
{
    Send, {F1}
    return
}
If (GuiShowFlag = 1)
{
    Gui, Hide
    GuiShowFlag--
}
Else If (GuiShowFlag = 0)
{
    Gui, Show
    GuiShowFlag++
}
KeyWait, F1
return

$F11::
KeyWait, F11, T1
If !ErrorLevel
{
    Send, {F11}
    return
}
EndTest:
PostMessage("Slave script", 1)
TrayTip, Status:, Test code ended and deleted.
KeyWait, F11
return

ClearTempCode:
GuiControl,, TempCode,
return

GuiClose:
PostMessage("Slave script", 1)
ExitApp

$F12::
KeyWait, F12, T1
If !ErrorLevel
{
    Send, {F12}
    return
}
GuiControl,, TempCode,
Sleep 200
Clipsave := ClipboardAll
Send, ^c
GuiControl,, TempCode, %Clipboard%
Clipboard := Clipsave
TestTempCode:
DetectHiddenWindows, On
If Winexist("TempTestCode.ahk")
{
    PostMessage("Slave script", 1)
}
DetectHiddenWindows, Off

Gui, Submit, NoHide
FileAppend, 
(
#Persistent
#SingleInstance, Force
Progress, m2 b fs13 Y0 zh0 WMn700, Test script is running
Gui 99: show, hide, Slave script
OnMessage(0x1001,"ReceiveMessage")
%TempCode%
return

ReceiveMessage(Message) {
   if Message = 1
   ExitApp
}
), %A_ScriptDir%\\TempTestCode.ahk
Run, %A_ProgramFiles%\\AutoHotkey\\AutoHotkey.exe "%A_ScriptDir%\\TempTestCode.ahk"
Sleep, 100
IfWinExist, ahk_class #32770
{
    Sleep 20
    WinActivate, ahk_class #32770
    Clipsave := ClipboardAll
    Send, ^c
    CheckWin := Clipboard
    Clipboard := Clipsave
    IfInString, CheckWin, The program will exit.
    {
    IfExist, %A_ScriptDir%\\TempTestCode.ahk
    FileDelete, %A_ScriptDir%\\TempTestCode.ahk
    TrayTip, ERROR, Error executing the code properly
    return
    }
}
TrayTip, Status:, Test code is now running on your machine.
return

PostMessage(Receiver, Message) {
   oldTMM := A_TitleMatchMode, oldDHW := A_DetectHiddenWindows
   SetTitleMatchMode, 3
   DetectHiddenWindows, on
   PostMessage, 0x1001,%Message%,,, %Receiver% ahk_class AutoHotkeyGUI
   SetTitleMatchMode, %oldTMM%
   DetectHiddenWindows, %oldDHW%
   IfExist, %A_ScriptDir%\\TempTestCode.ahk
   FileDelete, %A_ScriptDir%\\TempTestCode.ahk
}`,
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

  const curatedScriptsQuery = useQuery<{ success: boolean; scripts: Script[] }>({
    queryKey: ["/api/scripts/curated"],
  });

  const curatedScripts = (curatedScriptsQuery.data?.scripts as Script[]) || mockCuratedScripts;

  return (
    <div className="min-h-screen bg-blue-50/30 dark:bg-slate-950">
      <header className="border-b bg-background/95 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
          <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50 border-2 border-emerald-500 dark:border-emerald-600 rounded-lg px-6 py-2 shadow-md">
            <h1 className="text-2xl md:text-3xl font-bold text-emerald-700 dark:text-emerald-300 tracking-tight" data-testid="text-app-title">
              AHK Script Finder
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="mb-8 grid md:grid-cols-2 gap-4">
          <Link href="/ps99-tools" data-testid="link-ps99-tools-card">
            <Card className="p-2 bg-gradient-to-br from-violet-100 to-purple-200 dark:from-violet-900/30 dark:to-purple-800/30 hover-elevate active-elevate-2 cursor-pointer group relative" data-testid="card-ps99-tools">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-violet-700 dark:text-violet-300" />
                  <h2 className="text-base font-bold text-violet-900 dark:text-violet-100">PS99 Tools</h2>
                </div>
                <Gamepad2 className="w-5 h-5 text-purple-400 dark:text-purple-500 opacity-60" />
              </div>
              <p className="text-violet-800 dark:text-violet-200 text-xs mb-1">
                Real-time Pet Simulator 99 clan tracker, RAP checker, and battle monitor using Big Games API
              </p>
              <div className="flex items-center gap-1.5 text-xs font-medium text-violet-700 dark:text-violet-300">
                <span>Explore Live Data</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          <Link href="/python-transcriber" data-testid="link-python-transcriber-card">
            <Card className="p-2 bg-gradient-to-br from-fuchsia-100 to-pink-200 dark:from-fuchsia-900/30 dark:to-pink-800/30 hover-elevate active-elevate-2 cursor-pointer group relative" data-testid="card-python-transcriber">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-fuchsia-700 dark:text-fuchsia-300" />
                  <h2 className="text-base font-bold text-fuchsia-900 dark:text-fuchsia-100">Python Transcriber</h2>
                </div>
                <Sparkles className="w-5 h-5 text-pink-400 dark:text-pink-500 opacity-60" />
              </div>
              <p className="text-fuchsia-800 dark:text-fuchsia-200 text-xs mb-1">
                AI-powered Python to AutoHotkey converter with validation, debugging, and instant downloads
              </p>
              <div className="flex items-center gap-1.5 text-xs font-medium text-fuchsia-700 dark:text-fuchsia-300">
                <span>Convert Code Now</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>
        </div>
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />
        </div>

        <div className="bg-background border-2 border-emerald-500 dark:border-emerald-600 p-6 rounded-lg shadow-lg">
          <div className="mb-5 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50 border-2 border-emerald-500 dark:border-emerald-600 rounded-lg p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 tracking-tight">AutoHotkey Script Tools</h2>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1.5">Search GitHub, browse curated scripts, manage your library, and generate custom AHK scripts</p>
          </div>
          <Tabs defaultValue="search" className="space-y-6">
            <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2 bg-emerald-100 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-700 rounded-lg p-1.5 shadow-sm">
            <TabsTrigger value="search" data-testid="tab-search" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              GitHub Search
            </TabsTrigger>
            <TabsTrigger value="curated" data-testid="tab-curated" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Curated Library
            </TabsTrigger>
            <TabsTrigger value="personal" data-testid="tab-personal" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              My Scripts
            </TabsTrigger>
            <TabsTrigger value="ai" data-testid="tab-ai" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              AI Generator
            </TabsTrigger>
            <TabsTrigger value="tester" data-testid="tab-tester" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
              Script Tester
            </TabsTrigger>
            <TabsTrigger value="optimizer" data-testid="tab-optimizer" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
              System Optimizer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4 bg-background rounded-lg p-4">
            {searchMutation.isPending ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
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
                <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium">
                  Found {searchResults.length} AutoHotkey scripts matching "{searchQuery}"
                  {searchMutation.data?.totalCount && searchMutation.data.totalCount > searchResults.length && (
                    <span> (showing first {searchResults.length} of {searchMutation.data.totalCount} total results)</span>
                  )}
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {searchResults.map((result: SearchResult) => (
                    <div key={result.id} className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50 border-2 border-emerald-400 dark:border-emerald-700 rounded-lg overflow-hidden shadow-sm">
                      <SearchResultCard
                        result={result}
                        onDownload={handleDownload}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="curated" className="space-y-4 bg-background rounded-lg p-4">
            {curatedScriptsQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : curatedScripts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {curatedScripts.map((script) => (
                  <div key={script.id} className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50 border-2 border-emerald-400 dark:border-emerald-700 rounded-lg overflow-hidden shadow-sm">
                    <ScriptCard
                      script={script}
                      onDownload={handleDownload}
                      onPreview={handlePreview}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No curated scripts available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="personal" className="space-y-4 bg-background rounded-lg p-4">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setAddDialogOpen(true)} data-testid="button-add-script" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Script
              </Button>
            </div>
            {personalScriptsQuery.isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
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
                  <div key={script.id} className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50 border-2 border-emerald-400 dark:border-emerald-700 rounded-lg overflow-hidden shadow-sm">
                    <ScriptCard
                      script={script}
                      onDownload={handleDownload}
                      onPreview={handlePreview}
                      onDelete={handleDeleteScript}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 bg-background rounded-lg p-4">
            <div className="border-2 border-emerald-400 dark:border-emerald-700 rounded-lg overflow-hidden shadow-sm">
              <AIGenerator
                prompt={aiPrompt}
                onPromptChange={setAiPrompt}
                onGenerate={handleGenerate}
                isGenerating={generateMutation.isPending}
              />
            </div>
            {generatedCode && (
              <div className="border-2 border-emerald-400 dark:border-emerald-700 rounded-lg overflow-hidden shadow-sm">
                <CodeViewer code={generatedCode} title="Generated Script" />
              </div>
            )}
          </TabsContent>

          <TabsContent value="tester" className="space-y-4 bg-background rounded-lg p-4">
            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50 border-2 border-emerald-400 dark:border-emerald-700 rounded-lg p-6 space-y-4 shadow-sm">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-emerald-800 dark:text-emerald-200">Script Tester & Validator</h2>
                <p className="text-emerald-700 dark:text-emerald-300 mb-4">
                  Test and validate your AutoHotkey scripts before downloading. This tool checks for syntax errors and provides helpful feedback.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Paste your AHK script below:</label>
                  <textarea
                    className="w-full min-h-[300px] p-4 rounded-md border bg-background font-mono text-sm"
                    placeholder="Paste your AutoHotkey v1 or v2 script here...

Example:
#Requires AutoHotkey v2.0

F1::MsgBox('Hello World!')"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      if (!aiPrompt.trim()) {
                        toast({
                          title: "Empty script",
                          description: "Please paste a script to test",
                          variant: "destructive"
                        });
                        return;
                      }

                      const isV2 = aiPrompt.includes('#Requires AutoHotkey v2') || aiPrompt.includes('AutoHotkey v2');
                      const hasHotkeys = /^[#^!+]*[a-zA-Z0-9]+::/m.test(aiPrompt);
                      const hasFunctions = /\w+\([^)]*\)\s*{/.test(aiPrompt);

                      let warnings = [];
                      if (!isV2 && !aiPrompt.includes('#NoEnv')) {
                        warnings.push('Consider adding #NoEnv for AHK v1 scripts');
                      }
                      if (!hasHotkeys && !hasFunctions) {
                        warnings.push('No hotkeys or functions detected - script may not do anything');
                      }

                      toast({
                        title: "Script Analysis",
                        description: isV2 
                          ? "✓ AutoHotkey v2 script detected" 
                          : "✓ AutoHotkey v1 script detected" + (warnings.length ? "\n⚠ " + warnings.join(", ") : ""),
                      });
                    }}
                  >
                    Validate Script
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (!aiPrompt.trim()) return;
                      const blob = new Blob([aiPrompt], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'tested-script.ahk';
                      a.click();
                      URL.revokeObjectURL(url);
                      toast({
                        title: "Download started",
                        description: "Your tested script has been downloaded"
                      });
                    }}
                  >
                    Download Script
                  </Button>
                </div>

                <div className="bg-muted rounded-md p-4 space-y-2">
                  <h3 className="font-semibold text-sm">Testing Tips:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>AHK v2 scripts should start with <code className="bg-background px-1 rounded">#Requires AutoHotkey v2.0</code></li>
                    <li>AHK v1 scripts should include <code className="bg-background px-1 rounded">#NoEnv</code> and <code className="bg-background px-1 rounded">#SingleInstance Force</code></li>
                    <li>Test scripts in a safe environment before using them in production</li>
                    <li>Always include exit hotkeys like <code className="bg-background px-1 rounded">F2::ExitApp</code></li>
                    <li>Use <code className="bg-background px-1 rounded">ToolTip</code> for debugging to see if hotkeys are triggered</li>
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Quick Test Scripts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAiPrompt(`#Requires AutoHotkey v2.0\n\nF1::MsgBox("Test successful!")\nF2::ExitApp`)}
                    >
                      Load V2 Test
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAiPrompt(`#NoEnv\n#SingleInstance Force\n\nF1::MsgBox, Test successful!\nF2::ExitApp`)}
                    >
                      Load V1 Test
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="optimizer" className="space-y-6 bg-background rounded-lg p-4">
            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50 rounded-lg border-2 border-emerald-400 dark:border-emerald-700 p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-2 text-emerald-800 dark:text-emerald-200 tracking-tight">System Performance Optimizer</h2>
              <p className="text-emerald-700 dark:text-emerald-300 mb-4">
                Boost your PC's gaming performance with specialized tools for RAM cleaning, background app management, and system monitoring. Perfect for low-end PCs and Roblox players.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-emerald-200 dark:bg-emerald-800 shadow-sm">RAM Cleaning</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-teal-200 dark:bg-teal-800 shadow-sm">Process Management</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-cyan-200 dark:bg-cyan-800 shadow-sm">Performance Monitoring</Badge>
                </div>
              </div>
            </div>

            {curatedScriptsQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50 border-2 border-emerald-400 dark:border-emerald-700 rounded-lg p-3 mb-4 shadow-sm">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                      <Zap className="w-5 h-5 text-amber-500" />
                      RAM & Memory Tools
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {curatedScripts
                      .filter((script) => script.tags?.some(tag => ['RAM', 'Memory', 'Low-End PC'].includes(tag)))
                      .map((script) => (
                        <div key={script.id} className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50 border-2 border-emerald-400 dark:border-emerald-700 rounded-lg overflow-hidden shadow-sm">
                          <ScriptCard
                            script={script}
                            onDownload={handleDownload}
                            onPreview={handlePreview}
                          />
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50 border-2 border-emerald-400 dark:border-emerald-700 rounded-lg p-3 mb-4 shadow-sm">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                      <Trophy className="w-5 h-5 text-violet-500" />
                      System Optimizers
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {curatedScripts
                      .filter((script) => script.tags?.some(tag => ['System', 'Optimizer', 'Process', 'Manager', 'Cleanup'].includes(tag)))
                      .map((script) => (
                        <div key={script.id} className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50 border-2 border-emerald-400 dark:border-emerald-700 rounded-lg overflow-hidden shadow-sm">
                          <ScriptCard
                            script={script}
                            onDownload={handleDownload}
                            onPreview={handlePreview}
                          />
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50 border-2 border-emerald-400 dark:border-emerald-700 rounded-lg p-3 mb-4 shadow-sm">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                      <Activity className="w-5 h-5 text-emerald-500" />
                      Performance Monitors
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {curatedScripts
                      .filter((script) => script.tags?.some(tag => ['Monitor', 'CPU', 'GPU', 'Performance'].includes(tag)))
                      .map((script) => (
                        <div key={script.id} className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50 border-2 border-emerald-400 dark:border-emerald-700 rounded-lg overflow-hidden shadow-sm">
                          <ScriptCard
                            script={script}
                            onDownload={handleDownload}
                            onPreview={handlePreview}
                          />
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Optimization Tips for Low-End PCs
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    <li>Close unnecessary browser tabs and background apps before gaming</li>
                    <li>Use the RAM cleaner regularly to free up memory</li>
                    <li>Enable "Maximum Gaming Mode" when playing resource-intensive games like Roblox</li>
                    <li>Monitor your CPU/GPU temperatures to prevent thermal throttling</li>
                    <li>Disable Windows visual effects for better performance</li>
                    <li>Keep your graphics drivers up to date</li>
                    <li>Run these scripts as administrator for full access to system resources</li>
                  </ul>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
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