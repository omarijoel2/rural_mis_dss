// server/index.ts
import express2 from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

// server/routes.ts
import { createServer } from "http";
async function registerRoutes(app2) {
  app2.get("/api/hydromet/aquifers", (req, res) => {
    res.json({
      data: [
        { id: 1, name: "Elwak Aquifer", safeYieldMcm: 15, currentYieldMcm: 12, rechargeRateMcm: 3, riskLevel: "medium", waterQualityStatus: "Good", areaKm2: 5e3 },
        { id: 2, name: "Merti Aquifer", safeYieldMcm: 20, currentYieldMcm: 18, rechargeRateMcm: 4, riskLevel: "low", waterQualityStatus: "Excellent", areaKm2: 8e3 },
        { id: 3, name: "Neogene Aquifer", safeYieldMcm: 10, currentYieldMcm: 9, rechargeRateMcm: 2, riskLevel: "high", waterQualityStatus: "Fair", areaKm2: 3e3 }
      ]
    });
  });
  app2.post("/api/hydromet/aquifers", (req, res) => {
    res.json({ id: 4, message: "Aquifer registered", ...req.body });
  });
  app2.get("/api/core-ops/droughts", (req, res) => {
    res.json({
      data: [
        { id: 1, name: "2025 ASAL Drought - Jan-Mar", status: "active", severity: "high", startDate: "2025-01-01", affectedPopulation: 125e3, activatedBoreholes: 8, waterRationing: true },
        { id: 2, name: "2024 Oct-Dec Drought", status: "resolved", severity: "medium", startDate: "2024-10-01", endDate: "2024-12-15", affectedPopulation: 85e3, activatedBoreholes: 5, waterRationing: false }
      ]
    });
  });
  app2.post("/api/core-ops/droughts", (req, res) => {
    res.json({ id: 3, status: "declared", message: "Drought event declared", ...req.body });
  });
  app2.post("/api/core-ops/droughts/:id/activate", (req, res) => {
    res.json({ id: req.params.id, status: "active", message: "Emergency response activated" });
  });
  app2.get("/api/me/gender-equity", (req, res) => {
    res.json({
      data: [
        { id: 1, gender: "female", count: 450, accessHours: 12, collectionTime: 45, satisfaction: 65 },
        { id: 2, gender: "male", count: 320, accessHours: 15, collectionTime: 15, satisfaction: 78 },
        { id: 3, gender: "youth", count: 280, accessHours: 14, collectionTime: 25, satisfaction: 72 },
        { id: 4, gender: "elderly", count: 95, accessHours: 10, collectionTime: 60, satisfaction: 58 }
      ]
    });
  });
  app2.get("/api/training/assessments", (req, res) => {
    res.json({
      data: [
        { id: 1, operatorId: "OP-001", operatorName: "James Kipchoge", topic: "operation", score: 85, maxScore: 100, status: "completed", certificationValid: true, validUntil: "2026-01-15" },
        { id: 2, operatorId: "OP-002", operatorName: "Mary Nairobi", topic: "maintenance", score: 92, maxScore: 100, status: "completed", certificationValid: true, validUntil: "2026-06-10" },
        { id: 3, operatorId: "OP-003", operatorName: "Peter Mwangi", topic: "safety", score: 78, maxScore: 100, status: "completed", certificationValid: false, validUntil: null }
      ]
    });
  });
  app2.post("/api/training/assessments", (req, res) => {
    res.json({ id: 4, status: "pending", message: "Assessment recorded", ...req.body });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
import glsl from "vite-plugin-glsl";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    glsl()
    // Add GLSL shader support
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  // Add support for large models and audio files
  assetsInclude: ["**/*.gltf", "**/*.glb", "**/*.mp3", "**/*.ogg", "**/*.wav"]
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.get("/api/hydromet/aquifers", (req, res) => {
  res.json({ data: [
    { id: 1, name: "Elwak Aquifer", safeYieldMcm: 15, currentYieldMcm: 12, rechargeRateMcm: 3, riskLevel: "medium", waterQualityStatus: "Good", areaKm2: 5e3 },
    { id: 2, name: "Merti Aquifer", safeYieldMcm: 20, currentYieldMcm: 18, rechargeRateMcm: 4, riskLevel: "low", waterQualityStatus: "Excellent", areaKm2: 8e3 },
    { id: 3, name: "Neogene Aquifer", safeYieldMcm: 10, currentYieldMcm: 9, rechargeRateMcm: 2, riskLevel: "high", waterQualityStatus: "Fair", areaKm2: 3e3 }
  ] });
});
app.post("/api/hydromet/aquifers", (req, res) => {
  res.json({ id: 4, message: "Aquifer registered", ...req.body });
});
app.get("/api/core-ops/droughts", (req, res) => {
  res.json({ data: [
    { id: 1, name: "2025 ASAL Drought - Jan-Mar", status: "active", severity: "high", startDate: "2025-01-01", affectedPopulation: 125e3, activatedBoreholes: 8, waterRationing: true },
    { id: 2, name: "2024 Oct-Dec Drought", status: "resolved", severity: "medium", startDate: "2024-10-01", endDate: "2024-12-15", affectedPopulation: 85e3, activatedBoreholes: 5, waterRationing: false }
  ] });
});
app.post("/api/core-ops/droughts", (req, res) => {
  res.json({ id: 3, status: "declared", message: "Drought event declared", ...req.body });
});
app.post("/api/core-ops/droughts/:id/activate", (req, res) => {
  res.json({ id: req.params.id, status: "active", message: "Emergency response activated" });
});
app.get("/api/me/gender-equity", (req, res) => {
  res.json({ data: [
    { id: 1, gender: "female", count: 450, accessHours: 12, collectionTime: 45, satisfaction: 65 },
    { id: 2, gender: "male", count: 320, accessHours: 15, collectionTime: 15, satisfaction: 78 },
    { id: 3, gender: "youth", count: 280, accessHours: 14, collectionTime: 25, satisfaction: 72 },
    { id: 4, gender: "elderly", count: 95, accessHours: 10, collectionTime: 60, satisfaction: 58 }
  ] });
});
app.get("/api/training/assessments", (req, res) => {
  res.json({ data: [
    { id: 1, operatorId: "OP-001", operatorName: "James Kipchoge", topic: "operation", score: 85, maxScore: 100, status: "completed", certificationValid: true, validUntil: "2026-01-15" },
    { id: 2, operatorId: "OP-002", operatorName: "Mary Nairobi", topic: "maintenance", score: 92, maxScore: 100, status: "completed", certificationValid: true, validUntil: "2026-06-10" },
    { id: 3, operatorId: "OP-003", operatorName: "Peter Mwangi", topic: "safety", score: 78, maxScore: 100, status: "completed", certificationValid: false, validUntil: null }
  ] });
});
app.post("/api/training/assessments", (req, res) => {
  res.json({ id: 4, status: "pending", message: "Assessment recorded", ...req.body });
});
app.use("/api", createProxyMiddleware({
  target: "http://127.0.0.1:8000",
  changeOrigin: true,
  pathRewrite: {
    "^/": "/api/"
  },
  on: {
    proxyReq: (proxyReq, req) => {
      log(`[Proxy] ${req.method} ${req.url} \u2192 Laravel`);
    },
    proxyRes: (proxyRes, req) => {
      log(`[Proxy] \u2713 ${proxyRes.statusCode}`);
    },
    error: (err, req, res) => {
      log(`[Proxy Error] ${err.message}`);
      if (!res.headersSent) {
        res.writeHead(503, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          error: "Laravel API unavailable",
          message: "Start Laravel: cd api && php artisan serve --host=0.0.0.0 --port=8000",
          details: err.message
        }));
      }
    }
  }
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
