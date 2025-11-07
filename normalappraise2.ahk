; thanks to @yungkrisz and @riskygadget4life for helping

#NoEnv
SendMode Input
SetWorkingDir %A_ScriptDir%
#SingleInstance Force
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, ToolTip, Screen

global delayFirst := 2000
global delaySecond := 2000
global delayThird := 500
global movePause := 200
global tolerance := 5
global roamRadius := 2

global areaDefined := false
global areaX1 := 0
global areaY1 := 0
global areaX2 := 0
global areaY2 := 0

global running := false
global selectionActive := false
global selectionPhase := "idle"
global selectionGuiExists := false
global selStartX := 0
global selStartY := 0
global selCurX := 0
global selCurY := 0
global selAreaX1 := 0
global selAreaY1 := 0
global selAreaX2 := 0
global selAreaY2 := 0

global clickDefined := false
global clickX := 0
global clickY := 0

colors := Object()
colors["Shrouded"] := "0x364335"
colors["Mythical"] := "0xED4D8A"
colors["Frozen"] := "0x7AEDD5"
colors["Spirit"] := "0x625195"
colors["Vined"] := "0x78CE7A"
colors["Crimson"] := "0x912222"

Gui, +AlwaysOnTop
Gui, Margin, 12, 10
Gui, Add, Text,, "Can you appraise this fish" click delay (ms):
Gui, Add, Edit, vDelayFirst w80, %delayFirst%
Gui, Add, Text,, "Yes" click delay (ms):
Gui, Add, Edit, vDelaySecond w80, %delaySecond%
Gui, Add, Text,, Wait before clicking (ms):
Gui, Add, Edit, vMovePause w80, %movePause%
Gui, Add, Text,, Fish reselect click delay (ms):
Gui, Add, Edit, vDelayThird w80, %delayThird%
Gui, Add, Text,, mutation search tolerance (Lower if detecting random shi):
Gui, Add, Edit, vTolerance w80, %tolerance%
Gui, Add, Text,, Cursor roam radius at each point:
Gui, Add, Edit, vRoamRadius w80, %roamRadius%
Gui, Add, Text, vAreaLabel Section, Area: not selected
Gui, Add, Text,, Press F2 to select the fish area and press f2 again to save it.
Gui, Add, Text, vClickLabel xm, Click location: not selected
Gui, Add, Text,, Press F1 to save the click location.

Gui, Add, GroupBox, xm y+10 w280 h170, Mutations to scan for (can select multiple)
Gui, Add, Checkbox, xp+10 yp+20 vColorShrouded, Shrouded 
Gui, Add, Checkbox, xp yp+25 vColorMythical, Mythical
Gui, Add, Checkbox, xp yp+25 vColorFrozen, Frozen
Gui, Add, Checkbox, xp yp+25 vColorSpirit, Spirit
Gui, Add, Checkbox, xp yp+25 vColorVined, Vined
Gui, Add, Checkbox, xp yp+25 vColorCrimson, Crimson

Gui, Add, Button, xm y+15 w80 gStartLoop Default vStartButton, P to start
Gui, Add, Button, x+10 w80 gStopLoop vStopButton Disabled, M to stop
Gui, Add, Button, x+10 w80 gExitScript, Exit
Gui, Show,, auto appraiser by rando
UpdateAreaLabel()
UpdateClickLabel()
return

StartLoop:
    if (selectionActive || running)
        return
    Gui, Submit, NoHide
    delayFirst := Max(0, Round(DelayFirst))
    delaySecond := Max(0, Round(DelaySecond))
    delayThird := Max(0, Round(DelayThird))
    movePause := Max(0, Round(MovePause))
    tolerance := Max(0, Min(255, Round(Tolerance)))
    roamRadius := Max(0, Round(RoamRadius))

    if (!clickDefined) {
        MsgBox, 48, Click Location Not Set, Please press F1 to save a click location before starting.
        return
    }

    if (!areaDefined) {
        MsgBox, 48, Area Not Set, Please select an area with F2 before starting.
        return
    }

    selected := []
    for name, color in colors {
        if (GetColorState(name))
            selected.Push({"name": name, "color": color})
    }
    if (selected.MaxIndex() = "") {
        MsgBox, 48, No Colors Selected, Please select at least one color to scan for.
        return
    }

    running := true
    GuiControl, Disable, StartButton
    GuiControl, Enable, StopButton
    SetTimer, RunCycle, -10
