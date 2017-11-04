var BSName = "item_bloodstone"
var AegisName = "item_aegis"
var RotDamage = [30, 60, 90, 120]

function PudgeInvisRotOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	
	var Abil = Game.GetAbilityByName(MyEnt, "pudge_rot")
	Game.ToggleAbil(MyEnt, Abil, false)
}

function PudgeInvisRotOnToggle() {
	if (!PudgeInvisRot.checked) {
		Game.ScriptLogMsg("Script disabled: PudgeInvisRot", "#ff0000")
	} else {
		function intervalFunc(){
			$.Schedule(
				0.01,
				function() {
					PudgeInvisRotOnInterval()
					if(PudgeInvisRot.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg("Script enabled: PudgeInvisRot", "#00ff00")
	}
}

var PudgeInvisRot = Fusion.AddScript("PudgeInvisRot", PudgeInvisRotOnToggle)