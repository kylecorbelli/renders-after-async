import * as React from 'react'
import { StateWithData } from './types'

interface Props<Data> extends Readonly<{
  children: (props: StateWithData<Data>) => JSX.Element | null
  performAsync: () => Promise<Data>
}> {}

export class RendersAfterAsync<Data> extends React.Component<Props<Data>, StateWithData<Data>> {
  public state = {
    data: null,
    error: null,
    isLoading: true,
  }

  private hasBeenCancelled: boolean = false

  public async componentDidMount () {
    try {
      const data: Data = await this.props.performAsync()
      if (!this.hasBeenCancelled) this.setState({ data, isLoading: false })
    } catch (error) {
      if (!this.hasBeenCancelled) this.setState({ error, isLoading: false })
    }
  }

  public componentWillMount () {
    this.hasBeenCancelled = true
  }

  public render () {
    return this.props.children(this.state)
  }
}
