import * as THREE from 'three';
import { vehicleKit } from './vehicle-kit.js';

export function createTruck() {
  const k=vehicleKit('#6195b3');k.truckBase({cabX:-1.65,length:4.8,rearAxles:[1.35]});
  const bed=k.group('cargo-bed',[.5,.95,0]);
  k.box(bed,[2.78,.16,1.74],[.8,1.02,0],'yellow');
  for(const z of [-.85,.85]) {
    k.box(bed,[2.8,.65,.09],[.8,1.4,z],'yellow');
    for(let x=-.45;x<2.2;x+=.45)k.box(bed,[.045,.68,.03],[x,1.4,z*1.065],'metal');
  }
  for(const x of [-.58,2.2])k.box(bed,[.1,.68,1.74],[x,1.4,0],'yellow');
  const goods=k.group('cargo',[.55,1.6,0]);
  for(const [x,z] of [[.3,-.4],[.3,.4],[1.2,-.4],[1.2,.4]]) {
    k.box(goods,[.68,.63,.61],[x,1.4,z],'seat');
    k.box(goods,[.06,.65,.63],[x,1.4,z],'white');
  }
  return k.finish();
}

export function createAmbulance() {
  const k=vehicleKit('#f2f2e9');k.truckBase({cabX:-1.55,length:4.6,rearAxles:[1.27]});
  const room=k.group('medical-room',[.4,.85,0]);
  k.box(room,[2.85,.14,1.74],[.66,1.0,0],'white');
  k.box(room,[2.85,.14,1.74],[.66,2.27,0],'white');
  // Side wall pieces and broad windows make the treatment cabin legible.
  for(const s of [-1,1]) {
    k.box(room,[2.7,.71,.075],[.64,1.4,s*.85],'white');
    k.box(room,[2.6,.36,.055],[.65,1.94,s*.85],'glass');
    k.box(room,[2.75,.16,.025],[.65,1.46,s*.9],'red');
    k.box(room,[.12,.45,.05],[.6,1.67,s*.918],'blue');
    k.box(room,[.42,.12,.05],[.6,1.67,s*.922],'blue');
  }
  const back=k.group('rear-doors',[1,.25,0]);
  for(const s of [-1,1]) {
    k.box(back,[.07,1.13,.81],[2.1,1.64,s*.43],'white');
    k.box(back,[.08,.32,.6],[2.15,1.98,s*.43],'glass');
    k.box(back,[.085,.13,.8],[2.15,1.46,s*.43],'red');
    k.box(back,[.09,.12,.035],[2.17,1.63,s*.12],'metal');
  }
  const beacon=k.group('beacon',[0,1.5,0]);
  k.box(beacon,[.32,.08,1.15],[-1.25,2.24,0],'dark');
  for(const s of [-1,1])k.box(beacon,[.28,.17,.38],[-1.25,2.35,s*.36],'blue');
  const stretcher=k.group('stretcher',[.9,.1,.65]);
  k.box(stretcher,[1.65,.16,.59],[.65,1.33,0],'blue');
  k.box(stretcher,[.34,.1,.48],[.06,1.47,0],'white');
  for(const x of [.05,1.25])for(const z of [-.21,.21]) {
    k.beam(stretcher,[x,1.23,z],[x+.12,.97,z],.035,.035,'metal');k.cylinder(stretcher,.065,.06,[x+.12,.96,z],'rubber');
  }
  const kit=k.group('first-aid',[.5,.35,-.75]);
  k.box(kit,[.48,.36,.3],[1.15,1.26,-.5],'red');
  k.box(kit,[.2,.07,.02],[1.15,1.28,-.66],'white');k.box(kit,[.07,.22,.02],[1.15,1.28,-.663],'white');
  return k.finish();
}

export function createCrane() {
  const k=vehicleKit('#e9bc46');k.truckBase({cabX:-1.7,length:5,rearAxles:[.75,1.7]});
  const platform=k.group('turntable',[.15,.55,0]);
  k.cylinder(platform,.67,.23,[.5,1.02,0],'dark',[0,0,0]);
  k.box(platform,[1.5,.44,1.15],[.66,1.3,0]);
  k.box(platform,[.35,.56,1.16],[1.32,1.54,0]);
  const boom=k.group('boom',[-.35,.45,0]);
  k.beam(boom,[.8,1.6,0],[-.72,3.0,0],.4,.43);
  k.beam(boom,[-.5,2.8,0],[-3.1,3.4,0],.26,.28,'metal');
  k.cylinder(boom,.13,.36,[-3.1,3.4,0],'dark');
  k.cylinder(boom,.2,.6,[.8,1.6,0],'dark');
  const piston=k.group('hydraulics',[0,.5,.7]);
  k.beam(piston,[.2,1.35,.27],[-.35,2.46,.27],.1,.1,'metal');
  k.beam(piston,[.2,1.35,.27],[-.05,1.86,.27],.16,.16,'dark');
  const hook=k.group('hook',[-.6,.15,0]);
  k.beam(hook,[-3.1,3.4,0],[-3.1,1.98,0],.025,.025,'dark');
  k.box(hook,[.2,.25,.22],[-3.1,1.88,0],'dark');
  k.mesh(hook,new THREE.TorusGeometry(.15,.047,8,20,Math.PI*1.55),'metal',[-3.1,1.63,0],[0,0,.2]);
  const legs=k.group('stabilizers',[0,0,.5]);
  for(const x of [-.3,1.8])for(const s of [-1,1]) {
    k.box(legs,[.2,.18,.65],[x,.73,s*1.05],'metal');k.box(legs,[.16,.57,.16],[x,.4,s*1.3],'dark');k.box(legs,[.45,.08,.37],[x,.11,s*1.3],'dark');
  }
  return k.finish();
}

