var MainHud = Fusion.Panels.Main,
	uiw = Fusion.Panels.Main.actuallayoutwidth,
	uih = Fusion.Panels.Main.actuallayoutheight,
	manabar_layout

DeleteAll = () => {
	if(Fusion.Panels.EnemyManaBars)
		Fusion.Panels.EnemyManaBars.entries().map(ar => ar[1]).forEach(panel =>  panel.DeleteAsync(0))
	Fusion.Panels.EnemyManaBars = new Map()
}

EMBEvery = () => {
	var HEnts = Entities.PlayersHeroEnts().filter(ent =>
		Entities.IsAlive(ent)
		&& Entities.IsEnemy(ent)
		&& !(
			Entities.IsBuilding(ent)
			|| Entities.IsInvulnerable(ent)
		)
	)
	
	Fusion.Panels.EnemyManaBars.entries().map(ar => ar[0]).filter(ent => HEnts.indexOf(ent) === -1).forEach(ent => Fusion.Panels.EnemyManaBars.get(ent).visible = false)
	
	HEnts.forEach(ent => {
		var xyz = Entities.GetAbsOrigin(ent),
			healthbaroffset = Entities.GetHealthBarOffset(ent),
			uix = Game.WorldToScreenX(xyz[0], xyz[1], xyz[2] + healthbaroffset),
			uiy = Game.WorldToScreenY(xyz[0], xyz[1], xyz[2] + healthbaroffset),
			uixp = uix / uiw * 100,
			uiyp = uiy / uih * 100,
			Mana = Entities.GetMana(ent),
			MaxMana = Entities.GetMaxMana(ent),
			ManaPercent = Math.floor(Mana / MaxMana * 100)
		if (!xyz || !healthbaroffset || uix === -1 || uiy === -1 || !isFinite(uixp) || !isFinite(uiyp) || !uixp || !uiyp || !ManaPercent) {
			var manabar
			if(manabar = Fusion.Panels.EnemyManaBars.get(ent))
				manabar.visible = false
			return
		}
		if (!Fusion.Panels.EnemyManaBars.has(ent)) {
			var panel = $.CreatePanel("Panel", MainHud, "EnemyManaBar")
			panel.BLoadLayoutFromString(manabar_layout, false, false)
			Fusion.Panels.EnemyManaBars.set(ent, panel)
		}
		var manabar = Fusion.Panels.EnemyManaBars.get(ent)
		manabar.visible = true
		manabar.style.position = `${uixp}% ${uiyp}% 0`
		manabar.Children()[0].style.width = `${ManaPercent}%`
	})
	if(EnemyManaBars.checked)
		$.Schedule(Fusion.MyTick, EMBEvery)
	else
		DeleteAll()
}

DeleteAll()
var EnemyManaBars = Fusion.AddScript("EnemyManaBars", () => {
	if (EnemyManaBars.checked) {
		Fusion.GetXML("EnemyManaBars/manabar", xml => {
			manabar_layout = xml
			EMBEvery()
		})
		Game.ScriptLogMsg("Script enabled: EnemyManaBars", "#00ff00")
	} else
		Game.ScriptLogMsg("Script disabled: EnemyManaBars", "#ff0000")
})