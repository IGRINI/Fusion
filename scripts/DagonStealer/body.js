function DagonStealerOnInterval() {
	DagonSteal()
	
	if(DagonStealer.checked)
		$.Schedule(Fusion.MyTick, DagonStealerOnInterval)
}

function DagonSteal() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt) || Abilities.GetLocalPlayerActiveAbility() !== -1)
		return
	
	var Dagon = Fusion.GetDagon(MyEnt)
	if(Dagon === undefined)
		return
	var DagonDamage = Fusion.GetDagonDamage(Dagon),
		DagonRange = Abilities.GetCastRangeFix(Dagon)
	
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
			&& Entities.GetHealth(ent) < Fusion.CalculateDamage(MyEnt, ent, DagonDamage, DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL)
		)
		.every(ent => {
			GameUI.SelectUnit(MyEnt, false)
			Game.CastTarget(MyEnt, Dagon, ent, false)
			return false
		})
}

var DagonStealer = Fusion.AddScript("DagonStealer", () => {
	if (DagonStealer.checked) {
		DagonStealerOnInterval()
		Game.ScriptLogMsg("Script enabled: DagonStealer", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: DagonStealer", "#ff0000")
})