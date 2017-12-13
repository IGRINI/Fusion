var enabled = false,
	flag = false,
	items = [
		["item_ward_observer", 42],
		["item_ward_sentry", 43]
	],
	latestItem

function WardBuyTrollOnInterval() {
	WardBuyTrollF()

	if(enabled)
		$.Schedule(Fusion.MyTick * 4, WardBuyTrollOnInterval)
}

function WardBuyTrollF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())

	if(flag)
		Game.SellItem(MyEnt, Game.GetAbilityByName(MyEnt, latestItem))
	else {
		var item = items[Math.floor(Math.random() * items.length)]
		latestItem = item[0]
		Game.PurchaseItem(MyEnt, item[1])
	}

	flag = !flag
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