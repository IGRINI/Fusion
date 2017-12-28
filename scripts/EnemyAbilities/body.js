var MainAbilitiesHud = Fusion.Panels.Main.HUDElements.FindChildTraverse("abilities"),
	enabled = false,	currentent = null;

function DeleteAll() {
	if (Fusion.Panels.EnemyAbilities) {
		for (var k in Fusion.Panels.EnemyAbilities) {
		    Fusion.Panels.EnemyAbilities[k].DeleteAsync(0);
		}
	}
	Fusion.Panels.EnemyAbilities = new Map()
}

function EATick() {
	currentent = Players.GetLocalPlayerPortraitUnit()
	if (Entities.GetTeamNumber(currentent) != Players.GetTeam(Players.GetLocalPlayer()))
	{
		var abcount = Entities.GetAbilityCount(currentent),
			generic = 0; 
			//Нужна для отсчета generic_hidden абилок, т.к. они занимают 3 и 4 слоты у почти всех героев
			//и т.к. у ульты айди в доте 5, а в панораме она отображается в слоте 3(если 4 скилла),
			//то уровень ульты через перебор уже не оторбразишь. Скорее всего я просто тупой и не додумался до лучшего, пофикси если лучше придумаешь.
		for (var abilNum = 0; abilNum < abcount - 1 && abilNum <= 5; abilNum++) {
			var ability = Entities.GetAbility(currentent, abilNum);
			if(Abilities.GetAbilityName(ability) != "generic_hidden")
			{
				var abpanel = Fusion.Panels.EnemyAbilities[`abpanel${abilNum-generic}`],
					abcoldown = Abilities.GetCooldownTimeRemaining(ability),
					ablevel = Abilities.GetLevel(ability),
					abmaxlevel = Abilities.GetMaxLevel(ability),
					abmanacost = Abilities.GetManaCost(ability),
					currentmana = Entities.GetMana(currentent);
				if(abpanel != null)
				{
					if(abcoldown>0)
						abpanel.Children()[0].text = abcoldown.toFixed(0)
					else
						abpanel.Children()[0].text = ""
					abpanel.Children()[1].text = `${ablevel}/${abmaxlevel}`
					if(abmanacost > currentmana)
						abpanel.Children()[2].style.visibility = `visible`
					else
						abpanel.Children()[2].style.visibility = `collapse`
				}
				else
				{
					var ablayout = MainAbilitiesHud.FindChild(`Ability${abilNum-generic}`).FindChild("ButtonAndLevel")
					if(ablayout != null)
					{
						Fusion.Panels.EnemyAbilities[`abpanel${abilNum-generic}`] = $.CreatePanel("Panel", ablayout, `abpanel${abilNum-generic}`)
						Fusion.Panels.EnemyAbilities[`abpanel${abilNum-generic}`].BLoadLayoutFromString("<root>\
															<Panel style='width:100%;height:100%;' hittest='false'>\
																<Label hittest='false' text='' style='text-align:center;color:white;font-size:20px;text-shadow:1px 1px 1px 2 #00000099;align:center center;'/>\
																<Label hittest='false' text='' style='margin-bottom:5%;text-align:center;color:white;font-size:20px;text-shadow:1px 1px 1px 2 #00000099;align:center center;'/>\
																<Panel hittest='false' style='background-color:blue;opacity:0.2;width:100%;height:100%;'/>\
															</Panel>\
														</root>", false, false)
						Fusion.Panels.EnemyAbilities[`abpanel${abilNum-generic}`].Children()[0].text = abcoldown
						Fusion.Panels.EnemyAbilities[`abpanel${abilNum-generic}`].Children()[1].text = `${ablevel}/${abmaxlevel}`
						if(abmanacost > currentmana)
							Fusion.Panels.EnemyAbilities[`abpanel${abilNum-generic}`].Children()[2].style.visibility = `visible`
						else
							Fusion.Panels.EnemyAbilities[`abpanel${abilNum-generic}`].Children()[2].style.visibility = `collapse`
					}
				}
			}
			else
			{
				generic++;
			}
		}
	}
	else
	{
		DeleteAll()
	}
	if(enabled)
		$.Schedule(Fusion.MyTick, EATick)
	else
		DeleteAll()
}

script = {
	name: "EnemyAbilities",
	onPreload: () => {
		DeleteAll()
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
