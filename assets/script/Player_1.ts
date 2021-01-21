const { ccclass, property } = cc._decorator;

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
    isMoving = false

    setDirection(direction: Direction) {
        if (this.direction === direction) return
        this.direction = direction
        this.isMoving = false
        this.setSprite()
    }

    setSprite() {
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

    setAnimation() {
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

    moveStart(direction: Direction) {
        Input[direction] = true
        this.setDirection(direction)
        this.setAnimation()
    }

    moveEnd(direction: Direction) {
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

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (e: cc.Event.EventKeyboard) => {
            if (window['stopAll']) return
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
            this.lv.x = 0
            this.lv.y = 0
            this.node.getComponent(cc.RigidBody).linearVelocity = this.lv
        }
    }

    onCollisionEnter(other, slef) {
        const game = cc.find('Canvas/main').getComponent('Game_1')
        game.setMap(other.data.to, () => {
            game.setPlayer(other.data.x, other.data.y, this.direction)
        })
    }
}
