var QuillSprayRange = 625
var QuillSprayDamage = [20, 40, 60, 80]

function BristleBackWTFQuillSprayOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Game.PlayersHeroEnts()
	
	QuillSpray(MyEnt, HEnts)
}

function QuillSpray(MyEnt, HEnts) {
	var Abil = Game.GetAbilityByName(MyEnt, 'bristleback_quill_spray')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	if(AbilLvl === 0)
		return
	
	
	Game.CastNoTarget(MyEnt, Abil, false)
}

function BristleBackWTFQuillSprayOnToggle() {
	if (!BristleBackWTFQuillSpray.checked) {
		Game.ScriptLogMsg('Script disabled: BristleBackWTFQuillSpray', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule (
				Fusion.MyTick,
				function() {
					BristleBackWTFQuillSprayOnInterval()
					if(BristleBackWTFQuillSpray.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: BristleBackWTFQuillSpray', '#00ff00')
	}
}

var BristleBackWTFQuillSpray = Game.AddScript('BristleBackWTFQuillSpray', BristleBackWTFQuillSprayOnToggle)