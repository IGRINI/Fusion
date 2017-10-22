function TerrorBladeWTFSunder() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Game.PlayersHeroEnts()
	
	Sunder(MyEnt, HEnts)
}

function Sunder(MyEnt, HEnts) {
	var Abil = Game.GetAbilityByName(MyEnt, 'terrorblade_sunder')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	var AbilRange = 0
	
	
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		
		if(!Entities.IsAlive(ent))
			continue
		if(Entities.GetRangeToUnit(MyEnt, ent) > AbilRange)
			continue
		if(Entities.IsEnemy(ent) && Entities.GetHealthPercent(MyEnt) < Entities.GetHealthPercent(ent))
			Game.CastTarget(MyEnt, Abil, ent, false)
		if(!Entities.IsEnemy(ent) && Entities.GetHealthPercent(MyEnt) > Entities.GetHealthPercent(ent))
			Game.CastTarget(MyEnt, Abil, ent, false)
	}
}

function TerrorBladeWTFSunderOnToggle() {
	if (!TerrorBladeWTFSunder.checked) {
		Game.ScriptLogMsg('Script disabled: TerrorBladeWTFSunder', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule(
				Fusion.MyTick,
				function() {
					TerrorBladeWTFSunderOnInterval()
					if(TerrorBladeWTFSunder.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: TerrorBladeWTFSunder', '#00ff00')
	}
}

var TerrorBladeWTFSunder = Game.AddScript('TerrorBladeWTFSunder', TerrorBladeWTFSunderOnToggle)