export default class Event {
    // 1. 完成一个发布订阅模式
    private events: { [eventName: string]: Function[] } = {}
    // 侦听
    public on(eventName: string, fun: Function) {
        if (!this.events[eventName]) {
            this.events[eventName] = []
        }
        this.events[eventName].push(fun)
    }
    // 卸载
    public off(eventName: string, fun: Function) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(listener => listener !== fun)
        }
    }
    // 触发
    public emit(eventName: string, ...params: any[]) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(listener => {
                listener(...params)
            })
        }
    }
}