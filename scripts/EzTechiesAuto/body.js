var NoTarget = [],
	BlowDelay = 0.25 + Fusion.MyTick * 10,
	enabled = false

function CallMines(MyEnt, Ulti, ent, callback, explosionCallback) {
	var TargetHP = Entities.GetHealth(ent) + Entities.GetHealthThinkRegen(ent) * 3
	var RMinesToBlow = []
	var RMinesDmg = 0
	
	Fusion.EzTechies.RMines.every(rmine => {
		var buffs = Game.GetBuffs(rmine)
		if(buffs.length === 0)
			return true
		
		var rmineTime = -1
		buffs.every(buff => {
			if(Buffs.GetName(rmine, buff) === "modifier_techies_remote_mine") {
				rmineTime = Buffs.GetCreationTime(rmine, buff)
				return false
			}
			return true
		})
		if(rmineTime === -1)
			return true
		
		var lvl = Fusion.EzTechies.LVLUp.filter(time => time !== -1 && rmineTime > time).reduce((previousValue, currentValue) => currentValue) // grabs last element from array
		var dmg = Abilities.GetLevelSpecialValueFor(Ulti, "damage" + (Entities.HasScepter(MyEnt) ? "_scepter" : ""), lvl - 1)
		
		if(callback(MyEnt, ent, rmine)) {
			RMinesToBlow.push(rmine)
			RMinesDmg += dmg
			var theres = Fusion.CalculateDamage(MyEnt, ent, RMinesDmg, DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL)
			if(TargetHP < theres) {
				if(Fusion.debug)
					$.Msg(`[EzTechiesAuto] There's ${theres}, needed ${TargetHP} for ${Entities.GetUnitName(ent)}`)
				explosionCallback(MyEnt, ent, RMinesToBlow, RMinesDmg)
				return false
			} else return !Fusion.TryDagon(MyEnt, ent, RMinesDmg, DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL)
		}
		
		return true
	})
}

function DenyMines(MyEnt) {
	var selected = false
	Fusion.EzTechies.RMines
		.filter(ent => Entities.GetHealthPercent(ent) !== 100)
		.forEach(rmine => {
			if(!Entities.IsAlive(rmine)) {
				Fusion.arrayRemove(Fusion.EzTechies.RMines, rmine)
				return
			}
			GameUI.SelectUnit(rmine, false)
			Game.CastNoTarget(rmine, Entities.GetAbilityByName(rmine, "techies_remote_mines_self_detonate"), false)
			selected = true
		})
	if(selected)
		GameUI.SelectUnit(MyEnt, false)
}

function RemoteMines(MyEnt, HEnts) {
	var Ulti = Entities.GetAbility(MyEnt, 5)
	var TriggerRadius = Abilities.GetSpecialValueFor(Ulti, "radius")
	var UltiLvl = Abilities.GetLevel(Ulti)
	if(UltiLvl == 0)
		return
	
	HEnts.filter(ent =>
		Fusion.GetMagicMultiplier(MyEnt, ent) !== 0
		&& NoTarget.indexOf(ent) < 0
	).forEach(ent => {
		var callBackCalled = false
		CallMines (
			MyEnt, Ulti, ent,
			(MyEnt, ent, rmine) => Entities.GetRangeToUnit(rmine, ent) <= TriggerRadius,
			(MyEnt, ent, RMinesToBlow) => {
				callBackCalled = true
				RMinesToBlow.forEach(rmine => {
					GameUI.SelectUnit(rmine, false)
					Game.CastNoTarget(rmine, Entities.GetAbilityByName(rmine, "techies_remote_mines_self_detonate"), false)
				})
				NoTarget.push(ent)
				$.Schedule(BlowDelay, () => Fusion.arrayRemove(NoTarget, ent))
				GameUI.SelectUnit(MyEnt, false)
			}
		)
		
		var force = Fusion.GetForceStaff(MyEnt)
		if (
			!callBackCalled &&
			force !== undefined &&
			Entities.IsAlive(MyEnt) &&
			Abilities.GetCooldownTimeRemaining(force) === 0 &&
			Entities.GetRangeToUnit(MyEnt, ent) <= Abilities.GetCastRangeFix(force)
		)
			CallMines (
				MyEnt, Ulti, ent,
				(MyEnt, ent, rmine) => {
					var mineVec = Entities.GetAbsOrigin(rmine)
					var forceVec = Fusion.ForceStaffPos(ent)
					
					return Game.PointDistance(forceVec, mineVec) <= TriggerRadius
				},
				(MyEnt, ent) => {
					GameUI.SelectUnit(MyEnt, false)
					Game.CastTarget(MyEnt, force, ent, false)
				}
			)
	})

	return
}

function EzTechiesF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var HEnts = Entities.PlayersHeroEnts().filter(ent =>
		Entities.IsAlive(ent)
		&& !(
			Entities.IsBuilding(ent)
			|| Entities.IsInvulnerable(ent)
		)
		&& Entities.IsEnemy(ent)
	).sort(function(ent1, ent2) {
		var h1 = Entities.GetHealth(ent1)
		var h2 = Entities.GetHealth(ent2)
		
		if(h1 === h2)
			return 0
		if(h1 > h2)
			return 1
		else
			return -1
	})

	RemoteMines(MyEnt, HEnts)
	DenyMines(MyEnt)
	if(enabled)
		$.Schedule(Fusion.MyTick, EzTechiesF)
}

script = {
	name: "EzTechiesAuto",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			EzTechiesF()
			Game.ScriptLogMsg("Script enabled: EzTechiesAuto", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: EzTechiesAuto", "#ff0000")
	},
	onDestroy: () => enabled = false
}