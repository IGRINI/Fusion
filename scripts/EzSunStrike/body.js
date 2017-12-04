var SunStrikeDamage = [ 100, 162, 225, 287, 350, 412, 475, 537 ]

EzSunstrikeOnInterval = () => {
	EzSunstrikeF()

	if(EzSunstrike.checked)
		$.Schedule(Fusion.MyTick, EzSunstrikeOnInterval)
}

EzSunstrikeF = () => {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()),
		SunStrike = Game.GetAbilityByName(MyEnt, "invoker_sun_strike"),
		SunStrikeDamageCur = SunStrikeDamage[Abilities.GetLevel(Game.GetAbilityByName(MyEnt, "invoker_exort")) - 2 + (Entities.HasScepter(MyEnt) ? 1 : 0)],
		SunStrikeDelay = Abilities.GetSpecialValueFor(SunStrike, "delay"),
		area_of_effect = Abilities.GetSpecialValueFor(SunStrike, "area_of_effect")
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt) || Abilities.GetCooldownTimeRemaining(SunStrike) !== 0)
		return
	
	Entities.PlayersHeroEnts().filter(ent =>
		Entities.IsAlive(ent)
		&& !(
			Entities.IsBuilding(ent)
			|| Entities.IsInvulnerable(ent)
		)
		&& Entities.IsEnemy(ent)
		&& (
			Entities.IsStunned(ent)
			|| Entities.IsRooted(ent)
		)
	).sort((ent1, ent2) => {
		var h1 = Entities.GetHealth(ent1)
		var h2 = Entities.GetHealth(ent2)
		
		if(h1 === h2)
			return 0
		if(h1 > h2)
			return 1
		else
			return -1
	}).filter(ent =>
		Entities.GetHealth(ent) <= SunStrikeDamageCur
	).forEach(ent => {
		var SunStrikeTime = Game.GetGameTime() + SunStrikeDelay,
			SunStrikePos = Game.VelocityWaypoint(ent, SunStrikeDelay)
		GameUI.SelectUnit(MyEnt, false)
		Game.CastPosition(MyEnt, SunStrike, SunStrikePos, false)
		//GameUI.PingMinimapAtLocation(SunStrikePos)
		$.Schedule(Fusion.MyTick, function() {
			var time = SunStrikeTime - Game.GetGameTime()
			if(time < 0)
				return
			var SunStrikePos2 = SunStrikePos = Game.VelocityWaypoint(ent, time)
			if(Game.PointDistance(SunStrikePos, SunStrikePos2) > area_of_effect) {
				Game.EntStop(MyEnt, false)
				//$.Msg(`Cancelled sunstrike, distance is ${Game.PointDistance(SunStrikePos, SunStrikePos2)}`)
			}
		})
	})
}

var EzSunstrike = Fusion.AddScript("EzSunstrike", () => {
	if (EzSunstrike.checked) {
		EzSunstrikeOnInterval()
		Game.ScriptLogMsg("Script enabled: EzSunstrike", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: EzSunstrike", "#ff0000")
})