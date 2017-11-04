Fusion.LenseBonusRange = 200
Fusion.ForceStaffUnits = 600

Fusion.GetEntitiesOnPosition = function(vec) {
	return GameUI.FindScreenEntities (
		[
			Game.WorldToScreenX(vec[0], vec[1], vec[2]),
			Game.WorldToScreenY(vec[0], vec[1], vec[2])
		]
	).map(function(entData) {
		return entData.entityIndex
	})
}

GameUI.FindScreenEntitiesAtCursor = function() {
	return GameUI.FindScreenEntities(GameUI.GetCursorPosition())
}

Fusion.arrayRemove = function(ar, obj) {
	var i = ar.indexOf(obj)
	if(i >= 0)
		ar.splice(i, 1)
}

Fusion.GetBuffByName = function(ent, buffName) {
	var ret = undefined
	Game.GetBuffs(ent).some(function(buff) {
		if(Buffs.GetName(ent, buff) === buffName) {
			ret = buff
			return true
		}

		return false
	})
	
	return ret
}

Fusion.LinkenTargetName = "modifier_item_sphere_target"
Fusion.HasLinkenAtTime = function(ent, time) {
	var sphere = Game.GetAbilityByName(ent, "item_sphere")

	return (
		sphere !== undefined &&
		Abilities.GetCooldownTimeRemaining(sphere) - time <= 0
	) || Fusion.GetBuffByName(ent, Fusion.LinkenTargetName) !== undefined
}

Fusion.DeepEquals = function (x, y) {
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

Game.GetScreenCursonWorldVec = function() {
	var curPos = GameUI.GetCursorPosition()
	return Game.ScreenXYToWorld(curPos[0], curPos[1])
}

Abilities.GetCastRangeFix = function(abil) { // Don"t redefine internals
	var AbilRange = Abilities.GetCastRange(abil)
	var Caster = Abilities.GetCaster(abil)
	
	var Behaviors = Fusion.Behaviors(abil)
	if(Entities.HasItemInInventory(Caster, "item_aether_lens") && (Behaviors.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_POINT) !== -1 || Behaviors.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_UNIT_TARGET) !== -1))
		AbilRange += Fusion.LenseBonusRange
	
	return AbilRange
}

Fusion.ForceStaffPos = function(ent) {
	var entVec = Entities.GetAbsOrigin(ent)
	var entForward = Entities.GetForward(ent)
	var forceVec = [
		entVec[0] + entForward[0] * Fusion.ForceStaffUnits,
		entVec[1] + entForward[1] * Fusion.ForceStaffUnits,
		entVec[2] + entForward[2] * Fusion.ForceStaffUnits
	]
	
	return forceVec
}

Fusion.IgnoreBuffs = [
	"modifier_abaddon_borrowed_time",
	"modifier_skeleton_king_reincarnation_scepter_active",
	"modifier_brewmaster_primal_split",
	"modifier_omniknight_repel",
	"modifier_phoenix_supernova_hiding",
	"modifier_juggernaut_blade_fury",
	"modifier_medusa_stone_gaze",
	"modifier_nyx_assassin_spiked_carapace",
	"modifier_templar_assassin_refraction_absorb",
	"modifier_oracle_false_promise",
	"modifier_oracle_fates_edict",
	"modifier_dazzle_shallow_grave",
	"modifier_treant_living_armor",
	"modifier_life_stealer_rage",
	"modifier_item_aegis",
	"modifier_tusk_snowball_movement",
	"modifier_tusk_snowball_movement_friendly"
]
Fusion.GetMagicMultiplier = function(entFrom, entTo) {
	var multiplier = Entities.GetMagicalArmorValue(entTo)
	
	if(Game.IntersecArrays(Game.GetBuffsNames(entTo), Fusion.IgnoreBuffs) || multiplier == 1)
		return 0
	
	return 1 + multiplier
}

Fusion.BuffsAbsorbMagicDmg = [
	["modifier_item_pipe_barrier", 400],
	["modifier_item_hood_of_defiance_barrier", 400],
	["modifier_item_infused_raindrop", 120],
	["modifier_abaddon_aphotic_shield", [110,140,170,200]],
	["modifier_ember_spirit_flame_guard", [50,200,350,500]]
]
Fusion.GetNeededMagicDmg = function(entFrom, entTo, dmg) {
	Game.GetBuffs(entTo).forEach(function(enemyBuff) {
		Fusion.BuffsAbsorbMagicDmg.forEach(function(absorbBuff) {
			if(Buffs.GetName(entTo, enemyBuff) === absorbBuff[0])
				if(Array.isArray(absorbBuff[1]))
					dmg += absorbBuff[1][Abilities.GetLevel(Buffs.GetAbility(entTo, enemyBuff)) - 1]
				else
					dmg += absorbBuff[1]
		})
	})
	
	return dmg * Fusion.GetMagicMultiplier(entFrom, entTo)
}

