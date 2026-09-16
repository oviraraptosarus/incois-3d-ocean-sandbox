# INCOIS 3D Ocean Data Visualization Platform (SIH26067)

### Ministry of Earth Sciences (MoES) • Indian National Centre for Ocean Information Services

A browser-native, zero-docker, interactive 3D ocean data visualization platform integrating CF-compliant 4D numerical ocean model fields (Temperature, Salinity, Current Vectors, Chlorophyll-a) and in-situ observational streams (Argo profiling floats, autonomous underwater Gliders).

---

## 🌟 Key Features

1. **3D GPU Direct Volume Raymarching:**
   - Real-time WebGL2 raymarching with `THREE.Data3DTexture`.
   - Dynamic transfer functions and standard oceanographic `cmocean` colormaps (`thermal`, `haline`, `deep`, `speed`, `matter`, `chlorophyll`, `balance`).
   - 3D Isosurface extraction (e.g. 20°C thermocline front) with normal gradient Phong shading.
   - Interactive depth slicing plane (0 to 2000m).
   - Vertical exaggeration slider (1x to 80x) to expand shallow bathymetry and upper-ocean stratification.

2. **3D Vector Flow Particle Simulation:**
   - Real-time particle advection over 3D velocity fields ($u, v, w$).
   - Dynamically models the Southwest Monsoon gyre circulation, Somali Current, and coastal upwelling.
   - Velocity-magnitude responsive glowing particle shaders.

3. **In-Situ Sensor Co-Display & Dual-Profile Validation:**
   - 3D geospatial markers for Argo floats with depth plumblines and discrete sampling points.
   - 3D tube ribbons visualizing underwater Glider sawtooth yo-yo diving trajectories.
   - Click any float/glider to open the **Dual-Profile Validation Modal**:
     - Depth vs Variable line chart (Inverted depth axis with 0m surface at top, 2000m at bottom).
     - Live calculation of **Root Mean Square Error (RMSE)**, **Mean Model Bias**, and **Pearson Correlation ($r$)**.
     - One-click CSV export of validation data.

4. **Public Outreach & Science Communication (Story Mode):**
   - Guided interactive 3D tours designed for schools, colleges, and public exhibitions.
   - Automated cinematic camera flight paths, custom vertical exaggeration presets, and chapter-by-chapter scientific narration.

---

## 🚀 Instant Run / Preview

### Option 1: Vite Dev Server (Recommended)
```bash
cd incois-ocean-sandbox
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### Option 2: Pure Static Server (Zero-Build)
```bash
cd incois-ocean-sandbox
npx serve .
# or
python -m http.server 3000
```

### Option 3: Embed in any `<iframe>`
```html
<iframe src="http://localhost:3000" width="100%" height="800px" frameborder="0" allow="fullscreen"></iframe>
```

---

## 🧪 Automated Testing
Run the unit test suite with Vitest:
```bash
npm test
```
Tests cover the CF-compliant ocean grid engine, cmocean colormaps, in-situ datasets, and statistical validation metrics.
