import FabricEditor from '../index'
import * as fabric from 'fabric'
import { EventName } from '../class/Event'
const DPI = window.devicePixelRatio
const getCanvas = (width: number, height: number) => {
    const canvas = document.createElement('canvas')
    canvas.width = width * DPI
    canvas.height = height * DPI

    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvas.style.position = 'absolute'
    canvas.style.left = '0'
    canvas.style.top = '0'
    canvas.style.backgroundColor = '#FFF'
    // canvas.style.cursor = 'ns-resize'
    // canvas.style.cursor = 'ew-resize'
    canvas.style.pointerEvents = 'none'
    return canvas
}



export default class Ruler {
    // private maxScale: number
    // private minScale: number
    private canvas: fabric.Canvas
    private FabricEditor: FabricEditor
    // 基本配置
    public hCanvas: HTMLCanvasElement // 水平标尺
    public vCanvas: HTMLCanvasElement // 竖直标尺
    private _status = false
    get status () {
        return this._status
    }

    private _size = 20
    get size(): number { return this._size }
    set size(size: number) {
        this.size = size
        this.hCanvas.style.width = `${size}px`
        this.hCanvas.width = size * DPI

        this.vCanvas.style.height = `${size}px`
        this.vCanvas.height = size * DPI
    }
    // 刻度线
    public line = {
        width: 1,
        color: '#000',
        size: [0.5, 0.65, 0.8]
    }
    // 刻度文字
    public text = {
        fontSize: 14,
        color: '#000',
    }
    public activeStyle = {
        backgroundColor: '#00F6',
        fontSize: 14,
        fontColor: '#00F'
    }
    public mouseStyle = {
        color: '#F00',
        fontSize: 14,
        fontColor: '#F00'
    }

    constructor(FabricEditor: FabricEditor) {
        this.FabricEditor = FabricEditor
        const container = FabricEditor.canvas.wrapperEl
        this.canvas = FabricEditor.canvas

        this.hCanvas = getCanvas(this.canvas.width, this.size)
        this.vCanvas = getCanvas(this.size, this.canvas.height)
        // this.vCanvas.style.cursor = 'ew-resize'
        container.appendChild(this.hCanvas)
        container.appendChild(this.vCanvas)

        this.open()
    }
    private _viewportTransform: ((vpt: fabric.TMat2D) => void) | undefined
    private _zoomToPoint: ((point: fabric.Point, value: number) => void) | undefined
    public open() {
        this._status = true
        this.hCanvas.style.display = 'block'
        this.vCanvas.style.display = 'block'

        this.FabricEditor.on(EventName.canvasResize, this.resize)
        // 代理画布缩放事件
        this._viewportTransform = this.canvas.setViewportTransform
        this.canvas.setViewportTransform = (viewportTransform: fabric.TMat2D) => {
            // 为了在别的地方可能会用到, 先执行后触发, 确保如果是从this.canvas.setViewportTransform获取能获取到最新的数据
            this._viewportTransform!.call(this.canvas, viewportTransform)
            this.FabricEditor.emit(EventName.viewportTransformChange, viewportTransform)
        }
        this._zoomToPoint = this.canvas.zoomToPoint
        this.canvas.zoomToPoint = (point: fabric.Point, value: number) => {
            // 为了在别的地方可能会用到, 先执行后触发, 确保如果是从this.canvas.zoomToPoint获取能获取到最新的数据
            this._zoomToPoint!.call(this.canvas, point, value)
            this.FabricEditor.emit(EventName.zoomToPoint, point, value)
        }

        this.FabricEditor.on(EventName.viewportTransformChange, this.render)
        // this.canvas.on('object:modified', this.render)
        this.FabricEditor.on(EventName.zoomToPoint, this.render)
        this.canvas.on('mouse:move', this.render)
        // 选中和取消选中
        this.canvas.on('selection:created', this.render)
        this.canvas.on('selection:cleared', this.render)
        // 主动执行第一次
        this.render()
    }

