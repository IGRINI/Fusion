var enabled = false

function AutoDenyOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	if(!Entities.HasItemInInventory(MyEnt, "item_bloodstone") && Entities.GetUnitName(MyEnt) !== "npc_dota_hero_pudge")
		return
	if(Entities.HasItemInInventory(MyEnt, "item_aegis") || Entities.GetHealthPercent(MyEnt) > 9)
		return
	
	if(Entities.GetUnitName(MyEnt) === "npc_dota_hero_pudge") {
		var Rot = Entities.GetAbilityByName(MyEnt, "pudge_rot"),
			SoulRing = Game.GetAbilityByName(MyEnt, "item_soul_ring"),
			Rot_Damage = Abilities.GetLevelSpecialValueFor(Rot, "rot_damage", Abilities.GetLevel(Rot) - 1),
			SoulRing_Damage = Abilities.GetSpecialValueFor(SoulRing, "health_sacrifice")
		if(Entities.GetHealth(MyEnt) <= Rot_Damage + SoulRing_Damage) {
			if(SoulRing && Abilities.GetCooldownTimeRemaining(SoulRing) === 0)
				Game.CastNoTarget(MyEnt, SoulRing, false)
			if(Game.GetBuffsNames(MyEnt).indexOf("modifier_pudge_rot") === -1)
				Game.ToggleAbil(MyEnt, Rot, false)
			
			return
		}
	}
	
	var item = Game.GetAbilityByName(MyEnt, "item_bloodstone")
	if(!item)
		return
	Game.CastPosition(MyEnt, item, Entities.GetAbsOrigin(MyEnt), false)
}

script = {
	name: "AutoDeny",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			function intervalFunc() {
				$.Schedule(
					Fusion.MyTick / 3,
					() => {
						AutoDenyOnInterval()
						if(enabled)
							intervalFunc()
					}
				)
			}
			intervalFunc()
			Game.ScriptLogMsg("Script enabled: AutoDeny", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: AutoDeny", "#ff0000")
	},
	onDestroy: () => enabled = false
}