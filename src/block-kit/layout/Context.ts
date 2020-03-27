import { ContextBlock, ImageElement, MrkdwnElement } from '@slack/types'
import { LayoutBlockProps } from './utils'
import { mrkdwn } from '../composition/Mrkdwn'
import { assignMetaFrom } from '../utils'
import { createComponent, JSXSlack } from '../../jsx'

interface ContextProps extends LayoutBlockProps {
  children: JSXSlack.ChildElements
}

const endSymbol = Symbol('EndOfContext')

export const Context = createComponent<ContextProps, ContextBlock>(
  'Context',
  ({ blockId, id, children }) => {
    const elements: (ImageElement | MrkdwnElement)[] = []
    let current: JSXSlack.ChildElement[] = []

    for (const child of [...JSXSlack.Children.toArray(children), endSymbol]) {
      const independentElement: ImageElement | MrkdwnElement | null = (() => {
        if (JSXSlack.isValidElement(child)) {
          // Intrinsic HTML elements
          if (child.$$jsxslack.type === 'span')
            return assignMetaFrom(child, mrkdwn(child))

          if (child.$$jsxslack.type === 'img') {
            const { src, alt } = child.$$jsxslack.props || {}

            return assignMetaFrom(child, {
              type: 'image' as const,
              image_url: src,
              alt_text: alt,
            })
          }

          // Raw objects generated by the built-in component
          if (typeof child === 'object') {
            const { type, text, image_url, alt_text } = child as any

            if (type === 'mrkdwn' && text) return child as any
            if (type === 'image' && image_url && alt_text)
              return assignMetaFrom(child, {
                type: 'image' as const,
                image_url,
                alt_text,
              })
          }
        }
        return null
      })()

      if (current.length > 0 && (independentElement || child === endSymbol)) {
        elements.push(mrkdwn(current))
        current = []
      }

      if (independentElement) {
        elements.push(independentElement)
      } else if (child !== endSymbol) {
        current.push(child)
      }
    }

    if (elements.length > 10)
      throw new Error(
        `<Context> allows up to 10 elements, but the number of generated elements is ${elements.length}.`
      )

    return { type: 'context', block_id: blockId || id, elements }
  }
)