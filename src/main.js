import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createCar, partInfo } from './car.js';
import { createTapTracker } from './tap-tracker.js';
import { partIllustration } from './part-illustrations.js';
import { audioMessages } from './audio-messages.js';

const icons = {
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  back: '<path d="m14 6-6 6 6 6"/>',
  sound: '<path d="m11 5-6 4H2v6h3l6 4V5Zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  mute: '<path d="m11 5-6 4H2v6h3l6 4V5Zm5 4 6 6m0-6-6 6"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M8 8 3 3m13 5 5-5M8 16l-5 5m13-5 5 5"/>',
  reset: '<path d="M4 9a8 8 0 1 1 0 6m0-12v6h6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  rotate: '<path d="M3 10c1-5 17-5 18 0s-10 8-15 4m-3-4 4-4m-4 4 5 2"/>',
  car: '<path d="m4 10 2-5h12l2 5M3 10h18v8H3zM5 18v2m14-2v2M6 13h2m8 0h2"/>',
  spark: '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.car}</svg>`;
const app = document.querySelector('#app');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const touchDevice = matchMedia('(any-pointer: coarse)');
let detail = false, sound = true, selected = null, manualExplosion = null, explosion = 0;
const visited = new Set();
let vietnameseVoice = null;
const narration = new Audio();
narration.preload = 'none';
narration.id = 'narration';
narration.hidden = true;
document.body.append(narration);
let audioSequence = 0;
function stopSpeech() { audioSequence++; narration.pause(); narration.removeAttribute('src'); narration.load(); window.speechSynthesis?.cancel(); }
function loadVoices() { vietnameseVoice = window.speechSynthesis?.getVoices().find(v => v.lang.toLowerCase().startsWith('vi')); }
loadVoices();
window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);

const canvas = document.createElement('canvas');
canvas.setAttribute('aria-label', 'Mô hình ô tô trắng 3D. Kéo để xoay, phóng to để tách bộ phận. Có thể chọn bộ phận bằng danh sách bên cạnh.');
let renderer, scene, camera, controls, car, fittedFov = 36;
let webglError = false;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, touchDevice.matches ? 1.5 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.enablePan = false;
  controls.minDistance = 6.6; controls.maxDistance = 13;
  controls.minPolarAngle = .28; controls.maxPolarAngle = Math.PI/2-.025;
  controls.autoRotateSpeed = .5;
  scene.add(new THREE.HemisphereLight('#ffffff', '#b6aea0', 2.5));
  const sun = new THREE.DirectionalLight('#fff5e7', 4);
  sun.position.set(-3,7,5); sun.castShadow = true;
  sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera, { left:-6, right:6, top:6, bottom:-6 });
  sun.shadow.normalBias = .03; sun.shadow.bias = -.0001;
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#dfeaff', 2); fill.position.set(4,3,-4); scene.add(fill);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  scene.environment = pmrem.fromScene(environment,.04).texture;
  environment.dispose(); pmrem.dispose();
  car = createCar(); scene.add(car.root);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200,200), new THREE.ShadowMaterial({color:'#56574d',opacity:.16}));
  floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; floor.position.y = .01; scene.add(floor);
} catch (error) { webglError = true; console.error('Không thể khởi tạo 3D:', error); }

