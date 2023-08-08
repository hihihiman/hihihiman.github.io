# 《Kafka核心技术与实战》笔记




## 消息引擎系统



### 定义



1. 持久化能力：TB级别数据保持O(1)的时间复杂度
2. 高吞吐率：100kps
3. 分布式消费：每个partition内消息顺序传输
4. 支持离线和实时处理
5. 支持在线水平扩展

<!--more-->

### 基本概念



1. broker：kafka的服务器
2. topic：发布到kafka集群的消息的类别
3. **partition**：物理分区，每个topic包含1～n个partition
4. producer：负责发布消息到kafka broker
5. consumer：向kafka broker 读取消息的客户端
6. **consumer group**：每个consumer可以属于一个特定的group



### 特性



1. broker强依赖zookeeper
2. 多partition支持水平扩展和并行处理，顺序写入提升吞吐性能
3. 容错性：每个partition可以通过副本因子添加多个副本（3副本2确认，5副本3确认）



#### Kafka 简介



服务器端：Broker集群，分散运行在不同机器以实现高可用



客户端：



- 生产者（Producer）：向主题发布新消息

- 消费者（Consumer）：向主题订阅新消息 

- - 点对点模型（Peer to Peer，P2P） 

- - - 消费者组（Consumer Group）：多个消费者实例同时消费，加速整个消费端的吞吐量（TPS）

- - - 重平衡（Rebalance）：消费者组内某个消费者实例挂掉后，其他消费者实例自动重新分配订阅主题分区的过程。

- - 发布订阅模型



#### 备份机制（Replication）（v0.8）



- 领导者副本（Leader Replica）：**唯一**对外提供服务

- 追随者副本（Follower Replica）：追随领导者



#### 分区（Partitioning）



-  主题（Topic）：主题是承载消息的逻辑容器，是发布订阅的对象，在实际使用中多用来区分具体的业务 

-  分区（Partition）：一个有序不变的消息序列，将每个主题划分成多个分区（Partition）， 



生产者生产的每条消息只会被发送到一个分区中。



#### Kafka 的三层消息架构



1. 主题层：每个主题可以配置 M 个分区，而每个分区又可以配置 N 个副本

1. 分区层：每个分区的 N 个副本中只能有一个充当领导者角色，对外提供服务；其他 N-1 个副本是追随者副本，只是提供数据冗余之用。

1. 消息层：分区中包含若干条消息，每条消息的位移从 0 开始，依次递增。



最后，客户端程序只能与分区的领导者副本进行交互。



#### 位移



- 消费者位移（Consumer Offset）：消费者消费进度的指示器，可能是随时变化的；

- 分区位移：消息在分区中的位移，表征的是分区内的消息位置，它是单调递增且不变的。



#### Kafka Streams（v0.10）



🌟Apache Kafka 是消息引擎系统，也是一个分布式流处理平台（Distributed Streaming Platform）



Kafka 与其他主流大数据流式计算框架相比的优势？



1. 更容易实现端到端的正确性（Correctness）

1. 灵活性：Kafka Streams 是一个用于搭建实时流处理的客户端库而非是一个完整的功能系统



## Kafka 在生产环境中的应用



#### Kafka 版本对比



- Apache Kafka：开发人数最多、版本迭代速度最快，用户仅仅需要一个消息引擎系统亦或是简单的流处理应用场景，同时需要对系统有较大把控度；【更新快，把控度高】

- Confluent Kafka：用户需要用到 Kafka 的一些高级特性，中文文档少；【高级特性】

- CDH/HDP Kafka：所有的操作都可以在前端 UI 界面上完成，用户需要快速地搭建消息引擎系统，或者需要搭建的是多框架构成的数据平台且 Kafka 只是其中一个组件。【节省运维成本】



#### 磁盘选择



- 机械磁盘成本低且容量大，但易损坏；固态硬盘性能优势大，不过单价高。而 Kafka 多是顺序读写操作，一定程度上规避了机械磁盘随机读写操作慢的劣势，所以选择**机械磁盘**即可。

- 就 Kafka 而言，一方面 Kafka 自己实现了冗余机制来提供高可靠性；另一方面通过分区的概念，Kafka 也能在软件层面自行实现负载均衡，所以**可以不搭建磁盘阵列（RAID）**



#### I/O模型



Kafka 客户端底层使用了 Java 的 selector，在不同平台上的 I/O 模型不同：



- Linux：epoll，介于I/O 多路复用和信号驱动 I/O之间；

- Windows：select，属于I/O 多路复用模型。



零拷贝（Zero Copy）：当数据在磁盘和网络进行传输时，避免昂贵的内核态数据拷贝，从而实现快速地数据传输。



#### Kafka 集群配置参数



以下主要为需要修改默认值的参数。



##### Broker 端参数



- `log.dirs`：用逗号分割文件目录路径，最好保证这些目录挂载到不同的物理磁盘上，以提高性能、故障转移（Failover）。如：`/home/kafka1,/home/kafka2,/home/kafka3``

- `zookeeper.connect`：chroot 是 ZooKeeper 的概念，类似于别名，只需要写一次，而且是加到最后的。如：`zk1:2181,zk2:2181,zk3:2181/kafka1`和`zk1:2181,zk2:2181,zk3:2181/kafka2`

- `listeners`：监听器，告诉外部连接者要通过什么协议访问指定主机名和端口开放的 Kafka 服务，格式上是若干个逗号分隔的三元组，每个三元组的格式为`<协议名称，主机名，端口号>`，其中主机名建议使用域名，而不是IP地址。如果自定义协议名字，如：`CONTROLLER://localhost:9092`，就需要指定协议底层使用了哪种安全协议，如：`listener.security.protocol.map=CONTROLLER:PLAINTEXT`

- `advertised.listeners`：格式同上。主要是为外网访问用的，如果clients在内网环境访问不需要配置这个参数。

