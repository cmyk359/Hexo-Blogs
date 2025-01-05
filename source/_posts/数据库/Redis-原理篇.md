---
title: Redis - 原理篇
math: true
categories:
  - 数据库
abbrlink: 284457ed
date: 2024-12-30 15:18:46
tags:
  - 动态字符串SDS
  - IntSet
  - Dict
  - ZipList
  - QuickList
  - SkipList
  - RedisObject
  - Linux IO模型
  - Redis网络模型
  - 内存策略
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
* `encoding`：编码属性，记录**content的数据类型**（字符串还是整数）以及**长度**，占用1个、2个或5个字节
* `contents`：负责保存节点的数据，可以是字符串或整数

> 要获得下一节点的地址。只需用当前节点的地址 + entry 的长度即可
>
> 要获得前一结点的地址，只需用当前节点的地址 - `previous_entry_length`即可
>
> ZipList中所有存储长度的数值均采用**小端存储**，即先存储低字节，低地址存低字节，高地址存高字节。例如：数值0x1234，采用小端字节序后实际存储值为：0x3412
>
> **如果列表数据过多，导致链表过长，查询中间的某个数据时要经过多次计算寻址，可能影响查询性能**



#### Entry的Encoding编码

ZipListEntry中的encoding编码分为字符串和整数两种：

**字符串**：如果encoding是以“00”、“01”或者“10”开头，则证明content是字符串

