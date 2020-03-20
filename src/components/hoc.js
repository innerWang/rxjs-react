/**
 * 高阶组件
 */

import React from 'react'

export const observe = (WrappedComp, observableFactory, defaultState) => {
  return class extends React.Component {
    constructor() {
      super(...arguments)
      this.state = defaultState
      this.props$ = observableFactory(this.props, this.state)
    }

    render() {
      return <WrappedComp {...this.props} {...this.state} />
    }

    componentDidMount() {
      // 订阅observableFactory产生的observable
      // 此时由于订阅了就会吐出数据，会导致再次render
      this.props$.subscribe(value => this.setState(value))
    }

    componentWillUnmount() {
      // 退订处理
      this.props$.unsubscribe()
    }
  }
}
