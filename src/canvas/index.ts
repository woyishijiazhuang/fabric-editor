import * as fabric from 'fabric'
import Event from './event'
import { CanvasOptions } from 'fabric'
import control from './utils/control'
import AlignLine from './utils/AlignLine'
import Ruler from './utils/Ruler'
import { debounce } from 'lodash'


type TOptions<T> = Partial<T> & Record<string, any>

// 新建FabricEditor类
class FabricEditor extends Event {
    public fragment: DocumentFragment
    public canvas: fabric.Canvas
    public get workspace() {
        // @ts-ignore 导入json时, workspace会发生变化
        return this.canvas.getObjects().find(obj => obj.id === 'workspace') as fabric.Rect
    }

    public alignLine: AlignLine // 辅助线
    public ruler: Ruler // 刻度尺
    constructor(options: TOptions<CanvasOptions> = {}) {
        super()
        this.fragment = document.createDocumentFragment()
        const el = document.createElement('canvas')
        this.fragment.appendChild(el)

        this.canvas = new fabric.Canvas(el, {
            ...options,
            controlsAboveOverlay: true,
            preserveObjectStacking: true,
            imageSmoothingEnabled: false,
            // stopContextMenu: true,
            // selectionColor: 'rgba(209.4, 236.7, 195.9, 0.6)',
        })

        const workspace = new fabric.Rect({
            id: 'workspace',
            width: 800,
            height: 600,
            selectable: false,
            hasControls: false,
            fill: '#FFF',
            moveCursor: 'default',
            hoverCursor: 'default',
            strokeWidth: 0,
        })

        this.canvas.add(workspace)
        this.canvas.clipPath = workspace

        this.alignLine = new AlignLine(this.canvas)
        this.ruler = new Ruler(this)

        this.init()
    }
    public init() {
        this.bindMove()
        this.bindWheel()
        this.bindDrag()
        this.centerActive(undefined, false)
        this.spaceCenter()
        this.bindControl()
        this.bindCtrlCV()
        this.directionControl()
    }


    // 实时侦听鼠标位置
    public mousePosition = new fabric.Point(0, 0)
    private bindMove() {
        this.canvas.on('mouse:move', (e: fabric.TPointerEventInfo<fabric.TPointerEvent>) => {
            this.mousePosition = e.scenePoint
        })
    }
    // 2. 完成鼠标滚轮缩放画布
    public maxScale = 10
    public minScale = 0.1
    private bindWheel() {
        this.canvas.on('mouse:wheel', (opt) => {
            const delta = opt.e.deltaY
            let zoom = this.canvas.getZoom()
            zoom *= 0.999 ** delta
            if (zoom > this.maxScale) zoom = this.maxScale
            if (zoom < this.minScale) zoom = this.minScale
            this.canvas.zoomToPoint(opt.viewportPoint, zoom)
            opt.e.preventDefault()
            opt.e.stopPropagation()
        })
    }
    // 3. ctrl + 鼠标 拖动画布
    private bindDrag() {
        let lastPosX: number = 0
        let lastPosY: number = 0
        const moveFun = (opt: fabric.TPointerEventInfo<fabric.TPointerEvent>) => {
            const vpt = opt.viewportPoint
            const viewportTransform = this.canvas.viewportTransform
            viewportTransform[4] = vpt.x - lastPosX
            viewportTransform[5] = vpt.y - lastPosY
            this.canvas.setViewportTransform(viewportTransform)
        }
        this.canvas.on('mouse:down', (opt) => {
            if (opt.e.ctrlKey === true) {
                this.canvas.selection = false
                const x = this.canvas.viewportTransform[4]
                const y = this.canvas.viewportTransform[5]
                lastPosX = opt.viewportPoint.x - x
                lastPosY = opt.viewportPoint.y - y
                this.canvas.on('mouse:move', moveFun)
            }
        })
        this.canvas.on('mouse:up', () => {
            this.canvas.selection = true
            this.canvas.off('mouse:move', moveFun)
        })
    }

