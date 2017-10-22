function WTFMotherFuckerOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Entities.GetAllHeroEntities()
	
	ExecNoTarget(MyEnt, "batrider_firefly")
	ExecNoTarget(MyEnt, "wisp_spirits")
}

function ExecNoTarget(MyEnt, AbilName) {
	var Abil = Game.GetAbilityByName(MyEnt, AbilName)
	if(!Abilities.IsDisplayedAbility(Abil))
		return
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	if(AbilLvl === 0)
		return
	
	
	Game.CastNoTarget(MyEnt, Abil, false)
}

function WTFMotherFuckerOnToggle() {
	if (!WTFMotherFucker.checked)
		Game.ScriptLogMsg('Script disabled: WTFMotherFucker', '#ff0000')
	else {
		function intervalFunc(){
			$.Schedule(
				Fusion.MyTick,
				function() {
					WTFMotherFuckerOnInterval()
					if(WTFMotherFucker.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: WTFMotherFucker', '#00ff00')
	}
}

var WTFMotherFucker = Game.AddScript('WTFMotherFucker', WTFMotherFuckerOnToggle)