/* SafeStay — hotel detail page logic */

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;
const root = document.getElementById('hotel-root');

let currentHotel = null;
let activeTravellerType = '';

const TRAVELLER_OPTIONS = [
  { key: '', label: 'Overall Safety' },
  { key: 'solo_female', label: 'Solo Female' },
  { key: 'solo_male', label: 'Solo Traveller' },
  { key: 'family', label: 'Family' },
  { key: 'group', label: 'Group' },
  { key: 'child', label: 'With Children' },
];

function checkRow(label, passed) {
  return `
    <div class="check-row">
      <span>${label}</span>
      <span class="check-icon ${passed ? 'check-pass' : 'check-fail'}">
        ${passed
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'}
      </span>
    </div>`;
}

function tierBlock(tier) {
  const cfg = {
    verified: { color: 'verified', text: 'Safety Verified', icon: 'check' },
    caution: { color: 'caution', text: 'Use Caution', icon: 'alert' },
    unsafe: { color: 'danger', text: 'Unsafe — Booking Blocked', icon: 'cross' },
  }[tier];
  return cfg;
}

function gaugeBig(score, tier) {
  const color = { verified: 'var(--verified)', caution: 'var(--caution)', unsafe: 'var(--danger)' }[tier];
  const size = 120, r = 50, c = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  return `
    <div class="gauge" style="width:${size}px;height:${size}px;">
      <svg width="${size}" height="${size}">
        <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#E5E1D5" stroke-width="10"></circle>
        <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${color}" stroke-width="10"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"
          style="transition: stroke-dashoffset 0.6s ease;"></circle>
      </svg>
      <div class="gauge-label" style="color:${color}; font-size:30px;">${score}<div style="font-size:10px; letter-spacing:0.05em; opacity:0.6; margin-top:2px;">/ 100</div></div>
    </div>`;
}

function renderTravellerTabs() {
  return `
    <div class="flex flex-wrap gap-2" id="traveller-tabs">
      ${TRAVELLER_OPTIONS.map((t) => `
        <button data-key="${t.key}" class="traveller-tab px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase border ${t.key === activeTravellerType ? 'bg-ink text-paper border-ink' : 'border-ink/20 text-ink/70'}">${t.label}</button>
      `).join('')}
    </div>`;
}

function renderHardChecklist(h) {
  return h.critical_checks.map((c) => checkRow(c.label, c.passed)).join('');
}

function renderSoftFactors(h) {
  const rows = [
    ['CCTV Coverage', `${h.cctv_coverage}%`],
    ['Well-lit Corridors', h.well_lit_corridors ? 'Yes' : 'No'],
    ['Female Staff at Front Desk', h.female_staff_front_desk ? 'Yes' : 'No'],
    ['24×7 Security Guard', h['security_24x7'] ? 'Yes' : 'No'],
    ['Keycard Floor Access', h.keycard_floor_access ? 'Yes' : 'No'],
    ['In-room Safe', h.in_room_safe ? 'Yes' : 'No'],
    ['Child-proofing', h.child_proofing ? 'Yes' : 'No'],
    ['Pool Lifeguard', h.pool_lifeguard ? 'Yes' : 'No'],
    ['Group-friendly Rooms', h.group_friendly_rooms ? 'Yes' : 'No'],
    ['Strict ID Verification', h.id_verification_strict ? 'Yes' : 'No'],
    ['Nearest Hospital', `${h.near_hospital_km} km`],
    ['Nearest Police Station', `${h.near_police_km} km`],
    ['Building Floors', h.building_floors],
    ['Last Fire Drill', h.last_fire_drill],
  ];
  return rows.map(([label, val]) => `
    <div class="flex items-center justify-between py-2 border-b border-dashed border-line text-sm">
      <span class="text-ink/60">${label}</span>
      <span class="font-mono font-semibold">${val}</span>
    </div>`).join('');
}

