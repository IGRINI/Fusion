var MainAbilitiesHud = Fusion.Panels.Main.HUDElements.FindChildTraverse("abilities"),
	enabled = false,
	curEnt, latestEnemy, abpanel_layout

function DeleteAll() {
	if (Fusion.Panels.EnemyAbilities)
		Fusion.Panels.EnemyAbilities.forEach(panel => panel.DeleteAsync(0))
	Fusion.Panels.EnemyAbilities = new Map()
}

function EATick() {
	curEnt = Players.GetLocalPlayerPortraitUnit()
	if (Entities.IsEnemy(curEnt)) {
		latestEnemy = true
		var abcount = Entities.GetAbilityCount(curEnt),
			generic = 0
		for (var abilNum = 0; abilNum < abcount - 1 && abilNum <= 5; abilNum++) {
			var ability = Entities.GetAbility(curEnt, abilNum)
			if(Abilities.GetAbilityName(ability) != "generic_hidden") {
				generic++
				continue
			}

			var abilCD = Abilities.GetCooldownTimeRemaining(ability),
				abilLevel = Abilities.GetLevel(ability),
				abilMaxLevel = Abilities.GetMaxLevel(ability),
				abilManaCost = Abilities.GetManaCost(ability),
				curMana = Entities.GetMana(curEnt)
			
			if(Fusion.Panels.EnemyAbilities.has(`abpanel${abilNum-generic}`)) {
				var abpanel = Fusion.Panels.EnemyAbilities.get(`abpanel${abilNum-generic}`)
				if(abilCD > 0)
					abpanel.Children()[0].text = Math.round(abilCD)
				else
					abpanel.Children()[0].text = ""
				abpanel.Children()[1].text = `${abilLevel}/${abilMaxLevel}`
				if(abilManaCost > curMana)
					abpanel.Children()[2].visible = true
				else
					abpanel.Children()[2].visible = false
			} else {
				var ablayout = MainAbilitiesHud.FindChild(`Ability${abilNum-generic}`).FindChild("ButtonAndLevel")
				if(ablayout) {
					var abpanel = $.CreatePanel("Panel", ablayout, `abpanel${abilNum-generic}`)
					abpanel.BLoadLayoutFromString(abpanel_layout, false, false)
					abpanel.Children()[0].text = abilCD
					abpanel.Children()[1].text = `${abilLevel}/${abilMaxLevel}`
					if(abilManaCost > curMana)
						abpanel.Children()[2].visible = true
					else
						abpanel.Children()[2].visible = false
					Fusion.Panels.EnemyAbilities.set(`abpanel${abilNum-generic}`, abpanel)
				}
			}
		}
	} else {
		latestEnemy = false
		DeleteAll()
	}
	if(enabled)
		$.Schedule(Fusion.MyTick, EATick)
	else
		if(latestEnemy)
			DeleteAll()
}

script = {
	name: "EnemyAbilities",
	onPreload: () => {
		DeleteAll() // as it defines variables
		Fusion.GetXML("EnemyAbilities/abpanel").then(xml => abpanel_layout = xml)
	},
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			EATick()
			Game.ScriptLogMsg("Script enabled: EnemyAbilities", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: EnemyAbilities", "#ff0000")
	},
	onDestroy: () => {
		enabled = false
		DeleteAll()
	}
}
