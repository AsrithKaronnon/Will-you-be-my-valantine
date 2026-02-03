import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

function Bouquet() {
  return (
    <svg className="bouquet" width="180" height="220" viewBox="-90 -110 180 220" aria-hidden>
      <g className="bouquet-float">
        <g transform="translate(0, 20)">
          <path d="M0,0 C-18,34 -6,90 0,110 C6,90 18,34 0,0 Z" fill="#2e7d32" />
          <path d="M0,0 C-10,20 -20,30 -32,44" stroke="#2e7d32" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M0,0 C10,20 20,30 32,44" stroke="#2e7d32" strokeWidth="6" fill="none" strokeLinecap="round" />
          <g transform="translate(-34,42)">
            <Heart fill="#ff6b88" size={22} />
          </g>
          <g transform="translate(34,42)">
            <Heart fill="#ff4d6d" size={24} />
          </g>
          <g transform="translate(0,-6)">
            <Heart fill="#ff8fa3" size={28} />
          </g>
        </g>
      </g>
    </svg>
  )
}

function Heart({ fill = '#ff5b7e', size = 20 }) {
  const s = size / 2
  return (
    <path
      d={`M 0 ${-s * 0.3} C ${s} ${-s * 1.4}, ${s * 2} ${-s * 0.1}, 0 ${s * 1.3} C ${-s * 2} ${-s * 0.1}, ${-s} ${-s * 1.4}, 0 ${-s * 0.3} Z`}
      fill={fill}
    />
  )
}

