---
title: RabbitMQ
categories:
  - 微服务
abbrlink: b543ced0
date: 2025-06-16 14:40:33
tags:
---

<meta name = "referrer", content = "no-referrer"/>

## 一、初识MQ

在微服务项目中，服务一旦拆分，必然涉及到服务之间的相互调用。

可以采用SpringCloud中的OpenFeign进行调用或者通过Dubbo做RPC调用。这种调用中，调用者发起请求后需要**等待**服务提供者执行业务返回结果后，才能继续执行后面的业务。也就是说调用者在调用过程中处于阻塞状态，因此称这种调用方式为**同步调用**，也可以叫**同步通讯**。但在很多场景下，可能需要采用**异步通讯**的方式。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250211094833670-2025-2-1110:40:16.png" style="zoom:80%;" />

- 同步通讯：就如同打视频电话，双方的交互都是实时的。因此同一时刻你只能跟一个人打视频电话。
- 异步通讯：就如同发微信聊天，双方的交互不是实时的，你不需要立刻给对方回应。因此你可以多线操作，同时跟多人聊天。

两种方式各有优劣，打电话可以立即得到响应，但是你却不能跟多个人同时通话。发微信可以同时与多个人收发微信，但是往往响应会有延迟。

如果我们的业务需要实时得到服务提供方的响应，则应该选择同步通讯（同步调用）。而如果我们追求更高的效率，并且不需要实时响应，则应该选择异步通讯（异步调用）。

### 1.1 同步调用

假设目前服务间的调用都是基于OpenFeign的同步调用，以**余额支付功能**为例来分析，整个服务的流程如下：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250211095334972-2025-2-1109:53:36.png" style="zoom:80%;" />

- 支付服务需要先调用用户服务完成余额扣减
- 然后支付服务自己要更新支付流水单的状态
- 然后支付服务调用交易服务，更新业务订单状态为已支付

三个步骤依次执行，其中就存在3个问题：

1. 拓展性差

   目前的业务相对简单，但是随着业务规模扩大，产品的功能也在不断完善。如果之后添加需求：

   - 用户支付成功后以短信或者其它方式通知用户，告知支付成功。

   - 增加积分或金币的概念，用户支付成功后，给用户以积分奖励或者返还金币
   - .....

   如果按照以上的服务调用方法，每次有新的需求，现有支付逻辑都要跟着变化，代码经常变动。最终支付业务会越来越臃肿：

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250211095944590-2025-2-1109:59:45.png" style="zoom:80%;" />

2. 性能下降

   由于采用了同步调用，调用者需要等待服务提供者执行完返回结果后，才能继续向下执行，也就是说每次远程调用，调用者都是阻塞等待状态。最终整个业务的响应时长就是每次远程调用的执行时长之和：

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250211100207999-2025-2-1110:02:09.png" style="zoom:80%;" />

3. **级联失败**

   由于是基于OpenFeign调用交易服务、通知服务。耦合性太高，一个服务失败会影响其他服务。当交易服务、通知服务出现故障时，整个事务都会回滚，交易失败。这就是同步调用的**级联失败**问题。

而要解决这些问题，我们就必须用**异步调用**的方式来代替**同步调用**。

### 1.2 异步调用

异步调用方式其实就是基于**消息通知**的方式，一般包含三个角色：

- 消息发送者：投递消息的人，就是原来的调用方
- 消息代理：管理、暂存、转发消息，可以把它理解成微信服务器
- 消息接收者：接收和处理消息的人，就是原来的服务提供方

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250211100551228-2025-2-1110:05:52.png" style="zoom:80%;" />

在异步调用中，发送者不再直接同步调用接收者的业务接口，而是发送一条消息投递给消息代理。然后接收者根据自己的需求从消息Broker那里订阅消息。每当发送方发送消息后，接受者都能获取消息并处理。

这样，发送消息的人和接收消息的人就完全解耦了。

还是以余额支付业务为例：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250211100738170-2025-2-1110:07:39.png" style="zoom:80%;" />

除了扣减余额、更新支付流水单状态以外，其它调用逻辑全部取消。而是改为发送一条消息到Broker。而相关的微服务都可以订阅消息通知，一旦消息到达Broker，则会分发给每一个订阅了的微服务，处理各自的业务。

假如后序增加了新的需求，比如要在支付成功后更新用户积分。支付代码完全不用变更，而仅仅是让积分服务也订阅消息即可：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250211100924951-2025-2-1110:09:26.png" style="zoom:80%;" />

不管后期增加了多少消息订阅者，作为支付服务来讲，执行问扣减余额、更新支付流水状态后，发送消息即可。业务耗时仅仅是这三部分业务耗时，仅仅100ms，大大提高了业务性能。

另外，不管是交易服务、通知服务，还是积分服务，他们的业务与支付关联度低。现在采用了异步调用，解除了耦合，他们即便执行过程中出现了故障，也不会影响到支付服务。

综上，异步调用的优势包括：

- 耦合度更低
- 性能更好
- 业务拓展性强
- 故障隔离，避免级联失败

当然，异步通信也并非完美无缺，它存在下列缺点：

- 完全依赖于Broker的可靠性、安全性和性能
- 架构复杂，后期维护和调试麻烦

### 1.3 技术选型

消息Broker，目前常见的实现方案就是消息队列（MessageQueue），简称为MQ.

目比较常见的MQ实现：

- ActiveMQ
- RabbitMQ
- RocketMQ
- Kafka

几种MQ的对比：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250211101237979-2025-2-1110:12:39.png" style="zoom:80%;" />

追求可用性：Kafka、 RocketMQ 、RabbitMQ

追求可靠性：RabbitMQ、RocketMQ

追求吞吐能力：RocketMQ、Kafka

追求消息低延迟：RabbitMQ、Kafka

目前国内消息队列使用最多的还是RabbitMQ，再加上其各方面都比较均衡，稳定性也好，因此选择RabbitMQ来学习。

## 二、RabbitMQ