- `auto.create.topics.enable`：是否允许自动创建 Topic。建议 false，方便管理。

- 🌟`unclean.leader.election.enable`：是否允许 Unclean Leader 选举。建议 false，防止落后进度太多的副本竞选 Leader。

- `auto.leader.rebalance.enable`：是否允许定期进行 Leader 选举。建议 false，防止无意义地换 Leader 导致性能降低。

- `log.retention.{hour|minutes|ms}`：控制一条消息数据被保存多长时间。从优先级上来说 ms 设置最高、minutes 次之、hour 最低。比如`log.retention.hour=168`表示默认保存 7 天的数据

- `log.retention.bytes`：指定 Broker 为消息保存的总磁盘容量大小。默认值为 -1，不作限制，使用云上 Kafka 服务时，需要做一定限制。

- `message.max.bytes`：控制 Broker 能够接收的最大消息大小。默认值为 1000012，不到1MB，建议设置一个较大值。



##### Topic 级别参数



Topic 级别参数会覆盖全局 Broker 参数的值。



- `retention.ms`：规定了该 Topic 消息被保存的时长，默认是 7 天。

- `retention.bytes`：规定了要为该 Topic 预留多大的磁盘空间。和全局参数作用相似，这个值通常在多租户的 Kafka 集群中会有用武之地。当前默认值是 -1，表示可以无限使用磁盘空间。

- `max.message.bytes`：决定了 Kafka Broker 能够正常接收该 Topic 的最大消息大小



设置时机：



- 创建 Topic 时：`bin/kafka-topics.sh --bootstrap -server localhost:9092 --create --topictransaction --partitions1 --replication -factor1 --configretention.ms=15552000000 --configmax.message.bytes=5242880`

- 修改 Topic 时（建议）：`bin/kafka-configs.sh --zookeeperlocalhost:2181 --entity -typetopics --entity -nametransaction --alter --add -configmax.message.bytes=10485760`



##### JVM 参数



- 堆内存：建议 6G 

- - `export KAFKA_HEAP_OPTS=--Xms6g --Xmx6g`

- GC：优先使用 G1 

- - G1：JDK 8 直接使用，具有更少的 Full GC，需要调整的参数更少

- - `-XX:+UseCurrentMarkSweepGC`：JDK 8 以下在 Broker 所在机器的 CPU 资源非常充裕时使用

- - `-XX:+UseParallelGC`

- - `export KAFKA_JVM_PERFORMANCE_OPTS= -server -XX:+UseG1GC -XX:MaxGCPauseMillis=20 -XX:InitiatingHeapOccupancyPercent=35 -XX:+ExplicitGCInvokesConcurrent -Djava.awt.headless=true`



##### 操作系统参数



- 文件描述符限制：设置一个超大上限，如：`ulimit -n 1000000`

- 文件系统类型：XFS > ext4

- swappniess 调优：建议配置成一个接近 0 但不为 0 的值，比如 1，这样能够观测到 Broker 性能开始出现急剧下降，从而给你进一步调优和诊断问题的时间。

- 提交时间：向 Kafka 发送数据并不是真要等数据被写入磁盘才会认为成功，而是只要数据被写入到操作系统的页缓存（Page Cache）上就可以了，随后操作系统根据 LRU 算法会**定期**（由提交时间决定）将页缓存上的“脏”数据落盘到物理磁盘上。默认值为 5 秒，建议调大提交间隔去换取性能。



## Kafka 客户端



#### 分区策略







如果指定了 Key，那么默认实现按消息键保序策略；



如果没有指定 Key，则使用轮询策略；



针对那些大规模的 Kafka 集群，可使用基于地理位置的分区策略



#### 数据压缩算法



Producer 端压缩、Broker 端保持、Consumer 端解压缩。



然而，Broker 端仍然会发生消息格式转换时发生的解压缩，这种消息校验是必要的。



应当尽量规避掉为了兼容老版本而引入的解压缩。



- GZIP

- Snappy

- LZ4：吞吐量最高

- Zstandard （简写为 zstd）：从 Kafka 2.1.0 开始支持。它是 Facebook 开源的一个压缩算法，能够提供超高的压缩比（compression ratio）



benchmark（基准测试）结果：



在吞吐量方面：LZ4 > Snappy > zstd 和 GZIP；



而在压缩比方面，zstd > LZ4 > GZIP > Snappy



#### 消息无丢失



🌟Kafka 只对“已提交”的消息（committed message）做有限度的持久化保证。



- 设置 acks = all。acks 是 Producer 的一个参数，代表了你对“已提交”消息的定义。如果设置成 all，则表明所有副本 Broker 都要接收到消息，该消息才算是“已提交”。这是最高等级的“已提交”定义。

- 设置 retries 为一个较大的值。这里的 retries 同样是 Producer 的参数，对应前面提到的 Producer 自动重试。当出现网络的瞬时抖动时，消息发送可能会失败，此时配置了 retries > 0 的 Producer 能够自动重试消息发送，避免消息丢失。

- 对于 Broker 端的参数，设置消息保存份数 `replication.factor` >= 3，设置消息写入副本数 `min.insync.replicas` > 1，可以提升消息持久性，推荐设置成 `replication.factor = min.insync.replicas + 1`



1. Producer 端丢失数据



永远要使用带有回调通知的发送 API



- 不要使用 producer.send(msg)，这是“fire and forget”，即“发射后不管”；

- 而要使用 producer.send(msg, callback)



1. Consumer 端丢失数据



- 保证先消费消息，后更新位移

- 如果是多线程异步处理消费消息，Consumer 程序不要开启自动提交位移，而是要应用程序手动提交位移，即`enable.auto.commit = false`



#### Kafka 拦截器



##### Producer 端



