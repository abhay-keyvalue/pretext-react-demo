# React + Pretext Patterns

## 🎯 Essential Patterns for React Integration

### 1. Basic Text Height Calculation

```typescript
import { useMemo } from 'react'
import { prepare, layout } from '@chenglou/pretext'

function TextContainer({ text, width }: Props) {
  const prepared = useMemo(
    () => prepare(text, '16px Inter'),
    [text]
  )

  const { height, lineCount } = useMemo(
    () => layout(prepared, width, 24),
    [prepared, width]
  )

  return (
    <div style={{ height }}>
      <p>{text}</p>
      <small>{lineCount} lines</small>
    </div>
  )
}
```

**Key points:**
- Memoize `prepare()` to avoid recalculation
- Memoize `layout()` separately for width changes
- Dependencies: text for prepare, width for layout

### 2. Custom Hook Pattern

```typescript
// hooks/usePretext.ts
import { useMemo } from 'react'
import { prepare, layout } from '@chenglou/pretext'

export function usePretextLayout(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number
) {
  const prepared = useMemo(
    () => prepare(text, font),
    [text, font]
  )

  return useMemo(
    () => layout(prepared, maxWidth, lineHeight),
    [prepared, maxWidth, lineHeight]
  )
}

// Usage
function MyComponent({ text, width }: Props) {
  const { height } = usePretextLayout(text, '16px Inter', width, 24)
  return <div style={{ height }}>{text}</div>
}
```

**Benefits:**
- Encapsulates memoization logic
- Reusable across components
- Type-safe
- Optimized performance

### 3. Virtual Scrolling with Variable Heights

```typescript
import { useMemo, useState, useRef, useEffect } from 'react'
import { prepare, layout } from '@chenglou/pretext'

interface Item {
  id: string
  text: string
}

function VirtualScroller({ items, width, height }: Props) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const prepared = useMemo(
    () => items.map(item => ({
      ...item,
      prepared: prepare(item.text, '16px Inter'),
    })),
    [items]
  )

  const { heights, offsets, totalHeight } = useMemo(() => {
    const heights: number[] = []
    const offsets: number[] = []
    let total = 0

    prepared.forEach(item => {
      const { height } = layout(item.prepared, width, 24)
      heights.push(height)
      offsets.push(total)
      total += height
    })

    return { heights, offsets, totalHeight: total }
  }, [prepared, width])

  const visibleRange = useMemo(() => {
    let start = 0
    let end = items.length

    for (let i = 0; i < offsets.length; i++) {
      if (offsets[i] + heights[i] >= scrollTop) {
        start = i
        break
      }
    }

    for (let i = start; i < offsets.length; i++) {
      if (offsets[i] > scrollTop + height) {
        end = i
        break
      }
    }

    return { start: Math.max(0, start - 2), end: Math.min(items.length, end + 2) }
  }, [scrollTop, height, offsets, heights, items.length])

  useEffect(() => {
    const element = scrollRef.current
    const handler = () => setScrollTop(element?.scrollTop || 0)
    element?.addEventListener('scroll', handler, { passive: true })
    return () => element?.removeEventListener('scroll', handler)
  }, [])

  return (
    <div ref={scrollRef} style={{ height, overflow: 'auto' }}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        {items.slice(visibleRange.start, visibleRange.end).map((item, i) => {
          const index = visibleRange.start + i
          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                top: offsets[index],
                height: heights[index],
              }}
            >
              {item.text}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### 4. Canvas Rendering Component

```typescript
import { useEffect, useRef } from 'react'
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