Game.AngleBetweenVectors = function(a_pos, a_facing, b_pos) {
	with(Math) {
		var distancevector = [
			b_pos[0] - a_pos[0],
			b_pos[1] - a_pos[1]
		]
		var normalize = [
			distancevector[0] / sqrt(pow(distancevector[0], 2) + pow(distancevector[1], 2)),
			distancevector[1] / sqrt(pow(distancevector[0], 2) + pow(distancevector[1], 2))
		]
		return acos((a_facing[0] * normalize[0]) + (a_facing[1] * normalize[1]))
	}
}

Game.AngleBetweenTwoFaces = function(a_facing, b_facing) {
	return Math.acos((a_facing[0] * b_facing[0]) + (a_facing[1] * b_facing[1]))
}

Game.RotationTime = function(angle, rotspeed) { // angle is npc_heroes MovementTurnRate
	return (Fusion.MyTick * angle / rotspeed)
}

Game.GetEntitiesInRange = function(pos, range, onlyEnemies) {
	return Entities.PlayersHeroEnts().filter(function(ent) {
		return onlyEnemies || Entities.IsEnemy(ent)
				&& Entities.IsAlive(ent)
				&& !Entities.IsBuilding(ent)
				&& !Entities.IsInvulnerable(ent)
				&& Game.PointDistance(pos, Entities.GetAbsOrigin(ent)) < range
	})
}

Game.ClosetToMouse = function(MyEnt, range, onlyEnemies) {
	var ents = Game.GetEntitiesInRange(Game.GetScreenCursonWorldVec(), range, onlyEnemies).sort(function(ent1, ent2) {
		var dst1 = Game.PointDistance(ent1, MyEnt),
			dst2 = Game.PointDistance(ent2, MyEnt)
		if(dst1 > dst2)
			return 1
		else if(dst1 < dst2)
			return -1
		else
			return 0
	})
	
	return ents.length > 0 ? ents[0] : undefined
}

Game.GetAbilityByName = function(ent, name) {
	var ab = Entities.GetAbilityByName(ent, name)
	if (ab !== -1)
		return ab
	
	for(var i = 0; i < 7; i++) {
		var item = Entities.GetItemInSlot(ent, i)
		if(Abilities.GetAbilityName(item) === name)
			return item
	}
}

Game.GetSpeed = function(ent) {
	if(Entities.IsMoving(ent)) {
		var a = Entities.GetBaseMoveSpeed(ent)
		var b = Entities.GetMoveSpeedModifier(ent,a)
		return b
	} else
		return 0
}

Game.VelocityWaypoint = function(ent, time, movespeed) {
	var zxc = Entities.GetAbsOrigin(ent)
	var forward = Entities.GetForward(ent)
	if(movespeed === undefined)
		var movespeed = Game.GetSpeed(ent)

	return [zxc[0] + (forward[0] * movespeed * time),zxc[1] + (forward[1] * movespeed * time),zxc[2]]
}

//сообщение в боковую панель
Game.ScriptLogMsg = function(msg, color) {
	var ScriptLog = Fusion.Panels.MainPanel.FindChildTraverse("ScriptLog")
	var ScriptLogMessage = $.CreatePanel( "Label", ScriptLog, "ScriptLogMessage" )
	ScriptLogMessage.BLoadLayoutFromString("\
<root>\
	<Label/>\
</root>", false, false)
	ScriptLogMessage.style.fontSize = "15px"
	var text = "	•••	" + msg
	ScriptLogMessage.text = text
	if (color) {
		ScriptLogMessage.style.color = color
		ScriptLogMessage.style.textShadow = "0px 0px 4px 1.2 " + color + "33"
	}
	ScriptLogMessage.DeleteAsync(7)
	Fusion.AnimatePanel( ScriptLogMessage, {"opacity": "0;"}, 2, "linear", 4)
}

