# 微前端qiankun之css隔离原理

## 前言

日常开发中，我们经常会遇见样式冲突的问题，尤其在多人协作开发应用时。这种冲突的发生和排查也是让开发者深感头疼。

那么像微前端这种集成多个自治的子应用的组织方式，开发人员在不过渡关注样式的情况下，框架时如何“智能”地进行样式隔离。

## qiankun中的样式隔离

通过 [qiankun](https://qiankun.umijs.org/zh/api) 文档，我们可以发现 `start` 启动方法接受这样的参数：

```
    sandbox - boolean | { strictStyleIsolation?: boolean, experimentalStyleIsolation?: boolean } - 可选，是否开启沙箱，默认为 true。
```

具体使用如下：

```js
    import {
        start
    } from 'qiankun'
    start({
        sandbox: {
            strictStyleIsolation: true,
            experimentalStyleIsolation: false
        }
    });
```

### strictStyleIsolation

严格样式隔离。这种模式下 qiankun 会将每个微应用包裹在一个 shadow dom 节点，从而确保子应用和主应用之间互不影响。

#### 源码

```js
    ...
    if (strictStyleIsolation) {
        if (!supportShadowDOM) {
            console.warn(
            '[qiankun]: As current browser not support shadow dom, your strictStyleIsolation configuration will be ignored!',
            );
        } else {
            const { innerHTML } = appElement;
            appElement.innerHTML = '';
            let shadow: ShadowRoot;

            if (appElement.attachShadow) {
                shadow = appElement.attachShadow({ mode: 'open' });
            } else {
                // createShadowRoot was proposed in initial spec, which has then been deprecated
                shadow = (appElement as any).createShadowRoot();
            }
            shadow.innerHTML = innerHTML;
        }
    }
    ...
```

从源码中可以看出来，`appElement` 创建了 `Shadow DOM`，然后把子应用挂载在 Shadow DOM 上。不管是 `link` 还是 `style`，都会在 Shadow Root 中生效。

#### 堵点问题

1. 全局ui组件样式丢失

日常开发中，开发人员经常会用到`dialog`、`alert`等ui组件。这些组件在实例化时，会将DOM添加到body元素中，而此时组件的样式却被包裹在 Shadow Root 当中，无法对外部元素（ui组件的DOM）生效，从而导致样式错乱。

**如何解决？**



### experimentalStyleIsolation

试验性样式隔离。这种模式下 qiankun 会为子应用所有的样式增加前缀（命名空间）。

#### 原理

link标签和style标签的处理存在差异。

**如果样式是link：**

```js
    import { importEntry } from 'import-html-entry';
    ...
    const { template, execScripts, assetPublicPath } = await importEntry(entry, importEntryOpts);
    ...
```

说明：html是通过 `import-html-entry` 解析的，通过debuger发现，解析后的结果没有 `link标签`，全部是 `style标签`，我们继续深入 `import-html-entry` 模块源码：

```js
    function getEmbedHTML(template, styles) {
        var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var _opts$fetch = opts.fetch,
            fetch = _opts$fetch === void 0 ? defaultFetch : _opts$fetch;
        var embedHTML = template;
        return _getExternalStyleSheets(styles, fetch).then(function (styleSheets) {
            embedHTML = styles.reduce(function (html, styleSrc, i) {
            html = html.replace(genLinkReplaceSymbol(styleSrc), "<style>/* ".concat(styleSrc, " */").concat(styleSheets[i], "</style>"));
            return html;
            }, embedHTML);
            return embedHTML;
        });
    }
    export default function importHTML(url) {
        ...
        // 获取子应用html
        return embedHTMLCache[url] || (embedHTMLCache[url] = fetch(url).then(function (response) {
            return readResAsString(response, autoDecodeResponse);
        }).then(function (html) {
            var _processTpl = processTpl(getTemplate(html), assetPublicPath),
                template = _processTpl.template,
                scripts = _processTpl.scripts,
                entry = _processTpl.entry,
                styles = _processTpl.styles;
            return getEmbedHTML(template, styles, {
                fetch: fetch
            }).then(function (embedHTML) {

            })
        })
        ...
    }
```

说明：`fetch(url)` 获取到子应用的html，如果存在 `link标签`，则通过 `fetch(href)` 获取外链样式（数据结构为字符串），然后将样式插入 `style标签` 当中，并替换掉对应的 `link标签`。

**如果样式是style：**

```js
    if (scopedCSS) {
        const attr = appElement.getAttribute(css.QiankunCSSRewriteAttr);
        if (!attr) {
            appElement.setAttribute(css.QiankunCSSRewriteAttr, appName);
        }

        const styleNodes = appElement.querySelectorAll('style') || [];
        forEach(styleNodes, (stylesheetElement: HTMLStyleElement) => {
            css.process(appElement!, stylesheetElement, appName);
        });
    }
```

说明：遍历子应用的所有style标签（包括link标签产生的style标签），然后通过css去处理标签。

```js
    export const process = (
        appWrapper: HTMLElement,
        stylesheetElement: HTMLStyleElement | HTMLLinkElement,
        appName: string,
    ): void => {
        if (!processor) {
            processor = new ScopedCSS();
        }

        ...

        if (tag && stylesheetElement.tagName === 'STYLE') {
            const prefix = `${tag}[${QiankunCSSRewriteAttr}="${appName}"]`;
            processor.process(stylesheetElement, prefix);
        }
    };
```

说明：生成后缀名，并创建 `processor` 对象，调用 `process` 给选择器添加后缀。

```js
    process(styleNode: HTMLStyleElement, prefix: string = '') {
        if (styleNode.textContent !== '') {
            const textNode = document.createTextNode(styleNode.textContent || '');
            this.swapNode.appendChild(textNode);
            const sheet = this.swapNode.sheet as any; // type is missing
            const rules = arrayify<CSSRule>(sheet?.cssRules ?? []);
            const css = this.rewrite(rules, prefix);
            // eslint-disable-next-line no-param-reassign
            styleNode.textContent = css;

            // cleanup
            this.swapNode.removeChild(textNode);
            return;
        }

        const mutator = new MutationObserver((mutations) => {
            for (let i = 0; i < mutations.length; i += 1) {
            const mutation = mutations[i];

            if (ScopedCSS.ModifiedTag in styleNode) {
                return;
            }

            if (mutation.type === 'childList') {
                const sheet = styleNode.sheet as any;
                const rules = arrayify<CSSRule>(sheet?.cssRules ?? []);
                const css = this.rewrite(rules, prefix);

                // eslint-disable-next-line no-param-reassign
                styleNode.textContent = css;
                // eslint-disable-next-line no-param-reassign
                (styleNode as any)[ScopedCSS.ModifiedTag] = true;
            }
            }
        });

        // since observer will be deleted when node be removed
        // we dont need create a cleanup function manually
        // see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/disconnect
        mutator.observe(styleNode, { childList: true });
        }

        private rewrite(rules: CSSRule[], prefix: string = '') {
        let css = '';

        rules.forEach((rule) => {
            switch (rule.type) {
            case RuleType.STYLE:
                css += this.ruleStyle(rule as CSSStyleRule, prefix);
                break;
            case RuleType.MEDIA:
                css += this.ruleMedia(rule as CSSMediaRule, prefix);
                break;
            case RuleType.SUPPORTS:
                css += this.ruleSupport(rule as CSSSupportsRule, prefix);
                break;
            default:
                css += `${rule.cssText}`;
                break;
            }
        });

        return css;
    }
```

说明：style DOM对象的sheet可以获取整个样式表。遍历样式表，对选择器进行字符串的处理，获取一个新的样式字符串 `css`（并非在遍历的过程中直接修改dom属性），再通过 `styleNode.textContent = css;` 替换掉原有的样式。如果遇见 `@media` 和 `@supports`，还需要特殊处理一下，用它们进行包裹：`@media { css }` 或 `@supports { css }`。

