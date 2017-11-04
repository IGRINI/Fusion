function AutoDewardF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Entities.GetAllEntities()
	
	Deward(MyEnt, HEnts)

	if(AutoDeward.checked)
		$.Schedule(Fusion.MyTick, AutoDewardF)
}

function Deward(MyEnt, HEnts) {
	var Abil = GetDewardItem(MyEnt)
	if(Abil === -1) {
		Game.ScriptLogMsg("Needed deward item to make this script work!", "#ff0000")
		AutoDeward.checked = false
		AutoDewardOnToggle()
	}

	var AbilRange = Abilities.GetCastRangeFix(Abil)
	HEnts.some(function(ent) {
		if(!(Entities.IsAlive(ent) && Entities.IsEnemy(ent)))
			return false
		if(Entities.GetRangeToUnit(MyEnt, ent) > AbilRange)
			return false
		if(!AreDeward(ent))
			return false
		
		GameUI.SelectUnit(MyEnt, false)
		Game.CastTarget(MyEnt, Abil, ent, false)
		return true
	})
}

function AreDeward(ent) {
	return Entities.IsWard(ent) || IsMine(ent)
}

var MineNames = ["npc_dota_techies_remote_mine", "npc_dota_techies_stasis_trap"]
function IsMine(ent) {
	for(i = 0; i < MineNames.length; i++)
		if(Entities.GetUnitName(ent) === MineNames[i])
			return true
	
	return false
}

var DewardItemNames = ["item_quelling_blade", "item_bfury", "item_iron_talon", "item_tango"]
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
		AutoDewardF()
		Game.ScriptLogMsg("Script enabled: AutoDeward", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: AutoDeward", "#ff0000")
}

var AutoDeward = Fusion.AddScript("AutoDeward", AutoDewardOnToggle)