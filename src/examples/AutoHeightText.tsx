import { usePretextLayout } from '../hooks/usePretext'

interface AutoHeightTextProps {
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
}: AutoHeightTextProps) {
  const { height, lineCount } = usePretextLayout(text, font, width, lineHeight)

  return (
    <div
      className={className}
      style={{
        width,
        height,
        overflow: 'hidden',
      }}
      title={`${lineCount} lines, ${height}px height`}
    >
      {text}
    </div>
  )
}
