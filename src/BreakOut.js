import React from 'react'
import {
  interval,
  animationFrameScheduler,
  fromEvent,
  Observable,
  Subject,
  merge
} from 'rxjs'
import {
  map,
  scan,
  mapTo,
  distinctUntilChanged,
  withLatestFrom,
  retryWhen,
  delay
} from 'rxjs/operators'

const PADDLE_WIDTH = 100
const PADDLE_HEIGHT = 20
const BALL_RADIUS = 10
const BRICK_ROWS = 5
const BRICK_COLUMNS = 7
const BRICK_HEIGHT = 20
const BRICK_GAP = 3
const TICKER_INTERVAL = Math.ceil(1000 / 60)
const PADDLE_CONTROLS = {
  ArrowLeft: -1,
  ArrowRight: 1
}
const PADDLE_SPEED = 240
const BALL_SPEED = 60

class BreakOut extends React.Component {
  // interval 的 默认 scheduler 是 asyncScheduler，不适合协调动画
  ticker$ = interval(TICKER_INTERVAL, animationFrameScheduler).pipe(
    map(() => ({ time: Date.now(), deltaTime: null })),
    scan((prev, cur) => ({
      time: cur.time,
      deltaTime: (cur.time - prev.time) / 1000
    }))
  )

  key$ = merge(
    fromEvent(document, 'keydown').pipe(map(e => PADDLE_CONTROLS[e.key] || 0)),
    fromEvent(document, 'keyup').pipe(mapTo(0))
  ).pipe(distinctUntilChanged())

  restart = React.createRef()

  // 用于产生球拍位置的数据流，之所以不直接生成一个，是每次游戏开始时都有一个新的数据流
  createPaddle$ = ticker$ => {
    return ticker$.pipe(
      withLatestFrom(this.key$),
      scan((position, [ticker, direction]) => {
        const nextPos = position + ticker.deltaTime * PADDLE_SPEED * direction
        return Math.max(
          Math.min(nextPos, this.canvasEle.width - PADDLE_WIDTH / 2),
          PADDLE_WIDTH / 2
        )
      }, this.canvasEle.width / 2),
      distinctUntilChanged()
    )
  }

  drawIntro = () => {
    const context2D = this.context2D
    const canvasEle = this.canvasEle
    context2D.clearRect(0, 0, canvasEle.width, canvasEle.height)
    context2D.textAlign = 'center'
    context2D.font = '20px Courier New'
    context2D.fillText(
      'Press [<] and [>] to move Paddle',
      canvasEle.width / 2,
      canvasEle.height / 2
    )
    context2D.fillText(
      'Press Any Key To start!',
      canvasEle.width / 2,
      (canvasEle.height * 2) / 3
    )
    // context2D.rect(0, 0, canvasEle.width, canvasEle.height)
    // context2D.stroke()
  }

  drawGameOver = (text = '') => {
    const context2D = this.context2D
    const canvasEle = this.canvasEle
    context2D.clearRect(
      canvasEle.width / 4,
      canvasEle.height / 3,
      canvasEle.width / 2,
      canvasEle.height / 3
    )
    context2D.textAlign = 'center'
    context2D.font = '24px Courier New'
    context2D.fillText(text, canvasEle.width / 2, canvasEle.height / 2)
  }

  drawPaddle = position => {
    const context = this.context2D
    context.beginPath()
    context.rect(
      position - PADDLE_WIDTH / 2,
      context.canvas.height - PADDLE_HEIGHT,
      PADDLE_WIDTH,
      PADDLE_HEIGHT
    )
    context.fill()
    context.closePath()
  }

  drawBall = ball => {
    const context = this.context2D
    context.beginPath()
    context.arc(ball.position.x, ball.position.y, BALL_RADIUS, 0, Math.PI * 2)
    context.fill()
    context.closePath()
  }

  drawBrick = brick => {
    const context = this.context2D
    context.beginPath()
    context.rect(
      brick.x - brick.width / 2,
      brick.y - brick.height / 2,
      brick.width,
      brick.height
    )
    context.fill()
    context.closePath()
  }

  drawBricks = bricks => {
    bricks.forEach(brick => this.drawBrick(brick))
  }

  drawScore = (score = 0) => {
    const context2D = this.context2D
    context2D.textAlign = 'left'
    context2D.font = '16px Courier New'
    context2D.fillText(score, BRICK_GAP, 16)
  }

