// Import React dependencies
import React from 'react';
import ReactDOM from 'react-dom';

// Import our main component
import ChainHomeStation from './src/ChainHomeStation.js';

// Create and mount component when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('chain-home-radar');
  if (container) {
    ReactDOM.createRoot(container).render(React.createElement(ChainHomeStation));
  }
});
