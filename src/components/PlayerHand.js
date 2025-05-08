// PlayerHand component for displaying a player's hand of cards
import React from 'react';
import Card from './Card';

const PlayerHand = React.memo(({ player, currentPlayer, onCardSelect, gameMode, selectedCard, isProcessingAI }) => {
  const isAITurn = gameMode === 'ai' && currentPlayer === 1;
  return (
    <div className="mb-4">
      <h3 className="text-lg mb-2">
        {isAITurn ? 'AI\'s Hand:' : 'Your Hand:'}
      </h3>
      <div className="flex gap-2">
        {player.hand.map(card => (
          <Card
            key={card.id}
            card={card}
            selected={selectedCard?.id === card.id}
            onClick={onCardSelect}
            disabled={isAITurn || isProcessingAI || card.cost > player.mana}
          />
        ))}
      </div>
    </div>
  );
});

export default PlayerHand; 