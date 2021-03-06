﻿var flag = false,
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
		UltiDmg = Abilities.GetLevelSpecialValueFor(Ulti, "damage", UltiLvl - 1)
	
	if(UltiLvl === 0 || Abilities.GetCooldownTimeRemaining(Ulti) !== 0 || Entities.GetMana(MyEnt) < Abilities.GetManaCost(Ulti))
		return
	
	Entities.PlayersHeroEnts()
		.filter(ent =>
			Entities.IsEnemy(ent)
			&& !Entities.IsMagicImmune(ent)
			&& Entities.IsAlive(ent)
			&& Entities.GetHealth(ent) < Fusion.CalculateDamage(MyEnt, ent, UltiDmg, DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL)
		).every(ent => {
			GameUI.SelectUnit(MyEnt, false)
			Game.CastNoTarget(MyEnt, Ulti, false)

			flag = true
			$.Schedule(Abilities.GetCastPoint(Ulti) * 2, () => flag = false)
			
			return false
		})
}

script = {
	name: "Autoult Zeus",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			ZeusAutoultOnInterval()
			Game.ScriptLogMsg("Script enabled: Zeus Autoult", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: Zeus Autoult", "#ff0000")
	},
	onDestroy: () => enabled = false
}