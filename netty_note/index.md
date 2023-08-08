# Netty 杂记


<!--more-->

### 五种 IO 模型

通信模式：同步、异步

线程处理模式：阻塞、非阻塞

五种 IO 模型

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678173074860-40037a85-e5ec-414c-a92d-9dc368b52fc5.png)

- BIO（阻塞式）：在while(true)中调用accept()方法等待客户端。一个线程只能同时处理一个连接请求
- 非阻塞式IO：内核会立即返回，已获得足够的CPU事件继续做其他事情，用户进程的第一阶段不阻塞，需要不断主动询问kernel数据是否准备好，第二阶段仍然阻塞。
- 多路复用IO/事件驱动IO：在单线程里同事监控多个套接字，通过select或poll轮询所负责的socket，当某个socket有数据到达了就通知用户进程。进程首先阻塞在select/poll上，再阻塞在读操作的第二阶段上。
- 信号驱动IO：在IO执行的数据准备阶段，不会阻塞用户进程，当用户进程收到信号后，才去查收数据。
- 异步IO：用户进程发出系统调用后立即返回，内核等待数据准备完成后，将数据拷贝到用户进程缓冲区，然后告诉用户进程IO操作执行完毕。

### 什么是 Netty？

Netty 是一个高性能的网络通信框架，基于 NIO 技术实现，广泛应用于互联网服务开发中，包括 Web 服务器、RPC、消息中间件等领域。

#### 常规 IO

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1687675328453-b3adb02c-c8a0-4636-bfa3-1867f1cd23df.png)



#### NIO：少了一次缓冲区的复制

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1687675382142-5ae5aef3-0f8c-4fb8-9816-b7762bb2d6a6.png)

### 与 JDK 原生 NIO 相比，Netty 的优势在哪里？

Netty 相比于 JDK 原生 NIO 具有以下优势：

- 更好的性能：Netty 在 NIO 的基础上进行了优化，可以更好地利用系统资源，提高 I/O 处理的效率和吞吐量。
- 更易用的接口：Netty 提供了一套更加易用的 API 接口，简化了 NIO 的复杂性，使得开发者可以更加方便地使用。
- 更多的功能扩展：Netty 提供了丰富的扩展功能，如编解码器、心跳检测、SSL/TLS 加密等，可以帮助开发者更加快速地构建高效、安全的网络应用程序。

### 什么是 Channel 和 ChannelPipeline？

在 Netty 中，Channel 是网络通信的基础，表示一个**可靠的网络连接**。**ChannelPipeline 是一系列 ChannelHandler 的链表，用于处理 Channel 上的事件和数据，类似于 Servlet 中的 Filter**。

### 什么是 EventLoop 和线程模型？

EventLoop 是 Netty 中的一个重要组件，用于处理 Channel 上的事件和任务。每个 Channel 都会绑定一个 EventLoop**，一个 EventLoop 可以处理多个 Channel 上的事件和任务**。Netty 采用了多种线程模型，如单线程模型、多线程模型、主从线程模型等，根据实际需求选择不同的线程模型可以更好地提高程序的性能和并发性。

#### EventLoop

EventLoop定义了Netty的核心抽象，用于处理连接的生命周期中所发生的事件，负责监听网络事件并调用事件处理器进行相关I/O操作。

Channel 是 Netty 网络操作抽象类，EventLoop负责处理注册到其上的Channel 的 I/O操作。

EventloopGrup包含多个EventLoop（EventLoop：Thread = 1 : 1），它管理着所有的EventLoop的生命周期。

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681442215715-c1d3e97b-025f-4b87-8ac8-008146bc820a.png)

NioEventLoopGroup 默认的构造函数实际会起的线程数为 **CPU核心数\*2**

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678173076242-b20dd2d9-c6b0-4bf6-a99d-e14b86e4d8a3.png)

#### 核心概念

