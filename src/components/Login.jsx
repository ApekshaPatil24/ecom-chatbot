import React, { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { MdPerson, MdWork } from "react-icons/md";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(true);
const API = process.env.REACT_APP_BACKEND_URL;

  // Images for the left side slider
  const images = ["i1.jpg", "i2.jpg", "i3.jpg","i4.jpg"]; // Add your image filenames here
  const [currentImage, setCurrentImage] = useState(0);

  // Change image every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isRegistering ? "register" : "login";

    try {
      const res = await fetch(`${API}/${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token || "dummy-token");
        setError("");
        onLogin();
      } else {
        setError(data.error || "Something went wrong");
        if (data.error === "Email not found. Please register first.") {
          setTimeout(() => setIsRegistering(true), 1000);
        }
      }
    } catch {
      setError("Network error, please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 font-lora">
      <div className="flex w-full max-w-5xl shadow-lg bg-white rounded-2xl overflow-hidden">
        {/* Left Side - Auto Image Slider */}
<div className="w-1/2 bg-yellow-400 flex items-center justify-center p-8 relative overflow-hidden">
  <div className="relative w-full h-full flex items-center justify-center">
    {images.map((img, index) => (
      <img
        key={index}
        src={img}
        alt={`Slide ${index}`}
        className={`absolute w-900 h-90 object-contain rounded-xl shadow-md transition-opacity duration-1000 ease-in-out ${
          index === currentImage ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDelay: "200ms" }}
      />
    ))}
  </div>
  <div className="absolute bottom-8 text-center">
    <h2 className="text-white text-2xl font-bold mb-1">Buy Now</h2>
    <p className="text-white text-sm">from our BuyBuddy</p>
  </div>
</div>

        {/* Right Side - Form */}
        <div className="w-1/2 bg-white p-10">
          <h2 className="text-4xl font-bold mb-2">Welcome to BuyBuddy</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your personal shopping assistant — discover products, track orders, and get support instantly.
          </p>

          {/* Role Selection Cards */}
          <div className="flex gap-4 mb-6">
            {/* Candidate Option */}
            <div
              onClick={() => setIsRegistering(true)}
              className={`flex-1 flex items-center justify-between border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                isRegistering
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-gray-200 hover:border-yellow-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <MdPerson className="text-5xl text-yellow-600" />
                <div>
                  <div className="font-semibold">Sign up For Remember</div>
                  <div className="text-sm text-gray-600">
                    Browse, chat, and buy smarter with BuyBuddy
                  </div>
                </div>
              </div>
              {isRegistering && <FaCheckCircle className="text-3xl text-green-500" />}
            </div>

            {/* Recruiter Option */}
            <div
              onClick={() => setIsRegistering(false)}
              className={`flex-1 flex items-center justify-between border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                !isRegistering
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <MdWork className="text-5xl text-blue-600" />
                <div>
                  <div className="font-semibold">Sign in For Shop smarter</div>
                  <div className="text-sm text-gray-600">
                    Experience the future of shopping with your intelligent assistant.
                  </div>
                </div>
              </div>
              {!isRegistering && <FaCheckCircle className="text-3xl text-green-500" />}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder={isRegistering ? "Create a password" : "Enter your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition duration-300"
            >
              {loading ? "Processing..." : isRegistering ? "Register" : "Login"}
            </button>
          </form>
          {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
}
