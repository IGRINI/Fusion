var ExpRanged = 1300
var DaggerRanged = 1200

function DestroyParticles() {
	try {
		if(Fusion.Particles.ExpRange)
			Particles.DestroyParticleEffect(Fusion.Particles.ExpRange, Fusion.Particles.ExpRange)
		if(Fusion.Particles.DaggerRange)
			Particles.DestroyParticleEffect(Fusion.Particles.DaggerRange, Fusion.Particles.DaggerRange)
	} catch(e) {  }
}

function ExpRangeEnable() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	Fusion.Particles.ExpRange = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, MyEnt)
	Fusion.Particles.DaggerRange = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, MyEnt)
	Particles.SetParticleControl(Fusion.Particles.ExpRange, 1, [ExpRanged, 0, 0])
	Particles.SetParticleControl(Fusion.Particles.DaggerRange, 1, [DaggerRanged, 0, 0])
}

function exprangeOnOff(){
	if (!ExpRange.checked) {
		DestroyParticles()
		Game.ScriptLogMsg("Script disabled: ExpRange", "#ff0000")
	} else {
		ExpRangeEnable()
		Game.ScriptLogMsg("Script enabled: ExpRange", "#00ff00")
	}
}

var ExpRange = Game.AddScript("ExpRange", exprangeOnOff)
DestroyParticles()