- ServerBootstrap，**服务器端程序的入口**，这是 Netty 为简化网络程序配置和关闭等生命周期管理，所引入的 Bootstrapping 机制。我们通常要做的创建 Channel、绑定端口、注册 Handler 等，都可以通过这个统一的入口，以 Fluent API 等形式完成，相对简化了 API 使用。与之相对应， **Bootstrap则是 Client 端的通常入口。**
- Channel：可以理解为读操作或写操作，因此可以被打开或被关闭 。作为一个基于 NIO 的扩展框架，Channel 和 Selector 等概念仍然是 Netty 的基础组件，但是针对应用开发具体需求，提供了相对易用的抽象。
- EventLoop：只由一个线程驱动，处理一个 Channel中 的所有 I/O 事件。这是 Netty **处理事件的核心机制**。例子中使用了 EventLoopGroup。我们在 NIO 中通常要做的几件事情，如**注册感兴趣的事件、调度相应的 Handler** 等，都是 EventLoop 负责。
- ChannelFuture，这是 Netty 实现**异步 IO** 的基础之一，保证了同一个 Channel 操作的调用顺序。Netty 扩展了 Java 标准的 Future，提供了针对自己场景的特有Future定义。
- ChannelHandler，这是应用开发者放置**业务逻辑**的主要地方，也是我上面提到的“Separation Of Concerns”原则的体现。每个事件都可以被分发给 ChannelHandler 类中的某个用户实现的方法，实现业务逻辑与网络处理代码分离。
- ChannelPipeline：它是 ChannelHandler 链条的容器，每个 Channel 在创建后，自动被分配一个 ChannelPipeline。

### 什么是 ByteBuf？

ByteBuf 是 Netty 中的一个重要组件，用于处理数据的缓冲区。与 JDK 中的 ByteBuffer 相比，ByteBuf 具有更好的可扩展性、更高的性能和更丰富的功能。**ByteBuf 支持读写索引分离，内存池化和引用计数等功能**，可以更好地管理内存和提高程序的性能。

#### ByteBuffer 的种类？

- java.nio.HeapByteBuffer：java 堆内存，读写效率较低，受到 GC 的影响
- java.nio.DirectByteBuffer：直接内存，读写效率高（少一次拷贝），不受 GC 影响，分配效率低

### 四种事件类型

- accept：在有连接请求时触发
- connect：客户端，连接建立后触发
- read：可读事件
- write：可写事件

在 select 后，事件要么处理 accept，要么取消 cancel（catch 异常之后），

### 如何处理粘包与拆包？

ByteToMessageDecoder 提供了一些常见的实现类：

1. FixedLengthFrameDecoder：定长协议解码器，指定固定的字节数
2. LineBasedFrameDecoder：行分隔符解码器，识别 \n或\r\n
3. DelimiterBasedFrameDecoder：分隔符解码器
4. LengthFieldBasedFrameDecoder：长度编码解码器，将报文划分为header和body
5. JsonObjectDecoder：监测到匹配的{}或[]就认为是完整的json对象或json数组

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678173076875-42b3aa1d-a978-46e3-be90-3c0dadc47a5e.png)

### API 网关

API 网关的四大职能：

1. 请求接入：作为所有API接口服务请求的接入点
2. 业务聚合：作为所有后端业务服务的聚合点
3. 中介策略：实现安全、验证、路由、过滤、流控等策略
4. 统一管理：对所有API服务和策略进行统一管理



### 面试考点❓

- Reactor 模式和 Netty 线程模型。
- Pipelining、EventLoop 等部分的设计实现细节。
- Netty 的内存管理机制、引用计数等特别手段。
- 有的时候面试官也喜欢对比 Java 标准 NIO API，例如，你是否知道 Java NIO 早期版本中的 Epoll空转问题，以及 Netty 的解决方式等。


---

> 作者: 都将会  
> URL: https://leni.fun/netty_note/  

