var AbuseManaItems = [
	"item_guardian_greaves",
	"item_soul_ring",
	"item_bottle",
	"item_magic_stick",
	"item_magic_wand"
]

function onPreloadF() {
	if(Fusion.Commands.ManaAbuseF)
		return
	
	Fusion.Commands.ManaAbuseF = () => {
		var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()),
			myVec = Entities.GetAbsOrigin(MyEnt),
			Inv = Game.GetInventory(MyEnt).filter(item => item !== -1)
		Inv.forEach(Item => {
			var ItemName = Abilities.GetAbilityName(Item),
				ManaPool = 0
			ManaPool += Abilities.GetSpecialValueFor(Item, "bonus_int")
			ManaPool += Abilities.GetSpecialValueFor(Item, "bonus_intellect")
			ManaPool += Abilities.GetSpecialValueFor(Item, "bonus_all_stats")
			ManaPool += Abilities.GetSpecialValueFor(Item, "bonus_mana")
			if(ManaPool > 0 && AbuseManaItems.indexOf(ItemName) === -1)
				Game.DropItem(MyEnt, Item, myVec, false)
		})
		Inv.filter(Item => AbuseManaItems.indexOf(Abilities.GetAbilityName(Item)) !== -1).forEach(Item => Game.CastNoTarget(MyEnt, Item, false))
		Entities.GetAllEntities().filter(ent =>
			Entities.IsAlive(ent)
			&& !(
				Entities.IsBuilding(ent)
				|| Entities.IsInvulnerable(ent)
			)
			&& Game.PointDistance(Entities.GetAbsOrigin(ent), myVec) <= 150
		).forEach(ent => Game.PickupItem(MyEnt, ent, false))
	}
	Game.AddCommand("__ManaAbuse", Fusion.Commands.ManaAbuseF, "", 0)
}
script = {
	name: "ManaAbuse",
	isVisible: false,
	onPreload: onPreloadF
}