Fusion.FamiliarBaseClass = "npc_dota_visage_familiar"
GetFamiliars = () => {
	return Entities.GetAllEntitiesByClassname(Fusion.FamiliarBaseClass).filter(ent =>
		Entities.IsAlive(ent)
		&& !Entities.IsBuilding(ent)
		&& !Entities.IsEnemy(ent)
		&& !Entities.IsStunned(ent)
		&& Entities.IsControllableByPlayer(ent, Game.GetLocalPlayerID())
		&& !Entities.IsIllusion(ent)
	)
}

EzVisageF = () => {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	Familiars(MyEnt)
	Souls(MyEnt)
}

var HealBarrierPercent = 50
Familiars = MyEnt => {
	var familiars = GetFamiliars()
	familiars.forEach(ent => {
		var StoneForm = Entities.GetAbilityByName(ent, "visage_summon_familiars_stone_form")
		if(Entities.GetHealthPercent(ent) <= HealBarrierPercent)
			if(Abilities.GetCooldownTimeRemaining(StoneForm) === 0) {
				GameUI.SelectUnit(ent, false)
				Game.CastNoTarget(ent, StoneForm, false)
				GameUI.SelectUnit(MyEnt, false)
			} else
				GameUI.PingMinimapAtLocation(Entities.GetAbsOrigin(ent))
	})
}

Souls = MyEnt => {
	var Abil = Entities.GetAbilityByName(MyEnt, "visage_soul_assumption")
	if(Abilities.GetLevel(Abil) === 0 || Abilities.GetCooldownTimeRemaining(Abil) !== 0 || Entities.GetMana(MyEnt) < Abilities.GetManaCost(Abil))
		return
	var AbilRange = Abilities.GetCastRangeFix(Abil)
	var AbilCastPoint = Abilities.GetCastPoint(Abil)
	var SoulDamage = 20 + 65 * Buffs.GetStackCount(MyEnt, Fusion.GetBuffByName(MyEnt, "modifier_visage_soul_assumption"))
	
	Entities.PlayersHeroEnts().filter(function(ent) {
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && Entities.IsEnemy(ent) && Entities.GetRangeToUnit(ent, MyEnt) <= AbilRange
	}).sort(function(ent1, ent2) {
		var h1 = Entities.GetHealth(ent1)
		var h2 = Entities.GetHealth(ent2)
		
		if(h1 === h2)
			return 0
		if(h1 > h2)
			return 1
		else
			return -1
	}).some(function(ent) {
		if(Fusion.HasLinkenAtTime(ent, AbilCastPoint) || Fusion.GetMagicMultiplier(MyEnt, ent) === 0)
			return false
		if(Fusion.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent)) <= SoulDamage) {
			GameUI.SelectUnit(MyEnt, false)
			Game.CastTarget(MyEnt, Abil, ent, false)
			return true
		}
	})
}

var EzVisage = Fusion.AddScript("EzVisage", () => {
	if (EzVisage.checked) {
		function f() {
			if(EzVisage.checked)
				$.Schedule(Fusion.MyTick, function() {
					EzVisageF()
					f()
				})
		}
		f()
		Game.ScriptLogMsg("Script enabled: EzVisage", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: EzVisage", "#ff0000")
})