拦截器实现类都要继承接口： `org.apache.kafka.clients.producer.ProducerInterceptor`



- onSend：该方法会在消息发送之前被调用。

- onAcknowledgement：该方法会在消息成功提交或发送失败之后被调用，早于 callback 的调用。这个方法处在 Producer 发送的主路径中，所以最好别放一些太重的逻辑进去，否则你会发现你的 Producer TPS 直线下降。



##### Consumer 端



拦截器实现类都要继承借口： `org.apache.kafka.clients.consumer.ConsumerInterceptor`



- onConsume：该方法在消息返回给 Consumer 程序之前（正式处理消息之前）调用。

- onCommit：Consumer 在提交位移之后调用该方法。通常你可以在该方法中做一些记账类的动作，比如打日志等。



##### 使用场景



端到端系统性能检测、消息审计



#### Kafka 采用 TCP 协议



Producer 启动时会首先创建与`bootstrap.servers` 中所有 Broker 的 TCP 连接，所以在实际使用过程中，并不建议把集群中所有的 Broker 信息都配置到 bootstrap.servers 中，通常你指定 3～4 台就足以了。因为 Producer 一旦连接到集群中的任一台 Broker，就能拿到整个集群的 Broker 信息，故没必要为 bootstrap.servers 指定所有的 Broker。



##### TCP 连接创建时机



- 在创建 KafkaProducer 实例时

- 在更新元数据后 

- - 当 Producer 尝试给一个不存在的主题发送消息时，Broker 会告诉 Producer 说这个主题不存在。此时 Producer 会发送 METADATA 请求给 Kafka 集群，去尝试获取最新的元数据信息。

- - Producer 通过`metadata.max.age.ms` 参数定期地去更新元数据信息。该参数的默认值是 300000，即 5 分钟，也就是说不管集群那边是否有变化，Producer 每 5 分钟都会强制刷新一次元数据以保证它是最及时的数据。

- 在消息发送时



##### TCP 连接关闭时机



- 用户主动关闭 

- - producer.close() 或 KafkaConsumer.close() （推荐）

- - kill -9 进程

- Kafka 自动关闭 

- - Producer 端参数 `connections.max.idle.ms`的值，默认9分钟，即如果在 9 分钟内没有任何请求“流过”某个 TCP 连接，那么 Kafka 会主动帮你把该 TCP 连接关闭。若改为 -1，TCP 连接将成为永久长连接。

- - TCP 连接是在 Broker 端被关闭的，但其实这个 TCP 连接的发起方是客户端，因此在 TCP 看来，这属于被动关闭的场景，即 passive close。被动关闭的后果就是会产生大量的 CLOSE_WAIT 连接，因此 Producer 端或 Client 端没有机会显式地观测到此连接已被中断。



##### Consumer 端管理 TCP



和生产者不同的是，构建 KafkaConsumer 实例时是不会创建任何 TCP 连接的。



TCP 连接是在调用 KafkaConsumer.poll 方法时被创建的：



1. 发起 FindCoordinator 请求时：希望 Kafka 集群告诉它哪个 Broker 是管理它的协调者，单向选择待发送请求最少的 Broker；

1. 连接协调者时：消费者知晓了真正的协调者后，会创建连向该 Broker 的 Socket 连接

1. 消费数据时



#### 消息交付可靠性保障



- 最多一次（at most once）：消息可能会丢失，但绝不会被重复发送。

- 至少一次（at least once）：消息不会丢失，但有可能被重复发送。

- 精确一次（exactly once）：消息不会丢失，也不会被重复发送。



##### 幂等性 Producer



`props.put(“enable.idempotence”, true)`：Producer 自动升级成幂等性 Producer，只能够保证某个主题的一个分区上不出现重复消息，但无法实现多个分区的幂等性；其次，它只能实现单会话上的幂等性，不能实现跨会话的幂等性。这里的会话，你可以理解为 Producer 进程的一次运行。当你重启了 Producer 进程之后，这种幂等性保证就丧失了。



##### 事务型 Producer



事务提供的安全性保障是经典的 ACID



-  原子性（Atomicity） 

-  一致性 (Consistency) 

-  隔离性 (Isolation) ：并发执行的事务彼此相互隔离，互不影响 

- -  `isolation.level` 参数： 

- - -  read_uncommitted：这是默认值，表明 Consumer 能够读取到 Kafka 写入的任何消息，不论事务型 Producer 提交事务还是终止事务，其写入的消息都可以读取。很显然，如果你用了事务型 Producer，那么对应的 Consumer 就不要使用这个值。 

- - -  read_committed：表明 Consumer 只会读取事务型 Producer 成功提交事务写入的消息。当然了，它也能看到非事务型 Producer 写入的所有消息。Kafka 主要是在已提交读（read committed）这一隔离级别上做事情。 

-  持久性 (Durability) 



设置事务型 Producer 的方法



1.  和幂等性 Producer 一样，开启 `enable.idempotence = true` 

1.  设置 Producer 端参数 transctional. id 

1.  

```java
producer.initTransactions();
try {
            producer.beginTransaction();
            producer.send(record1);
            producer.send(record2);
            producer.commitTransaction();
} catch (KafkaException e) {
            producer.abortTransaction();
}
```

 



#### 消费者组 Consumer Group



- 点对点模型：下游多个 Consumer 都要抢夺共享消息队列的消息，伸缩性（scalability）差

- 发布/订阅模型：每个订阅者都必须要订阅主题的所有分区

- 消费者组：组内的每个实例不要求一定要订阅主题的所有分区。理想情况下，Consumer 实例的数量应该等于该 Group 订阅主题的分区总数。 

- - 点对点模型：所有消息都属于同一个 Group

- - 发布/订阅模型：所有实例都属于不同的 Group



位移保存在 Broker 端的内部主题`__consumer_offsets`中



##### 进度监控



