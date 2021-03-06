Fusion.LenseBonusRange = 250
Fusion.ForceStaffUnits = 600
Fusion.LinkenTargetName = "modifier_item_sphere_target"
Fusion.ForceStaffNames = [
	"item_force_staff",
	"item_hurricane_pike",
]

Entities.FindRotationAngle = (ent, pos) => {
	var entPos = Entities.GetAbsOrigin(ent),
		angle = Math.abs(Math.atan2(pos[1] - entPos[1], pos[0] - entPos[0]) - Fusion.Vector2Angle(Entities.GetForward(ent)))

	if (angle > Math.PI)
		angle = Math.abs((Math.PI * 2) - angle)

	return angle
}
Entities.InFront = (ent, dist) => Fusion.VectorRotation(Entities.GetAbsOrigin(ent), Entities.GetForward(ent), dist || Game.GetSpeed_IsMoving(ent))
Entities.GetAllLaneCreeps = () => Entities.GetAllEntitiesByClassname("npc_dota_creep_siege").concat(Entities.GetAllEntitiesByClassname("npc_dota_creep_lane"))
Entities.GetAllCreeps = () => Entities.GetAllEntities().filter(ent => Entities.IsCreep(ent))

Fusion.ExtendVector = (vec1, vec2, units) => Fusion.VectorRotation(vec1, Fusion.Angle2Vector(Fusion.AngleBetweenTwoVectors(vec1, vec2)), units)
Fusion.AngleBetweenTwoVectors = (vec1, vec2) => Math.atan2(vec1[1] - vec2[1], vec1[0] - vec2[0])
Fusion.VectorRotation = (vec, rotation, units) => [vec[0] + rotation[0] * units, vec[1] + rotation[1] * units, vec[2] + rotation[2] * units]
Fusion.Vector2Angle = vec => Math.atan2(vec[1], vec[0])
Fusion.Angle2Vector = angle => [Math.cos(angle), Math.sin(angle), 0]

Entities.CanBeVisible = ent => {
	var truesight = Game.GetBuffs(ent).some(buff => ["modifier_item_dustofappearance", "modifier_truesight"].indexOf(Buffs.GetName(ent, buff)) > -1)
	return !(!truesight && Entities.IsInvisible(ent))
}

Fusion.GetChopItem = ent => {
	var result;
	[
		"item_quelling_blade",
		"item_bfury",
		"item_tango"
	].every(itemName => {
		let item = Game.GetAbilityByName(ent, itemName)
		if(item !== undefined) {
			result = item
			return false
		}
		return true
	})
	
	return result
}

Entities.IsRune = ent => !Entities.IsTree(ent) && !Entities.IsSelectable(ent) && !Entities.IsItemPhysical(ent) && eq(Entities.GetUp(ent), [0, 0, 1])

Entities.IsTree = ent => ent > 10000

function eq(ar1, ar2) {
	return !ar1.some((el, id) => ar2[id] !== el)
}

Game.GetHideItem = ent => {
	var ret;
	[
		"item_shadow_amulet", // shadow amulet
		"item_glimmer_cape",  // glimmer cape
		"item_silver_edge",   // silver edge,  doesn't ignore attack/other abils
		"item_invis_sword"    // shadow blade, doesn't ignore attack/other abils
	].every(itemName => {
		var item = Game.GetAbilityByName(ent, itemName)
		if(item !== undefined) {
			ret = item
			return false
		}

		return true
	})

	return ret
}

