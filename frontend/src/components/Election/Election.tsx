import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './Election.css';

interface Candidate {
  id: number;
  name: string;
  party: string;
  icon: string;
  proposals: string[];
}

const candidates: Candidate[] = [
  {
    id: 1,
    name: 'Candidate A',
    party: 'Party X',
    icon: '👩‍💼',
    proposals: [
      'Reduce taxes by 15%',
      'Promote green energy initiatives',
      'Expand education access for all',
    ],
  },
  {
    id: 2,
    name: 'Candidate B',
    party: 'Party Y',
    icon: '👨‍💼',
    proposals: [
      'Increase healthcare funding',
      'Boost small business loans',
      'Develop advanced public transportation',
    ],
  },
  {
    id: 3,
    name: 'Candidate C',
    party: 'Party Z',
    icon: '🧑‍⚖️',
    proposals: [
      'Ensure cybersecurity for all',
      'Increase AI research funding',
      'Expand digital literacy programs',
    ],
  },
];

export const Election: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [votedFor, setVotedFor] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false); // Estado para el botón

  useEffect(() => {
    const electionEndTime = new Date('2024-12-15T23:59:59').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = Math.max(
        0,
        Math.floor((electionEndTime - now) / 1000),
      );
      setTimeLeft(difference);

      if (difference <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const handleVote = (candidateId: number) => {
    setVotedFor(candidateId);
    setIsActive(true); // Habilitar el botón al votar
  };

  const finalizeVoting = () => {
    alert('Voting has been finalized!'); // Acción al finalizar
  };

  return (
    <motion.div
      className="election-container"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="election-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="election-title">Election Countdown</h1>
        <p className="countdown">
          {timeLeft > 0 ? formatTime(timeLeft) : 'Voting Closed'}
        </p>
      </motion.div>

      <motion.div
        className="vote-section"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="vote-title">Vote for Your Candidate</h2>
        <motion.ul
          className="candidate-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {candidates.map((candidate) => (
            <motion.li
              key={candidate.id}
              className={`candidate ${votedFor === candidate.id ? 'voted' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleVote(candidate.id)}
            >
              <div className="candidate-header">
                <span className="candidate-icon">{candidate.icon}</span>
                <div className="candidate-info">
                  <span className="candidate-name">{candidate.name}</span>
                  <span className="candidate-party">{candidate.party}</span>
                </div>
              </div>
              <ul className="candidate-proposals">
                {candidate.proposals.map((proposal, index) => (
                  <li key={index}>{proposal}</li>
                ))}
              </ul>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>

      {/* Finalize Voting Button */}
      <motion.div
        className="finalize-section"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <button
          className={`finalize-button ${isActive ? '' : 'disabled'}`}
          onClick={finalizeVoting}
          disabled={!isActive} // Botón deshabilitado si no está activo
        >
          Finalize Voting
        </button>
      </motion.div>

      {votedFor && (
        <motion.div
          className="vote-confirmation"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p>
            You voted for{' '}
            <strong>{candidates.find((c) => c.id === votedFor)?.name}</strong>.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};
