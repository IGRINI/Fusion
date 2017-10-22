var RuneRadius = 150

function SnatcherF() {
	var MyEnt = parseInt(Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()))
	if(Game.IsGamePaused() || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var myVec = Entities.GetAbsOrigin(MyEnt)
	var EntsOnCursor = GameUI.FindScreenEntities(GameUI.GetCursorPosition())
	EntsOnCursor.forEach(function(entObj) {
		var Rune = entObj.entityIndex
		var RuneName = Entities.GetUnitName(Rune)
		if(RuneName === "" && !Entities.IsBuilding(Rune) && Game.PointDistance(Entities.GetAbsOrigin(Rune), myVec) > RuneRadius) {
			Game.PuckupRune(MyEnt, Rune, false) // Rune
			Game.PickupItem(MyEnt, Rune, false) // Aegis
		}
	})
	/*Entities.GetAllEntities().map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && Game.PointDistance(Entities.GetAbsOrigin(ent), myVec) <= RuneRadius && Entities.GetUnitName(ent) === ""
	}).forEach(function(ent) {
		$.Msg(ent)
		Game.PuckupRune(MyEnt, ent, false) // Rune
		Game.PickupItem(MyEnt, ent, false) // Aegis
	})*/
}

function SnatcherToggle() {
	if (!Snatcher.checked) {
		Game.ScriptLogMsg("Script disabled: Snatcher", "#ff0000")
		return
	} else {
		function L() {
			if (Snatcher.checked) {
				SnatcherF()
				$.Schedule(Fusion.MyTick, L)
			}
		}
		L()
		Game.ScriptLogMsg("Script enabled: Snatcher", "#00ff00")
	}
}

var Snatcher = Game.AddScript("Snatcher", SnatcherToggle)