滞后程度：Consumer Lag ，指消费者落后于生产者的程度。



-  使用 Kafka 自带的命令行工具 kafka-consumer-groups 脚本。（最简单） 

- - bin/kafka-consumer-groups.sh(bat)

-  使用 Kafka Java Consumer API 编程。 

- -  

```java
public static Map<TopicPartition, Long> lagOf(String groupID, String bootstrapServers) throws TimeoutException {
        Properties props = new Properties();
        props.put(CommonClientConfigs.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        try (AdminClient client = AdminClient.create(props)) {
            ListConsumerGroupOffsetsResult result = client.listConsumerGroupOffsets(groupID);// 🌟获取给定消费者组的最新消费消息的位移
            try {
                Map<TopicPartition, OffsetAndMetadata> consumedOffsets = result.partitionsToOffsetAndMetadata().get(10, TimeUnit.SECONDS);
                props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false); // 禁止自动提交位移
                props.put(ConsumerConfig.GROUP_ID_CONFIG, groupID);
                props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
                props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
                try (final KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props)) {
                    Map<TopicPartition, Long> endOffsets = consumer.endOffsets(consumedOffsets.keySet());// 🌟获取订阅分区的最新消息位移
                    return endOffsets.entrySet().stream().collect(Collectors.toMap(entry -> entry.getKey(),
                            entry -> entry.getValue() - consumedOffsets.get(entry.getKey()).offset()));// 🌟执行相应的减法操作，获取 Lag 值并封装进一个 Map 对象
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                // 处理中断异常
                // ...
                return Collections.emptyMap();
            } catch (ExecutionException e) {
                // 处理 ExecutionException
                // ...
                return Collections.emptyMap();
            } catch (TimeoutException e) {
                throw new TimeoutException("Timed out when getting lag for consumer group " + groupID);
            }
        }
    }
```

 

-  使用 Kafka 自带的 JMX 监控指标。（集成性最好） 

- - Kafka 消费者提供了一个名为 kafka.consumer:type=consumer-fetch-manager-metrics,client-id=“{client-id}”的 JMX 指标，**records-lag-max 和 records-lead-min** 分别表示此消费者在测试窗口时间内曾经达到的最大的 Lag 值和最小的 **Lead 值**（ Lead 值是指消费者最新消费消息的位移与分区当前第一条消息位移的差值，Lag 与 Lead 的值呈负相关），Lag 越大，Lead 越小，就意味着消费者端要丢消息了。



#### 位移主题 __consumer_offsets



##### 核心数据结构



键值对，类似于`Map<TopicPartition, Long>`



- key：<Group ID，主题名，分区号 >

- value：<位移，时间戳，用户自定义数据>，保存这些元数据是为了帮助 Kafka 执行各种各样后续的操作，比如删除过期位移消息等。



该内部主题下还有两种消息格式：



1. 用来注册  Consumer Group 的消息；

1. tombstone （墓碑）消息：消息体是 null，用于删除 Group 过期位移甚至是删除 Group 的消息。



##### 分区



- 分区数配置：Broker 端参数 `offsets.topic.num.partitions`，默认值 50；

- 副本数：Broker 端参数 `offsets.topic.replication.factor` ，默认值 3。



##### Compaction 整理位移



过期消息：对于同一个 Key 的两条消息 M1 和 M2，如果 M1 的发送时间早于 M2，那么 M1 就是过期消息。



Log Cleaner 线程定期地巡检待 Compact 的主题，看看是否存在满足条件的可删除数据。



#### Rebalance



所有 Broker 都有各自的 Coordinator 组件，具体来讲，Consumer 端应用程序在提交位移时，其实是向 Coordinator 所在的 Broker 提交位移。同样地，当 Consumer 应用启动时，也是向 Coordinator 所在的 Broker 发送各种请求，然后由 Coordinator 负责执行消费者组的注册、成员管理记录等元数据管理操作。



Kafka 为某个 Consumer Group 确定 Coordinator 所在的 Broker 的算法有 2 个步骤：



1. 确定由位移主题的哪个分区来保存该 Group 数据：`partitionId=Math.abs(groupId.hashCode() % offsetsTopicPartitionCount)`

1. 找出该分区 Leader 副本所在的 Broker，该 Broker 即为对应的 Coordinator



避免 Rebalance 方法（Consumer 端）：



1. 检测心跳间隔： `session.timeout.ms`，默认值为 10 秒，**推荐设为 6 秒**

1. 发送心跳间隔：`heartbeat.interval.ms` 越小，频率越高，会额外消耗带宽资源，但好处是能够更加快速地知晓当前是否开启 Rebalance，**推荐设为 2 秒**

1. 实际消费能力：`max.poll.interval.ms`，限定了应用程序两次调用 poll 方法的最大时间间隔，默认值为 5 分钟。最好将该参数值设置得大一点，**比下游最大处理时间稍长一点**。就拿 MongoDB 这个例子来说，如果写 MongoDB 的最长时间是 7 分钟，那么你可以将该参数设置为 8 分钟左右。

1. GC 参数：查看是否出现了频繁的 Full GC



#### 消费者位移



它记录了 Consumer 要消费的下一条消息的位移，如果你提交了位移 X，那么 Kafka 会认为所有位移值小于 X 的消息你都已经成功消费了。



-  🌟自动提交：`enable.auto.commit = true`，提交间隔为`auto.commit.interval.ms` 

- -  

```java
Properties props = new Properties();
     props.put("bootstrap.servers", "localhost:9092");
     props.put("group.id", "test");
     props.put("enable.auto.commit", "true");
     props.put("auto.commit.interval.ms", "2000");
     props.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
     props.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
     KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
     consumer.subscribe(Arrays.asList("foo", "bar"));
     while (true) {
         ConsumerRecords<String, String> records = consumer.poll(100);
         for (ConsumerRecord<String, String> record : records)
             System.out.printf("offset = %d, key = %s, value = %s%n", record.offset(), record.key(), record.value());
     }
```

 

