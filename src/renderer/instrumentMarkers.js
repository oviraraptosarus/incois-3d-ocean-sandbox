import * as THREE from 'three';

export class InstrumentMarkers {
  constructor(sceneGroup, camera, domElement, onSelectArgo, onSelectGlider) {
    this.sceneGroup = sceneGroup;
    this.camera = camera;
    this.domElement = domElement;
    this.onSelectArgo = onSelectArgo;
    this.onSelectGlider = onSelectGlider;

    this.group = new THREE.Group();
    this.sceneGroup.add(this.group);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.clickableObjects = [];

    this.setupEvents();
  }

  // Geographic projection: [Lat 0..25 -> Z -75..75, Lon 50..95 -> X -100..100, Depth 0..2000 -> Y 0..-40]
  projectCoord(lat, lon, depth = 0) {
    const x = ((lon - 50.0) / 45.0 - 0.5) * 200.0;
    const z = -((lat - 0.0) / 25.0 - 0.5) * 150.0;
    const y = -(depth / 2000.0) * 40.0;
    return new THREE.Vector3(x, y, z);
  }

  loadInstruments(argoList = [], gliderList = []) {
    // Clear existing
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
    this.clickableObjects = [];

    // 1. ARGO PROFILING FLOATS
    const argoSphereGeo = new THREE.SphereGeometry(3.0, 16, 16);
    const argoBeaconGeo = new THREE.CylinderGeometry(0.4, 0.4, 4.0, 8);

    argoList.forEach((argo) => {
      const surfacePos = this.projectCoord(argo.latitude, argo.longitude, 0);
      const floatGroup = new THREE.Group();
      floatGroup.position.copy(surfacePos);

      // Yellow/Amber buoyant hull
      const hullMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.5,
      });
      const hullMesh = new THREE.Mesh(argoSphereGeo, hullMat);
      hullMesh.userData = { type: 'ARGO', data: argo };
      floatGroup.add(hullMesh);
      this.clickableObjects.push(hullMesh);

      // Antenna beacon on top
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const beaconMesh = new THREE.Mesh(argoBeaconGeo, beaconMat);
      beaconMesh.position.set(0, 2.5, 0);
      floatGroup.add(beaconMesh);

      // Depth Plumbline extending down to 2000m (-40 units)
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -40, 0),
      ]);
      const lineMat = new THREE.LineDashedMaterial({
        color: 0xf59e0b,
        opacity: 0.5,
        transparent: true,
        dashSize: 2,
        gapSize: 1,
      });
      const plumbline = new THREE.Line(lineGeo, lineMat);
      plumbline.computeLineDistances();
      floatGroup.add(plumbline);

      // Discrete profile sample depth markers (little dots along plumbline)
      argo.profile.forEach((pt) => {
        const yOffset = -(pt.depth / 2000.0) * 40.0;
        const ptGeo = new THREE.SphereGeometry(0.8, 8, 8);
        const ptMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const ptMesh = new THREE.Mesh(ptGeo, ptMat);
        ptMesh.position.set(0, yOffset, 0);
        floatGroup.add(ptMesh);
      });

      floatGroup.userData = { type: 'ARGO', data: argo };
      this.group.add(floatGroup);
    });

    // 2. UNDERWATER GLIDER MISSIONS (Sawtooth Dives)
    gliderList.forEach((glider) => {
      const gliderGroup = new THREE.Group();
      const points = glider.waypoints.map((w) => this.projectCoord(w.latitude, w.longitude, w.depth));

      if (points.length >= 2) {
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeo = new THREE.TubeGeometry(curve, 96, 1.2, 8, false);
        const tubeMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x0891b2,
          emissiveIntensity: 0.7,
          roughness: 0.3,
          metalness: 0.6,
        });

        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        tubeMesh.userData = { type: 'GLIDER', data: glider };
        gliderGroup.add(tubeMesh);
        this.clickableObjects.push(tubeMesh);

        // Waypoint markers
        points.forEach((pt, idx) => {
          const wpGeo = new THREE.SphereGeometry(1.5, 8, 8);
          const wpMat = new THREE.MeshBasicMaterial({ color: 0xa5f3fc });
          const wpMesh = new THREE.Mesh(wpGeo, wpMat);
          wpMesh.position.copy(pt);
          wpMesh.userData = { type: 'GLIDER', data: glider, waypointIdx: idx };
          gliderGroup.add(wpMesh);
          this.clickableObjects.push(wpMesh);
        });
      }

      gliderGroup.userData = { type: 'GLIDER', data: glider };
      this.group.add(gliderGroup);
    });
  }

  setupEvents() {
    this.domElement.addEventListener('pointerdown', (e) => {
      // Only process primary left button clicks
      if (e.button !== 0) return;

      const rect = this.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hits = this.raycaster.intersectObjects(this.clickableObjects);

      if (hits.length > 0) {
        const target = hits[0].object.userData;
        if (target.type === 'ARGO' && this.onSelectArgo) {
          this.onSelectArgo(target.data);
        } else if (target.type === 'GLIDER' && this.onSelectGlider) {
          this.onSelectGlider(target.data);
        }
      }
    });

    // Hover cursor change
    this.domElement.addEventListener('pointermove', (e) => {
      const rect = this.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hits = this.raycaster.intersectObjects(this.clickableObjects);
      this.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'default';
    });
  }

  setVisible(showArgo, showGliders) {
    this.group.children.forEach((child) => {
      if (child.userData?.type === 'ARGO') child.visible = showArgo;
      if (child.userData?.type === 'GLIDER') child.visible = showGliders;
    });
  }
}
