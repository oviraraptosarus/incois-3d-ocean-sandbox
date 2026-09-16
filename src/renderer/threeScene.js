import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class ThreeScene {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth || window.innerWidth;
    this.height = container.clientHeight || window.innerHeight;

    // Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020617); // Deep slate ocean navy

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 2000);
    this.camera.position.set(0, 160, 240);

    // Renderer (WebGL2 with high precision for 3D textures)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 800;
    this.controls.minDistance = 20;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.15; // Allow slight under-ocean viewing

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight1.position.set(120, 220, 120);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x0284c7, 0.6);
    dirLight2.position.set(-120, -100, -120);
    this.scene.add(dirLight2);

    // Bounding Box Group for 3D Ocean Volume
    this.oceanGroup = new THREE.Group();
    this.scene.add(this.oceanGroup);

    // Camera animation state
    this.targetCamPos = null;
    this.targetLookAt = null;

    this.setupBoundingBox();
    this.setupResizeListener();
    
    this.animate = this.animate.bind(this);
    this.animate();
  }

  setupBoundingBox() {
    // Ocean Box dimensions: X: 200 (Longitudes 50E-95E), Y: 40 (Depth 0-2000m), Z: 150 (Latitudes 0N-25N)
    const boxGeo = new THREE.BoxGeometry(200, 40, 150);
    const edges = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.7,
      linewidth: 1,
    });
    this.bboxMesh = new THREE.LineSegments(edges, lineMat);
    this.bboxMesh.position.set(0, -20, 0);
    this.oceanGroup.add(this.bboxMesh);

    // Seafloor Bathymetry Wireframe Grid at Depth = -40 (2000m)
    const grid = new THREE.GridHelper(200, 20, 0x1e293b, 0x0f172a);
    grid.position.set(0, -40, 0);
    this.oceanGroup.add(grid);

    // Sea Surface Translucent Plane at Depth = 0
    const surfaceGeo = new THREE.PlaneGeometry(200, 150);
    const surfaceMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
    });
    const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
    surfaceMesh.rotation.x = -Math.PI / 2;
    surfaceMesh.position.set(0, 0, 0);
    this.oceanGroup.add(surfaceMesh);

    // Geographic boundary markers / labels (simulated via 3D text planes)
    this.createAxisLabels();
  }

  createAxisLabels() {
    const createLabel = (text, pos) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(0, 0, 256, 64);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, 252, 60);
      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 32);

      const tex = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.copy(pos);
      sprite.scale.set(30, 8, 1);
      this.oceanGroup.add(sprite);
    };

    createLabel('Arabian Sea (65°E)', new THREE.Vector3(-60, 6, 0));
    createLabel('Bay of Bengal (88°E)', new THREE.Vector3(60, 6, 0));
    createLabel('Equator (0°N)', new THREE.Vector3(0, 6, 85));
    createLabel('Northern Limit (25°N)', new THREE.Vector3(0, 6, -85));
    createLabel('Abyss: 2000m Depth', new THREE.Vector3(0, -44, 0));
  }

  setExaggeration(factor) {
    // factor ranges from 1 to 80 (default 25)
    const scaleY = factor / 25.0;
    this.oceanGroup.scale.set(1.0, scaleY, 1.0);
  }

  flyTo(pos, target, duration = 1.5) {
    this.targetCamPos = new THREE.Vector3(...pos);
    this.targetLookAt = new THREE.Vector3(...target);
  }

  setupResizeListener() {
    const handleResize = () => {
      if (!this.container) return;
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    };

    window.addEventListener('resize', handleResize);
    // ResizeObserver for container resizing
    const ro = new ResizeObserver(handleResize);
    ro.observe(this.container);
  }

  animate() {
    requestAnimationFrame(this.animate);

    // Smooth camera transition if flyTo is active
    if (this.targetCamPos && this.targetLookAt) {
      this.camera.position.lerp(this.targetCamPos, 0.04);
      this.controls.target.lerp(this.targetLookAt, 0.04);

      if (this.camera.position.distanceTo(this.targetCamPos) < 1.0) {
        this.targetCamPos = null;
        this.targetLookAt = null;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
