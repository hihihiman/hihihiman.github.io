# 🚩Java 基础


<!--more-->

![image.png](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681107594592-f7815896-a369-4941-972a-44a823f91a30.png)

### 元注解

- `@Retention`用于标明注解被保留的阶段 RetentionPolicy

- - SOURCE 源文件保留
  - CLASS 编译期保留，默认值（.class：RuntimeInvisibleAnnotations）
  - RUNTIME 运行期保留，可通过反射去获取注解信息（.class： RuntimeVisibleAnnotations）

- `@Target`用于标明注解使用的范围 ElementType
- `@Inherited`用于标明注解可继承

### 反射

1. 反射类及反射方法的获取，都是通过从列表中搜寻查找匹配的方法，所以查找性能会随类的大小方法多少而变化；
2. 每个类都会有一个与之对应的Class实例，从而每个类都可以获取method反射方法，并作用到其他实例身上；
3. 反射也是考虑了线程安全的，放心使用；
4. 反射使用软引用relectionData缓存class信息，避免每次重新从jvm获取带来的开销；
5. 反射调用多次生成新代理Accessor, 而通过字节码生存的则考虑了卸载功能，所以会使用独立的类加载器；

1. 1. invoke时，是通过 MethodAccessor 进行调用的，而 MethodAccessor 是个接口，在第一次时调用 acquireMethodAccessor() 进行新创建。
   2. 进行 ma.invoke(obj, args); 调用时，调用 DelegatingMethodAccessorImpl.invoke();最后被委托到 NativeMethodAccessorImpl.invoke()
   3. 在ClassDefiner.defineClass方法实现中，每被调用一次都会生成一个DelegatingClassLoader类加载器对象 ，这里每次都生成新的类加载器，是为了性能考虑，在某些情况下可以卸载这些生成的类，因为类的卸载是只有在类加载器可以被回收的情况下才会被回收的，如果用了原来的类加载器，那可能导致这些新创建的类一直无法被卸载。而反射生成的类，有时候可能用了就可以卸载了，所以使用其独立的类加载器，从而使得更容易控制反射类的生命周期。

1. 当找到需要的方法，都会copy一份出来，而不是使用原来的实例，从而保证数据隔离；
2. 调度反射方法，最终是由jvm执行invoke0()执行；

### API vs SPI？

#### SPI - “接口”位于“调用方”所在的“包”中

- 概念上更依赖调用方。
- 组织上位于调用方所在的包中。
- 实现位于独立的包中。
- 常见的例子是：插件模式的插件。

使用SPI机制的缺陷：

- 不能按需加载，需要遍历所有的实现，并实例化，然后在循环中才能找到我们需要的实现。如果不想用某些实现类，或者某些类实例化很耗时，它也被载入并实例化了，这就造成了浪费。
- 获取某个实现类的方式不够灵活，只能通过 Iterator 形式获取，不能根据某个参数来获取对应的实现类。
- 多个并发多线程使用 ServiceLoader 类的实例是不安全的。

#### API - “接口”位于“实现方”所在的“包”中

- 概念上更接近实现方。
- 组织上位于实现方所在的包中。
- 实现和接口在一个包中。

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1691053223670-932f3da0-7bbc-456b-86bd-7acbd1b6c5a0.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1691053230525-0cbb49d9-8962-4f69-866b-3ff9d3cbb2b7.png)

### happens-before规则？

Java 虚拟机在进行代码**编译优化**时，会出现**指令重排**序问题，为了避免编译优化对并发编程安全性的影响，Java 虚拟机需要 happens-before 规则限制或禁止编译优化的场景，保证系统**并发**的安全性。

### 为什么金额不能使用double，要使用BigDecimal？

浮点数不精确的根本原因在于**尾数部分的位数**是固定的，一旦需要表示的数字的精度高于浮点数的精度，那么必然产生误差！这在处理金融数据的情况下是绝对不允许存在的。

### 强引用、软引用、弱引用、幻象引用有什么区别？

- 强引用，就是我们最常见的普通对象引用，只要还有强引用指向一个对象，就能表明对象还“活着”，垃圾收集器不会碰这种对象。对于一个普通的对象，如果没有其他的引用关系，只要超过了引用的作用域或者显式地将相应（强）引用赋值为 null，就是可以被垃圾收集的了，当然具体回收时机还是要看垃圾收集策略。
- **软引用**（SoftReference），是一种相对强引用弱化一些的引用，可以**让对象豁免一些垃圾收集**，只有当 JVM 认为**内存不足时**，才会去试图回收软引用指向的对象。JVM 会确保在抛出 OutOfMemoryError 之前，清理软引用指向的对象。软引用通常用来实现内存敏感的缓存，如果还有空闲内存，就可以暂时保留缓存，当内存不足时清理掉，这样就保证了使用缓存的同时，不会耗尽内存。

- - 反射使用软引用relectionData缓存class信息，避免每次重新从jvm获取带来的开销；

- **弱引用**（WeakReference）并不能使对象豁免垃圾收集，仅仅是提供一种访问在弱引用状态下对象的途径。这就可以用来构建一种没有特定约束的关系，比如，维护一种非强制性的映射关系，如果试图获取时对象还在，就使用它，否则重现实例化。它同样是很多**缓存实现**的选择。
- **虚引用**，你不能通过它访问对象。幻象引用仅仅是**提供了一种确保对象被 finalize 以后，做某些事情的机制**，比如，通常用来做所谓的 **Post-Mortem 清理机制**，我在专栏上一讲中介绍的 Java 平台自身 Cleaner 机制等，也有人**利用幻象引用监控对象的创建和销毁**。

