---
title: MybatisPlus
categories:
  - JavaWeb
abbrlink: 8af9e237
date: 2024-12-10 22:40:20
tags:
---

<meta name = "referrer", content = "no-referrer"/>

在⽇常开发中单表的CRUD功能代码重复度很⾼，也没有什么难度。⽽这部分代码量往往⽐较⼤，开发起来⽐较费时。因此，⽬前企业中都会使⽤⼀些组件来简化或省略单表的CRUD开发⼯作。⽬前在国内使⽤较多的⼀个
组件就是MybatisPlus。

MybatisPlus不仅仅可以简化单表操作，⽽且还对Mybatis的功能有很多的增强。可以让我们的
开发更加的简单，⾼效。

[官网](https://www.baomidou.com/)

# 一、快速开始

为了⽅便测试，我们先创建⼀个新的项⽬，并准备⼀些基础数据。

## 1.1、环境准备

新建一个SpringBoot项目：

![](https://gitee.com/cmyk359/img/raw/master/img/微服务 Image[2]-2025-2-418:58:00.jpg)

导入数据库表

{% spoiler  "address.sql"%}

```sql
/*
 Navicat Premium Data Transfer

 Source Server         : aa
 Source Server Type    : MySQL
 Source Server Version : 80016
 Source Host           : localhost:3306
 Source Schema         : mp

 Target Server Type    : MySQL
 Target Server Version : 80016
 File Encoding         : 65001

 Date: 04/02/2025 18:59:25
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for address
-- ----------------------------
DROP TABLE IF EXISTS `address`;
CREATE TABLE `address`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NULL DEFAULT NULL COMMENT '用户ID',
  `province` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '省',
  `city` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '市',
  `town` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '县/区',
  `mobile` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '手机',
  `street` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '详细地址',
  `contact` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '联系人',
  `is_default` bit(1) NULL DEFAULT b'0' COMMENT '是否是默认 1默认 0否',
  `notes` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '备注',
  `deleted` bit(1) NULL DEFAULT b'0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 70 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of address
-- ----------------------------
INSERT INTO `address` VALUES (59, 2, '北京', '北京', '朝阳区', '13900112222', '金燕龙办公楼', 'Rose', b'1', NULL, b'1');
INSERT INTO `address` VALUES (60, 1, '北京', '北京', '朝阳区', '13700221122', '修正大厦', 'Jack', b'0', NULL, b'0');
INSERT INTO `address` VALUES (61, 1, '上海', '上海', '浦东新区', '13301212233', '航头镇航头路', 'Jack', b'1', NULL, b'0');
INSERT INTO `address` VALUES (63, 2, '广东', '佛山', '永春', '13301212233', '永春武馆', 'Rose', b'0', NULL, b'0');
INSERT INTO `address` VALUES (64, 3, '浙江', '杭州', '拱墅区', '13567809102', '浙江大学', 'Hope', b'1', NULL, b'0');
INSERT INTO `address` VALUES (65, 3, '浙江', '杭州', '拱墅区', '13967589201', '左岸花园', 'Hope', b'0', NULL, b'0');
INSERT INTO `address` VALUES (66, 4, '湖北', '武汉', '汉口', '13967519202', '天天花园', 'Thomas', b'1', NULL, b'0');
INSERT INTO `address` VALUES (67, 3, '浙江', '杭州', '拱墅区', '13967589201', '左岸花园', 'Hopey', b'0', NULL, b'0');
INSERT INTO `address` VALUES (68, 4, '湖北', '武汉', '汉口', '13967519202', '天天花园', 'Thomas', b'1', NULL, b'0');
INSERT INTO `address` VALUES (69, 3, '浙江', '杭州', '拱墅区', '13967589201', '左岸花园', 'Hopey', b'0', NULL, b'0');
INSERT INTO `address` VALUES (70, 4, '湖北', '武汉', '汉口', '13967519202', '天天花园', 'Thomas', b'1', NULL, b'0');

SET FOREIGN_KEY_CHECKS = 1;

```



{% endspoiler%}

{% spoiler  "tb_user.sql"%}

```sql
/*
 Navicat Premium Data Transfer

 Source Server         : aa
 Source Server Type    : MySQL
 Source Server Version : 80016
 Source Host           : localhost:3306
 Source Schema         : mp

 Target Server Type    : MySQL
 Target Server Version : 80016
 File Encoding         : 65001

 Date: 04/02/2025 18:59:32
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for tb_user
-- ----------------------------
DROP TABLE IF EXISTS `tb_user`;
CREATE TABLE `tb_user`  (
  `id` bigint(19) NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `username` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '用户名',
  `password` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '密码',
  `phone` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '注册手机号',
  `info` json NOT NULL COMMENT '详细信息',
  `status` int(10) NULL DEFAULT 1 COMMENT '使用状态（1正常 2冻结）',
  `balance` int(10) NULL DEFAULT NULL COMMENT '账户余额',
  `create_time` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `update_time` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '用户表' ROW_FORMAT = Compact;

-- ----------------------------
-- Records of tb_user
-- ----------------------------
INSERT INTO `tb_user` VALUES (1, 'Jack', '123', '13900112224', '{\"age\": 20, \"intro\": \"佛系青年\", \"gender\": \"male\"}', 1, 1400, '2023-05-19 20:50:21', '2024-05-31 16:38:32');
INSERT INTO `tb_user` VALUES (2, 'Rose', '123', '13900112223', '{\"age\": 19, \"intro\": \"青涩少女\", \"gender\": \"female\"}', 1, 200, '2023-05-19 21:00:23', '2024-05-31 10:31:23');
INSERT INTO `tb_user` VALUES (3, 'Hope', '123', '13900112222', '{\"age\": 25, \"intro\": \"上进青年\", \"gender\": \"male\"}', 2, 100000, '2023-06-19 22:37:44', '2024-05-31 18:19:56');
INSERT INTO `tb_user` VALUES (4, 'Thomas', '123', '17701265258', '{\"age\": 29, \"intro\": \"伏地魔\", \"gender\": \"male\"}', 1, 400, '2023-06-19 23:44:45', '2024-05-31 10:31:23');
INSERT INTO `tb_user` VALUES (6, 'Lucy', '123', '18688990011', '{\"age\": 24, \"intro\": \"英文老师\", \"gender\": \"female\"}', 1, 200, '2024-05-30 11:34:06', '2024-05-30 11:34:06');
INSERT INTO `tb_user` VALUES (7, 'xiaoming', '123', '18688990011', '{\"age\": 24, \"intro\": \"英文老师\", \"gender\": \"female\"}', 2, 0, '2024-05-31 11:25:41', '2024-05-31 17:17:34');
INSERT INTO `tb_user` VALUES (9, 'xiaomei', '123', '18688990011', '{\"age\": 24, \"intro\": \"英文老师\", \"gender\": \"female\"}', 1, 200, '2024-05-31 11:28:52', '2024-05-31 11:28:52');

SET FOREIGN_KEY_CHECKS = 1;

```

{% endspoiler%}

最后，在 `application.yaml` 中修改jdbc参数为⾃⼰的数据库参数.

## 1.2、快速开始

要实现User表的CRUD，只需要下⾯⼏步：

1. 引⼊MybatisPlus依赖
2.  定义Mapper

### 引入依赖

MybatisPlus提供了starter，实现了⾃动Mybatis以及MybatisPlus的⾃动装配功能，坐标如下：

```xml
<dependency>
	<groupId>com.baomidou</groupId>
	<artifactId>mybatis-plus-boot-starter</artifactId>
	<version>3.5.3.1</version>
</dependency>
```

由于这个starter包含对mybatis的⾃动装配，因此完全可以替换掉Mybatis的starter。
最终，项⽬的依赖如下：

```xml
<dependencies>
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.3.1</version>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>

</dependency>
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
</dependencies>
```

### 定义Mapper

为了简化单表CRUD，MybatisPlus提供了⼀个基础的 `BaseMapper` 接⼝，其中已经实现了单表的CRUD：

![](https://gitee.com/cmyk359/img/raw/master/img/微服务 Image[5]-2025-2-419:06:43.jpg)

⾃定义的Mapper只要继承了这个 BaseMapper ，就⽆需⾃⼰实现单表CRUD了。修改mp-demo中的  `UserMapper` 接⼝，让其继承`BaseMapper` ：

```java
package com.itheima.mp.mapper;
        import com.baomidou.mybatisplus.core.mapper.BaseMapper;
        import com.itheima.mp.domain.po.User;
public interface UserMapper extends BaseMapper<User> {
}
```

### 测试

新建⼀个测试类，编写⼏个单元测试，测试基本的CRUD功能：

```java
package com.itheima.mp.mapper;
import com.itheima.mp.domain.po.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import java.time.LocalDateTime;
import java.util.List;
@SpringBootTest
class UserMapperTest {
    @Autowired
    private UserMapper userMapper;
    @Test
    void testInsert() {
        User user = new User();
        user.setId(5L);
        user.setUsername("Lucy");
        user.setPassword("123");
        user.setPhone("18688990011");
        user.setBalance(200);
        user.setInfo("{\"age\": 24, \"intro\": \"英⽂⽼师\", \"gender\":
                \"female\"}");
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());
        //插入数据
        userMapper.insert(user);
    }
    @Test
    void testSelectById() {
        User user = userMapper.selectById(5L);
        System.out.println("user = " + user);
    }
    @Test
    void testSelectByIds() {
        List<User> users = userMapper.selectBatchIds(List.of(1L, 2L, 3L, 4L,
                5L));
        users.forEach(System.out::println);
    }
    @Test
    void testUpdateById() {
        User user = new User();
        user.setId(5L);
        user.setBalance(20000);
        userMapper.updateById(user);
    }
    @Test
    void testDelete() {
        userMapper.deleteById(5L);
    }
}
```

查看日志输出，可见只需要继承BaseMapper就能省去所有的单表CRUD

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250204191153484-2025-2-419:11:57.png)

## 1.3、常见注解

在刚刚的⼊⻔案例中，我们仅仅引⼊了依赖，继承了BaseMapper就能使⽤MybatisPlus，⾮常简单。但是问题来了：
MybatisPlus如何知道我们要查询的是哪张表？表中有哪些字段呢？

因为UserMapper在继承BaseMapper的时候指定了一个泛型，泛型中的User就是与数据库对应的PO.

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250204193824831-2025-2-419:38:49.png" style="zoom:80%;" />

MyBatisPlus通过扫描实体类，并基于反射获取实体类信息作为数据库表信息，从而生成SQL的。默认情况下：

- MybatisPlus会把PO实体的**类名驼峰转下划线**作为<u>表名</u>
- MybatisPlus会把PO实体的所有**变量名驼峰转下划线**作为<u>表的字段名</u>，并根据变量类型推断字段类型
- MybatisPlus会把**名为id的字段**作为<u>主键</u>

但很多情况下，默认的实现与实际场景不符，因此MybatisPlus提供了一些注解便于我们声明表信息

[官方文档](https://www.baomidou.com/reference/annotation/)

### @TableName

- 描述：表名注解，标识实体类对应的表
- 使用位置：实体类

默认情况下将User类名驼峰转下划线得到的表名 与 实际表名 tb_user不同，此时需要使用@TableName注解指定表名

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250509164803137-2025-5-916:48:04.png)

### @TableId

- 描述：主键注解，标识实体类中的主键字段
- 使用位置：实体类的主键字段

`TableId`注解支持两个属性：

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250509165209265-2025-5-916:52:10.png)

IdType支持的常用类型有

- AUTO ：利⽤数据库的id⾃增⻓
- INPUT ：⼿动⽣成id
- ASSIGN_ID ：雪花算法⽣成 Long 类型的全局唯⼀id，这是**默认**的ID策略

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250509165605231-2025-5-916:56:06.png" style="zoom:80%;" />

### @TableField

用来指定表中的普通字段信息

使用@TableField的常见场景：

- 成员变量名与数据库字段名不一致
- 成员变量名以is开头，且是布尔值。MybatisPlus 识别字段时会把 is 去除，这就导致与数据库不符。
- 成员变量名与数据库关键字冲突。使⽤ @TableField 注解给字段名添加转义字符： ``
- 成员变量不是数据库字段

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250509170000127-2025-5-917:00:01.png)



