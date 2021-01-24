const { ccclass, property } = cc._decorator

@ccclass
export default class Camera extends cc.Component {

    @property(cc.Node)
    playerNode: cc.Node = null

    update(dt) {
        if (this.playerNode) {
            const w_pos = this.playerNode.convertToWorldSpaceAR(cc.v2(0, 0))
            const n_pos = this.node.parent.convertToWorldSpaceAR(w_pos)
            const size = this.node.parent.getContentSize()
            this.node.position = cc.v3(n_pos.x - size.width, n_pos.y - size.height, 0)
        }
    }
}
