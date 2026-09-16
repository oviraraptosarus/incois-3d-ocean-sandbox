import { OceanDataEngine } from './engine/oceanDataEngine.js';
import { ColormapEngine } from './engine/colormapEngine.js';
import { ValidationEngine } from './engine/validationEngine.js';
import { ThreeScene } from './renderer/threeScene.js';
import { VolumeRaymarcher } from './renderer/volumeRaymarcher.js';
import { VectorFieldFlow } from './renderer/vectorFieldFlow.js';
import { InstrumentMarkers } from './renderer/instrumentMarkers.js';
import { ControlPanel } from './ui/controlPanel.js';
import { TimelinePlayer } from './ui/timelinePlayer.js';
import { ProfileChartModal } from './ui/profileChartModal.js';
import { StoryModal } from './ui/storyModal.js';
import { TransectModal } from './ui/transectModal.js';
import { DataUploadModal } from './ui/dataUploadModal.js';
import initialArgoProfiles from './data/argoProfiles.json';
import initialGliderMissions from './data/gliderMissions.json';

class App {
  constructor() {
    this.oceanEngine = new OceanDataEngine();
    this.currentVar = 'temp';
    this.currentPalette = 'thermal';
    this.currentTimeIdx = 0;
    this.activeStory = null;
    this.storyStepIdx = 0;

    this.argoList = [...initialArgoProfiles];
    this.gliderList = [...initialGliderMissions];

    this.initViewport();
    this.initControls();
    this.initTimeline();
    this.initHeaderActions();
    this.initCursorHUD();
    this.startLoop();
    this.updateData();
  }

  initViewport() {
    const viewportContainer = document.getElementById('viewport-container');
    this.threeScene = new ThreeScene(viewportContainer);
    this.volumeRaymarcher = new VolumeRaymarcher(this.threeScene.oceanGroup);
    this.vectorFlow = new VectorFieldFlow(this.threeScene.oceanGroup);

    // Instrument Markers (Argo & Gliders)
    this.instrumentMarkers = new InstrumentMarkers(
      this.threeScene.oceanGroup,
      this.threeScene.camera,
      this.threeScene.renderer.domElement,
      (argo) => this.handleSelectArgo(argo),
      (glider) => this.handleSelectGlider(glider)
    );
    this.instrumentMarkers.loadInstruments(this.argoList, this.gliderList);
  }

  initControls() {
    const controlContainer = document.getElementById('control-panel-container');
    this.controlPanel = new ControlPanel(
      controlContainer,
      (v) => this.handleVariableChange(v),
      (pal) => this.handleColormapChange(pal),
      (exag) => this.threeScene.setExaggeration(exag),
      (op) => this.volumeRaymarcher.setParams({ opacity: op }),
      (iso, val) => this.volumeRaymarcher.setParams({ isIsosurface: iso, isovalue: val }),
      (clip) => this.volumeRaymarcher.setParams({ clipDepth: clip }),
      (layers) => {
        this.vectorFlow.setVisible(layers.vectors);
        this.instrumentMarkers.setVisible(layers.argo, layers.gliders);
      }
    );
  }

  initTimeline() {
    const timelineContainer = document.getElementById('timeline-container');
    this.timeline = new TimelinePlayer(
      timelineContainer,
      this.oceanEngine.getMetadata().time_steps,
      (tIdx) => this.handleTimeChange(tIdx)
    );
  }

