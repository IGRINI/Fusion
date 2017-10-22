var ShadowWaveHeal = [80, 100, 120, 140]
var ShadowWaveRanges = [185, 475]
var ShadowWaveMinHealPercent = 95

function DazzleWTFHealOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Game.PlayersHeroEnts()
	
	ShadowWave(MyEnt, HEnts)
}

function ShadowWave(MyEnt, HEnts) {
	var Abil = Game.GetAbilityByName(MyEnt, 'dazzle_shadow_wave')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	var AbilRange = 0
	
	
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		
		if(!Entities.IsAlive(ent))
			continue
		if(Entities.IsEnemy(ent))
			AbilRange = ShadowWaveRanges[0]
		else
			AbilRange = ShadowWaveRanges[1]
		if(Entities.GetRangeToUnit(MyEnt, ent) > AbilRange)
			continue
		if(!Entities.IsEnemy(ent) && Entities.GetHealthPercent(ent) > ShadowWaveMinHealPercent)
			continue
		
		Game.CastTarget(MyEnt, Abil, ent, false)
	}
}

function DazzleWTFHealOnToggle() {
	if (!DazzleWTFHeal.checked) {
		Game.ScriptLogMsg('Script disabled: DazzleWTFHeal', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule(
				Fusion.MyTick,
				function() {
					DazzleWTFHealOnInterval()
					if(DazzleWTFHeal.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: DazzleWTFHeal', '#00ff00')
	}
}

var DazzleWTFHeal = Game.AddScript('DazzleWTFHeal', DazzleWTFHealOnToggle)