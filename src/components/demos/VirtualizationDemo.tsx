import { useState, useEffect, useMemo, useRef } from 'react'
import { prepare, layout } from '@chenglou/pretext'

interface Item {
  id: number
  text: string
}

function generateRandomText(seed: number): string {
  const templates = [
    'The quick brown fox jumps over the lazy dog.',
    'AGI 春天到了. بدأت الرحلة 🚀 Technology is advancing rapidly.',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Pretext makes text layout fast and accurate without DOM measurements.',
    'Revolutionary approach to handling multilingual text in web applications.',
  ]
  
  const template = templates[seed % templates.length]
  const repetitions = (seed % 3) + 1
  return Array(repetitions).fill(template).join(' ')
}

export default function VirtualizationDemo() {
  const [containerWidth, setContainerWidth] = useState(600)
  const [scrollTop, setScrollTop] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const items = useMemo<Item[]>(
    () => Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      text: `Item ${i + 1}: ${generateRandomText(i)}`,
    })),
    []
  )

  const preparedItems = useMemo(
    () => items.map(item => ({
      ...item,
      prepared: prepare(item.text, '16px Inter'),
    })),
    [items]
  )

  const { itemHeights, itemOffsets, totalHeight } = useMemo(() => {
    const heights: number[] = []
    const offsets: number[] = []
    let total = 0

    preparedItems.forEach((item, i) => {
      const { height } = layout(item.prepared, containerWidth, 24)
      const itemHeight = height + 32
      heights[i] = itemHeight
      offsets[i] = total
      total += itemHeight
    })

    return { itemHeights: heights, itemOffsets: offsets, totalHeight: total }
  }, [preparedItems, containerWidth])

  const visibleItems = useMemo(() => {
    const containerHeight = 600
    const scrollBottom = scrollTop + containerHeight

    let startIndex = 0
    let endIndex = items.length

    for (let i = 0; i < itemOffsets.length; i++) {
      if (itemOffsets[i] + itemHeights[i] >= scrollTop) {
        startIndex = i
        break
      }
    }

    for (let i = startIndex; i < itemOffsets.length; i++) {
      if (itemOffsets[i] > scrollBottom) {
        endIndex = i
        break
      }
    }

    const buffer = 5
    startIndex = Math.max(0, startIndex - buffer)
    endIndex = Math.min(items.length, endIndex + buffer)

    return { startIndex, endIndex }
  }, [scrollTop, itemOffsets, itemHeights, items.length])

  const handleScroll = () => {
    if (scrollRef.current) {
      setScrollTop(scrollRef.current.scrollTop)
    }
  }

  useEffect(() => {
    const element = scrollRef.current
    if (element) {
      element.addEventListener('scroll', handleScroll)
      return () => element.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="demo-section">
      <h2 className="demo-title">📜 Smart Virtualization</h2>
      <p className="demo-description">
        Scroll through 10,000 items with variable heights. Pretext calculates exact heights
        without DOM measurements, enabling perfect virtualization with zero layout shift.
      </p>

      <div className="info-box">
        <h3>The Problem with Traditional Virtualization</h3>
        <p>
          Most virtual scrollers either: (1) assume fixed heights (breaks with dynamic content),
          (2) measure everything upfront (slow initial render), or (3) estimate heights (causes layout shift).
          Pretext solves this by calculating exact heights instantly.
        </p>
      </div>

      <div className="controls">
        <div className="control-group">
          <label className="control-label">Container Width</label>
          <input
            type="range"
            min="300"
            max="800"
            value={containerWidth}
            step="10"
            onChange={(e) => setContainerWidth(parseInt(e.target.value))}
          />
          <span className="metric-value">{containerWidth}px</span>
        </div>
        <div className="metric">
          <span className="metric-label">Total Items</span>
          <span className="metric-value fast">{items.length.toLocaleString()}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Rendered Items</span>
          <span className="metric-value fast">
            {visibleItems.endIndex - visibleItems.startIndex}
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="virtual-scroll-container"
        style={{ width: containerWidth }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {items.slice(visibleItems.startIndex, visibleItems.endIndex).map((item, i) => {
            const actualIndex = visibleItems.startIndex + i
            return (
              <div
                key={item.id}
                className="text-item"
                style={{
                  position: 'absolute',
                  top: itemOffsets[actualIndex],
                  left: 0,
                  right: 0,
                  height: itemHeights[actualIndex],
                }}
              >
                {item.text}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