Fusion.DrawLineInGameWorld = (a, b) => {
	var temp = Particles.CreateParticle("particles/ui_mouseactions/bounding_area_view_a.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN, 0)
	Particles.SetParticleControl(temp, 0, a)
	Particles.SetParticleControl(temp, 1, b)
	return temp
}

Entities.IsMine = ent =>
	[
		"npc_dota_techies_remote_mine",
		"npc_dota_techies_stasis_trap"
	].indexOf(Entities.GetUnitName(ent)) > -1

Fusion.GetForceStaff = ent => {
	var item
	Fusion.ForceStaffNames.some(name => (item = Game.GetAbilityByName(ent, name)) !== undefined)
	return item
}

Fusion.BuildNearMap = (ents, maxRadius) => {
	var ignore = []
	return ents.map(ent => {
		ignore.push(ent)
		return [ent, Fusion.FindNearestEntity(ent, ents, ignore)]
	})
}

Fusion.FindNearestEntity = (ent, ents, ignore) => {
	ignore = ignore || []
	var ret = ents.reduce((prev, cur) => {
		if(prev === ent || ignore.indexOf(prev) > 0)
			return cur
		if(cur === ent || ignore.indexOf(cur) > 0)
			return prev
		
		if(Entities.GetRangeToUnit(ent, cur) < Entities.GetRangeToUnit(ent, prev))
			return cur
		else
			return prev
	})
	return ret !== ent ? ret : undefined
}

Fusion.TryEtherial = (MyEnt, ent, damage, damage_type) => {}

/**
 * Tries dagon
 * @param {*} MyEnt entity that'll output damage
 * @param {*} ent entity that'll receive damage
 * @param {*} damage damage that we already have
 * @param {*} damage_type damage type that we already have
 * @returns used dagon or not
 */
Fusion.TryDagon = (MyEnt, ent, damage, damage_type) => {
	damage = damage || 0
	damage_type = damage_type || DAMAGE_TYPES.DAMAGE_TYPE_NONE
	var Dagon = Fusion.GetDagon(MyEnt),
		TargetHP = Entities.GetHealth(ent) + Entities.GetHealthThinkRegen(ent) * 3
	if(Dagon) {
		var DagonDamage = Fusion.GetDagonDamage(Dagon)
		var DagonRange = Abilities.GetCastRange(Dagon)
		if(Abilities.GetCooldownTimeRemaining(Dagon) === 0 && TargetHP < Fusion.CalculateDamage(MyEnt, ent, DagonDamage, DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL) + Fusion.CalculateDamage(MyEnt, ent, damage, damage_type) && Entities.IsEntityInRange(MyEnt, ent, DagonRange)) {
			GameUI.SelectUnit(MyEnt, false)
			Game.CastTarget(MyEnt, Dagon, ent, false)
			return true
		}
	}

	return false
}

Fusion.GetDagon = MyEnt => {
	var item
	[
		"item_dagon",
		"item_dagon_2",
		"item_dagon_3",
		"item_dagon_4",
		"item_dagon_5"
	].some(DagonName => {
		var itemZ = Game.GetAbilityByName(MyEnt, DagonName)
		if(itemZ !== undefined) {
			item = itemZ
			return true
		}
		return false
	})
	
	return item
}

Fusion.GetDagonDamage = dagon => {
	if(dagon === undefined)
		return undefined
	
	return Abilities.GetLevelSpecialValueFor(dagon, "damage", Abilities.GetLevel(dagon) - 1)
}

Fusion.GetEntitiesOnPosition = vec => {
	return GameUI.FindScreenEntities (
		[
			Game.WorldToScreenX(vec[0], vec[1], vec[2]),
			Game.WorldToScreenY(vec[0], vec[1], vec[2])
		]
	).map(entData => entData.entityIndex)
}

GameUI.FindScreenEntitiesAtCursor = () => GameUI.FindScreenEntities(GameUI.GetCursorPosition()).map(entData => entData.entityIndex).filter((item, pos, ar) => ar.indexOf(item) === pos)

Fusion.GetBuffByName = (ent, buffName) => {
	var ret = undefined
	Game.GetBuffs(ent).some(buff => {
		if(Buffs.GetName(ent, buff) === buffName) {
			ret = buff
			return true
		}

		return false
	})
	
	return ret
}

Fusion.HasLinkenAtTime = (ent, time) => {
	time = time || 0;
	var sphere = Game.GetAbilityByName(ent, "item_sphere")

	return (
		sphere !== undefined &&
		Abilities.GetCooldownTimeRemaining(sphere) - time <= 0
	) || Fusion.GetBuffByName(ent, Fusion.LinkenTargetName) !== undefined
}

Fusion.DeepEquals = (x, y) => {
	if((typeof x == "object" && x != null) && (typeof y == "object" && y != null)) {
		if(Object.keys(x).length != Object.keys(y).length)
			return false;

		for (var prop in x) {
			if (y.hasOwnProperty(prop))	
				if (!Fusion.DeepEquals(x[prop], y[prop]))
					return false;
			else
				return false;
		}

		return true;
	} else
		return x === y
}

Game.GetScreenCursonWorldVec = () => {
	var curPos = GameUI.GetCursorPosition()
	return Game.ScreenXYToWorld(curPos[0], curPos[1])
}

Abilities.GetCastRangeFix = abil => { // Don"t redefine internals
	var AbilRange = Abilities.GetCastRange(abil)
	var Caster = Abilities.GetCaster(abil)
	
	var Behaviors = Fusion.Behaviors(abil)
	if(Entities.HasItemInInventory(Caster, "item_aether_lens") && (Behaviors.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_POINT) !== -1 || Behaviors.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_UNIT_TARGET) !== -1))
		AbilRange += Fusion.LenseBonusRange
	
	return AbilRange
}

