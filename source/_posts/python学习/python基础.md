---
title: python基础
categories:
  - python学习
abbrlink: 81b2f4bf
date: 2024-11-06 20:36:23
tags:
---

<meta name = "referrer", content = "no-referrer"/>

{% note info%}

python版本：3.x

{% endnote%}

## 语法规范

**缩进**：

- 严格使用 **4个空格** 作为缩进单位（禁止使用 Tab 键）

- 多行结构对齐：

  ```python
  # 正确：参数垂直对齐
  def long_function_name(
          var_one, var_two, 
          var_three, var_four):
      ...
  
  # 错误：参数未对齐
  def long_function_name(
      var_one, var_two,
      var_three, var_four):
      ...
  ```

***

**冒号**

在 Python 中，冒号（`:`）是代码块开始的标志，主要用于定义需要缩进代码块的语句。

***

**行长度**

- 每行不超过**79个字符**（文档字符串/注释不超过72字符）

- 使用反斜杠`\`、括号、圆括号实现隐式换行：

```python
# 正确
result = (value1 + value2
          - value3 * value4)
```

**命名规范**

| 类型      | 规范            | 示例                               |
| :-------- | :-------------- | :--------------------------------- |
| 变量/函数 | 小写 + 下划线   | `my_variable`, `calculate_total()` |
| 类名      | 首字母大写驼峰  | `MyCustomClass`                    |
| 常量      | 全大写 + 下划线 | `MAX_CONNECTIONS`                  |
| 私有成员  | 单下划线前缀    | `_internal_counter`                |
| 避免冲突  | 单末尾下划线    | `class_`                           |
| 魔术方法  | 双下划线包围    | `__init__`                         |

- 变量名只能包含 **字母、数字和下划线**。变量名只能以字母或下划线打头，但不能用数字打头。
- 变量名不能包含空格，但可使用下划线来分隔其中的单词。  
- python没有内置的常量数据类型，通常使用**全大写**来指出应将某个变量视为常量。

## python基本数据类型

Python3 中常见的数据类型有：

- Number（数字）
- String（字符串）
- bool（布尔类型）
- List（列表）
- Tuple（元组）
- Set（集合）
- Dictionary（字典）

Python3 的六个标准数据类型中：

- **不可变数据（3 个）：**Number（数字）、String（字符串）、Tuple（元组）；
- **可变数据（3 个）：**List（列表）、Dictionary（字典）、Set（集合）。

此外还有一些高级的数据类型，如: 字节数组类型(bytes)。

[数据类型转换](https://www.runoob.com/python3/python3-type-conversion.html)

## 一、简单数据类型

### 1.1字符串

[补充参考](https://www.runoob.com/python3/python3-string.html)

在Python中，用引号括起的都是字符串 **str**，其中的引号可以是单引号，也可以是双引号 。

使用三引号(''' 或 """)可以指定一个多行字符串，称为文档字符串，python使用它们来生成有关程序中函数的文档。

```python
"This is a string."
'This is also a string.'
'I told my friend, "Python is my favorite language!"'
"The language 'Python' is named after Monty Python, not the snake."
"One of Python's strengths is its diverse and supportive community."
```

#### 修改字符串的大小写  

**title()**以首字母大写的方式显示每个单词，即将每个单词的首字母都改为大写。 

要将字符串改为全部大写或全部小写 ,**upper()** 或 **lower ()** 

**capitalize()** 将字符串的第一个字母变成大写，其他字母变小写。

```python
name = "ada lovelace"
print(name.title())

name = "Ada Lovelace"
print(name.upper())
print(name.lower())


-----------------------------------
Ada Lovelace
ADA LOVELACE
ada lovelace
```

#### 在字符串中使用变量

要在字符串中插入变量的值，**可在前引号前加上字母f**，在将要插入的变量放在花括号内。这样python显示字符串时，将把每个变量都替换成其值。这种字符串名为 **f-string**，f是format的简写。

```python
first_name = 'ada'
last_name = 'lovelace'

full_name = f"{first_name}  {last_name}"

message = f"Hello, {full_name.title()}"
print(full_name)

-----------------------------------
Hello, Ada  Lovelace


#f字符串是python 3.6引入的，之前的语法如下:
full_name = "{} {}".format(first_name, last_name)
```

####  合并（拼接）字符串  

Python使用加号（+）来合并字符串。  

#### 字符串切片

字符串切片 **str[start:end]**，其中 start（包含）是切片开始的索引，end（不包含）是切片结束的索引。



#### 处理空白

要在字符串中**添加制表符**，可使用字符组合**\\t**  

要在字符串中**添加换行符**，可使用字符组合**\\n**

还可在同一个字符串中同时包含制表符和换行符。字符串"\\n\\t"让Python换到下一行，并在下一行开头添加一个制表符。  

```python
print("Languages:\n \tPython\n \tC\n \tJavaScript")
---------------------------------------------------
Languages:
	Python
	C
	JavaScript
```

删除字符串**末尾**空白，可使用方法**rstrip()**。  

删除字符串**开头**空白，可使用方法**lstrip()**。  

删除字符串**两侧**空白，可使用方法**strip()**。  



然而，这种删除只是**暂时**的，要永久删除这个字符串中的空白，必须将删除操作的结果存回到变量中。

#### 分割字符串

`split()`方法用于将字符串按指定分隔符拆分为**子字符串列表**。

```python
str.split(sep=None, maxsplit=-1)
```

- sep: 分隔符，默认为None，以任意空白字符分割，包括空格、换行符 \n、制表符 \t 等。
- maxsplit：最大分割次数，默认为-1（无限制）

当不指定sep时，连续空白字符会被视为单个分隔符；可以使用自定义分隔符（如逗号、冒号等）

```python
text = "Python  is\tawesome\nfor data"
print(text.split())  # 输出: ['Python', 'is', 'awesome', 'for', 'data']

#指定分隔符
csv = "A,B,C,D"
print(csv.split(','))  
```

通过 `maxsplit` 限制分割次数

```python
text = "one two three four"
print(text.split(' ', 2))  #输出 ['one', 'two', 'three four']
```



补充：

- `splitlines()`‌：按照行('\r', '\r\n', \n')分隔，返回一个包含各行作为元素的列表，如果参数 keepends 为 False，不包含换行符，如果为 True，则保留换行符。
- `rsplit()` 方法用于从字符串的**右侧**开始拆分
- `re.split()`：可以根据正则表达式模式来分割字符串，适合复杂分割需求

#### 操作子串

count() 方法用于统计字符串里<u>某个字符或子字符串</u>出现的次数。可选参数为在字符串搜索的开始与结束位置。

```python
count(sub, start= 0,end=len(string))

#sub -- 搜索的子字符串
#start -- 字符串开始搜索的位置。默认为第一个字符,第一个字符索引值为0。
#end -- 字符串中结束搜索的位置。字符中第一个字符的索引为 0。默认为字符串的最后一个位置。
```

find() 方法检测字符串中是否包含子字符串 str ，可以指定检查范围的 beg（开始） 和 end（结束）

如果指定范围内如果包含指定索引值，返回的是索引值在字符串中的起始位置（第一次出现的位置）。如果不包含索引值，返回-1。

index(str, beg=0, end=len(string))方法与find功能相同，只不过不存在时会抛出异常：ValueError: substring not found

```python
find(str, beg=0, end=len(string))

#str -- 指定检索的字符串
#beg -- 开始索引，默认为0。
#end -- 结束索引，默认为字符串的长度。
```



#### 使用字符串时避免语法错误  

在用单引号括起的字符串中，如果包含撇号，就将导致错误。这是因为这会导致Python将第一个单引号和撇号之间的内容视为一个字符串，进而将余下的文本视为Python代码，从而引发错误。

撇号位于两个双引号之间，因此Python解释器能够正确地理解这个字符串：

```python
message = "One of Python's strengths is its diverse community."
print(message)
--------------------------------
One of Python's strengths is its diverse community. 
```

如果你使用单引号， Python将无法正确地确定字符串的结束位置  :

```python
message = 'One of Python's strengths is its diverse community.'
print(message)
---------------------------------------
File "apostrophe.py", line 1
	message = 'One of Python's strengths is its diverse community.'

SyntaxError: invalid syntax
```

### 1.2 数字

[补充参考](https://www.runoob.com/python3/python3-number.html)

#### 整数与浮点数

基础的python数字类型就是`int`和`float`。

整数用int表示，可以存储任意精度的**无符号整数**，浮点数用float表示（没有独立的double类型），每个浮点数都是双精度64位数值，可以用科学计数法表示。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250716204051831-2025-7-1620:41:31.png" alt="常用操作符和函数" style="zoom:80%;" />

任意两个数相除时，结果总是浮点数，即便这两个数都是整数且能整除。只要整数部分可以用`//`

```python
4/2  -> 2.0
4//2 -> 2
```

> 在python2中，两个整数相除结果总是整数，小数部分会被截断。

无论是哪种运算，**只要有操作数是浮点数，python默认得到的总是浮点数。**

{% note info %}

Python的整数没有 `short/int/long` 等子类型，只有统一的 `int` 类型。Python 3 合并了 Python 2 的 `int` 和 `long` 类型，所有整数均为 `int` 对象。

该类型可表示任意大小的无符号整数（包括正整数、负整数和零），无固定位数上限，仅受可用内存限制。

Python的整数类型在内存中采用动态扩展和分段存储机制，自动扩展精度。

{% endnote%}

#### 使用函数 str()避免类型错误  

不能直接拼接数字和字符串，这会抛出类型错误异常。需要使用字符串的构造函数**str()**将数字转化为字符串，之后才能拼接。

```python
age = 23
message = "Happy " + age + "rd Birthday!"  #错误
message = "Happy " + str(age) + "rd Birthday!"
print(message)
------------------------------------------------------
Happy 23rd Birthday!
```



#### 数中的下划线

书写很大的数时，可以**使用下划线将其中的数字分组**，使其更清晰易读。

```python
universe_age = 14_000_000_000
print(universe_age)
--------------------------------
14000000000
```

这是因为存储这种数时，python会忽略其中的下划线。将数字分组时，即便不是将每三个数分为一组，也不会影响最终的值。

####  给多个变量赋值

保证变量和值的个数相同，用逗号将变量名和值分隔开。

```python
x, y, z = 1, 2, 3
```



### 1.3 布尔类型

Python中的布尔类型（bool）是表示逻辑值的基本数据类型，布尔类型是整数类型int的子类。

它只有两个值：

- `True` - 等同于整数 1

- `False` - 等同于整数 0

`True` 和 `False` 是单例对象，在整个Python解释器中，相同的布尔值只有一个实例。

```python
True + 2   # 结果为 3
False * 10 # 结果为 0
```

***

通过布尔转换函数 `bool()` 可以将其他类型的值转换为布尔值：

