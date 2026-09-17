import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Vector3, PerspectiveCamera, Spherical } from 'three';
import { createCar, partInfo } from '../src/car.js';
import { createTapTracker } from '../src/tap-tracker.js';
import { audioMessages } from '../src/audio-messages.js';
import { statSync } from 'node:fs';
import { vehicles, allParts, vehicleById, separationSpread } from '../src/vehicle-catalog.js';
import { illustratedPartIds } from '../src/part-illustrations.js';
import { safeFrame, maxSeparationShrink, outlineSamples, outlinePoints, outlineFov, restingFraming } from '../src/camera-fit.js';

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
  assert.equal(vehicles.length,18);
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

function projectedExtent(model,camera) {
  camera.updateProjectionMatrix();camera.updateMatrixWorld();model.root.updateMatrixWorld(true);
  const point=new Vector3();const extent={left:Infinity,right:-Infinity,bottom:Infinity,top:-Infinity};
  model.root.traverse(mesh=>{
    if(!mesh.isMesh) return;
    const position=mesh.geometry.attributes.position;
    for(let i=0;i<position.count;i++) {
      point.fromBufferAttribute(position,i).applyMatrix4(mesh.matrixWorld).project(camera);
      extent.left=Math.min(extent.left,point.x);extent.right=Math.max(extent.right,point.x);
      extent.bottom=Math.min(extent.bottom,point.y);extent.top=Math.max(extent.top,point.y);
    }
  });
  return extent;
}
const insideSafeFrame=extent=>extent.left>=safeFrame.left-1e-6&&extent.right<=safeFrame.right+1e-6&&extent.bottom>=safeFrame.bottom-1e-6&&extent.top<=safeFrame.top+1e-6;
const restOffset=new Vector3(-6.5,2.7,7.5);
function framingPoints(model) {
  const samples=outlineSamples(model.root);
  model.explode(0);const assembled=outlinePoints(samples).map(point=>point.clone());
  model.explode(separationSpread);const separated=outlinePoints(samples).map(point=>point.clone());
  model.explode(0);
  return {samples,assembled,separated};
}
const lensScale=fov=>Math.tan(fov*Math.PI/360);

test('assembled vehicles fill the viewer without leaving the safe frame while orbiting',()=>{
  for(const vehicle of vehicles) {
    const model=vehicle.factory();const {assembled,separated}=framingPoints(model);
    for(const aspect of [.92,1.51,1.72]) {
      const camera=new PerspectiveCamera(36,aspect,.1,100);
      const {targetY,fov}=restingFraming(assembled,separated,model.bounds,camera,restOffset);
      const center=model.bounds.getCenter(new Vector3());const target=new Vector3(center.x,targetY,center.z);
      const orbit=new Spherical().setFromVector3(restOffset);let widest=0;
      for(let i=0;i<8;i++) {
        const step=orbit.clone();step.theta+=i/8*Math.PI*2+.1;
        camera.position.setFromSpherical(step).add(target);camera.lookAt(target);camera.fov=fov;
        const extent=projectedExtent(model,camera);
        assert.ok(insideSafeFrame(extent),`${vehicle.id} leaves the safe frame at aspect ${aspect}`);
        widest=Math.max(widest,(extent.right-extent.left)/(safeFrame.right-safeFrame.left),(extent.top-extent.bottom)/(safeFrame.top-safeFrame.bottom));
      }
      assert.ok(widest>.6,`${vehicle.id} only fills ${Math.round(widest*100)}% of the viewer at aspect ${aspect}`);
    }
  }
});

