---
title: 函数式编程-Stream流
tags:
  - Stream流
  - 函数式编程
categories:
  - JavaSE
abbrlink: 146f67fb
index_img: 'https://catpaws.top/blog-resource/imgs/art-post3.jpg'
date: 2024-12-09 11:04:20
---

<meta name = "referrer", content = "no-referrer"/>


# 一、 概述

## 1.1 为什么学？

Stream流大量的结合了Lambda的语法风格来编程，提供了一种更加强大，更加简单的方式操作集合或者数组中的数据，代码更简洁，可读性更好。

- 大数量下处理集合效率高
- 代码可读性高
- 消灭嵌套地狱

~~~~java
//查询未成年作家的评分在70以上的书籍 由于洋流影响所以作家和书籍可能出现重复，需要进行去重
List<Book> bookList = new ArrayList<>();
Set<Book> uniqueBookValues = new HashSet<>();
Set<Author> uniqueAuthorValues = new HashSet<>();
for (Author author : authors) {
    if (uniqueAuthorValues.add(author)) {
        if (author.getAge() < 18) {
            List<Book> books = author.getBooks();
            for (Book book : books) {
                if (book.getScore() > 70) {
                    if (uniqueBookValues.add(book)) {
                        bookList.add(book);
                    }
                }
            }
        }
    }
}
System.out.println(bookList);
~~~~

~~~~java
List<Book> collect = authors.stream()
    .distinct()
    .filter(author -> author.getAge() < 18)
    .map(author -> author.getBooks())
    .flatMap(Collection::stream)
    .filter(book -> book.getScore() > 70)
    .distinct()
    .collect(Collectors.toList());
System.out.println(collect);
~~~~



## 1.2 函数式编程思想

​	面向对象思想需要关注用什么对象完成什么事情。而函数式编程思想就类似于我们数学中的函数。它主要关注的是对数据进行了什么操作。

优点：

* 代码简洁，开发快速
* 接近自然语言，易于理解
* 易于"并发编程"



# 二、 Lambda表达式

