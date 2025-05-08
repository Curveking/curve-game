// DeckSelection component for choosing a deck/archetype and previewing cards
import React, { useState, useEffect } from 'react';
import { ARCHETYPES, generatePreviewDeck } from '../gameLogic/helpers';
import Card from './Card';
import CardModal from './CardModal';

const DeckSelection = ({ onSelectDeck, onBack }) => {
  const [selectedArchetype, setSelectedArchetype] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [previewDecks, setPreviewDecks] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    // Generate preview decks for all archetypes
    const decks = {};
    Object.keys(ARCHETYPES).forEach(archetypeKey => {
      decks[archetypeKey] = generatePreviewDeck(archetypeKey);
    });
    setPreviewDecks(decks);
  }, []);

  const handleConfirmSelection = () => {
    if (selectedArchetype) {
      onSelectDeck(selectedArchetype);
    }
  };

  // Render deck preview
  const renderDeckPreview = (archetypeKey) => {
    const deck = previewDecks[archetypeKey];
    if (!deck) return null;
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-3">Deck Cards (15)</h3>
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-5 gap-4' : 'space-y-2'}`}>
            {deck.map(card => (
              viewMode === 'grid' ? (
                <Card 
                  key={card.id} 
                  card={card} 
                  archetype={archetypeKey}
                  onClick={setExpandedCard}
                />
              ) : (
                <div 
                  key={card.id} 
                  className={`bg-gray-800 p-3 rounded-lg flex items-center justify-between hover:bg-gray-700 cursor-pointer ${card.hasTaunt ? 'border-l-4 border-yellow-400' : ''}`}
                  onClick={() => setExpandedCard(card)}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-700 w-8 h-8 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{card.cost}</span>
                    </div>
                    <span className="text-white font-bold">{card.name}</span>
                    {card.hasTaunt && (
                      <div className="flex items-center gap-1 text-yellow-400" title="Taunt: Enemies must attack this unit first">
                        <span>🛡️</span>
                        <span className="text-sm">Taunt</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-red-400">⚔️ {card.attack}</span>
                    <span className="text-green-400">❤️ {card.health}</span>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Choose Your Deck</h1>
          <button
            onClick={onBack}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
          >
            Back to Menu
          </button>
        </div>
        {/* Archetype selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(ARCHETYPES).map(([key, archetype]) => (
            <div
              key={key}
              onClick={() => setSelectedArchetype(key)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 
                ${selectedArchetype === key 
                  ? `${archetype.color} border-yellow-400 shadow-lg shadow-yellow-400/30` 
                  : `${archetype.color} border-gray-600 hover:border-gray-400`}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{archetype.icon}</span>
                <h3 className="text-2xl font-bold">{archetype.name}</h3>
              </div>
              <p className="text-gray-300">{archetype.description}</p>
            </div>
          ))}
        </div>
        {/* Deck preview section */}
        {selectedArchetype && (
          <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">
                {ARCHETYPES[selectedArchetype].name} Deck Preview
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                  >
                    List
                  </button>
                </div>
                <button
                  onClick={handleConfirmSelection}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-bold"
                >
                  Confirm Selection
                </button>
              </div>
            </div>
            {renderDeckPreview(selectedArchetype)}
          </div>
        )}
        {/* Expanded card modal */}
        {expandedCard && (
          <CardModal card={expandedCard} onClose={() => setExpandedCard(null)} />
        )}
      </div>
    </div>
  );
};

export default DeckSelection; 