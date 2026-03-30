import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Ensure light mode only — remove any stale dark class
document.documentElement.classList.remove("dark");

createRoot(document.getElementById("root")!).render(<App />);
