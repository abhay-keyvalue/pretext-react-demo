import { useState } from 'react'
import { prepare, layout } from '@chenglou/pretext'

export default function PerformanceDemo() {
  const [iterations, setIterations] = useState(1000)
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<{
    pretextTime: number
    domTime: number
    speedup: number
  } | null>(null)

  const sampleText = `The future of web development is here. Pretext revolutionizes how we handle text layout by eliminating expensive DOM reflow operations. Traditional methods require the browser to recalculate layout for every measurement, causing performance bottlenecks. With Pretext, you get instant, accurate measurements using pure JavaScript arithmetic. 🚀`

  async function runBenchmark() {
    setIsRunning(true)
    setResults(null)

    await new Promise(resolve => setTimeout(resolve, 100))

    const pretextTime = await benchmarkPretext(iterations)
    const domTime = await benchmarkDOM(iterations)
    const speedup = domTime / pretextTime

    setResults({ pretextTime, domTime, speedup })
    setIsRunning(false)
  }

  async function benchmarkPretext(iterations: number): Promise<number> {
    const prepared = prepare(sampleText, '16px Inter')
    
    const start = performance.now()
    for (let i = 0; i < iterations; i++) {
      const width = 300 + (i % 400)
      layout(prepared, width, 24)
    }
    return performance.now() - start
  }

  async function benchmarkDOM(iterations: number): Promise<number> {
    const testDiv = document.createElement('div')
    testDiv.style.cssText = `
      position: absolute;
      visibility: hidden;
      font: 16px Inter;
      line-height: 24px;
      white-space: normal;
      word-break: normal;
      overflow-wrap: break-word;
    `
    testDiv.textContent = sampleText
    document.body.appendChild(testDiv)

    const start = performance.now()
    for (let i = 0; i < iterations; i++) {
      const width = 300 + (i % 400)
      testDiv.style.width = `${width}px`
      void testDiv.offsetHeight
    }
    const elapsed = performance.now() - start

    document.body.removeChild(testDiv)
    return elapsed
  }

  return (
    <div className="demo-section">
      <h2 className="demo-title">⚡ Performance Comparison</h2>
      <p className="demo-description">
        See how Pretext eliminates DOM reflow and delivers blazing-fast text measurements.
        This demo measures {iterations.toLocaleString()} text blocks with different widths.
      </p>

      <div className="info-box">
        <h3>Why This Matters</h3>
        <p>
          Traditional DOM-based measurements trigger layout reflow - one of the most expensive browser operations.
          Pretext uses cached measurements and pure arithmetic, making it orders of magnitude faster.
        </p>
      </div>

      <div className="controls">
        <div className="control-group">
          <label className="control-label">Iterations</label>
          <input
            type="range"
            min="100"
            max="2000"
            value={iterations}
            step="100"
            onChange={(e) => setIterations(parseInt(e.target.value))}
          />
          <span className="metric-value">{iterations}</span>
        </div>
        <button onClick={runBenchmark} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Run Benchmark'}
        </button>
      </div>

      {isRunning && (
        <div className="loading">
          <span className="spinner"></span>
          Benchmarking...
        </div>
      )}

      {results && (
        <div className="comparison-grid">
          <div className={`comparison-card ${results.pretextTime < results.domTime ? 'winner' : 'loser'}`}>
            <div className="card-header">
              <h3 className="card-title">🚀 Pretext</h3>
              {results.pretextTime < results.domTime ? (
                <span className="badge winner">Winner</span>
              ) : (
                <span className="badge loser">Slower</span>
              )}
            </div>
            <div className="stats">
              <div className="stat-row">
                <span className="stat-label">Total Time</span>
                <span className="stat-value fast">{results.pretextTime.toFixed(2)}ms</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Per Operation</span>
                <span className="stat-value fast">{(results.pretextTime / iterations).toFixed(3)}ms</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Operations/sec</span>
                <span className="stat-value fast">
                  {Math.round(iterations / results.pretextTime * 1000).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className={`comparison-card ${results.domTime < results.pretextTime ? 'winner' : 'loser'}`}>
            <div className="card-header">
              <h3 className="card-title">🐌 Traditional DOM</h3>
              {results.domTime < results.pretextTime ? (
                <span className="badge winner">Winner</span>
              ) : (
                <span className="badge loser">Slower</span>
              )}
            </div>
            <div className="stats">
              <div className="stat-row">
                <span className="stat-label">Total Time</span>
                <span className="stat-value slow">{results.domTime.toFixed(2)}ms</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Per Operation</span>
                <span className="stat-value slow">{(results.domTime / iterations).toFixed(3)}ms</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Operations/sec</span>
                <span className="stat-value slow">
                  {Math.round(iterations / results.domTime * 1000).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="demo-card" style={{ gridColumn: '1 / -1' }}>
            <h3 className="card-title">📊 Summary</h3>
            <div className="metric">
              <span className="metric-label">
                Pretext is <strong>{results.speedup.toFixed(1)}x {results.pretextTime < results.domTime ? 'faster' : 'slower'}</strong> than traditional DOM measurements
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
              {results.pretextTime < results.domTime
                ? `Pretext avoided ${iterations} layout reflows, saving ${(results.domTime - results.pretextTime).toFixed(2)}ms of computation time.`
                : 'Note: DOM might be faster for very small operations due to browser optimizations, but Pretext scales better.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
