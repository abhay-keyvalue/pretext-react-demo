# Pretext React Demo

A comprehensive React + Vite demonstration of the [Pretext](https://github.com/chenglou/pretext) library, showcasing revolutionary text measurement and layout without DOM reflow.

## 🌐 Live Demo

**[View Live Demo →](https://abhay-keyvalue.github.io/pretext-react-demo/)**

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## 🎯 What is Pretext?

Pretext is a pure JavaScript/TypeScript library that performs multiline text measurement and layout **without touching the DOM**. This eliminates expensive layout reflow operations, making text handling 10-100x faster.

### The Revolution

**Traditional approach:**
```typescript
// Slow - triggers layout reflow
div.textContent = text
const height = div.offsetHeight  // ❌ Expensive!
```

**With Pretext:**
```typescript
// Fast - pure arithmetic
const prepared = prepare(text, '16px Inter')
const { height } = layout(prepared, width, 24)  // ✅ Instant!
```

## 📦 Features

### 6 Interactive Demos

1. **⚡ Performance Comparison** - See 50-100x speedup over DOM
2. **📜 Smart Virtualization** - 10,000 items with zero layout shift
3. **🎨 Canvas Rendering** - Direct canvas text rendering
4. **🌍 Multilingual Layout** - Perfect RTL, emoji, and mixed text
5. **📐 Dynamic Width Layout** - Text flowing around images
6. **📦 Shrink-Wrap Text** - Find optimal container width

### React Integration

This demo shows how to integrate Pretext with React:

- Custom hooks (`usePretext.ts`)
- Component-based architecture
- Proper memoization
- TypeScript types
- Performance optimization

## 🎨 Project Structure

```
src/
├── App.tsx                    # Main app with demo routing
├── App.css                    # Global styles
├── components/
│   ├── Hero.tsx               # Hero section
│   ├── Navigation.tsx         # Tab navigation
│   └── demos/
│       ├── PerformanceDemo.tsx
│       ├── VirtualizationDemo.tsx
│       ├── CanvasRenderingDemo.tsx
│       ├── MultilingualDemo.tsx
│       ├── DynamicLayoutDemo.tsx
│       └── ShrinkWrapDemo.tsx
└── hooks/
    └── usePretext.ts          # Custom React hooks
```

## 🔧 Custom Hooks

### `usePretextLayout`

Calculate text height and line count:

```typescript
import { usePretextLayout } from './hooks/usePretext'

function MyComponent({ text, width }: Props) {
  const { height, lineCount } = usePretextLayout(
    text,
    '16px Inter',
    width,
    24
  )
  
  return <div style={{ height }}>{text}</div>
}
```

### `usePretextLines`

Get line-by-line layout:

```typescript
import { usePretextLines } from './hooks/usePretext'

function CanvasText({ text, width }: Props) {
  const { lines, height } = usePretextLines(
    text,
    '16px Inter',
    width,
    24
  )
  
  // Render to canvas
  useEffect(() => {
    lines.forEach((line, i) => {
      ctx.fillText(line.text, x, y + i * 24)
    })
  }, [lines])
  
  return <canvas ref={canvasRef} />
}
```

### `usePretextPrepared`

Prepare text once, layout multiple times:

```typescript
import { usePretextPrepared } from './hooks/usePretext'
import { layout } from '@chenglou/pretext'

function ResponsiveText({ text }: Props) {
  const prepared = usePretextPrepared(text, '16px Inter')
  
  const smallHeight = useMemo(
    () => layout(prepared, 300, 24).height,
    [prepared]
  )
  
  const largeHeight = useMemo(
    () => layout(prepared, 600, 24).height,
    [prepared]
  )
  
  return <div>Small: {smallHeight}px, Large: {largeHeight}px</div>
}
```

## 💡 React Patterns

### Virtual Scrolling

```typescript
import { useMemo } from 'react'
import { prepare, layout } from '@chenglou/pretext'

function VirtualList({ items, width }: Props) {
  const prepared = useMemo(
    () => items.map(item => prepare(item.text, '16px Inter')),
    [items]
  )
  
  const heights = useMemo(
    () => prepared.map(p => layout(p, width, 24).height),
    [prepared, width]
  )
  
  const offsets = useMemo(
    () => heights.reduce((acc, h) => [...acc, acc[acc.length - 1] + h], [0]),
    [heights]
  )
  
  // Use offsets for perfect virtualization
}
```

### Responsive Text Container

```typescript
import { usePretextLayout } from './hooks/usePretext'

function AutoHeightContainer({ text, width }: Props) {
  const { height } = usePretextLayout(text, '16px Inter', width, 24)
  
  return (
    <div style={{ height, overflow: 'hidden' }}>
      {text}
    </div>
  )
}
```

### Canvas Text Renderer

```typescript
import { useEffect, useRef } from 'react'
import { usePretextLines } from './hooks/usePretext'

function CanvasText({ text, width }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { lines } = usePretextLines(text, '16px Inter', width, 24)
  
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    
    ctx.font = '16px Inter'
    lines.forEach((line, i) => {
      ctx.fillText(line.text, 0, i * 24)
    })
  }, [lines])
  
  return <canvas ref={canvasRef} />
}
```

## 🎓 Key Concepts

### Memoization is Critical

Always memoize `prepare()` calls:

```typescript
// ✅ Good - prepared once
const prepared = useMemo(
  () => prepare(text, font),
  [text, font]
)

// ❌ Bad - prepared every render
const prepared = prepare(text, font)
```

### Separate Preparation from Layout

```typescript
// Prepare once
const prepared = usePretextPrepared(text, '16px Inter')

// Layout multiple times
const height1 = useMemo(() => layout(prepared, 400, 24).height, [prepared])
const height2 = useMemo(() => layout(prepared, 600, 24).height, [prepared])
```

### Use Custom Hooks

The provided hooks handle memoization automatically:

```typescript
// Instead of manual memoization
const { height } = usePretextLayout(text, font, width, lineHeight)

// Automatically memoized and optimized
```

## 🚀 Performance Tips

1. **Memoize prepared text** - Don't recreate on every render
2. **Batch layout calculations** - Calculate all heights at once
3. **Use custom hooks** - They handle optimization for you
4. **Cache at component level** - For lists, prepare all items once
5. **Debounce expensive operations** - On resize, typing, etc.

## 📊 Real-World Examples

### Social Media Feed

```typescript
function SocialFeed({ posts }: Props) {
  const prepared = useMemo(
    () => posts.map(post => prepare(post.text, '16px Inter')),
    [posts]
  )
  
  const getPostHeight = useCallback((index: number, width: number) => {
    return layout(prepared[index], width, 24).height + 120
  }, [prepared])
  
  return <VirtualScroller items={posts} getItemHeight={getPostHeight} />
}
```

### Chat Bubbles

```typescript
function ChatMessage({ message }: Props) {
  const { lines, height } = usePretextLines(
    message.text,
    '15px Inter',
    300,
    22
  )
  
  return (
    <div className="chat-bubble" style={{ height }}>
      {lines.map((line, i) => (
        <div key={i}>{line.text}</div>
      ))}
    </div>
  )
}
```

## 🛠️ Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📚 Learn More

- [Pretext GitHub](https://github.com/chenglou/pretext)
- [API Documentation](https://github.com/chenglou/pretext#api)
- [Official Demos](https://chenglou.me/pretext)

## 🎉 Why This Matters

- **50-100x faster** than traditional DOM measurements
- **Zero layout shift** in virtual scrolling
- **Perfect multilingual** support (RTL, emojis, complex scripts)
- **New layout patterns** previously impossible with CSS
- **Canvas rendering** with proper text wrapping
- **Production-ready** React integration

## 📝 License

MIT

---

**Welcome to the future of text layout in React!** 🚀
