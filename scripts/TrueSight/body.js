var enabled = false,
	truesight_modifiers = {
		"modifier_truesight": "item_gem",
		"modifier_item_dustofappearance": "item_dust"
	},
	panels = new Map(),
	particles = new Map()
function TrueSightOnInterval() {
	TrueSightF()

	if(enabled)
		$.Schedule(Fusion.MyTick, TrueSightOnInterval)
}

function TrueSightF() {
	Entities.PlayersHeroEnts().filter(ent => Entities.IsAlive(ent)).forEach(ent => {
		if(!Game.GetBuffs(ent).some(buff => {
			var item_name = truesight_modifiers[Buffs.GetName(ent, buff)]
			if(item_name) {
				if(item_name !== "item_gem")
					CreateAlert_Panel(ent, item_name)
				else
					CreateAlert_Panel_Gem(ent, Buffs.GetCaster(ent, buff), item_name)
				CreateAlert_Particle(ent)

				return true
			}
			return false
		}) && panels.has(ent)) {
			panels.get(ent).DeleteAsync(0)
			panels.delete(ent)

			Particles.DestroyParticleEffect(particles.get(ent), true)
			particles.delete(ent)
		}
	})
}

function CreateAlert_Panel_Gem(ent, caster, item_name) {
	if(Fusion.Panels.ItemPanel === undefined || panels.has(ent))
		return
	
	var A = $.CreatePanel("Panel", Fusion.Panels.ItemPanel, `Alert${ent}`)
	A.BLoadLayoutFromString("<root>\
	<Panel style='width:100%;height:37px;background-color:#111;'>\
		<DOTAHeroImage heroname='' style='vertical-align:center;width:60px;height:35px;position:0px;'/>\
		<DOTAItemImage itemname='' style='vertical-align:center;width:60px;height:35px;position:70px;'/>\
		<DOTAHeroImage heroname='' style='vertical-align:center;width:60px;height:35px;position:140px;'/>\
	</Panel>\
</root>", false, false)
	A.Children()[0].heroname = Entities.GetUnitName(caster)
	A.Children()[1].itemname = item_name
	A.Children()[2].heroname = Entities.GetUnitName(ent)
	panels.set(ent, A)
}

function CreateAlert_Panel(ent, item_name) {
	if(Fusion.Panels.ItemPanel === undefined || panels.has(ent))
		return
	
	var A = $.CreatePanel("Panel", Fusion.Panels.ItemPanel, `Alert${ent}`)
	A.BLoadLayoutFromString("<root>\
	<Panel style='width:100%;height:37px;background-color:#111;'>\
		<DOTAItemImage itemname='' style='vertical-align:center;width:60px;height:35px;position:0px;'/>\
		<DOTAHeroImage heroname='' style='vertical-align:center;width:60px;height:35px;position:70px;'/>\
	</Panel>\
</root>", false, false)
	A.Children()[0].itemname = item_name
	A.Children()[1].heroname = Entities.GetUnitName(ent)
	panels.set(ent, A)
}

var par_size = 675 / 4
function CreateAlert_Particle(ent) {
	if(particles.has(ent))
		return
	
	var par = Particles.CreateParticle("particles/units/heroes/hero_abaddon/abaddon_aphotic_shield.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, ent)
	Particles.SetParticleControl(par, 1, [par_size, 0, 0])

	particles.set(ent, par)
}

script = {
	name: "True Sight Detector",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			TrueSightOnInterval()
			Game.ScriptLogMsg("Script enabled: True Sight Detector", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: True Sight Detector", "#ff0000")
	},
	onDestroy: () => {
		enabled = false
		panels.forEach(panel => panel.DeleteAsync(0))
		particles.forEach(par => Particles.DestroyParticleEffect(par, true))
	}
}