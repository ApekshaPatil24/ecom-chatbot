// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chatpage from './pages/Chatpage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Chatpage />} /> {/* Add this */}
        <Route path="/chat" element={<Chatpage />} />
      </Routes>
    </Router>
  );
}


export default App;