  isHit = (paddle, ball) => {
    return (
      ball.position.x > paddle - PADDLE_WIDTH / 2 &&
      ball.position.x < paddle + PADDLE_WIDTH / 2 &&
      ball.position.y > this.canvasEle.height - PADDLE_HEIGHT - BALL_RADIUS / 2
    )
  }
  isCollision = (brick, ball) => {
    return (
      ball.position.x + ball.direction.x > brick.x - brick.width / 2 &&
      ball.position.x + ball.direction.x < brick.x + brick.width / 2 &&
      ball.position.y + ball.direction.y > brick.y - brick.height / 2 &&
      ball.position.y + ball.direction.y < brick.y + brick.height / 2
    )
  }

  createBricks = () => {
    let width =
      (this.canvasEle.width - BRICK_GAP - BRICK_GAP * BRICK_COLUMNS) /
      BRICK_COLUMNS
    let bricks = []
    for (let i = 0; i < BRICK_ROWS; i++) {
      for (let j = 0; j < BRICK_COLUMNS; j++) {
        bricks.push({
          x: j * (width + BRICK_GAP) + width / 2 + BRICK_GAP,
          y: i * (BRICK_HEIGHT + BRICK_GAP) + BRICK_HEIGHT / 2 + BRICK_GAP + 20,
          width: width,
          height: BRICK_HEIGHT
        })
      }
    }
    return bricks
  }

  initState = () => ({
    ball: {
      position: {
        x: this.canvasEle.width / 2,
        y: this.canvasEle.height / 2
      },
      direction: {
        x: 2,
        y: 2
      }
    },
    bricks: this.createBricks(),
    score: 0
  })

  createState$ = (ticker$, paddle$) => {
    return ticker$.pipe(
      withLatestFrom(paddle$),
      scan(({ ball, bricks, score }, [ticker, paddle]) => {
        let remainingBricks = []
        const collisions = {
          paddle: false,
          floor: false,
          wall: false,
          ceiling: false,
          brick: false
        }
        ball.position.x =
          ball.position.x + ball.direction.x * ticker.deltaTime * BALL_SPEED
        ball.position.y =
          ball.position.y + ball.direction.y * ticker.deltaTime * BALL_SPEED
        // 砖块是否被弹球击中
        bricks.forEach(brick => {
          if (!this.isCollision(brick, ball)) {
            remainingBricks.push(brick)
          } else {
            collisions.brick = true
            score = score + 10
          }
        })
        // 球拍是否和弹球接触
        collisions.paddle = this.isHit(paddle, ball)
        // 是否和墙体接触
        if (
          ball.position.x < BALL_RADIUS ||
          ball.position.x > this.canvasEle.width - BALL_RADIUS
        ) {
          ball.direction.x = -ball.direction.x
          collisions.wall = true
        }
        collisions.ceiling = ball.position.y < BALL_RADIUS
        // 弹球和任一物体接触后其y轴的方向会相反
        if (collisions.brick || collisions.paddle || collisions.ceiling) {
          ball.direction.y = -ball.direction.y
        }
        return {
          ball: ball,
          bricks: remainingBricks,
          collisions: collisions,
          score: score
        }
      }, this.initState())
    )
  }

  updateView = ([ticker, paddle, state]) => {
    this.context2D.clearRect(0, 0, this.canvasEle.width, this.canvasEle.height)
    this.drawPaddle(paddle)
    this.drawBall(state.ball)
    this.drawBricks(state.bricks)
    this.drawScore(state.score)
    if (state.ball.position.y > this.canvasEle.height - BALL_RADIUS) {
      this.drawGameOver('GAME OVER')
      this.restart.current.error('game over')
    }
    if (state.bricks.length === 0) {
      this.drawGameOver('Congradulations!')
      this.restart.current.error('cong')
    }
  }

  render() {
    return (
      <div>
        <canvas width="480" height="320" id="stage" />
      </div>
    )
  }

  componentDidMount() {
    this.canvasEle = document.getElementById('stage')
    this.context2D = this.canvasEle.getContext('2d')
    this.context2D.fillStyle = 'green'

    new Observable(observer => {
      this.drawIntro()
      this.restart.current = new Subject()
      const paddle$ = this.createPaddle$(this.ticker$)
      const state$ = this.createState$(this.ticker$, paddle$)
      merge(
        this.ticker$.pipe(withLatestFrom(paddle$, state$)),
        this.restart.current
      ).subscribe(observer)
    })
      .pipe(retryWhen(err$ => err$.pipe(delay(3000))))
      .subscribe(this.updateView)
  }
}

export default BreakOut
