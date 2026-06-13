import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CardSortGame = ({
  gameData,
  onComplete,
  isCompleted,
  score,
  onPlayAgain
}) => {
  const [availableCards, setAvailableCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [placements, setPlacements] = useState({});
  const [gameComplete, setGameComplete] = useState(false);
  const [gameScore, setGameScore] = useState(0);

  useEffect(() => {
    if (!gameData) return;

    setAvailableCards([...gameData.cards]);

    const initialPlacements = {};

    gameData.categories.forEach(category => {
      initialPlacements[category] = [];
    });

    setPlacements(initialPlacements);

    setSelectedCard(null);
    setGameComplete(false);
    setGameScore(0);
  }, [gameData]);

  const handleCardSelect = (card) => {
    setSelectedCard(card);
  };

  const handleCategoryClick = (category) => {
    if (!selectedCard) return;

    const updatedPlacements = {
      ...placements,
      [category]: [...placements[category], selectedCard]
    };

    setPlacements(updatedPlacements);

    setAvailableCards(
      availableCards.filter(
        card => card.text !== selectedCard.text
      )
    );

    setSelectedCard(null);
  };

  const handleSubmit = () => {
    let correct = 0;
    let total = 0;

    Object.keys(placements).forEach(category => {
      placements[category].forEach(card => {
        total++;

        if (card.category === category) {
          correct++;
        }
      });
    });

    const finalScore = total === 0 ? 0 : Math.round((correct / total) * 100);

    setGameScore(finalScore);
    setGameComplete(true);

    if (onComplete) {
      onComplete(finalScore);
    }
  };

  const resetGame = () => {
    if (!gameData) return;

    setAvailableCards([...gameData.cards]);

    const initialPlacements = {};

    gameData.categories.forEach(category => {
      initialPlacements[category] = [];
    });

    setPlacements(initialPlacements);

    setSelectedCard(null);
    setGameComplete(false);
    setGameScore(0);

    if (onPlayAgain) {
      onPlayAgain();
    }
  };

  if (!gameData) {
    return (
      <div className="text-center text-white">
        Loading...
      </div>
    );
  }

  if (gameComplete) {
    return (
      <div className="bg-dark-200 rounded-lg p-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Challenge Complete!
        </h2>

        <div className="text-5xl font-bold text-primary-400 mb-4">
          {gameScore}%
        </div>

        <p className="text-gray-300 mb-6">
          You correctly classified constitutional articles.
        </p>

        <button
          onClick={resetGame}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg"
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="bg-dark-200 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4">
          Available Cards
        </h2>
        <p className="text-gray-400 mb-3">
          Select a card and then click a category.
        </p>
        <div className="flex flex-wrap gap-3">
          {availableCards.map(card => (
            <motion.button
              key={card.text}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardSelect(card)}
              className={`px-4 py-2 rounded-lg border text-white ${selectedCard?.text === card.text
                  ? 'bg-primary-600 border-primary-400'
                  : 'bg-dark-300 border-gray-700'
                }`}
            >
              {card.text}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {gameData.categories.map(category => (
          <motion.div
            key={category}
            whileHover={{ scale: 1.01 }}
            onClick={() => handleCategoryClick(category)}
            className="bg-dark-200 rounded-lg p-4 cursor-pointer border border-gray-700"
          >
            <h3 className="text-primary-400 font-bold mb-3">
              {category}
            </h3>

            <div className="space-y-2 min-h-[80px]">
              {placements[category]?.map(card => (
                <div
                  key={card.text}
                  className="bg-dark-300 text-white p-2 rounded"
                >
                  {card.text}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <button
          disabled={availableCards.length > 0}
          onClick={handleSubmit}
          className={`px-6 py-3 rounded-lg text-white ${availableCards.length > 0
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-green-600'
            }`}
        >
          Submit Answers
        </button>
      </div>
    </div>
  );
};

export default CardSortGame;