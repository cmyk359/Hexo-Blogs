---
title: MyBatis
tags:
  - MyBatis
categories:
  - JavaWeb
abbrlink: 1bff3c65
date: 2024-12-09 21:50:55
---

<meta name = "referrer", content = "no-referrer"/>

## 一、简介

https://mybatis.org/mybatis-3/zh/index.html

### 1.1、什么是mybatis

- MyBatis 是一款优秀的**持久层**框架，它支持自定义 SQL、存储过程以及高级映射。
- MyBatis 免除了几乎所有的 JDBC 代码以及设置参数和获取结果集的工作。
- MyBatis 可以通过简单的 XML 或注解来配置和映射原始类型、接口和 Java POJO（Plain Old Java Objects，普通老式 Java 对象）为数据库中的记录。

### 1.2、持久化（动作）

数据持久化

- 持久化就是将程序的数据在持久状态和瞬时状态转化的过程
- 内存：断电即失
- 数据库（Jdbc），io文件持久化。
- 生活：冷藏.罐头。

### 1.3、持久层（名词）

Dao层，Service层，Controller层.

- 完成持久化工作的代码块
- 层界限十分明显。

## 二、第一个mybatis程序

### 2.1、搭建环境

### 2.2、创建一个模块

#### 编写mybatis核心配置文件

每个基于 MyBatis 的应用都是以一个 **SqlSessionFactory** 的实例为核心的。SqlSessionFactory 的实例可以通过SqlSessionFactoryBuilder 获得。而 SqlSessionFactoryBuilder 则可以从 **XML 配置文件**或一个预先配置的 Configuration 实例来构建出 SqlSessionFactory 实例。



XML 配置文件中包含了对 MyBatis 系统的核心设置，包括获取数据库连接实例的数据源（DataSource）以及决定事务作用域和控制方式的事务管理器（TransactionManager）。后面会再探讨 XML 配置文件的详细内容，这里先给出一个简单的示例：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">

<!--configuration 核心配置文件-->
<configuration>
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="com.mysql.jdbc.Driver"/>
                <property name="url" value="jdbc:mysql://localhost:3306/mybatis?serverTimezone=Hongkong&amp;useSSL=false&amp;useUnicode=true&amp;characterEncoding=UTF-8"/>
                <property name="username" value="root"/>
                <property name="password" value="liuhao123"/>
            </dataSource>
        </environment>
    </environments>

    <!--每一个Mapper.xml文件都需要在mybatis核心配置文件中注册-->
    <mappers>
        <mapper resource="com/hao/dao/UserMapper.xml"/>
    </mappers>
</configuration>
```

从 XML 文件中构建 SqlSessionFactory 的实例非常简单，建议使用类路径下的资源文件进行配置。 但也可以使用任意的输入流（InputStream）实例，比如用文件路径字符串或 file:// URL 构造的输入流。MyBatis 包含一个名叫 Resources 的工具类，它包含一些实用方法，使得从类路径或其它位置加载资源文件更加容易。

```java
String resource = "org/mybatis/example/mybatis-config.xml"; //xml文件
InputStream inputStream = Resources.getResourceAsStream(resource);  //读取xml文件
SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream); //加载文件流创建工厂
```

既然有了 SqlSessionFactory，顾名思义，我们可以从中获得 SqlSession 的实例。SqlSession 提供了在数据库执行 SQL 命令所需的所有方法。你可以通过 SqlSession 实例来直接执行已映射的 SQL 语句。

```java
try (SqlSession session = sqlSessionFactory.openSession()) {
  Blog blog = (Blog) session.selectOne("org.mybatis.example.BlogMapper.selectBlog", 101);
}
```

诚然，这种方式能够正常工作，对使用旧版本 MyBatis 的用户来说也比较熟悉。但现在有了一种更简洁的方式——使用和指定语句的参数和返回值相匹配的接口（比如 BlogMapper.class），现在你的代码不仅更清晰，更加类型安全，还不用担心可能出错的字符串字面值以及强制类型转换。

```java
try (SqlSession session = sqlSessionFactory.openSession()) {
  BlogMapper mapper = session.getMapper(BlogMapper.class);
  Blog blog = mapper.selectBlog(101);
}
```





#### 编写mybatis工具类

通过上述方法，创建工具类

```java
package com.hao.utils;

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;

import java.io.IOException;
import java.io.InputStream;


//sqlSessionFactor --->sqlSession
public class MybatisUtils {

    private static SqlSessionFactory sqlSessionFactory;
    static {
        try {
            //获取sqlSessionFactory对象
            String resource = "mybatis-config.xml"; //xml文件
            InputStream inputStream = Resources.getResourceAsStream(resource);  //读取xml文件
             sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream); //加载文件流创建工厂
        }catch (IOException e) {
            e.printStackTrace();
        }
    }
	//返回sqlSession对象
    public static SqlSession getSqlSession() {
        return sqlSessionFactory.openSession();
    }
}

```



### 2.3、编写代码

- 实体类

  ```java
  package com.hao.pojo;
  
  public class User {
      private int id;
      private String name;
      private String pwd;
  
      public User() {
      }
  
      public User(int id, String name, String pwd) {
          this.id = id;
          this.name = name;
          this.pwd = pwd;
      }
  
      public int getId() {
          return id;
      }
  
      public void setId(int id) {
          this.id = id;
      }
  
      public String getName() {
          return name;
      }
  
      public void setName(String name) {
          this.name = name;
      }
  
      public String getPwd() {
          return pwd;
      }
  
      public void setPwd(String pwd) {
          this.pwd = pwd;
      }
  
      @Override
      public String toString() {
          return "User{" +
                  "id=" + id +
                  ", name='" + name + '\'' +
                  ", pwd='" + pwd + '\'' +
                  '}';
      }
  }
  
  ```

- Dao接口

  ```java
  package com.hao.dao;
  
  import com.hao.pojo.User;
  
  import java.util.List;
  
  public interface UserDao {
      public List<User> getUserList();
  
  }
  
  ```

- 接口实现类 : 由原来的UseDaoImpl 转变为一个Mapper配置文件

  ```xml
  <?xml version="1.0" encoding="UTF-8" ?>
  <!DOCTYPE mapper
          PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
          "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
  
  <!--namespace 绑定一个Dao/Mapper接口 ，相当于创建了对应接口的实现类-->
  <mapper namespace="org.mybatis.example.BlogMapper">
      <!--id绑定对应接口的方法 ，相当于实现该方法。  select 查询语句。 resultType/resultMap 返回结果-->
      <select id="getUserList" resultType="com.hao.pojo.User">
          select * from mybatis.user
      </select>
  </mapper>
  ```

### 2.4、测试

注意点：

```java
//UserDao这个Mapper没有被注册
org.apache.ibatis.binding.BindingException: Type interface com.hao.dao.UserDao is not known to the MapperRegistry.
```

**每一个Mapper.xml文件都需要在mybatis核心配置文件中注册**

```java
package com.hao.dao;

