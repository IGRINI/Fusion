FurionSparkStealerOnInterval = () => {
	SparkSteal()
	
	if(FurionSparkStealer.checked)
		$.Schedule(Fusion.MyTick, FurionSparkStealerOnInterval)
}

var flag = false
SparkSteal = () => {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(flag || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	
	var Spark = Entities.GetAbilityByName(MyEnt, "furion_wrath_of_nature")
	if(Spark === -1 || Abilities.GetLevel(Spark) === 0)
		return
	
	var SparkDamage = Abilities.GetLevelSpecialValueFor(Spark, "damage" + (Entities.HasScepter(MyEnt) ? "_scepter" : ""), Abilities.GetLevel(Spark)),
		SparkRange = Abilities.GetCastRangeFix(Spark),
		SparkCastPoint = Abilities.GetCastPoint(Spark)
	
	if(Abilities.GetCooldownTimeRemaining(Spark) !== 0)
		return
	
	var ents = Entities.PlayersHeroEnts().filter(ent =>
			Entities.IsEnemy(ent)
			&& Entities.IsAlive(ent)
			&& !Fusion.HasLinkenAtTime(ent, SparkCastPoint)
			&& !Entities.IsBuilding(ent)
			&& !Entities.IsInvulnerable(ent)
		),
		targets = ents.filter(ent => Fusion.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent)) < SparkDamage)
	/*var nearMap = Fusion.BuildNearMap(ents, SparkRange)

	starts.some(ent => {
		if(Entities.GetHealth(ent) < SparkDamage) {
			CastSpark(MyEnt, Spark, SparkCastPoint, ent)
			return true
		}
		
	})

	targets.some(ent => {
		if(Entities.GetRangeToUnit(MyEnt, ent) > SparkRange) {
			// Generate paths to ent by near map
			// FIXME: Not working.
			var pairs
			while((pairs = FindPairs(ent, nearMap)).length !== 0)
				pairs.forEach(pair => {
					if(Entities.GetRangeToUnit(MyEnt, pair) < Entities.GetRangeToUnit(MyEnt, ent))
						ent = pair
				})
			
			
			if(Entities.GetRangeToUnit(MyEnt, ent) > SparkRange)
				return false
		}
		
		CastSpark(MyEnt, Spark, SparkCastPoint, ent)
		return true
	})
} else*/
		targets
			.every(ent => {
				CastSpark(MyEnt, Spark, SparkCastPoint, ent)
				return false
			})
}

CastSpark = (MyEnt, Spark, SparkCastPoint, ent) => {
	GameUI.SelectUnit(MyEnt, false)
	Game.CastTarget(MyEnt, Spark, ent, false)
	
	flag = true
	$.Schedule(SparkCastPoint, () => flag = false)
}

/**
 * @argument el element that we'll find in 2D
 * @argument ar 2D array to search in
 * @returns pairs
 */
FindPairs = (el, ar) => ar.filter(ar2 => ar2.indexOf(el) > -1).map(ar2 => ar2[0] !== el ? ar2[0] : ar2[1])

var FurionSparkStealer = Fusion.AddScript("FurionSparkStealer", () => {
	if (FurionSparkStealer.checked) {
		FurionSparkStealerOnInterval()
		Game.ScriptLogMsg("Script enabled: FurionSparkStealer", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: FurionSparkStealer", "#ff0000")
})