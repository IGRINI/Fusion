function TrollWarlordWTFOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Game.PlayersHeroEnts()
	
	WhirlingAxes(MyEnt, HEnts)
	//BattleTrance(MyEnt, HEnts)
}

function WhirlingAxes(MyEnt, HEnts) {
	var Abil = Game.GetAbilityByName(MyEnt, 'troll_warlord_whirling_axes_melee')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	if(AbilLvl === 0)
		return
	
	
	Game.CastNoTarget(MyEnt, Abil, false)
}

function BattleTrance(MyEnt, HEnts) {
	var Abil = Game.GetAbilityByName(MyEnt, 'troll_warlord_battle_trance')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	if(AbilLvl === 0)
		return
	
	
	Game.CastNoTarget(MyEnt, Abil, false)
}


function TrollWarlordWTF() {
	if (!TrollWarlordWTF.checked) {
		Game.ScriptLogMsg('Script disabled: TrollWarlordWTF', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule(
				Fusion.MyTick,
				function() {
					TrollWarlordWTFOnInterval()
					if(TrollWarlordWTF.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: TrollWarlordWTF', '#00ff00')
	}
}

var TrollWarlordWTF = Game.AddScript('TrollWarlordWTF', TrollWarlordWTF)