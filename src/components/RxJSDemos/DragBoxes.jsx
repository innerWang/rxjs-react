import React, { useEffect } from 'react'
import { from, zip, interval, fromEvent } from 'rxjs'
import {
  startWith,
  map,
  switchMap,
  takeUntil,
  mergeMap,
  tap
} from 'rxjs/operators'
import styles from './DragBoxes.module.scss'

const getTranslateSize = element => {
  const style = getComputedStyle(element)
  const regExp = /matrix\((\d+,\s){4}(\d+),\s(\d+)/i
  const result = style.transform.match(regExp)
  if (result) {
    return {
      x: parseInt(result[2], 10),
      y: parseInt(result[3], 10)
    }
  } else {
    return {
      x: 0,
      y: 0
    }
  }
}

const setTranslate = (ele, range) => {
  ele.style.transform = `translate(${range.x}px, ${range.y}px)`
}

const DragBoxes = () => {
  useEffect(() => {
    const boxes = document.getElementsByClassName('box')
    const headBox = document.querySelector('.box')
    /**  zip 是拉链式组合，将多个数据流中的数据一一对应合并，输出为数组，有一个数据流完结，则zip数据流完结
     *   此处在于将DOM操作进行延时
     *   t=0:        [box1, 0] => box1
     *   t=100ms:    [box2, 0] => box2
     *   t=200ms:    [box3, 1] => box3
     *   ...
     *   t=600ms:    [box7, 5] => box7
     *   completed!
     * */
    const delayBoxes$ = zip(
      from(Array.from(boxes)),
      interval(100).pipe(startWith(0))
    ).pipe(map(([box]) => box))

    const mouseDown$ = fromEvent(headBox, 'mousedown')
    const mouseMove$ = fromEvent(document, 'mousemove')
    const mouseUp$ = fromEvent(document, 'mouseup')

    mouseDown$
      .pipe(
        map(e => {
          const pos = getTranslateSize(headBox)
          return {
            pos,
            event: e
          }
        }),
        switchMap(initialState => {
          const initialPos = initialState.pos
          const { clientX, clientY } = initialState.event
          return mouseMove$.pipe(
            map(moveEvent => ({
              x: moveEvent.clientX - clientX + initialPos.x,
              y: moveEvent.clientY - clientY + initialPos.y
            })),
            takeUntil(mouseUp$)
          )
        }),
        /**
         * mergeMap 合并内部所有的Observable对象的输出
         */
        mergeMap(pos => {
          return delayBoxes$.pipe(tap(box => setTranslate(box, pos)))
        })
      )
      .subscribe()
  }, [])

  return (
    <div className={styles.container}>
      {Array(7)
        .join('-')
        .split('-')
        .map((val, idx) => (
          <div
            className={`${styles.colorbox} box`}
            key={`box${idx + 1}`}
            id={idx === 0 ? 'headbox' : ''}
          />
        ))}
    </div>
  )
}

export default DragBoxes
