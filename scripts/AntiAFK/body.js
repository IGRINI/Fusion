var feeder = false

AntiAFKF = () => {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	if(Game.GameStateIsBefore(DOTA_GameState.DOTA_GAMERULES_STATE_PRE_GAME))
		return
	var HEnts = Entities.PlayersHeroEnts()
	
	GameUI.SelectUnit(MyEnt, false)
	AFK(MyEnt, HEnts)

	if(AntiAFK.checked)
		$.Schedule(Fusion.MyTick, AntiAFKF)
}

AFK = (MyEnt, HEnts) => {
	var lastMin = HEnts.filter(ent =>
		Entities.IsAlive(ent)
		&& !(
			Entities.IsBuilding(ent)
			|| Entities.IsInvulnerable(ent)
			 && !Entities.IsEnemy(ent)
			 && ent !== MyEnt
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
	})[0]

	if(!lastMin)
		return
	if(pos == undefined)
		return
	if(feeder)
		Game.MoveToAttackPos(MyEnt, Entities.GetAbsOrigin(lastMin), false)
	else
		Game.MoveToTarget(MyEnt, lastMin, false)
}

AntiAFKOnToggle = () => {
	if (AntiAFK.checked) {
		AntiAFKF()
		Game.ScriptLogMsg("Script enabled: AntiAFK", "#00ff00")
	} else 
		Game.ScriptLogMsg("Script disabled: AntiAFK", "#ff0000")
}

var AntiAFK = Fusion.AddScript("AntiAFK", AntiAFKOnToggle)