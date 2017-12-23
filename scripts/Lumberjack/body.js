var enabled = false,
	Interval = Fusion.MyTick,
	ignore = []

function LumberjackF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()),
		chopItem = Fusion.GetChopItem(MyEnt),
		chopItemRange = Abilities.GetCastRangeFix(chopItem),
		regrowthTime = 300
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
		if(ignore.indexOf(tree) > -1)
			return true
		
		Game.CastTargetTree(MyEnt, chopItem, tree, false)

		ignore.push(tree)
		$.Schedule(regrowthTime, () => ignore.remove(tree))
		return false
	})
	
	if(enabled)
		$.Schedule(Interval, LumberjackF)
}

script = {
	name: "Lumberjack",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			LumberjackF()
			Game.ScriptLogMsg("Script enabled: Lumberjack", "#00ff00")
		} else {
			Game.ScriptLogMsg("Script disabled: Lumberjack", "#ff0000")
		}
	},
	onDestroy: () => {
		enabled = false
		ignore.forEach((el, id) => delete ignore[id])
	}
}