function FloatingHeartsBackground() {
  const hearts = React.useMemo(() => (
    new Array(16).fill(0).map(() => ({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * -12}s`,
      animationDuration: `${10 + Math.random() * 10}s`,
      transform: `scale(${0.6 + Math.random() * 0.9})`
    }))
  ), [])
  return (
    <div className="bg-hearts" aria-hidden>
      {hearts.map((style, i) => (
        <span key={i} className="bg-heart" style={style} />
      ))}
    </div>
  )
}

function Fireworks({ active }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const runningRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight

    const onResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    const colors = ['#ff4d6d', '#ff6b88', '#ff8fa3', '#ffccd5', '#ff2d55']

    const particles = []

    function spawnBurst(x, y) {
      const count = 36 + Math.floor(Math.random() * 24)
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.2
        const speed = 2 + Math.random() * 4
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          life: 0,
          maxLife: 90 + Math.random() * 40,
          size: 6 + Math.random() * 10,
          color: colors[Math.floor(Math.random() * colors.length)],
          rot: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.1,
        })
      }
    }

    function drawHeart(ctx, x, y, size, color, rot) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rot)
      ctx.scale(size / 14, size / 14)
      ctx.beginPath()
      ctx.moveTo(0, -6)
      ctx.bezierCurveTo(6, -12, 14, -2, 0, 10)
      ctx.bezierCurveTo(-14, -2, -6, -12, 0, -6)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = 12
      ctx.fill()
      ctx.restore()
    }

    let t = 0
    function tick() {
      if (!runningRef.current) return
      t++
      ctx.clearRect(0, 0, w, h)
      if (t % 15 === 0) {
        const x = 80 + Math.random() * (w - 160)
        const y = 100 + Math.random() * (h / 2)
        spawnBurst(x, y)
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life++
        p.rot += p.rotSpeed
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.03
        const alpha = 1 - p.life / p.maxLife
        if (alpha <= 0) {
          particles.splice(i, 1)
          continue
        }
        ctx.globalAlpha = Math.max(0, alpha)
        drawHeart(ctx, p.x, p.y, p.size, p.color, p.rot)
        ctx.globalAlpha = 1
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    if (active) {
      runningRef.current = true
      t = 0
      tick()
    }

    return () => {
      runningRef.current = false
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [active])

  return (
    <canvas ref={canvasRef} className={`fireworks ${active ? 'active' : ''}`} />
  )
}

export default function App() {
  const [celebrate, setCelebrate] = useState(false)
  const [acceptedPrev, setAcceptedPrev] = useState(false)
  const [name, setName] = useState('Ancy')
  const [noPos, setNoPos] = useState({ x: 0, y: 0 })
  const noPosRef = useRef({ x: 0, y: 0 })
  const [noJiggle, setNoJiggle] = useState(false)
  const [nearYes, setNearYes] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmWiggle, setConfirmWiggle] = useState(0)
  const wrapRef = useRef(null)
  const noRef = useRef(null)
  const yesRef = useRef(null)
  const audioRef = useRef(null)
  const ptRef = useRef({ x: 0, y: 0, active: false })
  const velRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(0)

  const BUFFER_BASE = 220

  const warpAway = (px, py, amplify = 1.0) => {
    const no = noRef.current
    if (!no) return
    const nr = no.getBoundingClientRect()
    const center = { x: nr.left + nr.width / 2, y: nr.top + nr.height / 2 }
    const angle = Math.atan2(center.y - py, center.x - px)
    const maxX = Math.max(0, window.innerWidth - nr.width)
    const maxY = Math.max(0, window.innerHeight - nr.height)
    const dist = Math.max(400 * amplify, nr.width * (4.0 * amplify))
    let nx = noPosRef.current.x + Math.cos(angle) * dist
    let ny = noPosRef.current.y + Math.sin(angle) * dist
    nx = Math.min(Math.max(12, nx), Math.max(12, maxX - 12))
    ny = Math.min(Math.max(12, ny), Math.max(12, maxY - 12))
    // fallback to farthest of sampled points if still near pointer
    const minSafe = 320
    let best = { x: nx, y: ny, d: Math.hypot(nx + nr.width / 2 - px, ny + nr.height / 2 - py) }
    if (best.d < minSafe) {
      for (let i = 0; i < 12; i++) {
        const rx = 12 + Math.random() * Math.max(1, maxX - 24)
        const ry = 12 + Math.random() * Math.max(1, maxY - 24)
        const cd = Math.hypot(rx + nr.width / 2 - px, ry + nr.height / 2 - py)
        if (cd > best.d) best = { x: rx, y: ry, d: cd }
      }
      nx = best.x; ny = best.y
    }
    // apply instantly
    no.style.transform = `translate(${nx}px, ${ny}px)`
    noPosRef.current = { x: nx, y: ny }
    setNoPos({ x: nx, y: ny })
    // kick velocity away
    velRef.current.x = Math.cos(angle) * 18 * amplify
    velRef.current.y = Math.sin(angle) * 18 * amplify
    setNoJiggle(true)
  }

  const shouldWarp = (px, py, nr) => {
    const buffer = Math.max(BUFFER_BASE, nr.width * 1.2)
    const rect = { left: nr.left - buffer, right: nr.right + buffer, top: nr.top - buffer, bottom: nr.bottom + buffer }
    const inRect = (x, y, r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
    if (inRect(px, py, rect)) return true
    const cx = nr.left + nr.width / 2
    const cy = nr.top + nr.height / 2
    const circle = Math.max(180, nr.width * 1.1)
    return Math.hypot(px - cx, py - cy) < circle
  }

  useEffect(() => {
    let canceled = false
    async function load() {
      try {
        const res = await fetch('/api/status')
        if (!res.ok) throw new Error('bad status')
        const data = await res.json()
        if (canceled) return
        setAcceptedPrev(!!data.accepted)
        if (data.name) setName(data.name)
      } catch {
        try {
          const stored = localStorage.getItem('valentineAccepted') === 'true'
          if (!canceled) setAcceptedPrev(stored)
        } catch {}
      }
    }
    load()
    return () => { canceled = true }
  }, [])

  useEffect(() => {
    const onPointerMove = (e) => {
      const px = (e.touches ? e.touches[0].clientX : e.clientX)
      const py = (e.touches ? e.touches[0].clientY : e.clientY)
      ptRef.current = { x: px, y: py, active: true }

      const yes = yesRef.current
      if (yes) {
        const yr = yes.getBoundingClientRect()
        const yc = { x: yr.left + yr.width / 2, y: yr.top + yr.height / 2 }
        const dy = Math.hypot(px - yc.x, py - yc.y)
        const prox = Math.max(0, 1 - dy / 220)
        setNearYes(prox)
      }

      // Immediate warp if pointer overlaps or enters buffer around the No button
      const no = noRef.current
      if (no) {
        const nr = no.getBoundingClientRect()
        if (shouldWarp(px, py, nr)) warpAway(px, py, 1.2)
      }
    }
    const onLeave = () => { ptRef.current.active = false }
    const onPointerDownCapture = (e) => {
      const no = noRef.current
      if (!no) return
      const nr = no.getBoundingClientRect()
      const px = (e.touches ? e.touches[0].clientX : e.clientX)
      const py = (e.touches ? e.touches[0].clientY : e.clientY)
      const buffer = Math.max(BUFFER_BASE, nr.width * 0.9)
      const inRect = (x, y, rect) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
      const buffered = { left: nr.left - buffer, right: nr.right + buffer, top: nr.top - buffer, bottom: nr.bottom + buffer }
      const insideButton = inRect(px, py, nr)
      if (insideButton) {
        setShowConfirm(true)
      }
      if (insideButton || inRect(px, py, buffered)) {
        e.preventDefault(); e.stopPropagation()
        warpAway(px, py, 1.3)
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true, capture: true })
    window.addEventListener('mousemove', onPointerMove, { passive: true, capture: true })
    window.addEventListener('pointerover', onPointerMove, { passive: true, capture: true })
    window.addEventListener('touchmove', onPointerMove, { passive: true })
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('pointerdown', onPointerDownCapture, true)
    window.addEventListener('click', onPointerDownCapture, true)
    return () => {
      window.removeEventListener('pointermove', onPointerMove, { capture: true })
      window.removeEventListener('mousemove', onPointerMove, { capture: true })
      window.removeEventListener('pointerover', onPointerMove, { capture: true })
      window.removeEventListener('touchmove', onPointerMove)
      window.removeEventListener('touchmove', onPointerMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('pointerdown', onPointerDownCapture, true)
      window.removeEventListener('click', onPointerDownCapture, true)
    }
  }, [])

  useLayoutEffect(() => {
    // Place No button to the right of Yes initially (same line, viewport coords)
    const yes = yesRef.current
    const no = noRef.current
    if (!yes || !no) return
    const yr = yes.getBoundingClientRect()
    const nr = no.getBoundingClientRect()
    const gap = 16
    const maxX = Math.max(0, window.innerWidth - nr.width)
    const maxY = Math.max(0, window.innerHeight - nr.height)
    let x = Math.min(maxX, yr.right + gap)
    let y = Math.min(maxY, Math.max(0, yr.top + (yr.height - nr.height) / 2))
    // if computed Y is too close to bottom or off-screen, fallback to top-right
    if (y > maxY - 24 || y < 0) {
      y = 24
      x = Math.max(24, maxX - 24)
    }
    // ensure min margins
    x = Math.max(12, Math.min(maxX - 12, x))
    y = Math.max(12, Math.min(maxY - 12, y))
    noPosRef.current = { x, y }
    setNoPos({ x, y })
  }, [])

  useEffect(() => {
    // Smooth physics loop for No button
    const no = noRef.current
    if (!no) return
    let running = true
    const thresholdBase = 200

    const step = () => {
      if (!running) return
      const nr = no.getBoundingClientRect()
      const threshold = Math.max(thresholdBase, nr.width * 2)

      setNoPos(prev => {
        // compute center
        const cx = prev.x + nr.width / 2
        const cy = prev.y + nr.height / 2
        const px = ptRef.current.x
        const py = ptRef.current.y
        const left = prev.x
        const top = prev.y
        const right = left + nr.width
        const bottom = top + nr.height

        // If pointer overlaps buffer/circle, warp immediately (no delay)
        if (shouldWarp(px, py, nr)) {
          warpAway(px, py, 1.25)
          return noPosRef.current
        }
        if (ptRef.current.active) {
          const dx = cx - ptRef.current.x
          const dy = cy - ptRef.current.y
          const dist = Math.hypot(dx, dy) || 0.0001
          if (dist < threshold) {
            const strength = 1 - dist / threshold
            const force = (strength * strength) * 14
            velRef.current.x += (dx / dist) * force
            velRef.current.y += (dy / dist) * force
            setNoJiggle(true)
          }
        }
        // friction
        velRef.current.x *= 0.88
        velRef.current.y *= 0.88

        let nx = prev.x + velRef.current.x
        let ny = prev.y + velRef.current.y

        const maxX = Math.max(0, window.innerWidth - nr.width)
        const maxY = Math.max(0, window.innerHeight - nr.height)
        if (nx < 0) { nx = 0; velRef.current.x *= -0.4 }
        if (ny < 0) { ny = 0; velRef.current.y *= -0.4 }
        if (nx > maxX) { nx = maxX; velRef.current.x *= -0.4 }
        if (ny > maxY) { ny = maxY; velRef.current.y *= -0.4 }

        // If pressed against an edge while the pointer is near, add tangential slide
        if ((nx === 0 || ny === 0 || nx === maxX || ny === maxY) && ptRef.current.active) {
          const dxp = cx - ptRef.current.x
          const dyp = cy - ptRef.current.y
          const d = Math.hypot(dxp, dyp) || 1
          // perpendicular to pointer vector
          velRef.current.x += (-dyp / d) * 2
          velRef.current.y += (dxp / d) * 2
        }

        const next = { x: nx, y: ny }
        noPosRef.current = next
        return next
      })

      clearTimeout(step._t)
      step._t = setTimeout(() => setNoJiggle(false), 150)
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { running = false; cancelAnimationFrame(rafRef.current) }
  }, [])

  const onYes = async () => {
    try {
      await fetch('/api/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, accepted: true })
      })
    } catch {}
    try { localStorage.setItem('valentineAccepted', 'true') } catch {}
    setCelebrate(true)
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/romance.mp3')
        audioRef.current.loop = false
        audioRef.current.volume = 0.5
      }
      await audioRef.current.play()
    } catch {}
  }

  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className={`page ${celebrate ? 'celebrate' : ''}`}>
      <FloatingHeartsBackground />
      {!celebrate && !acceptedPrev && (
        <main className="container">
          <Bouquet />
          <h1 className="title">Hi {name}, will you be my Valentine? <span role="img" aria-label="two hearts">💕</span></h1>
          <div ref={wrapRef} className="buttons-wrap">
            <button
              ref={yesRef}
              className="btn yes"
              data-prox={nearYes}
              style={{ '--prox': nearYes }}
              onClick={onYes}
            >
              <span className="heart-shape">Yes <span className="emoji" aria-hidden>💖</span></span>
            </button>
            <button
              ref={noRef}
              className={`btn no ${noJiggle ? 'wiggle' : ''}`}
              style={{ transform: `translate(${noPos.x}px, ${noPos.y}px)`, '--x': `${noPos.x}px`, '--y': `${noPos.y}px` }}
              tabIndex={-1}
              aria-hidden
            >
              <span className="no-chip">No <span className="emoji" aria-hidden>😜</span></span>
            </button>
          </div>
        </main>
      )}

      {acceptedPrev && !celebrate && (
        <main className="container">
          <Bouquet />
          <h1 className="title">Welcome back my beautiful valantine. I love you.</h1>
        </main>
      )}

      <div className={`celebration ${celebrate ? 'show' : ''}`}>
        <Fireworks active={celebrate} />
        <div className="message">
          <div className="big">YAY!!! 💘 I knew you’d say YES!</div>
          <div className="sub">Ummaaaaaa </div> 
          <div className="sub">Happy Valentine’s Day ❤️</div> 
          <div className="meter">
            <div className="meter-fill">
              <span className="meter-text">Love Meter: 100%</span>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && !celebrate && (
        <div className="dialog-backdrop" role="dialog" aria-modal="true">
          <div className={`dialog ${confirmWiggle % 2 ? 'shake' : ''}`}>
            <button className="dialog-close" aria-label="Close" onClick={() => setShowConfirm(false)}>×</button>
            <div className="dialog-title">Are you sure you dont want to become Asrith's valantine ?</div>
            <div className="dialog-actions">
              <button className="dlg-btn yes" onClick={() => { setShowConfirm(false); onYes() }}>Yes</button>
              <button className="dlg-btn no" onClick={() => { setConfirmWiggle(v => v + 1) }}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
