// Player object
const player = {
    name: 'Hero',
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 5,
    coins: 0,
    inventory: {
        healthPotions: 2,
        equipment: {
            weapon: null,
            armor: null
        }
    }
};

// Monster object
const monster = {
    name: 'Goblin',
    hp: 50,
    attack: 8,
    defense: 3
};

// Save player object to localStorage
function saveGame() {
    localStorage.setItem('player', JSON.stringify(player));
    updateOutput('Game saved!', true);
}

// Load player object from localStorage
function loadGame() {
    const savedPlayer = localStorage.getItem('player');
    if (savedPlayer) {
        Object.assign(player, JSON.parse(savedPlayer));
        updateOutput('Game loaded!', true);
    } else {
        updateOutput('No saved game found.', true);
    }
    displayStats();
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

// Update output area
function updateOutput(message, append = false) {
    const outputDiv = document.getElementById('output');
    if (append) {
        outputDiv.innerHTML += `<p>${message}</p>`;
    } else {
        outputDiv.innerHTML = `<p>${message}</p>`;
    }
}

// Add item to inventory
function addItemToInventory(item, amount) {
    if (item === 'coins') {
        player.coins += amount;
    } else if (item === 'healthPotions') {
        player.inventory.healthPotions += amount;
    }
    displayStats();
}

// Use health potion
function useHealthPotion() {
    if (player.inventory.healthPotions > 0) {
        player.hp = Math.min(player.maxHp, player.hp + 20);
        player.inventory.healthPotions -= 1;
        updateOutput('You used a health potion.', true);
        displayStats();
    } else {
        updateOutput('You have no health potions left.', true);
    }
}

// Start combat
function startCombat() {
    document.getElementById('attackButton').style.display = 'inline-block';
    updateOutput(`A wild ${monster.name} appears!`, false);
}

// Attack monster
function attackMonster() {
    const playerDamage = Math.max(0, player.attack - monster.defense + Math.floor(Math.random() * 5));
    const monsterDamage = Math.max(0, monster.attack - player.defense + Math.floor(Math.random() * 5));

    monster.hp -= playerDamage;
    player.hp -= monsterDamage;

    updateOutput(`You dealt ${playerDamage} damage to the ${monster.name}.`, true);
    updateOutput(`The ${monster.name} dealt ${monsterDamage} damage to you.`, true);

    if (monster.hp <= 0) {
        updateOutput(`You defeated the ${monster.name}!`, true);
        addItemToInventory('coins', Math.floor(Math.random() * 20) + 10);
        document.getElementById('attackButton').style.display = 'none';
        monster.hp = 50; // Reset monster HP for next encounter
    }

    if (player.hp <= 0) {
        updateOutput(`You have been defeated! Game over.`, true);
        document.getElementById('attackButton').style.display = 'none';
    }

    displayStats();
}

// Buy item from shop
function buyItem(item) {
    if (item === 'healthPotion' && player.coins >= 10) {
        player.coins -= 10;
        player.inventory.healthPotions += 1;
        updateOutput('You bought a health potion.', true);
    } else if (item === 'weapon' && player.coins >= 50) {
        player.coins -= 50;
        player.attack += 5;
        player.inventory.equipment.weapon = 'Sword';
        updateOutput('You bought a sword.', true);
    } else if (item === 'armor' && player.coins >= 50) {
        player.coins -= 50;
        player.defense += 5;
        player.inventory.equipment.armor = 'Shield';
        updateOutput('You bought a shield.', true);
    } else {
        updateOutput('You do not have enough coins.', true);
    }
    displayStats();
}

// Take a step and trigger random events
function takeStep() {
    const events = ['monster', 'treasure', 'nothing', 'shop'];
    const event = events[Math.floor(Math.random() * events.length)];

    if (event === 'monster') {
        updateOutput("You encounter a monster!", false);
        startCombat();
    } else if (event === 'treasure') {
        addItemToInventory('coins', Math.floor(Math.random() * 20) + 10);
        updateOutput("You found treasure! You received some coins.", true);
        saveGame();
    } else if (event === 'shop') {
        document.getElementById('shop').style.display = 'block';
        updateOutput("You found a shop!", false);
    } else {
        updateOutput("Nothing happens this time.", false);
    }
}

// Initialize game
function initGame() {
    const savedPlayer = localStorage.getItem('player');
    if (savedPlayer) {
        Object.assign(player, JSON.parse(savedPlayer));
    }
    displayStats();
    document.getElementById('takeStepButton').addEventListener('click', takeStep);
    document.getElementById('attackButton').addEventListener('click', attackMonster);
    document.getElementById('buyPotionButton').addEventListener('click', () => buyItem('healthPotion'));
    document.getElementById('buyWeaponButton').addEventListener('click', () => buyItem('weapon'));
    document.getElementById('buyArmorButton').addEventListener('click', () => buyItem('armor'));
    document.getElementById('usePotionButton').addEventListener('click', useHealthPotion);
    document.getElementById('saveButton').addEventListener('click', saveGame);
    document.getElementById('loadButton').addEventListener('click', loadGame);
}

// Start the game
initGame();