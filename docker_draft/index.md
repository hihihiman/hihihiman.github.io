# Docker 杂记


<!--more-->

## 基础知识

### docker的优点

1. 轻量级和可移植性：Docker 容器非常轻量级，相比于虚拟机，它们只需要少量的系统资源和运行时间，因此可以更快地启动和停止。Docker 容器还具有高度的可移植性，可以在任何运行 Docker 的环境中运行，无需担心依赖项或环境配置的问题。
2. 简化应用程序部署：Docker 使得应用程序的部署和管理变得更加简单和可靠。通过将应用程序和其依赖项打包成容器，可以将其轻松地部署到任何环境中，从而简化了整个部署过程。
3. 高度可定制性：Docker 允许用户构建自己的 Docker 镜像，并根据自己的需求进行自定义配置。这使得用户可以根据自己的应用程序需求创建定制化的容器镜像，提高了应用程序的可定制性和可扩展性。
4. 容器化应用程序隔离：Docker 容器提供了隔离的环境，可以避免应用程序之间的冲突和干扰。每个容器都具有自己的文件系统、网络、内存和 CPU 资源，可以有效地隔离应用程序之间的资源。
5. 更好的资源利用率：Docker 容器可以共享主机操作系统的内核和其他资源，从而提高了资源利用率。与虚拟机相比，Docker 容器可以更高效地使用系统资源，从而提高了系统的性能和稳定性。

### docker 的缺点

容器只是一种特殊的进程，通过Linux Namespace机制进行隔离，但是隔离得不彻底，多个容器使用的还是同一个宿主机的操作系统内核：

1. 在容器里执行 top 指令,显示的信息居然是宿主机的 CPU 和内存数据，而不是当前容器的数据
2. 很多资源和对象无法被 Namespace 化，如“时间”

### Docker Compose 和 Dockerfile 的区别？

-  Dockerfile：是一种文本文件格式，用于定义 **Docker 镜像的构建过程**。Dockerfile 中包含了一系列的指令，用于指定基础镜像、安装软件、拷贝文件、配置环境变量等操作，最终生成一个新的 Docker 镜像。Dockerfile 可以通过 docker build 命令执行，将 Dockerfile 转换为 Docker 镜像。 
-  
   - FROM，该命令指定基于哪个基础镜像，因为你要指定一个基础镜像才能基于这个镜像之上进行其他操作，DockerFile第一条必须为From指令。如果同一个DockerFile创建多个镜像时，可使用多个From指令（每个镜像一次）
   - MAINTAINER，指定作者信息
   - CMD
   - EXPOSE ，这个是用来暴露端口的
   - ENV ，是用于定义环境变量
   - VOLUME，这个是用来指定挂载点（也可以在idea配置）
-  Docker Compose：用于**定义和运行多个容器之间的依赖关系**。Docker Compose 中使用 YAML 文件格式，定义了应用程序中的服务、网络、卷等资源，以及它们之间的关系和依赖关系。Docker Compose 可以通过 docker-compose 命令集成管理多个容器。 

需要注意的是，Docker Compose 和 Dockerfile 并不是互斥的概念，它们可以一起使用，Dockerfile 定义容器镜像的构建过程，Docker Compose 定义容器之间的关系和依赖关系，可以一起协同工作，实现更加灵活和高效的容器化应用部署和管理。

## 使用教程

首先给服务器上的防火墙打开端口：

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20230309152430376.png#id=yHuHW&originHeight=616&originWidth=2748&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

### 1. portainer（可视化工具）

```shell
# docker搜索
docker search portainer
# docker拉取镜像
docker pull portainer/portainer:latest
# 创建数据卷
docker volume create portainer_data
# 运行容器
docker run --name portainer -d -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer 
#-d #容器在后台运行
#-p 9000:9000 # 宿主机9000端口映射容器中的9000端口
#-v /var/run/docker.sock:/var/run/docker.sock # 把宿主机的Docker守护进程(docker daemon)默认监听的Unix域套接字挂载到容器中
#-v # 把宿主机目录 挂载到 容器目录；
#–-name portainer # 指定运行容器的名称

cd /usr/libexec/docker/
sudo ln -s docker-runc-current docker-runc
```

