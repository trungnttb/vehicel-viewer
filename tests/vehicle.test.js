import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Vector3 } from 'three';
import { createCar, partInfo } from '../src/car.js';
import { createTapTracker } from '../src/tap-tracker.js';
import { audioMessages } from '../src/audio-messages.js';
import { statSync } from 'node:fs';

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
  for(const id of [...partInfo.map(p=>p.id),...Object.keys(audioMessages)]) {
    const asset=new URL(`../public/audio/vi/${id}.m4a`,import.meta.url);
    assert.ok(statSync(asset).size>1000,`missing or empty audio: ${id}`);
  }
});
