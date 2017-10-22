var BSName = "item_bloodstone"
var AegisName = "item_aegis"
var RotDamage = [30, 60, 90, 120]

function AutoDenyOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	if(!Entities.HasItemInInventory(MyEnt, BSName) && Entities.GetUnitName(MyEnt) !== "npc_dota_hero_pudge")
		return
	if(Entities.HasItemInInventory(MyEnt, AegisName) || Entities.GetHealthPercent(MyEnt) > 9)
		return
	
	if(Entities.GetUnitName(MyEnt) === "npc_dota_hero_pudge") {
		var Abil = Game.GetAbilityByName(MyEnt, "pudge_rot")
		var AbilLvl = parseInt(Abilities.GetLevel(Abil))
		if(Entities.GetHealth(MyEnt) <= RotDamage[AbilLvl - 1] * 2)
			Game.ToggleAbil(MyEnt, Abil, false)
		return
	}
	
	var item = Game.GetAbilityByName(MyEnt, BSName)
	if(item === undefined)
		return
	Game.CastPosition(MyEnt, item, Entities.GetAbsOrigin(MyEnt), false)
}

function AutoDenyOnToggle() {
	if (!AutoDeny.checked) {
		Game.ScriptLogMsg("Script disabled: AutoDeny", "#ff0000")
	} else {
		function intervalFunc(){
			$.Schedule(
				Fusion.MyTick / 3,
				function() {
					AutoDenyOnInterval()
					if(AutoDeny.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg("Script enabled: AutoDeny", "#00ff00")
	}
}

var AutoDeny = Game.AddScript("AutoDeny", AutoDenyOnToggle)