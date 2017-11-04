var damage = [250, 325, 400]
function AxeUltiF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var Ulti = Entities.GetAbilityByName(MyEnt, "axe_culling_blade")
	var UltiLvl = Abilities.GetLevel(Ulti)
	if(UltiLvl === 0 || Abilities.GetCooldownTimeRemaining(Ulti) !== 0 || Entities.GetMana(MyEnt) < Abilities.GetManaCost(Ulti))
		return
	var UltiDmg = damage[UltiLvl - 1]
	var UltiCastRange = Abilities.GetCastRangeFix(Ulti) + 75
	
	Entities.PlayersHeroEnts().filter(function(ent) {
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && Entities.IsEnemy(ent) && Entities.GetRangeToUnit(MyEnt, ent) <= UltiCastRange && Entities.GetHealth(ent) <= UltiDmg
	}).sort(function(ent1, ent2) {
		var h1 = Entities.GetHealth(ent1)
		var h2 = Entities.GetHealth(ent2)
		
		if(h1 === h2)
			return 0
		if(h1 > h2)
			return 1
		else
			return -1
	}).some(function(ent) {
		if(Fusion.HasLinkenAtTime(ent, Abilities.GetCastPoint(Ulti)))
			return false
		
		GameUI.SelectUnit(MyEnt, false)
		Game.CastTarget(MyEnt, Ulti, ent, false)
		return true
	})
}

function AxeUltiOnCheckBoxClick() {
	if (!AxeUlti.checked) {
		Game.ScriptLogMsg("Script disabled: AxeUlti", "#ff0000")
		return
	} else {
		if (Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) != "npc_dota_hero_axe") {
			AxeUlti.checked = false
			AxeUltiOnCheckBoxClick()
			return
		} else {
			function f() {
				if(AxeUlti.checked)
					$.Schedule(Fusion.MyTick, function() {
						AxeUltiF()
						f()
					})
			}
			f()
			Game.ScriptLogMsg("Script enabled: AxeUlti", "#00ff00")
		}
	}
}

var AxeUlti = Fusion.AddScript("AutoultAxe", AxeUltiOnCheckBoxClick)