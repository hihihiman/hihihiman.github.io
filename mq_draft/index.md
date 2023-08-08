# MQ 杂记


<!--more-->

### MQ 四大作用

1. 异步通信：减少线程等待
2. 系统解耦
3. 削峰填谷：压力大的时候，缓冲部分请求
4. 可靠通信：提供多种消息模式、服务质量、顺序保障等

### 消息处理模式

1. 点对点：Queue
2. 发布订阅：对应 Topic（Kafka)
### Kafka

1. Broker：集群中的服务器
2. Topic：消息类别，物理上不同 Topic 的消息分开存储【通过顺序写入达到高吞吐】
3. Partition：每个 Topic 包含 1～n 个 Partition【可扩展性】
4. Producer：生产者，负责发布消息到 Broker，有三种确认模式
   1. ack = 0 只发送，不管是否成功写入 broker
   2. ack = 1 写入到 leader 就认为成功
   3. ack = -1/all 写入到最小副本则认为成功
5. Consumer： 消费者，从 Broker 读取消息
6. Consumer Group：每个 Consumer 属于一个特定的 Consumer Group
### RabbitMQ

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/809f8bd5802db6036dd49d695bdbc146.png)

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/183dbbbc44f662fdfa275eb66b843ba5.png)

### 26.2 RocketMQ



![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/44d70726509f0c7222a51a21c3664a01.png)

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/d1d20777ccaa93ad12be8483ce7fc4e4.png)

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/68bb34291274bf6cffeb3ee7f7ec4299.png)



### 26.3 Pulsar
![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/fea14246efb9d9e85c0465964bc1c53e.png)

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/f8a12f1e73be414694832c355eb9611a.png)

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/9aeb3beda3641cfa732571da1c63fc4e.png)

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/eed4bf1a953ac2343c339042fa866ae8.png)


---

> 作者: 都将会  
> URL: https://leni.fun/mq_draft/  

