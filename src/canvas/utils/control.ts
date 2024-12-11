import * as fabric from 'fabric'
import rotateIcon from '../public/rotate.svg'


const getDeleteControl = (SIZE: number) => {
    const deleteIcon =
        "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E"
    const deleteImg = document.createElement('img')
    deleteImg.src = deleteIcon
    return new fabric.Control({
        x: 0.5,
        y: -0.5,
        offsetX: 16,
        offsetY: -16,
        cursorStyle: 'pointer',
        actionName: 'delete',
        // withConnection: true,
        mouseUpHandler: (_eventData, transform) => {
            const canvas = transform.target.canvas!
            canvas.getActiveObjects()?.forEach(obj => {
                canvas.remove(obj)
            })
            canvas.discardActiveObject()
            canvas.requestRenderAll()
        },
        render: (ctx, left, top, _styleOverride, fabricObject) => {
            ctx.save()
            ctx.translate(left, top)
            ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle))
            ctx.drawImage(deleteImg, -SIZE / 2, -SIZE / 2, SIZE, SIZE)
            ctx.restore()
        },
    })
}

const getDefaultControl = (SIZE: number) => {
    const controls = fabric.InteractiveFabricObject.createControls()
    for (const key in controls.controls) {
        // 四个边
        if (['mr', 'ml', 'mb', 'mt'].includes(key)) {
            const is_lr = ['mr', 'ml'].includes(key)
            if (is_lr) {
                controls.controls[key].sizeX = SIZE / 4
                controls.controls[key].sizeY = SIZE
            } else {
                controls.controls[key].sizeX = SIZE
                controls.controls[key].sizeY = SIZE / 4
            }
            controls.controls[key].render = (ctx, left, top, _styleOverride, fabricObject) => {
                ctx.save()
                if (is_lr) {
                    ctx.translate(left, top)
                    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle + 90))
                } else {
                    ctx.translate(left, top)
                    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle))
                }

                ctx.lineCap = 'round'

                ctx.beginPath()

                ctx.lineWidth = SIZE / 4
                ctx.strokeStyle = 'rgb(51.2, 126.4, 204)'
                ctx.moveTo(-SIZE / 2, 0)
                ctx.lineTo(SIZE / 2, 0)
                ctx.stroke()

                ctx.lineWidth -= 2
                ctx.moveTo(-SIZE / 2, 0)
                ctx.strokeStyle = 'rgb(255, 255, 255)'
                ctx.lineTo(SIZE / 2, 0)

                ctx.stroke()
                ctx.closePath()
                ctx.restore()
            }
        }
    }
    controls.controls.del = getDeleteControl(SIZE - 4)

    const rotateImg = document.createElement('img')
    rotateImg.src = rotateIcon

    // controls.controls.mtr.withConnection = false
    controls.controls.mtr.render = (ctx, left, top, _styleOverride, fabricObject) => {
        ctx.save()
        ctx.translate(left, top)
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle))
        ctx.drawImage(rotateImg, -SIZE / 2, -SIZE / 2, SIZE, SIZE)
        ctx.restore()
    }

    return controls
}

export default {
    getDeleteControl,
    getDefaultControl
}
