# RPC 杂记


<!--more-->

## Socket

在`java.net`包中，有两个常用类：

- `Socket`：用于客户端
- `ServerSocket`：用于服务端

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1682046195562-232a8255-ffd8-47ba-8682-c07e44da83a6.png)

Socket 网络通信过程分为4步：

1. 建立服务端，监听客户端请求
2. 客户端请求，建立连接
3. 传递数据
4. 关闭资源

具体到服务端：

1. 创建 `ServerSocket` 对象并且绑定ip+port 

```
server.bind(new InetSocketAddress(ip,port))
```

1. 监听请求 `accept()`
2. 连接建立后，通过输入流读取客户端发送到请求信息
3. 通过输出流向客户端发送响应信息
4. 关闭资源

具体到客户端：

1. 创建 `Socket` 对象并连接服务器 

```
socket.connect(inetSocketAddress)
```

1. 连接建立后，通过输出流向服务器端发送请求信息
2. 通过输入流获取服务器响应信息
3. 关闭资源



## Serailizable

### 1. Serializable 接口

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1682044944967-e908e2b8-9497-45b9-bf0f-3d0cdf2e3d3d.png)

### 2. transient 关键字

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1682045027591-67af597e-4c00-4d93-b386-1e458ce36590.png)

### 3. 各种序列化

- hessian2序列化：dubbo rpc默认启用的序列化方式，源自 hessian lite
- json序列化：可读性强
- java序列化：性能不好
- **Kryo**序列化：专门针对Java语言，性能非常好，推荐面向生产环境
- ProtoBuf/ProtoStuff：跨语言序列化



## RPC

### 1. 基础

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681981890998-7533dc05-e440-42ae-a3f5-e81ce416b48c.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1682043515080-a099658f-e9bb-4982-986d-c24262a2f27b.png)

### 2. 静态代理和动态代理

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1682057128794-0f2f2740-885e-4039-babf-09e6d8cd22ae.png)



### 3. 多个PRC服务如何保证一致性？

TCC+MQ 保证最终一致性

- TCC：Try-Confirm-Commit
- MQ：consumer的重试机制


---

> 作者: 都将会  
> URL: https://leni.fun/rpc_draft/  

