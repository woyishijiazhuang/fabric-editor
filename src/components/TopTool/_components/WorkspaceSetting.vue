<template>
    <div class="flex items-center flex-col justify-between cursor-pointer">
        <div class="m-auto w-full grid grid-cols-3 gap-x-4 gap-y-1">
            <label class="col-span-2 flex">
                <span class="mr-[10px]">宽: </span>
                <el-input-number class="min-w-[90px] max-w-[90px]" v-model="state.width" :min="100" :max="10000" controls-position="right" />
            </label>
            <label class="row-span-2 flex flex-col items-center gap-[10px]">
                <span>背景</span>
                <el-color-picker v-model="state.color" show-alpha />
            </label>
            <label class="col-span-2 flex">
                <span class="mr-[10px]">宽: </span>
                <el-input-number class="min-w-[90px] max-w-[90px]" v-model="state.height" :min="100" :max="10000" controls-position="right" />
            </label>
        </div>
        <!-- <span>画布</span> -->
    </div>
</template>
<script setup lang='ts'>
import FabricEditor from '@/canvas'
import { debounce } from 'lodash'

const editor = inject('editor') as FabricEditor
const state = reactive({
    width: editor.workspace.width,
    height: editor.workspace.height,
    color: editor.workspace.fill as string,
})
watch(state, debounce(() => {
    editor.workspace.set({
        width: state.width,
        height: state.height,
        fill: state.color,
    })
    editor.canvas.requestRenderAll()
}, 200),{
    deep: true
})

</script>