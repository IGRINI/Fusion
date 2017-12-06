function AxeUltiOnCheckOnInterval() {
	AxeUltiF()

	if(AxeUlti.checked)
		$.Schedule(Fusion.MyTick, AxeUltiOnCheckOnInterval)
}

var flag = false
function AxeUltiF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()),
		Ulti = Entities.GetAbilityByName(MyEnt, "axe_culling_blade"),
		UltiLvl = Abilities.GetLevel(Ulti),
		kill_threshold = Abilities.GetLevelSpecialValueFor(Ulti, "kill_threshold", UltiLvl),
		UltiCastRange = Abilities.GetCastRangeFix(Ulti) + 75
	
	if (
		Entities.IsStunned(MyEnt)
		|| !Entities.IsAlive(MyEnt)
		|| UltiLvl === 0
		|| Abilities.GetCooldownTimeRemaining(Ulti) !== 0
		|| flag
		|| Abilities.GetLocalPlayerActiveAbility() !== -1
		|| Entities.GetMana(MyEnt) < Abilities.GetManaCost(Ulti)
	)
		return
	
	Entities.PlayersHeroEnts().filter(ent =>
		Entities.IsAlive(ent)
		&& !(
			Entities.IsBuilding(ent)
			|| Entities.IsInvulnerable(ent)
		)
		&& Entities.IsEnemy(ent)
		&& Entities.GetRangeToUnit(MyEnt, ent) <= UltiCastRange
		&& !Fusion.HasLinkenAtTime(ent, Abilities.GetCastPoint(Ulti) + Fusion.MyTick)
	).sort((ent1, ent2) => {
		var h1 = Entities.GetHealth(ent1)
		var h2 = Entities.GetHealth(ent2)
		
		if(h1 === h2)
			return 0
		if(h1 > h2)
			return 1
		else
			return -1
	}).every(ent => {
		if(Entities.GetHealth(ent) < kill_threshold) {
			CastUlti(MyEnt, Ulti, Abilities.GetCastPoint(Ulti), ent)
			return false
		} else
			return !Fusion.TryDagon(MyEnt, ent, kill_threshold, DAMAGE_TYPES.DAMAGE_TYPE_PURE)

		return true
	})
}

function CastUlti(MyEnt, Ulti, UltiCastPoint, ent) {
	GameUI.SelectUnit(MyEnt, false)
	Game.CastTarget(MyEnt, Ulti, ent, false)
	
	CastUltiFlag = true
	$.Schedule(UltiCastPoint, () => CastUltiFlag = false)
}

function CastDagon(MyEnt, Dagon, ent) {
	GameUI.SelectUnit(MyEnt, false)
	Game.CastTarget(MyEnt, Dagon, ent, false)
}

var AxeUlti = Fusion.AddScript("AutoultAxe", () => {
	if (AxeUlti.checked) {
		AxeUltiOnCheckOnInterval()
		Game.ScriptLogMsg("Script enabled: AxeUlti", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: AxeUlti", "#ff0000")
})