# 🚩MQ - 消息队列


### 🌟RabbitMQ如何保证消息不丢失？

<!--more-->

1. producer 生产者确认
2. 持久化：交换机、队列、消息
3. consumer 消费者确认：由 spring 确认消息处理成功后 ack
4. consumer 消费者失败重试机制，达到一定次数后转人工处理
5. 监控和告警
6. 高可用集群
### 🌟重复消费怎么解决？

1. 每条消息设置唯一 id
2. 幂等性方案：分布式锁、数据库锁（乐观锁、悲观锁、唯一索引）
### 延迟队列
延迟消费的消息：超时订单、限时优惠、定时发布（e.g. 零零播项目中的任务）
延迟队列 = 死信交换机 + TTL
死信交换机 DLX（Dead Letter Exchange）：声明一个交换机，delayed = true
死信 dead letter 定义：

1. 消费者使用` basic.reject `声明消费失败，并且 requeue = false
2. 消息过期，超时无人消费（发送消息时添加参数 **x-delay = 超时时间**）
3. **队列已满，最早的消息**可能成为死信
### 🌟大数据堆积在 MQ 怎么办？

1. 单个消费者-**多线程**消费
2. **多个消费者**消费
3. 使用 RabbitMQ **惰性队列**，支持百万条消息存储
   1. 将消息直接存入磁盘
   2. 消费者从磁盘读消息



---

> 作者: 都将会  
> URL: https://leni.fun/mq/  
