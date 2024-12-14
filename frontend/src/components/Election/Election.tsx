import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './Election.css';

interface Candidate {
  id: number;
  name: string;
  party: string;
  icon: string;
  proposals: string[];
  votes: number;
}

const candidatesInitial: Candidate[] = [
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
    votes: 0,
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
    votes: 0,
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
    votes: 0,
  },
];

export const Election: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null,
  );
  const [isActive, setIsActive] = useState(true); // Estado para habilitar o deshabilitar la votación
  const [candidates, setCandidates] = useState<Candidate[]>(candidatesInitial);
  const [showForm, setShowForm] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    party: '',
    proposals: [''],
  });
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  const getVotePercentage = (votes: number, totalVotes: number): string => {
    if (totalVotes === 0) return '0%';
    return `${((votes / totalVotes) * 100).toFixed(1)}%`;
  };

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
        setIsActive(false); // Finaliza la votación
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

  const handleVote = () => {
    if (selectedCandidate !== null && !hasVoted) {
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === selectedCandidate
            ? { ...candidate, votes: candidate.votes + 1 }
            : candidate,
        ),
      );
      setSelectedCandidate(null);
      setHasVoted(true);
    }
  };

  const finalizeVoting = () => {
    setIsActive(false);
    alert('Voting has been finalized!');
  };

  const resetElection = () => {
    setCandidates([]);
    setNewCandidate({ name: '', party: '', proposals: [''] });
    setShowForm(true);
    setIsActive(false);
    setHasVoted(false);
  };

  const startElection = () => {
    if (candidates.length > 0) {
      setIsActive(true);
      setShowForm(false);
      alert('Election has started!');
    } else {
      alert('Please add at least one candidate to start the election!');
    }
  };

  const handleNewCandidateChange = (
    field: string,
    value: string | string[],
  ) => {
    setNewCandidate((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addProposal = () => {
    setNewCandidate((prev) => ({
      ...prev,
      proposals: [...prev.proposals, ''],
    }));
  };

  const createNewCandidate = () => {
    if (newCandidate.name && newCandidate.party) {
      setCandidates((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          name: newCandidate.name,
          party: newCandidate.party,
          icon: '🆕',
          proposals: newCandidate.proposals.filter((p) => p.trim() !== ''),
          votes: 0,
        },
      ]);
      setNewCandidate({ name: '', party: '', proposals: [''] }); // Limpiar formulario para agregar otro candidato
      alert('New candidate has been added!');
    } else {
      alert('Please fill in all required fields!');
    }
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
          {isActive ? formatTime(timeLeft) : 'Voting Closed'}
        </p>
      </motion.div>
      {hasVoted && (
        <motion.div
          className="vote-message"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p>You have voted! 🎉</p>
        </motion.div>
      )}

      {isActive ? (
        <motion.div
          className="vote-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {!hasVoted && <h2 className="vote-title">Select Your Candidate</h2>}
          <motion.ul
            className="candidate-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {candidates.map((candidate) => (
              <motion.li
                key={candidate.id}
                className={`candidate ${
                  selectedCandidate === candidate.id ? 'selected' : ''
                } ${hasVoted ? 'disabled-candidate' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCandidate(candidate.id)}
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
      ) : (
        <motion.div
          className="results-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2>Election Results</h2>
          <ul className="results-list">
            {candidates.map((candidate) => {
              const totalVotes = candidates.reduce(
                (sum, c) => sum + c.votes,
                0,
              );
              return (
                <li key={candidate.id} className="result-item">
                  {candidate.icon} {candidate.name} ({candidate.party}):{' '}
                  {candidate.votes} votes (
                  {getVotePercentage(candidate.votes, totalVotes)})
                </li>
              );
            })}
          </ul>
          <button onClick={resetElection}>Reset Election</button>
        </motion.div>
      )}

      {isActive && (
        <motion.div
          className="buttons-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <button
            className={`vote-button ${selectedCandidate !== null && !hasVoted ? '' : 'disabled'}`}
            onClick={handleVote}
            disabled={selectedCandidate === null || hasVoted}
          >
            Vote
          </button>

          <button className="finalize-button" onClick={finalizeVoting}>
            Finalize Voting
          </button>
        </motion.div>
      )}

      {showForm && (
        <motion.div
          className="new-candidate-form"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="form-title">Add a New Candidate</h2>
          <div className="form-group">
            <label htmlFor="candidate-name">Candidate Name:</label>
            <input
              id="candidate-name"
              type="text"
              placeholder="Enter candidate's name"
              value={newCandidate.name}
              onChange={(e) => handleNewCandidateChange('name', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="party-name">Party Name:</label>
            <input
              id="party-name"
              type="text"
              placeholder="Enter party name"
              value={newCandidate.party}
              onChange={(e) =>
                handleNewCandidateChange('party', e.target.value)
              }
              className="form-input"
            />
          </div>
          <div className="form-group proposals-group">
            <label>Proposals:</label>
            {newCandidate.proposals.map((proposal, index) => (
              <div key={index} className="proposal-input-wrapper">
                <input
                  type="text"
                  placeholder={`Proposal ${index + 1}`}
                  value={proposal}
                  onChange={(e) => {
                    const updatedProposals = [...newCandidate.proposals];
                    updatedProposals[index] = e.target.value;
                    handleNewCandidateChange('proposals', updatedProposals);
                  }}
                  className="form-input proposal-input"
                />
              </div>
            ))}
            <button className="add-proposal-button" onClick={addProposal}>
              + Add Proposal
            </button>
          </div>
          <div className="form-buttons">
            <button className="form-submit-button" onClick={createNewCandidate}>
              Add Candidate
            </button>
            <button
              className="form-start-election-button"
              onClick={startElection}
              disabled={candidates.length <= 1}
            >
              Start Election
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
