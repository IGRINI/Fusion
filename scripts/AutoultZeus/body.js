var damage = [225, 325, 425]

ZeusAutoultF = () => {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var Ulti = Entities.GetAbilityByName(MyEnt, "zuus_thundergods_wrath")
	var UltiLvl = Abilities.GetLevel(Ulti)
	var UltiDmg = damage[UltiLvl-1]
	
	if(UltiLvl === 0 || Abilities.GetCooldownTimeRemaining(Ulti) !== 0 || Entities.GetMana(MyEnt) < Abilities.GetManaCost(Ulti))
		return
	
	Entities.PlayersHeroEnts().some(ent => {
		if (!Entities.IsEnemy(ent) || Entities.IsMagicImmune(ent) || !Entities.IsAlive(ent))
			return false
		if(Fusion.GetMagicMultiplier(MyEnt, ent) === 0)
			return false
		
		if(Fusion.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent)) <= UltiDmg) {
			Game.CastNoTarget(MyEnt, Ulti, false)
			return true
		}
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