-  手动提交：`enable.auto.commit = false`，使用 consumer.commitSync（阻塞）或 consumer.commitAsync（异步） 

- -  

```java
// 同步：利用 commitSync 的自动重试来规避那些瞬时错误，比如网络的瞬时抖动，Broker 端 GC 等
while (true) {
            ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(1));
            process(records); // 处理消息
            try {
                        consumer.commitSync();
            } catch (CommitFailedException e) {
                        handle(e); // 处理提交失败异常
            }
}
// 异步：常规性、阶段性的手动提交
while (true) {
            ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(1));
            process(records); // 处理消息
            consumer.commitAsync((offsets, exception) -> {
							if (exception != null)
							handle(exception);
						});
}
// 二者结合：既实现了异步无阻塞式的位移管理，也确保了 Consumer 位移的正确性
        try {
            while (true) {
                ConsumerRecords<String, String> records =
                      consumer.poll(Duration.ofSeconds(1));
                process(records); // 处理消息
                commitAysnc(); // 使用异步提交规避阻塞
            }
        } catch (Exception e) {
            handle(e); // 处理异常
        } finally {
            try {
                consumer.commitSync(); // 最后一次提交使用同步阻塞式提交
            } finally {
                consumer.close();
            }
        }
// 更加细粒度的操作
// Kafka Consumer API 为手动提交提供了这样的方法：
// commitSync(Map<TopicPartition, OffsetAndMetadata>) 和 
// commitAsync(Map<TopicPartition, OffsetAndMetadata>)。
// 它们的参数是一个 Map 对象，键就是 TopicPartition，即消费的分区，而值是一个 OffsetAndMetadata 对象，保存的主要是位移数据。
private Map<TopicPartition, OffsetAndMetadata> offsets = new HashMap<>();
int count = 0;
……
while (true) {
            ConsumerRecords<String, String> records = 
	consumer.poll(Duration.ofSeconds(1));
            for (ConsumerRecord<String, String> record: records) {
                        process(record);  // 处理消息
                        offsets.put(new TopicPartition(record.topic(), record.partition()),
                                    new OffsetAndMetadata(record.offset() + 1)；
                        if（count % 100 == 0）// 每累计 100 条消息就统一提交一次位移
                                    consumer.commitAsync(offsets, null); // 回调处理逻辑是null
                        count++;
	}
}
```

 



#### CommitFailedException 异常



解决办法：



1. 缩短单条消息处理的时间，简化消费逻辑；（优先）

1. 增加期望的时间间隔 `max.poll.interval.ms` 参数值；

1. 减少下游系统一次性消费的消息总数，减少 poll 方法一次性返回的消息数量，即减少`max.poll.records` 参数值；

1. 下游系统使用多线程来加速消费

1. 让独立消费者与消费者组的 group.id 保持不同



#### Kafka Java Consumer



用户主线程 + 心跳线程，非阻塞式的消息获取



在消费消息这一层面，仍然是单线程设计。



KafkaConsumer 类不是线程安全的，不能在多个线程中共享同一个 KafkaConsumer 实例，否则程序会抛出 ConcurrentModificationException 异常，除了 `KafkaConsumer.wakeup()` 方法。



两种多线程方案：



1.  消费者程序启动多个线程，每个线程维护专属的 KafkaConsumer 实例，负责完整的消息获取、消息处理流程。 

1. 1.  优点：实现简单，能保证分区内的消费顺序 
   2.  缺点：占用更多资源，可能会出现不必要的 Rebalance 
   3.  

```java
// 每个 KafkaConsumerRunner 类都会创建一个专属的 KafkaConsumer 实例
public class KafkaConsumerRunner implements Runnable {
     private final AtomicBoolean closed = new AtomicBoolean(false);
     private final KafkaConsumer consumer;
 
 
     public void run() {
         try {
             consumer.subscribe(Arrays.asList("topic"));
             while (!closed.get()) {
			ConsumerRecords records = 
				consumer.poll(Duration.ofMillis(10000));
                 //  执行消息处理逻辑
             }
         } catch (WakeupException e) {
             // Ignore exception if closing
             if (!closed.get()) throw e;
         } finally {
             consumer.close();
         }
     }
 
 
     // Shutdown hook which can be called from a separate thread
     public void shutdown() {
         closed.set(true);
         consumer.wakeup();
     }
```

 

1.  单线程获取消息，多线程消费 

1. 1.  优点：伸缩性强，消息的获取与处理解耦 
   2.  缺点：实现难度大，无法保证分区内的消费顺序，可能出现重复消费（位移提交困难） 
   3.  

```java
// 当 Consumer 的 poll 方法返回消息后，由专门的线程池来负责处理具体的消息
// 调用 poll 方法的主线程不负责消息处理逻辑
private final KafkaConsumer<String, String> consumer;
private ExecutorService executors;
...
 
 
private int workerNum = ...;
executors = new ThreadPoolExecutor(
	workerNum, workerNum, 0L, TimeUnit.MILLISECONDS,
	new ArrayBlockingQueue<>(1000), 
	new ThreadPoolExecutor.CallerRunsPolicy());
 
 
...
while (true)  {
	ConsumerRecords<String, String> records = 
		consumer.poll(Duration.ofSeconds(1));
	for (final ConsumerRecord record : records) {
		executors.submit(new Worker(record));
	}
}
..
```

 



## Kafka 核心设计原理



#### 副本机制



副本的功能：



1. 提供数据冗余（Kafka，以下两项未提供）

1. 提供高伸缩性

1. 改善数据局部性



副本（Replica）：本质上是一个**只能追加写消息**的提交日志。



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/9996da47532a8798f71bba9dc35c216a.png)