    public close() {
        this._status = false
        this.hCanvas.style.display = 'none'
        this.vCanvas.style.display = 'none'

        this.FabricEditor.off(EventName.canvasResize, this.resize)
        // 代理画布缩放事件
        this.canvas.setViewportTransform = this._viewportTransform!
        this.canvas.zoomToPoint = this._zoomToPoint!

        this.FabricEditor.off(EventName.viewportTransformChange, this.render)
        // this.canvas.off('object:modified', this.render)
        this.FabricEditor.off(EventName.zoomToPoint, this.render)
        this.canvas.off('mouse:move', this.render)
        this.canvas.off('selection:created', this.render)
        this.canvas.off('selection:cleared', this.render)
    }
    public toggle = () => {
        if (this.status) {
            this.close()
        } else {
            this.open()
        }
    }

    public render = (() => {
        let cahceVpt: fabric.TMat2D | null = null

        // 不停渲染标尺的函数
        const requestRender = () => {
            if (!cahceVpt) return
            const vpt = cahceVpt
            cahceVpt = null
            this.drawRule(vpt)
            return requestAnimationFrame(requestRender)
        }

        return () => {
            if (cahceVpt) {
                cahceVpt = this.canvas.viewportTransform
            } else {
                cahceVpt = this.canvas.viewportTransform
                // 如果在当前帧执行, 则会在当前帧触发多次drawRule
                requestAnimationFrame(requestRender)
            }

        }
    })()