export function createExcavator() {
  const k=vehicleKit('#e7a842');
  const chassis=k.group('body');k.box(chassis,[2.75,.2,1.25],[.5,.48,0],'dark');
  for(const s of [-1,1]) {
    const tracks=k.group('tracks',[0,0,s*.7]);
    k.box(tracks,[3.0,.63,.47],[.5,.4,s*.81],'rubber',.22);
    for(let i=0;i<6;i++)k.cylinder(tracks,.21,.49,[-.65+i*.46,.4,s*.81],'metal');
    for(let i=0;i<15;i++)for(const y of [.105,.695])k.box(tracks,[.12,.045,.51],[-.83+i*.19,y,s*.81],'dark',.006);
  }
  const turn=k.group('turntable',[.1,.5,0]);k.cylinder(turn,.59,.25,[.45,.86,0],'metal',[0,0,0]);
  k.box(turn,[2.28,.35,1.56],[.53,1.11,0]);
  const cabin=k.group('cabin',[0,.95,.5]);
  k.box(cabin,[1.05,.12,.88],[.05,1.35,.37]);k.box(cabin,[1.08,.12,.94],[.05,2.3,.37]);
  for(const x of [-.45,.55])for(const z of [-.07,.8])k.box(cabin,[.065,.9,.055],[x,1.82,z],'dark');
  k.box(cabin,[.04,.73,.78],[-.47,1.85,.37],'glass');k.box(cabin,[.04,.72,.78],[.57,1.85,.37],'glass');
  const doors=k.group('doors',[0,.25,1]);k.box(doors,[.9,.81,.04],[.04,1.86,.82],'glass');k.box(doors,[.18,.035,.04],[.28,1.7,.86],'metal');
  const seats=k.group('seats',[0,.6,0]);k.box(seats,[.44,.14,.4],[.02,1.5,.36],'seat');k.box(seats,[.1,.45,.4],[.2,1.75,.36],'seat');
  const joysticks=k.group('joysticks',[-.4,.65,.3]);
  for(const z of [.06,.67]) {
    k.box(joysticks,[.33,.13,.13],[-.06,1.53,z],'dark');
    k.beam(joysticks,[-.14,1.58,z],[-.21,1.8,z],.035,.035,'metal');
    k.box(joysticks,[.07,.14,.07],[-.22,1.8,z],'dark');
    k.box(joysticks,[.04,.02,.04],[-.22,1.88,z],'red');
  }
  const engine=k.group('engine',[.7,.5,-.35]);k.box(engine,[.8,.65,1.15],[1.25,1.6,-.1]);
  for(let i=0;i<5;i++)k.box(engine,[.055,.3,.025],[1.0+i*.12,1.66,.493],'dark');
  const arm=k.group('boom',[-.3,.9,-.3]);
  k.beam(arm,[.15,1.36,-.37],[-.9,3.1,-.37],.28,.34);k.cylinder(arm,.2,.42,[-.9,3.1,-.37],'dark');
  const stick=k.group('dipper',[-.75,.45,-.3]);
  k.beam(stick,[-.9,3.1,-.37],[-1.88,1.36,-.37],.22,.29);k.cylinder(stick,.15,.4,[-1.88,1.36,-.37],'metal');
  const bucket=k.group('bucket',[-1,0,0]);
  const bucketOutline=[[-1.88,1.38],[-1.58,.8],[-1.8,.36],[-2.48,.32],[-2.54,.46],[-2.07,.68]];
  for(const z of [-.9,.16])k.profile(bucket,bucketOutline,.08,z,'dark');
  k.box(bucket,[.65,.1,1.1],[-2.12,.36,-.33],'dark');k.beam(bucket,[-1.88,1.35,-.34],[-1.65,.72,-.34],.1,1.1,'dark');
  for(let i=0;i<5;i++)k.box(bucket,[.23,.09,.105],[-2.47,.32,-.77+i*.23],'metal');
  const hydraulics=k.group('hydraulics',[0,.2,-.85]);
  k.beam(hydraulics,[-.1,1.5,-.62],[-.74,2.75,-.62],.11,.11,'metal');k.beam(hydraulics,[-.1,1.5,-.62],[-.43,2.12,-.62],.16,.16,'dark');
  k.beam(hydraulics,[-.76,2.84,-.6],[-1.5,1.94,-.6],.08,.08,'metal');
  const lights=k.group('lights',[0,.55,0]);for(const z of [.05,.65])k.box(lights,[.09,.1,.15],[-.5,2.21,z],'light');
  return k.finish();
}

export function createMixer() {
  const k=vehicleKit('#689b8f');k.truckBase({cabX:-1.7,length:5,rearAxles:[.8,1.65]});
  const supports=k.group('drum-support',[.3,.3,0]);
  for(const x of [-.05,1.65])k.box(supports,[.2,.45,1.45],[x,1.05,0],'dark');
  const drum=k.group('drum',[.3,1.1,0]);
  const points=[new THREE.Vector2(.26,-1.1),new THREE.Vector2(.6,-.8),new THREE.Vector2(.88,-.25),new THREE.Vector2(.89,.3),new THREE.Vector2(.64,.85),new THREE.Vector2(.32,1.1)];
  const drumMesh=k.mesh(drum,new THREE.LatheGeometry(points,40),'white',[.65,1.83,0],[0,0,-Math.PI/2+.18]);
  for(const [along,radius] of [[-.37,.88],[.03,.9],[.42,.86]]) {
    const ring=k.mesh(drum,new THREE.TorusGeometry(radius,.065,8,40),'paint');
    ring.quaternion.copy(drumMesh.quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2));
    ring.position.copy(new THREE.Vector3(0,along,0).applyQuaternion(drumMesh.quaternion).add(drumMesh.position));
  }
  const hopper=k.group('hopper',[.8,.7,0]);
  k.mesh(hopper,new THREE.CylinderGeometry(.53,.22,.47,4,1,true),'metal',[2.02,1.93,0],[0,Math.PI/4,0]);
  const chute=k.group('chute',[1,.1,.45]);
  k.box(chute,[1.13,.08,.4],[2.22,1.08,.28],'metal',.02,[0,0,-.4]);
  for(const z of [.06,.49])k.box(chute,[1.13,.18,.035],[2.22,1.14,z],'metal',.012,[0,0,-.4]);
  return k.finish();
}

