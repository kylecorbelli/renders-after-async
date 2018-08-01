import * as React from 'react'

type ReactComponent<Props>
  = React.ComponentClass<Props>
  | React.StatelessComponent<Props>

interface WrapperState {
  isLoading: boolean
  error: Error | null
}

export const rendersAfterAsync = function<Props> (
  performAsync: (props: Props) => Promise<void>,
  LoadingComponent: ReactComponent<Props> | null = null,
  ErrorComponent: ReactComponent<Props> | null = null
) {
  return function (Component: ReactComponent<Props>): React.ComponentClass<Props> {
    return class Wrapper extends React.Component<Props, WrapperState> {
      public state = {
        error: null,
        isLoading: true,
      }

      public async componentDidMount () {
        try {
          await performAsync(this.props)
          this.setState({ isLoading: false })
        } catch (error) {
          this.setState({ error, isLoading: false })
        }
      }

      public render () {
        const { error, isLoading } = this.state
        if (isLoading) return LoadingComponent ? <LoadingComponent /> : null
        if (error) return ErrorComponent ? <ErrorComponent /> : null
        return <Component {...this.props} />
      }
    }
  }
}

/**
 * TODO:
 * circle config for auto-publish
 * documentation
 */
