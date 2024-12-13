// import { useClipboard } from '@vueuse/core'
// // #BUG: 在外部复制后, 无法写入text
// export default class Clipboard {
//     private static one: boolean = false

//     static text: Ref<string> = ref('')
//     static copy: (val: string) => void = (val) => {
//         Clipboard.text.value = val
//     }
//     constructor () {
//         if(!Clipboard.one) {
//             Clipboard.one = true
//             const {text, copy, isSupported} = useClipboard({ read: true })
//             if (isSupported.value) {
//                 Clipboard.text = text
//                 Clipboard.copy = copy
//             } else {
//                 ElMessageBox.alert('当前不支持使用系统粘贴板，将使用内置剪贴板。', '提示')
//             }
//         }
//         return Clipboard
//     }
// }

let text = ''
const Clipboard = {
    get: function (): string | Promise<string> {
        init()
        return this.get()
    },
    set: function (val: string): void | Promise<void>  {
        init()
        this.set(val)
    }
}
function init ()  {
    if (!navigator.clipboard) {
        // 提示
        console.log('当前浏览器不支持系统剪贴板，将使用内置剪贴板。')
        Clipboard.get = () => text
        Clipboard.set = (val: string) => {
            text = val
        }
    } else {
        Clipboard.get = () => navigator.clipboard.readText()
        Clipboard.set = (val: string) => navigator.clipboard.writeText(val)
    }
}

export default Clipboard