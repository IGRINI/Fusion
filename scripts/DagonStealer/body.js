function DagonStealerOnInterval() {
	DagonSteal()
	
	if(DagonStealer.checked)
		$.Schedule(Fusion.MyTick, DagonStealerOnInterval)
}

function DagonSteal() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	
	var Dagon = Fusion.GetDagon(MyEnt)
	if(Dagon === undefined)
		return
	var DagonDamage = Fusion.GetDagonDamage(Dagon)
	var DagonRange = Abilities.GetCastRangeFix(Dagon)
	
	if(Abilities.GetCooldownTimeRemaining(Dagon) !== 0)
		return
	
	Entities.PlayersHeroEnts().some(function(ent) {
		if(!Entities.IsEnemy(ent))
			return false
		if(!Entities.IsAlive(ent) || Entities.IsMagicImmune(ent) || Fusion.HasLinkenAtTime(ent, 0))
			return false
		if(Entities.GetRangeToUnit(MyEnt, ent) > DagonRange)
			return false
		if(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent))
			return false
		
		if(Fusion.GetMagicMultiplier(MyEnt, ent) === 0)
			return false
		
		if(Fusion.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent)) <= DagonDamage) {
			GameUI.SelectUnit(MyEnt, false)
			Game.CastTarget(MyEnt, Dagon, ent, false)
			return true
		}
	})
}

function DagonStealerOnToggle() {
	if (DagonStealer.checked) {
		DagonStealerOnInterval()
		Game.ScriptLogMsg("Script enabled: DagonStealer", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: DagonStealer", "#ff0000")
}

var DagonStealer = Fusion.AddScript("DagonStealer", DagonStealerOnToggle)