﻿function InventoryChanged(data) {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Fusion.Particles.AbilityRange.length == 0)
		return
	
	Fusion.Particles.AbilityRange.forEach((par, abil) => {
		var Range = Abilities.GetCastRangeFix(abil)
		Particles.DestroyParticleEffect(par, true)
		if (!Range || Range <= 0)
			return
		Fusion.Particles.AbilityRange[abil] = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW , MyEnt)
		Particles.SetParticleControl(Fusion.Particles.AbilityRange[abil], 1,  [Range,0,0])
	})
	for(var i in Fusion.Particles.AbilityRange) {
	}
}

function Destroy() {
	if(Fusion.Panels.AbilityRange)
		Fusion.Panels.AbilityRange.DeleteAsync(0)
	if(Fusion.Subscribes.AbilityRange)
		Fusion.Subscribes.AbilityRange.forEach(GameEvents.Unsubscribe)
	if(Fusion.Particles.AbilityRange)
		Fusion.Particles.AbilityRange.forEach(Particles.DestroyParticleEffect)
	Fusion.Subscribes.AbilityRange = []
	Fusion.Particles.AbilityRange = []
	delete Fusion.Panels.AbilityRange
}

function SkillLearned(data) {
	var MyID = Game.GetLocalPlayerID()
	var MyEnt = Players.GetPlayerHeroEntityIndex(MyID)
	if (data.PlayerID != MyID)
		return
	var LearnedAbil = Entities.GetAbilityByName(MyEnt, data.abilityname)
	if ( LearnedAbil == -1 )
		return
	var Range = Abilities.GetCastRangeFix(LearnedAbil)
	if (data.abilityname === "attribute_bonus" || Range <= 0)
		return
	if (Fusion.Particles.AbilityRange[LearnedAbil]){
		Particles.DestroyParticleEffect(Fusion.Particles.AbilityRange[LearnedAbil], true)
		Fusion.Particles.AbilityRange[LearnedAbil] = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW , MyEnt)
		Particles.SetParticleControl(Fusion.Particles.AbilityRange[LearnedAbil], 1,  [Range,0,0])
	}
	CheckBs = AbilityRangePanel.Children()
	for(c=0;c<CheckBs.length;c++){
		Abil = CheckBs[c].GetAttributeInt("Skill", 0)
		if ( Abil == LearnedAbil )
			return
	}
	var CheckB = $.CreatePanel( "ToggleButton", AbilityRangePanel, "AbilityRangeSkill" )
	CheckB.BLoadLayoutFromString("\
<root>\
	<styles>\
		<include src='s2r://panorama/styles/magadan.css'/>\
		<include src='s2r://panorama/styles/dotastyles.vcss_c'/>\
	</styles>\
	<Panel>\
		<ToggleButton class='CheckBox' style='vertical-align:center;'/>\
		<DOTAAbilityImage style='width:30px;margin:30px;border-radius:15px;'/>\
	</Panel>\
</root>", false, false)  
	CheckB.Children()[1].abilityname = Abilities.GetAbilityName(LearnedAbil)
	CheckB.SetAttributeInt("Skill", LearnedAbil)
	CheckB.SetPanelEvent( "onactivate", chkboxpressed )
}

function chkboxpressed() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var CheckBs = AbilityRangePanel.Children()
	for(c=0;c<CheckBs.length;c++){
		var Checked = CheckBs[c].Children()[0].checked
		var Abil = CheckBs[c].GetAttributeInt("Skill", 0)
		if (Abil == 0 )
			continue
		if (Checked){
			if (!Fusion.Particles.AbilityRange[Abil]){
				Fusion.Particles.AbilityRange[Abil] = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW , MyEnt)
				Range = Abilities.GetCastRangeFix(Abil)
				Particles.SetParticleControl(Fusion.Particles.AbilityRange[Abil], 1,  [Range,0,0])
			}
		}else{
			if (Fusion.Particles.AbilityRange[Abil]){
				Particles.DestroyParticleEffect(Fusion.Particles.AbilityRange[Abil], true)
				Fusion.Particles.AbilityRange.splice(Abil, i)
			}
		}
	}
}

