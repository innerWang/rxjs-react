#### 1. 使用 Counter 聪明组件(用于修改状态)所需解决的两个问题

- 把 increment 和 decrement 的功能转换为数据流中的数据
- 把数据流中的数据转化为对组件状态的修改

所以使用了中间宿主 `subject`

由于 state 的状态是所有中间数据的总和，所以使用 `scan` 操作符来收集截止当前的所有数据的总和

Observable 可以发送`next`、`error` 、`complete`共三种类型的通知，observer 是一个对象，可以设置这三种通知对应的回调，根据通知的类型执行对应的回调