```python
bool(0)         # False（数字0）
bool(0.0)       # False
bool("")        # False（空字符串）
bool([])        # False（空列表）
bool(None)      # False（空值）

bool(1)         # True
bool("hello")   # True
bool([1,2,3])   # True
bool(-1)        # True（注意：负数也为真）
```

***

Python 提供了三种基本的布尔运算：与（and）、或（or）、非（not）。

优先级：not > and > or。

`and` 和 `or` 运算符具有短路行为：

- 对于 `and`：如果第一个表达式为 `False`，则不会计算第二个表达式。
- 对于 `or`：如果第一个表达式为 `True`，则不会计算第二个表达式。

```python
def test():
    print("函数被调用!")
    return True

False and test()  # 不会调用test()（短路）
True or test()    # 不会调用test()（短路）

# 如果输入空字符串，name 将设为 "匿名用户"
name = input("姓名: ") or "匿名用户"
```

***

避免用 `==` 与 `True/False/None` 比较：

- python中的一些对象，如空列表、0、空字符串等都被视为假，使用 `== True` 或 `== False` 可能会产生非预期的结果。

  对于布尔值，直接在条件中使用变量（或使用 `not` 取反）即可。

  ```python
  # 示例：空列表的布尔值为False，但：
  
  my_list = []
  
  print(my_list == False) # 输出：False（因为空列表不等于False这个布尔值对象）
  
  print(bool(my_list) == False) # 输出：True，但这样写太啰嗦
  
  print(not my_list) # 输出：True（推荐写法，直接利用假值特性）
  ```

- `None` 是单例对象，应用 `is` 或 `is not` 操作符比较，而不是 `==`。 `is` 比较的是对象的身份（内存地址），而`==` 比较的是值，它会调用对象的 `__eq__` 方法 。此外，自定义类可能重载 `__eq__` 方法，使得 `== None` 的行为与预期不符。

  ```python
  if value == None: ...  # 不推荐
  
  if value is None: ...  # 推荐
  ```


## 二、if语句

if语句有很多种，选择使用哪种取决于要判断的条件数。

### 2.1 链式比较

链式比较是 Python 中一种优雅的语法特性，允许将多个比较操作符连接在单个表达式中。

**链式比较的格式为：`a < b < c`，等价于 `(a < b) and (b < c)`。**

```python
age = 25
print(18 <= age < 65)  # True（年龄在18到65之间，含18不含65
```

特性

- 可以混合使用不同的比较运算符

  ```python
  # 复杂链式比较
  a, b, c = 10, 20, 15
  print(a < b > c)      # True（10 < 20 且 20 > 15）
  print(5 <= c <= 20)   # True（5 ≤ 15 ≤ 20）
  ```

- 可以连接任意数量的比较

  ```python
  # 四元链式比较
  x = 7
  print(1 < 2 < x < 10)  # True（1<2<7<10）
  
  # 五元链式比较
  print(0 < 1 <= 1 < 2 < 3)  # True
  ```

- 可以比较不同类型的对象

  ```python
  from decimal import Decimal
  
  print(0.5 < 1 < 2.0 < Decimal('3'))  # True
  print('a' < 'b' < 'c')                # True（字符串比较）
  ```

  

{% note warning %}

一些注意点：

- 链式比较比布尔运算符优先级高

  ```python
  print(1 < 2 < 3 or 4 > 5)  # 等价于 (1<2<3) or (4>5) → True or False → True
  ```

- 链式比较表示的是连续关系，不连续的关系不能直接链式

  ```python
  # 正确：连续关系
  a, b, c = 1, 3, 2
  print(a < b > c)  # True (1<3 且 3>2)
  
  # 错误：不连续的关系不能直接链式
  # 不能这样写: a < c and b > c
  ```

- 链式比较与传统写法在性能上几乎没有区别，Python 解释器会优化为相同字节码

{% endnote %}

### 2.2 简单的if语句

基本的if语句和if-else语句的使用如下：（**注意格式**）

```python
age = 17
if age >= 18 :
    print("You are old enough to vote!")
else:
    print("Soory,you are too young to vote.")
```

### 2.3 三元运算符（条件表达式）

Python 的三元运算符（也称为‌**条件表达式**‌）是一种简洁的单行条件判断语法，格式如下：

```python
value = true-expr if condition  else false-epxr
```

- 若条件为 `True`，返回 `true-expr` 的值；
- 若条件为 `False`，返回 `false-epxr` 的值;
- `true-epxr`和`false-expr`可以是任何python表达式

示例如下，**三元运算符是`if-else`的简写形式，与之具有等价性。**

```python
age = 20
status = "成年" if age >= 18 else "未成年"

#三元运算符是 *一个* 表达式，可以结合列表推导式使用。
nums = [1, -2, 3]
signs = ["正" if x > 0 else "负" for x in nums]  # ['正', '负', '正']
```

注：三元运算符的优先级低于算术和比较运算符，但高于赋值符，复杂表达式要加括号



### 2.4 if-elif-else结构

当要检查超过两个条件时，可以使用`if-elif-else`结构，python只执行if-elif-else结构中的一个代码块，遇到通过了的测试后，就会跳过余下的测试。

```python
#根据年龄确定收费标准
age = 12
if age < 4:
    print("Your admission cost is $0.")
elif age < 18:
    print("Your admission cost is $5.")
else:
    print("Your admission cost is $10.")
```

可以根据需要使用任意数量的`elif`代码块。`if-elif`结构后面可以不加`else`代码块。

如果想执行一个代码块，就使用`if-elif-else`结构；如果要执行多个代码块，就是用一系列独立的if语句

### 2.5 模式匹配

在 Python 中没有 **switch...case** 语句，但在 Python3.10 版本添加了 **match...case**

语法格式如下：

```python
match subject:
    case <pattern_1>:
        <action_1>
    case <pattern_2>:
        <action_2>
    case <pattern_3>:
        <action_3>
    case _:
        <action_wildcard>
```

其中**case _:** 类似于 C 和 Java 中的 **default:**

## 三 、循环语句

### 3.1 for循环

用于遍历序列（列表、元组、字符串等）或任何可迭代对象

```python
for <variable> in <sequence>:
    <statements>
else:
    #当循环正常完成（未被 break 中断）时执行
    <statements>
```

关于else的注意点：

- 当循环体从未执行时，else块仍会执行
- 提前return导致函数退出时，else不会被执行
- continue不会影响else执行

示例：

```python
# 1、遍历列表
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)
# 1.1、使用索引变量列表元素
	#当需要复杂索引控制时用，在大多数情况下是最佳选择是enumerate()
n = len(fruits)
for i in range(n):
    process(fruits[i])
# 1.2、每次跳2个元素    
for i in range(0, len(fruits), 2): 
    print(fruits[i])
    
```

**使用`range()`函数确定循环范围**

使用该函数可以轻松生成一系列数字，range(a,b)确定的范围是**左闭右开**的，如range(3,10)，指3~9

```python
# 基本范围
for i in range(5):        # 0-4
    print(i)

# 指定范围
for i in range(3, 8):     # 3-7
    print(i)

# 指定步长
for i in range(0, 10, 2): # 0,2,4,6,8
    print(i)

# 反向迭代
for i in range(10, 0, -1): # 10到1
    print(i)
```

### 3.2 while循环

当给定条件为真时重复执行代码块

```python
while <expr>:
    <statement(s)>
else:
    #当条件变为假（未被 break 中断）时执行
    <additional_statement(s)> 
    
```

示例：

```python
# 基本计数器
count = 0
while count < 5:
    print(f"Count: {count}")
    count += 1

# 用户输入验证
password = ""
while password != "secret":
    password = input("Enter password: ")
print("Access granted!")
```



### 3.3 循环控制语句

1. `break` - 立即退出循环
2. `continue` - 跳过当前迭代
3. `else` - 循环正常结束执行

### 3.4、异步循环

## 四、列表

列表（list）由一系列按特定顺序排列的元素组成。在Python中，用方括号` []`来表示列表，并用逗号来分隔其中的元素。  

```python
bicycles = ['trek', 'cannondale', 'redline', 'specialized']
#打印整个列表，结果包含方括号
print(bicycles)

------------------------------------------------------------
['trek', 'cannondale', 'redline', 'specialized']
```

### 2.1 创建列表

- 直接赋值创建，用方括号 `[]` 包裹元素，逗号分隔

  ```python
  bicycles = ['trek', 'cannondale', 'redline', 'specialized']
  ```

- 使用`list()`构造函数将其他可迭代对象（如字符串、元组、字典键等）转化为列表

  ```python
  tuple_to_list = list((1, 2, 3))      # 元组转列表 → [1, 2, 3]
  str_to_list = list("Python")         # 字符串转列表 → ['P', 'y', 't', 'h', 'o', 'n']
  dict_keys = list({"a": 1, "b": 2})   # 字典键转列表 → ['a', 'b']
  ```

- 特殊初始化

  ```python
  #创建空列表
  empty_list = []
  empty_list = list()
  
  #创建重复元素列表
  zeros = [0] * 5   #[0, 0, 0, 0, 0]
  ```

- 使用**列表推导式**。(见下)

  ```python
  #1、将0-9的平方保存到列表：[0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
  squares = [x**2 for x in range(10)]
  print(squares)  #输出 [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
  
  #2、将0-9范围内偶数的平方保存到列表
  even_squares = [x**2 for x in range(10) if x % 2 == 0]
  print(even_squares) #输出 [0, 4, 16, 36, 64]
  
  #3、多循环嵌套
  coordinates = [(x,y) for x in range(3) for y in range(3)]
  print(coordinates)  #输出 [(0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (1, 2), (2, 0), (2, 1), (2, 2)]
  
  #4、结合条件表达式（三元运算符）
  # 将负数替换为0
  numbers = [-2, 5, 0, -8, 3]
  processed = [x if x >= 0 else 0 for x in numbers]
  print(processed) # 输出: [0, 5, 0, 0, 3]
  ```

补充：生成器表达式 VS 列表推导式

生成器表达式与列表推导式在语法上非常相似，但关键区别在于生成器表达式使用圆括号`()`，并且它是**惰性求值**的，即按需生成元素，而不是一次性生成整个列表。

当需要完整数据集时用推导式，当处理大数据或需要惰性计算时用生成器表达式。

```python
# 列表推导式 - 立即创建完整列表
squares_list = [x**2 for x in range(5)]  # [0, 1, 4, 9, 16]

# 生成器表达式 - 创建生成器对象
squares_gen = (x**2 for x in range(5))
squares_list = list(squares_gen)  # [0, 1, 4, 9, 16] (首次使用)
squares_list = list(squares_gen)  #[] (已耗尽)
```



### 2.2 访问列表元素

1、列表是有序集合，使用**索引**访问指定位置的元素（与数组一样）

列表支持从后往前访问，通过将索引指定为**-1**，可让Python**返回最后一个列表元素**。方便在不知道列表长度的情况下访问最后的元素，这种约定**也适用于其他负数索引**，例如，索引-2返回倒数第二个列表元素，索引-3返回倒数第三个列表元素，以此类推。  

