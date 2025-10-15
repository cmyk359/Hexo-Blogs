---
title: java 集合
categories:
  - JavaSE
abbrlink: d5381517
tags:
  - JavaSE
date: 2025-02-06 23:12:38
---
<meta name = "referrer", content = "no-referrer"/>

# 一、集合体系结构

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250206232137786-2025-2-623:21:38.png" style="zoom:80%;" />

Java集合是Java中用于存储和操作数据结构的核心库，其体系结构设计清晰，主要分为两大根接口：**Collection**和**Map**。

- Collection代表单列集合，每个元素（数据）只包含一个值。
- Map代表双列集合，每个元素包含两个值（键值对）。

## 1.1、Collection集合体系

<img src="https://gitee.com/cmyk359/img/raw/master/img/Collection.drawio-2025-9-717:22:19.png" style="zoom:80%;" />

Collection集合特点

- List系列集合：添加的元素是<span style="color:red">有序、可重复、有索引</span>。
  - ArrayList、LinekdList：有序、可重复、有索引。
- Set系列集合：添加的元素是<span style="color:red">无序、不重复、无索引</span>。
  - HashSet：无序、不重复、无索引；
  - LinkedHashSet：**有序**、不重复、无索引。
  - TreeSet：**按照大小默认升序排序**、不重复、无索引。
- Queue系列集合：
  - 添加的元素按照特定的规则排序（FIFO, LIFO, 或优先级）
  - 访问元素通常被限制在队列的**头部**和**尾部**，不能随机访问中间元素。

> 其中：**有序和无序**是指存和取的顺序是否一致，与元素值的大小无关；
>

## 1.2、Map集合体系

<img src="https://gitee.com/cmyk359/img/raw/master/img/map.drawio-2025-9-717:02:08.png" style="zoom:80%;" />

# 二、Collection集合

[Collection API参考文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/Collection.html)

## 2.1、Collection集合的常用方法

Collection是单列集合的祖宗，它规定的方法（功能）是全部单列集合都会继承的

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250206225828677-2025-2-622:58:29.png" style="zoom:80%;" />

## 2.2、Collection的遍历方式

### 迭代器

迭代器是用来遍历集合的专用方式（数组没有迭代器），在Java中迭代器的代表是**Iterator**。

所有实现了Collection接口的集合类都有一个iterator()方法，用以返回一个实现了Iterator接口的对象，即可以返回一个迭代器。

Collection集合获取迭代器的方法：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250206231131946-2025-2-623:11:39.png" style="zoom:80%;" />

Iterator迭代器中的常用方法：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250206231910075-2025-2-623:19:17.png" style="zoom:80%;" />

示例：

```java
   public static void main(String[] args) {
        Collection<String> coll = new ArrayList<>();
        coll.add("aaa");
        coll.add("bbb");
        coll.add("ccc");
        coll.add("ddd");
        coll.add("eee");

        //获取迭代器对象
        //迭代器就好像一个箭头,默认指向集合的0索引处
        Iterator<String> it = coll.iterator();
    	//利用循环不断地去获取集合中的每一个元素
        while (it.hasNext()){
            String str = it.next();
            System.out.println(str);
        }
    }

```



迭代器的注意点：

1. 越界会报错NoSuchElementException
2. 迭代器遍历完毕，指针不会复位
3. 循环中只能用一次next方法
4. 迭代器遍历时，不能用集合的方法进行增加或者删除

### 增强for循环

格式如下：

```java
for (元素的数据类型 变量名 : 数组或集合) {
    ...
}
```

- 增强for可以用来遍历集合或者数组。
- 增强for遍历集合，本质就是迭代器遍历集合的简化写法。

### lambda表达式

Java Lambda 表达式是 Java 8 引入的核心特性之一，它提供了一种简洁的语法来表示**函数式接口（Functional Interface）**的实例，使得代码更加简洁、灵活，尤其在集合操作和函数式编程中广泛应用。

[参考文章](https://blog.csdn.net/LHY537200/article/details/136889277)

Collection接口继承了Iterable接口，其中的`forEach`方法可以结合Lambda表达式来遍历集合。

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250206233634331-2025-2-623:36:35.png)

```java
public class LambdaExample {
    public static void main(String[] args) {
        Collection<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        //使用匿名内部类
        numbers.forEach(new Consumer<Integer>() {
            @Override
            public void accept(Integer number) {
                System.out.println(number + " ");
            }
        });
        
        // Lambda表达式作为参数传递给forEach方法
        numbers.forEach(number -> System.out.print(number+" "));
    }
}
```

### 案例

Movies类：

```java
public class Movies {
    private String name;
    private Double score;
    private String actor;
    public Movies(String name, Double score, String actor) {
        this.name = name;
        this.score = score;
        this.actor = actor;
    }
    // ... getter、 setter
}
```

测试：

```java
public static void main(String[] args) {
        Collection<Movies> movies = new ArrayList<>();
        movies.add(new Movies("《肖生克的救赎》",9.7,"罗宾斯"));
        movies.add(new Movies("《霸王别姬》",9.6,"张国荣、张丰毅"));
        movies.add(new Movies("《阿甘正传》",9.5,"汤姆.汉克斯"));
        System.out.println(movies);
        //输出的是对象的地址：[Movies@1e643faf, Movies@6e8dacdf, Movies@7a79be86]

        for (Movies movie : movies) {
            System.out.println("片名: " + movie.getName());
            System.out.println("评分：" + movie.getScore());
            System.out.println("演员：" + movie.getActor());
            System.out.println("------------------------------------");
        }
    }
```

集合存储对象的原理：

集合中存储的是元素对象的地址。

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250207093953123-2025-2-709:40:12.png)

## 2.3、List系列集合

<img src="https://gitee.com/cmyk359/img/raw/master/img/list.drawio-2025-9-717:23:13.png" style="zoom:80%;" />

List系列集合：添加的元素是<span style="color:red">有序、可重复、有索引</span>。

- ArrayList、LinekdList：有序、可重复、有索引。

> 其中：**有序和无序**是指存和取的顺序是否一致，与元素值的大小无关；

### List集合的特有方法

List集合因为支持索引，所以多了很多与索引相关的方法，当然，Collection的功能List也都继承了。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250207094312800-2025-2-709:43:14.png" style="zoom:80%;" />

因为List集合有**索引**，所以List的遍历方式除了迭代器、增强for循环、Lambda表达式外，还支持**一般的for循环**。

```java
List<String> list = new ArrayList<>();
list.add("糖宝宝");
list.add("蜘蛛精");
list.add("至尊宝");

//for循环
for(int i = 0; i < list.size(); i++){
    String s = list.get(i);
    System.out.println(s);
}
```

### ArrayList的底层原理

[ArrayList API参考文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/ArrayList.html)

**`ArrayList`** 内部维护了一个 **`Object[] elementData`** 数组，用于存储元素。

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250207141716465-2025-2-714:17:20.png)

> 补充：
>
> `transient` 是一个关键字，用于修饰类的成员变量。它的核心作用是**标记某个字段不参与默认的序列化过程**。
>
> `ArrayList` 的底层数组 `elementData` 被声明为 `transient`，但序列化时依然能保存所有元素。这是因为`ArrayList` **自定义了序列化逻辑**，覆盖了 `writeObject()` 和 `readObject()` 方法。
>
> <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250207153751245-2025-2-715:38:04.png" style="zoom:80%;" />
>
> 优化目的：`elementData` 的容量可能大于实际元素数量（例如扩容后），直接序列化整个数组会浪费空间。通过自定义序列化，**序列化时仅写入有效元素，而非整个数组，减少存储开销。**

#### 动态扩容原理

```java
public static void main(String[] args) {
        // 1、使用无参构造器
        List<Integer> list = new ArrayList<>();
        //2、使用指定大小的构造器
        //List<Integer> list = new ArrayList<>(8);
        //添加1 - 10元素
        for (int i = 0; i < 10; i++) {
            list.add(i);
        }
}
```

- 当创建ArrayList对象时，如果使用的是**无参构造器**，则初始elementData容量为0。第一次添加元素时elementData扩容为10。如需要再次扩容，则扩容elementData为1.5倍。

  <img src="https://gitee.com/cmyk359/img/raw/master/img/ArrayList扩容原理-2025-2-716:03:30.jpg"  style="zoom:67%;" />

- 如果使用的是**指定大小的构造器**，则初始elementData容量为指定大小，如果需要扩容则直接扩容elementData为1.5倍。

  <img src="https://gitee.com/cmyk359/img/raw/master/img/未命名绘图-2025-2-716:29:04.jpg" style="zoom:67%;" />

从源码可以看出，ArrayList的操作方法上并没有添加`syncronized`关键字，所以是**非线程安全的**。在多线程环境下可以使用`Vector` ，它一个线程安全的类，它在每个方法上都使用了同步机制。

> 补充：
>
> ArrayList的`Fail-Fast` 机制：
>
> `ArrayList` 的 `Fail-Fast` 机制是一种设计模式，用于检测集合在迭代过程中是否被修改。如果检测到集合被修改，会立即抛出 `ConcurrentModificationException` 异常，以确保迭代的安全性和一致性，防止并发修改问题。
>
> 1. **`modCount` 计数器**：`ArrayList` 中有一个名为 `modCount` 的内部计数器，用于记录集合结构的修改次数。每当集合的结构发生变化（如添加或删除元素），`modCount` 的值就会增加。
> 2. **迭代器的 `expectedModCount`**：当创建一个迭代器时，迭代器会保存一个 `expectedModCount` 值，该值是迭代器创建时 `modCount` 的值。在迭代过程中，迭代器会不断检查 `expectedModCount` 是否与当前的 `modCount` 匹配。
> 3. **检查和抛出异常**：在每次调用 `next` 或 `remove` 方法时，迭代器会检查 `expectedModCount` 是否与当前的 `modCount` 匹配。如果不匹配，说明集合在迭代过程中被修改了，迭代器会抛出 `ConcurrentModificationException`异常。
>
> ```java
> public class FailFastExample {
>     public static void main(String[] args) {
>         ArrayList<Integer> list = new ArrayList<>();
>         list.add(1);
>         list.add(2);
>         list.add(3);
> 
>         Iterator<Integer> iterator = list.iterator();
> 
>         while (iterator.hasNext()) {
>             Integer element = iterator.next();
>             System.out.println(element);
> 
>             // 在迭代过程中修改集合
>             if (element == 2) {
>                 list.remove(element); // 这里会抛出 ConcurrentModificationException
>                 iterator.remove(); // 使用迭代器的 remove 方法安全地删除元素
>             }
>         }
>     }
> }
> 
> ```

#### 总结

`ArrayList` 是一个灵活且功能强大的集合类，适用于大多数需要动态数组的场景。它的优点在于动态大小、快速随机访问和丰富的 API，而缺点主要体现在线程安全性、插入和删除的效率、内存占用和只能存储对象等方面。

优点

1. **动态大小**：

   `ArrayList` 可以根据需要自动调整其大小，用户无需手动管理数组的大小。

2. **快速随机访问**：

   由于内部实现基于数组，`ArrayList` 提供了 O(1) 的时间复杂度来通过索引访问元素，访问速度非常快。

3. **保持元素顺序**：

   `ArrayList` 保持插入元素的顺序，允许用户按插入顺序访问和遍历元素。

4. **允许重复元素**：

   `ArrayList` 允许存储重复的元素，这使得在某些情况下更灵活。

   

缺点

1. **非线程安全**：

   `ArrayList` 在多线程环境下是非线程安全的，多个线程同时访问和修改时可能会导致数据不一致。

2. **低效的插入和删除**：

   在数组的中间插入或删除元素时，可能需要移动后续的元素，导致时间复杂度为 O(n)。在尾部添加元素时，虽然通常是 O(1)，但在扩展容量时也会变为 O(n)。

3. **内存占用**：

   `ArrayList` 在扩展时可能会分配比实际需要更多的内存，导致内存的浪费。尤其是在大量元素删除后，内部数组的大小不会自动缩小。`trimToSize()` 方法可将数组容量调整为当前元素数量，释放多余空间。

4. **只能存储对象**：

   `ArrayList` 只能存储对象，不能直接存储基本数据类型（如 `int`、`char` 等），需要使用包装类（如 `Integer`、`Character` 等）。



### Vector的底层原理

[Vector API参考文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/Vector.html)

Java中的`Vector`类是一个线程安全的动态数组实现，`Vector`内部使用一个Object数组`elementData`存储元素，与`ArrayList`类似。默认初始容量为**10**。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250207173805391-2025-2-717:38:11.png" style="zoom:80%;" />

