AutoBottleOnInterval = () => {
	AutoBottleF()
	
	if(AutoBottle.checked)
		$.Schedule(Fusion.MyTick, AutoBottleOnInterval)
}

AutoBottleF = () => {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	
	var Bottle = Game.GetAbilityByName(MyEnt, "item_bottle")
	if(Bottle !== undefined && Entities.IsInRangeOfFountain(MyEnt) && Abilities.GetCooldownTimeRemaining(abilL) === 0)
		Game.CastNoTarget(MyEnt, Bottle, false)
}

var AutoBottle = Fusion.AddScript("AutoBottle", () => {
	if (AutoBottle.checked) {
		AutoBottleOnInterval()
		Game.ScriptLogMsg("Script enabled: AutoBottle", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: AutoBottle", "#ff0000")
})