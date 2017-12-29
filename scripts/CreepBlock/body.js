// copypasta from https://github.com/IdcNoob/Ensage/blob/master/CreepsBlocker/CreepsBlocker.cs and https://github.com/IdcNoob/Ensage/blob/master/BodyBlocker/Modes/CreepsBlocker/CreepsBlocker.cs
// idea (c) 414r7 2017
var enabled = false

function CreepBlockOnInterval() {
	CreepBlockF()

	if(enabled)
		$.Schedule(Fusion.MyTick, CreepBlockOnInterval)
}

function CreepBlockF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(!Entities.IsAlive(MyEnt) || Game.IsGamePaused())
		return
	var creeps = Entities.GetAllLaneCreeps().filter(creep => Entities.IsAlive(creep) && !Entities.IsEnemy(creep) && Entities.IsEntityInRange(MyEnt, creep, 500))
	if(creeps.length <= 0)
		return
	var creepsMovePositionSum = creeps.map(creep => Entities.InFront(creep, 300)).reduce((sum, vec) =>[sum[0] + vec[0], sum[1] + vec[1], sum[2] + vec[2]]),
		creepsMovePosition = [creepsMovePositionSum[0] / creeps.length, creepsMovePositionSum[1] / creeps.length, creepsMovePositionSum[2] / creeps.length],
		tower = Entities.GetAllBuildingEntities().filter(building => Entities.IsTower(building)).filter(tower => Entities.IsAlive(tower) && Entities.IsEntityInRange(MyEnt, tower, 120))
	if(tower.length > 0 && Entities.GetUnitName(tower[0]) === "npc_dota_badguys_tower2_mid") {
		Game.MoveToPos(MyEnt, creepsMovePosition, false)
		return
	}
	var flag = true
	Array.prototype.orderBy.call(creeps, creep => Entities.GetRangeToUnit(creep, MyEnt)).every(creep => {
		if (!Entities.IsMoving(creep) && !Entities.IsEntityInRange(creep, MyEnt, 50))
			return true
		var creepDistance = Game.PointDistance(Entities.GetAbsOrigin(creep), creepsMovePosition) + 50,
			heroDistance = Game.PointDistance(Entities.GetAbsOrigin(MyEnt), creepsMovePosition),
			creepAngle = Entities.FindRotationAngle(creep, Entities.GetAbsOrigin(MyEnt))
		if(creepDistance < heroDistance && creepAngle > 2 || creepAngle > 2.5)
			return true
		var moveDistance = 550 / Game.GetSpeed(MyEnt) * 100
		if (Game.GetSpeed(MyEnt) - Game.GetSpeed(creep) > 50)
			moveDistance -= (Game.GetSpeed(MyEnt) - Game.GetSpeed(creep)) / 2
		var movePosition = Entities.InFront(creep, Math.max(moveDistance, moveDistance * creepAngle))
		if(Game.PointDistance(movePosition, creepsMovePosition) - 50 > heroDistance)
			return true
		if(creepAngle < 0.2 && Entities.IsMoving(MyEnt))
			return true

		Game.MoveToPos(MyEnt, movePosition, false)
		flag = false
		return false
	})
	if(!flag)
		return
	if(Entities.IsMoving(MyEnt))
		Game.EntStop(MyEnt, false)
	else if (Entities.FindRotationAngle(MyEnt, creepsMovePosition) > 1.5)
		Game.MoveToPos(MyEnt, Fusion.ExtendVector(Entities.GetAbsOrigin(MyEnt), creepsMovePosition, 10), false);
}

script = {
	name: "Creep Block",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if(enabled) {
			CreepBlockOnInterval()
			Game.ScriptLogMsg("Script enabled: Creep Block", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: Creep Block", "#ff0000")
	},
	onDestroy: () => enabled = false
}