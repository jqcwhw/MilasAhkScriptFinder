#Requires AutoHotkey v2.0

OnExit(OnExit_Function)

global speed := 40
global BetweenHatchSpeed := 50

global Colorcheck := 121215



; ========== GLOBAL DATA ==========
Global MyGui := Gui()

Global coordButtonList := [
    {label: "Auto Hatch Settings", varPrefix: "AutoHatchSettings", description: "Please press the Auto Hatch Settings Button."},
    {label: "Auto Hatch X", varPrefix: "AutoHatchX", description: "Please click the X Coord for Auto Hatch (The X to Close Button)."},
    {label: "Auto Hatch ON", varPrefix: "AutoHatchON", description: "Please click the Auto Hatch Toggle Button."},
    {label: "Egg E Button", varPrefix: "EggEButton", description: "Please press the Egg E key location."},
    {label: "Open Egg Button", varPrefix: "HatchEButton", description: "Please press the Hatch location (How many eggs to open location)."},
    {label: "Friends Bar", varPrefix: "FriendsBar", description: "Please press the black area of the Friends Bar."}
]

Global buttonMap := Map()
for _, item in coordButtonList {
    buttonMap[item.label] := item.varPrefix
}

Global titlesArray := ["Roblox"] ; For WinActivate()

; ========== GUI CREATION ==========

yPos := 20 ; Starting Y position
for _, data in coordButtonList {
    MyGui.Add("Button", "x20 y" yPos " w150 h25", data.label)
        .OnEvent("Click", SaveCoordinates)
    MyGui.Add("Edit", "x180 y" yPos " w60 h25 v" data.varPrefix "X")
    MyGui.Add("Edit", "x250 y" yPos " w60 h25 v" data.varPrefix "Y")
    yPos += 35
}

yPos += 30


MyGui.SetFont("S12")
StartBut := MyGui.Add("Button", "x100 y" yPos " w120 h30", "Start Macro")
StartBut.OnEvent("Click", Start_Macro)
yPos += 40 
	LoadFromINI()

; ========== SHOW GUI ==========
MyGui.OnEvent("Close", MyGui_Close)
MyGui.Show("w350 h" yPos)

; ========== COORD SAVE FUNCTION ==========

SaveCoordinates(btn, info)
{
    global buttonMap, coordButtonList, MyGui, titlesArray

    WinActivate(titlesArray[1])  ; Activate the game/client window

    buttonText := btn.Text

    if !buttonMap.Has(buttonText) {
        MsgBox("Unknown selection.")
        return
    }

    id := buttonMap[buttonText]

    ; Find and show the instruction text from coordButtonList
    for _, item in coordButtonList {
        if item.label = buttonText {
            MsgBox(item.description)
            break
        }
    }

    ; Wait for mouse click
    While !GetKeyState("LButton", "P")
        Sleep(10)

    MouseGetPos(&ClickX, &ClickY, &hWnd)

    xVar := id "X"
    yVar := id "Y"

    ; Update GUI with coordinates
    MyGui[xVar].Text := ClickX
    MyGui[yVar].Text := ClickY

    MsgBox("Coordinates saved for '" id "': X = " ClickX ", Y = " ClickY)

	MyGui.Show()	
}




GetGuiCoords()
{
global MyGui
ClientcheckposX := MyGui["FriendsBarX"]
ClientcheckposY := MyGui["FriendsBarY"]

hatchbutton := [MyGui["AutoHatchSettingsX"].text, MyGui["AutoHatchSettingsY"].text]
autohatchpos := [MyGui["AutoHatchONX"].text, MyGui["AutoHatchONY"].text]
Xbuttonpos := [MyGui["AutoHatchXX"].text, MyGui["AutoHatchXY"].text]

EggEButtonPos := [MyGui["EggEButtonX"].text, MyGui["EggEButtonY"].text]
HatchEButtonPos := [MyGui["HatchEButtonX"].text, MyGui["HatchEButtonY"].text]


}


Main_Loop()
{
for hwnd in WinGetList("ahk_exe RobloxPlayerBeta.exe") {
    pid := WinGetPID(hwnd)
}

WinActivate("ahk_pid " pid)
Loop {

		color := PixelGetColor(MyGui["FriendsBarX"].text, MyGui["FriendsBarY"].text)

	if (color = 0x121215)
	{
	SendEvent("{Tab}")				
	sleep 200
		SendEvent("{Click "  MyGui["AutoHatchSettingsX"].text " "  MyGui["AutoHatchSettingsY"].text " 1}")
	sleep 200
		SendEvent("{Click "  MyGui["AutoHatchONX"].text " " MyGui["AutoHatchONY"].text " 1}")
	sleep 200
		SendEvent("{Click "  MyGui["AutoHatchXX"].text " " MyGui["AutoHatchXY"].text " 1}")
	}



	SendEvent("{Click "  MyGui["EggEButtonX"].text  " " MyGui["EggEButtonY"].text " 0}")
	sleep 10
	SendEvent("{Click "  MyGui["EggEButtonX"].text + 5  " " MyGui["EggEButtonY"].text " 1}")
    Sleep speed
	
	SendEvent("{Click "  MyGui["HatchEButtonX"].text " " MyGui["HatchEButtonY"].text " 0}")
	sleep 10
	SendEvent("{Click "  MyGui["HatchEButtonX"].text + 5 " " MyGui["HatchEButtonY"].text " 1}")

    Sleep BetweenHatchSpeed
	
}

}




SaveToINI() {
    global coordButtonList, MyGui
    iniFile := "Settings.ini"

    for _, item in coordButtonList {
        xKey := item.varPrefix "X"
        yKey := item.varPrefix "Y"
        xVal := MyGui[xKey].Value
        yVal := MyGui[yKey].Value

        ; Write to the [Coords] section of the INI file
        IniWrite(xVal, iniFile, "Coords", xKey)
        IniWrite(yVal, iniFile, "Coords", yKey)
    }

}


LoadFromINI() {
    global coordButtonList, MyGui
    iniFile := "Settings.ini"

    for _, item in coordButtonList {
        xKey := item.varPrefix "X"
        yKey := item.varPrefix "Y"

        xVal := IniRead(iniFile, "Coords", xKey, "0")
        yVal := IniRead(iniFile, "Coords", yKey, "0")

        MyGui[xKey].Value := xVal
        MyGui[yKey].Value := yVal
    }
}







Start_Macro(btn, info)
{
   StartBut.Text := "Macro Running"
Main_Loop()


}

MyGui_Close(MyGui) 
{  
    if MsgBox("Are you sure you want to close the GUI?",, "y/n") = "No"
        return true  
		else
		{

			SaveToINI()
		ExitApp
		}
}


OnExit_Function(*)
{

		SaveToINI()
}


^x::ExitApp 
