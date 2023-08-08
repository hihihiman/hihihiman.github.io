# 🚩MicroService


### 为什么选用 Consul？

<!--more-->

- CP系统：**强一致性需求**
- Go 语言编写
- API 文档丰富，社区活跃
- 提供了简易的事务能力，可以使用 Consul API 或 HTTP 请求将事务代码提交给 Consul Agent 执行
- **consul agent** 与服务之间有心跳机制，基于 Gossip 协议，去中心化，**支持多数据中心**
- 提供**三种服务发现方式**

- - DNS服务发现是Consul最原生的服务发现机制，它通过将服务实例的IP地址注册为DNS记录，来实现服务发现。
  - HTTP API服务发现是一种基于RESTful API的服务发现机制，它通过HTTP请求来获取服务实例的地址信息。
  - gRPC服务发现

- 安全功能：TLS 加密和 ACL（访问控制列表）机制，可以对服务进行更细粒度的权限控制。

#### Consul > Eureka ？

1. Consul - CP（Raft 协议），Eureka - AP
2. Consul 支持多数据中心，Eureka 只支持单个数据中心部署
3. Consul 在每个服务器上都有 consul agent，故障时通知 leader；Eureka 每 30s 心跳检查，实现简单
4. Consul 由 Go 编写，安装启动即可，提供了3种服务发现机制（DNS、HTTP、gRPC）；Eureka 是个 servlet 程序，跑在 servlet 容器中，Eureka 只支持基于 HTTP API 的服务发现机制。
5. Consul 还提供了 ACL（访问控制列表）机制，可以对服务进行更细粒度的权限控制。

#### Consul > Zookeeper ？

1. 更适合服务发现：Consul 是专门为服务发现而设计的，而 ZooKeeper 则是一个通用的分布式协调服务。Consul 提供了一些方便的功能，如健康检查、DNS 解析等，使得服务发现更加容易。
2. 提供了原生的分布式锁（Raft 协议）、Leader 选举支持
3. Consul 健康检查基于 Gossip 协议，去中心化，支持多数据中心，；zookeeper 采用临时节点
4. Consul 提供了简易的事务能力，zookeeper 只提供了版本号检查能力
5. 文档详尽、社区活跃

### 微服务架构

- 单体架构：所有代码全都在一个项目中，架构简单、部署成本低，但耦合度高
- 垂直架构：MVC三层结构
- SOA架构：Service Oriented Architecture 面向服务架构，关注点是服务，服务是最基本的业务功能单元，由平台中立性的接口契约来定义。
- 微服务架构：每个小微服务都运行在自己的进程中，一般采用**HTTP**来轻量化通信。单一职责、面向服务、自治（团队、技术、数据、部署都独立）、隔离性强
- 服务网格：是一种微服务架构的扩展，提供了更加丰富的服务发现、负载均衡、流量控制、故障恢复和安全管理等功能。服务网格可以帮助开发人员更加轻松地管理和监控微服务架构，提高应用程序的可靠性和可维护性。

### 云原生

云原生应用程序通常采用分布式架构，将应用程序拆分为多个小型服务，每个服务都运行在独立的容器中，并通过轻量级的通信机制相互协作。云原生应用程序的主要特点包括：

- 容器化部署：应用程序以容器的形式进行部署和运行，容器可以快速启动、停止和迁移，提高了应用程序的可靠性和可扩展性。
- 微服务架构：应用程序采用微服务架构，将应用程序拆分为多个小型服务，每个服务都可以独立地进行开发、部署和扩展。
- 自动化运维：应用程序采用自动化的部署、监控和管理工具，可以自动化地进行应用程序的部署、扩展、升级和故障恢复。
- 弹性设计：应用程序采用弹性设计，能够自动感知负载变化和故障情况，并自动调整资源分配，保证应用程序的高可用性和高性能。
- 面向服务的架构：应用程序采用面向服务的架构，将应用程序的服务作为基本的构建块，通过服务间的协作来实现应用程序的功能。

#### 微服务技术栈：Spring Cloud + Consul + APISIX + Prometheus + Grafana + Hystrix

Spring Cloud和Consul用于服务注册和发现，APISIX用于服务网关，Prometheus和Grafana用于监控和可视化，Hystrix用于服务保护和容错。这些组件都可以在同一个应用程序中一起工作，互相协作，形成一个完整的微服务架构。

具体来说，Prometheus可以采集Spring Cloud和APISIX的指标数据，Grafana可以展示和分析这些数据，Hystrix可以保护和容错服务，Consul可以用于服务注册和发现，APISIX可以作为服务网关进行请求路由和负载均衡。这些组件可以通过REST API、JMX、Webhook等方式相互交互。

