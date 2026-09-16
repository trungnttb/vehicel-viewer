import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const partInfo = [
  ['body', 'Thân xe', 'Chiếc áo chắc chắn bảo vệ mọi người bên trong.', 'Body', '#d5a573'],
  ['hood', 'Nắp ca-pô', 'Mở nắp ca-pô để nhìn thấy động cơ nhé!', 'Hood', '#9caeca'],
  ['roof', 'Nóc xe', 'Nóc xe che nắng, che mưa cho cả nhà.', 'Roof', '#b1a0cf'],
  ['doors', 'Cửa xe', 'Mở cửa để bước vào chuyến đi mới.', 'Doors', '#79b3ac'],
  ['wheels', 'Bánh xe', 'Bốn bánh xe lăn tròn, đưa xe đi khắp nơi.', 'Wheels', '#e5a75e'],
  ['lights', 'Đèn xe', 'Đèn giúp bác tài nhìn đường khi trời tối.', 'Lights', '#e2c257'],
  ['mirrors', 'Gương chiếu hậu', 'Bác tài nhìn gương để quan sát phía sau.', 'Mirrors', '#8aa6c3'],
  ['trunk', 'Cốp xe', 'Nơi cất vali và đồ dùng cho chuyến đi.', 'Trunk', '#c794a5'],
  ['engine', 'Động cơ', 'Động cơ tạo ra sức mạnh để xe chuyển động.', 'Engine', '#e58d70'],
  ['seats', 'Ghế ngồi', 'Ngồi ngay ngắn và nhớ thắt dây an toàn nhé!', 'Seats', '#a4b978'],
  ['steering', 'Vô lăng', 'Bác tài xoay vô lăng để điều khiển hướng đi.', 'Steering wheel', '#8eb3af'],
  ['axles', 'Trục bánh xe', 'Trục nối và đỡ các bánh xe ở hai bên.', 'Axles', '#a9a1bc'],
].map(([id, name, description, english, color]) => ({ id, name, description, english, color }));

