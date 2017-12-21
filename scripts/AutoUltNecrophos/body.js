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
		DamagePerMissHP = Abilities.GetLevelSpecialValueFor(Ulti, "damage_per_health", UltiLvl - 1);
	
	if(UltiLvl === 0 || Abilities.GetCooldownTimeRemaining(Ulti) > 0 || UltiManaCost > Entities.GetMana(MyEnt))
		return
	
	Array.prototype.orderBy.call(Entities.PlayersHeroEnts().filter(ent =>
		Entities.IsAlive(ent)
		&& !(
			Entities.IsBuilding(ent)
			|| Entities.IsInvulnerable(ent)
		)
		&& Entities.IsEntityInRange(MyEnt, ent, UltiRange)
		&& !Entities.IsMagicImmune(ent)
	), ent => Entities.GetHealth(ent, MyEnt)).every(ent => {
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