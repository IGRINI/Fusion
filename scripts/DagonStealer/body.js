var enabled = false

function DagonStealerOnInterval() {
	DagonSteal()
	
	if(enabled)
		$.Schedule(Fusion.MyTick, DagonStealerOnInterval)
}

function DagonSteal() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt) || Abilities.GetLocalPlayerActiveAbility() !== -1)
		return
	
	var Dagon = Fusion.GetDagon(MyEnt)
	if(Dagon === undefined)
		return
	var DagonRange = Abilities.GetCastRangeFix(Dagon)
	
	if(Abilities.GetCooldownTimeRemaining(Dagon) !== 0)
		return
	
	Entities.PlayersHeroEnts()
		.filter(ent =>
			Entities.IsEnemy(ent)
			&& Entities.IsAlive(ent)
			&& !Entities.IsBuilding(ent)
			&& !Entities.IsMagicImmune(ent)
			&& !Entities.IsInvulnerable(ent)
			&& !Fusion.HasLinkenAtTime(ent, 0)
			&& Entities.GetRangeToUnit(MyEnt, ent) <= DagonRange
		)
		.every(ent => !Fusion.TryDagon(MyEnt, ent))
}

script = {
	name: "DagonStealer",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if(enabled) {
			DagonStealerOnInterval()
			Game.ScriptLogMsg("Script enabled: DagonStealer", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: DagonStealer", "#ff0000")
	},
	onDestroy: () => enabled = false
}