import React, { useEffect } from 'react'
import { fromEvent } from 'rxjs'
import { map, switchMap, takeUntil, tap } from 'rxjs/operators'

const CONTAINER_SIZE = 300
const BOX_SIZE = 30

const boxContainerStyle = {
  width: CONTAINER_SIZE,
  height: CONTAINER_SIZE,
  border: '1px solid #333',
  overflow: 'hidden'
}

const boxStyle = {
  width: BOX_SIZE,
  height: BOX_SIZE,
  background: '#3cd',
  cursor: 'pointer'
}

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
  useEffect(() => {
    const boxEle = document.getElementById('box')
    const wrapEle = document.getElementById('boxWrap')
    fromEvent(boxEle, 'mousedown')
      .pipe(
        map(e => ({ pos: getTranslateSize(boxEle), event: e })),
        switchMap(initialState => {
          const {
            pos: initialTrans,
            event: { clientX, clientY }
          } = initialState
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
            tap(val => console.log(val)),
            takeUntil(fromEvent(wrapEle, 'mouseup'))
          )
        })
      )
      .subscribe(pos => setTranslate(boxEle, pos))
  }, [])

  return (
    <div style={boxContainerStyle} id="boxWrap">
      <div style={boxStyle} id="box" />
    </div>
  )
}

export default DragBox