    // 4. ctrl + space 居中显示workspace 或者 active object
    public defaultCenterScale = 0.90
    public animateFrame = 30
    public centerActive(obj?: fabric.Object, animate = true): Promise<void> | void {
        const centerObj = obj || this.canvas.getActiveObject() || this.workspace
        // 没有考虑centerObj的scale
        const scaleX = this.canvas.width / centerObj.width / Math.max(centerObj.scaleX, 1)
        const scaleY = this.canvas.height / centerObj.height / Math.max(centerObj.scaleY, 1)

        let scale = Math.min(scaleX, scaleY)
        if (scale > this.maxScale) scale = this.maxScale
        if (scale < this.minScale) scale = this.minScale

        const p1 = this.canvas.getCenterPoint()
        // 计算标尺的SIZE
        if (this.ruler?.size && this.ruler.status) {
            p1.x += this.ruler.size / 2
            p1.y += this.ruler.size / 2
        }
        const p2 = centerObj.getCenterPoint()
        const viewportTransform = this.canvas.viewportTransform

        const newScale = scale * this.defaultCenterScale
        const newViewportTransform: fabric.TMat2D = [
            newScale,
            viewportTransform[1],
            viewportTransform[2],
            newScale,
            p1.x - p2.x * newScale,
            p1.y - p2.y * newScale
        ]

        if (this.animateFrame && animate) {
            // 有动画
            return this.animateViewportTransform(newViewportTransform)
        } else {
            // 没有动画
            return this.canvas.setViewportTransform(newViewportTransform)
        }
    }
    private spaceCenter() {
        // 多次按ctrl + 空格防止重复触发
        let end = false
        const fun = async (e: KeyboardEvent) => {
            if (e.key === ' ' && e.ctrlKey && !end) {
                end = true
                await this.centerActive()
                end = false
            }
        }
        window.addEventListener('keydown', fun)
        this.destory.push(() => window.removeEventListener('keydown', fun))
    }

    // 4.1 ViewportTransform 动画
    public animateViewportTransform(viewportTransform: fabric.TMat2D): Promise<void> {

        return new Promise(resolve => {
            let animateFrameTemp = this.animateFrame
            const oldViewportTransform: fabric.TMat2D = [...this.canvas.viewportTransform]
            const step = viewportTransform.map((item, index) => {
                return (item - oldViewportTransform[index]) / animateFrameTemp
            })
            const animate = () => {
                // 终止
                if (!--animateFrameTemp) {
                    resolve()
                    return this.canvas.setViewportTransform(viewportTransform)
                }

                for (let i = 0; i < oldViewportTransform.length; i++) {
                    oldViewportTransform[i] += step[i]
                }
                this.canvas.setViewportTransform(oldViewportTransform)
                requestAnimationFrame(animate)
            }
            animate()
        })
    }
    // 5. 自定义控制器
    public controlSize = 20
    public bindControl(opt?: typeof fabric.InteractiveFabricObject.ownDefaults) {
        const SIZE = this.controlSize
        const controls = control.getDefaultControl(SIZE)
        // 设置
        fabric.InteractiveFabricObject.ownDefaults = {
            ...fabric.InteractiveFabricObject.ownDefaults,
            ...controls,
            cornerSize: SIZE / 2,
            cornerStyle: 'circle',
            cornerColor: '#fff',
            cornerStrokeColor: 'rgb(51.2, 126.4, 204)',
            transparentCorners: false,
            borderDashArray: [4, 2],
            borderColor: 'rgba(255, 0, 0, 0.6)',
            ...opt
        }
    }
    // 6. ctrl + v + c
    private bindCtrlCV() {
        // 侦听ctrl+v+c
        const pasteFun = async (event: ClipboardEvent) => {
            // 检查当前焦点元素是否是输入框或可编辑元素
            const activeElement = document.activeElement
            const isInputFocused =
                activeElement?.tagName === 'INPUT' ||
                activeElement?.tagName === 'TEXTAREA' ||
                activeElement?.getAttribute('contenteditable') === 'true'

            // 如果焦点在输入框或可编辑元素内，则不处理
            if (isInputFocused) {
                return
            }
            // 阻止默认粘贴行为
            event.preventDefault()

            // 获取剪贴板内容
            const clipboardData = event.clipboardData

            if (clipboardData) {
                // 处理剪贴板中的多个项目
                for (let i = 0; i < clipboardData.items.length; i++) {
                    const item = clipboardData.items[i]
                    // 处理文本内容
                    if (item.type === 'text/plain') {
                        item.getAsString((str) => {
                            var textbox = new fabric.IText(str, {
                                left: this.mousePosition.x,
                                top: this.mousePosition.y,
                                fontSize: 16,
                            })
                            textbox.set({
                                left: this.mousePosition.x - textbox.width / 2,
                                top: this.mousePosition.y - textbox.height / 2,
                            })
                            this.canvas.add(textbox)
                        })
                    }
                    // 处理图片内容
                    else if (item.type.startsWith('image/')) {
                        const file = item.getAsFile()
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                const img = new Image();
                                img.onload = () => {
                                    const fabricImage = new fabric.Image(img, {
                                        left: this.mousePosition.x,
                                        top: this.mousePosition.y,
                                    });
                                    this.canvas.add(fabricImage);
                                    this.canvas.requestRenderAll();
                                };
                                img.src = e.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                        }
                    }
                    // 处理特殊JSON
                    else if (item.type === 'text/json') {
                        item.getAsString(async (str) => {
                            const obj = (await fabric.util.enlivenObjects([JSON.parse(str)]))[0]
                            if (obj && obj instanceof fabric.FabricObject) {
                                this.canvas.discardActiveObject()
                                obj.set({ evented: true })
                                obj.setPositionByOrigin(this.mousePosition, 'center', 'center')
                                if (obj instanceof fabric.ActiveSelection) {
                                    obj.canvas = this.canvas
                                    obj.forEachObject((obj) => {
                                        this.canvas.add(obj)
                                    })
                                    obj.setCoords()
                                } else {
                                    this.canvas.add(obj)
                                }
                                this.canvas.setActiveObject(obj)
                                this.canvas.requestRenderAll()
                            }
                        })
                    }
                }
            }
        }

