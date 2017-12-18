destroy()
var uiw = Game.GetScreenWidth(),
	uih = Game.GetScreenHeight(),
	interval = 0, hpn = false, b = false, z = 0,
	a = [
		[
			[-2625,-333,384],
			[-2576,-457,384],
			[-2517,-656,384],
			[-2675,-812,384],
			[-2826,-971,384],
			[-2987,-1121,384],
			[-3160,-1264,384],
			[-3292,-1416,384],
			[-3443,-1576,384],
			[-3621,-1706,384],
			[-3791,-1842,384],
			[-3959,-1983,384],
			[-4125,-2123,384]
		],
		[
			[3104,-769,256],
			[3033,-773,256],
			[2812,-786,256],
			[2602,-795,256],
			[2389,-772,256],
			[2207,-653,256],
			[2125,-447,256],
			[2085,-237,256],
			[2087,-15,256],
			[2152,187,256],
			[2267,360,256],
			[2322,575,256],
			[2400,736,256]
		]
	],
	camps = [
		[
			[-2463,-160,384],
			55,
			-0.05
			
		],
		[
			[3535,-786,256],
			54.9,
			0.1
		]
	],
	ancients = {
		"npc_dota_neutral_black_drake": [250,279],
		"npc_dota_neutral_big_thunder_lizard": [223,393],
		"npc_dota_neutral_granite_golem": [230,393]
	},
	spots = [
		[-3307, 383, -2564, -413, 400],
		[3456, -384, 4543, -1151, 300]
	],
	enabled = false,
	camp, myid, ent, team, status

function destroy() {
	if(Fusion.Subscribes.AncientCreepStack !== undefined) {
		GameEvents.Unsubscribe(Fusion.Subscribes.AncientCreepStack)
		delete Fusion.Subscribes.AncientCreepStack
	}
	if(Fusion.Panels.AncientCreepStack) {
		Fusion.Panels.AncientCreepStack.DeleteAsync(0)
		delete Fusion.Panels.AncientCreepStack
	}
	if(Fusion.Particles.AncientCreepStack)
		Fusion.Particles.AncientCreepStack.forEach(par => Particles.DestroyParticleEffect(par, true))
	Fusion.Particles.AncientCreepStack = []
}

function DrawBox(box) {
	Fusion.Particles.AncientCreepStack.push(Fusion.DrawLineInGameWorld(
		[box[0], box[1], box[4]],
		[box[0], box[3], box[4]]
	))
	Fusion.Particles.AncientCreepStack.push(Fusion.DrawLineInGameWorld(
		[box[2], box[1], box[4]],
		[box[2], box[3], box[4]]
	))
	Fusion.Particles.AncientCreepStack.push(Fusion.DrawLineInGameWorld(
		[box[0], box[1], box[4]],
		[box[2], box[1], box[4]]
	))
	Fusion.Particles.AncientCreepStack.push(Fusion.DrawLineInGameWorld(
		[box[0], box[3], box[4]],
		[box[2], box[3], box[4]]
	))
}

function GetNeutral(ent,maxrange) {
	var neutrals = Entities.GetAllEntitiesByClassname("npc_dota_creep_neutral")
	var mr = maxrange
	var n = -1
	var l = 0
	var e = -1
	var gold = 0
	var exp = 0
	neutrals
		.filter(neutral =>
			Entities.IsAncient(neutral)
			&& !Entities.NoHealthBar(neutral)
		)
		.forEach(neutral => {
			var p = Entities.GetAbsOrigin(neutral)
			var name = Entities.GetUnitName(neutral)
			if(!ancients[name]) {
				gold += ancients[name][0]
				exp += ancients[name][1]
			}
			if(p[0]>spots[team][0]-500&&p[0]<spots[team][2]+500&&p[1]<spots[team][1]+500&&p[1]>spots[team][3]-500)
				l++
			if(Entities.IsEntityInRange(ent, neutral, maxrange))
				n++
			if(Entities.IsEntityInRange(ent, neutral, mr) && Entities.IsEntityInRange(ent, neutral, maxrange) && ent != neutral){
				mr = Entities.GetRangeToUnit(ent, neutral)
				e = neutral
			}
		})
	return [e,mr,n,l,gold,exp]
}

