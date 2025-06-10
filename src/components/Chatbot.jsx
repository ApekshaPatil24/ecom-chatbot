//chatbot.jsx
// All import statements remain unchanged
import React, { useState, useEffect, useRef } from "react";
import { ShoppingCart, Trash2, RefreshCw, LogOut, SendHorizonal, PackageCheck } from "lucide-react";

// Subcategory logic remains unchanged
const subcategories = {
  Smartphone: ["All", "iPhone", "Samsung", "OnePlus", "Google Pixel", "Xiaomi"],
  Laptop: ["All", "MacBook", "Dell", "HP", "Lenovo", "Asus"],
  Headphones: ["All", "Bose", "Sony", "Beats", "Sennheiser", "JBL"],
  Tablet: ["All", "iPad", "Samsung Tab", "Amazon Fire", "Lenovo Tab", "Microsoft Surface"],
};
const API = process.env.REACT_APP_BACKEND_URL;

const allSubcategories = ["All", ...Object.keys(subcategories)];

export default function Chatbot({ userEmail, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const category = "electronics";
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
const inputRef = useRef(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);

  useEffect(() => {
    setSelectedType("All");
  }, [selectedSubcategory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "You are not logged in!", timestamp: new Date() },
      ]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API}/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          category,
          subcategory: selectedSubcategory === "All" ? null : selectedSubcategory,
          type: selectedType === "All" ? null : selectedType,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to get response");

      const botMsg = {
        sender: "bot",
        text: data.reply,
        products: data.products,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `Error: ${error.message}`, timestamp: new Date() },
      ]);
    }
    setLoading(false);
  };

  const handleReset = () => {
    if (messages.length === 0) return;
    const newChat = {
      id: Date.now().toString(),
      title: messages.find((m) => m.sender === "user")?.text.slice(0, 30) || "New Chat",
      messages: [...messages],
    };
    setChatHistory((prev) => [newChat, ...prev]);
    setMessages([]);
    setActiveChatId(newChat.id);
  };

  const loadChat = (id) => {
    const chat = chatHistory.find((c) => c.id === id);
    if (chat) {
      setMessages(chat.messages);
      setActiveChatId(id);
    }
  };

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: `"${product.name}" has been added to your cart.`,
        timestamp: new Date(),
      },
    ]);
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      alert("🛒 Your cart is empty.");
      return;
    }
    alert(`✅ Order placed successfully for ${cart.length} item(s).`);
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-[#FFF8DC]">
    <div className="flex h-screen max-w-8xl mx-auto bg-[#bbb] rounded-2xl shadow-lg border border-gray-200 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <header className="px-6 py-4 border-b border-gray-100 text-[#1b1f3b] font-semibold text-lg">
          Conversations
        </header>
        <div className="flex-grow overflow-y-auto">
          {chatHistory.length === 0 && (
            <p className="p-4 text-gray-400">No past conversations yet.</p>
          )}
          {chatHistory.map((chat) => (
            <button
              key={chat.id}
              onClick={() => loadChat(chat.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition
              ${chat.id === activeChatId ? "bg-blue-100 font-bold" : "font-normal"}`}
            >
              {chat.title.length > 30 ? chat.title.slice(0, 27) + "..." : chat.title}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setChatHistory([]);
            setMessages([]);
            setActiveChatId(null);
          }}
          className="m-4 px-3 py-2 bg-red-500 hover:bg-red-400 text-white rounded-md flex items-center justify-center gap-2"
        >
          <Trash2 size={16} /> Clear All History
        </button>
      </aside>

      {/* Main Chat */}
      <div className="flex flex-col flex-grow bg-white">
        <header className="bg-[#003366] text-white px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-wide flex items-center gap-2">
            🛍️ E-commerce Chatbot
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-[#6c5ce7] hover:bg-[#5a4dc6] text-white px-4 py-2 rounded-xl shadow-md transition"
            >
              <RefreshCw size={18} /> Reset
            </button>

            <button
              onClick={() => setShowCart(!showCart)}
              className="flex items-center gap-2 bg-[#fdcb6e] hover:bg-[#f3b750] text-black px-4 py-2 rounded-xl shadow-md transition"
            >
              <ShoppingCart size={18} /> View Cart ({cart.length})
            </button>

            <button
              onClick={handlePlaceOrder}
              className="flex items-center gap-2 bg-[#00b894] hover:bg-[#00a383] text-white px-4 py-2 rounded-xl shadow-md transition"
            >
              <PackageCheck size={18} /> Place Order
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-[#d63031] hover:bg-[#c0392b] text-white px-4 py-2 rounded-xl shadow-md transition"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </header>

        {showCart && (
          <div className="absolute top-20 right-10 bg-white border border-gray-200 shadow-lg rounded-lg w-80 max-h-96 overflow-y-auto z-50 p-4">
            <h3 className="text-lg font-semibold mb-2 text-[#1b1f3b]">🛒 Your Cart</h3>
            {cart.length === 0 ? (
              <p className="text-gray-500">Your cart is empty.</p>
            ) : (
              <ul className="space-y-3">
                {cart.map((item, index) => (
                  <li key={index} className="border-b pb-2">
                    <p className="font-medium text-[#2d3436]">{item.name}</p>
                    <p className="text-sm text-gray-500">₹{item.price}</p>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={() => setShowCart(false)}
              className="mt-3 w-full text-center bg-[#003366] hover:bg-[#00294d] text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        )}

        <main className="flex-grow px-6 py-4 overflow-y-auto bg-white">
          <div className="flex flex-wrap items-center gap-4 mb-6 border-b pb-4">
            <label className="font-medium text-gray-600">Category:</label>
            <select
              disabled
              className="border px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
            >
              <option>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
            </select>

            <label className="font-medium text-gray-600">Subcategory:</label>
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="border px-3 py-2 rounded-lg text-sm bg-white shadow-sm"
            >
              {allSubcategories.map((subcat) => (
                <option key={subcat} value={subcat}>
                  {subcat}
                </option>
              ))}
            </select>

            <label className="font-medium text-gray-600">Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border px-3 py-2 rounded-lg text-sm bg-white shadow-sm"
              disabled={selectedSubcategory === "All"}
            >
              {(selectedSubcategory !== "All"
                ? subcategories[selectedSubcategory]
                : ["All"]
              ).map((typ) => (
                <option key={typ} value={typ}>
                  {typ}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto mb-4 rounded-xl px-4 py-2 bg-[#f5f7fa]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[70%] rounded-lg p-3 shadow ${
                  msg.sender === "user"
                    ? "bg-[#003366] text-white self-end"
                    : "bg-[#e8f0fe] text-[#1b1f3b] self-start"
                }`}
              >
                <p className="whitespace-pre-wrap mb-2">{msg.text.split('\n')[0]}</p>

                {msg.products && Array.isArray(msg.products) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {msg.products.map((product, i) => (
                      <div key={i} className="bg-white border rounded-lg p-3 shadow-sm flex flex-col justify-between hover:shadow-md transition-transform transform hover:scale-[1.02]">
                        <h4 className="font-semibold text-indigo-700">{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.description || "No description available"}</p>
                        <p className="text-indigo-900 font-bold mt-1">₹{product.price || "N/A"}</p>
                        <button
                          onClick={() => addToCart(product)}
                          className="mt-2 bg-[#003366] hover:bg-[#00294d] text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                        >
                          <ShoppingCart size={14} /> Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <span className="block text-xs text-gray-400 mt-1 text-right">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-3 focus:ring-offset-1 focus:ring-indigo-400">
            <input
  ref={inputRef}
  type="text"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !loading) sendMessage();
  }}
  placeholder="Type your message..."
  className="flex-grow border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  disabled={loading}
/>

            <button
              onClick={sendMessage}
              disabled={loading}
              className={`px-5 py-2 rounded-lg text-white font-semibold flex items-center gap-2 transition ${
                loading ? "bg-blue-300 cursor-not-allowed" : "bg-[#003366] hover:bg-[#00294d]"
              }`}
            >
              <SendHorizonal size={16} />
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </main>
      </div>
    </div>
    </div>
  );
}
