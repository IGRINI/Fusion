Fusion = {
	Configs: {},
	Commands: {},
	Panels: {},
	Particles: {},
	Subscribes: {},
	Scripts: {},// {onPreload, onToggle, onDestroy, name, isVisible}
	MyTick: 1 / 30,
	debug: false,
	debugLoad: false,
	debugAnimations: false,
	FusionServer: "http://localhost:4297",
	SteamID: 0
}

Fusion.AddScriptToList = script => {
	if(script.isVisible === false) // I don't want to spam with !== undefined
		return
	
	var Temp = $.CreatePanel("Panel", Fusion.Panels.MainPanel.scripts, scriptName)
	Temp.BLoadLayoutFromString(`<root>\
	<styles>\
		<include src="s2r://panorama/styles/dotastyles.vcss_c"/>\
		<include src="s2r://panorama/styles/magadan.vcss_c"/>\
	</styles>\
	<Panel>\
		<ToggleButton class="CheckBox" id="${script.name}" text="${script.name}"/>\
	</Panel>\
</root>`, false, false)

	var checkbox = Temp.Children()[0]
	Temp.SetPanelEvent("onactivate", () => script.onToggle(checkbox))
}

Fusion.ReloadFusion = () => {
	if(Fusion.Panels.MainPanel.BHasClass("PopupOpened"))
		Fusion.Panels.MainPanel.ToggleClass("PopupOpened") // hide opened popup
	Fusion.Panels.MainPanel.ToggleClass("Popup") // hide popup

	Fusion.Scripts.forEach((script, scriptName) => {
		if(script.onDestroy !== undefined)
			script.onDestroy()
		
		delete Fusion.Scripts[scriptName]
	})
	var promises = []
	JSON.parse(response).forEach(scriptName => promises.push(Fusion.GetScript(scriptName)))
	Promise.all(promises).then(scriptsCode => {
		scriptsCode.forEach(scriptCode => {
			var script = new Function(scriptCode)()
			Fusion.Scripts[script.name] = script
		})
		Fusion.LoadFusion().then(() => Fusion.ServerRequest("scriptlist").then(response => {
			Fusion.Panels.MainPanel.scripts.RemoveAndDeleteChildren()
			Fusion.Scripts.forEach(script => {
				if(typeof script !== "object")
					return
				if(script.onPreload !== undefined)
					script.onPreload()
				
				Fusion.AddScriptToList(script)
			})

			Fusion.Panels.MainPanel.ToggleClass("Popup") // unhide popup
		}))
	})
}

Fusion.ServerRequest = (name, val) => new Promise((resolve, reject) => {
	var args = {
		"type": "POST",
		"data": {
			"steamid": Fusion.SteamID
		},
		"complete": a => {
			if (a.status === 200) {
				a.responseText = a.responseText || "\n"
				resolve(a.responseText.substring(0, a.responseText.length - 1))
			} else {
				if(Fusion.debugLoad)
					var log = `Can't load \"${name}\" @ ${val}, returned ${JSON.stringify(a)}.`
				if(a.status - 400 <= 0 || a.status - 400 > 99) {
					if(Fusion.debugLoad)
						$.Msg(log + " Trying again.")
					Fusion.ServerRequest(name, val).then(resolve)
				} else {
					if(Fusion.debugLoad)
						$.Msg(log)
					reject()
				}
			}
		}
	}
	args.data[name] = val || ""
	
	$.AsyncWebRequest(Fusion.FusionServer, args)
})
Fusion.GetScript = scriptName => Fusion.ServerRequest("getscript", scriptName)
Fusion.GetXML = file => Fusion.ServerRequest("getxml", file)
Fusion.SaveConfig = (scriptName, config) => Fusion.ServerRequest("writeconfig", JSON.stringify({
	"filepath": scriptName,
	"json": JSON.stringify([config])
})).then()
Fusion.GetConfig = scriptName => new Promise((resolve, reject) =>
	Fusion.ServerRequest("getconfig", scriptName).then(json => resolve(JSON.parse(json)[0]))
)

//Panel amimating (c) moddota.com
var AnimatePanel_DEFAULT_DURATION = "300.0ms"
var AnimatePanel_DEFAULT_EASE = "linear"
Fusion.AnimatePanel = (panel, properties, duration, ease, delay) => {
	duration = duration || 0.3
	delay = delay || 0
	ease = ease || "linear"

	var transitionString = `${duration * 1000}.0ms ${ease} ${delay * 1000}.0ms`,
		finalTransition = "",
		i
	properties.forEach((property, value) => {
		finalTransition += `${i > 0 ? ", " : ""}${value} ${transitionString}`
		i++
	})
	panel.style.transition = finalTransition + ";"
	properties.forEach(property => panel.style[property] = properties[property])
}

