import { useMemo } from 'react'
import { prepare, layout, prepareWithSegments, layoutWithLines } from '@chenglou/pretext'
import type { PreparedText, PreparedTextWithSegments } from '@chenglou/pretext'

export function usePretextLayout(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number,
  options?: { whiteSpace?: 'normal' | 'pre-wrap' }
) {
  const prepared = useMemo(
    () => prepare(text, font, options),
    [text, font, options?.whiteSpace]
  )

  const result = useMemo(
    () => layout(prepared, maxWidth, lineHeight),
    [prepared, maxWidth, lineHeight]
  )

  return result
}

export function usePretextLines(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number,
  options?: { whiteSpace?: 'normal' | 'pre-wrap' }
) {
  const prepared = useMemo(
    () => prepareWithSegments(text, font, options),
    [text, font, options?.whiteSpace]
  )

  const result = useMemo(
    () => layoutWithLines(prepared, maxWidth, lineHeight),
    [prepared, maxWidth, lineHeight]
  )

  return result
}

export function usePretextPrepared(
  text: string,
  font: string,
  options?: { whiteSpace?: 'normal' | 'pre-wrap' }
): PreparedText {
  return useMemo(
    () => prepare(text, font, options),
    [text, font, options?.whiteSpace]
  )
}

export function usePretextPreparedWithSegments(
  text: string,
  font: string,
  options?: { whiteSpace?: 'normal' | 'pre-wrap' }
): PreparedTextWithSegments {
  return useMemo(
    () => prepareWithSegments(text, font, options),
    [text, font, options?.whiteSpace]
  )
}
