TinkerLaserStealerOnInterval = () => {
	LaserSteal()
	
	if(TinkerLaserStealer.checked)
		$.Schedule(Fusion.MyTick, TinkerLaserStealerOnInterval)
}

var flag = false
LaserSteal = () => {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(flag || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	
	var Laser = Entities.GetAbilityByName(MyEnt, "tinker_laser")
	if(Laser === -1 || Abilities.GetLevel(Laser) === 0)
		return
	
	var LaserDamage = Abilities.GetLevelSpecialValueFor(Laser, "laser_damage", Abilities.GetLevel(Laser))
	var LaserRefractionRange = Abilities.GetSpecialValueFor(Laser, "cast_range_scepter")

	var talent = Entities.GetAbilityByName(MyEnt, "special_bonus_unique_tinker")
	if(talent !== -1 && Abilities.GetLevel(talent) > 0)
		LaserDamage += Abilities.GetSpecialValueFor(talent, "value")
	
	var LaserRange = Abilities.GetCastRangeFix(Laser)
	var LaserCastPoint = Abilities.GetCastPoint(Laser)
	
	if(Abilities.GetCooldownTimeRemaining(Laser) !== 0)
		return
	
	var ents = Entities.PlayersHeroEnts().filter(ent =>
			Entities.IsEnemy(ent)
			&& Entities.IsAlive(ent)
			&& !Entities.IsMagicImmune(ent)
			&& !Fusion.HasLinkenAtTime(ent, LaserCastPoint)
			&& !Entities.IsBuilding(ent)
			&& !Entities.IsInvulnerable(ent)
		),
		targets = ents.filter(ent => Entities.GetHealth(ent) < LaserDamage),
		starts = ents.filter(ent => Entities.GetRangeToUnit(MyEnt, ent) <= LaserRange)
	/*var nearMap = Fusion.BuildNearMap(ents, LaserRange)

	starts.some(ent => {
		if(Entities.GetHealth(ent) < LaserDamage) {
			CastLaser(MyEnt, Laser, LaserCastPoint, ent)
			return true
		}
		
	})

	targets.some(ent => {
		if(Entities.GetRangeToUnit(MyEnt, ent) > LaserRange) {
			// Generate paths to ent by near map
			// FIXME: Not working.
			var pairs
			while((pairs = FindPairs(ent, nearMap)).length !== 0)
				pairs.forEach(pair => {
					if(Entities.GetRangeToUnit(MyEnt, pair) < Entities.GetRangeToUnit(MyEnt, ent))
						ent = pair
				})
			
			
			if(Entities.GetRangeToUnit(MyEnt, ent) > LaserRange)
				return false
		}
		
		CastLaser(MyEnt, Laser, LaserCastPoint, ent)
		return true
	})
} else*/
		targets
			.filter(ent => Entities.GetRangeToUnit(MyEnt, ent) < LaserRange)
			.every(ent => {
				CastLaser(MyEnt, Laser, LaserCastPoint, ent)
				return false
			})
}

CastLaser = (MyEnt, Laser, LaserCastPoint, ent) => {
	GameUI.SelectUnit(MyEnt, false)
	Game.CastTarget(MyEnt, Laser, ent, false)
	
	flag = true
	$.Schedule(LaserCastPoint, () => flag = false)
}

/**
 * @argument el element that we'll find in 2D
 * @argument ar 2D array to search in
 * @returns pairs
 */
FindPairs = (el, ar) => ar.filter(ar2 => ar2.indexOf(el) > -1).map(ar2 => ar2[0] !== el ? ar2[0] : ar2[1])

TinkerLaserStealerOnToggle = () => {
	if (TinkerLaserStealer.checked) {
		TinkerLaserStealerOnInterval()
		Game.ScriptLogMsg("Script enabled: TinkerLaserStealer", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: TinkerLaserStealer", "#ff0000")
}

var TinkerLaserStealer = Fusion.AddScript("TinkerLaserStealer", TinkerLaserStealerOnToggle)