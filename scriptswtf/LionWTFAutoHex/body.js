var IgnoreBuffs = [
	"modifier_lion_voodoo",
	"modifier_life_stealer_rage"
]
var LenseBonusRange = 200

function LionWTFAutoHexOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt))
		return
	var HEnts = Entities.GetAllHeroEntities() //Getting heroes WITH illusions
	
	Hex(MyEnt, HEnts)
}

function Hex(MyEnt, HEnts) {
	var Abil = Game.GetAbilityByName(MyEnt, 'lion_voodoo')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	if(AbilLvl === 0)
		return
	var AbilRange = Abilities.GetCastRangeFix(Abil)
	
	
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		if(!Entities.IsEnemy(ent) || !Entities.IsAlive(ent))
			continue
		if(Entities.GetRangeToUnit(MyEnt, ent) > AbilRange)
			continue
		var buffsNames = Game.GetBuffsNames(ent)
		if(Game.IntersecArrays(buffsNames, IgnoreBuffs))
			continue
		
		Game.CastTarget(MyEnt, Abil, ent, false)
		return
	}
}

function LionWTFAutoHexOnToggle() {
	if (!LionWTFAutoHex.checked) {
		Game.ScriptLogMsg('Script disabled: LionWTFAutoHex', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule(
				Fusion.MyTick / 3,
				function() {
					LionWTFAutoHexOnInterval()
					if(LionWTFAutoHex.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: LionWTFAutoHex', '#00ff00')
	}
}

var LionWTFAutoHex = Game.AddScript('LionWTFAutoHex', LionWTFAutoHexOnToggle)