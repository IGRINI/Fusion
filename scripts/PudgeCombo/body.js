function Hook(MyEnt, ent, callback) {
	myVec = Entities.GetAbsOrigin(MyEnt)
	enVec = Entities.GetAbsOrigin(ent)
	var hook = Entities.GetAbilityByName(MyEnt, "pudge_meat_hook"),
		hookDist = Abilities.GetCastRangeFix(hook),
		hookwidth = Abilities.GetSpecialValueFor(hook, "hook_width") / 2,
		reachtime = Entities.GetRangeToUnit(MyEnt, ent) / Abilities.GetSpecialValueFor(hook, "hook_speed"),
		delay = Abilities.GetCastPoint(hook),
		time = reachtime + delay + Fusion.MyTick,
		predict = Game.VelocityWaypoint(ent, time)
	
	if(!Entities.IsEntityInRange(MyEnt, ent, hookDist + hookwidth))
		return
	
	Game.EntStop(MyEnt, false)
	Game.CastPosition(MyEnt, hook, Fusion.VectorDif(myVec, Fusion.Angle2Vector(Fusion.AngleBetweenTwoVectors(myVec, predict))), false)
	$.Schedule(time - Fusion.MyTick * 3, () => {
		if(!CancelHook(MyEnt, hookDist, Fusion.MyTick * 3, hookwidth))
			callback()
	})
}

function IsOnTrajectory(MyEnt, distance, time, hookwidth) {
	/*var myForwardVec = Entities.GetForward(MyEnt),
		ents = Array.prototype.orderBy.call(Entities.GetAllEntities().filter(ent => Entities.IsEntityInRange(MyEnt, ent, distance + hookwidth)).filter(ent => {
			if(MyEnt === ent)
				return false
			
			var entVec = Game.VelocityWaypoint(ent, time)

			for(var i = 0; i <= distance; i++)
				if(Game.PointDistance([
					myVec[0] + myForwardVec[0] * i,
					myVec[1] + myForwardVec[1] * i,
					myVec[2] + myForwardVec[2] * i
				], entVec) <= hookwidth)
					return true
			
			return false
		}), ent => Entities.GetRangeToUnit(ent, MyEnt))
	
	return ents.length > 0 ? Entities.PlayersHeroEnts().indexOf(ents[0]) > -1 : false*/
	return true
}

function CancelHook(MyEnt, hookDist, delay, hookwidth) {
	if(!IsOnTrajectory(MyEnt, hookDist, delay, hookwidth)) {
		Game.EntStop(MyEnt, false)
		return true
	} else
		return false
}

function Etherial(MyEnt, ent) {
	Game.CastTarget(MyEnt, Game.GetAbilityByName(MyEnt, "item_ethereal_blade"), ent, false)
}

function Rot(MyEnt) {
	if(Game.GetBuffsNames(MyEnt).indexOf("modifier_pudge_rot") === -1)
		Game.ToggleAbil(MyEnt, Entities.GetAbilityByName(MyEnt, "pudge_rot"), false)
}

function Urn(MyEnt, ent) {
	var urn = Game.GetAbilityByName(MyEnt, "item_spirit_vessel") || Game.GetAbilityByName(MyEnt, "item_urn_of_shadows"),
		urncharges = urn ? Items.GetCurrentCharges(urn) : -1
	
	if(urncharges > 0)
		Game.CastTarget(MyEnt, urn, ent, false)
}

function Dismember(MyEnt, ent) {
	Game.CastTarget(MyEnt, Entities.GetAbilityByName(MyEnt, "pudge_dismember"), ent, false)
}

function Combo(MyEnt, ent) {
	Hook(MyEnt, ent, () => {
		Etherial(MyEnt, ent)
		Urn(MyEnt, ent)
		Rot(MyEnt)
		Dismember(MyEnt, ent)
	})
}

function onPreloadF() {
	if(Fusion.Commands.PudgeCombo)
		return

	Fusion.Commands.PudgeCombo = () => {
		var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()),
			ent = Entities.NearestToMouse(MyEnt, 1000, true)
		if(ent === undefined)
			return
		
		Combo(MyEnt, ent)
	}

	Game.AddCommand("__PudgeCombo", Fusion.Commands.PudgeCombo, "", 0)
}

script = {
	name: "Pudge Combo",
	isVisible: false,
	onPreload: onPreloadF
}