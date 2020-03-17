import React from 'react'
import './App.css'

import { CounterWithRedux } from './Counter'
// import StopWatch from './StopWatch'

function App() {
  return (
    <div className="App">
      <main>
        {/* <h2>{'RxCounter: '}</h2>
        <Counter />
        <h2>{'CounterWithObserver: '}</h2>
        <CounterByObserve /> */}
        <h2>{'CounterWithRxJSRedux: '}</h2>
        <CounterWithRedux />
        <br />
        {/* <h2>{'StopWatchWithRxJS: '}</h2>
        <StopWatch /> */}
      </main>
    </div>
  )
}

export default App
