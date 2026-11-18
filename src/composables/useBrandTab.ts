import { onBeforeUnmount, onMounted } from 'vue'

/**
 * Plays with the browser tab. The favicon is the CL mark with a thin bar along
 * its bottom edge that fills as you scroll the page, and the title calls you
 * back when you switch to another tab. Both are cosmetic: without JavaScript,
 * or with reduced motion, the static favicon from index.html stays as it is.
 */

const ABSENT_TITLE = 'Volta aqui 👋 · Clara Lívia'

const draw = (ctx: CanvasRenderingContext2D, progress: number) => {
  const s = 64
  ctx.clearRect(0, 0, s, s)

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(0, 0, s, s, 16)
  ctx.clip()

  const bg = ctx.createLinearGradient(0, 0, 0, s)
  bg.addColorStop(0, '#17406e')
  bg.addColorStop(1, '#06111f')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, s, s)

  const sheen = ctx.createLinearGradient(0, 0, 0, s)
  sheen.addColorStop(0, 'rgba(255,255,255,0.22)')
  sheen.addColorStop(0.45, 'rgba(255,255,255,0)')
  ctx.fillStyle = sheen
  ctx.fillRect(0, 0, s, s)

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 6.5

  ctx.strokeStyle = '#fdf3e3'
  ctx.beginPath()
  ctx.arc(25, 32, 13, (40 * Math.PI) / 180, (-40 * Math.PI) / 180, false)
  ctx.stroke()

  ctx.strokeStyle = '#ff7a45'
  ctx.beginPath()
  ctx.moveTo(43, 21)
  ctx.lineTo(43, 43)
  ctx.lineTo(53, 43)
  ctx.stroke()

  // Scroll progress: a bar along the bottom edge, clipped by the rounded tile.
  if (progress > 0.01) {
    ctx.fillStyle = '#ff7a45'
    ctx.fillRect(0, s - 7, s * progress, 7)
  }
  ctx.restore()
}

export function useBrandTab() {
  let cleanup: (() => void) | null = null

  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (!ctx || typeof ctx.roundRect !== 'function') return

    // One dynamic icon replaces the static ones for this tab.
    document.querySelectorAll('link[rel="icon"]').forEach((el) => el.remove())
    const link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/png'
    document.head.appendChild(link)

    let lastStep = -1
    const paint = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0
      const step = Math.round(progress * 40) // 2.5% steps: no need to redraw more often
      if (step === lastStep) return
      lastStep = step
      draw(ctx, step / 40)
      link.href = canvas.toDataURL('image/png')
    }
    paint()

    let timer = 0
    const onScroll = () => {
      if (timer) return
      timer = window.setTimeout(() => {
        timer = 0
        paint()
      }, 140)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    let realTitle = ''
    const onVisibility = () => {
      if (document.hidden) {
        realTitle = document.title
        document.title = ABSENT_TITLE
      } else if (realTitle) {
        document.title = realTitle
        realTitle = ''
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    cleanup = () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      window.clearTimeout(timer)
    }
  })

  onBeforeUnmount(() => cleanup?.())
}
