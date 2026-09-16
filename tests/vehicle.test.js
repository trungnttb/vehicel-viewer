import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Vector3, PerspectiveCamera } from 'three';
import { createCar, partInfo } from '../src/car.js';
import { createTapTracker } from '../src/tap-tracker.js';
import { audioMessages } from '../src/audio-messages.js';
import { statSync } from 'node:fs';
import { vehicles, allParts, vehicleById } from '../src/vehicle-catalog.js';
import { illustratedPartIds } from '../src/part-illustrations.js';
import { fittingFov } from '../src/camera-fit.js';

test('sedan silhouette, grounded wheels, and complete pickable part coverage', () => {
  const car=createCar();
  const size=car.bounds.getSize(new Vector3());
  assert.ok(size.y/size.x<.36, 'sedan should not have SUV-like height');
  assert.ok(car.bounds.min.y>=0 && car.bounds.min.y<.05, 'tires sit just above the floor');
  const found=new Set(); let triangles=0;
  car.root.traverse(mesh=>{
    if(!mesh.isMesh) return;
    found.add(mesh.userData.part);
    triangles+=mesh.geometry.attributes.position.count/3;
    for(const n of mesh.geometry.attributes.position.array) assert.ok(Number.isFinite(n));
  });
  assert.deepEqual([...found].sort(),partInfo.map(p=>p.id).sort());
  assert.ok(triangles<100000, 'avoid accidental detail explosion on the reference sedan');
  for(const group of car.root.children.filter(g=>g.userData.part==='wheels')) {
    const wheelSize=new Box3().setFromObject(group).getSize(new Vector3());
    assert.ok(Math.abs(wheelSize.x-wheelSize.y)<.01, 'round tires must not be flattened with the cabin');
  }
});

test('repeated separation, clamping and reset do not drift; highlight restores lights', () => {
  const car=createCar();
  const originals=new Map();car.root.traverse(m=>{if(m.isMesh) originals.set(m,m.material.emissive.getHex());});
  car.explode(1);car.root.updateMatrixWorld(true);
  const expanded=car.root.children.map(g=>g.position.clone());
  car.explode(2);
  car.root.children.forEach((g,i)=>assert.ok(g.position.equals(expanded[i])));
  for(let i=0;i<6;i++) {car.explode(.4);car.explode(1);car.explode(0);}
  for(const group of car.root.children) assert.equal(group.position.length(),0);
  car.explode(-1);for(const group of car.root.children) assert.equal(group.position.length(),0);
  car.select('lights');car.select('wheels');car.select(null);
  for(const [mesh,color] of originals) assert.equal(mesh.material.emissive.getHex(),color);
});

const event=(id,x,y,time,type='touch')=>({pointerId:id,clientX:x,clientY:y,timeStamp:time,pointerType:type});
test('tap tolerates finger jitter but rejects drag away-and-back and long press', () => {
  const t=createTapTracker();
  t.down(event(1,10,10,0));assert.equal(t.up(event(1,16,15,200)),true);
  t.down(event(1,10,10,300));t.move(event(1,70,10,350));t.move(event(1,10,10,400));assert.equal(t.up(event(1,10,10,450)),false);
  t.down(event(1,10,10,500));assert.equal(t.up(event(1,10,10,1500)),false);
});
test('pinch releases and cancellation never select; next genuine tap still works', () => {
  const t=createTapTracker();
  t.down(event(1,10,10,0));t.down(event(2,50,50,20));
  assert.equal(t.up(event(2,50,50,100)),false);assert.equal(t.up(event(1,10,10,120)),false);
  t.down(event(1,10,10,200));t.cancel(event(1,10,10,240));assert.equal(t.up(event(1,10,10,260)),false);
  t.down(event(3,10,10,300));assert.equal(t.up(event(3,10,10,360)),true);
  t.down(event(4,10,10,400));t.clear();assert.equal(t.up(event(4,10,10,450)),false);
});
test('every part and spoken action has a bundled non-empty audio asset', () => {
  for(const id of [...allParts.map(p=>p.id),...Object.keys(audioMessages)]) {
    const asset=new URL(`../public/audio/vi/${id}.m4a`,import.meta.url);
    assert.ok(statSync(asset).size>1000,`missing or empty audio: ${id}`);
  }
});