import com.hao.pojo.User;
import com.hao.utils.MybatisUtils;
import org.apache.ibatis.session.SqlSession;
import org.junit.Test;

import java.util.List;

public class UserDaoTest {
    @Test
    public void test() {
        //1、获取SQLSession对象
        SqlSession sqlSession = MybatisUtils.getSqlSession();

        //2、执行sql
        UserDao userDao = sqlSession.getMapper(UserDao.class);
        List<User> userList = userDao.getUserList();

        for (User user: userList) {
            System.out.println(user.toString());
        }

        //3、关闭SQLSession
        sqlSession.close();
    }
}

```





![image-20220519220624809](https://gitee.com/cmyk359/img/raw/master/img/image-20220519220624809-2024-12-921:58:36.png)



----------------------编写流程：

![image-20220519221147004](https://gitee.com/cmyk359/img/raw/master/img/image-20220519221147004-2024-12-921:58:45.png)

## 三、CRUD

### 3.1、namespace

namespace中的包名要和Dao/mapper接口的包名一致！

### 3.2、select

参数：

- id：对应namespace中的方法名，即绑定对应接口中的一个方法。
  - resultType：sql语句的返回值类型 
- parameterType：参数类型



```xml
    <select id="getUserById" resultType="com.hao.pojo.User" parameterType="int">
        select * from mybatis.user where id = #{id};
    </select>
```

通过**#{}**读取对应方法中的参数



#### 模糊查询

1. java代码执行的时候添加通配符

   ```java
           List<User> userList = userMapper.getUserListByLike("%李%");
   ```

   

2. 在sql拼接中使用通配符（存在sql注入风险）

   ```xml
       <select id="getUserListByLike" resultType="com.hao.pojo.User">
           select * from mybatis.user where name like "%"#{value}"%"
       </select>
   ```

   

### 3.3、insert

```java
    //添加一个用户
    int addUser(User user);
