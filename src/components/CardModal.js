// CardModal component for displaying detailed card/unit info in a modal
import React from 'react';
import { ARCHETYPES } from '../gameLogic/helpers';

const CardModal = React.memo(({ card, onClose }) => {
  const archetype = ARCHETYPES[card.type];
  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 border-2 border-gray-600 rounded-xl p-6 max-w-md w-full mx-4 transform transition-all duration-200 scale-95 hover:scale-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{card.name}</h2>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-lg">{archetype.icon}</span>
              <span>{archetype.name}</span>
              {card.hasTaunt && (
                <span className="text-lg ml-2" title="Taunt: Enemies must attack this unit first">🛡️</span>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl font-bold"
          >
            ×
          </button>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-gray-400 text-sm">Cost</div>
            <div className="text-white text-xl font-bold">{card.cost}</div>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-gray-400 text-sm">Type</div>
            <div className="text-white text-xl font-bold">{archetype.name}</div>
          </div>
          <div className="bg-red-700/50 p-3 rounded-lg">
            <div className="text-gray-400 text-sm">Attack</div>
            <div className="text-white text-xl font-bold">{card.attack}</div>
          </div>
          <div className="bg-green-700/50 p-3 rounded-lg">
            <div className="text-gray-400 text-sm">Health</div>
            <div className="text-white text-xl font-bold">{card.health}</div>
          </div>
        </div>
        {/* Description */}
        <div className="bg-gray-700/30 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-2">Description</div>
          <div className="text-white">{card.description}</div>
        </div>
      </div>
    </div>
  );
});

export default CardModal; 