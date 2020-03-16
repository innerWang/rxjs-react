import React from 'react'
import { connect } from 'react-redux'
import { Subject, BehaviorSubject } from 'rxjs'
import { scan, map } from 'rxjs/operators'
import { observe } from './hoc'
import * as Actions from './store/Actions'

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

const CounterByObserve = observe(
  CountView,
  () => {
    // 上游未吐出数据之前，下游会收到默认值0
    const cnt$ = new BehaviorSubject(0)
    return cnt$.pipe(
      scan((acc, cur) => acc + cur, 0),
      map(val => ({
        count: val,
        increment: () => cnt$.next(1), // 这么写的话，每一次状态的更新都生成新的函数？？
        decrement: () => cnt$.next(-1)
      }))
    )
  },
  0
)

function mapStateToProps(state, ownProps) {
  return {
    count: state.count
  }
}
function mapDispatchToProps(dispatch, ownProps) {
  return {
    increment: () => dispatch(Actions.increment()),
    decrement: () => dispatch(Actions.decrement())
  }
}
const CounterWithRedux = connect(mapStateToProps, mapDispatchToProps)(CountView)

export { CounterByObserve, CounterWithRedux }
export default RxCounter
