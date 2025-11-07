;Author: KuroiLight - klomb - <kuroilight@openmailbox.org>
;Started On: 30/03/15
;Licensed under: Creative Commons Attribution 3.0 Unported (CC-BY) found at http://creativecommons.org/licenses/by/3.0/legalcode

ListLines Off
SetBatchLines -1
#MaxThreadsBuffer On
#KeyHistory 0
#MaxHotkeysPerInterval 1000
#MaxThreads 3
#MaxThreadsPerHotkey 1
#NoEnv
#Persistent
#SingleInstance force
;#WinActivateForce
CoordMode, Mouse, Screen
DetectHiddenText, On
DetectHiddenWindows, On
SetTitleMatchMode, Fast
SetWinDelay, -1
SetWorkingDir %A_ScriptDir%
StringCaseSense, Off

;func objs
shk := Func("SetHotkey")
ss := shk.Bind(1, 0) ;software scroll
sfs := shk.Bind(1, 1) ;setfastscroll
native := shk.Bind(2, 0) ;native + activate
sna := Func("Software_NOACTIVATE")
sna_down := sna.Bind(1) ;software wheel down
sna_up := sna.Bind(0) ;software wheel up

Menu, Tray, NoStandard
Menu, Tray, Tip, ScrollAnywhere
Menu, Tray, Add, Off, SetHotkey
Menu, Tray, Add, Software Scroll, %ss%
Menu, Tray, Add, Native+Activate, %native%
Menu, Tray, Add, Fast Scroll, %sfs%
Menu, Tray, Add,
Menu, Tray, Add, Restart, _Reload
Menu, Tray, Add, Exit, _ExitApp

SetHotkey(INIUpdate("SCROLLMODE", 0, 0, 2))
return
_ExitApp:
    ExitApp
_Reload:
    Reload

INIUpdate(key, def, min, max, newval := "") {
    static ini_file := "scrollanywhere.ini"

    IniRead, ini_val, %ini_file%, Main, %key%, %def%
    if(newval != "")
        ini_val := newval
    if(ini_val > max or ini_val < min)
        ini_val := def
    IniWrite, %ini_val%, %ini_file%, Main, %key%

    return ini_val
}

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
SetHotkey(mode := 0, fast := 0) {
    global sna_down, sna_up, FastScroll, FastScrollMod
    static SCROLLMODE
    
    SCROLLMODE := INIUpdate("SCROLLMODE", 0, 0, 2, mode)
    FastScroll := INIUpdate("iFASTSCROLL", 0, 0, 1)
    FastScrollMod := INIUpdate("iFASTSCROLLMODIFIER", 2, 1, 10)
    IniRead, FastScrollKey, % "scrollanywhere.ini", Main, % "iFASTSCROLLKEY", % ""
    IniWrite, %FastScrollKey%, % "scrollanywhere.ini", Main, % "iFASTSCROLLKEY"
    
    Menu, Tray, Enable, Off
    Menu, Tray, Enable, Software Scroll
    Menu, Tray, Enable, Native+Activate
    Menu, Tray, Enable, Fast Scroll
    Hotkey, WheelUp, %sna_up%, Off
    Hotkey, WheelDown, %sna_down%, Off
    Hotkey, ~WheelUp, NativeAndActivate, Off
    Hotkey, ~WheelDown, NativeAndActivate, Off
    if(FastScrollKey != "")
        Hotkey, %FastScrollKey%, FastScrollPress, Off

    if(SCROLLMODE = 0){
        Menu, Tray, Disable, Off
        Menu, Tray, Disable, Fast Scroll
    } else if(SCROLLMODE = 1) {
        Menu, Tray, Disable, Software Scroll
        Hotkey, WheelUp, %sna_up%, On
        Hotkey, WheelDown, %sna_down%, On
        if(fast)
            FastScroll := INIUpdate("iFASTSCROLL", 0, 0, 1, !FastScroll)
        if(FastScroll and FastScrollKey != "")
            Hotkey, %FastScrollKey%, FastScrollPress, On
        Menu, Tray, % (FastScroll ? "Check" : "UnCheck"), Fast Scroll
    } else if(SCROLLMODE = 2) {
        Menu, Tray, Disable, Native+Activate
        Menu, Tray, Disable, Fast Scroll
        Hotkey, ~WheelUp, NativeAndActivate, On
        Hotkey, ~WheelDown, NativeAndActivate, On
    }
}

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;SHARED METHODS
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
MouseGetPosBoth(ByRef XYData, ByRef Window, ByRef MainControl, ByRef MDIControl) {
    MouseGetPos, X, Y, Window, MainControl, 2
    MouseGetPos,,,, MDIControl, 3
    XYData := ((Y << 16) | X)
    return (Window . MainControl . MDIControl)
}