export function createCar() {
  const root = new THREE.Group();
  const moving = [];
  const materials = {
    white: new THREE.MeshPhysicalMaterial({ color: '#edf0ed', roughness: .3, metalness: .12, clearcoat: .8 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#273e49', roughness: .19, metalness: .35 }),
    black: new THREE.MeshStandardMaterial({ color: '#20272c', roughness: .65 }),
    rubber: new THREE.MeshStandardMaterial({ color: '#25282b', roughness: .95 }),
    chrome: new THREE.MeshStandardMaterial({ color: '#c9d2d4', metalness: .83, roughness: .23 }),
    seat: new THREE.MeshStandardMaterial({ color: '#bd9675', roughness: .9 }),
    lamp: new THREE.MeshStandardMaterial({ color: '#e1f1fa', metalness: .25, roughness: .2, emissive: '#a8ceeb', emissiveIntensity: .3 }),
    red: new THREE.MeshStandardMaterial({ color: '#ca343b', roughness: .27, emissive: '#651318', emissiveIntensity: .2 }),
    engine: new THREE.MeshStandardMaterial({ color: '#57636a', roughness: .42, metalness: .5 }),
  };
  function group(id, delta) {
    const g = new THREE.Group();
    g.userData.part = id;
    root.add(g);
    moving.push({ group: g, delta: new THREE.Vector3(...delta) });
    return g;
  }
  function mesh(g, geometry, material, pos = [0,0,0], rotation = [0,0,0]) {
    const m = new THREE.Mesh(geometry, materials[material] ?? material);
    m.position.set(...pos); m.rotation.set(...rotation);
    m.castShadow = true; m.receiveShadow = true;
    m.userData.part = g.userData.part;
    g.add(m); return m;
  }
  function box(g, size, pos, mat = 'white', radius = .035, rotation) {
    return mesh(g, new RoundedBoxGeometry(...size, radius <= .02 ? 1 : 2, Math.min(radius, ...size.map(n => n / 2))), mat, pos, rotation);
  }
  function profile(g, points, depth, z, mat = 'white', bevel = .025) {
    const shape = new THREE.Shape(); shape.moveTo(...points[0]);
    for (const p of points.slice(1)) shape.lineTo(...p);
    shape.closePath();
    return mesh(g, new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, steps: 1 }), mat, [0,0,z]);
  }
  function cylinder(g, radius, depth, pos, mat, rotation = [Math.PI / 2,0,0]) {
    return mesh(g, new THREE.CylinderGeometry(radius, radius, depth, 40), mat, pos, rotation);
  }
  function fascia(g, points, x, material, thickness = .025) {
    const shape = new THREE.Shape(); shape.moveTo(...points[0]);
    for (const p of points.slice(1)) shape.lineTo(...p);
    shape.closePath();
    return mesh(g, new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: true, bevelThickness: .012, bevelSize: .014, bevelSegments: 2, steps: 1 }), material, [x,0,0], [0,-Math.PI/2,0]);
  }
  const body = group('body', [0,0,0]);
  box(body, [3.85,.16,1.5], [0,.53,0], 'black');
  box(body, [2.35,.12,1.68], [0,.64,0]);
  // Side panels with true wheel openings, rather than wheels buried in a box.
  for (const sign of [-1,1]) {
    const shape = new THREE.Shape();
    shape.moveTo(-2.2,.57); shape.lineTo(-2.2,.97); shape.quadraticCurveTo(-2.1,1.14,-1.78,1.16);
    shape.lineTo(-.78,1.22); shape.lineTo(1.17,1.23); shape.lineTo(2.03,1.14);
    shape.quadraticCurveTo(2.23,1.08,2.22,.86); shape.lineTo(2.22,.57); shape.lineTo(1.92,.57);
    shape.absarc(1.4,.5,.52,.14,Math.PI-.14,false);
    shape.lineTo(-.88,.57); shape.absarc(-1.4,.5,.52,.14,Math.PI-.14,false); shape.lineTo(-2.2,.57);
    mesh(body, new THREE.ExtrudeGeometry(shape, { depth: .12, bevelEnabled: true, bevelThickness: .04, bevelSize: .035, bevelSegments: 3, steps: 1 }), 'white', [0,0,sign > 0 ? .73 : -.85]);
    box(body, [1.8,.09,.08], [0,.57,sign*.87], 'chrome');
  }
  box(body, [.29,.36,1.64], [-2.09,.68,0], 'white', .12);
  box(body, [.28,.38,1.64], [2.12,.72,0], 'white', .10);
  box(body, [.04,.12,1.17], [-2.239,.55,0], 'black');
  // Broad dark cascading grille with chrome lattice, inspired by the facelift Accent.
  fascia(body, [[-.64,1.11],[.64,1.11],[.62,.94],[.46,.68],[-.46,.68],[-.62,.94]],-2.25,'chrome');
  fascia(body, [[-.59,1.07],[.59,1.07],[.57,.94],[.43,.72],[-.43,.72],[-.57,.94]],-2.278,'black');
  for (let y=0; y<4; y++) for (let z=0; z<9; z++) {
    if (y === 0 && (z === 0 || z === 8)) continue;
    box(body, [.015,.017,.066], [-2.313,.78+y*.075,-.46+z*.115], 'chrome', .004, [Math.PI/7,0,0]);
  }
  const badge = mesh(body, new THREE.TorusGeometry(.065,.009,8,32), 'chrome', [-2.322,1.02,0], [0,Math.PI/2,0]); badge.scale.y = .53;
  box(body, [.025,.065,.014], [-2.335,1.02,0], 'chrome', .002, [.3,0,0]);
  box(body, [.027,.12,.39], [-2.323,.7,0], 'white', .015);
  box(body, [.027,.12,.39], [2.262,.83,0], 'white', .015);
  for (const s of [-1,1]) {
    box(body, [.05,.14,.18], [-2.23,.64,s*.69], 'black');
    box(body, [.06,.025,.16], [-2.26,.68,s*.69], 'lamp');
    box(body, [.027,.045,.28], [2.254,.62,s*.56], 'red');
  }
  const hood = group('hood', [-.65,1.05,0]);
  profile(hood, [[-2.15,1.13],[-2.04,1.19],[-1.25,1.28],[-.8,1.31],[-.75,1.23]],1.49,-.745);
  for (const s of [-1,1]) box(hood, [1.01,.014,.024], [-1.45,1.263,s*.49], 'white', .006, [0,0,.075]);
  const trunk = group('trunk', [.8,.9,0]);
  profile(trunk, [[1.18,1.24],[1.53,1.29],[2.12,1.19],[2.16,1.12]],1.48,-.74);
  const roof = group('roof', [0,1.65,0]);
  profile(roof, [[-.42,1.89],[-.3,1.97],[.04,2.015],[.54,2.005],[.78,1.96],[.9,1.89],[.7,1.88],[-.38,1.86]],1.30,-.65);
  // Windshield and rear screen span the cabin, with white structural pillars.
  profile(roof, [[-.84,1.29],[-.39,1.89],[-.34,1.88],[-.79,1.28]],1.38,-.69,'glass',.008);
  profile(roof, [[.84,1.91],[1.47,1.29],[1.42,1.27],[.8,1.87]],1.37,-.685,'glass',.008);
  for (const s of [-1,1]) {
    profile(roof, [[-.91,1.27],[-.41,1.95],[-.31,1.94],[-.78,1.27]],.05,s*.72,'white',.015);
    profile(roof, [[.76,1.95],[1.51,1.25],[1.29,1.24],[.65,1.9]],.065,s*.7,'white',.02);
  }
  for (const s of [-1,1]) {
    const doors = group('doors', [0,.2,s*1.05]);
    const z = s > 0 ? .814 : -.862;
    profile(doors, [[-.79,.69],[-.79,1.27],[.03,1.27],[.03,.68]],.048,z,'white',.018);
    profile(doors, [[.085,.68],[.085,1.27],[1.08,1.25],[.83,.72]],.048,z,'white',.018);
    profile(doors, [[-.74,1.31],[-.33,1.87],[.015,1.87],[.015,1.31]],.025,s*.744,'glass',.008);
    profile(doors, [[.09,1.31],[.09,1.88],[.68,1.89],[1.18,1.31]],.025,s*.744,'glass',.008);
    box(doors, [.055,.61,.055], [.05,1.59,s*.76], 'black', .008);
    box(doors, [1.92,.035,.055], [.16,1.29,s*.79], 'chrome', .009);
    for (const x of [-.13,.79]) box(doors, [.19,.034,.045], [x,1.15,s*.886], 'chrome', .012);
    const mirror = group('mirrors', [-.2,.35,s*1.15]);
    box(mirror, [.15,.06,.2], [-.72,1.34,s*.85], 'black');
    box(mirror, [.23,.13,.23], [-.7,1.39,s*1.0], 'white', .05);
    box(mirror, [.025,.083,.15], [-.575,1.39,s*1.015], 'chrome', .02);
  }
  for (const x of [-1.4,1.4]) for (const s of [-1,1]) {
    const wheel = group('wheels', [x*.22,0,s*.95]);
    const z = s*.85;
    wheel.userData.wheelCenter = new THREE.Vector3(x,.47,z);
    cylinder(wheel,.435,.245,[x,.47,z],'rubber');
    // Sidewall rings, machined rim and five paired spokes.
    for (const side of [-1,1]) {
      const outer = z+side*.126;
      mesh(wheel,new THREE.TorusGeometry(.335,.012,8,48),'black',[x,.47,outer]);
      cylinder(wheel,.288,.018,[x,.47,outer],'chrome');
      cylinder(wheel,.24,.022,[x,.47,outer+side*.012],'black');
      for (let i=0;i<5;i++) for (const offset of [-.09,.09]) {
        const a = i*Math.PI*2/5+offset;
        box(wheel,[.035,.19,.026],[x+Math.sin(a)*.143,.47+Math.cos(a)*.143,outer+side*.029],'chrome',.006,[0,0,-a]);
      }
      cylinder(wheel,.069,.045,[x,.47,outer+side*.024],'chrome');
      for (let i=0;i<5;i++) cylinder(wheel,.012,.048,[x+Math.sin(i*1.256)*.046,.47+Math.cos(i*1.256)*.046,outer+side*.028],'black');
    }
    for (let i=0;i<44;i++) {
      const a=i*Math.PI*2/44;
      box(wheel,[.018,.012,.21],[x+Math.sin(a)*.436,.47+Math.cos(a)*.436,z],'black',.003,[0,0,-a]);
    }
  }
  const lights = group('lights', [-.7,.35,0]);
  for (const s of [-1,1]) {
    const lampPoints = [[s*.57,1.105],[s*.83,1.195],[s*.88,1.15],[s*.82,1.045],[s*.62,1.04]];
    fascia(lights,lampPoints,-2.23,'chrome',.03);
    fascia(lights,lampPoints.map(([z,y])=>[s*.73+(z-s*.73)*.85,1.115+(y-1.115)*.64]),-2.272,'lamp',.015);
    box(lights,[.38,.032,.068],[-2.05,1.08,s*.805],'lamp',.012,[0,0,.13]);
    box(lights,[.15,.14,.43],[2.14,1.08,s*.59],'red',.045);
    box(lights,[.32,.1,.06],[2.0,1.085,s*.83],'red',.025);
    box(lights,[.13,.025,.3],[2.154,1.085,s*.59],'lamp',.01);
  }
  const engine = group('engine', [-.9,.4,0]);
  box(engine,[.77,.36,1.0],[-1.38,.92,0],'engine',.055);
  box(engine,[.64,.07,.68],[-1.4,1.13,0],'black',.04);
  for (let i=0;i<4;i++) box(engine,[.4,.027,.044],[-1.4,1.18,-.22+i*.14],'chrome',.008);
  box(engine,[.32,.29,.24],[-1.44,.97,.63],'black');
  box(engine,[.08,.03,.07],[-1.44,1.13,.64],'red');
  const capMaterial = new THREE.MeshStandardMaterial({color:'#f4c35b'});
  cylinder(engine,.055,.03,[-1.65,1.19,.17],capMaterial,[0,0,0]);
  const seats = group('seats', [.25,.5,0]);
  for (const x of [-.27,.7]) for (const z of [-.39,.39]) {
    box(seats,[.47,.16,.5],[x,.8,z],'seat',.07);
    box(seats,[.12,.53,.49],[x+.2,1.08,z],'seat',.065,[0,0,-.12]);
    box(seats,[.12,.18,.27],[x+.24,1.41,z],'seat',.04);
    box(seats,[.018,.42,.025],[x+.12,1.08,z+.1],'black',.005,[0,0,-.12]);
  }
  const steering = group('steering', [-.4,.6,.25]);
  box(steering,[.25,.18,1.33],[-.65,1.11,0],'black',.045);
  box(steering,[.035,.13,.23],[-.507,1.23,0],'glass',.012);
  const wheel = mesh(steering,new THREE.TorusGeometry(.155,.022,12,40),'black',[-.42,1.27,.4],[0,Math.PI/2-.28,0]);
  cylinder(steering,.056,.065,[-.42,1.27,.4],'chrome',[0,0,Math.PI/2]);
  for(let i=0;i<3;i++) {
    const a=i*Math.PI*2/3;
    box(steering,[.025,.15,.021],[-.42,1.27+Math.cos(a)*.06,.4+Math.sin(a)*.06],'black',.005,[a,0,0]);
  }
  const axles = group('axles', [0,.1,0]);
  for (const x of [-1.4,1.4]) {
    cylinder(axles,.052,1.65,[x,.47,0],'engine');
    for (const z of [-.6,.6]) cylinder(axles,.077,.25,[x,.62,z],'chrome',[0,0,0]);
  }
  // Lower the beltline/cabin to sedan proportions without flattening round wheels.
  // Bake local transforms first so connected panels share the same shaping function.
  const sedanHeight = y => y <= .98 ? y * .84 : .8232 + (y - .98) * .62;
  for (const { group } of moving) {
    const batches = new Map();
    for (const obj of [...group.children]) {
      obj.updateMatrix();
      let geometry = obj.geometry.clone().applyMatrix4(obj.matrix);
      if (geometry.index) { const indexed = geometry; geometry = indexed.toNonIndexed(); indexed.dispose(); }
      const position = geometry.attributes.position;
      const center = group.userData.wheelCenter;
      for (let i = 0; i < position.count; i++) {
        let x = position.getX(i), y = position.getY(i), z = position.getZ(i);
        if (center) {
          x = center.x + (x-center.x)*.84;
          y = sedanHeight(center.y) + (y-center.y)*.84;
          z = center.z + (z-center.z)*.94;
        } else {
          // Pull the shoulder inward toward the nose/tail for a less box-like body.
          const taper = 1 - Math.max(0,Math.abs(x)-1.7)*.065;
          z *= taper;
          y = sedanHeight(y);
        }
        position.setXYZ(i,x,y,z);
      }
      geometry.computeVertexNormals();
      geometry.clearGroups();
      if (!batches.has(obj.material)) batches.set(obj.material,[]);
      batches.get(obj.material).push(geometry);
      group.remove(obj); obj.geometry.dispose();
    }
    // Merge only within one moving group/material: picking and independent movement survive.
    for (const [material, geometries] of batches) {
      const geometry = mergeGeometries(geometries);
      for (const source of geometries) source.dispose();
      const merged = mesh(group,geometry,material.clone());
      merged.userData.originalEmissive = merged.material.emissive.clone();
    }
  }
  const bounds = new THREE.Box3().setFromObject(root);
  return {
    root,
    bounds,
    explode(amount) { for (const {group,delta} of moving) group.position.copy(delta).multiplyScalar(THREE.MathUtils.clamp(amount,0,1)); },
    select(id) {
      root.traverse(obj => {
        if (!obj.isMesh || !obj.material.emissive) return;
        obj.material.emissive.copy(obj.userData.originalEmissive);
        if (id && obj.userData.part === id) obj.material.emissive.set('#914019');
      });
    },
  };
}
