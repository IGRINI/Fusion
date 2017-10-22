var AbuseManaItems = [
	"item_arcane_boots",
	"item_guardian_greaves",
	"item_soul_ring",
	"item_bottle",
	"item_magic_stick",
	"item_magic_wand"
]
function ManaAbuseF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var myVec = Entities.GetAbsOrigin(MyEnt)
	var Inv = Game.GetInventory(MyEnt)
	Inv.forEach(function(ent) {
		var Item = parseInt(ent)
		var ItemName = Abilities.GetAbilityName(Item)
		var ManaPool = 0
		ManaPool += Abilities.GetSpecialValueFor(Item, "bonus_int")
		ManaPool += Abilities.GetSpecialValueFor(Item, "bonus_intellect")
		ManaPool += Abilities.GetSpecialValueFor(Item, "bonus_all_stats")
		ManaPool += Abilities.GetSpecialValueFor(Item, "bonus_mana")
		if(ManaPool > 0 && AbuseManaItems.indexOf(ItemName) === -1)
			Game.DropItem(MyEnt, Item, myVec, false)
	})
	Inv.forEach(function(ent) {
		var Item = parseInt(ent)
		var ItemName = Abilities.GetAbilityName(Item)
		if(AbuseManaItems.indexOf(ItemName) !== -1)
			Game.CastNoTarget(MyEnt,Item,false)
	})
	Entities.GetAllEntities().map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && Game.PointDistance(Entities.GetAbsOrigin(ent), myVec) <= 150
	}).forEach(function(ent) {
		Game.PickupItem(MyEnt, ent, true)
	})
}

Game.AddCommand("__ManaAbuse", ManaAbuseF, "", 0)