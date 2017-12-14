function EzProcastOnOffLoad() {
	Fusion.GetXML("EzProcast/panel").then(layout_string => {
		Fusion.Panels.EzProcast = $.CreatePanel("Panel", Fusion.Panels.Main, "EzProcast")
		Fusion.Panels.EzProcast.BLoadLayoutFromString(layout_string, false, false)
		GameUI.MovePanel(Fusion.Panels.EzProcast, p => {
			var position = p.style.position.split(" ")
			Fusion.Configs.EzProcast.MainPanel.x = position[0]
			Fusion.Configs.EzProcast.MainPanel.y = position[1]
			Fusion.SaveConfig("EzProcast", Fusion.Configs.EzProcast)
		})
		Fusion.GetConfig("EzProcast").then(config => {
			Fusion.Configs.EzProcast = config
			Fusion.Panels.EzProcast.style.position = `${config.MainPanel.x} ${config.MainPanel.y} 0`
		})
		
		var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
		for(var i = 0; i < Entities.GetAbilityCount(MyEnt); i++) {
			var abil = Entities.GetAbility(MyEnt, i),
				abilName = Abilities.GetAbilityName(abil)
			
			if(!Abilities.IsDisplayedAbility(abil) || Abilities.IsPassive(abil))
				continue
			var P = $.CreatePanel("Panel", Fusion.Panels.EzProcast.Children()[0], "EzProcastAbil_" + abilName)
			P.BLoadLayoutFromString("<root>\
	<script>\
		function Add() {\
			Parent=$.GetContextPanel().GetParent().GetParent();\
			$.GetContextPanel().SetParent(Parent.Children()[2]);\
			$.GetContextPanel().SetPanelEvent('onactivate', function() {\
				Parent = $.GetContextPanel().GetParent().GetParent();\
				$.GetContextPanel().SetParent(Parent.Children()[0]);\
				$.GetContextPanel().SetPanelEvent('onactivate', Add)\
			})\
		}\
	</script>\
	<Panel style='border: 1px solid #000; border-radius: 10px;' onactivate='Add()'>\
		<DOTAAbilityImage/>\
	</Panel>\
</root>", false, false )
			P.Children()[0].abilityname = Abilities.GetAbilityName(abil)
		}
		Game.GetInventory(MyEnt)
			.filter(item => item !== -1 && Fusion.Behaviors(item).indexOf(2) === -1)
			.forEach(item => {
				var itemName = Abilities.GetAbilityName(item),
					P = $.CreatePanel("Panel", Fusion.Panels.EzProcast.Children()[0], "EzProcast1Item_" + itemName)
				P.BLoadLayoutFromString("<root>\
	<script>\
		function Add() {\
			Parent = $.GetContextPanel().GetParent().GetParent();\
			$.GetContextPanel().SetParent(Parent.Children()[2]);\
			$.GetContextPanel().SetPanelEvent('onactivate', function() {\
				Parent=$.GetContextPanel().GetParent().GetParent();\
				$.GetContextPanel().SetParent(Parent.Children()[0]);\
				$.GetContextPanel().SetPanelEvent('onactivate', Add)\
			})\
		}\
	</script>\
	<Panel style='border: 1px solid #000; border-radius: 10px;' onactivate='Add()'>\
		<DOTAItemImage/>\
	</Panel>\
</root>", false, false )
				P.Children()[0].itemname = itemName
		})
	});
}

function onPreloadF() {
	if(Fusion.Commands.EzProcastF)
		return
	Fusion.Commands.EzProcastF = () => {
		var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()),
			EntOnCursor = GameUI.FindScreenEntitiesAtCursor(),
			pos = Game.GetScreenCursonWorldVec(),
			abils = Fusion.Panels.EzProcast.Children()[2].Children().map(item => {
				if(item.Children()[0].paneltype === "DOTAAbilityImage")
					return item.Children()[0].abilityname
				else
					if(item.Children()[0].paneltype === "DOTAItemImage")
						return item.Children()[0].itemname
				
				return undefined
			}).filter(abil => abil !== undefined)
		
		//$.Msg("Abils: "+abils)
		Game.EntStop(MyEnt)
		abils.forEach(AbName => {
			var Abil = Game.GetAbilityByName(MyEnt, AbName)
			var Behaviors = Fusion.Behaviors(Abil)
			var TargetTeam = Fusion.RepresentBehavior(Abilities.GetAbilityTargetTeam(Abil))
			//$.Msg("Team Target: "+EzPDUTT)
			//$.Msg("Ability Behavior: "+EzPBeh)
			if(Behaviors.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_TOGGLE) !== -1)
				Game.ToggleAbil(MyEnt, Abil)
			else if(Behaviors.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_NO_TARGET) !== -1)
				Game.CastNoTarget(MyEnt, Abil)
			else if(Behaviors.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_POINT) !== -1)
				Game.CastPosition(MyEnt, Abil, pos)
			else if(AbName === "item_ethereal_blade") {
				if(EntOnCursor.length != 0)
					Game.CastTarget(MyEnt, Abil, EntOnCursor[0])
				else
					Game.CastTarget(MyEnt, Abil, MyEnt)
			} else if(Behaviors.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_UNIT_TARGET) !== -1 || Behaviors.length === 0) {
				if(TargetTeam.indexOf(DOTA_UNIT_TARGET_TEAM.DOTA_UNIT_TARGET_TEAM_FRIENDLY) >= 0 || TargetTeam === DOTA_UNIT_TARGET_TEAM.DOTA_UNIT_TARGET_TEAM_NONE)
					Game.CastTarget(MyEnt, Abil, MyEnt)
				else if(TargetTeam !== -1 || TargetTeam === DOTA_UNIT_TARGET_TEAM.DOTA_UNIT_TARGET_TEAM_CUSTOM)
					Game.CastTarget(MyEnt, Abil, MyEnt)
				else
					Game.CastTarget(MyEnt, Abil, MyEnt)
			}
		})
	}
	Game.AddCommand("__EzProcast", Fusion.Commands.EzProcastF, "",0)
	Game.AddCommand("__ToggleEzProcast", () => Fusion.Panels.EzProcast.visible = !Fusion.Panels.EzProcast.visible, "",0)
}

script = {
	name: "EzProcast",
	onPreload: onPreloadF,
	onToggle: checkbox => {
		if (checkbox.checked) {
			EzProcastOnOffLoad()
			Game.ScriptLogMsg("Script enabled: EzProcast", "#00ff00")
		} else {
			Fusion.Panels.EzProcast.DeleteAsync(0)
			Game.ScriptLogMsg("Script disabled: EzProcast", "#ff0000")
		}
	},
	onDestroy: () => {
		if(Fusion.Panels.EzProcast) {
			Fusion.Panels.EzProcast.DeleteAsync(0)
			delete Fusion.Panels.EzProcast
		}
	}
}