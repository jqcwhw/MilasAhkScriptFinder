#SingleInstance Force
#NoEnv
SetWorkingDir %A_ScriptDir%
SendMode Input
SetBatchLines -1

;PS99 Simple Clan Tracker Overlay
;
;This is a simplified version that should be more stable 
;and work with your farm_buyer executables
;
;Controls:
;F5 - Toggle overlay visibility
;F7 - Set competition end time
;F8 - Set target weight
;Esc - Exit overlay only (farm buyer will continue running)

;Global variables
global ClanTrackerVisible := true         ; Whether clan tracker is visible
global ClanUpdateInterval := 300000       ; Update clan data every 5 minutes (300,000 ms)
global LastClanUpdateTime := 0            ; Last clan data update time
global TargetWeight := 3200               ; Target weight in kg (3000-3500 range)

;Clan competition data - Will be updated with real API data
global ClanData := []
ClanData.Push({name: "UN0 Clan", points: 15750000, rank: 1})
ClanData.Push({name: "BOSS Clan", points: 12450000, rank: 2})
ClanData.Push({name: "EGG MASTERS", points: 10850000, rank: 3})
ClanData.Push({name: "Egg Farmers", points: 8950000, rank: 4})
ClanData.Push({name: "PS99 PROs", points: 7750000, rank: 5})

;Competition end time - Update this!
global CompetitionEndTime := []
CompetitionEndTime.Push(2025)    ; Year
CompetitionEndTime.Push(5)       ; Month
CompetitionEndTime.Push(29)      ; Day
CompetitionEndTime.Push(23)      ; Hour
CompetitionEndTime.Push(59)      ; Minute
CompetitionEndTime.Push(0)       ; Second

;Create Clan Tracker overlay
Gui, Clan:New, +AlwaysOnTop +ToolWindow
Gui, Clan:Color, 0x1A1A1A          ; Dark background
Gui, Clan:+LastFound
WinSet, Transparent, 225           ; Slight transparency
Gui, Clan:Font, s12 cFFD700, Segoe UI
Gui, Clan:Add, Text, Center w300, PS99 CLAN COMPETITION

Gui, Clan:Font, s10 c7dcfff        ; Blue for time
Gui, Clan:Add, Text, vCompTimeText w300, Time Remaining: Calculating...

Gui, Clan:Font, s10 c9ece6a        ; Green for first place
Gui, Clan:Add, Text, vFirstPlace w300, 1st Place: Loading...

Gui, Clan:Font, s8 cWhite
Gui, Clan:Add, Text, vFirstPlaceLead w300 x20, Leading by: -

Gui, Clan:Font, s10 ce0af68        ; Orange for second place
Gui, Clan:Add, Text, vSecondPlace w300 x10, 2nd Place: Loading...

Gui, Clan:Font, s8 cWhite
Gui, Clan:Add, Text, vSecondPlaceGap w300 x20, Points needed to reach 1st: -

Gui, Clan:Font, s10 cbb9af7        ; Purple for third place
Gui, Clan:Add, Text, vThirdPlace w300 x10, 3rd Place: Loading...

Gui, Clan:Font, s8 cWhite
Gui, Clan:Add, Text, vThirdPlaceGap w300 x20, Points to reach: 2nd: - | 1st: -

;Add weight enhancement section
Gui, Clan:Font, s9 cLime
Gui, Clan:Add, Text, w300 x10, Weight Enhancement:
Gui, Clan:Font, s8 cWhite
Gui, Clan:Add, Text, vWeightText w300 x20, Target Weight: 3200kg

Gui, Clan:Font, s7 cGray
Gui, Clan:Add, Text, vLastUpdateText Right w300, Last update: Never

Gui, Clan:Font, s7 cWhite
Gui, Clan:Add, Text, Center w300, F5: Toggle | F7: Set End Time | F8: Weight | Esc: Exit

;Make the clan tracker draggable
Gui, Clan:+LastFound
WinSet, Style, -0xC00000   ; Remove title bar
OnMessage(0x201, "WM_LBUTTONDOWN")  ; Handle mouse down for dragging

