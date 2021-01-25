const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    onCollisionEnter(other, self) {
        if (other.node.group === 'smog') {
            other.node.active = false
            other.node.getComponent(cc.TiledTile).gid = 0
        }
    }
}
