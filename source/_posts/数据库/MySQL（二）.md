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

**事务(transaction)**，是用户定义的一个数据库操作序列，这些操作要么全做，要么全不做，是一个不可分割的工作单位。

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

A：原子性（Automicity）
  说明事务是最小的工作单元。不可再分。

C：一致性（Consistency）
在同一个事务当中，所有操作必须同时成功，或者同时失败，以保证数据的一致性。事务的执行结果必须是使数据库从一个一致性状态边到另一个一致性状态。

I：隔离性（Isolation）
  一个事务的执行不能被其他事务干扰。A事务和B事务之间具有一定的隔离。

D：持久性（Durability）
  事务一旦提交，相当于将没有保存到硬盘上的数据保存到硬盘上，它对数据库中数据的改变就是永久性的。



### 1.4、事务的隔离性等级

有关多个事务的并发控制

**多事务并发执行的问题**

-  **脏读**：一个事务读取了另一个事务未提交的数据，这些数据可能会被回滚，从而导致读取到无效数据


- **不可重复读**：一个事务在两次读取同一数据时，因其他事务的提交导致数据发生了变化，从而无法获得一致的结果。

- **幻读**：一个事务读取多条记录后，因其他事务的插入或删除，导致再次读取时获得的记录集发生变化。



事务隔离性存在隔离级别，理论上隔离级别包括`4`个：

1. 读未提交： `read uncommitted` （最低的隔离级别，没有提交就读到了）
   - 含义： 事务A可以读取到事务B未提交的数据
   - 存在问题：脏读现象！(Dirty Read)
2. 读已提交：`read committed` (提交之后才能读到)
   - 含义：事务A只能读取到事务B提交之后的数据。
   - 解决的问题：解决了脏读的现象。
   - 存在的问题： 不可重复读取数据。
     - 在事务开启之后，第一次读到的数据是3条，当前事务还没有 结束，可能第二次再读取的时候，读到的数据是4条，称为不可重复读取。（做不到事务从开始到结束查询到的数据是一样的）
     - 这种隔离级别是比较真实的数据，每一次读到的数据是绝对的真实。
3. 可重复读：`repeatable read`(提交之后也读不到，永远读取的都是刚开启事务时的数据)
   - 含义：一个事务在执行期间读取到的数据始终保持一致，不受其他事务的影响
   - 解决的问题：解决了不可重复读取数据。
   - 存在的问题：可以会出现幻影读。每一次读取到的数据都是幻象。不够真实！
4. 序列化/串行化：`serializable`（最高的隔离级别）
   - 这是最高隔离级别，效率最低。解决了所有的问题。
     这种隔离级别表示事务排队，不能并发！
     每一次读取到的数据都是最真实的，并且效率是最低的。

