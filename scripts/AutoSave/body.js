var SavingAbils = [
	"bane_nightmare",
	"item_eul"
]

var BuffsNames = [

]

var flag = false
function Save(MyEnt, ent) {
	if(flag)
		return
	var distance = Entities.GetRangeToUnit(MyEnt, ent)
	SavingAbils.some(function(ar) {
		var abil = Game.GetAbilityByName(MyEnt, ar[0])
		if(abil === undefined)
			return false
		var abilBehaviors = Game.Behaviors(abil)
		var speed = ar[1]
		if(distance > Abilities.GetCastRangeFix(abil) || !Abilities.IsCooldownReady(abil) || Abilities.IsHidden(abil) || !Abilities.IsActivated(abil))
			return false
		Game.CastTarget(MyEnt, abil, ent)
		flag = true
		$.Schedule(1, function() {
			flag = false
		})
		return true
	})
}

function AutoSaveF() {
	var MyEnt = parseInt(Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()))
	if(Game.IsGamePaused() || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Game.PlayersHeroEnts().map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && !Entities.IsEnemy(ent)
	}).some(function(ent) {
		var entBuffsNames = Game.GetBuffsNames(ent)
		entBuffsNames.some(function(buffName) {
			if(BuffsNames.contains(buffName)) {
				Save(MyEnt, ent)
				return true
			} else
				return false
		})
		//$.Msg(entBuffsNames)
	})
}

function AutoSaveToggle() {
	if (!AutoSave.checked) {
		Game.ScriptLogMsg("Script disabled: AutoSave", "#ff0000")
		return
	} else {
		function L() {
			if (AutoSave.checked) {
				AutoSaveF()
				$.Schedule(Fusion.MyTick, L)
			}
		}
		L()
		Game.ScriptLogMsg("Script enabled: AutoSave", "#00ff00")
	}
}

//var AutoSave = Game.AddScript("AutoSave", AutoSaveToggle)
