import { ColormapEngine } from '../engine/colormapEngine.js';

export class ControlPanel {
  constructor(
    container,
    onVariableChange,
    onColormapChange,
    onExaggerationChange,
    onOpacityChange,
    onIsosurfaceToggle,
    onClipDepthChange,
    onLayerToggle
  ) {
    this.container = container;
    this.onVariableChange = onVariableChange;
    this.onColormapChange = onColormapChange;
    this.onExaggerationChange = onExaggerationChange;
    this.onOpacityChange = onOpacityChange;
    this.onIsosurfaceToggle = onIsosurfaceToggle;
    this.onClipDepthChange = onClipDepthChange;
    this.onLayerToggle = onLayerToggle;

    this.selectedVar = 'temp';
    this.selectedPal = 'thermal';
    this.exaggeration = 25;
    this.opacity = 0.85;
    this.isIsosurface = false;
    this.isovalue = 0.5;
    this.clipDepth = 1.0;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="space-y-4 text-xs select-none">
        <!-- 1. Ocean Variables -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <span>📊</span> Ocean Model Variable
            </span>
            <span class="text-[9px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/50">ROMS 3D</span>
          </div>
          <div class="grid grid-cols-1 gap-1.5">
            <button data-var="temp" class="var-btn flex items-center justify-between px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-medium transition cursor-pointer">
              <span class="flex items-center gap-2"><span>🌡️</span> Potential Temp</span>
              <span class="font-mono text-[11px] text-cyan-400">°C</span>
            </button>
            <button data-var="salt" class="var-btn flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/90 text-slate-300 hover:bg-slate-800/90 border border-transparent font-medium transition cursor-pointer">
              <span class="flex items-center gap-2"><span>🧂</span> Practical Salinity</span>
              <span class="font-mono text-[11px] text-slate-400">PSU</span>
            </button>
            <button data-var="chlorophyll" class="var-btn flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/90 text-slate-300 hover:bg-slate-800/90 border border-transparent font-medium transition cursor-pointer">
              <span class="flex items-center gap-2"><span>🌿</span> Chlorophyll-a</span>
              <span class="font-mono text-[11px] text-slate-400">mg/m³</span>
            </button>
            <button data-var="u" class="var-btn flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/90 text-slate-300 hover:bg-slate-800/90 border border-transparent font-medium transition cursor-pointer">
              <span class="flex items-center gap-2"><span>➡️</span> Eastward Velocity (U)</span>
              <span class="font-mono text-[11px] text-slate-400">m/s</span>
            </button>
          </div>
        </div>

        <!-- 2. Dynamic Colormap & Transfer Function -->
        <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3 shadow-lg">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-slate-200 flex items-center gap-1.5">
              <span>🎨</span> Colormap Palette
            </span>
            <select id="select-palette" class="bg-slate-800 text-cyan-400 font-bold rounded-md px-2 py-1 border border-slate-700 font-mono text-[11px] cursor-pointer">
              <option value="thermal">cmocean.thermal</option>
              <option value="haline">cmocean.haline</option>
              <option value="deep">cmocean.deep</option>
              <option value="speed">cmocean.speed</option>
              <option value="matter">cmocean.matter</option>
              <option value="chlorophyll">cmocean.chlorophyll</option>
              <option value="balance">cmocean.balance</option>
            </select>
          </div>

          <!-- Colorbar Preview Canvas -->
          <div class="space-y-1">
            <div class="h-3.5 w-full rounded-md overflow-hidden border border-slate-700 shadow-inner">
              <canvas id="colorbar-canvas" class="w-full h-full block"></canvas>
            </div>
            <div class="flex justify-between text-[10px] font-mono text-slate-400">
              <span id="label-min-val">4.0 °C</span>
              <span class="text-slate-500">Linear Scale</span>
              <span id="label-max-val">31.0 °C</span>
            </div>
          </div>

          <!-- Volume Opacity Slider -->
          <div>
            <div class="flex justify-between text-slate-300 mb-1 font-medium">
              <span>Volume Opacity</span>
              <span id="label-opacity" class="font-mono text-cyan-400 font-bold">85%</span>
            </div>
            <input id="slider-opacity" type="range" min="0.1" max="1.0" step="0.05" value="0.85" class="w-full accent-cyan-400 cursor-pointer">
          </div>

          <!-- Depth Slice / Clipping Slider -->
          <div class="pt-2 border-t border-slate-800/80">
            <div class="flex justify-between text-slate-300 mb-1 font-medium">
              <span class="flex items-center gap-1"><span>✂️</span> Depth Slicing Plane</span>
              <span id="label-clip" class="font-mono text-cyan-400 font-bold">0–2000m</span>
            </div>
            <input id="slider-clip" type="range" min="0.05" max="1.0" step="0.05" value="1.0" class="w-full accent-cyan-400 cursor-pointer">
          </div>

          <!-- Isosurface Extraction Mode -->
          <div class="pt-2 border-t border-slate-800/80">
            <label class="flex items-center justify-between cursor-pointer mb-2">
              <span class="text-slate-200 font-medium flex items-center gap-1.5">
                <span>🌐</span> 3D Isosurface Mode
              </span>
              <input id="check-isosurface" type="checkbox" class="rounded accent-cyan-400 w-4 h-4 cursor-pointer">
            </label>
            <div id="isovalue-container" class="hidden space-y-1">
              <div class="flex justify-between text-[11px] font-mono text-slate-300">
                <span>Threshold Value</span>
                <span id="label-isovalue" class="text-amber-400 font-bold">20.0 °C</span>
              </div>
              <input id="slider-isovalue" type="range" min="0" max="1" step="0.01" value="0.5" class="w-full accent-amber-400 cursor-pointer">
              <p class="text-[9px] text-slate-500">Extracts 3D thermocline / halocline front with normal shading.</p>
            </div>
          </div>
        </div>

        <!-- 3. Vertical Exaggeration Slider -->
        <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800 shadow-lg">
          <div class="flex justify-between text-slate-200 font-semibold mb-1">
            <span class="flex items-center gap-1.5"><span>📐</span> Vertical Exaggeration</span>
            <span id="label-exag" class="font-mono text-cyan-400 font-bold">25x</span>
          </div>
          <input id="slider-exag" type="range" min="1" max="80" value="25" class="w-full accent-cyan-400 cursor-pointer">
          <p class="text-[9px] text-slate-500 mt-1">Expands shallow bathymetry & surface thermocline depth.</p>
        </div>

        <!-- 4. Observation & Flow Layer Toggles -->
        <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2.5 shadow-lg">
          <span class="font-semibold text-slate-200 block text-[11px]">Observation & Flow Overlays</span>
          <label class="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/50 transition">
            <span class="text-slate-300 flex items-center gap-2"><span>🌊</span> 3D Current Particles</span>
            <input id="check-vectors" type="checkbox" checked class="accent-cyan-400 w-4 h-4 cursor-pointer">
          </label>
          <label class="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/50 transition">
            <span class="text-slate-300 flex items-center gap-2"><span>🟡</span> Argo Profiling Floats</span>
            <input id="check-argo" type="checkbox" checked class="accent-amber-400 w-4 h-4 cursor-pointer">
          </label>
          <label class="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/50 transition">
            <span class="text-slate-300 flex items-center gap-2"><span>🔵</span> Underwater Gliders</span>
            <input id="check-gliders" type="checkbox" checked class="accent-cyan-400 w-4 h-4 cursor-pointer">
          </label>
        </div>
      </div>
    `;

    this.drawColorbarCanvas();
    this.bindEvents();
  }

  drawColorbarCanvas() {
    const canvas = this.container.querySelector('#colorbar-canvas');
    if (!canvas) return;
    canvas.width = 256;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const lut = ColormapEngine.getLut(this.selectedPal, 256);

    const imgData = ctx.createImageData(256, 16);
    for (let x = 0; x < 256; x++) {
      const r = lut[x * 4 + 0];
      const g = lut[x * 4 + 1];
      const b = lut[x * 4 + 2];
      const a = lut[x * 4 + 3];

      for (let y = 0; y < 16; y++) {
        const idx = (y * 256 + x) * 4;
        imgData.data[idx + 0] = r;
        imgData.data[idx + 1] = g;
        imgData.data[idx + 2] = b;
        imgData.data[idx + 3] = a;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  bindEvents() {
    // Variable buttons
    this.container.querySelectorAll('.var-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.var-btn').forEach((b) => {
          b.className = 'var-btn flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/90 text-slate-300 hover:bg-slate-800/90 border border-transparent font-medium transition cursor-pointer';
        });
        btn.className = 'var-btn flex items-center justify-between px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-medium transition cursor-pointer';
        this.selectedVar = btn.dataset.var;
        
        // Auto update default palette matching variable
        const defaultPals = { temp: 'thermal', salt: 'haline', chlorophyll: 'chlorophyll', u: 'speed' };
        if (defaultPals[this.selectedVar]) {
          this.selectedPal = defaultPals[this.selectedVar];
          const palSelect = this.container.querySelector('#select-palette');
          if (palSelect) palSelect.value = this.selectedPal;
          this.drawColorbarCanvas();
        }

        // Update range labels
        const minLbl = this.container.querySelector('#label-min-val');
        const maxLbl = this.container.querySelector('#label-max-val');
        if (this.selectedVar === 'temp') {
          minLbl.textContent = '4.0 °C'; maxLbl.textContent = '31.0 °C';
        } else if (this.selectedVar === 'salt') {
          minLbl.textContent = '31.5 PSU'; maxLbl.textContent = '36.8 PSU';
        } else if (this.selectedVar === 'chlorophyll') {
          minLbl.textContent = '0.05 mg/m³'; maxLbl.textContent = '2.8 mg/m³';
        } else {
          minLbl.textContent = '-1.2 m/s'; maxLbl.textContent = '+1.5 m/s';
        }

        this.onVariableChange(this.selectedVar);
      });
    });

    // Palette change
    this.container.querySelector('#select-palette').addEventListener('change', (e) => {
      this.selectedPal = e.target.value;
      this.drawColorbarCanvas();
      this.onColormapChange(this.selectedPal);
    });

    // Opacity
    this.container.querySelector('#slider-opacity').addEventListener('input', (e) => {
      this.opacity = parseFloat(e.target.value);
      this.container.querySelector('#label-opacity').textContent = `${Math.round(this.opacity * 100)}%`;
      this.onOpacityChange(this.opacity);
    });

    // Depth Slice
    this.container.querySelector('#slider-clip').addEventListener('input', (e) => {
      this.clipDepth = parseFloat(e.target.value);
      const depthMeters = Math.round(this.clipDepth * 2000);
      this.container.querySelector('#label-clip').textContent = `0–${depthMeters}m`;
      this.onClipDepthChange(this.clipDepth);
    });

    // Vertical Exaggeration
    this.container.querySelector('#slider-exag').addEventListener('input', (e) => {
      this.exaggeration = parseInt(e.target.value);
      this.container.querySelector('#label-exag').textContent = `${this.exaggeration}x`;
      this.onExaggerationChange(this.exaggeration);
    });

    // Isosurface
    const isoCheck = this.container.querySelector('#check-isosurface');
    const isoContainer = this.container.querySelector('#isovalue-container');
    isoCheck.addEventListener('change', (e) => {
      this.isIsosurface = e.target.checked;
      isoContainer.classList.toggle('hidden', !this.isIsosurface);
      const val = parseFloat(this.container.querySelector('#slider-isovalue').value);
      this.onIsosurfaceToggle(this.isIsosurface, val);
    });

    this.container.querySelector('#slider-isovalue').addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      // Map normalized 0..1 to variable units
      const label = this.container.querySelector('#label-isovalue');
      if (this.selectedVar === 'temp') {
        const tVal = (4.0 + val * 27.0).toFixed(1);
        label.textContent = `${tVal} °C`;
      } else if (this.selectedVar === 'salt') {
        const sVal = (31.5 + val * 5.3).toFixed(1);
        label.textContent = `${sVal} PSU`;
      } else {
        label.textContent = val.toFixed(2);
      }
      this.onIsosurfaceToggle(this.isIsosurface, val);
    });

    // Layer toggles
    ['vectors', 'argo', 'gliders'].forEach((layer) => {
      this.container.querySelector(`#check-${layer}`).addEventListener('change', () => {
        this.onLayerToggle({
          vectors: this.container.querySelector('#check-vectors').checked,
          argo: this.container.querySelector('#check-argo').checked,
          gliders: this.container.querySelector('#check-gliders').checked,
        });
      });
    });
  }

  setExaggeration(val) {
    this.exaggeration = val;
    const slider = this.container.querySelector('#slider-exag');
    const label = this.container.querySelector('#label-exag');
    if (slider) slider.value = val;
    if (label) label.textContent = `${val}x`;
  }
}