## 1.4、常见配置

MybatisPlus也⽀持基于yaml⽂件的⾃定义配置，详⻅[官⽅⽂档](https://www.baomidou.com/reference/)

⼤多数的配置都有默认值，因此我们都⽆需配置。但还有⼀些是没有默认值的，例如:

- 实体类的别名扫描包

- 全局id类型
- MyBatisPlus也⽀持⼿写SQL的，⽽mapper⽂件的读取地址可以⾃⼰配置

```yaml
mybatis-plus:
	#Mapper.xml⽂件地址，当前这个是默认值。
	mapper-locations: "classpath*:/mapper/**/*.xml" 
	type-aliases-package: com.itheima.mp.domain.po
	global-config:
		db-config:
			id-type: auto # 全局id类型为⾃增⻓
```

# 二、核心功能

## 2.1、条件构造器

除了新增以外，修改、删除、查询的SQL语句都需要指定where条件。因此BaseMapper中提供的相关方法除了以 id 作为 where 条件以外，还⽀持更加复杂的 where 条件。

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250509172134896-2025-5-917:36:02.png)

参数中的 Wrapper 就是条件构造的抽象类，其下有很多默认实现，继承关系如图：

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250509172242323-2025-5-917:36:26.png)

***

Wrapper 的⼦类 AbstractWrapper 提供了where中包含的所有条件构造⽅法：

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250509173738147-2025-5-917:37:39.png)