test('catalog routes are exact and all semantic parts have recognizable illustrations', () => {
  assert.equal(vehicles.length,7);
  assert.equal(vehicleById('unknown'),undefined);
  assert.equal(vehicleById('truck-extra'),undefined);
  assert.equal(new Set(vehicles.map(v=>v.id)).size,vehicles.length);
  for(const part of allParts) assert.ok(illustratedPartIds.includes(part.id),`missing picture: ${part.id}`);
  const spokenNames=new Map();
  for(const v of vehicles)for(const p of v.parts) {
    if(spokenNames.has(p.id))assert.equal(spokenNames.get(p.id),p.name,`audio ID collision: ${p.id}`);
    spokenNames.set(p.id,p.name);
  }
});
for(const vehicle of vehicles.filter(v=>v.id!=='accent')) {
  test(`${vehicle.id}: metadata matches geometry, separation restores and stays within an iPad-sized model budget`,()=>{
    const model=vehicle.factory();const ids=new Set();let triangles=0;
    model.root.traverse(mesh=>{
      if(!mesh.isMesh)return;
      ids.add(mesh.userData.part);triangles+=mesh.geometry.attributes.position.count/3;
      for(const value of mesh.geometry.attributes.position.array)assert.ok(Number.isFinite(value));
    });
    assert.deepEqual([...ids].sort(),vehicle.parts.map(p=>p.id).sort());
    assert.ok(triangles<100000);
    const assembled=new Box3().setFromObject(model.root);
    assert.ok(assembled.min.y>=-.01,'model must not sink under the floor');
    for(let i=0;i<3;i++){model.explode(1);model.explode(.5);model.explode(0);}
    const restored=new Box3().setFromObject(model.root);
    assert.ok(assembled.min.distanceTo(restored.min)<1e-6);
    assert.ok(assembled.max.distanceTo(restored.max)<1e-6);
    model.select(vehicle.parts[0].id);model.select(null);
    model.root.traverse(mesh=>{if(mesh.isMesh)assert.ok(mesh.material.emissive.equals(mesh.userData.originalEmissive));});
  });
}

test('all vehicles remain in frame when fully separated at closest zoom',()=>{
  for(const vehicle of vehicles) {
    const model=vehicle.factory();
    const center=model.bounds.getCenter(new Vector3());center.y+=.2;
    model.explode(1);const bounds=new Box3().setFromObject(model.root);
    for(const aspect of [.85,1.5,2])for(const direction of [[-1,.42,1],[0,.22,1],[-.12,1,.12]]) {
      const camera=new PerspectiveCamera(36,aspect,.1,100);
      camera.position.copy(center).addScaledVector(new Vector3(...direction).normalize(),6.6);
      camera.lookAt(center);
      camera.fov=fittingFov(bounds,camera,36);camera.updateProjectionMatrix();
      for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]) {
        const point=new Vector3(x,y,z).project(camera);
        assert.ok(Math.abs(point.x)<.89 && Math.abs(point.y)<.89,`${vehicle.id} clips at aspect ${aspect}`);
      }
    }
  }
});

test('driving controls match the vehicle type and crane hook clears the cabin throughout separation',()=>{
  for(const v of vehicles)assert.ok(v.parts.some(p=>p.id===(v.id==='excavator'?'joysticks':'steering')),`${v.id} needs driving controls`);
  const crane=vehicleById('crane').factory();
  const cabin=crane.root.children.find(g=>g.userData.part==='cabin');
  const hook=crane.root.children.find(g=>g.userData.part==='hook');
  for(const amount of [0,.25,.5,.75,1]) {
    crane.explode(amount);crane.root.updateMatrixWorld(true);
    const cabinBounds=new Box3().setFromObject(cabin),hookBounds=new Box3().setFromObject(hook);
    assert.ok(hookBounds.max.x<cabinBounds.min.x-.2,'hook must hang forward of the cab, with visible clearance');
    assert.equal(hookBounds.intersectsBox(cabinBounds),false);
  }
});