function CanvasText({ text, width, font = '16px Inter' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const prepared = prepareWithSegments(text, font)
    const { lines, height } = layoutWithLines(prepared, width - 40, 24)

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = (height + 40) * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height + 40}px`

    ctx.scale(dpr, dpr)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height + 40)

    ctx.font = font
    ctx.fillStyle = '#000000'
    ctx.textBaseline = 'top'

    lines.forEach((line, i) => {
      ctx.fillText(line.text, 20, 20 + i * 24)
    })
  }, [text, width, font])

  return <canvas ref={canvasRef} />
}
```

### 5. Responsive Text Container

```typescript
import { useMemo } from 'react'
import { prepareWithSegments, walkLineRanges } from '@chenglou/pretext'

function ShrinkWrapText({ text, targetLines = 1 }: Props) {
  const optimalWidth = useMemo(() => {
    const prepared = prepareWithSegments(text, '16px Inter')
    
    let minWidth = 50
    let maxWidth = 800

    while (maxWidth - minWidth > 1) {
      const mid = Math.floor((minWidth + maxWidth) / 2)
      let lineCount = 0
      walkLineRanges(prepared, mid, () => lineCount++)

      if (lineCount <= targetLines) {
        maxWidth = mid
      } else {
        minWidth = mid
      }
    }

    let widest = 0
    walkLineRanges(prepared, maxWidth, line => {
      if (line.width > widest) widest = line.width
    })

    return Math.ceil(widest)
  }, [text, targetLines])

  return (
    <div
      style={{
        width: optimalWidth,
        padding: '0.75rem',
        border: '2px solid #6366f1',
        borderRadius: '8px',
      }}
    >
      {text}
    </div>
  )
}
```

### 6. Chat Bubble Component

```typescript
import { useMemo } from 'react'
import { prepareWithSegments, walkLineRanges, layoutWithLines } from '@chenglou/pretext'

interface ChatBubbleProps {
  message: string
  sender: 'user' | 'other'
  maxWidth?: number
}

function ChatBubble({ message, sender, maxWidth = 400 }: ChatBubbleProps) {
  const font = '15px Inter'

  const bubbleWidth = useMemo(() => {
    const prepared = prepareWithSegments(message, font)
    let widest = 0
    
    walkLineRanges(prepared, maxWidth, line => {
      if (line.width > widest) widest = line.width
    })
    
    return Math.min(Math.ceil(widest) + 32, maxWidth)
  }, [message, maxWidth])

  const { lines, height } = useMemo(() => {
    const prepared = prepareWithSegments(message, font)
    return layoutWithLines(prepared, bubbleWidth - 32, 22)
  }, [message, bubbleWidth])

  return (
    <div
      style={{
        maxWidth: bubbleWidth,
        padding: '1rem',
        borderRadius: '16px',
        background: sender === 'user' ? '#6366f1' : '#e5e7eb',
        color: sender === 'user' ? 'white' : 'black',
        marginLeft: sender === 'user' ? 'auto' : 0,
        marginRight: sender === 'user' ? 0 : 'auto',
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>{line.text}</div>
      ))}
    </div>
  )
}
```

### 7. Responsive Card Grid

```typescript
import { useMemo } from 'react'
import { prepare, layout } from '@chenglou/pretext'

interface Card {
  id: string
  title: string
  description: string
}

function CardGrid({ cards, containerWidth }: Props) {
  const cardsPerRow = Math.floor(containerWidth / 320)
  const cardWidth = Math.floor(containerWidth / cardsPerRow) - 20

  const prepared = useMemo(
    () => cards.map(card => ({
      ...card,
      prepared: prepare(card.description, '14px Inter'),
    })),
    [cards]
  )

  const heights = useMemo(
    () => prepared.map(card => 
      layout(card.prepared, cardWidth - 32, 20).height + 200
    ),
    [prepared, cardWidth]
  )

  const rows = useMemo(() => {
    const result: number[] = []
    for (let i = 0; i < cards.length; i += cardsPerRow) {
      const rowHeights = heights.slice(i, i + cardsPerRow)
      result.push(Math.max(...rowHeights))
    }
    return result
  }, [heights, cardsPerRow, cards.length])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cardsPerRow}, 1fr)`, gap: '20px' }}>
      {cards.map((card, i) => {
        const row = Math.floor(i / cardsPerRow)
        return (
          <div
            key={card.id}
            style={{
              height: rows[row],
              border: '1px solid #ccc',
              borderRadius: '12px',
              padding: '1rem',
            }}
          >
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        )
      })}
    </div>
  )
}
```

### 8. Text Editor Line Counter

```typescript
import { useMemo } from 'react'
import { prepare, layout } from '@chenglou/pretext'

