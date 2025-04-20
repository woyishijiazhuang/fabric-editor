<script setup lang='ts'>
import { useZIndex } from 'element-plus'
import { useTemplateRef } from 'vue'
defineProps({
    title: {
        type: String,
        default: '',
    },
    width: {
        type: String,
        default: 'auto'
    }
    // position: {
    //     type: String, // 'left' | 'right' | 'top' | 'bottom' | 'center'
    //     default: 'center',
    // }
})
const visbile = defineModel({
    type: Boolean,
    required: true,
})
const zIndex = useZIndex()
const draggableRef = useTemplateRef<HTMLElement>('draggableRef')
// 首次不渲染
const neverDisplayed = ref(true)
const onceWatch = watch(visbile, (val) => {
    if (val) {
        neverDisplayed.value = false
        nextTick(() => {
            onceWatch()
            if (draggableRef.value) {
                const { left, top, width, height } = draggableRef.value.getBoundingClientRect()
                draggableRef.value.style.left = `${left - width / 2}px`
                draggableRef.value.style.top = `${top - height / 2}px`
            }
        })
    }
}, { immediate: true })

const mousedown = (e: MouseEvent) => {
    if (e.button !== 0) return; // 只处理左键点击
    e.preventDefault() // 阻止默认事件，避免选中元素
    const left = draggableRef.value!.offsetLeft - e.x
    const top = draggableRef.value!.offsetTop - e.y
    // @ts-ignore
    draggableRef.value!.style.zIndex = zIndex.nextZIndex()
    var mouseMoveFun: any = null;
    document.addEventListener('mousemove', mouseMoveFun = (event: MouseEvent) => {
        // 拒绝鼠标移动到web页面外部
        if (window.innerHeight < event.y
        || window.innerWidth < event.x
        || 0 > event.x || 0 > event.y) {
            // document.removeEventListener('mousemove', mouseMoveFun)
            return 0
        }
        draggableRef.value!.style.left = `${left + event.x}px`
        draggableRef.value!.style.top = `${top + event.y}px`
    })
    document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', mouseMoveFun)
    }, { once: true })
}
</script>
<!-- 制作一个悬浮窗 -->
<template>
    <Teleport v-if="!neverDisplayed" to="body">
        <div ref="draggableRef" v-show="visbile"
            :style="{width: width}"
            class="suspended-window center-position fixed bg-[#FFF] select-none p-4 border shadow rounded">
            <header class="flex items-center justify-between mb-4">
                <div class="cursor-move flex-1" @mousedown="mousedown">
                    {{ title }}
                </div>
                <el-icon @click="visbile = false" class="cursor-pointer">
                    <el-icon-close />
                </el-icon>
            </header>
            <div>
                <slot></slot>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.center-position {
    top: 50%;
    left: 50%;
}
</style>