追随者副本不对外提供服务（因此不能提供读操作横向扩展以及改善局部性），只向领导者副本异步拉取消息，并写入到自己的提交日志中。



Kafka 副本机制的好处：



1. Read-your-writes：立即能读取自己写入的消息

1. 单调读（Monitonic Reads）：对于一个消费者用户而言，在多次消费消息时，它不会看到某条消息一会儿存在一会儿不存在。



##### ISR（In-sync Replicas）



指的是与 Leader 副本同步的副本，包括 Leader 本身，是一个动态集合。



同步与否，取决于 Broker 端参数 `replica.lag.time.max.ms` 参数值，表示 Follower 副本能够落后 Leader 副本的最长时间间隔，当前默认值是 10 秒。



##### Unclean 领导者选举



Broker 端参数 `unclean.leader.election.enable` 控制是否允许 Unclean 领导者选举，开启可能会造成数据丢失，关闭可能会使得 ISR 集合为空。



CAP 理论：以下三者只能满足其二：



1. 一致性（Consistency）：关闭 Unclean 领导者选举，可避免消息丢失（建议）

1. 可用性（Availability）：开启 Unclean 领导者选举，可保证对外提供服务（还可以通过增加副本数来提高可用性，所以建议在 Unclean 上选择一致性）

1. 分区容错性（Partition tolerance）



#### Kafka 请求处理



##### Reactor 模式



epoll 是一种 IO 模型，而 Reactor 是一种 IO 处理模式。



作者 Doug Lea 曾开发整个 java.util.concurrent 包。



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/102e0edee7deed2a5c1ad6f057876507.png)



Acceptor 线程：只是用于请求分发，不涉及具体的逻辑处理，非常得轻量级，因此有很高的吞吐量表现。



Broker 端参数 `num.network.threads`：用于调整该网络线程池的线程数。其默认值是 3，表示每台 Broker 启动时会创建 3 个网络线程，专门处理客户端发送的请求。



##### 异步线程池



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/933eedb87c2e53ded029b8d5fe16e847.png)



当网络线程拿到请求后，它不是自己处理，而是将请求放入到一个共享请求队列中。



IO 线程池：线程数由 Broker 端参数`num.io.threads`控制



- PRODUCE 生产请求：将消息写入到底层的磁盘日志中

- FETCH 请求：从磁盘或页缓存中读取消息



**请求队列是所有网络线程共享的，而响应队列则是每个网络线程专属的**，因为Dispatcher 只是用于请求分发而不负责响应回传，所以只能让每个网络线程自己发送 Response 给客户端。



Kafka Broker 启动后，会在后台分别创建两套网络线程池和 IO 线程池的组合，它们分别处理数据类请求和控制类请求，因此 listeners 配置可以配置两个端口号。



##### Purgatory 组件



“炼狱”组件，用来缓存延迟请求，比如设置了 `acks=all`，那么该请求就必须等待 ISR 中所有副本都接收了消息后才能返回，此时处理该请求的 IO 线程就必须等待其他 Broker 的写入结果。当请求不能立刻处理时，它就会暂存在 Purgatory 中。



#### 🌟 Rebalance 重平衡



Rebalance 本质上是一种协议，规定了一个 Consumer Group 下的所有 Consumer 如何达成一致，来分配订阅 Topic 的每个分区。触发条件：



1. 组成员数发生变更；

1. 订阅主题数发生变更；

1. 订阅主题的分区数发生变更。



弊端：



1. 影响 Consumer 端 TPS，类似 JVM 的 STW，所有 Consumer 实例都会停止消费；

1. 需要重新创建连接其他 Broker 的 Socket 资源，Group 下的所有成员都要参与进来，而且通常不会考虑局部性原理，但局部性原理对提升系统性能是特别重要的；

1. 速度很慢，几百个 Consumer 实例的 Rebalance 需要几个小时。



消费者端有消息处理线程和心跳线程，**重平衡的通知机制是通过心跳线程来完成的**。`heartbeat.interval.ms`既是心跳的间隔时间，也是控制重平衡通知的频率。



##### 消费者组的 5 种状态



- Empty：会进行过期位移删除：`Removed ✘✘✘ expired offsets in ✘✘✘ milliseconds.`

- Dead

- PreparingRebalance：等待成员加入

- CompletingRebalance：老版本中叫 AwatingSync，等待分配方案

- Stable：重平衡已完成



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/36bb314a9fd123d57d8beabf4e531dca.png)



##### 消费者端 2 类请求



- JoinGroup 请求：第一个发送 JoinGroup 请求的成员自动成为领导者 

- - 此处的领导者不同于领导者副本，它们不是一个概念。这里的领导者是具体的消费者实例，它既不是副本，也不是协调者。**领导者消费者的任务是收集所有成员的订阅信息，然后根据这些信息，制定具体的分区消费分配方案。**

- - ![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/1304b29a9539c67e8cce48eb311c0a7f.png)

- SyncGroup 请求

- ![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/3efd3d1cd5af2a6fd9089d17638855b7.png)



##### Broker 端



- LeaveGroup 请求：主动离组

- `session.timeout.ms`：崩溃离组



#### Kafka 控制器



##### zookeeper



znode 是树形结构上的节点，分为持久性和临时性。



节点变更监听器 (ChangeHandler) ：监控（Watch） znode 变更行为，实现**集群成员管理、分布式锁、领导者选举**等功能。



Broker 在启动时，会尝试去 ZooKeeper 中创建 /controller 节点。Kafka 当前选举控制器的规则是：**第一个成功创建 /controller 节点的 Broker 会被指定为控制器**。



控制器职责：



1. 主题管理（创建、删除、增加分区）：执行 kafka-topic 脚本

1. 分区重分配：执行 kafka-reassign-partitions 脚本

