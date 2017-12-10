var enabled = false
if(Fusion.Panels.ItemPanel)
	Fusion.Panels.ItemPanel.DeleteAsync(0)
Fusion.ItemPanel = []

function NewItem(oldinv, newinv, ent) {
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

function ItemPanelEvery() {
	if (!enabled)
		return
	
	if(Game.GameStateIsBefore(DOTA_GameState.DOTA_GAMERULES_STATE_PRE_GAME)) {
		ItemPanel.checked = false
		Game.ScriptLogMsg("ItemPanel cannot be enabled before pre-game", "#ff0000")
		ItemPanelLoadOnOff()
		return
	}
	var k = 0
	Entities.PlayersHeroEnts()
		.filter(ent => Entities.IsEnemy(ent))
		.forEach(ent => {
			var P = Fusion.Panels.ItemPanel.Children()[k]
			P.style.height = "24px"
			P.Children()[0].heroname = Entities.GetUnitName(ent)
			var Inv = Game.GetInventory(ent)
			if(Fusion.ItemPanel[ent] === undefined)
				Fusion.ItemPanel[ent] = []
			if (Array.isArray(Fusion.ItemPanel[ent]))
				if(Game.CompareArrays(Fusion.ItemPanel[ent], Inv)) {
					k++
					return
				}
			NewItem(Fusion.ItemPanel[ent], Inv, ent)
			Fusion.ItemPanel[ent] = Inv
			P.Children().forEach(child => child.itemname = "")
			for(var n in Inv)
				P.Children()[parseInt(n) + 1].itemname = Abilities.GetAbilityName(Inv[n])
			k++
		})
	
	if(ItemPanel.checked)
		$.Schedule(Fusion.MyTick, ItemPanelEvery)
}

function ItemPanelLoad() {
	Fusion.GetXML("ItemPanel/panel").then(a => {
		Fusion.Panels.ItemPanel = $.CreatePanel("Panel", Fusion.Panels.Main, "ItemPanel1")
		Fusion.Panels.ItemPanel.BLoadLayoutFromString(a, false, false)
		Fusion.Panels.ItemPanel.Children().forEach(child => child.style.height = "0")
		GameUI.MovePanel(Fusion.Panels.ItemPanel, p => {
			var position = p.style.position.split(" ")
			Fusion.Configs.ItemPanel.MainPanel.x = position[0]
			Fusion.Configs.ItemPanel.MainPanel.y = position[1]
			Fusion.SaveConfig("ItemPanel", Fusion.Configs.ItemPanel)
		})
		
		Fusion.GetConfig("ItemPanel").then(config => {
			Fusion.Configs.ItemPanel = config
			Fusion.Panels.ItemPanel.style.position = `${config.MainPanel.x} ${config.MainPanel.y} 0`
			ItemPanelEvery()
		})
	})
}

return {
	name: "ItemPanel",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (checkbox.checked) {
			ItemPanelLoad()
			Game.ScriptLogMsg("Script enabled: ItemPanel", "#00ff00")
		} else {
			Fusion.ItemPanel = []
			if(Fusion.Panels.ItemPanel)
				Fusion.Panels.ItemPanel.DeleteAsync(0)
			Game.ScriptLogMsg("Script disabled: ItemPanel", "#ff0000")
		}
	},
	onDestroy: () => enabled = false
}