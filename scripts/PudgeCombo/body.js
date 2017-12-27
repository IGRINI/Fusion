function Hook(MyEnt, ent, callback) {
	Game.EntStop(MyEnt, false)
	var myVec = Entities.GetAbsOrigin(MyEnt),
		hook = Entities.GetAbilityByName(MyEnt, "pudge_meat_hook"),
		hookDist = Abilities.GetCastRangeFix(hook),
		hookwidth = Abilities.GetSpecialValueFor(hook, "hook_width") / 2,
		reachtime = Entities.GetRangeToUnit(MyEnt, ent) / Abilities.GetSpecialValueFor(hook, "hook_speed"),
		delay = Abilities.GetCastPoint(hook),
		schedDelay = delay - Fusion.MyTick * 2,
		time = reachtime + delay + Fusion.MyTick,
		predict = Game.VelocityWaypoint(ent, time),
		angleBetween = Fusion.Angle2Vector(Fusion.AngleBetweenTwoVectors(myVec, predict))
	
	if(!Entities.IsEntityInRange(MyEnt, ent, hookDist + hookwidth))
		return
	
	Game.CastPosition(MyEnt, hook, Fusion.VectorRotation(myVec, angleBetween, -1), false)
	$.Schedule(schedDelay, () => {
		var retEnt = ent //CancelHook(MyEnt, hookDist, Fusion.MyTick * 2, hookwidth, angleBetween)
		if(retEnt)
			$.Schedule(time - schedDelay - Fusion.MyTick * 2, () => {
				var retEnt = ent //CancelHook(MyEnt, hookDist, Fusion.MyTick * 2, hookwidth, angleBetween)
				if(retEnt)
					callback(retEnt)
			})
		else
			Game.EntStop(MyEnt, false)
	})
}

function IsOnTrajectory(MyEnt, distance, time, hookwidth, angleBetween) {
	var myVec = Entities.GetAbsOrigin(MyEnt),
		ents = Array.prototype.orderBy.call(Entities.GetAllEntities().filter(ent => Entities.IsEntityInRange(MyEnt, ent, distance + hookwidth)).filter(ent => {
			if(MyEnt === ent)
				return false
			
			var entVec = Game.VelocityWaypoint(ent, time)

			for(var i = 0; i <= distance; i++)
				if(Game.PointDistance(Fusion.VectorRotation(myVec, angleBetween, -i), entVec) <= hookwidth)
					return true
			
			return false
		}), ent => Entities.GetRangeToUnit(ent, MyEnt))
	
	return ents[0] && Entities.PlayersHeroEnts().indexOf(ents[0]) > -1 ? ents[0] : undefined
}

function CancelHook(MyEnt, hookDist, delay, hookwidth, angleBetween) {
	if(!IsOnTrajectory(MyEnt, hookDist, delay, hookwidth, angleBetween)) {
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
	Hook(MyEnt, ent, retEnt => {
		Etherial(MyEnt, retEnt)
		Urn(MyEnt, retEnt)
		Rot(MyEnt)
		Dismember(MyEnt, retEnt)
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