;Show clan tracker in top-right corner
Gui, Clan:Show, x1050 y50 w320 h270, PS99 Clan Tracker

;Display a welcome message
MsgBox, 64, PS99 Clan Tracker, Clan Tracker is now running!`n`nHotkeys:`n- F5: Toggle visibility`n- F7: Set competition end time`n- F8: Set target weight`n- Esc: Close overlay

;Set hotkeys
F5::ToggleClanTracker()
F7::SetCompetitionEndTime()
F8::ShowWeightSettings()
Esc::ExitApp

;Set timers
SetTimer, UpdateUI, 3000, On

;Allow dragging the clan tracker window
WM_LBUTTONDOWN(wParam, lParam, msg, hwnd) {
    if (hwnd = WinExist("PS99 Clan Tracker")) {
        PostMessage, 0xA1, 2, 0  ; Move window
        return 0
    }
}

;Toggle clan tracker visibility
ToggleClanTracker() {
    global ClanTrackerVisible
    
    ClanTrackerVisible := !ClanTrackerVisible
    
    if (ClanTrackerVisible)
        Gui, Clan:Show, NoActivate
    else
        Gui, Clan:Hide
}

;Show weight enhancement settings
ShowWeightSettings() {
    global TargetWeight
    
    Gui, Weight:New, +AlwaysOnTop
    Gui, Weight:Color, 0x1A1A1A
    Gui, Weight:Font, s12 cFFD700, Segoe UI
    Gui, Weight:Add, Text, Center w300, WEIGHT ENHANCEMENT

    Gui, Weight:Font, s10 cWhite
    Gui, Weight:Add, Text,, Target Weight (kg):
    Gui, Weight:Add, Edit, vNewWeight w100, %TargetWeight%

    Gui, Weight:Font, s9 cLime
    Gui, Weight:Add, Text,, Recommended: 3000-3500kg for Angelus eggs

    Gui, Weight:Add, Button, Default gSaveWeight, Save
    Gui, Weight:Add, Button, x+10 gCancelWeight, Cancel

    Gui, Weight:Show,, Weight Enhancement
    return
    
    SaveWeight:
        Gui, Weight:Submit
        
        ;Update weight setting
        if NewWeight is integer
        {
            if (NewWeight >= 1000 && NewWeight <= 5000)
                TargetWeight := NewWeight
        }
        
        ;Update display
        GuiControl, Clan:, WeightText, % "Target Weight: " . TargetWeight . "kg"
        Gui, Weight:Destroy
        
        ;Record enhancement in log file
        FormatTime, timeStamp,, yyyy-MM-dd HH:mm:ss
        FileAppend, % timeStamp . " - Set target weight to " . TargetWeight . "kg`n", PS99_Weight_Enhancement.log
        
        return
        
    CancelWeight:
        Gui, Weight:Destroy
        return
}

