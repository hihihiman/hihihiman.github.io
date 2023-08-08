# JVM 杂记（二）


<!--more-->



### 1.1 字节码技术



编译：`javac demo/jvm/Xxx.java`



查看字节码： `javap -c demo.jvm.Xxx`



JVM 是一台基于栈的计算机器



每个线程都有一个独属于自己的线程栈（Stack），用于存储栈帧（Frame），每一次方法调用，JVM会自动创建一个栈帧。



栈帧 = 操作数栈 + 局部变量数组 + Class引用（指向当前方法在运行时常量池中对应的Class）



方法调用的指令：



- invokestatic：调用静态方法，最快

- invokespecial：调用构造函数、同一个类中的private方法、可见的超类方法

- invokevirtual：调用public、protected、package级的私有方法

- invokeinterface：通过接口引用来调用方法

- invokedynamic：支持lambda表达式的实现基础



### 1.2 类加载器



#### 1.2.1 生命周期



1.  加载（Loading）：找 Class 文件 

1.  验证（Verification）：验证格式、依赖【链接（Linking）】 

1.  准备（Preparation）：静态字段、方法表【链接（Linking）】 

1.  解析（Resolution）：符号解析为引用【链接（Linking）】 

1.  初始化（Initialization）：构造器、静态变量赋值、静态代码块 

1. 1. 父类静态变量
   2. 父类静态代码块
   3. 子类静态变量
   4. 子类静态代码块
   5. 父类非静态变量
   6. 父类非静态代码块
   7. 父类构造函数
   8. 子类非静态变量
   9. 子类非静态代码块
   10. 子类构造函数

**首先，静态优先于非静态，其次，父类优先于子类，最后变量优先于代码块，另外，构造函数属于非静态，在代码块之后执行。**

1.  使用（Using） 

1.  卸载（Unloading） 



#### 1.2.2 不会初始化的情况（可能会加载）



1. 通过子类引用父类的静态字段，只会触发父类的初始化，而不会触发子类的初始化；

1. 定义对象数组，不会触发该类初始化；

1. 常量在编译期间会存入调用类的常量池中，本质上并没有直接引用定义常量的类，不会触发类初始化；

1. 通过类名获取 Class 对象，不会触发类初始化；

1. 通过 Class.forName 加载指定类时，如果指定参数 initialize 为 false 时，也不会触发类初始化，否则就会初始化；

1. 通过 ClassLoader 默认的 loadClass 方法，只加载，不会初始化。



#### 1.2.3 类加载器



1. 启动类加载器（BootstrapClassLoader）

1. 扩展类加载器（ExtClassLoader）

1. 应用类加载器（AppClassLoader）



特点：



1. 双亲委托

1. 负责依赖

1. 缓存加载



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/1cff66a74f47a2b16b8cd5bb98294683.png)



### 1.3 内存模型



Java进程组成：



1. 栈 Stack

1. 堆 Heap 

1. 1. 年轻代 Young generation 

1. 1. 1. 新生代 Eden space
      2. 存活区 Survivor space：总有一个是空的 

1. 1. 1. 1. S0
         2. S1

1. 1. 老年代 Old generation （进入老年代阈值`-XX:+MaxTenuringThreshold=15`）

1. 非堆 Non-Heap：本质上还是 Heap，只是不归 GC 管理 

1. 1. 元数据区 Metaspace `-XX:MaxMetaspaceSize=256m` 

1. 1. 1. 常量池
      2. 方法区

1. 1. CCS = Compressed Class Space：存放 class 信息，和 Metaspace 有交叉
   2. Code Cache：存放 JIT（just-in-time compilation 及时编译） 编译器编译后的本地机器代码

1. JVM自身



### 1.4 启动参数



`-D`：设置系统属性



`-X`：非标准参数，基本都是传给 JVM 的，默认 JVM 实现这些参数的功能，但是并不保证所有 JVM 都满足，也不保证向后兼容。



`-XX`：非稳定参数，随时可能在下一版本取消



`-XX:+Use**GC`：使用 G1/ConcMarkSweep、Serial、Parallel GC



`-XX: +UnlockExperimentalVMOptions -XX:+UseZGC`：Java 11+ 有 ZGC



`-XX: +UnlockExperimentalVMOptions -XX:+UseShenandoahGC`：Java 12+ 有 Shenandoah GC



##### 分析诊断



```shell
# 当 OOM（内存溢出） 产生，自动 Dump 堆内存
java -XX:+HeapDumpOnOutOfMemoryError -Xmx256m ConsumeHeap 
# 指定内存溢出时 Dump 文件的目录
java -XX:HeapDumpPath=/usr/local/ ConsumeHeap
# 致命错误的日志文件名
java -XX:ErrorFile=filename
# 远程调试
java -Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=1506
```



