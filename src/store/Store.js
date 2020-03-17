// import createReactiveStore from './createReactiveStore'
import { createStore } from 'redux'
import reducer from './Reducer'
const initValues = {
  count: 0
}
const store = createStore(reducer, initValues)

export default store
