//Автостилл спелов
try{
	Fusion.Panels.RubickAutoSteal.DeleteAsync(0)
}catch(e){}

var interval = 0.1
var LenseBonusRange = 200
var flag = false
var StealIfThere = true
var WTFMode = false

function RubickAutoStealF(){
	if ( !RubickAutoSteal.checked ){
		try{
			Fusion.Panels.RubickAutoSteal.DeleteAsync(0)
		}catch(e){}
		return
	}
	var AbPanel = Fusion.Panels.RubickAutoSteal.Children()
	var z = []
	for(i in AbPanel){
		if(AbPanel[i].style.opacity==1 || AbPanel[i].style.opacity==null)
			z.push(AbPanel[i].Children()[0].abilityname)
	}
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var Ulti = Entities.GetAbilityByName(MyEnt, "rubick_spell_steal" )
	var UltiRange = Abilities.GetCastRangeFix( Ulti )
	var UltiLvl = Abilities.GetLevel(Ulti)
	var UltiCd = Abilities.GetCooldownTimeRemaining( Ulti )
	if(flag)
		if(UltiCd!=0)
			flag = false
		else
			return
	if(UltiLvl <= 0)
		return
	
	Entities.PlayersHeroEnts().some(function(ent) {
		if( !Entities.IsEnemy(ent) || Entities.IsMagicImmune(ent) || !Entities.IsAlive(ent))
			return false
		var Range = Entities.GetRangeToUnit(MyEnt, ent)
		if(!WTFMode && Range > UltiRange)
			return false
		var Count = Entities.GetAbilityCount( ent )
		for(i=0;i<Count;i++){
			var ab = Entities.GetAbility( ent, i )
			var lvl = Abilities.GetLevel( ab )
			if(lvl==-1 || !Abilities.IsDisplayedAbility(ab) || Abilities.IsPassive(ab) )
				return false
			var name = Abilities.GetAbilityName( ab )
			if(z.indexOf(name)==-1)
				return false
			var cd = Abilities.GetCooldownTimeRemaining( ab )
			var cda = Abilities.GetCooldown( ab )
			/*if(me !== -1 && !StealIfThere)
				return false*/
			
			if(UltiCd == 0 && (WTFMode || (Math.ceil(cd) == cda && cda != 0))){
				flag = true
				Game.CastTarget(MyEnt, Ulti, ent, false)
				return true
			}
			
			return false
		}
	})
}
function RubickAutoStealCreatePanel(){
	Fusion.Panels.RubickAutoSteal = $.CreatePanel( "Panel", Fusion.Panels.Main, "RubickAutoStealAbilities" )
	Fusion.Panels.RubickAutoSteal.BLoadLayoutFromString("<root><Panel style='border: 1px solid #000;background-color:#000000EE;flow-children:down-wrap;max-width:200px;border-radius:10px;padding:5px 3px;' onactivate='Add()'></Panel></root>", false, false )
	GameUI.MovePanel(Fusion.Panels.RubickAutoSteal,function(p){
		var position = p.style.position.split(" ")
		Fusion.Configs.RubickAutoSteal.MainPanel.x = position[0]
		Fusion.Configs.RubickAutoSteal.MainPanel.y = position[1]
		Fusion.SaveConfig("RubickAutoSteal", Fusion.Configs.RubickAutoSteal)
	})
	Fusion.GetConfig("RubickAutoSteal",function(config) {
		Fusion.Configs.RubickAutoSteal = config
		Fusion.Panels.RubickAutoSteal.style.position = `${config.MainPanel.x} ${config.MainPanel.y} 0`
	});
	Entities.PlayersHeroEnts().forEach(function(ent) {
		if(!Entities.IsEnemy(ent))
			return
		var Count = Entities.GetAbilityCount( ent )
		for(i=0;i<Count;i++){
			var ab = Entities.GetAbility( ent, i )
			if(!Abilities.IsDisplayedAbility(ab) || Abilities.IsPassive(ab) )
				return
			var name = Abilities.GetAbilityName( ab )
			var Item = $.CreatePanel( "Panel", Fusion.Panels.RubickAutoSteal, "RubickAutoStealAbilities" )
			//Item.BLoadLayoutFromString( "<root><Panel><DOTAAbilityImage style="width:35px;"/></Panel></root>", false, false )
			Item.BLoadLayoutFromString( "<root><script>function Add(){$.GetContextPanel().style.opacity='0.1';$.GetContextPanel().SetPanelEvent('onactivate', Rem)}function Rem(){$.GetContextPanel().style.opacity='1.0';$.GetContextPanel().SetPanelEvent('onactivate', Add)}</script><Panel style='border: 1px solid #000; border-radius: 10px;' onactivate='Add()'><DOTAAbilityImage style='width:35px;'/></Panel></root>", false, false )
			Item.Children()[0].abilityname=name
		}
	})
}

function RubickAutoStealOnCheckBoxClick() {
	if ( !RubickAutoSteal.checked ){
		try{
			Fusion.Panels.RubickAutoSteal.DeleteAsync(0)
		}catch(e){}
		Game.ScriptLogMsg("Script disabled: RubickAutoSteal", "#ff0000")
		return
	}
	if ( Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) != "npc_dota_hero_rubick" ){
		RubickAutoSteal.checked = false
		Game.ScriptLogMsg("RubickAutoSteal: Not Rubick", "#ff0000")
		return
	}
	//циклически замкнутый таймер с проверкой условия с интервалом "interval"
	function f(){ $.Schedule( interval,function(){
		RubickAutoStealF()
		if(RubickAutoSteal.checked)
			f()
	})}
	f()
	RubickAutoStealCreatePanel()
	Game.ScriptLogMsg("Script enabled: RubickAutoSteal", "#00ff00")
}

var RubickAutoSteal = Fusion.AddScript("RubickAutoSteal", RubickAutoStealOnCheckBoxClick)