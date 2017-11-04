function DagonStealerOnInterval() {
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

Fusion.GetDagon = function(MyEnt) {
	var item
	[
		"item_dagon",
		"item_dagon_2",
		"item_dagon_3",
		"item_dagon_4",
		"item_dagon_5"
	].some(function(DagonName) {
		var itemZ = Game.GetAbilityByName(MyEnt, DagonName)
		if(itemZ !== undefined) {
			item = itemZ
			return true
		}
		return false
	})
	
	return item
}

Fusion.GetDagonDamage = function(dagon) {
	if(dagon === undefined)
		return undefined
	
	return Abilities.GetLevelSpecialValueFor(dagon, "damage", Abilities.GetLevel(dagon))
}

function DagonStealerOnToggle() {
	if (!DagonStealer.checked) {
		Game.ScriptLogMsg("Script disabled: DagonStealer", "#ff0000")
	} else {
		function intervalFunc(){
			$.Schedule(
				Fusion.MyTick * 3,
				function() {
					DagonStealerOnInterval()
					if(DagonStealer.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg("Script enabled: DagonStealer", "#00ff00")
	}
}

var DagonStealer = Fusion.AddScript("DagonStealer", DagonStealerOnToggle)