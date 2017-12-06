function SummonParticle(range, ent) {
	Particles.SetParticleControl(Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, ent), 1, [range, 0, 0])
}

var rmineTimeout = 598 // 600 is mine duration
function ScheduleExplode(rmine) {
	$.Schedule(2 + Fusion.MyTick, () => {
		var time = Game.GetGameTime()
		var delta = time - rmineTimeout + Fusion.MyTick
		Game.GetBuffs(rmine).every(buff => {
			if(Buffs.GetName(rmine, buff) === "modifier_techies_remote_mine") {
				delta = time - Buffs.GetCreationTime(rmine, buff)
				return false
			}
			return true
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

function HandleEntity(ent) {
	var TriggerRadius = Abilities.GetSpecialValueFor(Entities.GetAbility(Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()), 5), "radius")
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

function HandleMines() {
	Entities.GetAllEntities().filter(ent =>
		!Entities.IsEnemy(ent)
		&& Entities.IsAlive(ent)
		&& !(
			Entities.IsBuilding(ent)
			|| Entities.IsInvulnerable(ent)
		)
	).forEach(HandleEntity)
}

function RemoteMines(MyEnt, ents) {
	var Ulti = Entities.GetAbility(MyEnt, 5)
	var TriggerRadius = Abilities.GetSpecialValueFor(Ulti, "radius")
	var UltiLvl = Abilities.GetLevel(Ulti)
	if(UltiLvl == 0)
		return
	
	var NeedMagicDmg = -1
	ents.forEach(ent => {
		var need = Fusion.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent) + Entities.GetHealthThinkRegen(ent) * 0.5)
		if(need > NeedMagicDmg)
			NeedMagicDmg = need
	})
	if(NeedMagicDmg === -1)
		return
	var RMinesToBlow = []
	var RMinesDmg = 0
	Fusion.EzTechies.RMines.every(function(rmine) {
		var rmineTime = -1
		Game.GetBuffs(rmine).every(buff => {
			if(Buffs.GetName(rmine, buff) === "modifier_techies_remote_mine") {
				rmineTime = Buffs.GetCreationTime(rmine, buff)
				return false
			}
			return true
		})
		if(rmineTime === -1)
			return true
		
		var dmg = -1
		Fusion.EzTechies.LVLUp
			.filter(time => time !== -1 && rmineTime > time)
			.every((time, lvl) => dmg = Abilities.GetLevelSpecialValueFor(Ulti, "damage" + (Entities.HasScepter(MyEnt) ? "_scepter" : ""), lvl))
		if(ents.some(ent => Entities.IsEntityInRange(rmine, ent, TriggerRadius))) {
			RMinesToBlow.push(rmine)
			RMinesDmg += dmg
			if(Fusion.debug)
				$.Msg(`[EzTechies] There's ${RMinesDmg}, needed ${NeedMagicDmg}`)
			if(RMinesDmg > NeedMagicDmg) {
				RMinesToBlow.forEach(rmine => {
					GameUI.SelectUnit(rmine, false)
					Game.CastNoTarget(rmine, Entities.GetAbilityByName(rmine, "techies_remote_mines_self_detonate"), false)
				})
				GameUI.SelectUnit(MyEnt, false)
				return false
			}
		}

		return true
	})
}

function SubscribeEvents() {
	if(!Fusion.Subscribes.UltiUp)
		Fusion.Subscribes.UltiUp = GameEvents.Subscribe("dota_player_learned_ability", event => {
			if(event.PlayerID != Game.GetLocalPlayerID() || event.abilityname != "techies_remote_mines")
				return
			
			var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
			var lvl = Abilities.GetLevel(Entities.GetAbilityByName(MyEnt, "techies_remote_mines")) - 1
			Fusion.EzTechies.LVLUp[lvl] = Game.GetGameTime()
		})

	if(!Fusion.Subscribes.EzTechiesMinesSpawn)
		Fusion.Subscribes.EzTechiesMinesSpawn = GameEvents.Subscribe("npc_spawned", event => {
			var ent = event.entindex
			if(Entities.IsEnemy(ent))
				return
			HandleEntity(ent)
		})

	if(!Fusion.Subscribes.EzTechiesMineDeath)
		Fusion.Subscribes.EzTechiesMineDeath = GameEvents.Subscribe("entity_killed", event => {
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
		var TriggerRadius = Abilities.GetSpecialValueFor(Entities.GetAbility(MyEnt, 5), "radius")
		var ents = Game.GetEntitiesInRange(Game.GetScreenCursonWorldVec(), TriggerRadius, true)
		
		RemoteMines(MyEnt, ents.filter(ent => Fusion.GetMagicMultiplier(MyEnt, ent) !== 0))
	}
	Game.AddCommand("__EzTechies", Fusion.Commands.EzTechies, "", 0)
}