```

```xml
<!--参数对象中的属性可以直接取出来-->    
<insert id="addUser" parameterType="com.hao.pojo.User">
        insert into mybatis.user (id, name, pwd) values (#{id}, #{name}, #{pwd});
</insert>
```



测试时注意：**增删改需要提交事务后才能生效**

测试:

```java
@Test
    public void addUser() {
        //1、获取SQLSession对象
        SqlSession sqlSession = MybatisUtils.getSqlSession();

        //2、执行sql
        UserMapper userMapper = sqlSession.getMapper(UserMapper.class);
        User user = new User(4, "赵六", "1234567");
        int i = userMapper.addUser(user);
        if (i > 0) {
            System.out.println("执行成功！");
        }

        //提交事务
        sqlSession.commit();
        
        //3、关闭SQLSession
        sqlSession.close();
    }
```



万能的map

当我们的实体类或数据库中的表，参数或者字段过多时，我们应当考虑使用map。

```java
    int addUser2(Map<String,Object> map);
```

使用map时，通过map的key来取得数据。key可以自己定义，不必和数据库字段或实体类属性相同。可以传递任意个。

```xml
    <insert id="addUser2" parameterType="map">
        insert into mybatis.user (id, name, pwd) values (#{userId}, #{userName}, #{password});
    </insert>
```

```java
    @Test
    public void addUser2() {
        //1、获取SQLSession对象
        SqlSession sqlSession = MybatisUtils.getSqlSession();

        //2、执行sql
        UserMapper userMapper = sqlSession.getMapper(UserMapper.class);
        
        Map<String, Object> map = new HashMap<>();
        map.put("userId",2);
        map.put("userName","李四");
        map.put("password","1231456");

        int i = userMapper.addUser2(map);
        if (i > 0) {
            System.out.println("执行成功！");
        }

        //提交事务
        sqlSession.commit();
        //3、关闭SQLSession
        sqlSession.close();
    }
```



- map传递参数，直接在sql中取出key即可。
- 对象传递参数，直接在sql中取出对象属性即可。
- 只有一个基本类型参数的情况下，可以直接在sql中取到。





### 3.4、update

### 3.5、 delete

## 四、配置解析

### 4.1、核心配置文件



mybatis-config.xml


MyBatis 配置包含对 MyBatis 行为有显着影响的设置和属性。文档的高层结构如下：

- configuration（配置）
  - [properties（属性）](https://mybatis.org/mybatis-3/zh/configuration.html#properties)
  - [settings（设置）](https://mybatis.org/mybatis-3/zh/configuration.html#settings)
  - [typeAliases（类型别名）](https://mybatis.org/mybatis-3/zh/configuration.html#typeAliases)
  - [typeHandlers（类型处理器）](https://mybatis.org/mybatis-3/zh/configuration.html#typeHandlers)
  - [objectFactory（对象工厂）](https://mybatis.org/mybatis-3/zh/configuration.html#objectFactory)
  - [plugins（插件）](https://mybatis.org/mybatis-3/zh/configuration.html#plugins)
  - environments（环境配置）
    - environment（环境变量）
      - transactionManager（事务管理器）
      - dataSource（数据源）
  - [databaseIdProvider（数据库厂商标识）](https://mybatis.org/mybatis-3/zh/configuration.html#databaseIdProvider)
  - [mappers（映射器）](https://mybatis.org/mybatis-3/zh/configuration.html#mappers)

### 4.2、环境配置(enviroments)

MyBatis 可以配置成适应多种环境，这种机制有助于将 SQL 映射应用于多种数据库之中

**不过要记住：尽管可以配置多个环境，但每个 SqlSessionFactory 实例只能选择一种环境。**所以，如果你想连接两个数据库，就需要创建两个 SqlSessionFactory 实例，每个数据库对应一个。

为了指定创建哪种环境，只要将它作为可选的参数传递给 SqlSessionFactoryBuilder 即可。

```java
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(reader, environment);
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(reader, environment, properties);
```

如果忽略了环境参数(enviroment)，那么将会加载默认环境。

environments 元素定义了如何配置环境。

```xml
<environments default="development">  
  <environment id="development">		
    <transactionManager type="JDBC">
      <property name="..." value="..."/>
    </transactionManager>
    <dataSource type="POOLED">
      <property name="driver" value="${driver}"/>
      <property name="url" value="${url}"/>
      <property name="username" value="${username}"/>
      <property name="password" value="${password}"/>
    </dataSource>
  </environment>
</environments>
```

- 默认环境是 id为development的环境
- 每个环境包含 **事务管理器的配置**(transactionManager) 和 **数据源的配置**(dataSource)



**事务管理器(transactionManager)**

​	在 MyBatis 中有两种类型的事务管理器（也就是 type="[**JDBC**|**MANAGED**]"）

- JDBC
  
-  这个配置直接使用了 JDBC 的提交和回滚功能，它依赖从数据源获得的连接来管理事务作用域。
  
- MANAGED
  - 这个配置几乎没做什么。它从不提交或回滚一个连接，而是让容器来管理事务的整个生命周期。

    

 **数据源(dataSource)**

​	dataSource 元素使用标准的 JDBC 数据源接口来配置 JDBC 连接对象的资源。

​	有三种内建的数据源类型（也就是 type="[**UNPOOLED**|**POOLED**|**JNDI**]"）：

- UNPOOLED
  - 没有连接池。这个数据源的实现会每次请求时打开和关闭连接。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20220525091721413-2024-12-922:03:51.png" alt="image-20220525091721413" style="zoom:150%;" />

- POOLED
  - 带连接池的。每次从池中获取链接，使用完后回收链接而不是关闭。避免了创建新的连接实例时所必需的初始化和认证时间。
  - 常用的数据库连接池：dbcp、c3p0、druid
  - 默认是有池的连接
   ![image-20220525091703820](https://gitee.com/cmyk359/img/raw/master/img/image-20220525091703820-2024-12-922:04:01.png)
- JNDI
  -  这个数据源实现是为了能在如 EJB 或应用服务器这类容器中使用，容器可以集中或在外部配置数据源，然后放置一个 JNDI 上下文的数据源引用。



**Mybatis默认使用的事务管理器是JDBC，数据源默认使用连接池：POOLED**

### 4.3、属性(properties)

我们可以通过properties属性来实现引用配置文件

这些属性都是可外部配置且可动态替换的，既可以在典型的Java属性文件中配置，亦可通过properties元素的子元素来传递。【db.properties】



- 编写一个配置文件 dp.properties

   ```properties
    driver=com.mysql.jdbc.Driver
    url=jdbc:mysql://localhost:3306/mybatis?serverTimezone=Hongkong&useSSL=false&useUnicode=true&characterEncoding=UTF-8
    username=root   
    password=liuhao123
   ```

- 在核心配置文件中引入
  ```xml
        <!--引入配置文件-->
        <properties resource="dp.properties">
            <property name="username" value="root"/>
            <property name="password" value="123456"/>
        </properties>
    
    	<!--使用配置文件中的属性，通过${}-->
        <environments default="development">
            <environment id="development">
                <transactionManager type="JDBC"/>
                <dataSource type="POOLED">
                    <property name="driver" value="${driver}"/>
                    <property name="url" value="${url}"/>
                    <property name="username" value="${username}"/>
                    <property name="password" value="${password}"/>
                </dataSource>
            </environment>
        </environments>
  ```

   在properties标签内部也可以定义一些属性**作为补充**，而当有相同字段时，**优先读取外部配置文件**中的属性。



注意：xml文件中的标签是可以定义顺序的，如在核心配置文件中，必须遵守以下的标签顺序：

![image-20220525093326045](https://gitee.com/cmyk359/img/raw/master/img/image-20220525093326045-2024-12-922:09:05.png)



### 4.4、类型别名(typeAliases)

类型别名是为Java类型**设置一个短的名字**。它只和XML配置有关，存在的意义仅在于用**来减少类完全限定名的冗余。**

如之前返回值类型需要填写完整的类完全限定名com.hao.pojo.user，此时可以通过设置类型别名来使用一个简单名字来优化。

```xml
    <select id="getUserList" resultType="com.hao.pojo.User">
        select * from mybatis.user;
    </select>
```



方法一：在typeAliases标签中为需要起别名的类，添加别名。

```xml
    <!--给类起别名-->
    <typeAliases>
        <typeAlias type="com.hao.pojo.User" alias="User"/>
    </typeAliases>
```

方法二：可以指定一个包，MyBatis 会在包名下面搜索需要的 Java Bean。**在没有注解的情况下**，会使用 Bean 的**首字母小写**的非限定类名来作为它的别名。

```xml
    <!--给类起别名-->
    <typeAliases>
        <package name="com.hao.pojo"/>
    </typeAliases>
```



- 比较

在实体类较少的时候使用第一种方式，如果实体类较多则使用第二种。

第一种方式可以自定义别名，第二种则默认为类名首字母小写。若在第二种方式下也要自定义别名，需要在实体类上添加注解。

```java
@Alias("hello")
public class User {}
```

### 4.5、设置(settings)

**这是 MyBatis 中极为重要的调整设置，它们会改变 MyBatis 的运行时行为。**



其中主要使用到的如下，其余见官网文档。

| 设置名                   | 描述                                                         | 有效值                                                       | 默认值 |
| :----------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :----- |
| cacheEnabled             | 全局性地开启或关闭所有映射器配置文件中已配置的任何缓存。     | true \| false                                                | true   |
| lazyLoadingEnabled       | 延迟加载的全局开关。当开启时，所有关联对象都会延迟加载。 特定关联关系中可通过设置 `fetchType` 属性来覆盖该项的开关状态。 | true \| false                                                | false  |
| useColumnLabel           | 使用列标签代替列名。实际表现依赖于数据库驱动，具体可参考数据库驱动的相关文档，或通过对比测试来观察。 | true \| false                                                | true   |
| useGeneratedKeys         | 允许 JDBC 支持自动生成主键，需要数据库驱动支持。如果设置为 true，将强制使用自动生成主键。尽管一些数据库驱动不支持此特性，但仍可正常工作（如 Derby）。 | true \| false                                                | false  |
| mapUnderscoreToCamelCase | 是否开启驼峰命名自动映射，即从经典数据库列名 A_COLUMN 映射到经典 Java 属性名 aColumn。 | true \| false                                                | false  |
| logImpl                  | 指定 MyBatis 所用日志的具体实现，未指定时将自动查找。        | SLF4J \| LOG4J（3.5.9 起废弃） \| LOG4J2 \| JDK_LOGGING \| COMMONS_LOGGING \| STDOUT_LOGGING \| NO_LOGGING | 未设置 |





### 4.6、其他配置

- [typeHandlers（类型处理器）](https://mybatis.org/mybatis-3/zh/configuration.html#typeHandlers)
- [objectFactory（对象工厂）](https://mybatis.org/mybatis-3/zh/configuration.html#objectFactory)
- plugins（插件）
  - mybatis-generator-core
  - [mybatis-plus](https://baomidou.com/pages/24112f/#%E7%89%B9%E6%80%A7)
  - 通用mapper

### 4.7、映射器(mapper)

告诉mybatis去哪里寻找我们写好的SQL映射语句，即找到mapper.xml.

MapperRegistry：注册绑定我们的mapper文件



**方式一**：使用相对于类路径的资源引用   (**推荐**)

```xml
<!--每一个Mapper.xml文件都需要在mybatis核心配置文件中注册-->	
<mappers>
    <mapper resource="com/hao/mapper/UserMapper.xml"/>
</mappers>
```



**方式二**：使用class文件绑定注册

```xml
<!--每一个Mapper.xml文件都需要在mybatis核心配置文件中注册-->
<mappers>
    <mapper class="com.hao.mapper.UserMapper"></mapper>
</mappers>
```

注意点：

- 接口和它的mapper配置文件**必须同名**
- 接口和它的mapper配置文件**必须在同一个包下**，否则找不到。



**方式三**：使用扫描包进行绑定

```xml
<!--每一个Mapper.xml文件都需要在mybatis核心配置文件中注册-->
<mappers>
    <package name="com.hao.mapper"/>
</mappers>
```

注意点：

- 接口和它的mapper配置文件必须同名
- 接口和它的mapper配置文件必须在同一个包下，否则找不到。

### 4.8、生命周期和作用域

作用域和生命周期类别是至关重要的，因为错误的使用会导致非常严重的**并发问题**。

![image-20220525105645605](https://gitee.com/cmyk359/img/raw/master/img/image-20220525105645605-2024-12-922:09:25.png)

**SqlSessionFactoryBuilder**：

- 一旦创建了 SqlSessionFactory，就不再需要它了。
- 局部变量



**SqlSessionFactory**

- 可以想象为**数据库连接池**
- SqlSessionFactory 一旦被创建就应该在应用的运行期间一直存在，**没有任何理由丢弃它或重新创建另一个实例**。
- 因此 SqlSessionFactory 的最佳作用域是**应用作用域**。 
- 最简单的就是使用单例模式或者静态单例模式。



**SqlSession**

- 相当于连接到连接池的一个请求
- 每个线程都应该有它自己的 SqlSession 实例。
- SqlSession 的实例不是线程安全的，因此是不能被共享的，所以它的最佳的作用域是**请求或方法作用域**。
- 用完后赶紧关闭，否则会占用资源。



三者关系：

![image-20220525111254216](https://gitee.com/cmyk359/img/raw/master/img/image-20220525111254216-2024-12-922:09:33.png)

这里的每一个Mapper，就代表一个具体的业务。

## 五、解决字段名和属性名不一致的问题

### 5.1、问题

数据库中的字段：

![image-20220525113551949](https://gitee.com/cmyk359/img/raw/master/img/image-20220525113551949-2024-12-922:09:42.png)

实体类的属性：

```java
public class User {
    private int id;
    private String name;
    private String password; //和数据库中的不一致
}
```



测试通过id获取用户，对应的sql语句

```java
select * from mybatis.user where id = #{id};
//--------->
select id, name, pwd from mybatis.user where id = #{id};
```



结果出现异常：

![image-20220525113817281](https://gitee.com/cmyk359/img/raw/master/img/image-20220525113817281-2024-12-922:09:44.png)



解决方法：

**由于从数据库中取出的数据不能准确映射到实体类的属性，所以出现了错误。**

该例子中没有显式地配置一个resultMap,但MyBatis 会在幕后**自动创建**一个 `ResultMap`，再根据属性名来映射列到 JavaBean 的属性上。如果列名和属性名不能匹配上，可以在 SELECT 语句中设置列别名（这是一个基本的 SQL 特性）来完成匹配

- 起别名

  ```xml
  select id, name, pwd as password from mybatis.user where id = #{id};
  ```

### 5.2、resultMap

结果集映射

```java
id 	name 	pwd
id 	name 	password   
```

使用resultMap进行映射

```xml
<resultMap id="map" type="user">
    <!--column 数据库中的字段  property 实体类的属性-->
    <result column="pwd" property="password"></result>
</resultMap>

<select id="getUserById" resultMap="map" parameterType="int">
    select * from mybatis.user where id = #{id};
</select>
```





**resultMap**

- `resultMap` 元素是 MyBatis 中最重要最强大的元素。
- ResultMap 的设计思想是，对简单的语句做到零配置，对于复杂一点的语句，只需要描述语句之间的关系就行了。

## 六、日志

### 6.1、日志工厂

如果一个数据库操作，出现了异常，我们需要排错。日志就是最好的助手！

曾经：sout，debug

现在：日志工厂！



![image-20220525163711323](https://gitee.com/cmyk359/img/raw/master/img/image-20220525163711323-2024-12-922:09:52.png)

- SLF4J
- LOG4J(deprecated since 3.5.9)   （掌握）
- LOG4J2
- JDK_LOGGING
- COMMONS_LOGGING
- STDOUT_LOGGING （掌握）  标准日志工厂实现
- NO_LOGGING

```xml
<settings>
    <setting name="logImpl" value="STDOUT_LOGGING"/>
</settings>
```

测试时在控制台输出：

![image-20220525164842001](https://gitee.com/cmyk359/img/raw/master/img/image-20220525164842001-2024-12-922:10:45.png)

### 6.2、Log4j

什么是Log4j？

- Log4j是[Apache](https://baike.baidu.com/item/Apache/8512995)的一个开源项目，通过使用Log4j，我们可以控制日志信息输送的目的地是[控制台](https://baike.baidu.com/item/控制台/2438626)、文件、[GUI](https://baike.baidu.com/item/GUI)组件，甚至是套接口服务器、[NT](https://baike.baidu.com/item/NT/3443842)的事件记录器、[UNIX](https://baike.baidu.com/item/UNIX) [Syslog](https://baike.baidu.com/item/Syslog)[守护进程](https://baike.baidu.com/item/守护进程/966835)等；
- 我们也可以控制每一条日志的输出格式
- 通过定义每一条日志信息的级别，我们能够更加细致地控制日志的生成过程。
- 可以通过一个[配置文件](https://baike.baidu.com/item/配置文件/286550)来灵活地进行配置，而不需要修改应用的代码。



1、导包

```xml
<!-- log4j -->
<dependency>
    <groupId>log4j</groupId>
    <artifactId>log4j</artifactId>
    <version>1.2.17</version>
</dependency>
```

2、添加配置  log4j.properties

```properties
#将等级为DEBUG的日志信息输出到console和file这两个目的地，console和file的定义在下面的代码
log4j.rootLogger=DEBUG,console,file

#控制台输出的相关设置
log4j.appender.console = org.apache.log4j.ConsoleAppender
log4j.appender.console.Target = System.out
log4j.appender.console.Threshold=DEBUG
log4j.appender.console.layout = org.apache.log4j.PatternLayout
log4j.appender.console.layout.ConversionPattern=[%c]-%m%n

#文件输出的相关设置
log4j.appender.file = org.apache.log4j.RollingFileAppender
log4j.appender.file.File=./log/kuang.log
log4j.appender.file.MaxFileSize=10mb
log4j.appender.file.Threshold=DEBUG
log4j.appender.file.layout=org.apache.log4j.PatternLayout
log4j.appender.file.layout.ConversionPattern=[%p][%d{yy-MM-dd}][%c]%m%n

#日志输出级别
log4j.logger.org.mybatis=DEBUG
log4j.logger.java.sql=DEBUG
log4j.logger.java.sql.Statement=DEBUG
log4j.logger.java.sql.ResultSet=DEBUG
log4j.logger.java.sql.PreparedStatement=DEBUG
```

3、测试输出

![image-20220525172132457](https://gitee.com/cmyk359/img/raw/master/img/image-20220525172132457-2024-12-922:10:57.png)





**简单使用**

1、在要使用Log4j的类中，导入包 `import org.apache.log4j.Logger`;

2、日志对象，参数为当前类的class

```java
static Logger logger = Logger.getLogger(UserDaoTest.class);
```

3、日志级别

```java
logger.info("info:进入了testLog4j");
logger.debug("debug:进入了testLog4j");
logger.error("error:进入了testLog4j");
```

## 七、分页

### 7.1、使用limit分页 （推荐）

```sql
select * from user limit startIndex,pageSize;
```

在mybatis中使用

1、接口

```java
//分页查询
List<User> getUserListByLimit(Map map);
```

2、mapper.xml

```xml
<select id="getUserListByLimit" parameterType="map" resultMap="map">
    select * from mybatis.user limit #{startIndex}, #{pageSize}
```

3、测试

```java
    @Test
    public void testGetUerListByLimit() {
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        UserMapper mapper = sqlSession.getMapper(UserMapper.class);
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("startIndex",0);
        map.put("pageSize",2);
        List<User> userList = mapper.getUserListByLimit(map);
        for(User user:userList) {
            System.out.println(user);
        }
    }
```

![image-20220525180052212](https://gitee.com/cmyk359/img/raw/master/img/image-20220525180052212-2024-12-922:11:05.png)

### 7.2、RowBounds实现分页

不再使用Sql实现，而是使用java对象  RowBounds。不推荐

1、接口

```java
//分页查询2
List<User> getUserListByRowBounds();
```

2、mapper.xml

```xml
<select id="getUserListByRowBounds" resultMap="map">
    select * from mybatis.user;
</select>
```

3、测试

```java
    @Test
    public void testGetUserListByRowBounds() {
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        //RowBounds实现
        RowBounds rowBounds = new RowBounds(0,3);
        List<User> userList = sqlSession.selectList("com.hao.mapper.UserMapper.getUserListByRowBounds", null, rowBounds);
        for (User user : userList) {
            System.out.println(user);
        }
        sqlSession.close();
    }
```

![image-20220525181339906](https://gitee.com/cmyk359/img/raw/master/img/image-20220525181339906-2024-12-922:11:13.png)

### 7.3、分页插件

![image-20220525181646324](https://gitee.com/cmyk359/img/raw/master/img/image-20220525181646324-2024-12-922:11:18.png)

[查看](https://pagehelper.github.io/docs/)

## 八、使用注解开发

1、注解在接口上实现

```java
public interface UserMapper {
    @Select("select * from mybatis.user")
    List<User> getUserList();
}
```

2、**在核心配置文件中绑定接口**

```xml
<mappers>
    <mapper class="com.hao.mapper.UserMapper"></mapper>
</mappers>
```

3、测试



本质：反射机制

底层：动态代理

![image-20220526171648377](https://gitee.com/cmyk359/img/raw/master/img/image-20220526171648377-2024-12-922:11:27.png)



**Mybatis详细执行流程：**



<img src="https://gitee.com/cmyk359/img/raw/master/img/mybatis-2024-12-922:11:32.png" alt="mybatis" style="zoom: 100%;" />

[图片](https://www.processon.com/diagraming/628d98f50e3e747f1e8dcde6)



### 8.1、@Param

在实际的开发中，经常会遇到**多个接口参数**的情况。在之前的例子中，我们都是将多个参数合并到一个JavaBean中，但是不可能每次都为不同的参数创建一个新的JavaBean，所以需要使用其他方式来传递多个参数，常见的方法有使用**Map类型**和使用**@param注解**



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





**注解形式下：同上**





### 8.2、CRUD

编写接口，增加注解

```java
public interface UserMapper {
    @Select("select * from mybatis.user")
    List<User> getUserList();

    @Select("select * from mybatis.user where id = #{userId}")
    User getUserById(@Param("userId") int id);

    @Insert("insert into user(id,name,pwd) values (#{id},#{name},#{password})")
    int addUser(User user);

    @Update("update user set name = #{user.name} where id = #{user.id}")
    int updateUser(@Param("user") User user);

    @Delete("delete from user where id = #{uid}")
    int deleteUser(@Param("uid") int id);
}
```

测试

> 我们必须要将接口注册绑定到我们的核心配置文件中

## 九、Lombok

有好有坏，适当使用。



1、在IDEA中下载 LomBok插件

2、在项目中导入jar包

```xml
<!-- https://mvnrepository.com/artifact/org.projectlombok/lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.22</version>
    <scope>provided</scope>
</dependency>
```

3、在实体类上添加注解

```java

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private int id;
    private String name;
    private String password;

}
```





所包含的注解：

```java
@Getter and @Setter
@FieldNameConstants
@ToString
@EqualsAndHashCode
@AllArgsConstructor, @RequiredArgsConstructor and @NoArgsConstructor
@Log, @Log4j, @Log4j2, @Slf4j, @XSlf4j, @CommonsLog, @JBossLog, @Flogger, @CustomLog
@Data
@Builder
@SuperBuilder
@Singular
@Delegate
@Value
@Accessors
@Wither
@With
@SneakyThrows
@val
@var
```





```java
//常用
@Data ：添加Getter、Setter、无参构造器、equals、hashCode、toString
@AllArgsConstructor： 添加有参构造器（所有参数）
@Getter and @Setter：可以加在类前面，也可以加在属性前面
```

## 十、多对一处理



- 多个学生，对应一个老师

![image-20220527110704142](https://gitee.com/cmyk359/img/raw/master/img/image-20220527110704142-2024-12-922:11:51.png)

- 对于学生这边而言，**关联**..多个学生，关联一个老师【多对一】
- 对于老师而言，**集合**，一个老师，有很多学生【一对多】

![image-20220527103918366](https://gitee.com/cmyk359/img/raw/master/img/image-20220527103918366-2024-12-922:11:55.png)



实体类

```java


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Student {
    private int id;
    private String name;

    //学生需要关联一个老师
    private Teacher teacher; //对象
}

//数据库中对应的列是 id name tid
```

```java
package com.hao.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Teacher {
    private int id;
    private String name;
}

```



mapper

```java
public interface StudentMapper {
    List<Student> getStudents();
}
```



**按照嵌套查询**

```xml
<select id="getStudents" resultMap="stu_list">
    select * from student
</select>
<resultMap id="stu_list"   type="Student">
    <result property="id" column="id"/>
    <result property="name" column="name"/>
    <!--复杂类型需要单独处理
            对象：association
            集合：collection
        -->
    <association property="teacher" column="tid" javaType="Teacher" select="getTeacher"/>
</resultMap>
<!--子查询-->
<select id="getTeacher" resultType="Teacher">
    select * from teacher where id = #{tid}
</select>

<!--
通过子查询得到实体类所需的属性
-->
```

**按照连接查询**

```xml
<select id="getStudents" resultMap="student_list">
    select s.id sid, s.name sname, t.name tname
    from student s, teacher t
    where s.tid = t.id
</select>
<resultMap id="student_list" type="Student">
    <!--由于sql中使用了别名，数据库中的列名改为别名-->
    <result property="id" column="sid"/>
    <result property="name" column="sname"/>
    <association property="teacher" javaType="Teacher">
        <result property="name" column="tname"/>
    </association>
</resultMap>

<!--
使用连接查询，将所需要的的所有信息都查出来，由于此时的返回值不对应任何一个实体类，所以使用resultMap将查询到的值，都填到方法返回值所需的实体类中。
-->
```



测试

```java
@Test
public void test() {
    SqlSession sqlSession = MybatisUtils.getSqlSession();
    StudentMapper mapper = sqlSession.getMapper(StudentMapper.class);
    List<Student> students = mapper.getStudents();
    for (Student student : students) {
        System.out.println(student);
    }
}
```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20220530093648543-2024-12-922:12:06.png" alt="image-20220530093648543" style="zoom:80%;" />



## 十一、一对多处理

比如：一个老师拥有多个学生。

对老师而言就是一对多的关系



实体类

```java
@Data
public class Teacher {
    private int id;
    private String name;

    //一个老师拥有多个学生
    private List<Student> students;
}

@Data
public class Student {
    private int id;
    private String name;
    private int tid;
}
```

mapper

```java
public interface TeacherMapper {

    //获取指定老师的信息，及其所有学生的信息
    Teacher getTeacher(@Param("tid") int id);
}
```



**按照结果嵌套处理，连接查询**

```xml
<select id="getTeacher" resultMap="teacher" >
    select s.id sid, s.name sname, t.name tname, t.id tid
    from student s, teacher t
    where s.tid = t.id and t.id = #{tid}
</select>
<resultMap id="teacher" type="Teacher">
    <result property="id" column="tid"/>
    <result property="name" column="tname"/>
    <!--复杂类型需要单独处理
                对象：association
                集合：collection
            javaType=""指定属性的类型
            集合中的泛型信息使用 ofType获取
        -->
    <collection property="students" ofType="Student">
        <result property="id" column="sid"/>
        <result property="name" column="sname"/>
        <result property="tid" column="tid"/>
    </collection>
</resultMap>


```

**嵌套查询**

```xml
<select id="getTeacher" resultMap="teacher" >
    select *
    from teacher
    where id = #{tid}
</select>
<resultMap id="teacher" type="Teacher">
    <!--student的返回值类型：首先是ArrayList 其次内部泛型是Student-->
    <collection property="students" column="id" javaType="ArrayList" ofType="Student" select="getStudents"/>
</resultMap>
<!--子查询-->
<select id="getStudents" resultType="Student">
    select *
    from student
    where tid = #{tid}
</select>
```

#### 小结

- 关联	 ---	association【多对一】

- 集合	 ---	collection【一对多】

- javaType  &   ofType

  JavaType用来指定实体类中属性的类型

  ofType用来指定映射到List或者集合中的pojo类型，泛型中的约束类型！

## 十二、动态SQL

**什么是动态SQL：动态SQL就是根据不同的条件生成不同的SQL语句**

所谓动态SQL，本质还是SQL语句，只是我们可以在SQL层面，执行一些逻辑代码。

### 12.1、主要元素

- if
- choose (when, otherwise)
- trim (where, set)
- foreach



### 12.2、IF

使用动态 SQL 最常见情景是根据条件**包含 where 子句的一部分**。

 `<if test="判断条件"> where 子句的一部分 </if>`

根据判断条件是否为真来`动态拼接`对应的sql代码。

![image-20220530115235733](https://gitee.com/cmyk359/img/raw/master/img/image-20220530115235733-2024-12-922:12:18.png)



如，在博客表中：根据传入的查询条件查询相应的博客，若传入title不为空，则**添加**title模糊查询；若传入author不为空，**添加**author模糊查询条件；若不传入参数，则返回所有博客。

```xml
<select id="getBlogIf" parameterType="map" resultType="Blog">
    select *
    from blog
    where 1 = 1
    <if test="title != null">
        and title like #{title}
    </if>
    <if test="author != null">
        and author like #{author}
    </if>
</select>
```

实际中不可能使用where  1= 1这样的语句，为了避免where之后 直接跟 逻辑运算符而导致SQL语句错误的情况，需要使用`<where> </where>`标签。见下。

### 12.3、choose (when, otherwise)

有时候，我们不想使用所有的条件，而只是想从多个条件中选择一个使用。针对这种情况，MyBatis 提供了 choose 元素，它有点像 Java 中的 switch 语句。

**choose只选择执行其中一种情况，而if可以多个条件叠加**

```java
switch	case	case	default
choose  when	when	otherwise
```



查询博客，若传入了 “title” 就按 “title” 查找，传入了 “author” 就按 “author”查找，若两者都没有传入就查询全部

```xml
<select id="getBlogChoose" resultType="Blog" parameterType="map">
    select * 
    from blog
    <where>
        <choose>
            <when test="title != null">
                title = #{title}
            </when>
            <when test="author != null">
                author = #{author}
            </when>
            <otherwise>
                views = #{views}
            </otherwise>
        </choose>
    </where>
</select>
```



### 12.4、trim (where, set)

**where**

- 为了避免where之后 直接跟 逻辑运算符而导致SQL语句错误的情况，需要使用`<where> </where>`标签。

- *where* 元素只会在子元素返回任何内容的情况下才插入 “WHERE” 子句。

- 而且，若子句的开头为 “AND” 或 “OR”，*where* 元素也会将它们去除。

```xml
<select id="getBlogIf" parameterType="map" resultType="Blog">
    select *
    from blog
    where 1 = 1
    <if test="title != null">
        and title like #{title}
    </if>
    <if test="author != null">
        and author like #{author}
    </if>
</select>


===========================================================================>
    <select id="getBlogIf" parameterType="map" resultType="Blog">
        select *
        from blog
        <where>
            <if test="title != null">
                title like #{title}
            </if>
            <if test="author != null">
                and author like #{author}
            </if>
        </where>
    </select>
```





**set**

- 用于动态更新语句的类似解决方案叫做 *set*

- *set* 元素可以用于动态包含需要更新的列，忽略其它不更新的列。
- *set* 元素会动态地在行首插入 SET 关键字，并会删掉额外的逗号（这些逗号是在使用条件语句给列赋值时引入的）。



根据博客id更新博客内容

```mysql
    <update id="updateBlog" parameterType="map">
        update blog
        <set>
            <if test="tile != null">
                title = #{title},
            </if>
            <if test="author != null">
                author = #{author}
            </if>
        </set>
        where id = #{id}
    </update>
```

如上，不用写set关键字；若title不为空而author为空时，会自动去掉 title = #{title} , 中的逗号。



**trim**

- 使用trim可以进一步定制where和set标签的功能

  

### 12.5、foreach

- 动态 SQL 的另一个常见使用场景是**对集合进行遍历**（尤其是在构建 IN 条件语句的时候）。

- 它允许你指定一个集合，声明可以在元素体内使用的**集合项（item）**和**索引（index）**变量。
- 它也允许你**指定开头与结尾的字符串**以及**集合项迭代之间的分隔符**。

![image-20220530160534936](https://gitee.com/cmyk359/img/raw/master/img/image-20220530160534936-2024-12-922:12:29.png)



查询 1、2和3号博客

```xml
#sql代码
select * from blog where id = 1 or id = 2 or id = 3;

#将其拼接成动态SQL
<select id="getBlogForeach" parameterType="map" resultType="blog">
    select *
    from blog
    <where>
        <foreach collection="ids" item="id" open="(" separator="or" close=")">
            id = #{id}
        </foreach>
    </where>
</select>
```

拼接后的sql为：

```mysql
select * from blog WHERE ( id = ? or id = ? or id = ? )
```



测试:

```java

@Test
public void testGetBlogForeach() {
    SqlSession sqlSession = MybatisUtils.getSqlSession();
    BlogMapper mapper = sqlSession.getMapper(BlogMapper.class);
    Map<String, Object> map = new HashMap<String, Object>();
    ArrayList<Integer> ids = new ArrayList<Integer>();
    ids.add(1);
    ids.add(2);
    ids.add(3);
    map.put("ids",ids);
    List<Blog> blogs = mapper.getBlogForeach(map);
    for (Blog blog : blogs) {
        System.out.println(blog);
    }
    sqlSession.close();
}
```



![image-20220530161516137](https://gitee.com/cmyk359/img/raw/master/img/image-20220530161516137-2024-12-922:12:35.png)



### 12.6、SQL片段

有时候，我们要将一些功能的部分抽取出来，方便复用。

1、使用SQL标签抽取公共部分

```xml
    <sql id="if-title-author">
        <if test="title != null">
            title like #{title}
        </if>
        <if test="author != null">
            and author like #{author}
        </if>
    </sql>
```



2、在需要使用的地方 使用 include标签引用即可

```xml
    <select id="getBlogIf" parameterType="map" resultType="Blog">
        select *
        from blog
        <where>
            <include refid="if-title-author"></include>
        </where>
    </select>
```



注意点：

- 最好基于单表来定义SQL片段
- 其中不要包含where标签

## 十三、缓存（了解）

### 13.1、简介

1、什么是缓存[Cache]？

- 保存在内存中的临时数据
- 将用户经常查询的数据放在缓存（内存）中，用户去查询数据就不用从磁盘上（关系型数据库数据文件）查询，从缓存中查询，从而提高查询效率，解决了高并发系统的性能问题。

2、为什么使用缓存

- **减少和数据库的交互次数**，减少系统开销，提高系统效率。

3、什么样的数据能使用缓存

- **经常查询**并且**不经常改变**的数据。

### 13.2、mybatis缓存

Mybatis系统中默认定义了两级缓存：**一级缓存**和**二级缓存**

- 默认情况下，只有一级缓存开启。（SqlSession级别的缓存，也成本地缓存）
- 二级缓存需要手动开启。（namespace级别的缓存）
- 为了提高扩展性，MyBatis定义了缓存接口Cache。我们可以通过实现Cache接口来自定义二级缓存。

### 13.3、一级缓存

一级缓存也叫本地缓存

- 与数据库同一次会话期间查到的数据会存放在本地缓存中

- 以后如果需要获取**相同的数据**，直接从缓存中拿，而不用再一次去访问数据库。



测试：首先开启日志。

测试在一个SQLSession中两次查询同一个用户，观察SQL执行情况。

```java
    @Test
    public void test() {
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        UserMapper mapper = sqlSession.getMapper(UserMapper.class);
        User user = mapper.getUserById(1);
        System.out.println(user);
        System.out.println("===========================");

        User user1 =mapper.getUserById(1);
        System.out.println(user1);
        System.out.println(user == user1);
        sqlSession.close();
    }
```

![image-20220530204031937](https://gitee.com/cmyk359/img/raw/master/img/image-20220530204031937-2024-12-922:12:43.png)

缓存失效的情况：

- 查询不同的东西
- **增删改**操作，可能会改变原来的数据，使缓存中的变为脏数据，所以必定会刷新缓存。

- 查询不同的Mapper.xml

- 手动清理缓存

   ```java
    sqlSession.clearCache(); //手动清理缓存
   ```

    ![image-20220530204442286](https://gitee.com/cmyk359/img/raw/master/img/image-20220530204442286-2024-12-922:12:48.png)

### 13.4、二级缓存

- 二级缓存也叫全局缓存，一级缓存作用域太低了，所以诞生了二级缓存
- 基于namespace级别的缓存，一个名称空间，对应一个二级缓存；即一个Mapper对应一个二级缓存。
- **工作机制**
  - 一个会话查询一条数据，这个数据就会**首先**被放在当前会话的一级缓存中；
  - **当前会话关闭时**，该会话的一级缓存会被清理，此时会将一级缓存中的数据保存到二级缓存中。
  - 新的会话查询信息，就可以从二级缓存中获取内容
  - 不同mapper查出的数据会放在自己对应的缓存(map)中

 步骤：

1. 开启全局缓存

   ```xml
   <!--显式开启，便于阅读，默认为开启状态-->
   <setting name="cacheEnabled" value="true"/>
   ```

2. 在要使用二级缓存的Mapper中开启

   ```xml
   <!--在当前mapper中开启二级缓存-->
   <cache/>
   ```

   也可以自定义参数

   ```xml
   <cache
     eviction="FIFO"
     flushInterval="60000"
     size="512"
     readOnly="true"/>
   ```

   创建了一个 FIFO 缓存，每隔 60 秒刷新，最多可以存储结果对象或列表的 512 个引用，而且返回的对象被认为是只读的，因此对它们进行修改可能会在不同线程中的调用者产生冲突。

   

   

   可用的清除策略有：

   - `LRU` – 最近最少使用：移除最长时间不被使用的对象。
   - `FIFO` – 先进先出：按对象进入缓存的顺序来移除它们。
   - `SOFT` – 软引用：基于垃圾回收器状态和软引用规则移除对象。
   - `WEAK` – 弱引用：更积极地基于垃圾收集器状态和弱引用规则移除对象。

   默认的清除策略是 **LRU**。

   3. 测试

   注意：实体类需要序列化，否则会报错

   ```java
   public class User implements Serializable {}
   ```

   

```java
@Test
public void test() {
    SqlSession sqlSession = MybatisUtils.getSqlSession();
    UserMapper mapper = sqlSession.getMapper(UserMapper.class);

    User user = mapper.getUserById(1);
    System.out.println(user);
    sqlSession.close(); //关闭第一个会话

    System.out.println("===========================");

    SqlSession sqlSession1 = MybatisUtils.getSqlSession();
    UserMapper mapper1 = sqlSession1.getMapper(UserMapper.class);

    User user1 =mapper1.getUserById(1);
    System.out.println(user1);
    System.out.println(user == user1);
    sqlSession1.close();
}
```

关闭第一个会话后，其查询到数据会从一级缓存 转移到二级缓存，之后创建新的会话再次查询相同内容时，直接从二级缓存中读取。

![image-20220530214627595](https://gitee.com/cmyk359/img/raw/master/img/image-20220530214627595-2024-12-922:12:56.png)



小结：

- 只要开启了二级缓存，在同一个Mapper下就有效。
- 查询到的所有数据，会首先放在一级缓存中；只有当前会话提交或关闭时，才会提交到二级缓存

### 13.5、缓存原理

一个查询语句查询的过程：

- 先看二级缓存中有没有
- 再看一级缓存中有没有
- 若都没有，查询数据库



### 13.6、自定义缓存

之后主要使用 Redis缓存。