//Функция делает панельку перемещаемой кликом мыши по ней. callback нужен например для того, чтобы сохранить координаты панели в файл
GameUI.MovePanel = function(a, callback) {
	var onactivateF = function() {
		var m = true
		if (!GameUI.IsControlDown())
			return
		var color = a.style.backgroundColor
		a.style.backgroundColor = "#FFFF00FF"
		var uiw = Fusion.Panels.Main.actuallayoutwidth
		var uih = Fusion.Panels.Main.actuallayoutheight
		var linkpanel = function() {
			a.style.position = (GameUI.GetCursorPosition()[0] / uiw * 100) + "% " + (GameUI.GetCursorPosition()[1] / uih * 100) + "% " + "0"
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
				function() {
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

Game.MoveToPos = function(ent, xyz, queue) {
	Game.PrepareUnitOrders({
		OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_MOVE_TO_POSITION,
		UnitIndex: ent,
		Position: xyz,
		Queue: queue,
		ShowEffects: Fusion.debugAnimations
	})
}

Game.MoveToTarget = function(ent, entTo, queue) {
	Game.PrepareUnitOrders({
		OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_MOVE_TO_TARGET,
		UnitIndex: ent,
		Position: entTo,
		Queue: queue,
		ShowEffects: Fusion.debugAnimations
	})
}

Game.MoveToAttackPos = function(ent, xyz, queue) {
	Game.PrepareUnitOrders({
		OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_ATTACK_MOVE,
		UnitIndex: ent,
		Position: xyz,
		Queue: queue,
		ShowEffects: Fusion.debugAnimations
	})
}

Game.CastTarget = function(ent, abil, target, queue) {
	Game.PrepareUnitOrders({
		OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_CAST_TARGET,
		UnitIndex: ent,
		TargetIndex: target,
		AbilityIndex: abil,
		Queue: queue,
		ShowEffects: Fusion.debugAnimations
	})
}

Game.CastPosition = function(ent, abil, xyz, queue) {
	Game.PrepareUnitOrders({
		OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_CAST_POSITION,
		UnitIndex: ent,
		Position: xyz,
		AbilityIndex: abil,
		Queue: queue,
		ShowEffects: Fusion.debugAnimations
	})
}

Game.CastNoTarget = function(ent, abil, queue) {
	Game.PrepareUnitOrders({
		OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_CAST_NO_TARGET,
		UnitIndex: ent,
		AbilityIndex: abil,
		Queue: queue,
		ShowEffects: Fusion.debugAnimations
	})
}

Game.ToggleAbil = function(ent, abil, queue) {
	Game.PrepareUnitOrders({
		OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_CAST_TOGGLE,
		UnitIndex: ent,
		AbilityIndex: abil,
		Queue: queue,
		ShowEffects: Fusion.debugAnimations
	})
}

Game.EntStop = function(ent, queue) {
	Game.PrepareUnitOrders({
		OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_STOP,
		UnitIndex: ent,
		Queue: queue,
		ShowEffects: Fusion.debugAnimations
	})
}

Game.DisassembleItem = function(ent, item, queue) {
	Game.PrepareUnitOrders({
		OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_DISASSEMBLE_ITEM,
		UnitIndex: ent,
		AbilityIndex: item,
		Queue: queue,
		ShowEffects: Fusion.debugAnimations
	})
}

Game.DropItem = function(ent, item, xyz, queue) {
	Game.PrepareUnitOrders({
		OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_DROP_ITEM,
		UnitIndex: ent,
		Position: xyz,
		AbilityIndex: item,
		Queue: queue,
		ShowEffects: Fusion.debugAnimations
	})
}

Game.PickupItem = function(ent, item, queue) {
	Game.PrepareUnitOrders({
		OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_PICKUP_ITEM,
		UnitIndex: ent,
		TargetIndex: item,
		Queue: queue,
		ShowEffects: Fusion.debugAnimations
	})
}

Game.PickupRune = function(ent, rune, queue) {
	Game.PrepareUnitOrders({
		OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_PICKUP_RUNE,
		UnitIndex: ent,
		TargetIndex: rune,
		Queue: queue,
		ShowEffects: Fusion.debugAnimations
	})
}

Game.ItemLock = function(ent, item, queue) {
	Game.PrepareUnitOrders({
		OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_SET_ITEM_COMBINE_LOCK,
		UnitIndex: ent,
		TargetIndex: item,
		Queue: queue,
		ShowEffects: Fusion.debugAnimations
	})
}

Game.PurchaseItem = function(ent, itemid, queue) {
	Game.PrepareUnitOrders({
		OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_PURCHASE_ITEM,
		UnitIndex: ent,
		AbilityIndex: itemid,
		Queue: queue,
		ShowEffects: Fusion.debugAnimations
	})
}

//Получение расстояния между двумя точками в пространстве, высшая математика епта
Game.PointDistance = function(a, b) {
	return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2))
}

Entities.Distance = function(a, b) {
	return Game.PointDistance(Entities.GetAbsOrigin(a), Entities.GetAbsOrigin(b))
}

//логарифм по основанию
Math.logb = function(number, base) {
	return Math.log(number) / Math.log(base)
}

//поэлементное сравнение двух массивов, порядок элементов не учитывается
Game.CompareArrays = function(a, b) {
	if (a === b)
		return true
	if (a.length != b.length)
		return false
	
	return Game.IntersecArrays(a, b)
}

//проверяет есть ли в двух объектах хотя бы один одинаковый элемент
Game.IntersecArrays = function(a,b) {
	return a.some(function(val1) {
		return b.some(function(val2) {
			return val1 === val2
		})
	})
}

//получение массива с инвентарем юнита
Game.GetInventory = function(ent) {
	var inv = []
	for(i = 0; i < 6; i++) {
		var item = Entities.GetItemInSlot(ent, i)
		if(item !== -1)
			inv.push(item)
	}
	return inv
}

Game.IsIllusion = function(entity) {
	return Entities.PlayersHeroEnts().indexOf(entity) === -1
}

Entities.PlayersHeroEnts = function() {
	return Game.GetAllPlayerIDs().map(function(playerID) { // do not convolute, as DotA 2 API can be called only from script context (.forEach, .map is V8 context)
		return Players.GetPlayerHeroEntityIndex(playerID)
	})
}

//возвращает DOTA_ABILITY_BEHAVIOR в удобном представлении
Fusion.Behaviors = function(behavior) {
	return behavior.toString(2).split("").reverse().map(function(val, i) {
		if(i === "1")
			return Math.pow(2, i + 1)
		else
			return undefined
	}).filter(function(val) {
		return val !== undefined
	})
}

//объект с указателями на бафы юнита
Game.GetBuffs = function(ent) {
	var buffs = []
	for(var i=0; i < Entities.GetNumBuffs(ent); i++)
		buffs.push(ent, Entities.GetBuff(ent,i))
	return buffs
}

//объект с именами бафов юнита
Game.GetBuffsNames = function(ent) {
	return Game.GetBuffs(ent).map(function(buff) {
		return Buffs.GetName(ent, buff)
	})
}

//анимирование панелей. Источник moddota.com
var AnimatePanel_DEFAULT_DURATION = "300.0ms"
var AnimatePanel_DEFAULT_EASE = "linear"
Fusion.AnimatePanel = function(panel, values, duration, ease, delay) {
	var durationString = (duration != null ? (duration * 1000) + ".0ms" : AnimatePanel_DEFAULT_DURATION)
	var easeString = (ease != null ? ease : AnimatePanel_DEFAULT_EASE)
	var delayString = (delay != null ? (delay * 1000) + ".0ms" : "0.0ms")
	var transitionString = durationString + " " + easeString + " " + delayString
	var i = 0
	var finalTransition = ""
	for (var property in values) {
		finalTransition = finalTransition + (i > 0 ? ", " : "") + property + " " + transitionString
		i++
	}
	panel.style.transition = finalTransition + ";"
	for (var property in values)
		panel.style[property] = values[property]
}

Fusion.AddScript = function(scriptName, onCheckBoxClick) {
	var Temp = $.CreatePanel("Panel", Fusion.Panels.MainPanel.scripts, scriptName)
	Temp.SetPanelEvent("onactivate", onCheckBoxClick)
	Temp.BLoadLayoutFromString('\
		<root>\
			<styles>\
				<include src="s2r://panorama/styles/dotastyles.vcss_c"/>\
				<include src="s2r://panorama/styles/magadan.vcss_c"/>\
			</styles>\
			<Panel>\
				<ToggleButton class="CheckBox" id="' + scriptName + '" text="' + scriptName + '"/>\
			</Panel>\
		</root>\
	', false, false)
	/*var scripts = Fusion.Panels.MainPanel.scripts, // potential fix for sort
		Child = scripts.Children()
	for(var k = 1; k < Child.length - 1; k++) {
		var a = Child[k], aText = a.Children()[0].text
			b = Child[k + 1], bText = b.Children()[0].text
		if(aText > bText)
			scripts.MoveChildBefore(b, a)
		else if(aText < bText)
			scripts.MoveChildBefore(a, b)
	}*/

	return $.GetContextPanel().FindChildTraverse(scriptName).Children()[0]
}