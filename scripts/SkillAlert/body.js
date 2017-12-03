var positionModifiers = {
	"modifier_invoker_sun_strike": [1.7, "npc_dota_hero_invoker", "invoker_sun_strike", "invoker_invo_ability_sunstrike_01"],
	"modifier_kunkka_torrent_thinker": [1.6, "npc_dota_hero_kunkka", "kunkka_torrent", "kunkka_kunk_ability_torrent_01"],
	"modifier_lina_light_strike_array": [0.5, "npc_dota_hero_lina", "lina_light_strike_array", " lina_lina_ability_lightstrike_02"],
	"modifier_leshrac_split_earth_thinker": [0.35, "npc_dota_hero_leshrac", "leshrac_split_earth", "leshrac_lesh_ability_split_05"]
}
var targetModifiers = {
	"modifier_spirit_breaker_charge_of_darkness_vision": ["particles/units/heroes/hero_spirit_breaker/spirit_breaker_charge_target_mark.vpcf", 1.5, "npc_dota_hero_spirit_breaker", "spirit_breaker_charge_of_darkness", "spirit_breaker_spir_ability_charge_17"],
	"modifier_tusk_snowball_visible": ["particles/units/heroes/hero_spirit_breaker/spirit_breaker_charge_target_mark.vpcf", 1.5, "npc_dota_hero_tusk", "tusk_snowball", " tusk_tusk_snowball_01"],
	"modifier_life_stealer_infest_effect": ["particles/units/heroes/hero_life_stealer/life_stealer_infested_unit_icon.vpcf", 1.5, "npc_dota_hero_life_stealer", "life_stealer_infest", "Hero_LifeStealer.Infest"],
	"modifier_life_stealer_assimilate_effect": ["particles/units/heroes/hero_life_stealer/life_stealer_infested_unit_icon.vpcf", 1.5, "npc_dota_hero_life_stealer", "life_stealer_assimilate", "Hero_LifeStealer.Assimilate.Target"]
}
var waitingPosModifiers = {
	"modifier_techies_suicide_leap": [1.5, "npc_dota_hero_techies", "techies_suicide", "Hero_Techies.Suicide.Arcana"]
}
var z = []
var panels = []

SAlertEvery = () => {
	if (!SkillAlert.checked)
		return
	
	Entities.GetAllEntitiesByName("npc_dota_thinker").map(thinker => {
		var vec = Entities.GetAbsOrigin(thinker)
		var buffsnames = Game.GetBuffsNames(thinker)
		if(buffsnames.length !== 2)
			return
		var buffName = buffsnames[1]
		var modifier = positionModifiers[buffName]
		if(modifier !== undefined)
			AlertPosition(modifier, vec, thinker)
	})
	
	Entities.GetAllEntities().filter(ent =>
		Entities.IsAlive(ent)
		&& !Entities.IsBuilding(ent)
	).forEach(ent => {
		var buffs = Game.GetBuffsNames(ent)
		var xyz = Entities.GetAbsOrigin(ent)
		
		buffs.forEach(buff => {
			var modifier = targetModifiers[buff]
			if(modifier !== undefined && modifier !== [])
				AlertTarget(modifier, ent)
			else {
				var modifier = waitingPosModifiers[buff]
				if(modifier !== undefined && modifier !== [])
					; //AlertTarget(modifier, ent) // AlertPosition
			}
		})
	})

	if(SkillAlert.checked)
		$.Schedule(Fusion.MyTick, SAlertEvery)
}

AlertTarget = (modifier, ent) => {
	CreateFollowParticle(modifier[0], modifier[1], ent)
	if(Fusion.Panels.ItemPanel !== undefined && Fusion.Configs.SkillAlert.Notify === "true" && panels[ent] === undefined) {
		var A = $.CreatePanel("Panel", Fusion.Panels.ItemPanel, `Alert${ent}`)
		A.BLoadLayoutFromString('\
<root>\
	<Panel style="width:100%;height:37px;background-color:#111;">\
		<DOTAHeroImage heroname="" style="vertical-align:center;width:60px;height:35px;position:0px;"/>\
		<DOTAAbilityImage abilityname="" style="vertical-align:center;width:60px;height:35px;position:60px;"/>\
		<DOTAHeroImage heroname="" style="vertical-align:center;width:60px;height:35px;position:120px;"/>\
	</Panel>\
</root>', false, false)
		A.Children()[0].heroname = modifier[2]
		A.Children()[1].abilityname = modifier[3]
		A.Children()[2].heroname = Entities.GetUnitName(ent)
		A.DeleteAsync(modifier[1])
		panels[ent] = A
		$.Schedule(modifier[1], () => panels.splice(ent, 1))
	}
	if(Fusion.Configs.SkillAlert.EmitSound === "true")
		Game.EmitSound(modifier[4])
}

AlertPosition = (modifier, vec, thinker) => {
	CreateTimerParticle(vec, modifier[0], thinker)
	if(Fusion.Panels.ItemPanel !== undefined && Fusion.Configs.SkillAlert.Notify === "true" && panels[thinker] === undefined) {
		var A = $.CreatePanel("Panel", Fusion.Panels.ItemPanel, `Alert${thinker}`)
		A.BLoadLayoutFromString("\
<root>\
	<Panel style='width:100%;height:37px;background-color:#111;'>\
		<DOTAHeroImage heroname='' style='vertical-align:center;width:60px;height:35px;position:0px;'/>\
		<DOTAAbilityImage abilityname='' style='vertical-align:center;width:60px;height:35px;position:60px;'/>\
	</Panel>\
</root>", false, false)
		A.Children()[0].heroname = modifier[1]
		A.Children()[1].abilityname = modifier[2]
		A.DeleteAsync(modifier[0])
		panels[thinker] = A
		$.Schedule(modifier[0], () => panels.splice(thinker, 1))
	}
	if (Fusion.Configs.SkillAlert.EmitSound === "true")
		Game.EmitSound(modifier[4])
}

CreateFollowParticle = (particlepath, time, ent) => {
	if(z.indexOf(ent) !== -1)
		return
	var p = Particles.CreateParticle(particlepath, ParticleAttachment_t.PATTACH_OVERHEAD_FOLLOW, ent)
	Particles.SetParticleControl(p, 0, 0)
	z.push(ent)
	$.Schedule (
		time + Fusion.MyTick,
		function() {
			Particles.DestroyParticleEffect(p, true)
			Fusion.arrayRemove(z, ent)
		}
	)
}

CreateTimerParticle = (vec, time, ent) => {
	if(z.indexOf(ent) !== -1)
		return
	var p = Particles.CreateParticle("particles/neutral_fx/roshan_spawn.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN, 0)
	Particles.SetParticleControl(p, 0, vec)
	z.push(ent)
	$.Schedule (
		time + Fusion.MyTick,
		() => {
			Particles.DestroyParticleEffect(p, true)
			Fusion.arrayRemove(z, ent)
		}
	)
}

SkillAlertToggle = () => {
	if (SkillAlert.checked) {
		Fusion.GetConfig("SkillAlert", config => {
			Fusion.Configs.SkillAlert = config
			SAlertEvery()
		})
		Game.ScriptLogMsg("Script enabled: SkillAlert", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: SkillAlert", "#ff0000")
}

var SkillAlert = Fusion.AddScript("SkillAlert", SkillAlertToggle)