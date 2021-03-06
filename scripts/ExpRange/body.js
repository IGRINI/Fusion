﻿var ExpRange = 1300,
	DaggerRange = 1200

function DestroyParticles() {
	if(Fusion.Particles.ExpRange) {
		Particles.DestroyParticleEffect(Fusion.Particles.ExpRange, true)
		delete Fusion.Particles.ExpRange
	}

	if(Fusion.Particles.DaggerRange) {
		Particles.DestroyParticleEffect(Fusion.Particles.DaggerRange, true)
		delete Fusion.Particles.DaggerRange
	}
}

function ExpRangeEnable() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	Fusion.Particles.ExpRange = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, MyEnt)
	Fusion.Particles.DaggerRange = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, MyEnt)
	Particles.SetParticleControl(Fusion.Particles.ExpRange, 1, [ExpRange, 0, 0])
	Particles.SetParticleControl(Fusion.Particles.DaggerRange, 1, [DaggerRange, 0, 0])
}

script = {
	name: "ExpRange",
	onToggle: checkbox => {
		if (checkbox.checked) {
			ExpRangeEnable()
			Game.ScriptLogMsg("Script enabled: ExpRange", "#00ff00")
		} else {
			DestroyParticles()
			Game.ScriptLogMsg("Script disabled: ExpRange", "#ff0000")
		}
	},
	onDestroy: DestroyParticles
}