// pros would like this script
var TriggerRadius = 425
var RMinesDamage = [300, 450, 600]
var RMinesDamageScepter = [450, 600, 750]
var debug = false
var RMineSetupTime = 2

SummonParticle = (range, ent) => Particles.SetParticleControl(Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, ent), 1, [range, 0, 0])

var rmineTimeout = 598 // 600 is mine duration
ScheduleExplode = (rmine) => {
	$.Schedule(RMineSetupTime + Fusion.MyTick, () => {
		var time = Game.GetGameTime()
		var delta = time - rmineTimeout + Fusion.MyTick
		Game.GetBuffs(rmine).some(function(buff) {
			if(Buffs.GetName(rmine, buff) === "modifier_techies_remote_mine") {
				delta = time - Buffs.GetCreationTime(rmine, buff)
				return true
			}
			
			return false
		})
		
		if(debug)
			$.Msg(`RMine will be deleted after ${delta + rmineTimeout}s`)
		$.Schedule(delta + rmineTimeout, function() {
			if(Fusion.EzTechies.RMines.indexOf(rmine) < 0)
				return
			
			var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
			GameUI.SelectUnit(rmine, false)
			Game.CastNoTarget(rmine, Entities.GetAbilityByName(rmine, "techies_remote_mines_self_detonate"), false)
			GameUI.SelectUnit(MyEnt, false)
		})
	})
}

HandleEntity = ent => {
	if(Entities.GetUnitName(ent) === "npc_dota_techies_remote_mine") {
		var range = TriggerRadius
		Fusion.EzTechies.RMines.push(ent)
		ScheduleExplode(ent)
	} else if(Entities.GetUnitName(ent) === "npc_dota_techies_land_mine" || Entities.GetUnitName(ent) === "npc_dota_techies_stasis_trap")
		var range = 400
	else
		return
	
	SummonParticle(range, ent)
}

HandleMines = () => {
	Entities.GetAllEntities().filter(ent =>
		!Entities.IsEnemy(ent)
		&& Entities.IsAlive(ent)
		&& !(
			Entities.IsBuilding(ent)
			|| Entities.IsInvulnerable(ent)
		)
	).forEach(HandleEntity)
}

RemoteMines = (MyEnt, ents) => {
	var Ulti = Entities.GetAbility(MyEnt, 5)
	var UltiLvl = Abilities.GetLevel(Ulti)
	if(UltiLvl == 0)
		return
	
	var NeedMagicDmg = -1
	ents.forEach(function(ent) {
		var need = Fusion.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent) + Entities.GetHealthThinkRegen(ent) * 0.5)
		if(need > NeedMagicDmg)
			NeedMagicDmg = need
	})
	if(NeedMagicDmg === -1)
		return
	var RMinesToBlow = []
	var RMinesDmg = 0
	Fusion.EzTechies.RMines.some(function(rmine) {
		var time = -1
		Game.GetBuffs(rmine).some(function(buff) {
			if(Buffs.GetName(rmine, buff) === "modifier_techies_remote_mine") {
				time = Buffs.GetCreationTime(rmine, buff)
				return true
			}
			return false
		})
		if(time === -1)
			return false
		
		var dmg = -1
		for(var z = Fusion.EzTechies.LVLUp.length; z >= 0; z--)
			if(Fusion.EzTechies.LVLUp[z] !== -1 && time > Fusion.EzTechies.LVLUp[z])
				dmg = Entities.HasScepter(MyEnt) ? RMinesDamageScepter[z] : RMinesDamage[z]
		if(ents.some(function(ent) {
			return Entities.IsEntityInRange(rmine, ent, TriggerRadius)
		})) {
			RMinesToBlow.push(rmine)
			RMinesDmg += dmg
			if(debug)
				$.Msg(`[EzTechies] There's ${RMinesDmg}, needed ${NeedMagicDmg}`)
			if(RMinesDmg > NeedMagicDmg) {
				RMinesToBlow.forEach(function(rmine) {
					GameUI.SelectUnit(rmine, false)
					Game.CastNoTarget(rmine, Entities.GetAbilityByName(rmine, "techies_remote_mines_self_detonate"), false)
				})
				GameUI.SelectUnit(MyEnt, false)
				return
			}
		}
	})
}

SubscribeEvents = () => {
	if(!Fusion.Subscribes.UltiUp)
		Fusion.Subscribes.UltiUp = GameEvents.Subscribe("dota_player_learned_ability", function(event) {
			if(event.PlayerID != Game.GetLocalPlayerID() || event.abilityname != "techies_remote_mines")
				return
			
			var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
			var lvl = Abilities.GetLevel(Entities.GetAbilityByName(MyEnt, "techies_remote_mines")) - 1
			Fusion.EzTechies.LVLUp[lvl] = Game.GetGameTime()
		})

	if(!Fusion.Subscribes.EzTechiesMinesSpawn)
		Fusion.Subscribes.EzTechiesMinesSpawn = GameEvents.Subscribe("npc_spawned", function(event) {
			var ent = event.entindex
			if(Entities.IsEnemy(ent))
				return
			HandleEntity(ent)
		})

	if(!Fusion.Subscribes.EzTechiesMineDeath)
		Fusion.Subscribes.EzTechiesMineDeath = GameEvents.Subscribe("entity_killed", function(event) {
			var ent = event.entindex_killed
			if(Entities.GetUnitName(ent) === "npc_dota_techies_remote_mine")
				Fusion.EzTechies.RemoveRMine(ent)
		})
}

if(!Fusion.EzTechies) {
	Fusion.EzTechies = {
		LVLUp: [-1, -1, -1],
		RMines: [],
		RemoveRMine: rmine => Fusion.arrayRemove(Fusion.EzTechies.RMines, rmine)
	}
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var lvl = Abilities.GetLevel(Entities.GetAbilityByName(MyEnt, "techies_remote_mines")) - 1
	Fusion.EzTechies.LVLUp[lvl] = 0
	HandleMines()
}
SubscribeEvents()

if(!Fusion.Commands.EzTechies) {
	Fusion.Commands.EzTechies = () => {
		var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
		var ents = Game.GetEntitiesInRange(Game.GetScreenCursonWorldVec(), TriggerRadius, true)
		
		RemoteMines(MyEnt, ents.filter(ent => Fusion.GetMagicMultiplier(MyEnt, ent) !== 0))
	}
	Game.AddCommand("__EzTechies", Fusion.Commands.EzTechies, "", 0)
}