***

2、使用**迭代器**访问

使用`iter()`方法获取列表的迭代器，使用for循环对迭代器对象进行遍历。

迭代器只能顺序访问，不能像索引那样随机访问，因为它并不存储所有元素。

```python
numbers = [-2, 5, 0, -8, 3]
iterator = iter(numbers)
for num in iterator:
    print(num)
```

### 2.3 操作列表元素

#### 修改列表元素

修改列表元素的语法与访问列表元素的语法类似。**要修改列表元素，可指定列表名和要修改的元素的索引，再指定该元素的新值。**  



#### 添加元素

1. 在列表**末尾**添加元素  

   使用**append()**函数，将元素附加到列表末尾。

   ```python
   motorcycles = ['honda', 'yamaha', 'suzuki']
   print(motorcycles)
   motorcycles.append('ducati')
   print(motorcycles)
   
   
   ----------------------------------------------
   ['honda', 'yamaha', 'suzuki']
   ['honda', 'yamaha', 'suzuki', 'ducati']
   ```

   

2. 在列表**中**插入元素

   使用方法**insert(索引，值)**可在列表的任何位置添加新元素。

   ```python
   motorcycles = ['honda', 'yamaha', 'suzuki']
   motorcycles.insert(0, 'ducati')
   print(motorcycles)
   
   ----------------------------------------------------
   ['ducati', 'honda', 'yamaha', 'suzuki']	
   ```




#### 删除元素

1. 根据索引删除元素 

   如果知道要删除的元素在列表中的**位置**，可使用del语句。  

   ```python
   motorcycles = ['honda', 'yamaha', 'suzuki']
   print(motorcycles)
   
   del motorcycles[0]
   
   print(motorcycles)
   ```

   

2. 使用方法**pop()**删除元素  

   方法pop()可删除列表**末尾**的元素，并返回末尾元素。

   ```python
   motorcycles = ['honda', 'yamaha', 'suzuki']
   print(motorcycles)
   popped_motorcycle = motorcycles.pop()
   print(motorcycles)
   print(popped_motorcycle)
   ```

   pop(索引)来删除列表中**任何位置**的元素，并返回该元素。

   ```python
   motorcycles = ['honda', 'yamaha', 'suzuki']
   first_owned = motorcycles.pop(0)
   print('The first motorcycle I owned was a ' + first_owned.title() + '.')
   ```

   

   如果你要从列表中删除一个元素，并且不再以任何方式使用它，就是要del 语句；

   如果你要在删除后还能继续使用它，就使用pop().



3. 按值删除元素 **remove(值)**

   ```python
   motorcycles = ['honda', 'yamaha', 'suzuki', 'ducati']
   print(motorcycles)
   
   motorcycles.remove('ducati')
   
   print(motorcycles)
   -------------------------------------------------------
   ['honda', 'yamaha', 'suzuki', 'ducati']
   ['honda', 'yamaha', 'suzuki']
   ```

   方法remove()只删除 **第一个** 指定的值。如果要删除的值可能在列表中出现多次，就需要使用循环来判断是否删除了所有这样的值。  

#### 检查元素是否存在

使用`in`关键字检查元素在列表中是否存在（返回布尔值）‌

```python
my_list = ['a', 'b', 'c']
print('c' in my_list)  # 输出True
```



#### 返回元素的下标

`index()`方法返回元素**首次**出现的索引，若不存在会抛出`ValueError`‌

```python
my_list = ['a', 'b', 'c']
print(my_list.index('b'))  # 输出1
```

#### 统计元素出现个数

`count()`方法统计元素出现次数‌

```python
print(['a', 'b', 'a'].count('a'))  # 输出2
```

#### 最大/最小值

`max(list)`和`min(list)` 返回列表元素最大/小值

### 2.4 组织列表

#### 使用sort()对列表 永久排序

Python方法sort()让你能够较为轻松地对列表进行排序。假设你有一个汽车列表，并要让其中的汽车**按字母顺序排列**。  

```python
cars = ['bmw', 'audi', 'toyota', 'subaru']

cars.sort()

print(cars)
-----------------------------------------------------
['audi', 'bmw', 'subaru', 'toyota']
```

还可以按**与字母顺序相反**的顺序排列列表元素，为此，只需向sort()方法传递参数**reverse=True**。  

```python
cars = ['bmw', 'audi', 'toyota', 'subaru']

cars.sort(reverse=True)

print(cars)
----------------------------
['toyota', 'subaru', 'bmw', 'audi']
```

#### 使用函数 sorted()对列表进行 临时排序

函数**sorted(list)**产生一个原序列排序后的拷贝。

```python
cars = ['bmw', 'audi', 'toyota', 'subaru']

print(sorted(cars))

print(cars)

cars.sort(reverse=True)
print(cars)

print(sorted(cars,reverse=True))

------------------------------------------------------
['audi', 'bmw', 'subaru', 'toyota']
['bmw', 'audi', 'toyota', 'subaru']

['toyota', 'subaru', 'bmw', 'audi']
['toyota', 'subaru', 'bmw', 'audi']
```

#### 列表逆序

要反转列表元素的排列顺序，可使用方法**reverse()**。  

方法reverse()**永久性**地修改列表元素的排列顺序，再次调用reverse()可恢复到原来的排列顺序.

```python
cars = ['bmw', 'audi', 'toyota', 'subaru']
print(cars)
cars.reverse()
print(cars)


----------------------------------------
['bmw', 'audi', 'toyota', 'subaru']
['subaru', 'toyota', 'audi', 'bmw']
```

#### 列表的长度

使用函数**len(list)**可快速获取列表的长度。

```python
cars = ['bmw', 'audi', 'toyota', 'subaru']
cars_length = len(cars)
print(car_length)

------------------------------------------------
4
```

#### 追加序列

extend() 函数用于在列表末尾一次性追加另一个序列中的多个值。追加的可以是列表、元组、集合、字典，若为字典,则仅会将键(key)作为元素依次添加至原列表的末尾。

它比使用`+`连接列表更为高效

```python
cars = ['bmw', 'audi', 'toyota', 'subaru']
website = ['google','baidu']

cars.extend(website)  
print(cars) #['bmw', 'audi', 'toyota', 'subaru', 'google', 'baidu']
```

#### 复制列表

`copy() `函数用于复制列表，类似于` a[:]`。它们会生成一个与原列表元素相同的**新**列表。

```python
cars = ['bmw', 'audi', 'toyota', 'subaru']
new_cars = cars.copy()
#等价于
new_cars = cars[:]  #此刻它们指向两个不同的列表，只是内容相同
#对比
new_cars = cars     #此时两个指向同一个列表
```



### 2.5、切片

列表的部分元素，称为切片。类似于截取字符串。

如果要遍历的部分元素，可在for循环中使用切片。

- 要创建切片，可指定要使用的第一个元素和最后一个元素的索引（左闭右开），与range()函数一样。

  ```python
  players = ['charles', 'martina', 'michael', 'florence', 'eli']
  slices = player[1:3]
  print(slices) #['martina', 'michael']
  ```

- 如果没有指定起始索引，默认从列表头开始。

  如果没有指定终止索引，默认终止与列表末尾

  ```python
  print(players[:3])  #['charles', 'martina', 'michael']
  print(players[2:])  #['michael', 'florence', 'eli']
  ```

- 若省略起始和终止索引，如`player[:]`，返回包含整个列表的切片。

- 负数索引返回离列表末尾相应距离的元素，使用负数索引可以输出列表末尾的任意切片

  ```python
  #输出名单上的最后三名队员
  print(players[-3:])  #['michael', 'florence', 'eli']
  ```

- 可在表示切片的方括号内设置第三个值（步进值），告诉python在指定范围内每隔多少元素提取一个

  当要对列表或元组进行翻转时，可以将步进值设置为-1
  
  ```python
  #从下标1到末尾每隔2个元素选取一个
print(players[1::2])  #['martina', 'florence']
  
  #返回列表的逆序
  seq = [7,1,5,3,6,8]
  seq[::-1] #[8, 6, 3, 5, 1, 7]
  ```
  
  





## 五、元组

列表是可以修改的，非常适合用于存储程序运行期间可能变化的数据集。

有时候需要创建一系列不可修改的元素，元组可以满足这种要求。python将不能修改的值称为不可变的，而**不可变的列表被称为元组(tuple)**。

元组使用小括号 **( )**，列表使用方括号 **[ ]**。严格来说，元组使用**逗号**标识的，圆括号只是让元组看起来更整洁。如果要定义只包含一个元素的元组，必须在这个元素后面加上逗号。

可以使用下标索引访问元组中的值

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250717232608754-2025-7-1723:26:24.png" style="zoom:80%;" />

### 5.1 创建元组

1、使用圆括号 () 创建

```python
# 空元组
empty_tuple = ()

# 单元素元组（注意必须有逗号）
single_element = (42,)  # (42)

# 多元素元组
colors = ('red', 'green', 'blue')
coordinates = (10.5, -20.3)

# 嵌套元组
points = ((1, 2), (3, 4), (5, 6))
employee = ('John Doe', ('IT', 'Developer'), 75000)
```

2、使用逗号创建（隐式元组）

逗号分隔会自动创建元组

```python
mixed_data = 42,"avc", True
print(mixed_data)  #(42, 'avc', True)

single = 'hello',
print(single)  #('hello',)
```

3、使用 `tuple()` 构造函数

tuple()构造函数将任意序列（如字符串、列表、字典键等）和迭代器转化为元组

```python
list_to_tuple = tuple([1, 2, 3])      # 列表转元组 → (1, 2, 3)
str_to_tuple = tuple("Python")         # 字符串转元组 → ('P', 'y', 't', 'h', 'o', 'n')
dict_keys = tuple({"a": 1, "b": 2})   # 字典键转元组 → ('a', 'b')
empty_tuple = tuple()     #创建空元组
```

4、使用生成器创建（没有元组推导式）

```python
exp = (x**2 for x in range(10) if x % 2 == 0)
evens_tuple = tuple(exp)
print(evens_tuple)  #(0, 4, 16, 36, 64)
```

5、解包创建

```python
# 变量解包
x, y, z = 10, 20, 30
point = (x, y, z)  # (10, 20, 30)

# 星号解包
values = [1, 2, 3]
combined = (*values, 4, 5)  # (1, 2, 3, 4, 5)
```

### 5.2 操作元组

元组一旦创建，各个位置上的对象是无法被修改的（重写赋值）。

如果元组中的一个对象是可变的（如列表），可以在内部进行修改。

```python
tup = tuple(['foo',[1, 2], False])
tup[1].append(3)
print(tup)  # (['foo',[1, 2, 3], False])
```

元组之间可以使用 **+**、**+=**和 ***** 号进行运算。这就意味着他们可以组合和复制，运算后会生成一个新的元组。

