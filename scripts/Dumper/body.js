function onPreloadF() {
	if(!Fusion.Commands.DumpEnemyAbilities) {
		var lastBuffs = []
		Fusion.Commands.DumpEnemyAbilities = () => {
			Entities.PlayersHeroEnts().filter(ent =>
				Entities.IsAlive(ent)
				&& !(
					Entities.IsBuilding(ent)
					|| Entities.IsInvulnerable(ent)
				)
				&& Entities.IsEnemy(ent)
			).map(ent => {
				var entName = Entities.GetUnitName(ent).replace("npc_dota_hero_", "")
				var available = []
				/*for(var i = 0; i < Entities.GetNumItemsInInventory(ent); i++) {
					var item = Entities.GetItemInSlot(ent, i)
					available.push(item)
				}*/
				for(var i = 0; i < Entities.GetAbilityCount(ent); i++) {
					var abil = Entities.GetAbility(ent, i)
					available.push(abil)
				}
				$.Msg(`${entName}: {`)
				available.map(abil => {
					var abilName = Abilities.GetAbilityName(abil)
					if(typeof abilName !== "string" || abilName === "")
						return
					$.Msg(`\t${abilName} {`)
					$.Msg(`\t\tLevel: ${Abilities.GetLevel(abil)}`)
					$.Msg(`\t\tCooldown: ${Math.ceil(Abilities.GetCooldownTimeRemaining(abil))}`)
					$.Msg("\t}")
				})
				$.Msg("}")
			})
		}
		Game.AddCommand("__DumpEnemyAbilities", Fusion.Commands.DumpEnemyAbilities, "", 0)
	}
}

script = {
	name: "Dumper",
	onPreload: onPreloadF,
	isVisible: false
}