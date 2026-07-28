import { throttle } from 'es-toolkit'
import { useMemo } from 'react'
import { useLatest } from '@/hooks/use-latest'
import { useUnmount } from '@/hooks/use-unmount'
import type { ThrottleOptions } from 'es-toolkit'

export type { ThrottleOptions }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottleFn<Fn extends (...args: any[]) => any>(
  fn: Fn,
  throttleMs?: number,
  options?: ThrottleOptions,
) {
  const fnRef = useLatest(fn)

  const throttledFn = useMemo(
    () =>
      throttle(
        // eslint-disable-next-line react-hooks/refs
        (...args: Parameters<Fn>) => fnRef.current(...args),
        throttleMs ?? 1000,
        options,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useUnmount(() => throttledFn.cancel())

  return {
    run: throttledFn,
    cancel: throttledFn.cancel,
    flush: throttledFn.flush,
  }
}
