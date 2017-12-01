var DisablingAbils = [
	"item_cyclone"
]
DisablingAbils.push(Fusion.ForceStaffNames)

var DisableModifiers = new Map([
	["npc_dota_hero_techies", "modifier_techies_suicide_leap"],
	["npc_dota_hero_monkey_king", "modifier_monkey_king_bounce_leap"]
])

var flags = []
Disable = (MyEnt, ent) => {
	if(flags[ent])
		return
	var distance = Entities.GetRangeToUnit(MyEnt, ent)
	DisablingAbils.some(abilName => {
		var abil = Game.GetAbilityByName(MyEnt, abilName)
		if(abil === undefined)
			return false
		var abilBehaviors = Fusion.Behaviors(abil)
		if(distance > Abilities.GetCastRangeFix(abil) || !Abilities.IsCooldownReady(abil) || Abilities.IsHidden(abil) || !Abilities.IsActivated(abil))
			return false
		
		if(abilBehaviors.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_UNIT_TARGET) !== -1 || abilBehaviors.length === 0)
			Game.CastTarget(MyEnt, abil, ent)
		flags[ent] = true
		$.Schedule(Abilities.GetCastPoint(abil), () => delete flags[ent])
		return true
	})
}

AntiLeapF = () => {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Game.IsGamePaused() || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Entities.PlayersHeroEnts().filter(ent =>
		DisableModifiers.has(Entities.GetUnitName(ent))
		&& Entities.IsAlive(ent)
		&& !(
			Entities.IsBuilding(ent)
			|| Entities.IsInvulnerable(ent)
		)
	).some(ent => {
		var buffsNames = Game.GetBuffsNames(ent)
		var disableBuff = DisableModifiers.get(Entities.GetUnitName(ent))
		buffsNames.some(buffName => {
			if(buffName === disableBuff) {
				Disable(MyEnt, ent)
				return true
			} else
				return false
		})
	})
}

AntiLeapToggle = () => {
	if (AntiLeap.checked) {
		L = () => {
			if (AntiLeap.checked) {
				AntiLeapF()
				$.Schedule(Fusion.MyTick, L)
			}
		}
		L()
		Game.ScriptLogMsg("Script enabled: AntiLeap", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: AntiLeap", "#ff0000")
}

var AntiLeap = Fusion.AddScript("AntiLeap", AntiLeapToggle)