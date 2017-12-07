if(Fusion.Panels.EzProcast)
	Fusion.Panels.EzProcast.DeleteAsync(0)

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
			var Ab = Entities.GetAbility(MyEnt, i)
			if( !Abilities.IsDisplayedAbility(Ab) || Abilities.IsPassive(Ab) )
				continue
			var P = $.CreatePanel("Panel", Fusion.Panels.EzProcast.Children()[0], "EzProcastItems")
			P.BLoadLayoutFromString("\
<root>\
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
			P.Children()[0].abilityname = Abilities.GetAbilityName(Ab)
		}
		Game.GetInventory(MyEnt)
			.filter(item => Behaviors.indexOf(2) === -1)
			.forEach(item => {
				Behaviors = Fusion.Behaviors(item)
				var P = $.CreatePanel( "Panel", Fusion.Panels.EzProcast.Children()[0], "EzProcast1Items2" )
				P.BLoadLayoutFromString("\
<root>\
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
				P.Children()[0].itemname = Abilities.GetAbilityName(item)
		})
	});
}

function onPreloadF() {
	if(Fusion.Commands.EzProcastF)
		return
	Fusion.Commands.EzProcastF = () => {
		var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
		var EntOnCursor = GameUI.FindScreenEntities( GameUI.GetCursorPosition() )
		var pos = Game.GetScreenCursonWorldVec()
		var items = Fusion.Panels.EzProcast.Children()[2].Children()
		var abils = []
		items.forEach(item => {
			if(item.Children()[0].paneltype === "DOTAAbilityImage")
				abils.push(item.Children()[0].abilityname)
			else
				if(item.Children()[0].paneltype === "DOTAItemImage")
					abils.push(item.Children()[0].itemname)
		})
		//$.Msg("Abils: "+abils)
		Game.EntStop(MyEnt)
		abils.forEach(AbName => {
			var Abil = Game.GetAbilityByName(MyEnt, AbName)
			var EzPBeh = Fusion.Behaviors(Abil)
			var EzPDUTT = Abilities.GetAbilityTargetTeam(Abil)
			//$.Msg("Team Target: "+EzPDUTT)
			//$.Msg("Ability Behavior: "+EzPBeh)
			if(EzPBeh.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_TOGGLE) !== -1)
				Game.ToggleAbil(MyEnt, Abil)
			else if(EzPBeh.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_NO_TARGET) !== -1)
				Game.CastNoTarget(MyEnt, Abil)
			else if(EzPBeh.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_POINT) !== -1)
				Game.CastPosition(MyEnt, Abil, pos)
			else if(AbName=="item_ethereal_blade") {
				if(EntOnCursor.length != 0)
					Game.CastTarget(MyEnt, Abil, EntOnCursor[0].entityIndex)
				else
					Game.CastTarget(MyEnt, Abil, MyEnt)
			} else if(EzPBeh.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_UNIT_TARGET) !== -1 || EzPBeh.length === 0) {
				if(parseInt(EzPDUTT) === 3 || parseInt(EzPDUTT) === 1)
					Game.CastTarget(MyEnt, Abil, MyEnt)
				else if(parseInt(EzPDUTT) !== -1 || parseInt(EzPDUTT) === 4)
					Game.CastTarget(MyEnt, Abil, MyEnt)
				else
					Game.CastTarget(MyEnt, Abil, MyEnt)
			}
		})
	}
	Game.AddCommand("__EzProcast", Fusion.Commands.EzProcastF, "",0)
}

return {
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
	onDestroy: () => Fusion.Panels.EzProcast.DeleteAsync(0)
}