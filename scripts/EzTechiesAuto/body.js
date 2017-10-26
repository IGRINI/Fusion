var TriggerRadius = 425
var RMinesDamage		= [300, 450, 600]
var RMinesDamageScepter = [450, 600, 750]
var NoTarget = []
var BlowDelay = 0.25 + Fusion.MyTick * 10
var debug = true

function CallMines(MyEnt, ent, callback, explosionCallback) {
	var NeedMagicDmg = Fusion.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent))
	var RMinesToBlow = []
	var RMinesDmg = 0
	if(Fusion.GetMagicMultiplier(MyEnt, ent) === 0)
		return
	Fusion.EzTechies.RMines.some(function(rmine) {
		var buffs = Game.GetBuffs(rmine)
		if(buffs.length === 0)
			return false
		
		var time = -1
		buffs.forEach(function(buff) {
			if(Buffs.GetName(rmine, buff) === "modifier_techies_remote_mine")
				time = Buffs.GetCreationTime(rmine, buff)
		})
		if(time === -1)
			return false
		
		var dmg = 0
		for(var z = Fusion.EzTechies.LVLUp.length; z >= 0; z--)
			if(Fusion.EzTechies.LVLUp[z] !== -1 && time > Fusion.EzTechies.LVLUp[z])
				dmg = Entities.HasScepter(MyEnt) ? RMinesDamageScepter[z] : RMinesDamage[z]
		
		if(callback(MyEnt, ent, rmine)) {
			RMinesToBlow.push(rmine)
			RMinesDmg += dmg
			if(RMinesDmg > (NeedMagicDmg + dmg)) {
				if(debug)
					$.Msg("[EzTechies] There's " + RMinesDmg + ", needed ~" + NeedMagicDmg + " for " + Entities.GetUnitName(ent))
				explosionCallback(MyEnt, ent, RMinesToBlow, RMinesDmg)
				return true
			}
		} else
			return false
	})
}

function DenyMines(MyEnt) {
	var selected = false
	Fusion.EzTechies.RMines.filter(function(ent) {
		return Entities.GetHealthPercent(ent) !== 100
	}).forEach(function(rmine) {
		GameUI.SelectUnit(rmine, false)
		Game.CastNoTarget(rmine, Entities.GetAbilityByName(rmine, "techies_remote_mines_self_detonate"), false)
		selected = true
	})
	if(selected)
		GameUI.SelectUnit(MyEnt, false)
}

function RemoteMines(MyEnt, HEnts) {
	var Ulti = Entities.GetAbility(MyEnt, 5)
	var UltiLvl = Abilities.GetLevel(Ulti)
	if(UltiLvl == 0)
		return
	
	HEnts.filter(function(ent) {
		return Fusion.GetMagicMultiplier(MyEnt, ent) !== 0 && NoTarget.indexOf(ent) < 0 // filter out immune/excluded units
	}).forEach(function(ent) {
		var callBackCalled = false
		CallMines (
			MyEnt, ent,
			function(MyEnt, ent, rmine) {
				return Entities.GetRangeToUnit(rmine, ent) <= TriggerRadius
			},
			function(MyEnt, ent, RMinesToBlow) {
				callBackCalled = true
				RMinesToBlow.forEach(function(rmine) {
					GameUI.SelectUnit(rmine, false)
					Game.CastNoTarget(rmine, Entities.GetAbilityByName(rmine, "techies_remote_mines_self_detonate"), false)
				})
				NoTarget.push(ent)
				$.Schedule(BlowDelay, function() {
					Fusion.arrayRemove(NoTarget, ent)
				})
				GameUI.SelectUnit(MyEnt, false)
			}
		)
		
		var force = Game.GetAbilityByName(MyEnt,"item_force_staff")
		if (
			!callBackCalled &&
			force !== undefined &&
			Entities.IsAlive(MyEnt) &&
			Abilities.GetCooldownTimeRemaining(force) === 0 &&
			Entities.GetRangeToUnit(MyEnt, ent) <= Abilities.GetCastRangeFix(force)
		)
			CallMines (
				MyEnt, ent,
				function(MyEnt, ent, rmine) {
					var mineVec = Entities.GetAbsOrigin(rmine)
					var forceVec = Fusion.ForceStaffPos(ent)
					
					return Game.PointDistance(forceVec, mineVec) <= TriggerRadius
				},
				function(MyEnt, ent) {
					GameUI.SelectUnit(MyEnt, false)
					Game.CastTarget(MyEnt, force, ent, false)
				}
			)
	})

	return
}

function EzTechiesF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var HEnts = Game.PlayersHeroEnts().map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && Entities.IsEnemy(ent)
	}).sort(function(ent1, ent2) {
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
	if(EzTechies.checked)
		$.Schedule(Fusion.MyTick, EzTechiesF)
}

function EzTechiesCheckBoxClick() {
	if (EzTechies.checked) {
		if (Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) != "npc_dota_hero_techies") {
			EzTechies.checked = false
			Game.ScriptLogMsg("Error: Your hero must be Techies to run this script", "#ff0000")
			return
		}
		EzTechiesF()
		Game.ScriptLogMsg("Script enabled: EzTechies", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: EzTechies", "#ff0000")
}

var EzTechies = Game.AddScript("EzTechiesAuto", EzTechiesCheckBoxClick)
