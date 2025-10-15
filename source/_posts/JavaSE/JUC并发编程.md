---
title: Java并发编程
categories:
  - JavaSE
abbrlink: eb9166f8
date: 2025-02-13 11:29:36
tags:	
  - 进程
  - 线程
  - synchronized
  - java内存模型
  - CAS 同步器
  - 线程池
  - JUC并发包
---
<meta name = "referrer", content = "no-referrer"/>

# 一、概述

JUC就是` java.util.concurrent`工具包的简称。这是一个处理线程的工具包，JDK1.5开始出现的。

## 1.1、进程和线程

**进程（Process）**是计算机中的程序关于某数据集合上的一次运行活动，是系**统进行资源分配和调度的基本单位**。

- 程序是指令、数据及其组织形式的描述，**进程是程序的实体**，是计算机中的程序关于某数据集合上的一次运行活动。当一个程序被运行，从磁盘加载这个程序的代码至内存，这时就开启了一个进程。



**线程（thread）**是操作系统能够进行运算**调度的最小单位**。它被包含在进程之中，是进程中的实际运作单位。

- 一条线程指的是进程中一个单一顺序的控制流，一个进程中可以并发多个线程，每条线程并行执行不同的任务。

  

> **进程——资源分配的最小单位**。
>
> **线程——程序执行的最小单位**。



**二者对比**:

1. 进程基本上相互独立的，而线程存在于进程内，是进程的一个子集

2. 进程拥有共享的资源，如内存空间等;线程本身不拥有系统资源，只拥有一点在运行中必不可少的资源，与同属一个进程的其他线程共享进程所拥有的全部资源

3. 进程间通信较为复杂,线程通信相对简单，因为线程之间共享进程内的内存
4. 线程更轻量，线程上下文切换成本一般上要比进程上下文切换低

***

补充：进程间的通信方式：

同一台计算机的进程通信：

   - 信号量：信号量是一个计数器，用于多进程对共享数据的访问，解决同步相关的问题并避免竞争条件

   - 共享存储：多个进程可以访问同一块内存空间，需要使用信号量用来同步对共享存储的访问
   - 管道通信：管道是用于连接一个读进程和一个写进程以实现它们之间通信的一个共享文件 pipe 文件，该文件同一时间只允许一个进程访问，所以只支持**半双工通信**
      - 匿名管道（Pipes）：用于具有亲缘关系的父子进程间或者兄弟进程之间的通信
      - 命名管道（Names Pipes）：以磁盘文件的方式存在，可以实现本机任意两个进程通信，遵循 FIFO

   - 消息队列：内核中存储消息的链表，由消息队列标识符标识，能在不同进程之间提供**全双工通信**，

>  匿名管道存在于内存中的文件；命名管道存在于实际的磁盘介质或者文件系统；消息队列存放在内核中，只有在内核重启（操作系统重启）或者显示地删除一个消息队列时，该消息队列才被真正删除 

不同计算机之间的**进程通信**，需要通过网络，并遵守共同的协议，例如 HTTP

  * 套接字：与其它通信机制不同的是，可用于不同机器间的互相通信

## 1.2、并行和并发

- 并行：在同一时刻，有多个指令在多个 CPU 上同时执行
- 并发：在同一时刻，有多个指令在单个 CPU 上交替执行

## 1.3、同步和异步

- 需要等待结果返回，才能继续运行就是同步
- 不需要等待结果返回，就能继续运行就是异步

## 1.4、管程

管程（Monitor）是一种操作系统中的同步机制，它的引入是为了解决多线程或多进程环境下的并发控制问题。

在传统的操作系统中，当多个进程或线程同时访问共享资源时，可能会导致数据的不一致性、竞态条件和死锁等问题。为了避免这些问题，需要引入一种同步机制来协调并发访问。

**管程提供了一种高级的同步原语，它将共享资源和对资源的操作封装在一个单元中，并提供了对这个单元的访问控制机制。**

相比于信号量机制，用管程编写程序更加简单，写代码更加轻松。

**管程的定义**

"管程是一种机制，用于强制并发线程对一组共享变量的互斥访问（或等效操作）。此外，管程还提供了等待线程满足特定条件的机制，并通知其他线程该条件已满足的方法。"

这个定义描述了管程的**两个主要功能**：

- 互斥访问：管程确保多个线程对共享变量的访问互斥，即同一时间只有一个线程可以访问共享资源，以避免竞态条件和数据不一致性问题。

- 条件等待和通知：管程提供了等待线程满足特定条件的机制，线程可以通过**条件变量**等待某个条件满足后再继续执行，或者通过条件变量通知其他线程某个条件已经满足。

**管程的组成**

管程由以下几个主要部分组成：

- 共享变量：管程中包含了共享的变量或数据结构，多个线程或进程需要通过管程来访问和修改这些共享资源。


- 互斥锁（Mutex）：互斥锁是管程中的一个关键组成部分，**用于确保在同一时间只有一个线程或进程可以进入管程**。一旦一个线程或进程进入管程，其他线程或进程必须等待，直到当前线程或进程退出管程。


- 条件变量（Condition Variables）：**条件变量用于实现线程或进程之间的等待和通知机制**。当一个线程或进程需要等待某个条件满足时（比如某个共享资源的状态），它可以通过条件变量进入等待状态。当其他线程或进程满足了这个条件时，它们可以通过条件变量发送信号来唤醒等待的线程或进程。


- 管程接口（**对管程进行操作的函数**）：管程还包括了一组操作共享资源的接口或方法。这些接口定义了对共享资源的操作，并且在内部实现中包含了互斥锁和条件变量的管理逻辑。<u>其他线程或进程通过调用这些接口来访问共享资源，从而确保了对共享资源的有序访问。</u>





**Java中的管程实现**

在Java中，你可以使用`Object`类的`wait()`和`notify()`方法来实现管程。

- **`wait()`方法**：用于释放当前线程所占用的资源，并等待其他线程的唤醒或特定条件的满足。
- **`notify()`方法**：用于唤醒正在等待的线程。
- **`notifyAll()`方法**：用于唤醒所有正在等待的线程。

下面是一个简单的Java代码示例，展示了如何使用`wait()`和`notify()`方法实现管程：

```java
public class MonitorExample {
   private int sharedResource; // 共享资源
   private boolean condition; // 特定条件

   public void updateResource(int newValue) {
       synchronized (this) {
           sharedResource = newValue; // 更新共享资源
           condition = true; // 设置条件为true
           notifyAll(); // 唤醒所有等待的线程
       }
   }

   public void waitForResource() throws InterruptedException {
       synchronized (this) {
           while (!condition) { // 检查条件是否满足
               wait(); // 如果不满足，当前线程等待
           }
           System.out.println("条件满足，继续执行...");
       }
   }
}
```

## 1.5、用户线程和守护线程

在Java中，线程主要分为两种类型：**用户线程**（User Thread）和**守护线程**（Daemon Thread）。这两种类型的线程在生命周期、优先级和用途等方面有所不同。



**用户线程（User Thread）**

用户线程是Java程序中的主要执行单元，它们**负责执行用户代码**。用户线程的生命周期与程序的执行密切相关，**它们随着程序的启动而创建，随着程序的结束而终止**。用户线程的**优先级通常较高**，因为它们需要响应用户的操作和请求。



**守护线程（Daemon Thread）**

守护线程是一种特殊的线程，它们的主要任务是**支持用户线程的执行**，而不是直接响应用户的请求。**依赖用户线程，随用户线程终止而强制终止。**守护线程的**优先级通常较低**，因为它们不需要响应用户的操作和请求。



**主要区别**

1. **生命周期**：用户线程随着程序的启动而创建，随着程序的结束而终止；守护线程依赖用户线程，随用户线程终止而强制终止。
2. **优先级**：用户线程的优先级较高，因为它们需要响应用户的操作和请求；守护线程的优先级较低。
3. **用途**：用户线程负责执行用户代码；守护线程主要支持用户线程的执行，如垃圾回收、网络IO等。

通过 `setDaemon(true)` 在启动前标记为守护线程。

下面是一个简单的Java代码示例，展示了如何创建和使用用户线程和守护线程：

```java
public class UserAndDaemonThreads {
   public static void main(String[] args) {
       // 创建用户线程
       Thread userThread = new Thread(() -> {
           System.out.println("用户线程正在执行...");
       });
       userThread.start();
       
       // 创建守护线程
       Thread daemonThread = new Thread(() -> {
           System.out.println("守护线程正在执行...");
       });
       daemonThread.setDaemon(true); // 将守护线程设置为守护状态
       daemonThread.start();
       
       // 主线程继续执行其他任务...
   }
}
```

# 二、Java 线程

## 2.1、创建和运行线程

### 方法一：直接使用Thread

**继承Thread类并重写run方法**

Thread 构造器：

- `public Thread()`
- `public Thread(String name)`

```java
//1、 创建线程对象
Thread t = new Thread() {
    @Override
 	public void run() {
 		// 要执行的任务
	}
};
//2、 启动线程
t.start();
```

例如:

```java
Thread s = new Thread("myThread") {
    @Override
    public void run() {
        log.debug("running");
    }
};
s.start();

//输出：11:55:12.888 [myThread] c.Test1 - running
```



- 线程的启动必须调用 start() 方法，如果线程直接调用 run() 方法，相当于变成了普通类的执行，此时主线程将只有执行该线程
- start() 方法底层其实是给 CPU 注册当前线程，并且触发 run() 方法执行

***

继承 Thread 类的优缺点：

- 优点：编码简单
- 缺点：线程类已经继承了 Thread 类无法继承其他类了，功能不能通过继承拓展（单继承的局限性）

### 方法二：使用 Runnable 配合 Thread

把【线程】和【任务】（要执行的代码）分开，更为灵活

- Thread 代表线程

- Runnable 可运行的任务（线程要执行的代码）

**实现Runnable接口并将其实例传递给Thread的构造函数**

```java
Runnable runnable = new Runnable() {
	public void run(){
 	// 要执行的任务
 	}
};

// 创建线程对象
Thread t = new Thread( runnable );
// 启动线程
t.start();
```

例如：

```java
Runnable r1 = new Runnable() {
    @Override
    public void run() {
        log.debug("running");
    }
};
// Lambda简化写法
Runnable r2 = () -> log.debug("running");

Thread thread = new Thread(r1,"myThread");
thread.start();
//输出：12:06:11.167 [myThread] c.Test1 - running
```

***

Thread和 Runnable的关系：

**Thread 类本身也是实现了 Runnable 接口**，Thread 类中持有 Runnable 的属性，执行线程 run 方法底层是调用 Runnable#run:

```java
public class Thread implements Runnable {
    //...
    private Runnable target;
    
    public void run() {
        if (target != null) {
          	// 底层调用的是 Runnable 的 run 方法
            target.run();
        }
    }
    //...
}
```

小结

- 方法1 是把线程和任务合并在了一起，方法2是把线程和任务分开了
- 用Runnable更容易与线程池等高级API配合
- 用Runnable让任务类脱离了Thread继承体系，更灵活

### 方法三：FutureTask 配合 Thread

**FutureTask类**，实现了RunnableFuture接口，而RunnableFuture继承了Runnable和Future接口。因此，FutureTask既可以作为Runnable被线程执行，也可以作为Future来获取结果。

FutureTask 能够接收 Callable 类型的参数，用来处理有返回结果的情况

```java
// 创建任务对象
FutureTask<Integer> task3 = new FutureTask<>(() -> {
 	log.debug("hello");
 	return 100;
});

// 参数1 是任务对象; 参数2 是线程名字，推荐
new Thread(task3, "t3").start();

// 主线程阻塞，同步等待 task 执行完毕的结果
Integer result = task3.get();
log.debug("结果是:{}", result);
```



> **Runnable接口**：只有一个run方法，没有返回值，不能抛出检查异常。
>
> **Callable接口**：类似于Runnable，但有返回值，可以抛出异常
>
> ```java
> public interface Runnable {
>     public abstract void run();
> }
> 
> public interface Callable<V> {
>     V call() throws Exception;
> }
> ```

## 2.2、查看线程

### **windows**

任务管理器可以查看进程和线程数，也可以用来杀死进程

`tasklist` 查看进程

`taskkill` 杀死进程

### **linux**

`ps -fe` 查看所有进程

`ps -fT -p <PID>` 查看某个进程（PID）的所有线程

`kill` 杀死进程

`top` 按大写 H 切换是否显示线程

`top -H -p <PID>` 查看某个进程（PID）的所有线程

### **Java**

`jps` 命令查看所有 Java 进程

`jstack <PID>` 查看某个 Java 进程（PID）的所有线程状态

`jconsole` 来查看某个 Java 进程中线程的运行情况（图形界面）

## 2.3、线程API

[API文档](https://www.runoob.com/manual/jdk11api/java.base/java/lang/Thread.html)


![](https://gitee.com/cmyk359/img/raw/master/img/image-20250224185601737-2025-2-2418:56:10.png)

### start 与 run

`start()` 方法

- 作用：启动一个新线程，并在新线程中异步执行 `run()` 方法。
- 特点：
  - JVM 会调用操作系统的底层 API 创建新线程。
  - 线程进入就绪状态，由线程调度器分配 CPU 时间片。
  - 如果线程已启动，多次调用 `start()` 会导致 `IllegalThreadStateException`
- 触发线程状态从 `NEW` 到 `RUNNABLE`，启动新线程并异步执行代码。

`run()` 方法

- 作用：直接在当前线程中同步执行代码（不创建新线程）。
- 特点：
  - 仅仅是普通方法的调用，不会触发多线程行为。
  - 如果直接调用 `run()`，代码会在调用者的线程（如 `main` 线程）中执行。
- 只是普通方法调用，不会改变线程对象的状态（保持 `NEW`），代码在当前线程中同步执行。

```java
public class ThreadDemo {
    public static void main(String[] args) {
        Thread thread = new Thread(() -> {
            System.out.println("代码执行线程: " + Thread.currentThread().getName());
        });

        // 调用 start()：在新线程中执行 run()
        thread.start(); // 输出类似：代码执行线程: Thread-0

        // 直接调用 run()：在当前线程（main）中执行
        thread.run();  // 输出：代码执行线程: main
    }
}

```

### sleep 与 yield

**`Thread.sleep(long millis)`**

- 强制当前线程暂停执行指定时间，进入阻塞状态。

- 线程状态：调用后线程进入 `TIMED_WAITING` 状态，时间到期后回到 `RUNNABLE `状态，等待 CPU 调度。

- 其它线程可以使用 `interrupt` 方法打断正在睡眠的线程，这时 sleep 方法会抛出 InterruptedException

- **不释放已持有的锁**，可能导致其他线程长时间等待锁。

- 建议用 `TimeUnit ` 的 sleep 代替 Thread 的 sleep 来获得更好的可读性。

  ```java
  TimeUnit.SECONDS.sleep(5);  // 直接表明休眠5秒
  ```

- 行为由 JVM 规范保证，所有平台一致。

***

**`Thread.yield()`**

- 提示线程调度器让出当前 CPU 时间片，允许其他线程运行。不保证其他线程一定会被调度，线程可能立即重新获得 CPU 时间片。具体的实现依赖于操作系统的任务调度器。
- 线程状态：保持 `RUNNABLE` 状态，只是暂时让出 CPU，线程随时可能被重新调度。
- **不释放锁**，其他线程仍无法获取该线程持有的锁。
- 效果依赖 JVM 和操作系统的线程调度策略，可能完全无作用，某些实现直接忽略 `yield()`。

当需要精确控制线程暂停时间时（如定时任务、延迟操作）优先使用 `sleep()`；**避免使用 `yield()`**，除非在特定场景下优化线程调度（如实验性代码），否则建议使用更可靠的机制，可以考虑 Java 并发工具（如 `ScheduledExecutorService`）替代手动控制线程暂停。



> 补充：线程优先级
>
> Java 线程的优先级是一个 **整数范围（1~10）**，用于向线程调度器提示线程执行的“重要程度”。默认优先级是5。通过`setPriority`和`getPriority`设置/获得当前线程的优先级。
>
> 它仅作为一个**建议**，优先级不保证线程的执行顺序或时间片分配，具体行为依赖操作系统和 JVM 实现。在开发中应优先依赖明确的同步和并发工具，而非优先级。若需控制任务执行顺序，可使用 `wait()`/`notify()` 或高级并发框架（如 `java.util.concurrent`）。



### join

`join()` / `join(long millis)`

用于让**当前线程**等待另一个线程执行完成后再继续执行。本质是通过线程间的**协作**实现顺序控制，常用于多线程任务的分阶段处理。

**`join()` 的线程状态变化**

- **调用线程**（主线程）：进入 `WAITING` 或 `TIMED_WAITING` 状态。
- **目标线程**（被 join 的线程）：正常运行，直至终止（`TERMINATED` 状态）。

`join()` 的底层依赖 `wait()`/`notify()` 机制：

- 当调用 `t.join()` 时，**当前线程**（如主线程）会获取线程 `t` 的对象锁。
- 如果线程 `t` 仍在运行，当前线程进入 `WAITING` 或 `TIMED_WAITING` 状态。
- **当线程 `t` 终止时，JVM 会自动调用 `t.notifyAll()`**，唤醒等待线程。

```java
public final synchronized void join(long millis)
    throws InterruptedException { // 声明同步方法，允许指定超时毫秒数，可能抛出中断异常
    long base = System.currentTimeMillis(); // 记录方法调用时的基准时间戳
    long now = 0; // 初始化已等待时间计数器

    if (millis < 0) { // 防御性校验：超时时间不能为负数
        throw new IllegalArgumentException("timeout value is negative");
    }

    if (millis == 0) { // 处理无限等待的特殊情况
        while (isAlive()) { // 持续检查目标线程是否存活
            wait(0); // 释放锁进入无限等待（直到被notify或中断）
        }
    } else { // 处理有限时间等待的常规情况
        while (isAlive()) { // 循环检查目标线程状态
            long delay = millis - now; // 计算剩余可等待时间
            if (delay <= 0) { // 剩余时间耗尽时跳出循环
                break;
            }
            wait(delay); // 带超时的等待（单位毫秒），会自动释放对象锁
            now = System.currentTimeMillis() - base; // 计算已等待的总时长
        }
    }
}
```

### interrupt 中断

`interrupt()` 方法用于 **向线程发送中断信号**，但 **不强制终止线程**。

中断是 **请求**，不是命令，线程可以忽略中断。其本质是协作式的中断机制，要求线程自行检查中断状态并决定如何响应。

相关方法：

| **方法**                                | **作用**                                                     |
| :-------------------------------------- | :----------------------------------------------------------- |
| `void interrupt()                     ` | 设置线程的中断标志位为`true`<br>若线程在阻塞状态，则触发 InterruptedException。 |
| `boolean isInterrupted()`               | 检查线程的中断状态，**不清除标志位**。                       |
| `static boolean interrupted()`          | 检查当前线程的中断状态，**清除标志位**（将中断状态重置为 `false`）。 |

***

**底层机制**

- **中断标志位**：每个线程内部维护一个 `boolean` 类型的中断状态。
- `interrupt()` 方法会设置该标志位为 `true`，若线程在阻塞状态，JVM 会触发异常并重置标志位。
- **重要原则**：
  - 中断状态是线程间通信的 **唯一可靠方式**（优于自定义 `volatile` 标志）。
  - 捕获 `InterruptedException` 后，必须决定 **传递中断** 或 **恢复中断状态**。

#### **中断的处理场景**

（1）打断处于阻塞状态的线程（sleep、wait、join）

调用 `interrupt()` 会触发 `InterruptedException`，并 **清除中断标志位**。

**正确处理步骤**：

1. 捕获 `InterruptedException`。
2. **恢复中断状态**（避免上层代码无法感知中断）。
3. 执行清理逻辑并退出。

```java
public void run() {
    try {
        while (true) {
            Thread.sleep(1000); // 可能被中断的阻塞操作
            // 执行任务
        }
    } catch (InterruptedException e) {
        // 恢复中断状态（重要！）
        Thread.currentThread().interrupt(); 
        System.out.println("线程被中断，执行清理后退出");
    }
}
```

***

（2）打断正常运行的线程

打断正常运行的线程, 不会清空打断状态。线程需主动检查中断标志位，决定是否终止任务，可以在终止任务之前做一些后置处理操作。

例如：在循环任务中响应中断

```java
Thread t2 = new Thread(() -> {
    while (!Thread.currentThread().isInterrupted()) {
        // 执行任务逻辑
    }
    //后置处理
    System.out.println("线程收到中断请求，优雅退出");
},"t2");
```

***

（3）打断park线程

park 作用类似 sleep，打断 park 线程，不会清空打断状态（true）

```java
public static void main(String[] args) throws Exception {
    Thread t1 = new Thread(() -> {
        System.out.println("park...");
        LockSupport.park();
        System.out.println("unpark...");
        System.out.println("打断状态：" + Thread.currentThread().isInterrupted());//打断状态：true
    }, "t1");
    t1.start();
    Thread.sleep(2000);
    t1.interrupt();
}
```

如果打断标记已经是 true, 则 park 会失效

```java
LockSupport.park();
System.out.println("unpark...");
LockSupport.park();//失效，不会阻塞
System.out.println("unpark...");//和上一个unpark同时执行
```

可以修改获取打断状态方法，使用 `Thread.interrupted()`，清除打断标记



#### 优雅地终止线程

***

[终止模式之两阶段终止](https://catpaws.top/12dbc0cd/#终止模式之两阶段终止模式)



## 2.4、线程的状态

### 五状态模型

这是传统的线程生命周期模型，适用于大多数操作系统和编程语言。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250224232013262-2025-2-2423:20:19.png" style="zoom:80%;" />

1. 新建（New）

   线程对象已创建，但尚未调用 `start()` 方法。

2. 就绪（Runnable）

   调用 `start()` 后，线程就进入就绪状态。线程已获得必要资源（内存、栈等），由于还没有分配CPU，线程将进入就绪队列排队，等待CPU服务。

3. 运行（Running）

   获取 CPU 时间片，执行 `run()` 方法。可能因以下原因退出运行状态：

   - 时间片用完 / 主动放弃 CPU → 回到 **就绪状态**（等待下次调度）。
   - 等待资源（如 I/O、锁） → 进入 **阻塞状态**。
   - 任务完成 → 进入 **终止状态**。
   
4. 阻塞（Blocked）

   线程因等待资源（如锁、I/O）主动或被动暂停执行。释放 CPU 资源，当等待条件满足（如锁可用、I/O 完成）时，线程回到 就绪状态。

5. 终止（Terminated）

   `run()` 方法执行完毕或线程被强制终止。

### 六状态模型

Java 通过 `Thread.getState()` 方法返回的 `Thread.State` 枚举值定义了更细粒度的 **6 种状态**，是 Java 对线程生命周期的 **具体实现描述**。相比通用的五状态模型，它更细粒度地划分了线程的**阻塞**场景。

> 五状态是理论模型，而六状态是Java中的实际实现，细化了一些阻塞情况（锁竞争、无限等待、超时等待）。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250224235349524-2025-2-2423:53:51.png" style="zoom:80%;" />

- `NEW` ：线程刚被创建，但是还没有调用 start() 方法

- `RUNNABLE`：当调用了 start() 方法之后。

  > **Java API** 层面的 RUNNABLE 状态涵盖了 **操作系统** 层面的【可运行状态】、【运行状态】和【阻塞状态】（由于 Java 的线程状态模型关注 **程序逻辑行为**，而非底层系统行为，由BIO 导致的线程阻塞，仍然认为是可运行）

- `BLOCKED` ，` WAITING` ， `TIMED_WAITING` 都是 **Java API** 层面对【阻塞状态】的细分（**锁竞争、无限等待、超时等待**）。

  - `BLOCKED`：线程因等待获取 `synchronized` 监视器锁而被阻塞。
  - `WAITING`：线程无限期等待其他线程唤醒。如调用 Object.wait()、Thread.join()无参方法。
  - `TIMED_WAITING`：线程有限时间等待。如调用 Thread.sleep(ms)、Object.wait(timeout)。

- `TERMINATED`：线程已终止。`run()` 方法执行完毕或抛出未捕获异常。

***

**转化规则：**

**NEW → RUNNABLE**

- 调用 `start()` 方法启动线程。

**RUNNABLE ↔ BLOCKED**

- **t** **线程**用 `synchronized(obj)` 获取对象锁时，如果竞争失败，从 RUNNABLE --> BLOCKED
- 持用 obj 锁的线程的同步代码块执行完毕，会唤醒该对象上所有 BLOCKED 的线程重新竞争
  - 竞争成功：BLOCKED --> RUNNABLE
  - 竞争失败：仍然是BLOCKED 

**RUNNABLE ↔ WAITING**

调用以下方法：

1. **t** **线程**用 `synchronized(obj)` 获取了对象锁后

   - 调用 `obj.wait()` 方法时，**t** **线程**从 RUNNABLE --> WAITING
   - 其他线程调用 `obj.notify()` ， `obj.notifyAll()` ，` t.interrupt()` 时
     - 锁竞争成功：WAITING → RUNNABLE
     - 锁竞争失败：WAITING → BLOCKED

2. **当前线程**调用 `t.join() `方法时，**当前线程**从 RUNNABLE --> WAITING

   > 注意是**当前线程**在**t** **线程对象**的监视器上等待

   **t** **线程**运行结束，或调用了**当前线程**的` interrupt()` 时，**当前线程**从 WAITING --> RUNNABLE

3. 当前线程调用 `LockSupport.park() `方法会让当前线程从 RUNNABLE --> WAITING

   调用 `LockSupport.unpark(目标线程)` 或调用了线程 的 `interrupt()` ，会让目标线程从 WAITING --> RUNNABLE



**RUNNABLE ↔ TIMED_WAITING**

1. **t** **线程**用 `synchronized(obj)` 获取了对象锁后

   - 调用 `obj.wait(long n)` 方法时，**t** **线程**从 RUNNABLE --> TIMED_WAITING
   - **t** **线程**等待时间超过了 n 毫秒，或调用 `obj.notify() `， `obj.notifyAll()` ，` t.interrupt() `时
     - 锁竞争成功：WAITING → RUNNABLE
     - 锁竞争失败：WAITING → BLOCKED

2. **当前线程**调用 `t.join(long n)` 方法时，**当前线程**从 RUNNABLE --> TIMED_WAITING

   > 注意是**当前线程**在**t** **线程对象**的监视器上等待

   **当前线程**等待时间超过了 n 毫秒，或**t** **线程**运行结束，或调用了**当前线程**的 `interrupt()` 时，**当前线程**从 TIMED_WAITING --> RUNNABLE

3. 当前线程调用 `Thread.sleep(long n)` ，当前线程从 RUNNABLE --> TIMED_WAITING

   **当前线程**等待时间超过了 n 毫秒，**当前线程**从 TIMED_WAITING --> RUNNABLE

4. 当前线程调用 `LockSupport.parkNanos(long nanos)` 或 `LockSupport.parkUntil(long millis) `时，**当前线程**从 RUNNABLE --> TIMED_WAITING

   调用 `LockSupport.unpark(目标线程)` 或调用了线程 的 `interrupt()` ，或是等待超时，会让目标线程从

   TIMED_WAITING--> RUNNABLE



**RUNNABLE → TERMINATED**

- `run()` 方法正常结束或抛出未捕获异常。



## 2.5、线程运行原理

### 栈与栈帧

JVM 中由堆、栈、方法区所组成，其中栈内存是给谁用的呢？其实就是线程，每个线程启动后，虚拟机就会为其分配一块栈内存。

- 每个栈由多个栈帧（Frame）组成，对应着每次方法调用时所占用的内存

- 每个线程只能有一个活动栈帧，对应着当前正在执行的那个方法

虚拟机栈中的栈帧（Stack Frame）是方法执行的基本单位。每当一个方法被调用时，都会在虚拟机栈中创建一个新的栈帧，该栈帧成为当前活动栈帧，用于存储该方法的局部变量、操作数栈等信息。当方法执行完成后，对应的栈帧会被移除，控制权回到前一个栈帧。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250224181547793-2025-2-2418:15:49.png" style="zoom:80%;" />

### 上下文切换

因为以下一些原因导致 cpu 不再执行当前的线程，转而执行另一个线程的代码

- 线程的 cpu 时间片用完
- 垃圾回收
- 有更高优先级的线程需要运行
- 线程自己调用了 sleep、yield、wait、join、park、synchronized、lock 等方法

当 Context Switch 发生时，需要由操作系统保存当前线程的状态，并恢复另一个线程的状态。该状态包括程序计数器、虚拟机栈中每个栈帧的信息，如局部变量、操作数栈、返回地址等。

线程并不是越多越好，当有大量线程轮流执行时，会频繁进行上下文切换，影响性能。



### 线程调度

线程调度指系统为线程分配处理器使用权的过程，方式有两种：协同式线程调度、抢占式线程调度（Java 选择）

协同式线程调度：线程的执行时间由线程本身控制

* 优点：线程做完任务才通知系统切换到其他线程，相当于所有线程串行执行，不会出现线程同步问题
* 缺点：线程执行时间不可控，如果代码编写出现问题，可能导致程序一直阻塞，引起系统的崩溃

抢占式线程调度：线程的执行时间由系统分配

* 优点：线程执行时间可控，不会因为一个线程的问题而导致整体系统不可用
* 缺点：无法主动为某个线程多分配时间

Java 提供了线程优先级的机制，优先级会提示（hint）调度器优先调度该线程，但这仅仅是一个提示，调度器可以忽略它。在线程的就绪状态时，如果 CPU 比较忙，那么优先级高的线程会获得更多的时间片，但 CPU 闲时，优先级几乎没作用。

# 三、共享模型之管程

## 3.1、共享带来的问题

两个线程对初始值为 0 的静态变量一个做自增，一个做自减，各做 5000 次

```java
static int counter = 0;
public static void main(String[] args) throws InterruptedException {
    Thread t1 = new Thread(() -> {
        for (int i = 0; i < 5000; i++) {
            counter++;
        }
    }, "t1");
    Thread t2 = new Thread(() -> {
        for (int i = 0; i < 5000; i++) {
            counter--;
        }
    }, "t2");
    t1.start();
    t2.start();
    t1.join();
    t2.join();
    log.debug("{}",counter);
}
```

以上的结果可能是正数、负数、零。因为 Java 中对静态变量的自增，自减并不是原子操作，而是由多个字节码指令构成。

- 对于` i++ `而言（i 为静态变量），实际会产生如下的 JVM 字节码指令：

  ```java
  getstatic i // 获取静态变量i的值
  iconst_1 // 准备常量1
  iadd // 自增
  putstatic i // 将修改后的值存入静态变量i
  ```

- `i--`的字节码指令与之大致相同

  ```java
  getstatic i // 获取静态变量i的值
  iconst_1 // 准备常量1
  isub // 自减
  putstatic i // 将修改后的值存入静态变量i
  ```

由于多个线程按时间片占用CPU，时间片到时会进行上下文切换，可能会出现**指令的交错**，导致最终结果不可预知。例如：两个线程交替执行导致结果为正数：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250225215423023-2025-2-2521:54:42.png" style="zoom:80%;" />

## 3.2、临界区

**临界资源**：一次仅允许一个进程使用的资源称为临界资源

**临界区**：访问临界资源的代码块

**竞态条件**：多个线程在临界区内执行，由于代码的**执行序列**不同而导致结果无法预测，称之为发生了竞态条件

一个程序运行多个线程是没有问题，多个线程读共享资源也没有问题，在多个线程对共享资源读写操作时发生指令交错，就会出现问题

为了避免临界区的竞态条件发生（解决线程安全问题）：

* 阻塞式的解决方案：synchronized，lock
* 非阻塞式的解决方案：原子变量

## 3.3、synchronized

synchronized，即俗称的**对象锁**，该对象理论上可以是**任意的唯一对象**。它采用互斥的方式让同一时刻至多只有一个线程能持有对象锁，其它线程再想获取这个对象锁时就会阻塞住。这样就能保证拥有锁的线程可以安全的执行临界区内的代码，不用担心线程上下文切换。

### 使用锁

**1、同步代码块**

```java
synchronized(对象) {
    //临界区
}
```

例如使用同步代码块解决上面两个线程的并发安全问题：

```java
static int counter = 0;
static Object room = new Object(); //创建一个锁对象

public static void main(String[] args) throws InterruptedException {
    Thread t1 = new Thread(() -> {
        for (int i = 0; i < 5000; i++) {
            synchronized (room) {
                counter++;
            }
        }
    }, "t1");
    Thread t2 = new Thread(() -> {
        for (int i = 0; i < 5000; i++) {
            synchronized (room) {
                counter--;
            }
        }
    }, "t2");
    
    t1.start();
    t2.start();
    t1.join();
    t2.join();
    log.debug("{}",counter);
}
```

***

**2、同步方法**

把出现线程安全问题的核心方法锁起来，每次只能一个线程进入访问

- 同步成员方法：锁对象是当前调用方法的实例`this`

  ```java
  class Test{
      public synchronized void test() {
  
      }
  }
  等价于
  class Test{
      public void test() {
          synchronized(this) {
  
          }
      }
  }
  ```

- 同步静态方法：锁对象是类的Class对象

  ```java
  class Test{
      public synchronized static void test() {
      }
  }
  等价于
  class Test{
      public static void test() {
          synchronized(Test.class) {
  
          }
      }
  }
  ```



synchronized 实际是用**对象锁**保证了**临界区内代码的原子性**，临界区内的代码对外是不可分割的，不会被线程切换所打断。

***

所谓的“线程八锁”

“线程八锁”指八种常见的多线程锁竞争场景，用于理解 `synchronized` 的作用范围，判断锁住的是哪个对象。

[案例分析](https://blog.csdn.net/u012068483/article/details/106904565)

主要关注锁住的对象是不是同一个

- 锁住 this 对象，只有在当前实例对象的线程内是安全的，如果有多个实例就不安全

* 锁住类对象，所有类的实例的方法都是安全的，类的所有实例都相当于同一把锁

### 锁原理

#### Java对象头

每个 Java 对象在内存中分为三部分：

1. **对象头（Object Header）**
2. **实例数据（Instance Data）**
3. **对齐填充（Padding）**

其中 **对象头** 存储了对象的元信息，具体结构如下：

| **对象头组成**     | **内容**                                                     |
| ------------------ | ------------------------------------------------------------ |
| **Mark Word**      | 存储哈希码、锁状态、GC 分代年龄等信息（长度依平台不同，通常为 32/64 位）。 |
| **Klass Pointer**  | 指向类元数据的指针（虚拟机通过此指针确定对象类型）。         |
| **数组长度(可选)** | 仅数组对象存在，记录数组长度。                               |

在32位虚拟机中，普通对象和数组对象的对象头结构如下：

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250228104237081-2025-2-2810:42:53.png)

Mark Word 在不同锁状态下会复用存储空间，以优化内存使用。其中 MarkWord 结构如下：

- 32位虚拟机的MarkWord

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250228105152934-2025-2-2810:51:58.png" style="zoom:80%;" />

- 64位虚拟机的MarkWord

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250228105341483-2025-2-2810:53:42.png" style="zoom:80%;" />

#### Monitor

Monitor 被翻译为**监视器**或**管程**， 是 Java 线程同步的核心机制。

每个对象都与一个 Monitor 关联，如果使用 synchronized 给对象上锁（重量级）之后，该对象头中的 Mark Word 会替换为指向 Monitor 的指针。

Monitor 的实现由 JVM 通过 C++ 代码完成（如 HotSpot 中的 `ObjectMonitor` 结构体），并非 Java 类，其实现细节对开发者透明。

JVM 在 **本地内存（非 Java 堆）** 中为每个需要同步的对象分配一个 Monitor 结构体，这些结构体由 JVM 自行管理，不参与 Java 堆的垃圾回收。

***

工作流程：

* 开始时 Monitor 中 Owner 为 null

* 当 Thread-2 执行 synchronized(obj) 就会将 Monitor 的所有者 Owner 置为 Thread-2，Monitor 中只能有一个 Owner。**obj 对象的 Mark Word 指向 Monitor**，把**对象原有的 MarkWord 存入线程栈中的锁记录**中（轻量级锁部分详解）

* 在 Thread-2 上锁的过程中，如果 Thread-3，Thread-4，Thread-5 也来执行 synchronized(obj)，就会进入EntryList，线程处于BLOCKED状态。

  ![](https://gitee.com/cmyk359/img/raw/master/img/image-20250228111220125-2025-2-2811:12:47.png)

- Thread-2 执行完同步代码块的内容，然后唤醒 EntryList 中等待的线程来竞争锁，竞争的时是非公平的
- WaitSet 中的 Thread-0是之前获得过锁，但条件不满足进入 WAITING 状态的线程（wait-notify机制）

注意：

* synchronized 必须是进入同一个对象的 Monitor 才有上述的效果
* 不加 synchronized 的对象不会关联监视器，不遵从以上规则

***

从字节码角度分析加锁/解锁的原理

```java
static final Object lock = new Object();
static int counter = 0;
public static void main(String[] args) {
    synchronized (lock) {
        counter++;
    }
}
```

对应字节码：

```java
    public static void main(java.lang.String[]);
        descriptor: ([Ljava/lang/String;)V
        flags: ACC_PUBLIC, ACC_STATI
        Code:
            stack=2, locals=3, args_size=1
                0: getstatic #2     // <- lock引用 （synchronized开始）
                3: dup
                4: astore_1         // lock引用 -> slot 1
                5: monitorenter     // 将 lock对象 MarkWord 置为 Monitor 指针
                6: getstatic #3     // <- i
                9: iconst_1         // 准备常数 1
                10: iadd            // +1
                11: putstatic #3    // -> i
                14: aload_1         // <- lock引用
                15: monitorexit     // 将 lock对象 MarkWord 重置, 唤醒 EntryList
                16: goto 24
                19: astore_2        // e -> slot 2
                20: aload_1         // <- lock引用
                21: monitorexit     // 将 lock对象 MarkWord 重置, 唤醒 EntryList
                22: aload_2         // <- slot 2 (e)
                23: athrow          // throw e
                24: return
            Exception table:
                from	to	target	type
                   6     16      19   any
                   19    22      19   any
            LineNumberTable:
                line 8: 0
                line 9: 6
                line 10: 14
                line 11: 24
            LocalVariableTable:
                Start Length Slot Name Signature
                    0     25    0  args [Ljava/lang/String;
            StackMapTable: number_of_entries = 2
                frame_type = 255 /* full_frame */
                    offset_delta = 19
                    locals = [ class "[Ljava/lang/String;", class java/lang/Object ]
                    stack = [ class java/lang/Throwable ]
                frame_type = 250 /* chop */
                    offset_delta = 4
```

在字节码层面保证了，只要使用Synchronize加了锁，不论内部的代码是正常结束还是出现异常，都能正确地释放锁。



### 锁升级

Monitor 的实现依赖于操作系统提供的 **互斥量** 和 **条件变量**。Java 1.6 后引入 **锁升级机制** 优化同步性能，减少锁操作的开销。随着竞争的加剧，锁状态按以下顺序升级（只能升级，不能降级）：

**无锁 → 偏向锁 → 轻量级锁 → 重量级锁**。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250228155748141-2025-2-2815:57:53.png" style="zoom:80%;" />



#### 偏向锁

偏向锁的思想：如果一个对象在多线程环境中总是由同一个线程访问，那么可以将锁偏向该线程，避免频繁的加锁和解锁操作， **减少无竞争场景下的同步开销**。

- 当线程首次进入同步块时，JVM 通过 CAS 操作将 Mark Word 的 `thread_id` 设置为当前线程 ID，并记录 `epoch` 值。
- 同一线程再次进入同步块时，仅需检查 `thread_id` 是否匹配，无需 CAS 操作，直接执行代码。

***

偏向状态：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250228162051905-2025-2-2816:20:53.png" style="zoom:80%;" />

- 偏向锁是默认开启的，对象创建后，markword 值为 0x05 即最后 3 位为 101，这时它的 thread、epoch、age 都为 0。
- 可以在运行时添加VM 参数` -XX:-UseBiasedLocking `禁用偏向锁，那么对象创建后，markword 值为 0x01 即最后 3 位为 001，处于无锁状态。这时它的 hashcode、age 都为 0，第一次用到 hashcode 时才会赋值。
- 偏向锁是默认是延迟的，不会在程序启动时立即生效，避免启动阶段的类加载竞争影响。如果想避免延迟，可以加 VM 参数 `-XX:BiasedLockingStartupDelay=0` 来禁用延迟。

***

撤销偏向锁的状态：

- 调用了对象的 hashCode方法。此时偏向锁的对象 MarkWord 中存储的是线程 id，如果调用 hashCode 生成的哈希码也要存储在 MarkWord 中，会导致偏向锁被撤销，变成无锁状态。

  > 轻量级锁会在锁记录中记录 hashCode
  >
  > 重量级锁会在 Monitor 中记录 hashCode

- 当有其它线程使用偏向锁对象时，会将偏向锁升级为轻量级锁，解锁后变成无锁状态。

- 调用 wait/notify

***

偏向锁的撤销开销较大，由于此时未发生锁竞争，可以使用重偏向进一步优化。

重偏向：如果对象虽然被多个线程访问，但没有竞争，这时偏向了线程 T1 的对象仍有机会重新偏向 T2，重偏向会重置对象的 Thread ID。

批量重偏向：当撤销偏向锁阈值超过 20 次后，JVM 认为该类的对象偏向的初始线程不再适用，触发批量重偏向，于是会在给这些对象加锁时重新偏向至加锁线程。

批量撤销：当某一类的偏向锁撤销次数超过更高阈值（默认 `40` 次），JVM 认为该类不适合偏向锁，触发批量消除，于是整个类的所有对象都会变为不可偏向的，新建的对象也是不可偏向的

#### 轻量级锁

一个对象有多个线程要加锁，但加锁的时间是错开的（没有竞争），可以使用轻量级锁来优化，轻量级锁对使用者是透明的，仍然使用`synchronize`加锁，优先使用轻量级锁，加锁失败时才会升级为重量级锁。

可重入锁：线程可以进入任何一个它已经拥有的锁所同步着的代码块，可重入锁最大的作用是**避免死锁**

轻量级锁在没有竞争时（锁重入时），每次重入仍然需要执行 CAS 操作，Java 6 才引入的偏向锁来优化

> CAS（Compare and Swap，比较并交换）是一种 **无锁并发编程的核心原子操作**，用于实现多线程环境下共享变量的安全更新。它通过硬件指令（如x86的`CMPXCHG`）保证操作的原子性，避免了传统锁机制（如`synchronized`）的线程阻塞和唤醒开销。
>
> CAS 操作包含三个操作数：
>
> - **内存位置（V）**：需要更新的共享变量。
> - **预期原值（A）**：线程认为当前内存中的值。
> - **新值（B）**：希望更新后的值。
>
> 操作逻辑：
>
> - 当且仅当 `V == A` 时，将 `V` 的值修改为 `B`，否则不修改。
> - 无论是否修改成功，均返回内存位置的当前值。



锁重入实例：

```java
static final Object obj = new Object();
public static void method1() {
    synchronized( obj ) {
        // 同步块 A
        method2();
    }
}
public static void method2() {
    synchronized( obj ) {
    	// 同步块 B
    }
}
```

- 创建锁记录（Lock Record）对象，每个线程的栈帧都会包含一个锁记录的结构，内部可以存储锁定对象的Mark Word

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250228172315253-2025-2-2817:23:16.png" style="zoom:80%;" />

- 让锁记录中 Object reference 指向锁对象，并尝试用 CAS 替换 Object 的 Mark Word，将 Mark Word 的值存入锁记录

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250228172349213-2025-2-2817:23:50.png" style="zoom:80%;" />

- 如果 CAS 替换成功，对象头中存储了 锁记录地址和状态 00 ，表示由该线程给对象加锁

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250228172710386-2025-2-2817:27:11.png" style="zoom:80%;" />

- 如果 CAS 失败，有两种情况

  - 如果是其它线程已经持有了该 Object 的轻量级锁，这时表明有竞争，进入锁膨胀过程

  - 如果是自己执行了 synchronized 锁重入，那么再添加一条 Lock Record 作为重入的计数

    <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250228172818981-2025-2-2817:28:20.png" style="zoom:80%;" />

- 当退出 synchronized 代码块（解锁时）

  - 如果有取值为 null 的锁记录，表示有重入，这时重置锁记录，表示重入计数减一

    <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250228173133523-2025-2-2817:31:35.png" style="zoom:80%;" />

  - 如果锁记录的值不为 null，这时使用 CAS 将MarkWord的值恢复给对象头

    - 成功，则解锁成功
    - 失败，说明轻量级锁进行了锁膨胀或已经升级为重量级锁，进入重量级锁解锁流程



#### 锁膨胀

如果在尝试加轻量级锁的过程中，CAS 操作无法成功，这时一种情况就是有其它线程为此对象加上了轻量级锁（有竞争），这时需要进行锁膨胀，将轻量级锁变为重量级锁。

- 当 Thread-1 进行轻量级加锁时，Thread-0 已经对该对象加了轻量级锁

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250228173349278-2025-2-2817:33:50.png" style="zoom:80%;" />

- 这时 Thread-1 加轻量级锁失败，进入锁膨胀流程：为 Object 对象申请 Monitor 锁；通过 Object 对象头获取到持锁线程，将 Monitor 的 Owner 置为 Thread-0，将 Object 的对象头指向重量级锁地址；然后自己进入 Monitor 的 EntryList 阻塞等待。

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250228173533609-2025-2-2817:35:34.png" style="zoom:80%;" />

- 当 Thread-0 退出同步块解锁时，使用 CAS 将 Mark Word 的值恢复给对象头失败，这时进入重量级解锁流程，即按照 Monitor 地址找到 Monitor 对象，设置 Owner 为 null，唤醒 EntryList 中 BLOCKED 线程进行锁竞争。

### 锁优化

##### 自旋锁

重量级锁竞争的时候，还可以使用自旋来进行优化。

重量级锁竞争时，获取锁失败的线程不会立即阻塞，可以使用**自旋**（默认 10 次）来进行优化，采用循环的方式去尝试获取锁。如果当前线程自旋成功（即这时候持锁线程已经退出了同步块，释放了锁），这时当前线程就可以避免阻塞，避免了上下文切换带来的损耗。

注意：

* 自旋占用 CPU 时间，单核 CPU 自旋就是浪费时间，因为同一时刻只能运行一个线程，多核 CPU 自旋才能发挥优势
* 自旋失败的线程会进入阻塞状态

优点：不会进入阻塞状态，**减少线程上下文切换的消耗**

缺点：当自旋的线程越来越多时，会不断的消耗 CPU 资源

***

自旋锁的情况：

- 自旋成功

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250228174134847-2025-2-2817:41:36.png" style="zoom:80%;" />

- 自旋失败

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250228174151970-2025-2-2817:41:53.png" style="zoom:80%;" />

***

自旋锁说明：

* 在 Java 6 之后自旋锁是自适应的，比如对象刚刚的一次自旋操作成功过，那么认为这次自旋成功的可能性会高，就多自旋几次；反之，就少自旋甚至不自旋，比较智能
* Java 7 之后不能控制是否开启自旋功能，由 JVM 控制

##### 锁消除

JVM 通过逃逸分析判断临界资源对象是否可能被其他线程访问（即是否“逃逸”出当前方法或线程）。若对象未逃逸，其同步操作无实际意义，JIT 会直接删除锁指令，消除无竞争场景下的冗余锁操作。

例如：在b方法中，加锁的对象o不会被其他线程访问，JIT会删除该加锁操作，实际执行与a方法相同。

```java
public class MyBenchmark {
    static int x = 0;

    public void a() throws Exception {
        x++;
    }

    public void b() throws Exception {
        Object o = new Object();
        synchronized (o) {
            x++;
        }
    }
}
```



##### 锁粗化

如果JVM发现在循环或密集调用中频繁获取/释放**同一锁**，会将多个连续的锁操作合并为单个更大范围的锁操作，减少锁操作次数。

例如：

```java
public void process(List<Task> tasks) {
    for (Task task : tasks) {
        synchronized (this) { // 循环内多次加锁
            doWork(task);
        }
    }
}
```

JVM优化后：

```java
public void process(List<Task> tasks) {
    synchronized (this) { // 锁粗化到循环外部
        for (Task task : tasks) {
            doWork(task);
        }
    }
}
```



### 多把锁

多把不相干的锁：一间大屋子有两个功能：睡觉、学习，互不相干。现在小南要学习，小女要睡觉，但如果只用一间屋子（一个对象锁）的话，那么并发度很低。解决方法是准备多个房间（多个对象锁）

```java
public static void main(String[] args) {
    BigRoom bigRoom = new BigRoom();
    new Thread(() -> { bigRoom.study(); }).start();
    new Thread(() -> { bigRoom.sleep(); }).start();
}
class BigRoom {
    private final Object studyRoom = new Object();
    private final Object sleepRoom = new Object();

    public void sleep() throws InterruptedException {
        synchronized (sleepRoom) {
            System.out.println("sleeping 2 小时");
            Thread.sleep(2000);
        }
    }

    public void study() throws InterruptedException {
        synchronized (studyRoom) {
            System.out.println("study 1 小时");
            Thread.sleep(1000);
        }
    }
}
```

将锁的粒度细分：

* 好处，是可以增强并发度
* 坏处，如果一个线程需要同时获得多把锁，就容易发生死锁 

### 活跃性

#### 死锁

当两个线程已经各自持有一把锁，还想再获取对方的锁时就会发生死锁（都在等待对方释放锁）。

Java 死锁产生的四个必要条件：

1. **互斥**条件，即当资源被一个线程使用（占有）时，别的线程不能使用
2. **不可剥夺**条件，资源请求者不能强制从资源占有者手中夺取资源，资源只能由资源占有者主动释放
3. **请求和保持**条件，即当资源请求者在请求其他的资源的同时保持对原有资源的占有
4. **循环等待**条件，即存在一个等待循环队列：p1 要 p2 的资源，p2 要 p1 的资源，形成了一个等待环路

四个条件都成立的时候，便形成死锁。死锁情况下打破上述任何一个条件，便可让死锁消失

```java
//死锁的例子
Object A = new Object();
Object B = new Object();
Thread t1 = new Thread(() -> {
    synchronized (A) { //已持有A的锁
        log.debug("lock A");
        sleep(1);
        synchronized (B) { //尝试获取B的锁
            log.debug("lock B");
            log.debug("操作...");
        }
    }
}, "t1");
Thread t2 = new Thread(() -> {
    synchronized (B) { //已持有B的锁
        log.debug("lock B");
        sleep(0.5);
        synchronized (A) { //尝试获取A的锁
            log.debug("lock A");
            log.debug("操作...");
        }
    }
}, "t2");
t1.start();
t2.start();

//输出
//10:09:56.296 [t1] c.TestDeadLock - lock A
//10:09:56.296 [t2] c.TestDeadLock - lock B
```

***

定位死锁

- 使用 `jps` 定位进程 id，再用 `jstack id`定位死锁，根据输出信息找出死锁的线程以及发生死锁的位置，解决死锁。

  ```bash
  "t2" #13 prio=5 os_prio=0 tid=0x000000001aaa1000 nid=0x4858 waiting for monitor entry [0x000000001b1ef000]
     java.lang.Thread.State: BLOCKED (on object monitor)
          at TestDeadLock.lambda$main$1(TestDeadLock.java:33)
          - waiting to lock <0x00000000d6bf9440> (a java.lang.Object)
          - locked <0x00000000d6bf9450> (a java.lang.Object)
          at TestDeadLock$$Lambda$2/872627152.run(Unknown Source)
          at java.lang.Thread.run(Thread.java:748)
  
  "t1" #12 prio=5 os_prio=0 tid=0x000000001aaab000 nid=0x2184 waiting for monitor entry [0x000000001b0ef000]
     java.lang.Thread.State: BLOCKED (on object monitor)
          at TestDeadLock.lambda$main$0(TestDeadLock.java:19)
          - waiting to lock <0x00000000d6bf9450> (a java.lang.Object)
          - locked <0x00000000d6bf9440> (a java.lang.Object)
          at TestDeadLock$$Lambda$1/866191240.run(Unknown Source)
          at java.lang.Thread.run(Thread.java:748)
  
  #省略.....
  
  Found one Java-level deadlock:
  =============================
  "t2":
    waiting to lock monitor 0x0000000017a53308 (object 0x00000000d6bf9440, a java.lang.Object),
    which is held by "t1"
  "t1":
    waiting to lock monitor 0x0000000017a50ff8 (object 0x00000000d6bf9450, a java.lang.Object),
    which is held by "t2"
  
  Java stack information for the threads listed above:
  ===================================================
  "t2":
          at TestDeadLock.lambda$main$1(TestDeadLock.java:33)
          - waiting to lock <0x00000000d6bf9440> (a java.lang.Object)
          - locked <0x00000000d6bf9450> (a java.lang.Object)
          at TestDeadLock$$Lambda$2/872627152.run(Unknown Source)
          at java.lang.Thread.run(Thread.java:748)
  "t1":
          at TestDeadLock.lambda$main$0(TestDeadLock.java:19)
          - waiting to lock <0x00000000d6bf9450> (a java.lang.Object)
          - locked <0x00000000d6bf9440> (a java.lang.Object)
          at TestDeadLock$$Lambda$1/866191240.run(Unknown Source)
          at java.lang.Thread.run(Thread.java:748)
  
  Found 1 deadlock.
  
  ```

- 使用`jconsole` 图形化工具连接到进程查看死锁

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250302101754360-2025-3-210:18:07.png" alt ="连接到对应进程" style="zoom:80%;" />

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250302101555625-2025-3-210:18:46.png" alt="检测死锁" style="zoom:80%;" />

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250302101658124-2025-3-210:20:06.png" alt="定位发生死锁的线程" style="zoom:80%;" />

- Linux 下可以通过 top 先定位到 CPU 占用高的 Java 进程，再利用 `top -Hp 进程id` 来定位是哪个线程，最后再用 jstack <pid>的输出来看各个线程栈

#### 活锁

在Java中， **活锁** 是一种线程未被阻塞但无法继续执行的情况。与死锁不同，活锁中的线程会持续尝试操作，但由于竞争条件或策略不当，始终无法完成任务。

活锁出现在两个线程互相改变对方的结束条件，最后谁也无法结束。

```java
//活锁的例子
class TestLiveLock {
    static volatile int count = 10;
    static final Object lock = new Object();
    public static void main(String[] args) {
        new Thread(() -> {
            // 期望减到 0 退出循环
            while (count > 0) {
                Thread.sleep(200);
                count--;
                System.out.println("线程一count:" + count);
            }
        }, "t1").start();
        new Thread(() -> {
            // 期望超过 20 退出循环
            while (count < 20) {
                Thread.sleep(200);
                count++;
                System.out.println("线程二count:"+ count);
            }
        }, "t2").start();
    }
}
```

> **与死锁的区别**：
>
> - **死锁**：线程因互相等待资源而完全阻塞，无法执行。
> - **活锁**：线程仍在运行，但无法取得进展。
>
> 活锁可能自行解开（如随机性介入），而死锁必须外部干预

**活锁的解决方法**

1. **引入随机性**：在重试时添加随机休眠时间，打破线程的同步竞争
   - 以太网的指数退避机制是典型应用，通过逐渐增加等待时间减少冲突。
2. **超时机制**：使用`tryLock(long timeout, TimeUnit unit)`设置超时，超时后放弃操作并释放资源，避免无限重试。
3. **调整资源获取顺序**：
   - 通过固定锁的获取顺序（如按哈希值排序），避免循环依赖。
   - 使用公平锁（`ReentrantLock(true)`）按请求顺序分配资源。
4. **分离失败处理**：将失败的消息或操作移至独立队列，避免重复处理。
   - 例如，Kafka消费者通过`max.poll.interval.ms `检测活锁，自动释放分区

#### 饥饿

线程饥饿表现为某个线程因资源被其他线程持续抢占或分配不均，导致长期无法获得处理器时间或关键资源，从而无法执行任务。

***

哲学家就餐问题：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250302205157476-2025-3-220:52:11.png" style="zoom:80%;" />

有五位哲学家，围坐在圆桌旁。

- 他们只做两件事，思考和吃饭

- 哲学家需同时拿起左右两边的筷子才能进餐，餐后放回筷子并继续思考‌

- 若所有哲学家同时拿起左侧筷子，则陷入‌**死锁**‌（每人等待右侧筷子被释放）‌
- 若哲学家在固定时间后放下筷子并重复尝试，形成周期性同步行为‌，可能引发‌**活锁**‌（资源反复被争夺但无实际进展）

筷子类:

```java
class Chopstick {
        String name;
        public Chopstick(String name) {
            this.name = name;
        }
        @Override
        public String toString() {
            return "筷子{" + name + '}';
        }
    }
```

哲学家类：

```java
class Philosopher extends Thread {
        Chopstick left;
        Chopstick right;
        public Philosopher(String name, Chopstick left, Chopstick right) {
            super(name);
            this.left = left;
            this.right = right;
        }
        private void eat() {
            log.debug("eating...");
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        @Override
        public void run() {
            while (true) {
                // 获得左手筷子
                synchronized (left) {
                    // 获得右手筷子
                    synchronized (right) {
                        // 吃饭
                        eat();
                    }
                    // 放下右手筷子
                }
                // 放下左手筷子
            }
        }
    }
}
```

就餐

```java
public static void main(String[] args) throws InterruptedException {
    Chopstick c1 = new Chopstick("1");
    Chopstick c2 = new Chopstick("2");
    Chopstick c3 = new Chopstick("3");
    Chopstick c4 = new Chopstick("4");
    Chopstick c5 = new Chopstick("5");
    new Philosopher("苏格拉底", c1, c2).start();
    new Philosopher("柏拉图", c2, c3).start();
    new Philosopher("亚里士多德", c3, c4).start();
    new Philosopher("赫拉克利特", c4, c5).start();
    new Philosopher("阿基米德", c5, c1).start();
}
```



运行一段时间后陷入死锁：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250302210216049-2025-3-221:02:17.png" style="zoom:80%;" />

***

 **解决方案**

(1) **公平资源分配**

- **使用公平锁**：通过公平锁（如Java的`ReentrantLock(true)`）确保资源按请求顺序分配，避免某些线程被无限延迟。
- **时间片轮转调度**：为线程分配固定时间片，避免单一线程长期占用CPU。

(2) **优化线程优先级与配置**

- **谨慎设置优先级**：避免滥用高优先级，确保低优先级线程仍有执行机会。
- **调整线程池参数**：如增加核心线程数、设置合理超时时间，或使用异步I/O减少阻塞。

(3) **避免资源长期占用**

- **限制临界区执行时间**：避免在持有锁时执行耗时操作（如无限循环或外部阻塞调用），确保及时释放资源。
- **引入超时机制**：为资源请求设置超时，防止线程永久阻塞。

## 3.4、ReentrantLock

[原理分析]()

`ReentrantLock` 是 Java `java.util.concurrent.locks` 包中的 **可重入互斥锁**，提供了比 `synchronized` 更灵活的锁机制。

与`syncrinized`相比：

| **特性**       | **ReentrantLock**                  | **synchronized**                  |
| -------------- | ---------------------------------- | --------------------------------- |
| **锁获取方式** | 显式调用 `lock()` 和 `unlock()`    | 隐式（代码块或方法修饰符）        |
| **可中断性**   | 支持                               | 不支持                            |
| **公平性**     | 支持公平锁与非公平锁（默认非公平） | 仅非公平锁                        |
| **超时机制**   | 支持                               | 不支持                            |
| **条件变量**   | 支持多个 `Condition`               | 单一内置条件队列（`wait/notify`） |
| **锁绑定**     | 需手动释放                         | 自动释放（代码块结束或异常退出）  |

基本语法：

```java
// 获取锁
reentrantLock.lock();
try {
    // 临界区
} finally {
    // 释放锁
    reentrantLock.unlock();
}
```



核心特性：

- 可重入，与`syncronized`一样

- 可中断
- 可以设置超时时间
- 支持公平锁和非公平锁（默认非公平）
- 支持多个条件变量（有多个WaitSet，可以实现更精细的等待/唤醒机制）

### 可重入

可重入是指同一线程可重复获取锁。同一个线程如果首次获得了这把锁，那么因为它是这把锁的拥有者，因此有权利再次获取这把锁

如果是不可重入锁，那么第二次获得锁时，自己也会被锁挡住。

测试：在main线程中，重复获取锁

```java
public class TestReentrantLock {
    private  static ReentrantLock lock = new ReentrantLock();

    public static void main(String[] args) {
        m1();
    }
    
    public static void m1() {
        lock.lock();
        try{
            log.debug("execute m1");
            m2();
        }finally {
            lock.unlock();
        }
    }
    public static void m2() {
        lock.lock();
        try {
            log.debug("execute m2");
            m3();
        }finally {
            lock.unlock();
        }
    }

    public static void m3() {
        lock.lock();
        try{
            log.debug("execute m3");
        }finally {
            lock.unlock();
        }

    }
}
```

结果：

```bash
17:36:52.734 [main] c.TestReentrantLock - execute m1
17:36:52.737 [main] c.TestReentrantLock - execute m2
17:36:52.737 [main] c.TestReentrantLock - execute m3
```



### 可中断

用`lock()`方法加锁时，若没有获取到锁时就会一直阻塞等待下去，**不会响应中断**‌，直至获取锁，后续再处理中断标志‌。

而使用`lockInterruptibly()`方法加锁时，若没有获取到锁，在等待的过程中可以被其他线程调用`interrupt()`方法打断，从阻塞队列中唤醒。

```java
public class TestReentrantLock {
    private  static ReentrantLock lock = new ReentrantLock();
    public static void main(String[] args) throws InterruptedException {
        Thread t1  = new Thread(()->{
            try {
                //如果没有竞争那么此方法就会获取 lock 对象锁
                //如果有竞争就进入阻塞队列，可以被其它线程用interrupt方法打断
                log.debug("尝试获得锁...");
                lock.lockInterruptibly();
            } catch (InterruptedException e) {
                e.printStackTrace();
                log.debug("没有获得锁，返回...");
                return;
            }
            try {
                log.debug("获取到锁");
            }finally {
                lock.unlock();
            }
        },"t1");

        lock.lock();//主线程先获得到锁
        t1.start(); //t1线程运行，获取锁失败，陷入阻塞等待
        sleep(1000);
        log.debug("打断t1");
        t1.interrupt(); //1s后主线程打断 t1线程的等待
    }
}
```

结果:

```bash
17:54:06.817 [t1] c.TestReentrantLock - 尝试获得锁...
17:54:07.825 [main] c.TestReentrantLock - 打断t1
17:54:07.826 [t1] c.TestReentrantLock - 没有获得锁，返回...
java.lang.InterruptedException
	at java.util.concurrent.locks.AbstractQueuedSynchronizer.doAcquireInterruptibly(AbstractQueuedSynchronizer.java:898)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer.acquireInterruptibly(AbstractQueuedSynchronizer.java:1222)
	at java.util.concurrent.locks.ReentrantLock.lockInterruptibly(ReentrantLock.java:335)
	at TestReentrantLock.lambda$main$0(TestReentrantLock.java:24)
	at java.lang.Thread.run(Thread.java:748)
```



### 锁超时

**`lock()`方法‌**

- 采用‌**阻塞式获取锁**‌。若锁被其他线程持有，调用线程会进入等待状态，直至锁释放并被当前线程获取‌。

**`tryLock()`方法**

- **非阻塞尝试获取锁**‌：若锁可用则立即获取并返回`true`；若不可用则直接返回`false`，线程继续执行后续逻辑‌
- **支持超时机制**‌：通过`tryLock(long time, TimeUnit unit)`可在指定时间内尝试获取锁，超时后返回`false`‌
- **响应中断**：在等待期间‌**可响应中断**，抛出`InterruptedException`并终止等待‌。



使用锁超时解决“[哲学家就餐问题](https://catpaws.top/eb9166f8/#饥饿)”，其核心在于：当获得了左筷子而获得右筷子失败时，会放弃当前持有的左筷子，避免了死锁的发生；而`syncronized`在当获得了左筷子而获得右筷子失败时，会阻塞等待右筷子被释放，而且不会释放左筷子。

```java
static class Chopstick extends ReentrantLock{
        String name;
        public Chopstick(String name) {
            this.name = name;
        }
        @Override
        public String toString() {
            return "筷子{" + name + '}';
        }
    }

static class Philosopher extends Thread {
    Chopstick left;
    Chopstick right;
    public Philosopher(String name, Chopstick left, Chopstick right) {
        super(name);
        this.left = left;
        this.right = right;
    }
    private void eat() {
        log.debug("eating...");
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void run() {
        while (true) {
            // 获得左手筷子
            if (left.tryLock()) {
                try {
                    //尝试获得右筷子
                    if (right.tryLock()) {
                        try {
                            eat();
                        }finally {
                            right.unlock();
                        }
                    }
                }finally {
                    //关键，在获得了左筷子，而获得右筷子失败后，会放弃当前持有的左筷子
                    left.unlock();
                }
            }
        }
    }
}

//就餐
public static void main(String[] args) throws InterruptedException {
    Chopstick c1 = new Chopstick("1");
    Chopstick c2 = new Chopstick("2");
    Chopstick c3 = new Chopstick("3");
    Chopstick c4 = new Chopstick("4");
    Chopstick c5 = new Chopstick("5");
    new Philosopher("苏格拉底", c1, c2).start();
    new Philosopher("柏拉图", c2, c3).start();
    new Philosopher("亚里士多德", c3, c4).start();
    new Philosopher("赫拉克利特", c4, c5).start();
    new Philosopher("阿基米德", c5, c1).start();
}
```



### 公平锁

‌**公平锁**‌

线程严格按照‌**申请锁的时间顺序**‌获取锁资源，遵循先到先得原则‌。

- 新请求线程会被插入到等待队列尾部，只有队列为空或轮到当前线程时才能获取锁‌。
- 这样可以避免线程饥饿问题，保证资源分配公平性‌。

‌**非公平锁**‌

允许线程‌**插队竞争锁**‌，新请求线程可直接尝试抢占锁，无需在队列中等待‌。

- 优势：减少线程切换开销，提高吞吐量‌。
- 缺点：可能导致长时间等待的线程无法获取锁（饥饿现象）。

***

ReentrantLock默认是非公平锁，通过构造函数指定`fair=true`时创建公平锁实例‌。

```java
ReentrantLock fairLock = new ReentrantLock(true);  // 启用公平锁

//源码
public ReentrantLock(boolean fair) {
        sync = fair ? new FairSync() : new NonfairSync();
    }
```



测试

```java
public static void main(String[] args) throws InterruptedException {

    // 创建公平锁实例
    ReentrantLock fairLock = new ReentrantLock(true); 

    // 线程任务
    Runnable task = () -> {
        fairLock.lock();
        try {
            System.out.println(Thread.currentThread().getName() + " 获得锁");
        } finally {
            fairLock.unlock();
        }
    };

    // 启动多个线程验证顺序性
    for (int i = 0; i < 5; i++) {
        new Thread(task).start();
    }
}
```

结果

```bash
Thread-0 获得锁
Thread-1 获得锁
Thread-2 获得锁
Thread-3 获得锁
Thread-4 获得锁
```



### 条件变量

synchronized 中也有条件变量，就是Monitor对象的 waitSet (休息室)，当条件不满足时进入 waitSet 等待。

ReentrantLock 的条件变量比 synchronized 强大之处在于，它支持多个条件变量：

- synchronized 是那些不满足条件的线程都在一间休息室等消息。

-  ReentrantLock 支持多间休息室，有专门等烟的休息室、专门等早餐的休息室、唤醒时也是按休息室来唤醒。

  在ReentrantLock中，条件变量通过`Condition`接口实现，需显式调用`lock.newCondition()`方法创建条件变量，每个`Condition`对象对应独立的等待队列‌。这样可为不同业务逻辑创建多个`Condition`，实现更精准的线程唤醒‌。

使用流程

- 调用对应 Condition对象的`await()`方法，释放锁，进入该条件变量对应的等待队列。
- await 的线程被唤醒（`signal()`/`signalAll()`）、或打断、或超时后，需重新竞争 lock 锁
- 竞争 lock 锁成功后，从 await 方法后继续执行

注：与`synchronized`一样，调用方法进入等待队列，以及其他线程唤醒等待中的线程，**都必须要先获取到锁**。



```java
static ReentrantLock lock = new ReentrantLock();
static Condition waitCigaretteQueue = lock.newCondition(); //等待烟的队列
static Condition waitBreakfastQueue = lock.newCondition(); //等待外卖的队列
static volatile boolean hasCigarette = false;
static volatile boolean hasBreakfast = false;

public static void main(String[] args) throws InterruptedException {
    //老王在等烟，没烟干不了活
    new Thread(()->{
        lock.lock();
        log.debug("有烟吗？{}",hasCigarette);
        try {
            while (!hasCigarette) {
                log.debug("没烟，歇会...");
                try {
                    waitCigaretteQueue.await();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            log.debug("烟到了，开始干活....");
        }finally {
            lock.unlock();
        }
    },"老王").start();

    //小王在等饭，快饿死了，没饭干不了活
    new Thread(()->{
        lock.lock();
        log.debug("饭到了吗？{}",hasBreakfast);
        try {
            while (!hasBreakfast) {
                log.debug("没饭吃干不了，歇会...");
                try {
                    waitBreakfastQueue.await();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            log.debug("吃饱了，继续干活");
        }finally {
            lock.unlock();
        }
    },"小王").start();

    Thread.sleep(1000); //1s后送烟的来了
    new Thread(()->{
        lock.lock();
        try{
            hasCigarette = true;
            waitCigaretteQueue.signal();
        }finally {
            lock.unlock();
        }
    },"送烟的").start();

    Thread.sleep(1000); //再1s后送饭的来了
    new Thread(()->{
        lock.lock();
        try{
            hasBreakfast = true;
            waitBreakfastQueue.signal();
        }finally {
            lock.unlock();
        }
    },"送外卖的").start();
}
```

输出：

```bash
21:50:19.187 [老王]  - 有烟吗？false
21:50:19.191 [老王]  - 没烟，歇会...
21:50:19.191 [小王]  - 饭到了吗？false
21:50:19.191 [小王]  - 没饭吃干不了，歇会...
21:50:20.195 [老王]  - 烟到了，开始干活....
21:50:21.208 [小王]  - 吃饱了，继续干活
```




## 3.5、wait-notify

wait-notify是 Java 多线程中用于实现 **线程间协作** 的核心机制，基于 `Object` 类提供的 `wait()`、`notify()` 和 `notifyAll()` 方法。**它允许线程在特定条件未满足时主动释放锁并进入等待状态，当条件满足时由其他线程唤醒。**



### 原理分析

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250228180939106-2025-2-2818:09:40.png" style="zoom:80%;" />

- Owner 线程发现条件不满足，调用 wait 方法，即可进入 WaitSet 变为 WAITING 状态，并释放锁。
- WAITING 线程会在 Owner 线程调用 notify 或 notifyAll 时唤醒，但唤醒后并不意味者立刻获得锁，仍需进入EntryList 重新竞争


### 基本使用

- `wait()/wait(long time)`：
  当前线程释放对象锁，进入 `WAITING` 或 `TIMED_WAITING` 状态，直到其他线程调用 `notify()`/`notifyAll()` 或超时。
- `notify()`：
  **随机唤醒**一个在该对象上等待的线程，被唤醒的线程需竞争锁后才能继续执行。
- `notifyAll()`：
  **唤醒所有**在该对象上等待的线程，所有线程竞争锁，最终只有一个线程能继续执行。

***

注意：

- `wait()`、`notify()`、`notifyAll()` 必须在 `synchronized` 代码块内使用，即只有获得了锁对象才能执行这些方法。

- `notify()`和`notifyAll()`都会出现**虚假唤醒**问题，即唤醒的线程所等待条件并未满足。为了避免虚假唤醒的问题，对所等待条件是否满足的判断应放在`while`循环中，被错误唤醒后判断条件并未满足后，进入下一轮wait。

  ```java
  //wati-notify的正确使用
  
  synchronized (lock) {
      while (条件不成立) {
          lock.wait();
      }
      // 干活
      ...
  }
  
  //另一个线程
  synchronized (lock) {
      lock.notifyAll();
  }
  ```

  

`wait()`和`sleep()`对比 ：

* 原理不同：sleep() 方法是属于 Thread 类，是线程用来控制自身流程的，使此线程暂停执行一段时间而把执行机会让给其他线程；wait() 方法属于 Object 类，用于线程间通信
* 对**锁的处理机制**不同：调用 sleep() 方法的过程中，线程不会释放对象锁；当调用 wait() 方法的时候，线程会放弃对象锁，进入等待此对象的wait set，但是都会释放 CPU
* 使用区域不同：wait() 方法必须放在**同步控制方法和同步代码块（先获取锁）**中使用，sleep() 方法则可以放在任何地方使用

***

### 使用wait-notify作进程间通信

[同步模式之保护性暂停](https://catpaws.top/12dbc0cd/#同步模式之保护性暂停)

[异步模式之生产者/消费者](https://catpaws.top/12dbc0cd/#异步模式之生产者消费者)

## 3.6、park & unpark

Java中的`park()`和`unpark()`是`LockSupport`类提供的线程阻塞与唤醒机制，其核心原理基于 **许可（Permit）** 模型。

- **park()** ：使当前线程进入阻塞状态，直到其他线程调用`unpark()`方法唤醒它。如果当前线程已经持有许可，则会立即返回；否则，线程会被阻塞。
- **unpark()** ：唤醒一个或多个被阻塞的线程。被唤醒的线程将尝试获取许可并继续执行。

这两个方法的核心思想是通过“许可”机制来控制线程的阻塞和唤醒，避免了死锁问题的发生。

```java
public static void main(String[] args) {
    Thread t1 = new Thread(() -> {
        System.out.println("start...");	//1
		Thread.sleep(1000);// Thread.sleep(3000)
        // 先 park 再 unpark 和先 unpark 再 park 效果一样，都会直接恢复线程的运行
        System.out.println("park...");	//2
        LockSupport.park();
        System.out.println("resume...");//4
    },"t1");
    t1.start();
    
   	Thread.sleep(2000);
    System.out.println("unpark...");	//3
    LockSupport.unpark(t1);
}
```

#### 特点

- 顺序无关性

  `unpark()`可先于`park()`调用，此时线程不会阻塞，直接继续执行。这是通过 **计数器（`_counter`）** 实现的：`unpark()`将`_counter`设为1，`park()`检查到`_counter`为1时直接返回，并将计数器重置为0。

- 许可不可叠加

  多次调用`unpark()`不会累积许可，计数器最大值为1。连续两次`unpark()`后调用`park()`只会消耗一次许可。

***

与wait-notify机制对比：

- wait，notify/notifyAll 必须配合 Object Monitor 一起使用，而 park、unpark 不需要这种锁机制。
- park & unpark **以线程为单位**来精确阻塞和唤醒线程，而 notify 只能随机唤醒一个等待线程，notifyAll 是唤醒所有等待线程
- wait 会释放锁资源进入等待队列，**park 不会释放锁资源**，只负责阻塞当前线程，会释放 CPU

#### 原理分析

每个线程关联一个**Parker对象**，包含以下组件：

- **`_counter`**：许可计数器（核心）。
- **`_mutex`**：互斥锁，保护条件变量。
- **`_cond`**：条件变量，用于线程阻塞队列

1、线程调用`park()`时

- 检查`_counter`是否为1：

- 若是，重置为0，线程继续执行。
- 若否，获取`_mutex`锁，进入`_cond`队列等待，同时再将`_counter`重置为0

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250301210903529-2025-3-121:09:04.png" style="zoom:80%;" />

2、线程调用`unpark()`时：

- 设置`_counter`为1。
- 若目标线程在`_cond`队列中等待，则唤醒它，并将`_counter`置为0。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250301210838680-2025-3-121:08:39.png" style="zoom:80%;" />



## 3.7、应用

使用以上同步控制方法，控制线程间的执行顺序

[同步模式之顺序控制](https://catpaws.top/12dbc0cd/#同步模式之顺序控制)

## 3.8、变量的线程安全分析

成员变量和静态变量：

* 如果它们没有共享，则线程安全
* 如果它们被共享了，根据它们的状态是否能够改变，分两种情况：
  * 如果只有读操作，则线程安全
  * 如果有读写操作，则这段代码是临界区，需要考虑线程安全问题

> 静态变量属于类，所有实例共享同一个静态变量。
>
> 如果多个线程共享同一个对象实例，那么访问该实例变量时就需要考虑线程安全。



局部变量：

* 局部变量是线程安全的，每个线程调用方法时，都会在各自的栈帧中创建局部变量的副本。
* 局部变量引用的对象不一定线程安全（逃逸分析）：
  * 如果该对象没有逃离方法的作用范围，它是线程安全的（每一个方法有一个栈帧）
  * 如果该对象逃离方法的作用范围，需要考虑线程安全问题（暴露引用）

***

具体分析

- 成员变量list被多个线程引用时会产生并发安全问题

  ```java
  class ThreadUnsafe {
      ArrayList<String> list = new ArrayList<>();
      public void method1(int loopNumber) {
          for (int i = 0; i < loopNumber; i++) {
              // { 临界区, 会产生竞态条件
              method2();
              method3();
              // } 临界区
          }
      }
      private void method2() {
          list.add("1");
      }
      private void method3() {
          list.remove(0);
      }
  }
  
  // 创建 ThreadUnSafe实例，在多线程中操作成员变量list
  public class test4 {
      static final int THREAD_NUMBER = 2;
      static final int LOOP_NUMBER = 200;
      public static void main(String[] args) {
          ThreadUnsafe test = new ThreadUnsafe();
          //创建THREAD_NUMBER个线程，并发调用method1方法操作成员变量
          for (int i = 0; i < THREAD_NUMBER; i++) {
              new Thread(() -> {
                  test.method1(LOOP_NUMBER);
              }, "Thread" + i).start();
          }
      }
  }
  ```

  分析：如果线程2 还未 add，线程1 remove 就会报错。因为无论哪个线程中的 method2 和 method3 引用的都是同一个对象中的 list 成员变量

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250226000316329-2025-2-2600:03:19.png" style="zoom:80%;" />

  

- 局部变量未发生逃逸，是线程安全的

  ```java
  public static void test1() {
      int i = 10;
      i++;
  }
  ```

  分析：每个线程调用 test1() 方法时，局部变量 i会在每个线程的栈帧内存中被创建多份，因此不存在共享

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250226000613323-2025-2-2600:06:14.png" style="zoom:80%;" />

- 局部变量所引用的是堆内存中的对象实例，尽管引用本身是局部的，但实际指向的对象是共享的

  ```java
  //1、局部变量引用共享对象
  	//多个线程调用 addItem() 时，实际修改的是同一个 sharedList。
  public class SharedObjectExample {
      private static List<String> sharedList = new ArrayList<>(); // 共享对象
  
      public void addItem(String item) {
          List<String> localRef = sharedList; // 局部变量引用共享对象
          localRef.add(item); // 线程不安全操作
      }
  }
  
  //2、方法参数传递共享对象
  	//若不同线程调用 processList() 并传入同一个 List 实例，对 localList 的操作将影响共享的 List。
  public class ParameterExample {
      public void processList(List<String> list) { // 参数可能是共享对象
          List<String> localList = list; // 局部变量引用参数对象
          localList.add("data");
      }
  }
  
  //3、 局部变量“逃逸”到其他线程
    //localMap 是方法内创建的局部变量，但被添加到静态变量 globalCache 中。
   //其他线程可能读取并修改 globalCache 中的 localMap，导致数据不一致。
  public class EscapeExample {
      private static List<Map<String, Object>> globalCache = new ArrayList<>();
  
      public void saveData() {
          Map<String, Object> localMap = new HashMap<>(); // 局部变量引用新对象
          localMap.put("key", "value");
          globalCache.add(localMap); // 对象逃逸到全局缓存
      }
  }
  
  ```

  

***

常见线程安全类：String、Integer、StringBuffer、Random、Vector、Hashtable、java.util.concurrent 包

* 线程安全的是指，多个线程调用它们同一个实例的某个方法时，是线程安全的

  ```java
  Hashtable table = new Hashtable();
  new Thread(()->{
      table.put("key", "value1");
  }).start();
  new Thread(()->{
      table.put("key", "value2");
  }).start();
  ```

* **每个方法是原子的，但多个方法的组合不是原子的**，只能保证调用的方法内部安全：

  ```java
  Hashtable table = new Hashtable();
  // 线程1，线程2
  if(table.get("key") == null) {
  	table.put("key", value);
  }
  ```

无状态类线程安全，就是没有成员变量的类，多个线程不会改变该类对象的状态。

不可变类线程安全：String、Integer 等都是不可变类，**内部的状态不可以改变**，所以方法是线程安全

* replace 等方法底层是新建一个对象，复制过去

  ```java
  Map<String,Object> map = new HashMap<>();	// 线程不安全
  String S1 = "...";							// 线程安全
  final String S2 = "...";					// 线程安全
  Date D1 = new Date();						// 线程不安全
  final Date D2 = new Date();					// 线程不安全，final让D2引用的对象不能变，但对象的内容可以变
  ```

抽象方法如果有参数，被重写后行为不确定可能造成线程不安全，被称之为外星方法：`public abstract foo(Student s);`

# 四、共享模型之内存

## 4.1、Java内存模型

JMM 即 Java Memory Model，它定义了**主内存**（共享内存）、**工作内存**（线程私有）抽象概念，底层对应着 CPU 寄存器、缓存、硬件内存、 CPU 指令优化等。

JMM 定义了**线程如何与主内存及工作内存交互**，确保多线程环境下的**可见性**、**有序性**和**原子性**。

> - 主内存：所有线程共享的内存区域，存储共享变量的原始值。
> - 工作内存：每个线程私有的内存区域，保存该线程使用的变量的副本。
>
> 线程对共享变量的所有操作（读/写）必须通过工作内存完成。不同线程间无法直接访问对方的工作内存。

***

JMM 三大特性：

- 原子性 - 保证指令不会受到线程上下文切换的影响。

- 可见性 - 保证指令不会受 cpu 缓存的影响
- 有序性 - 保证指令不会受 cpu 指令并行优化的影响

> `synchronized` 能够保证原子性、可见性、有序性
>
> `volatile`能够保证可见性、有序性，但**不能保证原子性**

## 4.2、可见性

定义：一个线程修改共享变量后，其他线程能立即看到修改后的值。

先看一个例子：退不出的循环

```java
static boolean run = true;
public static void main(String[] args) throws InterruptedException {
    Thread t = new Thread(()->{
        while(run){
            // ....
        }
    });
    t.start();
    sleep(1);
    run = false; // 线程t不会如预想的停下来
}
```

分析：

1. 初始状态， t 线程刚开始从主内存读取了 run 的值到工作内存。

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250320175153285-2025-3-2017:52:10.png" style="zoom:80%;" />

2. .因为 t 线程要频繁从主内存中读取 run 的值，JIT 编译器会将 run 的值缓存至自己工作内存中的高速缓存中，减少对主存中 run 的访问，提高效率。

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250320175258307-2025-3-2017:52:59.png" style="zoom:80%;" />

3. 1 秒之后，main 线程修改了 run 的值，并同步至主存，而 t 是从自己工作内存中的高速缓存中读取这个变量的值，结果永远是旧值

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250320175322527-2025-3-2017:53:23.png" style="zoom:80%;" />

解决方法：

1. 使用`volatile`关键字：它可以用来修饰成员变量和静态成员变量，**强制**变量读写<u>直接操作主内存</u>。

2. 使用`synchronized` ：加锁前，将**清空工作内存**中共享变量的值，使用共享变量时需要从主内存中重新读取最新的值；线程解锁前，必须把共享变量的最新值**刷新到主内存**中。通过锁的获取与释放隐式插入内存屏障，强制工作内存与主内存同步，保证可见性。

***

可见性 vs 原子性

一个线程对 volatile 变量的修改对另一个线程可见， 不能保证原子性，仅用在一个写线程，多个读线程的情况。比较一下之前我们将线程安全时举的例子：两个线程一个 i++ 一个 i-- ，此时加volatile只能保证看到最新值，不能解决指令交错。

synchronized 语句块既可以保证代码块的原子性，也同时保证代码块内变量的可见性。但缺点是synchronized 是属于重量级操作，性能相对更低。

***

应用：

[使用volatile实现两阶段终止模式](https://catpaws.top/12dbc0cd/#%E4%BD%BF%E7%94%A8%E5%81%9C%E6%AD%A2%E6%A0%87%E8%AE%B0)

[同步模式之Balking](https://catpaws.top/12dbc0cd/#%E5%90%8C%E6%AD%A5%E6%A8%A1%E5%BC%8F%E4%B9%8Bbalking)

## 4.3、有序性

定义：程序执行顺序按照代码的先后顺序执行，允许编译器和处理器优化重排序（指令重排）。

JVM会在**不影响正确性的前提下**，可以调整语句的执行顺序，这种特性称之为『指令重排』，多线程下『指令重排』会影响正确性。

```java
// 可以重排的例子，两个赋值操作哪个先执行都可以 
int a = 10; 
int b = 20; 
System.out.println( a + b );

// 不能重排的例子，必须按代码顺序先后执行赋值操作
int a = 10;
int b = a - 5;
```

> 注：指令重排只会保证串行语义的执行一致性（单线程），但并不会关心多线程间的语义一致性

***

现代处理器和编译器为了提高性能，会对指令进行重排序优化（如乱序执行）。这种优化在单线程下是安全的，但在多线程环境中可能导致逻辑错误。多线程下指令重排的问题：

```java
int num = 0;
// volatile 修饰的变量，可以禁用指令重排
boolean ready = false;

// 线程1 执行此方法
public void actor1(I_Result r) {
    if(ready) {
        r.r1 = num + num;
    }
    else {
        r.r1 = 1;
    }
}
// 线程2 执行此方法
public void actor2(I_Result r) {
    num = 2;
    ready = true;
}
```

在如下代码中，`num`初始化为0，`ready`初始化为false。`I_Result` 是一个对象，有一个属性 r1 用来保存结果。两个线程执行的可能结果有几种？

- 情况1：线程1 先执行，这时 ready = false，所以进入 else 分支结果为 1
- 情况2：线程2 先执行 num = 2，但没来得及执行 ready = true，线程1 执行，还是进入 else 分支，结果为1
- 情况3：线程2 执行到 ready = true，线程1 执行，这回进入 if 分支，结果为 4（因为 num 已经执行过了）

还有一种结果为`0`！，由于`actor2`方法中发生了指令重排，`num = 2 `和`ready = true`的顺序颠倒了。当线程2 执行完 ready = true后，还没来得及执行 num = 2，线程1执行，进入if条件分支，此时num还是初始值0，所以r1的结果为0。

使用压测工具大量测试运行结果如下：在几千万多次的测试结果中，发生了一千多次的指令重排导致的错误。

![](https://gitee.com/cmyk359/img/raw/master/img/image-20250320215018412-2025-3-2021:50:37.png)

***

解决方法：

- `volatile`：volatile 修饰的变量，可以禁用指令重排

- 使用`synchronized`加锁：加了锁之后，只能有一个线程获得到了锁，获得不到锁的线程就要阻塞，所以同一时间只有一个线程执行，相当于单线程，单线程的指令重排是没有问题的

## 4.4、volatile原理

`volatile`关键字在Java中主要有两个作用：**保证变量的可见性**和**禁止指令重排序。**

- 可见性方面，当一个线程修改了一个volatile变量的值，这个新值会立即被刷新到主内存，并且其他线程在读取这个变量时会直接从主内存中获取最新的值，而不是使用工作内存中的旧值。
- 禁止指令重排则是通过**内存屏障**（Memory Barriers）来实现的。

volatile 的底层实现原理是**内存屏障**

- 对 volatile 变量的写指令后会加入写屏障
- 对 volatile 变量的读指令前会加入读屏障

***

注：`volatile`**只能保证可见性和有序性，无法保证原子性**，无法解决指令交错的问题：

- 写屏障仅仅是保证之后的读能够读到最新的结果，但不能保证其他线程的读操作跑到它前面去
- 有序性的保证也只是保证了**本线程内**相关代码不被重排序

### 可见性的保证

- 写屏障（sfence）保证在该**屏障之前的**，对共享变量的改动，都同步到主存当中。

  ready 用volatile修饰，赋值带写屏障，会将num和ready的改到同步到主内存中

  ```java
  public void actor2(I_Result r) {
      num = 2;
      ready = true; //  ready 用volatile修饰， 赋值带写屏障
      // 写屏障
  }
  ```

  

- 读屏障（lfence）保证在该屏障之后，对共享变量的读取，加载的是主存中最新数据。

  ```java
  public void actor1(I_Result r) {
      // 读屏障
      // ready 用volatile修饰 
      if(ready) {
          r.r1 = num + num;
      } else {
          r.r1 = 1;
      }
  }
  ```

  

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250320221236876-2025-3-2022:13:09.png" style="zoom:80%;" />

### 有序性的保证

- 写屏障会确保指令重排序时，**不会将写屏障之前的代码排在写屏障之后**。

  例如，通过用`volatile` 修饰`ready`变量，对它的赋值会添加写屏障，确保指令重排时对num赋值操作，永远在ready赋值操作之前执行，这样就不会出现结果为0的情况。

  ```java
  public void actor2(I_Result r) {
      num = 2;
      ready = true; //  ready 用volatile修饰， 赋值带写屏障
      // 写屏障
  }
  ```

- 读屏障会确保指令重排序时，不会将读屏障之后的代码排在读屏障之前

  ```java
  
  public void actor1(I_Result r) {
      // 读屏障
      // ready 用volatile修饰 ,读取值带读屏障，保证后面对象共享变量都从主内存中读取
      if(ready) {
          r.r1 = num + num;
      } else {
          r.r1 = 1;
      }
  }
  ```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250320221236876-2025-3-2022:13:09.png" style="zoom:80%;" />

### Double-Checked Locking

Double-Checked Locking：双端检锁机制

以著名的 double-checked locking 单例模式为例：

```java
public final class Singleton {
    private Singleton() { }
    private static Singleton INSTANCE = null;
    
    public static Singleton getInstance() {
        if(INSTANCE == null) {
            // 首次访问会同步，而之后的使用没有 synchronized
            synchronized(Singleton.class) {
                if (INSTANCE == null) { 
                    INSTANCE = new Singleton();
                }
            }
        }
        return INSTANCE;
    }
}
```

在该单例模式中，使用了两个`if`条件判断`INSTANCE`是否为null，一个在`synchronized`同步代码块外，一个在里面。

以上的实现特点是：

- 懒惰实例化

- 首次使用` getInstance() `才使用 synchronized 加锁，后续使用时无需加锁

#### 存在的问题

在该单例模式的实现中，有隐含的，但很关键的一点：第一个 if 使用了 INSTANCE 变量，是在同步块之外，可能会发生**指令重排**，在多线程下会出现问题。

`getInstance()` 方法对应的字节码为：

```java
0: 	getstatic 		#2 		// Field INSTANCE:Ltest/Singleton;获取INSTANCE
3: 	ifnonnull 		37		//判断，若不是null，则跳转执行第37条指令
6: 	ldc 			#3 		// class test/Singleton；获取Class对象，加锁
8: 	dup						
9: 	astore_0				//复制一份Class对象的指针，存储起来用于解锁
10: monitorenter			//进入同步代码块，创建Monitor对象执行加锁流程
11: getstatic 		#2 		// Field INSTANCE:Ltest/Singleton; 获取INSTANCE
14: ifnonnull 27			//判断，若不是null，则跳转执行第27条指令（取出类对象，进行解锁）
17: new 			#3 		// class test/Singleton 创建Singleton实例
20: dup						//复制一份
21: invokespecial 	#4 		// Method "<init>":()V  一份用来调用构造方法
24: putstatic 		#2 		// Field INSTANCE:Ltest/Singleton; 一份用来执行赋值操作
27: aload_0
28: monitorexit				//读取之前存储的Class对象，解锁
29: goto 37
32: astore_1				//32 ~ 36发生异常时的解锁操作
33: aload_0
34: monitorexit
35: aload_1
36: athrow
37: getstatic 		#2 		// Field INSTANCE:Ltest/Singleton;获取INSTANCE，返回
40: areturn
```

其中：

- 17 表示创建对象，将对象引用入栈 // new Singleton
- 20 表示复制一份对象引用 // 引用地址

- 21 表示利用一个对象引用，调用构造方法
- 24 表示利用一个对象引用，赋值给 static INSTANCE

由于**步骤 21 和 24 之间不存在数据依赖关系**，而且无论重排前后，程序的执行结果在单线程中并没有改变，因此这种重排优化是允许的。

关键在于 `0: getstatic` 这行代码在 monitor 控制之外，可以越过 monitor 读取INSTANCE 变量的值

在t1线程中，若第21和24条指令发生了重排，先执行了24条指令，给静态变量`INSTANCE`赋了值，此时线程2通过执行第0条指令获取了`INSTANCE`引用，判断不为空，就将这个为实例返回了。而这时 t1 还未完全将构造方法执行完毕，如果在构造方法中要执行很多初始化操作，那么 t2 拿到的是将是一个未初始化完毕的单例。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250320231957500-2025-3-2023:21:58.png" style="zoom:80%;" />

#### 解决方法

对 INSTANCE 使用 volatile 修饰即可，可以禁用指令重排。

```java
public final class Singleton {
    private Singleton() { }
    private static volatile Singleton INSTANCE = null;
    public static Singleton getInstance() {
        // 实例没创建，才会进入内部的 synchronized代码块
        if (INSTANCE == null) {
            synchronized (Singleton.class) { // t2
                // 也许有其它线程已经创建实例，所以再判断一次
                if (INSTANCE == null) { // t1
                    INSTANCE = new Singleton();
                }
            }
        }
        return INSTANCE;
    }
}
```

## 4.5、happens-before规则

**Happens-Before** 是 Java 内存模型（JMM）中定义的一组规则，它规定了**对共享变量的写操作对其它线程的读操作可见**，它是可见性与有序性的一套规则总结。这些规则确保了线程间的操作按预期执行，避免因指令重排序或缓存不一致导致的问题。

Happens-Before 与内存屏障的关系:

- Happens-Before 是 JMM 的抽象规则，用于定义可见性和顺序性。
- 内存屏障 是实现 Happens-Before 的底层机制。



它包含一下规则：

- 程序顺序规则

  同一线程中的每个操作，前一个操作 Happens-Before 后一个操作。

  即：在单线程中，操作 A 的结果对操作 B 可见

  ```java
  int x = 1;      // 操作 A
  int y = x + 2;  // 操作 B（能看到 x=1）
  ```

- 锁规则

  对一个锁的解锁操作 Happens-Before 后续对该锁的加锁操作。

  即：线程A解锁之前对变量的写，对于线程B加锁后对该变量的读可见

  ```java
  // 线程 A
  synchronized (lock) {
      x = 42;  // 写操作
  } // 解锁
  
  // 线程 B
  synchronized (lock) { // 加锁
      System.out.println(x); // 必能看到 x=42
  }
  ```

- volatile 变量规则

  对一个 volatile 变量的写操作 Happens-Before 后续对该变量的读操作。

  即：线程对 volatile 变量的写，对接下来其它线程对该变量的读可见

  ```java
  volatile static int x;
  
  new Thread(()->{
      x = 10;
  },"t1").start();
  
  new Thread(()->{
      System.out.println(x);
  },"t2").start();
  ```

- 线程启动规则

  调用 `Thread.start() `的操作 Happens-Before 新线程中的任何操作。

  即：线程 start 前对变量的写，对该线程开始后对该变量的读可见

  ```java
  static int x;
  
  x = 10;
  new Thread(()->{
      System.out.println(x);//能看到 x=10
  },"t2").start();
  ```

- 线程终止规则

  线程中的所有操作 Happens-Before 其他线程检测到该线程终止。

  即：线程结束前对变量的写，对其它线程得知它结束后的读可见（比如其它线程调用 t1.isAlive() 或 t1.join()等待它结束）

  ```java
  static int x;
  
  Thread t1 = new Thread(()->{
      x = 10;
  },"t1");
  
  t1.start();
  t1.join();
  System.out.println(x);
  ```

- 中断规则

  程调用 interrupt() 的操作 Happens-Before 被中断线程检测到中断.

  即：线程 t1 打断 t2（interrupt）前对变量的写，对于其他线程得知 t2 被打断后对变量的读可见

  ```java
  static int x;
  public static void main(String[] args) {
      Thread t2 = new Thread(()->{
          while(true) {
              if(Thread.currentThread().isInterrupted()) {
                  //得知自己被打断，可以读到t1对x的写
                  System.out.println(x);
                  break;
              }
          }
      },"t2");
      t2.start();//t2先运行
      
      new Thread(()->{
          sleep(1);
          x = 10; //打断前修改x的值
          t2.interrupt();//t1打断t2
      },"t1").start();
      
      while(!t2.isInterrupted()) {//main线程在等待t2被打断
          Thread.yield();
      }
      //得知t2被打断，可以读到t1对x的写
      System.out.println(x);
  }
  ```

- 对象终结规则

  对象的构造函数结束（初始化完成）Happens-Before 该对象的 finalize() 方法被调用。

  ```java
  public class Resource {
      public Resource() {
          // 初始化操作
      }
      
      @Override
      protected void finalize() {
          // 能访问构造函数初始化的所有字段
      }
  }
  ```

- 传递性规则

  如果 x hb-> y 并且 y hb-> z 那么有 x hb-> z

  配合 volatile 的防指令重排，有下面的例子:

  ```java
  volatile static int x;
  static int y;
  
  new Thread(()->{
      y = 10;
      x = 20;
  },"t1").start();
  
  new Thread(()->{
      // x=20 对 t2 可见, 同时 y=10 也对 t2 可见
      System.out.println(x);
  },"t2").start();
  ```

# 五、共享模型之无锁

管程即 monitor 是阻塞式的悲观锁实现并发控制，本章将通过非阻塞式的乐观锁的来实现并发控制。

先看一个使用无锁并发技术，解决多线程下对共享变量访问的并发安全问题的例子，再探究其原理。

```java
interface Account {
    // 获取余额
    Integer getBalance();
    // 取款
    void withdraw(Integer amount);
}

class AccountUnsafe implements Account {
    private Integer balance;
    public AccountUnsafe(Integer balance) {
        this.balance = balance;
    }
    @Override
    public Integer getBalance() {
        return balance; //返回余额
    }
    @Override
    public void withdraw(Integer amount) {
        balance -= amount; //扣减余额
    }
}
```

某账号余额为10000元，创建1000个线程，每个线程从账户中扣减10元

```java
public class test12 {
    public static void main(String[] args) {
        Account account1 = new AccountUnsafe(10000);
        consume(account1);
    }
    
    //方法内会启动 1000 个线程，每个线程从当前账户account 做 -10元的操作，返回最后余额并统计耗时
    static void consume(Account account) {
        List<Thread> ts = new ArrayList<>();
        long start = System.nanoTime();
        for (int i = 0; i < 1000; i++) { //创建1000个线程
            ts.add(new Thread(() -> {
                account.withdraw(10);
            }));
        }
        ts.forEach(Thread::start);//启动这些线程
        ts.forEach(t -> { 
            try {
                t.join();//等待所有线程结束
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
        long end = System.nanoTime();
        System.out.println(account.getBalance()
                + " cost: " + (end-start)/1000_000 + " ms");
    }
}
```

执行结果如下：

```java
190 cost: 162 ms
```

***

分析：余额`balance`是多个线程共同访问的共享变量，在`withdraw`方法中，扣减余额的操作不是一个原子操作，在字节码角度由多条指令构成，在多线程下难免产生指令的交错，出现并发安全问题。

 方法一：可以通过对操作共享变量的方法**加锁**解决：

```java
class AccountUnsafe implements Account {
    private Integer balance;
    public AccountUnsafe(Integer balance) {
        this.balance = balance;
    }
    @Override
    public synchronized Integer getBalance() {
        return balance; //返回余额
    }
    @Override
    public synchronized void withdraw(Integer amount) {
        balance -= amount; //扣减余额
    }
}
//执行结果：0 cost: 117 ms
```

方法二：通过无锁方式解决

```java
class  AccountSafe implements Account{
    private AtomicInteger balance;

    public AccountSafe(Integer balance) {
        this.balance = new AtomicInteger(balance);
    }

    @Override
    public Integer getBalance() {
        return balance.get();
    }

    @Override
    public void withdraw(Integer amount) {
        while (true) {
            // 修改前的余额
            int prev = balance.get();
            //扣减后的余额
            int next = prev - amount;
            //比较并设置
            if (balance.compareAndSet(prev, next)){
                break; //余额扣减成功，返回
            }
        }
    }
}
//执行结果：0 cost: 64 ms
```

## 5.1、CAS

上例中，使用 `AtomicInteger `的解决方法，内部并没有用锁来保护共享变量的线程安全，那么它是如何实现的呢？

`compareAndSet `正是做这个检查，在 set 前，先比较 prev（线程工作内存中） 与balance（主内存中）：

-  不一致了，next 作废，返回 false 表示失败。比如，别的线程已经做了减法，当前的balance值与之前获取的prev不一致，那么本线程的修改就作废了，进入 while 下次循环重试。

- 一致，以 next 设置为新值，返回 true 表示成功。

```java
public void withdraw(Integer amount) {
        while (true) {
            // 修改前的余额
            int prev = balance.get();
            //扣减后的余额
            int next = prev - amount;
            //比较并设置
            if (balance.compareAndSet(prev, next)){
                break; //余额扣减成功，返回
            }
        }
    }
```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250321161419699-2025-3-2116:14:30.png" style="zoom:80%;" />



***

**CAS**（Compare and Swap，比较并交换）是一种 **无锁并发**编程的核心原子操作，用于实现多线程环境下共享变量的安全更新。

其核心思想是“**先比较再更新**”，确保只有在共享变量的当前值与预期值一致时才进行修改。

底层原理：CAS 的底层是 `lock cmpxchg` 指令（X86 架构），该指令在单条指令中完成比较和交换操作，确保不可分割，在单核和多核 CPU 下都能够保证比较交换的原子性。

- 在单核处理器上运行，会省略 LOCK前缀，单处理器自身会维护处理器内的顺序一致性，不需要 lock 前缀的内存屏障效果
- 在多核CPU中，LOCK信号会**锁定总线或缓存行**，确保操作期间其他核心无法访问同一内存地址，保证了多个线程对内存操作的原子性

CAS包含三个操作数：

- 内存地址V：需要更新的变量。
- 预期值A：线程认为变量当前应该具有的值。
- 新值B：要设置的新值。

操作逻辑：

1. 比较内存地址V中的当前值是否等于预期值A。
2. 如果相等，将V的值更新为B。
3. 无论是否更新，返回操作前V的值。

<u>CAS 必须借助 `volatile `才能保证在多个线程中读取到共享变量的最新值来实现【比较并交换】的效果。</u>例如，之前使用过的`AtomicInteger`中保存其数值的`value`使用了`volatile`修饰：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250321165102670-2025-3-2116:51:04.png" style="zoom:80%;" />

***

CAS特点：

- CAS 是基于**乐观**锁的思想（synchronized 是基于悲观锁的思想）
- CAS 体现的是**无锁并发、无阻塞并发**，线程不会陷入阻塞，而是循环尝试更新，直到CAS成功。线程不需要频繁切换状态（上下文切换，系统调用）

存在的问题：

- 高竞争环境下，多线程频繁CAS失败导致大量重试，会消耗CPU资源，此时可以采用**指数退避**策略，失败后随机等待再重试。

- 无锁情况下，因为线程要保持运行，需要额外 CPU 的支持。所以，**使用 CAS 线程数不要超过 CPU 的核心数**，否则虽然不会进入阻塞，但由于没有分到时间片，还是会导致上下文切换。
- 只能保证一个共享变量的原子操作
  - 对于一个共享变量执行操作时，可以通过循环 CAS 的方式来保证原子操作
  - 对于多个共享变量操作时，循环 CAS 就无法保证操作的原子性，这个时候**只能用锁来保证原子性**

- ABA问题：当多个线程修改共享变量时，一个线程可能看到变量的值从A变成B，然后又变回A，这时候CAS操作会误以为变量未被修改过，导致逻辑错误。其根本在于CAS在修改变量的时候，无法记录变量的状态，因此可以为共享变量附加一个 <u>版本号</u>或 <u>时间戳</u>，每次修改递增版本号，CAS 操作需同时校验值和版本号，具体解决方法见[原子引用](https://catpaws.top/eb9166f8/#原子引用)

***

对比CAS与synchronized

* synchronized 基于悲观锁的思想，是从悲观的角度出发：总是假设最坏的情况，每次去拿数据的时候都认为别人会修改，所以每次在拿数据的时候都会上锁，这样别人想拿这个数据就会阻塞（共享资源每次只给一个线程使用，其它线程阻塞，用完后再把资源转让给其它线程），因此 synchronized 也称之为悲观锁，ReentrantLock 也是一种悲观锁，性能较差
* CAS 基于**乐观**锁的思想，是从乐观的角度出发：总是假设最好的情况，每次去拿数据的时候都认为别人不会修改，所以不会上锁，但是在更新的时候会判断一下在此期间别人有没有去更新这个数据。**如果别人修改过，则获取现在最新的值，如果别人没修改过，直接修改共享数据的值**，CAS 这种机制也称之为乐观锁，综合性能较好

## 5.2、Atomic

`java.util.concurrent.atomic`包是 Java 并发编程中用于实现无锁线程安全操作的核心工具包。它通过 **CAS** 机制提供了一系列原子操作类。将它们分为如下五种：

- 原子整数
- 原子引用
- 原子数组
- 字段更新器
- 原子累加器

### 原子整数

用于对基本数据类型进行原子操作，支持 int、long、boolean。对应三个原子操作类：

- `AtomicBoolean`，[API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/concurrent/atomic/AtomicBoolean.html)

- `AtomicInteger`，[API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/concurrent/atomic/AtomicInteger.html)

- `AtomicLong`，[API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/concurrent/atomic/AtomicLong.html)

上面三个类提供的方法几乎相同，所以主要学习`AtomicInteger`的使用。

- 设置新值，并返回旧值

  ```java
  AtomicInteger i = new AtomicInteger(20);
  //设置新值，并返回旧值
  i.getAndSet(100);//返回20， i = 100
  ```

- 自增/自减操作

  ```java
  AtomicInteger i = new AtomicInteger(0);
  //获取并自增，类似于 i++
  i.getAndIncrement(); //返回 0, i = 1
  //自增并获取，类似于 ++i
  i.incrementAndGet(); //返回 2, i = 2
  // 获取并自减，类似于 i--
  i.getAndDecrement(); // 返回 2, i = 1
  //自减并获取，类似于 --i
  i.decrementAndGet(); //返回 0, i = 0
  ```

- 获取并加值

  ```java
  AtomicInteger i = new AtomicInteger(0);
  //获取并加值
  i.getAndAdd(5); // 返回 0，i = 5
  //加值并获取
  i.addAndGet(2);// 返回 7， i = 7 
  ```

- 获取并更新（通过函数式接口自定义运算逻辑，支持更复杂的运算）

  ```java
  AtomicInteger i = new AtomicInteger(0);
  //获取并更新
  i.getAndUpdate(val -> val + 2);//返回0， i = 2
  //更新并获取
  i.updateAndGet(val -> val * 3);//返回6， i = 6
  ```

  查看`getAndUpdate`源码:

  ```java
  public final int getAndUpdate(IntUnaryOperator updateFunction) {
      int prev, next;
      do {
          prev = get(); //获取最新值
          next = updateFunction.applyAsInt(prev); //调用函数处理prev，得到结果next
      } while (!compareAndSet(prev, next)); //使用compareAndSet方法执行CAS操作
      return prev; 
  }
  
  //函数式接口IntUnaryOperator，其中只有一个方法applyAsInt，重写该方法自定义操作逻辑
  @FunctionalInterface
  public interface IntUnaryOperator {
  
      /**
       * Applies this operator to the given operand.
       *
       * @param operand the operand
       * @return the operator result
       */
      int applyAsInt(int operand);
      ....
  }
  ```

### 原子引用

原子引用类：

- `AtomicReference`：引用类型原子类，提供了对单个**对象引用**的原子操作
- `AtomicStampedReference`：原子更新带有**版本号**的引用类型
- `AtomicMarkableReference`：原子更新带有**标记**的引用类型。

基本原子类只能处理单一的基本类型，而原子引用类可以处理**任何对象**，更加灵活。

此外，AtomicStampedReference提供了额外的版本控制，让CAS操作能够感知到外部对共享变量的修改，这是基本原子类不具备的。

> 注意，它们只能确保对 **对象引用** 的<u>更新</u>是原子的，但 **无法保证 对象内部操作的线程安全**。例如，将 `ArrayList` 对象用 `AtomicReference` 封装后，若线程通过 **整体替换** 列表引用来更新数据，则可以保证替换操作的原子性。若线程直接操作 `ArrayList` 的内部方法（如 `add`、`remove`），则无法避免并发问题。

***

`AtomicReference`：[API参考文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/concurrent/atomic/AtomicReference.html)

```java
AtomicReference<String> atomicReference = new AtomicReference<>("Initial");

// 获取当前值
System.out.println("Current Value: " + atomicReference.get());

// 设置新值，并返回旧值
atomicReference.getAndSet("Updated");
System.out.println("Updated Value: " + atomicReference.get());

//获取并修改
atomicReference.getAndUpdate( str -> str.substring(0, 2));

// CAS 操作
boolean isUpdated = atomicReference.compareAndSet("Updated", "Final");
System.out.println("Was CAS successful? " + isUpdated);
System.out.println("Current Value: " + atomicReference.get());
}
```



***

`AtomicStampedReference` : [API参考文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/concurrent/atomic/AtomicStampedReference.html)

构造器

```java
//创建时指定初始值和初始版本号
AtomicStampedReference (V initialRef, int initialStamp) 
```



ABA问题：当多个线程修改共享变量时，线程1可能看到变量的值从A变成B，然后又变回A，这时候线程1的CAS操作会误以为变量未被修改过，导致逻辑错误。尽管能CAS 成功，但线程1的修改可能基于一个已过期的上下文，若变量变化隐含其他状态（如链表节点的指针变化），可能导致数据结构损坏。

出现该问题的根本在于**CAS在修改变量的时候，无法记录变量的状态**，因此可以为共享变量附加一个 <u>版本号</u>，每次修改递增版本号，CAS 操作需同时校验值和版本号。

而`AtomicStampedReference`就是带**版本号**的原子引用操作，创建该对象引用时需要指定起始版本号，在后续执行CAS 操作需同时校验值和版本号，操作成功后版本号+1。

```java
public class ABASolution {
    //初始版本号设置为 0
    static AtomicStampedReference<String> ref = new AtomicStampedReference<>("A",0);
    public static void main(String[] args)  {
        log.debug("main start...");

        String prev = ref.getReference();// 获取值 A
        int stamp = ref.getStamp(); //获取当前版本号 0

        other();

        try {
            Thread.sleep(1000); //休眠1s，模拟业务处理过程
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // 尝试改为 C
        /**
         * 在此期间线程t1将字符串从A改为B，线程t2又将字符串从B改为A，
         * 虽然字符串的值与prev相同，但版本号已经从0变为2，CAS操作失败
         */
        log.debug("change A->C {}", ref.compareAndSet(prev,"C",stamp,stamp + 1));
    }

    private static void other() {
        new Thread(() -> {
            String prev = ref.getReference();// A
            int stamp = ref.getStamp(); // 0
            log.debug("change A->B {}", ref.compareAndSet(prev, "B",stamp, stamp +  1));
        }, "t1").start();//CAS成功，字符串：A -> B , 版本号：0 -> 1

        try {
            Thread.sleep(500);//间隔0.5s
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        new Thread(() -> {
            String prev = ref.getReference();//  B
            int stamp = ref.getStamp(); // 1
            log.debug("change B->A {}", ref.compareAndSet(prev, "A",stamp, stamp + 1));
        }, "t2").start();//CAS成功，字符串：B -> C , 版本号：1 -> 2
    }
}
```

运行结果：

```java
20:31:39.447 [main] c.test14 - main start...
20:31:39.489 [t1] c.test14 - change A->B true
20:31:39.992 [t2] c.test14 - change B->A true
20:31:40.998 [main] c.test14 - change A->C false
```



***

`AtomicMarkableReference`：[API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/concurrent/atomic/AtomicMarkableReference.html)

构造函数：

```java
//创建时指定初始值和初始标记
AtomicMarkableReference(V initialRef, boolean initialMark)
```

如果只关心**是否有线程对共享变量修改过** ，并不关心该变量更改了几次，此时可以使用`AtomicMarkableReference `原子类。

例子：有一个住户和清洁工人。清洁工人会定期清理住户垃圾袋中的垃圾。若住户过了段时间发现垃圾袋中的垃圾被清洁工人处理掉了，则不做处理；否则换上新的垃圾袋（住户执行CAS操作时判断垃圾袋这个共享变量有没有被清洁工人修改过）

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250321205704284-2025-3-2120:57:11.png" style="zoom:80%;" />



```java
public static void main(String[] args) throws InterruptedException {
    GarbageBag garbageBag = new GarbageBag("装满了垃圾");
    //创建原子操作对象，指定修改标记为false
    AtomicMarkableReference<GarbageBag> ref = new AtomicMarkableReference<>(garbageBag, false);
    GarbageBag prev = ref.getReference();

    new Thread(()->{
        GarbageBag bag = ref.getReference();
        boolean marked = ref.isMarked();
        //清洁工人更换了垃圾袋，将修改标记设置为true
        while(!ref.compareAndSet(bag,new GarbageBag("空的垃圾袋"),marked, true)){}
    },"cleaner").start();

    Thread.sleep(1000);
    log.debug("住户尝试自己更换垃圾袋---->");
    //用户尝试更换垃圾袋，判断修改表示是否为false，吃饭标记为true，CAS操作失败
    boolean isSuccess = ref.compareAndSet(prev, new GarbageBag("空的垃圾袋"), false, true);
    if (isSuccess == true) {
        log.debug("住户自己更换了垃圾袋");
    } else {
        log.debug("清洁工人已经更换了垃圾袋");
    }
}

//垃圾袋类
class GarbageBag {
    String desc;
    public GarbageBag(String desc) {
        this.desc = desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }
}
```



### 原子数组

原子数组类是为 **多线程环境下对数组元素进行原子操作** 而设计的高效工具，支持对数组中的某个索引位置进行原子操作，每个数组元素的原子操作相互独立，避免全局锁竞争。

原子数组类：

- `AtomicIntegerArray`：整形数组原子类,[API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/concurrent/atomic/AtomicIntegerArray.html)
- `AtomicLongArray`：长整形数组原子类，[API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/concurrent/atomic/AtomicLongArray.html)
- `AtomicReferenceArray` ：引用类型数组原子类，[API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/concurrent/atomic/AtomicReferenceArray.html)

上面三个类提供的方法几乎相同，以 `AtomicIntegerArray `为例子来介绍：

```java
public class AtomicArrayTest {
    public static void main(String[] args) {
        //传入普通数组
        demo(
            () -> new int[10],
            (array) -> array.length,
            (array, index) -> array[index]++, //每个元素从0开始自增到10000
            (array) -> System.out.println(Arrays.toString(array))
        );
        //结果为：[8055, 8028, 8032, 8034, 8052, 8093, 8069, 8008, 8009, 8043]

        //传入原子数组
        demo(
            () -> new AtomicIntegerArray(10),
            (array) -> array.length(),
            (array, index) -> array.getAndIncrement(index),//每个元素从0开始自增到10000
            (array) -> System.out.println(array)
        );
        //结果为：[10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000]
    }

    //传入一个数组，在参数中传入它出处理方式
    private static <T> void demo(
        Supplier<T> arraySupplier,
        Function<T, Integer> lengthFun,
        BiConsumer<T, Integer> putConsumer,
        Consumer<T> printConsumer) {
        ArrayList<Thread> ts = new ArrayList<>(); // 创建集合
        T array = arraySupplier.get(); // 获取数组
        int length = lengthFun.apply(array); // 获取数组的长度
        //为数组每个下标的元素创建一个线程，处理该位置的元素10000次
        for(int i = 0; i < length; i++) {
            ts.add(new Thread(() -> {
                for (int j = 0; j < 10000; j++) {
                    putConsumer.accept(array, j % length);
                }
            }));
        }
        ts.forEach(Thread::start);
        ts.forEach((thread) -> {
            try {
                thread.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
        printConsumer.accept(array);
    }
}

```



### 字段更新器

原子更新器类：

- `AtomicReferenceFieldUpdater`：用于引用类型的属性更新，[API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/concurrent/atomic/AtomicReferenceFieldUpdater.html)
- `AtomicIntegerFieldUpdater`：用于Integer类的属性更新，[API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/concurrent/atomic/AtomicIntegerFieldUpdater.html)
- `AtomicLongFieldUpdater`：用于Long类型的属性更新，[API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/concurrent/atomic/AtomicLongFieldUpdater.html)

利用字段更新器，可以针对对象的某个域（Field）进行原子操作，只能配合 volatile 修饰的字段使用，否则会出现异常:

```java
java.lang.IllegalArgumentException: Must be volatile typ
```



### 原子累加器

原子累加器（如 `LongAdder`、`DoubleAdder` 和 `LongAccumulator`）是 Java 并发包 java.util.concurrent.atomic 中设计用于 **高并发写操作** 的高性能工具。相比传统的 AtomicLong 或 AtomicInteger，它们通过 **分散竞争** 的策略显著提升了多线程环境下的吞吐量，特别适用于统计计数、实时监控等场景。

#### 优化机制

CAS 底层是在一个循环中不断地尝试修改目标值，直到修改成功。在高竞争环境下，多线程频繁CAS失败导致大量重试，会消耗CPU性能。

优化思路：**将单一共享变量的更新压力分摊到多个单元**（cells），减少线程冲突。就是当检测到有竞争时，创建 cell 数组，设置多个累加单元。Thread-0 累加 Cell[0]，而 Thread-1 累加Cell[1]... 最后读取结果时合并所有分散值，保证最终结果准确。这样它们在累加时操作的不同的 Cell 变量，因此减少了 CAS 重试失败，从而提高性能。

***

以LongAdder为例：[API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/concurrent/atomic/LongAdder.html)

`LongAdder `类有几个关键域：

```java
// 累加单元数组, 懒惰初始化
transient volatile Cell[] cells;
// 基础值, 如果没有竞争, 则用 cas 累加base这个域
transient volatile long base;
// 在 cells 创建或扩容时, 置为 1, 表示加锁（只由一个线程完成即可）
transient volatile int cellsBusy;
```

工作流程如下：

- 无竞争时：直接通过 CAS 更新 base 值。
- 检测到竞争：初始化 cells 数组，线程通过哈希算法映射到不同 cell 进行更新。
- 读取总值：调用 sum() 时，将 base 与所有 cells 的值累加。



#### 伪共享

Cell 即为累加单元

```java
// 防止缓存行伪共享
@sun.misc.Contended
static final class Cell {
    volatile long value;
    Cell(long x) { value = x; }

    // 最重要的方法, 用来 cas 方式进行累加, prev 表示旧值, next 表示新值
    final boolean cas(long prev, long next) {
        return UNSAFE.compareAndSwapLong(this, valueOffset, prev, next);
    }
    // 省略不重要代码
}
```



计算机中，为了平衡cpu和内存之间速度的差异，cpu中添加了多级缓存，一级和二级缓存是每个cpu核心独有的，三级缓存时多个cpu核心间共享的。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250321225200812-2025-3-2122:52:03.png" style="zoom:80%;" />

根据程序、数据的时间和空间局部性原理，cpu将数据读入缓存，直接操作缓存中的数据提高效率。CPU 从内存中读取数据时，会以**缓存行**为单位加载到缓存中。缓存行是CPU 缓存的最小数据单元，每个缓存行对应着一块内存（通常为 **64 字节**）。

缓存的加入会造成数据副本的产生，即同一份数据会缓存在不同核心的缓存行中。CPU 要保证数据的一致性，如果某个 CPU 核心更改了数据，其它 CPU 核心对应的整个缓存行必须失效，再次使用该数据时，必须重新从内存将最新数据加载到缓存中。

Cell 是数组形式，**在内存中是连续存储的**，64 位系统中，一个 Cell 为 24 字节（16 字节的对象头和 8 字节的 value），每一个 缓存行 为 64 字节，因此缓存行可以存下 2 个的 Cell 对象，当 Core-0 要修改 Cell[0]、Core-1 要修改 Cell[1]，无论谁修改成功都会导致对方当前缓存行数据失效，需要重新去主存获取，影响效率。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250321230429842-2025-3-2123:04:32.png" style="zoom:80%;" />



`@sun.misc.Contended` 用来解决这个问题，它的原理是在使用此注解的对象或字段的前后各增加 128 字节大小的padding，从而让 CPU 将对象预读至缓存时**占用不同的缓存行**，这样，不会造成对方缓存行的失效

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250321230539070-2025-3-2123:05:41.png" style="zoom:80%;" />

#### 源码分析

[参考视频](https://www.bilibili.com/video/BV16J411h7Rd?spm_id_from=333.788.videopod.episodes&vd_source=51d78ede0a0127d1839d6abf9204d1ee&p=179)

## 5.3、Unsafe

Unsafe 类是 Java 中的一个底层工具类，位于 sun.misc 包中，提供直接操作内存、执行底层硬件原子操作和绕过 Java 安全限制的能力。尽管功能强大，但因绕过 Java 安全机制，官方不推荐在常规开发中使用，主要用于高性能框架（如 Netty、Disruptor）和 JVM 内部实现。

### 获取unsafe对象

Unsafe 对象不能直接调用，只能通过反射获得

```java
public class UnsafeAccessor {
    static Unsafe unsafe;
    static {
        try {
            Field theUnsafe = Unsafe.class.getDeclaredField("theUnsafe");
            theUnsafe.setAccessible(true);
            unsafe = (Unsafe) theUnsafe.get(null);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new Error(e);
        }
    }
    static Unsafe getUnsafe() {
        return unsafe;
    }
}
```

### CAS相关方法

使用unsafe对象，获取指定对象字段在内存中的偏移量，使用CAS操作修改字段值

CAS方法主要为三个：

- `compareAndSwapInt(obj, offset, expect, update)`
- `compareAndSwapLong(obj, offset, expect, update)`
- `compareAndSwapObject(obj, offset, expect, update)`

```java
@Data
class Student {
 volatile int id;
 volatile String name;
}

public class TestUnsafe {
    public static void main(String[] args) throws NoSuchFieldException {
        //获取Unsafe对象
        Unsafe unsafe = UnsafeAccessor.getUnsafe();
        
        Field id = Student.class.getDeclaredField("id");
        Field name = Student.class.getDeclaredField("name");

        //获得成员变量的偏移量
        long idOffset = unsafe.objectFieldOffset(id);
        long nameOffset = unsafe.objectFieldOffset(name);

        // 使用 cas 方法替换成员变量的值
        Student student = new Student();
        unsafe.compareAndSwapInt(student,idOffset, 0, 1);
        unsafe.compareAndSwapObject(student, nameOffset, null, "张三");

        System.out.println(student);
    }
}

//输出：Student(id=1, name=张三)
```

# 六、共享模型之不可变

不可变类是指其实例在创建后 **状态（数据）不可被修改** 的类。Java 中常见的不可变类包括 String、包装类（如 Integer、Long）、BigDecimal 等。它们具有天然线程安全的特性，无需同步机制即可在多线程环境中安全使用。可以被缓存、重用，无需担心副作用。

> 需要注意的是，此处所说的线程安全是指它们的单个方法是线程安全的，但是多个线程安全方法的组合未必是线程安全的。

无状态：成员变量保存的数据也可以称为状态信息，无状态就是没有成员变量

Servlet 为了保证其线程安全，一般不为 Servlet 设置成员变量，这种没有任何成员变量的类是线程安全的

## 5.1、不可变对象的使用

以日期转化为例，当使用`SimpleDateFormat`进行日期转化时，由于其内部状态可变，在多线程环境下有很大几率出现 java.lang.NumberFormatException 或者出现不正确的日期解析结果。

```java
SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
for (int i = 0; i < 10; i++) {
    new Thread(() -> {
        //此处加锁解决并发安全问题
        try {
            log.debug("{}", sdf.parse("1951-04-21"));
        } catch (Exception e) {
            log.error("{}", e);
        }
    }).start();
}
```

当然可以通过synchronized加锁解决并发安全问题，但锁机制会带来性能上的损耗。在 Java 8 后，提供了一个新的日期格式化类：DateTimeFormatter，它是一个不可变类，不存在并发修改问题，是线程安全的。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250325095820719-2025-3-2509:58:34.png" style="zoom:80%;" />

```java
DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyy-MM-dd");
SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
for (int i = 0; i < 10; i++) {
    new Thread(() -> {
        try {
            log.debug("{}", dtf.parse("1951-04-21"));
        } catch (Exception e) {
            log.error("{}", e);
        }
    }).start();
}
//输出结果正确
10:00:50.899 [Thread-0] c.test17 - {},ISO resolved to 1951-04-21
10:00:50.899 [Thread-8] c.test17 - {},ISO resolved to 1951-04-21
10:00:50.899 [Thread-4] c.test17 - {},ISO resolved to 1951-04-21
10:00:50.899 [Thread-9] c.test17 - {},ISO resolved to 1951-04-21
10:00:50.899 [Thread-3] c.test17 - {},ISO resolved to 1951-04-21
10:00:50.899 [Thread-2] c.test17 - {},ISO resolved to 1951-04-21
10:00:50.899 [Thread-5] c.test17 - {},ISO resolved to 1951-04-21
10:00:50.899 [Thread-1] c.test17 - {},ISO resolved to 1951-04-21
10:00:50.899 [Thread-7] c.test17 - {},ISO resolved to 1951-04-21
10:00:50.899 [Thread-6] c.test17 - {},ISO resolved to 1951-04-21
```



## 5.2、不可变对象的设计

参考Java中`String`类的设计，分析不可变类的设计原则：

- **声明类为 `final`**，防止子类通过重写方法修改状态，破坏不可变性。

  ```java
  public final class String
      implements java.io.Serializable, Comparable<String>, CharSequence {....}
  ```

- **所有字段声明为 `private final`**，确保字段只能在构造器中初始化，且外部无法直接访问。

  ```java
  /** The value is used for character storage. */
  private final char value[]; //使用char数组保存字符串
  
  /** Cache the hash code for the string */
  private int hash; // Default to 0
  
  /** use serialVersionUID from JDK 1.0.2 for interoperability */
  private static final long serialVersionUID = -6849794470754667710L;
  ```

- **不提供修改状态的方法**，如 setter 方法。

- **防御性拷贝**，通过创建副本对象来避免共享。如对于传入的可变的对象，拷贝一份后再使用，避免与外部共享该可变对象，引起状态的改变。

  ```java
  //使用传入的char数组的拷贝来创建String对象
  public String(char value[]) {
      this.value = Arrays.copyOf(value, value.length);
  }
  ```

  ```java
  //substring截取字符串时，不是在当前字符串上操作，而是从当前字符串中拷贝对应的值，赋给一个新的string对象中的value，再返回这个新对象
  public String substring(int beginIndex) {
      //防御性校验
      if (beginIndex < 0) {
          throw new StringIndexOutOfBoundsException(beginIndex);
      }
      int subLen = value.length - beginIndex;
      if (subLen < 0) {
          throw new StringIndexOutOfBoundsException(subLen);
      }
      //生成一个新的String对象返回
      return (beginIndex == 0) ? this : new String(value, beginIndex, subLen);
  }
  
  //对应的构造函数
  public String(char value[], int offset, int count) {
      if (offset < 0) {
          throw new StringIndexOutOfBoundsException(offset);
      }
      if (count <= 0) {
          if (count < 0) {
              throw new StringIndexOutOfBoundsException(count);
          }
          if (offset <= value.length) {
              this.value = "".value;
              return;
          }
      }
      // Note: offset or count might be near -1>>>1.
      if (offset > value.length - count) {
          throw new StringIndexOutOfBoundsException(offset + count);
      }
      //从当前String中拷贝对应位置的字符串，赋值给新String对象的value
      this.value = Arrays.copyOfRange(value, offset, offset+count);
  }
  ```

  

## 5.3、享元模式

**定义** 英文名称：Flyweight pattern. **当需要重用数量有限的同一类对象时使用**，属于23种设计模式之一。

### 案例

1、**包装类**

在JDK中 Boolean，Byte，Short，Integer，Long，Character 等包装类提供了 valueOf 方法，例如 Long 的valueOf 会缓存 -128~127 之间的 Long 对象，在这个范围之间会重用对象，大于这个范围，才会新建 Long 对象：

```java
public static Long valueOf(long l) {
    final int offset = 128;
    if (l >= -128 && l <= 127) { // will cache
        return LongCache.cache[(int)l + offset];
    }
    return new Long(l);
}

//在LongCache中创建数组提前保存好 -128~127 之间的数字
private static class LongCache {
    private LongCache(){}

    static final Long cache[] = new Long[-(-128) + 127 + 1];

    static {
        for(int i = 0; i < cache.length; i++)
            cache[i] = new Long(i - 128);
    }
}
```

> 注意：
>
> - Byte, Short, Long 缓存的范围都是 -128~127
>
> - Character 缓存的范围是 0~127
>
> - Integer的默认范围是 -128~127
>   - 最小值不能变
>
>   - 但最大值可以通过调整虚拟机参数 ` -Djava.lang.Integer.IntegerCache.high` 来改变
>
> - Boolean 缓存了 TRUE 和 FALSE



***

2、**String串池**

字符串常量池（String Pool / StringTable / 串池）的主要目的是存储字符串字面量，确保相同的字符串只存储一份，从而减少内存使用和提高性能。

[详细内容](https://catpaws.top/f0242a65/#%E5%AD%97%E7%AC%A6%E4%B8%B2%E5%B8%B8%E9%87%8F%E6%B1%A0)



### 自定义连接池

一个线上商城应用，QPS 达到数千，如果每次都重新创建和关闭数据库连接，性能会受到极大影响。 这时预先创建好一批连接，放入连接池。一次请求到达后，从连接池获取连接，使用完毕后再还回连接池，这样既节约了连接的创建和关闭时间，也实现了连接的重用，不至于让庞大的连接数压垮数据库。

```java
public class Pool {
    //1、连接池大小
    private final int poolSize;
    //2、连接对象数组
    private Connection[] connections;
    //3、连接状态数组
    private AtomicIntegerArray states; //使用原子整型数组，防止多个线程同时修改出现并发安全问题

    //4、构造方法初始化
    public Pool(int poolSize) {
        this.poolSize = poolSize;
        this.connections = new Connection[poolSize];
        this.states = new AtomicIntegerArray(new int[poolSize]);
        for (int i = 0; i < poolSize; i++) {
            connections[i] = new MockConnection();
        }
    }

    //5、取连接
    public Connection borrow() {
        while (true) {
            for (int i = 0; i < poolSize; i++) {
                //有空闲连接
                if (states.get(i)== 0 ) {
                    //执行CAS替换
                    if (states.compareAndSet(i,0,1)) {
                        return connections[i];
                    }
                }
            }
            // 如果没有空闲连接，当前线程进入等待
            //CAS循环等待只适合于短时间等待的线程，而数据库连接可能长时间没有空闲，需要释放CPU资源进入等待队列
            synchronized (this) {
                try {
                    this.wait();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }
    
    //6、归还连接
    public void free(Connection conn) {
        for (int i = 0; i < poolSize; i++) {
            //是当前连接池中的连接
            if (connections[i] == conn) {
                states.set(i,0);
                //有空闲连接，唤醒等待的线程
                synchronized (this) {
                    this.notifyAll();
                }
                break;
            }
        }
    }
}
//模拟连接数据库，略
class MockConnection implements Connection{}
```

以上实现没有考虑：

- 连接的动态增长与收缩

- 连接保活（可用性检测）

- 等待超时处理

- 分布式 hash

[Apache Tomcat 数据库连接池源码分析参考](https://houbb.github.io/2020/07/17/dbcp-06-tomcat-pool-02-notes)

## 5.3、final原理

```java
public class TestFinal {
	final int a = 20;
}
```

对应字节码指令：

```java
0: aload_0
1: invokespecial #1 // Method java/lang/Object."<init>":()V
4: aload_0
5: bipush 20		// 将值直接放入栈中
7: putfield #2 		// Field a:I
<-- 写屏障
10: return
```

inal 变量的赋值通过 putfield 指令来完成，在这条指令之后也会加入**写屏障**，保证在其它线程读到它的值时不会出现为 0 的情况

其他线程访问 final 修饰的变量

* **复制一份放入栈中**直接访问，效率高
* 大于 short 最大值会将其复制到类的常量池，访问时从常量池获取



## 5.4、ThreadLocal

ThreadLocal类用来**提供线程内部的局部变量**。这种变量在多线程环境下访问（通过get和set方法访问）时，能保证各个线程的变量相对独立于其他线程内的变量。

ThreadLocal 实例通常来说都是 `private static` 类型的，属于一个线程的本地变量，用于关联线程和线程上下文。每个线程都会在 ThreadLocal 中保存一份该线程独有的数据，所以是线程安全的

作用：

- 线程并发：应用在多线程并发的场景下
- 传递数据：通过 ThreadLocal 实现在同一线程不同函数或组件中**隐式传递数据**（如用户会话信息），避免显式传参。

- 线程隔离：每个线程的变量都是独立的，不会互相影响

***

ThreadLocal与synchronized对比：

虽然ThreadLocal模式与synchronized关键字都用于处理多线程并发访问变量的问题，不过两者处理问题的角度和思路不同。

|        | synchronized                                                 | ThreadLocal                                                  |
| ------ | :----------------------------------------------------------- | ------------------------------------------------------------ |
| 原理   | 同步机制采用**以时间换空间**的方式，只提供了一份变量，让不同的线程排队访问 | ThreadLocal 采用**以空间换时间**的方式，为每个线程都提供了一份变量的副本，从而实现同时访问而相不干扰 |
| 侧重点 | 多个线程之间访问资源的同步                                   | 多线程中让每个线程之间的数据相互隔离，并发度更高             |

### 基本使用

常用方法：

| 方法                       | 描述                         |
| -------------------------- | ---------------------------- |
| ThreadLocal<>()            | 创建 ThreadLocal 对象        |
| protected T initialValue() | 返回当前线程局部变量的初始值 |
| public void set( T value)  | 为当前线程绑定局部变量       |
| public T get()             | 获取当前线程绑定的局部变量   |
| public void remove()       | 移除当前线程绑定的局部变量   |

```java
public class MyDemo {

    private static ThreadLocal<String> tl = new ThreadLocal<>();

    private String content;

    private String getContent() {
        // 获取当前线程绑定的变量
        return tl.get();
    }

    private void setContent(String content) {
        // 变量content绑定到当前线程
        tl.set(content);
    }

    public static void main(String[] args) {
        MyDemo demo = new MyDemo();
        for (int i = 0; i < 5; i++) {
            Thread thread = new Thread(new Runnable() {
                @Override
                public void run() {
                    // 设置数据
                    demo.setContent(Thread.currentThread().getName() + "的数据");
                    System.out.println("-----------------------");
                    System.out.println(Thread.currentThread().getName() + "--->" + demo.getContent());
                }
            });
            thread.setName("线程" + i);
            thread.start();
        }
    }
}
```

***

ThreadLocal 中存储的是线程的局部变量，如果想**实现父子线程间局部变量传递**可以使用InheritableThreadLocal 类

```java
public static void main(String[] args) {
    ThreadLocal<String> threadLocal = new InheritableThreadLocal<>();
    threadLocal.set("父线程设置的值");

    new Thread(() -> System.out.println("子线程输出：" + threadLocal.get())).start();
}
// 子线程输出：父线程设置的值
```



### 应用场景

ThreadLocal 适用于下面两种场景：

- 每个线程需要有自己单独的实例
- 实例需要在多个方法中共享，但不希望被多线程共享

ThreadLocal 方案有两个突出的优势： 

1. 传递数据：保存每个线程绑定的数据，在需要的地方可以直接获取，避免参数直接传递带来的代码耦合问题
2. 线程隔离：各线程之间的数据相互隔离却又具备并发性，避免同步方式带来的性能损失

### 实现原理

#### 底层结构

JDK8 以前：每个 ThreadLocal 都创建一个 Map，然后用线程作为 Map 的 key，要存储的局部变量作为 Map 的 value，达到各个线程的局部变量隔离的效果。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250325152906259-2025-3-2515:29:29.png" style="zoom:80%;" />

JDK8 以后：每个 Thread 维护一个 ThreadLocalMap，这个 Map 的 key 是 ThreadLocal 实例本身，value 是真正要存储的值。

* **每个 Thread 线程内部都有一个 Map (ThreadLocalMap)**
* Map 里面存储 ThreadLocal 对象（key）和线程的私有变量（value）
* Thread 内部的 Map 是由 ThreadLocal 维护的，由 ThreadLocal 负责向 map 获取和设置线程的变量值
* 对于不同的线程，每次获取副本值时，都从自己的Map中取值，别的线程并不能获取到当前线程的副本值，形成副本的隔离，互不干扰

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250325153058564-2025-3-2515:31:00.png" style="zoom:80%;" />

结构改进的好处：

- 每个 Map 存储的 Entry 数量会变少，因为之前的存储数量由 Thread 的数量决定，现在由 ThreadLocal 的数量决定，在实际编程当中，往往 ThreadLocal 的数量要少于 Thread 的数量
- 当 Thread 销毁之后，对应的 ThreadLocalMap 也会随之销毁，能减少内存的使用，**防止内存泄露**



#### 成员变量

- **每一个线程持有一个 ThreadLocalMap 对象**，存放由 ThreadLocal 和数据组成的 Entry 键值对

  ```java
  ThreadLocal.ThreadLocalMap threadLocals = null
  ```

- 计算 ThreadLocal 对象的哈希值：

  ```java
  private final int threadLocalHashCode = nextHashCode();
  ```

  使用 `threadLocalHashCode & (table.length - 1)` 计算当前 entry 需要存放的位置

- 每创建一个 ThreadLocal 对象就会使用 nextHashCode 分配一个 hash 值给这个对象：

  ```java
  private static AtomicInteger nextHashCode = new AtomicInteger();
  ```

- 斐波那契数也叫黄金分割数，hash 的**增量**就是这个数字，带来的好处是 hash 分布非常均匀：

  ```java
  private static final int HASH_INCREMENT = 0x61c88647;
  ```

  

***



#### 核心方法

initialValue()：返回该线程局部变量的初始值

- 延迟调用的方法，在set方法还未调用而先调用了get方法时才执行，并且仅执行1次。
- 该方法缺省（默认）实现直接返回一个 null
- 如果想要一个初始值，可以重写此方法， 该方法是一个 `protected` 的方法，为了让子类覆盖而设计的

```java
protected T initialValue() {
    return null;
}
```

***

set方法：为当前线程绑定局部变量

```java
public void set(T value) {
    //获取当前线程
    Thread t = Thread.currentThread();
    //获取该对象的ThreadLocalMap
    ThreadLocalMap map = getMap(t);
    if (map != null)
        //如果不为空，以当前ThreadLocal对象为key，存储value
        map.set(this, value);
    else
        //如果为空，则创建map并存储value
        createMap(t, value);
}

ThreadLocalMap getMap(Thread t) {
    return t.threadLocals;
}
void createMap(Thread t, T firstValue) {
    //这里的 this 是调用此方法的 threadLocal
    t.threadLocals = new ThreadLocalMap(this, firstValue);
}
```

***

get方法：

```java
public T get() {
    //获取当前线程
    Thread t = Thread.currentThread();
    //获取当前线程的ThreadLocalMap
    ThreadLocalMap map = getMap(t);
    if (map != null) {
        // 以当前的 ThreadLocal 为 key，调用 getEntry 获取对应的存储实体 e
        ThreadLocalMap.Entry e = map.getEntry(this);
        if (e != null) {// entry不为空
            @SuppressWarnings("unchecked")
            //获取并返回entry中的value值
            T result = (T)e.value;
            return result;
        }
    }
    /*有两种情况有执行当前代码
      第一种情况: map 不存在，表示此线程没有维护的 ThreadLocalMap 对象
      第二种情况: map 存在, 但是【没有与当前 ThreadLocal 关联的 entry】，就会设置为默认值 */
    // 初始化当前线程与当前 threadLocal 对象相关联的 value
    return setInitialValue();
}

private T setInitialValue() {
    // 调用initialValue获取初始化的值，此方法可以被子类重写, 如果不重写默认返回 null
    T value = initialValue();
    Thread t = Thread.currentThread();
    ThreadLocalMap map = getMap(t);
    if (map != null)
        //map不为空，在其中以ThreadLocal对象为key，存储value
        map.set(this, value);
    else
        //map为空，为该线程创建ThreadLocalMap并存储value
        createMap(t, value);
    return value;
}
```



***

remove方法：  移除当前线程绑定的局部变量

```java
public void remove() {
    ThreadLocalMap m = getMap(Thread.currentThread());
    if (m != null)
        m.remove(this);
}
```

### 内存泄露

Memory leak：内存泄漏是指程序中动态分配的堆内存由于某种原因未释放或无法释放，造成系统内存的浪费，导致程序运行速度减慢甚至系统崩溃等严重后果，内存泄漏的堆积终将导致内存溢出

- 如果 key 使用强引用：使用完 ThreadLocal ，threadLocal Ref 被回收，但是 threadLocalMap 的 Entry 强引用了 threadLocal，造成 threadLocal 无法被回收，无法完全避免内存泄漏

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250325172833902-2025-3-2517:29:03.png" style="zoom:80%;" />

- 如果 key 使用弱引用：使用完 ThreadLocal ，threadLocal Ref 被回收，ThreadLocalMap 的key只持有 ThreadLocal 的弱引用，所以threadlocal 也可以被回收，此时 Entry 中的 key = null。但没有手动删除这个 Entry 或者 CurrentThread 依然运行，依然存在强引用链，value 不会被回收，而这块 value 永远不会被访问到，也会导致 value 内存泄漏

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250325172953197-2025-3-2517:29:54.png" style="zoom:80%;" />

两个主要原因：

* 没有手动删除这个 Entry。当 ThreadLocal 实例失去强引用时，Entry 的键被回收（变为 null），但值仍被强引用，若不手动删除，则这个Entry 会一直存在，导致内存泄露。
* CurrentThread 依然运行。若线程长期存活，其 ThreadLocalMap 中积累的 null 键 Entry 无法自动释放。

根本原因：ThreadLocalMap 是 Thread的一个属性，**生命周期跟 Thread 一样长**，如果没有手动删除对应 Entry 就会导致内存泄漏

解决方法：使用完 ThreadLocal 中存储的内容后将它 remove 掉就可以

ThreadLocal 内部解决方法：在 ThreadLocalMap 中的 set/getEntry 方法中，通过线性探测法对 key 进行判断，如果 key 为 null（ThreadLocal 为 null）会对 Entry 进行垃圾回收。所以**使用弱引用比强引用多一层保障**，就算不调用 remove，也有机会进行 GC



### ThreadLocalMap

`ThreadLocalMap` 是 `ThreadLocal` 的核心实现类，负责存储每个线程的本地变量。作为 `ThreadLocal` 的静态内部类，它维护了线程与变量副本之间的映射关系。

#### 基本结构

ThreadLocalMap是ThreadLocal的内部类，没有实现Map接口，用独立的方式实现了Map的功能，其内部的Entry也是独立实现。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250325160404663-2025-3-2516:04:06.png" style="zoom:80%;" />

***

成员变量

```java
// 初始化当前 map 内部散列表数组的初始长度 16，必须是2的幂。
private static final int INITIAL_CAPACITY = 16;

// 存放数据的table，数组长度必须是2的整次幂。
private Entry[] table;

// 数组里面 entrys 的个数，可以用于判断 table 当前使用量是否超过阈值
private int size = 0;

// 进行扩容的阈值，表使用量大于它的时候进行扩容。
private int threshold;
```



存储结构Entry：

- 在ThreadLocalMap中，也是用Entry来保存K-v结构数据的。不过**Entry中的key只能是ThreadLocal对象**，这点在构造方法中已经限定死了。

- Entry 继承 WeakReference，key 是弱引用，目的是将 ThreadLocal 对象的生命周期和线程生命周期解绑

```java
static class Entry extends WeakReference<ThreadLocal<?>> {
    /** The value associated with this ThreadLocal. */
    Object value;

    Entry(ThreadLocal<?> k, Object v) {
        super(k);
        value = v;
    }
}
```



#### 核心方法

构造方法：

构造函数首先创建一个长度为16的Entry数组，然后计算出firstKey对应的索引，然后创建entry存储给定key和value到entry数组中，并设置size和threshold。

```java
ThreadLocalMap(ThreadLocal<?> firstKey, Object firstValue) {
    //初始化table
    table = new Entry[INITIAL_CAPACITY];
    //计算索引值（重点）
    int i = firstKey.threadLocalHashCode & (INITIAL_CAPACITY - 1);
    //添加entry
    table[i] = new Entry(firstKey, firstValue);
    size = 1;
    //设置阈值
    setThreshold(INITIAL_CAPACITY);
}
```

重点分析： int i = firstKey.threadLocalHashCode & (INITIAL_CAPACITY - 1);

首先获取当前ThreadLocal对象的哈希码，其内部调用了nextHashCode()方法。在其内部每次获取时，当前的hashCode加上`HASH_INCREMENT`后作为真正的哈希码返回。

`HASH_INCREMENT`=0x61c88647，这个值跟斐波那契数列（黄金分割数）有关，其主要目的就是为了让哈希码能均匀的分布在2的n次方的数组里，也就是Entry[]table中，这样做可以尽量避免hash冲突。

```java
private final int threadLocalHashCode = nextHashCode();

private static int nextHashCode() {
    //当前的hashCode加上一个哈希增量后作为真正的哈希码返回
    return nextHashCode.getAndAdd(HASH_INCREMENT);
}
//每个ThreadLocal对象创建都会为其生成一个AtomicInteger类型的变量保存hashCode
private static AtomicInteger nextHashCode = new AtomicInteger();
```

之后的 `& (INITIAL_CAPACITY - 1)`，相当于对hashCode进行取模操作，等价于hashCode % INITIAL_CAPACITY。让ThreadLocal的哈希码散列到数组下标范围内，计算元素应该存储到数组中的哪个索引位置。

***

set方法：添加数据， 使用**线性探测法**来解决哈希冲突

执行流程：

- 计算初始索引：根据 ThreadLocal 的哈希码定位槽位。
- 线性探测：
  - 命中：更新现有 Entry 的值。
  - 过期槽：替换过期 Entry。
  - 新插入：找到空槽插入新 Entry。
- 清理与扩容：触发启发式清理（expungeStaleEntry）和扩容检查。

该方法会一直探测下一个地址，直到有空的地址后插入，若插入后 Map 数量超过阈值，数组会扩容为原来的 2 倍。在探测过程中 ThreadLocal 会复用 key 为 null 的脏 Entry 对象，并进行垃圾清理，防止出现内存泄漏

```java
private void set(ThreadLocal<?> key, Object value) {
    // 获取散列表
    ThreadLocal.ThreadLocalMap.Entry[] tab = table;
    int len = tab.length;
    // 哈希寻址
    int i = key.threadLocalHashCode & (len-1);
    // 使用线性探测法向后查找元素，碰到 entry 为空时停止探测
    for (ThreadLocal.ThreadLocalMap.Entry e = tab[i]; e != null; e = tab[i = nextIndex(i, len)]) {
        // 获取当前元素 key
        ThreadLocal<?> k = e.get();
        // ThreadLocal 对应的 key 存在，【直接覆盖之前的值】
        if (k == key) {
            e.value = value;
            return;
        }
        // 【这两个条件谁先成立不一定，所以 replaceStaleEntry 中还需要判断 k == key 的情况】
        
        // key 为 null，但是值不为 null，说明之前的 ThreadLocal 对象已经被回收了，当前是【过期数据】
        if (k == null) {
            // 【碰到一个过期的 slot，当前数据复用该槽位，替换过期数据】
            // 这个方法还进行了垃圾清理动作，防止内存泄漏
            replaceStaleEntry(key, value, i);
            return;
        }
    }
	// 逻辑到这说明碰到 slot == null 的位置，则在空元素的位置创建一个新的 Entry
    tab[i] = new Entry(key, value);
    // 数量 + 1
    int sz = ++size;
    
    // 【做一次启发式清理】，如果没有清除任何 entry 并且【当前使用量达到了负载因子所定义，那么进行 rehash
    if (!cleanSomeSlots(i, sz) && sz >= threshold)
        // 扩容
        rehash();
}
```

# 七、并发工具之线程池

为什么使用线程池？

- 若为所有的任务都创建一个线程，对内存的压力可想而知，容易导致内存溢出。
- 由于CPU核心数有限，创建太多的线程执行任务，会引起对时间片的激烈争抢，导致上下文频繁切换，影响性能。

线程池是 Java 并发编程中管理多线程任务的核心工具，通过**复用线程**减少资源开销，提升系统性能和稳定性。

线程池内部维护一组线程，这些线程处于等待状态，随时可以执行任务。线程池与工作队列是密切相关的，其中工作队列中保存了所有等待执行的任务，工作线程的任务就是从队列中获取一个任务并执行，然后返回线程池等待下一个任务。

## 7.1、自定义线程池

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250331184413095-2025-3-3118:44:32.png" style="zoom:80%;" />

首先定义阻塞队列，用来保存待执行的任务。主要包含以下属性：

- 阻塞队列的容量`capacity`
- 队列头部的任务只能有一个线程拿走执行，故使用`ReentrantLock`对象加锁
- `emptyWaitSet`和`fullwaitSet`：队列为空时才能获取任务，队列不满时才能添加任务，否则进入对应的条件队列进行等待

当队列中有任务等待执行时，工作线程可以通过`take`（阻塞式获取）或者`poll`（带超时时间的获取）从队列中获取任务执行。

当没有空闲的工作线程时，新任务可以通过`put`（阻塞式添加）或者`offer`（带超时时间的添加），将任务加入阻塞队列等待执行。

***

定义线程池，其关键参数如下：

- 工作线程集合：`works`
- 任务队列：`taskQueue`

- 核心线程数：`coreSize`
- 线程存活时间：`timeout`，时间单位`timeunit`
- 拒绝策略：`rejectPolicy`，当线程池和队列都满时，用于处理新提交的任务的策略。

当提交一个新任务时：

- 如果当前运行的线程数小于`coreSize`，则创建新线程执行任务。
- 如果运行的线程数达到`coreSize`，则将任务加入`taskQueue`。
- 如果队列已满且线程数达到`coreSize`，则根据拒绝策略处理任务。

使用设计模式中的“策略模式”，将具体的拒绝策略交给线程池的创建者，通过函数式参数指定如何处理这些任务，可能的拒绝策略有：

- 阻塞等待，直到任务队列不满时将任务加入
- 带超时的等待，等待指定时间后任务队列还是满的，则放弃添加该任务
- 调用者放弃，不执行任何操作，放弃添加该任务
- 调用者抛出异常
- 调用者自己执行任务

```java
/**
 * 自定义线程池
 */
@Slf4j(topic = "c.Code_01_TestPool")
public class Code_01_ThreadPoolTest {

    public static void main(String[] args) {
        ThreadPool threadPool = new ThreadPool(1, 1000, TimeUnit.MILLISECONDS, 1,
                (queue, task) -> {
                    // 1. 阻塞等待。
//                    queue.put(task);
                    // 2. 带超时的等待
//                    queue.offer(task, 500, TimeUnit.MILLISECONDS);
                    // 3. 调用者放弃
//                    log.info("放弃 {}", task);
                    // 4. 调用者抛出异常
//                    throw new RuntimeException("任务执行失败" + task);
                    // 5. 调用者自己执行任务
                    task.run();
                });
        for(int i = 0; i < 4; i++) {
            int j = i;
            threadPool.executor(() ->{
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                log.info("{}", j);
            });
        }
    }

}

@FunctionalInterface // 拒绝策略
interface RejectPolicy<T> {
    void reject(BlockingQueue<T> queue, T task);
}

// 实现线程池
@Slf4j(topic = "c.ThreadPool")
class ThreadPool {
    // 线程集合
    private Set<Worker> works = new HashSet<Worker>();
    // 任务队列
    private BlockingQueue<Runnable> taskQueue;
    // 线程池的核心数
    private int coreSize;
    // 获取任务的超时时间
    private long timeout;
    private TimeUnit unit;
    // 使用策略模式。
    private RejectPolicy<Runnable> rejectPolicy;

    public ThreadPool(int coreSize, long timeout, TimeUnit unit, int queueCapacity,
                      RejectPolicy<Runnable> rejectPolicy) {
        this.coreSize = coreSize;
        this.timeout = timeout;
        this.unit = unit;
        taskQueue = new BlockingQueue<>(queueCapacity);
        this.rejectPolicy = rejectPolicy;
    }

    // 执行任务
    public void executor(Runnable task) {
        // 如果线程池满了. 就将任务加入到任务队列, 否则执行任务
        synchronized (works) {
            if(works.size() < coreSize) {
                Worker worker = new Worker(task);
                log.info("新增 worker {} ，任务 {}", worker, task);
                works.add(worker);
                worker.start();
            } else {
//                taskQueue.put(task);
                // 1）死等
                // 2）带超时等待
                // 3）让调用者放弃任务执行
                // 4）让调用者抛出异常
                // 5）让调用者自己执行任务

                taskQueue.tryPut(rejectPolicy, task);
            }
        }
    }

    class Worker extends Thread {

        private Runnable task;

        public Worker(Runnable task) {
            this.task = task;
        }

        // 执行任务
        // 1）当 task 不为空，执行任务
        // 2）当 task 执行完毕，再接着从任务队列获取任务并执行
        @Override
        public void run() {
//            while (task != null || (task = taskQueue.take()) != null) {
            while (task != null || (task = taskQueue.poll(timeout, unit)) != null) {
                 try { 
                     log.info("正在执行 {}", task);
                     task.run();
                 }catch (Exception e) {

                 } finally {
                     task = null;
                 }
            }
            synchronized (works) {
                log.info("worker 被移除 {}", this);
                works.remove(this);
            }
        }
    }
}

// 实现阻塞队列
@Slf4j(topic = "c.BlockingQueue")
class BlockingQueue<T> {

    // 阻塞队列的容量
    private int capacity;
    // 双端链表, 从头取, 从尾加
    private Deque<T> queue;
    // 定义锁
    private ReentrantLock lock;
    // 当阻塞队列满了时候, 去 fullWaitSet 休息, 生产者条件变量
    private Condition fullWaitSet;
    // 当阻塞队列空了时候，去 emptyWaitSet 休息, 消费者条件变量
    private Condition emptyWaitSet;

    public BlockingQueue(int capacity) {
        queue = new ArrayDeque<>(capacity);
        lock = new ReentrantLock();
        fullWaitSet = lock.newCondition();
        emptyWaitSet = lock.newCondition();
        this.capacity = capacity;
    }

    // 带有超时时间的获取
    public T poll(long timeout, TimeUnit unit) {
        lock.lock();
        try {
            // 同一时间单位
            long nanos = unit.toNanos(timeout);
            while (queue.isEmpty()) {
                try {
                    if(nanos <= 0) {
                        return null;
                    }
                    // 防止虚假唤醒, 返回的是所剩时间
                    nanos = emptyWaitSet.awaitNanos(nanos);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            T t = queue.removeFirst();
            fullWaitSet.signal();
            return t;
        }finally {
            lock.unlock();
        }
    }

    // 获取
    public T take() {
        lock.lock();
        try {
            while (queue.isEmpty()) {
                try {
                    emptyWaitSet.await();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            T t = queue.removeFirst();
            fullWaitSet.signal();
            return t;
        }finally {
            lock.unlock();
        }
    }

    // 添加
    public void put(T task) {
        lock.lock();
        try {
            while (queue.size() == capacity) {
                try {
                    log.info("等待加入任务队列 {}", task);
                    fullWaitSet.await();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            log.info("加入任务队列 {}", task);
            queue.addLast(task);
            emptyWaitSet.signal();
        }finally {
            lock.unlock();
        }
    }
    // 带有超时时间的添加
    public boolean offer(T task, long timeout, TimeUnit unit) {
        lock.lock();
        try {
            long nanos = unit.toNanos(timeout);
            while (queue.size() == capacity) {
                try {
                    if(nanos <= 0) {
                        return false;
                    }
                    log.info("等待加入任务队列 {}", task);
                    nanos = fullWaitSet.awaitNanos(nanos);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            log.info("加入任务队列 {}", task);
            queue.addLast(task);
            emptyWaitSet.signal();
            return true;
        }finally {
            lock.unlock();
        }
    }

    public void tryPut(RejectPolicy<T> rejectPolicy, T task) {
        lock.lock();
        try {
            // 判断判断是否满
            if(queue.size() == capacity) {
                rejectPolicy.reject(this, task);
            } else { // 有空闲
                log.info("加入任务队列 {}", task);
                queue.addLast(task);
                emptyWaitSet.signal();
            }

        }finally {
            lock.unlock();
        }
    }

    public int getSize() {
        lock.lock();
        try {
            return queue.size();
        } finally {
            lock.unlock();
        }
    }
}
```

## 7.2、ThreadPoolExecutor

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250331205424693-2025-3-3120:54:35.png" style="zoom:80%;" />

`ThreadPoolExecutor` 是 Java 中线程池的核心实现类，它提供了高度可配置的线程管理能力，支持灵活的并发任务处理。

### 线程池状态

ThreadPoolExecutor 使用 int的高3位来表示线程池状态，低29位表示线程数量。

|    状态    | 高3位 |                     说明                      |
| :--------: | :---: | :-------------------------------------------: |
|  RUNNING   |  111  |         接受新任务并处理队列中的任务          |
|  SHUTDOWN  |  000  |   不接受新任务，但是会处理任务队列中的任务    |
|    STOP    |  001  |    中断正在执行的任务，并抛弃阻塞队列任务     |
|  TIDYING   |  010  | 任务全执行完毕，活动线程为0，即将进入终结阶段 |
| TERMINATED |  011  |           终结状态，线程池彻底关闭            |

这些信息存储在一个原子变量 `ctl` 中，目的是将线程池状态与线程个数合二为一，这样就可以用<u>一次</u> cas 原子操作进行赋值。

```java
// c 为旧值， ctlOf 返回结果为新值
ctl.compareAndSet(c, ctlOf(targetState, workerCountOf(c))));

// rs 为高 3 位代表线程池状态， wc 为低 29 位代表线程个数，ctl 是合并它们
private static int ctlOf(int rs, int wc) { return rs | wc; }
```

状态转换：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250401001504665-2025-4-100:15:18.png" style="zoom:80%;" />

- RUNNING → SHUTDOWN：调用 `shutdown()`。
- RUNNING/SHUTDOWN → STOP：调用 `shutdownNow()`。
- SHUTDOWN → TIDYING：队列和线程池均为空。
- STOP → TIDYING：线程池为空。
- TIDYING → TERMINATED：`terminated()` 执行完毕。

### 构造方法

ThreadPoolExecutor 的构造函数包含 7 个关键参数，直接决定线程池的行为特性：

```java
public ThreadPoolExecutor(
    int corePoolSize,             // 核心线程数
    int maximumPoolSize,          // 最大线程数
    long keepAliveTie,           // 空闲线程存活时间
    TimeUnit unit,                // 时间单位（秒、毫秒等）
    BlockingQueue<Runnable> workQueue, // 任务队列
    ThreadFactory threadFactory,       // 线程工厂
    RejectedExecutionHandler handler   // 拒绝策略
)
```

参数详解：

| **参数**          | **作用**                                                     |
| ----------------- | ------------------------------------------------------------ |
| `corePoolSize`    | 核心线程数：线程池长期保留的线程数量（即使空闲也不会被回收）。 |
| `maximumPoolSize` | 最大线程数：线程池允许创建的最大线程数（包含核心线程和临时线程）。 |
| `keepAliveTime`   | **临时线程**的空闲存活时间：当线程数超过核心线程数，且空闲时间超过此值时，线程被回收。 |
| `workQueue`       | 任务队列：用于存放待执行任务的阻塞队列（见下文队列类型）。   |
| `threadFactory`   | 线程工厂：用于创建新线程，可自定义线程名、优先级等。         |
| `handler`         | 拒绝策略：当任务队列和线程池均满时，如何处理新提交的任务（见下文拒绝策略）。 |

***

线程池处理任务的逻辑遵循以下步骤（源码核心逻辑在 `execute()` 方法中）：

1. **提交任务**
   调用 `execute(Runnable command)` 提交任务。
2. **流程判断**
   - **步骤 1**：若当前线程数 < `corePoolSize` → 创建新核心线程执行任务。
   - **步骤 2**：若核心线程已满 → 将任务加入 `workQueue`。
   - **步骤 3**：若队列已满且线程数 < `maximumPoolSize` → 创建临时线程执行任务。
   - **步骤 4**：若队列和线程池均满 → 触发拒绝策略。

{% note warning %} 

以上处理流程是基于**有界队列**实现的线程池的处理流程，如`ArrayBlockingQueue`。

有界队列容量固定，当‌**队列已满**‌且线程数未达最大线程数时，创建新线程处理任务。而无界队列容量理论上无限制，‌**队列永远不会满**‌，因此‌**不会创建超过核心线程数的线程**‌。

{% endnote %}

***

`workQueue` 的类型直接影响线程池的行为，常见队列如下：

- **LinkedBlockingQueue**：无界队列（默认容量为 `Integer.MAX_VALUE`），可能导致内存溢出。适用于任务量可控的场景。
- **ArrayBlockingQueue**：有界队列，需指定固定容量，避免资源耗尽。需平衡容量与系统负载。
- **SynchronousQueue**：不存储任务，直接将任务交给线程（一手交钱，一手交货）。需配合较大的 `maximumPoolSize`，否则容易触发拒绝策略。
- **PriorityBlockingQueue**：优先级队列，任务按优先级执行。需实现 `Comparable` 接口或提供 `Comparator`。

***

当线程池和队列均满时，通过拒绝策略处理新任务。jdk 提供了 4 种实现：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250331204745793-2025-3-3120:47:59.png" style="zoom:80%;" />

- **AbortPolicy**（默认）：让调用者抛出 `RejectedExecutionException `异常
- CallerRunsPolicy：由提交任务的线程直接执行任务（让调用者运行任务）
- DiscardPolicy：放弃本次任务，不触发任何通知
- DiscardOldestPolicy：放弃队列中最早的任务，本任务取而代之

其它著名框架也提供了各自的实现，如：

- Dubbo 的实现，在抛出 RejectedExecutionException 异常之前会记录日志，并 dump 线程栈信息，方

  便定位问题

- Netty 的实现，是创建一个新线程来执行任务

- ActiveMQ 的实现，带超时等待（60s）尝试放入队列，类似我们之前自定义的拒绝策略

- PinPoint 的实现，它使用了一个拒绝策略链（多种策略组合起来使用），会逐一尝试策略链中每种拒绝策略

### 工厂方法

根据这个构造方法，JDK Executors 类中提供了众多工厂方法来创建各种用途的线程池

newFixedThreadPool

```java
public static ExecutorService newFixedThreadPool(int nThreads) {
    //传入的nThreads同时赋给了 corePoolSzie和maximumPoolSize
    return new ThreadPoolExecutor(nThreads, nThreads,
                                  0L, TimeUnit.MILLISECONDS,
                                  new LinkedBlockingQueue<Runnable>());
}
```

特点

- 核心线程数 == 最大线程数（不会创建临时线程），因此也无需超时时间

- 阻塞队列是无界的，可以放任意数量的任务

适用于任务量已知，相对耗时的任务

***

newCachedThreadPool

```java
public static ExecutorService newCachedThreadPool() {
    return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                  60L, TimeUnit.SECONDS,
                                  new SynchronousQueue<Runnable>());
}
```

特点：

- 核心线程数是 0， 最大线程数是 `Integer.MAX_VALUE`，临时线程的空闲生存时间是 60s，意味着
  - 创建的全部都是临时线程（60s 后可以回收）
  - 临时线程可以无限创建
- 队列采用了 SynchronousQueue 实现。特点是，它没有容量，没有线程来取是放不进去的（一手交钱、一手交货）

整个线程池表现为线程数会根据任务量不断增长，没有上限，当任务执行完毕，空闲 1分钟后释放线程。 适合任务数比较密集，但每个任务执行时间较短的情况

***

newSingleThreadExecutor

```java
public static ExecutorService newSingleThreadExecutor() {
    //创建容量为1的线程池，并使用FinalizableDelegatedExecutorService包装后返回
    return new FinalizableDelegatedExecutorService
        (new ThreadPoolExecutor(1, 1,
                                0L, TimeUnit.MILLISECONDS,
                                new LinkedBlockingQueue<Runnable>()));
}
```

使用场景：希望多个任务排队执行。线程数固定为 1，任务数多于 1 时，会放入无界队列排队。任务执行完毕，这唯一的线程也不会被释放。

区别：

- 它与自己创建一个线程串行执行任务的区别：自己创建一个单线程串行执行任务，如果任务执行失败而终止那么没有任何补救措施，剩余的任务就无法执行了。而线程池在这种情况下会新建一个线程，保证池的正常工作。

- 它与`Executors.newFixedThreadPool(1)` 初始时为1的区别：

  - Executors.newFixedThreadPool(1)，初始时为1，以后还可以修改。

    它对外暴露的是 ThreadPoolExecutor 对象，其中包含了这个实现类的特有方法，可以强转后调用 setCorePoolSize 等方法进行修改

  - Executors.newSingleThreadExecutor()线程个数始终为1，不能修改

    它内部使用装饰器模式，对ThreadPoolExecutor 对象使用FinalizableDelegatedExecutorService进行修饰，只对外暴露了 ExecutorService 接口，因此不能调用 ThreadPoolExecutor 中特有的方法

### 提交任务

1、`execute`方法

```java
// 执行任务
void execute(Runnable task);

//示例
ExecutorService pool = Executors.newFixedThreadPool(2);
pool.execute(()->{
    log.debug("1");
});
```

***

2、`submit`方法

方法参数是`Callable`接口，与`Runnale`接口相比，它能够返回执行结果，也能够抛出异常。

```java
// 提交任务 task，用返回值 Future 获得任务执行结果
<T> Future<T> submit(Callable<T> task)
```

示例

```java
ExecutorService pool = Executors.newFixedThreadPool(2);

Future<String> future = pool.submit(new Callable<String>() {
    @Override
    public String call() throws Exception {
        log.debug("start...");
        Thread.sleep(1000);
        return "ok";
    }
});

//Callable接口也是单方法接口，可以使用Lambda表达式简化
Future<String> future_1 = pool.submit(() -> {
            log.debug("start...");
            Thread.sleep(1000);
            return "ok";
        });
//主线程等待返回结果
log.debug("{}",future.get());

//输出
23:04:49.891 [pool-1-thread-1] c.TestExecutors - start...
23:04:50.898 [main] c.TestExecutors - ok
```

***

3、`invokeAll`方法

```java
// 提交 tasks 中所有任务
<T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks)
    throws InterruptedException;
// 提交 tasks 中所有任务，带超时时间
<T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks,
                              long timeout, TimeUnit unit)
    throws InterruptedException;
```

示例

```java
ExecutorService pool = Executors.newFixedThreadPool(2);
//传入task集合，其中包含3个任务
List<Future<String>> futures = pool.invokeAll(Arrays.asList(
    () -> {
        log.debug("begin-task1");
        Thread.sleep(1000);
        return "1";
    },
    () -> {
        log.debug("begin-task2");
        Thread.sleep(500);
        return "2";
    },
    () -> {
        log.debug("begin-task3");
        Thread.sleep(2000);
        return "3";
    }
));
//遍历返回结果
futures.forEach( f ->{
    try {
        log.debug("{}",f.get());
    } catch (InterruptedException | ExecutionException e) {
        e.printStackTrace();
    }
});

//输出
23:23:10.470 [pool-1-thread-1] c.TestExecutors - begin-task1
23:23:10.470 [pool-1-thread-2] c.TestExecutors - begin-task2
23:23:10.983 [pool-1-thread-2] c.TestExecutors - begin-task3
23:23:12.990 [main] c.TestExecutors - 1
23:23:12.991 [main] c.TestExecutors - 2
23:23:12.991 [main] c.TestExecutors - 3
```



***

4、`invokeAny`方法

```java
//提交 tasks 中所有任务，哪个任务先成功执行完毕，返回此任务执行结果，其它任务取消
<T> T invokeAny(Collection<? extends Callable<T>> tasks)
    throws InterruptedException, ExecutionException;

// 提交 tasks 中所有任务，哪个任务先成功执行完毕，返回此任务执行结果，其它任务取消，带超时时间
<T> T invokeAny(Collection<? extends Callable<T>> tasks,
                long timeout, TimeUnit unit)
    throws InterruptedException, ExecutionException, TimeoutException;
```

示例

```java
ExecutorService pool = Executors.newFixedThreadPool(2);
//传入task集合，其中包含3个任务，谁先执行完就返回谁的结果，剩余的任务取消
String res = pool.invokeAny(Arrays.asList(
    () -> {
        log.debug("begin-task1");
        Thread.sleep(1000);
        log.debug("end-task1");
        return "1";
    },
    () -> {
        log.debug("begin-task2");
        Thread.sleep(500);
        log.debug("end-task2");
        return "2";
    },
    () -> {
        log.debug("begin-task3");
        Thread.sleep(2000);
        log.debug("end-task3");
        return "3";
    }
));

log.debug("{}",res);


//输出
23:32:37.698 [pool-1-thread-2] c.TestExecutors - begin-task2
23:32:37.698 [pool-1-thread-1] c.TestExecutors - begin-task1
23:32:38.204 [pool-1-thread-2] c.TestExecutors - end-task2
23:32:38.204 [pool-1-thread-2] c.TestExecutors - begin-task3
23:32:38.204 [main] c.TestExecutors - 2
```

### 异常处理

execute方法提交的任务如果抛出未捕获的异常，会导致线程终止，并且异常会被线程池的未捕获异常处理器处理。

而submit方法和invokeAll方法，提交的任务返回的是Future对象，异常会被包装在Future中，需要调用Future.get()时才会抛出，否则可能被忽略。

处理方法：

1. 在任务内部捕获异常（推荐）

   直接在任务代码中使用 try-catch 块处理所有可能的异常，确保异常不会逃逸到线程池。

   ```java
   ExecutorService executorService = Executors.newFixedThreadPool(1);
   pool.submit(() -> {
       try {
           System.out.println("task1");
           int i = 1 / 0;
       } catch (Exception e) {
           e.printStackTrace();
       }
   });
   ```

2. 通过 Future 捕获异常

   使用 submit() 提交任务，通过 Future 对象获取异常。future.get() 会抛出 ExecutionException，其 getCause() 可获取原始异常。若不调用 future.get()，异常会被静默忽略！

   ```java
   ExecutorService pool = Executors.newFixedThreadPool(2);
   Future<String> future = pool.submit(() -> {
       log.debug("start...");
       Thread.sleep(1000);
       int i = 1 / 0;
       return "ok";
   });
   
   //主线程等待返回结果
   try{
       log.debug("{}", future.get());
   }catch (InterruptedException | ExecutionException e) {
       log.error("Task execution failed : {}", e.getCause());
   }
   ```

3. 重写 afterExecute 方法

   通过继承 ThreadPoolExecutor 并重写 afterExecute 方法，统一处理任务中的异常。

   ```java
   public class CustomThreadPool extends ThreadPoolExecutor {
       // ... 构造函数
   
       @Override
       protected void afterExecute(Runnable r, Throwable t) {
           super.afterExecute(r, t);
           if (t != null) { // 任务抛出异常
               logger.error("Uncaught exception in task", t);
           }
           // 处理通过 Future.get() 抛出的异常
           if (r instanceof Future<?>) {
               try {
                   ((Future<?>) r).get();
               } catch (InterruptedException | ExecutionException e) {
                   logger.error("Future task failed", e.getCause());
               }
           }
       }
   }
   ```

   

### 关闭线程池

1、`shutdown`方法

线程池的状态从 `RUNNING` 变为`SHUTDOWN`，线程池不再接受新任务，但会继续执行已经提交的任务。

此方法不会阻塞调用线程的执行

```java
void shutdown();

//源码分析
public void shutdown() {
    final ReentrantLock mainLock = this.mainLock;
    mainLock.lock();
    try {
        //检查当前线程是否有权限关闭线程池。
        checkShutdownAccess();
        // 修改线程池状态
        advanceRunState(SHUTDOWN);
        // 仅会打断空闲线程
        interruptIdleWorkers();
        onShutdown(); // 扩展点 ScheduledThreadPoolExecutor
    } finally {
        mainLock.unlock();
    }
    // 尝试终结(没有运行的线程可以立刻终结，如果还有运行的线程也不会等)
    tryTerminate();
}
```

***

2、`shutdownNow`方法

线程池状态从`RUNNING/SHUTDOWN`变为 `STOP`，不会接收新任务，用 interrupt 的方式中断正在执行的任务，并将队列中的任务返回。

```java
List<Runnable> shutdownNow();

//源码分析
public List<Runnable> shutdownNow() {
    List<Runnable> tasks;
    final ReentrantLock mainLock = this.mainLock;
    mainLock.lock();
    try {
        checkShutdownAccess();
        // 修改线程池状态
        advanceRunState(STOP);
        // 打断所有线程
        interruptWorkers();
        // 获取队列中剩余任务
        tasks = drainQueue();
    } finally {
        mainLock.unlock();
    }
    // 尝试终结
    tryTerminate();
    return tasks;
}
```



***

其他方法

```java
// 不在 RUNNING 状态的线程池，此方法就返回 true
boolean isShutdown();

// 线程池状态是否是 TERMINATED
boolean isTerminated();

// 调用 shutdown 后，由于调用线程并不会等待所有任务运行结束，因此如果它想在线程池 TERMINATED 后做些事情，可以利用此方法等待
boolean awaitTermination(long timeout, TimeUnit unit) throws InterruptedException;
```



## 7.3、任务调度

### Timer

在『任务调度线程池』功能加入之前，可以使用 java.util.Timer 来实现定时功能，Timer 的优点在于简单易用，但由于所有任务都是由**同一个线程**来调度，因此所有任务都是**串行执行**的，同一时间只能有一个任务在执行，<u>前一个任务的延迟或异常都将会影响到之后的任务</u>

```java
public static void testTimer() {
        Timer timer = new Timer();
        TimerTask task1 = new TimerTask() {
            @Override
            public void run() {
                log.debug("task 1");
                //int i = 1 / 0;//任务一的出错会导致任务二无法执行
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        };
        TimerTask task2 = new TimerTask() {
            @Override
            public void run() {
                log.debug("task 2");
            }
        };
        // 使用 timer 添加两个任务，希望它们都在 1s 后执行
        // 但由于 timer 内只有一个线程来顺序执行队列中的任务，因此任务1的延时，影响了任务2的执行
        timer.schedule(task1, 1000);
        timer.schedule(task2, 1000);
    }

//输出，由于任务1的延时，导致任务2在两秒后才被执行
00:36:14.124 [Timer-0] c.TestExecutors - task 1
00:36:16.141 [Timer-0] c.TestExecutors - task 2
```

### ScheduledThreadPoolExecutor

任务调度线程池 ScheduledThreadPoolExecutor 继承 ThreadPoolExecutor：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250331205424693-2025-3-3120:54:35.png" style="zoom:80%;" />

使用工厂方法创建：`Executors.newScheduledThreadPool(int corePoolSize)`

```java
public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize) {
    return new ScheduledThreadPoolExecutor(corePoolSize);
}

public ScheduledThreadPoolExecutor(int corePoolSize) {
    // 最大线程数固定为 Integer.MAX_VALUE，保活时间 keepAliveTime 固定为 0
    super(corePoolSize, Integer.MAX_VALUE, 0, NANOSECONDS,
          // 阻塞队列是 DelayedWorkQueue
          new DelayedWorkQueue());
}
```

***

基本使用

- 延迟任务 schedule，接收两个参数：执行的任务和延时时间

  该方法执行出现异常并不会在控制台打印，也不会影响其他线程的执行

  ```java
  public static void testScheduledPool(){
      ScheduledExecutorService pool = Executors.newScheduledThreadPool(2);
      log.debug("start scheduled task");
      //添加两个延时任务，都在1s后执行
      pool.schedule(()->{
          log.debug("start task1");
      },1,TimeUnit.SECONDS);
  
      pool.schedule(()->{
          log.debug("start task2");
      },1,TimeUnit.SECONDS);
  }
  
  //输出
  00:53:21.711 [main] c.TestExecutors - start scheduled task
  00:53:22.783 [pool-1-thread-2] c.TestExecutors - start task2
  00:53:22.783 [pool-1-thread-1] c.TestExecutors - start task1
  ```

- 定时任务 scheduleAtFixedRate：

  固定频率，基于任务开始时间计算下一次执行时间。下一次任务的开始时间 = 上一次任务的 **开始时间** + `period`。

  如果任务执行时间超过间隔，后续任务会等待当前任务完成后立即执行，导致实际间隔时间延长。

  ```java
  public ScheduledFuture<?> scheduleAtFixedRate(Runnable command, //执行的任务
                                                long initialDelay, //初始延时
                                                long period, //执行间隔
                                                TimeUnit unit); //时间单位
  ```

  示例

  ```java
  public static void testScheduledAtFixedRate() {
      ScheduledExecutorService pool = Executors.newScheduledThreadPool(2);
      log.debug("start....");
      //开始定时任务，初始延时1s，执行间隔1s
      pool.scheduleAtFixedRate(()->{
          log.debug("task1");
          //执行耗时2s
          try {
              Thread.sleep(2000);
          } catch (InterruptedException e) {
              e.printStackTrace();
          }
      },1,1,TimeUnit.SECONDS);
  }
  
  //输出
  01:11:02.842 [main] c.TestExecutors - start....
  01:11:03.892 [pool-1-thread-1] c.TestExecutors - task1
  01:11:05.904 [pool-1-thread-1] c.TestExecutors - task1
  01:11:07.918 [pool-1-thread-1] c.TestExecutors - task1
  01:11:09.932 [pool-1-thread-1] c.TestExecutors - task1
  01:11:11.944 [pool-1-thread-1] c.TestExecutors - task1
  ```

  

- 定时任务 scheduleWithFixedDelay：

  固定延迟，基于任务结束时间计算下一次执行时间。下一次任务的开始时间 = 上一次任务的 **结束时间** + `delay`。

  无论任务执行多久，两次任务之间的间隔都是指定的延迟时间

  ```java
  public ScheduledFuture<?> scheduleWithFixedDelay(Runnable command, //执行的任务
                                                   long initialDelay, //初始延时
                                                   long delay, //两次执行的间隔
                                                   TimeUnit unit);//时间单位
  ```

  示例

  ```java
  public static void testScheduledWithFixedDelay() {
      ScheduledExecutorService pool = Executors.newScheduledThreadPool(2);
      log.debug("start....");
      //开始定时任务，初始延时1s，执行间隔1s
      pool.scheduleWithFixedDelay(()->{
          log.debug("task1");
          //执行耗时2s
          try {
              Thread.sleep(2000);
          } catch (InterruptedException e) {
              e.printStackTrace();
          }
      },1,1,TimeUnit.SECONDS);
  }
  
  //输出
  01:12:47.776 [main] c.TestExecutors - start....
  01:12:48.827 [pool-1-thread-1] c.TestExecutors - task1
  01:12:51.842 [pool-1-thread-1] c.TestExecutors - task1
  01:12:54.855 [pool-1-thread-1] c.TestExecutors - task1
  01:12:57.869 [pool-1-thread-1] c.TestExecutors - task1
  01:13:00.883 [pool-1-thread-1] c.TestExecutors - task1
  ```

### 应用

让每周四 18：00：00 定时执行任务

```java
ScheduledExecutorService pool = Executors.newScheduledThreadPool(1);
//1、initialDelay 初始间隔，代表当前时间和周四的时间差
//当前时间
LocalDateTime now = LocalDateTime.now();
//本周四对应的时间
LocalDateTime time = now.withHour(18).withMinute(0).withSecond(0).withNano(0).with(DayOfWeek.THURSDAY);
//判断当前时间是否已经超过了本周四，如现在已经是周五了，那第一次执行时间应该是下周四
if (now.compareTo(time) > 0) {
    time = time.plusWeeks(1);
}
long initialDelay = Duration.between(now, time).toMillis();

//2、period 一周的间隔时间
long period = 1000 * 60 * 60 * 24 * 7;

pool.scheduleAtFixedRate(()->{
    System.out.println("running...");
}, initialDelay, period, TimeUnit.MILLISECONDS);
```

## 7.4、Fork/Join

Fork/Join线程池是 Java 7 引入的高性能并行计算框架，体现是分治思想，适用于能够进行任务拆分的 CPU 密集型运算，用于**并行计算**

工作原理：

* Fork/Join 在**分治的基础上加入了多线程**，把每个任务的分解和合并交给不同的线程来完成。跟递归相关的一些计算，如归并排序、斐波那契数列都可以用分治思想进行求解
  * Fork（分解）：将大任务递归拆分为子任务，直到达到阈值（最小可处理粒度）。
  * Join（合并）：将子任务的结果逐层合并，得到最终结果。
* **工作窃取**：每个线程维护一个任务队列（双端队列），队头执行自己的任务，队尾窃取其他线程的任务。空闲线程从忙碌线程的队列尾部窃取任务，减少线程竞争，提升吞吐量。

ForkJoin 使用 ForkJoinPool 来启动，是一个特殊的线程池，默认会创建与 CPU 核心数大小相同的线程池

任务有返回值继承 RecursiveTask，没有返回值继承 RecursiveAction

案例：计算1~n的和

拆分方案一：1~n的和 = n + 1~n-1的和、 1~n-1的和 = n-1 + 1~n-2的和.....

```java
public static void main(String[] args) {
    ForkJoinPool pool = new ForkJoinPool(4);
    System.out.println(pool.invoke(new MyTask(5)));
    //拆分  5 + MyTask(4) --> 4 + MyTask(3) -->
}

// 1~ n 之间整数的和
class MyTask extends RecursiveTask<Integer> {
    private int n;

    public MyTask(int n) {
        this.n = n;
    }

    @Override
    public String toString() {
        return "MyTask{" + "n=" + n + '}';
    }

    @Override
    protected Integer compute() {
        // 如果 n 已经为 1，可以求得结果了
        if (n == 1) {
            return n;
        }
        // 将任务进行拆分(fork)
        MyTask t1 = new MyTask(n - 1);
        t1.fork();
        // 合并(join)结果
        int result = n + t1.join();
        return result;
    }
}
```

执行过程：

t1 线程 将任务拆分为 5 + 求1~4的和，将子任务交给t2线程执行；t2线程 将任务拆分为 4 + 1~3和，再将子任务交给t3线程执行....，最终将执行结果汇总到t1，返回最终结果。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250401114251971-2025-4-111:43:08.png" style="zoom:80%;" />



拆分方案二：1~n的和 = 1 ~ mid的和 + mid ~n的和

```java
class AddTask extends RecursiveTask<Integer> {
    int begin;
    int end;
    public AddTask(int begin, int end) {
        this.begin = begin;
        this.end = end;
    }
    
    @Override
    public String toString() {
        return "{" + begin + "," + end + '}';
    }
    
    @Override
    protected Integer compute() {
        // 5, 5
        if (begin == end) {
            return begin;
        }
        // 4, 5  防止多余的拆分  提高效率
        if (end - begin == 1) {
            return end + begin;
        }
        // 1 5
        int mid = (end + begin) / 2; // 3
        AddTask t1 = new AddTask(begin, mid); // 1,3
        t1.fork();
        AddTask t2 = new AddTask(mid + 1, end); // 4,5
        t2.fork();
        int result = t1.join() + t2.join();
        return result;
    }
}
```

执行过程：

t1线程将任务拆分为两个子任务：计算1~3的和，计算 4~5的和，将子任务交给t2和t3线程执行。t2线程继续讲任务拆分为两个子任务交给其他线程执行，直至不能拆分，返回计算结果。最终将执行结果汇总到t1，返回最终结果。

这种拆分方式的并行度和执行效率更高，因此如何高效地拆分任务成为关键。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250401114619852-2025-4-111:46:21.png" style="zoom:80%;" />

# 八、并发工具之同步器

## 8.1、AQS原理

AQS，全称是AbstractQueuedSynchronizer，是**阻塞式锁**和相关的同步器工具的框架。它通过 **模板方法模式** 提供了一套线程阻塞、排队及唤醒的通用机制，开发者仅需重写部分方法即可实现自定义同步器。

JDK 6 中 AQS 被广泛使用，基于 AQS 实现的同步器包括：ReentrantLock、Semaphore、ReentrantReadWriteLock、 CountDownLatch 和 FutureTask。

### 核心机制

#### 状态管理机制

AQS 用状态属性（`volatile int state`）来表示资源的状态（分**独占模式和共享模式**），子类需要定义如何维护这个状态，控制如何获取锁和释放锁

* 独占模式是只有一个线程能够访问资源，如 ReentrantLock
* 共享模式允许多个线程访问资源，如 Semaphore，ReentrantReadWriteLock 是组合式

相关API：

- getState - 获取 state 状态
- setState - 设置 state 状态
- compareAndSetState - 使用cas 机制设置保证修改state 状态时的原子性

#### 线程队列机制

* 如果被请求的共享资源空闲，则将当前请求资源的线程设置为有效的工作线程，并将共享资源设置锁定状态
* 如果请求的共享资源被占用，AQS 用队列实现线程阻塞等待以及被唤醒时锁分配的机制，将暂时获取不到锁的线程加入到队列中

AQS使用一个先入先出（FIFO）的双向队列（CLH变体）管理竞争失败的线程，每个节点保存线程信息及等待状态‌。线程入队后先通过自旋尝试获取资源，失败后通过LockSupport.park()进入阻塞状态，由前驱节点唤醒‌。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250401160721095-2025-4-116:07:26.png" style="zoom:80%;" />

Node结点结构如下：

```java
static final class Node {
    volatile int waitStatus;     // 节点状态（CANCELLED、SIGNAL、CONDITION 等）
    volatile Node prev;          // 前驱节点
    volatile Node next;          // 后继节点
    volatile Thread thread;      // 节点关联的线程
    Node nextWaiter;             // 条件队列或共享模式标记
}
```

结点的状态（waitStatus）有：

- `CANCELLED (1)`：线程已取消等待。
- `SIGNAL (-1)`：当前节点释放资源后需唤醒后继节点。
- `CONDITION (-2)`：节点处于条件队列。
- `PROPAGATE (-3)`：共享模式下，资源可被传播给后续节点。

#### 条件变量

AQS 通过 ConditionObject 内部类支持条件等待机制，每个 Condition 维护一个**单向队列**，存储调用 await() 的线程节点。

流程

1. **`await()`**：释放锁，将线程加入条件队列并阻塞。
   - **释放锁**：当前线程释放持有的锁
   - **创建条件节点**：将线程封装为`Node`节点，标记为`CONDITION`状态，并加入条件队列尾部。
   - **阻塞线程**：通过`LockSupport.park()`挂起当前线程。
2. **`signal()`**：将条件队列中的节点转移到 AQS 主队列，等待获取锁。
   - **转移节点**：将条件队列的<u>首节点</u>转移到CLH队列。
   - **修改节点状态**：将节点的`waitStatus`从`CONDITION`改为`0`，并加入CLH队列尾部。
   - **唤醒线程**：若CLH队列中的前驱节点已释放资源，则唤醒该线程。

条件变量的等待队列和CLH线程等待队列是两种不同的队列结构，它们分别服务于不同的同步场景，但通过协作共同实现线程的阻塞与唤醒机制。

- CLH队列：管理所有等待获取锁的线程（锁竞争），负责锁的获取与释放，解决资源竞争问题。
- 条件队列：管理因特定条件而阻塞的线程，负责线程的条件等待与通知，解决线程间的协作问题。

通过分离队列，条件等待的线程不会阻塞CLH队列中的其他线程，只有在条件满足后才重新加入锁竞争。条件队列中的线程必须通过`signal()`转移到CLH队列才能重新竞争锁，确保条件满足后才继续执行。

#### 模板方法模式

模板方法模式在抽象类中定义算法骨架，将部分步骤延迟到子类实现‌。AQS将这一模式应用于锁获取、释放等流程，固定了同步队列管理、线程阻塞/唤醒等通用逻辑。

* 使用者继承 `AbstractQueuedSynchronizer` 并重写指定的方法
* 将 AQS 组合在自定义同步组件的实现中，并调用其模板方法，这些模板方法会调用使用者重写的方法

AQS定义了需要子类实现的抽象方法，通过重写这些方法定义资源获取与释放的逻辑

```java
tryAcquire(int)			//独占方式。尝试获取资源，成功则返回true，失败则返回false
tryRelease(int)			//独占方式。尝试释放资源，成功则返回true，失败则返回false
tryAcquireShared(int)	//共享方式。尝试获取资源。负数表示失败；0表示成功但没有剩余可用资源；正数表示成功且有剩余资源
tryReleaseShared(int)	//共享方式。尝试释放资源，成功则返回true，失败则返回false
isHeldExclusively()		//判断资源是否被当前线程独占持有。只有用到condition才需要去实现它
```

### 执行流程

AQS 提供两种资源访问模式：独占模式（Exclusive） 和 共享模式（Shared）。

**独占模式**，如ReentrantLock

- 获取资源
  1. 调用 `tryAcquire(int arg)`（需子类实现）尝试直接获取资源。
  2. 若失败，将当前线程封装为 Node 加入队列尾部，并通过 acquireQueued 进入自旋：
     - 检查前驱节点是否为头节点（占位用，不关联线程），若是则再次尝试获取资源（它是第一个有效结点，很有可能再次尝试成功）。
     - 若仍失败，调用 LockSupport.park() 阻塞当前线程。
  3. 被唤醒后，若成功获取资源，将当前节点设为头节点（原头节点出队）。
- 释放资源
  1. 调用 `tryRelease(int arg)`（需子类实现）尝试释放资源。
  2. 若成功，唤醒队列中首个有效节点（`unparkSuccessor`）。

***

**共享模式**，如 Semaphore

- 获取资源
  1. 调用 `tryAcquireShared(int arg)`（需子类实现）尝试获取资源。
  2. 若失败，加入队列并自旋，类似独占模式，但允许多个线程同时获取资源。
- 释放资源
  1. 调用 `tryReleaseShared(int arg)` 释放资源。
  2. 唤醒后续节点，传播资源可用状态。

### 案例

自定义一个不可重入锁

```java
//自定义不可重入锁，基于AQS同步器实现
class MyLock implements Lock {
    //独占锁，继承AQS重写方法
    class MySync extends AbstractQueuedSynchronizer {
        @Override
        protected boolean tryAcquire(int arg) {
            if(compareAndSetState(0,1)) {
                //加锁成功，设置owner为当前线程
                setExclusiveOwnerThread(Thread.currentThread());
                return true;
            }
            return false;
        }

        @Override
        protected boolean tryRelease(int arg) {
            setExclusiveOwnerThread(null);
            setState(0);
            return true;
        }

        @Override //是否持有独占锁
        protected boolean isHeldExclusively() {
            return getState() == 1;
        }

        public Condition newCondition() {
            return newCondition();
        }
    }

    private MySync sync = new MySync();
    @Override
    public void lock() { //加锁（不成功会进入等待队列）
        //调用AQS的acquire方法加锁，内部会调用自定义的tryAcquire方法，再做一些扩展
        sync.acquire(1);
    }

    @Override //加锁，可打断
    public void lockInterruptibly() throws InterruptedException {
        sync.acquireInterruptibly(1);
    }

    @Override //尝试加锁 （1次）
    public boolean tryLock() {
        return sync.tryAcquire(1);
    }

    @Override //尝试加锁，带超时
    public boolean tryLock(long time, TimeUnit unit) throws InterruptedException {
        return sync.tryAcquireNanos(1,unit.toNanos(time));
    }

    @Override //解锁
    public void unlock() {
        sync.tryRelease(1);
    }

    @Override //创建条件变量
    public Condition newCondition() {
        return sync.newCondition();
    }
}
```

## 8.2、ReentrantLock原理

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250401171243130-2025-4-117:12:47.png" style="zoom:80%;" />

### 公平锁

#### ‌非公平原理

使用无参构造函数，默认创建非公平锁，其中NonfairSync 继承自 AQS。

```java
ReentrantLock lock = new ReentrantLock();
//源码
public ReentrantLock() {
    sync = new NonfairSync();
}
```



##### 加锁

没有竞争时，Thread-0使用`lock()`方法加锁。CAS操作成功，加锁成功

```java
final void lock() {
    //用CAS操作将state从0修改为1，若修改成功，则表示获取到了锁
    if (compareAndSetState(0, 1))
        //将当前线程设置为独占线程
        setExclusiveOwnerThread(Thread.currentThread());
    else
        acquire(1); //CAS失败后执行
}
```



<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250401174926500-2025-4-117:49:30.png" style="zoom:80%;" />

***

第一个竞争出现：当前Thread-0持有锁，Thread-1想获取锁。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250401175130926-2025-4-117:51:32.png" style="zoom:80%;" />

Thread-1执行`lock()`方法，CAS 尝试将 state 由 0 改为 1，结果失败

接下来进入`acuqire(1)`逻辑

```java
public final void acquire(int arg) {    
    if (!tryAcquire(arg) //调用tryAcquire(arg) 再尝试获取锁一次，如果获取成功则结束if条件
        && 
        //再次尝试失败，创建该线程对应的Node结点，将其加入线程等待队列并阻塞，直到成功获取资源或被中断。
        //如果线程在获取资源的过程中被中断，acquireQueued返回true。
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        // 线程在等待过程中被中断，调用selfInterrupt()方法，重新设置线程的中断状态
        selfInterrupt(); 
}
```

1. 首先进入 `tryAcquire` 方法，再次尝试获取锁，检查是否是锁重入。这时 state 已经是1，结果仍然失败

   ```java
   protected final boolean tryAcquire(int acquires) {
       return nonfairTryAcquire(acquires);
   }
   
   final boolean nonfairTryAcquire(int acquires) {
       //获取当前线程的引用
       final Thread current = Thread.currentThread();
       //获取当前锁的状态值
       int c = getState();
       // 如果当前锁的状态值为 0，说明锁未被任何线程持有。
       //不去检查 AQS 队列，直接上手去抢，体现了非公平性
       if (c == 0) {
           //同lock方法，CAS 尝试将锁的状态从 0 设置为 acquires。
           if (compareAndSetState(0, acquires)) {
               //将当前线程设置为锁的独占持有者。
               setExclusiveOwnerThread(current);
               return true;
           }
       }
       //如果锁的状态值不为 0，检查当前线程是否已经是锁的独占持有者
       //如果当前线程已经持有锁，则属于重入锁的情况。
       else if (current == getExclusiveOwnerThread()) {
           // 计算新的锁状态值
           int nextc = c + acquires;
           //超过了锁的最大重入次数，抛出错误
           if (nextc < 0) // overflow
               throw new Error("Maximum lock count exceeded");
           //更新锁状态值
           setState(nextc);
           return true; //当前线程成功重入了锁。
       }
       //当前锁被别的线程持有，获取锁失败
       return false;
   }
   ```

   

2. 接下来进入 `addWaiter` 逻辑，创建当前线程的节点并将其插入队列尾部，最后返回该结点。

   - 图中黄色三角表示该Node的`waitStatus`状态，其中0为默认正常状态
   - 其中第一个 Node 称为 Dummy（哑元）或哨兵，用来占位，并不关联线程

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250401180640249-2025-4-118:06:41.png" style="zoom:80%;" />

   

   ```java
   private Node addWaiter(Node mode) {
       //将当前线程和模式 `mode` 作为参数，创建结点
       Node node = new Node(Thread.currentThread(), mode);
       //获取当前队列的尾节点 `tail`
       Node pred = tail;
       
   	//队列中已有结点，将当前节点插入到尾部
       if (pred != null) {
           node.prev = pred;
           if (compareAndSetTail(pred, node)) {
               pred.next = node;
               return node;
           }
       }
       //如果尾节点为空或 CAS 操作失败，执行完整的入队逻辑
       enq(node);
       //返回该节点
       return node;
   }
   ```

3. 接下来进入acquireQueued 逻辑。在acquireQueued 中，如果前驱结点是头结点，那么会在一个自旋中不断尝试获得锁，失败一定次数后进入 park 阻塞。

   - 当前Thread-1的前驱结点是头结点，在第一次循环中尝试获取锁，此时state仍为1，CAS失败。
   - 进入 shouldParkAfterFailedAcquire 逻辑，判断当前线程是否需要阻塞等待，这次返回 false；同时将前驱 node，即 head 的 waitStatus 改为 -1，表示如果阻塞，由它唤醒当前节点

   <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250401190800962-2025-4-119:08:02.png" style="zoom:80%;" />

   - 当自旋尝试了一定次数（3次）后，shouldParkAfterFailedAcquire 返回true，认为应该阻塞当前线程。此时调用parkAndCheckInterrupt使用`LockSupport.park`阻塞当前线程

     <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250401191050494-2025-4-119:10:51.png" style="zoom:80%;" />

   ```java
   final boolean acquireQueued(final Node node, int arg) {
       //标记当前获取锁的尝试是否失败。
       boolean failed = true;
       try {
           //记录当前线程在等待过程中是否被中断
           boolean interrupted = false;
           // 使用无限循环，表示线程会持续尝试获取锁，直到成功为止。
           for (;;) {
               //获取当前节点的前驱结点
               final Node p = node.predecessor();
               //如果前驱结点是头结点，则再尝试获取锁一次
               if (p == head && tryAcquire(arg)) {
                   //若获取锁成功，执行下面的逻辑
                   setHead(node); //将当前节点设置为头节点
                   p.next = null; // 将前驱节点的 `next` 指针置为 `null`，帮助垃圾回收器回收前驱节点。
                   failed = false;//置为 `false`，表示获取锁的尝试成功。
                   return interrupted; //返回当前线程在等待过程中是否被中断
               }
               //获取锁失败，判断当前线程是否要阻塞等待，若需要则使用Lock.park挂起当前线程，并检查是否被中断。
               if (shouldParkAfterFailedAcquire(p, node) &&
                   parkAndCheckInterrupt())
                   //如果线程在挂起过程中被中断，将interrupted置为true
                   interrupted = true;
           }
       } finally {
           //如果最终仍获取锁尝试失败，将当前节点从队列中移除，并清理相关状态。
           if (failed)
               cancelAcquire(node);
       }
   }
   ```

   ```java
   //判断当前线程是否需要挂起
   private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) { 
   	//获取前驱节点的状态
       int ws = pred.waitStatus; 。
        /*
         * 如果前驱节点的状态是 `Node.SIGNAL`，表示前驱节点会在释放锁时通知当前节点。
         * 当前节点可以安全地挂起等待。
        */
       if (ws == Node.SIGNAL) 
           return true; // 返回 `true`，表示当前线程需要挂起。
       
        /*
        * 如果前驱节点的状态大于 0，表示前驱节点已被取消。
        * 需要跳过所有已取消的前驱节点，并重新建立链表连接。
        */
       if (ws > 0) { 
           //循环，直到找到一个有效的前驱节点
           do { 
               // 将当前节点的 `prev` 指针指向前驱节点的前驱节点，跳过已取消的节点。
               node.prev = pred = pred.prev; 
           } while (pred.waitStatus > 0); 
   
           pred.next = node; //重新建立链表连接
           
       } 
       /*
       * 如果前驱节点的状态是 0 或 `Node.PROPAGATE`（传播状态），
       * 表示前驱节点未设置信号状态。
       * 将前驱节点的状态更新为 `Node.SIGNAL`，表示需要通知当前节点。
       */
       else { 
           //使用CAS操作将前驱节点的状态从 `ws` 更新为 `Node.SIGNAL`
           compareAndSetWaitStatus(pred, ws, Node.SIGNAL); 
       }
       
       // 返回 `false`，表示当前线程暂时不需要挂起，调用方需要重新尝试获取锁。
       return false; 
   }
   
   ```

   ```java
   private final boolean parkAndCheckInterrupt() {
       //park阻塞当前线程
       LockSupport.park(this);
       //返回是否被打断，且清除打断标记，以便下次park生效
       return Thread.interrupted();
   }
   ```

##### 解锁

如果再次有多个线程经历上述过程竞争失败，变成这个样子

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250401192428398-2025-4-119:24:29.png" style="zoom:80%;" />

此时Thread-0释放锁，进入`unlock`流程。

如果执行`tryRelease`方法解锁成功：

- 设置exclusiveOwnerThread为null

- 将`state`置为0

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250401202311814-2025-4-120:23:13.png" style="zoom:80%;" />

- 唤醒阻塞等待的线程

  当前队列head不为 null，并且 head 的 waitStatus = -1，进入 unparkSuccessor 流程：即找到队列中离 head 最近的一个 Node（没取消的），unpark 恢复其运行，本例中为 Thread-1

  回到 Thread-1 的 acquireQueued 流程，唤醒Thread-1后：

  - 它下次循环中执行tryAcquire尝试获取锁，此时只有它一个在进行获取锁的操作，会成功获取锁。

    <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250401203530264-2025-4-120:35:31.png" style="zoom:80%;" />

  - 如果这时候有其它线程来竞争（非公平的体现），例如这时有 Thread-4 来了并且成功获取到了锁，则Thread-4被设置为 exclusiveOwnerThread，state = 1；Thread-1 再次进入 acquireQueued 流程，获取锁失败，重新进入 park 阻塞。

    <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250401203504484-2025-4-120:35:05.png" style="zoom:80%;" />

```java
public void unlock() {
    sync.release(1);
}

public final boolean release(int arg) {
    //使用tryRelease进行解锁
    if (tryRelease(arg)) {
        //如果解锁成功，
        Node h = head;
        if (h != null && h.waitStatus != 0)
            //唤醒等待的线程
            unparkSuccessor(h);
        return true;
    }
    //解锁失败
    return false;
}

//解锁的逻辑， release为1
protected final boolean tryRelease(int releases) {
    //计算新的状态值，即state--
    int c = getState() - releases;
    //判断当前线程没有有权限释放锁
    if (Thread.currentThread() != getExclusiveOwnerThread())
        throw new IllegalMonitorStateException();
    boolean free = false;
    //如果state减为0，说明锁已完全释放，返回true
    //如果state还不为0，说明还存在锁重入，返回false
    if (c == 0) {
        free = true;
        setExclusiveOwnerThread(null);
    }
    setState(c);
    return free;
}

//唤醒后继结点的逻辑
private void unparkSuccessor(Node node) { 

    // 获取当前节点的等待状态
    int ws = node.waitStatus; 
     // 如果当前节点的状态为负值
    if (ws < 0) 
        // 如果当前节点的状态为负值，表示可能需要信号。
        
        compareAndSetWaitStatus(node, ws, 0); 
        // 使用 CAS（Compare-And-Swap）操作，将当前节点的状态从 `ws` 更新为 0。
        // 如果 CAS 操作失败，说明状态已被其他线程修改，但这不会影响正确性。

    /*
     * 需要唤醒的线程通常存储在当前节点的后继节点中。
     * 但如果后继节点已被取消（状态大于 0）或为空，
     * 则需要从链表尾部向前遍历，找到第一个有效的后继节点。
     */
    Node s = node.next; 
    // 获取当前节点的后继节点 `next`。

    if (s == null || s.waitStatus > 0) { 
        // 如果后继节点为空（`s == null`）或已取消（`s.waitStatus > 0`），
        // 则需要从链表尾部向前查找第一个有效的后继节点。

        s = null; 
        // 将 `s` 初始化为 `null`，表示尚未找到有效的后继节点。

        for (Node t = tail; t != null && t != node; t = t.prev) 
            // 从链表尾部开始向前遍历，直到找到有效的后继节点或遍历到当前节点为止。

            if (t.waitStatus <= 0) 
                // 如果节点的状态小于等于 0（表示未取消），则将其作为有效的后继节点。
                s = t;
    }

    if (s != null) 
        // 如果找到有效的后继节点 `s`，则唤醒其对应的线程。
        LockSupport.unpark(s.thread); 
        // 调用 `LockSupport.unpark` 方法，唤醒后继节点 `s` 的线程。
}

```

#### 公平原理

公平锁和非公平锁的区别就在与`tryAcquire`方法的实现

- 在非公平锁的实现中，判断锁的state = 0，说明锁空闲，此时不去检查AQS队列直接上手去抢。
- 在公平锁的实现中，判断锁的state = 0，此时先检查AQS队列中是否有前驱结点，没有后才去竞争

```java
/**
* Sync object for fair locks
*/
static final class FairSync extends Sync {
    private static final long serialVersionUID = -3000897897090466540L;

    final void lock() {
        acquire(1);
    }

    /**
    * Fair version of tryAcquire.  Don't grant access unless
    * recursive call or no waiters or is first.
    */
    protected final boolean tryAcquire(int acquires) {
        final Thread current = Thread.currentThread();
        int c = getState();
        //当前锁对象空闲
        if (c == 0) {
            // 先检查 AQS 队列中是否有前驱节点, 没有才去竞争
            if (!hasQueuedPredecessors() &&
                compareAndSetState(0, acquires)) {
                setExclusiveOwnerThread(current);
                return true;
            }
        }
        //锁重入
        else if (current == getExclusiveOwnerThread()) {
            int nextc = c + acquires;
            if (nextc < 0)
                throw new Error("Maximum lock count exceeded");
            setState(nextc);
            return true;
        }
        return false;
    }
}
```

```java
public final boolean hasQueuedPredecessors() {    
    Node t = tail;
    Node h = head;
    Node s;    
    return h != t &&
        // 头尾之间有节点，判断头节点的下一个是不是空
        // 不是空进入最后的判断，第二个节点的线程是否是本线程，不是返回 true，表示当前节点有前驱节点
        ((s = h.next) == null || s.thread != Thread.currentThread());
}
```



### 可重入原理

在加锁过程中，如果当前线程已经是锁的owner，则锁的状态值`state++`（锁重入次数+1）

- 若超过了锁的最大重入次数，则抛出Error。
- 否则，重新设置`state`并返回true，表示再次获取锁成功。

在解锁过程中，首先得到新的状态值`state--`（锁重入次数-1）

- 若`state`减为了0，说明锁已经完全释放，设置exclusiveOwnerThread为null，返回true，解锁成功
- 若`state`不为0，则说明还存在锁重入，返回false，解锁失败



```java
static final class NonfairSync extends Sync {
    //...其他方法
    
    //加锁，acquires是1
    final boolean nonfairTryAcquire(int acquires) {
        final Thread current = Thread.currentThread();
        //获取当前锁的状态值
        int c = getState();
        // 如果当前锁的状态值为 0，说明锁未被任何线程持有。
        if (c == 0) {
            //同lock方法，CAS 尝试将锁的状态从 0 设置为 acquires。
            if (compareAndSetState(0, acquires)) {
                //将当前线程设置为锁的独占持有者。
                setExclusiveOwnerThread(current);
                return true;
            }
        }
        //如果锁的状态值不为 0，检查当前线程是否已经是锁的独占持有者
        //如果当前线程已经持有锁，则属于重入锁的情况。
        else if (current == getExclusiveOwnerThread()) {
            // 计算新的锁状态值c+1,即 state++
            int nextc = c + acquires;
            //超过了锁的最大重入次数，抛出错误
            if (nextc < 0) // overflow
                throw new Error("Maximum lock count exceeded");
            //更新锁状态值
            setState(nextc);
            return true; //当前线程成功重入了锁。
        }
        //当前锁被别的线程持有，获取锁失败
        return false;
	}
    
    //解锁， release为1
    protected final boolean tryRelease(int releases) {
        //计算新的状态值，即state--
        int c = getState() - releases;
        //判断当前线程没有有权限释放锁
        if (Thread.currentThread() != getExclusiveOwnerThread())
            throw new IllegalMonitorStateException();
        boolean free = false;
        //如果state减为0，说明锁已完全释放，返回true
        //如果state还不为0，说明还存在锁重入，返回false
        if (c == 0) {
            free = true;
            setExclusiveOwnerThread(null);
        }
        setState(c);
        return free;
    }
}
```

### 可打断原理

#### 不可打断模式

通过`lock()`方法获取到的就是不可打断的锁。

在此模式下，如果线程在阻塞过程中被打断，它仍会驻留在 AQS 队列中，不会立即响应。只会保存被打断的记录（将interrupted置为true），只有成功获取锁后方能得知自己被打断了。

```java
// Sync 继承自 AQS
static final class NonfairSync extends Sync {
    //...其他方法
    
    private final boolean parkAndCheckInterrupt() {
        //park阻塞当前线程
        LockSupport.park(this);
        //返回是否被打断，且清除打断标记，以便下次park生效
        return Thread.interrupted();
    }
    
    
    final boolean acquireQueued(final Node node, int arg) {
        boolean failed = true;
        try {
            //记录当前线程在等待过程中是否被中断
            boolean interrupted = false;
            for (;;) {
                final Node p = node.predecessor();
                //如果前驱结点是头结点，则再尝试获取锁一次
                if (p == head && tryAcquire(arg)) {
                    //若获取锁成功
                    setHead(node); 
                    p.next = null; 
                    failed = false;
                    return interrupted; //返回当前线程在等待过程中是否被中断
                }
                //判断当前线程是否要阻塞等待，若需要则使用Lock.park挂起当前线程，并检查是否被中断。
                if (shouldParkAfterFailedAcquire(p, node) &&
                    parkAndCheckInterrupt())
                    //如果线程在挂起过程中被中断，将interrupted置为true，之后进入下一轮循环再次尝试获取锁
                    interrupted = true;
            }
        } finally {
            if (failed)
                cancelAcquire(node);
        }
    }
    
    public final void acquire(int arg) {    
        if (!tryAcquire(arg)
            &&
            //如果线程在获取资源的过程中被中断，acquireQueued返回true。
            acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
            // 线程在等待过程中被中断，调用selfInterrupt()方法，重新设置线程的中断状态
            selfInterrupt(); 
    }
    
    static void selfInterrupt() {
        //设置线程的中断标志位为true，响应中断
        Thread.currentThread().interrupt();
    }
}
```



#### 可打断模式

通过`lockInterruptibly()`获取到的就是可打断的锁

在此模式下，park中的线程被打断，会直接抛出打断异常。这样会退出AQS队列，放弃获取锁，进而响应中断。

```java
public void lockInterruptibly() throws InterruptedException {
    sync.acquireInterruptibly(1);
}

public final void acquireInterruptibly(int arg)
    throws InterruptedException {
    if (Thread.interrupted())
        throw new InterruptedException();
    //如果获取锁失败
    if (!tryAcquire(arg))
        doAcquireInterruptibly(arg);
}

private void doAcquireInterruptibly(int arg)
    throws InterruptedException {
    final Node node = addWaiter(Node.EXCLUSIVE);
    boolean failed = true;
    try {
        for (;;) {
            final Node p = node.predecessor();
            if (p == head && tryAcquire(arg)) {
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return;
            }
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                // 在 park 过程中如果被 interrupt，这时候抛出异常, 而不会再次进入 for (;;)
                throw new InterruptedException();
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
```



### 条件变量实现原理

每个 Condition 实例维护一个 单向条件队列，节点类型为 Node，其 waitStatus 标记为` CONDITION` (-2)。队列通过 firstWaiter 和 lastWaiter 指针管理，其实现类是 ConditionObject。

```java
public class ConditionObject implements Condition {
    private transient Node firstWaiter; // 条件队列头节点
    private transient Node lastWaiter;  // 条件队列尾节点
}
```

#### await

总的执行流程如下：

持有锁的线程调用`await()`方法

- 首先创建Node节点，将当前线程封装为 `Node`，加入条件队列尾部；
- 完全释放当前线程持有的所有锁（可能存在锁重入的情况，需要完全释放）；
- 通过 `LockSupport.park()` 挂起线程，等待被唤醒；
- 被唤醒后，将节点转移到 AQS线程等待队列，重新尝试获取锁。

```java
public final void await() throws InterruptedException {
    if (Thread.interrupted())
        throw new InterruptedException();
    // 1. 将当前线程包装成一个条件队列节点，并加入条件队列
    Node node = addConditionWaiter();
    // 2. 完全释放当前线程持有的锁（返回当前锁的持有次数）
    int savedState = fullyRelease(node);
    int interruptMode = 0;
    // 3. 循环检查节点是否被转移到 CLH 队列
    //如果节点不在同步队列中，表示线程仍在条件队列中等待
    while (!isOnSyncQueue(node)) {
        LockSupport.park(this); // 阻塞当前线程线程，直到被通知、被中断或超时。
        // 4. 检查是否被中断（处理中断逻辑）
        if ((interruptMode = checkInterruptWhileWaiting(node)) != 0)
            break;
    }
    // 5. 在 CLH 队列中重新获取锁
    if (acquireQueued(node, savedState) && interruptMode != THROW_IE)
        interruptMode = REINTERRUPT;
    // 6. 清理已取消的节点
    if (node.nextWaiter != null)
        unlinkCancelledWaiters();
    // 7. 处理中断模式
    if (interruptMode != 0)
        reportInterruptAfterWait(interruptMode);
}
```



例子：开始 Thread-0 持有锁，调用 await，进入addConditionWaiter 流程。在此方法中，创建新的 Node 状态为 -2（Node.CONDITION），关联 Thread-0，加入等待队列尾部

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250401225116189-2025-4-122:51:27.png" style="zoom:80%;" />

```java
private Node addConditionWaiter() {
    //获取条件队列的尾部结点指针
    Node t = lastWaiter;
    //清理尾部中已失效的结点，它们可能已经超时或者被打断放弃获取锁
    if (t != null && t.waitStatus != Node.CONDITION) {
        unlinkCancelledWaiters();
        t = lastWaiter;
    }
    //新建state为CONDITION的节点并关联当前线程
    Node node = new Node(Thread.currentThread(), Node.CONDITION);
    
    //将新结点加入队列尾部
    if (t == null)
        firstWaiter = node;
    else
        t.nextWaiter = node;
    lastWaiter = node;
    //返回该结点
    return node;
}
```

接下来进入AQS 的 fullyRelease 流程，释放同步器上的锁。可能存在锁重入的情况，在fullRelase方法中，获取锁重入的次数，内部调用release方法将state置为0，完全释放锁后还会唤醒阻塞中的线程来竞争锁。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250401232323936-2025-4-123:23:25.png" style="zoom:80%;" />

```java
final int fullyRelease(Node node) {
    boolean failed = true;
    try {
        //可能发生了锁重入，state不一定是1，而是重入的次数
        int savedState = getState();
        //调用release释放锁
        if (release(savedState)) {
            failed = false;
            return savedState; //释放锁成功，返回重入次数
        } else {
            //当前线程未持有锁
            throw new IllegalMonitorStateException();
        }
    } finally {
        //总会执行：如果释放失败，将当前节点的等待状态设置为 `CANCELLED`，表示该节点已取消。
        if (failed)
            node.waitStatus = Node.CANCELLED;
    }
}

public final boolean release(int arg) {
    if (tryRelease(arg)) {
        Node h = head;
        // 如果头节点不为空，并且其等待状态不为 0（表示有线程在等待信号），则需要唤醒后继节点
        if (h != null && h.waitStatus != 0)
            //唤醒指定节点的后继节点（即等待线程）
            //如果后继节点为空或已取消，会从队列尾部向前查找第一个有效节点并唤醒。
            unparkSuccessor(h);
        return true;
    }
    //锁未完全释放，返回 `false`。
    return false;
}

protected final boolean tryRelease(int releases) {
    //此处传入的release就是state，c一定为0
    int c = getState() - releases;
    if (Thread.currentThread() != getExclusiveOwnerThread())
        throw new IllegalMonitorStateException();
    boolean free = false;
    if (c == 0) {
        free = true;
        //将锁的owner置为null
        setExclusiveOwnerThread(null);
    }
    setState(c);
    return free; //此时free为true
}
```

将Thread-0持有的锁释放后，首先会尝试唤醒等待队列中，头结点的下一个结点对应的线程（此处是Thread-1）。若它为空或已取消，会从队列尾部向前查找第一个有效节点并唤醒。总之会再从AQS等待队列中唤醒一个线程让它竞争锁。此时假设没有其他竞争线程，那么 Thread-1 竞争成功

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250402105444581-2025-4-210:55:03.png" style="zoom:80%;" />

最后Thread-0通过park阻塞自己，等待被唤醒

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250401233125290-2025-4-123:31:36.png" style="zoom:80%;" />

#### signal

当调用 `Condition.signal()` 时：

1. 将条件队列的**首节点**转移到 CLH 队列尾部，将节点状态从 `CONDITION` 改为 `0`，并返回其前驱节点。
3. 若能将前驱结点的状态设置为`SIGNAL`(-1)，则等待被前驱节点唤醒后继续竞争锁；若前驱节点已释放锁，则直接唤醒线程。

例子：假设 Thread-1 要来唤醒 Thread-0

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250401233125290-2025-4-123:31:36.png" style="zoom:80%;" />

进入 ConditionObject 的 doSignal 流程，取得条件队列中第一个 Node，即 Thread-0 所在 Node。执行 transferForSignal 流程，将该 Node 加入 AQS 队列尾部，将 Thread-0 的 waitStatus 改为 0，Thread-3 的waitStatus 改为 -1

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250401235956580-2025-4-200:00:08.png" style="zoom:80%;" />

```java
public final void signal() {
    // 检查当前线程是否持有锁，必须持有锁才能唤醒wait的线程
    if (!isHeldExclusively())
        throw new IllegalMonitorStateException();
    Node first = firstWaiter;
    if (first != null)
        doSignal(first); // 转移并唤醒头节点
}

private void doSignal(Node first) {
    do {
        // 将 firstWaiter 指向下一个节点
        if ((firstWaiter = first.nextWaiter) == null)
            lastWaiter = null;//如果下一个节点为null说明队列为空，将lastWaiter也置为null
        first.nextWaiter = null;
    } while (!transferForSignal(first) // 尝试转移节点
             && //可能该节点对应的线程已经超时取消或者中断，转移失败，则尝试转移条件队列中的下一个节点
             (first = firstWaiter) != null);
}

// 将节点从条件队列转移到 CLH 队列
final boolean transferForSignal(Node node) {
    // 1. CAS 修改节点状态：CONDITION -> 0
    if (!node.compareAndSetWaitStatus(Node.CONDITION, 0))
        return false;

    // 2. 将节点加入 CLH 队列尾部，并返回其前驱结点
    Node p = enq(node);
    int ws = p.waitStatus;

    // 3. 若前驱节点已取消或无法设置 SIGNAL 状态，直接唤醒线程
    if (ws > 0 || !p.compareAndSetWaitStatus(ws, Node.SIGNAL))
        LockSupport.unpark(node.thread);
    return true;
}

```

## 8.3、读写锁

### ReentrantReadWriteLock

`ReentrantReadWriteLock` 是 Java 并发包中基于 **AQS** 实现的读写分离锁。

通过 **读锁（共享）** 和 **写锁（独占）** 的分离，显著提升多线程环境下 **读多写少** 场景的性能。

当读操作远远高于写操作时，这时候使用 读写锁 让 **读-读** 可以并发，提高性能。类似于数据库中的 select ...from ... lock in share mode

基本使用

```java
class CacheData{
    private Object data;
    private ReentrantReadWriteLock rw = new ReentrantReadWriteLock();
    //读锁
    private ReentrantReadWriteLock.ReadLock readLock = rw.readLock();
    //写锁
    private ReentrantReadWriteLock.WriteLock writeLock = rw.writeLock();

    //读操作
    public Object read() {
        //加读锁
        readLock.lock();
        try {
            log.debug("读取...");
            return data;
        }finally {
            //解锁
            readLock.unlock();
        }
    }

    //写操作
    public void write() {
        //加写锁
        writeLock.lock();
        try {
            log.debug("写入...");
        }finally {
            //解锁
            writeLock.unlock();
        }
    }
}
```

核心特性：

- 读写分离

  读锁（ReadLock）：共享锁，允许多个线程同时读。

  写锁（WriteLock）：独占锁，同一时刻只允许一个线程写，且排斥读和其他写操作。

  {% note warning %}

  写锁是排它锁，写锁要求当前没有其他线程持有读锁或写锁，才能成功获取。（保证对共享资源进行独占访问）

  读锁是共享锁，允许多个线程同时持有，只要没有线程持有写锁。

  {% endnote %}

- 可重入性

  同一线程可重复获取读锁或写锁，重入次数独立记录，避免死锁。

  - 重入时升级不支持：即持有读锁的情况下去获取写锁，会导致获取写锁永久等待。

  - 重入时降级支持：即持有写锁的情况下可以去获取读锁，随后释放写锁，实现从写锁到读锁的降级。

    ```java
    writeLock.lock(); // 获取写锁
    try {
        // 修改数据
        readLock.lock(); // 获取读锁（锁降级）
    } finally {
        writeLock.unlock(); // 释放写锁，保留读锁
    }
    
    try {
        // 读取数据（仍持有读锁）
    } finally {
        readLock.unlock();
    }
    ```

    

- 公平性选择

  支持公平模式（按队列顺序获取锁）和非公平模式（允许插队）。

#### 应用

在缓存更新时，为了保证数据库和缓存中数据的一致性，应该先操作那个数据呢？

- 先删除缓存再操作数据库，由于更新数据库耗时较长，很有可能在此期间有其他线程查询缓存失败，然后查询到数据库中的旧数据并回填缓存，最终造成数据库和缓存数据的不一致，并且后续的读请求都会命中过期的缓存。

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20241212142243185-2024-12-1214:22:52.png" alt="image-20241212142243185" style="zoom:67%;" />

- 先操作数据库再删除缓存，可能线程1在操作数据库期间有其他线程读请求命中缓存，返回了过期的数据，之后线程1才删除了缓存。再次期间会出现短暂的数据不一致，但后续的读请求到来，缓存未命中，会从数据库中读取到新的数据并回填缓存，之后的读请求都会返回缓存中的新数据。

  <img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250402183231336-2025-4-218:43:18.png" style="zoom:80%;" />

相比而言，先操作数据库再删除缓存造成的不一致只是暂时的，后续请求会缓存新值，无长期问题。但是为了解决这里短暂的不一致性，可以通过加锁的方式解决，此处采用读写锁来进一步提高性能。

- 从缓存读取数据时为其加读锁；当缓存未命中需要查询数据库回填缓存时，先释放之前的读锁，再添加写锁
- 为更新数据库和删除缓存的操作加写锁

```java
//伪代码如下
ReentrantReadWriteLock lock = new ReentrantReadWriteLock()
    
public T queryOne(Class<T> beanClass, String sql, Object... params) {
    SqlPair key = new SqlPair(sql, params);
    // 加读锁, 防止其它线程对缓存更改
    lock.readLock().lock();
    try {
        T value = map.get(key);//读取缓存
        if (value != null) {
            return value;
        }
    } finally {
        lock.readLock().unlock();
    }
    
    // 加写锁, 防止其它线程对缓存读取和更改
    lock.writeLock().lock();
    try {
        // get 方法上面部分是可能多个线程进来的, 可能已经向缓存填充了数据
        // 为防止重复查询数据库, 再次验证
        T value = map.get(key);
        if (value == null) {
            // 如果没有, 查询数据库
            value = genericDao.queryOne(beanClass, sql, params);
            map.put(key, value);
        }
        return value;
    } finally {
        lock.writeLock().unlock();
    }
}
```

```java
public int update(String sql, Object... params) {
    SqlPair key = new SqlPair(sql, params);
    // 加写锁, 防止其它线程对缓存读取和更改
    lock.writeLock().lock();
    try {
        int rows = genericDao.update(sql, params);
        map.clear();
        return rows;
    } finally {
        lock.writeLock().unlock();
    }
}
```

#### 原理

ReentrantReadWriteLock的类结构：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250402204319412-2025-4-220:43:25.png" style="zoom:80%;" />

- 包含内部类 ReadLock 、 WriteLock、Sync、FairSync和NonfairSync
- Sync 继承自 AQS，实现读写锁的核心逻辑。
- FairSync 和 NonfairSync 继承 Sync，分别实现公平和非公平策略。默认使用非公平，可以在构造参数中指定策略。

读锁和写锁用的都是同一个同步器（FairSync 或者NonfairSync），因此等待队列、state 等也是同一个

其中：

- **state 高 16 位**：记录**读锁**的持有次数（共享计数）。
- **state 低 16 位**：记录**写锁**的重入次数（独占计数）。
- 通过 `exclusiveCount(int c)` 和 `sharedCount(int c)` 提取高低位。

加锁和解锁的整体流程与ReentrantLock类似。

##### 加锁

写锁的加锁流程

```java
//方法调用链
WriteLock.lock() 
	→ AQS.acquire(1) 
		→ Sync.tryAcquire(1) //尝试加锁
		→ AQS.acquireQueued //加锁失败，自旋尝试获取锁一定次数后，park阻塞该线程    
```

```java
//1、writeLock.lock
public void lock() {
    sync.acquire(1);
}

//2、AQS.acquire(1) 
public final void acquire(int arg) {
 	//2.1、使用tryAcquire尝试加锁，成功返回true
    //2.2、加锁失败后使用addWaiter创建Node结点加入CLH队列
    //2.3、在acquireQueued逻辑中，自旋尝试获取锁一定次数后，park阻塞该线程
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}

//3.Sync.tryAcquire(1)
protected final boolean tryAcquire(int acquires) {
    Thread current = Thread.currentThread();
    int c = getState();// 获取同步器状态
    int w = exclusiveCount(c); // 获取 *写锁* 计数
	
    // 锁已经被某些线程持有（可能是读锁或写锁）
    if (c != 0) { 
        //获取锁失败的情况：
        // 1、c!=0 而 w = 0,即第16位为0而整体不为0，说明存在读锁，此时获取写锁失败
        // 2、已存在写锁且锁的持有者不是自己，获取锁失败
        if (w == 0 || current != getExclusiveOwnerThread()) 
            return false;
        // 重入次数超限，抛出错误
        if (w + acquires > MAX_COUNT) 
            throw new Error("Maximum lock count exceeded");
        //锁重入，更新写锁计数
        setState(c + acquires); 
        return true; 
    }

    // 无锁，尝试获取写锁
    //1、writerShouldBlock()是父类Sync同步器中的方法，体现公平和非公平
    //若当前使用的是NonfairSync子类，重写后直接返回false
    //若当前使用的是fairSync子类，重写后判断前面是否还有前驱结点，没有后才去竞争
    //2、若可以获取锁，则使用CAS操作修改state，修改成功则获取到了锁，否则获取锁失败
    if (writerShouldBlock() || !compareAndSetState(c, c + acquires)) 
        return false;
    //获取写锁成功，设置当前线程为独占线程
    setExclusiveOwnerThread(current); 
    return true;
}

//4.AQS.acquireQueued
final boolean acquireQueued(final Node node, int arg) {
    boolean failed = true;//标记当前获取锁的尝试是否失败。
    try {
        boolean interrupted = false;//记录当前线程在等待过程中是否被中断
        // 使用无限循环，表示线程会持续尝试获取锁，直到成功为止。
        for (;;) {
            //获取当前节点的前驱结点
            final Node p = node.predecessor();
            //如果前驱结点是头结点，则再尝试获取锁一次
            if (p == head && tryAcquire(arg)) {
                //若获取锁成功，执行下面的逻辑
                setHead(node); //将当前节点设置为头节点
                p.next = null; // 将前驱节点的 `next` 指针置为 `null`，帮助垃圾回收器回收前驱节点。
                failed = false;//置为 `false`，表示获取锁的尝试成功。
                return interrupted; //返回当前线程在等待过程中是否被中断
            }
            //获取锁失败，判断当前线程是否要阻塞等待，若需要则使用Lock.park挂起当前线程，并检查是否被中断。
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                //如果线程在挂起过程中被中断，使用interrupted记录下来，获取锁成功后使用
                interrupted = true;
        }
    } finally {
        //如果最终仍获取锁尝试失败，将当前节点从队列中移除，并清理相关状态。
        if (failed)
            cancelAcquire(node);
    }
}
```
例如：t1线程加写锁成功，流程与 ReentrantLock 加锁相比没有特殊之处

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250402214713981-2025-4-221:47:23.png" style="zoom:80%;" />



***

读锁的加锁流程

```java
//方法调用链
ReadLock.lock() 
    → AQS.acquireShared(1) 
            //尝试获取读锁，返回值含义（读写锁只返回-1或1）
                //-1：获取锁失败
                //0：表示成功，但后继结点不会继续唤醒
                //正数：表示成功，数值是还有几个后继节点需要唤醒
        → Sync.tryAcquireShared(1) 
            //返回了-1，获取锁失败。创建该线程的Node结点，加入CLH队列，自旋重试，失败一定次数后park阻塞
            //与写锁的结点不同，此处结点的mode是Node.SHARED，而不是Node.EXCLUSIVE
        → AQS.doAcquireShared(1)    
```

```java
//1、ReadLock.lock() 
public void lock() {
    sync.acquireShared(1);
}
//2、AQS.acquireShared(1) 
public final void acquireShared(int arg) {
    if (tryAcquireShared(arg) < 0)
        doAcquireShared(arg);
}

//3、Sync.tryAcquireShared(1)
protected final int tryAcquireShared(int unused) {
    Thread current = Thread.currentThread();
    int c = getState();

    // 存在写锁且非当前线程持有，获取失败，返回-1
    if (exclusiveCount(c) != 0 && getExclusiveOwnerThread() != current)
        return -1;
    int r = sharedCount(c); // 读锁计数
    
    //三个判断条件，都为true表示获取到了读锁
    //1、readerShouldBlock()：根据当前采取的公平策略，判断是否要阻塞当前线程
    	//公平锁：如果队列中有其他线程等待，则返回 true，表示当前线程应该阻塞。否则返回 false，表示当前线程可以继续获取锁。
        //非公平锁：如果队列中第一个线程是写线程，则返回 true，表示当前线程应该阻塞，优先让写线程获取锁。如果队列为空，或者队列中第一个线程不是写线程，则返回 false，表示当前线程可以继续获取锁。
    //2、检查读锁计数是否超过最大值
    //3、CAS 更新高16位，即读锁计数+SHARED_UNIT，如果成功，则说明当前线程成功获取了读锁。
    if (!readerShouldBlock() && r < MAX_COUNT 
        && compareAndSetState(c, c + SHARED_UNIT)) {
        //...其他优化操作
        return 1; // 获取成功
    }
    // 自旋重试或排队
    return fullTryAcquireShared(current);
}

//4、AQS.doAcquireShared(1)
private void doAcquireShared(int arg) {
    //创建关联当前线程的Node结点，其类型是SHARED，将其加入AQS等待队列
    final Node node = addWaiter(Node.SHARED);
    boolean failed = true;
    try {
        boolean interrupted = false;
        //自旋
        for (;;) {
            final Node p = node.predecessor();
            //1、如果前驱结点是头结点，再次尝试获取锁
            if (p == head) {
                int r = tryAcquireShared(arg);
                //获取锁成功
                if (r >= 0) {
                    // 将当前节点设置为头节点，并唤醒相连的后序的共享节点。
                    setHeadAndPropagate(node, r);
                    p.next = null; // help GC
                    if (interrupted)
                        selfInterrupt();
                    failed = false;
                    return;
                }
            }
            //2、判断是否需要park当前线程，若需要，则park阻塞
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
```

例如，之前t1线程已经加了写锁，t2线程尝试加读锁

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250402223008893-2025-4-222:30:14.png" style="zoom:80%;" />

进入`tryAcquireShared`方法尝试获取读锁，由于已经加了写锁，此次获取读锁失败，返回-1。

执行`doAcquireShared`方法，也是调用 `addWaiter` 添加关联当前线程的Node节点，加入AQS等待队列。不同之处在于节点被设置为Node.SHARED 模式而非 Node.EXCLUSIVE 模式，注意此时 t2 仍处于活跃状态

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250402223417862-2025-4-222:34:19.png" style="zoom:80%;" />

然后进行自旋重试，判断自己是否是队列的第二个结点，若是则再次、调用 tryAcquireShared(1) 来尝试获取锁。

如果没有成功，则把前驱节点的 waitStatus 改为 -1，再循环一次尝试 tryAcquireShared(1) ，如果还不成功，那么在 parkAndCheckInterrupt() 处 park。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250402224504195-2025-4-222:45:25.png" style="zoom:80%;" />

这种状态下，假设又有 t3 加读锁和 t4 加写锁，这期间 t1 仍然持有锁，就变成了下面的样子

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250402225216277-2025-4-222:52:25.png" style="zoom:80%;" />

##### 解锁

写锁的解锁流程

```java
//方法调用链
WriteLock.unlock() 
	→ AQS.release(1) 
    	→ Sync.tryRelease(1) //尝试释放锁
    		→锁已完全释放,唤醒头结点的后继节点 AQS.unparkSuccessor(head),返回true
    		→锁未完全释放，存在锁重入，返回false
```

```java
//1、WriteLock.unlock() 
public void unlock() {
    sync.release(1);
}

//2、AQS.release(1) 
public final boolean release(int arg) {
    //尝试释放锁
    if (tryRelease(arg)) {
        //释放锁成功
        Node h = head;
        //说明有线程在等待，需要唤醒后续节点。
        if (h != null && h.waitStatus != 0)
            unparkSuccessor(h);
        return true; //释放锁成功
    }
    return false;//释放锁失败
}

//3、Sync.tryRelease(1)
protected final boolean tryRelease(int releases) {
    //判断当前线程是否有权释放锁，是否是锁的持有者
    if (!isHeldExclusively())
        throw new IllegalMonitorStateException();
   // 计算释放锁后的同步状态值：state-1
    int nextc = getState() - releases;
    // 检查新的状态值是否表示独占锁已完全释放。
    //1、完全释放：free=true，将当前线程从锁的持有线程记录中清除。
    //2、未完全释放：free=false，还存在锁重入
    boolean free = exclusiveCount(nextc) == 0;
    if (free)
        setExclusiveOwnerThread(null);
    //更新state
    setState(nextc);
    return free;
}
```

如果唤醒的结点是Node.SHARED 模式，它获取读锁后，它会依次唤醒后继中为Node.SHARED 模式的结点，直到遇到一个Node.EXCLUSIVE 模式的结点为止，让后续要获得读锁的线程运行起来。

```java
//方法调用链
//1、之前获取读锁时在该方中park阻塞
AQS.doAcquireShared(1) 
    //2、被唤醒后再次尝试获取读锁
    → Sync.tryAcquireShared(1) 
    //3、成功获取到了读锁，执行该方法
    //设置新的头节点并传播信号，尝试唤醒后继Node.SHARED 模式的结点
    → AQS.setHeadAndPropagate(node, r) 
    	//3、唤醒下一个共享模式的结点，然后回到1，直至将等待队列中连续的共享模式节点都唤醒为止
    	→ AQS.doReleaseShared()
    
```

```java
//3、AQS.setHeadAndPropagate(node, r)
	// 参数 `node` 是新的头节点，`propagate` 表示是否需要传播信号。
private void setHeadAndPropagate(Node node, int propagate) {
    Node h = head; 
    setHead(node);// 将传入的节点 `node` 设置为新的头节点。

    // 判断是否需要唤醒下一个节点：
    // - 如果 `propagate > 0`，表示需要传播信号。
    // - 如果旧头节点 `h` 为 null 或其 `waitStatus < 0`，表示需要唤醒。
    // - 如果新的头节点 `head` 为 null 或其 `waitStatus < 0`，也表示需要唤醒。
    if (propagate > 0 || h == null || h.waitStatus < 0 ||
        (h = head) == null || h.waitStatus < 0) {
        // 获取当前节点的下一个节点 `s`。
        Node s = node.next;
        
		 // 如果下一个节点 `s` 为 null 或处于共享模式，则调用doReleaseShared()唤醒等待队列中的共享模式节点。
        if (s == null || s.isShared())
            //确保共享锁的释放能够正确传播
            doReleaseShared();
    }
}

//4、AQS.doReleaseShared()
private void doReleaseShared() {
	// 无限循环，直到完成唤醒或状态更新。
    for (;;) {      
        Node h = head;
        if (h != null && h != tail) {
            int ws = h.waitStatus;// 获取头节点的等待状态
			//1、 如果头节点的状态是 SIGNAL（-1），表示需要唤醒后继节点：
            if (ws == Node.SIGNAL) {
                //使用CAS操作保证只有一个线程会来执行唤醒操作，如果某个线程CAS成功就由他来完成唤醒
                if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                    continue; 
                //唤醒头节点的后继节点。
                unparkSuccessor(h);
            }
            //2、如果头节点的状态是0，尝试将其状态设置为 PROPAGATE（-3），以确保释放操作能够继续传播。
            else if (ws == 0 &&
                       !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
                continue;
        }
        // 如果头节点没有发生变化，退出循环。如果发生变化（例如有新节点加入队列），需要重新检查。
        if (h == head)
            break;
    }
}
```



例如，t1线程释放写锁，最终执行`tryRelease`方法后变成如下状态：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250403000643861-2025-4-300:06:50.png" style="zoom:80%;" />

接下来执行唤醒流程，执行`Sync.unparkSuccessor`唤醒后继结点。此时在doAcquireShared 内 parkAndCheckInterrupt方法内阻塞的t2线程恢复运行，在下一次循环中通过tryAcquire方法获得到读锁

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250403001548850-2025-4-300:15:50.png" style="zoom:80%;" />

t2线程在下一次循环中通过tryAcquire方法获得到读锁，调用 setHeadAndPropagate(node, 1)，它原本所在节点被置为头节点

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250403001713277-2025-4-300:17:15.png" style="zoom:80%;" />

在 setHeadAndPropagate 方法内还会检查下一个节点是否是 shared，如果是则调用doReleaseShared() 将 head 的状态从 -1 改为 0 并唤醒老二，这时 t3从阻塞中唤醒。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250403002132373-2025-4-300:21:34.png" style="zoom:80%;" />

t3再通过tryAcquire方法成功获得到读锁，读锁计数加—

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250403002246622-2025-4-300:22:48.png" style="zoom:80%;" />

这时 t3 已经恢复运行，接下来 t3 调用 setHeadAndPropagate(node, 1)，它原本所在节点被置为头节点。

下一个节点不是 shared 了，因此不会继续唤醒 t4 所在节点

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250403002354537-2025-4-300:23:56.png" style="zoom:80%;" />

***

读锁的释放流程

```java
ReadLock.unlock() 
	→ AQS.releaseShared(1) 
    	//修改读锁计数（state高16位减一）
    		//若读锁重入次数减为0，返回true，可以释放读锁；
    		//若未减为0，返回false，还存在读锁的重入，不能释放锁。
		→ Sync.tryReleaseShared(1)
    	//若返回true，完全释放了读锁，则由该方法唤醒AQS等待队列头结点的下一个结点对应的线程进行锁竞争
		→ AQS.doReleaseShared()
```



```java
//1、ReadLock.unlock() 
public void unlock() {
    sync.releaseShared(1);
}

//2、AQS.releaseShared(1) 
public final boolean releaseShared(int arg) {
    //修改读锁计数，判断读锁计数是否减为0
    if (tryReleaseShared(arg)) {
        //唤醒等待队列中头结点的下一个结点对应的线程来竞争锁
        doReleaseShared();
        return true;
    }
    return false;
}

//3、Sync.tryReleaseShared(1)
protected final boolean tryReleaseShared(int unused) {
    Thread current = Thread.currentThread();
    if (firstReader == current) {
        // assert firstReaderHoldCount > 0;
        if (firstReaderHoldCount == 1)
            firstReader = null;
        else
            firstReaderHoldCount--;
    } else {
        HoldCounter rh = cachedHoldCounter;
        if (rh == null || rh.tid != getThreadId(current))
            rh = readHolds.get();
        int count = rh.count;
        if (count <= 1) {
            readHolds.remove();
            if (count <= 0)
                throw unmatchedUnlockException();
        }
        --rh.count;
    }
    // 自旋操作，直到成功更新状态
    for (;;) {
        int c = getState();
        int nextc = c - SHARED_UNIT;// 减少一个共享单元（表示释放一个读锁）
        // 原子更新同步状态
        if (compareAndSetState(c, nextc))
            return nextc == 0;// 如果更新后的状态为0，返回 true，表示所有锁已释放
    }
}

//4、AQS.doReleaseShared()
private void doReleaseShared() {
    for (;;) {
        Node h = head;
        if (h != null && h != tail) {
            int ws = h.waitStatus;
            //如果头结点的waitStatus是SIGNAL（-1），表示它要唤醒后继结点
            if (ws == Node.SIGNAL) {
                //原子更新头结点的waitStatus为0，确保只有一个线程来执行唤醒操作
                if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                    continue;            
                //唤醒后继结点对应的线程
                unparkSuccessor(h);
            }
            else if (ws == 0 &&
                     !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
                continue;                // loop on failed CAS
        }
        if (h == head)                   // loop if head changed
            break;
    }
}
```



例如：t2和t3线程分别执行unlock释放读锁，开始时读写锁的状态如下：

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250403002354537-2025-4-300:23:56.png" style="zoom:80%;" />

t2 进入 sync.releaseShared(1) 中，调用 tryReleaseShared(1) 让计数减一，但由于计数还不为零，返回false。

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250405193034583-2025-4-519:31:00.png" style="zoom:80%;" />

t3 进入 sync.releaseShared(1) 中，调用 tryReleaseShared(1) 让计数减一，这回计数为零了，进入doReleaseShared() 将头节点的waitStatus从 -1 改为 0 并唤醒后继结点的线程，即

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250405193300610-2025-4-519:33:01.png" style="zoom:80%;" />

之后 t4 在 acquireQueued 中 parkAndCheckInterrupt 处恢复运行。在下一次循环中，它是第二个结点并且没有其他竞争，tryAcquire(1) 成功，修改头结点，流程结束

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250405193704305-2025-4-519:37:17.png" style="zoom:80%;" />

### StampedLock

StampedLock是一种改进版的读写锁，其核心思想是通过 **乐观读**减少锁竞争，同时支持 **写锁（Write Lock）** 和 **悲观读锁（Read Lock）**。其中写锁与悲观读锁与ReentrantReadWriteLock 中的读锁和写锁相同。相比 ReentrantReadWriteLock 提供更高的吞吐量，特别适合读多写少的场景。

StampedLock的核心是**戳（Stamp）**，每次锁的获取都会返回一个唯一的长整型值，该值用于标识锁的状态。通过这个戳记，线程可以判断当前锁是否仍然有效。

相比于ReentrantReadWriteLock，它提供了一种**乐观读**的操作。乐观读是一种无锁操作，线程可以直接读取数据而不阻塞，提供了读操作的并发度。如果根据stamp判断出，在读取期间有写操作发生，会进行读锁的升级，从乐观读升级为读锁。成功获取读锁后再进行读操作。

- 乐观读

  ```java
  long stamp = lock.tryOptimisticRead();
  // 验证锁是否有效
  if (lock.validate(stamp)) {
      // 执行读操作
  } else {
      // 锁升级：乐观读 -> 读锁
      stamp = lock.readLock();
      try {
          // 执行读操作
      } finally {
          lock.unlockRead(stamp);
      }
  }
  ```

- 读锁

  ```java
  long stamp = lock.readLock();
  try {
      // 执行读操作
  } finally {
      lock.unlockRead(stamp);
  }
  ```

- 写锁

  ```java
  long stamp = lock.writeLock();
  try {
      // 执行写操作
  } finally {
      lock.unlockWrite(stamp);
  }
  ```



注：StampedLock虽然性能比ReentrantReadWriteLock性能高，但不能取代后者

- StampedLock 不支持条件变量
- StampedLock 不支持可重入

## 8.4、Semaphore

`Semaphore`（信号量）是 Java 并发包中基于 **AQS** 实现的资源访问控制工具，通过 **许可证（Permits）** 的发放与回收，限制同时访问共享资源的**线程数量**（而不是资源数量）。

Semaphore 通过内部的计数器（**permits**）来控制并发访问的线程数量。每个线程在访问资源之前，必须从信号量中获取一个许可。当线程使用完资源后，必须释放许可，以便其他线程可以继续访问。

核心特性：

- 初始化时指定许可证数量，线程通过 acquire() 获取，release() 释放。
- 支持公平模式（按队列顺序分配）和非公平模式（允许插队）。
- 支持中断、超时机制
- 支持一次获取或释放多个许可证

> Semaphore 有点像一个停车场，permits 就好像停车位数量，当线程获得了 permits 就像是获得了停车位，然后停车场显示空余车位减一，没有车位的需要再外面等待

### 基本使用

```java
// 1. 创建 semaphore 对象，许可数为3
Semaphore semaphore = new Semaphore(3);

// 2. 10个线程同时运行
for (int i = 0; i < 10; i++) {
    new Thread(()->{
        // 3.获取许可 没有获取到的线程阻塞等待，可以被中断
        try {
            semaphore.acquire();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        try{
            // 4.执行业务
            log.debug("running...");
            sleep(1); //线程休眠1s，模拟业务执行过程
            log.debug("end...");
        }finally {
            // 5.释放许可
            semaphore.release();
        }
    }).start();
```

```bash
#运行结果
21:16:37.508 [Thread-1] c.TestSemaphore - running...
21:16:37.508 [Thread-0] c.TestSemaphore - running...
21:16:37.508 [Thread-3] c.TestSemaphore - running...
21:16:42.520 [Thread-0] c.TestSemaphore - end...
21:16:42.520 [Thread-3] c.TestSemaphore - end...
21:16:42.520 [Thread-1] c.TestSemaphore - end...
21:16:42.520 [Thread-4] c.TestSemaphore - running...
21:16:42.520 [Thread-6] c.TestSemaphore - running...
21:16:42.520 [Thread-2] c.TestSemaphore - running...
21:16:47.529 [Thread-4] c.TestSemaphore - end...
21:16:47.529 [Thread-6] c.TestSemaphore - end...
21:16:47.529 [Thread-2] c.TestSemaphore - end...
21:16:47.529 [Thread-5] c.TestSemaphore - running...
21:16:47.529 [Thread-8] c.TestSemaphore - running...
21:16:47.529 [Thread-7] c.TestSemaphore - running...
21:16:52.542 [Thread-5] c.TestSemaphore - end...
21:16:52.542 [Thread-7] c.TestSemaphore - end...
21:16:52.542 [Thread-9] c.TestSemaphore - running...
21:16:52.542 [Thread-8] c.TestSemaphore - end...
21:16:57.546 [Thread-9] c.TestSemaphore - end...
```



### 应用

使用Semaphore进行限流

在访问高峰期时，使用 Semaphore 设置许可数来限制线程数，只有获得许可的线程才能执行业务，否则需要阻塞等待许可空闲。

{% note warning%}

Semaphore的这种限流只会在单机模式下生效，分布式环境下可以基于Redis、分布式锁（如Redisson）以及API网关进行限流。

{% endnote%}

Semaphore限制的仅仅是线程数而不是资源数，但当二者相等时采用Semaphore也可以达到限流的效果。例如，用 Semaphore 实现简单连接池（连接的数量和请求的数量相等），对比『[享元模式](https://catpaws.top/eb9166f8/#自定义连接池)』下的实现（用wait notify），性能和可读性显然更好。

```java
public class Pool {
    //1、连接池大小
    private final int poolSize;
    //2、连接对象数组
    private Connection[] connections;
    //3、连接状态数组
    private AtomicIntegerArray states; //使用原子整型数组，防止多个线程同时修改出现并发安全问题
    private Semaphore semaphore;
    //4、构造方法初始化
    public Pool(int poolSize) {
        this.poolSize = poolSize;
        //连接池的数量等于Semaphore中许可的数量
        semaphore = new Semaphore(poolSize);
        this.connections = new Connection[poolSize];
        this.states = new AtomicIntegerArray(new int[poolSize]);
        for (int i = 0; i < poolSize; i++) {
            connections[i] = new MockConnection();
        }
    }

    //5、取连接
    public Connection borrow() {
        //获取许可
        try {
            semaphore.acquire();// 没有许可的线程，在此等待
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        for (int i = 0; i < poolSize; i++) {
            //有空闲连接
            if (states.get(i)== 0 ) {
                //执行CAS替换
                if (states.compareAndSet(i,0,1)) {
                    log.debug("borrow {}", connections[i]);
                    return connections[i];
                }
            }
        return null;
    }
    //6、归还连接
    public void free(Connection coon) {
        for (int i = 0; i < poolSize; i++) {
            //是当前连接池中的连接
            if (connections[i] == conn) {
                states.set(i,0);
                log.debug("free {}", conn);
                semaphore.release();//释放许可
                break;
            }
        }
    }
}
```

### 原理分析

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250406152137576-2025-4-615:21:50.png" style="zoom:80%;" />

- 包含内部类Sync、FairSync和NonfairSync
- Sync 继承自 AQS，实现读写锁的核心逻辑。
- FairSync 和 NonfairSync 继承 Sync，分别实现公平和非公平策略。默认使用非公平，可以在构造参数中指定策略。

#### 构造方法

创建Semaphore对象时，需要传入初始的许可数`permits`。默认采用非公平的同步器，最终将`permits`设置为同步器的state

```java
//创建持有三个许可的semaphore 对象 
Semaphore semaphore = new Semaphore(3);

//默认采用 非公平的同步器，可以在构造函数中指定策略
public Semaphore(int permits) {
    sync = new NonfairSync(permits);
}

/**
* NonFair version
*/
static final class NonfairSync extends Sync {
  
    //调用父类 Sync 的构造方法进行初始化
    NonfairSync(int permits) {
        super(permits);
    }
    //其他方法略...
}

//父类Sync
abstract static class Sync extends AbstractQueuedSynchronizer {
    //其他方法略...
    Sync(int permits) {
        //最终将permits设置为同步器的state
        setState(permits);
    }
}
```

#### 获取许可证

与ReentrantReadWriteLock中获取读锁的逻辑基本相同

```java
//方法调用链
Semaphore.acquire()
    → AQS.acquireSharedInterruptibly(1)
    	//尝试获取许可，返回值含义
           //-1：获取锁失败
           //0：表示成功，但后继结点不会继续唤醒
           //正数：表示成功，数值是还有几个后继节点需要唤醒
    	→ Semaphore#NonfairSync.tryAcquireShared(1)
    		//调用Sync内部类的方法执行获取许可的逻辑
    		→ Semaphore#Sync.nonfairTryAcquireShared(1)
    	//如果返回了-1，获取锁失败。创建该线程的Node结点，加入CLH队列，自旋重试，失败一定次数后park阻塞
    	→ AQS.doAcquireSharedInterruptibly(1)
```



```java
//1、Semaphore.acquire()
public void acquire() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}

//2、AQS.acquireSharedInterruptibly(1)
public final void acquireSharedInterruptibly(int arg)
    throws InterruptedException {
    if (Thread.interrupted())
        throw new InterruptedException();
    //尝试获取许可，返回剩余的许可数
    //返回0或正数，获取许可成功，结束
    if (tryAcquireShared(arg) < 0)
        //返回-1，获取许可失败，创建对应线程的Node结点加入等待队列，自旋尝试一定次数后park阻塞
        doAcquireSharedInterruptibly(arg);
}

//3、Semaphore#NonfairSync.tryAcquireShared(1)
protected int tryAcquireShared(int acquires) {
    return nonfairTryAcquireShared(acquires);
}

//4、Semaphore#Sync.nonfairTryAcquireShared(1)
final int nonfairTryAcquireShared(int acquires) {
    for (;;) {
        //当前的许可数
        int available = getState();
        //获取acquires个许可后，剩余的许可数
        int remaining = available - acquires;
        //如果剩余数 < 0, 直接返回剩余数
        //如果剩余数 >= 0, CAS修改许可数为 remaining
        if (remaining < 0 ||
            compareAndSetState(available, remaining))
            return remaining;
    }
}

//5、AQS.doAcquireSharedInterruptibly(1)
private void doAcquireSharedInterruptibly(int arg)
    throws InterruptedException {
    //创建该线程对应的Node节点（类型是SHARED），将其加入等待队列尾部
    final Node node = addWaiter(Node.SHARED);
    boolean failed = true;
    try {
        //自旋尝试
        for (;;) {
            final Node p = node.predecessor();
            //如果当前是第二个结点，再次执行tryAcquireShared，尝试获取许可
            if (p == head) {
                int r = tryAcquireShared(arg);
                //获取锁成功
                if (r >= 0) {
                    //设置当前节点为头结点，并唤醒后续 连续的 SHARED类型的结点对应的线程来竞争
                    setHeadAndPropagate(node, r);
                    p.next = null; // help GC
                    failed = false;
                    return;
                }
            }
            //获取锁失败
            //判断当前线程是否要阻塞，如果要则park阻塞当前线程
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                throw new InterruptedException();
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
```

例如：刚开始permits（state）为 3，这时 5 个线程来获取资源

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250406155415384-2025-4-615:54:18.png" style="zoom:80%;" />

假设其中 Thread-1，Thread-2，Thread-4 cas 竞争成功，剩余许可数为0。

而 Thread-0 和 Thread-3来获取许可时，返回的剩余许可数都为-1， 竞争失败，进入 AQS 队列park 阻塞

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250406155510439-2025-4-615:55:19.png" style="zoom:80%;" />

#### 释放许可证

```java
//方法调用链
Semaphore.release()
    → AQS.releaseShared(1)
    	//使用CAS操作更新同步器的state为 state+1，操作成功后返回true
    	→ Semaphore#Sync.tryReleaseShared(1)
    	//从等待队列头部唤醒一个等待线程
    	→ AQS.doReleaseShared()
```

```java
//1、Semaphore.release()
public void release() {
    sync.releaseShared(1);
}

//2、AQS.releaseShared(1)
public final boolean releaseShared(int arg) {
    //当前线程成功释放许可
    if (tryReleaseShared(arg)) {
        //从等待队列头部唤醒一个线程
        doReleaseShared();
        return true;
    }
    return false;
}

//3、Semaphore#Sync.tryReleaseShared(1)
protected final boolean tryReleaseShared(int releases) {
    for (;;) {
        //当前的state
        int current = getState();
        //释放releases个许可后，剩余的许可数
        int next = current + releases;
        //许可数超出最大范围
        if (next < current) // overflow
            throw new Error("Maximum permit count exceeded");
        //使用CAS操作更新state为next，直至操作成功，返回true
        if (compareAndSetState(current, next))
            return true;
    }
}

//4、AQS.doReleaseShared()
private void doReleaseShared() {
	// 无限循环，直到完成唤醒或状态更新。
    for (;;) {      
        Node h = head;
        if (h != null && h != tail) {
            int ws = h.waitStatus;// 获取头节点的等待状态
			//1、 如果头节点的状态是 SIGNAL（-1），表示需要唤醒后继节点：
            if (ws == Node.SIGNAL) {
                //使用CAS操作保证只有一个线程会来执行唤醒操作，如果某个线程CAS成功就由他来完成唤醒
                if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                    continue; 
                //唤醒头节点的后继节点。
                unparkSuccessor(h);
            }
            //2、如果头节点的状态是0，尝试将其状态设置为 PROPAGATE（-3），以确保释放操作能够继续传播。
            else if (ws == 0 &&
                       !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
                continue;
        }
        // 如果头节点没有发生变化，退出循环。如果发生变化（例如有新节点加入队列），需要重新检查。
        if (h == head)
            break;
    }
}
```

例如：Thread-4 释放了 permits，剩余许可数为1，状态如下

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250406161109523-2025-4-616:11:11.png" style="zoom:80%;" />

接下来会从等待队列头部唤醒一个线程来竞争，此时唤醒的是Thread-0，它会竞争成功，permits 再次设置为 0，设置自己为 head 节点，断开原来的 head 节点，unpark 接下来的 Thread-3 节点，但由于 permits 是 0，因此 Thread-3 在尝试不成功后再次进入 park 状态

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250406161458290-2025-4-616:15:00.png" style="zoom:80%;" />

## 8.5、CountDownLatch 

CountDownLatch 是 Java 并发包中基于 **AQS** 实现的同步工具，用于 **协调多个线程之间的执行顺序**。

其核心思想是通过 **计数器递减** 机制，让一个或多个线程等待其他线程完成操作后继续执行。计数器的初始值由用户指定，每当一个线程完成任务后，调用 countDown() 方法使计数器减 1，当计数器减为 0 时，等待的线程会被唤醒。

注：

- 计数器归零后不可重置，需重新创建新实例。
- 计数器只能递减，无法增加。

***

为什么不直接使用Join方法等待其他线程完成操作？

- Join方法必须明确指定要等待的线程实例，需要这些线程运行结束后才能继续执行（强耦合）；而CountDownLatch无需关心具体线程，只需等待计数器归零（任务与线程解耦）。
- CountDownLatch**更适配于线程池**，线程池中的核心线程是不会结束的，无法使用Join方法直接等待线程池中的任务完成，也无法直接获取线程实例。
- CountDownLatch 提供内置的超时等待机制，避免永久阻塞

总结：Thread.join() 适用于简单场景（如明确等待少数几个线程结束）；CountDownLatch 在复杂协作、解耦任务、线程池管理等场景下更具优势，是 Java 并发编程中更现代化的工具选择。

### 基本使用

核心方法：

- **`void await()`**
  - 调用此方法的线程会阻塞，直到计数器的值减为 0。
  - 如果计数器已经为 0，线程不会阻塞，直接继续执行。
- **`void countDown()`**
  - 每次调用此方法，计数器减 1。
  - 当计数器值减为 0 时，所有调用 `await()` 方法阻塞的线程会被唤醒。
- **`long getCount()`**
  - 返回当前计数器的值。

```java
//配合线程池使用
CountDownLatch latch = new CountDownLatch(3);
ExecutorService pool = Executors.newFixedThreadPool(4);
//task1: 执行耗时1s
pool.submit(()->{
    log.debug("begin...");
    sleep(1000);
    latch.countDown();
    log.debug("end...{}",latch.getCount());
});
//task2: 执行耗时2s
pool.submit(()->{
    log.debug("begin...");
    sleep(2000);
    latch.countDown();
    log.debug("end...{}",latch.getCount());
});
//task3：执行耗时1.5秒
pool.submit(()->{
    log.debug("begin...");
    sleep(1500);
    latch.countDown();
    log.debug("end...{}",latch.getCount());
});

//task4：等待任务完成
pool.submit(()->{
    log.debug("waiting...");
    try {
        latch.await();
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    log.debug("wait end...");
});
```

```bash
#输出
22:23:18.944 [pool-1-thread-3] c.test - begin...
22:23:18.944 [pool-1-thread-1] c.test - begin...
22:23:18.944 [pool-1-thread-2] c.test - begin...
22:23:18.944 [pool-1-thread-4] c.test - waiting...
22:23:19.960 [pool-1-thread-1] c.test - end...2
22:23:20.450 [pool-1-thread-3] c.test - end...1
22:23:20.955 [pool-1-thread-2] c.test - end...0
22:23:20.955 [pool-1-thread-4] c.test - wait end...
```

### 案例

**等待多线程准备完毕**：实现类似王者荣耀中十名玩家都加载完成后，再开始游戏的效果

<img src="https://gitee.com/cmyk359/img/raw/master/img/PixPin_2025-04-06_22-56-04-2025-4-622:57:03.gif" style="zoom:80%;" />

```java
ExecutorService service = Executors.newFixedThreadPool(10);
CountDownLatch latch = new CountDownLatch(10);
String[] all = new String[10];
Random r = new Random();
//模拟10名玩家，提交10个加载任务到线程池
for (int i = 0; i < 10; i++) {
    int k = i;
    service.submit(()->{
        for (int j = 0; j <= 100; j++) {
            try {
                Thread.sleep(r.nextInt(50));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            all[k] = j + "%";
            System.out.print("\r" + Arrays.toString(all));
        }
        //每个任务加载完成后执行
        latch.countDown();
    });
}
//等待所有玩家加载完成
latch.await();
System.out.print("\n 游戏开始...");
service.shutdown();
```

补充：可以使用CountDownLatch来等待远程调用完成后再执行主业务，这比较适合于无返回值的远程调用。当需要获取返回值时，使用Future更为合适。

### 源码分析

初始化：计数器的值设置为同步器的state

```java
// 初始化计数器（必须 ≥0）
public CountDownLatch(int count) {
    if (count < 0) throw new IllegalArgumentException();
    this.sync = new Sync(count);
}
```

***

`await`方法，默认可打断

```java
//方法调用链
CountDownLatch.await()
    → AQS.acquireSharedInterruptibly(1)
    	//尝试获取锁。若当前计数器（state）为0，返回1，否则返回-1
    	→ CountDownLatch#Sync.tryAcquireShared(1)
    	//若返回-1，则获取锁失败，创建对应线程的Node结点并插入CLH队列尾部，自旋重试一定次数后park阻塞
        // 与不可打断方案相比，若在park阻塞过程中被打断会直接抛出打断异常，退出等待队列从而响应中断
    	→ AQS.doAcquireSharedInterruptibly(1)
```

```java
public void await() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}

public final void acquireSharedInterruptibly(int arg) throws InterruptedException {
    if (Thread.interrupted())
        throw new InterruptedException();
    //尝试获取锁
    if (tryAcquireShared(arg) < 0)
        doAcquireSharedInterruptibly(arg);
}

//获取锁的逻辑，当前计数器（state）为0，返回1，否则返回-1
protected int tryAcquireShared(int acquires) {
    return (getState() == 0) ? 1 : -1;
}

private void doAcquireInterruptibly(int arg)
    throws InterruptedException {
    //创建对应线程的Node结点并加入AQS等待队列尾部
    final Node node = addWaiter(Node.SHARED);
    boolean failed = true;
    try {
        //自旋重试
        for (;;) {
            final Node p = node.predecessor();
            //如果是第二个节点，则再次尝试获取锁
            if (p == head) {
                int r = tryAcquireShared(arg);
                if (r >= 0) {
                    //获取锁成功，设置当前节点为头结点并继续唤醒后面连续的共享结点
                    setHeadAndPropagate(node, r);
                    p.next = null; // help GC
                    failed = false;
                    return;
                }
            }
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                // 在 park 过程中如果被 interrupt，这时候抛出异常, 而不会再次进入 for (;;)
                throw new InterruptedException();
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
```



***

`countDown`方法（相当于释放锁）

```java
//方法调用链
CountDownLatch.countDown()
    → AQS.releaseShared(1)
    	// CAS 递减计数器，每次计数器减一。当减为0时，返回true，否则返回false
    	→ CountDownLatch#Sync.tryReleaseShared(1)
    	//锁完全释放，唤醒等待队列中头节点的后继节点
    	→ AQS.doReleaseShared()
```

```java
//1、CountDownLatch.countDown()
public void countDown() {
    sync.releaseShared(1);
}

//2、AQS.releaseShared(1)
public final boolean releaseShared(int arg) {
    if (tryReleaseShared(arg)) {
        doReleaseShared();
        return true;
    }
    return false;
}
//3、CountDownLatch#Sync.tryReleaseShared(1)
protected boolean tryReleaseShared(int releases) {
    //自旋，直至CAS成功
    for (;;) {
        int c = getState();
        if (c == 0)
            return false;
        // 计数器减1
        int nextc = c-1;
        //CAS修改
        if (compareAndSetState(c, nextc))
            return nextc == 0; //计数器减为0，返回true，否则返回false
    }
}
//4、AQS.doReleaseShared()
private void doReleaseShared() {
	// 无限循环，直到完成唤醒或状态更新。
    for (;;) {      
        Node h = head;
        if (h != null && h != tail) {
            int ws = h.waitStatus;// 获取头节点的等待状态
			//1、 如果头节点的状态是 SIGNAL（-1），表示需要唤醒后继节点：
            if (ws == Node.SIGNAL) {
                //使用CAS操作保证只有一个线程会来执行唤醒操作，如果某个线程CAS成功就由他来完成唤醒
                if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                    continue; 
                //唤醒头节点的后继节点。
                unparkSuccessor(h);
            }
            //2、如果头节点的状态是0，尝试将其状态设置为 PROPAGATE（-3），以确保释放操作能够继续传播。
            else if (ws == 0 &&
                       !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
                continue;
        }
        // 如果头节点没有发生变化，退出循环。如果发生变化（例如有新节点加入队列），需要重新检查。
        if (h == head)
            break;
    }
}
```

## 8.6、CyclicBarrier

CyclicBarrier（循环栅栏）是 Java 并发包中用于 **多线程协同执行** 的同步工具。

用于让一组线程相互等待，直到所有线程都到达某个共同的屏障点（Barrier）后，再继续执行后续操作。构造时设置『计数个数』，每个线程执行到某个需要“同步”的时刻调用 await() 方法进行等待，当等待的线程数满足『计数个数』时，继续执行。

与 `CountDownLatch` 类似，`CyclicBarrier` 也用于线程之间的协作，但它更适合需要**多次同步**的场景，而不是一次性使用。

**核心特性**

- 可重用性，屏障被触发后自动重置，支持重复使用。（CountDownLatch是一次性使用，计数器归零后不可重置）
- 多个线程相互等待，所有线程必须到达屏障点后才能继续执行。（CountDownLatch是一个或多个线程等待其他线程完成）
- 支持屏障后动作，可指定一个 Runnable，在所有线程到达屏障后、释放前执行。（CountDownLatch无）
- 异常处理机制，若某个线程在等待中抛出异常（如超时、中断），会破坏整个屏障，其他等待线程将收到 `BrokenBarrierException`。（CountDownLatch无特定异常类型）

{% note warning%}

初始化的**计数个数**必须与实际调用 `await()` 的**线程数**一致，否则会永久阻塞。因此，CyclicBarrier的线程数量在创建时就固定了，无法动态调整；如果需要动态调整线程数量，建议使用 `Phaser`

{% endnote%}

使用场景：

1. **多线程阶段性任务**：适用于需要多个线程分阶段协同工作的场景。例如，模拟多线程的分阶段任务。
2. **并行计算**：将一个大任务分解为多个子任务，多个线程并行计算子任务，最后在屏障点汇总结果。
3. **游戏开发**：在多人游戏中，等待所有玩家加载完成后再开始游戏。

#### 基本使用

核心方法

1. 构造方法

   ```java
   //parties：需要等待的线程数量
   public CyclicBarrier(int parties)
       
   //带屏障操作的构造方法
   	//参数 parties：需要等待的线程数量。
   	//参数 barrierAction：一个可选的 Runnable，当所有线程都到达屏障点时会执行该操作。
   public CyclicBarrier(int parties, Runnable barrierAction)
   ```

2. **`int await()`**

   - 调用此方法的线程会等待，直到所有线程都到达屏障点。
   - 如果所有线程都到达了屏障点，则所有线程会被同时释放。
   - 返回值：每个线程调用 `await()` 时会得到一个唯一的编号（从 `0` 到 `parties-1`）。

3. **`int getParties()`**

   - 返回需要等待的线程总数。

4. **`int getNumberWaiting()`**

   - 返回当前正在等待的线程数量。

5. **`boolean isBroken()`**

   - 检查屏障是否被中断（即是否有线程在等待屏障时被中断）。

6. **`void reset()`**

   - 将屏障重置为初始状态。如果有线程正在等待，它们会收到一个 `BrokenBarrierException`。



```java
//两个线程都到达屏障点后再继续执行
public static void main(String[] args) {
    CyclicBarrier barrier = new CyclicBarrier(2);
    ExecutorService service = Executors.newFixedThreadPool(2);
    service.submit(() -> {
        log.debug("task1 begin...");
        try {
            TimeUnit.SECONDS.sleep(1);
            barrier.await();
            log.debug("task1 end...");
        } catch (InterruptedException | BrokenBarrierException e) {
            throw new RuntimeException(e);
        }
    });
    service.submit(() -> {
        log.debug("task2 begin...");
        try {
            TimeUnit.SECONDS.sleep(2);
            barrier.await();
            log.debug("task2 end...");
        } catch (InterruptedException | BrokenBarrierException e) {
            throw new RuntimeException(e);
        }
    });

    service.shutdown();
}

//输出：task1运行1s，task2运行2s。2s后两个线程都到达屏障点，继续向后运行
10:10:12.943 [pool-1-thread-1] c.TestCyclicBarrier - task1 begin...
10:10:12.943 [pool-1-thread-2] c.TestCyclicBarrier - task2 begin...
10:10:14.947 [pool-1-thread-2] c.TestCyclicBarrier - task2 end...
10:10:14.947 [pool-1-thread-1] c.TestCyclicBarrier - task1 end...
```



```java
//假设将任务分成了task1和task2，让其执行3遍，在构造函数中指定屏障后操作，打印两个任务执行完成
public static void main(String[] args) {
    ExecutorService service = Executors.newFixedThreadPool(2);
    //构造函数中添加屏障后操作
    CyclicBarrier barrier = new CyclicBarrier(2,()->{
        log.debug("task1&task2 end....");
    });
    //任务执行3遍
    for (int i = 0; i < 3; i++) {
        service.submit(() -> {
            log.debug("task1 begin...");
            try {
                TimeUnit.SECONDS.sleep(1);
                barrier.await();
            } catch (InterruptedException | BrokenBarrierException e) {
                throw new RuntimeException(e);
            }
        });
        service.submit(() -> {
            log.debug("task2 begin...");
            try {
                TimeUnit.SECONDS.sleep(2);
                barrier.await();
            } catch (InterruptedException | BrokenBarrierException e) {
                throw new RuntimeException(e);
            }
        });
    }

    service.shutdown();
}
//输出：任务循环执行3次
10:28:15.125 [pool-1-thread-1] c.TestCyclicBarrier - task1 begin...
10:28:15.125 [pool-1-thread-2] c.TestCyclicBarrier - task2 begin...
10:28:17.129 [pool-1-thread-2] c.TestCyclicBarrier - task1&task2 end.... //2s后执行
10:28:17.129 [pool-1-thread-2] c.TestCyclicBarrier - task1 begin...
10:28:17.129 [pool-1-thread-1] c.TestCyclicBarrier - task2 begin...
10:28:19.144 [pool-1-thread-1] c.TestCyclicBarrier - task1&task2 end.... //2s后执行
10:28:19.144 [pool-1-thread-1] c.TestCyclicBarrier - task1 begin...
10:28:19.144 [pool-1-thread-2] c.TestCyclicBarrier - task2 begin...
10:28:21.144 [pool-1-thread-2] c.TestCyclicBarrier - task1&task2 end.... //2s后执行
```



### 原理分析

**CyclicBarrier内部结构**

- **`ReentrantLock` 和 `Condition`**：用于线程的阻塞与唤醒。
- **`Generation` 对象**：表示当前屏障的“代”，每次重置或触发后生成新代。
- **`count` 计数器**：记录尚未到达屏障的线程数。



await方法：

```java
public int await() throws InterruptedException, BrokenBarrierException {
    try {
        return dowait(false, 0L);
    } catch (TimeoutException toe) {
        throw new Error(toe); // cannot happen
    }
}

// 主要等待逻辑（dowait 方法）
private int dowait(boolean timed, long nanos) 
    throws InterruptedException, BrokenBarrierException, TimeoutException {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        final Generation g = generation;
		
        //1、检查屏障状态
        // 检查屏障是否已破坏
        if (g.broken)
            throw new BrokenBarrierException();

        // 检查线程是否被中断
        if (Thread.interrupted()) {
            breakBarrier();
            throw new InterruptedException();
        }
		
        //2、计数器管理
        int index = --count;  // 每个线程到达屏障点时，计数器-1
        if (index == 0) {     // 最后一个线程到达
            boolean ranAction = false;  // 标记是否成功运行屏障操作
            try {
                final Runnable command = barrierCommand;
                if (command != null)
                    command.run();// 执行屏障后动作
                ranAction = true;
                nextGeneration();// 重置屏障（新 Generation）
                return 0;
            } finally {
               // 如果屏障操作未成功执行，打破屏障
                if (!ranAction)
                    breakBarrier();
            }
        }
		//3、线程等待
        // 非最后一个线程：循环等待直到屏障触发或超时
        for (;;) {
            try {
                if (!timed)
                    trip.await();        // 无限等待
                else if (nanos > 0L)
                    nanos = trip.awaitNanos(nanos);  // 超时等待
            } catch (InterruptedException ie) {
                //等待过程中被中断
                // 如果仍然是当前屏障代且屏障未被打破，则打破屏障
                if (g == generation && !g.broken) {
                    breakBarrier();
                    throw ie;// 抛出中断异常
                } else {
                    // 如果不是当前屏障代，则中断属于后续执行
                    Thread.currentThread().interrupt();
                }
            }
			
            //4、 唤醒后检查屏障状态
            if (g.broken)
                throw new BrokenBarrierException();
            if (g != generation)
                return index;
            if (timed && nanos <= 0L) {
                breakBarrier();
                throw new TimeoutException();
            }
        }
    } finally {
        lock.unlock();
    }
}

```



# 九、并发工具之线程安全集合类

## 9.1、概述

在 Java 中，线程安全的集合类主要分为两大类：**早期的同步集合** 和 **现代并发集合**。

***

早期的同步集合类出现在 Java 1.0 和 1.2 中，使用 synchronized 关键字对方法或代码块加锁，保证线程安全，但并发性能较低。

主要包括：

遗留的线程安全类

- Vector：线程安全的动态数组，所有方法都加了 synchronized，性能较低，开发中已被 ArrayList 替代。
- Stack：继承自 Vector，实现了后进先出的栈结构，线程安全，但开发中常用 Deque 替代。
- Hashtable：线程安全的哈希表，所有方法都加了 synchronized，性能较低，已被 ConcurrentHashMap 替代。

使用 Collections 装饰的线程安全集合 Collections.synchronizedXXX。使用装饰器模式，提供同步包装器方法，通过在内部调用原生方法前加锁，可以将非线程安全的集合包装为线程安全的集合。如：

- Collections.synchronizedList
- Collections.synchronizedMap
- Collections.synchronizedSet
- ...

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250408102046109-2025-4-810:21:11.png" style="zoom:80%;" />



***

现代并发集合类引入于 Java 5（java.util.concurrent 包），通过更高效的并发机制（如 CAS、分段锁）实现线程安全，性能远高于早期的同步集合。

主要特点

- 采用无锁算法（如 CAS）或分段锁，减少锁的粒度，提高并发性能。
- 提供了丰富的功能，支持高效的并发操作。
- 适合高并发场景，如多线程环境下的读写操作。

按用途分类如下：

- 并发 Map 类
  - `ConcurrentHashMap`：高效的线程安全哈希表，支持高并发读写操作，渐进式扩容，替代了 Hashtable
  - `ConcurrentSkipListMap`：基于跳表的线程安全有序 Map，支持快速的范围查询和排序操作，替代了同步的 TreeMap。
- 并发 List 类
  - `CopyOnWriteArrayList`：基于**写时复制**的线程安全 List，适合**读多写少**的场景。
- 并发 Set 类
  - `CopyOnWriteArraySet`：基于 CopyOnWriteArrayList 实现的线程安全 Set，适合读多写少的场景。
  - `ConcurrentSkipListSet`：基于跳表实现的线程安全有序 Set，支持快速的范围查询和排序操作，替代同步的 TreeSet。
- 并发 Queue 和 Deque 类
  - `ConcurrentLinkedQueue`：基于<u>链表</u>的**无界**线程安全队列，适合高并发场景。
  - `LinkedBlockingQueue`：基于<u>链表</u>的**有界**线程安全队列，支持容量限制，适用于生产者-消费者模型。
  - `ArrayBlockingQueue`：基于<u>数组</u>的**有界**线程安全队列，支持容量限制。
  - `PriorityBlockingQueue`：支持优先级的无界线程安全队列，元素按优先级排序。
  - `DelayQueue`：支持延迟获取元素的无界线程安全队列，常用于定时任务调度。
  - `SynchronousQueue`：无容量的线程安全队列，每次插入操作必须等待对应的删除操作完成，适合线程间直接传递数据。
  - `LinkedBlockingDeque`：基于链表的双端阻塞队列，支持从两端插入和删除元素。
  - `ConcurrentLinkedDeque`：基于链表的无界双端队列，适合高并发场景。

分析上面的线程安全集合类，可以发现它们有规律，里面包含三类关键词：Blocking、CopyOnWrite、Concurrent

- Blocking的大部分实现基于锁，通过阻塞操作实现线程安全。线程在访问集合时，如果条件不满足（如队列为空或已满），会被阻塞直到条件满足。

- CopyOnWrite（写时复制），在对集合进行修改（如添加或删除元素）时，会创建集合的一个副本，修改操作在副本上完成，修改完成后再将副本替换为原集合。读操作不需要加锁，可以无阻塞地读取集合中的数据。写操作开销较大，每次写入都会创建副本。因此适合读多写少的场景。

- Concurrent（并发）类型的容器，通过无锁算法（如 CAS）或分段锁实现线程安全。读操作通常是无锁的，写操作使用**更细粒度的锁或无锁**算法，减少线程间的竞争。适合高并发场景下的读写操作，性能远高于早期的同步集合类。

  {% note warning%}

  Concurrent和CopyOnWrite类型容器的一个特点就是**弱一致性**，它通过允许一定程度的不一致性，换取了更高的并发性能。体现在一下方面

  - 迭代器的弱一致性：在迭代过程中，容器的内容可以被其他线程修改，迭代器不会抛出 异常，但迭代结果可能不包括最新的修改。
  - 读取弱一致性：写操作对读操作的可见性并不是实时的，一个线程执行修改操作后，另一个线程可能会在稍后才看到更新后的值。
  - 求大小弱一致性，size 操作未必是 100% 准确

  {% endnote%}

## 9.2、ConcurrentHashMap

ConcurrentHashMap 是 Java 并发包（java.util.concurrent）中提供的线程安全哈希表实现。它在高并发环境下提供高效的读写性能，解决了 HashMap 的线程不安全问题以及 Hashtable 和 Collections.synchronizedMap 的性能瓶颈。

ConcurrentHashMap 在 JDK8 中进行了重大改进，摒弃了 JDK7 的分段锁（Segment）机制，转而采用 **CAS + synchronized** 的细粒度锁策略，结合 **数组 + 链表 + 红黑树** 的数据结构，实现高并发下的线程安全和高效性能。

| **JDK 版本** | **实现机制**            | **核心优化**                                                 |
| ------------ | ----------------------- | ------------------------------------------------------------ |
| **JDK7**     | 分段锁（Segment）       | **将哈希表分为多个段**（默认16段），每段独立加锁，降低锁粒度。 |
| **JDK8+**    | CAS + synchronized 桶锁 | 进一步细化锁粒度至**单个哈希桶**，引入红黑树优化查询性能，支持多线程协作扩容。 |

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250408111203810-2025-4-811:12:09.png" style="zoom:80%;" />

以下主要分析JDK8之后的ConcurrentHashMap的结构和实现原理。

### 成员属性

#### 变量

* 存储数组：

  ```java
  transient volatile Node<K,V>[] table;
  ```

* 散列表的长度：

  ```java
  private static final int MAXIMUM_CAPACITY = 1 << 30;	// 最大长度
  private static final int DEFAULT_CAPACITY = 16;			// 默认长度
  ```

* 并发级别，JDK7 遗留下来，1.8 中不代表并发级别：

  ```java
  private static final int DEFAULT_CONCURRENCY_LEVEL = 16;
  ```

* 负载因子，JDK1.8 的 ConcurrentHashMap 中是固定值：

  ```java
  private static final float LOAD_FACTOR = 0.75f;
  ```

* 阈值：

  ```java
  static final int TREEIFY_THRESHOLD = 8;		// 链表树化的阈值
  static final int UNTREEIFY_THRESHOLD = 6;	// 红黑树转化为链表的阈值
  static final int MIN_TREEIFY_CAPACITY = 64;	// 当数组长度达到64且某个桶位中的链表长度超过8，才会真正树化
  ```

* 扩容相关：

  ```java
  private static final int MIN_TRANSFER_STRIDE = 16;	// 线程迁移数据【最小步长】，控制线程迁移任务的最小区间
  private static int RESIZE_STAMP_BITS = 16;			// 用来计算扩容时生成的【标识戳】
  private static final int MAX_RESIZERS = (1 << (32 - RESIZE_STAMP_BITS)) - 1;// 65535-1并发扩容最多线程数
  private static final int RESIZE_STAMP_SHIFT = 32 - RESIZE_STAMP_BITS;		// 扩容时使用
  ```

* 节点哈希值：

  ```java
  static final int MOVED     = -1; 			// 表示当前节点是 FWD 节点
  static final int TREEBIN   = -2; 			// 表示当前节点已经树化，且当前节点为 TreeBin 对象
  static final int RESERVED  = -3; 			// 表示节点时临时节点
  static final int HASH_BITS = 0x7fffffff; 	// 正常节点的哈希值的可用的位数
  ```

* 扩容过程：volatile 修饰保证多线程的可见性

  ```java
  // 扩容过程中，会将扩容中的新 table 赋值给 nextTable 保持引用，扩容结束之后，这里会被设置为 null
  private transient volatile Node<K,V>[] nextTable;
  // 记录扩容进度，所有线程都要从 0 - transferIndex 中分配区间任务，简单说就是老表转移到哪了，索引从高到低转移
  private transient volatile int transferIndex;
  ```

* 累加统计：

  ```java
  // LongAdder 中的 baseCount 未发生竞争时或者当前LongAdder处于加锁状态时，增量累到到 baseCount 中
  private transient volatile long baseCount;
  // LongAdder 中的 cellsBuzy，0 表示当前 LongAdder 对象无锁状态，1 表示当前 LongAdder 对象加锁状态
  private transient volatile int cellsBusy;
  // LongAdder 中的 cells 数组，
  private transient volatile CounterCell[] counterCells;
  ```

* 控制变量 **sizeCtl** ：

  sizeCtl < 0：

  * -1 表示当前 table 正在初始化（有线程在创建 table 数组），当前线程需要自旋等待

  * 其他负数表示当前 map 的 table 数组正在进行扩容，高 16 位表示扩容的标识戳；低 16 位表示 (1 + nThread) 当前参与并发扩容的线程数量 + 1

  sizeCtl = 0，表示创建 table 数组时使用 DEFAULT_CAPACITY 为数组大小

  sizeCtl > 0：

  * 如果 table 未初始化，表示初始化大小
  * 如果 table 已经初始化，表示下次扩容时的触发条件（阈值，元素个数，不是数组的长度）

  ```java
  private transient volatile int sizeCtl;		// volatile 保持可见性
  ```



#### 内部类

* Node 节点：

  ```java
  static class Node<K,V> implements Entry<K,V> {
      // 节点哈希值
      final int hash;
      final K key;
      volatile V val;
      // 单向链表
      volatile Node<K,V> next;
  }
  ```

* TreeBin 红黑树头结点：

  ```java
   static final class TreeBin<K,V> extends Node<K,V> {
       // 红黑树根节点
       TreeNode<K,V> root;
       // 链表的头节点
       volatile TreeNode<K,V> first;
       // 等待者线程
       volatile Thread waiter;
  
       volatile int lockState;
       // 写锁状态 写锁是独占状态，以散列表来看，真正进入到 TreeBin 中的写线程同一时刻只有一个线程
       static final int WRITER = 1;
       // 等待者状态（写线程在等待），当 TreeBin 中有读线程目前正在读取数据时，写线程无法修改数据
       static final int WAITER = 2;
       // 读锁状态是共享，同一时刻可以有多个线程 同时进入到 TreeBi 对象中获取数据，每一个线程都给 lockState + 4
       static final int READER = 4;
   }
  ```

* TreeNode 红黑树节点：

  ```java
  static final class TreeNode<K,V> extends Node<K,V> {
      TreeNode<K,V> parent;  // red-black tree links
      TreeNode<K,V> left;
      TreeNode<K,V> right;
      TreeNode<K,V> prev;   //双向链表
      boolean red;
  }
  ```

* ForwardingNode 节点：转移节点

  扩容时如果某个桶迁移完毕, 用 ForwardingNode 作为旧 table 桶的头结点
  作用：1、标记该桶处理完毕 2、查询操作遇到此节点时，会转发到新数组 nextTable
  
  ```java
   static final class ForwardingNode<K,V> extends Node<K,V> {
       // 持有扩容后新的哈希表的引用
       final Node<K,V>[] nextTable;
       ForwardingNode(Node<K,V>[] tab) {
           // ForwardingNode 节点的 hash 值设为 -1
           super(MOVED, null, null, null);
           this.nextTable = tab;
       }
   }
  ```



### 构造方法

- 多个参数的构造器

  在构造器中实现了懒惰初始化，仅仅计算了 table 的大小（实际容量与设定的容量不一定相同），以后在第一次使用时才会真正创建。

  ```java
  public ConcurrentHashMap(int initialCapacity,
                           float loadFactor, int concurrencyLevel) {
      // 检查输入参数是否有效：
      if (!(loadFactor > 0.0f) || initialCapacity < 0 || concurrencyLevel <= 0)
          throw new IllegalArgumentException();
      // 如果初始容量小于并发级别，则将初始容量设为并发级别。
      // 这是为了确保每个线程至少有一个独立的桶，以减少竞争。
      if (initialCapacity < concurrencyLevel)   // Use at least as many bins
          initialCapacity = concurrencyLevel;   // as estimated threads
      // 根据初始容量和加载因子计算需要的实际容量
      long size = (long)(1.0 + (long)initialCapacity / loadFactor);
      // 将计算出的容量调整为最近的 2 的幂次方（为了后面通过与运算代替取模操作，哈希表的容量必须是 2 的幂）。
      // 如果计算出的容量大于最大容量（`MAXIMUM_CAPACITY`），则将容量设为最大值。
      int cap = (size >= (long)MAXIMUM_CAPACITY) ?
          MAXIMUM_CAPACITY : tableSizeFor((int)size);
      // 将 sizeCtl 设置为计算出的容量。
      // sizeCtl是一个重要的控制变量：
      	// - 如果为正数，表示初始化时的容量大小。
      	// - 如果为负数，表示表正在初始化或扩容。
      this.sizeCtl = cap;
  }
  ```

- 一个参数的构造器

  ```java
  public ConcurrentHashMap(int initialCapacity) {
      // 指定容量初始化
      if (initialCapacity < 0) throw new IllegalArgumentException();
      int cap = ((initialCapacity >= (MAXIMUM_CAPACITY >>> 1)) ?
                 MAXIMUM_CAPACITY :
                 tableSizeFor(initialCapacity + (initialCapacity >>> 1) + 1));
      // sizeCtl > 0，当目前 table 未初始化时，sizeCtl 表示初始化容量
      this.sizeCtl = cap;
  }
  ```

- 无参构造器，默认的数组大小是 16

  ```java
  public ConcurrentHashMap() {
  }
  ```

### 成员方法

#### 操作哈希表

- tabAt：获取哈希表某个槽位的**头节点**，类似于数组中的直接寻址 arr[i]

  ```java
  // i 是数组索引
  static final <K,V> Node<K,V> tabAt(Node<K,V>[] tab, int i) {
      // (i << ASHIFT) + ABASE == ABASE + i * 4 （一个 int 占 4 个字节），这就相当于寻址，替代了乘法
      return (Node<K,V>)U.getObjectVolatile(tab, ((long)i << ASHIFT) + ABASE);
  }
  ```

- casTabAt：将数组索引位置的Node，从原值CAS修改为新值

  ```java
  static final <K,V> boolean casTabAt(Node<K,V>[] tab, int i, Node<K,V> c, Node<K,V> v) {
      return U.compareAndSwapObject(tab, ((long)i << ASHIFT) + ABASE, c, v);
  }
  ```

- setTabAt：直接修改 Node[] 中第 i 个 Node 的值,

  ```java
  static final <K,V> void setTabAt(Node<K,V>[] tab, int i, Node<K,V> v) {
      U.putObjectVolatile(tab, ((long)i << ASHIFT) + ABASE, v);
  }
  ```

#### get方法

无锁读取，读取操作不会阻塞，即使在写操作进行时，读操作仍然可以继续，性能很高。

执行逻辑：

1. **计算哈希值**：调用 `spread` 方法对键的哈希值进行扰动，以减少冲突。
2. **定位桶**：
   - 根据哈希值和哈希表长度，计算目标桶的索引：`(n - 1) & h`。
   - 检查目标桶是否为空，如果为空直接返回 `null`。
3. **检查桶中的第一个节点**：
   - 如果桶中的第一个节点的哈希值与目标哈希值相等（可能为同义词），进一步检查键是否相等。
   - 如果键相等，返回该节点的值。
4. **处理特殊节点**：
   - 如果桶中的第一个节点的哈希值小于 0，说明该节点是特殊节点（如树节点或 ForwardingNode）。
   - 调用特殊节点的 `find` 方法查找目标键。
5. **如果桶中的第一个节点的哈希值不匹配，继续遍历链表**：
   - 对每个节点，检查其哈希值和键是否与目标匹配。
   - 如果找到匹配的节点，返回其值。
6. **返回结果**：
   - 如果遍历完目标桶的所有节点仍未找到匹配的键，返回 `null`。

```java
public V get(Object key) {
    Node<K,V>[] tab; Node<K,V> e, p; int n, eh; K ek;
    //1、使用spread 方法对键的哈希值进行扰动，将结果限制在有效范围内，确保最终的哈希值是一个非负整数
    int h = spread(key.hashCode());
    
    // 2、检查哈希表是否已初始化，并且长度大于 0。
    // 然后根据哈希值 h 和哈希表长度计算出目标桶的索引 `(n - 1) & h`。
    // 如果目标桶中第一个节点不为空（`e != null`），则继续处理。
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (e = tabAt(tab, (n - 1) & h)) != null) {
        
        //2.1、 如果第一个节点的哈希值与目标哈希值相等
        if ((eh = e.hash) == h) {
            //检查第一个节点的键是否与目标键相等
            // 1. 如果 `e.key == key`，说明是同一个对象。
            // 2. 如果 `e.key != null && key.equals(e.key)`，说明两个键逻辑上相等。（可以通过重写equals方法自定义相等的逻辑）
            if ((ek = e.key) == key || (ek != null && key.equals(ek)))
                return e.val;// 找到目标节点，返回其值。
        }
        //2.2、 如果 `eh < 0`，说明该节点是一个特殊节点（如树节点TreeBin或 ForwardingNode）
        // 调用节点的 `find` 方法，在对应结构中查找目标键。（它们都重写了find方法）
        	//1. 如果是ForwardingNode，则说明发生扩容，该桶已迁移到新的nextTable中，在它里面查找目标键
        	//2. 如果是树节点TreeBin，则在红黑树中查找目标键
        else if (eh < 0)
            return (p = e.find(h, key)) != null ? p.val : null;
        //2.3、 如果第一个节点的哈希值不匹配，继续遍历链表。
        while ((e = e.next) != null) {
            if (e.hash == h &&
                ((ek = e.key) == key || (ek != null && key.equals(ek))))
                return e.val;// 找到目标节点，返回其值。
        }
    }
    //3、如果目标键不存在于哈希表中，返回 null。
    return null;
}
```



#### put方法

执行逻辑

1. 参数检查，如果键或值为 null，抛出 `NullPointerException`。
2. 计算哈希值，调用 spread 方法对键的哈希值进行扰动，以减少哈希冲突。
3. 如果哈希表未初始化或长度为 0，调用 `initTable` 方法初始化。(具体逻辑见下面)
4. 定位到合适的桶，并尝试插入键值对
   - 如果目标桶为空，通过 CAS 操作插入新节点。
   - 如果目标桶的头结点是特殊节点（ForwardingNode），说明正在扩容，调用 helpTransfer 方法**协助扩容**。
   - 如果目标桶已经有节点，则说明发生了冲突，分两种情况处理：
     - 目标桶是**链表结构**：遍历链表，查找目标键。如果找到，更新值；如果未找到，插入新节点。
     - 目标桶是**红黑树结构**：调用红黑树的 putTreeVal 方法插入或更新节点。
5. 插入完成后，如果链表长度超过阈值（默认 8），将链表转换为红黑树。
6. 更新哈希表的元素计数，并检查是否需要扩容。（更新计数和扩容具体逻辑见下面）
7. 返回结果
   - 如果插入的是新节点，返回 `null`
   - 如果更新了旧值，返回旧值

```java
public V put(K key, V value) {
    //向map中添加key和value，存在该key时用新value覆盖旧value
    return putVal(key, value, false);
}

//参数 onlyIfAbsent：
	//为true时，只有第一次put键和值时会将其加入map中，之后再次put相同的key时不进行操作
	//为false时，若map中有相同的key，会用新值覆盖旧值
final V putVal(K key, V value, boolean onlyIfAbsent) {
    //不允许key或value为null
    if (key == null || value == null) throw new NullPointerException();
    //通过位运算对哈希值高位进行扰动（spread），将高位的信息引入低位，使得哈希值的低位部分更加随机化，从而减少冲突。
    int hash = spread(key.hashCode());
    
    //初始化计数器，用于记录目标桶中节点的数量。
    int binCount = 0;
    
    // 开始死循环，直到定位到合适的桶并插入键值对。
    for (Node<K,V>[] tab = table;;) {
        Node<K,V> f; int n, i, fh;
        //1、 如果哈希表未初始化或长度为 0，则初始化哈希表。
        if (tab == null || (n = tab.length) == 0)
            tab = initTable();
        //计算桶下标，得到对应桶的头结点f
        //2、如果f为null，即目标桶为空（没有任何节点），尝试通过 CAS 操作插入新节点。
        else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
            if (casTabAt(tab, i, null,
                         new Node<K,V>(hash, key, value, null)))
                break;                   // no lock when adding to empty bin
        }
        //3、如果目标桶的第一个节点是特殊节点（ForwardingNode），说明正在扩容，则帮助扩容
        else if ((fh = f.hash) == MOVED)
            //帮助扩容
            tab = helpTransfer(tab, f);
        //4、如果目标桶已经有节点且不是特殊节点，说明发生了冲突
        else {
            V oldVal = null;
            // 对目标桶的第一个节点加锁，确保线程安全
            synchronized (f) {
                //再次检查目标桶的第一个节点是否仍然是 f，以确保一致性。
                if (tabAt(tab, i) == f) {
                    //4.1、目标桶是链表结构
                    if (fh >= 0) {
                        binCount = 1;// 初始化计数器，记录链表长度
                        //遍历链表，尝试找到目标键
                        for (Node<K,V> e = f;; ++binCount) {
                            K ek;
                            //找到了目标键
                            if (e.hash == hash &&
                                ((ek = e.key) == key ||
                                 (ek != null && key.equals(ek)))) {
                                oldVal = e.val;
                                //根据onlyIfAbsent策略处理，为true则跳过，为false则覆盖旧值
                                if (!onlyIfAbsent)
                                    e.val = value;
                                break; // 退出循环。
                            }
                            Node<K,V> pred = e;
                            //遍历到了链表的最后一个节点仍然未找到
                            //则创建包含key和value的Node结点，插入到链表尾部
                            if ((e = e.next) == null) {
                                pred.next = new Node<K,V>(hash, key,
                                                          value, null);
                                break;// 退出循环。
                            }
                        }
                    }
                    //4.2、目标桶是红黑树结构
                    else if (f instanceof TreeBin) {
                        Node<K,V> p;
                        binCount = 2;// 初始化计数器，表示树结构。
                        // 调用红黑树的 `putTreeVal` 方法插入或更新节点。
                        if ((p = ((TreeBin<K,V>)f).putTreeVal(hash, key,
                                                              value)) != null) {
                            oldVal = p.val;
                            if (!onlyIfAbsent)
                                p.val = value;
                        }
                    }
                }
            }
            // 如果 `binCount` 不为 0，说明已经插入或更新了节点。
            if (binCount != 0) {
                // 如果链表长度超过阈值（默认 8），将链表转换为红黑树。
                if (binCount >= TREEIFY_THRESHOLD)
                    //树化（当前链表结点数>=8且哈希表长度>=64）
                    treeifyBin(tab, i);
                // 如果找到了旧值，返回旧值。
                if (oldVal != null)
                    return oldVal;
                break; // 插入完成，退出循环。
            }
        }
    }
    // 更新哈希表的元素计数，并检查是否需要扩容。
    addCount(1L, binCount);
     // 如果插入的是新节点，返回 `null`。
    return null;
}
```

***

初始化哈希表逻辑：

1. 检查哈希表是否已初始化检查哈希表是否已初始化，如果 table 为 null 或长度为 0，表示哈希表尚未初始化。
2. 处理**并发初始化**
   - 如果 `sizeCtl < 0`，说明其他线程正在初始化哈希表，当前线程让出CPU并等待。
   - 如果` sizeCtl >= 0`，尝试通过 CAS 操作将 `sizeCtl` 设置为 -1，表示当前线程正在初始化。
3. 创建哈希表
   - 如果当前线程成功获取初始化权限，检查 table 是否仍未初始化。
   - 根据 `sizeCtl `的值确定初始容量：如果`sizeCtl`大于 0，则使用其值作为初始容量，否则使用默认容量16
   - 创建一个新的哈希表数组，并将其赋值给 table。
   - 计算新的扩容阈值并将其设置给`sizeCtl `
4. 返回初始化后的哈希表。

```java
private final Node<K,V>[] initTable() {
    Node<K,V>[] tab; int sc;
    
    while ((tab = table) == null || tab.length == 0) {
        //sizeCtl < 0,说明当前正在由其他线程执行哈希表初始化，当前线程让出cpu，等待其他线程完成初始化
        if ((sc = sizeCtl) < 0)
            Thread.yield(); // lost initialization race; just spin
        // sizeCtl >= 0，尝试通过 CAS 操作将其设置为 -1。
        //表示当前线程正在初始化哈希表，其他线程需要等待。
        else if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {
            //CAS成功，准备初始化哈希表
            try {
                //再次检查table是否已经被初始化（可能其他线程已经完成了初始化）。
                if ((tab = table) == null || tab.length == 0) {
                    //如果sizeCtl大于 0，则使用其值作为初始容量，否则使用默认容量16
                    int n = (sc > 0) ? sc : DEFAULT_CAPACITY;
                    //创建新的哈希表，将其赋值给table
                    Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n];
                    table = tab = nt;
                    //计算下次触发扩容的阈值 n * 0.75
                    sc = n - (n >>> 2);
                }
            } finally {
                //设置为新的值（扩容阈值），结束初始化
                sizeCtl = sc;
            }
            break; // 初始化完成，退出循环。
        }
    }
    return tab;// 返回初始化后的哈希表。
}
```



***

更新哈希表的元素计数，并检查是否需要扩容的逻辑：

ConcurrentHashMap元素计数采用了和原子累加器类似的方法。当检测到有竞争时，创建 cells 数组，设置多个累加单元，各个线程在不同的累加单元上计数，减少线程冲突。最终合并所有分散值，保证最终结果准确。

```java
/**
 * 在put操作后更新计数并检查是否需要扩容
 * @param x 本次操作增加的节点数量（通常为1）
 * @param check 检查级别：-1表示不检查扩容，0表示创建后检查，1+表示需要检查扩容
 */
private final void addCount(long x, int check) {
    CounterCell[] as; //计数单元数组
    long b, s;
    
    // 第一部分：更新计数
    // 如果counterCells已初始化 或 CAS更新baseCount失败（说明存在竞争）执行if代码块
    if ((as = counterCells) != null ||
        !U.compareAndSwapLong(this, BASECOUNT, b = baseCount, s = b + x)) {
        
        CounterCell a; // 当前线程对应的计数单元。
        long v; 
        int m;
        boolean uncontended = true;
         // 判断 counterCells 是否被其他线程初始化
        if (as == null || (m = as.length - 1) < 0 ||
            // 前面的条件为 fasle 说明 cells 被其他线程初始化，通过 hash 寻址对应的槽位
            (a = as[ThreadLocalRandom.getProbe() & m]) == null ||
            // 尝试去对应的槽位累加，累加失败进入 fullAddCount 进行重试或者扩容
            !(uncontended = U.compareAndSwapLong(a, CELLVALUE, v = a.value, v + x))) {
             // 执行完整计数流程
            fullAddCount(x, uncontended);
            return;
        }
        if (check <= 1) // 不需要检查扩容
            return;
        s = sumCount(); // 计算最新总计数
    }
    
    
    // 第二部分：检查扩容
    if (check >= 0) {
        Node<K,V>[] tab, nt; int n, sc;
        // 循环检查扩容条件（总节点数 >= sizeCtl 且 表未达最大容量）
        while (s >= (long)(sc = sizeCtl) && (tab = table) != null &&
               (n = tab.length) < MAXIMUM_CAPACITY) {
            // 生成扩容标识码（高16位包含容量特征）
            //只有相同批次（相同容量）的扩容可以协作，避免不同容量扩容的相互干扰
            int rs = resizeStamp(n); 
            
             // CASE 1：已有扩容在进行（sc < 0）
            if (sc < 0) {
                 // 校验扩容状态是否失效（任一条件成立则退出）：
                if ((sc >>> RESIZE_STAMP_SHIFT) != rs || 	// 扩容标识不匹配
                    sc == rs + 1 ||						 	// 扩容线程已超额（理论上不可能）
                    sc == rs + MAX_RESIZERS || 				// 扩容线程数已达上限
                    (nt = nextTable) == null ||				// 扩容目标表未初始化
                    transferIndex <= 0)						// 迁移区间已分配完毕
                    break;
                
                // CAS增加扩容线程数（sc+1）
                if (U.compareAndSwapInt(this, SIZECTL, sc, sc + 1))
                    transfer(tab, nt);// 加入迁移数据工作
            }
            
            // CASE 2：当前为第一个触发扩容的线程
            else if (U.compareAndSwapInt(this, SIZECTL, sc,
                                         (rs << RESIZE_STAMP_SHIFT) + 2))
                transfer(tab, null);// 初始化迁移流程
            s = sumCount();// 重新计算总计数继续检查
        }
    }
}
```

#### transfer 扩容方法

扩容机制

- 当哈希表的负载因子超过阈值时，会触发扩容。
- 扩容时，新表的容量是旧表的两倍。
- 采用渐进式扩容方式：
  - **多线程协作完成数据迁移，每个线程只负责迁移部分槽位的数据。**
  - 迁移过程中，旧表的槽位会被占位节点（ForwardingNode）标记为已处理。



具体执行逻辑：

1. 初始化扩容，创建新表
   - 根据 CPU 核心数动态分配每个线程处理的桶区间长度stride（最小为 16），避免过多线程竞争。
   - **仅由首个触发扩容的线程**创建新的 哈希表 nextTab，容量为旧表两倍的新表
2. 分配线程的工作范围
   - 使用`transferIndex` 全局变量记录迁移进度
   - 每个线程通过 CAS 获取一个区间：根据 `stride`（步长）获取一段槽位范围来处理，避免线程竞争。
   - 通过 `advance `标志控制循环，处理完当前区间后尝试获取新区间。
3. 遍历旧表槽位，将数据迁移到新表（分裂链表或红黑树）
   - 如果槽位为空，将占位节点插入旧表，标记为已处理。
   - 如果槽位已被占位节点（标记为 MOVED），跳过。
   - 对未处理的槽位的头结点加锁，避免并发修改
     - 如果槽位包含链表：根据哈希值的高位（h & n）将链表分裂为低位链表和高位链表。低位链表保留在原索引位置，高位链表移动到新表的对应位置，旧桶标记为 ForwardingNode。
     - 如果槽位包含红黑树：根据哈希值的高位分裂为低位和高位两部分；根据节点数决定是否转为链表或保持树结构；将新树/链表设置到新表，旧桶标记为 ForwardingNode。
4. 所有线程完成迁移后，更新新表为当前表，扩容完成。

```java
private final void transfer(Node<K,V>[] tab, Node<K,V>[] nextTab) {
    int n = tab.length, stride;
    // stride 表示分配给线程任务的步长，默认就是 16 
    if ((stride = (NCPU > 1) ? (n >>> 3) / NCPU : n) < MIN_TRANSFER_STRIDE)
        stride = MIN_TRANSFER_STRIDE; // subdivide range
    
    //初始化新哈希表（仅首个触发扩容的线程执行）
    if (nextTab == null) {            // initiating
        try {
            //创建容量为原来2倍的Node数组，赋值给nextTab
            Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n << 1];
            nextTab = nt;
        } catch (Throwable ex) {      // try to cope with OOME
            sizeCtl = Integer.MAX_VALUE;
            return;
        }
        
        nextTable = nextTab;//将新表保存到 nextTable
        transferIndex = n;// 迁移起始索引（从数组末尾开始）
    }
    
    int nextn = nextTab.length;
    //转发结点，用于标记已完成迁移的槽位。
    ForwardingNode<K,V> fwd = new ForwardingNode<K,V>(nextTab);
    boolean advance = true; // 推进标记：是否推进到下一个槽位。
    boolean finishing = false; //最终完成标记，用于确保所有槽位都被处理。
    
    //主循环，从后向前 依次移动每个桶中的数据到新表
        // i 表示分配给当前线程任务，执行到的桶位
    	// bound 表示分配给当前线程任务的下界限制
    for (int i = 0, bound = 0;;) {
        Node<K,V> f;// 保存当前槽位的节点。
        int fh; // 保存当前节点的哈希值。
        
       // 步骤1：确定当前线程的迁移区间
        while (advance) {
            // 分配任务的开始下标，分配任务的结束下标
            int nextIndex, nextBound;
             // 情况1：仍在当前负责区间内
            if (--i >= bound || finishing)
                advance = false;
            
            // 情况2：全局迁移已完成
            // 如果 transferIndex 已经小于等于 0，表示没有更多的槽位需要处理
            else if ((nextIndex = transferIndex) <= 0) {
                i = -1;// 设置索引为 -1，表示处理结束。
                advance = false;
            }
             // 情况3：CAS更新transferIndex，分配新区间给当前线程
            else if (U.compareAndSwapInt
                     (this, TRANSFERINDEX, nextIndex,
                      nextBound = (nextIndex > stride ?
                                   nextIndex - stride : 0))) {
                bound = nextBound; // 更新当前线程负责的区间下界
                i = nextIndex - 1; // 设置当前处理的桶索引（从高到低处理）
                advance = false;
            }
        }
        
        // 步骤2：检查迁移完成状态
        // 如果索引 i 超出范围，或者扩容完成，进行收尾工作。
        if (i < 0 || i >= n || i + n >= nextn) {
            int sc;
             // 扩容完成，将新表设置为当前表，并更新 sizeCtl。
            if (finishing) {
                nextTable = null;
                table = nextTab;
                sizeCtl = (n << 1) - (n >>> 1);// 更新扩容阈值
                return;
            }
            // CAS减少扩容线程数，并检查是否自己是最后一个线程
            if (U.compareAndSwapInt(this, SIZECTL, sc = sizeCtl, sc - 1)) {
                if ((sc - 2) != resizeStamp(n) << RESIZE_STAMP_SHIFT)
                    return;
                finishing = advance = true; // 进入最终检查阶段
                i = n; // recheck before commit  重新扫描整个数组
            }
        }
        // 步骤3：处理空桶（CAS设置ForwardingNode节点）
        else if ((f = tabAt(tab, i)) == null)
            advance = casTabAt(tab, i, null, fwd);
        // 步骤4：跳过已处理的桶（哈希值MOVED表示已迁移）
        else if ((fh = f.hash) == MOVED)
            advance = true; // already processed
        // 步骤5：处理非空桶（同步锁保证线程安全）
        else {
            // 对桶头节点加锁
            synchronized (f) {
                // 二次校验防止被其他线程修改
                if (tabAt(tab, i) == f) {
                    Node<K,V> ln, hn;// 低位链/高位链（新表位置i和i+n）
                    
                    // CASE A：处理链表节点
                    if (fh >= 0) {
                        int runBit = fh & n;// 根据哈希值判断位置
                        Node<K,V> lastRun = f;
                        // 找到最后一个runBit变化的节点
                        for (Node<K,V> p = f.next; p != null; p = p.next) {
                            int b = p.hash & n;
                            if (b != runBit) {
                                runBit = b;
                                lastRun = p;
                            }
                        }
                        // 确定低位链和高位链头节点
                        if (runBit == 0) {
                            ln = lastRun;
                            hn = null;
                        }
                        else {
                            hn = lastRun;
                            ln = null;
                        }
                         // 构建低位链和高位链
                        for (Node<K,V> p = f; p != lastRun; p = p.next) {
                            int ph = p.hash; K pk = p.key; V pv = p.val;
                            if ((ph & n) == 0)
                                ln = new Node<K,V>(ph, pk, pv, ln);
                            else
                                hn = new Node<K,V>(ph, pk, pv, hn);
                        }
                        // 将链表设置到新表
                        setTabAt(nextTab, i, ln);
                        setTabAt(nextTab, i + n, hn);
                        setTabAt(tab, i, fwd);// 旧表位置标记为已处理
                        advance = true;
                    }
                     // CASE B：处理红黑树节点
                    else if (f instanceof TreeBin) {
                        TreeBin<K,V> t = (TreeBin<K,V>)f;
                        TreeNode<K,V> lo = null, loTail = null;
                        TreeNode<K,V> hi = null, hiTail = null;
                        int lc = 0, hc = 0;
                        // 遍历树节点并拆分
                        for (Node<K,V> e = t.first; e != null; e = e.next) {
                            int h = e.hash;
                            TreeNode<K,V> p = new TreeNode<K,V>
                                (h, e.key, e.val, null, null);
                            if ((h & n) == 0) {// 低位链
                                if ((p.prev = loTail) == null)
                                    lo = p;
                                else
                                    loTail.next = p;
                                loTail = p;
                                ++lc;
                            }
                            else {// 高位链
                                if ((p.prev = hiTail) == null)
                                    hi = p;
                                else
                                    hiTail.next = p;
                                hiTail = p;
                                ++hc;
                            }
                        }
                        // 判断是否需要树化或反树化
                        ln = (lc <= UNTREEIFY_THRESHOLD) ? untreeify(lo) :
                        (hc != 0) ? new TreeBin<K,V>(lo) : t;
                        hn = (hc <= UNTREEIFY_THRESHOLD) ? untreeify(hi) :
                        (lc != 0) ? new TreeBin<K,V>(hi) : t;
                         // 设置新表节点
                        setTabAt(nextTab, i, ln);
                        setTabAt(nextTab, i + n, hn);
                        setTabAt(tab, i, fwd);
                        advance = true;
                    }
                }
            }
        }
    }
}
```

## 9.3、LinkedBlockingQueue

LinkedBlockingQueue 是 Java 并发包中的一个基于**单链表**的阻塞队列实现，采用 FIFO（先进先出） 策略，支持容量限制。它通过 **双锁**分离设计（<u>入队锁和出队锁</u>） 和 **条件变量** 实现高并发性能，支持 生产者-消费者模式，适用于多线程间的安全数据传递。

**核心方法**

- `void put(E e)`：将元素插入队列，如果队列已满，**阻塞**直到有空位。
- `E take()`：获取并移除队列头部元素，如果队列为空，**阻塞**直到有元素可用。
- `boolean offer(E e)`：尝试将元素插入队列，如果队列已满，返回 false。
- `E poll()`：获取并移除队列头部元素，如果队列为空，返回 null。
- `int size()`：返回当前队列中元素的数量。
- `int remainingCapacity()`：返回队列剩余的可用容量。
- `boolean remove(Object o)`：从队列中移除指定元素（如果存在）。
- `boolean contains(Object o)`：	检查队列是否包含指定元素。
- `Iterator<E> iterator()`：	返回队列的弱一致性迭代器。



### 链表操作

既然它是基于链表实现的，那么首先分析它内部链表的结构和相关操作

链表节点的定义：

- `item`：节点存储的数据
- `next`指针，关于它的指向有三种情况
  - 指向真正的后继节点
  - 指向自己，发生在出队时
  - 指向null，表示是没有后继节点了

```java
static class Node<E> {
        E item;
        Node<E> next;
        Node(E x) { item = x; }
    }

//指向链表头部的指针
transient Node<E> head;
//指向链表尾部的指针
private transient Node<E> last;
```

***

队列初始化时会创建一个不包含数据的头结点，让队列的head和last指针都指向它

```java
public LinkedBlockingQueue(int capacity) {
    if (capacity <= 0) throw new IllegalArgumentException();
    this.capacity = capacity;
    last = head = new Node<E>(null);
}
```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250408162349625-2025-4-816:23:50.png" style="zoom:80%;" />

***

入队操作：首先让尾结点的next指针指向node，再将last指针指向node

```java
private void enqueue(Node<E> node) {
    // assert putLock.isHeldByCurrentThread();
    // assert last.next == null;
    last = last.next = node;
}
```

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250408161909558-2025-4-816:19:16.png" style="zoom:80%;" />

***

出队操作：将队首的结点变成新的头结点，并返回它的数据。原来的头结点被垃圾回收。

```java
private E dequeue() {
    // assert takeLock.isHeldByCurrentThread();
    // assert head.item == null;
    Node<E> h = head;
    Node<E> first = h.next;
    h.next = h; // help GC
    head = first;
    E x = first.item;
    first.item = null;
    return x;
}
```

队头结点准备出队，`h`指向头结点，`first`指向第一个元素结点

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250408162958329-2025-4-816:30:08.png" style="zoom:80%;" />

然后让`h`的next指向自己，帮助对其进行垃圾回收；`head`执行第一个元素结点，将其存储的数据取出后，再将item设置为null，让它成为新的头结点，最后返回数据

<img src="https://gitee.com/cmyk359/img/raw/master/img/image-20250408162757452-2025-4-816:27:58.png" style="zoom:80%;" />

### 双锁机制

之前在自定义线程池中使用了自己定义的阻塞队列，其中只使用了一把锁，加在整个队列上。那么同一时刻只会有一个线程执行（生产者或消费者，二选一）。

而LinkedBlockingQueue使用了两把锁（putLock和takeLock），分别对队头结点和队尾结点加锁。那么**同一时刻可以允许两个线程同时执行**（一个生产者与一个消费者）。

```java
// 用于 put(阻塞) offer(非阻塞)
private final ReentrantLock putLock = new ReentrantLock();
// 用户 take(阻塞) poll(非阻塞)
private final ReentrantLock takeLock = new ReentrantLock();
```

- 生产者要入队元素时，需要先获得`putLock`
  - 若当前队列已满，则进入`notFull`条件等待
  - 若添加后队列仍不满，则由它唤醒**一个**等待的生产者，并释放锁。
  - 若添加前队列为空，则从`notEmpty`条件中唤醒**一个**等待的消费者（已经有元素可以被消费）
- 消费者要出队元素时，需要先获得`takeLock`
  - 若当前队列为空，则进入`notEmpty`条件等待
  - 若出队后队列仍不为空，则由它唤醒**一个**等待的消费者，并释放锁。
  - 若出队前队列为满，则从`notFull`条件中唤醒**一个**等待的生产者（已经有位置可供添加）

{% note warning%}

它所做的一个优化是，唤醒等待线程时使用`signal()`随机唤醒一个，而不是使用`signalAll()`唤醒全部。反正最后只会有一个线程获得锁，那就只唤醒一个，避免不必要的竞争。

在双锁机制下：

- 消费者与消费者线程仍然串行

- 生产者与生产者线程仍然串行

{% endnote%}



### 队列操作

put方法执行流程

1. 获取 `putLock`，检查队列是否已满。
2. 若满，通过 `notFull.await()` 挂起生产者线程。
3. 未满则将节点添加到链表尾部，更新计数器。
4. 若添加后队列未满，唤醒其他等待的生产者。（使用signal只随机唤醒一个，避免不必要的竞争）
5. 若入队前队列为空（现在有结点了），唤醒等待的消费者。

```java
public void put(E e) throws InterruptedException {
    //不允许值为null
    if (e == null) throw new NullPointerException();
    int c = -1;
    Node<E> node = new Node<E>(e);
    final ReentrantLock putLock = this.putLock;
    // count 用来维护元素计数
    final AtomicInteger count = this.count;
    putLock.lockInterruptibly(); //获得锁，可打断
    try {
        //队列已满
        while (count.get() == capacity) {
            notFull.await();//进入notFull条件等待
        }
        // 将节点添加到链表尾部
        enqueue(node)
        c = count.getAndIncrement();//count++，返回给c的是累加前的count
        //优化：如果添加后仍有空间，则使用signal()随机唤醒一个生产者
        //而不是使用signalAll() 唤醒所有，避免不必要的竞争
        if (c + 1 < capacity)
            notFull.signal();
    } finally {
        putLock.unlock(); //释放锁
    }
    //如果插入前队列为空，唤醒消费者，通知队列中已经有元素可以被消费。
    if (c == 0) 
        signalNotEmpty();
}

//获得 takeLock，唤醒一个消费者
private void signalNotEmpty() {
    final ReentrantLock takeLock = this.takeLock;
    takeLock.lock();
    try {
        notEmpty.signal();
    } finally {
        takeLock.unlock();
    }
}
```

***

take操作执行流程

1. 获取 `takeLock`，检查队列是否为空。
2. 若空，通过 `notEmpty.await()` 挂起消费者线程。
3. 非空则移除头节点，更新计数器。
4. 若出队前队列非空，唤醒其他消费者。（使用signal只随机唤醒一个，避免不必要的竞争）
5. 若出队前队列已满（现在有空位了），唤醒生产者。

```java
public E take() throws InterruptedException {
    E x;
    int c = -1;
    final AtomicInteger count = this.count;
    final ReentrantLock takeLock = this.takeLock;
    takeLock.lockInterruptibly();
    try {
        //如果队列为空，进入notEmpty条件等待
        while (count.get() == 0) {
            notEmpty.await();
        }
        //队首节点出队，返回它的值
        x = dequeue();
        c = count.getAndDecrement(); //count--,返回给c的是递减前的count
        //优化：如果出队后队列非空，则使用signal()随机唤醒一个消费者
        //而不是使用signalAll() 唤醒所有，避免不必要的竞争
        if (c > 1)
            notEmpty.signal();
    } finally {
        takeLock.unlock(); //解锁
    }
    //如果出队前队列已满，则唤醒生产者
    if (c == capacity)
        signalNotFull();
    return x;
}


//获取putLock锁，唤醒一个生产者
private void signalNotFull() {
    final ReentrantLock putLock = this.putLock;
    putLock.lock();
    try {
        notFull.signal();
    } finally {
        putLock.unlock();
    }
}
```



***

remove方法

1. 同时获取`takeLock`和`putLock`，锁住整个链表
2. 遍历链表找到与指定值相等的结点
   - 若找到了，则删除该节点，返回true
   - 若未找到，返回false
3. 释放这两把锁

```java
public boolean remove(Object o) {
    if (o == null) return false;
    //同时获得两把锁，锁住队头和队尾
    fullyLock();
    try {
        //遍历链表，找到与指定值相等的结点
        for (Node<E> trail = head, p = trail.next;
             p != null;
             trail = p, p = p.next) {
            //找到了，删除结点p，返回true
            if (o.equals(p.item)) {
                unlink(p, trail);
                return true;
            }
        }
        //在链表中没找到，返回false
        return false;
    } finally {
        fullyUnlock();//释放两把锁
    }
}


void fullyLock() {
    putLock.lock();
    takeLock.lock();
}

void fullyUnlock() {
    takeLock.unlock();
    putLock.unlock();
}

//删除节点p，trail是它的前驱节点
void unlink(Node<E> p, Node<E> trail) {
    //删除节点p，让trail执行它的后继
    p.item = null;
    trail.next = p.next;
    //如果p是最后一个结点，则让last指向删除后的最后一个结点trail
    if (last == p)
        last = trail;
    //链表节点数-1，若删除前队列已满，则唤 一个 醒生产者
    if (count.getAndDecrement() == capacity)
        notFull.signal();
}
```

### 对比

与之类似的集合类是**ArrayBlockingQueue**，二者相比

- Linked 支持有界，Array 强制有界
- Linked 实现是链表，Array 实现是数组
- Linked 是懒惰的，而 Array 需要提前初始化 Node 数组
- Linked 每次入队会生成新 Node，而 Array 的 Node 是提前创建好的
- Linked 两把锁，Array 一把锁

***

**ConcurrentLinkedQueue** 的设计与 LinkedBlockingQueue 非常像，也是

- 两把【锁】，同一时刻，可以允许两个线程同时（一个生产者与一个消费者）执行

- dummy 节点的引入让两把【锁】将来锁住的是不同对象，避免竞争

- 只是这【锁】使用了 <span style="color:red"> CAS</span>  来实现

## 9.4、CopyOnWriteArrayList

[CopyOnWriteArrayList API文档](https://www.runoob.com/manual/jdk11api/java.base/java/util/concurrent/CopyOnWriteArraySet.html)

`CopyOnWriteArrayList`通过写时复制机制，以空间换时间，为**读多写少**的场景提供了高效的线程安全解决方案。但在写操作频繁或数据量大的场景下需谨慎使用，避免性能瓶颈和内存压力。

核心思想：**写时复制（Copy-On-Write, COW）**：在修改操作（如添加、删除、更新元素）时，通过复制底层数组实现线程安全。读操作直接访问原数组，无需加锁；写操作通过锁保证互斥，并在新数组副本上完成修改，最终替换原数组引用。

底层使用被 `volatile`修饰的Object数组存储数据，确保数组引用的修改对所有线程可见；同时使用可重入锁保证写操作的原子性和可见性。

```java
private transient volatile Object[] array; //存储元素的底层数组
final transient ReentrantLock lock = new ReentrantLock(); //写操作同步锁 
```



关键操作

- **添加元素（`add`方法）**

  **步骤**：

  1.获取锁（保证同一时间只有一个写操作）。

  2.复制原数组到新数组（长度+1）。

  3.在新数组中添加元素。

  4.将 `array`引用指向新数组（`volatile`写保证可见性）。

  **性能分析**：时间复杂度为 `O(n)`，复制数组操作在大数据量时开销显著

  ```java
  /**
   * Appends the specified element to the end of this list.
   *
   * @param e element to be appended to this list
   * @return {@code true} (as specified by {@link Collection#add})
   */
  public boolean add(E e) {
      final ReentrantLock lock = this.lock;
      lock.lock(); //获取锁 
      try {
          Object[] elements = getArray(); //获取当前数组 
          int len = elements.length;
          Object[] newElements = Arrays.copyOf(elements, len +1); //复制新数组（长度+1）
          newElements[len] = e; //在新数组末尾添加元素
          setArray(newElements); //替换原数组引用 		
          return true;
      } finally {
          lock.unlock(); //释放锁 
      }
  }
  ```

- **读取元素（`get`方法）**

  **特点**：无需加锁，直接通过索引访问数组元素，时间复杂度为 `O(1)`。

  ```java
  /**
   * {@inheritDoc}
   *
   * @throws IndexOutOfBoundsException {@inheritDoc}
   */
  public E get(int index) {
      return get(getArray(), index); //直接访问原数组
  }
  
  @SuppressWarnings("unchecked")
  private E get(Object[] a, int index) {
      return (E) a[index]; //无锁访问
  }
  ```

- **删除元素（`remove`方法）**

  **步骤**：1.获取锁。2.创建新数组，跳过待删除元素。3.替换原数组引用。

  ```java
  /**
   * Removes the element at the specified position in this list.
   * Shifts any subsequent elements to the left (subtracts one from their
   * indices).  Returns the element that was removed from the list.
   *
   * @throws IndexOutOfBoundsException {@inheritDoc}
   */
  public E remove(int index) {
      final ReentrantLock lock = this.lock;
      lock.lock();//加锁
      try {
          Object[] elements = getArray();
          int len = elements.length;
          E oldValue = get(elements, index);//获取待删除元素
          int numMoved = len - index - 1;
          if (numMoved == 0)
              setArray(Arrays.copyOf(elements, len - 1));//删除末尾元素
          else {
              Object[] newElements = new Object[len - 1];
              System.arraycopy(elements, 0, newElements, 0, index);//复制前半部分
              System.arraycopy(elements, index + 1, newElements, index,
                               numMoved);//复制后半部分
              setArray(newElements);
          }
          return oldValue;
      } finally {
          lock.unlock(); //释放锁
      }
  }
  ```

- 迭代器实现

  **基于快照**：迭代器构造时保存当前数组的副本，遍历过程中始终访问该快照。遍历时不会反映其他线程对数组的修改，但保证不会抛出 `ConcurrentModificationException`。

  ```java
      /**
       * Returns an iterator over the elements in this list in proper sequence.
       *		以适当的顺序返回此列表中元素的迭代器。
       *
       * <p>The returned iterator provides a snapshot of the state of the list
       * when the iterator was constructed. No synchronization is needed while
       * traversing the iterator. The iterator does <em>NOT</em> support the
       * {@code remove} method.
       *	返回的迭代器提供构造迭代器时列表状态的快照。 遍历迭代器时不需要同步。 该迭代器不支持remove方法。 
       * @return an iterator over the elements in this list in proper sequence
       */
      public Iterator<E> iterator() {
          return new COWIterator<E>(getArray(), 0);
      }
  ```

  

**优缺点分析**

| **优点**                                | **缺点**                          |
| --------------------------------------- | --------------------------------- |
| ✅读操作完全无锁，高并发性能极佳         | ❌写操作性能低（复制数组开销大）   |
| ✅避免 `ConcurrentModificationException` | ❌内存占用高（频繁复制数组）       |
| ✅简单实现线程安全                       | ❌数据弱一致性（迭代器访问旧快照） |

**适用场景**

- **高频读 +低频写**：如全局配置表、黑白名单、缓存等。
- **允许数据延迟**：迭代器不需要实时反映最新数据。