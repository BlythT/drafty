/**
 * track-animate.js
 * Animates a set of evenly-spaced arrow segments chasing each other
 * around any closed SVG path element.
 *
 * Usage:
 *   const anim = TrackAnimate(trackEl, groupEl, options);
 *   anim.setSegments(6);
 *   anim.setSpeed(120);
 *   anim.destroy();
 *
 *   AnimateBorder(el, options);
 */

function TrackAnimate(trackEl, groupEl, options = {}) {

  // Options
  const COLOR = options.color ?? '#378ADD';
  const STROKE_W = options.strokeWidth ?? 2;
  const ARROW_SIZE = options.arrowSize ?? 10;
  const GAP = options.gap ?? 20;  // px gap between segments

  // State
  let dir = options.direction === 'ccw' ? -1 : 1;
  let perim = 0;  // total path length
  let segLen = 0;  // length of each drawn segment
  let cycle = 0;  // distance between segment start points
  let numSegs = options.segments ?? 4;
  let speed = options.speed ?? 80;  // px per second
  let offset = 0;
  let lastTs = null;
  let rafId = null;
  let els = [];  // each entry: { seg, arr }

  // Helpers

  /** Wrap a raw distance value into [0, perim). */
  function wrap(d) {
    if (!perim) return 0;
    return ((d % perim) + perim) % perim;
  }

  /**
  * Returns a smoothed tangent angle at path distance d by averaging tangent
  * vectors over a short lookback window behind the tip. Samples are weighted
  * linearly so points closer to the tip have more influence, which makes the
  * arrow gradually rotate into corners rather than snapping abruptly.
  *
  * @param {number} d        - Path distance of the arrow tip.
  * @param {number} lookback - How far behind the tip (in path-length px) to
  *                            sample. Larger values = earlier/smoother rotation.
  */
  function smoothTangentAngle(d, lookback = 20) {
    const steps = 6;
    let sx = 0, sy = 0;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const weight = t; // more weight toward the tip
      const a = trackEl.getPointAtLength(wrap(d - lookback * (1 - t) * dir));
      const b = trackEl.getPointAtLength(wrap(d - lookback * (1 - t) * dir + 0.5));
      sx += Math.cos(Math.atan2(b.y - a.y, b.x - a.x)) * weight;
      sy += Math.sin(Math.atan2(b.y - a.y, b.x - a.x)) * weight;
    }
    return Math.atan2(sy, sx);
  }

  /** Angle of the path's tangent at distance d. */
  function tangentAngle(d) {
    const a = trackEl.getPointAtLength(wrap(d));
    const b = trackEl.getPointAtLength(wrap(d + 0.5));
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  /** Create an SVG polyline for segment drawing. */
  function makeSegment() {
    const cap = options.segmentCap ?? 'round';
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    el.setAttribute('fill', 'none');
    el.setAttribute('stroke', COLOR);
    el.setAttribute('stroke-width', STROKE_W);
    el.setAttribute('stroke-linecap', cap);
    el.setAttribute('stroke-linejoin', cap === 'round' ? 'round' : 'miter');
    return el;
  }

  /** Create an SVG element for arrow drawing (polygon if full, polyline if chevron). */
  function makeArrow() {
    console.log('arrowStyle:', options.arrowStyle);
    if (options.arrowStyle === 'full') {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      el.style.fill = COLOR;
      el.style.stroke = 'none';
      return el;
    } else {
      const cap = options.arrowCap ?? 'round';
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      el.setAttribute('fill', 'none');
      el.setAttribute('stroke', COLOR);
      el.setAttribute('stroke-width', STROKE_W);
      el.setAttribute('stroke-linecap', cap);
      el.setAttribute('stroke-linejoin', cap === 'round' ? 'round' : 'miter');
      return el;
    }
  }

  // Setup

  function build(n) {
    numSegs = n;
    perim = trackEl.getTotalLength();
    segLen = (perim - n * GAP) / n;
    cycle = perim / n;
    groupEl.innerHTML = '';
    els = Array.from({ length: n }, () => {
      const seg = makeSegment(), arr = makeArrow();
      groupEl.append(seg, arr);
      return { seg, arr };
    });
  }

  // Rendering

  function drawSegment(el, tailD, tipD) {
    const steps = Math.max(8, Math.floor(segLen / 4));
    const pts = [];
    for (let s = 0; s <= steps; s++) {
      const d = wrap(tailD + (tipD - tailD) * (s / steps));
      const p = trackEl.getPointAtLength(d);
      pts.push(`${p.x},${p.y}`);
    }
    el.setAttribute('points', pts.join(' '));
  }

  function drawArrow(el, headD) {
    const angle = smoothTangentAngle(headD) + (dir === -1 ? Math.PI : 0);
    const head = trackEl.getPointAtLength(wrap(headD));
    const ax = ARROW_SIZE * 0.7, ay = ARROW_SIZE * 0.5;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const lx = head.x - ax * cos + ay * sin, ly = head.y - ax * sin - ay * cos;
    const rx = head.x - ax * cos - ay * sin, ry = head.y - ax * sin + ay * cos;

    if (options.arrowStyle === 'full') {
      // closed triangle: tip, left base, right base
      const pts = `${head.x},${head.y} ${lx},${ly} ${rx},${ry}`;
      console.log('triangle points:', pts);
      el.setAttribute('points', pts);
    } else {
      // open chevron: left, tip, right
      el.setAttribute('points', `${lx},${ly} ${head.x},${head.y} ${rx},${ry}`);
    }
  }

  function tick(ts) {
    if (!perim) { rafId = requestAnimationFrame(tick); return; }
    if (!lastTs) lastTs = ts;
    offset = (offset + speed * (ts - lastTs) / 1000 * dir + perim) % perim;
    lastTs = ts;

    els.forEach(({ seg, arr }, i) => {
      const base = offset + i * cycle;   // raw (unwrapped) leading edge
      const tailD = base - segLen * dir;  // raw trailing edge
      const tipD = base - (STROKE_W) * dir; // Stop it creeping past the arrow
      drawSegment(seg, tailD, tipD);
      drawArrow(arr, base);
    });

    rafId = requestAnimationFrame(tick);
  }

  // Init

  build(numSegs);
  rafId = requestAnimationFrame(tick);

  // API

  return {
    setSegments(n) { build(n); },
    setSpeed(s) { speed = s; },
    setDirection(d) { dir = d === 'ccw' ? -1 : 1; },
    destroy() { cancelAnimationFrame(rafId); groupEl.innerHTML = ''; },
  };
}

