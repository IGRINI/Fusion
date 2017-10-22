var DeathPulseHeal = [70, 90, 110, 130]
var DeathPulseDamage = [125, 175, 225, 275]
var DeathPulseMinHealPercent = 95

function NecrophosWTFDeathPulseOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Entities.GetAllEntities()
	
	DeathPulse(MyEnt, HEnts)
}

function DeathPulse(MyEnt, HEnts) {
	var Abil = Game.GetAbilityByName(MyEnt, 'necrolyte_death_pulse')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	var AbilRange = Abilities.GetCastRangeFix(Abil)
	if(AbilLvl === 0)
		return
	
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		
		if(!Entities.IsAlive(ent))
			continue
		if(Entities.IsEnemy(ent) && Entities.IsMagicImmune(ent)) {
			ReaperScythe(MyEnt, ent)
			continue
		}
		if(Entities.GetRangeToUnit(MyEnt, ent) > AbilRange)
			continue
		if(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent))
			continue
		if(!Entities.IsEnemy(ent) && Entities.GetHealthPercent(ent) > DeathPulseMinHealPercent)
			continue
		
		Game.CastNoTarget(MyEnt, Abil, false)
		break
	}
}

function ReaperScythe(MyEnt, ent) {
	var Abil = Game.GetAbilityByName(MyEnt, 'necrolyte_reapers_scythe')
	var AbilRange = Abilities.GetCastRangeFix(Abil)
	
	if(Entities.GetRangeToUnit(MyEnt, ent) > AbilRange)
		return
	Game.CastTarget(MyEnt, Abil, ent, false)
}

function NecrophosWTFDeathPulseOnToggle() {
	if (!NecrophosWTFDeathPulse.checked) {
		Game.ScriptLogMsg('Script disabled: NecrophosWTFDeathPulse', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule(
				Fusion.MyTick,
				function() {
					NecrophosWTFDeathPulseOnInterval()
					if(NecrophosWTFDeathPulse.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: NecrophosWTFDeathPulse', '#00ff00')
	}
}

var NecrophosWTFDeathPulse = Game.AddScript('NecrophosWTFDeathPulse', NecrophosWTFDeathPulseOnToggle)