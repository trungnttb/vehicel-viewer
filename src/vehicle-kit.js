import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Shared primitives only; each vehicle owns its silhouette and semantic groups.
export function vehicleKit(color) {
  const root=new THREE.Group(), groups=[];
  const palette={paint:color,white:'#edf1ed',dark:'#303e45',rubber:'#293033',glass:'#416a7a',metal:'#b0bec1',light:'#f9df8f',red:'#d56c52',blue:'#64a8ca',seat:'#b6a085',yellow:'#e8b64c'};
  const materials=Object.fromEntries(Object.entries(palette).map(([key,value])=>[key,new THREE.MeshStandardMaterial({color:value,roughness:key==='metal'?.3:.52,metalness:key==='metal'?.65:.06})]));
  function group(id,delta=[0,0,0]) {
    const g=new THREE.Group();g.userData.part=id;root.add(g);groups.push({g,delta:new THREE.Vector3(...delta)});return g;
  }
  function mesh(g,geometry,material='paint',position=[0,0,0],rotation=[0,0,0]) {
    const m=new THREE.Mesh(geometry,materials[material]??material);
    m.position.set(...position);m.rotation.set(...rotation);m.userData.part=g.userData.part;
    m.castShadow=true;m.receiveShadow=true;g.add(m);return m;
  }
  function box(g,size,position,material='paint',radius=.05,rotation) {
    return mesh(g,new RoundedBoxGeometry(...size,1,Math.min(radius,...size.map(v=>v/2))),material,position,rotation);
  }
  function cylinder(g,radius,length,position,material='metal',rotation=[Math.PI/2,0,0]) {
    return mesh(g,new THREE.CylinderGeometry(radius,radius,length,24),material,position,rotation);
  }
  function beam(g,from,to,width,depth,material='paint') {
    const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),d=b.clone().sub(a);
    const m=box(g,[width,d.length(),depth],a.clone().add(b).multiplyScalar(.5).toArray(),material);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;
  }
  function profile(g,points,depth,z,material='paint') {
    const s=new THREE.Shape();s.moveTo(...points[0]);for(const p of points.slice(1))s.lineTo(...p);s.closePath();
    return mesh(g,new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:1,steps:1}),material,[0,0,z]);
  }
  function wheel(x,z,r=.43) {
    const g=group('wheels',[x<0?-.2:.2,0,Math.sign(z)*.8]);
    cylinder(g,r,.25,[x,r+.035,z],'rubber');
    cylinder(g,r*.63,.27,[x,r+.035,z],'metal');
    cylinder(g,r*.25,.29,[x,r+.035,z],'dark');
    for(let i=0;i<6;i++) {
      const angle=i*Math.PI/3;
      cylinder(g,.035,.3,[x+Math.sin(angle)*r*.44,r+.035+Math.cos(angle)*r*.44,z],'dark');
    }
    return g;
  }
  function truckBase({length=4.8,cabX=-1.6,colorMaterial='paint',rearAxles=[1.1],cabWidth=1.55}) {
    const chassis=group('body');
    box(chassis,[length,.18,1.34],[0,.65,0],'dark');
    box(chassis,[length-.3,.13,1.56],[0,.82,0],'paint');
    for(const x of [cabX,...rearAxles]) for(const s of [-1,1]) wheel(x,s*.86);
    const cabin=group('cabin',[-.45,.95,0]);
    // Floor, nose, rear wall and roof leave a genuinely hollow cab.
    box(cabin,[1.28,.15,cabWidth],[cabX,.98,0],colorMaterial);
    box(cabin,[.2,.62,cabWidth],[cabX-.6,1.3,0],colorMaterial,.075);
    box(cabin,[.1,1.03,cabWidth],[cabX+.58,1.53,0],colorMaterial);
    box(cabin,[1.3,.13,cabWidth+.03],[cabX,2.08,0],colorMaterial);
    box(cabin,[.07,.5,cabWidth-.12],[cabX-.67,1.8,0],'glass',.025,[0,0,-.12]);
    for(const s of [-1,1]) {
      const doors=group('doors',[-.12,.15,s*.92]);
      box(doors,[1.12,.5,.055],[cabX,1.3,s*cabWidth/2],colorMaterial);
      box(doors,[.97,.52,.04],[cabX+.02,1.82,s*cabWidth/2],'glass');
      box(doors,[.17,.025,.035],[cabX+.32,1.48,s*(cabWidth/2+.04)],'metal');
      const mirrors=group('mirrors',[-.2,.3,s*.9]);
      box(mirrors,[.07,.05,.25],[cabX-.53,1.8,s*.9],'dark');
      box(mirrors,[.12,.23,.12],[cabX-.53,1.86,s*1.04],'dark');
      box(mirrors,[.02,.17,.1],[cabX-.455,1.86,s*1.04],'metal');
    }
    box(cabin,[.04,.25,.75],[cabX-.715,1.35,0],'dark');
    for(let i=0;i<3;i++) box(cabin,[.05,.022,.68],[cabX-.74,1.27+i*.07,0],'metal');
    box(chassis,[.16,.14,1.62],[cabX-.69,.91,0],'metal');
    const lamps=group('lights',[-.5,.15,0]);
    for(const s of [-1,1]) {
      box(lamps,[.06,.13,.22],[cabX-.72,1.09,s*.57],'light');
      box(lamps,[.07,.12,.21],[length/2,.8,s*.61],'red');
    }
    const engine=group('engine',[-.75,.2,0]);box(engine,[.6,.4,.68],[cabX,.98,0],'metal');
    for(let i=0;i<4;i++)box(engine,[.37,.04,.045],[cabX,1.2,-.2+i*.13],'dark');
    const seats=group('seats',[0,.6,0]);
    for(const s of [-1,1]) {box(seats,[.42,.13,.4],[cabX,1.17,s*.37],'seat');box(seats,[.12,.5,.4],[cabX+.17,1.43,s*.37],'seat');}
    const steering=group('steering',[-.55,.55,.25]);
    box(steering,[.23,.15,1.25],[cabX-.4,1.45,0],'dark');
    box(steering,[.035,.1,.2],[cabX-.27,1.55,-.04],'glass');
    beam(steering,[cabX-.43,1.39,.36],[cabX-.2,1.61,.36],.055,.055,'metal');
    mesh(steering,new THREE.TorusGeometry(.16,.024,10,32),'dark',[cabX-.2,1.61,.36],[0,Math.PI/2-.35,0]);
    cylinder(steering,.055,.06,[cabX-.2,1.61,.36],'metal',[0,0,Math.PI/2]);
    for(let i=0;i<3;i++) {
      const angle=i*Math.PI*2/3;
      beam(steering,[cabX-.2,1.61,.36],[cabX-.2,1.61+Math.cos(angle)*.14,.36+Math.sin(angle)*.14],.019,.019,'dark');
    }
    return {chassis,cabin,cabX};
  }
  function finish() {
    for(const {g} of groups) {
      const batches=new Map();
      for(const m of [...g.children]) {
        m.updateMatrix();let geometry=m.geometry.clone().applyMatrix4(m.matrix);
        if(geometry.index){const indexed=geometry;geometry=indexed.toNonIndexed();indexed.dispose();}
        geometry.clearGroups();
        if(!batches.has(m.material))batches.set(m.material,[]);batches.get(m.material).push(geometry);
        g.remove(m);m.geometry.dispose();
      }
      for(const [material,geometries] of batches) {
        const geometry=mergeGeometries(geometries);for(const source of geometries)source.dispose();
        const m=mesh(g,geometry,material.clone());m.userData.originalEmissive=m.material.emissive.clone();
      }
    }
    Object.values(materials).forEach(m=>m.dispose());
    const size=new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
    root.scale.setScalar(4.9/Math.max(size.x,size.z,size.y));
    const bounds=new THREE.Box3().setFromObject(root);
    return {
      root,bounds,
      explode(amount){for(const {g,delta} of groups)g.position.copy(delta).multiplyScalar(THREE.MathUtils.clamp(amount,0,1));},
      select(id){root.traverse(m=>{if(m.isMesh){m.material.emissive.copy(m.userData.originalEmissive);if(m.userData.part===id)m.material.emissive.set('#784721');}});},
    };
  }
  return {root,group,mesh,box,cylinder,beam,profile,wheel,truckBase,finish};
}
