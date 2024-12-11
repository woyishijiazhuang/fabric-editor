<template>
    <header class="top-menu flex items-center gap-4 p-2">
        <img class="w-[20px] h-[20px]" src="/icon.svg" />
        <el-dropdown>
            <el-link :underline="false" >文件</el-link>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item @click="exportPNG">导出 PNG</el-dropdown-item>
                    <el-dropdown-item @click="exportJSON">导出JSON</el-dropdown-item>
                    <el-dropdown-item @click="importJson">导入JSON</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        <el-dropdown>
            <el-link :underline="false" >编辑</el-link>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item @click="changeObject('up')">移至上一层</el-dropdown-item>
                    <el-dropdown-item @click="changeObject('down')">移至下一层</el-dropdown-item>
                    <el-dropdown-item @click="changeObject('top')">移至最上层</el-dropdown-item>
                    <el-dropdown-item @click="changeObject('bottom')">移至最下层</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        <el-dropdown>
            <el-link :underline="false" >查看</el-link>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item @click="editor.ruler.status ? editor.ruler.close() : editor.ruler.open()">
                        <el-icon>
                            <el-icon-select v-if="editor.ruler.status" />
                        </el-icon>
                        标尺
                    </el-dropdown-item>
                    <el-dropdown-item @click="editor.alignLine.status ? editor.alignLine.close() : editor.alignLine.open()">
                        <el-icon>
                            <el-icon-select v-if="editor.alignLine.status" />
                        </el-icon>
                        辅助线
                    </el-dropdown-item>
                    <el-dropdown-item @click="toggle">
                        <el-icon>
                            <el-icon-select v-if="isFullscreen" />
                        </el-icon>
                        全屏
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        <el-link :underline="false" >帮助</el-link>
        <el-icon class="ml-auto mr-2">
            <el-icon-setting />
        </el-icon>
    </header>
</template>

<script lang="ts" setup>
import { useFullscreen } from '@vueuse/core'
const { isFullscreen, enter, exit, toggle } = useFullscreen()

import FabricEditor from '@/canvas'
import { downloadPNG, downloadJSON, selectJSON } from '@/utils/file'

const editor = inject('editor') as FabricEditor

const exportPNG = () => {
    const dataURL = editor.canvas.toDataURL({
        width: editor.workspace.width,
        height: editor.workspace.height,
        format: 'png',
        quality: 1,
        multiplier: 1,
    })
    downloadPNG(dataURL)
}

const exportJSON = () => {
    downloadJSON(editor.canvas.toDatalessJSON(['id']))
}

const importJson = async () => {
    const json = await selectJSON()
    await editor.canvas.loadFromJSON(json)
    editor.canvas.requestRenderAll()
}

const changeObject = (type: 'up' | 'down' | 'top' | 'bottom') => {
    const activeObjects = editor.canvas.getActiveObjects()
    if (activeObjects.length === 0) return ElMessage.warning('请选择对象')
    for (const obj of activeObjects) {
        switch (type) {
            case 'up':
                editor.canvas.bringObjectForward(obj)
                break
            case 'down':
                editor.canvas.sendObjectBackwards(obj)
                break
            case 'top':
                editor.canvas.bringObjectToFront(obj)
                break
            case 'bottom':
                editor.canvas.sendObjectToBack(obj)
                break
            default:
                return
        }
    }
    editor.canvas.sendObjectToBack(editor.workspace)
    editor.canvas.requestRenderAll()
}

</script>
<style scoped>
.top-menu {
    background: #f3f3f3;
}

.el-link {
    cursor: pointer;
    --el-link-text-color: #222;
    --el-link-hover-text-color: #000;
}
</style>