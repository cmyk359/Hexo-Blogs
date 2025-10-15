---
title: MySQL（二）
tags:
  - 事务
  - InnoDB存储引擎
  - 索引
  - SQL优化
  - 锁
categories:
  - 数据库
abbrlink: bd62c17f
date: 2024-12-08 23:12:03

---

<meta name = "referrer", content = "no-referrer"/>


## 一、事务

**事务(transaction)**，是用户定义的一个数据库操作的集合，它是一个不可分割的工作单位，事务会把所有的操作作为一个整体一起向系统提交或撤销，这些操作要么同时成功，要么同时失败。

只有**DML**语句（`insert、delete、update`）才会有事务这一说，其它语句和事务无关！！！因为 只有以上的三个语句是数据库表中数据进行增、删、改的。
只要你的操作一旦涉及到数据的增、删、改，那么就一定要考虑安全问题。

### 1.1、事务的原理

InnoDB存储引擎：提供一组用来记录**事务性活动的日志文件**（类似于缓存）

```mysql
事务开启了：
insert
insert
insert
delete
update
update
update
事务结束了！
```

在事务的执行过程中，每一条DML的操作都会记录到“事务性活动的日志文件”中，此时不会真正修改磁盘上的数据。

在事务的执行过程中，我们可以提交事务，也可以回滚事务。（提交和回滚是事务的**两个终结操作**）

提交事务？
  清空事务性活动的日志文件，将数据全部彻底持久化到数据库表中。
  提交事务标志着，事务的结束。并且是一种**全部成功**的结束。

回滚事务？
  将之前所有的DML操作全部撤销，并且清空事务性活动的日志文件
  回滚事务标志着，事务的结束。并且是一种**全部失败**的结束。

### 1.2、提交事务、回滚事务

事务通常以 `start transaction`开始，以`commit` 或`rollback`结束。

- `COMMIT`表示提交，即提交事务的所有操作。将事务中所有对数据库的更新写回到磁盘上的物理数据库中去，事务正常结束。
- `ROLLBACK`表示回滚，即在事务运行过程中发生了某种故障，事务不能继续执行，系统将事务中对数据库的所有已完成的操作全部撤销，回滚到事务开始的状态。



​	在MySQL默认情况下是支持自动提交事务的，即每执行一条DML语句，则提交一次。这种自动提交实际上是不符合我们的开发习惯，因为一个业务通常是需要多条DML语句共同执行才能完成的，为了保证数据的安全，必须要求同时成功之后再提交，所以不能执行一条就提交一条。执行`start transaction`关闭自动提交机制，开启真正的事务机制。



**代码演示**

```mysql
演示事务：
  ---------------------------------回滚事务----------------------------------------
  mysql> use bjpowernode;
  Database changed
  mysql> select * from dept_bak;
  Empty set (0.00 sec)

  mysql> start transaction;
  Query OK, 0 rows affected (0.00 sec)

  mysql> insert into dept_bak values(10,'abc', 'tj');
  Query OK, 1 row affected (0.00 sec)

  mysql> insert into dept_bak values(10,'abc', 'tj');
  Query OK, 1 row affected (0.00 sec)

  mysql> select * from dept_bak;
  +--------+-------+------+
  | DEPTNO | DNAME | LOC  |
  +--------+-------+------+
  |     10 | abc   | tj   |
  |     10 | abc   | tj   |
  +--------+-------+------+
  2 rows in set (0.00 sec)

  mysql> rollback;
  Query OK, 0 rows affected (0.00 sec)

  mysql> select * from dept_bak;
  Empty set (0.00 sec)


  ---------------------------------提交事务----------------------------------------
  mysql> use bjpowernode;
  Database changed
  mysql> select * from dept_bak;
  +--------+-------+------+
  | DEPTNO | DNAME | LOC  |
  +--------+-------+------+
  |     10 | abc   | bj   |
  +--------+-------+------+
  1 row in set (0.00 sec)

  mysql> start transaction;
  Query OK, 0 rows affected (0.00 sec)

  mysql> insert into dept_bak values(20,'abc')
  Query OK, 1 row affected (0.00 sec)

  mysql> insert into dept_bak values(20,'abc')
  Query OK, 1 row affected (0.00 sec)

  mysql> insert into dept_bak values(20,'abc')
  Query OK, 1 row affected (0.00 sec)

  mysql> commit;
  Query OK, 0 rows affected (0.01 sec)

  mysql> select * from dept_bak;
  +--------+-------+------+
  | DEPTNO | DNAME | LOC  |
  +--------+-------+------+
  |     10 | abc   | bj   |
  |     20 | abc   | tj   |
  |     20 | abc   | tj   |
  |     20 | abc   | tj   |
  +--------+-------+------+
  4 rows in set (0.00 sec)

  mysql> rollback;
  Query OK, 0 rows affected (0.00 sec)

  mysql> select * from dept_bak;
  +--------+-------+------+
  | DEPTNO | DNAME | LOC  |
  +--------+-------+------+
  |     10 | abc   | bj   |
  |     20 | abc   | tj   |
  |     20 | abc   | tj   |
  |     20 | abc   | tj   |
  +--------+-------+------+
  4 rows in set (0.00 sec)
```

### 1.3、事务四个特性（ACID）

事务的特性是**ACID**，即原⼦性（Atomicity）、⼀致性（Consistency）、隔离性（Isolation）、持久性（Durability）。

- 原子性：事务是不可分割的最小操作单元，要么全部成功，要么全部失败。
- 一致性：事务完成时，必须使所有的数据都保持一致状态。
- 隔离性：数据库系统提供的隔离机制，保证事务在不受外部并发操作影响的独立环境下运行。
- 持久性：事务一旦提交或回滚，它对数据库中的数据的改变就是永久的。

例如，A向B转账500元，这个操作要么都成功，要么都失败，体现了原⼦性。转账过程中数据要保持⼀致，A扣除了500元，B必须增加500元。隔离性体现在A向B转账时，不受其他事务⼲扰。持久性体现在事务提交后，数据要被持久化存储。

