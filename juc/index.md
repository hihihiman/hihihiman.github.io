# 🚩JUC


> JUC = java.util.concurrent

<!--more-->

### 进程 vs 线程？

1. 进程是正在运行程序的实例（多开软件 = 多实例进程），包含了线程
2. 进程是分配资源的基本单位，同一进程下所有线程共享内存空间
3. 切换线程成本 < 切换进程
4. 容器的本质是进程。
### 并行 vs 并发？

- 并发：同一时间，**多个线程轮流使用 CPU**，Java 并发有三大特性
   - **原子性**：锁
   - **可见性**：一个线程修改共享变量对其他线程可见（volatile）
   - **有序性**：防止先读和后写（volatile）
- 并行：4 核 CPU 同时执行 4 个线程
### 🌟创建线程的方式？

1. extends Thread @override run()
2. implements Runnable @override run() 无返回值，不可抛异常
3. implements Callable @ovverride call() 有返回值，可抛异常
   1. FutureTask<> ft; ft.get() 异步获得结果
4. 线程池
#### Executors 和 ThreadPoolExecutors 的区别和联系？
ThreadPoolExecutor 是线程池的核心实现，有 7 大参数：
public ThreadPoolExecutor(

1. int corePoolSize 核心线程数，对于 N 核（逻辑处理器） CPU
   1. **IO 密集型：2N+1**，读写请求任务时间长
   2. **CPU 密集型：N+1**，计算、Bitmap 转换，高并发，减少切换上下文
2. int maximumPoolSize 最大（核心+救急）线程数
3. long keepAliveTime 救急线程生存时间值
4. TimeUnit unit 救急线程生存时间单位
5. BlockingQueue<Runnable> queue 阻塞队列，满了创建救急线程
   1. ArrayBlockingQueue 数组 FIFO（饿加载），入队出队锁住整个队列
   2. LinkedBlockingQueue 链表 FIFO（懒加载），收尾有两把锁，入队出队互不影响，效率高
   3. DelayedWorkQueue 出队执行时间靠前的
   4. SynchronousQueue：每次插入都等待移出，不存储元素
6. ThreadFactory threadFactory 定义线程名、是否是守护线程
7. RejectedExecutionHandler handler 当线程和阻塞队列都忙时，触发的拒绝策略
   1. AbortPolicy 抛异常（默认）
   2. CallerRunsPolicy 调用者所在线程执行
   3. DiscardOldestPolicy 丢弃阻塞队列最久任务
   4. DiscardPolicy 丢弃当前任务

Executors 是一个工具类，提供了一些快速创建线程池的静态方法，但**不推荐使用**，原因：
线程池或请求队列长度 = Integer.MAX_VALUE 没做限制，会导致 OOM。

- newCachedThreadPool()：它会试图**缓存线程**并重用，当无缓存线程可用时，就会创建新的工作线程；用来处理大量短时间工作任务。其内部使用 **SynchronousQueue** 作为工作队列。
- newFixedThreadPool(int nThreads)：固定线程数，用于任务量已知且相对耗时的场景。
- newSingleThreadExecutor()：单线程，顺序执行任务
- newSingleThreadScheduledExecutor() 和 newScheduledThreadPool(int corePoolSize)，创建的是个 ScheduledExecutorService，可以进行**定时或周期性**的工作调度，区别在于单一工作线程还是多个工作线程。
- newWorkStealingPool(int parallelism)，这是一个经常被人忽略的线程池，**Java 8** 才加入这个创建方法，其**内部会构建ForkJoinPool**，利用Work-Stealing算法，**并行地处理任务，不保证处理顺序**。
#### 线程池使用场景

1. **数据迁移**：MySQL -> es 用到了 CountDownLatch + 线程池，初始值设为查询总页数，每页 ctl.countDown()，最终 countDownLatch.await() 等待计数归零
2. 数据汇总：并行执行没有依赖关系的接口，Callable + Future
3. 异步调用：上级方法不需依赖下级方法的返回值 e.g. **保存搜索历史**
   1. @EnableAsync class SpringBootApplication
   2. @Async("taskExecutor")
### Java 线程的状态

- `yield()`：使线程进入就绪状态，但不释放锁资源，不会导致阻塞
- `t.join()`：当前线程调用线程t，当前线程不释放锁，t会释放同步锁
- `**notify()**`：**随机**唤醒在此监视器上等待的线程

![image.png](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/1dba36cf63eb3676a04f33a5373f190d.png)
#### 🌟Object.wait() vs Thread.sleep(long) ？

1. **wait() 方法是 Object 类的成员方法，而 sleep() 方法是 Thread 类的静态方法**。在使用 wait() 方法时需要获取对象的监视器锁，而 sleep() 方法不需要。
2. wait() 方法会释放对象的**监视器锁**，使得其他线程可以获取该对象的监视器锁并执行同步代码块或同步方法。而 sleep() 方法不会释放任何锁，线程仍然持有之前获取的所有锁。
3. wait() 方法必须在 **synchronized 块或方法内部调用**，即在 synchronized 块或方法内部调用 wait() 方法时，当前线程会释放锁并进入等待状态。而 sleep() 方法可以在任何地方调用，不需要持有任何锁。
4. wait() 方法会一直等待，直到被 notify() 或 notifyAll() 唤醒，或者等待超时。而 sleep() 方法会暂停线程的执行，等待指定的时间后自动唤醒线程。
#### 如何停止线程？

1. 正常执行完 run()
2. stop() 不推荐
3. **interrupt 打断**（阻塞会抛异常 InterruptedException），成功后可用 isInterrupt() 判断

### 🌟synchronized
#### synchronized 中的锁

1. 偏向锁【无竞争】：只被一个线程持有，第一次 CAS（乐观锁），之后判断线程 id
   1. 🌟CAS = Compare and Swap（比较并替换）：当且仅当**内存地址V的值**与**预期值A**相等时，将内存地址V的值修改为**目标值B**，否则就什么都不做。**在无锁情况下，保证线程操作共享数据的原子性**，通过自旋锁，调用操作系统底层 CAS 来实现（Unsafe 类），用于 AQS、AtomicXxx。缺点：循环时间长开销很大、只能保证一个共享变量的原子操作、ABA问题。
2. 轻量级锁【有竞争】：多线程交替，每次修改都是 CAS 操作，保证原子性
3. 重量级锁 Monitor【多线程竞争】：悲观锁，由 JVM 提供，C++实现。一旦发生锁竞争，都会编程重量级锁
   1. waitSet：waiting 状态的线程集合
   2. entrySet：BLOCKED 状态的线程集合
   3. owner：当前获得锁的线程，只有一个
#### Hotspot JVM 中对象存储锁的方式

- 对象头
   - MarkWord（001 无锁，101 偏向锁，00 轻量级锁，10 重量级锁，11 GC）
   - KlassWord
- 实例数据 Object body
- 对齐填充
#### Lock 和 synchronized 的区别？
synchronized 是Java 的一个内置关键字，只能实现非公平锁。
Lock 是一个类，有 ReentrantLock、ReentrantReadWriteLock 的实现，可以实现：

1. 公平锁
2. 中断试图获取锁的一个线程
3. 设置超时
4. 必须手动 `unlock()`释放，防止死锁

有竞争时，Lock 性能更好。
### 死锁诊断

- jps：JVM 中**进程**状态
- jstack：Java 进程内**线程**的堆栈 `jstack -l <进程 id>`
- jconsole：对 JVM 的**内存、线程、类**的监控
### 🌟volatile
功能：

1. 保证线程间的**可见性**
2. **禁止指令重排序**（JIT 即时编译器自动优化，可通过 -Xint 关闭，但不推荐）

用法和原理：

1. volatile 修饰的**写变量放在最后**，阻止上方写操作越过屏障
2. volatile 修饰的**读变量放在最先**，阻止下方读操作约过屏障

使用场景：

1. DCL 单例
2. AQS.state

### 🌟AQS = AbstractQueuedSynchronizer 抽象队列同步器
Q：和 synchronized 的区别？
A： 他们都是悲观锁。**AQS 由 Java 实现，手动开启和关闭**，处理竞争有多种方案，synchronized 由 C++ 实现，自动释放锁，遇到竞争就变成重量级锁，性能差。
AQS 有一个 FIFO 队列，head 指向最久元素，tail 指向最新元素，可以实现公平锁和非公平锁：

- 公平锁：FIFO
- 非公平锁：新元素与队列中元素竞争

使用场景：

1. ReentrantLock 可重入锁 = CAS + AQS（extends）
   1. exclusiveOwnerThread 当前持有锁的线程，当其为 null 时，唤醒双向队列中的线程
2. Semaphore：控制某方法并发访问线程数
   1. **acquire() 请求 -1**
   2. **release() 释放 +1**

内部状态： volatile state = 0 无锁/1 有锁 ，修改通过 CAS，保证原子性。


### ThreadLocal
为每个线程都分配一个独立的线程副本，解决多线程并发访问冲突问题，包含 set、get、remove 方法，key 是 ThreadLocal 自己，放入 ThreadLocalMap 中。
#### 使用场景

1. 在复杂的链式调用中传递参数：工作中可能会遇到很长的调用链，例如：在A->B->C->D的调用链中，D需要使用A的参数，而为了避免一层层传递参数，可以使用ThreadLocal将参数存储在A中，然后在D中取出使用。
2. 为每个线程生成独立的随机数或者其他类似的资源：在多线程编程中，可能需要为每个线程生成独享的对象，避免多线程下的竞争条件。例如，给每个线程携带dateFormat。
```java
    static ThreadLocal<SimpleDateFormat> dateFormatThreadLocal = ThreadLocal.withInitial(() ->
            new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
    // ...略
    
    public static String date(int seconds) {
        //参数的单位是毫秒，从1970.1.1 00:00:00 GMT计时
        Date date = new Date(1000 * seconds);
        SimpleDateFormat dateFormat = dateFormatThreadLocal.get();
        return dateFormat.format(date);
    }
```
ThreadLocal是一种避免共享的设计模式，它是一种`无同步方案`。其实把dateFormat写在date()里面也是无同步方案，只不过，它叫另一种名字——`栈封闭`
#### 强、软、弱、虚引用

- 强引用：new，GC Root （**可达性分析**）找不到时回收
- 软引用：SoftReference，内存不足时回收
- 弱引用：WeakReference，始终回收
- 虚引用：ReferenceQueue，由 ReferenceHandler 线程释放
#### 内存泄漏问题
```java
static class Entry extends WeakReference<ThreadLocal<?>>{
    Object value;
    Entry(ThreadLocal<?> k,Object v){
        super(k); // 弱引用，GC 会释放
        value = v; // 强引用，内存泄漏
    }
}
```
解决方案：手动调用 remove() 方法


---

> 作者: 都将会  
> URL: https://leni.fun/juc/  

