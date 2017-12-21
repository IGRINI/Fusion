var feeder = false,
	enabled = false

function AntiAFKF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	if(Game.GameStateIsBefore(DOTA_GameState.DOTA_GAMERULES_STATE_PRE_GAME))
		return
	
	GameUI.SelectUnit(MyEnt, false)
	AFK(MyEnt)

	if(enabled)
		$.Schedule(Fusion.MyTick, AntiAFKF)
}

function AFK(MyEnt) {
	Array.prototype.orderBy.call(Entities.PlayersHeroEnts().filter(ent =>
		ent !== MyEnt
		&& Entities.IsAlive(ent)
		&& !Entities.IsEnemy(ent)
		&& !Entities.IsBuilding(ent)
	), ent => Entities.GetRangeToUnit(ent, MyEnt)).every(ent => {
		if(feeder)
			Game.MoveToAttackPos(MyEnt, Entities.GetAbsOrigin(ent), false)
		else
			Game.MoveToTarget(MyEnt, ent, false)
		
		return false
	})
}

script = {
	name: "AntiAFK",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if(enabled) {
			AntiAFKF()
			Game.ScriptLogMsg("Script enabled: AntiAFK", "#00ff00")
		} else 
			Game.ScriptLogMsg("Script disabled: AntiAFK", "#ff0000")
	},
	onDestroy: () => enabled = false
}