---
title: Redis - 基础篇
tags:
  - Redis
  - Redis基本数据类型
  - Jedis
  - SpringDataRedis
index_img: https://catpaws.top/blog-resource/imgs/art-post6.jpg
categories:
  - 数据库
abbrlink: bcfabe89
date: 2024-12-11 01:44:29
---

<meta name = "referrer", content = "no-referrer"/>

## 一、初始Redis

### 1.1、认识NoSQL

​	NoSQL最常见的解释是“non-relational”， “Not Only SQL”也被很多人接受。NoSQL仅仅是一个概念，泛指**非关系型的数据库**，区别于关系数据库。

与关系型数据库对比，在以下几点存在差异：

1、数据结构组织

- 存入SQL的数据都是结构化（Structured）的数据，这些数据都有固定的格式和要求，通过**表和表的约束**确定下来。

  ![image-20241210105846784](https://gitee.com/cmyk359/img/raw/master/img/image-20241210105846784-2024-12-1010:59:01.png)

- NoSQL中的数据是非结构化的数据，对数据的格式没有严格的限制。NoSQL主要有四种数据组织方式：键值类型、文档类型、列类型、图（Graph）类型。

  ![image-20241211015432742](https://gitee.com/cmyk359/img/raw/master/img/image-20241211015432742-2024-12-1101:54:38.png)

2、数据关联

- 关系型数据库的数据是可以直接关联（Relational）的，可以通过**外键**建立数据的联系，这种外键关系一旦建立，数据库就会自动维护表和表之间的关联。同时可以减少数据的冗余。

  ![image-20241210111342983](https://gitee.com/cmyk359/img/raw/master/img/image-20241210111342983-2024-12-1011:13:44.png)

- 非关系型数据库没有直接维护数据与数据的关联，如采用外键方式，而是使用**JSON文档嵌套**的形式。要想实现外键关系这种效果，需要程序员通过业务逻辑来维护。这种方式也会造成数据的重复，同一份数据可能存储在多个用户下。

  ![image-20241210112239209](https://gitee.com/cmyk359/img/raw/master/img/image-20241210112239209-2024-12-1011:22:40.png)

3、数据查询方式

- 关系型数据库采用SQL查询，有固定的语法，只要是关系型数据库都能采用相同的语句进行查询

- 非关系型数据库的查询没有固定的语法格式，不同的NoSQL数据库有自己的语法格式

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241210112815212-2024-12-1011:28:16.png" alt="image-20241210112815212" style="zoom:80%;" />

4、事务特性

- 关系型数据库能够保证事务的`ACID`特性。当系统中的事务需要满足ACID时，优先选择关系型数据库。
- 对于非关系型数据库，有的没有事务，有的无法满足事务的强一致性，只能做到基本一致。[BASE理论](https://blog.csdn.net/yuanmayuzhou/article/details/137498595)

5、存储方式

- 关系型数据库基于**磁盘**进行存储，会有大量的磁盘IO，对性能有一定影响。
- 非关系型数据库，它操作更多的是依赖于内存来操作，内存的读写速度会非常快，性能自然会好一些。

6、扩展性

- 关系型数据库：**垂直扩展性**‌。关系型数据库集群模式一般是主从，主从数据一致，起到数据备份的作用，称为垂直扩展。SQL数据库通常通过增强单个服务器的性能（如增加CPU、内存、存储等）来实现垂直扩展。

- 非关系型数据库：**水平扩展性**。非关系型数据库可以将数据拆分，存储在不同机器上，可以保存海量数据，解决内存大小有限的问题。称为水平扩展。 NoSQL数据库通常设计为分布式系统，天生支持水平扩展。通过添加更多的节点到集群中，NoSQL数据库可以轻松地扩展存储和计算能力，以处理海量数据和并发请求。

7、使用场景

- 当数据结构固定，相关业务对数据安全性一致性要求较高时，采用关系型数据库。
- 数据结构否固定，对一致性、安全性要求不高，对性能要求高时，采用非关系型数据库。

### 1.2、认识Redis

![redis-logo](https://i-blog.csdnimg.cn/blog_migrate/85f82d1770ba79525dec9edff840861a.jpeg)

​	Redis诞生于2009年全称是**R**emote **Di**ctionary **S**erver，远程词典服务器，是一个基于内存的键值型NoSQL数据库。

特征：

- 键值（key-value）型，value支持多种不同数据结构，功能丰富
- 单线程，每个**命令**具备原子性
- 低延迟，速度快（基于**内存**、IO多路复用、良好的编码）。
- 支持数据持久化（保证内存中数据的安全）
- 支持主从集群、分片集群
- 支持多语言客户端



### 1.3.安装Redis

[参考视频](https://www.bilibili.com/video/BV1cr4y1671t?vd_source=51d78ede0a0127d1839d6abf9204d1ee&spm_id_from=333.788.player.switch&p=5)

## 二、Redis常用数据结构

### 2.1、Redis数据结构介绍

Redis是一个key-value的数据库，key一般是String类型，不过value的类型多种多样：

![image-20241210154119504](https://gitee.com/cmyk359/img/raw/master/img/image-20241210154119504-2024-12-1015:41:58.png)

除此之外，还有其他具有特殊功能的数据类型，可在Redis官网查看。

Redis将操作不同数据类型的命令做了分组，可以在[官网](https://redis.io/commands)查看相关命令

![image-20241210154408388](https://gitee.com/cmyk359/img/raw/master/img/image-20241210154408388-2024-12-1015:44:58.png)

也可以也可以通过Help命令来查看对应数据结构类型的命令

![image-20241210154609868](https://gitee.com/cmyk359/img/raw/master/img/image-20241210154609868-2024-12-1015:46:47.png)

### 2.2、Redis通用命令

通用指令是所有数据类型都可以使用的指令。[查看所有通用命令](https://redis.io/docs/latest/commands/?group=generic)

可以控制台查看命令的用法，如：

![image-20241210155923897](https://gitee.com/cmyk359/img/raw/master/img/image-20241210155923897-2024-12-1015:59:24.png)



常见的有：

- `KEYS`：查看**符合模板**的所有key，即可以使用 `*,?,[],^`等通配符进行模糊匹配。

  > **在生产环境下不推荐使用keys 命令，因为进行模糊查询效率不高，数据量过大时，花费时间过长，由于Redis命令是单线程的，会阻塞后面命令的执行。**

- `DEL`：删除一个指定的key。

- `EXISTS`：判断key是否存在

- `EXPIRE`：给一个key设置有效期，有效期到期时该key会被自动删除

- `TTL`：查看一个KEY的剩余有效期
  > i. 当前key没有设置过期时间，返回-1.
  >
  > ii. 当前key有设置过期时间，而且key已经过期，返回-2.
  >
  > iii. 当前key有设置过期时间，且key还没有过期，故会返回key的正常剩余时间.

- `Type`: 查看一个key的数据类型


### 2.3、String类型

String类型，也就是字符串类型，是Redis中最简单的存储类型。

其value是字符串，不过根据字符串的格式不同，又可以分为3类：

* string：普通字符串
* int：整数类型，可以做自增.自减操作
* float：浮点类型，可以做自增.自减操作

不管是哪种格式，底层都是字节数组形式存储，只不过是编码方式不同。

![image-20241210161609186](https://gitee.com/cmyk359/img/raw/master/img/image-20241210161609186-2024-12-1016:16:10.png)

String类型常见命令：

* SET：**添加**或者**修改**已经存在的一个String类型的键值对
* GET：根据key获取String类型的value
* MSET：批量添加多个String类型的键值对
* MGET：根据多个key获取多个String类型的value

  

* INCR：让一个整型的key自增1。

* INCRBY:让一个整型的key自增并指定步长，例如：incrby num 2 让num值自增2

* INCRBYFLOAT：让一个浮点类型的数字自增并指定步长

> 以上三个数值增加的函数，如果所操作的key不存在，则**在执行操作前将其设置为 0**。

* SETNX：添加一个String类型的键值对，前提是这个key不存在，否则不执行（真正的新增操作）

* SETEX：添加一个String类型的键值对，并且指定有效期

### 2.4、KEY的层级结构

Redis没有类似MySQL中的Table的概念，我们该如何区分不同类型的key呢？

例如，需要存储用户.商品信息到redis，有一个用户id是1，有一个商品id恰好也是1，此时如果使用id作为key，那就会冲突了，该怎么办？

我们可以通过给key添加前缀加以区分，不过这个前缀不是随便加的，有一定的规范：

Redis的key允许有多个单词形成层级结构，多个单词之间用`:`隔开，格式如下：

![image-20241210164117344](https://gitee.com/cmyk359/img/raw/master/img/image-20241210164117344-2024-12-1016:41:58.png)



例如我们的项目名称叫 heima，有user和product两种不同类型的数据，我们可以这样定义key：

- user相关的key：**heima:user:1**

- product相关的key：**heima:product:1**

如果Value是一个Java对象，例如一个User对象，则可以将对象序列化为JSON字符串后存储：

| **KEY**         | **VALUE**                                 |
| --------------- | ----------------------------------------- |
| heima:user:1    | {"id":1, "name": "Jack", "age": 21}       |
| heima:product:1 | {"id":1, "name": "小米11", "price": 4999} |

一旦我们向redis采用这样的方式存储，那么在可视化界面中，redis会以层级结构来进行存储，形成类似于这样的结构，更加方便Redis获取数据。

![image-20241210164316431](https://gitee.com/cmyk359/img/raw/master/img/image-20241210164316431-2024-12-1016:43:58.png)

### 2.5、Hash类型

Hash类型，也叫散列，其value是一个无序字典，类似于Java中的HashMap结构。

String结构是将对象序列化为JSON字符串后存储，当需要**修改其中某个字段**时很不方便：

![image-20241210164556205](https://gitee.com/cmyk359/img/raw/master/img/image-20241210164556205-2024-12-1016:45:58.png)

Hash结构可以将对象中的每个字段独立存储，可以针对单个字段做CRUD：

![image-20241210164642490](https://gitee.com/cmyk359/img/raw/master/img/image-20241210164642490-2024-12-1016:46:58.png)

**Hash类型的常见命令**

- HSET key field value：**添加**或者**修改**hash类型key的field的值
- HGET key field：获取一个hash类型key的field的值
- HMSET：批量添加多个hash类型key的field的值
- HMGET：批量获取多个hash类型key的field的值

```bash
127.0.0.1:6379> HSET heima:user:2 name rose
(integer) 1
127.0.0.1:6379> HSET heima:user:2 age 21
(integer) 1
127.0.0.1:6379> HGET heima:user:2 name
"rose"
127.0.0.1:6379> HMSET heima:user:3 name Lucy age 22 sex female
OK
127.0.0.1:6379> HMGET heima:user:3 name age sex
1) "Lucy"
2) "22"
3) "female"

```



- HGETALL：获取一个hash类型的key中的所有的field和value
- HKEYS：获取一个hash类型的key中的所有的field
- HVALS：获取一个hash类型的key中的所有的value

```bash
127.0.0.1:6379> HGETALL heima:user:3
1) "name"
2) "Lucy"
3) "age"
4) "22"
5) "sex"
6) "female"
127.0.0.1:6379> HKEYS heima:user:3
1) "name"
2) "age"
3) "sex"
127.0.0.1:6379> HVALS heima:user:3
1) "Lucy"
2) "22"
3) "female"

```



- HINCRBY:让一个hash类型key的字段值自增并指定步长
- HSETNX：添加一个hash类型的key的field值，前提是这个field不存在，否则不执行

```bash
127.0.0.1:6379> HINCRBY heima:user:3 age 3
(integer) 25
127.0.0.1:6379> HGET heima:user:3 age
"25"
127.0.0.1:6379> HINCRBY heima:user:3 age -2  #增量为负数，则为自减操作
(integer) 23
127.0.0.1:6379> HGET heima:user:3 age
"23"


127.0.0.1:6379> HSETNX heima:user:3 sex male  # user3已存在sex字段，设置无效
(integer) 0
127.0.0.1:6379> HGET heima:user:3 sex
"female"
127.0.0.1:6379> HSETNX heima:user:2 sex male #user2没有sex字段，设置成功
(integer) 1
127.0.0.1:6379> HGET heima:user:2 sex
"male"

```

- HEXISTS key field：判断指定key中是否已存在field字段，存在返回1，不存在返回0.
- HDEL key field [field ...]：删除指定key中的field字段，如果指定field不存在则忽略；如果该key的所有字段都被删除，则该key也被删除。如果 key 不存在，则将其视为空散列，此命令返回 0。
- HLEN key：返回该Key所含有的field字段的数量

### 2.6、List类型

Redis中的List类型与Java中的**LinkedList**类似，可以看做是一个双向链表结构。既可以支持正向检索和也可以支持反向检索。

特征也与LinkedList类似：

- 有序
- 元素可以重复
- 插入和删除快
- 查询速度一般

常用来存储一个有序数据，例如：朋友圈点赞列表，评论列表等。

**List的常见命令有：**

- LPUSH key element ... ：向列表左侧插入一个或多个元素

- LPOP key：移除并返回列表左侧的第一个元素，没有则返回nil

- RPUSH key element ... ：向列表右侧插入一个或多个元素

- RPOP key：移除并返回列表右侧的第一个元素

- LRANGE key star end：返回一段角标范围内的所有元素

- BLPOP和BRPOP：与LPOP和RPOP类似，只不过在没有元素时等待指定时间，而不是直接返回nil。

  > 使用BLPOP和BRPO时，若不存在该元素，会**阻塞进程**等待指定时间。若指定时间内等待元素出现，返回该元素值，否则返回nil。

![image-20241210170706103](https://gitee.com/cmyk359/img/raw/master/img/image-20241210170706103-2024-12-1017:07:58.png)

```bash
127.0.0.1:6379> LPUSH users 1 2 3
(integer) 3
127.0.0.1:6379> RPUSH users 4 5 6
(integer) 6
127.0.0.1:6379> LRANGE users 0 5  #注意此时队列中数字的顺序
1) "3"
2) "2"
3) "1"
4) "4"
5) "5"
6) "6"
127.0.0.1:6379> LPOP users
"3"
127.0.0.1:6379> RPOP users 2  #出队多个元素
1) "6"
2) "5"
127.0.0.1:6379> LRange key 0 -1 #不知道最后一个元素下标时，用-1代替
(empty array)
127.0.0.1:6379> LRange users  0 -1
1) "2"
2) "1"
3) "4"
```



- 如何利用List结构模拟一个栈？

  入口和出口在同一边。使用LPUSH/LPOP 或 RPUSH/RPOP进行元素操作。

- 如何利用List结构模拟一个队列？

  入口和出口在不同边。使用LPUSH/RPOP 或 RPUSH/LPOP进行元素操作。

- 如何利用List结构模拟一个阻塞队列？

  入口和出口在不同边，且出队时采用BLPOP或BRPOP

### 2.7、Set类型

Redis的Set结构与Java中的HashSet类似，可以看做是一个**value为null的HashMap**。因为也是一个hash表，因此具备与HashSet类似的特征：

* 无序
* 元素不可重复
* 查找快
* 支持交集、并集、差集等功能



**Set类型的常见命令**

* SADD key member ... ：向set中添加一个或多个元素
* SREM key member ... : 移除set中的指定元素
* SCARD key： 返回set中元素的个数
* SISMEMBER key member：判断一个元素是否存在于set中
* SMEMBERS：获取set中的所有元素

```bash
127.0.0.1:6379> SADD s1 a b c d #向s1中添加四个元素 a b c d
(integer) 4
127.0.0.1:6379> SMEMBERS s1 #查看s1中的元素
1) "a"
2) "c"
3) "d"
4) "b"
127.0.0.1:6379> SREM s1 a 
(integer) 1
127.0.0.1:6379> SREM s1 b  #删除s1中的a b
(integer) 1
127.0.0.1:6379> SISMEMBER s1 a #判断a是否是s1的元素，返回值为0
(integer) 0
127.0.0.1:6379> SCARD s1 #查看此时s1中元素的个数
(integer) 2

```



* SINTER key1 key2 ... ：求key1与key2的交集
* SDIFF key1 key2 ... ：求key1与key2的差集
* SUNION key1 key2 ..：求key1和key2的并集

```bash
#将下列数据用Redis的Set集合来存储：
	#张三的好友有：李四、王五、赵六
	#李四的好友有：王五、麻子、二狗

127.0.0.1:6379> SADD zs lisi wangwu zhaoliu
(integer) 3
127.0.0.1:6379> SADD ls wangwu mazi ergou
(integer) 3
127.0.0.1:6379> SINTER zs ls	 # 计算张三和李四有哪些共同好友
1) "wangwu"
127.0.0.1:6379> SDIFF zs ls		# 查询哪些人是张三的好友却不是李四的好友
1) "lisi"
2) "zhaoliu"
127.0.0.1:6379> SUNION zs ls 	# 查询张三和李四的好友总共有哪些人
1) "lisi"
2) "zhaoliu"
3) "wangwu"
4) "mazi"
5) "ergou"

```



### 2.8、SortedSet类型

Redis的SortedSet是一个可排序的set集合，与Java中的TreeSet有些类似，但底层数据结构却差别很大。

SortedSet中的每一个元素都带有一个`score`属性，可以基于score属性对元素`排序`，底层的实现是一个跳表（SkipList）加 hash表。

SortedSet具备下列特性：

- 可排序
- 元素不重复
- 查询速度快

因为SortedSet的可排序特性，经常被用来实现<u>排行榜</u>这样的功能。



SortedSet的常见命令有：

- ZADD key score member：添加一个或多个元素到sorted set ，如果已经存在则更新其score值
- ZREM key member：删除sorted set中的一个指定元素



- ZSCORE key member : 获取sorted set中的指定元素的score值
- ZRANK key member：获取sorted set 中的指定元素的排名（**<u>排名从0开始</u>**）



- ZCARD key：获取sorted set中的元素**个数**
- ZCOUNT key min max：统计`score值`在给定范围内的所有元素的**个数**

- ZRANGE key min max：按照score排序后，获取指定排名范围内的**元素**
- ZRANGEBYSCORE key min max：按照score排序后，获取指定score范围内的**元素**



- ZINCRBY key increment member：让sorted set中的指定元素自增，步长为指定的increment值

- ZDIFF.ZINTER.ZUNION：求差集.交集.并集

> 注意：所有的排名默认都是升序，如果要降序则在命令的Z后面添加REV即可，如ZREVRANK



练习案例

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241210174728207-2024-12-1017:47:45.png" alt="image-20241210174728207" style="zoom:70%;" />

```bash
127.0.0.1:6379> ZADD scores 85 Jack 89 Lucy 82 Rose  95 Tom 78 Jerry 92 Amy 76 Miles #导入学生分数到scores
(integer) 7
127.0.0.1:6379> ZREM scores Tom  #删除Tom同学
(integer) 1
127.0.0.1:6379> ZSCORE scores Amy #获取Amy的分数
"92"
127.0.0.1:6379> ZREVRANK scores Rose #score降序，获得Rose的排名
(integer) 3
127.0.0.1:6379> ZCOUNT scores 0 80 #查询80分以下的学生个数
(integer) 2
127.0.0.1:6379> ZINCRBY scores  2 Amy  #Amy的分数加2
"94"
127.0.0.1:6379> ZREVRANGE scores 0 2  #score降序排序，获取前三名
1) "Amy"
2) "Lucy"
3) "Jack"
127.0.0.1:6379> ZRANGEBYSCORE scores 0 80  #查出80分以下的同学
1) "Miles"
2) "Jerry"

```

## 三、Redis三种特殊数据结构

### 3.1、[GEO地理位置](https://catpaws.top/e0606bbf/#六附近的商户)



### 3.2、[BitMap](https://catpaws.top/e0606bbf/#七用户签到)



### 3.3、[Hyperloglog](https://catpaws.top/e0606bbf/#八uv网页的访问量统计)

## 四、Redis的Java客户端

在Redis官网中提供了各种语言的客户端，地址：https://redis.io/clients

![image-20241210215022257](https://gitee.com/cmyk359/img/raw/master/img/image-20241210215022257-2024-12-1021:50:26.png)

- jedis和Lettuce：这两个主要是提供了Redis命令对应的API，方便我们操作Redis，而SpringDataRedis又对这两种做了抽象和封装（SpringBoot**默认使用Lettuce**），因此后期可以以SpringDataRedis来学习。
- Redisson：是在Redis基础上实现了分布式的可伸缩的java数据结构，例如Map.Queue等，而且支持跨进程的同步机制：Lock.Semaphore等待，比较适合用来实现特殊的功能需求。

### 4.1、Jedis

#### 快速入门

1. 引入依赖

   ```xml
   <!--jedis-->
   <dependency>
       <groupId>redis.clients</groupId>
       <artifactId>jedis</artifactId>
       <version>3.7.0</version>
   </dependency>
   ```

2. 建立连接

   ```java
   private Jedis jedis;
   
   @BeforeEach
   void setUp() {
       // 1.建立连接
       jedis = new Jedis("主机ip", 6379);
       // 2.设置密码
       jedis.auth("123321");
       // 3.选择库
       jedis.select(0);
   }
   ```

3. 测试

   ```java
   @Test
   void testString() {
       // 存入数据
       String result = jedis.set("name", "虎哥");
       System.out.println("result = " + result);
       // 获取数据
       String name = jedis.get("name");
       System.out.println("name = " + name);
   }
   
   @Test
   void testHash() {
       // 插入hash数据
       jedis.hset("user:1", "name", "Jack");
       jedis.hset("user:1", "age", "21");
   
       // 获取
       Map<String, String> map = jedis.hgetAll("user:1");
       System.out.println(map);
   }
   ```

   

4. 释放资源

   ```java
   @AfterEach
   void tearDown() {
       if (jedis != null) {
           jedis.close();
       }
   }
   ```

#### Jedis连接池

Jedis本身是线程不安全的，并发模式下需要为每个线程创建Jedis连接，使用完再释放连接。频繁的创建和销毁连接会有性能损耗，因此推荐使用Jedis连接池代替Jedis的直连方式

创建Jedis连接池，通过连接池获取Jedis连接

```java
public class JedisConnectionFactory {
    private static JedisPool jedisPool;

    static {
        //配置连接池
        JedisPoolConfig poolConfig = new JedisPoolConfig();
        //最大连接
        poolConfig.setMaxTotal(10);
        //最大空闲连接
        poolConfig.setMaxIdle(8);
        //最小空闲连接
        poolConfig.setMinIdle(0);
        //设置最长等待时间 ，单位ms
        poolConfig.setMaxWaitMillis(200);

        //创建连接池对象
        jedisPool = new JedisPool(poolConfig,
                "192.168.181.100",6379,1000,"liuhao123");
    }
    //获取Jedis对象
    public static Jedis getJedis() {
        return jedisPool.getResource();
    }
}
```



```java
    @BeforeEach
    void setUp(){
        //建立连接
        /*jedis = new Jedis("127.0.0.1",6379);*/
        jedis = JedisConnectionFacotry.getJedis();
         //选择库
        jedis.select(0);
    }

   @AfterEach
    void tearDown() {
        if (jedis != null) {
            jedis.close();
        }
    }
```

1. 在完成了使用工厂设计模式来完成代码的编写之后，我们在获得连接时，就可以通过工厂来获得，而不用直接去new对象，降低耦合，并且使用的还是连接池对象。

2. 当我们使用了连接池后，当我们关闭连接其实并不是关闭，而是将Jedis连接**归还**给连接池。

### 4.2、SpringDataRedis

SpringData是Spring中数据操作的模块，包含对各种数据库的集成，其中对Redis的集成模块就叫做SpringDataRedis，[官网地址](https://spring.io/projects/spring-data-redis)

* 提供了对不同Redis客户端的整合（Lettuce和Jedis）
* 提供了**RedisTemplate**统一API来操作Redis
* 支持Redis的发布订阅模型
* 支持Redis哨兵和Redis集群
* 支持基于Lettuce的响应式编程
* 支持基于JDK.JSON.字符串.Spring对象的数据序列化及反序列化（方便数据的存储和读取）
* 支持基于Redis的JDKCollection实现

SpringDataRedis中提供了RedisTemplate工具类，其中封装了各种对Redis的操作。像redis一样，对不同数据类型做了分组，将不同数据类型的操作API封装到了不同的类型中：

![image-20241210221341487](https://gitee.com/cmyk359/img/raw/master/img/image-20241210221341487-2024-12-1022:13:58.png)

#### 快速入门

SpringBoot已经提供了对SpringDataRedis的支持，创建一个SpringBoot项目进行测试，步骤如下：

1. 引入依赖

   ```xml
    		<!--redis依赖-->
           <dependency>
               <groupId>org.springframework.boot</groupId>
               <artifactId>spring-boot-starter-data-redis</artifactId>
           </dependency>
           <!--common-pool-->
           <dependency>
               <groupId>org.apache.commons</groupId>
               <artifactId>commons-pool2</artifactId>
           </dependency>
           <!--Jackson依赖-->
           <dependency>
               <groupId>com.fasterxml.jackson.core</groupId>
               <artifactId>jackson-databind</artifactId>
           </dependency>
   ```

   

2. 配置文件

   ```yaml
   spring:
     redis:
       host: 192.168.181.100
       port: 6379
       password: 123321
       lettuce:
         pool:
           max-active: 8  #最大连接
           max-idle: 8   #最大空闲连接
           min-idle: 0   #最小空闲连接
           max-wait: 100ms #连接等待时间
   ```

   

3. 测试

   ```java
   @SpringBootTest
   class RedisDemoApplicationTests {
   
       @Autowired
       private RedisTemplate<String, Object> redisTemplate;
   
       @Test
       void testString() {
           // 写入一条String数据
           redisTemplate.opsForValue().set("name", "jack");
           // 获取string数据
           Object name = redisTemplate.opsForValue().get("name");
           System.out.println("name = " + name);
       }
   }
   ```

   ![image-20241211003003488](https://gitee.com/cmyk359/img/raw/master/img/image-20241211003003488-2024-12-1100:30:05.png)



#### RedisTemplate的两种序列化实践方案

RedisTemplate可以接收任意Object作为值写入Redis，在写入前会把Object序列化为字节形式，默认是采用**JDK序列化**

![image-20241211014252619](https://gitee.com/cmyk359/img/raw/master/img/image-20241211014252619-2024-12-1101:42:58.png)

得到的结果如下，可读性差，内存占用较大。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241211005242136-2024-12-1100:52:52.png" alt="image-20241211005242136" style="zoom:67%;" />

可以采用两种方案解决

方案一：

1. 自定义RedisTemplate
2. 修改RedisTemplate的序列化器为GenericJackson2JsonRedisSerializer

```java
@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory){
        // 创建RedisTemplate对象
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        // 设置连接工厂
        template.setConnectionFactory(connectionFactory);
        // 创建JSON序列化工具
        GenericJackson2JsonRedisSerializer jsonRedisSerializer = 
            							new GenericJackson2JsonRedisSerializer();
        // 设置Key的序列化
        template.setKeySerializer(RedisSerializer.string());
        template.setHashKeySerializer(RedisSerializer.string());
        // 设置Value的序列化
        template.setValueSerializer(jsonRedisSerializer);
        template.setHashValueSerializer(jsonRedisSerializer);
        // 返回
        return template;
    }
}
```

```java
//测试代码
@SpringBootTest
class HmDianPingApplicationTests {

    @Autowired
    private RedisTemplate<String,Object> redisTemplate;

    @Test
    void testString() {
        // 写入一条String数据
        redisTemplate.opsForValue().set("name", "jack");
        // 获取string数据
        Object name = redisTemplate.opsForValue().get("name");
        System.out.println("name = " + name);
    }
    @Test
    void testUser() {
        //存入对象数据
        redisTemplate.opsForValue().set("user:100",new TestUser("Dylan",20));
        //获取数据
        TestUser o = (TestUser) redisTemplate.opsForValue().get("user:100");
        System.out.println("o = "+ o);
    }
}
```



采用了JSON序列化来代替默认的JDK序列化方式。最终结果如图：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241211011952945-2024-12-1101:19:58.png" alt="image-20241211011952945" style="zoom:80%;" />

同时可以将Java对象自动的序列化为JSON字符串，并且查询时能自动把JSON反序列化为Java对象。不过，其中记录了序列化时对应的class名称，目的是为了查询时实现自动反序列化。这会带来额外的内存开销。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241211012224081-2024-12-1101:22:49.png" alt="image-20241211012224081" style="zoom:80%;" />

方案二：

1. 使用StringRedisTemplate
2. 写入Redis时，手动把对象序列化为JSON
3. 读取Redis时，手动把读取到的JSON反序列化为对象

​     为了在反序列化时知道对象的类型，JSON序列化器会将类的class类型写入json结果中，存入Redis，会带来额外的内存开销。为了减少内存的消耗，我们可以采用手动序列化和反序列化。

​	同时，只采用String的序列化器，这样，在存储value时，就不需要在内存中就不用多存储数据，从而节约内存空间。SpringDataRedis就提供了RedisTemplate的子类：`StringRedisTemplate`，它的key和value的序列化方式默认就是String方式。

省去了自定义RedisTemplate的序列化方式的步骤，而是直接使用：StringRedisTemplate

```java
@SpringBootTest
class HmDianPingApplicationTests {

    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    //进行序列化和反序列化的工具
    private static final ObjectMapper mapper = new ObjectMapper();
    
    @Test
    void testUser() throws JsonProcessingException {
        //创建对象
        TestUser testUser = new TestUser("Lucy", 21);
        //手动序列化
        String json = mapper.writeValueAsString(testUser);
        //写入数据
        stringRedisTemplate.opsForValue().set("user:200",json);
        //获取数据
        String jsonUser = stringRedisTemplate.opsForValue().get("user:200");
        //反序列化
        TestUser user = mapper.readValue(jsonUser, TestUser.class);
        System.out.println("user ="+ user);
    }
}
```

此时存储的内容没有之前的class信息，节约了存储空间

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241211013242601-2024-12-1101:32:44.png" alt="image-20241211013242601" style="zoom:80%;" />



#### 生产实践中使用

创建Redis配置文件，添加序列化器：

{% spoiler  RedisConfiguration%}

```java
@Configuration
public class RedisConfiguration {
    @Bean
    @SuppressWarnings("all")
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {

        // 我们为了自己开发方便，一般直接使用 <String, Object>
        RedisTemplate<String, Object> template = new RedisTemplate<String, Object>();
        template.setConnectionFactory(factory);

        // Json序列化配置
        Jackson2JsonRedisSerializer jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer(Object.class);
        ObjectMapper om = new ObjectMapper();
        om.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        om.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
        jackson2JsonRedisSerializer.setObjectMapper(om);

        // String 的序列化
        StringRedisSerializer stringRedisSerializer = new StringRedisSerializer();

        // key采用String的序列化方式
        template.setKeySerializer(stringRedisSerializer);

        // hash的key也采用String的序列化方式
        template.setHashKeySerializer(stringRedisSerializer);

        // value序列化方式采用jackson
        template.setValueSerializer(jackson2JsonRedisSerializer);

        // hash的value序列化方式采用jackson
        template.setHashValueSerializer(jackson2JsonRedisSerializer);
        template.afterPropertiesSet();
        return template;
    }
}

```

{%endspoiler%}

创建一个Redis工具类，对RedisTemplate进行封装，像使用原生Redis指令那样在java中使用对应API

{%spoiler RedisUtil%}

```java
/**
 * Redis工具类
 */
@Component
public class RedisUtil {

    @Autowired
    private RedisTemplate redisTemplate;

    /****************** common start ****************/
    /**
     * 指定缓存失效时间
     * @param key 键
     * @param time 时间(秒)
     * @return
     */
    public boolean expire(String key, long time) {
        try {
            if (time > 0) {
                redisTemplate.expire(key, time, TimeUnit.SECONDS);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 根据key 获取过期时间
     * @param key 键 不能为null
     * @return 时间(秒) 返回0代表为永久有效
     */
    public long getExpire(String key) {
        return redisTemplate.getExpire(key, TimeUnit.SECONDS);
    }

    /**
     * 判断key是否存在
     * @param key 键
     * @return true 存在 false不存在
     */
    public boolean hasKey(String key) {
        try {
            return redisTemplate.hasKey(key);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 删除缓存
     * @param key 可以传一个值 或多个
     */
    @SuppressWarnings("unchecked")
    public void del(String... key) {
        if (key != null && key.length > 0) {
            if (key.length == 1) {
                redisTemplate.delete(key[0]);
            } else {
                redisTemplate.delete((Collection<String>) CollectionUtils.arrayToList(key));
            }
        }
    }
    /****************** common end ****************/


    /****************** String start ****************/

    /**
     * 普通缓存获取
     * @param key 键
     * @return 值
     */
    public Object get(String key) {
        return key == null ? null : redisTemplate.opsForValue().get(key);
    }

    /**
     * 普通缓存放入
     * @param key 键
     * @param value 值
     * @return true成功 false失败
     */
    public boolean set(String key, Object value) {
        try {
            redisTemplate.opsForValue().set(key, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    /**
     * 普通缓存放入并设置时间
     * @param key 键
     * @param value 值
     * @param time 时间(秒) time要大于0 如果time小于等于0 将设置无限期
     * @return true成功 false 失败
     */
    public boolean set(String key, Object value, long time) {
        try {
            if (time > 0) {
                redisTemplate.opsForValue().set(key, value, time, TimeUnit.SECONDS);
            } else {
                set(key, value);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    /**
     * 递增
     * @param key 键
     * @param delta 要增加几(大于0)
     * @return
     */
    public long incr(String key, long delta) {
        if (delta < 0) {
            throw new RuntimeException("递增因子必须大于0");
        }
        return redisTemplate.opsForValue().increment(key, delta);
    }
    /**
     * 递减
     * @param key 键
     * @param delta 要减少几(小于0)
     * @return
     */
    public long decr(String key, long delta) {
        if (delta < 0) {
            throw new RuntimeException("递减因子必须大于0");
        }
        return redisTemplate.opsForValue().increment(key, -delta);
    }
    /****************** String end ****************/


    /****************** Map start ****************/

    /**
     * HashGet
     * @param key 键 不能为null
     * @param item 项 不能为null
     * @return 值
     */
    public Object hget(String key, String item) {
        return redisTemplate.opsForHash().get(key, item);
    }
    /**
     * 获取hashKey对应的所有键值
     * @param key 键
     * @return 对应的多个键值
     */
    public Map<Object, Object> hmget(String key) {
        return redisTemplate.opsForHash().entries(key);
    }
    /**
     * HashSet
     * @param key 键
     * @param map 对应多个键值
     * @return true 成功 false 失败
     */
    public boolean hmset(String key, Map<String, Object> map) {
        try {
            redisTemplate.opsForHash().putAll(key, map);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    /**
     * HashSet 并设置时间
     * @param key 键
     * @param map 对应多个键值
     * @param time 时间(秒)
     * @return true成功 false失败
     */
    public boolean hmset(String key, Map<String, Object> map, long time) {
        try {
            redisTemplate.opsForHash().putAll(key, map);
            if (time > 0) {
                expire(key, time);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    /**
     * 向一张hash表中放入数据,如果不存在将创建
     * @param key 键
     * @param item 项
     * @param value 值
     * @return true 成功 false失败
     */
    public boolean hset(String key, String item, Object value) {
        try {
            redisTemplate.opsForHash().put(key, item, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    /**
     * 向一张hash表中放入数据,如果不存在将创建
     * @param key 键
     * @param item 项
     * @param value 值
     * @param time 时间(秒) 注意:如果已存在的hash表有时间,这里将会替换原有的时间
     * @return true 成功 false失败
     */
    public boolean hset(String key, String item, Object value, long time) {
        try {
            redisTemplate.opsForHash().put(key, item, value);
            if (time > 0) {
                expire(key, time);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    /**
     * 删除hash表中的值
     * @param key 键 不能为null
     * @param item 项 可以使多个 不能为null
     */
    public void hdel(String key, Object... item) {
        redisTemplate.opsForHash().delete(key, item);
    }
    /**
     * 判断hash表中是否有该项的值
     * @param key 键 不能为null
     * @param item 项 不能为null
     * @return true 存在 false不存在
     */
    public boolean hHasKey(String key, String item) {
        return redisTemplate.opsForHash().hasKey(key, item);
    }
    /**
     * hash递增 如果不存在,就会创建一个 并把新增后的值返回
     * @param key 键
     * @param item 项
     * @param by 要增加几(大于0)
     * @return
     */
    public double hincr(String key, String item, long by) {
        return redisTemplate.opsForHash().increment(key, item, by);
    }
    /**
     * hash递减
     * @param key 键
     * @param item 项
     * @param by 要减少记(小于0)
     * @return
     */
    public double hdecr(String key, String item, long by) {
        return redisTemplate.opsForHash().increment(key, item, -by);
    }


    /****************** Map end ****************/



    /****************** Set start ****************/

    /**
     * 根据key获取Set中的所有值
     * @param key 键
     * @return
     */
    public Set<Object> sGet(String key) {
        try {
            return redisTemplate.opsForSet().members(key);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    /**
     * 根据value从一个set中查询,是否存在
     * @param key 键
     * @param value 值
     * @return true 存在 false不存在
     */
    public boolean sHasKey(String key, Object value) {
        try {
            return redisTemplate.opsForSet().isMember(key, value);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    /**
     * 将数据放入set缓存
     * @param key 键
     * @param values 值 可以是多个
     * @return 成功个数
     */
    public long sSet(String key, Object... values) {
        try {
            return redisTemplate.opsForSet().add(key, values);
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    /**
     * 将set数据放入缓存
     * @param key 键
     * @param time 时间(秒)
     * @param values 值 可以是多个
     * @return 成功个数
     */
    public long sSetAndTime(String key, long time, Object... values) {
        try {
            Long count = redisTemplate.opsForSet().add(key, values);
            if (time > 0)
                expire(key, time);
            return count;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }


    /**
     * 获取set缓存的长度
     * @param key 键
     * @return
     */
    public long sGetSetSize(String key) {
        try {
            return redisTemplate.opsForSet().size(key);
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }


    /**
     * 移除值为value的
     * @param key 键
     * @param values 值 可以是多个
     * @return 移除的个数
     */
    public long setRemove(String key, Object... values) {
        try {
            Long count = redisTemplate.opsForSet().remove(key, values);
            return count;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }


    /****************** Set end ****************/

    /****************** List start ****************/

    /**
     * 获取list缓存的内容
     * @param key 键
     * @param start 开始
     * @param end 结束 0 到 -1代表所有值
     * @return
     */
    public List<Object> lGet(String key, long start, long end) {
        try {
            return redisTemplate.opsForList().range(key, start, end);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    /**
     * 获取list缓存的长度
     * @param key 键
     * @return
     */
    public long lGetListSize(String key) {
        try {
            return redisTemplate.opsForList().size(key);
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }


    /**
     * 通过索引 获取list中的值
     * @param key 键
     * @param index 索引 index>=0时， 0 表头，1 第二个元素，依次类推；index<0时，-1，表尾，-2倒数第二个元素，依次类推
     * @return
     */
    public Object lGetIndex(String key, long index) {
        try {
            return redisTemplate.opsForList().index(key, index);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 将list放入缓存
     * @param key 键
     * @param value 值
     * @return
     */
    public boolean lSet(String key, Object value) {
        try {
            redisTemplate.opsForList().rightPush(key, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 将list放入缓存
     * @param key 键
     * @param value 值
     * @param time 时间(秒)
     * @return
     */
    public boolean lSet(String key, Object value, long time) {
        try {
            redisTemplate.opsForList().rightPush(key, value);
            if (time > 0)
                expire(key, time);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 将list放入缓存
     * @param key 键
     * @param value 值
     * @return
     */
    public boolean lSet(String key, List<Object> value) {
        try {
            redisTemplate.opsForList().rightPushAll(key, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 将list放入缓存
     * @param key 键
     * @param value 值
     * @param time 时间(秒)
     * @return
     */
    public boolean lSet(String key, List<Object> value, long time) {
        try {
            redisTemplate.opsForList().rightPushAll(key, value);
            if (time > 0)
                expire(key, time);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 根据索引修改list中的某条数据
     * @param key 键
     * @param index 索引
     * @param value 值
     * @return
     */
    public boolean lUpdateIndex(String key, long index, Object value) {
        try {
            redisTemplate.opsForList().set(key, index, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 移除N个值为value
     * @param key 键
     * @param count 移除多少个
     * @param value 值
     * @return 移除的个数
     */
    public long lRemove(String key, long count, Object value) {
        try {
            Long remove = redisTemplate.opsForList().remove(key, count, value);
            return remove;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }
    /****************** List end ****************/

}
```



{%endspoiler%}

## 补充

Windows的Redis图形化客户端连接不上虚拟机中的Redis问题

**1、修改redis.conf配置文件**

![image-20241212095439904](https://gitee.com/cmyk359/img/raw/master/img/image-20241212095439904-2024-12-1209:56:28.png)

**2、在linux下的防火墙中开放6379端口**

```bash
sudo firewall-cmd --zone=public --add-port=6379/tcp --permanent
```

**3、重新载入firewalld以应用更改**

```bash
sudo firewall-cmd --reload
```

**4、检查端口是否已开放**

```bash
sudo firewall-cmd --zone=public --list-ports
```

