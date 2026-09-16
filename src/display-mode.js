import { readDisplayMode, saveDisplayMode } from './display-preference.js';
import { vehicles } from './vehicle-catalog.js';
import { vehiclePicture } from './vehicle-pictures.js';

// Access can itself throw in restricted browsing environments.
let storage;
try { storage = window.localStorage; } catch { /* Session-only preference. */ }
let mode = readDisplayMode(storage);

export function installDisplayMode({ detail, vehicle, resize, stopSpeech }) {
  const header = document.querySelector('.header');
  header.insertAdjacentHTML('beforeend', '<button class="settings-button" aria-label="Cài đặt giao diện" title="Cài đặt giao diện"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="#f8f7f2"/><circle cx="16" cy="17" r="3" fill="#f8f7f2"/></svg><span>Giao diện</span></button>');
  const settingsButton = header.querySelector('.settings-button');
  document.querySelectorAll('.vehicle-card').forEach((card, index) => card.setAttribute('aria-label', vehicles[index].name));
  const settings = document.createElement('dialog');
  settings.className = 'garage-dialog settings-dialog';
  settings.setAttribute('aria-labelledby', 'settings-title');
  settings.innerHTML = `<form method="dialog"><div class="dialog-heading"><h2 id="settings-title">Giao diện cho gia đình</h2><button aria-label="Đóng cài đặt" class="dialog-close">×</button></div><p>Bố mẹ chọn cách khám phá phù hợp. Lựa chọn được nhớ trên trình duyệt này.</p><fieldset><legend>Chế độ hiển thị</legend><label><input type="radio" name="display-mode" value="standard"><span><strong>Giao diện hiện tại</strong><small>Đầy đủ tên xe, mô tả và hành trình khám phá.</small></span></label><label><input type="radio" name="display-mode" value="child"><span><strong>Dành cho bé</strong><small>Xe lớn, chọn bằng hình, chạm để nghe. Không cần biết đọc.</small></span></label></fieldset><p class="preference-status" role="status"></p><button class="primary-button settings-done">Xong</button></form>`;
  document.querySelector('#app').append(settings);
  settingsButton.addEventListener('click', () => { stopSpeech(); settings.showModal(); });
  settings.addEventListener('close', () => settingsButton.focus());
  let focusButton;
  if (detail) {
    header.insertAdjacentHTML('afterbegin', `<button class="vehicle-picker-button" aria-label="Chọn xe khác" aria-haspopup="dialog">${vehiclePicture(vehicle.id, vehicle.color)}<span aria-hidden="true">▾</span></button>`);
    const pickerButton = header.querySelector('.vehicle-picker-button');
    const picker = document.createElement('dialog');
    picker.className = 'garage-dialog vehicle-dialog';
    picker.setAttribute('aria-labelledby', 'picker-title');
    picker.innerHTML = `<div class="dialog-heading"><h2 id="picker-title">Gara của bé</h2><button class="dialog-close" aria-label="Đóng bảng chọn xe">×</button></div><div class="vehicle-picker-grid">${vehicles.map(v => `<a href="#/xe/${v.id}" aria-label="${v.name}" ${v.id === vehicle.id ? 'aria-current="true"' : ''}>${vehiclePicture(v.id, v.color)}${v.id === vehicle.id ? '<span class="vehicle-check" aria-hidden="true">✓</span>' : ''}</a>`).join('')}</div>`;
    document.querySelector('#app').append(picker);
    pickerButton.addEventListener('click', () => { stopSpeech(); picker.showModal(); });
    picker.querySelector('.dialog-close').addEventListener('click', () => picker.close());
    picker.querySelectorAll('a').forEach(a => a.addEventListener('click', () => picker.close()));
    picker.addEventListener('close', () => pickerButton.focus());
    header.insertAdjacentHTML('beforeend', '<button class="focus-button" aria-label="Mở rộng màn xem xe" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/></svg></button>');
    focusButton = header.querySelector('.focus-button');
    focusButton.addEventListener('click', () => setFocus(!document.body.classList.contains('focus-view')));
    document.querySelectorAll('[data-part]').forEach(button => button.setAttribute('aria-label', button.querySelector('span').textContent));
    document.querySelectorAll('[data-view]').forEach(button => {
      const label = button.lastChild;
      const span = document.createElement('span');
      span.textContent = label.textContent;
      label.replaceWith(span);
      button.setAttribute('aria-label', span.textContent);
    });
    const list = document.querySelector('.parts-list');
    list.id = 'picture-parts';
    list.insertAdjacentHTML('beforebegin', '<button class="parts-scroll" data-scroll="-1" aria-label="Các bộ phận trước" aria-controls="picture-parts">‹</button>');
    list.insertAdjacentHTML('afterend', '<button class="parts-scroll" data-scroll="1" aria-label="Các bộ phận tiếp theo" aria-controls="picture-parts">›</button>');
    document.querySelectorAll('[data-scroll]').forEach(button => button.addEventListener('click', () => {
      const direction = Number(button.dataset.scroll);
      const horizontal = list.scrollWidth > list.clientWidth;
      list.scrollBy({ left: horizontal ? direction * list.clientWidth * .75 : 0, top: horizontal ? 0 : direction * list.clientHeight * .75, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }));
  }
  function setFocus(active) {
    document.body.classList.toggle('focus-view', detail && active);
    focusButton?.setAttribute('aria-pressed', String(active));
    focusButton?.setAttribute('aria-label', active ? 'Thu gọn màn xem xe' : 'Mở rộng màn xem xe');
    focusButton?.querySelector('path').setAttribute('d', active ? 'M3 9h6V3m6 0v6h6M9 21v-6H3m18 0h-6v6' : 'M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6');
    resize();
  }
  function apply() {
    document.body.classList.toggle('child-mode', mode === 'child');
    settings.querySelector(`[value="${mode}"]`).checked = true;
    settingsButton.setAttribute('aria-label', `Cài đặt giao diện: ${mode === 'child' ? 'Dành cho bé' : 'Giao diện hiện tại'}`);
    setFocus(detail && mode === 'child');
  }
  settings.querySelectorAll('input').forEach(input => input.addEventListener('change', () => {
    mode = input.value;
    const saved = saveDisplayMode(storage, mode);
    apply();
    settings.querySelector('.preference-status').textContent = saved ? 'Đã lưu lựa chọn.' : 'Đã đổi giao diện. Trình duyệt không cho lưu; lựa chọn chỉ dùng trong phiên này.';
  }));
  apply();
}
