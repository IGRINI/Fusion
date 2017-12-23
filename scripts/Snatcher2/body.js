Fusion.Particles.Snatcher = []
var TruePickupRadius = 150,
	PickupRadius = 450,
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

function SnatcherF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Game.IsGamePaused() || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt)) {
		if(enabled)
			$.Schedule(Interval, SnatcherF)
		return
	}

	var nearbyRunes = Entities.GetAllEntities().filter(ent =>
			Entities.IsRune(ent)
			&& !Entities.IsBuilding(ent)
			&& Entities.IsEntityInRange(MyEnt, ent, PickupRadius) // position calculations are latest, as it's most time-consuming
		),
		items = Entities.GetAllEntitiesByClassname("").filter(ent =>
			!Entities.IsSelectable(ent)
			&& Entities.IsItemPhysical(ent)
			&& Entities.IsEntityInRange(MyEnt, ent, PickupRadius) // position calculations are latest, as it's most time-consuming
			&& IsInRoshpit(Entities.GetAbsOrigin(ent))
		)
	if(nearbyRunes.length === 0 && items.length === 0) {
		Interval = Fusion.MyTick * 3
		if(enabled)
			$.Schedule(Interval, SnatcherF)
		return
	} else
		Interval = Fusion.MyTick
	
	nearbyRunes.every(Rune => {
		Game.PickupRune(MyEnt, Rune, false)
		return false
	})
	items.every(ent => {
		Game.PickupItem(MyEnt, ent, false)
		return false
	})
	
	if(enabled)
		$.Schedule(Interval, SnatcherF)
}

script = {
	name: "Snatcher2",
	isVisible: false, // aren't released now
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			CreateParticle()
			SnatcherF()
			Game.ScriptLogMsg("Script enabled: Snatcher2", "#00ff00")
		} else {
			DestroyParticles()
			Game.ScriptLogMsg("Script disabled: Snatcher2", "#ff0000")
		}
	},
	onDestroy: () => {
		enabled = false
		DestroyParticles()
	}
}