import Loading from './Loading'
import Dialog from './Dialog'
import Player, { Direction } from './Player_1'

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

    async onLoad() {
        this.Loading = this.loading.getComponent('Loading')
        this.Dialog = this.dialog.getComponent('Dialog')
        this.Player = this.player.getComponent('Player_1')

        const p = cc.director.getPhysicsManager()
        p.enabled = true
        p.debugDrawFlags = 1
        p.gravity = cc.v2(0, 0)

        const c = cc.director.getCollisionManager()
        c.enabled = true
        c.enabledDebugDraw = true
    }

    start() {
        this.setMap('map/map', () => {
            this.setPlayer(300, 300, 0)
        }, {
            fadeInTime: 0,
            loadingText: ''
        })

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (e: cc.Event.EventKeyboard) => {
            if (e.keyCode === 49) {
                this.setMap('map/map2', () => {
                    this.setPlayer(145, 145, 1)
                })
            } else if (e.keyCode === 50) {
                this.setMap('map/map', () => {
                    this.setPlayer(300, 300, 1)
                })
            } else if (e.keyCode === 51) {
                this.Dialog.init([
                    {
                        id: 1,
                        text: '<color=red>这是测试这是测试这是测试这是测试这是测试</color>23424234234 '
                    },
                    {
                        id: 2,
                        text: '这也是测试这也<color=yellow>是测试这也是测试这</color>也是测试这也是测试这也是测试这也是测试这也是测试这也是测试这也是测试'
                    },
                    {
                        id: 2,
                        text: '123123123123123144124124124124121414'
                    },
                    {
                        id: 1,
                        text: 'asdajkdasjdnajslndajsdjasnkjfaskdansjd'
                    },
                    {
                        id: 2,
                        text: '4123n5j23n5j23n5325n2ij3n5j235test这是测试这是测试这是测试这是测试这是测试'
                    }
                ])
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

            const nodeList = mapNode.children
            for (const node of nodeList) {
                const widget = node.addComponent(cc.Widget)
                widget.isAlignLeft = true
                widget.left = 0
                widget.isAbsoluteBottom = true
                widget.bottom = 0
            }

            const tiledSize = tiledMap.getTileSize()
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
                        collider.offset = cc.v2(tiledSize.width / 2, tiledSize.height / 2)
                        collider.size = tiledSize
                        collider.apply()
                    }
                }
            }

            if (path === 'map/map') {
                const testNode = new cc.Node('test')
                testNode.group = 'item'
                testNode.setPosition(550, 650)
                testNode.width = testNode.height = 16
                const box = testNode.addComponent(cc.BoxCollider)
                box.offset = cc.v2(8, 8)
                box.size = testNode.getContentSize()
                box['data'] = {
                    to: 'map/map2',
                    x: 140,
                    y: 140
                }
                mapNode.addChild(testNode)
            } else {
                const testNode = new cc.Node('test')
                testNode.group = 'item'
                testNode.setPosition(95, 95)
                testNode.width = testNode.height = 16
                const box = testNode.addComponent(cc.BoxCollider)
                box.offset = cc.v2(8, 8)
                box.size = testNode.getContentSize()
                box['data'] = {
                    to: 'map/map',
                    x: 300,
                    y: 300
                }
                mapNode.addChild(testNode)
            }

            this.now_map = path

            if (fn) fn()

            this.Loading.hide(options.fadeOutTime)
        })
    }

    setPlayer(x: number, y: number, direction: Direction) {
        this.player.setPosition(x, y)
        this.Player.setDirection(direction)
    }
}
