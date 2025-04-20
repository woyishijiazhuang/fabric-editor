<script setup lang='ts'>
import { validateNumber, validateRange } from '@/utils/validate'
import { useViewStore } from '@/store/useViewStore'
const view = useViewStore()
const formRef = ref()
const form = reactive({
    width: 1000,
    height: 1000,
    background: '#fff',
})

const rules = {
    width: [
        { required: true, message: "请输入画布宽度", trigger: "blur" },
        { validator: validateNumber, trigger: "blur" },
        { validator: validateRange(100, 2000), trigger: "blur" },
    ],
    height: [
        { required: true, message: "请输入画布高度", trigger: "blur" },
        { validator: validateNumber, trigger: "blur" },
        { validator: validateRange(100, 2000), trigger: "blur" },
    ],
    background: [
        { required: true, message: "请输入画布背景色", trigger: "blur" },
    ],
};

const submitForm = () => {
    formRef.value!.validate((valid: boolean) => {
        if (valid) {
            // 提交表单
            console.log('提交表单', form)
        }
    })
}
const cancleForm = () => {
    formRef.value!.resetFields()
    view.canvasWindw = false
    window.focus()
}
</script>

<template>
<SuspendedWindow :model-value="view.canvasWindw" title="画布属性" width="260px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="canvas-form" >
        <el-form-item label="画布宽度" prop="width">
            <el-input-number v-model="form.width" placeholder="请输入画布宽度" />
        </el-form-item>
        <el-form-item label="画布高度" prop="height">
            <el-input-number v-model="form.height" placeholder="请输入画布高度" />
        </el-form-item>
        <el-form-item label="背景颜色" prop="background">
            <el-color-picker v-model="form.background" :show-alpha="true" />
            <!-- <span class="ml-2">{{ form.background }}</span> -->
        </el-form-item>
        <el-form-item class="!mb-0">
            <el-button class="ml-auto" @click="cancleForm">取消</el-button>
            <el-button type="primary" @click="submitForm">提交</el-button>
        </el-form-item>
    </el-form>
</SuspendedWindow>
</template>

<style>

</style>