QueryWrapper在AbstractWrapper的基础上拓展了⼀个select⽅法，允许指定查询字段：

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250509173522590-2025-5-917:35:24.png)

UpdateWrapper在AbstractWrapper的基础上拓展了⼀个set⽅法，允许指定SQL中的SET部分：

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250509173542078-2025-5-917:35:43.png)

而LambdaUpdateWrapper和LambdaQueryWrapper是基于 Lambda 表达式的Wrapper，用法与前两个一样。它们通过 Lambda 表达式引用实体字段，避免了硬编码，推荐使用。

### 基于LambdaQueryWrapper的查询

QueryWrapper和LambdaQueryWrapper通常用来构建select、delete、update的**where条件部分**

需求：查询出名字中带o的，存款大于等于1000元的人的id、username、info、balance字段

对应的sql语句如下

```sql
SELECT id, username, info, balance
FROM user
WHERE name like ? AND balance >= ?
```

使用QueryWrapper构造查询条件

```java
void testQueryWrapper() {
    //1、构建查询条件
    QueryWrapper<User> queryWrapper = new QueryWrapper<>();
    queryWrapper.select("id","username","info","balance")
        .like("username","o")
        .ge("balance","1000");
    //2、查询
    List<User> userList = userMapper.selectList(queryWrapper);
    System.out.println(userList);
}
```

