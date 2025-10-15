---
title: MySQL（三）
abbrlink: f07c622d
categories:
  - 数据库
date: 2024-12-09 00:07:44
tags:
---

<meta name = "referrer", content = "no-referrer"/>

[SQL练习](https://www.bilibili.com/video/BV1q4411G7Lw)

<img src="https://gitee.com/cmyk359/img/raw/master/img/v2-86fd263583a6cead51675982c1735e68_r-2024-9-1211:39:45.jpg" style="zoom:80%;" />



{% spoiler "school.sql" %}

对应的建表语句如下，可以直接查看表中字段名，已插入的数据等信息。

```sql
/*
 Navicat Premium Data Transfer

 Source Server         : aa
 Source Server Type    : MySQL
 Source Server Version : 80016
 Source Host           : localhost:3306
 Source Schema         : school

 Target Server Type    : MySQL
 Target Server Version : 80016
 File Encoding         : 65001

 Date: 15/04/2025 10:03:46
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for course
-- ----------------------------
DROP TABLE IF EXISTS `course`;
CREATE TABLE `course`  (
  `c_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `c_name` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `t_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`c_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of course
-- ----------------------------
INSERT INTO `course` VALUES ('01', '语文', '02');
INSERT INTO `course` VALUES ('02', '数学', '01');
INSERT INTO `course` VALUES ('03', '英语', '03');
INSERT INTO `course` VALUES ('04', '政治', '01');

-- ----------------------------
-- Table structure for score
-- ----------------------------
DROP TABLE IF EXISTS `score`;
CREATE TABLE `score`  (
  `s_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `c_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `s_score` int(3) NULL DEFAULT NULL,
  PRIMARY KEY (`s_id`, `c_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of score
-- ----------------------------
INSERT INTO `score` VALUES ('01', '01', 100);
INSERT INTO `score` VALUES ('01', '02', 100);
INSERT INTO `score` VALUES ('01', '03', 100);
INSERT INTO `score` VALUES ('02', '01', 70);
INSERT INTO `score` VALUES ('02', '02', 60);
INSERT INTO `score` VALUES ('02', '03', 80);
INSERT INTO `score` VALUES ('03', '01', 80);
INSERT INTO `score` VALUES ('03', '02', 80);
INSERT INTO `score` VALUES ('03', '03', 80);
INSERT INTO `score` VALUES ('04', '01', 50);
INSERT INTO `score` VALUES ('04', '02', 30);
INSERT INTO `score` VALUES ('04', '03', 20);
INSERT INTO `score` VALUES ('04', '04', 99);
INSERT INTO `score` VALUES ('05', '01', 76);
INSERT INTO `score` VALUES ('05', '02', 87);
INSERT INTO `score` VALUES ('05', '04', 78);
INSERT INTO `score` VALUES ('06', '01', 31);
INSERT INTO `score` VALUES ('06', '03', 34);
INSERT INTO `score` VALUES ('07', '02', 89);
INSERT INTO `score` VALUES ('07', '03', 98);

-- ----------------------------
-- Table structure for student
-- ----------------------------
DROP TABLE IF EXISTS `student`;
CREATE TABLE `student`  (
  `s_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `s_name` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `s_birth` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `s_sex` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`s_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of student
-- ----------------------------
INSERT INTO `student` VALUES ('01', '赵雷', '1990-01-01', '男');
INSERT INTO `student` VALUES ('02', '钱电', '1990-12-21', '男');
INSERT INTO `student` VALUES ('03', '孙风', '1990-05-20', '男');
INSERT INTO `student` VALUES ('04', '李云', '1990-08-06', '男');
INSERT INTO `student` VALUES ('05', '周梅', '1991-12-01', '女');
INSERT INTO `student` VALUES ('06', '吴兰', '1992-03-01', '女');
INSERT INTO `student` VALUES ('07', '郑竹', '1989-07-01', '女');
INSERT INTO `student` VALUES ('08', '小美', '1990-01-20', '女');

-- ----------------------------
-- Table structure for teacher
-- ----------------------------
DROP TABLE IF EXISTS `teacher`;
CREATE TABLE `teacher`  (
  `t_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `t_name` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`t_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of teacher
-- ----------------------------
INSERT INTO `teacher` VALUES ('01', '张三');
INSERT INTO `teacher` VALUES ('02', '李四');
INSERT INTO `teacher` VALUES ('03', '王五');
INSERT INTO `teacher` VALUES ('04', '侯亮平');
INSERT INTO `teacher` VALUES ('05', '侯从');

-- ----------------------------
-- View structure for s_g2
-- ----------------------------
DROP VIEW IF EXISTS `s_g2`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `s_g2` AS select `student`.`s_id` AS `s_id`,`student`.`s_sex` AS `s_sex` from `student` group by `student`.`s_id`;

-- ----------------------------
-- View structure for test
-- ----------------------------
DROP VIEW IF EXISTS `test`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `test` AS select `s_g`.`avg` AS `avg` from `s_g`;

-- ----------------------------
-- Function structure for mock_data
-- ----------------------------
DROP FUNCTION IF EXISTS `mock_data`;
delimiter ;;
CREATE FUNCTION `mock_data`()
 RETURNS int(11)
BEGIN
	DECLARE num INT DEFAULT 1000000;
	DECLARE i INT DEFAULT 0;
	WHILE i<num DO
		INSERT INTO `app_user`(`name`,`email`,`phone`,`gender`)VALUES(CONCAT('用户',i),'19224305@qq.com','123456789',FLOOR(RAND()*2));
		SET i=i+1;
	END WHILE;
	RETURN i;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;

```

{% endspoiler %}

### 1*、查询编号为01的课程比02的课程成绩高的所有学生的学号 

```mysql
-- 1、基于派生表的查询，期望构建出一张表，其中包含，学生的id，01课程的成绩，02课程的成绩，然后通过简单的比较，得出结果
-- SELECT s1.s_id "学号", s1.s_score "课程1的成绩", s2.s_score "课程2的成绩"
SELECT s1.s_id
FROM    -- 构建一个表，包含学生学号、课程1的成绩、课程2的成绩
    (SELECT s_id, s_score
     FROM score
     WHERE c_id = "01") AS s1
    INNER JOIN
        (SELECT s_id, s_score
         FROM score s2
         WHERE c_id = "02") AS s2
    ON s1.s_id = s2.s_id
WHERE s1.s_score > s2.s_score;  -- 从所构建的表中查出课程1的成绩 > 课程2的成绩的学生学号


-- 2、使用带有EXISTS谓词的子查询
SELECT s_id
FROM score s1
WHERE c_id = "01"
    AND EXISTS(
        SELECT *
        FROM score s2
        WHERE s1.s_id = s2.s_id
            AND s2.c_id = "02"
            AND s1.s_score > s2.s_score
);


-- 构造派生表练习：
-- 找出每个学生超过他自己选修课程平均成绩的课程号和成绩
SELECT s1.s_id, s1.c_id, s1.s_score,s2.s_avg_score
FROM
    score s1
    INNER JOIN
    (SELECT  s_id, AVG(s_score) "s_avg_score"
     FROM score
     GROUP BY s_id
     ) AS s2
    ON s1.s_id = s2.s_id
WHERE s1.s_score > s2.s_avg_score;
	
```

注：每个派生表都必须指定一个别名，在其中可以定义查询出字段的名字

{% note info%}

总结：对于一个查询，思考能否将所需要的字段纳入到一张表中，然后通过在这个表中进行简单查找就能得出答案

{% endnote%}

### 2、查询平均成绩大于60分的学生的学号和平均成绩

```sql
--思路：1、期望得到一张表，其中包含学号和平均成绩，直接从中选择平均成绩大于60的即可
SELECT s1.s_id, s1.avg_grade 
FROM (SELECT s_id, AVG(s_score) FROM score GROUP BY s_id) AS s1(s_id, avg_grade) 
WHERE s1.avg_grade > 60;

--思路：2、使用group by 对score表进行分组，再使用avg计算每组的平均值，最后使用having 选出平均值大于60的
-- 注：聚集函数只能用于select和having子句中，不能直接用与where子句；
SELECT s_id, AVG(s_score) 
FROM score
GROUP BY s_id;
HAVING AVG(s_score) > 60
```



### 3、查询所有学生的学号、姓名、选课数、总成绩

```sql
-- 这些信息涉及的表有：student和score，
--1、由于要查询所有的学生选课及分数，连接时必须使用左连接，若使用inner join所求的是交集，没选课的学生信息将不包含在内。
-- 2、分组后统计个数用count，求和用sum
-- 3、使用 IF/CASE WHEN语句做判断，当成绩为null时，返回0
SELECT
    s.s_id '学号',
    s.s_name '姓名',
    COUNT(c_id) "选课数",
    SUM(CASE WHEN s_score IS NULL THEN 0 ELSE s_score END ) "总成绩"
--     SUM(IF(s_score IS NULL, 0, s_score)) "总成绩"
         --使用IF语句判断 IF(condition, true_value, false_value)
FROM student s
    LEFT JOIN
    score sc
    ON s.s_id = sc.s_id
GROUP BY s.s_id, s.s_name;
-- select中只能出现Group By语句中的字段
```



### 4、查询姓侯的老师的人数

```sql
-- 首先用like查出所有姓侯的老师，再用count统计个数
SELECT COUNT(*)
FROM teacher
WHERE t_name LIKE '侯%'
```

### 5*、查询没学过张三老师课的学生的学号和姓名 （**先做逆命题**）

```sql
-- 首先考虑这个问题的逆命题：先查学过张三老师课的学生的学号，最后查student表，返回不属于这个集合的学生即为所求

-- 思路一：嵌套子查询的方式
-- 5.3、哪些学生没选张三老师的课
SELECT s_id "学号", s_name "姓名"
FROM student
WHERE s_id NOT IN (
    -- 5.2、哪些学生选了张三老师的课
    SELECT DISTINCT s_id
    FROM score
    WHERE c_id IN (
        -- 5.1、张三老师教了哪些课
        SELECT c_id
        FROM course c
        WHERE t_id = (SELECT t_id
                      FROM teacher
                      WHERE t_name = "张三"))       
);

-- 思路二：通过构建一个派生表，包含（s_id,c_id,t_id,t_name）即可从中选出学习了张三老师课的学生，最后得出没选的学生
SELECT st.s_id, st.s_name
FROM student st
WHERE s_id NOT IN (
         -- 1、查出学习了张三老师课的学生id
        SELECT DISTINCT s_id
        FROM score s
                INNER JOIN 
    			course c ON s.c_id = c.c_id
                INNER JOIN teacher t ON (c.t_id = t.t_id AND t.t_name = '张三')
    	-- 应该将其作为连接的条件，减少连接时的记录行，减小结果集。而不是全部连接后再从更大的结果集中筛选
        -- WHERE t_name = "张三" 
);
```



### 6*、查询学过张三老师课的学生的学号和姓名

```sql
-- 思路：通过表间连接，得到一张包含（学号，姓名，所学课程，任课老师）的表
SELECT DISTINCT st.s_id, st.s_name
FROM
	-- 由于只找选了张三老师课的学生，故直接用inner join即可
	student st
	INNER JOIN score s on st.s_id = s.s_id
	INNER JOIN course c on s.c_id = c.c_id
	INNER JOIN teacher t on (c.t_id = t.t_id AND t.t_name = '张三');
	

-- 反思：如果表中数据很多，一次性关联多张表的连接会影响性能。
-- 1、应该逐步连接表。先连接前两个表，得到结果集后再去连接下一个表，而不是一次性连接所有表。
-- 2、如果有额外的过滤条件，应该将其加入连接条件中得到更小的结果集，而不是得到更大的结果集后再从中筛选。
-- 3、多表关联查询时，确保连接条件和过滤条件上的列有适当的索引。索引可以显著提高连接操作的性能。
-- 4、可以通过创建视图来简化复杂的连接逻辑，并在视图中应用索引。
```



### 7*、查询学过编号为01的课程并且学过编号为02的课程的学生的学号和姓名

```sql
-- 思路一：先查学过01课程的学生学号，再查学过02课程的学生学号，再求两个的交集即可（通过inner join求结果集的交集）
SELECT s_id,s_name
FROM student
WHERE s_id IN (
    SELECT *
    FROM (SELECT s_id FROM score  WHERE c_id = '01') AS sc1
         NATURAL JOIN
         (SELECT s_id FROM score  WHERE c_id = '02') AS sc2
    )


-- 思路二：在score表中筛选出选修了01课程的学生，同时对应选出的元组使用EXISTS谓词筛选选修了02课程的
SELECT *
FROM student st
WHERE st.s_id IN (
    SELECT sc1.s_id
    FROM score sc1
    WHERE c_id = '01' AND EXISTS(SELECT * FROM score sc2 WHERE sc1.s_id = sc2.s_id AND  sc2.c_id = '02')
    );
    
--思路三：查询score表，将课程号是01或02的元组保留，并按学号分组，查询每组的元组个数，若为2则为选修了01和02 的学生
SELECT st.s_id, st.s_name
FROM score s INNER JOIN 	student st ON s.s_id = st.s_id
WHERE s.c_id IN ("01","02")
GROUP BY s.s_id
HAVING COUNT(s.s_id) = 2
```



### 8、查询课程编号为02的总成绩

```sql
-- 选出课程编号为02记录，统计其中分数的总和
SELECT c_id,SUM(s_score)
FROM score
GROUP BY c_id
HAVING c_id = "02"


SELECT SUM(s_score)
FROM score
WHERE c_id = "02"
```



### 9、查询所有课程成绩小于60分的学生的学号和姓名

```sql
-- 使用内连接
SELECT	st.s_id, st.s_name, s.c_id, s.s_score
FROM score s INNER JOIN student st on s.s_id = st.s_id
WHERE s.s_score < 60

--使用子查询
SELECT DISTINCT s_id,s_name
FROM student
WHERE s_id IN (
	SELECT s_id
	FROM score
	WHERE s_score < 60
)
```



### 10*、查询没有学全所有课的学生的学号和姓名

```sql
-- 思路一：查询所有课程的总数，将score表和student表连接后按照学号分组，若某组的总数小于总的课程数，即为没学全所有课程的学生。

SELECT st.s_id, st.s_name
FROM student st
    INNER JOIN score s
        ON st.s_id = s.s_id
GROUP BY st.s_id
HAVING COUNT(c_id) < (
    SELECT COUNT(c_id)
    FROM course
    );
```



### 11*、查询至少有一门课与学号为01的学生所学课程相同的学生的学号和姓名

```sql
-- 思路：1、学号为01的学生学了哪些课  2、直接将student表和score表连接，从中选出符合条件的学生
SELECT DISTINCT student.s_id,s_name
FROM score NATURAL JOIN student
WHERE c_id IN (
    SELECT c_id
    FROM score
    WHERE s_id = '01'
    ) 
    AND s_id != '01';
    
-- 其他写法 
 SELECT s_id, s_name
FROM student
WHERE s_id IN ( --使用IN
    SELECT DISTINCT s_id
    FROM score
    WHERE c_id IN (
                SELECT c_id
                FROM score
                WHERE s_id = '01'
                )
        AND s_id != '01'
    )
    
SELECT a.s_id, a.s_name
FROM student AS a
INNER JOIN -- 用INNER JOIN代替 IN,数据量较大时比IN的效率高
    (
        SELECT DISTINCT s_id
        FROM score
        WHERE c_id IN (
            SELECT c_id
            FROM score
            WHERE s_id = '01'
            )
            AND s_id != '01'
    ) AS b
ON a.s_id = b.s_id;
```



### 12*、查询与学号为01的学生所学课程**完全相同**的学生的学号和姓名

```sql
-- 思路：1、查询出学号为01的学生学了哪些课 
--		2、从score表中将有与学号为01同学选课重叠的记录都保留下来，如01同学选了课程号为01,02,03的		   课程，使用谓词IN从score表中将选课编号包含在内的记录都保留下来，按照学号分组，统计每组的			个数，保留选课数量与01同学选课数量相同的组，即找到了与其所选课程完全相同的学生学号
--		3、可以使用谓词IN或INNNER JOIN从student表中得到学号和姓名

SELECT a.s_id, a.s_name
FROM student AS a
INNER JOIN (    -- 3、INNER JOIN代替 IN
    SELECT DISTINCT s_id
    FROM score
    WHERE c_id IN ( --1、筛选所选课程编号在01同学选课编号集合中的记录
        SELECT c_id FROM score WHERE s_id = '01'
        )
        AND s_id != '01'
    GROUP BY s_id --2、按学号分组，统计每组的选课数
    HAVING COUNT(c_id) = (
        SELECT COUNT(c_id) FROM score WHERE s_id = '01'
        )
) AS b
ON a.s_id = b.s_id;
```



### 15**、查询两门及以上不及格课程的学生的学号姓名及平均成绩

```sql
-- 思路：先使用WHERE语句筛选出课程不及格的记录，再按照学号分组，统计每组的记录数，将总数大于等于2的分组保留，返回每组对应的学号和平均成绩。再使用INNER/RIGHT JOIN与student表做连接，最终得到满足条件的学生的学号，姓名以及平均成绩

SELECT st.s_id, st.s_name, temp.avg_grade
FROM student AS st
INNER JOIN (
    SELECT DISTINCT s_id, AVG(s_score)
    FROM score
    WHERE s_score < 60
    GROUP BY s_id
    HAVING COUNT(*) >= 2
) AS temp(s_id, avg_grade)
ON st.s_id = temp.s_id;
```



### 16、检索01课程分数小于60，按分数降序排列的学生信息

```sql
SELECT st.s_id,
       st.s_name,
       temp.c_id,
       temp.s_score
FROM student AS st
RIGHT JOIN (
    SELECT s_id,c_id,s_score
    FROM score
    WHERE c_id = '01'
        AND s_score < 60
) AS temp
ON st.s_id = temp.s_id
ORDER BY temp.s_score DESC ;
```