**扩容策略**

当元素数量超过当前数组长度时，Vector会进行扩容：

- 若通过构造函数指定了`capacityIncrement`参数（增量值），则新容量为`旧容量 + capacityIncrement`。
- 若未指定`capacityIncrement`（默认为0），则新容量为`旧容量 *2`（即翻倍）。
- 扩容时调用`Arrays.copyOf()`复制数据到新数组。

```java
public class VectorTest {
    public static void main(String[] args) {
        Vector<Integer> vector = new Vector<>();
        for (int i = 0; i < 10; i++) {
            vector.add(i);
        }
    //超出默认大小10，需要进行扩容
        vector.add(10);
    }
}
```

![与ArraList一样，使用grow函数做真正扩容操作](https://gitee.com/cmyk359/img/raw/master/img/image-20250207174352997-2025-2-717:43:54.png)

Vector的所有修改操作（如`add`、`remove`、`set`）均使用`synchronized`关键字修饰方法，确保多线程环境下的线程安全，但这也导致在单线程环境下性能不如ArrayList。

由于频繁的锁竞争导致性能低于`CopyOnWriteArrayList`（写时复制技术，适合读多写少场景）或`Collections.synchronizedList`（包装后的同步列表，通用同步），现在更推荐使用这两个来代替Vector。

**与 ArrayList对比：**

| **特性**       | **Vector**         | **ArrayList**              |
| -------------- | ------------------ | -------------------------- |
| **线程安全**   | 是（方法级同步）   | 否                         |
| **扩容策略**   | 默认翻倍或固定增量 | 默认增长50%（旧容量1.5倍） |
| **性能**       | 低（同步开销）     | 高                         |
| **迭代器遍历** | 需外部同步         | 非线程安全                 |

### Stack

首先，**`Stack` 未被纳入 Java 集合框架**。`Stack`类是一个自Java 1.0以来就存在的古老类，而Java 1.2 引入了集合框架。

`Stack`继承自`Vector`类，因此它也就继承了`Vector`的同步方法和一些不适用于栈操作的方法（如`insertElementAt`、`removeElementAt`等），这不仅破坏了栈应有的封装性，还造成了单线程下的性能问题。

从Java 1.6开始，Java引入了`Deque`接口（双端队列），并且提供了多种实现，如`ArrayDeque`和`LinkedList`。`Deque`接口支持在两端进行元素的插入和删除，因此完全可以作为栈来使用（栈只要求在一端进行操作）。

Java官方文档也建议使用`Deque`来实现栈的功能。在`Stack`类的文档中也有说明：“更完整和一致的LIFO栈操作由`Deque`接口及其实现提供，应该优先使用这类而不是`Stack`。

### LinkedList的底层原理

[LinkedList API参考文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/LinkedList.html)

Java中的 `LinkedList`是基于 **双向链表**实现的线性表，它的内部结构由节点（Node）构成，每个节点包含数据以及指向前后节点的指针（prev和next）。

此外，LinkedList还实现了Deque接口，因此可以作为<u>普通队列</u>和<u>双端队列</u>使用。

#### 核心字段

这个简单的 `Node` 类是 `LinkedList` 的基石。

```java
private static class Node<E> {
    E item;         // 存储的元素数据
    Node<E> next;   // 指向下一个节点的引用
    Node<E> prev;   // 指向上一个节点的引用

    // 构造函数
    Node(Node<E> prev, E element, Node<E> next) {
        this.item = element;
        this.next = next;
        this.prev = prev;
    }
}
```

size、first、last这三个属性维护了整个链表的状态。

```java
public class LinkedList<E>
    extends AbstractSequentialList<E>
    implements List<E>, Deque<E>, Cloneable, java.io.Serializable {
    
    // 链表中元素的数量
    transient int size = 0;
    
    /**
     * 指向第一个节点的指针
     * 如果链表为空，则为 null
     */
    transient Node<E> first;
    
    /**
     * 指向最后一个节点的指针
     * 如果链表为空，则为 null
     */
    transient Node<E> last;
    
    // 其他方法和构造函数...
}
```



#### 构造函数	

默认构造函数只是初始化一个空链表，头节点和尾节点都为null。当添加第一个元素时，头节点和尾节点都指向这个新创建的节点。当添加更多元素时，新节点会被添加到链表的尾部或头部，具体取决于调用的方法。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250207182132745-2025-2-718:21:39.png" style="zoom:80%;" />

带参数的构造函数接受一个`Collection`类型的参数`c`，这个参数是一个包含元素的集合。这个构造函数首先调用无参构造函数创建一个空的`LinkedList`，然后使用`addAll`方法将参数`c`中的所有元素添加到这个`LinkedList`中。这样，新创建的`LinkedList`就包含了参数`c`中的所有元素。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250207183326836-2025-2-718:33:36.png" style="zoom:80%;" />

#### 添加元素

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250207202158990-2025-2-720:22:03.png" style="zoom:80%;" />

```java
public class LinkedListTest {
    public static void main(String[] args) {
        LinkedList<Integer> list = new LinkedList<>();
        //添加一个结点，以add() 方法为例
        list.add(1);
        System.out.println(list);
    }
}
```

<img src="https://gitee.com/cmyk359/img/raw/master/img/未命名绘图-2025-2-719:42:03.jpg" style="zoom:80%;" />



#### 删除元素

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250207202653978-2025-2-720:26:55.png" style="zoom:80%;" />

```java
public class LinkedListTest {
    public static void main(String[] args) {
        LinkedList<Integer> list = new LinkedList<>();
        list.add(1);
        // 删除一个结点，以remove()方法为例
        list.remove();
        System.out.println(list);
    }
}
```

<img src="https://gitee.com/cmyk359/img/raw/master/img/未命名绘图-2025-2-720:44:57.jpg" style="zoom:80%;" />

其他操作类似，都是对双端链表进行操作

线程安全方面，LinkedList和ArrayList一样，不是线程安全的。如果多个线程同时修改链表，可能会导致数据不一致。因此，在多线程环境中，需要使用外部同步或使用并发集合类，比如CopyOnWriteArrayList，或者通过Collections.synchronizedList来包装LinkedList。


### List集合的选择

#### **List实现对比**：

| **实现类**                         | **数据结构** | **线程安全**            | **适用场景**                 | **性能特点**                                   |
| ---------------------------------- | ------------ | ----------------------- | ---------------------------- | ---------------------------------------------- |
| **`ArrayList`**                    | 动态数组     | ❌非线程安全             | 读多写少、频繁随机访问       | 快速随机访问（`O(1)`），尾部插入高效（`O(1)`） |
| **`LinkedList`**                   | 双向链表     | ❌非线程安全             | 频繁头尾增删、需实现队列/栈  | 头尾增删高效（`O(1)`），随机访问慢（`O(n)`）   |
| **`Vector`**                       | 动态数组     | ✅线程安全（方法级同步） | 遗留代码兼容（不推荐新项目） | 同步锁导致性能低，扩容默认翻倍                 |
| **`CopyOnWriteArrayList`**         | 动态数组     | ✅线程安全（写时复制）   | 高并发读、极少写             | 写操作昂贵（`O(n)`），读操作无锁（`O(1)`）     |
| **`Collections.synchronizedList`** | 包装类       | ✅线程安全（外部锁）     | 需要同步的非线程安全 `List`  | 性能优于 `Vector`，需手动控制锁范围            |

------

#### **选择策略**

**(1)单线程场景**

- **需求：快速随机访问** → **`ArrayList`** （如：按索引频繁读取或修改元素）
- **需求：频繁头尾增删** → **`LinkedList`** （如：实现队列、栈或中间插入删除）
- **需求：内存敏感** → **`ArrayList`** （连续内存空间，无指针开销）

**(2)多线程场景**

- **需求：读多写极少** → **`CopyOnWriteArrayList`** （读无锁，写时复制数据）
- **需求：通用同步** → **`Collections.synchronizedList(new ArrayList<>())`** （灵活控制同步范围）
- **⚠️避免使用 `Vector`**：性能低且设计陈旧。

**(3)特殊功能需求**

- **需求：双端队列（Deque）** → **`LinkedList`**或 **`ArrayDeque`** （`LinkedList`实现 `Deque`，但 `ArrayDeque`内存更优）
- **需求：栈（Stack）** → **`ArrayDeque`** （替代遗留的 `Stack`类）



**性能关键场景**:

| **场景**               | **推荐实现**           | **原因**                      |
| ---------------------- | ---------------------- | ----------------------------- |
| 大规模数据遍历         | `ArrayList`            | CPU缓存友好，连续内存加速遍历 |
| 高频中间插入/删除      | `LinkedList`           | 调整指针快于数组元素移动      |
| 高并发读（如配置表）   | `CopyOnWriteArrayList` | 读无锁，保证最终一致性        |
| 高并发写（如实时日志） | 外部同步 + `ArrayList` | 细粒度锁控制优于全方法同步    |

## 2.4、Set系列集合

<img src="https://gitee.com/cmyk359/img/raw/master/img/set.drawio-2025-9-717:24:06.png" style="zoom:80%;" />

Set系列集合：添加的元素是<span style="color:red">无序、不重复、无索引</span>。

- HashSet：无序、不重复、无索引；
- LinkedHashSet：**有序**、不重复、无索引。
- TreeSet：**按照大小默认升序排序**、不重复、无索引。

> 其中：**有序和无序**是指存和取的顺序是否一致，与元素值的大小无关；

Set要用到的常用方法，基本上就是Collection提供的，自己几乎没有额外新增的功能。

[Set API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/Set.html)

### HashSet的底层原理

[HashSet API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/HashSet.html)

`HashSet`的底层是基于`HashMap`实现的。HashSet实际上使用HashMap的**键**来存储元素，而值则统一使用一个固定的 `PRESENT`静态对象占位。由于HashMap的键是唯一的，这样可以保证元素的唯一性。

HashMap底层是数组+链表/红黑树的结构。HashSet的元素被存储在HashMap的键数组中，每个数组位置可能是一个链表或红黑树，用来处理哈希冲突。当链表长度超过阈值（默认为8）并且整个table的大小超过64时，链表会转换为红黑树，以提高查询效率；当红黑树节点数小于6时，会退化为链表。

源码解析如下：



#### 构造函数

创建一个空的HashMap。

```java
    /**
     * Constructs a new, empty set; the backing <tt>HashMap</tt> instance has
     * default initial capacity (16) and load factor (0.75).
     */
    public HashSet() {
        map = new HashMap<>();
    }
```

#### HashSet扩容和转成红黑树的机制

HashSet扩容机制：

1. **触发条件**：当HashMap中的元素数量超过 **当前容量 * 负载因子**时，会触发扩容。默认初始容量是16，负载因子0.75，所以当元素数超过12（16*0.75）时，会进行扩容。

   新容量：当前容量的 2倍（如 16 →32）。

   新阈值：新容量 ×负载因子（如 32 ×0.75 =24）。

   {% note info%}

   即：当存储的元素数量超过当前容量的3/4时触发扩容机制，新容量为当前容量的2倍

   {% endnote%}

2. 扩容过程

   创建新数组，容量翻倍。然后遍历旧数组的所有桶，将每个元素重新计算哈希值，确定在新数组中的位置。这个过程将原链表拆分为高位和低位链表，以减少重新哈希后的冲突。

HashMap底层是数组+链表/红黑树的结构。HashSet的元素被存储在HashMap的键数组中，每个数组位置可能是一个链表或红黑树，用来处理哈希冲突。

每将一个新元素结点插入到一个链表中，就需要根据当前链表的结点数和整个哈希表的长度进行判断，是否需要将当前的链表转化为红黑树存储。（<span style="color : red">树化条件：**链表长度 ≥8**且 **数组长度 ≥64**</span>）

- 若添加完新元素后，当前链表的<u>结点数</u>**达到**`TREEIFY_THRESHOLD` (8)，但整个哈希表的<u>长度</u>**未达到** `MIN_TREEIFY_CAPACITY` (64)，则只将哈希表进行扩容
- 若添加完新元素后，当前链表的<u>结点数</u>**达到**`TREEIFY_THRESHOLD` (8)，且整个哈希表的<u>长度</u>**达到** `MIN_TREEIFY_CAPACITY` (64)，则将当前链表转化为红黑树存储。



#### 添加元素add方法

案例：

```java
public static void main(String[] args) {
    Set<Object> set = new HashSet<>();
    //添加字符串，重复条件：哈希值相同 且 （键地址相同 或 equals返回 true）
    set.add("jack"); // T：添加成功
    set.add("dylan"); // T
    set.add("lucy");// T
    set.add("jack");// F：添加失败

    //添加不同的对象
    set.add(new Dog("Tom")); //T
    set.add(new Dog("Tom"));// T


    //添加字符串对象
    set.add(new String("xiaomei"));// T
    set.add(new String("xiaomei"));// F

    System.out.println(set);
}
```



步骤：

- 先获取元素的哈希值（hashCode方法），再对哈希值进行运算，得出一个索引值即为要存放在哈希表中的位置号
- 如果该位置上没有其他元素，则直接存放。
  如果该位置上已经有其他元素，则判断两者是否相等：
  - 若相等，则不再添加
  - 如果不相等，则遍历该链表中的其他结点，判断是否有相等的，有则不再添加；否则，添加到链表尾部
- 每次添加完元素，都要根据当前链表的结点数和整个哈希表的结点数进行判断，是否需要将当前的链表转化为红黑树存储。

可以先看第一次执行add函数时相关操作的注释，先熟悉各个方法及其作用，再分析更复杂的情况。

<img src="https://gitee.com/cmyk359/img/raw/master/img/未命名绘图-2025-2-800:58:50.jpg" alt="第一次add时相关操作的注释" style="zoom:80%;" />

1. 调用 `add(E e)`方法

   当向 `HashSet`添加元素时，实际调用的是 `HashMap`的 `put`方法：

   ```java
   /*
   HashSet 底层使用HashMap的键存储，值为静态对象 PRESENT
       // Dummy value to associate with an Object in the backing Map
       private static final Object PRESENT = new Object();
   */
   public boolean add(E e) {
       return map.put(e, PRESENT)==null; //返回结果为null时，说明添加成功
   }
   ---------------map.put()方法--------------------------------------------
   public V put(K key, V value) {
       return putVal(hash(key), key, value, false, true);
   }
   ```

2. 执行`put`方法，计算哈希值

   首先获得key的hashCode，再通过位运算对哈希值高位进行扰动（spread），将高位的信息引入低位，使得哈希值的低位部分更加随机化，从而减少冲突。

   ```java
   static final int hash(Object key) {
           int h;
           return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
       }
   ```

3. 执行`putVal`方法

   ```java
   final V putVal(int hash, K key, V value, boolean onlyIfAbsent, boolean evict) {
       //定义一些辅助变量
       Node<K,V>[] tab; Node<K,V> p; int n, i;
       // table 是 HashMap的一个数组，类型是Node[]
       //初始table为null 或者 table的大小为0时，执行 resize() 方法对table扩容
       if ((tab = table) == null || (n = tab.length) == 0)
           n = (tab = resize()).length; // 保存扩容后table的length，初始大小为 16
       /**
       *	索引定位：index = (n - 1) & hash 等价于 用hash 和 n 做模运算，确定该元素在数组中的位置
       *	并将index位置的元素 tab[index] 保存在变量p中，判断是不是null，即判断这个位置有没有放元素
       *	若为null，说明该为为空，创建包含新元素的结点，将其放在index的位置
       */
       if ((p = tab[i = (n - 1) & hash]) == null)
           tab[i] = newNode(hash, key, value, null);
       else { 
           // 若 tab[index] 不为null，说明该位置已经存储了元素（同义词）
           Node<K,V> e; K k;
           
           /**
           * 此时p指向的可能是链表的第一个结点，也可能是红黑树的根节点
           * 去重判断：重复条件：哈希值相同 且 （键地址相同 或 equals返回 true），具体逻辑如下：
           * 判断：
           *	1、如果当前索引位置对应的结点 和准备添加的key的hash值一样 （不同hash值可能会散列到同一个位置）
           * 并且满足 下面两个条件之一
           *   2.1、准备加入的 key 和 p 指向结点的 key 是同一个对象
           *   2.2、p指向结点的 key，通过equals()方法 和准备加入的key比较后相同（对于自定义的对象，可以重写equals方法，自定义两个对象相等的逻辑）
           * 则说明准备添加的key 在HashSet中已经存在，直接跳过
           */
           
           if (p.hash == hash &&
               ((k = p.key) == key || (key != null && key.equals(k))))
               e = p;
           
           // 再判断 p 指向的是不是一棵红黑树
           // 如果是一棵红黑树，就调用 putTreeVal() 方法进行判断/添加
           else if (p instanceof TreeNode)
               e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
           
           // 最后一种情况：当前p指向的是链表的第一个结点，但与待加入元素key不同
           else {
               
               /**
               * 循环遍历这个同义词链表中的所有结点，判断是否有和待加入元素key相同的。
               * 在for循环表达式中没有定义循环退出条件，是一个死循环，但在循环体内部有两种退出条件：
               */
               
               for (int binCount = 0; ; ++binCount) { 
                   //1、如果到达了链表尾部还没有提前退出，说明链表中没有与key相同的，则将key插入到链表末尾，并退出循环。
                   if ((e = p.next) == null) { // e = p.next，指针不断后移
                       //创建值为key的新结点，插入到链表末尾
                       p.next = newNode(hash, key, value, null);
                       
                       /**
                       * 每次插入新结点后都需进行判断，该链表是否已经达到8个结点，如果是，则调用treeifyBin 对当前这个链表进行树化，转成红黑树。
                       *  在 treeifyBin() 方法内部，首先判断 整个table的大小是否 超过了 MIN_TREEIFY_CAPACITY = 64
                       *  		如果没有超过，则先调用 resize() 对table进行扩容
                       *  		如果超过了，则进行树化（总结：树化的条件：当前链表节点个数 达到8 并且整个 table 的大小 达到64）
                       */
                       
                       if (binCount >= TREEIFY_THRESHOLD - 1) // TREEIFY_THRESHOLD = 8
                           treeifyBin(tab, hash);
                       break;
                   }
                   /**
                   * 与上面判断key和第一个结点是否相同的逻辑一样
                   * 判断链表中每一个结点是否和待插入的key相同，若发现有相同的，则直接break，退出循环
                   */
                   if (e.hash == hash &&
                       ((k = e.key) == key || (key != null && key.equals(k))))
                       break;
                   p = e; // 链表的循环指针后移，进行下一个结点的判断
               }
           }
           
           
           if (e != null) { // existing mapping for key 存在key相同的元素
               V oldValue = e.value;
               if (!onlyIfAbsent || oldValue == null)
                   e.value = value; //用新的value *替换* 该结的value
               afterNodeAccess(e);
               return oldValue; //不返回null，代表插入失败
           }
       }
       //对HashSet对象修改了一次，modCount++
       ++modCount;
       //添加了当前元素后，若数组的大小超过阈值threshold，则进行resize扩容
       if (++size > threshold)
           resize();
       //对当前HashMap来说，这是个空方法，主要是留给子类去实现，从而完成一下特定操作
       afterNodeInsertion(evict);
       //返回空代表成功
       return null;
   }
   ```

4. `resize()`方法分析

   ```java
   final Node<K,V>[] resize() {
       // 保存当前哈希表的引用到oldTab变量中
       Node<K,V>[] oldTab = table;
        // 获取当前哈希表的容量，如果表为空则容量为0
       int oldCap = (oldTab == null) ? 0 : oldTab.length;
       int oldThr = threshold;  // 保存当前的扩容阈值（threshold）
       int newCap, newThr = 0;  // 初始化新容量（newCap）和新阈值（newThr）
       
       //1、 如果当前哈希表的容量大于0
       if (oldCap > 0) {
           // 如果当前容量已经达到最大允许容量
           if (oldCap >= MAXIMUM_CAPACITY) {
               threshold = Integer.MAX_VALUE; //将扩容阈值设置为整型最大值（不再扩容）
               return oldTab; // 返回当前表，不进行扩容。
           }
           // 如果新容量（旧容量左移1位，即乘以2）小于最大容量 且 旧容量大于或等于默认初始容量
           else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                    oldCap >= DEFAULT_INITIAL_CAPACITY)
               newThr = oldThr << 1; // 将新阈值设置为旧阈值的2倍
       }
       //2、如果旧容量为0，但旧阈值大于0（表尚未初始化但已有阈值）
       else if (oldThr > 0) // initial capacity was placed in threshold
           newCap = oldThr; // 将新容量设置为旧阈值
       
       //3、 如果旧容量和旧阈值都为0（表示表完全未初始化）
       else {               
           newCap = DEFAULT_INITIAL_CAPACITY; // 设置新容量为默认初始容量（16）= 1 << 4;
           newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY); // 根据默认加载因子（0.75）计算新阈值（16 *0.75 =12）
       }
       
       //4、如果新阈值仍为0（可能在某些特殊情况下）
       if (newThr == 0) {
           float ft = (float)newCap * loadFactor;//计算新容量与加载因子的乘积
           newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                     (int)ft : Integer.MAX_VALUE); // 如果新容量和乘积都小于最大容量，则设置新阈值为乘积值，否则设置为整型最大值
       }
       
       
       threshold = newThr;// 更新扩容阈值为新阈值
       Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap]; // 创建一个新的哈希表，大小为新容量
       table = newTab; // 将当前表指向新表
       
       // 如果旧表不为空
       if (oldTab != null) {
           for (int j = 0; j < oldCap; ++j) { // 遍历旧表中的每个桶
               Node<K,V> e;
               if ((e = oldTab[j]) != null) { // 如果当前桶不为空
                   oldTab[j] = null; // 清空旧表中的当前桶
                   //1、如果当前桶中只有一个节点
                   if (e.next == null) 
                       newTab[e.hash & (newCap - 1)] = e;  // 根据新容量重新计算索引并放入新表中
                   //2、如果当前节点是树形节点（红黑树结构）
                   else if (e instanceof TreeNode)
                       ((TreeNode<K,V>)e).split(this, newTab, j, oldCap); // 调用TreeNode的`split`方法，将红黑树重新分配到新表中
                   //3、如果当前桶中是链表结构（多个节点）
                   else { 
                       Node<K,V> loHead = null, loTail = null; // 定义低位链表的头和尾
                       Node<K,V> hiHead = null, hiTail = null; // 定义高位链表的头和尾
                       Node<K,V> next;  // 临时变量用于保存下一个节点
                       do {
                           next = e.next;  // 保存当前节点的下一个节点
                           // 如果当前节点的哈希值与旧容量按位与为0（低位）
                           if ((e.hash & oldCap) == 0) { 
                               if (loTail == null) // 如果低位链表为空，将当前节点设为头节点
                                   loHead = e;
                               else			  // 否则将当前节点链接到低位链表的尾部
                                   loTail.next = e;
                               loTail = e; // 更新低位链表的尾节点。
                           }
                           // 如果当前节点的哈希值与旧容量按位与不为0（高位）
                           else {
                               if (hiTail == null)  // 如果高位链表为空，将当前节点设为头节点
                                   hiHead = e;
                               else				// 否则将当前节点链接到高位链表的尾部
                                   hiTail.next = e;
                               hiTail = e; 	// 更新高位链表的尾节点
                           }
                       } while ((e = next) != null);// 遍历当前桶的链表，直到链表末尾
                       
                       // 如果低位链表不为空
                       if (loTail != null) {
                           loTail.next = null; //断开低位链表的尾节点
                           newTab[j] = loHead; // 将低位链表放入新表的对应索引位置
                    }
                       // 如果高位链表不为空
                       if (hiTail != null) {
                           hiTail.next = null; //断开高位链表的尾节点
                           newTab[j + oldCap] = hiHead; // 将高位链表放入新表的对应索引位置（旧容量偏移）
                       }
                   }
               }
           }
       }
       // 返回扩容后的新哈希表
       return newTab;
   }
   
   ```

   

### LinkedHashSet的底层原理

[LinkedHashMap API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/LinkedHashSet.html)

LinkedHashSet 是 HashSet 的子类，基于LinkedHashMap实现，底层维护了一个 数组+ 双向链表。LinkedHashSet 根据元素的 hashCode 值来决定元素的存储位置，同时使用链表维护元素的次序，这使得元素看起来是以插入顺序保存的。它同样不允许添重复元素。

#### 源码分析

由于LinkedHashSet继承了HashSet，它其中的许多方法都是通过多态机制使用父类的方法完成，包括添加元素、扩容等与HashSet一样。只是它底层用的双向链表，与父类中的单链表或红黑树的结点结构不同。

结点结构：

其中的table数组结构为`HashMap$Node[]`，而双向链表中的结点类型为`LinkedHashMap$Entry`

```java
    
	/**
	*	LinkedHashMap的结点结构Entry，继承了HashMap中的静态内部类 Node
	*   包括：
	*		1、哈希值 hash
	*		2、key、value 键值对
	*		3、指向后继结点的next指针，此处用来连接同义词结点
	*		4、before 和 after 用来记录结点的插入顺序 （新增）
	*/
	static class Entry<K,V> extends HashMap.Node<K,V> {
        Entry<K,V> before, after;
        Entry(int hash, K key, V value, Node<K,V> next) {
            super(hash, key, value, next);
        }
    }

	// HashMap 的Node类型，它又实现了Map接口中的Entry内部接口
    static class Node<K,V> implements Map.Entry<K,V> {
        final int hash;
        final K key;
        V value;
        Node<K,V> next;

        Node(int hash, K key, V value, Node<K,V> next) {
            this.hash = hash;
            this.key = key;
            this.value = value;
            this.next = next;
        }

		// equals、hashCode、toString.....
    }
```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250208133657810-2025-2-813:37:19.png" style="zoom:80%;" />

构造函数

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250208143217618-2025-2-814:32:35.png" style="zoom:80%;" />

添加元素：

![](https://gitee.com/cmyk359/img/raw/master/img/未命名绘图-2025-2-814:44:13.jpg)



### TreeSet的底层原理

[TreeSet API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/TreeSet.html)

`TreeSet` 的底层完全依赖于 `TreeMap`，可以认为 `TreeSet` 是 `TreeMap` 的一个包装。具体来说：

- `TreeSet` 内部维护了一个 `TreeMap` 实例。
- `TreeSet` 的元素存储在 `TreeMap` 的键（`key`）中，而 `TreeMap` 的值（`value`）是一个固定的常量对象。

这一点和`HashSet`与`HashMap`的关系一样。



`TreeSet` 的元素存储顺序由底层 `TreeMap` 决定，排序规则可以是：

1. **自然顺序**：元素实现了 `Comparable` 接口。
2. **自定义顺序**：通过构造器传入自定义的比较器。

总结：

| 特性           | 说明                                                         |
| -------------- | ------------------------------------------------------------ |
| **底层实现**   | 基于 `TreeMap`，元素存储在 `TreeMap` 的键中。                |
| **有序性**     | 元素按自然顺序或自定义比较器排序。                           |
| **不允许重复** | 通过 `TreeMap` 的键唯一性保证。                              |
| **线程安全性** | `TreeSet` 是非线程安全的，可使用 `Collections.synchronizedSet` 包装。 |
| **时间复杂度** | 插入、删除、查找的时间复杂度为 `O(log n)`（红黑树的特性）。  |

#### 构造函数

`TreeSet` 的构造器实际上是对 `TreeMap` 的构造器的封装。

```java
public TreeSet() {
    this(new TreeMap<E,Object>());
}
```

TreeMap的构造器分析见下面TreeMap的内容。

#### 添加元素add

实现原理：

- 调用 `TreeMap.put(key, value)`，其中 `key` 是 `TreeSet` 的元素，`value` 是固定的 `PRESENT`。
- 如果 `TreeMap` 中已存在相同的键（即元素），`put` 方法会返回旧值，`TreeSet.add()` 返回 `false`。
- 如果键不存在，`put` 方法返回 `null`，`TreeSet.add()` 返回 `true`。

```java
public boolean add(E e) {
    return m.put(e, PRESENT)==null; // 调用 TreeMap 的 put 方法
}
```

TreeMap的`put`方法分析见下面TreeMap的内容。

#### 删除元素remove

调用 TreeMap 的 remove 方法删除指定元素。由于TreeMap的remove方法删除节点后，会返回该结点value，而TreeSet的key存储在TreeMap结点的键中，而值都是一个固定的常量对象`PRESENT`。通过判断返回的结果是否是`PRESENT`，返回元素的删除结果。

```java
public boolean remove(Object o) {
    return m.remove(o)==PRESENT; // 调用 TreeMap 的 remove 方法
}

// Dummy value to associate with an Object in the backing Map
private static final Object PRESENT = new Object();
```

## 2.5、Queue系列集合

<img src="https://gitee.com/cmyk359/img/raw/master/img/queue.drawio-2025-9-717:25:10.png" style="zoom:80%;" />

`Queue`（队列）中添加的元素按照特定的规则排序（FIFO, LIFO, 或优先级）访问元素通常被限制在队列的**头部**和**尾部**，不能随机访问中间元素。

除了Collction接口中定义的方法外，Queue接口中还定义了操作队列的常用方法：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250912160332570-2025-9-1216:03:39.png" style="zoom:80%;" />



### PriorityQueue

PriorityQueue（优先级队列）， 底层基于**堆** 实现（具体是一个**小根堆**），是一个**无界**队列。元素根据其**自然顺序**或构造时提供的 **`Comparator`** 进行排序，队头元素总是排序最小的。

源码分析如下：

#### 核心字段

```java
public class PriorityQueue<E> extends AbstractQueue<E> implements java.io.Serializable {
    // 存储元素的底层数组
    transient Object[] queue; // non-private to simplify nested class access
    //默认容量为11
    private static final int DEFAULT_INITIAL_CAPACITY = 11;
    // 最大数组容量，减去8是因为一些VM会在数组中保留一些头字，分配更大的数组可能会导致OutOfMemoryError
    private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;
    // 元素数量
    int size;
    // 比较器，如果为null则使用元素的自然排序
    private final Comparator<? super E> comparator;
    // 修改次数
    transient int modCount;
}
```



#### 扩容机制

优先级队列底层的数组默认大小为11。

向队尾添加元素时，若队中元素数量`size `达到数组`queue`的长度，触发扩容机制：

- 计算新容量：如果旧容量 < 64，则翻倍 + 2；否则扩容 50%。
- 若计算出的新容量超过了设置的最大容量`MAX_ARRAY_SIZE`，则按照所需的最小容量 minCapacity 扩容
  - 如果minCapacity  <  0，则溢出，已经超过`Integer.MAX_VALUE`
  - 如果所需的最小容量minCapacity已经大于`MAX_ARRAY_SIZE`，则直接分配最大的可能值`Integer.MAX_VALUE`；否则分配`MAX_ARRAY_SIZE`，这是一个相对安全的上限。

```java
private void grow(int minCapacity) {
    int oldCapacity = queue.length;
    //计算新容量：如果旧容量 < 64，则翻倍 + 2；否则扩容 50%
    int newCapacity = oldCapacity + ((oldCapacity < 64) ?
                                     (oldCapacity + 2) :
                                     (oldCapacity >> 1));
    // 处理溢出等情况
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);
    queue = Arrays.copyOf(queue, newCapacity);
}    
private static int hugeCapacity(int minCapacity) {
    if (minCapacity < 0) // overflow
        throw new OutOfMemoryError();
    return (minCapacity > MAX_ARRAY_SIZE) ?
        Integer.MAX_VALUE :
    MAX_ARRAY_SIZE;
}
```



#### 向队尾添加元素

add(e)、offer(e)

```java
public boolean add(E e) {
    return offer(e);
}

public boolean offer(E e) {
    if (e == null) throw new NullPointerException(); // 不允许null元素
    modCount++;
    int i = size;
    if (i >= queue.length)
        grow(i + 1); // 如果数组已满，则扩容
    siftUp(i, e);   // **核心：上浮操作，维护堆结构**
    size = i + 1;
    return true;
}
```

 在小根堆中插入元素 （新元素不断上升）：插入元素 `e` 时，先将其放在数组末尾（堆的最后一个叶子节点），然后不断与父节点比较。如果根据比较规则得出 `e` 比父节点“小”，就交换它们的位置，直到 `e` 找到一个比它“大”的父节点或到达根节点。`siftUp(int k, E x)` 上浮操作源码如下：

```java
private void siftUp(int k, E x) {
    if (comparator != null)
        siftUpUsingComparator(k, x, queue, comparator);
    else
        siftUpComparable(k, x, queue);
}
// 以使用Comparator为例
private static <T> void siftUpUsingComparator(int k, T x, Object[] es, Comparator<? super T> cmp) {
    while (k > 0) {
        int parent = (k - 1) >>> 1; // 找到父节点的索引
        Object e = es[parent];
        if (cmp.compare(x, (T) e) >= 0) // **如果新元素 >= 父节点，满足最小堆，停止上浮**
            break;
        es[k] = e; // 否则，将父节点下沉
        k = parent; // 继续向上比较
    }
    es[k] = x; // 找到最终位置，放入元素
}
```



#### 移除队头元素

```java
public E poll() {
    final Object[] es;
    final E result;
    if ((result = (E) ((es = queue)[0])) != null) {
        modCount++;
        final int n;
        final E x = (E) es[(n = --size)]; // 获取最后一个元素
        es[n] = null; // 将最后一个位置置空
        if (n > 0) {
            final Comparator<? super E> cmp;
            if ((cmp = comparator) == null)
                siftDownComparable(0, x, es, n); // **核心：下沉操作**
            else
                siftDownUsingComparator(0, x, es, n, cmp);
        }
    }
    return result;
}
```

从小根堆中删除元素（替代元素不断下坠）：移除根节点（最小元素）后，将堆的最后一个元素 `x` 提到根节点。然后让 `x` 与其**较小的子节点**比较。

- 如果 `x` 比它的两个子节点都“小”，则停止下沉。
- 否则，将 `x` 与那个“较小”的子节点交换，并在新的位置上重复这个过程，直到 `x` 找到合适的位置或成为叶子节点。

```java
private static <T> void siftDownUsingComparator(
    int k, T x, Object[] es, int n, Comparator<? super T> cmp) {
    // assert n > 0;
    // 计算堆的中间位置，即第一个叶子节点的索引
    //对于完全二叉树结构，叶子节点从索引n/2开始
    int half = n >>> 1;
   
    while (k < half) {  //只需与非叶节点比较即可
        
        // 计算左孩子的索引：2*k + 1
        int child = (k << 1) + 1; 
        Object c = es[child];
        
        // 右孩子的索引：child + 1
        int right = child + 1;
        //得到左右孩子中的较小的
        if (right < n && cmp.compare((T) c, (T) es[right]) > 0)
            c = es[child = right];
        // 如果当前元素x 小于或等于 左右孩子中的最小值，则满足最小堆，停止下沉
        if (cmp.compare(x, (T) c) <= 0)
            break;
        //将较小孩子节点的值提升到当前位置 k，然后更新 k 为孩子节点的索引，继续向下比较。
        es[k] = c;
        k = child;
    }
    // 将元素x放到最终位置k
    es[k] = x;
}
```

### Deque接口

`Deque`（Double Ended Queue，双端队列）是 `Queue` 接口的一个高级扩展。它不仅支持标准的队列操作（FIFO），还支持栈操作（LIFO）以及在队列两端进行操作。

***

`Deque`在继承`Queue`接口方法的基础上，极大地丰富了操作集合。几乎所有在 `Queue` 中只能操作队头的方法，在 `Deque` 中都有了对应的队尾操作版本。

例如，对于`add()`方法，新增了两个扩展方法`addFirst()`、`addLast()`。

***

此外Deque还扩展了`remove()`方法。在普通队列`Queue`中只能从队头删除，现在可以从队尾删除、删除第一次出现的指定元素、删除最后一次出现的指定元素。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250912171313904-2025-9-1217:13:36.png" style="zoom:80%;" />

***

`Deque` 提供了从队尾向队头遍历的**反向迭代器**

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250912171950251-2025-9-1217:19:51.png" style="zoom:80%;" />

```java
Deque<Integer> deque = new ArrayDeque<>();
deque.add(1);
deque.add(2);
deque.add(3); // 队列: [1, 2, 3]

// 正向迭代 (从 head 到 tail)
Iterator<Integer> it = deque.iterator();
while (it.hasNext()) {
    System.out.print(it.next()); // 输出 "123"
}

// 反向迭代 (从 tail 到 head)
Iterator<Integer> descIt = deque.descendingIterator();
while (descIt.hasNext()) {
    System.out.print(descIt.next()); // 输出 "321"
}
```



***

`Deque` 明确提供了模拟栈行为的方法，Java 官方文档明确建议使用 `Deque` 代替 `Stack`。因此在开发中，应优先选择 `Deque` 的实现类（如 `ArrayDeque`）来模拟栈行为。

- **`push(E e)`**：将元素推入此双端队列表示的栈顶（即头部），内部调用`addFirst(e)`
- **`pop()`**：从此双端队列所表示的栈中弹出栈顶元素，内部调用`removeFirst()`完成
- `peek()`：查看栈顶元素而不弹出，内部使用`peek()` 或 `peekFirst()`）。

```java
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1); // 栈顶: 1
stack.push(2); // 栈顶: 2, 元素: [2, 1]
stack.push(3); // 栈顶: 3, 元素: [3, 2, 1]

int top = stack.pop(); // 返回 3, 栈顶变为 2
top = stack.peek();    // 返回 2, 栈不变
```



### LinkedList

LinkedList同时实现了 `List` 接口和 `Deque`接口。这种双重身份使其能够灵活地作为列表、栈、队列或双端队列使用。

LinkedList底层的**双向链表**天然地同时支持了列表和双端队列的所有操作。通过实现多个接口，无需编写多份代码，根据不同的场景需求，通过不同的接口视角来使用同一个对象，这是一种非常巧妙和强大的抽象。

使用LinkedList作为双端队列：

- 没有容量限制，真正的动态大小；在头部和尾部操作非常高效
- 随机访问性能差，不能按索引访问；内存开销较大，每个元素需要额外空间存储前后节点的引用

LinkedList底层的重要结构和字段，以及基本的插入删除操作可以看上面List系列集合中的介绍，下面主要介绍它对Deque接口中方法的实现细节。

#### 在头部操作的方法

队头插入元素：`addFirst(E e)` / `offerFirst(E e)` / `push(E e)`

```java
// 将元素添加到双端队列的开头
public void addFirst(E e) {
    linkFirst(e);
}

public boolean offerFirst(E e) {
    addFirst(e);
    return true; // 由于LinkedList是无界的，总是返回true
}

// Stack操作：将元素推入栈顶（即头部）
public void push(E e) {
    addFirst(e);
}

// 实际的链接到首部的实现
private void linkFirst(E e) {
    final Node<E> f = first;      // 保存当前首节点引用
    final Node<E> newNode = new Node<>(null, e, f); // 创建新节点，其next指向原首节点
    first = newNode;              // 更新首节点指针为新节点
    
    if (f == null)                // 如果原链表为空
        last = newNode;           // 那么新节点也是尾节点
    else
        f.prev = newNode;         // 否则，原首节点的prev指向新节点
    
    size++;                       // 更新大小
    modCount++;                   // 修改计数器，用于迭代器的快速失败机制
}
```

***

查看队头元素：`getFirst()` / `peekFirst()` / `element()`

```java
// 获取但不移除双端队列的第一个元素
public E getFirst() {
    final Node<E> f = first;
    if (f == null)
        throw new NoSuchElementException();
    return f.item;
}

public E peekFirst() {
    final Node<E> f = first;
    return (f == null) ? null : f.item;
}

// 实现Queue的element操作（获取队首）
public E element() {
    return getFirst();
}
```

****

队头删除元素：`removeFirst()` / `pollFirst()` / `pop()`

```java
// 移除并返回双端队列的第一个元素
public E removeFirst() {
    final Node<E> f = first;
    if (f == null)
        throw new NoSuchElementException(); //队列为空抛出异常
    return unlinkFirst(f);
}

public E pollFirst() {
    final Node<E> f = first;
    return (f == null) ? null : unlinkFirst(f); //队列为空抛出null
}

// Stack操作：弹出栈顶元素（即头部）
public E pop() {
    return removeFirst();
}

// 实际的从首部解除链接的实现
private E unlinkFirst(Node<E> f) {
    final E element = f.item;      // 保存要返回的元素
    final Node<E> next = f.next;   // 保存首节点的下一个节点
    
    // 清理引用，帮助垃圾回收
    f.item = null;
    f.next = null; 
    
    first = next;                  // 更新首节点指针

    if (next == null)              // 如果链表只有一个元素，移除后为空，last指针也指向null
        last = null;
    else
        next.prev = null;          // 新首节点的prev置为null
    
    size--;                        // 更新大小
    modCount++;                    // 更新修改计数器
    return element;                // 返回被移除的元素
}
```

#### 在队尾操作的方法

队尾插入元素： `addLast(E e)` / `offerLast(E e)` / `add(E e)`/`offer(E e)`

```java
// 将元素添加到双端队列的末尾
public void addLast(E e) {
    linkLast(e);
}

public boolean offerLast(E e) {
    addLast(e);
    return true; // 由于LinkedList是无界的，总是返回true
}

// 实现Queue的add操作（在队尾添加）
public boolean add(E e) {
    linkLast(e);
    return true;
}

//实现Queu的offer操作（在队尾添加）
public boolean offer(E e) {
    return add(e);
}

// 实际的链接到尾部的实现
void linkLast(E e) {
    final Node<E> l = last;           // 保存当前尾节点引用
    final Node<E> newNode = new Node<>(l, e, null); // 创建新节点，其prev指向原尾节点
    last = newNode;                   // 更新尾节点指针为新节点

    if (l == null)                    // 如果原链表为空
        first = newNode;              // 那么新节点也是首节点
    else
        l.next = newNode;             // 否则，原尾节点的next指向新节点

    size++;                           // 更新大小
    modCount++;                       // 更新修改计数器
}
```

***

查看队尾元素：`getLast()` / `peekLast()`

```java
// 获取但不移除双端队列的最后一个元素
public E getLast() {
    final Node<E> l = last;
    if (l == null)
        throw new NoSuchElementException();
    return l.item;
}

public E peekLast() {
    final Node<E> l = last;
    return (l == null) ? null : l.item;
}
```

***

尾部删除：`removeLast()` / `pollLast()`

```java
// 移除并返回双端队列的最后一个元素
public E removeLast() {
    final Node<E> l = last;
    if (l == null)
        throw new NoSuchElementException();
    return unlinkLast(l);
}

public E pollLast() {
    final Node<E> l = last;
    return (l == null) ? null : unlinkLast(l);
}

// 实际的从尾部解除链接的实现
private E unlinkLast(Node<E> l) {
    final E element = l.item;      // 保存要返回的元素
    final Node<E> prev = l.prev;   // 保存尾节点的前一个节点
    
    // 清理引用，帮助垃圾回收
    l.item = null;
    l.prev = null;
    
    last = prev;                   // 更新尾节点指针
    
    if (prev == null)              // 如果链表只有一个元素，移除后为空
        first = null;
    else
        prev.next = null;          // 新尾节点的next置为null
    
    size--;                        // 更新大小
    modCount++;                    // 更新修改计数器
    return element;                // 返回被移除的元素
}
```

#### 删除特定元素的方法

`removeFirstOccurrence(Object o)` / `removeLastOccurrence(Object o)`

```java
// 从首部开始查找并删除第一次出现的指定元素
public boolean removeFirstOccurrence(Object o) {
    return remove(o); // 直接调用LinkedList的remove方法
}

// 从尾部开始查找并删除第一次出现的指定元素
public boolean removeLastOccurrence(Object o) {
    if (o == null) {
        // 从尾部向前遍历查找null元素
        for (Node<E> x = last; x != null; x = x.prev) {
            if (x.item == null) {
                unlink(x);
                return true;
            }
        }
    } else {
        // 从尾部向前遍历查找非null元素
        for (Node<E> x = last; x != null; x = x.prev) {
            if (o.equals(x.item)) {
                unlink(x);
                return true;
            }
        }
    }
    return false;
}

// 删除指定节点
E unlink(Node<E> x) {
    final E element = x.item;
    final Node<E> next = x.next;
    final Node<E> prev = x.prev;

    // 处理前驱节点
    if (prev == null) {
        first = next; // 如果x是首节点，更新first
    } else {
        prev.next = next;
        x.prev = null; // 帮助GC
    }

    // 处理后继节点
    if (next == null) {
        last = prev; // 如果x是尾节点，更新last
    } else {
        next.prev = prev;
        x.next = null; // 帮助GC
    }

    x.item = null; // 帮助GC
    size--;
    modCount++;
    return element;
}
```



### ArrayDeque

`ArrayDeque` 是 一个基于**循环数组**实现的高性能双端队列。它既可以作为队列使用（FIFO），也可以作为栈使用（LIFO）。它不允许插入null元素，且不是线程安全的。

#### 核心字段

数组的大小始终是2的幂次，这样可以通过位运算代替模运算来提高效率。

```java
public class ArrayDeque<E> extends AbstractCollection<E>
    implements Deque<E>, Cloneable, Serializable {

    // 存储元素的数组。容量总是2的幂次，这样可以使用位运算代替模运算提高效率
    transient Object[] elements;

    // 头部元素的索引，指向第一个元素的位置
    transient int head;

    // 尾部元素的索引，指向下一个要添加元素的位置，即最后一个元素的下一个位置
    transient int tail;

    // 最小初始容量（必须是2的幂次）
    private static final int MIN_INITIAL_CAPACITY = 8;
    // 其他方法和构造函数...
}
```

{% note primary %}

在循环数组中，当指针到达数组末尾时，我们需要让它“循环”回到数组开头。通常采用模运算来完成这个操作，但模运算在底层需要执行**除法**操作来得到余数，而除法是 CPU 中最慢的基本算术运算之一。另一种高效的方法是**按位与**操作，它要求**数组长度 `n` 是 2 的幂次**，位运算通常在一个时钟周期内就能完成，速度极快。

**当 `n` 是 2 的幂次时，`x % n` 等价于 `x & (n - 1)`**。

原理分析：任何一个 2 的幂次数，其二进制表示都有一个特点：只有一位是 1，其余位都是 0。当这个数减一后，会变成一个所有低位都是 1 的二进制数。任何数 `x` 与 `(n - 1)` 进行位与运算时，效果就是**保留 `x` 的低位，高位清零**。保留的低位所能表示的范围是[0, n - 1]，而这正是而余数的范围，这正好等同于 `x % n` 的效果。

![image-20250912212143057](https://gitee.com/cmyk359/img/raw/master/img/image-20250912212143057-2025-9-1221:21:44.png)

{% endnote %}



#### 构造函数

```java
// 默认构造方法，初始容量为16
public ArrayDeque() {
    elements = new Object[16];
}

// 指定初始容量的构造方法
public ArrayDeque(int numElements) {
    elements = new Object[calculateSize(numElements)];
}

// 从其他集合初始化的构造方法
public ArrayDeque(Collection<? extends E> c) {
    this(c.size());
    addAll(c);
}
```

其中，当传入了初始容量，使用`calculateSize` 将初始容量调整为2的幂次，具体地说是通过位运算将其调整为大于等于它的最小的2的幂次方。

```java
private static int calculateSize(int numElements) {
    int initialCapacity = MIN_INITIAL_CAPACITY;
    // 如果请求的容量大于最小初始容量，则找到大于等于numElements的最小2的幂次
    if (numElements >= initialCapacity) {
        initialCapacity = numElements;
        initialCapacity |= (initialCapacity >>>  1);
        initialCapacity |= (initialCapacity >>>  2);
        initialCapacity |= (initialCapacity >>>  4);
        initialCapacity |= (initialCapacity >>>  8);
        initialCapacity |= (initialCapacity >>> 16);
        initialCapacity++;
        
        if (initialCapacity < 0)   // 处理溢出
            initialCapacity >>>= 1; // 回退到2^30
    }
    return initialCapacity;
}
```

#### 扩容机制

当即 `head == tail`时，表示数组已满，需要进行扩容。 `doubleCapacity()` 是 扩容的核心方法.

**扩容过程解析：**

1. 计算新容量为原容量的**两倍**
2. 创建新数组
3. 将原数组**分两段拷贝**到新数组：
   - 第一段：从 `head` 到数组末尾的元素拷贝到新数组的开头
   - 第二段：从数组开头到 `head-1` 的元素拷贝到新数组的后续位置
4. 重置 `head` 为 0，`tail` 为原数组长度（即新数组的中间位置）

这种分段拷贝的方式有效地将循环数组"拉直"，使其在新数组中从索引 0 开始连续存储。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250912225705206-2025-9-1222:57:10.png" style="zoom:80%;" />

```java
private void doubleCapacity() {
    assert head == tail; // 只有在满的时候才调用此方法
    int p = head;
    int n = elements.length;
    int r = n - p; // head右边元素个数（包括head）

    int newCapacity = n << 1; // 新容量为原来的两倍
    if (newCapacity < 0) //溢出
        throw new IllegalStateException("Sorry, deque too big");

    Object[] a = new Object[newCapacity];

    // 分两段拷贝：
    // 1. 从head到数组末尾的元素拷贝到新数组的开头
    System.arraycopy(elements, p, a, 0, r);
    // 2. 从0到head-1的元素拷贝到新数组的后续位置
    System.arraycopy(elements, 0, a, r, p);

    elements = a;
    head = 0;
    tail = n;
}
```





#### 在队头操作的方法

在头部添加元素`addFirst(E e)` / `offerFirst(E e)`

操作过程：

1. 检查元素是否为 null，ArrayDeque 不允许插入 null 元素
2. 计算新的 `head` 位置：`(head - 1) & (elements.length - 1)`
   - 使用位运算代替模运算，并处理 `head - 1` 可能为负数的情况
   - 例如：当 `head` 为 0 时，`head - 1` 为 -1，与 `elements.length - 1` 进行与运算后会得到数组的最后一个位置
3. 将元素放入新的 `head` 位置
4. 如果新的 `head` 等于 `tail`，说明数组已满，需要扩容

```java
public void addFirst(E e) {
    //ArrayDeque 不允许插入 null 元素
    if (e == null)
        throw new NullPointerException();
    
    // 计算新的head：(head - 1) & (elements.length - 1)
    // 使用位运算代替模运算，处理负数情况
    elements[head = (head - 1) & (elements.length - 1)] = e;
    
    if (head == tail)
        doubleCapacity(); // 如果head追上tail，说明数组已满，需要扩容
}

public boolean offerFirst(E e) {
    addFirst(e);
    return true;
}
```



***

从头部移除元素：`removeFirst()` / `pollFirst()`

操作过程：

1. 获取 `head` 位置的元素
2. 如果元素为 null，返回 null（队列为空）
3. 将 `head` 位置设为 null，帮助垃圾回收
4. 更新 `head` 指针：`(head + 1) & (elements.length - 1)`
5. 返回被移除的元素

```java
public E pollFirst() {
    int h = head;
    @SuppressWarnings("unchecked")
    E result = (E) elements[h];
    
    if (result == null) // 队列为空
        return null;
    
    elements[h] = null; // help GC
    head = (h + 1) & (elements.length - 1); // 更新head指针
    return result;
}

public E removeFirst() {
    E x = pollFirst();
    if (x == null)
        throw new NoSuchElementException();
    return x;
}

```

***

查看队头元素：`getFirst()`/`peekFirst()`

```java
public E getFirst() {
    @SuppressWarnings("unchecked")
    E result = (E) elements[head];
    if (result == null) //队空，抛出异常
        throw new NoSuchElementException();
    return result;
}
public E peekFirst() {
    return (E) elements[head]; //直接通过数组下标获取队头元素
}
```



#### 在队尾操作的方法

在尾部添加元素：`addLast(E e)` / `offerLast(E e)`

```java
public void addLast(E e) {
    //ArrayDeque 不允许插入 null 元素
    if (e == null)
        throw new NullPointerException();
    elements[tail] = e; // 将元素放入tail位置
    
    // 计算新的tail：(tail + 1) & (elements.length - 1)
    if ( (tail = (tail + 1) & (elements.length - 1)) == head )
        doubleCapacity(); // 如果tail追上head，说明数组已满，需要扩容
}

public boolean offerLast(E e) {
    addLast(e);
    return true;
}
```

***

从尾部删除元素：`removeLast()` / `pollLast()`

```java
public E pollLast() {
    // 计算最后一个元素的位置：(tail - 1) & (elements.length - 1)
    int t = (tail - 1) & (elements.length - 1);
    @SuppressWarnings("unchecked")
    E result = (E) elements[t];
    
    if (result == null) // 如果该位置为null，说明队列为空
        return null;
    
    elements[t] = null; // help GC
    tail = t; // 更新tail指针
    return result;
}

public E removeLast() {
    E x = pollLast(); 
    //队空时抛出异常
    if (x == null)
        throw new NoSuchElementException(); 
    return x;
}
```

***

查看队尾元素：`peekLast()`/`getLast()`

```java
public E peekLast() {
    return (E) elements[(tail - 1) & (elements.length - 1)];
}

public E getLast() {
    @SuppressWarnings("unchecked")
    E result = (E) elements[(tail - 1) & (elements.length - 1)];
    if (result == null)
        throw new NoSuchElementException();
    return result;
}
```

#### 栈操作

通常使用`ArrayDeque`作为栈的实现，与 `LinkedList`相比，`ArrayDeque` 使用循环数组实现，内存连续访问，更适合现代 CPU 缓存机制，通常具有更好的性能。

```java
public void push(E e) {
    addFirst(e);
}

public E pop() {
    return removeFirst();
}

public E peek() {
    return peekFirst();
}
```



# 三、Map集合

<img src="https://gitee.com/cmyk359/img/raw/master/img/map.drawio-2025-9-717:02:08.png" style="zoom:80%;" />

## 3.1、Map接口和常用方法



在[Map接口 API](https://www.runoob.com/manual/jdk11api/java.base/java/util/Map.html) 中查看相关方法

特点：

- Map与Collection并列存在。用于保存具有映射关系的数据：Key-Value（双列元素）
- Map 中的 key 和 value 可以是任何引用类型的数据，会封装到HashMap$Node对象中
- Map 中的 key 不允许重复。若插入了key相同但value不同的新键值对，会**替换**掉原有的键值对
- Map 中的value可以重复
- Map 的key 可以为 null，value 也可以为null，注意 key 为null，只能有一个，value 为null，可以多个.
- key 和 value 之间存在单向一对一关系，即通过指定的 key 总能找到对应的 value
- 常用String类作为Map的key

> 注：其中key是按哈希值散列到数组中的，存入的顺序和取出的顺序不一定相同（**不保证有序**）

## 3.2、Map的遍历方式

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250208222007311-2025-2-822:20:54.png)

1. 先获取Map集合全部的键，再通过遍历键来找值

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250208222217866-2025-2-822:22:19.png" alt="主要方法" style="zoom:80%;" />

   ```java
   public static void main(String[] args) {
       Map<String, String> map = new HashMap<>();
       map.put("name","jack");
       map.put("sex","male");
       Set<String> keys = map.keySet();
       for (String key : keys) {
           System.out.println(key + "---" + map.get(key));
       }
   }
   ```

2. 把“键值对“看成一个整体进行遍历

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250208222635363-2025-2-822:26:36.png" alt="主要方法" style="zoom: 80%;" />

   ```java
   public static void main(String[] args) {
       Map<String, String> map = new HashMap<>();
    map.put("name","jack");
       map.put("sex","male");
       Set<Map.Entry<String, String>> entries = map.entrySet();
   
       for (Map.Entry<String, String> entry : entries) {
           System.out.println(entry.getKey()+" -- "+entry.getValue());
       }
   }
   ```
   
3. 使用`forEach`方法结合 Lambda表达式遍历Map

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250208223042986-2025-2-822:30:44.png" alt="主要方法" style="zoom:80%;" />

   ```java
   public static void main(String[] args) {
       Map<String, String> map = new HashMap<>();
       map.put("name","jack");
       map.put("sex","male");
   
       map.forEach((k, v) -> System.out.println(k+"---"+v));
   }
   ```

   forEach方法内部其实使用了第二种遍历方法，获得Map的entrySet，再获取各个Entry的key和value

   <img src="https://gitee.com/cmyk359/img/raw/master/img/未命名绘图-2025-2-822:42:36.jpg" style="zoom:80%;" />

## 3.3、HashMap底层原理分析

[HashMap API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/HashMap.html)

### table数组和EntrySet

首先HashMap是基于哈希表实现的，它使用数组和链表（或红黑树）来处理冲突。数组中的每个元素是一个链表，当链表长度超过阈值时会转为红黑树。这个数组对应着HashMap源码中定义的table数组，里面存放的是`HashMap$Node`类型的对象。每个Node包含哈希值、键、值以及指向下一个节点的引用。

```java
transient Node<K,V>[] table;

// HashMap 的Node，它又实现了Map接口中的Entry内部接口
static class Node<K,V> implements Map.Entry<K,V> {
    final int hash;
    final K key;
    V value;
    Node<K,V> next;

    Node(int hash, K key, V value, Node<K,V> next) {
        this.hash = hash;
        this.key = key;
        this.value = value;
        this.next = next;
    }

    // equals、hashCode、toString.....
}
```

为了方便程序员的遍历，HashMap还提供了entrySet视图（View），它存放的元素的类型是 `Map$Entry`，其中存储着key和value。

**entrySet视图并不独立存储数据，是通过<u>迭代器</u>动态访问底层 `table`数组中的键值对，`entrySet`中的所有键值对均来自 `table`数组中的 `Node`节点。**因此，`entrySet`本质上是`table`数组的逻辑抽象，提供对键值对的统一访问接口。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250208220230998-2025-2-822:02:36.png" style="zoom:80%;" />

> `Map`接口中的`Entry`接口包含了许多**方便遍历键值对的方法**，如`get`、`put`、`entrySet`、`keySet`和`values`等，HashMap的`Node`内部类就实现了`Entry`接口，因此本身就是一个键值对（Entry）。

`entrySet`中的每个entry对象直接对应`table`数组中的`Node`对象。无需额外封装，因为`Node`本身是`Map.Entry`的实现类。对`Node`的修改（如通过`Entry.setValue()`）会直接影响`EntrySet`的视图，<u>反之亦然</u>。两者共享同一数据源，保证了数据一致性。

`entrySet`并非预先创建所有entry对象，而是在调用`entrySet()`方法时返回一个内部类对象（如`EntrySet`的实例）。该对象仅在需要时（如迭代时）访问`table`数组。

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250208180636465-2025-2-818:06:41.png)



那entrySet是如何通过迭代器获得键值对的映射集合的呢？

案例：

```java
public class HashMapTest {
    public static void main(String[] args) {
        Map<String, String> map = new HashMap<>();
        map.put("name","jack");
        map.put("sex","male");
        // 获得entrySet
        Set<Map.Entry<String, String>> entries = map.entrySet();
        //使用增强for遍历
        for (Map.Entry<String, String> entry : entries) {
            System.out.println(entry.getKey()+" -- "+entry.getValue());
        }
    }

}
```

查看它的字节码文件可知，entrySet的元素是通过迭代器Iterator遍历得来的，所以entrySet()方法能有键值对的映射集合，是因为iterator()方法。

```java
public class HashMapTest {
    public HashMapTest() {
    }

    public static void main(String[] args) {
        Map<String, String> map = new HashMap();
        map.put("name", "jack");
        map.put("sex", "male");
        Set<Entry<String, String>> entries = map.entrySet();
        Iterator var3 = entries.iterator();

        while(var3.hasNext()) {
            Entry<String, String> entry = (Entry)var3.next();
            System.out.println((String)entry.getKey() + " -- " + (String)entry.getValue());
        }

    }
}
```

那么entrySet的迭代器对象Iterator是怎样的呢？

当调用 `entrySet()`方法时，会返回一个 `EntrySet`视图对象

```java
transient Set<Map.Entry<K,V>> entrySet;

public Set<Map.Entry<K,V>> entrySet() {
    Set<Map.Entry<K,V>> es;
    //调用 entrySet方法时才会对entrySet属性进行初始化
    // 返回map中各个键值对映射关系的集合
    return (es = entrySet) == null ? (entrySet = new EntrySet()) : es;
}
```

在EntrySet类内部，通过`iterator()`方法，返回一个`EntryIterator`对象。而`EntryIterator`继承自 `HashIterator`，使用父类 HashIterator 中的 next()方法 返回Entry对象。核心逻辑在 `HashIterator`中的next方法中：

```java
final class EntrySet extends AbstractSet<Map.Entry<K,V>> {
	//.....
    public final Iterator<Map.Entry<K,V>> iterator() {
        return new EntryIterator(); //返回 EntryIterator迭代器
    }
    //...
}

---------------EntryIterator>>>>>>>>>>>>>>>>>
    
final class EntryIterator extends HashIterator  
    implements Iterator<Map.Entry<K,V>> {
    public final Map.Entry<K,V> next() { 
        return nextNode(); // 使用父类 HashIterator 中的 next()方法 返回Entry对象
    }
}

---------------HashIterator>>>>>>>>>>>>>>>>>>>>>>
abstract class HashIterator {
    Node<K,V> next;        // next entry to return
    Node<K,V> current;     // current entry
    int expectedModCount;  // for fast-fail 记录迭代器创建时的修改次数（用于快速失败校验）
    int index;             // current slot 当前遍历的哈希桶索引（从0开始遍历哈希表数组）
    
    
    HashIterator() {
        expectedModCount = modCount; //保存当前HashMap的修改次数（用于并发修改检测）
        Node<K,V>[] t = table; 		//获取哈希表数组引用 
        current = next = null;		//初始化当前和下一个节点为null 
        index = 0;				  //从哈希表的第一个桶开始遍历 
        
        if (t != null && size > 0) { //如果哈希表非空且存在元素
            //跳过所有空桶，找到第一个非空节点
            do {} while (index < t.length && (next = t[index++]) == null);
        }
    }
    
    //判断是否还有下一个节点
    public final boolean hasNext() {
        return next != null;
    }
    
    //核心方法：获取下一个节点并更新状态 
    final Node<K,V> nextNode() {
        Node<K,V>[] t;			//临时变量保存哈希表数组 
        Node<K,V> e = next;		//临时保存当前要返回的节点 
        
        //如果发现外部修改了HashMap结构，抛出并发修改异常
        if (modCount != expectedModCount) 	
            throw new ConcurrentModificationException();
        
        //如果next为null，说明没有更多元素，抛出无元素异常
        if (e == null)
            throw new NoSuchElementException();
        
         //如果当前桶的链表/树遍历完毕，继续查找下一个非空桶
        if ((next = (current = e).next) == null && (t = table) != null) {
            //循环查找下一个非空链表
            do {} while (index < t.length && (next = t[index++]) == null);
        }
        // 返回下一个结点
        return e;
    }
    
    //删除当前遍历的节点 
    public final void remove() {
        Node<K,V> p = current;	//获取当前节点（由nextNode()设置的current）
        //如果未调用next()直接调用remove()，抛出非法状态异常 
        if (p == null)
            throw new IllegalStateException();
        //校验并发修改 
        if (modCount != expectedModCount)
            throw new ConcurrentModificationException();
        current = null;	//清除当前节点引用（避免重复删除）
        K key = p.key;	//获取要删除节点的key 
        removeNode(hash(key), key, null, false, false);	//调用HashMap的删除方法 
        expectedModCount = modCount;	//更新修改次数（因为removeNode修改了modCount）
    }
}
```

总结：

`entrySet`通过迭代器（`HashIterator`）直接遍历 `table`数组中的每个桶。

- 迭代器动态定位非空桶，并按链表或树结构遍历所有节点。
- 整个过程无需复制数据，保证了高效的内存使用和遍历性能。

### 添加元素和扩容机制

之前已经学习过HashSet的底层原理，它就是通过HashMap实现的，所以它们添加元素和扩容的机制完全相同。参考[HashSet添加元素过程的源码分析](https://catpaws.top/#添加元素add方法)、[HashSet扩容和树化的机制](https://catpaws.top/#hashset扩容和转成红黑树的机制)

- HashMap底层维护了Node类型的数组table，默认为null
- 当创建对象时，将加载因子（loadfactor）初始化为0.75.
- 当添加key-val时，通过key的哈希值得到在table的索引。然后判断该索引处是否有元素如果没有元素直接添加。如果该索引处有元素，继续判断该元素的key和准备加入的key相是否等，如果相等，则直接替换val；如果不相等需要判断是树结构还是链表结构，做出相应处理。如果添加时发现容量不够，则需要扩容。
- 第1次添加，则需要扩容table容量为16，临界值（threshold）为12（16*0.75）
- 以后再扩容，则需要扩容table容量为原来的2倍（32），临界值为原来的2倍，即24，依次类推.
- 在Java8中，如果一条链表的元素个数超过TREEIFY THRESHOLD（默认是8），并且table的大小 >= MIN_TREEIFY_CAPACITY（默认64），就会进行树化（红黑树）

### 线程安全问题

HashMap没有实现同步，它的操作方法上没有加`synchronized`关键字，因此是线程不安全的。在多线程环境下直接使用 `HashMap`可能导致数据不一致、死循环、甚至程序崩溃。

存在的线程安全问题：

- **数据丢失（覆盖）**

  当多个线程同时调用 `put()`方法时，可能发生哈希冲突的键值对被覆盖。

  **示例场景**：

  - 线程 A和线程 B同时向同一个桶（哈希冲突）插入不同的键值对。
  - 如果两个线程同时检测到该桶为空，并尝试插入数据，最终只有一个线程的修改会保留。

- **链表成环（JDK1.7的经典问题）**

  在 JDK1.7中，`HashMap`使用**头插法**处理哈希冲突的链表。当多线程同时触发 `resize()`（扩容）时，在链表迁移过程中修改节点的 `next`指针，链表节点的 `next`指针被错误地指向其他节点，导致链表成环，后续的 `get()`操作陷入死循环。

  举个例子，假设原数组的某个位置有一个链表A→B→null。

  - 当线程1开始扩容，遍历到节点A，计算它的哈希值，将其插入到新数组的某个位置。准备开始处理节点B，此时线程1被挂起，新数组中的链表为A→null
  - 接着线程2开始扩容，同样处理这个链表，完成扩容操作，此时已经将链表转移为B→A→null。（**关键的是它把节点B的next设置为了节点A。**）
  - 当线程1恢复执行时，继续处理节点B，并保存它的next节点A（下一个要处理的）。将B插入链表头部，结果为B→A→null；接着再处理节点A，将它插入链表头部，结果为**A→B→A**→null。此时就出现了链表成环（死链），后续的 `get()`操作陷入死循环。

  JDK1.8中，链表插入改为**尾插法**，避免了扩容时的链表成环问题，但并发 `put()`仍可能导致数据丢失或链表断裂。

- **数据不一致（脏读）**

  一个线程在遍历 `HashMap`时，另一个线程修改了结构（如添加或删除元素），导致遍历结果不可预测。

**线程安全的替代方案**

| **方案**                            | **原理**                                         | **适用场景**       |
| ----------------------------------- | ------------------------------------------------ | ------------------ |
| **`ConcurrentHashMap`**             | 分段锁（JDK1.7）或 CAS + synchronized（JDK1.8+） | 高并发读写场景     |
| **`Collections.synchronizedMap()`** | 通过全局锁包装 `HashMap`                         | 低并发场景         |
| **`Hashtable`**                     | 所有方法加 `synchronized`锁                      | 遗留代码（不推荐） |

## 3.4、Hashtable的底层原理分析

[Hashtable API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/Hashtable.html)

Hashtable是 Java早期提供的线程安全键值对存储结构，其设计与 HashMap类似，但实现细节和线程安全机制有显著差异。

Hashtable底层使用**数组 +链表**实现，与 HashMap类似，Hashtable使用 `Entry[] table`数组存储键值对，每个数组元素是一个链表头节点。Hashtable **没有像 HashMap的链表转红黑树**的优化（JDK1.8+），哈希冲突完全依赖链表解决。

Hashtable的键和值都不允许为null。

> Hashtable存储结点使用的Entry类型 和 HashMap存储结点使用的Node类型都是实现了Map.Entry接口

Hashtable的所有公共方法（如 `put()`, `get()`）均用 `synchronized`修饰，保证单实例线程安全。（**方法级同步**）。由于所有操作竞争同一把锁，高并发下性能差（对比 ConcurrentHashMap的分段锁或 CAS机制）。

### **扩容机制**

- **初始容量**：默认 `11`（HashMap默认 `16`），负载因子默认为0.75.

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250208235237416-2025-2-823:52:40.png" style="zoom:80%;" />

- **扩容触发条件**：当元素数量超过 `阈值（threshold = capacity * loadFactor）`

- **扩容规则**：新容量为 `旧容量 * 2 +1`，而 HashMap直接翻倍。

- **重新哈希**：所有键值对需重新计算索引并迁移到新数组，过程与 HashMap类似。

### 源码分析

<img src="https://gitee.com/cmyk359/img/raw/master/img/未命名绘图-2025-2-900:28:49.jpg" style="zoom:80%;" />

## 3.5、Properties

[Properties API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/Properties.html)

properties类继承自Hashtable类并且实现了Map接口，也是使用一种键值对的形式来保存属性集。

它是 Java中用于处理 **键值对配置文件**的专用类，主要面向 `.properties`文件的读写，键和值均为 `String`类型，非字符串操作会抛出 `ClassCastException`。

> 通过覆写 `put()`、`get()`等方法限制键值类型为 `String`，直接调用 `Hashtable`的非字符串方法（如 `put(Object,Object)`）可能导致类型错误。

**核心特性**：

| **特性**          | **说明**                                                     |
| ----------------- | ------------------------------------------------------------ |
| **键值类型**      | 键和值均为 `String`类型，非字符串操作会抛出 `ClassCastException`。 |
| **线程安全**      | 继承自 `Hashtable`，方法使用 `synchronized`修饰，但并发性能较低。 |
| **默认值链**      | 支持通过 `defaults`属性链式查找未定义的键（类似继承机制）。  |
| **文件读写**      | 提供 `load()`和 `store()`方法处理 `.properties`文件编码与转义。 |
| **无 `null`键值** | 与 `Hashtable`一致，不允许 `null`键或值。                    |



[参考文章](https://www.cnblogs.com/xudong-bupt/p/3758136.html)

## 3.5、TreeMap底层原理分析

[TreeMap API 文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/TreeMap.html)

`TreeMap`是 Java中基于红黑树（Red-Black Tree）实现的有序映射（SortedMap），其核心特性是**按键的自然顺序或自定义比较器顺序存储键值对**。

`TreeMap` 的键通常是不可变的。这是因为 `TreeMap` 的内部结构（红黑树）依赖于键的比较结果来维护顺序。如果键在插入后被修改，那么可能会破坏树的结构，导致不正确的行为。

与大多数集合类一样，`TreeMap`是非线程安全的，需通过 `Collections.synchronizedSortedMap()`包装。

对比HashMap:

| 特性        | TreeMap      | HashMap           |
| ----------- | ------------ | ----------------- |
| 底层结构    | 红黑树       | 数组 +链表/红黑树 |
| 键顺序      | 有序         | 无序              |
| 时间复杂度  | O(log n)     | O(1)（理想情况）  |
| 线程安全    | 否           | 否                |
| 允许 null键 | 取决于比较器 | 允许              |

- **时间复杂度**：所有核心操作（插入、删除、查找）的时间复杂度为 **O(log n)**。
- **空间复杂度**：O(n)，每个节点需要存储额外信息（父节点、颜色）。

**适用场景**

- 需要有序键的场景（如范围查询）。
- 键的插入顺序不重要，但需要按特定顺序遍历。
- 对性能要求不高但需要稳定对数时间复杂度的场景。

### 数据结构

`TreeMap`的底层数据结构是红黑树，一种自平衡的二叉搜索树（BST）。

[红黑树相关知识点](https://catpaws.top/24d4ba7c/#红黑树rbt)

`TreeMap`的节点通过内部类 `Entry<K, V>`表示，包含键、值、父节点、左子节点、右子节点以及颜色标志。

```java
static final class Entry<K,V> implements Map.Entry<K,V> {
    K key;
    V value;
    Entry<K,V> left;
    Entry<K,V> right;
    Entry<K,V> parent;
    boolean color = BLACK;

    /**
      * Make a new cell with given key, value, and parent, and with
      * {@code null} child links, and BLACK color.
       */
    Entry(K key, V value, Entry<K,V> parent) {
        this.key = key;
        this.value = value;
        this.parent = parent;
    }
    //其他方法........
}
```

### 构造方法

`TreeMap` 提供了多个构造器：

- **默认的无参构造器**

  使用默认的无参构造器创建TreeMap时，会使用键的自然顺序。也就是说，键必须实现 `Comparable` 接口，并且 `compareTo` 方法必须能够正确地比较两个键的大小。否则在插入时会抛出`ClassCastException`，不支持 `null`键（自然顺序无法比较`null`）。

  ```java
  public TreeMap() {
      comparator = null; //使用键的自然顺序（键需实现Comparable接口）
  }
  ```

  

- **指定比较器的构造器**

  完全由用户定义的比较器决定键的排序，允许键不实现 `Comparable`接口。

  ```java
  TreeMap(Comparator<? super K> comparator) {
      this.comparator = comparator; // 显式指定比较器
  }
  ```

  示例:

  ```java
  public static void main(String[] args) {
          // 自定义比较器：按键的长度进行排序
          Comparator<String> lengthComparator = (s1, s2) -> Integer.compare(s1.length(), s2.length());
  
          // 创建 TreeMap 并传入自定义比较器
          TreeMap<String, Integer> map = new TreeMap<>(lengthComparator);
  
          // 插入元素
          map.put("apple", 1);
          map.put("banana", 2);
          map.put("pear", 3);
          map.put("kiwi", 4);
  
          // 遍历 TreeMap
          for (Map.Entry<String, Integer> entry : map.entrySet()) {
              System.out.println(entry.getKey() + " => " + entry.getValue());
          }
      }
  }
  ```

  

- **基于 `SortedMap`的构造器**

  构造器接收一个`SortedMap`作为参数，并创建一个新的`TreeMap`实例。新创建的`TreeMap`将包含与传入的`SortedMap`相同的键值对，并且这些键值对将按照`SortedMap`的排序顺序进行排序。(从已有的 `SortedMap`中继承比较器和键值对。)

  通过基于`SortedMap`的构造器创建`TreeMap`，可以方便地将一个已经排序的映射复制到新的`TreeMap`中，同时保持相同的排序顺序,无需重新排序。这可以提高性能，特别是当映射很大时。

  ```java
  public static void main(String[] args) {
  
      SortedMap<Integer, String> sortedMap = new TreeMap<>();
      sortedMap.put(1, "One");
      sortedMap.put(2, "Two");
      sortedMap.put(3, "Three");
      // treeMap 现在将包含与 sortedMap 相同的键值对，并且按照相同的顺序排序
      TreeMap<Integer, String> treeMap = new TreeMap<>(sortedMap);
  }
  ```

  > SortedMap接口有一个子接口NavigableMap，它在SortedMap的基础上增加了一些额外的导航方法，使得对有序键值对的操作更加方便和灵活。NavigableMap接口提供了如`lowerKey`、`floorKey`、`ceilingKey`、`higherKey`等导航方法，以及`pollFirstEntry`、`pollLastEntry`等移除并返回最小/最大键值对的方法。

- 基于普通 `Map`的构造器

   当使用普通的`Map`构造器来创建`TreeMap`实例时，`TreeMap`会根据Map中键的值来构造红黑树，重新组织结点，它要求键必须是可以比较的。如果提供的`Map`中的键没有实现`Comparable`接口，那么必须在使用`TreeMap`的构造器时提供一个自定义的比较器，否则会抛出`ClassCastException`。

     

### put()方法分析

插入操作的核心是维护红黑树的平衡，步骤如下：

1. **二叉搜索树插入**：按 BST规则找到插入位置。
2. **颜色修正与旋转**：通过调整颜色和旋转保持红黑树性质。

```java
public V put(K key, V value) {
    Entry<K,V> t = root;
    
    //判断根节点是否为空
    if (t == null) {
        //调用 compare 方法，主要是为了检查 key 的类型是否正确以及是否为 null
        compare(key, key); // type (and possibly null) check
		// 创建一个新的 Entry 节点作为根节点，key 和 value 是传入的参数，父节点为 null
        root = new Entry<>(key, value, null); 
        size = 1;	// 树的大小设置为1
        modCount++;	// 修改计数器加1，表示树结构发生了变化
        return null; //添加成功，返回null 
    }
    int cmp;
    Entry<K,V> parent; //用于存储待插入节点的父节点
    
    // 获取比较器，如果有自定义的比较器，则使用它；否则使用 key 的自然顺序比较
    // 根据比较结果寻找新结点的插入位置，最终插入在parent结点下
    Comparator<? super K> cpr = comparator;
    if (cpr != null) {
        do {
            parent = t; // 将当前节点赋值给 parent，记录父节点
            // 使用比较器比较传入的 key 和当前节点的 key
            cmp = cpr.compare(key, t.key); 
            
            if (cmp < 0)
                t = t.left;	// 如果 key 小于当前节点的 key，移动到左子树
            else if (cmp > 0)
                t = t.right; // 如果 key 大于当前节点的 key，移动到右子树	
            else
                return t.setValue(value);  // 如果 key 等于当前节点的 key，更新 value 并返回旧值
        
        } while (t != null); // 循环直到找到空位置插入新节点
    }
    else {
        if (key == null) // 如果 key 为 null，抛出空指针异常
            throw new NullPointerException();
        @SuppressWarnings("unchecked")
        // 将 key 转换为 Comparable 类型，用于自然顺序比较
        Comparable<? super K> k = (Comparable<? super K>) key;
        do {
            parent = t; // 将当前节点赋值给 parent，记录父节点
            
             // 使用自然顺序比较传入的 key 和当前节点的 key 
            cmp = k.compareTo(t.key); 
            // 同上，根据比较结果寻找插入位置
            if (cmp < 0)
                t = t.left;	
            else if (cmp > 0)
                t = t.right;
            else
                return t.setValue(value);
        } while (t != null);
    }
    // 创建一个新的 Entry 节点，父节点为 parent
    Entry<K,V> e = new Entry<>(key, value, parent);
    
    // 比较 key 和 parent的key的大小，上面循环中最后一轮已经计算出来了，决定将新结点插入到左孩子还是右孩子
    
    if (cmp < 0)
        parent.left = e;
    else
        parent.right = e;
    fixAfterInsertion(e); // 调用修复方法，调整树的平衡性
    size++; // 树的大小加1
    modCount++; // 修改计数器加1，表示树结构发生了变化
    return null; // 当前是新结点，没有旧值，返回null
}
```



### get() 方法分析

查找操作基于二叉搜索树的特性

```java
public V get(Object key) {
    //调用getEntry()方法，根据key返回Entry对象
    Entry<K,V> p = getEntry(key);
    //判断：若Entry对象为空，则返回null；否则返回对应的value
    return (p==null ? null : p.value);
}
/**
*查找指定键 key所对应节点的逻辑。
*	首先检查是否有自定义比较器，如果有，则使用比较器进行查找；否则，通过* 键的自然顺序遍历树来查找。
*	如果找到匹配的节点，返回该节点；如果未找到，返回 null。
*
*/

final Entry<K,V> getEntry(Object key) {
    // 如果有自定义比较器，则调用 getEntryUsingComparator 方法进行查找。
    // getEntryUsingComparator 方法中寻找结点的逻辑与下面 完全一样
    if (comparator != null)
        return getEntryUsingComparator(key);
    
    // 如果 key 为 null，抛出空指针异常，因为二叉搜索树不允许 null 键。
    if (key == null)
        throw new NullPointerException();
     // 将 key 转换为 Comparable 类型，用于自然顺序比较。
    @SuppressWarnings("unchecked")
    Comparable<? super K> k = (Comparable<? super K>) key;
    
    Entry<K,V> p = root; // 定义一个指针 p，初始化为根节点 root，用于遍历树。
    
    //遍历二叉搜索树
    while (p != null) {
        int cmp = k.compareTo(p.key); //比较 `key` 和当前节点的键 `p.key`的大小
        if (cmp < 0) 	//key小于当前节点的键，则移动到左子树
            p = p.left;
        else if (cmp > 0) //key大于当前节点的键，则移动到右子树
            p = p.right; 
        else			//等于当前节点的键，返回当前节点 p
            return p;
    }
    // 如果遍历完整棵树仍未找到匹配的节点，返回 null。
    return null;
}
```



### remove()方法分析

红黑树中删除结点的逻辑：

1. 如果要删除的节点 `p` 有两个子节点：

   - 找到它的后继节点 `s`，用 `s` 的值覆盖 `p` 的值，然后将 `p` 指向 `s`。
   - 后续操作会删除后继节点 `s`（后继节点最多只有一个子节点）。

2. 如果 `p`只有一个子节点：

   - 用它的子节点替代它，并修复树的结构。

3. 如果 `p` 没有子节点：

   - 如果 `p` 是黑色节点，修复树的平衡性。
   - 从父节点中断开与 `p` 的连接。

4. 如果 `p` 是唯一的节点（即树中只有一个节点）：

   - 将树置为空树。

```java
/**
* Removes the mapping for this key from this TreeMap if present.
*/
public V remove(Object key) {
    //根据key 调用 getEnry()方法获取对应的Entry对象
    Entry<K,V> p = getEntry(key);
    //若树中没有对应的key，返回null
    if (p == null)
        return null;

    V oldValue = p.value; // 保存待删除节点的value
    //调用deleteEntry()方法删除指定节点，并将树重新设置平衡
    deleteEntry(p);
    return oldValue; // 返回已删除结点的value
}


/**
* Delete node p, and then rebalance the tree.
*/
private void deleteEntry(Entry<K,V> p) {
    modCount++; // 修改计数器加1，表示树的结构发生了变化。
    size--; // 树的大小减1，表示删除了一个节点。

    // 如果节点 p 同时有左子节点和右子节点（即 p 是一个内部节点）， 
    // 则找到它的后继节点 s，用后继节点的值覆盖当前节点的值，
 	// 然后将 p 指向后继节点（后继节点将在后续步骤中被删除）。
    if (p.left != null && p.right != null) {
        Entry<K,V> s = successor(p);
        p.key = s.key;
        p.value = s.value;
        p = s;
    } // p has 2 children

    
    // 定义替代节点 replacement，如果 p 有子节点，则选择非空的子节点作为替代节点。
    Entry<K,V> replacement = (p.left != null ? p.left : p.right);
	
     //1、 如果 p 有子节点
    if (replacement != null) {
        replacement.parent = p.parent; //将替代节点的父节点指向 p 的父节点。
        
       
        if (p.parent == null)  // 如果 p 是根节点，则将替代节点设置为新的根节点。
            root = replacement;
        else if (p == p.parent.left) // 如果 p 是父节点的左子节点，则将替代节点设置为父节点的左子节点。
            p.parent.left  = replacement;
        else						// 如果 p 是父节点的右子节点，则将替代节点设置为父节点的右子节点。
            p.parent.right = replacement; 

         // 清除 p 的左右子节点和父节点的引用，释放资源。
        p.left = p.right = p.parent = null;

        // Fix replacement
        if (p.color == BLACK)  // 如果删除的节点是黑色节点，则需要修复红黑树的平衡性。
            fixAfterDeletion(replacement);
    } 
    //2、如果 p 是唯一的节点（即树中只有一个节点）
    else if (p.parent == null) {
        root = null;	// 将根节点设置为 null，树变为空树。
    }
    //3、 如果 p 没有子节点（即 p 是叶子节点）
    else {
        // 如果删除的节点是黑色节点，则需要修复红黑树的平衡性。
        if (p.color == BLACK)
            fixAfterDeletion(p);
		// 如果 p 有父节点
        if (p.parent != null) {
            // 如果 p` 是父节点的左子节点，将父节点的左子节点置为 null。
            if (p == p.parent.left)
                p.parent.left = null;
            // 如果 p 是父节点的右子节点，将父节点的右子节点置为 null。
            else if (p == p.parent.right)
                p.parent.right = null;
            
            p.parent = null;// 清除 p 的父节点引用，释放资源。
        }
    }
}
```



## 3.6、ConcurrentHashMap

详见：[ConcurrentHashMap](https://catpaws.top/eb9166f8/#concurrenthashmap)

# 四、集合选型规则

在开发中，选择什么集合实现类，主要取决于业务操作特点，然后根据集合实现类特性进行选择，分析如下：


- 1）先判断存储的类型（一组对象[单列] 或 一组键值对[双列]）

- 2）一组对象[单列]：Collection接口
  - 允许重复：List
    - 增删多：LinkedList[底层维护了一个双向链表]
    - 改查多：ArrayList[底层维护 Object类型的可变数组]
  - 不允许重复：Set
    - 无序：HashSet[底层是HashMap，维护了一个哈希表 即（数组+链表+红黑树）]
    - 排序：TreeSet
    - 插入和取出顺序一致：LinkedHashSet，维护数组+双向链表3）

- 3）一组键值对[双列]：Map
  - 键无序：HashMap[底层是：哈希表jdk7：数组+链表，jdk8：数组+链表+红黑树]
  - 键排序：TreeMap
  - 键插入和取出顺序一致：LinkedHashMap
  - 读取文件 Properties

# 五、Collections工具类

`java.util.Collections`是 Java集合框架中提供的 **静态工具类**，封装了多种对集合（如 List、Set、Map）进行操作的实用方法。它不包含任何集合实例，而是通过静态方法增强集合功能。

[Collections API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/Collections.html)

[Collections工具类具体使用参考](https://javabetter.cn/common-tool/collections.html)


# 六、Stream流

[函数式编程-Stream流](https://catpaws.top/146f67fb/)

# 七、线程安全集合

[并发工具之线程安全集合类](https://catpaws.top/eb9166f8/#九并发工具之线程安全集合类)