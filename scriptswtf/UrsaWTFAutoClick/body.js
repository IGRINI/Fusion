function UrsaWTFAutoClickOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Game.PlayersHeroEnts()
	
	AutoClick(MyEnt, HEnts)
}

function AutoClick(MyEnt, HEnts) {
	AutoOverPower(MyEnt)
	AutoEnrage(MyEnt)
}

function AutoOverPower(MyEnt) {
	var Abil = Game.GetAbilityByName(MyEnt, 'ursa_overpower')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	if(AbilLvl === 0)
		return
	
	
	Game.CastNoTarget(MyEnt, Abil, false)
}

function AutoEnrage(MyEnt) {
	var Abil = Game.GetAbilityByName(MyEnt, 'ursa_enrage')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	if(AbilLvl === 0)
		return
	
	
	Game.CastNoTarget(MyEnt, Abil, false)
}

function UrsaWTFAutoClickOnToggle() {
	if (!UrsaWTFAutoClick.checked) {
		Game.ScriptLogMsg('Script disabled: UrsaWTFAutoClick', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule(
				Fusion.MyTick,
				function() {
					UrsaWTFAutoClickOnInterval()
					if(UrsaWTFAutoClick.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: UrsaWTFAutoClick', '#00ff00')
	}
}

var UrsaWTFAutoClick = Game.AddScript('UrsaWTFAutoClick', UrsaWTFAutoClickOnToggle)