SelectTarget(Window, Control1, Control2, skipPopups) {
    if(!Control1 and !Control2)
        return Window
    else if(!Control1)
        return Control2
    
    if(skipPopups) { ;0x00400000 = DLGFRAME, 0x80000000 = POPUP
        WinGet, Window_Style, Style, ahk_id %Window%
        if(Window_Style & 0x80000000 and !(Window_Style & 0x00400000))
            return Window
        
        WinGet, Control_ExStyle, ExStyle, ahk_id %Control1%
        if(Control_ExStyle & 0x00010000)
            return Window
    }
    
    if(Control1 != Control2) {
        WinGet, Control2_Style, Style, ahk_id %Control2%
        if((Control2_Style & 0x00200000) or (Control2_Style & 0x00100000))
            return Control2
        else
            return Control1
    }
    
    return Control1
}
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;NATIVE SCROLL METHODS
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
CanActivate(hwnd) {
    WinGet, hwnd_ExStyle, ExStyle, ahk_id %hwnd%
    return (hwnd_ExStyle & 0x08000000 ? false : true)
}

NativeAndActivate() {
    curData := MouseGetPosBoth(blank, mWindow, mControl, mdiControl)
    
    static prevWinData, prevTarget, correctStyle
    
    if(curData = prevWinData)
        TargetHwnd := prevTarget
    else {
        prevWinData := curData
        TargetHwnd := SelectTarget(mWindow, mControl, mdiControl, true)
        if(!CanActivate(TargetHwnd))
            TargetHwnd := 0
        prevTarget := TargetHwnd
    }

    if(!WinActive("ahk_id " . TargetHwnd))
        WinActivate, ahk_id %TargetHwnd%
}

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;SOFTWARE SCROLL METHODS
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
FastScrollPress() {
    global FastScroll
    key := RegExReplace(A_ThisHotkey, "[\!\^\#\+]*(.*)", "$1")
    
    FastScroll := 1
    KeyWait, %key%
    FastScroll := 0
}

IsBalloonTip(hwnd) {
    WinGetClass, hwnd_class, ahk_id %hwnd%
    return (InStr(hwnd_class, "tooltip") or InStr(hwnd_class, "balloon") or InStr(hwnd_class, "hint"))
}

SelectScrollMethod(hwnd, ByRef lparam, ByRef wparam) {
    ;global FastScroll, FastScrollMod
    
    WinGet, hwnd_Style, Style, ahk_id %hwnd%
    if(hwnd_Style & 0x00200000)
        wparam := 0x115
    else if(hwnd_Style & 0x00100000)
        wparam := 0x114
    else
        wparam := 0x20A
    
    if(wparam = 0x20A)
        lparam := (lparam ? 0-7864320 : 7864320)

    ;if(wparam = 0x20A)
    ;    lparam := Round((lparam ? 0-7864320 : 7864320) * (FastScroll ? FastScrollMod : 1))
    ;else
    ;    lparam := (FastScroll ? lparam+2 : lparam)
}

Software_NOACTIVATE(lparam) {
    global FastScrollMod, FastScroll
    curData := MouseGetPosBoth(mPosData, mWindow, mControl, mdiControl)
    
    static prevWinData, prevTarget, prevlparam, prevwparam
    
    if(curData = prevWinData)
        TargetHwnd := prevTarget
    else {
        prevWinData := curData
        TargetHwnd := SelectTarget(mWindow, mControl, mdiControl, false)
        TargetHwnd := (IsBalloonTip(TargetHwnd) ? prevTarget : TargetHwnd)
        prevTarget := TargetHwnd
    }
    
    if(lparam = prevlparam)
        wparam := prevwparam
    else
        SelectScrollMethod(TargetHwnd, lparam, wparam)
    
    SendMessage, %wparam%, %lparam%, %mPosData%,, ahk_id %TargetHwnd%
    if(FastScroll) {
        Loop %FastScrollMod% {
            Sleep 1
            SendMessage, %wparam%, %lparam%, %mPosData%,, ahk_id %TargetHwnd%
        }
    }
    ;tooltip % "SendMessage(" wparam ", " lparam ", " mPosData ", " TargetHwnd ")"
}
    
;NOTES:
;   - possibly test EM_LINESCROLL for use instead of WM_VSCROLL/WM_HSCROLL since it allows a number of scrolls.
;
; WS_VSCROLL := 0x00200000, WS_HSCROLL := 0x00100000,
; WM_MOUSEWHEEL := 0x20A, WM_HSCROLL := 0x114,
; WM_VSCROLL := 0x115, WHEELCONSTANT := 7864320,
; UPWHEEL := 1, DOWNWHEEL := 0, PAGEUP := 3, PAGEDOWN := 2
