import React from 'react'
import './App.css'

import Counter, { CounterByObserve, CounterWithRedux } from './Counter'
import StopWatch from './StopWatch'

function App() {
  return (
    <div className="App">
      <main>
        <h2>{'CounterUseState: '}</h2>
        <Counter />
        <h2>{'CounterWithRxJS: '}</h2>
        <CounterByObserve />
        <h2>{'CounterWithRedux: '}</h2>
        <CounterWithRedux />
        <br />
        <h2>{'StopWatchWithRxJS: '}</h2>
        <StopWatch />
      </main>
    </div>
  )
}

export default App
