const audio = document.querySelector('#audio');
const trackList = document.querySelector('#trackList');
const gate = document.querySelector('#gate');
const toast = document.querySelector('#toast');
let tracks = [];
let currentIndex = -1;
let headphoneReady = false;
let deferredInstall = null;
const $ = (id) => document.getElementById(id);

function notify(message) {
  toast.textContent = message; toast.classList.add('show');
  clearTimeout(notify.timer); notify.timer = setTimeout(() => toast.classList.remove('show'), 3000);
}
function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}
function safeLabel(label) { return /headphone|headset|earphone|earbud|이어폰|헤드폰|헤드셋/i.test(label || ''); }
async function checkOutput() {
  const title = $('gateTitle'), message = $('gateMessage');
  $('checkButton').disabled = true;
  try {
    if (!navigator.mediaDevices?.enumerateDevices) throw new Error('이 브라우저에서는 오디오 기기 확인을 지원하지 않아요.');
    const devices = await navigator.mediaDevices.enumerateDevices();
    const outputs = devices.filter(d => d.kind === 'audiooutput');
    const named = outputs.filter(d => d.label);
    const hasHeadphone = named.some(d => safeLabel(d.label));
    const speaker = named.some(d => /speaker|스피커/i.test(d.label));
    if (hasHeadphone) {
      headphoneReady = true; gate.className = 'gate ready'; $('gateIcon').textContent = '✓';
      title.textContent = '헤드폰 또는 이어폰이 감지됐어요';
      message.textContent = '재생 준비가 완료됐어요. 브라우저가 제공한 오디오 기기 이름을 기준으로 확인합니다.';
      $('outputButton').hidden = !(outputs.some(d => d.deviceId && d.deviceId !== 'default' && typeof audio.setSinkId === 'function'));
    } else if (!named.length) {
      // Browser privacy settings may hide output names; don't claim a hardware check succeeded.
      headphoneReady = false; gate.className = 'gate blocked'; $('gateIcon').textContent = '⌁';
      title.textContent = '연결 상태를 확인할 수 없어요';
      message.textContent = '브라우저가 출력 기기 이름을 숨기고 있어요. 권한을 허용하거나 기기를 직접 확인해 주세요.';
    } else {
      headphoneReady = false; gate.className = 'gate blocked'; $('gateIcon').textContent = '⌁';
      title.textContent = speaker ? '헤드폰 연결이 감지되지 않았어요' : '헤드폰 또는 이어폰을 확인할 수 없어요';
      message.textContent = '이어폰/헤드폰 연결 후 다시 확인해 주세요.';
    }
  } catch (error) {
    headphoneReady = false; gate.className = 'gate blocked'; $('gateIcon').textContent = '⌁';
    title.textContent = '오디오 기기를 확인할 수 없어요'; message.textContent = error.message;
  } finally { $('checkButton').disabled = false; }
}
function renderTracks() {
  $('trackCount').textContent = `${tracks.length} TRACKS`;
  $('emptyNote').hidden = tracks.length > 0;
  trackList.innerHTML = tracks.map((track, i) => `<article class="track" data-index="${i}"><span class="track-num">${String(i + 1).padStart(2, '0')}</span><div class="track-info"><strong>${escapeHtml(track.title)}</strong><span>${escapeHtml(track.artist)}</span></div><span class="track-duration">${escapeHtml(track.duration || '—')}</span><button class="track-play" aria-label="${escapeHtml(track.title)} 재생" data-play="${i}">▶</button></article>`).join('');
}
function escapeHtml(value = '') { return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
async function playIndex(index) {
  if (!headphoneReady) { notify('먼저 이어폰 또는 헤드폰 연결을 확인해 주세요.'); return; }
  const track = tracks[index]; if (!track) return;
  if (!track.src || track.src.includes('example')) { notify('음원 파일을 아직 등록하지 않았어요.'); return; }
  if (currentIndex !== index) { currentIndex = index; audio.src = track.src; $('nowTitle').textContent = track.title; $('nowArtist').textContent = track.artist; }
  try { await audio.play(); $('playButton').textContent = 'Ⅱ'; $('playButton').setAttribute('aria-label', '일시정지'); }
  catch { notify('음원을 불러오지 못했어요. 파일 경로를 확인해 주세요.'); }
  document.querySelectorAll('.track').forEach((row, i) => row.classList.toggle('active', i === index));
}
async function pickOutput() {
  const outputs = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'audiooutput' && d.deviceId && d.deviceId !== 'default');
  const headphones = outputs.filter(d => safeLabel(d.label));
  if (!headphones.length || !audio.setSinkId) { notify('이 브라우저에서는 출력 기기 선택을 지원하지 않아요.'); return; }
  const choice = headphones.length === 1 ? headphones[0] : headphones.find(d => confirm(`${d.label}로 재생할까요? 확인을 누르면 이 기기를 선택합니다.`));
  if (choice) { try { await audio.setSinkId(choice.deviceId); notify(`${choice.label} 출력으로 설정했어요.`); } catch { notify('출력 기기를 설정하지 못했어요.'); } }
}

$('checkButton').addEventListener('click', checkOutput);
$('outputButton').addEventListener('click', pickOutput);
trackList.addEventListener('click', e => { const button = e.target.closest('[data-play]'); if (button) playIndex(Number(button.dataset.play)); });
$('playButton').addEventListener('click', () => { if (audio.paused) playIndex(currentIndex); else audio.pause(); });
audio.addEventListener('loadedmetadata', () => { $('totalTime').textContent = formatTime(audio.duration); $('seek').disabled = false; $('playButton').disabled = false; });
audio.addEventListener('timeupdate', () => { $('currentTime').textContent = formatTime(audio.currentTime); $('seek').value = audio.duration ? Math.round(audio.currentTime / audio.duration * 1000) : 0; });
audio.addEventListener('pause', () => { $('playButton').textContent = '▶'; $('playButton').setAttribute('aria-label', '재생'); });
audio.addEventListener('ended', () => { if (currentIndex < tracks.length - 1) playIndex(currentIndex + 1); });
$('seek').addEventListener('input', () => { if (audio.duration) audio.currentTime = Number($('seek').value) / 1000 * audio.duration; });
if (navigator.mediaDevices?.addEventListener) navigator.mediaDevices.addEventListener('devicechange', checkOutput);
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); deferredInstall = event; $('installButton').hidden = false; });
$('installButton').addEventListener('click', async () => { if (deferredInstall) { deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; $('installButton').hidden = true; } else notify('Chrome 메뉴에서 “앱 설치” 또는 “홈 화면에 추가”를 선택해 주세요.'); });
fetch('/api/tracks').then(r => r.json()).then(data => { tracks = Array.isArray(data) ? data : []; renderTracks(); }).catch(() => { $('trackCount').textContent = '오류'; notify('플레이리스트를 불러오지 못했어요.'); });
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
