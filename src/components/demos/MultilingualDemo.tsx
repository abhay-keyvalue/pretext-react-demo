import { useState, useMemo } from 'react'
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

interface Sample {
  name: string
  text: string
  font: string
}

export default function MultilingualDemo() {
  const [width, setWidth] = useState(500)

  const samples: Sample[] = [
    {
      name: 'Mixed Languages',
      text: 'English text mixed with 中文字符 and العربية and 日本語 and Emoji 🌍🚀✨',
      font: '18px Inter',
    },
    {
      name: 'Arabic (RTL)',
      text: 'مرحبا بك في عالم البرمجة الحديثة. هذا النص يتدفق من اليمين إلى اليسار بشكل صحيح.',
      font: '20px Inter',
    },
    {
      name: 'Chinese',
      text: '人工智能正在改变世界。这个库支持所有语言，包括复杂的字符系统和表情符号。春天到了，万物复苏。',
      font: '18px Inter',
    },
    {
      name: 'Japanese',
      text: 'プログラミングは楽しいです。このライブラリは、すべての言語をサポートしています。🎌',
      font: '18px Inter',
    },
    {
      name: 'Emoji Rich',
      text: '🚀 Rocket launch 🌟 Star power ✨ Sparkles ❤️ Love 🎨 Art 🌈 Rainbow 🔥 Fire 💻 Code 🎯 Target 🌍 World',
      font: '20px Inter',
    },
    {
      name: 'Mixed Bidi',
      text: 'This is English text with embedded العربية (Arabic) and back to English again. الذكاء الاصطناعي AI technology 🤖',
      font: '18px Inter',
    },
  ]

  const renderedSamples = useMemo(() => {
    return samples.map(sample => {
      const prepared = prepareWithSegments(sample.text, sample.font)
      const { lines, height, lineCount } = layoutWithLines(prepared, width, 28)
      return { ...sample, lines, height, lineCount }
    })
  }, [width])

  return (
    <div className="demo-section">
      <h2 className="demo-title">🌍 Multilingual Layout</h2>
      <p className="demo-description">
        Pretext handles all languages correctly, including RTL scripts, complex characters,
        mixed bidirectional text, and emojis. All without special configuration.
      </p>

      <div className="info-box">
        <h3>Universal Language Support</h3>
        <p>
          Pretext uses the browser's native text segmentation and measurement APIs to support
          every language correctly. This includes proper handling of grapheme clusters, 
          bidirectional text, and complex scripts like Arabic, Chinese, Japanese, Korean, Thai, and more.
        </p>
      </div>

      <div className="controls">
        <div className="control-group">
          <label className="control-label">Text Width</label>
          <input
            type="range"
            min="200"
            max="800"
            value={width}
            step="10"
            onChange={(e) => setWidth(parseInt(e.target.value))}
          />
          <span className="metric-value">{width}px</span>
        </div>
      </div>

      <div className="demo-grid">
        {renderedSamples.map((sample, index) => (
          <div key={index} className="demo-card">
            <h3 className="card-title">{sample.name}</h3>
            <div className="canvas-container" style={{ background: 'white', padding: '1.5rem' }}>
              <div
                style={{
                  font: sample.font,
                  lineHeight: '28px',
                  width: `${width}px`,
                  color: '#1e293b',
                  wordBreak: 'normal',
                  overflowWrap: 'break-word',
                }}
              >
                {sample.lines.map((line, i) => (
                  <div key={i}>{line.text}</div>
                ))}
              </div>
            </div>
            <div className="stats" style={{ marginTop: '1rem' }}>
              <div className="stat-row">
                <span className="stat-label">Lines</span>
                <span className="stat-value">{sample.lineCount}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Height</span>
                <span className="stat-value">{sample.height}px</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
