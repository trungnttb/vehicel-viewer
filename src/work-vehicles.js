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
