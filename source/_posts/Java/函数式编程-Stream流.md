---
title: 函数式编程-Stream流
tags:
  - Stream流
  - 函数式编程
categories:
  - Java
abbrlink: 146f67fb
date: 2024-12-09 11:04:20
index_img: https://cdn.jsdelivr.net/gh/cmyk359/MyCDN/Hexo/static/img/art-post3.jpg
---

<meta name = "referrer", content = "no-referrer"/>
> [Demo地址](https://github.com/cmyk359/JavaStream_demo)

## 一、 概述

### 1.1 为什么学？

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



### 1.2 函数式编程思想

​	面向对象思想需要关注用什么对象完成什么事情。而函数式编程思想就类似于我们数学中的函数。它主要关注的是对数据进行了什么操作。

优点：

* 代码简洁，开发快速
* 接近自然语言，易于理解
* 易于"并发编程"



## 二、 Lambda表达式

### 2.1 概述

​	Lambda是JDK8中一个语法糖。他可以对某些匿名内部类的写法进行简化（原则：是接口的匿名内部类，且接口中只有一个待重写的抽象方法）。它是函数式编程思想的一个重要体现。让我们不用关注是什么对象。而是更关注我们对数据进行了什么操作。

### 2.2 核心原则

> 可推导可省略

### 2.3 基本格式

~~~~java
(参数列表)->{代码}
~~~~

#### 例一

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



#### 例二

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

#### 例三

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



#### 例四

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



#### 例五

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



## 三、Stream流

### 3.1 概述

​	Java8的Stream使用的是函数式编程模式，如同它的名字一样，它可以被用来对**集合或数组**进行链状流式的操作。可以更方便的让我们对集合或数组操作。

特点：

- 惰性求值：如果没有终结操作，没有中间操作是不会得到执行的
- 流是一次性的：一旦一个流对象经过一个终结操作后。这个流就不能再被使用
- <u>**非破坏性**</u>：Stream API 设计为对数据源进行一系列操作（如过滤、映射、排序等），然后生成一个新的流或结果，而不会更改原始数据

### 3.2 案例数据准备

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



### 3.3 快速入门

#### 需求

​	我们可以调用getAuthors方法获取到作家的集合。现在需要打印所有年龄小于18的作家的名字，并且要注意去重。

#### 实现

~~~~java
        //打印所有年龄小于18的作家的名字，并且要注意去重
        List<Author> authors = getAuthors();
        authors.stream()//把集合转换成流
                .distinct()//先去除重复的作家
                .filter(author -> author.getAge()<18)//筛选年龄小于18的
                .forEach(author -> System.out.println(author.getName()));//遍历打印名字
~~~~

![image-20240601154243071](https://gitee.com/cmyk359/img/raw/master/img/image-20240601154243071-2024-6-115:42:46.png)

### 3.4 常用操作

#### 创建流

单列集合： `集合对象.stream()`

~~~~java
        List<Author> authors = getAuthors();
		Stream<Author> stream = authors.stream();
~~~~

数组：`Arrays.stream(数组) `或者使用`Stream.of`来创建

~~~~JAVA
        Integer[] arr = {1,2,3,4,5};
        Stream<Integer> stream = Arrays.stream(arr);
        Stream<Integer> stream2 = Stream.of(arr);
~~~~

双列集合：转换成单列集合后再创建

~~~~java
        Map<String,Integer> map = new HashMap<>();
        map.put("蜡笔小新",19);
        map.put("黑子",17);
        map.put("日向翔阳",16);
        //map中的每个键值对封装在一个entry对象中，一个个entry对象保存在一个set中
        map.entrySet()
            .stream()
             .filter(entry -> entry.getValue() > 16)
             .forEach(entry -> System.out.println(entry.getKey()+" ---"+entry.getValue()));
~~~~



#### 中间操作

##### filter

​	可以对流中的元素进行条件过滤，**符合过滤条件的才能继续留在流中**。



例如：

​	打印所有姓名长度大于1的作家的姓名

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

##### map

​	可以把对流中的元素进行计算或转换。

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



##### mapToXXX

mapToXxx() 可以直接映射为指定类型，如mapToInt、mapToLong、mapToDouble，得到指定类型的**流**。例如：`mapToInt()` 方法接受一个 `ToIntFunction<? super T>` 类型的参数，这是一个函数式接口，**用于规定将流中的每个元素按何种规则转换为整数**。

相比于map()，mapToXxx() 还提供了该种类型的流的特有方法，比如数值型求和、[平均数](https://so.csdn.net/so/search?q=平均数&spm=1001.2101.3001.7020)、最值



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



##### distinct

​	可以去除流中的重复元素。

例如：

​	打印所有作家的姓名，并且要求其中不能有重复元素。

~~~~java
List<Author> authors = getAuthors();

authors.stream()
    .distinct()//对流中的元素，两两调用equals方法判断是否为同一个，若是则从流中去除一个
    .forEach(author -> System.out.println(author.getName()));
~~~~

![image-20240601162902927](https://gitee.com/cmyk359/img/raw/master/img/image-20240601162902927-2024-6-116:29:05.png)



**注意：distinct方法是依赖Object的equals方法来判断是否是相同对象的。所以需要注意重写equals方法。**Object默认的equals方法中默认使用 `==`判断两对象的地址是否相同来判断是否是同一个。而在业务中，当两个对象各个属性值都相同时，就可以判断为重复。



> 可以在实体类中使用`ALT+G`，选择自动重写equals方法

![image-20240601162244629](https://gitee.com/cmyk359/img/raw/master/img/image-20240601162244629-2024-6-116:23:05.png)

生成的结果为：

![image-20240601162319873](https://gitee.com/cmyk359/img/raw/master/img/image-20240601162319873-2024-6-116:24:05.png)

> 也可以在实体类上添加LomBok注解 `@EqualsAndHashCode`，会自动生成重写equals方法的代码



##### sorted

​	可以对流中的元素进行排序。

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

**注意：如果调用空参的sorted()方法，需要流中的元素是实现了Comparable接口，在其中的compareTo方法中定义排序策略。**

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

##### limit	

​	可以设置流的最大长度，超出的部分将被抛弃。



例如：

​	对流中的元素按照年龄进行降序排序，并且要求不能有重复的元素,然后打印其中年龄最大的两个作家的姓名。

~~~~java
        List<Author> authors = getAuthors();
        authors.stream()
                .distinct()
                .sorted()
                .limit(2)
                .forEach(author -> System.out.println(author.getName()));
~~~~

![image-20240601183333481](https://gitee.com/cmyk359/img/raw/master/img/image-20240601183333481-2024-6-118:34:05.png)

##### skip

​	跳过流中的**前n个元素**，返回剩下的元素



例如：

​	打印除了年龄最大的作家外的其他作家，要求不能有重复元素，并且按照年龄降序排序。

~~~~java
//        打印除了年龄最大的作家外的其他作家，要求不能有重复元素，并且按照年龄降序排序。
        List<Author> authors = getAuthors();
        authors.stream()
                .distinct()
                .sorted()
                .skip(1)
                .forEach(author -> System.out.println(author.getName()));
~~~~

![image-20240601183516052](https://gitee.com/cmyk359/img/raw/master/img/image-20240601183516052-2024-6-118:35:56.png)





##### flatMap

​	map只能把一个对象转换成另一个对象来作为流中的元素。而**flatMap可以把一个对象转换成多个对象作为流中的元素**。（1--->多）



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

##### flatMapToXXX

同上面的 mapToXXX

##### peek

​	`	peek`方法的主要作用是在流的每个元素上执行一个操作，比如打印元素的值、记录日志、调试等。它通常用于调试和观察流的中间状态，而不会对流的内容进行修改。



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





#### 终结操作

> 必须要有终结操作，否则之前定义的中间操作就不会执行。
>
> 这些操作的返回值不再是stream类型，不能再进行链式编程

##### forEach

​	对流中的元素进行遍历操作，我们通过传入的参数去指定对遍历到的元素进行什么具体操作。



例子：

​	输出所有作家的名字

~~~~java
//        输出所有作家的名字
        List<Author> authors = getAuthors();

        authors.stream()
                .map(author -> author.getName())
                .distinct()
                .forEach(name-> System.out.println(name));

~~~~





##### count

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





##### max&min

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



##### 查找与匹配

1. anyMatch

​	可以用来判断**是否有任意符合匹配条件**的元素，结果为boolean类型。



例子：

​	判断是否有年龄在29以上的作家

~~~~java
//        判断是否有年龄在29以上的作家
        List<Author> authors = getAuthors();
        boolean flag = authors.stream()
                .anyMatch(author -> author.getAge() > 29);
        System.out.println(flag);
~~~~





2. allMatch

​	可以用来判断是否**都符合**匹配条件，结果为boolean类型。如果都符合结果为true，否则结果为false。

例子：

​	判断是否所有的作家都是成年人

~~~~java
//        判断是否所有的作家都是成年人
        List<Author> authors = getAuthors();
        boolean flag = authors.stream()
                .allMatch(author -> author.getAge() >= 18);
        System.out.println(flag);
~~~~



3. noneMatch

​	可以判断流中的元素是否**都不符合**匹配条件。如果都不符合结果为true，否则结果为false

例子：

​	判断作家是否都没有超过100岁的。

~~~~java
//        判断作家是否都没有超过100岁的。
        List<Author> authors = getAuthors();

        boolean b = authors.stream()
                .noneMatch(author -> author.getAge() > 100);

        System.out.println(b);
~~~~





4. findAny

​	获取流中的任意一个元素。该方法没有办法保证获取的一定是流中的第一个元素。



例子：

​	获取任意一个年龄大于18的作家，如果存在就输出他的名字

~~~~java
//        获取任意一个年龄大于18的作家，如果存在就输出他的名字
        List<Author> authors = getAuthors();
        Optional<Author> optionalAuthor = authors.stream()
                .filter(author -> author.getAge()>18)
                .findAny();

        optionalAuthor.ifPresent(author -> System.out.println(author.getName()));
~~~~



5. findFirst

​	获取流中的第一个元素。



例子：

​	获取一个年龄最小的作家，并输出他的姓名。

~~~~java
//        获取一个年龄最小的作家，并输出他的姓名。
        List<Author> authors = getAuthors();
        Optional<Author> first = authors.stream()
                .sorted((o1, o2) -> o1.getAge() - o2.getAge())
                .findFirst();

        first.ifPresent(author -> System.out.println(author.getName()));
~~~~



##### reduce归并

​	对流中的数据按照你指定的计算方式计算出一个结果。（缩减操作）

​	reduce的作用是把stream中的元素给组合起来，我们可以传入一个初始值，它会按照我们的计算方式依次拿流中的元素和初始化值进行计算，计算结果再和后面的元素计算。



> 进行reduce操作前，一般会使用map将流对象转化为我们操作的类型。（称为 map-reduce模式）
>
> 
>
> 如：要求所有作者的年龄和，先把Author流对象通过map转化为Integer流，再进行reduce求和



> ​	reduce**两个参数的重载形式**,其内部的计算方式如下：
>

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



> ​	reduce**一个参数的重载形式**，其内部的计算



该逻辑为：将流中**第一个元素作为初始值**，然后按照指定计算方式和后续的流对象进行计算，将最终结果封装在Optional对象中并返回

~~~~java
 	 boolean foundAny = false;
     T result = null;
     for (T element : this stream) {
         if (!foundAny) {
             foundAny = true;
             result = element;
         }
         else
             result = accumulator.apply(result, element);
     }
     return foundAny ? Optional.of(result) : Optional.empty();
~~~~

​	如果用一个参数的重载方法去求最小值代码如下：

~~~~java
        //        使用reduce求所有作者中年龄的最小值
        List<Author> authors = getAuthors();
        Optional<Integer> minOptional = authors.stream()
                .map(author -> author.getAge())
                .reduce((result, element) -> result > element ? element : result);
        minOptional.ifPresent(age-> System.out.println(age));
~~~~











## 四、Optional

### 4.1 概述

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



### 4.2 使用

#### 创建对象

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



#### 安全消费值

​	我们获取到一个Optional对象后肯定需要对其中的数据进行使用。这时候我们可以使用其`ifPresent`方法对来消费其中的值。

​	<u>这个方法会判断其内封装的数据是否为空，不为空时才会执行具体的消费代码。</u>这样使用起来就更加安全了。

​	例如,以下写法就优雅的避免了空指针异常。

~~~~java
Optional<Author> authorOptional = Optional.ofNullable(getAuthor());

authorOptional.ifPresent(author -> System.out.println(author.getName()));
~~~~



#### 获取值

​	如果我们想获取值自己进行处理可以使用get方法获取，但是不推荐。因为当Optional内部的数据为空的时候会出现异常。





#### 安全获取值

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
  
  

#### 过滤

​	我们可以使用filter方法对数据进行过滤。如果原本是有数据的，但是不符合判断，也会变成一个无数据的Optional对象。

~~~~java
Optional<Author> authorOptional = Optional.ofNullable(getAuthor());
authorOptional
    .filter(author -> author.getAge()>100)//对optional内封装的数据进行过滤
    .ifPresent(author -> System.out.println(author.getName()));//过滤后再消费

~~~~



#### 判断

​	我们可以使用`isPresent`方法进行是否存在数据的判断。如果为空返回值为false,如果不为空，返回值为true。但是这种方式并不能体现Optional的好处，**更推荐使用ifPresent方法**。

~~~~java
        Optional<Author> authorOptional = Optional.ofNullable(getAuthor());

        if (authorOptional.isPresent()) {
            System.out.println(authorOptional.get().getName());
        }
~~~~



####  数据转换

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



## 五、函数式接口

### 5.1 概述

​	**只有一个抽象方法**的接口我们称之为函数接口。

​	JDK的函数式接口都加上了**@FunctionalInterface** 注解进行标识。但是无论是否加上该注解只要接口中只有一个抽象方法，都是函数式接口。



### 5.2 常见函数式接口	

- ​	Consumer 消费接口

  根据其中抽象方法的参数列表和返回值类型知道，我们可以在方法中对传入的参数进行消费。

  ![image-20211028145622163](https://gitee.com/cmyk359/img/raw/master/img/image-20211028145622163-16354041894551-2024-6-201:42:30.png)

- ​	Function 计算转换接口

  根据其中抽象方法的参数列表和返回值类型知道，我们可以在方法中对传入的参数计算或转换，把结果返回

  ![image-20211028145707862](https://gitee.com/cmyk359/img/raw/master/img/image-20211028145707862-16354042291112-2024-6-201:42:32.png)

- ​	Predicate 判断接口

  根据其中抽象方法的参数列表和返回值类型知道，我们可以在方法中对传入的参数条件判断，返回判断结果

  ![image-20211028145818743](https://gitee.com/cmyk359/img/raw/master/img/image-20211028145818743-16354043004393-2024-6-201:42:33.png)

- ​	Supplier 生产型接口

  根据其中抽象方法的参数列表和返回值类型知道，我们可以在方法中创建对象，把创建好的对象返回

![image-20211028145843368](https://gitee.com/cmyk359/img/raw/master/img/image-20211028145843368-16354043246954-2024-6-201:42:34.png)



### 5.3 常用的默认方法

- and

  我们在使用Predicate接口时候可能需要进行判断条件的拼接。而and方法相当于是使用&&来拼接两个判断条件

  例如：

  打印作家中年龄大于17并且姓名的长度大于1的作家。

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

  例如：

  打印作家中年龄大于17或者姓名的长度小于2的作家。

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

  例如：

  打印作家中年龄不大于17的作家。

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
  
  

## 六、 方法引用

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



### 6.1 推荐用法

​	我们在使用lambda时不需要考虑什么时候用方法引用，用哪种方法引用，方法引用的格式是什么。我们只需要在写完lambda方法发现方法体只有一行代码，并且是方法的调用时使用快捷键尝试是否能够转换成方法引用即可。

​	当我们方法引用使用的多了慢慢的也可以直接写出方法引用。



### 6.2 基本格式

​	类名或者对象名::方法名



### 6.3 语法详解(了解)

#### 引用类的静态方法

​	其实就是引用类的静态方法

#### 格式

~~~~java
类名::方法名
~~~~



#### 使用前提

1. 如果我们在重写方法的时候，方法体中**只有一行代码**
2. 并且这行代码是**调用了某个类的静态方法**
3. 并且我们把要重写的**抽象方法中所有的参数都按照顺序传入了这个静态方法中**

这个时候我们就可以引用类的静态方法。

​	

例如：

如下代码就可以用方法引用进行简化

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



#### 引用对象的实例方法

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







#### 引用类的实例方法

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





####  构造器引用

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

​	当流中有大量元素时，我们可以使用并行流去提高操作的效率。其实并行流就是把任务分配给多个线程去完全。如果我们自己去用代码实现的话其实会非常的复杂，并且要求你对并发编程有足够的理解和认识。而如果我们使用Stream的话，我们只需要修改一个方法的调用就可以使用并行流来帮我们实现，从而提高效率。

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





