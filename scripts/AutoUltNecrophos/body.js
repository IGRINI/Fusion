AutoUltNecrophosOnInterval = () => {
	AutoUltNecrophosF()

	if(AutoUltNecrophos.checked)
		$.Schedule(Fusion.MyTick, AutoUltNecrophosOnInterval)
}

AutoUltNecrophosF = () => {
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
		var NeededDmg = Fusion.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent))
		
		if(NeededDmg <= dmg) {
			GameUI.SelectUnit(MyEnt, false)
			Game.CastTarget(MyEnt, Ulti, ent, false)
			return false
		} else {
			var Dagon = Fusion.GetDagon(MyEnt)
			if(Dagon !== undefined) {
				var DagonDamage = Fusion.GetDagonDamage(Dagon)
				if (
					Abilities.GetCooldownTimeRemaining(Dagon) === 0 &&
					NeededDmg <= (dmg + DagonDamage)
				) {
					GameUI.SelectUnit(MyEnt, false)
					Game.CastTarget(MyEnt, Dagon, ent, false)
					Game.EntStop(MyEnt, false)
				}
			}
		}

		return true
	})
}

var AutoUltNecrophos = Fusion.AddScript("AutoUltNecrophos", () => {
	if (AutoUltNecrophos.checked) {
		AutoUltNecrophosOnInterval()
		Game.ScriptLogMsg("Script enabled: AutoUltNecrophos", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: AutoUltNecrophos", "#ff0000")
})
