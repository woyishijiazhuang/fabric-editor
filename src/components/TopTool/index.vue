<script setup lang='ts'>
const state = reactive({
    mode: 'select',
    color: '#000'
})

</script>

<template>
    <div class="top-tool flex items-stretch flex-1 py-[5px] px-[20px] gap-[20px]">
        <div class="flex items-center flex-col justify-between w-[50px] cursor-pointer">
            <div class="m-auto w-[24px] h-[24px] border border-dashed border-current"></div>
            <span>选择</span>
        </div>
        <el-divider direction="vertical" />
        <WorkspaceSetting />
        <el-divider direction="vertical" />
        <div class="flex items-center flex-col justify-between cursor-pointer">
            <div class="m-auto w-full grid grid-cols-3 gap-[4px] px-[4px]">
                <el-icon v-for="i in 5" :size="18">
                    <el-icon-Picture :data-index="i" />
                </el-icon>
            </div>
            <span>工具</span>
        </div>
        <el-divider direction="vertical" />
        <div class="flex items-center flex-col justify-between w-[50px] cursor-pointer">
            <el-icon class="m-auto" :size="24">
                <el-icon-EditPen />
            </el-icon>
            <span>画笔</span>
        </div>
        <el-divider direction="vertical" />
        <div class="flex items-center flex-col justify-between cursor-pointer">
            <div class="m-auto w-full grid grid-cols-6 gap-[4px] py-[3px] border px-[4px] rounded">
                <el-icon v-for="i in 12" :size="18">
                    <el-icon-Picture :data-index="i" />
                </el-icon>
            </div>
            <span>形状</span>
        </div>
        <el-divider direction="vertical" />
        <ColorPicker v-model="state.color" />
        <el-divider direction="vertical" />
        <!-- <el-input v-model="state.mode"></el-input> -->
    </div>
</template>

<style>
.top-tool {
    font-size: 12px;
    border-bottom: 1px solid #f7f7f7;
    /* box-shadow: inset 0 -1px 0 #f3f3f3; */
}

.el-divider--vertical {
    height: 50px;
    /* margin-top: 5px; */
}
</style>