function renderCheckinDocs(docs) {
  return docs.map((d) => `
    <div class="flex gap-3 py-3 border-b border-dashed border-line last:border-none">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 flex-shrink-0 text-ink/40 mt-0.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
      <div>
        <div class="font-semibold text-sm">${d.title}</div>
        <div class="text-xs text-ink/55 mt-0.5">${d.detail}</div>
      </div>
    </div>`).join('');
}

function renderAlternativeCard(h) {
  return `
    <a href="/hotel/${h.id}" class="card card-tag-${h.safety_tier} block p-4 hover:shadow-lg flex-shrink-0 w-64">
      <div class="flex items-center justify-between mb-2">
        <span class="tier-pill tier-${h.safety_tier}"><span class="dot"></span>${h.safety_tier}</span>
        <span class="font-mono text-xs text-ink/50">${h.distance_km} km away</span>
      </div>
      <h4 class="font-stencil font-bold uppercase text-base leading-tight">${h.name}</h4>
      <p class="text-xs text-ink/55 mt-0.5">${h.area}</p>
      <div class="flex items-center justify-between mt-3">
        <span class="font-bold">${fmt(h.price_per_night)}<span class="text-xs text-ink/50">/night</span></span>
        <span class="font-mono text-sm font-bold" style="color:${h.safety_score >= 75 ? 'var(--verified)' : 'var(--caution)'}">${h.safety_score}</span>
      </div>
    </a>`;
}

async function loadAlternatives(hotelId) {
  const res = await fetch(`/api/hotels/${hotelId}/alternatives`);
  const data = await res.json();
  return data.alternatives;
}

