Fusion = {
	Configs: {},
	Commands: {},
	Panels: {},
	Particles: {},
	Subscribes: {},
	Scripts: new Map(),// {onPreload, onToggle, onDestroy, name, isVisible}
	MyTick: 1 / 30,
	debug: false,
	debugLoad: false,
	debugAnimations: false,
	FusionServer: "http://localhost:4297",
	SteamID: 0
}

Object.defineProperty(Array.prototype, "randomElement", {
	enumerable: false,
	value: function() {
		return this[Math.round(this.length * Math.random())]
	}
})
Object.defineProperty(Array.prototype, "remove", { // remove value from array without creating new array
	enumerable: false,
	value: function(obj) {
		var i = this.indexOf(obj)
		if(i >= 0)
			this.splice(i, 1)
	}
})

if (!String.prototype.repeat) { // FIXME: remove in native, as anyway there'll be ES6 support
	Object.defineProperty(String.prototype, "repeat", {
		enumerable: false,
		value: function() {
			if (this == null)
				throw new TypeError(`Can't convert ${this} to object`);
			var str = '' + this;
			count = +count;
			if (count != count)
				count = 0;
			if (count < 0)
				throw new RangeError("Repeat count must be non-negative");
			if (count == Infinity)
				throw new RangeError("Repeat count must be less than infinity");
			count = Math.floor(count);
			if (str.length == 0 || count == 0)
				return "";
			if (str.length * count >= 1 << 28)
				throw new RangeError("Repeat count must not overflow maximum string size");
			var rpt = "";
			for (;;) {
				if ((count & 1) == 1)
					rpt += str;
				count >>>= 1;
				if (count == 0)
					break
				str += str;
			}
			return rpt;
		}
	})
}

