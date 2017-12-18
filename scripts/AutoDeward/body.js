var enabled = false

function AutoDewardF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Entities.GetAllEntities()
	
	Deward(MyEnt, HEnts)

	if(enabled)
		$.Schedule(Fusion.MyTick, AutoDewardF)
}

function Deward(MyEnt, HEnts) {
	var Abil = GetDewardItem(MyEnt)
	if(Abil === -1)
		return

	var AbilRange = Abilities.GetCastRangeFix(Abil)
	HEnts.filter(ent =>
		Entities.IsAlive(ent)
		&& Entities.IsEnemy(ent)
		&& Entities.IsEntityInRange(MyEnt, ent, AbilRange)
		&& AreDeward(ent)
	).every(ent => {
		GameUI.SelectUnit(MyEnt, false)
		Game.CastTarget(MyEnt, Abil, ent, false)
		return false
	})
}

function AreDeward(ent) {
	return Entities.IsWard(ent) || Entities.IsMine(ent)
}

function GetDewardItem(MyEnt) {
	var result = -1
	[
		"item_quelling_blade",
		"item_bfury",
		"item_tango"
	].every(itemName => {
		let item = Game.GetAbilityByName(MyEnt, itemName)
		if(item !== undefined) {
			result = item
			return false
		}
		return true
	})
	
	return result
}

script = {
	name: "AutoDeward",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			AutoDewardF()
			Game.ScriptLogMsg("Script enabled: AutoDeward", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: AutoDeward", "#ff0000")
	},
	onDestroy: () => enabled = false
}