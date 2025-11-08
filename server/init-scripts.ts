import { storage } from "./storage";
import { readFileSync } from "fs";
import { join } from "path";

export async function initializeScripts() {
  const scripts = await storage.getPersonalScripts();
  
  if (scripts.length > 0) {
    console.log('Scripts already initialized');
    return;
  }

  console.log('Initializing default scripts...');

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
    await storage.createPersonalScript({
      name: "Fisch Macro V11.2",
      description: "Advanced fishing automation macro for Roblox Fisch game. Features auto-graphics lowering, camera positioning, shake detection (click/navigation modes), and minigame solver with stabilization.",
      content: fischMacro,
      tags: ["Roblox", "Fisch", "Fishing", "Automation", "Macro", "Gaming"],
      version: "v1"
    });

    await storage.createPersonalScript({
      name: "PS99 Enhanced Clan Tracker",
      description: "Real-time clan competition tracker for Pet Simulator 99 using Big Games API. Track multiple clans, view live battle data, competition countdowns, and points comparison with auto-updates.",
      content: ps99ClanTracker,
      tags: ["Roblox", "Pet Simulator 99", "PS99", "Clan", "Tracker", "API"],
      version: "v1"
    });

    await storage.createPersonalScript({
      name: "InkGame AutoRoll",
      description: "Auto-roller for Ink Game power rolls in Roblox. Optimized for 1920x1080 or 2560x1080 resolution with 1600 DPI. Press F1 to start, F2 to stop.",
      content: inkGameAutoRoll,
      tags: ["Roblox", "Ink Game", "Auto Roll", "Macro", "Gaming"],
      version: "v1"
    });

    console.log('✓ Successfully initialized 3 default scripts');
  } catch (error) {
    console.error('Error initializing scripts:', error);
  }
}
