// idea and base (c) github.com/IGRINI 2017
var MainAbilitiesHud = Fusion.Panels.Main.HUDElements.FindChildTraverse("abilities"),
	enabled = false,
	latestEnemy, abpanel_layout, lvlpanel_layout

function DeleteAll() {
	if (Fusion.Panels.EnemyAbilities)
		Fusion.Panels.EnemyAbilities.forEach(([abilPanel, lvlPanels]) => {
			abilPanel.DeleteAsync(0)
			lvlPanels.forEach(lvlPanel => lvlPanel.DeleteAsync(0))
		})
	Fusion.Panels.EnemyAbilities = new Map()
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
			abilLevel = Abilities.GetLevel(ability),
			abilMaxLevel = Abilities.GetMaxLevel(ability),
			abilManaCost = Abilities.GetManaCost(ability),
			curMana = Entities.GetMana(selectedEnt),
			abilLayout = MainAbilitiesHud.FindChild(`Ability${abilNum - generic}`)
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
			abPanel.FindChild("cooldown").text = Math.ceil(abilCD)
		else
			abPanel.FindChild("cooldown").text = ""
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
}

script = {
	name: "EnemyAbilities",
	isVisible: false,
	onPreload: () => {
		DeleteAll() // as it defines variables
		Fusion.GetXML("EnemyAbilities/abpanel").then(xml => abpanel_layout = xml).then(() => Fusion.GetXML("EnemyAbilities/lvlpanel").then(xml => lvlpanel_layout = xml).then(() => {
			enabled = true
			EnemyAbilitiesOnInterval()
		}))
	},
	onDestroy: () => {
		enabled = false
		DeleteAll()
	}
}
