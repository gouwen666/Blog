# babel之配置

babel如何运行，依赖开发人员事先定义好的规则，也就是babel的配置文件。

本篇将会整理出文档中那些看不到的疑问点：

## presets和plugins

babel是建立在 `插件` 之外的，所有的 `编译` 都是通过插件完成的。

`presets` 的配置项是插件的集合，包含着一组插件。
`plugins` 是配置项是单个的插件，包含着一个插件。

如果没有配置 `presets`，我们可以将 `presets` 包含的插件配置到 `plugins` 中，也能达到同样的编译效果。

官方提供的preset和plugin在[这里](https://old.babeljs.cn/docs/plugins/)。

### 访问顺序

1. Plugin 会运行在 Preset 之前。
2. Plugin 会从前往后顺序执行。
3. Preset 会从后往前顺序执行。


