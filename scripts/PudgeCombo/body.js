var hookspeed = 1450
var hookwidth = 200

function Hook(callback) {
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

function CancelHook(MyEnt, ent) {
	var distance = Game.PointDistance(enVec, Entities.GetAbsOrigin(ent))
	
	if(distance > hookwidth) {
		Game.EntStop(MyEnt, false)
		Combo()
		return true
	} else
		return false
}

function Rot(MyEnt, ent) {
	var rot = Game.GetAbilityByName(MyEnt,"pudge_rot"),
		userbuffs = Game.GetBuffsNames(ent),
		MyEntbuffs = Game.GetBuffsNames(MyEnt),
		distance = Entities.GetRangeToUnit(MyEnt, ent)

	if(MyEntbuffs.indexOf("modifier_pudge_rot") === -1)
		Abilities.ExecuteAbility(rot, MyEnt, false)
}

function Urn(MyEnt, ent) {
	var urn = Game.GetAbilityByName(MyEnt, "item_urn_of_shadows"),
		urncharges = urn === undefined ? -1 : Items.GetCurrentCharges(urn)
		
	if(urncharges > 0)
		Game.CastTarget(MyEnt, urn, ent, false)
}

function Dismember(MyEnt, ent) {
	var dismember = Game.GetAbilityByName(MyEnt, "pudge_dismember")

	Game.CastTarget(MyEnt, dismember, ent, false)
}

function Combo(MyEnt, ent) {
	Hook(MyEnt, ent, function() {
		Urn(MyEnt, ent)
		Rot(MyEnt, ent)
		Dismember(MyEnt, ent)
	})
}

if(!Fusion.Commands.PudgeCombo) {
	Fusion.Commands.PudgeCombo = function() {
		var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
		var ent = Game.ClosetToMouse(MyEnt, 1000, true)
		if(ent === undefined)
			return
		Combo(MyEnt, ent)
	}

	Game.AddCommand("__PudgeCombo", Fusion.Commands.PudgeCombo, "", 0) // FIXME
}