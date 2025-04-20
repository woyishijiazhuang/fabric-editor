<template>
    <ul class="context-menu" :style="style">
        <li v-for="item in menuList" :key="item.name" :style="{ display: item.show ? 'block' : 'none' }"
            @click="item.click">
            <span>{{ item.name }}</span>
        </li>
    </ul>
</template>
<script setup lang='ts'>
import * as fabric from 'fabric'
import { useEventListener } from '@vueuse/core'
import FabricEditor from '@/canvas'
import { FabricObject } from 'fabric'

const editor = inject('editor') as FabricEditor
const style = reactive({ top: '0px', left: '0px', display: 'none' })
const activeObject = shallowRef<FabricObject>()
const handle = {
    lock: () => {
        if (activeObject.value instanceof fabric.ActiveSelection) {
            activeObject.value.forEachObject(obj => {
                obj.set('selectable', false)
            })
        } else {
            activeObject.value?.set('selectable', false)
        }
        editor.canvas.discardActiveObject()
        editor.canvas.requestRenderAll()
    },
    unlock: () => {
        if (activeObject.value instanceof fabric.ActiveSelection) {
            activeObject.value.forEachObject(obj => {
                obj.set('selectable', true)
            })
        } else {
            activeObject.value?.set('selectable', true)
        }
    },
    group: () => {
        if (activeObject.value instanceof fabric.ActiveSelection) {
            const group = new fabric.Group(activeObject.value._objects)
            activeObject.value.forEachObject(obj => {
                editor.canvas.remove(obj)
            })
            editor.canvas.add(group)
            editor.canvas.setActiveObject(group)
            editor.canvas.requestRenderAll()
        }
    },
    ungroup: () => {
        if (activeObject.value instanceof fabric.Group) {
            editor.canvas.remove(activeObject.value)
            var sel = new fabric.ActiveSelection(activeObject.value.removeAll(), {
                canvas: editor.canvas,
            })
            editor.canvas.setActiveObject(sel)
            editor.canvas.requestRenderAll()
        }
    }
}
const menuList = ref<any[]>([
    { name: '锁定', icon: 'lock', show: false, click: handle.lock },
    { name: '解锁', icon: 'unlock', show: false, click: handle.unlock },
    { name: '组合', icon: 'group', show: false, click: handle.group },
    { name: '取消组合', icon: 'ungroup', show: false, click: handle.ungroup },
])

const open = (e: MouseEvent) => {
    e.preventDefault()
    activeObject.value = editor.canvas.findTarget(e)
    // @ts-ignore
    if (!activeObject.value || activeObject.value.id == 'workspace') return
    menuList.value.forEach(item => {
        item.show = false
    })

    if (activeObject.value instanceof fabric.ActiveSelection) {
        menuList.value[2].show = true
    } else if (activeObject.value instanceof fabric.Group) {
        menuList.value[3].show = true
    }

    if (activeObject.value.selectable) {
        menuList.value[0].show = true
    } else {
        menuList.value[1].show = true
    }

    style.display = 'block'
    style.top = e.offsetY + 'px'
    style.left = e.offsetX + 'px'
}

useEventListener(editor.canvas.wrapperEl, 'contextmenu', open)
useEventListener(window.document, 'click', () => style.display = 'none')
</script>

<style scoped>
@media (prefers-color-scheme: light) {
    .context-menu {
        background: #fff;
        color: #333;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    }

    .context-menu>li:hover {
        background: #eee;
    }
}

@media (prefers-color-scheme: dark) {
    .context-menu {
        background: #333;
        color: #fff;
        box-shadow: 0 1px 4px rgba(256, 256, 256, 0.3);
    }

    .context-menu>li:hover {
        background: #444;
    }
}

.context-menu {
    position: absolute;
    min-width: 120px;
    border-radius: 8px;
    padding: 4px;
    font-size: 12px;
    z-index: 1;
}

.context-menu>li {
    display: flex;
    align-items: center;
    gap: 4px;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    transition: all 0.2s;
}
</style>