RabbitMQ是基于Erlang语言开发的开源消息通信中间件，[官网地址](https://www.rabbitmq.com/)

RabbitMQ的架构如图：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250211101950426-2025-2-1110:19:51.png" style="zoom:80%;" />

其中包含几个概念：

- **`publisher`**：生产者，也就是发送消息的一方
- **`consumer`**：消费者，也就是消费消息的一方
- **`queue`**：队列，存储消息。生产者投递的消息会暂存在消息队列中，等待消费者处理
- **`exchange`**：交换机，负责消息路由。生产者发送的消息由交换机决定投递到哪个队列。
- **`virtual host`**：虚拟主机，起到数据隔离的作用。每个虚拟主机相互独立，有各自的exchange、queue

### 2.1 安装

创建`docker-compose.yml`，在yml文件所在目录，使用`docker compose up -d`上线RabbitMQ 容器。

```yaml
version: '3.8'

services:
  mq:
    image: rabbitmq:3.8-management
    container_name: mq
    hostname: mq
    environment:
      - RABBITMQ_DEFAULT_USER=admin
      - RABBITMQ_DEFAULT_PASS=123321
    ports:
      - "15672:15672"  # RabbitMQ 管理界面端口
      - "5672:5672"    # AMQP 协议端口
    volumes:
      - mq-plugins:/plugins
    networks:
      - hm-net
    restart: unless-stopped

volumes:
  mq-plugins:

networks:
  hm-net:
```

安装完成后，我们访问 `http://服务器ip:15672` 即可看到管理控制台。首次访问需要登录，默认的用户名和密码在配置文件中已经指定了。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016154419172-2025-10-1615:44:20.png" style="zoom:80%;" />

### 2.2 使用控制台测试收发消息

#### 交换机

打开Exchanges选项卡，可以看到已经存在很多交换机：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016154712721-2025-10-1615:47:13.png" style="zoom:80%;" />

点击任意交换机，利用控制台中的publish message 发送一条消息：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016154925405-2025-10-1615:49:45.png" style="zoom:80%;" />

这里是由控制台模拟了生产者发送的消息。由于没有消费者存在，最终消息丢失了，这样说明交换机没有存储消息的能力。

#### 队列

打开`Queues`选项卡，新建一个队列，命名为`hello.queue1`：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016155213456-2025-10-1615:52:45.png" style="zoom:80%;" />

再以相同的方式，创建一个队列，密码为`hello.queue2`，最终队列列表如下：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016155301978-2025-10-1615:53:45.png" style="zoom:80%;" />

此时，再次向`amq.fanout`交换机发送一条消息。会发现消息依然没有到达队列！！

怎么回事呢？

发送到交换机的消息，只会路由到与其绑定的队列，因此仅仅创建队列是不够的，我们还需要将其与交换机绑定。

#### 绑定关系

在`amq.fanout`交换机详情页的`Bindings`菜单中，填写要绑定的队列名称：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016155637591-2025-10-1615:56:45.png" style="zoom:80%;" />

相同的方式，将hello.queue2也绑定到改交换机。最终，绑定结果如下：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016155818359-2025-10-1615:58:45.png" style="zoom:80%;" />

#### 发送消息

回到exchange页面，找到刚刚绑定的`amq.fanout`，再次发送一条消息后，查看两个队列，可以看到已经有一条消息了。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016160039458-2025-10-1616:00:45.png" style="zoom:80%;" />

查看`hello.queueq`，点击get message，可以看到消息到达队列了：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016160252564-2025-10-1616:03:20.png" style="zoom:80%;" />

这个时候如果有消费者监听了MQ的`hello.queue1`或`hello.queue2`队列，自然就能接收到消息了。

### 2.3 数据隔离

点击`Admin`选项卡，会看到RabbitMQ控制台的用户管理界面，这里的用户都是RabbitMQ的管理或运维人员。目前只有安装RabbitMQ时添加的`admin`这个用户。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016160952842-2025-10-1616:10:10.png" style="zoom:80%;" />

用户表格中的字段，如下：

- `Name`：`admin`，也就是用户名
- `Tags`：`administrator`，说明`admin`用户是超级管理员，拥有所有权限
- `Can access virtual host`： 可以访问的`virtual host`，`/`是默认的`virtual host`

当只搭建一套MQ集群，供多个不同项目同时使用时，为了避免互相干扰， 可以利用`virtual host`的隔离特性，将不同项目隔离。一般会做两件事情：

- 给每个项目创建独立的运维账号，将管理权限分离。
- 给每个项目创建不同的`virtual host`，将每个项目的数据隔离。

***

为当前项目创建一个新的用户，命名为 catpaws

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016161526519-2025-10-1616:15:45.png" style="zoom:80%;" />

此时的用户没有任何 virtual host 的访问权限

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016161602998-2025-10-1616:16:26.png" style="zoom:80%;" />

***

切换到刚刚创建的catpaws用户，为当前项目创建一个单独的`virtual host`

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016161930902-2025-10-1616:19:31.png" style="zoom:80%;" />

由于我们是登录`catpaws`账户后创建的`virtual host`，因此回到`users`菜单，你会发现当前用户已经具备了对`/cat-project`这个`virtual host`的访问权限了：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016162241816-2025-10-1616:22:42.png" style="zoom:80%;" />

通过右上角的`virtual host`下拉菜单，切换`virtual host`为 `/cat-project`，然后再次查看queues选项卡，会发现之前的队列已经看不到了，这就是基于`virtual host `的隔离效果。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016162359797-2025-10-1616:24:00.png" style="zoom:80%;" />

## 三、SpringAMQP

真正开发业务功能的时候，肯定不会在控制台收发消息，而是应该基于编程的方式。

由于`RabbitMQ`采用了AMQP协议，因此它具备跨语言的特性。任何语言只要遵循AMQP协议收发消息，都可以与`RabbitMQ`交互，并且官方也提供了各种不同语言的客户端。

RabbitMQ官方提供的Java客户端编码相对复杂，一般生产环境下我们更多会结合Spring来使用。Spring基于RabbitMQ提供了这样一套消息收发的模板工具：SpringAMQP，还基于SpringBoot实现了自动装配，使用起来非常方便。

SpringAMQP的[官方地址](https://spring.io/projects/spring-amqp/)

SpringAMQP提供了三个功能：

- 自动声明队列、交换机及其绑定关系
- 基于注解的监听器模式，异步接收消息
- 封装了RabbitTemplate工具，用于发送消息

### 3.1 快速入门

![项目结构](https://gitee.com/cmyk359/img/raw/master/img/image-20251016165332818-2025-10-1616:53:34.png)

创建springboot项目，包括三部分：

- RabbitMQ-demo：父工程，管理项目依赖
- publisher：消息的发送者
- consumer：消息的消费者

在父工程中已经添加了SpringAMQP的相关依赖，子工程中就可以直接使用了。

```xml
<!--AMQP依赖，包含RabbitMQ-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>	
```

***

在入门案例中，为了测试方便，直接向队列发送消息，跳过交换机。

- publisher直接发送消息到队列
- 消费者监听并处理队列中的消息

> **注意**：这种模式一般测试使用，很少在生产中使用。

为了方便测试，先在控制台新建一个队列：simple.queue。接下来，就可以利用Java代码收发消息了。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016170206246-2025-10-1617:02:20.png" style="zoom:80%;" />

#### 消息发送

首先在`publisher`服务的`application.yml`中添加MQ相关配置：

```yaml
spring:
  rabbitmq:
    host: 192.168.181.100 # 你的虚拟机IP
    port: 5672 # 端口
    virtual-host: /cat-project # 虚拟主机
    username: catpaws # 用户名
    password: 123321 # 密码
```

在`publisher`服务中编写测试类`SpringAmqpTest`，利用`RabbitTemplate`实现消息发送：

```java
@SpringBootTest
@Slf4j
class SpringAmqpTest {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Test
    public void testSendMessage() {
        //1.队列名
        String queueName = "simple.queue";
        //2.消息
		String message = ""
        //3.发送
        rabbitTemplate.convertAndSend(queueName,itemDoc);
    }
}
```

打开控制台，可以看到消息已经发送到队列中：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250211124025590-2025-2-1112:40:44.png" style="zoom:80%;" />

#### 消息接收

首先在`consumer`服务的`application.yml`中添加MQ相关配置：

```yaml
spring:
  rabbitmq:
    host: 192.168.181.100 # 你的虚拟机IP
    port: 5672 # 端口
    virtual-host: /cat-project # 虚拟主机
    username: catpaws # 用户名
    password: 123321 # 密码
```

在`consumer`服务的`listener`包中新建一个类`SpringRabbitListener`，代码如下：

```java
@Component
public class SpringRabbitListener {
    // 监听已存在的队列
    @RabbitListener(queues = "simple.queue")
    public void listenSimpleQueueMessage(String msg) throws InterruptedException {
        System.out.println("spring 消费者接收到消息：【" + msg + "】");
    }
}
```

***

`@RabbitListener` 是 Spring AMQP 项目中用于声明消息驱动 POJO 的注解。它可以将一个方法标记为 RabbitMQ 的消息监听器。当有消息到达指定的队列时，该方法会被自动调用。

#### 测试

启动consumer服务，然后在publisher服务中运行测试代码，发送MQ消息。最终consumer收到消息：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016184957383-2025-10-1618:50:06.png" style="zoom:80%;" />

### 3.2 Work Queue

Work queues，任务模型。简单来说就是让**多个消费者**绑定到一个队列，共同消费队列中的消息。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250211124655817-2025-2-1112:46:56.png" style="zoom:80%;" />

当消息处理比较耗时的时候，可能生产消息的速度会远远大于消息的消费速度。长此以往，消息就会堆积越来越多，无法及时处理。此时就可以使用WorkQueues模型，**多个消费者共同处理消息处理，消息处理的速度就能大大提高**了。

Work Queue模型特点：

- 多个消费者绑定到一个队列

- 同一条消息只会被一个消费者处理

默认情况下，RabbitMQ的会将消息依次轮询投递给绑定在队列上的每一个消费者。简单地说，消息是平均分配给每个消费者，并没有考虑到消费者的处理能力，可能出现消息堆积。

可以通过在消费者配置文件中设置参数`preFetch`为1，确保同一时刻最多投递给消费者一条消息，处理完了才能获取下一个消息，从而实现“能者多劳”的效果。

```yaml
spring:
  rabbitmq:
    listener:
      simple:
        prefetch: 1 #每次只能获取一条消息，处理完成才能获取下一个消息
```

***

首先在控制台创建一个队列`work.queue`

在消费者服务中，创建两个消费者，监听来自`work.queue`的消息。为了区分两消费者的处理能力，分别让其休眠25ms和500ms。

```java
@RabbitListener(queues = "work.queue")
public void listenWorkQueue1(String message) throws InterruptedException {
    System.out.println("消费者1....接收到消息：" + message +", "+ LocalTime.now());
    Thread.sleep(25);
}
@RabbitListener(queues = "work.queue")
public void listenWorkQueue2(String message) throws InterruptedException {
    System.err.println("消费者2....接收到消息：" + message +", "+ LocalTime.now());
    Thread.sleep(500);
}
```

在消息提供者处，发送10条消息到`work.queue`

```java
@Test
public void testWorkQueue() {
    //1.队列名
    String queueName = "work.queue";
    //2.消息
    String message = "hello，message_";
    for (int i = 1; i <= 10 ; i++) {
        //3.发送
        rabbitTemplate.convertAndSend(queueName,message + i);
    }
}
```

暂不配置`preFetch`参数，RabbitMQ默认消息投递效果如下：10条消息平均分配给每个消费者，每条消息只会被一个消费者处理，不区分处理能力。

```bash
消费者1....接收到消息："hello，message_1", 19:21:12.570108500
消费者1....接收到消息："hello，message_3", 19:21:12.571105800
消费者1....接收到消息："hello，message_5", 19:21:12.571105800
消费者1....接收到消息："hello，message_7", 19:21:12.571105800
消费者1....接收到消息："hello，message_9", 19:21:12.572103200
消费者2....接收到消息："hello，message_2", 19:21:12.570108500
消费者2....接收到消息："hello，message_4", 19:21:12.571105800
消费者2....接收到消息："hello，message_6", 19:21:12.571105800
消费者2....接收到消息："hello，message_8", 19:21:12.572103200
消费者2....接收到消息："hello，message_10", 19:21:12.572103200
```

配置`preFetch`为1后，消费者根据自己的处理速度从队列中接收消息，消息分配结果如下：

```bash
消费者2....接收到消息："hello，message_1", 19:32:17.402016200
消费者2....接收到消息："hello，message_6", 19:32:18.106082900
消费者2....接收到消息："hello，message_10", 19:32:18.636266700
消费者1....接收到消息："hello，message_2", 19:32:17.402016200
消费者1....接收到消息："hello，message_3", 19:32:17.697104500
消费者1....接收到消息："hello，message_4", 19:32:17.751538
消费者1....接收到消息："hello，message_5", 19:32:18.106082900
消费者1....接收到消息："hello，message_7", 19:32:18.297221400
消费者1....接收到消息："hello，message_8", 19:32:18.536224100
消费者1....接收到消息："hello，message_9", 19:32:18.611123200
```



### 3.3 Exchange

RabbitMQ中的交换机（Exchange）是消息路由的核心组件。生产者将消息发送到交换机，交换机根据类型和绑定规则将消息路由到一个或多个队列。交换机的类型决定了路由的行为。

RabbitMQ中常见的交换机类型：

1. **扇形交换机（Fanout Exchange）**：将消息路由到所有绑定到该交换机的队列，忽略路由键。它适用于**广播**消息。

2. **直连交换机（Direct Exchange）**：根据消息的**路由键**（routing key）精确匹配队列。

   - 每一个Queue都与Exchange设置一个binding key(绑定键)

   - 发布者发送消息时，指定消息的routing key
   - Exchange将消息路由到binding key与消息routing key一致的队列

3. **主题交换机（Topic Exchange）**：根据消息的路由键和绑定键的模式匹配进行路由。

   绑定键通常是多个单词的组合，并且以`.`分割。

   绑定键可以包含通配符：`*`（匹配一个单词）和`#`（匹配零个或多个单词）。

4. **头交换机（Headers Exchange）**：不依赖路由键，而是根据消息的头信息（headers）进行匹配。绑定队列时可以指定一组头信息的匹配条件（全部匹配或部分匹配）。

{% note warning %}

Exchange只负责转发消息，不具备存储消息的能力，因此如果没有任何队列与Exchange绑定，或者没有符合路由规则的队列，那么消息会丢失！

{% endnote %}

之前的两个例子中都没有使用交换机而是直接发送消息到队列，现在采用交换机后，消息发送的模式会有很大变化：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016194509163-2025-10-1619:45:12.png" style="zoom:80%;" />

- 生产者，不再发送消息到队列中，而是发给交换机。

- 交换机一方面，接收生产者发送的消息。另一方面根据交换机的类型，将消息路由到与其绑定的队列。

- 消息队列需要与交换机绑定

- 消费者没有变化



#### 扇形交换机

fanout交换机会将消息路由到所有绑定到该交换机的队列。

应用场景：以之前的支付业务为例，当支付成功后，需要将支付信息广播到多个服务进行处理，此时就可以使用fanout交换机。

在控制台创建一个`fanout`类型的交换机 `catpaws.fanout`，再创建两个队列`fanout.queue1`和`fanout.queue2`，最后手动在交换机中绑定两个队列。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016201519284-2025-10-1620:15:20.png" style="zoom:80%;" />

在消费者服务中添加两个消费者，分别监听这两个队列

```java
@RabbitListener(queues = "fanout.queue1")
public void listenFanoutQueue1(String message){
    System.out.println("消费者1....接收到消息：【" + message + "】");
}

@RabbitListener(queues = "fanout.queue2")
public void listenFanoutQueue2(String message){
    System.out.println("消费者2....接收到消息：【" + message + "】");
}
```

消息提供者将消息发送到`fanout`交换机

```java
    @Test
    public void testFanoutQueue() {
        //1.交换机名
        String exchangeName = "catpaws.fanout";
        //2.消息
        String message = "hello,everyone";
        //3.发送，三个参数：交换机名称，路由键routingKey，消息
        rabbitTemplate.convertAndSend(exchangeName,null,message);
    }
```

结果：两个消费者都收到了广播消息

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016201819022-2025-10-1620:18:19.png" style="zoom:80%;" />

#### 直连交换机

Direct交换机根据消息的**路由键**精确匹配队列，因此称为定向路由。

- 每一个Queue都与Exchange设置一个binding key(绑定键)

- 发布者发送消息时，指定消息的routing key
- Exchange将消息路由到binding key与消息routing key一致的队列

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016202340366-2025-10-1620:23:42.png" style="zoom:80%;" />

当每个队列绑定的路由键都相同时，就可以实现与fanout交换机相同的广播效果。

应用场景：以之前的支付业务为例。当支付成功后，需要将支付信息广播到交易服务、通知服务、积分服务等进行异步处理。但是当用户取消支付时，只需要将消息发送到通知服务，通知用户支付取消即可，不用发送消息到交易服务和积分服务，此时就可以使用Direct交换机实现。

***

- 在控制台创建一个`direct`类型的交换机 `catpaws.direct`

- 再创建两个队列`direct.queue1`和`direct.queue2`
- 绑定队列到交换机，`queue1`的路由键为 success和failure，`queue2`的路由键为 success

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016205848508-2025-10-1620:58:49.png" style="zoom:80%;" />

在消费者服务中创建两个个消费者，代表通知服务、交易服务

```java
    @RabbitListener(queues = "direct.queue1")
    public void listenDirectQueue1(String message){
        System.out.println("通知服务....接收到消息：【" + message + "】");
    }

    @RabbitListener(queues = "direct.queue2")
    public void listenDirectQueue2(String message){
        System.out.println("交易服务....接收到消息：【" + message + "】");
    }
```

将支付信息发送到Direct交换机

```java
@Test
public void testDirectQueue() {
    //1.交换机名
    String exchangeName = "catpaws.direct";
    //2.消息
    String message = "支付成功";
    //3.发送到"catpaws.direct"交换机中binding key为 “success”的队列
    rabbitTemplate.convertAndSend(exchangeName,"success",message);
}
```

支付成功，支付信息广播到两个服务中

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016210146674-2025-10-1621:01:47.png" style="zoom:80%;" />



```java
@Test
public void testDirectQueue() {
    //1.交换机名
    String exchangeName = "catpaws.direct";
    //2.消息
    String message = "支付取消";
    //3.发送到"catpaws.direct"交换机中binding key为 “failure”的队列
    rabbitTemplate.convertAndSend(exchangeName,"failure",message);
}
```

支付失败，只有通知服务接收到消息

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016210411912-2025-10-1621:04:12.png" style="zoom:80%;" />



#### 主题交换机

Topic交换机根据消息的路由键和绑定键的模式匹配进行路由。

Topic交换机与Direct交换机相比：`BindingKey`一般都是由一个或多个单词组成，多个单词之间以.分割，例如：item.insert。并且`BindingKey`中可以使用通配符：

- `*`：匹配一个单词
- `#`：匹配一个或多个单词

举例：

- `item.#`：能够匹配`item.spu.insert`或者`item.spu`
- `item.*`：只能匹配 `item.spu`

***

假如此时publisher发送的消息使用的RoutingKey共有四种：

- `china.news` 代表有中国的新闻消息；
- `china.weather`代表中国的天气消息；
- `japan.news` 代表日本新闻
- `japan.weather`代表日本的天气消息；

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016211541696-2025-10-1621:15:44.png" style="zoom:80%;" />

- `topic.queue1`：绑定的是`china.#`，凡是以china.开头的routing key都会被匹配到。包括：
  - `china.news `
  - `china.weather `
- `topic.queue2`：绑定的是`#.news`，凡是以.news结尾的routing key都会被匹配。包括：
  - `china.news`
  - `japan.news`

在控制台创建Topic类的交换机和队列

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016212350063-2025-10-1621:23:51.png" style="zoom:80%;" />

在消费者服务中编写两个消费者，分别监听两个队列

```java
@RabbitListener(queues = "topic.queue1")
public void listenTopicQueue1(String message){
    System.out.println("消费者1....接收到消息：【" + message + "】");
}

@RabbitListener(queues = "topic.queue2")
public void listenTopicQueue2(String message){
    System.out.println("消费者2....接收到消息：【" + message + "】");
}
```

在消息发布者中向Topic交换机发布消息

```java
@Test
public void testTopicQueue() {
    //1.交换机名
    String exchangeName = "catpaws.topic";
    //2.消息
    String message = "日本战败矣！！！";
    //3.发送
    rabbitTemplate.convertAndSend(exchangeName,"china.news",message);
}
```

routing key是`china.news`，两个队列都会收到消息

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016213048082-2025-10-1621:30:49.png" style="zoom:80%;" />

```java
@Test
public void testTopicQueue() {
    //1.交换机名
    String exchangeName = "catpaws.topic";
    //2.消息
    String message = "蓝色：暴雨预警";
    //3.发送
    rabbitTemplate.convertAndSend(exchangeName,"china.weather",message);
}
```

routing key是` china.weather`，只有队列1会收到消息

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251016213235482-2025-10-1621:32:36.png" style="zoom:80%;" />

### 3.4 声明队列交换机

之前例子中的队列和交换机都是在控制台手动创建和绑定的，开发过程中用代码声明用的比较多。

Spring AMQP提供了几个类，用来声明队列、交换机及其绑定关系：

- Queue：用于声明队列，可以用工厂类QueueBuilder构建
- Exchange（接口）：用于声明交换机，可以用工厂类ExchangeBuilder构建
- Binding：用于声明队列和交换机的绑定关系，可以用工厂类BindingBuilder构建

{% note summary%}

声明队列和交换机一般在消费者方进行。

{% endnote %}

#### 基于Bean声明队列交换机

在consumer中创建一个配置类，声明队列和交换机。程序启动时会检查队列和交换机是否存在，如果不存在自动创建

```java
import org.springframework.amqp.core.*;

@Configuration
public class FanoutConfig {

    /**
     * 声明交换机
     * @return Fanout交换机
     */

    @Bean
    public FanoutExchange fanoutExchange(){
        return new FanoutExchange("catpaws.fanout");
        //或者通过工厂方法创建
        //return ExchangeBuilder.fanoutExchange("catpaws.fanout").build();
    }

    /**
     * 创建队列
     * @return 队列
     */
    @Bean
    public Queue fanoutQueue1() {
        return new Queue("fanout.queue1");
        //或者通过工厂方法创建
        //return QueueBuilder.durable("fanout.queue1").build();
    }

    /**
     * 绑定队列和交换机
     * @return
     */
    @Bean
    public Binding bindingQueue1(Queue fanoutQueue1, FanoutExchange fanoutExchange){
        //绑定 队列 到 交换机
        return  BindingBuilder.bind(fanoutQueue1).to(fanoutExchange);
    }

    @Bean
    public Queue fanoutQueue2(){
        return QueueBuilder.durable("fanout.queue2").build();
    }

    @Bean
    public Binding bindingQueue2(Queue fanoutQueue2, FanoutExchange fanoutExchange){
        return BindingBuilder.bind(fanoutQueue2).to(fanoutExchange);
    }
}
```

#### 基于注解声明队列交换机

可以通过`@RabbitListener`注解的`bindings`属性来声明交换机和队列，以及它们之间的绑定关系，同时为该队列绑定消息监听器。

`bindings`的值是`@QueueBinding`注解: 表示将队列和交换机进行绑定，它有三个重要的属性：

- value: 定义队列，使用@Queue注解
  - `name`/`value`属性：队列名称
  - `durable`属性：是否持久化，设置为"true"表示队列在RabbitMQ服务器重启后仍然存在。
- exchange: 定义交换机，使用@Exchange注解。
  - `name`/`value`属性：交换机名称
  - `type`属性：交换机的类型，默认为`Direct`类型，可通过`ExchangeTypes`指定
  - `durable`属性默认为true
- key: 定义路由键
  - 可以是一个数组，绑定多个key
  - 对于Topic交换机，可以使用通配符



```java
@RabbitListener(bindings = @QueueBinding(
    value = @Queue(name = "direct.queue1", durable = "true"),
    exchange = @Exchange(name = "catpaws.direct", type = ExchangeTypes.DIRECT, durable = "true"),
    key = {"success","failure"}
))
public void listenDirectQueue1(String message){
    System.out.println("通知服务....接收到消息：【" + message + "】");
}
```

当消费者启动时，Spring AMQP会检查RabbitMQ中是否存在指定的队列和交换机。如果不存在，则会根据这些注解的定义自动创建它们，并将队列按照指定的路由键绑定到交换机上。

这样，当生产者发送一条路由键为"success"的消息到"catpaws.direct"交换机时，该消息会被路由到"direct.queue1"队列，然后被这个监听器处理。

### 3.5 消息转换器

在使用`rabbitTemplate`的`convertAndSend`方法发送消息时，消息体是一个Object。在数据传输时，它会把你发送的消息序列化为字节发送给MQ，接收消息的时候，还会把字节反序列化为Java对象。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251017113358350-2025-10-1711:34:10.png" style="zoom:80%;" />

Spring的对消息对象的处理默认是由SimpleMessageConverter完成，它基于JDK的ObjectOutputStream完成序列化。JDK序列化存在下列问题：

- JDK的序列化有安全风险
- JDK序列化的消息太大
- JDK序列化的消息可读性差

建议采用JSON序列化代替默认的JDK序列化，要做两件事情：

- 在`publisher`和`consumer`中都引入jackson依赖

  ```xml
  <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
  </dependency>
  ```

- 在publisher和consumer中都要配置MessageConverter

  ```java
  import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
  import org.springframework.amqp.support.converter.MessageConverter;
  
  @Configuration
  public class MessageConvertConfig {
  	
      //配置jackson消息转换器
      @Bean
      public MessageConverter messageConverter() {
          return new Jackson2JsonMessageConverter();
      }
  }
  ```



***

在消息消费者处创建listener，同时创建队列和交换机并绑定。listener的消息参数类型与发送方发送时的消息类型一致即可。

```java
@RabbitListener( bindings = @QueueBinding(
    value = @Queue(value = "object.queue"),
    exchange = @Exchange(value = "catpaws.object"),
    key = "object"
))
public void listenObjectQueue(Map<String,Object> message){
    System.out.println("消费者....接收到消息：【" + message + "】");
}
```

在消息发布者处向交换机发送消息：

```java
@Test
public void testObjectQueue() {
    //1.交换机名
    String exchangeName = "catpaws.object";
    //2.消息
    Map<String,Object>message = new HashMap<>(2);
    message.put("name","Jack");
    message.put("age",20);
    //3.发送
    rabbitTemplate.convertAndSend(exchangeName,"object",message);
}
```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251017115356565-2025-10-1711:54:03.png" style="zoom:80%;" />



## 四、消息可靠性

一条消息要经历的过程：消息发送者将消息发送到MQ，MQ存储消息等待被消费，最终消费者处理消息。

这三个阶段都可能出现消息丢失的问题：

- 生产者发送消息时，可能因为网络问题、RabbitMQ节点故障、交换机不存在等原因导致消息发送失败。
- RabbitMQ宕机导致内存中的消息丢失。
- 消费者在处理消息时，可能因为各种原因（如业务逻辑异常、消费者宕机）导致消息消费失败。

以之前的支付业务为例，在支付成功后利用RabbitMQ通知交易服务，更新业务订单状态为已支付。若在此过程中MQ通知失败，支付服务中支付流水显示支付成功，而交易服务中的订单状态却显示未支付，数据出现了不一致。
<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251017143755607-2025-10-1714:37:58.png" style="zoom:80%;" />

因此，需要从消息发送、消息存储、消息消费三个方面确保MQ消息的可靠性，即：消息应该**至少**被消费者处理一次（可能出现消息重复投递的情况，需要做业务幂等处理）。

### 4.1 发送者可靠性

#### 生产者重试机制

生产者发送消息时，可能出现了网络故障，导致与MQ的连接中断。通过配置我们可以开启连接失败后的重连机制：

```yaml
spring:
  rabbitmq:
    connection-timeout: 1s #设置MQ的连接超时时间
    template:
      retry: 
        enabled: true # 开启超时重试机制
        initial-interval: 1000ms # 失败后的初始等待时间
        multiplier: 1  # 失败后下次的等待时⻓倍数，下次等待时⻓ = initial-interval * multiplier
        max-attempts: 3  # 最⼤重试次数
```

需要注意，当网络不稳定的时候，利用重试机制可以有效提高消息发送的成功率。不过SpringAMQP提供的重试机制是**阻塞式**的重试，也就是说多次重试等待的过程中，当前线程是被阻塞的。

如果对于业务性能有要求，建议禁用重试机制。如果一定要使用，请合理配置等待时长和重试次数，当然也可以考虑使用异步线程来执行发送消息的代码。

#### 生产者确认机制

生产者确认机制：当生产者发送消息到 RabbitMQ 后，RabbitMQ 会返回一个确认信号，告知生产者消息是否已经成功处理。

RabbitMQ提供的生产者消息确认机制，包括：`Publisher Confirm`和`Publisher Return`

- `Publisher Confirm ` 用于确认消息是否已经到达 RabbitMQ 代理（Broker）。它只关注消息是否被 Broker 接收，但并不关心消息是否被路由到队列。
- `Publisher Return`：当消息被 Broker 接收，但无法通过交换器路由到任何队列的情况下，RabbitMQ 会发送一个返回消息（Basic.Return）给生产者。

在开启确认机制的情况下，当生产者发送消息给MQ后，MQ会根据消息处理的情况返回不同的回执。返回的结果有以下几种情况：

- 消息投递到了MQ，但是路由失败。此时会通过`Publisher Return`返回路由异常原因，然后返回`ACK`，告知投递**成功**
- 临时消息投递到了MQ，并且入队成功，返回`ACK`，告知投递成功
- 持久消息投递到了MQ，并且入队完成持久化，返回`ACK`，告知投递成功
- 其它情况都会返回`NACK`，告知投递失败

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251017151909260-2025-10-1715:19:12.png" style="zoom:80%;" />



默认两种机制都是关闭状态，需要通过配置⽂件来开启。

```yaml
spring:
  rabbitmq:
    publisher-confirm-type: correlated # 开启publisher confirm机制，并设置confirm类型
    publisher-returns:  true #开启publish return机制
```

这里的publisher-confirm-type有三种模式可选：

- none：关闭confirm机制
- simple：同步阻塞等待MQ的回执消息
- correlated：MQ异步回调方式返回回执消息（**推荐**）



***

在Spring AMQP中

- Publisher Confirm 机制通过`ConfirmCallback`接口实现。
- Publisher Return 机制通过`ReturnsCallback`接口实现。

每个 `RabbitTemplate` 实例只需要配置一个 `ReturnCallback`，这个回调会处理**所有**通过该 模板 发送且无法路由的消息。因此可以在配置类中统⼀设置。

```java
@Configuration
@AllArgsConstructor
@Slf4j
public class MqConfig {

    private final  RabbitTemplate rabbitTemplate;

    @PostConstruct
    public void init(){
        rabbitTemplate.setReturnsCallback(returned -> {
            log.error("触发 return callback");
            log.debug("exchange: {}", returned.getExchange());
            log.debug("routingKey: {}", returned.getRoutingKey());
            log.debug("message: {}", returned.getMessage());
            log.debug("replyCode: {}", returned.getReplyCode());
            log.debug("replyText: {}", returned.getReplyText());

            //编写方法处理无法路由的消息
        });
    }
}
```

由于每个消息发送时的处理逻辑不一定相同，因此`ConfirmCallback`需要在每次发消息时定义。具体来说，是在调用`RabbitTemplate`中的`convertAndSend`方法时，多传递一个`CorrelationData`类型的参数：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251017163430344-2025-10-1716:34:31.png" style="zoom:80%;" />

#### 消息返回机制

这里的CorrelationData中包含两个核心的东西：

- `id`：消息的唯一标示，MQ对不同的消息的回执以此做判断，避免混淆

- `SettableListenableFuture`：回执结果的`Future`对象。将来MQ的回执就会通过这个`Future`来返回，我们可以提前给`CorrelationData`中的`Future`添加回调函数来处理消息回执：

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251017163813744-2025-10-1716:38:14.png" style="zoom:80%;" />

```java
@Test
public void testConfirmCallback() throws InterruptedException {
    //1.创建CorrelationData
    CorrelationData cd = new CorrelationData(UUID.randomUUID().toString());
    //2.给Future添加ConfirmCallback
    cd.getFuture().addCallback(new ListenableFutureCallback<CorrelationData.Confirm>() {
        @Override
        public void onFailure(Throwable ex) {
            //2.1 Future发生异常时的处理逻辑，基本不会触发。（不是消息的发送或处理异常）
            log.error("spring ampq处理确认结果异常：{}",ex);
        }

        @Override
        public void onSuccess(CorrelationData.Confirm result) {
            // 2.2.Future接收到回执的处理逻辑，参数中的result就是回执内容
           	// result.isAck()，boolean类型，true代表ack回执，false 代表 nack回执
            if (result.isAck()) {
                log.debug("收到ConfirmCallback  ack,消息发送成功！");
            }else {
                log.error("收到ConfirmCallback  nack，消息发送失败！reason：{}",result.getReason());
                // TODO 消息重发
            }
        }
    });
    //3.发送消息
    rabbitTemplate.convertAndSend("hmall.direct","blue","蓝色：猫爪在上",cd);

    Thread.sleep(2000);
}
```



### 4.2 MQ可靠性

在默认情况下，RabbitMQ会将接收到的信息保存在**内存**中以降低消息收发的延迟。这样会导致两个问题：

- 一旦MQ宕机，内存中的消息会丢失
- 内存空间有限，当消费者故障或处理过慢时，会导致消息积压，引发MQ阻塞

#### 数据持久化

RabbitMQ实现数据持久化包括3个方面：

- 交换机持久化
- 队列持久化
- 消息持久化

在Spring AMQP中，创建的交换机、队列以及发送的消息都是**持久化**的，无需额外处理。

相比于内存模式，采用持久化模式时当收到消息后会立即写入磁盘，不受内存压力影响，可以保证高吞吐量和稳定的性能，但是相比内存模式性能会有所下降。

#### Lazy Queue

RabbitMQ的内存模式在收到大量消息出现阻塞时，会进行page out，将内存的中的一些消息写入磁盘，此时MQ处于阻塞状态，阻塞或限制消息接收。

为了解决这个问题，从RabbitMQ的3.6.0版本开始，就增加了`Lazy Queues`的模式，也就是**惰性队列**。惰性队列的特征如下：

- 接收到消息后直接存入磁盘，不再存储到内存
- 消费者要消费消息时才会从磁盘中读取并加载到内存（可以提前缓存部分消息到内存，最多2048条）

而在3.12版本之后，LazyQueue已经成为所有队列的默认格式。因此官方推荐升级MQ为3.12版本或者所有队列都设置为LazyQueue模式。

手动开启LazyQueue模式：

```java
//Bean方式声明队列
@Bean
public Queue fanoutQueue(){
    return QueueBuilder
        .durable("fanout.queue2")
        .lazy()  //开启lazy模式
        .build();
}

//注解方式， 通过arguments参数开启lazy模式
@RabbitListener( bindings = @QueueBinding(
    value = @Queue(value = "object.queue",
                   durable = "true", 
                   arguments = @Argument(name = "x-queue-mod",value = "lazy")), 
    exchange = @Exchange(value = "catpaws.object"),
    key = "object"
))
public void listenObjectQueue(Map<String,Object> message){
    System.out.println("消费者....接收到消息：【" + message + "】");
}
```



### 4.3 消费者可靠性



#### 消费者确认机制

消费者确认机制（Consumer Acknowledgement）是为了确认消费者是否成功处理消息。当消费者处理消息结束后应该向RabbitMQ发送一个回执，告知RabbitMQ自己消息处理状态：

- `ack`：成功处理消息，RabbitMQ从队列中删除该消息
- `nack`：消息处理失败，RabbitMQ需要再次投递消息
- `reject`：消息处理失败并拒绝该消息，RabbitMQ从队列中删除该消息

reject⽅式⽤的较少，一般用于消息格式或校验异常。因此⼤多数情况下我们需要将消息处理的代码通过` try catch `机制捕获，消息处理成功时返回`ack`，处理失败时返回`nack`.

***

SpringAMQP帮我们实现了消息确认，并允许我们通过配置文件设置ACK处理方式。

有三种模式：

- `none `：不处理。即消息投递给消费者后⽴刻`ack`，消息会⽴刻从MQ删除。⾮常不安全，不建议
  使⽤
- `manual `：⼿动模式。需要⾃⼰在业务代码中调⽤api，发送 `ack `或 `reject `，存在业务⼊侵，
  但更灵活
- `auto `：⾃动模式。Spring AMQP利⽤AOP对我们的消息处理逻辑做了**环绕增强**，当业务正常执⾏时则⾃动返回 `ack `。当业务出现异常时，根据异常判断返回不同结果：
  - 如果是业务异常，会⾃动返回 `nack `；
  - 如果是消息处理或校验异常，⾃动返回 `reject `;

在**消费者**配置文件中设置ACK处理方式

```yaml
spring:
  rabbitmq:
    listener:
      simple:
        prefetch: 1
        acknowledge-mode: auto  #设置ACK处理方式：none、manual、auto
```

返回 `reject`的常见异常有：

- `MessageConversionException`
- `MethodArgumentNotValidException`
- `MethodArgumentTypeMismatchException`
- `NoSuchMethodException`
- `ClassCastException`

#### 失败重试机制

当消费者出现异常后，消息会不断requeue（重入队）到队列，再重新发送给消费者。如果消费者再次执行依然出错，消息会再次requeue到队列，再次投递，直到消息处理成功为止。极端情况就是消费者一直无法执行成功，那么消息requeue就会无限循环，导致mq的消息处理飙升，带来不必要的压力。

为了应对上述情况Spring又提供了消费者失败**重试机制**：在消费者出现异常时利用本地重试，而不是无限制的requeue消息到mq队列。

重试机制默认关闭，需要在消费者的配置文件中开启：

```yaml
spring:
  rabbitmq:
    listener:
      simple:
        prefetch: 1 
        acknowledge-mode: auto
        retry:
          enabled: true  # 开启消费者失败重试
          #下面都是默认值
          initial-interval: 1000ms # 初识的失败等待时⻓为1秒
          multiplier: 1   # 失败的等待时⻓倍数，下次等待时⻓ = multiplier * last-interval
          max-attempts: 3  # 最⼤重试次数
          stateless: true # true⽆状态；false有状态。如果业务中包含事务，这⾥改为false
```

此时若消费者在处理消息时出现异常：

- 失败后消息没有重新回到MQ⽆限重新投递，⽽是在本地重试了3次
- 本地重试3次以后，抛出了 `AmqpRejectAndDontRequeueException `异常。查看RabbitMQ控制台，发现消息被删除了，说明最后SpringAMQP返回的是 reject

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251017191758774-2025-10-1719:18:23.png" style="zoom:80%;" />

总结：

- 开启本地重试时，消息处理过程中抛出异常，不会requeue到队列，⽽是在消费者本地重试

- 重试达到最⼤次数后，Spring会返回reject，消息会被丢弃

这种默认的重试次数耗尽后的处理方式，在某些对于消息可靠性要求较⾼的业务场景下，显然不太合适了。

因此Spring允许我们⾃定义重试次数耗尽后的消息处理策略，这个策略是由 `MessageRecoverer` 接
⼝来定义的，它有3个不同实现：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251017192536076-2025-10-1719:25:36.png" style="zoom:80%;" />

- `RejectAndDontRequeueRecoverer`：重试耗尽后，直接 `reject `，丢弃消息。默认就是这种方式
- `ImmediateRequeueMessageRecoverer`：重试耗尽后，返回 `nack `，消息重新⼊队
- `RepublishMessageRecoverer`：重试耗尽后，将失败消息投递到指定的交换机

此处采用第三种策略，将错误消息republish到一个专门的交换机`error.direct`，可以为该交换机添加消息监听器进行处理，如邮件通知开发人员介入等。

```java
@Configuration
public class ErrorMessageConfiguration {
    /**
     * 定义接收错误消息的交换机
     * @return
     */
    @Bean
    public DirectExchange errorExchange() {
        return new DirectExchange("error.direct");
    }

    /**
     * 定义接受错误消息的队列
     * @return
     */
    @Bean
    public Queue errorQueue() {
        return new Queue("error.queue");
    }

    /**
     * 绑定交换机与队列
     * @param errorQueue
     * @param errorExchange
     * @return
     */
    @Bean
    public Binding binding(Queue errorQueue, DirectExchange errorExchange) {
        return BindingBuilder.bind(errorQueue).to(errorExchange).with("error");
    }

    /**
     * 重试次数耗尽后的处理策略:RepublishMessageRecoverer
     * @return
     */
    @Bean
    public MessageRecoverer messageRecoverer(RabbitTemplate rabbitTemplate) {
        return new RepublishMessageRecoverer(rabbitTemplate,"error.direct","error");
    }
}
```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251017194311877-2025-10-1719:43:14.png" style="zoom:80%;" />

#### 业务幂等性

幂等是一个数学概念，用函数表达式来描述是这样的：f(x)= f( f(x) )。在程序开发中，则是指同一个业务，执行一次或多次对业务状态的影响是一致的。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251017194541718-2025-10-1719:45:42.png" style="zoom:80%;" />

然而在实际业务场景中，由于意外经常会出现业务被重复执行的情况，例如：

- 服务间调用的重试
- 页面卡顿时频繁刷新导致表单重复提交
- MQ消息的重复投递

例如，在之前的支付业务中，用户支付成功后会发送MQ消息到交易服务，修改订单状态为已支付，就可能出现消息重复投递的情况。如果消费者不做判断，很有可能导致消息被消费多次，出现业务故障。可能的场景如下：

【1】用户刚刚支付完成，并且投递消息到交易服务，交易服务更改订单为**已支付**状态。<br>
【2】由于某种原因，例如网络故障导致生产者没有得到确认，隔了一段时间后重新投递给交易服务。<br>
【3】但是，在新投递的消息被消费之前，用户选择了退款，将订单状态改为了**已退款**。<br>
【4】退款完成后，新投递的消息才被消费，订单状态会被再次改为**已支付**，业务异常。<br>

保证消息处理的幂等性的两种常见⽅案：

- 唯一消息ID
- 业务状态判断

***

唯一消息ID的思路：

- 每一条消息都生成一个唯一的id，与消息一起投递给消费者。
- 消费者接收到消息后处理自己的业务，业务处理成功后将消息ID保存到数据库
- 如果下次又收到相同消息，去数据库查询判断是否存在，存在则为重复消息放弃处理。

在**消息发送者**的消息转换器中可以为每条消息添加唯一ID。

```java
@Configuration
public class MessageConvertConfig {

    @Bean
    public MessageConverter messageConverter() {
        // 1.定义消息转换器
        Jackson2JsonMessageConverter jjmc = new Jackson2JsonMessageConverter();
        // 2.配置⾃动创建消息id，⽤于识别不同消息，也可以在业务中基于ID判断是否是重复消息
        jjmc.setCreateMessageIds(true);
        return jjmc;
    }
}
```

为了获取消息ID，此时消息监听器的参数必须为`Message`类型

```java
@RabbitListener(queues = "simple.queue")
public void listenSimpleQueue(Message message) throws Exception {
    System.out.println("消息ID: "+ message.getMessageProperties().getMessageId());
    System.out.println("消息内容：" + new  String(message.getBody()));
}

//输出
消息ID: e00b0b09-0c74-4d82-b664-3112449f5065
消息内容："hello. spring AMQP"
```

这种方法需要做额外的数据库操作，对原有的业务造成了入侵，还会影响主业务的性能。



***

业务判断就是基于业务本身的逻辑或状态来判断是否是重复的请求或消息，不同的业务场景判断的思路也不一样。

例如，在支付业务案例中，处理消息的业务逻辑是把订单状态从未支付修改为已支付。因此我们就可以在执行业务时判断订单状态是否是未支付，如果不是则证明订单已经被处理过，无需重复处理。

### 4.4 延迟消息

在电商的支付业务中，对于一些库存有限的商品，为了更好的用户体验，通常都会在用户下单时立刻扣减商品库存。例如电影院购票、高铁购票，下单后就会锁定座位资源，其他人无法重复购买。

但是这样就存在一个问题，假如用户下单后一直不付款，就会一直占有库存资源，导致其他客户无法正常交易，最终导致商户利益受损！

因此，电商中通常的做法就是：**对于超过一定时间未支付的订单，应该立刻取消订单并释放占用的库存。**例如，订单支付超时时间为30分钟，则我们应该在用户下单后的第30分钟检查订单支付状态，如果发现未支付，应该立刻取消订单，释放库存。

但问题来了：如何才能准确的实现在下单后第30分钟去检查支付状态呢？

像这种在一段时间以后才执行的任务，我们称之为**延迟任务**，而要实现延迟任务，最简单的方案就是利用MQ的**延迟消息**了。

在RabbitMQ中实现延迟消息有两种方案：

- 死信交换机+TTL
- 延迟消息插件

#### 死信交换机

什么是死信？

当一个队列中的消息满足下列情况之一时，可以成为**死信**（dead letter）：

- 消费者使⽤ `basic.reject `或 `basic.nack` 声明消费失败，并且消息的 requeue 参数设置
  为false
- 消息是⼀个过期消息，超时无人消费（TTL）
- 要投递的队列消息满了，无法投递

如果队列通过`dead-letter-exchange`属性指定了一个交换机，那么该队列中的死信就会投递到这个交换机中。这个交换机称为**死信交换机**（Dead Letter Exchange，简称DLX）。

如何通过死信交换机实现延时任务呢？

1. 为普通队列`normal.queue`绑定一个死信交换机`dlx.redict`，并且不为它指定消息监听器，消费者从`dlx.queue`中获取消息
2. 发送者向`normal.direct`发送消息时，需要指定消息的过期时间（TTL）
3. 由于`normal.queue`没有消费者，消息过期后会投递到死信交换机，消费者就能从`dlx.queue`中得到消息
4. 总体效果就是：发送者发送了一条消息，消费者等待了TTL时间后获取到了消息

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251017210757951-2025-10-1721:07:59.png" style="zoom:80%;" />

***

定义普通交换机和队列

```java
@Configuration
public class NormalConfiguration {

    @Bean
    public DirectExchange normalExchange() {
        return new DirectExchange("normal.direct");
    }

    @Bean
    public Queue normalQueue() {
        return QueueBuilder
                .durable("normal.durable")
                .deadLetterExchange("dlx.direct") //指定死信交换机
                .build();
    }
    
    @Bean
    public Binding binding(Queue normalQueue, DirectExchange normalExchange) {
        return BindingBuilder.bind(normalQueue).to(normalExchange).with("normal");
    }
}
```

添加死信交换机和队列，并绑定消息监听器

```java
@RabbitListener( bindings = @QueueBinding(
    value = @Queue(value = "dlx.queue"),
    exchange = @Exchange(value = "dlx.direct"),
    key = "normal"  //两个交换机和队列的routingKey要保持一致
))
public void listenQueue(Map<String,Object> message){
    System.out.println("消费者....接收到消息：【" + message + "】");
}
```

测试，向`normal.direct`交换机发送消息时可以添加一个参数：消息后置处理器，用于将发送内容转换为`Message`类型后做进一步处理，我们可以在其中为消息设置过期时间

```java
@Test
public void testSendLazyMessage() {
    //1.交换机名
    String exchangeName = "normal.direct";
    //2.消息
    String message = "hello,everyone";
    //3.发送
    rabbitTemplate.convertAndSend(
        exchangeName, 
        "normal", 
        message, 
        message1 -> {
            message1.getMessageProperties().setExpiration("10000"); //设置过期时间，单位毫秒
            return message1;
        });
}
```



#### 延迟消息插件

这个插件可以将普通交换机改造为支持延迟消息功能的交换机，当消息投递到交换机后可以暂存一定时间，到期后再投递到队列。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251017210928768-2025-10-1721:09:29.png" style="zoom:80%;" />

***

1. 安装插件：[github地址](https://github.com/rabbitmq/rabbitmq-delayed-message-exchange)，下载与自己RabbitMQ版本一致的插件

2. 查看RabbitMQ 插件容器卷挂载目录，将插件上传到该目录

   ```bash
   
   [root@iZ2vc38fe5o8go8jgtau7gZ ~]# docker volume ls
   DRIVER    VOLUME NAME
   local     dfe5641f594bab715f0b816faca53c4271d2d7fd906a6f72dd4526384ffe4db6
   local     ec6fd97257574649a4edb01c58e4a4145a22fe632550dd8770ee7273b327dd69
   local     rabbitmq_mq-plugins
   [root@iZ2vc38fe5o8go8jgtau7gZ ~]# docker volume inspect rabbitmq_mq-plugins
   [
       {
           "CreatedAt": "2025-10-16T15:35:59+08:00",
           "Driver": "local",
           "Labels": {
               "com.docker.compose.project": "rabbitmq",
               "com.docker.compose.version": "2.27.0",
               "com.docker.compose.volume": "mq-plugins"
           },
           "Mountpoint": "/var/lib/docker/volumes/rabbitmq_mq-plugins/_data",
           "Name": "rabbitmq_mq-plugins",
           "Options": null,
           "Scope": "local"
       }
   ]
   [root@iZ2vc38fe5o8go8jgtau7gZ ~]# cd /var/lib/docker/volumes/rabbitmq_mq-plugins/_data
   ```

3. 启用该插件

   ```bash
   docker exec -it mq rabbitmq-plugins enable rabbitmq_delayed_message_exchange
   ```

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20251017211830041-2025-10-1721:18:32.png" style="zoom:80%;" />

***

声明具有延时效果的**交换机**

```java
//注解方式
@RabbitListener( bindings = @QueueBinding(
    value = @Queue(value = "delay.queue"),
    exchange = @Exchange(value = "delay.direct", delayed = "true"), //设置delay属性为true
    key = "delay"
))
public void listenDelayExchange(String message){
    log.info("接收delay.queue到消息：{}", message);
}

//Bean方式
@Bean
public DirectExchange delayExchange() {
    return ExchangeBuilder
        .directExchange("delay.direct")
        .delayed() // 设置delay属性为true
        .build();
}
声明队列和绑定关系略.....
```

发送延时消息，同样通过消息后置处理器完成，这时设置过期时间的方法是`setDelay`

```java
@Test
public void testSendDelayMessage() {
    //1.交换机名
    String exchangeName = "delay.direct";
    //2.消息
    String message = "hello,everyone";
    //3.发送
    rabbitTemplate.convertAndSend(exchangeName, "delay", message, message1 -> {
        //添加延迟消息属性
        message1.getMessageProperties().setDelay(10000);
        return message1;
    });
}
```





{%note warning%}

延迟消息插件内部会维护一个本地数据库表，同时使用Elang Timers功能实现计时。如果消息的延迟时间设置较长，可能会导致堆积的延迟消息非常多，会带来较大的CPU开销，同时延迟消息的时间会存在误差。
因此，**不建议设置延迟时间过长的延迟消息。**

{% endnote%}