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
  const COLOR = options.color ?? 'white';
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
  let els = [];  // each entry: { seg, arr } or { seg, arrBorder, arrFill }

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

  const IS_OUTLINED   = (options.arrowStyle ?? 'chevron') === 'outlined';
  const OUTLINE_COLOR = options.arrowOutlineColor ?? 'black';
  const OUTLINE_W     = options.arrowOutlineWidth ?? (STROKE_W + 2);

  /** Create a polyline with the given stroke color and width. */
  function makePolyline(strokeColor, strokeWidth) {
    const cap = options.segmentCap ?? 'round';
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    el.setAttribute('fill', 'none');
    el.setAttribute('stroke', strokeColor);
    el.setAttribute('stroke-width', strokeWidth);
    el.setAttribute('stroke-linecap', cap);
    el.setAttribute('stroke-linejoin', cap === 'round' ? 'round' : 'miter');
    return el;
  }

  /** Create segment element(s). Returns { segBorder, segFill } for outlined, else { seg }. */
  function makeSegment() {
    if (IS_OUTLINED) {
      return {
        segBorder: makePolyline(OUTLINE_COLOR, STROKE_W + OUTLINE_W),
        segFill:   makePolyline(COLOR,    STROKE_W),
      };
    }
    return { seg: makePolyline(COLOR, STROKE_W) };
  }

  /**
   * Create arrow element(s). Returns { arr } for chevron/full, or { arrBorder, arrFill } for outlined.
   *
   * Rounded corners (matching the Bootstrap arrow icon) work via stroke-linejoin="round":
   *   - arrBorder: fat stroke in outline colour → rounds all three corners outward
   *   - arrFill:   thinner stroke in fill colour → rounds the same corners inward,
   *                preventing the sharp fill triangle from poking through the border
   */
  function makeArrow() {
    const style = options.arrowStyle ?? 'chevron';

    if (style === 'outlined') {
      // Same formula as the body segments: border = STROKE_W + OUTLINE_W, fill = STROKE_W.
      // Visible outline on each side = OUTLINE_W / 2 — consistent with the tail.
      const border = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      border.style.fill           = OUTLINE_COLOR;
      border.style.stroke         = OUTLINE_COLOR;
      border.style.strokeWidth    = STROKE_W/2 + OUTLINE_W;
      border.style.strokeLinejoin = 'round';
      border.style.strokeLinecap  = 'round';

      // Fill stroke rounds the corners inward to match the border rounding.
      const fill = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      fill.style.fill           = COLOR;
      fill.style.stroke         = COLOR;
      fill.style.strokeWidth    = STROKE_W/2;
      fill.style.strokeLinejoin = 'round';
      fill.style.strokeLinecap  = 'round';

      return { arrBorder: border, arrFill: fill };

    } else if (style === 'full') {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      el.style.fill = COLOR;
      el.style.stroke = 'none';
      return { arr: el };

    } else {
      // chevron (default)
      const cap = options.arrowCap ?? 'round';
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      el.setAttribute('fill', 'none');
      el.setAttribute('stroke', COLOR);
      el.setAttribute('stroke-width', STROKE_W);
      el.setAttribute('stroke-linecap', cap);
      el.setAttribute('stroke-linejoin', cap === 'round' ? 'round' : 'miter');
      return { arr: el };
    }
  }

  // Setup

  function build(n) {
    numSegs = n;
    perim = trackEl.getTotalLength();
    segLen = (perim - n * GAP) / n;
    cycle = perim / n;
    groupEl.innerHTML = '';

    els = Array.from({ length: n }, () => ({ ...makeSegment(), ...makeArrow() }));

    if (IS_OUTLINED) {
      // Two sub-groups guarantee every border element is below every fill element,
      // regardless of how many segments there are or how they interleave spatially.
      const borderGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const fillGroup   = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      groupEl.append(borderGroup, fillGroup);  // borderGroup rendered first = behind
      els.forEach(e => borderGroup.append(e.segBorder, e.arrBorder));
      els.forEach(e => fillGroup.append(e.segFill, e.arrFill));
    } else {
      els.forEach(e => groupEl.append(e.seg, e.arr));
    }
  }

  // Rendering

  function drawSegment(entry, tailD, tipD) {
    const steps = Math.max(8, Math.floor(segLen / 4));
    const pts = [];
    for (let s = 0; s <= steps; s++) {
      const d = wrap(tailD + (tipD - tailD) * (s / steps));
      const p = trackEl.getPointAtLength(d);
      pts.push(`${p.x},${p.y}`);
    }
    const joined = pts.join(' ');
    if (IS_OUTLINED) {
      entry.segBorder.setAttribute('points', joined);
      entry.segFill.setAttribute('points', joined);
    } else {
      entry.seg.setAttribute('points', joined);
    }
  }

  /** Compute arrow geometry for a given head distance. */
  function arrowPoints(headD) {
    const angle = smoothTangentAngle(headD) + (dir === -1 ? Math.PI : 0);
    const head  = trackEl.getPointAtLength(wrap(headD));
    const ax = ARROW_SIZE * 0.7, ay = ARROW_SIZE * 0.5;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const lx = head.x - ax * cos + ay * sin, ly = head.y - ax * sin - ay * cos;
    const rx = head.x - ax * cos - ay * sin, ry = head.y - ax * sin + ay * cos;
    return { head, lx, ly, rx, ry, cos, sin, ax };
  }

  /**
   * Build a flat-triangle arrowhead path.
   * Corner rounding is achieved by stroke-linejoin="round" on the rendered elements,
   * not by curved path data — matching how the Bootstrap arrow icon works.
   */
  function arrowPath(headD) {
    const { head, lx, ly, rx, ry } = arrowPoints(headD);
    return `M ${head.x},${head.y} L ${lx},${ly} L ${rx},${ry} Z`;
  }

  function drawArrow(entry, headD) {
    const style = options.arrowStyle ?? 'chevron';

    if (style === 'outlined') {
      const d = arrowPath(headD);
      entry.arrBorder.setAttribute('d', d);
      entry.arrFill.setAttribute('d', d);
    } else if (style === 'full') {
      entry.arr.setAttribute('d', arrowPath(headD));
    } else {
      const { head, lx, ly, rx, ry } = arrowPoints(headD);
      entry.arr.setAttribute('points', `${lx},${ly} ${head.x},${head.y} ${rx},${ry}`);
    }
  }

  function tick(ts) {
    if (!perim) { rafId = requestAnimationFrame(tick); return; }
    if (!lastTs) lastTs = ts;
    offset = (offset + speed * (ts - lastTs) / 1000 * dir + perim) % perim;
    lastTs = ts;

    els.forEach((entry, i) => {
      const base = offset + i * cycle;   // raw (unwrapped) leading edge
      const tailD = base - segLen * dir;  // raw trailing edge
      const tipD = base - (STROKE_W) * dir; // Stop it creeping past the arrow
      drawSegment(entry, tailD, tipD);
      drawArrow(entry, base);
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