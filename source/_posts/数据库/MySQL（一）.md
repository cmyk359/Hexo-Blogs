---
title: MySQL（一）
tags:
  - 数据库
  - MySQL
categories:
  - 数据库
abbrlink: 8d742da7
date: 2024-12-08 21:56:01
---

<meta name = "referrer", content = "no-referrer"/>

## 一、数据库

> 什么是数据库？什么是数据库管理系统？什么是SQL？他们之间的关系是什么？

- 数据库：
  	英文单词DataBase，简称DB。按照一定格式存储数据的一些文件的组合。
  	顾名思义：存储数据的仓库，实际上就是一堆文件。这些文件中存储了具有特定格式的数据
- 数据库管理系统：
  		DataBaseManagement，简称DBMS。
    		数据库管理系统是专门用来管理数据库中数据的，数据库管理系统可以对数据库当中的数据进行增删改查。

常见的数据库管理系统：
		MySQL、Oracle、MS SqlServer、DB2、Sybase等....



### 关于SQL语句的分类

DXL（数据库X语言）:其中D代表数据库，X是语言的功能，如定义、管理、查询、控制。

- DDL：
  		数据定义语言
    		凡是带有create、drop、alter的都是DDL。
    		DDL主要操作的是**表的结构**。不是表中的数据。
    		create：新建，等同于增
    		drop：删除
    		alter：修改
    		这个增删改和DML不同，这个主要是对表结构进行操作。


- DML：
  	数据操作语言（凡是对表当中的数据进行增删改的都是DML）
  	insert delete update
  	insert 增
  	delete 删
  	update 改
  	这个主要是操作**表中的数据**。	
- DQL：
  	数据查询语言（凡是带有select关键字的都是查询语句）
  	select...
- DCL：
  	是数据控制语言。
  	例如：授权grant、撤销权限revoke....
- TCL：
  	是事务控制语言
  	包括：
  	事务提交：commit;
  	事务回滚：rollback;



### 操作数据库

1、创建数据库

```sql
CREATE DATABASE IF NOT EXISTS school;  --IF NOT EXISTS 当不存在该数据库时才创建
```

2、删除数据库

```sql
DROP DATABASE IF EXISTS xxxx;  --如果存在该数据库则删除
```

3、查看数据库

```sql
SHOW DATABASES;
```

4、使用某个数据库

```sql
USE  `xxx`;  --如果你的表名或者字段名是一个特殊字符，就需要带``
```

5、查看当前使用的数据库

```sql
SELECT DATABASE();
```

6、查看数据库下的表

```sql
SHOW TABLES;
```



## 二、数据定义

### 2.1、模式的定义与删除

在MySQL中，模式（schema）是数据库的组织和结构，它定义了数据库的表、视图、存储过程等对象。

