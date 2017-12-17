function onPreloadF() {
	if(!Fusion.Commands.InvokerCombo) {
		var EulDuration = 2.5,
			SunStrikeDelay = 1.7,
			TornadoDelay = [ 0.8, 1.1, 1.4, 1.7, 2.0, 2.3, 2.6, 2.9 ]
		Fusion.Commands.InvokerCombo = () => {
			var playerID = Game.GetLocalPlayerID()
			MyEnt = Players.GetPlayerHeroEntityIndex(playerID)
			
			var enemy = Entities.NearestToMouse(MyEnt, 500, true)
			if(enemy === undefined)
				return
			var pos = Entities.GetAbsOrigin(enemy)
			
			var Veil = Game.GetAbilityByName(MyEnt, "item_veil_of_discord")
				Eul = Game.GetAbilityByName(MyEnt, "item_cyclone"),
				Etherial = Game.GetAbilityByName(MyEnt, "item_ethereal_blade"),
				Orchid = Game.GetAbilityByName(MyEnt, "item_orchid"),
				Urn = Game.GetAbilityByName(MyEnt, "item_urn_of_shadows"),
				Dagon = Fusion.GetDagon(MyEnt),
				SunStrike = Game.GetAbilityByName(MyEnt, "invoker_sun_strike"),
				Emp = Game.GetAbilityByName(MyEnt, "invoker_emp"),
				Meteor = Game.GetAbilityByName(MyEnt, "invoker_chaos_meteor"),
				Tornado = Game.GetAbilityByName(MyEnt, "invoker_tornado"),
				Cold = Game.GetAbilityByName(MyEnt, "invoker_cold_snap"),
				Blast = Game.GetAbilityByName(MyEnt, "invoker_deafening_blast")
			
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
						
						var lift_duration = Abilities.GetLevelSpecialValueFor(Tornado, "lift_duration", Abilities.GetLevel(Game.GetAbilityByName(MyEnt, "invoker_quas")) - 2 + (Entities.HasScepter(MyEnt) ? 1 : 0) - 1),
							talent = Entities.GetAbilityByName(MyEnt, "special_bonus_unique_invoker_8")
						if(talent !== -1 && Abilities.GetLevel(talent) > 0)
							lift_duration += Abilities.GetSpecialValueFor(talent, "value")
						
						$.Schedule(lift_duration + Fusion.MyTick * 2, function() {
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

		Game.AddCommand("__InvokerCombo", Fusion.Commands.InvokerCombo, "", 0)
		// TODO: add invoker skills' functions with callbacks, integrate to code and turn into commands
	}
}

script = {
	name: "EzInvoker",
	onPreload: onPreloadF,
	isVisible: false
}