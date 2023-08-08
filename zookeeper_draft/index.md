# Zookeeper 杂记


<!--more-->

zookeeper 是 chubby 的开源实现，使用 zab 协议，paxos 算法的变种。



### zookeeper提供了什么？



- 文件系统：树状结构，每个节点存放数据上限为 1M

- 通知机制



### 四种数据节点



- persistent 持久节点

- ephemeral 临时节点

- persistent sequential 持久顺序节点

- ephemeral sequential 临时顺序节点



### Watcher 机制



1. 一次性：无论是服务端还是客户端，一旦一个 Watcher 被 触 发 ，Zookeeper 都会将



其从相应的存储中移除。



1.  串行：客户端 Watcher 回调的过程是一个串行同步的过程。 

1.  轻量：Watcher 通知非常简单，只会告诉客户端发生了事件，而不会说明事件的
   具体内容。客户端向服务端注册 Watcher 的时候，并不会把客户端真实的 Watcher
   对象实体传递到服务端，仅仅是在客户端请求中使用 boolean 类型属性进行了
   标记。 

1.  最终一致性：异步发送通知，无法保证强一致性。数据同步方式： 

1. 1. diff：差异化同步
   2. trunc+diff：先回滚，再差异化同步
   3. trunc：回滚同步
   4. snap：全量同步（快照）



#### 客户端注册 watcher



1. 调用 getData()/getChildren()/exist()三个 API，传入 Watcher 对象
2. 标记请求 request，封装 Watcher 到 WatchRegistration
3. 封装成 Packet 对象，发服务端发送 request
4. 收到服务端响应后，将 Watcher 注册到 ZKWatcherManager 中进行管理
5. 请求返回，完成注册。



#### 服务端处理 watcher



1.  封装 WatchedEvent：将通知状态（SyncConnected）、事件类型（NodeDataChanged）以及节点路径封装成一个 WatchedEvent 对象 
2. 查询 Watcher：从 WatchTable 中根据节点路径查找 Watcher 
3.  找到：提取并从 WatchTable 和 Watch2Paths 中删除对应 Watcher（从这里可以看出 Watcher 在服务端是一次性的，触发一次就失效了）
4. 调用 process 方法来触发 Watcher：这里 process 主要就是通过 ServerCnxn 对应的 TCP 连接发送 Watcher 事件
   通知。 



#### 客户端回调 watcher



客户端 SendThread 线程接收事件通知，交由 EventThread 线程回调



Watcher。



### Server 工作状态



- looking：寻找 leader

- following：当前服务器角色时 follower 

- - 处理客户端的非事务请求，转发事务给 leader 服务器

- - 参与事务请求 proposal 的投票

- - 参与 leader 选举投票

- leading：当前服务器角色时 leader 

- - 事务请求的唯一调度和处理者，保证事务处理的顺序性

- - 集群内部各服务的调度者

- observing：当前服务器角色时 observer 

- - 处理客户端的非事务请求，转发事务给 leader 服务器

- - 不参与任何形式的投票



### zookeeper 如何保证事务的顺序一致性？



全局递增的事务ID，所有 proposal（提议）都在被提出时加上了 zxid，为 64 位数字：



- 高 32 位： epoch，用来标识 leader 周期

- 低 32 位：用来计数，新产生proposal 的时候，会依据数据库的两阶段过程，首先会向其他的 server 发出事务执行请求，如果超过半数的机器都能执行并且能够成功，那么就会开始执行



### zk 节点宕机如何处理？



集群规则为 2N+1 台，N>0，至少 3 台。只要超过半数的节点正常，集群就能正常提供服务。



- follower 宕机：数据不会丢失

- leader 宕机：选举出新的 leader



### zk 负载均衡和 nginx 负载均衡的区别



- zk：可以调控，吞吐量小

- nginx：只能调权重，其他的需要自己写插件，吞吐量大



### zk 的应用场景



分布式数据的发布和订阅：



-  数据发布/订阅：配置中心，动态获取数据，数据量通常较小（如数据库配置信息） 

- - 数据存储：存储在 zk 上的一个数据节点

- - 数据获取：读取数据节点，并注册一个数据变更 watcher

- - 数据变更：当变更数据时，zk 会将数据变更通知发到各客户端

-  负载均衡 

-  命名服务：指通过指定的名字来获取资源或者服务的地址，利用 zk 创建一个
  全局的路径，这个路径就可以作为一个名字，指向集群中的集群，提供的服务
  的地址，或者一个远程的对象等等。 

-  分布式协调/通知 

-  集群管理：所有机器约定在父目录下创建临时目录节点，然后监听父目录节点的字节点变化信息，判断是否有机器退出和加入、选举 master 

-  分布式锁： 

- - 独占锁：所有用户都去创建/distribute_lock 节点

- - 控制时序：/distribute_lock 已经预先存在，所有客户端在它下面创建临时顺序编号目录节点，和选 master 一样，编号最小的获得锁，用完删除。

-  分布式队列 

- - 同步队列：当一个队列成员都聚齐时，队列才可用。在约定目录下创建临时目录节点

- - 异步队列，先进先出：入列有编号，出列按编号。类似分布式锁中控制时序的实现。


---

> 作者: 都将会  
> URL: https://leni.fun/zookeeper_draft/  