export function createContainer() {
  const k=vehicleKit('#ca7958');k.truckBase({cabX:-2.7,length:7.2,rearAxles:[-.85,2.35,2.95]});
  const trailer=k.group('trailer',[.65,.2,0]);k.box(trailer,[4.9,.2,1.8],[.93,.95,0],'dark');
  for(const s of [-1,1])k.box(trailer,[4.7,.07,.06],[.93,.84,s*.9],'metal');
  const container=k.group('container',[.65,1.05,0]);
  k.box(container,[4.65,1.67,1.78],[.95,1.86,0],'blue');
  for(const s of [-1,1])for(let x=-1.26;x<3.25;x+=.19)k.box(container,[.045,1.54,.065],[x,1.86,s*.905],'blue',.01);
  for(const s of [-1,1])for(const y of [1.07,2.65])k.box(container,[4.7,.065,.055],[.95,y,s*.925],'metal');
  const rear=k.group('container-doors',[1.35,.2,0]);
  for(const s of [-1,1]) {
    k.box(rear,[.08,1.58,.85],[3.33,1.86,s*.445],'blue');
    for(const z of [.2,.64])k.box(rear,[.05,1.44,.035],[3.39,1.86,s*z],'metal');
    k.box(rear,[.07,.035,.21],[3.42,1.66,s*.44],'dark');
  }
  const coupling=k.group('coupling',[-.3,.65,0]);
  k.cylinder(coupling,.36,.1,[-1.47,1.04,0],'metal',[0,0,0]);
  return k.finish();
}

export function createFireTruck() {
  const k=vehicleKit('#d25a47');const {chassis,cabX}=k.truckBase({cabX:-1.7,length:5.2,rearAxles:[.85,1.7]});
  // The cradle stands in the gap between the cab's rear wall and the tank, so the stowed ladder rests on it.
  for(const z of [-.3,.3])k.box(chassis,[.1,1.6,.08],[-.93,1.69,z],'dark');
  k.box(chassis,[.12,.1,.72],[-.93,2.45,0],'dark');
  const tank=k.group('water-tank',[0,.3,0]);
  k.box(tank,[3.1,.935,1.08],[.78,1.383,0],'blue');
  for(const s of [-1,1])k.box(tank,[2.9,.07,.02],[.78,1.55,s*.545],'white');
  k.cylinder(tank,.16,.08,[.1,1.88,0],'yellow',[0,0,0]);
  for(const s of [-1,1]) {
    const lockers=k.group('lockers',[0,.1,s*.9]);
    k.box(lockers,[3.25,1,.34],[.775,1.415,s*.73]);
    for(const x of [-.3,.775,1.85]) {
      k.box(lockers,[.98,.72,.03],[x,1.46,s*.905],'metal',.02);
      for(let i=0;i<5;i++)k.box(lockers,[.96,.018,.02],[x,1.18+i*.14,s*.923],'dark',.005);
      k.box(lockers,[.22,.05,.03],[x,1.08,s*.925],'yellow',.015);
    }
    k.box(lockers,[3.27,.09,.02],[.775,1.87,s*.905],'white',.01);
  }
  const turntable=k.group('turntable',[0,.65,0]);
  k.cylinder(turntable,.48,.2,[1.75,1.96,0],'dark',[0,0,0]);
  for(const s of [-1,1])k.box(turntable,[.5,.44,.06],[1.75,2.28,s*.42],'yellow',.02);
  k.box(turntable,[.5,.12,.9],[1.75,2.12,0],'yellow',.03);
  const ladder=k.group('ladder',[0,1,0]);
  for(const s of [-1,1]) {
    k.box(ladder,[3.9,.1,.07],[.4,2.56,s*.3],'white',.02);
    k.box(ladder,[3.2,.08,.06],[.55,2.7,s*.22],'metal',.02);
    k.box(ladder,[.05,.2,.05],[1.95,2.63,s*.26],'dark',.01);
  }
  for(let x=-1.45;x<2.3;x+=.3)k.box(ladder,[.05,.05,.56],[x,2.56,0],'metal',.015);
  for(let x=-1;x<2.1;x+=.3)k.box(ladder,[.04,.04,.4],[x,2.7,0],'white',.012);
  const hose=k.group('hose',[.7,.05,0]);
  for(const s of [-1,1]) {
    k.box(hose,[.06,.4,.06],[2.62,1.1,s*.4],'metal',.02);
    k.cylinder(hose,.4,.05,[2.85,1.38,s*.48],'yellow');
  }
  k.cylinder(hose,.22,.9,[2.85,1.38,0],'dark');
  for(let i=0;i<7;i++)k.mesh(hose,new THREE.TorusGeometry(.3,.05,8,28),'white',[2.85,1.38,-.36+i*.12]);
  k.beam(hose,[3.15,1.38,.3],[3.2,1.02,.3],.08,.08,'white');
  k.mesh(hose,new THREE.CylinderGeometry(.03,.07,.2,16),'metal',[3.2,.92,.3]);
  const beacon=k.group('beacon',[0,1.2,0]);
  k.box(beacon,[.3,.08,1.15],[cabX-.3,2.19,0],'dark');
  for(const [s,material] of [[-1,'blue'],[1,'red']])k.box(beacon,[.26,.17,.38],[cabX-.3,2.3,s*.36],material);
  return k.finish();
}

