// 控制窗口显示的状态
import { defineStore } from 'pinia'

export const useViewStore = defineStore('view', {
  // 其他配置...
    state: () => ({
        canvasWindw: false, // 调整宽高背景色
    }),
})