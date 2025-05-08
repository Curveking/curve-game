// Game logic helpers for the card battle game
// Contains card generation, deck generation, game initialization, and core mechanics

// Game Constants
export const ROWS = 5;
export const COLS = 7;
export const STARTING_HEALTH = 30;
export const STARTING_HAND_SIZE = 3;
export const MAX_MANA = 10;
export const HAND_SIZE_LIMIT = 7;
export const FATIGUE_DAMAGE = 1;

// Card Archetypes
export const ARCHETYPES = {
  orc: {
    name: 'Orc',
    color: 'bg-gradient-to-br from-green-700 to-green-900 border-green-500',
    icon: '🪓',
    highlightColor: 'shadow-green-500/50',
    unitColor: 'from-green-600 to-green-800',
    description: 'Aggressive warriors with high attack'
  },
  undead: {
    name: 'Undead', 
    color: 'bg-gradient-to-br from-purple-700 to-purple-900 border-purple-500',
    icon: '💀',
    highlightColor: 'shadow-purple-500/50',
    unitColor: 'from-purple-600 to-purple-800',
    description: 'Masters of summoning and board control'
  },
  human: {
    name: 'Human',
    color: 'bg-gradient-to-br from-blue-700 to-blue-900 border-blue-500', 
    icon: '⚔️',
    highlightColor: 'shadow-blue-500/50',
    unitColor: 'from-blue-600 to-blue-800',
    description: 'Versatile healers and magic users'
  },
  minotaur: {
    name: 'Minotaur',
    color: 'bg-gradient-to-br from-yellow-700 to-yellow-900 border-yellow-500',
    icon: '🐂',
    highlightColor: 'shadow-yellow-500/50',
    unitColor: 'from-yellow-600 to-yellow-800',
    description: 'Tanky warriors with high durability'
  }
};

// Generate a single card
export const generateCard = (id, archetypeKey, hasTaunt = false) => {
  const archetype = ARCHETYPES[archetypeKey];
  const cost = Math.floor(Math.random() * 10) + 1;
  let attack, health;
  
  if (hasTaunt) {
    // For Taunt units, less attack, more health
    attack = Math.max(1, Math.floor(cost * 0.6 + Math.random() * 2));
    health = Math.max(1, Math.floor(cost * 1.4 + Math.random() * 2));
  } else {
    // Regular stats based on archetype
    if (archetypeKey === 'orc') {
      attack = Math.max(1, Math.floor(cost * 1.2 + Math.random() * 2));
      health = Math.max(1, Math.floor(cost * 0.8 + Math.random() * 2));
    } else if (archetypeKey === 'minotaur') {
      attack = Math.max(1, Math.floor(cost * 0.8 + Math.random() * 2));
      health = Math.max(1, Math.floor(cost * 1.3 + Math.random() * 2));
    } else if (archetypeKey === 'human') {
      attack = Math.max(1, Math.floor(cost * 0.9 + Math.random() * 2));
      health = Math.max(1, Math.floor(cost * 1.1 + Math.random() * 2));
    } else {
      attack = Math.max(1, Math.floor(cost * 1.0 + Math.random() * 2));
      health = Math.max(1, Math.floor(cost * 1.0 + Math.random() * 2));
    }
  }
  
  return {
    id,
    name: hasTaunt ? `${archetype.name} Guardian` : `${archetype.name} Warrior`,
    cost,
    attack,
    health,
    maxHealth: health,
    type: archetypeKey,
    movement: 1,
    hasTaunt,
    description: hasTaunt ? 'Has Taunt: Enemies must attack this unit first.' : 'Basic unit with no special abilities'
  };
};

// Generate a preview deck for deck selection
export const generatePreviewDeck = (archetypeKey) => {
  const archetype = ARCHETYPES[archetypeKey];
  const deck = [];
  const commonCosts = [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 6, 6, 7, 8];
  commonCosts.forEach((cost, i) => {
    let attack, health;
    if (archetypeKey === 'orc') {
      attack = Math.floor(cost * 1.2);
      health = Math.floor(cost * 0.8);
    } else if (archetypeKey === 'minotaur') {
      attack = Math.floor(cost * 0.8);
      health = Math.floor(cost * 1.3);
    } else if (archetypeKey === 'human') {
      attack = Math.floor(cost * 0.9);
      health = Math.floor(cost * 1.1);
    } else {
      attack = cost;
      health = cost;
    }
    attack = Math.max(1, attack);
    health = Math.max(1, health);
    deck.push({
      id: `preview_${archetypeKey}_common_${i}`,
      name: `${archetype.name} Warrior`,
      cost,
      attack,
      health,
      maxHealth: health,
      type: archetypeKey,
      isSpecial: false,
      effects: [],
      effectDetails: [],
      description: 'Basic unit with no special abilities'
    });
  });
  return deck;
};

