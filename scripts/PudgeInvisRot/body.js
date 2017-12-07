var enabled = false

function PudgeInvisRotOnInterval() {
	PudgeInvisRotF()

	if(enabled)
		$.Schedule(Fusion.MyTick, PudgeInvisRotOnInterval)
}

function PudgeInvisRotF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	
	var Abil = Game.GetAbilityByName(MyEnt, "pudge_rot")
	Game.ToggleAbil(MyEnt, Abil, false)
}

return {
	name: "PudgeInvisRot",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (checkbox.checked) {
			PudgeInvisRotOnInterval()
			Game.ScriptLogMsg("Script enabled: PudgeInvisRot", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: PudgeInvisRot", "#ff0000")
	},
	onDestroy: () => enabled = false
}