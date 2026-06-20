/* SafeStay — homepage logic */

const state = {
  city: '',
  travellerType: '',
  tier: '',
  sort: 'safety',
};

const grid = document.getElementById('hotel-grid');
const meta = document.getElementById('results-meta');
const cityFmt = (n) => `₹${n.toLocaleString('en-IN')}`;

async function loadCities() {
  const res = await fetch('/api/cities');
  const data = await res.json();
  const select = document.getElementById('city-select');
  data.cities.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

function gaugeColor(tier) {
  return { verified: 'var(--verified)', caution: 'var(--caution)', unsafe: 'var(--danger)' }[tier] || 'var(--ink)';
}

function scoreGaugeSVG(score, tier, size = 56) {
  const r = (size - 8) / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  const color = gaugeColor(tier);
  return `
    <div class="gauge" style="width:${size}px;height:${size}px;">
      <svg width="${size}" height="${size}">
        <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#E5E1D5" stroke-width="6"></circle>
        <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${color}" stroke-width="6"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"></circle>
      </svg>
      <div class="gauge-label" style="color:${color}; font-size:${size * 0.32}px;">${score}</div>
    </div>
  `;
}

function starRow(rating) {
  return `<span class="inline-flex items-center gap-1 text-sm font-mono"><span class="text-hivis" style="filter:drop-shadow(0 0 0 #000)">★</span> ${rating.toFixed(1)}</span>`;
}

function hotelCard(h) {
  const tierClass = `card-tag-${h.safety_tier}`;
  const score = h.active_profile_score ? h.active_profile_score.score : h.safety_score;
  const tierForGauge = h.active_profile_score
    ? (score >= 75 ? 'verified' : score >= 55 ? 'caution' : 'unsafe')
    : h.safety_tier;
  const profileLabel = h.active_profile_score ? h.active_profile_score.label : 'Overall Safety';

  return `
  <a href="/hotel/${h.id}" class="card ${tierClass} block hover:shadow-xl group">
    <div class="relative h-40 bg-gradient-to-br from-ink to-ink-soft overflow-hidden flex items-center justify-center">
      <svg viewBox="0 0 24 24" fill="none" stroke="#F2C200" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity="0.55" class="w-20 h-20"><rect x="4" y="2" width="16" height="20" rx="0.5"></rect><line x1="7" y1="6" x2="10" y2="6"></line><line x1="14" y1="6" x2="17" y2="6"></line><line x1="7" y1="10" x2="10" y2="10"></line><line x1="14" y1="10" x2="17" y2="10"></line><line x1="7" y1="14" x2="10" y2="14"></line><line x1="14" y1="14" x2="17" y2="14"></line><path d="M10 22v-4a2 2 0 0 1 4 0v4"></path></svg>
      <div class="absolute top-3 left-3">${tierPillStr(h.safety_tier)}</div>
      <div class="absolute top-2 right-2">${scoreGaugeSVG(score, tierForGauge, 52)}</div>
    </div>
    <div class="p-4">
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-stencil font-bold text-lg leading-tight uppercase group-hover:text-caution transition">${h.name}</h3>
      </div>
      <p class="text-sm text-ink/60 mt-0.5">${h.area}, ${h.city}</p>
      <div class="flex items-center justify-between mt-3">
        ${starRowStr(h.star_rating)}
        <span class="font-mono text-xs text-ink/50">${profileLabel}</span>
      </div>
      <div class="flex items-baseline justify-between mt-3 pt-3 border-t border-dashed border-line">
        <div>
          <span class="font-stencil font-bold text-xl">${cityFmt(h.price_per_night)}</span>
          <span class="text-xs text-ink/50">/night</span>
        </div>
        ${h.is_bookable
          ? `<span class="text-xs font-mono font-bold text-verified uppercase">Bookable</span>`
          : `<span class="text-xs font-mono font-bold text-danger uppercase">Blocked</span>`}
      </div>
    </div>
  </a>`;
}

function tierPillStr(tier) {
  const labels = { verified: 'Verified', caution: 'Caution', unsafe: 'Unsafe' };
  return `<span class="tier-pill tier-${tier}"><span class="dot"></span>${labels[tier]}</span>`;
}
function starRowStr(rating) {
  return `<span class="inline-flex items-center gap-1 text-sm font-mono font-semibold"><svg class="w-3.5 h-3.5 text-hivis" viewBox="0 0 24 24" fill="#F2C200"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>${rating.toFixed(1)}</span>`;
}

function skeletonCards(n = 6) {
  return Array.from({ length: n }).map(() => `
    <div class="card">
      <div class="h-40 skeleton"></div>
      <div class="p-4 space-y-2">
        <div class="h-4 w-3/4 skeleton rounded"></div>
        <div class="h-3 w-1/2 skeleton rounded"></div>
        <div class="h-3 w-full skeleton rounded mt-3"></div>
      </div>
    </div>`).join('');
}

async function loadHotels() {
  grid.innerHTML = skeletonCards();
  meta.textContent = 'Loading hotels…';

  const params = new URLSearchParams();
  if (state.city) params.set('city', state.city);
  if (state.travellerType) params.set('traveller_type', state.travellerType);
  if (state.tier) params.set('tier', state.tier);
  params.set('sort', state.sort);

  const res = await fetch(`/api/hotels?${params.toString()}`);
  const data = await res.json();

  const bookableCount = data.hotels.filter((h) => h.is_bookable).length;
  meta.innerHTML = `<span class="text-ink font-bold">${data.count}</span> properties found &mdash; <span class="text-verified font-bold">${bookableCount} pass mandatory safety checks</span>, <span class="text-danger font-bold">${data.count - bookableCount} blocked from booking</span>`;

  if (data.hotels.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-16 text-ink/50 font-mono">No hotels match these filters.</div>`;
    return;
  }

  grid.innerHTML = data.hotels.map(hotelCard).join('');
}

document.getElementById('city-select').addEventListener('change', (e) => {
  state.city = e.target.value;
  loadHotels();
});
document.getElementById('traveller-select').addEventListener('change', (e) => {
  state.travellerType = e.target.value;
  loadHotels();
});
document.getElementById('sort-select').addEventListener('change', (e) => {
  state.sort = e.target.value;
  loadHotels();
});
document.getElementById('search-btn').addEventListener('click', loadHotels);

document.querySelectorAll('.tier-filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tier-filter-btn').forEach((b) => b.classList.remove('active', 'bg-ink', 'text-paper'));
    btn.classList.add('active');
    state.tier = btn.dataset.tier;
    loadHotels();
  });
});

loadCities();
loadHotels();
