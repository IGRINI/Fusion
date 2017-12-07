var enabled = false

function AutoBottleOnInterval() {
	AutoBottleF()
	
	if(enabled)
		$.Schedule(Fusion.MyTick, AutoBottleOnInterval)
}

function AutoBottleF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	
	var Bottle = Game.GetAbilityByName(MyEnt, "item_bottle")
	if(Bottle !== undefined && Entities.IsInRangeOfFountain(MyEnt) && Abilities.GetCooldownTimeRemaining(abilL) === 0)
		Game.CastNoTarget(MyEnt, Bottle, false)
}

return {
	name: "AntiLeap",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (checkbox.checked) {
			AutoBottleOnInterval()
			Game.ScriptLogMsg("Script enabled: AutoBottle", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: AutoBottle", "#ff0000")
	},
	onDestroy: () => enabled = false
}