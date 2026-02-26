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

interface CoinData {
  date: string;
  price: number;
}

interface Holdings {
  [coin: string]: number;
}

const COINS = [
  { name: "bitcoin", label: "Bitcoin", img: "/images/bitcoin.png" },
  { name: "ethereum", label: "Ethereum", img: "/images/ethereum.png" },
  { name: "solana", label: "Solana", img: "/images/solana.png" },
];

export default function App() {
  const [data, setData] = useState<Record<string, CoinData[]>>({});
  const [selectedCoins, setSelectedCoins] = useState(["bitcoin"]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [percentage, setPercentage] = useState("");
  const [holdings, setHoldings] = useState<Holdings>({
    bitcoin: 0,
    ethereum: 0,
    solana: 0,
  });

  const fetchCrypto = async () => {
    try {
      setLoading(true);
      setError("");
      setSummary("");
      setPercentage("");

      const fetchedData: Record<string, CoinData[]> = {};

      for (const coin of selectedCoins) {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/crypto/${coin}?days=${days}`
        );
        fetchedData[coin] = response.data;

        // Calculate percentage change for summary
        const prices = response.data.map((item: any) => item.price);
        if (prices.length > 1) {
          const first = prices[0];
          const last = prices[prices.length - 1];
          const change = ((last - first) / first) * 100;
          const formatted = change.toFixed(2);

          if (change > 0) setPercentage(`↑ +${formatted}%`);
          else if (change < 0) setPercentage(`↓ ${formatted}%`);
          else setPercentage("0%");

          if (last > first) {
            setSummary(
              `${coin.toUpperCase()} shows bullish momentum over the last ${days} days.`
            );
          } else if (last < first) {
            setSummary(
              `${coin.toUpperCase()} shows bearish pressure over the last ${days} days.`
            );
          } else {
            setSummary(
              `${coin.toUpperCase()} is moving sideways over the last ${days} days.`
            );
          }
        }
      }

      setData(fetchedData);
    } catch (err) {
      setError("⚠️ Failed to load crypto data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrypto();
  }, [selectedCoins, days]);

  // Compute portfolio value
  const totalPortfolioValue = Object.entries(holdings).reduce(
    (sum, [coin, amount]) => {
      const coinPrice = data[coin]?.[data[coin].length - 1]?.price || 0;
      return sum + coinPrice * amount;
    },
    0
  );

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
        {selectedCoins.length > 1
          ? "Multi-Coin Comparison"
          : `${selectedCoins[0].toUpperCase()} ${days}-Day Trend`}
      </h1>

      {/* Percentage & Summary */}
      {percentage && <p style={{ fontSize: 18, fontWeight: "bold" }}>{percentage}</p>}
      {summary && <p>{summary}</p>}

      {/* Time Toggle Buttons */}
      <div style={{ marginBottom: 20 }}>
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            style={{
              marginRight: 10,
              padding: "8px 16px",
              borderRadius: 6,
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

      {/* Coin Selector */}
      <div style={{ display: "flex", gap: "10px", marginBottom: 20 }}>
        {COINS.map((c) => (
          <label
            key={c.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              cursor: "pointer",
              background: selectedCoins.includes(c.name) ? "#3b82f6" : "#1e293b",
              padding: "5px 10px",
              borderRadius: 6,
            }}
          >
            <input
              type="checkbox"
              checked={selectedCoins.includes(c.name)}
              onChange={() =>
                setSelectedCoins((prev) =>
                  prev.includes(c.name)
                    ? prev.filter((coin) => coin !== c.name)
                    : [...prev, c.name]
                )
              }
            />
            <img src={c.img} alt={c.label} width={24} height={24} />
            {c.label}
          </label>
        ))}
      </div>

      {/* Portfolio Tracker */}
      <div style={{ marginBottom: 20 }}>
        <h2>Portfolio Tracker</h2>
        {COINS.map((c) => (
          <div key={c.name} style={{ marginBottom: 8 }}>
            <label>
              {c.label} Holdings:
              <input
                type="number"
                value={holdings[c.name]}
                onChange={(e) =>
                  setHoldings({ ...holdings, [c.name]: parseFloat(e.target.value) })
                }
                style={{
                  marginLeft: 10,
                  padding: 4,
                  borderRadius: 4,
                  border: "none",
                  width: 100,
                }}
              />
            </label>
          </div>
        ))}
        <p>Total Portfolio Value: ${totalPortfolioValue.toFixed(2)}</p>
      </div>

      {/* Loading & Error */}
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {/* Charts */}
      {!loading && !error && selectedCoins.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              stroke="#ffffff"
              type="category"
              domain={["dataMin", "dataMax"]}
            />
            <YAxis stroke="#ffffff" />
            <Tooltip />
            {selectedCoins.map((coin) => (
              <Line
                key={coin}
                type="monotone"
                data={data[coin]}
                dataKey="price"
                name={coin.toUpperCase()}
                stroke={
                  coin === "bitcoin"
                    ? "#f59e0b"
                    : coin === "ethereum"
                    ? "#3b82f6"
                    : "#14b8a6"
                }
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}