使用LambdaQueryWrapper优化在使用QueryWrapper中硬编码的方式，字段名通过变量的 gettter 方法引用指定，底层使用反射获取字段名称。

```java
@Test
void testLambdaQueryWrapper() {
    //1、构建查询条件
    LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
    queryWrapper.select(User::getId,User::getUsername,User::getInfo,User::getBalance)
        .like(User::getUsername,"o") // 字段名通过方法引用指定
        .ge(User::getBalance,"1000");
    //2、查询
    List<User> userList = userMapper.selectList(queryWrapper);
    System.out.println(userList);
}
```



### 基于LambdaUpdateWrapper的更新

Updatewrapper和LambdaUpdatewrapper用于构建 UPDATE 或 DELETE 操作的条件（WHERE 子句 + SET 字段）。

需求：更新id为1，2，4的用户的余额，扣200

对应的SQL语句如下：

```sql
UPDATE User
SET balance = balance - 200
WHERE id in (1, 2, 4);
```

基于BaseMapper中的update⽅法更新时只能直接赋值，对于⼀些复杂的需求就难以实现。本例中SET的赋值结果是基于字段现有值的，这个时候就要利⽤UpdateWrapper中的setSql功能了：

```java
@Test
void testLambdaUpdateWrapper() {
    List<Long> ids = List.of(1L,2L,4L);
    LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
    updateWrapper.setSql("balance = balance - 200")
        .in(User::getId,ids);
    userMapper.update(null,updateWrapper);
}
```

## 2.2、自定义SQL

在UpdateWrapper的学习案例中，编写了如下的代码：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250509214151473-2025-5-921:42:12.png" style="zoom:80%;" />

这种写法在某些企业也是不允许的，因为SQL语句最好都维护在持久层，⽽不是业务层。MyBatisPlus擅长的是复杂查询条件的处理，使用条件构造器能够用很短的代码完成复杂动态SQL的生成，而查询条件之前的内容用MP编写比较复杂，有时可能不符合开发规范。

所以，MybatisPlus提供了⾃定义SQL功能，可以利用MyBatisPlus的Wrapper来构建复杂的Where条件，再结合Mapper.xml中编写SQL语句中剩下的部分，两者结合发挥各自的优势。

使用步骤：

1. 基于Wrapper构建where条件

   ```java
   void testCustomSql() {
       //1、查询条件
       List<Long> ids = List.of(1L,2L,4L);
       int amount = 200;
       LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<User>().in(User::getId,ids);;
       //2、执行自定义方法，传递wrapper参数
       userMapper.updateBalanceByIds(updateWrapper,amount);
   }
   ```

2. 在mapper自定义方法，方法参数中用Param注解声明wrapper变量名称，<span style="color:red">必须是ew</span> 或者使用`Constants.WRAPPER`

   ```java
   public interface UserMapper extends BaseMapper<User> {
   
       void updateBalanceByIds(@Param(Constants.WRAPPER) LambdaUpdateWrapper<User> updateWrapper, int amount);
   }
   
   ```

3. 自定义SQL，并使用Wrapper条件

   ```xml
   <update id="updateBalanceByIds">
       update tb_user set balance = balance - #{amount} ${ew.customSqlSegment}
   </update>
   ```

   

## 2.3、Service接口

MybatisPlus不仅提供了BaseMapper，还提供了通⽤的Service接⼝及默认实现，封装了⼀些常⽤的service模板⽅法。

通⽤接⼝为 IService ，默认实现为 ServiceImpl ，其中封装的⽅法分为以下⼏类：

- save ：新增
- remove ：删除
- update ：更新
- get ：查询单个结果
- list ：查询集合结果
- count ：计数
- page ：分⻚查询

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250509221022441-2025-5-922:11:12.png)

