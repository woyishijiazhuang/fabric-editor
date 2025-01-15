import * as fabric from 'fabric'

export default class AlignLine {
    private canvas: fabric.Canvas
    private ctx: CanvasRenderingContext2D
    private viewportTransform: fabric.TMat2D = [1, 0, 0, 1, 0, 0]
    private zoom = 1
    private _status = false
    get status() {
        return this._status
    }

    public extend = 5 // 两边延长距离
    public offset = { x: 0, y: 0 } // 偏移距离
    public margin = 4 // 吸附距离
    public width = 1
    public color = 'rgb(255,0,0)'

    private verticalLines: { x: number; y1: number; y2: number }[] = []
    private horizontalLines: { x1: number; x2: number; y: number }[] = []
    constructor(canvas: fabric.Canvas) {
        this.canvas = canvas
        this.ctx = canvas.getSelectionContext()
        this.open()
    }
    public open() {
        this._status = true
        const canvas = this.canvas
        canvas.on('mouse:down', this.mouseDown)
        canvas.on('object:moving', this.objectMoving)
        canvas.on('before:render', this.beforeRender)
        canvas.on('after:render', this.afterRender)
        canvas.on('mouse:up', this.mouseUp)
    }
    public close() {
        this._status = false
        const canvas = this.canvas
        canvas.off('mouse:down', this.mouseDown)
        canvas.off('object:moving', this.objectMoving)
        canvas.off('before:render', this.beforeRender)
        canvas.off('after:render', this.afterRender)
        canvas.off('mouse:up', this.mouseUp)
    }
    private drawLine(x1: number, y1: number, x2: number, y2: number) {
        this.ctx.moveTo(x1 * this.zoom + this.viewportTransform[4], y1 * this.zoom + this.viewportTransform[5])
        this.ctx.lineTo(x2 * this.zoom + this.viewportTransform[4], y2 * this.zoom + this.viewportTransform[5])
    }
    private drawVerticalLine(coords: { x: number; y1: number; y2: number }) {
        const x = coords.x + this.offset.x
        this.drawLine(x, coords.y1 - this.extend, x, coords.y2 + this.extend)
    }
    private drawHorizontalLine(coords: { x1: number; x2: number; y: number }) {
        const y = coords.y + this.offset.y
        this.drawLine(coords.x1 - this.extend, y, coords.x2 + this.extend, y)
    }
    private isInRange(value1: number, value2: number) {
        const roundedValue1 = Math.round(value1)
        const minValue = roundedValue1 - this.margin
        const maxValue = roundedValue1 + this.margin
        return value2 >= minValue && value2 <= maxValue
    }
    private getPosition(obj: fabric.FabricObject) {
        const centerP = obj.getCenterPoint()
        const BoundingRect = obj.getBoundingRect()

        const halfWidth = BoundingRect.width / 2
        const halfHeight = BoundingRect.height / 2
        return {
            left: centerP.x - halfWidth,
            right: centerP.x + halfWidth,
            x: centerP.x,
            y: centerP.y,
            top: centerP.y - halfHeight,
            bottom: centerP.y + halfHeight,
            halfWidth,
            halfHeight
        }
    }
    private mouseDown = () => {
        this.viewportTransform = this.canvas.viewportTransform
        this.zoom = this.canvas.getZoom()
    }
    private objectMoving = (e: fabric.BasicTransformEvent<fabric.TPointerEvent> & {
        target: fabric.FabricObject
    }) => {
        const activeObject = e.target
        const canvasObjects = this.canvas.getObjects()
        const activePosition = this.getPosition(activeObject)

        let horizontalInTheRange = false
        let verticalInTheRange = false

        const transform = this.canvas._currentTransform

        if (!transform) return
        const setPos = (x: number, y: number) => activeObject.setPositionByOrigin(new fabric.Point(x, y), 'center', 'center')

        const setVerticalLine = (x: number, activePosition: ReturnType<typeof this.getPosition>, objectPosition: ReturnType<typeof this.getPosition>) => {
            verticalInTheRange = true
            const minY = Math.min(activePosition.top, objectPosition.top)
            const maxY = Math.max(activePosition.bottom, objectPosition.bottom)
            this.verticalLines.push({ x: x, y1: minY, y2: maxY })
        }
        const setHorizontalLine = (y: number, activePosition: ReturnType<typeof this.getPosition>, objectPosition: ReturnType<typeof this.getPosition>) => {
            horizontalInTheRange = true
            const minX = Math.min(activePosition.left, objectPosition.left)
            const maxX = Math.max(activePosition.right, objectPosition.right)
            this.horizontalLines.push({ x1: minX, x2: maxX, y: y })
        }
        const innerObj = this.canvas.getActiveObjects()
        for (let i = 0; i < canvasObjects.length; i++) {
            const object = canvasObjects[i]
            if (activeObject === object) continue
            if (innerObj.includes(object)) continue
            // 如果在组合内
            if (activeObject.type == 'group' && object.group == activeObject) continue
            // if (object.type !== 'group' && object.group) continue

            const objectPosition = this.getPosition(object)

            // 左边缘对齐
            if (this.isInRange(activePosition.left, objectPosition.left)) {
                setVerticalLine(objectPosition.left, activePosition, objectPosition)
                setPos(objectPosition.left + activePosition.halfWidth, activePosition.y)
            }
            // Y轴对齐
            if (this.isInRange(activePosition.x, objectPosition.x)) {
                setVerticalLine(objectPosition.x, activePosition, objectPosition)
                setPos(objectPosition.x, activePosition.y)
            }
            // 右边缘对齐
            if (this.isInRange(activePosition.right, objectPosition.right)) {
                setVerticalLine(objectPosition.right, activePosition, objectPosition)
                setPos(objectPosition.right - activePosition.halfWidth, activePosition.y)
            }

            // 上边缘对齐
            if (this.isInRange(activePosition.top, objectPosition.top)) {
                setHorizontalLine(objectPosition.top, activePosition, objectPosition)
                setPos(activePosition.x, objectPosition.top + activePosition.halfHeight)
            }
            // X轴对齐
            if (this.isInRange(activePosition.y, objectPosition.y)) {
                setHorizontalLine(objectPosition.y, activePosition, objectPosition)
                setPos(activePosition.x, objectPosition.y)
            }
            // 下边缘对齐
            if (this.isInRange(activePosition.bottom, objectPosition.bottom)) {
                setHorizontalLine(objectPosition.bottom, activePosition, objectPosition)
                setPos(activePosition.x, objectPosition.bottom - activePosition.halfHeight)
            }

            // 左边缘贴右边缘
            if (this.isInRange(activePosition.left, objectPosition.right)) {
                setVerticalLine(objectPosition.right, activePosition, objectPosition)
                setPos(objectPosition.right + activePosition.halfWidth, activePosition.y)
            }
            // 右边缘贴左边缘
            if (this.isInRange(activePosition.right, objectPosition.left)) {
                setVerticalLine(objectPosition.left, activePosition, objectPosition)
                setPos(objectPosition.left - activePosition.halfWidth, activePosition.y)
            }
            // 上边缘贴下边缘
            if (this.isInRange(activePosition.top, objectPosition.bottom)) {
                setHorizontalLine(objectPosition.bottom, activePosition, objectPosition)
                setPos(activePosition.x, objectPosition.bottom + activePosition.halfHeight)
            }
            // 下边缘贴上边缘
            if (this.isInRange(activePosition.bottom, objectPosition.top)) {
                setHorizontalLine(objectPosition.top, activePosition, objectPosition)
                setPos(activePosition.x, objectPosition.top - activePosition.halfHeight)
            }
        }

        if (!horizontalInTheRange) {
            this.horizontalLines.length = 0
        }

        if (!verticalInTheRange) {
            this.verticalLines.length = 0
        }
    }
    private beforeRender = () => {
        if (this.canvas.contextTop) {
            this.canvas.clearContext(this.canvas.contextTop)
        }
    }
    private afterRender = () => {
        const ctx = this.ctx
        ctx.save()
        ctx.lineWidth = this.width
        ctx.strokeStyle = this.color
        ctx.beginPath()

        for (let i = this.verticalLines.length; i--;) {
            this.drawVerticalLine(this.verticalLines[i])
        }
        for (let j = this.horizontalLines.length; j--;) {
            this.drawHorizontalLine(this.horizontalLines[j])
        }

        ctx.stroke()
        ctx.restore()
        // noinspection NestedAssignmentJS
        this.verticalLines.length = this.horizontalLines.length = 0
    }
    private mouseUp = () => {
        this.verticalLines.length = this.horizontalLines.length = 0
        this.canvas.renderAll()
    }
}
