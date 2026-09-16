const COLORS = ["#d4b483", "#1f2a3a", "#34d399", "#f59e0b", "#f8f1e3", "#60a5fa"]

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  rot: number
  vr: number
  color: string
  life: number
  gravity: number
}

let audioCtx: AudioContext | null = null
let confettiFrame = 0

function context() {
  if (typeof window === "undefined") return null
  const Ctor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!audioCtx) audioCtx = new Ctor()
  return audioCtx
}

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function tone(ctx: AudioContext, frequency: number, start: number, duration: number, volume = 0.09) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = "triangle"
  oscillator.frequency.setValueAtTime(frequency, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

export function playSuccessChime() {
  const ctx = context()
  if (!ctx) return
  if (ctx.state === "suspended") void ctx.resume()

  const now = ctx.currentTime
  tone(ctx, 523.25, now, 0.18, 0.07)
  tone(ctx, 659.25, now + 0.07, 0.18, 0.07)
  tone(ctx, 783.99, now + 0.14, 0.22, 0.08)
  tone(ctx, 1046.5, now + 0.24, 0.38, 0.09)
}

function spawn(originX: number, originY: number, count: number) {
  const particles: Particle[] = []
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2
    const speed = 6 + Math.random() * 11
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      w: 5 + Math.random() * 7,
      h: 8 + Math.random() * 10,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.35,
      color: COLORS[i % COLORS.length],
      life: 1,
      gravity: 0.18 + Math.random() * 0.08,
    })
  }
  return particles
}

export function burstConfetti(canvas: HTMLCanvasElement) {
  if (reducedMotion()) return

  const parent = canvas.parentElement
  const width = parent?.clientWidth ?? window.innerWidth
  const height = parent?.clientHeight ?? window.innerHeight
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const particles = [
    ...spawn(width * 0.72, height * 0.38, 70),
    ...spawn(width * 0.5, height * 0.12, 40),
  ]

  if (confettiFrame) window.cancelAnimationFrame(confettiFrame)

  const tick = () => {
    ctx.clearRect(0, 0, width, height)
    let alive = false

    for (const particle of particles) {
      if (particle.life <= 0) continue
      alive = true
      particle.vy += particle.gravity
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vx *= 0.99
      particle.rot += particle.vr
      particle.life -= 0.012

      ctx.save()
      ctx.globalAlpha = Math.max(0, particle.life)
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.rot)
      ctx.fillStyle = particle.color
      ctx.fillRect(-particle.w / 2, -particle.h / 2, particle.w, particle.h)
      ctx.restore()
    }

    if (alive) {
      confettiFrame = window.requestAnimationFrame(tick)
    } else {
      ctx.clearRect(0, 0, width, height)
      confettiFrame = 0
    }
  }

  confettiFrame = window.requestAnimationFrame(tick)
}

export function celebrateCorrect(canvas?: HTMLCanvasElement | null) {
  playSuccessChime()
  if (canvas) burstConfetti(canvas)
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(24)
  }
}