// Generate a shuffled deck of 15 cards
export const generateDeck = (archetypeKey) => {
  const deck = [];
  const numTaunt = Math.floor(15 * 0.2); // 20% have Taunt
  const tauntIndices = new Set();
  while (tauntIndices.size < numTaunt) {
    tauntIndices.add(Math.floor(Math.random() * 15));
  }
  
  for (let i = 0; i < 15; i++) {
    const hasTaunt = tauntIndices.has(i);
    deck.push(generateCard(`p${i}_common_${i}`, archetypeKey, hasTaunt));
  }
  
  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return deck;
};

// Initialize a new game state
export const initializeGame = (player1Archetype, player2Archetype) => {
  const board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
  const player1Deck = generateDeck(player1Archetype);
  const player2Deck = generateDeck(player2Archetype);
  const players = [
    {
      id: 0,
      health: STARTING_HEALTH,
      mana: 1,
      manaCapacity: 1,
      deck: player1Deck,
      hand: [],
      archetype: player1Archetype,
      fatigueDamage: 0
    },
    {
      id: 1,
      health: STARTING_HEALTH,
      mana: 1,
      manaCapacity: 1,
      deck: player2Deck,
      hand: [],
      archetype: player2Archetype,
      fatigueDamage: 0
    }
  ];
  
  // Draw initial cards for both players
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < STARTING_HAND_SIZE; j++) {
      if (players[i].deck.length > 0) {
        players[i].hand.push(players[i].deck.pop());
      }
    }
  }
  
  return {
    board,
    players,
    currentPlayer: 0,
    turn: 1,
    gameOver: false,
    winner: null,
    message: 'Player 1 Turn: Draw phase - Starting your turn!',
    selectedCard: null,
    isFirstTurn: true,
    isProcessingAI: false,
    log: ['Game started! Player 1 begins.'],
    gameMode: null,
    error: null
  };
};

// Draw a card or apply fatigue, using immutable updates
export const drawCardOrFatigue = (state, playerIndex) => {
  const newState = { ...state };
  let player = { ...newState.players[playerIndex] };
  if (player.hand.length < HAND_SIZE_LIMIT) {
    if (player.deck.length > 0) {
      const drawnCard = player.deck[player.deck.length - 1];
      const newHand = [...player.hand, drawnCard];
      const newDeck = player.deck.slice(0, -1);
      player = { ...player, hand: newHand, deck: newDeck };
      newState.log = [...newState.log, `Turn ${newState.turn}: Player ${playerIndex + 1} draws ${drawnCard.name}`];
    } else {
      player = { 
        ...player, 
        fatigueDamage: player.fatigueDamage + FATIGUE_DAMAGE,
        health: player.health - (player.fatigueDamage + FATIGUE_DAMAGE)
      };
      newState.log = [...newState.log, `Turn ${newState.turn}: Player ${playerIndex + 1} takes ${player.fatigueDamage + FATIGUE_DAMAGE} fatigue damage!`];
    }
  } else if (player.deck.length > 0) {
    const burnedCard = player.deck[player.deck.length - 1];
    const newDeck = player.deck.slice(0, -1);
    player = { ...player, deck: newDeck };
    newState.log = [...newState.log, `Turn ${newState.turn}: Player ${playerIndex + 1} burns ${burnedCard.name} (hand full)!`];
  }
  newState.players = newState.players.map((p, idx) => 
    idx === playerIndex ? player : p
  );
  return newState;
};

// Advance units for the current player, using immutable updates
export const advanceUnits = (state) => {
  const newBoard = state.board.map(row => [...row]);
  const newState = { ...state, board: newBoard };
  const currentPlayer = state.currentPlayer;
  const direction = currentPlayer === 0 ? 1 : -1;
  const opponentSpawnRow = currentPlayer === 0 ? ROWS - 1 : 0;
  const units = [];
  
  // Collect all units for the current player
  state.board.forEach((row, rowIndex) => {
    row.forEach((unit, colIndex) => {
      if (unit && unit.playerIndex === currentPlayer) {
        units.push({ unit, row: rowIndex, col: colIndex });
      }
    });
  });
  
  // Sort units by processing order
  units.sort((a, b) => currentPlayer === 0 ? b.row - a.row : a.row - b.row);
  
  // Process each unit's movement
  units.forEach(({ unit, row, col }) => {
    if (newState.board[row][col] !== unit) return;
    const newRow = row + direction;
    
    // Check for win condition (reaching opponent's spawn)
    if ((currentPlayer === 0 && newRow >= ROWS) || (currentPlayer === 1 && newRow < 0)) {
      newState.gameOver = true;
      newState.winner = currentPlayer;
      newState.message = currentPlayer === 0 ? 'Player 1 Wins!' : (state.gameMode === 'ai' ? 'AI Wins!' : 'Player 2 Wins!');
      newState.log = [...newState.log, `Turn ${state.turn}: ${unit.name} reached enemy spawn! ${newState.message}`];
      return;
    }
    
    // Try to move if space is empty
    if (newRow >= 0 && newRow < ROWS && !newState.board[newRow][col]) {
      // Check adjacent cells for enemy Taunt
      let canMove = true;
      const adjacentTiles = [
        { r: newRow - 1, c: col }, // Up
        { r: newRow + 1, c: col }, // Down
        { r: newRow, c: col - 1 }, // Left
        { r: newRow, c: col + 1 }  // Right
      ];
      
      for (const { r, c } of adjacentTiles) {
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
          const adjUnit = newState.board[r][c];
          if (adjUnit && adjUnit.playerIndex !== currentPlayer && adjUnit.hasTaunt) {
            canMove = false;
            newState.log = [...newState.log, `Turn ${state.turn}: ${unit.name} cannot move due to enemy Taunt unit ${adjUnit.name} at ${r},${c}`];
            break;
          }
        }
      }
      
      if (canMove) {
        newState.board[newRow][col] = unit;
        newState.board[row][col] = null;
        newState.log = [...newState.log, `Turn ${state.turn}: ${unit.name} moved to ${newRow},${col}`];
      }
    }
  });
  
  return newState;
};