Fusion.AddScriptToList = script => {
	if(script.isVisible === false) // I don't want to spam with !== undefined
		return
	
	var Temp = $.CreatePanel("Panel", Fusion.Panels.MainPanel.scripts, script.name)
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

Game.ScriptLogMsg = (msg, color) => {
	var ScriptLog = Fusion.Panels.MainPanel.FindChildTraverse("ScriptLog")
	var ScriptLogMessage = $.CreatePanel( "Label", ScriptLog, "ScriptLogMessage" )
	ScriptLogMessage.BLoadLayoutFromString("\
<root>\
	<Label/>\
</root>", false, false)
	ScriptLogMessage.style.fontSize = "15px"
	var text = `	•••	${msg}`
	ScriptLogMessage.text = text
	if (color) {
		ScriptLogMessage.style.color = color
		ScriptLogMessage.style.textShadow = `0px 0px 4px 1.2 ${color}33`
	}
	ScriptLogMessage.DeleteAsync(7)
	Fusion.AnimatePanel(ScriptLogMessage, [["opacity", "0;"]], 2, "linear", 4)
}

Fusion.ReloadFusion = () => {
	Fusion.Scripts.forEach((script, scriptName) => {
		if(script.onDestroy)
			script.onDestroy()
		
		Fusion.Scripts.delete(scriptName)
	})

	if(Fusion.Panels.MainPanel) {
		Fusion.Panels.MainPanel.DeleteAsync(0) // it'll be reinitialized by Fusion.LoadFusion()
		delete Fusion.Panels.MainPanel
	}

	Fusion.ServerRequest("scriptlist").then(response =>
		Promise.all(JSON.parse(response).map(Fusion.GetScript)).then(scriptsCode => {
			scriptsCode.forEach(scriptCode => { // works like a scriptsCode.forEach(requireFromString)
				try {
					var script
					eval(scriptCode)
					if(script)
						Fusion.Scripts.set(script.name, script)
				} catch(e) {
					$.Msg("error @ Fusion.ReloadFusion @ scriptsCode.forEach");
					$.Msg(scriptCode);
					$.Msg(e);
				}
			})
			Fusion.LoadFusion().then(() => {
				Fusion.Scripts.forEach(script => {
					if(script.onPreload !== undefined)
						script.onPreload()
					
					Fusion.AddScriptToList(script)
				})

				Fusion.Panels.MainPanel.visible = true // unhide popup
			})
		}).catch(err => {
			$.Msg("error @ Fusion.ReloadFusion");
			$.Msg(err);
		})
	)
}

Fusion.ServerRequest = (name, val) => new Promise((resolve, reject) => {
	var args = {
		type: "POST",
		data: {
			steamid: Fusion.SteamID
		},
		success: resolve,
		error: response => {
			if(Fusion.debugLoad)
				var log = `Can't load \"${name}\" @ ${val}, returned ${JSON.stringify(response)}.`
			if(response.status !== 403) {
				if(Fusion.debugLoad)
					$.Msg(log + " Trying again.")
				
				$.AsyncWebRequest(Fusion.FusionServer, args)
			} else {
				if(Fusion.debugLoad)
					$.Msg(log)
				//reject();
				resolve(""); // otherwise Promise.all will fail..
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
}))
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
		isFirst = true
	properties.forEach(([key, value]) => {
		finalTransition += `${!isFirst ? ", " : ""}${key}=${value} ${transitionString}`
		if(isFirst)
			isFirst = false
	})
	panel.style.transition = finalTransition + ";"
}

Fusion.LoadFusion = () => new Promise((resolve, reject) => {
	if(Fusion.Panels.MainPanel) {
		Fusion.Panels.MainPanel.DeleteAsync(0)
		delete Fusion.Panels.MainPanel
	}

	Fusion.Panels.MainPanel = $.CreatePanel("Panel", Fusion.Panels.Main, "DotaOverlay")
	Fusion.GetXML("init/hud").then(layout_string => {
		if(Fusion.debugLoad)
			$.Msg("HUD now are initializing...")
		
		Fusion.Panels.MainPanel.BLoadLayoutFromString(layout_string, false, false)
		Fusion.Panels.MainPanel.visible = false // automatically hide popup
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
				if(!Fusion.Panels.MainPanel || !Fusion.Panels.MainPanel.Slider || Fusion.Panels.MainPanel.Slider.value === 0) {
					$.Schedule(Fusion.MyTick, OnTickSlider)
					return
				}
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
	})
})

if(Fusion.Panels.MainPanel !== undefined)
	Fusion.Panels.MainPanel.DeleteAsync(0)

function InstallMainHUD() {
	var globalContext = $.GetContextPanel()
	while(globalContext.paneltype !== "DOTAHud")
		globalContext = globalContext.GetParent()
	Fusion.Panels.Main = globalContext
	Fusion.Panels.Main.HUDElements = Fusion.Panels.Main.FindChild("HUDElements")
}

Fusion.StatsEnabled = true
Fusion.MinimapActsEnabled = true
function WaitForGameStart() {
	$.Schedule (
		Fusion.MyTick,
		function() {
			if(Players.GetLocalPlayer() !== -1) {
				Fusion.SteamID = Game.GetLocalPlayerInfo().player_steamid // comment if you don"t wanted in logging your steamid
				InstallMainHUD()
				GameUI.SetCameraPitchMin(60)
				GameUI.SetCameraPitchMax(60)
				
				Game.AddCommand( "__ReloadFusion", Fusion.ReloadFusion, "", 0)
				Game.AddCommand("__TogglePanel", () => Fusion.Panels.MainPanel.visible = !Fusion.Panels.MainPanel.visible, "",0)
				Game.AddCommand('__eval', (name, code) => $.Msg(eval(code)), '', 0)
				Game.AddCommand("__ToggleMinimapActs", () => Fusion.Panels.Main.HUDElements.FindChildTraverse("GlyphScanContainer").visible = Fusion.MinimapActsEnabled = !Fusion.MinimapActsEnabled, "",0)
				Game.AddCommand("__ToggleStats", () => Fusion.Panels.Main.HUDElements.FindChildTraverse("quickstats").visible = Fusion.StatsEnabled = !Fusion.StatsEnabled, "",0)
				
				Fusion.ReloadFusion()
			} else
				WaitForGameStart()
		}
	)
}

WaitForGameStart()