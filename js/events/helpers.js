// Event Handlers - Shared Helper Functions
// Dependencies: Utils (from Utils.js), cloneItem (from EnemyGenerator.js)

// Generate a random item with specified rarity
function generateItem(rarity, difficulty = 1, isPyramid = false) {
    const baseItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    return cloneItem(baseItem, rarity, isPyramid);
}
