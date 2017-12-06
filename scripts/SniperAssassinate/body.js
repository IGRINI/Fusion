SniperAssassinateOnInterval = () => {
	SniperAssassinateF()

	if(SniperAssassinate.checked)
		$.Schedule(Fusion.MyTick, SniperAssassinateOnInterval)
}

SniperAssassinateF = () => {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()),
		Ulti = Entities.GetAbilityByName(MyEnt, "sniper_assassinate"),
		HideItem = Game.GetHideItem(MyEnt),
		UltiRange = Abilities.GetCastRangeFix(Ulti),
		UltiLvl = Abilities.GetLevel(Ulti),
		UltiCd = Abilities.GetCooldownTimeRemaining(Ulti),
		UltiDmg = Abilities.GetAbilityDamage(Ulti),
		UltiManaCost = Abilities.GetManaCost(Ulti)

	if(UltiLvl === 0 || UltiCd > 0 || UltiManaCost > Entities.GetMana(MyEnt) || Abilities.IsInAbilityPhase(Ulti))
		return

	Entities.PlayersHeroEnts().filter(ent =>
		Entities.IsAlive(ent)
		&& !(
			Entities.IsBuilding(ent)
			|| Entities.IsInvulnerable(ent)
		)
		&& Entities.IsEnemy(ent)
		&& Entities.GetRangeToUnit(MyEnt, ent) <= UltiRange
		&& !Entities.IsMagicImmune(ent)
		&& !Fusion.HasLinkenAtTime(ent, 2)
		&& Entities.GetHealth(ent) < Fusion.CalculateDamage(MyEnt, ent, UltiDmg, DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL)
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
		GameUI.SelectUnit(MyEnt, false)
		if(HideItem !== undefined)
			Game.CastTarget(MyEnt, HideItem, MyEnt, false)
		Game.CastTarget(MyEnt, Ulti, ent, false)
		return false
	})
}

var SniperAssassinate = Fusion.AddScript("SniperAssassinate", () => {
	if (SniperAssassinate.checked) {
		SniperAssassinateOnInterval()
		Game.ScriptLogMsg("Script enabled: SniperAssassinate", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: SniperAssassinate", "#ff0000")
})