Fusion.ForceStaffPos = ent => Entities.InFront(ent, Fusion.ForceStaffUnits)

Fusion.BuffsAbsorbMagicDmg = {
	"modifier_item_pipe_barrier": {
		absorbs: 400,
		damageType: DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL
	},
	"modifier_item_hood_of_defiance_barrier": {
		absorbs: 400,
		damageType: DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL
	},
	"modifier_item_infused_raindrop": {
		absorbs: 120,
		damageType: DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL
	},
	"modifier_ember_spirit_flame_guard": {
		absorbs: [50, 200, 350, 500],
		damageType: DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL
	},
	"modifier_abaddon_aphotic_shield": {
		absorbs: [110, 140, 170, 200],
		damageType: DAMAGE_TYPES.DAMAGE_TYPE_ALL
	}
}
Fusion.GetAbsorbedDamage = (entTo, damageType) => {
	var dmg = 0
	Game.GetBuffs(entTo).forEach(enemyBuff => {
		var enemyBuffName = Buffs.GetName(entTo, enemyBuff)
		var absorbBuff = Fusion.BuffsAbsorbMagicDmg[enemyBuffName]
		if(!absorbBuff || (absorbBuff.damageType !== DAMAGE_TYPES.DAMAGE_TYPE_ALL && absorbBuff.damageType !== damageType))
			return
		
		if(Array.isArray(absorbBuff.absorbs))
			dmg += absorbBuff.absorbs[Abilities.GetLevel(Buffs.GetAbility(entTo, enemyBuff)) - 1]
		else
			dmg += absorbBuff.absorbs
	})

	return dmg
}

Fusion.IgnoreBuffs = {
	1: [], // DAMAGE_TYPES.DAMAGE_TYPE_PHYSICAL
	2: [   // DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL
		"modifier_life_stealer_rage",
		"modifier_oracle_fates_edict",
		"modifier_medusa_stone_gaze",
		"modifier_juggernaut_blade_fury",
		"modifier_omniknight_repel",
	],
	4: [], // DAMAGE_TYPES.DAMAGE_TYPE_PURE
	8: [], // DAMAGE_TYPES.DAMAGE_TYPE_HP_REMOVAL
	7: [   // DAMAGE_TYPES.DAMAGE_TYPE_ALL
		"modifier_abaddon_borrowed_time",
		"modifier_skeleton_king_reincarnation_scepter_active",
		"modifier_brewmaster_primal_split",
		"modifier_phoenix_supernova_hiding",
		"modifier_nyx_assassin_spiked_carapace",
		"modifier_templar_assassin_refraction_absorb",
		"modifier_oracle_false_promise",
		"modifier_dazzle_shallow_grave",
		"modifier_treant_living_armor",
		"modifier_item_aegis",
		"modifier_tusk_snowball_movement",
		"modifier_eul_cyclone",
	]
}
Fusion.GetMagicMultiplier = (entFrom, entTo) => {
	var multiplier = Entities.GetMagicalArmorValue(entTo)
	
	if(Game.IntersecArrays(Game.GetBuffsNames(entTo), Fusion.IgnoreBuffs[DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL]) || multiplier == 1)
		return 0
	
	return 1 + multiplier
}

