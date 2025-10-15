---
title: Hexo Fluid主题美化
abbrlink: fb017dd0
date: 2024-09-05 22:00:56
tags:
---

<meta name = "referrer", content = "no-referrer"/>

Fluid主题的简洁和优雅，在第一次见到时就给我留下了很深的印象，自此我也决定建设自己的博客，记录学习中的点点滴滴。

本篇博客记录建站过程中对Fluid主题细节的美化，之后的修改也会记录其中。

## 修改博客字体

本博客使用的是：霞鹜文楷，其他字体可从[中文网字计划](https://chinese-font.netlify.app/zh-cn/)中挑选。

具体步骤如下:

1. 修改`themes/fluid/layout/_partial/head.ejs`，通过链接方式引入

   ```html
   <link rel='stylesheet' href='https://chinese-fonts-cdn.deno.dev/packages/lxgwwenkai/dist/LXGWWenKai-Regular/result.css' /> 
   ```

2. 在`source/css`目录下新建`font.css`

   ```css
   html, body, .markdown-body, p {
     font-family: 'LXGW WenKai';
   }
   ```

3. 修改`_config.fluid.yml`，引入css文件并设置字体

   ```yaml
   # 主题字体配置
   # Font
   font:
     font_size: 20px
     font_family: "LXGW WenKai"
     letter_spacing: 0.02em
     code_font_size: 85%
     
   #引入css文件  
   custom_css:
     - /css/font.css
   ```

## 文章顶部添加波浪效果

参考了以下两篇博客，在原有的基础上修改了`light`和`dark`两种模式下波浪的颜色，使之与Fluid主题完美融合。

- [首屏图片添加上升气泡特效](https://blog.kevinchu.top/2023/07/17/hexo-theme-fluid-modify/#10-%E9%A6%96%E5%B1%8F%E5%9B%BE%E7%89%87%E6%B7%BB%E5%8A%A0%E4%B8%8A%E5%8D%87%E6%B0%94%E6%B3%A1%E7%89%B9%E6%95%88)
- [butterfly文章顶部添加波浪效果](https://blog.anheyu.com/posts/98c4.html)



1. 修改`博客\node_modules\hexo-theme-fluid\layout\_partials\header` 下的`banner.ejs`，

   在`<div class="full-bg-img">` 标签中添加如下代码：

   ```ejs
   <section class="main-hero-waves-area waves-area">
       <!-- 定义 SVG 图形 -->
       <svg class="waves-svg" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" 
            viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
           <!-- 定义波浪的路径 -->
           <defs>
               <path id="gentle-wave" d="M -160 44 c 30 0 58 -18 88 -18 s 58 18 88 18 s 58 -18 88 -18 s 58 18 88 18 v 44 h -352 Z"></path>
           </defs>
           <!-- 使用分组实现多层波浪 -->
           <g class="parallax">
               <use href="#gentle-wave" x="48" y="0"></use>
               <use href="#gentle-wave" x="48" y="3"></use>
               <use href="#gentle-wave" x="48" y="5"></use>
               <use href="#gentle-wave" x="48" y="7"></use>
           </g>
       </svg>
   </section>  
   ```

   ![](https://gitee.com/cmyk359/img/raw/master/img/image-20250330221016250-2025-3-3022:10:33.png)

2. 在`博客\source\css`下，添加`wave.css`文件

   {%spoiler wave.css%}

   ```css
   /* 波浪css */
   .main-hero-waves-area {
       width: 100%;
       position: absolute;
       left: 0;
       bottom: -11px;
       z-index: 5;
   }
   
   .waves-area .waves-svg {
       width: 100%;
       height: 5rem;
   }
   
   /* Animation */
   
   .parallax>use {
       animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
   }
   
   .parallax>use:nth-child(1) {
       animation-delay: -2s;
       animation-duration: 7s;
       fill: #f7f9febd;
   }
   
   .parallax>use:nth-child(2) {
       animation-delay: -3s;
       animation-duration: 10s;
       fill: #f7f9fe82;
   }
   
   .parallax>use:nth-child(3) {
       animation-delay: -4s;
       animation-duration: 13s;
       fill: #f7f9fe36;
   }
   
   .parallax>use:nth-child(4) {
       animation-delay: -5s;
       animation-duration: 20s;
       /* fill: #f7f9fe; */
       fill: #EEEEEE
   }
   
   /* 黑色模式背景 */
   [data-user-color-scheme="dark"] .parallax>use:nth-child(1) {
       animation-delay: -2s;
       animation-duration: 7s;
       fill: #18171dc8;
   }
   
   [data-user-color-scheme="dark"] .parallax>use:nth-child(2) {
       animation-delay: -3s;
       animation-duration: 10s;
       fill: #18171d80;
   }
   
   [data-user-color-scheme="dark"] .parallax>use:nth-child(3) {
       animation-delay: -4s;
       animation-duration: 13s;
       fill: #18171d3e;
   }
   
   [data-user-color-scheme="dark"] .parallax>use:nth-child(4) {
       animation-delay: -5s;
       animation-duration: 20s;
       fill: #181C27;
   }
   
   @keyframes move-forever {
       0% {
           transform: translate3d(-90px, 0, 0);
       }
   
       100% {
           transform: translate3d(85px, 0, 0);
       }
   }
   
   /*Shrinking for mobile*/
   @media (max-width: 768px) {
       .waves-area .waves-svg {
           height: 40px;
           min-height: 40px;
       }
   }
   ```

   {%endspoiler%}

3. 在`_config.fluid.yml`中引入该css文件

   ![](https://gitee.com/cmyk359/img/raw/master/img/image-20250330221355083-2025-3-3022:13:56.png)

## 内容折叠

有时代码内容很长直接贴出来很影响观感，而Fluid主题本身没有代码折叠功能，需要借助插件实现该功能。

此处推荐：[hexo-sliding-spoiler](https://github.com/fletchto99/hexo-sliding-spoiler)，它不仅能折叠代码，还能在其中编写markdown内容。

插件安装：

```bash
npm install hexo-sliding-spoiler --save
```

修改样式，找到`hexo\node_modules\hexo-sliding-spoiler\assets\spoiler.css`，用我的样式替换：

{%spoiler spoiler.css%}

```css
.spoiler {
    margin: 10px 0;
    padding: 0;
     /* 改为淡紫色边框 */
    border: 1px solid #ede7ff;
    position: relative;
    clear: both;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    background: white;
    transition: all 0.3s ease;
}

.spoiler:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.spoiler .spoiler-title {
    /* 改为淡紫色背景 */
    background: #f8f5ff;
    margin: 0;
    padding: 18px 24px;
    color: #2c3e50;
    font-weight: bold;
    font-size: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 12px 12px 0 0;
    /* 改为淡紫色边框 */
    border-bottom: 1px solid #ede7ff;
}

.spoiler.collapsed .spoiler-title {
    border-radius: 12px;
    border-bottom: none;
}

.spoiler .spoiler-title:hover {
    /* 改为悬停时的淡紫色背景 */
    background: #f1ebff;
}

.spoiler .spoiler-title::after {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    /* 改为紫色箭头 */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%237a6ab0'%3E%3Cpath d='M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.spoiler.collapsed .spoiler-title::after {
    transform: rotate(-90deg);
}

.spoiler .spoiler-content {
    padding: 0;
    margin: 0;
    background: white;
    border-radius: 0 0 12px 12px;
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    transition:
        max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.3s ease,
        padding 0.3s ease;
}

.spoiler.collapsed .spoiler-content {
    max-height: 0;
    opacity: 0;
    padding: 0 24px;
}

.spoiler.expanded .spoiler-content {
    max-height: 3000px;
    opacity: 1;
    padding: 24px;
    transition:
        max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.4s ease 0.1s,
        padding 0.3s ease;
}

.spoiler .spoiler-content p:first-child {
    margin-top: 0 !important;
}
```

{%endspoiler%}

使用方法：与Fluid的tag插件的使用方法类似

```bash
{%spoiler 标题%}
	折叠的内容....
{%endspoiler%}
```



{%note warning%}

它语法好像会和另一个插件：[hexo-spoiler](https://github.com/unnamed42/hexo-spoiler)冲突。如果两个都要用的话，前者可用[hexo-fold](https://github.com/AimTao/hexo-fold)替换，具体使用方法看它的说明，我懒得换了😅。

{%endnote%}

## 添加预加载页面

由于我的博客添加了看板娘，它的模型文件较大，页面文件加载时会卡住，当模型加载成功后才能正常浏览。故打算添加一个预加载动画，在模型加载过程中显示该动画，加载成功后淡出。

如果也有类似的需求，可以参考以下方法添加一个预加载动画，提升浏览体验。

可以从[uiverse](https://uiverse.io/loaders)这个网站中选取一个你喜欢的加载动画，它提供了这个动画的html、css和js文件。现在以[这个动画](https://uiverse.io/vinodjangid07/popular-owl-27)为例。

![](https://gitee.com/cmyk359/img/raw/master/img/PixPin_2025-03-30_23-00-22-2025-3-3023:02:09.gif)

1. 在`博客\source`目录下，新建一个`html`文件夹，在其中添加一个`loader.html`文件。

   首先编辑该文件，在其中添加一个id为`loader-container`的标签

   ```html
   <div id="loader-container">
   </div>
   ```

   然后，从网站中拷贝这个动画对应的html代码，添加到上面标签的内部，最终完整html代码如下。如果选择了其他动画，操作亦同。

   {%spoiler 完整的HTML代码%}

   ```html
   <div id="loader-container">
       <div class="loader">
           <div class="truckWrapper">
               <div class="truckBody">
                   <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 198 93"
                        class="trucksvg"
                        >
                       <path
                             stroke-width="3"
                             stroke="#282828"
                             fill="#F83D3D"
                             d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z"
                             ></path>
                       <path
                             stroke-width="3"
                             stroke="#282828"
                             fill="#7D7C7C"
                             d="M146 33.5H181.741C182.779 33.5 183.709 34.1415 184.078 35.112L190.538 52.112C191.16 53.748 189.951 55.5 188.201 55.5H146C144.619 55.5 143.5 54.3807 143.5 53V36C143.5 34.6193 144.619 33.5 146 33.5Z"
                             ></path>
                       <path
                             stroke-width="2"
                             stroke="#282828"
                             fill="#282828"
                             d="M150 65C150 65.39 149.763 65.8656 149.127 66.2893C148.499 66.7083 147.573 67 146.5 67C145.427 67 144.501 66.7083 143.873 66.2893C143.237 65.8656 143 65.39 143 65C143 64.61 143.237 64.1344 143.873 63.7107C144.501 63.2917 145.427 63 146.5 63C147.573 63 148.499 63.2917 149.127 63.7107C149.763 64.1344 150 64.61 150 65Z"
                             ></path>
                       <rect
                             stroke-width="2"
                             stroke="#282828"
                             fill="#FFFCAB"
                             rx="1"
                             height="7"
                             width="5"
                             y="63"
                             x="187"
                             ></rect>
                       <rect
                             stroke-width="2"
                             stroke="#282828"
                             fill="#282828"
                             rx="1"
                             height="11"
                             width="4"
                             y="81"
                             x="193"
                             ></rect>
                       <rect
                             stroke-width="3"
                             stroke="#282828"
                             fill="#DFDFDF"
                             rx="2.5"
                             height="90"
                             width="121"
                             y="1.5"
                             x="6.5"
                             ></rect>
                       <rect
                             stroke-width="2"
                             stroke="#282828"
                             fill="#DFDFDF"
                             rx="2"
                             height="4"
                             width="6"
                             y="84"
                             x="1"
                             ></rect>
                   </svg>
               </div>
               <div class="truckTires">
                   <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 30 30"
                        class="tiresvg"
                        >
                       <circle
                               stroke-width="3"
                               stroke="#282828"
                               fill="#282828"
                               r="13.5"
                               cy="15"
                               cx="15"
                               ></circle>
                       <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
                   </svg>
                   <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 30 30"
                        class="tiresvg"
                        >
                       <circle
                               stroke-width="3"
                               stroke="#282828"
                               fill="#282828"
                               r="13.5"
                               cy="15"
                               cx="15"
                               ></circle>
                       <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
                   </svg>
               </div>
               <div class="road"></div>
   
               <svg
                    xml:space="preserve"
                    viewBox="0 0 453.459 453.459"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    xmlns="http://www.w3.org/2000/svg"
                    id="Capa_1"
                    version="1.1"
                    fill="#000000"
                    class="lampPost"
                    >
                   <path
                         d="M252.882,0c-37.781,0-68.686,29.953-70.245,67.358h-6.917v8.954c-26.109,2.163-45.463,10.011-45.463,19.366h9.993
                            c-1.65,5.146-2.507,10.54-2.507,16.017c0,28.956,23.558,52.514,52.514,52.514c28.956,0,52.514-23.558,52.514-52.514
                            c0-5.478-0.856-10.872-2.506-16.017h9.992c0-9.354-19.352-17.204-45.463-19.366v-8.954h-6.149C200.189,38.779,223.924,16,252.882,16
                            c29.952,0,54.32,24.368,54.32,54.32c0,28.774-11.078,37.009-25.105,47.437c-17.444,12.968-37.216,27.667-37.216,78.884v113.914
                            h-0.797c-5.068,0-9.174,4.108-9.174,9.177c0,2.844,1.293,5.383,3.321,7.066c-3.432,27.933-26.851,95.744-8.226,115.459v11.202h45.75
                            v-11.202c18.625-19.715-4.794-87.527-8.227-115.459c2.029-1.683,3.322-4.223,3.322-7.066c0-5.068-4.107-9.177-9.176-9.177h-0.795
                            V196.641c0-43.174,14.942-54.283,30.762-66.043c14.793-10.997,31.559-23.461,31.559-60.277C323.202,31.545,291.656,0,252.882,0z
                            M232.77,111.694c0,23.442-19.071,42.514-42.514,42.514c-23.442,0-42.514-19.072-42.514-42.514c0-5.531,1.078-10.957,3.141-16.017
                            h78.747C231.693,100.736,232.77,106.162,232.77,111.694z"
                         ></path>
               </svg>
           </div>
       </div>
   </div>
   
   ```

   {%endspoiler%}

   

2. 在`博客\source\css`目录下（没有就新建一个），新建`loader.css`文件

   首先在其中添加如下内容：

   ```css
   #loader-container {
       display: flex;
       /* 使用 flexbox 居中 */
       position: fixed;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
       background-color: rgba(232, 232, 232, 1);
       /* 半透明背景 */
       justify-content: center;
       /* 水平居中 */
       align-items: center;
       /* 垂直居中 */
       z-index: 9999;
       /* 确保在最上层 */
   }
   ```

   再从网站中拷贝该动画对应的css代码，添加到css文件中，完整代码如下：

   {%spoiler 完整的css代码%}

   ```css
   #loader-container {
       display: flex;
       /* 使用 flexbox 居中 */
       position: fixed;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
       background-color: rgba(232, 232, 232, 1);
       /* 半透明背景 */
       justify-content: center;
       /* 水平居中 */
       align-items: center;
       /* 垂直居中 */
       z-index: 9999;
       /* 确保在最上层 */
   }
   
   /* From Uiverse.io by vinodjangid07 */
   .loader {
       width: fit-content;
       height: fit-content;
       display: flex;
       align-items: center;
       justify-content: center;
   }
   
   .wrapper {
       width: fit-content;
       height: fit-content;
       display: flex;
       flex-direction: column;
       justify-content: center;
       align-items: center;
   }
   
   .catContainer {
       width: 100%;
       height: fit-content;
       display: flex;
       align-items: center;
       justify-content: center;
       position: relative;
   }
   
   .catbody {
       width: 80px;
   }
   
   .tail {
       position: absolute;
       width: 17px;
       top: 50%;
       animation: tail 0.5s ease-in infinite alternate-reverse;
       transform-origin: top;
   }
   
   @keyframes tail {
       0% {
           transform: rotateZ(60deg);
       }
   
       50% {
           transform: rotateZ(0deg);
       }
   
       100% {
           transform: rotateZ(-20deg);
       }
   }
   
   .wall {
       width: 300px;
   }
   
   .text {
       display: flex;
       flex-direction: column;
       width: 50px;
       position: absolute;
       margin: 0px 0px 100px 120px;
   }
   
   .zzz {
       color: black;
       font-weight: 700;
       font-size: 15px;
       animation: zzz 2s linear infinite;
   }
   
   .bigzzz {
       color: black;
       font-weight: 700;
       font-size: 25px;
       margin-left: 10px;
       animation: zzz 2.3s linear infinite;
   }
   
   @keyframes zzz {
       0% {
           color: transparent;
       }
   
       50% {
           color: black;
       }
   
       100% {
           color: transparent;
       }
   }
   ```

   

   {%endspoiler%}

   

3. 在`博客\source\js`目录下（没有就新建一个），新建一个`loader.js`文件

   如果使用`windos.onload`方法等待页面所有资源加载完成后退出动画，就必须保证页面的资源是可用的，尤其是保证所使用的外部链接有效。若因为资源无效导致，页面资源无法加载完成，那么动画就会一直存在，无法退出。

   因此，我在此处使用了一个定时器，4s后自动退出动画（具体时间可以自己设置），4s的时间够加载大部分的页面资源了。

   ```java
   function loadScript(url, callback) {
       const script = document.createElement('script');
       script.type = 'text/javascript';
       script.src = url;
       
       //设置定时器，4s后自动退出预加载动画
   	const timeoutId = setTimeout(callback,4000);
       
       //页面内容都加载完成后，执行callback方法退出动画
       // window.onload = function() {
       //     callback();
       // };
   
       document.head.appendChild(script);
   }
   
   // 加载 jQuery
   loadScript('https://code.jquery.com/jquery-3.6.0.min.js', function() {
       $(function(){
           $("#loader-container").fadeOut(560);
       });
   });
   
   ```

4. 在`博客\scripts`目录下，新建一个`loader_inject.js`，将动画的html注入到所有页面的`body`标签开始位置

   ```js
   hexo.extend.filter.register('theme_inject', function (injects) {
   
       // 页面加载动画  
       injects.bodyBegin.file('loader', 'source/html/loader.html');
   
   });
   ```

5. 在`_config.fluid.yml`中引入 `loader.css`和 `loader.js`

   ![](https://gitee.com/cmyk359/img/raw/master/img/image-20250330233123075-2025-3-3023:31:25.png)

## Twikoo 评论气泡样式

在`博客\source\css`目录下，新建` twikoo_beautify.css`，

{% spoiler  "twikoo_beautify.css"%}

```css
/* 自定义twikoo评论输入框高度 */
.tk-input[data-v-619b4c52] .el-textarea__inner {
    height: 130px !important;
}

/* 输入评论时自动隐藏输入框背景图片 */
.tk-input[data-v-619b4c52] .el-textarea__inner:focus {
    background-image: none !important;
}

/* 调整楼中楼样式 ，整体左移，贴合气泡化效果 */
.tk-replies {
    left: -70px;
    width: calc(100% + 70px);
}

/* 头像宽度调整 rem单位与全局字体大小挂钩，需配合自己情况调整大小以保证头像显示完整*/
.tk-replies .tk-avatar {
    width: 2.5rem !important;
    height: 2.5rem !important;
}

.tk-replies .tk-avatar img {
    width: 2.5rem !important;
    height: 2.5rem !important;
}

/* 回复框左移，避免窄屏时出框 */
.tk-comments-container .tk-submit {
    position: relative;
    left: -70px;
}

/* 评论块气泡化修改 */
.tk-content {
    background: #00a6ff;
    /*默认模式访客气泡配色*/
    padding: 10px;
    color: #fff;
    /*默认模式访客气泡字体配色*/
    border-radius: 10px;
    font-size: 16px !important;
    width: fit-content;
    max-width: 100%;
    position: relative !important;
    overflow: visible !important;
    max-height: none !important;
}

/* 修复图片出框 */
.tk-content img {
    max-width: 100% !important;
}

/* 修复过长文本出框 */
.tk-content pre {
    white-space: pre-wrap;
    word-wrap: break-word;
}

.tk-content a {
    color: #eeecaa;
    /*默认模式超链接配色*/
}

.tk-content::before {
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    top: 20px;
    left: -13px;
    border-top: 2px solid transparent;
    border-bottom: 20px solid transparent;
    border-right: 15px solid #00a6ff;
    /*默认模式访客气泡小三角配色*/
    border-left: 0px solid transparent;
}

.tk-master .tk-content {
    background: #ff8080;
    /*默认模式博主气泡配色*/
    color: #fff;
    /*默认模式博主气泡字体配色*/
    width: fit-content;
    max-width: 100%;
}

.tk-master .tk-content a {
    color: #eeecaa;
}

.tk-master .tk-content::before {
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    top: 20px;
    left: -13px;
    border-top: 2px solid transparent;
    border-bottom: 20px solid transparent;
    border-right: 15px solid #ff8080;
    /*默认模式博主气泡小三角配色*/
    border-left: 0px solid transparent;
}

.tk-row[data-v-d82ce9a0] {
    max-width: 100%;
    width: fit-content;
}

.tk-avatar {
    border-radius: 50%;
    margin-top: 10px;
}

/* 夜间模式配色，具体比照上方默认模式class */
[data-user-color-scheme="dark"] .tk-content {
    background: #000;
    color: #fff;
}

[data-user-color-scheme="dark"] .tk-content a {
    color: #dfa036;
}

[data-user-color-scheme="dark"] .tk-content::before {
    border-right: 15px solid #000;
}

[data-user-color-scheme="dark"] .tk-master .tk-content {
    background: #000;
    color: #fff;
}

[data-user-color-scheme="dark"] .tk-master .tk-content a {
    color: #dfa036;
}

[data-user-color-scheme="dark"] .tk-master .tk-content::before {
    border-top: 2px solid transparent;
    /* 顶部透明边框，保持不变 */
    border-bottom: 20px solid transparent;
    /* 底部透明边框，保持不变 */
    border-left: 15px solid #000;
    /* 左侧边框变为可见，颜色为蓝色 */
    border-right: 0 solid transparent;
    /* 右侧边框变为透明 */

}

/* 自适应内容 */
@media screen and (min-width: 1024px) {

    /* 设置宽度上限，避免挤压博主头像 */
    .tk-content {
        max-width: 75%;
        width: fit-content;
    }

    .tk-master .tk-content {
        width: 75%;
    }

    .tk-master .tk-content::before {
        left: 100%;
        border-left: 15px solid #ff8080;
        border-right: 0px solid transparent;
    }

    .tk-master .tk-avatar {
        position: relative;
        left: calc(75% + 70px);
    }

    .tk-master .tk-row[data-v-d82ce9a0] {
        position: relative;
        top: 0px;
        left: calc(75% - 230px);
    }

    [data-theme="dark"] .tk-master .tk-content::before {
        border-left: 15px solid #000;
        border-right: 0px solid transparent;
    }
}

/* 设备名称常态隐藏，悬停评论时显示 */
.tk-extras {
    opacity: 0;
    -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
    filter: alpha(opacity=0);
}

.tk-content:hover+.tk-extras {
    -webkit-animation: tk-extras-fadeIn 0.5s linear;
    -moz-animation: tk-extras-fadeIn 0.5s linear;
    -o-animation: tk-extras-fadeIn 0.5s linear;
    -ms-animation: tk-extras-fadeIn 0.5s linear;
    animation: tk-extras-fadeIn 0.5s linear;
    -webkit-animation-fill-mode: forwards;
    -moz-animation-fill-mode: forwards;
    -o-animation-fill-mode: forwards;
    -ms-animation-fill-mode: forwards;
    animation-fill-mode: forwards;
}

@-moz-keyframes tk-extras-fadeIn {
    from {
        opacity: 0;
        -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
        filter: alpha(opacity=0);
    }

    to {
        opacity: 1;
        -ms-filter: none;
        filter: none;
    }
}

@-webkit-keyframes tk-extras-fadeIn {
    from {
        opacity: 0;
        -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
        filter: alpha(opacity=0);
    }

    to {
        opacity: 1;
        -ms-filter: none;
        filter: none;
    }
}

@-o-keyframes tk-extras-fadeIn {
    from {
        opacity: 0;
        -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
        filter: alpha(opacity=0);
    }

    to {
        opacity: 1;
        -ms-filter: none;
        filter: none;
    }
}

@keyframes tk-extras-fadeIn {
    from {
        opacity: 0;
        -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
        filter: alpha(opacity=0);
    }

    to {
        opacity: 1;
        -ms-filter: none;
        filter: none;
    }
}
```

{% endspoiler%}

然后，在`_config.fluid.yml`中引入该文件

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250331221920222-2025-3-3122:19:31.png" style="zoom:80%;" />

## 添加说说页面

初衷是想在博客添加相册功能，后来希望同时可以添加一些文字，这就和朋友圈有点像了。最终方案是使用[memos](https://www.usememos.com/)备忘录发布说说，最后通过api读取其信息加载到hexo页面。

主要参考了雨月的[自建！Memos服务：碎片化笔记+博客说说栏，一栈双用－雨月空间站](https://www.mintimate.cn/2025/06/29/baseMemosBB/#)，但是最终的瀑布流布局与我的预期效果不符，每个卡片宽度太小，字一多就成了长条，而且文字格式丢失；当有较多图片和视频时，无法折叠显示。所以，我修改了一下让每条消息以大卡片样式展示，保留了文字格式，添加了媒体折叠展示，优化了媒体文件加载的性能。

### memos服务搭建

Memos 是一款非常轻量的自托管的备忘录中心，支持多端和多账户，很适合用于一个轻量级的说说栏。

首先，需要有**云服务器**，此处使用docker将memos部署在云服务器。如果没有的话，好像还可以使用[replit](https://replit.com/)免费部署。

1、云服务器上安装docker，可以参考[ Docker安装与配置](https://catpaws.top/f5f9fa9b/#docker安装与配置)

***

2、使用dockerfile部署

创建文件夹保存memos数据文件

```bash
mkdir /dockerData/memos/data
```

在memos目录下创建docker-compose.yml，内容如下：

```yml
services:
  memos:
    image: neosmemo/memos:latest
    container_name: memos
    restart: unless-stopped
    ports:
      - "5230:5230"
    volumes:
      - /dockerData/memos/data:/var/opt/memos
    environment:
      - MEMOS_MODE=prod
      - MEMOS_PORT=5230
```

使用`docker compose up -d`上线服务，访问 服务器ip:5230，即可看到 Memos 的登录页面，注册登录后发布个说说测试一下。

**注：api仅能读取权限为public类型的消息**，可在Settings->Memo->Default memo visibility 将发布的消息权限默认修改为public。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250825112737284-2025-8-2511:28:17.png" style="zoom:80%;" />

***

3、设置memos文件存储

memos默认使用sqlite数据库存储文本和媒体文件。如果你的服务器带宽不是很理想，图片视频大文件加载将十分缓慢。因此对于图片视频使用云存储服务，提高加载速度。memos支持**Amazon S3**、**MinIO**，还有其他任何支持S3的云存储服务，具体见[官方文档](https://www.usememos.com/docs/configuration/storage#s3-storage)

这里介绍两个云存储服务

- cloudflare r2 storage：有免费额度，国内加载速度可能较慢。

- 又拍云：支持S3协议，国内访问速度快，加入[又拍云联盟](https://www.upyun.com/league)可以每月有免费存储空间和流量。

cloudflare r2的配置请参考：[配置 Cloudflare R2 存储 - Memos](https://hahagood.com/post/2024/03/20240306212529-setup_cloudflare_r2_bucket_for_memos/)

由于我的博客本身就放在了又拍云的云存储上，这里介绍一下又拍云的使用方法：

1. 在[又拍云控制台](https://console.upyun.com/services/file/)创建云存储服务

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250825170014197-2025-8-2517:00:18.png" style="zoom:80%;" />

2. 创建完成后，在服务的存储管理中拷贝S3访问凭证AccessKey和SecretAccesskey

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250825170341557-2025-8-2517:03:42.png" style="zoom:80%;" />

3. 在memos页面设置中配置存储位置

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250825170610081-2025-8-2517:06:19.png" style="zoom:80%;" />

   - Maximum upload size (MiB)：上传文件的最大大小
   - Filepath template：在云服务中创建一个目录，如photos，将默认的assets改为photos，文件将上传到该目录下。
   - Access key id：填入又拍云S3凭证中的AccessKey
   - Access key secret：填入又拍云S3凭证中的SecretAccesskey
   - Endpoint：固定为 https://s3.api.upyun.com/
   - Region：auto
   - Bucket：云服务名称

***

4、HTTPS加密传输（可选）

可以发现现在memos服务采用的还是http协议，相当于在网络上裸奔。按照官网的教程，使用caddy作反向代理，它能够自动HTTPS，为你的所有站点提供TLS证书并保持更新，还能将HTTP重定向到HTTPS。

首先为你的memos应用绑定域名，在你的域名解析中添加一个A记录类型，主机记录取为memos，记录值为你的服务器ip。

现在先将刚才上线的memos服务删除

```bash
docker stop memos
docker rm memos
```

创建保存caddy数据的文件夹

```bash
mkdir /dockerData/caddy/data
mkdir /dockerData/caddy/config
mkdir /dockerData/caddy/logs
```

修改之前的docker-compose.yml文件，新内容为如下。将其中的memos.catpaws.top改为自己memos应用的域名即可。

```yml
services:
  memos:
    image: neosmemo/memos:latest
    container_name: memos
    restart: unless-stopped
    expose: [5230/tcp]
    volumes:
      - /dockerData/memos/data:/var/opt/memos

  caddy:
    image: caddy:2.8 
    container_name: caddy
    restart: unless-stopped
    ports:
      - 0.0.0.0:80:80/tcp
      - 0.0.0.0:443:443
    configs:
      - source: Caddyfile
        target: /etc/caddy/Caddyfile
    volumes:
      - /dockerData/caddy/data:/data
      - /dockerData/caddy/config:/config
      - /dockerData/caddy/logs:/logs

configs:
  Caddyfile:
    content: |
      memos.catpaws.top {
        reverse_proxy memos:5230
        log {
          format console
          output file /logs/memos.log {
            roll_size 10mb
            roll_keep 20
            roll_keep_for 7d
          }
        }
        encode {
          zstd
          gzip
          minimum_length 1024
        }
      }
```

`docker compose up -d`上线应用，使用域名访问memos。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250825180043707-2025-8-2518:00:49.png" style="zoom:80%;" />

### hexo整合memos

在Hexo博客中创建一个独立页面，通过Memos API展示说说内容。具体效果可以查看我的博客：[时光轴](https://catpaws.top/timeline/)

整合过程参考：https://github.com/Mintimate/memos-bb-time，将她source目录下的Memos拷贝到自己的source目录下，并在配置文件中添加目录导航。

修改index.md中memos的自定义配置，主要是配置自己memos的地址。

```js
var bbMemos = {
    memos : 'http://服务器ip:5230/',
	//其余不变即可
}

//若已经为memos配置了HTTPS且添加了域名，可以直接使用域名
var bbMemos = {
    memos : 'https://你的memos域名/',
	//其余不变即可
}
```

最终想要实现和我一样的说说效果，只需使用我的js代码替换她的即可。[js代码](https://catpaws.top/blog-resource/js/MyTalk.js)

```html
将index.md末尾的
<script src="./bb-lmm-mk.js"></script>
改为
<script src="https://catpaws.top/blog-resource/js/MyTalk.js"></script>
```



## 为页面添加纸张纹理

纸张纹理图片取自[中国色](https://zhongguose.com/)，可以将其[下载](https://zhongguose.com/img/texture.png)到本地以便使用。

设置背景和主面板的样式。新建css文件，添加如下内容，并在配置文件中引入。

```css
body {
    background-image: url(纹理图片路径或链接);
    transition: background-color 0.5s ease-in;
    /* background-color: #cdd1d3 */
    background-color: #FDFDFD;
}

#board {
    position: relative;
    width: auto;
    height: auto;
    background-image: url(纹理图片路径或链接);
    transition: background-color 0.5s ease-in;
    /* background-color: #cdd1d3 */
    background-color: #FFFFFF;
}

/* 暗色模式 */

[data-user-color-scheme="dark"] body {
    background-image: url(纹理图片路径或链接);
    transition: background-color 0.5s ease-in;
    /* background-color: #1e1e1e */
    background-color: #181C27;
}

[data-user-color-scheme="dark"] #board {
    position: relative;
    width: auto;
    height: auto;
    background-image: url(纹理图片路径或链接);
    transition: background-color 0.5s ease-in;
    /* background-color: #1e1e1e */
    background-color: #252D38;
}
```



若已经按我之前的方法添加了文字顶部波浪效果，需要稍微修改一下波浪的颜色，让它和纹理尽可能保持一致。

```css
.parallax>use:nth-child(4) {
    animation-delay: -5s;
    animation-duration: 20s;
    fill: #F7F7F7    /* 将原来的 #FDFDFD 改为 #F7F7F7 */
}
```

