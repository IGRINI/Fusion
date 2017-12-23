var enabled = false,
	flag = false

function WardBuyTrollOnInterval() {
	WardBuyTrollF()

	if(enabled)
		$.Schedule(Fusion.MyTick, WardBuyTrollOnInterval)
}

function WardBuyTrollF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(!Entities.IsAlive(MyEnt))
		return

	if(flag)
		Game.SellItem(MyEnt, GetItemAnywhere(MyEnt, "item_ward_observer"))
	else
		Game.PurchaseItem(MyEnt, 42)

	flag = !flag
}

function GetItemAnywhere(ent, name) { // searches for item in inventory, backpack + stash
	for(var i = 0; i < 15; i++) {
		var item = Entities.GetItemInSlot(ent, i)
		if(Abilities.GetAbilityName(item) === name)
			return item
	}
}

script = {
	name: "WardBuyTroll",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			WardBuyTrollOnInterval()
			Game.ScriptLogMsg("Script enabled: WardBuyTroll", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: WardBuyTroll", "#ff0000")
	},
	onDestroy: () => enabled = false
}