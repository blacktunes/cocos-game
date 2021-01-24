import Game from './Game_1'

const { ccclass, property } = cc._decorator

@ccclass
export default class GameEvent extends cc.Component {
    Game: Game

    onLoad() {
        this.Game = this.getComponent('Game_1')
    }

    list = {
        'map/map2': {
            'test': {
                x: 3,
                y: 3,
                stop: false,
                sprite: 'test/cat',
                event: {
                    auto: true,
                    fn: () => {
                        this.Game.setMap('map/map', () => {
                            this.Game.setPlayer(40, 40, 1)
                        })
                    }
                }
            }
        },
        'map/map': {
            'test': {
                x: 10,
                y: 38,
                stop: true,
                sprite: 'test/test',
                event: {
                    auto: false,
                    fn: () => {
                        this.Game.Dialog.init([
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
                }
            },
            'test2': {
                x: 13,
                y: 6,
                stop: false,
                sprite: 'test/cat',
                event: {
                    auto: true,
                    fn: () => {
                        this.Game.setMap('map/map2', () => {
                            this.Game.setPlayer(3, 6, 3)
                        })
                    }
                }
            }
        }
    }
}
