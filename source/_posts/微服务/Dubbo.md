---
title: Dubbo
categories:
  - 微服务
abbrlink: f6253398
date: 2025-07-09 09:48:02
tags:
---

<meta name = "referrer", content = "no-referrer"/>

## 一、基础知识

### 分布式理论

什么是分布式系统？

《分布式系统原理与范型》定义：分布式系统是若干独立计算机的集合，这些计算机对于用户来说就像单个相关系统。

分布式系统（distributed system）是建立在网络之上的软件系统。.

### 架构演进

随着互联网的发展，网站应用的规模不断扩大，常规的垂直应用架构已无法应对，分布式服务架构以及流动计算架构势在必行，亟需一个治理系统确保架构有条不紊的演进。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250709110427953-2025-7-911:05:06.png" style="zoom:80%;" />

1、单一应用架构

当网站流量很小时，只需一个应用，将所有功能都部署在一起，以减少部署节点和成本。此时，用于简化增删改查工作量的数据访问框架(ORM) 是关键。

2、垂直应用架构

当访问量逐渐增大，单一应用增加机器带来的加速度越来越小，将应用拆成互不相干的几个应用，以提升效率。此时，用于加速前端页面开发的 Web框架(MVC) 是关键。

3、分布式服务架构

当垂直应用越来越多，应用之间交互不可避免，将核心业务抽取出来，作为独立的服务，逐渐形成稳定的服务中心，使前端应用能更快速的响应多变的市场需求。

此时，用于提高业务复用及整合的分布式服务框架(RPC)，提供统一的服务是关键。

4、流动计算架构

当服务越来越多，容量的评估，小服务资源的浪费等问题逐渐显现，此时需增加一个调度中心基于访问压力实时管理集群容量，提高集群利用率。此时，用于提高机器利用率的资源调度和治理中心(SOA)是关键。

### RPC理论

什么是RPC？

RPC【Remote Procedure Call】是指**远程过程调用**，是一种进程间通信方式，他是一种技术的思想，而不是规范。它允许程序调用另一个地址空间（通常是共享网络的另一台机器上）的过程或函数，而不用程序员显式编码这个远程调用的细节。简言之，RPC使得程序能够像访问本地系统资源一样，去访问远端系统资源。解决的是子系统间模块功能的调用。



***

RPC架构？

一个基本的RPC架构里面应该至少包含以下4个组件：

1. 客户端（Client）：服务调用方（服务消费者）
2. 客户端存根（Client Stub）：存放服务端地址信息，将客户端的请求参数数据信息序列化成网络消息，再通过网络传输发送给服务端
3. 服务端存根（Server Stub）：接收客户端发送过来的请求消息并进行反序列化，然后再调用本地服务进行处理
4. 服务端（Server）：服务的真正提供者

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250709101651674-2025-7-910:17:10.png" style="zoom:80%;" />

**具体调用过程：**

1. 服务消费者（client客户端）通过调用本地服务的方式调用需要消费的服务；

2. 客户端存根（client stub）接收到调用请求后负责将方法、参数等信息序列化（组装）成能够进行网络传   输的消息体；

3. 客户端存根（client stub）找到远程的服务地址，并且将消息通过网络发送给服务端；

4. 服务端存根（server stub）收到消息后进行解码（反序列化操作）；

5. 服务端存根（server stub）根据解码结果调用本地的服务进行相关处理；

6. 本地服务执行具体业务逻辑并将处理结果返回给服务端存根（server stub）；

7. 服务端存根（server stub）将返回结果重新打包成消息（序列化）并通过网络发送至消费方；

8. 客户端存根（client stub）接收到消息，并进行解码（反序列化）；

9. 服务消费方得到最终结果；

而RPC框架的实现目标则是把2~8（调用、编码/解码）的过程给封装起来，让用户感觉上像调用本地服务一样的调用远程服务。

## 二、Dubbo

### 简介

Apache Dubbo 是一款高性能、轻量级的开源Java RPC框架，它提供了三大核心能力：面向接口的远程方法调用，智能容错和负载均衡，以及服务自动注册和发现。

