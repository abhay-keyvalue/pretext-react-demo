import { useMemo, useState, useRef, useEffect } from 'react'
import { prepare, layout } from '@chenglou/pretext'

interface VirtualListProps {
  items: Array<{ id: string | number; text: string }>
  width: number
  height: number
  font?: string
  lineHeight?: number
}

export default function VirtualList({
  items,
  width,
  height,
  font = '16px Inter',
  lineHeight = 24,
}: VirtualListProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const prepared = useMemo(
    () => items.map(item => ({
      id: item.id,
      text: item.text,
      prepared: prepare(item.text, font),
    })),
    [items, font]
  )

  const { itemHeights, itemOffsets, totalHeight } = useMemo(() => {
    const heights: number[] = []
    const offsets: number[] = []
    let total = 0

    prepared.forEach((item, i) => {
      const { height: textHeight } = layout(item.prepared, width, lineHeight)
      const itemHeight = textHeight + 20
      heights[i] = itemHeight
      offsets[i] = total
      total += itemHeight
    })

    return { itemHeights: heights, itemOffsets: offsets, totalHeight: total }
  }, [prepared, width, lineHeight])

  const visibleItems = useMemo(() => {
    const scrollBottom = scrollTop + height

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

    const buffer = 3
    startIndex = Math.max(0, startIndex - buffer)
    endIndex = Math.min(items.length, endIndex + buffer)

    return { startIndex, endIndex }
  }, [scrollTop, height, itemOffsets, itemHeights, items.length])

  const handleScroll = () => {
    if (scrollRef.current) {
      setScrollTop(scrollRef.current.scrollTop)
    }
  }

  useEffect(() => {
    const element = scrollRef.current
    if (element) {
      element.addEventListener('scroll', handleScroll, { passive: true })
      return () => element.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      ref={scrollRef}
      style={{
        height,
        overflow: 'auto',
        border: '1px solid #ccc',
        borderRadius: '8px',
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {items.slice(visibleItems.startIndex, visibleItems.endIndex).map((item, i) => {
          const actualIndex = visibleItems.startIndex + i
          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                top: itemOffsets[actualIndex],
                left: 0,
                right: 0,
                height: itemHeights[actualIndex],
                padding: '10px',
                borderBottom: '1px solid #eee',
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