function header() {
  return `<header class="header"><a class="brand" href="#/" aria-label="Gara tí hon, trang chủ"><span class="brand-icon">${icon('car')}</span>gara tí hon<span class="brand-dot">®</span></a><nav><a href="#/" class="nav-link ${!detail?'active':''}">Bộ sưu tập</a><span class="header-note">Một chút tò mò. Cả thế giới mới.</span></nav><button class="sound-button" id="sound" aria-label="${sound?'Tắt':'Bật'} âm thanh" aria-pressed="${sound}">${icon(sound?'sound':'mute')}<span>Âm thanh ${sound?'bật':'tắt'}</span></button></header>`;
}
function stageMarkup() {
  return `<div class="stage" id="stage"><div class="stage-grid"></div><div class="stage-top"><span class="live-dot"></span> MÔ HÌNH 3D TƯƠNG TÁC</div><div class="stage-label"><span>01 / THE LITTLE COLLECTION</span><strong>ACCENT <em>2021</em></strong></div><div class="canvas-host" id="canvas-host"></div>${detail?'<button class="stage-part" id="stage-part" hidden aria-label="Đọc lại tên bộ phận"><span></span>'+icon('sound')+'</button>':''}<div class="stage-bottom"><span>${icon('rotate')} Kéo để xoay ${detail?'· Chạm để nghe':''}</span><span class="color-label"><i></i> Polar white</span></div>${webglError?'<div class="webgl-error">Thiết bị chưa mở được mô hình 3D. Hãy bật tăng tốc đồ họa hoặc thử trình duyệt khác.</div>':''}</div>`;
}
function home() {
  app.innerHTML = `${header()}<main class="home"><section class="hero"><div class="hero-copy"><div class="eyebrow"><span></span> GARA NHỎ, KHÁM PHÁ TO</div><h1>Chạm vào xe.<br>Mở ra <span>tò mò.</span><span class="title-spark">✳</span></h1><p>Xoay một vòng. Khám phá từng bộ phận.<br>Cùng bé hiểu những người bạn trên mọi nẻo đường.</p><a class="primary-button" href="#/xe/accent">Khám phá ô tô ${icon('arrow')}</a><div class="hero-foot"><span class="tiny-orbits">✦</span><span>Dành cho những nhà khám phá nhí</span></div></div>${stageMarkup()}</section><section class="collection"><div class="section-heading"><div><span class="eyebrow">CHỌN BẠN ĐỒNG HÀNH</span><h2>Hôm nay, mình khám phá gì?</h2></div><span class="collection-count">01 phương tiện · Vô vàn tò mò</span></div><div class="collection-grid"><a class="vehicle-card available" href="#/xe/accent"><div class="card-top"><span class="card-tag">SẴN SÀNG KHÁM PHÁ</span><span>01</span></div><div class="mini-car"><div class="mini-roof"></div><div class="mini-body"></div><i></i><i></i></div><div class="card-bottom"><div><h3>Ô tô con</h3><p>Accent 2021 · Trắng ngọc</p></div><span class="round-arrow">${icon('arrow')}</span></div></a><div class="invitation-card"><span class="outline-star">✳</span><div><span class="eyebrow">BẮT ĐẦU BẰNG MỘT CHIẾC XE</span><h3>Có gì bên trong<br>người bạn bốn bánh?</h3><p>12 bộ phận đang chờ bé khám phá.<br>Chạm thử, rồi lắng nghe nhé!</p></div><span class="doodle-line">↗</span></div></div></section><section class="how-it-works"><div><span>01</span>${icon('rotate')}<p><strong>Xoay & ngắm</strong>Kéo ngón tay để nhìn mọi phía.</p></div><div><span>02</span>${icon('expand')}<p><strong>Tách & khám phá</strong>Phóng to để nhìn vào bên trong.</p></div><div><span>03</span>${icon('sound')}<p><strong>Chạm & lắng nghe</strong>Mỗi bộ phận đều có một cái tên.</p></div></section></main><footer><span>gara tí hon</span><p>Một thế giới nhỏ cho trí tò mò lớn.</p><span>Được làm để cùng bé khám phá ↗</span></footer>`;
}
function detailPage() {
  app.innerHTML = `${header()}<main class="detail"><div class="breadcrumbs"><a href="#/">${icon('back')} Bộ sưu tập</a><span>/</span><span>Ô tô con</span></div><div class="detail-heading"><div><div class="eyebrow">NGƯỜI BẠN BỐN BÁNH</div><h1>Ô tô con <span>Accent 2021</span></h1></div><span class="detail-badge"><i></i> Trắng ngọc · Mô hình đồ chơi</span></div><div class="explorer"><div class="viewer-column">${stageMarkup()}<div class="viewer-toolbar"><button id="explode" class="explode-button">${icon('expand')}<span>Tách bộ phận</span></button><div class="zoom-controls"><button id="zoom-out" aria-label="Thu nhỏ">${icon('minus')}</button><span>ZOOM</span><button id="zoom-in" aria-label="Phóng to">${icon('plus')}</button></div><button id="reset" class="reset-button" aria-label="Đặt lại góc nhìn">${icon('reset')}<span>Đặt lại</span></button></div><div class="explosion-slider"><label for="separation">Ráp lại</label><input type="range" id="separation" min="0" max="100" value="0" aria-label="Độ tách bộ phận"><span>Tách ra</span></div><p class="viewer-caption">Mô hình cách điệu lấy cảm hứng từ Hyundai Accent 2021.</p></div><aside class="parts-panel"><div class="panel-heading"><span class="eyebrow">CÙNG TÌM HIỂU NÀO</span><h2>Chiếc xe có những gì?</h2><p>Chạm vào xe hoặc chọn một bộ phận.</p></div><div class="selected-part" id="selected-part" aria-live="polite"><span class="selected-symbol">${icon('spark')}</span><div><h3>Bé muốn khám phá gì?</h3><p>Thử chạm vào một bánh xe nhé!</p></div></div><div class="parts-list">${partInfo.map((part,i)=>`<button class="part-button" data-part="${part.id}" aria-pressed="false"><span class="part-number" style="--part-color:${part.color}">${String(i+1).padStart(2,'0')}</span><span>${part.name}</span><span class="part-status">${icon('sound')}</span></button>`).join('')}</div><div class="progress-area"><div><span>Hành trình khám phá</span><strong id="progress-count">${visited.size} / 12</strong></div><div class="progress-track"><span id="progress-bar" style="width:${visited.size/12*100}%"></span></div><p id="progress-message">Mỗi lần chạm là một điều mới!</p></div></aside></div></main><div id="toast" class="toast" role="status"></div>`;
}
function resetView() {
  if (!controls) return;
  controls.enableDamping = false; controls.update();
  camera.position.set(-6.5,3.6,7.5); controls.target.set(0,.9,0);
  controls.update(); controls.autoRotate = false;
  controls.enableDamping = true;
  manualExplosion = null; selected = null; car.select(null);
}
function mount() {
  detail = location.hash.startsWith('#/xe/');
  stopSpeech();
  selected = null; explosion = 0; manualExplosion = null;
  taps.clear();
  detail ? detailPage() : home();
  if (!webglError) { document.querySelector('#canvas-host').append(canvas); car.explode(0); resetView(); resize(); }
  document.querySelector('#sound').addEventListener('click', () => {
    sound = !sound; if (!sound) stopSpeech();
    const button=document.querySelector('#sound');
    button.innerHTML = `${icon(sound?'sound':'mute')}<span>Âm thanh ${sound?'bật':'tắt'}</span>`;
    button.setAttribute('aria-label',`${sound?'Tắt':'Bật'} âm thanh`); button.setAttribute('aria-pressed',String(sound));
  });
  if (detail) {
    document.querySelector('.stage-top').outerHTML = `<button class="guide-button" id="guide" aria-label="Nghe hướng dẫn cách chơi">${icon('sound')}<span>Nghe cách chơi</span></button>`;
    document.querySelector('#guide').addEventListener('click', () => { if(!sound) document.querySelector('#sound').click(); speakMessage('guide'); });
    for (const button of document.querySelectorAll('[data-part]')) {
      button.querySelector('.part-number').outerHTML = partIllustration(button.dataset.part);
    }
    const toolbar = document.querySelector('.viewer-toolbar');
    const viewPictures = {
      front: '<rect x="5" y="5" width="18" height="20" rx="5" fill="#edf0e9"/><path d="m8 12 1-4h10l1 4z" fill="#829da4"/><path d="M9 19h10m-11-4h3m6 0h3"/>',
      side: '<path d="m3 18 3-5h6l3-6h9l5 6 3 5v5H3z" fill="#edf0e9"/><circle cx="10" cy="23" r="3" fill="#536b65"/><circle cx="25" cy="23" r="3" fill="#536b65"/>',
      rear: '<rect x="5" y="5" width="18" height="20" rx="5" fill="#edf0e9"/><path d="M9 9h10v5H9z" fill="#829da4"/><path d="M7 18h4m6 0h4" stroke="#c97865" stroke-width="3"/>',
      top: '<rect x="7" y="2" width="17" height="28" rx="6" fill="#edf0e9"/><path d="m10 10 2-3h7l2 3v13H10z" fill="#829da4"/><rect x="12" y="13" width="7" height="8" fill="#f8faf4"/>',
    };
    toolbar.insertAdjacentHTML('afterend', `<div class="view-presets" role="group" aria-label="Góc nhìn chiếc xe"><span>Nhìn từ</span>${[['front','Phía trước'],['side','Bên hông'],['rear','Phía sau'],['top','Trên cao']].map(([id,label])=>`<button data-view="${id}"><svg viewBox="0 0 34 34" fill="none" stroke="#536b65" stroke-width="1.5" aria-hidden="true">${viewPictures[id]}</svg>${label}</button>`).join('')}</div>`);
    for (const button of document.querySelectorAll('[data-view]')) button.addEventListener('click', () => setView(button.dataset.view));
    document.querySelector('#stage-part').addEventListener('click', () => { const part = partInfo.find(p=>p.id===selected); if(part) speak(part); });
    for (const button of document.querySelectorAll('[data-part]')) button.addEventListener('click', () => choosePart(button.dataset.part));
    document.querySelector('#explode').addEventListener('click', () => { manualExplosion = (manualExplosion ?? explosion) > .5 ? 0 : 1; speakMessage(manualExplosion ? 'separate' : 'assemble'); });
    document.querySelector('#separation').addEventListener('input', e => { manualExplosion = Number(e.target.value)/100; });
    document.querySelector('#zoom-in').addEventListener('click', () => zoom(.88));
    document.querySelector('#zoom-out').addEventListener('click', () => zoom(1.14));
    document.querySelector('#reset').addEventListener('click', () => { resetView(); updateSelection(); speakMessage('reset'); });
    updateSelection();
  }
  window.scrollTo(0,0);
}
function setView(view) {
  if (!controls) return;
  const directions = { front:[-1,.22,0], side:[0,.22,1], rear:[1,.22,0], top:[-.12,1,.12] };
  const direction = new THREE.Vector3(...directions[view]).normalize();
  const distance = controls.getDistance();
  controls.enableDamping = false; controls.update();
  camera.position.copy(controls.target).addScaledVector(direction,distance); controls.update();
  controls.enableDamping = true;
  speakMessage(view);
}
function zoom(factor) {
  if (!controls) return;
  manualExplosion = null;
  const direction = camera.position.clone().sub(controls.target);
  direction.setLength(THREE.MathUtils.clamp(direction.length()*factor, controls.minDistance, controls.maxDistance));
  camera.position.copy(controls.target).add(direction); controls.update();
}
function toast(message) {
  const el=document.querySelector('#toast'); if(!el) return;
  el.textContent=message; el.classList.add('visible');
  clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove('visible'),6000);
}
function speak(part) {
  playNarration(part.id,part.name);
}
function speakMessage(id) { playNarration(id,audioMessages[id]); }
function playNarration(id,text) {
  if (!sound) return;
  stopSpeech();
  const sequence=audioSequence;
  narration.src=`/audio/vi/${id}.m4a`;
  narration.play().catch(() => {
    if (sequence===audioSequence && sound) speakWithDevice(text);
  });
}
function speakWithDevice(text) {
  if (!window.speechSynthesis) { toast('Trình duyệt này chưa hỗ trợ đọc tên. Bé vẫn có thể xem tên từng bộ phận.'); return; }
  loadVoices();
  if (!vietnameseVoice) { toast('Thiết bị chưa có giọng tiếng Việt. Hãy thêm giọng tiếng Việt trong cài đặt giọng nói để nghe tên nhé.'); return; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang='vi-VN'; utterance.voice=vietnameseVoice; utterance.rate=.85;
  utterance.onerror = e => { if (!['interrupted','canceled'].includes(e.error)) toast('Chưa đọc được tên. Bé hãy bấm nút nghe lại nhé.'); };
  window.speechSynthesis.speak(utterance);
}
function choosePart(id) {
  const part=partInfo.find(p=>p.id===id); if(!part) return;
  selected=id; visited.add(id); car?.select(id);
  if (['engine','seats','steering','axles'].includes(id) && explosion<.7) manualExplosion=1;
  updateSelection(); speak(part);
}
function updateSelection() {
  const part = partInfo.find(p=>p.id===selected);
  const card=document.querySelector('#selected-part'); if(!card) return;
  const stagePart=document.querySelector('#stage-part');
  stagePart.hidden=!part;
  if(part) {
    stagePart.querySelector('span').textContent=part.name;
    stagePart.setAttribute('aria-label',`Đọc lại tên ${part.name} trên mô hình`);
  }
  card.innerHTML=part ? `<span class="selected-symbol" style="background:${part.color}30">${icon('car')}</span><div><span class="english-name">${part.english}</span><h3>${part.name}</h3><p>${part.description}</p></div><button id="replay" aria-label="Đọc lại tên ${part.name}">${icon('sound')}</button>` : `<span class="selected-symbol">${icon('spark')}</span><div><h3>Bé muốn khám phá gì?</h3><p>Thử chạm vào một bánh xe nhé!</p></div>`;
  if(part) card.querySelector('.selected-symbol').innerHTML=partIllustration(part.id);
  document.querySelector('#replay')?.addEventListener('click',()=>speak(part));
  for(const button of document.querySelectorAll('[data-part]')) {
    button.classList.toggle('selected',button.dataset.part===selected);
    button.setAttribute('aria-pressed',String(button.dataset.part===selected));
    button.querySelector('.part-status').innerHTML=icon(visited.has(button.dataset.part)?'check':'sound');
  }
  document.querySelector('#progress-count').textContent=`${visited.size} / 12`;
  document.querySelector('#progress-bar').style.width=`${visited.size/12*100}%`;
  document.querySelector('#progress-message').textContent=visited.size===12?'Giỏi quá! Bé đã khám phá cả chiếc xe!':'Mỗi lần chạm là một điều mới!';
}
const raycaster=new THREE.Raycaster(); const pointer=new THREE.Vector2();
const taps=createTapTracker();
canvas.addEventListener('pointerdown',e=>{taps.down(e); if(!e.isPrimary) manualExplosion=null;});
canvas.addEventListener('pointermove',e=>taps.move(e));
canvas.addEventListener('pointercancel',e=>taps.cancel(e));
canvas.addEventListener('lostpointercapture',e=>taps.cancel(e));
canvas.addEventListener('pointerup',e=>{
  if (!taps.up(e) || !detail || !car) return;
  const rect=canvas.getBoundingClientRect(); pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
  raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObject(car.root,true).find(h=>h.object.userData.part);
  if(hit) choosePart(hit.object.userData.part);
});
canvas.addEventListener('wheel',()=>{manualExplosion=null;},{passive:true});
function resize() {
  if (!renderer) return;
  const host=document.querySelector('#canvas-host'); if(!host) return;
  const {width,height}=host.getBoundingClientRect();
  renderer.setSize(width,height,false); camera.aspect=width/height;
  // Widen the lens on portrait screens so a fully separated car still fits.
  fittedFov = Math.max(36, THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(46)/2)/camera.aspect)));
  camera.fov = fittedFov + explosion*10;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize',resize); window.addEventListener('hashchange',mount);
mount();
if (renderer) {
  let previous=performance.now();
  renderer.setAnimationLoop(now=>{
    if (document.hidden || (touchDevice.matches && now-previous < 1000/30)) return;
    const dt=Math.min((now-previous)/1000,.05);previous=now;
    controls.update();
    const target=detail?(manualExplosion ?? (1-THREE.MathUtils.smoothstep(controls.getDistance(),7.0,9.3))):0;
    explosion=reducedMotion.matches?target:THREE.MathUtils.damp(explosion,target,5,dt);
    car.explode(explosion);
    if (Math.abs(camera.fov-(fittedFov+explosion*10))>.01) {
      camera.fov=fittedFov+explosion*10; camera.updateProjectionMatrix();
    }
    if(detail) {
      const slider=document.querySelector('#separation'); if(document.activeElement!==slider) slider.value=Math.round(explosion*100);
      const btn=document.querySelector('#explode'); btn.classList.toggle('is-exploded',target>.5);
      btn.setAttribute('aria-pressed',String(target>.5));
      btn.querySelector('span').textContent=target>.5?'Ráp lại chiếc xe':'Tách bộ phận';
    }
    renderer.render(scene,camera);
  });
}
