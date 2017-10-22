function AutoDewardOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Entities.GetAllEntities()
	
	Deward(MyEnt, HEnts)
}

function Deward(MyEnt, HEnts) {
	var Abil = GetDewardItem(MyEnt)
	if(Abil === -1) {
		Game.ScriptLogMsg("Needed deward item to make this script work!", "#ff0000")
		AutoDeward.checked = false
		AutoDewardOnToggle()
	}
	var AbilRange = Abilities.GetCastRangeFix(Abil)
	
	
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		
		if(!(Entities.IsAlive(ent) && Entities.IsEnemy(ent)))
			continue
		if(Entities.GetRangeToUnit(MyEnt, ent) > AbilRange)
			continue
		if(!AreDeward(ent))
			continue
		
		GameUI.SelectUnit(MyEnt, false)
		Game.CastTarget(MyEnt, Abil, ent, false)
	}
}

function AreDeward(ent) {
	return Entities.IsWard(ent) || IsMine(ent)
}

var MineNames = [/*Can"t de dewarded "npc_dota_techies_land_mine",*/"npc_dota_techies_remote_mine", "npc_dota_techies_stasis_trap"]
function IsMine(ent) {
	for(i = 0; i < MineNames.length; i++)
		if(Entities.GetUnitName(ent) === MineNames[i])
			return true
	
	return false
}

var DewardItemNames = ["item_quelling_blade", "item_bfury", "item_iron_talon"]
function GetDewardItem(MyEnt) {
	for(var i in DewardItemNames) {
		var DewardItemName = DewardItemNames[i]
		
		var item = Game.GetAbilityByName(MyEnt, DewardItemName)
		if(item !== undefined)
			return item
	}
	
	return -1
}

function AutoDewardOnToggle() {
	if (!AutoDeward.checked) {
		Game.ScriptLogMsg("Script disabled: AutoDeward", "#ff0000")
	} else {
		function intervalFunc(){
			$.Schedule(
				Fusion.MyTick,
				function() {
					AutoDewardOnInterval()
					if(AutoDeward.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg("Script enabled: AutoDeward", "#00ff00")
	}
}

var AutoDeward = Game.AddScript("AutoDeward", AutoDewardOnToggle)