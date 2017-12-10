var TruePickupRadius = 150,
	PickupRadius = 450,
	NoTarget = [],
	RunePositions = [
		[-3149.0625,3725.8125,304],  // direTop
		[-1760,1216,176],            // riverTop
		[-4328.09375,1591.9375,432], // radiantTop
		[4167.90625,-1704.0625,448], // direBot
		[2250.5625,-1857.84375,192], // riverBot
		[3686.9375,-3624.8125,304]   // radiantTop
	],
	Interval = 0.1,
	enabled = false

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
	var nearbyRunes = RunePositions.filter(RunePos => Game.PointDistance(RunePos, myVec) <= PickupRadius)
	if(nearbyRunes.length === 0) {
		Interval = Fusion.MyTick * 3
		if(enabled)
			$.Schedule(Interval, RuneSnatcherF)
		return
	} else
		Interval = Fusion.MyTick
	
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Game.IsGamePaused() || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt)) {
		if(enabled)
			$.Schedule(Interval, RuneSnatcherF)
		return
	}
	
	var myVec = Entities.GetAbsOrigin(MyEnt)
	nearbyRunes
		.map(RunePos => {
			var rune = undefined
			Fusion.GetEntitiesOnPosition(RunePos).every(ent => {
				if(!Entities.IsSelectable(ent)) {
					rune = ent
					return false
				}
				return true
			})
			return rune
		})
		.filter(ent => ent !== undefined)
		.every(Rune => {
			Game.PickupRune(MyEnt, Rune, false)
			return false
		})
	
	if(enabled)
		$.Schedule(Interval, RuneSnatcherF)
}

function ItemSnatcherF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Game.IsGamePaused() || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt)) {
		if(enabled)
			$.Schedule(Fusion.MyTick, ItemSnatcherF)
		return
	}
	
	Entities.GetAllEntities().filter(ent =>
		Entities.GetRangeToUnit(ent, MyEnt) <= PickupRadius
		&& !Entities.IsSelectable(ent)
		&& Entities.IsItemPhysical(ent)
	).every(ent => {
		Game.PickupItem(MyEnt, ent, false)
		return false
	})

	if(enabled)
		$.Schedule(Fusion.MyTick, ItemSnatcherF)
}

return {
	name: "Snatcher",
	onPreload: DestroyParticle,
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (checkbox.checked) {
			CreateParticle()
			ItemSnatcherF()
			RuneSnatcherF()
			Game.ScriptLogMsg("Script enabled: Snatcher", "#00ff00")
		} else {
			DestroyParticle()
			Game.ScriptLogMsg("Script disabled: Snatcher", "#ff0000")
		}
	},
	onDestroy: () => enabled = false
}