Destroy()
var AbilityRange = Fusion.AddScript("AbilityRange", () => {
	if (AbilityRange.checked) {
		var MyID = Game.GetLocalPlayerID()
		if ( MyID==-1 ){
			AbilityRange.checked = false
			Destroy()
			return
		}
		MyEnt = Players.GetPlayerHeroEntityIndex(MyID)
		if ( MyEnt==-1 ){
			AbilityRange.checked = false
			Destroy()
			return
		}
		Fusion.Panels.AbilityRange = $.CreatePanel( "Panel", Fusion.Panels.Main, "AbilityRangePanel" )
		Fusion.Panels.AbilityRange.BLoadLayoutFromString("\
<root>\
	<Panel class='AbilityRangePanel' style='flow-children: down;background-color:#00000099;border-radius:15px;padding:20px 0;'>\
	</Panel>\
</root>", false, false)
		GameUI.MovePanel(Fusion.Panels.AbilityRange, p => {
			var position = Fusion.Panels.AbilityRange.style.position.split(" ")
			Fusion.Configs.AbilityRange.MainPanel.x = position[0]
			Fusion.Configs.AbilityRange.MainPanel.y = position[1]
			Fusion.SaveConfig("AbilityRange", Fusion.Configs.AbilityRange)
		})
		Fusion.GetConfig("AbilityRange", config => {
			Fusion.Configs.AbilityRange = config
			Fusion.Panels.AbilityRange.style.position = `${config.MainPanel.x} ${config.MainPanel.y} 0`
			Fusion.Panels.AbilityRange.style.flowChildren = config.MainPanel.flow
		})
		if(!Fusion.Commands.AbilityRange_Rotate) {
			Fusion.Commands.AbilityRange_Rotate = () => {
				var panel = Fusion.Panels.AbilityRange
				if (panel.style.flowChildren == "right")
					panel.style.flowChildren = "down"
				else
					panel.style.flowChildren = "right"
				Fusion.Configs.AbilityRange.MainPanel.flow = panel.style.flowChildren
				Fusion.SaveConfig("AbilityRange", Fusion.Configs.AbilityRange)
			}
			
			Game.AddCommand( "__AbilityRange_Rotate", Fusion.Commands.AbilityRange_Rotate, "",0)
		}
		AbilityRangePanel = Fusion.Panels.Main.FindChildrenWithClassTraverse("AbilityRangePanel")[0]
		for ( i = 0; i < Entities.GetAbilityCount(MyEnt ); i++){
			Abil = Entities.GetAbility(MyEnt,i)
			if ( Abil == -1 )
				continue
			Range = Abilities.GetCastRangeFix(Abil)
			if (Abilities.GetAbilityName(Abil) == "attribute_bonus" || Range<=0 )
				continue
			Behavior = Abilities.GetBehavior( Abil )
			CheckB = $.CreatePanel( "ToggleButton", AbilityRangePanel, "AbilityRangeSkill" )
			CheckB.BLoadLayoutFromString("\
	<root>\
		<styles>\
			<include src='s2r://panorama/styles/magadan.css'/>\
			<include src='s2r://panorama/styles/dotastyles.vcss_c'/>\
		</styles>\
		<Panel>\
			<ToggleButton class='CheckBox' style='vertical-align:center;'/>\
			<DOTAAbilityImage style='width:30px;margin:3px;border-radius:15px;'/>\
		</Panel>\
	</root>", false, false)
			CheckB.Children()[1].abilityname = Abilities.GetAbilityName(Abil)
			CheckB.SetAttributeInt("Skill", Abil)
			CheckB.SetPanelEvent( "onactivate", chkboxpressed )
		}
		Fusion.Subscribes.AbilityRange.push(GameEvents.Subscribe("dota_player_learned_ability", SkillLearned))
		Fusion.Subscribes.AbilityRange.push(GameEvents.Subscribe("dota_inventory_changed", InventoryChanged))
		Game.ScriptLogMsg("Script enabled: AbilityRange", "#00ff00")
	} else {
		Destroy()
		Game.ScriptLogMsg("Script disabled: AbilityRange", "#ff0000")
	}
})