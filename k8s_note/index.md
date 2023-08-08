# k8s 杂记


<!--more-->

### 基本概念

**设计思想：从更宏观的角度，以统一的方式来定义任务之间的各种关系，并且为将来支持更多种类的关系留有余地。**

- **Namespace 做隔离，容器的本质是进程**
- **Cgroups 做限制**
- **rootfs 做文件系统。**

#### Pod 

- Pod是一个逻辑概念，是 Kubernetes 项目中最基础的一个原子调度单位，Pod 里的容器共享同一个 Network Namespace、同一组数据卷 Volume，从而达到高效率交换信息的目的。
- Infra 容器永远都是第一个被创建的容器，而其他用户定义的容器，则通过 Join Network Namespace 的方式，与 Infra 容器关联在一起。Infra 容器一定要占用极少的资源，所以它使用的是一个非常特殊的镜像，叫作：k8s.gcr.io/pause。这个镜像是一个用汇编语言编写的、永远处于“暂停”状态的容器，解压后的大小也只有 100~200 KB 左右
- service：给 Pod 绑定一个 Service 服务，拥有不变的 IP 地址等信息，作为 pod 的代理入口（Portal），从而代替 Pod 对外暴露一个固定的网络地址。 这样，对于 Web 应用的 Pod 来说，它需要关心的就是数据库 Pod 的 Service 信息。不难想象，Service 后端真正代理的 Pod 的 IP 地址、端口等信息的自动更新、维护，则是 Kubernetes 项目的职责。

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1689045801918-6f061217-7d2f-4e88-9af9-d7cf9a11b78f.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1689044943588-1f78779e-41c7-4aff-8722-c1d689277b22.png)

- master 控制节点

- - apiserver：api服务，整个集群的持久化数据由其处理后保存的 etcd 中
  - controller manager：容器编排
  - scheduler：调度

- node 计算节点



### kubeadm

把 kubelet 直接运行在宿主机上，然后使用容器部署其他的 Kubernetes 组件。

1. `apt-get install kubeadm`：安装 kubeadm、kubelet 和 kubectl 这三个二进制文件
2.   `kubeadm init`

1. 1. 进行一系列的检查工作，以确定这台机器可以用来部署 Kubernetes  
   2.  生成 Kubernetes 对外提供服务所需的各种证书和对应的目录。 
   3.  会为其他组件生成访问 kube-apiserver 所需的配置文件
   4. 会为 Master 组件生成 Pod 配置文件
   5. kubeadm 就会为集群生成一个 bootstrap token。在后面，只要持有这个token，任何一个安装了 kubelet 和 kubadm 的节点，都可以通过 kubeadm join 加入到这个集群当中。
   6. 在 token 生成之后，kubeadm 会将 ca.crt 等 Master 节点的重要信息，通过 ConfigMap 的方式保存在 Etcd 当中，供后续部署 Node 节点使用。这个 ConfigMap 的名字是 cluster-info。
   7. 就是安装默认插件： kube-proxy 和 DNS

1.   `kubeadm join`：，kubeadm 至少需要发起一次“不安全模式”的访问到 kube-apiserver，从而拿到保存在 ConfigMap 中的 cluster-info（它保存了 APIServer 的授权信息）。而 bootstrap token，扮演的就是这个过程中的安全验证的角色。

k8s 集群：

- 一个 Master 节点和多个 Worker 节点
- Weave 容器网络插件
- Rook 容器持久化存储插件
- Dashboard 可视化的 Web 界面。

更新配置文件：`kubectl apply -f nginx-deployment.yaml`

### Stateful

它把真实世界里的应用状态，抽象为了两种情况： 

1. **拓扑状态**。这种情况意味着，应用的多个实例之间不是完全对等的关系。这些应用实例，必须按照某些顺序启动，比如应用的主节点 A 要先于从节点 B 启动。而如果你把 A 和 B 两个 Pod 删除掉，它们再次被创建出来时也必须严格按照这个顺序才行。并且，新创建出来的 Pod，必须和原来 Pod 的网络标识一样，这样原先的访问者才能使用同样的方法，访问到这个新 Pod。 
2. **存储状态**。这种情况意味着，应用的多个实例分别绑定了不同的存储数据。对于这些应用实例来说，Pod A 第一次读取到的数据，和隔了十分钟之后再次读取到的数据，应该是同一份，哪怕在此期间 Pod A 被重新创建过。这种情况最典型的例子，就是一个数据库应用的多个存储实例。

StatefulSet 这个控制器的主要作用之一，就是使用 Pod 模板创建 Pod 的时候，对它们进行编号，并且按照编号顺序逐一完成创建工作。而当StatefulSet 的“控制循环”发现 Pod 的“实际状态”与“期望状态”不一致，需要新建或者删除 Pod 进行“调谐”的时候，它会严格按照这些 Pod 编号的顺序，逐一完成这些操作。

StatefulSet 其实就是一种特殊的Deployment，而其独特之处在于，它的每个 Pod 都被编号了。而且，这个编号会体现在 Pod 的名字和 hostname 等标识信息上，这不仅代表了 Pod 的创建顺序，也是 Pod 的重

要网络标识（即：在整个集群里唯一的、可被的访问身份）。有了这个编号后，StatefulSet 就使用 Kubernetes 里的两个标准功能：Headless Service 和 PV/PVC，实现了对 Pod 的拓扑状态和存储状态的维护。


---

> 作者: 都将会  
> URL: https://leni.fun/k8s_note/  