function renderPage(h) {
  const tier = h.active_profile_score
    ? (h.active_profile_score.score >= 75 ? 'verified' : h.active_profile_score.score >= 55 ? 'caution' : 'unsafe')
    : h.safety_tier;
  const displayScore = h.active_profile_score ? h.active_profile_score.score : h.safety_score;
  const cfg = tierBlock(h.safety_tier); // booking gate always uses TRUE safety tier, never the profile lens
  const profileCfg = tierBlock(tier);

  root.innerHTML = `
    <!-- Header -->
    <div class="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
      <div class="min-w-0">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 class="font-stencil uppercase font-bold text-3xl md:text-4xl leading-tight">${h.name}</h1>
            <p class="text-ink/60 mt-1 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M21 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 1118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              ${h.area}, ${h.city}
            </p>
          </div>
          <span class="tier-pill tier-${h.safety_tier} text-sm">${{verified:'Safety Verified',caution:'Use Caution',unsafe:'Unsafe — Blocked'}[h.safety_tier]}</span>
        </div>

        <div class="h-52 md:h-64 bg-gradient-to-br from-ink to-ink-soft rounded-sm mt-5 flex items-center justify-center relative overflow-hidden">
          <svg viewBox="0 0 24 24" fill="none" stroke="#F2C200" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.45" class="w-32 h-32"><rect x="4" y="2" width="16" height="20" rx="0.5"></rect><line x1="7" y1="6" x2="10" y2="6"></line><line x1="14" y1="6" x2="17" y2="6"></line><line x1="7" y1="10" x2="10" y2="10"></line><line x1="14" y1="10" x2="17" y2="10"></line><line x1="7" y1="14" x2="10" y2="14"></line><line x1="14" y1="14" x2="17" y2="14"></line><path d="M10 22v-4a2 2 0 0 1 4 0v4"></path></svg>
          <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div class="bg-paper/95 rounded-sm px-3 py-2 text-xs font-mono">${h.description}</div>
          </div>
        </div>

        <!-- Traveller lens -->
        <div class="mt-7">
          <div class="eyebrow mb-2">View safety score as</div>
          ${renderTravellerTabs()}
        </div>

        <!-- Score summary -->
        <div class="mt-5 card p-5 flex items-center gap-5 flex-wrap">
          ${gaugeBig(displayScore, tier)}
          <div>
            <div class="font-stencil uppercase font-bold text-xl">${h.active_profile_score ? h.active_profile_score.label + ' Score' : 'Overall Safety Score'}</div>
            <p class="text-sm text-ink/60 mt-1 max-w-sm">${
              h.active_profile_score
                ? 'Re-weighted from the same inspection data to reflect what matters most for this traveller profile.'
                : 'Base compliance score from fire, structural, and electrical safety inspection data.'
            }</p>
          </div>
        </div>

        <!-- Hard checklist -->
        <div class="mt-7">
          <h2 class="font-stencil uppercase font-bold text-xl mb-3 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" class="w-5 h-5"><path d="M12 2c2 3 1 4.5-.3 6.2C10.5 10 9.5 11.5 9.5 13.5a4.5 4.5 0 0 0 9 0c0-2.5-1.2-4-2.2-5.3C15 6.7 14.3 5 14.8 3c-1 .5-2 1.5-2.3 2.7C12.2 4 12.3 3 12 2zM12 12.5c.6 0 1 .6.9 1.4-.1.7-.6 1.3-1.2 1.9-.8.7-1.2 1.4-1.2 2.2a2 2 0 0 0 4 0c0-.9-.5-1.4-1-2-.3-.3-.5-.7-.4-1.1.1-.6.5-1 .9-1.4-.7-.3-1.4-.5-2-1z" opacity="0.85"></path></svg>
            Mandatory Fire &amp; Structural Checks
          </h2>
          <div class="card p-5">${renderHardChecklist(h)}</div>
        </div>

        <!-- Soft factors -->
        <div class="mt-7">
          <h2 class="font-stencil uppercase font-bold text-xl mb-3">Additional Safety Factors</h2>
          <div class="card p-5 grid sm:grid-cols-2 gap-x-8">${renderSoftFactors(h)}</div>
        </div>

        <!-- Check-in documents -->
        <div class="mt-7">
          <h2 class="font-stencil uppercase font-bold text-xl mb-3">Documents Required at Check-in</h2>
          <div class="card p-5">${renderCheckinDocs(h.checkin_documents)}</div>
        </div>

        <!-- Alternatives (only if blocked) -->
        <div id="alternatives-section" class="mt-7 ${h.is_bookable ? 'hidden' : ''}">
          <h2 class="font-stencil uppercase font-bold text-xl mb-3 text-danger">Safer Alternatives Nearby</h2>
          <div id="alt-list" class="flex gap-4 overflow-x-auto pb-2"></div>
        </div>
      </div>

      <!-- Booking panel -->
      <div>
        <div class="card p-5 sticky top-24">
          <div class="flex items-baseline justify-between mb-1">
            <span class="font-stencil font-bold text-2xl">${fmt(h.price_per_night)}</span>
            <span class="text-sm text-ink/50">/ night</span>
          </div>
          <div class="flex items-center gap-1.5 text-sm text-ink/60 mb-4">
            <svg viewBox="0 0 24 24" fill="#F2C200" class="w-4 h-4"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            ${h.star_rating.toFixed(1)} star rating
          </div>

          <div class="space-y-3 mb-4">
            <div>
              <label class="eyebrow block mb-1">Check-in</label>
              <input type="date" id="checkin-input" class="w-full border border-ink/15 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hivis">
            </div>
            <div>
              <label class="eyebrow block mb-1">Check-out</label>
              <input type="date" id="checkout-input" class="w-full border border-ink/15 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hivis">
            </div>
            <div>
              <label class="eyebrow block mb-1">Guest name</label>
              <input type="text" id="guest-name-input" placeholder="Full name" class="w-full border border-ink/15 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hivis">
            </div>
          </div>

          ${h.is_bookable
            ? `<button id="book-btn" class="btn btn-primary w-full">Book This Stay</button>
               <p class="text-xs text-ink/45 mt-2 text-center">Free cancellation per hotel policy</p>`
            : `<button id="blocked-btn" class="btn btn-block w-full">Booking Blocked — Unsafe</button>
               <p class="text-xs text-danger/80 mt-2 text-center">This property failed mandatory fire/structural checks</p>`}

          <div id="booking-result" class="mt-3"></div>
        </div>
      </div>
    </div>
  `;

  // Wire traveller tabs
  document.querySelectorAll('.traveller-tab').forEach((btn) => {
    btn.addEventListener('click', async () => {
      activeTravellerType = btn.dataset.key;
      const updated = await fetchHotel();
      renderPage(updated);
    });
  });

  // Wire booking
  const bookBtn = document.getElementById('book-btn');
  if (bookBtn) bookBtn.addEventListener('click', () => submitBooking(h));

  const blockedBtn = document.getElementById('blocked-btn');
  if (blockedBtn) blockedBtn.addEventListener('click', () => showBlockedModal(h));

  // Load alternatives if blocked
  if (!h.is_bookable) {
    loadAlternatives(h.id).then((alts) => {
      document.getElementById('alt-list').innerHTML = alts.map(renderAlternativeCard).join('') || '<p class="text-sm text-ink/50">No verified alternatives found nearby.</p>';
      window._modalAlts = alts;
    });
  }
}

