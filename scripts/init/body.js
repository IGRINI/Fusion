Fusion = {
	Configs: {},
	Commands: {},
	Panels: {},
	Particles: {},
	Subscribes: {},
	MyTick: 1 / 30,
	debug: false,
	debugLoad: false,
	debugAnimations: true,
	FusionServer: "http://localhost:4297",
	SteamID: 0
}

Fusion.ReloadFusion = () => {
	Fusion.LoadFusion(() => {
		Fusion.ServerRequest("scriptlist", "", response => {
			Fusion.Panels.MainPanel.scripts.RemoveAndDeleteChildren()
			JSON.parse(response).forEach(Fusion.LoadScript)
		})
	})
}

Fusion.LoadScript = scriptName => {
	Fusion.ServerRequest("getscript", scriptName, response => {
		eval(response)
		$.Msg(`JScript ${scriptName} loaded`)
	})
}

Fusion.ServerRequest = (name, val, callback) => {
	var args = {
		type: "POST",
		data: {},
		complete: a => {
			if (a.status === 200) {
				if(a.responseText == null)
					a.responseText = "\n"
				callback(a.responseText.substring(0, a.responseText.length - 1))
			} else {
				if(Fusion.debugLoad)
					var log = `Can't load \"${name}\" @ ${val}, returned ${JSON.stringify(a)}.`
				if(a.status - 400 <= 0 || a.status - 400 > 99) {
					if(Fusion.debugLoad)
						log += " Trying again."
					Fusion.ServerRequest(name, val, callback)
				}
			}
		}
	}
	args["data"][name] = val
	args["data"]["steamid"] = Fusion.SteamID // comment if you don"t wanted in logging your steamid
	
	$.AsyncWebRequest(Fusion.FusionServer, args)
}
	
Fusion.GetXML = (file, callback) => Fusion.ServerRequest("getxml", file, callback)

Fusion.GetConfig = (scriptName, callback) => Fusion.ServerRequest (
	"getconfig",
	scriptName,
	json => callback(JSON.parse(json)[0])
)

Fusion.SaveConfig = (scriptName, config) => Fusion.ServerRequest (
	"writeconfig",
	JSON.stringify (
		{
			"filepath": scriptName,
			"json": JSON.stringify(config)
		}
	),
	response => {
		
	}
)

Fusion.StatsEnabled = true
Fusion.MinimapActsEnabled = true
Fusion.HUDEnabled = true
Fusion.LoadFusion = callback => {
	if(Fusion.Panels.MainPanel !== undefined)
		Fusion.Panels.MainPanel.DeleteAsync(0)
	Fusion.Panels.MainPanel = $.CreatePanel("Panel", Fusion.Panels.Main, "DotaOverlay")
	Fusion.GetXML("init/hud", layout_string => {
		$.Msg("HUD now are initializing...")
		
		with(Fusion.Panels.MainPanel) {
			BLoadLayoutFromString(layout_string, false, false)
			ToggleClass("PopupOpened")
			ToggleClass("Popup")
			FindChildTraverse("Reload").SetPanelEvent("onactivate", Fusion.ReloadFusion)
			Fusion.Panels.MainPanel.Slider = FindChildInLayoutFile("CameraDistance")
			Fusion.Panels.MainPanel.CamDist = FindChildTraverse("CamDist")
			Fusion.Panels.MainPanel.scripts = FindChildTraverse("scripts")
		}
		
		$.Msg("HUD initializing finished!")
		
		Fusion.GetConfig("init", function(config) {
			Fusion.Configs.init = config
			
			$.Msg("Initializing slider...")
			
			with(Fusion.Panels.MainPanel) {
				Slider.min = config.Slider.Min
				Slider.max = config.Slider.Max
				Slider.value = config.Slider.Value
				Slider.lastValue = -1 // -1 to make sure camera distance will be changed
				Slider.saved = true
			}
			
			OnTickSlider = () => {
				with(Fusion.Panels.MainPanel) {
					if(!Slider.mousedown && !Slider.saved) {
						Fusion.SaveConfig("init", Fusion.Configs.init)
						Slider.saved = true
					}
					if (Slider.lastValue != Slider.value) {
						GameUI.SetCameraDistance(Slider.value)
						if(Slider.lastValue != -1) {
							Fusion.Configs.init.Slider.Value = Slider.value
							Slider.saved = false
						}
						CamDist.text = `Camera distance: ${Math.floor(Slider.value)}`
						Slider.lastValue = Slider.value
					}
				}
				$.Schedule(Fusion.MyTick, OnTickSlider)
			}
			OnTickSlider()
			$.Msg("Slider initialized!")
		})
		
		
		Fusion.SteamID = Game.GetLocalPlayerInfo().player_steamid
		Fusion.Panels.MainPanel.ToggleClass("Popup")
		if(callback !== undefined)
			callback()
	})
}

if(Fusion.Panels.MainPanel !== undefined)
	Fusion.Panels.MainPanel.DeleteAsync(0)

InstallMainHUD = () => {
	var globalContext = $.GetContextPanel()
	while(true)
		if(globalContext.paneltype == "DOTAHud")
			break
		else
			globalContext = globalContext.GetParent()
	Fusion.Panels.Main = globalContext
	Fusion.Panels.Main.HUDElements = Fusion.Panels.Main.FindChild("HUDElements")
}

WaitForGameStart = () => {
	$.Schedule (
		Fusion.MyTick,
		function() {
			if(Players.GetLocalPlayer() !== -1) {
				InstallMainHUD()
				GameUI.SetCameraPitchMin(60)
				GameUI.SetCameraPitchMax(60)
				
				Game.AddCommand( "__ReloadFusion", Fusion.ReloadFusion, "", 0)
				Game.AddCommand("__TogglePanel", function() {
					Fusion.Panels.MainPanel.ToggleClass("Popup")
				}, "",0)
				Game.AddCommand("__ToggleMinimapActs", function() {
					var panel = Fusion.Panels.Main.HUDElements
					
					if(panel = panel.FindChild("minimap_container").FindChild("GlyphScanContainer"))
						if(Fusion.MinimapActsEnabled = !Fusion.MinimapActsEnabled)
								panel.style.visibility = ""
							else
								panel.style.visibility = "collapse"
				}, "",0)
				Game.AddCommand("__ToggleStats", function() {
					var panel = Fusion.Panels.Main.HUDElements
					
					if(panel = panel.FindChild("quickstats"))
						if(Fusion.StatsEnabled = !Fusion.StatsEnabled)
							panel.style.visibility = ""
						else
							panel.style.visibility = "collapse"
				}, "",0)
				
				Fusion.ReloadFusion()
			} else
				WaitForGameStart()
		}
	)
}

WaitForGameStart()