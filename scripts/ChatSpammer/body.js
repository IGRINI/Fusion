const str = 'a'.repeat(0xFF),
	heroes = [
		"Slark",
		"Pudge",
		"Techies",
		"Windranger",
		"Shadow Demon",
	]
var enabled = false

function ChatSpammerF() {
	/*var randHero = heroes.randomElement()
	suggest_hero_pick(randHero)
	suggest_hero_pick(randHero)*/
	suggest_hero_role(str)

	if(enabled)
		$.Schedule(Fusion.MyTick * 5, ChatSpammerF)
}

function suggest_hero_pick(heroName) {
	Game.ServerCmd(`suggest_hero_pick ${heroName}`)
}

function suggest_hero_role(roleName) {
	Game.ServerCmd(`suggest_hero_role ${roleName}`)
}

script = {
	name: "Chat Spammer",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			ChatSpammerF()
			Game.ScriptLogMsg("Script enabled: Chat Spammer", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: Chat Spammer", "#ff0000")
	},
	onDestroy: () => enabled = false
}