var MainHud = Fusion.Panels.Main
var manabar_layout, uiw, uih
function DeleteAll() {
	try {
		Fusion.Panels.EnemyManaBars.forEach(function(panel) {
			try {
				panel.DeleteAsync(0)
			} catch(e) {  }
		})
	} catch(e) {  }
	try {
		Fusion.Particles.EnemyManaBars.forEach(function(par) {
			try {
				Particles.DestroyParticleEffect(par, par)
			} catch(e) {  }
		})
	} catch(e) {  }
	Fusion.Panels.EnemyManaBars = []
	Fusion.Particles.EnemyManaBars = []
}

var FlyingHeroes = [

]
function EMBEvery() {
	var HEnts = Game.PlayersHeroEnts().map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && Entities.IsEnemy(ent)
	})
	
	for(var i in Fusion.Panels.EnemyManaBars)
		if(HEnts.indexOf(i) === -1)
			Fusion.Panels.EnemyManaBars[i].visible = false
	
	HEnts.forEach(function(ent) {
		if (!Entities.IsEnemy(ent) || !Entities.IsAlive(ent) || Game.IsIllusion(ent)) {
			if (Fusion.Panels.EnemyManaBars[ent])
				Fusion.Panels.EnemyManaBars[ent].visible = false
			if(Entities.IsEnemy(ent) && Game.IsIllusion(ent) && typeof Fusion.Particles.EnemyManaBars[ent] === "undefined" && Fusion.Configs.EnemyManaBars.DisplayParticle) {
				Fusion.Particles.EnemyManaBars[ent] = Particles.CreateParticle("particles/dark_smoke_test.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, ent)
				Particles.SetParticleControl(Fusion.Particles.EnemyManaBars[ent], 1, [500, 0, 0])
			}
			return
		}
		var xyz = Entities.GetAbsOrigin(ent)
		var healthbaroffsetGround = 200
		var healthbaroffsetFlying = 300
		var healthbaroffset = (FlyingHeroes.indexOf(Entities.GetUnitName(ent)) > -1) ? healthbaroffsetFlying : healthbaroffsetGround
		if (!xyz || !healthbaroffset) {
			if (Fusion.Panels.EnemyManaBars[ent])
				Fusion.Panels.EnemyManaBars[ent].visible = false
			return
		}
		var uix = Game.WorldToScreenX(xyz[0], xyz[1], xyz[2] + healthbaroffset),
			uiy = Game.WorldToScreenY(xyz[0], xyz[1], xyz[2] + healthbaroffset)
		if (uix == -1 || uiy == -1) {
			if (Fusion.Panels.EnemyManaBars[ent])
				Fusion.Panels.EnemyManaBars[ent].visible = false
			return
		}
		var uixp = uix / uiw * 100
		var uiyp = uiy / uih * 100
		if (!isFinite(uixp) || !isFinite(uiyp) || !uixp || !uiyp) {
			if (Fusion.Panels.EnemyManaBars[ent])
				Fusion.Panels.EnemyManaBars[ent].visible = false
			return
		}
		if (!Fusion.Panels.EnemyManaBars[ent]) {
			Fusion.Panels.EnemyManaBars[ent] = $.CreatePanel("Panel", MainHud, "EnemyManaBar")
			Fusion.Panels.EnemyManaBars[ent].BLoadLayoutFromString(manabar_layout, false, false)
		}
		Fusion.Panels.EnemyManaBars[ent].visible = true
		Fusion.Panels.EnemyManaBars[ent].style.position = uixp + "% " + uiyp + "% 0"
		var Mana = Entities.GetMana(parseInt(ent))
		var MaxMana = Entities.GetMaxMana(parseInt(ent))
		var ManaPercent = Math.floor(Mana / MaxMana * 100)
		if (!ManaPercent) {
			if (Fusion.Panels.EnemyManaBars[ent])
				Fusion.Panels.EnemyManaBars[ent].visible = false
			return
		}
		Fusion.Panels.EnemyManaBars[ent].Children()[0].style.width = ManaPercent + "%"
	})
	if(EnemyManaBars.checked)
		$.Schedule(Fusion.MyTick, EMBEvery)
	else
		DeleteAll()
}

function EnemyManaBarsF() {
	if (!EnemyManaBars.checked) {
		Game.ScriptLogMsg("Script disabled: EnemyManaBars", "#ff0000")
	} else {
		uiw = Fusion.Panels.Main.actuallayoutwidth
		uih = Fusion.Panels.Main.actuallayoutheight
		Fusion.GetConfig("EnemyManaBars", function(config) {
			Fusion.GetXML("EnemyManaBars/manabar", function(xml) {
				manabar_layout = xml
				Fusion.Configs.EnemyManaBars = config
				EMBEvery()
			})
		})
		Game.ScriptLogMsg("Script enabled: EnemyManaBars", "#00ff00")
	}
}

DeleteAll()
var EnemyManaBars = Game.AddScript("EnemyManaBars", EnemyManaBarsF)