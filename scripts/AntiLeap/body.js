var DisablingAbils = [ "item_cyclone", "item_force_staff" ],
	enabled = false
DisablingAbils.push(Fusion.ForceStaffNames)

var DisableModifiers = new Map([
	["npc_dota_hero_techies", "modifier_techies_suicide_leap"],
	["npc_dota_hero_monkey_king", "modifier_monkey_king_bounce_leap"]
])

var flags = []
function Disable(MyEnt, ent) {
	if(flags[ent])
		return
	var distance = Entities.GetRangeToUnit(MyEnt, ent) // used instead of Entities.IsEntityInRange as it'll not get range many times in tick
	DisablingAbils.every(abilName => {
		var abil = Game.GetAbilityByName(MyEnt, abilName)
		if(!abil || distance > Abilities.GetCastRangeFix(abil) || !Abilities.IsCooldownReady(abil) || Abilities.IsHidden(abil) || !Abilities.IsActivated(abil))
			return true
		
		GameUI.SelectUnit(MyEnt, false)
		Game.CastTarget(MyEnt, abil, ent, false)

		flags[ent] = true
		$.Schedule(Abilities.GetCastPoint(abil), () => delete flags[ent])
		return false
	})
}

function AntiLeapF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Game.IsGamePaused() || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	Entities.PlayersHeroEnts().filter(ent =>
		DisableModifiers.has(Entities.GetUnitName(ent))
		&& Entities.IsAlive(ent)
		&& !Entities.IsBuilding(ent)
		&& !Entities.IsInvulnerable(ent)
	).every(ent => {
		var disableBuff = DisableModifiers.get(Entities.GetUnitName(ent))
		return !Game.GetBuffsNames(ent).some(buffName => {
			if(buffName === disableBuff) {
				Disable(MyEnt, ent)
				return true
			} else
				return false
		})
	})
}

script = {
	name: "AntiLeap",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			function L() {
				if (enabled) {
					AntiLeapF()
					$.Schedule(Fusion.MyTick, L)
				}
			}
			L()
			Game.ScriptLogMsg("Script enabled: AntiLeap", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: AntiLeap", "#ff0000")
	},
	onDestroy: () => enabled = false
}