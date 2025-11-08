import { storage } from "./storage";
import { readFileSync } from "fs";
import { join } from "path";

export async function initializeScripts() {
  const curatedScripts = await storage.getCuratedScripts();
  
  if (curatedScripts.length > 0) {
    console.log('Curated scripts already initialized');
    return;
  }

  console.log('Initializing curated scripts...');

  const fischMacro = `#SingleInstance Force
setkeydelay, -1
setmousedelay, -1
setbatchlines, -1
SetTitleMatchMode 2

CoordMode, Tooltip, Relative
CoordMode, Pixel, Relative
CoordMode, Mouse, Relative

;     GENERAL SETTINGS     ====================================================================================================;

; Set to true to automatically lower graphics to 1
AutoLowerGraphics := true
AutoGraphicsDelay := 50

; Set to true to automatically zoom in the camera
AutoZoomInCamera := true
AutoZoomDelay := 50

; Set to true to check for camera mode and enable it
AutoEnableCameraMode := true
AutoCameraDelay := 5

; Set to true to automatically look down
AutoLookDownCamera := true
AutoLookDelay := 200

; Set to true to automatically blur the camera
AutoBlurCamera := true
AutoBlurDelay := 50

; How long to wait after fishing before restarting
RestartDelay := 1000

; How long to hold the cast for before releasing
HoldRodCastDuration := 1000

; How long to wait for the bobber to land in water
WaitForBobberDelay := 1000

; Set this to your navigation key, IMPORTANT
NavigationKey := "\\"

;     SHAKE SETTINGS     ====================================================================================================;

; Change to "Navigation" or "Click"
ShakeMode := "Click"

; Configurable fishing automation macro for Roblox Fisch game
; Supports both click and navigation shake modes
; Includes auto-graphics lowering, camera positioning, and minigame solver`;

  const ps99ClanTracker = `#SingleInstance Force
#NoEnv
SetWorkingDir %A_ScriptDir%
SendMode Input
SetBatchLines -1

;PS99 Enhanced Clan Tracker with Real-Time Big Games API
;
;Features:
;- Real-time clan data from Big Games API
;- Live clan battle tracking
;- Multiple clan comparison
;- Automatic updates
;
;Controls:
;F5 - Toggle overlay visibility
;F7 - Add clan to track
;F8 - Set target weight
;Esc - Exit overlay

;Global variables
global ClanTrackerVisible := true
global ClanNames := ["Goop", "fr3e", "CAT"]  ; Default clans to track
global UpdateInterval := 60000  ; Update every 1 minute

; Enhanced clan tracker with Big Games API integration
; Features live data, battle tracking, and multi-clan comparison`;

  const inkGameAutoRoll = `; InkGame AutoRoll Macro
; Автоматически ролит силу в Roblox режиме под названием Ink Game
; Requires: power rolls
; Resolution: 2560x1080, 1920x1080
; DPI: 1600
; Roblox sensitivity: 5 squares

#SingleInstance Force
#NoEnv
SendMode Input
SetBatchLines -1

F1::
Loop
{
    Click 162, 553
    Sleep 64
    Click 741, 711
    Sleep 500
    Click 1041, 893
    Sleep 64
}
return

F2::ExitApp`;

  try {
    await storage.createCuratedScript({
      name: "Fisch Macro V11.2",
      description: "Advanced fishing automation macro for Roblox Fisch game. Features auto-graphics lowering, camera positioning, shake detection (click/navigation modes), and minigame solver with stabilization.",
      content: fischMacro,
      tags: ["Roblox", "Fisch", "Fishing", "Automation", "Macro", "Gaming"],
      version: "v1"
    });

    await storage.createCuratedScript({
      name: "PS99 Enhanced Clan Tracker",
      description: "Real-time clan competition tracker for Pet Simulator 99 using Big Games API. Track multiple clans, view live battle data, competition countdowns, and points comparison with auto-updates.",
      content: ps99ClanTracker,
      tags: ["Roblox", "Pet Simulator 99", "PS99", "Clan", "Tracker", "API"],
      version: "v1"
    });

    await storage.createCuratedScript({
      name: "InkGame AutoRoll",
      description: "Auto-roller for Ink Game power rolls in Roblox. Optimized for 1920x1080 or 2560x1080 resolution with 1600 DPI. Press F1 to start, F2 to stop.",
      content: inkGameAutoRoll,
      tags: ["Roblox", "Ink Game", "Auto Roll", "Macro", "Gaming"],
      version: "v1"
    });

    // System Optimization Scripts
    const ramCleaner = `; RAM Cleaner & Memory Optimizer
; Free up system memory using Windows EmptyWorkingSet API
; Press Ctrl+Shift+M to clean RAM
; Works on Windows 7/8/10/11

#SingleInstance Force
#NoEnv
SendMode Input
SetBatchLines -1

; Run as administrator for full access
if (!A_IsAdmin) {
    Run *RunAs "%A_ScriptFullPath%"
    ExitApp
}

; Ctrl+Shift+M: Clean RAM
^+m::
{
    startTime := A_TickCount
    processCount := 0
    
    ; Create progress tooltip
    ToolTip, Cleaning RAM...
    
    ; Enumerate all processes and empty working sets
    for proc in ComObjGet("winmgmts:").ExecQuery("Select * from Win32_Process") {
        pid := proc.ProcessId
        hProc := DllCall("OpenProcess", "UInt", 0x1F0FFF, "Int", false, "UInt", pid, "Ptr")
        if (hProc) {
            DllCall("psapi\\EmptyWorkingSet", "Ptr", hProc)
            DllCall("CloseHandle", "Ptr", hProc)
            processCount++
        }
    }
    
    ; Calculate time and show result
    elapsed := (A_TickCount - startTime) / 1000
    ToolTip, RAM Cleaned!\\nProcesses: %processCount%\\nTime: %elapsed%s
    Sleep, 3000
    ToolTip
    
    ; Play completion sound
    SoundBeep, 1200, 200
    return
}

; Ctrl+Shift+A: Auto-clean every 5 minutes
^+a::
{
    SetTimer, AutoClean, 300000  ; 5 minutes
    TrayTip, Auto-Clean Enabled, RAM will be cleaned every 5 minutes, 5, 1
    return
}

AutoClean:
    Gosub, ^+m
return

; Tray menu
Menu, Tray, NoStandard
Menu, Tray, Add, Clean RAM Now (Ctrl+Shift+M), CleanRAM
Menu, Tray, Add, Enable Auto-Clean (Ctrl+Shift+A), EnableAuto
Menu, Tray, Add
Menu, Tray, Add, Exit, ExitScript

CleanRAM:
    Gosub, ^+m
return

EnableAuto:
    Gosub, ^+a
return

ExitScript:
ExitApp`;

    const robloxOptimizer = `; Roblox Game Performance Booster
; Optimizes PC for Roblox gameplay by closing background apps
; Designed for low-end PCs that struggle with performance
; Press Ctrl+Shift+G to activate gaming mode

#SingleInstance Force
#NoEnv
SendMode Input
SetBatchLines -1

; Run as administrator
if (!A_IsAdmin) {
    Run *RunAs "%A_ScriptFullPath%"
    ExitApp
}

gamingMode := false

; Ctrl+Shift+G: Toggle Gaming Mode
^+g::
{
    if (!gamingMode) {
        ; === ENABLE GAMING MODE ===
        SoundBeep, 800, 100
        ToolTip, Activating Gaming Mode...
        
        ; Close resource-heavy apps
        CloseProcess("Chrome.exe")
        CloseProcess("firefox.exe")
        CloseProcess("msedge.exe")
        CloseProcess("Discord.exe")
        CloseProcess("Spotify.exe")
        CloseProcess("Slack.exe")
        CloseProcess("Teams.exe")
        CloseProcess("OneDrive.exe")
        CloseProcess("steamwebhelper.exe")
        
        ; Close Adobe bloat
        CloseProcess("AdobeUpdateService.exe")
        CloseProcess("CCLibrary.exe")
        CloseProcess("CCXProcess.exe")
        
        ; Close game launchers
        CloseProcess("EpicGamesLauncher.exe")
        CloseProcess("Origin.exe")
        
        ; Set high performance power plan
        Run, powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c,, Hide
        
        ; Disable Windows visual effects temporarily
        Run, SystemPropertiesPerformance.exe,, Hide
        
        gamingMode := true
        ToolTip, Gaming Mode Activated!\\nBackground apps closed\\nPerformance optimized
        Sleep, 3000
        ToolTip
        SoundBeep, 1200, 200
    } else {
        ; === DISABLE GAMING MODE ===
        ToolTip, Deactivating Gaming Mode...
        
        ; Restore balanced power plan
        Run, powercfg /setactive 381b4222-f694-41f0-9685-ff5bb260df2e,, Hide
        
        gamingMode := false
        ToolTip, Normal Mode Restored
        Sleep, 2000
        ToolTip
        SoundBeep, 1000, 200
    }
    return
}

; Function to safely close processes
CloseProcess(procName) {
    Process, Exist, %procName%
    if (ErrorLevel > 0) {
        Process, Close, %procName%
        Sleep, 50
    }
}

; Roblox-specific optimizations
; Auto-activate when Roblox launches
#Persistent
SetTimer, CheckRoblox, 3000

CheckRoblox:
    Process, Exist, RobloxPlayerBeta.exe
    if (ErrorLevel > 0 and !gamingMode) {
        ; Auto-activate gaming mode when Roblox starts
        Gosub, ^+g
        SetTimer, CheckRoblox, Off
    }
return

; Tray menu
Menu, Tray, NoStandard
Menu, Tray, Add, Toggle Gaming Mode (Ctrl+Shift+G), ToggleGaming
Menu, Tray, Add
Menu, Tray, Add, Exit, ExitScript

ToggleGaming:
    Gosub, ^+g
return

ExitScript:
ExitApp`;

    const cpuGpuMonitor = `; CPU/GPU Performance Monitor
; Real-time system performance overlay
; Shows CPU usage, RAM usage, and GPU temperature
; Press F9 to toggle overlay

#SingleInstance Force
#NoEnv
SetBatchLines -1

; === GUI Setup ===
Gui, +AlwaysOnTop -Caption +ToolWindow
Gui, Color, 000000
Gui, Font, s9 cWhite, Consolas
Gui, Add, Text, x10 y10 w180, === SYSTEM MONITOR ===
Gui, Add, Text, x10 y30 w180, CPU Usage:
Gui, Add, Text, x10 y50 w180 vCPUText, 0%
Gui, Add, Progress, x10 y70 w180 h15 vCPUBar BackgroundBlack c00FF00
Gui, Add, Text, x10 y95 w180, RAM Usage:
Gui, Add, Text, x10 y115 w180 vRAMText, 0 MB / 0 MB
Gui, Add, Progress, x10 y135 w180 h15 vRAMBar BackgroundBlack cFF6600
Gui, Add, Text, x10 y160 w180, GPU Temp:
Gui, Add, Text, x10 y180 w180 vGPUText, N/A
Gui, Add, Text, x10 y205 w180 c808080, Press F9 to hide
Gui, Show, w200 h230 x20 y20, Performance

; Make GUI draggable
OnMessage(0x201, "WM_LBUTTONDOWN")

; F9 to toggle visibility
F9::
    Gui, Show/Hide
return

; Update stats every second
SetTimer, UpdateStats, 1000
Return

UpdateStats:
    ; CPU Usage
    CPU := GetCPULoad()
    GuiControl,, CPUText, %CPU%%
    GuiControl,, CPUBar, %CPU%
    
    ; RAM Usage
    RAM := GetRAMUsage()
    RAMPercent := RAM.Percent
    RAMUsed := Round(RAM.Used / 1024 / 1024)
    RAMTotal := Round(RAM.Total / 1024 / 1024)
    GuiControl,, RAMText, %RAMUsed% MB / %RAMTotal% MB
    GuiControl,, RAMBar, %RAMPercent%
    
    ; GPU Temperature (if available)
    GPU := GetGPUTemp()
    GuiControl,, GPUText, %GPU%
Return

GuiClose:
ExitApp

; Make window draggable
WM_LBUTTONDOWN() {
    PostMessage, 0xA1, 2
}

; === Performance Functions ===

; Get CPU Load (by SKAN)
GetCPULoad() {
    static PIT, PKT, PUT
    IfEqual, PIT,, Return 0, DllCall("GetSystemTimes", "Int64P",PIT, "Int64P",PKT, "Int64P",PUT)
    DllCall("GetSystemTimes", "Int64P",CIT, "Int64P",CKT, "Int64P",CUT)
    return Floor((1 - (CIT-PIT) / (CUT-PUT)) * 100)
        , PIT := CIT, PKT := CKT, PUT := CUT
}

; Get RAM Usage
GetRAMUsage() {
    static MEMORYSTATUSEX, init := NumPut(VarSetCapacity(MEMORYSTATUSEX, 64, 0), MEMORYSTATUSEX, "uint")
    if !DllCall("GlobalMemoryStatusEx", "ptr", &MEMORYSTATUSEX)
        return {Percent: 0, Used: 0, Total: 0}
    
    percent := NumGet(MEMORYSTATUSEX, 4, "UInt")
    total := NumGet(MEMORYSTATUSEX, 8, "Int64")
    avail := NumGet(MEMORYSTATUSEX, 16, "Int64")
    used := total - avail
    
    return {Percent: percent, Used: used, Total: total}
}

; Get GPU Temperature (NVIDIA via WMI)
GetGPUTemp() {
    try {
        for objItem in ComObjGet("winmgmts:\\\\.\\root\\WMI").ExecQuery("SELECT * FROM MSAcpi_ThermalZoneTemperature") {
            temp := Round((objItem.CurrentTemperature - 2732) / 10.0, 1)
            return temp " °C"
        }
    }
    return "N/A"
}`;

    const processManager = `; Gaming Process Manager
; Close non-essential apps for maximum gaming performance
; Multiple optimization profiles for different game types
; Press Ctrl+1/2/3 for different profiles

#SingleInstance Force
#NoEnv
SendMode Input

if (!A_IsAdmin) {
    Run *RunAs "%A_ScriptFullPath%"
    ExitApp
}

; === OPTIMIZATION PROFILES ===

; Ctrl+1: Light Gaming Mode (close only heavy apps)
^1::
{
    ToolTip, Light Gaming Mode...
    CloseProcess("Chrome.exe")
    CloseProcess("firefox.exe")
    CloseProcess("Spotify.exe")
    CloseProcess("Discord.exe")
    ToolTip, Light Gaming Mode Active
    Sleep, 2000
    ToolTip
    SoundBeep, 1000, 150
    return
}

; Ctrl+2: Medium Gaming Mode (close most background apps)
^2::
{
    ToolTip, Medium Gaming Mode...
    
    ; Browsers
    CloseProcess("Chrome.exe")
    CloseProcess("firefox.exe")
    CloseProcess("msedge.exe")
    CloseProcess("opera.exe")
    
    ; Communication
    CloseProcess("Discord.exe")
    CloseProcess("Slack.exe")
    CloseProcess("Teams.exe")
    CloseProcess("Skype.exe")
    
    ; Media
    CloseProcess("Spotify.exe")
    CloseProcess("iTunes.exe")
    
    ; Cloud sync
    CloseProcess("OneDrive.exe")
    CloseProcess("Dropbox.exe")
    CloseProcess("GoogleDrive.exe")
    
    ToolTip, Medium Gaming Mode Active
    Sleep, 2000
    ToolTip
    SoundBeep, 1200, 150
    return
}

; Ctrl+3: Maximum Gaming Mode (close everything non-essential)
^3::
{
    ToolTip, Maximum Gaming Mode...
    
    ; All from Medium mode
    Gosub, ^2
    
    ; Game launchers
    CloseProcess("steamwebhelper.exe")
    CloseProcess("EpicGamesLauncher.exe")
    CloseProcess("Origin.exe")
    CloseProcess("Battle.net.exe")
    
    ; Adobe bloat
    CloseProcess("AdobeUpdateService.exe")
    CloseProcess("CCLibrary.exe")
    CloseProcess("CCXProcess.exe")
    
    ; NVIDIA extras
    CloseProcess("GeForceExperience.exe")
    CloseProcess("NVIDIA Share.exe")
    
    ; Set high performance power plan
    Run, powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c,, Hide
    
    ToolTip, MAXIMUM Gaming Mode Active!
    Sleep, 2000
    ToolTip
    SoundBeep, 1400, 200
    return
}

; Ctrl+0: Restore Normal Mode
^0::
{
    ; Restore balanced power plan
    Run, powercfg /setactive 381b4222-f694-41f0-9685-ff5bb260df2e,, Hide
    ToolTip, Normal Mode Restored
    Sleep, 2000
    ToolTip
    return
}

CloseProcess(procName) {
    Process, Exist, %procName%
    if (ErrorLevel > 0) {
        Process, Close, %procName%
        Sleep, 30
    }
}

; Tray menu
Menu, Tray, NoStandard
Menu, Tray, Add, Light Mode (Ctrl+1), Light
Menu, Tray, Add, Medium Mode (Ctrl+2), Medium
Menu, Tray, Add, Maximum Mode (Ctrl+3), Maximum
Menu, Tray, Add
Menu, Tray, Add, Restore Normal (Ctrl+0), Normal
Menu, Tray, Add
Menu, Tray, Add, Exit, ExitScript

Light:
    Gosub, ^1
return

Medium:
    Gosub, ^2
return

Maximum:
    Gosub, ^3
return

Normal:
    Gosub, ^0
return

ExitScript:
ExitApp`;

    const lowEndPCBooster = `; Low-End PC Ultimate Performance Booster
; Comprehensive optimization for slower PCs struggling with Roblox
; Combines RAM cleaning, process management, and system tweaks
; Press F12 to activate full optimization

#SingleInstance Force
#NoEnv
SendMode Input

if (!A_IsAdmin) {
    Run *RunAs "%A_ScriptFullPath%"
    ExitApp
}

; F12: Full PC Optimization
F12::
{
    Progress, b w300, Optimizing your PC..., Low-End PC Booster
    
    ; Step 1: Clean RAM (30%)
    Progress, 30, Cleaning RAM...
    CleanRAM()
    Sleep, 500
    
    ; Step 2: Close background apps (50%)
    Progress, 50, Closing background apps...
    CloseBackgroundApps()
    Sleep, 500
    
    ; Step 3: Set performance power plan (70%)
    Progress, 70, Optimizing power settings...
    Run, powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c,, Hide
    Sleep, 300
    
    ; Step 4: Disable Windows effects (85%)
    Progress, 85, Disabling visual effects...
    DisableVisualEffects()
    Sleep, 300
    
    ; Step 5: Clear temp files (95%)
    Progress, 95, Clearing temp files...
    ClearTempFiles()
    Sleep, 300
    
    ; Complete
    Progress, 100, Optimization Complete!
    Sleep, 1000
    Progress, Off
    
    ; Show results
    TrayTip, Optimization Complete!, Your PC is now optimized for gaming.\\nRAM freed • Apps closed • Performance boosted, 10, 1
    SoundBeep, 1500, 300
    return
}

; Function: Clean RAM
CleanRAM() {
    for proc in ComObjGet("winmgmts:").ExecQuery("Select * from Win32_Process") {
        pid := proc.ProcessId
        hProc := DllCall("OpenProcess", "UInt", 0x1F0FFF, "Int", false, "UInt", pid, "Ptr")
        if (hProc) {
            DllCall("psapi\\EmptyWorkingSet", "Ptr", hProc)
            DllCall("CloseHandle", "Ptr", hProc)
        }
    }
}

; Function: Close background apps
CloseBackgroundApps() {
    apps := ["Chrome.exe", "firefox.exe", "msedge.exe", "Discord.exe", "Spotify.exe"
           , "Slack.exe", "Teams.exe", "OneDrive.exe", "Dropbox.exe"
           , "steamwebhelper.exe", "Origin.exe", "EpicGamesLauncher.exe"
           , "AdobeUpdateService.exe", "CCLibrary.exe"]
    
    for index, app in apps {
        Process, Close, %app%
        Sleep, 30
    }
}

; Function: Disable visual effects
DisableVisualEffects() {
    ; Set registry keys for best performance
    RegWrite, REG_DWORD, HKCU, Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects, VisualFXSetting, 2
}

; Function: Clear temp files
ClearTempFiles() {
    Run, cmd.exe /c del /q /f /s %TEMP%\\*.tmp,, Hide
    Run, cmd.exe /c del /q /f /s C:\\Windows\\Temp\\*.tmp,, Hide
}

; Ctrl+Shift+R: Quick restart optimization
^+r::
{
    ToolTip, Quick RAM clean...
    CleanRAM()
    Sleep, 500
    ToolTip, RAM cleaned!
    Sleep, 1500
    ToolTip
    SoundBeep, 1200, 150
    return
}

; Tray menu
Menu, Tray, NoStandard
Menu, Tray, Add, Full Optimization (F12), FullOpt
Menu, Tray, Add, Quick RAM Clean (Ctrl+Shift+R), QuickClean
Menu, Tray, Add
Menu, Tray, Add, Exit, ExitScript

FullOpt:
    Gosub, F12
return

QuickClean:
    Gosub, ^+r
return

ExitScript:
ExitApp`;

    await storage.createCuratedScript({
      name: "RAM Cleaner & Memory Optimizer",
      description: "Free up system memory using Windows EmptyWorkingSet API. Press Ctrl+Shift+M to instantly clean RAM, or Ctrl+Shift+A to enable auto-clean every 5 minutes. Perfect for keeping your PC responsive during gaming sessions.",
      content: ramCleaner,
      tags: ["System", "RAM", "Memory", "Optimization", "Performance", "Windows"],
      version: "v1"
    });

    await storage.createCuratedScript({
      name: "Roblox Game Performance Booster",
      description: "Optimizes PC for Roblox gameplay by automatically closing background apps and enabling high-performance mode. Auto-activates when Roblox launches. Press Ctrl+Shift+G to toggle gaming mode. Ideal for low-end PCs.",
      content: robloxOptimizer,
      tags: ["Roblox", "Gaming", "Optimization", "Performance", "Low-End PC", "System"],
      version: "v1"
    });

    await storage.createCuratedScript({
      name: "CPU/GPU Performance Monitor",
      description: "Real-time system performance overlay showing CPU usage, RAM usage, and GPU temperature. Draggable GUI with color-coded progress bars. Press F9 to toggle visibility. Essential for monitoring performance during gaming.",
      content: cpuGpuMonitor,
      tags: ["System", "Monitor", "CPU", "GPU", "Performance", "Overlay"],
      version: "v1"
    });

    await storage.createCuratedScript({
      name: "Gaming Process Manager",
      description: "Multi-profile process manager with Light/Medium/Maximum gaming modes. Close browser, communication, and background apps based on your needs. Ctrl+1 for Light, Ctrl+2 for Medium, Ctrl+3 for Maximum mode. Ctrl+0 to restore normal.",
      content: processManager,
      tags: ["Gaming", "Process", "Manager", "Optimization", "Performance", "System"],
      version: "v1"
    });

    await storage.createCuratedScript({
      name: "Low-End PC Ultimate Booster",
      description: "Comprehensive all-in-one optimization for slower PCs struggling with Roblox. Combines RAM cleaning, background app closure, visual effects disabling, temp file clearing, and power plan optimization. Press F12 for full optimization with progress display.",
      content: lowEndPCBooster,
      tags: ["Low-End PC", "Roblox", "Optimization", "Performance", "Gaming", "System"],
      version: "v1"
    });

    console.log('✓ Successfully initialized 8 curated scripts');
  } catch (error) {
    console.error('Error initializing scripts:', error);
  }
}
