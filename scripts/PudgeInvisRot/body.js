var BSName = "item_bloodstone"
var AegisName = "item_aegis"
var RotDamage = [30, 60, 90, 120]

PudgeInvisRotOnInterval = () => {
	PudgeInvisRotF()

	if(PudgeInvisRot.checked)
		$.Schedule(Fusion.MyTick, PudgeInvisRotOnInterval)
}

PudgeInvisRotF = () => {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	
	var Abil = Game.GetAbilityByName(MyEnt, "pudge_rot")
	Game.ToggleAbil(MyEnt, Abil, false)
}

var PudgeInvisRot = Fusion.AddScript("PudgeInvisRot", () => {
	if (PudgeInvisRot.checked) {
		PudgeInvisRotOnInterval()
		Game.ScriptLogMsg("Script enabled: PudgeInvisRot", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: PudgeInvisRot", "#ff0000")
})