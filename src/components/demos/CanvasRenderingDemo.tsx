import { useState, useEffect, useRef } from 'react'
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

export default function CanvasRenderingDemo() {
  const [text, setText] = useState(`Welcome to Pretext! 🚀

This is a canvas-based text renderer that uses Pretext for perfect layout calculations. Unlike traditional DOM text, this is rendered directly to a 2D canvas context.

支持多语言文本 (Chinese)
يدعم النص العربي (Arabic)
Emoji support: 🎨 🌟 ✨ 💫

Try resizing the width slider below to see the text reflow in real-time!`)
  const [canvasWidth, setCanvasWidth] = useState(700)
  const [fontSize, setFontSize] = useState(18)
  const [lineHeight, setLineHeight] = useState(28)
  const [stats, setStats] = useState({ layoutTime: 0, lineCount: 0, totalHeight: 0 })
  
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const font = `${fontSize}px Inter`

    const prepared = prepareWithSegments(text, font, { whiteSpace: 'pre-wrap' })
    
    const startTime = performance.now()
    const { lines, height } = layoutWithLines(prepared, canvasWidth - 40, lineHeight)
    const layoutTime = performance.now() - startTime

    canvas.width = canvasWidth * dpr
    canvas.height = (height + 40) * dpr
    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${height + 40}px`

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, canvasWidth, height + 40)

    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, canvasWidth, height + 40)

    ctx.font = font
    ctx.fillStyle = '#f1f5f9'
    ctx.textBaseline = 'top'

    lines.forEach((line, i) => {
      ctx.fillText(line.text, 20, 20 + i * lineHeight)
    })

    setStats({ layoutTime, lineCount: lines.length, totalHeight: height })
  }, [text, canvasWidth, fontSize, lineHeight])

  return (
    <div className="demo-section">
      <h2 className="demo-title">🎨 Canvas Rendering</h2>
      <p className="demo-description">
        Render perfectly laid out text directly to canvas without any DOM elements.
        Great for games, data visualizations, and high-performance graphics.
      </p>

      <div className="controls">
        <div className="control-group">
          <label className="control-label">Text Content</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text..."
            rows={6}
          />
        </div>
      </div>

      <div className="controls">
        <div className="control-group">
          <label className="control-label">Canvas Width</label>
          <input
            type="range"
            min="300"
            max="900"
            value={canvasWidth}
            step="10"
            onChange={(e) => setCanvasWidth(parseInt(e.target.value))}
          />
          <span className="metric-value">{canvasWidth}px</span>
        </div>
        <div className="control-group">
          <label className="control-label">Font Size</label>
          <input
            type="range"
            min="12"
            max="32"
            value={fontSize}
            step="2"
            onChange={(e) => setFontSize(parseInt(e.target.value))}
          />
          <span className="metric-value">{fontSize}px</span>
        </div>
        <div className="control-group">
          <label className="control-label">Line Height</label>
          <input
            type="range"
            min="20"
            max="48"
            value={lineHeight}
            step="2"
            onChange={(e) => setLineHeight(parseInt(e.target.value))}
          />
          <span className="metric-value">{lineHeight}px</span>
        </div>
      </div>

      <div className="canvas-container">
        <canvas ref={canvasRef} />
      </div>

      <div className="info-box" style={{ marginTop: '2rem' }}>
        <h3>Performance Stats</h3>
        <div className="stats">
          <div className="stat-row">
            <span className="stat-label">Layout Time</span>
            <span className="stat-value fast">{stats.layoutTime.toFixed(3)}ms</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Line Count</span>
            <span className="stat-value">{stats.lineCount} lines</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Total Height</span>
            <span className="stat-value">{stats.totalHeight}px</span>
          </div>
        </div>
      </div>
    </div>
  )
}
