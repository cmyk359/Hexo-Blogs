---
title: Redis - 原理篇
math: true
categories:
  - 数据库
abbrlink: 284457ed
date: 2024-12-30 15:18:46
tags:
---

<meta name = "referrer", content = "no-referrer"/>

## 一、数据结构

### 1.1、动态字符串SDS

Redis中保存的Key是字符串，value往往是字符串或者字符串的集合。可见字符串是Redis中最常用的一种数据结构。

不过Redis没有直接使用C语言中的字符串，因为C语言字符串存在很多问题：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241230172432582-2024-12-3017:25:02.png" alt="image-20241230172432582" style="zoom:80%;" />

- 没有内置的字符串类 

  C语言没有像其他高级语言那样提供内置的字符串类型。字符串在C语言中是以空字符`\0`'结尾的字符数组。

- 获取字符串长度的需要通过运算

  由于C语言字符串没有内置的长度字段，获取字符串长度需要遍历整个字符数组，时间复杂度为O(N)。

- 非二进制安全

  C语言字符串以空字符结尾，因此不能包含空字符作为数据的一部分。这限制了字符串在保存二进制数据（如图片、音频、视频文件等）方面的能力。



Redis构建了一种新的字符串结构，称为**简单动态字符串**（Simple Dynamic String），简称**SDS**

例如，执行`set name jack`，Redis会创建两个SDS，其中一个是包含'name'的SDS，另一个是包含'jack'的SDS。

Redis是C语言实现的，其中SDS是一个结构体，源码如下：

