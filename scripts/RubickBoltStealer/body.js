var enabled = false

function RubickBoltStealerOnInterval() {
	BoltSteal()
	
	if(enabled)
		$.Schedule(Fusion.MyTick, RubickBoltStealerOnInterval)
}

var flag = false
function BoltSteal() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(flag || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	
	var Bolt = Entities.GetAbilityByName(MyEnt, "rubick_fade_bolt")
	if(Bolt === -1 || Abilities.GetLevel(Bolt) === 0)
		return
	
	var BoltDamage = Abilities.GetLevelSpecialValueFor(Bolt, "damage", Abilities.GetLevel(Bolt)),
		BoltRefractionRange = Abilities.GetSpecialValueFor(Bolt, "radius"),
		BoltRange = Abilities.GetCastRangeFix(Bolt),
		BoltCastPoint = Abilities.GetCastPoint(Bolt)
	
	if(Abilities.GetCooldownTimeRemaining(Bolt) !== 0)
		return
	
	var ents = Entities.PlayersHeroEnts().filter(ent =>
		Entities.IsEnemy(ent)
		&& Entities.IsAlive(ent)
		&& !Entities.IsMagicImmune(ent)
		&& !Fusion.HasLinkenAtTime(ent, BoltCastPoint)
		&& !Entities.IsBuilding(ent)
		&& !Entities.IsInvulnerable(ent)
	)
	var targets = ents.filter(ent => Entities.GetHealth(ent) + Entities.GetHealthThinkRegen(ent) * 3 < Fusion.CalculateDamage(MyEnt, ent, BoltDamage, DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL))
	var starts = ents.filter(ent => Entities.GetRangeToUnit(MyEnt, ent) <= BoltRange)
	/*var nearMap = Fusion.BuildNearMap(ents, BoltRange)

	starts.some(ent => {
		if(Entities.GetHealth(ent) < BoltDamage) {
			CastBolt(MyEnt, Bolt, BoltCastPoint, ent)
			return true
		}
		
	})

	targets.some(ent => {
		if(Entities.GetRangeToUnit(MyEnt, ent) > BoltRange) {
			// Generate paths to ent by near map
			// FIXME: Not working.
			var pairs
			while((pairs = FindPairs(ent, nearMap)).length !== 0)
				pairs.forEach(pair => {
					if(Entities.GetRangeToUnit(MyEnt, pair) < Entities.GetRangeToUnit(MyEnt, ent))
						ent = pair
				})
			
			
			if(Entities.GetRangeToUnit(MyEnt, ent) > BoltRange)
				return false
		}
		
		CastBolt(MyEnt, Bolt, BoltCastPoint, ent)
		return true
	})
} else*/
		targets
			.filter(ent => Entities.GetRangeToUnit(MyEnt, ent) < BoltRange)
			.every(ent => {
				CastBolt(MyEnt, Bolt, BoltCastPoint, ent)
				return false
			})
}

function CastBolt(MyEnt, Bolt, BoltCastPoint, ent) {
	GameUI.SelectUnit(MyEnt, false)
	Game.CastTarget(MyEnt, Bolt, ent, false)
	
	flag = true
	$.Schedule(BoltCastPoint, () => flag = false)
}

/**
 * @argument el element that we'll find in 2D
 * @argument ar 2D array to search in
 * @returns pairs
 */
function FindPairs(el, ar) {
	return ar
			.filter(ar2 => ar2.indexOf(el) > -1)
			.map(ar2 => ar2[0] !== el ? ar2[0] : ar2[1])
}

script = {
	name: "RubickBoltStealer",
	onToggle: checkbox => {
		enabled = checkbox.checked

		if (enabled) {
			RubickBoltStealerOnInterval()
			Game.ScriptLogMsg("Script enabled: RubickBoltStealer", "#00ff00")
		} else
			Game.ScriptLogMsg("Script disabled: RubickBoltStealer", "#ff0000")
	},
	onDestroy: () => enabled = false
}