var hookspeed = 1450
var hookwidth = 200

Hook = callback => {
	myVec = Entities.GetAbsOrigin(MyEnt)
	myForwardVec = Entities.GetForward(MyEnt)
	enVec = Entities.GetAbsOrigin(ent)
	var
		hook = Game.GetAbilityByName(MyEnt, "pudge_meat_hook"),
		distance = Entities.GetRangeToUnit(MyEnt, ent),
		reachtime = (distance / hookspeed),
		angle = Game.AngleBetweenVectors(myVec, myForwardVec, enVec),
		rottime = Game.RotationTime(angle, 0.7),
		delay = Abilities.GetCastPoint(hook),
		time = reachtime + delay + rottime + Fusion.MyTick,
		predict = Game.VelocityWaypoint(ent, time)
	
	if(distance > Abilities.GetCastRangeFix(hook))
		return
	
	Game.CastPosition(ent, hook, predict, false)
	$.Schedule(0.3 - Fusion.MyTick, function() {
		if(!CancelHook(MyEnt, ent))
			callback()
	})
}

CancelHook = (MyEnt, ent) => {
	var distance = Game.PointDistance(enVec, Entities.GetAbsOrigin(ent))
	
	if(distance > hookwidth) {
		Game.EntStop(MyEnt, false)
		Combo()
		return true
	} else
		return false
}

Rot = MyEnt => {
	var rot = Game.GetAbilityByName(MyEnt,"pudge_rot"),
		MyEntbuffs = Game.GetBuffsNames(MyEnt)

	if(MyEntbuffs.indexOf("modifier_pudge_rot") === -1)
		Abilities.ExecuteAbility(rot, MyEnt, false)
}

Urn = (MyEnt, ent) => {
	var urn = Game.GetAbilityByName(MyEnt, "item_urn_of_shadows"),
		urncharges = urn === undefined ? -1 : Items.GetCurrentCharges(urn)
		
	if(urncharges > 0)
		Game.CastTarget(MyEnt, urn, ent, false)
}

Dismember = (MyEnt, ent) => {
	var dismember = Game.GetAbilityByName(MyEnt, "pudge_dismember")

	Game.CastTarget(MyEnt, dismember, ent, false)
}

if(!Fusion.Commands.PudgeCombo) {
	Fusion.Commands.PudgeCombo = function() {
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