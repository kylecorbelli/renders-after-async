import * as React from 'react'

export type ReactComponent<Props = {}>
  = React.ComponentClass<Props>
  | React.StatelessComponent<Props>
  | typeof React.PureComponent

export interface State {
  isLoading: boolean
  error: Error | null
}

export type StateWithData<Data> = State & Readonly<{
  data: Data | null
}>