function TextEditor({ value, onChange, width }: Props) {
  const prepared = useMemo(
    () => prepare(value, '14px monospace', { whiteSpace: 'pre-wrap' }),
    [value]
  )

  const { lineCount } = useMemo(
    () => layout(prepared, width, 20),
    [prepared, width]
  )

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ padding: '0.5rem', background: '#f5f5f5', minWidth: '3rem' }}>
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} style={{ height: 20, fontSize: '12px', color: '#666' }}>
            {i + 1}
          </div>
        ))}
      </div>
      <textarea
        value={value}
        onChange={onChange}
        style={{
          flex: 1,
          font: '14px monospace',
          lineHeight: '20px',
          padding: '0.5rem',
          border: 'none',
          resize: 'none',
        }}
      />
    </div>
  )
}
```

### 9. Tooltip with Optimal Width

```typescript
import { useMemo } from 'react'
import { prepareWithSegments, walkLineRanges, layoutWithLines } from '@chenglou/pretext'

function Tooltip({ text, targetLines = 3 }: Props) {
  const font = '14px Inter'

  const optimalWidth = useMemo(() => {
    const prepared = prepareWithSegments(text, font)
    
    let min = 100
    let max = 400

    while (max - min > 1) {
      const mid = Math.floor((min + max) / 2)
      let count = 0
      walkLineRanges(prepared, mid, () => count++)

      if (count <= targetLines) {
        max = mid
      } else {
        min = mid
      }
    }

    return max
  }, [text, targetLines])

  const { lines } = useMemo(() => {
    const prepared = prepareWithSegments(text, font)
    return layoutWithLines(prepared, optimalWidth, 20)
  }, [text, optimalWidth])

  return (
    <div
      style={{
        width: optimalWidth,
        padding: '0.75rem 1rem',
        background: '#1e293b',
        color: 'white',
        borderRadius: '8px',
        fontSize: '14px',
        lineHeight: '20px',
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>{line.text}</div>
      ))}
    </div>
  )
}
```

### 10. Performance-Optimized List

```typescript
import { useMemo, memo } from 'react'
import { prepare, layout } from '@chenglou/pretext'

const ListItem = memo(({ text, width, prepared }: Props) => {
  const { height } = useMemo(
    () => layout(prepared, width, 24),
    [prepared, width]
  )

  return <div style={{ height }}>{text}</div>
})

function OptimizedList({ items, width }: Props) {
  const prepared = useMemo(
    () => items.map(item => ({
      id: item.id,
      text: item.text,
      prepared: prepare(item.text, '16px Inter'),
    })),
    [items]
  )

  return (
    <div>
      {prepared.map(item => (
        <ListItem
          key={item.id}
          text={item.text}
          width={width}
          prepared={item.prepared}
        />
      ))}
    </div>
  )
}
```

## 🎨 Advanced Patterns

### Dynamic Layout with State

```typescript
function DynamicTextLayout() {
  const [text, setText] = useState('Initial text')
  const [width, setWidth] = useState(400)
  const [fontSize, setFontSize] = useState(16)

  const font = useMemo(() => `${fontSize}px Inter`, [fontSize])

  const { height, lineCount } = usePretextLayout(text, font, width, fontSize * 1.5)

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <input
        type="range"
        min="300"
        max="800"
        value={width}
        onChange={e => setWidth(parseInt(e.target.value))}
      />
      <div>Height: {height}px, Lines: {lineCount}</div>
    </div>
  )
}
```

### Context-Based Pretext Provider

```typescript
import { createContext, useContext, useMemo, ReactNode } from 'react'
import { prepare, PreparedText } from '@chenglou/pretext'

interface PretextContextValue {
  getPrepared: (text: string, font: string) => PreparedText
}

const PretextContext = createContext<PretextContextValue | null>(null)