export function createGarbageTruck() {
  const k=vehicleKit('#78a45f');const {cabX}=k.truckBase({cabX:-1.7,length:5.2,rearAxles:[.95,1.75]});
  const hold=k.group('garbage-body',[.2,.85,0]);
  k.box(hold,[3.0,1.42,1.8],[.6,1.64,0],'paint',.08);
  for(const s of [-1,1]) {
    for(let x=-.55;x<2;x+=.5)k.box(hold,[.07,1.3,.04],[x,1.64,s*.91],'paint',.02);
    k.box(hold,[2.96,.18,.02],[.6,1.2,s*.93],'white',.01);
  }
  const tailgate=k.group('tailgate',[.65,.3,0]);
  // Kept behind the hold and above the chassis rail so the two can separate without overlapping.
  k.profile(tailgate,[[2.13,2.4],[2.45,2.4],[2.82,1.35],[2.82,.9],[2.13,.9]],1.75,-.875);
  k.box(tailgate,[.06,.36,1.4],[2.85,1.12,0],'dark',.02);
  k.beam(tailgate,[2.47,2.36,0],[2.82,1.4,0],.05,1.82,'yellow');
  for(const s of [-1,1])k.box(tailgate,[.05,.12,.3],[2.85,1.5,s*.66],'red',.02);
  const lift=k.group('bin-lift',[.95,.05,0]);
  for(const s of [-1,1])k.beam(lift,[2.95,1.45,s*.45],[3.0,.62,s*.45],.07,.07,'metal');
  k.box(lift,[.08,.08,1.0],[3.02,.62,0],'metal',.02);
  const bin=k.group('trash-bin',[1.45,0,0]);
  k.box(bin,[.42,.62,.46],[3.3,.82,0],'blue',.05);
  k.box(bin,[.46,.06,.5],[3.3,1.16,0],'dark',.02);
  for(const s of [-1,1])k.cylinder(bin,.08,.06,[3.42,.47,s*.2],'rubber');
  const beacon=k.group('beacon',[0,1.2,0]);
  k.box(beacon,[.3,.08,1.15],[cabX-.3,2.19,0],'dark');
  for(const s of [-1,1])k.box(beacon,[.26,.17,.38],[cabX-.3,2.3,s*.36],'yellow');
  return k.finish();
}

export function createRoadRoller() {
  const k=vehicleKit('#e0874f');
  const frame=k.group('body');
  // Narrow yoke arms sit outside the drum's width, leaving its round end visible and letting it slide forward between them.
  for(const s of [-1,1])k.box(frame,[.36,.9,.08],[-1.55,.95,s*.93],'paint',.03);
  k.box(frame,[1.3,.12,1.94],[-1.4,1.4,0]);
  k.box(frame,[.12,.5,1.0],[-.8,1.15,0]);
  k.box(frame,[.45,.4,.9],[-.55,.8,0],'dark');
  k.box(frame,[2.6,.3,1.1],[.75,.75,0],'dark');
  k.box(frame,[1.35,.1,1.5],[.1,1.12,0]);
  const drum=k.group('roller-drum',[-.8,0,0]);
  k.cylinder(drum,.62,1.7,[-1.55,.64,0],'metal');
  for(const s of [-1,1]) {
    k.cylinder(drum,.45,.04,[-1.55,.64,s*.86],'paint');
    k.cylinder(drum,.12,.08,[-1.55,.64,s*.86],'dark');
  }
  for(const s of [-1,1]) {
    const wheels=k.group('wheels',[.25,0,s*.7]);
    k.cylinder(wheels,.56,.42,[1.2,.58,s*.82],'rubber');
    k.cylinder(wheels,.34,.44,[1.2,.58,s*.82],'paint');
    k.cylinder(wheels,.12,.46,[1.2,.58,s*.82],'dark');
    for(let i=0;i<10;i++) {
      const angle=i*Math.PI/5;
      k.box(wheels,[.1,.05,.44],[1.2+Math.sin(angle)*.545,.58+Math.cos(angle)*.545,s*.82],'dark',.01,[0,0,-angle]);
    }
  }
  const engine=k.group('engine',[.7,.45,0]);
  k.box(engine,[1.25,.72,1.06],[1.45,1.26,0],'paint',.08);
  for(const s of [-1,1])for(let i=0;i<4;i++)k.box(engine,[.7,.04,.02],[1.5,1.08+i*.12,s*.535],'dark',.01);
  k.box(engine,[.03,.3,.8],[2.08,1.3,0],'dark',.01);
  const exhaust=k.group('exhaust',[.3,.6,0]);
  k.cylinder(exhaust,.06,.68,[1.8,1.97,-.35],'metal',[0,0,0]);
  k.cylinder(exhaust,.08,.08,[1.8,2.31,-.35],'dark',[0,0,0]);
  const cabin=k.group('cabin',[0,.8,0]);
  for(const x of [-.45,.6])for(const s of [-1,1])k.box(cabin,[.07,1.18,.07],[x,1.76,s*.62],'dark',.02);
  k.box(cabin,[1.3,.1,1.45],[.08,2.4,0],'paint',.04);
  k.box(cabin,[.04,.75,1.12],[-.45,1.95,0],'glass',.02);
  const seats=k.group('seats',[0,.45,0]);
  k.box(seats,[.42,.13,.46],[.35,1.4,0],'seat');k.box(seats,[.12,.5,.46],[.55,1.66,0],'seat');
  const steering=k.group('steering',[-.3,.5,0]);
  k.box(steering,[.25,.3,.5],[-.25,1.32,0],'dark');
  k.beam(steering,[-.2,1.45,0],[-.05,1.64,0],.055,.055,'metal');
  k.mesh(steering,new THREE.TorusGeometry(.16,.024,10,32),'dark',[-.05,1.66,0],[0,Math.PI/2-.35,0]);
  k.cylinder(steering,.05,.06,[-.05,1.66,0],'metal',[0,0,Math.PI/2]);
  const lights=k.group('lights',[-.2,1.1,0]);
  for(const s of [-1,1]) {
    k.box(lights,[.1,.12,.16],[-.5,2.52,s*.5],'light',.03);
    k.box(lights,[.06,.1,.2],[2.1,1.02,s*.4],'red',.02);
  }
  return k.finish();
}