- REST API：REST API是一种基于HTTP协议的Web服务标准，用于不同应用之间的数据交互和远程调用。

- - APISIX可以通过REST API从Consul中获取服务列表，并进行负载均衡和路由，Prometheus可以通过REST API从Spring Cloud和APISIX中获取指标数据，并存储和查询这些数据。

- JMX：JMX是Java Management Extensions的缩写，是一种Java平台的管理和监控技术，用于在运行时管理和监控Java应用程序。

- - Hystrix可以通过JMX暴露服务熔断和降级的状态，并提供监控和管理API，Prometheus可以通过JMX抓取Hystrix的监控数据。

- Webhook：Webhook是一种HTTP回调机制，用于在发生事件时向指定的URL发送HTTP请求。

- - Hystrix可以通过Webhook向外部系统发送警报和通知，Prometheus可以通过Webhook触发告警规则并发送通知。

### 服务拆分原则

1. 不同微服务**单一职责**，不要重复开发相同业务

1. 1. 假设我们正在构建一个在线商城系统，可以拆分为订单服务、支付服务、库存服务和用户服务等微服务

1. 微服务**数据独立**，不要访问其他微服务的数据库
2. 微服务可以**将业务暴露为接口**，供其他微服务使用

### Eureka - 注册中心

##### Q1：消费者如何获取服务提供者具体信息？

- 服务提供者启动时向 eureka **注册**自己的信息
- 消费者根据服务名称向 eureka **拉取**提供者信息

##### Q2：如果有多个服务提供者，消费者该如何选择？

A：服务消费者利用**负载均衡**算法，从服务列表中挑选一个

##### Q3：消费者如何感知服务提供者健康状态？

A：服务提供者每隔 30s 向 EurekaServer 发送心跳请求，报告健康状态， eureka 会更新记录服务列表信息，心跳不正常会被剔除。

### Nacos vs Eureka ？

1. 消费者端，Nacos 增加了注册中心向 Consumer push 推送变更消息
2. 两者默认AP ， Nacos 可配置临时实例`spring.cloud.nacos.discovery.ephemeral`，实现 CP 

1. 1. Nacos 服务端：临时实例采用**心跳监测**，心跳不正常会被剔除；非临时实例主动询问，不会被剔除。 

1. Eureka 只有注册中心，Nacos 还有配置中心

#### 配置中心 - 热更新

1. 在`@Value`注入的变量所在类上添加注解` @RefreshScope  `
2. 使用 `@ConfigurationProperties` 注解

注意：不是所有配置都适合放到配置中心，建议只放一些需要运行时调整的关键参数

### nginx 反向代理 - 搭建集群

```nginx
http {
  upstream nacos-cluster {
      server 127.0.0.1:8845;
      server 127.0.0.1:8846;
      server 127.0.0.1:8847;
  }
···
}
```

### Ribbon - 负载均衡

给RestTemplate添加@LoadBalanced注解，负载均衡底层流程：

1. 调用接口发起请求
2. RibbonLoadBalancerClient 获取url中的服务id
3. DynamicServerListLoadBalancer 拉取 eureka-server 中的服务列表
4. 🌟IRule 接口决定负载均衡策略，并选择某个服务： 

1. 1. **ZoneAvoidanceRule**（默认）：对Zone区域内多个服务轮询，zone值可配置
   2. RoundRobinRule：轮询
   3. WeightedResponseTimeRule：服务响应时间越长，服务器权重就越小，概率就越低
   4. RandomRule：随机

1. 修改 url，发起请求

#### 大请求场景

Q：我们公司用的是轮询来作为负载均衡。不过因为轮询没有实际查询服务端节点的负载，所以难免会出现偶发性的负载不均衡的问题。

A1：（业务拆分）向账户中心查询 loginName 是否存在时，传的 list 限制在 100 以内，防止请求过大。

A2：（隔离角度）魔改了一下负载均衡算法，让大客户被打到几个专门的节点上

#### 加权负载均衡的权重设定

权重代表节点的处理能力，成加败减，权重的调整要设置好上限和下限。

#### 一致性哈希负载均衡

比如说针对用户的本地缓存，我们可以使用用户 ID 来计算哈希值，那么可以确保同一个用户的本地缓存必然在同一个节点上。不过即便是采用了一致性哈希负载均衡算法，依旧不能彻底解决数据一致性的问题（应用发布时）。

#### 负载均衡策略配置

在 consumer 消费者端：

1. 针对**所有**服务提供者：直接**注入IRule类型的Bean配置策略**
2. 针对**特定**服务提供者：yml：`userservice.ribbon.NFLoadBlancerRuleClassName: com.netflix.loadbalancer.RandomRule`

加载策略：默认懒加载，除非配置yml：`ribbon.eager-load.enabled=true` 开启饥饿加载



