var damage = [225, 325, 425]

function ZeusAutoultF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var Ulti = Entities.GetAbilityByName(MyEnt, "zuus_thundergods_wrath")
	var UltiLvl = Abilities.GetLevel(Ulti)
	var UltiDmg = damage[UltiLvl-1]
	
	if(UltiLvl === 0 || Abilities.GetCooldownTimeRemaining(Ulti) !== 0 || Entities.GetMana(MyEnt) < Abilities.GetManaCost(Ulti))
		return
	
	var HEnts = Game.PlayersHeroEnts()
	Game.PlayersHeroEnts().some(function(ent) {
		if (!Entities.IsEnemy(ent) || Entities.IsMagicImmune(ent) || !Entities.IsAlive(ent))
			return false
		if(Fusion.GetMagicMultiplier(MyEnt, ent) === 0)
			return false
		
		if(Fusion.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent)) <= UltiDmg) {
			Game.CastNoTarget(MyEnt, Ulti, false)
			return true
		}
	})
}

function ZeusAutoultOnCheckBoxClick() {
	if (!ZeusAutoult.checked){
		Game.ScriptLogMsg("Script disabled: ZeusAutoult", "#ff0000")
		return
	} else {
		if (Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) != "npc_dota_hero_zuus"){
			ZeusAutoult.checked = false
			Game.ScriptLogMsg("ZeusAutoult: Not Zeus", "#ff0000")
			return
		}
		function f() {
			$.Schedule (
				Fusion.MyTick,
				function() {
					ZeusAutoultF()
					if(ZeusAutoult.checked)
						f()
				}
			)
		}
		f()
		Game.ScriptLogMsg("Script enabled: ZeusAutoult", "#00ff00")
	}
}

var ZeusAutoult = Game.AddScript("AutoultZeus", ZeusAutoultOnCheckBoxClick)