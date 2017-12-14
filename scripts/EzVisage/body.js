var enabled = false,
	isInvalid = false

function GetFamiliars() {
	return Entities.GetAllEntitiesByClassname("npc_dota_visage_familiar").filter(ent =>
		Entities.IsAlive(ent)
		&& !Entities.IsBuilding(ent)
		&& !Entities.IsEnemy(ent)
		&& !Entities.IsStunned(ent)
		&& Entities.IsControllableByPlayer(ent, Game.GetLocalPlayerID())
		&& !Entities.IsIllusion(ent)
	)
}

function EzVisageF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	Familiars(MyEnt)
	Souls(MyEnt)
}

var HealBarrierPercent = 50
function Familiars(MyEnt) {
	GetFamiliars().forEach(familiar => {
		var StoneForm = Entities.GetAbilityByName(familiar, "visage_summon_familiars_stone_form")
		if(Entities.GetHealthPercent(familiar) <= HealBarrierPercent)
			if(Abilities.GetCooldownTimeRemaining(StoneForm) === 0) {
				GameUI.SelectUnit(familiar, false)
				Game.CastNoTarget(familiar, StoneForm, false)
				GameUI.SelectUnit(MyEnt, false)
			} else
				GameUI.PingMinimapAtLocation(Entities.GetAbsOrigin(familiar))
	})
}

function Souls(MyEnt) {
	var Abil = Entities.GetAbilityByName(MyEnt, "visage_soul_assumption")
	if(Abilities.GetLevel(Abil) === 0 || Abilities.GetCooldownTimeRemaining(Abil) !== 0 || Entities.GetMana(MyEnt) < Abilities.GetManaCost(Abil))
		return
	var AbilRange = Abilities.GetCastRangeFix(Abil),
		AbilCastPoint = Abilities.GetCastPoint(Abil),
		buff = Fusion.GetBuffByName(MyEnt, "modifier_visage_soul_assumption")
	if(!buff)
		return
	
	var SoulDamage = 20 + 65 * (Buffs.GetStackCount(MyEnt, buff) || 0)
	if(SoulDamage === 0)
		return
	
	Entities.PlayersHeroEnts().filter(ent =>
		Entities.IsAlive(ent)
		&& !(
			Entities.IsBuilding(ent)
			|| Entities.IsInvulnerable(ent)
		)
		&& Entities.IsEnemy(ent)
		&& Entities.GetRangeToUnit(ent, MyEnt) <= AbilRange
		&& !Fusion.HasLinkenAtTime(ent, AbilCastPoint)
		&& Fusion.GetMagicMultiplier(MyEnt, ent) !== 0
		&& Entities.GetHealth(ent) < Fusion.CalculateDamage(MyEnt, ent, SoulDamage, DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL)
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
		GameUI.SelectUnit(MyEnt, false)
		Game.CastTarget(MyEnt, Abil, ent, false)
		return false
	})
}

function EzVisageOnInterval() {
	EzVisageF()
	if(isInvalid && GameUI.IsControlDown())
		GetFamiliars().forEach(familiar => GameUI.SelectUnit(familiar, true))

	if(enabled)
		$.Schedule(Fusion.MyTick, EzVisageOnInterval)
}

script = {
	name: "EzVisage",
	onPreload: () => Fusion.GetConfig("EzVisage").then(config => isInvalid = config.invalid_mode),
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			EzVisageOnInterval()
			Game.ScriptLogMsg("Script enabled: EzVisage", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: EzVisage", "#ff0000")
	},
	onDestroy: () => enabled = false
}