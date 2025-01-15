<template>
    <div class="flex flex-col items-center">
        <div class="flex-1 w-full flex gap-[4px]">
            <div class="flex flex-col justify-center gap-[10px]">
                <div @click="selectColor('#000', -1)" :style="selectIndex == -1 ? 'transform: scale(1.4)' : ''" class="w-[16px] h-[16px] bg-[#000] rounded-[50%] shadow-[0_0_2px_#222] cursor-pointer"></div>
                <div @click="selectColor('#FFF', -2)" :style="selectIndex == -2 ? 'transform: scale(1.4)' : ''" class="w-[16px] h-[16px] bg-[#FFF] rounded-[50%] shadow-[0_0_2px_#222] cursor-pointer"></div>
            </div>
            <div class="grid grid-cols-[repeat(9,1fr)] gap-x-[6px] mx-[10px] items-center">
                <div v-for="color,i in colorList" :key="i" @click="selectColor(color, i)" :style="`background-color: ${color};` + (selectIndex == i ? 'transform: scale(1.3)' : '')"
                    class="w-[12px] h-[12px] rounded-[50%] shadow-[0_0_2px_#222] cursor-pointer">
                </div>
            </div>
            <div class="flex items-center">
                <el-color-picker v-model="value" class="w-[40px] h-[40px]" :disabled="selectIndex < 0" show-alpha @change="changeColor"></el-color-picker>
            </div>
        </div>
        <span>颜色</span>
    </div>
</template>
<script setup lang='ts'>
import { useLocalStorage } from '@vueuse/core';

const value = defineModel({
    type: String,
    default: '#000000'
})
const selectIndex = ref(-1)
const colorList = useLocalStorage('color-picker-list', [
    "#87CEEB",
    "#4682B4",
    "#90EE90",
    "#FFA500",
    "#FFD700",
    "#FFE4B5",
    "#800080",
    "#FF00FF",
    "#FF69B4",
    "#32CD32",
    "#98FB98",
    "#00FF00",
    "#E6E6FA",
    "#DDA0DD",
    "#00008B",
    "#B0C4DE",
    "#ADFF2F",
    "#FFFFFF",
    "#D3D3D3",
    "#ADD8E6",
    "#E0FFFF",
    "#FFB6C1",
    "#FF4500",
    "#FFA07A",
    "#00BFFF",
    "#F0FFFF",
    "#4B0082"
])
const selectColor = (color: string, index: number) => {
    value.value = color
    selectIndex.value = index
}
const changeColor = (color: string | null) => {
    if (!color) return
    value.value = color
    colorList.value[selectIndex.value] = color
}
</script>