function AnimateBorder(el, options = {}) {
  const computed = getComputedStyle(el);
  if (computed.position === 'static') el.style.position = 'relative';
  const rx = options.borderRadius ?? parseFloat(computed.borderRadius) ?? 0;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible';
  el.appendChild(svg);

  const track = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  track.setAttribute('fill', 'none');
  track.setAttribute('stroke', 'none');
  track.setAttribute('rx', rx);
  svg.appendChild(track);

  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(group);

  function sync() {
    const style = getComputedStyle(el);
    const bTop = parseFloat(style.borderTopWidth);
    const bLeft = parseFloat(style.borderLeftWidth);
    const bRight = parseFloat(style.borderRightWidth);
    const bBottom = parseFloat(style.borderBottomWidth);

    track.setAttribute('x', bLeft / 2);
    track.setAttribute('y', bTop / 2);
    track.setAttribute('width', el.offsetWidth - (bLeft + bRight) / 2);
    track.setAttribute('height', el.offsetHeight - (bTop + bBottom) / 2);
  }

  let api = null;

  requestAnimationFrame(() => {
    sync();
    new ResizeObserver(sync).observe(el);
    api = TrackAnimate(track, group, options);
  });

  return {
    setSegments(n) { api?.setSegments(n); },
    setSpeed(s) { api?.setSpeed(s); },
    setDirection(d) { api?.setDirection(d); },
    destroy() { api?.destroy(); },
  };
}