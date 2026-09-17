# 🌊 INCOIS 3D Ocean Data Visualizer (SIH 2026 - SIH26067)

### **Ministry of Earth Sciences (MoES) • Indian National Centre for Ocean Information Services (INCOIS)**
> **Problem Statement (SIH26067):** *Develop a web-based interactive 3D visualization platform that integrates numerical ocean model outputs and in-situ observations.*

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vite_Sandbox-cyan?style=for-the-badge&logo=three.js)](https://github.com/oviraraptosarus/incois-3d-ocean-sandbox)
[![CF-1.8 Compliant](https://img.shields.io/badge/Standard-CF--1.8_NetCDF-emerald?style=for-the-badge)](https://cfconventions.org/)
[![Three.js](https://img.shields.io/badge/Renderer-Three.js_WebGL2-blue?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](#license)

---

## 📌 Executive Summary

India's vast **Exclusive Economic Zone (EEZ)** and coastline require continuous, high-resolution 3D monitoring of ocean state variables. INCOIS archives petabytes of 4D numerical ocean model simulations (ROMS / NEMO fields of Temperature, Salinity, Current Vectors, Chlorophyll-a) alongside autonomous observational streams (Argo profiling floats, Glider missions).

### The Critical Gap Identified by INCOIS
Historically, oceanographic analysis has been **desktop-bound** (e.g., Panoply, Ferret, Ocean Data View) or restricted to flat 2D surface maps. Forecasters are forced to juggle disparate tools, unable to simultaneously render volumetric 3D water columns alongside in-situ instrument profiles.

### Our Solution
A **100% browser-native, zero-dependency, GPU-accelerated 3D ocean visualization platform**. It co-visualizes multi-depth ocean model fields, animated 3D current flow particles, and in-situ Argo/Glider tracks with **real-time statistical co-validation (RMSE, Bias, Pearson $r$)** and an interactive **Public Outreach Story Mode**.

---

## 🌐 Online vs. Offline: What is this Problem Statement Supposed to Be?

**The mandate is 100% Web-Based (Online-First).**

| Aspect | Legacy Offline Tools (Panoply / Ferret) | Our Web-Based Platform (SIH26067) |
|---|---|---|
| **Accessibility** | Requires manual install, heavy desktop C/Fortran binaries, OS-specific dependencies | **Zero-install:** Runs directly in any web browser, mobile device, or embedded `<iframe>` |
| **Data Flow** | Forecasters must download massive multi-GB NetCDF files manually | **Streamed:** Consumes cloud NetCDF/OPeNDAP streams or client-side compressed 3D textures |
| **Cross-Validation** | Manually writing Python/MATLAB scripts to plot model vs. float curves | **1-Click:** Interactive 3D raycasting opens instant depth-vs-variable validation charts |
| **Public Outreach** | Unusable for non-specialists and students | **Built-in Story Mode:** Guided cinematic tours for e-learning and MoES exhibitions |
| **Field Resilience** | Desktop-dependent | **PWA & Sandbox Ready:** Can be cached for offline deployment aboard research vessels |

---

## 🛠️ Tech Stack & Architecture

```
                                  INCOIS 3D OCEAN PLATFORM
                                             │
      ┌──────────────────────────────────────┼──────────────────────────────────────┐
      ▼                                      ▼                                      ▼
[ Data Engine ]                      [ 3D WebGL2 Viewport ]                 [ Analysis & UI ]
• CF-1.8 NetCDF4 Simulator           • Three.js (r162)                      • Chart.js (Dual Profile)
• 4D Grid: T / S / Chl / U / V / W   • Direct Volume Raymarching (GLSL)     • Statistical Validation (RMSE, Bias, r)
• Trilinear Spatial Interpolation    • 3D Current Particle Advection        • Vertical Transect Slicer
• cmocean Standard Palettes          • Isosurface Extraction (Thermocline)  • Guided Science Storytelling Tour
• Argo & Glider GeoJSON Parsers      • 3D Plumbline & Sawtooth Tubes        • Glassmorphism Floating HUD
```

### Core Technologies
- **Rendering & Shaders:** Three.js, WebGL2 `Data3DTexture`, Custom GLSL Raymarching Fragment/Vertex Shaders, OrbitControls.
- **Frontend Architecture:** Vanilla JavaScript (ES2022+ Modules), Vite, HTML5 Canvas, Tailwind CSS (Spatial Glassmorphism theme).
- **Analytics & Charting:** Chart.js 4.4 (Inverted Depth-Axis Line Profiles, RMSE & Pearson Correlation calculation).
- **Standards & Conventions:** Climate and Forecast (CF-1.8) Metadata Conventions, OGC WMS/WCS compatibility, cmocean oceanographic color palettes.
- **Testing & Tooling:** Vitest (11 passing test suites across data engine, colormaps, validation, and transects).

---

## ✨ Key Features & Capabilities

### 1. 🧊 3D GPU Direct Volume Raymarching
- WebGL2 hardware-accelerated volumetric rendering across the full Indian Ocean water column (0–2000m depth).
- **7 Standard `cmocean` Colormaps:** `thermal` (temperature), `haline` (salinity), `deep` (bathymetry), `speed` (currents), `matter` (sediments), `chlorophyll` (biomass), and `balance` (anomalies).
- **3D Isosurface Extraction:** Real-time thermocline/halocline surface extraction with 3D gradient normal calculation and Phong shading.
- **Depth Slicing Plane:** Dynamic clipping slider to isolate upper euphotic zones (0–200m) or deep abyssal currents.
- **Vertical Exaggeration (1x to 80x):** Solves the oceanographic aspect ratio problem (oceans are ~4km deep but ~5000km wide) by dynamically scaling depth.

### 2. 🌀 3D Current Vector Flow Particles
- Over 3,000 GPU-advected velocity particles tracking seasonal Indian Ocean circulation:
  - Somali Current and Great Whirl gyre.
  - West India Coastal Current (WICC) and East India Coastal Current (EICC).
  - Velocity-magnitude responsive color gradients (Amber for swift surface jets, Cyan for intermediate drift, Deep Blue for abyssal flow).

### 3. 🟡 In-Situ Sensor Co-Display & Dual-Profile Validation
- **Argo Profiling Floats:** Geospatially accurate 3D buoyant hulls with active antenna beacons and depth plumblines with discrete sampling nodes.
- **Underwater Gliders:** 3D continuous ribbon tubes rendering sawtooth (yo-yo) dive trajectories in the Bay of Bengal and Arabian Sea.
- **1-Click Co-Validation:** Click any float or glider to open the **Dual-Profile Validation Modal**:
  - Inverted depth axis (0m surface at top, 2000m at bottom) comparing in-situ observations against numerical model outputs.
  - Automated calculation of **Root Mean Square Error (RMSE)**, **Mean Model Bias**, and **Pearson Correlation Coefficient ($r$)**.
  - One-click CSV export of validation data.

### 4. ✂️ Arbitrary Vertical Transects (Cross-Sections)
- Inspect depth-vs-distance vertical contour slices along key oceanographic routes:
  - *Mumbai Coast → Maldives (Arabian Sea upwelling front)*
  - *Ganges Delta → Sri Lanka (Freshwater barrier layer & halocline)*
  - *Equatorial Indian Ocean Zonal Transect (IOD slope)*

### 5. 📖 Public Outreach & Science Storytelling Mode
- Guided interactive 3D tours designed for school students, policymakers, and public science exhibitions:
  1. *Arabian Sea Monsoon Currents & Coastal Upwelling*
  2. *Bay of Bengal Freshwater Barrier Layer & Cyclone Intensification*
  3. *Autonomous In-Situ Fleet (Argo & Gliders) Real-Time Validation*
- Features automated cinematic camera transitions, variable auto-switching, custom vertical exaggeration presets, and narration HUD cards.

### 6. 📥 Multi-Format In-Situ Ingestion Tool
- Drag-and-drop interface for uploading custom Argo float JSON profiles or Glider CSV missions.
- Live deployment template presets (Lakshadweep Sea, Andaman Basin).

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)

### Installation & Local Run
```bash
# 1. Clone the repository
git clone https://github.com/oviraraptosarus/incois-3d-ocean-sandbox.git
cd incois-3d-ocean-sandbox

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
Open your browser at `http://localhost:3000`.

### Production Build & Preview
```bash
npm run build
npm run preview
```

### Zero-Build / Pure Static Hosting
Since the sandbox is 100% client-side with no backend dependencies, you can serve the root with any HTTP server:
```bash
python -m http.server 3000
```

### Embedding in an `<iframe>`
```html
<iframe 
  src="http://localhost:3000" 
  width="100%" 
  height="800px" 
  frameborder="0" 
  allow="fullscreen">
</iframe>
```

---

## 🧪 Automated Testing

Run the test suite via Vitest:
```bash
npm test
```

```
 ✓ tests/setup.test.js            (1 test)
 ✓ tests/oceanDataEngine.test.js  (5 tests)
 ✓ tests/colormapEngine.test.js   (3 tests)
 ✓ tests/validationEngine.test.js (2 tests)

 Test Files  4 passed (4)
      Tests  11 passed (11)
```

---

## 🗺️ Future Operational Roadmap

1. **Live OPeNDAP / THREDDS Server Connectors:** Direct streaming of INCOIS Live Live Access Server (LAS) NetCDF files via chunked HTTP range requests.
2. **Additional In-Situ Sensors:** Ingestion modules for High-Frequency (HF) Radar surface currents, Acoustic Doppler Current Profilers (ADCP), and Moored Buoy arrays (RAMA / OMNI).
3. **Machine Learning Downscaling:** Neural network-based super-resolution for sub-mesoscale eddy prediction in coastal zones.

---

## 📜 License & Acknowledgments
- Developed for **Smart India Hackathon (SIH 2026)** — Ministry of Earth Sciences (MoES) / INCOIS.
- Colormaps based on standard oceanographic `cmocean` specifications by Kristen M. Thyng et al.
- Licensed under the **MIT License**.
