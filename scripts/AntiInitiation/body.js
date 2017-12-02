// 3rd arg means that this ability can"t be disabled because of castpoint (ex. eul has 0.0 castpoint)
var HexAbils = [
	["item_sheepstick", true, true],
	["lion_voodoo", true, true],
	["shadow_shaman_voodoo", true, true]
]

var DisableAbils = [
	["item_orchid", true, true],
	["item_bloodthorn", true, true],
	["item_cyclone", true, true],
	["axe_berserkers_call" , false],
	["legion_commander_duel", false],
	["puck_waning_rift", true],
	["crystal_maiden_frostbite", true],
	["skywrath_mage_ancient_seal", true]
]

var StunAbils = [
	["dragon_knight_dragon_tail", false],
	["tidehunter_ravage", false],
	["earthshaker_echo_slam", true],
	["earthshaker_fissure", false],
	["magnataur_reverse_polarity", false],
	["beastmaster_primal_roar", false],
	["treant_overgrowth", false],
	["faceless_void_chronosphere", false],
	["batrider_flaming_lasso", true],
	["slardar_slithereen_crush", false],
	["enigma_black_hole", false],
	["shadow_shaman_shackles", false],
	["sven_storm_bolt", true],
	["lion_impale", true],
	["centaur_hoof_stomp", false],
	["vengefulspirit_magic_missile", true],
	["sand_king_burrowstrike", false],
	["nyx_assassin_impale", true],
	["chaos_knight_chaos_bolt", false],
	["tiny_avalanche", true],
	["ogre_magi_fireblast", true],
	["obsidian_destroyer_astral_imprisonment", true],
	["rubick_telekinesis", false],
	["pudge_dismember", true],
	["invoker_cold_snap", true],
	["invoker_tornado", true],
	["dark_seer_vacuum", true],
	["bane_nightmare", true]
]

var OtherAbils = [
	["dark_seer_wall_of_replica", false],
	["queenofpain_sonic_wave", false],
	["juggernaut_omni_slash", false],
	["slark_pounce", false],
	["axe_culling_blade", false]
]

var Abils = [
	HexAbils,
	DisableAbils,
	StunAbils,
	OtherAbils
]

GetAbilArray = abilNameToSearch => {
	var abilArFound
	Abils.every(ar => ar.every(abilAr => {
		var abilName = abilAr[0]
		var abilToUse = abilAr[1]
		if(abilName !== abilNameToSearch)
			return true
		
		abilArFound = abilAr
		return false
	}))
	
	return abilArFound
}

var flags = []
AntiInitiationF = () => {
	if(!AntiInitiation.checked)
		return
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	Entities.PlayersHeroEnts().filter(ent =>
		Entities.IsAlive(ent)
		&& Entities.IsEnemy(ent)
		&& !(
			Entities.IsBuilding(ent)
			|| Entities.IsInvulnerable(ent)
		)
	).every(ent => {
		if(flags[ent])
			return true
		for(var m = 0; m < Entities.GetAbilityCount(ent); m++) {
			if(Disable(MyEnt, ent, Entities.GetAbility(ent, m)))
				return false
		}
		if(Game.GetBuffsNames(ent).indexOf("modifier_teleporting") !== -1) {
			var abil
			StunAbils.every(abilAr => {
				var abilName = abilAr[0]
				var abilToUse = abilAr[1]
				if(!abilToUse)
					return true
				
				var abilL = Game.GetAbilityByName(MyEnt, abilName)
				if(abilL === undefined)
					return true
				var abilrange = Abilities.GetCastRangeFix(abilL)
				if (
					Abilities.GetCooldownTimeRemaining(abilL) !== 0 ||
					(
						Entities.GetRangeToUnit(MyEnt, ent) > abilrange &&
						abilrange !== 0
					)
				)
					return true
				
				abil = abilL
				return false
			})
			
			if(abil !== undefined) {
				GameUI.SelectUnit(MyEnt, false)
				Game.EntStop(MyEnt, false)
				
				var Behavior = Fusion.Behaviors(abil)
				if(Behavior.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_NO_TARGET) !== -1)
					Game.CastNoTarget(MyEnt, abil, false)
				else if(Behavior.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_POINT) !== -1)
					Abilities.CreateDoubleTapCastOrder(abil, MyEnt)
				else if(Behavior.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_UNIT_TARGET) !== -1)
					Game.CastTarget(MyEnt, abil, ent, false)
				flags[ent] = true
				$.Schedule(1, () => flags[ent] = false)
				return false
			}
		}
		
		return true
	})
}

Disable = (MyEnt, ent, Abil) => {
	var AbilName = Abilities.GetAbilityName(Abil)
	if (
		Abil === -1 ||
		!Abilities.IsInAbilityPhase(Abil) ||
		Abilities.GetCooldownTimeRemaining(Abil) !== 0 ||
		Abilities.GetLevel(Abil) === 0 ||
		GetAbilArray(Abilities.GetAbilityName(Abil)) === undefined
	)
		return false
	var AbilAr = GetAbilArray(AbilName)
	if(AbilAr !== undefined && AbilAr[2])
		return false
	var abil
	Abils.every(ar => !ar.some(abilAr => {
		var abilName = abilAr[0]
		var abilToUse = abilAr[1]
		if(!abilToUse)
			return false
		
		var abilL = Game.GetAbilityByName(MyEnt, abilName)
		var abilrange = Abilities.GetCastRangeFix(abilL)
		if (
			abilL === undefined ||
			Abilities.GetCooldownTimeRemaining(abilL) !== 0 ||
			(
				Entities.GetRangeToUnit(MyEnt, ent) > abilrange &&
				abilrange !== 0
			)
		)
			return false
		
		abil = abilL
		return true
	}))
	if(abil === undefined)
		return false
	
	GameUI.SelectUnit(MyEnt, false)
	Game.EntStop(MyEnt, false)
	
	var Behavior = Fusion.Behaviors(abil)
	if(Behavior.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_NO_TARGET) !== -1)
		Game.CastNoTarget(MyEnt, abil, false)
	else if(Behavior.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_POINT) !== -1)
		Abilities.CreateDoubleTapCastOrder(abil, MyEnt)
	else if(Behavior.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_UNIT_TARGET) !== -1)
		Game.CastTarget(MyEnt, abil, ent, false)
	flags[ent] = true
	$.Schedule(1, () => flags[ent] = false)
	return true
}


AntiInitiationToggle = () => {
	if (!AntiInitiation.checked){
		Game.ScriptLogMsg("Script disabled: AntiInitiation", "#ff0000")
		return
	} else {
		f = () => {
			$.Schedule (
				Fusion.MyTick,
				() => {
					AntiInitiationF()
					if(AntiInitiation.checked)
						f()
				}
			)
		}
		f()
		Game.ScriptLogMsg("Script enabled: AntiInitiation", "#00ff00")
	}
}

var AntiInitiation = Fusion.AddScript("AntiInitiation", AntiInitiationToggle)