export function createDumpTruck() {
  const k=vehicleKit('#d9774a');k.truckBase({cabX:-1.7,length:5,rearAxles:[.8,1.65]});
  // The bed is authored around its rear hinge and tipped up at the front, so it reads as a dump truck at rest.
  const hinge=new THREE.Vector2(2.3,1.02),tilt=-.18;
  const at=(x,y)=>{const p=new THREE.Vector2(x,y).rotateAround(new THREE.Vector2(),tilt).add(hinge);return [p.x,p.y];};
  const bed=k.group('dump-bed',[.3,.9,0]);
  k.box(bed,[2.9,.12,1.8],[...at(-1.45,.06),0],'dark',.03,[0,0,tilt]);
  for(const s of [-1,1])k.box(bed,[2.9,.7,.1],[...at(-1.45,.45),s*.85],'dark',.03,[0,0,tilt]);
  k.box(bed,[.12,.9,1.8],[...at(-2.84,.5),0],'dark',.03,[0,0,tilt]);
  k.box(bed,[.1,.6,1.8],[...at(-.05,.4),0],'dark',.03,[0,0,tilt]);
  for(const s of [-1,1])k.box(bed,[2.7,.08,.03],[...at(-1.45,.62),s*.915],'yellow',.01,[0,0,tilt]);
  const sand=k.group('sand',[.3,2.2,0]);
  k.mesh(sand,new THREE.SphereGeometry(1,24,12),'seat',[...at(-1.5,.5),0],[0,0,tilt]).scale.set(1.25,.4,.72);
  const lift=k.group('hydraulics',[0,.25,.75]);
  const top=at(-2.2,-.02);
  k.beam(lift,[-.3,.95,0],[(top[0]-.3)/2,(top[1]+.95)/2,0],.2,.2,'dark');
  k.beam(lift,[-.3,.95,0],[top[0],top[1]-.03,0],.1,.1,'metal');
  return k.finish();
}

export function createTanker() {
  const k=vehicleKit('#8d7bb0');const {chassis}=k.truckBase({cabX:-1.7,length:5.2,rearAxles:[.9,1.75]});
  for(const x of [-.3,1.8])k.box(chassis,[.22,.1,1.2],[x,.9,0],'dark',.02);
  const tank=k.group('fuel-tank',[.2,.95,0]);
  k.cylinder(tank,.8,2.9,[.85,1.75,0],'metal',[0,0,Math.PI/2]);
  for(const s of [-1,1])k.mesh(tank,new THREE.SphereGeometry(1,24,16),'metal',[.85+s*1.45,1.75,0]).scale.set(.35,.8,.8);
  k.cylinder(tank,.815,.35,[.85,1.75,0],'paint',[0,0,Math.PI/2]);
  for(const x of [-.1,.85,1.8])k.cylinder(tank,.17,.08,[x,2.57,0],'dark',[0,0,0]);
  const valves=[-1,1].map(s=>k.group('valves',[0,0,s*.7]));
  valves.forEach((g,i)=>{
    const s=i?1:-1;
    k.box(g,[.5,.35,.12],[0,.62,s*.84],'dark',.03);
    k.mesh(g,new THREE.TorusGeometry(.1,.025,8,20),'red',[0,.66,s*.93]);
    k.cylinder(g,.04,.12,[.18,.5,s*.93],'metal');
  });
  return k.finish();
}

export function createTowTruck() {
  const k=vehicleKit('#3f6f8f');const {cabX}=k.truckBase({cabX:-1.7,length:5.4,rearAxles:[.9,1.8]});
  const deck=k.group('flatbed',[.3,.5,0]);
  k.box(deck,[3.5,.14,1.8],[.95,1.05,0],'metal',.03);
  for(const s of [-1,1])k.box(deck,[3.5,.1,.04],[.95,1.05,s*.92],'yellow',.02);
  k.box(deck,[.5,.08,1.8],[2.9,.97,0],'metal',.02,[0,0,-.3]);
  const winch=k.group('winch',[-.2,1,0]);
  k.cylinder(winch,.2,1.0,[-.6,1.32,0],'yellow');
  for(const s of [-1,1])k.cylinder(winch,.24,.04,[-.6,1.32,s*.52],'dark');
  k.beam(winch,[-.45,1.35,0],[.1,1.35,0],.025,.025,'dark');
  const car=k.group('towed-car',[.4,1.5,0]);
  k.box(car,[1.9,.4,1.1],[1.1,1.42,0],'white',.12);
  k.box(car,[1.0,.36,1.0],[1.2,1.8,0],'glass',.1);
  for(const x of [.55,1.65])for(const s of [-1,1])k.cylinder(car,.18,.14,[x,1.31,s*.5],'rubber');
  const beacon=k.group('beacon',[0,1.2,0]);
  k.box(beacon,[.3,.08,1.15],[cabX-.3,2.19,0],'dark');
  for(const s of [-1,1])k.box(beacon,[.26,.17,.38],[cabX-.3,2.3,s*.36],'yellow');
  return k.finish();
}

function bigWheel(k,x,z,r,width,delta) {
  const g=k.group('wheels',delta);
  k.cylinder(g,r,width,[x,r+.02,z],'rubber');
  k.cylinder(g,r*.6,width+.02,[x,r+.02,z],'paint');
  k.cylinder(g,r*.22,width+.04,[x,r+.02,z],'dark');
  for(let i=0;i<10;i++) {
    const angle=i*Math.PI/5;
    k.box(g,[r*.18,.05,width+.02],[x+Math.sin(angle)*(r-.015),r+.02+Math.cos(angle)*(r-.015),z],'dark',.01,[0,0,-angle]);
  }
  return g;
}

function openSteering(k,g,console,wheel) {
  k.box(g,[.22,.34,.46],console,'dark');
  k.beam(g,[console[0]+.04,console[1]+.15,0],[wheel[0],wheel[1]-.02,0],.05,.05,'metal');
  k.mesh(g,new THREE.TorusGeometry(.16,.024,10,32),'dark',[wheel[0],wheel[1],0],[0,Math.PI/2-.35,0]);
  k.cylinder(g,.05,.06,[wheel[0],wheel[1],0],'metal',[0,0,Math.PI/2]);
}

