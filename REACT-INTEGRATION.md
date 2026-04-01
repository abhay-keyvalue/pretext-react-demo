# React + Pretext Integration Guide

## 🎯 Quick Integration

### Install Pretext

```bash
npm install @chenglou/pretext
```

### Basic Usage in React

```typescript
import { useMemo } from 'react'
import { prepare, layout } from '@chenglou/pretext'

function TextComponent({ text, width }: Props) {
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

## 🪝 Custom Hooks (Recommended)

Create `src/hooks/usePretext.ts`:

```typescript
import { useMemo } from 'react'
import { prepare, layout, prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

export function usePretextLayout(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number
) {
  const prepared = useMemo(() => prepare(text, font), [text, font])
  return useMemo(() => layout(prepared, maxWidth, lineHeight), [prepared, maxWidth, lineHeight])
}

export function usePretextLines(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number
) {
  const prepared = useMemo(() => prepareWithSegments(text, font), [text, font])
  return useMemo(() => layoutWithLines(prepared, maxWidth, lineHeight), [prepared, maxWidth, lineHeight])
}
```

Then use them:

```typescript
import { usePretextLayout } from './hooks/usePretext'

function MyComponent({ text, width }: Props) {
  const { height, lineCount } = usePretextLayout(text, '16px Inter', width, 24)
  return <div style={{ height }}>{text}</div>
}
```

## 📦 Reusable Components

### AutoHeightText Component

```typescript
// components/AutoHeightText.tsx
import { usePretextLayout } from '../hooks/usePretext'

interface Props {
  text: string
  width: number
  font?: string
  lineHeight?: number
  className?: string
}

export default function AutoHeightText({
  text,
  width,
  font = '16px Inter',
  lineHeight = 24,
  className = '',
}: Props) {
  const { height } = usePretextLayout(text, font, width, lineHeight)

  return (
    <div className={className} style={{ width, height, overflow: 'hidden' }}>
      {text}
    </div>
  )
}

// Usage
<AutoHeightText text="Your text" width={400} />
```

### VirtualList Component

```typescript
// components/VirtualList.tsx
import { useMemo, useState, useRef, useEffect } from 'react'
import { prepare, layout } from '@chenglou/pretext'

interface Props<T> {
  items: T[]
  width: number
  height: number
  renderItem: (item: T, index: number) => React.ReactNode
  getItemText: (item: T) => string
  font?: string
  lineHeight?: number
}

export default function VirtualList<T>({
  items,
  width,
  height,
  renderItem,
  getItemText,
  font = '16px Inter',
  lineHeight = 24,
}: Props<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const prepared = useMemo(
    () => items.map(item => prepare(getItemText(item), font)),
    [items, getItemText, font]
  )

  const { heights, offsets, totalHeight } = useMemo(() => {
    const heights: number[] = []
    const offsets: number[] = []
    let total = 0

    prepared.forEach(prep => {
      const { height: h } = layout(prep, width, lineHeight)
      heights.push(h)
      offsets.push(total)
      total += h
    })

    return { heights, offsets, totalHeight: total }
  }, [prepared, width, lineHeight])

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
              key={index}
              style={{
                position: 'absolute',
                top: offsets[index],
                height: heights[index],
                width: '100%',
              }}
            >
              {renderItem(item, index)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Usage
<VirtualList
  items={posts}
  width={600}
  height={800}
  getItemText={post => post.content}
  renderItem={(post, index) => <PostCard post={post} />}
/>
```

### CanvasText Component

```typescript
// components/CanvasText.tsx
import { useEffect, useRef } from 'react'
import { usePretextLines } from '../hooks/usePretext'

interface Props {
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
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { lines, height } = usePretextLines(text, font, width - 40, lineHeight)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
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
  }, [lines, height, width, font, lineHeight, color, backgroundColor])

  return <canvas ref={canvasRef} />
}

// Usage
<CanvasText
  text="Your text here"
  width={600}
  font="18px Inter"
  color="#1e293b"
/>
```

## 🎨 Styling Integration

### With Tailwind CSS

```typescript
import { usePretextLayout } from './hooks/usePretext'

function TailwindText({ text, width }: Props) {
  const { height } = usePretextLayout(text, '16px Inter', width, 24)

  return (
    <div
      className="rounded-lg border-2 border-blue-500 p-4 overflow-hidden"
      style={{ width, height }}
    >
      {text}
    </div>
  )
}
```

### With styled-components

```typescript
import styled from 'styled-components'
import { usePretextLayout } from './hooks/usePretext'

const Container = styled.div<{ $height: number }>`
  height: ${props => props.$height}px;
  padding: 1rem;
  border-radius: 12px;
  overflow: hidden;
`

function StyledText({ text, width }: Props) {
  const { height } = usePretextLayout(text, '16px Inter', width, 24)

  return <Container $height={height}>{text}</Container>
}
```

### With CSS Modules

```typescript
import styles from './Text.module.css'
import { usePretextLayout } from './hooks/usePretext'

function ModularText({ text, width }: Props) {
  const { height } = usePretextLayout(text, '16px Inter', width, 24)

  return (
    <div className={styles.container} style={{ width, height }}>
      {text}
    </div>
  )
}
```

## 🔄 State Management Integration

### With Context API

```typescript
import { createContext, useContext, useMemo } from 'react'
import { prepare, PreparedText } from '@chenglou/pretext'

interface TextCacheContextValue {
  getPrepared: (text: string, font: string) => PreparedText
}

const TextCacheContext = createContext<TextCacheContextValue | null>(null)

export function TextCacheProvider({ children }: Props) {
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
    <TextCacheContext.Provider value={{ getPrepared }}>
      {children}
    </TextCacheContext.Provider>
  )
}

