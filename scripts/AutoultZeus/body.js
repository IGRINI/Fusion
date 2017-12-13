var flag = false,
	enabled = false

function ZeusAutoultOnInterval() {
	ZeusAutoultF()

	if(enabled)
		$.Schedule(Fusion.MyTick, ZeusAutoultOnInterval)
}

function ZeusAutoultF() {
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
			&& Entities.GetHealth(ent) < Fusion.CalculateDamage(MyEnt, ent, UltiDmg, DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL)
		.every(ent => {
			Game.CastNoTarget(MyEnt, Ulti, false)

			flag = true
			$.Schedule(Abilities.GetCastPoint(Ulti), () => flag = false)
			
			return false
		})
}

script = {
	name: "AutoultZeus",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (checkbox.checked) {
			ZeusAutoultOnInterval()
			Game.ScriptLogMsg("Script enabled: AutoultZeus", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: AutoultZeus", "#ff0000")
	},
	onDestroy: () => enabled = false
}