[事务四个特性的实现原理](https://catpaws.top/bd62c17f/#事务原理)



### 1.4、事务的隔离性等级

有关多个事务的并发控制

**多事务并发执行的问题**

-  **脏读**：一个事务读取了另一个事务未提交的数据，这些数据可能会被回滚，从而导致读取到无效数据


- **不可重复读**：一个事务在两次读取同一数据时，因其他事务的提交导致数据发生了变化，两次读取的数据不同。

- **幻读**：一个事务读取多条记录后，因其他事务的插入或删除，导致再次读取时获得的**记录集**发生变化。

***

事务隔离性存在隔离级别，理论上隔离级别包括`4`个：

1. 读未提交： `read uncommitted` （最低的隔离级别，没有提交就读到了）
   - 含义： 指一个事务还没提交时，它做的变更就能被其他事务看到；
   - 存在问题：脏读现象！(Dirty Read)

2. 读已提交：`read committed` (提交之后才能读到)
   - 含义：指一个事务提交之后，它做的变更才能被其他事务看到；
   - 解决的问题：解决了脏读的现象。
   - 存在的问题： 不可重复读取数据。
     - 在这种隔离级别下，每一次读到的数据是绝对的真实。

3. 可重复读：`repeatable read`(提交之后也读不到，永远读取的都是刚开启事务时的数据)
   - 含义：指一个事务执行过程中看到的数据，一直跟这个事务启动时看到的数据是一致的
   - 解决的问题：解决了不可重复读取数据。
   - 存在的问题：可以会出现幻读。

4. 序列化/串行化：`serializable`（最高的隔离级别）

   - 含义：会对记录加上读写锁，在多个事务对这条记录进行读写操作时，如果发生了读写冲突的时候，后访问的事务必须等前一个事务执行完成，才能继续执行；

   - 这是最高隔离级别，效率最低。解决了所有的问题。
   - 这种隔离级别表示事务需要排队，不能并发！

![](https://gitee.com/cmyk359/img/raw/master/img/image-20240424102156449-2024-12-823:54:55.png)

> 注意：事务隔离级别越高，数据越安全，但是性能越低。

Oracle数据库默认的隔离级别是：读已提交。

MySQL数据库默认的隔离级别是：**可重复读**。

```mysql
#测试隔离级别
设置全局事务隔离级别：mysql> set global transaction isolation level read uncommitted;
					Query OK, 0 rows affected (0.00 sec)
查看隔离级别：SELECT @@tx_isolation
+-----------------+
| @@tx_isolation  |
+-----------------+
| REPEATABLE-READ |
+-----------------+
mysql默认的隔离级别
```



## 二、存储引擎

### 2.1、存储引擎体系结构 

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240711100432572-2024-7-1110:04:51.png" alt="image-20240711100432572" style="zoom:80%;" />

![image-20240711100551721](https://gitee.com/cmyk359/img/raw/master/img/image-20240711100551721-2024-7-1110:05:52.png)



### 2.2、存储引擎简介

> 什么是存储引擎，有什么用呢？

存储引擎是MySQL中特有的一个术语，其它数据库中没有。（Oracle中有，但是不叫这个名字）

- 存储引擎就是存储/组织数据、建立索引、更新/查询数据等技术的实现方式。
- 存储引擎是基于`表`的，而不是基于库的，所以存储引擎也可被称为表类型。
- 不同的存储引擎，表存储数据的方式不同。

可以在建表的时候给表指定存储引擎。`ENGINE`来指定存储引擎，`CHARSET`来指定这张表的字符编码方式。

查看MySQL支持哪些存储引擎，命令： `show engines;`

![image-20240711101623788](https://gitee.com/cmyk359/img/raw/master/img/image-20240711101623788-2024-7-1110:17:12.png)



### 2.3、MyISAM存储引擎

它管理的表具有以下特征：

特点

- 不支持事务，不支持外键
- 支持表锁，不支持行锁
- 访问速度快
- 可被压缩，节省存储空间。并且可以转换为只读表，提高检索效率。



文件组织结构

-   使用三个文件表示每个表：
    -   格式文件 — 存储表结构的定（mytable.sdi）
    -   数据文件 — 存储表行的内（mytable.MYD）
    -   索引文件 — 存储表上索引（mytable.MYI）：索引是一本书的目录，缩小扫描范围，提高查询效率的一种机制。


### 2.4、InnoDB存储引擎

InnoDB是一种兼顾高可靠性和高性能的通用存储引擎，在 MySQL 5.5 之后，InnoDB是默认的 MySQL 存储引擎。

- 特点
  - DML操作遵循ACID模型，支持`事务`；
  - `行级锁`，提高并发访问性能；
  - 支持`外键` FOREIGN KEY约束，保证数据的完整性和正确性，包括级联删除和更新；
  - 支持数据库崩溃后自动恢复机制，非常安全。


[InnoDB存储引擎详解](https://catpaws.top/bd62c17f/#InnoDB存储引擎详解)

### 2.5、MEMORY存储引擎

Memory引擎的表数据时存储在`内存`中的，，且行的长度固定。由于受到硬件问题、或断电问题的影响，只能将这些表作为临时表或缓存使用。

- 特点

  - 数据和索引存放在内存中
  - 支持hash索引
  - 支持表锁

- 文件结构

  每个表对应一个 xxxx.sdi 格式的文件，保存表结构信息

MEMORY 存储引擎以前被称为HEAP 引擎。

MEMORY引擎优点：查询效率 是最高的。不需要和硬盘交互。

MEMORY引擎缺点：不安全，关机之后数据消失。因为数据和索引都是在内存当中。

### 2.6、存储引擎的对比与选择

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240712095425856-2024-7-1209:54:46.png" alt="image-20240712095425856" style="zoom:120%;" />

![image-20240712100104224](https://gitee.com/cmyk359/img/raw/master/img/image-20240712100104224-2024-7-1210:01:29.png)

## 三、索引（index）

### 3.1、索引概述

​	索引（index）是帮助MySQL**高效获取数据**的**数据结构**（有序）,是为了提高查询效率存在的一种机制。在数据之外，数据库系统还维护着满足特定查找算法的数据结构，这些数据结构以某种方式引用（指向）数据，这样就可以在这些数据结构上实现高级查找算法，这种数据结构就是索引。

- MySQL在查询方面主要就是两种方式：
  第一种方式：全表扫描 (性能低)
  第二种方式：根据索引检索。

![image-20240712104938469](https://gitee.com/cmyk359/img/raw/master/img/image-20240712104938469-2024-7-1210:49:55.png)

### 3.2、索引的数据结构

索引是在MySQL体系结构的存储引擎层实现的，不同的存储引擎可以对应不同的索引结构。主要包含以下几种：

![image-20240712105833956](https://gitee.com/cmyk359/img/raw/master/img/image-20240712105833956-2024-7-1210:58:58.png)

 Full-text索引是基于倒排索引实现的。[参考ES的倒排索引](https://b11et3un53m.feishu.cn/wiki/LDLew5xnDiDv7Qk2uPwcoeNpngf)

各存储引擎对上述索引结构的支持情况：

![image-20240712105941293](https://gitee.com/cmyk359/img/raw/master/img/image-20240712105941293-2024-7-1210:59:41.png)

> B+ tree

![image-20240712112351760](https://gitee.com/cmyk359/img/raw/master/img/image-20240712112351760-2024-7-1211:24:03.png)

B+树的每个结点都是存储在一个页中的，对应于InnoDB存储引擎逻辑结构中的page



**为什么InnoDB存储引擎使用B+tree作为索引结构：**

- 在相同结点数量下，B+树比二叉树的层级更少，查询一个元素所需的次数更少，搜索效率高。并且当元素顺序插入时，二叉树高度为结点数量，查询效率低。
- 树的每个结点保存在一个磁盘块中，从根节点开始查询某关键字需要，将路径上的所有磁盘块读入内存，由于磁盘块大小固定，在B+树中，非叶节点不包含该关键字对应记录的存储地址，只起到索引作用。可以使每个磁盘块包含更多的关键字，使得B+树的阶更大，树高更小，读取磁盘次数更少，查找更快。相比于B树，每个结点中都包含了关键字对应记录的信息，使得每个磁盘块存储的关键字个数变少，树高增大，查找速度变慢。
- 相对于Hash索引，其只支持精确匹配，而B+树还支持范围匹配及排序操作

> Hash索引

![image-20240712113933352](https://gitee.com/cmyk359/img/raw/master/img/image-20240712113933352-2024-7-1211:39:55.png)

Hash索引的特点：

- Hash索引只能用于对等比较（=，in），不支持范围查询（between，>，<，...）
- 无法利用索引完成排序操作
- 查询效率高，通常只需要一次检索就可以了，效率通常要高于B+tree索引

在MySQL中，支持hash索引的是Memory引擎，而InnoDB中具有自适应hash功能，hash索引是存储引擎根据B+Tree索引在指定条件下自动构建的。

### 3.3、索引分类

- 按「数据结构」分类：B+tree索引、Hash索引、R-tree索引、Full-text索引。

  ![](https://gitee.com/cmyk359/img/raw/master/img/image-20240712105833956-2024-7-1210:58:58.png)

- 按「字段特性」分类：主键索引、唯一索引、普通索引、全文索引。

  ![](https://gitee.com/cmyk359/img/raw/master/img/image-20250310210719745-2025-3-1021:07:25.png)

- 按「字段个数」分类：单列索引、联合索引。

- 按「物理存储存储形式」分类：聚簇索引（主键索引）、二级索引（辅助索引）。

  ![](https://gitee.com/cmyk359/img/raw/master/img/image-20250310211009999-2025-3-1021:10:11.png)

  聚集索引选取规则：

  - 如果存在主键，主键索引就是聚集索引。
  - 如果不存在主键，将使用第一个唯一（UNIQUE）索引作为聚集索引。
  - 如果表没有主键，或没有合适的唯一索引，则InnoDB会自动生成一个rowid作为隐藏的聚集索引。

  ![](https://gitee.com/cmyk359/img/raw/master/img/image-20240712151114687-2024-7-1215:11:15.png)

  > 注：二级索引中不仅仅有该字段对应的聚集索引id，还有索引字段本身的值。

***

回表查询：指通过⼆级索引找到对应的主键值，然后再通过主键值查询聚簇索引中对应的整⾏数据的过程。

![](https://gitee.com/cmyk359/img/raw/master/img/image-20240712151257432-2024-7-1215:13:03.png)



由此可知：当id为主键，且name字段设置了索引的情况下，第一条sql的执行效率更高

```sql
select * from user where id = 10;

select * from user where name = "jack";
```



### 3.4、SQL性能分析

#### SQL执行频率

MySQL客户端连接成功后，通过show[session|global]status命令可以提供服务器状态信息。通过如下指令，可以查看当前数据库的INSERT、UPDATE、DELETE、SELECT的访问频次：

```mysql
show global status like "Com_______";
```

![image-20240712154433897](https://gitee.com/cmyk359/img/raw/master/img/image-20240712154433897-2024-7-1215:45:03.png)



#### 慢查询日志

慢查询日志记录了所有执行时间超过指定参数（long_query_time，单位：秒，默认10秒）的所有SQL语句的日志。通过慢查询日志定位执行较慢的sql语句，针对这些慢sql进行优化。

MySQL的慢查询日志默认没有开启

![image-20240712154859197](https://gitee.com/cmyk359/img/raw/master/img/image-20240712154859197-2024-7-1215:49:03.png)

需要在MySQL的配置文件（/etc/my.cnf）中配置如下信息：

![image-20240712154916297](https://gitee.com/cmyk359/img/raw/master/img/image-20240712154916297-2024-7-1215:50:03.png)

当出现慢sql时会记录在localhost-slow.log中，其中对一条慢SQL的记录内容如下

![image-20240712160914148](https://gitee.com/cmyk359/img/raw/master/img/image-20240712160914148-2024-7-1216:09:35.png)

#### profile详情

show profiles 能够在做SQL优化时帮助我们了解时间都耗费到哪里去了，查看各个sql语句的执行耗时

- 查看是否支持profile操作

  ```mysql
  select @@have_profiling;
  ```

  ![image-20240712165548802](https://gitee.com/cmyk359/img/raw/master/img/image-20240712165548802-2024-7-1216:56:01.png)

- 查看是否开启profile功能

  ```mysql
  select @@profiling;
  ```

  ![image-20240712165651959](https://gitee.com/cmyk359/img/raw/master/img/image-20240712165651959-2024-7-1216:56:52.png)

- 开启profile功能

  ```sql
  set profiling = 1;
  ```

  ![image-20240712165738387](https://gitee.com/cmyk359/img/raw/master/img/image-20240712165738387-2024-7-1216:57:38.png)



```mysql
# 查看每条sql的耗时基本情况
show profiles;

#查看指定query_id的SQL语句各个阶段的耗时情况
show profile for query query_id;

#查看指定query_id的SQL语句的cpu使用情况
show profile cpu for query query_id;
```

![image-20240712171227231](https://gitee.com/cmyk359/img/raw/master/img/image-20240712171227231-2024-7-1217:12:27.png)



#### explain执行计划

使用`explain`查看指定sql语句的执行计划，了解MySQL如何处理该SQL语句，表的加载顺序，表是如何连接，以及索引使用情况。是SQL优化的重要工具，主要用于分析查询语句或表结构的性能瓶颈。

![image-20240712220857971](https://gitee.com/cmyk359/img/raw/master/img/image-20240712220857971-2024-7-1222:09:03.png)

explain 出来的信息有10列，分别是：

id:选择标识符
select_type:表示查询的类型。
table:输出结果集的表
partitions:匹配的分区
type:表示表的连接类型
possible_keys:表示查询时，可能使用的索引
key:表示实际使用的索引
key_len:索引字段的长度
ref:列与索引的比较
rows:扫描出的行数(估算的行数)
filtered:按表条件过滤的行百分比
Extra:执行情况的描述和说明

1. `id`

   select查询的序列号，表示查询中**执行select子句或者是操作表**的<u>顺序</u>

   - id相同执行顺序由上到下
   - 如果是子查询，id的序号会递增。在所有组中，id值越大，优先级越高，越先执行

   例如：查询没有选张三老师课的学生的学号和姓名（见最下SQL练习的第五题）

   ```mysql
   -- 3、返回没有选张三老师课的学生的学号和姓名
   SELECT st.s_id, st.s_name
   FROM student st
   WHERE st.s_id NOT IN (
   	-- 2、返回选了张三老师课的学生id
   	SELECT DISTINCT s.s_id
   	FROM score s 
   	WHERE s.c_id IN (
   		-- 1、连接course表和teacher表，从中选出张三老师教的所有课的c_id
   		SELECT c.c_id 
   		FROM
   			course c
   			INNER JOIN teacher t ON ( c.t_id = t.t_id AND t.t_name = "张三" ) 
   	)
   );	
   ```

   ![image-20240712223235874](https://gitee.com/cmyk359/img/raw/master/img/image-20240712223235874-2024-7-1222:32:46.png)

   从中可以看出内部的多个子查询的id都为2，外部的查询id为1。并且在多个子查询中，操作表的顺序是从内到外的，先是teacher表，再是course表，最后是score表。

   

2. select_type

   表示查询的类型。

   (1) SIMPLE(简单SELECT，不使用UNION或子查询等)

   (2) PRIMARY(子查询中最外层查询，查询中若包含任何复杂的子部分，最外层的select被标记为PRIMARY)

   (3) SUBQUERY(子查询中的第一个SELECT，结果不依赖于外部查询)

   (4) DEPENDENT SUBQUERY(子查询中的第一个SELECT，依赖于外部查询)

   (5) DERIVED(派生表的SELECT, FROM子句的子查询)

   (6) UNCACHEABLE SUBQUERY(一个子查询的结果不能被缓存，必须重新评估外链接的第一行)

   (7) UNION(UNION中的第二个或后面的SELECT语句)

   (8) DEPENDENT UNION(UNION中的第二个或后面的SELECT语句，取决于外面的查询)

   (9) UNION RESULT(UNION的结果，union语句中第二个select开始后面所有select)

3. table

   显示数据来自于哪个表，有时不是真实的表的名字,可能是简称，例如上面的t，c，也可能是第几步执行的结果的简称。

4. partitions

5. `type`

   表示连接类型，性能由好到差的连接类型为NULL、system、const、eq_ref、ref、range、index、all。

   - all：Full Table Scan， MySQL将遍历全表以找到匹配的行

   - index: Full Index Scan，all和index都是读全表，但index是从索引中检索的，而all是从硬盘中检索的。index类型只遍历索引树

   - range:只检索给定范围的行，一般条件查询中出现了>、<、in、between等查询，使用一个索引来选择行

   - ref: 使用<u>非唯一行索引</u>进行查询

   - eq_ref: 类似ref，区别就在使用的索引是<u>唯一索引</u>。简单来说，就是多表连接中使用primary key或者 unique key作为关联条件

   - const: 当MySQL对查询某部分进行优化，并转换为一个常量时，使用这些类型访问。如将主键置于where列表中，MySQL就能将该查询转换为一个常量
   - system是const类型的特例，当查询的表只有一行的情况下，使用system

   - NULL: MySQL在优化过程中分解语句，<u>令其执行时甚至不用访问表或索引</u>

6. `possible_keys`

   显示可能应用在这张表中的索引，但**不一定被查询实际使用**

7. `key`

   实际使用的索引，如果为NULL，则没有使用索引。

8. `key_len`

   表示索引中使用的字节数，可通过该列计算查询中使用的索引的长度。一般来说，索引长度越长表示精度越高，效率偏低；长度越短，效率高，但精度就偏低。并不是真正使用索引的长度，是个预估值。

9. ref

   哪些列或常量被用于查找索引列上的值

10. rows

    MySQL认为必须要执行查询的行数，在innodb引擎的表中，是一个估计值，可能并不总是准确的。

11. filtered

    表示返回结果的行数占需读取行数的百分比，filtered 的值越大越好。

12. `Extra`

    一些重要的额外信息

    - **Using filesort**：使用外部的索引排序，而不是按照表内的索引顺序进行读取。（一般需要优化）
    - **Using temporary**：使用了临时表保存中间结果。常见于排序order by和分组查询group by（最好优化）
    - **Using index**：表示select语句中使用了覆盖索引，直接从索引中取值，而不需要回表查询（从磁盘中取数据）
    - Using where：使用了where过滤
    - Using index condition：表示查询的列有非索引的列，需要进行回表查询
    - Using join buffer：使用了连接缓存
    - impossible where： where子句的值总是false

### 3.5、索引使用规则

#### 验证索引的效率

```mysql
-- 在user表中插入100万数据，再查询其中一条数据，感受加不加索引的区别

CREATE TABLE `app_user` (
`id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
`name` VARCHAR(50) DEFAULT '',
`email` VARCHAR(50) NOT NULL,
`phone` VARCHAR(20) DEFAULT '',
`gender` TINYINT(4) UNSIGNED DEFAULT '0',
`password` VARCHAR(100) NOT NULL DEFAULT '',
`age` TINYINT(4) DEFAULT NULL,
`create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
`update_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8


-- SET GLOBAL log_bin_trust_function_creators = 1;-- 开启创建函数功能
/*
  第一个语句 delimiter 将 mysql 解释器命令行的结束符由”;” 改成了”$$”，
  让存储过程内的命令遇到”;” 不执行
*/
DELIMITER $$
CREATE FUNCTION mock_data()
RETURNS INT
BEGIN
	DECLARE num INT DEFAULT 1000000;
	DECLARE i INT DEFAULT 0;
	WHILE i<num DO
		INSERT INTO `app_user`(`name`,`email`,`phone`,`gender`)VALUES(CONCAT('用户',i),'19224305@qq.com','123456789',FLOOR(RAND()*2));
		SET i=i+1;
	END WHILE;
	RETURN i;
END;$$

SELECT mock_data()$$ -- 执行此函数 生成一百万条数据



-- 不加索引查询
SELECT * FROM `app_user` WHERE `name` = '用户99999'
> OK
> 时间: 0.332s
-- 添加索引后查询
CREATE INDEX index_app_user_name ON app_user ( `name` );

SELECT * FROM `app_user` WHERE `name` = '用户99999'
> OK
> 时间: 0.001s
```



#### 最左前缀法则

如果索引了多列（联合索引），要遵守最左前缀法则。

**最左前缀法则**指的是在查询时，必须从联合索引的最左边开始，并且不能跳过索引中的列。

- 如果查询条件中缺失最左侧的索引字段，则后面的字段查询都不会使用索引。


- 如果跳跃某一列，则该列后面的字段索引失效（部分失效）


例如：在tb_user表中，已对 profession、age、status建立了联合索引，现验证最左前缀法则

![image-20240713171404644](https://gitee.com/cmyk359/img/raw/master/img/image-20240713171404644-2024-7-1317:14:16.png)

`explain select * from tb_user where profession =·软件工程'and age = 31 and status = '0';`该sql语句符合最左前缀法则，索引已生效，联合索引字段长度为54

![image-20240713171720088](https://gitee.com/cmyk359/img/raw/master/img/image-20240713171720088-2024-7-1317:17:20.png)

`explain select * from tb_user where age = 31 and status = '0';`此sql语句中最左侧索引字段缺失，该语句未使用索引

![image-20240713172401186](https://gitee.com/cmyk359/img/raw/master/img/image-20240713172401186-2024-7-1317:24:42.png)

`explain select * from tb_user where profession = 软件工程'and age = 31；`此sql语  句中索引最左侧字段存在，且中间没有缺失其他索引字段，故索引也生效，此时索引长度为49

![image-20240713172135947](https://gitee.com/cmyk359/img/raw/master/img/image-20240713172135947-2024-7-1317:21:42.png)

`explain select * from tb_user where profession =·软件工程'and status = '0';`

该sql语句中，只提供了联合索引中的profession和status字段，中间的age字段缺失，此时索引部分生效，索引字段长度为47，只有profession的查询使用了索引，但status没有使用索引

![image-20240713172650355](https://gitee.com/cmyk359/img/raw/master/img/image-20240713172650355-2024-7-1317:27:42.png)

#### 索引失效情况

1. 索引列运算

   不要在索引列上进行运算操作，索引将失效。

   ![image-20240713174016271](https://gitee.com/cmyk359/img/raw/master/img/image-20240713174016271-2024-7-1317:40:42.png)

2. 字符串不加引号

   字符串类型字段使用时未加引号，会进行隐式类型转换造成索引失效。

   ![image-20240713174559698](https://gitee.com/cmyk359/img/raw/master/img/image-20240713174559698-2024-7-1317:46:42.png)

3. 模糊查询

   如果仅仅是尾部模糊匹配，索引仍会生效。但如果是头部模糊匹配，索引失效。

   ![image-20240713175107252](https://gitee.com/cmyk359/img/raw/master/img/image-20240713175107252-2024-7-1317:51:42.png)

4. 范围查询右边的列，不能使用索引。

   ![](https://gitee.com/cmyk359/img/raw/master/img/image-20250310220922166-2025-3-1022:09:23.png)

5. or连接的条件

   用or分割开的条件，如果or前的条件中的列有索引，而后面的列中没有索引，那么涉及的索引都不会被用到。（前边有索引但后边没有，则索引不会生效；两边都有索引时，索引才会生效）

   例如：在tb_user表中，age字段没有建立索引。执行`select * from tb_user where id = 10 or age = 23;`时，由于id为主键，存在主键索引，但age没有索引，执行过程中索引不会生效。

   ![image-20240713175731784](https://gitee.com/cmyk359/img/raw/master/img/image-20240713175731784-2024-7-1317:57:42.png)

   为age字段建立索引后，再执行该语句

   ![image-20240713180018863](https://gitee.com/cmyk359/img/raw/master/img/image-20240713180018863-2024-7-1318:00:42.png)

6. 数据分布

   如果MySQL评估使用索引比全表扫描更慢，则不使用索引。

   比如在一张表中已对某个字段建立了索引，但使用该索引字段查询到的结果<u>基本上是整张表的数据，或是整张表的大部分数据</u>，经过MySQL评估后，不会使用索引而是进行全表扫描（`避免进行回表查询`）。但若是主键索引，即使查询结果时整张表的数据，但还是一定会使用主键索引。

   例：tb_user表中，已对phone字段建立了索引，且表中phone的最小值为 "17799990000"。执行

   `select * from tb_user where phone >= '17799990000';`得到的结果为整张表的数据，查看该sql的执行计划可知，索引不会生效

   ![image-20240713181911044](https://gitee.com/cmyk359/img/raw/master/img/image-20240713181911044-2024-7-1318:19:42.png)

   但若是主键索引一定会生效，如：dish表中id最小为46，执行`select * from dish where id >= 46`得到的也是整张表的数据，但主键索引还是生效了

   ![image-20240713182126019](https://gitee.com/cmyk359/img/raw/master/img/image-20240713182126019-2024-7-1318:21:42.png)



#### SQL提示

![image-20240713183235664](https://gitee.com/cmyk359/img/raw/master/img/image-20240713183235664-2024-7-1318:32:42.png)

#### 覆盖索引

覆盖索引是指：指查询使用了索引，返回的列，必须在索引中全部能够找到

> 如果返回的列中没有创建索引，有可能会触发回表查询，尽量避免使用select*

例：在tb_user表中，已经对 profession，age，status建立了联合索引，分别执行以下sql，查看其执行计划。

1、`select id, profession,age,status from tb_user where profession = '软件工程' and age = 31 and status = '0';`其执行计划中Extra列的信息为：<u>Using where; Using index</u>

![image-20240713185911831](https://gitee.com/cmyk359/img/raw/master/img/image-20240713185911831-2024-7-1318:59:42.png)

2、`select id, profession,age,status, name from tb_user where profession = '软件工程' and age = 31 and status = '0';`相比于上一条sql，这条sql的查询结果中需要返回的列多了一个name字段。其执行计划的Extra列的信息为：<u>Using index condition</u>

![image-20240713185952078](https://gitee.com/cmyk359/img/raw/master/img/image-20240713185952078-2024-7-1319:00:42.png)



![image-20240713190303548](https://gitee.com/cmyk359/img/raw/master/img/image-20240713190303548-2024-7-1319:03:04.png)



由于对profession、age、status建立的联合索引索引二级索引（辅助索引），在二级索引的叶子结点中不仅包含了对应索引字段的值，还包括该记录对应的聚集索引的id（一般是主键id）。

故对应第一条sql语句，其需要返回的字段在二级索引树上全部都能查到，直接返回结果，一次索引扫描即可，不需要回表查询。但对于第二条sql，其返回结果中多出了二级索引树上没有的name字段，此时需要根据当前的聚集索引id，在聚集索引中进行回表查询，得到完整的记录，从中得到name字段，整合后返回。



图示如下：

![是覆盖索引](https://gitee.com/cmyk359/img/raw/master/img/image-20240713190928026-2024-7-1319:09:42.png)

![不是覆盖索引，需要回表查询](https://gitee.com/cmyk359/img/raw/master/img/image-20240713191033317-2024-7-1319:10:42.png)

***

思考：一张表，有四个字段（id，username，password，status），由于数据量大，需要对以下SQL语句进行优化，该如何进行才是最优方案：

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250310213250626-2025-3-1021:32:53.png)

答：对username 和 password建立联合索引，使用覆盖索引，避免回表查询



#### 前缀索引

一、前缀索引
当字段类型为字符串（ varchar ， text ， longtext 等）时，有时候需要索引很长的字符串，这会让
索引变得很大，查询时，浪费大量的磁盘 IO ， 影响查询效率。此时可以只将字符串的一部分前缀，建立索引，这样可以大大节约索引空间，从而提高索引效率。

1. 语法 

  ```sql
  create index idx_xxxx on table_name(column(n)) ;
  ```

   示例:

  为 tb_user 表的 email 字段，建立长度为 5 的前缀索引。

  ```sql
  create index index_email on tb_user(email(5));
  ```

  ![前缀索引-1](https://img-blog.csdnimg.cn/direct/315660d9baf0456db40d15ffd11f4475.png)




2. 如何选择前缀长度
       可以根据索引的`选择性`来决定，而选择性是指`不重复的索引值（基数）`和`数据表的记录总数`的**比值**，索引选择性越高则查询效率越高， 唯一索引的选择性是1 ，这是最好的索引选择性，性能也是最好的。

  下面这里我们看一下案例：

  ```sql
  select count(distinct email)/count(*) from tb_user;
  ```

  ![前缀索引-2](https://img-blog.csdnimg.cn/direct/12ffdc72e70f42eeb16dc585ab7bb7aa.png)

   可以看到上面显示的是1，也就是说所有的email字段的数据都没有出现重复，下面我们去从email字段数据去截取前5个字符比较试试看：

  ```sql
  select count(distinct substring(email,1,5)) / count(*) from tb_user ;
  ```

  ![前缀索引-3](https://img-blog.csdnimg.cn/direct/12ffdc72e70f42eeb16dc585ab7bb7aa.png)

  这里我们可以看出出现重复了，但是非重复率还是有0.9583的，如果我们截取前4个或者前6个字符再试试看重复率：

  ```sql
  #截取前四个
  select count(distinct substring(email,1,4)) / count(*) from tb_user ;
  ```

  ![前缀索引-4](https://img-blog.csdnimg.cn/direct/f673ce33855541d498f0e8c8d7e5ade5.png)

  ```sql
  #截取前6个
  select count(distinct substring(email,1,6)) / count(*) from tb_user ;
  ```

  ![前缀索引-5](https://img-blog.csdnimg.cn/direct/85b0f173fd704df1aab543ea750dfec3.png)


  上面这两个对比就知道，截取前4个的话重复率变大了，而截取前6个的话重复率不变 ，故最优解就是截取前面前5个即可。

3. 前缀索引的查询流程
       前缀索引的查询流程基本上跟前面讲到过的是差不多的，这里会通过我们选择好的前缀去建立一个辅助索引，在辅助索引上面去找到相对应的索引目标，如果出现重复的话就会先找到第一个重复的索引数据，然后再去进行回表查询得到对应行完整的数据，如果完整数据中的对应字段与查询条件相同，则返回改行数据；反之继续遍历下一个重复的结果。

  ![前缀索引-6](https://img-blog.csdnimg.cn/direct/5914eaa0180445c6b12f2c8ebc41c2ee.png)

#### 单列索引&联合索引

单列索引：即一个索引只包含单个列。

联合索引：即一个索引包含了多个列。

查看当前tb_user表中建立的索引情况：

![image-20240719100709418](https://gitee.com/cmyk359/img/raw/master/img/image-20240719100709418-2024-7-1910:07:44.png)



在tb_user表中已经针对 phone和name分别建立了单列索引，此时执行一条sql，以phone和name为查询条件，查看其执行计划

```sql
explain select id,phone,name from tb_user where phone='17799990000' and name='吕布';
```

![image-20240719101022564](https://gitee.com/cmyk359/img/raw/master/img/image-20240719101022564-2024-7-1910:10:22.png)

可能用到的索引为index_phone和index_name，但实际上在执行这条sql时MySQL只用到了其中的一个索引index_phone。在针对phone建立的索引树中并没有name字段，故还要进行回表查询。



对phone和name建立联合索引后，执行该sql，再次查询执行计划

```sql
create unique index idx_user_phone_name on tb_user(phone,name);
explain select id,phone,name from tb_user where phone='17799990000' and name='吕布';
```

![image-20240719101448693](https://gitee.com/cmyk359/img/raw/master/img/image-20240719101448693-2024-7-1910:14:52.png)

发现此时，MySQL使用的还是index_phone。<u>在多条件联合查询时，MySQL优化器会评估哪个字段的索引效率更高，会选择该索引完成本次查询。</u>

此时可以通过SQL提示，建议MySQL使用联合索引，而在联合索引中包含 phone、name的信息，在叶子节点下挂的是对应的主键id，所以查询是无需回表查询的。

```sql
explain select id,phone,name from tb_user use index(idx_user_phone_name)where phone='17799990010' and name='韩信';
```

![image-20240719101848501](https://gitee.com/cmyk359/img/raw/master/img/image-20240719101848501-2024-7-1910:18:52.png)

> **在业务场景中，如果存在多个查询条件，考虑针对于查询字段建立索引时，建议建立联合索引，而非单列索引。**

如果查询使用的是联合索引，具体的结构示意图如下：

![image-20240719102106348](https://gitee.com/cmyk359/img/raw/master/img/image-20240719102106348-2024-7-1910:21:52.png)

根据索引定义顺序，在B+树中先按照phone进行排序，phone相同再按照name进行排序。注意联合索引使用时要遵循`最左前缀法则`。

### 3.6、索引设计原则

针对什么表建立索引？针对表中的那些字段建立索引？建立什么类型的索引？

1. 针对于数据量较大，且**查询比较频繁**的表建立索引。
2. 针对于常作为查询条件（where）、排序（order by）、分组（group by）操作的字段建立索引。
3. 尽量选择区**分度高的列**作为索引，尽量建立唯一索引，区分度越高，使用索引的效率越高
4. 如果是字符串类型的字段，字段的长度较长，可以针对于字段的特点，建立前缀索引。
5. **尽量使用联合索引，减少单列索引**，查询时，联合索引很多时候可以覆盖索引，节省存储空间， 避免回表，提高查询效率。注意联合索引使用时要遵循`最左前缀法则`。
6. 要控制索引的数量，索引并不是多多益善，索引越多，维护索引结构的代价也就越大，会影响增删改的效率。
7. 如果索引列不能存储NULL值，请在创建表时使用NOT NULL约束它。当优化器知道每列是否包含NULL值时，它可以更好地确定哪个索引最有效地用于查询



## 四、SQL优化

### 4.1、插入数据

平时我们插入数据的时候一般都是一个语句插一个数据，如下所示：

```sql
insert into tb_test values(1,'tom');
insert into tb_test values(2,'cat');
insert into tb_test values(3,'jerry');
.....
```

每条insert语执行时都需要和MySQL建立/释放连接，开启和提交事务，执行SQL语句，进行数据传输，当时数据量较大时效率很低。

如果我们需要一次性往数据库表中插入多条记录，可以从以下三个方面进行优化。

1. insert插入的优化方案

   （1）优化方案一：**批量插入**

   ```sql
   Insert into tb_test values(1,'Tom'),(2,'Cat'),(3,'Jerry');
   ```

    相较于一条语句插入一个数据，一次性插入批量数据效率必然是更高的，这就不需要多次开启和提交事务了，节约时间。

   （2）优化方案二：**手动提交事务**

   ```sql
   start transaction;
   insert into tb_test values(1,'Tom'),(2,'Cat'),(3,'Jerry');
   insert into tb_test values(4,'Tom'),(5,'Cat'),(6,'Jerry');
   insert into tb_test values(7,'Tom'),(8,'Cat'),(9,'Jerry');
   commit;
   ```

   手动控制事务，其实这个语句的就是方法1的本质，也就是通过一次事务去提交，避免多次开启事务的情况。

   （3）优化方案三：**主键顺序插入**

   主键顺序插入，性能要高于乱序插入。这个应该没什么好多说了，排序肯定是需要耗时间的。

   ```bash
   主键乱序插入 : 8 1 9 21 88 2 4 15 89 5 7 3
   主键顺序插入 : 1 2 3 4 5 7 8 9 15 21 88 89
   ```

   

2. 大批量插入数据
   如果一次性需要插入大批量数据 ( 比如 : 几百万的记录 ) ，使用 insert 语句插入性能较低，此时可以使用 MySQL 数据库提供的`load指令`进行插入(**在load时，主键顺序插入性能高于乱序插入**)。操作如下： 
   ![load指令](https://img-blog.csdnimg.cn/direct/8cdd02cbdfb64c6c9d181e69ec7d6e9b.png)

   可以执行如下指令，将数据脚本文件中的数据加载到表结构中：

   ```mysql
   -- 客户端连接服务端时，加上参数 -–local-infile
   mysql –-local-infile -u root -p
    
   -- 设置全局参数local_infile为1，开启从本地加载文件导入数据的开关
   set global local_infile = 1;
    
   -- 执行load指令将准备好的数据，加载到表结构中
   load data local infile '/root/sql1.log' into table tb_user fields
   terminated by ',' lines terminated by '\n' ;
   ```

   补充：对于load指令的语句中，fields terminated by意思是每一个字段之间间隔符号用什么

   lines terminated by意思是每一行间距是用什么。

### 4.2、主键优化

在上面，我们提到，主键顺序插入的性能是要高于乱序插入的。 这一小节，就来介绍一下具体的原因，然后再分析一下主键又该如何设计。

1. **数据组织方式**

   在 InnoDB 存储引擎中，**表数据都是根据主键顺序组织存放的**，这种存储方式的表称为索引组织表(index organized table IOT)

   ![image-20240720093108993](https://gitee.com/cmyk359/img/raw/master/img/image-20240720093108993-2024-7-2009:31:12.png)

   行数据，都是存储在聚集索引的叶子节点上的。而根据 InnoDB 的逻辑结构图：

   ![image-20240711104512418](https://gitee.com/cmyk359/img/raw/master/img/image-20240711104512418-2024-7-1110:45:17.png)

   在 InnoDB 引擎中，数据行是记录在逻辑结构 page 页中的，而每一个页的大小是固定的，默认 16K 。那也就意味着， 一个页中所存储的行也是有限的，如果插入的数据行row 在该页存储不下，将会存储到下一个页中，页与页之间会通过指针连接。

   

2. **页分裂**

   页可以为空，也可以填充一半，也可以填充 100% 。每个页包含了 2-N 行数据 ( 如果一行数据过大，会行溢出) ，根据主键排列。

   > 主键顺序插入效果

   ① . 从磁盘中申请页， 主键顺序插入

   ![image-20240720093553745](https://gitee.com/cmyk359/img/raw/master/img/image-20240720093553745-2024-7-2009:35:54.png)

   ②. 第一个页没有满，继续往第一页插入

   ![image-20240720093614767](https://gitee.com/cmyk359/img/raw/master/img/image-20240720093614767-2024-7-2009:36:23.png)

   ③ . 当第一个也写满之后，再写入第二个页，页与页之间会通过指针连接

   ![image-20240720093649301](https://gitee.com/cmyk359/img/raw/master/img/image-20240720093649301-2024-7-2009:37:23.png)

   ④. 当第二页写满了，再往第三页写入    

   ![image-20240720093735297](https://gitee.com/cmyk359/img/raw/master/img/image-20240720093735297-2024-7-2009:38:24.png)

   > 主键乱序插入效果

   ① . 当1#,2#页都已经写满了，存放了如图所示的数据

   ![image-20240720093843413](https://gitee.com/cmyk359/img/raw/master/img/image-20240720093843413-2024-7-2009:39:23.png)

   ② . 此时再插入 id 为 50 的记录，我们来看看会发生什么现象

   ![image-20240720093908409](https://gitee.com/cmyk359/img/raw/master/img/image-20240720093908409-2024-7-2009:40:23.png)

   会再次开启一个页，写入新的页中吗？答案是不会。因为，索引结构的叶子节点是有顺序的。按照顺序，应该存储在 47 之后。但是47所在的1#页，已经写满了，存储不了50对应的数据了。 那么此时会开辟一个新的页 3#

   ![image-20240720093956540](https://gitee.com/cmyk359/img/raw/master/img/image-20240720093956540-2024-7-2009:41:23.png)

    但是并不会直接将50存入3#页，而是会将1#页后一半的数据，移动到3#页，然后在3#页，插入50。

   ![image-20240720094028985](https://gitee.com/cmyk359/img/raw/master/img/image-20240720094028985-2024-7-2009:42:16.png)

   此时，这三个页之间的数据顺序是有问题的。 1# 的下一个页，应该是3# ， 3# 的下一个页是 2# 。 所以，此时，需要重新设置链表指针。

   ![image-20240720094114446](https://gitee.com/cmyk359/img/raw/master/img/image-20240720094114446-2024-7-2009:42:19.png)

   上述的这种现象，称之为 "`页分裂`"，是比较耗费性能的操作。

3. 页合并

   目前表中已有数据的索引结构 ( 叶子节点)如下：

   ![image-20240720094212022](https://gitee.com/cmyk359/img/raw/master/img/image-20240720094212022-2024-7-2009:42:20.png)

   当我们对已有数据进行删除时，具体的效果如下 :

   当删除一行记录时<u>，实际上记录并没有被物理删除，只是记录被标记（ flaged ）为删除并且它的空间变得允许被其他记录声明使用。</u>

   ![image-20240720094328067](https://gitee.com/cmyk359/img/raw/master/img/image-20240720094328067-2024-7-2009:43:28.png)

   继续删除2#的内容，当页中删除的记录达到 MERGE_THRESHOLD （默认为页的 50% ），InnoDB会开始寻找最靠近的页（前或后）看看是否可以将两个页合并以优化空间使用。

   ![image-20240720094843818](https://gitee.com/cmyk359/img/raw/master/img/image-20240720094843818-2024-7-2009:49:18.png)

   ![image-20240720094915435](https://gitee.com/cmyk359/img/raw/master/img/image-20240720094915435-2024-7-2009:49:19.png)

   这个里面所发生的合并页的这个现象，就称之为 "`页合并`"

4. **主键设计原则**

   - 满足业务需求的情况下，尽量降低主键的长度。（<u>在二级索引的叶子结点中保存着主键，如果主键过长，二级索引较多，会占用较大的磁盘空间，且在搜索时会进行大量的磁盘IO</u>	）
   - 插入数据时，尽量选择顺序插入。（<u>乱序插入可能会导致页分裂，插入效率低</u>）
   - 选择使用AUTO_INCREMENT自增主键，尽量不要使用UUID做主键或者是其他自然主键，如身份证号。（<u>这些是无序的，且长度较长</u>）
   - 业务操作时，避免对主键的修改。（<u>还要修改二级索引的内容</u>）

### 4.3、order by优化

MySQL 的排序，有两种方式：

- Using filesort : 通过表的索引或全表扫描，读取满足条件的数据行，然后在<u>排序缓冲区sort buffer中完成排序操作</u>，所有不是通过索引直接返回排序结果的排序都叫 FileSort 排序。（如果缓冲区满了，会进一步在磁盘中进行排序）
- Using index : 通过有序索引顺序扫描直接返回有序数据，这种情况即为 using index，不需要 额外排序，操作效率高。

**对于以上的两种排序方式，Using index的性能高，而Using filesort的性能低，我们在优化排序操作时，尽量要优化为Using index。**

SQL排序使用了哪种方式，可以通过`explain`在SQL语句执行计划的 Extra字段查看

> 测试索引对排序的效果

1、在tb_user表中，删除age和phone的索引，再根据这两个字段进行排序，查看其执行计划.

```sql
explain select id ,age ,phone from tb_user order by age;
```

![image-20240720101450542](https://gitee.com/cmyk359/img/raw/master/img/image-20240720101450542-2024-7-2010:14:50.png)

```sql
explain select id,age,phone from tb_user order by age, phone ;
```

![image-20240720101228160](https://gitee.com/cmyk359/img/raw/master/img/image-20240720101228160-2024-7-2010:12:33.png)

由于 age, phone 都没有索引，所以此时再排序时，出现Using filesort， 排序性能较低。



2、创建索引后，再次进行排序，查看执行计划

```sql
-- 创建索引
create index idx_age_phone on tb_user(age,phone);
```

> 默认age和phone都是升序建立的索引

A. 根据age, phone进行**升序排序**

```sql
explain select id,age,phone from tb_user order by age;
```

![image-20240720101717524](https://gitee.com/cmyk359/img/raw/master/img/image-20240720101717524-2024-7-2010:17:17.png)

```sql
explain select id,age,phone from tb_user order by age , phone; 
```

![image-20240720101747424](https://gitee.com/cmyk359/img/raw/master/img/image-20240720101747424-2024-7-2010:18:10.png)

B. 根据age，phone进行**降序排序**

```sql
explain select id,age,phone from tb_user order by age desc , phone desc ;
```

![image-20240720102255101](https://gitee.com/cmyk359/img/raw/master/img/image-20240720102255101-2024-7-2010:22:55.png)

> 注：由于age和phone都是升序建立的索引，当排序时两者都是升序，排序方式是Using index；当两者都是降序时，Extra中也是Using index，但多了 Backward index scan，这个代表反向扫描索引，因为在 MySQL 中我们创建的索引，默认索引的叶子节点是从小到大排序的，而此时我们查询排序时，是从大到小，所以，在扫描时，就是反向扫描，就会出现 Backward index scan 。 

C.  **对于排序使用联合索引的情况，排序时 , 也需要满足最左前缀法则 , 否则也会出现 filesort 。**因为在创建索引的时候， age 是第一个字段， phone 是第二个字段，所以排序时，也就该按照这个顺序来，否则就会出现 Using filesort。



D. 排序时**根据age升序排序，根据phone降序排序**

```sql
explain select id,age,phone from tb_user order by age asc ,phone desc ;
```

![image-20240720102448603](https://gitee.com/cmyk359/img/raw/master/img/image-20240720102448603-2024-7-2010:25:15.png)

因为创建索引时，如果未指定顺序，默认都是按照升序排序的（A是表示升序asc，D的话是表示降序desc），而**查询时，一个升序，一个降序，此时就会出现Using filesort** 。

![image-20240720102604013](https://gitee.com/cmyk359/img/raw/master/img/image-20240720102604013-2024-7-2010:26:04.png)

为了解决上述问题，为了解决上述的问题，我们可以创建一个索引，这个联合索引中 age 升序排序， phone 倒序排序。

```sql
create index idx_age_phone_ad on tb_user(age asc ,phone desc);
```

再次执行上述排序SQL,查看其执行计划，其中排序方法为Using index

![image-20240720103026285](https://gitee.com/cmyk359/img/raw/master/img/image-20240720103026285-2024-7-2010:30:34.png)



**由上述的测试,我们得出order by优化原则:**

A. 根据排序字段建立合适的索引，多字段排序时，也遵循最左前缀法则。

B. 尽量使用覆盖索引。（以上排序方法为Using index 的前提是使用覆盖索引，否则要进行回表查询，得到数据后在排序缓冲区中进行排序，效率低）

C. 多字段排序 , 一个升序一个降序，此时需要注意联合索引在创建时的规则（ ASC/DESC ）。

D. 如果不可避免的出现 filesort ，大数据量排序时，可以适当增大排序缓冲区大小 sort_buffer_size(默认 256k) 。

### 4.4、group by优化

在分组操作时，可以通过索引来提高效率 （尽量建立联合索引）。

A.  在没有索引的情况下，执行如下 SQL ，查询执行计划：

```sql
explain select profession , count(*) from tb_user group by profession ;
```

![image-20240721100347253](https://gitee.com/cmyk359/img/raw/master/img/image-20240721100347253-2024-7-2110:03:50.png)

B. 针对于 profession ， age ， status 创建一个联合索引后执行相同的SQL，查看执行计划

```sql
-- 创建联合索引
create index idx_user_pro_age_sta on tb_user(profession , age , status);

--执行上述SQL
explain select profession , count(*) from tb_user group by profession ;
```

![image-20240721100608323](https://gitee.com/cmyk359/img/raw/master/img/image-20240721100608323-2024-7-2110:06:09.png)

> **注：在Group By中使用联合索引也要遵循最左前缀法则**

### 4.5、limit优化

**对应limit分页操作，在大数据的情况下，分页内容越靠后效率越低**。如：limit 2000000，10，此时需要MySQL排序前2000010 记录，仅仅返回2000000-2000010的记录，其他记录丢弃，查询排序的代价非常大。

优化策略：**覆盖索引 + 子查询**

```sql
--在 tb_sku表中查询 2000000 ~ 2000010范围内的数据

-- 先查询到该范围内记录的id，此时使用了覆盖索引，再将查询到的id作为临时表与原表关联后做等价查询
select t.* from tb_sku t, (select id from tb_sku order by id limit 2000000,10) a
where t.id = a.id;
```



### 4.6、count优化

```sql
explain select count(*) from tb_user ;
```

- MyISAM 引擎把一个表的总行数存在了磁盘上，因此执行 count（\*）的时候会直接返回这个数，效率很高；
- InnoDB引擎就麻烦了，它执行count（*）的时候，需要把数据一行一行地从引擎里面读出来，然后累积计数。

优化思路：**自己计数**，利用key-value内存级别的数据库，如Redis，在其中设置一个字段total保存表中记录数。当在表中新增一条记录时，total加1；当在表中删除一条记录时，total减一。



**常见count的几种用法和其效率的对比：**

{% note info%}

**count（）是一个聚合函数，对于返回的结果集，一行行地判断，如果 count 函数的参数不是 NULL，累计值就加 1，否则不加，最后返回累计值。**

{% endnote %}



按照效率排序的话，count（字段）< count（主键 id）< count（1）= count（\*），所以尽量使用count（*）。

- count（主键）

  InnoDB 引擎会遍历整张表，把每一行的主键id值都取出来，返回给服务层。服务层拿到主键后，直接按行进行累加（主键不可能为null）。

- count（字段）

  没有not null约束：InnoDB 引擎会遍历整张表把每一行的字段值都取出来，返回给服务层，服务层判断是否为null，不为null，计数累加。

  有not null 约束：InnoDB 引擎会遍历整张表把每一行的字段值都取出来，返回给服务层，直接按行进行累加。

- count（数字）

  InnoDB 引擎遍历整张表，但**不取值**。服务层对于返回的每一行，放一个数字（如0,-1,1等）进去，直接按行进行累加。

- count（*）

  InnoDB引擎并不会把全部字段取出来，而是专门做了优化，**不取值**，服务层直接按行进行累加。



### 4.7、update优化

**InnoDB的行锁是针对<u>索引</u>加的锁，不是针对记录加的锁，并且该索引不能失效，否则会从行锁升级为表锁。**

在执行update语句时要根据索引字段进行匹配，否则行锁就会升级为表锁，降低并发性能。

```mysql
-- id为主键，有唯一索引
update student set no='2000100100' where id = 1; -- 会为id为1的记录添加行锁

-- 若未给name字段创建索引，使用name进行匹配，会使用表锁
update student set no ='2000100105'where name ='韦一笑';
```





### 总结

![image-20240721105139164](https://gitee.com/cmyk359/img/raw/master/img/image-20240721105139164-2024-7-2110:51:49.png)

## 五、视图/存储过程/触发器

### 5.1、视图

视图是从一个或几个基本表（或视图）中导出的表，是一种‌**虚拟表**‌，其内容基于对底层物理表的查询结果。数据库中只存放视图的定义，**视图不存储实际数据，而是通过保存查询语句动态生成数据‌**，这些数据仍存放在原来的基本表中。

视图就像一个窗口，透过它可以看到数据库中自己感兴趣的数据及其变化。

#### 创建视图

```mysql
CREATE VIEW view_name [(column_list)]
AS 
SELECT column1, column2...
FROM table_name
[WHERE condition]
[WITH [CASCADED | LOCAL] CHECK OPTION]; -- 控制更新约束
```

- **WITH CHECK OPTION**‌：强制所有通过视图更新的数据必须满足视图的WHERE条件‌。
  - `CASCADED`：检查当前视图和所有底层视图的条件‌。
  - `LOCAL`：仅检查当前视图的条件（默认值）‌
- 组成视图的属性列名或者全部省略或者全部指定，没有第三种选择。如果省略了，则视图的列名默认与子查询的`SELECT`字段名一致‌。但在下列三种情况下必须明确指定视图的所有列名：
  - 某个目标列不是单纯的属性名，而是聚集函数或者列表达式
  - 多表连接时选出了几个同名列作为视图的字段
  - 需要在视图中为某个列启用新的更合适的名字

执行创建视图语句的结果只是把视图的定义存入数据字典，并不执行其中的SELECT语句。只是在对视图查询时，才按视图的定义从基本表中将数据查出。

定义基本表时，为了减少数据库中的冗余数据，表中只存放基本数据，由基本数据经过各种计算派生出的数据一般是不存储的。由于视图中的数据并不实际存储，所以定义视图时可以根据应用需要设置一些派生属性的列，也称虚拟列。带虚拟列的视图也称为带表达式的视图

```mysql
-- 定义一个反映学生出生年份的视图
CREATE VIEW BT_S(Sno, Sname, Sbirth)
AS
SELECT Sno, Sname, 2024 - Sage
FROM Student;

-- 将学生的学号及平均成绩定义为一个视图
-- AS 子句中SELECT语句的目标列平均成绩是通过聚集函数得到的，索引CREATE VIEW中必须明确定义组成S_G视图的各个属性列名
CREATE VIEW S_G(Sno, Gavg)
AS
SELECT Sno, AVG(Grage)
FROM SC
GROUP BY Sno;
```



#### 删除视图

```mysql
-- 删除视图
DROP VIEW [IF EXISTS] view_name[CASCADE];
```

视图删除后，视图的定义将从数据字典中移除。如果该视图上还导出了其他视图，则使用CASCADE级联删除语句把该视图和由他导出的所有视图一起删除。

基本表删除后，有基本表导出的所有视图均无法使用了，但是视图的定义没有从数据字典中清除，需要显式调用DROP VIEW语句。

#### 查询视图

视图定义后，可以像对基本表一样对视图进行查询了。

执行对视图的查询时，首先进行有效性检查，检查查询涉及的表、视图是否存在。如果存在，则从数据字典中取出视图定义，把定义中的子查询和对视图的查询结合起来，转化成等价的对基本表的查询，然后执行修正了的查询。

```mysql 
-- 查询视图定义语句
SHOW CREATE VIEW 视图名
	
-- 查询视图

```

#### 视图的作用



### 5.2、存储过程

[参考视频](https://www.bilibili.com/video/BV1Kr4y1i7ru?p=102&vd_source=51d78ede0a0127d1839d6abf9204d1ee)

### 5.3、触发器

[参考视频](https://www.bilibili.com/video/BV1Kr4y1i7ru?p=116&vd_source=51d78ede0a0127d1839d6abf9204d1ee)

## 六、锁

### 6.1、概述

锁是计算机协调多个进程或线程并发访问某一资源的机制。在数据库中，除传统的计算资源（CPU、RAM，I/O）的争用以外，数据也是一种供许多用户共享的资源。如何保证数据并发访问的一致性、有效性是所有数据库必须解决的一个问题，锁冲突也是影响数据库并发访问性能的一个重要因素。从这个角度来说，锁对数据库而言显得尤其重要，也更加复杂。



分类：MySQL中的锁，按照锁的粒度分，分为以下三类：

- 全局锁：锁定数据库中的所有表。
- 表级锁：每次操作锁住整张表。
- 行级锁：每次操作锁住对应的行数据。

### 6.2、全局锁

全局锁就是对整个数据库实例加锁，加锁后整个实例就处于**只读状态**，后续的DML的写语句，DDL语句，已经更新操作的事务提交语句都将被阻塞。

```mysql
-- 添加全局锁
flush tables with read lock;

-- 释放全局锁
unlock tables;
```



其典型的使用场景是**做全库的逻辑备份**，对所有的表进行锁定，从而获取一致性视图，保证数据的完整性。其过程如下：

![image-20240721111958996](https://gitee.com/cmyk359/img/raw/master/img/image-20240721111958996-2024-7-2111:20:02.png)

{% note warning%}

mysqldump是MySQL提供的工具，不是MySQL的命令，直接在命令行中执行即可。

{% endnote%}

数据库中加全局锁，是一个比较重的操作，存在以下问题：

- 如果在主库上备份，那么在备份期间都不能执行更新，业务基本上就得停摆。
- 如果在从库上备份，那么在备份期间从库不能执行主库同步过来的二进制日志（binlog），会导致主从延迟。

在InnoDB引擎中，我们可以在备份时加上参数`--single-transaction` 参数来完成**不加锁**的一致性数据备份(底层通过快照读的方式实现)

```sql
mysqldump --single-transcation -uroot -pliuhao123 shcool > school.sql
```





### 6.3、表级锁

表级锁，每次操作锁住整张表。锁定粒度大，发生锁冲突的概率最高，并发度最低。应用在MyISAM，InnoDB、BDB等存储引擎中。

对于表级锁，主要分为以下三类：

- 表锁
- 元数据锁（meta data lock，MDL）
- 意向锁

#### 表锁

对于表锁，分为两类

1. 表共享读锁（也称为共享锁，Shared Lock，**S锁**）
2. 表独占写锁（也称为排它锁，Exclusive Lock，**X锁**）

表锁的获取和释放通常由数据库管理系统自动管理。在执行一些操作，如SELECT ... FOR UPDATE、LOCK TABLES等时，事务会自动获取表锁，在事务提交或回滚时自动释放。

但也有一些显式的方法可以控制表锁的获取和释放。

```sql
-- 加读/写锁
lock tables 表名... read/write;
-- 释放读/写锁
unlock tables;(或者客户端断开连接)
```



对一张表添加了读锁后，当前事务只能读，而不能写；并且读锁不会阻塞其他事务的读操作，但会阻塞写操作

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250413095206325-2025-4-1309:52:19.png" style="zoom:80%;" />

对一张表添加了写锁后，当前事务既能对其读又能对其写；并且写锁既会阻塞其他事务的读，也会阻塞写

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250413095904722-2025-4-1309:59:10.png" style="zoom:80%;" />



表锁是一种粒度较粗的锁机制，多个事务可能因为需要访问同一张表而发生锁冲突，会对数据库的并发性能产生较大的影响。

#### 元数据锁

**元数据锁**（Metadata Lock，**MDL**） 是一种用于保护数据库对象（如表、视图、存储过程等）**元数据一致性**的锁机制。它的核心目的是确保在并发操作中，数据库对象的结构（如表的列定义、索引等）不会在事务执行期间被意外修改，从而避免数据不一致或查询错误。

{% note info %}

**元数据（Metadata）** 是指描述数据库对象结构和属性的数据，它不存储实际的数据记录，而是存储数据库对象（如表、视图、索引、存储过程等）的定义信息。

元数据是数据库正常运行的基础，它可以通过DDL修改，如`ALTER TABLE` 修改表结构、`DROP TABLE` 删除表。如果 DDL 操作与其他事务的 DML（如 SELECT, INSERT）并发执行，可能导致数据不一致（如列数变化）或查询失败（表被删除），同时也会影响事务的一致性。

{% endnote %}



为什么需要元数据锁（核心作用）：

- **防止 DDL 与 DML 冲突**。当有事务正在读取或修改数据（DML），时，元数据锁会阻止其他会话修改表结构（DDL）。反之，如果某个会话正在执行 DDL 操作（如修改表结构），其他会话的 DML 或 DDL 操作会被阻塞，直到元数据锁释放。
- **保证事务一致性**。在事务中，元数据锁确保表结构在事务生命周期内保持稳定。

当我们对数据库表进行操作时，会**自动**给这个表加上 MDL。**当对一张表进行增删改查的时候，加MDL读锁（共享）；当对表结构进行变更操作的时候，加MDL写锁（排他）**。

- DML 操作会自动获取 `MDL_SHARED_READ` 或 `MDL_SHARED_WRITE` 锁，并在事务提交或回滚后释放。
- DDL 操作自动获取 `MDL_EXCLUSIVE` 锁，执行完成后立即释放。
- 通过 `LOCK TABLES ... READ/WRITE` 显式加锁（较少使用）

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250413105421865-2025-4-1310:54:24.png" style="zoom:80%;" />

```sql
-- 查看元数据锁
select object_type, object_schema, object_name, lock_type, lock_duration from performance_schema.metadata_locks ;
```





#### 意向锁

意向锁是一种“声明”锁，本身并不直接作用于表或行，而是用于表示事务对某个资源（如表或页）的锁意图。具体来说：

- **意向共享锁（Intention Shared Lock，IS）**：表示事务打算在某个页或表中获取共享锁（S 锁）。
  - 由语句 select...lock in share mode添加。
  - **当事务需要在某个表中获取共享锁（S 锁）时，会在表级先获取一个 IS 锁。**
  - 它与表锁的共享锁兼容，与表锁排它锁互斥。
- **意向排他锁（Intention Exclusive Lock，IX）**：表示事务打算在某个页或表中获取排他锁（X 锁）。
  - 由insert、update、delete、select...for update 添加。
  - **当事务需要在某个表中获取排他锁（X 锁）时，会在表级先获取一个 IX 锁。**
  - 与表锁的共享锁及排它锁都互斥。意向锁之间不会互斥。

意向锁的作用是协调不同粒度的锁（如表锁和行锁）之间的关系，避免死锁并提高并发性能。

在没有意向锁时，当一个事务执行update语句，给对应行添加了行锁；另一个事务想要给表添加表锁时，需要逐行检查每条记录是否有添加锁以及加锁的类型，最后判断能否加锁成功，效率很低。

有了意向锁后，能够快速判断表里是否有记录被加锁，直接根据意向锁以及意向锁的类型，判断当前表锁能否添加成功，不用再逐行检查。	

可以通过以下SQL，查看意向锁及行锁的加锁情况：

```mysql
select object_schema, object_name, index_name, lock_type, lock_mode, lock_data from performance_schema.data_locks;
```

### 6.4、行级锁

行级锁，每次操作锁住对应的行数据。锁定粒度最小，发生锁冲突的概率最低，并发度最高。应用在InnoDB存储引擎中。

InnoDB的数据是基于索引组织的，**行锁是通过对索引上的索引项加锁来实现的**，而不是对记录加的锁。

行级锁主要分为以下两类

- 共享锁（Shared Lock，S锁）：允许事务读取数据，阻止其他事务获取<u>相同数据集</u>的排他锁。多个事务可同时持有共享锁‌
- 排它锁（Exclusive Lock，X锁）：允许事务更新或删除数据，阻止其他事务获取<u>相同数据集</u>的共享锁或排他锁‌
- <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250413152113042-2025-4-1315:21:14.png" alt="锁直接的兼容情况" style="zoom:80%;" />

常见数据库操作语句所添加的锁的类型：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250413152932835-2025-4-1315:29:33.png" style="zoom:80%;" />

***

行级锁的三种实现形式：

1. **行锁（Record Lock）**：锁定**单个行记录**，防止其他事务对此行进行update和delete。在RC、RR隔离级别下都支持。

2. **间隙锁（Gap Lock）**：锁定‌**索引记录之间的间隙**‌（不存在实际数据的区间）不包含记录本身。防止其他事务在这个间隙插入新数据，产生幻读。在RR隔离级别下都支持。

3. **临键锁（Next-Key Lock）**：记录锁+间隙锁的组合‌，锁定**某一行记录及其之前的索引记录间隙**，防止其他事务在查询范围内插入新的记录，产生幻读问题。

默认情况下，InnoDB在 REPEATABLE READ事务隔离级别运行，<span style="color:red">InnoDB默认使用 **临键锁**进行搜索和索引扫描</span>，以**防止幻读**。

InnoDB的行锁是针对于**索引**加的锁，<u>当未使用索引或全盘扫描时</u>，那么InnoDB将对表中的所有记录加锁，此时<span style="color:red">行级锁会升级为表锁</span>。

等值查询下的锁降级机制：

1. 当使用‌**唯一索引的等值查询命中记录**‌时，临键锁会退化为‌**行锁**‌，仅锁定目标行而非相邻间隙‌。
2. 当使用**普通索引的等值查询命中记录**时，会对匹配的记录添加行锁，并为其前后的索引值间隙添加间隙锁，防止其他事务在该记录的前后插入索引值相同新的记录。
3. 当‌使用**索引的等值查询未命中任何记录**‌时（包括唯一索引和普通索引），临键锁退化为‌**间隙锁**‌，仅锁定查询值所在的索引间隙‌



范围查询下的加锁情况：

1. 使用**唯一索引**进行范围查询时，如查询条件是 `id >= 7`，若表中有id为7的记录，会首先给这条记录加行锁；若没有，则为`id = 7`所在的间隙加上临键锁。之后会为范围内每个索引值间隙加临键锁。(总之会锁定范围内的所有记录和间隙，防止插入数据导致幻读)

   ```mysql
   -- test表内容如下，id为主键，且为age字段添加了普通索引
   +----+-------+------+
   | id | name  | age  |
   +----+-------+------+
   |  1 | jack  |  101 |
   |  3 | rose  |  103 |
   |  7 | C     |  107 |
   | 11 | xxxx  |  111 |
   | 19 | Jones |  119 |
   | 25 | Lucy  |  125 |
   +----+-------+------+
   -- 在一个事务中，使用根据id进行范围查询
   -- 例一：
   select * from test where id < 8 lock in share mode;
   -- 临键锁（共享）的加锁区间为：（-∞，1],(1,3],(3,7],(7,11]
   +---------------+-------------+------------+-----------+-----------+-----------+
   | object_schema | object_name | index_name | lock_type | lock_mode | lock_data |
   +---------------+-------------+------------+-----------+-----------+-----------+
   | school        | test        | NULL       | TABLE     | IS        | NULL      |
   | school        | test        | PRIMARY    | RECORD    | S         | 1         |
   | school        | test        | PRIMARY    | RECORD    | S         | 3         |
   | school        | test        | PRIMARY    | RECORD    | S         | 7         |
   | school        | test        | PRIMARY    | RECORD    | S         | 11        |
   +---------------+-------------+------------+-----------+-----------+-----------+
   -- 例二
    select * from test where  id >= 7 for update;
   -- 首先为id为7的记录加上行锁，之后为(7,11],(11,19],(19,25],(25,+∞]
   +---------------+-------------+------------+-----------+---------------+------------------------+
   | object_schema | object_name | index_name | lock_type | lock_mode     | lock_data              |
   +---------------+-------------+------------+-----------+---------------+------------------------+
   | school        | test        | NULL       | TABLE     | IX            | NULL                   |
   | school        | test        | PRIMARY    | RECORD    | X,REC_NOT_GAP | 7                      |
   | school        | test        | PRIMARY    | RECORD    | X             | supremum pseudo-record |
   | school        | test        | PRIMARY    | RECORD    | X             | 11                     |
   | school        | test        | PRIMARY    | RECORD    | X             | 19                     |
   | school        | test        | PRIMARY    | RECORD    | X             | 25                     |
   +---------------+-------------+------------+-----------+---------------+------------------------+
   ```

   

2. 使用**普通索引**进行范围查询时，如查询条件为`age >= 107`，若表中有age为107的记录，则为它加上行锁；否则，为`age = 107`所在的间隙加上临键锁。之后会为范围内所有索引值对应的**记录**加上行锁，再为范围内每个索引值间隙加临键锁。

   ```mysql
   -- test表内容如下，id为主键，且为age字段添加了普通索引
   +----+-------+------+
   | id | name  | age  |
   +----+-------+------+
   |  1 | jack  |  101 |
   |  3 | rose  |  103 |
   |  7 | C     |  107 |
   | 11 | xxxx  |  111 |
   | 19 | Jones |  119 |
   | 25 | Lucy  |  125 |
   +----+-------+------+
   -- 在一个事务中，使用根据age字段进行范围查询
   -- 例一：
   select * from test where age < 110 lock in share mode;
   -- 加锁分析：为所有age < 110的记录加上行锁，
   --    	   为age在以下间隙加上临键锁(-∞,101],(101,103],(103,107],(107,111]
   +---------------+-------------+------------+-----------+---------------+-----------+
   | object_schema | object_name | index_name | lock_type | lock_mode     | lock_data |
   +---------------+-------------+------------+-----------+---------------+-----------+
   | school        | test        | NULL       | TABLE     | IS            | NULL      |
   | school        | test        | idx_age    | RECORD    | S             | 101, 1    |
   | school        | test        | idx_age    | RECORD    | S             | 103, 3    |
   | school        | test        | idx_age    | RECORD    | S             | 107, 7    |
   | school        | test        | idx_age    | RECORD    | S             | 111, 11   |
   | school        | test        | PRIMARY    | RECORD    | S,REC_NOT_GAP | 1         |
   | school        | test        | PRIMARY    | RECORD    | S,REC_NOT_GAP | 3         |
   | school        | test        | PRIMARY    | RECORD    | S,REC_NOT_GAP | 7         |
   +---------------+-------------+------------+-----------+---------------+-----------+
   
   -- 例二：
   select * from test where age >= 111 for update;
   -- 加锁分析：为所有 age >= 111的记录加上行锁
   -- 	       为age在以下间隙加上临键锁：(107,111],(111,119],(119,125],(125,+∞)
   +---------------+-------------+------------+-----------+---------------+------------------------+
   | object_schema | object_name | index_name | lock_type | lock_mode     | lock_data              |
   +---------------+-------------+------------+-----------+---------------+------------------------+
   | school        | test        | NULL       | TABLE     | IX            | NULL                   |
   | school        | test        | idx_age    | RECORD    | X             | supremum pseudo-record |
   | school        | test        | idx_age    | RECORD    | X             | 111, 11                |
   | school        | test        | idx_age    | RECORD    | X             | 119, 19                |
   | school        | test        | idx_age    | RECORD    | X             | 125, 25                |
   | school        | test        | PRIMARY    | RECORD    | X,REC_NOT_GAP | 11                     |
   | school        | test        | PRIMARY    | RECORD    | X,REC_NOT_GAP | 19                     |
   | school        | test        | PRIMARY    | RECORD    | X,REC_NOT_GAP | 25                     |
   +---------------+-------------+------------+-----------+---------------+------------------------+
   ```

   







## 七、InnoDB存储引擎详解

### 7.1、逻辑存储结构

InnoDB 是 MySQL 的默认存储引擎，其逻辑存储结构以 **表空间（Tablespace）** 为核心，通过分层设计实现高效的数据管理和事务支持。以下是其核心逻辑单元的层次关系：

```bash
表空间（Tablespace）→ 段（Segment）→ 区（Extent）→ 页（Page）→ 行（Row）
```



![](https://gitee.com/cmyk359/img/raw/master/img/image-20250312105005237-2025-3-1210:50:10.png)



- 表空间，分为系统表空间和独立表空间（具体见磁盘架构）

  - 系统表空间：默认文件为 `ibdata1`，存储数据字典（表、列、索引的元数据）、变更缓冲区（Change Buffer）、双写缓冲区（Doublewrite Buffer）、Undo 日志（Undo Logs）的默认存储位置。
  - 独立表空间：每个表单独存储为 `.ibd` 文件，需配置 `innodb_file_per_table=ON`，包含表的数据和索引以及表级的 Undo 日志。

- 段，分为数据段、索引段、回滚段，InnoDB是索引组织表，数据段就是B+树的叶子节点，索引段即为B+树的非叶子节点。段用来管理多个Extent（区）。

- 区，表空间的单元结构，每个区的大小为1M。默认情况下，InnoDB存储引擎页大小为**16K**，即一个区中一共有64个连续的页。

- 页，是InnoDB存储引擎磁盘管理的**最小单元**，每个页的大小默认为16KB。为了保证页的连续性，InnoDB存储引擎每次从磁盘申请 4-5 个区。

- 行，是**实际存储用户数据的单元**，InnoDB存储引擎数据是按行进行存放的。行记录由<u>隐藏字段</u>和<u>用户数据</u>组成。其中隐藏字段包括：`Trx_id`、`Roll_ptr`、`Row_id`

  - `Trx_id`：每次对某条记录进行改动时，都会把对应的事务id赋值给trx_id隐藏列。

  - `Roll_ptr`：每次对某条引记录进行改动时，都会把旧的版本写入到undo日志中，然后这个隐藏列就相当于一个指针，可以通过它来找到该记录修改前的信息。

  - `Row_id`：隐藏主键，如果表结构没有指定主键，将会生成该隐藏字段。

    ![](https://gitee.com/cmyk359/img/raw/master/img/image-20250312110952600-2025-3-1211:09:54.png)

### 7.2、架构

MySQL5.5 版本开始，默认使用InnoDB存储引擎，它擅长事务处理，具有崩溃恢复特性，在日常开发中使用非常广泛。下面是InnoDB架构图，左侧为内存结构，右侧为磁盘结构：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250312111300584-2025-3-1211:13:01.png" style="zoom:80%;" />

#### 内存架构

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250312111516116-2025-3-1211:15:24.png" alt="InnoDB存储引擎的内存架构" style="zoom:80%;" />

***

​	Buffer Pool：缓冲池是主内存中的一个区域，里面可以缓存磁盘上经常操作的真实数据，在执行增删改查操作时，先操作缓冲池中的数据（若缓冲池没有数据，则从磁盘加载并缓存），然后再以一定频率刷新到磁盘，从而减少磁盘IO，加快处理速度。

缓冲池以Page页为单位，底层采用链表数据结构管理Page。根据状态，将Page分为三种类型：

- free page：空闲page，未被使用。
- clean page：被使用page，数据没有被修改过。
- dirty page：脏页，被使用page，数据被修改过，也中数据与磁盘的数据产生了不一致。

***

​	Change Buffer：更改缓冲区（针对于非唯一二级索引页），在执行DML语句时，如果这些数据Page没有在Buffer Pool中，不会直接操作磁盘，而会将数据变更存在更改缓冲区 Change Buffer 中，在未来数据被读取时，再将数据合并恢复到Buffer Pool中，再将合并后的数据刷新到磁盘中。

为什么要用Change Buffer？

​	与聚集索引不同，二级索引通常是非唯一的，并且以相对**随机**的顺序插入二级索引。同样，删除和更新可能会影响索引树中不相邻的二级索引页，如果每一次都操作磁盘，会造成大量的磁盘IO。有了Change Buffer之后，我们可以在缓冲池中进行合并处理，减少磁盘IO。

***

Adaptive Hash Index：自适应hash索引，自动为高频访问的索引键值创建哈希索引，加速等值查询。InnoDB存储引擎会监控对表上各索引页的查询，如果观察到hash索引可以提升速度，则建立hash索引，称之为自适应hash索引。**自适应哈希索引，无需人工干预，是系统根据情况自动完成。**

***

Log Buffer：日志缓冲区，用来保存要写入到磁盘中的log日志数据（**redo log**、**undo log**），默认大小为16MB，日志缓冲区的日志会定期刷新到磁盘中。如果需要更新、插入或删除许多行的事务，增加日志缓冲区的大小可以节省磁盘IO。

参数：

- innodb_log_buffer_size：缓冲区大小
- innodb_flush_log_at_trx_commit：日志刷新到磁盘时机
  - 1：日志在每次事务提交时写入并刷新到磁盘
  - 0：每秒将日志写入并刷新到磁盘一次。
  - 2：日志在每次事务提交后写入，并每秒刷新到磁盘一次。

#### 磁盘架构

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250312113022121-2025-3-1211:30:23.png" alt="InnoDB的磁盘架构" style="zoom:80%;" />



***

System Tablespace：**系统表空间**是更改缓冲区的存储区域。如果表是在系统表空间而不是每个表文件或通用表空间中创建的，它也可能包含表和索引数据。（在MySQL5.x版本中还包含InnoDB数据字典、undolog等）

参数：`innodb_data_file_path`

***

File-Per-Table Tablespaces：每个表的文件表空间包含单个InnoDB表的数据和索引，并存储在文件系统上的单个数据文件中。

参数：`innodb_file_pr_table`，开启后每个表都会有一个独立的表空间，单独存储为 `.ibd` 文件

***

General Tablespaces：通用表空间，需要通过`CREATE TABLESPACE`语法创建通用表空间，在创建表时，可以指定该表空间。

```mysql
-- 创建表空间
CREATE TABLESPACE xxxx ADD 
DATAFILE 'file_name'
ENGINE = engine_name;
-- 创建表时指定要使用的表空间
CREATE TABLE xx... TABLESPACE ts_name;
```

***

Undo Tablespaces：撤销表空间，MySQL实例在初始化时会自动创建两个默认的undo表空间（初始大小16M），用于存储undo log日志。

***

Temporary Tablespaces：InnoDB使用会话临时表空间和全局临时表空间。存储用户创建的临时表等数据。

***

Doublewrite Buffer Files：双写缓冲区，innoDB引擎将数据页从Buffer Pool刷新到磁盘前，先将数据页写入双写缓冲区文件中，便于系统异常时恢复数据。

***

Redo Log：重做日志，是**用来实现事务的持久性**。

该日志文件由两部分组成：重做日志缓冲区（redo log buffer）以及重做日志文件（redo log），前者是在内存中，后者在磁盘中。当事务提交之后会把所有修改信息以**循环方式**写入两个重做日志文件，用于在刷新脏页到磁盘时，发生错误时，进行数据恢复使用。

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250312095419808-2025-3-1209:54:33.png)

#### 后台线程

InnoDB的后台线程主要负责各种维护任务，比如刷新脏页、合并插入缓冲区、清理Undo日志等等。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250312153240660-2025-3-1215:32:42.png" style="zoom:80%;" />

1. Master Thread

   核心后台线程，负责调度其他线程，还负责将缓冲池中的数据异步刷新到磁盘中，保持数据的一致性，还包括脏页的刷新、合并插入缓存、undo页的回收。

2. IO Thread

   在InnoDB存储引擎中大量使用了**AIO**(异步非阻塞IO)来处理IO请求，这样可以极大地提高数据库的性能，而IO Thread主要负责这些IO请求的回调。

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250312153042354-2025-3-1215:30:55.png" style="zoom:80%;" />

3. Purge Thread

   主要用于回收事务已经提交了的undo log，在事务提交之后，undo log可能不用了，就用它来回收。

4. Page Cleaner Thread

   协助 Master Thread 刷新脏页到磁盘的线程，它可以减轻 Master Thread 的工作压力，减少阻塞。

### 7.3、事务原理

事务 是一组操作的集合，它是一个不可分割的工作单位，事务会把所有的操作作为一个整体一起向系统提交或撤销操作请求，即这些操作要么同时成功，要么同时失败。

事务的特性：ACID，原子性、一致性、隔离性、持久性。

MySQL InnoDB 引擎通过什么技术来保证事务的这四个特性的呢？

- 持久性是通过 redo log （重做日志）来保证的；
- 原子性是通过 undo log（回滚日志） 来保证的；
- 隔离性是通过 MVCC（多版本并发控制） 和 锁 机制来保证的；
- 一致性则是通过持久性+原子性+隔离性来保证；

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250312153544178-2025-3-1215:35:48.png" style="zoom:80%;" />

#### redo log

Redo Log：重做日志，是**用来实现事务的持久性**，即已提交的事务对数据的修改即使在系统崩溃后也不会丢失。

该日志文件由两部分组成：重做日志缓冲区（redo log buffer）以及重做日志文件（redo log），前者是在内存中，后者在磁盘中。当事务提交之后会把所有修改信息都存到该日志文件中，用于在刷新脏页到磁盘，发生错误时，进行数据恢复使用。

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250312095419808-2025-3-1209:54:33.png)

Redo Log的工作流程：

- 事务对数据进行修改时，InnoDB 先将修改写入 **内存中的缓冲池（Buffer Pool）**，生成对应的 **脏页（Dirty Page）**。同时，生成描述该修改的 Redo Log 记录，暂存到 Log Buffer（日志缓冲区）。

- 事务提交时，InnoDB 将 Log Buffer 中的 Redo Log 记录根据参数`innodb_flush_log_at_trx_commit`指定的策略刷入磁盘：

  - 1（默认）：立即将 Log Buffer 内容写入 **Redo Log 文件**，并调用 `fsync()` 确保数据落盘。**严格保证持久性**，但性能较低。
  - 0：每秒将 Log Buffer 内容写入 Redo Log 文件并刷盘。**可能丢失最近 1 秒的提交**，性能高。
  - 2：立即写入 Redo Log 文件，但每秒刷盘一次。**仅丢失操作系统崩溃未刷盘的数据**，性能介于前两者之间。

- 后台线程，如 **Page Cleaner Thread**，将缓冲池中的脏页**异步刷新**到磁盘的数据文件，Redo Log 的存在使得脏页刷新无需实时完成，即使脏页未刷盘，崩溃后仍可通过 Redo Log 恢复数据。

  > 所有修改先记录日志，再异步刷脏页，即**日志优先（Write-Ahead Logging, WAL）**

- Redo Log 文件以循环方式写入。当日志文件写满时，触发 Checkpoint（检查点）机制：将已持久化到数据文件的修改对应的 Redo Log 标记为可覆盖，确保恢复时只需处理 Checkpoint 之后的日志。

**Redo Log 的核心作用**

- 持久性保证：记录事务对数据的物理修改，确保提交后的修改能通过日志恢复。
- 高性能写入：通过 **顺序 I/O** 写入日志文件，避免直接修改数据文件的随机 I/O 开销。



#### undo log

回滚日志，用于记录数据被修改前的信息，作用包含两个：提供回滚和MVCC（多版本并发控制）。

undo log和 redo log记录物理日志不一样，它是**逻辑日志**。当事务对数据进行修改时，InnoDB 会生成对应的 **Undo Log 记录**，保存修改前的数据状态。

| **操作类型**  | **Undo Log 内容**            | **回滚动作**               |
| ------------- | ---------------------------- | -------------------------- |
| INSERT        | 新插入行的主键值             | 删除该行（逻辑标记为删除） |
| UPDATE/DELETE | 修改前的完整数据行（旧版本） | 恢复旧数据                 |

当执行rollback时，就可以从undo log中的逻辑记录读取到相应的内容并进行回滚。

***

Undo Log 默认存储在 **系统表空间**（`ibdata1`）或独立的 **Undo 表空间**中，采用段的方式进行管理和记录，存放在前面介绍的rollback segment回滚段中，内部包含1024个undo log segment。

事务提交和回滚

- 事务提交后，Undo Log 不会立即删除，而是标记为“可清理”，供其他事务的 MVCC 读操作使用，后台的 Purge Thread 异步清理不再需要的 Undo Log。
- 事务回滚时，根据 Undo Log 逆向执行操作，回滚完成后，相关 Undo Log 标记为可清理。

#### MVCC

##### 基本概念

- 当前读

  读取的是记录的最新版本，读取时还要保证其他并发事务不能修改当前记录，会对读取的记录进行加锁。

  如：select ...lock in share mode（共享锁），select...for update，update，insert，delete（排他锁)是一种当前读。

- 快照读

  简单的select（不加锁）就是快照读，快照读，读取的是记录数据的可见版本，有可能是历史数据，不加锁，是非阻塞读。在不同的隔离级别下，快照读的情况不同：

  - Read Committed（读已提交）：每次select，都生成一个快照读。
  - Repeatable Read（可重复读）：开启事务后第一个select语句才是快照读的地方。
  - Serializable（串行化）：快照读会退化为当前读。

MVCC，全称 Multi-Version Concurrency Control，**多版本并发控制**。它为数据库中的每一行数据保存多个版本，使得事务可以根据自己的隔离级别需求，看到某个时间点的一致性数据视图，而无需阻塞其他事务的读写操作。

MVCC的具体实现，依赖于数据库记录中的三个隐式字段、undo log日志和readView。

***

三个隐藏字段：一个表结构中，除了创建表时定义的列外，InnoDB引擎还维护了三个隐藏列

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250312110952600-2025-3-1211:09:54.png)

- `DB_TRX_ID`：最近修改事务ID，记录插入这条记录或最后一次修改该记录的事务ID。
- `DB_ROLL_PTR`：**回滚指针**，指向该行的 **上一个版本** 在 Undo Log 中的位置
- `DB_ROW_ID`：隐藏主键，如果表结构没有指定主键，将会生成该隐藏字段。

***

undo log，回滚日志，在insert、update、delete的时候产生的便于数据回滚的日志。

- 当insert的时候，产生的undo log日志只在回滚时需要，在事务提交后，可被立即删除。
- 而update，delete的时候，产生的undo log日志不仅在回滚时需要，在快照读时也需要，不会立即被删除。

undo log **版本链**

​	每行数据会保存多个历史版本，每个版本对应不同事务的修改，每个版本通过隐藏字段`DB_TRX_ID`记录创建该版本的事务ID，通过`DB_ROLL_PTR`指向上一个版本。

​	不同事务或相同事务对同一条记录进行修改，会导致该记录的undo log生成一条记录版本链表，版本链通过 `DB_ROLL_PTR `连接成一个链表。链表的头部是最新的旧记录，链表尾部是最早的旧记录。

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250312164647046-2025-3-1216:46:51.png)

***

**ReadView**（读视图）是**快照读**SQL执行时MVCC提取数据的依据，其实就是一个保存事务ID的list列表。当一个事务需要读取数据时，为了确定该事务能看到哪些行的哪些版本，它会根据当前数据库状态生成一个快照 Read View，其中包含了生成该视图时数据库中所有活跃（未提交）事务的信息。

ReadView中包含了四个核心字段：

- `m_ids`：当前活跃的事务ID集合
- `min_trx_id`：最小活跃事务 ID（小于它的事务都已提交）
- `max_trx_id`：下一个待分配事务 ID（大于或等于它的事务都还未开始）
- `creator_trx_id`：ReadView创建者的事务ID

不同的隔离级别，生成ReadView的时机不同：

- READ COMMITTED（读已提交）：在事务中每一次执行快照读时生成ReadView。

- REPEATABLE READ（可重复读）：仅在事务中第一次执行快照读时生成ReadView，后续复用该ReadView。

##### 原理分析

当一个事务读取数据时，沿着版本链查找，根据 Read View 判断版本可见性

1. `DB_TRX_ID` ==0或`creator_trx_id`，表明该记录从未被修改过 或 是当前事务自己修改的，则该本对当前事务可见。
2. `DB_TRX_ID` < `min_trx_id`：表明生成该版本的事务在生成ReadView前已经提交，所以该版本**可以**被当前事务访问。
3. `DB_TRX_ID` => `max_trx_id`：表明生成该版本的事务在生成ReadView 后才生成，所以该版本**不可以**被当前事务访问。
4. `DB_TRX_ID`在` min_trx_id` 和 `max_trx_id` 之间
   - <u>不在</u> `m_ids `列表中：表明创建 ReadView 时生成该版本的事务已经被提交，该版本**可以**被访问。
   - <u>在</u> `m_ids` 列表中：表明创建 ReadView 时生成该版本的事务还是活跃的，该版本**不可以**被访问。

如果某个版本的数据对当前事务不可见的话，那就顺着版本链找到下一个版本的数据，继续按照上边的步骤判断可见性，依此类推，直到版本链中的最后一个版本，如果最后一个版本也不可见的话，那么就意味着该条记录对该事务不可见，查询结果就不包含该记录。



例如：目前活跃的四个事务如下，各个事务对同一行数据修改的undo log版本链如下，在RC隔离级别下，事务5的两次查询都会生成Read View，分析两次查询到的数据是什么：

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250312172415625-2025-3-1217:24:22.png)

第一次查询时，数据库中该条记录隐藏字段`DB_TRX_ID`所指出最近修改该记录的事务id是4，根据ReadView判断数据版本可见性的规则，事务4在` min_trx_id` 和 `max_trx_id` 之间，且<u>在</u> `m_ids` 列表中，故该版本数据不可见；查看版本链中下一个数据版本，它的`DB_TRX_ID`是3，它也在<u>在</u> `m_ids` 列表中，对应的数据版本不可见；继续查看下一个数据版本，它的`DB_TRX_ID`是2，小于当前ReadView中的` min_trx_id` ，故该版本数据可见，当前查询返回该版本的数据。

第二次查询时，与第一次过程类型，该条记录在版本链中的第二个版本可见，返回该版本的数据。

***

在RR隔离级别下，仅在事务中第一次执行快照读时生成ReadView，后续复用该ReadView，这就保证两个查询时读取的数据相同，保证了可重复读。读取过程与上面类似。

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250312173615808-2025-3-1217:36:22.png)

## 八、数据库设计三范式

​	数据库设计范式是符合某一种级别的关系模式的集合。设计关系数据库时，遵从不同的规范要求，可以设计出合理的关系型数据库。这些规范要求被称为不同的范式，越高的范式数据库冗余越小。满足这些规范的数据库是简洁的、结构明晰的，同时不会发生插入、删除和更新操作异常。



数据结构范式的种类：

1. ‌**第一范式（1NF）**‌：要求数据库表的每一列都是不可分割的基本数据项，同一列中不能有多个值。

   第一范式，最核心，最重要的范式，所有表的设计都需要满足

   ```mysql
   学生编号 学生姓名 联系方式
   ------------------------------------------
   1001		张三		zs@gmail.com,1359999999
   1002		李四		ls@gmail.com,13699999999
   1001		王五		ww@163.net,13488888888
   
   以上是学生表，不满足第一范式，第一：没有主键。第二：联系方式可以分为邮箱地址和电话
   
   学生编号(pk) 		学生姓名	邮箱地址		联系电话
   ----------------------------------------------------
   1001				张三		zs@gmail.com	1359999999
   1002				李四		ls@gmail.com	13699999999
   1003				王五		ww@163.net		13488888888
   
   ```

2. ‌**第二范式（2NF）**‌：在第一范式的基础上，要求表中的所有非主键字段**完全依赖**于主键。

   第二范式需要确保数据库表中的每一列都和主键相关，而不能只与主键的某一部分相关（主要针对联合主键而言）。

   ```mysql
   学生编号 		学生姓名   教师编号 教师姓名
   ----------------------------------------------------
   1001			张三		001		王老师
   1002			李四		002		赵老师
   1003			王五		001		王老师
   1001			张三		002		赵老师
   
   这张表描述了学生和老师的关系：（1个学生可能有多个老师，1个老师有多个学生),这是非常典型的：多对多关系！
   
   以上的表不满足第一范式，应改为
   
   
   学生编号+教师编号(pk)			学生姓名  		教师姓名
   ----------------------------------------------------
   1001			001				张三			王老师
   1002			002				李四			赵老师
   1003			001				王五			王老师
   1001			002				张三			赵老师
   
   学生编号 教师编号，两个字段联合做主键，复合主键（PK: 学生编号+教师编号），经过修改之后，以上的表满足了第一范式。
   但是不满足第二范式，“张三”依赖1001，“王老师”依赖001，显然产生了*部分依赖*。产生部分依赖会导致数据冗余，空间浪费。
   
   
   为了让以上的表满足第二范式，需要这样设计
     学生表
     学生编号(pk)		学生名字
     ------------------------------------
     1001					张三
     1002					李四
     1003					王五
     
     教师表
     教师编号(pk)		教师姓名
     --------------------------------------
     001					王老师
     002					赵老师
   
     学生教师关系表
     id(pk)			学生编号(fk)			教师编号(fk)
     ------------------------------------------------------
     1						1001						001
     2						1002						002
     3						1003						001
     4						1001						002
   
   口诀：多对多，三张表，关系表两个外键
   ```

   

3. ‌**第三范式（3NF）**‌：在第二范式的基础上，要求表中的每个非主键字段不依赖于其他非主键字段。

   第三范式需要确保数据表中的每一列数据都和主键直接相关，而不能间接相关。

   ```mysql
   学生编号（PK） 学生姓名 班级编号  班级名称
   ---------------------------------------------------------
     1001				张三		01			一年一班
     1002				李四		02			一年二班
     1003				王五		03			一年三班
     1004				赵六		03			一年三班
   
   以上表的设计是描述：班级和学生的关系。很显然是1对多关系，一个教室中有多个学生。
   以上表满足第一范式，有主键。
   以上表满足第二范式，因为主键不是复合主键，没有产生部分依赖。主键是单一主键。
   
   但是不满足第三范式，第三范式要求：不要产生传递依赖！一年一班依赖01，01依赖1001，产生了传递依赖。不符合第三范式的要求。产生了数据的冗余。
   
   那么应该怎么设计一对多呢？
   
     班级表：一
     班级编号(pk)				班级名称
     ----------------------------------------
     01								一年一班
     02								一年二班
     03								一年三班
   
     学生表：多
   
     学生编号（PK） 学生姓名 班级编号(fk)
     -------------------------------------------
     1001				张三			01			
     1002				李四			02			
     1003				王五			03			
     1004				赵六			03		
     
   口诀：一对多，两张表，多的表加外键
   
   ```

   

4. ‌**巴斯-科德范式（BCNF）**‌：进一步减少数据冗余，确保每个决定因素只依赖于主键。

5. ‌**第四范式（4NF）**‌：解决多值依赖问题，确保每个决定因素不依赖于其他非主键字段。

6. ‌**第五范式（5NF）**‌：又称完美范式，进一步减少数据冗余，确保每个决定因素不依赖于其他非主键字段。



