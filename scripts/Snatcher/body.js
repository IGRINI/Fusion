var TruePickupRadius = 150
var PickupRadius = 450
var NoTarget = []
var RunePositions = [
	[-3149.0625,3725.8125,304],  // direTop
	[-1760,1216,176],            // riverTop
	[-4328.09375,1591.9375,432], // radiantTop
	[4167.90625,-1704.0625,448], // direBot
	[2250.5625,-1857.84375,192], // riverBot
	[3686.9375,-3624.8125,304]   // radiantTop
]

function DestroyParticle() {
	if(Fusion.Particles.RuneSnatcher) {
		Particles.DestroyParticleEffect(Fusion.Particles.RuneSnatcher, true)
		delete Fusion.Particles.RuneSnatcher
	}
	if(Fusion.Particles.RuneSnatcherTrue) {
		Particles.DestroyParticleEffect(Fusion.Particles.RuneSnatcherTrue, true)
		delete Fusion.Particles.RuneSnatcher
	}
}

function CreateParticle() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())

	Fusion.Particles.RuneSnatcher = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, MyEnt)
	Particles.SetParticleControl(Fusion.Particles.RuneSnatcher, 1, [PickupRadius, 0, 0])

	Fusion.Particles.RuneSnatcherTrue = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, MyEnt)
	Particles.SetParticleControl(Fusion.Particles.RuneSnatcherTrue, 1, [TruePickupRadius, 0, 0])
}

function RuneSnatcherF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Game.IsGamePaused() || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	
	var myVec = Entities.GetAbsOrigin(MyEnt)
	RunePositions
		.filter(RunePos => Game.PointDistance(RunePos, myVec) <= PickupRadius)
		.map(RunePos => {
			var rune = undefined
			Fusion.GetEntitiesOnPosition(RunePos).every(ent => {
				if(!Entities.IsSelectable(ent)) {
					rune = ent
					return true
				}
				return false
			})
			return rune
		})
		.filter(ent => ent !== undefined)
		.forEach(Rune => Game.PickupRune(MyEnt, Rune, false))
}

function ItemSnatcherF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Game.IsGamePaused() || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	
	Entities.GetAllEntities().filter(ent =>
		Entities.GetRangeToUnit(ent, MyEnt) <= PickupRadius
		&& !Entities.IsSelectable(ent)
		&& Entities.IsItemPhysical(ent)
	).forEach(ent => Game.PickupItem(MyEnt, ent, false))
}

function SnatcherF() {
	ItemSnatcherF()
	RuneSnatcherF()

	if(Snatcher.checked)
		$.Schedule(Fusion.MyTick, SnatcherF)
}

var Snatcher = Fusion.AddScript("Snatcher", () => {
	if(Snatcher.checked) {
		CreateParticle()
		SnatcherF()
		Game.ScriptLogMsg("Script enabled: Snatcher", "#00ff00")
	} else {
		DestroyParticle()
		Game.ScriptLogMsg("Script disabled: Snatcher", "#ff0000")
	}
})
DestroyParticle()