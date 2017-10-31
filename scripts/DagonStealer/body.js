var DagonDamage = [400, 500, 600, 700, 800]

function DagonStealerOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Entities.GetAllHeroEntities()
	
	AutoDagon(MyEnt, HEnts)
}

function AutoDagon(MyEnt, HEnts) {
	var Dagon = Fusion.GetDagon(MyEnt)
	if(Dagon === undefined)
		return
	var DagonDamage = Fusion.GetDagonDamage(Dagon)
	var DagonRange = Abilities.GetCastRangeFix(Dagon)
	
	if(Abilities.GetCooldownTimeRemaining(Dagon) !== 0)
		return
	
	for (i in HEnts) {
		if(Abilities.GetCooldownTimeRemaining(Dagon) !== 0)
			return
		var ent = parseInt(HEnts[i])
		
		if(!Entities.IsAlive(ent) || Entities.IsMagicImmune(ent) || Fusion.HasLinkenAtTime(ent, 0))
			continue
		if(Entities.GetRangeToUnit(MyEnt, ent) > DagonRange)
			continue
		if(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent))
			continue
		if(!Entities.IsEnemy(ent))
			continue
		
		if(Fusion.GetMagicMultiplier(MyEnt, ent) === 0)
			continue
		
		if(Fusion.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent)) <= DagonDamage) {
			GameUI.SelectUnit(MyEnt, false)
			Game.CastTarget(MyEnt, Dagon, ent, false)
		}
	}
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
	var DagonLvl = Abilities.GetLevel(dagon)
	
	return DagonDamage[DagonLvl - 1]
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

var DagonStealer = Game.AddScript("DagonStealer", DagonStealerOnToggle)