[官网](https://cn.dubbo.apache.org/zh-cn/)

### 设计架构

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250709110642348-2025-7-911:06:42.png" alt="Dubbo架构" style="zoom:80%;" />

其中包括以下模块：

- Registry：注册中心
- Provider：服务提供者
- Consumer：服务消费者
- Container：Dubbo框架容器
- Monitor：监控中心

运行流程如下：

1. 初始化：
   - Dubbo框架启动
   - 服务提供者启动时，会将所提供的服务注册到注册中心
   - 服务消费者启动时，会从注册中心订阅所需要的服务
2. 当某个服务提供者发生了变更，注册中心会基于长连接的方式将变更推送给服务消费者
3. 服务消费者可以根据负载均衡算法从服务列表中选择所需的服务
4. 在服务调用过程中，异步地将调用信息发送到监控中心，实时监控服务运行状态

### Dubbo3的新特性

- 易用性

  开箱即用易用性高，如Java版本的面向接口代理特性能实现本地透明调用功能丰富，基于原生库或轻量扩展即可实现绝大多数的微服务治理能力。更加完善了多语言支持（GO PYTHON RUST）

- 超大规模微服务实践

  - 高性能通信（Triple GRPC）

  - 高可扩展性（SPI 多种序列化方式 多种协议）
  - 丰富的服务治理能力
  - 超大规模集群实例水平扩展

- 云原生有好

  - 容器调度平台（Kubernetes）

    将服务的组织与注册交给底层容器平台，如 Kubernetes，这是更云原生的方式。	

  - Service Mesh

    原有Mesh结构中通过Sidecar完成负载均衡、路由等操作，但是存在链路的性能损耗大，现有系统迁移繁琐等问题。Dubbo3引入Proxyless Mesh，直接和1控制面交互[istio]通信。集成ServiceMesh更为方便，效率更高。

[参考](https://cn.dubbo.apache.org/zh-cn/overview/what/xyz-difference/)

{% note info%}

Dubbo3支持 gRPC 作为通信协议。gRPC 基于 HTTP/2，支持二进制传输，性能非常高；gRPC 的通信协议是基于 protobuf 的二进制序列化，数据传输效率高。同时gRPC 支持多种语言，具备跨语言能力。

而SpringCloud中的OpenFeign基于 HTTP/1.1，通常使用 JSON 格式进行数据传输，性能取决于底层 HTTP 客户端。

[OpenFeign与Dubbo对比](https://developer.aliyun.com/article/1361633)

{% endnote%}

### 快速入门

代码结构及相关术语介绍

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250710204832288-2025-7-1020:48:51.png" style="zoom:80%;" />

- registry: 服务注册中心
- provider：服务提供者，consumer：服务调用者（消费者）
- commens-api：通用内容，其中定义provider和consumer的公共实体和接口。

{% note danger%}

JDK与Dubbo版本对应问题

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250710225318702-2025-7-1022:53:23.png" style="zoom:80%;" />

Spring与JDK版本的对应

<img src="https://gitee.com/cmyk359/img/raw/master/img/PixPin_2025-07-10_20-09-55-2025-7-1022:56:58.png" style="zoom:80%;" />

{% endnote%}

***

#### 项目初始化

创建父项目dubbo-demo，在其下创建三个Module: dubbo-commons-api、dubbo-provider、dubbo-consumer，并让provider和consumer引用commons模块。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250710205359612-2025-7-1020:54:00.png" style="zoom:80%;" />

{% note info %}

在IDEA的编译设置中开启模块并行编译，就能在provider和consumer中直接引用commons模块，否则需要将commons模块进行 `mvn  install`后才能被使用

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250710205943322-2025-7-1020:59:44.png" style="zoom:80%;" />

{% endnote %}

在父项目中引入相关依赖

```xml
<dependencies>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.22</version>
    </dependency>
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>1.7.32</version>
    </dependency>
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.2.10</version>
    </dependency>

    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo</artifactId>
        <version>3.2.0</version>
    </dependency>
</dependencies>
```



#### commons-api模块开发

1. 创建实体

   根据业务需要定义实体类

   ```java
   @Data
   @NoArgsConstructor
   @AllArgsConstructor
   public class User implements Serializable {
       private String userName;
       private String password;
   }
   ```

2. 定义业务接口

   定义RPC通信中的服务接口

   ```java
   public interface UserService {
       public boolean login(String userName, String password);
   }
   ```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250710214833729-2025-7-1021:48:59.png" style="zoom:80%;" />

#### provider模块开发

1. 导入commons-api模块

   ```xml
   <dependency>
       <groupId>org.example</groupId>
       <artifactId>dubbo-01-common-api</artifactId>
       <version>1.0-SNAPSHOT</version>
   </dependency>
   ```

2. 实现业务接口

   ```java
   import org.common.service.UserService;
   
   
   public class UserServiceImpl implements UserService {
       @Override
       public boolean login(String userName, String password) {
           System.out.println("userName:"+userName+" password:"+password);
           return false;
       }
   }
   ```

3. 使用Spring XML配置并创建RPC服务

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <beans xmlns="http://www.springframework.org/schema/beans"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
          xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd">
       
       <!--  1、定义服务名称，必须唯一  -->
       <dubbo:application name="service-provider"/>
   
       <!-- 2、定义RPC通信协议及端口  Dubbo默认端口为20880 -->
       <dubbo:protocol name="dubbo" port="20880"/>
   
       <!--  3、定义服务接口实现  -->
       <bean id="userService" class="org.provider.service.UserServiceImpl"/>
   
       <!--  4、发布服务 interface定义服务接口  ref指明接口的实现 -->
       <dubbo:service interface="org.common.service.UserService" ref="userService"/>
   </beans>
   ```

4. 启动服务

   ```java
   public class Main {
       public static void main(String[] args) throws InterruptedException {
           ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("applicationContext-provider.xml");
           context.start();
   
           //阻塞，等待服务调用
           new CountDownLatch(1).await();
       }
   }
   ```

5. 成功启动

   ```bash
   Dubbo Application[1.1](service-provider) is ready., dubbo version: 3.2.0, current host: 192.168.72.1
   ```

6. 在控制台日志中可以看到`UserService`这个接口的访问地址url，后面在consumer中通过RPC调用接口服务时，访问的就是这个url。后面引入注册中心后就不用记了。

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250710220808270-2025-7-1022:08:12.png" style="zoom:80%;" />

#### consummer模块开发

1. 导入commons-api模块

   ```xml
   <dependency>
       <groupId>org.example</groupId>
       <artifactId>dubbo-01-common-api</artifactId>
       <version>1.0-SNAPSHOT</version>
   </dependency>
   ```

2. XML配置引入RPC服务

   ```xml
   <!-- 定义服务名称   -->
   <dubbo:application name="service-consumer">
       <!--   关闭qos运维监控     -->
       <dubbo:parameter key="qos.enable" value="false"/>
   </dubbo:application>
   
   <!--  定义服务接口的访问地址，id为consumer中获取RPC远端服务的ID  -->
   <dubbo:reference interface="org.common.service.UserService" id="userService" url="dubbo://192.168.72.1:20880/org.common.service.UserService"/>
   ```

   {% note warning%}

   后面连接到注册中心后，就不用指定url了，由注册中心完成。

   {% endnote%}

3. 运行consumer，获取provider的服务接口，调用其中的方法

   ```java
   public class Main {
       public static void main(String[] args) {
           ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("applicationContext-consumer.xml");
           //获取服务接口
           UserService userService = (UserService) context.getBean("userService");
           //调用接口方法
           boolean result = userService.login("Tom", "123456");
           System.out.println(result);
       }
   }
   ```

{% note warning%}

关于Qos问题：

若在已启动provider的情况下再启动consumer，会抛出Qos服务端口22222被占用的错误，但不影响服务运行。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250710222146140-2025-7-1022:21:50.png" style="zoom:80%;" />

问题产生的原因：

Qos=Quality of Service，qos是Dubbo的在线运维命令，可以对服务进行动态的配置、控制及查询。

Dubboo2.5.8新版本重构了telnet模块，提供了新的telnet命令支持，新版本的telnet端口与dubbo协议的端口是不同的端口，默认为22222，正是因为这个问题：如果在一台服务器里面，启动provider时22222端口已使用，而consumer启动时就会报错了。

解决方法：

```xml
在xml文件中---->
<dubbo:parameter key="qos.enable"value="true"/> <！--是否开启在线运维命令-->
<dubbo:parameter key="qos.accept.foreign.ip"value="false"/> <！-不允许其他机器的访问
<dubbo:parameter key="qos.port"value="33333"/> <！--修改port-->
    
在springboot的properties配置文件中--->
dubbo.application.qos.enable=true
dubbo.application.qos.port=333333
dubbo.application.qos.accept.foreign. ip=false
```



{% endnote%}



#### 细节补充

在provider中定义了通信协议为dubbo，默认端口为20880

```xml
<dubbo:protocol name="dubbo" port="20880"/>
```

但是随着应用数量增加，如果显示指定协议端口，会容易造成端口冲突。所以建议按照如下写法配置端口，将协议端口设置为-1，默认指向20880端口，当该端口不可用时会继续尝试下一个端口20881是否可用，如果可用，就使用该端口，这样就避免了端口占用的问题。

```xml
<dubbo:protocol name="dubbo" port="-1"/>
```

***

思考：

1、为什么Provider提供了UserService的实现，而在另一个JVM中的Consumer中可以调用？Consumer中调用的到底是什么？

UserServiceImpl这个类只在Provider所在的JVM中被加载，按理说在Consumer所指的JVM中是无法识别并使用的。实际上，Consumer没有直接调用远端的UserServiceImpl，实际上调用的是远端UserServiceImpl的**代理对象 Proxy**

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250710224747111-2025-7-1022:47:54.png" style="zoom:80%;" />

2、这个代理的核心工作是什么

被consumer实际调用。通过代理，对consumer屏蔽了网络通信的过程（通信方式 协议 序列化），以及数据传递过程。

### Springboot整合Dubbo

#### 基于注解的方式

整合思路：深度封装，将公用的配置放到application.yml中，把个性化的配置通过注解来设置

1. 导入commons模块和Dubbo的starter

   ```xml
   <dependency>
       <groupId>org.apache.dubbo</groupId>
       <artifactId>dubbo-spring-boot-starter</artifactId>
       <version>3.2.0</version>
   </dependency>
   
   <dependency>
       <groupId>org.example</groupId>
       <artifactId>dubbo-01-common-api</artifactId>
       <version>1.0-SNAPSHOT</version>
   </dependency>
   ```

2. provider的处理

   ![image-20250711095517388](https://gitee.com/cmyk359/img/raw/master/img/image-20250711095517388-2025-7-1109:56:02.png)

   关于服务名称的设置，可以直接在dubbo中设置，也可以通过Spring设置。默认从dubbo中读取，没有的话采用Spring application的名称。第二种方法更常用。

   **注意：在启动类上加上@EnableDubbo注解**

3. consumer的处理

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250711095738095-2025-7-1109:57:40.png" style="zoom:80%;" />

   在启动类上也加上@EnableDubbo注解consumer的处理

***

**@EnableDubbo**的作用：

- **用于扫描@DubboService并把对应的对象实例化，发布成RPC服务。**
- 扫描路径：应用这个注解的类所在的包及其子包

如果@DubboService注解修饰的类没有在默认的扫描路径下，还希望能够被扫描到，该如何处理？

- 在启动类上添加包扫描注解，指定包路径

  - @DubboComponentScan(basePackages={"xxx.xx"})

  - 或者直接在@EnableDubbo中指定，它其中包含了@DubboComponentScan

    @EnableDubbo(scanBasePackages ="xxx.xx" )

- 在配置文件中指定要扫描的包

  ```yml
  dubbo:
    scan:
      base-packages: xxx.xx.xxx
  ```

这两个注解的作用类似于Spring中的 @SpringBootApplication和@Componetscan的作用。

***

**@DubboService**的作用：

- SpringBoot会创建该类型的对象，等同于@Component（@Service） @Bean
- 发布成RPC服务

该注解完成了XML中的如下配置：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250711115343071-2025-7-1111:53:47.png" style="zoom:80%;" />

为了后序开发过程的兼容性，实现类不仅仅要加上@DubboService注解，还要加上原来的@Service。如果之后不使用Dubbo的RPC服务，这个注解就会失效，若还希望由Spring来管理，必须加上@Service。

***

**@DubboReference**的作用：

在Consumer端，通过@DubboReference**注入远端服务的代理对象**

该注解完成了XML中的如下配置，其中的interface和id可以通过反射获取

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250711120346818-2025-7-1112:03:48.png" style="zoom:80%;" />

@DubboReference类似于原始Spring开发中的@Autowired或@Resource，只不过前者注入的是特定的RPC代理。

#### 结合XML的方式

为什么还要使用XML文件进行配置？比如说对一个接口中的某个方法配置超时时间，重试次数等**更精细**的配置，用注解写起来比较臃肿。

一些关于服务的公共配置，如服务名称、注册中心地址、协议等，还在yml文件中配置，只在XML文件中配置相关服务接口实现和服务发布的内容。

```xml
<!-- 服务接口实现  -->
<bean id="userService" class="org.cmyk.dubbo04bootprovider.service.UserServiceImpl"/>

<!--  发布服务 interface定义服务接口  ref指明接口的实现 -->
<dubbo:service interface="org.common.service.UserService" ref="userService" version="1.0">
    <!--  配置方法相关内容      -->
    <dubbo:method name="login" timeout="5000" retries="3"/>
</dubbo:service>
```

对应的实现类UserServiceImpl上就不用加@DubboService注解了，不使用注解来发布。为了让XML配置生效，需要在启动类上添加@ImportReource注解引入XML文件

```java
@ImportResource(locations = "classpath:applicationContext-provider.xml")
```

#### Java原生API的方式

自己编写一个配置类，为XML文件中的标签声明一个Bean对象，在其中设置相关属性。XML文件中的每个标签对应一个Config，如\<dubbo:application/>对应一个ApplicationConfig，\<dubbo:registry/>对应一个RegistryConfig。

```java
@Configuration
public class MyDubboConfig {

    @Bean
    public ApplicationConfig applicationConfig() {
        ApplicationConfig applicationConfig = new ApplicationConfig();
        applicationConfig.setName("boot-service-provider");
        return applicationConfig;
    }
    
    @Bean
    public RegistryConfig registryConfig() {
        RegistryConfig registryConfig = new RegistryConfig();
        registryConfig.setAddress("zookeeper://localhost:2181");
        return registryConfig;
    }
    
	@Bean
    public ProtocolConfig protocolConfig(){
        ProtocolConfig protocolConfig = new ProtocolConfig();
        protocolConfig.setName("Dubbo");
        protocolConfig.setPort(-1);
        return protocolConfig;
    }
    //.....
}
```



### 高级功能

#### 启动检查

在消费方启动之前，如果提供方还没有启动，消费方会看到这样的报错信息：说明还暂时没有对应服务提供者，导致消费方无法启动成功

```bash
java.lang.IllegalStateException: Failed to check the status of the service xxxx. No provider available for the service xxxxx
```

- 方案 1：将提供方应用正常启动起来即可。

- 方案 2：可以考虑在消费方的 Dubbo XML 配置文件中，为对应服务添加check="false" 的属性，或者在@DubboReference注解中添加check属性，都能达到启动不检查服务的目的。

  ```bash
  <dubbo:reference interface="org.common.service.UserService" id="userService" check="false"/>
  
  @DubboReference(check = false)
  ```

- 方案 3：也可以考虑在消费方的 Dubbo XML 配置文件中，为整个消费方添加check="false" 的属性，来达到启动不检查服务的目的，即

  ```bash
  <!-- 为整个消费方添加启动不检查提供方服务是否正常 -->
  <dubbo:consumer check="false"></dubbo:consumer>
  或
  dubbo:
    consumer:
      check: false
  ```

三种方法分析：

- 方案 1，耦合性太强，因为提供方没有发布服务而导致消费方无法启动，有点说不过去。
- 方案 2，需要针对指定的服务级别设置“启动不检查”，但一个消费方工程，会有几十上百甚至
  上千个提供方服务配置，一个个设置起来特别麻烦，而且一般我们也很少会逐个设置。
- 方案 3，是我们比较常用的一种设置方式，保证不论提供方的服务处于何种状态，都不能影响消费方的启动，而且只需要一条配置，没有方案 2 需要给很多个提供方服务挨个配置的困扰。

#### 超时重试

Dubbo 中超时配置是保障分布式系统稳定性的核心机制。其中超时时间默认值为1000ms，超时后会默认重试2次（不包括第一次的调用）。

通过`timeout`参数，在服务**提供方**和服务**调用方**中的<u>方法级</u>、<u>接口级</u>和<u>全局</u>配置超时时间。

通过`reties`参数，在服务**调用方**的<u>方法级</u>、<u>接口级</u>和<u>全局</u>配置重试次数

配置覆盖规则如下：

- 细粒度优先（方法级 > 接口级 > 全局>默认）

- 消费者优先（同一级别下，消费方 > 提供方）

- 配置中心可实时覆盖所有本地配置




***

服务提供方中配置超时：

```bash
#全局配置
<dubbo:provider timeout="5000"/>

dubbo:
  provider:
    timeout: 5000

#接口级配置
<dubbo:service interface="org.common.service.UserService" ref="userService" timeout="5000"/>

@DubboService(timeout = 5000)

#方法级配置
<dubbo:service interface="org.common.service.UserService" ref="userService" timeout="5000">
	<dubbo:method name="login" timeout="5000"/>
</dubbo:service>

@DubboService(methods = {@Method(name = "login",timeout = 2000)})
```




服务调用方中配置超时：

```bash
#全局
<dubbo:consumer timeout="5000" retries="5"/>

dubbo:
  consumer:
    retries: 4
    timeout: 5000

#接口级
<dubbo:reference interface="org.common.service.UserService" id="userService" timeout="5000" retries="5"/>

@DubboReference(interfaceClass = UserService.class,timeout = 3000, retries=5)

#方法级
<dubbo:reference interface="com.service.OrderService" retries="1">
    <dubbo:method name="createOrder" retries="3"/>
</dubbo:reference>

@Reference(
    retries = 0,  // 接口级
    methods = {@Method(name = "login",timeout = 5000,retries = 5)} // 方法级
)
```



在集群模式下，Dubbo 通过 集群容错策略 控制重试行为，通过`cluster`属性指定重试行为。默认是 failover，即失败后自动切换提供者重试。常用的容错策略如下：

<img src="D:%5CDesktop%5C5f3f4b1b-dd06-4470-9738-c96a11e17af0.png" style="zoom:80%;" />

重试要遵循三大黄金原则：

1. **写操作禁用重试**（保证幂等性）
2. **读操作合理重试**（结合超时时间）
3. **动态策略调整**（根据监控实时优化）

重试带来的风险及防护方法：

- 幂等性风险

  ```java
  // 危险操作：非幂等方法重试导致重复扣款
  @Reference(retries = 3)
  AccountService.withdraw(amount); 
  ```

  解决：写操作强制设置 `retries = 0`，或者在服务端实现幂等校验（如唯一流水号）

- 级联雪崩

  触发条件：下游服务C响应变慢或故障，上游服务A配置了高重试。最终B线程池被阻塞 ，导致 A调用B也开始超时。

  解决方案：

  - 合理设置重试次数和超时时间，使最大总耗时 ≤ 上级服务超时时间 * 0.7

  - 熔断器模式，设置熔断策略：如当错误率>=50%，熔断5s，半开状态放行少量请求探测

- 重试风暴

  触发条件：某服务出现短暂故障（如GC暂停），服务恢复瞬间遭遇海量重试请求

  解决：

  - 采用随机退避算法，避免大量请求同时到达
  - 服务端采用令牌桶算法控制重试速率

```yml
dubbo:
  consumer:
    # 核心防护三件套
    retries: 2
    timeout: 1000
    circuit-breaker: sentinel  
    
    # 重试策略优化
    retry-backoff-multiplier: 1.5  # 退避系数
    max-retry-delay: 3000          # 最大退避时间
    
    # 资源隔离
    threadpool: fixed
    threads: 200
```



#### 多版本

当一个接口实现，出现不兼容升级时，可以用**版本号**过渡，版本号不同的服务相互间不引用。通过`version`属性设置接口的版本。

使用多版本可以完成版本迁移：

1. 在低压力时间段，先升级一半提供者为新版本

2. 再将所有消费者升级为新版本

3. 然后将剩下的一半提供者升级为新版本



```bash
#服务提供方
<dubbo:service interface="org.common.service.UserService" ref="userService" version="2.0">

@DubboService(version = "2.0")

#服务调用方
<dubbo:reference interface="com.service.OrderService" version="2.0">

@DubboReference(version = "2.0")
```



#### 本地存根

远程服务后，客户端通常只剩下接口，而实现全在服务器端，但提供方有些时候想在客户端也执行部分逻辑，比如：做ThreadLocal缓存，提前验证参数，调用失败后伪造容错数据等等，此时就需要在API中带上Stub，客户端生成Proxy实例，会把Proxy通过构造函数传给Stub，然后把Stub暴露给用户，Stub可以决定要不要去调 Proxy。

本质：在客户端生成的代理类中插入自定义逻辑

使用场景：

- **服务降级**：当远程服务调用失败时，返回默认值或缓存数据。
- **数据预热**：在系统启动时，通过本地存根加载缓存数据。
- **参数校验**：在发起远程调用前，先在本地进行参数校验，避免无效的远程调用。
- **日志记录**：在调用前后记录日志，用于调试或监控。

本地存根类的实现要求：

- 本地存根类必须实现服务接口
- 必须有一个带有远程服务代理对象作为参数的构造函数。
- 在实现方法中，可以通过调用远程服务代理对象执行真正的远程调用，并在需要时添加本地逻辑。

示例：

```java
public class UserServiceStub implements UserService {
    private final UserService userService;

    // 必须包含此构造函数
    public UserServiceStub(UserService userService) {
        this.userService = userService;
    }

    @Override
    public boolean login(String userName, String password) {
        try {
            //1.本地预处理，参数校验等
            if(StringUtils.isEmpty(userName) || StringUtils.isEmpty(password))
                throw new IllegalArgumentException("用户名，密码格式错误");
            //2. 尝试本地缓存等操作...

            //3. 正常调用远程服务
            boolean loginStatus = userService.login(userName, password);
            //4.后处理，执行添加本地缓存等操作
            return loginStatus;
        }catch (Exception e) {
            // 远程调用失败时，执行本地容错逻辑
            System.out.println("xxxxx");
            //降级处理
            return false;
        }
    }
}
```

本地存根的执行流程：

1. 客户端发起远程调用。
2. 本地存根类拦截调用，先执行自定义的前置逻辑（如参数校验）。
3. 尝试调用远程服务。
4. 如果远程调用失败（抛出异常），则执行本地存根中的容错逻辑。
5. 将结果返回给客户端。



本地存根的配置

```bash
#xml格式
<dubbo:reference interface="org.common.service.UserService" id="userService" stub="com.example.UserServiceStub">

#注解格式
@DubboReference(stub = "com.example.UserServiceStub")
```

注意点：

- 本地存根一般放在commons模块中

- 本地存根类在客户端执行，应避免复杂的业务逻辑，以免影响客户端性能。
- 本地存根适用于需要灵活控制调用过程的场景，如果只是简单的返回默认值，可以使用Dubbo的Mock功能（本地伪装）

#### 本地伪装

Dubbo 的本地伪装 是一种服务降级容错机制，当远程服务调用失败时，自动触发本地预定义的降级逻辑返回安全结果。

Mock是一种轻量级的服务降级，常需要在出现 RpcException (比如网络失败，超时等)时进行容错，**它的约定就是只有出现 RpcException 时才执行。**

使用场景包括：

-  某服务或接口负荷超出最大承载能力范围，需要进行降级应急处理，避免系统崩溃 
-  调用的某非关键服务或接口暂时不可用时，返回模拟数据或空，使业务还能继续可用
-  降级非核心业务的服务或接口，腾出系统资源，尽量保证核心业务的正常运行 
-  某上游基础服务超时或不可用时，执行能快速响应的降级预案，避免服务整体雪崩



Mock类实现规范

- 类名以Moc结尾，推荐：[接口名]Mock
- 必须实现原始服务接口的所有方法
- 为了保证兼容性，写两个构造函数：一个无参构造，一个带有远程服务代理对象作为参数的构造函数

```java
public class UserServiceMock implements UserService {

    public UserServiceMock(){}
    public UserServiceMock(UserService userService) {
        // 通常不需要真实服务实例
    }
    
    @Override
    public User getUser(Long id) {
        // 返回降级数据
        return User.DEFAULT_USER; 
    }
    
    @Override
    public List<User> listUsers() {
        // 返回空集合避免NPE
        return Collections.emptyList(); 
    }
}

```



配置Mock

- XML格式

  ```xml
  <!-- 方法级Mock -->
  <dubbo:reference interface="com.example.UserService">
      <dubbo:method name="getUser" mock="com.example.UserServiceMock"/>
  </dubbo:reference>
  
  <!-- 接口级Mock（所有方法生效） -->
  <dubbo:reference interface="com.example.OrderService" 
                  mock="true" /> <!-- 默认查找OrderServiceMock类 -->
  
  ```

- 注解格式

  ```java
  @DubboReference(mock = "com.example.PaymentServiceMock")
  private PaymentService paymentService;
  
  // 强制返回固定值
  @DubboReference(mock = "return null") 
  private CartService cartService;
  
  // 抛出业务异常
  @DubboReference(mock = "throw com.example.ServiceDegradeException") 
  private InventoryService inventoryService;
  ```

注：

- Mock实现类仅消费端可见，一般放在consumer端

- 过度复杂的 Mock 会引发二次故障，保持实现简单到极致，100% 线程安全



| **维度**         | 本地伪装 (Mock)          | 本地存根 (Stub)             |
| ---------------- | ------------------------ | --------------------------- |
| **触发条件**     | **仅远程调用失败时触发** | 每次调用均执行              |
| **执行位置**     | 客户端本地               | 客户端本地                  |
| **主要目的**     | 服务不可用时的降级处理   | 增强调用流程（缓存/校验等） |
| **依赖远程服务** | 不依赖（完全本地执行）   | 可能依赖远程服务结果        |
| **典型场景**     | 熔断降级、维护模式       | 参数校验、本地缓存          |

### Dubbo-admin安装

Admin 控制台提供了 Dubbo 集群的可视化视图。

采用zookeeper作为服务注册中心，使用Docker-Compose安装zookeeper和dubb-admin

1. 在`/usr/local`目录下创建`zookeeper`目录，并在其下创建data、conf、logs目录

2. dubbo-admin镜像版本为0.6.0，从[dubbo-admin](https://github.com/apache/dubbo-admin/tree/develop/docker)仓库下载 0.6.0版本的properties文件

3. 创建网络，让两个容器处于同一网络下

   ```bash
   docker network create --driver=bridge dubbo-net
   ```

4. 修改`application.properties`，设置zookeeper的ip。此处由于同在一个 docker 网络下，所以直接改为容器名。

   ```properties
   # centers in dubbo2.7, if you want to add parameters, please add them to the url
   admin.registry.address=zookeeper://zookeeper:2181
   admin.config-center=zookeeper://zookeeper:2181
   admin.metadata-report.address=zookeeper://zookeeper:2181
   ```

5. 创建`docker-compose.yml`文件，内容如下：

   ```yml
   version: '2.36.0'  
   
   networks:  
     dubbo-net:  
       driver: bridge  
       external: true
       
   services:
     zookeeper:  
       image: "zookeeper:latest"  
       container_name: "zookeeper"  
       ports:  
         - "2181:2181"  
       environment:  
         TZ: "Asia/Shanghai"  
       volumes:  
         - /etc/localtime:/etc/localtime:ro  
         - /usr/local/zookeeper/data:/data
         - /usr/local/zookeeper/logs:/datalog 
         - /usr/local/zookeeper/conf:/conf
       networks:  
         - dubbo-net 
     
     dubbo-admin:  
       image: "apache/dubbo-admin:latest"  
       container_name: "dubbo-admin"  
       environment:  
         TZ: "Asia/Shanghai"  
       volumes:  
         - /etc/localtime:/etc/localtime:ro  
         - /usr/local/dubbo-admin/properties:/config  
       ports:  
         - "38080:38080"  
       depends_on:  
         - zookeeper  
       networks:  
         - dubbo-net
   ```

6. 执行`docker-compose up -d`运行容器

7. 访问`http://192.168.181.100:38080/`

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250710110657346-2025-7-1011:07:20.png" style="zoom:80%;" />

## 三、高可用

### 1、zookeeper宕机

若zookeeper注册中心宕机，还可以消费 dubbo 暴露的服务。

### 2、负载均衡

[官方文档](https://cn.dubbo.apache.org/zh-cn/overview/what/core-features/load-balance/)

[Java中配置负载均衡策略](https://cn.dubbo.apache.org/zh-cn/overview/mannual/java-sdk/tasks/service-discovery/loadbalance/)

![负载均衡策略](https://gitee.com/cmyk359/img/raw/master/img/PixPin_2025-07-12_23-31-16-2025-7-1223:52:55.png)

### 3、服务降级

什么是服务降级？

当服务器压力剧增的情况下，根据实际业务情况及流量，对一些服务和页面有策略的不处理或换种简单的方式处理，从而释放服务器资源以保证核心交易正常运作或高效运作。

## 四、Dubbo原理





### 核心组件

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250709110642348-2025-7-911:06:42.png" alt="Dubbo架构" style="zoom:80%;" />

其中包括以下模块：

- Registry：注册中心

  生产者在此注册并发布内容，消费者在此订阅并接收发布的内容。

- Provider：服务提供者

  服务端，生产内容，生产前需要依赖容器（先启动容器）。

- Consumer：服务消费者

  客户端，从注册中心获取到方法，可以调用生产者中的方法。

- Container：Dubbo框架容器

  生产者在启动执行的时候，必须依赖容器才能正常启动（默认依赖的是spring容器），

- Monitor：监控中心

  统计服务的调用次数与时间等。

运行流程如下：

1. 初始化：
   - Dubbo框架启动
   - 服务提供者启动时，会将所提供的服务注册到注册中心
   - 服务消费者启动时，会从注册中心订阅所需要的服务
2. 当某个服务提供者发生了变更，注册中心会基于长连接的方式将变更推送给服务消费者
3. 服务消费者可以根据负载均衡算法从服务列表中选择所需的服务
4. 在服务调用过程中，异步地将调用信息发送到监控中心，实时监控服务运行状态



### Dubbo架构设计

<img src="https://gitee.com/cmyk359/img/raw/master/img/dubbo-framework-2025-7-1410:25:20.jpg" alt="dubbo-framework" style="zoom:80%;" />



### 可扩展机制SPI



### 标签解析

Dubbo 的标签解析过程基于 **Spring 的自定义 XML 扩展机制**（`NamespaceHandler` + `BeanDefinitionParser`），将 XML 配置转换为 Spring 容器管理的 Bean。

流程如下：

1. Spring 扩展机制入口

   Dubbo 在 `META-INF/spring.handlers` 中声明命名空间处理器：

   ```java
   http\://dubbo.apache.org/schema/dubbo=org.apache.dubbo.config.spring.schema.DubboNamespaceHandler
   http\://code.alibabatech.com/schema/dubbo=org.apache.dubbo.config.spring.schema.DubboNamespaceHandler
   ```

   当 Spring 解析到 `<dubbo:xxx>` 标签，会委托给 `DubboNamespaceHandler` 处理

   

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250714103904785-2025-7-1410:39:05.png" style="zoom:80%;" />

2. 注册标签解析器

   在`DubboNamespaceHandler`中，会为每个Dubbo标签注册对应的`BeanDefinitionParser`。每个标签对应一个配置类，在这里定义好了，例如：

   - `application` -> `ApplicationConfig`

   - `registry` -> `RegistryConfig`

   - `protocol` -> `ProtocolConfig`

   - `service` -> `ServiceBean`

   - `reference` -> `ReferenceBean`

   ```java
   public void init() {
       registerBeanDefinitionParser("application", new DubboBeanDefinitionParser(ApplicationConfig.class));
       registerBeanDefinitionParser("module", new DubboBeanDefinitionParser(ModuleConfig.class));
       registerBeanDefinitionParser("registry", new DubboBeanDefinitionParser(RegistryConfig.class));
       registerBeanDefinitionParser("config-center", new DubboBeanDefinitionParser(ConfigCenterBean.class));
       registerBeanDefinitionParser("metadata-report", new DubboBeanDefinitionParser(MetadataReportConfig.class));
       registerBeanDefinitionParser("monitor", new DubboBeanDefinitionParser(MonitorConfig.class));
       registerBeanDefinitionParser("metrics", new DubboBeanDefinitionParser(MetricsConfig.class));
       registerBeanDefinitionParser("tracing", new DubboBeanDefinitionParser(TracingConfig.class));
       registerBeanDefinitionParser("ssl", new DubboBeanDefinitionParser(SslConfig.class));
       registerBeanDefinitionParser("provider", new DubboBeanDefinitionParser(ProviderConfig.class));
       registerBeanDefinitionParser("consumer", new DubboBeanDefinitionParser(ConsumerConfig.class));
       registerBeanDefinitionParser("protocol", new DubboBeanDefinitionParser(ProtocolConfig.class));
       registerBeanDefinitionParser("service", new DubboBeanDefinitionParser(ServiceBean.class));
       registerBeanDefinitionParser("reference", new DubboBeanDefinitionParser(ReferenceBean.class));
       registerBeanDefinitionParser("annotation", new AnnotationBeanDefinitionParser());
   }
   ```

3. 解析标签

   当 Spring 遇到标签时，会调用相应解析器的 `DubboBeanDefinitionParser.parse()` 方法，根据标签对应的配置类创建 Spring 的 `RootBeanDefinition`，用于存储 Bean 的定义信息。

   ```java
   public DubboBeanDefinitionParser(Class<?> beanClass) {
       this.beanClass = beanClass;
   }
    private static RootBeanDefinition parse(Element element, ParserContext parserContext, Class<?> beanClass, boolean registered) {
           RootBeanDefinition beanDefinition = new RootBeanDefinition();
           beanDefinition.setBeanClass(beanClass);
           beanDefinition.setLazyInit(false);
     //....
    }
   ```

   将 XML 标签属性映射到 Bean 的属性：

### 服务暴露流程

### 服务引用流程

### 服务调用流程



在Dubbo RPC直连应用中，Consumer直接访问Provider，而无需注册中心的接入，此时Dubbo完成的仅仅是RPC最基本的功能。从这个角度Dubbo RPC直连等价于SpringCloud体系中的OpenFeign，但OpenFeign效率较低。

RPC直连设计的核心概念

- Provider 服务的提供者
- Consumer 服务的访问者
- 网络通信

其中在网络通信中涉及三个重要内容：协议、服务器（通信方式）、序列化

- 协议：定义通信双方的数据格式、传输顺序、错误处理等规则。包含：

  - 应用层协议：http1.x、http2.x
  - 传输层协议：是一种私有协议，如dubbo、triple

  Dubbo既支持应用层的公有协议，也支持私有协议，可以在配置文件中指定

  ```xml
  <dubbo:protocol name="dubbo" port="-1"/>
  或
  dubbo:
    protocol:
      name: dubbo
      port: -1
  ```

- 通信方式

  - 若采用了传输层协议，则通信方式包括：BIO、NIO、Netty、Mina等
  - 若采用了应用层协议，则通信方式包括：Tomcat、Resin、Jetty

  Dubbo内置默认通信方式是Netty4，可以在配置文件中通过transporter属性指定其他的方式

  ```xml
  <dubbo:protocol name="dubbo" port="-1" transporter="Mina"/>
  或
  dubbo:
    protocol:
      name: dubbo
      port: -1
      transporter: Mina
  ```

- 序列化：确定了数据、通信协议和通信方式，就可以进行网络数据传输了，但是若对数据不进行序列化就进行传输，则数据文件体积很大，网络传输效率低。序列化扮演者数据桥梁的核心角色，它实现了内存对象与网络传输二进制流之间的双向转换，好的序列化方式，所传输数据的体积小，速度快。

  在Dubbo 3.2版本前默认的序列化方式是Hassian，之后版本的默认方式是FastJson2，可以在配置文件的serialization属性设置序列化方式

  ```xml
  <dubbo:protocol name="dubbo" port="-1" serialization="hassian"/>
  或
  dubbo:
    protocol:
      name: dubbo
      port: -1
      serialization: hassian
  ```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250711224736865-2025-7-1122:47:38.png" style="zoom:80%;" />

### 序列化

序列化：是Dubbo进行RPC中，非常重要的一个组成部分，其核心作用就是把网络传输中的数据，按照特定的格式进行传输。减小数据的体积，从而提高传输效率。

![Dubbo序列化设计](https://gitee.com/cmyk359/img/raw/master/img/image-20250711224952329-2025-7-1122:49:53.png)

常见的Dubbo序列化方式：

1. Hessian

    Dubbo协议中默认的序列化实现方案

2. Java Serialization

    JDK的序列化方式

3. Dubbo序列化
   阿里尚未开发成熟的高效java序列化实现，阿里不建议在生产环境使用它。

4. Json序列化
   目前有两种实现，一种是采用的阿里的fastison库，另一种是采用dubbo中自己实现的简单json库。

5. Kryo 

   Java序列化方式，后续替换Hessian2，是一种非常成熟的序列化实现，已经在Twitter、Groupon、Yahoo以及多个著名开源项目（如Hive，Storm）中广泛的使用。

6. FST 

   Java序列化方式，后续替换Hessian2，是一种较新的序列化实现，目前还缺乏足够多的成熟使用案例。

7. 跨语言序列化方式
   ProtoBuf，Thrift，Avro，MsgPack（MessagePack是一种高效的二进制序列化格式。它允许您在多种语言（如JSON）之间交换数据。但它更快更小。短整型被编码成一个字节）



<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250711225541100-2025-7-1122:56:02.png" alt="Dubbo常见序列化方式效果对比" style="zoom:80%;" />

#### Kryo序列化

1. 引入依赖

   ```xml
   <dependency>
       <groupId>org.apache.dubbo</groupId>
       <artifactId>dubbo-serialization-kryo</artifactId>
       <version>2.7.3</version>
       <!--不引入dubbo-common模块，在Dubbo依赖中已经引入过了，会发生冲突-->
       <exclusions>
           <exclusion>
               <groupId>org.apache.dubbo</groupId>
               <artifactId>dubbo-common</artifactId>
           </exclusion>
       </exclusions>
   </dependency>
   ```

2. Provider端配置序列化方式

   ```bash
   <dubbo:protocol name="dubbo" port="-1" serialization="kryo"/>
   或者
   dubbo:
     protocol:
       name: dubbo
       port: -1
       serialization: kryo
   ```

3. Consumer端调用

   在调用的URL中添加参数 `serialization=kryo`。

   后续如果引入注册中心 url就可以不写。

   ```bash
   #xml格式
   <dubbo:reference interface="org.common.service.UserService" id="userService" url="dubbo://192.168.72.1:20880/org.common.service.UserService?serialization=kryo"/>
   
   #注解方式
   @DubboReference(url = "dubbo://192.168.72.1:20880/org.common.service.UserService?serialization=kryo")
   ```

#### FST序列化

与kryo的方式一模一样

1. 引入依赖

   ```xml
   <dependency>
       <groupId>org.apache.dubbo</groupId>
       <artifactId>dubbo-serialization-fst</artifactId>
       <version>2.7.23</version>
       <exclusions>
           <exclusion>
               <artifactId>dubbo-common</artifactId>
               <groupId>org.apache.dubbo</groupId>
           </exclusion>
       </exclusions>
   </dependency>
   ```

2. provider端配置序列化方式

   ```bash
   <dubbo:protocol name="dubbo" port="-1" serialization="fst"/>
   或者
   dubbo:
     protocol:
       name: dubbo
       port: -1
       serialization: fst
   ```

3. Consumer端调用

   在调用的URL中添加参数 `serialization=fst`。

   后续如果引入注册中心 url就可以不写。

   ```bash
   #xml格式
   <dubbo:reference interface="org.common.service.UserService" id="userService" url="dubbo://192.168.72.1:20880/org.common.service.UserService?serialization=fst"/>
   
   #注解方式
   @DubboReference(url = "dubbo://192.168.72.1:20880/org.common.service.UserService?serialization=fst")
   ```

#### FastJson2序列化

Fastjson2序列化仅Dubbo>3.1.0版本支持，在Dubbo>3.2.0中将替代Hessain作为默认序列化方式

若使用的Dubbo的版本在3.1.0~3.2.0之间，可以设置序列化方式为FastJson2，设置方式与前面完全一样

1. 引入依赖

   ```xml
           <dependency>
               <groupId>com.alibaba.fastjson2</groupId>
               <artifactId>fastjson2</artifactId>
               <version>2.0.23</version>
           </dependency>
   ```
   
2. provider端配置序列化方式

   ```bash
   <dubbo:protocol name="dubbo" port="-1" serialization="fastjson2"/>
   或者
   dubbo:
     protocol:
       name: dubbo
       port: -1
       serialization: fastjson2
   ```

3. Consumer端调用

   在调用的URL中添加参数 `serialization=fst`。

   后续如果引入注册中心 url就可以不写。

   ```bash
   #xml格式
   <dubbo:reference interface="org.common.service.UserService" id="userService" url="dubbo://192.168.72.1:20880/org.common.service.UserService?serialization=fst"/>
   
   #注解方式
   @DubboReference(url = "dubbo://192.168.72.1:20880/org.common.service.UserService?serialization=fst")
   ```



