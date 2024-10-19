// Player Object (initially empty, to be loaded from localStorage if available)
let player = {};

// Initialize player data or prompt for new player
function initializePlayer() {
    const savedPlayer = localStorage.getItem('player');
    if (savedPlayer) {
        player = JSON.parse(savedPlayer);

        // Ensure proper initialization of player properties
        player.hp = player.hp || 100;
        player.maxHp = player.maxHp || 100;
        player.attack = player.attack || 10;
        player.defense = player.defense || 0;
        player.coins = player.coins || 50;

        // Ensure inventory and equipment are initialized properly
        player.inventory = player.inventory || {};
        player.inventory.healthPotions = player.inventory.healthPotions || 0;
        player.inventory.equipment = player.inventory.equipment || {
            weapon: null,
            armor: null
        };

        displayStats();  // Display stats on load
    } else {
        // If no saved data, create a new player
        const name = prompt("Enter your player's name:");
        player = {
            name: name || "Player",
            hp: 100,
            maxHp: 100,
            attack: 10,
            defense: 0,
            coins: 50,
            inventory: {
                healthPotions: 0,
                equipment: {
                    weapon: null,
                    armor: null
                }
            }
        };
        saveGame();
        displayStats();  // Display stats for new player
    }
}

// Function to display game messages in the output div
function updateOutput(message, append = false) {
    const outputElement = document.getElementById('output');
    if (append) {
        outputElement.innerHTML += `<p>${message}</p>`;  // Append the message
    } else {
        outputElement.innerHTML = `<p>${message}</p>`;  // Replace current message
    }
}

// Save Game Functionality (completely silent)
function saveGame() {
    localStorage.setItem('player', JSON.stringify(player));  // Save player object, including inventory, to localStorage
}

// Display player stats in the stats panel
function displayStats() {
    const statsDiv = document.getElementById('stats');
    statsDiv.innerHTML = `
        <p><strong>Name:</strong> ${player.name}</p>
        <p><strong>HP:</strong> ${player.hp}/${player.maxHp}</p>
        <p><strong>Attack:</strong> ${player.attack}</p>
        <p><strong>Defense:</strong> ${player.defense}</p>
        <p><strong>Coins:</strong> ${player.coins}</p>
        <p><strong>Health Potions:</strong> ${player.inventory.healthPotions}</p>
        <p><strong>Weapon:</strong> ${player.inventory.equipment.weapon || 'None'}</p>
        <p><strong>Armor:</strong> ${player.inventory.equipment.armor || 'None'}</p>
    `;
}

// Take a step and trigger random events
function takeStep() {
    const events = ['monster', 'treasure', 'nothing'];
    const event = events[Math.floor(Math.random() * events.length)];

    if (event === 'monster') {
        updateOutput("You encounter a monster!", false);  // Clear output and show monster message
        startCombat();  // Handle combat
    } else if (event === 'treasure') {
        addItemToInventory('coins', Math.floor(Math.random() * 20) + 10);
        updateOutput("You found treasure! You received some coins.", true);  // Append treasure message
        saveGame();  // Auto-save silently after treasure
    } else {
        updateOutput("Nothing happens this time.", false);  // Clear output for nothing event
        saveGame();  // Auto-save silently after nothing happens
    }
}

// Start Combat with Monster
function startCombat() {
    currentMonster = { name: "Goblin", hp: Math.floor(Math.random() * 40) + 20, attack: Math.floor(Math.random() * 5) + 5 };
    updateOutput(`A wild ${currentMonster.name} appears with ${currentMonster.hp} HP!`, true);
    document.getElementById('attackButton').style.display = 'block';
}

// Player attacks the monster
function playerAttack() {
    const playerDamage = Math.floor(Math.random() * 10) + player.attack;  // Attack based on equipped weapon
    currentMonster.hp -= playerDamage;
    updateOutput(`You hit the ${currentMonster.name} for ${playerDamage} damage. It has ${currentMonster.hp} HP left.`, true);
    
    if (currentMonster.hp > 0) {
        monsterAttack();  // Monster counter-attacks if it's still alive
    } else {
        updateOutput(`You defeated the ${currentMonster.name}!`, true);
        document.getElementById('attackButton').style.display = 'none';  // Hide attack button after battle
        generateLoot();  // Generate loot after defeating the monster
        saveGame();  // Save game after battle
    }
}

// Monster counter-attacks the player
function monsterAttack() {
    const monsterDamage = Math.floor(Math.random() * 8) + 3;  // Random damage between 3 and 10
    player.hp -= monsterDamage;
    updateOutput(`The ${currentMonster.name} hits you for ${monsterDamage} damage. You have ${player.hp} HP left.`, true);
    
    if (player.hp <= 0) {
        player.hp = player.maxHp;  // Regenerate health after defeat
        updateOutput("You were defeated but your health has been fully restored!", true);
        document.getElementById('attackButton').style.display = 'none';  // Hide attack button after defeat
        saveGame();  // Save game after defeat and regeneration
    } else {
        saveGame();  // Save game after the monster's turn
    }
}

// Generate random loot after defeating a monster
function generateLoot() {
    const randomLoot = Math.random() < 0.8 ? lootTable.common : lootTable.rare;
    const loot = randomLoot[Math.floor(Math.random() * randomLoot.length)];

    if (loot === 'coins') {
        const amount = Math.floor(Math.random() * 30) + 20;  // Random amount of coins
        addItemToInventory('coins', amount);
        updateOutput(`You looted ${amount} coins!`, true);
    } else if (loot === 'healthPotion') {
        addItemToInventory('healthPotion', 1);
        updateOutput(`You looted a health potion!`, true);
    } else if (loot === 'sword' || loot === 'shield') {
        addEquipment(loot);  // Equip the item
        updateOutput(`You looted a ${loot}!`, true);
    }
}

// Add Items to Inventory (coins, health potions, or equipment)
function addItemToInventory(item, amount) {
    if (item === 'coins') {
        player.coins += amount;
    } else if (item === 'healthPotion') {
        player.inventory.healthPotions += amount;
    }
    saveGame();
    displayStats();
}

// Equip items (weapon or armor)
function addEquipment(equipment) {
    if (equipment === 'sword') {
        player.inventory.equipment.weapon = 'sword';
        player.attack += 5;  // Sword increases attack by 5
    } else if (equipment === 'shield') {
        player.inventory.equipment.armor = 'shield';
        player.defense += 3;  // Shield increases defense by 3
    }
    saveGame();
    displayStats();
}

// Buy health potions from the shop
function buyHealthPotion() {
    const potionCost = 20;  // Set a cost for health potions
    if (player.coins >= potionCost) {
        player.coins -= potionCost;
        addItemToInventory('healthPotion', 1);  // Add 1 health potion to inventory
    } else {
        updateOutput("You don't have enough coins to buy a health potion.", true);
    }
}

// Use health potion to restore health (can be used at any time)
function useHealthPotion() {
    if (player.inventory.healthPotions > 0) {
        player.inventory.healthPotions -= 1;

        // Ensure player.hp is a number and cap it at maxHp after healing
        player.hp = Math.min(player.maxHp, (isNaN(player.hp) ? 0 : player.hp) + 50);  // Add 50 HP, but not exceeding maxHp
        
        updateOutput("You used a health potion and restored 50 HP!", true);
        saveGame();
        displayStats();  // Update stats after using potion
    } else {
        updateOutput("You don't have any health potions!", true);
    }
}

// Save Game Functionality (completely silent)
function saveGame() {
    localStorage.setItem('player', JSON.stringify(player));  // Save player object, including inventory, to localStorage
}

// Call the initialization function on page load
initializePlayer();