// Battle phase for the current player, using immutable updates
export const battleUnits = (state) => {
  const newBoard = state.board.map(row => [...row]);
  const newState = { ...state, board: newBoard };
  const currentPlayer = state.currentPlayer;
  const direction = currentPlayer === 0 ? 1 : -1;
  const opponentSpawnRow = currentPlayer === 0 ? ROWS - 1 : 0;
  const opponentIndex = 1 - currentPlayer;
  const units = [];
  
  // Collect all units for the current player
  state.board.forEach((row, rowIndex) => {
    row.forEach((unit, colIndex) => {
      if (unit && unit.playerIndex === currentPlayer) {
        units.push({ unit, row: rowIndex, col: colIndex });
      }
    });
  });
  
  // Sort units by processing order
  units.sort((a, b) => currentPlayer === 0 ? b.row - a.row : a.row - b.row);
  
  // Process each unit's attacks
  units.forEach(({ unit, row, col }) => {
    if (newState.board[row][col] !== unit) return;
    
    // Check for enemies to attack
    const frontCells = [
      { r: row + direction, c: col },
      { r: row + direction, c: col - 1 },
      { r: row + direction, c: col + 1 }
    ].filter(cell => cell.r >= 0 && cell.r < ROWS && cell.c >= 0 && cell.c < COLS);
    
    // Find all valid targets
    const validTargets = frontCells
      .map(cell => ({ ...cell, unit: newState.board[cell.r][cell.c] }))
      .filter(cell => cell.unit && cell.unit.playerIndex !== currentPlayer);
    
    if (validTargets.length > 0) {
      // Prioritize Taunt units
      const tauntTargets = validTargets.filter(t => t.unit.hasTaunt);
      const target = tauntTargets.length > 0 ? tauntTargets[0] : validTargets[0];
      
      // Attack
      const originalHealth = target.unit.health;
      const damageDealt = unit.attack;
      const isOnSpawnRow = target.r === opponentSpawnRow;
      const newTarget = { ...target.unit, health: target.unit.health - damageDealt };
      
      if (isOnSpawnRow && newTarget.health <= 0) {
        const excessDamage = damageDealt - originalHealth;
        if (excessDamage > 0) {
          const opponent = newState.players[opponentIndex];
          const newOpponent = { ...opponent, health: opponent.health - excessDamage };
          newState.players = newState.players.map((p, idx) => idx === opponentIndex ? newOpponent : p);
          newState.log = [...newState.log, `Turn ${state.turn}: Excess damage of ${excessDamage} dealt to Player ${opponentIndex + 1}'s health!`];
        }
      }
      
      newState.log = [...newState.log, `Turn ${state.turn}: ${unit.name} attacks ${target.unit.name} at ${target.r},${target.c} for ${damageDealt} damage!`];
      
      if (newTarget.health <= 0) {
        newState.board[target.r][target.c] = null;
        newState.log = [...newState.log, `Turn ${state.turn}: ${target.unit.name} is defeated!`];
      } else {
        newState.board[target.r][target.c] = newTarget;
      }
    }
  });
  
  return newState;
};

// Pure win condition checker
export const checkWinCondition = (state) => {
  if (state.players[0].health <= 0) {
    return { gameOver: true, winner: 1, message: state.gameMode === 'ai' ? 'AI Wins!' : 'Player 2 Wins!' };
  }
  if (state.players[1].health <= 0) {
    return { gameOver: true, winner: 0, message: 'Player 1 Wins!' };
  }
  return null;
}; 