export function PretextProvider({ children }: { children: ReactNode }) {
  const cache = useMemo(() => new Map<string, PreparedText>(), [])

  const getPrepared = useMemo(
    () => (text: string, font: string) => {
      const key = `${text}:${font}`
      if (!cache.has(key)) {
        cache.set(key, prepare(text, font))
      }
      return cache.get(key)!
    },
    [cache]
  )

  return (
    <PretextContext.Provider value={{ getPrepared }}>
      {children}
    </PretextContext.Provider>
  )
}

export function usePretext() {
  const context = useContext(PretextContext)
  if (!context) throw new Error('usePretext must be used within PretextProvider')
  return context
}

// Usage
function MyComponent({ text }: Props) {
  const { getPrepared } = usePretext()
  const prepared = useMemo(
    () => getPrepared(text, '16px Inter'),
    [text, getPrepared]
  )
  // ... use prepared
}
```

### Animated Height Transitions

```typescript
import { useState, useEffect } from 'react'
import { usePretextLayout } from './hooks/usePretext'

function AnimatedTextContainer({ text, width }: Props) {
  const { height } = usePretextLayout(text, '16px Inter', width, 24)
  const [animatedHeight, setAnimatedHeight] = useState(height)

  useEffect(() => {
    const animation = requestAnimationFrame(() => {
      setAnimatedHeight(height)
    })
    return () => cancelAnimationFrame(animation)
  }, [height])

  return (
    <div
      style={{
        height: animatedHeight,
        transition: 'height 0.3s ease',
        overflow: 'hidden',
      }}
    >
      {text}
    </div>
  )
}
```

## 🚀 Performance Best Practices

### 1. Memoize Aggressively

```typescript
// ✅ Good
const prepared = useMemo(() => prepare(text, font), [text, font])
const result = useMemo(() => layout(prepared, width, 24), [prepared, width])

// ❌ Bad
const prepared = prepare(text, font)  // Recalculates every render
const result = layout(prepared, width, 24)
```

### 2. Batch Preparations

```typescript
// ✅ Good - prepare all at once
const prepared = useMemo(
  () => items.map(item => prepare(item.text, font)),
  [items, font]
)

// ❌ Bad - prepare in render
return items.map(item => {
  const prepared = prepare(item.text, font)  // Recalculates for each item
  // ...
})
```

### 3. Use React.memo for List Items

```typescript
const ListItem = memo(({ prepared, width }: Props) => {
  const { height } = useMemo(
    () => layout(prepared, width, 24),
    [prepared, width]
  )
  return <div style={{ height }}>...</div>
})
```

### 4. Debounce Expensive Operations

```typescript
import { useMemo, useState, useEffect } from 'react'
import { usePretextLayout } from './hooks/usePretext'

function DebouncedText({ text }: Props) {
  const [debouncedText, setDebouncedText] = useState(text)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedText(text), 300)
    return () => clearTimeout(timer)
  }, [text])

  const { height } = usePretextLayout(debouncedText, '16px Inter', 400, 24)

  return <div style={{ height }}>{text}</div>
}
```

## 🎯 Common Pitfalls

### ❌ Forgetting to Memoize

```typescript
// Bad - recalculates every render
function Component({ text }: Props) {
  const prepared = prepare(text, '16px Inter')  // ❌
  const { height } = layout(prepared, 400, 24)
  return <div style={{ height }}>{text}</div>
}
```

### ❌ Wrong Dependencies

```typescript
// Bad - missing font in dependencies
const prepared = useMemo(
  () => prepare(text, font),
  [text]  // ❌ Missing font!
)
```

### ❌ Not Cleaning Up

```typescript
// Bad - no cleanup
useEffect(() => {
  const interval = setInterval(() => {
    const prepared = prepare(text, font)  // ❌ Memory leak
    // ...
  }, 1000)
  // Missing return cleanup
})
```

## ✅ Best Practices Summary

1. **Always memoize** `prepare()` calls
2. **Use custom hooks** for common patterns
3. **Batch operations** when possible
4. **Memo list items** for performance
5. **Debounce user input** before preparing
6. **Clean up effects** properly
7. **Use TypeScript** for type safety
8. **Test with real data** at scale

---

**Master these patterns for optimal Pretext + React integration!** 🚀
