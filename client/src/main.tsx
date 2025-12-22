import { createRoot } from "react-dom/client";
import { AppMIS } from "./AppMIS";
import "./index.css";
// Initialize optional Laravel Echo (guarded initializer)
import "./lib/echo";

createRoot(document.getElementById("root")!).render(<AppMIS />);