1. Preferred 领导者选举

1. 集群成员管理（新增 Broker、Broker 主动关闭、Broker 宕机）

1. 数据服务：在 ZooKeeper 中也保存了一份



控制器内部设计原理：



1. 单线程+事件队列方案；

1. 异步操作 Zookeeper；

1. 赋予 StopReplica 请求更高的优先级，使它能够得到抢占式的处理。



控制器组件出问题的解决方案：



在 Zookeeper 中手动删除 /controller 节点：`rmr /controller`，这样既可以引发控制器的重选举，又可以避免重启 Broker 导致的消息处理中断。



#### 高水位



示意图：



｜------ LEO ------



｜未提交消息，不可被消费



｜------ 高水位 ------



｜已提交消息



高水位的作用：



1. 定义消息可见性

1. 完成副本同步



日志位移：



- LSO：Log Stable Offset， Kafka 事务通过 LSO来判断消息可见性

- LEO：Log End Offset，日志末端位移，表示副本写入下一条消息的位移值。



Kafka 使用 Leader 副本的高水位来定义所在分区的高水位。



##### Leader Epoch



数据结构：



- Epoch：版本号，小版本号被认为过期

- Start Offset：起始位移



## Kafka 运维与监控



#### 主题管理



```shell
# 创建主题
bin/kafka-topics.sh 
	--bootstrap-server broker_host:port 
	--create --topic my_topic_name  
	--partitions 1 
	--replication-factor 1

# 查询主题
bin/kafka-topics.sh 
	--bootstrap-server broker_host:port --list
bin/kafka-topics.sh 
	--bootstrap-server broker_host:port 
	--describe --topic <topic_name>

# 修改主题分区
bin/kafka-topics.sh 
	--bootstrap-server broker_host:port 
	--alter --topic <topic_name> 
	--partitions < 新分区数 >

# 修改主题级别
# 设置动态参数，使用 --bootstrap-server
# 设置常规的主题级别参数，还是使用 --zookeeper。
bin/kafka-configs.sh 
	--zookeeper zookeeper_host:port 
	--entity-type topics 
	--entity-name <topic_name> 
	--alter --add-config max.message.bytes=10485760
	
# 修改主题限制
bin/kafka-configs.sh 
	--zookeeper zookeeper_host:port 
	--alter --add-config 'leader.replication.throttled.rate=104857600,follower.replication.throttled.rate=104857600' 
	--entity-type brokers 
	--entity-name 0 #  Broker ID
	
bin/kafka-configs.sh 
	--zookeeper zookeeper_host:port 
	--alter --add-config 'leader.replication.throttled.replicas=*,follower.replication.throttled.replicas=*' 
	--entity-type topics 
	--entity-name test
	
# 主题分区迁移
bin/kafka-topics.sh 
	--bootstrap-server broker_host:port 
	--delete  --topic <topic_name>
```



内部主题：



- `__consumer_offsets`

- `__transaction_state`：为支持事务引入



#### 动态 Broker 参数配置



初始化配置在`config/server.properties`中，



Dynamic Update Mode 列（属性的三种级别）：



- read-only：只有重启 Broker，才能令修改生效。

- per-broker：只会在对应的 Broker 上生效。 

- - 如 listeners

- cluster-wide：会在整个集群范围内生效，可对所有 Broker 都生效。 

- - 如 `log.retention.ms`



```shell
# 配置
bin/kafka-configs.sh 
	--bootstrap-server kafka-host:port 
	--entity-type brokers 
	--entity-default 
	--alter --add-config unclean.leader.election.enable=true
	
# 查看
bin/kafka-configs.sh 
	--bootstrap-server kafka-host:port 
	--entity-type brokers 
	--entity-default --describe
```



可能被动态调整的参数：



1. `log.retention.ms`：修改日志留存时间

1. `num.io.threads` 和 `num.network.threads`：两组线程池

1. `ssl.keystore.type、ssl.keystore.location、ssl.keystore.password 和 ssl.key.password`：创建那些过期时间很短的 SSL 证书，增加安全性

1. `num.replica.fetchers`：增加该参数值，可确保有充足的线程可以执行 Follower 副本向 Leader 副本的拉取



#### 重设消费者位移



Kafka 优点：提供较高吞吐量，消息短，能保证消息的顺序。



重设策略：



- 位移维度 

1. 1. Earliest：最早位移处
   2. Latest：最新位移处
   3. Current：最新提交位移处
   4. Specified-Offset：特定位移处（绝对数值）
   5. Shift-By-N：调整到当前位移+N处（相对数值）

- 时间维度 

1. 1. DateTime：时刻处
   2. Duration：距离当前时间间隔处，格式为 PnDTnHnMnS，如 15 分钟前可表示为 PT0H15M0S。



在 Java 中，通过`consumer.seek(key,value)` 方法重设策略。



#### 运维利器 AdminClient



```xml
<dependency>
    <groupId>org.apache.kafka</groupId>
    <artifactId>kafka-clients</artifactId>
    <version>2.3.0</version>
</dependency>
```



在 Java 中的对象为`org.apache.kafka.clients.admin.AdminClient`



