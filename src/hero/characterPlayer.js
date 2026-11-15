// Frame-sequence player for the hero character. Pure JS, driven by requestAnimationFrame —
// React never re-renders while it runs.
//
// Frame map (public/frames/f000–f189, 24 fps source):
//   0–56    working at the laptop (idle loop, ping-pong)
//   56–72   head turns to the viewer's left, 72–88 holds there
//   98–112  head turns to the viewer's right, 108–118 holds there
//   124–146 looks up, surprised and happy · 146–182 waves · 182–189 points down

export const FRAME_COUNT = 190
const FPS = 24
const IDLE = [0, 56]
const HOLD_MS = 2500
const FADE_MS = 320

const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

// onProgress(0..1): fraction of frames settled (loaded or failed), drives the loading screen
export function createCharacterPlayer({ canvas, src, reducedMotion = false, onProgress }) {
  const ctx = canvas.getContext('2d')
  const frames = Array.from({ length: FRAME_COUNT }, () => new Image())
  const ready = new Uint8Array(FRAME_COUNT)

  let p = 0 // playhead, fractional frame index
  let dir = 1 // idle ping-pong direction
  let queue = [] // steps of the current action
  let step = null
  let action = null // 'left' | 'right' | 'center' | null
  let pending = null // zone entered while the greeting was playing
  let fade = null // { from, t0 } crossfade out of a previous frame
  let last = 0
  let raf = 0

  // Load frame 0 first so something shows immediately, then the rest in order.
  let settled = 0
  const load = (i) =>
    new Promise((res) => {
      const done = () => (onProgress?.(++settled / FRAME_COUNT), res())
      frames[i].onload = () => ((ready[i] = 1), done())
      frames[i].onerror = done
      frames[i].decoding = 'async'
      frames[i].src = src(i)
    })
  load(0).then(() => {
    draw(performance.now())
    for (let i = 1; i < FRAME_COUNT; i++) load(i)
  })

  const nearestReady = (i) => {
    for (let d = 0; d < FRAME_COUNT; d++) {
      if (ready[i - d]) return i - d
      if (ready[i + d]) return i + d
    }
    return -1
  }

  const blit = (i, alpha) => {
    const k = nearestReady(Math.max(0, Math.min(FRAME_COUNT - 1, i)))
    if (k < 0 || alpha <= 0) return
    ctx.globalAlpha = alpha
    ctx.drawImage(frames[k], 0, 0, canvas.width, canvas.height)
  }

  function draw(now) {
    if (!ready[0]) return
    const a = Math.floor(p)
    const frac = p - a
    ctx.globalAlpha = 1
    blit(a, 1)
    if (frac > 0.01) blit(a + 1, frac) // sub-frame interpolation between neighbouring frames
    if (fade) {
      const t = (now - fade.t0) / FADE_MS
      if (t >= 1) fade = null
      else blit(fade.from, 1 - ease(t))
    }
    ctx.globalAlpha = 1
  }

  // ---- steps -------------------------------------------------------------
  const play = (to, fps = FPS) => ({ type: 'play', to, fps })
  const jump = (to) => ({ type: 'jump', to })
  const hold = (ms, a, b) => ({ type: 'hold', ms, a, b })
  // Play when the target is close, otherwise crossfade to it — never a hard cut.
  const goTo = (to) => (Math.abs(p - to) <= 8 ? play(to, FPS * 1.5) : jump(to))

  function advance(now, dt) {
    if (!step) {
      step = queue.shift() || null
      if (step) step.t0 = now
    }
    if (!step) {
      if (action) finish()
      if (!reducedMotion) idle(dt)
      return
    }
    switch (step.type) {
      case 'jump':
        fade = { from: Math.round(p), t0: now }
        p = step.to
        step = null
        return
      case 'play': {
        const d = step.to - p
        const move = step.fps * dt
        if (Math.abs(d) <= move) {
          p = step.to
          step = null
        } else p += Math.sign(d) * move
        return
      }
      case 'hold': {
        // gentle ping-pong over the held pose so it breathes instead of freezing
        if (step.b > step.a && !reducedMotion) {
          p += (step.dir || 1) * 8 * dt
          if (p >= step.b) (p = step.b), (step.dir = -1)
          if (p <= step.a) (p = step.a), (step.dir = 1)
        }
        if (now - step.t0 >= step.ms) step = null
      }
    }
  }

  function idle(dt) {
    if (p < IDLE[0] || p > IDLE[1]) return
    p += dir * FPS * dt
    if (p >= IDLE[1]) (p = IDLE[1]), (dir = -1)
    if (p <= IDLE[0]) (p = IDLE[0]), (dir = 1)
  }

  function finish() {
    const was = action
    action = null
    if (was === 'center' && pending && pending !== 'center') {
      const z = pending
      pending = null
      trigger(z)
    }
  }

  function trigger(zone) {
    if (action === 'center') {
      pending = zone // the greeting is never cut short
      return
    }
    if (zone === action || !zone) return
    pending = null
    step = null
    action = zone
    if (zone === 'left') {
      queue = [goTo(56), play(72), hold(HOLD_MS, 72, 88), play(72, FPS * 2), play(54, FPS * 0.9)]
    } else if (zone === 'right') {
      queue = [goTo(98), play(110), hold(HOLD_MS, 108, 118), play(108, FPS * 2), play(98, FPS * 0.9), jump(56)]
    } else if (zone === 'center') {
      queue = [jump(124), play(146, 18), play(189), hold(1800, 189, 189), jump(20)]
    }
  }

  function tick(now) {
    const dt = Math.min((now - (last || now)) / 1000, 0.05) // clamp after tab switches
    last = now
    advance(now, dt)
    draw(now)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return {
    trigger,
    destroy() {
      cancelAnimationFrame(raf)
      frames.forEach((f) => (f.onload = f.onerror = null))
    },
  }
}
