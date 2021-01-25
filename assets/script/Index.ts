import Loading from './Loading'
import User from './data/user'

const { ccclass, property } = cc._decorator

@ccclass
export default class Index extends cc.Component {
    @property(cc.Node)
    loading: cc.Node = null

    onStartClick() {
        this.loadGame()
    }

    onLoadClick() {
        const save = cc.sys.localStorage.getItem('save')
        if (save) {
            User.save = JSON.parse(save)
            this.loadGame()
        } else {
            console.warn('没有存档')
        }
    }

    private loadGame() {
        const loading: Loading = this.loading.getComponent('Loading')
        loading.show(0.5)
        cc.director.preloadScene('test', () => {
            cc.director.loadScene('test')
        })
    }
}