test('separated vehicles stay in frame and shrink only a little when parts move apart',()=>{
  for(const vehicle of vehicles) {
    const model=vehicle.factory();const {samples,assembled,separated}=framingPoints(model);
    for(const aspect of [.85,1.5,2]) {
      const {targetY,fov}=restingFraming(assembled,separated,model.bounds,new PerspectiveCamera(36,aspect,.1,100),restOffset);
      const center=model.bounds.getCenter(new Vector3());const target=new Vector3(center.x,targetY,center.z);
      for(const [direction,distance] of [[restOffset.toArray(),restOffset.length()],[[-1,.42,1],6.6],[[0,.22,1],6.6],[[-.12,1,.12],6.6]]) {
        const camera=new PerspectiveCamera(36,aspect,.1,100);
        camera.position.copy(target).addScaledVector(new Vector3(...direction).normalize(),distance);
        camera.lookAt(target);
        model.explode(0);const together=outlineFov(outlinePoints(samples),camera,fov);
        model.explode(separationSpread);camera.fov=outlineFov(outlinePoints(samples),camera,fov);
        assert.ok(insideSafeFrame(projectedExtent(model,camera)),`${vehicle.id} clips at aspect ${aspect}`);
        if(distance===restOffset.length()) assert.ok(1-lensScale(together)/lensScale(camera.fov)<=maxSeparationShrink+1e-6,`${vehicle.id} shrinks too much when separated at aspect ${aspect}`);
      }
      model.explode(0);
    }
  }
});

