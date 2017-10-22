var IgnoreBuffs = [
	"modifier_bounty_hunter_wind_walk",
	"modifier_item_shadow_amulet",
	"modifier_item_shadow_amulet_fade"
]

function BountyHunterWTFAutoClickOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Game.PlayersHeroEnts()
	
	AutoClick(MyEnt, HEnts)
}

function AutoClick(MyEnt, HEnts) {
	AutoShadowWalk(MyEnt)
}

function AutoShadowWalk(MyEnt) {
	var Abil = Game.GetAbilityByName(MyEnt, 'bounty_hunter_wind_walk')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	if(AbilLvl === 0)
		return
	var buffsNames = Game.GetBuffsNames(MyEnt)
	if(Game.IntersecArrays(buffsNames, IgnoreBuffs))
		return
	
	Game.CastNoTarget(MyEnt, Abil, false)
}

function BountyHunterWTFAutoClickOnToggle() {
	if (!BountyHunterWTFAutoClick.checked) {
		Game.ScriptLogMsg('Script disabled: BountyHunterWTFAutoClick', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule(
				0.26,
				function() {
					BountyHunterWTFAutoClickOnInterval()
					if(BountyHunterWTFAutoClick.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: BountyHunterWTFAutoClick', '#00ff00')
	}
}

var BountyHunterWTFAutoClick = Game.AddScript('BountyHunterWTFAutoClick', BountyHunterWTFAutoClickOnToggle)