> 参考：[https://cloud.tencent.com/developer/article/1867994](https://cloud.tencent.com/developer/article/1867994)


### 2. 生成ca证书

```shell
# 创建ca证书
mkdir -p /usr/local/ca
cd /usr/local/ca/
# 创建密码（输入两次）
openssl genrsa -aes256 -out ca-key.pem 4096
# 依次输入密码、国家、省、市、组织名称等,输入‘.’略过
# common name 填服务器ip
openssl req -new -x509 -days 365 -key ca-key.pem -sha256 -out ca.pem
```

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20230309111129471.png#id=doogK&originHeight=357&originWidth=810&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

```shell
# 生成服务端的 server-key.pem
openssl genrsa -out server-key.pem 4096
# ip地址改成自己的ip或域名
openssl req -subj "/CN=124.221.157.240" -sha256 -new -key server-key.pem -out server.csr
# 配置任何ip+证书可以访问
echo subjectAltName = IP:124.221.157.240,IP:0.0.0.0 >> extfile.cnf
# 密钥仅用于服务器身份验证
echo extendedKeyUsage = serverAuth >> extfile.cnf
# 生成签名证书
openssl x509 -req -days 365 -sha256 -in server.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -out server-cert.pem -extfile extfile.cnf
# 生成客户端的 key.pem
openssl genrsa -out key.pem 4096
openssl req -subj '/CN=client' -new -key key.pem -out client.csr
# 密钥适用于客户端身份验证
echo extendedKeyUsage = clientAuth > extfile-client.cnf
# 生成签名证书 以下表示365天，可以改成更长
openssl x509 -req -days 365 -sha256 -in client.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -out cert.pem -extfile extfile-client.cnf
# 删除过程中产生的配置文件
rm -v client.csr server.csr extfile.cnf extfile-client.cnf
# 密钥读写权限改为读取权限
# from 0600 (rw-------) to 0400 (r--------)
chmod -v 0400 ca-key.pem key.pem server-key.pem
# 证书对外可读，也关闭写权限
# from 0644 (rw-r--r--) to 0444 (r--r--r--)
chmod -v 0444 ca.pem server-cert.pem cert.pem
# 复制证书
cp server-*.pem  /etc/docker/
cp ca.pem /etc/docker/
# docker 关联 ca
vim /usr/lib/systemd/system/docker.service
# 修改ExecStart这一行（添加没有的部分，不删除原有的）
ExecStart=/usr/bin/dockerd --tlsverify --tlscacert=/etc/docker/ca.pem --tlscert=/etc/docker/server-cert.pem --tlskey=/etc/docker/server-key.pem -H tcp://0.0.0.0:2376 -H unix:///var/run/docker.sock
# 重新加载 daemon 
systemctl daemon-reload 
# 重启 docker
systemctl restart docker
# 开放2376端口
/sbin/iptables -I INPUT -p tcp --dport 2376 -j ACCEPT
# 回到主机，把ca文件拷贝出来，-r 表示拷贝文件夹
scp -r ubuntu@124.221.157.240:/usr/local/ca ~/Desktop
# 这里遇到了 key.pem 无法拷贝的问题，临时修改了权限
chmod -v 0444 key.pem
# 单独拷贝
scp ubuntu@124.221.157.240:/usr/local/ca/key.pem ~/Desktop/ca
# 再改回来
chmod -v 0400 key.pem
# 测试证书接口
curl https://124.221.157.240:2376/info --cert ./cert.pem --key ./key.pem --cacert ./ca.pem
```

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20230309151931406.png#id=vX8Fk&originHeight=321&originWidth=1724&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

证书生效了。

> 参考：[https://blog.csdn.net/qq_46126559/article/details/118373855](https://blog.csdn.net/qq_46126559/article/details/118373855)


### 3. idea部署https

resources/docker/dockerFile

```dockerfile
#FROM openjdk:8-jdk-alpine
FROM java:8

RUN mkdir -p /apps
# app改成项目名称
ADD *.jar /apps/app.jar

#对外暴露的端口
EXPOSE 8801

# 环境、jar包路径 
# app改成项目名称
ENTRYPOINT  ["java","-Xmx512m","-Xms512m","-Dspring.profiles.active=test","-jar","/apps/app.jar"]
RUN echo "Asia/shanghai" > /etc/timezone;
ENV LANG C.UTF-8
```

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20230309160553008.png#id=FrsAk&originHeight=670&originWidth=797&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

[https://124.221.157.240:2376](https://124.221.157.240:2376)

选择包含`cert.pem、key.pem、ca.pem` 的文件夹

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20230309165618960.png#id=yy5oL&originHeight=714&originWidth=1040&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20230309165701931.png#id=KkbSh&originHeight=215&originWidth=645&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

/etc/localtime

/usr/share/zoneinfo/Asia/Shanghai

/apps

### 4. Redis 安装

```shell
# 拉镜像
docker pull redis:latest
# 挂载目录
mkdir /docker-data/redis
cd /docker-data/redis
# 下载redis.conf
wget http://download.redis.io/redis-stable/redis.conf
# 权限
chmod 777 redis.conf
# 修改配置信息
vim /docker-data/redis/redis.conf
```

```shell
bind 127.0.0.1 # 这行要注释掉，解除本地连接限制
protected-mode no # 默认yes，如果设置为yes，则只允许在本机的回环连接，其他机器无法连接。
daemonize no # 默认no 为不守护进程模式，docker部署不需要改为yes，docker run -d本身就是后台启动，不然会冲突
requirepass 123456 # 设置密码
appendonly yes # 持久化
```

```shell
#启动
docker run --name redis \
-p 6379:6379 \
-v /docker-data/redis/redis.conf:/etc/redis/redis.conf \
-v /docker-data/redis:/data \
-d redis redis-server /etc/redis/redis.conf --appendonly yes
```

> 参考：[https://cloud.tencent.com/developer/article/1997596](https://cloud.tencent.com/developer/article/1997596)


### 5. minio 配置

```shell
docker run -p 9090:9090 -p 9091:9091 \
     --name minio \
     -d --restart=always \
     -e "MINIO_ACCESS_KEY=minioadmin" \
     -e "MINIO_SECRET_KEY=Josh@123" \
     -v /home/minio/data:/data \
     -v /home/minio/config:/root/.minio \
     minio/minio server \
     /data --console-address ":9091" -address ":9090"
```

9090是服务端口，9091是可视化界面

## 监控系统
### 如何配置监控系统？

1. 安装：编写一个 docker-compose.yml 文件，指定 Prometheus 和 Grafana 的镜像、端口等配置，然后使用 docker-compose up 命令启动 Prometheus 和 Grafana 。
```yaml
version: '3'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus:/etc/prometheus/
    command:
      - --config.file=/etc/prometheus/prometheus.yml
      - --storage.tsdb.path=/prometheus
    restart: always

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - ./grafana:/var/lib/grafana
    restart: always
```

2. 配置 Prometheus：在 Prometheus 的配置文件中，指定需要监控的目标（例如 Java 应用程序），以及需要采集的指标（例如 JVM 内存使用情况、线程池情况等）。可以使用 Prometheus 的查询语言（PromQL）查询指标，在Grafana面板中，点击“Apply”或“Refresh”按钮，即可执行查询语句并显示结果
```shell
# 获取实例的 CPU 使用率：
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# 获取实例的内存使用率：
100 - ((node_memory_MemFree_bytes + node_memory_Buffers_bytes + node_memory_Cached_bytes) / node_memory_MemTotal_bytes) * 100

# 获取实例的磁盘使用率：
100 - (avg by (instance) (node_filesystem_free_bytes{fstype="ext4"} / node_filesystem_size_bytes{fstype="ext4"}) * 100)

# 获取 HTTP 请求数量：
sum by (job) (http_requests_total)

# 获取 HTTP 请求错误数量：
sum by (job, status) (http_requests_total{status=~"5.."})

# 获取 HTTP 请求响应时间的平均值：
avg by (job) (http_request_duration_seconds)

# 获取 HTTP 请求响应时间的 90% 百分位数：
histogram_quantile(0.9, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))

# 获取容器 CPU 使用率：
sum by (container) (rate(container_cpu_usage_seconds_total{container!="POD"}[5m])) * 100

# 获取容器内存使用率：
sum by (container) (container_memory_usage_bytes{container!="POD"}) / sum by (container) (container_spec_memory_limit_bytes{container!="POD"}) * 100
```

3. 配置 Grafana：在 Grafana 中，选择“Prometheus”作为数据源类型，创建仪表盘和面板，使用 Grafana 的查询语言（GQL）查询指标，并将查询结果可视化展示。
```shell
# 获取指定时间范围内的监控数据
SELECT mean("metric_name") FROM "measurement_name" WHERE time >= now() - 1h GROUP BY time(1m) fill(null)

# 数据聚合和重采样
SELECT sum("metric_name") FROM "measurement_name" WHERE time >= now() - 1d GROUP BY time(1h) fill(0)

# 根据标签过滤数据
SELECT mean("metric_name") FROM "measurement_name" WHERE "tag_name" =~ /tag_value/ AND time >= now() - 1h GROUP BY time(1m) fill(null)

# 获取最新的监控数据
SELECT last("metric_name") FROM "measurement_name" WHERE time >= now() - 1h GROUP BY "tag_name" fill(null)

# 数据去重
SELECT distinct("tag_name") FROM "measurement_name"

# 计算两个指标之间的关系
SELECT derivative("metric1_name") / derivative("metric2_name") * 100 FROM "measurement_name" WHERE time >= now() - 1h GROUP BY time(1m) fill(null)

# 计算指标的百分位数
SELECT percentile("metric_name", 95) FROM "measurement_name" WHERE time >= now() - 1h GROUP BY time(1m) fill(null)
```
### Springboot 集成 grafana + Prometheus 获得 99 线和 999 线？

1. 添加依赖

在 Spring Boot 项目的 pom.xml 文件中添加以下依赖：
```
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-core</artifactId>
    <version>1.5.9</version>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
    <version>1.5.9</version>
</dependency>
```
其中，micrometer-core 是 Micrometer 库的核心依赖，micrometer-registry-prometheus 是 Micrometer 的 Prometheus 注册表依赖。

2. 配置 Prometheus 注册表

在 Spring Boot 项目的配置文件 application.yml 中添加 Prometheus 注册表配置：
```
management:
  endpoints:
    web:
      exposure:
        include: "*"
  metrics:
    tags:
      application: ${spring.application.name}
    distribution:
      percentiles-histogram:
        http.server.requests: true
    export:
      prometheus:
        enabled: true
        step: 10s
```

其中，management.endpoints.web.exposure.include 配置开启所有的监控端点；management.metrics.tags.application 配置应用程序名称；management.metrics.export.prometheus.enabled 配置开启 Prometheus 注册表；management.metrics.export.prometheus.step 配置采集数据的时间间隔。

3. 配置 Grafana 数据源

在 Grafana 中添加 Prometheus 数据源，并配置数据源 URL。例如，Prometheus 数据源 URL 可以配置为 http://localhost:9090。

4. 创建 Dashboard

在 Grafana 中创建 Dashboard，并配置 Panel。例如，可以添加一个新的 Graph Panel，然后在 Metrics 选项卡中选择 http.server.requests 指标并设置 percentiles 为 0.99 和 0.999。

5. 查看 99 线和 999 线

在创建好的 Dashboard 中，可以查看 http.server.requests 指标的 99 线和 999 线。这些线条将显示在 Graph Panel 中，并显示当前时间范围内的 99% 和 99.9% 的请求响应时间。
以上是 Spring Boot 集成 Grafana 和 Prometheus 并获取 99 线和 999 线的步骤。需要注意的是，具体的配置和实现可能因应用程序的具体情况而异，需要根据具体情况进行调整和修改。
### 动态配置限流阈值
要根据 Grafana 监控数据动态更改限流阈值，可以使用 Grafana 的 Alerting 功能和 Spring Boot 的 Actuator 端点，具体步骤如下：

1. 创建 Grafana Alerting 规则

在 Grafana 中创建 Alerting 规则，以监控请求响应时间超过 999 线的情况。具体步骤如下：
a. 在 Grafana 中创建一个 Dashboard，并添加一个 Graph Panel。
b. 在 Metrics 选项卡中选择 http.server.requests 指标，并设置 percentiles 为 0.999。
c. 在 Alert 选项卡中创建一个 Alerting 规则，当请求响应时间超过 999 线时触发。
d. 在 Notifications 选项卡中配置 Alert 的通知方式，例如邮件通知。

2. 创建 Actuator 端点

在 Spring Boot 应用程序中创建 Actuator 端点，用于接收来自 Grafana 的 Alerting 通知，并动态更改限流阈值。具体步骤如下：
a. 创建一个实现 Actuator Endpoint 接口的类，用于接收来自 Grafana 的 Alerting 通知。
```java
@Component
    @Endpoint(id = "my-endpoint")
    public class MyEndpoint {
        @WriteOperation
        public void setRateLimit(@Selector String route, int rateLimit) {
            // 设置限流阈值，例如使用 Redis 缓存保存阈值。
        }
    }
```
其中，setRateLimit 方法用于设置限流阈值，例如使用 Redis 缓存保存阈值。
b. 在 Spring Boot 应用程序的配置文件 application.yml 中开启 Actuator 端点。
```yaml
management:
  endpoints:
    web:
      exposure:
        include: "*"
  endpoint:
    my-endpoint:
      enabled: true
```

3. 实现限流器

在 Spring Boot 应用程序中实现限流器，用于根据 Actuator 端点中保存的阈值进行限流。例如，可以使用 Spring Cloud Gateway 的 RequestRateLimiter 过滤器进行限流。
```java
@Component
    public class RateLimiterGatewayFilterFactory extends AbstractGatewayFilterFactory<RateLimiterGatewayFilterFactory.Config> {

        // 从 Redis 缓存中获取限流阈值
        private int getRateLimit(String route) {
            // 例如使用 Redis 缓存保存阈值。
        }

        public RateLimiterGatewayFilterFactory() {
            super(Config.class);
        }

        @Override
        public GatewayFilter apply(Config config) {
            return (exchange, chain) -> {
                String route = exchange.getAttribute(ServerWebExchangeUtils.GATEWAY_ROUTE_ATTR);
                int rateLimit = getRateLimit(route);
                // 使用 RequestRateLimiter 过滤器进行限流
                return new RequestRateLimiterGatewayFilterFactory().apply(new RequestRateLimiterGatewayFilterFactory.Config().setRateLimiter(new RedisRateLimiter(rateLimit, rateLimit, Duration.ofSeconds(1))));
            };
        }

        public static class Config {
            // 配置
        }
    }
```
其中，RateLimiterGatewayFilterFactory 是自定义的限流器，使用 Redis 缓存保存限流阈值；getRateLimit 方法用于从 Redis 缓存中获取限流阈值；使用 RequestRateLimiter 过滤器进行限流。

4. 测试

启动 Spring Boot 应用程序，然后在 Grafana 中创建一个 Alerting 规则，当请求响应时间超过 999 线时触发。当 Alert 触发时，Grafana 会向 Actuator 端点发送通知，Actuator 端点会动态更改限流阈值。限流器会根据新的限流阈值进行限流，从而有效控制请求的并发量。
以上是根据 Grafana 监控数据动态更改限流阈值的步骤。需要注意的是，具体的实现和配置可能因应用程序的具体情况而异，需要根据具体情况进行调整和修改。


---

> 作者: 都将会  
> URL: https://leni.fun/docker_draft/  