- 模式的定义语句

  ```mysql
  CREATE　SCHEM <模式名>AUTHORIZATION <用户名>;
  ```

  要创建模式需要拥有管理员的权限或者获得了数据库管理员授予的CREATE [SCHEMA](https://so.csdn.net/so/search?q=SCHEMA&spm=1001.2101.3001.7020) 的权限。

- 删除模式

  ```mysql
  DROP SCHEMA<模式名>CASCADE |RESTRICT>;
  ```

  其中`CASCADE`和`RESTRICT`两者必选其一。 CASCADE （级联），表示在删除模式的同时把该模式中所有的数据库对象全部删除；RESTRICT（限制），表示如果该模式中已经定义了下属的数据库对象（如表、视图等），则拒绝删除语句的执行，只有当该模式中没有任何下属的对象时才能执行语句。


### 2.2、基本表的定义、删除和修改

#### 定义基本表

​	建表的语法格式：(建表属于DDL语句，DDL包括：create drop alter)

```mysql
create table 表名(字段名1 数据类型, 字段名2 数据类型, 字段名3 数据类型);

create table 表名(
  字段名1 数据类型, 
  字段名2 数据类型, 
  字段名3 数据类型
);

表名：建议以t_ 或者 tbl_开始，可读性强。见名知意。
字段名：见名知意。
表名和字段名都属于标识符。
```

添加主键：在最后一行 添加` primary key (字段名)`

添加外键

```mysql
-- 创建表时添加：
 FOREIGN KEY(<列名>)REFERENCES <主表名> (<列名>); 
-- 修改表添加：
ALTER TABLE <数据表名> ADD FOREIGN KEY(<列名>) REFERENCES <主表名> (<列名>); 
```

创建两个基本表 `t_student`和`t_grade`

```mysql
CREATE TABLE `t_student` (
  `ID` int(4) NOT NULL AUTO_INCREMENT COMMENT '学号',
  `NAME` varchar(30) NOT NULL DEFAULT '匿名' COMMENT '姓名',
  `PWD` varchar(20) NOT NULL DEFAULT '123456' COMMENT '密码',
  `SEX` varchar(2) NOT NULL DEFAULT '女' COMMENT '性别',
  `BIRTHDAY` datetime DEFAULT NULL COMMENT '出生日期',
  `ADDRESS` varchar(100) DEFAULT NULL COMMENT '住址',
  `EMAIL` varchar(50) DEFAULT NULL COMMENT '邮箱',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
 
 CREATE TABLE `t_grade` (
	`gradeId` INT(4) NOT NULL AUTO_INCREMENT COMMENT '年级id',
	`gradeName` VARCHAR(50) NOT NULL COMMENT '年级名称',
	PRIMARY KEY(`gradeId`)
)ENGINE=INNODB DEFAULT CHARSET=UTF8  
```

  

```sql
SHOW CREATE DATABASE school; --查看数据库定义语句
SHOW CREATE TABLE t_student; --查看数据表定义语句
DESC t_student; --查看数据表的结构
```



##### MySQL中的数据类型

> 数值

|   类型    |             描述             |    大小     |
| :-------: | :--------------------------: | :---------: |
|  tinyint  |         十分小的数据         |   1个字节   |
| smallint  |          较小的数据          |   2个字节   |
| mediumint |        中等大小的数据        |   3个字节   |
|  **int**  |        **标准的整数**        | **4个字节** |
|  bigint   |          较大的数据          |   8个字节   |
|   float   |            浮点数            |   4个字节   |
|  double   |            浮点数            |   8个字节   |
|  decimal  | 定点型（字符串形式的浮点数） |   精度高    |

> 字符串

|    类型     |                 描述                 |      大小      |
| :---------: | :----------------------------------: | :------------: |
|    char     |            字符串固定大小            |     0~255      |
| **varchar** | **可变字符串（相当于String、常用）** |  **0~65535**   |
|  tinytext   |               微型文本               |   $2^8 - 1$    |
|  **text**   |        **文本串,保存大文本**         | **$2^{16}-1$** |

> 时间日期

| 类型          |                                        描述 |
| ------------- | ------------------------------------------: |
| date          |                        YYYY-MM-DD，日期格式 |
| time          |                         HH：mm：ss,时间格式 |
| year          |                                    年份表示 |
| **datetime**  | **YYYY-MM-DD  HH：mm：ss,最常用的时间格式** |
| **timestamp** |    **时间戳，1970.1.1到现在的毫秒数，唯一** |

> null

- 没有值
- 注意，不要使用NULL进行运算，结果为NULL

##### 约束

什么是约束？ 约束对应的英语单词： constraint。在创建表的时候，可以给表中的字段加上一些约束，来保证这个表中数据的完整性、有效性。

约束的作用就是为了保证**表中的数据有效**。

约束包括哪些？

​	非空约束：not null

​	唯一性约束: unique

​	主键约束: primary key （简称PK）

​	外键约束：foreign key（简称FK）

​	检查约束：check（**mysql不支持**，oracle支持）



- **非空约束：not null**

```mysql
drop table if exists t_vip;
create table t_vip(
  id int,
  name varchar(255) not null  // not null只有列级约束，没有表级约束！
);
```

- **唯一性约束: unique**

> 唯一性约束unique约束的字段不能重复，但是可以为NULL。

```mysql
drop table if exists t_vip;
create table t_vip(
  id int,
  name varchar(255) unique,
  email varchar(255)
);
```

如何做到联合唯一约束

```mysql
drop table if exists t_vip;
-- name和email两个字段联合起来唯一
create table t_vip(
  id int,
  name varchar(255),
  email varchar(255),
  unique(name,email) // 约束没有添加在列的后面，这种约束被称为 **表级约束**。
);
```

- **主键约束: primary key** 

主键约束的相关术语？

​	主键字段：该字段上添加了主键约束，这样的字段叫做：主键字段

​	主键值：主键字段中的每一个值都叫做：主键值。**主键值是每一行记录的唯一标识。**



> 主键的特征：**not null + unique**（主键值不能是NULL，同时也不能重复！）
>
> 注：在MySQL当中，如果一个字段同时被not null和unique约束的话，该字段自动变成主键字段。

给一张表添加主键约束

```mysql
  drop table if exists t_vip;
  // 1个字段做主键，叫做：单一主键
  create table t_vip(
    id int primary key,  //列级约束
    name varchar(255)
  );
```

​	表级约束主要是给多个字段联合起来添加约束。在实际开发中不建议使用**复合主键**，建议使用**单一主键**。因为主键值存在的意义就是这行记录的身份证号，只要意义达到即可，单一主键可以做到。
复合主键比较复杂，不建议使用。

```mysql
  drop table if exists t_vip;
  // id和name联合起来做主键：复合主键！！！！
  create table t_vip(
    id int,
    name varchar(255),
    email varchar(255),
    primary key(id,name)
  );
```

​	主键值建议使用：int、bigint、char等类型。不建议使用：varchar来做主键。主键值一般都是数字，一般都是定长的！

主键除了：单一主键和复合主键之外，还可以分为：

- 自然主键：主键值是一个自然数，和业务没关系。
- 业务主键：主键值和业务紧密关联，例如拿银行卡账号做主键值。这就是业务主键！



​	在实际开发中使用自然主键使用比较多，因为主键只要做到不重复就行，不需要有意义。业务主键不好，因为主键一旦和业务挂钩，那么当业务发生变动的时候，可能会影响到主键值，所以业务主键不建议使用。尽量使用自然主键。

在MySQL当中，可以在主键后添加`auto_increment`帮助我们自动维护主键值。



- **外键约束：foreign key**

![在这里插入图片描述](https://gitee.com/cmyk359/img/raw/master/img/8ce084247b4b46a1b0e12459e3cc8232-2024-12-823:09:58.png)



**创建外键的两种方式：**
**方式一**：在创建表的时候进行添加

```mysql
[CONSTRAINT <外键约束名称>] FOREIGN KEY（从表的某个字段) references 主表名(被参考字段)
```

表一：

```mysql
create table stuInfo(	
		Scode int primary key,   --学生的学号
		Sname char(10),    --学生的姓名
		Saddress varchar(50),    --学生的住址
		Sgrade int,    --学生所在班级
		Semail varchar(50),    --学生的邮箱地址
		Sbrith date	
)DEFAULT CHARSET='utf8';	

```

表二：

```mysql
create table score(
studentID	int,
coureseID int,	
score int,	
scoreID int primary key,	
foreign	key(studentID) references stuInfo(Scode)  --添加外键 )
DEFAULT charset='utf8';
```



**方式二**：表已经创建好了，继续修改表的结构来添加外键。

```mysql
ALTER TABLE 表名 ADD CONSTRAINT 外键名 FOREIGN KEY(外键字段名)
REFERENCES 外表表名(主键字段名)
[ON DELETE {RESTRICT | CASCADE | SET NULL | NO ACTION | SET DEFAULT}]
[ON UPDATE {RESTRICT | CASCADE | SET NULL | NO ACTION | SET DEFAULT}]
```

| 参数        | 意义                                             |
| :---------- | :----------------------------------------------- |
| RESTRICT    | 限制外表中的外键改动（默认值，也是最安全的设置） |
| CASCADE     | 跟随外键改动                                     |
| SET NULL    | 设为null值                                       |
| NO ACTION   | 无动作                                           |
| SET DEFAULT | 设为默认值                                       |

```mysql
alter table stuInfo	add foreign key (scode) references score(studentID);
```

- 触发限制使用默认值 RESTRICT 的情况下

  - 从表插入新行，外键值不在主表中，被阻止
  - 从表修改外键值，新值不是主表的主键值，阻止修改
  - 主表删除行，其主键值在从表里存在便阻止删除(要想删除，必须先删除从表的相关行)
  - 主表修改主键值，旧值在从表里存在便阻止修改（要想修改，必须先删除从表的相关行）

- 更改事件触发限制为 CASCADE

  - 当主表修改主键值，从表中相关行的外键值将一起修改
  - 如果主表删除行，从表中的相关行将一起被删除

  

**删除外键约束**

```mysql
ALTER TABLE 表名 DROP FOREIGN KEY 外键名;
 
ALTER TABLE student_score DROP FOREIGN KEY s_id;
```



以上的操作都是物理外键，<u>数据库级别的外键</u>，<u>**不建议使用**</u>！（避免数据库过多造成困扰，了解即可）

**最佳实践**:不使用外键，采用业务逻辑关联的方式，来模拟这种外键

- 数据库就是单纯的表，只用来存数据，只有行（数据）和列（字段）
- 我们想使用多张表的数据，想使用外键（程序去实现）

![image-20240911151117915](https://gitee.com/cmyk359/img/raw/master/img/image-20240911151117915-2024-9-1115:12:23.png)

![image-20240911151138728](https://gitee.com/cmyk359/img/raw/master/img/image-20240911151138728-2024-9-1115:12:27.png)

- **检查约束：check**

MySQL不支持





- **默认值约束：default**

给某个字段/某列指定默认值，一旦设置默认值，在插入数据时，如果此字段没有显式赋值，则赋值为默认值

#### 修改基本表

```sql
--修改表名：ALTER TABLE 旧表名 RENAME AS 新表名
ALTER TABLE `t_teacher` RENAME AS	`t_teacher1`;

--增加表的字段：ALTER TABLE 表名 ADD 字段名 列属性 [约束];
ALTER TABLE `t_teacher1` ADD `job` VARCHAR(20) UNIQUE DEFAULT '职工';

--修改表的字段
--ALTER TABLE 表名 MODIFY 字段名 列属性 [约束];
--ALTER TABLE 表名 CHANGE 字段名 列属性 [约束];
ALTER TABLE `t_teacher1` MODIFY age VARCHAR(3);  --修改列属性
ALTER TABLE `t_teacher1` CHANGE `age` `age1` INT(1);  ---列重命名

--删除表的字段：ALTER TABLE 表名 DROP 字段名 [CASCADE|RESTRICT];
ALTER TABLE `t_teacher1` DROP `age1` CASCADE;
```



#### 删除基本表

```mysql
 -- 一般格式
 drop table<表名>[restrict|cascade]
```

-  若选择 <u>restrict</u>，则该表的删除是有限制条件的。欲删除的基本表<u>不能被其他的约束所引用（如CHECK，FOREIGN KEY等），不能有视图，不能有触发器，不能有存储过程或函数等</u>。如果存在这些依赖该表的对象，则此表不能被删除
- 若选择 <u>cascade</u>，则该表的删除没有限制条件。在删除基本表的同时，相关的依赖对象都将一起被删除。
- 默认情况时是 restrict。



### 2.3、索引的建立与删除

#### 建立索引

语法：

```sql
CREATE [UNIQUE][FULLTEXT] INDEX <索引名>
ON <表名> (<列名>[<次序>] [,<列名>[<次序>]]...)
```

- 索引可以建立在该表的一列或多列上，各列用逗号分隔。每个<列名>后可以使用<次序>指定索引值的排列次序，可选ASC（升序）或DESC（降序），默认为ASC；

```mysql
#为student、course、和sc建立索引。其中Student按学号升序建立唯一索引，course按课程号升序建立唯一索引，sc阿铭学号升序和课程号降序建立唯一索引
create unique index Stusno on student(Sno);
create unique index Coucno on course(Cno);
create unique index SCno on sc(Sno ASC, Cno DESC);
```

- 表中的主键和具有unique约束的字段会自动添加唯一索引



- 什么时候考虑给字段添加索引？（满足什么条件）
  - 数据量庞大。（根据客户的需求，根据线上的环境）
  - 该字段很少的DML操作。（因为字段进行修改操作，索引也需要维护）
  - 该字段经常出现在where子句中。（经常根据哪个字段查询）

#### 查看索引

```mysql
#查看索引信息
SHOW INDEX FROM sc;

#查询一个sql语句是否使用索引检索  explain + sql语句,根据type和rows判断
explain select * from sc where cno = '2';
```



#### 删除索引

```mysql
DROP INDEX <索引名> on <表名>
```



> 更多索引相关内容，见另一篇文章 “MySQL（二）”
>



## 三、数据查询

> select语句的一般格式

```sql
SELECT [ALL | DISTINCT]
{* | table.* | [ table. field1[ as alias1][, table. field2[ as alias2]][,...]]}
FROM table_name [as table_alias]
	[left outr | right outer | inner join table_name2]  --连接查询
	[WHERE ...] --返回结果需满足的条件
	[GROUP BY ...] --返回结果按照哪几个字段来分组
	[HAVING]  		--过滤分组的记录必须满足的条件
	[ORDER BY ...]  --指定查询记录按照一个或多个条件排序
	[LIMIT {[offset,]row_count  | row_countOffset offset}] --指定查询的记录从哪几条到哪几条
	
--注意：[]括号代表可选的，{）括号代表必选得
```



### 3.1、单表查询

#### 选择表中的若干列

- 查询全部列
  - 第一种方式：可以把每个字段都写上
    
    ```sql
    select a,b,c,d,e,f... from <表名>;
    ```
    
  - 第二种方式：可以使用 *
    
    ```sql
    select * from <表名>;
    ```
  
- 查询指定列
  
  - <目标表达式>中的各个列的先后顺序可以和表中的顺序不一致
  - 可以对<目标表达式>中的列 <u>通过 as 起别名</u>（也可以给表起别名）
  
- 查询经过计算的值
  - select子句的<目标列表达式>不仅可以是表中的属性列，也可以是<u>表达式，字符串常量，函数</u>等。

    ```sql 
    SELECT `StudentName` AS '姓名',  2024 - DATE_FORMAT(`borndate`,'%Y') AS '年龄' 
    	FROM `student`;
    ```

  - 常见单行处理函数：**注意不要对存在索引的列进行函数运算，会使查询过程中索引失效**。

    ```mysql
      #字符串处理:
      
      lower #转换小写
      	mysql> select lower(ename) as ename from emp;
      	
      upper #转换大写
      	mysql> select upper(name) as name from t_student;
      	
      substr #取子串（substr(被截取的字符串, 起始下标,截取的长度)）
      	mysql> select substr(ename, 1, 1) as ename from emp;
      	起始下标从1开始
      	
      concat #函数进行字符串的拼接
      	mysql> select concat(empno,ename) from emp;
      	
      char_length #包含的字符数
      	mysql> select char_length(ename) enamelength from emp;
      replace #在原串中，用一个字符串替换指定的串 replace(str,from_str, to_str)
      	mysql> select replace(CName,'Design','design') from course  where Cno = 7;
      insert # insert (str, pos, len, newstr)，从pos位置开始，将其后的len个字符，插入为newstr
      	mysql> select insert(CName,4,3,'*******') from course  where Cno = 7;
      	+-----------------------------+
      	| insert(CName,4,3,'*******') |
      	+-----------------------------+
      	| DB_*******ign               |
      	+-----------------------------+
      reverse #反转字符串
      	mysql> select reverse('hello world');
      	+------------------------+
      	| reverse('hello world') |
      	+------------------------+
      	| dlrow olleh            |
      	+------------------------+
      
      trim #去空格
      	mysql>	select * from emp where ename = trim('   KING');
    ```
    
      ```mysql
      #日期相关
      
      SELECT CURRENT_DATE（）---获取当前日期
      SELECT CURDATE（）--获取当前日期
      SELECT NOW（）--获取当前的时间
      SELECT LOCALTIME（）--本地时间
      SELECT SYSDATE（）--系统时间
      SELECT YEAR（NOW（））
      SELECT MONTH（NOW（））
      
      str_to_date 将字符串转换成日期
      str_to_date函数可以把字符串varchar转换成日期date类型数据。通常使用在插入insert方面，因为插入的时候需要一个日期类型的数据，
      语法格式：
        str_to_date('字符串日期', '日期格式')
      
      mysql的日期格式：
        %Y	年
        %m    月
        %d    日
        %h	时
        %i	分
        %s	秒
      
      insert into t_user(id,name,birth) values(1, 'zhangsan', str_to_date('01-10-1990','%d-%m-%Y'));
      mysql默认的日期格式：'%Y-%m-%d'，如果所提供的日期字符串是这个格式，str_to_date函数就不需要了！！！
      
      insert into t_user(id,name,birth) values(2, 'lisi', '1990-10-01');
      
      
      
      
      date_format 格式化日期
      查询的时候可以使用date_format将日期类型转换成特定格式的字符串展示
      语法格式：
        date_format(日期类型数据, '日期格式')
      这个函数通常使用在查询日期方面。设置展示的日期格式。
        
      select id,name,date_format(birth, '%m/%d/%Y') as birth from t_user;
      +------+----------+------------+
      | id   | name     | birth      |
      +------+----------+------------+
      |    1 | zhangsan | 10/01/1990 |
      |    2 | lisi     | 10/01/1990 |
      +------+----------+------------+
      ```
    
      ```mysql
      #数学运算
      	
      select abs(-10)  #绝对值
      select CEILING(9.4) #向上取整
      select FLOOR(9.4)	#向下取整
      select SIGN(10)		#判断一个数的符号，0返回0，正数返回1，负数返回-1
      
      round #四舍五入
      mysql> select round(1236.567, 0) as result ; //保留整数位。
      mysql> select round(1236.567, 1) as result ; //保留1个小数
      mysql> select round(1236.567, 2) as result ; //保留2个小数
      mysql> select round(1236.567, -1) as result; // 保留到十位。
      
      rand() #生成0~1之间的随机数
        mysql> select round(rand()*100,0) from emp; // 100以内的随机数
      ```
    



#### 选择表中的若干元组

- 消除重复的行

  - 使用 <u>DISTINCT <列名></u>,消除查询结果中重复的列。

    ```sql
     --studentno，由于同一个学生由于同一个学生有多门考试成绩，得到的studentno有重复
    SELECT DISTINCT `studentno` as '学号' FROM `result`
    ```

  - 原表数据不会被修改，只是查询结果去重。如果没有指定DISTINCT关键词，则默认为ALL，即保留结果表中取值重复的行

#### where子句

查询满足条件的元组

- | 查询条件             | 谓词                                    |
  | -------------------- | --------------------------------------- |
  | 比较                 | =,<,>,>=,<=,!=,<>,!>,!<; NOT+上述比较符 |
  | 确定范围             | between and, not between and            |
  | 确定集合             | in, not in                              |
  | 字符匹配             | like, not like                          |
  | 空值                 | is null, is not null                    |
  | 多重条件（逻辑运算） | and, or , not                           |

示例

- 比较大小

  其中，!=或<>（不等于）、!>（不大于）、!<（不小于）

- 确定范围

  `between...and...`和 `not between... and...`

```sql
#查询年龄在20~30岁之间（包括20和30）的学生的姓名，系别和年龄
select Sname, Sage, Sdept from student where Sage between 20 and 30;

--------------------------------------------------------------------
+--------+------+-------+
| Sname  | Sage | Sdept |
+--------+------+-------+
| 小红   |   20 | CS    |
+--------+------+-------+
1 row in set (0.00 sec)
```

- 确定集合

谓词IN可以查找属性值属于指定集合的元组,与之对应的是NOT IN。(<u>IN实际上是多个OR运算符的缩写</u>)

```sql
#查询既不是计算机科学系，也不是数学系的学生姓名和性别。
select Sname, Ssex from student where Sdept not in ('CS','MA');
--------------------------------------------------------------------
+--------+------+
| Sname  | Ssex |
+--------+------+
| 小雅   | 女   |
+--------+------+
1 row in set (0.00 sec)
```

- 字符匹配

   谓词LIKE可以用来进行字符串的匹配。 

   - "%"代表任意长度的字符串。例如a%b，代表以a开头，以b结尾的任意长度的字符串。
   - "_"代表任意单个字符。 例如 a_b，表示以a开头，以b结尾的长度为3的任意字符串。
   
   当要查询的字符串中含有特殊字符 %或 _时，需要<u>使用`\`进行转义</u>，将其转变为普通字符。

```sql
#查询名字中包含 美的学生的姓名和年龄
select Sname, Sage from student where Sname like '%美%';

+--------+------+
| Sname  | Sage |
+--------+------+
| 小美   |   19 |
+--------+------+
1 row in set (0.00 sec)


#查询第二个为亮的学生的姓名和年龄
select Sname, Sage from student where Sname like '_亮%';

+--------+------+
| Sname  | Sage |
+--------+------+
| 小亮   |   18 |
+--------+------+
1 row in set (0.00 sec)


 

#查询名字中带有_的学生的信息
select * from student where Sname like '%\_%';


+-----------+----------+------+------+-------+
| Sno       | Sname    | Ssex | Sage | Sdept |
+-----------+----------+------+------+-------+
| 201215121 | 小红_a   | 女   |   20 | CS    |
+-----------+----------+------+------+-------+
1 row in set (0.00 sec)
```



- 涉及空值的查询

  ```sql
  #查询选了课但没有考试的学生，即选课成绩为0的学生的信息
  select Sname, student.Sno from student, sc 
  	where sc.Sno = student.Sno and sc.Grade is null;
  	
  +--------+-----------+
  | Sname  | Sno       |
  +--------+-----------+
  | 小亮   | 201215123 |
  +--------+-----------+
  1 row in set (0.00 sec)
  ```


- 多重条件查询

  逻辑运算符 AND和OR可以用来连接多个查询条件。**AND的优先级高于OR，但可以通过加括号来改变优先级**。

#### ORDER BY子句

​	用户可可以使用ORDER BY子句**对查询结果**按照**一个或多个**属性列的升序(**ASC**)或降序(**DESC**)排列，**默认为升序**;

```sql
#查询选修了6号课程的学生的学号,姓名及其成绩，查询结果按分数的降序排列
#连结查询
select student.Sno, Sname, Grade from student, sc 
	where student.Sno = sc.Sno and sc.Cno = '6'
	order by Grade DESC;
#嵌套查询
......
	
+-----------+--------+-------+
| Sno       | Sname  | Grade |
+-----------+--------+-------+
| 201215124 | 小雅   |    90 |
| 201215121 | 小红   |    83 |
| 201215122 | 小美   |    83 |
| 201215123 | 小亮   |  NULL |
+-----------+--------+-------+
4 rows in set (0.00 sec)

#可以看出mysql中将空值做最小值处理

#按照多个属性排序
# 查询全体学生信息，查询结果按所在系号升序排列，同一系中的学生按年龄降序排列
mysql> select * from student
    -> order by Sdept, Sage DESC;
+-----------+--------+------+------+-------+
| Sno       | Sname  | Ssex | Sage | Sdept |
+-----------+--------+------+------+-------+
| 201215126 | 张三   | 男   |   21 | CS    |
| 201215121 | 小红   | 女   |   20 | CS    |
| 201215122 | 小美   | 女   |   19 | CS    |
| 201215125 | 小文   | 男   |   20 | IS    |
| 201215124 | 小雅   | 女   |   19 | IS    |
| 201215123 | 小亮   | 男   |   18 | MA    |
+-----------+--------+------+------+-------+
6 rows in set (0.00 sec)
```



#### 聚集函数

```mysql
count	# 计数
sum		# 求和
avg		# 平均值
max		# 最大值
min		# 最小值

聚集函数[distinct|all] <列名> 加上distinct在计算时不计入指定列中的重复值
```

**注意：**

2. 聚集函数中count(*)和count(具体字段)有什么区别？

   count(具体字段)：表示统计该字段下所有不为NULL的元素的总数。

   count(*)：统计表当中的总行数。（只要有一行数据count则++）

   > 因为每一行记录不可能都为NULL，一行数据中有一列不为NULL，则这行数据就是有效的。

3. **聚集函数不能够直接使用在where子句中。聚集函数只能用于SELECT子句和GROUP BY中的HAVING子句。**

4. 所有的聚集函数可以组合起来一起用。

```sql
# 查询选了课的学生人数 	必须加distinct
select count(distinct Sno) as '选课人数' from sc;
#计算选修了6号课程的平均成绩
select avg(Grade) as '平均成绩' from sc where Cno = '6';
#查询学生201215121选修课的总学分数
select sum(Ccredit) as '总学分' from course,sc where sc.Cno = course.Cno and sc.Sno ='201215121';

+-----------+
| 总学分    |
+-----------+
|        13 |
+-----------+
```

#### GROUP BY子句

```mysql
语法格式：
	select
      ...
    from
      ...
    group by
      ...
     [having ...]
```

- GROUP BY子句将**查询结果**按某一列或多列的值分组，**值相等的为一组**；
- 对查询结构分组的目的是为了**细化聚集函数的作用对象**
- **如果未对查询结果分组，聚集函数将作用到整个查询结果。分组后聚集函数将作用于每一个组，每个组都有一个聚集函数**
- **在一条select语句当中，如果有group by语句的话，select后面只能跟：<u>参加分组的字段，以及聚集函数。其它的一律不能跟。</u>**
- 若要对分组后的结构进行进一步筛选，可以使用`HAVING`短语指定筛选条件，最终只输出满足指定条件的**组**。

```mysql
#查询各个课程号及其相应的选课人数
select Cno, count(Sno) from sc
	group by(Cno);
	
#该语句对查询结果按Cno的值分组，所有具有相同Cno的值为一组，然后对每一组作用聚集函数COUNT进行计算，以求得该组的学生人数
```



```mysql
#查询选了三门课以上的学生学号
select Sno from sc 
	group by Sno
	having count(*) > 3;
	
#查询选了三门课以上的学生学号: 先用GROUP BY子句按 Sno分组，**值相等的为一组**，再用聚集函数COUNT对每一组计数，将总数大于3的组选出来。
```



**WHERE子句和HVING短语的区别**

- 两者作用的对象不同。WHERE子句作用于**视图或基本表**，从中选择满足条件的元组。HAVING短语作用于**组**，从中选择满足条件的组。
- WHERE子句中不能用聚集函数作为条件表达式，HAVING短语中可以用；HAVING不能单独使用，HAVING必须和group by联合使用。



### 3.2、连接查询

> 多张表联合起来查询数据，被称为连接查询。

连接查询思路：

1. 分析需求，分析查询的字段来自哪些表
2. 确定使用哪种连接查询，确定交叉点（在两张表中哪个字段是相同的），得到连接的条件



根据表连接的方式分类：

- 内连接： 等值连接 非等值连接 自连接

- 外连接：外连接、 左外连接（左连接）	右外连接（右连接）

#### 内连接

```mysql
SQL99语法：
  select 
    ...
  from
    a
  inner join
    b
  on
    a和b的连接条件
  where
    筛选条件
# inner可以省略（带着inner可读性更好！！！一眼就能看出来是内连接）
```

两张表时用inner join 连接查询之后生成的笛卡尔积数据中很多数据都是无意义的，我们如何消除无意义的数据呢？ --添加进行连接查询的条件

- 使⽤where设置过滤条件：先⽣成笛卡尔积再从笛卡尔积中过滤数据（**效率很低**）
- 使用 **on** 设置两张表连接查询的匹配条件：先判断连接条件是否成⽴，如果成⽴两张表的数据进⾏组合⽣成⼀ 条结果记录

##### 等值连接和非等值连接

​	当连接运算符为=时，称为等值连。使用其他运算符称为非等值连接。

```mysql
select * from sc inner join student on sc.Sno = student.Sno;

#有两个Sno列
+-----------+-----+-------+-----------+--------+------+------+-------+
| Sno       | Cno | Grade | Sno       | Sname  | Ssex | Sage | Sdept |
+-----------+-----+-------+-----------+--------+------+------+-------+
| 201215121 | 1   |    92 | 201215121 | 小红   | 女   |   20 | CS    |
| 201215121 | 2   |    85 | 201215121 | 小红   | 女   |   20 | CS    |
| 201215121 | 3   |    95 | 201215121 | 小红   | 女   |   20 | CS    |
| 201215121 | 6   |    83 | 201215121 | 小红   | 女   |   20 | CS    |
| 201215122 | 2   |    91 | 201215122 | 小美   | 女   |   19 | CS    |
| 201215122 | 3   |    95 | 201215122 | 小美   | 女   |   19 | CS    |
| 201215122 | 6   |    83 | 201215122 | 小美   | 女   |   19 | CS    |
| 201215123 | 6   |  NULL | 201215123 | 小亮   | 男   |   18 | MA    |
| 201215124 | 6   |    90 | 201215124 | 小雅   | 女   |   19 | IS    |
+-----------+-----+-------+-----------+--------+------+------+-------+
```



##### 自然连接

​	自然连接是一种特殊的等值连接。它要求两个关系中进行比较的分量**必须有同名的属性组**，并且会**<u>在结果中把重复的属性列去掉</u>。**



​	**自然连接会自动去查找两个表中是否有相同的字段（<u>字段名相同、字段类型也相同</u>，这样的字段可以不止一个，有多少个这样的字段就会生成多少个等值条件），找到后自动完成等值连接。如果连接的表中，没有相同字段，会返回一个空结果。**



​	一般的连接操作时从行的角度进行运算，但自然连接还需要取消重复列，所以是同时从行和列的角度进行运算。

```mysql
#此 SQL 语句中没有使用 where 字句 和 on，也没有出现连接符，但是也达到了等值连接的效果。
#通过两个表中相同的Sno属性连接，并将结果中重复的Sno去掉
select * from sc natural join student;
+-----------+-----+-------+--------+------+------+-------+
| Sno       | Cno | Grade | Sname  | Ssex | Sage | Sdept |
+-----------+-----+-------+--------+------+------+-------+
| 201215121 | 1   |    92 | 小红   | 女   |   20 | CS    |
| 201215121 | 2   |    85 | 小红   | 女   |   20 | CS    |
| 201215121 | 3   |    95 | 小红   | 女   |   20 | CS    |
| 201215121 | 6   |    83 | 小红   | 女   |   20 | CS    |
| 201215122 | 2   |    91 | 小美   | 女   |   19 | CS    |
| 201215122 | 3   |    95 | 小美   | 女   |   19 | CS    |
| 201215122 | 6   |    83 | 小美   | 女   |   19 | CS    |
| 201215123 | 6   |  NULL | 小亮   | 男   |   18 | MA    |
| 201215124 | 6   |    90 | 小雅   | 女   |   19 | IS    |
+-----------+-----+-------+--------+------+------+-------+
9 rows in set (0.00 sec)

```

##### 自连接

自身连接。连接操作不仅可以在两个表之间进行，也可以是一个表与其自己连接。

**核心：一张表拆为两张一样的表，并分别起别名**

```mysql
#查询每门课的间接先修课
#course表中只有当前课程的直接先修课，需要和另一个course连接查询

select c1.Cname as '课程',c2.Cname as '先修课程' from course c1 inner join course c2 on c1.Cpno = c2.Cno;

+--------------+--------------+
| 课程         | 先修课程     |
+--------------+--------------+
| 数据库       | 数据结构     |
| 信息系统     | 数据库       |
| 操作系统     | 数据处理     |
| 数据结构     | DB_Design    |
| DB_Design    | 数据处理     |
+--------------+--------------+
```

#### 外连接

​	两个关系R和S（两个表）做连接操作时，选择两个关系在公共属性上相等的元组构成新的关系（得到结果表)。

​	在关系R中的某些元组可能在S中不存在公共属性上值相等的元组，关系S中同样也可能存在着这样的元组，从而在操作时将这些元组舍弃了，这些被舍弃的元组称为 <u>悬浮元组</u>。

如果把悬浮元组保存在结果关系中，而在其他属性上填上空值NULL，这种连接就叫**外连接**；

只保留左边关系R中的悬浮元组就叫做**左外连接**

只保留右边关系S中的悬浮元组就叫做**右外连接**

`左外连接，以左表为主，会从左表返回所有的元组，即使其中一些元组在右表表没有匹配（这些元组所包含的右表的属性用NULL填充）；右外连接同理。`

外连接的查询结果条数一定是 >= 内连接的查询结果条数

```mysql
  select 
    ...
  from
    a
 right[left] outer join
    b
  on
    a和b的连接条件
  where
    筛选条件
```



##### 全外连接

​	MySql是没有全外连接的(MySql中没有full outer join关键字)，想要达到全外连接的效果，可以使用union关键字连接左外连接和右外连接。UNION会自动去除重复行，如果不喜欢去除重复行可以用UNION ALL。

##### 左外连接

左外连接以左边的表为主，**左边表的内容都会查出来**，匹配到就组成新的元组，匹配不到就在多出来的属性用NULL填充。

```mysql
#查询每个学生的选课情况及其选课成绩（以student表为主）
select student.Sno,Sname,Sdept,Cno,Grade 
from student  
left outer  join sc 
on student.Sno = sc.Sno;


+-----------+--------+-------+------+-------+
| Sno       | Sname  | Sdept | Cno  | Grade |
+-----------+--------+-------+------+-------+
| 201215121 | 小红   | CS    | 1    |    92 |
| 201215121 | 小红   | CS    | 2    |    85 |
| 201215121 | 小红   | CS    | 3    |    95 |
| 201215121 | 小红   | CS    | 6    |    83 |
| 201215122 | 小美   | CS    | 2    |    91 |
| 201215122 | 小美   | CS    | 3    |    95 |
| 201215122 | 小美   | CS    | 6    |    83 |
| 201215123 | 小亮   | MA    | 6    |  NULL |
| 201215124 | 小雅   | IS    | 6    |    90 |
| 201215125 | 小文   | IS    | NULL |  NULL |
| 201215126 | 张三   | CS    | NULL |  NULL |
+-----------+--------+-------+------+-------+
#其中小文和张三没有选课，在sc表中没有他们的Sno，所以在左外连接的结果中，他们的选课号和成绩用NULL填充
```

##### 右外连接

```mysql
#查询已选课的学生的相关信息
select student.Sno,Sname,Sdept,Cno,Grade 
from student  
right outer  join sc 
on student.Sno = sc.Sno;

+-----------+--------+-------+-----+-------+
| Sno       | Sname  | Sdept | Cno | Grade |
+-----------+--------+-------+-----+-------+
| 201215121 | 小红   | CS    | 1   |    92 |
| 201215121 | 小红   | CS    | 2   |    85 |
| 201215121 | 小红   | CS    | 3   |    95 |
| 201215121 | 小红   | CS    | 6   |    83 |
| 201215122 | 小美   | CS    | 2   |    91 |
| 201215122 | 小美   | CS    | 3   |    95 |
| 201215122 | 小美   | CS    | 6   |    83 |
| 201215123 | 小亮   | MA    | 6   |  NULL |
| 201215124 | 小雅   | IS    | 6   |    90 |
+-----------+--------+-------+-----+-------+

```

**多表连接**：  一条SQL中内连接和外连接可以混合，都可以出现！可以进行多个表的连接。

```mysql
#查询参加了考试的同学信息：学号、姓名、科目名、分数 （以sc表为主）
SELECT sc.Sno, Sname, Cname, Grade
FROM sc 
LEFT OUTER JOIN student s
ON sc.Sno = s.Sno
INNER JOIN course c  #为了获得科目名，再连接course表
ON sc.Cno = c.Cno;
+-----------+--------+--------------+-------+
| Sno       | Sname  | Cname        | Grade |
+-----------+--------+--------------+-------+
| 201215121 | 小红   | 数据库       |    92 |
| 201215121 | 小红   | 数学         |    85 |
| 201215121 | 小红   | 信息系统     |    95 |
| 201215121 | 小红   | 数据处理     |    83 |
| 201215122 | 小美   | 数学         |    91 |
| 201215122 | 小美   | 信息系统     |    95 |
| 201215122 | 小美   | 数据处理     |    83 |
| 201215123 | 小亮   | 数据处理     |  NULL |
| 201215124 | 小雅   | 数据处理     |    90 |
+-----------+--------+--------------+-------+
```



### 3.3、嵌套查询

​	在SQL语言中，一个SELECT-FROM-WHERE语句被称为一个查询块。将一个查询块嵌套在另一个查询块的WHERE子句或HAVING短语的条件中的查询称为**嵌套查询**。

​	上层的查询块称为**外层查询或父查询**，下层查询称为**内层查询或子查询**。

​	**子查询的SELECT不能使用ORDER BY子句，ORDER BY子句只能对最终查询结果排序。**

#### 子查询

子查询都可以出现的位置

```mysql
select 
  ..(select).
from
  ..(select).
where
  ..(select).
```



1. where子句中的子查询:

```mysql
第一步：查询选修6号课程的平均分
  select avg(Grade) from sc where Cno = '6';
	+------------+
	| avg(Grade) |
	+------------+
	|    85.3333 |
	+------------+
	1 row in set (0.00 sec)
第二步：找出高于平均分的
  select * from emp where Grade > avg(Grade);

第三步：合并
  select student.Sno, Sname ,Sdept, Grade
  	from sc right join student on sc.Sno = student.Sno
  	where Grade > (
  		select avg(Grade) from sc where Cno = '6'	
  );
  
  
  #执行顺序，先将两张表连接起来，再在其中选出成绩大于平均分的元组，最后使用select选出想要的列。
	+-----------+--------+-------+-------+
	| Sno       | Sname  | Sdept | Grade |
	+-----------+--------+-------+-------+
	| 201215121 | 小红   | CS    |    92 |
	| 201215121 | 小红   | CS    |    95 |
	| 201215122 | 小美   | CS    |    91 |
	| 201215122 | 小美   | CS    |    95 |
	| 201215124 | 小雅   | IS    |    90 |
	+-----------+--------+-------+-------+
```

2. from子句中的子查询: (基于派生表的查询)

from后面的子查询，可以将子查询的查询结果当做一张**临时表**。每个派生表都必须指定一个别名，在其中可以定义查询出字段的名字

```mysql
-- 找出每个学生超过他自己选修课程平均成绩的课程号和成绩
SELECT s_id, c_id, s_score, s1.avg_grade 
FROM score, (SELECT s_id, AVG(s_score) FROM score GROUP BY s_id) AS s1(avg_s_id, avg_grade) 
WHERE score.s_id = s1.avg_s_id AND score.s_score >	s1.avg_grade;

```

##### 带有IN谓词的子查询

在嵌套查询中，子查询的结果往往是一个集合，所以谓词IN是嵌套查询中最经常使用的谓词

```mysql
#查询与小美在同一个系学习的学生
#嵌套查询
select Sno, Sname, Sdept from student 
	where Sdept in (
	select Sdept from student where Sname = '小美'
    );
#连接查询
#先通过自连接将两个student中系别相同的连接起来，再通过where选出和小美同一个系的,最后通过select得到想要的列
select s2.Sno,s2.Sname,s2.Sdept 
	from student s1 inner join student s2 
		on s1.Sdept = s2.Sdept
	where s1.Sname = '小美';
	
+-----------+--------+-------+
| Sno       | Sname  | Sdept |
+-----------+--------+-------+
| 201215121 | 小红   | CS    |
| 201215122 | 小美   | CS    |
| 201215126 | 张三   | CS    |
+-----------+--------+-------+

```

```mysql
#查询选修了课程名为 "信息系统"的学生姓名和学号
#嵌套查询
select Cno from course where Cname = '信息系统';
select Sno from sc where Cno = course.Cno
select Sno, Sname from student where Sno = sc.Sno
===================>
select Sno,Sname
from student 
where Sno in (
	select Sno 
	from sc
	where Cno in (
    	select Cno
    	from course
    	where Cname = '信息系统')
	); 
	
+-----------+--------+
| Sno       | Sname  |
+-----------+--------+
| 201215121 | 小红   |
| 201215122 | 小美   |
+-----------+--------+


#连接查询

select student.Sno, student.Sname 
from student
inner join
sc 
on 
sc.Sno = student.Sno
inner join 
course
on 
sc.Cno = course.Cno
where course.Cname = '信息系统';

select student.Sno, student.Sname 
from course, student, sc
where student.Sno = sc.Sno and
	Sc.Cno = course.Cno and
	course.Cname = '信息系统';

```

有些嵌套查询可以用连接运算替代，有的 是不能替代的

##### 带有比较运算符的子查询

父查询和子查询之间使用比较运算符进行连接。

当知道内存查询返回的是**单个值**时，可以用 比较运算符。

```mysql
#找出每个学生超过他自己选修课平均成绩的课程号
select Sno, Cno, Grade
from sc s1
where Grade > (
	select avg(Grade) 
    from sc s2
    where s2.Cno = s1.Cno #查询选课表中，每个学生对应已选课程的平均分
	);
	
+-----------+-----+-------+
| Sno       | Cno | Grade |
+-----------+-----+-------+
| 201215122 | 2   |    91 |
| 201215124 | 6   |    90 |
+-----------+-----+-------+
2 rows in set (0.00 sec)
```



**相关子查询和不相关子查询**

- 如果子查询的查询条件不依赖于父查询，这类子查询就称为**不相关子查询**。
- 如果子查询的查询条件依赖于父查询，这类子查询就称为**相关子查询**。整个查询语句就称为相关嵌套查询语句。如上

求解相关子查询不能像求解不相关子查询那样一次将子查询求解出来，然后再求解父查询。内存查询由于与外层查询有关，因此必须反复求值。



##### 带有ANY或ALL谓词的子查询

子查询返回单值时可以用比较运算符 ，但返回**多值**时要用**ANY**(SOME)或**ALL**谓词修饰符，同时使用比较运算符。

```mysql
#ANY 和 SOME是一样的
#ANY ：对于子查询返回的列中的任一数值，只要有一个满足比较条件就为true
#ALL ：对于子查询返回的列中的所有值，必须所有值均满足比较条件才为true

> ANY		大于子查询结果的任一值 （只要比其中某个大就为true）
> ALL		大于子查询结果的所有值	（必须比其中的每个值都大才为true）
< ANY
< ALL
>= ANY
>= ALL
<= ANY
<= ALL
= ANY
= ALL
!= (或 <>) ANY
!= (或 <>) ALL
```



```mysql
#查询非计算机科学系中比计算机科学系 任意一个学生年龄小的 学生姓名和年龄
select Sname, Sage, Sdept
from student
where Sdept != 'CS' and Sage < any (
	select Sage 
	from student
);

+--------+------+-------+
| Sname  | Sage | Sdept |
+--------+------+-------+
| 小亮   |   18 | MA    |
| 小雅   |   19 | IS    |
| 小文   |   20 | IS    |
+--------+------+-------+
3 rows in set (0.00 sec)

#首先处理子查询，找出CS系中所有学生的年龄，构成一个集合<19,20,21>;然后处理父查询，找出不是CS系其年龄比集合中某个值小的学生。


#使用聚集函数实现：找出CS系中年龄的最大值，只要比其小即可。
select Sname, Sage, Sdept 
from student
where Sage < (
	select max(Sage)
	from student
) and Sdept != 'CS';



#查询非计算机科学系中比计算机科学系 所有学生 年龄都小的学生姓名及年龄。
#使用 < all
#使用聚集函数  < min(Sage)
```



事实上，**使用聚集函数实现子查询通常比直接使用ANY或ALL查询效率要高。**

ANY、ALL和聚集函数的对应关系

|      | =    | <> 或 != | <     | <=     | >     | >=     |
| ---- | ---- | -------- | ----- | ------ | ----- | ------ |
| ANY  | IN   | --       | < MAX | <= MAX | > MIN | >= MIN |
| ALL  | --   | NOT IN   | < MIN | <= MIN | > MAX | >=MAX  |

如：= ANY 等价于IN谓词，< ANY 等价于 < MAX,  < ALL 等价于 < MIN;



##### 带有EXISTS谓词的子查询

- EXISTS代表量词 ∃。

- 带有EXISTS谓词的子查询 **不返回任何数据**，只产生逻辑真值**true 或**逻辑假值**false**

- 使用存在量词EXISTS后，**若内存查询结果非空**，则外层的WHERE子句返回真值，否则返回假值
- 由EXISTS引出的子查询，其目标列表达式通常用 *****,因为带EXISTS的子查询只返回真值或假值，给出列名无实际意义。



- 与EXISTS对应的是NOT EXISTS。使用存在量词<u>NOT EXISTS</u>后，**若内层查询结果为空**，则外层的WHERE子句返回真值，否则返回假值



```mysql
#查询所有选修了2号课程的学生姓名
select Sname
from student s
where exists (
	select *
	from sc
	where sc.Sno = s.Sno and sc.Cno = '2'
);

+--------+
| Sname  |
+--------+
| 小红   |
| 小美   |
+--------+
2 rows in set (0.00 sec)
```

该<u>相关子查询的执行过程</u>为：

- 首先执行一次外层查询，取student表中的第一个元组，缓存结果
- 将其带入子查询中作为条件进行查询，根据它与内层查询相关属性（Sno)处理内层查询。
- 若子查询有返回结果，则EXISTS子句返回true，将这个元组的Sname放入结果表，否则不放入。
- 然后取Student表的下一个元组，重复这一过程直至外层Student表全部检查完为止。



一些带EXSITS或NOT EXISTS的子查询不能被其他形式的子查询等价替换。**但所有使用IN谓词、比较运算符、ANY和ALL谓词的子查询都能使用带EXISTS谓词的子查询等价替换。**

```mysql
#查询与小美在同一个系学习的学生
#使用EXISTS替换IN
select Sno, Sname, Sdept 
from student s1
where exists (
	select * 
	from student s2
	where s2.Sname = '小美' and s1.Sdept = s2.Sdept
);

+-----------+--------+-------+
| Sno       | Sname  | Sdept |
+-----------+--------+-------+
| 201215121 | 小红   | CS    |
| 201215122 | 小美   | CS    |
| 201215126 | 张三   | CS    |
+-----------+--------+-------+
3 rows in set (0.00 sec)
```



### 3.4、集合查询

##### 并操作UNION

```mysql
案例：查询工作岗位是MANAGER和SALESMAN的员工
select ename,job from emp where job = 'MANAGER' or job = 'SALESMAN';
select ename,job from emp where job in('MANAGER','SALESMAN');
+--------+----------+
| ename  | job      |
+--------+----------+
| ALLEN  | SALESMAN |
| WARD   | SALESMAN |
| JONES  | MANAGER  |
| MARTIN | SALESMAN |
| BLAKE  | MANAGER  |
| CLARK  | MANAGER  |
| TURNER | SALESMAN |
+--------+----------+

select ename,job from emp where job = 'MANAGER'
union
select ename,job from emp where job = 'SALESMAN';

+--------+----------+
| ename  | job      |
+--------+----------+
| JONES  | MANAGER  |
| BLAKE  | MANAGER  |
| CLARK  | MANAGER  |
| ALLEN  | SALESMAN |
| WARD   | SALESMAN |
| MARTIN | SALESMAN |
| TURNER | SALESMAN |
+--------+----------+
```

​	union的效率要高一些。对于表连接来说，每连接一次新表，则匹配的次数满足笛卡尔积，成倍的翻。但是union可以减少匹配的次数。在减少匹配次数的情况下，还可以完成两个结果集的拼接。

a 连接 b 连接 c，a 10条记录，b 10条记录，c 10条记录。

匹配次数是：1000，a 连接 b一个结果：10 * 10 --> 100次，a 连接 c一个结果：10 * 10 --> 100次。
使用union的话是：100次 + 100次 = 200次。（union把乘法变成了加法运算）

union在使用的时候的注意事项

```mysql
//错误的：union在进行结果集合并的时候，要求两个结果集的列数相同。
select ename,job from emp where job = 'MANAGER'
union
select ename from emp where job = 'SALESMAN';

// MYSQL可以，oracle语法严格 ，不可以，报错。要求：结果集合并时列和列的数据类型也要一致。
select ename,job from emp where job = 'MANAGER'
union
select ename,sal from emp where job = 'SALESMAN';
```



##### 交操作INTERSECT

​	MySQL不支持该操作（但是`Inner Join`有求两张表交集的功能）

##### 差操作EXCEPT

​	MySQL不支持该操作





## 四、数据更新

### 4.1、插入数据insert

语法格式：

```mysql
#插入一行
insert 
into 表名(属性列1,属性2,属性列3...) 
 values(常量1,常量2,常量3);  
#其功能是将新元组插入指定 表中，其中新元组的属性列的值为常量1、属性列2的值为常量2.....
  
  
#插入多行
insert 
into 表名(属性列1,属性2,属性列3...) 
values(常量1,常量2,常量3),(常量1,常量2,常量3),....
  
  
例：
INSERT INTO `t_grade`(`gradeName`) VALUES('大三'),('大二'),('大一');

INSERT INTO `t_student`(`NAME`,`SEX`,`BIRTHDAY`,`ADDRESS`,`EMAIL`)
VALUES ('李四','男','2023-03-02','安徽省合肥市屯溪路193号','3357625240@qq.com'),
	   ('王五','男','2021-04-18','安徽省合肥市屯溪路193号','4357625240@qq.com');
```

规则：

- INTO子句中没有出现的属性列，新元组在这些列上取空值。（对应有not null约束的字段会出错）
- 其中属性列的顺序可以和创建表时的顺序不一样
- 当只指出表名，没有指出属性名时，默认插入全部属性，且属性和给定值按照创建表时的顺序一一对应。

补：

`str_to_date`：将字符串varchar类型转换成date类型，通常使用在插入insert方面，因为插入的时候需要一个日期类型的数据，语法格式：`str_to_date('字符串日期', '日期格式')`。

`date_format`：将date类型转换成具有一定格式的varchar字符串类型。

```mysql
mysql的日期格式：
  %Y	年
  %m    月
  %d    日
  %h	时
  %i	分
  %s	秒

insert into t_user(id,name,birth) values(1, 'zhangsan', str_to_date('01-10-1990','%d-%m-%Y'));
mysql默认的日期格式：'%Y-%m-%d'，如果所提供的日期字符串是这个格式，str_to_date函数就不需要了！！！

insert into t_user(id,name,birth) values(2, 'lisi', '1990-10-01');

```

查询的时候可以使用date_format将日期类型转换成特定格式的字符串展示。

语法格式：`date_format(日期类型数据, '日期格式')`，这个函数通常使用在查询日期方面。设置展示的日期格式。

```mysql
select id,name,date_format(birth, '%m/%d/%Y') as birth from t_user;
+------+----------+------------+
| id   | name     | birth      |
+------+----------+------------+
|    1 | zhangsan | 10/01/1990 |
|    2 | lisi     | 10/01/1990 |
+------+----------+------------+
```



### 4.2、修改update

语法格式：

```mysql
update 表名 
set 字段名1=值1,[字段名2=值2,字段名3=值3... ]
[where 条件;]
```

注：
1、没有条件限制会导致所有数据全部更新。
2、其中的值可以是一个变量

```mysql
例子:
UPDATE `t_student`
	SET `NAME` =  '小红', `SEX` = '女', `BIRTHDAY` = '2013-02-01'
		WHERE `ID` = 1;
		
UPDATE `t_student`
	SET  `BIRTHDAY` = CURRENT_DATE  #value是一个变量
		WHERE `ID` = 5;
```





### 4.3、删除数据 delete

语法格式:

```sql
语法格式？
  delete from 表名 [where 条件];

注意：没有条件，整张表的数据会全部删除！

例：
DELETE FROM `t_student` 
	WHERE `id` = 1;
```

> 删除表中数据 delete 和 truncate

测试：

```mysql
	CREATE TABLE `t_test` (
	`id` INT(10)  AUTO_INCREMENT PRIMARY KEY,
	`coll` VARCHAR(20) NOT NULL		
	) ENGINE=INNODB DEFAULT CHARSET=UTF8; 
	
	
	INSERT INTO	`t_test`(`coll`) VALUES ('1'),('2'),('3'); 
	
	DELETE FROM `t_test`;			#不会影响自增字段
	TRUNCATE TABLE `t_test`;		#自增字段归零
	
	#区分
	DROP TABLE `t_test`; #不是删除表中数据，而是删除整个表
```



`delete`和`truncate`的区别:

- 使用delete删除表，表中的数据被删除了，但是这个数据在硬盘上的真实存储空间不会被释放；使用truncate删除表，表被一次截断，物理删除。
- delete删除表，支持回滚；truncate删除表不支持回滚。
- delete删除效率比较低；truncate删除快



补充：使用delete删除表中数据，重启数据库后

- 对于InnoDB，自增列会重1开始（存在内存当中的，断电即失）
- 对于MyISAM，继续从上一个自增量开始（存在文件中的，不会丢失）

## 五、MySQL语法补充

### 5.1、case when 的语法

[case when语法](https://www.cnblogs.com/chenduzizhong/p/9590741.html)



### 5.2、分页  

语法：`limit 查询起始值，页面大小 `

主要参数

- pageSize :页面大小
- n:当前页
- (n-1)*pageSize:第n页起始值
- 数据总数/页面大小 = 总页数



limit作用：将查询结果集的一部分取出来。通常使用在分页查询当中。分页的作用是为了提高用户的体验，因为一次全部都查出来，用户体验差。

limit的使用：完整用法：`limit startIndex, length`，其中 startIndex 是起始下标，length是长度。起始下标从0开始。

```mysql
#页面大小pagesize = 5
#第一页  limit 0,5;   (1-1)*5
#第二页  limit 5,5;	(2-1)*5
#第三页  limit 10,5;	(3-1)*5
...
#第N页   limit (N-1)*pageSize, pageSize;


每页显示3条记录
第1页：limit 0,3		[0 1 2]
第2页：limit 3,3		[3 4 5]
第3页：limit 6,3		[6 7 8]
第4页：limit 9,3		[9 10 11]

每页显示pageSize条记录
第pageNo页：limit (pageNo - 1) * pageSize  , pageSize

```

记公式：`limit (pageNo-1)*pageSize , pageSize`

> 注意：MySQL当中limit在order by之后执行



### 5.3、MD5加密

`MD5(pwd),使用内置的MD5()函数对数据进行加密`

```sql
=========测试MD5加密 ======
CREATE TABLE `testmd5(
	`id` INT（4）NOT NULL,
	`name` VARCHAR（20）NOT NULL,
	`pwd` VARCHAR（50）NOT NULL,
	PRIMARY KEY（`id`）
)ENGINE=INNODB DEFAULT CHARSET=utf8

--明文密码
INSERT INTO testmd5 VALUES(1,'zhangsan','123456'),(2,'lisi','123456'),(3,'wangwu','123456');

--加密
UPDATE testmd5 SET pwd=MD5(pwd) WHERE id = 1;
UPDATE testmd5 SET pwd=MD5(pwd)  --加密全部的密码

--插入的时候加密
INSERT INTO testmd5 VALUES(4,'xiaoming',MD5('123456'));

--如何校验：将用户传递进来的密码，进行md5加密，然后比对加密后的值
SELECT * FROM testmd5 WHERE'name='xiaoming'AND pwd=MD5('123456');
```