return

StopLoop:
    running := false
    SetTimer, RunCycle, Off
    GuiControl, Enable, StartButton
    GuiControl, Disable, StopButton
return

ExitScript:
GuiClose:
    ExitApp
return

RunCycle:
    if (!running)
        return

    Gui, Submit, NoHide
    delayFirst := Max(0, Round(DelayFirst))
    delaySecond := Max(0, Round(DelaySecond))
    delayThird := Max(0, Round(DelayThird))
    movePause := Max(0, Round(MovePause))
    tolerance := Max(0, Min(255, Round(Tolerance)))
    roamRadius := Max(0, Round(RoamRadius))

    firstX := clickX
    firstY := clickY
    MoveMouseWithRoam(firstX, firstY, movePause, roamRadius)
    Click
    Sleep, delayFirst
    MoveMouseWithRoam(firstX, firstY, movePause, roamRadius)
    Click
    Sleep, delaySecond

    centerX := areaX1 + Round((areaX2 - areaX1) / 2)
    centerY := areaY1 + Round((areaY2 - areaY1) / 2)
    MoveMouseWithRoam(centerX, centerY, movePause, roamRadius)
    Click
    Sleep, delayThird

    selected := []
    for name, color in colors {
        if (GetColorState(name))
            selected.Push({"name": name, "color": color})
    }

    if (selected.MaxIndex()) {
        foundName := ""
        for index, info in selected {
            PixelSearch, fx, fy, areaX1, areaY1, areaX2, areaY2, % info["color"], tolerance, RGB Fast
            if (!ErrorLevel) {
                foundName := info["name"]
                foundX := fx
                foundY := fy
                break
            }
        }
        if (foundName != "") {
            ToolTip, % "Found " foundName " at (" foundX ", " foundY ")"
            SetTimer, ClearToolTip, -1200
            Gosub, StopLoop
            return
        }
    }

    if (running)
        SetTimer, RunCycle, -10
return

p::
    Gosub, StartLoop
return

m::
    Gosub, StopLoop
return

ClearToolTip:
    ToolTip
return

F2::
    if (!selectionActive) {
        selectionActive := true
        selectionPhase := "waitingStart"
        selStartX := 0
        selStartY := 0
        selCurX := 0
        selCurY := 0
        selAreaX1 := 0
        selAreaY1 := 0
        selAreaX2 := 0
        selAreaY2 := 0
        SetTimer, UpdateSelectionDrag, Off
        if (selectionGuiExists)
            Gui, Selection:Destroy
        Gui, Selection:New
        Gui, Selection:Default
        Gui, +AlwaysOnTop
        Gui, -Caption
        Gui, +Border
        Gui, +ToolWindow
        Gui, +E0x20
        Gui, Color, FF6600
        Gui, +LastFound
        WinSet, Transparent, 80
        selectionGuiExists := true
        ToolTip, % "Drag with the left mouse button to set the area, then press F2 to save.", 0, 0
        SetTimer, ClearToolTip, -1500
    } else {
        if (selectionPhase = "waitingStart") {
            selectionActive := false
            selectionPhase := "idle"
            SetTimer, UpdateSelectionDrag, Off
            ToolTip
            if (selectionGuiExists)
                Gui, Selection:Destroy
            selectionGuiExists := false
            return
        }
        if (selectionPhase != "preview") {
            ToolTip, Drag with the mouse before pressing F2 again., 0, 0
            SetTimer, ClearToolTip, -1500
            return
        }
        selectionActive := false
        selectionPhase := "idle"
        SetTimer, UpdateSelectionDrag, Off
        ToolTip
        if (selectionGuiExists)
            Gui, Selection:Destroy
        selectionGuiExists := false
        areaX1 := selAreaX1
        areaY1 := selAreaY1
        areaX2 := selAreaX2
        areaY2 := selAreaY2
        areaDefined := true
        UpdateAreaLabel()
    }
