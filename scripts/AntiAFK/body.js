var feeder = true

function AntiAFKOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	if(Game.GameStateIsBefore(DOTA_GameState.DOTA_GAMERULES_STATE_PRE_GAME))
		return
	var HEnts = Game.PlayersHeroEnts()
	
	GameUI.SelectUnit(MyEnt, false)
	AFK(MyEnt, HEnts)
}

function AFK(MyEnt, HEnts) {
	HEnts = HEnts.filter(function(ent) {
		ent = parseInt(ent)
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && !Entities.IsEnemy(ent) && ent !== MyEnt
	})
	HEnts = HEnts.sort(function(ent1, ent2) {
		ent1 = parseInt(ent1)
		ent2 = parseInt(ent2)
		var rng1 = Entities.GetRangeToUnit(MyEnt, ent1)
		var rng2 = Entities.GetRangeToUnit(MyEnt, ent2)
		
		if(rng1 === rng2)
			return 0
		if(rng1 > rng2)
			return 1
		else
			return -1
	})
	
	var lastMin = parseInt(HEnts[0])
	var pos = Entities.GetAbsOrigin(lastMin)
	if(pos == undefined)
		return // otherwise it"ll walk to 0,0,0
	if(feeder)
		Game.MoveToAttackPos(MyEnt, pos, false)
	else
		Game.MoveToPos(MyEnt, pos, false)
}

function AntiAFKOnToggle() {
	if (!AntiAFK.checked) {
		Game.ScriptLogMsg("Script disabled: AntiAFK", "#ff0000")
	} else {
		function intervalFunc(){
			$.Schedule(
				Fusion.MyTick,
				function() {
					AntiAFKOnInterval()
					if(AntiAFK.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg("Script enabled: AntiAFK", "#00ff00")
	}
}

var AntiAFK = Game.AddScript("AntiAFK", AntiAFKOnToggle)