![image-20241231195137157](https://gitee.com/cmyk359/img/raw/master/img/image-20241231195137157-2024-12-3119:52:06.png)

例如，我们要保存字符串：“ab”和 “bc”。ZipList中第一个Entry保存的是"ab"，其中`previous_entry_length` = 0，"ab"的占两个字节，`encoding` = 00000010，a和b的ASCII码分别为61和62，故存储"ab"的Entry内容如下，左侧为十六进制存储。存储“bc”的Entry内容同理可得。

![ab的Entry内容](https://gitee.com/cmyk359/img/raw/master/img/image-20241231195950607-2024-12-3120:00:06.png)

整个ZIPList的内容如下：

![image-20241231200702856](https://gitee.com/cmyk359/img/raw/master/img/image-20241231200702856-2024-12-3120:07:06.png)

**整数**：如果encoding是以“11”开始，则证明content是整数，且encoding固定只占用1个字节

![image-20241231201103448](https://gitee.com/cmyk359/img/raw/master/img/image-20241231201103448-2024-12-3120:11:06.png)

整数的编码通常只有`byte`、`short`、`int`、`long`，对应的数据分别为1、2、4、8个字节，用两位编码即可区分，故除了最高位的11用来表示整数，之后的两位用来表示是哪种编码。Redis中多了一种3字节的整数，所以多用了一种编码表示该类型。

对于一些比较小的数字，如1,3,8等，用一个字节表示还是有点浪费，Redis直接把这些小数字的值保存在类型编码里，范围是0001 - 1101（低四位的0000和1110都被使用了，为了不和编码产生冲突，只能存储这个范围内的数字），减一后结果为实际值，即0001表示0,0010表示1。

例如，一个ZipList中包含两个整数值："2"和"5"，其Entry结构和整个ZipList结构如下：

![整数2和5的Entry结构](https://gitee.com/cmyk359/img/raw/master/img/image-20241231202638438-2024-12-3120:26:56.png)

![整个ZipList的结构](https://gitee.com/cmyk359/img/raw/master/img/image-20241231202829878-2024-12-3120:28:30.png)

#### ZipList的连锁更新问题

ZipList的每个Entry都包含`previous_entry_length`字段来记录上一个节点的大小。这个字段的长度是1个或5个字节：

- 如果前一节点的长度小于254字节，则采用1个字节来保存这个长度值。
- 如果前一节点的长度大于等于254字节，则采用5个字节来保存这个长度值，其中第一个字节为0xfe，后四个字节才是真实长度数据。

当在ZipList中插入、删除或修改数据时，如果新元素的长度改变了相邻元素的`previous_entry_length`字段的值（例如，从1个字节变为5个字节），那么就需要更新这个字段。更糟糕的是，这个更新可能会触发后续元素的连续更新，因为后续元素的`previous_entry_length`字段也可能需要调整以反映新的前一个元素的大小。这种连续多次的空间扩展操作就被称为**连锁更新。**

例如：有N个连续的、长度为250-253字节之间的entry，因此entry的previous_entry_length属性用1个字节即可表示，如图所示：

![image-20241231204258567](https://gitee.com/cmyk359/img/raw/master/img/image-20241231204258567-2024-12-3120:42:59.png)

若此时，在表头插入一个长度为254字节的entry，原来表头entry的`previous_entry_length`就要从1个字节变为5个字节，那么这个entry的长度就变成254字节。原来第二个entry为了记录前面entry的长度，它的`previous_entry_length`也要从1个字节变为5个字节，它的长度也变成254字节，又会引起后面一个entry的`previous_entry_length`变大......

![image-20241231204815306](https://gitee.com/cmyk359/img/raw/master/img/image-20241231204815306-2024-12-3120:48:16.png)

> 由于ZipList的entry是连续存储，`previous_entry_length`要从1个字节变为5个字节，需要将之后的数据整体向后迁移，若空间不足还要申请新的空间，对性能影响较大。但这种情况**发生概率是极低**的，连锁更新通常发生在特定的条件下。

为了缓解ZipList的连锁更新问题，可以采取以下几种解决方案：

1. ‌**限制ZipList的长度和Entry大小**‌：

   通过配置Redis的相关参数（如`hash-max-ziplist-entries`、`hash-max-ziplist-value`、`zset-max-ziplist-entries`、`zset-max-ziplist-value`等），限制ZipList的长度和Entry的大小。当数据超过这些限制时，Redis会自动将ZipList转换为其他数据结构（如Hash、SkipList+Dict）来存储。

2. ‌**使用多个ZipList分片存储数据**‌：

   如果需要存储大量数据，可以考虑将数据分片存储到多个ZipList中。这样，每个ZipList的大小都会受到限制，从而减少了连锁更新发生的可能性。

3. ‌**升级Redis版本**‌：

   在Redis 5版本中，引入了ZipList的替代版本ListPack。ListPack移除了`prevlen`字段，采用了不同的结构来存储数据，从而避免了连锁更新的问题。如果可能的话，可以考虑升级到支持ListPack的Redis版本。

   > 为了解决ziplist的连锁更新问题，Redis引入了listpack结构。Listpack同样采用了紧凑的内存布局，但**它摒弃了ziplist中的prevlen字段，改为让每个元素只记录自己的长度信息。这样，当修改某个元素时，就不会影响到其他元素，从而避免了连锁更新的发生。**

   [ListPack参考文章](https://blog.csdn.net/m0_51504545/article/details/126078789)

### 1.5、QuickList

ZipList虽然节省内存，但申请内存必须是连续空间，如果内存占用较多，申请内存效率很低。怎么办？

为了缓解这个问题，我们必须限制ZipList的长度和entry大小。

但是我们要存储大量数据，超出了ZipList最佳的上限该怎么办？

我们可以创建多个ZipList来分片存储数据。

数据拆分后比较分散，不方便管理和查找，这多个ZipList如何建立联系？

Redis在3.2版本引入了新的数据结构**Quicklist**，**它是一个双端链表，只不过链表中的每个节点都是一个ZipList**。它结合了ziplist和双向链表的优点，旨在提供高效的内存利用率和快速的插入、删除操作。其结构如下：

![QuickList结构](https://gitee.com/cmyk359/img/raw/master/img/image-20250101104308576-2025-1-110:43:25.png)



为了避免QuickList中的每个ZipList中entry过多，Redis提供了一个配置项：`list-max-ziplist-size`来限制。

如果值为正，则代表ZipList的允许的**entry个数的最大值**

如果值为负，则代表**ZipList的最大内存大小**，分5种情况：

- -1：每个ZipList的内存占用不能超过4kb
- -2：每个ZipList的内存占用不能超过8kb
- -3：每个ZipList的内存占用不能超过16kb4
- -4：每个ZipList的内存占用不能超过32kb
- -5：每个ZipList的内存占用不能超过64kb

其默认值为：-2

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250101104658228-2025-1-110:47:00.png" alt="list-max-ziplist-size的默认值" style="zoom:80%;" />



除了控制ZipList的大小，QuickList还可以对节点的ZipList做压缩。通过配置项`list-compress-depth`来控制。因为链表一般都是从首尾访问较多，所以首尾是不压缩的。这个参数是控制**首尾不压缩的节点个数**：

- 0：特殊值，代表不压缩
- 1：标示QuickList的首尾各有1个节点不压缩，中间节点压缩
- 2：标示QuickList的首尾各有2个节点不压缩，中间节点压缩
- 以此类推

默认值为0，默认不进行压缩

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250101104919212-2025-1-110:49:20.png" alt="list-compress-depth的默认值" style="zoom:80%;" />



源码分析：

以下是QuickList的和QuickListNode的结构源码，及内存结构图

![image-20250101105404993](https://gitee.com/cmyk359/img/raw/master/img/image-20250101105404993-2025-1-110:54:06.png)

![image-20250101105543536](https://gitee.com/cmyk359/img/raw/master/img/image-20250101105543536-2025-1-110:55:45.png)



QuickList的优势主要体现在以下几个方面：

- ‌**内存占用低**‌：通过结合ziplist和双向链表的优点，QuickList进一步压缩了内存的使用量。
- ‌**操作速度快**‌：QuickList提供了高效的遍历算法和快速的插入、删除操作。
- ‌**灵活性高**‌：QuickList可以根据实际情况动态调整节点的大小和数量，以适应不同的应用场景。

> 当向QuickList中插入一个元素时，Redis会根据一定的策略选择一个合适的quicklistNode，并将元素插入到该节点中。如果插入操作导致quicklistNode中的元素数量超过了一定的阈值（由list-max-ziplist-size参数决定），Redis会将该节点拆分成两个节点。同样，如果删除操作导致quicklistNode中的元素数量过少，Redis会将相邻的两个节点合并成一个节点。

从Redis 3.2版本开始，list数据结构就使用了QuickList来代替之前的压缩列表（ziplist）和链表（linkedlist）。因此，当使用Redis的list命令（如lpush、rpush、lpop、rpop等）时，实际上就是在操作QuickList。

总结：QuickList是一个节点为ZipList的双端链表，节点采用ZipList，解决了传统链表的内存占用问题；控制了ZipList大小，解决连续内存空间申请效率问题；中间节点可以压缩，进一步节省了内存。

### 1.6、SkipList

SkipList是为了解决有序集合的高效查找、插入和删除操作而设计的。它结合了平衡树和链表的优点，既保持了数据的有序性，又提供了快速的访问速度。主要用于实现Redis中的有序集合（Sorted Set）

**SkipList（跳表）**首先是链表，但与传统链表相比有几点差异：

- 元素按照升序排列存储

- 节点可能**包含多个指针，指针跨度不同**。

  ![image-20250101112809753](https://gitee.com/cmyk359/img/raw/master/img/image-20250101112809753-2025-1-111:28:10.png)



其结构定义如下：

![SkipList的结构定义](https://gitee.com/cmyk359/img/raw/master/img/image-20250101112015649-2025-1-111:20:34.png)

SkipList本身的定义中包含头尾节点指针，链表中结点的数量和最大的索引层级，默认是1。

SkipList结点的定义中包括：

- 结点的值，类型是动态字符串；
- 结点的分数，**按分数对结点升序排列存储**，用于排序和查找；
- 前一个结点的指针
- 多级索引数组，每个结点中包含的指针数量不确定，首节点的最多，中间节点的较少，故用数组保存。这些指针分布在不同的层级上，用于实现多级索引。每个索引包括指向下一节点的指针和该指针的跨度

![SkipList内存结构](https://gitee.com/cmyk359/img/raw/master/img/image-20250101113225469-2025-1-111:32:26.png)



**查找操作**‌：

- 从最高层开始，通过前进指针逐层向下查找。
- 如果当前节点的下一个节点的值小于要查找的值，则向右移动；如果大于要查找的值，则向下移动。
- 重复上述过程，直到找到目标节点或确定目标节点不存在。

‌**插入操作**‌：

- 首先进行查找操作，找到插入位置。

- 随机生成一个层数，根据这个层数在每一层插入新节点。

  > SkipList的一个关键特性是它允许节点在不同的层级上存在。为了确定新节点的层级，通常会使用一个概率模型来随机选择。例如，可以设置一个预设值p（通常是一个小于1的常数），然后生成一个0到1之间的随机数。如果这个随机数小于p，就将节点的层数加1，直到达到一个预设的最大层数或者随机数不再小于p为止。这个过程确保了节点层级的随机性，从而有助于保持SkipList的平衡性。

- 更新相关节点的前进指针和跨度。

**删除操作**‌：

- 首先进行查找操作，找到要删除的节点。
- 然后在每一层删除这个节点，并调整相关节点的前进指针和跨度。

### 1.7、RedisObject

RedisObject是Redis中表示数据对象的结构体，它是Redis数据库中的基本数据类型的抽象。在Redis中，**所有的数据都被存储为RedisObject类型的对象**。

RedisObject结构体中包含了多个字段，用于表示对象的类型、编码方式、引用计数、最近访问时间以及指向实际存储数据的指针等信息。

```c
typedef struct redisObject {
    unsigned type:4;       // 数据类型，如字符串、列表、哈希等
    unsigned encoding:4;   // 编码方式，如int、raw、hashtable等
    unsigned lru:LRU_BITS; // Least Recently Used，用于记录对象最近被访问的时间
    int refcount;          // 引用计数，用于自动内存管理
    void *ptr;             // 指向实际存储数据的指针
} robj;
```

- ‌**type**‌：表示数据对象的类型，用4位表示，对应着Redis的几种基本数据类型，分别是string、hash、list、set和zset。

  > #define OBJ_STRING 0
  > #define OBJ_LIST 1
  > #define OBJ_SET 2
  > #define OBJ_ZSET 3
  > #define OBJ_HASH 4

- ‌**encoding**‌：底层编码方式，共有11种，占4个bit位，不同的编码方式对应不同的存储结构。

- ‌**lru**‌：记录对象最近被访问的时间，占用24个bit位，用于实现LRU（Least Recently Used）策略，即最近最少使用策略，用于内存淘汰。

- ‌**refcount**‌：对象引用计数器，，用于自动内存管理。当引用计数为0时，表示对象可以被释放。Redis通过引用计数来管理内存，避免内存泄漏。

- ‌**ptr**‌：指向实际存储数据的指针，根据不同的数据类型和编码方式，指向不同的数据结构。

> 一个RedisObject的头信息所占用的空间是16字节。若有n个字符串要存储，每个字符串都选用String类型存储，每个都需要一个RedisObject头，会造成大量空间浪费在头信息的存储。若使用List等集合类型存储这些字符串，只需一个RedisObject头就可以完成。
>
> 因此，当有大量数据存储时，尽量选择集合类型进行存储，避免内存浪费。

Redis中会根据存储的数据类型不同，选择不同的编码方式，共包含11种不同类型：

![11种编码类型](https://gitee.com/cmyk359/img/raw/master/img/image-20250101120941750-2025-1-112:09:43.png)

每种数据类型的使用的编码方式如下：

![image-20250101121049469](https://gitee.com/cmyk359/img/raw/master/img/image-20250101121049469-2025-1-112:10:50.png)



RedisObject的作用：

- ‌**统一对象管理**‌：RedisObject为Redis中的各种数据类型提供了一个统一的接口，使得Redis能够以一致的方式处理不同类型的数据。
- ‌**内存优化**‌：通过引用计数和LRU机制，RedisObject实现了自动内存管理和淘汰策略，有效地节省了内存空间，提高了内存利用率。
- ‌**操作一致性**‌：RedisObject为不同类型的数据提供了统一的操作接口，如获取对象类型、编码方式、值等，保证了操作的一致性。

Redis底层数据结构包括SDS（简单动态字符串）、IntSet（整数集合）、Dict（字典）、ZipList（压缩列表）、QuickList（快速列表）、SkipList（跳跃表）等。这些数据结构被广泛应用于Redis的各种功能模块中，如字符串、哈希、列表、集合、有序集合等。

RedisObject与这些底层数据结构的关系是：RedisObject是对这些底层数据结构的抽象和封装。RedisObject的`ptr`字段指向实际存储数据的指针，这个数据结构由`type`和`encoding`属性决定。例如，如果一个RedisObject的`type`属性为`OBJ_LIST`，`encoding`属性为`OBJ_ENCODING_QUICKLIST`，那么这个对象就是一个Redis列表（List），它的值保存在一个QuickList的数据结构内，而`ptr`指针就指向QuickList的对象。

### 1.8、五种不同的数据类型

#### String

String是Redis中最常见的数据存储类型，基于**简单动态字符串（SDS）**实现。String类型的底层编码方式有三种，分别是`raw`、`embstr`和`int`。

- 当存储的字符串长度超过44字节时，会采用`raw`编码方式。，存储上限为512mb。

  RedisObject对象头和SDS对象在内存地址不是连续的，需要分配两次内存，性能较差。

  ![raw类型编码](https://gitee.com/cmyk359/img/raw/master/img/image-20250101155622345-2025-1-115:56:28.png)

- 当存储的字符串长度小于等于**44字节**时，Redis使用`embstr`编码。在embstr编码中，RedisObject对象头和SDS（Simple Dynamic String）对象在内存中地址是连在一起的，申请内存时只需要调用一次内存分配函数，操作字符串时不用做额外的寻址操作，效率较高。

  ![embstr编码](https://gitee.com/cmyk359/img/raw/master/img/image-20250101165235446-2025-1-116:52:36.png)

  > 为什么是44字节？SDS的头信息中`len`、`alloc`、`flags`各占一字节，字符结束符`\0`占一字节，字符串内容44字节，整个SDS共占48字节，RedisObject头信息共占16字节，加起来是64字节。**Redis中，jemalloc是默认的内存分配器**，Jemalloc会为不同大小的内存请求分配固定大小的块（这些块的大小通常是2的幂次），在分配内存时会尽量满足内存对齐的要求，以减少由于频繁的内存分配和释放操作导致的内存碎片。64字节刚好是Jemalloc的一个内存分配单位，能把这些数据存储在一个连续的内存块中而不产生内存碎片。

- 当存储的字符串是整数值，并且大小在LONG_MAX范围内，则会采用`INT`编码：**直接将数据保存在RedisObject的ptr指针位置，不再需要SDS了**。

  ![image-20250101172324620](https://gitee.com/cmyk359/img/raw/master/img/image-20250101172324620-2025-1-117:23:25.png)

  > 一个指针占8字节，而不论Java还是C中的整数最多占8个字节，因此刚好可以用ptr指针的内存空间存储整数值



#### List

Redis的List类型可以从首、尾操作列表中的元素。哪一个数据结构能满足上述特征？

- LinkedList：普通链表，可以从双端访问，内存占用较高，内存碎片较多
- ZipList：压缩列表，可以从双端访问，内存占用低，存储上限低
- QuickList：LinkedList + ZipList，可以从双端访问，内存占用较低，包含多个ZipList，存储上限高

在3.2版本之前，Redis采用ZipList和LinkedList来实现List，当元素数量小于512并且元素大小小于64字节时采用ZipList编码，超过则采用LinkedList编码。

在3.2版本之后，Redis统一采用**QuickList**来实现List

![List结构](https://gitee.com/cmyk359/img/raw/master/img/image-20250101185826611-2025-1-118:58:34.png)

#### Set

Set是Redis中的单列集合，满足下列特点：

- 不保证有序性
- 保证元素唯一（可以判断元素是否存在）
- 求交集、并集、差集

由于Set要保证集合中元素唯一，在很多操作中都要判断一个元素是否已经存在，如插入时需判断元素是否存在，求交集时要找出两个集合都存在的元素等等。可以看出，**Set对查询元素的效率要求非常高**。

为了查询效率和唯一性，set采用**HT编码**（**Dict**）。**<u>Dict中的key用来存储元素，value统一为null。</u>**

当存储的所有数据都是整数，并且元素数量不超过`set-max-intset-entries`时，Set会采用**IntSet编码**，以节省内存。

> `set-max-intset-entries`可以在配置文件中设置，默认为512

当第一次向set中添加元素时会创建新的set，会根据元素的值来决定采用什么编码，创建什么结构来存储。如果该字符是数值类型，会采用Intset编码，并创建IntSet存储元素；如果该字符不是数值类型，则会采用HT编码，创建Dict存储元素。

![image-20250101201119665](https://gitee.com/cmyk359/img/raw/master/img/image-20250101201119665-2025-1-120:11:37.png)在向set插入元素过程中

- 若原来的编码类型是HT，则直接插入。

- 若当前的编码是IntSet，需要进行判断。当<u>目前插入的元素不是数值类型</u>或者<u>该元素是数值类型，但成功插入后Set中的元素个数超过了设定值</u>时，该Set的编码会从IntSet切换为HT，并使用Dict存储当前IntSet中的值。若这两个条件都满足，则继续在原来的IntSet中存储新元素。

  ![image-20250101202638679](https://gitee.com/cmyk359/img/raw/master/img/image-20250101202638679-2025-1-413:44:38.png)

插入过程的源码分析如下：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250101202110049-2025-1-120:21:37.png" style="zoom:80%;" />



#### ZSet

ZSet也就是SortedSet，其中每一个元素都需要指定一个score值和member值。

<img src="https://gitee.com/cmyk359/img/raw/master/img/1653992091967-2025-1-120:50:56.png" alt="1653992091967" style="zoom:80%;" />

具备以下功能：

* 可以根据score值排序
* member必须唯一
* 可以根据member查询分数

因此，zset底层数据结构必须满足**键值存储**、**键必须唯一**、**可排序**这几个需求。哪种编码结构可以满足？

* SkipList：可以排序，并且可以同时存储score和ele值（member），但无法保证键的唯一性。
* HT（Dict）：可以键值存储，并且可以根据key找value，但无法排序。

Zset底层同时使用了这两种编码结构，结合它们的功能满足Zset的需要，ZSet的结构定义如下，在创建ZsetObject对象时，先创建了Zset对象，再为Zset对象创建了Dict和SkipList，并将编码方式设置为`OBJ_ENCODING_SKIPLIST`

![Zset结构](https://gitee.com/cmyk359/img/raw/master/img/image-20250101205736858-2025-1-120:57:37.png)

![Zset内存结构](https://gitee.com/cmyk359/img/raw/master/img/1653992172526-2025-1-120:59:11.png)

当元素数量不多时，HT和SkipList的优势不明显，而且更耗内存，同一份数据存储了两份。因此zset还会采用**ZipList**结构来节省内存，不过需要同时满足两个条件：

* 元素数量小于zset_max_ziplist_entries，默认值128
* 每个元素都小于zset_max_ziplist_value字节，默认值64

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250101210256404-2025-1-121:02:57.png" alt="image-20250101210256404" style="zoom:80%;" />

但是ziplist本身没有排序功能，而且没有键值对的概念，因此需要通过逻辑编码实现：

* ZipList是连续内存，因此score和element是紧挨在一起的两个entry， element在前，score在后
* score越小越接近队首，score越大越接近队尾，按照score值升序排列

![Zset使用ZipList时的内存结构](https://gitee.com/cmyk359/img/raw/master/img/image-20250101210507745-2025-1-121:05:08.png)

源码分析：

创建Zset：在zadd添加元素时，先根据key找到zset，不存在则创建新的zset。创建时判断配置文件中`zset_max_ziplist_entries`值是否为0，设置为0就是禁用了zipList；或者value大小超过了`zset_max_ziplist_value`，此时采用HT和SKipList的方案，否则采用ZipList。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250101210931134-2025-1-121:09:32.png" alt="image-20250101210931134" style="zoom:80%;" />

由于Zset存在两种编码方式，在添加元素可能发生编码转换。向Zset中添加元素时，首先判断编码方式，若本身是SKIPLIST编码，无序转换。否则，可能存在编码转换的可能，具体逻辑如代码所示。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250101211648500-2025-1-121:16:49.png" alt="image-20250101211648500" style="zoom:80%;" />



#### Hash

Hash结构与Redis中的Zset非常类似：

- 都是键值存储
- 都需求根据键获取值
- 键必须唯一

不同的是，zset要根据score排序；hash则无需排序。因此，Hash底层采用的编码与Zset也基本一致，只需要把排序有关的SkipList去掉即可。

Hash结构**默认采用ZipList编码**，用以节省内存。ZipList中相邻的两个entry分别保存field和value。

![ZipList编码方式](https://gitee.com/cmyk359/img/raw/master/img/image-20250101220515346-2025-1-122:05:16.png)

当数据量较大时，Hash结构会转为HT编码，也就是Dict，触发条件有两个：

- ZipList中的元素数量超过了hash-max-ziplist-entries（默认512）
- ZipList中的任意entry大小超过了hash-max-ziplist-value（默认64字节）

![HT编码格式](https://gitee.com/cmyk359/img/raw/master/img/image-20250101220835623-2025-1-122:08:36.png)

源码分析：

Hash结构在创建默认采用ZipList编码，由于存在两种编码格式，在添加元素时也会发生格式转换，代码分析如图：

<img src="https://gitee.com/cmyk359/img/raw/master/img/无标题-2025-1-122:10:10.png" alt ="Hash创建及添加数据代码分析" style="zoom:50%;" />

## 二、网络模型

### 2.1、用户空间和内核空间

ubuntu和Centos 都是Linux的发行版，发行版可以看成对linux包了一层壳，任何Linux发行版，其系统内核都是Linux。

用户的应用，比如redis，mysql等其实是没有办法去执行访问系统的硬件的，所以可以通过发行版的这个壳子去访问内核，再通过内核去访问计算机硬件。

计算机硬件包括，如cpu，内存，网卡等等，内核（通过寻址空间）可以操作硬件，但是内核需要不同设备的驱动，有了这些驱动之后，内核就可以去对计算机硬件去进行 内存管理，文件系统的管理，进程的管理等等。

![1653896065386](https://gitee.com/cmyk359/img/raw/master/img/1653896065386-2025-1-209:23:22.png)

我们想要用户的应用来访问，计算机就必须要通过对外暴露的一些接口，才能访问到，从而间接的实现对内核的操控，但是内核本身上来说也是一个应用，所以他本身也需要一些内存，cpu等设备资源，用户应用本身也在消耗这些资源。为了避免了用户程序随意的去操作系统资源，错误地或恶意地执行危险指令，如清空内存、修改时钟等，需要把用户和**内核隔离开**。

进程的寻址空间划分成两部分：**内核空间、用户空间**

应用程序也好，还是内核空间也好，都是没有办法直接去物理内存的，而是通过分配虚拟内存映射到物理内存中。通过虚拟内存可以将内核空间与用户空间隔离开来，避免用户程序错误地或恶意地访问内核空间。在32位Linux操作系统中，虚拟内存空间大小为 4GB，其被划分为两部分：高位的1G空间作为内核空间，低位的3G空间作为用户空间。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250102195140543-2025-1-219:51:44.png" alt="虚拟内存划分" style="zoom:80%;" />

在linux中，他们权限分成两个等级，0和3，用户空间只能执行受限的命令（Ring3），而且不能直接调用系统资源，必须通过内核提供的接口来访问。内核空间可以执行特权命令（Ring0），调用一切系统资源，所以一般情况下，用户的操作是运行在用户空间，而内核运行的数据是在内核空间的，而有的情况下，一个应用程序需要去调用一些特权资源，去调用一些内核空间的操作，所以此时他俩需要**在用户态和内核态之间进行切换**。



### 2.2、Linux IO模型

Linux系统为了提高IO效率，会在用户空间和内核空间都加入缓冲区：

- 写数据时，要把用户缓冲数据拷贝到内核缓冲区，然后写入设备


- 读数据时，要从设备读取数据到内核缓冲区，然后拷贝到用户缓冲区

针对这个操作：用户在读数据时，会去向内核态申请，想要读取内核的数据，而内核数据要去等待驱动程序从硬件上读取数据，当从磁盘上加载到数据之后，内核会将数据写入到内核的缓冲区中，然后再将数据拷贝到用户态的buffer中，然后再返回给应用程序。

<img src="https://gitee.com/cmyk359/img/raw/master/img/1653896687354-2025-1-219:54:18.png" alt="1653896687354" style="zoom:80%;" />

该过程中主要的时间花费就是用在了用户等待数据就绪以及用户态和内核态数据缓冲区之间的数据拷贝。为了提高IO效率，Linux的五种不同的IO模型就是在**等待数据就绪**和**读取数据**这两个阶段做了不同的处理。

![image-20250102200444084](https://gitee.com/cmyk359/img/raw/master/img/image-20250102200444084-2025-1-220:04:45.png)

在《UNIX网络编程》一书中，总结归纳了5种IO模型：

* 阻塞IO（Blocking IO）
* 非阻塞IO（Nonblocking IO）
* IO多路复用（IO Multiplexing）
* 信号驱动IO（Signal Driven IO）
* 异步IO（Asynchronous IO）

#### 阻塞IO

顾名思义，阻塞IO就是两个阶段都必须阻塞等待：

![image-20250102201324645](https://gitee.com/cmyk359/img/raw/master/img/image-20250102201324645-2025-1-220:13:26.png)

当应用程序调用IO函数（如read或write）时，如果数据没有准备好，用户进程会被阻塞，直到数据准备好并被复制到应用程序的缓冲区中。

在阻塞期间，进程无法执行其他任务，CPU资源被浪费在等待上。

#### 非阻塞IO

非阻塞IO的recvfrom操作会立即返回结果而不是阻塞用户进程。如果数据没有准备好，函数会立即返回，并返回一个错误码（如EWOULDBLOCK），表示当前没有数据可读或可写。用户程序需要**不断轮询内核**，检查数据是否准备好，这会导致CPU资源的浪费。

![image-20250102201821482](https://gitee.com/cmyk359/img/raw/master/img/image-20250102201821482-2025-1-220:18:23.png)

可以看到，非阻塞IO模型中，用户进程在第一个阶段是非阻塞，第二个阶段是阻塞状态。虽然是非阻塞，但性能并没有得到提高。而且忙等机制会导致CPU空转，CPU使用率暴增。

#### IO多路复用

无论是阻塞IO还是非阻塞IO，用户应用在一阶段都需要调用recvfrom来获取数据，差别在于无数据时的处理方案：

- 如果调用recvfrom时，恰好**没有**数据，阻塞IO会使CPU阻塞，非阻塞IO使CPU空转，都不能充分发挥CPU的作用。
- 如果调用recvfrom时，恰好**有**数据，则用户进程可以直接进入第二阶段，读取并处理数据

比如服务端处理客户端Socket请求时，在单线程情况下，只能依次处理每一个socket，如果正在处理的socket恰好未就绪（数据不可读或不可写），线程就会被阻塞，所有其它客户端socket都必须等待，性能自然会很差。

就比如服务员给顾客点餐，**分两步**：

* 顾客思考要吃什么（等待数据就绪）
* 顾客想好了，开始点餐（读取数据）

![image-20250102202456528](https://gitee.com/cmyk359/img/raw/master/img/image-20250102202456528-2025-1-220:24:58.png)

要提高效率有几种办法？

方案一：增加更多服务员（多线程）
方案二：不排队，谁想好了吃什么（数据就绪了），服务员就给谁点餐（用户应用就去读取数据）

那么问题来了：用户进程如何知道内核中数据是否就绪呢？

**文件描述符**（File Descriptor）：简称**FD**，**是一个从0开始递增的无符号整数，用来关联Linux中的一个文件。在Linux中，一切皆文件，例如常规文件、视频、硬件设备等，当然也包括网络套接字（Socket）**。[参考文章](https://blog.csdn.net/ye_yumo/article/details/143252968)

**IO多路复用：是利用单个线程来同时监听多个FD，并在某个FD可读、可写时得到通知，从而避免无效的等待，充分利用CPU资源。**

![image-20250102203443599](https://gitee.com/cmyk359/img/raw/master/img/image-20250102203443599-2025-1-220:34:45.png)

不过在Linux系统中监听FD的方式、通知的方式又有多种实现，常见的有：`select`、`poll`和`epoll`。它们是Linux提供的用于监听多个文件描述符状态的系统调用。这些系统调用允许程序将一组文件描述符注册到监听队列中，当其中任何一个文件描述符的状态发生变化时（如可读、可写或发生错误），系统调用会返回并通知应用程序。

区别：

- `select`和`poll`适用于监听文件描述符数量较少的情况，而`epoll`在大量文件描述符的监听场景中性能更优。
- 在通知方式上，`select`和`poll`只会通知用户进程有FD就绪，但不确定具体是哪个FD，需要用户进程逐个遍历FD来确认；`epoll`则会在通知用户进程FD就绪的同时，把已就绪的FD写入用户空间。



##### IO多路复用之select

select是Linux中最早的I/O多路复用实现方案，select函数相关源码如下：

![select](https://gitee.com/cmyk359/img/raw/master/img/select-2025-1-221:10:44.png)

通过select方式进行IO多路复用的流程如下：

1. 假设现在的IO都是读操作，创建`fd_set rfds`，初始时将所有比特位都置为零。
2. 假如要监听 fd = 1，2，5，将`rfds`中对应的比特位置为1
3. 调用select函数将这些fd信息拷贝到内核空间，内核负责对这些fd进行监听。执行`select(5 + 1, rfds, null, null, 3)`
4. 内核遍历`rfds`，从最低位开始，到传入的最大值为止，判断这个范围内被标记的fd是否已经就绪
5. 若当前没有就绪的fd，休眠等待数据就绪被唤醒或超时

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250102212349537-2025-1-221:23:50.png" alt="image-20250102212349537" style="zoom:80%;" />

6. 当有fd就绪时，内核会将结果写回到内核的`rfds`中。具体做法是，遍历内核中的`rfds`，遍历过程中找到被监听的fd，将其与已就绪的fd比较，相同则保留，其余的fd对应比特位置为0。之后将内核中的`rfds`拷贝回用户空间的`rfds`中，此时`rfds`中保存的就是已就绪的fd，并且select函数会返回已就绪fd的数量。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250102213454924-2025-1-221:34:57.png" alt="image-20250102213454924" style="zoom:80%;" />

7. 用户进程**遍历**fd_set，找到就绪的fd，读取其中的数据

以上是执行一次select函数的过程，之后要读取还未就绪的fd或者其他数据时，按照上面的流程将要读取的fd添加到`rfds`中（**可能将一个fd循环拷贝多次**），传到内核中进行监听，数据准备就绪时再去读取。循环往复处理各种读写数据的请求。

select模式存在的问题：

- 需要将整个fd_set从用户空间拷贝到内核空间，select结束还要再次拷贝回用户空间
- select无法得知具体是哪个fd就绪，需要遍历整个fd_set fd_set
- 监听的fd数量不能超过1024

##### IO多路复用之poll

poll模式对select模式做了简单改进，但性能提升不明显，部分关键代码如下：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250102214720250-2025-1-221:47:22.png" alt="poll模式" style="zoom:80%;" />

IO流程：

1. ‌**用户进程调用poll()函数**‌：

   用户进程通过调用`poll()`函数，将需要监听的fd及其关注的事件类型（如读就绪、写就绪等）传递给内核。

   传递给`poll()`函数的是一个`pollfd`结构体数组，每个结构体中包含了一个文件描述符和该文件描述符所关注的事件类型。

2. ‌**内核处理poll()请求**‌：

   内核接收到`poll()`调用后，会将这些文件描述符和事件类型注册到内核内部的监听列表中（**转链表存储，无上限**）。

   内核会监视这些文件描述符的状态，当其中一个或多个文件描述符的事件就绪时，内核会进行相应的处理。

3. ‌**内核通知用户进程**‌：

   当内核检测到某个fd的事件已经就绪时，它会修改该fd的`pollfd`结构体中的`revents`为已就绪，并将`pollfd`结构体数组从内核空间**拷贝回用户空间**，并返回就绪fd数量

4. ‌**用户进程处理就绪事件**‌：

   用户进程通过调用`poll()`函数，阻塞等待直到有文件描述符就绪或者超时。

   当`poll()`函数返回时，用户进程通过**遍历**`pollfd`结构体数组中的`revents`成员，可以得知哪些文件描述符的事件已经就绪，进而可以读取对应fd的数据。

   

**与select对比：**

* select模式中的fd_set大小固定为1024，而pollfd在内核中采用链表，理论上无上限
* `poll()`函数在内核中是通过轮询的方式来检查文件描述符的状态的。监听FD越多，每次遍历消耗时间也越久，性能反而会下降



##### IO多路复用之epoll

**epoll**‌ 是对`select`和`poll`的改进，能够显著减少数据复制的开销并提高系统资源的利用率。

主要工作原理如下：

- ‌**事件驱动**‌：`epoll`采用事件通知机制，只有当文件描述符有事件发生时才会被通知。与`select`和`poll`的轮询机制相比，`epoll`避免了无效轮询，提高了处理效率。
- ‌**数据结构**‌：`epoll`使用**红黑树**和**就绪队列**来管理文件描述符。红黑树用于快速查找和管理注册的文件描述符，就绪列表则用于存储已经准备好进行IO操作的文件描述符。
- ‌**回调机制**‌：`epoll`通过回调函数来通知用户进程文件描述符的事件状态。当事件发生时，内核会调用相应的回调函数，将事件信息添加到就绪列表中。

具体源码分析，它提供了三个函数：

1、`epoll_create`：在内核创建eventpoll结构体，返回对应的句柄epfd，即该eventpoll的唯一标识。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250102221030671-2025-1-222:10:31.png" alt="epoll_create" style="zoom:80%;" />

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250102221248791-2025-1-413:40:19.png" alt="执行epoll_create" style="zoom:80%;" />

2、`epoll_ctl`：与select和poll相比，该函数只是将一个fd添加到eventpoll的红黑树中，对这个fd进行监听，但**不会等待**该fd对应的数据就绪。而是对该fd设置要监听的事件发生时的回调函数函数`ep_poll_callback`，当要监听的事件发生时，自动调用该回调函数，就把对应的FD加入到就绪列表中

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250102221353073-2025-1-222:13:55.png" alt="epoll_ctl" style="zoom:80%;" />

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250102222040358-2025-1-413:40:46.png" alt="执行epoll_ctl" style="zoom:80%;" />

3、`epoll_wait`：将fd添加到红黑树中后，调用epoll_wait **检查就绪列表**是否为空，不为空则返回就绪的FD的数量，同时将就绪列表中的fd拷贝到用户空间中的`events`中。（与select和poll不同，它们是将所有的fd列表拷贝过去，而epoll拷贝过去的只是就绪的fd）

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250102222307077-2025-1-222:23:09.png" alt="epoll_wait" style="zoom:80%;" />

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250102222811692-2025-1-222:28:12.png" alt="执行epoll_wait" style="zoom:67%;" />

小结：

select模式存在的三个问题：

* 能监听的FD最大不超过1024
* 每次select都需要把所有要监听的FD都拷贝到内核空间
* 每次都要遍历所有FD来判断就绪状态

poll模式的问题：

- poll利用链表解决了select中监听FD上限的问题，但依然要遍历所有FD，如果监听较多，性能会下降

epoll模式中如何解决这些问题的？

* 基基于epoll实例中的红黑树保存要监听的FD，理论上无上限，而且增删改查效率都非常高，性能不会随监听的FD数量增多而下降
* **每个FD只需要执行一次epoll_ctl添加到红黑树**，以后每次epol_wait无需传递任何参数，无需重复拷贝FD到内核空间
* 内核会将就绪的FD直接拷贝到用户空间的指定位置，用户进程无需遍历所有FD就能知道就绪的FD是谁

##### 基于epoll模式的web服务的基本流程

![image-20250103101024427](https://gitee.com/cmyk359/img/raw/master/img/image-20250103101024427-2025-1-310:10:25.png)

1. 在服务端调用`epoll_create`创建epoll实例，在内核中创建红黑树和就绪列表
2. 创建serverSocket，得到一个服务端的套接字文件描述符，记为`ssfd`。
3. 调用`epoll_ctl`将监听套接字添加到红黑树中，并指定监听的事件类型（如`EPOLLIN`表示读就绪事件），同时注册fd就绪时的回调函数。
4. 进入事件循环，使用`epoll_wait`函数等待`ssfd`上有事件发生。
5. 等待指定时间后若无事件发生，则再次调用`epoll_wait`。
6. 当被监听的fd上有事件发生时，根据`epoll_wait`返回的事件类型，进行相应的处理。
7. 如果`ssfd`发生读就绪事件，则说明有客户端进行连接，调用`accpt()`函数接收客户端socket，得到对应的fd，并调用`epoll_ctl`为客户端socket添加监听。
8. 如果发生的是客户端socket的读就绪事件，则使用`read()`或`recv()`函数读取客户端发送的数据，进行处理后返回响应。
9. 如果客户端连接关闭或发生错误，则使用`close()`函数关闭客户端套接字，并从epoll树中删除。
10.  循环处理事件，重复步骤4-9‌，继续等待并处理下一个事件，直到服务器进程被终止。

##### 事件通知机制

在IO多路复用中，事件通知机制有两种主要的触发模式`LT`和`ET`，它们定义了当文件描述符上的事件就绪时，内核如何通知用户进程，并且用户进程应该如何处理这些事件。

水平触发（Level Triggered, **LT**）

- 工作原理：当FD有数据可读时，每次调用`epoll_wait`时，都会返回该事件（**会重复通知多次**），直至数据处理完成。是Epoll的默认模式。

- 特点：LT模式相对简单直观，用户进程可以在每次调用`epoll_wait`时处理一部分数据，而不必担心遗漏事件。然而，如果事件处理不及时，可能会导致事件堆积，增加处理复杂度。

边缘触发（Edge Triggered, **ET**）

- 工作原理：当FD有数据可读时，**只会被通知一次**，不管数据是否处理完成。用户进程必须确保在接收到通知后，**能够一次性处理完所有就绪的事件**，否则可能会遗漏后续的事件。
- 特点：ET模式要求用户进程对事件进行高效处理，以避免遗漏。它通常与非阻塞IO结合使用，可以提高系统的吞吐量和响应速度。然而，实现起来相对复杂，需要用户进程仔细管理事件的处理逻辑。

在epoll模式中，当fd的监听事件发生时，会调用该函数的回调函数，将该fd添加到就绪列表中。当调用`epoll_wait`时，会将就绪队列中的fd拷贝到用户空间去，但再次之前会将就绪的fd从就绪列表中断开，再完成拷贝动作。可能这次拷贝并没有将所有fd都拷贝过去，若当前采用的是`ET`模式，下次再来拷贝剩余的数据时会失败，因为之前的就绪的fd已经从就绪列表中断开了。而当采用的是`LT`模式时，若还有数据没有拷贝完，会将这些fd数据重写添加回就绪列表中，以便下次继续拷贝剩余的数据。

在实际应用中，选择LT模式还是ET模式取决于具体的应用场景和需求。

- ‌**LT模式**‌适用于那些可以容忍一定延迟，但希望简化事件处理逻辑的应用场景。
- ‌**ET模式**‌则更适用于那些需要高效处理大量并发事件，对延迟敏感的应用场景，如高性能网络服务器。

#### 信号驱动IO

它允许用户进程通过注册一个信号处理函数来**异步**接收数据可用的通知。当设备数据可用时，内核会向用户进程发送一个SIGIO信号，触发用户进程预先注册的信号处理函数，进而执行相应的IO操作。期间用户应用可以执行其它业务，无需阻塞等待。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250103091322550-2025-1-309:13:33.png" alt="image-20250103091322550" style="zoom:80%;" />

**与其他IO模型的比较**‌：

- 与阻塞IO相比，信号驱动IO避免了用户进程在IO操作完成前的阻塞，提高了IO效率。
- 与非阻塞IO相比，信号驱动IO不需要用户进程通过轮询方式不断尝试读写文件描述符，减少了CPU资源的浪费。
- 与IO复用（如select、poll、epoll）相比，信号驱动IO通过信号机制实现IO操作的异步通知，不需要进程主动调用轮询函数来检查IO状态。
- 与异步IO相比，信号驱动IO仍然需要用户进程在信号处理函数中执行IO操作，而异步IO则完全由内核处理IO操作，并在完成后通知用户进程。

存在的问题：当有大量IO操作时，信号较多，SIGIO处理函数不能及时处理可能导致信号队列溢出而且内核空间与用户空间的频繁信号交互性能也较低。

#### 异步IO

异步IO的**整个过程都是非阻塞的**，用户进程调用完异步API后就可以去做其它事情，内核等待数据就绪并拷贝到用户空间后才会递交信号，通知用户进程。

![image-20250103091746704](https://gitee.com/cmyk359/img/raw/master/img/image-20250103091746704-2025-1-309:17:47.png)



**优点**

1. ‌**高性能**‌：异步IO能够在IO操作进行的同时，让CPU去执行其他任务，从而提高系统的整体性能。
2. ‌**资源利用率高**‌：异步IO可以让一个线程同时处理多个IO操作，避免了频繁的线程切换，从而提高了CPU和内存的利用率。
3. ‌**提高响应速度**‌：由于异步IO不需要等待IO操作完成，可以立即返回执行其他任务，因此可以提高系统的响应速度。
4. ‌**高并发处理能力**‌：异步IO可以处理大量的并发IO请求，使得系统能够更有效地处理多个IO操作。

**缺点**

1. ‌**编程复杂度增加**‌：异步编程模型相对于同步编程模型更加复杂，因为它涉及到事件循环、回调函数等概念，可能会增加代码的编写和维护成本。
2. ‌**错误处理困难**‌：异步编程中可能存在回调地狱(Callback Hell)等问题，导致代码难以理解和调试，容易出现逻辑错误和内存泄漏等问题。
3. ‌**调试困难**‌：异步程序中的事件顺序可能比较随机，因此在调试时可能会很难追踪代码的执行流程，特别是当存在大量异步操作时更加困难。
4. ‌**资源竞争**‌：如果异步操作涉及共享资源的读写，可能会导致资源竞争和数据一致性问题，需要额外的同步机制来解决。



注意：在IO操作中，**同步和异步** 与 **阻塞和非阻塞**没有直接关系。

IO操作是同步还是异步，**关键看数据在内核空间与用户空间的拷贝过程**（数据读写的10操作），也就是阶段二是同步还是异步：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250103092223705-2025-1-309:22:24.png" alt="image-20250103092223705" style="zoom:80%;" />

### 2.3、Redis网络模型

Redis是单线程还是多线程？

如果仅仅聊Redis的核心业务部分（命令处理），答案是单线程

如果是聊整个Redis，那么答案就是多线程

在Redis版本迭代过程中，在两个重要的时间节点上引入了多线程的支持：

- Redis v4.0：引入多线程异步处理一些耗时较长的任务，例如异步删除命令unlink 
- Redis v6.0：在核心网络模型中引入多线程，进一步提高对于多核CPU的利用率

为什么Redis要选择单线程？

- 抛开持久化不谈，Redis是纯内存操作，执行速度非常快，它的性能瓶颈是网络延迟而不是执行速度，因此多线程并不会带来巨大的性能提升。

- 多线程会导致过多的上下文切换，带来不必要的开销
- 引入多线程会面临线程安全问题，必然要引入线程锁这样的安全手段，实现复杂度增高，而且性能也会大打折扣



Redis通过IO多路复用来提高网络性能，并且支持各种不同的多路复用实现，并且将这些实现进行封装，提供了**统一的**高性能事件库API库 AE。

![image-20250103093722861](https://gitee.com/cmyk359/img/raw/master/img/image-20250103093722861-2025-1-309:37:24.png)

在`ae.c`中根据当前系统支持的多路复用方式，引入对应响应的API库，之后调用API时就会调用对应文件中的函数。

在Linux系统下，Redis底层使用epoll实现多路复用，可以参考[基于epoll模式的web服务流程](https://www.catpaws.top/284457ed/#基于epoll模式的web服务的基本流程)，分析Redis单线程网络模型的源码：

![Redis单线程网络模型的代码执行流程](https://gitee.com/cmyk359/img/raw/master/img/Redis单线程网络模型的代码执行流程-2025-1-313:12:44.png)

- `server.c`中的`main`方法是整个服务的入口
- 首先在`main`方法中，执行`initServer()`初始化服务，在该方法中调用aeApiCreate（类似于epoll_create）创建epoll实例，创建ServerSocket并得到对应的fd。同时注册Socket连接处理器，在该处理器内部会调用`aeApiAddEvent`监听ServerSocket 的读事件，并为为其绑定事件触发时的处理器`acceptTcpHandler`。
- 在`acceptTcpHandler`中，处理ServerSocket上的读事件，接收客户端请求，得到客户端socket的fd。监听Socket的读事件，并为其绑定读事件触发时的处理器`readQueryFromClient`。
- `readQueryFromClient`负责处理客户端发来的命令请求，首先从客户端的读缓冲区中读取命令字符串，再解析这些字符串，转为Redis命令参数存入 c->argv 数组。从argv数组中获得要执行的命令和参数，通过对应命令的command函数执行命令，并将结果写到客户端写缓冲区c->buf，若缓冲区写不下，写到 c->reply，这是一个链表，容量无上限。最后将客户端添加到server.clients_pending_write这个队列，等待被写出。
- 之后执行`main`方法中的`aeMain`开始循环监听事件，等待fd就绪。
- 当开始监听后，若指定的fd未就绪，则需要休眠等待。因此在开始监听前，会先调用前置处理器`beforesleep`，对clients_pending_write这个队列中等待写出的客户端进行处理，依次将对应客户端缓存区中的数据返回给客户端。
- 之后，开始监听fd，执行`aeApiPoll`（类似以epoll_wait）。当就绪队列中有fd时，会返回就绪fd的数量，调用对应的处理器处理就绪的fd。



![image-20250103114438782](https://gitee.com/cmyk359/img/raw/master/img/image-20250103114438782-2025-1-311:44:40.png)

整体来讲，Redis使用了IO多路复用技术，允许单个线程同时监听多个文件描述符（包括服务端的ServerSocket和客户端的socket），并在有数据可读或可写时将任务派发给不同的处理器进行处理。具体来说：

- 当服务端的ServerSocket发生读事件时，说明有客户端进行连接，将对应的任务分配给连接应答处理器`tcpAcceptHandler`，获取客户端socket对应的fd，并为其注册监听；
- 当客户端socket发生读事件时，说明用客户端命令请求到达，将对应的任务分配给命令请求处理器`readQueryFromClient`，从客户端读缓冲区中读取命令字符串并解析为Redis命令进行处理，将处理结果写到客户端写缓冲区，并将该客户端放入clients_pending_write队列等待数据写回；
- 在每次循环监听fd之前，通过`beforesleep`方法调用命令回复处理器`sendReplyToClient`处理clients_pending_write队列中的客户端，将存储在客户端输出缓冲区（`buf`字段）或输出链表（`reply`字段）中的响应数据发送给客户端。



Redis 6.0版本中引入了多线程，目的是为了提高IO读写效率。

在处理客户端命令请求时，需要从客户端Socket中读出命令，在此过程中涉及到了网络IO的读操作，会受到网络带宽等影响。同样的，在将服务端处理结果写回客户端Socket中时，涉及到了网络IO的写操作，这又是一个性能瓶颈。

对于redis来说在监听fd，以及命令执行的时候，（主线程）单线程是完成足够的（纯内存操作），真正影响性能的永远是IO。

因此在**解析客户端命令**、**写响应结果**时采用了多线程。核心的命令执行、IO多路复用模块依然是由主线程执行。

![image-20250103115210756](https://gitee.com/cmyk359/img/raw/master/img/image-20250103115210756-2025-1-311:52:11.png)



## 三、通信协议 - RESP协议

Redis是一个CS架构的软件，通信一般分两步（不包括pipeline和PubSub）：

1. 客户端（client）向服务端（server）发送一条命令
2. 服务端解析并执行命令，返回响应结果给客户端

因此客户端发送命令的格式、服务端响应结果的格式必须有一个规范，这个规范就是通信协议。

而在Redis中采用的是RESP（Redis Serialization Protocol）协议：

- Redis 1.2版本引入了RESP协议
- Redis 2.0版本中成为与Redis服务端通信的标准，称为RESP2
- Redis 6.0版本中，从RESP2升级到了RESP3协议，增加了更多数据类型并且支持6.0的新特性--客户端缓存

但目前，默认使用的依然是RESP2协议（以下简称RESP）。

在RESP中，通过**首字节**的字符来区分不同数据类型，常用的数据类型包括5种：

- 单行字符串：首字节是 `+`，后面跟上单行字符串，以CRLF（ `\r\n`）结尾。例如返回OK： `+OK\r\n`。

  > 单行字符串的数据中只能包含普通字符串，不允许包含`\r\n`，是非二进制安全的。通常用于服务端返回的信息

- 错误（Errors）：首字节是 `-` ，与单行字符串格式一样，只是字符串是异常信息，例如："-Error message\r\n"。

- 数值：首字节是 `:`，后面跟上数字格式的字符串，以CRLF结尾。例如：":10\r\n"

- 多行字符串：首字节是 `$` ，表示二进制安全的字符串，最大支持512MB。记录时保存**字符串长度**和**字符串本身**，例如：

  ![image-20250103141407181](https://gitee.com/cmyk359/img/raw/master/img/image-20250103141407181-2025-1-314:14:08.png)

  - 如果大小为0，则代表空字符串："$0\r\n\r\n"


  - 如果大小为-1，则代表不存在："$-1\r\n"

- 数组：首字节是`*`，后面跟上数组元素个数，再跟上元素，元素数据类型不限，例如：

  ![image-20250103141609254](https://gitee.com/cmyk359/img/raw/master/img/image-20250103141609254-2025-1-314:16:10.png)



## 四、内存策略

Redis之所以性能强，最主要的原因就是基于内存存储。然而单节点的Redis其内存大小不宜过大，会影响持久化或主从同步性能。

我们可以通过修改配置文件来设置Redis的最大内存。当内存使用达到上限时，就无法存储更多数据了。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250103144051474-2025-1-314:40:52.png" alt="image-20250103144051474" style="zoom:80%;" />

#### 过期策略

在Redis中，可以通过`expire`命令给Redis的key设置TTL（存活时间）

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250103214944506-2025-1-321:50:18.png" alt="image-20250103214944506" style="zoom:80%;" />

可以发现，当key的TTL到期以后，再次访问name返回的是nil，说明这个key已经不存在了，对应的内存也得到释放，从而起到内存回收的目的。

那么，Redis如何知道一个Key是否过期呢？

答：利用两个Dict分别记录key-value对及key-ttl对

Redis本身是一个典型的key-value内存存储数据库，因此所有的key、value都保存在Dict结构中。不过在其database结构体中，对key进行了划分，使用多个Dict数组保存。其中，**`dict`中存放所有的key及value，而`expires`只包含设置了TTL的key，在其中存储key及其对应的TTL存活时间**。

![database结构体](https://gitee.com/cmyk359/img/raw/master/img/image-20250103215311967-2025-1-321:53:13.png)



<img src="https://gitee.com/cmyk359/img/raw/master/img/redisDb-2025-1-322:35:25.png" alt="redisDb" style="zoom:80%;" />

是不是TTL到期就立即删除了呢？

**惰性删除**：顾明思议并不是在TTL到期后就立刻删除，而是在**访问**一个key的时候，检查该key的存活时间，如果已经过期才执行删除。

![惰性删除](https://gitee.com/cmyk359/img/raw/master/img/image-20250103223836841-2025-1-322:38:38.png)

若有很多key过期后很长时间没有被访问，只采用惰性删除时，这些key就无法被释放。

**周期删除**：顾明思议是通过一个定时任务，周期性的**抽样部分过期的key**，然后执行删除。

执行周期有两种：

- Redis服务初始化函数initServer()中设置定时任务，按照server.hz的频率来执行过期key清理，模式为**SLOW**

- Redis的每个事件循环前会调用beforeSleep()函数，执行过期key清理，模式为**FAST**




SLOW模式规则：

- 执行频率受server.hz影响，默认为10，即每秒执行10次，每个执行周期100ms。
-  执行清理耗时不超过一次执行周期的25%.
-  逐个遍历db，逐个遍历db中的bucket（相当于dict中哈希表的一个角标下的链表），抽取20个key判断是否过期
- 如果没达到时间上限（25ms）并且过期key比例大于10%，再进行一次抽样，否则结束

FAST模式规则（过期key比例小于10%不执行）：

- 执行频率受`beforesleep()`调用频率影响，但两次FAST模式间隔不低于2ms
-  执行清理耗时不超过1ms
-  逐个遍历db，逐个遍历db中的bucket，抽取20个key判断是否过期
- 如果没达到时间上限（1ms）并且过期key比例大于10%，再进行一次抽样，否则结束

源码分析：

Slow模式会在服务初始化时调用一次`serverCron`进行清理，并返回下一次调用`serverCron`的时间间隔，所以可以通过设置`server.hz`来控制Slow模式的清理频率。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250103230109701-2025-1-323:01:10.png" alt="Slow模式的处理过程" style="zoom:80%;" />

Fast模式会在每次调用`beforesleep`函数时执行一次。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250103230330831-2025-1-323:03:31.png" alt="fast模式的处理过程" style="zoom:80%;" />

在Redis进入事件循环后，每次循环都会执行`beforesleep`方法，在其中进行Fast模式的清理。而当有fd就绪，处理完对应的IO事件后，会检查当前是否到了执行Slow清理模式的时间，若还在时间间隔内，则不做处理；若到了执行时间，则会调用`serverCron`进行Slow模式的清理。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250103230423489-2025-1-323:04:24.png" alt="两种模式生效时机" style="zoom: 67%;" />

#### 淘汰策略

当Redis中没有key过期，但现在Redis的内存已经满了，就需要基于淘汰策略删除一部分key。

> 被删除的key及其对应的数据不再存储在Redis中，即数据丢失‌。因此应该采取适当的数据持久化策略（如RDB或AOF）来确保数据的可靠性和可恢复性‌。
>
> 需要注意的是，持久化策略也不能完全保证数据的绝对安全。例如，在RDB持久化中，如果数据在快照保存之前被淘汰，那么这些数据将不会包含在持久化文件中。在AOF持久化中，如果数据被淘汰后还没有被写入到AOF文件中，那么这些数据也将丢失。

**内存淘汰**：就是当Redis内存使用达到设置的阈值时，Redis主动挑选**部分key**删除以释放更多内存的流程。

由于任何一条数据的写入操作都会导致内存溢出，因此Redis会在每一条命令执行前检查内存是否足够，如果不够会进行内存清理。

Redis会在处理客户端命令的方法processCommand（）中尝试做内存淘汰：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250103235731736-2025-1-323:57:42.png" alt="image-20250103235731736" style="zoom:80%;" />

Redis支持8种不同策略来选择要删除的key，这八种策略可以归为五类：

1. 不淘汰任何key

`noeviction`：不淘汰任何key，但是内存满时不允许写入新数据，默认就是这种策略。

2. 清理设置了TTL的key

`volatile-ttl`：对设置了TTL的key，比较key的剩余TTL值，TTL越小越先被淘汰（送你一程）

之后的三种策略，根据是要作用在所有key上（前缀为`allkeys`），还是只作用在设置了TTL的key上(前缀为`volatile`)，各分为两种。

3. 随机淘汰

`allkeys-random`：对全体key，随机进行淘汰。也就是直接从db->dkt中随机挑选

`volatile-random`：对设置了TTL的key，随机进行淘汰。也就是从db->expires中随机挑选。

4. LRU

`allkeys-lru`：对全体key，基于LRU算法进行淘汰

`volatile-lru`：对设置了TTL的key，基于LRU算法进行淘汰

5. LFU

`allkeys-lfu`：对全体key，基于LFU算法进行淘汰

`volatile-lfu`：对设置了TTL的key，基于LFI算法进行淘汰

> **LRU**（Least Recently Used），最近最少使用。用当前时间减去最后一次访问时间，这个值越大则淘汰优先级越高。
>
> **LFU**（Least Frequently Used），最少频率使用。会统计每个key的访问频率，值越小淘汰优先级越高。

若采用`LRU`或者`LFU`淘汰策略，Redis如何统计**一个key最近一次的访问时间**以及**最近一次访问的频率**？

Redis的数据都会被封装为RedisObject结构：

![image-20250104001134324](https://gitee.com/cmyk359/img/raw/master/img/image-20250104001134324-2025-1-400:11:35.png)

其中的`unsigned lru:LRU_BITS`属性就是用来统计当前RedisObject对象的访问信息。**根据配置文件中设置的淘汰策略，这个字段会记录不同的值**。

若采用`LRU`淘汰策略，该字段会以秒为单位记录最近一次访问时间，长度24bit

若采用`LFU`淘汰策略，该字段会用高16位 以**分钟**为单位记录最近一次访问时间，低8位记录<span style="color: red;">逻辑访问次数</span>

LFU的访问次数之所以叫做**逻辑访问次数**，是因为并不是每次key被访问都计数，而是通过运算：

1.  生成0~1之间的随机数R
2. 计算1/（旧次数 * `Ifu_log_factor` +1），记录为P，`lfu_log_factor`默认为10
3. 如果R<P，则计数器 +1，且最大不超过255
4.  访问次数会随时间衰减，距离上一次访问时间每隔 `lfu_decay_time` 分钟（默认1），计数器-1

分析：随着访问该key的次数增多，得到的p越来越小，R<P的可能就越来越小，该key的逻辑访问次数增加的可能也会越来越小。如果长时间不访问，访问次数会随时间衰减。逻辑访问次数虽然不是真正访问次数，但是对所有key来说，这个次数还是说明一个key的访问频率的高低。

之前说过，Redis会在执行每一条客户端命令前执行`processCommand()`进行内存淘汰。在该函数中会根据当前设定的淘汰策略淘汰一部分key，具体执行流程如下：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250104004036495-2025-1-400:40:37.png" alt="processCommand函数执行流程" style="zoom:80%;" />