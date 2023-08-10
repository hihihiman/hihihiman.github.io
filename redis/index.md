# 🚩Redis


###  五种基础数据结构？

<!--more-->

1. string：最大存储512M
2. hash：hget、hmget、hset、hmset
3. list 
   1. 可以作为队列，**rpush 生产消息，lpop消费消息**，当lpop没有消息时，要适当sleep一会再重试，或者使用**blpop，它在没有消息的时候会阻塞住直到消息到来**。
   2. 如果想生产一次消费多次，就使用 pub/sub 主题订阅者模式，可以实现1：N的消息队列。但是消费者下线的情况下，生产的消息会丢失，就需要采用更专业的MQ，如RabbitMQ。
4. set
5. sorted set 每个成员会有一个分数与之关联 
   1. 可以实现延时队列。拿**时间戳作为 score**，**消息内容作为key调用 zadd来生产消息**，消费者用 **zrangebyscore获取N秒之前的数据轮询进行处理。**
### 🌟如何保证MySQL和Redis的数据一致性？

1. 强一致性方案-分布式锁
   1. 先拿 **setnx来争抢锁**，抢到之后，用**expire给锁加一个过期时间**防止忘记释放引发死锁。set指令有复杂的参数，是把setnx和expire合成一条指令来用。
   2. **任意时刻只能有一个客户端持有锁**，**加锁和解锁必须是同一个客户端，客户端自己加的锁只能自己去解。**只要大多数 Redis 节点正常，客户端就能正常使用锁。
   3. 底层 **setnx 通过 lua 脚本实现，保证原子性**。
   4. redisson 实现的分布式锁对同一线程可重入
   5. RedLock 红锁：在多个实例上创建锁，性能差，违背了 Redis 的 AP 思想，不如使用 zookeeper 实现强一致性的 CP 系统
   6. WatchDog 看门狗：给持有锁的线程续期（默认 10s）
2. 高可用方案-异步通知：**将binlog日志采集发送到MQ队列里面，然后通过ACK机制确认处理这条更新消息，删除缓存**，保证数据缓存一致性。

###  两种持久化方式？

1. RDB（Redis DataBase）：用数据集**快照**的方式半持久化（高效，持久化之间记录会丢失）
2. AOF（Append-Only File）：所有的命令行记录以 redis 命令请求协议的格式完全持久化存储保存为 aof 文件（文件大、安全）

备份：

- save可以在 redis 数据目录生成数据文件 **dump.rdb**
- bgsave 用子线程异步执行，"save 300 10" 表示 300s 内有 10 个 key 被修改就执行 bgsave
- **appendonly 默认关闭**，若配置为 yes，则以AOF方式备份数据，在特定的时候执行追加命令
- appendfsync everysec 每秒刷盘
- bgrewriteaof 重写优化 aof 文件

恢复：重启服务，自动加载redis数据目录的 dump.rdb
### 过期key的删除策略？
两者配合使用：

1. 定期：读取配置server.hz的值，默认为10
2. 惰性：get key时，如果过期就删除，如果没过期就返回
### 哨兵Sentinel - 高可用
通过心跳机制，每秒发送 ping 命令，检查 master 和 slave 是否按期工作，在 master 故障时，Sentinel 将一个 slave 提升为 master。
#### 自动选主
采用 **Raft 共识**算法，order by：

1. 断线时间越低
2. 优先级越高 slave-priority
3. offset 越大
4. 运行 id 越小

Sentinel（哨兵）不提供读写服务，默认运行在 26379 端口，建议多个 sentinel 节点（参数：quorum）协作运行，通过投票的方式来避免误判：

- 单个未响应，主观下线
- 多个未响应，客观下线

![image.png](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681115287511-28f7ec40-1da5-477c-b899-096a0b0e268b.png)
#### 脑裂
Sentinel 与 master 失联，选出了新的 master'，于是覆盖了旧 master 用户写入的数据。
解决方案：

1. min-replicas-to-write = 1：至少 1 个** slave 成功写入**
2. min-replicas-max-lay = 5：**同步延迟**不超过 5s

### 回收（淘汰）策略？如何保证Redis里存储的都是热点数据？

