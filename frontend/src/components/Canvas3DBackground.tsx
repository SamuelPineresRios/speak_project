import React, { useEffect, useRef } from 'react'

/**
 * Red de puntos unidos («grieta») en una zona concreta del fondo.
 *
 * La nube general de partículas se reparte sola y queda sutil; estas redes dan
 * puntos de interés claros y controlables donde haga falta.
 */
export interface BackgroundCluster {
  /** Centro en fracción del viewport (0-1), no en píxeles. */
  fx: number
  fy: number
  /** Radio en píxeles. */
  radius: number
  /** Nodos de la red; por defecto 14. */
  points?: number
}

export function Canvas3DBackground({
  className,
  clusters,
}: {
  className?: string
  /** Configuración estable (constante del módulo): se lee al montar. */
  clusters?: BackgroundCluster[]
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)
    
    // Simulate 3D particles in a rotating sphere or space
    const particles: any[] = []
    const particleCount = 120
    const fov = 250 // Field of view

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * 2000 - 1000,
            y: Math.random() * 2000 - 1000,
            z: Math.random() * 2000 - 1000,
            radius: Math.random() * 1.5 + 0.5,
            color: `hsla(${180 + Math.random() * 30}, 100%, 70%, Math.random())`
        })
    }

    // Redes fijas de puntos unidos: nodos alrededor de un centro, con una
    // rotación propia muy lenta. El centro se recalcula en cada fotograma
    // (fracción del viewport), así el resize no las descoloca.
    const graphs = (clusters ?? []).map(cluster => ({
        fx: cluster.fx,
        fy: cluster.fy,
        radius: cluster.radius,
        spin: (Math.random() - 0.5) * 0.00012,
        nodes: Array.from({ length: cluster.points ?? 14 }, () => {
            // sqrt para repartir por área y no amontonar en el centro
            const angulo = Math.random() * Math.PI * 2
            const distancia = Math.sqrt(Math.random()) * cluster.radius
            return {
                x: Math.cos(angulo) * distancia,
                y: Math.sin(angulo) * distancia,
                size: Math.random() * 1.4 + 1,
                alpha: Math.random() * 0.5 + 0.5,
            }
        }),
    }))

    let angleX = 0
    let angleY = 0
    let animationFrameId: number

    const render = () => {
        ctx.clearRect(0, 0, width, height)

        // Slow rotation angles
        angleX += 0.001
        angleY += 0.0015

        const cosX = Math.cos(angleX)
        const sinX = Math.sin(angleX)
        const cosY = Math.cos(angleY)
        const sinY = Math.sin(angleY)

        const points2d: {x: number, y: number, z: number}[] = []

        particles.forEach((p) => {
            // Rotate around x-axis
            const y1 = p.y * cosX - p.z * sinX
            const z1 = p.y * sinX + p.z * cosX

            // Rotate around y-axis
            const x2 = p.x * cosY + z1 * sinY
            const z2 = -p.x * sinY + z1 * cosY

            // Calculate 2D projection
            const scale = fov / (fov + z2 + 1000)
            const x3d = x2 * scale + width / 2
            const y3d = y1 * scale + height / 2

            points2d.push({ x: x3d, y: y3d, z: z2 })

            // Only draw if in front of "camera"
            if (z2 > -1000) {
                ctx.beginPath()
                ctx.arc(x3d, y3d, Math.max(0, p.radius * scale * 2), 0, Math.PI * 2)
                ctx.fillStyle = p.color
                ctx.fill()
            }
        })

        // Draw connections for nodes that are close to each other 
        // using the 2D projected coordinates to save CPU for this MVP
        ctx.lineWidth = 0.5
        for (let i = 0; i < points2d.length; i++) {
            for (let j = i + 1; j < points2d.length; j++) {
                const p1 = points2d[i]
                const p2 = points2d[j]
                // Only connect if both points are somewhat visible
                if (p1.z > -800 && p2.z > -800) {
                   const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y)
                   if (dist < 100) {
                       ctx.strokeStyle = `rgba(6, 182, 212, ${0.2 * (1 - dist / 100)})` // cyan with fade
                       ctx.beginPath()
                       ctx.moveTo(p1.x, p1.y)
                       ctx.lineTo(p2.x, p2.y)
                       ctx.stroke()
                   }
                }
            }
        }

        // Redes de puntos unidos («grietas»): más marcadas que la nube general
        const ahora = performance.now()
        for (const graph of graphs) {
            const cx = graph.fx * width
            const cy = graph.fy * height
            const giro = ahora * graph.spin
            const cosG = Math.cos(giro)
            const sinG = Math.sin(giro)
            const nodos = graph.nodes.map(node => ({
                x: cx + node.x * cosG - node.y * sinG,
                y: cy + node.x * sinG + node.y * cosG,
                size: node.size,
                alpha: node.alpha,
            }))

            const limite = graph.radius * 0.6
            ctx.lineWidth = 0.9
            for (let i = 0; i < nodos.length; i++) {
                for (let j = i + 1; j < nodos.length; j++) {
                    const dist = Math.hypot(nodos[i].x - nodos[j].x, nodos[i].y - nodos[j].y)
                    if (dist < limite) {
                        ctx.strokeStyle = `rgba(6, 182, 212, ${(0.45 * (1 - dist / limite)).toFixed(3)})`
                        ctx.beginPath()
                        ctx.moveTo(nodos[i].x, nodos[i].y)
                        ctx.lineTo(nodos[j].x, nodos[j].y)
                        ctx.stroke()
                    }
                }
            }

            for (const nodo of nodos) {
                ctx.beginPath()
                ctx.arc(nodo.x, nodo.y, nodo.size, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(103, 232, 249, ${(0.85 * nodo.alpha).toFixed(3)})`
                ctx.fill()
            }
        }

        animationFrameId = requestAnimationFrame(render)
    }

    render()

    const handleResize = () => {
        width = canvas.width = window.innerWidth
        height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [clusters])

  return (
    <canvas 
      ref={canvasRef} 
      className={`fixed inset-0 w-full h-full pointer-events-none ${className || ''}`}
      style={{ zIndex: 0 }}
    />
  )
}