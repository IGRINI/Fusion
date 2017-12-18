var blockUnAgr = false,
	enabled = false,
	MyHP

function UnAgrOnInterval() {
	UnAgrF()

	if(enabled)
		$.Schedule(Fusion.MyTick, UnAgrOnInterval)
}

function UnAgrF() {
	if (blockUnAgr)
		return

	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()),
		curHP = Entities.GetHealth(MyEnt)
	
	if (MyHP === undefined || curHP >= MyHP) {
		MyHP = curHP
		return
	}
	MyHP = curHP
	
	Entities.GetAllEntitiesByClassname("npc_dota_creep_lane")
		.filter(creep => !Entities.IsEnemy(creep) && Entities.IsAlive(creep) && Entities.IsEntityInRange(MyEnt, creep, 520))
		.forEach(creep => {
			Game.AttackTarget(MyEnt, creep, false)
			Game.EntStop(MyEnt)
		})
	blockUnAgr = true
	$.Schedule(1, () => blockUnAgr = false)
}

script = {
	name: "Auto UnAgr",
	onPreload: () => {
		if(!Fusion.Commands.AgrCreepsF) {
			Fusion.Commands.AgrCreepsF = () => {
				var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
				Entities.PlayersHeroEnts().filter(ent => Entities.IsEnemy(ent) && Entities.IsAlive(ent) && Entities.IsEntityInRange(MyEnt, ent, 520)).forEach(ent => {
					Game.AttackTarget(MyEnt, ent, false)
					Game.EntStop(MyEnt)
				})
			}
			Game.AddCommand("__AgrCreeps", Fusion.Commands.AgrCreepsF, "", 0)
		}
	},
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			UnAgrOnInterval()
			Game.ScriptLogMsg("Script enabled: AgrUnAgr", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: AgrUnAgr", "#ff0000")
	},
	onDestroy: () => enabled = false
}