- no-enviction：不淘汰，满了就报错（默认）
- volatile-：从已过期的数据集（**server.db[i].expires**）中挑选
   - ttl：剩余 ttl 越短的优先淘汰
   - random：随机
   - **lru：最近最少使用【业务数据有冷热区分，且有置顶需求】**
   - lfu：最少频率使用
- allkeys-：针对全体
   - random【无明显冷热数据区分时】
   - lru【业务数据有冷热区分】
   - lfu【短时高频】

### 🌟什么是穿透、击穿与雪崩？
#### 穿透
Q：大量并发查询**不存在的 key**，导致压力传到数据库。
A：让缓存能够区分 key 不存在和查询到一个空值

1. 缓存空值的（无效的） key，这样第一次不存在也会被加载并记录，下次拿到有这个key；
2. **Bloom过滤【判断一个元素是否在一个集合中】**或RoaringBitmap 判断 key 是否存在；（RoaringBitMap和bloom filter本质上都是使用bitmap进行存储【**bitmap的底层数据结构就是0/1bit 的二进制数值，最大长度512Mb = 512 **_** 1024 **_** 1024 * 8 = 2^32**】。但bloom filter 使用的是**多个hash函数**对存储数据进行映射存储，如果两个游戏appId经过hash映射后得出的数据一致，则判定两者重复，这中间有一定的误判率，所以为满足在该业务场景其空间开销会非常的大。而**RoaringBitMap**是直接将元数据进行**存储压缩**，其准确率是100%的）
3. 完全以缓存为准，使用延迟异步加载。
#### 击穿
Q：某个**key失效**的时候，正好有大量并发请求访问这个key
A：key的更新操作添加全局**互斥锁（强一致性，只有第一个请求拿到数据）** 或 使用**延迟异步加载（高可用）**，或watchdog逻辑过期。
#### 雪崩
Q：**某一时刻发生大规模的缓存失效**的情况，会有大量的请求直接打到数据库，导致压力过大甚至宕机。
A：

1. 分散请求
   1. 热数据分散到不同机器上；
   2. 限流
2. 控制过期时间：范围内随机；
3. 多台机器做主从复制或多副本，实现高可用；
#### 击穿和穿透的本质区别是什么？

- 穿透：查询的** key 不在缓存中**，缓存没有起到缓冲的效果
- 击穿：查询的 key** 曾经有效**，在**失效的瞬时**打击了数据库

### Redis 集群 - 主从复制？
#### 概念
主节点写，从节点读。
RDB同步有两个参数：

1. **replication id：标记数据集**
2. **offset：slave < master 时需要更新**
- 全量同步：主节点执行 **bgsave 生成 dump.rdb **文件给 slave
- 增量同步：slave 重启时，获取相同 replication id 的 offset 之后的数据

主从复制不要使用网状结构，**使用单向链表结构，如 Master <- slave1 <- slave2 <- slave3**，更方便解决**单点故障**问题。
Redis 集群没有使用一致性 hash，而是引入了**哈希槽**概念，有 **16384（2的14次）个哈希槽**，每个key通过**CRC16（上限 2 的 16 次）**校验后对16384取模来决定放置哪个槽，集群的每个节点负责一部分hash槽。
#### 使用
使用 Docker Compose 工具来创建 Redis 集群容器
```yaml
version: '3'
services:
  redis-7000:
    image: redis
    command: redis-server /usr/local/etc/redis/redis.conf
    ports:
      - "7000:6379"
    volumes:
      - ./conf/redis-7000.conf:/usr/local/etc/redis/redis.conf
    networks:
      - redis-net
  redis-7001:
    image: redis
    command: redis-server /usr/local/etc/redis/redis.conf
    ports:
      - "7001:6379"
    volumes:
      - ./conf/redis-7001.conf:/usr/local/etc/redis/redis.conf
    networks:
      - redis-net
  redis-7002:
    image: redis
    command: redis-server /usr/local/etc/redis/redis.conf
    ports:
      - "7002:6379"
    volumes:
      - ./conf/redis-7002.conf:/usr/local/etc/redis/redis.conf
    networks:
      - redis-net

networks:
  redis-net:
```
该配置文件定义了三个 Redis 节点，每个节点监听不同的端口，使用不同的配置文件。可以使用 Docker Compose 工具来启动 Redis 集群容器： `docker-compose up -d`

