Fusion.BlinkDistance = 1200
GameUI.SetMouseCallback(function(eventName,arg) {
	var ab = Abilities.GetLocalPlayerActiveAbility()
	var abn = Abilities.GetAbilityName(ab)
	if (GameUI.GetClickBehaviors() !== 3 || abn !== "item_blink")
		return false
	if (eventName == "pressed") {
		if (arg === 0) {
			var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
			var entVec = Entities.GetAbsOrigin(MyEnt)
			var entForward = Entities.GetForward(ent)
			var cursorVec = GameUI.GetScreenWorldPosition(GameUI.GetCursorPosition())
			if(Game.PointDistance(entVec, cursorVec) <= Fusion.BlinkDistance)
				return false
			Game.CastPosition (
				MyEnt,
				ab,
				[
					entVec[0] + entForward[0] * Fusion.BlinkDistance,
					entVec[1] + entForward[1] * Fusion.BlinkDistance,
					entVec[2] + entForward[2] * Fusion.BlinkDistance
				],
				false
			)
			return true
		}
	}
	return false
})