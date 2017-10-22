var EulDuration = 2.5
var SunStrikeDelay = 1.7
var TornadoDelay = [ 0.8, 1.1, 1.4, 1.7, 2.0, 2.3, 2.6, 2.9 ]
function InvokerCombo() {
	var playerID = Game.GetLocalPlayerID()
	MyEnt = Players.GetPlayerHeroEntityIndex(playerID)
	
	var enemy = Game.ClosetToMouse(MyEnt, 500, true)
	if(enemy === undefined)
		return
	var pos = Entities.GetAbsOrigin(enemy)
	
	var Veil = Game.GetAbilityByName(MyEnt, "item_veil_of_discord")
	var Eul = Game.GetAbilityByName(MyEnt, "item_cyclone")
	var Etherial = Game.GetAbilityByName(MyEnt, "item_ethereal_blade")
	var Orchid = Game.GetAbilityByName(MyEnt, "item_orchid")
	var Urn = Game.GetAbilityByName(MyEnt, "item_urn_of_shadows")
	var Dagon = Fusion.GetDagon(MyEnt)
	
	var SunStrike = Game.GetAbilityByName(MyEnt, "invoker_sun_strike")
	var Emp = Game.GetAbilityByName(MyEnt, "invoker_emp")
	var Meteor = Game.GetAbilityByName(MyEnt, "invoker_chaos_meteor")
	var Tornado = Game.GetAbilityByName(MyEnt, "invoker_tornado")
	var Cold = Game.GetAbilityByName(MyEnt, "invoker_cold_snap")
	var Blast = Game.GetAbilityByName(MyEnt, "invoker_deafening_blast")
	
	GameUI.SelectUnit(MyEnt, false)
	Game.EntStop(MyEnt, false)
	
	if(Abilities.IsHidden(SunStrike)) {
		Exort(); Exort(); Exort(); Invoke();
	}
	if(Abilities.IsHidden(Tornado)) {
		Wex(); Quas(); Wex(); Invoke();
	}
	// sunstrike tornado eul veil etherial dagon
	Game.CastTarget(MyEnt, Eul, enemy, false)
	$.Schedule(EulDuration - SunStrikeDelay + Fusion.MyTick * 9, function() {
		Game.CastPosition(MyEnt, SunStrike, pos, false)
		Exort(); Wex(); Exort(); Invoke();
		
		$.Schedule(EulDuration - SunStrikeDelay + Fusion.MyTick * 5, function() {
			Game.CastPosition(MyEnt, Veil, pos, false)
			Game.CastTarget(MyEnt, Etherial, enemy, false)
			Game.CastTarget(MyEnt, Dagon, enemy, false)
			//if(Abilities.GetCurrentCharges(Urn) > 0)
			//	Game.CastTarget(MyEnt, Urn, enemy, false)
			
			$.Schedule(EulDuration - SunStrikeDelay + Fusion.MyTick * 15, function() {
				Game.CastPosition(MyEnt, Tornado, pos, false)
				
				$.Schedule(TornadoDelay[Abilities.GetLevel(Game.GetAbilityByName(MyEnt, "invoker_quas")) - 2 + (Entities.HasScepter(MyEnt) ? 1 : 0)] + Fusion.MyTick * 2, function() {
					Game.CastPosition(MyEnt, Meteor, pos, false)
					
					Quas(); Quas(); Quas(); Invoke();
					Quas(); Wex(); Exort(); Invoke();
					
					Game.CastTarget(MyEnt, Orchid, enemy, false)
					Game.CastPosition(MyEnt, Blast, pos, false)
				})
			})
		})
	})
}

function Quas() {
	var Abil = Game.GetAbilityByName(MyEnt, "invoker_quas")
	Game.CastNoTarget(MyEnt, Abil, false)
}

function Wex() {
	var Abil = Game.GetAbilityByName(MyEnt, "invoker_wex")
	Game.CastNoTarget(MyEnt, Abil, false)
}

function Exort() {
	var Abil = Game.GetAbilityByName(MyEnt, "invoker_exort")
	Game.CastNoTarget(MyEnt, Abil, false)
}

function Invoke() {
	var Abil = Game.GetAbilityByName(MyEnt, "invoker_invoke")
	Game.CastNoTarget(MyEnt, Abil, false)
}

Game.AddCommand("__InvokerCombo", InvokerCombo, "", 0)