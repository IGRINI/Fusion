var flag = false

ZeusAutoultOnInterval = () => {
	ZeusAutoultF()

	if(ZeusAutoult.checked)
		$.Schedule(Fusion.MyTick, ZeusAutoultOnInterval)
}

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

var ZeusAutoult = Fusion.AddScript("AutoultZeus", () => {
	if (ZeusAutoult.checked) {
		ZeusAutoultOnInterval()
		Game.ScriptLogMsg("Script enabled: ZeusAutoult", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: ZeusAutoult", "#ff0000")
})