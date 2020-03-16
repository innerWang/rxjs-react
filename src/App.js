import React from 'react'
import './App.css'

import { CounterByObserve } from './Counter'
import StopWatch from './StopWatch'

function App() {
  return (
    <div className="App">
      <main>
        <CounterByObserve />
        <br />
        <StopWatch />
      </main>
    </div>
  )
}

export default App
