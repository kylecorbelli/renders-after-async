import * as React from 'react'

type ReactComponent<Props = {}>
  = React.ComponentClass<Props>
  | React.StatelessComponent<Props>
  | typeof React.PureComponent

interface WrapperState {
  isLoading: boolean
  error: Error | null
}

export const rendersAfterAsync = function<Props> (
  performAsync: (props: Props) => Promise<void>,
  LoadingComponent: ReactComponent | null = null,
  ErrorComponent: ReactComponent | null = null
) {
  return function (Component: ReactComponent<Props>): React.ComponentClass<Props> {
    return class Wrapper extends React.Component<Props, WrapperState> {
      public state = {
        error: null,
        isLoading: true,
      }

      private hasBeenCancelled: boolean = false

      public async componentDidMount () {
        try {
          await performAsync(this.props)
          if (!this.hasBeenCancelled) this.setState({ isLoading: false })
        } catch (error) {
          if (!this.hasBeenCancelled) {
            this.setState({ error, isLoading: false })
            throw error
          }
        }
      }

      public componentWillUnmount () {
        this.hasBeenCancelled = true
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