Fusion.GetNeededMagicDmg = (entFrom, entTo, dmg) => dmg * Fusion.GetMagicMultiplier(entFrom, entTo)

Fusion.CalculateDamage = (entFrom, entTo, damage, damage_type) => {
	damage -= Fusion.GetAbsorbedDamage(entTo, damage_type)
	
	if(damage <= 0 || Game.IntersecArrays(Game.GetBuffsNames(entTo), Fusion.IgnoreBuffs[damage_type]))
		return 0
	
	switch(damage_type) {
		case DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL:
			damage *= 1 - Entities.GetMagicalArmorValue(entTo)
			break
		case DAMAGE_TYPES.DAMAGE_TYPE_PHYSICAL:
			var armor = Entities.GetPhysicalArmorValue(entTo)
			damage *= (1 - (armor * 0.05) / (1 + Math.abs(armor) * 0.05))
			break
		case DAMAGE_TYPES.DAMAGE_TYPE_NONE:
			damage = 0
		case DAMAGE_TYPES.DAMAGE_TYPE_HP_REMOVAL:
		case DAMAGE_TYPES.DAMAGE_TYPE_PURE:
		case DAMAGE_TYPES.DAMAGE_TYPE_ALL:
		default:
			break
	}

	return damage
}

Game.AngleBetweenVectors = (vec1, vec2) => Math.atan2(Math.abs(vec1[0] - vec2[0]), Math.abs(vec1[1] - vec2[1]))
Game.AngleBetweenTwoFaces = (a_facing, b_facing) => Math.acos((a_facing[0] * b_facing[0]) + (a_facing[1] * b_facing[1]))
Game.RotationTime = (angle, rotspeed) => Fusion.MyTick * angle / rotspeed // angle is npc_heroes MovementTurnRate
Game.GetEntitiesInRange = (pos, range, onlyEnemies) => Entities.PlayersHeroEnts().filter(ent =>
	(!onlyEnemies || Entities.IsEnemy(ent))
	&& Entities.IsAlive(ent)
	&& !Entities.IsInvulnerable(ent)
	&& Game.PointDistance(pos, Entities.GetAbsOrigin(ent)) < range
)

Entities.NearestToMouse = (MyEnt, range, onlyEnemies) => {
	var curVec = Game.GetScreenCursonWorldVec(),
		ents = Array.prototype.orderBy.call(Game.GetEntitiesInRange(curVec, range, onlyEnemies), ent => Game.PointDistance(Entities.GetAbsOrigin(ent), curVec))
	
	return ents.length > 0 ? ents[0] : undefined
}

Game.GetAbilityByName = (ent, name) => {
	var ab = Entities.GetAbilityByName(ent, name)
	if (ab !== -1)
		return ab
	
	for(var i = 0; i < 7; i++) {
		var item = Entities.GetItemInSlot(ent, i)
		if(Abilities.GetAbilityName(item) === name)
			return item
	}
}

Game.GetSpeed = ent => Entities.GetMoveSpeedModifier(ent, Entities.GetBaseMoveSpeed(ent))
Game.GetSpeed_IsMoving = ent => Entities.IsMoving(ent) ? Game.GetSpeed(ent) : 0

Game.VelocityWaypoint = (ent, time, movespeed) => {
	var zxc = Entities.GetAbsOrigin(ent)
	var forward = Entities.GetForward(ent)
	movespeed = movespeed || Game.GetSpeed_IsMoving(ent)

	return [zxc[0] + (forward[0] * movespeed * time), zxc[1] + (forward[1] * movespeed * time), zxc[2]]
}

