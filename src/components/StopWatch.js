import React from 'react'
import { observe } from './hoc'
import {
  Subject,
  BehaviorSubject,
  interval,
  of,
  throwError,
  merge,
  EMPTY
} from 'rxjs'
import { switchMap, timeInterval, scan, map } from 'rxjs/operators'

const StopWatchView = ({ ms, onStart, onStop, onReset }) => {
  return (
    <div>
      <h4>{ms2time(ms)}</h4>
      <button onClick={onStart}>Start</button>
      <button onClick={onStop}>Stop</button>
      <button onClick={onReset}>Reset</button>
    </div>
  )
}

const StopWatch = observe(
  StopWatchView,
  () => {
    const button = new Subject()
    const time$ = button.pipe(
      switchMap(btn => {
        switch (btn) {
          case 'START': {
            return interval(10).pipe(
              timeInterval(),
              scan((result, cur) => result + cur.interval, 0)
            )
          }
          case 'STOP':
            return EMPTY
          case 'RESET':
            return of(0)
          default:
            return throwError(`Invalid value: ${btn}`)
        }
      })
    )

    const stopWatch = new BehaviorSubject(0)
    // 这里使用merge就保证了下游能一直接收到最新数据，也就实现了时间静止
    return merge(stopWatch, time$).pipe(
      map(value => ({
        ms: value,
        onStop: () => button.next('STOP'),
        onStart: () => button.next('START'),
        onReset: () => button.next('RESET')
      }))
    )
  },
  0
)

export default StopWatch

/**
 * 不足length，则前面填充padding
 */
const padStartWithZero = val => {
  return val.toString().padStart(2, '0')
}

const ms2time = milliseconds => {
  const timeArr = []
  timeArr.unshift(parseInt(milliseconds % 1000, 10))
  timeArr.unshift(parseInt(milliseconds / 1000, 10))
  timeArr.unshift(parseInt(milliseconds / (60 * 1000), 10))
  timeArr.unshift(parseInt(milliseconds / (60 * 60 * 1000), 10))

  return timeArr.map(x => padStartWithZero(x)).join(':')
}
