import Game from './Game'
import Player, { Direction } from './Player'
import User from './data/user'

const { ccclass, property } = cc._decorator

interface MapEventList {
    [MapName: string]: MapEvent
}

interface MapEvent {
    [EventName: string]: {
        x: number
        y: number
        stop: boolean
        sprite: string
        event: {
            auto: boolean
            fn: (player: Player) => void
        }
    }
}

@ccclass
export default class GameEvent extends cc.Component {
    Game: Game

    onLoad() {
        this.Game = this.getComponent('Game')
    }

    list: MapEventList = {
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
                            this.Game.setPlayer(40, 40, Direction.DOWN)
                        })
                    }
                }
            },
            'save': {
                x: 4,
                y: 3,
                stop: true,
                sprite: 'test/test',
                event: {
                    auto: false,
                    fn: (player) => {
                        this.Game.setTalk([
                            {
                                id: 2,
                                text: '我现在是<color=red>存档点</color>'
                            },
                            {
                                id: 1,
                                text: '哦'
                            }
                        ])
                        const position = player.getPosition()
                        User.save.location.x = position.x
                        User.save.location.y = position.y
                        User.save.location.d = position.d
                        User.save.location.map = 'map/map2'
                        cc.sys.localStorage.setItem('save', JSON.stringify(User.save))
                    }
                }
            }
        },
        'map/map': {
            'save': {
                x: 10,
                y: 38,
                stop: true,
                sprite: 'test/test',
                event: {
                    auto: false,
                    fn: (player) => {
                        this.Game.setTalk([
                            {
                                id: 2,
                                text: '我现在是<color=red>存档点</color>'
                            },
                            {
                                id: 1,
                                text: '哦'
                            }
                        ])
                        const position = player.getPosition()
                        User.save.location.x = position.x
                        User.save.location.y = position.y
                        User.save.location.d = position.d
                        User.save.location.map = 'map/map'
                        cc.sys.localStorage.setItem('save', JSON.stringify(User.save))
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
                            this.Game.setPlayer(3, 6, Direction.LEFT)
                        })
                    }
                }
            }
        }
    }
}
