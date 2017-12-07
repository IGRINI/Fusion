function onPreloadF() {
	if(!Fusion.Commands.Eval) {
		Fusion.Commands.Eval = function(name, arg1) {
			eval(arg1)
		}
		Game.AddCommand('__eval', Fusion.Commands.Eval, '', 0)
	}

	if(!Fusion.Commands.DumpEnemyAbilities) {
		var lastBuffs = []
		Fusion.Commands.DumpEnemyAbilities = function() {
			var HEnts = Entities.PlayersHeroEnts().filter(function(ent) {
				return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && Entities.IsEnemy(ent)
			})
			HEnts.map(function(ent) {
				var entName = Entities.GetUnitName(ent).replace("npc_dota_hero_", "")
				var available = []
				for(var i = 0; i < Entities.GetNumItemsInInventory(ent); i++) {
					var item = Entities.GetItemInSlot(ent, i)
					available.push(item)
				}
				for(var i = 0; i < Entities.GetAbilityCount(ent); i++) {
					var abil = Entities.GetAbility(ent, i)
					available.push(abil)
				}
				$.Msg(`${entName}: {`)
				available.map(function(abil) {
					var abilName = Abilities.GetAbilityName(abil)
					if(typeof abilName !== 'string' || abilName === '')
						return
					$.Msg('\t${abilName} {')
					$.Msg(`\t\tLevel: ${Abilities.GetLevel(abil)}`)
					$.Msg(`\t\tCooldown: ${Math.ceil(Abilities.GetCooldownTimeRemaining(abil))}`)
					$.Msg("\t}")
				})
				$.Msg("}")
			})
		}
		Game.AddCommand('__DumpEnemyAbilities', Fusion.Commands.DumpEnemyAbilities, '', 0)
	}

	if(!Fusion.Commands.ModifierDebugging) {
		var ModifierDebuggingEnabled = false
		Fusion.Commands.ModifierDebugging = {
			Command: () => {
				if(ModifierDebuggingEnabled)
					return
				ModifierDebuggingEnabled = true
				Fusion.Commands.ModifierDebugging.Function()
			},
			Function: () => {
				var MyEnt = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer())
				var buffs = Game.GetBuffsNames(MyEnt)
				if(!Fusion.DeepEquals(lastBuffs, buffs)) {
					lastBuffs = buffs
					$.Msg(buffs)
				}
				$.Schedule(Fusion.MyTick, Fusion.Commands.ModifierDebugging.Function)
			}
		}
		Game.AddCommand('__StartModifierDebugging', Fusion.Commands.ModifierDebugging.Command, '', 0)
	}
}

return {
	name: "Dumper",
	onPreload: onPreloadF,
	isVisible: false
}