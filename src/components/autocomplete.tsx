import { autocomplete } from '@algolia/autocomplete-js'
import { createElement, Fragment, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'

export function Autocomplete(props: any) {
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRootRef = useRef<ReturnType<typeof createRoot> | null>(null)
  const rootRef = useRef<Node | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return undefined
    }

    const search = autocomplete({
      onStateChange({ state }) {
        if (!state.isOpen) search.setIsOpen(true)
      },
      container: containerRef.current,
      renderer: { createElement, Fragment, render: () => {} },
      render({ children }, root) {
        if (!panelRootRef.current || rootRef.current !== root) {
          rootRef.current = root

          panelRootRef.current?.unmount()
          panelRootRef.current = createRoot(root)
        }

        panelRootRef.current.render(children)
      },
      ...props,
    })

    search.setIsOpen(true)

    return () => {
      search.destroy()
    }
  }, [props])

  return (
    <div
      className='absolute left-0 right-0 top-2 m-auto w-1/2'
      ref={containerRef}>
      {/* <div className='absolute right-8 top-2 z-20 m-auto'>
        <Icon icon='vscode-icons:file-type-cargo' width={32} height={32} />
      </div> */}
    </div>
  )
}