![image-20240424102156449](https://gitee.com/cmyk359/img/raw/master/img/image-20240424102156449-2024-12-823:54:55.png)

oracle数据库默认的隔离级别是：读已提交。
mysq1数据库默认的隔离级别是：可重复读。

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
  -  数据文件 — 存储表行的内（mytable.MYD）
  -  索引文件 — 存储表上索引（mytable.MYI）：索引是一本书的目录，缩小扫描范围，提高查询效率的一种机制。


### 2.4、InnoDB存储引擎

InnoDB是一种兼顾高可靠性和高性能的通用存储引擎，在 MySQL 5.5 之后，InnoDB是默认的 MySQL 存储引擎。



- 特点
  - DML操作遵循ACID模型，支持`事务`；
  - `行级锁`，提高并发访问性能；
  - 支持`外键` FOREIGN KEY约束，保证数据的完整性和正确性，包括级联删除和更新；
  - 支持数据库崩溃后自动恢复机制，非常安全。

- 文件

  xxx.ibd： xxx代表的是表名，innoDB引擎的每张表都会对应这样一个表空间文件。存储该表的**表结构**（frm、sdi）、**数据**和**索引**。
  参数：innodb_file_per_table：是否每张InnoDB的表对应一个表空间文件，默认开启

InnoDB的逻辑存储结构

![image-20240711104512418](https://gitee.com/cmyk359/img/raw/master/img/image-20240711104512418-2024-7-1110:45:17.png)

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
-  相对于Hash索引，其只支持精确匹配，而B+树还支持范围匹配及排序操作

> Hash索引

![image-20240712113933352](https://gitee.com/cmyk359/img/raw/master/img/image-20240712113933352-2024-7-1211:39:55.png)

Hash索引的特点：

- Hash索引只能用于对等比较（=，in），不支持范围查询（between，>，<，...）
- 无法利用索引完成排序操作
- 查询效率高，通常只需要一次检索就可以了，效率通常要高于B+tree索引

在MySQL中，支持hash索引的是Memory引擎，而InnoDB中具有自适应hash功能，hash索引是存储引擎根据B+Tree索引在指定条件下自动构建的。

### 3.3、索引分类

![image-20240712150609091](https://gitee.com/cmyk359/img/raw/master/img/image-20240712150609091-2024-7-1215:06:27.png)

> 在InnoDB存储引擎中，根据**索引存储形式**，又可分为以下两种

![image-20240712150912890](https://gitee.com/cmyk359/img/raw/master/img/image-20240712150912890-2024-7-1215:09:13.png)

![image-20240712151114687](https://gitee.com/cmyk359/img/raw/master/img/image-20240712151114687-2024-7-1215:11:15.png)



注：二级索引中不仅仅有该字段对应的聚集索引id，还有索引字段本身的值。



![image-20240712151257432](https://gitee.com/cmyk359/img/raw/master/img/image-20240712151257432-2024-7-1215:13:03.png)



由此可知：当id为主键，且name字段设置了索引的情况下，第一条sql的执行效率更高

```sql
select * from user where id = 10;

select * from user where name = "jack";
```

![image-20240712151950425](https://gitee.com/cmyk359/img/raw/master/img/image-20240712151950425-2024-7-1215:20:03.png)

由此可知，对应两千多万条记录的表，其聚集索引对应的B+树的树高不会超过3，查找效率很高



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

 `explain select * from tb user where profession ='软件工程'；`此sql语 句中索引最左侧字段存在，且中间没有缺失其他索引字段，故索引也生效。此时索引长度为47，即profession索引字段长度为47

![image-20240713172320284](https://gitee.com/cmyk359/img/raw/master/img/image-20240713172320284-2024-7-1317:23:42.png)

`explain select * from tb_user where profession =·软件工程'and status = '0';`

该sql语句中，只提供了联合索引中的profession和status字段，中间的age字段缺失，此时索引部分生效，索引字段长度为47，只有profession的查询使用了索引，但status没有使用索引

![image-20240713172650355](https://gitee.com/cmyk359/img/raw/master/img/image-20240713172650355-2024-7-1317:27:42.png)

#### 索引失效情况

1. 索引列运算

   不要在索引列上进行运算操作，`索引将失效`。

   ![image-20240713174016271](https://gitee.com/cmyk359/img/raw/master/img/image-20240713174016271-2024-7-1317:40:42.png)

2. 字符串不加引号

   字符串类型字段使用时未加引号，会进行隐式类型转换造成`索引将失效`。

   ![image-20240713174559698](https://gitee.com/cmyk359/img/raw/master/img/image-20240713174559698-2024-7-1317:46:42.png)

3. 模糊查询

   如何仅仅是尾部模糊匹配，索引仍会生效。但如果是头部模糊匹配，索引失效。

   ![image-20240713175107252](https://gitee.com/cmyk359/img/raw/master/img/image-20240713175107252-2024-7-1317:51:42.png)

4. or连接的条件

   用or分割开的条件，如果or前的条件中的列有索引，而后面的列中没有索引，那么涉及的索引都不会被用到。（前边有索引但后边没有，则索引不会生效；两边都有索引时，索引才会生效）

   例如：在tb_user表中，age字段没有建立索引。执行`select * from tb_user where id = 10 or age = 23;`时，由于id为主键，存在主键索引，但age没有索引，执行过程中索引不会生效。

   ![image-20240713175731784](https://gitee.com/cmyk359/img/raw/master/img/image-20240713175731784-2024-7-1317:57:42.png)

   为age字段建立索引后，再执行该语句

   ![image-20240713180018863](https://gitee.com/cmyk359/img/raw/master/img/image-20240713180018863-2024-7-1318:00:42.png)

5. 数据分布

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

覆盖索引是指：查询使用了索引，并且需要返回的列，在该索引中已经能全部找到。

> 尽量使用覆盖索引，减少使用select *

例：在tb_user表中，已经对 profession，age，status建立了联合索引，分别执行以下sql，查看其执行计划。

1、`select id, profession,age,status from tb_user where profession = '软件工程' and age = 31 and status = '0';`其执行计划中Extra列的信息为：<u>Using where; Using index</u>

![image-20240713185911831](https://gitee.com/cmyk359/img/raw/master/img/image-20240713185911831-2024-7-1318:59:42.png)

2、`select id, profession,age,status, name from tb_user where profession = '软件工程' and age = 31 and status = '0';`相比于上一条sql，这条sql的查询结果中需要返回的列多了一个name字段。其执行计划的Extra列的信息为：<u>Using index condition</u>

![image-20240713185952078](https://gitee.com/cmyk359/img/raw/master/img/image-20240713185952078-2024-7-1319:00:42.png)



![image-20240713190303548](https://gitee.com/cmyk359/img/raw/master/img/image-20240713190303548-2024-7-1319:03:04.png)



由于对profession、age、status建立的联合索引索引二级索引（辅助索引），在二级索引的叶子结点中不仅包含了对应索引字段的值，还包括该记录对应的聚集索引的id（一般是主键id）。

故对应第一条sql语句，其需要返回的字段在二级索引树上全部都能查到，直接返回结果，一次索引扫描即可，不需要回表查询。但对于第二条sql，其返回结果中多出了二级索引树上没有的name字段，此时需要根据当前的聚集索引id，在聚集索引中进行回表查询，得到完整的记录，从中得到name字段，整合后返回。



图示如下：

![image-20240713190928026](https://gitee.com/cmyk359/img/raw/master/img/image-20240713190928026-2024-7-1319:09:42.png)

![image-20240713191033317](https://gitee.com/cmyk359/img/raw/master/img/image-20240713191033317-2024-7-1319:10:42.png)

![image-20240713191436663](https://gitee.com/cmyk359/img/raw/master/img/image-20240713191436663-2024-7-1319:14:42.png)



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

> 1. 针对于数据量较大，且**查询比较频繁**的表建立索引。
> 2. 针对于常作为查询条件（where）、排序（order by）、分组（group by）操作的字段建立索 引。
> 3. 尽量选择区**分度高的列**作为索引，尽量建立唯一索引，区分度越高，使用索引的效率越高
> 4.  如果是字符串类型的字段，字段的长度较长，可以针对于字段的特点，建立前缀索引。
> 5.  **尽量使用联合索引，减少单列索引**，查询时，联合索引很多时候可以覆盖索引，节省存储空间， 避免回表，提高查询效率。注意联合索引使用时要遵循`最左前缀法则`。
> 6. 要控制索引的数量，索引并不是多多益善，索引越多，维护索引结构的代价也就越大，会影响增删改的效率。
> 7.  如果索引列不能存储NULL值，请在创建表时使用NOT NULL约束它。当优化器知道每列是否包含NULL值时，它可以更好地确定哪个索引最有效地用于查询
>    



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

-- 使用覆盖索引，先查询到该范围内记录的id，再将查询到的id作为临时表
select t.* from tb_sku t, (select id from tb_sku order by id limit 2000000,10) a
where t.id = a.id;
```



### 4.6、count优化

```sql
explain select count(*) from tb_user ;
```

![image-20240721102724886](https://gitee.com/cmyk359/img/raw/master/img/image-20240721102724886-2024-7-2110:27:49.png)

优化思路：**自己计数**，利用key-value内存级别的数据库，如Redis，在其中设置一个字段total保存表中记录数。当在表中新增一条记录时，total加1；当在表中删除一条记录时，total减一。



**常见count的几种用法和其效率的对比：**

> **count（）是一个聚合函数，对于返回的结果集，一行行地判断，如果 count 函数的参数不是 NULL，累计值就加 1，否则不加，最后返回累计值。**

- count（主键）

  InnoDB 引擎会遍历整张表，把每一行的主键id值都取出来，返回给服务层。服务层拿到主键后，直接按行进行累加（主键不可能为null）。

- count（字段）

  没有not null约束：InnoDB 引擎会遍历整张表把每一行的字段值都取出来，返回给服务层，服务层判断是否为null，不为null，计数累加。

  有not null 约束：InnoDB 引擎会遍历整张表把每一行的字段值都取出来，返回给服务层，直接按行进行累加。

- count（数字）

  InnoDB 引擎遍历整张表，但**不取值**。服务层对于返回的每一行，放一个数字（如0,-1,1等）进去，直接按行进行累加。

- count（*）

  InnoDB引擎并不会把全部字段取出来，而是专门做了优化，**不取值**，服务层直接按行进行累加。

![image-20240721103622142](https://gitee.com/cmyk359/img/raw/master/img/image-20240721103622142-2024-7-2110:36:26.png)

### 4.7、update优化

> **InnoDB的行锁是针对<u>索引</u>加的锁，不是针对记录加的锁，并且该索引不能失效，否则会从行锁升级为表锁。**

在执行update语句时要根据索引字段进行选择，否则行锁就会升级为表锁，降低并发性能。

![image-20240721104513524](https://gitee.com/cmyk359/img/raw/master/img/image-20240721104513524-2024-7-2110:45:49.png)



### 总结

![image-20240721105139164](https://gitee.com/cmyk359/img/raw/master/img/image-20240721105139164-2024-7-2110:51:49.png)

## 五、视图/存储过程/触发器

### 5.1、视图

[参考视频](https://www.bilibili.com/video/BV1Kr4y1i7ru?p=97&vd_source=51d78ede0a0127d1839d6abf9204d1ee)

什么是视图？

视图：站在不同的角度去看待同一份数据。

#### 视图创建和删除

创建视图对象：

  ```mysql
create view dept2_view as select * from dept2;
  ```

> 注意：
>
> 只有DQL语句才能以view的形式创建。
>  `create view view_name as` 这里的语句必须是DQL语句;

删除视图对象：

```mysql
drop view dept2_view;
```



#### 视图的用途

方便，简化开发，利于维护。我们可以面向视图对象进行增删改查，对视图对象的增删改查，会导致
原表被操作！（视图的特点：通过对视图的操作，会影响到原表数据。）

```mysql
//面向视图查询
select * from dept2_view; 

// 面向视图插入
insert into dept2_view(deptno,dname,loc) values(60,'SALES', 'BEIJING');

// 查询原表数据
mysql> select * from dept2;
+--------+------------+----------+
| DEPTNO | DNAME      | LOC      |
+--------+------------+----------+
|     10 | ACCOUNTING | NEW YORK |
|     20 | RESEARCH   | DALLAS   |
|     30 | SALES      | CHICAGO  |
|     40 | OPERATIONS | BOSTON   |
|     60 | SALES      | BEIJING  |
+--------+------------+----------+

// 面向视图删除
mysql> delete from dept2_view;

// 查询原表数据
mysql> select * from dept2;
Empty set (0.00 sec)
```

​	假设有一条非常复杂的SQL语句，而这条SQL语句需要在不同的位置上反复使用。每一次使用这个sql语句的时候都需要重新编写，很长，很麻烦，怎么办？可以把这条复杂的SQL语句以视图对象的形式新建。在需要编写这条SQL语句的位置直接使用视图对象，可以大大简化开发。并且利于后期的维护，因为修改的时候也只需要修改一个位置就行，只需要修改视图对象所映射的SQL语句。

​	我们以后面向视图开发的时候，使用视图的时候可以像使用table一样。可以对视图进行增删改查等操作。视图不是在内存当中，视图对象也是存储在硬盘上的，不会消失。

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

注：在终端命令行中运行 mysqldump命令，不要登录了MySQL再用。



![image-20240721113057150](https://gitee.com/cmyk359/img/raw/master/img/image-20240721113057150-2024-7-2111:31:35.png)

### 6.3、表级锁

表级锁，每次操作锁住整张表。锁定粒度大，发生锁冲突的概率最高，并发度最低。应用在MyISAM，InnoDB、BDB等存储引擎中。

对于表级锁，主要分为一下三类：

- 表锁
- 元数据锁（meta data lock，MDL）
- 意向锁

#### 表锁

​	![image-20240721183519013](https://gitee.com/cmyk359/img/raw/master/img/image-20240721183519013-2024-7-2118:35:49.png)

#### 元数据锁

![image-20240721185606540](https://gitee.com/cmyk359/img/raw/master/img/image-20240721185606540-2024-7-2118:56:11.png)

#### 意向锁

![image-20240721191002372](https://gitee.com/cmyk359/img/raw/master/img/image-20240721191002372-2024-7-2119:10:25.png)

**为了避免DML在执行时，加的行锁与表锁的冲突，在InnoDB中引入了意向锁，使得表锁不用检查每行数据是否加锁，使用意向锁来减少表锁的检查。**添加意向锁后，再添加表锁，直接根据意向锁以及意向锁的类型，判断当前表锁能否添加成功，不用再逐行检查。	

> **意向锁分类以及和表锁的兼容情况**

**意向锁的分类**

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240721191411802-2024-7-2119:14:12.png" alt="image-20240721191411802"  />

**与表锁的兼容情况**

![image-20240721191539971](https://gitee.com/cmyk359/img/raw/master/img/image-20240721191539971-2024-7-2119:15:49.png)



可以通过以下SQL，查看意向锁及行锁的加锁情况：

```mysql
select object_schema, object_name, index_name, lock_type, lock_mode, lock_data from performance_schema.data_locks;
```

### 6.4、行级锁

行级锁，每次操作锁住对应的行数据。锁定粒度最小，发生锁冲突的概率最低，并发度最高。应用在InnoDB存储引擎中。

**InnoDB的数据是基于索引组织的，行锁是通过对索引上的索引项加锁来实现的，而不是对记录加的**锁。对于行级锁，主要分为以下三类：

1.行锁（Record Lock）：锁定单个行记录的锁，防止其他事务对此行进行update和delete。在RC、RR隔离级别下都支持。

![image-20240721192230333](https://gitee.com/cmyk359/img/raw/master/img/image-20240721192230333-2024-7-2119:22:49.png)2.间隙锁（Gap Lock）：锁定索引记录间隙（不含该记录），确保索引记录间隙不变，防止其他事务在这个间隙进行insert，产生幻读。在RR隔离级别下都支持。

![image-20240721192259087](https://gitee.com/cmyk359/img/raw/master/img/image-20240721192259087-2024-7-2119:23:49.png)3.临键锁（Next-Key Lock）：行锁和间隙锁组合，同时锁住数据，并锁住数据前面的间隙Gap。在RR隔离级别下支持。

![image-20240721192315885](https://gitee.com/cmyk359/img/raw/master/img/image-20240721192315885-2024-7-2119:24:49.png)

#### 行锁

![image-20240721192932330](https://gitee.com/cmyk359/img/raw/master/img/image-20240721192932330-2024-7-2119:29:49.png)

常见数据库操作语句锁添加的锁的类型：

![image-20240721193132992](https://gitee.com/cmyk359/img/raw/master/img/image-20240721193132992-2024-7-2119:31:49.png)



## 七、数据库设计三范式

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

2. ‌**第二范式（2NF）**‌：在第一范式的基础上，要求表中的所有非主键字段完全依赖于主键。

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
   但是不满足第二范式，“张三”依赖1001，“王老师”依赖001，显然产生了部分依赖。产生部分依赖会导致数据冗余，空间浪费。
   
   
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