export function useTextCache() {
  const context = useContext(TextCacheContext)
  if (!context) throw new Error('useTextCache must be within TextCacheProvider')
  return context
}
```

### With Redux

```typescript
// store/textSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { prepare, PreparedText } from '@chenglou/pretext'

interface TextState {
  cache: Record<string, PreparedText>
}

const textSlice = createSlice({
  name: 'text',
  initialState: { cache: {} } as TextState,
  reducers: {
    prepareText: (state, action: PayloadAction<{ text: string; font: string }>) => {
      const key = `${action.payload.text}:${action.payload.font}`
      if (!state.cache[key]) {
        state.cache[key] = prepare(action.payload.text, action.payload.font)
      }
    },
  },
})

// Usage in component
function MyComponent({ text }: Props) {
  const dispatch = useDispatch()
  const prepared = useSelector(state => 
    state.text.cache[`${text}:16px Inter`]
  )

  useEffect(() => {
    if (!prepared) {
      dispatch(prepareText({ text, font: '16px Inter' }))
    }
  }, [text, prepared, dispatch])

  // ... use prepared
}
```

## 🎯 Real-World Examples

### Social Media Feed Component

```typescript
import { useMemo } from 'react'
import { prepare, layout } from '@chenglou/pretext'
import VirtualList from './VirtualList'

interface Post {
  id: string
  author: string
  content: string
  timestamp: Date
}

function SocialFeed({ posts, width }: Props) {
  const prepared = useMemo(
    () => posts.map(post => ({
      ...post,
      prepared: prepare(post.content, '16px Inter'),
    })),
    [posts]
  )

  const getItemHeight = useMemo(
    () => (index: number) => {
      const { height } = layout(prepared[index].prepared, width - 32, 24)
      return height + 120  // Add space for avatar, actions, etc.
    },
    [prepared, width]
  )

  return (
    <VirtualList
      items={posts}
      width={width}
      height={800}
      getItemText={post => post.content}
      renderItem={(post, index) => (
        <div className="post">
          <div className="post-header">
            <img src={post.author.avatar} />
            <span>{post.author.name}</span>
          </div>
          <p>{post.content}</p>
          <div className="post-actions">...</div>
        </div>
      )}
    />
  )
}
```

### Chat Application

```typescript
import { useMemo } from 'react'
import { prepareWithSegments, walkLineRanges, layoutWithLines } from '@chenglou/pretext'

interface Message {
  id: string
  text: string
  sender: 'user' | 'other'
}

function ChatMessage({ message, maxWidth = 400 }: Props) {
  const font = '15px Inter'

  const bubbleWidth = useMemo(() => {
    const prepared = prepareWithSegments(message.text, font)
    let widest = 0
    
    walkLineRanges(prepared, maxWidth, line => {
      if (line.width > widest) widest = line.width
    })
    
    return Math.min(Math.ceil(widest) + 32, maxWidth)
  }, [message.text, maxWidth])

  const { lines } = useMemo(() => {
    const prepared = prepareWithSegments(message.text, font)
    return layoutWithLines(prepared, bubbleWidth - 32, 22)
  }, [message.text, bubbleWidth])

  return (
    <div
      className={`chat-bubble ${message.sender}`}
      style={{
        maxWidth: bubbleWidth,
        marginLeft: message.sender === 'user' ? 'auto' : 0,
        marginRight: message.sender === 'user' ? 0 : 'auto',
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>{line.text}</div>
      ))}
    </div>
  )
}

