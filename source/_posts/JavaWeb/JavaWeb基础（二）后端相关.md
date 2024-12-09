---
title: JavaWeb基础（二）后端相关
tags:
  - Spring
  - Springboot原理
  - IOC
  - DI
  - MyBatis
  - Maven
categories:
  - JavaWeb
abbrlink: 68ec802
date: 2024-12-09 12:25:40
---


<meta name = "referrer", content = "no-referrer"/>




![image-20240509183750447](https://gitee.com/cmyk359/img/raw/master/img/image-20240509183750447-2024-5-918:38:46.png)



## 一、maven

### 1.1、概述

**Maven**是apache旗下的一个开源项目，是一款用于管理和构建java项目的工具。

作用：

- 依赖管理。方便快捷的管理项目依赖的资源（jar包），避免版本冲突问题。只需将要使用的jar包的依赖加入`pom.xml`中，maven会自动下载导入，方便对其进行管理

- 统一项目结构。提供标准、统一的项目结构

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240501100246270-2024-5-918:50:55.png" alt="image-20240501100246270" style="zoom:80%;" />

- 项目构建标准跨平台（Linux、Windows、MacOS）的自动化项目构建方式。提供多平台通用的项目构建指令

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240501100401906-2024-5-918:51:02.png" alt="image-20240501100401906" style="zoom:80%;" />





### 1.2、安装步骤

1. 下载解压 apache-maven-3.6.1-bin.zip

2. 配置本地仓库：修改 conf/settings.xml 中的 `<localRepository> `为一个指定目录。

   ```xml
   <localRepository>E:\develop\apache-maven-3.6.1\mvn_repo</localRepository>
   ```

   

3. 配置阿里云私服：修改 conf/settings.xml 中的 `<mirrors>`标签，为其添加如下子标签：

   ```xml
   <mirror>
   	<id>alimaven</id>
   	<name>aliyun maven</name>
   	<url>http://maven.aliyun.com/nexus/content/groups/public/</url>
   	<mirrorOf>central</mirrorOf>
   </mirror>
   ```

   

4. 配置环境变量：MAVEN_HOME 为maven的解压目录，并将其bin目录加入PATH环境变量。



### 1.3、在idea中配置Maven环境

![image-20240501102342977](https://gitee.com/cmyk359/img/raw/master/img/image-20240501102342977-2024-5-918:51:05.png)



### 1.4、Maven坐标

- 什么是坐标

  - Maven 中的坐标是**资源的唯一标识，通过该坐标可以唯一定位资源位置。**
  - 使用坐标来定义项目或引入项目中需要的依赖。

- Maven坐标主要组成

  - groupld：定义当前Maven项目隶属组织名称（通常是域名反写，例如：com.itheima）
  - artifactld：定义当前Maven项目名称（通常是模块名称，例如 order-service、goods-service）
  - version：定义当前项目版本号

  ```xml
  <dependency>
  	<groupld>ch.qos.logback</groupld>
  	<artifactid>logback-classic</artifactid>
  	<version>1.2.3</version>
  </dependency>
  ```

### 1.5、IDEA导入Maven项目

![image-20240501105109534](https://gitee.com/cmyk359/img/raw/master/img/image-20240501105109534-2024-5-918:51:09.png)

![image-20240501105243121](https://gitee.com/cmyk359/img/raw/master/img/image-20240501105243121-2024-5-918:51:15.png)

### 1.6、依赖管理

#### 依赖配置

依赖：当前项目运行所需要的jar包，一个项目中可以引入多个依赖。

配置：

1. 在 pom.xml 中编写 `<dependencies> `标签
2. 在`<dependencies>` 标签中使用`<dependency>` 引入坐标
3. 定义坐标的groupld，artifactld，version



​	需要什么依赖就去 [Maven仓库](https://mvnrepository.com/)搜索下载对应的依赖，添加到pox.xml文件的`<dependencies>`中，maven会下载导入该依赖。如：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>maven_project_01</artifactId>
    <version>1.0-SNAPSHOT</version>
    
	<!--    将依赖在这里添加-->
    <dependencies>
        <dependency>
            <groupId>ch.qos.logback</groupId>
            <artifactId>logback-classic</artifactId>
            <version>1.5.6</version>
        </dependency>
    </dependencies>
</project>
```

​	

#### 依赖传递

依赖具有传递性：

- 直接依赖：在当前项目中通过依赖配置建立的依赖关系
- 间接依赖：被依赖的资源如果依赖其他资源，当前项目间接依赖其他资源

![image-20241209150346440](https://gitee.com/cmyk359/img/raw/master/img/image-20241209150346440-2024-12-915:04:23.png)

排除依赖：

排除依赖指主动断开依赖的资源，被排除的资源无需指定版本。projectA不想使用projectB中的某个依赖时，可以使用`<exclusions>`排除依赖

![image-20241209150632297](https://gitee.com/cmyk359/img/raw/master/img/image-20241209150632297-2024-12-915:06:33.png)

#### 依赖范围

依赖的jar包，默认情况下，可以在任何地方使用。可以通过`<scope>...</scope>`设置其作用范围。

作用范围：

- 主程序范围有效。（main文件夹范围内）
- 测试程序范围有效。（test文件夹范围内）
- 是否参与打包运行。（package指令范围内）

![image-20241209150812630](https://gitee.com/cmyk359/img/raw/master/img/image-20241209150812630-2024-12-915:08:13.png)



#### 生命周期

Maven的生命周期就是为了对所有的maven项目构建过程进行抽象和统一。

Maven中有3套**相互独立**的生命周期：

- clean：清理工作。
- default：核心工作，如：编译、测试、打包、安装、部署等。
- site：生成报告、发布站点等。

每套生命周期包含一些阶段（phase），阶段是有顺序的，后面的阶段依赖于前面的阶段。

> 在同一套生命周期中，当运行后面的阶段时，前面的阶段都会运行。
>
> 如：运行package阶段会运行之前的compile和test阶段，并不会运行clean阶段，因为它们属于不同的生命周期



![image-20241209151204171](https://gitee.com/cmyk359/img/raw/master/img/image-20241209151204171-2024-12-915:12:10.png)



一些重要的什么周期阶段的职责：

- clean：移除上一次构建生成的文件
- compile：编译项目源代码
- test：使用合适的单元测试框架运行测试（junit）
- package：将编译后的文件打包，如：jar、war等
- install：安装项目到本地仓库

![image-20241209151350389](https://gitee.com/cmyk359/img/raw/master/img/image-20241209151350389-2024-12-915:13:51.png)

执行指定声明周期的两种方式

- 在idea中，右侧的maven工具栏，选中对应的生命周期，双击执行。
- 在命令行中，通过命令执行。

![PixPin_2024-12-09_15-16-08](https://gitee.com/cmyk359/img/raw/master/img/PixPin_2024-12-09_15-16-08-2024-12-915:19:29.png)



如果想要跳过某些阶段，如在package的过程中跳过test阶段，点击test，再点击小闪电即可跳过该模块

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240501114000111-2024-5-918:51:58.png" alt="image-20240501114000111" style="zoom:80%;" />

## 二、HTTP协议

`H`yper `T`ext `T`ransfer `P`rotocol，超文本传输协议，规定了浏览器和服务器之间数据传输的规则。

### 2.1、HTTP请求的数据格式

![image-20241209152227266](https://gitee.com/cmyk359/img/raw/master/img/image-20241209152227266-2024-12-915:22:28.png)

包含三部分：

- 请求行

  第一行，由三部分组成：请求方式、资源路径和协议。

- 请求头

  第二行开始，格式为 key : value

- 请求体

  Post方式所特有的，用来存放请求参数。

> - 请求方式-GET：请求参数在**请求行**中，没有请求体，如：`/brand/findAll？name=OPPO&status=1`，GET请求大小是有限制的。
> - 请求方式-POST：请求参数在**请求体**中，POST请求大小是没有限制的。



常见的请求头的含义![image-20240501190830361](https://gitee.com/cmyk359/img/raw/master/img/image-20240501190830361-2024-5-918:52:08.png)

### 2.2、HTTP响应的数据格式

包含三部分：

- 响应行

  位于相应数据第一行，包含协议、状态码和相关描述。

- 响应头

  从第二行开始，格式为：key : value

- 响应体

  最后一部分，存放相应数据

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240501191754933-2024-5-918:52:11.png" alt="image-20240501191754933" style="zoom:80%;" />



响应状态码 [状态码大全](https://cloud.tencent.com/developer/chapter/13553)

![image-20240501192042349](https://gitee.com/cmyk359/img/raw/master/img/image-20240501192042349-2024-5-918:52:15.png)

响应头格式

![image-20240501191939039](https://gitee.com/cmyk359/img/raw/master/img/image-20240501191939039-2024-5-918:52:20.png)

### 2.3、HTTP解析

​	现在主要通过Web服务器来完成。**Web服务器**对HTTP协议操作进行封装，简化web程序开发；可以部署web项目，对外提供网上信息浏览服务。**Tomcat**一个轻量级的web服务器，支持servlet、jsp等少量javaEE规范。也被称为web容器、servlet容器。 

## 三、请求响应

### 3.1、请求参数

![image-20240503090114509](https://gitee.com/cmyk359/img/raw/master/img/image-20240503090114509-2024-5-918:52:26.png)



#### 简单参数

- 原始方式

  在原始的web程序中，获取请求参数，需要通过`HttpServletRequest`对象手动获取。

  ```java
  @RequestMapping（"/simpleParam"）
  public String simpleParam（HttpServletRequest request）{
      String name = request.getParameter（"name"）;
      String ageStr = request.getParameter（"age"）;
      int age = Integer.parseint（ageStr）;
      System.out.println（name+"："+age）;
      return"OK"；
  }
  ```

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241209153920637-2024-12-915:39:21.png" alt="image-20241209153920637" style="zoom:80%;" />

  

- SpringBoot方式

  简单参数：参数名与形参变量名相同，定义形参即可接收参数。
  
  ```java
  @ RequestMapping("/simpleParam")
  public String simpleParam(String name , Integer age){
  	System.out.println(name+": "+age);
      return "OK";   
  }
  ```
  
  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241209154118637-2024-12-915:41:19.png" alt="image-20241209154118637" style="zoom:80%;" />
  
  若传递的参数和函数形参变量名不同，则得到的值为`null`。若要使用两个不同的参数名，则使用`@RequestParam`完成映射。
  
  ```java
  @RequestMapping("/simpleParam")
  public String simpleParam(
      //会将请求参数中name属性的值，映射到username这个变量上
      @RequestParam(value = "name", required = false) String username, 
      int age) {
      
      System.out.println(username+":"+age);
      return "ok";
  }
  ```
  
  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241209154458280-2024-12-915:45:15.png" alt="image-20241209154458280" style="zoom:80%;" />





#### 实体参数

> 简单实体参数

​	当传递参数太多或者具有某种结构属性时，可以将其封装为一个实体对象。创建实体类xxx，在其中定义与请求参数名相同的属性名，设置get和set方法，springboot会自动请求参数封装到一个对象中。即：请求参数名与形参对象属性名相同，定义POJO接收即可

```java
Public class User {
    private String name;
    private Integer age;
}
```

```java
@RequestMapping（"/simplePojo"）
public String simplePojo(User user) {
    System.out.println(user);
    return"OK";
}
```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241209155024205-2024-12-915:50:40.png" alt="image-20241209155024205" style="zoom:80%;" />



> 复杂实体参数

当一个类的属性是另一个类的对象时，传递的参数是复杂实体参数。请求参数名与形参对象属性名相同，按照对象**层次结构关系**即可接收嵌套POJO属性参数。

```java
public class User {
    private String name;
    private Integer age;
    private Address address;
}

public class Address {
    private String province;
    private String city;
}
```

```java
@RequestMapping（"/complexPojo"）
public String complesPojo(User user) {
    System.out.println(user);
    return"OK";
}
```



![image-20241209155618690](https://gitee.com/cmyk359/img/raw/master/img/image-20241209155618690-2024-12-915:56:40.png)



#### 数组集合参数

请求参数名与**形参数组名称**相同且请求参数为多个，定义数组类型形参即可接收参数

```java
@RequestMapping("/arrayParam")
public String arrayParam(String[]hobby){
    System.out.println（Arrays.toString(hobby));
    return"OK";
}
```

![image-20241209160226768](https://gitee.com/cmyk359/img/raw/master/img/image-20241209160226768-2024-12-916:02:40.png)



也可使用集合接收参数。默认用数组接收，要使用集合接收时，需使用`@RequestParam`绑定参数关系

```java
@RequestMapping("/arrayParam")
public String arrayParam(@RequestParam List<String>hobby){
    System.out.println（Arrays.toString(hobby));
    return"OK";
}
```

#### 	日期参数

使用`@DateTimeFormat`注解完成日期参数格式转换

```java
@RequestMapping("/dateParam")
public String dateParam(
    //指定前端传递的日期格式，请求参数名称和形参名称保持一致
    @DateTimeFormat（pattern ="yyyy-MM-dd HH:mm:ss")LocalDateTime updateTime){
 	System.out.println(updateTime);
    return "OK";
}
```

![image-20241209160746102](https://gitee.com/cmyk359/img/raw/master/img/image-20241209160746102-2024-12-916:08:40.png)



#### JSON参数

后端使用实体对象接收JSON数据，JSON数据`键名`与形参`对象属性名`相同，同时使用`@RequestBody`标识

```java
public class User {
    private String name;
    private Integer age;
    private Address address;
}

public class Address {
    private String province;
    private String city;
}
```

```java
@RequestMapping（"/jsonParam"）
public String jsonParam(@RequestBody User user) {
    System.out.println(user);
    return"OK";
}
```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241209161110433-2024-12-916:11:40.png" alt="image-20241209161110433" style="zoom:80%;" />



传递JSON参数使用post方法，json格式的数据需要在请求体中传递到后端。在postman中传递JSON数据的方法

![image-20240503103956956](https://gitee.com/cmyk359/img/raw/master/img/image-20240503103956956-2024-5-918:53:24.png)





#### 路径参数

通过请求URL直接传递参数，使用`{...}`来标识该路径参数，需要使用`@PathVariable`获取路径参数

```java
@RequestMapping("/path/{id}")
public String pathParam(@PathVariable Integer id) {
 	System.out.println(id);
    return"OK";  
}
```

![image-20241209161510698](https://gitee.com/cmyk359/img/raw/master/img/image-20241209161510698-2024-12-916:15:11.png)



有多个路径参数时：

```java
@RequestMapping("/path/{id}/{name}")
public String pathParam(@PathVariable Integer id, @PathVariable String name) {
 	System.out.println(id);
    return"OK";  
}
```

![image-20241209161804011](https://gitee.com/cmyk359/img/raw/master/img/image-20241209161804011-2024-12-916:18:29.png)

### 3.2、响应数据

![image-20241209162140240](https://gitee.com/cmyk359/img/raw/master/img/image-20241209162140240-2024-12-916:21:41.png)

`@ResponseBody`  

- 类型：**方法注解**，**类注解**

- 位置：Controller方法上/类上

- 作用：将**方法返回值**直接响应，<u>如果返回值类型是 实体对象/集合，将会转换为JSON格式响应</u>

- 说明：` @RestController = @Controller + @ResponseBody`

  

#### 设置统一响应结果

对于不同的返回数据，有不同的返回格式，前端解析时需要按照不同方法操作，不便开发和维护

![image-20240503110657053](https://gitee.com/cmyk359/img/raw/master/img/image-20240503110657053-2024-5-918:53:37.png)



```java
package com.example.pojo;

/**
 * @ClassName Result
 * @Description TODO 统一响应结果封装类
 * @Author 86152
 * @Date 2024/5/3 11:08
 * @Version 1.0
 */
public class Result {
    private Integer code; //1 成功， 0 失败
    private String msg;//提示信息
    private Object data;//响应数据 data

    public Result() {}
    public Result(Integer code, String msg, Object data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    //静态方法，方便快速创建Result对象
    public static Result success() {
        return new Result(1,"sucess",null);
    }
    public static Result success(Object data) {
        return new Result(1,"sucess",data);
    }
    public static Result error(String msg) {
        return new Result(0,msg,null);
    }

    @Override
    public String toString() {
        return "Result{" +
                "code=" + code +
                ", msg='" + msg + '\'' +
                ", data=" + data +
                '}';
    }
}

```



```java
@RestController
public class ResponseController {

    @RequestMapping("/getAddress")
    public Result getAddress() {
        Address address = new Address();
        address.setProvince("陕西省");
        address.setCity("西安");
        return Result.success(address);
    }
}
```

![image-20240503111753128](https://gitee.com/cmyk359/img/raw/master/img/image-20240503111753128-2024-5-918:53:42.png)



## 四、分层解耦

### 4.1、三层架构

![image-20241209162222532](https://gitee.com/cmyk359/img/raw/master/img/image-20241209162222532-2024-12-916:22:23.png)

- controller：控制层，接收前端发送的请求，对请求进行处理，并响应数据。
- service：业务逻辑层，处理具体的业务逻辑。
- dao：数据访问层（Data Access Object）（持久层），负责数据访问操作，包括数据的增、删、改、查。

### 4.2、IOC（控制翻转）*

之前Controller层调用Service层方法是通过在类内主动创建一个特定的Service对象，并调用该对象的方法来实现的（service层调dao层的方法同理）。在这种方式下，若service层增加新的实现类，在Controller层使用该类时，需修改之前的创建对象，改为new 新对象。每次变动 , 都需要修改大量代码 .耦合度高。**传统方式下是程序主动去创建依赖对象，控制权在程序员手上。`IOC`这种`设计思想`是将设计好的对象交给IOC容器（或spring容器）管理，由IOC容器来控制对象的创建，成为IOC容器的bean。**此时，程序不再具有主动性，而是被动的接收对象，把主动权交给了调用者。



没有IoC的程序中 , 我们使用面向对象编程 , 对象的创建与对象间的依赖关系完全硬编码在程序中，对象的创建由程序自己控制，控制反转后将对象的创建转移给第三方。所谓控制反转就是：**获得依赖对象的方式反转了，由主动的编程变成被动的接收.**。



Springboot中通过`注解`将类交给IOC容器，在运行时创建对象。

![image-20240504154537635](https://gitee.com/cmyk359/img/raw/master/img/image-20240504154537635-2024-5-918:53:55.png)

### 4.3、DI（依赖注入）*

​	**控制反转IoC(Inversion of Control)，是一种设计思想，DI(依赖注入)是实现IoC的一种方法**。loC的一个重点是在系统运行中，**动态的向某个对象提供它所需要的其他对象**，这一点是通过DI（Dependency Injection，依赖注入）来实现的。Java 1.3之后一个重要特征是反射（reflection），它允许程序在运行的时候动态的生成对象、执行对象的方法、改变对象的属性，spring就是通过反射来实现注入的。



​	通过在需要注入的类属性上添加**自动注入的注解**，spring就会在运行时适当的时候从IOC容器中创建一个bean，并注入到该属性中。

- `@Autowired`注解，默认是按照类型进行，如果存在多个相同类型的bean，将会报出如下错误

  ![image-20241209162514910](https://gitee.com/cmyk359/img/raw/master/img/image-20241209162514910-2024-12-916:25:40.png)

如果同类型的bean存在多个，可以通过以下几种方案完成注入

- `@Primary` 指定bean的优先级，添加该注解，说明优先注入同类型中的哪个bean
- `@Qualifier（"bean的名称"）+ @Autowired`，两个注解配合使用，指定要注入bean的名称（创建时没有指定时，默认为类名首字母小写）
- `@Resource（name-"bean的名称"`，@Resource是JDK的注解，默认你按照名称注入

## 五、[MySQL](https://catpaws.top/8d742da7/)

## 六、[MyBatis](web-02-Mybatis.md)

### 6.1、快速入门

#### 连接配置

```yaml
application.propoties
#驱动类名称
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
#数据库连接的url
spring.datasource.url=jdbc:mysql://localhost:3306/mybatis_01?serverTimezone=Hongkong&amp;useSSL=false&amp;useUnicode=true&amp;characterEncoding=UTF-8
#连接数据库的用户名
spring.datasource.username=root
#连接数据库的密码
spring.datasource.password=liuhao123
#配置mybatis的日志，指定输出到控制台
mybatis.configuration.log-impl=org.apache.ibatis.logging.stdout.StdOutImpl


pom.xml相关
需手动指定MySQL连接的版本
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.0.32</version>
    <scope>runtime</scope>
</dependency>

```

#### 配置MySQL提示

默认在mybatis中编写SQL语句是不识别的。可以做如下配置:

![image-20241209163040488](https://gitee.com/cmyk359/img/raw/master/img/image-20241209163040488-2024-12-916:31:19.png)

当完成语言注入后，在sql语句中输入表名时，MyBatis并没有给出提示甚至报红，无法识别。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241209163302625-2024-12-916:33:03.png" alt="image-20241209163302625" style="zoom:67%;" />

产生的原因是Idea和数据库没有建立连接，不识别表信息。需要在Idea中配置MySQL数据库连接

![image-20241209163420385](https://gitee.com/cmyk359/img/raw/master/img/image-20241209163420385-2024-12-916:34:21.png)



#### JDBC和Mybatis

JDBC：（Java DataBase Connectivity），就是使用Java语言操作关系型数据库的一套API。

![image-20241209163537712](https://gitee.com/cmyk359/img/raw/master/img/image-20241209163537712-2024-12-916:35:38.png)

它是sun公司官方定义的一套操作所有关系型数据库的**规范**即接口。各个数据库厂商去实现这套接口，提供数据库驱动ar包。我们可以使用这套接口（JDBC）编程，真正执行的代码是驱动jar包中的实现类。



![image-20240505094254808](https://gitee.com/cmyk359/img/raw/master/img/image-20240505094254808-2024-5-918:54:23.png)

#### 数据库连接池

​	数据库连接池是个容器，负责分配、管理数据库连接（Connection）。它允许应用程序重复使用一个现有的数据库连接，而不是再重新建立一个。释放空闲时间超过最大空闲时间的连接，来避免因为没有释放连接而引起的数据库连接遗漏

优势：

- 资源重用
- 提升系统响应速度
- 避免数据库连接遗漏

![image-20241209163852325](https://gitee.com/cmyk359/img/raw/master/img/image-20241209163852325-2024-12-916:39:10.png)

常见产品：

- C3P0

- DBCP

- Druid

  由阿里巴巴开源的数据库连接池项目，功能强大，性能优秀，是Java语言最好的数据库连接池之一。

- Hikari

  SpringBoot默认采用的数据库连接池



切换Druid数据库连接池

```xml
<!-- https://mvnrepository.com/artifact/com.alibaba/druid-spring-boot-starter -->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid-spring-boot-starter</artifactId>
    <version>1.2.19</version>
</dependency>
```

#### LomBok

​	Lombok是一个实用的Java类库，能通过注解的形式自动生成构造器、getter/setter、equals、hashcode、toString等方法，并可以自动化生成日志变量，简化java开发、提高效率。

![image-20241209164307613](https://gitee.com/cmyk359/img/raw/master/img/image-20241209164307613-2024-12-916:43:08.png)

```xml
<!-- https://mvnrepository.com/artifact/org.projectlombok/lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId> 
</dependency>
```





### 6.2、MyBatis基础操作（CRUD）



**使用注解来映射简单语句会使代码显得更加简洁，但对于稍微复杂一点的语句，Java 注解不仅力不从心，还会让你本就复杂的 SQL 语句更加混乱不堪。 因此，如果你需要做一些很复杂的操作，最好用 XML 来映射语句。**

**选择何种方式来配置映射，以及认为是否应该要统一映射语句定义的形式，完全取决于你和你的团队。 换句话说，永远不要拘泥于一种方式，你可以很轻松的在基于注解和 XML 的语句映射方式间自由移植和切换。**



#### 使用注解开发

##### 删除操作

```java
@Mapper
public interface EmpMapper {

    @Delete("delete from emp where id = #{id}")
    public int deleteUser(Integer id);

}
```

![image-20240505162729553](https://gitee.com/cmyk359/img/raw/master/img/image-20240505162729553-2024-5-918:54:45.png)



预编译sql性能更高（会将优化后的sql缓存起来），更安全（防止sql注入）

![image-20240505165633607](https://gitee.com/cmyk359/img/raw/master/img/image-20240505165633607-2024-5-918:54:49.png)

![image-20240505165445199](https://gitee.com/cmyk359/img/raw/master/img/image-20240505165445199-2024-5-918:54:54.png)



##### 新增操作

主键返回：@Options注解只能搭配Insert语句使用，会自动将生成的主键值，赋值给emp对象的id属性。经过Options注解，Mybatis会自动把数据库生成的主键值写入到实体类中。

```java
@Mapper
public interface EmpMapper {
	//主键返回：将当前创建记录的主键封装在emp对象的id属性中，可以通过get方法获取
    @Options(useGeneratedKeys = true,keyProperty = "id")
    
    //有多个参数时，使用对应的实体类封装起来，通过参数占位符获取对象的属性
    @Insert("insert into emp(username, name, gender, image, job, entrydate, dept_id, create_time, update_time)" +
            "values (#{username},#{name},#{gender},#{image},#{job},#{entrydate},#{deptId},#{createTime},#{updateTime})")
    public void addUser(Emp emp);
}
```





##### 更新操作

```java
@Mapper
public interface EmpMapper {
    //更新员工信息
    @Update("update emp " +
            "set username = #{username}, name = #{name}, gender = #{gender}, image = #{image}, job = #{job}, entrydate = #{entrydate}, dept_id = #{deptId}, update_time = #{updateTime}" +
            " where id = #{id};")
    public void updateUser(Emp emp);
}
```



##### 查询操作

1、根据id查询员工

```java
@Mapper
public interface EmpMapper {
    //将查询到的记录封装到实体类Emp的一个对象中
    @Select("select * from emp where  id = #{id}")
    public Emp getUserById(Integer id);
    
    @Test
    void selectTest() {
        Emp emp = empMapper.getUserById(19);
        System.out.println(emp);
    }
}
```

查看封装结果：由于数据库采用下划线命名，而java使用驼峰命名，两者名称不一致，数据没有封装进去

![image-20240505172402159](https://gitee.com/cmyk359/img/raw/master/img/image-20240505172402159-2024-12-921:38:01.png)

- 实体类属性名和数据库表查询返回的字段名一致，mybatis会自动封装。
- 如果实体类属性名 和 数据库表查询返回的字段名不一致，不能自动封装。

![image-20241209164557149](https://gitee.com/cmyk359/img/raw/master/img/image-20241209164557149-2024-12-916:45:58.png)

- 方案一：给字段起别名，让别名与实体类属性保持一致

  ```java
      @Select("select id, username, password, name, gender, image, job, entrydate, dept_id deptId, create_time createTime, update_time updateTime from emp where  id = #{uid}")
      public Emp getUserById(Integer id);
  ```

- 方案二：通过`@Results`和`@Result`进行手动封装

  ```java
      @Results({
              @Result(column = "dept_id",property = "deptId"),
              @Result(column = "create_time",property = "createTime"),
              @Result(column = "update_time",property = "updateTime")
      })
      @Select("select * from emp where id = #{id}")
      public Emp getUserById(Integer id);
  ```

  

- [x]  方案三：开启MyBatis驼峰命名自动映射开关，完成 a_cloumn ----> aColumn (推荐)

  ```yaml
  #application.properties
  
  #开启mybatis驼峰命名自动映射开关 a_cloumn ----> aColumn
  mybatis.configuration.map-underscore-to-camel-case=true
  
  ```

2、复杂查询

例：要求查询员工，且：

- 根据输入的 员工姓名、员工性别、入职时间 搜索满足条件的员工信息。
- 其中 员工姓名，支持模糊匹配；性别 进行精确查询；入职时间进行范围查询。
- 支持分页查询。
-  并对查询的结果，根据最后修改时间进行倒序排序。

对应的SQL语句：

```sql
select *
from emp 
where name like'%张%'
		and gender=1 
		and entrydate between'2010-01-01'
		and'2020-01-01'
order by update_time desc;
```



```java
@Select("select * " +
            "from emp " +
            "where name like concat('$',#{name},'$') and gender = #{gender} and entrydate between #{begin} and #{end} " +
            "order by  update_time desc")
    public List<Emp> getUserList(String name, short gender, LocalDate begin, LocalDate end);
```

![image-20241209165105204](https://gitee.com/cmyk359/img/raw/master/img/image-20241209165105204-2024-12-916:51:19.png)

![image-20240505180035515](https://gitee.com/cmyk359/img/raw/master/img/image-20240505180035515-2024-5-918:55:12.png)





##### 补充

![image-20240505180332250](https://gitee.com/cmyk359/img/raw/master/img/image-20240505180332250-2024-5-918:55:46.png)



@Param的作用就是**给参数命名**，比如在mapper里面某方法A（int id），当添加注解后A（@Param("userId") int id），也就是说外部想要取出传入的id值，**只需要取它的参数名userId就可以了**。将参数值传如SQL语句中，通过#{userId}进行取值给SQL的参数赋值。



- 方法存在多个参数，所有参数前面必须加上 @Param("")注解

当使用@Param给参数命名后，在xml或注解形式下使用 #{}取值



**XML形式下**：

- **@Param注解单一属性**
  - 这里给参数配置@param注解后，Mybatis会自动将参数封装成**Map类型**，而@param注解的值会成为Map中的key，因此在sql中可以通过配置的注解值来使用参数。
  - 使用注解传递参数,这时是不涉及单独一个类型的,所以**去掉parameterType属性**

- **@Param注解JavaBean对象**
  - 当参数是JavaBean类型时，使用@param注解后就不能直接使用，而是要通过**点取值**的方式。
  - 在没有注解时，可以直接使用该JavaBean的属性



#### 使用XML文件开发

使用XML文件开发，需要遵循以下规范

- XML映射文件的名称与Mapper接口名称一致，并且将XML映射文件和Mapper接口放置在相同包下（同包同名）。
- XML映射文件的namespace属性为Mapper接口全限定名一致。
- XML映射文件中sql语句的id与Mapper 接口中的方法名一致，并保持返回类型一致。



![image-20241209165322631](https://gitee.com/cmyk359/img/raw/master/img/image-20241209165322631-2024-12-916:53:23.png)



使用mybatis完成数据库操作是通过执行mapper接口中的方法，但这个方法并没有指定实际执行的sql语句，`关键是如何找到该方法对应的sql语句并执行.`

通过遵守xml映射文件的三条规范，可以保证在调用Mapper接口中的方法时，mybatis框架会自动查找与namespace属性值与这个接口全类名相同的xml文件，在该xml文件中找到id属性值与方法名相同的sql语句，最终运行这条sql语句从而完成对数据库的操作。



> 步骤

1. 在resources下创建与mapper相同的包结构，此时创建的是目录，各级直接要用`/`分隔，而不是`.`，这样创建的才是分等级的文件结构

![image-20240505181114981](https://gitee.com/cmyk359/img/raw/master/img/image-20240505181114981-2024-5-918:55:57.png)

​	2、创建与mapper接口名称相同的xml文件

​	首先添加xml约束

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
  PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
```

添加mapper标签，获取对应的mapper接口的全限定名：

右键mapper接口，选择`Copy Reference`即可

![image-20240505184351463](https://gitee.com/cmyk359/img/raw/master/img/image-20240505184351463-2024-5-918:55:58.png)



```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<!--使用namespace 将mapper接口与xml文件绑定起来-->
<mapper namespace="com.example.mapper.EmpMapper">
    
</mapper>
```



3、添加sql语句

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<!--使用namespace 将mapper接口与xml文件绑定起来-->
<mapper namespace="com.example.mapper.EmpMapper">
    
    <!-- 使用id绑定到EmpMapper接口中的getUserList方法，返回值类型设置为Emp类   -->
    <!--resultType ：单条记录所封装的类型（全限定名）    -->
    <select id="getUserList" resultType="com.example.pojo.Emp">
            select *
            from emp
            where name like concat('$',#{name},'$') and gender = #{gender} and entrydate 						between #{begin} and #{end}
            order by  update_time desc
    </select>
</mapper>
```





### 6.3、动态sql

**什么是动态SQL：动态SQL就是根据不同的条件组装生成不同的SQL语句**

所谓动态SQL，本质还是SQL语句，只是我们可以在SQL层面，执行一些逻辑代码。

> 主要元素

- if ，where，set
- foreach
- sql，include



#### IF，where，set

使用动态 SQL 最常见情景是根据条件**包含 where 子句的一部分**。

 `<if test="判断条件"> where 子句的一部分 </if>`

根据判断条件是否为真来动态添加对应的sql代码。

注：test判断条件中使用的是<u>实体类中的属性名</u>而不是数据库表的字段名

![image-20240505210552447](https://gitee.com/cmyk359/img/raw/master/img/image-20240505210552447-2024-5-918:55:59.png)

例1：根据用户输入的查询条件获得用户列表。若输入了用户名，则按照用户名模糊查询；若输入了性别，同时按性别查询；若输入了入职时间，同时按照入职时间查询；若不输入参数，则查询所有员工。

```xml
<select id="getUserList" resultType="com.example.pojo.Emp">
    select *
    from emp
    <where>
        <if test="name != null">
            name like concat('$',#{name},'$')
        </if>
        <if test="gender != null">
            and gender = #{gender}
        </if>
        <if test="begin != null and end != null">
            and entrydate between #{begin} and #{end}
        </if>
    </where>
    order by update_time desc;
</select>
```

例2：动态更新员工表，若传入了对应字段的值，则更新；否则保持不变。

与where中遇到的情况类似，若只有第一个if标签有效则预编译sql如下，会将其中的逗号保留，造成sql语法错误

![image-20240505210252503](https://gitee.com/cmyk359/img/raw/master/img/image-20240505210252503-2024-5-918:56:00.png)

使用set标签解决

`<set>`：动态地在行首插入SET关键字，并会删掉额外的逗号。（用在update语句中）

```xml
<update id="updateUser">
    update emp
    <set>
        <if test="username != null">username = #{username},</if>
        <if test="name != null"> name = #{name},</if>
        <if test="gender != null">gender = #{gender},</if>
        <if test="image != null">image = #{image},</if>
        <if test="job != null">job = #{job},</if>
        <if test="entrydate != null">entrydate = #{entrydate},</if>
        <if test="deptId != null">dept_id = #{deptId},</if>
        <if test="updateTime != null">update_time = #{updateTime}</if>
    </set>
    where id = #{id};
</update>
```





#### foreach

- 动态 SQL 的另一个常见使用场景是**对集合进行遍历**（尤其是在构建 IN 条件语句的时候）。
- 它允许你指定一个集合，声明可以在元素体内使用的**集合项（item）**和**索引（index）**变量。
- 它也允许你**指定开头与结尾的字符串**以及**集合项迭代之间的分隔符**。

 在使用foreach的时候最关键的也是最容易出错的就是collection属性，该属性是必须指定的，但是在不同情况下，该属性的值是不一样的，主要有以下3种情况： 

- **如果传入的是单参数且参数类型是一个List的时候，collection属性值为list 。**

- **如果传入的是单参数且参数类型是一个array数组的时候，collection的属性值为array 。**

- **如果传入的参数是多个的时候，就需要把它们封装成一个Map了，当然单参数也可以封装成Map。实际上在传入参数的时候，在MyBatis里面也是会把它封装成一个Map的，map的key就是参数名，所以这个时候collection属性值就是传入的List或array对象在自己封装的map里面的key。**

当然在作为入参时可以使用@Param("keyName")来设置键，设置keyName后，list和array将会失效

![image-20240505212015373](https://gitee.com/cmyk359/img/raw/master/img/image-20240505212015373-2024-5-918:56:14.png)

[使用foreach进行批量操作](https://blog.csdn.net/qq_36631553/article/details/105680200)



#### SQL片段

有时候，我们要将一些功能的部分抽取出来，方便复用。同时这些公共部分若要修改，只需修改一处即可。

1、使用SQL标签抽取公共部分

```xml
<sql id="commenSelect">
    select id,
    username,
    password,
    name,
    gender,
    image,
    job,
    entrydate,
    dept_id,
    create_time,
    update_time
    from emp
</sql>
```



2、在需要使用的地方 使用 include标签引用即可

```xml
<!--    根据id查询用户 -->
<select id="getUserById" resultType="com.example.pojo.Emp">
    <include refid="commenSelect"></include>
    where id = #{uid}
</select>
```

注意点：

- 最好基于单表来定义SQL片段
- 其中不要包含where标签



### 6.4、idea插件

MybatisX 是一款基于 IDEA的快速开发Mybatis的插件，为效率而生。

![image-20241209195949274](https://gitee.com/cmyk359/img/raw/master/img/image-20241209195949274-2024-12-920:00:40.png)

> 直接在xml中生成Mapper接口中的方法对应的标签

安装了MyBatisX插件后，在mapper接口中添加一个方法后，使用`alt+shift+enter`可直接在对应的xml文件中生成该方法对应的标签

![image-20240505220350091](https://gitee.com/cmyk359/img/raw/master/img/image-20240505220350091-2024-5-918:56:28.png)

> 在xml文件中开启sql提示

![image-20240505220829405](https://gitee.com/cmyk359/img/raw/master/img/image-20240505220829405-2024-5-918:56:32.png)

> 添加操作日志

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240506100818823-2024-5-918:56:37.png" alt="image-20240506100818823" style="zoom:80%;" />

添加`@Slf4j`注解后，可以在方法内直接使用 `log`对象的`info或debug`方法输入日志。（不要用system.out）



## 七、整合Demo

### 7.1、请求路径管理

@RequestMapping

![image-20241209200052266](https://gitee.com/cmyk359/img/raw/master/img/image-20241209200052266-2024-12-920:01:16.png)

> 注：一个完整的请求路径，应该是类上的`@RequestMapping`的value属性+方法上的`@RequestMapping`的value属性。
>

### 7.2、RestFul 风格

**概念**

Restful就是一个资源定位及资源操作的风格。不是标准也不是协议，**只是一种风格**。基于这个风格设计的软件可以更简洁，更有层次，更易于实现缓存等机制。

**功能**

资源：互联网所有的事物都可以被抽象为资源

资源操作：使用POST、DELETE、PUT、GET，使用不同方法对资源进行操作。

分别对应 添加、 删除、修改、查询。

- **传统方式操作资源**  ：通过**不同的参数**来实现不同的效果！**方法单一，post 和 get**

  ​	http://127.0.0.1/item/queryItem.action?id=1 查询,GET

  ​	http://127.0.0.1/item/saveItem.action 新增,POST

  ​	http://127.0.0.1/item/updateItem.action 更新,POST

  ​	http://127.0.0.1/item/deleteItem.action?id=1 删除,GET或POST

- **使用RESTful操作资源** ：可以通过**不同的请求方式**来实现不同的效果！如下：**请求地址一样，但是功能可以不同**！

  ​	http://127.0.0.1/item/1 查询,GET

  ​	http://127.0.0.1/item 新增,POST

  ​	http://127.0.0.1/item 更新,PUT

  ​	http://127.0.0.1/item/1 删除,DELETE






### 7.3、分页查询

#### 原始方式

![image-20240506144301718](https://gitee.com/cmyk359/img/raw/master/img/image-20240506144301718-2024-5-918:56:45.png)

#### 使用分页插件PageHelper

![image-20220525181646324](https://gitee.com/cmyk359/img/raw/master/img/image-20220525181646324-2024-5-918:56:50.png)

[查看](https://pagehelper.github.io/docs/)

其核心原理是将传入的页码和条数赋值给一个Page对象，并保存到本地线程ThreadLocal中。接下来，PageHelper会进入Mybatis的拦截器环节，在拦截器中获取并处理刚才保存在ThreadLocal中的分页参数。这些分页参数会与原本的SQL语句和内部已经定义好的SQL进行拼接，从而完成带有分页处理的SQL语句的构建。

**PageHelper注意事项**

使用pagehelper进行分页的时候推荐使用 PageHelper.startPage(1, 10); 这种方式；

另外**startPage语句最好紧挨着查询语句，避免中间抛出异常，没有办法清除ThreadLocal中当前线程的page对象。**



步骤：

1、编写正常查询语句

```java
@Mapper
public interface EmpMapper {
    @Select("select * from emp")
    List<Emp> list();
}
```

2、在service层使用PageHelper进行分页查询

```java
@Service
public class EmpServiceImpl implements EmpService {

    @Autowired
    private EmpMapper empMapper;

    @Override
    public PageBean page(Integer page, Integer pageSize) {
        //1、配置分页参数
        PageHelper.startPage(page,pageSize);

        //2、执行查询
         //规定获得分页查询结果对象用page封装，其继承了ArrayList，增加了自己的属性
         Page<Emp empList = empMapper.list();

        //3、封装PageBean对象
        PageBean pageBean = new PageBean(p.getTotal(), p.getResult());
        return pageBean;
    }

}
```



### 7.4、文件上传

![image-20240506171942500](https://gitee.com/cmyk359/img/raw/master/img/image-20240506171942500-2024-5-918:56:54.png)

前端表单：

- 大文件提交方式要选择`post`
- 文件编码格式`enctype`必须选择`multipart/form-data`，使用默认值只会将文件名提交到服务器
- 使用一个 type属性为`file`的组件来选择文件进行上传	

后端接收到的是临时文件，在表单中有三个标签，会将其数据保存在三个对应的临时文件中上传结束后会将其删除![image-20240506173248059](https://gitee.com/cmyk359/img/raw/master/img/image-20240506173248059-2024-5-918:56:59.png)

#### 本地存储

使用`MutipartFile`类的`transferTo()`方法，将当前对象保存为指定路径下的文件

```java
    @PostMapping("/upload")
    public Result upload(String username, Integer age, MultipartFile image) throws IOException {
        
        //1、获取上传文件原始名
        String originalFilename = image.getOriginalFilename();
        
        //2、构造新的唯一的文件名（uuid+文件后缀）
        int index = originalFilename.lastIndexOf(".");
        String suffix = originalFilename.substring(index);
        String newFileName = UUID.randomUUID().toString() + suffix;

        log.info("所提交的表单信息为:{},{},{}",username,age,newFileName);

        //3、将文件保存在本地目录 D:/videos/目录下
        image.transferTo(new File("D:/videos/"+newFileName));
        return Result.success();
    }
```



在SpringBoot中，文件上传，默认单个文件允许最大大小为` 1MB`.当上传文件大小超过时，会抛出异常

![image-20240506175756491](https://gitee.com/cmyk359/img/raw/master/img/image-20240506175756491-2024-5-918:57:03.png)



如果需要上传大文件，可以在配置文件中设置 

```yaml
#配置单个文件最大上传大小
spring.servlet.multipart.max-file-size=10MB
#配置单个请求最大上传文件大小（一次请求可以上传多个文件）
spring.servlet.multipart.max-request-size=100B
```



postman测试文件上传

![image-20240506180504095](https://gitee.com/cmyk359/img/raw/master/img/image-20240506180504095-2024-5-918:57:08.png)



#### 阿里云OSS存储



1. **阿里云OSS简介** 	

​	阿里云对象存储服务（Object Storage Service，简称OSS）为您提供基于网络的数据存取服务。使用OSS，您可以通过网络随时存储和调用包括文本、图片、音频和视频等在内的各种非结构化数据文件。
阿里云OSS将数据文件以对象（object）的形式上传到存储空间（bucket）中。

​	您可以进行以下操作：

- 创建一个或者多个存储空间，向每个存储空间中添加一个或多个文件。
- 通过获取已上传文件的地址进行文件的分享和下载。
- 通过修改存储空间或文件的属性或元信息来设置相应的访问权限。
- 在阿里云管理控制台执行基本和高级OSS任务。
- 使用阿里云开发工具包或直接在应用程序中进行RESTful API调用执行基本和高级OSS任务





**2. OSS开通** 

（1）打开https://www.aliyun.com/ ，申请阿里云账号并完成实名认证。

  

（2）充值 (可以不用做)



（3）开通OSS

登录阿里云官网。 点击右上角的控制台。

![image-20221129214250389](https://gitee.com/cmyk359/img/raw/master/img/image-20221129214250389-1714990626819-2024-5-918:57:41.png) 

将鼠标移至产品，找到并单击对象存储OSS，打开OSS产品详情页面。在OSS产品详情页中的单击立即开通。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20221129214332892-2024-5-918:59:40.png" alt="image-20221129214332892" style="zoom:67%;" /> 

![image-20221129214403131](https://gitee.com/cmyk359/img/raw/master/img/image-20221129214403131-2024-5-919:00:29.png)

![image-20221128012258544](https://gitee.com/cmyk359/img/raw/master/img/image-20221128012258544-1714990626820-2024-5-918:58:15.png) 



开通服务后，在OSS产品详情页面单击管理控制台直接进入OSS管理控制台界面。您也可以单击位于官网首页右上方菜单栏的控制台，进入阿里云管理控制台首页，然后单击左侧的对象存储OSS菜单进入[OSS管理控制台界面](https://oss.console.aliyun.com/overview)。

![image-20201126234535040](https://gitee.com/cmyk359/img/raw/master/img/image-20201126234535040-1714990626820-2024-5-919:00:36.png)



（4）创建存储空间

新建Bucket，读写权限为 **公共读**

![image-20221128014414947](https://gitee.com/cmyk359/img/raw/master/img/image-20221128014414947-2024-5-919:02:04.png)

![image-20221128014414947](https://gitee.com/cmyk359/img/raw/master/img/image-20221128014414947-2024-5-919:00:53.png)



**3. 获取AccessKeyId**

![image-20221128020105943](https://gitee.com/cmyk359/img/raw/master/img/image-20221128020105943-1714990626822-2024-5-919:02:10.png)

**4. OSS快速入门** 

[参考文档官方](https://help.aliyun.com/zh/oss/developer-reference/java/?spm=a2c4g.11186623.0.0.7e425c71TsaX9h)

（1）创建测试工程，引入依赖

```xml
<dependency>
    <groupId>com.aliyun.oss</groupId>
    <artifactId>aliyun-sdk-oss</artifactId>
    <version>3.15.1</version>
</dependency>
```



（2）新建类和main方法，运行main方法即可将对应文件上传到阿里云OSS

```java
//官方demo

package com.example;

import com.aliyun.oss.ClientException;
import com.aliyun.oss.OSS;
import com.aliyun.oss.common.auth.*;
import com.aliyun.oss.OSSClientBuilder;
import com.aliyun.oss.OSSException;
import com.aliyun.oss.model.PutObjectRequest;
import com.aliyun.oss.model.PutObjectResult;
import java.io.FileInputStream;
import java.io.InputStream;

public class Demo {

    public static void main(String[] args) throws Exception {
        // Endpoint以华东1（杭州）为例，其它Region请按实际情况填写。
        String endpoint = "https://oss-cn-chengdu.aliyuncs.com";
        // 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量OSS_ACCESS_KEY_ID和OSS_ACCESS_KEY_SECRET。
        //EnvironmentVariableCredentialsProvider credentialsProvider = CredentialsProviderFactory.newEnvironmentVariableCredentialsProvider();
        String accessKeyId ="LTAI5tSjuKzkDaB9LTAVxePM";
        String accessKeySecret ="QyoRbTEK9kB8eZ7sWqSkj4W8YcdI0Z";
        // 填写Bucket名称，例如examplebucket。
        String bucketName = "maozhuazaishang";
        // 填写Object完整路径，完整路径中不能包含Bucket名称，例如exampledir/exampleobject.txt。
        String objectName = "1.png";
        // 填写本地文件的完整路径，例如D:\\localpath\\examplefile.txt。
        // 如果未指定本地路径，则默认从示例程序所属项目对应本地路径中上传文件流。
        String filePath= "C:\\Users\\86152\\Desktop\\medium\\npc\\厉寒霜.png";

        
        //--------------------------只需配置上面信息，下面的保持不变-------------------------------
        // 创建OSSClient实例。
        OSS ossClient = new OSSClientBuilder().build(endpoint, accessKeyId,accessKeySecret);

        try {
            InputStream inputStream = new FileInputStream(filePath);
            // 创建PutObjectRequest对象。
            PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, objectName, inputStream);
            // 创建PutObject请求。
            PutObjectResult result = ossClient.putObject(putObjectRequest);
        } catch (OSSException oe) {
            System.out.println("Caught an OSSException, which means your request made it to OSS, "
                    + "but was rejected with an error response for some reason.");
            System.out.println("Error Message:" + oe.getErrorMessage());
            System.out.println("Error Code:" + oe.getErrorCode());
            System.out.println("Request ID:" + oe.getRequestId());
            System.out.println("Host ID:" + oe.getHostId());
        } catch (ClientException ce) {
            System.out.println("Caught an ClientException, which means the client encountered "
                    + "a serious internal problem while trying to communicate with OSS, "
                    + "such as not being able to access the network.");
            System.out.println("Error Message:" + ce.getMessage());
        } finally {
            if (ossClient != null) {
                ossClient.shutdown();
            }
        }
    }
} 
```





阿里云OSS集成，将文件上传方法封装成一个工具类

```java
import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.util.UUID;

/**
 * 阿里云 OSS 工具类
 */
@Component
public class AliOSSUtils {

    private String endpoint = "https://oss-cn-chengdu.aliyuncs.com";
    private String accessKeyId = "LTAI5tSjuKzkDaB9LTAVxePM";
    private String accessKeySecret = "QyoRbTEK9kB8eZ7sWqSkj4W8YcdI0Z";
    private String bucketName = "maozhuazaishang";

    /**
     * 实现上传图片到OSS
     */
    public String upload(MultipartFile file) throws IOException {
        // 获取上传的文件的输入流
        InputStream inputStream = file.getInputStream();

        // 避免文件覆盖
        String originalFilename = file.getOriginalFilename();
        String fileName = UUID.randomUUID().toString() + originalFilename.substring(originalFilename.lastIndexOf("."));

        //上传文件到 OSS
        OSS ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
        ossClient.putObject(bucketName, fileName, inputStream);

        //文件访问路径
        String url = endpoint.split("//")[0] + "//" + bucketName + "." + endpoint.split("//")[1] + "/" + fileName;
        // 关闭ossClient
        ossClient.shutdown();
        return url;// 把上传到oss的路径返回
    }

}
```

编写上传文件的Controller

```java
@Slf4j
@RestController
public class UploadController {

    @Autowired
    private AliOSSUtils aliOSSUtils;

    /**
     * 上传图片至阿里云OSS
     * @param image
     * @return
     */
    @PostMapping("/upload")
    public Result upload(MultipartFile image) throws IOException {
        log.info("文件上传，文件名为{}",image.getOriginalFilename());
        String url = aliOSSUtils.upload(image);
        log.info("文件上传完成，文件访问路径为{}",url);
        return Result.success(url);
    }
}
```





### 7.5、配置文件

#### 参数配置化

将需要用到的参数硬编码在java代码中，当代码量庞大，参数需要修改时，维护代价大，不便管理。

解决方法：将参数及其值添加到项目配置文件中，java代码中不直接写值，而是采用外部注入的方式

![image-20240506220341750](https://gitee.com/cmyk359/img/raw/master/img/image-20240506220341750-2024-5-919:02:24.png)



#### yml配置文件

常见配置文件格式对比

![image-20241209165802973](https://gitee.com/cmyk359/img/raw/master/img/image-20241209165802973-2024-12-916:58:04.png)

YML基本语法：

- 大小写敏感
- 数值前边必须有空格，作为分隔符 冒号后必须有空格
- 使用缩进表示层级关系，缩进时，不允许使用Tab键，只能用空格（idea中会自动将Tab转换为空格）
- 缩进的空格数目不重要，只要相同层级的元素左侧对齐即可
- #表示注释，从这个字符一直到行尾，都会被解析器忽略

YML数据格式

- 对象/Map集合

  ```yaml
  user:
   name: zhangsan
   age: 18
   password: 123456
  # 统一缩进，类似于python语法，用缩进表示结构关系
  ```

  

- 数组/List/Set集合

  ```yaml
  hobby:
    -java
    -game
    -sport
  #元素成员前有一个短杠 -
  ```

  

使用`application.yml`替换`application.properties`

```yaml
spring:
  application:
    name: springboot-employeemanagement
  #数据库连接配置
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/mybatis
    username: root
    password: liuhao123
  #文件上传配置
  servlet:
    multipart:
      max-file-size: 10MB #配置单个文件最大上传大小
      max-request-size: 100MB #配置单个请求最大上传文件大小（一次请求可以上传多个文件）

#mybatis配置
mybatis:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl #配置mybatis的日志，指定输出到控制台
    map-underscore-to-camel-case: true  #开启mybatis驼峰命名自动映射开关 a_cloumn ----> aColumn

#阿里云OSS配置
aliyun:
  oss:
    endpoint: https://oss-cn-chengdu.aliyuncs.com
    accessKeyId: LTAI5tSjuKzkDaB9LTAVxePM
    accessKeySecret: QyoRbTEK9kB8eZ7sWqSkj4W8YcdI0Z
    bucketName: maozhuazaishang

```



#### 配置信息注入

`@ConfigurationProperties `与`@Value`

相同点：都是用来注入外部配置的属性的。

不同点：

- @Value注解只能一个一个的进行外部属性的注入。（如果相关配置只有几个，用这个也可）
- @ConfigurationProperties可以批量的将外部的属性配置注入到bean对象的属性中。（要获得配置信息，在对应类中注入该bean对象，调用其get方法即可）



使用`@ConfigurationProperties`将配置文件中配置项的值自动注入到bean对象的属性中

前提：

- 配置文件中key的名字与实体类的属性名相同
- 为实体类提供get和set方法（使用`@Data`注解）
- 将实体类交个IOC容器管理，成为IOC容器的bean对象 （使用`@Component`注解）
- 指定配置项的前缀：使用`ConfigurationProperties(prefix ="xxxx")`

![image-20240506222720114](https://gitee.com/cmyk359/img/raw/master/img/image-20240506222720114-2024-5-919:02:54.png)



添加如下注解，在完成实体类定义后，添加配置项时会生成提示信息

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
</dependency>
```



![image-20240506223452971](https://gitee.com/cmyk359/img/raw/master/img/image-20240506223452971-2024-5-919:03:00.png)





1、添加阿里云OSS配置信息对应的实体类

```java
package com.example.utils;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @ClassName AliOSSProperties
 * @Description TODO
 * @Author 86152
 * @Date 2024/5/6 22:28
 * @Version 1.0
 */
@Data
@Component
@ConfigurationProperties(prefix = "aliyun.oss")
public class AliOSSProperties {
    private String endpoint;
    private String accessKeyId;
    private String accessKeySecret;
    private String bucketName;
}

```

2、在yml文件中添加响应配置信息

```yaml
#阿里云OSS配置
aliyun:
  oss:
    endpoint: https://oss-cn-chengdu.aliyuncs.com
    accessKeyId: LTAI5tSjuKzkDaB9LTAVxePM
    accessKeySecret: QyoRbTEK9kB8eZ7sWqSkj4W8YcdI0Z
    bucketName: maozhuazaishang

```



3、在阿里云OSS文件上传工具栏中，注入bean对象，获取配置信息

```java
package com.example.utils;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.util.UUID;

/**
 * 阿里云 OSS 工具类
 */
@Component
public class AliOSSUtils {
    /**
     * 实现上传图片到OSS
     */
    
    @Autowired
    private AliOSSProperties aliOSSProperties;

    public String upload(MultipartFile file) throws IOException {
        //获取阿里云OSS配置信息
        String endpoint = aliOSSProperties.getEndpoint();
        String accessKeyId = aliOSSProperties.getAccessKeyId();
        String accessKeySecret = aliOSSProperties.getAccessKeySecret();
        String bucketName = aliOSSProperties.getBucketName();
        
        // 获取上传的文件的输入流
        InputStream inputStream = file.getInputStream();

        // 避免文件覆盖
        String originalFilename = file.getOriginalFilename();
        String fileName = UUID.randomUUID().toString() + originalFilename.substring(originalFilename.lastIndexOf("."));

        //上传文件到 OSS
        OSS ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
        ossClient.putObject(bucketName, fileName, inputStream);

        //文件访问路径
        String url = endpoint.split("//")[0] + "//" + bucketName + "." + endpoint.split("//")[1] + "/" + fileName;
        // 关闭ossClient
        ossClient.shutdown();
        return url;// 把上传到oss的路径返回
    }

}

```

### 7.6、登录校验

登录时根据用户名和密码查询数据库，若返回信息为null，则用户名或密码错误；不为null，则数据库中存在记录，登录成功。但是由于客户端和服务器直接交互是基于HTTP协议的，而HTTP协议又是无状态的协议，两个访问直接没有关联。即使登录失败，也可以在地址栏中输入页面地址直接访问。登录操作形同虚设。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240506230923099-2024-5-919:03:10.png" alt="image-20240506230923099" style="zoom:80%;" />





#### 会话技术

- 会话：用户打开浏览器，访问web服务器的资源，会话建立，直到有一方断开连接，会话结束。在一次会话中可以包含多次请求和响应。
- 会话跟踪：一种维护浏览器状态的方法，服务器需要识别多次请求是否来自于同一浏览器，以便在同一次会话的多次请求间共享数据。
- 会话跟踪方案：
  - 客户端会话跟踪技术：Cookie
  - 服务端会话跟踪技术：Session
  - 令牌技术



![image-20241209170355187](https://gitee.com/cmyk359/img/raw/master/img/image-20241209170355187-2024-12-917:04:10.png)

​	

会话跟踪方案对比

![image-20240507095823985](https://gitee.com/cmyk359/img/raw/master/img/image-20240507095823985-2024-5-919:03:26.png)

> Cookie

1、浏览器在第一次访问服务器时，在服务端保存相关访问数据，在给浏览器的响应头中通过Set-Cookie自动将服务端保存的信息响应给浏览器

2、浏览器识别响应头中的Set-Cookie，将其中的数据自动保存在本地Cookie

3、以后每次发起服务端访问请求都会通过请求头中的Cookie携带本地数据到服务端，在服务端获得该Cookie的值，进行判断



```java
//设置Cookie
@GetMapping("/c1")
public Result cookie1(HttpServletResponse response){
    response.addCookie(new Cookie("login_username","itheima")); //设置Cookie/响应Cookie
    return Result.success();
}

//获取Cookie
@GetMapping("/c2")
public Result cookie2(HttpServletRequest request){
    Cookie[] cookies = request.getCookies();
    for (Cookie cookie : cookies) {
        if(cookie.getName().equals("login_username")){
            System.out.println("login_username: "+cookie.getValue()); //输出name为login_username的cookie
        }
    }
    return Result.success();
}

```



> Session

Session是基于Cookie实现的，Session会话对象保存在服务器端，浏览器访问服务器时，可以在服务器中获取对应的Session对象。

1、浏览器第一次访问服务器时session不存在，服务器会自动创建一个会话对象Session，每个session都有一个id，服务器通过Cookie将SessionId响应给浏览器。（在响应头中增加一条Set-Cookie，其内容就是SessionID）

2、浏览器解析响应头，将Cookie保存在本地

3、在浏览器每次访问服务器时都会将本地Cookie数据获取出来，携带到服务端。服务端从中获取SessionID，从众多的Session中找到当前请求对应的会话对象Session。

这样就可以通过Session在同一个会话的多次请求直接传共享数据



```java
@GetMapping("/s1")
public Result session1(HttpSession session){
    log.info("HttpSession-s1: {}", session.hashCode());

    session.setAttribute("loginUser", "tom"); //往session中存储数据
    return Result.success();
}

@GetMapping("/s2")
public Result session2(HttpServletRequest request){
    HttpSession session = request.getSession();
    log.info("HttpSession-s2: {}", session.hashCode());

    Object loginUser = session.getAttribute("loginUser"); //从session中获取数据
    log.info("loginUser: {}", loginUser);
    return Result.success(loginUser);
}
```

> 令牌技术

​	用户登录成功后生成令牌，并将令牌响应前端，前端将令牌保存起来，在以后的每一次请求中都要携带令牌。首先服务端对接收到的令牌进行校验，若令牌有效则放行，否则进行拦截，跳转至指定页面。

JWT

- 全称：JSON Web Token（https://jwt.io/）
- 定义了一种简洁的、自包含的格式，用于在通信双方以json数据格式安全的传输信息。由于数字签名的存在，这些信息是可靠的。
- 组成：
  - 第一部分：Header（头），记录令牌类型、签名算法等。例如：{"alg"："HS256"，"type"："JWT"}
  - 第二部分：Payload（有效载荷），携带一些自定义信息、默认信息等。例如：{"id"："1"，"username"："Tom"}
  - 第三部分：Signature（签名），防止Token被篡改、确保安全性。将header、payload，并加入指定秘钥，**通过指定签名算法计算而来**。

![image-20241209170933608](https://gitee.com/cmyk359/img/raw/master/img/image-20241209170933608-2024-12-917:09:34.png)

1、添加依赖

```xml
<!--    JWT令牌    -->
<!-- https://mvnrepository.com/artifact/io.jsonwebtoken/jjwt-api -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt</artifactId>
    <version>0.9.1</version>
</dependency>
```



2、生成JWT令牌

```java
    @Test
    public void JwtGenTest() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id",1);
        claims.put("username","Tom");
        String jwt = Jwts.builder()
                .signWith(SignatureAlgorithm.HS256, "itheima") //指定编码格式和秘钥
                .setClaims(claims) //添加自定义内容（有效载荷）
                .setExpiration(new Date(System.currentTimeMillis() + 12*3600*1000)) //令牌有效期
                .compact();
        //eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiZXhwIjoxNzE1MDkyOTg2LCJ1c2VybmFtZSI6IlRvbSJ9.vZkW8LOXOGODIhbuy4MSrL5BR6638eJM9uOJNnBScAc
        System.out.println(jwt);
    }
```



3、校验令牌

```java
@Test
public void parseJwtTest() {
    String jwt = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiZXhwIjoxNzE1MDkyOTg2LCJ1c2VybmFtZSI6IlRvbSJ9.vZkW8LOXOGODIhbuy4MSrL5BR6638eJM9uOJNnBScAc";
    
    Claims claims = Jwts.parser()
        .setSigningKey("itheima") //指定签名秘钥
        .parseClaimsJws(jwt) //解析秘钥
        .getBody(); //获得其中的自定义数据
    System.out.println(claims);
}
```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240507104834966-2024-5-919:03:49.png" alt="image-20240507104834966" style="zoom:80%;" />



4、生成JWT工具类，使用时调用其中的方法即可

```java
//JwtUtils.java


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.Date;
import java.util.Map;

public class JwtUtils {

    private static String signKey = "itheima"; //设置秘钥
    private static Long expire = 43200000L; //设置秘钥过期时间

    /**
     * 生成JWT令牌
     * @param claims JWT第二部分负载 payload 中存储的内容
     * @return
     */
    public static String generateJwt(Map<String, Object> claims){
        String jwt = Jwts.builder()
                .addClaims(claims)
                .signWith(SignatureAlgorithm.HS256, signKey)
                .setExpiration(new Date(System.currentTimeMillis() + expire))
                .compact();
        return jwt;
    }

    /**
     * 解析JWT令牌
     * @param jwt JWT令牌
     * @return JWT第二部分负载 payload 中存储的内容
     */
    public static Claims parseJWT(String jwt){
        Claims claims = Jwts.parser()
                .setSigningKey(signKey)
                .parseClaimsJws(jwt)
                .getBody();
        return claims;
    }
}
```

5、登录成功下发令牌，登录失败返回错误信息

```java
@RestController
public class LoginController {

    @Autowired
    private EmpService empService;

    @PostMapping("/login")
    public Result login(@RequestBody Emp emp) {
        Emp e = empService.getByUsernameAndPassword(emp);
        //登录成功，生成令牌，下发令牌
        if (e != null) {
            Map<String, Object> claims = new HashMap<>();
            claims.put("id",e.getId());
            claims.put("name",e.getName());
            claims.put("username",e.getUsername());
            String jwt = JwtUtils.generateJwt(claims); //生成的Jwt令牌中已经包含了员工信息
            return Result.success(jwt);
        }
        //登录失败，返回错误信息
        return Result.error("用户名或密码错误");
    }
}
```



#### 过滤器实现登录校验

过滤器（Filter）

- 概念：**Filter过滤器**，是JavaWeb三大组件（Servlet、Filter、Listener）之一。
- 过滤器可以把对资源的请求**拦截**下来，从而实现一些特殊的功能。
- 过滤器一般完成一些**通用**的操作，比如：登录校验、统一编码处理、敏感字符处理等。



![image-20241209170705008](https://gitee.com/cmyk359/img/raw/master/img/image-20241209170705008-2024-12-917:07:06.png)



> 快速入门



步骤：

1. 定义Filter：定义一个类，实现 Filter 接口，并重写其所有方法。（只有三个：init，doFilter，destroy）
2. 配置Filter：Filter类上加@webFilter注解，配置拦截资源的路径。引导类上加@ServletComponentScan开启Servlet组件支持。

![image-20241209171051916](https://gitee.com/cmyk359/img/raw/master/img/image-20241209171051916-2024-12-917:10:53.png)

注：一定要继承 `javax.servlet`的Filter

![image-20240507111913871](https://gitee.com/cmyk359/img/raw/master/img/image-20240507111913871-2024-5-919:04:04.png)



> 过滤器细节（过滤器执行流程、过滤器拦截路径、过滤器链） 	



1. **过滤器执行流程**

   请求---->放行前逻辑 ---->放行 ----->访问Web资源 ----->放行后逻辑

   ![image-20240507113959486](https://gitee.com/cmyk359/img/raw/master/img/image-20240507113959486-2024-5-919:04:08.png)

2. **过滤器拦截路径**

   Filter可以根据需求，配置不同的拦截资源路径：

   ![PixPin_2024-12-09_17-13-19](https://gitee.com/cmyk359/img/raw/master/img/PixPin_2024-12-09_17-13-19-2024-12-917:14:29.png)

   

3. **过滤器链**

   一个web应用中，配置了多个过滤器，就形成了一个过滤器链。

   - 介绍：一个web应用中，可以配置多个过滤器，这多个过滤器就形成了一个过滤器链。
   - 顺序：注解配置的Filter，|优先级是按照过滤器类名（字符串）的自然排序。

   ![image-20241209171527241](https://gitee.com/cmyk359/img/raw/master/img/image-20241209171527241-2024-12-917:15:40.png)

   

> 登录拦截实现

![image-20240507114549100](https://gitee.com/cmyk359/img/raw/master/img/image-20240507114549100-2024-5-919:04:23.png)

```java
package com.example.filter;

import com.alibaba.fastjson.JSON;
import com.example.pojo.Result;
import com.example.utils.JwtUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * @ClassName LoginCheckFilter
 * @Description TODO
 * @Author 86152
 * @Date 2024/5/7 16:02
 * @Version 1.0
 */

@Slf4j
@WebFilter(urlPatterns = "/*")
public class LoginCheckFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp  = (HttpServletResponse) response;

        //1、获得请求的路径URL
        String url = req.getRequestURI().toString();
        log.info("请求路径为{}",url);

        //2、判断是否为登录请求。判断请求ur1中是否包含login，如果包含，说明是登录操作，放行。
        if(url.contains("login")) {
            log.info("登录操作，放行....");
            chain.doFilter(request,response);
            return;//放行后不必返回执行后续代码
        }

        //3、获取请求头中的令牌(token)
        String token = req.getHeader("token");

        //4、判断令牌是否存在，如果不存在返回错误结果（未登录）
        if(!StringUtils.hasLength(token)) {
            log.info("请求头中token为空，返回未登录的信息");
            Result notLogin = Result.error("NOT_LOGIN");
            //手动转换 javaBean --> JSON ，使用FastJSON
            String notLoginStr = JSON.toJSONString(notLogin);
            resp.getWriter().write(notLoginStr);
            return;
        }

        //5、解析令牌
        try {
            JwtUtils.parseJWT(token);
        }catch (Exception e) { //jwt解析失败
            log.info("令牌解析失败，返回未登录的信息");
            Result notLogin = Result.error("NOT_LOGIN");
            //手动转换 javaBean --> JSON ，使用FastJSON
            String notLoginStr = JSON.toJSONString(notLogin);
            resp.getWriter().write(notLoginStr);
            return;
        }

        //6、放行
        log.info("令牌合法，放行....");
        chain.doFilter(request, response);
    }
}

```



#### 拦截器实现登录校验

> 快速入门

步骤：

1. 定义拦截器，实现Handlerinterceptor接口，并重写其所有方法。

2. 注册拦截器

   ![image-20241209171639829](https://gitee.com/cmyk359/img/raw/master/img/image-20241209171639829-2024-12-917:17:23.png)



> 拦截器详解（拦截路径、执行流程）

拦截路径：

拦截器可以根据需求，配置不同的拦截路径：

```java
@Override
public void addInterceptors(InterceptorRegistry registry){
  registry.addInterceptor(loginCheckInterceptor)
      .addPathPatterns("/**") //需要拦截哪些资源
      .excludePathPatterns("/login"); //不需要拦截哪些资源
}
```

![image-20241209172035778](https://gitee.com/cmyk359/img/raw/master/img/image-20241209172035778-2024-12-917:20:37.png)



拦截器执行流程

![image-20241209172125513](https://gitee.com/cmyk359/img/raw/master/img/image-20241209172125513-2024-12-917:21:26.png)

Filter 与 Interceptor对比

- 接口规范不同：过滤器需要实现Filter接口，而拦截器需要实现Handlerinterceptor接口。
- 拦截范围不同：过滤器Filter会拦截所有的资源，而Interceptor只会拦截Spring环境中的资源。

> 实现登录校验

![image-20240507170311521](https://gitee.com/cmyk359/img/raw/master/img/image-20240507170311521-2024-5-817:18:26.png)

1、定义拦截器，在preHandle方法中编写拦截逻辑

```java
@Slf4j
@Component
public class LoginCheckInterceptor implements HandlerInterceptor {
    
    @Override //目标资源方法执行前执行，放回true：放行，返回false：不放行
    public boolean preHandle(HttpServletRequest req, HttpServletResponse resp, Object handler) throws Exception {

        //1、获得请求的路径URL
        String url = req.getRequestURI().toString();
        log.info("请求路径为{}",url);

        //2、判断是否为登录请求。判断请求ur1中是否包含login，如果包含，说明是登录操作，放行。
        if(url.contains("login")) {
            log.info("登录操作，放行....");
            return true;
        }

        //3、获取请求头中的令牌(token)
        String token = req.getHeader("token");

        //4、判断令牌是否存在，如果不存在返回错误结果（未登录）
        if(!StringUtils.hasLength(token)) {
            log.info("请求头中token为空，返回未登录的信息");
            Result notLogin = Result.error("NOT_LOGIN");
            //手动转换 javaBean --> JSON ，使用FastJSON
            String notLoginStr = JSON.toJSONString(notLogin);
            resp.getWriter().write(notLoginStr);
            return false; //不放行
        }

        //5、解析令牌
        try {
            JwtUtils.parseJWT(token);
        }catch (Exception e) { //jwt解析失败
            log.info("令牌解析失败，返回未登录的信息");
            Result notLogin = Result.error("NOT_LOGIN");
            //手动转换 javaBean --> JSON ，使用FastJSON
            String notLoginStr = JSON.toJSONString(notLogin);
            resp.getWriter().write(notLoginStr);
            return false; //不放行
        }

        //6、放行
        log.info("令牌合法，放行....");
        return true;
    }

    @Override //目标资源方法执行后执行
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        System.out.println("postHandle....");
    }

    @Override //视图渲染完毕后执行，最后执行
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        System.out.println("afterCompletion....");
    }
}

```

2、注册拦截器

```java
@Configuration //配置类
public class WebConfig implements WebMvcConfigurer {

    @Autowired //拦截器对象自动注入
    LoginCheckInterceptor loginCheckInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginCheckInterceptor)
            .addPathPatterns("/**")  //需要拦截的路径
            .excludePathPatterns("/login"); //不需要拦截的路径
    }
}

```



### 7.7、异常处理



定义全局异常处理器，对项目中出现的异常进行处理，并返回格式化的错误信息

![image-20240507172946016](https://gitee.com/cmyk359/img/raw/master/img/image-20240507172946016-2024-5-817:17:26.png)

```java
@RestControllerAdvice  //声明当前类是一个全局异常处理器
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class) //指定所捕获的异常类型：当前捕获所有异常
    public Result ex(Exception e) {
        e.printStackTrace();
        return Result.error("操作失败，请联系管理员！");
    }
}
```







## 八、Spring事务管理

与数据库的事务概念相同

**事务** 是一组操作的集合，它是一个不可分割的工作单位，这些操作要么同时成功，要么同时失败。

操作：

- 开启事务（一组操作开始前，开启事务）：start transaction/begin；
- 提交事务（这组操作全部成功后，提交事务）：commit；
- 回滚事务（中间任何一个操作出现异常，回滚事务）：rollback；



### 8.1、@Transactional

- 位置：业务（service）层的方法上、类上、接口上
- 作用：将当前方法交给spring进行事务管理，**方法执行前，开启事务；成功执行完毕，提交事务；出现异常，回滚事务**。

注解作用在方法上，将当前方法交给Spring进行事务管理

```java
@Transactional方法
@override public void delete(Integer id){
	//1.删除部门
	deptMapper.delete(id);
    int i = 1/0;//模拟抛出异常
	//2.根据部门id，删除部门下的员工信息
    empMapper.deleteByDeptId(id);
}
```

作用在类上，将这个类的所有方法都交给Spring进行事务管理

```java
@Transactional
@Service
public class DeptServiceImpl implements DeptService{}
```

作用在接口上，将这个接口所有的实现类的所有方法都交给Spring进行事务管理

```java
@Transactional
public interface Deptservice {}
```



案例：

![image-20240508095827014](https://gitee.com/cmyk359/img/raw/master/img/image-20240508095827014-2024-5-809:58:27.png)



若一个方法需要多次修改数据库（执行多条DML语句），为了保证原子性，需要在该方法上添加`@Transactional`注解

```java
    @Transactional //开启Spring事务
    @Override
    public void delete(Integer id) {
        deptMapper.deleteDeptById(id); //根据部门id删除部门
        empMapper.deleteByDeptId(id); //同时删除该部门下的所有员工
    }
```

### 8.2、rollbackFor属性

默认情况下，只有出现`RuntimeException`才回滚异常。rollbackFor属性用于控制出现何种异常类型，回滚事务。

![image-20241209172929990](https://gitee.com/cmyk359/img/raw/master/img/image-20241209172929990-2024-12-917:29:40.png)

### 8.3、propagation属性



事务传播行为，若一个事务方法A调用了另一个事务方法B，B应该加入A的事务中，还是新建一个事务，这就是事务的传播行为问题。

![image-20240508104656427](https://gitee.com/cmyk359/img/raw/master/img/image-20240508104656427-2024-5-810:47:26.png)



常用：前两个属性

- REQUIRED：大部分情况下都是用该传播行为即可。

- REQUIRES_NEW：**当我们不希望事务之间相互影响时**，可以使用该传播行为。比如：下订单前需要记录日志，不论订单保存成功与否，都需要保证日志记录能够记录成功。

  > 当前方法的事务设置该属性后，调用该方法，会先挂起已有的事务，为该方法创建一个新的事务，当新事物提交或回滚后，再执行挂起的事务

## 九、AOP

### 9.1、AOP基础

#### 概述

**AOP**：**A**spect **O**riented **P**rogramming（面向切面编程、面向方面编程），其实就是面向特定方法编程。

使用场景：

- 记录操作日志
- 权限控制
- 事务管理
- .....

优势：

- 代码无入侵
- 减少重复代码
- 提高开发效率
- 维护方便

例如：部分功能运行较慢，定位执行耗时较长的业务方法，此时需要统计每一个业务方法的执行耗时

![image-20241209173503658](https://gitee.com/cmyk359/img/raw/master/img/image-20241209173503658-2024-12-917:35:40.png)

AOP的解决方案：

![image-20241209173611618](https://gitee.com/cmyk359/img/raw/master/img/image-20241209173611618-2024-12-917:36:40.png)



#### 快速入门

Spring AOP快速入门：统计各个业务层方法执行耗时

1. 导入AOP依赖

   ```xml
   <!-- AOP-->
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-aop</artifactId>
   </dependency>
   ```

   

2. 编写AOP程序：针对特定方法根据业务需要进行编程

   ```java
   
   @Component
   @Aspect
   @Slf4j
   public class TimeAspect {
   
       @Around("execution(* com.example.service.*.*(..))") //指定
       public Object recordTime(ProceedingJoinPoint joinPoint) throws Throwable {
           //1、获得方法运行开始时间
           long begin = System.currentTimeMillis();
   
           //2、运行原始方法
           Object result = joinPoint.proceed(); //执行切入点方法，
   
           //3、获取方法结束时间，计算运行耗时
           long end = System.currentTimeMillis();
           log.info(joinPoint.getSignature()+"方法执行耗时为:{}ms",end-begin);
           return result;
       }
   }
   
   ```

   

#### 核心概念

- 连接点：JoinPoint，**可以被AOP控制的方法**（暗含方法执行时的相关信息）
- 通知：Advice，指哪些重复的逻辑，也就是**共性功能**（最终体现为一个方法）
- 切入点：Pointcut，**匹配连接点的条件**，通知仅会在切入点方法执行时被应用
- 切面：Aspect，描述通知与切入点的对应关系（**通知+切入点**）
- 目标对象：Target，通知所应用的对象

![image-20241209201837028](https://gitee.com/cmyk359/img/raw/master/img/image-20241209201837028-2024-12-920:18:40.png)

![image-20241209201913094](https://gitee.com/cmyk359/img/raw/master/img/image-20241209201913094-2024-12-920:19:20.png)



#### AOP执行流程

AOP是基于`动态代理`实现的，程序运行时会针对目标对象生成`代理对象`，按照通知中的逻辑对原始方法进行增强，执行时所注入的不再是目标对象而是增强后的代理对象，调用方法时使用的也是代理对象中的方法

![image-20240508115303160](https://gitee.com/cmyk359/img/raw/master/img/image-20240508115303160-2024-5-811:53:26.png)



### 9.2、AOP进阶

#### 通知的类型

1. @Around：环绕通知，此注解标注的通知方法在目标方法前、后都被执行
2. @Before：前置通知，此注解标注的通知方法在目标方法前被执行
3. @After：后置通知，此注解标注的通知方法在目标方法后被执行，无论是否有异常都会执行（又称为最终执行）
4. @AfterReturning：返回后通知，此注解标注的通知方法在目标方法后被执行，有异常不会执行（正常返回后执行）
5. @AfterThrowing：异常后通知，此注解标注的通知方法发生异常后执行（发生异常时执行，与上一个互斥）



> 注意
>
> - @Around环绕通知需要自己调用ProceedingJoinPoint.proceed（）来让原始方法执行，其他通知不需要考虑目标方法执行
> - @Around环绕通知方法的返回值，必须指定为object，来接收原始方法的返回值。（手动将原始方法的返回值return）





#### 通知顺序

当有多个切面的切入点都匹配到了目标方法，目标方法运行时，多个通知方法都会被执行。

执行顺序：

1. 不同切面类中，默认按照切面类的类名字母排序：
   - 目标方法前的通知方法：字母排名靠前的先执行
   - 目标方法后的通知方法：字母排名靠前的后执行
2. 用`@Order（数字）`加在切面类上来控制顺序
   - 目标方法前的通知方法：数字小的先执行
   - 目标方法后的通知方法：数字小的后执行



#### 切入点

每个通知中都必须通过切入点表达式指定要增强的方法，每个都需要写一个表达式，臃肿且不变修改，可以将切入点表达式抽取出来，可供多个切面类使用

@PintCut

该注解的作用是将公共的切点表达式抽取出来，需要用到时引用该切入点表达式即可。

![image-20241209180045106](https://gitee.com/cmyk359/img/raw/master/img/image-20241209180045106-2024-12-918:00:50.png)



**切入点表达式**

- 描述切入点方法的一种表达式

- 作用：主要用来**决定项目中的哪些方法需要加入通知**

- 常见形式

  - execution(...)：根据方法的签名来匹配

    ![image-20241209202517446](https://gitee.com/cmyk359/img/raw/master/img/image-20241209202517446-2024-12-920:25:40.png)

    

  - @annotation(...)：根据注解匹配

    ![image-20241209202542532](https://gitee.com/cmyk359/img/raw/master/img/image-20241209202542532-2024-12-920:25:48.png)



##### 切入点表达式-execution

execution 主要根据方法的返回值、包名、类名、方法名、方法参数等信息来匹配，语法为：

![image-20241209202845076](https://gitee.com/cmyk359/img/raw/master/img/image-20241209202845076-2024-12-920:28:46.png)

其中带`？`的表示可以省略的部分

- 访问修饰符：可省略（比如：public、protected）
- 包名.类名：可省略
- throws 异常：可省略（注意是方法上声明抛出的异常，不是实际抛出的异常）



可以使用通配符描述切入点

- `*` ：单个独立的任意符号，可以通配任意返回值、包名、类名、方法名、任意类型的**一个参数**，也可以<u>通配包、类、方法名的一部分</u>。

  ```java
  execution(* com.*.service.update(*))
  ```

- `..`：多个连续的任意符号，可以通配任意层级的包，或任意类型、**任意个数的参数**

  ```java
  execution(* com.itheima..DeptService.*(..))
  ```

> 根据业务需要，可以使用 且（&&）、或（||）、非（！）来组合比较复杂的切入点表达式。



书写建议：

- 所有业务**方法名**在命名时尽量**规范**，方便切入点表达式快速匹配。如：查询类方法都是find开头，更新类方法都是update开头。
- 描述切入点方法通常**基于接口描述**，而不是直接描述实现类，**增强拓展性**。
- 在满足业务需要的前提下，**尽量缩小切入点的匹配范围**。如：包名匹配尽量不使用..，使用*匹配单个包。



##### 切入点表达式-@annotation

@annotation切入点表达式，用于匹配标识有**特定注解**的方法。

```java
@annotation(com.itheima.anno.Log) //括号内为注解的全类名
```



因此，可以自定义一个注解，用作标识

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Log {
}
```

```java
@Before（"@annotation（com.itheima.anno.Log）"）
public void before() {
    log.info("before....");
}
```

这种方法十分灵活，对于一些命名不规范的方法，采用`execution表达式`来匹配需要添加多个表达式，十分冗长。此时可以使用 `@annotation`切入点表达式来匹配，只需在要匹配的方法上添加自定义注解即可。



#### 连接点

​	在Spring中用`JoinPoint`抽象了连接点，用它可以获得方法执行时的相关信息，如目标类名、方法名、方法参数等。

- 对于@Around 通知,获取连接点信息只能使用 `ProceedingJoinPoint`
- 对于其他四种通知，获取连接点信息只能使用 `JoinPoint`，它是` ProceedingJoinPoint` 的父类型

![image-20241209205048611](https://gitee.com/cmyk359/img/raw/master/img/image-20241209205048611-2024-12-920:51:02.png)



### 9.3、案例

​	将案例中 **增、删、改** 相关接口的操作日志记录到数据库表中。

​	日志信息包含：操作人、操作时间、执行方法的全类名、执行方法名、方法运行时参数、返回值、方法执行时长

- 需要对所有业务类中的增、删、改方法添加统一功能，使用AOP技术最为方便
- 需要获得方法的返回值和方法的执行时长，故应该采用`@Arround`环绕通知
- 由于增、删、改方法名没有规律，可以自定义注解（@Log）完成目标方法匹配，使用`@annotation`切入点表达式

![image-20240508170551209](https://gitee.com/cmyk359/img/raw/master/img/image-20240508170551209-2024-5-817:06:49.png)

准备：

- AOP依赖

  ```xml
  <!-- AOP-->
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-aop</artifactId>
  </dependency>
  ```

  

- 日志表

  ```sql
  -- 操作日志表
  create table operate_log(
      id int unsigned primary key auto_increment comment 'ID',
      operate_user int unsigned comment '操作人ID',
      operate_time datetime comment '操作时间',
      class_name varchar(100) comment '操作的类名',
      method_name varchar(100) comment '操作的方法名',
      method_params varchar(1000) comment '方法参数',
      return_value varchar(2000) comment '返回值',
      cost_time bigint comment '方法执行耗时, 单位:ms'
  ) comment '操作日志表';
  ```

编码：

- 自定义注解`@Log`用作标识

  ```java
  @Retention(RetentionPolicy.RUNTIME)
  @Target(ElementType.METHOD)
  public @interface Log {
  }
  ```

  

- 定义日志表的实体类`OperateLog`，定义操作数据库的Mapper接口`OperateLogMapper`，在接口中定义插入方法即可。

  ```java
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public class OperateLog {
      private Integer id; //ID
      private Integer operateUser; //操作人ID
      private LocalDateTime operateTime; //操作时间
      private String className; //操作类名
      private String methodName; //操作方法名
      private String methodParams; //操作方法参数
      private String returnValue; //操作方法返回值
      private Long costTime; //操作耗时
  }
  ```

  ```java
  @Mapper
  public interface OperateLogMapper {
  
      //插入日志数据
      @Insert("insert into operate_log (operate_user, operate_time, class_name, method_name, method_params, return_value, cost_time) " +
              "values (#{operateUser}, #{operateTime}, #{className}, #{methodName}, #{methodParams}, #{returnValue}, #{costTime});")
      public void insert(OperateLog log);
  
  }
  ```

  

- 定义切面类，完成记录操作日志的逻辑

  ```java
  @Component
  @Aspect
  @Slf4j
  public class LogAspect {
  
      @Autowired
      private HttpServletRequest request;
  
      @Autowired
      private OperateLogMapper operateLogMapper;
  
      @Around("@annotation(com.example.anno.Log)")
      public Object recordLog(ProceedingJoinPoint joinPoint) throws Throwable {
          //获得操作者id
              //通过对请求头中JWT令牌解析，获得当前操作者的id
          String JwtToken = request.getHeader("token");
          Claims claims = JwtUtils.parseJWT(JwtToken);
          Integer operatorUser =(Integer) claims.get("id");
  
          //操作执行的时间
          LocalDateTime operateTime = LocalDateTime.now();
  
          //所操作的类名
          String className = joinPoint.getClass().getName();
          //所执行的方法名
          String methodName = joinPoint.getSignature().getName();
          //方法传入的参数
          Object[] args = joinPoint.getArgs();
          String methodParams = Arrays.toString(args);
  
          //调用原始目标方法运行
          long begin = System.currentTimeMillis();
          Object result = joinPoint.proceed();
          long end = System.currentTimeMillis();
          //返回值
          String returnValue = JSON.toJSONString(result);
          //方法执行耗时
          Long costTime = end - begin;
  
          //记录操作日志
          OperateLog operateLog = new OperateLog(null,operatorUser,operateTime,className,methodName,methodParams,returnValue,costTime);
          operateLogMapper.insert(operateLog);
          log.info("记录操作日志：{}",operateLog);
  
          return result;
      }
  }
  
  ```

- 在部门管理和员工管理的Controller中，在执行增、删、改的方法上添加自定义注解`@Log`，当访问这些接口时会自动记录日志。如：

  ![image-20240508171422153](https://gitee.com/cmyk359/img/raw/master/img/image-20240508171422153-2024-5-817:14:26.png)

## 十、Springboot原理探究

### 10.1、配置优先级



**优先级：低→高**

- application.yaml（忽略）
- application.yml
- application.properties
- java系统属性（-Dxxx=xxx）
- 命令行参数（--xxx=xxx）



在SpringBoot 中支持三种格式的配置文件：

![PixPin_2024-12-09_20-57-21](https://gitee.com/cmyk359/img/raw/master/img/PixPin_2024-12-09_20-57-21-2024-12-920:58:40.png)

SpringBoot除了支持配置文件属性配置，还支持**Java系统属性**和**命令行参数**的方式进行属性配置。

![image-20241209210111973](https://gitee.com/cmyk359/img/raw/master/img/image-20241209210111973-2024-12-921:01:40.png)



### 10.2、Bean管理

#### bean的获取

​	默认情况下，Spring项目启动时，会把bean都创建好放在IOC容器中，如果想要主动获取这些bean可以通过如下方式：

- 根据name获取bean

  ```java
  Object getBean(String name)
  ```

- 根据类型获取bean

  ```java
  <T> T getBean(Class<T> requiredType)
  ```

- 根据name获取bean（带类型转换）

  ```java
  <T> T getBean(String name, Class<T> requiredType)
  ```



> 注意：上述所说的【Spring项目启动时，会把其中的bean都创建好】还会受到作用域及延迟初始化影响，这里主要针对于默认的单例非延迟加载的bean而言。

```java
class SpringbootWebConfig2ApplicationTests {

    @Autowired
    private ApplicationContext applicationContext; //IOC容器对象

    @Test
    public void testGetBean(){
        //根据bean的名称获取，bean名称默认为类名首字母小写
        DeptController bean1 = (DeptController) applicationContext.getBean("deptController");
        System.out.println(bean1);

        //根据bean的类型获取
        DeptController bean2 = applicationContext.getBean(DeptController.class);
        System.out.println(bean2);

        //根据bean的名称 及 类型获取
        DeptController bean3 = applicationContext.getBean(
            "deptController", DeptController.class);
        System.out.println(bean3);
    }
}
```

三种方式获得的是同一个bean对象，说明IOC容器中改bean对象只有一个，是`单例`的

![image-20240509091138415](https://gitee.com/cmyk359/img/raw/master/img/image-20240509091138415-2024-5-909:11:46.png)



#### bean的作用域

Spring支持五种作用域，后三种在web环境才生效：

![image-20241209210632428](https://gitee.com/cmyk359/img/raw/master/img/image-20241209210632428-2024-12-921:06:40.png)



可以通过`@Scope`注解来进行配置作用域：

```java
@Scope("prototype") //通过@Scope注解来进行配置作用域
@RestController
@RequestMapping("/depts")
}
public class DeptController f
```



> 注意：
>
> i. 默认singleton的bean，在容器启动时被创建，可以使用@Lazy注解来延迟初始化（延迟到第一次使用时）。
> ii. prototype的bean，每一次使用该bean的时候都会创建一个新的实例。
>
> iii. 实际开发当中，绝大部分的Bean是单例的，也就是说绝大部分Bean不需要配置scope属性。





#### 第三方bean

如果要管理的bean对象来自于第三方（不是自定义的），是无法用@Component及衍生注解声明bean的，就需要用到`@Bean`注解。

若要管理的第三方bean对象，建议对这些bean进行集中分类配置，可以通过@Configuration注解声明一个配置类。

![image-20241209211050702](https://gitee.com/cmyk359/img/raw/master/img/image-20241209211050702-2024-12-921:10:51.png)



> i. 通过@Bean注解的name或value属性可以声明bean的名称，如果不指定，**<u>默认bean的名称就是方法名</u>**。
> ii. <u>如果第三方bean需要依赖其它bean对象，直接在bean定义方法中设置形参即可，容器会根据类型自动装配。</u>



将第三方操作XML文件的工具类交给spring管理，使用时直接自动注入，不用再自己创建对象。

```java
@Configuration //配置类
public class CommonConfig {

    //声明第三方bean
    @Bean //将当前方法的返回值对象交给IOC容器管理, 成为IOC容器bean
          //通过@Bean注解的name/value属性指定bean名称, 如果未指定, 默认是方法名
    public SAXReader reader(DeptService deptService){
        System.out.println(deptService);
        return new SAXReader();
    }

}
```

测试

```java
@SpringBootTest
class SpringbootWebConfig2ApplicationTests {


    @Autowired
    private SAXReader saxReader;

    //第三方bean的管理
    @Test
    public void testThirdBean() throws Exception {
        //SAXReader saxReader = new SAXReader();
        Document document = saxReader.read(this.getClass().getClassLoader().getResource("1.xml"));
        Element rootElement = document.getRootElement();
        String name = rootElement.element("name").getText();
        String age = rootElement.element("age").getText();

        System.out.println(name + " : " + age);
    }
}
```



补充：读写XML文档主要依赖于`org.dom4j.io`包，有DOMReader和SAXReader两种方式。

```xml
<!--Dom4j-->
<dependency>
    <groupId>org.dom4j</groupId>
    <artifactId>dom4j</artifactId>
    <version>2.1.3</version>
</dependency>
```





### 10.3、springboot原理

![image-20240509095011100](https://gitee.com/cmyk359/img/raw/master/img/image-20240509095011100-2024-5-909:50:46.png)

#### 起步依赖

SpringBoot官方的起步依赖都遵循一样的命名规范，都以`spring-boot-starter-`开头

原理：起步依赖背后使用的其实就是`Maven的传递依赖机制`。假设B依赖于C，而A又依赖于B，那么A无需明确声明对C的依赖，而是通过B依赖于C。因此看似只添加了一个依赖，但实际上通过传递依赖，我们已经引入了一堆的依赖。



#### 自动配置

##### 概述

SpringBoot的自动配置就是当spring容器启动后，一些配置类、bean对象就自动存入到了IOC容器中，不需要我们手动去声明，从而简化了开发，省去了繁琐的配置操作。

![image-20230114205745221](https://gitee.com/cmyk359/img/raw/master/img/image-20230114205745221-2024-5-912:20:02.png)

##### 常见方案

> 方案一：@ComponentScan 组件扫描

@ComponentScan组件扫描

在类上添加@Component注解来声明bean对象，同时使用@ComponentScan保证@Component注解能被Spring的组件扫描到，将其中的对象交给Spring管理，实现自动配置。



如果采用以上这种方式来完成自动配置，那我们进行项目开发时，当需要引入大量的第三方的依赖，就需要在启动类上配置N多要扫描的包，这种方式会很繁琐。而且这种大面积的扫描性能也比较低。



**SpringBoot中并没有采用以上这种方案。**



> 方案二：@Import 导入

![image-20240509123913221](https://gitee.com/cmyk359/img/raw/master/img/image-20240509123913221-2024-5-912:39:46.png)



1). 使用@Import导入普通类：

```java
@Import(TokenParser.class) //导入的类会被Spring加载到IOC容器中
@SpringBootApplication
public class SpringbootWebConfig2Application {
    public static void main(String[] args) {
        SpringApplication.run(SpringbootWebConfig2Application.class, args);
    }
}
```



2). 使用@Import导入配置类：

- 配置类

  ```java
  @Configuration
  public class HeaderConfig {
      @Bean
      public HeaderParser headerParser(){
          return new HeaderParser();
      }
  
      @Bean
      public HeaderGenerator headerGenerator(){
          return new HeaderGenerator();
      }
  }
  ```

- 启动类

  ```java
  @Import(HeaderConfig.class) //导入配置类
  @SpringBootApplication
  public class SpringbootWebConfig2Application {
      public static void main(String[] args) {
          SpringApplication.run(SpringbootWebConfig2Application.class, args);
      }
  }
  ```



3). 使用@Import导入ImportSelector接口实现类：

- ImportSelector接口实现类

  ```java
  public class MyImportSelector implements ImportSelector {
      public String[] selectImports(AnnotationMetadata importingClassMetadata) {
          //返回值字符串数组（数组中封装了全限定名称的类）
          return new String[]{"com.example.HeaderConfig"};
      }
  }
  ```

  > 将要加载的类定义在一份文件中，最终读取这份文件，将文件中的字符串读取处理，封装在String数组中返回即可

- 启动类

  ```java
  @Import(MyImportSelector.class) //导入ImportSelector接口实现类
  @SpringBootApplication
  public class SpringbootWebConfig2Application {
  
      public static void main(String[] args) {
          SpringApplication.run(SpringbootWebConfig2Application.class, args);
      }
  }
  
  ```



4). 使用第三方依赖提供的 @EnableXxxxx注解，其中封装了@import

- 第三方依赖中提供的注解@EnableXxxxx

  ```java
  @Retention(RetentionPolicy.RUNTIME)
  @Target(ElementType.TYPE)
  @Import(MyImportSelector.class)//指定要导入哪些bean对象或配置类
  public @interface EnableHeaderConfig { 
  }
  ```

- 在使用时只需在启动类上加上@EnableXxxxx注解即可

  ```java
  @EnableHeaderConfig  //使用第三方依赖提供的Enable开头的注解
  @SpringBootApplication
  public class SpringbootWebConfig2Application {
      public static void main(String[] args) {
          SpringApplication.run(SpringbootWebConfig2Application.class, args);
      }
  }
  
  ```

  

##### 原理分析

######  源码跟踪

通过源码跟踪的形式来剖析下SpringBoot底层到底是如何完成自动配置的。

要搞清楚SpringBoot的自动配置原理，要从SpringBoot启动类上使用的核心注解`@SpringBootApplication`开始分析：

![image-20230115001439110](https://gitee.com/cmyk359/img/raw/master/img/image-20230115001439110-2024-5-911:55:46.png)



在@SpringBootApplication注解中包含了：

- 元注解
- @SpringBootConfiguration
- @EnableAutoConfiguration
- @ComponentScan



我们先来看第一个注解：@SpringBootConfiguration

![image-20230115001950076](https://gitee.com/cmyk359/img/raw/master/img/image-20230115001950076-2024-5-911:53:46.png)

> @SpringBootConfiguration注解中使用了@Configuration，表明SpringBoot启动类就是一个配置类。
>
> @Indexed注解，是用来加速应用启动的（不用关心）。



接下来再先看@ComponentScan注解：

![image-20230115002450993](https://gitee.com/cmyk359/img/raw/master/img/image-20230115002450993-2024-5-911:54:46.png)

> @ComponentScan注解是用来进行组件扫描的，扫描启动类所在的包及其子包下所有被@Component及其衍生注解声明的类。
>
> SpringBoot启动类，之所以具备扫描包功能，就是因为包含了@ComponentScan注解。



最后我们来看看@EnableAutoConfiguration注解（自动配置核心注解）：

![image-20230115002743115](https://gitee.com/cmyk359/img/raw/master/img/image-20230115002743115-2024-5-911:50:46.png)



> 使用@Import注解，导入了实现ImportSelector接口的实现类。
>
> AutoConfigurationImportSelector类是ImportSelector接口的实现类。
>
> ![image-20230115003242549](https://gitee.com/cmyk359/img/raw/master/img/image-20230115003242549-2024-5-911:51:46.png)

AutoConfigurationImportSelector类中重写了ImportSelector接口的`selectImports()`方法：

![image-20230115003348288](https://gitee.com/cmyk359/img/raw/master/img/image-20230115003348288-2024-5-911:58:46.png)

> selectImports()方法底层调用getAutoConfigurationEntry()方法，获取可自动配置的配置类信息集合

![image-20230115003704385](https://gitee.com/cmyk359/img/raw/master/img/image-20230115003704385-2024-5-912:06:46.png)

> getAutoConfigurationEntry()方法通过调用getCandidateConfigurations(annotationMetadata, attributes)方法获取在配置文件中配置的所有自动配置类的集合

![image-20230115003903302](https://gitee.com/cmyk359/img/raw/master/img/image-20230115003903302-2024-5-911:52:46.png)

> getCandidateConfigurations方法的功能：
>
> 获取所有基于META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports文件、META-INF/spring.factories文件中配置类的集合



META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports文件和META-INF/spring.factories文件这两个文件在哪里呢？

- 通常在引入的起步依赖中，都有包含以上两个文件

![image-20230129090835964](https://gitee.com/cmyk359/img/raw/master/img/image-20230129090835964-2024-5-912:03:46.png) 

![image-20230115064329460](https://gitee.com/cmyk359/img/raw/master/img/image-20230115064329460-2024-5-911:56:46.png)





**自动配置源码小结**

自动配置原理源码入口就是@SpringBootApplication注解，在这个注解中封装了3个注解，分别是：

- @SpringBootConfiguration
  - 声明当前类是一个配置类
- @ComponentScan
  - 进行组件扫描（SpringBoot中默认扫描的是启动类所在的当前包及其子包）
- @EnableAutoConfiguration
  - 封装了@Import注解（Import注解中指定了一个ImportSelector接口的实现类）
    - 在实现类重写的selectImports()方法，读取当前项目下所有依赖jar包中*META-INF/spring.factories*、*META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports*两个文件里面定义的配置类（配置类中定义了@Bean注解标识的方法）。根据`特定条件`决定可以导入哪些配置类，接口中的selectImports()方法返回的就是可以导入的配置类名。

> 从Spring Boot 2.7开始，AutoConfigurationImportSelector不再从/META-INF/spring.factories加载自动配置类，而是开始使用新的/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports文件，直接在里面添加自动配置类的全限定类名即可。
>

当SpringBoot程序启动时，就会加载配置文件当中所定义的配置类，并将这些配置类信息(类的全限定名)封装到String类型的数组中，最终通过@Import注解将这些配置类全部加载到Spring的IOC容器中，交给IOC容器管理。

但是在两个文件中定义的配置类非常多，而且每个配置类中又可以定义很多的bean，这些bean并不会都注册到Spring的IOC容器中。 在声明bean对象时，上面有加一个以`@Conditional开头`的注解，这种注解的作用就是按照条件进行装配，只有满足条件之后，才会将bean注册到Spring的IOC容器中（下面会详细来讲解）



###### @Conditional

- 作用：按照一定的条件进行判断，在满足给定条件后才会注册对应的bean对象到Spring IOC容器中。
- 位置：方法、类
- `@Conditional` **本身是一个父注解，派生出大量的子注解**：
  - `@ConditionalOnClass`：判断环境中是否有对应字节码文件，才注册bean到IOC容器。
  - `@ConditionalOnMissingBean`：判断环境中没有对应的bean（类型或名称），才注册bean到IOC容器。
  - `@ConditionalOnProperty`：判断配置文件中有对应属性和值，才注册bean到IOC容器。

![image-20240509121245446](https://gitee.com/cmyk359/img/raw/master/img/image-20240509121245446-2024-5-912:12:46.png)

#### 案例：自定义Starter

场景：在实际开发中，经常会定义一些公共组件，提供给各个项目团队使用。而在SpringBoot的项目中，一般会将这些公共组件封装为SpringBoot 的 starter。

需求：自定义`aliyun-oss-spring-boot-starter`，完成阿里云OSS操作工具类`AliyunOSSUtils`的自动配置

目标：引入起步依赖引入之后，要想使用阿里云OSS，注入`AliyunOsSutils`直接使用即可。

![image-20241209211734419](https://gitee.com/cmyk359/img/raw/master/img/image-20241209211734419-2024-12-921:17:35.png)



> SpringBoot官方starter命名： spring-boot-starter-xxxx
>
> 第三组织提供的starter命名：  xxxx-spring-boot-starter





分析mybatis的依赖是如何加载的

![image-20240509181251283](https://gitee.com/cmyk359/img/raw/master/img/image-20240509181251283-2024-5-918:13:46.png)



![image-20230115225703863](https://gitee.com/cmyk359/img/raw/master/img/image-20230115225703863-2024-5-918:14:03.png)

> Mybatis提供了配置类，并且也提供了springboot会自动读取的配置文件。当SpringBoot项目启动时，会读取到spring.factories配置文件中的配置类并加载配置类，生成相关bean对象注册到IOC容器中。
>
> 结果：我们可以直接在SpringBoot程序中使用Mybatis自动配置的bean对象。





![image-20241209211958547](https://gitee.com/cmyk359/img/raw/master/img/image-20241209211958547-2024-12-921:19:59.png)



1、创建 aliyun-oss-springboot-start 模块

![image-20240509181625217](https://gitee.com/cmyk359/img/raw/master/img/image-20240509181625217-2024-5-918:16:26.png)



2、创建 aliyun-oss-spring-boot-autoconfigure 模块

![image-20240509182110887](https://gitee.com/cmyk359/img/raw/master/img/image-20240509182110887-2024-5-918:21:46.png)



1. 在pom.xml文件中添加相关依赖

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
       <modelVersion>4.0.0</modelVersion>
       <parent>
           <groupId>org.springframework.boot</groupId>
           <artifactId>spring-boot-starter-parent</artifactId>
           <version>2.7.5</version>
           <relativePath/> <!-- lookup parent from repository -->
       </parent>
   
       <groupId>com.aliyun.oss</groupId>
       <artifactId>aliyun-oss-spring-boot-autoconfigure</artifactId>
       <version>0.0.1-SNAPSHOT</version>
   
       <properties>
           <java.version>1.8</java.version>
       </properties>
       <dependencies>
           <dependency>
               <groupId>org.springframework.boot</groupId>
               <artifactId>spring-boot-starter</artifactId>
           </dependency>
   
           <!--  引入web开发起步依赖      -->
           <dependency>
               <groupId>org.springframework.boot</groupId>
               <artifactId>spring-boot-starter-web</artifactId>
           </dependency>
           <!--        添加阿里云OSS依赖  -->
           <dependency>
               <groupId>com.aliyun.oss</groupId>
               <artifactId>aliyun-sdk-oss</artifactId>
               <version>3.15.1</version>
           </dependency>
           <!-- lombok -->
           <dependency>
               <groupId>org.projectlombok</groupId>
               <artifactId>lombok</artifactId>
           </dependency>
           <dependency>
               <groupId>org.springframework.boot</groupId>
               <artifactId>spring-boot-configuration-processor</artifactId>
           </dependency>
       </dependencies>
   
   </project>
   
   ```

   

2. 修改AliOSSProperties.java 和 AliOSSUtiles.java中的代码

   这两个类都不用再使用@Component注解，  在SpringBoot项目中，并不会去扫描com.aliyun.oss这个包，不扫描这个包那类上的注解也就失去了作用。

   ```java
   package com.aliyun.oss;
   
   import lombok.Data;
   import org.springframework.boot.context.properties.ConfigurationProperties;
   import org.springframework.stereotype.Component;
   
   /**
    * @ClassName AliOSSProperties
    * @Description TODO
    * @Author 86152
    * @Date 2024/5/6 22:28
    * @Version 1.0
    */
   @Data
   @ConfigurationProperties(prefix = "aliyun.oss")
   public class AliOSSProperties {
       private String endpoint;
       private String accessKeyId;
       private String accessKeySecret;
       private String bucketName;
   }
   
   ```

   ```java
   package com.aliyun.oss;
   
   import com.aliyun.oss.OSS;
   import com.aliyun.oss.OSSClientBuilder;
   import org.springframework.beans.factory.annotation.Autowired;
   import org.springframework.stereotype.Component;
   import org.springframework.web.multipart.MultipartFile;
   
   import java.io.IOException;
   import java.io.InputStream;
   import java.util.UUID;
   
   /**
    * 阿里云 OSS 工具类
    */
   public class AliOSSUtils {
   
       /**
        * 实现上传图片到OSS
        */
   
       private AliOSSProperties aliOSSProperties;
   
       public void setAliOSSProperties(AliOSSProperties aliOSSProperties) {
           this.aliOSSProperties = aliOSSProperties;
       }
   
       public AliOSSProperties getAliOSSProperties() {
           return aliOSSProperties;
       }
   
       public String upload(MultipartFile file) throws IOException {
           //获取阿里云OSS配置信息
           String endpoint = aliOSSProperties.getEndpoint();
           String accessKeyId = aliOSSProperties.getAccessKeyId();
           String accessKeySecret = aliOSSProperties.getAccessKeySecret();
           String bucketName = aliOSSProperties.getBucketName();
           // 获取上传的文件的输入流
           InputStream inputStream = file.getInputStream();
   
           // 避免文件覆盖
           String originalFilename = file.getOriginalFilename();
           String fileName = UUID.randomUUID().toString() + originalFilename.substring(originalFilename.lastIndexOf("."));
   
           //上传文件到 OSS
           OSS ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
           ossClient.putObject(bucketName, fileName, inputStream);
   
           //文件访问路径
           String url = endpoint.split("//")[0] + "//" + bucketName + "." + endpoint.split("//")[1] + "/" + fileName;
           // 关闭ossClient
           ossClient.shutdown();
           return url;// 把上传到oss的路径返回
       }
   
   }
   
   ```

   

3. 添加配置类

   ```java
   package com.aliyun.oss;
   
   import org.springframework.boot.context.properties.EnableConfigurationProperties;
   import org.springframework.context.annotation.Bean;
   import org.springframework.context.annotation.Configuration;
   
   /**
    * @ClassName AliyunOSSAutoconfiguration
    * @Description TODO 自动配置类
    * @Author 86152
    * @Date 2024/5/9 17:28
    * @Version 1.0
    */
   
   @Configuration
   @EnableConfigurationProperties(AliOSSProperties.class)  //将AliOSSProperties导入IOC容器，称为IOC容器中的bean
   public class AliOSSAutoConfiguration {
   
       @Bean
       //第三方bean要使用其他bean对象，直接在bean定义方法中设置形参即可，容器会根据类型自动装配。
       public AliOSSUtils aliOSSUtils(AliOSSProperties aliOSSProperties) {  
           AliOSSUtils aliOSSUtils = new AliOSSUtils();
           aliOSSUtils.setAliOSSProperties(aliOSSProperties);//手动设置私有属性aliOSSProperties
           return aliOSSUtils;
       }
   }
   
   ```

   

4. 创建自动配置文件：`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`，将配置类添加进入，Spring启动的时候就会扫描这个文件，将其中的类交给Spring容器管理，称为IOC容器中的bean

   ![image-20240509182812818](https://gitee.com/cmyk359/img/raw/master/img/image-20240509182812818-2024-5-918:28:46.png)

   

5、测试

在项目pom文件中导入 aliyun-oss-springboot-starter依赖，使用@Autowired在运行中获取AliOSSUtils对象完成文件上传

![image-20240509183259325](https://gitee.com/cmyk359/img/raw/master/img/image-20240509183259325-2024-5-918:33:46.png)

![image-20240509183330365](https://gitee.com/cmyk359/img/raw/master/img/image-20240509183330365-2024-5-918:34:46.png)



## 1.12、后端开发总结



到此基于SpringBoot进行web后端开发的相关知识我们已经学习完毕了。下面我们一起针对这段web课程做一个总结。

我们来回顾一下关于web后端开发，我们都学习了哪些内容，以及每一块知识，具体是属于哪个框架的。

web后端开发现在基本上都是基于标准的三层架构进行开发的，在三层架构当中，Controller控制器层负责接收请求响应数据，Service业务层负责具体的业务逻辑处理，而Dao数据访问层也叫持久层，就是用来处理数据访问操作的，来完成数据库当中数据的增删改查操作。

![image-20230114180044897](https://gitee.com/cmyk359/img/raw/master/img/image-20230114180044897-2024-5-920:42:46.png)

> 在三层架构当中，前端发起请求首先会到达Controller(不进行逻辑处理)，然后Controller会直接调用Service 进行逻辑处理， Service再调用Dao完成数据访问操作。



如果我们在执行具体的业务处理之前，需要去做一些通用的业务处理，比如：我们要进行统一的登录校验，我们要进行统一的字符编码等这些操作时，我们就可以借助于Javaweb当中三大组件之一的过滤器Filter或者是Spring当中提供的拦截器Interceptor来实现。

![image-20230114191737227](https://gitee.com/cmyk359/img/raw/master/img/image-20230114191737227-2024-5-920:41:47.png)



而为了实现三层架构层与层之间的解耦，我们学习了Spring框架当中的第一大核心：IOC控制反转与DI依赖注入。

> 所谓控制反转，指的是将对象创建的控制权由应用程序自身交给外部容器，这个容器就是我们常说的IOC容器或Spring容器。
>
> 而DI依赖注入指的是容器为程序提供运行时所需要的资源。



除了IOC与DI我们还讲到了AOP面向切面编程，还有Spring中的事务管理、全局异常处理器，以及传递会话技术Cookie、Session以及新的会话跟踪解决方案JWT令牌，阿里云OSS对象存储服务，以及通过Mybatis持久层架构操作数据库等技术。

![image-20230114192921673](https://gitee.com/cmyk359/img/raw/master/img/image-20230114192921673-2024-5-920:45:46.png)



我们在学习这些web后端开发技术的时候，我们都是基于主流的SpringBoot进行整合使用的。而SpringBoot又是用来简化开发，提高开发效率的。像过滤器、拦截器、IOC、DI、AOP、事务管理等这些技术到底是哪个框架提供的核心功能？

![image-20230114193609782](https://gitee.com/cmyk359/img/raw/master/img/image-20230114193609782-2024-5-920:44:46.png)

> Filter过滤器、Cookie、 Session这些都是传统的JavaWeb提供的技术。
>
> JWT令牌、阿里云OSS对象存储服务，是现在企业项目中常见的一些解决方案。
>
> IOC控制反转、DI依赖注入、AOP面向切面编程、事务管理、全局异常处理、拦截器等，这些技术都是 Spring Framework框架当中提供的核心功能。
>
> Mybatis就是一个持久层的框架，是用来操作数据库的。



在Spring框架的生态中，对web程序开发提供了很好的支持，如：全局异常处理器、拦截器这些都是Spring框架中web开发模块所提供的功能，而Spring框架的web开发模块，我们也称为：SpringMVC

![image-20230114195143418](https://gitee.com/cmyk359/img/raw/master/img/image-20230114195143418-2024-5-920:43:46.png)

> SpringMVC不是一个单独的框架，它是Spring框架的一部分，是Spring框架中的web开发模块，是用来简化原始的Servlet程序开发的。



外界俗称的SSM，就是由：SpringMVC、Spring Framework、Mybatis三块组成。

基于传统的SSM框架进行整合开发项目会比较繁琐，而且效率也比较低，所以在现在的企业项目开发当中，基本上都是直接基于SpringBoot整合SSM进行项目开发的。

到此我们web后端开发的内容就已经全部讲解结束了。



## 十一、Maven高级

## 11.1、分模块开发与设计

​	对于开发一个大型的电商项目，里面可能就包括了商品模块的功能、搜索模块的功能、购物车模块、订单模块、用户中心等等。如果这些所有的业务代码我们都在一个 Java 项目当中编写，项目管理和维护起来将会非常的困难。而且对一些通用的工具类以及通用的组件，难以共享复用。

​	采用分模块开发，可以将商品的相关功能放在商品模块当中，搜索的相关业务功能我都封装在搜索模块当中，还有像购物车模块、订单模块。而为了组件的复用，也可以将项目当中的实体类、工具类以及定义的通用的组件都单独的抽取到一个模块当中。

​	如果当前这个模块，比如订单模块需要用到这些实体类以及工具类或者这些通用组件，此时直接在订单模块当中引入工具类的坐标就可以了。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240509213323666-2024-5-921:33:46.png" alt="image-20240509213323666" style="width:95%;" />



![image-20240509213240413](https://gitee.com/cmyk359/img/raw/master/img/image-20240509213240413-2024-5-921:32:46.png)

> 步骤1：创建Maven模块 tlias-pojo，存放实体类。

![image-20230113101216305](https://gitee.com/cmyk359/img/raw/master/img/image-20230113101216305-2024-5-921:41:43.png)

> 步骤2：创建Maven模块 tlias-utils，存放相关工具类。

![image-20230113102113451](https://gitee.com/cmyk359/img/raw/master/img/image-20230113102113451-2024-5-921:42:30.png)

> 步骤3：在需要的项目中引入模块

![image-20240509214402937](https://gitee.com/cmyk359/img/raw/master/img/image-20240509214402937-2024-5-921:44:03.png)

##  11.2、继承与聚合

### 继承

在案例项目分模块开发之后，在lias-pojo、tlias-utils、tlias-web-management中都引入了一个依赖 lombok 的依赖。我们在三个模块中分别配置了一次。

如果是做一个大型的项目，这三个模块当中重复的依赖可能会很多很多。如果每一个 Maven 模块里面，我们都来单独的配置一次，功能虽然能实现，但是配置是比较**繁琐**的。 Maven 的继承用来解决该问题的。



![image-20240509225135625](https://gitee.com/cmyk359/img/raw/master/img/image-20240509225135625-2024-5-922:51:46.png)

#### 继承关系实现

在Maven中是持多重继承的。让自己创建的三个模块，都继承tlias-parent，而tlias-parent 再继承 spring-boot-starter-parent。

![image-20230113113004727](https://gitee.com/cmyk359/img/raw/master/img/image-20230113113004727-2024-5-922:55:46.png)



> 步骤一：创建父工程模块

![image-20240509225851531](https://gitee.com/cmyk359/img/raw/master/img/image-20240509225851531-2024-5-922:58:52.png)

![image-20240509230119583](https://gitee.com/cmyk359/img/raw/master/img/image-20240509230119583-2024-5-923:01:46.png)

> 步骤二：在子工程的pom.xml文件中，继承父工程

![image-20240509225702655](https://gitee.com/cmyk359/img/raw/master/img/image-20240509225702655-2024-5-922:57:03.png)

![image-20240509230637887](https://gitee.com/cmyk359/img/raw/master/img/image-20240509230637887-2024-5-923:06:39.png)

注：在ralativePath中，使用`../`返回当前pom文件的上一级，可以在文件管理器中查看目录结构，正确填写父工程pom文件的路径

> 步骤三：在父工程中配置各个子工程共有的依赖

![image-20240509231011187](https://gitee.com/cmyk359/img/raw/master/img/image-20240509231011187-2024-5-923:10:36.png)



#### 版本锁定

在父工程中集中管理一些依赖的版本，在子工程中，直接使用该依赖而不再需要指定属性。当版本需要变更时，只需修改父工程中设定的版本号即可，不用去修改每个子工程中的版本号。

在maven中，可以在父工程的pom文件中通过 `<dependencyManagement>` 来统一管理依赖版本。

![image-20240509233543781](https://gitee.com/cmyk359/img/raw/master/img/image-20240509233543781-2024-5-923:36:46.png)

父工程：

```xml
<!--统一管理依赖版本-->
<dependencyManagement>
    <dependencies>
        <!--JWT令牌-->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt</artifactId>
            <version>0.9.1</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

子工程：

```xml
<dependencies>
    <!--JWT令牌-->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt</artifactId>
    </dependency>
</dependencies>
```



> 注意：
>
> - 在父工程中所配置的 `<dependencyManagement>` 只能统一管理依赖版本，并不会将这个依赖直接引入进来。 这点和 `<dependencies>` 是不同的。
>
> - 子工程要使用这个依赖，还是需要使用 `<dependencies>` 引入，只是此时就无需指定 `<version>` 版本号了，父工程统一管理。变更依赖版本，只需在父工程中统一变更。



我们也可以通过`自定义属性及属性引用`的形式，在父工程中将依赖的版本号进行集中管理维护。当父工程管理的依赖很多时，要修改版本号，不需要在`<dependencyManagement>`标签中找到该依赖再去修改版本号，直接修改自定义属性即可。

![image-20240509233515708](https://gitee.com/cmyk359/img/raw/master/img/image-20240509233515708-2024-5-923:35:46.png)

1). 自定义属性

```xml
<properties>
	<lombok.version>1.18.24</lombok.version>
</properties>
```

2). 引用属性

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>${lombok.version}</version>
</dependency>
```





查看Spring框架的版本管理方式：先使用自定义标签设置依赖版本号，使用时通过`${}`获取自定义标签的值

![image-20240509233651035](https://gitee.com/cmyk359/img/raw/master/img/image-20240509233651035-2024-5-923:37:46.png)

![image-20240509233741269](https://gitee.com/cmyk359/img/raw/master/img/image-20240509233741269-2024-5-923:38:46.png)

### 聚合

项目分模块开发后，最后打包上线，需要让<u>每个模块</u>都执行maven的`package`生命周期，安装到本地仓库，才能实现成功打包，若仓库中缺失某个模块打包后的jar包，最终项目就会打包失败。

如果开发一个大型项目，拆分的模块很多，模块之间的依赖关系错综复杂，那此时要进行项目的打包、安装操作，是非常繁琐的。maven的聚合就是来解决这个问题的，通过maven的聚合就可以轻松实现项目的一键构建（清理、编译、测试、打包、安装等）。

#### 介绍

 <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20230113151533948-2024-5-923:53:24.png" alt="image-20230113151533948" style="zoom:80%;" />

- **聚合：**将多个模块组织成一个整体，同时进行项目的构建。
- **聚合工程：**一个不具有业务功能的“空”工程（有且仅有一个pom文件） 【PS：一般来说，继承关系中的父工程与聚合关系中的聚合工程是同一个】
- **作用：**快速构建项目（无需根据依赖关系手动构建，直接在聚合工程上构建即可）

#### 实现

在maven中，我们可以在聚合工程中通过 `<moudules>` 设置当前聚合工程所包含的子模块的名称。

![image-20240509235523700](https://gitee.com/cmyk359/img/raw/master/img/image-20240509235523700-2024-5-923:55:24.png)

我们可以在 tlias-parent中，添加如下配置，来指定当前聚合工程，需要聚合的模块：

```java
<!--聚合其他模块-->
<modules>
    <module>../tlias-pojo</module>
    <module>../tlias-utils</module>
    <module>../tlias-web-management</module>
</modules>
```

此时要进行编译、打包、安装操作，就无需在每一个模块上操作了。只需要在聚合工程上，统一进行操作就可以了。

### 继承与聚合对比

![image-20240509235806269](https://gitee.com/cmyk359/img/raw/master/img/image-20240509235806269-2024-5-923:58:07.png)

## 11.3、私服

### 介绍

![image-20240510000150698](https://gitee.com/cmyk359/img/raw/master/img/image-20240510000150698-2024-5-1000:02:46.png)

### 资源的上传和下载

#### 步骤分析

资源上传与下载，我们需要做三步配置，执行一条指令。

第一步配置：在maven的配置文件中配置访问私服的用户名、密码。

第二步配置：在maven的配置文件中配置连接私服的地址(url地址)。

第三步配置：在项目的pom.xml文件中配置上传资源的位置(url地址)。



配置好了上述三步之后，要上传资源到私服仓库，就执行执行maven生命周期：deploy。



> 私服仓库说明：
>
> - RELEASE：存储自己开发的RELEASE发布版本的资源。
> - SNAPSHOT：存储自己开发的SNAPSHOT发布版本的资源。
> - Central：存储的是从中央仓库下载下来的依赖。

> 项目版本说明：
>
> - RELEASE(发布版本)：功能趋于稳定、当前更新停止，可以用于发行的版本，存储在私服中的RELEASE仓库中。
> - SNAPSHOT(快照版本)：功能不稳定、尚处于开发中的版本，即快照版本，存储在私服的SNAPSHOT仓库中。





#### 具体操作

[b站课程](https://www.bilibili.com/video/BV1m84y1w7Tb?p=199&spm_id_from=pageDriver&vd_source=51d78ede0a0127d1839d6abf9204d1ee)

使用私服，需要在maven的settings.xml配置文件中，做如下配置：

1. 需要在 **servers** 标签中，配置访问私服的个人凭证(访问的用户名和密码)

   ```xml
   <server>
       <id>maven-releases</id>
       <username>admin</username>
       <password>admin</password>
   </server>
       
   <server>
       <id>maven-snapshots</id>
       <username>admin</username>
       <password>admin</password>
   </server>
   ```

   

2. 在 **mirrors** 中只配置我们自己私服的连接地址(如果之前配置过阿里云，需要直接替换掉)

   ```xml
   <mirror>
       <id>maven-public</id>
       <mirrorOf>*</mirrorOf>
       <url>http://192.168.150.101:8081/repository/maven-public/</url>
   </mirror>
   ```

   

3. 需要在 **profiles** 中，增加如下配置，来指定snapshot快照版本的依赖，依然允许使用

   ```xml
   <profile>
       <id>allow-snapshots</id>
           <activation>
           	<activeByDefault>true</activeByDefault>
           </activation>
       <repositories>
           <repository>
               <id>maven-public</id>
               <url>http://192.168.150.101:8081/repository/maven-public/</url>
               <releases>
               	<enabled>true</enabled>
               </releases>
               <snapshots>
               	<enabled>true</enabled>
               </snapshots>
           </repository>
       </repositories>
   </profile>
   ```

   

4. 如果需要上传自己的项目到私服上，需要在项目的pom.xml文件中，增加如下配置，来配置项目发布的地址(也就是私服的地址)

   ```xml
   <distributionManagement>
       <!-- release版本的发布地址 -->
       <repository>
           <id>maven-releases</id>
           <url>http://192.168.150.101:8081/repository/maven-releases/</url>
       </repository>
       
       <!-- snapshot版本的发布地址 -->
       <snapshotRepository>
           <id>maven-snapshots</id>
           <url>http://192.168.150.101:8081/repository/maven-snapshots/</url>
       </snapshotRepository>
   </distributionManagement>
   ```

5. 发布项目，直接运行 deploy 生命周期即可 (发布时，建议跳过单元测试)