Fusion.StatsEnabled = true
Fusion.MinimapActsEnabled = true
Fusion.HUDEnabled = true
Fusion.LoadFusion = () => new Promise((resolve, reject) => {
	if(Fusion.Panels.MainPanel !== undefined)
		Fusion.Panels.MainPanel.DeleteAsync(0)
	Fusion.Panels.MainPanel = $.CreatePanel("Panel", Fusion.Panels.Main, "DotaOverlay")
	Fusion.GetXML("init/hud").then(layout_string => {
		if(Fusion.debugLoad)
			$.Msg("HUD now are initializing...")
		
		Fusion.Panels.MainPanel.BLoadLayoutFromString(layout_string, false, false)
		Fusion.Panels.MainPanel.ToggleClass("PopupOpened")
		Fusion.Panels.MainPanel.FindChildTraverse("Reload").SetPanelEvent("onactivate", Fusion.ReloadFusion)
		Fusion.Panels.MainPanel.Slider = Fusion.Panels.MainPanel.FindChildInLayoutFile("CameraDistance")
		Fusion.Panels.MainPanel.CamDist = Fusion.Panels.MainPanel.FindChildTraverse("CamDist")
		Fusion.Panels.MainPanel.scripts = Fusion.Panels.MainPanel.FindChildTraverse("scripts")
		
		if(Fusion.debugLoad)
			$.Msg("HUD initializing finished!")

		if(Fusion.debugLoad)
			$.Msg("Calling callback (usually - load scripts)...")
		resolve()
		if(Fusion.debugLoad)
			$.Msg("Callback called successfully!")
		
		Fusion.GetConfig("init").then(config => {
			Fusion.Configs.init = config
			
			if(Fusion.debugLoad)
				$.Msg("Initializing slider...")
			
			Fusion.Panels.MainPanel.Slider.min = config.Slider.Min
			Fusion.Panels.MainPanel.Slider.max = config.Slider.Max
			Fusion.Panels.MainPanel.Slider.value = config.Slider.Value
			Fusion.Panels.MainPanel.Slider.lastValue = -1 // -1 to make sure camera distance will be changed
			Fusion.Panels.MainPanel.Slider.saved = true
			
			function OnTickSlider() {
				if(!Fusion.Panels.MainPanel.Slider.mousedown && !Fusion.Panels.MainPanel.Slider.saved) {
					Fusion.SaveConfig("init", Fusion.Configs.init)
					Fusion.Panels.MainPanel.Slider.saved = true
				}
				if (Fusion.Panels.MainPanel.Slider.lastValue != Fusion.Panels.MainPanel.Slider.value) {
					GameUI.SetCameraDistance(Fusion.Panels.MainPanel.Slider.value)
					if(Fusion.Panels.MainPanel.Slider.lastValue != -1) {
						Fusion.Configs.init.Slider.Value = Fusion.Panels.MainPanel.Slider.value
						Fusion.Panels.MainPanel.Slider.saved = false
					}
					Fusion.Panels.MainPanel.CamDist.text = `Camera distance: ${Math.floor(Fusion.Panels.MainPanel.Slider.value)}`
					Fusion.Panels.MainPanel.Slider.lastValue = Fusion.Panels.MainPanel.Slider.value
				}
				$.Schedule(Fusion.MyTick, OnTickSlider)
			}
			OnTickSlider()
			if(Fusion.debugLoad)
				$.Msg("Slider initialized!")
		})
		
		Fusion.SteamID = Game.GetLocalPlayerInfo().player_steamid // comment if you don"t wanted in logging your steamid
		Fusion.Panels.MainPanel.ToggleClass("Popup") // automatically hide popup
	})
})

if(Fusion.Panels.MainPanel !== undefined)
	Fusion.Panels.MainPanel.DeleteAsync(0)

function InstallMainHUD() {
	var globalContext = $.GetContextPanel()
	while(true)
		if(globalContext.paneltype == "DOTAHud")
			break
		else
			globalContext = globalContext.GetParent()
	Fusion.Panels.Main = globalContext
	Fusion.Panels.Main.HUDElements = Fusion.Panels.Main.FindChild("HUDElements")
}

function WaitForGameStart() {
	$.Schedule (
		Fusion.MyTick,
		function() {
			if(Players.GetLocalPlayer() !== -1) {
				InstallMainHUD()
				GameUI.SetCameraPitchMin(60)
				GameUI.SetCameraPitchMax(60)
				
				Game.AddCommand( "__ReloadFusion", Fusion.ReloadFusion, "", 0)
				Game.AddCommand("__TogglePanel", () => Fusion.Panels.MainPanel.ToggleClass("Popup"), "",0)
				Game.AddCommand("__ToggleMinimapActs", () => {
					var panel = Fusion.Panels.Main.HUDElements
					
					if(panel = panel.FindChild("minimap_container").FindChild("GlyphScanContainer"))
						if(Fusion.MinimapActsEnabled = !Fusion.MinimapActsEnabled)
								panel.style.visibility = ""
							else
								panel.style.visibility = "collapse"
				}, "",0)
				Game.AddCommand("__ToggleStats", () => {
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