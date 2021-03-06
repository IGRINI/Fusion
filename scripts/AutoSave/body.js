﻿var SavingAbils = [
	"bane_nightmare"
]

var BuffsNames = [

]

var flag = false
function Save(MyEnt, ent) {
	if(flag)
		return
	var distance = Entities.GetRangeToUnit(MyEnt, ent) // used instead of Entities.IsEntityInRange as it'll not get range many times in tick
	SavingAbils.every(ar => {
		var abil = Game.GetAbilityByName(MyEnt, ar[0])
		if(abil === undefined)
			return true
		if(distance > Abilities.GetCastRangeFix(abil) || !Abilities.IsCooldownReady(abil) || Abilities.IsHidden(abil) || !Abilities.IsActivated(abil))
			return true
		Game.CastTarget(MyEnt, abil, ent)
		flag = true
		$.Schedule(1, () => flag = false)
		return false
	})
}

function AutoSaveF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Game.IsGamePaused() || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	Entities.PlayersHeroEnts().filter(ent =>
		Entities.IsAlive(ent)
		&& !(
			Entities.IsBuilding(ent)
			|| Entities.IsInvulnerable(ent)
		)
		&& !Entities.IsEnemy(ent)
	).every(ent => !Game.GetBuffsNames(ent).some(buffName => {
		if(BuffsNames.contains(buffName)) {
			Save(MyEnt, ent)
			return true
		} else
			return false
	}))
}

script = {
	name: "AutoSave",
	isVisible: false // let's define more SavingAbils && BuffsNames to enable this script
}
/*var AutoSave = Fusion.AddScript("AutoSave", () => {
	if (!AutoSave.checked)
	Game.ScriptLogMsg("Script disabled: AutoSave", "#ff0000")
else {
	function L() {
		if (AutoSave.checked) {
			AutoSaveF()
			$.Schedule(Fusion.MyTick, L)
		}
	}
	L()
	Game.ScriptLogMsg("Script enabled: AutoSave", "#00ff00")
}
})
*/