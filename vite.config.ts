import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            imports: ['vue', 'vue-router', 'pinia'], // 你可以根据需要添加其他库
            include: [
                /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
                /\.vue$/, /\.vue\?vue/, // .vue
                /\.md$/, // .md，如果你需要在 Markdown 文件中也使用自动导入
            ],
            dts: true, // 或者指定一个自定义路径，用于生成自动导入的类型定义文件
            resolvers: [
                ElementPlusResolver(),
        
                // Auto import icon components
                // 自动导入图标组件
                IconsResolver({
                  prefix: 'Icon',
                }),
            ]
        }),
        Components({
            resolvers: [
                ElementPlusResolver(),
                IconsResolver(),
            ],
            dts: true
        }),
        Icons({ autoInstall: true }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }

})
