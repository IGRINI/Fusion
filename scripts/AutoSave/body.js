var SavingAbils = [
	"bane_nightmare"
]

var BuffsNames = [

]

var flag = false
Save = (MyEnt, ent) => {
	if(flag)
		return
	var distance = Entities.GetRangeToUnit(MyEnt, ent)
	SavingAbils.some(ar => {
		var abil = Game.GetAbilityByName(MyEnt, ar[0])
		if(abil === undefined)
			return false
		var abilBehaviors = Fusion.Behaviors(abil)
		var speed = ar[1]
		if(distance > Abilities.GetCastRangeFix(abil) || !Abilities.IsCooldownReady(abil) || Abilities.IsHidden(abil) || !Abilities.IsActivated(abil))
			return false
		Game.CastTarget(MyEnt, abil, ent)
		flag = true
		$.Schedule(1, () => flag = false)
		return true
	})
}

AutoSaveF = () => {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Game.IsGamePaused() || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Entities.PlayersHeroEnts().filter(ent =>
		Entities.IsAlive(ent)
		&& !(
			Entities.IsBuilding(ent)
			|| Entities.IsInvulnerable(ent)
		)
		&& !Entities.IsEnemy(ent)
	).some(ent => {
		var entBuffsNames = Game.GetBuffsNames(ent)
		entBuffsNames.some(buffName => {
			if(BuffsNames.contains(buffName)) {
				Save(MyEnt, ent)
				return true
			} else
				return false
		})
	})
}

AutoSaveToggle = () => {
	if (!AutoSave.checked)
		Game.ScriptLogMsg("Script disabled: AutoSave", "#ff0000")
	else {
		L = () => {
			if (AutoSave.checked) {
				AutoSaveF()
				$.Schedule(Fusion.MyTick, L)
			}
		}
		L()
		Game.ScriptLogMsg("Script enabled: AutoSave", "#00ff00")
	}
}

//var AutoSave = Fusion.AddScript("AutoSave", AutoSaveToggle)
