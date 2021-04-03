#### 1. 使用 Counter 聪明组件(用于修改状态)所需解决的两个问题

- 把 increment 和 decrement 的功能转换为数据流中的数据
- 把数据流中的数据转化为对组件状态的修改

所以使用了中间宿主 `subject`。

由于 state 的状态是所有中间数据的总和，所以使用 `scan` 操作符来收集截止当前的所有数据的总和

Observable 可以发送`next`、`error` 、`complete`共三种类型的通知，observer 是一个对象，可以设置这三种通知对应的回调，根据通知的类型执行对应的回调

#### 2. redux-saga 和 redux-observable 区别

- Redux-Saga 不能很好地处理的另一件事是取消已经调度的异步操作 - 例如 API 调用（Redux Observable 由于其响应特性而做得非常好）。

- Redux-Observable 的基础是 Epics。Epics 与 Redux-Saga 中的 sagas 相似，不同之处在于，不是等待动作调度并将动作委托给 worker，而是暂停执行，直到使用 yield 关键字进行相同类型的另一个动作，epics 分别运行并且听取一系列动作，然后在流上收到特定动作时作出反应。主要组件是 `ActionsObservable`Redux-Observable，它扩展了 `Observable`RxJS。此 observable 表示一系列操作，每次从应用程序发送操作时，都会将其添加到流中。

#### 3. canvas

```js
// 设置指定矩形区域内（以(x, y)为起点，范围是(width, height)）所有像素变成透明，并擦除之前绘制的所有内容的方法。
ctx.clearRect(x, y, width, height);
```

- `ctx.beginPath()`是为了清空子路径列表，开始一个新路径
- `ctx.closePath()`是为了将笔点返回路径的起始点
- `ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise)` 绘制圆弧路径，x,y 为圆心坐标
- `ctx.rect(x,y,width,height)`创建矩形路径，起点为(x,y)，尺寸为`width`和`height`，后续可以使用 `fill()`或者`stroke()`进行填充或描边
- `ctx.fillRect(x, y, width, height)` 使用定义好的`ctx.fillStyle`对起点为`(x,y)`，尺寸为`(width,height)`的矩形进行填充

#### 4. KeyboardEvent

- 有`keydown`、`keypress`、`keyup`事件可用
  按下按键时，发送`keydown`事件，若按下的不是修饰键，发送`keypress`事件，释放按键发送`keyup`事件。需要注意重复处理，当按键被按下并被按住时开始自动重复，会连续重复发送上述三种事件。

- 使用`event.key`读取键值(`event.keyCode`属性已被弃用)

#### 5. rxjs 操作符

- `src$.pipe(withLatestFrom(obs$))`， src$吐出一个数据的时候，才会合并obs$的最新数据，组成为一个数据传递给下游.
- `combineLatest(obs1$, obs2$)`，当某一个上游数据流产生数据时，就会合并所有上游数据流中的最新数据，会有数据重复使用的情况.
  相较于 withLatestFrom, combineLatest 会产生 glitch 的问题，数据重复

- `retryWhen`操作符接收一个函数作为参数，当上游传递一个错误时，这个函数返回的 Observable 对象会决定什么时机重新订阅上游
- `distinctUntilChanged`操作符会过滤上游数据流，当前数据和前一个数据不一致时才会传递给下游
- `merge`静态函数用于合并所有上游数据流，当所有的上游数据流都完结时，下游数据流会完结，但是一旦有一个上游数据流抛出一个错误，则下游会立刻接收到这个错误，则数据流会因为错误而停止。

* 使用了 Subject 的 既是 observable 又是 observer 的特性
  - 作为 observable 可以吐出数据流，可以被订阅
  - 作为 observer，拥有 `next(v)`、`error()`、`complete()`三个方法，调用`next(v)`则可以给`Subject`喂一个新数据，且这个数据会被多播给注册监听了`Subject`的 observer

- 技巧： 利⽤异常处理之后的重试来控制逻辑流程
