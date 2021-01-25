import Avatar from './data/avatar'

const { ccclass, property } = cc._decorator

export interface TextData<T> {
    id: number
    text: T
}

@ccclass
export default class Dialog extends cc.Component {
    @property(cc.Sprite)
    avatar: cc.Sprite = null
    @property(cc.Label)
    nameLabel: cc.Label = null
    @property(cc.RichText)
    textLabel: cc.RichText = null

    private textArr: TextData<string[]>[] = []
    private textInde = -1
    private nowText = []
    private textEnd = true
    private tt = 0
    private index = -1

    reset() {
        this.textArr = []
        this.textInde = -1
        this.tt = 0
        this.thisLineEnd()
    }

    private thisLineEnd() {
        this.textEnd = true
        this.nowText = []
        this.index = -1
    }

    init(textArr: TextData<string>[]) {
        if (this.node.active) return
        const tempArr = []
        textArr.forEach(item => {
            tempArr.push({
                id: item.id,
                text: this.splitText(item.text)
            })
        })
        this.textArr = tempArr
        this.node.active = true
        this.nextText()
    }

    private splitText(str: string) {
        const regex = /<.+?\/?>/g // 匹配尖括号标签
        const matchArr = str.match(regex);
        const specialChar = '│'
        const replaceStr = str.replace(regex, specialChar) // 标签数组
        const textArr = replaceStr.split(specialChar) // 文字数组
        const strArr = [] // 存放处理过的文字数组
        let paraNum = 0; // 待替换参数个数
        for (let text of textArr) {
            // 非空字符替换成类似 $[0-n] 参数
            if (text !== '') {
                text = `$[${paraNum}]`
                paraNum += 1
            }
            strArr.push(text)
        }
        let templetStr = strArr.join(specialChar) // 数组转成待替换字符串
        for (let index = 0; index < textArr.length; index++) {
            // 转换代替换字符串之后, 删除文字数组多余空字符
            if (textArr[index] === '') {
                textArr.splice(index, 1)
                index = index - 1
            }
        }
        while (templetStr.search(specialChar) !== -1) {
            // 数组转成的字符串原本 '特殊字符' 位置都是富文本标签的位置, 替换回标签
            if (matchArr[0]) {
                templetStr = templetStr.replace(specialChar, matchArr[0].toString())
                matchArr.splice(0, 1)
            } else {
                templetStr = templetStr.replace(specialChar, '')// 空字符串替换,防止死循环
                console.warn('matchArr not enough')
            }
        }
        const lastStrArr = [] // 转换后富文本数组
        const arrayParm = new Array(paraNum).fill('') // 替换参数数组
        for (let i = 0; i < textArr.length; i++) {
            for (const text of textArr[i]) {
                arrayParm[i] = arrayParm[i] + text
                let replaceStr1 = templetStr
                for (let index = 0; index < paraNum; index++) {
                    replaceStr1 = replaceStr1.replace(`$[${index}]`, arrayParm[index])
                }
                lastStrArr.push(replaceStr1)
            }
        }
        return lastStrArr
    }

    private nextText() {
        if (!this.textEnd) {
            this.setText(this.textArr[this.textInde])
        } else if (++this.textInde < this.textArr.length) {
            this.setText(this.textArr[this.textInde])
        } else {
            this.reset()
            this.node.active = false
        }
    }

    private setText(textData: TextData<string[]>) {
        if (!this.textEnd) {
            this.textLabel.string = textData.text[textData.text.length - 1]
            this.thisLineEnd()
        } else {
            this.textLabel.string = ''
            this.nowText = textData.text
            this.textEnd = false
        }

        this.nameLabel.string = Avatar[textData.id].name

        cc.resources.load(Avatar[textData.id].path, cc.SpriteFrame, (err, sprite: cc.SpriteFrame) => {
            this.avatar.spriteFrame = sprite
        })
    }

    private onKeyDown(e: cc.Event.EventKeyboard) {
        if (e.keyCode === cc.macro.KEY.z || e.keyCode === cc.macro.KEY.space) {
            this.nextText()
        }
    }

    onLoad() {
        window['dialog'] = this.node
        cc.systemEvent.on('keydown', this.onKeyDown, this)
    }

    onDestroy() {
        cc.systemEvent.off('keydown', this.onKeyDown)
    }

    update(dt) {
        if (this.nowText.length === 0) return
        this.tt += dt

        if (this.tt >= 0.1) {
            ++this.index
            if (this.index < this.nowText.length) {
                this.textLabel.string = this.nowText[this.index]
            } else {
                this.thisLineEnd()
            }
        }
    }
}
