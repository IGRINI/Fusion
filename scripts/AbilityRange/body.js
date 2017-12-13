function InventoryChanged(data) {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	
	Fusion.Particles.AbilityRange.forEach((par, abil) => {
		Particles.DestroyParticleEffect(par, true)

		var Range = Abilities.GetCastRangeFix(abil)
		if (!Range || Range <= 0) {
			Fusion.Particles.AbilityRange.delete(abil)
			return
		}
		
		par = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW , MyEnt)
		Fusion.Particles.AbilityRange.set(abil, par)
		Particles.SetParticleControl(par, 1,  [Range, 0, 0])
	})
}

function Destroy() {
	if(Fusion.Panels.AbilityRange)
		Fusion.Panels.AbilityRange.DeleteAsync(0)
	if(Fusion.Subscribes.AbilityRange)
		Fusion.Subscribes.AbilityRange.forEach(sub => GameEvents.Unsubscribe(sub)) // Optimize this line by native
	if(Fusion.Particles.AbilityRange)
		Fusion.Particles.AbilityRange.forEach(par => Particles.DestroyParticleEffect(par, true))
	Fusion.Subscribes.AbilityRange = []
	Fusion.Particles.AbilityRange = new Map()
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
	var par = Fusion.Particles.AbilityRange.get(LearnedAbil)
	if(par) {
		Particles.DestroyParticleEffect(par, true)
		par = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW , MyEnt)
		Fusion.Particles.AbilityRange.set(LearnedAbil, par)
		Particles.SetParticleControl(par, 1,  [Range,0,0])
	}
	CheckBs = AbilityRangePanel.Children()
	for(c=0;c<CheckBs.length;c++){
		Abil = CheckBs[c].GetAttributeInt("Skill", 0)
		if ( Abil == LearnedAbil )
			return
	}
	var CheckB = $.CreatePanel( "ToggleButton", AbilityRangePanel, "AbilityRangeSkill" )
	CheckB.BLoadLayoutFromString("<root>\
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
		if (Checked)
			if(!Fusion.Particles.AbilityRange.has(Abil)) {
				var par = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW , MyEnt)
				Fusion.Particles.AbilityRange.set(Abil, par)
				Particles.SetParticleControl(par, 1, [Abilities.GetCastRangeFix(Abil), 0, 0])
			}
		else
			if(Fusion.Particles.AbilityRange.has(Abil)) {
				Particles.DestroyParticleEffect(Fusion.Particles.AbilityRange.get(Abil), true)
				Fusion.Particles.AbilityRange.delete(Abil)
			}
	}
}

function onToggleF(checkbox) {
	if (checkbox.checked) {
		var MyID = Game.GetLocalPlayerID()
		MyEnt = Players.GetPlayerHeroEntityIndex(MyID)
		if ( MyEnt==-1 ){
			checkbox.checked = false
			Destroy()
			return
		}
		Fusion.Panels.AbilityRange = $.CreatePanel( "Panel", Fusion.Panels.Main, "AbilityRangePanel" )
		Fusion.Panels.AbilityRange.BLoadLayoutFromString("<root>\
	<Panel class='AbilityRangePanel' style='flow-children: down;background-color:#00000099;border-radius:15px;padding:20px 0;'>\
	</Panel>\
</root>", false, false)
		GameUI.MovePanel(Fusion.Panels.AbilityRange, p => {
			var position = Fusion.Panels.AbilityRange.style.position.split(" ")
			Fusion.Configs.AbilityRange.MainPanel.x = position[0]
			Fusion.Configs.AbilityRange.MainPanel.y = position[1]
			Fusion.SaveConfig("AbilityRange", Fusion.Configs.AbilityRange)
		})
		Fusion.GetConfig("AbilityRange").then(config => {
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
		for (var i = 0; i < Entities.GetAbilityCount(MyEnt ); i++){
			Abil = Entities.GetAbility(MyEnt,i)
			if ( Abil == -1 )
				continue
			if (Abilities.GetAbilityName(Abil) == "attribute_bonus" || Abilities.GetCastRangeFix(Abil) <= 0)
				continue
			Behavior = Abilities.GetBehavior( Abil )
			CheckB = $.CreatePanel( "ToggleButton", AbilityRangePanel, "AbilityRangeSkill" )
			CheckB.BLoadLayoutFromString("<root>\
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
}

script = {
	name: "AbilityRange",
	isVisible: false, // FIXIT
	onPreload: Destroy, // as it defines our globals
	onToggle: onToggleF,
	onDestroy: Destroy
}