async function submitBooking(h) {
  const guest_name = document.getElementById('guest-name-input').value.trim();
  const checkin = document.getElementById('checkin-input').value;
  const checkout = document.getElementById('checkout-input').value;
  const resultBox = document.getElementById('booking-result');

  if (!guest_name || !checkin || !checkout) {
    resultBox.innerHTML = `<p class="text-sm text-danger font-semibold">Please fill in all fields.</p>`;
    return;
  }

  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hotel_id: h.id, guest_name, checkin, checkout, traveller_type: activeTravellerType || 'solo_male' }),
  });
  const data = await res.json();

  if (!res.ok) {
    showBlockedModal(h, data.failed_checks);
    return;
  }

  resultBox.innerHTML = `
    <div class="mt-2 p-3 bg-verified/10 border border-verified rounded-sm">
      <p class="text-sm font-bold text-verified">Booking confirmed ✓</p>
      <p class="text-xs text-ink/60 mt-1">Booking #${data.booking_id} · ${data.nights} night(s) · ${fmt(data.total_price)} total</p>
    </div>`;
}

function showBlockedModal(h, failedChecks) {
  const modal = document.getElementById('blocked-modal');
  const list = document.getElementById('modal-failed-list');
  const checks = failedChecks
    ? failedChecks.map((label) => `<li class="flex items-center gap-2 text-danger"><span class="w-1.5 h-1.5 rounded-full bg-danger inline-block"></span>${label}</li>`).join('')
    : h.critical_checks.filter((c) => !c.passed).map((c) => `<li class="flex items-center gap-2 text-danger"><span class="w-1.5 h-1.5 rounded-full bg-danger inline-block"></span>${c.label}</li>`).join('');
  list.innerHTML = checks;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'close-modal' || e.target.id === 'blocked-modal') {
    document.getElementById('blocked-modal').classList.add('hidden');
    document.getElementById('blocked-modal').classList.remove('flex');
  }
  if (e.target.id === 'scroll-to-alts') {
    document.getElementById('blocked-modal').classList.add('hidden');
    document.getElementById('blocked-modal').classList.remove('flex');
    document.getElementById('alternatives-section')?.scrollIntoView({ behavior: 'smooth' });
  }
});

async function fetchHotel() {
  const params = new URLSearchParams();
  if (activeTravellerType) params.set('traveller_type', activeTravellerType);
  const res = await fetch(`/api/hotels/${HOTEL_ID}?${params.toString()}`);
  return res.json();
}

(async function init() {
  const h = await fetchHotel();
  currentHotel = h;
  renderPage(h);
})();
