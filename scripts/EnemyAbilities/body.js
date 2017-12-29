//idea and base (c) github.com/IGRINI 2017
var MainHud = Fusion.Panels.Main.HUDElements,
	enabled = false,
	latestEnemy, abpanel_layout, lvlpanel_layout,itm_layout;

function DeleteAll() {
	if (Fusion.Panels.EnemyAbilities)
		Fusion.Panels.EnemyAbilities.forEach(([abilPanel, lvlPanels]) => {
			abilPanel.DeleteAsync(0)
			lvlPanels.forEach(lvlPanel => lvlPanel.DeleteAsync(0))
		})
	if (Fusion.Panels.EnemyItems)
		Fusion.Panels.EnemyItems.forEach((panel) => {
			panel.DeleteAsync(0)
		})
	Fusion.Panels.EnemyAbilities = new Map()
	Fusion.Panels.EnemyItems = new Map()
}

function EnemyAbilitiesOnInterval() {
	EnemyAbilitiesF()

	if(enabled)
		$.Schedule(Fusion.MyTick, EnemyAbilitiesOnInterval)
}

function EnemyAbilitiesF() {
	var selectedEnt = Players.GetLocalPlayerPortraitUnit()
	if(!Entities.IsEnemy(selectedEnt)) {
		if(latestEnemy) {
			DeleteAll()
			latestEnemy = false
		}
		return
	}
	latestEnemy = true
	var abcount = Entities.GetAbilityCount(selectedEnt),
		generic = 0
	for (var abilNum = 0; abilNum < abcount && abilNum <= 5; abilNum++) {
		var ability = Entities.GetAbility(selectedEnt, abilNum)
		if(Abilities.GetAbilityName(ability) === "generic_hidden") {
			generic++
			continue
		}

		var abilCD = Abilities.GetCooldownTimeRemaining(ability),
			abilMaxCD = Abilities.GetCooldown(ability),
			abilLevel = Abilities.GetLevel(ability),
			abilMaxLevel = Abilities.GetMaxLevel(ability),
			abilManaCost = Abilities.GetManaCost(ability),
			curMana = Entities.GetMana(selectedEnt),
			abilLayout = MainHud.FindChildTraverse("abilities").FindChild(`Ability${abilNum - generic}`)
		if(!abilLayout)
			continue
		var lvlPanelContainer = abilLayout.FindChildTraverse("AbilityLevelContainer")
		if(!Fusion.Panels.EnemyAbilities.has(`abpanel${abilNum-generic}`)) {
			var abilButton = abilLayout.FindChildTraverse("AbilityButton"),
				abpanel = $.CreatePanel("Panel", abilButton, "abpanel")
			abpanel.BLoadLayoutFromString(abpanel_layout, false, false)
			abilButton.MoveChildBefore(abpanel, abilButton.FindChild("AbilityBevel")) // quichhack to move our abpanel before AbilityBevel
			Fusion.Panels.EnemyAbilities.set(`abpanel${abilNum - generic}`, [abpanel, lvlPanelContainer.Children()])
		}
		var [abPanel, lvlPanels] = Fusion.Panels.EnemyAbilities.get(`abpanel${abilNum-generic}`)
		if(abilCD > 0)
		{
			abPanel.FindChild("cooldown").text = Math.ceil(abilCD)
			abPanel.FindChild("cooldownoverlay").visible = true
			abPanel.FindChild("cooldownoverlay").style.clip = `radial( 50.0% 50.0%, 0.0deg, -${Math.ceil(abilCD/abilMaxCD*360)}.0deg)`
		}
		else
		{
			abPanel.FindChild("cooldown").text = ""
			abPanel.FindChild("cooldownoverlay").visible = false
		}
		if(abilManaCost > curMana)
			abPanel.FindChild("nomana").visible = true
		else
			abPanel.FindChild("nomana").visible = false
		if(lvlPanels.length < abilMaxLevel) {
			for(var i = 0; i < abilMaxLevel - lvlPanels.length; i++) {
				var lvlPanel = $.CreatePanel("Panel", lvlPanelContainer, `LevelUp${i}`)
				lvlPanel.BLoadLayoutFromString(lvlpanel_layout, false, false)
				lvlPanels.push(lvlPanel)
			}
			Fusion.Panels.EnemyAbilities.set(`abpanel${abilNum-generic}`, [abPanel, lvlPanels])
		}
		lvlPanels.forEach((lvlPanel, i) => {
			lvlPanel.visible = abilMaxLevel - i - 1 > -1
			lvlPanel.SetHasClass("active_level", abilLevel - i - 1 > -1)
		})
	}
	var Inv = Game.GetInHeroItems(selectedEnt);
		/*Stash = Game.GetStashItems(selectedEnt),
		stashPanel = MainHud.FindChildTraverse(`stash`);*/
	for (var n in Inv) {
		if (Inv[n] === -1) 
		{
			if(Fusion.Panels.EnemyItems.has(`itemPanel${n}`)){			//Шобы при перетаскивании предметов не оставались панельки с кд
				Fusion.Panels.EnemyItems.get(`itemPanel${n}`).DeleteAsync(0)
				Fusion.Panels.EnemyItems.delete(`itemPanel${n}`);
			}
			continue;
		}
		if(!Fusion.Panels.EnemyItems.has(`itemPanel${n}`)) {
			var slot = MainHud.FindChildTraverse(`inventory_slot_${n}`).FindChildTraverse("AbilityButton")
			var itemPanel = $.CreatePanel("Panel", slot, `itemPanel${n}`);
			itemPanel.BLoadLayoutFromString(itm_layout, false, false)
			Fusion.Panels.EnemyItems.set(`itemPanel${n}`, itemPanel)
		}
		var itemPanel = Fusion.Panels.EnemyItems.get(`itemPanel${n}`),
			itemCD = Abilities.GetCooldownTimeRemaining(Inv[n]),
			itemMaxCD = Abilities.GetCooldown(Inv[n]),
			itemManaCost = Abilities.GetManaCost(Inv[n]),
			curMana = Entities.GetMana(selectedEnt);
		if(itemCD > 0)
		{
			itemPanel.FindChild("cooldown").text = Math.ceil(itemCD)
			itemPanel.FindChild("cooldownoverlay").visible = true
			itemPanel.FindChild("cooldownoverlay").style.clip = `radial( 50.0% 50.0%, 0.0deg, -${Math.ceil(itemCD/itemMaxCD*360)}.0deg)`
		}
		else
		{
			itemPanel.FindChild("cooldown").text = ""
			itemPanel.FindChild("cooldownoverlay").visible = false
		}
		if(itemManaCost > curMana)
			itemPanel.FindChild("nomana").visible = true
		else
			itemPanel.FindChild("nomana").visible = false
	}
	/*for (var n in Stash) {
		var itemNum = n + 9;
		if (Stash[n] === -1) 
		{
			if(Fusion.Panels.EnemyItems.has(`itemPanel${itemNum}`)){
				Fusion.Panels.EnemyItems.get(`itemPanel${itemNum}`).DeleteAsync(0)
				Fusion.Panels.EnemyItems.delete(`itemPanel${itemNum}`);
			}
			continue;
		}
		if(!Fusion.Panels.EnemyItems.has(`itemPanel${itemNum}`)) {
			var slot = stashPanel.FindChildTraverse(`inventory_slot_${n}`).FindChildTraverse("AbilityButton")
			slot.FindChildTraverse("ItemImage").itemname = Abilities.GetAbilityName(Stash[n])
			var itemPanel = $.CreatePanel("Panel", slot, `itemPanel${itemNum}`)
			itemPanel.BLoadLayoutFromString(itm_layout, false, false)
			Fusion.Panels.EnemyItems.set(`itemPanel${itemNum}`, itemPanel)
		}
		var itemPanel = Fusion.Panels.EnemyItems.get(`itemPanel${itemNum}`),
			itemCD = Abilities.GetCooldownTimeRemaining(Stash[n]),
			itemMaxCD = Abilities.GetCooldown(Stash[n]),
			itemManaCost = Abilities.GetManaCost(Stash[n]),
			curMana = Entities.GetMana(selectedEnt);
		if(itemCD > 0)
		{
			itemPanel.FindChild("cooldown").text = Math.ceil(itemCD)
			itemPanel.FindChild("cooldownoverlay").visible = true
			itemPanel.FindChild("cooldownoverlay").style.clip = `radial( 50.0% 50.0%, 0.0deg, -${Math.ceil(itemCD/itemMaxCD*360)}.0deg)`
		}
		else
		{
			itemPanel.FindChild("cooldown").text = ""
			itemPanel.FindChild("cooldownoverlay").visible = false
		}
		if(itemManaCost > curMana)
			itemPanel.FindChild("nomana").visible = true
		else
			itemPanel.FindChild("nomana").visible = false
		stashPanel.SetHasClass('StashVisible',true)
	}*/
}

script = {
	name: "EnemyAbilities",
	isVisible: false,
	onPreload: () => {
		DeleteAll() // as it defines variables
		Fusion.GetXML("EnemyAbilities/abpanel").then(xml => abpanel_layout = xml).then(() => Fusion.GetXML("EnemyAbilities/lvlpanel").then(xml => lvlpanel_layout = xml).then(() => Fusion.GetXML("EnemyAbilities/itm").then(xml => itm_layout = xml).then(() => {
			enabled = true
			EnemyAbilitiesOnInterval()
		})))
	},
	onDestroy: () => {
		enabled = false
		DeleteAll()
	}
}
