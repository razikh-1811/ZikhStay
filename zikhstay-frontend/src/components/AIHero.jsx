import { useState } from "react";
import "./AIHero.css";

export default function AIHero({ onSearch }) {
  const [input, setInput] = useState("");
  const [dates, setDates] = useState({ checkIn: "", checkOut: "" });

  return (
    <div className="ai-hero">
      <div className="hero-overlay">
        <h1>Where to next, traveler?</h1>
        <p>Ask ZikhAI: "Beachfront hotels under Rs 4000"</p>
        <div className="search-bar-ai">
        
          <input
            type="text"
            placeholder="Type your requirements here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={() => onSearch(input, dates)}>Ask ZikhAI</button>
        </div>
      </div>
    </div>
  );
}