  initHeaderActions() {
    // 1. Story Mode
    const storyBtn = document.getElementById('btn-story-mode');
    if (storyBtn) {
      storyBtn.addEventListener('click', () => {
        StoryModal.show((story) => this.startStory(story));
      });
    }

    // 2. Transect Tool
    const transectBtn = document.getElementById('btn-transect-tool');
    if (transectBtn) {
      transectBtn.addEventListener('click', () => {
        TransectModal.show(this.oceanEngine, this.currentVar, this.currentTimeIdx);
      });
    }

    // 3. Ingestion / Upload Tool
    const uploadBtn = document.getElementById('btn-data-upload');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => {
        DataUploadModal.show((newItems, type) => {
          if (type === 'ARGO' || (Array.isArray(newItems) && newItems[0]?.profile)) {
            this.argoList = [...this.argoList, ...newItems];
          } else if (type === 'GLIDER' || (Array.isArray(newItems) && newItems[0]?.waypoints)) {
            this.gliderList = [...this.gliderList, ...newItems];
          }
          this.instrumentMarkers.loadInstruments(this.argoList, this.gliderList);
        });
      });
    }
  }

  initCursorHUD() {
    const hudText = document.getElementById('hover-coord-text');
    const domElement = this.threeScene.renderer.domElement;

    domElement.addEventListener('pointermove', (e) => {
      const rect = domElement.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;

      // Project screen normalized coordinate to ocean domain
      const lon = (50.0 + nx * 45.0).toFixed(1);
      const lat = (25.0 - ny * 25.0).toFixed(1);
      const depth = 10; // Surface sample

      if (hudText && lat >= 0 && lat <= 25 && lon >= 50 && lon <= 95) {
        const val = this.oceanEngine.samplePoint(this.currentVar, this.currentTimeIdx, parseFloat(lat), parseFloat(lon), depth);
        const unit = this.currentVar === 'temp' ? '°C' : this.currentVar === 'salt' ? 'PSU' : 'mg/m³';
        hudText.textContent = `Lat: ${lat}°N • Lon: ${lon}°E • Depth: ${depth}m • ${this.currentVar.toUpperCase()}: ${val.toFixed(2)} ${unit}`;
      }
    });
  }

  updateData() {
    const vol = this.oceanEngine.get3DVolume(this.currentVar, this.currentTimeIdx);
    const lut = ColormapEngine.getLut(this.currentPalette, 256);
    this.volumeRaymarcher.updateVolume(vol, lut);

    // Update top header badge
    const badge = document.getElementById('active-variable-badge');
    if (badge) {
      const varNames = {
        temp: 'Potential Temp (°C)',
        salt: 'Practical Salinity (PSU)',
        chlorophyll: 'Chlorophyll-a (mg/m³)',
        u: 'Eastward Velocity U (m/s)',
      };
      badge.textContent = varNames[this.currentVar] || this.currentVar;
    }
  }

  handleVariableChange(varName) {
    this.currentVar = varName;
    const defaultPalettes = { temp: 'thermal', salt: 'haline', chlorophyll: 'chlorophyll', u: 'speed' };
    this.currentPalette = defaultPalettes[varName] || 'thermal';
    this.updateData();
  }

  handleColormapChange(pal) {
    this.currentPalette = pal;
    const lut = ColormapEngine.getLut(this.currentPalette, 256);
    const vol = this.oceanEngine.get3DVolume(this.currentVar, this.currentTimeIdx);
    this.volumeRaymarcher.updateVolume(vol, lut);
  }

  handleTimeChange(tIdx) {
    this.currentTimeIdx = tIdx;
    this.updateData();
  }

  handleSelectArgo(argo) {
    const report = ValidationEngine.validateArgo(
      argo,
      this.oceanEngine,
      this.currentVar,
      this.currentTimeIdx
    );
    ProfileChartModal.show(report);
  }

  handleSelectGlider(glider) {
    const report = ValidationEngine.validateGlider(
      glider,
      this.oceanEngine,
      this.currentVar,
      this.currentTimeIdx
    );
    const argoFormat = {
      platform_id: glider.mission_id,
      wmo_id: glider.mission_id,
      basin: glider.mission_name || 'Glider Trajectory',
      instrument_type: 'GLIDER',
      variable: this.currentVar,
      latitude: glider.waypoints[0].latitude,
      longitude: glider.waypoints[0].longitude,
      timestamp: glider.waypoints[0].timestamp,
      metrics: report.metrics,
      comparison: report.comparison,
    };
    ProfileChartModal.show(argoFormat);
  }

  startStory(story) {
    this.activeStory = story;
    this.storyStepIdx = 0;
    this.applyStoryStep(story.steps[0]);

    StoryModal.renderStoryHUD(
      this.activeStory,
      this.storyStepIdx,
      () => this.handleNextStoryStep(),
      () => this.handlePrevStoryStep(),
      () => this.handleExitStory()
    );
  }

  applyStoryStep(step) {
    if (step.variable && step.variable !== this.currentVar) {
      this.currentVar = step.variable;
      this.currentPalette = step.palette || 'thermal';
    }
    if (step.exaggeration) {
      this.threeScene.setExaggeration(step.exaggeration);
      this.controlPanel.setExaggeration(step.exaggeration);
    }
    if (step.isIsosurface !== undefined) {
      this.volumeRaymarcher.setParams({
        isIsosurface: step.isIsosurface,
        isovalue: step.isovalue || 0.5,
      });
    }
    if (step.camera) {
      this.threeScene.flyTo(step.camera.pos, step.camera.target);
    }
    this.updateData();
  }

  handleNextStoryStep() {
    this.storyStepIdx++;
    if (this.storyStepIdx < this.activeStory.steps.length) {
      this.applyStoryStep(this.activeStory.steps[this.storyStepIdx]);
      StoryModal.renderStoryHUD(
        this.activeStory,
        this.storyStepIdx,
        () => this.handleNextStoryStep(),
        () => this.handlePrevStoryStep(),
        () => this.handleExitStory()
      );
    }
  }

  handlePrevStoryStep() {
    if (this.storyStepIdx > 0) {
      this.storyStepIdx--;
      this.applyStoryStep(this.activeStory.steps[this.storyStepIdx]);
      StoryModal.renderStoryHUD(
        this.activeStory,
        this.storyStepIdx,
        () => this.handleNextStoryStep(),
        () => this.handlePrevStoryStep(),
        () => this.handleExitStory()
      );
    }
  }

  handleExitStory() {
    this.activeStory = null;
    this.threeScene.flyTo([0, 160, 240], [0, -20, 0]);
  }

  startLoop() {
    const tick = () => {
      requestAnimationFrame(tick);
      this.vectorFlow.update();
    };
    tick();
  }
}

// Bootstrap on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
