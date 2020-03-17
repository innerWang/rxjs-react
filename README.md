#### 1. 使用 Counter 聪明组件(用于修改状态)所需解决的两个问题

- 把 increment 和 decrement 的功能转换为数据流中的数据
- 把数据流中的数据转化为对组件状态的修改

所以使用了中间宿主 `subject`

由于 state 的状态是所有中间数据的总和，所以使用 `scan` 操作符来收集截止当前的所有数据的总和

Observable 可以发送`next`、`error` 、`complete`共三种类型的通知，observer 是一个对象，可以设置这三种通知对应的回调，根据通知的类型执行对应的回调

#### 2. redux-saga 和 redux-observable 区别

- Redux-Saga 不能很好地处理的另一件事是取消已经调度的异步操作 - 例如 API 调用（Redux Observable 由于其响应特性而做得非常好）。

- Redux-Observable 的基础是 Epics。Epics 与 Redux-Saga 中的 sagas 相似，不同之处在于，不是等待动作调度并将动作委托给 worker，而是暂停执行，直到使用 yield 关键字进行相同类型的另一个动作，epics 分别运行并且听取一系列动作，然后在流上收到特定动作时作出反应。主要组件是 `ActionsObservable`Redux-Observable，它扩展了 `Observable`RxJS。此 observable 表示一系列操作，每次从应用程序发送操作时，都会将其添加到流中。
