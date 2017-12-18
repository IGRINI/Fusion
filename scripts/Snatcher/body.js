Fusion.Particles.Snatcher = []
var TruePickupRadius = 150,
	PickupRadius = 450,
	NoTarget = [],
	RunePositions = [
		[-3149.0625,  3725.8125,  304], // direTop
		[-1760,       1216,       176],	// riverTop
		[-4328.09375, 1591.9375,  432], // radiantTop
		[4167.90625, -1704.0625,  448], // direBot
		[2250.5625,  -1857.84375, 192], // riverBot
		[3686.9375,  -3624.8125,  304]  // radiantTop
	],
	RoshpitCenter = [-2388, 1761, 159],
	RoshpitRadius = 450,
	Interval = 0.1,
	enabled = false

function IsInRoshpit(vec) {
	return Game.PointDistance(vec, RoshpitCenter) < RoshpitRadius
}

function DestroyParticles() {
	Fusion.Particles.Snatcher.forEach(par => {
		Particles.DestroyParticleEffect(par, true)
		delete Fusion.Particles.Snatcher[par]
	})
}

function CreateParticle() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()),
		par;
	
	par = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, MyEnt)
	Particles.SetParticleControl(par, 1, [PickupRadius, 0, 0])
	Fusion.Particles.Snatcher.push(par)

	par = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, MyEnt)
	Particles.SetParticleControl(par, 1, [TruePickupRadius, 0, 0])
	Fusion.Particles.Snatcher.push(par)
}

function RuneSnatcherF(MyEnt, nearbyRunes) {
	nearbyRunes.map(RunePos => {
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
}

function SnatcherF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Game.IsGamePaused() || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt)) {
		if(enabled)
			$.Schedule(Interval, SnatcherF)
		return
	}

	var myVec = Entities.GetAbsOrigin(MyEnt),
		nearbyRunes = RunePositions.filter(RunePos => Game.PointDistance(RunePos, myVec) <= PickupRadius),
		items = Entities.GetAllEntitiesByClassname("").filter(ent => // uses trick that item haven't classname. will be fixed later in native.
			Entities.IsEntityInRange(ent, MyEnt, PickupRadius)
			&& !Entities.IsSelectable(ent)
			&& Entities.IsItemPhysical(ent)
			&& IsInRoshpit(Entities.GetAbsOrigin(ent))
		)
	if(nearbyRunes.length === 0 && items.length === 0) {
		Interval = Fusion.MyTick * 3
		if(enabled)
			$.Schedule(Interval, SnatcherF)
		return
	} else
		Interval = Fusion.MyTick
	
	RuneSnatcherF(MyEnt, nearbyRunes)
	items.every(ent => {
		Game.PickupItem(MyEnt, ent, false)
		return false
	})
	
	if(enabled)
		$.Schedule(Interval, SnatcherF)
}

script = {
	name: "Snatcher",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			CreateParticle()
			SnatcherF()
			Game.ScriptLogMsg("Script enabled: Snatcher", "#00ff00")
		} else {
			DestroyParticles()
			Game.ScriptLogMsg("Script disabled: Snatcher", "#ff0000")
		}
	},
	onDestroy: () => {
		enabled = false
		DestroyParticles()
	}
}