```python
tup1 = (12, 34.56)
tup2 = ('abc', 'xyz')
 
# 创建一个新的元组，包含它们的中的所有元素
tup3 = tup1 + tup2
print (tup3)   # (12, 34.56, 'abc', 'xyz')

# tup2指向了一个新元组
tup2 += tup1
print(tup2)   # (12, 34.56, 'abc', 'xyz')

#复制
tup5 = ('Hi!',) * 4
print(tup5)   # ('Hi!', 'Hi!', 'Hi!', 'Hi!')
```

元组中的元素值是不允许删除的，但可以使用del语句来删除整个元组

```python
tup = ('Google', 'Runoob', 1997, 2000)
del tup
```

元组也是一个序列，可以截取其中中的一段元素，与列表中的切片完全相同

```python
tup = ('Google', 'Runoob', 'Taobao', 'Wiki', 'Weibo','Weixin')
print(tup[:])  #返回整个元组
print(tup[1:]) 
print(tup[:2])
print(tup[-3:])
```

***

元组解包：当想要将元组型的表达式赋值给变量，python会对等号右边的值进行拆包。

```python
tup=(4, 5, 6)
a, b, c = tup   #解包：a = 4 , b = 5, c = 6

#嵌套元组也可以进行解包
tup_1 = ((7, 8), 9)
(d, e), f = tup_1   # d = 7, e = 8, f = 9
```

使用这个功能，可以轻松地交换变量值。

```python
#其他语言中地代码可能如下
temp = a
a = b
b = temp

#在python中交换操作可以如下完成
a, b = 1, 2   # a = 1, b = 2
b, a = a, b   # b = 2, a = 1
```

拆包的一个常用场景就是遍历元组或列表组成的序列

```python
seq = [(1, 2, 3), (4, 5, 6), (7, 8, 9)]
for a, b, c in seq:
    print(f"a = {a}, b = {b}, c = {c}")
```

另一个常用场景是从函数返回多个值。

## 六、字典

在Python中，字典是一系列键—值对，键和值都是Python对象。

```python
d = {key1 : value1, key2 : value2, key3 : value3 }
```

每个键都与一个值相关联，键与值之间用`:`分隔，每对键值之间用`,`分隔，整个字典包括在花括号`{}`中。

字典中键必须是**唯一**的，但值则不必。键必须是**不可变**的，如标量类型（整数、浮点数、字符串）或元组（且元组内对象也必须是不可变对象）。通过`hash`函数可以检查一个对象是否可以哈希化，即是否可以作为字典的键。

python中的任何对象都可以作为字典中的值，既可以是标准的对象，也可以是用户定义的。



### 6.1 创建字典

1、使用花括号直接创建

```python
# 空字典
empty_dict = {}

# 带初始键值对
#嵌套列表
person = {
    "name": "Alice",
    "age": 30,
    "city": "New York",
    "hobby": ['swimming', 'fishing']
}

# 嵌套字典
company = {
    "name": "TechCorp",
    "employees": {
        "CEO": "John Smith",
        "CTO": "Jane Doe"
    }
}
```

***

2、使用`dict()` 构造函数

```python
# 创建空字典
d1 = dict()

# 关键字参数创建
d2 = dict(name="Bob", age=25, city="London")

# 元组列表创建
d3 = dict([("name", "Charlie"), ("age", 40), ("city", "Paris")])

# 键值对列表创建
d4 = dict([["id", 1001], ["status", "active"]])
```

***

3、字典推导式

见下文

### 6.2 访问字典中的值

要获取与键相关联的值，可依次指定字典名和放在方括号内的键。这种方式下，若指定的键不存在，会报KeyError的错误。

```python
alien_0 = {'color': 'red', 'points': 5}
print(alien_0['color'])  # red
print(alien_0['speed'])  # KeyError: 'speed'
```

使用`get()`方法可以在指定的键不存在时返回一个默认值。第一个参数是对应的键，第二个参数是返回的默认值。当第二个参数缺省且指定键不存在时，返回`None`

```python
alien_0 = {'color': 'red', 'points': 5}
print(alien_0.get('speed',"No speed value assigned"))  #No speed value assigned
```

判断**键**是否存在于字典中

```python
key in dict
key not in dict
```



### 6.3 修改字典

字典是一种动态结构，可随时在其中添加键值对。

```python
alien_0 = {'color': 'red', 'points': 5}
#向已有的字典中添加键值对 speed:slow
alien_0['speed'] = 'slow'   #{'color': 'red', 'points': 5, 'speed': 'slow'}
```

修改字典中值的方法与添加类似，指定键名和新值就会覆盖对应键的旧值

```python
alien_0['speed'] = 'fast'  ##{'color': 'red', 'points': 5, 'speed': 'fast'}
```

使用`del dic[key]`语句可以将不再需要的键值删除。若不指定键`del dic`，会删除整个字典。

` pop() `方法删除字典 key所对应的值，并返回被删除的值。如果键不存在，则可以选择返回一个默认值

使用`clear()`方法可以清空字典

```python
del alien_0['speed']  # 删除键`speed`
val = alien_0.pop('speed','不存在的 key')  #删除并返回speed对应的值，不存在时返回`不存在的 key`
alien_0.clear()  # 清空字典
del alien_0   #删除字典  
```

使用`update`方法将两个字典合并，如果传给update方法的数据中也含有相同的键，则它的值会被其覆盖

```python
dic = {'a':'some value', 'b': [1, 2, 3, 4], 7:'an integer'}
dic.update({'b':'foo', 'c':12})
print(dic)  #{'a': 'some value', 'b': 'foo', 7: 'an integer', 'c': 12}
```



### 6.4 遍历字典

字典有多种遍历方式，可遍历字典的所有键值对，也可仅遍历键或值。

- `items()`：返回一个键值对列表
- `keys()`：返回字典键的迭代器，其中包含字典中的所有键
- `values()`：返回字典值的迭代器

遍历键值对时，可声明两个变量，用于存储键值对中的键和值

```python
for k, v in alien_0.items()
```

遍历键。遍历字典时，会默认遍历所有的键，因此下面两个写法等价。从python3.7起，字典元素的排列顺序与定义时相同，因此遍历时会按插入的顺序返回其中的元素，要想按照特定顺序遍历，可以操作key列表来实现。

```python
for k in alien_0.keys()
for k in alien_0

# 按字母顺序遍历键列表
for k in sorted(alien_0.keys())
```

遍历值。`values()`方法会提取字典中所有的值，而没有考虑是否有重复。为剔除重复项，可将值列表转化为集合存储。

```python
for v in alien_0.values()  #列表中值可能会有重复
for v in set(alien_0.values())  #使用集合的构造函数将其转化为集合，剔除重复项
```

### 6.5、其他字典操作

