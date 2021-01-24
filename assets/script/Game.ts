import Loading from './Loading'
import Dialog, { TextData } from './Dialog'
import Player, { Direction } from './Player'
import GameEvent from './Event'

const { ccclass, property } = cc._decorator

@ccclass
export default class Game extends cc.Component {
    @property(cc.Node)
    loading: cc.Node = null
    Loading: Loading

    @property(cc.Node)
    player: cc.Node = null
    Player: Player

    @property(cc.Node)
    dialog: cc.Node = null
    Dialog: Dialog

    private now_map: string = ''

    Event: GameEvent

    async onLoad() {
        this.Loading = this.loading.getComponent('Loading')
        this.Dialog = this.dialog.getComponent('Dialog')
        this.Player = this.player.getComponent('Player')
        this.Event = this.getComponent('Event')

        // 开启物理引擎
        const p = cc.director.getPhysicsManager()
        p.enabled = true
        // p.debugDrawFlags = 1
        p.gravity = cc.v2(0, 0)

        // 开启碰撞
        const c = cc.director.getCollisionManager()
        c.enabled = true
        // c.enabledDebugDraw = true
    }

    start() {

        // 测试代码
        this.setMap('map/map', () => {
            this.setPlayer(4, 43, 0)
        }, {
            fadeInTime: 0,
            loadingText: ''
        })

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (e: cc.Event.EventKeyboard) => {
            if (e.keyCode === 49) {
                this.setMap('map/map2', () => {
                    this.setPlayer(3, 6, 1)
                })
            } else if (e.keyCode === 50) {
                this.setMap('map/map', () => {
                    this.setPlayer(4, 43, 1)
                })
            }
        })
        this.setMap('', null, {})
        //
    }

    /**
     * 设置当前地图
     * @param path 地图名
     * @param fn 回调函数
     * @param options 过渡效果设置
     */
    async setMap(path: string, fn?: Function, options: {
        /**
         * 淡入时长
         */
        fadeInTime?: number
        /**
         * 淡出时长
         */
        fadeOutTime?: number
        /**
         * 过场提醒文字
         */
        loadingText?: string
    } = {}) {
        if (path === this.now_map) return

        await this.Loading.show(options.fadeInTime, options.loadingText)

        const mapNode = this.node.getChildByName('map')
        const tiledMap = mapNode.getComponent(cc.TiledMap)
        if (this.now_map) {
            mapNode.removeAllChildren()
        }

        cc.resources.load(path, (err, item: cc.TiledMapAsset) => {
            if (err) {
                console.error(err)
                return
            }
            if (!item) {
                console.warn('资源不存在')
                return
            }

            tiledMap.tmxAsset = item

            const tiledSize = tiledMap.getTileSize()
            const mapSize = tiledMap.getMapSize()
            const layer = tiledMap.getLayer('wall')
            const layerSize = layer.getLayerSize()

            // 给wall层的图块添加刚体碰撞
            for (let i = 0; i < layerSize.width; i++) {
                for (let j = 0; j < layerSize.height; j++) {
                    const tiled = layer.getTiledTileAt(i, j, true)
                    if (tiled.gid !== 0) {
                        tiled.node.group = 'wall'
                        const body = tiled.node.addComponent(cc.RigidBody)
                        body.type = cc.RigidBodyType.Static
                        const collider = tiled.node.addComponent(cc.PhysicsBoxCollider)
                        collider.offset = cc.v2(tiledSize.width / 2, - tiledSize.height * mapSize.height + tiledSize.height / 2)
                        collider.size = tiledSize
                        collider.apply()
                    }
                }
            }

            // 加载当前地图的事件
            const eventNode = cc.find('Canvas/main/event')
            eventNode.removeAllChildren()
            if (this.Event.list[path]) {
                for (const key in this.Event.list[path]) {
                    cc.resources.load(this.Event.list[path][key].sprite, cc.SpriteFrame, (err, sprite: cc.SpriteFrame) => {
                        const node = new cc.Node(key)
                        node.group = 'item'
                        node.setPosition(this.Event.list[path][key].x * 32, -this.Event.list[path][key].y * 32)
                        node.width = node.height = 32
                        node.setAnchorPoint(0, 0)
                        if (this.Event.list[path][key].stop) {
                            const body = node.addComponent(cc.RigidBody)
                            body.type = cc.RigidBodyType.Static
                            const collider = node.addComponent(cc.PhysicsBoxCollider)
                            collider.offset = cc.v2(16, 16)
                            collider.size = tiledSize
                            collider.apply()
                        }
                        const box = node.addComponent(cc.BoxCollider)
                        box.size = cc.size(32, 32)
                        box.offset = cc.v2(16, 16)
                        box['event'] = this.Event.list[path][key].event
                        const Sprite = node.addComponent(cc.Sprite)
                        Sprite.spriteFrame = sprite
                        eventNode.addChild(node)
                    })
                }
            }

            this.now_map = path

            if (fn) fn()

            this.Loading.hide(options.fadeOutTime)
        })
    }

    /**
     * 设置玩家位置
     * @param x
     * @param y
     * @param direction 朝向
     */
    setPlayer(x: number, y: number, direction: Direction) {
        this.player.setPosition(x * 32, -y * 32)
        this.Player.setDirection(direction)
    }

    setTalk(textArr: TextData<string>[]) {
        this.Dialog.init(textArr)
    }
}
