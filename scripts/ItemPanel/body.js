if(Fusion.Panels.ItemPanel)
	Fusion.Panels.ItemPanel.DeleteAsync(0)
Fusion.ItemPanel = []

NewItem = (oldinv, newinv, ent) => {
	newinv.forEach(n => {
		if(oldinv.indexOf(n) === -1 && Fusion.Configs.ItemPanel.Items.indexOf(Abilities.GetAbilityName(n)) > -1){
			if(Fusion.Configs.ItemPanel.Notify === "true") {
				A = $.CreatePanel("Panel", Fusion.Panels.ItemPanel, `Alert${ent + n}`)
				A.BLoadLayoutFromString("\
<root>\
	<Panel style='width:100%;height:37px;background-color:#111;'>\
		<DOTAHeroImage heroname='' style='vertical-align:center;width:60px;height:35px;position:0px;'/>\
		<DOTAItemImage itemname='' style='vertical-align:center;width:60px;height:35px;position:70px;'/>\
	</Panel>\
</root>\
				", false, false)
				A.Children()[0].heroname = Entities.GetUnitName(ent)
				A.Children()[1].itemname = Abilities.GetAbilityName(n)
				A.DeleteAsync(Fusion.Configs.ItemPanel.NotifyTime)
			}

			if (Fusion.Configs.ItemPanel.EmitSound === "true")
				Game.EmitSound("General.Buy")
		}
	})
}

ItemPanelEvery = () => {
	if (!ItemPanel.checked)
		return
	if(Game.GameStateIsBefore(DOTA_GameState.DOTA_GAMERULES_STATE_PRE_GAME)) {
		ItemPanel.checked = false
		Game.ScriptLogMsg("ItemPanel cannot be enabled before pre-game", "#ff0000")
		ItemPanelLoadOnOff()
		return
	}
	Game.GetAllPlayerIDs()
		.map(playerID => Players.GetPlayerHeroEntityIndex(IDs[i]))
		.filter(ent => Entities.IsEnemy(Ent))
		.forEach(ent => {
			var P = Fusion.Panels.ItemPanel.Children()[k]
			P.style.height = "24px"
			P.Children()[0].heroname = Entities.GetUnitName(Ent)
			var Inv = Game.GetInventory(Ent)
			if(Fusion.ItemPanel[Ent] === undefined)
				Fusion.ItemPanel[Ent] = []
			if (Array.isArray(Fusion.ItemPanel[Ent]))
				if(Game.CompareArrays(Fusion.ItemPanel[Ent], Inv))
					continue
			NewItem(Fusion.ItemPanel[Ent], Inv, Ent)
			Fusion.ItemPanel[Ent] = Inv
			P.Children().forEach(child => child.itemname = "")
			for(var n in Inv)
				P.Children()[n + 1].itemname = Abilities.GetAbilityName(Inv[n])
		})
	if(ItemPanel.checked)
		$.Schedule(Fusion.MyTick, ItemPanelEvery)
}

ItemPanelLoad = () => {
	Fusion.GetXML("ItemPanel/panel", a => {
		Fusion.Panels.ItemPanel = $.CreatePanel("Panel", Fusion.Panels.Main, "ItemPanel1")
		Fusion.Panels.ItemPanel.BLoadLayoutFromString(a, false, false)
		Fusion.Panels.ItemPanel.Children().forEach(child => child.style.height = "0")
		GameUI.MovePanel(Fusion.Panels.ItemPanel, p => {
			var position = p.style.position.split(" ")
			Fusion.Configs.ItemPanel.MainPanel.x = position[0]
			Fusion.Configs.ItemPanel.MainPanel.y = position[1]
			Fusion.SaveConfig("ItemPanel", Fusion.Configs.ItemPanel)
		})
		
		Fusion.GetConfig("ItemPanel", config => {
			Fusion.Configs.ItemPanel = config
			Fusion.Panels.ItemPanel.style.position = `${config.MainPanel.x} ${config.MainPanel.y} 0`
			ItemPanelEvery()
		})
	})
}

ItemPanelLoadOnOff = () => {
	if (ItemPanel.checked) {
		ItemPanelLoad()
		Game.ScriptLogMsg("Script enabled: ItemPanel", "#00ff00")
	} else {
		Fusion.ItemPanel = []
		if(Fusion.Panels.ItemPanel)
			Fusion.Panels.ItemPanel.DeleteAsync(0)
		Game.ScriptLogMsg("Script disabled: ItemPanel", "#ff0000")
	}
}

var ItemPanel = Fusion.AddScript("ItemPanel", ItemPanelLoadOnOff)