### Feign - 远程调用

系统级配置写入 bootstrap.yml

#### 基本使用

1.  添加 pom 依赖 
2.  启动类添加` @EnableFeignClients ` 注解  
3.  写接口： 

```java
@FeignClient("userservice")
public interface UserClient{
  @GetMapping("/user/{id}")
  User findById(@PathVariable("id") Long id);
}
```

1.  使用 FeignClient 中定义的方法取代 RestTemplate（并集成了 ribbon，实现了负载均衡） 

#### 自定义配置

-  修改日志级别：`feign.Logger.Level`，包含 NONE、BASIC（记录请求基本信息）、HEADERS（BASIC+请求头）、FULL（HEADERS+请求体） 四种级别，推荐使用NONE 或  **BASIC** 

1. 1.  配置文件方式 
   2.  Java 注解方式 

- - -  配置一个 Logger.Level 这个 Bean 

```java
public class DefaultFeignConfiguration{
  @Bean
  public Logger.Level feignLogLevel(){
    return Logger.Level.BASIC;
  } 
}
```

- - -  全局：@EnableFeignClients（defaultConfiguration =  DefaultFeignConfiguration.class) 
    -  局部：@EnableFeignClients（**value="userservice"**, defaultConfiguration =  DefaultFeignConfiguration.class) 

-  响应结果解析器：`feign.codec.Decoder`，Json 转换为 POJO 对象 
-  请求参数编码：`feign.codec.Encoder`，对象转换为 Json 
-  失败重试机制：`feign.Retryer`，默认没有，不过会使用Ribbon的重试 

#### 性能优化

Feign 底层的客户端实现：

- URLConnection：默认实现，不支持连接池
- Apache **HttpClient：支持连接池**，`feign.httpclient.enabled=true`
- OKHttp：支持连接池

#### 最佳实践

1. 继承：给消费者的 FeignClient和提供者的controller定义**统一的父接口**作为标准。 

1. 1. 服务【紧耦合】
   2. 父接口参数列表中的映射不会被继承

1. ✓抽取：将 FeignClient 抽取为**独立模块**，并把接口相关的POJO、默认的Feign配置都放到这个模块中，提供给消费者用【降低耦合】

#### Q：定义的FeignClient不在SpringBootApplication的扫描包范围时，FeignClient无法使用？

1. 指定FeignClient所在包：[@EnableFeignClients(basePackages ]() = "edu.zjut.feign.clients") 
2. 指定FeignClient**字节码**：[@EnableFeignClients(clients ]() = {UserClient.class}) （推荐） 

### 网关

#### 功能

请求先经过网关，再进入微服务：

1. 身份认证和权限校验
2. 服务路由、负载均衡
3. 请求限流

#### 网关比较

1. gateway：基于Spring5中提供的WebFlux，属于**响应式编程**（推荐）
2. zuul：基于**Servlet**实现，属于**阻塞式编程**
3. Apisix：Nginx+etcd，性能好

1. 1. 请求路由和负载均衡：APISIX支持基于请求内容、请求地址、请求头等多种方式进行请求路由，并提供多种负载均衡算法，如轮询、加权轮询、随机等。
   2. 流量控制和限流：APISIX支持基于QPS、连接数、并发数等多种方式进行流量控制和限流，可以保护后端服务免受突发流量的冲击。
   3. 认证和授权：APISIX支持多种认证和授权方式，如基于JWT、OAuth2、API Key等方式进行认证和授权，可以保护API服务的安全性。

### 跨域问题

跨域：**浏览器**禁止请求的发起者与服务端发生跨域**ajax请求**，请求被浏览器拦截的问题。

- 域名不同
- 域名相同，端口不同

### 分布式服务化与 SOA/ESB 的区别

1. 有状态部分，放到xx中心

1. 1. 配置中心：全局非业务参数

1. 1. 1. Nacos，运行期改变配置，避免不断重启

1. 1. 注册中心：运行期临时状态

1. 1. 1. 主动报告+心跳：让消费者能动态知道生产者集群的状态变化

1. 1. 元数据中心：业务模型

1. 1. 1. 定义了所有业务服务的模型

1. 无状态部分，放到应用侧（框架和配置部分，尽量不影响业务代码）

### 熔断

目的：给服务端恢复的机会。

使用：Hystrix 采用@EnableCircuitBreaker 注解，10s 内失败 50%以上触发熔断，之后每 5s 重试。

- 设定合适的阈值—— 响应时间超过 1.2s，并且持续 30s
- 防止抖动

总的来说，在任何的故障处理里面，都要考虑恢复策略会不会引起抖动问题。

- - 超过阈值后，持续一段时间后再熔断
  - 等待一段时间后，再放开流量（根据结果调整负载均衡权重）

