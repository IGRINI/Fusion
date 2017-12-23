var enabled = false,
	Interval = Fusion.MyTick

function LumberjackF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()),
		chopItem = Fusion.GetChopItem(MyEnt),
		chopItemRange = Abilities.GetCastRangeFix(chopItem)
	if(Game.IsGamePaused() || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt)) {
		if(enabled)
			$.Schedule(Interval, LumberjackF)
		return
	}

	var trees = Entities.GetAllEntities().filter(ent =>
			Entities.IsTree(ent)
			&& Entities.IsEntityInRange(MyEnt, ent, chopItemRange) // position calculations are latest, as it's most time-consuming
		)
	if(trees.length === 0) {
		Interval = Fusion.MyTick * 3
		if(enabled)
			$.Schedule(Interval, LumberjackF)
		return
	} else
		Interval = Fusion.MyTick
	
	trees.every(tree => {
		Game.CastTargetTree(MyEnt, chopItem, tree, false)
		return false
	})
	
	if(enabled)
		$.Schedule(Interval, LumberjackF)
}

script = {
	name: "Lumberjack",
	isVisible: false, // aren't released now
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			LumberjackF()
			Game.ScriptLogMsg("Script enabled: Lumberjack", "#00ff00")
		} else {
			Game.ScriptLogMsg("Script disabled: Lumberjack", "#ff0000")
		}
	},
	onDestroy: () => enabled = false
}