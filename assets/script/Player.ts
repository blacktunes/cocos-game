const { ccclass, property } = cc._decorator

export enum Direction {
    'UP',
    'DOWN',
    'LEFT',
    'RIGHT'
}

const Input = {}

@ccclass
export default class Player extends cc.Component {

    @property(cc.SpriteFrame)
    sprite_up: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    sprite_down: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    sprite_left: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    sprite_right: cc.SpriteFrame = null
    @property
    speed: number = 200

    sprite: cc.Sprite
    animation: cc.Animation
    lv: cc.Vec2 = cc.v2(0, 0)

    @property
    direction: Direction = Direction.DOWN
    private isMoving = false

    setDirection(direction: Direction) {
        if (this.direction === direction) return
        this.direction = direction
        this.isMoving = false
        this.setSprite()
    }

    private setSprite() {
        if (this.direction === Direction.UP) {
            this.sprite.spriteFrame = this.sprite_up
        } else if (this.direction === Direction.DOWN) {
            this.sprite.spriteFrame = this.sprite_down
        } else if (this.direction === Direction.LEFT) {
            this.sprite.spriteFrame = this.sprite_left
        } else if (this.direction === Direction.RIGHT) {
            this.sprite.spriteFrame = this.sprite_right
        }
    }

    private setAnimation() {
        if (!this.isMoving) {
            this.isMoving = true
            if (this.direction === Direction.UP) {
                this.animation.play('move_up')
            } else if (this.direction === Direction.DOWN) {
                this.animation.play('move_down')
            } else if (this.direction === Direction.LEFT) {
                this.animation.play('move_left')
            } else if (this.direction === Direction.RIGHT) {
                this.animation.play('move_right')
            }
        }
    }

    private moveStart(direction: Direction) {
        Input[direction] = true
        this.setDirection(direction)
        this.setAnimation()
    }

    private moveEnd(direction: Direction) {
        Input[direction] = false
        if (Input[Direction.UP]) {
            this.moveStart(Direction.UP)
        } else if (Input[Direction.LEFT]) {
            this.moveStart(Direction.LEFT)
        } else if (Input[Direction.DOWN]) {
            this.moveStart(Direction.DOWN)
        } else if (Input[Direction.RIGHT]) {
            this.moveStart(Direction.RIGHT)
        } else {
            this.animation.stop()
            this.isMoving = false
            this.setSprite()
        }
    }

    onLoad() {
        this.sprite = this.node.getComponent(cc.Sprite)
        this.animation = this.node.getComponent(cc.Animation)
        this.node.zIndex = 2
        cc.systemEvent.on('keydown', this.eventLister, this)

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (e: cc.Event.EventKeyboard) => {
            if (window['stopAll'] || (window['dialog'] && window['dialog'].active)) return
            switch (e.keyCode) {
                case cc.macro.KEY.up:
                    this.moveStart(Direction.UP)
                    break
                case cc.macro.KEY.down:
                    this.moveStart(Direction.DOWN)
                    break
                case cc.macro.KEY.left:
                    this.moveStart(Direction.LEFT)
                    break
                case cc.macro.KEY.right:
                    this.moveStart(Direction.RIGHT)
                    break
                default:
                    break
            }
        })
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, (e: cc.Event.EventKeyboard) => {
            switch (e.keyCode) {
                case cc.macro.KEY.up:
                    this.moveEnd(Direction.UP)
                    break
                case cc.macro.KEY.down:
                    this.moveEnd(Direction.DOWN)
                    break
                case cc.macro.KEY.left:
                    this.moveEnd(Direction.LEFT)
                    break
                case cc.macro.KEY.right:
                    this.moveEnd(Direction.RIGHT)
                    break
                default:
                    break
            }
        })
    }

    onDestroy() {
        cc.systemEvent.off('keydown', this.eventLister)
    }

    update(dt) {
        if (this.isMoving) {
            if (this.direction === Direction.UP) {
                this.lv.x = 0
                this.lv.y = this.speed
            } else if (this.direction === Direction.DOWN) {
                this.lv.x = 0
                this.lv.y = -this.speed
            } else if (this.direction === Direction.LEFT) {
                this.lv.y = 0
                this.lv.x = -this.speed
            } else if (this.direction === Direction.RIGHT) {
                this.lv.y = 0
                this.lv.x = this.speed
            }
            this.node.getComponent(cc.RigidBody).linearVelocity = this.lv
        } else {
            const x = this.node.position.x / 32
            const y = -this.node.position.y / 32
            if (Math.abs(Math.round(x) - x) < 0.05) {
                this.lv.x = 0
            } else if (Math.round(x) - x >= 0) {
                this.lv.x = this.speed / 2
            } else if (Math.round(x) - x < 0) {
                this.lv.x = -this.speed / 2
            }
            if (Math.abs(Math.round(y) - y) < 0.05) {
                this.lv.y = 0
            } else if (Math.round(y) - y >= 0) {
                this.lv.y = -this.speed / 2
            } else if (Math.round(y) - y < 0) {
                this.lv.y = this.speed / 2
            }
            this.node.getComponent(cc.RigidBody).linearVelocity = this.lv
        }
    }

    getPosition() {
        const position = this.node.getPosition()
        return {
            x: Math.round(position.x / 32),
            y: Math.round(-position.y / 32),
            d: this.direction
        }
    }

    event_now = null

    private eventLister(e: cc.Event.EventKeyboard) {
        if (!this.event_now || window['stopAll'] || (window['dialog'] && window['dialog'].active)) return
        if (e.keyCode === cc.macro.KEY.z || e.keyCode === cc.macro.KEY.space) {
            this.event_now(this)
        }
    }

    onCollisionEnter(other: cc.BoxCollider & { event: { auto: boolean, fn: () => void } }) {
        if (!other.event) return
        if (other.event.auto) {
            this.event_now = null
            other.event.fn()
        } else {
            this.event_now = other.event.fn
        }
    }

    onCollisionExit() {
        this.event_now = null
    }
}
