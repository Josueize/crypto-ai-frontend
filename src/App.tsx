import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function App() {
  const [data, setData] = useState<any[]>([]);
  const [coin, setCoin] = useState("bitcoin");
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [percentage, setPercentage] = useState("");

  const BASE_URL = import.meta.env.VITE_API_URL;

  const fetchCrypto = async () => {
    try {
      setLoading(true);
      setError("");
      setSummary("");
      setPercentage("");

      const response = await axios.get(
        `${BASE_URL}/api/crypto/${coin}?days=${days}`
      );

      setData(response.data);

      const prices = response.data.map((item: any) => item.price);

      if (prices.length > 1) {
        const first = prices[0];
        const last = prices[prices.length - 1];

        const change = ((last - first) / first) * 100;
        const formatted = change.toFixed(2);

        if (change > 0) {
          setPercentage(`↑ +${formatted}%`);
        } else if (change < 0) {
          setPercentage(`↓ ${formatted}%`);
        } else {
          setPercentage("0%");
        }

        if (last > first) {
          setSummary(
            `${coin.toUpperCase()} shows bullish momentum over the selected ${days} days.`
          );
        } else if (last < first) {
          setSummary(
            `${coin.toUpperCase()} shows bearish pressure over the selected ${days} days.`
          );
        } else {
          setSummary(
            `${coin.toUpperCase()} is moving sideways over the selected ${days} days.`
          );
        }
      }
    } catch (err) {
      console.error(err);
      setError("⚠️ Failed to load crypto data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrypto();
  }, [coin, days]);

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial",
        backgroundColor: "#0f172a",
        minHeight: "100vh",
        color: "#ffffff",
      }}
    >
      <h1 style={{ marginBottom: "10px" }}>
        {coin.toUpperCase()} {days}-Day Trend
      </h1>

      {percentage && (
        <p style={{ fontSize: "18px", fontWeight: "bold" }}>
          {percentage}
        </p>
      )}

      <div style={{ marginBottom: "20px" }}>
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            style={{
              marginRight: "10px",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              backgroundColor: days === d ? "#3b82f6" : "#1e293b",
              color: "#ffffff",
            }}
          >
            {d}D
          </button>
        ))}
      </div>

      <select
        value={coin}
        onChange={(e) => setCoin(e.target.value)}
        style={{
          marginBottom: "20px",
          padding: "8px",
          borderRadius: "6px",
          border: "none",
        }}
      >
        <option value="bitcoin">Bitcoin</option>
        <option value="ethereum">Ethereum</option>
        <option value="solana">Solana</option>
      </select>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#ffffff" />
            <YAxis stroke="#ffffff" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {summary && !loading && !error && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#1e293b",
            borderRadius: "8px",
          }}
        >
          🤖 AI Insight: {summary}
        </div>
      )}
    </div>
  );
}