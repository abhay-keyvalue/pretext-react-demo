import { useState, useMemo } from 'react'
import { prepareWithSegments, walkLineRanges, layoutWithLines } from '@chenglou/pretext'

interface SampleResult {
  text: string
  optimalWidth: number
  actualLines: number
  calcTime: number
  lines: Array<{ text: string }>
}

export default function ShrinkWrapDemo() {
  const [customText, setCustomText] = useState('Short text')
  const [targetLines, setTargetLines] = useState(1)
  const [samples, setSamples] = useState([
    'Short text',
    'This is a medium length text that will wrap differently',
    'This is a much longer piece of text that demonstrates how Pretext can calculate the optimal width for text content without any DOM measurements whatsoever',
    'AGI 春天到了 🚀',
    'The quick brown fox jumps over the lazy dog',
  ])

  const addSample = () => {
    const text = customText.trim()
    if (text && !samples.includes(text)) {
      setSamples([...samples, text])
      setCustomText('')
    }
  }

  const findOptimalWidth = (text: string, font: string, targetLines: number): { width: number; actualLines: number } => {
    const prepared = prepareWithSegments(text, font)
    
    let minWidth = 50
    let maxWidth = 1200
    let bestWidth = maxWidth
    let bestLines = 1

    while (maxWidth - minWidth > 1) {
      const midWidth = Math.floor((minWidth + maxWidth) / 2)
      let lineCount = 0
      
      walkLineRanges(prepared, midWidth, () => {
        lineCount++
      })

      if (lineCount <= targetLines) {
        maxWidth = midWidth
        bestWidth = midWidth
        bestLines = lineCount
      } else {
        minWidth = midWidth
      }
    }

    return { width: bestWidth, actualLines: bestLines }
  }

  const findWidestLine = (text: string, font: string, maxWidth: number): number => {
    const prepared = prepareWithSegments(text, font)
    let maxLineWidth = 0

    walkLineRanges(prepared, maxWidth, (line) => {
      if (line.width > maxLineWidth) {
        maxLineWidth = line.width
      }
    })

    return Math.ceil(maxLineWidth)
  }

  const results = useMemo<SampleResult[]>(() => {
    const font = '16px Inter'
    
    return samples.map(text => {
      const startTime = performance.now()
      const { width: optimalWidth, actualLines } = findOptimalWidth(text, font, targetLines)
      const widestLine = findWidestLine(text, font, optimalWidth)
      const calcTime = performance.now() - startTime

      const prepared = prepareWithSegments(text, font)
      const { lines } = layoutWithLines(prepared, widestLine, 24)

      return {
        text,
        optimalWidth: widestLine,
        actualLines,
        calcTime,
        lines,
      }
    })
  }, [samples, targetLines])

  return (
    <div className="demo-section">
      <h2 className="demo-title">📦 Shrink-Wrap Text</h2>
      <p className="demo-description">
        Find the tightest container width that fits text without wrapping, or the optimal
        width for a target number of lines. This "shrink-wrap" calculation has been missing from the web!
      </p>

      <div className="info-box">
        <h3>What is Shrink-Wrapping?</h3>
        <p>
          Shrink-wrapping finds the minimum width needed to display text at a target line count.
          This is useful for tooltips, labels, chat bubbles, and any UI where you want text
          to determine its container size rather than the other way around.
        </p>
      </div>

      <div className="controls">
        <div className="control-group">
          <label className="control-label">Custom Text</label>
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSample()}
            placeholder="Enter text to measure..."
          />
        </div>
        <div className="control-group">
          <label className="control-label">Target Lines</label>
          <input
            type="range"
            min="1"
            max="5"
            value={targetLines}
            step="1"
            onChange={(e) => setTargetLines(parseInt(e.target.value))}
          />
          <span className="metric-value">{targetLines}</span>
        </div>
        <button onClick={addSample}>Add to Samples</button>
      </div>

      <div className="demo-grid">
        {results.map((result, index) => (
          <div key={index} className="demo-card">
            <div className="card-header">
              <h3 className="card-title">Sample {index + 1}</h3>
              {result.actualLines === targetLines ? (
                <span className="badge winner">Perfect Fit</span>
              ) : (
                <span className="badge" style={{ background: 'var(--text-muted)' }}>Best Fit</span>
              )}
            </div>
            
            <div className="canvas-container" style={{ background: 'white', padding: '1.5rem', margin: '1rem 0' }}>
              <div
                style={{
                  font: '16px Inter',
                  lineHeight: '24px',
                  width: `${result.optimalWidth}px`,
                  color: '#1e293b',
                  border: '2px dashed #6366f1',
                  padding: '0.75rem',
                  wordBreak: 'normal',
                  overflowWrap: 'break-word',
                }}
              >
                {result.lines.map((line, i) => (
                  <div key={i}>{line.text}</div>
                ))}
              </div>
            </div>

            <div className="stats">
              <div className="stat-row">
                <span className="stat-label">Target Lines</span>
                <span className="stat-value">{targetLines}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Actual Lines</span>
                <span className={`stat-value ${result.actualLines === targetLines ? 'fast' : ''}`}>
                  {result.actualLines}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Optimal Width</span>
                <span className="stat-value fast">{result.optimalWidth}px</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Calc Time</span>
                <span className="stat-value fast">{result.calcTime.toFixed(3)}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
