var ShadowGraveRanges = [0, 550, 700, 850, 1000]
var ShadowGraveMinHPPercent = 20

function DazzleWTFGraveOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt))
		return
	var HEnts = Game.PlayersHeroEnts()
	
	ShadowGrave(MyEnt, HEnts)
}

function ShadowGrave(MyEnt, HEnts) {
	var Abil = Game.GetAbilityByName(MyEnt, 'dazzle_shallow_grave')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	if(AbilLvl === 0)
		return
	var AbilRange = ShadowGraveRanges[AbilLvl]
	
	
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		if(Entities.IsEnemy(ent) || !Entities.IsAlive(ent))
			continue
		if(Entities.GetRangeToUnit(MyEnt, ent) > AbilRange)
			continue
		var buffsNames = Game.GetBuffsNames(ent)
		if(Game.IntersecArrays(buffsNames, ["modifier_dazzle_shallow_grave"]))
			continue
		if(!Entities.IsEnemy(ent) && Entities.GetHealthPercent(ent) > ShadowGraveMinHPPercent)
			continue
		
		Game.CastTarget(MyEnt, Abil, ent, false)
	}
}

function DazzleWTFGraveOnToggle() {
	if (!DazzleWTFGrave.checked) {
		Game.ScriptLogMsg('Script disabled: DazzleWTFGrave', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule(
				Fusion.MyTick,
				function() {
					DazzleWTFGraveOnInterval()
					if(DazzleWTFGrave.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: DazzleWTFGrave', '#00ff00')
	}
}

var DazzleWTFGrave = Game.AddScript('DazzleWTFGrave', DazzleWTFGraveOnToggle)