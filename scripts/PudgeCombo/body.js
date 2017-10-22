var hookspeed = 1450,
	hookwidth = 200,
	myVec, myForwardVec, enVec, MyEnt, ent
function Hook(callback) {
	myVec = Entities.GetAbsOrigin(MyEnt)
	myForwardVec = Entities.GetForward(MyEnt)
	enVec = Entities.GetAbsOrigin(ent)
	//enForwardVec = Entities.GetForward(ent)
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
		if(!CancelHook())
			callback()
	})
}

function CancelHook() {
	var distance = Game.PointDistance(enVec, Entities.GetAbsOrigin(ent))/*,
		angle = Game.AngleBetweenTwoFaces(enForwardVec, myForwardVec)*/
	
	if(/*angle > 0.20 || */distance > hookwidth) {
		Game.EntStop(MyEnt, false)
		Combo()
		return true
	} else
		return false
}

function Rot() {
	var rot = Game.GetAbilityByName(MyEnt,"pudge_rot"),
		userbuffs = Game.GetBuffsNames(ent),
		MyEntbuffs = Game.GetBuffsNames(MyEnt),
		distance = Entities.GetRangeToUnit(MyEnt, ent)

	if(!Game.IntersecArrays(MyEntbuffs, ["modifier_pudge_rot"]))
		Abilities.ExecuteAbility(rot, MyEnt, false)
}

function Urn() {
	var urn = Game.GetAbilityByName(MyEnt, "item_urn_of_shadows"),
		urncharges = Items.GetCurrentCharges(urn)
		
	if(urncharges > 0)
		Game.CastTarget(MyEnt, urn, ent, false)
}

function Dismember() {
	var dismember = Game.GetAbilityByName(MyEnt,"pudge_dismember")

	Game.CastTarget(MyEnt, dismember, ent, false)
}

function Combo() {
	Hook(function() {
		Urn()
		Rot()
		Dismember()
	})
}

Fusion.Commands.PudgeCombo = function() {
	MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	ent = Game.ClosetToMouse(MyEnt, 1000, true)
	if(ent === undefined)
		return
	Combo()
}

Game.AddCommand("__PudgeCombo", Fusion.Commands.PudgeCombo, "", 0)