[参考文档](https://docs.python.org/zh-cn/3/library/stdtypes.html#mapping-types-dict)

## 七、集合

集合（set）是一个**无序**的**不重复**元素序列，可以进行去重以及交集、并集、差集等常见的集合操作。集合用大括号 **{ }** 表示，元素之间用逗号 **,** 分隔。

作为一种无序的多项集，集合并不记录元素位置或插入顺序。 相应地，**集合不支持索引、切片或其他序列类的操作。**

```python
{v1,v2,...}
```

[API文档](https://docs.python.org/zh-cn/3.13/library/stdtypes.html#set-types-set-frozenset)

### 7.1、创建集合

1、可以使用大括号 **{ }** 创建集合，元素之间用逗号 **,** 分隔

```python
set1 = {1, 2, 3, 4}            # 直接使用大括号创建集合
```

***

2、使用`set()`构造函数创建，将其他可迭代对象转化为集合。从字典创建时，会将字典的**键**放到新集合中。

注：创建空集合只能使用`set()`，`{}`创建的是空字典

```python
set2 = set([4, 5, 6, 7])  #从列表创建集合
empty_set = set()  #创建空集合
```

***

3、使用集合推导式

```python
#将不属于 'abc'的字符放入集合中
str = 'asijibdocoes'
char_set = {x for x in str if x not in 'abc'}  #{'o', 'd', 's', 'e', 'j', 'i'}
```



### 7.2、操作集合

**添加元素**

使用`add(x)`方法将元素添加到集合中，如果元素已存在，则不进行任何操作。

```python
fruits_set = {'apple', 'banana','orange'}
fruits_set.add('grape')  #{'banana', 'apple', 'orange', 'grape'}
```

`update(x)`方法也可以添加元素，参数可以是列表，元组，字典等，多个参数用逗号隔开

```python
fruits_set.update((1, 2),['xyz','mnl'])
```

***

**移除元素**

`remove(x)`方法将元素 x 从集合中移除，如果元素不存在，则会发生错误。

`discard(x)`方法也是移除集合中的元素，且如果元素不存在，不会发生错误。

`pop()`方法可随机删除集合中的一个元素。pop 方法会对集合进行无序的排列，然后将这个无序排列集合的左面第一个元素进行删除。

```python
fruits_set = {'apple', 'banana','orange'}
fruits_set.remove('apple') #{'orange', 'banana'}
fruits_set.discard('grape') #{'orange', 'banana'}
fruits_set.pop() #{'banana'}
```

***

其他常用操作

|   方法    |           描述           |
| :-------: | :----------------------: |
|   len()   |     统计集合元素个数     |
|  clear()  |         清空集合         |
| in/not in | 判断元素在集合中是否存在 |
|  copy()   |         拷贝集合         |

### 7.3、集合运算

**并集**

`a.union(b) `方法返回两个或多个集合的并集，即包含了所有集合的元素，重复的元素只会出现一次。等价于`a|b`。

```python
x = {"a", "b", "c"}
y = {"f", "d", "a"}
z = x.union(y)  #{'a', 'b', 'c', 'f', 'd'}
#等价于
w = x | y
```

`a.update(b)`，将a的内容设置为a和b的并集，等价于`a |= b`.

**交集**

`a.intersection(b) `方法用于返回两个或更多集合中都包含的元素，即交集，等价于`a & b`

`a.intersection_update(b)`方法将a的内容设置为a和b的交集，等价于`a &= b`

```python
x = {"a", "b", "c", ''}
y = {"f", "d", "a"}
z = x.intersection(y)  # z = {'a'}
#等价于
w = x & y              # w = {'a}
#x中保存了交集
x.intersection_update(y)   # x = {'a'}
```

***

**差集**

`a.difference(b)` 方法用于返回集合的差集，即返回的集合元素包含a中，但不包含在b中。等价于`a - b`

`a.difference_update(b)` 方法将a的值设置为在a但不在b中的元素，等价于`a -= b`

```python
x = {"a", "b", "c"}
y = {"f", "d", "a"}

z = x.difference(y)  #{'b', 'c'}
#等价于
w = x - y            # {'b', 'c'}
# x 中保存差集
x.difference_update(y)    # x = {'c', 'b'}
```

***

**对称差（集合的异或运算）**

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250719174943433-2025-7-1917:49:56.png" style="zoom:80%;" />

`a.symmetric_difference(b) `：返回两个集合的对称差，等价于`a ^ b`

`a.symmetric_difference_update(b) `：将a的值设置为两个集合的对称差，等价于`a ^= b`

```python
x = {"a", "b", "c"}
y = {"f", "d", "a"}

z = x.symmetric_difference(y)  #{'c', 'b', 'f', 'd'}
#等价于
w = x ^ y           #{'c', 'b', 'f', 'd'}
# x中保存对称差
x.symmetric_difference_update(y)    # x = {'c', 'b', 'f', 'd'}
```



***

**子集**

- `x.isdisjoint(y) `：判断两个集合是否包含相同的元素

- `x.issuperset(y)`：判断当前集合x**是否包含**参数集合y (x ⊇ y)，即参数集合是否是当前集合的子集，等价于`x >= y`

- `x.issubset(y)`： 判断当前集合**是否被包含于**参数集合 (x ⊆ y)，即当前集合是否是参数集合的子集，等价于`x <= y`

  注：当x和y包含元素相同时，以上两方法都返回`True`

## 八、高级语法

### 8.1、推导式

Python 推导式是一种独特的数据处理方式，可以从一个数据序列构建另一个新的数据序列的结构体，适用于生成列表、字典、集合和生成器。

Python 支持各种数据结构的推导式：

- 列表(list)推导式
- 字典(dict)推导式
- 集合(set)推导式

{% note warning%}

Python没有元组推导式，圆括号对应的是生成器表达式

{% endnote%}

***

**列表推导式**

通过表达式动态生成列表，适合创建有规律的序列

列表推导式是一种简洁高效的创建列表的语法结构，它可以用单行代码替代传统的`for`循环。

```python
#基础语法
[expression for item in iterable if condition]

#expression：对当前元素的处理表达式
#item：迭代变量
#iterable：可迭代对象（如列表、元组、字符串等）
#if condition：可选的条件过滤

#例：将0-9范围内偶数的平方保存到列表
even_squares = [x**2 for x in range(10) if x % 2 == 0]
print(even_squares) #输出 [0, 4, 16, 36, 64]
```

***

**字典推导式**

字典推导式借鉴了列表推导式的语法，但用于生成键值对集合，基本格式：

```python
{key_exp: value_exp for item in iterable if condition}

# key_exp: value_exp  键和值的处理表达式
#item：迭代变量
#iterable：可迭代对象（如列表、元组、字符串等）
#if condition：可选的条件过滤
```

示例

```python
#1、简单转化
#数字到平方的映射
squares = {x:x**2 for x in range(1,5)}   #{1: 1, 2: 4, 3: 9, 4: 16}
#字符串长度映射
words = ["apple", "banana", "cherry"]
len_map = {word: len(word) for word in words}  #{'apple': 5, 'banana': 6, 'cherry': 6}

#2、键值转换
data = {'x': 10, 'y': 20, 'z': 30}
transformed = {f"key_{k}": v**2 for k, v in data.items()}  #{'key_x': 100, 'key_y': 400, 'key_z': 900}

#3、条件过滤
#过滤奇数键
numbers = {1:'one', 2:'two', 3:'three', 4:'four'}
even_only = {k: v for k, v in numbers.items() if k % 2 == 0 } #{2: 'two', 4: 'four'}

#4、多循环嵌套
# 笛卡尔积
colors = ['red', 'green']
sizes = ['S', 'M', 'L']
products = {f"{color}_{size}":(color, size)
            for color in colors for size in sizes} # {'red_S':('red','S'), 'red_M':('red','M'), ...}

#5、处理多个可迭代对象
#使用zip组合
keys = ['a', 'b', 'c']
values = [1, 2, 3]
dic = {k: v for k, v in zip(keys, values)}  #{'a': 1, 'b': 2, 'c': 3}
#使用enumerate
names = ['Alice', 'Bob', 'Charlie']
index_map = {index: name.upper() for index, name in enumerate(names, start= 1)}
#{1: 'ALICE', 2: 'BOB', 3: 'CHARLIE'}

#6、使用条件表达式（三元表达式）
temperatures = {'Mon':22, 'Tue':25, 'Wed':18, 'Thu':30}
status = {day: "Hot" if temp > 24 else "Normal" for day, temp in temperatures.items()}
#{'Mon': 'Normal', 'Tue': 'Hot', 'Wed': 'Normal', 'Thu': 'Hot'}
```

***

**集合推导式**

与列表推导式相同，只是用`{}`表示，格式如下：

```python
#格式
{expression for item in iterable if condition}
```



### 8.2、迭代器

迭代器（Iterator）是遍历数据集合的关键工具，允许我们以有序的方式访问集合的元素，而无需一次性加载整个集合。

迭代器是实现了**迭代器协议**的对象，该协议包含两个核心方法：

- `__iter__()`：返回迭代器自身（必须实现）
- `__next__()`：返回下一个元素，无元素时抛出 `StopIteration` 异常（必须实现）

任何实现了这两个方法的对象都可以称为迭代器。

特性：

- **惰性计算**：按需生成元素，不预加载所有数据
- **状态保持**：记住当前迭代位置
- **单向遍历**：只能前进不能后退
- **一次性使用**：遍历结束后需重新创建
- **内存高效**：不需要预加载所有数据

迭代器工作原理：

1. 调用可迭代对象的 `__iter__()` 获取迭代器‌。
2. 重复调用迭代器的 `__next__()` 获取元素。
3. 捕获 `StopIteration` 终止循环。

***

#### 创建迭代器

1、内置函数转换

迭代器有两个基本的方法：**iter()** 和 **next()**

使用`iter()`函数来获取**支持迭代的集合对象**的迭代器，然后用`next()`函数来获取下一个值。同时，迭代器对象可以使用常规for语句进行遍历。支持迭代的集合对象包括：列表、元组、集合、字典和字符串。

```python
numbers = [-2, 5, 0, -8, 3]
iterator = iter(numbers)
print(next(iterator))
print('-------')
for num in iterator:
    print(num)

#输出
-2
-------
5
0
-8
3
```



2、自定义迭代器类

自定义迭代器的实现，把一个类作为一个迭代器使用需要在类中实现两个方法 `__iter __()` 与 `__next__()` 。

StopIteration 异常用于标识迭代的完成，防止出现无限循环的情况，在 `__next__() `方法中可以设置在完成指定循环次数后触发 StopIteration 异常来结束迭代。

```python
class SquareIterator:
    def __init__(self, max_val): #构造函数，指定迭代的最大次数
        self.current = 0
        self.max = max_val

    def __iter__(self):  # 返回迭代器自身
        return  self

    def __next__(self):  # 返回下一个元素，当current大于最大次数时结束迭代
        if self.current > self.max:
            raise StopIteration
        result = self.current ** 2
        self.current += 1
        return  result

#使用迭代器返回0~5的平方
squares = SquareIterator(5)
for i in squares:
    print(i) # 0, 1, 4, 9, 16, 25
```



3、生成器函数

​	

#### 内置迭代器



**1、枚举迭代：`enumerate()`**

在迭代时同时获取索引和元素

```python
fruits = ["apple", "banana", "cherry"]
for index, fruit in enumerate(fruits):
    print(f"#{index}: {fruit}")
#0: apple
#1: banana
#2: cherry

# 自定义起始索引
for index, fruit in enumerate(fruits, start=3):
    print(f"#{index}: {fruit}")
#3: apple
#4: banana
#5: cherry
```

***

**2、并行迭代：`zip()`**

`zip()` 函数用于将**多个**可迭代对象（如列表、元组、字符串等）中的元素‌**按顺序配对组合**‌，返回一个迭代器,可通过 `list()`、`tuple()` 或循环转换为具体数据结构。

`zip()` **同时遍历所有输入的可迭代对象，每次从每个对象中取一个元素，组合成一个<u>元组</u>。**

```python
names = ["Alice", "Bob", "Charlie"]
ages = [25, 30, 28]
cities = ["New York", "London", "Paris"]

zipped = zip(names, ages)
print(list(zipped))  
#输出 [('Alice', 25, 'New York'), ('Bob', 30, 'London'), ('Charlie', 28, 'Paris')]
```

默认以‌**最短**‌的可迭代对象长度为准，多余元素被忽略。在Python 3.10+中，使用 `strict=True`参数，长度不一致会抛出 `ValueError`。

```python
a = [1, 2, 3]
b = ["x", "y"]
print(list(zip(a, b)))          # 输出: [(1, 'x'), (2, 'y')] （截断）
print(list(zip(a, b, strict=True)))  # 抛出 ValueError
```

需要处理不等长列表时，可以使用 `itertools.zip_longest()`，使用`fillvalue`参数指定填充值

```python
from itertools import zip_longest

names = ["A", "B", "C", "D"]
numbers = [1, 2, 3]

# 用 None 填充缺失值
result = list(zip_longest(names, numbers))
print(result)  # [('A', 1), ('B', 2), ('C', 3), ('D', None)]

# 自定义填充值
result = list(zip_longest(names, numbers, fillvalue="N/A"))
print(result)  # [('A', 1), ('B', 2), ('C', 3), ('D', 'N/A')]
```

可以使用 `*` 运算符逆向解压：

```python
zipped = [(1, 'a'), (2, 'b')]
print(*zipped)  # (1, 'a') (2, 'b')

#应用：矩阵转置，先解压再zip
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
transported = list(zip(*matrix))
print(transported)  # [(1, 4, 7), (2, 5, 8), (3, 6, 9)]
```

***

**3、反向迭代：`reversed()`**

返回一个反向的迭代器

***

4、`map(function, iterable)`

对可迭代对象的每个元素应用函数，返回迭代器对象

```python
str_nums = ['1', '2', '3']
nums = map(int,str_nums)
print(list(nums)) #[1, 2, 3]

#结合Lambda表达式
squares = map(lambda x: x**2, range(5))
print(list(squares)) #[0, 1, 4, 9, 16]
```

***

5、`filter(function, iterable)`

过滤满足条件的元素，只保留函数返回 True 的元素，返回迭代器对象。

```python
# 过滤偶数
numbers = range(10)
evens = filter(lambda x: x % 2 == 0, numbers)
print(list(evens))  # [0, 2, 4, 6, 8]

# 过滤非空字符串
words = ['hello', '', 'world', None, ' ']
valid = filter(None, words)  # None 过滤False值
print(list(valid))  # ['hello', 'world', ' ']

```

***

补充：`functools.reduce()`：该函数可以对一个可迭代对象中的元素进行累积操作。

```python
from functools import reduce

reduce(function, iterable[, initializer])

# function：接受两个参数的函数
# iterable：可迭代对象（列表、元组、生成器等）
# initializer（可选）：初始累积值
```

它的执行过程可以理解为

```python
def reduce(function, iterable, initializer=None):
    it = iter(iterable)
    if initializer is None:
        value = next(it)
    else:
        value = initializer
        
    for element in it:
        value = function(value, element)
    return value
```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250719224622885-2025-7-1922:46:24.png" style="zoom:80%;" />

### 8.3、生成器

在 Python 中，使用了 **yield** 关键字的函数被称为生成器（generator）。它提供了一种**惰性计算**和**按需生成值**的高效方式。

生成器是一种特殊类型的迭代器，调用一个生成器函数，返回的是一个迭代器对象。

当在生成器函数中使用 **yield** 语句时，函数的执行将会暂停，并将 **yield** 后面的表达式作为当前迭代的值返回。然后，每次调用生成器的 **next()** 方法或使用 **for** 循环进行迭代时，函数会从上次暂停的地方继续执行，直到再次遇到 **yield** 语句。这样，生成器函数可以逐步产生值，而不需要一次性计算并返回所有结果。

生成器函数的优势是它们可以按需生成值，避免一次性生成大量数据并占用大量内存，因此特别适合处理大型或无限数据集。

与迭代器的关系：

\- 所有生成器都是迭代器。

\- 迭代器不一定是生成器（如列表、字典的迭代器）。

\- 生成器提供了一种简洁创建迭代器的方式。

#### 创建生成器

1、使用生成器函数

使用`yield`关键字

```python
def countdown(n):
    while n > 0:
        yield n
        n -= 1
        
#创建生成器对象时，其中的代码并不会执行
generator = countDown(5)

#直到你请求生成器中的元素时，它才会执行它的代码
#通过迭代生成器获取值
print(next(generator)) #输出 5
print(next(generator)) #输出 4

# 使用 for 循环迭代生成器
for value in generator:
    print(value)       #输出 3 2 1
```

以上实例中，**countdown** 函数是一个生成器函数。它使用 yield 语句逐步产生从 n 到 1 的倒数数字。在每次调用 yield 语句时，函数会返回当前的倒数值，并在下一次调用时从上次暂停的地方继续执行。

通过创建生成器对象并使用 next() 函数或 for 循环迭代生成器，可以逐步获取生成器函数产生的值。

2、使用生成器表达式

使用生成器表达式创建生成器更为简单。生成器表达式与列表推导式在语法上非常相似，但关键区别在于生成器表达式使用圆括号`()`，返回一个生成器对象。

```python
#语法结构 
#与列表推导式结构相同，只是用圆括号()替代了方括号[]
gen_expr = (expression for item in iterable if condition)
```

例子：

```python
#创建生成器对象，返回0~19内偶数的平方
generator = (x**2 for x in range(20) if x % 2 == 0)

#等效生成器函数
def squares(n):
    for i in  range(n):
        if i % 2 == 0:
            yield i**2
```

```python
#多 yield 点示例
def traffic_light():
    yield "RED"     # 第一次 next 停在此处
    yield "YELLOW"  # 第二次 next 停在此处
    yield "GREEN"   # 第三次 next 停在此处
    yield "OFF"     # 第四次 next 停在此处

light = traffic_light()
print(next(light))  # RED
print(next(light))  # YELLOW
print(next(light))  # GREEN
print(next(light))  # OFF
print(next(light))  # StopIteration
```

#### 生成器的方法

生成器对象有三个方法：send、throw、close

- `send(value)`：向生成器发送一个值（该值会成为当前 `yield` 表达式的结果）。

  ```python
  #生成器可以接收外部传入的值
  def accumulator():
      total = 0
      while True:
          value = yield total
          if value is None:
              break
          total += value
  acc = accumulator()
  # 启动生成器（必须首先调用）
  next(acc)  				#返回total = 0，但未打印，暂停在value = yield total处
  
  print(acc.send(10))   #yield total接收到10，total变为10，返回total =10，暂停
  print(acc.send(20))   #yield total接收到20，total变为30，返回total =30，暂停
  print(acc.send(30))   #yield total接收到30，total变为30，返回total =60，暂停
  ```

- `throw(type[, value[, traceback]])`：在生成器暂停处抛出一个异常。

  ```python
  def resilient_generator():
      try:
          while True:
              try:
                  value = yield
                  print(f"收到: {value}")
              except ValueError as e:
                  print(f"忽略错误: {e}")
      finally:
          print("清理资源")
  
  gen = resilient_generator()
  next(gen)  # 启动生成器
  
  gen.send("正常数据")  # 输出: "收到: 正常数据"
  gen.throw(ValueError("测试错误"))  # 输出: "忽略错误: 测试错误"
  ```

- `close()`：终止生成器。

  ```python
  def resource_handler():
      try:
          print("打开资源")
          while True:
              data = yield
              print(f"处理: {data}")
      finally:
          print("关闭资源")
  
  handler = resource_handler()
  next(handler)  # 输出: "打开资源"
  handler.send("数据1")  # 输出: "处理: 数据1"
  handler.close()  # 输出: "关闭资源"
  ```

#### 生成器表达式

生成器表达式用于创建生成器对象，这个对象是一个迭代器，可以通过next()函数逐个获取元素，或者用于for循环中。

它采用**惰性计算**（按需生成值），避免一次性加载所有数据到内存，特别适合处理大规模数据流。

核心特性

- **惰性求值**：每次迭代时动态生成值，不预先创建完整列表
- **内存高效**：只存储当前生成值，适合处理无限序列或大数据
- **单次迭代**：生成器只能遍历一次（耗尽后需重新创建）

注意点：

- 生成器表达式只能迭代一次，因为元素是实时生成的，迭代完之后生成器就空了。

- 不能像列表那样进行索引、切片等操作。

基本语法

```python
#语法结构 
#与列表推导式结构相同，只是用圆括号()替代了方括号[]
gen_expr = (expression for item in iterable if condition)

# expression：生成值的表达式
# item：可迭代对象中的元素
# iterable：任何可迭代对象（列表、字符串等）
# condition：可选过滤条件
```

示例

```python
#创建一个生成器，生成0到9的平方：
gen = (x**2 for x in range(10))
print(gen)  # 输出：<generator object <genexpr> at ...>
for num in gen:
    print(num) #正确输出数字
    
#创建一个生成器，生成0到19之间所有3的倍数
gen = (x for x in range(20) if x % 3 == 0)

#生成器表达式可以嵌套，也可以作为函数的参数，当生成器表达式作为函数唯一的参数时，可以省略外层的括号。
sum_of_squares = sum(x*x for x in range(10))   # 计算0到9的平方和
```



典型应用：

1. **处理大型文件**（避免内存溢出）：

   ```python
   # 统计10GB文件中超过100字符的行数
   count = sum(1 for line in open('huge.log') if len(line) > 100)
   ```

2. **链式数据处理**：

   ```python
   # 多层处理管道
   result = (x.upper() for x in (line.strip() for line in sys.stdin) if x)
   ```

3. **无限序列生成**：

   ```python
   import itertools
   squares = (x**2 for x in itertools.count(1))
   ```




### 8.4、正则表达式

## 九、函数

函数是组织好的，可重复使用的，用来实现单一，或相关联功能的代码段。Python提供了许多内建函数，比如print()。但也可以自己创建函数，这被叫做用户自定义函数。

### 9.1 定义函数

函数代码块以 **def** 关键词开头，后接函数标识符名称和圆括号 **()**，圆括号之间用于定义形参。函数名称应采用描述性名称，帮助别人理解这个函数的功能，并且只在其中使用**小写字母和下划线**。

函数内容以冒号 **:** 起始，并且缩进。

函数的第一行语句可以选择性地使用**文档字符串**，用来存放函数说明。

**return [表达式]** 结束函数，选择性地返回一个值给调用方，不带表达式的 return 相当于返回 None。

```python
def max (a,b):
    """返回给定数字中的最大值"""
    if a > b:
        return a
    return b
```

### 9.2 传递参数

函数定义中可能包含多个形参，因此函数调用中也可能包含多个实参。向函数传递实参的方式有很多，比如

- 位置实参，这要求实参顺序与形参的顺序相同

  ```python
  def printme(name, age):
     """打印个人信息"""
     print(f"name:{name}  age:{age}")
   
  # 按顺序传入参数
  printme("tom","17")
  ```

- 关键字实参，其中每个实参都由变量名和值组成。使使用关键字参数允许函数调用时参数的顺序与声明时不一致，因为 Python 解释器能够用参数名匹配参数值。

  ```python
  def printme(name, age):
      """打印个人信息"""
      print(f"name:{name}  age:{age}")
      
  # 关键字实参，传入顺序无关紧要
  printme(age=17,name="tom")
  ```

- 默认参数

  在定义函数时，可以给每个形参指定默认值。调用函数时，如果没有传递参数，则会使用默认参数。

  使用默认值时，必须在形参列表中列出没有默认值的形参，再列出有默认值的实参，这让python依然能够正确解读位置实参。

  ```python
  #性别默认为男
  def printme(name, age, sex = "男"):
      """打印个人信息"""
      print(f"name:{name}  age:{age}  sex:{sex}")
  
  
  # 调用 printme 函数，不加参数会报错
  # printme(age=17,name="tom")
  print("tom", 17)
  ```

- 不定长参数

  有时候，预先不知道需要接收多少个实参，即需要一个函数能处理比当初声明时更多的参数，这些参数叫做不定长参数。

  加了星号`*`的参数，python会创建一个对应名称的空**元组**，并将收到的所有实参都封装到这个元组中。

  为了让函数能够接受不同类型的实参，必须在函数定义中将接纳任意数量实参的形参**放在最后**。

  ```python
  def printInfo(arg1, *var_tuple):
      """打印任何输入的内容"""
      print(arg1)
      for var in var_tuple:
          print(var)
  
  printInfo(10,23,434,232,2343,455)
  print(10)  #var_tuple的是空元组
  ```

  

  有时候，需要接收任意数量的实参，但预先不知道传递给函数的会是什么样的信息，需要用关键字参数指定。这就要参数能接受任意数量的关键词参数。

  加了两个星号`**`的参数，python会创建一个对应名称的空**字典**，并将收到的所有名称值对都放到这个字典。

  ```python
  def printme(name, age, **info):
      """打印个人信息"""
      print(f"{name.title()}:")
      print(f"\tage：{age}")
      #打印字典
      for k, v in info.items():
          print(f"\t{k}：{v}")
  
  printme("tom", 17,
          sex = "男",
          addr = "xxxx")
  ```

  

补充：强制位置参数

Python 3.8引入的新特性，用于限制某些参数只能通过位置传递，而不能通过关键字传递。

使用`/`符号在函数定义中标记强制位置参数，`/`之前的参数必须按位置传递。

可以与`*`配合使用。在声明函数时，参数中星号 `*` 可以单独出现，`*`之后后的参数必须用关键字参数传入。

默认参数需定义在`/`之后，否则会引发语法错误

```python
#表示a和b只能通过位置传递，c和d可通过位置或关键字传递
def func(a, b, /, c, d):
    ....
```

***

在 python 中，strings, tuples, 和 numbers 是不可更改的对象，而 list,dict，set等则是可以修改的对象。

当在函数调用时传入**不可变类型**的参数，类似 C++ 的值传递。如 fun(a)，传递的只是 a 的值，没有影响 a 对象本身。如果在 fun(a) 内部修改 a 的值，则是新生成一个 a 的对象。

当在函数调用时传入了**可变类型**的参数，类似 C++ 的引用传递，如 fun(la)，则是将 la 真正的传过去，修改后 fun 外部的 la 也会受影响。为了不让外部可变对象被修改，可以传入可变对象的**副本**而非原件。

### 9.3 模块

Python 中的模块（Module）是一个包含 Python 定义和语句的文件，文件名就是模块名加上 **.py** 后缀。模块可以包含函数、类、变量以及可执行的代码。通过模块，我们可以将代码组织成可重用的单元，便于管理和维护。

使用函数的优点之一是可将代码块与主程序分离，还可以更进一步，将函数存储在称为**模块**的独立文件中，再将模块导入主程序中。

在当前文件开始使用`import`语句导入所需的源文件，python执行到该语句时会将源文件中的所有函数都复制到当前命名空间中。

```python
import module1[, module2[,... moduleN]
               
#使用模块中的函数
modulex.function()
```

还可以导入模块中的特定函数，语法如下

```python
from moudle_name import function_0,function_1....

#使用对应函数，调用时只需指定其名称即可
function_0()
```

使用星号`*`可以导入指定模块中的所有函数。**不推荐，容易引起命名冲突。**

```python
from pizza import *
```

可以使用`as`给函数和模块指定别名

```python
import pizza as p
from pizza import make_pizza as mp
```

***

平时经常会看到这样的代码

```python
if __name__ == "__main__":
    #这里的代码只有在模块作为主程序运行时才会执行
    main() 
```

在 Python 中，**`__name__`** 和 **`__main__`** 是两个与模块和脚本执行相关的特殊变量。通常用于控制代码的执行方式，尤其是在模块既可以作为独立脚本运行，也可以被其他模块导入时。

`__main__` 是一个特殊的字符串，用于表示当前模块是作为主程序运行的，通常与 `__name__` 变量一起使用，以确定模块是被导入还是作为独立脚本运行。

`__name__ `是一个内置变量，用于表示当前模块的名称。它的值取决于模块是如何被使用的：

- 当模块作为主程序运行时：`__name__` 的值被设置为 **"`__main__`"**。

- 当模块被导入时：`__name__` 的值被设置为模块的文件名（不包括 .py 扩展名）。

使用 `if __name__ == "__main__":` 可以控制模块在被导入时不会执行某些代码，而只有在作为独立脚本运行时才会执行这些代码。





### 9.4  lambda函数（匿名函数）

Python 使用 **lambda** 关键字来创建匿名函数。

lambda 函数通常用于编写简单的、单行的函数，通常在**需要函数作为参数**传递的情况下使用，例如在 map()、filter()、reduce() 等函数中，以便在集合上执行操作。

特点：

- lambda 函数是匿名的，它们没有函数名称，只能通过赋值给变量或作为参数传递给其他函数来使用。
- lambda 函数通常只包含一行代码，这使得它们适用于编写简单的函数。

lambda语法格式：

```python
lambda arguments: expression

# lambda是 Python 的关键字，用于定义 lambda 函数。
# arguments 是参数列表，可以包含零个或多个参数，但必须在冒号(:)前指定。
# expression 是一个表达式，用于计算并返回函数的结果。
```

示例：

```python
#简单使用
f  = lambda : "Hello World"
print(f())   # Hello World

x = lambda a: a+10
print(x(5)) # 15

x = lambda a, b: a * b
print(x(3,4))  #12


numbers = [1, 2, 3, 4, 5]
#与 map一起使用，对可迭代对象中的每个元素执行lambda方法，返回迭代器对象
squared = list(map(lambda x: x**2, numbers))
print(squared) #[1, 4, 9, 16, 25]

#与 filter 一起使用，过滤元素
even_numbers = list(filter(lambda x: x % 2 == 0, numbers))
print(even_numbers)  #[2, 4]

#与 reduce 一起使用， 对集合元素做累积操作
from functools import reduce
product = reduce(lambda x, y: x * y, numbers) #求元素乘积
print(product)  #120

```

## 十、类

### 10.1 类定义

**类（Class）**是用来描述具有相同的属性和方法的对象的集合。它定义了该集合中每个对象所共有的属性和方法。

使用`class`关键字定义类，类名采用驼峰命名法。对于每个类，都应紧跟在类定义后面包含一个文档字符串用于简要描述类的功能。

```python
class ClassName:
    """当前类的功能描述"""
    <statement-1>
    .
    .
    .
    <statement-N>
```

### 10.2 属性定义

在 Python 类中，属性定义主要有以下几种方式：

- 直接在类作用域中定义并初始化，所有实例共享（**类属性**）。
- 在 `__init__` 方法中通过 `self` 定义，每个实例拥有独立副本 （**实例属性**）。
- 在类外部或方法中动态添加 （**动态属性**）。可以为单个实例绑定属性，也可以动态绑定到类，这将影响所有实例。动态属性一旦添加，它会持续存在直到示例被销毁或类被销毁。

对于类属性，可通过`类名.属性 `或`实例.属性`访问；对于实例属性，可通过`实例.属性`访问

属性名以两个下划线开头时，声明该属性为私有，不能在类的外部被使用或直接访问。

```python
class MyClass:
    """类属性定义示例"""
    class_attr = "共享值"
    __private_attr = "私有变量"

    def __init__(self, name, age):
        self.name = name
        self.age = age
        self.default_val = "默认值"  # 有默认值的属性直接在构造函数中设置
	
obj_1 = MyClass("tom", 17)
obj_2 = MyClass("xxx",15)

obj_1.dynamic_attr = "动态添加"  # 动态实例属性，当前实例独有
print(obj_1.dynamic_attr)      # 输出 "动态添加"
print(obj_2.dynamic_attr)      #错误，obj_2未添加该属性

MyClass.new_attr = "类动态属性"  # 动态类属性，影响所有实例，包括已创建的
print(MyClass.new_attr)         # 输出 "类动态属性"
print(obj_1.new_attr)           # 输出 "类动态属性"
print(obj_2.new_attr)           # 输出 "类动态属性"

```



### 10.3 方法定义

在类的内部，使用 `def` 关键字来定义一个方法，与一般函数定义不同，类方法<u>必须</u>包含参数 **self**，且为第一个参数，**self** 代表的是**类的实例**（而不是类）。每个与实例相关联的方法调用都会自动传递实参self，它是指向实例本身的引用，让实例能够访问类中的属性和方法。

self 不是 python 关键字，尽管可以使用其他名称，但强烈建议使用 self，以保持代码的一致性和可读性。

类有一个名为` __init__` 的特殊方法（**构造方法**），该方法在类实例化时会自动调用。

当方法名以两个下划线开头，则声明该方法为私有方法，只能在类的内部调用 ，不能在类的外部调用。

```python
class Dog:
    """一次模拟小狗的简单尝试"""
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def __eat(self):  #私有方法
        """投喂小狗"""
        print(f"give foods to {self.name}")
        
    def sit(self):  #公有方法
        """模拟小狗收到命令时蹲下"""
        print(f"{self.name} is now sitting")
        self.__eat()
    
    def roll_over(self):
        """模拟小狗收到命令时打滚"""
        print(f"{self.name} rolled over")
```



类的专有方法如下，可以对类的专有方法进行重载实现某些功能。

- **`__init__` :** 构造函数，在生成对象时调用
- **`__del__` :** 析构函数，释放对象时使用
- **`__repr__` :** 打印，转换
- **`__setitem__` :** 按照索引赋值
- **`__getitem__`:** 按照索引获取值
- **`__len__`:** 获得长度
- **`__cmp__`:** 比较运算
- **`__call__`:** 函数调用
- **`__add__`:** 加运算
- **`__sub__`:** 减运算
- **`__mul__`:** 乘运算
- **`__truediv__`:** 除运算
- **`__mod__`:** 求余运算
- **`__pow__`:** 乘方

### 10.4 使用类和实例

类的实例化操作会自动调用 `__init__`() 方法。实例创建后就可以调用类中定义的方法了。

```python
my_obj = MyClass("tom", 17)  #不用像c和java那样使用new关键字
```

虽然可以通过`实例.属性`的方式访问并修改实例属性，但更多时候要编写并调用set方法对属性进行修改。

### 10.5 继承

如果要编写的类是另一个现成类的特殊版本，可以使用继承。一个类（**子类**）继承另一个类（**父类**）时，将自动获得父类的属性和方法，同时还可以定义自己的属性和方法。

创建子类时，父类必须包含在当前文件中，且位于子类前面。定义子类时，必须在类名后的圆括号内指定父类的名称。

`super()`是一个特殊函数，能够在子类中调用父类中的方法和属性。同时，在子类中根据自身需要重写父类方法。

```python
class People:
    name = ''
    age = 0
    #定义私有属性,私有属性在类外部无法直接进行访问
    __weight = 0
    #定义构造方法
    def __init__(self,n,a,w):
        self.name = n
        self.age = a
        self.__weight = w

     def speak(self):
         print("%s 说: 我 %d 岁。" %(self.name,self.age))
            
#单继承示例
class Student(People):
    def __init__(self,n,a,w,grade):
        super().__init__(self,n,a,w)   #调用父类的构函数
        self.grade = grade  #定义子类的属性
        
    #重写父类的方法
    def speak(self):
        print("%s 说: 我 %d 岁了，我在读 %d 年级"%(self.name,self.age,self.grade))
```

Python同样有限的支持多继承形式。需要注意圆括号中父类的顺序，有方法在子类中未找到时，会从左到右查找父类中是否包含方法并调用。多继承的类定义形如下：

```python
class DerivedClassName(Base1, Base2, Base3):
    <statement-1>
    .
    .
    .
    <statement-N>
```



## 十一、模块

Python 中的模块（Module）是一个包含 Python 定义和语句的文件，文件名就是模块名加上 **.py** 后缀。模块可以包含函数、类、变量以及可执行的代码。通过模块，我们可以将代码组织成可重用的单元，便于管理和维护。

在当前文件开始使用`import`语句导入所需的源文件，python执行到该语句时会将源文件中的所有定义都复制到当前命名空间中。

```python
import module1[, module2[,... moduleN]
               
#使用模块中的函数
modulex.function()
```

还可以导入模块中的特定函数和类，语法如下

```python
from moudle_name import Class_0, function_0,function_1....

#使用对应函数，调用时只需指定其名称即可
function_0()
```

使用星号`*`可以导入指定模块中的所有函数和类。**不推荐，容易引起命名冲突。**

```python
from pizza import *
```

可以使用`as`给函数和类指定别名

```python
import pizza as p
from pizza import make_pizza as mp
```

***

平时经常会看到这样的代码

```python
if __name__ == "__main__":
    #这里的代码只有在模块作为主程序运行时才会执行
    main() 
```

在 Python 中，**`__name__`** 和 **`__main__`** 是两个与模块和脚本执行相关的特殊变量。通常用于控制代码的执行方式，尤其是在模块既可以作为独立脚本运行，也可以被其他模块导入时。

`__main__` 是一个特殊的字符串，用于表示当前模块是作为主程序运行的，通常与 `__name__` 变量一起使用，以确定模块是被导入还是作为独立脚本运行。

`__name__ `是一个内置变量，用于表示当前模块的名称。它的值取决于模块是如何被使用的：

- 当模块作为主程序运行时：`__name__` 的值被设置为 **"`__main__`"**。

- 当模块被导入时：`__name__` 的值被设置为模块的文件名（不包括 .py 扩展名）。

使用 `if __name__ == "__main__":` 可以控制模块在被导入时不会执行某些代码，而只有在作为独立脚本运行时才会执行这些代码。



[python标准库参考](https://docs.python.org/zh-cn/3/library/index.html)

## 十一、文件与输入输出

### 11.1 标准输入输出

Python使用内置函数`input()`和`print()`进行标准输入输出。

`input()`函数从标准输入（通常是键盘）读取一行文本。返回的是字符串类型，如果需要其他类型，需进行转换。可以提供一个提示字符串作为参数。

```python
# 基本输入
name = input("Enter your name: ")  # 提示用户输入
print(f"Hello, {name}!")

# 数值输入（需类型转换）
age = int(input("Enter your age: "))
height = float(input("Enter your height (m): "))

# 多值输入
data = input("Enter two numbers (separated by space): ").split()
num1, num2 = float(data[0]), float(data[1])
```

`print()`函数将对象打印到标准输出（通常是屏幕）。支持多个参数，默认用空格分隔，可通过`sep`参数指定分隔符。默认以换行符结束，可通过`end`参数指定结束符。

```python
# 基本输出
print("Hello, World!")  # 输出: Hello, World!

# 输出多个值（默认空格分隔）
print("Name:", "Alice", "Age:", 25)  # 输出: Name: Alice Age: 25

# 自定义分隔符
print("2023", "08", "15", sep="-")  # 输出: 2023-08-15

# 自定义结束符（默认换行）
print("First line", end=" | ")
print("Second line")  # 输出: First line | Second line

# 格式化输出
name = "Bob"
age = 30
print(f"{name} is {age} years old")  # f-string (Python 3.6+)
print("{} is {} years old".format(name, age))  # format方法
print("%s is %d years old" % (name, age))  # %格式化
```

### 11.2  文件操作

**open()** 方法用于打开指定路径（绝对或相对路径）中的一个文件，并返回文件对象。

默认情况下，文件是以只读模式`r`打开的，为了维持跨平台统⼀性，最好在打开⽂件时传⼊编码，例如使⽤最⼴泛的encoding="utf-8"。

完整的语法格式为：

```python
open(
    file, 
    mode='r', 
    buffering=-1, 
    encoding=None, 
    errors=None, 
    newline=None, 
    closefd=True, 
    opener=None
)
```

- file: 必需，文件路径（相对或者绝对路径）。

- mode: 可选，指定文件打开模式，默认为`'r'` (只读文本模式)

  ![python 文件模式](https://gitee.com/cmyk359/img/raw/master/img/image-20250722215541040-2025-7-2221:56:06.png)

- buffering: 可选，设置缓冲策略，默认值：-1 (系统默认缓冲)

  - `0`：关闭缓冲 (仅二进制模式)
  - `1`：行缓冲 (仅文本模式)
  - `>1`：指定缓冲区字节大小

- encoding: 可选，指定文本文件的编码，默认值为None采用系统默认编码，为保证跨平台兼容推荐设置为utf8

- errors: 可选，指定编码错误处理策略。常用如下：

  - `'ignore'`：忽略错误字符
  - `'replace'`：用?替换无效字符
  - `'backslashreplace'`：用\xNN转义序列替换

- newline: 可选，控制换行符处理。默认值为None (通用换行模式)。可选值如下：

  - `''`：不转换换行符
  - `'\n'`：写入时使用\n作为换行符
  - `'\r'`：写入时使用\r作为换行符
  - `'\r\n'`：写入时使用\r\n作为换行符

- closefd: 可选，控制底层文件描述符的行为，默认为True，通常保持默认。

- opener: 可选，自定义文件打开器

Python⽂件（可读或可写）操作默认是⽤⽂本模式，也就是说，需要处理Python的字符串。⽂本模式与⼆进制模式不同，在⽂件模式中加⼀个b就是⼆进制模式（如'rb' ,'wb'），处理的就是字节。

当使用open创建文件对象时，在结束操作时要使用`close`方法显式的关闭文件。

```python
path = 'example.txt' #相对路径
f = open(path, encoding = 'utf-8')
for line in f:
    print(line)
f.close()   
```

另一种简单的关闭文件方式是使用`with`语句（具体见下文）：

```python
with open(path) as f:
    for line in f:
        print(line)
```

***

使用文件对象的`read`或`readlines`读取文件内容

```python
with open(path) as f:
    contents = f.read() #读取整个文件内容，以字符串形式返回
    partial_cont = f.read(10)  #读取前10个字符
    print(contents)

#逐行读取，注意每行末尾都有一个隐藏的换行符
with open(path) as f:
    for line in f:
        print(line)
with open(path) as f:
     lines = f.readlines() #返回文件的行列表
     for line in lines:
        print(line)  
        
        
#逐行读取，删除每行末尾的换行符
with open(path) as f:
    lines = [x.rstrip() for x in f]
	for line in lines:
        print(line)    
```

对于可读⽂件，最常⽤的⽅法是read、seek和tell。

- read返回文件中一定量的字符，字符的内容由文件编码决定
- tell方法给出当前文件句柄的位置
- seek方法可以将句柄的位置改变到文件中的特定字节

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250722224616419-2025-7-2222:46:17.png" alt="文件的常用方法" style="zoom:80%;" />

***

**写入文件**

要将文本写入文件，需要在调用`open`打开文件时指定文件打开模式为可写的

- `w`：只写模式，文件不存在时创建，文件已存在时会先清空文件内容再返回文件对象
- `x`：只写模式，文件不存在时创建，文件已存在时创建失败
- `a`：追加模式，文件不存在时创建，将写入的文件行添加到文件末尾

使用文件对象的`write`或`writelines`方法将文本写入文件

```python
with open(path, 'w') as f:
    f.write("new contents")
```



### 11.3 with 语句

在 Python 编程中，资源管理是一个重要但容易被忽视的环节。`with` 关键字为我们提供了一种优雅的方式来处理**文件操作、数据库连接，锁**等需要明确释放资源的场景。

with 是 Python 中的一个关键字，用于上下文管理协议（Context Management Protocol）。它简化了资源管理代码，特别是那些需要明确释放或清理的资源（如文件、网络连接、数据库连接等）。

with语句的基本形式如下：

```python
with expression  [as variable]:
    #代码块
```

- `expression` 返回一个支持上下文管理协议的对象
- `as variable` 是可选的，用于将表达式结果赋值给变量
- 代码块执行完毕后，自动调用清理方法



传统的资源管理与使用with语句对比：

```python
#传统文件操作
file = open('example.txt', 'r')
try:
    content = file.read()
    # 处理文件内容
finally:
    file.close()
    
#使用with语句的文件操作
file = open('example.txt', 'r')
with open(file) as f:
    # 处理文件内容
    content = file.read()
#代码块执行完毕后自动关闭文件
```

`with` 语句通过上下文管理协议解决了传统方式下代码冗长，需手动处理异常，忘记关闭资源等问题。

1. **自动资源释放**：确保资源在使用后被正确关闭
2. **代码简洁**：减少样板代码
3. **异常安全**：即使在代码块中发生异常，资源也会被正确释放
4. **可读性强**：明确标识资源的作用域

使用场景

- 文件操作，如上

- 数据库连接

  ```python
  import sqlite3
  
  with sqlite3.connect('database.db') as conn:
      cursor = conn.cursor()
      cursor.execute('SELECT * FROM users')
      results = cursor.fetchall()
  # 连接自动关闭
  ```

- 线程锁

  ```python
  import threading
  
  lock = threading.Lock()
  
  with lock:
      # 临界区代码
      print("这段代码是线程安全的")
  ```

***

原理分析

`with` 语句背后是 Python 的上下文管理协议，该协议要求对象实现两个方法：

1. `__enter__()`：进入上下文时调用，返回值赋给 `as` 后的变量
2. `__exit__()`：退出上下文时调用，处理清理工作

## 十二、错误与异常

优雅地处理python的错误或异常是构建稳定程序的重要组成部分。

当函数或方法执行出现异常时，会将异常传递给调用方。如果传递到主程序仍然没有异常处理，程序才会被终止。因此，可以在主函数中增加异常捕获，确保程序的稳定性。

### 12.1 被动捕获

使用`trt-except`代码块捕捉程序运行期间可能产生的错误及异常。

`except`后面可以指定具体的异常类型。若有多种异常，可写多个except代码块分别处理；也可以通过将多个异常类型写入元组的方式同时捕捉多个指定异常（小括号是必不可少的）做集中处理。

使用`finally`关键字设置无论try代码块是否报错都要执行的代码。

使用`else`来执行当try代码块成功执行时才会执行的代码。

`pass`语句用于让Python在代码块中什么都不做，也充当了类似于TODO的占位符

```python
def attempt_float(x):
    try:
        return float(x)
    except (TypeError, ValueError):  #捕获多个指定异常
        return x
    
def write_file(path):
    f = open(path, 'w')
    try:
        f.write('new contents.')
    except FileNotFoundError:
        print("Failed")
    except:
        pass      #静默失败
    else:
        print("Succeeded")
    finally:
        f.close()
```



### 12.2 主动抛出

在开发中，除了 **代码执行出错** Python 解释器会 **抛出** 异常之外，还可以根据 **应用程序** **特有的业务需求** **主动抛出异常。**在 Python 中，当使用 `raise` 关键字主动向上抛出异常。

Python中提供了一个 `Exception` **异常类**，若希望抛出异常：

- 创建 一个 Exception 的 对象
- 使用 raise 关键字 抛出 异常对象

```python
def login(password):
    if len(password) > 6:
        return "success"
    else:
		# 主动抛出异常
        raise Exception("密码长度不够")
```

### 12.3 自定义异常

自定义异常类通常通过继承Exception类来创建。通过重写`__init__`和`__str__`方法，可以为异常提供更多上下文信息。

```python
# 自定义异常类
class MyError(Exception):
	def __init__(self, error_code, message):
		self.error_code = error_code
		self.message = message
		super().__init__(self.message) # 调用父类的初始化方法

	def __str__(self):
		return f"[Error {self.error_code}]: {self.message}"
```

MyError类继承了Exception类，并添加了一个构造函数来接受一个错误消息。当打印或转换为字符串时，这个错误消息将被返回。

