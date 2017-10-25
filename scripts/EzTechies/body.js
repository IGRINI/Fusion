var TriggerRadius = 425
var RMinesDamage = [300, 450, 600]
var RMinesDamageScepter = [450, 600, 750]
var RMines = []
var debug = true

function RemoveRMine(rmine) {
	var i = RMines.indexOf(rmine)
	if(i >= 0) {
		RMines.splice(i, 1)
		Particles.DestroyParticleEffect(Fusion.Particles.EzTechies[rmine], true)
	}
}

function SummonParticle(range, ent) {
	var radius = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, ent)
	Particles.SetParticleControl(radius, 1, [range, 0, 0])
	Fusion.Particles.EzTechies[ent] = parseInt(radius)
}

function HandleEntity(ent) {
	if(Entities.GetUnitName(ent) === "npc_dota_techies_remote_mine") {
		var range = TriggerRadius
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

function RemoteMines(MyEnt, ents) {
	var Ulti = Entities.GetAbility(MyEnt, 5)
	var UltiLvl = Abilities.GetLevel(Ulti)
	if(UltiLvl == 0)
		return
	
	var NeedMagicDmg = -1
	ents.forEach(function(ent) {
		var need = Fusion.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent) + Entities.GetHealthThinkRegen(ent) * 5)
		if(need > NeedMagicDmg)
			NeedMagicDmg = need
	})
	if(NeedMagicDmg === -1)
		return
	var RMinesToBlow = []
	var RMinesDmg = 0
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
					dmg = RMinesDamageScepter[z]
				else
					dmg = RMinesDamage[z]
				break
			}
		if(ents.some(function(ent) {
			return Entities.GetRangeToUnit(rmine, ent) <= TriggerRadius
		})) {
			RMinesToBlow.push(rmine)
			RMinesDmg += dmg
			if(RMinesDmg > NeedMagicDmg) {
				if(debug)
					Game.ScriptLogMsg("[EzTechies] There's " + RMinesDmg + ", needed " + NeedMagicDmg, "#0000ff")
				RMinesToBlow.forEach(function(rmine) {
					GameUI.SelectUnit(rmine, false)
					Game.CastNoTarget(rmine, Entities.GetAbilityByName(rmine, "techies_remote_mines_self_detonate"), false)
					RemoveRMine(rmine)
				})
				GameUI.SelectUnit(MyEnt, false)
				return
			}
		}
	})
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

Fusion.Commands.EzTechies = function() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var ents = Game.GetEntitiesInRange(Game.GetScreenCursonWorldVec(), TriggerRadius, true)
	
	RemoteMines(MyEnt, ents.filter(function(ent) {
		return Fusion.GetMagicMultiplier(MyEnt, ent) !== 0 // filter out immune units
	}))
}

init()
Game.AddCommand("__EzTechies", Fusion.Commands.EzTechies, "", 0)