export class DataUploadModal {
  static show(onNewInstrumentLoaded) {
    const modalRoot = document.getElementById('modal-container');

    modalRoot.innerHTML = `
      <div id="upload-backdrop" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
        <div class="relative w-full max-w-xl glass-panel rounded-2xl p-6 text-white shadow-2xl border border-slate-700">
          
          <!-- Header -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xl">
                📥
              </div>
              <div>
                <h3 class="font-bold text-sm tracking-wide text-white">Multi-Format In-Situ Ingestion</h3>
                <p class="text-[11px] text-slate-400">Ingest custom Argo float or Glider datasets (JSON / CSV format)</p>
              </div>
            </div>
            <button id="btn-close-upload" class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer text-lg">
              ✕
            </button>
          </div>

          <!-- Drag and drop zone -->
          <div id="drop-zone" class="my-4 border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-xl p-6 text-center cursor-pointer transition bg-slate-900/60 hover:bg-slate-800/40 flex flex-col items-center justify-center">
            <div class="text-3xl mb-2">📁</div>
            <p class="text-xs font-semibold text-slate-200">Drag & Drop Argo/Glider JSON or CSV file here</p>
            <p class="text-[10px] text-slate-400 mt-1">Supports WMO standard Argo profiles or INCOIS glider tracks</p>
            <input id="file-input" type="file" accept=".json,.csv" class="hidden">
          </div>

          <!-- Quick Template Preset Ingest -->
          <div class="space-y-2">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Or Ingest Live Mission Template:</span>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <button id="btn-sample-argo" class="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/60 text-left transition cursor-pointer flex flex-col">
                <span class="font-semibold text-amber-400">🟡 Deploy New Argo Float</span>
                <span class="text-[10px] text-slate-400 mt-1">Lakshadweep Sea (Lat 9.8°N, Lon 72.1°E, 2000m depth)</span>
              </button>
              <button id="btn-sample-glider" class="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/60 text-left transition cursor-pointer flex flex-col">
                <span class="font-semibold text-cyan-400">🔵 Deploy New Ocean Glider</span>
                <span class="text-[10px] text-slate-400 mt-1">Andaman Sea Transect (Lat 11.5°N, Lon 92.5°E)</span>
              </button>
            </div>
          </div>

          <div id="upload-status" class="mt-3 text-[11px] font-mono text-emerald-400 hidden"></div>
        </div>
      </div>
    `;

    const closeUpload = () => {
      modalRoot.innerHTML = '';
    };

    document.getElementById('btn-close-upload').addEventListener('click', closeUpload);
    document.getElementById('upload-backdrop').addEventListener('click', (e) => {
      if (e.target.id === 'upload-backdrop') closeUpload();
    });

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          if (file.name.endsWith('.json')) {
            const parsed = JSON.parse(ev.target.result);
            if (onNewInstrumentLoaded) onNewInstrumentLoaded(parsed, 'JSON');
          }
          closeUpload();
        } catch (err) {
          alert('Failed to parse file: ' + err.message);
        }
      };
      reader.readAsText(file);
    });

    // Sample Deploy Buttons
    document.getElementById('btn-sample-argo').addEventListener('click', () => {
      const newArgo = {
        platform_id: 'INCOIS-ARGO-2903088',
        wmo_id: '2903088',
        cycle_number: 1,
        timestamp: new Date().toISOString(),
        latitude: 9.8,
        longitude: 72.1,
        basin: 'Lakshadweep Sea',
        instrument_type: 'ARGO',
        profile: [
          { depth: 5.0, temp: 29.5, salt: 35.8, qc: 1 },
          { depth: 50.0, temp: 28.0, salt: 35.9, qc: 1 },
          { depth: 100.0, temp: 21.5, salt: 35.5, qc: 1 },
          { depth: 200.0, temp: 15.2, salt: 35.2, qc: 1 },
          { depth: 500.0, temp: 10.4, salt: 35.0, qc: 1 },
          { depth: 1000.0, temp: 6.9, salt: 34.8, qc: 1 },
          { depth: 2000.0, temp: 3.8, salt: 34.7, qc: 1 },
        ],
      };
      if (onNewInstrumentLoaded) onNewInstrumentLoaded([newArgo], 'ARGO');
      closeUpload();
    });

    document.getElementById('btn-sample-glider').addEventListener('click', () => {
      const newGlider = {
        mission_id: 'INCOIS-GLIDER-ANDAMAN-03',
        mission_name: 'Andaman Basin Deep Transect Mission',
        instrument_type: 'GLIDER',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 86400000).toISOString(),
        waypoints: [
          { timestamp: '2026-09-01T00:00:00Z', latitude: 11.5, longitude: 92.5, depth: 5.0, temp: 29.0, salt: 32.5, chlorophyll: 1.0 },
          { timestamp: '2026-09-01T06:00:00Z', latitude: 11.7, longitude: 92.8, depth: 400.0, temp: 11.8, salt: 34.8, chlorophyll: 0.2 },
          { timestamp: '2026-09-01T12:00:00Z', latitude: 11.9, longitude: 93.1, depth: 800.0, temp: 7.5, salt: 35.0, chlorophyll: 0.05 },
          { timestamp: '2026-09-01T18:00:00Z', latitude: 12.1, longitude: 93.4, depth: 10.0, temp: 28.9, salt: 32.7, chlorophyll: 1.2 },
        ],
      };
      if (onNewInstrumentLoaded) onNewInstrumentLoaded([newGlider], 'GLIDER');
      closeUpload();
    });
  }
}
