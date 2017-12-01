SniperAssassinateFunc = () => {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	
	var Ulti = Entities.GetAbilityByName(MyEnt, "sniper_assassinate")
	var Glimmer = Game.GetAbilityByName(MyEnt, "item_glimmer_cape")
	var UltiRange = Abilities.GetCastRangeFix(Ulti)
	var UltiLvl = Abilities.GetLevel(Ulti)
	var UltiCd = Abilities.GetCooldownTimeRemaining(Ulti)
	var UltiDmg = Abilities.GetAbilityDamage(Ulti)
	var UltiManaCost = Abilities.GetManaCost(Ulti)

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
	).sort((ent1, ent2) => {
		var h1 = Entities.GetHealth(ent1)
		var h2 = Entities.GetHealth(ent2)
		
		if(h1 === h2)
			return 0
		if(h1 > h2)
			return 1 
		else
			return -1
	}).some(ent => {
		if(Fusion.HasLinkenAtTime(ent, 2))
			return false
		
		if(Fusion.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent)) <= UltiDmg) {
			GameUI.SelectUnit(MyEnt, false)
			if(Glimmer !== undefined)
				Game.CastTarget(MyEnt, Glimmer, MyEnt, false)
			Game.CastTarget(MyEnt, Ulti, ent, false)
			return true
		}
		return false
	})
}

SniperAssassinateOnCheckBoxClick = () => {
	if (!SniperAssassinate.checked) {
		Fusion.Panels.SniperAssassinate.DeleteAsync(0)
		Game.ScriptLogMsg("Script disabled: SniperAssassinate", "#ff0000")
		return
	}
	if(Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) !== "npc_dota_hero_sniper") {
		SniperAssassinate.checked = false
		Game.ScriptLogMsg("SniperAssassinate: Not Sniper", "#ff0000")
		return
	}

	f = () => {
		$.Schedule (
			Fusion.MyTick,
			() => {
				SniperAssassinateFunc()
				if(SniperAssassinate.checked)
					f()
			}
		)
	}
	f()
	Game.ScriptLogMsg("Script enabled: SniperAssassinate", "#00ff00")
}

var SniperAssassinate = Fusion.AddScript("SniperAssassinate", SniperAssassinateOnCheckBoxClick)