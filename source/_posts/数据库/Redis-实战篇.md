---
title: Redis - 实战篇
tags:
  - 缓存问题
  - 全局唯一ID
  - Lua脚本
  - 分布式锁
  - Redisson
  - Redis消息队列
  - Feed流
  - GEO
  - BitMap
  - HyperLogLog
categories:
  - 数据库
abbrlink: e0606bbf
date: 2024-12-22 21:53:57
---

<meta name = "referrer", content = "no-referrer"/>

基于一个springboot项目 黑马点评 ，用以学习Redis在web中的各种使用方式和场景。

[项目初始代码](https://pan.baidu.com/s/1189u6u4icQYHg_9_7ovWmA?pwd=eh11#list/path=%2Fsharelink3232509500-235828228909890%2F7%E3%80%81Redis%E5%85%A5%E9%97%A8%E5%88%B0%E5%AE%9E%E6%88%98%E6%95%99%E7%A8%8B%2FRedis-%E7%AC%94%E8%AE%B0%E8%B5%84%E6%96%99%2F02-%E5%AE%9E%E6%88%98%E7%AF%87%2F%E8%B5%84%E6%96%99&parentPath=%2Fsharelink3232509500-235828228909890)

[项目导入参考](https://www.bilibili.com/video/BV1cr4y1671t?vd_source=51d78ede0a0127d1839d6abf9204d1ee&spm_id_from=333.788.videopod.episodes&p=25)

## 一、短信登录

> Redis的共享Session应用

### 1.1、基于Session实现登录的流程

![image-20241211101059066](https://gitee.com/cmyk359/img/raw/master/img/image-20241211101059066-2024-12-1110:11:15.png)

**发送验证码：**

用户在提交手机号后，会校验手机号是否合法，如果不合法，则要求用户重新输入手机号。

如果手机号合法，后台此时生成对应的验证码，同时将验证码进行保存，然后再通过短信的方式将验证码发送给用户

**短信验证码登录、注册：**

​	用户将验证码和手机号进行输入，后台从session中拿到当前验证码，然后和用户输入的验证码进行校验，如果不一致，则无法通过校验，如果一致，则后台根据手机号查询用户，如果用户不存在，则为用户创建账号信息，保存到数据库，无论是否存在，都会将用户信息保存到session中，方便后续获得当前登录信息

**校验登录状态:**

用户在请求时候，会从cookie中携带JsessionId到后台，后台通过JsessionId从session中拿到用户信息，如果没有session信息，则进行拦截，如果有session信息，则将用户信息保存到threadLocal中，并且放行。



#### 发送验证码

页面流程如下，输入手机号后点击发送验证码，会向后端路径为 `/user/code`的接口发起请求

![image-20241211111739244](https://gitee.com/cmyk359/img/raw/master/img/image-20241211111739244-2024-12-1111:17:41.png)



在对应的service层编写业务逻辑

```java
@Override
public Result sendCode(String phone, HttpSession session) {
    //1. 校验手机号
    if (RegexUtils.isPhoneInvalid(phone)) {
        //校验失败，返回错误信息
        return Result.fail("手机号格式错误！");
    }
    //2.校验成功，生成验证码
    String code = RandomUtil.randomNumbers(6);
    //3.保存验证码
    //将session的id名称“login_code”设置为常量
    session.setAttribute(SystemConstants.User_LOGIN_SESSION_ID,code);
    //4.发送验证码（模拟，实际调用发送验证码功能模块完成）
    log.debug("发送短信验证码成功，验证码：{}", code);
    return Result.ok();
}
```

测试结果：

![image-20241211112139742](https://gitee.com/cmyk359/img/raw/master/img/image-20241211112139742-2024-12-1111:21:41.png)



#### 短信验证码登录、注册

填入获得的验证码点击登录后，会向后端接口为`/user/login`的接口发起登录请求

![image-20241211112401673](https://gitee.com/cmyk359/img/raw/master/img/image-20241211112401673-2024-12-1111:24:02.png)



```java
@Override
public Result login(LoginFormDTO loginForm, HttpSession session) {
    //1.校验手机号
    String phone = loginForm.getPhone();
    if (RegexUtils.isPhoneInvalid(phone)) {
        //校验失败，返回错误信息
        return Result.fail("手机号格式错误！");
    }
    //2.校验验证码
    String code = loginForm.getCode();
    Object cachedCode = session.getAttribute(SystemConstants.User_LOGIN_SESSION_ID);
    if (code == null || !cachedCode.toString().equals(code)){
        //验证码不一致，返回错误信息
        return Result.fail("验证码错误");
    }
    //3.验证码一致，根据手机号查询用户（基于MyBatisPlus）
    User user = query().eq("phone", phone).one(); 
    //4.用户不存在，创建用户，保存到数据库
    if (user == null) {
        user = createUserWithPhone(phone);
    }
    //5.保存用户到session中
    //session中不必保存用户的所有信息，隐藏密码登敏感信息
    UserDTO userDTO = BeanUtil.copyProperties(user, UserDTO.class);
    session.setAttribute(SystemConstants.User_INFO_SESSION_ID,userDTO);
    return Result.ok();
}
private User createUserWithPhone(String phone) {
    //1.创建用户
    User user = new User();
    user.setPhone(phone);
    user.setNickName(SystemConstants.USER_NICK_NAME_PREFIX+RandomUtil.randomString(8));
    //2.保存用户
    save(user);
    return user;
}
```

#### 校验登录状态

用户在访问接口时需要验证登录信息，这种验证逻辑不能只写在某个一个功能接口中，因为其他的功能接口可能也要进行登录校验。因此，可以将登录校验逻辑写在**拦截器**中，对每个接口的访问都要首先经过拦截器拦截验证，若用户已登录将登录信息保存到此次请求线程的ThreadLocal中，每个线程操作自己的一份数据。

![image-20241211120555985](https://gitee.com/cmyk359/img/raw/master/img/image-20241211120555985-2024-12-1112:05:57.png)

创建拦截器

```java
@Slf4j
@Component
public class LoginInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        //1.获取session
        HttpSession session = request.getSession();
        //2.获取session中的用户
        UserDTO userDTO = (UserDTO)session.getAttribute(USER_INFO_SESSION_ID);
        //3.判断用户是否存在
        if (userDTO == null) {
            //不存在，拦截请求，返回未授权状态码401
            response.setStatus(401);
            return false;
        }
        //4.存在将用户信息保存到ThreadLocal中
        //此处使用自定义的ThreadLocal工具类完成
        log.info("请求路径：{}，拦截器验证通过，从session中取出的UserDTO为:{}",request.getRequestURL(),userDTO);
        UserHolder.saveUser(userDTO);
        //5.放行
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        //移除用户
        UserHolder.removeUser();
    }
}

```



配置拦截器使之生效

```java
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {
    
    private final LoginInterceptor loginInterceptor;

    //添加拦截器
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/shop/**",
                        "/voucher/**",
                        "/shop-type/**",
                        "/upload/**",
                        "/blog/hot",
                        "/user/code",
                        "/user/login"
                );
    }
}

```

> 补充：
>
> 当用户发起请求时，会访问我们向tomcat注册的端口，任何程序想要运行，都需要有一个线程对当前端口号进行监听，tomcat也不例外，当监听线程知道用户想要和tomcat连接连接时，那会由监听线程创建socket连接，socket都是成对出现的，用户通过socket相互相传递数据，当tomcat端的socket接受到数据后，此时监听线程会从tomcat的线程池中取出一个线程执行用户请求，在我们的服务部署到tomcat后，线程会找到用户想要访问的工程，然后用这个线程转发到工程中的controller，service，dao中，并且访问对应的DB，在用户执行完请求后，再统一返回，再找到tomcat端的socket，再将数据写回到用户端的socket，完成请求和响应
>
> 通过以上讲解，我们可以得知 每个用户其实对应都是去找tomcat线程池中的一个线程来完成工作的， 使用完成后再进行回收，既然每个请求都是独立的，所以在每个用户去访问我们的工程时，我们可以使用threadlocal来做到线程隔离，每个线程操作自己的一份数据



### 1.2、集群的Session共享问题

session共享问题：多台Tomcat并不共享session存储空间，当请求切换到不同tomcat服务时导致数据丢失的问题。

​	每个tomcat中都有一份属于自己的session,假设用户第一次访问第一台tomcat，并且把自己的信息存放到第一台服务器的session中，但是第二次这个用户访问到了第二台tomcat，那么在第二台服务器上，肯定没有第一台服务器存放的session，所以此时 整个登录拦截功能就会出现问题。早期的方案是session拷贝，就是说虽然每个tomcat上都有不同的session，但是每当任意一台服务器的session修改时，都会同步给其他的Tomcat服务器的session，这样的话，就可以实现session的共享了

但是这种方案具有两个大问题

1、每台服务器中都有完整的一份session数据，服务器压力过大。

2、session拷贝数据时，可能会出现延迟



session的替代方案应该满足：数据共享、内存存储，key、value结构。基于以上特性可以选择使用**Redis**代替Session。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241211161446154-2024-12-1116:15:45.png" alt="image-20241211161446154" style="zoom:80%;" />

### 1.3、基于Reids实现共享Session的登录

整体访问流程：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241211171313432-2024-12-1117:13:17.png" alt="image-20241211171313432" style="zoom:80%;" />

细节：

1、本项目中使用`StringRedisTemplate`进行序列化，其要求存入的key和value都是String类型。当用户成功登录或注册后，需要存入Redis的UserDTO的id为Long类型，通过Bean转化得到的HashMap无法直接存入Redis。

方案一：在利用BeanUtil工具将UserDTO转化为HashMap时指定转换规则，将value都转化为String类型。

```java
UserDTO userDTO = BeanUtil.copyProperties(user, UserDTO.class);
Map<String, Object> userMap = BeanUtil.beanToMap(userDTO,
        new HashMap<>(),
        CopyOptions.create()
                .setIgnoreNullValue(true) //忽略其中为null的属性
                .setFieldValueEditor(    //设置属性编辑器
                    (filedName, filedValue) -> filedValue.toString()));
```

方案二：利用Steam流对所转化的HashMap做进一步处理，将value都转化为String类型

```java
UserDTO userDTO = BeanUtil.copyProperties(user, UserDTO.class);
Map<String, Object> userMap = BeanUtil.beanToMap(userDTO);
Map<String,String> convertUserMap = userMap.entrySet()
        .stream()
        .collect(Collectors.toMap(
                Map.Entry::getKey,
                e-> String.valueOf(e.getValue())
        ));
```



2、在创建token时指定了其过期时间为30分钟，为了保证用户在使用过程中token不过期，在拦截器中添加了刷新过期时间的逻辑。但这种方式只能保证用户在访问被拦截的路径时会刷新，而对于访问首页，商品页等不需要拦截的页面超过30分钟后token还是会失效，需要重新登陆。

为此，再添加一个拦截器`RefreshTokenInterceptor`，拦截所有路径的请求，在其中获取token，刷新token过期时间，使用token从Redis中查询用户数据，将其保存保存在ThreadLocal中，但不做拦截，一律放行到原来的拦截器。在原来的拦截器中通过判断ThreadLocal中是否存入了用户数据来决定是否放行。



> 具体代码如下：

1、发送验证码

```java
@Override
public Result sendCode(String phone, HttpSession session) {
    //1. 校验手机号
    if (RegexUtils.isPhoneInvalid(phone)) {
        //校验失败，返回错误信息
        return Result.fail("手机号格式错误！");
    }
    //2.校验成功，生成验证码
    String code = RandomUtil.randomNumbers(6);
    //3.保存验证码到Redis，并设置验证码有效期为2min
    String key = LOGIN_CODE_KEY + phone;
    stringRedisTemplate
        .opsForValue()
        .set(key,code,LOGIN_CODE_TTL, TimeUnit.MINUTES);
    
    //4.发送验证码（模拟，实际调用发送验证码功能模块完成）
    log.debug("发送短信验证码成功，验证码：{}", code);
    return Result.ok();
}
```

2、短信验证码登录、注册

```java
@Override
public Result login(LoginFormDTO loginForm, HttpSession session) {
    //1.校验手机号
    String phone = loginForm.getPhone();
    if (RegexUtils.isPhoneInvalid(phone)) {
        //校验失败，返回错误信息
        return Result.fail("手机号格式错误！");
    }
    //2.从Redis获取验证码进行校验
    String code = loginForm.getCode();
    String key = LOGIN_CODE_KEY + phone;
    String cacheCode = stringRedisTemplate.opsForValue().get(key);
    if (cacheCode == null || !cacheCode.equals(code)){
        //验证码不一致，返回错误信息
        return Result.fail("验证码错误");
    }
    //3.验证码一致，根据手机号查询用户
    User user = query().eq("phone", phone).one();
    //4.用户不存在，创建用户，保存到数据库
    if (user == null) {
        user = createUserWithPhone(phone);
    }
    //5.保存用户到red中
    //5.1 生成随机token
    String token = UUID.randomUUID().toString(true);
    //5.2 将UserDTO对象转为HashMap存储
    UserDTO userDTO = BeanUtil.copyProperties(user, UserDTO.class);
    //注：stringRedisTemplate的键和值都是String类型，而UserDTO的id是Long类型，无法直接存入
    Map<String, Object> userMap = BeanUtil.beanToMap(userDTO,
            new HashMap<>(),
            CopyOptions.create()
                    .setIgnoreNullValue(true)
                    //设置属性转化，将value都转化为String类型
                    .setFieldValueEditor(
                        (filedName, filedValue) -> filedValue.toString()));
    //5.3 存入Redis
    String tokenKey = LOGIN_USER_KEY + token;
    stringRedisTemplate.opsForHash().putAll(tokenKey,userMap);
    //5.4、设置token有效期
    stringRedisTemplate.expire(tokenKey,LOGIN_USER_TTL,TimeUnit.MINUTES);
    //6. 将token返回
    return Result.ok(token);
}

private User createUserWithPhone(String phone) {
    //1.创建用户
    User user = new User();
    user.setPhone(phone);
    user.setNickName(USER_NICK_NAME_PREFIX+RandomUtil.randomString(8));
    //2.保存用户
    save(user);
    return user;
}
```



3、拦截器配置

token刷新拦截器

```java
@Component
@RequiredArgsConstructor
public class RefreshTokenInterceptor implements HandlerInterceptor {
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request, 
                             HttpServletResponse response, 
                             Object handler) throws Exception {
        //1.从请求头中获取token
        String token = request.getHeader("authorization");
        log.info("请求路径：{}，token:{}",request.getRequestURL(),token);
        if (StrUtil.isBlank(token)) {
            //token不存在，放行到登录拦截器
            return true;
        }

        //2.从Redis获取用户数据
        String tokenKey = LOGIN_USER_KEY + token;
        Map<Object, Object> userMap = stringRedisTemplate
            .opsForHash()
            .entries(tokenKey);
        
        if (userMap.isEmpty()) {
            //用户数据不存在，放行到登录拦截器
            return true;
        }

        //3.将查询到的Hash数据转化为UserDTO对象
        UserDTO userDTO = BeanUtil.fillBeanWithMap(userMap, new UserDTO(), false);

        //4.存在将用户信息保存到ThreadLocal中
        //此处使用自定义的ThreadLocal工具类完成(创建ThreadLocal对象，添加UserDTO)
        UserHolder.saveUser(userDTO);

        //5.刷新token时间
        stringRedisTemplate.expire(tokenKey,LOGIN_USER_TTL, TimeUnit.MINUTES);

        //6.放行
        return true;
    }
	
    @Override
    public void afterCompletion(HttpServletRequest request, 
                                HttpServletResponse response, 
                                Object handler, Exception ex) throws Exception {
        //移除用户
        UserHolder.removeUser();
    }
}
```

登录拦截器

```java
@Component
public class LoginInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        //1. 判断是否需要拦截（ThreadLocal中是否有用户）
        UserDTO user = UserHolder.getUser();
        if (user == null) {
            //2. 没有，需要拦截
            response.setStatus(401);
            return false;
        }
        //3.有用户，放行
        return true;
    }

}
```

拦截器注册

```java
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final LoginInterceptor loginInterceptor;
    private final RefreshTokenInterceptor refreshTokenInterceptor;
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        //添加登录拦截器
        registry.addInterceptor(loginInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/shop/**",
                        "/voucher/**",
                        "/shop-type/**",
                        "/upload/**",
                        "/blog/hot",
                        "/user/code",
                        "/user/login"
                ).order(1);
        
        //添加token刷新拦截器
        registry.addInterceptor(refreshTokenInterceptor)
            .addPathPatterns("/**")
            .order(0); //先执行
    }
}

```



## 二、商户查询缓存

> 企业的缓存使用技巧，缓存穿透雪崩等问题的解决

### 2.1、缓存

缓存就是数据交换的缓冲区（cache），是存贮数据的临时地方，一般**读写性能较高**。

缓存数据存储于代码中,而代码运行在内存中,内存的读写性能远高于磁盘,缓存可以大大降低**用户访问并发量带来的**服务器读写压力，降低响应时间

实际开发中,会构筑**多级缓存**来使系统运行速度进一步提升,例如:本地缓存与redis中的缓存并发使用

![image-20241212101231710](https://gitee.com/cmyk359/img/raw/master/img/image-20241212101231710-2024-12-1210:13:03.png)

缓存的成本：

- 数据一致性成本（需要保证缓存与数据库中数据的一致性）
- 代码维护成本
- 运维成本（为保证缓存高可用，需要搭建缓存集群，增加运维成本）



### 2.2、添加Redis缓存

![image-20241212104712006](https://gitee.com/cmyk359/img/raw/master/img/image-20241212104712006-2024-12-1210:47:19.png)

操作思路：查询数据库之前先查询缓存，如果缓存数据存在，则直接从缓存中返回，如果缓存数据不存在，再查询数据库，然后将数据存入redis并将数据返回。

此处使用String类型存储店铺信息，key设计为 “固定前缀+商铺id”的形式。

```java
@Override
public Result queryShopById(Long id) {
    //1、从redis中根据id查询商铺
    String key = CACHE_SHOP_KEY + id;
    String cachedShop = stringRedisTemplate.opsForValue().get(key);
    //2、判断是否存在记录
    if (StrUtil.isNotBlank(cachedShop)) {
        //3、存在，返回数据     
        Shop shop = JSONUtil.toBean(cachedShop, Shop.class);
        return Result.ok(shop);
    }
    //4、不存在，查询数据库
    Shop shop = getById(id);
    //5、数据库是存在记录
    if (shop == null) {
        //6、不存在，返回错误信息
        return Result.fail("店铺不存在");
    }
    //7、存在，保存数据到redis，返回数据
    stringRedisTemplate.opsForValue().set(key,JSONUtil.toJsonStr(shop));
    return Result.ok(shop);
}
```

练习：给店铺类型查询业务添加缓存

![image-20241212111434376](https://gitee.com/cmyk359/img/raw/master/img/image-20241212111434376-2024-12-1211:14:36.png)

此处将店铺类型数据使用List类型存储到Redis中，key设计为 `shop:type`

```java
private final StringRedisTemplate stringRedisTemplate;
@Override
public Result queryTypeList() {
    //1、从Redis中查询商铺类型
    List<String> shopType = stringRedisTemplate
        .opsForList()
        .range(SHOP_TYPE, 0, -1);
    //2、是否存在记录
    if (CollectionUtil.isNotEmpty(shopType)) {
        //3、存在，返回数据
        List<ShopType> collect = shopType
                .stream()
                .map(str -> JSONUtil.toBean(str,ShopType.class))
                .collect(Collectors.toList());
        return Result.ok(collect);
    }
    //4、不存在，从数据库中查询
    List<ShopType> typeList = query().orderByAsc("sort").list();
    //5、添加结果到Redis，返回数据
    //List中的是String类型，进行类型转化
    List<String> shopTypeStr = typeList.stream()
        .map(shopType1 -> JSONUtil.toJsonStr(shopType1))
        .collect(Collectors.toList());
    stringRedisTemplate.opsForList().rightPushAll(SHOP_TYPE,shopTypeStr);
    return Result.ok(typeList);
}
```



### 2.3、缓存更新策略

**缓存更新策略**主要有三种更新策略：**内存淘汰**、**超时剔除**和**主动更新**

![image-20241212140122680](https://gitee.com/cmyk359/img/raw/master/img/image-20241212140122680-2024-12-1214:01:25.png)

可以根据业务场景选择更新策略：

- 低一致性需求：使用内存淘汰机制。如店铺类型的查询缓存
- 高一致性需求：主动更新，并以超时剔除为兜底方案。如店铺详情查询的缓存。



**主动更新策略**主要有三种：`Cache Aside`模式、`Read/Write Through`模式、`Write Behind Cahing`模式。

- Cache Aside：由缓存调用者，在更新数据库的同时更新缓存。（代码复杂，但可人为控制）
- Read/Write Through：缓存与数据库整合为一个服务，由服务来维护一致性。调用者调用该服务，无需关心缓存一致性问题。（维护服务复杂，无现成服务）
- Write Behind Caching：调用者只操作缓存，由其它线程异步的将缓存数据持久化到数据库，保证**最终一致**。（维护异步任务复杂，在异步进程修改数据库前，难以保证一致性若，服务器宕机，内存中的Redis数据将丢失 ）

综合考虑，在企业中使用最多的策略是：**Cache Aside**。由调用者自己更新缓存需要解决几个问题：

1. 删除缓存还是更新缓存？

   - 更新缓存：每次更新数据库都要更新缓存，无效的写操作多。
   - <u>删除缓存</u>：更新数据库时让缓存失效，查询时再更新缓存。

2. 如何保证缓存与数据库的操作的同时成功或失败？

   - 单体系统：将缓存和数据库操作放在一个事务中。
   - 分布式系统：利用TCC等分布式事务方案（如：使用MQ通知其他服务进行数据同步）。

3. 先操作缓存还是先操作数据库（线程安全问题）？

   先删除缓存，再操作数据库。在多线程下可能会出现如下情况，线程1删完缓存，准备更新数据库，此时线程2查询缓存，缓存未命中，查询数据库，并将查询结果写回缓存。**由于数据库的写操作耗时较长**，线程2从数据库中查询到的还是原来的旧数据的数据，写入缓存的也是旧数据。最终结果是数据库中的是新数据，而缓存中的是旧数据，造成数据的不一致。并且写数据库的耗时较长，**很可能发生**如下情况。

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241212142243185-2024-12-1214:22:52.png" alt="image-20241212142243185" style="zoom:67%;" />

   <u>先操作数据库，再删除缓存</u>。此时可能出现线程安全的情况如下：在线程1查询缓存，若命中则返回数据，此时未命中，需要查询数据库，将数据 v = 10 写入缓存。线程2**在线程1查询完数据库，将数据写入缓存期间**到来，更新数据库 v = 20，再删除缓存（此时缓存啥也没有）,之后线程1才完成向缓存中写入查询结果 v = 10。此时数据库中的最新数据为v=20，但缓存中为v = 10，发生数据不一致。但是写入Redis缓存的用时很短，不太可能在此期间完成更新数据库和删除缓存的可能，发生数据不一致的可能很小。

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241212143501915-2024-12-1214:35:03.png" alt="image-20241212143501915" style="zoom:67%;" />



综上可得缓存更新策略的最佳实践方案

1、低一致性需求：使用Redis自带的内存淘汰机制

2、高一致性需求：主动更新（Cache Aside），并以超时剔除作为兜底方案

- 读操作：

  - 缓存命中则直接返回

  - 缓存未命中则查询数据库，并写入缓存，设定超时时间

- 写操作：

  - 先写数据库，然后再删除缓存
  - 要确保数据库与缓存操作的原子性



作业：给查询商铺的缓存添加超时剔除和主动更新的策略

MySQL查询到的数据写入Reids时添加过期时间

```java
//7、保存数据到redis，返回数据
stringRedisTemplate.opsForValue().set(key,JSONUtil.toJsonStr(shop));
//设置店铺数据过期时间 CACHE_SHOP_TTL = 30L
stringRedisTemplate.expire(key,CACHE_SHOP_TTL, TimeUnit.MINUTES); 
```

在更新商铺信息时，先操作数据库再删除缓存，同时将这两个操作放在一个事务中执行。

```java
@Transactional
public Result updateShop(Shop shop) {
    //1、验证数据有效性
    if (shop.getId() == null)
        return Result.fail("店铺ID不能为空");
    //2、更新数据库
    updateById(shop);
    //3、删除店铺缓存
    String key = CACHE_SHOP_KEY + shop.getId();
    stringRedisTemplate.delete(key);
    return Result.ok();
}
```



### 2.4、缓存穿透

**缓存穿透**：指客户端请求的数据在缓存中和数据库中都不存在，这样缓存永远不会生效，这些请求都会打到数据库。

常见解决方案：

1. 缓存空值

   当我们发现请求的数据即不存在于缓存，也不存于与数据库时，**将空值缓存到Redis，并设置过期时间，**避免频繁查询数据库。

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240827092524186-2024-8-2709:25:33.png" alt="image-20240827092524186" style="zoom:80%;" />

   优点：

   • 实现简单，维护⽅便

   缺点：

   • 额外的内存消耗，可能发生不一致问题（在TTL内真的有对应数据存入数据库中）

   

2. 布隆过滤器

   布隆过滤是⼀种数据统计的算法，**⽤于检索⼀个元素是否存在⼀个集合中**。

   布隆过滤器基于**bitmap**实现（⼀个很⻓的bit数组），默认数组中每⼀位都是0。

   ![image-20240827092937090](https://gitee.com/cmyk359/img/raw/master/img/image-20240827092937090-2024-8-2709:29:37.png)

   然后还需要 **K 个 hash 函数**，将元素基于这些hash函数做运算的结果映射到bit数组的不同位置，并将这些位置置为1。

   ![image-20240827093001045](https://gitee.com/cmyk359/img/raw/master/img/image-20240827093001045-2024-8-2709:30:01.png)

此时，我们要判断元素是否存在，只需要再次基于 K 个 hash 函数做运算， 得到 K 个⻆标，判断每

个⻆标的位置是不是1。由于存在**hash碰撞**的可能性，这就会出现某个元素计算出的⻆标已经被其

元素置为1的情况。那么这个元素也会被误判为已经存在。<u>当 bit 数组越大、 Hash 函数 K 越复</u>

<u>杂， K越大时，这个误判的概率也就越低。</u>

因此，**布隆过滤器的判断存在误差**：

- 当布隆过滤器认为元素不存在时，它**肯定不存在**
-  当布隆过滤器认为元素存在时，它**可能存在，也可能不存在**

在缓存预热时，把数据库中的数据利用布隆过滤器标记出来，当用户发起请求时，先基于布隆过滤器判断。如果不存在则直接拒绝请求，如果存在则去查询缓存和数据库。尽管布隆过滤存在误差，但⼀般都在0.01%左右，可以⼤⼤减少数据库压⼒。



其他解决方案：

- 增加参数的复杂度，设置为一定的复杂格式，进而对参数格式进行校验，拒绝非法参数
- 对热点参数进行限流
- 加强用户权限校验



练习：解决商铺查询的缓存穿透问题。

采用缓存空值并添加过期时间的方式解决缓存穿透问题。原来查询到不存在的数据时，返回404。此时应修改为添加空值到redis，并且Redis中保存了空值，在下一次查询时需要判断获得的是否是空值。不是空值，则返回数据给前端；是空值，返回错误信息。具体流程如下

![image-20241212154600399](https://gitee.com/cmyk359/img/raw/master/img/image-20241212154600399-2024-12-1215:46:02.png)

```java
public Result queryShopById(Long id) {
    //1、从redis中根据id查询商铺
    String key = CACHE_SHOP_KEY + id;
    String cachedShop = stringRedisTemplate.opsForValue().get(key);
    //2、判断是否存在记录
    if (StrUtil.isNotBlank(cachedShop)) { //isNotBlank有值时返回true，为空值或null时返回false
        //存在，返回数据
        Shop shop = JSONUtil.toBean(cachedShop, Shop.class);
        return Result.ok(shop);
    }
    //3、判断记录是否为空值************************
    if (cachedShop != null) {
        return Result.fail("店铺不存在");
    }
    //4、查询数据库
    Shop shop = getById(id);
    //5、数据库是否存在记录
    if (shop == null) {
        //6、不存在，将空值写入redis,并设置过期时间************************
       stringRedisTemplate.opsForValue().set(key,"",CACHE_NULL_TTL,TimeUnit.MINUTES);
        return Result.fail("店铺不存在");
    }
    //7、存在，保存数据到redis，返回数据
    stringRedisTemplate.opsForValue().set(key,JSONUtil.toJsonStr(shop));
    //设置店铺数据过期时间
    stringRedisTemplate.expire(key,CACHE_SHOP_TTL, TimeUnit.MINUTES);
    return Result.ok(shop);
}
```





### 2.5、缓存雪崩

**缓存雪崩**是指在同⼀时段**⼤量的缓存key同时失效**或者**Redis服务宕机**，导致⼤量请求到达数据库，带来巨⼤压⼒。与缓存击穿的区别：雪崩是很多key，击穿是某一个key缓存。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240827110108636-2024-8-2711:01:29.png" alt="image-20240827110108636" style="zoom:80%;" />

常⻅的解决⽅案有：

• 由于设置缓存时采用了相同的过期时间，导致缓存在某一时刻同时失效。因此给不同的Key在**原本TTL的基础上添加随机值**，这样KEY的过期时间不同，不会⼤量KEY同时过期

• 利⽤Redis集群提⾼服务的可⽤性，避免缓存服务宕机

• 给缓存业务添加降级限流策略（服务降级、快速失败等）

• 给业务添加多级缓存，⽐如先查询本地缓存，本地缓存未命中再查询Redis，Redis未命中再查询数

​	据库。



### 2.6、缓存击穿

**缓存击穿问题**也叫**热点Key问题**，就是⼀个被**⾼并发访问**并且**缓存重建业务较复杂**的key突然失效

了，⽆数的请求访问会在瞬间给数据库带来巨⼤的冲击。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241212162120403-2024-12-1216:21:57.png" alt="image-20241212162120403" style="zoom: 80%;" />

解决方案：

- 互斥锁：给重建缓存逻辑加锁，避免多线程同时进行

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240827094838259-2024-8-2709:48:46.png" alt="image-20240827094838259" style="zoom:80%;" />

当线程1发现缓存过期并尝试重建缓存时，首先获取互斥锁，再查询数据库并写入缓存，之后释放锁。在重建过程中，有其他线程也发现缓存过期并尝试重建时，会获取互斥锁失败，休眠一会再尝试查询缓存和获取锁的操作，直到查询到新的缓存数据时直接返回。



• 逻辑过期：热点key不要设置过期时间，通过逻辑过期字段标识是否过期。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20240827095123684-2024-8-2709:51:46.png" alt="image-20240827095123684" style="zoom:80%;" />

当一个线程发现缓存已经过期时，获取互斥锁进行缓存重建，与前一种方案不同的时，缓存重建时会创建新的线程去完成，重建完成后释放互斥锁，自己直接返回过期数据。在重建缓存过程中，有新线程发现缓存过期并尝试重建时，会获取锁失败，此时直接返回过期数据。



**对比：互斥锁能够保证数据的强一致性，但由于锁的存在会降低并发性能；逻辑过期的方式优先保障高可用，性能好，但存在数据不一致情况。**根据项目的实际需要选择合适的解决方案

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241212162302115-2024-12-1216:23:03.png" alt="image-20241212162302115" style="zoom:80%;" />



#### 利用互斥锁解决店铺详情查询的缓存击穿问题

整体思路：相较于原来从缓存中查询不到数据后直接查询数据库而言，现在的方案是 ：

进行查询之后，如果从缓存没有查询到数据，则进行互斥锁的获取

1. 若获取成功，则**再次检测redis缓存是否存在**，做DoubleCheck，如果存在则无需重建缓存，如果不存在则查询数据库重建缓存。

   > i. 对于第一次获取就得到互斥锁的线程而言，再次检测redis缓存，结果还是不存在，然后重建缓存。
   >
   > ii. 对于上次获得锁失败的线程而言，本次获取锁成功，说明已经有线程完成缓存重建，再次查询缓存即可获得数据，不用再执行重建缓存操作。

2. 若没有获取到互斥锁，则自旋等待一段时间后再次尝试获取锁，获取成功则回到 1.

![image-20241212230730969](https://gitee.com/cmyk359/img/raw/master/img/image-20241212230730969-2024-12-1223:08:02.png)

互斥锁的实现思路：

核心思想是利用redis的**setnx**方法来表示获取锁，该方法执行时，若没有指定的key则添加，并返回1（在stringRedisTemplate中返回true），若存在该key，则添加失败返回0（在stringRedisTemplate返回false），可以通过true，或者是false，来表示是否有线程成功插入key，成功插入的key的线程认为它就是获得到锁的线程。

```java
public Result queryShopById(Long id) {
    //互斥锁解决缓存击穿
    Shop shop = queryWithMutex(id);
    if (shop == null) {
        return Result.fail("店铺不存在");
    }
    return Result.ok(shop);
}

/**
 * 获取互斥锁，利用 setnx设置互斥锁，并设置锁的过期时间
 * @param key
 * @return
 */
public boolean tryLock(String key) {
    Boolean isLock = stringRedisTemplate.opsForValue()
        .setIfAbsent(key, "1", 10, TimeUnit.SECONDS);
    return BooleanUtil.isTrue(isLock);
}
/**
 * 释放互斥锁
 * @param key
 */
public void unlock(String key) {
    stringRedisTemplate.delete(key);
}



/**
 * 互斥锁解决缓存击穿问题 (在解决了缓存穿透的基础上)
 * @param id
 * @return
 */
public Shop queryWithMutex(Long id) {
    //1、从redis中根据id查询商铺
    String key = CACHE_SHOP_KEY + id;
    String cachedShop = stringRedisTemplate.opsForValue().get(key);
    //2、判断是否存在记录
    /*
    StrUtil.isNotBlank
        形参为null false
        形参为"" false
        形参为"\t\n" false
        形参为"abc" true
    */
    if (StrUtil.isNotBlank(cachedShop)) {
        //存在，返回数据
        Shop shop = JSONUtil.toBean(cachedShop, Shop.class);
        return shop;
    }
    //3、判断记录是否为空值
    if (cachedShop != null) {
        return null;
    }
    //4、redis 查询结果为null缓存失效，尝试重建缓存
    String lockKey = "lock:shop:" + id;
    Shop shop = null;
    try {
        //自旋等待，尝试获取互斥锁
        while( !tryLock(lockKey)) {
            Thread.sleep(50);
        }
        //4.2、获取锁成功,再次查询缓存
        String dcShop = stringRedisTemplate.opsForValue().get(key);
        //缓存有效，直接返回
        if (StrUtil.isNotBlank(dcShop)) {
            //存在，返回数据
            return JSONUtil.toBean(cachedShop, Shop.class);
        }
        //4.3、缓存无效，查询数据库重建缓存
        //模拟缓存重建延时
        Thread.sleep(200);
        
        shop = getById(id);
        //数据库是否存在记录
        if (shop == null) {
            //不存在，将空值写入redis
            stringRedisTemplate.opsForValue()
                .set(key,"",CACHE_NULL_TTL,TimeUnit.MINUTES);
            return null;
        }
        //存在，保存数据到redis，返回数据
        stringRedisTemplate.opsForValue().set(key,JSONUtil.toJsonStr(shop));
        //设置店铺数据过期时间
        stringRedisTemplate.expire(key,CACHE_SHOP_TTL, TimeUnit.MINUTES);
    } catch (InterruptedException e) {
        throw new RuntimeException(e);
    } finally {
        //5、释放锁
        unlock(lockKey);
    }
    //返回数据
    return shop;
}

```



#### 基于逻辑过期方式解决店铺详情查询的缓存击穿问题

![image-20241212231031526](https://gitee.com/cmyk359/img/raw/master/img/image-20241212231031526-2024-12-1223:11:02.png)

对于热点key会提前添加到Redis缓存，不设置过期时间，而是设置逻辑过期时间，再次进行查询缓存时，一定会命中的。若未命中，则说明不是热点key，直接返回空值即可。

整体思路：用户开始查询商铺，查询Redis判断是否命中，未命中直接返回空值即可。若命中，再通过逻辑过期时间判断数据是否过期，若未过期，直接返回Redis中的数据；若过期，则尝试获取互斥锁进行缓存重建。

- 若互斥锁获取成功，再次检查Redis中的数据是否过期，做DoubleCheck。若未过期（已经有人重建完成），返回本次查询到的商铺数据；若仍过期（还没有人重建缓存），开启独立线程查询数据库进行缓存重建，自己返回过期数据。

  > 获取锁成功后是需要进行二次检查的，避免重复重建。如线程B来访问，得到的是过期数据，此时线程A完成缓存重建释放了锁，线程B就会获得锁成功，会再次进行重建。

- 若获取互斥锁失败，返回过期数据即可。



现在redis中存储的数据的value需要带上过期时间，故重建一个实体类，避免对原来代码的修改

```java
@Data
public class RedisData {
    private LocalDateTime expireTime;
    private Object data;
}
```



```java
//创建拥有十个线程的线程池，用来重建缓存，避免经常创建销毁线程
private final ExecutorService CACHE_REBUILD_EXECUTOR = Executors.newFixedThreadPool(10);

public Result queryShopById(Long id) {
    //逻辑过期解决缓存击穿
    Shop shop = queryWithLogicalExpire(id);
    
    if (shop == null) {
        return Result.fail("店铺不存在");
    }
    return Result.ok(shop);
}

/**
 * 进行缓存重建：将原始店铺信息封装上过期时间，存储到Redis中
 * @param id
 * @param expireSeconds
 * @throws InterruptedException
 */
public void saveShop2Redis(Long id, Long expireSeconds) throws InterruptedException {
    //模拟缓存重建延时
    Thread.sleep(200);
    //1、获取店铺信息
    Shop shop = getById(id);
    //2、封装逻辑过期时间
    RedisData redisData = new RedisData();
    redisData.setData(shop);
    redisData.setExpireTime(LocalDateTime.now().plusSeconds(expireSeconds));
    //3、存入redis
    String key = CACHE_SHOP_KEY + id;
    stringRedisTemplate.opsForValue().set(key,JSONUtil.toJsonStr(redisData));
}


/**
 * 获取互斥锁，利用 setnx设置互斥锁，并设置锁的过期时间
 * @param key
 * @return
 */
public boolean tryLock(String key) {
    Boolean isLock = stringRedisTemplate.opsForValue().setIfAbsent(key, "1", 10, TimeUnit.SECONDS);
    return BooleanUtil.isTrue(isLock);
}
/**
 * 释放互斥锁
 * @param key
 */
public void unlock(String key) {
    stringRedisTemplate.delete(key);
}

/**
 * 利用逻辑过期解决缓存击穿
 * @param id
 * @return
 */
public Shop queryWithLogicalExpire(Long id) {
    //1、从redis中根据id查询商铺
    String key = CACHE_SHOP_KEY + id;
    String cacheDataJSON = stringRedisTemplate.opsForValue().get(key);
    //2、缓存未命中，返回空数据
    if (StrUtil.isBlank(cacheDataJSON)) {
        return null;
    }
    //3、缓存命中
    RedisData cacheData = JSONUtil.toBean(cacheDataJSON, RedisData.class);
    LocalDateTime expireTime = cacheData.getExpireTime();
    //从RedisData中获取的Data，不是Shop类型，需要进行转化
    JSONObject data = (JSONObject) cacheData.getData();
    Shop shop = JSONUtil.toBean(data, Shop.class);
    //3.1、判断缓存是否过期
    if (expireTime.isAfter(LocalDateTime.now())) {
        //3.2、缓存未过期，直接返回数据
        return shop;
    }
    //4、缓存过期，需要进行缓存重建
    //4.1、尝试获取互斥锁
    String lockKey = LOCK_SHOP_KEY + id;
    boolean isLock = tryLock(lockKey);
    //4.2、互斥锁获取成功
    if (isLock) {
        //4.3、再次检测redis缓存是否过期，做DoubleCheck
        String doubleCheckCacheStr = stringRedisTemplate.opsForValue().get(key);
        RedisData redisData = JSONUtil.toBean(doubleCheckCacheStr, RedisData.class);
        LocalDateTime newExpireTime = redisData.getExpireTime();
        Shop newShop = JSONUtil.toBean((JSONObject) redisData.getData(), Shop.class);
        //4.3、缓存未过期（已经有线程重建完成了），则返回数据
        if (newExpireTime.isAfter(LocalDateTime.now())) {
            return newShop;
        }
        //4.4 缓存仍过期 （还没有其他的线程重建缓存），创建独立线程，重建缓存
        //将重建工作交给线程池完成
        CACHE_REBUILD_EXECUTOR.submit(()->{
            try {
                //查询数据库，重建缓存
                saveShop2Redis(id,20L);
            } catch (Exception e) {
                throw new RuntimeException(e);
            } finally {
                //4.5释放锁
                unlock(lockKey);
            }
        });
    }
    //5、返回过期的商铺信息
    return shop;
}
```





### 2.7、缓存工具封装

基于StringRedisTemplate封装一个缓存工具类，满足下列需求：

* 方法1：将任意Java对象序列化为json并存储在string类型的key中，并且可以设置TTL过期时间
* 方法2：将任意Java对象序列化为json并存储在string类型的key中，并且可以设置逻辑过期时间，用于处理缓

存击穿问题

* 方法3：根据指定的key查询缓存，并反序列化为指定类型，利用缓存空值的方式解决缓存穿透问题
* 方法4：根据指定的key查询缓存，并反序列化为指定类型，需要利用逻辑过期解决缓存击穿问题

- 方法5：根据指定的key查询缓存，并反序列化为指定类型，需要利用互斥锁解决缓存击穿问题



```java
package com.hmdp.utils;

import cn.hutool.core.util.BooleanUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;


/**
 * @ClassName CacheClient
 * @Description  缓存工具类
 * @Author 猫爪在上
 * @Date 2024/12/12 23:40
 * @Version 1.0
 */
@Component
public class CacheClient {

    //存入Reids中的空值的过期时间
    public static final Long CACHE_NULL_TTL = 2L;
    //存入Reids中的空值的过期时间的时间类型
    public static final TimeUnit CACHE_NULL_TIME_UNIT = TimeUnit.MINUTES;
    //互斥锁对应的key
    public static final String LOCK_KEY = "lock:";
    //获取互斥锁失败后的等待时间（单位毫秒）
    public static final Long SPIN_WAIT_MILLISECOND = 50L;

    //使用构造函数注入StringRedisTemplate
    private final StringRedisTemplate stringRedisTemplate;

    public CacheClient(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }
    //创建拥有十个线程的线程池，用来重建缓存，避免经常创建销毁线程
    private final ExecutorService CACHE_REBUILD_EXECUTOR = Executors.newFixedThreadPool(10);

    /**
     * 将任意Java对象序列化为json并存储在string类型的key中，并且可以设置TTL过期时间
     * @param key String类型的Key
     * @param value 任意类型的对象
     * @param time 过期时间
     * @param timeUnit  时间单位
     */
    public void set(String key, Object value, Long time, TimeUnit timeUnit) {
        stringRedisTemplate.opsForValue().set(key, JSONUtil.toJsonStr(value),time,timeUnit);
    }

    /**
     * 将任意Java对象序列化为json并存储在string类型的key中，并且可以设置逻辑过期时间，用于处理缓存击穿问题
     * @param key   String类型的Key
     * @param value 任意类型的对象
     * @param time 逻辑过期时间
     * @param timeUnit 时间单位
     */
    public void setWithLogicalExpire(String key, Object value, Long time, TimeUnit timeUnit) {
        //设置逻辑过期时间
        RedisData redisData = new RedisData();
        redisData.setData(value);
        redisData.setExpireTime(LocalDateTime.now().plusSeconds(timeUnit.toSeconds(time)));
        //写入Redis
        stringRedisTemplate.opsForValue().set(key,JSONUtil.toJsonStr(redisData));
    }

    /**
     * 据指定的key查询缓存，并反序列化为指定类型，利用缓存空值的方式解决缓存穿透问题
     *
     * @param keyPrefix key的前缀
     * @param id  id
     * @param type  需要返回的对象的Class类型
     * @param dbFallback  根据id进行数据库查询的函数
     * @param time  过期时间
     * @param timeUnit 时间单位
     * @param <R> 需要返回的对象类型的泛型
     * @param <ID> id的泛型
     * @return
     */
    public <R,ID> R queryWithPassThrough(String keyPrefix,
                                         ID id,
                                         Class<R> type,
                                         Function<ID,R> dbFallback,
                                         Long time,
                                         TimeUnit timeUnit) {
        //1、从redis中根据id查询商铺
        String key = keyPrefix + id;
        String json = stringRedisTemplate.opsForValue().get(key);
        //2、判断是否存在记录
        if (StrUtil.isNotBlank(json)) {
            //存在，返回数据
            R r = JSONUtil.toBean(json, type);
            return r;
        }

        //3、判断记录是否为空值
        if (json != null) {
            return null;
        }

        //4、查询数据库
        R r = dbFallback.apply(id);
        //5、数据库是否存在记录
        if (r == null) {
            //6、不存在，将空值写入redis
            stringRedisTemplate.opsForValue().set(key,"",CACHE_NULL_TTL,CACHE_NULL_TIME_UNIT);
            return null;
        }
        //7、存在，保存数据到redis，返回数据
        this.set(key,r,time,timeUnit);
        return r;
    }


    /**
     * 根据指定的key查询缓存，并反序列化为指定类型，需要利用逻辑过期解决缓存击穿问题
     * @param keyPrefix key的前缀
     * @param id    id
     * @param type  需要返回对象的Class类型
     * @param dbFallback  根据id查询数据库
     * @param time  逻辑过期时间
     * @param timeUnit    时间单位
     * @param <R> 需要返回的对象类型的泛型
     * @param <ID> id的泛型
     * @return
     */
    public <R,ID> R queryWithLogicalExpire(String keyPrefix,
                                           ID id,
                                           Class<R> type,
                                           Function<ID,R> dbFallback,
                                           Long time,
                                           TimeUnit timeUnit) {
        //1、从redis中根据id查询商铺
        String key = keyPrefix + id;
        String json = stringRedisTemplate.opsForValue().get(key);
        //2、缓存未命中，返回空数据
        if (StrUtil.isBlank(json)) {
            return null;
        }
        //3、缓存命中
        RedisData cacheData = JSONUtil.toBean(json, RedisData.class);
        LocalDateTime expireTime = cacheData.getExpireTime();
        R r = JSONUtil.toBean((JSONObject) cacheData.getData(), type);

        //3.1、判断缓存是否过期
        if (expireTime.isAfter(LocalDateTime.now())) {
            //3.2、缓存未过期，直接返回数据
            return r;
        }

        //4、缓存过期，需要进行缓存重建
        //4.1、尝试获取互斥锁
        String lockKey = LOCK_KEY + id;
        boolean isLock = tryLock(lockKey);
        //4.2、互斥锁获取成功
        if (isLock) {
            //4.3、再次检测redis缓存是否过期，做DoubleCheck
            String doubleCheckCacheStr = stringRedisTemplate.opsForValue().get(key);
            RedisData redisData = JSONUtil.toBean(doubleCheckCacheStr, RedisData.class);
            LocalDateTime newExpireTime = redisData.getExpireTime();
            R newR = JSONUtil.toBean((JSONObject) redisData.getData(), type);
            //4.3、缓存未过期（已经有线程重建完成了），则返回数据
            if (newExpireTime.isAfter(LocalDateTime.now())) {
                return newR;
            }
            //4.4 缓存仍过期 （还没有其他的线程重建缓存），创建独立线程，重建缓存
            //将重建工作交给线程池完成
            CACHE_REBUILD_EXECUTOR.submit(()->{
                try {
                    //查询数据库
                    R dbR = dbFallback.apply(id);
                    //重建缓存
                    this.setWithLogicalExpire(key,dbR,time,timeUnit);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                } finally {
                    //4.5释放锁
                    unlock(lockKey);
                }
            });
        }
        //5、返回过期的商铺信息
        return r;
    }

    /**
     * 根据指定的key查询缓存，并反序列化为指定类型，利用互斥锁解决缓存击穿问题
     * @param keyPrefix key的前缀
     * @param id    id
     * @param type  需要返回对象的Class类型
     * @param dbFallback  根据id查询数据库
     * @param time  过期时间
     * @param timeUnit    时间单位
     * @param <R> 需要返回的对象类型的泛型
     * @param <ID> id的泛型
     * @return
     */
    public <R,ID> R queryWithMutex(String keyPrefix,
                                   ID id,
                                   Class<R> type,
                                   Function<ID,R> dbFallback,
                                   Long time,
                                   TimeUnit timeUnit) {
        //1、从redis中根据id查询商铺
        String key = keyPrefix + id;
        String json = stringRedisTemplate.opsForValue().get(key);
        //2、判断是否存在记录
        if (StrUtil.isNotBlank(json)) {
            //存在，返回数据
            R r = JSONUtil.toBean(json, type);
            return r;
        }

        //3、判断记录是否为空值
        if (json != null) {
            return null;
        }

        //4、redis 查询结果为null缓存失效，尝试重建缓存
        String lockKey = LOCK_KEY + id;
        R dbR = null;
        try {
            //自旋等待，尝试获取互斥锁
            while( !tryLock(lockKey)) {
                Thread.sleep(SPIN_WAIT_MILLISECOND);
            }

            //4.2、获取锁成功,再次查询缓存
            String newJson = stringRedisTemplate.opsForValue().get(key);
            //缓存有效，直接返回
            if (StrUtil.isNotBlank(newJson)) {
                //存在，返回数据
                return JSONUtil.toBean(newJson, type);
            }

            //4.3、缓存无效，查询数据库重建缓存
            dbR = dbFallback.apply(id);
            //数据库是否存在记录
            if (dbR == null) {
                //不存在，将空值写入redis
                stringRedisTemplate.opsForValue().set(key,"",CACHE_NULL_TTL,CACHE_NULL_TIME_UNIT);
                return null;
            }
            //存在，保存数据到redis，返回数据
            this.set(key,dbR,time,timeUnit);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } finally {
            //5、释放锁
            unlock(lockKey);
        }
        //返回数据
        return dbR;
    }

    /**
     * 获取互斥锁，利用 setnx设置互斥锁，并设置锁的过期时间
     * @param key
     * @return
     */
    public boolean tryLock(String key) {
        Boolean isLock = stringRedisTemplate.opsForValue().setIfAbsent(key, "1", 10, TimeUnit.SECONDS);
        return BooleanUtil.isTrue(isLock);
    }

    /**
     * 释放互斥锁
     * @param key
     */
    public void unlock(String key) {
        stringRedisTemplate.delete(key);
    }
}
```



使用工具类优化解决之前店铺详情查询的缓存击穿和缓存穿透问题的代码

```java
public Result queryShopById(Long id) {
        //通过缓存空值，缓存穿透
//        Shop shop = cacheClient.queryWithPassThrough(CACHE_SHOP_KEY,
//                id, Shop.class,  this::getById, CACHE_SHOP_TTL,TimeUnit.MINUTES);

        //互斥锁解决缓存击穿
//        Shop shop = cacheClient.queryWithMutex(CACHE_SHOP_KEY,id,Shop.class,
//                this::getById,CACHE_SHOP_TTL,TimeUnit.MINUTES);

        //逻辑过期解决缓存击穿
        Shop shop = cacheClient.queryWithLogicalExpire(CACHE_SHOP_KEY,id,Shop.class,
                this::getById,10L,TimeUnit.SECONDS);

        if (shop == null) {
            return Result.fail("店铺不存在");
        }
        return Result.ok(shop);
    }
```

## 三、优惠券秒杀

> Redis的计数器、Lua脚本Redis、分布式锁、Redis的三种消息队列

### 3.1、全局唯一ID

对于使用MySQL数据库的ID自增存在的问题：

- ID规律太过明显，可能泄露数据

- 受单表数据量的限制，数量过大后需要进行分库分表，但分表后各自的ID会从1开始递增，会出现ID重复的情况，无法保证同类数据ID的唯一性。

  

全局ID生成器：是一种在分布式系统下用来生成全局唯一ID的工具，一般要满足一下特性：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241213144741306-2024-12-1314:48:03.png" alt="image-20241213144741306" style="zoom:67%;" />

综合分析，使用Redis 中**String类型**的数值自增，并且拼接一些其它信息保证ID的安全性，生成`long`类型的ID

ID的组成部分：

- 符号位：1bit，为0

- 时间戳：31bit，以秒为单位，可以使用69年

- 序列号：32bit，秒内的计数器，支持每秒产生2^32个不同ID

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241213145113498-2024-12-1314:51:14.png" alt="image-20241213145113498" style="zoom:80%;" />

对应的key设计为

代码实现：

```java
@Component
@RequiredArgsConstructor
public class RedisIdWorker {

    //开始时间戳(2017.9.1 00:00:00)
    private final long BEGIN_TIMESTAMP = 1504224000L;
    //序列号的位数
    private static final int COUNT_BITS = 32;

    private final StringRedisTemplate stringRedisTemplate;

    /**
     * 生成全局唯一ID
     * @param keyPrefix 相关业务的ID前缀
     * @return
     */
    public long nextId(String keyPrefix) {
        //1、生成时间戳
        LocalDateTime now = LocalDateTime.now();
        long nowSeconds = now.toEpochSecond(ZoneOffset.UTC);
        long timStamp = nowSeconds - BEGIN_TIMESTAMP;

        //2、生成序列号
        //2.1、获取当前日期，精确到天
        String date = now.format(DateTimeFormatter.ofPattern("yyyy:MM:dd"));
        //2.2、自增长
        //对不存在的key做自增长时，在执行前会将其值设置为0
        Long count = stringRedisTemplate
            .opsForValue()
            .increment("icr:" + keyPrefix + ":" + date);
        //3、拼接返回
        return timStamp << COUNT_BITS | count;
    }
}
```



测试：创建含有300个线程的线程池，每个线程使用Reids的id生成器生成100个id，统计用时。

```java
@SpringBootTest
class HmDianPingApplicationTests {

    @Resource
    private RedisIdWorker idWorker;

    private ExecutorService es = Executors.newFixedThreadPool(300);

    @Test
    void testIdWorker() throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(300);

        Runnable task = () -> {
            for (int i = 0; i < 100; i++) {
                long id = idWorker.nextId("order");
                System.out.println("id = " + id);
            }
            latch.countDown();
        };
        
        long begin = System.currentTimeMillis();
        for (int i = 0; i < 300; i++) {
            es.submit(task);
        }
        latch.await();
        long end = System.currentTimeMillis();
        System.out.println("time = " + (end - begin));
    }
}

```



![image-20241215101723975](https://gitee.com/cmyk359/img/raw/master/img/image-20241215101723975-2024-12-1510:17:38.png)

> 补充：关于countdownlatch
>
> `CountDownLatch` 是 Java 并发包 `java.util.concurrent` 中的一个同步辅助类，**它允许一个或多个线程等待一系列指定操作的完成。**`CountDownLatch` 通过一个计数器来实现，计数器的初始值表示需要等待的操作数量。每当一个操作完成时，计数器的值就会减一；当计数器的值达到零时，所有等待的线程都会被释放，继续执行。
>
> `CountDownLatch` 的关键方法和构造函数
>
> - ‌**构造函数**‌：`CountDownLatch(int count)`，其中 `count` 是计数器的初始值。
> - ‌**主要方法**‌
>   - `void countDown()`：将计数器的值减一。如果计数器的值到达零，则所有等待的线程都会被释放。
>   - `void await()`：使当前线程等待，直到计数器的值到达零。
>   - `boolean await(long timeout, TimeUnit unit)`：与 `await()` 类似，但可以指定等待的超时时间。如果在指定的时间内计数器的值没有到达零，则当前线程继续执行。
>   - `long getCount()`：返回当前计数器的值。
>
> `CountDownLatch` 的使用场景
>
> 1. ‌**等待多个线程完成某个操作**‌：主线程可以启动多个工作线程来并行处理任务，并使用 `CountDownLatch` 来等待所有工作线程完成。
> 2. ‌**协调多个线程的执行顺序**‌：在某些情况下，你可能希望一组线程等待另一个线程或一组线程完成某个操作后再继续执行。
>
> 
>
> 如果没有CountDownLatch ，那么由于程序是异步的，当异步程序没有执行完时，主线程就已经执行完了，然后我们期望的是分线程全部走完之后，主线程再走，所以我们此时需要使用到CountDownLatch。

### 3.2、实现优惠券秒杀下单

每个店铺都可以发布优惠券，分为平价券和特价券。平价券可以任意购买，而特价券需要秒杀抢购。

![image-20241215105950869](https://gitee.com/cmyk359/img/raw/master/img/image-20241215105950869-2024-12-1511:00:13.png)

相关表的信息：

tb_voucher：优惠券的基本信息，优惠金额、使用规则等
tb_seckill_voucher：优惠券的库存、开始抢购时间，结束抢购时间。

秒杀券属于优惠券，关联了优惠券的id。秒杀券除了具有优惠卷的基本信息以外，还具有库存，抢购时间，结束时间等等字段。新建秒杀券时，既要在优惠券表中添加记录并将type类型设置为1，并且要在秒杀券表中添加秒杀相关信息。

![image-20241215110440776](https://gitee.com/cmyk359/img/raw/master/img/image-20241215110440776-2024-12-1511:04:42.png)

#### 添加优惠券

**VoucherController**

```java
/**
*新增普通卷代码
*/
@PostMapping
public Result addVoucher(@RequestBody Voucher voucher) {
    voucherService.save(voucher);
    return Result.ok(voucher.getId());
}
/**
*新增秒杀券代码
*/
@PostMapping("seckill")
public Result addSeckillVoucher(@RequestBody Voucher voucher) {
    voucherService.addSeckillVoucher(voucher);
    return Result.ok(voucher.getId());
}
```

**VoucherServiceImpl**

```java
@Override
@Transactional
public void addSeckillVoucher(Voucher voucher) {
    // 保存优惠券
    save(voucher);
    // 保存秒杀信息
    SeckillVoucher seckillVoucher = new SeckillVoucher();
    seckillVoucher.setVoucherId(voucher.getId());
    seckillVoucher.setStock(voucher.getStock());
    seckillVoucher.setBeginTime(voucher.getBeginTime());
    seckillVoucher.setEndTime(voucher.getEndTime());
    seckillVoucherService.save(seckillVoucher);
    // 保存秒杀库存到Redis中
    stringRedisTemplate.opsForValue().set(SECKILL_STOCK_KEY + voucher.getId(), voucher.getStock().toString());
}
```



添加秒杀券后，可在店铺详情页看到

![image-20241215111327886](https://gitee.com/cmyk359/img/raw/master/img/image-20241215111327886-2024-12-1511:13:29.png)



#### 秒杀券下单

秒杀券下单时需要判断两点：

* 秒杀是否开始或结束，如果尚未开始或已经结束则无法下单
* 库存是否充足，不足则无法下单

具体流程如下：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241215153900724-2024-12-1515:39:02.png" alt="image-20241215153900724" style="zoom:80%;" />

```java
@Service
@RequiredArgsConstructor
public class VoucherOrderServiceImpl extends ServiceImpl<VoucherOrderMapper, VoucherOrder> implements IVoucherOrderService {

    private final SeckillVoucherServiceImpl seckillVoucherService;
    private final RedisIdWorker redisIdWorker;
    
    /**
     *  秒杀券下单
     * @param voucherId 秒杀券id
     * @return
     */
    @Override
    public Result seckillVoucher(Long voucherId) {
        //1、查询优惠券
        SeckillVoucher voucher = seckillVoucherService.getById(voucherId);

        //2、判断秒杀是否开始
        if (voucher.getBeginTime().isAfter(LocalDateTime.now())){
            return Result.fail("秒杀活动尚未开始");
        }

        //3、判断秒杀是否结束
        if (voucher.getEndTime().isBefore(LocalDateTime.now())) {
            return Result.fail("秒杀活动已经结束");
        }

        //4、判断库存是否充足
        Integer stock = voucher.getStock();
        if (stock < 1) {
            return Result.fail("库存不足！");
        }
        //5、扣减库存
        boolean isSuccess = seckillVoucherService.update()
                .setSql("stock = stock - 1")
                .eq("voucher_id", voucherId).update();
        if (!isSuccess) {
            return Result.fail("库存不足！");
        }
        
        //6、创建订单
        VoucherOrder voucherOrder = new VoucherOrder();
        //6.1、设置订单id，使用Reids的id生成器
        long orderId = redisIdWorker.nextId("voucherOrder");
        voucherOrder.setId(orderId);
        //6.2、设置优惠券id
        voucherOrder.setVoucherId(voucherId);
        //6.3、设置用户id
        long userId = UserHolder.getUser().getId();
        voucherOrder.setUserId(userId);
        save(voucherOrder);
        
        //7、返回订单id
        return Result.ok(orderId);
    }
}
```



### 3.3、超卖问题

#### 问题分析	

使用Jmeter模拟多用户购买的情况，在JMeter中设置200个线程，秒杀券库存设置为100，并发进行秒杀券购买。若正确执行，会有100个线程购买失败，库存减为0，共生成100条秒杀券订单。执行结果如下：

![Jmeter执行结果](https://gitee.com/cmyk359/img/raw/master/img/image-20241215161417918-2024-12-1516:14:37.png)

![优惠券订单表信息](https://gitee.com/cmyk359/img/raw/master/img/image-20241215161527843-2024-12-1516:15:37.png)

![秒杀券信息](https://gitee.com/cmyk359/img/raw/master/img/image-20241215161652806-2024-12-1516:17:37.png)

错误分析：

​	假设线程1过来查询库存，判断出来库存大于1，正准备去扣减库存，但是还没有来得及去扣减，此时线程2过来，线程2也去查询库存，发现这个数量一定也大于1，那么这两个线程都会去扣减库存，最终多个线程相当于一起去扣减库存，此时就会出现库存的超卖问题。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241215162417172-2024-12-1516:24:37.png" alt="多线程执行库存扣减出错情况" style="zoom:80%;" />

#### 乐观锁和悲观锁

超卖问题是典型的**多线程安全问题**，针对这一问题的常见解决方案就是加锁：（**悲观锁** or **乐观锁**）

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241215162704888-2024-12-1516:27:24.png" alt="悲观锁和乐观锁" style="zoom:80%;" />

乐观锁的关键是判断之前查询得到的数据是否有被修改过，常见的方式有两种：

1、版本号法

给数据添加一个版本`version`字段，当数据修改时version加一，基于`version`字段判断有没有被修改过。

![](https://gitee.com/cmyk359/img/raw/master/img/image-20241215164638341-2024-12-1516:46:39.png)

2、CAS法

用**数据本身是否发生变化**判断线程是否安全

![](https://gitee.com/cmyk359/img/raw/master/img/image-20241215165157862-2024-12-1516:51:58.png)



#### 使用乐观锁解决超卖问题

修改扣减库存操作，在执行update语句时添加判断，判断当前库存与之前查询出来的库存是否相等，若相等，则说明没有人在中间修改过库存，那么此时就是安全的。

```java
//5、扣减库存
boolean isSuccess = seckillVoucherService.update()
        .setSql("stock = stock - 1")
        .eq("voucher_id", voucherId)
        .eq("stock",voucher.getStock()) //where id = ? and stock = ?
        .update();
```

将秒杀券库存重置为100，使用JMeter创建200个线程并发进行秒杀。结果如下，200个线程只有24个完成下单操作，以上这种方式通过测试发现会有很多失败的情况，失败的原因在于：在使用乐观锁过程中，假设100个线程同时都拿到了100的库存，然后大家一起去进行扣减，但是100个人中只有1个人能扣减成功，其他的人在处理时，他们在扣减时，库存已经被修改过了，所以此时其他线程都会失败。

![image-20241215171210639](https://gitee.com/cmyk359/img/raw/master/img/image-20241215171210639-2024-12-1517:12:11.png)

乐观锁优化：执行update语句时，只需判断当前库存大于0即可。

```java
//5、扣减库存
boolean isSuccess = seckillVoucherService.update()
        .setSql("stock = stock - 1")
        .eq("voucher_id", voucherId)
        .gt("stock",0) //where id = ? and stock > 0
        .update();
```

再次使用JMeter进行测试，秒杀券库存成功减为零，优惠券订单新增100条

![image-20241215182459350](https://gitee.com/cmyk359/img/raw/master/img/image-20241215182459350-2024-12-1518:25:01.png)

#### LongAdder

针对CAS（Compare-And-Swap）操作中的自旋压力过大问题，`LongAdder` 是一个有效的解决方案。在高并发环境下，多个线程可能会频繁地尝试更新同一个原子变量，导致大量的CAS自旋重试，这会消耗大量的CPU资源并降低性能。

`LongAdder` 通过其内部的设计，将热点数据分散到多个槽（Cell）中，每个槽都可以独立地进行CAS操作。这样，不同线程在更新计数时，会尽量分布到不同的槽上，从而减少了CAS冲突和自旋重试的次数。这种设计使得`LongAdder` 在高并发场景下具有更好的性能表现。

具体来说，LongAdder的底层实现包括以下几个重要部分：

- ‌**base变量**‌：类似于AtomicLong中的全局value值，在没有竞争的情况下，数据直接累加到base上‌25。
- ‌**cells数组**‌：当检测到有线程竞争时，LongAdder会尝试将数据累加到cells数组中的某个元素上。cells数组中的每个元素都是一个Cell对象，Cell对象内部存储了一个long类型的值，并且这个值是通过CAS操作进行更新的。这样，不同线程在更新计数时，会尽量分布到不同的Cell上，从而实现了热点的分散。
- **分散热点的原理**‌：LongAdder通过线程id获取probe值，然后利用probe值与cells数组的长度进行位与操作，找到所属cells的位置。这样，不同线程会命中到数组的不同槽中，各个线程只对自己槽中的那个值进行CAS操作，从而降低了冲突概率‌

![image-20241215182944517](https://gitee.com/cmyk359/img/raw/master/img/image-20241215182944517-2024-12-1518:29:45.png)



### 3.4、一人一单

需求：修改秒杀业务，要求同一个优惠券，一个用户只能下一单

具体逻辑如下：首先查询优惠券，判断当前时间是否处于秒杀阶段，再进一步判断库存是否足够，然后再**根据优惠卷id和用户id查询是否已经下过这个订单**，如果下过这个订单，则不再下单，否则进行下单。

```java
//5、一人一单：根据当前用户id和优惠券id判断是否已经下过单
long userId = UserHolder.getUser().getId();
int count = query().eq("user_id", userId).eq("voucher_id", voucherId).count();
if (count > 0) {
    return Result.fail("用户已经购买过一次！");
}
//6、扣减库存
...
```

在JMeter多线程环境下测试，同样会出现线程安全的问题，多个线程第一次下单时，同时查询到当前不存在订单，然后各自去下单，还是会出现一个用户下了多个订单的情况。

![](https://gitee.com/cmyk359/img/raw/master/img/image-20241215205025455-2024-12-1520:50:27.png)



为了解决多线程安全问题，还是需要加锁，但是乐观锁比较适合更新数据，而现在是插入数据，所以我们需要使用**悲观锁**操作。

需要注意的问题：

#### 加锁的粒度

​	首先把从验证一人一单 到 添加优惠券订单的逻辑抽取到一个方法`createVoucherOrder`中，在这个方法中进行查询订单、扣减库存并完成订单添加。

```java
@Transactional
public synchronized Result createVoucherOrder(Long voucherId) {
    Long userId = UserHolder.getUser().getId();
    // 5.1.查询订单
    int count = query().eq("user_id", userId).eq("voucher_id", voucherId).count();
    // 5.2.判断是否存在
    if (count > 0) {
        // 用户已经购买过了
        return Result.fail("用户已经购买过一次！");
    }
    // 6.扣减库存
    boolean success = seckillVoucherService.update()
            .setSql("stock = stock - 1") // set stock = stock - 1
            .eq("voucher_id", voucherId).gt("stock", 0) // where id = ? and stock > 0
            .update();
    if (!success) {
        // 扣减失败
        return Result.fail("库存不足！");
    }
    // 7.创建订单
    VoucherOrder voucherOrder = new VoucherOrder();
    // 7.1.订单id
    long orderId = redisIdWorker.nextId("order");
    voucherOrder.setId(orderId);
    // 7.2.用户id
    voucherOrder.setUserId(userId);
    // 7.3.代金券id
    voucherOrder.setVoucherId(voucherId);
    save(voucherOrder);
    // 7.返回订单id
    return Result.ok(orderId);
}
```

如果在这个方法上加锁，在同一时刻只有一个线程可以执行该方法，每个线程对这个方法的访问变成了串行方式，性能降低。加锁的初衷是为了解决同一个用户的线程安全问题，而不同用户应该互不受影响。因此需要降低锁的粒度，同一个用户加一把锁，不同用户加不同的锁，故可以对**用户的id**加锁。

注意：`toString`方法底层是new一个String对象，即使是同一个用户的`userId`经过`toString`方法每次返回的都不是同一个对象，无法做到一个用户一把锁。因此需要使用String的`intern()`方法返回其在JVM常量池中的唯一实例，确保一个用户通过id获取到的是同一把锁。

```java
@Transactional
public  Result createVoucherOrder(Long voucherId) {
    Long userId = UserHolder.getUser().getId();
    synchronized(userId.toString().intern()){
        // 5.1.查询订单
      		...
        // 5.2.判断是否存在
			...
        // 6.扣减库存
			...
        // 7.创建订单
      		...
        // 7.返回订单id
        return Result.ok(orderId);
        
    } //同步代码块结束

} //方法执行完，事务才会提交
```





> 补充：`intern()`方法是`String`类的一个固有方法，其设计初衷是为了优化内存使用和提升字符串操作的效率。当你调用一个字符串的`intern()`方法时，Java会首先检查字符串常量池中是否已存在与该字符串内容相同的实例。如果存在，则返回该实例的引用；如果不存在，则将该字符串添加到常量池中，并返回这个新添加的字符串实例的引用。
>
> 字符串常量池是Java虚拟机（JVM）中的一个特殊存储区域，它专门用于存储已被`intern()`方法处理过的字符串实例。**这个机制确保了内容相同的字符串在JVM中只会有一个唯一的实例**，从而避免了不必要的内存浪费，并加快了字符串比较的速度，因为可以直接比较两个字符串的引用是否相同，而无需逐个字符地进行比对。
>
> 示例：`s1`是通过`new`关键字创建的字符串对象，它位于堆内存中，并未被加入到字符串常量池中。当我们调用`s1.intern()`时，JVM会检查常量池中是否已有"hello"字符串，发现没有后便将其加入，并返回该字符串的引用，这个引用被赋值给`s2`。而`s3`是直接通过字面量方式创建的字符串，它会自动被加入到字符串常量池中。因此，`s2`和`s3`实际上指向的是同一个字符串实例，所以`s2 == s3`的比较结果为`true`。而`s1`由于是通过`new`创建的，它指向的是堆内存中的一个新对象，与常量池中的对象不是同一个，所以`s1 == s2`的比较结果为`false`。
>
> ```java
> String s1 = new String("hello");
> String s2 = s1.intern();
> String s3 = "hello";
> 
> // 由于s2和s3都是通过intern()方法或从字面量直接得到的，它们会指向同一个字符串实例
> System.out.println(s2 == s3); // 输出结果为true
> 
> // 原始的s1对象并未被intern()方法处理，因此它与s2、s3不是同一个实例
> System.out.println(s1 == s2); // 输出结果为false
> 
> ```



#### 事务生效

当前方法被spring的事务控制，只有方法结束才会进行事务提交。在方法内部加锁，可能会导致当前方法事务还没有提交，但是锁已经释放的情况，此时同一个用户的其他线程再来下单时，会获取锁成功，可能导致重复下单。因此需要对整个方法的调用针对用户id加锁，保证事务提交后再释放锁。

```java
public Result seckillVoucher(Long voucherId) {
    //1、查询优惠券
     ...
    //2、判断秒杀是否开始
     ...
    //3、判断秒杀是否结束
    ...
    //4、判断库存是否充足
    ...
    Long userId = UserHolder.getUser().getId();
    //在函数调用处加锁，保证事务提交后再释放锁
    synchronized (userId.toString().intern()) {
        return createVoucherOrder(voucherId); //其实是以 this.xxxx方方式调用
    }
}
@Transactional
public  Result createVoucherOrder(Long voucherId) {
    .....
} //方法执行完，事务才会提交

```

spring的事务功能是通过动态代理获得当前类的代理对象，用代理对象做事务处理。而此处直接调用`createVoucherOrder(xxx)`方法，实际上是以`this.createVoucherOrder(xxx)`方式调用的，而通过this得到的是非代理对象，不具备事务功能。

因此，此处需要获得当前接口的代理对象，通过代理对象来调用该方法。

首先将`createVoucherOrder(xxx)`方法添加为`IVoucherOrderService`接口的方法，之后才能基于接口的代理对象调用方法

```java
public interface IVoucherOrderService extends IService<VoucherOrder> {

    Result seckillVoucher(Long voucherId);
	//在接口中添加方法
    Result createVoucherOrder(Long voucherId);
}
```

```java
public Result seckillVoucher(Long voucherId) {
    //1、查询优惠券
     ...
    //2、判断秒杀是否开始
     ...
    //3、判断秒杀是否结束
    ...
    //4、判断库存是否充足
    ...
    Long userId = UserHolder.getUser().getId();
    //在函数调用处加锁，保证事务提交后再释放锁
    synchronized (userId.toString().intern()) {
        //获得当前接口的代理对象
        IVoucherOrderService proxy = (IVoucherOrderService) 				AopContext.currentProxy();
        //使用代理对象调用方法
		return proxy.createVoucherOrder(voucherId);
    }
}

@Transactional
public  Result createVoucherOrder(Long voucherId) {
    .....
} //方法执行完，事务才会提交

```

为了使代理对象生效还需要做两件事：

- 添加必要依赖

  ```xml
  <dependency>
      <groupId>org.aspectj</groupId>
      <artifactId>aspectjweaver</artifactId>
      <version>1.8.10</version>
  </dependency>
  ```

- 在启动类上添加注解，暴漏代理对象

  ```java
  @EnableAspectJAutoProxy(exposeProxy = true)
  ```

Jmeter200个线程测试结果：同一个用户只扣减了一次库存，订单表中只有一条记录。

![image-20241215222017340](https://gitee.com/cmyk359/img/raw/master/img/image-20241215222017340-2024-12-1522:20:19.png)



> 补充：
>
> 1. ‌**接口代理（JDK动态代理）**‌：若Spring采用的是JDK动态代理方式，那么`AopContext.currentProxy()`将返回一个实现了相关接口的代理类实例。此时，该代理对象的类型可以被视为接口类型（或者说，它至少实现了那些接口）。但值得注意的是，这个代理对象并非接口本身，而是一个实现了这些接口的代理类的新实例。
> 2. ‌**类代理（CGLIB代理）**‌：若Spring选择使用CGLIB代理（通常是在无法采用接口代理，例如目标类没有实现任何接口时），`AopContext.currentProxy()`则会返回一个目标类的子类的代理实例。在这种情况下，代理对象的类型可以被看作是目标实现类的类型（或其子类型）。
> 3.  `@EnableAspectJAutoProxy(exposeProxy = true)`：在默认情况下，Spring AOP创建的**代理对象并不直接暴露给被代理的Bean**。然而，通过设置`exposeProxy = true`，我们可以让Spring在代理创建过程中将代理对象公开为Spring bean，从而允许开发者在需要时直接访问代理对象。当`exposeProxy = true`时，开发者可以通过`AopContext.currentProxy()`方法在AOP切面中获取当前的代理对象。



#### 存在的问题

通过加锁可以解决在**单机**情况下的一人一单安全问题，但是在**集群模式**下就不行了。

模拟集群环境：

![模拟集群环境](C:%5CUsers%5C86152%5CAppData%5CRoaming%5CTypora%5Ctypora-user-images%5Cimage-20241216201615254.png)

启动两端口的服务，使用同一个用户下两次单，在锁内部打上断点，debug结果如下：同一个用户在不同端口的服务上都成功获取到了锁，都可以进行下单操作。

![同一用户在不同端口的服务上都成功获取到互斥锁](https://gitee.com/cmyk359/img/raw/master/img/image-20241216204659057-2024-12-1620:47:54.png)



<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241216205036529-2024-12-1620:50:37.png" alt="数据库数据更改情况" style="zoom:80%;" />



`synchronized`是基于JVM置锁实现的，具体通过**内部对象Monitor**（监视器锁）来实现。每个Java对象都有一个与之关联的Monitor。

- 当一个线程想要访问某个对象的`synchronized`代码块时，首先需要获取该对象的Monitor。
- 如果Monitor已经被其他线程持有，则当前线程将会被阻塞，直至Monitor变为可用状态。
- 当线程完成`synchronized`块的代码执行后，它会释放Monitor，并把Monitor返还给对象池，这样其他线程才能获取Monitor并进入`synchronized`代码块。

在一个JVM内部可以保证多个线程要获取的监视器对象是唯一的，是可以实现多线程互斥的。由于现在我们部署了多个tomcat，每个tomcat都有一个属于自己的jvm。在每个JVM内部都会有一个线程成功获取锁，发生线程安全问题。

![image-20241216205958398](https://gitee.com/cmyk359/img/raw/master/img/image-20241216205958398-2024-12-1621:00:33.png)



### 3.5、分布式锁

分布式锁：满足分布式系统或集群模式下**多进程可见**并且**互斥**的锁。其核心思想是让大家都使用同一把锁，只要大家使用的是同一把锁，那么我们就能锁住线程，让程序串行执行。

分布式锁需满足的特性：

- **可见性**：多个线程都能看到相同的结果，注意：这个地方说的可见性并不是并发编程中指的内存可见性，只是说多个进程之间都能感知到变化的意思

- **互斥**：互斥是分布式锁的最基本的条件，使得程序串行执行

- **高可用**：程序不易崩溃，时时刻刻都保证较高的可用性

- **高性能**：由于加锁本身就让性能降低，所有对于分布式锁本身需要他就较高的加锁性能和释放锁性能

- **安全性**：安全也是程序中必不可少的一环

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241216224912910-2024-12-1622:49:15.png" alt="image-20241216224912910" style="zoom:80%;" />

#### 分布式锁的实现方案

分布式锁的核心是实现多进程之间互斥，而满足这一点的方式有很多，常见的有三种：

1. MySQL：MySQL本身就带有锁机制，可以搭建主从集群能够保证高可用，使用事务机制获得的锁，当出现异常连接断开时会锁自动释放，数据也会回滚。但是由于MySQL性能本身一般，所以采用分布式锁的情况下，其实使用MySQL作为分布式锁比较少见。
2. **Redis**：redis作为分布式锁是非常常见的一种使用方式，现在企业级开发中基本都使用redis或者zookeeper作为分布式锁。利用`setnx`命令实现互斥，如果有线程插入key成功，则表示获得到了锁，其他线程再插入时会失败，表示获得锁失败；释放锁时只需删除删除该key即可，为了在服务出现故障后仍能自动释放锁，需要在添加key的时候设置**过期时间**。
3. ZooKeeper：应用程序通过ZooKeeper客户端创建一个指定的持久节点作为锁的**根节点**。，节点在ZooKeeper服务器上会一直存在，直到手动删除。当应用程序想要获取锁时，它会在根节点下创建一个**临时顺序节点**，这个节点在ZooKeeper客户端会话结束时会自动删除。**应用程序通过获取所有子节点，并根据节点的顺序进行排序。如果当前节点是所有子节点中最小的（即序号最小），则表示应用程序成功获取了锁。** 如果当前节点不是最小的，则应用程序监听前一个节点，等待前一个节点被删除。当前一个节点被删除后，应用程序重新尝试获取锁。当应用程序完成任务并需要释放锁时，它只需删除自己创建的临时顺序节点。如果其他客户端正在监听这个节点，它们会收到通知并重新尝试获取锁。



![image-20241216225412480](https://gitee.com/cmyk359/img/raw/master/img/image-20241216225412480-2024-12-1622:54:13.png)



#### 利用Redis实现分布式锁

基本流程：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241216233005105-2024-12-1623:30:06.png" alt="image-20241216233005105" style="zoom: 80%;" />

实现分布式锁时需要实现的两个基本方法：**获取锁**和**释放锁**

**获取锁**

* 互斥：确保只能有一个线程获取锁
* 非阻塞：尝试一次，成功返回true，失败返回false



为了保证设置key和设置过期时间这两个操作的原子性，需要使用`set`在一个命令中完成设置

```bash
//添加锁，NX是互斥，EX时是指过期时间
SET lock thread1 NX EX 10
```

![image-20241216232512456](https://gitee.com/cmyk359/img/raw/master/img/image-20241216232512456-2024-12-1623:25:14.png)

此处的`key`和`value`该设置成什么？

key：`KEY_PREFIX + name`，key的前缀`KEY_PREFIX = "lock:"`，再根据当前的业务名称传入`name`，二者拼接起来作为key，让不同的业务获取不同的锁。

value：应设置成当前线程的**唯一标识**，防止因线程阻塞导致锁自动释放后再去执行释放锁操作，将别的线程锁设置的锁误删。此处的唯一标识设置为**UUID + 线程id**的形式，当要主动释放锁时，先获取对应的value值，判断与自己的唯一标识是否相同，相同则删除该key释放锁，否则不用处理。

> 当前线程的id不能作为线程的唯一标识。每个JVM实例都会为在其内部创建的每个线程分配一个唯一的标识符（通常是一个递增的长整型数字）。当有多个JVM实例运行时，每个JVM实例的线程标识符空间是独立的，所以不同JVM实例中的线程可能会有相同的标识符。

![image-20241216234347762](https://gitee.com/cmyk359/img/raw/master/img/image-20241216234347762-2024-12-1623:43:49.png)



**释放锁**

- 超时释放：获取锁时添加一个超时时间

- 手动释放

手动释放时先获取对应的value值，判断与自己的唯一标识是否相同，相同则删除该key释放锁，否则不用处理。

```java
//获取线程唯一标识
String threadId = VALUE_PREFIX + Thread.currentThread().getId();
//获取锁中的标识
String id = stringRedisTemplate.opsForValue().get(KEY_PREFIX + name);
//判断标识是否一致
if (id.equals(threadId)) {
    //一致，释放锁
    stringRedisTemplate.delete(KEY_PREFIX + name);
}
```

由于**判断标识是否一致**和**释放锁**是两个操作，可能会在判断标识一致后发生线程阻塞并且阻塞时间过长导致锁自动释放，其他线程就会获取锁成功。而当阻塞完成时会直接去释放锁（之前已经判断过是一致的），此时就会释放其他线程的锁，从而可能引发线程安全问题。因此需要一种机制保证这两个Redis操作的原子性 --- **Redis的Lua脚本**

> ‌**JVM的垃圾回收机制在某些情况下会暂时阻塞所有线程**‌，这一现象被称为“Stop the World”（STW）。在JVM中，垃圾回收器负责回收不再被引用的内存对象，并释放它们的内存空间。由于垃圾回收过程中需要扫描整个堆内存，并且为了保证数据一致性，需要暂停所有应用程序线程，这就是Stop the World现象发生的原因‌。在此期间，应用程序不能继续执行，所有线程都会被暂停，CPU时间片和系统资源都被垃圾回收器所占用。

![image-20241217001630707](https://gitee.com/cmyk359/img/raw/master/img/image-20241217001630707-2024-12-1700:16:32.png)



##### Redis调用Lua脚本

Lua 脚本在 Redis 中是一种非常强大的功能，它允许你将多个 Redis 命令打包成一个原子操作来执行，这样可以确保数据的一致性和完整性。Lua是一种编程语言,[基本语法参考](https://catpaws.top/29be09bb/#lua入门)



在 Lua 脚本中，你可以通过 `redis.call` 方法来调用任何 Redis 命令。这个方法的第一个参数是 Redis 命令的名字，随后的参数是这个命令所需要的任何参数。

```lua
-- 执行Redis命令
redis.call("命令名称","key","其他参数",....)
```

例如：先执行set name Rose，再执行get name

```lua
-- 先执行 set name Rose
redis.call("set","name","Rose")

--再执行 get name
local name = redis.call("get","name")
--返回结果
return  name
```

写好脚本以后，需要用Redis的`EVAL`命令来调用脚本。

![image-20241217003208606](https://gitee.com/cmyk359/img/raw/master/img/image-20241217003208606-2024-12-1700:32:09.png)

例如：要执行 redis.call('set', 'name', 'jack') 这个脚本，语法如下

```bash
EVAL "return redis.call('set','name','jcak')" 0
```

如果脚本中的key、value不想写死，可以作为参数传递。Redis中的参数分为两个：**KEY类型参数**和**其他类型参数**。通过numkeys指定KEY类型参数的个数，其后面的就是其他类型的参数。key类型参数会放入**KEYS**数组，其它参数会放入**ARGV**数组，在脚本中可以从KEYS和ARGV数组获取这些参数。

![image-20241217004126786](https://gitee.com/cmyk359/img/raw/master/img/image-20241217004126786-2024-12-1700:41:27.png)

> 注：Lua语言中数组的下标从1开始



使用Lua脚本编写释放锁的逻辑：

1. 获取锁中的线程标示
2. 判断是否与指定的标示（当前线程标示）
3. 如果一致则释放锁（删除）
4. 如果不一致则什么都不做

```lua
-- 获取锁中的线程标识
local id = reids.call('get',KEYS[1])
--判断线程标识与锁中标识是否一致
if (id == ARGV[1]) then
    -- 一致，释放锁
return redis.call('del',KEYS[1])
end
-- 不一致，返回结果
return 0
```



##### Java调用Lua脚本

使用Lua脚本编写释放锁的逻辑：

1. 获取锁中的线程标示
2. 判断是否与当前线程标示一致
3. 如果一致则释放锁（删除）
4. 如果不一致则什么都不做



在Resource目录下新建Lua脚本文件 **unlock.lua**

![image-20241217005925509](https://gitee.com/cmyk359/img/raw/master/img/image-20241217005925509-2024-12-1700:59:27.png)

```lua
-- 获取锁中的线程标识
local id = reids.call('get',KEYS[1])
--判断线程标识与锁中标识是否一致
if (id == ARGV[1]) then
    -- 一致，释放锁
	return redis.call('del',KEYS[1])
end
-- 不一致，返回结果
return 0
```



RedisTemplate调用Lua脚本的API如下：

其中，将KEY类型参数放在了一个List中，通过该List可以知道传入的KEY类型参数的个数，就不用原指令中的numkeys参数了。

![image-20241217005036808](https://gitee.com/cmyk359/img/raw/master/img/image-20241217005036808-2024-12-1700:50:38.png)

​	

调用Lua脚本完成释放锁的操作

```java
//将脚本的加载放在静态代码块中，在类加载时就会完成，省去了释放锁时加载脚本的IO时间
private static final DefaultRedisScript<Long> UNLOCK_SCRIPT;
static {
    UNLOCK_SCRIPT = new DefaultRedisScript<>();
    UNLOCK_SCRIPT.setLocation(new ClassPathResource("unlock.lua"));
    UNLOCK_SCRIPT.setResultType(Long.class);
}

public void unlock() {
    //调用lua脚本
    stringRedisTemplate.execute(
            UNLOCK_SCRIPT,
            Collections.singletonList(KEY_PREFIX + name),
            VALUE_PREFIX + Thread.currentThread().getId()
            );
}
```



整体代码：

**锁的基本接口**

```java
public interface ILock {

    /**
     *尝试获取锁
     * @param timeout 锁持有的超时时间，过期后自动释放
     * @return true代表获取锁成功；false代表获取锁失败
     */
    boolean tryLock(long timeout);

    /**
     * 释放锁
     */
    void unlock();
}
```

**SimpleRedisLock**

```java
public class SimpleRedisLock implements ILock{

    private String name; //业务相关名称
    private StringRedisTemplate stringRedisTemplate;
    private static final String KEY_PREFIX = "lock:";
    private static final String VALUE_PREFIX = UUID.randomUUID().toString(true)+"-";
    
    private static final DefaultRedisScript<Long> UNLOCK_SCRIPT;
    static {
        UNLOCK_SCRIPT = new DefaultRedisScript<>();
        UNLOCK_SCRIPT.setLocation(new ClassPathResource("unlock.lua"));
        UNLOCK_SCRIPT.setResultType(Long.class);
    }
    
    public SimpleRedisLock(String name, StringRedisTemplate stringRedisTemplate) {
        this.name = name;
        this.stringRedisTemplate = stringRedisTemplate;
    }

    @Override
    public boolean tryLock(long timeout) {
        String key = KEY_PREFIX + name;
        //获取线程唯一标识
        String value = VALUE_PREFIX + Thread.currentThread().getId();
        //尝试获取锁
        Boolean isSuccess = stringRedisTemplate.opsForValue()
            .setIfAbsent(key, value, timeout, TimeUnit.SECONDS);
        return BooleanUtil.isTrue(isSuccess);
    }
    
    @Override
    public void unlock() {
        //调用lua脚本
        stringRedisTemplate.execute(
                UNLOCK_SCRIPT,
                Collections.singletonList(KEY_PREFIX + name),
                VALUE_PREFIX + Thread.currentThread().getId()
                );
    }
}
```

**VoucherOrderServiceImpl**

```java
public Result seckillVoucher(Long voucherId) {
    //1、查询优惠券
     ...
    //2、判断秒杀是否开始
     ...
    //3、判断秒杀是否结束
    ...
    //4、判断库存是否充足
    ...
         
	Long userId = UserHolder.getUser().getId();
	//创建锁对象
	SimpleRedisLock lock = new SimpleRedisLock("voucher-order" + userId, 		stringRedisTemplate);
	//获取锁
	boolean isSuccess = lock.tryLock(500); //设置过期时间为500ms
	if (! isSuccess) {
 	   //获取锁失败，返回错误信息
 	   return Result.fail("不允许重复下单！");
	}
    //获取锁成功，执行业务，创建订单
	try {
   	 	IVoucherOrderService proxy = (IVoucherOrderService) AopContext.currentProxy();
    	return proxy.createVoucherOrder(voucherId);
	} finally {
    	//释放锁
    	lock.unlock();
	}
}

@Transactional
public  Result createVoucherOrder(Long voucherId) {
    .....
} //方法执行完，事务才会提交
```



#### Redisson

基于setnx实现的分布式锁存在下面的问题：

- **重入问题**：重入问题是指 **获得锁的线程可以再次进入到相同的锁的代码块中**，可重入锁的意义在于防止死锁。例如，如果一个线程在方法A中获取了锁，并调用方法B，而方法B也需要获取同一把锁，那么由于锁不可重入，方法B将无法获取到锁，这可能导致死锁的情况‌。

- **不可重试**：获取锁只尝试一次，如果失败就立即返回false，没有重试机制。这可能导致在高并发场景下，线程获取锁的成功率降低‌。合理的情况是：当线程在获得锁失败后，它应该能再次尝试获得锁。

- **超时释放：**我们在加锁时增加了过期时间，虽然这可以避免死锁，但如果业务执行时间较长，锁可能会在业务完成之前释放，从而引发安全隐患。

- **主从一致性：**在Redis的主从集群中，**主从数据同步存在延迟**。如果线程在主节点获取了锁，但尚未同步给从节点时主节点宕机，此时会选一个从节点作为新的主节点。由于这个从节点可能没有同步到锁的标识，其他线程可以获取到锁，导致多个线程同时持有锁，出现安全问题‌。
- 锁的误删问题‌：已通过Lua脚本解决。在释放锁时，判断当前的锁中的线程唯一标识与自己的标识是否相同，相同时再释放，并且将这两个操作使用Lua脚本完成，保证操作的原子性。





Redisson是一个高级的分布式协调Redis客户端，与Jedis、Lettuce等Redis客户端相比，Redisson的API更侧重于**分布式开发**，提供了多种分布式Java对象和服务，如**分布式锁**、分布式集合、分布式对象、分布式限流器等‌。

![image-20241217170920486](C:%5CUsers%5C86152%5CAppData%5CRoaming%5CTypora%5Ctypora-user-images%5Cimage-20241217170920486.png)

参考文档：

[官方文档](https://redisson.org/docs/)

[redisson使用全解（上篇）](https://blog.csdn.net/A_art_xiang/article/details/125525864)

[redisson使用全解（中篇）](https://blog.csdn.net/A_art_xiang/article/details/125536050)

[redisson使用全解（下篇）](https://blog.csdn.net/A_art_xiang/article/details/125538972)

##### Redisson快速入门

1、添加依赖

```xml
<dependency>
	<groupId>org.redisson</groupId>
	<artifactId>redisson</artifactId>
	<version>3.13.6</version>
</dependency>
```

2、添加Redis配置信息类，读取Reids的配置信息（可选）

```java
@Component
@Data
@ConfigurationProperties(prefix = "spring.redis")
public class RedisProperties {
    private String host;
    private String port;
    private String password;
}
```



3、配置Redisson客户端

```java
@Configuration
public class RedissonConfig {
    @Resource
    private RedisProperties redisProperties;

    @Bean
    public RedissonClient redissonClient() {
        //配置
        Config config = new Config(); //注意要引入Redisson的Config类型
        String address = "redis://" + redisProperties.getHost()+":"+ redisProperties.getPort();
        String password = redisProperties.getPassword();
        config.useSingleServer().setAddress(address).setPassword(password);
        //创建RedissonClient对象
        return Redisson.create(config);
    }
}
```



4、测试

```java
@Resource
private RedissionClient redissonClient;

@Test
void testRedisson() throws Exception{
    //创建锁对象(可重入)，指定锁的名称
    RLock lock = redissonClient.getLock("anyLock");
    //尝试获取锁，参数分别是：获取锁的最大等待时间(期间会重试)，锁自动释放时间，时间单位
    boolean isLock = lock.tryLock(1,10,TimeUnit.SECONDS);
    //判断获取锁成功
    if(isLock){
        try{
            System.out.println("执行业务");          
        }finally{
            //释放锁
            lock.unlock();
        }
        
    } 
}
```



5、改造业务

**VoucherOrderServiceImpl**

```java
public Result seckillVoucher(Long voucherId) {
    //1、查询优惠券
     ...
    //2、判断秒杀是否开始
     ...
    //3、判断秒杀是否结束
    ...
    //4、判断库存是否充足
    ...
         
	Long userId = UserHolder.getUser().getId();
    //使用Redisson的分布式锁
    //创建锁对象
    RLock lock = redissonClient.getLock("lock:order:" + userId);
    //尝试获取锁
    //无参形式下：waitTime默认为-1，失败后不等待；leaseTime默认为30s
    boolean isLock = lock.tryLock();
	if (! isSuccess) {
 	   //获取锁失败，返回错误信息
 	   return Result.fail("不允许重复下单！");
	}
    //获取锁成功，执行业务，创建订单
	try {
   	 	IVoucherOrderService proxy = (IVoucherOrderService) AopContext.currentProxy();
    	return proxy.createVoucherOrder(voucherId);
	} finally {
    	//释放锁
    	lock.unlock();
	}
}

@Transactional
public  Result createVoucherOrder(Long voucherId) {
    .....
} //方法执行完，事务才会提交
```

6、JMeter测试用100个线程给同一个用户下单

![image-20241217181414151](https://gitee.com/cmyk359/img/raw/master/img/image-20241217181414151-2024-12-1718:14:17.png)

##### Redisson可重入锁原理

核心：**利用Hash结构记录线程ID和重入次数‌，使用计数器维护锁状态**

Redisson在Redis中使用Hset命令和**Hash数据结构**来实现可重入锁。

当同一个线程第一次获取锁时，Redis会记录下这个线程的ID，并将锁的持有次数设置为1。如果这个线程再次请求锁（即可重入操作），Redisson会检测到当前持有锁的线程ID与当前线程相同，于是不会重新设置锁，而是简单地**增加计数器**，表示这个线程再次持有了锁‌。

同一线程可以多次获取同一个锁，且只有当所有锁释放操作都完成后，锁才会真正释放。Redisson通过维护一个**计数器**来实现这一特性。每次释放锁时，Redisson会减少计数器，**只有当计数器减为0时，锁才会真正释放‌。**

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241217195721010-2024-12-1719:57:23.png" alt="image-20241217195721010" style="zoom:80%;" />



获取锁的Lua脚本

```lua
local key = KEYS[1];  -- 锁的key
local threadId = ARGV[1];  -- 线程的唯一标识
local releaseTime = ARGV[2]; -- 锁的自动释放时间

-- 判断锁是否存在
if (redis.call('exists',key) == 0) then
    -- 锁不存在，获取锁
    redis.call('hset', key, threadId, 1);
    --设置有效期
    redis.call('expire', key, releaseTime);
    -- 返回结果
    return 1;
end

--锁已存在，判断锁是否是自己的
if (redis.call('hexists',key,threadId) == 1) then
    --锁是自己的，重置过期时间，计数器加一
    redis.call('hincrby',key,threadId,1);
    redis.call('expire',key,releaseTime);
    return 1;
end
return 0; -- 锁不是自己的，获取锁失败
```

![Redisson源码中获取锁的脚本](https://gitee.com/cmyk359/img/raw/master/img/image-20241217203811863-2024-12-1720:38:17.png)



释放锁的Lua脚本

```lua
local key = KEYS[1];  -- 锁的key
local threadId = ARGV[1];  -- 线程的唯一标识
local releaseTime = ARGV[2]; -- 锁的自动释放时间

-- 判断锁是否是自己的
if (redis.call('hexists',key,threadId) == 0) then
    --锁不是自己的，直接返回
    return nil;
end
-- 是自己的锁，则重入次数减一
local count = redis.call('hincrby',key,threadId,-1);

-- 判断计数器是否已减为0
if (count > 0) then
    -- 计数器不为0，不能释放锁，重置锁有效期后返回
    redis.call('expire',key,releaseTime);
    return nil;
else
    -- 计数器减为零，释放锁
    redis.call('del',key);
    return nil;
end
```



![Redisson源码中释放锁的脚本](https://gitee.com/cmyk359/img/raw/master/img/image-20241217204305605-2024-12-1720:43:17.png)

##### Redisson锁重试和WatchDog机制

**Redisson的锁重试机制**‌：

当线程尝试获取锁失败时，Redisson会在指定的等待时间（waitTime）内不断尝试重新获取锁。这一过程中，Redisson会动态调整等待时间以提高获取锁的效率。如果最终仍然无法获取锁，则会返回失败‌。锁重试的实现依赖于`tryLock`方法，该方法会接受等待时间、超时时间和时间单位三个参数。在尝试获取锁的过程中，如果锁已被其他线程持有，则当前线程会进入一个自旋循环，不断尝试获取锁，直到超时或者成功获取锁为止‌。

<img src="https://gitee.com/cmyk359/img/raw/master/img/锁的重试机制-2024-12-1723:58:28.png" alt="锁的重试机制源码分析" style="zoom:25%;" />

**Redisson的WatchDog机制**‌：

WatchDog机制，也称为看门狗机制，通过动态续约锁的过期时间，确保了分布式锁在持有者未主动释放之前不会被其他线程获取，从而有效防止了因锁超时而导致的数据一致性问题。

分布式锁通常带有一个过期时间(TTL)来防止因锁未释放而导致的死锁问题。然而，业务逻辑执行时间可能超过锁的默认过期时间，如果没有扩展锁的时间，锁会自动过期并释放，导致其他线程获得锁，进而引发数据一致性问题。WatchDog机制的作用就是**动态续约锁的过期时间**，确保锁在持有者未主动释放之前不会被其他线程获取‌。

若获取锁时**没有指定锁的自动释放时间**，`leaseTime`参数默认为-1，在异步获取锁时会将锁的自动释放时间设置为`WatchdogTimeout`，默认为30s。一旦锁被获取，Redisson会启动一个WatchDog定时任务。这个定时任务每隔一段时间（通常是10秒）会检查锁的状态，如果锁仍然有效，它会自动j将锁的持有时间再延长30秒。这样，即使业务逻辑执行时间超过了锁的初始过期时间，锁也不会被自动释放‌。

当客户端完成需要锁定的操作后，会手动释放锁，并删除定时任务。如果客户端在操作过程中发生异常或崩溃，WatchDog也会在锁的持有时间结束后自动释放锁，以避免死锁的发生‌。



##### Redisson锁的MultiLock原理

Redisson分布式锁主从一致性问题：

​	Redisson分布式锁主从一致性问题主要是由于**主从同步延迟导致的锁失效问题**‌。当Java应用向Redis主节点发送获取锁的请求，主节点接收请求后存储锁信息，但在主从同步完成之前，如果主节点宕机，Redis的哨兵机制会选择一个新的从节点作为主节点。然而，这个新的主节点上并没有之前的锁信息，导致锁失效。这样，当新的线程发来请求时，又可以获取到锁，从而可能出现两个线程并发访问资源的情况‌。

​	为了解决这个问题，Redisson提出了‌**MultiLock**‌锁（联锁）。MultiLock锁不使用主从关系，而是将每个Redis节点都视为独立的，都可以进行读写操作。在获取锁时，需要在所有的Redis服务器上都要获取锁，**只有所有的服务器都写入成功，才算是加锁成功**。这样，即使某个节点宕机 ，由于其他节点上仍然保留有锁的标识，因此新的线程无法在所有节点上都获取到锁，从而保证了锁的一致性和安全性‌。

![image-20241218100800973](https://gitee.com/cmyk359/img/raw/master/img/image-20241218100800973-2024-12-1810:08:27.png)



源码分析：

将独立的多个锁组合成联锁：

<img src="https://gitee.com/cmyk359/img/raw/master/img/联锁的源码分析-2024-12-1811:26:23.jpg" alt="组成联锁" style="zoom:80%;" />

获取联锁：

<img src="https://gitee.com/cmyk359/img/raw/master/img/获取联锁的源码分析-2024-12-1811:26:34.png" alt="获取联锁的源码分析" style="zoom:50%;" />



#### 总结

以上通过Redis实现分布式锁的方案：

**不可重入Redis分布式锁**：

- 原理：利用setnx的互斥性；利用ex避免死锁；释放锁时判断线程标示
- 缺陷：不可重入、无法重试、锁超时失效

**可重入的Redis分布式锁**：

- 原理：利用hash结构，记录线程标示和重入次数；利用watchDog延续锁时间；利用信号量控制锁重试等待
- 缺陷：redis宕机引起锁失效问题

**Redisson的multiLock**：

- 原理：多个独立的Redis节点，必须在所有节点都获取重入锁，才算获取锁成功
- 缺陷：运维成本高、实现复杂





### 3.6、Redis消息队列

消息队列（Message Queue，简称MQ）是一种应用间的通信方式，它允许消息发送者将消息发送到队列中，而消息接收者可以从队列中异步地接收消息。最简单的消息队列模型包括3个角色：

- 消息队列：存储和管理消息，也被称为消息代理（Message Broker）
- 生产者：发送消息到消息队列
- 消费者：从消息队列获取消息并处理消息

![image-20241218203219010](https://gitee.com/cmyk359/img/raw/master/img/image-20241218203219010-2024-12-1820:32:55.png)



Redis提供了三种不同的方式来实现消息队列：

- list结构：基于List结构模拟消息队列
- PubSub：基本的点对点消息模型
- Stream：比较完善的消息队列模型

#### 基于List结构模拟消息队列

​	Redis的list数据结构是一个双向链表，很容易模拟出队列效果。可以利用 LPUSH结合RPOP、或者RPUSH结合LPOP来实现。但是当队列中没有消息时RPOP或LPOP操作会返回null，并不像JVM的阻塞队列那样会阻塞并等待消息。**因此这里应该使用`BRPOP`或者`BLPOP`来实现阻塞效果。**



优点：

- 利用Redis存储，不受限于JVM内存上限
- 基于Redis的持久化机制，数据安全性有保证
- 可以满足消息有序性

缺点：

- 无法避免消息丢失，当取出消息执行时出现异常仍会导致数据丢失。
- 只支持单消费者，一个消费者取出消息后会将消息从队列中删除，其他消费者无法再获取到。



#### PubSub实现消息队列

‌Redis的PubSub（发布/订阅）是一种消息通信模式，它允许发送者（发布者）将消息发送到指定的**频道**，而接收者（订阅者）可以订阅这些频道以接收消息。订阅者可以订阅一个或多个频道。

Redis的PubSub模式的主要组件包括：

- ‌**发布者（Publisher）**‌：产生并发布消息的实体，将消息发送到指定的频道‌。
- ‌**订阅者（Subscriber）**‌：接收并处理消息的实体，可以订阅一个或多个频道以接收消息‌。
- ‌**频道（Channel）**‌：发布者和订阅者之间的通信渠道，发布者将消息发送到频道，而订阅者从频道接收消息‌。

相关命令：

- SUBSCRIBE channel [channel]：订阅一个或多个频道，**阻塞式等待**直至新消息到达

- PUBLISH channel msg：向一个频道发送消息

- PSUBSCRIBE pattern [pattern] ：订阅与pattern格式匹配的所有频道

  ![所支持的通配符示例](https://gitee.com/cmyk359/img/raw/master/img/image-20241218205604310-2024-12-1820:56:23.png)

![image-20241218205932568](https://gitee.com/cmyk359/img/raw/master/img/image-20241218205932568-2024-12-1820:59:35.png)

优点：

- 采用发布订阅模型，支持多生产、多消费

缺点：

- **不支持数据持久化**
- 无法避免消息丢失
- 消息堆积有上限，超出时数据丢失（消费者缓冲区大小有限，缓冲区满时新出现的消息会丢失）



#### Stream实现消息队列

Redis Stream 是 Redis 5.0 版本新增加的**数据结构**，主要用于实现消息队列（MQ，Message Queue）。与 Redis 之前的发布订阅（Pub/Sub）模式相比，Redis Stream 提供了消息的持久化和主备复制功能，可以让任何客户端访问任何时刻的数据。

[Stream数据结构的相关命令参考](https://redis.io/docs/latest/commands/?group=stream)

Stream本身就是一种数据结构，其中保存的消息可以被持久化存储到磁盘上，确保数据不会丢失，即使在 Redis 服务器重启后也能恢复消息。

Stream中的消息可以重复读取，消费者处理完消息后需要确认（ACK），确保消息不会丢失。未确认的消息会被记录在待处理消息列表（Pending Entry List, PEL）中，直到被确认或超时。



发消息的命令`XADD`

![image-20241218210630161](https://gitee.com/cmyk359/img/raw/master/img/image-20241218210630161-2024-12-1821:06:37.png)

```bash
##创建名为users的队列，并向其中发送一个消息，内容是：{name=jack，age=21}，让Redis自动生成ID
127.0.0.1:6379> XADD users * name jack age 21
"1734527266902-0"    #命令执行结果返回消息的id
```



读取消息的命令

`XREAD`：消费者可以选择阻塞读取模式，当没有新消息时，会等待指定时间再返回结果

当我们指定起始ID为`$`时，代表读取最新的消息，如果我们处理一条消息的过程中，又有**超过1条以上**的消息到达队列，则下次获取时也只能获取到最新的一条，会出现**<u>漏读消息</u>**的问题。

![image-20241218211301988](https://gitee.com/cmyk359/img/raw/master/img/image-20241218211301988-2024-12-1821:13:04.png)

```bash
127.0.0.1:6379> XREAD COUNT 1 STREAMS users 0
1) 1) "users"
   2) 1) 1) "1734527266902-0"
         2) 1) "name"
            2) "jack"
            3) "age"
            4) "21"
```



**Stream的多消费者模式**

Redis Stream 的**消费者组**（Consumer Group）是 Redis 5.0 引入的一种机制，**将多个消费者划分到一个组中，监听同一个消息队列**，实现**多个消费者并行消费 Stream 中的消息**，从而实现消息的负载均衡。其具有以下特点：

![image-20241218213059980](https://gitee.com/cmyk359/img/raw/master/img/image-20241218213059980-2024-12-1821:31:02.png)

1、创建消费者组：`XGROUP CREATE`

```bash
XGROUP CREATE key groupName ID [MKSTREAM]
```

- key：消息队列名称
- groupName：消费者组名称
- ID：起始ID标示，$代表队列中最后一个消息，0则代表队列中第一个消息
- MKSTREAM：队列不存在时自动创建队列

例：为消息队列 `users`创建消费者组 g1

```bash
127.0.0.1:6379> XGROUP CREATE users g1 0
OK
```

> 消费者组中的消费者不用手动去创建。当指定消费者组中某个消费者监听消息时，若该消费者不存在，Reids会自动创建该消费者

其他相关命令

```bash
#删除指定的消费者组
XGROUP DESTORY key groupName
#给指定的消费者组添加消费者
XGROUP CREATECONSUMER key groupname consumername
#删除消费者组中的指定消费者
XGROUP DELCONSUMER key groupname consumername
```

2、从消费者组读取消息 `XREADGROUP GROUP`

```bash
XREADGROUP GROUP group consumer [COUNT count] [BLOCK milliseconds]
  [NOACK] STREAMS key [key ...] id [id ...]
```

- group：消费组名称
- consumer：消费者名称，如果消费者不存在，会自动创建一个消费者者
- count：本次查询的最大数量
- BLOCK milliseconds：当没有消息时最长等待时间
- NOACK：无需手动ACK，获取到消息后自动确认
- STREAMS key：指定队列名称
- ID：获取消息的起始ID
  - `>`：从下一个未消费的消息开始 （正常情况使用 `>`）
  - 其它：<u>根据指定id从**pending-list**中获取**已消费但未确认**的消息</u>，例如0，是从pending-list中的第一个消息开始。（消息处理出现异常时，每次ID使用`0`即可依次处理pending-list中的消息）

例：使用消费者组g1中的消费者c2阻塞式读取消息队列users中的最新两条信息，阻塞等待时间为2s

```bash
127.0.0.1:6379> XREADGROUP GROUP g1 c2  COUNT 2  BLOCK 2000 STREAMS users >
1) 1) "users"
   2) 1) 1) "1734529962652-0"
         2) 1) "k1"
            2) "v1"
      2) 1) "1734529969264-0"
         2) 1) "k2"
            2) "v2"
```

3、确认消息 `XACK`

```bash
XACK key groupName id [id ...]
```

例：确认使用消费者组g1从消息队列users中读取到id分别为`1734529962652-0`和`1734529969264-0`的两条消息

```bash
127.0.0.1:6379> XACK users g1 1734529962652-0 1734529969264-0
(integer) 2
```



Redis三种消息队列对比：

![Redis三种消息队列](https://gitee.com/cmyk359/img/raw/master/img/image-20241218220844769-2024-12-1822:08:47.png)



### 3.7、Redis优化秒杀

原来秒杀下单的流程如下，处理逻辑**由单个线程串行执行**，并且其中还包括对数据库的修改操作，耗时较长。

![image-20241218150543198](https://gitee.com/cmyk359/img/raw/master/img/image-20241218150543198-2024-12-1815:05:54.png)

优化方案：

将耗时比较短的查询操作和逻辑判断放入到redis中，并通过Lua脚本保证其原子性。比如是否库存足够和是否一人一单。因此需要新增秒杀优惠券的同时，将优惠券信息保存到Redis中。

- 判断库存是否充足，使用Redis中的String类型存储判断即可；
- 判断一人一单，可使用Redis的set数据结构判断，其值具有不重复的特点。key为优惠券的id，值为下过单的用户。用户再次下单时，对应优惠券的value中已经存在该用户，判断为重复下单。

执行Lua脚本，根据返回结果判断用户是否能够下单，若用户不满足下单要求，则直接返回错误信息；若能够下单，则将下单操作放入阻塞队列交给其他异步线程完成，当前线程只需给用户返回订单id即可。

![异步秒杀流程](https://gitee.com/cmyk359/img/raw/master/img/image-20241218152900942-2024-12-1815:29:55.png)

如果阻塞队列采用Java 的Blocking Queue能够做到持续监听队列中的订单信息，当有订单加入时能够及时取出完成下单操作。但该方法主要有一下两个缺陷：

- 内存限制问题

  该阻塞队列使用的是JVM的内存，在高并发环境下会出现内存溢出问题。

- 数据安全问题

  该阻塞队列基于内存保存订单信息，若服务宕机或者将订单信息取出后执行时发生异常，会导致数据丢失。

可以使用**消息队列**完成订单信息的发送和接收，通常会采用消息中间件完成，如RabbitMQ等。

消息队列允许系统中的组件进行异步消息传递，发送者不需要等待接收者处理完毕，即可继续执行其他任务，因此可以使用消息队列代替阻塞队列完成异步生成订单；消息队列是独立于JVM之外的，解决了内存限制问题；同时消息队列通过持久化、确认机制等方式，确保消息的可靠传输。防止消息在传递过程中丢失，从而保证系统的稳定性和数据的完整性‌。

此处使用Reids提供的消息队列功能完成异步下单。

创建一个Stream类型的消息队列，名为`stream.orders`，并为其添加消费者组 `g1`

```bash
xgroup create stream.orders g1 0 MKSTREAM
```



在Lua脚本中，判断库存是否充足和用户是否重复下单。确定用户有抢购资格后，扣减库存，添加用户购买记录，向消息队列stream.orders中添加订单消息，内容包含voucherId、userId、orderId

在`VoucherOrderServiceImpl`初始化完成后，开启一个线程任务，尝试获取stream.orders中的消息，完成下单并确认消息。




VoucherServiceImpl，添加秒杀券时将库存信息存入Redis

```java
@Override
@Transactional
public void addSeckillVoucher(Voucher voucher) {
    // 保存优惠券
    save(voucher);
    // 保存秒杀信息
    SeckillVoucher seckillVoucher = new SeckillVoucher();
    seckillVoucher.setVoucherId(voucher.getId());
    seckillVoucher.setStock(voucher.getStock());
    seckillVoucher.setBeginTime(voucher.getBeginTime());
    seckillVoucher.setEndTime(voucher.getEndTime());
    seckillVoucherService.save(seckillVoucher);
    
    // 保存秒杀库存到Redis中，并设置过期时间
    //根据秒杀券的开始时间和结束时间获得秒杀券的TTL
    ZonedDateTime startZonedDateTime = voucher.getBeginTime().atZone(ZoneOffset.UTC);
    ZonedDateTime endZonedDateTime = voucher.getEndTime().atZone(ZoneOffset.UTC);
    Duration duration = Duration.between(startZonedDateTime, endZonedDateTime);
    long seconds = duration.getSeconds();
    
    stringRedisTemplate.opsForValue().set(SECKILL_STOCK_KEY + voucher.getId(),voucher.getStock().toString(),seconds, TimeUnit.SECONDS);
}
```



Lua脚本 `seckill`

```lua
-- 1.参数列表
-- 1.1.优惠券id
local voucherId = ARGV[1]
-- 1.2.用户id
local userId = ARGV[2]
-- 1.3.订单id
local orderId = ARGV[3]

-- 2.数据key
-- 2.1.库存key（Lua中字符串拼接使用 ..）
local stockKey = 'seckill:stock:' .. voucherId
-- 2.2.订单key
local orderKey = 'seckill:order:' .. voucherId

-- 3.脚本业务
-- 3.1.判断库存是否充足 get stockKey
if(tonumber(redis.call('get', stockKey)) <= 0) then
    -- 3.2.库存不足，返回1
    return 1
end
-- 3.2.判断用户是否下单 SISMEMBER orderKey userId
if(redis.call('sismember', orderKey, userId) == 1) then
    -- 3.3.存在，说明是重复下单，返回2
    return 2
end
-- 3.4.扣库存 incrby stockKey -1
redis.call('incrby', stockKey, -1)
-- 3.5.下单（保存用户）sadd orderKey userId
redis.call('sadd', orderKey, userId)
-- 3.6.发送消息到队列中， XADD stream.orders * k1 v1 k2 v2 ...
redis.call('xadd', 'stream.orders', '*', 'userId', userId, 'voucherId', voucherId, 'id', orderId)
return 0
```



VoucherOrderServiceImpl

```java
@Service
@RequiredArgsConstructor
public class VoucherOrderServiceImpl extends ServiceImpl<VoucherOrderMapper, VoucherOrder> implements IVoucherOrderService {

    private final SeckillVoucherServiceImpl seckillVoucherService;
    private final RedisIdWorker redisIdWorker;
    private final StringRedisTemplate stringRedisTemplate;
    private final RedissonClient redissonClient;
    private static final ExecutorService SECKILL_ORDER_SERVICE = Executors.newFixedThreadPool(50);
    private static final DefaultRedisScript<Long> SECKILL_SCRIPT;
    //执行创建订单的动作是在子线程中进行的，获取不到当前主线程的代理类，需要将其设置为属性，以便在子线程中获取
    private IVoucherOrderService proxy;

    //加载Lua脚本
    static {
        SECKILL_SCRIPT = new DefaultRedisScript<>();
        SECKILL_SCRIPT.setLocation(new ClassPathResource("seckill.lua"));
        SECKILL_SCRIPT.setResultType(Long.class);
    }

    //在类加载完成后，提交任务到线程池，执行其中的run方法
    @PostConstruct
    private void init() {
        SECKILL_ORDER_SERVICE.submit(new VoucherOrderHandler());
    }


    private class VoucherOrderHandler implements Runnable {
        String queueName = "stream.orders";
        @Override
        public void run() {
            while (true) {
                try {
                    //1、获取消息队列中的订单信息
                    // XREADGROUP GROUP g1 c2  COUNT 2  BLOCK 2000 STREAMS users >
                    //需要提前在redis中执行xgroup create stream.orders g1 0 MKSTREAM，创建消息队列和消费组
                    List<MapRecord<String, Object, Object>> list = stringRedisTemplate.opsForStream().read(
                            Consumer.from("g1", "c1"),
                            StreamReadOptions.empty().count(1).block(Duration.ofSeconds(2)),
                            StreamOffset.create(queueName, ReadOffset.lastConsumed())
                    );

                    //2、判断消息是否获取成功
                    //2.1、获取失败，即当前还没有新的订单要处理，继续进行下次循环
                    if (list == null || list.isEmpty()){
                        continue;
                    }
                    //2.2 获取成功，解析消息
                    MapRecord<String, Object, Object> entries = list.get(0);
                    Map<Object, Object> value = entries.getValue();
                    VoucherOrder voucherOrder = BeanUtil.fillBeanWithMap(value, new VoucherOrder(), true);
                    //2.3 下单
                    handleVoucherOrder(voucherOrder);

                    //3、ACK确认消息
                    stringRedisTemplate.opsForStream().acknowledge(queueName,"g1",entries.getId());
                } catch (Exception e) {
                    log.error("处理订单异常", e);
                    //消息处理异常未确认会存入pending-list,处理pending-list中的消息
                    handlePendingList();
                }
            }
        }

        private void handlePendingList() {
            while (true) {
                try {
                    //1.获取pending-list中的订单信息 XREADGROUP GROUP g1 c1 COUNT 1 BLOCK 2000 STREAMS s1 0
                    List<MapRecord<String, Object, Object>> list = stringRedisTemplate.opsForStream().read(
                            Consumer.from("g1", "c1"),
                            StreamReadOptions.empty().count(1),
                            StreamOffset.create(queueName, ReadOffset.from("0"))
                    );

                    //2、判断消息是否获取成功
                    //2.1 如果为null，说明pending-list中没有异常消息，结束循环
                    if (list == null || list.isEmpty()){
                        break;
                    }
                    //2.2 获取成功，解析消息
                    MapRecord<String, Object, Object> entries = list.get(0);
                    Map<Object, Object> value = entries.getValue();
                    VoucherOrder voucherOrder = BeanUtil.fillBeanWithMap(value, new VoucherOrder(), true);
                    //2.3 下单
                    handleVoucherOrder(voucherOrder);

                    //3、ACK确认消息
                    stringRedisTemplate.opsForStream().acknowledge(queueName,"g1",entries.getId());
                } catch (Exception e) {
                    log.error("处理pending-list订单异常", e);
                }
            }
        }

        private void handleVoucherOrder(VoucherOrder voucherOrder) {
            /**
             * 由于在redis中做了一人一单的判断，同一个用户的多个线程下单时在Lua脚本中会返回1，从而直接返回不能重复下单的提醒
             * 此处加锁是为了防止Redis中出错（尽管不太可能）后兜底
             */
            //1.获取用户
            Long userId = voucherOrder.getUserId();
            //使用Redisson的分布式锁
            // 2.创建锁对象
            RLock redisLock = redissonClient.getLock("lock:order:" + userId);
            // 3.尝试获取锁
            boolean isLock = redisLock.tryLock();
            // 4.判断是否获得锁成功
            if (!isLock) {
                // 获取锁失败，直接返回失败或者重试
                log.error("不允许重复下单！");
                return;
            }
            try {
                //注意：由于是spring的事务是放在threadLocal中，此时的是多线程，事务会失效
                proxy.createVoucherOrder(voucherOrder);
            } finally {
                // 释放锁
                redisLock.unlock();
            }
        }
    }


    /**
     *  秒杀券下单
     * @param voucherId 秒杀券id
     * @return
     */
    @Override
    public Result seckillVoucher(Long voucherId) throws InterruptedException {
        //获取用户id
        Long userId = UserHolder.getUser().getId();
        //生成订单id
        long orderId = redisIdWorker.nextId("order");

        //1、执行Lua脚本
        Long result = stringRedisTemplate.execute(
                SECKILL_SCRIPT,
                Collections.emptyList(),
                voucherId.toString(),
                userId.toString(),
                String.valueOf(orderId)
        );
        int r = result.intValue();

        //2、判断结果Lua脚本返回值是否为0
        if (r != 0) {
            return Result.fail(r == 1 ? "库存步骤":"不允许重复下单");
        }

        //3、创建代理对象
        proxy =(IVoucherOrderService) AopContext.currentProxy();

        //4、返回订单id
        return Result.ok(orderId);
    }


    @Transactional
    public void createVoucherOrder(VoucherOrder voucherOrder) {
        //1、扣减库存
        boolean success = seckillVoucherService.update()
                .setSql("stock = stock - 1") // set stock = stock - 1
                .eq("voucher_id", voucherOrder.getVoucherId()).gt("stock", 0) // where id = ? and stock > 0
                .update();
        if (!success) {
            // 扣减失败
            log.error("库存不足！");
        }
        //2、保存订单
        save(voucherOrder);
    }

}
```



## 四、达人探店

> 基于List的点赞列表、基于SortedSet的点赞排行榜

### 4.1、发布探店笔记

探店笔记类似点评网站的评价，往往是图文结合。对应的表有两个：

tb_blog：探店笔记表，包含笔记中的标题、文字、图片等
tb_blog_comments：其他用户对探店笔记的评价

![image-20241220094532686](https://gitee.com/cmyk359/img/raw/master/img/image-20241220094532686-2024-12-2009:45:33.png)

具体的发布流程如下：

![img](https://gitee.com/cmyk359/img/raw/master/img/1653578992639-2024-12-2009:46:08.png)

上传图片接口`/upload/blog`，此处只是简单将文件保存到指定的本地目录`SystemConstants.IMAGE_UPLOAD_DIR`中，实际业务中都是上传到对象存储服务器上的。

```java
@Slf4j
@RestController
@RequestMapping("upload")
public class UploadController {

    @PostMapping("blog")
    public Result uploadImage(@RequestParam("file") MultipartFile image) {
        try {
            // 获取原始文件名称
            String originalFilename = image.getOriginalFilename();
            // 生成新文件名
            String fileName = createNewFileName(originalFilename);
            // 保存文件
            image.transferTo(new File(SystemConstants.IMAGE_UPLOAD_DIR, fileName));
            // 返回结果
            log.debug("文件上传成功，{}", fileName);
            return Result.ok(fileName);
        } catch (IOException e) {
            throw new RuntimeException("文件上传失败", e);
        }
    }

}
```



发布笔记接口`/blog`，其中Blog实体类对应的表中没有发布博客用户的姓名、用户头像以及用户是否点赞过了等字段，为了方便数据处理，在实体类中添加这三个属性，并使用`@TableField(exist = false)`修饰，表示该字段不属于当前实体类，需自己维护。

Blog实体类

```java
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("tb_blog")
public class Blog implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    /**
     * 商户id
     */
    private Long shopId;
    /**
     * 用户id
     */
    private Long userId;
    /**
     * 用户图标  @TableField(exist = false) 表示该字段不属于当前实体类，需自己维护
     */
    @TableField(exist = false)
    private String icon;
    /**
     * 用户姓名
     */
    @TableField(exist = false)
    private String name;
    /**
     * 是否点赞过了
     */
    @TableField(exist = false)
    private Boolean isLike;

    /**
     * 标题
     */
    private String title;

    /**
     * 探店的照片，最多9张，多张以","隔开
     */
    private String images;

    /**
     * 探店的文字描述
     */
    private String content;

    /**
     * 点赞数量
     */
    private Integer liked;

    /**
     * 评论数量
     */
    private Integer comments;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
```



```java
@RestController
@RequestMapping("/blog")
public class BlogController {

    @Resource
    private IBlogService blogService;

    @PostMapping
    public Result saveBlog(@RequestBody Blog blog) {
        //获取登录用户
        UserDTO user = UserHolder.getUser();
        blog.setUserId(user.getId());
        //保存探店博文
        blogService.saveBlog(blog);
        //返回id
        return Result.ok(blog.getId());
    }
}
```



### 4.2、查看探店笔记



![img](https://gitee.com/cmyk359/img/raw/master/img/1653579931626-2024-12-2009:58:16.png)

实现代码：

BlogController

```java
@RestController
@RequestMapping("/blog")
public class BlogController {

    @Resource
    private IBlogService blogService;
    
    @GetMapping("/{id}")
    public Result queryBlogById(@PathVariable("id") long id) {
        return blogService.queryBlogById(id);
    }
}
```

BlogServiceImpl

```java
 @Override
 public Result queryBlogById(long id) {
     //1、查询博客
     Blog blog = getById(id);
     //2、查询博客相关用户
     queryBlogUser(blog);
     return Result.ok(blog);
 }

private void queryBlogUser(Blog blog) {
    Long userId = blog.getUserId();
    User user = userService.getById(userId);
    blog.setName(user.getNickName());
    blog.setIcon(user.getIcon());
}
```



### 4.3、点赞功能

初始点赞功能实现代码如下，一个用户可以给一个博客点多次赞，不符合业务逻辑。

```java
@GetMapping("/likes/{id}")
public Result queryBlogLikes(@PathVariable("id") Long id) {
    //修改点赞数量
    blogService.update().setSql("liked = liked +1 ").eq("id",id).update();
    return Result.ok();
}
```



需求：

- 同一个用户只能点赞一次，再次点击则取消点赞
- 如果当前用户已经点赞，则点赞按钮高亮显示（前端已实现，判断字段Blog类的isLike属性）

实现步骤：

* 给Blog类中添加一个isLike字段，标示是否被当前用户点赞
* 修改点赞功能，利用Redis的**set集合**判断是否点赞过，未点赞过则点赞数+1，已点赞过则点赞数-1
* 修改根据id查询Blog的业务，判断当前登录用户是否点赞过，赋值给isLike字段
* 修改分页查询Blog业务，判断当前登录用户是否点赞过，赋值给isLike字段

1、在Blog 添加一个字段

```java
@TableField(exist = false)
private Boolean isLike;
```

2、修改代码

```java
 @Override
    public Result likeBlog(Long id){
        // 1.获取登录用户
        Long userId = UserHolder.getUser().getId();
        // 2.判断当前登录用户是否已经点赞
        String key = BLOG_LIKED_KEY + id;
        Boolean isMember = stringRedisTemplate.opsForSet().isMember(key, userId.toString());
        if(BooleanUtil.isFalse(isMember)){
             //3.如果未点赞，可以点赞
            //3.1 数据库点赞数+1
            boolean isSuccess = update().setSql("liked = liked + 1").eq("id", id).update();
            //3.2 保存用户到Redis的set集合
            if(isSuccess){
                stringRedisTemplate.opsForSet().add(key,userId.toString());
            }
        }else{
             //4.如果已点赞，取消点赞
            //4.1 数据库点赞数-1
            boolean isSuccess = update().setSql("liked = liked - 1").eq("id", id).update();
            //4.2 把用户从Redis的set集合移除
            if(isSuccess){
                stringRedisTemplate.opsForSet().remove(key,userId.toString());
            }
        }
```



### 4.4、点赞排行榜

在探店笔记的详情页面，应该把给该笔记点赞的人显示出来，此处按照时间顺序显示最先点赞的五人。由于涉及到排序，因此可以<u>使用Redis的`SortedSet`集合，其中的score字段存储点赞时的**时间戳**，显示时按照时间戳从小到大排序，返回前五个。</u>

也要将之前点赞功能中使用的`Set`换成`SortedSet`。由于SortedSet没有`isMember`方法，在判断用户是否点过赞时，可以使用`score`方法返回当前用户点赞时的时间戳，若没点过赞则返回null，以此来判断。

```java
@Service
public class BlogServiceImpl extends ServiceImpl<BlogMapper, Blog> implements IBlogService {

    @Resource
    private IUserService userService;
    @Resource
    private StringRedisTemplate stringRedisTemplate;

    /**
     * 对所有博客按照点赞数排序后分页返回数据
     * @param current
     * @return
     */
    @Override
    public Result queryHotBlog(Integer current) {
        // 根据用户查询
        Page<Blog> page = query()
                .orderByDesc("liked")
                .page(new Page<>(current, SystemConstants.MAX_PAGE_SIZE));
        // 获取当前页数据
        List<Blog> records = page.getRecords();
        // 查询用户
        records.forEach(blog ->{
            queryBlogUser(blog);
            queryBlogIsLiked(blog);
        });
        return Result.ok(records);
    }

    /**
     * 博客点赞
     * @param id 博客id
     * @return
     */
    @Override
    public Result likeBlog(Long id) {
        //1、获取当前用户ID
        Long userId = UserHolder.getUser().getId();
        //2、查询用户的点赞信息
        String key = BLOG_LIKED_KEY + id;
        Double score = stringRedisTemplate.opsForZSet().score(key, userId.toString());
        if (score == null) {
            //3、若没点过赞
            //3.1、博客点赞数加一
            boolean isSuccess = update().setSql("liked = liked + 1").eq("id", id).update();
            if (isSuccess) {
                //3.2 将用户信息保存到Reids的set集合中
                stringRedisTemplate.opsForZSet().add(key,userId.toString(),System.currentTimeMillis());
            }
        }else {
            //4、若点过赞了
            //3.2、博客点赞数减一
            boolean isSuccess = update().setSql("liked = liked - 1").eq("id", id).update();
            //3.3 将用户从Reids的set集合中移除
            if (isSuccess) {
                stringRedisTemplate.opsForZSet().remove(key,userId.toString());
            }
        }
        return Result.ok();
    }

    /**
     * 返回当前博客已点赞的按时间先后的前五人
     * @param id
     * @return
     */
    @Override
    public Result queryBlogLikes(long id) {
        //1、返回top5
        String key = BLOG_LIKED_KEY + id;
        Set<String> top5 = stringRedisTemplate.opsForZSet().range(key, 0, 4);
        if (top5 == null || top5.isEmpty()) {
            return Result.ok(Collections.emptyList());
        }
        List<Long> ids = top5.stream().map(Long::valueOf).collect(Collectors.toList());
        String idStr = StrUtil.join(",", ids);
        //2、解析用户ID，查询用户信息
        List<UserDTO> userDTOList = userService.query()
                .in("id",ids).last("ORDER BY FIELD(id," + idStr + ")").list()
                .stream()
                .map(user -> BeanUtil.copyProperties(user, UserDTO.class))
                .collect(Collectors.toList());
        //3、封装用户信息并返回
        return Result.ok(userDTOList);
    }

    @Override
    public Result queryBlogById(long id) {
        //1、查询博客
        Blog blog = getById(id);

        //2、查询博客相关用户
        queryBlogUser(blog);
        queryBlogIsLiked(blog);
        return Result.ok(blog);
    }

    /**
     * 查询用户是否对某博客点过赞，设置isLiked字段
     * @param blog
     */
    private void queryBlogIsLiked(Blog blog) {
        //1、获取当前用户ID
//        Long userId = UserHolder.getUser().getId();
        UserDTO user = UserHolder.getUser();
        if (user == null) {
            //用户尚未登录
            return;
        }
        Long userId = user.getId();
        //2、查询用户的点赞信息
        String key = BLOG_LIKED_KEY + blog.getId();
        Double score = stringRedisTemplate.opsForZSet().score(key, userId.toString());

        //设置isLike字段
        blog.setIsLike(score != null);
    }

    /**
     * 设置博客中用户相关信息
     * @param blog
     */
    private void queryBlogUser(Blog blog) {
        Long userId = blog.getUserId();
        User user = userService.getById(userId);
        blog.setName(user.getNickName());
        blog.setIcon(user.getIcon());
    }
}
```

## 五、好友关注

### 5.1、关注和取关

在探店图文的详情页面中，可以关注发布笔记的作者：

![image-20241220113107813](https://gitee.com/cmyk359/img/raw/master/img/image-20241220113107813-2024-12-2011:31:16.png)



用户之间的关注是一个多对多关系，需要在数据库中新建一张表来记录 

![tb_follow](https://gitee.com/cmyk359/img/raw/master/img/image-20241220113315168-2024-12-2011:33:16.png)

基于该表数据结构，实现两个接口：

* 关注和取关接口
* 判断是否关注的接口

在用户执行关注操作时，将当前用户id和被关注用的id写入`tb_follow`，取关则删除该记录即可。

为了实现共同关注功能，即求两个用户所关注的交集，可以采用Reids的**set集合**存储各自关注用户的id，故在关注/取关进行数据库的新增/删除时同步在Reids的Set集合中做添加/删除操作。

FollowController

```java
@RestController
@RequestMapping("/follow")
public class FollowController {

    @Resource
    private IFollowService followService;

    /**
     * 关注/取关
     * @param followUserId 要关注/取关的博主的id
     * @param isFollow  true为关注，false为取关
     * @return
     */
    @PutMapping("/{id}/{isFollow}")
    public Result follow(@PathVariable("id") long followUserId, @PathVariable("isFollow") Boolean isFollow) {
       return followService.follow(followUserId,isFollow);
    }

    /**
     * 判断是否关注了某人
     * @param followUserId 
     * @return
     */
    @GetMapping("/or/not/{id}")
    public Result isFollow(@PathVariable("id") long followUserId) {
        return followService.isFollow(followUserId);
    }

}
```

FollowServiceImpl

```java
@Override
public Result isFollow(long followUserId) {
    //1、获得当前用户id
    Long id = UserHolder.getUser().getId();
    //2、查询数据库 select count(*) from tb_follow where user_id = ? and follow_user_id = ?
    Integer count = query().eq("user_id", id).eq("follow_user_id", followUserId).count();
    return Result.ok(count > 0);
}

@Override
public Result follow(long followUserId, Boolean isFollow) {
    //1、获得当前用户id
    Long id = UserHolder.getUser().getId();
    //2、判断是关注还是取关
    if (isFollow) {
        //关注，新增数据
        Follow follow = new Follow();
        follow.setUserId(id);
        follow.setFollowUserId(followUserId);
        save(follow);
    } else {
        //取关，删除数据 delete from tb_follow where user_id = ? and follow_user_id = ?
        remove(new QueryWrapper<Follow>()
                .eq("user_id", id).eq("follow_user_id", followUserId));
    }
    return Result.ok();
}
```



### 5.2、共同关注

由于之前将每个用户关注的用户id存入Redis的set集合中，故可以使用Set的`SINTER`命令求两个的集合的交集，查询相关用户信息并返回即可。

<img src="https://gitee.com/cmyk359/img/raw/master/img/共同好友-2024-12-2015:19:16.png" alt="共同好友" style="zoom:67%;" />

FollowController

```java
/**
 * 获取当前用户和指定用户的共同好友
 * @param id
 * @return
 */
@GetMapping("/common/{id}")
public Result followCommons(@PathVariable("id") Long id) {
    return followService.followCommons(id);
}
```

FollowServiceImpl

```java
@Override
public Result followCommons(Long id) {
    //1、获取当前用户id
    Long userId = UserHolder.getUser().getId();
    //2、求交集
    String key1 = "follows:" + userId;
    String key2 = "follows:" + id;
    Set<String> commonUserSet = stringRedisTemplate.opsForSet().intersect(key1, key2);
    if (commonUserSet == null || commonUserSet.isEmpty()) {
        // 无交集,五共同好友
        return Result.ok(Collections.emptyList());
    }
    //4、解析id集合
    List<Long> idList = commonUserSet.stream()
            .map(Long::valueOf)
            .collect(Collectors.toList());
    //3、查询相关用户，返回结果
    List<UserDTO> users = userService.listByIds(idList).stream()
            .map(user -> BeanUtil.copyProperties(user, UserDTO.class))
            .collect(Collectors.toList());
    return Result.ok(users);
}
```



### 5.3、关注推送

实现效果如下，在个人主页查看所关注用户发布的文章。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241220154737283-2024-12-2015:47:44.png" alt="image-20241220154737283" style="zoom:67%;" />

#### Feed流

关注推送也叫做**Feed流**，直译为投喂。为用户持续的提供“沉浸式”的体验，通过无限下拉刷新获取新的信息。

Feed流产品有两种常见模式：

- **Timeline**：不做内容筛选，简单的按照内容发布时间排序，常用于好友或关注。例如朋友圈
  - 优点：信息全面，不会有缺失。并且实现也相对简单
  - 缺点：信息噪音较多，用户不一定感兴趣，内容获取效率低

- **智能排序**：利用智能算法屏蔽掉违规的、用户不感兴趣的内容。推送用户感兴趣信息来吸引用
  - 优点：投喂用户感兴趣信息，用户粘度很高，容易沉迷
  - 缺点：如果算法不精准，可能起到反作用

本例中的个人页面，是基于关注的好友来做Feed流，因此采用**Timeline**的模式。该模式的实现方案有三种：**拉模式**、**推模式**、**推拉结合**

- 拉模式

  拉模式也叫做读扩散。消息的发布者将消息发布到各自的发件箱，已关注者查看最新消息时从对应的发件箱拉取。

  优点：节省内存空间，消息读完后可直接丢弃，需要时再次拉取。

  缺点：延时较高，由于读取时都要重写拉取排序，写操作耗时较长。

  ![image-20241220154931662](https://gitee.com/cmyk359/img/raw/master/img/image-20241220154931662-2024-12-2015:49:32.png)

- 推模式

  推模式也叫做写扩散。消息发布者会将最新消息直接推送到所有粉丝的收件箱中。

  优点：时效快，不用临时拉取

  缺点：内存压力大。需要将消息写到每个粉丝的收件箱。

  ![image-20241220155249206](https://gitee.com/cmyk359/img/raw/master/img/image-20241220155249206-2024-12-2015:52:50.png)

- 推拉结合

  推拉结合模式：也叫做读写混合，兼具推和拉两种模式的优点。

  这种方式需要根据活跃程度对用户进行划分。对于活跃粉丝，使用推模式直接将消息写到其收件箱中，保证频繁读取时的速度；对于普通粉丝，使用拉模式，将消息存储在发件箱中，用户主动查看时再进行拉取。

  ![image-20241220160134799](https://gitee.com/cmyk359/img/raw/master/img/image-20241220160134799-2024-12-2016:01:36.png)

三种方案对比之下，采用<u>推模式</u>实现本项目的消息推送。

![image-20241220160527989](https://gitee.com/cmyk359/img/raw/master/img/image-20241220160527989-2024-12-2016:05:29.png)



#### 功能实现

需求：

* 修改新增探店笔记的业务，在保存blog到数据库的同时，推送到粉丝的收件箱
* 收件箱满足可以根据时间戳排序，必须用Redis的数据结构实现
* 查询收件箱数据时，可以实现分页查询

由于博客内容已在MySQL中保存，只需将博客的id存入Reids。

Redis的`List`和`SortedSet`都具有排序的功能，但是要实现Feed流的分页查询只能使用`SortedSet`。

Feed流中的数据会不断更新，所以数据的角标也在变化，若使用`List`结果作为收件箱，当新消息到来，旧消息的角标会发生变化，出现重复读取消息的情况。

![image-20241220161718259](https://gitee.com/cmyk359/img/raw/master/img/image-20241220161718259-2024-12-2016:17:19.png)

因此不能采用传统的分页模式，而要采用滚动分页模式。**滚动分页查询**‌：通过维护一个滚动上下文（Scroll Context）来记录当前读取的数据位置（最后一条消息的id），下一页读取时从指定id后继续读取即可。

![image-20241220162312526](https://gitee.com/cmyk359/img/raw/master/img/image-20241220162312526-2024-12-2016:23:14.png)

综上应使用`SortedSet`结构作为收件箱，score值为博客文章发布时的时间戳，消息按时间戳排序，时间戳越大，表示当前消息越新。读取每一页时，使用`ZREVRANGEBYSCORE`命令，按score降序排序后，在指定的`score`范围内，读取count个元素，可以通过`offset`字段指定在该范围内读取的起始位置。对应的Redis命令如下：

```bash
ZREVRANGEBYSCORE key max min [WITHSCORES] [LIMIT offset count]
```

![image-20241220191847306](https://gitee.com/cmyk359/img/raw/master/img/image-20241220191847306-2024-12-2019:18:48.png)

其中

- max：第一次读取时设置为当前时间戳，之后为**上一次查询的最小时间戳**
- min：取0即可
- offset：第一次读取设置为0，之后设置为 **与上次最小时间戳相等的元素个数**（跳过重复数据）
- count：一页包含的记录数



此方案每次读取下一页都是从上次最后一条记录后读取，不受角标的影响。

![image-20241220222418873](https://gitee.com/cmyk359/img/raw/master/img/image-20241220222418873-2024-12-2022:24:56.png)



代码实现：

1、修改新增探店笔记的业务，在保存blog到数据库的同时，推送到粉丝的收件箱

BlogServiceImpl

```java
@Override
public Result saveBlog(Blog blog) {
    //1、 获取登录用户
    UserDTO user = UserHolder.getUser();
    blog.setUserId(user.getId());
    //2、 保存探店博文
    boolean isSuccess = save(blog);
    if (!isSuccess) {
        return Result.fail("新增笔记失败！");
    }
    //3、获取粉丝列表,follow_user_id 等于当前用户id的都是粉丝
    List<Follow> followList = followService.query().eq("follow_user_id", user.getId()).list();
    //4、推送笔记id给所有粉丝
    for (Follow follow : followList) {
        //获取粉丝id
        Long userId = follow.getUserId();
        //保存到SortedSet key为 feed:用户id，value为博客id，score为当前时间戳
        String key = FEED_KEY + userId;
        stringRedisTemplate.opsForZSet()
                .add(key,blog.getId().toString(),System.currentTimeMillis());
    }
    // 5.返回id
    return Result.ok(blog.getId());
}
```



2、笔记分页查询结果的实体类

```java
@Data
public class ScrollResult {
    private List<?> list;
    private Long minTime;
    private Integer offset;
}
```



4、新增分页查询笔记列表接口

BlogController

```java
/**
 * 分页查询笔记
 * @param max
 * @param offset
 * @return
 */
@GetMapping("/of/follow")
public Result queryBlogOfFollow(
        @RequestParam("lastId") Long max,
        @RequestParam(value = "offset",defaultValue = "0") Integer offset
) {
    return blogService.queryBlogOfFollow(max,offset);
}
```



3、采用滚动式分页查询返回笔记列表

BlogServiceImpl

```java
@Override
public Result queryBlogOfFollow(Long max, Integer offset) {
    //1、获取当前用户
    Long userId = UserHolder.getUser().getId();
    //2、查询收件箱 ZREVRANGEBYSCORE key Max Min LIMIT offset count
    String key = FEED_KEY + userId;
    //TypeTuple对应Set集合的元素，其中保存着value和score
    Set<ZSetOperations.TypedTuple<String>> typedTuples = stringRedisTemplate
            .opsForZSet()
            .reverseRangeByScoreWithScores(key, 0, max, offset, 2);
    if (typedTuples == null || typedTuples.isEmpty()) {
        return Result.ok();
    }
    // 4.解析数据：blogId、minTime（时间戳）、offset
    List<Long> ids = new ArrayList<>(typedTuples.size());
    long minTime = 0;
    int os = 1;
    for (ZSetOperations.TypedTuple<String> tuple : typedTuples) {
        // 4.1.获取id
        ids.add(Long.valueOf(tuple.getValue()));
        // 4.2.获取分数(时间戳）
        long time = tuple.getScore().longValue();
        if(time == minTime){
            os++; //score值与最小时间戳相同的元素个数，最后跳过这些重复元素
        }else{
            minTime = time;
            os = 1;
        }
    }
    os = minTime == max ? os : os + offset;
    //4、查询Blog
    String idStr = StrUtil.join(",", ids);
    List<Blog> blogList = query().in("id", ids).last("ORDER BY FIELD(id," + idStr + ")").list();
    for (Blog blog : blogList) {
        // 4.1.查询blog有关的用户
        queryBlogUser(blog);
        // 4.2.查询blog是否被点赞
        queryBlogIsLiked(blog);
    }
    //5、封装数据并返回
    ScrollResult r = new ScrollResult();
    r.setList(blogList);
    r.setOffset(os);
    r.setMinTime(minTime);
    return Result.ok(r);
}
```



## 六、附近的商户

> Redis的GeoHash的应用

### 6.1、Redis GEO

GEO就是Geolocation的简写形式，代表地理坐标。Redis在3.2版本中加入了对GEO的支持，允许存储地理坐标信息，帮助我们根据经纬度来检索数据。常见的命令有：

* `GEOADD`：添加一个地理空间信息，包含：经度（longitude）、纬度（latitude）、值（member）

  ![GEOADD](https://gitee.com/cmyk359/img/raw/master/img/image-20241222140220121-2024-12-2214:02:48.png)

* `GEODIST`：计算指定的两个点之间的距离并返回

* `GEOHASH`：将指定member坐标转为hash字符串形式并返回

* `GEOPOS`：返回指定member的坐标

* `GEORADIUS`：指定圆心、半径，找到该圆内包含的所有member，并按照与圆心之间的距离排序后返回。6.2以后已废弃

* `GEOSEARCH`：在指定范围内搜索member，并按照与指定点之间的距离排序后返回。范围可以是圆形或矩形。6.2.新功能

  ![GEOSEARCH](https://gitee.com/cmyk359/img/raw/master/img/image-20241222135219824-2024-12-2213:52:38.png)

* `GEOSEARCHSTORE`：与GEOSEARCH功能一致，不过可以把结果存储到一个指定的key。 6.2.新功能

```bash
#练习：
# 	1.添加下面几条数据：
#		北京站（116.42803 39.903738）
#		北京南站（116.378248 39.865275）
#		北京西站（116.322287 39.893729）
#	2.计算北京西站到北京站的距离
#	3，搜索天安门（116.397904 39.909005）附近10km内的所有火车站，并按照距离升序排序
127.0.0.1:6379> GEOADD g1  116.42803 39.903738 bjz  116.378248 39.865275 bjn 116.322287 39.893729 bjx  
(integer) 3
127.0.0.1:6379> GEODIST g1 bjx bjz  #距离默认以m为单位
"9091.5648"
127.0.0.1:6379> GEODIST g1 bjx bjz km  
"9.0916"
127.0.0.1:6379> GEOSEARCH g1 FROMLONLAT 116.397904 39.909005 BYRADIUS 10 km  ASC WITHDIST
1) 1) "bjz"
   2) "2.6361"
2) 1) "bjn"
   2) "5.1452"
3) 1) "bjx"
   2) "6.6723"

```

> GEO是用ZSet实现的，可以使用Zset的命令操作GEO

### 6.2、导入店铺数据到GEO

在首页中点击某个频道，即可看到频道下的商户：

![image-20241222135744125](https://gitee.com/cmyk359/img/raw/master/img/image-20241222135744125-2024-12-2213:58:07.png)

由于要基于商户类型`typeId`展示对应商铺，所以可按照商户类型做分组，类型相同的商户作为同一组，以typeld 为key存入同一个GEO集合中。GEO中存入的是每个店铺的经度、纬度，和**店铺ID**。



```java
@Test
public void loadShop2GEO() {
    //1、获取所有店铺
    List<Shop> shops = shopService.list();
    //2、根据typeID分组,typeId一致的放到一个集合
    Map<Long, List<Shop>> collect = shops.stream().collect(Collectors.
    //3、分批写入Redis
    for (Map.Entry<Long, List<Shop>> entry : collect.entrySet()) {
        //3.1 获取类型id
        Long typeId = entry.getKey();
        String key = SHOP_GEO_KEY + typeId;
        //3.2 获取对应店铺集合
        List<Shop> shopList = entry.getValue();
        List<RedisGeoCommands.GeoLocation<String>> locations = new Arr
        //3.3将各个店铺的经纬度封装在一个GEOLocation中，一次完成所有写入
        for (Shop shop : shopList) {
            locations.add(new RedisGeoCommands.GeoLocation<>(
                    shop.getId().toString(),
                    new Point(shop.getX(), shop.getY())
            ));
        }
        //3.4、写入Redis  GEOADD key 经度 纬度 member
        stringRedisTemplate.opsForGeo().add(key ,locations);
    }
}
```

![image-20241222142414209](https://gitee.com/cmyk359/img/raw/master/img/image-20241222142414209-2024-12-2214:25:03.png)

### 6.3、实现附近商户功能

接口和参数如下：

![image-20241222143610371](https://gitee.com/cmyk359/img/raw/master/img/image-20241222143610371-2024-12-2214:36:31.png)

1、当前的SpringDataRedis的2.3.9版本并不支持Redis 6.2提供的GEOSEARCH命令，因此我们需要提示其版本，修改自己的`POM.xml`文件

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
    <exclusions>
        <exclusion>
            <artifactId>spring-data-redis</artifactId>
            <groupId>org.springframework.data</groupId>
        </exclusion>
        <exclusion>
            <artifactId>lettuce-core</artifactId>
            <groupId>io.lettuce</groupId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.springframework.data</groupId>
    <artifactId>spring-data-redis</artifactId>
    <version>2.6.2</version>
</dependency>
<dependency>
    <groupId>io.lettuce</groupId>
    <artifactId>lettuce-core</artifactId>
    <version>6.1.6.RELEASE</version>
</dependency>
```

2、ShopController

```java
    /**
     * 根据商铺类型分页查询商铺信息
     * @param typeId 商铺类型
     * @param current 页码
     * @return 商铺列表
     */
    @GetMapping("/of/type")
    public Result queryShopByType(
            @RequestParam("typeId") Integer typeId,
            @RequestParam(value = "current", defaultValue = "1") Integer current,
            @RequestParam(value = "x", required = false) Double x,
            @RequestParam(value = "y", required = false) Double y
    ) {

        return shopService.queryShopByType(typeId,current,x,y);
    }
```

3、ShopServiceImpl

```java
@Override
public Result queryShopByType(Integer typeId, Integer current, Double x, Double y) {
   log.info("current:{}",current);
    //1、判断需不需要根据坐标查询
    if (x == null || y == null) {
        //不需要按坐标查询，直接查询数据库
        // 根据类型分页查询
        Page<Shop> page = query()
                .eq("type_id", typeId)
                .page(new Page<>(current, DEFAULT_PAGE_SIZE));
        // 返回数据
        return Result.ok(page.getRecords());
    }
    
    //2、计算分页参数
    int from = (current - 1) * DEFAULT_PAGE_SIZE;
    int end = current * DEFAULT_PAGE_SIZE;
    
    //3、查询Redis，按照距离排序、分页。结果：shopId、distance
    String key = SHOP_GEO_KEY + typeId;
    //查询以指定经纬度为圆心半径五公里的商铺
    GeoResults<RedisGeoCommands.GeoLocation<String>> results = stringRedisTemplate.opsForGeo().search(
            key,
            GeoReference.fromCoordinate(x, y),
            new Distance(5000),
            //GEO的分页无法指定起始位置，只能从头读取指定条，此处先读取end条，之后再手动截取
            RedisGeoCommands.GeoSearchCommandArgs.newGeoSearchArgs().includeDistance().limit(end));
    if (results == null) {
        //五公里内没有店铺
        return Result.ok(Collections.emptyList());
    }
    
    //4、解析出店铺id及店铺距离
    List<GeoResult<RedisGeoCommands.GeoLocation<String>>> list = results.getContent();
    if (list.size() <= from) {
        // 没有下一页了，结束
        return Result.ok(Collections.emptyList());
    }
    //此时list中保存的是0 ~ end范围内的店铺，需要返回的是 from ~ end 范围内的店铺
    //4.1跳过前面的from条，截取 from ~ end内的
    ArrayList<Long> ids = new ArrayList<>(list.size());
    HashMap<String, Distance> distanceMap = new HashMap<>(list.size());
    if (list.size() <= from) {
        // 没有下一页了，结束
        return Result.ok(Collections.emptyList());
    }
    list.stream().skip(from).forEach(result ->{
        //4.2、获取对应的店铺id
        String shopIdStr = result.getContent().getName();
        ids.add(Long.valueOf(shopIdStr));
        //4.3、获取对应店铺的距离
        Distance distance = result.getDistance();
        distanceMap.put(shopIdStr,distance);
    });
    
    //5、根据id查询商铺
    String idStr = StrUtil.join(",", ids);
    List<Shop> shopList = query().in("id", ids).last("ORDER BY FIELD ( id," + idStr + ")").list();
    for (Shop shop : shopList) {
        //设置店铺距离字段
        shop.setDistance(distanceMap.get(shop.getId().toString()).getValue());
    }
    
    //6、返回结果
    return Result.ok(shopList);
}
```



## 七、用户签到

> Redis的BitMap数据统计功能

### 7.1、BitMap

按月来统计用户签到信息，签到记录为1，未签到则记录为0.

![image-20241222153836975](https://gitee.com/cmyk359/img/raw/master/img/image-20241222153836975-2024-12-2215:39:07.png)

位图（BitMap）的核心思想就是**将比特位与某种业务状态进行映射**。此处把每一个bit位对应当月的每一天，形成了映射关系。用0和1标示业务状态。

Redis中是利用**string类型**数据结构实现**BitMap**，因此最大上限是512M，转换为bit则是 2^32个bit位。

BitMap的操作命令有：

* [SETBIT](https://redis.io/docs/latest/commands/setbit/)：向指定位置（offset）存入一个0或1

* [GETBIT ](https://redis.io/docs/latest/commands/getbit/)：获取指定位置（offset）的bit值 （**只能查询一位bit值**）

* [BITCOUNT ](https://redis.io/docs/latest/commands/bitcount/)：统计BitMap中值为1的bit位的数量

* [BITFIELD ](https://redis.io/docs/latest/commands/bitfield/)：操作（查询、修改、自增）BitMap中bit数组中的指定位置（offset）的值（多用作查询，**一次可查询多个bit位的值**）

  ```bash
  BITFIELD key [GET type offset] [SET type offset value] [INCRBY type offset increment] [OVERFLOW WRAP|SAT|FAIL]
  ```

  `key`：要操作的位图的键。

	`GET type offset`：获取指定位置的数值。

    - `type`：指定**数值类型**和**要读取的位数**，如 `u8`（无符号的8位整数）、`u16`（无符号16位整数）、`i16`（有符号16位整数）、`i32`（有符号32位整数）。
  - `offset`：位偏移量，从0开始。
  
* [BITFIELD_RO ](https://redis.io/docs/latest/commands/bitfield_ro/)：获取BitMap中bit数组，并以十进制形式返回

* [BITOP ](https://redis.io/docs/latest/commands/bitop/)：将多个BitMap的结果做位运算（与 、或、异或）

* [BITPOS ](https://redis.io/docs/latest/commands/bitpos/)：查找bit数组中指定范围内第一个0或1出现的位置

### 7.2、实现签到功能

实现签到接口，将<u>当前用户</u> <u>当天</u> 的签到信息保存到Redis中

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241222201057612-2024-12-2220:11:07.png" alt="image-20241222201057612" style="zoom:80%;" />

可以把<u>用户ID、年和月</u>作为bitMap的key，然后保存到一个bitMap中，每次签到就到对应的位上把数字从0变成1，只要对应是1，就表明说明这一天已经签到了，反之则没有签到。

> 注：因为BitMap底层是基于String数据结构，因此其操作也都封装在字符串相关操作中了。
>
> ![image-20241222201249198](https://gitee.com/cmyk359/img/raw/master/img/image-20241222201249198-2024-12-2220:13:05.png)



UserController

```java
 @PostMapping("/sign")
 public Result sign(){
    return userService.sign();
 }
```



UserServiceImpl

```java
@Override
public Result sign() {
    //1、获取当前用户
    Long userId = UserHolder.getUser().getId();
    //2、获取当前年和月，以及当天是这个月的第几天
    LocalDateTime now = LocalDateTime.now();
    String date = now.format(DateTimeFormatter.ofPattern(":yyyyMM"));
    int dayOfMonth = now.getDayOfMonth();
    //3、拼接key
    String key = USER_SIGN_KEY + userId + date;
    //4、写入redis  SETBIT key offset 1
    stringRedisTemplate.opsForValue().setBit(key,dayOfMonth - 1,true);
    return Result.ok();
}
```



### 7.4、签到统计

普通签到统计：使用`BITCOUNT`统计1出现的次数即为当前月的签到次数。

连续签到天数统计：从最后一次签到开始向前统计，直到遇到第一次未签到为止，计算总的签到次数。

需求：统计当前用户截止当前时间在本月的连续签到天数。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241222203728355-2024-12-2220:37:31.png" alt="image-20241222203728355" style="zoom:80%;" />

思路：获取本月截止今天为止的所有的签到记录，结果是一个十进制数字。将该数字 和 1 相与，每次得到最低位的比特。判断是不是0，若是0，则返回已统计的次数；判断是不是 1，若是1则签到次数加一，同时该数字右移一位，继续下一次判断。



UserController

```java
/**
 * 返回截止当天，本月用户的连续签到次数
 * @return
 */
@GetMapping("/sign/count")
public Result getSignCount() {
    return userService.getSignCount();
}
```

UserServiceImpl

```java
@Override
public Result getSignCount() {
    //1、获取当前用户
    Long userId = UserHolder.getUser().getId();
    //2、获取当前年和月，以及当天是这个月的第几天
    LocalDateTime now = LocalDateTime.now();
    String date = now.format(DateTimeFormatter.ofPattern(":yyyyMM"));
    int dayOfMonth = now.getDayOfMonth();
    //3、拼接key
    String key = USER_SIGN_KEY + userId + date;
    //4、获取截止当天，用户本月的签到记录 bitfield sign:1010:202412 get u22 0
    List<Long> result = stringRedisTemplate.opsForValue().bitField(
            key,
            BitFieldSubCommands.create()
                    //执行bitfield的get方法，从0开始返回 （dayOfMonth）位无符号数
                    .get(BitFieldSubCommands.BitFieldType.unsigned(dayOfMonth)).valueAt(0)
    );
    //该命令可以做多个操作，返回结果是一个集合
    if (result == null || result.isEmpty()) {
        //没有签到记录
        return Result.ok(0);
    }
    Long signHistory = result.get(0);
    if (signHistory == 0) {
        //没有签到记录
        return Result.ok(0);
    }
    //5、循环遍历
    int count = 0;
    while (true) {
        //5.1 让这个数字与1做与运算，得到数字的最后一个bit位进行判断
        if ((signHistory & 1) == 0)  {
            // 如果为0，说明未签到，结束
            break;
        } else  {
            // 如果不为0，说明已签到，计数器+1
            count ++;
            // 无符号右移 >>>
            signHistory >>>= 1;
        }
    }
    //6、返回连续签到次数
    return Result.ok(count);
}
```

补充：使用bitMap解决缓存穿透，[布隆过滤器](https://catpaws.top/e0606bbf/#缓存穿透)

## 八、UV（网页的访问量）统计

> Redis的HyperLogLog的统计功能

两个概念

* UV：全称Unique Visitor，也叫独立访客量，是指通过互联网访问、浏览这个网页的自然人。1天内同一个用户多次访问该网站，只记录1次。
* PV：全称Page View，也叫页面访问量或点击量，用户每访问网站的一个页面，记录1次PV，用户多次打开页面，则记录多次PV。往往用来衡量网站的流量。

UV统计在服务端做会比较麻烦，因为要判断该用户是否已经统计过了，需要将统计过的用户信息保存。但是如果每个访问的用户都保存到Redis中，数据量会非常恐怖。

### 8.1、HyperLogLog

​	Redis中的HyperLogLog是一种用于基数统计的数据结构，它允许在非常小的内存空间内估计一个集合中**不重复元素的数量**。

特点

1. ‌**内存占用小**‌：每个HyperLogLog键只需要12KB的内存，就可以计算接近264个不同元素的基数。

2. ‌**适用于大数据集**‌：在处理海量数据时，HyperLogLog能够高效地估计集合的基数，而不需要存储集合中的所有元素。

3. ‌**不精确但误差小**‌：由于HyperLogLog是基于概率的算法，因此它的估计结果不是完全准确的，但误差通常很小，标准误算率是0.81%。

   

Redis为HyperLogLog提供了三个命令：

- ‌**PFADD key element [element ...]**‌：向指定的HyperLogLog添加一个或多个元素。
- ‌**PFCOUNT key [key ...]**‌：返回给定HyperLogLog的基数估算值。如果作用于多个键，则返回所有给定HyperLogLog的并集的近似基数。
- ‌**PFMERGE destkey sourcekey [sourcekey ...]**‌：将多个HyperLogLog合并为一个HyperLogLog。

### 8.2、测试百万条数据的统计效果

直接利用单元测试，向HyperLogLog中添加100万条数据，看看内存占用和统计效果如何

```bash
#查看当前redis内存使用情况
127.0.0.1:6379> info memory
# Memory
used_memory:1681168 #当前内存占用为 1681168 字节
used_memory_human:1.60M
used_memory_rss:2818048

```



```java
    @Test
    public  void testHyperLogLog() {
        String[] values = new String[1000];
        int j = 0;
        for (int i = 0; i < 1000000; i++) {
            j = i % 1000;
            values[j] = "user_"+ i;
            if (j == 999) {
                // 存入redis
                stringRedisTemplate.opsForHyperLogLog().add("hl1",values);
            }
        }
        //统计数量
        Long count = stringRedisTemplate.opsForHyperLogLog().size("hl1");
        System.out.println("count = " + count);
    }
```

![image-20241222214308050](https://gitee.com/cmyk359/img/raw/master/img/image-20241222214308050-2024-12-2221:44:07.png)

再次查看内存情况

```bash
127.0.0.1:6379> info memory
# Memory
used_memory:1695584
used_memory_human:1.62M
```

内存使用：1695584 - 1681168  = 14416B = 14.08KB