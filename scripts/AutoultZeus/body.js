var flag = false
ZeusAutoultF = () => {
	if(flag)
		return
	
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()),
		Ulti = Entities.GetAbilityByName(MyEnt, "zuus_thundergods_wrath"),
		UltiLvl = Abilities.GetLevel(Ulti),
		UltiDmg = Abilities.GetLevelSpecialValueFor(Ulti, "damage", UltiLvl)
	
	if(UltiLvl === 0 || Abilities.GetCooldownTimeRemaining(Ulti) !== 0 || Entities.GetMana(MyEnt) < Abilities.GetManaCost(Ulti))
		return
	
	Entities.PlayersHeroEnts()
		.filter(ent =>
			Entities.IsEnemy(ent)
			&& !Entities.IsMagicImmune(ent)
			&& Entities.IsAlive(ent))
			&& Fusion.GetMagicMultiplier(MyEnt, ent) !== 0
			&& Fusion.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent)) < UltiDmg
		.every(ent => {
			Game.CastNoTarget(MyEnt, Ulti, false)

			flag = true
			$.Schedule(Abilities.GetCastPoint(Ulti), () => flag = false)
			
			return false
		})
}

ZeusAutoultOnCheckBoxClick = () => {
	if (ZeusAutoult.checked) {
		if (Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) != "npc_dota_hero_zuus"){
			ZeusAutoult.checked = false
			Game.ScriptLogMsg("ZeusAutoult: Not Zeus", "#ff0000")
			return
		}
		f = () => {
			$.Schedule (
				Fusion.MyTick,
				() => {
					ZeusAutoultF()
					if(ZeusAutoult.checked)
						f()
				}
			)
		}
		f()
		Game.ScriptLogMsg("Script enabled: ZeusAutoult", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: ZeusAutoult", "#ff0000")
}

var ZeusAutoult = Fusion.AddScript("AutoultZeus", ZeusAutoultOnCheckBoxClick)