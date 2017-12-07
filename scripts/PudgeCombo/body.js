function Hook(callback) {
	myVec = Entities.GetAbsOrigin(MyEnt)
	myForwardVec = Entities.GetForward(MyEnt)
	enVec = Entities.GetAbsOrigin(ent)
	var
		hook = Entities.GetAbilityByName(MyEnt, "pudge_meat_hook"),
		hookwidth = Abilities.GetSpecialValueFor(hook, "hook_width"),
		distance = Entities.GetRangeToUnit(MyEnt, ent),
		reachtime = (distance / Abilities.GetSpecialValueFor(hook, "hook_speed")),
		angle = Game.AngleBetweenVectors(myVec, myForwardVec, enVec),
		rottime = Game.RotationTime(angle, 0.7),
		delay = Abilities.GetCastPoint(hook),
		time = reachtime + delay + rottime + Fusion.MyTick,
		predict = Game.VelocityWaypoint(ent, time)
	
	if(distance > Abilities.GetCastRangeFix(hook) + hookwidth / 2)
		return
	
	Game.CastPosition(ent, hook, predict, false)
	$.Schedule(Abilities.GetCastPoint(hook) - Fusion.MyTick * 3, () => {
		if(!CancelHook(MyEnt, ent, hookwidth))
			callback()
	})
}

function CancelHook(MyEnt, ent, hookwidth) {
	var distance = Game.PointDistance(enVec, Entities.GetAbsOrigin(ent))
	
	if(distance > hookwidth) {
		Game.EntStop(MyEnt, false)
		Combo()
		return true
	} else
		return false
}

function Rot(MyEnt) {
	if(Game.GetBuffsNames(MyEnt).indexOf("modifier_pudge_rot") === -1)
		Abilities.ExecuteAbility(Entities.GetAbilityByName(MyEnt, "pudge_rot"), MyEnt, false)
}

function Urn(MyEnt, ent) {
	var urn = Game.GetAbilityByName(MyEnt, "item_urn_of_shadows"),
		urncharges = urn === undefined ? -1 : Items.GetCurrentCharges(urn)
		
	if(urncharges > 0)
		Game.CastTarget(MyEnt, urn, ent, false)
}

function Dismember(MyEnt, ent) {
	Game.CastTarget(MyEnt, Entities.GetAbilityByName(MyEnt, "pudge_dismember"), ent, false)
}

function onPreloadF() {
	if(Fusion.Commands.PudgeCombo)
		return

	Fusion.Commands.PudgeCombo = () => {
		var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
		var ent = Entities.NearestToMouse(MyEnt, 1000, true)
		if(ent === undefined)
			return
		
		Hook(MyEnt, ent, () => {
			Urn(MyEnt, ent)
			Rot(MyEnt, ent)
			Dismember(MyEnt, ent)
		})
	}

	Game.AddCommand("__PudgeCombo", Fusion.Commands.PudgeCombo, "", 0)
}

return {
	name: "PudgeCombo",
	isVisible: false,
	onPreload: onPreloadF
}