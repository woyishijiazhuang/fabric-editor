export default class Event {
    // 1. 完成一个发布订阅模式
    private events: { [eventName: string]: Function[] } = {}
    // 侦听
    public on(eventName: EventName, fun: Function) {
        if (!this.events[eventName]) {
            this.events[eventName] = []
        }
        this.events[eventName].push(fun)
    }
    // 卸载
    public off(eventName: EventName, fun: Function) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(listener => listener !== fun)
        }
    }
    // 触发
    public emit(eventName: EventName, ...params: any[]) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(listener => {
                listener(...params)
            })
        }
    }
}

export enum EventName {
    // 1. 画布改变
    canvasResize = 'container:resize',
    // 2. 画布变换
    viewportTransformChange = 'viewportTransform:change',
    // 3. 根据点缩放
    zoomToPoint = 'zoomToPoint',


}