![image-20241230173117353](https://gitee.com/cmyk359/img/raw/master/img/image-20241230173117353-2024-12-3017:31:36.png)

其中包含头信息和字符数组

- `len`：buf已保存的字符串字节数，不包含结束标示。

- `alloc`：buf申请的总的字节数，不包含结束标示。

  > 初始时`alloc`和`len`相同，但随着动态扩容，两者会有差异。

- `flags`：不同SDS的头类型，用来控制SDS的头大小。

  为了适应不同长度的字符串，Redis设计了五种SDS头部结构，这些结构的主要区别在于它们能够表示的字符串长度的范围不同。

  ![image-20241230172940680](https://gitee.com/cmyk359/img/raw/master/img/image-20241230172940680-2024-12-3017:29:42.png)

- 字符数组`buf[]`，保存字符串。为了兼容C语言，SDS存储字符串时也会在字符数组末尾添加一个结束标识`/0`。



例如：保存一个字符串'name'的SDS结构如下：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241230173709674-2024-12-3017:37:11.png" alt="image-20241230173709674" style="zoom:80%;" />

SDS之所以叫做动态字符串，是因为它具备动态扩容的能力，例如一个内容为“hi”的SDS：

![1653984787383](https://gitee.com/cmyk359/img/raw/master/img/1653984787383-2024-12-3017:51:27.png)

假如我们要给SDS追加一段字符串“,Amy”，这里首先会申请新内存空间：

如果新字符串小于1M，则新空间为扩展后字符串长度的两倍+1（'1'是存储结束标识`\0`花费的空间）；

如果新字符串大于1M，则新空间为扩展后字符串长度+1M+1。称为内存预分配。

![image-20241230175235061](https://gitee.com/cmyk359/img/raw/master/img/image-20241230175235061-2024-12-3017:52:36.png)

优点：

1.  获取字符串长度的时间复杂度为$O(1)$
2. 支持动态扩容
3. 减少内存分配次数
4. 二进制安全

> 当Redis需要存储一个字符串时，它会根据字符串的实际长度来选择合适的SDS头部结构。
>
> ‌**当Redis中存储的字符串长度发生变化超出当前SDS（简单动态字符串）结构存储上限时，SDS会进行动态扩容，而不是切换到其他SDS结构存储**‌。
>
> SDS还采用了**内存预分配**和**惰性空间释放**策略来优化内存使用。
>
> - 当字符串需要扩容时，SDS会根据一定的规则（如小于1MB时按原长度两倍扩容，大于1MB时最多分配1MB空间）来分配新的内存空间‌。
> - 当字符串缩短时，SDS并不会立即回收多余的内存空间，而是将其记录下来，以便将来使用。这种惰性空间释放策略减少了内存分配和释放的次数，提高了性能‌。

### 1.2、Intset

#### IntSet的结构

IntSet是Redis中set集合的一种实现方式，基于整数数组来实现，并且具备长度可变、有序等特征。
结构如下：

![1653984923322](https://gitee.com/cmyk359/img/raw/master/img/1653984923322-2024-12-3018:33:13.png)

其中的encoding包含三种模式，表示存储的整数大小不同：

![1653984942385](https://gitee.com/cmyk359/img/raw/master/img/1653984942385-2024-12-3018:33:14.png)

为了方便查找，Redis会将intset中所有的整数按照**升序**依次保存在contents数组中。

假设有一个intset，元素为{5，10，20}，采用的编码是`INTSET_ENC_INT16`，则每个整数占2字节：结构如图：

![image-20241230183956901](https://gitee.com/cmyk359/img/raw/master/img/image-20241230183956901-2024-12-3018:39:59.png)



现在，数组中每个数字都在int16_t的范围内，因此采用的编码方式是`INTSET_ENC_INT16`，每部分占用的字节大小为：
encoding：4字节
length：4字节
contents：2字节 * 3  = 6字节

> 由于数组中每个数字都采用相同的编码方式，即所占用的空间大小相同，可以结合数组起始地址和数组下标快速定位到每个元素的物理地址 `startPtr + (sizeof(int16) * index)`
>
> 数组下标理解为 **当前元素到数组起始地址间隔了多少个元素**

####  IntSet升级

当前的IntSet中，元素为（5，10，20），采用的编码是`INTSET_ENC_INT16`，则每个整数占2字节：

![image-20241230212623555](https://gitee.com/cmyk359/img/raw/master/img/image-20241230212623555-2024-12-3021:26:29.png)

我们向该其中添加一个数字：50000，这个数字超出了`INTSET_ENC_INT16`的范围，intset会自动**升级**编码方式到合适的大小。
以当前案例来说流程如下：

* 升级编码为INTSET_ENC_INT32, 每个整数占4字节，并按照新的编码方式及元素个数扩容数组
* **倒序**依次将数组中的元素拷贝到扩容后的正确位置（这样向后移动元素时不会覆盖还未处理的元素）
* 将待添加的元素放入数组末尾
* 最后，将inset的encoding属性改为INTSET_ENC_INT32，将length属性改为4

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241230213128501-2024-12-3021:31:30.png" alt="image-20241230213128501" style="zoom:80%;" />

源码分析：

![intsetAdd](https://gitee.com/cmyk359/img/raw/master/img/image-20241230215915090-2024-12-3021:59:16.png)

![intsetUpgradeAndAdd](https://gitee.com/cmyk359/img/raw/master/img/image-20241230215809558-2024-12-3021:58:20.png)

### 1.3、Dict

#### Dict的结构

Redis是一个键值型（Key-Value Pair）的数据库，可以根据键实现快速的增删改查。而键与值的映射关系正是通过Dict来实现的。

Dict由三部分组成，分别是：**哈希表（DictHashTable）**、**哈希节点（DictEntry）**、**字典（Dict）**

1、哈希结点（DictEntry）

包含一对key:value和指向下一个Entry的指针。

![DictEntry的数据结构](https://gitee.com/cmyk359/img/raw/master/img/image-20241230223826657-2024-12-3022:38:28.png)

​		![DictEntry的图示](https://gitee.com/cmyk359/img/raw/master/img/image-20241230224000025-2024-12-3022:40:02.png)

2、哈希表（DictHashTable）

![DictHashTable的数据结构](https://gitee.com/cmyk359/img/raw/master/img/image-20241230224110016-2024-12-3022:41:11.png)

哈希表实际上就是一个数组，其中：

- `dictEntry **table`是一个`DictEntry`类型的数组指针，而数组内保存的是指向一个个`DictEntry`对象的指针。
- `size`：哈希表数组的大小。总是 $\color{red}2^n$，**默认为4**。
- `siezmask`：哈希表大小的掩码，总等于$\color{red}size -1$
- `used`：哈希表数组中已存在的entry的个数

当我们向Dict添加键值对时，Redis首先根据key计算出hash值（h），然后利用` h & sizemask`来计算元素应该存储到数组中的哪个索引位置。

> `h & sizemask`就相当于 `h % size`。由于size总是$2^n$，则它的余数就是1之后的那些位组成的数字，而sizemask = size -1，`h & sizemask`就将余数部分保留下来了，相当于完成了取余操作。如：
>
> ![image-20241230225659603](https://gitee.com/cmyk359/img/raw/master/img/image-20241230225659603-2024-12-3022:57:01.png)
>
> **因此，size必须始终为$2^n$,sizemask才能保证对应size余数部分的二进制都为1，与hash值做与运算后才能得到余数，即新元素在哈希表中的索引位置。**

例如：存储k1=v1，假设k1的哈希值h =1，则1&3 =1，因此k1=v1要存储到数组角标1位置。此时，再次插入的新的键值k2=v2经过hash运算，也要存储到数组下标1的位置，会产生**哈希冲突**。Redis解决冲突的方式是**拉链法**，将同义词通过链表连接起来，每次将新的同义词插入链表**头部**即可（若加到队尾，需要进行遍历）。

![image-20241230230514385](https://gitee.com/cmyk359/img/raw/master/img/image-20241230230514385-2024-12-3023:05:16.png)

3、字典（Dict）

![image-20241230230632158](https://gitee.com/cmyk359/img/raw/master/img/image-20241230230632158-2024-12-3023:06:34.png)

其中：

- `type`和`privdata`都是用来做哈希运算的
- `dictht ht[2]`: 一个Dict包含两个哈希表，其中`ht[0]`保存当前数据；`ht[1]`一般是空，**rehash**时使用
- `rehashidx`：rehash的进度，-1表示未进行。**Dict的rehash并不是一次性完成的，而是分多次、渐进式的完成。**rehash开始时设置为0，在每次执行新增、查询、修改、删除操作时，执行一次rehash，将`ht[0] ` 中`rehashindex`对应下标的链表迁移到`ht[1]`，并且`rehashindex++`，直至`ht[0]`的所有数据都rehash到`ht[1]`
- `pauserehash`：rehash是否暂停，1则暂停，0则继续

![Dict的结构](https://gitee.com/cmyk359/img/raw/master/img/image-20241230232051927-2024-12-3023:20:54.png)

#### Dict的扩容

Dict中的HashTable就是数组结合单向链表的实现，当集合中元素较多时，必然导致哈希冲突增多，链表过长，则查询效率会大大降低。

Dict在每次**新增**键值对时都会检查负载因子（`LoadFactor = used/size`） ，满足以下两种情况时会触发哈希表扩容：

- 哈希表的 LoadFactor >= 1，并且服务器没有执行 BGSAVE 或者 BGREWRITEAOF 等后台进程；
- 哈希表的 LoadFactor > 5 ；

![HashTable扩容](https://gitee.com/cmyk359/img/raw/master/img/image-20241230233412969-2024-12-3023:34:15.png)

#### Dict的收缩

Dict除了扩容以外，每次**删除**元素时，也会对负载因子做检查，当`LoadFactor` < 0.1时，会做哈希表收缩：

![HashTable收缩逻辑](https://gitee.com/cmyk359/img/raw/master/img/image-20241231000236670-2024-12-3100:02:39.png)

Dict的扩容和收缩都会调用`dictExpand`方法，其源码如下：

![image-20241230235746690](https://gitee.com/cmyk359/img/raw/master/img/image-20241230235746690-2024-12-3023:57:49.png)

#### Dict的rehash

不管是扩容还是收缩，必定会创建新的哈希表，导致哈希表的size和sizemask变化，而key的查询与sizemask有关。因此**必须对哈希表中的每一个key重新计算索引，插入新的哈希表，这个过程称为rehash**。但是rehash是在执行增删操作时判断是否要执行rehash，而这些操作是在Redis的主进程中进行的，若一次迁移太多的entry会导致主进程阻塞，直至完成rehash后才能处理新命令。

因此，Dict的rehash并不是一次性完成的。**Dict的rehash是分多次、渐进式的完成**，因此称为**渐进式rehash**。流程如下：

1. 计算新hash表的realeSize，值取决于当前要做的是扩容还是收缩：
   - 如果是扩容，则新size为第一个大于等于dict.ht[0].used + 1的 $2^n$
   - 如果是收缩，则新size为第一个大于等于dict.ht[0].used的 $2^n$（不得小于4）

2. 按照新的realeSize申请内存空间，创建dictht，并赋值给dict.ht[1]

3. 设置dict.rehashidx = 0，标示开始rehash

4. 每次执行新增、查询、修改、删除操作时，都检查一下dict.rehashidx是否大于-1，如果是则将dict.ht[0].table[rehashidx]的entryl链表rehash到dict.ht[1]，并且将rehashidx++。直至dict.ht[0]的所有数据都rehash到dict.ht[1]

   > 即每次执行新增、查询、修改、删除操作时，都将ht[0]中`rehashindex`所指下标的链表迁移到ht[1]，每次只迁移一条链表的数据，并且`rehashindex++`，直至将ht[0]中的数据都迁移到ht[1]

5. 将dict.ht[1]赋值给dict.ht[0]，给dict.ht[1]初始化为空哈希表，释放原来的dict.ht[0]的内存

6. 将rehashidx赋值为-1，代表rehash结束

7. 在rehash过程中，**新增操作，则直接写入ht[1]**，**查询、修改和删除则会在dict.ht[0]和dict.ht[1]依次查找并执行**。这样可以确保ht[0]的数据只减不增，随着rehash最终为空。

### 1.4、ZipList

Dict是由数组+单链表实现的，其数据存储在不连续的存储单元中，使用指针相互关联，这种方式存在的主要问题是内存的浪费，容易产生内存碎片，并且每个指针本身还要占据一定的字节空间。

ziplist是一种压缩存储结构，用于存储字符串或整数。它通过一系列特殊编码的**连续内存块**来存储数据，以减少内存使用。由于其设计结构，ZipList 可以看作特殊“双端链表” ，它没有使用指针记录前后结点的地址，而是通过**记录结点长度**来推算出前后结点的位置，它可以在任意一端进行压入/弹出操作, 并且该操作的时间复杂度为 O(1)。

#### ZipList的结构

![ZipList结构](https://gitee.com/cmyk359/img/raw/master/img/image-20241231115108381-2024-12-3111:51:09.png)

ZipList主要包含四部分数据，分别是

- `zlbytes` ：类型`uint32_t`，长度4 字节，**记录整个压缩列表占用的内存字节数**
- `zltail`：类型`uint32_t`，长度4 字节**，记录压缩列表表尾节点距离压缩列表的起始地址有多少字节**，通过这个偏移量，可以确定表尾节点的地址。
-  `zllen`：类型`uint16_t`，长度2 字节，**记录了压缩列表包含的节点数量**。最大值为UINT16-MAX（65534），如果超过这个值，此处会记录为65535，但节点的真实数量需要遍历整个压缩列表才能计算得出。
-  `entry`：压缩列表包含的各个节点，节点的长度由节点保存的内容决定，长度不定
-  `zlend`：类型`uint8_t`，长度1 字节，特殊值OxFF（十进制255），**用于标记压缩列表的末端。**

#### Entry的结构

ZipList中的Entry并不像普通链表那样记录前后节点的指针，因为记录两个指针要占用16个字节，浪费内存。而是采用了下面的结构：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241231115851490-2024-12-3111:58:54.png" alt="ZipList entry的结构" style="zoom:80%;" />

* `previous_entry_length`：前一节点的长度，占1个或5个字节。
  * 如果前一节点的长度小于254字节，则采用1个字节来保存这个长度值
  * 如果前一节点的长度大于254字节，则采用5个字节来保存这个长度值，第一个字节为0xfe，后四个字节才是真实长度数据
* `encoding`：编码属性，记录content的数据类型（字符串还是整数）以及长度，占用1个、2个或5个字节
* `contents`：负责保存节点的数据，可以是字符串或整数

> 要获得下一节点的地址。只需用当前节点的地址 + entry 的长度即可
>
> 要获得前一结点的地址，只需用当前节点的地址 - `previous_entry_length`即可



## 二、网络模型

## 三、通信协议

## 四、内存策略