;Set competition end time
SetCompetitionEndTime() {
    global CompetitionEndTime
    
    Gui, EndTime:New, +AlwaysOnTop
    Gui, EndTime:Color, 0x1A1A1A
    Gui, EndTime:Font, s10 cWhite, Segoe UI
    
    Gui, EndTime:Add, Text,, Set Competition End Time:
    
    Gui, EndTime:Add, Text,, Year:
    Gui, EndTime:Add, Edit, vNewYear w100, % CompetitionEndTime[1]
    
    Gui, EndTime:Add, Text,, Month (1-12):
    Gui, EndTime:Add, Edit, vNewMonth w100, % CompetitionEndTime[2]
    
    Gui, EndTime:Add, Text,, Day (1-31):
    Gui, EndTime:Add, Edit, vNewDay w100, % CompetitionEndTime[3]
    
    Gui, EndTime:Add, Text,, Hour (0-23):
    Gui, EndTime:Add, Edit, vNewHour w100, % CompetitionEndTime[4]
    
    Gui, EndTime:Add, Text,, Minute (0-59):
    Gui, EndTime:Add, Edit, vNewMinute w100, % CompetitionEndTime[5]
    
    Gui, EndTime:Add, Button, Default gSaveEndTime, Save
    Gui, EndTime:Add, Button, x+10 gAdd1Day, +1 Day
    Gui, EndTime:Add, Button, x+10 gAdd7Days, +7 Days
    Gui, EndTime:Add, Button, xm y+10 gCancelEndTime, Cancel
    
    Gui, EndTime:Show,, Competition End Time
    return
    
    SaveEndTime:
        Gui, EndTime:Submit
        
        ;Update competition end time
        CompetitionEndTime[1] := NewYear
        CompetitionEndTime[2] := NewMonth
        CompetitionEndTime[3] := NewDay
        CompetitionEndTime[4] := NewHour
        CompetitionEndTime[5] := NewMinute
        
        UpdateTimeRemaining()
        Gui, EndTime:Destroy
        return
        
    Add1Day:
        Gui, EndTime:Submit, NoHide
        
        ;Add 1 day to current date
        date := NewYear . NewMonth . NewDay
        EnvAdd, date, 1, Days
        
        ;Parse updated date
        year := SubStr(date, 1, 4)
        month := SubStr(date, 5, 2)
        day := SubStr(date, 7, 2)
        
        ;Update fields
        GuiControl, EndTime:, NewYear, %year%
        GuiControl, EndTime:, NewMonth, %month%
        GuiControl, EndTime:, NewDay, %day%
        return
        
    Add7Days:
        Gui, EndTime:Submit, NoHide
        
        ;Add 7 days to current date
        date := NewYear . NewMonth . NewDay
        EnvAdd, date, 7, Days
        
        ;Parse updated date
        year := SubStr(date, 1, 4)
        month := SubStr(date, 5, 2)
        day := SubStr(date, 7, 2)
        
        ;Update fields
        GuiControl, EndTime:, NewYear, %year%
        GuiControl, EndTime:, NewMonth, %month%
        GuiControl, EndTime:, NewDay, %day%
        return
        
    CancelEndTime:
        Gui, EndTime:Destroy
        return
}

;Main UI update timer function
UpdateUI:
    UpdateClanData()
    UpdateTimeRemaining()
    
    ;Update last update timestamp
    FormatTime, currentTime,, HH:mm:ss
    GuiControl, Clan:, LastUpdateText, Last update: %currentTime%
return

;Update clan data - in production would use Roblox API
UpdateClanData() {
    global ClanData
    
    ;In production, this would use Roblox API to fetch real clan data
    ;For now, we'll simulate changes to clan points for demonstration
    
    ;Simulate clan point changes
    Random, variation1, -50000, 75000
    Random, variation2, -40000, 60000
    Random, variation3, -30000, 50000
    Random, variation4, -25000, 40000
    Random, variation5, -20000, 30000
    
    ;Apply variations to clan points
    ClanData[1].points += variation1
    ClanData[2].points += variation2
    ClanData[3].points += variation3
    ClanData[4].points += variation4
    ClanData[5].points += variation5
    
    ;Re-sort clans by points
    SortClanData()
    
    ;Update clan display
    UpdateClanDisplay()
}

;Sort clan data by points
SortClanData() {
    global ClanData
    
    ;Sort clans by points (descending)
    n := ClanData.Length()
    Loop, % n-1 {
        i := A_Index
        Loop, % n-i {
            j := A_Index
            
            ;Compare points and swap if needed
            if (ClanData[j].points < ClanData[j+1].points) {
                ;Swap clans
                temp := ClanData[j]
                ClanData[j] := ClanData[j+1]
                ClanData[j+1] := temp
            }
        }
    }
    
    ;Update ranks
    Loop, % ClanData.Length() {
        ClanData[A_Index].rank := A_Index
    }
}