使用流程：让我们自定义的service接口继承IService接口以拓展⽅法，同时让自定义的service实现类继承ServiceImpl，这样就不⽤⾃⼰实现 IService 中的接⼝了。例如：

1. 定义 IUserService ，继承 IService

   ```java
   public interface IUserService extends IService<User> {
   	// 拓展⾃定义⽅法
   }
   ```

2. 编写 UserServiceImpl 类，继承 ServiceImpl ，需要指定所使用的Mapper和实体类

   ```java
   @Service
   public class IUserServiceImpl extends ServiceImpl<UserMapper,User> implements IUserService  {
       //实现自定义方法
   }
   ```

   {% note info%}

   继承 ServiceImpl ，需要指定所使用的Mapper和实体类。在ServiceImpl内部已声明了一个对应类型的Mapper属性，取名为baseMapper。所以在自定义的service实现类中不需要再手动注入Mapper了，直接使用即可。

   ![](https://gitee.com/cmyk359/img/raw/master/img/image-20250509225359314-2025-5-922:54:00.png)

   {% endnote%}



对于一些简单的功能，如新增用户、根据id查询用户等，可以在Controller层直接调用Service接口中的对应方法即可，⽆需编写任何service层代码。

```java
@RestController
@RequestMapping("/users")
@Api(tags = "用户相关接口")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService; //通过LomBok注解，使用构造函数实现注入

    @PostMapping
    @ApiOperation("新增用户")
    public void saveUser(@RequestBody  UserFormDTO userFormDTO) {
        //1、属性拷贝
        User user = new User();
        BeanUtils.copyProperties(userFormDTO,user);
        //2、新增
        userService.save(user);
    }

    @DeleteMapping("/{id}")
    @ApiOperation("删除用户")
    public void deleteUser(@PathVariable Long id) {
        userService.removeById(id);
    }

    @GetMapping("/{id}")
    @ApiOperation("根据查询用户")
    public UserVO queryUser(@PathVariable Long id) throws Exception {
        User user = userService.getById(id);
        return BeanUtil.copyProperties(user,UserVO.class);
    }
}
```



对于一些功能复杂的接口，可能需要在Service层做业务逻辑判断，此时则需要在service中⾃定义实现了。比如：根据id扣减余额。首先需要根据id查询到这个用户，判断用户的账户状态是否正常，有没有被冻结，再判断用户余额是否充足，最后执行扣减余额。

这些业务逻辑都要在service层来做，另外更新余额需要⾃定义SQL，要在mapper中来实现。因此，除了要编写controller以外，具体的业务还要在service和mapper中编写。

1. ⾸先在UserController中定义⼀个⽅法：

   ```java
   @PutMapping("/{id}/deduction/{money}")
   @ApiOperation("根据id扣减余额")
   public void deductBalance(@PathVariable("id") Long id, @PathVariable("money") Integer money) throws Exception {
       userService.deductBalance(id,money);
   }
   ```

2. 在UserService接⼝中扩展处理方法

   ```java
   public interface IUserService extends IService<User> {
       void deductBalance( Long id,  Integer money) throws Exception;
   }
   ```

3. 在UserServiceImpl实现类中实现该方法

   ```java
   @Service
   public class IUserServiceImpl extends ServiceImpl<UserMapper,User> implements IUserService  {
   
       /**
        * 根据id扣减余额
        * @param id
        * @param money
        */
       @Override
       public void deductBalance(Long id, Integer money) throws Exception{
           //1、获取用户对象
           User user = getById(id);
           //2、校验账户状态
           if (user == null || user.getStatus() == UserStatus.FROZEN) {
               throw new Exception("用户状态异常");
           }
           //3、校验余额状态
           if (user.getBalance() < money) {
               throw new Exception("用户余额不足");
           }
           // 4.扣减余额
           baseMapper.deductMoneyById(id, money);
       }
   
   ```

4. 最后在mapper中定义对应方法，操作数据库

   ```java
   @Update("UPDATE user SET balance = balance - #{money} WHERE id = #{id}")
   void deductMoneyById(@Param("id") Long id, @Param("money") Integer money);
   ```

### LambdaQuery

IService接口提供的 **LambdaQuery** 和 **LambdaUpdate** 是通过 Lambda 表达式构建查询和更新条件的**链式** API，无需显式创建 Wrapper 对象，可以直接内联动态判断，利用方法参数直接控制条件是否生效，避免了外部if判断。

通过 `lambdaQuery()` 方法创建链式查询条件，支持所有 `LambdaQueryWrapper` 的功能，但写法更简洁。能够完成复杂查询，如需要根据参数动态构建查询以及分页查询。

例如：实现一个根据复杂条件查询用户的接口，查询条件如下：

- name：用户名关键字，可以为空
- status：用户状态，可以为空
- minBalance：最小余额，可以为空
- maxBalance：最大余额，可以为空

如果使用MyBatis，需要编写动态SQL，使用if标签判断传入的查询字段是否为空，不为空时再加入查询条件

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250509233512030-2025-5-923:35:13.png" style="zoom:80%;" />

使用MyBatisPlus，利用IService中的LambdaQuery实现

1. Controller层

   ```java
       @GetMapping("/list")
       @ApiOperation("根据条件批量查询用户")
       public List<UserVO> queryUsers(UserQueryDTO userQueryDTO) {
           return userService.queryUsers(userQueryDTO);
       }
   ```

2. Service接口

   ```java
   public interface IUserService extends IService<User> {
       void deductBalance( Long id,  Integer money) throws Exception;
   
       List<UserVO> queryUsers(UserQueryDTO userQueryDTO);
   }
   ```

3. Service实现类

   ```java
   @Override
   public List<UserVO> queryUsers(UserQueryDTO userQueryDTO) {
   
       //使用lambdaQuery构造查询条件并执行
       List<User> list = lambdaQuery()
           // 动态条件，利用方法参数直接控制条件是否生效
           .like(userQueryDTO.getName() != null, User::getUsername, userQueryDTO.getName()) 
           .eq(userQueryDTO.getStatus() != null, User::getStatus, userQueryDTO.getStatus())
           .ge(userQueryDTO.getMinBalance() != null, User::getBalance, userQueryDTO.getMinBalance())
           .le(userQueryDTO.getMaxBalance() != null, User::getBalance, userQueryDTO.getMaxBalance())
           .list();//返回集合结果。根据前面构建的条件，可以返回一个或多个，也可以进行计数
   
   
       return BeanUtil.copyToList(list,UserVO.class);
   }
   ```
```
   
   

### LambdaUpdate

通过 lambdaUpdate() 方法创建链式更新条件，支持字段更新和条件过滤。

{% note warning%}

使用 lambdaUpdate 设置完字段更新逻辑和更新条件后，在调用链中最后要调用**update**完成更新操作。

{% endnote%}

例如：改造根据id修改用户余额的接口，如果扣减后余额为0，则将用户status修改为冻结状态（2）

​```java
public void deductBalance(Long id, Integer money) throws Exception{
        //1、获取用户对象
        User user = getById(id);
        //2、校验账户状态
        if (user == null || user.getStatus() == UserStatus.FROZEN) {
            throw new Exception("用户状态异常");
        }
        //3、校验余额状态
        if (user.getBalance() < money) {
            throw new Exception("用户余额不足");
        }
        //4、修改余额
        int remainBalance = user.getBalance() - money;
        lambdaUpdate().set(User::getBalance,remainBalance) //修改余额
                .set(remainBalance == 0,User::getStatus,UserStatus.FROZEN)//若余额减为零，则设置账号状态为冻结
                .eq(User::getBalance,user.getBalance()) //乐观锁：更新时，balance和之前一样时才更新
                .eq(User::getId,id)
                .update(); //最终调用update完成更新操作
    }
```

# 三、扩展功能

## 3.1、代码生成

在使⽤MybatisPlus以后，基础的 Mapper 、 Service 、 PO 代码相对固定，重复编写也⽐较⿇烦。因此MybatisPlus官⽅提供了代码⽣成器根据数据库表结构⽣成 PO 、 Mapper 、 Service 等相关代码。只不过代码⽣成器同样要编码使⽤，也很⿇烦。

IDEA中的⼀款 MybatisPlus 的插件，它可以基于图形化界⾯完成 MybatisPlus 的代码⽣成，⾮常简单。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250510115203952-2025-5-1011:52:24.png" style="zoom:80%;" />

安装完后，重启IDEA即可使用。

首先要配置数据库地址，在Idea顶部菜单中，找到other ，选择Config Database ：

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250510115650783-2025-5-1011:56:51.png)

在弹出的窗⼝中填写数据库连接的基本信息，点击ok保存

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250510115730028-2025-5-1011:57:31.png" style="zoom:80%;" />

再次点击Idea顶部菜单中的other，然后选择 Code Generator生成代码，在其中根据自己需要进行配置。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250510115857292-2025-5-1012:05:59.png" style="zoom:80%;" />

## 3.2、静态工具

有的时候Service之间也会相互调⽤，为了避免出现循环依赖问题，MybatisPlus提供⼀个静态⼯具类： `Db` ，其中的⼀些静态方法与 IService 中⽅法签名基本⼀致。由于是静态方法，在使用时要传入要操作的泛型。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250510120115681-2025-5-1012:01:16.png" style="zoom:80%;" />

需求：改造根据id用户查询的接⼝，查询用户的同时返回用户收货地址列表

1. 添加⼀个收货地址的VO对象

   {% spoiler "AddressVO"%}

   ```java
   @Data
   @ApiModel(description = "收货地址VO")
   public class AddressVO{
   
       @ApiModelProperty("id")
       private Long id;
   
       @ApiModelProperty("用户ID")
       private Long userId;
   
       @ApiModelProperty("省")
       private String province;
   
       @ApiModelProperty("市")
       private String city;
   
       @ApiModelProperty("县/区")
       private String town;
   
       @ApiModelProperty("手机")
       private String mobile;
   
       @ApiModelProperty("详细地址")
       private String street;
   
       @ApiModelProperty("联系人")
       private String contact;
   
       @ApiModelProperty("是否是默认 1默认 0否")
       private Boolean isDefault;
   
       @ApiModelProperty("备注")
       private String notes;
   }
   ```

   {% endspoiler%}

2. 改造原来的UserVO，添加⼀个地址属性

   {% spoiler "UserVO"%}

   ```java
   @Data
   @ApiModel(description = "用户VO实体")
   public class UserVO {
   
       @ApiModelProperty("用户id")
       private Long id;
   
       @ApiModelProperty("用户名")
       private String username;
   
       @ApiModelProperty("详细信息")
       private UserInfo info;
   
       @ApiModelProperty("使用状态（1正常 2冻结）")
       private UserStatus status;
   
       @ApiModelProperty("账户余额")
       private Integer balance;
   
       @ApiModelProperty("用户收货地址")
       private List<AddressVO> addresses;
   }
   ```

   

   {% endspoiler%}

3. 修改UserController中根据id查询用户的业务接⼝

   ```java
   @GetMapping("/{id}")
   @ApiOperation("查询用户及其收货地址")
   public UserVO queryUser(@PathVariable Long id) throws Exception {
       return userService.queryUserAndAddressById(id);
   }
   ```

4. 由于查询业务复杂，所以要在service层来实现。在IUserService中定义⽅法

   ```java
   public interface IUserService extends IService<User> {
       void deductBalance( Long id,  Integer money) throws Exception;
       //根据用户id查询用户及其收货地址
       UserVO queryUserAndAddressById(Long id) throws Exception;
   }
   ```

5. 在UserServiceImpl中实现该⽅法

   ```java
   @Override
   public UserVO queryUserAndAddressById(Long id) throws Exception {
       //1、查询用户
       User user = getById(id);
       if (user == null || user.getStatus() == UserStatus.FROZEN) {
           throw new Exception("用户状态异常");
       }
       //2、使用静态工具查询地址
       List<Address> addressList = Db.lambdaQuery(Address.class)
           							.eq(Address::getUserId, id)
           							.list();
   
       //3、封装VO
       //转化User为UserVO
       UserVO userVO = BeanUtil.copyProperties(user, UserVO.class);
       if (CollUtil.isNotEmpty(addressList)) {
           //转化Address为AddressVO
           userVO.setAddresses(BeanUtil.copyToList(addressList, AddressVO.class));
       }
       return userVO;
   }
   ```

在查询地址时，我们采用了Db的静态方法，因此避免了在UserService中注入AddressService，减少了循环依赖的⻛险。

## 3.3、逻辑删除

逻辑删除就是基于代码逻辑模拟删除效果，但并不会真正删除数据。思路如下：

- 在表中添加一个字段标记数据是否被删除
- 当删除数据时把标记置为1
- 查询时只查询标记为0的数据

例如，逻辑删除字段是deleted，则在删除、更新和查询操作时都需要额外添加一个判断deleted字段的条件。

- 删除操作

  ```sql
  UPDATE user SET deleted = 1 WHERE id = 1 AND deleted = 0;
  ```

- 查询操作

  ```sql
  SELECT * FROM user WHERE deleted = 0;
  ```

MybatisPlus提供了逻辑删除功能，**无需改变方法调用的方式**，而是在底层自动修改CRUD的语句。我们要做的就是在application.yaml文件中配置逻辑删除的字段名称和值即可：

```yaml
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted  #配置全局逻辑删除的实体字段名，字段类型可以是boolean,integer
      logic-delete-value: 1 #逻辑已删除对应的值（默认是1）
      logic-not-delete-value: 0 #逻辑未删除对应的值（默认是0）
```



例如，在Address表中已经添加了逻辑删除字段`deleted`，测试MyBatisPlus的逻辑删除功能，看是否自动给SQL语句添加了关于`deleted`字段的判断

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250510123347041-2025-5-1012:33:48.png)

```java
@SpringBootTest
class AddressServiceImplTest {

    @Autowired
    private IAddressService addressService;

    @Test
    public void testLogicDelete() {
        //逻辑删除id为60的地址
        addressService.removeById(60);
		//再次查询
        addressService.getById(60);
    }
}
```

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250510123909931-2025-5-1012:39:11.png)

***

逻辑删除本身也有自己的问题，比如：

- 会导致数据库表垃圾数据越来越多，影响查询效率
- SQL中全都需要对逻辑删除字段做判断，影响查询效率

因此，不太推荐采用逻辑删除功能，如果数据不能删除，可以采用把数据迁移到其它表的办法。

## 3.4、枚举处理器

User类中有⼀个用户状态字段：

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250510125137138-2025-5-1012:51:38.png)

像这种字段我们⼀般会定义⼀个枚举，做业务判断的时候就可以直接基于枚举做⽐较。但是我们数据库采⽤的是 int 类型，对应的PO也是 Integer 。因此业务操作时必须⼿动把 枚举 与 Integer转换，非常麻烦。

因此，MybatisPlus提供了⼀个处理枚举的类型转换器，可以帮我们**把枚举类型与数据库类型⾃动转换**。

首先，定义一个用户状态的枚举类UserStatus，再把 User 类和UserVO中的 status 字段改为 UserStatus 类型。

```java
public enum UserStatus {
    //初始化枚举实例
    NORMAL(1,"正常"),
    FROZEN(2,"冻结")
    ;
    //属性
    @EnumValue //将value字段的值作为数据库中的值
    private Integer value;
    @JsonValue  //前端展示desc属性
    private String desc;
	//构造方法
    UserStatus(Integer value, String desc) {
        this.value = value;
        this.desc = desc;
    }
}

@Data
@TableName(value = "tb_user", autoResultMap = true)
public class User {
    //....省略
    
    /**
     * 使用状态（1正常 2冻结）
     */
    private UserStatus status;
}

//UserVO的修改略
```

要让 MybatisPlus 处理枚举与数据库类型⾃动转换，必须告诉它<u>枚举中的哪个字段的值作为数据库值</u>。MybatisPlus 提供了 `@EnumValue` 注解来标记枚举属性。

然后，在application.yaml⽂件中配置枚举处理器，由它完成指定字段和数据表中属性的转化。

```yaml
mybatis-plus:
  configuration:
    #配置枚举类型处理器
    default-enum-type-handler: com.baomidou.mybatisplus.core.handlers.MybatisEnumTypeHandler

```

最终，查询出的 User 类的 status 字段会是枚举类型（NORMAL、FROZEN），向前端返回时也返回对应的枚举类型。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250510130900570-2025-5-1013:09:01.png" style="zoom:80%;" />

由于SpringMVC默认使用Jackson作为JSON处理器，可以在UserStatus的属性上添加`@JsonValue` 注解标记JSON序列化时展⽰的字段，比如在desc属性上添加该字段，向前端返回的就是（正常、冻结）

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250510130736240-2025-5-1013:07:37.png" style="zoom:80%;" />

## 3.5、JSON处理器

数据库的user表中有⼀个 info 字段，是JSON类型

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250510131859324-2025-5-1013:19:00.png" style="zoom:80%;" />

格式如下：

```json
{"age": 20, "intro": "佛系⻘年", "gender": "male"}
```

而目前 User 实体类中却是 String 类型：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250510132013885-2025-5-1013:20:15.png" style="zoom:80%;" />

此时，要读取info中的属性时就⾮常不⽅便。如果要⽅便获取，info的类型最好是⼀个Map或者实体类。而⼀旦我们把 info 改为 对象 类型，就需要在写入数据库时手动转为 String ，再读取数据库时，手动转换为对象 ，这会非常麻烦。

因此MybatisPlus提供了很多特殊类型字段的类型处理器，解决特殊字段类型与数据库类型转换的问题。例如处理JSON就可以使⽤ JacksonTypeHandler 处理器。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250510132219515-2025-5-1013:22:20.png" style="zoom:80%;" />

首先定义一个UserInfo实体类来与info字段的属性匹配：

```java
@Data
@NoArgsConstructor
@AllArgsConstructor(staticName = "of")
public class UserInfo {
    private Integer age;
    private String intro;
    private String gender;
}
```

接下来，将User类的info字段修改为UserInfo类型，并使用`@TableField`注解为该属性指定类型处理器；并且在`@TableName`注解中 设置autoResultMap = true，完成数据库JSON类型与JAVA实体之间的自动类型转换。

```java
@Data
@TableName(value = "tb_user", autoResultMap = true)
public class User {
	//其他属性略

    /**
     * 详细信息
     */
    @TableField(typeHandler = JacksonTypeHandler.class) //设置类型处理器
    private UserInfo info;
}
```



# 四、插件功能

## 4.1、分页插件