function AncientCreepStackF() {
	if ( !enabled || Game.GameStateIsBefore(DOTA_GameState.DOTA_GAMERULES_STATE_PRE_GAME)){
		enabled = false
		destroy()
		return
	}
	if(!Entities.IsAlive(ent)){
		GameEvents.SendEventClientSide( "antiaddiction_toast", {"message":"Ваш крип помер смертью храбрых :(\nСкрипт деактивирован!","duration":"2"})
		enabled = false
		destroy()
		return
	}
	var xy = [Game.WorldToScreenX(spots[team][2]-400,spots[team][1],spots[team][4])+50,Game.WorldToScreenY(spots[team][2]-400,spots[team][1],spots[team][4]+50)]
	Fusion.Panels.AncientCreepStack.style.position = (xy[0]/uiw*100)+"% "+(xy[1]/uih*100)+"% 0"
	var time = Math.round(Game.GetDOTATime(false, false) % 60)
	var entnow = Players.GetLocalPlayerPortraitUnit()
	if(Entities.GetHealth(ent)<=400&&!hpn){
		hpn = true
		GameEvents.SendEventClientSide( "antiaddiction_toast", {"message":"У вашего крипа мало HP!","duration":"2"})
	}else if(Entities.GetHealth(ent)>400)
		hpn = false
	var xyz = Entities.GetAbsOrigin(ent)
	if(!Entities.IsRangedAttacker(ent)&&GetNeutral(ent,1000)[1]<=250)
		b=true
	if(time<50){
		if(Game.PointDistance(xyz, camp[0]) > 5 && status==0)
			move(ent,entnow,camp[0])
		interval = 0.5
	}
	else
		interval = 0
	//if(Math.abs(time+(GetNeutral(ent,1000)[1]/Entities.GetIdealSpeed(ent))-(camp[1]-(GetNeutral(ent,1000)[2]*camp[2])))<=0.2&&!Entities.IsMoving(ent)&&status==0) ну и хуйня ебаная.
	if(time==52.5){
		z=0
		b=false
		status=1
	}
	if(status==1&&!b){
		GameUI.SelectUnit(ent,false)
		Game.MoveToAttackPos(ent, xyz, false)
		GameUI.SelectUnit(entnow,false)
	}else if(status==1&&b){
		if(z>=a[team].length-2){
			status=0
			z=0
			b=false
			return
		}
		if(z==0){
			z++
			move(ent,entnow,a[team][z])
			return
		}
		if(Game.PointDistance(xyz, a[team][z]) <= 150){
			z++
			move(ent,entnow,a[team][z])
		}
	}
}
function AncientCreepStackU() {
	if ( !enabled || (Game.GetState()!=7 && Game.GetState()!=6))
		return
	var xy = [Game.WorldToScreenX(spots[team][2]-400,spots[team][1],spots[team][4])+50,Game.WorldToScreenY(spots[team][2]-400,spots[team][1],spots[team][4]+50)]
	if(xy[0]<0||xy[1]<0)
		Fusion.Panels.AncientCreepStack.visible = false
	else
		Fusion.Panels.AncientCreepStack.visible = true
	Fusion.Panels.AncientCreepStack.style.position = (xy[0]/uiw*100)+"% "+(xy[1]/uih*100)+"% 0"
	var neu = GetNeutral(ent,1000)
	Fusion.Panels.AncientCreepStack.Children()[0].text = `Stacks: ${Math.round(neu[3]/3)}`
	Fusion.Panels.AncientCreepStack.Children()[1].text = `Gold: ~${neu[4]}`
	Fusion.Panels.AncientCreepStack.Children()[2].text = `Exp: ~${neu[5]}`
	var time = Math.round(Game.GetDOTATime(false, false) % 60)
	Fusion.AnimatePanel( Fusion.Panels.AncientCreepStack, [["transform", "rotateX( 35deg ) translate3d( 0px, "+((time-Math.floor(time))*20)+"px, 0px );"]], 0.3, "ease-in-out", 0)
}

function move(ent, toSelect, vec) {
	GameUI.SelectUnit(ent, false)
	Game.MoveToPos(ent, vec, false)
	GameUI.SelectUnit(toSelect,false)
}

function onPreloadF() {
	if(Fusion.Commands.AncientCreepStack)
		return
	
	Fusion.Commands.AncientCreepStack = () => {
		myid = Players.GetLocalPlayer()
		team = Players.GetTeam(myid)-2
		camp = camps[team]
		status = 0
		ent = Players.GetLocalPlayerPortraitUnit()
		if(!(Entities.IsControllableByPlayer(ent,myid)&&Entities.IsCreep(ent)&&Entities.IsValidEntity(ent)&&Entities.IsAlive(ent)&&Entities.IsRangedAttacker(ent))){
			GameEvents.SendEventClientSide("antiaddiction_toast", {
				"message": "Выбранный юнит не является союзным подконтрольным крипом дальнего боя :(\nДоступна команда: __AncientCreepStack_Activate",
				"duration": "5"
			})
			enabled = false
			return
		}
		DrawBox(spots[team])
		Fusion.Subscribes.AncientCreepStack = GameEvents.Subscribe("entity_hurt", a => {
			if(a.entindex_attacker==ent)
				b=true
		})
		Fusion.Panels.AncientCreepStack = $.CreatePanel( "Panel", Fusion.Panels.Main, "AncientCreepStack" )
		Fusion.Panels.AncientCreepStack.BLoadLayoutFromString("\
<root>\
	<styles>\
		<include src='s2r://panorama/styles/dotastyles.vcss_c' />\
	</styles>\
	<Panel style='padding: 3px; border-radius: 5px; flow-children: down; background-color: #000000EE; border: 1px solid white;'>\
		<Label style='color:white;font-size:16px;'/>\
		<Label style='color:white;font-size:16px;'/>\
		<Label style='color:white;font-size:16px;'/>\
	</Panel>\
</root>", false, false)
		Fusion.AnimatePanel( Fusion.Panels.AncientCreepStack, [["transform", "rotateX( 35deg );"]], 0.3, "ease-in", 0)
		Game.ScriptLogMsg("Script enabled: AncientCreepStack", "#00ff00")
	}
	Game.AddCommand("__AncientCreepStack_Activate", Fusion.Commands.AncientCreepStack, "", 0)
}

script = {
	name: "Ancient Creep Stack",
	isVisible: false, // not working.. need to update coords
	onPreload: onPreloadF,
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (!checkbox.checked) {
			destroy()
			Game.ScriptLogMsg("Script disabled: Ancient Creep Stack", "#ff0000")
			return
		}
		Fusion.Commands.AncientCreepStack()
		function f() {
			$.Schedule(interval, () => {
				AncientCreepStackF()
				if(enabled)
					f()
			}
		)}
		f()
		function u() {
			$.Schedule(0, () => {
				AncientCreepStackU()
				if(enabled)
					u()
			}
		)}
		u()
		Game.ScriptLogMsg("Script enabled: Ancient Creep Stack", "#00ff00")
	},
	onDestroy: () => {
		enabled = false
		destroy()
	}
}