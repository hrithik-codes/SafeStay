/* SafeStay — Safety Map (Leaflet + OpenStreetMap) */

const fmtMap = (n) => `₹${n.toLocaleString('en-IN')}`;

const map = L.map('map', { scrollWheelZoom: true }).setView([26.9124, 75.7873], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19,
}).addTo(map);

let markers = [];

function tierColor(tier) {
  return { verified: '#1A7A4C', caution: '#C17817', unsafe: '#B3261E' }[tier] || '#13171C';
}

function buildPinIcon(pin) {
  const color = tierColor(pin.safety_tier);
  const certBadge = pin.certified
    ? `<div style="position:absolute; top:-6px; right:-6px; width:14px; height:14px; background:#13171C; border-radius:50%; display:flex; align-items:center; justify-content:center; border:1.5px solid #F2C200;">
         <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="#F2C200" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
       </div>`
    : '';
  const html = `
    <div style="position:relative; width:30px; height:30px;">
      <div style="width:30px; height:30px; background:${color}; border-radius:50% 50% 50% 0; transform:rotate(-45deg); border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.35);"></div>
      ${certBadge}
    </div>`;
  return L.divIcon({ html, className: '', iconSize: [30, 30], iconAnchor: [15, 28] });
}

function popupContent(pin) {
  const score = pin.active_profile_score ? pin.active_profile_score.score : pin.safety_score;
  const label = pin.active_profile_score ? pin.active_profile_score.label : 'Overall Safety';
  return `
    <div class="mono" style="min-width:200px;">
      <div style="font-family:'Barlow Condensed',sans-serif; font-weight:700; text-transform:uppercase; font-size:15px; margin-bottom:2px;">${pin.name}</div>
      <div style="font-size:12px; color:#666; margin-bottom:8px;">${pin.area}, ${pin.city}</div>
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
        <span style="font-size:11px; text-transform:uppercase; font-weight:700; color:${tierColor(pin.safety_tier)};">${pin.safety_tier}</span>
        <span style="font-weight:700; color:${tierColor(pin.safety_tier)};">${score}/100</span>
      </div>
      <div style="font-size:11px; color:#888; margin-bottom:8px;">${label}</div>
      <div style="display:flex; align-items:center; justify-content:space-between; font-size:13px; margin-bottom:10px;">
        <span style="font-weight:700;">${fmtMap(pin.price_per_night)}/night</span>
        <span style="font-size:11px; ${pin.is_bookable ? 'color:#1A7A4C;' : 'color:#B3261E;'} font-weight:700;">${pin.is_bookable ? 'BOOKABLE' : 'BLOCKED'}</span>
      </div>
      <a href="/hotel/${pin.id}" style="display:block; text-align:center; background:#13171C; color:#F2C200; padding:7px 0; border-radius:3px; font-size:12px; font-weight:700; text-transform:uppercase; text-decoration:none;">View Details</a>
    </div>`;
}

async function loadPins() {
  const travellerType = document.getElementById('map-traveller-select').value;
  const params = new URLSearchParams();
  if (travellerType) params.set('traveller_type', travellerType);

  const res = await fetch(`/api/map-data?${params.toString()}`);
  const data = await res.json();

  markers.forEach((m) => map.removeLayer(m));
  markers = [];

  data.pins.forEach((pin) => {
    const marker = L.marker([pin.lat, pin.lng], { icon: buildPinIcon(pin) }).addTo(map);
    marker.bindPopup(popupContent(pin));
    markers.push(marker);
  });
}

document.getElementById('map-traveller-select').addEventListener('change', loadPins);

loadPins();
