var RunePickupRadius = 150
var NoTarget = []
var RunePositions = [
	[-3149.0625,3725.8125,304],  // direTop
	[-1760,1216,176],            // riverTop
	[-4328.09375,1591.9375,432], // radiantTop
	[4167.90625,-1704.0625,448], // direBot
	[2250.5625,-1857.84375,192], // riverBot
	[3686.9375,-3624.8125,304]   // radiantTop
]

function SnatcherF() {
	var MyEnt = parseInt(Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()))
	if(Game.IsGamePaused() || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt)) {
		if(Snatcher.checked)
			$.Schedule(1, SnatcherF)
		return
	}
	
	var myVec = Entities.GetAbsOrigin(MyEnt)
	RunePositions.filter(function(RunePos) {
		return Game.PointDistance(RunePos, myVec) <= RunePickupRadius
	}).forEach(function(RunePos) {
		var EntsOnPos = Fusion.GetEntitiesOnPosition(RunePos)
		if(EntsOnPos.length === 0)
			return
		EntsOnPos.map(function(entData) {
			return entData.entityIndex
		}).some(function(ent) {
			if(!Entities.IsSelectable(ent)) {
				Game.PuckupRune(MyEnt, ent, false)
				return true
			}

			return false
		})
	})

	if(Snatcher.checked)
		$.Schedule(Fusion.MyTick, SnatcherF)
}

function SnatcherToggle() {
	if(Snatcher.checked) {
		SnatcherF()
		Game.ScriptLogMsg("Script enabled: Snatcher", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: Snatcher", "#ff0000")
}

var Snatcher = Game.AddScript("Snatcher", SnatcherToggle)
if(!Fusion.Particles.RuneSnatcher) {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	Fusion.Particles.RuneSnatcher = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, MyEnt)
	Particles.SetParticleControl(Fusion.Particles.RuneSnatcher, 1, [RunePickupRadius, 0, 0])
}