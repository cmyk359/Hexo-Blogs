---
title: Redis - 高级篇
categories:
  - 数据库
abbrlink: 29be09bb
date: 2024-12-24 09:40:45
tags:
  - Redis持久化
  - Redis主从
  - Redis分片集群
  - 多级缓存
  - Redis最佳实践
  - Redis事务
---

<meta name = "referrer", content = "no-referrer"/>

[redis.conf 配置详解](https://www.cnblogs.com/kreo/p/4423362.html)

## 一、分布式缓存

单节点Redis问题

- 数据丢失问题：Redis是内存存储，服务重启可能会丢失数据。（通过**实现Redis数据持久化**解决）
- 并发能力问题：单节点的Redis的性能虽然不错，但无法满足如618这样的该并发场景（通过**搭建主从集群，实现读写分离**解决）
- 故障恢复问题：如果Redis宕机，则服务不可用，需要一种自动的故障恢复手段（**利用Redis哨兵，实现健康检测和自动恢复**）
- 存储能力问题：Redis是基于内存存储，单节点能存储的数据量难以满足海量数据需求（**搭建分片集群，利用插槽机制实现动态扩容**）。



### 1.1、Redis持久化

Redis有两种持久化方案：

- RDB持久化
- AOF持久化



#### RDB持久化

RDB全称`Redis Database Backup file`（Redis数据备份文件），也被叫做Redis数据快照。简单来说就是**把内存中的所有数据都记录到磁盘中**。Redis的RDB持久化通过定期保存数据快照至一个rdb文件中，并在启动时自动加载rdb文件，以恢复之前保存的数据。快照文件称为RDB文件，默认是保存在当前运行目录。

##### 执行时机

- 执行save命令

  ```bash
  [root@localhost ~]#redis-cli
  127.0.0.1：6379> save   #由Redis主进程来执行RDB，会阻塞所有命令ok
  127.0.0.1：6379>
  ```

  save命令会导致**主进程**执行RDB，这个过程中其它所有命令都会被**阻塞**。只有在数据迁移时可能用到。

- 执行bgsave命令

  下面的命令可以异步执行RDB：

  ```bash
  127.0.0.1：6379> bgsave#开启子进程执行RDB，避免主进程受到影响
  Background saving started
  ```

  这个命令执行后会**开启独立进程完成RDB**，主进程可以持续处理用户请求，不受影响。

- Redis停机时

  Redis停机时会执行一次save命令，实现RDB持久化。

  ![image-20241224104159899](https://gitee.com/cmyk359/img/raw/master/img/image-20241224104159899-2024-12-2410:42:10.png)

- 触发RDB条件时

  Redis内部有触发RDB的机制，可以在redis.conf文件中找到，格式如下：

  ```properties
  # 900秒内，如果至少有1个key被修改，则执行bgsave ， 如果是 save "" 则表示禁用RDB
  save 900 1  
  save 300 10  
  save 60 10000 
  ```



RDB的其它配置也可以在redis.conf文件中设置：

```properties
# 是否压缩 ,建议不开启，压缩也会消耗cpu，磁盘的话不值钱
rdbcompression yes

# RDB文件名称
dbfilename dump.rdb  

# 文件保存的路径目录
dir ./ 


docker run -p 6379:6379 --name redis6.2.6 -v /usr/local/bin/redis/dockerRedis/conf/redis.config:/etc/redis/redis.conf -v /usr/local/bin/redis/dockerRedis/data:/data -v /usr/local/bin/redis/dockerRedis/logs:/logs -d redis:6.2.6 redis-server /etc/redis/redis.conf
```



##### 原理

bgsave开始时会fork主进程得到子进程，子进程**共享**主进程的内存数据。完成fork后，由子进程读取内存数据并写入 新的RDB 文件，用新RDB文件替换旧的RDB文件。

> fork的作用是复制一个与当前进程（父进程）完全相同的子进程。新进程（子进程）的所有数据（变量、环境变量、程序计数器等）的数值都和原进程（父进程）一致，但子进程是一个全新的进程。
>
> 在fork过程中父进程是**阻塞**的，完成后才可继续处理请求

fork采用了写时拷贝（**Copy-On-Write**, COW）技术，在fork发生时，并不会立即复制父进程的全部内存数据到子进程，而是将父进程的**页表**拷贝给子进程，此时父子进程会通过相同的页表映射关系共享相同的物理内存页。

在子进程读取内存数据时，这些内存页设置为**只读模式**，防止父进程在此期间进行写操作而出现脏数据。当父进程修改内存数据时，操作系统会将相应的内存数据复制一份作为副本，主进程对副本数据进行修改，下次读取时也会读取副本数据。

![fork过程](https://gitee.com/cmyk359/img/raw/master/img/无标题-2024-12-2410:58:16.png)

##### 总结

RDB方式bgsave的基本流程？

- fork主进程得到一个子进程，共享内存空间
- 子进程读取内存数据并写入新的RDB文件
- 用新RDB文件替换旧的RDB文件

RDB的缺点？

- RDB执行间隔时间长，两次RDB之间写入数据有丢失的风险
- fork子进程、压缩、写出RDB文件都比较耗时



#### AOF持久化

AOF全称为`Append Only File`（追加文件）。Redis处理的**每一个写命令**都会记录在AOF文件，可以看做是命令日志文件。

<img src="https://gitee.com/cmyk359/img/raw/master/img/无标题-2024-12-2411:24:48.png" alt="AOF" style="zoom:80%;" />

##### 相关配置

AOF**默认是关闭**的，需要修改redis.conf配置文件来开启AOF：

```properties
# 是否开启AOF功能，默认是no
appendonly yes
# AOF文件的名称
appendfilename "appendonly.aof"
```



AOF的命令记录的频率也可以通过redis.conf文件来配：

```properties
# 表示每执行一次写命令，立即记录到AOF文件
appendfsync always 
# 写命令执行完先放入AOF缓冲区，然后表示每隔1秒将缓冲区数据写到AOF文件，是**默认方案**
appendfsync everysec 
# 写命令执行完先放入AOF缓冲区，由操作系统决定何时将缓冲区内容写回磁盘
appendfsync no
```

![三种策略对比](https://gitee.com/cmyk359/img/raw/master/img/image-20241224112620896-2024-12-2411:26:22.png)



##### AOF文件重写

因为是记录命令，AOF文件会比RDB文件大的多。而且AOF会记录对同一个key的多次写操作，但**只有最后一次写操作才有意义**。通过执行`bgrewriteaof`命令，可以让AOF文件执行重写功能，用最少的命令达到相同效果。

![image-20241224112752086](https://gitee.com/cmyk359/img/raw/master/img/image-20241224112752086-2024-12-2411:27:53.png)

> 如图，AOF原本有三个命令，但是`set num 123 和 set num 666`都是对num的操作，第二次会覆盖第一次的值，因此第一个命令记录下来没有意义。所以重写命令后，AOF文件内容就是：`mset name jack num 666`
>
> `bgrewriteaof`命令也是**异步**的，会开启新的进程完成。

Redis也会在触发阈值时自动去重写AOF文件。阈值也可以在redis.conf中配置：

```properties
# AOF文件比上次文件 增长超过多少百分比则触发重写
auto-aof-rewrite-percentage 100
# AOF文件体积最小多大以上才触发重写 
auto-aof-rewrite-min-size 64mb 
```

#### RDB和AOF对比

RDB和AOF各有自己的优缺点，如果对数据安全性要求较高，在实际开发中往往会**结合**两者来使用。

![RDB和AOF对比](https://gitee.com/cmyk359/img/raw/master/img/image-20241224112928342-2024-12-2411:29:29.png)



### 1.2、Redis主从

单节点Redis的并发能力是有上限的，要进一步提高Redis的并发能力，就需要搭建主从集群，实现读写分离。

![image-20241224151621838](https://gitee.com/cmyk359/img/raw/master/img/image-20241224151621838-2024-12-2415:16:43.png)

#### 搭建主从集群

[参考教程](https://catpaws.top/3e4345d9/#redis主从集群)


#### 开启主从关系

现在三个实例还没有任何关系，要配置主从可以使用`replicaof` 或者`slaveof`（5.0以前）命令。

有临时和永久两种模式：

- 修改配置文件（**永久生效**）

  在redis.conf中添加一行配置：```slaveof <masterip> <masterport>```

- 使用redis-cli客户端连接到redis服务，执行slaveof命令（**重启后失效**）：

  ```sh
  slaveof <masterip> <masterport>
  ```



通过redis-cli命令连接7002，执行下面命令：

```sh
# 连接 7002
redis-cli -p 7002
# 执行slaveof
slaveof 192.168.150.101 7001
```



通过redis-cli命令连接7003，执行下面命令：

```sh
# 连接 7003
redis-cli -p 7003
# 执行slaveof
slaveof 192.168.150.101 7001
```



然后连接 7001节点，查看集群状态：

```sh
# 连接 7001
redis-cli -p 7001
# 查看状态
info replication
```

![image-20241224152930388](https://gitee.com/cmyk359/img/raw/master/img/image-20241224152930388-2024-12-2415:29:31.png)



测试：只有在7001这个master节点上可以执行写操作，7002和7003这两个slave节点只能执行读操作。

![image-20241224153322376](https://gitee.com/cmyk359/img/raw/master/img/image-20241224153322376-2024-12-2415:33:55.png)

#### 主从数据同步原理

##### 全量同步

主从第一次建立连接时，会执行**全量同步**，将master节点的所有数据都拷贝给slave节点。

![全量同步](https://gitee.com/cmyk359/img/raw/master/img/无标题-2024-12-2415:39:06.png)

master如何得知salve是第一次来连接呢？？

有几个概念，可以作为判断依据：

- **`Replication Id`**：简称`replid`，是数据集的标记，id一致则说明是同一数据集。每一个master都有唯一的`replid`，slave则会继承master节点的`replid`
- **`offset`**：偏移量，随着记录在`repl_baklog`中的数据增多而逐渐增大。slave完成同步时也会记录当前同步的`offset`。如果slave的`offset`小于master的`offset`，说明slave数据落后于master，需要更新。

因此slave做数据同步，必须向master声明自己的`replication id` 和`offset`，master才可以判断到底需要同步哪些数据。

> slave原本也是一个master，有自己的replid和offset，当第一次变成slave，与master建立连接时，发送的replid和offset是自己的replid和offset。
>
> master判断发现slave发送来的replid与自己的不一致，说明这是一个全新的slave，就知道要做全量同步了。
>
> master会将自己的replid和offset都发送给这个slave，slave保存这些信息。以后slave的replid就与master一致了。



完整流程：

- slave节点请求增量同步
- master节点判断replid，发现不一致，拒绝增量同步
- master将完整内存数据生成RDB，发送RDB到slave
- slave清空本地数据，加载master的RDB
- master将RDB期间的命令记录在repl_backlog，并持续将log中的命令发送给slave
- slave执行接收到的命令，保持与master之间的同步



##### 增量同步

全量同步需要先做RDB，然后将RDB文件通过网络传输个slave，耗时太长。因此除了第一次做全量同步，其它大多数时候slave与master都是做**增量同步**。

增量同步：只更新slave与master存在差异的部分数据

![image-20241224154926283](https://gitee.com/cmyk359/img/raw/master/img/image-20241224154926283-2024-12-2415:49:27.png)



主节点会维护一个 `repl_backlog` **环形缓冲区**，并不断更新其中的命令日志和偏移量信息。从节点在断连并重新连接主节点时，会发送自己的当前偏移量给主节点。主节点会根据从节点提供的偏移量，在 `repl_backlog` 中查找对应的日志位置，将之后的新命令发送给从节点，实现数据同步。

![image-20241224160654992](https://gitee.com/cmyk359/img/raw/master/img/image-20241224160654992-2024-12-2416:06:56.png)

如果slave出现网络阻塞，导致master的offset远远超过了slave的offset，此时master继续写入新数据，其offset就会覆盖旧的数据，直到将slave现在的offset也覆盖。棕色框中的红色部分，就是尚未同步，但是却已经被覆盖的数据。此时如果slave恢复，需要同步，却发现自己的offset都没有了，无法完成增量同步了，只能做**全量同步**。

![image-20241224160909032](https://gitee.com/cmyk359/img/raw/master/img/image-20241224160909032-2024-12-2416:09:10.png)

#### 主从同步优化

主从同步可以保证主从数据的一致性，非常重要。可以从以下几个方面来优化Redis主从就集群：

- 在master中配置repl-diskless-sync yes启用无磁盘复制，避免全量同步时的磁盘IO。

  > 当设置`repl-diskless-sync yes`时，主节点会直接将内存中的数据通过网络发送给从节点，省去了生成RDB文件和写入磁盘的步骤，从而提高了复制的效率‌

- Redis单节点上的内存占用不要太大，减少RDB导致的过多磁盘IO

- 适当提高`repl_backlog`的大小，发现slave宕机时尽快实现故障恢复，尽可能避免全量同步

- 限制一个master上的slave节点数量，如果实在是太多slave，则可以采用主-从-从链式结构，减少master压力

  ![主-从-从链式结构](https://gitee.com/cmyk359/img/raw/master/img/image-20241224161546157-2024-12-2416:15:47.png)

#### 总结

简述全量同步和增量同步区别？

- 全量同步：master将完整内存数据生成RDB，发送RDB到slave。后续命令则记录在`repl_baklog`，逐个发送给slave。
- 增量同步：slave提交自己的offset到master，master获取`repl_baklog`中从offset之后的命令给slave

什么时候执行全量同步？

- slave节点第一次连接master节点时
- slave节点断开时间太久，`repl_baklog`中的offset已经被覆盖时

什么时候执行增量同步？

- slave节点断开又恢复，并且在r`epl_baklog`中能找到offset时





### 1.3、Redis哨兵

Redis提供了哨兵（Sentinel）机制来实现主从集群的自动故障恢复。哨兵的结构和功能如下:

- **监控**：Sentinel 会不断检查您的master和slave是否按预期工作
- **自动故障恢复**：如果master故障，Sentinel会将一个slave提升为master。当故障实例恢复后也以新的master为主
- **通知**：Sentinel充当Redis客户端的服务发现来源，当集群发生故障转移时，会将最新信息推送给Redis的客户端

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241224162530556-2024-12-2416:25:32.png" alt="image-20241224162530556" style="zoom:80%;" />

#### 集群监控原理

Sentinel基于**心跳机制**监测服务状态，每隔1秒向集群的每个实例发送ping命令：

•主观下线：如果某sentinel节点发现某实例未在规定时间响应，则认为该实例**主观下线**。

•客观下线：若超过指定数量（quorum）的sentinel都认为该实例主观下线，则该实例**客观下线**。quorum值最好超过Sentinel实例数量的一半。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241224162742910-2024-12-2416:27:44.png" alt="image-20241224162742910" style="zoom:80%;" />

#### 集群故障恢复原理

一旦发现master故障，sentinel需要在salve中选择一个作为新的master，规则如下：

- 首先会判断slave节点与master节点断开时间长短，如果超过指定值（down-after-milliseconds * 10）则会排除该slave节点。（数据太旧了）
- 然后判断slave节点的`slave-priority`值，越小优先级越高，如果是0则永不参与选举
- 如果`slave-priority`一样，则判断slave节点的`offset`值，越大说明数据越新，优先级越高（主要）
- 最后是判断slave节点的运行id大小，越小优先级越高。



当选出一个新的master后，由哨兵实现结点角色切换，流程如下：

- sentinel给备选的slave1节点，如7002，发送`slaveof no one`命令，让该节点成为master
- sentinel给所有其它slave发送`slaveof 192.168.150.101 7002` 命令，让这些slave成为新master的从节点，开始从新的master上同步数据。
- 最后，sentinel将故障节点标记为slave，当故障节点恢复后会自动成为新的master的slave节点

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241224163250288-2024-12-2416:32:51.png" alt="image-20241224163250288" style="zoom:80%;" />

#### 搭建哨兵集群

[参考教程](https://catpaws.top/3e4345d9/#搭建哨兵集群)



#### RedisTemplate的哨兵模式

在Sentinel集群监管下的Redis主从集群，其节点会因为自动故障转移而发生变化，Redis的客户端必须感知这种变化，及时更新连接信息。Spring的RedisTemplate底层利用lettuce实现了节点的感知和自动切换。

1）引入依赖

在项目的pom文件中引入依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```



2）配置Redis地址

然后在配置文件application.yml中指定redis的**sentinel**相关信息：

> 在集群模式下，主从结点的地址会发生变更，不能写死，只需指定哨兵的地址即可

```java
spring:
  redis:
    sentinel:
      master: mymaster
      nodes:
        - 192.168.150.101:27001
        - 192.168.150.101:27002
        - 192.168.150.101:27003
```



3）配置读写分离

在配置类，添加一个新的bean，指定读写策略

```java
@Bean
public LettuceClientConfigurationBuilderCustomizer clientConfigurationBuilderCustomizer(){
    return clientConfigurationBuilder -> clientConfigurationBuilder.readFrom(ReadFrom.REPLICA_PREFERRED);
}
```



这个bean中配置的就是读写策略，包括四种：

- MASTER：从主节点读取
- MASTER_PREFERRED：优先从master节点读取，master不可用才读取replica
- REPLICA：从slave（replica）节点读取
- REPLICA _PREFERRED：优先从slave（replica）节点读取，所有的slave都不可用才读取master

### 1.4、Redis分片集群

#### 搭建分片集群

[参考教程](https://catpaws.top/3e4345d9/#搭建分片集群)

#### 散列插槽

Redis会把每一个master节点映射到0~16383共**16384**个插槽（hash slot）上，查看集群信息时就能看到：

![集群建成时显示的信息](https://gitee.com/cmyk359/img/raw/master/img/image-20241226104103728-2024-12-2610:41:17.png)

连接到某节点使用`cluster nodes`查看集群节点信息

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241226104236033-2024-12-2610:42:37.png" alt="使用命令查看集群结点信息" style="zoom:80%;" />





**<u>数据key不是与节点绑定，而是与插槽绑定。</u>**

> ‌**Redis的数据与插槽绑定而不是与节点绑定，主要是为了实现集群的动态伸缩和高可用性。**‌
>
> 详细来说，与插槽绑定相比，与节点绑定存在明显的局限性。如果数据与特定节点绑定，那么一旦该节点出现故障或需要扩容，数据的迁移和重新分配将变得非常复杂和耗时。而与插槽绑定则不同，插槽可以灵活地映射到不同的节点上。当某个节点出现故障或需要扩容时，<u>只需将相关插槽重新映射到其他健康的节点上即可，无需大规模的数据迁移‌</u>。
>
> 此外，与插槽绑定还使得Redis集群能够更轻松地实现数据的均衡分布。通过散列插槽的方式，可以将数据均匀地分散到集群中的各个节点上，从而避免某些节点过载或闲置的情况‌。这种均衡分布不仅提高了集群的整体性能，还增强了集群的可扩展性和灵活性‌

redis会根据key的有效部分计算插槽值，分两种情况：

- key中包含"{}"，且“{}”中至少包含1个字符，“{}”中的部分是有效部分
- key中不包含“{}”，整个key都是有效部分

在分片集群模式下，要获得/设置一个key对应的数据，会首先根据key的有效部分计算哈希值，对16384取余，余数作为插槽，定位到该插槽所在的节点，重定向到目标节点，在该节点上执行数据存入或读取操作。

![image-20241226105823747](https://gitee.com/cmyk359/img/raw/master/img/image-20241226105823747-2024-12-2610:58:25.png)

如上，在7001节点执行`set a 111`命令，a对应的插槽值为15495，该插槽分配给了7003节点，故先重定向到7003节点，再执行该命令。此时在7003结点上执行`set num 123`命令，执行过程相同。在7001结点读取a对应的值，会先切换到7003节点再返回a的值。

> 在分片集群模式下连接到某个节点时，在命令中一定要加上`-c`参数，如
>
> ```bash
> redis-cli -c -p 7001
> ```



如何将同一类数据固定的保存在同一个Redis实例？

- 这一类数据使用相同的有效部分，例如key都以{typeId}为前缀

#### 集群伸缩

redis-cli --cluster提供了很多操作集群的命令，可以新增节点，删除节点，重新分配插槽等，可以通过`redis-cli --cluster help`命令查看：

![image-20241226110615386](https://gitee.com/cmyk359/img/raw/master/img/image-20241226110615386-2024-12-2611:06:16.png)



需求：向集群中添加一个新的master节点，并向其中存储 num = 10

- 启动一个新的redis实例，端口为7004
- 添加7004到之前的集群，并作为一个master节点
- 给7004节点<u>分配插槽</u>，使得num这个key可以存储到7004实例

1、创建新的redis实例

```bash
#创建一个文件夹
mkdir 7004
#拷贝配置文件
cp redis.conf /7004
#修改配置文件 将其中初始的所有6379改为7004
sed /s/6379/7004/g 7004/redis.conf
#启动
redis-server 7004/redis.conf
```

![image-20241226112143003](https://gitee.com/cmyk359/img/raw/master/img/image-20241226112143003-2024-12-2611:21:44.png)

2、添加新结点到Redis集群

通过`redis-cli --cluset help`命令查看集群相关操作，其中有关添加新节点的命令如下

```bash
 add-node       new_host:new_port existing_host:existing_port #新节点地址和端口，集群中某节点的地址和端口（将新节点的信息通过它通知给其他节点）
                 --cluster-slave   #设置为slave节点，默认为master节点
                 --cluster-master-id <arg> #对应master的id
```

将7004节点加入集群：

```bash
redis-cli --cluster add-node 192.168.181.100:7004 192.168.181.100:7001
```

![image-20241226113344409](https://gitee.com/cmyk359/img/raw/master/img/image-20241226113344409-2024-12-2611:33:45.png)

3、转移插槽

num的插槽值为2765，要将num这个key移到7004节点，只需将前2766个插槽移到7004节点。

![num的插槽值为2765](https://gitee.com/cmyk359/img/raw/master/img/image-20241226113557285-2024-12-2611:36:02.png)

集群中插槽转移的命令如下，

```bash
reshard        <host:port> or <host> <port> - separated by either colon or space
                 --cluster-from <arg>
                 --cluster-to <arg>
                 --cluster-slots <arg>
                 --cluster-yes
                 --cluster-timeout <arg>
                 --cluster-pipeline <arg>
                 --cluster-replace
```

使用`redis-cli --cluster reshard 192.168.181.100:7004`采用交互式方式输入参数。

![image-20241226120318618](https://gitee.com/cmyk359/img/raw/master/img/image-20241226120318618-2024-12-2612:03:48.png)

4、在7004结点上读取num值

![image-20241226120412193](https://gitee.com/cmyk359/img/raw/master/img/image-20241226120412193-2024-12-2612:04:13.png)

> 此时若要删除7004节点，需要先将分配给该结点的插槽转移到其他节点后再删除。

#### 故障转移

集群的初始状态如下，其中7001、7002、7003都是master，计划让7002宕机。

![image-20241226124827478](https://gitee.com/cmyk359/img/raw/master/img/image-20241226124827478-2024-12-2612:48:29.png)

##### 自动故障转移

执行`redis-cli -p 7002 shutdown`让7002节宕机，通过`watch redis-cli -p 7001 cluster nodes`监视集群节点的情况。

1）首先是该实例与其它实例失去连接

2）然后是疑似宕机：

![8b80a1c09i77259f06581dc277354178](https://gitee.com/cmyk359/img/raw/master/img/8b80a1c09i77259f06581dc277354178-2024-12-2612:47:21.jpg)

3）最后是确定下线，自动提升一个slave为新的master：

![image-20241226125056817](https://gitee.com/cmyk359/img/raw/master/img/image-20241226125056817-2024-12-2612:50:58.png)

4）当7002再次启动，就会变为一个slave节点了，自动完成主从切换

![7f4b21650k45c7f367c97946638748d2](https://gitee.com/cmyk359/img/raw/master/img/7f4b21650k45c7f367c97946638748d2-2024-12-2612:52:06.jpg)

##### 手动故障转移（数据迁移）

利用`cluster failover`命令可以手动让集群中的某个master宕机，切换到执行cluster failover命令的这个**slave节点**，实现无感知的数据迁移。其流程如下：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241226125548348-2024-12-2612:55:49.png" alt="image-20241226125548348" style="zoom:80%;" />

手动的Failover支持三种不同模式：

- 缺省：默认的流程，如图1~6步
- force：省略了对offset的一致性校验
- takeover：直接执行第5步，忽略数据一致性、忽略master状态和其它master的意见



需求：在7002这个slave节点执行手动故障转移，重新夺回master地位

步骤如下：

1）利用redis-cli连接7002这个节点

2）执行cluster failover命令

![image-20241226130403702](https://gitee.com/cmyk359/img/raw/master/img/image-20241226130403702-2024-12-2613:04:05.png)

#### RedisTemplate访问分片集群

RedisTemplate底层同样基于lettuce实现了分片集群的支持，而使用的步骤与哨兵模式基本一致：

1）引入redis的starter依赖

2）配置分片集群地址

3）配置读写分离

与哨兵模式相比，其中只有分片集群的配置方式略有差异，如下：

```yaml
spring:
  redis:
    cluster:
      nodes:  #指定分片集群的每一个节点信息
        - 192.168.150.101:7001
        - 192.168.150.101:7002
        - 192.168.150.101:7003
        - 192.168.150.101:8001
        - 192.168.150.101:8002
        - 192.168.150.101:8003
```

## 二、多级缓存

### 2.1、什么是多级缓存

传统的缓存策略一般是请求到达Tomcat后，先查询Redis，如果未命中则查询数据库，如图：

![image-20210821075259137](https://gitee.com/cmyk359/img/raw/master/img/image-20210821075259137-2024-12-2614:46:17.png)

存在下面的问题：

•请求要经过Tomcat处理，Tomcat的性能成为整个系统的瓶颈

•Redis缓存失效时，会对数据库产生冲击



多级缓存就是充分利用请求处理的每个环节，分别添加缓存，减轻Tomcat压力，提升服务性能：

- 浏览器访问静态资源时，优先读取浏览器本地缓存
- 访问非静态资源（ajax查询数据）时，访问服务端
- 请求到达Nginx后，优先读取Nginx本地缓存
- 如果Nginx本地缓存未命中，则去直接查询Redis（不经过Tomcat）
- 如果Redis查询未命中，则查询Tomcat
- 请求进入Tomcat后，优先查询JVM进程缓存
- 如果JVM进程缓存未命中，则查询数据库

![image-20210821075558137](https://gitee.com/cmyk359/img/raw/master/img/image-20210821075558137-2024-12-2614:47:22.png)

在多级缓存架构中，Nginx内部需要编写本地缓存查询、Redis查询、Tomcat查询的业务逻辑，因此这样的nginx服务不再是一个**反向代理服务器**，而是一个编写**业务的Web服务器了**。

因此这样的业务Nginx服务也需要搭建集群来提高并发，再有专门的nginx服务来做反向代理。同时，Tomcat服务将来也会部署为集群模式

![image-20210821080954947](https://gitee.com/cmyk359/img/raw/master/img/image-20210821080954947-2024-12-2614:50:15.png)

可见，多级缓存的关键有两个：

- 一个是在nginx中编写业务，实现nginx本地缓存、对Redis和Tomcat的查询

- 另一个就是在Tomcat中实现JVM进程缓存

其中Nginx编程则会用到`OpenResty`框架结合Lua这样的语言。





### 2.2、导入案例

[参考视频](https://www.bilibili.com/video/BV1cr4y1671t?vd_source=51d78ede0a0127d1839d6abf9204d1ee&spm_id_from=333.788.videopod.episodes&p=115)

[后端文件](https://pan.baidu.com/s/1189u6u4icQYHg_9_7ovWmA?pwd=eh11&_at_=1735005945139#list/path=%2Fsharelink3232509500-235828228909890%2F7%E3%80%81Redis%E5%85%A5%E9%97%A8%E5%88%B0%E5%AE%9E%E6%88%98%E6%95%99%E7%A8%8B%2FRedis-%E7%AC%94%E8%AE%B0%E8%B5%84%E6%96%99%2F03-%E9%AB%98%E7%BA%A7%E7%AF%87%2F%E8%B5%84%E6%96%99%2Fitem-service&parentPath=%2Fsharelink3232509500-235828228909890)

[前端文件](https://pan.baidu.com/s/1189u6u4icQYHg_9_7ovWmA?pwd=eh11&_at_=1735005945139#list/path=%2Fsharelink3232509500-235828228909890%2F7%E3%80%81Redis%E5%85%A5%E9%97%A8%E5%88%B0%E5%AE%9E%E6%88%98%E6%95%99%E7%A8%8B%2FRedis-%E7%AC%94%E8%AE%B0%E8%B5%84%E6%96%99%2F03-%E9%AB%98%E7%BA%A7%E7%AF%87%2F%E8%B5%84%E6%96%99%2Fnginx-1.18.0&parentPath=%2Fsharelink3232509500-235828228909890)

### 2.3、JVM进程缓存

#### 初识Caffeine

缓存在日常开发中启动至关重要的作用，由于是存储在内存中，数据的读取速度是非常快的，能大量减少对数据库的访问，减x少数据库的压力。我们把缓存分为两类：

- 分布式缓存，例如Redis：
  - 优点：存储容量更大、可靠性更好、可以在集群间共享
  - 缺点：访问缓存有网络开销
  - 场景：缓存数据量较大、可靠性要求较高、需要在集群间共享
- 进程本地缓存，例如HashMap、GuavaCache：
  - 优点：读取本地内存，没有网络开销，速度更快
  - 缺点：存储容量有限、可靠性较低、无法共享
  - 场景：性能要求较高，缓存数据量较小

**Caffeine**是一个基于Java8开发的，提供了近乎最佳命中率的高性能的本地缓存库。目前Spring内部的缓存使用的就是Caffeine。GitHub地址：https://github.com/ben-manes/caffeine

Caffeine的性能非常好，下图是官方给出的性能对比：

![image-20210821081826399](https://gitee.com/cmyk359/img/raw/master/img/image-20210821081826399-2024-12-2618:34:57.png)

缓存API基本使用

```java
@Test
void testBasicOps() {
    // 构建cache对象
    Cache<String, String> cache = Caffeine.newBuilder().build();

    // 存数据
    cache.put("gf", "迪丽热巴");

    // 取数据
    String gf = cache.getIfPresent("gf");
    System.out.println("gf = " + gf);

    // 取数据，包含两个参数：
    // 参数一：缓存的key
    // 参数二：Lambda表达式，表达式参数就是缓存的key，方法体是查询数据库的逻辑
    // 优先根据key查询JVM缓存，如果未命中，则执行参数二的Lambda表达式
    String defaultGF = cache.get("defaultGF", key -> {
        // 根据key去数据库查询数据
        return "柳岩";
    });
    System.out.println("defaultGF = " + defaultGF);
}
```



Caffeine既然是缓存的一种，肯定需要有缓存的清除策略，不然的话内存总会有耗尽的时候。

Caffeine提供了三种缓存驱逐策略：

- **基于容量**：设置缓存的数量上限

  ```java
  // 创建缓存对象
  Cache<String, String> cache = Caffeine.newBuilder()
      .maximumSize(1) // 设置缓存大小上限为 1
      .build();
  ```

- **基于时间**：设置缓存的有效时间

  ```java
  // 创建缓存对象
  Cache<String, String> cache = Caffeine.newBuilder()
      // 设置缓存有效期为 10 秒，从最后一次写入开始计时 
      .expireAfterWrite(Duration.ofSeconds(10)) 
      .build();
  
  ```

- **基于引用**：设置缓存为软引用或弱引用，利用GC来回收缓存数据。性能较差，不建议使用。



> **注意**：在默认情况下，当一个缓存元素过期的时候，Caffeine不会自动立即将其清理和驱逐。而是在一次读或写操作后，或者在空闲时间完成对失效数据的驱逐。

#### 实现JVM进程缓存

利用Caffeine实现下列需求：

- 给根据id查询商品的业务添加缓存，缓存未命中时查询数据库
- 给根据id查询商品库存的业务添加缓存，缓存未命中时查询数据库
- 缓存初始大小为100
- 缓存上限为10000

首先，我们需要定义两个Caffeine的缓存对象，分别保存商品、库存的缓存数据。

在item-service的`com.heima.item.config`包下定义`CaffeineConfig`类：

```java
package com.heima.item.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.heima.item.pojo.Item;
import com.heima.item.pojo.ItemStock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CaffeineConfig {

    @Bean
    public Cache<Long, Item> itemCache(){
        return Caffeine.newBuilder()
                .initialCapacity(100)
                .maximumSize(10_000)
                .build();
    }

    @Bean
    public Cache<Long, ItemStock> stockCache(){
        return Caffeine.newBuilder()
                .initialCapacity(100)
                .maximumSize(10_000)
                .build();
    }
}
```

修改item-service中的`com.heima.item.web`包下的ItemController类，添加缓存逻辑

```java
@RestController
@RequestMapping("item")
public class ItemController {

    @Autowired
    private IItemService itemService;
    @Autowired
    private IItemStockService stockService;

    @Autowired
    private Cache<Long, Item> itemCache;
    @Autowired
    private Cache<Long, ItemStock> stockCache;
    
    // ...其它略
    
    @GetMapping("/{id}")
    public Item findById(@PathVariable("id") Long id) {
        return itemCache.get(id, key -> itemService.query()
                .ne("status", 3).eq("id", key)
                .one()
        );
    }

    @GetMapping("/stock/{id}")
    public ItemStock findStockById(@PathVariable("id") Long id) {
        return stockCache.get(id, key -> stockService.getById(key));
    }
}
```



### 2.4、Lua入门

Nginx编程需要用到Lua语言，因此我们必须先入门Lua的基本语法。

#### 初识Lua

Lua 是一种轻量小巧的脚本语言，用标准C语言编写并以源代码形式开放， 其设计目的是为了嵌入应用程序中，从而为应用程序提供灵活的扩展和定制功能。[官网](https://www.lua.org/)

![image-20210821091437975](https://gitee.com/cmyk359/img/raw/master/img/image-20210821091437975-2024-12-2619:13:40.png)

Lua经常嵌入到C语言开发的程序中，例如游戏开发、游戏插件等。

Nginx本身也是C语言开发，因此也允许基于Lua做拓展。

[语法参考](https://www.runoob.com/lua/lua-tutorial.html)

#### Hello World

CentOS7默认已经安装了Lua语言环境，所以可以直接运行Lua代码。

在Linux虚拟机的任意目录下，新建一个hello.lua文件

```bash
touch hello.lua
```

`vi hello.lua`向文件中添加

```lua
print("Hello World!")  
```

运行该文件

```bash
[root@ai100 tmp]# lua hello.lua
Hello World!
```



#### 变量

学习任何语言必然离不开变量，而变量的声明必须先知道数据的类型。



Lua中支持的常见数据类型包括：

![image-20210821091835406](https://gitee.com/cmyk359/img/raw/master/img/image-20210821091835406-2024-12-2619:20:37.png)

另外，Lua提供了type()函数来判断一个变量的数据类型：

```bash
[root@ai100 tmp]# lua
Lua 5.1.4  Copyright (C) 1994-2008 Lua.org, PUC-Rio
> print(type("Hello World!"))
string
> print(type(10*.314))
number
```

> 控制台输入 `lua`，进入lua的命令行模式

Lua声明变量的时候无需指定数据类型，而是用local来声明变量为**局部变量**：

```lua
-- 声明字符串，可以用单引号或双引号，
local str = 'hello'
-- 字符串拼接可以使用 ..
local str2 = 'hello' .. 'world'
-- 声明数字
local num = 21
-- 声明布尔类型
local flag = true
```



Lua中的table类型既可以作为数组，又可以作为Java中的map来使用。数组就是特殊的table，key是数组角标而已：

```lua
-- 声明数组 ，key为角标的 table
local arr = {'java', 'python', 'lua'}
-- 声明table，类似java的map
local map =  {name='Jack', age=21}
```

Lua中的数组角标是从1开始，访问的时候与Java中类似：

> lua数组的角标从1开始

```lua
-- 访问数组，lua数组的角标从1开始
print(arr[1])
```

Lua中的table可以用key来访问：

```lua
-- 访问table
print(map['name'])
print(map.name)
```



#### 循环

**while循环**

语法如下

```lua
while(condition)
do
   statements
end
```

**statements(循环体语句)** 可以是一条或多条语句，**condition(条件)** 可以是任意表达式，在 **condition(条件)** 为 true 时执行循环体语句。





Lua 编程语言中 for语句有两大类：：

- 数值for循环

- 泛型for循环

  

**数值for循环**

语法如下：

```lua
for var=exp1,exp2,exp3 do  
    <执行体>  
end  
```

var 从 exp1 变化到 exp2，每次变化以 exp3 为步长递增 var，并执行一次 **"执行体"**。exp3 是可选的，如果不指定，**默认为1**。

```lua
for i=10,1,-1 do
    print(i)
end
-- 输出 10 9 8  7  6 5 4 3 2 1
```

for的三个表达式在循环开始前一次性求值，以后不再进行求值。比如下面f(x)只会在循环开始前执行一次，其结果用在后面的循环中。

```lua
function f(x)  
    print("function")  
    return x*2   
end  
for i=1,f(5) do 
    print(i)  
end
-- 输出 function 1 2 3 4 5 6 7 8 9 10
```



**泛型for循环**

泛型 for 循环通过一个迭代器函数来遍历所有值，类似 java 中的 foreach 语句。

遍历数组型table

```lua
-- 声明数组 key为索引的 table
local arr = {'java', 'python', 'lua'}
-- 遍历数组
for index,value in ipairs(arr) do
    print(index, value) 
end
```



遍历普通table

```lua
-- 声明map，也就是table
local map = {name='Jack', age=21}
-- 遍历table
for key,value in pairs(map) do
   print(key, value) 
end
```

> 注：在lua中pairs与ipairs两个迭代器的用法相近，但仍有区别：
>
> pairs可以遍历表中所有的key，并且除了迭代器本身以及遍历表本身还可以返回nil;
>
> 但是ipairs则不能返回nil,只能返回数字0，如果遇到nil则退出。ipairs 在迭代过程中是会直接跳过所有手动设定key值的变量。



#### 条件控制

类似Java的条件控制，例如if、else语法：

```lua
if(布尔表达式)
then
   --[ 布尔表达式为 true 时执行该语句块 --]
else
   --[ 布尔表达式为 false 时执行该语句块 --]
end

```



与java不同，布尔表达式中的逻辑运算是基于英文单词：

![image-20210821092657918](https://gitee.com/cmyk359/img/raw/master/img/image-20210821092657918-2024-12-2619:47:35.png)



#### 函数

定义函数的语法：

```lua
function 函数名( argument1, argument2..., argumentn)
    -- 函数体
    return 返回值
end
```



例如，定义一个函数，用来打印数组：

```lua
function printArr(arr)
    for index, value in ipairs(arr) do
        print(value)
    end
end
```



### 2.5、实现多级缓存

多级缓存的实现离不开Nginx编程，而Nginx编程又离不开**OpenResty**。

#### 安装OpenResty

OpenResty® 是一个基于 Nginx的高性能 Web 平台，用于方便地搭建能够处理超高并发、扩展性极高的动态 Web 应用、Web 服务和动态网关。具备下列特点：

- 具备Nginx的完整功能
- 基于Lua语言进行扩展，集成了大量精良的 Lua 库、第三方模块
- 允许使用Lua**自定义业务逻辑**、**自定义库**

[官方网站](https://openresty.org/cn/)

![image-20210821092902946](https://gitee.com/cmyk359/img/raw/master/img/image-20210821092902946-2024-12-2621:38:27.png)

[安装教程](https://catpaws.top/50a9e6bc/)

安装后的所在目录：`/usr/local/openresty`

#### OpenResty快速入门

多级缓存架构如图：

![yeVDlwtfMx](https://gitee.com/cmyk359/img/raw/master/img/yeVDlwtfMx-2024-12-2622:06:36.png)



其中：

- windows上的nginx用来做反向代理服务，将前端的查询商品的ajax请求代理到OpenResty集群
- OpenResty集群用来编写多级缓存业务

##### 反向代理流程

现在，商品详情页使用的是假的商品数据。不过在浏览器中，可以看到页面有发起ajax请求查询真实商品数据。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241226220907274-2024-12-2622:09:08.png" alt="image-20241226220907274" style="zoom:67%;" />

在Windows的nginx中配置反向代理逻辑，将以`/api`为前缀的请求反向代理给OpenRestry集群处理

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241226221349893-2024-12-2622:13:57.png" alt="image-20241226221349893" style="zoom:67%;" />

##### OpenResty监听请求

OpenResty的很多功能都依赖于其目录下的Lua库，需要在nginx.conf中指定依赖库的目录，并导入依赖：

1）添加对OpenResty的Lua模块的加载

修改`/usr/local/openresty/nginx/conf/nginx.conf`文件，在其中的http下面，添加下面代码：

```nginx
#lua 模块
lua_package_path "/usr/local/openresty/lualib/?.lua;;";
#c模块     
lua_package_cpath "/usr/local/openresty/lualib/?.so;;";  
```



2）监听/api/item路径

修改`/usr/local/openresty/nginx/conf/nginx.conf`文件，在nginx.conf的server下面，添加对/api/item这个路径的监听：

```nginx
location  /api/item {
    # 默认的响应类型
    default_type application/json;
    # 响应结果由lua/item.lua文件来决定
    content_by_lua_file lua/item.lua;
}
```



> 这个监听，就类似于SpringMVC中的`@GetMapping("/api/item")`做路径映射。
>
> 而`content_by_lua_file lua/item.lua`则相当于调用item.lua这个文件，执行其中的业务，把结果返回给用户。相当于java中调用service。

##### 编写item.lua

在`/usr/loca/openresty/nginx`目录创建文件夹 `lua`，并在lua文件夹下新建文件 `item.lua`

```bash
[root@ai100 nginx]# mkdir lua
[root@ai100 nginx]# touch lua/item.lua
```

item.lua中，利用`ngx.say()`函数返回数据到Response中，**此处暂时写入假数据，之后在lua文件中向reids和Tomcat发起请求获取真实数据**。修改其中商品价格为19900

```lua
ngx.say('{"id":10001,"name":"SALSA AIR","title":"RIMOWA 21寸托运箱拉杆箱 SALSA AIR系列果绿色 820.70.36.4","price":19900,"image":"https://m.360buyimg.com/mobilecms/s720x720_jfs/t6934/364/1195375010/84676/e9f2c55f/597ece38N0ddcbc77.jpg!q70.jpg.webp","category":"拉杆箱","brand":"RIMOWA","spec":"","status":1,"createTime":"2019-04-30T16:00:00.000+00:00","updateTime":"2019-04-30T16:00:00.000+00:00","stock":2999,"sold":31290}')
```

重新加载配置

```bash
nginx -s reload
```

刷新商品页面即可查看效果

![image-20241226222109001](https://gitee.com/cmyk359/img/raw/master/img/image-20241226222109001-2024-12-2622:21:57.png)

#### 请求参数处理

OpenResty中提供了一些API用来获取不同类型的前端请求参数：

![image-20210821101433528](https://gitee.com/cmyk359/img/raw/master/img/image-20210821101433528-2024-12-2622:25:47.png)

前端请求路径为：`http://localhost:8088/api/item/10001`，其中商品id是以路径参数传递的，因此可以利用正则表达式匹配的方式来获取ID。

修改`/usr/loca/openresty/nginx/nginx.conf`文件中监听/api/item的代码，利用正则表达式获取ID

```properties
location ~ /api/item/(\d+) {
    # 默认的响应类型
    default_type application/json;
    # 响应结果由lua/item.lua文件来决定
    content_by_lua_file lua/item.lua;
}
```

在`item.lua`中获取商品id

```lua
-- 获取商品id
local id = ngx.var[1]
```

#### 查询TomCat

拿到商品ID后，本应去缓存中查询商品信息，不过目前我们还未建立nginx、redis缓存。因此，这里我们先根据商品id去tomcat查询商品信息。

![image-20210821111023255](https://gitee.com/cmyk359/img/raw/master/img/image-20210821111023255-2024-12-2721:29:43.png)

##### 发送http请求的API

nginx提供了内部API用以发送http请求：

```lua
local resp = ngx.location.capture("/path",{
    method = ngx.HTTP_GET,   -- 请求方式
    args = {a=1,b=2},  -- get方式传参数
})
```

返回的响应内容包括：

- resp.status：响应状态码
- resp.header：响应头，是一个table
- resp.body：响应体，就是响应数据

**注意：这里的path是路径，并不包含IP和端口。这个请求会被nginx内部的server监听并处理。**

**为了让请求发送到Tomcat服务器，所以还需要编写一个server来对这个路径做反向代理**：

```nginx
 location /path {
     # 这里是windows电脑的ip和Java服务端口，需要确保windows防火墙处于关闭状态
     proxy_pass http://192.168.181.1:8081; 
 }
```



原理如图：

![image-20210821104149061](https://gitee.com/cmyk359/img/raw/master/img/image-20210821104149061-2024-12-2622:33:57.png)

##### 封装http工具

封装一个发送Http请求的工具，基于`ngx.location.capture`来实现查询tomcat

1）添加反向代理，到windows的Java服务

因为item-service中的接口都是/item开头，所以需要监听/item路径，代理到windows上的tomcat服务。

修改 `/usr/local/openresty/nginx/conf/nginx.conf`文件，添加一个location：

```nginx
location /item {
    proxy_pass http://192.168.181.1:8081;
}
```

之后只要使用`ngx.location.capture("/item")`，就一定能发送请求到windows的tomcat服务。

2）封装工具类

在`/usr/local/openresty/lualib`目录下，新建一个common.lua文件，编写请求代码

```bash
vi /usr/local/openresty/lualib/common.lua
```

```lua
-- 封装函数，发送http请求，并解析响应
local function read_http(path, params)
    local resp = ngx.location.capture(path,{
        method = ngx.HTTP_GET,  -- 处理GET请求
        args = params,
    })
    if not resp then
        -- 记录错误信息，返回404
        ngx.log(ngx.ERR, "http请求查询失败, path: ", path , ", args: ", args)
        ngx.exit(404)
    end
    return resp.body
end
-- 将方法导出
local _M = {  
    read_http = read_http
}  
return _M
```

> 这个工具将read_http函数封装到_M这个**table类型**的变量中，并且返回，这类似于导出。使用的时候，可以利用`require('common')`来导入该函数库，这里的common是函数库的文件名。
>
> lua的工具类都存放在`/usr/local/openresty/lualib`路径下

##### 实现商品查询

修改`/usr/local/openresty/lua/item.lua`文件，利用刚刚封装的函数库实现对tomcat的查询

```
-- 引入自定义common工具模块，返回值是common中返回的 _M
local common = require("common")
-- 导入cjson工具包
local cjson = require("cjson")


-- 从common中获取read_quest函数
local read_quest = common.read_quest

-- 获取路径参数
local id = ngx.var[1]

-- 根据id查询商品
local itemJson = read_quest("/item/" .. id, nil)
-- 根据id查询商品库存
local itemStockJSON = read_http("/item/stock/".. id, nil)

-- 查询到的是商品、库存的json格式数据，我们需要将两部分数据组装，需要用到JSON处理函数库。
-- 将JSON转化为lua的table进行数据拼接
local item = cjson.decode(itemJson)
local itemStock = cjson.decode(itemStockJSON)

--数据拼接
item.stock = itemStock.stock
item.sold = itemStock.sold

-- 把item序列化为json 返回结果
ngx.say(cjson.endcode(item))
```



> OpenResty提供了一个**cjson**的模块用来处理JSON的序列化和反序列化，使用方法如下：
>
> ```lua
> -- 引入cjson模块
> local cjson = require "cjson" 
> 
> -- 序列化，使用encode方法
> local obj = {
>     name = 'jack',
>     age = 21
> }
> local json = cjson.encode(obj) -- 把 table 序列化为 json
> 
> -- 反序列化，使用decode方法
> local json = '{"name": "jack", "age": 21}'
> local obj = cjson.decode(json) -- 反序列化 json为 table
> print(obj.name)
> 
> ```
>
> 

#### Tomcat集群的负载均衡（基于ID的负载均衡）

OpenResty对tomcat集群负载均衡的默认策略是**轮询模式**。当查询/item/10001时假设访问的是8081端口的tomcat服务，查询完成会在该服务器内部建立JVM缓存，而当第二次查询时，由于是轮询所以会去访问其他端口的服务，而其他服务器内部没有该商品的JVM缓存，需要查询数据库，导致之前的JVM缓存失效，并且在多个服务器建立冗余的缓存。

如果能让同一个商品，每次查询时都访问同一个tomcat服务，那么JVM缓存就一定能生效了。

也就是说，我们需要根据**商品id**做负载均衡，而不是轮询。

##### 原理

nginx提供了**基于请求路径做负载均衡**的算法：

nginx根据请求路径做hash运算，把得到的数值对tomcat服务的数量取余，余数是几，就访问第几个服务，实现负载均衡。只要id不变，每次hash运算结果也不会变，那就可以保证同一个商品，一直访问同一个tomcat服务，确保JVM缓存生效。

##### 实现

修改`/usr/local/openresty/nginx/conf/nginx.conf`文件，实现基于ID做负载均衡。

首先，定义tomcat集群，并设置基于路径做负载均衡：

```nginx 
upstream tomcat-cluster {
    hash $request_uri;  #设置负载均衡策略
    server 192.168.150.1:8081;
    server 192.168.150.1:8082;
}
```

然后，修改对tomcat服务的反向代理，目标指向tomcat集群：

```nginx
location /item {
    proxy_pass http://tomcat-cluster;
}
```

重新加载OpenResty

```sh
nginx -s reload
```

#### 添加Redis缓存

![image-20210821113340111](https://gitee.com/cmyk359/img/raw/master/img/image-20210821113340111-2024-12-2721:29:07.png)

##### 缓存预热



**冷启动**：服务刚刚启动时，Redis中并没有缓存，如果所有商品数据都在第一次查询时添加缓存，可能会给数据库带来较大压力。

**缓存预热**：在实际开发中，可以利用大数据统计用户访问的热点数据，在项目启动时将这些热点数据提前查询并保存到Redis中。

1、利用Docker安装Redis

2、在item-service服务中引入Redis依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

3、配置redis地址

```properties
spring:
	redis:
   		host: 192.168.181.100
    	port: 6379
    	password: liuhao123
```

4、编写初始化类

缓存预热需要在项目启动时完成，并且必须是拿到RedisTemplate之后。

> 这里利用`InitializingBean`接口来实现，该接口定义了一个方法`afterPropertiesSet()`，<u>**该方法在Bean的所有属性被Spring容器设置之后自动被调用**</u>。这允许开发者在Bean的初始化阶段执行一些必要的操作，如检查配置的正确性、初始化资源、建立数据库连接等。

> `ObjectMapper`是Jackson库中的一个核心类，它提供了Java对象和JSON数据之间转换的功能。
>
> 序列化：`writeValueAsString(xxx)`
>
> 反序列化：`readValue(xxx)`

```java
@Component
public class RedisHandler implements InitializingBean {
    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    @Autowired
    private IItemService iItemService;
    @Autowired
    private IItemStockService iItemStockService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void afterPropertiesSet() throws Exception {
        //初始化缓存
        //1、查询数据库
        List<Item> itemList = iItemService.list();
        List<ItemStock> stockList = iItemStockService.list();

        //2、存入redis
        for (Item item : itemList) {
            //将item对象序列化为JSON字符串
            String itemJson = objectMapper.writeValueAsString(item);
            stringRedisTemplate.opsForValue().set("item:id"+item.getId(),itemJson);
        }
        for (ItemStock itemStock : stockList) {
            //将itemStock对象序列化为JSON字符串
            String stockJson = objectMapper.writeValueAsString(itemStock);
            stringRedisTemplate.opsForValue()
                .set("item:stock:id"+itemStock.getId(),stockJson);
        }
    }
}
```

##### 查询redis缓存

OpenResty提供了操作Redis的模块，我们只要引入该模块就能直接使用：

1. 引入Redis模块，并初始化Redis对象

   ```lua
   -- 导入redis
   local redis = require("resty.redis")
   -- 初始化redis对象
   local red = redis:new()  -- 通过 ：调用方法
   --设置redis超时时间
   red:set_timeouts(1000,1000,1000)
   ```

2. 从连接池获取redis连接

   ```lua
   local ip = "127.0.0.1"  
   local port = 6379
   local ok, err = red:connect(ip,port)
   if not ok then
       ngx.log(ngx.ERR, "连接redis失败",err)
       return nil
   end
   
   --连接后验证密码
   -- 使用 red:get_reused_times 方法可以得知当前连接被使用的次数
   local count, err = red:get_reused_times()
   if 0 == count then ----新建连接，需要认证密码
       ok, err = red:auth("liu123")
       if not ok then
           ngx.say("failed to auth: ", err)
           return
       end
   elseif err then  ----从连接池中获取连接，无需再次认证密码
       ngx.say("failed to get reused times: ", err)
       return
   end
   ```

3. 操作Redis：`red:xxx()`。 其中对各种数据类型的操作方法与在redis中一致，如对String类型操作的 `set` `get`方法，对List操作的`lpush` `rpop`等等，

   ```lua
   -- 设置字符串
   local ok, err = red:set("string_key", "string_value")
   if not ok then
       ngx.say("failed to set string: ", err)
       return
   end
    
   -- 获取字符串
   local res, err = red:get("string_key")
   if not res then
       ngx.say("failed to get string: ", err)
       return
   end
    
   ngx.say("got string: ", res)
    
   -- 设置哈希
   local ok, err = red:hset("hash_key", "field1", "value1")
   if not ok then
       ngx.say("failed to set hash: ", err)
       return
   end
    
   -- 获取哈希字段
   local res, err = red:hget("hash_key", "field1")
   if not res then
       ngx.say("failed to get hash field: ", err)
       return
   end
    
   ngx.say("got hash field: ", res)
    
   -- 设置列表
   local ok, err = red:rpush("list_key", "value1")
   if not ok then
       ngx.say("failed to set list: ", err)
       return
   end
    
   -- 获取列表
   local res, err = red:lrange("list_key", 0, -1)
   if not res then
       ngx.say("failed to get list: ", err)
       return
   end
    
   ngx.say("got list: ", table.concat(res, ", "))
    
   -- 设置集合
   local ok, err = red:sadd("set_key", "value1")
   if not ok then
       ngx.say("failed to set set: ", err)
       return
   end
    
   -- 获取集合
   local res, err = red:smembers("set_key")
   if not res then
       ngx.say("failed to get set: ", err)
       return
   end
    
   ngx.say("got set: ", table.concat(res, ", "))
    
   -- 设置有序集合
   local ok, err = red:zadd("zset_key", 10, "value1")
   if not ok then
       ngx.say("failed to set zset: ", err)
       return
   end
    
   -- 获取有序集合
   local res, err = red:zrange("zset_key", 0, -1)
   if not res then
       ngx.say("failed to get zset: ", err)
       return
   end
    
   ngx.say("got zset: ", table.concat(res, ", "))
    
   ```

   

4. 关闭连接池。redis的连接是TCP连接，建立TCP连接需要三次握手，而释放TCP连接需要四次握手，耗时较长，应该将该TCP连接放入连接池进行复用。

   ```lua
   local function close_redis(red)  -- 封装成函数方便调用
       if not red then  
           return  
       end  
       --释放连接(连接池实现)  
       local pool_max_idle_time = 10000 --连接的最大空闲时间（毫秒），超出该时间还未被使用则断开该连接  
       local pool_size = 100 --连接池大小  
       local ok, err = red:set_keepalive(pool_max_idle_time, pool_size)  --将连接放回连接池中
       if not ok then  
           ngx.say("set keepalive error : ", err)  
       end
   end
   ```

   

将建立和释放redis连接，查询redis数据等操作封装到`common.lua`中方便调用

```lua
-- 导入redis
local redis = require('resty.redis')
-- 初始化redis
local red = redis:new()
red:set_timeouts(1000, 1000, 1000)

-- 关闭redis连接的工具方法，其实是放入连接池
local function close_redis(red)
    local pool_max_idle_time = 10000 -- 连接的空闲时间，单位是毫秒
    local pool_size = 100 --连接池大小
    local ok, err = red:set_keepalive(pool_max_idle_time, pool_size)
    if not ok then
        ngx.log(ngx.ERR, "放入redis连接池失败: ", err)
    end
end

-- 查询redis的方法 ip和port是redis地址，key是查询的key
local function read_redis(ip, port, key)
    -- 获取一个连接
    local ok, err = red:connect(ip, port)
    if not ok then
        ngx.log(ngx.ERR, "连接redis失败 : ", err)
        return nil
    end
    red.auth("liuhao123") --验证密码
    -- 查询redis
    local resp, err = red:get(key)
    -- 查询失败处理
    if not resp then
        ngx.log(ngx.ERR, "查询Redis失败: ", err, ", key = " , key)
    end
    --得到的数据为空处理
    if resp == ngx.null then
        resp = nil
        ngx.log(ngx.ERR, "查询Redis数据为空, key = ", key)
    end
    -- 归还redis连接
    close_redis(red) 
    return resp
end


-- 封装函数，发送http请求，并解析响应
local function read_http(path, params)
    local resp = ngx.location.capture(path,{
        method = ngx.HTTP_GET,
        args = params,
    })
    if not resp then
        -- 记录错误信息，返回404
        ngx.log(ngx.ERR, "http查询失败, path: ", path , ", args: ", args)
        ngx.exit(404)
    end
    return resp.body
end

-- 将方法导出
local _M = {  
    read_http = read_http,
    read_redis = read_redis
}  
return _M
```

修改`item.lua`实现对Reids查询。封装一个`read_data`函数，其中数据请求到达后先查询Reids，查询失败后再查Tomcat，将查询结果返回。

```lua
-- 引入common库中封装的函数
local common = require("common")
local read_redis = common.read_redis
local read_http = common.read_http
-- 导入cjson库
local cjson = require('cjson')


-- 封装查询函数
function read_data(key, path, params)
    -- 查询本地缓存
    local val = read_redis("127.0.0.1", 6379, key)
    -- 判断查询结果
    if not val then
        ngx.log(ngx.ERR, "redis查询失败，尝试查询http， key: ", key)
        -- redis查询失败，去查询http
        val = read_http(path, params)
    end
    -- 返回数据
    return val
end

-- 获取路径参数
local id = ngx.var[1]

-- 查询商品信息
local itemJSON = read_data("item:id:" .. id,  "/item/" .. id, nil)
-- 查询库存信息
local stockJSON = read_data("item:stock:id:" .. id, "/item/stock/" .. id, nil)

-- JSON转化为lua的table
local item = cjson.decode(itemJSON)
local stock = cjson.decode(stockJSON)
-- 组合数据
item.stock = stock.stock
item.sold = stock.sold

-- 把item序列化为json 返回结果
ngx.say(cjson.encode(item))
```

#### Nginx本地缓存

多级缓存的最后一环

![image-20210821114742950](https://gitee.com/cmyk359/img/raw/master/img/image-20210821114742950-2024-12-2721:28:27.png)

##### 本地缓存API

OpenResty为Nginx提供了`shard dict`的功能，可以**在一个nginx服务的多个worker之间共享数据**，实现缓存功能。

1. 开启共享字典，在nginx.conf的http下添加配置：

   ```nginx
   # 共享字典，也就是本地缓存，名称叫做：item_cache，大小150m
    lua_shared_dict item_cache 150m; 
   ```

2. 操作共享字典：

   ```lua
   -- 获取本地缓存对象
   local item_cache = ngx.shared.item_cache
   -- 存储, 指定key、value、过期时间，单位s，默认为0代表永不过期
   item_cache:set("key","value",100)
   -- 读取
   local val = item_cache:get('key')
   ```



##### 实现本地缓存查询

修改`/usr/local/openresty/lua/item.lua`文件，修改read_data查询函数，添加本地缓存逻辑：

- 优先查询本地缓存，未命中时再查询Redis、Tomcat
- 查询Redis或Tomcat成功后，将数据写入本地缓存，并设置有效期。商品基本信息，有效期30分钟；库存信息，有效期1分钟

```lua
--导入共享词典，本地缓存
local item_cache =  ngx.shared.item_cache

-- 封装查询函数
function read_data(key,expire, path, params)
    -- 查询本地缓存
    local val = item_cache.get(key)
    --判断本地缓存查询结果
    if not val then
        ngx.log(ngx.ERR,"本地缓存查询失败，尝试查询redis缓存，key:",key)
        --查询redis缓存
        val = read_redis("127.0.0.1", 6379, key)
        -- 判断redis查询结果
        if not val then
            ngx.log(ngx.ERR, "redis查询失败，尝试查询http， key: ", key)
            -- redis查询失败，去查询http
            val = read_http(path, params)
        end
    end
    --查询成功，将数据写入本地缓存
    item_cache.set(key,val,expire)
    -- 返回数据
    return val
end

--调用read_data时，需再传入一个参数：key的过期时间
```



### 2.6、缓存同步

大多数情况下，浏览器查询到的都是缓存数据，如果缓存数据与数据库数据存在较大差异，可能会产生比较严重的后果。

所以必须保证数据库数据、缓存数据的一致性，这就是缓存与数据库的同步。



#### 数据同步策略

缓存数据同步的常见方式有三种：

**设置有效期**：给缓存设置有效期，到期后自动删除。再次查询时更新

- 优势：简单、方便
- 缺点：时效性差，缓存过期之前可能不一致
- 场景：更新频率较低，时效性要求低的业务

**同步双写**：在修改数据库的同时，直接修改缓存

- 优势：时效性强，缓存与数据库强一致
- 缺点：有代码侵入，耦合度高；
- 场景：对一致性、时效性要求较高的缓存数据

**异步通知：**修改数据库时发送事件通知，相关服务监听到通知后修改缓存数据

- 优势：低耦合，可以同时通知多个缓存服务
- 缺点：时效性一般，可能存在中间不一致状态
- 场景：时效性要求一般，有多个服务需要同步



而异步实现又可以基于MQ或者Canal来实现：

1）基于MQ的异步通知：

![image-20210821115552327](https://gitee.com/cmyk359/img/raw/master/img/image-20210821115552327-2024-12-2721:56:52.png)

- 商品服务完成对数据的修改后，只需要发送一条消息到MQ中。
- 缓存服务监听MQ消息，然后完成对缓存的更新

依然有少量的代码侵入。



2）基于Canal的通知

![image-20210821115719363](https://gitee.com/cmyk359/img/raw/master/img/image-20210821115719363-2024-12-2721:56:50.png)

- 商品服务完成商品修改后，业务直接结束，没有任何代码侵入
- Canal监听MySQL变化，当发现变化后，立即通知缓存服务
- 缓存服务接收到canal通知，更新缓存

代码零侵入

#### 初识Canal

**Canal **译意为水道/管道，canal是阿里巴巴旗下的一款开源项目，基于Java开发。**基于数据库增量日志解析，提供增量数据订阅&消费**。[GitHub的地址](https://github.com/alibaba/canal)

Canal是基于**MySQL的主从同步**来实现的，MySQL主从同步的原理如下：

![image-20210821115914748](https://gitee.com/cmyk359/img/raw/master/img/image-20210821115914748-2024-12-2723:01:28.png)

1. MySQL master 将数据变更写入二进制日志( binary log），其中记录的数据叫做binary log events
2. MySQL slave 将 master 的 binary log events拷贝到它的中继日志(relay log)
3. MySQL slave 重放 relay log 中事件，将数据变更反映它自己的数据

**而Canal就是把自己伪装成MySQL的一个slave节点，从而监听master的binary log变化。再把得到的变化信息通知给Canal的客户端，进而完成对其它数据库的同步。**

![image-20210821115948395](https://gitee.com/cmyk359/img/raw/master/img/image-20210821115948395-2024-12-2723:03:46.png)

#### 安装Canal

[安装教程](https://catpaws.top/ceeb6373/)

[参考视频](https://www.bilibili.com/video/BV1cr4y1671t?vd_source=51d78ede0a0127d1839d6abf9204d1ee&spm_id_from=333.788.videopod.episodes&p=131)

#### 监听Canal

Canal提供了各种语言的客户端，当Canal监听到binlog变化时，会通知Canal的客户端。此处利用Canal提供的Java客户端，监听Canal通知消息。当收到变化的消息时，完成对缓存的更新。

![image-20210821120049024](https://gitee.com/cmyk359/img/raw/master/img/image-20210821120049024-2024-12-2723:19:34.png)



对于springboot项目，GitHub上的第三方开源的[canal-starter](https://github.com/NormanGyllenhaal/canal-client)与SpringBoot完美整合，自动装配，比官方客户端要简单好用很多。

1、引入依赖

```xml
<dependency>
    <groupId>top.javatool</groupId>
    <artifactId>canal-spring-boot-starter</artifactId>
    <version>1.2.1-RELEASE</version>
</dependency>
```

2、添加配置

```properties
canal:
  destination: item-service  	# canal的集群名字，要与安装canal时设置的名称一致
  server: 192.168.150.101:11111  # canal服务地址
```

3、Canal推送给canal-client的是被修改的这一行数据（row），而我们引入的canal-client则会帮我们把行数据封装到指定的实体类中。这个过程中需要知道数据库与实体的映射关系，要用到JPA的几个注解：`@Id`、`@Column`、`@Transient`等，说明实体类和表中字段的映射关系。

![常用注解的作用](https://gitee.com/cmyk359/img/raw/master/img/image-20241227233005012-2024-12-2723:30:06.png)



4、添加监听器。通过实现`EntryHandler<T>`接口编写监听器，监听Canal消息。注意两点：

- 实现类通过`@CanalTable("tb_item")`指定监听的表信息
- EntryHandler的泛型是与表对应的实体类

![监听器基本结构](https://gitee.com/cmyk359/img/raw/master/img/image-20241227233153170-2024-12-2723:31:54.png)

```java
@Component
@CanalTable("tb_item")
public class ItemHandler implements EntryHandler<Item> {
    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    @Autowired
    private Cache<Long,Item> itemCache;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void insert(Item item) {
        //添加数据到JVM缓存
        itemCache.put(item.getId(),item);
        //添加数据到Redis缓存
        saveItem(item);
    }

    @Override
    public void update(Item before, Item after) {
        //添加数据到JVM缓存
        itemCache.put(after.getId(),after);
        //添加数据到Redis缓存
        saveItem(after);
    }

    @Override
    public void delete(Item item) {
        //删除JVM缓存中对应的数据
        itemCache.invalidate(item.getId());
        //删除Redis缓存中对应的数据
        deleteItem(item);
    }


    /**
     * 向Redis中添加商品数据
     * @param item
     */
    public void saveItem(Item item) {
        try {
            String itemJson = objectMapper.writeValueAsString(item);
            stringRedisTemplate.opsForValue().set("item:id"+item.getId(),itemJson);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 删除Redis中对应的商品数据
     * @param item
     */
    public void deleteItem(Item item) {
        stringRedisTemplate.delete("item:id"+item.getId());
    }
}

```



## 三、Redis最佳实践

### 3.1、Redis键值设计

#### 优雅的Key结构

Redis的Key虽然可以自定义，但最好遵循下面的几个最佳实践约定：

- 遵循基本格式：**[业务名称]：[数据名]：[id]**
- **长度不超过44字节**
- 不包含特殊字符

例如：我们的登录业务，保存用户信息，其key是这样的：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241229104044294-2024-12-2910:40:57.png" alt="image-20241229104044294" style="zoom:80%;" />



优点：

1. 可读性强
2. 避免key冲突
3. 方便管理
4. 更节省内存

Redis的`key`的数据类型为String，而Redis中String类型的底层编码方式有三种，分别是`int`、`embstr`和`raw`。

当存储的值为整数，且值的大小可以用long类型表示时，Redis使用int编码。在int编码中，String对象的实际值会被存储在一个long类型的整数中。这种编码方式的优点是存储空间小，且无需进行额外的解码操作。

当存储的值为字符串，且长度小于等于**44字节**时，Redis使用embstr编码。在embstr编码中，<u>RedisObject对象头和SDS（Simple Dynamic String）对象在内存中地址是连在一起的，申请内存时只需要调用一次内存分配函数，效率较高</u>。

当存储的值为字符串，且长度大于44字节时，Redis使用raw编码。在raw编码中，RedisObject对象头和SDS对象在内存地址不是连续的，需要分配两次内存，性能较差。

> 通过`OBJECT ENCODING <key>`命令可以查看一个数据库键的值对象的编码。

![image-20241229210405733](https://gitee.com/cmyk359/img/raw/master/img/image-20241229210405733-2024-12-2921:04:20.png)

#### 拒绝BigKey

##### **什么是BigKey？**

BigKey通常以**Key的大小**和**Key中成员的数量**来综合判定，例如：

- Key本身的数据量过大：一个String类型的Key，它的值为5 MB。
- Key中的成员数过多：一个ZSET类型的Key，它的成员数量为10，000个。
- Key中成员的数据量过大：一个Hash类型的Key，它的成员数量虽然只有1，000个但这些成员的Value（值）总大小为100 MB。

推荐值：

- 单个key的value小于10KB
- 对于集合类型的key，建议元素数量小于1000



##### **BigKey的危害**

- 网络阻塞

  对BigKey执行读请求时，少量的QPS就可能导致带宽使用率被占满，导致Redis实例，乃至所在物理机变慢

- 数据倾斜
  集群中各节点内存空间使用可能非常不均衡，BigKey所在的Redis实例内存使用率远超其他实例，无法使数据分片的内存资源达到均衡。也会导致在集群模式下，数据迁移和复制变得困难

- Redis阻塞
  对元素较多的hash、list、zset等做运算会耗时较旧，使主线程被阻塞

- CPU压力
  对BigKey的数据序列化和反序列化会导致CPU的使用率飙升，影响Redis实例和本机其它应用



##### **如何发现BigKey**

- `redis-cli--bigkeys`

  利用redis-cli提供的--bigkeys参数，可以遍历分析所有key，并返回Key的整体统计信息与**每个数据类型的Top1**的big key 。当然，每个类型的Top1未必就是BigKey，也有可能Top2也是BigKey，但该命令无法列出，该命令的结果只做参考，

  ![image-20241229213242858](https://gitee.com/cmyk359/img/raw/master/img/image-20241229213242858-2024-12-2921:33:24.png)

- scan扫描
  自己编程，利用`scan`命令扫描Redis中的所有key，利用strlen，hlen等命令判断key的长度（此处不建议使用MEMORY USAGE）。

  `SCAN`命令是扫描redis中所有的key，而Redis还提供了针对集合key的扫描命令[HSCAN](https://redis.io/docs/latest/commands/hscan/)、[SSCAN](https://redis.io/docs/latest/commands/sscan/)、[ZSCAN](https://redis.io/docs/latest/commands/zscan/)。

  > Redis的SCAN命令是一个**基于游标的迭代器**，用于逐步遍历数据库中的key。与KEYS命令不同，SCAN命令不会一次性返回所有匹配的key，而是**分批返回**，从而减轻了对Redis服务器的负担。
  >
  > 基本语法：
  >
  > ```bash
  > SCAN cursor [MATCH pattern] [COUNT count]
  > ```
  >
  > - ‌**cursor**‌：表示当前遍历的位置，初始值为0。每次调用SCAN命令后，Redis会返回一个新的游标值，用于下一次迭代。
  > - ‌**MATCH pattern**‌：可选参数，用于指定匹配的模式，只返回符合模式的key。
  > - ‌**COUNT count**‌：可选参数，用于指定每次迭代返回的key数量。这是一种提示（hint），并不保证精确返回指定数量的key。

  使用jedis连接Reids，使用`Scan`命令分批读取所有key，对读取的key按数据类型进行分类判断是不是BigKey，若超过指定标准，则输出该key的相关信息。

  ```java
  import com.heima.jedis.util.JedisConnectionFactory;
  import org.junit.jupiter.api.AfterEach;
  import org.junit.jupiter.api.BeforeEach;
  import org.junit.jupiter.api.Test;
  import redis.clients.jedis.Jedis;
  import redis.clients.jedis.ScanResult;
  
  import java.util.HashMap;
  import java.util.List;
  import java.util.Map;
  
  public class JedisTest {
      private Jedis jedis;
  
      @BeforeEach
      void setUp() {
          // 1.建立连接
          // jedis = new Jedis("192.168.150.101", 6379);
          jedis = JedisConnectionFactory.getJedis();
          // 2.设置密码
          jedis.auth("123321");
          // 3.选择库
          jedis.select(0);
      }
  	
      // BigKey判断标准，单个key大小不要超过10kB，集合key不要超过500个成员
      final static int STR_MAX_LEN = 10 * 1024;
      final static int HASH_MAX_LEN = 500;
  
      @Test
      void testScan() {
          int maxLen = 0;
          long len = 0;
  
          String cursor = "0";
          do {
              // 扫描并获取一部分key
              ScanResult<String> result = jedis.scan(cursor);
              // 记录cursor
              cursor = result.getCursor();
              List<String> list = result.getResult();
              if (list == null || list.isEmpty()) {
                  break;
              }
              // 遍历
              for (String key : list) {
                  // 判断key的类型
                  String type = jedis.type(key);
                  switch (type) {
                      case "string":
                          len = jedis.strlen(key);
                          maxLen = STR_MAX_LEN;
                          break;
                      case "hash":
                          len = jedis.hlen(key);
                          maxLen = HASH_MAX_LEN;
                          break;
                      case "list":
                          len = jedis.llen(key);
                          maxLen = HASH_MAX_LEN;
                          break;
                      case "set":
                          len = jedis.scard(key);
                          maxLen = HASH_MAX_LEN;
                          break;
                      case "zset":
                          len = jedis.zcard(key);
                          maxLen = HASH_MAX_LEN;
                          break;
                      default:
                          break;
                  }
                  if (len >= maxLen) {
                      System.out.printf("Found big key : %s, type: %s, length or size: %d %n", key, type, len);
                  }
              }
          } while (!cursor.equals("0"));
      }
      
      @AfterEach
      void tearDown() {
          if (jedis != null) {
              jedis.close();
          }
      }
  }
  ```

  ![image-20241229214647372](https://gitee.com/cmyk359/img/raw/master/img/image-20241229214647372-2024-12-2921:47:24.png)

- 第三方工具
  利用第三方工具，如[Redis-Rdb-Tools](https://github.com/sripathikrishnan/redis-rdb-tools) 离线分析RDB快照文件，全面分析内存使用情况，对Redis性能没有任何影响，但可能存在数据时效性的差异。

- 网络监控
  自定义工具，监控进出Redis的网络数据，超出预警值时主动告警。



##### **删除BigKey**

在找到BigKey后，应该将BigKey的数据进行拆分，重新存储，之后再删除该key。

Bigkey内存占用较多，即便时删除这样的key也需要耗费很长时间，导致Redis主线程阻塞，引发一系列问题。

- redis 3.0 及以下版本
  如果是集合类型，则遍历BigKey的元素，**先逐个删除子元素，最后删除BigKey** 
- Redis 4.0以后
  `UNLINK` 是 Redis 4.0 及更高版本中引入的一个新命令，用于异步地删除一个或多个键。与 `DEL` 命令不同，`UNLINK` 命令不会立即释放与键相关联的内存，而是将键的删除操作放入后台线程中异步执行，从而避免在删除大量键时对 Redis 的主线程造成阻塞。

> 补充：[Redis的HotKey](https://www.zhihu.com/question/631094333/answer/3299005487)



#### 恰当的数据类型

##### 例一

比如存储一个User对象，我们有三种存储方式：

**①方式一：json字符串**

| user:1 | {"name": "Jack", "age": 21} |

优点：实现简单粗暴

缺点：数据耦合，不够灵活

**②方式二：字段打散**

| user:1:name | Jack |
| :---------: | :--: |
| user:1:age  |  21  |

优点：可以灵活访问对象任意字段

缺点：占用空间大、没办法做统一控制

**③方式三：hash（推荐）**

<table>
	<tr>
		<td rowspan="2">user:1</td>
        <td>name</td>
        <td>jack</td>
	</tr>
	<tr>
		<td>age</td>
		<td>21</td>
	</tr>
</table>

优点：底层使用ziplist，空间占用小，可以灵活访问对象的任意字段

缺点：代码相对复杂

##### 例二

假如有hash类型的key，其中有100万对field和value，field是自增id，这个key存在什么问题？如何优化？

<table>
	<tr style="color:red">
		<td>key</td>
        <td>field</td>
        <td>value</td>
	</tr>
	<tr>
		<td rowspan="3">someKey</td>
		<td>id:0</td>
        <td>value0</td>
	</tr>
    <tr>
		<td>.....</td>
        <td>.....</td>
	</tr>
    <tr>
        <td>id:999999</td>
        <td>value999999</td>
    </tr>
</table>

存在的问题：

- hash的entry数量超过500时，会使用哈希表而不是ZipList，内存占用较多

  ![image-20220521142943350](https://gitee.com/cmyk359/img/raw/master/img/image-20220521142943350-2024-12-2922:20:10.png)
- 可以通过hash-max-ziplist-entries配置entry上限。但是如果entry过多就会导致BigKey问题

**方案一**

拆分为string类型

<table>
	<tr style="color:red">
		<td>key</td>
        <td>value</td>
	</tr>
	<tr>
		<td>id:0</td>
        <td>value0</td>
	</tr>
    <tr>
		<td>.....</td>
        <td>.....</td>
	</tr>
    <tr>
        <td>id:999999</td>
        <td>value999999</td>
    </tr>
</table>

存在的问题：

- string结构底层没有太多内存优化，内存占用较多

![image-20220521143458010](https://gitee.com/cmyk359/img/raw/master/img/image-20220521143458010-2024-12-2922:20:18.png)

- 想要批量获取这些数据比较麻烦

**方案二**

拆分为小的hash，**将 id / 100 作为key， 将id % 100 作为field**，这样每100个元素为一个Hash

<table>
	<tr style="color:red">
		<td>key</td>
        <td>field</td>
        <td>value</td>
	</tr>
	<tr>
        <td rowspan="3">key:0</td>
		<td>id:00</td>
        <td>value0</td>
	</tr>
    <tr>
		<td>.....</td>
        <td>.....</td>
	</tr>
    <tr>
        <td>id:99</td>
        <td>value99</td>
    </tr>
    <tr>
        <td rowspan="3">key:1</td>
		<td>id:00</td>
        <td>value100</td>
	</tr>
    <tr>
		<td>.....</td>
        <td>.....</td>
	</tr>
    <tr>
        <td>id:99</td>
        <td>value199</td>
    </tr>
    <tr>
    	<td colspan="3">....</td>
    </tr>
    <tr>
        <td rowspan="3">key:9999</td>
		<td>id:00</td>
        <td>value999900</td>
	</tr>
    <tr>
		<td>.....</td>
        <td>.....</td>
	</tr>
    <tr>
        <td>id:99</td>
        <td>value999999</td>
    </tr>
</table>

![image-20220521144339377](https://gitee.com/cmyk359/img/raw/master/img/image-20220521144339377-2024-12-2922:20:21.png)



### 3.2、批处理优化

对于海量数据进行处理时，可以选择N条命令逐个执行，也可以选择每次执行m条，分n次执行完。

一次Redis命令的执行耗时，主要客户端和Redis服务器之间一次往返的网络传输耗时 + 一次Redis命令处理耗时，其中网络传输耗时占命令耗时的主要部分。

若N条命令依次执行，则**N条命令的响应时间 = N次往返的网络传输耗时 + N次Redis执行命令耗时**

![N条命令依次执行](https://gitee.com/cmyk359/img/raw/master/img/image-20241229224534815-2024-12-2922:46:24.png)

若N条命令批量执行，**N次命令的响应时间 =m次往返的网络传输耗时 + N次Redis执行命令耗时**

![N条命令批量执行](https://gitee.com/cmyk359/img/raw/master/img/image-20241229224753860-2024-12-2922:47:54.png)

> 注：不要在一次批处理中传输太多命令，否则单次命令占用带宽过多，会导致网络阻塞



#### 单机模式下的批处理：Pipeline

Redis提供了很多`Mxxx`这样的命令，可以实现批量插入数据，例如：`MSET`,`MHSET`等，但这些命令虽然可以批处理，但是却只能操作部分数据类型，因此如果有对复杂数据类型的批处理需要，建议使用Pipeline功能。使用Pipeline可以添加对任意数据类型操作的命令，十分灵活。

Pipeline 允许客户端将多个命令一次性发送到 Redis 服务器，而不是逐个发送命令并等待响应。这种方式显著减少了网络延迟和通信开销，从而提高了命令执行的效率。

**大致工作流程如下：**

1. 客户端创建一个Pipeline对象，并向其中添加需要执行的命令。
2. 客户端将所有命令一次性发送到Redis服务器。
3. 由于**Redis是单线程执行命令**，Redis服务器接收到命令后，会对命令进行**排队**，依次执行这些命令，并将每个命令的结果存储起来。
4. 客户端等待所有命令执行完成后，从服务器获取结果并按照命令发送的顺序进行处理。

例如，使用Jedis的pipeline功能，批量处理100000条数据

```java
@Test
void testPipeline() {
    // 创建管道
    Pipeline pipeline = jedis.pipelined();
    long b = System.currentTimeMillis();
    for (int i = 1; i <= 100000; i++) {
        // 放入命令到管道
        pipeline.set("test:key_" + i, "value_" + i);
        if (i % 1000 == 0) {
            // 每放入1000条命令，批量执行
            pipeline.sync();
        }
    }
    long e = System.currentTimeMillis();
    System.out.println("time: " + (e - b));
}
```

> 注意事项：
>
> i. Pipeline中的命令**不具备原子性**，即如果其中一个命令失败，不会影响到其他命令的执行。
>
> ii. 使用Pipeline时，应该避免一次性发送过多命令，以免造成服务器处理阻塞，影响其他客户端的请求。

Spring Data Redis也封装了对Pipeline的使用方法。`executePipelined` 是 Spring Data Redis 提供的一个方法，用于执行 Redis 的 Pipeline 操作。

在 Spring Data Redis 中，`executePipelined` 方法被定义在 `RedisTemplate` 类中。该方法接受一个 `RedisCallback<List<Object>>` 类型的参数，这个参数是一个回调接口，用于定义要在 Redis 上执行的命令。在回调接口的 `doInRedis` 方法中，可以使用 `RedisConnection` 来执行任意数量的 Redis 命令。这些命令会被打包成一个 Pipeline 请求发送到 Redis 服务器。

`executePipelined` 方法的返回值是一个 `List<Object>`，包含了所有命令的执行结果。这些结果的顺序与你在 `doInRedis` 方法中执行命令的顺序是一致的。

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RedisService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public void executeRedisPipeline() {
        // 使用 Pipeline 执行多个命令
        List<Object> results = redisTemplate.executePipelined(new RedisCallback<List<Object>>() {
            @Override
            public List<Object> doInRedis(org.springframework.data.redis.connection.RedisConnection connection) throws Exception {
                // 开启 Pipeline（实际上，Spring Data Redis 在调用这个方法时已经为你管理了 Pipeline）

                // 执行命令，这些命令会被打包成一个 Pipeline 请求
                connection.set("key1".getBytes(), "value1".getBytes());
                connection.set("key2".getBytes(), "value2".getBytes());
                connection.get("key1".getBytes());

                // 注意：这里不需要关闭连接，因为 Spring Data Redis 会为你处理

                // 返回 null 或者一个空列表，因为结果会通过 Pipeline 异步获取
                return null;
            }
        });

        // 处理结果
        for (Object result : results) {
            // 根据命令的类型和顺序解析结果
            System.out.println(result);
        }
    }
}

```

> 参考文章：[RedisTemplate Pipeline 管道使用](https://blog.csdn.net/qq_39363204/article/details/125665896?spm=1001.2101.3001.6650.1&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7EPaidSort-1-125665896-blog-119837981.235%5Ev43%5Epc_blog_bottom_relevance_base8&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7EPaidSort-1-125665896-blog-119837981.235%5Ev43%5Epc_blog_bottom_relevance_base8&utm_relevant_index=2)

有的系统对延迟要求很高，那么redis管道第一次请求很慢，就需要在系统启动时进行管道的预热，保证系统启动后每次请求的低延迟。

```java
    @PostConstruct
    public void init() {
        long startTime = System.currentTimeMillis();
        redisTemplate.executePipelined(new SessionCallback<Object>() {
            @Override
            public <K, V> Object execute(RedisOperations<K, V> operations) throws DataAccessException {
                operations.hasKey((K) "");
                return null;
            }
        });
        log.info("redis初始化管道请求end，耗时：{}ms", System.currentTimeMillis() - startTime);
    }
```



#### 集群下的批处理

如果Redis是一个集群，那**批处理命令的多个key必须落在一个插槽中**，否则就会导致执行失败。

Pipeline并不支持跨节点的命令执行。如果pipeline中的命令涉及多个不同的槽（即多个不同的节点），那么这些命令将无法在一个pipeline中成功执行。因为 Redis 集群是由多个节点组成的，每个节点只负责维护一部分数据。当尝试在属于不同节点的数据上使用 Pipeline 时，Redis 会返回错误，因为它不知道如何在不同节点之间协调和执行这些命令。同时，Pipeline的主要目的是减少网络延迟和开销。如果pipeline中的命令需要跨多个节点执行，那么每个节点都需要处理并响应这些命令，这会增加网络延迟和处理的复杂度。

**四种解决方案**

![1653126446641](https://gitee.com/cmyk359/img/raw/master/img/1653126446641-2024-12-3010:03:44.png)

综合考虑下，使用并行slot处理较为合理，虽然实现较为复杂，需要创建多个线程并行执行各组pipeline命令，但其性能优于串行Slot，也不会出现像hash_tag方案的数据倾斜问题。

在Spring集群环境下的`mset`、`hmset`等命令已经实现了并行slot，解决了集群模式下的批处理问题。

测试代码

```java
   @Test
    void testMSetInCluster() {
        Map<String, String> map = new HashMap<>(3);
        map.put("name", "Rose");
        map.put("age", "21");
        map.put("sex", "Female");
        stringRedisTemplate.opsForValue().multiSet(map);


        List<String> strings = stringRedisTemplate.opsForValue().multiGet(Arrays.asList("name", "age", "sex"));
        strings.forEach(System.out::println);

    }
```

原理分析：

在RedisAdvancedClusterAsyncCommandsImpl 类中

首先根据slotHash算出来一个partitioned的map，map中的key就是slot，而他的value就是对应的对应相同slot的key对应的数据

通过 RedisFuture<String> mset = super.mset(op);进行异步的消息发送

```java
@Override
public RedisFuture<String> mset(Map<K, V> map) {

    Map<Integer, List<K>> partitioned = SlotHash.partition(codec, map.keySet());

    if (partitioned.size() < 2) {
        return super.mset(map);
    }

    Map<Integer, RedisFuture<String>> executions = new HashMap<>();

    for (Map.Entry<Integer, List<K>> entry : partitioned.entrySet()) {

        Map<K, V> op = new HashMap<>();
        entry.getValue().forEach(k -> op.put(k, map.get(k)));

        RedisFuture<String> mset = super.mset(op);
        executions.put(entry.getKey(), mset);
    }

    return MultiNodeExecution.firstOfAsync(executions);
}
```



### 3.3、服务端优化

#### **持久化配置**    

Redis的持久化虽然可以保证数据安全，但也会带来很多额外的开销，因此持久化请遵循下列建议：

* 用来做缓存的Redis实例尽量不要开启持久化功能

* 建议关闭RDB持久化功能，使用AOF持久化（AOF数据时效性和安全性更好）

  > redis.conf
  >
  > ```properties
  > # 关闭RDB持久化
  > # save 900 1
  > # save 300 10
  > # save 60 10000
  > 
  > # 开启AOF持久化
  > appendonly yes
  > 
  > # 设置AOF同步频率
  > appendfsync everysec
  > ```

* 利用脚本定期在slave节点做RDB，实现数据**备份**。频繁的RDB fork操作耗时较久，涉及大量磁盘IO，对性能影响较大。

* 设置合理的rewrite阈值，避免频繁对AOF文件做bgrewrite。(bgrewrite对CPU和磁盘占用较高)

  > redis.conf
  >
  > ```properties
  > # redis会记录上一次bgrewrite时的文件大小，当AOF文件大小超过上次文件大小指定的百分比后，会触发bgrewrite机制
  > auto-aof-rewrite-percentage 100
  > # 执行bgrewrite时AOF文件的最小容量
  > auto-aof-rewrite-min-size 64mb
  > ```

* 配置`no-appendfsync-on-rewrite = yes`，禁止在rewrite期间做aof，避免因AOF引起的阻塞。

  在执行bgrewrite时对CPU和磁盘的占用较高，且这个过程持续时间较长，而AOF默认的同步刷盘频率是每秒执行一次。在开启AOF机制后，主线程执行完一条命令后，要判断当前的刷盘时间是否小于2秒，若超过两秒会阻塞等待刷盘操作完成。在执行bgrewrite期间肯定会影响到AOF的刷盘效率，可能进一步导致主线程阻塞。在设置了`no-appendfsync-on-rewrite = yes`后，Redis若发现当前在做bgrewrite，就不会做AOF同步，主线程执行完命令直接返回。但由于在此期间没有做AOF持久化，可能出现数据丢失的问题。

  是否开启 在bgrewrite期间禁止做AOF同步，要视业务需求而定，若追求数据的安全，则设置为no，若追求的是性能，则开启。

  ![image-20241230103348982](https://gitee.com/cmyk359/img/raw/master/img/image-20241230103348982-2024-12-3010:34:05.png)

* 部署有关建议：

  * Redis实例的物理机要预留足够内存，应对fork和rewrite
  * 单个Redis实例内存上限不要太大，例如4G或8G。可以加快fork的速度、减少主从同步、数据迁移压力
  * 不要与CPU密集型应用部署在一起
  * 不要与高硬盘负载应用一起部署。例如：数据库、消息队列

#### 慢查询

在Redis执行时耗时超过某个阈值的**命令**，称为慢查询。

慢查询的危害：由于Redis是单线程的，所以当客户端发出指令后，他们都会进入到redis底层的queue来执行，如果此时有一些慢查询的数据，就会导致大量请求阻塞，从而引起报错。

![1653129590210](https://gitee.com/cmyk359/img/raw/master/img/1653129590210-2024-12-3010:52:29.png)

慢查询的阈值在redis.conf中设置：

`slowlog-log-slower-than`：慢查询阈值，单位是微秒。默认是10000，建议1000

慢查询会被放入慢查询日志中，日志的长度有上限，可以通过配置指定：

`slowlog-max-len`：慢查询日志（本质是一个队列）的长度。默认是128，建议1000

![image-20241230105504516](https://gitee.com/cmyk359/img/raw/master/img/image-20241230105504516-2024-12-3010:55:05.png)

**查看慢查询日志列表**

* `slowlog len`：查询慢查询日志长度
* `slowlog get [n]`：读取n条慢查询日志
* `slowlog reset`：清空慢查询列表

![1653130858066](https://gitee.com/cmyk359/img/raw/master/img/1653130858066-2024-12-3010:56:01.png)

也可以在图形化客户端中查看

![image-20241230105734147](https://gitee.com/cmyk359/img/raw/master/img/image-20241230105734147-2024-12-3010:57:36.png)

#### 安全配置

 安全可以说是服务器端一个非常重要的话题，如果安全出现了问题，那么一旦这个漏洞被一些坏人知道了之后，并且进行攻击，那么这就会给咱们的系统带来很多的损失，所以我们这节课就来解决这个问题。

Redis会绑定在0.0.0.0:6379，这样将会将Redis服务暴露到公网上，而Redis如果没有做身份认证，会出现严重的安全漏洞.[漏洞重现方式](https://cloud.tencent.com/developer/article/1039000)

为什么会出现不需要密码也能够登录呢，主要是Redis考虑到每次登录都比较麻烦，所以Redis就有一种ssh免秘钥登录的方式，生成一对公钥和私钥，私钥放在本地，公钥放在redis端，当我们登录时服务器，再登录时候，他会去解析公钥和私钥，如果没有问题，则不需要利用redis的登录也能访问，这种做法本身也很常见，但是这里有一个前提，前提就是公钥必须保存在服务器上，才行，但是Redis的漏洞在于在不登录的情况下，也能把秘钥送到Linux服务器，从而产生漏洞。其核心操作就是连接到Redis服务器，使用`config set`命令修改Redis持久化文件的名称和保存目录，再执行持久化操作，将秘钥内容写入服务器，完成免密登录。

漏洞出现的核心的原因有以下几点：

* Redis未设置密码
* 利用了Redis的config set命令动态修改Redis配置
* 使用了Root账号权限启动Redis

所以：如何解决呢？我们可以采用如下几种方案

为了避免这样的漏洞，这里给出一些建议：

* Redis一定要设置密码

* 禁止线上使用下面命令：keys、flushall、flushdb、config set等命令。可以在配置文件中利用`rename-command`给这些命令重命名或禁用。

  ![image-20241230111054332](https://gitee.com/cmyk359/img/raw/master/img/image-20241230111054332-2024-12-3011:11:05.png)

* bind：限制网卡，禁止外网网卡访问

* 开启防火墙

* 不要使用Root账户启动Redis

* 尽量不是有默认的端口



#### 内存配置

当Redis内存不足时，可能导致Key频繁被删除、响应时间变长、QPS不稳定等问题。当内存使用率达到90%以上时就需要我们警惕，并快速定位到内存占用的原因。

查看到Redis目前的内存分配状态：

- `info memory`：查看内存分配的情况

- `memory xxx`：查看key的主要占用情况

  `memory state`命令返回结果分析

  ```bash
  1）"peak.allocated"//Redis进程自启动以来消耗内存的峰值。
  2）（integer）794923123）"total.allocated"//Redis使用其分配器分配的总字节数，即当前的总内存使用量。
  4）（integer）79307776
  5）"startup.allocated"_//Redis启动时消耗的初始内存量。
  6）（integer）45582592
  7）"replication.backlog"//复制积压缓冲区的大小。
  8）（integer）33554432
  9）"clients.slaves"//主从复制中所有从节点的读写缓冲区大小。
  10）（integer）17266
  11）"clients.normal"//除从节点外，所有其他客户端的读写缓冲区大小。
  12）（integer）119102
  13）"aof.buffer"//AOF持久化使用的缓存和AOF重写时产生的缓存。
  14）（integer）0
  15）"db.0"//业务数据库的数量。
  16）1）"overhead.hashtable.main"//当前数据库的hash链表开销内存总和，即元数据内存。
          2）（integer）144
          3）"overhead.hashtable.expires"//用于存储key的过期时间所消耗的内存。
          4）（integer）e
  17）"overhead.total"//数值=startup.allocated+replication.backlog+clients.slaves+clients.normal+aof.buffer+db.X.
  18）（integer）79273616
  19）"keys.count"//当前Redis实例的key总数
  20）（integer）221）"keys.bytes-per-key"//当前Redis实例每个key的平均大小，计算公式
  21）"keys.bytes-per-key"//当前Redis实例每个key的平均大小，计算公式：（total.allocated-startup.allocated）/keys.count.
  22）（integer）16862592
  23）"dataset.bytes"//纯业务数据占用的内存大小。
  24）（integer）34160
  25）"dataset.percentage"//纯业务数据占用的内存比例，计算公式：dataset.bytes*100/（total.allocated-startup.allocated）.
  26）"0.1012892946600914"
  27）"peak.percentage"//当前总内存与历史峰值的比例，计算公式：total.allocated*100/peak.allocated.
  28）"99.767860412597656"
  29）"fragmentation"//内存的碎片率。
  30）"0.45836541056632996"
  
  ```

  



Redis的内存占用主要划分为以下几个部分：

![Redis内存划分](https://gitee.com/cmyk359/img/raw/master/img/image-20241230132253444-2024-12-3013:23:01.png)

**1、数据内存问题分析**：

主要是BigKey和内存碎片问题。

其中BigKey之前已经讲过，应该选择合适的数据结构避免出现BigKey，对已经出现的BigKey的数据进行拆分后删除即可。

内存碎片的形成主要有以下几个原因：

i. **内存分配机制**：Redis使用的内存分配器（默认是`jemalloc`）**会按照固定大小来分配内存，而不是完全按照程序申请的内存大小来进行分配。**这可能导致分配的内存空间大于实际需要的空间，从而产生碎片‌。例如，当前key只需要10个字节，此时分配8肯定不够，那么他就会分配16个字节，多出来的6个字节就不能被使用。内存碎片对Redis的影响主要体现在内存利用率上。虽然内存碎片不会影响Redis的性能，但会降低内存的实际可用空间，从而可能导致Redis需要和外存进行数据交换（Swap），或者根据淘汰策略清理老数据，进而影响整体系统的性能。

ii. **数据删除与修改**‌：当Redis删除或修改数据时，释放的内存空间并不一定能被立即重新利用。尤其是当这些空闲内存空间大小不一致时，就更可能导致内存碎片的出现‌

为了清理内存碎片，Redis 4.0版本后提供了自动内存碎片清理机制‌。此外，也可以通过重启Redis服务来清理内存碎片，但这种方法需要谨慎使用，因为重启期间Redis不可用，且如果未开启持久化机制，数据可能会丢失。

**2、进程内存问题分析：**

Redis进程自身运行所需的内存消耗，这部分内存消耗通常非常小，通常可以忽略不计

**3、缓冲区内存问题分析：**

缓冲区内存占用波动较大，特别是在高并发或大流量场景下，需要重点分析和管理。

Redis的缓冲区内存主要包括以下几个部分：

‌**复制缓存（Replication Backlog Buffer）**‌：

- 这是一个可重用的固定大小缓冲区（`repl_backlog_buf`），用于支持主从复制功能。如果太小可能导致频繁的全量复制，影响性能。它存储复制过程中的数据缓冲区，避免全量复制。配置参数为`repl-backlog-size`，默认值为1M。单个主节点配置一个复制积压缓冲区。

‌**AOF缓冲区**‌：

- 如果启用了AOF（Append-Only File）持久化，则会有一个缓冲区用于存储写操作，以便在后台将其写入磁盘。AOF重写期间增量的写入命令也会保存在这个缓冲区中。此部分缓存占用大小取决于AOF重写时间及增量。

‌**客户端缓存**‌：

Redis客户端主要分为**从客户端**、**订阅客户端**和**普通客户端**。从客户端连接主要用于主从复制，订阅客户端用于发布订阅功能，普通客户端则是通常的应用连接。每种类型的客户端都有不同的缓冲配置限制，以避免因缓冲区积压而导致的内存问题。

- ‌**输入缓冲**‌：TCP连接的输入缓冲占用是不受控制的，最大允许空间为1G。

- ‌**输出缓冲**‌：TCP连接的输出缓冲占用可以通过`client-output-buffer-limit`参数配置。

  ![image-20241230140922747](https://gitee.com/cmyk359/img/raw/master/img/image-20241230140922747-2024-12-3014:09:30.png)

  ```properties
  #默认配置如下：
  # Both the hard or the soft limit can be disabled by setting them to zero.
  #普通客户端默认不受限制
  client-output-buffer-limit normal 0 0 0 	
  client-output-buffer-limit replica 256mb 64mb 60
  client-output-buffer-limit pubsub 32mb 8mb 60
  ```

解决客户端缓冲区过大导致断开Redis连接的方法：

1、设置一个大小

2、增加带宽，避免我们出现大量数据从而直接超过了redis的承受能力

Redis提供的查看客户端详情的命令

- `info clients`，返回客户端总览，其中包括最大输入和最大输出缓冲区的大小

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241230142225240-2024-12-3014:23:04.png" alt="image-20241230142225240" style="zoom: 80%;" />

- `client list`，可以获取当前连接到Redis服务器的所有客户端信息，其中包括客户端的缓冲区使用情况。

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241230142726964-2024-12-3014:28:04.png" alt="image-20241230142726964" style="zoom:67%;" />

  在输出结果中，关注与客户端缓冲区相关的字段，这些字段包括：

  - `qbuf`：查询缓冲区的长度（字节为单位），表示客户端发送到Redis但尚未被处理的命令所占用的缓冲区大小。如果`qbuf`很大，而同时`qbuf-free`（查询缓冲区剩余空间的长度）很小，说明客户端的输入缓冲区已经占用了很多内存，且空闲空间不足。
  - `qbuf-free`：查询缓冲区剩余空间的长度（字节为单位），表示客户端输入缓冲区中剩余的可用空间大小。
  - `obl`：输出缓冲区的长度（字节为单位），表示Redis为客户端分配的输出缓冲区中，已用于存储命令执行结果的部分所占用的空间大小。
  - `oll`：输出列表包含的对象数量，当输出缓冲区没有剩余空间时，命令回复会以字符串对象的形式被入队到这个队列里。
  - `omem`：输出缓冲区和输出列表占用的内存总量。

  根据上述字段的值，可以分析客户端的缓冲区使用情况。例如，如果`qbuf`值很大，说明客户端正在向Redis发送大量命令，而Redis尚未处理完这些命令。如果`obl`和`oll`值很大，说明Redis正在为客户端准备大量的命令执行结果，但尚未发送给客户端。如果`qbuf-free`值很小或接近0，说明客户端的输入缓冲区已经接近满负荷，可能需要考虑优化客户端的命令发送速率或增加Redis的处理能力。

  根据分析结果，采取相应的措施来优化客户端的缓冲区使用情况。例如，如果发现某个客户端的`qbuf`值持续很高，可以考虑优化该客户端的命令发送逻辑，减少不必要的命令发送；如果发现Redis的输出缓冲区占用过高，可以考虑增加Redis的内存配额、优化数据访问模式或增加Redis实例的数量等。

  > 注意：`CLIENT LIST`命令输出的缓冲区信息只是瞬时值，要全面了解客户端的缓冲区使用情况，可能需要结合监控工具和日志分析等方法进行综合评估。

### 3.4、集群最佳实践 - 集群 or 主从

集群虽然具备高可用特性，能实现自动故障恢复，但是如果使用不当，也会存在一些问题：

* **集群完整性问题**

  在Redis的默认配置中，如果发现任意一个插槽不可用，则整个集群都会停止对外服务：

  ![1653132740637](https://gitee.com/cmyk359/img/raw/master/img/1653132740637-2024-12-3013:12:20.png)

  在开发中，其实最重要的是可用性，所以需要把如下配置修改成no，即有slot不能使用时，redis集群的其他节点还是可以对外提供服务。

* **集群带宽问题**

  集群节点之间会不断的互相Ping来确定集群中其它节点的状态。每次Ping携带的信息至少包括：

  * 插槽信息
  * 集群状态信息

  集群中节点越多，集群状态信息数据量也越大，10个节点的相关信息可能达到1kb，此时每次集群互通需要的带宽会非常高，这样会导致集群中大量的带宽都会被ping信息所占用，这是一个非常可怕的问题。

  **解决途径：**

  * 避免大集群，集群节点数不要太多，最好少于1000，如果业务庞大，则建立多个集群。
  * 避免在单个物理机中运行太多Redis实例
  * 配置合适的cluster-node-timeout值

* **数据倾斜问题**

  在出现BigKey或者批处理中使用hash_tag策略时，会产生数据倾斜的问题。

* **客户端性能问题**

* **命令的集群兼容性问题**

* **lua和事务问题**

  lua和事务都是要保证原子性问题，如果你的key不在一个节点，那么是无法保证lua的执行和事务的特性的，所以在集群模式是没有办法执行lua和事务的。



**到底是集群还是主从？**

单体Redis（主从Redis）已经能达到万级别的QPS，并且也具备很强的高可用特性。如果主从能满足业务需求的情况下，所以如果不是在万不得已的情况下，尽量不搭建Redis集群

## 四、补充：Redis事务

Redis事务：一组命令的集合。事务中每条命令都会被序列化，执行过程中按顺序执行，不允许其他命令进行干扰。所有事务中的命令在加入时都没有被执行，直到提交时才会开始执行(Exec)一次性完成。

### 4.1、使用Redis事务

Redis 可以通过 **MULTI**，**EXEC**，**DISCARD** 和 **WATCH** 等命令来实现事务(Transaction)功能。

操作过程：开启事务(`multi`) >> 命令入队 >> 执行事务(`exec`)

```bash
127.0.0.1:6379> multi # 开启事务
OK
127.0.0.1:6379> set k1 v1 # 命令入队
QUEUED
127.0.0.1:6379> set k2 v2 # ..
QUEUED
127.0.0.1:6379> get k1
QUEUED
127.0.0.1:6379> set k3 v3
QUEUED
127.0.0.1:6379> keys *
QUEUED
127.0.0.1:6379> exec # 事务执行
1) OK
2) OK
3) "v1"
4) OK
5) 1) "k3"
   2) "k2"
   3) "k1"
```

取消事务(`discurd`)

```bash
127.0.0.1:6379> multi
OK
127.0.0.1:6379> set k1 v1
QUEUED
127.0.0.1:6379> set k2 v2
QUEUED
127.0.0.1:6379> DISCARD # 放弃事务
OK
127.0.0.1:6379> EXEC 
(error) ERR EXEC without MULTI # 当前未开启事务
127.0.0.1:6379> get k1 # 被放弃事务中命令并未执行
(nil)
```

通过`WATCH` 命令监听指定的 Key，当调用 **EXEC** 命令执行事务时，如果一个被 **WATCH** 命令监视的 Key 被 其他客户端/Session 修改的话，整个事务都不会被执行。 

```bash
# 客户端 1
127.0.0.1:6379> SET PROJECT "Hello，Redis!"
OK
127.0.0.1:6379> WATCH PROJECT
OK
127.0.0.1:6379> MULTI
OK
127.0.0.1:6379> SET PROJECT "Hello，Redis!"
QUEUED
 
# 客户端 2
# 在客户端 1 执行 EXEC 命令提交事务之前修改 PROJECT 的值
127.0.0.1:6379> SET PROJECT "Hi，Redis!"
 
# 客户端 1
# 修改失败，因为 PROJECT 的值被客户端2修改了
127.0.0.1:6379> EXEC
(nil)
127.0.0.1:6379> GET PROJECT
"Hi，Redis!"
```

### 4.2、Redis事务特性

**Redis的单条命令是保证原子性的，但是redis事务不能保证原子性**

对于提交到事务中的命令，若出现代码语法错误（编译时异常）所有的命令都不执行；若是代码逻辑错误 (运行时异常) **其他命令可以正常执行 **（<u>不保证事务原子性</u>）。并且，Redis 事务是不支持回滚（roll back）操作的。

Redis 从 2.6 版本开始支持执行 Lua 脚本，它的功能和事务非常类似。我们可以利用 Lua 脚本来批量执行多条 Redis 命令，这些 Redis 命令会被提交到 Redis 服务器一次性执行完成，大幅减小了网络开销。一段 Lua 脚本可以视作一条命令执行，一段 Lua 脚本执行过程中不会有其他脚本或 Redis 命令同时执行，保证了操作不会被其他指令插入或打扰。

不过，如果 Lua 脚本运行时出错并中途结束，出错之后的命令是不会被执行的。并且，出错之前执行的命令是无法被撤销的，无法实现类似关系型数据库执行失败可以回滚的那种原子性效果。因此， 严格来说的话，通过 Lua 脚本来批量执行 Redis 命令实际也是不完全满足原子性的。

如果想要让 Lua 脚本中的命令全部执行，必须保证语句语法和命令都是对的。

[参考文章](https://blog.csdn.net/Bisikl/article/details/143578263)

