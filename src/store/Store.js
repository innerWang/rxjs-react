// import createReactiveStore from './createReactiveStore'
import { createStore, applyMiddleware } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import reducer from './Reducer'
import epic from './Epic'

const epicMiddleware = createEpicMiddleware()

const middleWares = [epicMiddleware]

const initValues = {
  count: 0
}
const store = createStore(reducer, initValues, applyMiddleware(...middleWares))
epicMiddleware.run(epic)

export default store

/**
 * createStore函数其实还⽀持第三个参数， 第三个参数是Store Enhancer
 * 通过redux提供的applyMiddleware函数就可以根据中间件产⽣Store Enhancer。
 */