##### JavaAgent



Agent时JVM中的一项黑科技，可以通过无侵入方式注入AOP代码或执行统计，权限非常大。



```shell
# 启用native方式的agent，参考 LD_LIBRARY_PATH 路径
-agentlib:libname[=options]
# 启用native方式的agent
-agentpath:pathname[=options]
# 启用外部的agent库，如pinpoint.jar等等
-javaagent:jarpath[=options]
# 禁用所有agent
-Xnoagent
```



### 2.1 内置命令行工具



-  javap：反编译class文件 

-  jar：打包文件或目录成.jar文件 

-  jps：查看Java进程 

-  jstat：查看JVM内部gc相关信息 

- -  

```shell
-class 类加载（ClassLoader）信息统计
-compiler JIT即时编译器相关的统计信息
-gc GC相关堆内存信息（单位：kb）
-gccapacity 各个内存池分代空间的容量
-gccauce 看上次、本次GC的原因
-gcnew 年轻代的统计信息
-gcnewcapacity
-gcold 老年代和元数据区的行为统计
-gcoldcapacity
-gcmetacapacity
-gcutil GC相关区域的使用率统计（单位：%）
-printcompilation 打印JVM编译统计信息
```

 

-  jmap：查看heap或类占用空间统计 

- -  

```shell
-heap [pid]打印堆内存的配置和使用信息
-histo [pid]看哪个类占用的空间最多，直方图
-dump:format=b,file=xxxx.hprof [pid] 备份堆内存
```

 

-  jstack：查看线程信息 

- - `-F`：强制执行 thread dump，可在Java进程卡死时使用

- - `-m`：混合模式，将 Java 帧和 native 帧一起输出

- - `-l`：长列表模式，将线程相关的locks信息一起输出，比如持有的锁，等待的锁

-  jcmd pid help：综合了前面几个命令 



### 2.2 内置图形化工具



jconsole



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/fa8a505918347a3eef9b606720f81dc3.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/a0a4ca9d3eedd01cfd79290246d82091.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/b1fb8c991bf65e972f0600e10523f808.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/760b5f4b36aa39da9278b3ed6ff7f062.png)



jvisualvm



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/a87086985579f38c3d19edeb8e87091f.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/5ef3876ed64c40084393229c8bdb9f70.png)



visualgc



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/c3bd4124ee3f361691382972d3d17eb8.png)



jmc



用于对 Java 应用程序进行管理、监视、概要分析和故障排除的工具套件。



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/7792409ef18beba938e89d5041cf11c3.png)



### 2.3 GC 原理



##### 



##### 为什么要分代？



1. 大部分新生对象很快无用

1. 存活较长时间的对象，可能存活更长时间



### 2.4 串行/并行 GC



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/c7126cc5088416204b45a99ae5236f47.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/e99bb24b56e5a58e6cf90919f9f47b89.png)



### 2.5 CMS/G1 GC



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/52127774575c2d7978ff9f7e4bd39d66.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/d4d2b78bb705af130d52aed4bee5c728.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/be1562655e50bc68a31d916266cdcb5c.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/1e722f51a7fe8de3efa745f834646d20.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218113405755.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/81f0de3fdc781d3620d52f5bdf88d064.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/510e6f1b7fec50029a5014113d340bf2.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/01a0acabc51d95cc8274986b268629a3.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/5c36a8456106a3449b45fd2dcd6a3df0.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218113516450.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/62d0ba79add80238e7db57fb911edf89.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218113541626.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/eaca52b2e6cf46219e2f9c9c74eeb70a.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218113600885.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218113610994.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/6a9d64fe49853b1e6fc357ff306b47c1.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218113639755.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218113654487.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218113709902.png)



### 2.6 ZGC/Shenandoah GC



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218113746683.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218113757905.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218113809907.png)



### 2.7 GC 总结



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218113825756.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218113854108.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218113932210.png)



### 3.1 GC 日志解读与分析



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218114337611.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218114507498.png)



```shell
-XX:+UseSerialGC
-XX:+UseParallelGC
-XX:+UseConcMarkSweepGC
-XX:+UseG1GC
```



### 3.2 JVM 线程堆栈数据分析



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218114726964.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218114758760.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218114825251.png)



### 3.3 内存分析与相关工具



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218114852303.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218114904665.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218114921953.png)



堆内存溢出



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218115053664.png)



元空间溢出



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218115110214.png)



本地方法栈溢出



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218115303629.png)



### 3.4 JVM 问题分析调优经验



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218115426004.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218115358354.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218115442965.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218115526057.png)



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/image-20211218115546255.png)


---

> 作者: 都将会  
> URL: https://leni.fun/jvm_draft_2/  