export function createWheelLoader() {
  const k=vehicleKit('#e2c14f');
  const frame=k.group('body');
  k.box(frame,[3.2,.35,1.0],[.5,.8,0],'dark');
  k.box(frame,[1.2,.1,1.3],[.5,1.2,0]);
  for(const s of [-1,1])k.box(frame,[.3,.7,.1],[-.15,1.45,s*.72]);
  for(const x of [-.9,1.5])for(const s of [-1,1])bigWheel(k,x,s*.85,.55,.45,[x<0?-.25:.25,0,s*.7]);
  const engine=k.group('engine',[.7,.4,0]);
  k.box(engine,[1.3,.8,1.2],[1.75,1.35,0],'paint',.08);
  k.box(engine,[.03,.4,.8],[2.41,1.35,0],'dark',.01);
  for(const s of [-1,1])for(let i=0;i<4;i++)k.box(engine,[.7,.04,.02],[1.8,1.2+i*.12,s*.605],'dark',.01);
  const exhaust=k.group('exhaust',[.4,.9,0]);
  k.cylinder(exhaust,.06,.6,[1.9,2.06,-.3],'metal',[0,0,0]);
  const cabin=k.group('cabin',[0,.9,0]);
  k.box(cabin,[1.2,.1,1.3],[.5,2.45,0],'paint',.04);
  for(const x of [-.05,1.05])for(const s of [-1,1])k.box(cabin,[.07,1.15,.07],[x,1.83,s*.6],'dark',.02);
  for(const x of [-.05,1.05])k.box(cabin,[.04,.95,1.1],[x,1.8,0],'glass',.02);
  k.box(cabin,[1.0,.95,.04],[.5,1.8,-.6],'glass',.02);
  const doors=k.group('doors',[0,.2,1]);
  k.box(doors,[1.0,.95,.04],[.5,1.8,.66],'glass',.02);k.box(doors,[.18,.035,.04],[.8,1.65,.7],'metal');
  const seats=k.group('seats',[0,.5,0]);
  k.box(seats,[.42,.13,.46],[.65,1.42,0],'seat');k.box(seats,[.12,.5,.46],[.85,1.68,0],'seat');
  openSteering(k,k.group('steering',[-.3,.55,0]),[.2,1.42,0],[.3,1.72]);
  const arms=k.group('boom',[-.4,.5,0]);
  for(const s of [-1,1])k.beam(arms,[-.2,1.75,s*.72],[-1.9,.95,s*.72],.16,.12);
  k.box(arms,[.12,.12,1.44],[-1.2,1.25,0],'paint',.03);
  const lift=k.group('hydraulics',[-.2,.2,0]);
  for(const s of [-1,1]) {
    k.beam(lift,[-.35,1.05,s*.45],[-1.3,1.35,s*.45],.1,.1,'metal');
    k.beam(lift,[-.35,1.05,s*.45],[-.8,1.19,s*.45],.16,.16,'dark');
  }
  const bucket=k.group('bucket',[-.9,.1,0]);
  const outline=[[-1.9,1.25],[-1.98,.3],[-2.2,.08],[-2.72,.08],[-2.3,.4],[-2.15,1.25]];
  for(const z of [-.95,.87])k.profile(bucket,outline,.08,z,'dark');
  k.beam(bucket,[-1.94,1.2,0],[-2.05,.14,0],.08,1.9,'dark');
  k.box(bucket,[.62,.08,1.9],[-2.4,.12,0],'dark',.02);
  for(let i=0;i<6;i++)k.box(bucket,[.16,.06,.12],[-2.72,.1,-.8+i*.32],'metal',.02);
  const lights=k.group('lights',[-.2,1.2,0]);
  for(const s of [-1,1])k.box(lights,[.1,.12,.16],[-.02,2.57,s*.45],'light',.03);
  return k.finish();
}

export function createForklift() {
  const k=vehicleKit('#e5a23a');
  const frame=k.group('body');k.box(frame,[2.0,.55,.9],[.3,.6,0]);
  const weight=k.group('counterweight',[.8,0,0]);k.box(weight,[.5,.9,1.15],[1.55,.8,0],'dark',.12);
  for(const s of [-1,1]) {
    bigWheel(k,-.45,s*.62,.32,.25,[-.2,0,s*.6]);
    bigWheel(k,.95,s*.62,.28,.25,[.2,0,s*.6]);
  }
  const engine=k.group('engine',[.5,.3,0]);k.box(engine,[.7,.25,.8],[.55,1.0,0],'paint',.04);
  const seats=k.group('seats',[0,.5,0]);
  k.box(seats,[.42,.13,.46],[.6,1.2,0],'seat');k.box(seats,[.12,.5,.46],[.8,1.45,0],'seat');
  openSteering(k,k.group('steering',[-.2,.55,0]),[-.2,1.05,0],[-.05,1.45]);
  const guard=k.group('cabin',[0,.9,0]);
  for(const x of [-.35,.95])for(const s of [-1,1])k.box(guard,[.07,1.12,.07],[x,1.45,s*.5],'dark',.02);
  for(const s of [-1,1])k.box(guard,[1.37,.07,.07],[.3,2.04,s*.5],'dark',.02);
  for(let x=-.3;x<1;x+=.2)k.box(guard,[.05,.05,1.07],[x,2.04,0],'dark',.015);
  const mast=k.group('mast',[-.45,.2,0]);
  for(const s of [-1,1])k.box(mast,[.12,2.2,.1],[-.8,1.2,s*.35],'metal',.02);
  for(const y of [.3,2.2])k.box(mast,[.1,.1,.8],[-.8,y,0],'metal',.02);
  const forks=k.group('forks',[-.9,.1,0]);
  k.box(forks,[.08,.5,.9],[-.92,.8,0],'dark',.02);
  for(const s of [-1,1]) {k.box(forks,[1.1,.06,.12],[-1.5,.53,s*.25],'metal',.015);k.box(forks,[.06,.4,.12],[-.95,.7,s*.25],'metal',.015);}
  const pallet=k.group('pallet',[-1.3,0,0]);
  for(const y of [.42,.6])k.box(pallet,[1.06,.04,1.0],[-1.56,y,0],'seat',.01);
  for(const x of [-2.03,-1.56,-1.09])for(const z of [-.45,0,.45])k.box(pallet,[.12,.14,.12],[x,.51,z],'seat',.01);
  const goods=k.group('cargo',[-1.3,.9,0]);
  for(const [x,z] of [[-1.3,-.24],[-1.3,.24],[-1.82,-.24],[-1.82,.24]]) {
    k.box(goods,[.48,.45,.45],[x,.85,z],'white',.03);k.box(goods,[.5,.06,.47],[x,.9,z],'yellow',.01);
  }
  const lights=k.group('lights',[0,1.2,0]);
  for(const s of [-1,1])k.box(lights,[.1,.12,.14],[-.35,2.14,s*.4],'light',.03);
  return k.finish();
}

