var ConcussiveShotDamage = [60, 120, 180, 240]
var IgnoreBuffs = [
	"modifier_skywrath_mage_ancient_seal"
]


function SkywrathMageWTFAutoOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Entities.GetAllHeroEntities()
	
	Unit(MyEnt, HEnts)
}

function Unit(MyEnt, HEnts) {
	var AncientSeal = Game.GetAbilityByName(MyEnt, 'skywrath_mage_ancient_seal')
	var MysticFlare = Game.GetAbilityByName(MyEnt, 'skywrath_mage_mystic_flare')
	var ConcussiveShot = Game.GetAbilityByName(MyEnt, 'skywrath_mage_concussive_shot')
	
	var AncientSealLvl = parseInt(Abilities.GetLevel(AncientSeal))
	var MysticFlareLvl = parseInt(Abilities.GetLevel(MysticFlare))
	var ConcussiveShotLvl = parseInt(Abilities.GetLevel(ConcussiveShot))
	
	var AncientSealRange = Abilities.GetCastRangeFix(AncientSeal)
	var MysticFlareRange = Abilities.GetCastRangeFix(MysticFlare)
	var ConcussiveShotRange = Abilities.GetCastRangeFix(ConcussiveShot)
	
	
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		
		if(!Entities.IsEnemy(ent))
			continue
		if(!Entities.IsAlive(ent))
			continue
		if(Entities.IsMagicImmune(ent))
			continue
		
		var buffsNames = Game.GetBuffsNames(ent)
		if(!Game.IntersecArrays(buffsNames, IgnoreBuffs) && Entities.GetRangeToUnit(MyEnt, ent) <= AncientSealRange && AncientSealLvl > 0)
			Game.CastTarget(MyEnt, AncientSeal, ent, false)
		if(Entities.GetRangeToUnit(MyEnt, ent) <= MysticFlareRange && MysticFlareLvl > 0)
			Game.CastPosition(MyEnt, MysticFlare, Entities.GetAbsOrigin(ent), false)
		else
			if(Entities.GetRangeToUnit(MyEnt, ent) <= ConcussiveShotRange && ConcussiveShotLvl > 0)
				Game.CastNoTarget(MyEnt, ConcussiveShot, false)
	}
}

function SkywrathMageWTFAutoOnToggle() {
	if (!SkywrathMageWTFAuto.checked)
		Game.ScriptLogMsg('Script disabled: SkywrathMageWTFAuto', '#ff0000')
	else {
		function intervalFunc(){
			$.Schedule(
				Fusion.MyTick,
				function() {
					SkywrathMageWTFAutoOnInterval()
					if(SkywrathMageWTFAuto.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: SkywrathMageWTFAuto', '#00ff00')
	}
}

var SkywrathMageWTFAuto = Game.AddScript('SkywrathMageWTFAuto', SkywrathMageWTFAutoOnToggle)