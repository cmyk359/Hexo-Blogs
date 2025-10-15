---
title: Vue3
categories:
  - JavaWeb
abbrlink: 3a42db2d
date: 2025-03-02 21:22:14
tags:
---

<meta name = "referrer", content = "no-referrer"/>

## 一、简介

![](https://gitee.com/cmyk359/img/raw/master/img/vue-2025-10-218:41:03.png)

Vue是一款用于构建用户界面的 JavaScript 框架。它基于标准 HTML、CSS 和 JavaScript 构建，并提供了一套声明式的、组件化的编程模型，帮助你高效地开发用户界面。无论是简单还是复杂的界面，Vue 都可以胜任。



## 二、TypeScript



## 三、创建Vue项目

### 3.1 基于 vue-cli 创建

{%note warning%}

Vue CLI 现已处于维护模式！现在官方推荐使用 [`create-vue`](https://github.com/vuejs/create-vue) 来创建基于 [Vite](https://cn.vitejs.dev/) 的新项目

{%endnote%}

Vue-cli 是Vue官方提供的一个脚手架，用于快速生成一个 Vue 的项目模板，依赖于NodeJS。

Vue-cli提供了如下功能：

- 统一的目录结构
- 本地调试
- 热部署
- 单元测试
- 集成打包上线

```powershell
## 安装或者升级你的@vue/cli 
npm install -g @vue/cli

## 查看@vue/cli版本，确保@vue/cli版本在4.5.0以上
vue --version

## 执行创建命令
vue create vue_test

##  随后选择3.x
##  Choose a version of Vue.js that you want to start the project with (Use arrow keys)
##  > 3.x
##    2.x

## 启动
cd vue_test
npm run serve
```

基于Vue脚手架创建出来的工程，有标准的目录结构，如下：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251002190411922-2025-10-219:04:16.png" style="zoom:80%;" />

### 3.2 基于 vite 创建（推荐）

`vite` 是新一代前端构建工具，官网地址：[https://vitejs.cn](https://vitejs.cn/)，`vite`的优势如下：

- 轻量快速的热重载（`HMR`），能实现极速的服务启动。

- 对 `TypeScript`、`JSX`、`CSS` 等支持开箱即用。

- 真正的按需编译，不再等待整个应用编译完成。

  

`webpack`构建 与 `vite`构建对比图如下：

<img src="https://gitee.com/cmyk359/img/raw/master/img/1683167182037-71c78210-8217-4e7d-9a83-e463035efbbe-2025-10-219:09:17.png" alt="webpack构建" style="zoom:80%;" />

<img src="https://gitee.com/cmyk359/img/raw/master/img/1683167204081-582dc237-72bc-499e-9589-2cdfd452e62f-2025-10-219:09:48.png" alt="vite构建" style="zoom:80%;" />



创建过程：

```powershell
## 1.创建命令
npm create vue@latest

## 2.具体配置
## 配置项目名称
√ Project name: vue3_test
## 是否添加TypeScript支持
√ Add TypeScript?  Yes
## 是否添加JSX支持
√ Add JSX Support?  No
## 是否添加路由环境
√ Add Vue Router for Single Page Application development?  No
## 是否添加pinia环境
√ Add Pinia for state management?  No
## 是否添加单元测试
√ Add Vitest for Unit Testing?  No
## 是否添加端到端测试方案
√ Add an End-to-End Testing Solution? » No
## 是否添加ESLint语法检查
√ Add ESLint for code quality?  Yes
## 是否添加Prettiert代码格式化
√ Add Prettier for code formatting?  No
```



新创建的vue项目结构如下，之后需使用`npm i`安装项目所需依赖。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251002210525213-2025-10-221:05:25.png" style="zoom:80%;" />

- `.vscode`：vscode插件相关配置
- `public`目录：存放静态资源，它们会**直接被复制**到构建输出目录的根目录下，不经过 Vite 的构建处理。
- `src`目录：源代码目录，需要花费最多时间进行开发的目录。
  - `/assets`：静态资源目录，其中的资源需要经过vite构建处理，如压缩、优化。
  - `/components` ：存放可复用的 Vue 组件。每个组件都是一个独立的 `.vue` 文件，包含自己的模板、逻辑和样式。
  - `App.vue`：**应用的根组件**。所有其他组件都将作为它的子组件存在。它定义了整个应用的基本布局和结构。
  - `main.ts`：**应用的入口文件**。它创建 Vue 应用实例，并将根组件挂载到 DOM 元素上。
- `.gitignore`：告诉 Git 哪些文件或目录不需要纳入版本控制。
- `index.html`：**Vite 项目的入口文件**。这与传统的 Webpack 项目不同，Vite 直接将 `index.html` 置于根目录。
- `package.json`：它定义了项目的基本信息、依赖项以及可运行的脚本命令。
- `tsconfig.json` ：主TypeScript 配置。现代 Vite 项目使用"项目引用"来分离配置，这个文件主要作为入口，引用其他具体配置。
  - `env.d.ts`：Vite 环境类型声明
  - `tsconfig.app.json` ：应用代码配置。
    - `extends`: 继承 Vue 的 DOM 环境预设配置
    - `include`: 指定要编译的文件范围
    - `paths`: 配置路径别名，`@/*` 指向 `./src/*`
  - `tsconfig.node.json` ：工具链配置。
- `vite.config.ts`：vite配置文件



运行流程：Vite 项目中，`index.html` 是项目的入口文件，在项目最外层。加载`index.html`后，解析 `<script type="module" src="xxx">` 指向的`JavaScript`。在其中创建应用并绑定到`index.html`中id为app的元素上。

编写一个vue项目可以比作种花，`main.ts`中引入的`createApp`方法可比作花盆，`App.vue`相当于花的根，之后创建个各种组件就相当于叶子和花朵。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251002214706994-2025-10-221:47:16.png" style="zoom:80%;" />

## 四、Vue3核心语法

### 4.1 OptionsAPI 与 CompositionAPI

- `Vue2`的`API`设计是`Options`（配置）风格的。
- `Vue3`的`API`设计是`Composition`（组合）风格的。

OptionAPI的弊端：`Options`类型的 `API`，数据、方法、计算属性等，是分散在：`data`、`methods`、`computed`中的。若想新增或者修改一个需求，就需要分别修改：`data`、`methods`、`computed`，不便于维护和复用。

CompositionAPI可以用函数的方式，更加优雅的组织代码，让相关功能的代码更加有序的组织在一起。同一个逻辑关注点相关的代码被归为了一组：无需再为了一个逻辑关注点在不同的选项块间来回滚动切换。此外，我们现在可以很轻松地将这一组代码移动到一个外部文件中，不再需要为了抽象而重新组织代码，大大降低了重构成本，这在长期维护的大型项目中非常关键。

### 4.2 拉开序幕的setup

#### 概述

`setup`是`Vue3`中一个新的配置项，值是一个**函数**，它是 `Composition API` “表演的舞台”，组件中所用到的：数据、方法、计算属性、监视......等等，均配置在`setup`中。

特点如下：

- `setup`函数返回的对象中的内容，可直接在模板中使用。
- `setup`中访问`this`是`undefined`。
- `setup`函数会在`beforeCreate`之前调用，它是“领先”所有钩子执行的。

示例：使用Vue2的选项式API编写一个`Person`组件

```html
<template>
    <div class="person">
        <h2>姓名：{{ name }}</h2>
        <h2>年龄：{{ age }}</h2>
        <button @click="changeName">修改姓名</button>
        <button @click="changeAge">修改年龄</button>
        <button @click="showTel"> 查看联系方式</button>
    </div>
</template>

<script lang="ts">
export default {
    name: 'Person',
    data() {
        return {
            name: '张三',
            age: 30,
            tel: '13855555555'
        };
    },
    methods: {
        changeName() {
            this.name = 'zhang san';
        },
        changeAge() {
            this.age++;
        },
        showTel() {
            alert(this.tel);
        }
    }
}
</script>
<style>略</style>
```

改为组合式API

```html
<template>
    <div class="person">
        <h2>姓名：{{ name }}</h2>
        <h2>年龄：{{ age }}</h2>
        <button @click="changeName">修改姓名</button>
        <button @click="changeAge">修改年龄</button>
        <button @click="showTel"> 查看联系方式</button>
    </div>
</template>

<script lang="ts">
export default {
    name: 'Person',
    setup() {
        //数据，原来写在data中（注意：此时的name、age、tel数据都不是响应式数据）
        let name = '张三';
        let age = 30;
        let tel = '13855555555';

        //方法，原来写在methods中
        function changeName() {
            name = 'zhang san';
        }
        function changeAge() {
            age++;
        }
        function showTel() {
            alert(tel);
        }
		 // 返回一个对象，对象中的内容，模板中可以直接使用	
        return { name, age, changeName, changeAge, showTel };
    }
}
</script>
<style>略</style>
```

#### setup的返回值

- 若返回一个**对象**：则对象中的：属性、方法等，在模板中均可以直接使用**（重点）。**

- 若返回一个**函数**：则可以自定义渲染内容

  ```javascript
  setup(){
    return ()=> '你好啊！'
  }
  ```

#### setup 与 Options API 的关系

- Vue2 的配置（`data`、`methos`......）可以与 setup同时存在
- Vue2的配置（`data`、`methos`......）中**可以访问到** setup中的属性、方法，**反之却不行**。
- 如果与Vue2冲突，则setup优先。

关键：由于setup是最早的生命周期，它内部的属性和方法先被加载

#### setup语法糖

setup函数有一个语法糖: `<script setup></script>`。它可以让我们把setup独立出去，不用再写setup函数，并且不用再手动return对象。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251003133736624-2025-10-313:37:40.png" style="zoom:80%;" />

```html
<!-- 使用setup语法糖简化： -->
<template>
    <div class="person">
        <h2>姓名：{{ name }}</h2>
        <h2>年龄：{{ age }}</h2>
        <button @click="changeName">修改名字</button>
        <button @click="changeAge">年龄+1</button>
        <button @click="showTel">点我查看联系方式</button>
    </div>
</template>

<script lang="ts">
export default {
    name: 'Person'//组件名称
}
</script>

<script lang="ts" setup>
    // 数据，原来写在data中（注意：此时的name、age、tel数据都不是响应式数据）
    let name = '张三'
    let age = 18
    let tel = '13888888888'

    // 方法，原来写在methods中
    function changeName() {
        name = 'zhang-san' //注意：此时这么修改name页面是不变化的
        console.log(name)
    }
    function changeAge() {
        age += 1 //注意：此时这么修改age页面是不变化的
        console.log(age)
    }
    function showTel() {
        alert(tel)
    }
</script>

<style>略</style>
```



可以进一步简化，借助插件将声明组件名称的script代码合并到setup标签中：在setup标签中通过`name`属性指定组件的名称。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251003135522038-2025-10-313:55:22.png" style="zoom:80%;" />

1. 安装插件：`npm i vite-plugin-vue-setup-extend -D`

2. 在项目中引用该插件：修改`vite.config.ts`

   ```js
   import VueSetupExtend from 'vite-plugin-vue-setup-extend' //引入
   
   export default defineConfig({
     plugins: [ VueSetupExtend() ] //在plugin中添加该插件
   })
   ```

***

再补充一个 一键生成setup语法糖格式的vue3模板插件： `Vue 3 Snippets`, 在插件市场就可以找到，之后在新文件中输入`vinit`+回车 即可

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251009194444261-2025-10-919:44:59.png" style="zoom:80%;" />


### 4.3 创建响应式数据

#### ref：创建基本类型的响应式数据

```javascript
//定义响应式变量
import {ref} from 'vue'
let xxx = ref(初始值)
```

将初始值传递给ref函数，它会返回一个`RefImpl`的实例对象，简称`ref对象`或`ref`。`ref`对象的`value`**属性是响应式的**，因此：

- JS中操作数据需要：`xxx.value`，但在模板中会自动解包，不需要`.value`，直接使用即可。
- 对于`let name = ref('张三')`来说，`name`不是响应式的，`name.value`是响应式的。

```html
<!-- 使用setup语法糖简化： -->
<template>
    <div class="person">
        <h2>姓名：{{ name }}</h2>
        <h2>年龄：{{ age }}</h2>
        <button @click="changeName">修改名字</button>
        <button @click="changeAge">年龄+1</button>
        <button @click="showTel">点我查看联系方式</button>
    </div>
</template>

<script setup lang="ts" name="Person234">
    import { ref } from 'vue'

    // 数据
    // name和age是一个ref对象，它们的value属性是响应式的。
    let name = ref('张三')  
    let age = ref(18)  
    //tel就是一个普通的字符串，不是响应式的
    let tel = '13888888888'  

    // 方法
    function changeName() {
        name.value = 'zhang-san'   // JS中操作ref对象时候需要添加.value
    }
    function changeAge() {
        age.value += 1
    }
    function showTel() {
        alert(tel)
    }
</script>

<style>略</style>
```

观察响应式数据和普通数据的结构：

![](https://gitee.com/cmyk359/img/raw/master/img/image-20251003180149309-2025-10-318:02:09.png)



{% note info %}

在vscode中安装vue插件后，可以开启自动为响应式数据添加.value的功能

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251003180800383-2025-10-318:08:32.png" style="zoom:80%;" />

{% endnote %}

#### reactive：创建对象类型的响应式数据

```javascript
// 定义一个响应式对象
import { reactive } from 'vue'
let 响应式对象 = reactive(源对象)
```

将源对象传递给`reactive`方法，返回一个`Proxy`的实例对象，简称响应式对象。

- 在JS和模板中不需要`.value`，直接使用即可。
- reactive方法只能接收对象类型，不能接收基本数据类型。
- `reactive`定义的响应式数据是“深层次”的，不论对象嵌套地多深。

{%note primary%}

使用`reactive`创建的响应式对象，实际上是通过Proxy代理了该对象。当我们访问或修改该对象的属性时，会触发Proxy的get和set陷阱，从而实现响应式。

{%endnote%}

```html
<!-- 使用setup语法糖简化： -->
<template>
    <div class="car">
        <h2>一辆{{ car.brand }}车，价值{{ car.price }}万</h2>
        <button @click="changeBrand">修改车的品牌</button>
        <button @click="changePrice">修改车的价格</button>
    </div>
</template>

<script setup lang="ts" name="Car">
import { reactive } from 'vue'
// 数据
let car = reactive({ brand: "奔驰", price: 100 });

// 方法，原来写在methods中
function changeBrand() {
    car.brand = "宝马";
}
function changePrice() {
    car.price += 10;
}
</script>

<style>略</style>

```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251003182118155-2025-10-318:21:25.png" alt="响应式对象结构" style="zoom:80%;" />

{%note warning%}

若reactive对象的属性为ref对象，在访问或修改这个属性时，Vue会自动对其进行解包，也就是说我们不需要通过`.value`来访问`ref`的值。

这是因为在Vue 3的源码中，对`reactive`对象进行属性访问时，如果检测到该属性是一个`ref`，那么就会返回这个`ref`的`value`值。同样地，当给这个属性赋值时，如果这个属性是一个`ref`，那么会直接将值赋给这个`ref`的`value`。

```js
let car = reactive({ 
    brand: "奔驰", 
    price: 100,
	color: ref("red")
});

console.log(car.color) //red
console.log(car.color.value) //undefinded
```

{%endnote%}

#### ref：创建对象类型的响应式数据

实际上，`ref`接收的数据可以是：**基本类型**、**对象类型**。若`ref`接收的是对象类型，内部其实也是调用了`reactive`函数。

```html
<!-- 使用setup语法糖简化： -->
<template>
    <div class="game">
        <h2>游戏列表</h2>
        <ul>
            <li v-for="game in games" :key="game.id">{{ game.name }}</li>
        </ul>
        <button @click="changeGame">修改第一个游戏</button>
    </div>
</template>

<script setup lang="ts" name="Person234">
import { ref } from 'vue'
let games = ref([
    { id: 'jnmnxsi01', name: '王者荣耀' },
    { id: 'jnmnxsi02', name: '和平精英' },
    { id: 'jnmnxsi03', name: '英雄联盟' }
])

function changeGame() {
    //先使用.value接触到响应式数据：proxy对象，再调用其属性
    games.value[0] = { id: 'jnmnxsi01', name: 'DOTA2' }
}
</script>

<style>略</style>

```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251003183723258-2025-10-318:37:25.png" alt="ref响应式对象的结构" style="zoom:80%;" />



#### ref与reactive对比

宏观角度看：

1. `ref`用来定义：**基本类型数据**、**对象类型数据**；

2. `reactive`用来定义：**对象类型数据**。

区别：

1. `ref`创建的变量必须使用`.value`
2. `reactive`重新分配一个新对象，会**失去**响应式（可以使用`Object.assign`去整体替换）。

使用原则：

1. 若需要一个基本类型的响应式数据，必须使用`ref`。
2. 若需要一个响应式对象，层级不深，`ref`、`reactive`都可以。
3. 若需要一个响应式对象，且层级较深，推荐使用`reactive`。

***

补充：`reactive`重新分配一个新对象的问题。

在下面的代码中，`car`是一个指向响应式对象的引用（变量），它只是一个普通的变量。模板在初始化时建立的是与旧响应式对象`{ brand: "奔驰", price: 100 }`的依赖关系。当直接给`car`变量赋值一个新的响应式对象时，将`car`变量指向了一个新的响应式对象，而原来模板中（或其他地方）引用的仍然是旧的响应式对象,模板并没有更新到新的对象，因此这种替换不会生效。

所以，正确的做法是不要直接替换整个对象，而是用`Object.assign`去更新原响应式对象的属性。

```javascript
<template>
    <div class="car">
        <h2>一辆{{ car.brand }}车，价值{{ car.price }}万</h2>
        <button @click="changeCar">换一辆车</button>
    </div>
</template>

<script setup lang="ts" name="Car">
    import { reactive } from 'vue'

    let car = reactive({ brand: "奔驰", price: 100 });
	
    function changeCar() {
        // car = { brand: "奥迪", price: 200 };  // ❌ 不能直接整体替换
        // car = reactive({ brand: "奥迪", price: 200 }); // ❌ car指向了新的Proxy对象引用，但所有模板和计算属性中引用的仍然是旧的响应式对象
        Object.assign(car, { brand: "奥迪", price: 200 }); // ✅ 用Object.assign()修改属性而不是替换整个对象
    }
</script>

<style>略</style>

```

如果确实需要替换整个对象，可以考虑使用`ref`来定义`car`。因为`ref`可以包装任何类型的值，包括对象，并且当我们将`ref`的值重新赋值为一个新对象时，响应式会保持。

```javascript
import { ref } from 'vue'
let car = ref({ brand: "奔驰", price: 100 });
function changeCar() {
    car.value = { brand: "奥迪", price: 200 };
    // 执行过程：
    // 1. 调用 RefImpl 的 setter
    // 2. 检测到新值变化
    // 3. _value 重新赋值为 Proxy({ brand: "奥迪", price: 200 })
    // 4. 触发 triggerRefValue，通知所有依赖更新
}
```

#### toRefs与toRef

当我们使用`reactive`创建一个响应式对象后，如果直接通过解构赋值来获取属性，那么这些属性将会失去响应性。

```javascript
import { reactive } from 'vue';

let car = reactive({ brand: "奔驰", price: 100 });

// 解构赋值
// 此时，brand 和 price 是基本类型，不是响应式的
let { brand, price } = car;
```

`toRefs` 可以将响应式对象转换为普通对象, 但这个对象的每个属性都是指向原始对象相应属性的 `ref`，这些`ref`会保持与源对象的响应式连接。这样，在解构时，我们得到的是多个`ref`，它们仍然是响应式的。

```html
<template>
    <div class="car">
        <!-- 直接使用解构后的ref对象 -->
        <h2>一辆{{ brand }}车，价值{{ price }}万</h2>
        <button @click="changeCar">换一辆车</button>
    </div>
</template>

<script setup lang="ts" name="Car">
    import { reactive, toRefs } from 'vue'
    // 数据
    let car = reactive({ brand: "奔驰", price: 100 });
    //解构为ref
    let { brand, price } = toRefs(car)

    function changeCar() {
        //直接使用ref对象
        brand.value = "宝马";
        price.value = 200;
    }
</script>
```

`toRefs`是转换整个对象的所有属性，而`toRef` 是转换指定的单个属性为`ref`

```javascript
import { reactive, toRef, toRefs } from 'vue';

let car = reactive({ brand: "奔驰", price: 100 });

// 解构赋值
//brand是一个 ref，与 car.brand 保持响应式连接
let brand = toRef(car,'brand'); 
//等价于
let {brand} = toRefs(car)  //解构整个对象，获取它的ref类型的属性brand
```

当使用`toRefs`或者`toRef`解构的对象没有对应属性，会创建一个 ref，其 value 为 undefined，并且如果后续给它添加了该属性，这个 ref 也会更新。

### 4.4 computed 计算属性

在Vue3中，计算属性的概念被保留，可以使用组合式API来定义。通过`computed`函数来创建计算属性，**是一个ref对象**。

Vue3中的计算属性同样具有缓存性：计算属性基于它们的依赖进行缓存，**只有在依赖发生变化时才会重新计算。**这适用于性能开销较大的计算，或者需要从现有数据中派生新数据的场景。

现在分为**只读计算属性**和**可读写计算属性**。

```javascript
//首先，需要从`vue`中导入`computed`。
import { ref, computed } from 'vue'

let firstName = ref('zhang')
let lastName = ref('san')

// 计算属性: fullName1, 只读
let fullName1 = computed(() => {
    return firstName.value + '-' + lastName.value
})

// 计算属性：fullName2, 可读可写
let fullName2 = computed({
    //定义get、set方法
    get() {
        return firstName.value + '-' + lastName.value
    },
    set(newValue) {
        let names = newValue.split('-')
        firstName.value = names[0] ?? ''
        lastName.value = names[1] ?? ''
    }
})
function changeName() {
    fullName2.value = 'li-si' //修改计算属性时，调用set方法
}
```



{%note primary%}

`??`  是 JavaScript 中的空值合并运算符。它的作用是：如果左侧的表达式是  `null`  或  `undefined` ，则返回右侧的默认值；否则返回左侧的值。

与`??`类似的运算符：`||`。它会在左侧为假值，如 `0`, `false`, `''`, `null`, `undefined`时返回右侧，而 `??` 只针对 `null` 和 `undefined`。

{%endnote%}



### 4.5 watch

监听一个或多个响应式数据源，并在数据源变化时调用所给的回调函数。

```javascript
import {watch} from 'vue'
watch(数据源，回调函数,配置对象)
```

`Vue3`中的`watch`只能监视以下**四种数据**：

- `ref`定义的数据。
- `reactive`定义的数据。
- 返回一个值的函数（`getter`函数）。
- 一个包含上述内容的数组。

回调函数在数据源发生变化时调用，回调函数接受三个参数：新值、旧值，以及一个用于注册副作用清理的回调函数。该回调函数会在副作用下一次重新执行前调用，可以用来清除无效的副作用，例如等待中的异步请求。

配置对象中支持以下选项：

- **`immediate`**：在侦听器创建时立即触发回调。第一次调用时旧值是 `undefined`。
- **`deep`**：如果源是对象，强制深度监视，以便在深层级变更时触发回调。在 3.5+ 中，此参数还可以是指示最大遍历深度的数字。参考[深层侦听器](https://cn.vuejs.org/guide/essentials/watchers.html#deep-watchers)。
- **`flush`**：调整回调函数的刷新时机。参考[回调的刷新时机](https://cn.vuejs.org/guide/essentials/watchers.html#callback-flush-timing)及 [`watchEffect()`](https://cn.vuejs.org/api/reactivity-core.html#watcheffect)。
- **`onTrack / onTrigger`**：调试侦听器的依赖。参考[调试侦听器](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html#watcher-debugging)。
- **`once`**：(3.4+) 回调函数只会运行一次。侦听器将在回调函数首次运行后自动停止。

watch函数的返回值是一个函数，用于停止对当前数据源的监控。

```javascript
const stop = watch(source, callback)
// 当已不再需要该侦听器时：
stop()
```



****

针对`watch`的四种数据源，在`Vue3`中使用`watch`的时候，通常会遇到以下几种情况

情况一：监视`ref`定义的【基本类型】数据。

直接写数据名即可，监视的是其`value`值的改变。

```html
<template>
  <div class="person">
    <h1>情况一：监视【ref】定义的【基本类型】数据</h1>
    <h2>当前求和为：{{sum}}</h2>
    <button @click="changeSum">点我sum+1</button>
  </div>
</template>

<script lang="ts" setup name="Person">
  import {ref,watch} from 'vue'
  // 数据
  let sum = ref(0)
  // 方法
  function changeSum(){
    sum.value += 1
  }
  // 监视，情况一：监视【ref】定义的【基本类型】数据
  const stopWatch = watch(sum,(newValue,oldValue)=>{
    console.log('sum变化了',newValue,oldValue)
    //当sum的值达到10后，停止对sum的监控
    if(newValue >= 10){
      stopWatch()
    }
  })
</script>
```



***

情况二：监视`ref`定义的【对象类型】数据

直接写数据名，监视的是对象的<u>地址值</u>，若想监视对象内部属性，要手动开启深度监视。

开启深度监视：在watch函数的配置对象中设置`deep: true`

{%note warning%}

* 若修改的是`ref`定义的对象中的属性，`newValue` 和 `oldValue` 都是新值，因为它们是同一个对象。

* 若修改整个`ref`定义的对象，`newValue` 是新值， `oldValue` 是旧值，因为不是同一个对象了。

{%endnote%}

```html
<template>
    <div class="car">
        <h1>情况二：监视【ref】定义的【对象类型】数据</h1>
        <h2>一辆{{ car.brand }}车，价值{{ car.price }}万</h2>
        <button @click="changeBrand">修改车的品牌</button>
        <button @click="changeCar">换辆车</button>
    </div>
</template>
<script setup lang="ts" name="Car">
    import { ref, watch } from 'vue'
    
    let car = ref({ brand: "奔驰", price: 100 });
	
    //修改对象属性
    function changeBrand() { 
        car.value.brand = "宝马";
    }
    //修改对象地址
    function changeCar() {
        car.value = { brand: "奥迪", price: 200 }
    }
	//监视，情况二：监视【ref】定义的【对象类型】数据
    watch(car, (val) => {
        console.log("car对象被修改了", val); //只关心最新值
    }, { deep: true })
</script>
```

***

情况三：监视`reactive`定义的【对象类型】数据

直接使用数据名，且自动开启了深度监视，无法关闭。

```html
<template>
  <div class="person">
    <h1>情况三：监视【reactive】定义的【对象类型】数据</h1>
    <h2>姓名：{{ person.name }}</h2>
    <h2>年龄：{{ person.age }}</h2>
    <button @click="changeName">修改名字</button>
    <button @click="changePerson">修改整个人</button>
  </div>
</template>

<script lang="ts" setup name="Person">
  import {reactive,watch} from 'vue'
  // 数据
  let person = reactive({
    name:'张三',
    age:18
  })
  // 方法
  function changeName(){
    person.name += '~'
  }
  function changePerson(){
    Object.assign(person,{name:'李四',age:80})
  }

  // 监视，情况三：监视【reactive】定义的【对象类型】数据，且默认是开启深度监视的
  watch(person,(val)=>{
    console.log('person变化了',val)
  })

</script>
```

***

情况四：监视`ref`或`reactive`定义的【对象类型】数据中的**某个属性**

1. 若该属性值**不是**【对象类型】，需要写成函数形式。
2. 若该属性值是**依然**是【对象类型】，可直接用，也可写成函数，**建议写成函数。**

{%note primary%}

返回一个值的函数可简写为：`() => xxxx`

最佳实践：监视的要是对象的属性，最好写函数式。若属性是对象类型，则监视的是地址值，当要关注对象内部时，再手动开启深度监视。

{%endnote%}

```html
<template>
    <div class="person">
        <h1>情况四：监视【ref】或【reactive】定义的【对象类型】数据中的某个属性</h1>
        <h2>姓名：{{ person.name }}</h2>
        <h2>年龄：{{ person.age }}</h2>
        <h2>汽车：{{ person.car.c1 }}、{{ person.car.c2 }}</h2>
        <button @click="changeName">修改名字</button>
        <button @click="changeC1">修改第一台车</button>
        <button @click="changeCar">修改整个车</button>
    </div>
</template>

<script lang="ts" setup name="Person">
    import { reactive, watch } from 'vue'

    // 数据
    let person = reactive({
        name: '张三',
        age: 18,
        car: {
            c1: '奔驰',
            c2: '宝马'
        }
    })

    function changeName() {
        person.name = '李四'
    }

    function changeC1() {
        person.car.c1 = '奥迪'
    }

    function changeCar() {
        person.car = {
            c1: '大众',
            c2: '福特'
        }
    }

    //监视基本类型的属性
    watch(() => person.name, (newVal, oldVal) => {
        console.log('name变化了', newVal, oldVal);
    })

    //监视对象类型的属性，若需要关注其内部的变化，则手动开启深度监视
    watch(() => person.car, (newVal, oldVal) => {
        console.log('car变化了', newVal, oldVal);
    }, { deep: true }) //深度监视
</script>
```

***

情况五：同时监视上述的多个数据

将要监控的数据源放入数组中，此时回调函数的参数`newVal`和`oldVal`中只包含要监控的属性内容。

```html
<template>
    <div class="person">
        <h1>情况四：监视【ref】或【reactive】定义的【对象类型】数据中的某个属性</h1>
        <h2>姓名：{{ person.name }}</h2>
        <h2>年龄：{{ person.age }}</h2>
        <h2>汽车：{{ person.car.c1 }}、{{ person.car.c2 }}</h2>
        <button @click="changeName">修改名字</button>
        <button @click="changeC1">修改第一台车</button>
        <button @click="changeCar">修改整个车</button>
    </div>
</template>

<script lang="ts" setup name="Person">
    import { reactive, watch } from 'vue'

    // 数据
    let person = reactive({
        name: '张三',
        age: 18,
        car: {
            c1: '奔驰',
            c2: '宝马'
        }
    })

    function changeName() {
        person.name = '李四'
    }

    function changeC1() {
        person.car.c1 = '奥迪'
    }

    function changeCar() {
        person.car = {
            c1: '大众',
            c2: '福特'
        }
    }
	// 监视，情况五：监视上述的多个数据
    //注意：此时的newVal和oldVal中只包含name和car属性
    watch([() => person.name, () => person.car], (newVal, oldVal) => {
        console.log('监听到数据变化了', newVal, oldVal);
    })

</script>
```

### 4.6 watchEffect

立即运行一个函数，同时响应式地追踪其依赖，并在依赖更改时重新执行。

`watch`与`watchEffect`

1. 都能监听响应式数据的变化，不同的是监听数据变化的方式不同

2. `watch`：要明确指出监视的数据

3. `watchEffect`：不用明确指出监视的数据（函数中用到哪些属性，那就监视哪些属性）。

```html
<template>
  <div class="person">
    <h1>需求：水温达到50℃，或水位达到20cm，则联系服务器</h1>
    <h2 id="demo">水温：{{temp}}</h2>
    <h2>水位：{{height}}</h2>
    <button @click="changePrice">水温+1</button>
    <button @click="changeSum">水位+10</button>
  </div>
</template>

<script lang="ts" setup name="Person">
  import {ref,watch,watchEffect} from 'vue'
  // 数据
  let temp = ref(0)
  let height = ref(0)

  // 方法
  function changePrice(){
    temp.value += 10
  }
  function changeSum(){
    height.value += 1
  }

  // 用watch实现，需要明确的指出要监视：temp、height
  watch([temp,height],(value)=>{
    // 从value中获取最新的temp值、height值
    const [newTemp,newHeight] = value
    // 室温达到50℃，或水位达到20cm，立刻联系服务器
    if(newTemp >= 50 || newHeight >= 20){
      console.log('联系服务器')
    }
  })

  // 用watchEffect实现，用到哪些就监视哪些
  const stopWtach = watchEffect(()=>{
    // 室温达到50℃，或水位达到20cm，立刻联系服务器
    if(temp.value >= 50 || height.value >= 20){
      console.log(document.getElementById('demo')?.innerText)
      console.log('联系服务器')
    }
    // 水温达到100，或水位达到50，取消监视
    if(temp.value === 100 || height.value === 50){
      console.log('清理了')
      stopWtach()
    }
  })
</script>
```

### 4.7 标签的ref属性

在Vue3中，标签的ref属性用于**获取对 DOM 元素或组件实例的直接引用**。

在组合式API中，通常使用ref函数来创建一个响应式引用，然后将它绑定到模板中的ref属性上。这样，我们就可以在组件挂载后访问和操作 DOM 元素或子组件。

基本用法：

1. 在setup函数中，使用ref函数创建一个ref对象，初始值为null。
2. 在模板中，将ref对象绑定到标签的ref属性上。
3. 当组件挂载后，该ref对象的值会自动设置为对应的DOM元素或组件实例。



获取DOM元素引用

```html
<!-- country.vue -->
<template>
    <div>
        <h1 ref="title">{{ counryName }}</h1>
        <button @click="test">测试</button>
    </div>
</template>

<script lang="ts" setup name="country">
import { ref } from 'vue'
let title = ref(null)
let country = ref("中国")
function test() {
    console.log(title.value) //<h1>中国</h1>
}
</script>
```

***

获取组件实例引用 

```html
<!-- 父组件App.vue -->
<template>
    <Country ref="country" />
    <button @click="test">测试</button>
</template>

<script lang="ts" setup name="App">
import Country from './components/Person.vue';
import { ref } from 'vue';

let country = ref(null);

function test() {
    //获取子组件的实例
    console.log(country.value); //*Proxy(Object)* *{__v_skip: true}*
}
</script>
```

默认情况下，父组件拿不到子组件中的具体数据，这是一种保护措施。需要子组件通过宏函数`defineExpose`指定想暴露哪些数据给父组件

```javascript
defineExpose(countryName,...)
```

### 4.8 props

props 是 Vue 组件之间**数据传递**的主要方式，用于父组件向子组件传递数据。在父组件中通过属性传递数据给子组件，在子组件中通过`defineProps` 宏函数来定义 props， 之后可以直接在模板中使用或进一步处理。



#### 父组件传递props

在父组件中，通过属性传递数据给子组件。

- 静态传递

  ```html
  <template>
    <!-- 静态传递字符串，子组件得到："静态标题","0", "['a', 'b']"-->
    <Child title="静态标题" count="0", items="['a', 'b']" /> 
  </template>
  ```

- 动态传递

  在Vue模板中，属性前加冒号`:`表示动态绑定，是v-bind指令的简写形式。将属性值作为JavaScript表达式处理，可以传递任意类型的数据。不加冒号则表示静态绑定，属性值总是字符串。

  ```html
  <template>
    <!-- 静态传递字符串，子组件得到："动态标题",0, ['a', 'b']-->
    <Child title="动态标题" :count="dynamicCount" :items="['a', 'b']" />
  </template>
  
  <script lang= "ts" setup>
      import { ref } from 'vue'
      const dynamicCount = ref(5)
  </script>
  ```

#### 定义props

在子组件中使用`defineProps` 定义props。

方式一：数组形式 - 只定义名称，不指定类型

```js
<script setup lang="ts" name="Child">
	let props = defineProps(['title', 'count', 'items'])    
</script>
```

***

方式二：对象形式，支持类型验证

Vue 允许对 props 进行验证，包括类型检查、必填检查、默认值、自定义验证函数等。

{%spoiler 通过 TypeScript 类型注解进行类型验证%}

TypeScript 类型注解给变量、函数参数、函数返回值等添加类型信息，帮助在开发阶段进行类型检查，避免运行时类型错误。

```js
//1、基本类型注解
    let name: string = 'Tom';
    let age: number = 25;
    let isStudent: boolean = false;
    let nullValue: null = null;
    let undefinedValue: undefined = undefined;

//2、数组和元组
    let list: number[] = [1, 2, 3];
    let list2: Array<number> = [1, 2, 3]; // 泛型语法
    let tuple: [string, number] = ['hello', 10]; // 元组：已知元素数量和类型的数组

//3、接口
    //定义对象的结构
    interface Person {
        name: string;
        age: number;
        email?: string; // 属性名末尾加?，表示可选属性
    }
    //指定对象结构为Person，当属性名或属性类型与定义不匹配时会提示错误信息
    let person: Person = {  
        name: 'Tom',
        age: 25
    };
       
//4、类型别名（Type Alias）
    //类型别名可以给一个类型起个新名字，也可以用于联合类型等复杂类型。
    type StringOrNumber = string | number;
    let value: StringOrNumber = 'hello';
    value = 123; 
    
//5、函数类型注解
    // 函数声明，指定参数和返回值类型
    function add(x: number, y: number): number {
        return x + y;
    }
//6、类型断言 as
    //类型断言可以用来手动指定一个值的类型。
    //类型断言不是类型转换，它只是在编译阶段告诉编译器如何分析类型。
    let someValue: any = "this is a string";
    let strLength: number = (someValue as string).length;
```

{%endspoiler%}



```js

<script setup lang="ts" name="Child">
import { ref } from 'vue'

//
    
</script>
```

#### 使用props

props对象结构如下，它是一个Proxy对象，从它的数据中可以得出：父组件传递的响应式数据，在子组件中会变成普通数据。

因此，Props 是单向的，父组件的变化会向下流动到子组件，但反过来不行。如果需要在子组件中修改，需要采用其他方式，见下文【组件通信】的内容。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251005232322763-2025-10-523:25:54.png" alt="props对象结构" style="zoom:80%;" />

### 4.9 自定义hook

什么是`hook`？—— 本质是一个函数，把`setup`函数中使用的`Composition API`进行了封装，将相关的逻辑代码组织在一起。这些函数可以返回响应式数据、方法、计算属性等，以便在多个组件中复用。

自定义`hook`的优势：

- **逻辑复用**：在不同的组件中复用相同的逻辑。
- **代码组织**：将相关的逻辑代码组织在一起，使组件更易于维护。
- **逻辑分离**：将复杂的组件逻辑拆分成更小、更专注的函数。

***

自定义hook基本步骤：

1. 创建一个ts文件，文件名通常**以 `use` 为前缀**，在其中创建相同名字的hook函数
2. 在函数内部使用组合式 API来封装逻辑。
3. 返回一个对象，包含所有需要暴露的响应式数据和方法，方便在组件中解构使用。

```javascript
//useSum.ts
import { ref, onMounted } from 'vue'

//带参数的hook函数
export function useSum(initialValue: number = 0) {
  let sum = ref(initialValue)

  const increment = () => {
    sum.value += 1
  }
  const decrement = () => {
    sum.value -= 1
  }
  onMounted(() => {
    increment() //组件挂载时，初始值为1
  })

  //向外部暴露数据
  return { sum, increment, decrement }
}
```

***

使用hook：

- 引入hook函数
- 调用hook函数并解构返回内容

```html
<template>
    <div class="person">
        <h1>当前和为: {{ sum }}</h1>
        <button @click="increment">加1</button>
        <button @click="decrement">减1</button>
    </div>
</template>

<script lang="ts" setup name="Person">
    //引入hook函数
    import { useSum } from '@/hooks/useSum';
	//调用hook函数并解构返回内容
    const { sum, increment, decrement } = useSum(10);
</script>
```



## 五、生命周期

`Vue`组件实例在创建时要经历一系列的初始化步骤，在此过程中`Vue`会在合适的时机，调用特定的函数，从而让开发者有机会在特定阶段运行自己的代码，这些特定的函数统称为：生命周期钩子

生命周期整体分为四个阶段，分别是：**创建、挂载、更新、销毁**，每个阶段都有两个钩子，一前一后。

`Vue2`的生命周期：

- 创建阶段：`beforeCreate`、`created`
- 挂载阶段：`beforeMount`、`mounted`
- 更新阶段：`beforeUpdate`、`updated`
- 销毁阶段：`beforeDestroy`、`destroyed`

`Vue3`的生命周期：

- 创建阶段：`setup`
- 挂载阶段：`onBeforeMount`、`onMounted`


- 更新阶段：`onBeforeUpdate`、`onUpdated`

- 卸载阶段：`onBeforeUnmount`、`onUnmounted`

生命周期钩子详情：[组合式 API：生命周期钩子](https://cn.vuejs.org/api/composition-api-lifecycle)

还有其他一些钩子，会在实例生命周期的不同阶段被调用，最常用的是 [`onMounted`](https://cn.vuejs.org/api/composition-api-lifecycle.html#onmounted)、[`onUpdated`](https://cn.vuejs.org/api/composition-api-lifecycle.html#onupdated) 和 [`onUnmounted`](https://cn.vuejs.org/api/composition-api-lifecycle.html#onunmounted)。

<img src="https://gitee.com/cmyk359/img/raw/master/img/lifecycle_zh-CN.W0MNXI0C-2025-10-417:04:55.png" alt="lifecycle" style="zoom:80%;" />

## 六、路由

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251004175922561-2025-10-417:59:38.png" style="zoom:80%;" />

- 路由就是**一组key-value的对应关系。**它建立了 URL 与应用程序中特定组件或视图之间的映射关系。
- 多个路由，需要经过路由器的管理。

在 Vue 中，路由是构建单页面应用（SPA）的重要组成部分。在 SPA 中，整个应用只有一个HTML页面。路由允许我们在不重新加载页面的情况下切换视图，提供更快的用户体验。

例如，当点击班级管理时，页面URL发生改变，路由器拦截页面跳转请求，根据路由规则找到目标URL对应的组件，最后将其挂载到显示区域。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20231018144351536-2025-10-418:12:17.png" style="zoom:80%;" />

### 6.1 一个单页面应用

通过一个单页面应用案例学习路由的基本使用，步骤如下：

1. 确定导航区和展示区
2. 编写相关页面组件
3. 创建并使用路由器
4. 制定路由规则
5. 挂载组件到页面

***

导航区有三个`<a>`标签：首页、新闻和关于，作为不同的页面。在其下面有一个区域用于展示对应组件。

```html
<template>
    <div class="app">
        <h2 class="title">Vue路由测试</h2>
        <!-- 导航区 -->
        <div class="navigate">
            <a href="/home" class="active">首页</a>
            <a href="/news" class="active">新闻</a>
            <a href="/about" class="active">关于</a>
        </div>
        <!-- 展示区 -->
        <div class="main-content">
			此处展示对应页面组件
        </div>
    </div>
</template>

<script lang="ts" setup name="App">

</script>

<style></style>
```

{% spoiler "相关样式"%}

```css
/* App */
.title {
    text-align: center;
    word-spacing: 5px;
    margin: 30px 0;
    height: 70px;
    line-height: 70px;
    background-image: linear-gradient(45deg, gray, white);
    border-radius: 10px;
    box-shadow: 0 0 2px;
    font-size: 30px;
}

.navigate {
    display: flex;
    justify-content: space-around;
    margin: 0 100px;
}

.navigate a {
    display: block;
    text-align: center;
    width: 90px;
    height: 40px;
    line-height: 40px;
    border-radius: 10px;
    background-color: gray;
    text-decoration: none;
    color: white;
    font-size: 18px;
    letter-spacing: 5px;
}

.navigate a.active {
    background-color: #64967E;
    color: #ffc268;
    font-weight: 900;
    text-shadow: 0 0 1px black;
    font-family: 微软雅黑;
}

.main-content {
    margin: 0 auto;
    margin-top: 30px;
    border-radius: 10px;
    width: 90%;
    height: 400px;
    border: 1px solid;
}
```

{%endspoiler%}

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251004184005764-2025-10-418:40:11.png" style="zoom:80%;" />



创建三个页面对应的component组件。路由组件通常存放在`pages` 或 `views`文件夹，一般组件通常存放在`components`文件夹。

{% spoiler 页面组件%}

首页：

```html
<template>
  <div class="home">
    <img src="https://catpaws.top/blog-resource/imgs/reply.jpg" alt="">
  </div>
</template>

<script setup lang="ts" name="Home">

</script>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

img {
  height: 300px;
}
</style>
```
新闻页：
```html
<template>
  <div class="news">
    <ul>
      <li><a href="#">新闻001</a></li>
      <li><a href="#">新闻002</a></li>
      <li><a href="#">新闻003</a></li>
      <li><a href="#">新闻004</a></li>
    </ul>
  </div>
</template>

<script setup lang="ts" name="News">
  
</script>

<style scoped>
/* 新闻 */
.news {
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  height: 100%;
}
.news ul {
  margin-top: 30px;
  list-style: none;
  padding-left: 10px;
}
.news li>a {
  font-size: 18px;
  line-height: 40px;
  text-decoration: none;
  color: #64967E;
  text-shadow: 0 0 1px rgb(0, 84, 0);
}
.news-content {
  width: 70%;
  height: 90%;
  border: 1px solid;
  margin-top: 20px;
  border-radius: 10px;
}
</style>
```

关于页：

```html
<template>
  <div class="about">
    <h2>大家好，欢迎来到尚硅谷直播间</h2>
  </div>
</template>

<script setup lang="ts" name="About">

</script>

<style scoped>
.about {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: rgb(85, 84, 84);
  font-size: 18px;
}
</style>
```

{% endspoiler%}

***

在Vue中使用 Vue Router 来实现路由，首先安装路由依赖：

```powershell
npm i vue-router
```

按照工程规范路由器定义在router目录下。

```javascript
src
 |-- router
      |-- index.ts
```

使用`createRouter`方法创建路由器，在创建时要配置路由规则并指定路由器的工作模式

```javascript
//index.ts
// 引入 createRouter 函数
import { createRouter, createMemoryHistory } from 'vue-router'

//引入可能呈现的组件
import Home from '@/views/Home.vue'
import News from '@/views/News.vue'
import About from '@/views/About.vue'

// 创建路由对象
const router = createRouter({
  //配置路由规则（是一个数组，其中包含多个对象）
  routes: [
    {
      path: '/home',
      component: Home,
    },
    {
      path: '/news',
      component: News,
    },
    {
      path: '/about',
      component: About,
    },
    {
      path: '/',
      redirect: '/home', //重定向
    },
  ],
  history: createMemoryHistory(), //设置路由器的工作模式
})

// 导出路由对象
export default router

```

在`main.ts`中引入路由器对象

```javascript
import { createApp } from 'vue'
import App from './App.vue'

// 引入路由对象
import router from './router'

const app = createApp(App)
// 使用用路由对象
app.use(router)
app.mount('#app')

```

***

- 使用`RouterView`将所跳转页面的组件渲染到展示区域。

- 使用`RouterLink`代替原来的`<a>`标签进行跳转，跳转路径写在`to`属性中

to的字符串写法：直接写路径字符串，看上去简单，但当需要传递参数时需要进行字符串拼接，十分繁琐

```html
<router-link to="/home">主页</router-link>

```

to的对象写法：内容是一个对象，跳转路径定义在`path`属性中，结构清晰，传递参数简单

```html
<!--注意：to前有`:`，内部的路径字符串用单引号-->
<router-link :to="{path:'/home'}">Home</router-link>
```



{%note info%}

通过点击导航，视觉效果上“消失” 了的路由组件，默认是被**卸载**掉的，需要的时候再去**挂载**。

{%endnote%}

```html
<template>
    <div class="app">
        <h2 class="title">Vue路由测试</h2>
        <!-- 导航区 -->
        <div class="navigate">
            <RouterLink to="/home" active-class="active">首页</RouterLink>
            <RouterLink to="/news" active-class="active">新闻</RouterLink>
            <RouterLink to="/about" active-class="active">关于</RouterLink>
        </div>
        <!-- 展示区 -->
        <div class="main-content">
            <RouterView></RouterView>
        </div>
    </div>
</template>

<script lang="ts" setup name="App">
    //引入RouterView和RouterLink
	import { RouterView, RouterLink } from 'vue-router';
</script>
<style>略</style>
```



### 6.2 路由器相关的补充

路由器的工作模式

`history`模式

- 优点：`URL`更加美观，不带有`#`，更接近传统的网站`URL`。


- 缺点：后期项目上线，需要服务端配合处理路径问题，否则刷新会有`404`错误。

  ```js
  const router = createRouter({
  	history:createWebHistory(), //history模式
  	/******/
  })
  ```

***

`hash`模式

- 优点：兼容性更好，因为不需要服务器端处理路径。


- 缺点：`URL`带有`#`不太美观，且在`SEO`优化方面相对较差。

  ```js
  const router = createRouter({
  	history:createWebHashHistory(), //hash模式
  	/******/
  })
  ```

***

路由器的 replace 属性

  1. 作用：控制路由跳转时操作浏览器历史记录的模式。

  2. 浏览器的历史记录有两种写入方式：分别为```push```和```replace```：

     - ```push```是追加历史记录（默认值）。
     - `replace`是替换当前记录。

  3. 开启`replace`模式：

     ```vue
     <RouterLink replace .......>News</RouterLink>
     ```

### 6.3 命名路由

命名路由可以简化路由跳转及传参

在路由规则中通过`name`属性为路由命名

```js
routes:[
  {
    name:'zhuye',
    path:'/home',
    component:Home
  }
]
```

直接通过名字跳转，需要to的对象写法配合name属性使用

```html
<RouterLink :to="{name:'zhuye'}">首页</RouterLink>
```

### 6.4 嵌套路由

在一条路由规则中，在`childern`属性中定义子路由

```js
  {
    name:'zhuye',
    path:'/home',
    component:Home,
    childern: [
        {
            path: 'live' //子路由前面不用加`/`
            component: Live
        },
        {
            //其他子路由
        }
    ]
  }
```

***

新增需求：在New页面，当点击其中一条新闻时，在其内部展示新闻详情。这时候每条新闻变成了导航区的内容，需要再创建一个组件来显示对应新闻的内容。

{% spoiler "新增Detail.vue"%}

```html
<template>
  <ul class="news-list">
    <li>编号：xxx</li>
    <li>标题：xxx</li>
    <li>内容：xxx</li>
  </ul>
</template>

<script setup lang="ts" name="About">

</script>

<style scoped>
  .news-list {
    list-style: none;
    padding-left: 20px;
  }

  .news-list>li {
    line-height: 30px;
  }
</style>
```

{% endspoiler%}

配置新闻页面的子路由

```js
import Detail from '@/views/Detail.vue'
routes: [
    {
      path: '/news',
      component: News,
      children: [
        {
          path: 'detail',
          component: Detail,
        },
      ],
    },
    //其他路由信息略
  ],
```

修改`News.vue`组件，添加`RouterLinke`和`RouterView`

```html
<template>
  <div class="news">
    <!-- 导航区 -->
    <ul>
      <li v-for="news in newsList" :key="news.id">
        <RouterLink to="/news/detail">{{ news.title }}</RouterLink>
      </li>
    </ul>
    <!-- 展示区 -->
    <div class="news-content">
      <RouterView></RouterView>
    </div>
  </div>
</template>

<script setup lang="ts" name="News">
import { reactive } from 'vue'
import { RouterView, RouterLink } from 'vue-router'

const newsList = reactive([
  { id: 'asfdtrfay01', title: '很好的抗癌食物', content: '西蓝花' },
  { id: 'asfdtrfay02', title: '如何一夜暴富', content: '学IT' },
  { id: 'asfdtrfay03', title: '震惊，万万没想到', content: '明天是周一' },
  { id: 'asfdtrfay04', title: '好消息！好消息！', content: '快过年了' }
])
</script>
```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251004203748962-2025-10-420:37:49.png" style="zoom:80%;" />

由于在`Detail.vue`中的内容是写死的，点击每条新闻都只能显示固定的内容。若要显示特定的新闻详情，需要涉及到路由传参。

### 6.5 路由传参

路由传参主要有以下几种方式：

1. 通过查询参数（query）传参
2. 通过动态路由参数（params）传参
3. 通过props传参
4. 通过路由元信息（meta）传参
5. 通过编程式路由传参

使用`useRoute`这个hook函数接收路由参数，

```js
import { useRoute } from 'vue-router';

let route = useRoute() //调用useRoute
console.log(route);

//假设已经传递了想要的参数
//读取query参数
let id = route.query.id
let name = route.query.name

//读取param参数
let id = route.param.id
let name = route.param.name
```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251004211241951-2025-10-421:12:43.png" alt="useRoute函数的返回值" style="zoom:80%;" />



当点击一条新闻时，尝试使用以上三种方式将新闻的参数通过路由传递给`Detail`组件

#### query传参

直接在URL后面以`?key=value`的形式传递。

格式：`/path?key1=value1&key2=value2`

```html
<!-- to的字符串写法  -->
<RouterLink :to="`/news/detail?id=${news.id}&title=${news.title}&content=${news.content}`">{{ news.title }}
</RouterLink>

<!-- to的对象写法  -->
<RouterLink :to="{
  path: '/news/detail',
  query: {
    id: news.id,
    title: news.title,
    content: news.content
  }
}">{{ news.title }}
</RouterLink>
```

在`Detail.vue`组件中接收参数

```html
<template>
  <ul class="news-list">
    <li>编号：{{ route.query.id }}</li>
    <li>标题：{{ route.query.title }}</li>
    <li>内容：{{ route.query.content }}</li>
  </ul>
</template>

<script setup lang="ts" name="About">
import { useRoute } from 'vue-router';
let route = useRoute()
console.log(route);
</script>
```

***

#### param传参

通过 URL 路径本身传递参数，适合**必要参数**

格式：`/path/value1/value2`

- 传递`params`参数时，需要提前在路由规则中占位，例如：`path: /home/:id/:name?`。
  - 占位的都是必要参数，必须传。也可以在参数后加`?`表示该参数是可选的

- 传递`params`参数时，若使用`to`的对象写法，必须使用`name`配置项，不能用`path`。

- 传递`params`参数时，不能传递对象或数组

在路由中添加参数占位，并给路由命名

```js
routes: [
    {
        path: '/news',
        component: News,
        children: [
            {
                name: 'xiangqing', //给路由命名
                path: 'detail/:id/:title/:content', //使用占位符声明接受params参数
                component: Detail,
            },
        ],
    },
]
```



```html
<!-- to的字符串写法  -->
<RouterLink :to="`/news/detail/${news.id}/${news.title}/${news.content}`">{{ news.title }}
</RouterLink>

<!-- to的对象写法  -->
<RouterLink :to="{
  name: 'xiangqing', //使用命名路由
  params: {
    id: news.id,
    title: news.title,
    content: news.content
  }
}">{{ news.title }}
</RouterLink>
```



在`Detail.vue`组件中接收参数

```html
<template>
  <ul class="news-list">
    <li>编号：{{ route.params.id }}</li>
    <li>标题：{{ route.params.title }}</li>
    <li>内容：{{ route.params.content }}</li>
  </ul>
</template>

<script setup lang="ts" name="About">
import { useRoute } from 'vue-router'
import { toRefs } from 'vue-router'    
    
let route = useRoute()
const{id, title, content} = toRefs(route.query)
</script>
```



***

#### props传参

将路由参数作为路由组件 props 传递

1. 将**params**参数作为路由组件的props传递。在路由配置中，设置props为true即可

   ```js
   routes: [
       {
           path: '/news',
           component: News,
           children: [
               {
                   name: 'xiangqing', //给路由命名
                   path: 'detail/:id/:title/:content', //使用占位符声明接受params参数
                   component: Detail,
                   props: true   //将路由参数映射到组件的props中
               },
           ],
       },
   ]
   ```

   

2. 将**query**参数作为为路由组件的props传递。通过接收`route`对象，手动将其中的`query`对象返回，作为路由组件的props。

   由于`route`对象中有当前路由的全部信息，包括`query`和`params`，理论上也能返回`params`对象，但使用第一种方法传递`params`参数更简单。

   ```js
   routes: [
       {
           path: '/news',
           component: News,
           children: [
               {
                   name: 'xiangqing', //给路由命名
                   path: 'detail', 
                   component: Detail,
                   props(route) {
     					return route.query
   				},
               },
           ],
       },
   ]
   ```

此时就不用`useRoute`接收参数了，可以直接通过`defineProps`接收传递props对象

```html
<template>
  <ul class="news-list">
    <li>编号：{{ id }}</li>
    <li>标题：{{ title }}</li>
    <li>内容：{{ content }}</li>
  </ul>
</template>

<script setup lang="ts" name="About">
	defineProps(['id', 'title', 'content']) // 接收路由传递的参数
</script>
```

#### meta传参

元信息可以用于在路由中附加一些自定义数据，这些数据可以在导航守卫或组件中访问。

在路由配置中定义meta

```js
const routes = [
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: { requiresAuth: true, title: '关于我们' }
  }
]
```

在组件中，可以通过useRoute获取meta。

```js
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
console.log(route.meta.requiresAuth) // true
console.log(route.meta.title) // '关于我们'
</script>
```



### 6.6 编程式路由

编程式路由允许在 js 代码中控制路由跳转，而不是依赖 `<router-link>` 组件。

主要通过 `useRouter` 钩子返回的 `router` 实例来实现，拿到了它就相当于拿到了路由器。之后可以通过调用 `router` 的方法来以编程的方式导航到不同的 URL。

主要的方法有：

1. `router.push`：导航到新 URL，向历史栈添加一条记录。
2. `router.replace`：导航到新 URL，替换当前历史记录。
3. `router.go`：在历史记录中前进或后退。
4. `router.foward/back`：前进或后退一条记录，是 `router.go` 的便捷方法。

`router.push/replace`的参数与 `<router-link>` 中`to`属性的写法**完全一样**，可以是一个路由字符串，也可以是一个对象。

```js
//需求：当在主页停留3s后跳转到新闻页面
import { onMounted } from 'vue';
import { useRouter } from 'vue-router'; //引入useRouter钩子

const router = useRouter(); //使用钩子获取router实例

//1、 与to属性的字符串写法写法相同
onMounted(() => {
  setTimeout(() => {
    //路由跳转
    router.push('/news');
  }, 3000);
});

//2、 与to属性的对象写法相同
onMounted(() => {
  setTimeout(() => {
    //路由跳转
    router.replace({
      path: '/news',
      query:{}
    });
  }, 3000);
```



```js
// 前进一条记录，与 router.forward() 相同
router.go(1)
// 后退一条记录，与 router.back() 相同
router.go(-1)
// 前进 3 条记录
router.go(3)
// 如果没有那么多记录，静默失败
router.go(100)
```

### 6.7 路由守卫

在 Vue 3 中，路由守卫是一种功能强大的机制，用于在路由发生变化时执行代码。它们主要用于权限验证、路由跳转控制等场景。Vue 3 提供了多种类型的路由守卫，包括**全局守卫**、**路由独享守卫**和**组件内守卫**。

#### 全局守卫

全局守卫对所有路由都有效，可以在路由跳转发生前、后或过程中执行代码。

全局守卫包括：

- **beforeEach**: 全局前置守卫，在路由跳转前被调用，可以用来进行权限验证或其他全局性的检查。
- **afterEach**: 全局后置守卫，在路由跳转后被调用，通常用于更新页面标题或执行分析代码。
- **beforeResolve**: 全局解析守卫，在路由跳转被确认之前，所有组件内守卫和异步路由组件解析完毕后被调用。

```js
import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
 history: createWebHistory(),
 routes: [...]
})
router.beforeEach((to, from, next) => {
 // 执行权限验证等操作，如用户身份验证
 next()
})
router.afterEach((to, from) => {
 // 执行跳转后的操作，如权限最终校验
})
router.beforeResolve((to, from, next) => {
 // 在导航被确认之前的操作，如页面访问统计
 next()
})
export default router
```

#### 路由独享守卫

路由独享守卫只在特定路由上有效，可以在路由配置中直接定义，在进入特定路由前执行，对某个路由进行特定的处理。

路由独享守卫只有一个：**beforeEnter**：在路由进入前被调用，可以做页面访问控制等

```js
const routes = [
 {
   path: '/example',
   component: Example,
   beforeEnter: (to, from, next) => {
     // 路由进入前的操作，如：付费内容访问控制
     next()
   }
 }
]
```

#### 组件内守卫

组件内守卫允许在路由组件内部直接定义守卫。这些守卫可以访问组件实例，通常用于处理组件级的导航逻辑。

组件内守卫包含三个：

-  **beforeRouteEnter**：组件进入守卫，在渲染该组件的对应路由被验证前调用，可以做数据预加载
- **beforeRouteUpdate**：组件更新守卫，在当前路由改变，但是该组件被复用时调用
- **beforeRouteLeave**：组件离开守卫，在导航离开渲染该组件的对应路由时调用

```js
export default {
 beforeRouteEnter(to, from, next) {
   // 在渲染该组件的对应路由被验证前调用，如数据预加载
   next()
 },
 beforeRouteUpdate(to, from) {
   // 在当前路由改变，但是该组件被复用时调用，如动态处理参数，商品详情页中切换不同商品ID时刷新数据。
 },
 beforeRouteLeave(to, from) {
   // 在导航离开渲染该组件的对应路由时调用，如表单保存提示
 }
}
```



#### next()

在Vue Router中，`next`方法是路由守卫中的一个关键参数，它用于控制导航的行为。

`next`方法的使用方式:

1. `next()`: 进行管道中的下一个钩子

2. `next(false)`: 中断当前的导航。如果传入`false`，则导航会被中断，且重置到来自`from`的路由。

3. `next('/')` 或者 `next({ path: '/' })`: 重定向到指定路由。可以通过字符串路径或者路由位置对象重定向，同时传递参数。与`route.push`用法相同。

4.  `next(error)`：错误处理。如果传入一个`Error`实例，则导航会被终止，且该错误会被传递给`router.onError()`注册过的回调。

注意：

- 每个守卫必须调用一次且仅一次 `next`以允许路由跳转。
- 在异步操作完成后调用 `next`
- 使用 `return` 确保在重定向后不会继续执行代码

放行导航用法示例：

```js
router.beforeEach((to, from, next) => {
  // 简单的条件检查后放行
  if (to.path !== '/restricted') {
    next(); // 允许导航继续
  } else {
    next('/login'); // 重定向
  }
});

router.beforeEach(async (to, from, next) => {
  try {
    // 执行异步检查
    const isValid = await validateAccess(to);
    
    if (isValid) {
      next(); // 异步操作完成后放行
    } else {
      next('/access-denied');
    }
  } catch (error) {
    next('/error');
  }
});
```

中断导航用法示例：

```js
// 在组件内的 beforeRouteLeave 守卫中使用
beforeRouteLeave(to, from, next) {
  if (this.hasUnsavedChanges) {
    // 显示确认对话框
    const confirmLeave = confirm('您有未保存的更改，确定要离开吗？');
    
    if (confirmLeave) {
      next(); // 用户确认离开
    } else {
      next(false); // 取消导航，停留在当前页面
    }
  } else {
    next(); // 没有未保存更改，正常离开
  }
}

//条件中断
router.beforeEach((to, from, next) => {  
  // 检查网络连接
  if (!navigator.onLine && to.meta.requiresOnline) {
    showOfflineMessage();
    next(false); // 中断导航
    return;
  }
  next(); // 条件满足，继续导航
});
```

重定向导航用法示例：

```js
//字符串路径重定向
router.beforeEach((to, from, next) => {
  // 简单的路径重定向
  if (to.path === '/old-path') {
    next('/new-path'); // 重定向到新路径
    return;
  }
  
  if (to.path === '/') {
    next('/dashboard'); // 默认重定向
    return;
  }
  
  next();
});

//路由位置对象重定向

router.beforeEach((to, from, next) => {
  // 未认证用户访问需要认证的页面
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({
      path: '/login',
      query: {
        redirect: to.fullPath,    // 保存目标路径
        reason: 'authentication', // 重定向原因
        timestamp: Date.now()     // 时间戳
      },
      replace: true // 替换当前历史记录
    });
    return;
  }
  
  // 已认证用户访问登录页
  if (to.path === '/login' && isAuthenticated()) {
    next({
      name: 'Dashboard', // 使用命名路由
      params: { welcome: true }
    });
    return;
  }
  
  next();
});
```

next的错误处理用法：

```js
router.beforeEach((to, from, next) => {
  try {
    // 执行复杂的验证逻辑
    performComplexValidation(to);
    next(); // 验证通过
  } catch (error) {
    // 传递错误对象，触发全局错误处理
    next(error);
  }
});

// 全局错误处理
router.onError((error) => {
  console.error('导航错误:', error);
  
  // 根据错误类型处理
  if (error.name === 'ValidationError') {
    showValidationError(error.message);
  } else if (error.name === 'NetworkError') {
    showNetworkError();
  } else {
    showGenericError();
  }
});
```

#### 执行顺序

一个完整的完整的导航解析流程如下：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251005000038956-2025-10-500:00:45.png" alt="完整的导航解析流程" style="zoom:80%;" />

当进行权限校验时：全局守卫进行基础校验 → 路由独享守卫进行特定校验 → 组件守卫进行最终校验

## 七、pinia

Pinia 是 Vue.js 的官方**状态管理库**，它允许你跨组件或页面共享状态。[官网](https://pinia.vuejs.org/zh/)

{%note info%}

状态管理是前端开发中的一个核心概念，它指的是在应用程序中**集中**管理、存储和更新组件的共享状态。在复杂的应用中，多个组件可能需要访问和修改相同的数据，状态管理提供了一种统一的方式来处理这些数据，使得数据流变得可预测和易于维护。

{%endnote%}

***

为什么需要pinia?

在Vue中，组件通常有自己的局部状态（例如，一个计数器组件的计数值）。但是，当多个组件需要共享状态时，可以通过以下方式：

1. **父子组件通信**：通过props将状态从父组件传递给子组件，通过事件向上传递修改。但当组件层次深、兄弟组件之间需要共享状态时，这种方式会变得复杂。
2. **事件总线/全局事件**：通过一个全局的事件系统来通信，但这样容易导致代码难以维护和调试。
3. **状态管理库**：如Pinia、Vuex、Redux等，它们提供了一个全局的状态容器，任何组件都可以访问和修改，同时遵循一定的规则，使得状态的变化可预测。

### 7.1 安装和使用

首先，在项目中安装pinia

```bash
npm install pinia
```

然后，在`main.ts`中创建并安装 pinia实例

```js
import { createApp } from 'vue'
import App from './App.vue'
//1、引入pinia
import { createPinia } from 'pinia'
const app = createApp(App)
//2、创建pinia实例
const pinia = createPinia()
//3、安装pinia
app.use(pinia)
app.mount('#app')
```

### 7.2 store

`Store`是一个保存：**状态**、**业务逻辑** 的实体，每个组件都可以**读取**、**写入**它。

各个store通常集中保存在`src\store`目录下，命名规范：以 `use` 开头，以 `Store` 结尾。比如 `useUserStore`，`useCartStore`

Pinia 使用 `defineStore` 函数来定义一个 store。

- `defineStore()` 的返回值的命名与文件名相同，遵循命名规范。

- 它的第一个参数是唯一 id 。
- 它的第二个参数可接受两类值：Setup 函数或 Option 对象。

每个store可以包含 **state**、**getters** 和 **actions**，定义在它的第二个参数中。

- state：应用程序的**数据源**，即需要管理的各种数据。
- getters：基于 state 的**计算属性**，用于派生状态。
- actions：**修改 state 的方法**，可以包含异步操作，用于处理业务逻辑。

***

选项式API写法，第二个参数是传入一个带有 `state`、`actions` 与 `getters` 属性的 Option 对象

```js
import { defineStore } from "pinia";

//创建并导出容器
export const useCountStore = defineStore("count", {
  //存储数据
  state: () => ({
    sum: 6,
    name: "zhangsan",
  }),
  //类似计算属性
  getters: {
    bigSum: (state) => state.sum * 10,
  },
  //专门用于修改state
  actions: {
    add(num: number) {
      this.sum += num; //使用this访问数据
    },
    isEvenNumber() {
      return this.sum % 2 === 0;
    },
  },
});

```



组合式API写法：第二个参数传入一个函数，类似于`setup()`函数，该函数定义了一些响应式属性和方法，并且返回一个带有我们想暴露出去的属性和方法的对象。

```js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useCountStore = defineStore("count", () => {
  //存储数据：state
  let sum = ref(6);

  //计算属性：getter
  let bigSum = computed(() => sum.value * 10);

  //专门用于修改state：action
  function add(num: number) {
    sum.value += num;
  }
  function isEvenNumber() {
    return sum.value % 2 === 0;
  }

  //导出需要使用的数据和方法
  return { sum, bigSum, add, isEvenNumber };
});

```

***

正确使用Store： Store 存储的应该是在需要整个应用中访问的数据，避免在 Store 中引入那些原本可以在组件中保存的本地数据，例如，一个元素在页面中的可见性。

### 7.3. state

state 是store 的核心，存储应用数据。

- 在选项式API中，state 是一个返回初始状态的函数
- 在组合式API中，state 是函数中定义的 数据，需要手动导出

#### 读取数据

1. 引入并获取对应的store实例

   ```js
   //引入store
   import { useCountStore } from "@/store/useCountStore"; 
   //获得 store实例
   const countStore = useCountStore()
   console.log(countStore);
   ```

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251005114733860-2025-10-511:47:44.png" alt="store的结构" style="zoom:80%;" />

2. 读取数据

   store是一个`Proxy`对象，在state中定义的数据`sum`变成了它的`ref`对象属性。此外，整体的state被封装成代理对象`$state`，定义的数据存储在其中。因此有两种读取方法：

   ```js
   //1、store实例.属性
   console.log(countStore.sum);
   //2、通过$state获取
   console.log(countStore.$state.sum);
   ```

***

可以借助`storeToRefs()`将`store`中的数据转为`ref`对象，方便在模板中使用。

注意：`pinia`提供的`storeToRefs`只会将**数据（包括计算属性）**做转换，而`Vue`的`toRefs`会转换`store`中的所有数据。

```html
<template>
  <div class="count">
    <h2>当前求和 {{ sum }}</h2>
    <h2>姓名：{{ name }}</h2>
  </div>
</template>

<script setup lang="ts" name="Count">
import { useCountStore } from "@/store/useCountStore";
//引入storeToRefs    
import { storeToRefs } from "pinia";
//得到countStore    
const countStore = useCountStore()
//使用storeToRefs转换countStore，随后解构
let { sum, name } = storeToRefs(countStore)
</script>
```



#### 修改数据

1. 直接修改

   ```js
   countStore.sum += 1
   ```

2. 批量修改：`$patch` 方法

   允许你用一个 `state` 的补丁对象在同一时间更改多个属性

   ```js
   countStore.$patch({
       sum: countStore.sum + n.value,
       name: '张三'
   })
   ```

3. 借助`action`修改

   在actions中自定义修改逻辑，使用时进行调用

   ```js
   //定义action方法
   function add(num: number) {
       sum.value += num;
       name.value = "王五";
   }
   
   //调用action方法
   countStore.add(10)
   ```

   

#### 订阅数据变化

通过 store 的 `$subscribe()` 方法侦听 `state` 及其变化，它接收两个参数：

1. `mutation`：本次的修改信息，
2. `state`: 修改后的数据

```js
countStore.$subscribe((mutation, state) => {
    //state数据每次发生变化时调用
    //比如，每当状态发生变化时，将整个 state 持久化到本地存储
    localStorage.setItem('count', JSON.stringify(state))
})
```

在底层实现上，`$subscribe()` 使用了 Vue 的 `watch()` 函数，可以传入与 `watch()` 相同的选项。



### 7.4 getter

getter 完全等同于 store 的 state 的**计算属性**。

采用组合式API时，直接使用计算属性代替getter即可。因此，可以像组合计算属性一样组合getter。

```js
export const useCountStore = defineStore("count", () => {
  //存储数据：state
  let sum = ref(6);
  let name = ref("zhangsan");

  //计算属性：getter
  let bigSum = computed(() => sum.value * 10);
  let bigSumPlusOne = computed(() => bigSum.value + 1); //使用其他计算属性

  //导出需要使用的数据和方法
  return { sum, bigSum, name, bigSumPlusOne};
});
```

作为 store 的一个属性，可以直接访问任何 getter(与 state 属性完全一样)

***

在选项式API中，可以通过 `getters` 属性来定义它们。**推荐**使用箭头函数，并且它将接收 `state` 作为第一个参数。你可以

<u>在使用常规函数</u>定义 getter 时，可以通过 `this` 访问到**整个 store 实例**，进而访问到其他任何 getter。**但在 TypeScript 中必须定义返回类型**。

```js
export const useCountStore = defineStore("count", {
  //存储数据
  state: () => ({
    sum: 6,
    name: "zhangsan",
  }),
  //类似计算属性
  getters: {
    bigSum: (state) => state.sum * 10,
    
    //调用其他的getters
    bigSumPlusOne(): number {
      return this.bigSum + 1;
    }
  },
});

```

### 7.5 actions

action 相当于组件中的`method`，可以定义一些业务逻辑。

此外，**`action` 可以是异步的**，你可以在它们里面 `await` 调用任何 API，以及其他 action



## 八、组件通信

**`Vue3`组件通信和`Vue2`的区别：**

* 移除事件总线，使用`mitt`代替。

- `vuex`换成了`pinia`。
- 把`.sync`优化到了`v-model`里面了。
- 把`$listeners`所有的东西，合并到`$attrs`中了。
- `$children`被砍掉了。

**常见搭配形式：**

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20231119185900990-2025-10-522:35:14.png"  style="zoom:60%;" />

### 8.1 props



## 九、其他API

## 十、Vue3 新组件