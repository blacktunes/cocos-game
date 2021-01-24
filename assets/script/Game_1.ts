import Loading from './Loading'
import Dialog from './Dialog'
import Player, { Direction } from './Player_1'
import GameEvent from './Event'

const { ccclass, property } = cc._decorator

@ccclass
export default class Game extends cc.Component {
    @property(cc.Node)
    loading: cc.Node = null
    @property(cc.Node)
    player: cc.Node = null
    @property(cc.Node)
    dialog: cc.Node = null

    now_map: string = ''

    Loading: Loading
    Dialog: Dialog
    Player: Player
    Event: GameEvent

    async onLoad() {
        this.Loading = this.loading.getComponent('Loading')
        this.Dialog = this.dialog.getComponent('Dialog')
        this.Player = this.player.getComponent('Player_1')
        this.Event = this.getComponent('Event')

        const p = cc.director.getPhysicsManager()
        p.enabled = true
        // p.debugDrawFlags = 1
        p.gravity = cc.v2(0, 0)

        const c = cc.director.getCollisionManager()
        c.enabled = true
        // c.enabledDebugDraw = true
    }

    start() {
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
    }

    async setMap(path: string, fn?: Function, options: { fadeInTime?: number, fadeOutTime?: number, loadingText?: string } = {}) {
        if (path === this.now_map) return

        await this.Loading.show(options.fadeInTime, options.loadingText)

        const mapNode = this.node.getChildByName('map')
        const tiledMap = mapNode.getComponent(cc.TiledMap)
        if (this.now_map) {
            mapNode.removeAllChildren()
        }

        cc.resources.load(path, (err, item: cc.TiledMapAsset) => {
            tiledMap.tmxAsset = item

            const tiledSize = tiledMap.getTileSize()
            const mapSize = tiledMap.getMapSize()
            const layer = tiledMap.getLayer('wall')
            const layerSize = layer.getLayerSize()

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

            const eventNode = cc.find('Canvas/main/event')
            eventNode.removeAllChildren()
            if (this.Event.list[path]) {
                for (const i in this.Event.list[path]) {
                    cc.resources.load(this.Event.list[path][i].sprite, cc.SpriteFrame, (err, sprite: cc.SpriteFrame) => {
                        const node = new cc.Node(this.Event.list[path][i].name)
                        node.group = 'item'
                        node.setPosition(this.Event.list[path][i].x * 32, -this.Event.list[path][i].y * 32)
                        node.width = node.height = 32
                        node.setAnchorPoint(0, 0)
                        if (this.Event.list[path][i].stop) {
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
                        box['event'] = this.Event.list[path][i].event
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

    setPlayer(x: number, y: number, direction: Direction) {
        this.player.setPosition(x * 32, -y * 32)
        this.Player.setDirection(direction)
    }
}
