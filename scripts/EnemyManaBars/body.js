var MainHud = Fusion.Panels.Main,
	uiw = Fusion.Panels.Main.actuallayoutwidth,
	uih = Fusion.Panels.Main.actuallayoutheight,
	enabled = false,
	manabar_layout

function DeleteAll() {
	if(Fusion.Panels.EnemyManaBars)
		Fusion.Panels.EnemyManaBars.forEach(panel => panel.DeleteAsync(0))
	Fusion.Panels.EnemyManaBars = new Map()
}

function EMBEvery() {
	var HEnts = Entities.PlayersHeroEnts().filter(ent =>
		Entities.IsAlive(ent)
		&& Entities.IsEnemy(ent)
		&& !(
			Entities.IsBuilding(ent)
			|| Entities.IsInvulnerable(ent)
		)
	)
	
	Fusion.Panels.EnemyManaBars.forEach((panel, ent) => {
		if(HEnts.indexOf(ent) !== -1)
			return
		ent => Fusion.Panels.EnemyManaBars.get(ent).visible = false
	})
	
	HEnts.forEach(ent => {
		var xyz = Entities.GetAbsOrigin(ent),
			healthbaroffset = Entities.GetHealthBarOffset(ent),
			uix = Game.WorldToScreenX(xyz[0], xyz[1], xyz[2] + healthbaroffset) + 2,
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
	if(enabled)
		$.Schedule(Fusion.MyTick, EMBEvery)
	else
		DeleteAll()
}

script = {
	name: "EnemyManaBars",
	onPreload: () => Fusion.GetXML("EnemyManaBars/manabar").then(xml => manabar_layout = xml),
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (checkbox.checked) {
			EMBEvery()
			Game.ScriptLogMsg("Script enabled: EnemyManaBars", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: EnemyManaBars", "#ff0000")
	},
	onDestroy: () => {
		enabled = false
		DeleteAll()
	}
}