var RuneRadius = 150

function SnatcherF() {
	var MyEnt = parseInt(Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()))
	if(Game.IsGamePaused() || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var myVec = Entities.GetAbsOrigin(MyEnt)
	GameUI.FindScreenEntities(GameUI.GetCursorPosition()).forEach(function(entObj) {
		var Rune = entObj.entityIndex
		var RuneName = Entities.GetUnitName(Rune)
		if(RuneName === "" && !Entities.IsBuilding(Rune) && Game.PointDistance(Entities.GetAbsOrigin(Rune), myVec) <= RuneRadius) {
			Game.PuckupRune(MyEnt, Rune, false) // Rune
			Game.PickupItem(MyEnt, Rune, false) // Aegis
		}
	})

	if (Snatcher.checked)
		$.Schedule(Fusion.MyTick, SnatcherF)
}

function SnatcherToggle() {
	if(Snatcher.checked) {
		SnatcherF()
		Game.ScriptLogMsg("Script enabled: Snatcher", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: Snatcher", "#ff0000")
}

var Snatcher = Game.AddScript("Snatcher", SnatcherToggle)