export function createTractor() {
  const k=vehicleKit('#4f86b8');
  const frame=k.group('body');
  k.box(frame,[2.6,.3,.7],[0,.75,0],'dark');
  k.box(frame,[1.2,.08,1.1],[.95,1.02,0],'dark');
  for(const s of [-1,1])k.box(frame,[1.3,.08,.5],[1.0,1.72,s*.8],'paint',.03);
  k.box(frame,[.7,.1,.2],[1.6,.85,0],'dark',.02);
  bigWheel(k,-1.2,-.62,.42,.25,[-.25,0,-.8]);bigWheel(k,-1.2,.62,.42,.25,[-.25,0,.8]);
  bigWheel(k,1.0,-.8,.8,.45,[.25,0,-.8]);bigWheel(k,1.0,.8,.8,.45,[.25,0,.8]);
  const engine=k.group('engine',[-.6,.35,0]);
  k.box(engine,[1.6,.6,.8],[-.85,1.15,0],'paint',.08);
  k.box(engine,[.03,.4,.6],[-1.665,1.15,0],'dark',.01);
  for(const s of [-1,1])for(let i=0;i<3;i++)k.box(engine,[.9,.04,.02],[-.9,1.02+i*.12,s*.405],'dark',.01);
  const exhaust=k.group('exhaust',[-.2,1,0]);
  k.cylinder(exhaust,.05,.8,[-.3,1.86,.25],'metal',[0,0,0]);
  const cabin=k.group('cabin',[0,1,0]);
  for(const x of [.45,1.45])for(const s of [-1,1])k.box(cabin,[.07,1.5,.07],[x,1.8,s*.5],'dark',.02);
  k.box(cabin,[1.2,.1,1.3],[.95,2.6,0]);
  for(const x of [.45,1.45])k.box(cabin,[.04,1.2,.9],[x,1.85,0],'glass',.02);
  const seats=k.group('seats',[0,.55,0]);
  k.box(seats,[.42,.13,.46],[1.1,1.25,0],'seat');k.box(seats,[.12,.5,.46],[1.3,1.5,0],'seat');
  openSteering(k,k.group('steering',[-.2,.6,0]),[.62,1.25,0],[.78,1.62]);
  const plough=k.group('plough',[.9,0,0]);
  for(const s of [-1,1])k.beam(plough,[1.98,.86,s*.3],[2.3,.75,s*.3],.08,.08,'dark');
  k.box(plough,[.12,.12,1.4],[2.35,.75,0],'dark',.03);
  for(const z of [-.5,0,.5])k.beam(plough,[2.35,.72,z],[2.7,.14,z],.08,.14,'metal');
  const lights=k.group('lights',[0,1.35,0]);
  for(const s of [-1,1])k.box(lights,[.1,.12,.16],[.5,2.72,s*.45],'light',.03);
  return k.finish();
}

export function createBus() {
  const k=vehicleKit('#f0c24f');
  // Forward is −X, so the driver sits on +Z (left) and the passenger door faces the kerb on −Z (right), as in Vietnam.
  const pillars=[-2.75,-1.95,-1.3,-.6,.2,1.0,1.8,2.75];
  const body=k.group('body');
  k.box(body,[5.4,.12,1.16],[0,.6,0],'dark',.02);
  for(const s of [-1,1]) {
    for(const [from,to] of [[-2.8,-2.3],[s<0?-.6:-1.3,1.2],[2.2,2.8]])k.box(body,[to-from,.37,.08],[(from+to)/2,.77,s*.82],'paint',.02);
    for(const [from,to] of s<0?[[-2.8,-1.3],[-.6,2.8]]:[[-2.8,2.8]]) {
      k.box(body,[to-from,.38,.08],[(from+to)/2,1.14,s*.82],'paint',.02);
      k.box(body,[to-from,.1,.08],[(from+to)/2,2.28,s*.82],'paint',.02);
    }
    for(const x of pillars)if(!(s<0&&(x===-1.3||x===-.6)))k.box(body,[.1,.92,.08],[x,1.8,s*.82],'paint',.02);
    k.box(body,[5.5,.08,.02],[0,1.1,s*.865],'white',.01);
  }
  k.box(body,[.1,.8,1.7],[-2.8,.98,0],'paint',.04);
  k.box(body,[.1,1.75,1.7],[2.8,1.46,0],'paint',.04);
  for(const x of [-1.8,1.7])for(const s of [-1,1])k.wheel(x,s*.72);
  const roof=k.group('roof',[0,1.1,0]);
  k.box(roof,[5.7,.14,1.8],[0,2.4,0],'white',.06);
  k.box(roof,[1.2,.22,.9],[.6,2.58,0],'white',.06);
  for(const s of [-1,1]) {
    const windows=k.group('windows',[0,.1,s*.7]);
    for(let i=0;i<pillars.length-1;i++) {
      const from=pillars[i]+.05,to=pillars[i+1]-.05;
      if(s<0&&from>-1.3&&to<-.6)continue;
      k.box(windows,[to-from,.8,.04],[(from+to)/2,1.8,s*.82],'glass',.02);
    }
  }
  k.box(k.group('windows',[-.7,.1,0]),[.06,.7,1.55],[-2.8,1.75,0],'glass',.02);
  k.box(k.group('windows',[.7,.1,0]),[.06,.5,1.2],[2.86,1.95,0],'glass',.02);
  const door=k.group('doors',[0,0,-.9]);
  for(const x of [-1.13,-.77]) {
    k.box(door,[.33,1.55,.05],[x,1.38,-.84],'glass',.02);
    k.box(door,[.33,.1,.06],[x,1.0,-.845],'paint',.02);
  }
  const seats=k.group('seats',[0,.35,0]);
  k.box(seats,[.4,.1,.5],[-1.9,.95,.45],'seat');k.box(seats,[.08,.45,.5],[-1.7,1.2,.45],'seat');
  for(let x=-.3;x<1.6;x+=.6)for(const s of [-1,1]) {
    k.box(seats,[.4,.1,.5],[x,.95,s*.45],'seat');k.box(seats,[.08,.45,.5],[x+.2,1.2,s*.45],'seat');
  }
  const rails=k.group('handrails',[0,.75,0]);
  k.cylinder(rails,.03,3.2,[.4,2.1,0],'metal',[0,0,Math.PI/2]);
  for(const x of [-.6,.6,1.8])k.cylinder(rails,.03,1.42,[x,1.38,0],'metal',[0,0,0]);
  const sign=k.group('route-sign',[-.6,.6,0]);
  k.box(sign,[.06,.2,1.1],[-2.84,2.22,0],'dark',.02);k.box(sign,[.02,.1,.6],[-2.875,2.22,0],'light',.01);
  const steering=k.group('steering',[-.2,.45,0]);
  k.box(steering,[.25,.5,.6],[-2.55,.9,.45],'dark');
  k.beam(steering,[-2.45,1.1,.45],[-2.3,1.35,.45],.05,.05,'metal');
  k.mesh(steering,new THREE.TorusGeometry(.18,.026,10,32),'dark',[-2.3,1.37,.45],[0,Math.PI/2-.35,0]);
  const mirrors=[-1,1].map(s=>k.group('mirrors',[-.2,.2,s*.3]));
  mirrors.forEach((g,i)=>{const s=i?1:-1;k.beam(g,[-2.86,2.0,s*.86],[-3.0,1.9,s*1.0],.04,.04,'dark');k.box(g,[.05,.3,.14],[-3.02,1.75,s*1.0],'dark',.02);});
  const front=k.group('lights',[-.3,0,0]),rear=k.group('lights',[.3,0,0]);
  for(const s of [-1,1]) {k.box(front,[.04,.14,.25],[-2.875,.8,s*.6],'light',.02);k.box(rear,[.04,.2,.18],[2.875,.9,s*.62],'red',.02);}
  const engine=k.group('engine',[0,1.2,0]);
  k.box(engine,[.5,.4,.9],[2.45,.88,0],'metal');
  for(let i=0;i<4;i++)k.box(engine,[.3,.03,.03],[2.45,1.1,-.3+i*.2],'dark',.01);
  return k.finish();
}

