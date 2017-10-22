function TimberSawWTFOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Game.PlayersHeroEnts()
	
	WhirlingDeath(MyEnt, HEnts)
}

function WhirlingDeath(MyEnt, HEnts) {
	var Abil = Game.GetAbilityByName(MyEnt, 'shredder_whirling_death')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	if(AbilLvl === 0)
		return
	
	Game.CastNoTarget(MyEnt, Abil, false)
}


function TimberSawWTF() {
	if (!TimberSawWTF.checked) {
		Game.ScriptLogMsg('Script disabled: TimberSawWTF', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule(
				Fusion.MyTick,
				function() {
					TimberSawWTFOnInterval()
					if(TimberSawWTF.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: TimberSawWTF', '#00ff00')
	}
}

var TimberSawWTF = Game.AddScript('TimberSawWTF', TimberSawWTF)