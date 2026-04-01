import { useEffect, useRef } from 'react'
import { usePretextLines } from '../hooks/usePretext'

interface CanvasTextProps {
  text: string
  width: number
  font?: string
  lineHeight?: number
  color?: string
  backgroundColor?: string
}

export default function CanvasText({
  text,
  width,
  font = '16px Inter',
  lineHeight = 24,
  color = '#000000',
  backgroundColor = '#ffffff',
}: CanvasTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { lines, height } = usePretextLines(text, font, width - 40, lineHeight)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const totalHeight = height + 40

    canvas.width = width * dpr
    canvas.height = totalHeight * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${totalHeight}px`

    ctx.scale(dpr, dpr)

    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, totalHeight)

    ctx.font = font
    ctx.fillStyle = color
    ctx.textBaseline = 'top'

    lines.forEach((line, i) => {
      ctx.fillText(line.text, 20, 20 + i * lineHeight)
    })
  }, [text, width, font, lineHeight, color, backgroundColor, lines, height])

  return <canvas ref={canvasRef} />
}
