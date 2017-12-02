AxeUltiF = () => {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()),
		Ulti = Entities.GetAbilityByName(MyEnt, "axe_culling_blade"),
		UltiLvl = Abilities.GetLevel(Ulti),
		kill_threshold = Abilities.GetLevelSpecialValueFor(Ulti, "kill_threshold", UltiLvl),
		UltiCastRange = Abilities.GetCastRangeFix(Ulti) + 75
	
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt) || UltiLvl === 0 || Abilities.GetCooldownTimeRemaining(Ulti) !== 0 || Entities.GetMana(MyEnt) < Abilities.GetManaCost(Ulti))
		return
	
	Entities.PlayersHeroEnts().filter(ent =>
		Entities.IsAlive(ent)
		&& !(
			Entities.IsBuilding(ent)
			|| Entities.IsInvulnerable(ent)
		)
		&& Entities.IsEnemy(ent)
		&& Entities.GetRangeToUnit(MyEnt, ent) <= UltiCastRange
		&& Entities.GetHealth(ent) < kill_threshold
		&& !Fusion.HasLinkenAtTime(ent, Abilities.GetCastPoint(Ulti) + Fusion.MyTick)
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
		GameUI.SelectUnit(MyEnt, false)
		Game.CastTarget(MyEnt, Ulti, ent, false)
		return true
	})
}

AxeUltiOnCheckBoxClick = () => {
	if (!AxeUlti.checked) {
		Game.ScriptLogMsg("Script disabled: AxeUlti", "#ff0000")
		return
	} else {
		if (Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) != "npc_dota_hero_axe") {
			AxeUlti.checked = false
			AxeUltiOnCheckBoxClick()
			return
		} else {
			f = () => {
				if(AxeUlti.checked)
					$.Schedule(Fusion.MyTick, () => {
						AxeUltiF()
						f()
					})
			}
			f()
			Game.ScriptLogMsg("Script enabled: AxeUlti", "#00ff00")
		}
	}
}

var AxeUlti = Fusion.AddScript("AutoultAxe", AxeUltiOnCheckBoxClick)