import { Button as ButtonElement, Confirm } from '@slack/types'
import { JSXSlack } from '../../jsx'
import { createComponent } from '../../jsx-internals'
import { ConfirmableProps } from '../composition/Confirm'
import { plainText } from '../composition/utils'
import { assignMetaFrom } from '../utils'
import { ActionProps } from './utils'

export interface ButtonProps extends ActionProps, ConfirmableProps {
  children: JSXSlack.ChildElements

  /**
   * Select the color scheme of the button from `primary` (Green button) and
   * `danger` (Red button). If not defined, the button won't be colored.
   *
   * This style value may be inherited if assigned `confirm` composition object
   * does not define `style`.
   */
  style?: 'danger' | 'primary'

  /**
   * An external URL to load when clicked button.
   *
   * You still have to send an acknowledge response for Slack's event callback
   * even if setting URL to button.
   */
  url?: string

  /**
   * A string value up to 2000 characters, for sending to Slack App along with
   * the interaction payload when clicked button.
   */
  value?: string
}

/**
 * The interactive component for
 * [the `button` block element](https://api.slack.com/reference/block-kit/block-elements#button).
 *
 * You should set the plain-text label for the button in its children.
 *
 * @example
 * ```jsx
 * <Blocks>
 *   <Actions>
 *     <Button actionId="action" value="value" style="primary">
 *       Action button
 *     </Button>
 *     <Button actionId="url" url="https://example.com/">Open URL</Button>
 *   </Actions>
 * </Blocks>
 * ```
 *
 * @return The partial JSON of a block element for button
 */
export const Button = createComponent<ButtonProps, ButtonElement>(
  'Button',
  (props) => {
    let confirm: Confirm | undefined

    if (props.confirm) {
      confirm = props.confirm as Confirm

      if (confirm.style === undefined && props.style !== undefined) {
        confirm = { ...confirm, style: props.style }

        if (JSXSlack.isValidElement(props.confirm))
          assignMetaFrom(props.confirm, confirm)
      }
    }

    return {
      type: 'button',
      action_id: props.actionId || props.name,
      text: plainText(props.children),
      value: props.value,
      url: props.url,
      style: props.style,
      confirm,
    }
  }
)
