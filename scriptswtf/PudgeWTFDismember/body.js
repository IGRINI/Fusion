var LenseBonusRange = 200

function PudgeWTFDismemberOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt))
		return
	var HEnts = Entities.GetAllEntities()
	
	Hex(MyEnt, HEnts)
}

function Hex(MyEnt, HEnts) {
	var Abil = Game.GetAbilityByName(MyEnt, 'pudge_dismember')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	if(AbilLvl === 0)
		return
	var AbilRange = Abilities.GetCastRangeFix(Abil)
	
	
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		if(!Entities.IsEnemy(ent) || !Entities.IsAlive(ent))
			continue
		if(Entities.GetRangeToUnit(MyEnt, ent) > AbilRange)
			continue
		if(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent))
			continue
		if(Entities.IsInvulnerable(ent))
			continue
		
		Game.CastTarget(MyEnt, Abil, ent, false)
		return
	}
}

function PudgeWTFDismemberOnToggle() {
	if (!PudgeWTFDismember.checked) {
		Game.ScriptLogMsg('Script disabled: PudgeWTFDismember', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule(
				Fusion.MyTick * 2,
				function() {
					PudgeWTFDismemberOnInterval()
					if(PudgeWTFDismember.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: PudgeWTFDismember', '#00ff00')
	}
}

var PudgeWTFDismember = Game.AddScript('PudgeWTFDismember', PudgeWTFDismemberOnToggle)