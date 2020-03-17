import { Subject } from 'rxjs'
import { scan, tap, startWith } from 'rxjs/operators'
const createReactiveStore = (reducer, initialState) => {
  const action$ = new Subject()
  let currentState = initialState
  const store$ = action$.pipe(
    startWith(initialState),
    scan(reducer),
    tap(state => {
      currentState = state
    })
  )

  return {
    dispatch: action => {
      return action$.next(action)
    },
    getState: () => currentState,
    subscribe: func => {
      store$.subscribe(func)
    }
  }
}
export default createReactiveStore

/**
 *  使用当前RxJS的实现并不能完成 redux的createStore的替代，不知道为何，内部状态的确在变化，
 *   但是最终检测的 checkForUpdate无法收到更新后的数据
 */