return

F1::
    if (selectionActive)
        return
    MouseGetPos, clickX, clickY
    clickDefined := true
    UpdateClickLabel()
    ToolTip, % "Saved click location at (" clickX ", " clickY ")"
    SetTimer, ClearToolTip, -1200
return

~LButton::
    if (!selectionActive)
        return
    if (selectionPhase = "waitingStart" || selectionPhase = "preview") {
        selectionPhase := "dragging"
        MouseGetPos, selStartX, selStartY
        selCurX := selStartX
        selCurY := selStartY
        ShowSelectionFrame()
        SetTimer, UpdateSelectionDrag, 10
    }
return

~LButton Up::
    if (!selectionActive)
        return
    if (selectionPhase = "dragging") {
        SetTimer, UpdateSelectionDrag, Off
        MouseGetPos, selCurX, selCurY
        ShowSelectionFrame()
        selectionPhase := "preview"
    }
return

UpdateSelectionDrag:
    if (!selectionActive || selectionPhase != "dragging")
        return
    MouseGetPos, selCurX, selCurY
    ShowSelectionFrame()
return

ShowSelectionFrame() {
    global selectionActive
    global selStartX, selStartY, selCurX, selCurY
    global selAreaX1, selAreaY1, selAreaX2, selAreaY2
    if (!selectionActive)
        return
    x1 := selStartX < selCurX ? selStartX : selCurX
    y1 := selStartY < selCurY ? selStartY : selCurY
    x2 := selStartX > selCurX ? selStartX : selCurX
    y2 := selStartY > selCurY ? selStartY : selCurY
    selAreaX1 := x1
    selAreaY1 := y1
    selAreaX2 := x2
    selAreaY2 := y2
    width := (x2 - x1) + 1
    height := (y2 - y1) + 1
    if (width < 1)
        width := 1
    if (height < 1)
        height := 1
    Gui, Selection:Show, % "NA x" x1 " y" y1 " w" width " h" height
}

GetColorState(name) {
    GuiControlGet, state,, % "Color" . name
    return state
}

UpdateAreaLabel() {
    global areaDefined, areaX1, areaY1, areaX2, areaY2
    if (!areaDefined) {
        text := "Area: not selected"
    } else {
        width := (areaX2 - areaX1) + 1
        height := (areaY2 - areaY1) + 1
        text := "Area: " areaX1 "," areaY1 " to " areaX2 "," areaY2 " (" width "x" height ")"
    }
    GuiControl,, AreaLabel, %text%
}

UpdateClickLabel() {
    global clickDefined, clickX, clickY
    if (!clickDefined) {
        text := "Click location: not selected"
    } else {
        text := "Click location: " clickX "," clickY
    }
    GuiControl,, ClickLabel, %text%
}

MoveMouseWithRoam(targetX, targetY, pauseDuration, roamRadius) {
    if (pauseDuration < 0)
        pauseDuration := 0
    if (roamRadius < 0)
        roamRadius := 0
    MouseMove, %targetX%, %targetY%, 0
    if (pauseDuration <= 0) {
        return
    }
    startTime := A_TickCount
    step := 40
    while (true) {
        elapsed := A_TickCount - startTime
        remaining := pauseDuration - elapsed
        if (remaining <= 0)
            break
        if (roamRadius > 0) {
            Random, offsetX, -roamRadius, roamRadius
            Random, offsetY, -roamRadius, roamRadius
            moveX := targetX + offsetX
            moveY := targetY + offsetY
            MouseMove, %moveX%, %moveY%, 0
        }
        sleepTime := remaining < step ? remaining : step
        if (sleepTime <= 0)
            break
        Sleep, %sleepTime%
    }
    MouseMove, %targetX%, %targetY%, 0
}