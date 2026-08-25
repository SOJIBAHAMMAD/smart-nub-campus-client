import { debounce } from 'es-toolkit'
import { useMemo } from 'react'
import { useLatest } from '@/hooks/use-latest'
import { useUnmount } from '@/hooks/use-unmount'
import type { DebounceOptions } from 'es-toolkit'

export type { DebounceOptions }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounceFn<Fn extends (...args: any[]) => any>(
  fn: Fn,
  debounceMs?: number,
  options?: DebounceOptions,
) {
  const fnRef = useLatest(fn)

  const debouncedFn = useMemo(
    () =>
      debounce(
        // eslint-disable-next-line react-hooks/refs
        (...args: Parameters<Fn>) => fnRef.current(...args),
        debounceMs ?? 1000,
        options,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useUnmount(() => debouncedFn.cancel())

  return {
    run: debouncedFn,
    cancel: debouncedFn.cancel,
    flush: debouncedFn.flush,
  }
}