场景：当 Redis 崩溃 or 返回某个错误类型时，触发熔断策略：

1. 开启一个线程，自旋地 ping Redis，直到 Redis 恢复。
2. 将节点挪出负载均衡策略的可用列表，降低权重。一段时间后如果客户端请求成功，就增加调整负载均衡权重，流量就会增加，否则该节点就继续等待。
3. 当所有节点都触发熔断了，就通过钉钉/企微机器人发起告警通知，人工介入处理。

### 降级

自我保护，目的在于应对系统自身的故障，与 feign 接口整合，编写降级逻辑，去掉不必要的业务逻辑，只保留核心逻辑

e.g. 第一次接触降级：双十一淘宝无法查看全部订单等边缘业务

场景：

1. 读写服务降级写服务

1. 1. 降级不重要的写数据：埋点数据、观测性数据
   2. 任务模块，主播读服务多，运营商写服务多，在qps过高时，降级写服务，降级非核心服务（不赚钱的）

1. 快慢路径降级慢路径：系统的并发高时，将请求标记为降级请求，只查询缓存（快路径），不查询数据库（慢路径）。
2. 水平分库：最热的数据放缓存，温数据放数据库，冷数据放硬盘（不提供实时查询）

### 限流

雪崩：一个服务失败，导致整条链路都失败

限流可以解决异常突发流量使系统雪崩的问题，方式：

- Tomcat 最大连接数
- Nginx 漏桶算法
- 网关：令牌桶算法，固定速率生成令牌，放入桶中，每个请求拿到令牌才会被执行

- - 确定阈值：线上高峰期 QPS，全链路压测测量瓶颈，可动态调整

- - - 响应时间 - 性能
    - 资源利用率 - 高并发
    - 吞吐量

- 自定义拦截器

#### IP 限流

获取用户真实 IP：

1. 应用层方法：X-Forwarded-For，缺点:会被伪造、多个X-Forwarded-For头部、不能解决HTTP和SMTP之外的真实源IP获取的需求
2. 传输层方法：利用 TCP Options 的字段来承载真实源 IP 信息、Proxy Protocol、NetScaler 的 TCP IP header 
3. 网络层：隧道 +DSR 模式

### 隔离

目的：提升可用性、性能和安全性。

1. 线程池隔离快慢任务，防止定时任务不能得到及时的调度，一个任务运行时间超过阈值，就转交给慢任务线程池。

1. 1. 线程池分成三级：独享，部分共享，完全共享，并且设置超时时间。

1. 数据库水平分库：素材库和发布库分离，只有正式发布的时候，素材才同步到缓存，提高缓存命中率。
2. Redis 隔离：核心业务保证高可用并且 code review，非核心业务 可以容错，以防缓存大量大对象导致集群超时、宕机。
3. 服务共享一部分基础设施，如部署两套 Redis

### 超时控制

目的：

1. 用户体验 e.g. 首页接口限制在 100ms 内
2. 及时释放资源。

常用指标：

- 99 线：99%请求都在阈值内
- 999 线：99.9%的请求都在阈值内

链路超时控制：将超时时间放在协议头（可以存放剩余超时时间或超时时间戳）



## Dubbo

### 1. Dubbo 整体架构



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20220217154504733.png)



1. config 配置层：对外配置接口，以 ServiceConfig、ReferenceConfig 为中心
2. proxy 服务代理层：服务接口透明代理，生成服务的客户端 Stub 和服务端 Skeleton，扩展接口为 ProxyFactory
3. registry 注册中心层：封装服务地址的注册与发现，以服务 URL 为中心
4. cluster 路由层：封装多个提供者的路由及负载均衡，并桥接注册中心，以 Invoker 为中心
5. monitor 监控层：RPC调用次数和调用时间监控
6. Protocol 远程调用层：封装 RPC 调用，以 Result 为中心，扩展接口为 Protocol，Invoker
7. exchange 信息交换层：封装请求响应模式，同步转异步，以 Request，Response 为中心
8. transport 网络传输层：抽象 mina 和 netty 为统一接口，以 Message 为中心
9. serialize 数据序列化层：可复用的一些工具，扩展接口为 ThreadPool

## 2. 应用场景

1. 分布式服务化改造：垂直拆分
2. 开放平台：开放模式、容器模式
3. 直接作为前端使用的后端（BFF，Backend For Frontend），一般不建议
4. 通过服务化建设中台：基于Dubbo实现业务中台

Q：服务如何暴露？

A：具体服务 -> Invoker -> Exporter

### 3. 如何设计幂等接口？

1. 用 bitmap 去重
2. 乐观锁机制


---

> 作者: 都将会  
> URL: https://leni.fun/microservice/  

