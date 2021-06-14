/** @jsx JSXSlack.h */
import type {
  FC,
  FunctionComponent,
  VFC,
  VoidFunctionComponent,
} from '../src/index'
import {
  JSXSlack,
  createComponent,
  isValidComponent,
  isValidElementFromComponent,
} from '../src/jsx'

describe('JSX', () => {
  describe('JSXSlack()', () => {
    it('has noop', () => {
      const Component = createComponent('test', () => ({ foo: 'bar' }))
      expect(JSXSlack(<Component />)).toStrictEqual(<Component />)
    })
  })

  describe('createElement()', () => {
    it('creates JSX element', () => {
      const jsx = JSXSlack.createElement('hr')

      expect(JSXSlack.isValidElement(jsx)).toBe(true)
      expect(jsx).toStrictEqual(<hr />)
    })
  })

  describe('Component creation for internal', () => {
    describe('createComponent()', () => {
      it('creates jsx-slack component', () => {
        const Test = createComponent('Test', () => ({ foo: 'bar' }))

        expect(isValidComponent(Test)).toBe(true)
        expect(<Test />).toStrictEqual({ foo: 'bar' })
      })

      it('has a metadata interface in the created component', () => {
        const Test = createComponent('Name', () => ({ foo: 'bar' }), { a: 1 })

        expect(Test.$$jsxslackComponent).toBeTruthy()
        expect(Test.$$jsxslackComponent.name).toBe('Name')
        expect(Test.$$jsxslackComponent.a).toBe(1)
      })
    })

    describe('isValidComponent()', () => {
      it('returns true if the passed function is built-in jsx-slack component', () => {
        const BuiltIn = createComponent('BuiltIn', () => ({}))
        const NotBuiltIn = () => 'test'

        expect(isValidComponent(BuiltIn)).toBe(true)
        expect(isValidComponent(NotBuiltIn)).toBe(false)
        expect(isValidComponent(<BuiltIn />)).toBe(false)
        expect(isValidComponent((<BuiltIn />).$$jsxslack.type)).toBe(true)
      })
    })

    describe('isValidElementFromComponent()', () => {
      const identifier = Symbol('builtInIdentifier')
      const BuiltIn = createComponent('BuiltIn', () => ({}), { identifier })
      const NotBuiltIn: any = () => ({})

      it('returns true if the passed object is jsx-slack element and it was created from component', () => {
        expect(isValidElementFromComponent(BuiltIn)).toBe(false)
        expect(isValidElementFromComponent(NotBuiltIn)).toBe(false)
        expect(isValidElementFromComponent(<BuiltIn />)).toBe(true)
        expect(isValidElementFromComponent(<NotBuiltIn />)).toBe(false)
        expect(
          isValidElementFromComponent(<JSXSlack.Fragment children={'test'} />)
        ).toBe(true)
      })

      it('matches into specific component if second argument has a component', () => {
        expect(isValidElementFromComponent(<BuiltIn />, NotBuiltIn)).toBe(false)
        expect(isValidElementFromComponent(<BuiltIn />, BuiltIn)).toBe(true)
      })

      it('returns false if the component returned null', () => {
        const NullBuiltIn = createComponent('NullBuiltIn', () => null)
        expect(isValidElementFromComponent(<NullBuiltIn />)).toBe(false)
      })
    })
  })

  describe('JSXSlack.Children helpers', () => {
    describe('JSXSlack.Children.map()', () => {
      it('invokes callback function with traversed children', () => {
        expect(JSXSlack.Children.map('hi', (v) => v)).toStrictEqual(['hi'])
        expect(JSXSlack.Children.map([1, 2], (_, i) => i)).toStrictEqual([0, 1])
        expect(JSXSlack.Children.map([['']], (v) => v)).toStrictEqual([''])
        expect(
          JSXSlack.Children.map([['a', 'b'], 'c'], function callbackFn() {
            return this
          })
        ).toStrictEqual(['a', 'b', 'c'])
      })

      it('returns passed value as is without calling callback when passed a nullish value', () => {
        const callbackFn = jest.fn()

        expect(JSXSlack.Children.map(null, callbackFn)).toBeNull()
        expect(JSXSlack.Children.map(undefined, callbackFn)).toBeUndefined()
        expect(callbackFn).toHaveBeenCalledTimes(0)
      })

      it('invokes callback function with null when the traversed child is invalid as element', () => {
        expect.assertions(4)

        JSXSlack.Children.map([null, undefined, true, false], (v) =>
          expect(v).toBeNull()
        )
      })

      it('does not collect mapped value when returned nullish value by callback', () => {
        expect(JSXSlack.Children.map('test', () => null)).toHaveLength(0)
        expect(JSXSlack.Children.map('test', () => undefined)).toHaveLength(0)

        // false, zero, and empty string are not nullish value
        expect(JSXSlack.Children.map('test', () => false)).toHaveLength(1)
        expect(JSXSlack.Children.map('test', () => 0)).toHaveLength(1)
        expect(JSXSlack.Children.map('test', () => '')).toHaveLength(1)
      })

      it('does not traverse children of a fragment', () => {
        expect(
          JSXSlack.Children.map(
            <JSXSlack.Fragment>
              abc
              {123}
            </JSXSlack.Fragment>,
            (v) => v
          )
        ).toStrictEqual([['abc', 123]])

        const ArrayComponent: JSXSlack.FC = () => (
          <JSXSlack.Fragment children={[7, 8, 9]} />
        )

        expect(
          JSXSlack.Children.map(
            [
              <JSXSlack.Fragment children={[1, 2, 3]} />,
              [4, 5, 6],
              <ArrayComponent />,
            ],
            (v) => v
          )
        ).toStrictEqual([[1, 2, 3], 4, 5, 6, [7, 8, 9]])
      })

      it('does not traverse an array returned from jsx-slack component', () => {
        const BuiltinComponent = createComponent('', () => ['built-in', 'cmp'])
        const UserComponent: any = () => ['user', 'cmp']

        expect(
          JSXSlack.Children.map(
            [<BuiltinComponent />, <UserComponent />],
            (v) => v
          )
        ).toStrictEqual([['built-in', 'cmp'], 'user', 'cmp'])
      })
    })

    describe('JSXSlack.Children.forEach()', () => {
      it('calls JSXSlack.Children.map() but returns no value', () => {
        const callbackFn = jest.fn(() => 'test')

        expect(JSXSlack.Children.forEach([1, 2, 3], callbackFn)).toBeUndefined()
        expect(callbackFn).toHaveBeenCalledTimes(3)
        expect(callbackFn).toHaveBeenCalledWith(1, 0)
        expect(callbackFn).toHaveBeenCalledWith(2, 1)
        expect(callbackFn).toHaveBeenCalledWith(3, 2)
      })
    })

    describe('JSXSlack.Children.count()', () => {
      it('returns the count how many elements in passed children', () => {
        expect(JSXSlack.Children.count(1)).toBe(1)
        expect(JSXSlack.Children.count([1, 2, 3])).toBe(3)
        expect(JSXSlack.Children.count([[1, 2], 3])).toBe(3)
        expect(JSXSlack.Children.count(null)).toBe(0)
        expect(JSXSlack.Children.count(undefined)).toBe(0)
        expect(JSXSlack.Children.count([null])).toBe(1)
        expect(JSXSlack.Children.count([false, true, null, undefined])).toBe(4)
        expect(
          JSXSlack.Children.count(<JSXSlack.Fragment children={[1, 2, 3]} />)
        ).toBe(1)
      })
    })

    describe('JSXSlack.Children.only()', () => {
      const BuiltIn = createComponent('BuiltIn', () => ({}))

      it('returns an only child if passed the jsx-slack element', () => {
        const UserComponent: any = () => ({})

        expect(JSXSlack.Children.only(<BuiltIn />)).toStrictEqual(<BuiltIn />)
        expect(JSXSlack.Children.only(<UserComponent />)).toStrictEqual(
          <UserComponent />
        )
        expect(
          JSXSlack.Children.only(<JSXSlack.Fragment children={[1, 2, 3]} />)
        ).toStrictEqual(<JSXSlack.Fragment children={[1, 2, 3]} />)
      })

      it('throws error if passed invalid element', () => {
        expect(() => JSXSlack.Children.only(null)).toThrow()
        expect(() => JSXSlack.Children.only(undefined)).toThrow()
        expect(() => JSXSlack.Children.only('test')).toThrow()
        expect(() => JSXSlack.Children.only(1)).toThrow()
        expect(() => JSXSlack.Children.only([])).toThrow()
        expect(() => JSXSlack.Children.only([<BuiltIn />])).toThrow()
      })

      it('throws error when the returned value is null or primitive type even if passed valid jsx-slack element', () => {
        const NullBuiltIn = createComponent('NullBuiltIn', () => null)
        const Primitive = createComponent('Primitive', () => 'test' as any)

        expect(() => JSXSlack.Children.only(<NullBuiltIn />)).toThrow()
        expect(() => JSXSlack.Children.only(<Primitive />)).toThrow()
      })
    })

    describe('JSXSlack.Children.toArray()', () => {
      it('returns flatten array', () => {
        const ObjComponent = createComponent('', () => ({ foo: 'bar' }))

        // Array returned from component must not make flatten
        const ArrayComponent = createComponent('', () => [1, 2, 3])

        // Functional component by user must return a fragment to pass array
        const UserArrayComponent: JSXSlack.FC = () => (
          <JSXSlack.Fragment children={[4, 5, 6]} />
        )

        // But also can return array directly for React compatibility
        const ReactLikeComponent: any = () => [7, 8, 9]

        expect(
          JSXSlack.Children.toArray(
            <JSXSlack.Fragment>
              a<JSXSlack.Fragment>b{'c'}</JSXSlack.Fragment>
              {false}
              {true && ['d', 'e']}
              {undefined}
              <JSXSlack.Fragment>
                {null}
                <ObjComponent />
                {0}
                <ArrayComponent />
              </JSXSlack.Fragment>
              <UserArrayComponent />
              <ReactLikeComponent />
            </JSXSlack.Fragment>
          )
        ).toHaveLength(14)
      })
    })
  })

  describe('Types', () => {
    describe('JSXSlack.FunctionalComponent / (JSXSlack.)FunctionComponent / (JSXSlack.)FC', () => {
      it('accepts specified props and children', () => {
        const functionalComponent: JSXSlack.FunctionalComponent = () => null
        const functionComponent: JSXSlack.FunctionComponent = () => null
        const fc: JSXSlack.FC<{ test: string }> = ({ test }) => (
          <JSXSlack.Fragment>{test}</JSXSlack.Fragment>
        )
        const publicFunctionComponent: FunctionComponent<{ test: string }> = ({
          test,
        }) => <JSXSlack.Fragment>{test}</JSXSlack.Fragment>
        const publicFC: FC<{}> = () => null // eslint-disable-line @typescript-eslint/ban-types

        expect(functionalComponent({ children: [] })).toBeNull()
        expect(functionComponent({ children: [] })).toBeNull()
        expect(fc({ test: 'abc', children: [] })).toStrictEqual(['abc'])
        expect(
          publicFunctionComponent({ test: 'def', children: [] })
        ).toStrictEqual(['def'])
        expect(publicFC({ children: [] })).toBeNull()
      })
    })

    describe('JSXSlack.VoidFunctionalComponent / (JSXSlack.)VoidFunctionComponent / (JSXSlack.)VFC', () => {
      it('accepts only specified props', () => {
        const voidFunctionalComponent: JSXSlack.VoidFunctionalComponent = () =>
          null
        const voidFunctionComponent: JSXSlack.VoidFunctionComponent = () => null
        const vfc: JSXSlack.VFC<{ test: string }> = ({ test }) => (
          <JSXSlack.Fragment>{test}</JSXSlack.Fragment>
        )
        const publicVoidFunctionComponent: VoidFunctionComponent<{
          test: string
        }> = ({ test }) => <JSXSlack.Fragment>{test}</JSXSlack.Fragment>
        const publicVFC: VFC<Record<string, never>> = () => null

        // @ts-expect-error children prop is not allowed in VoidFunctionalComponent
        expect(voidFunctionalComponent({ children: [] })).toBeNull()
        expect(voidFunctionalComponent({})).toBeNull()

        // @ts-expect-error children prop is not allowed in VoidFunctionalComponent
        expect(voidFunctionComponent({ children: [] })).toBeNull()
        expect(voidFunctionComponent({})).toBeNull()

        // @ts-expect-error children prop is not allowed in VoidFunctionalComponent
        expect(vfc({ test: 'abc', children: [] })).toStrictEqual(['abc'])
        expect(vfc({ test: 'def' })).toStrictEqual(['def'])

        expect(
          // @ts-expect-error children prop is not allowed in VoidFunctionalComponent
          publicVoidFunctionComponent({ test: 'abc', children: [] })
        ).toStrictEqual(['abc'])
        expect(publicVoidFunctionComponent({ test: 'def' })).toStrictEqual([
          'def',
        ])

        // @ts-expect-error children prop is not allowed in VoidFunctionalComponent
        expect(publicVFC({ children: [] })).toBeNull()
        expect(publicVFC({})).toBeNull()
      })
    })
  })
})
