import { useState, useEffect, useRef } from 'react'
import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext'

export default function DynamicLayoutDemo() {
  const [imageSize, setImageSize] = useState(200)
  const [imagePosition, setImagePosition] = useState<'left' | 'right'>('right')
  const [fontSize, setFontSize] = useState(16)
  const [calcTime, setCalcTime] = useState(0)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const sampleText = `Pretext enables advanced layout scenarios that were previously impossible or impractical in web development. This demo shows text flowing around an image with variable line widths - something that's complex to achieve with pure CSS. Each line can have a different maximum width, and Pretext handles it perfectly. The text automatically adjusts as you change the image size and position. This opens up possibilities for magazine-style layouts, complex text wrapping, and creative typography on the web. 🎨📐`

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const canvasWidth = 800
    const padding = 40
    const lineHeight = fontSize * 1.6
    const font = `${fontSize}px Inter`

    const prepared = prepareWithSegments(sampleText, font)

    const startTime = performance.now()

    let cursor = { segmentIndex: 0, graphemeIndex: 0 }
    let y = padding
    const lines: Array<{ text: string; x: number; y: number }> = []
    const imageTop = padding + 20
    const imageBottom = imageTop + imageSize
    const imageGap = 20

    while (true) {
      let maxWidth: number
      
      if (y >= imageTop && y < imageBottom) {
        maxWidth = canvasWidth - padding * 2 - imageSize - imageGap
      } else {
        maxWidth = canvasWidth - padding * 2
      }

      const line = layoutNextLine(prepared, cursor, maxWidth)
      if (line === null) break

      const x = (y >= imageTop && y < imageBottom && imagePosition === 'left') 
        ? padding + imageSize + imageGap 
        : padding

      lines.push({ text: line.text, x, y })
      cursor = line.end
      y += lineHeight
    }

    const layoutTime = performance.now() - startTime
    setCalcTime(layoutTime)

    const canvasHeight = y + padding
    canvas.width = canvasWidth * dpr
    canvas.height = canvasHeight * dpr
    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`

    ctx.scale(dpr, dpr)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    const imageX = imagePosition === 'left' ? padding : canvasWidth - padding - imageSize
    ctx.fillStyle = '#6366f1'
    ctx.fillRect(imageX, imageTop, imageSize, imageSize)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 16px Inter'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('IMAGE', imageX + imageSize / 2, imageTop + imageSize / 2)

    ctx.font = font
    ctx.fillStyle = '#1e293b'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    lines.forEach(line => {
      ctx.fillText(line.text, line.x, line.y)
    })
  }, [imageSize, imagePosition, fontSize, sampleText])

  return (
    <div className="demo-section">
      <h2 className="demo-title">📐 Dynamic Width Layout</h2>
      <p className="demo-description">
        Flow text around obstacles with variable line widths. Each line can have a different
        maximum width - perfect for magazine layouts and creative designs.
      </p>

      <div className="info-box">
        <h3>Variable Width Lines</h3>
        <p>
          Traditional CSS float can wrap text around images, but Pretext gives you programmatic
          control over each line's width. This enables custom shapes, diagonal flows, and
          creative layouts impossible with CSS alone.
        </p>
      </div>

      <div className="controls">
        <div className="control-group">
          <label className="control-label">Image Size</label>
          <input
            type="range"
            min="100"
            max="300"
            value={imageSize}
            step="10"
            onChange={(e) => setImageSize(parseInt(e.target.value))}
          />
          <span className="metric-value">{imageSize}px</span>
        </div>
        <div className="control-group">
          <label className="control-label">Image Position</label>
          <select
            value={imagePosition}
            onChange={(e) => setImagePosition(e.target.value as 'left' | 'right')}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div className="control-group">
          <label className="control-label">Font Size</label>
          <input
            type="range"
            min="14"
            max="24"
            value={fontSize}
            step="2"
            onChange={(e) => setFontSize(parseInt(e.target.value))}
          />
          <span className="metric-value">{fontSize}px</span>
        </div>
      </div>

      <div className="canvas-container">
        <canvas ref={canvasRef} />
      </div>

      <div className="metric" style={{ marginTop: '1.5rem' }}>
        <span className="metric-label">Layout Calculation Time</span>
        <span className="metric-value fast">{calcTime.toFixed(3)}ms</span>
      </div>
    </div>
  )
}
