var enabled = false,
	flag = false

function AxeAutoUltOnInterval() {
	AxeAutoUltF()

	if(enabled)
		$.Schedule(Fusion.MyTick, AxeAutoUltOnInterval)
}

function AxeAutoUltF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()),
		Ulti = Entities.GetAbilityByName(MyEnt, "axe_culling_blade"),
		UltiLvl = Abilities.GetLevel(Ulti),
		kill_threshold = Abilities.GetLevelSpecialValueFor(Ulti, "kill_threshold", UltiLvl - 1),
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
		&& Entities.IsEntityInRange(MyEnt, ent, UltiCastRange)
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
	
	flag = true
	$.Schedule(UltiCastPoint, () => flag = false)
}

script = {
	name: "AutoUlt Axe",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			AxeAutoUltOnInterval()
			Game.ScriptLogMsg("Script enabled: Axe AutoUlt", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: Axe AutoUlt", "#ff0000")
	},
	onDestroy: () => enabled = false
}