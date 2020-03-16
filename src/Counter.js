import React from 'react'
import { Subject } from 'rxjs'
import { scan } from 'rxjs/operators'

const CountView = props => {
  const { count, increment, decrement } = props
  return (
    <div>
      <h4>{count}</h4>
      <button name="add" onClick={increment}>
        {'点我+1'}
      </button>
      <button name="minus" onClick={decrement}>
        {'点我-1'}
      </button>
    </div>
  )
}

class RxCounter extends React.Component {
  constructor() {
    super(...arguments)
    this.state = { count: 0 }
    this.counter = new Subject()
    const observer = value => this.setState({ count: value })
    this.counter.pipe(scan((acc, cur) => acc + cur, 0)).subscribe(observer)
  }

  render() {
    return (
      <CountView
        count={this.state.count}
        increment={() => this.counter.next(1)}
        decrement={() => this.counter.next(-1)}
      />
    )
  }
}

export default RxCounter
