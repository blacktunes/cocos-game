const { ccclass, property } = cc._decorator

@ccclass
export default class Loading extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null

    /**
     * 显示加载页面
     * @param fade 淡入时长
     * @param text 加载提示文字
     */
    show(fade = 0.5, text = 'LOADING') {
        if (this.node.active) return
        this.node.opacity = 0
        this.label.string = text
        return new Promise<void>(resolve => {
            window['stopAll'] = true
            this.node.active = true
            if (fade) {
                cc.tween(this.node)
                    .to(fade, { opacity: 255 })
                    .call(() => {
                        resolve()
                    })
                    .start()
            } else {
                this.node.opacity = 255
                resolve()
            }
        })
    }

    /**
     * 隐藏加载页面
     * @param fade 淡出时长
     */
    hide(fade = 0.5) {
        if (!this.node.active) return
        this.node.opacity = 255
        return new Promise<void>(resolve => {
            if (fade) {
                cc.tween(this.node)
                    .to(fade, { opacity: 0 })
                    .call(() => {
                        window['stopAll'] = false
                        this.node.active = false
                        resolve()
                    })
                    .start()
            } else {
                this.node.opacity = 0
                resolve()
            }
        })
    }
}