function ChatApp({ messages }: Props) {
  return (
    <div className="chat-container">
      {messages.map(message => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  )
}
```

## 🚀 Performance Optimization

### 1. Memoization Strategy

```typescript
// ✅ Optimal - separate memoization
const prepared = useMemo(() => prepare(text, font), [text, font])
const result = useMemo(() => layout(prepared, width, 24), [prepared, width])

// ❌ Suboptimal - combined memoization
const result = useMemo(() => {
  const prepared = prepare(text, font)
  return layout(prepared, width, 24)
}, [text, font, width])  // Reprepares on width change!
```

### 2. Batch Operations

```typescript
// ✅ Good - batch prepare
const prepared = useMemo(
  () => items.map(item => prepare(item.text, font)),
  [items, font]
)

// ❌ Bad - prepare individually
const heights = items.map(item => {
  const prepared = prepare(item.text, font)  // Inefficient!
  return layout(prepared, width, 24).height
})
```

### 3. Use React.memo

```typescript
import { memo } from 'react'

const ListItem = memo(({ text, prepared, width }: Props) => {
  const { height } = useMemo(
    () => layout(prepared, width, 24),
    [prepared, width]
  )
  
  return <div style={{ height }}>{text}</div>
})

// Only re-renders when props actually change
```

### 4. Debounce User Input

```typescript
import { useState, useEffect } from 'react'
import { usePretextLayout } from './hooks/usePretext'

function DebouncedTextInput() {
  const [text, setText] = useState('')
  const [debouncedText, setDebouncedText] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedText(text), 300)
    return () => clearTimeout(timer)
  }, [text])

  const { height } = usePretextLayout(debouncedText, '16px Inter', 400, 24)

  return (
    <>
      <textarea value={text} onChange={e => setText(e.target.value)} />
      <div>Height: {height}px</div>
    </>
  )
}
```

## 🎯 Common Patterns

### Responsive Text

```typescript
function ResponsiveText({ text }: Props) {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const { height } = usePretextLayout(text, '16px Inter', width - 40, 24)

  return <div style={{ height, padding: '20px' }}>{text}</div>
}
```

### Conditional Rendering Based on Height

```typescript
function CollapsibleText({ text, maxHeight = 200 }: Props) {
  const [expanded, setExpanded] = useState(false)
  const { height } = usePretextLayout(text, '16px Inter', 400, 24)

  const needsExpansion = height > maxHeight

  return (
    <div>
      <div style={{ height: expanded ? height : maxHeight, overflow: 'hidden' }}>
        {text}
      </div>
      {needsExpansion && (
        <button onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  )
}
```

### Truncate to Line Count

```typescript
function TruncatedText({ text, maxLines = 3 }: Props) {
  const { lines } = usePretextLines(text, '16px Inter', 400, 24)

  const truncated = lines.slice(0, maxLines)
  const isTruncated = lines.length > maxLines

  return (
    <div>
      {truncated.map((line, i) => (
        <div key={i}>{line.text}</div>
      ))}
      {isTruncated && <span>...</span>}
    </div>
  )
}
```

## 🔧 TypeScript Types

```typescript
import type { PreparedText, PreparedTextWithSegments, LayoutLine } from '@chenglou/pretext'

interface TextLayoutResult {
  height: number
  lineCount: number
}

interface TextLinesResult extends TextLayoutResult {
  lines: LayoutLine[]
}

// Use in your components
function MyComponent(): TextLayoutResult {
  const prepared: PreparedText = prepare(text, font)
  return layout(prepared, width, lineHeight)
}
```

## 📚 Testing

```typescript
import { render } from '@testing-library/react'
import { prepare, layout } from '@chenglou/pretext'

describe('TextComponent', () => {
  it('calculates correct height', () => {
    const text = 'Test text'
    const prepared = prepare(text, '16px Inter')
    const { height } = layout(prepared, 400, 24)

    const { container } = render(<TextComponent text={text} width={400} />)
    const element = container.firstChild as HTMLElement

    expect(element.style.height).toBe(`${height}px`)
  })
})
```

## 🎉 Summary

### Key Takeaways

1. **Always use useMemo** for prepare() and layout()
2. **Create custom hooks** for common patterns
3. **Batch operations** when possible
4. **Use React.memo** for list items
5. **Debounce expensive operations**
6. **Separate preparation from layout**

### Benefits in React

- ✅ 50-100x faster than DOM measurements
- ✅ Perfect for virtual scrolling
- ✅ Smooth animations without jank
- ✅ Works with any styling solution
- ✅ Framework-agnostic patterns
- ✅ TypeScript support

---

**Start building high-performance React apps with Pretext!** 🚀
