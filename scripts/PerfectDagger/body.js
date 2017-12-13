Fusion.BlinkDistance = 1200
function onPreloadF() {
	GameUI.SetMouseCallback((eventName, arg) => {
		var ab = Abilities.GetLocalPlayerActiveAbility()
		if (GameUI.GetClickBehaviors() !== 3 || Abilities.GetAbilityName(ab) !== "item_blink")
			return false
		if (eventName == "pressed")
			if (arg === 0) {
				var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()),
					entVec = Entities.GetAbsOrigin(MyEnt),
					entForward = Entities.GetForward(ent),
					cursorVec = GameUI.GetScreenWorldPosition(GameUI.GetCursorPosition())

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
		return false
	})
}

script = {
	name: "PerfectDagger",
	isVisible: false,
	onPreload: onPreloadF
}