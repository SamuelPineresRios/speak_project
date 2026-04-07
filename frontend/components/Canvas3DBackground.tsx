'use client'

import React, { useEffect, useRef } from 'react'

export function Canvas3DBackground({ className }: { className?: string }) {
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
    let fov = 250 // Field of view

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * 2000 - 1000,
            y: Math.random() * 2000 - 1000,
            z: Math.random() * 2000 - 1000,
            radius: Math.random() * 1.5 + 0.5,
            color: `hsla(${180 + Math.random() * 30}, 100%, 70%, Math.random())`
        })
    }

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
            let y1 = p.y * cosX - p.z * sinX
            let z1 = p.y * sinX + p.z * cosX

            // Rotate around y-axis
            let x2 = p.x * cosY + z1 * sinY
            let z2 = -p.x * sinY + z1 * cosY

            // Calculate 2D projection
            let scale = fov / (fov + z2 + 1000)
            let x3d = x2 * scale + width / 2
            let y3d = y1 * scale + height / 2

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
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className={`fixed inset-0 w-full h-full pointer-events-none ${className || ''}`}
      style={{ zIndex: 0 }}
    />
  )
}