var enabled = false,
	flag = false

function AutoLastHitF() {
	LastHit()

	if(enabled)
		$.Schedule(Fusion.MyTick, AutoLastHitF)
}

function LastHit() {
	if(flag)
		return
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var abil, abilRadius, abilDamageF, abilDelayF
	
	if((abil = Entities.GetAbilityByName(MyEnt, "pudge_rot")) !== -1) {
		var abilDelay = Abilities.GetSpecialValueFor(abil, "rot_tick"),
			abilDamage = Abilities.GetLevelSpecialValueFor(abil, "rot_damage", Abilities.GetLevel(abil) - 1),
			talent = Entities.GetAbilityByName(MyEnt, "special_bonus_unique_pudge_2")
		if(Abilities.GetLevel(talent) > 0)
			abilDamage += Abilities.GetSpecialValueFor(talent, "value")
		
		abilRadius = Abilities.GetSpecialValueFor(abil, "rot_radius")
		abilDelayF = () => abilDelay
		abilDamageF = (entFrom, entTo) => Fusion.CalculateDamage(entFrom, entTo, abilDamage, DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL)
		abilCastF = () => {
			if(Game.GetBuffsNames(MyEnt).indexOf("modifier_pudge_rot") === -1)
				Game.ToggleAbil(MyEnt, abil, false)
		}
	} else if((abil = Entities.GetAbilityByName(MyEnt, "bristleback_quill_spray")) !== -1) {
		var projectile_speed = Abilities.GetSpecialValueFor(abil, "projectile_speed"),
			abilLevel = Abilities.GetLevel(abil) - 1,
			baseDamage = Abilities.GetLevelSpecialValueFor(abil, "quill_base_damage", abilLevel),
			stackDamage = Abilities.GetLevelSpecialValueFor(abil, "quill_stack_damage", abilLevel),
			max_damage = Abilities.GetSpecialValueFor(abil, "max_damage"),
			talent = Entities.GetAbilityByName(MyEnt, "special_bonus_unique_bristleback_2")
		if(Abilities.GetLevel(talent) > 0)
			abilDamage += Abilities.GetSpecialValueFor(talent, "value")
		
		abilRadius = Abilities.GetSpecialValueFor(abil, "radius")
		abilDelayF = (ent1, ent2) => Entities.GetRangeToUnit(ent1, ent2) / projectile_speed
		abilDamageF = (entFrom, entTo) => {
			var stack_buff = Fusion.GetBuffByName(entTo, "modifier_bristleback_quill_spray"),
				stack_buff_damage = stack_buff ? Buffs.GetStackCount(entTo, stack_buff) * stackDamage : 0
			return Fusion.CalculateDamage(entFrom, entTo, Math.min(max_damage, baseDamage + stack_buff_damage), DAMAGE_TYPES.DAMAGE_TYPE_PHYSICAL)
		}
		abilCastF = () => Game.CastNoTarget(MyEnt, abil, false)
	} else
		abil = -1
	
	if (
		abil === -1
		|| Abilities.GetLevel(abil) === -1
		|| Abilities.GetCooldownTimeRemaining(abil) !== 0
		|| flag
		|| Abilities.GetLocalPlayerActiveAbility() !== -1
	)
		return
	
	[Entities.PlayersHeroEnts(), Entities.GetLaneCreeps()].some(ar => ar.filter(ent =>
		Entities.IsEntityInRange(MyEnt, ent, abilRadius)
		&& Entities.IsEnemy(ent)
		&& Entities.IsAlive(ent)
		&& Entities.GetHealth(ent) + Entities.GetHealthThinkRegen(ent) * (abilDelayF(MyEnt, ent) + Fusion.MyTick) < abilDamageF(MyEnt, ent)
	).some(ent => {
		var delay = abilDelayF(MyEnt, ent)
		if(Game.PointDistance(Game.VelocityWaypoint(MyEnt, delay), Game.VelocityWaypoint(ent, delay)) >= abilRadius)
			return false
		
		abilCastF()
		
		flag = true
		$.Schedule(delay, () => flag = false)
		return true
	}))
}

script = {
	name: "Auto LastHit",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			AutoLastHitF()
			Game.ScriptLogMsg("Script enabled: Auto LastHit", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: Auto LastHit", "#ff0000")
	},
	onDestroy: () => enabled = false
}