[Lambad表达式详解](https://blog.csdn.net/weixin_45082647/article/details/106991685)

## 2.1 概述

​	Lambda是JDK8中一个语法糖。他可以对某些匿名内部类的写法进行简化（原则：是接口的匿名内部类，且接口中只有一个待重写的抽象方法）。它是函数式编程思想的一个重要体现。让我们不用关注是什么对象。而是更关注我们对数据进行了什么操作。

核心原则：可推导可省略。

## 2.2 四大内置核心函数式接口

在Java 8中，引入了四个核心的函数式接口，这些接口极大地简化了代码的编写，并且能够满足大部分的编程需求。

Java8中内置四大核心函数式接口如下：
![](https://i-blog.csdnimg.cn/blog_migrate/c443ac5e807bff05714384cbdf58eff2.png)

除了上面那四大接口之外，还提供了几个其他的接口供使用。这些接口已经能够覆盖大部分的场景了。
![](https://i-blog.csdnimg.cn/blog_migrate/ec99dc0d2ec039d44386d9cedfd73718.png)

### **消费型接口 (Consumer)**

`Consumer<T>`接口接受一个输入参数并且无返回值。它常用于执行某些操作，例如打印、发送消息等**不需要返回结果**的操作。

主要方法：`void accept(T t)`

源码：

```java
@FunctionalInterface
public interface Consumer<T> {
    // 该函数式接口的唯一的抽象方法，接收一个参数，没有返回值
    void accept(T t);
 
   // 在执行完调用者方法后再执行传入参数的方法
    default Consumer<T> andThen(Consumer<? super T> after) {
        Objects.requireNonNull(after);
        return (T t) -> { accept(t); after.accept(t); };
    }
}
```

示例：

```java
@Test
public void testConsumer() {
    // 在accept方法中打印输入值加2的结果
	handle(6, (x) -> System.out.println(x + 2));
}

public void handle(int value, Consumer<Integer> consumer) {
	consumer.accept(value);
}
```

### **供给型接口 (Supplier)**

`Supplier<T>`接口无输入参数，返回一个结果。它常用于延迟计算、对象工厂、获取配置值等 **需要生成结果**的操作

主要方法：`T get()`

源码：

```java
@FunctionalInterface
public interface Supplier<T> {
    T get();
}
```

示例：

```java
@Test
public void testSupplier() {
	Person person = Person.builder().name("供给者").build();
    //获取一个人的名字
	System.out.println(getObject(() -> person.getName()));
}

public String getObject(Supplier<String> supplier) {
	return supplier.get();
}
```

### **函数型接口 (Function)**

`Function<T, R>`接口接受一个输入参数，返回一个结果。它常用于数据类型转换、数据加工、链式处理等 **需要转换或计算**的操作。

主要方法：`R apply(T t)`

示例：

```java
@Test
public void testFunction() {
    //将输入值加2并返回结果
	int result = plusTwo(6, (x) -> x + 2);
	System.out.println(result);
}

public Integer plusTwo(int origen, Function<Integer, Integer> function) {
	return function.apply(origen);
}
```

### **断言型接口 (Predicate)**

`Predicate<T>`接口接受一个输入参数，返回一个布尔值结果。它常用于条件过滤、数据校验、规则匹配等 **需要判断真假**的操作。

主要方法：`boolean test(T t)`

源码：

```java
@FunctionalInterface
public interface Predicate<T> {
    boolean test(T t);
 
    // 返回值为已实现Predicate接口抽象方法的类
    default Predicate<T> and(Predicate<? super T> other) {
        Objects.requireNonNull(other);
        return (t) -> test(t) && other.test(t);
    }
 
    default Predicate<T> negate() {
        return (t) -> !test(t);
    }
 
    default Predicate<T> or(Predicate<? super T> other) {
        Objects.requireNonNull(other);
        return (t) -> test(t) || other.test(t);
    }
 
    static <T> Predicate<T> isEqual(Object targetRef) {
        return (null == targetRef)
                ? Objects::isNull
                : object -> targetRef.equals(object);
    }
}
```

示例

```java
@Test
public void testPredicate() {
	boolean judge = judge(6, (x) -> (x & 1) != 1);
	System.out.println(judge);
}

public boolean judge(Integer input, Predicate<Integer> predicate) {
	return predicate.test(input);
}
```



在Predicate接口中进行判断条件时，可以通过`and`、`or`、`negate`方法构造更为复杂的条件：

- and

  我们在使用Predicate接口时候可能需要进行判断条件的拼接。而and方法相当于是使用&&来拼接两个判断条件

  例如：打印作家中年龄大于17并且姓名的长度大于1的作家。

  ~~~~java
        List<Author> authors = getAuthors();
          Stream<Author> authorStream = authors.stream();
          authorStream.filter(new Predicate<Author>() {
              @Override
              public boolean test(Author author) {
                  return author.getAge()>17;
              }
          }.and(new Predicate<Author>() {
              @Override
              public boolean test(Author author) {
                  return author.getName().length()>1;
              }
          })).forEach(author -> System.out.println(author));
  ~~~~
  
- or 

  我们在使用Predicate接口时候可能需要进行判断条件的拼接。而or方法相当于是使用||来拼接两个判断条件。

  例如：打印作家中年龄大于17或者姓名的长度小于2的作家。

  ~~~~java
//        打印作家中年龄大于17或者姓名的长度小于2的作家。
          List<Author> authors = getAuthors();
          authors.stream()
                  .filter(new Predicate<Author>() {
                      @Override
                      public boolean test(Author author) {
                          return author.getAge()>17;
                      }
                  }.or(new Predicate<Author>() {
                      @Override
                      public boolean test(Author author) {
                          return author.getName().length()<2;
                      }
                  })).forEach(author -> System.out.println(author.getName()));
  ~~~~
  
  

- negate

  Predicate接口中的方法。negate方法相当于是在判断添加前面加了个! 表示取反

  例如：打印作家中年龄不大于17的作家。

  ~~~~java
//        打印作家中年龄不大于17的作家。
          List<Author> authors = getAuthors();
          authors.stream()
                  .filter(new Predicate<Author>() {
                      @Override
                      public boolean test(Author author) {
                          return author.getAge()>17;
                      }
                  }.negate()).forEach(author -> System.out.println(author.getAge()));
  ~~~~
  

## 2.3 基本格式

~~~~java
(参数列表)->{代码}
~~~~

### 例一

我们在创建线程并启动时可以使用匿名内部类的写法：

~~~~java
new Thread(new Runnable() {
    @Override
    public void run() {
        System.out.println("你知道吗 我比你想象的 更想在你身边");
    }
}).start();
~~~~

可以使用Lambda的格式对其进行修改。修改后如下：

~~~~java
new Thread(()->{
    System.out.println("你知道吗 我比你想象的 更想在你身边");
}).start();
~~~~



### 例二

现有方法定义如下，其中IntBinaryOperator是一个接口。先使用匿名内部类的写法调用该方法。

~~~~java

    public static int calculateNum(IntBinaryOperator operator){
        int a = 10;
        int b = 20;
        return operator.applyAsInt(a, b);
    }

    public static void main(String[] args) {
        int i = calculateNum(new IntBinaryOperator() {
            @Override
            public int applyAsInt(int left, int right) {
                return left + right;
            }
        });
        System.out.println(i);
    }
~~~~

Lambda写法：

~~~~java
    public static void main(String[] args) {
        int i = calculateNum((int left, int right)->{
            return left + right;
        });
        System.out.println(i);
    }
~~~~

### 例三

现有方法定义如下，其中IntPredicate是一个接口。先使用匿名内部类的写法调用该方法。

~~~~java
    public static void printNum(IntPredicate predicate){
        int[] arr = {1,2,3,4,5,6,7,8,9,10};
        for (int i : arr) {
            if(predicate.test(i)){
                System.out.println(i);
            }
        }
    }
    public static void main(String[] args) {
        printNum(new IntPredicate() {
            @Override
            public boolean test(int value) {
                return value%2==0;
            }
        });
    }
~~~~

Lambda写法：

~~~~java
    public static void main(String[] args) {
        printNum((int value)-> {
            return value%2==0;
        });
    }
    public static void printNum(IntPredicate predicate){
        int[] arr = {1,2,3,4,5,6,7,8,9,10};
        for (int i : arr) {
            if(predicate.test(i)){
                System.out.println(i);
            }
        }
    }
~~~~



### 例四

现有方法定义如下，其中Function是一个接口。先使用匿名内部类的写法调用该方法。

~~~~java
    public static <R> R typeConver(Function<String,R> function){
        String str = "1235";
        R result = function.apply(str);
        return result;
    }
    public static void main(String[] args) {
        Integer result = typeConver(new Function<String, Integer>() {
            @Override
            public Integer apply(String s) {
                return Integer.valueOf(s);
            }
        });
        System.out.println(result);
    }
~~~~

Lambda写法：

~~~~java
        Integer result = typeConver((String s)->{
            return Integer.valueOf(s);
        });
        System.out.println(result);

~~~~



### 例五

现有方法定义如下，其中IntConsumer是一个接口。先使用匿名内部类的写法调用该方法。

~~~~java
    public static void foreachArr(IntConsumer consumer){
        int[] arr = {1,2,3,4,5,6,7,8,9,10};
        for (int i : arr) {
            consumer.accept(i);
        }
    }
    public static void main(String[] args) {
        foreachArr(new IntConsumer() {
            @Override
            public void accept(int value) {
                System.out.println(value);
            }
        });
    }
~~~~

Lambda写法：

~~~~java
    public static void main(String[] args) {
        foreachArr((int value)->{
            System.out.println(value);
        });
    }
~~~~



### 2.4 省略规则

* 参数类型可以省略
* 方法体只有一句代码时大括号、return和唯一一句代码的分号可以省略
* 方法只有一个参数时小括号可以省略
* 以上这些规则都记不住也可以省略不记

![image-20240601102040478](https://gitee.com/cmyk359/img/raw/master/img/image-20240601102040478-2024-6-110:20:53.png)

![image-20240601102217951](https://gitee.com/cmyk359/img/raw/master/img/image-20240601102217951-2024-6-110:22:18.png)



# 三、Stream流

## 3.1 概述

​	Java8的Stream使用的是函数式编程模式，如同它的名字一样，它可以被用来对**集合或数组**进行链状流式的操作。可以更方便的让我们对集合或数组操作。

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250209121112046-2025-2-912:11:17.png)

特点：

- 惰性求值：如果没有终结操作，没有中间操作是不会得到执行的
- 流是一次性的：一旦一个流对象经过一个终结操作后。这个流就不能再被使用
- <u>**非破坏性**</u>：Stream API 设计为对数据源进行一系列操作（如过滤、映射、排序等），然后生成一个新的流或结果，而不会更改原始数据

## 3.2 案例数据准备

[Demo地址](https://github.com/cmyk359/JavaStream_demo)

~~~~xml
    <dependencies>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.16</version>
        </dependency>
    </dependencies>
~~~~



~~~~java
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode//用于后期的去重使用
public class Author {
    //id
    private Long id;
    //姓名
    private String name;
    //年龄
    private Integer age;
    //简介
    private String intro;
    //作品
    private List<Book> books;
}
~~~~

~~~~java
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode//用于后期的去重使用
public class Book {
    //id
    private Long id;
    //书名
    private String name;

    //分类
    private String category;

    //评分
    private Integer score;

    //简介
    private String intro;

}
~~~~

~~~~java
    private static List<Author> getAuthors() {
        //数据初始化
        Author author = new Author(1L,"蒙多",33,"一个从菜刀中明悟哲理的祖安人",null);
        Author author2 = new Author(2L,"亚拉索",15,"狂风也追逐不上他的思考速度",null);
        Author author3 = new Author(3L,"易",14,"是这个世界在限制他的思维",null);
        Author author4 = new Author(3L,"易",14,"是这个世界在限制他的思维",null);

        //书籍列表
        List<Book> books1 = new ArrayList<>();
        List<Book> books2 = new ArrayList<>();
        List<Book> books3 = new ArrayList<>();

        books1.add(new Book(1L,"刀的两侧是光明与黑暗","哲学,爱情",88,"用一把刀划分了爱恨"));
        books1.add(new Book(2L,"一个人不能死在同一把刀下","个人成长,爱情",99,"讲述如何从失败中明悟真理"));

        books2.add(new Book(3L,"那风吹不到的地方","哲学",85,"带你用思维去领略世界的尽头"));
        books2.add(new Book(3L,"那风吹不到的地方","哲学",85,"带你用思维去领略世界的尽头"));
        books2.add(new Book(4L,"吹或不吹","爱情,个人传记",56,"一个哲学家的恋爱观注定很难把他所在的时代理解"));

        books3.add(new Book(5L,"你的剑就是我的剑","爱情",56,"无法想象一个武者能对他的伴侣这么的宽容"));
        books3.add(new Book(6L,"风与剑","个人传记",100,"两个哲学家灵魂和肉体的碰撞会激起怎么样的火花呢？"));
        books3.add(new Book(6L,"风与剑","个人传记",100,"两个哲学家灵魂和肉体的碰撞会激起怎么样的火花呢？"));

        author.setBooks(books1);
        author2.setBooks(books2);
        author3.setBooks(books3);
        author4.setBooks(books3);

        List<Author> authorList = new ArrayList<>(Arrays.asList(author,author2,author3,author4));
        return authorList;
    }
~~~~



## 3.3 快速入门

​	我们可以调用getAuthors方法获取到作家的集合。现在需要打印所有年龄小于18的作家的名字，并且要注意去重。

~~~~java
        //打印所有年龄小于18的作家的名字，并且要注意去重
        List<Author> authors = getAuthors();
        authors.stream()//把集合转换成流
                .distinct()//先去除重复的作家
                .filter(author -> author.getAge()<18)//筛选年龄小于18的
                .forEach(author -> System.out.println(author.getName()));//遍历打印名字
~~~~

![image-20240601154243071](https://gitee.com/cmyk359/img/raw/master/img/image-20240601154243071-2024-6-115:42:46.png)



## 3.4 创建流

### 获取**集合**的Stream流

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250209122026119-2025-2-912:20:29.png" style="zoom:80%;" />

- 单列集合

  ```java
  List<Author> authors = getAuthors();
  Stream<Author> stream = authors.stream();
  ```

- 双列集合

  `stream`方法是`Collection`接口提供的方法，`Map`接口及其实现类无法直接使用。

  但`Map`接口为了方便遍历，提供了`entrySet`视图，可以将map中的键值对封装在一个个键值对对象entry中，并放在Set集合中返回。也可以使用`keySet()`和`values()`方法单独获取map中键和值的集合。

  获取到这些集合后，就可以使用`Collecion`接口的`stream()`方法获取流

  ```java
  Map<String,Integer> map = new HashMap<>();
  map.put("蜡笔小新",19);
  map.put("黑子",17);
  map.put("日向翔阳",16);
  Set<String> keySet = map.keySet(); //获取键集合
  Collection<Integer> values = map.values(); // 获取值集合
  Set<Map.Entry<String, Integer>> entries = map.entrySet(); // 获取entry集合
  entries.stream()
          .filter(entry -> entry.getValue() > 16)
          .forEach(entry -> System.out.println(entry.getKey()+" ---"+entry.getValue()));
  ```

### 获取数组的Stream流

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250209123356836-2025-2-912:33:58.png" style="zoom:80%;" />

```java
Integer[] arr = {1,2,3,4,5};
Stream<Integer> stream = Arrays.stream(arr);
Stream<Integer> stream2 = Stream.of(arr);
```

## 3.5 中间操作

Java8的Stream中间操作可分为 **6大类**，每类操作均返回新Stream并支持链式调用，总结分类如下：

| **分类**   | **方法**                              | **特点**                     |
| ---------- | ------------------------------------- | ---------------------------- |
| 筛选与切片 | `filter`, `distinct`, `limit`, `skip` | 减少元素数量                 |
| 映射转换   | `map`, `flatMap`, `mapToXxx`          | 改变元素类型或结构           |
| 排序       | `sorted`                              | 调整元素顺序                 |
| 调试观察   | `peek`                                | 无状态副作用操作             |
| 状态操作   | `distinct`, `sorted`, `limit/skip`    | 依赖其他元素或需收集全部数据 |
| 特殊转换   | `boxed`, `parallel`, `sequential`     | 改变流类型或执行模式         |

### 筛选与切片

​	过滤或限制流中元素

#### filter

`filter(Predicate<T>)`：可以对流中的元素进行条件过滤，**符合过滤条件的才能继续留在流中**。

例如：打印所有姓名长度大于1的作家的姓名

~~~~java
//打印所有姓名长度大于1的作家的姓名
List<Author> authors = getAuthors();
authors.stream()
    .filter(new Predicate<Author>() {
        @Override
        //***返回一个布尔值，对流中的每个对象按条件进行筛选，符合条件的才保留***
        public boolean test(Author author) { 
            return author.getName().length() > 1; 
        }
    })
    .forEach(author -> System.out.println(author.getName()));

==========================lambda表达式简化写法===============================

List<Author> authors = getAuthors();
authors.stream()
    .filter(author -> author.getName().length()>1)
    .forEach(author -> System.out.println(author.getName()));
~~~~

![image-20240601155929817](https://gitee.com/cmyk359/img/raw/master/img/image-20240601155929817-2024-6-116:00:05.png)

#### distinct

`distinct()`:可以去除流中的重复元素，依赖`equals()`和`hashCode()`

例如：打印所有作家的姓名，并且要求其中不能有重复元素。

~~~~java
List<Author> authors = getAuthors();

authors.stream()
    .distinct()//对流中的元素，两两调用equals方法判断是否为同一个，若是则从流中去除一个
    .forEach(author -> System.out.println(author.getName()));
~~~~

![image-20240601162902927](https://gitee.com/cmyk359/img/raw/master/img/image-20240601162902927-2024-6-116:29:05.png)



**注意：distinct方法是依赖Object的equals方法来判断是否是相同对象的。所以需要注意重写equals方法。**Object默认的equals方法中默认使用 `==`判断两对象的地址是否相同来判断是否是同一个。而在业务中，当两个对象各个属性值都相同时，就可以判断为重复。

![image-20240601162319873](https://gitee.com/cmyk359/img/raw/master/img/image-20240601162319873-2024-6-116:24:05.png)

> 也可以在实体类上添加LomBok注解 `@EqualsAndHashCode`，会自动生成重写equals方法的代码



#### limit	

`limit(long maxSize)`，保留前N个元素。可以设置流的最大长度，超出的部分将被抛弃。

例如：对流中的元素按照年龄进行降序排序，并且要求不能有重复的元素,然后打印其中年龄最大的两个作家的姓名。

~~~~java
List<Author> authors = getAuthors();
authors.stream()
    .distinct()
    .sorted()
    .limit(2)
    .forEach(author -> System.out.println(author.getName()));
~~~~

![image-20240601183333481](https://gitee.com/cmyk359/img/raw/master/img/image-20240601183333481-2024-6-118:34:05.png)

#### skip

`skip(long n)`：跳过前N个元素，返回剩下的元素

例如：打印除了年龄最大的作家外的其他作家，要求不能有重复元素，并且按照年龄降序排序。

~~~~java
//打印除了年龄最大的作家外的其他作家，要求不能有重复元素，并且按照年龄降序排序。
List<Author> authors = getAuthors();
authors.stream()
    .distinct()
    .sorted()
    .skip(1)
    .forEach(author -> System.out.println(author.getName()));
~~~~

![image-20240601183516052](https://gitee.com/cmyk359/img/raw/master/img/image-20240601183516052-2024-6-118:35:56.png)

### 映射转换

转换元素类型或结构

#### map

​	`map(Function<T, R>)`：元素一对一转换。可以对流中的元素进行计算或转换。

例如：

1、对流中元素进行类型转化

~~~~java
//	打印所有作家的姓名

List<Author> authors = getAuthors();
authors.stream()
    //传入的是Function接口的实现类，第一个泛型是流中对象的类型，第二个泛型是转化的目的类型
    .map(new Function<Author, String>() {
        @Override
        public String apply(Author author) {
            return author.getName(); //将流中的Author类型的对象，转化为String对象
        }
    })
    .forEach(s -> System.out.println(s));


==========================lambda表达式简化写法===============================
List<Author> authors = getAuthors();

authors
    .stream()
    .map(author -> author.getName())
    .forEach(name->System.out.println(name));
~~~~

![image-20240601161216170](https://gitee.com/cmyk359/img/raw/master/img/image-20240601161216170-2024-6-116:12:37.png)



2、对流中元素进行运算

```java
//将所有作家年龄加10后输出
List<Author> authors = getAuthors();
authors.stream()
    .map(author -> author.getAge())
    .map(age->age+10) //运算
    .forEach(age-> System.out.println(age));
```

![image-20240601161354857](https://gitee.com/cmyk359/img/raw/master/img/image-20240601161354857-2024-6-116:13:56.png)
















#### flatMap

​	`flatMap(Function<T, Stream<R>>)`：元素一对多展开（降维）。map只能把一个对象转换成另一个对象来作为流中的元素；而**flatMap可以把一个对象转换成多个对象作为流中的元素**。（1--->多）

例一：

​	打印所有书籍的名字。要求对重复的元素进行去重。

~~~~java
//        打印所有书籍的名字。要求对重复的元素进行去重。

List<Author> authors = getAuthors();
authors.stream()
    .flatMap(new Function<Author, Stream<Book>>() {
        @Override
        public Stream<Book> apply(Author author) {
            return author.getBooks().stream();
        }
    })
    .distinct()
    .forEach(book -> System.out.println(book.getName()));

==========================使用lambda表达式简化写法===============================

List<Author> authors = getAuthors();

authors.stream()
    .flatMap(author -> author.getBooks().stream())
    .distinct()
    .forEach(book -> System.out.println(book.getName()));
~~~~

![image-20240601184215959](https://gitee.com/cmyk359/img/raw/master/img/image-20240601184215959-2024-6-118:43:05.png)

例二：

​	打印现有数据的所有分类。要求对分类进行去重。不能出现这种格式：哲学,爱情

~~~~java
//        打印现有数据的所有分类。要求对分类进行去重。不能出现这种格式：哲学,爱情     爱情
List<Author> authors = getAuthors();
authors.stream()
    .flatMap(author -> author.getBooks().stream())//将Author转化为book
    .distinct()//book去重
    //将book转化为String：将每本书的category按`,`分割为String数组，获取该数组的流对象作为目标流
    .flatMap(book -> Arrays.stream(book.getCategory().split(",")))
    .distinct()//分类去重
    .forEach(category-> System.out.println(category));
~~~~

![image-20240601190717948](https://gitee.com/cmyk359/img/raw/master/img/image-20240601190717948-2024-6-119:08:05.png)

![image-20240601190844033](https://gitee.com/cmyk359/img/raw/master/img/image-20240601190844033-2024-6-119:09:05.png)

![image-20240601190944564](https://gitee.com/cmyk359/img/raw/master/img/image-20240601190944564-2024-6-119:10:05.png)

#### mapToXXX

`mapToInt()/mapToLong()/mapToDouble()`：转为数值流（避免装箱开销）。

`mapToXXX`和 `flatMapToXXX`是两类针对 **原始类型数据优化**的中间操作，直接操作 `int`、`long`、`double`，避免自动装箱/拆箱带来的性能开销。它们与 `map`和 `flatMap`类似，但直接操作原始类型流（如 IntStream、LongStream、DoubleStream）。

相比于map()，mapToXxx() 还提供了该种类型的流的特有方法（原生方法支持），比如数值型求和、平均数、最值

| **操作**       | **输入**    | **转换规则**                      | **输出流类型** | **典型场景**                                       |
| -------------- | ----------- | --------------------------------- | -------------- | -------------------------------------------------- |
| `map`          | `Stream<T>` | `T → R`（对象到对象）             | `Stream<R>`    | 对象类型转换（如 `String` → `Integer`）            |
| `mapToXXX`     | `Stream<T>` | `T →原始类型`（如 `int`）         | `IntStream`等  | 原始类型计算（求和、平均）                         |
| `flatMap`      | `Stream<T>` | `T → Stream<R>`（对象到对象流）   | `Stream<R>`    | 扁平化嵌套集合（如 `List<List<T>>` → `Stream<T>`） |
| `flatMapToXXX` | `Stream<T>` | `T →原始类型流`（如 `IntStream`） | `IntStream`等  | 展开并合并原始类型数据（如拆分字符串为数字流）     |

---

```java
List<String> list = Arrays. asList("Apple", "Banana", "Orange", "Grapes");
//从list获取stream流，并将原来流中元素的长度作为新流返回
IntStream intStream = list.stream().mapToInt(new ToIntFunction<String>() {
    @Override
    public int applyAsInt(String s) {
        return s.length();
    }
});
intStream.forEach(System. out:: println);

===========================简化写法=================================
List<String> list = Arrays. asList("Apple", "Banana", "Orange", "Grapes");
IntStream intStream = list. stream().mapToInt(s -> s.length());
intStream.forEach(System. out:: println);


//将原来流中的元素 通过 Interger.valueOf方法 转化为 整数后返回。
List<String> list = Arrays. asList("1", "2", "3", "4");
IntStream intStream = list. stream(). mapToInt(s -> Integer.valueOf(s));
intStream.forEach(System. out:: println);

```


#### flatMapToXXX

元素一对多展开到原始类型流，将每个元素转换为一个原始类型流，再合并为单个原始类型流。操方法同上面的 mapToXXX

例如：

```java
List<String> texts = Arrays.asList("1,2,3", "4,5");
//将每个字符串拆分为数字并转为IntStream
IntStream numbers = texts.stream()
        .flatMapToInt(s -> Arrays.stream(s.split(","))
                .mapToInt(Integer::parseInt)
        );//1,2,3,4,5
//计算总和
int sum = numbers.sum(); //15
```



### 排序
#### sorted

- `sorted()`：自然排序（元素需实现`Comparable`）。
- `sorted(Comparator<T>)`：自定义排序规则。

例如：

​	对流中的元素按照年龄进行降序排序，并且要求不能有重复的元素。

~~~~java
        List<Author> authors = getAuthors();
//        对流中的元素按照年龄进行降序排序，并且要求不能有重复的元素。
        authors.stream()
                .distinct()
                .sorted() 
                .forEach(author -> System.out.println(author.getAge()));
~~~~

> **注意：如果调用空参的sorted()方法，需要流中的元素是实现了Comparable接口，在其中的compareTo方法中定义排序策略。**

![image-20240601175756515](https://gitee.com/cmyk359/img/raw/master/img/image-20240601175756515-2024-6-117:58:05.png)		

使用有参的sort方法，传入比较器Comparator，重写compare方法，指定排序策略

```java
authors.stream()
    .distinct()
    .sorted(new Comparator<Author>() {
        @Override
        public int compare(Author o1, Author o2) {
            return o1.getAge() - o2.getAge();
        }
    }) //设置比较器，按升序排序
    .forEach(author -> System.out.println(author.getAge()));

==========================lambda表达式简化写法===============================
authors.stream()
    .distinct()
    .sorted((o1, o2) -> o1.getAge() - o2.getAge()) //设置比较器，按升序排序
    .forEach(author -> System.out.println(author.getAge()));
```

![image-20240601182321786](https://gitee.com/cmyk359/img/raw/master/img/image-20240601182321786-2024-6-118:24:05.png)

### 调试观察

#### peek

`peek(Consumer<T>)`的主要作用是在流的每个元素上执行一个操作，比如打印元素的值、记录日志、调试等。它通常用于调试和观察流的中间状态，而不会对流的内容进行修改。

例如：

```java
    private static void test23() {
        //使用reduce求所有作者年龄的和
        List<Author> authors = getAuthors();
        Integer ageSum = authors.stream()
                .distinct()
                .map(author -> author.getAge())
                .peek(System.out::println) //查看当前流中的每个元素
                //初始result值为0，两者相同加，再赋值给result，最后返回结果为result
                .reduce(0, (result, element) -> result + element);
        System.out.println(ageSum);
    }
```

### 特殊转换

改变流的结构或类型。

- `boxed()`：将数值流（如IntStream）转为对象流（Stream<Integer>）。

- `parallel()`：转换为并行流。

  具体参见下文[并行流](https://captpaws.top/146f67fb/#并行流)

- `sequential()`：转换为顺序流。



## 3.6、终结操作

必须要有终结操作，否则之前定义的中间操作就不会生效。这些操作的返回值不再是stream类型，不能再进行链式编程。操作分类如下：

| **分类**     | **方法/操作**                                               | **特点**                                              |
| ------------ | ----------------------------------------------------------- | ----------------------------------------------------- |
| **遍历处理** | `forEach`, `forEachOrdered`                                 | 产生副作用，不返回数据                                |
| **匹配查找** | `anyMatch`, `allMatch`, `noneMatch`, `findFirst`, `findAny` | 返回布尔值或`Optional`，支持短路逻辑                  |
| **归约统计** | `reduce`, `count`, `sum`, `min`, `max`                      | 聚合计算，数值流有优化                                |
| **收集转换** | `collect`, `toArray`                                        | 灵活生成集合/数组，支持复杂聚合（如分组、分区、统计） |
| **其他操作** | `iterator`, `spliterator`                                   | 低级别操作，通常用于框架或库开发                      |

### 遍历处理

- `forEach(Consumer<T>)`：无序遍历（并行流不保证顺序）。
- `forEachOrdered(Consumer<T>)`：按流顺序遍历（并行流中强制顺序，性能较低）

##### forEach

​	对流中的元素进行遍历操作，我们通过传入的参数去指定对遍历到的元素进行什么具体操作。

例子：输出所有作家的名字

~~~~java
//        输出所有作家的名字
        List<Author> authors = getAuthors();

        authors.stream()
                .map(author -> author.getName())
                .distinct()
                .forEach(name-> System.out.println(name));

~~~~



### 匹配查找

检查流中元素是否满足条件或查找特定元素。

#### anyMatch

​	可以用来判断**是否有任意符合匹配条件**的元素，结果为boolean类型

例子：

​	判断是否有年龄在29以上的作家

~~~~java
//        判断是否有年龄在29以上的作家
        List<Author> authors = getAuthors();
        boolean flag = authors.stream()
                .anyMatch(author -> author.getAge() > 29);
        System.out.println(flag);
~~~~



#### allMatch

​	可以用来判断是否**都符合**匹配条件，结果为boolean类型。如果都符合结果为true，否则结果为false。

例子：判断是否所有的作家都是成年人

~~~~java
//        判断是否所有的作家都是成年人
        List<Author> authors = getAuthors();
        boolean flag = authors.stream()
                .allMatch(author -> author.getAge() >= 18);
        System.out.println(flag);
~~~~

#### noneMatch

​	可以判断流中的元素是否**都不符合**匹配条件。如果都不符合结果为true，否则结果为false

例子：判断作家是否都没有超过100岁的。

~~~~java
//        判断作家是否都没有超过100岁的。
        List<Author> authors = getAuthors();

        boolean b = authors.stream()
                .noneMatch(author -> author.getAge() > 100);

        System.out.println(b);
~~~~

#### findAny

​	获取流中的任意一个元素。该方法没有办法保证获取的一定是流中的第一个元素。

例子：获取任意一个年龄大于18的作家，如果存在就输出他的名字

~~~~java
//        获取任意一个年龄大于18的作家，如果存在就输出他的名字
        List<Author> authors = getAuthors();
        Optional<Author> optionalAuthor = authors.stream()
                .filter(author -> author.getAge()>18)
                .findAny();

        optionalAuthor.ifPresent(author -> System.out.println(author.getName()));
~~~~



#### findFirst

​	获取流中的第一个元素。

例子：获取一个年龄最小的作家，并输出他的姓名。

~~~~java
//        获取一个年龄最小的作家，并输出他的姓名。
        List<Author> authors = getAuthors();
        Optional<Author> first = authors.stream()
                .sorted((o1, o2) -> o1.getAge() - o2.getAge())
                .findFirst();

        first.ifPresent(author -> System.out.println(author.getName()));
~~~~



### 归约统计

#### reduce

`Stream.reduce()`是一个用于将流中的元素组合成一个单一结果的方法。它通过反复应用一个组合操作来实现，这个操作可以是求和、求最大值、字符串连接等（按照你指定的计算方式计算出一个结果）

​	reduce的作用是把stream中的元素给组合起来，我们可以传入一个初始值，它会按照我们的计算方式依次拿流中的元素和初始化值进行计算，计算结果再和后面的元素计算。

> 进行reduce操作前，一般会使用map将流对象转化为我们操作的类型。（称为 map-reduce模式）
>
> 如：要求所有作者的年龄和，先把Author流对象通过map转化为Integer流，再进行reduce求和



##### 无初始值

**`Optional<T> reduce(BinaryOperator<T> accumulator)`**

将流中**第一个元素作为初始值**，然后按照指定计算方式与后续的流对象进行计算，将最终结果封装在Optional对象中并返回，若流为空，返回 `Optional.empty()`。

**适用场景**：无需初始值，处理可能为空的流。

其内部处理逻辑如下：

```java
boolean foundAny = false;
T result = null;
for (T element : this stream) {
    if (!foundAny) {
        foundAny = true;
        result = element;
    }
    else
        //使用累加器的apply方法进行计算
        result = accumulator.apply(result, element);
}
return foundAny ? Optional.of(result) : Optional.empty();
```

如果用一个参数的重载方法去求最小值代码如下：

```java
//        使用reduce求所有作者中年龄的最小值
List<Author> authors = getAuthors();
Optional<Integer> minOptional = authors.stream()
    .map(author -> author.getAge())
    .reduce((result, element) -> result > element ? element : result);
minOptional.ifPresent(age-> System.out.println(age));
```



##### 有初始值

**`T reduce(T identity, BinaryOperator<T> accumulator)`**，指定 **初始值identity**和累加器进行归约，返回确定类型结果（流为空时返回初始值）。

其内部的计算方式如下：

~~~~java
T result = identity;
for (T element : this stream)
	result = accumulator.apply(result, element)
return result;
~~~~

​	其中identity就是我们可以通过方法参数传入的初始值，accumulator的apply具体进行什么计算，也是我们通过方法参数来确定的。

例子：

​	使用reduce求所有作者年龄的和

~~~~java
//        使用reduce求所有作者年龄的和
List<Author> authors = getAuthors();
Integer ageSum = authors.stream()
    .distinct()
    .map(author -> author.getAge())
    .reduce(0, new BinaryOperator<Integer>() {//初始result值为0
        @Override
        public Integer apply(Integer result, Integer element) {
            return result + element;//两者相同加，再赋值给result，最后返回结果为result
        }
    });
System.out.println(ageSum);

==========================使用lambda表达式简化写法===============================
List<Author> authors = getAuthors();
Integer ageSum = authors.stream()
    .distinct()
    .map(author -> author.getAge())
    //初始result值为0，两者相同加，再赋值给result，最后返回结果为result
    .reduce(0, (result, element) -> result + element);
System.out.println(ageSum);
~~~~

​	使用reduce求所有作者中年龄的最大值

~~~~java
//        使用reduce求所有作者中年龄的最大值
List<Author> authors = getAuthors();
Integer max = authors.stream()
    .map(author -> author.getAge())
    .reduce(Integer.MIN_VALUE, 
            (result, element) -> result < element ? element : result);

System.out.println(max);
~~~~

​	使用reduce求所有作者中年龄的最小值

~~~~java
//        使用reduce求所有作者中年龄的最小值
        List<Author> authors = getAuthors();
        Integer min = authors.stream()
                .map(author -> author.getAge())
                .reduce(Integer.MAX_VALUE, (result, element) -> result > element ? element : result);
        System.out.println(min);
~~~~

##### 支持并行流的规约

**`<U> U reduce(U identity, BiFunction<U, T, U> accumulator, BinaryOperator<U> combiner)`**

- **功能**：支持 **并行流**的归约，提供初始值、累加器（用于合并单个元素）和组合器（用于合并部分结果）。
- **执行逻辑**：
  1.初始值 `identity`作为计算的起点。
  2.在 **并行流**中，每个线程分片处理数据，使用 `accumulator`合并元素。
  3.最终使用 `combiner`合并各分片的结果。
- **适用场景**：在并行流中进行复杂归约（如类型转换或聚合）。

#### count

​	可以用来获取当前流中元素的个数。

例子：

​	打印这些作家的所出书籍的数目，注意删除重复元素。

~~~~java
//        打印这些作家的所出书籍的数目，注意删除重复元素。
        List<Author> authors = getAuthors();

        long count = authors.stream()
                .flatMap(author -> author.getBooks().stream())
                .distinct()
                .count();
        System.out.println(count);
~~~~





#### max&min

​	可以用来或者流中的最值。

例子：

​	分别获取这些作家的所出书籍的最高分和最低分并打印。

~~~~java
//        分别获取这些作家的所出书籍的最高分和最低分并打印。
        //Stream<Author>  -> Stream<Book> ->Stream<Integer>  ->求值

        List<Author> authors = getAuthors();
        Optional<Integer> max = authors.stream()
                .flatMap(author -> author.getBooks().stream())
                .map(book -> book.getScore())
            //指定比较器，告诉JDK按什么规则排序来得到最大最小值
                .max((score1, score2) -> score1 - score2); 

        Optional<Integer> min = authors.stream()
                .flatMap(author -> author.getBooks().stream())
                .map(book -> book.getScore())
                .min((score1, score2) -> score1 - score2);
        System.out.println(max.get());
        System.out.println(min.get());
~~~~



![image-20240601192954475](https://gitee.com/cmyk359/img/raw/master/img/image-20240601192954475-2024-6-119:30:05.png)

### 收集转换

##### toArray

`toArray()`：将流中的元素放入到一个数组中，默认为Object数组。他还有一个重载方法可以返回指定类型的数组

```java
Object[] objects = Stream.of(1, 2, 3, 4, 5).toArray();
Integer[] integers = Stream.of(1, 2, 3, 4, 5).toArray(Integer[]::new);
```

如果想转换成其它集合类型，需要调用collect方法，利用Collectors.toXXX方法进行转换。

##### collect 

​	收集操作，把当前流转换成一个集合。

例子：

​	获取一个存放所有作者名字的List集合。

~~~~java
//        获取一个存放所有作者名字的List集合。
        List<Author> authors = getAuthors();
        List<String> nameList = authors.stream()
                .map(author -> author.getName())
                .collect(Collectors.toList());
        System.out.println(nameList);
~~~~

​	获取一个所有书名的Set集合。

~~~~java
//        获取一个所有书名的Set集合。
List<Author> authors = getAuthors();
Set<String> bookSet = authors.stream()
    .flatMap(author -> author.getBooks().stream())
    .map(book -> book.getName())
    .collect(Collectors.toSet());
System.out.println(bookSet);
~~~~

​	

获取一个Map集合，map的key为作者名，value为List<Book>

Collectors.toMap方法有两个Function类型的参数，定义了要用当前流对象的哪个属性作为key，哪个属性作为value（这个参数与map中间操作的参数相同）

![image-20240601203246895](https://gitee.com/cmyk359/img/raw/master/img/image-20240601203246895-2024-6-120:33:05.png)

```java
//        获取一个Map集合，map的key为作者名，value为List<Book>

List<Author> authors = getAuthors();
Map<String, List<Book>> map = authors.stream()
    .distinct()
    .collect(Collectors.toMap(new Function<Author, String>() {
        @Override
        public String apply(Author author) { //用Author对象的什么属性作为key
            return author.getName();
        }
    }, new Function<Author, List<Book>>() {//用Author对象的什么属性作为value
        @Override
        public List<Book> apply(Author author) {
            return author.getBooks();
        }
    }));


```

lambda简化

~~~~java
//        获取一个Map集合，map的key为作者名，value为List<Book>
List<Author> authors = getAuthors();

Map<String, List<Book>> map = authors.stream()
    .distinct()
    .collect(Collectors.toMap(author -> author.getName(),
                              author -> author.getBooks()));
System.out.println(map);
~~~~

![image-20240601205542796](https://gitee.com/cmyk359/img/raw/master/img/image-20240601205542796-2024-6-120:55:51.png)





`Collectors.groupingBy`

将List的数据按照指定字段分组，结果为一个Map，key为分组字段，value为每组的元素。通过遍历Map的entrySet获取每组的key和value。

```java
	//1、获取所有店铺
    List<Shop> shops = shopService.list();
    //2、根据Shop的typeID字段分组,typeId一致的放到一个集合
    Map<Long, List<Shop>> collect = shops.stream()
        .collect(Collectors.groupingBy(Shop::getTypeId));

    //3、遍历entrySet
    for (Map.Entry<Long, List<Shop>> entry : collect.entrySet()) {
        //3.1 获取类型id
        Long typeId = entry.getKey();
        String key = SHOP_GEO_KEY + typeId;
        //3.2 获取对应店铺集合
        List<Shop> shopList = entry.getValue();
    }
```















# 四、Optional

## 4.1 概述

​	我们在编写代码的时候出现最多的就是空指针异常。所以在很多情况下我们需要做各种非空的判断。

​	例如：

~~~~java
        Author author = getAuthor();
        if(author!=null){
            System.out.println(author.getName());
        }
~~~~

​	尤其是对象中的属性还是一个对象的情况下。这种判断会更多。	

​	而过多的判断语句会让我们的代码显得臃肿不堪。

​	所以在JDK8中引入了Optional,养成使用Optional的习惯后你可以写出更优雅的代码来**避免空指针异常**。

​	并且在很多函数式编程相关的API中也都用到了Optional，如果不会使用Optional也会对函数式编程的学习造成影响。



## 4.2 使用

### 创建对象

​	Optional就好像是包装类，可以把我们的具体数据封装Optional对象内部。然后我们去使用Optional中封装好的方法操作封装进去的数据，就可以非常优雅的避免空指针异常。

 

​	我们一般使用**Optional**的`静态方法ofNullable`来把数据封装成一个Optional对象。无论传入的参数是否为null都不会出现问题。

![image-20240601230809882](https://gitee.com/cmyk359/img/raw/master/img/image-20240601230809882-2024-6-123:08:22.png)

~~~~java
        Author author = getAuthor();
        Optional<Author> authorOptional = Optional.ofNullable(author);
~~~~

​	你可能会觉得还要加一行代码来封装数据比较麻烦。但是如果改造下getAuthor方法，让其的返回值就是封装好的Optional的话，我们在使用时就会方便很多。

​	而且在实际开发中我们的数据很多是从数据库获取的。Mybatis从3.5版本可以也已经支持Optional了。我们可以直接把dao方法的返回值类型定义成Optional类型，MyBastis会自己把数据封装成Optional对象返回。封装的过程也不需要我们自己操作。



​	如果你**确定一个对象不是空**的则可以使用**Optional**的**静态方法of**来把数据封装成Optional对象。

~~~~java
        Author author = new Author();
        Optional<Author> authorOptional = Optional.of(author);
~~~~

​	但是一定要注意，如果使用of的时候传入的参数**必须不为null**。（尝试下传入null会出现什么结果）



​	如果一个方法的返回值类型是Optional类型。而如果我们经判断发现某次计算得到的返回值为null，这个时候就需要把null封装成Optional对象返回。这时则可以使用**Optional**的**静态方法empty**来进行封装。

~~~~java
		Optional.empty()
~~~~

​	

​	所以最后你觉得哪种方式会更方便呢？**ofNullable**



### 安全消费值

​	我们获取到一个Optional对象后肯定需要对其中的数据进行使用。这时候我们可以使用其`ifPresent`方法对来消费其中的值。

​	<u>这个方法会判断其内封装的数据是否为空，不为空时才会执行具体的消费代码。</u>这样使用起来就更加安全了。

​	例如,以下写法就优雅的避免了空指针异常。

~~~~java
Optional<Author> authorOptional = Optional.ofNullable(getAuthor());

authorOptional.ifPresent(author -> System.out.println(author.getName()));
~~~~



### 获取值

​	如果我们想获取值自己进行处理可以使用get方法获取，但是不推荐。因为当Optional内部的数据为空的时候会出现异常。





### 安全获取值

​	如果我们期望安全的获取值。我们不推荐使用get方法，而是使用Optional提供的以下方法。

* `orElseGet`

  **获取数据并且设置数据为空时的默认值**。如果数据不为空就能获取到该数据。如果为空则根据你传入的参数来创建对象作为默认值返回。

  ~~~~java
  Optional<Author> authorOptional = getAuthor();
  Author author = authorOptional.orElseGet(new Supplier<Author>() {
      @Override
    //如果该optional对象内部封装的数据为null时，返回方法内声明的数据
      public Author get() { 
          return new Author(1L, "叶枕眠", 33, "一个从菜刀中明悟哲理的祖安人", null);
      }
  });
  
  =============================lambda简化写法===================================
  
  Optional<Author> authorOptional = Optional.ofNullable(getAuthor());
  Author author1 = authorOptional.orElseGet(() -> new Author());
  ~~~~
  
  



* orElseThrow

  获取数据，如果数据不为空就能获取到该数据。如果为空则根据你传入的参数来创建异常抛出。（可以在spring中对这些异常进行捕获处理）

  ~~~~java
  Optional<Author> authorOptional = getAuthor();
  try {
      Author author = authorOptional.orElseThrow(new Supplier<Throwable>() {
          @Override
          public Throwable get() { //抛出自定义异常
              return new RuntimeException("author为空");
          }
      });
    System.out.println(author.getName());
  } catch (Throwable throwable) {
      throwable.printStackTrace();
  }
  
  
  ==========================lambda简化写法======================================
  
  Optional<Author> authorOptional = Optional.ofNullable(getAuthor());
  try {
      Author author = authorOptional.orElseThrow(
          () -> new RuntimeException("author为空"));
      System.out.println(author.getName());
  } catch (Throwable throwable) {
      throwable.printStackTrace();
  }
  ~~~~
  
  

### 过滤

​	我们可以使用filter方法对数据进行过滤。如果原本是有数据的，但是不符合判断，也会变成一个无数据的Optional对象。

~~~~java
Optional<Author> authorOptional = Optional.ofNullable(getAuthor());
authorOptional
    .filter(author -> author.getAge()>100)//对optional内封装的数据进行过滤
    .ifPresent(author -> System.out.println(author.getName()));//过滤后再消费

~~~~



### 判断

​	我们可以使用`isPresent`方法进行是否存在数据的判断。如果为空返回值为false,如果不为空，返回值为true。但是这种方式并不能体现Optional的好处，**更推荐使用ifPresent方法**。

~~~~java
        Optional<Author> authorOptional = Optional.ofNullable(getAuthor());

        if (authorOptional.isPresent()) {
            System.out.println(authorOptional.get().getName());
        }
~~~~



###  数据转换

​	Optional还提供了map可以让我们的对数据进行转换，并且转换得到的数据也还是被Optional包装好的，保证了我们的使用安全。

例如我们想获取作家的书籍集合。

~~~~java
    private static void testMap() {
        Optional<Author> authorOptional = getAuthor();
        authorOptional
                .map(author -> author.getBooks())
                .ifPresent(books -> System.out.println(books));
    }
~~~~




# 六、 方法引用

> 在使用Lambda表达式的时候，我们实际上传递进去的代码就是一种解决方案:拿什么参数做什么操作。
>
> 那么考虑一种情况:如果我们在Lambda中所指定的操作方案，已经有地方存在相同方案，那是否还有必要再写重复逻辑?	如果Lambda要表达的函数方案已经存在于某个方法的实现中，那么则可以通过双冒号来引用该方法作为Lambda的替代者。
>
> 函数式接口是 Lambda 的基础，而方法引用是 Lambda 的孪生兄弟。



我们在使用lambda时，**如果方法体中只有一个方法的调用的话**（包括构造方法）,我们可以用方法引用进一步简化代码。

例如：map操作的参数是一个lambda表达式且方法体重只有一个方法的调用，此时就可以使用方法引用来进一步简化

```java
    private static void test14() {
        //获取一个存放所有作者名字的List集合。
        List<Author> authors = getAuthors();
        List<String> nameList = authors.stream()
                //.map(author -> author.getName())
            	.map(Author::getName)
                .distinct()
                .collect(Collectors.toList());
        System.out.println(nameList);
    }
```



## 6.1 推荐用法

​	我们在使用lambda时不需要考虑什么时候用方法引用，用哪种方法引用，方法引用的格式是什么。我们只需要在写完lambda方法发现方法体只有一行代码，并且是方法的调用时使用快捷键尝试是否能够转换成方法引用即可。

​	当我们方法引用使用的多了慢慢的也可以直接写出方法引用。



## 6.2 基本格式

​	类名或者对象名::方法名



## 6.3 语法详解(了解)

### 引用类的静态方法

​	其实就是引用类的静态方法

格式

~~~~java
类名::方法名
~~~~



使用前提：

1. 如果我们在重写方法的时候，方法体中**只有一行代码**
2. 并且这行代码是**调用了某个类的静态方法**
3. 并且我们把要重写的**抽象方法中所有的参数都按照顺序传入了这个静态方法中**

这个时候我们就可以引用类的静态方法。

​	

例如：如下代码就可以用方法引用进行简化

~~~~java
List<Author> authors = getAuthors();

Stream<Author> authorStream = authors.stream();

authors.stream()
    .map(author -> author.getAge())
    .map(age->String.valueOf(age));


==========================其对应的匿名内部类写法如下=================================

    List<Author> authors = getAuthors();

authors.stream()
    .map(new Function<Author, Integer>() {
        @Override
        public Integer apply(Author author) {
            return author.getAge(); //并没有调用静态方法，也没有传递抽象方法的参数,不能简化
        }
    })
    .map(new Function<Integer, String>() {
        @Override
        public String apply(Integer age) {
            return String.valueOf(age); //调用String的静态方法，且将抽象方法的参数传递进去
        }
    });
~~~~

> 注意，如果我们所重写的方法是没有参数的，调用的方法也是没有参数的也相当于符合以上规则。
>

优化后如下：

~~~~java
        List<Author> authors = getAuthors();

        Stream<Author> authorStream = authors.stream();

        authorStream.map(author -> author.getAge())
                .map(String::valueOf);
~~~~



### 引用对象的实例方法

格式

~~~~java
对象名::方法名
~~~~



使用前提

1. 如果我们在重写方法的时候，方法体中**只有一行代码**
2. 并且这行代码是**调用了某个对象的成员方法**
3. 并且我们把要重写的**抽象方法中所有的参数都按照顺序传入了这个成员方法中**

这个时候我们就可以引用对象的实例方法



例如：

~~~~java
List<Author> authors = getAuthors();

Stream<Author> authorStream = authors.stream();
StringBuilder sb = new StringBuilder();
authorStream.map(author -> author.getName())
    .forEach(name->sb.append(name));


==========================其对应的匿名内部类写法如下=================================

List<Author> authors = getAuthors();

Stream<Author> authorStream = authors.stream();
StringBuilder sb = new StringBuilder();
authorStream
    .map(new Function<Author, String>() {
        @Override
        public String apply(Author author) {
            return author.getName(); //调用了author对象的成员方法，但没有传递抽象方法的参数，不能简化
        }
    })
    .forEach(new Consumer<String>() {
        @Override
        public void accept(String name) {
            sb.append(name);//调用了sb对象的成员方法，且将抽象方法的参数传递进去,可以简化
        }
    });
~~~~

优化后：

~~~~java
        List<Author> authors = getAuthors();

        Stream<Author> authorStream = authors.stream();
        StringBuilder sb = new StringBuilder();
        authorStream.map(author -> author.getName())
                .forEach(sb::append);
~~~~







### 引用类的实例方法

格式

~~~~java
类名::方法名
~~~~



使用前提

1. 如果我们在重写方法的时候，方法体中**只有一行代码**
2. 并且这行代码是**调用了第一个参数的成员方法**
3. 并且我们把要**重写的抽象方法中剩余的所有的参数都按照顺序传入了这个成员方法中**

这个时候我们就可以引用类的实例方法。



例如：

```java
    interface UseString{
        String use(String str,int start,int length);
    }

    public static String subAuthorName(String str, UseString useString){
        int start = 0;
        int length = 1;
        return useString.use(str,start,length);
    }


    public static void main(String[] args) {

        subAuthorName("三更草堂", new UseString() {
            @Override
            public String use(String str, int start, int length) {
                return str.substring(start,length);
            }
        });

	}
```

优化后如下：

~~~~java
    public static void main(String[] args) {

        subAuthorName("三更草堂", String::substring);

    }
~~~~





###  构造器引用

​	如果方法体中的一行代码是构造器的话就可以使用构造器引用。



格式

~~~~java
类名::new
~~~~



使用前提

1. 如果我们在重写方法的时候，方法体中**只有一行代码**
2. 并且这行代码是**调用了某个类的构造方法**
3. 并且我们把**要重写的抽象方法中的所有的参数都按照顺序传入了这个构造方法中**

这个时候我们就可以引用构造器。

例如：

~~~~java
        List<Author> authors = getAuthors();
        authors.stream()
                .map(author -> author.getName())
                .map(name->new StringBuilder(name))
                .map(sb->sb.append("-三更").toString())
                .forEach(str-> System.out.println(str));
~~~~

优化后：

~~~~java
List<Author> authors = getAuthors();
authors.stream()
    .map(author -> author.getName())
    .map(StringBuilder::new)
    .map(sb->sb.append("-三更").toString())
    .forEach(str-> System.out.println(str));

======================进一步简化===========================>
List<Author> authors = getAuthors();
authors.stream()
    .map(Author::getName)
    .map(StringBuilder::new)
    .map(sb->sb.append("-三更").toString())
    .forEach(System.out::println);
~~~~





## 七、高级用法

### 7.1 基本数据类型优化

​	我们之前用到的很多Stream的方法由于都使用了泛型。所以涉及到的参数和返回值都是引用数据类型。

​	即使我们操作的是整数小数，但是实际用的都是他们的包装类。JDK5中引入的自动装箱和自动拆箱让我们在使用对应的包装类时就好像使用基本数据类型一样方便。但是你一定要知道装箱和拆箱肯定是要消耗时间的。虽然这个时间消耗很下。但是在大量的数据不断的重复装箱拆箱的时候，你就不能无视这个时间损耗了。

​	所以为了让我们能够对这部分的时间消耗进行优化。Stream还提供了很多专门针对基本数据类型的方法。

​	例如：mapToInt、mapToLong、mapToDouble、flatMapToInt、flatMapToDouble等。

~~~~java
    private static void test27() {

        List<Author> authors = getAuthors();
        authors.stream()
                .map(author -> author.getAge())
                .map(age -> age + 10)
                .filter(age->age>18)
                .map(age->age+2)
                .forEach(System.out::println);

        authors.stream()
                .mapToInt(author -> author.getAge())//****转化为int类型再操作
                .map(age -> age + 10)
                .filter(age->age>18)
                .map(age->age+2)
                .forEach(System.out::println);
    }
~~~~



### 7.2 并行流

​	当流中有大量元素时，我们可以使用并行流去提高操作的效率。其实并行流就是把任务分配给多个线程去完全。如果我们自己去用代码实现的话其实会非常的复杂，而如果我们使用Stream的话，我们只需要修改一个方法的调用就可以使用并行流来帮我们实现，从而提高效率。

​	parallel方法可以把串行流转换成并行流。

~~~~java
    private static void test28() {
        Stream<Integer> stream = Stream.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        Integer sum = stream.parallel()
                .peek(new Consumer<Integer>() {
                    @Override
                    public void accept(Integer num) {
                        System.out.println(num+Thread.currentThread().getName());
                    }
                })
                .filter(num -> num > 5)
                .reduce((result, ele) -> result + ele)
                .get();
        System.out.println(sum);
    }
~~~~

​	也可以通过parallelStream直接获取并行流对象。

~~~~java
        List<Author> authors = getAuthors();
        authors.parallelStream()
                .map(author -> author.getAge())
                .map(age -> age + 10)
                .filter(age->age>18)
                .map(age->age+2)
                .forEach(System.out::println);
~~~~





