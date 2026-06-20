/* SafeStay — small inline SVG icon library (no external icon font needed) */

const Icons = {
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  cross: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 6v6c0 5 4 8 8 10 4-2 8-5 8-10V6l-8-4z"></path></svg>`,
  shieldCheck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 6v6c0 5 4 8 8 10 4-2 8-5 8-10V6l-8-4z"></path><path d="M9 12l2 2 4-4"></path></svg>`,
  shieldAlert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 6v6c0 5 4 8 8 10 4-2 8-5 8-10V6l-8-4z"></path><line x1="12" y1="8" x2="12" y2="13"></line><circle cx="12" cy="16" r="0.6" fill="currentColor"></circle></svg>`,
  flame: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 17a2.5 2.5 0 002.5-2.5c0-1.5-1.5-2-1.5-4 0-1 .5-2 1.5-3 .5 2 2 3 2 5.5A4.5 4.5 0 0111 17a4.5 4.5 0 01-4.5-4.5c0-3 2-5 2-5s0 2-.5 3"></path></svg>`,
  exit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
  cctv: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l9-4 9 4"></path><path d="M5 9v6c0 4 3 6 7 7 4-1 7-3 7-7V9"></path></svg>`,
  mapPin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 1118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  hospital: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1"></rect><line x1="12" y1="8" x2="12" y2="14"></line><line x1="9" y1="11" x2="15" y2="11"></line></svg>`,
  police: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 3v6c0 5-4 8-8 10-4-2-8-5-8-10V5l8-3z"></path><path d="M9 12l2 2 4-4"></path></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87"></path><path d="M16 3.13a4 4 0 010 7.75"></path></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  baby: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="3"></circle><path d="M9 13c0 4 1.5 7 3 7s3-3 3-7"></path><path d="M9 13c-2 0-3-1-3-2"></path><path d="M15 13c2 0 3-1 3-2"></path></svg>`,
  female: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"></circle><line x1="12" y1="13" x2="12" y2="21"></line><line x1="9" y1="18" x2="15" y2="18"></line></svg>`,
  doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
  arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
  sprinkler: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"></circle><line x1="12" y1="7" x2="12" y2="11"></line><line x1="12" y1="11" x2="6" y2="20"></line><line x1="12" y1="11" x2="18" y2="20"></line><line x1="12" y1="11" x2="12" y2="21"></line></svg>`,
  bolt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  building: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20"></rect><line x1="9" y1="7" x2="9" y2="7.01"></line><line x1="15" y1="7" x2="15" y2="7.01"></line><line x1="9" y1="12" x2="9" y2="12.01"></line><line x1="15" y1="12" x2="15" y2="12.01"></line><line x1="9" y1="17" x2="9" y2="17.01"></line><line x1="15" y1="17" x2="15" y2="17.01"></line></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>`,
  safe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="3" x2="12" y2="6"></line></svg>`,
};

function stampSVG(tier, size = 'lg') {
  const map = { verified: Icons.shieldCheck, caution: Icons.shieldAlert, unsafe: Icons.cross };
  const cls = size === 'sm' ? 'stamp stamp-sm' : 'stamp';
  return `<div class="${cls} stamp-${tier}">${map[tier] || Icons.shield}</div>`;
}

function tierPill(tier) {
  const labels = { verified: 'Safety Verified', caution: 'Use Caution', unsafe: 'Unsafe — Blocked' };
  return `<span class="tier-pill tier-${tier}"><span class="dot"></span>${labels[tier]}</span>`;
}