        const copyFun = async (event: ClipboardEvent) => {
            // 获取选中的文本 
            const selectedText = window.getSelection()?.toString()
            // 如果没有选中文本，则复制自定义内容 
            if (!selectedText) {
                event.preventDefault()
                // 阻止默认的复制行为
                const obj = await this.canvas.getActiveObject()?.clone()
                if (obj) {
                    obj.includeDefaultValues = false
                    // 自定义类型
                    event.clipboardData?.setData('text/json', JSON.stringify(await obj.toJSON()))
                }
            }
        }

        window.addEventListener('paste', pasteFun)
        window.addEventListener('copy', copyFun)
        this.destory.push(() => {
            window.removeEventListener('paste', pasteFun)
            window.removeEventListener('copy', copyFun)
        })
    }
    // 7. 侦听元素变化适应大小
    public observeElement(el: HTMLElement) {
        if (el.computedStyleMap().get('overflow')?.toString() !== 'hidden') {
            throw new Error('observeElement: el overflow style is not hidden')
        }
        const fun = debounce(() => {
            this.canvas.setDimensions({
                width: el.clientWidth,
                height: el.clientHeight
            })
            this.emit('container:resize')
            this.centerActive(this.workspace)
        }, 50)
        fun()
        const resizeObserver = new ResizeObserver(fun)
        resizeObserver.observe(el)
    }

    // 方向控制
    private directionControl() {
        const fun = (e: KeyboardEvent) => {

            const obj = this.canvas.getActiveObject()
            if (!obj) return
            switch (e.key) {
                case 'ArrowUp':
                    obj.set('top', Math.ceil(obj.top) - 1)
                    break
                case 'ArrowDown':
                    obj.set('top', Math.ceil(obj.top) + 1)
                    break
                case 'ArrowLeft':
                    obj.set('left', Math.ceil(obj.left) - 1)
                    break
                case 'ArrowRight':
                    obj.set('left', Math.ceil(obj.left) + 1)
                    break
                default:
                    return
            }
            obj.setCoords()
            this.ruler.render()
            this.canvas.requestRenderAll()
        }
        window.addEventListener('keydown', fun)
        this.destory.push(() => window.removeEventListener('keyup', fun))
    }








    // end 可能需要的destory
    private destory: Function[] = []
    public async destoryAll() {
        // 检查画布内容
        // if (this.canvas.getObjects().length) {
        //     await ElMessageBox.confirm('画布内容不为空，确定要退出吗？', '提示', {
        //         confirmButtonText: '确定',
        //         cancelButtonText: '保存到本地',
        //         type: 'warning'
        //     }).then(() => {

        //     }).catch(() => {

        //     })
        // }
        this.canvas.off()
        this.canvas.destroy()
        this.destory.forEach(fun => fun())
    }

}

export default FabricEditor
