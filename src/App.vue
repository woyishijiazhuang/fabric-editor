<template>
    <el-config-provider size="small" :message="{ duration: 2000 }">
        <div class="canvas_app">
            <div class="control_panel">
                <TopMenu />
                <el-scrollbar>
                    <TopTool />
                </el-scrollbar>
            </div>
            <div ref="containerRef" class="fabric_container tbackground">
                <ContextMenu />
            </div>
            <FloatWindow />
        </div>
    </el-config-provider>
</template>
<script setup lang="ts">
import * as fabric from 'fabric'
import FabricEditor from '@/canvas'

var editor = new FabricEditor({
    width: window.innerWidth,
    height: window.innerHeight - 120,
})
provide('editor', editor)

const containerRef = ref<HTMLElement | null>(null)
onMounted(() => {
    containerRef.value!.appendChild(editor.fragment)
    editor.observeElement(containerRef.value!)
    editor.canvas.add(new fabric.Rect({
        width: 100,
        height: 100,
        fill: 'red',
        strokeWidth: 0,
    }))
})
onUnmounted(() => {
    editor.destoryAll()
})
// const down = () => {
//     editor.canvas.add(new fabric.Rect({
//         width: 100,
//         height: 100,
//         fill: '#00f',
//         // selectable: false,
//     }))
//     ElMessage.success('添加成功')
// }
</script>
<style scoped>
.canvas_app {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.control_panel {
    display: flex;
    flex-direction: column;
}

.fabric_container {
    overflow: hidden;
    flex: 1;
    position: relative;
}

.tbackground {
    background-position: 0 0, 5px 5px !important;
    background-size: 10px 10px !important;
}
@media (prefers-color-scheme: light) {
    .tbackground {
        background-image: linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee 100%), linear-gradient(45deg, #eee 25%, #fff 25%, #fff 75%, #eee 75%, #eee 100%) !important;
    }
}
@media (prefers-color-scheme: dark) {
    .tbackground {
        background-image: linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%, #333 100%), linear-gradient(45deg, #333 25%, #444 25%, #444 75%, #333 75%, #333 100%) !important;
    }
}
</style>
