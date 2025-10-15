import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
        WinnerPrice
      </h1>
      <p className="text-gray-600 text-lg mt-2">The closest bid to the secret price wins the prize. Pay an entry fee to place your bid.</p>
    </header>
  );
};

export default Header;