```java
// 创建主题
String newTopicName = "test-topic";
try (AdminClient client = AdminClient.create(props)) {
         NewTopic newTopic = new NewTopic(newTopicName, 10, (short) 3);
         CreateTopicsResult result = client.createTopics(Arrays.asList(newTopic));
         result.all().get(10, TimeUnit.SECONDS);
}

// 查询消费者位移
String groupID = "test-group";
try (AdminClient client = AdminClient.create(props)) {
         ListConsumerGroupOffsetsResult result = client.listConsumerGroupOffsets(groupID);
         Map<TopicPartition, OffsetAndMetadata> offsets = 
                  result.partitionsToOffsetAndMetadata().get(10, TimeUnit.SECONDS);
         System.out.println(offsets);
}

// 获取 Broker 磁盘占用
try (AdminClient client = AdminClient.create(props)) {
         DescribeLogDirsResult ret = client.describeLogDirs(Collections.singletonList(targetBrokerId)); // 指定 Broker id
         long size = 0L;
         for (Map<String, DescribeLogDirsResponse.LogDirInfo> logDirInfoMap : ret.all().get().values()) {
                  size += logDirInfoMap.values().stream().map(logDirInfo -> logDirInfo.replicaInfos).flatMap(
                           topicPartitionReplicaInfoMap ->
                           topicPartitionReplicaInfoMap.values().stream().map(replicaInfo -> replicaInfo.size))
                           .mapToLong(Long::longValue).sum();
         }
         System.out.println(size);
}
```



#### Kafka 认证机制 authentication



SASL 机制：提供认证和数据安全服务的框架



1. FSSAPI：Kerberos 使用的安全接口

1. PLAIN：用户名+密码

1. SCRAM ：改进 PLAIN，将认证用户信息保存在 ZooKeeper，避免了动态修改需要重启 Broker 的弊端

1. OAUTHBEARER：基于 OAuth 2 认证框架

1. Delegation Token：轻量级



#### 授权机制 Authorization



权限模型：



1.  ACL：Access-Control List，访问控制列表。（用户直接映射权限）
   开启方法：`authorizer.class.name=kafka.security.auth.SimpleAclAuthorizer` 

1.  RBAC：Role-Based Access Control，基于角色的权限控制。 

1.  ABAC：Attribute-Based Access Control，基于属性的权限控制。 

1.  PBAC：Policy-Based Access Control，基于策略的权限控制。 



#### 监控 Kafka



##### JVM 调优



1.  Full GC 发生频率和时长
   开启 G1 的 `-XX:+PrintAdaptiveSizePolicy` 开关，让 JVM 告诉你到底是谁引发了 Full GC。 

1.  活跃对象大小 

1.  应用线程总数 



##### Broker 集群监控



5 个方法：



1. 查看 Broker 进程是否启动，端口是否建立

1. 查看 Broker 端关键日志

1. 查看 Broker 端 2 类关键线程的状态 

1. 1. Log Compaction 线程，这类线程是以 kafka-log-cleaner-thread 开头的
   2. 副本拉取消息的线程，通常以 ReplicaFetcherThread 开头

1. 查看 Broker 端端关键 JMX 指标

1. 监控 Kafka 客户端：首要关心网络往返时延（Round-Trip Time，RTT）



##### 主流监控框架



-  Kafka Manager 框架适用于基本的 Kafka 监控 

-  Grafana+InfluxDB+JMXTrans 的组合适用于已经具有较成熟框架的企业，可以在一套框架中同时监控企业的doge关键技术组件 



#### 调优 Kafka



目标：高吞吐量、低延迟



##### 优化漏斗



层级越靠上，调优效果越明显：



1. 应用程序层 

1. 1. 不要频繁创建对象实例，多复用
   2. 用完及时关闭
   3. 合理利用多线程，Kafka 的 Java Producer 是线程安全的，Java Consumer 虽不是线程安全的，也有**应对方案（见前文）**。

1. 框架层：尽力保持客户端版本和 Broker 端版本一致

1. JVM 层 

1. 1. 堆设置：6～8 GB，或 Full GC 之后堆上存活对象的总大小的 1.5～2 倍
   2. GC 收集器：选择 G1 收集器 

1. 1. 1. 配置`-XX:+PrintAdaptiveSizePolicy`，来探查一下到底是谁导致的 Full GC。
      2. 配置`-XX:+G1HeapRegionSize=N`，N越大，大对象数越少。

1. 操作系统层 

1. 1. 挂在文件系统时禁掉 atime 更新，避免 inode 访问时间的写入操作，减少文件系统的写操作数。命令：`mount -o noatime`
   2. 选择 ext4 或 XFS 文件系统
   3. swap 空间设置成一个很小的值，比如 1～10 之间，以防止 Linux 的 OOM Killer 开启随意杀掉进程
   4. 页缓存大小预留出一个日志段大小，至少能保证 Kafka 可以将整个日志段全部放入页缓存



## Kafka Streams



流处理：处理无限数据集



#### Kafka Streams 的特点



1. 它是一个Java 客户端库（Client Library），更轻量级

1. 应用部署方面：Kafka Streams 更倾向于将部署交给开发人员来做，而不是依赖于框架自己实现。

1. 上下游数据源：Kafka Streams 只支持与 Kafka 集群进行交互，它没有提供开箱即用的外部数据源连接器。

1. 协调方式：通过消费者组实现高伸缩性和高容错性

1. Kafka Streams 与 Kafka 的适配性最好



DSL ：Domain Specific Language，领域特定语言



流表二元性：流在时间维度上聚合之后形成表，表在时间维度上不断更新形成流，这就是所谓的流表二元性（Duality of Streams and Tables）



#### 常见操作算子



- 无状态算子 

- - filter：过滤，如`.filter(((key, value) -> value.startsWith("s")))`

- - map：kv对，如 `KStream<String, Integer> transformed = stream.map( (key, value) -> KeyValue.pair(value.toLowerCase(), value.length()));`

- - print 是终止操作，peek 还能继续处理

- 有状态算子：涉及聚合方面操作



#### 金融领域应用



Avro： 是 Java 或大数据生态圈常用的序列化编码机制，能极大地节省磁盘占用空间或网络 I/O 传输量



识别用户身份信息：



1. 身份证号

1. 手机号

1. 设备 ID

1. 应用注册账号

1. Cookie


---

> 作者: 都将会  
> URL: https://leni.fun/kafka%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%AE%9E%E6%88%98%E7%AC%94%E8%AE%B0/  