### Redis 集群与高可用

1. Redis Sentinal 着眼于高可用，在 master 宕机时会自动将 slave 提升位 master，继续提供服务；
2. Redis Cluster 着眼于扩展性，在单个 redis 内存不足时，使用 Cluster 进行分片存储。

```
# 从节点只读、异步复制
SLAVEOF 127.0.0.1 6379

# 主从切换基于 raft 协议,两种启动方式
redis-sentinel sentinel.conf
redis-server redis.conf --sentinel
```

sentinel.conf 配置：

```
sentinel monitor mymaster 127.0.0.1 6379 2
sentinel down-after-milliseconds mymaster 60000
sentinel failover-timeout mymaster 180000
sentinel parallel-syncs mymaster 1
# 数据分片
cluster-enabled yes
```

注意：

1. 节点间使用 gossip 通信，规模<1000
2. 默认所有槽位可用，才提供服务
3. 一般会配合主从模式使用

### 🌟Redis 单线程吗，为什么快？
**Redis 网络模型 = IO 多路复用+事件派发**（接收网络请求，Redis6 之后命令的**转换采用多线程**，执行采用单线程）
**内存处理线程是单线程，纯内存操作，避免上下文切换，保证了高性能**，也不会产生现成安全问题。
使用了 I/O 多路复用模型，是非阻塞 IO，利用**单线程同时监听多个 socket**，在某个 socket 可读、可写时得到通知，**对就绪的 socket 调用 recvfrom，避免无效等待，充分利用 CPU**。
**select 和 poll 只通知有某个 socket 就绪（不知道是哪个），需要遍历确定具体的 socket，而 epoll 通知并把已就绪的 socket 写入用户空间**。

### Spring Cache 和 Redis 的区别？

1. **Spring cache是代码级的缓存**，一般是使用一个** ConcurrentMap**，也就是说实际上还是是使用JVM的内存来缓存对象的，这势必会造成大量的内存消耗。但好处是显然的：使用方便。
2. **Redis 是内存级的缓存**。它是使用单纯的内存来进行缓存。
3. 集群环境下，每台服务器的spring cache是不同步的，这样会出问题的，**spring cache只适合单机环境**。
4. Redis是设置单独的缓存服务器，所有集群服务器统一访问redis，不会出现缓存不同步的情况。

### Redis 的使用？

- ❌Jedis：基于BIO，线程不安全，需要配置连接池管理连接
- Lettuce：主流推荐的驱动，基于** Netty NIO**，API 线程安全
- **Redission**：**基于 Netty NIO**，API 线程安全，大量丰富的分布式供能特性 
   - **JUC 的线程安全集合和工具的分布式版本**
   - 分布式的基本数据类型和锁
####  Redis如何设置密码和验证密码？

- 设置密码：`config set requirepass 123456`
- 认证密码：`auth 123456`
#### Redis 事务

- 开启事务：multi
- 执行事务：exec
- 撤销事务：discard
- 实现乐观锁：watch
#### **Q：假如 Redis 里面有 1 亿个 key，其中有 10w** 个 key 是以某个固定的已知的前缀开头的，如果将它们全部找出来？
A：使用 keys 指令可以扫出指定模式的 key 列表。
Q2：如果这个 redis 正在给线上的业务提供服务，那使用 keys 指令会有什么问题？
A2：redis **内存处理**是单线程的。keys 指令会导致线程阻塞一段时间，线上服务会停顿，直到指令执行完毕，服务才能恢复。这个时候可以使用** scan 指令**，scan 指令可以无阻塞的提取出指定模式的key 列表，但是会有一定的重复概率，**在客户端做一次去重**就可以了，但是整体所花费的时间会比直接用 keys 指令长。

### Pipeline有什么好处？

将多次 IO 往返时间缩减为一次，前提是 pipeline 执行的指令之间没有因果相关性。

使用 redis-benchmark 进行压测的时候可以发现影响 redis 的 QPS 峰值的一个重要因素是 pipeline 批次指令的数目。


---

> 作者: 都将会  
> URL: https://leni.fun/redis/  