//Функция делает панельку перемещаемой кликом мыши по ней. callback нужен например для того, чтобы сохранить координаты панели в файл
GameUI.MovePanel = (a, callback) => {
	var onactivateF = () => {
		var m = true
		if (!GameUI.IsControlDown())
			return
		var color = a.style.backgroundColor
		a.style.backgroundColor = "#FFFF00FF"
		var uiw = Fusion.Panels.Main.actuallayoutwidth
		var uih = Fusion.Panels.Main.actuallayoutheight
		var linkpanel = () => {
			a.style.position = `${(GameUI.GetCursorPosition()[0] / uiw * 100)}% ${(GameUI.GetCursorPosition()[1] / uih * 100)}% 0`
			if (GameUI.IsMouseDown(0)) {
				m = false
				a.SetPanelEvent("onactivate", onactivateF)
				a.style.backgroundColor = color
				callback(a)
			}
		}
		function L() {
			$.Schedule (
				0,
				() => {
					L()
					if(m)
						linkpanel()
					
				}
			)
		}
		L()
	}
	a.SetPanelEvent("onactivate", onactivateF)
}

Game.MoveToPos = (ent, xyz, queue) => Game.PrepareUnitOrders({
	OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_MOVE_TO_POSITION,
	UnitIndex: ent,
	Position: xyz,
	Queue: queue,
	ShowEffects: Fusion.debugAnimations
})

Game.MoveToTarget = (ent, entTo, queue) => Game.PrepareUnitOrders({
	OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_MOVE_TO_TARGET,
	UnitIndex: ent,
	TargetIndex: entTo,
	Queue: queue,
	ShowEffects: Fusion.debugAnimations
})

Game.AttackTarget = (ent, target, queue) => Game.PrepareUnitOrders({
	OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_ATTACK_TARGET,
	UnitIndex: ent,
	TargetIndex: target,
	Queue: queue,
	ShowEffects: Fusion.debugAnimations
})

Game.MoveToAttackPos = (ent, xyz, queue) => Game.PrepareUnitOrders({
	OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_ATTACK_MOVE,
	UnitIndex: ent,
	Position: xyz,
	Queue: queue,
	ShowEffects: Fusion.debugAnimations
})

Game.CastTarget = (ent, abil, target, queue) => Game.PrepareUnitOrders({
	OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_CAST_TARGET,
	UnitIndex: ent,
	TargetIndex: target,
	AbilityIndex: abil,
	Queue: queue,
	ShowEffects: Fusion.debugAnimations
})

Game.CastTargetTree = (ent, abil, target, queue) => Game.PrepareUnitOrders({
	OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_CAST_TARGET_TREE,
	UnitIndex: ent,
	TargetIndex: target,
	AbilityIndex: abil,
	Queue: queue,
	ShowEffects: Fusion.debugAnimations
})

Game.CastPosition = (ent, abil, xyz, queue) => Game.PrepareUnitOrders({
	OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_CAST_POSITION,
	UnitIndex: ent,
	Position: xyz,
	AbilityIndex: abil,
	Queue: queue,
	ShowEffects: Fusion.debugAnimations
})

Game.CastNoTarget = (ent, abil, queue) => Game.PrepareUnitOrders({
	OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_CAST_NO_TARGET,
	UnitIndex: ent,
	AbilityIndex: abil,
	Queue: queue,
	ShowEffects: Fusion.debugAnimations
})

Game.ToggleAbil = (ent, abil, queue) => Game.PrepareUnitOrders({
	OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_CAST_TOGGLE,
	UnitIndex: ent,
	AbilityIndex: abil,
	Queue: queue,
	ShowEffects: Fusion.debugAnimations
})

Game.EntStop = (ent, queue) => Game.PrepareUnitOrders({
	OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_STOP,
	UnitIndex: ent,
	Queue: queue,
	ShowEffects: Fusion.debugAnimations
})

Game.DisassembleItem = (ent, item, queue) => Game.PrepareUnitOrders({
	OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_DISASSEMBLE_ITEM,
	UnitIndex: ent,
	AbilityIndex: item,
	Queue: queue,
	ShowEffects: Fusion.debugAnimations
})

Game.DropItem = (ent, item, xyz, queue) => Game.PrepareUnitOrders({
	OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_DROP_ITEM,
	UnitIndex: ent,
	Position: xyz,
	AbilityIndex: item,
	Queue: queue,
	ShowEffects: Fusion.debugAnimations
})

