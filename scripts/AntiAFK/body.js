var feeder = false,
	enabled = false

function AntiAFKF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	if(Game.GameStateIsBefore(DOTA_GameState.DOTA_GAMERULES_STATE_PRE_GAME))
		return
	
	GameUI.SelectUnit(MyEnt, false)
	AFK(MyEnt, HEnts)

	if(enabled)
		$.Schedule(Fusion.MyTick, AntiAFKF)
}

function AFK(MyEnt, HEnts) {
	Entities.PlayersHeroEnts().filter(ent =>
		Entities.IsAlive(ent)
		&& !Entities.IsEnemy(ent)
		&& ent !== MyEnt
		&& !(
			Entities.IsBuilding(ent)
			|| Entities.IsInvulnerable(ent)
		)
	).sort((ent1, ent2) => {
		var rng1 = Entities.GetRangeToUnit(MyEnt, ent1)
		var rng2 = Entities.GetRangeToUnit(MyEnt, ent2)
		
		if(rng1 === rng2)
			return 0
		if(rng1 > rng2)
			return 1
		else
			return -1
	}).every(ent => {
		if(feeder)
			Game.MoveToAttackPos(MyEnt, Entities.GetAbsOrigin(ent), false)
		else
			Game.MoveToTarget(MyEnt, ent, false)
		
		return false
	})
}

return {
	name: "AntiAFK",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (checkbox.checked) {
			AntiAFKF()
			Game.ScriptLogMsg("Script enabled: AntiAFK", "#00ff00")
		} else 
			Game.ScriptLogMsg("Script disabled: AntiAFK", "#ff0000")
	},
	onDestroy: () => enabled = false
}