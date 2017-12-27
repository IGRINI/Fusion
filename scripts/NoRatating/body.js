function onPreloadF() {
	if(!Fusion.Commands.NoRotating) {
		Fusion.Commands.NoRotating = (name, abilName) => {
			var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
			Game.EntStop(MyEnt, false)
			
			var ent = Entities.NearestToMouse(MyEnt, 1000, true),
				myVec = Entities.GetAbsOrigin(MyEnt),
				abil = Entities.GetAbilityByName(MyEnt, abilName),
				dist = Abilities.GetCastRangeFix(abil),
				point = Game.GetScreenCursonWorldVec()
			
			if(Game.PointDistance(myVec, point) > dist)
				return
			
			Game.CastPosition(MyEnt, abil, Fusion.VectorRotation(myVec, Fusion.Angle2Vector(Fusion.AngleBetweenTwoVectors(myVec, point)), -1), false)
		}
		Game.AddCommand("__NoRotating", Fusion.Commands.NoRotating, "", 0)
	}
}

script = {
	name: "No Ratating",
	isVisible: false,
	onPreload: onPreloadF
}