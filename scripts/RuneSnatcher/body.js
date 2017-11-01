var RunePickupRadius = 150
var NoTarget = []

function SnatcherF() {
	var MyEnt = parseInt(Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()))
	if(Game.IsGamePaused() || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	
	var myVec = Entities.GetAbsOrigin(MyEnt)
	Entities.GetAllEntities().map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return NoTarget.indexOf(ent) === -1 && Entities.GetUnitName(ent) === "" && !Entities.IsBuilding(ent) && Game.PointDistance(Entities.GetAbsOrigin(ent), myVec) <= RunePickupRadius
	}).forEach(function(Rune) {
		if(Entities.IsItemPhysical(Rune))
			Game.PickupItem(MyEnt, Rune, false) // Aegis
		else
			Game.PuckupRune(MyEnt, Rune, false) // Rune
		NoTarget.push(Rune)
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