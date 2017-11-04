var DisablingAbils = [
	["item_force_staff", -1],
	["item_hurricane_pike", -1],
	["item_cyclone", -1],
	["invoker_deafening_blast", 1100], // FIXME: pointed are badly working now
	["invoker_tornado", 1000], // FIXME: pointed are badly working now
	["pudge_meat_hook", 1450], // FIXME: pointed are badly working now
	["keeper_of_the_light_blinding_light", -1] // FIXME: pointed are badly working now
]

var flag = false
function Disable(MyEnt, ent) {
	if(flag)
		return
	var distance = Entities.GetRangeToUnit(MyEnt, ent)
	DisablingAbils.some(function(ar) {
		var abil = Game.GetAbilityByName(MyEnt, ar[0])
		if(abil === undefined)
			return false
		var abilBehaviors = Fusion.Behaviors(abil)
		var speed = ar[1]
		if(distance > Abilities.GetCastRangeFix(abil) || !Abilities.IsCooldownReady(abil) || Abilities.IsHidden(abil) || !Abilities.IsActivated(abil))
			return false
		var monkeySpeed = 700
		if(speed === -1) {
			if(abilBehaviors.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_POINT) !== -1)
				Game.CastPosition(MyEnt, abil, Game.VelocityWaypoint(ent, Abilities.GetCastPoint(abil), monkeySpeed))
			else if(abilBehaviors.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_UNIT_TARGET) !== -1 || abilBehaviors.length === 0)
				Game.CastTarget(MyEnt, abil, ent)
		} else {
			var a = Entities.GetAbsOrigin(MyEnt),
				b = Entities.GetAbsOrigin(ent),
				forward = Entities.GetForward(MyEnt),
				reachtime = (distance / speed),
				angle = Game.AngleBetweenVectors(a, forward, b),
				rottime = Game.RotationTime(angle, 0.7),
				delay = Abilities.GetCastPoint(abil),
				time = reachtime + delay + rottime + Fusion.MyTick,
				predict = Game.VelocityWaypoint(ent, time, monkeySpeed)
			Game.CastPosition(MyEnt, abil, predict)
		}
		flag = true
		$.Schedule(1, function() {
			flag = false
		})
		return true
	})
}

function AntiMonkeyF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Game.IsGamePaused() || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Entities.PlayersHeroEnts().filter(function(ent) {
		return Entities.GetUnitName(ent) === "npc_dota_hero_monkey_king" && Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent))/* && Entities.IsEnemy(ent)*/
	}).some(function(ent) {
		var buffsNames = Game.GetBuffsNames(ent)
		buffsNames.some(function(buffName) {
			if(buffName === "modifier_monkey_king_bounce_leap") {
				Disable(MyEnt, ent)
				return true
			} else
				return false
		})
		//$.Msg(buffsNames)
	})
}

function AntiMonkeyToggle() {
	if (!AntiMonkey.checked) {
		Game.ScriptLogMsg("Script disabled: AntiMonkey", "#ff0000")
		return
	} else {
		function L() {
			if (AntiMonkey.checked) {
				AntiMonkeyF()
				$.Schedule(Fusion.MyTick, L)
			}
		}
		L()
		Game.ScriptLogMsg("Script enabled: AntiMonkey", "#00ff00")
	}
}

var AntiMonkey = Fusion.AddScript("AntiMonkey", AntiMonkeyToggle)