### NIO

- `Buffer`：高效的数据容器，**除了布尔类型，所有原始数据类型都有相应的 Buffer 实现**。
- `Channel`：类似在 Linux 之类操作系统上看到的文件描述符，是 NIO 中被用来支持批量式 IO 操作的一种抽象。**File 或者 Socket，通常被认为是比较高层次的抽象**，而 Channel 则是更加操作系统底层的一种抽象，这也使得 NIO 得以充分利用现代操作系统底层机制，获得特定场景的性能优化，例如，DMA（Direct Memory Access）等。不同层次的抽象是相互关联的，我们可以通过 Socket 获取 Channel，反之亦然。
- `Selector`：是 NIO 实现多路复用的基础，它提供了一种高效的机制，**可以检测到注册在 Selector 上的多个 Channel 中，是否有 Channel 处于就绪状态**，进而实现了**单线程对多 Channel 的高效管理**。
- `Charset`：提供 Unicode 字符串定义，NIO 也提供了相应的**编解码器**等

NIO 引入的多路复用机制，可作为线程池机制的平替：

```java
public class NIOServer extends Thread {
    public void run() {
        try (Selector selector = Selector.open();
             ServerSocketChannel serverSocket = ServerSocketChannel.open();) {// 创建Selector和Channel
            serverSocket.bind(new InetSocketAddress(InetAddress.getLocalHost(), 8888));
            // Q：为什么我们要明确配置非阻塞模式呢？
            serverSocket.configureBlocking(false);
            // 注册到Selector，并说明关注点
            serverSocket.register(selector, SelectionKey.OP_ACCEPT);
            while (true) {
                selector.select();// 阻塞等待就绪的Channel，这是关键点之一
                Set<SelectionKey> selectedKeys = selector.selectedKeys();
                Iterator<SelectionKey> iter = selectedKeys.iterator();
                while (iter.hasNext()) {
                    SelectionKey key = iter.next();
                   // 生产系统中一般会额外进行就绪状态检查
                    sayHelloWorld((ServerSocketChannel) key.channel());
                    iter.remove();
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    private void sayHelloWorld(ServerSocketChannel server) throws IOException {
        try (SocketChannel client = server.accept();) {          client.write(Charset.defaultCharset().encode("Hello world!"));
        }
    }
   // 省略了与前面类似的main
}
```

A：这是因为阻塞模式下，注册操作是不允许的，会抛出 IllegalBlockingModeException 异常。

### todo：什么是零拷贝？

定义：计算机执行IO操作时，CPU不需要将数据从一个存储区域复制到另一个存储区域，从而可以减少上下文切换和CPU的拷贝时间，是一种IO操作优化技术。

传统拷贝：

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681822652912-36957f87-070c-4535-a5bf-b86c4f88a332.png)

- 内核空间：操作系统内核访问的区域，是受保护的内存空间，主要提供进程调度、内存分配、连接硬件资源等功能；
- 用户空间：用户应用程序访问的内存区域。（fopen、fwrite、fread）
- 系统调用：从用户态进入内核态，发生CPU上下文的切换（open、write、read）

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681823052470-c9dd89a8-9192-467b-aae3-79c1f6d328d9.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681823116070-e2abf203-530a-4f67-9a0c-3ed86ba4cf50.png)

零拷贝的三种实现方式：

1. mmap+write

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681823314702-bb14671b-cf83-4146-b79c-63b60111487c.png)

1. sendfile

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681823652051-af9d254a-a87c-45a3-b4a9-f540f8b942da.png)

1. 带有DMA收集拷贝功能的sendfile

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681823717817-ff5505fa-add5-439d-8151-ac7d814c572e.png)

Java中的零拷贝：

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681823780707-2855779e-328f-4cb0-927e-56d2cacabb24-20230808151622819.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681823799067-ef522533-0c5f-4e34-aeec-129cb1b948f1-20230808151542249.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681461882041-144b97e3-8c62-4c49-b99e-691b48fc8d27-20230808151548842.png)

### JIT

引入JIT（Just-In-Time）编译的主要目的是提高程序的执行性能。传统的编译方式是提前将源代码编译成机器码，然后在运行时执行。而JIT编译是在程序运行时将部分代码进行动态编译成机器码，以提高执行效率。

JIT编译器会在运行时对热点代码进行监测和分析，热点代码指的是频繁执行的代码块或方法。一旦确定某段代码是热点代码，JIT编译器会将其编译成机器码，并缓存起来，以便下次执行时直接使用。这样可以避免每次执行都需要进行解释和执行源代码的性能损耗。

#### 逃逸分析

是一种静态分析技术，用于确定程序中的对象是否逃逸出方法的作用域。逃逸指的是对象在方法外被引用或传递给其他方法使用的情况

- 栈上分配和标量替换。栈上分配将对象分配在线程栈上，减少堆内存的使用。
- 标量替换将对象拆分为独立的字段，存储在寄存器或栈上。


---

> 作者: 都将会  
> URL: https://leni.fun/java_base/  