;Update clan competition display
UpdateClanDisplay() {
    global ClanData
    
    ;Get top 3 clans
    first := ClanData[1]
    second := ClanData[2]
    third := ClanData[3]
    
    ;Format point values for display
    first_points := FormatPoints(first.points)
    second_points := FormatPoints(second.points)
    third_points := FormatPoints(third.points)
    
    ;Calculate point differences
    lead_1_to_2 := first.points - second.points
    gap_2_to_1 := lead_1_to_2  ; Same value, different perspective
    gap_3_to_2 := second.points - third.points
    gap_3_to_1 := first.points - third.points
    
    ;Format differences for display
    lead_1_to_2_fmt := FormatPoints(lead_1_to_2)
    gap_2_to_1_fmt := FormatPoints(gap_2_to_1)
    gap_3_to_2_fmt := FormatPoints(gap_3_to_2)
    gap_3_to_1_fmt := FormatPoints(gap_3_to_1)
    
    ;Update clan display
    GuiControl, Clan:, FirstPlace, % "1st Place: " . first.name . " - " . first_points
    GuiControl, Clan:, FirstPlaceLead, % "Leading by: " . lead_1_to_2_fmt
    
    GuiControl, Clan:, SecondPlace, % "2nd Place: " . second.name . " - " . second_points
    GuiControl, Clan:, SecondPlaceGap, % "Points needed to reach 1st: " . gap_2_to_1_fmt
    
    GuiControl, Clan:, ThirdPlace, % "3rd Place: " . third.name . " - " . third_points
    GuiControl, Clan:, ThirdPlaceGap, % "Points to reach: 2nd: " . gap_3_to_2_fmt . " | 1st: " . gap_3_to_1_fmt
}

;Update competition time remaining
UpdateTimeRemaining() {
    global CompetitionEndTime
    
    ;Get current date/time
    FormatTime, currentYear,, yyyy
    FormatTime, currentMonth,, MM
    FormatTime, currentDay,, dd
    FormatTime, currentHour,, HH
    FormatTime, currentMinute,, mm
    FormatTime, currentSecond,, ss
    
    ;Calculate total seconds for comparison
    currentTotalSeconds := (currentYear * 31536000) + (currentMonth * 2592000) + (currentDay * 86400) + (currentHour * 3600) + (currentMinute * 60) + currentSecond
    endTotalSeconds := (CompetitionEndTime[1] * 31536000) + (CompetitionEndTime[2] * 2592000) + (CompetitionEndTime[3] * 86400) + (CompetitionEndTime[4] * 3600) + (CompetitionEndTime[5] * 60) + CompetitionEndTime[6]
    
    ;Calculate difference
    secondsRemaining := endTotalSeconds - currentTotalSeconds
    
    ;Check if competition has ended
    if (secondsRemaining <= 0) {
        GuiControl, Clan:, CompTimeText, Competition has ended!
        return
    }
    
    ;Calculate days, hours, minutes, seconds
    daysRemaining := Floor(secondsRemaining / 86400)
    hoursRemaining := Floor(Mod(secondsRemaining, 86400) / 3600)
    minutesRemaining := Floor(Mod(secondsRemaining, 3600) / 60)
    secondsRemaining := Floor(Mod(secondsRemaining, 60))
    
    ;Format time remaining based on how much time is left
    if (daysRemaining > 1) {
        timeRemainingText := "Time Remaining: " . daysRemaining . " days, " . hoursRemaining . " hours"
    } else if (daysRemaining == 1) {
        timeRemainingText := "Time Remaining: 1 day, " . hoursRemaining . " hours"
    } else if (hoursRemaining > 0) {
        timeRemainingText := "Time Remaining: " . hoursRemaining . " hours, " . minutesRemaining . " minutes"
    } else {
        timeRemainingText := "Time Remaining: " . minutesRemaining . " minutes, " . secondsRemaining . " seconds"
    }
    
    ;Update display
    GuiControl, Clan:, CompTimeText, %timeRemainingText%
}

;Format points for clan display
FormatPoints(points) {
    if (points >= 1000000)
        return Round(points / 1000000, 2) . "M"
    else if (points >= 1000)
        return Round(points / 1000, 1) . "K"
    else
        return points
}