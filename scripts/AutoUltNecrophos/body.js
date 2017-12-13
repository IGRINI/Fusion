var enabled = false

function AutoUltNecrophosOnInterval() {
	AutoUltNecrophosF()

	if(enabled)
		$.Schedule(Fusion.MyTick, AutoUltNecrophosOnInterval)
}

function AutoUltNecrophosF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
		Ulti = Entities.GetAbilityByName(MyEnt, "necrolyte_reapers_scythe"),
		UltiRange = Abilities.GetCastRangeFix(Ulti),
		UltiLvl = Abilities.GetLevel(Ulti),
		UltiDmg = Abilities.GetAbilityDamage(Ulti),
		UltiManaCost = Abilities.GetManaCost(Ulti),
		DamagePerMissHP = Abilities.GetLevelSpecialValueFor(Ulti, "damage_per_health", UltiLvl);
	
	if(UltiLvl === 0 || Abilities.GetCooldownTimeRemaining(Ulti) > 0 || UltiManaCost > Entities.GetMana(MyEnt))
		return
	
	Entities.PlayersHeroEnts().filter(ent =>
		Entities.IsAlive(ent)
		&& !(
			Entities.IsBuilding(ent)
			|| Entities.IsInvulnerable(ent)
		)
		&& Entities.GetRangeToUnit(MyEnt, ent) <= UltiRange
		&& !Entities.IsMagicImmune(ent)
	).sort((ent1, ent2) => {
		var h1 = Entities.GetHealth(ent1)
		var h2 = Entities.GetHealth(ent2)
		
		if(h1 === h2)
			return 0
		if(h1 > h2)
			return 1
		else
			return -1
	}).every(ent => {
		if(Fusion.HasLinkenAtTime(ent, Abilities.GetCastPoint(Ulti)))
			return true
		var dmg = (Entities.GetMaxHealth(ent) - Entities.GetHealth(ent)) * DamagePerMissHP
		
		if(Entities.GetHealth(ent) < Fusion.CalculateDamage(MyEnt, ent, dmg, DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL)) {
			GameUI.SelectUnit(MyEnt, false)
			Game.CastTarget(MyEnt, Ulti, ent, false)
			return false
		} else
			return !Fusion.TryDagon(MyEnt, ent, dmg, DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL)

		return true
	})
}

script = {
	name: "Autoult Necrophos",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			AutoUltNecrophosOnInterval()
			Game.ScriptLogMsg("Script enabled: Necrophos Autoult", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: Necrophos Autoult", "#ff0000")
	},
	onDestroy: () => enabled = false
}