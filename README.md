# FabricEditor

项目名称：Fabric Editor
项目简介
Fabric Editor 是一个基于 fabric.js 的可交互式画布编辑器，支持多种绘图工具和功能，如辅助线、刻度尺、自定义控制器等。该项目旨在为用户提供一个强大的在线绘图工具，适用于各种图形设计和编辑需求。

主要功能
画布操作：支持鼠标滚轮缩放、拖动画布、居中显示工作区或活动对象。
辅助线：自动显示对齐线，帮助用户精确对齐对象。
刻度尺：显示刻度尺，方便用户测量和定位。
自定义控制器：自定义对象的控制点样式和行为。
复制粘贴：支持 Ctrl+C 和 Ctrl+V 快捷键复制粘贴对象。
方向控制：支持方向键移动选中的对象。
动态调整：自动调整画布大小以适应容器尺寸变化。

技术栈
前端框架： vue + TypeScript
主要库：fabric.js
构建工具：vite

项目结构
root/
├── src/
│   ├── canvas/
│   │   ├── event.ts
│   │   ├── index.ts
│   │   └── utils/
│   │       ├── AlignLine.ts
│   │       ├── control.ts
│   │       └── Ruler.ts
├── package.json
├── tsconfig.json
└── README.md
安装与运行
克隆仓库

sh

安装依赖

sh
npm install
运行项目

sh
npm start
使用说明
初始化画布

typescript
import FabricEditor from './src/canvas/index';

const editor = new FabricEditor({
    width: 800,
    height: 600,
    backgroundColor: '#f0f0f0'
});

document.body.appendChild(editor.fragment);
常用方法

centerActive(obj?: fabric.Object, animate = true): 居中显示指定对象或工作区。
bindCtrlCV(): 绑定复制粘贴快捷键。
observeElement(el: HTMLElement): 监听容器尺寸变化并调整画布大小。
事件监听

editor.on('container:resize', () => { /* 处理容器尺寸变化 */ })
贡献指南
欢迎贡献代码！请遵循以下步骤：

Fork 本仓库。
创建一个新的分支：git checkout -b feature/your-feature-name。
提交你的更改：git commit -am 'Add some feature'。
推送至你的分支：git push origin feature/your-feature-name。
提交 Pull Request。
许可证
本项目采用 MIT 许可证，详情见 LICENSE 文件。

联系方式
如有任何问题或建议，请联系 [2212617280@qq.com] 或在 GitHub 上创建 Issue。

希望你喜欢这个项目！🌟