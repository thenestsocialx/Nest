'use client'

import { useEffect, useRef, useState } from 'react'

// Animates from the previous `target` value to the new one whenever `target` changes.
// On first render the value is set immediately (no animation).
// Pass `forceFrom` to always start the animation from a specific value
// (used in DonationSuccessScreen to count from the pre-donation total).
export function useCountUp(target: number, duration = 1300, forceFrom?: number): number {
  const [value, setValue] = useState(forceFrom ?? target)
  const fromRef = useRef(forceFrom ?? target)
  const rafRef  = useRef<number | null>(null)

  useEffect(() => {
    const from = forceFrom !== undefined ? forceFrom : fromRef.current
    const to   = target

    if (from === to) return

    fromRef.current = to

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)

    const startTime = performance.now()

    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(Math.round(from + (to - from) * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  // forceFrom is intentionally excluded — callers that pass it always pass the same value
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration])

  return value
}