export function createMotorbike() {
  const k=vehicleKit('#c85a6a');
  for(const [x,dx] of [[-1.05,-.6],[1.05,.6]]) {
    const g=k.group('wheels',[dx,0,0]);
    k.cylinder(g,.42,.12,[x,.44,0],'rubber');k.cylinder(g,.3,.13,[x,.44,0],'metal');k.cylinder(g,.08,.16,[x,.44,0],'dark');
    for(let i=0;i<6;i++){const a=i*Math.PI/3;k.beam(g,[x,.44,0],[x+Math.sin(a)*.29,.44+Math.cos(a)*.29,0],.02,.02,'dark');}
  }
  const body=k.group('body');
  k.beam(body,[-.62,1.15,0],[-.2,.62,0],.16,.18);k.beam(body,[-.2,.62,0],[.5,.72,0],.16,.18);
  k.box(body,[1.0,.32,.4],[.75,1.03,0],'paint',.12);
  k.box(body,[.12,.6,.5],[-.45,.95,0],'paint',.05);
  k.box(body,[.5,.06,.16],[-1.05,.92,0],'paint',.03);
  for(const s of [-1,1]) {
    k.beam(body,[-1.05,.44,s*.1],[-.75,1.25,s*.1],.05,.05,'metal');
    k.beam(body,[.2,.62,s*.1],[1.05,.44,s*.1],.06,.05,'dark');
    k.beam(body,[1.0,.47,s*.12],[.95,.87,s*.12],.04,.04,'metal');
  }
  const saddle=k.group('saddle',[0,.55,0]);k.box(saddle,[.8,.12,.36],[.65,1.26,0],'dark',.05);
  const engine=k.group('engine',[0,-.0,.5]);
  k.box(engine,[.4,.26,.3],[.05,.38,0],'metal',.05);k.box(engine,[.2,.2,.26],[-.22,.4,0],'dark',.04);
  const exhaust=k.group('exhaust',[.2,0,.5]);
  k.beam(exhaust,[.1,.35,.2],[1.0,.5,.2],.06,.06,'metal');k.beam(exhaust,[.6,.42,.2],[1.1,.52,.2],.12,.12,'dark');
  const bars=k.group('handlebars',[-.2,.45,0]);
  k.beam(bars,[-.72,1.25,0],[-.7,1.45,0],.05,.05,'metal');
  k.beam(bars,[-.7,1.45,-.4],[-.7,1.45,.4],.05,.05,'dark');
  for(const s of [-1,1])k.cylinder(bars,.04,.1,[-.7,1.45,s*.42],'rubber');
  const front=k.group('lights',[-.4,.2,0]),rear=k.group('lights',[.4,.1,0]);
  k.box(front,[.08,.16,.2],[-.82,1.3,0],'light',.03);k.box(rear,[.06,.1,.18],[1.29,1.08,0],'red',.02);
  for(const s of [-1,1]) {
    const g=k.group('mirrors',[0,.7,s*.3]);
    k.beam(g,[-.7,1.5,s*.3],[-.65,1.75,s*.35],.025,.025,'metal');k.box(g,[.04,.12,.16],[-.64,1.8,s*.37],'dark',.02);
  }
  const stand=k.group('stabilizers',[0,0,-.5]);
  k.beam(stand,[.3,.32,-.18],[.4,.05,-.3],.04,.04,'dark');k.box(stand,[.12,.03,.08],[.4,.035,-.3],'dark',.01);
  return k.finish();
}
