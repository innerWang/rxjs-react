import React, { useEffect, useState } from 'react'
import { fromEvent, of } from 'rxjs'
import { map, switchMap, takeUntil, tap, delay } from 'rxjs/operators'

import styles from './DragBox.module.scss'

const CONTAINER_SIZE = 300
const BOX_SIZE = 30

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

const DragBox = () => {
  const [hasBlink, setHasBlink] = useState(false)
  useEffect(() => {
    const boxEle = document.getElementById('box')
    const wrapEle = document.getElementById('boxWrap')
    fromEvent(boxEle, 'mousedown')
      .pipe(
        switchMap(e =>
          /*  按住1s内没有动作 才会吐出数据，move动作才可开始 */
          of({ pos: getTranslateSize(boxEle), event: e }).pipe(
            delay(1000),
            takeUntil(fromEvent(wrapEle, 'mousemove'))
          )
        ),
        switchMap(initialState => {
          const {
            pos: initialTrans,
            event: { clientX, clientY }
          } = initialState
          setHasBlink(true)
          return fromEvent(wrapEle, 'mousemove').pipe(
            map(event => ({
              x: Math.max(
                Math.min(
                  event.clientX - clientX + initialTrans.x,
                  CONTAINER_SIZE - BOX_SIZE
                ),
                0
              ),
              y: Math.max(
                Math.min(
                  event.clientY - clientY + initialTrans.y,
                  CONTAINER_SIZE - BOX_SIZE
                ),
                0
              )
            })),
            takeUntil(
              fromEvent(wrapEle, 'mouseup').pipe(tap(() => setHasBlink(false)))
            )
          )
        })
      )
      .subscribe(pos => setTranslate(boxEle, pos))
  }, [])

  return (
    <div id="boxWrap" className={styles.wrap}>
      <div
        id="box"
        className={`${styles.box} ${hasBlink ? styles.blink : ''}`}
      />
    </div>
  )
}

export default DragBox