Game.PickupItem = (ent, item, queue) => Game.PrepareUnitOrders({
	OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_PICKUP_ITEM,
	UnitIndex: ent,
	TargetIndex: item,
	Queue: queue,
	ShowEffects: Fusion.debugAnimations
})

Game.PickupRune = (ent, rune, queue) => Game.PrepareUnitOrders({
	OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_PICKUP_RUNE,
	UnitIndex: ent,
	TargetIndex: rune,
	Queue: queue,
	ShowEffects: Fusion.debugAnimations
})

Game.ItemLock = (ent, item, queue) => Game.PrepareUnitOrders({
	OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_SET_ITEM_COMBINE_LOCK,
	UnitIndex: ent,
	TargetIndex: item,
	Queue: queue,
	ShowEffects: Fusion.debugAnimations
})

Game.PurchaseItem = (ent, itemid) => Game.PrepareUnitOrders({
	OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_PURCHASE_ITEM,
	UnitIndex: ent,
	AbilityIndex: itemid,
	Queue: false,
	ShowEffects: Fusion.debugAnimations
})

Game.SellItem = (ent, item) => Game.PrepareUnitOrders({
	OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_SELL_ITEM,
	UnitIndex: ent,
	AbilityIndex: item,
	Queue: false,
	ShowEffects: Fusion.debugAnimations
})

//Получение расстояния между двумя точками в пространстве, высшая математика епта
Game.PointDistance = (a, b) => Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)

//логарифм по основанию
Math.logb = (number, base) => Math.log(number) / Math.log(base)

//поэлементное сравнение двух массивов, порядок элементов не учитывается
Game.CompareArrays = (a, b) => {
	if (a === b)
		return true
	if (a.length != b.length)
		return false
	
	return !a.some(val1 => b.some(val2 => val1 !== val2))
}

//проверяет есть ли в двух объектах хотя бы один одинаковый элемент
Game.IntersecArrays = (a, b) => a.some(val1 => b.some(val2 => val1 === val2))

//получение массива с инвентарем юнита
Game.GetInventory = ent => {
	var inv = []
	for(var i = 0; i < 6; i++) {
		var item = Entities.GetItemInSlot(ent, i)
		inv.push(item)
	}
	return inv
}
Entities.GetUnitItems = ent => Game.GetInventory(ent).concat(Entities.GetBackpackItems(ent))
Entities.GetBackpackItems = ent => {
	var inv = []
	for(var i = 6; i < 9; i++) {
		var item = Entities.GetItemInSlot(ent, i)
		inv.push(item)
	}
	return inv
}
Entities.GetStashItems = ent => {
	var inv = []
	for(var i = 9; i < 15; i++) {
		var item = Entities.GetItemInSlot(ent, i)
		inv.push(item)
	}
	return inv
}

Entities.PlayersHeroEnts = returnNotVisible => {
	var ents = Entities.GetAllEntities(),
		playerEnts = Game.GetAllPlayerIDs().map(playerID => Players.GetPlayerHeroEntityIndex(playerID))
	if(!returnNotVisible)
		playerEnts = playerEnts.filter(ent => ents.indexOf(ent) > -1)
	
	return playerEnts
}

//возвращает DOTA_ABILITY_BEHAVIOR в удобном представлении
Fusion.Behaviors = abil => Fusion.RepresentBehavior(Abilities.GetBehavior(abil))

Fusion.RepresentBehavior = behavior => behavior.toString(2).split("").reverse().map((val, i) => {
	if(val === "1")
		return 2 ** i
	else
		return 0
}).filter(val => val !== 0)

//объект с указателями на бафы юнита
Game.GetBuffs = ent => {
	var buffs = []
	for(var i=0; i < Entities.GetNumBuffs(ent); i++)
		buffs.push(ent, Entities.GetBuff(ent, i))
	return buffs
}

Game.GetBuffsNames = ent => Game.GetBuffs(ent).map(buff => Buffs.GetName(ent, buff))

script = {
	name: "Utilities",
	isVisible: false
}