    private drawRule(vpt: fabric.TMat2D) {
        const SIZE = this.size * DPI
        const ctxH = this.hCanvas.getContext('2d')!
        const ctxV = this.vCanvas.getContext('2d')!
        // 短 中 长
        const [short, medium, long] = this.line.size
        // 清除之前的绘制
        ctxH.clearRect(0, 0, this.hCanvas.width, this.hCanvas.height)
        ctxV.clearRect(0, 0, this.vCanvas.width, this.vCanvas.height)
        // 计算缩放比例, #INFO: x 与 y 应该是两个scale, 但是在这里没有尝试两个方向缩放不同的操作
        const scale = vpt[0]
        // 根据scale获取单个刻度应该代表多少值
        const unit = Math.ceil((1 / scale) * 5)

        // 找到零刻度
        const h_zero = vpt[4] * DPI
        ctxH.save()
        ctxH.beginPath()
        ctxH.lineWidth = this.line.width
        ctxH.strokeStyle = this.line.color
        ctxH.textAlign = 'center'
        ctxH.textBaseline = 'top'
        ctxH.font = `${this.text.fontSize}px Arial`
        ctxH.fillStyle = this.text.color
        // 向右
        for (let i = h_zero, hrNum = -10 * unit, step = unit * DPI; i < this.hCanvas.width; i += scale * step) {

            ctxH.moveTo(i, SIZE)
            ctxH.lineTo(i, SIZE * short)
            hrNum += unit * 10
            // @ts-ignore
            ctxH.fillText(hrNum, i, 0)
            for (let j = 0; j < 4; j++) {
                ctxH.moveTo(i += scale * step, SIZE)
                ctxH.lineTo(i, SIZE * long)
            }

            ctxH.moveTo(i += scale * step, SIZE)
            ctxH.lineTo(i, SIZE * medium)
            for (let j = 0; j < 4; j++) {
                ctxH.moveTo(i += scale * step, SIZE)
                ctxH.lineTo(i, SIZE * long)
            }

        }
        // 向左
        for (let i = h_zero, hlNum = 0, step = unit * DPI; i >= 0;) {
            for (let j = 0; j < 4; j++) {
                ctxH.moveTo(i -= scale * step, SIZE)
                ctxH.lineTo(i, SIZE * long)
            }
            ctxH.moveTo(i -= scale * step, SIZE)
            ctxH.lineTo(i, SIZE * medium)
            for (let j = 0; j < 4; j++) {
                ctxH.moveTo(i -= scale * step, SIZE)
                ctxH.lineTo(i, SIZE * long)
            }
            ctxH.moveTo(i -= scale * step, SIZE)
            ctxH.lineTo(i, SIZE * short)

            // @ts-ignore
            ctxH.fillText(hlNum -= 10 * unit, i, 0)
        }
        ctxH.stroke()
        ctxH.closePath()
        ctxH.restore()

        const v_zero = vpt[5] * DPI
        ctxV.save()
        ctxV.beginPath()
        ctxV.lineWidth = this.line.width
        ctxV.strokeStyle = this.line.color
        ctxV.textAlign = 'center'
        ctxV.textBaseline = 'top'
        ctxV.font = `${this.text.fontSize}px Arial`
        ctxV.fillStyle = this.text.color
        // 向下
        for (let i = v_zero, vbNum = -10 * unit, step = unit * DPI; i < this.vCanvas.height; i += scale * step) {
            ctxV.moveTo(SIZE, i)
            ctxV.lineTo(SIZE * short, i)

            ctxV.save()
            ctxV.translate(0, i)
            ctxV.rotate(-Math.PI / 2)
            // @ts-ignore
            ctxV.fillText(vbNum += 10 * unit, 0, 0)
            ctxV.restore()

            for (let j = 0; j < 4; j++) {
                ctxV.moveTo(SIZE, i += scale * step)
                ctxV.lineTo(SIZE * long, i)
            }
            ctxV.moveTo(SIZE, i += scale * step)
            ctxV.lineTo(SIZE * medium, i)
            for (let j = 0; j < 4; j++) {
                ctxV.moveTo(SIZE, i += scale * step)
                ctxV.lineTo(SIZE * long, i)
            }
        }
        // 向上
        for (let i = v_zero, vtNum = 0, step = unit * DPI; i >= 0;) {
            for (let j = 0; j < 4; j++) {
                ctxV.moveTo(SIZE, i -= scale * step)
                ctxV.lineTo(SIZE * long, i)
            }
            ctxV.moveTo(SIZE, i -= scale * step)
            ctxV.lineTo(SIZE * medium, i)
            for (let j = 0; j < 4; j++) {
                ctxV.moveTo(SIZE, i -= scale * step)
                ctxV.lineTo(SIZE * long, i)
            }
            ctxV.moveTo(SIZE, i -= scale * step)
            ctxV.lineTo(SIZE * 0.4, i)
            ctxV.save()
            ctxV.translate(0, i)
            ctxV.rotate(-Math.PI / 2)
            // @ts-ignore
            ctxV.fillText(vtNum -= 10 * unit, 0, 0)
            ctxV.restore()
        }
        ctxV.stroke()
        ctxV.closePath()
        ctxV.restore()
        const activeObj = this.canvas.getActiveObject()
        if (activeObj) {
            const { x, y } = activeObj.getCenterPoint()
            const { width, height } = activeObj.getBoundingRect()
            // #ARGUE: 大一个像素宽度, strokeWidth的影响, 是否需要控制?
            const left = h_zero + (x - width / 2) * scale * DPI
            const right = h_zero + (x + width / 2) * scale * DPI

            ctxH.save()
            ctxH.beginPath()
            ctxH.fillStyle = this.activeStyle.backgroundColor
            ctxH.font = `${this.activeStyle.fontSize}px Arial`
            ctxH.textAlign = 'left'
            ctxH.textBaseline = 'top'
            ctxH.rect(left, 0, width * scale * DPI, this.hCanvas.height)
            ctxH.fill()

            ctxH.fillStyle = this.activeStyle.fontColor
            ctxH.fillText((x + width / 2).toFixed(2), right, this.text.fontSize)
            ctxH.textAlign = 'right'
            ctxH.fillText((x - width / 2).toFixed(2), left, this.text.fontSize)
            ctxH.closePath()
            ctxH.restore()

            const top = v_zero + (y - height / 2) * scale * DPI
            // const bottom = v_zero + (y + height / 2) * scale * DPI
            ctxV.save()
            ctxV.beginPath()
            ctxV.fillStyle = this.activeStyle.backgroundColor
            ctxV.font = `${this.activeStyle.fontSize}px Arial`
            ctxV.textAlign = 'left'
            ctxV.textBaseline = 'top'
            ctxV.rect(0, top, this.vCanvas.width, height * scale * DPI)
            ctxV.fill()
            ctxV.fillStyle = this.activeStyle.fontColor
            ctxV.translate(0, top)
            ctxV.rotate(-Math.PI / 2)
            ctxV.fillText((y - height / 2).toFixed(2), 0, this.text.fontSize)
            ctxV.textAlign = 'right'
            ctxV.fillText((y + height / 2).toFixed(2), -width * scale * DPI, this.text.fontSize)
            ctxV.closePath()
            ctxV.restore()
        }

        // 绘制鼠标位置
        const { x, y } = this.FabricEditor.mousePosition
        ctxH.save()
        ctxH.beginPath()
        ctxH.textAlign = 'left'
        ctxH.textBaseline = 'top'
        ctxH.font = `${this.mouseStyle.fontSize}px Arial`
        ctxH.fillStyle = this.mouseStyle.fontColor
        ctxH.strokeStyle = this.mouseStyle.color
        const computedX = h_zero + x * scale * DPI
        ctxH.moveTo(computedX, 0)
        ctxH.lineTo(computedX, this.hCanvas.height)
        ctxH.stroke()
        ctxH.fillText(x.toFixed(2), computedX + this.mouseStyle.fontSize, this.text.fontSize)
        ctxH.closePath()
        ctxH.restore()

        ctxV.save()
        ctxV.beginPath()
        ctxV.textAlign = 'left'
        ctxV.textBaseline = 'top'
        ctxV.font = `${this.mouseStyle.fontSize}px Arial`
        ctxV.fillStyle = this.mouseStyle.fontColor
        ctxV.strokeStyle = this.mouseStyle.color
        const computedY = v_zero + y * scale * DPI
        ctxV.moveTo(0, computedY)
        ctxV.lineTo(this.vCanvas.width, computedY)
        ctxV.stroke()
        ctxV.translate(0, computedY - this.mouseStyle.fontSize)
        ctxV.rotate(-Math.PI / 2)
        ctxV.fillText(y.toFixed(2), 0, this.text.fontSize)
        ctxV.closePath()
        ctxV.restore()

        // 绘制边缘
        ctxH.save()
        ctxH.beginPath()
        ctxH.strokeStyle = 'rgb(86, 86, 86)'
        ctxH.moveTo(0, this.hCanvas.height)
        ctxH.lineTo(this.hCanvas.width, this.hCanvas.height)
        ctxH.stroke()
        ctxH.closePath()
        ctxH.restore()

        ctxV.save()
        ctxV.beginPath()
        ctxV.strokeStyle = 'rgb(86, 86, 86)'
        ctxV.moveTo(this.vCanvas.width, 0)
        ctxV.lineTo(this.vCanvas.width, this.vCanvas.height)
        ctxV.stroke()
        ctxV.closePath()
        ctxV.restore()
        // 清除左上角
        ctxV.clearRect(0, 0, this.vCanvas.width, this.vCanvas.width)
    }
    private resize = () => {
        // 重新调整画布大小
        this.hCanvas.width = this.canvas.width * DPI
        this.hCanvas.style.width = this.canvas.width + 'px'
        this.vCanvas.height = this.canvas.height * DPI
        this.vCanvas.style.height = this.canvas.height + 'px'
        this.render()
    }
}