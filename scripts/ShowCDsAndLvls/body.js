function ShowCDsAndLvlsF() {
	if(!ShowCDsAndLvls.checked)
		return
	
	
	
	$.Schedule(Fusion.MyTick, ShowCDsAndLvlsF)
}

function ShowCooldownsToggle() {
	if (!ShowCDsAndLvls.checked)
		Game.ScriptLogMsg("Script disabled: Show Cooldowns And Levels", "#ff0000")
	else {
		Game.ScriptLogMsg("Script enabled: Show Cooldowns And Levels", "#00ff00")
		ShowCDsAndLvlsF()
	}
}

var ShowCDsAndLvls = Game.AddScript("ShowCDsAndLvls", ShowCooldownsToggle)
ShowCDsAndLvlsF(Fusion.MyTick)