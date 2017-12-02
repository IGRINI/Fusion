Fusion.MeepoClassname = "npc_dota_hero_meepo"
GetMeepos = () => {
	var playerID = Game.GetLocalPlayerID()
	return Entities.GetAllEntitiesByClassname(Fusion.MeepoClassname).filter(ent =>
		Entities.IsAlive(ent)
		&& !Entities.IsBuilding(ent)
		&& !Entities.IsEnemy(ent)
		&& !Entities.IsStunned(ent)
		&& !(
			WithCheck
			&& ent === To
		)
		&& Entities.IsControllableByPlayer(ent, playerID)
		&& !Entities.IsIllusion(ent)
	)
}

PoofAllMeeposToMeepo = (playerID, To, WithCheck, Queue) => GetMeepos().forEach(ent => {
	GameUI.SelectUnit(ent, false)
	Game.CastTarget(ent, Game.GetAbilityByName(ent, "meepo_poof"), To, Queue)
})

PoofAllMeeposToPos = (playerID, To, WithCheck, Queue) => GetMeepos().forEach(ent => {
	GameUI.SelectUnit(ent, false)
	Game.CastPosition(ent, Game.GetAbilityByName(ent, "meepo_poof"), To, Queue)
})

if(!Fusion.Commands.MeepoAutoPoof) {
	Fusion.Commands.MeepoAutoPoof = (flag, WithCheck) => {
		if (Players.GetPlayerSelectedHero(playerID) != Fusion.MeepoClassname){
			Game.ScriptLogMsg("MeepoAutoPoof: Not Meepo", "#cccccc")
			return
		}
		
		var MyEnt = Players.GetPlayerHeroEntityIndex(playerID)
		if(flag === 0) {
			var SelectedEnt = Players.GetLocalPlayerPortraitUnit()
			PoofAllMeeposToMeepo(playerID, SelectedEnt, WithCheck)
			GameUI.SelectUnit(SelectedEnt, false)
			return
		}
		if(flag === 1) {
			var EntsOnCursor = GameUI.FindScreenEntitiesOnCurson()
			if(EntsOnCursor.length != 0)
				PoofAllMeeposToMeepo(playerID, EntsOnCursor[0].entityIndex, WithCheck)
			else
				Game.ScriptLogMsg("MeepoAutoPoof: No Meepo at cursor", "#cccccc")
		}
		if(flag === 2)
			PoofAllMeeposToMeepo(playerID, MyEnt, WithCheck)
		if(flag === 3)
			PoofAllMeeposToPos(playerID, GameUI.GetCursorPosition(), WithCheck)
		GameUI.SelectUnit(MyEnt, false)
	}

	Game.AddCommand("__MeepoAutoPoof_ToSelected", () => Fusion.Commands.MeepoAutoPoof(0, true), "", 0)
	Game.AddCommand("__MeepoAutoPoof_ToCursor", () => Fusion.Commands.MeepoAutoPoof(1, true), "", 0)
	Game.AddCommand("__MeepoAutoPoof_ToMain", () => Fusion.Commands.MeepoAutoPoof(2, true), "", 0)
	Game.AddCommand("__MeepoAutoPoof_ToSelected_All", () => Fusion.Commands.MeepoAutoPoof(0, false), "", 0)
	Game.AddCommand("__MeepoAutoPoof_ToCursor_All", () => Fusion.Commands.MeepoAutoPoof(1, false), "", 0)
	Game.AddCommand("__MeepoAutoPoof_ToMain_All", () => Fusion.Commands.MeepoAutoPoof(2, false), "", 0)
}

if(!Fusion.Commands.MeepoCombo) {
	Fusion.Commands.MeepoCombo = () => {
		var playerID = Game.GetLocalPlayerID(),
			MyEnt = Players.GetPlayerHeroEntityIndex(playerID),
			Veil = Game.GetAbilityByName(MyEnt, "item_veil_of_discord"),
			pos = Game.GetScreenCursonWorldVec(),
			Blink = Game.GetAbilityByName(MyEnt, "item_blink")
		
		GameUI.SelectUnit(MyEnt, false)
		if(Blink !== undefined)
			Game.CastPosition(MyEnt, Blink, pos, false)
		if(Veil !== undefined)
			Game.CastPosition(MyEnt, Veil, pos, false)
		PoofAllMeeposToMeepo(playerID, MyEnt, false, true)
	}
	Game.AddCommand("__MeepoCombo", Fusion.Commands.MeepoCombo, "", 0)
}

if(!Fusion.Commands.MeepoEarthBind) {
	Fusion.Commands.MeepoEarthBind = pos => {
		var playerID = Game.GetLocalPlayerID()
		var MyEnt = Players.GetPlayerHeroEntityIndex(playerID)
		
		return Entities.GetAllEntitiesByClassname(MeepoName).filter(ent =>
			Entities.IsAlive(ent)
			&& !Entities.IsEnemy(ent)
			&& !Entities.IsStunned(ent)
			&& Entities.IsControllableByPlayer(ent, playerID)
			&& !Entities.IsIllusion(ent)
		).every(ent => {
			var Abil = Game.GetAbilityByName(ent, "meepo_earthbind")
			if(Abilities.GetCooldownTimeRemaining(Abil) === 0) {
				var EarthBind = Game.GetAbilityByName(ent, "meepo_earthbind")
				GameUI.SelectUnit(ent, false)
				Game.CastPosition(ent, EarthBind, pos, false)
				return false
			}
			return true
		})
	}
	Game.AddCommand("__MeepoEarthBind", () => Fusion.Commands.MeepoEarthBind(Game.GetScreenCursonWorldVec()), "", 0)
}