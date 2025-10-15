---
title: JavaWeb基础（一）前端相关
abbrlink: 4b1cca40
tags:
  - HTML
  - CSS
  - JavaScript
  - Vue
  - AJAX
  - Axios
categories:
  - JavaWeb
date: 2024-12-09 12:08:45
index_img: https://catpaws.top/blog-resource/imgs/art-post5.jpg
---

<meta name = "referrer", content = "no-referrer"/>


# 一、前端相关

## 1.1、HTML相关标签

[HTML教程](https://www.runoob.com/html/html-tutorial.html)


> 注：在HTML中无论输入多少个空格，只会显示一个。可以使用空格占位符：`&nbsp;`

## 1.2、css样式 

[CSS3教程](https://www.runoob.com/css3/css3-tutorial.html)    [CSS参考手册](https://www.w3school.com.cn/cssref/index.asp#google_vignette)

- css引入方式
  - 行内样式：写在标签的style属性中`<h1 style="...">  `（不推荐）
  - 内嵌样式：写在style标签中 `<style>.</style>`（可以写在页面任何位置，但通常约定写在head标签中）
  - 外联样式：写在一个单独的.css文件中：`<link href="...">`（需要通过 link 标签在网页中引入）

- 颜色表示
  - 关键字：red、green.
  - rgb表示法：rgb（255，0，0）、rgb（134，100，89）
  - 十六进制：#ff0000、#cccccc、#ccc

- css选择器 （用来选取需要设置样式的元素（标签））

  ![image-20240428102417186](https://gitee.com/cmyk359/img/raw/master/img/image-20240428102417186-2024-5-918:42:43.png)

  优先级：id选择器  > 类选择器 > 元素选择器

- css页面布局

  ![image-20240428105655324](https://gitee.com/cmyk359/img/raw/master/img/image-20240428105655324-2024-5-918:42:45.png)

  ![image-20240428110005175](https://gitee.com/cmyk359/img/raw/master/img/image-20240428110005175-2024-5-918:42:47.png)

  - 相关css属性

    width：设置宽度
    height：设置高度
    border：设置边框的属性，如：1px solid#000；

    padding：内边距
    margin：外边距
    注意：

    1、padding和margin分别有四个边界，设置值时的顺序为 **上右下左**

    2、如果只需要设置某一个方位的边框、内边距、外边距，可以在属性名后加上-位置，如：padding-top、padding-left、padding-right….

## 1.3、JavaScript

[JavaScript参考手册](https://www.w3school.com.cn/jsref/index.asp)

### JS引入方式

> #### js引入方式

![image-20240428112704651](https://gitee.com/cmyk359/img/raw/master/img/image-20240428112704651-2024-5-918:43:16.png)

> #### js基础语法

1. 书写语法（与java程序完全一致）

   ![image-20240428113648353](https://gitee.com/cmyk359/img/raw/master/img/image-20240428113648353-2024-5-918:43:36.png)

   - 输出语句
     - 使用`window.alert()`写入警告框
     - 使用 `document.write()`写入 HTML 输出
     - 使用 `console.log()`写入浏览器控制台

2. 变量

   JavaScript是一门弱类型语言，变量可以存放不同类型的值。

   ```javascript
   var a = 10;
   a = "张三";
   ```

   

   - 用`var`关键字声明变量
     - 作用域比较大，**全局变量**
     - 可以重复定义，后定义的覆盖之前的
   - 用`let`关键字声明变量

     所声明的变量，只在let关键字所在的代码块内有效，**局部变量**。不允许重复声明
   - 用`const`关键字声明<u>常量</u>，其值不能改变

   

3. 数据类型、运算符、流程控制语句

   **数据类型**

   JavaScript中分为：原始类型 和 引用类型。使用`typeof`运算符可以获取数据类型。

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240428115836276-2024-5-918:43:40.png" alt="image-20240428115836276" style="zoom:80%;" />

   **运算符**

   <div align = "left"> <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240428120023229-2024-5-918:44:39.png" alt="image-20240428120023229" style="zoom:80%;" /> </div>

   

   其中，`==`在进行比较时会进行类型转化，`===`在进行比较时不会进行类型转化（必须类型一样，值一样）
   
   ```javascript
   var age = 20; 
   var _age = "20"; 
   var Sage = 20; 
   alert (age age);//true 
   alert (age age);//false 
alert (age Sage) ;//true
   ```

   ![image-20240428121232842](https://gitee.com/cmyk359/img/raw/master/img/image-20240428121232842-2024-5-918:43:45.png)

   **流程控制语句**
   
   <div align="left"><img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240428121540761-2024-5-918:44:56.png" alt="image-20240428121540761" style="zoom:80%;" /></div>
   
   

> **js函数**

**函数定义**

JavaScript 函数通过` function `关键字进行定义，语法为：

```js
//方法一
function functionName(参数1,参数2.....) {//函数体}
//方法二
var functionName = function(参数1,参数2.....) {//函数体}
    
//函数调用：函数名称（实际参数列表）
    
```

注：

1. 由于JavaScript是弱类型语言，形式参数不需要类型，返回值也不需要定义类型。需要返回的可以在函数内部直接使用return返回即可。
2. JS中，函数调用可以传递任意个数的参数，但具体函数会根据自己的参数个数相应接收，多出来的不接收

### JS对象

#### **JS基础对象** 

- **Array**

  ![image-20240428190747477](https://gitee.com/cmyk359/img/raw/master/img/image-20240428190747477-2024-5-918:45:38.png)

  JavaScript中的数组相当于Java中集合，数组的长度是可变的，而JavaScript是弱类型，所以可以存储任意的类型的数据。

  ```javascript
      <script>
        var arr = [1, 2, 3, "hello", true]; //数组可以存储任意类型
        arr[10] = 8; //由于数组长度可变，可以在任意位置存储
        console.log(arr[10]) //8
        console.log(arr[9]) //undefined，该位置未被初始化
        console.log(arr[8]) //undefined，该位置未被初始化
        console.log(arr); 
      </script>
  ```

  ![image-20240428182931419](https://gitee.com/cmyk359/img/raw/master/img/image-20240428182931419-2024-12-912:09:40.png)

  ![image-20240428191056054](https://gitee.com/cmyk359/img/raw/master/img/image-20240428191056054-2024-5-918:45:45.png)

  ```javascript
      <script>
        var arr = [1, 2, 3, "hello", true];
        arr[10] = 8;
  
        //遍历数组中所有的元素
        for (let i = 0; i < arr.length; i++) {
          console.log(arr[i]);
        }
        console.log("--------------------------------");
  
        //遍历数组中有值的元素，每遍历一个元素就调用一次传入的函数
        arr.forEach(function (e) {
          console.log(e);
        });
  
        //使用箭头函数简化函数的定义
        //箭头函数：(参数) => {函数体}
        arr.forEach((e)=>{  
          console.log(e);
        })
        arr.push(7,8,9);
        arr.splice(2,2);//删除从下标为2开的两个数组元素
      </script>
  ```

- **String**

  ![image-20240428191203260](https://gitee.com/cmyk359/img/raw/master/img/image-20240428191203260-2024-5-918:45:51.png)

  

- JavaScript自定义对象

  ![image-20240428190617022](https://gitee.com/cmyk359/img/raw/master/img/image-20240428190617022-2024-5-918:45:58.png)

- **JSON**

  JSON（`J`ava`S`cript `O`bject` N`otation，JavaScript对象标记法）,JSON 是通过 JavaScript 对象标记法书写的**文本**。由于其语法简单，层次结构鲜明，现多用于作为数据载体，在网络中进行数据传输。

  ![image-20240428185748370](https://gitee.com/cmyk359/img/raw/master/img/image-20240428185748370-2024-5-918:46:05.png)

  ```javascript
      <script>
        //定义JSON，注：其中的键必须用双引号包含
        var jsonStr =
          '{"name":"liming", "age":18, "addr":["北京","上海","西安"]}';
  
        //JSON字符串==>JSON对象
        var jsonObj = JSON.parse(jsonStr);
        console.log(jsonObj.name); //通过 `对象.属性` 的方式访问数据
  
        //JSON对象 ==>JSON字符串
        var str = JSON.stringify(jsonObj);
        console.log(str);
      </script>
  ```

#### **浏览器对象模型BOM**

		[参考手册](https://www.w3school.com.cn/jsref/obj_window.asp)

- 概念：`B`rowser `O`bject `M`odel浏览器对象模型，允许JavaScript与浏览器对话，JavaScript将浏览器的各个组成部分封装为对象。
- 组成
  - **Window：浏览器窗口对象**
  - Navigator：浏览器对象
  - Screen：屏幕对象
  - History：历史记录对象
  - **Location：地址栏对象**

![image-20240428204731206](https://gitee.com/cmyk359/img/raw/master/img/image-20240428204731206-2024-5-918:46:09.png)

```javascript
    <script>
      //获取
      window.alert("Hello BOM");
      alert("hello bom");

      //方法：
      //1、confirm 对话框。确认-->返回true；取消-->返回false。
      var flag = window.confirm("您确定删除这条记录吗？");
      alert(flag);

      //2、定时器 setInterval(func,时间ms),周期性执行某个函数
      var i = 0;
      window.setInterval(() => {
        i++;
        console.log("该方法执行了" + i + "次");
      }, 2000);

      //3、定时器  setTimeout(func,时间ms)，延迟指定时间后执行一次
      window.setTimeout(() => {
        alert("hello");
      }, 3000);
    </script>
```



![image-20240428205739043](https://gitee.com/cmyk359/img/raw/master/img/image-20240428205739043-2024-5-918:46:17.png)

```javascript
    <script>
      alert(window.location.href);
      location.href = "https://www.baidu.com"; //浏览器自动跳转到指定地址
    </script>
```



#### **文档对象模型DOM**

`D`ocument `O`bject `M`odel，文档对象模型。

![image-20240429091016585](https://gitee.com/cmyk359/img/raw/master/img/image-20240429091016585-2024-5-918:46:21.png)

![image-20240429091239798](https://gitee.com/cmyk359/img/raw/master/img/image-20240429091239798-2024-5-918:46:26.png)

![image-20240429091558233](https://gitee.com/cmyk359/img/raw/master/img/image-20240429091558233-2024-5-918:46:29.png)



[HTML标签对象 参考手册](https://www.w3school.com.cn/jsref/dom_obj_anchor.asp)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JSTest</title>
  </head>
  <body>
    <img id="h1" src="img/news_logo.png" />
    <br /><br />
    <div class="cls">传智教育</div>
    <div class="cls">黑马程序员</div>
    <br />
    <br />
    <input type="checkbox" name="hobby" /> 电影
    <input type="checkbox" name="hobby" /> 旅游
    <input type="checkbox" name="hobby" /> 游戏
  </body>
  <script>
    /*1、获取Element对象*/

    //1.1 获取元素--根据ID获取
    var img = document.getElementById("h1");
    alert(img);

    //1.2 获取元素 -- 根据标签获取
    var divs = document.getElementsByTagName("div");
    for (let i = 0; i < divs.length; i++) {
      alert(divs[i]);
    }

    //1.3 获取元素 -- 根据name属性获取
    var hobbys = document.getElementsByName("hobby");
    for (let id = 0; id < hobbys.length; id++) {
      const element = hobbys[id];
      alert(element);
    }

    //1.4 获取元素 -- 根据class属性获取
    var cls = document.getElementsByClassName("cls");
    for (let i = 0; i < cls.length; i++) {
      alert(cls[i]);
    }

    /*2、查询参考手册，调用该对象的属性和方法*/
    divs[0].innerHTML = "传智教育666";
  </script>
</html>

```





### JS事件监听

**常见事件**

<div align = "left">  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240429094019410-2024-5-918:46:50.png" alt="image-20240429094019410" style="zoom:80%;" /></div>



**事件绑定**

<div align = "left"><img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240429094206629-2024-5-918:47:25.png" alt="image-20240429094206629" style="zoom:80%;" /></div>



```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JSTest</title>
  </head>
  <body>
    <img id="pic" src="img/shuangshuang.png" width="250px" />
    <br /><br />
    <input type="button" value="点亮" onclick="on()" />
    <input type="button" value="熄灭" onclick="off()" />
    <br />
    <br />
    <input type="text" id="name" value="ITCAST" />
    <br />
    <br />
    <input type="checkbox" name="hobby" /> 电影
    <input type="checkbox" name="hobby" /> 旅游
    <input type="checkbox" name="hobby" /> 游戏
    <input type="button" value="全选" onclick="selectAll()" />
    <input type="button" value="反选" onclick="removeAll()" />
  </body>
  <script>
    //1、点击“点亮”或“熄灭”按钮，切换图片
    function on() {
      var img = document.getElementById("pic");
      img.src = "img/shuangshuang.png";
    }

    function off() {
      var img = document.getElementById("pic");
      img.src = "img/lihanshuang.png";
    }

    //2、input输入框，获得焦点时，设置其内容为大写；失去焦点时，设置内容为小写。
    var inputText = document.getElementById("name");
    inputText.onfocus = () => {
      var text = inputText.value;
      inputText.value = text.toUpperCase();
    };
    inputText.onblur = () => {
      var text = inputText.value;
      inputText.value = text.toLowerCase();
    };
    //3、点击“全选”按钮，选择所有选项；点击“反选”按钮，取消所有选项。
    var hobbys = document.getElementsByName("hobby");
    function selectAll() {
      for (let index = 0; index < hobbys.length; index++) {
        const element = hobbys[index];
        element.checked = true;
      }
    }
    function removeAll() {
      for (let index = 0; index < hobbys.length; index++) {
        const element = hobbys[index];
        element.checked = false;
      }
    }
  </script>
</html>

```

## 1.4、Vue

Vue 是一套**前端框架**，免除原生JavaScript中的DOM操作，简化书写。基于`MVVM`（Model-View-ViewModel）思想，实现数据的双向绑定，将编程的关注点放在数据上。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240430100738759-2024-5-918:47:39.png" alt="image-20240430100738759" style="zoom:80%;" />

![image-20240430101038318](https://gitee.com/cmyk359/img/raw/master/img/image-20240430101038318-2024-5-918:47:43.png)

### 常用指令

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240430103300388-2024-5-918:47:47.png" alt="image-20240430103300388" style="zoom:80%;" />



输入vue指令时，可以通过不写指令中的`-`,获得vue的语法提示

```html
<!--Vue指令测试-->

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VueTest</title>
    <script src="js/vue.js"></script>
  </head>
  <body>
    <div id="app">
      <!-- 1、 v-bind指令:绑定HTML标签的属性值 -->
      <a v-bind:href="url">链接1</a>
      <!-- 也可直接省略v-bind只保留 ： -->
      <a :href="url">链接2</a>

      <!-- 2、 v-model指令：在表单元素上创建双向数据绑定  -->
      <input type="text" v-model="url" />
      <br />
      <hr />
      <!-- 3、 v-on指令：为HTML标签绑定事件  写法 v-on:事件=“function”，简化写法@事件=“function”-->
      <input type="button" value="按钮1" v-on:click="handler()" />
      <input type="button" value="按钮2" @click="handler()" />
      <br />
      <hr />
      <!-- 4、v-if & v-else-if & v-else 根据条件判断是否渲染该元素-->
      <input type="text" v-model="age" />
      <span v-if="age <= 35">年龄判定为年轻人</span>
      <span v-else-if="age >35 && age <= 60">年龄判定中年人 </span>
      <span v-else> 年龄判定老年人</span><br />
      <!-- 5、 v-show：根据判断条件动态设置标签的display属性来决定是否展示，会渲染该元素-->
      <input type="text" v-model="age" />
      <span v-show="age <= 35">年龄判定为年轻人</span>
      <span v-show="age >35 && age <= 60">年龄判定中年人 </span>
      <span v-show="age > 60"> 年龄判定老年人</span>
      <br />
      <hr />
      <!-- 6、v-for：列表渲染，遍历容器的元素或者对象的属性 -->
      <!-- 其中，括号内第一个是数组元素，index是对应元素的下标;不需要下标也可不指定-->
      <div v-for="(addr,index) in address">{{index+1}}：{{addr}}</div>
      <div v-for="addr in address">{{addr}}</div>
    </div>
  </body>
  <script>
    new Vue({
      el: "#app", //Vue接管的区域
      data: {
        //Vue的数据模型
        url: "https://www.baidu.com",
        age: 20,
        address: ["北京", "上海", "广州", "西安"],
      },
      methods: {
        handler: function () {
          alert("我被点击了");
        },
      },
    });
  </script>
</html>

```



指令练习案例

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240430105352837-2024-5-918:47:53.png" alt="image-20240430105352837" style="zoom:80%;" />

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VueTest</title>
    <script src="js/vue.js"></script>
  </head>
  <body>
    <div id="app">
      <table border="l" cellspacing="0" width="60%">
        <tr>
          <th>编号</th>
          <th>姓名</th>
          <th>年龄</th>
          <th>性别</th>
          <th>成绩</th>
          <th>等级</th>
        </tr>
        <tr v-for="(user,index) in users" align="center">
          <td>{{index+1}}</td>
          <td>{{user.name}}</td>
          <td>{{user.age}}</td>
          <td>
            <span v-if="user.gender==1">男</span>
            <span v-if="user.gender == 2">女</span>
          </td>
          <td>{{user.score}}</td>
          <td>
            <span v-if="user.score >=85">优秀</span>
            <span v-else-if="user.score >= 60">及格</span>
            <span style="color: red" v-else>不及格</span>
          </td>
        </tr>
      </table>
    </div>
  </body>
  <script>
    new Vue({
      el: "#app", //Vue接管的区域，election的缩写
      data: {
        //Vue的数据模型
        users: [
          {
            name: "Tom",
            age: 20,
            gender: 1,
            score: 78,
          },
          {
            name: "Rose",
            age: 18,
            gender: 2,
            score: 86,
          },
          {
            name: "Jerry",
            age: 26,
            gender: 1,
            score: 90,
          },
          {
            name: "Tony",
            age: 30,
            gender: 1,
            score: 52,
          },
        ],
      },
      methods: {
        handler: function () {
          alert("我被点击了");
        },
      },
    });
  </script>
</html>

```

### 生命周期

![image-20240430111829086](https://gitee.com/cmyk359/img/raw/master/img/image-20240430111829086-2024-5-918:47:58.png)

（1）beforeCreate
在实例初始化(new Vue())后执行，此时的数据监听和事件绑定机制都未完成，获取不到DOM节点。（可以在此阶段加loading事件，在加载实例时触发）

（2）created
这个阶段vue实例已经创建，以下内容已被配置完毕：数据侦听、计算属性、方法、事件/侦听器的回调函数。但挂载阶段还没开始，仍然获取不到DOM元素。（在此阶段，初始化完成时的事件写在这里，如在这结束loading事件，也可以进行异步请求）

（3）beforeMount
在这个阶段完成了DOM的初始化，但仍然无法获取到具体的DOM元素，因为vue还没有进行根节点挂载，但是根节点已经创建完成，下面Vue对DOM的操作将围绕这个根节点进行。（beforeMount这个阶段是过渡性的，在项目中使用得比较少）

（4）mounted
在这个阶段，实例已经被挂载完成了，也就是能获取到数据和DOM元素了。

（注意 mounted 不会保证所有的子组件也都被挂载完成。如果你希望等到整个视图都渲染完毕再执行某些操作，可以在 mounted 内部使用 vm.$nextTick.）

```vue
mounted: function () {
  this.$nextTick(function () {
    // 仅在整个视图都被渲染之后才会运行的代码
  })
}
```

（5）beforeUpdate
在数据发生改变，但页面还没有完成更新时执行的操作，在此阶段视图的数据和DOM元素的数据没有保持同步。（这里适合在现有 DOM 将要被更新之前访问它，比如移除手动添加的事件监听器）

（6）updated
这个时候数据发生了改变，并且视图页面也已经完成了更新，因此，该阶段看到的DOM元素的内容是最新内容。

（注意updated 不会保证所有的子组件也都被重新渲染完毕。如果你希望等到整个视图都渲染完毕，可以在 updated 里使用 vm.$nextTick）

（7）beforeDestroy
此阶段Vue实例仍然完全可用，也就是还能访问到页面的响应式数据和事件。（可以在这里注销eventBus等事件）

（8）destroyed
DOM元素被销毁，此时对应 的Vue 实例所有指令都被解绑，所有的事件监听器被移除，所有的子实例也都被销毁。

<img src="https://gitee.com/cmyk359/img/raw/master/img/vue生命周期-2024-5-918:48:04.jpeg" alt="img" style="zoom:150%;" />

## 1.5、AJAX

### 原生AJAX

![image-20240430113437411](https://gitee.com/cmyk359/img/raw/master/img/image-20240430113437411-2024-5-918:48:10.png)

[AJAX参考手册](https://www.w3school.com.cn/js/js_ajax_intro.asp)

### Axios

Axios对原生的Ajax进行了封装，简化书写，快速开发。[官网](https://www.axios-http.cn/)

**Axios入门**

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240430114238650-2024-5-918:48:14.png" alt="image-20240430114238650" style="zoom:80%;" />

**Axios简化格式**

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240430114852949-2024-5-918:48:18.png" alt="image-20240430114852949" style="zoom:80%;" />

![image-20240430115502624](https://gitee.com/cmyk359/img/raw/master/img/image-20240430115502624-2024-5-918:48:23.png)

思路：在vue的monuted生命周期的钩子中调用Axios异步请求，当页面挂载完成后，发起请求，并将返回的数据保存在vue对象的emps中。通过vue渲染，将返回数据添加到页面

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AxiosTest</title>
    <script src="js/Axios.js"></script>
    <script src="js/vue.js"></script>
  </head>
  <body>
    <div id="app">
      <table border="l" cellspacing="0" width="60%">
        <tr>
          <th>编号</th>
          <th>姓名</th>
          <th>图像</th>
          <th>性别</th>
          <th>职位</th>
          <th>入职日期</th>
          <th>最后操作时间</th>
        </tr>
        <tr v-for="(emp,index) in emps" align="center">
          <td>{{index + 1}}</td>
          <td>{{emp.name}}</td>
          <img:src="emp.image" width="70px" height="50px">
          <td>
            <span v-if="emp.gender == 1">男</span>
            <span v-if="emp.gender == 2">女</span>
          </td>
          <td>{{emp.job}}</td>
          <td>{{emp.entrydate}}</td>
          <td>{{emp.updatetime}}</td>
        </tr>
      </table>
    </div>
  </body>
  <script>
    new Vue({
      el: "#app",
      data: {
        emps: [],
      },
      mounted() {
        axios.get("http://yapi.smart-xwork.cn/mock/169327/emp/list").then((result)=>{
            this.emps = result.data.data; //将返回数据传给这个vue对象的emps
        });
      },
    });
  </script>
</html>

```

# 二、前端工程化

前后端分离开发的流程

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240430170553838-2024-5-918:48:28.png" alt="image-20240430170553838" style="zoom:80%;" />

## 2.1、接口文档管理 YAPI

[官网](https://yapi.pro/)

[YAPI教程](https://hellosean1025.github.io/yapi/documents/index.html)



> Swagger和Yapi

1、Yapi 是设计阶段使用的工具，管理和维护接口

2、Swagger 在开发阶段使用的框架，帮助后端开发人员做后端的接口测试



**YApi**是高效、易用、功能强大的api管理平台，旨在为开发、产品、测试人员提供更优雅的接口管理服务。

1、添加项目

![image-20240430173411596](https://gitee.com/cmyk359/img/raw/master/img/image-20240430173411596-2024-5-918:48:32.png)



2、根据业务添加分类，方便管理接口。如添加用户管理

![image-20240430173504098](https://gitee.com/cmyk359/img/raw/master/img/image-20240430173504098-2024-5-918:48:37.png)



3、在该分类下创建API接口

![image-20240430173756736](https://gitee.com/cmyk359/img/raw/master/img/image-20240430173756736-2024-12-912:15:40.png)



4、在对应接口的编辑页面完善接口内容，保存即可

![image-20240430173854156](https://gitee.com/cmyk359/img/raw/master/img/image-20240430173854156-2024-5-918:48:40.png)

![image-20240430173919563](https://gitee.com/cmyk359/img/raw/master/img/image-20240430173919563-2024-12-912:16:40.png)

![image-20240430174239605](https://gitee.com/cmyk359/img/raw/master/img/image-20240430174239605-2024-5-918:48:49.png)

5、预览所设置的API信息

![image-20240430174514866](https://gitee.com/cmyk359/img/raw/master/img/image-20240430174514866-2024-5-918:48:53.png)



6、使用Mock地址测试API返回数据

点击对应接口的Mock地址，可获取模拟的返回数据

![image-20240430174628011](https://gitee.com/cmyk359/img/raw/master/img/image-20240430174628011-2024-5-918:49:02.png)

7、使用高级Mock设置，配置模拟数据的具体信息，如设置默认返回的数据

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240430174858481-2024-5-918:49:06.png" alt="image-20240430174858481" style="zoom:80%;" />

## 2.2、工程化的Vue

### 安装vue-cli

使用Vue提供的脚手架vue-cli初始化前端项目<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240430175347229-2024-5-918:49:10.png" alt="image-20240430175347229" style="zoom:80%;" />

安装好node.js后使用 `npm install -g @vue/cli`安装vue脚手架，最后使用`vue --version`查看安装是否成功

### vue项目创建

![image-20240430190113243](https://gitee.com/cmyk359/img/raw/master/img/image-20240430190113243-2024-5-918:49:14.png)

![image-20240430190256107](https://gitee.com/cmyk359/img/raw/master/img/image-20240430190256107-2024-5-918:49:24.png)

![image-20240430190518763](https://gitee.com/cmyk359/img/raw/master/img/image-20240430190518763-2024-5-918:49:28.png)

补：在`vue.config.js`中配置vue项目的端口

```js
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
    
  devServer: {
    port:7000,
  }
    
})

```

### vue项目运行流程

![image-20240430210431807](https://gitee.com/cmyk359/img/raw/master/img/image-20240430210431807-2024-5-918:49:32.png)

其中index.html中展示的内容是来自组件文件App.vue中定义的元素，在main.js中使用render函数生成了对应的虚拟DOM元素，最终将这个vue对象挂载到 id为 app的div中，将内容展示出来。



> **Vue的组件文件以.vue结尾，每个组件由三个部分组成：`<template>、<script>、<style>`。**

![image-20240430210929199](https://gitee.com/cmyk359/img/raw/master/img/image-20240430210929199-2024-5-918:49:36.png)



`ElementView.vue`

```vue
<template>
  <div>
    <h1>{{ message }}</h1>
  </div>
</template>

<!--（输入script时选择JavaScript.vue这个选项，回车即可）-->
<script>
//将所定义的数据模型和方法导出成一个默认模块，在其他地方才能import 
export default {
  //定义数据模型，通过data函数定义，并将数据对象return出去（直接敲data回车即可）
  data() {
    return {
      message:"Hello Vue"
    }
  },
  //定义方法
  methods: {
    
  },
}
</script>

<style>
</style>

```



### Vue的组件库 ElementUI

[快速上手 ElementUI](https://element.eleme.cn/#/zh-CN)

Element：是饿了么团队研发的，一套为开发者、设计师和产品经理准备的基于Vue的桌面端组件库。

> #### 快速入门

![image-20240430212514880](https://gitee.com/cmyk359/img/raw/master/img/image-20240430212514880-2024-5-918:49:43.png)

在需要使用该组件的template中，先输入左尖括号，再输入ElementView，此时vue已经识别出这个组件，回车即可完成该组件的导入和添加

![image-20240430213636310](https://gitee.com/cmyk359/img/raw/master/img/image-20240430213636310-2024-5-918:49:48.png)

> #### Element常用组件

`CTRL + ALT + L` 格式化代码



1. 组件--Table 表格：用于展示多条结构类似的数据，可对数据进行排序、筛选、对比或其他自定义操作。

   ![image-20240430215306618](https://gitee.com/cmyk359/img/raw/master/img/image-20240430215306618-2024-5-918:49:54.png)

2. 组件--Pagination分页：当数据量过多时，使用分页分解数据。

   ![image-20240430215240125](https://gitee.com/cmyk359/img/raw/master/img/image-20240430215240125-2024-5-918:49:56.png)

   ```vue
   <!-- pagination 分页组件 -->
   <el-pagination background layout="total, prev, pager, next, jumper" :total="1000">
   </el-pagination>
   ```

   layout属性：组件布局，子组件名用逗号分隔。prev, pager, next, jumper, ->, total

   | 事件名称       | 说明                     | 回调参数 |
   | -------------- | ------------------------ | -------- |
   | size-change    | pageSize 改变时会触发    | 每页条数 |
   | current-change | currentPage 改变时会触发 | 当前页   |

3. 组件--Dialog对话框：在保留当前页面状态的情况下，告知用户并承载相关操作。

   ![image-20240430221347648](https://gitee.com/cmyk359/img/raw/master/img/image-20240430221347648-2024-5-918:50:12.png)

   通过对话框的`visible.sync`属性，控制其展示或隐藏

   ```vue
   <!-- Table -->
   <el-button type="text" @click="dialogTableVisible = true">打开嵌套表格的 Dialog</el-button>
   
   <el-dialog title="收货地址" :visible.sync="dialogTableVisible">
     <el-table :data="gridData">
       <el-table-column property="date" label="日期" width="150"></el-table-column>
       <el-table-column property="name" label="姓名" width="200"></el-table-column>
       <el-table-column property="address" label="地址"></el-table-column>
     </el-table>
   </el-dialog>
   ```

   

4. 组件-Form表单：由输入框、选择器、单选框、多选框等控件组成，用以收集、校验、提交数据。

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240430223333647-2024-5-918:50:14.png" alt="image-20240430223333647" style="zoom:80%;" />

   在 Form 组件中，每一个表单域由一个 Form-Item 组件构成，表单域中可以放置各种类型的表单控件，包括 Input、Select、Checkbox、Radio、Switch、DatePicker、TimePicker

```vue
<!-- Form表单 嵌套在Dialog中-->
        <el-button type="text" @click="dialogFormVisible = true">打开嵌套表单的 Dialog</el-button>

        <el-dialog title="Form表单" :visible.sync="dialogFormVisible">
            <el-form ref="form" :model="form" label-width="80px">
                <el-form-item label="活动名称">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="活动区域">
                    <el-select v-model="form.region" placeholder="请选择活动区域">
                        <el-option label="区域一" value="shanghai"></el-option>
                        <el-option label="区域二" value="beijing"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="活动时间">
                    <el-col :span="11">
                        <el-date-picker type="date" placeholder="选择日期" v-model="form.date1"
                            style="width: 100%;"></el-date-picker>
                    </el-col>
                    <el-col class="line" :span="2">-</el-col>
                    <el-col :span="11">
                        <el-time-picker placeholder="选择时间" v-model="form.date2" style="width: 100%;"></el-time-picker>
                    </el-col>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmit">提交</el-button>
                    <el-button>取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
```



### Vue路由

![image-20240430234745953](https://gitee.com/cmyk359/img/raw/master/img/image-20240430234745953-2024-5-918:50:20.png)

- 安装Vue Router

  ```js
  npm install vue-router@3.5.1
  ```

- 定义路由

  在rouer目录下的index.js中配置页面对应的请求路径

  ![image-20240501002059928](https://gitee.com/cmyk359/img/raw/master/img/image-20240501002059928-2024-5-918:50:26.png)

- 使用 router-link进行跳转

  浏览器最终会将`router-link`解析为一个超链接，点击即可跳转到指定路由

  ![image-20240501002303426](https://gitee.com/cmyk359/img/raw/master/img/image-20240501002303426-2024-5-918:50:33.png)

- 动态加载展示

  在要切换组件的位置使用 `<router-view></router-view>`，动态展示某个组件

  

### 案例

设计一个页面，包含顶部Header，侧边栏和中心内容展示区域	

侧边栏包含两个功能：部门管理和员工管理，默认进入员工管理界面。点击进行切换

当页面加载完成时，使用Axios异步从Mock链接获取数据加载到页面表格中。

![image-20240501003019740](https://gitee.com/cmyk359/img/raw/master/img/image-20240501003019740-2024-5-918:50:36.png)

## 2.3、打包部署

1、使用`npm run build`对前端工程进行打包，会在当前目录下生成一个dist文件夹，其中就是打包后的内容

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240501094931349-2024-5-918:50:38.png" alt="image-20240501094931349" style="zoom:80%;" />

2、将其部署到NGINX服务器

**Nginx**是一款轻量级的web服务器/反向代理服务器及电子邮件（IMAP/POP3）代理服务器。其特点是占有内存少，并发能力强，在各大型互联网公司都有非常广泛的使用。其目录结构如下：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240501095113499-2024-5-918:50:41.png" alt="image-20240501095113499" style="zoom:80%;" />

![image-20240501095225148](https://gitee.com/cmyk359/img/raw/master/img/image-20240501095225148-2024-5-918:50:45.png)