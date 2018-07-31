import { configure, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import renderer from 'react-test-renderer'
import { rendersAfterAsync } from '.'

configure({ adapter: new Adapter() })

interface Props extends Readonly<{
  message: string
}> {}

const ContentComponent: React.StatelessComponent<Props> = ({ message }) => <div>Content Component: {message}</div>
const LoadingComponent = (): JSX.Element => <div>Loading Component</div>
const ErrorComponent = (): JSX.Element => <div>Error Component</div>
const performAsyncSuccess = (): Promise<void> => Promise.resolve()
const performAsyncFailure = (): Promise<void> => Promise.reject(new Error('Something went wrong!'))
const performAsyncFailureHangs = (): Promise<void> => new Promise((_resolve) => undefined)

describe('', () => {
  describe('basic rendering', () => {
    const WrappedContentComponent =
      rendersAfterAsync<Props>(performAsyncSuccess)(ContentComponent)
    const renderedComponent: JSX.Element = <WrappedContentComponent message='Passed as Prop!' />

    it('renders without crashing', () => {
      const div = document.createElement('div')
      ReactDOM.render(renderedComponent, div)
      setTimeout(() => {
        ReactDOM.unmountComponentAtNode(div)
      }, 0)
    })

    it('matches snapshot', () => {
      const tree = renderer
        .create(renderedComponent)
        .toJSON()
      expect(tree).toMatchSnapshot()
    })
  })

  describe('render states', () => {
    describe('loading', () => {
      describe('when a custom loading component is provided', () => {
        it('renders the custom loading component while the async actions are still in progress', async (done) => {
          const WrappedContentComponent =
            rendersAfterAsync<Props>(performAsyncFailureHangs, LoadingComponent)(ContentComponent)
          const wrapper = mount(<WrappedContentComponent message='wubba lubba dub dub' />)
          expect(wrapper.text()).toBe('Loading Component')
          done()
        })
      })

      describe('when a custom loading component is NOT provided', () => {
        it('renders null while the async actions are still in progress', async (done) => {
          const WrappedContentComponent =
            rendersAfterAsync<Props>(performAsyncFailureHangs)(ContentComponent)
          const wrapper = mount(<WrappedContentComponent message='wubba lubba dub dub' />)
          expect(wrapper.html()).toBe(null)
          done()
        })
      })
    })

    describe('error', () => {
      describe('when a custom error component is provided', () => {
        it('renders the custom error component if there is an error during the async actions', async (done) => {
          const WrappedContentComponent =
            rendersAfterAsync<Props>(performAsyncFailure, null, ErrorComponent)(ContentComponent)
          const wrapper = mount(<WrappedContentComponent message='ah jeez rick!' />)
          try {
            await performAsyncFailure()
          } catch (_error) {
            expect(wrapper.text()).toBe('Error Component')
          }
          done()
        })
      })

      describe('when a custom error component is NOT provided', () => {
        it('renders null if there is an error during the async actions', async (done) => {
          const WrappedContentComponent =
            rendersAfterAsync<Props>(performAsyncFailure)(ContentComponent)
          const wrapper = mount(<WrappedContentComponent message='ah jeez rick!' />)
          try {
            await performAsyncFailure()
          } catch (_error) {
            expect(wrapper.html()).toBe(null)
          }
          done()
        })
      })
    })

    describe('success', () => {
      it('renders the wrapped component’s content', async (done) => {
        const message = 'Oooh weee!'
        const WrappedContentComponent =
          rendersAfterAsync<Props>(performAsyncSuccess)(ContentComponent)
        const wrapper = mount(<WrappedContentComponent message={message} />)
        await performAsyncSuccess()
        expect(wrapper.text()).toBe(`Content Component: ${message}`)
        done()
      })
    })
  })
})
