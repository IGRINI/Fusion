var enabled = false

function SniperAutoultOnInterval() {
	SniperAutoultF()

	if(enabled)
		$.Schedule(Fusion.MyTick, SniperAutoultOnInterval)
}

function SniperAutoultF() {
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

		Array.prototype.orderBy.call(Entities.PlayersHeroEnts().filter(ent =>
		Entities.IsAlive(ent)
		&& !(
			Entities.IsBuilding(ent)
			|| Entities.IsInvulnerable(ent)
		)
		&& Entities.IsEnemy(ent)
		&& Entities.IsEntityInRange(MyEnt, ent, UltiRange)
		&& !Entities.IsMagicImmune(ent)
		&& !Fusion.HasLinkenAtTime(ent, 2)
		&& Entities.GetHealth(ent) < Fusion.CalculateDamage(MyEnt, ent, UltiDmg, DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL)
	), ent => Entities.GetHealth(ent, MyEnt)).every(ent => {
		GameUI.SelectUnit(MyEnt, false)
		if(HideItem !== undefined)
			Game.CastTarget(MyEnt, HideItem, MyEnt, false)
		Game.CastTarget(MyEnt, Ulti, ent, false)
		return false
	})
}

script = {
	name: "Autoult Sniper",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			SniperAutoultOnInterval()
			Game.ScriptLogMsg("Script enabled: Sniper Autoult", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: Sniper Autoult", "#ff0000")
	},
	onDestroy: () => enabled = false
}