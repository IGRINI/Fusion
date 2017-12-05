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
	
	Entities.PlayersHeroEnts()
		.filter(ent =>
			Entities.IsEnemy(ent)
			&& Entities.IsAlive(ent)
			&& !Entities.IsMagicImmune(ent)
			&& !Fusion.HasLinkenAtTime(ent, LaserCastPoint)
			&& !Entities.IsBuilding(ent)
			&& !Entities.IsInvulnerable(ent)
		)
		.filter(ent => Entities.GetRangeToUnit(MyEnt, ent) < LaserRange)
		.every(ent => {
			if(Entities.GetHealth(ent) < LaserDamage) {
				CastLaser(MyEnt, Laser, LaserCastPoint, ent)
				return false
			} else {
				var Dagon = Fusion.GetDagon(MyEnt)
				if(Dagon !== undefined) {
					var DagonDamage = Fusion.GetDagonDamage(Dagon)
					if(Abilities.GetCooldownTimeRemaining(Dagon) === 0 && Fusion.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent) - LaserDamage) < DagonDamage) {
						CastDagon(MyEnt, Dagon, ent)
						return false
					}
				}
			}

			return true
		})
}

CastLaser = (MyEnt, Laser, LaserCastPoint, ent) => {
	GameUI.SelectUnit(MyEnt, false)
	Game.CastTarget(MyEnt, Laser, ent, false)
	
	flag = true
	$.Schedule(LaserCastPoint, () => flag = false)
}

CastDagon = (MyEnt, Dagon, ent) => {
	GameUI.SelectUnit(MyEnt, false)
	Game.CastTarget(MyEnt, Dagon, ent, false)
}

/**
 * @argument el element that we'll find in 2D
 * @argument ar 2D array to search in
 * @returns pairs
 */
FindPairs = (el, ar) => ar.filter(ar2 => ar2.indexOf(el) > -1).map(ar2 => ar2[0] !== el ? ar2[0] : ar2[1])

var TinkerLaserStealer = Fusion.AddScript("TinkerLaserStealer", () => {
	if (TinkerLaserStealer.checked) {
		TinkerLaserStealerOnInterval()
		Game.ScriptLogMsg("Script enabled: TinkerLaserStealer", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: TinkerLaserStealer", "#ff0000")
})