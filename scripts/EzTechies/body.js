var triggerradius = 425
var damage		= [300, 450, 600]
var scepterdamage = [450, 600, 750]
var RMines = []
var NoTarget = []
var BlowDelay = 0.25 + Fusion.MyTick * 3
var debug = true

function RemoveRMine(rmine) {
	var i = RMines.indexOf(rmine)
	if(i >= 0) {
		RMines.splice(i, 1)
		Particles.DestroyParticleEffect(Fusion.Particles.EzTechies[rmine], true)
	}
}

function RemoveNoTarget(ent) {
	var i = NoTarget.indexOf(ent)
	if(i >= 0)
		NoTarget.splice(i, 1)
}

function SummonParticle(range, ent) {
	var radius = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, ent)
	Particles.SetParticleControl(radius, 1, [range, 0, 0])
	Fusion.Particles.EzTechies[ent] = parseInt(radius)
}

function HandleEntity(ent) {
	if(Entities.GetUnitName(ent) === "npc_dota_techies_remote_mine") {
		var range = triggerradius
		RMines.push(ent)
	} else if(Entities.GetUnitName(ent) === "npc_dota_techies_land_mine")
		var range = 400
	else
		return
	
	SummonParticle(range, ent)
}

function RespawnParticles() {
	Entities.GetAllEntities().map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return !Entities.IsEnemy(ent) && Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent))
	}).forEach(HandleEntity)
}

function CallMines(MyEnt, ent, callback, explosionCallback) {
	var NeedMagicDmg = Fusion.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent))
	var RMinesToBlow = []
	var RMinesDmg = 0
	if(Fusion.GetMagicMultiplier(MyEnt, ent) === 0)
		return
	RMines.some(function(rmine) {
		var buffs = Game.GetBuffs(rmine)
		if(buffs.length === 0)
			return false
		
		var time = -1
		for(var k in buffs)
			if(Buffs.GetName(rmine, buffs[k]) === "modifier_techies_remote_mine")
				var time = Buffs.GetCreationTime(rmine, buffs[k])
		if(time === -1)
			return false
		
		var dmg = 0
		for(var z = Fusion.EzTechiesLVLUp.length; z >= 0; z--)
			if(Fusion.EzTechiesLVLUp[z] !== -1 && time > Fusion.EzTechiesLVLUp[z]) {
				if(Entities.HasScepter(MyEnt))
					dmg = scepterdamage[z]
				else
					dmg = damage[z]
				break
			}
		
		if(callback(MyEnt, ent, rmine)) {
			RMinesToBlow.push(rmine)
			RMinesDmg += dmg
			if(RMinesDmg > (NeedMagicDmg + dmg)) {
				if(debug)
					Game.ScriptLogMsg("[EzTechies] There's " + RMinesDmg + ", needed " + NeedMagicDmg + " for " + Entities.GetUnitName(ent), "#0000FF")
				explosionCallback(MyEnt, ent, RMinesToBlow, RMinesDmg)
				return true
			}
		} else
			return false
	})
}

function DenyMines(MyEnt) {
	var selected = false
	RMines.filter(function(ent) {
		return Entities.GetHealthPercent(ent) !== 100
	}).forEach(function(rmine) {
		GameUI.SelectUnit(rmine, false)
		Game.CastNoTarget(rmine, Entities.GetAbilityByName(rmine, "techies_remote_mines_self_detonate"), false)
		RemoveRMine(rmine)
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
		return Fusion.GetMagicMultiplier(MyEnt, ent) !== 0 && NoTarget.indexOf(ent) < 0 // filter out immune units
	}).forEach(function(ent) {
		var callBackCalled = false
		CallMines (
			MyEnt, ent,
			function(MyEnt, ent, rmine) {
				return Entities.GetRangeToUnit(rmine, ent) <= triggerradius
			},
			function(MyEnt, ent, RMinesToBlow) {
				callBackCalled = true
				RMinesToBlow.forEach(function(rmine) {
					GameUI.SelectUnit(rmine, false)
					Game.CastNoTarget(rmine, Entities.GetAbilityByName(rmine, "techies_remote_mines_self_detonate"), false)
					RemoveRMine(rmine)
				})
				NoTarget.push(ent)
				$.Schedule(BlowDelay, function() {
					RemoveNoTarget(ent)
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
					
					return Game.PointDistance(forceVec, mineVec) <= triggerradius
				},
				function(MyEnt, ent) {
					GameUI.SelectUnit(MyEnt,false)
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
	} else {
		Game.ScriptLogMsg("Script disabled: EzTechies", "#ff0000")
		return
	}
}

function UnsubscribeEvents() {
	if(Fusion.Subscribes.EzTechiesMinesSpawn)
		GameEvents.Unsubscribe(parseInt(Fusion.Subscribes.EzTechiesMinesSpawn))

	if(Fusion.Subscribes.UltiUp)
		GameEvents.Unsubscribe(parseInt(Fusion.Subscribes.UltiUp))
	
	if(Fusion.Subscribes.EzTechiesMineDeath)
		GameEvents.Unsubscribe(parseInt(Fusion.Subscribes.EzTechiesMineDeath))
}

function SubscribeEvents() {
	Fusion.Subscribes.UltiUp = GameEvents.Subscribe("dota_player_learned_ability", function(event) {
		if(event.PlayerID != Game.GetLocalPlayerID() || event.abilityname != "techies_remote_mines")
			return
		
		var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
		var lvl = Abilities.GetLevel(Entities.GetAbilityByName(MyEnt, "techies_remote_mines")) - 1
		Fusion.EzTechiesLVLUp[lvl] = Game.GetGameTime()
	})
	Fusion.Subscribes.EzTechiesMinesSpawn = GameEvents.Subscribe("npc_spawned", function(event) {
		var ent = parseInt(event.entindex)
		if(Entities.IsEnemy(ent))
			return
		HandleEntity(ent)
	})
	Fusion.Subscribes.EzTechiesMineDeath = GameEvents.Subscribe("entity_killed", function(event) {
		var ent = parseInt(event.entindex_killed)
		if(Entities.GetUnitName(ent) === "npc_dota_techies_remote_mine")
			RemoveRMine(ent)
	})
}

function init() {
	if(Fusion.Particles.EzTechies)
		Fusion.Particles.EzTechies.forEach(function(par) {
			try {
				Particles.DestroyParticleEffect(par, true)
			} catch(e) {  }
		})
	Fusion.Particles.EzTechies = []
	UnsubscribeEvents()
	Fusion.EzTechiesLVLUp = [-1, -1, -1]
	
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var lvl = Abilities.GetLevel(Entities.GetAbilityByName(MyEnt, "techies_remote_mines")) - 1
	Fusion.EzTechiesLVLUp[lvl] = Game.GetGameTime()

	RespawnParticles()
	SubscribeEvents()
}

init()
var EzTechies = Game.AddScript("EzTechies", EzTechiesCheckBoxClick)