test('driving controls match the vehicle type and crane hook clears the cabin throughout separation',()=>{
  const controls={excavator:'joysticks',motorbike:'handlebars'};
  for(const v of vehicles)assert.ok(v.parts.some(p=>p.id===(controls[v.id]??'steering')),`${v.id} needs driving controls`);
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

test('fire truck ladder rests above the cab and stacked parts keep clear throughout separation',()=>{
  const truck=vehicleById('fire-truck').factory();
  // Per-mesh boxes: a whole-group box would count the tank's filler cap as touching the turntable at the far end.
  const bounds=id=>truck.root.children.filter(g=>g.userData.part===id).flatMap(g=>g.children).map(mesh=>new Box3().setFromObject(mesh));
  const pairs=[['ladder','cabin'],['ladder','beacon'],['ladder','turntable'],['turntable','water-tank'],['water-tank','lockers'],['hose','water-tank'],['hose','lockers'],['beacon','cabin']];
  for(const amount of [0,.25,.5,.75,1]) {
    truck.explode(amount*separationSpread);truck.root.updateMatrixWorld(true);
    for(const [a,b] of pairs)for(const boxA of bounds(a))for(const boxB of bounds(b))
      assert.equal(boxA.intersectsBox(boxB),false,`${a} touches ${b} at separation ${amount}`);
    const lowestRung=Math.min(...bounds('ladder').map(box=>box.min.y)),cabinRoof=Math.max(...bounds('cabin').map(box=>box.max.y));
    assert.ok(lowestRung>cabinRoof,'ladder must stay above the cab roof');
  }
  truck.explode(0);
});

const meshBoxes=(model,id)=>model.root.children.filter(g=>g.userData.part===id).flatMap(g=>g.children).map(mesh=>new Box3().setFromObject(mesh));
function assertClearThroughSeparation(model,pairs) {
  for(const amount of [0,.25,.5,.75,1]) {
    model.explode(amount*separationSpread);model.root.updateMatrixWorld(true);
    for(const [a,b] of pairs)for(const boxA of meshBoxes(model,a))for(const boxB of meshBoxes(model,b))
      assert.equal(boxA.intersectsBox(boxB),false,`${a} touches ${b} at separation ${amount}`);
  }
  model.explode(0);
}

test('garbage truck rear loader parts keep clear while the bin moves away behind the truck',()=>{
  const truck=vehicleById('garbage-truck').factory();
  assertClearThroughSeparation(truck,[['garbage-body','tailgate'],['garbage-body','cabin'],['tailgate','bin-lift'],['bin-lift','trash-bin'],['beacon','cabin'],['trash-bin','lights']]);
});

test('road roller drum stays round, grounded and clear of the cab and rear parts',()=>{
  const roller=vehicleById('road-roller').factory();
  const [drum]=meshBoxes(roller,'roller-drum').sort((a,b)=>b.getSize(new Vector3()).x-a.getSize(new Vector3()).x);
  const drumSize=drum.getSize(new Vector3());
  assert.ok(Math.abs(drumSize.x-drumSize.y)<.01,'the drum must not be flattened');
  assert.ok(drum.min.y>=0 && drum.min.y<.05,'the drum rolls on the ground');
  for(const box of meshBoxes(roller,'wheels'))assert.ok(box.min.y>=0,'tyres must not sink under the floor');
  assertClearThroughSeparation(roller,[['roller-drum','cabin'],['roller-drum','steering'],['roller-drum','wheels'],['engine','exhaust'],['engine','wheels'],['lights','cabin'],['seats','steering']]);
  // The open canopy's posts surround the seat, so box overlap cannot be used; the roof must stay above the driver's place instead.
  for(const amount of [0,.25,.5,.75,1]) {
    roller.explode(amount*separationSpread);roller.root.updateMatrixWorld(true);
    const roof=Math.max(...meshBoxes(roller,'cabin').map(box=>box.min.y));
    for(const id of ['seats','steering'])for(const box of meshBoxes(roller,id))assert.ok(box.max.y<roof,`${id} reaches the canopy roof at separation ${amount}`);
  }
});

// `apart`: neighbours that never touch. `joined`: parts mounted on each other (bucket on its arms, roof on the body) that touch when assembled and must be apart once fully separated.
// Left out, checked in rendered views instead: enclosing structures (the bus shell around its door, the bike frame around its engine and saddle, forks inside pallet slots)
// and tilted or diagonal members such as the loader arms and the tipped dump bed, whose bounding boxes cover neighbours the parts themselves do not reach.
const clearance={
  'dump-truck':{apart:[['dump-bed','cabin'],['sand','cabin']],joined:[['dump-bed','hydraulics']]},
  tanker:{apart:[['fuel-tank','cabin'],['fuel-tank','valves'],['valves','wheels']]},
  'tow-truck':{apart:[['flatbed','cabin'],['flatbed','towed-car'],['winch','towed-car'],['beacon','cabin']],joined:[['flatbed','winch']]},
  'wheel-loader':{apart:[['bucket','wheels'],['boom','cabin'],['hydraulics','wheels'],['hydraulics','cabin'],['engine','wheels'],['engine','exhaust'],['doors','cabin'],['lights','cabin']],joined:[['bucket','boom']]},
  forklift:{apart:[['mast','forks'],['mast','wheels'],['mast','cabin'],['counterweight','wheels'],['engine','seats'],['cargo','pallet'],['lights','cabin']],joined:[['counterweight','body']]},
  tractor:{apart:[['engine','wheels'],['engine','exhaust'],['exhaust','cabin'],['plough','wheels'],['cabin','wheels'],['lights','cabin']]},
  bus:{apart:[['roof','handrails'],['roof','windows'],['route-sign','windows'],['mirrors','body'],['engine','wheels'],['engine','seats'],['engine','handrails'],['engine','roof'],['steering','windows']],joined:[['roof','body']]},
  motorbike:{apart:[['handlebars','mirrors'],['handlebars','lights'],['engine','wheels'],['exhaust','wheels'],['stabilizers','engine'],['stabilizers','wheels']]},
};
for(const [id,{apart,joined=[]}] of Object.entries(clearance)) {
  test(`${id}: neighbouring parts keep clear throughout separation`,()=>{
    const model=vehicleById(id).factory();
    assertClearThroughSeparation(model,apart);
    model.explode(separationSpread);model.root.updateMatrixWorld(true);
    for(const [a,b] of joined)for(const boxA of meshBoxes(model,a))for(const boxB of meshBoxes(model,b))
      assert.equal(boxA.intersectsBox(boxB),false,`${a} still touches ${b} when fully separated`);
    model.explode(0);
  });
}
