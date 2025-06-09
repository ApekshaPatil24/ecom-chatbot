// pages/Chatpage.jsx
import React, { useState } from "react";
import Login from "../components/Login";
import Chatbot from "../components/Chatbot";

const Chatpage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <div>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Chatbot onLogout={handleLogout} />
      )}
    </div>
  );
};

export default Chatpage;
