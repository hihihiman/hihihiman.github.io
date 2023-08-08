# JVM 杂记（一）


<!--more-->

### JVM 架构模型

Java 编译器输入的指令流基本上时一种**基于栈的指令集架构**，适用于资源受限的系统，大部分是零地址指令，指令集更小，编译器容易实现，不需要硬件支持，可移植性好，更好实现跨平台。



#### JVM 生命周期

- 启动：通过引导类加载器(bootstrap class loader)创建一个初始类（initial class）
- 执行：JVM 进程
- 退出：某线程调用Runtime类的exit或halt方法是其中一种


### 运行时数据区

栈、堆、元空间的交互关系：

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/bd310105758401745ce81e60e173e461.png)

#### 元空间 Metaspace（进程拥有，线程间共享）

又名非堆，常看作是一块独立于 Java 堆的内存空间，不在虚拟机设置的内存中，而是使用本地内存。

- 类型信息（class、interface、enum、annotation）、 
   - 域（Field）信息 
      - 域名称
      - 域类型
      - 域修饰符（public、private、p rotected、static、final、volatile、transient）
   - 方法信息 
      - 方法名
      - 方法返回类型（包括void）
      - 方法参数（按顺序）
      - 方法修饰符
      - 方法字节码、操作数栈、局部变量表及大小（abstact和native方法除外）
      - 异常表
   - 包名、类名
   - 父类名
   - 修饰符（public、abstract、final）
   - 这个类型直接接口的有序列表
- 运行时常量池：在类加载后，存放编译生成的各种字面量与符号引用
- 静态变量
- 即时编译器（JIT）编译后的代码缓存

##### 为什么永久代要被元空间替换？

1. 为永久代设置空间大小是很难确定的。
2. 对永久代进行调优是很困难的。

#### 🌟堆（进程拥有，线程间共享）——数据存储

字符串常量池、静态变量仍然在堆。

##### 设置参数

-  -X：jvm的运行参数 
   -  ms：memory start，初始内存大小，默认电脑内存/64 
   -  mx：memory max，最大内存大小，默认电脑内存/4 
   -  mn：新生代大小 
-  -XX: 
   -  NewRatio（老年代/新生代）=2（默认）：表示新生代占1，老年代占2，新生代占整个堆的1/3 
   -  SurvivorRatio（eden区/survivor区）=8（默认）：表示eden区占8，survivor区各占1，有时需要显式指定才生效 
   -  【+用-不用】UseAdaptiveSizePolicy：使用自适应的内存分配策略 
   -  Max TenuringThreshold=15（默认）：表示age==16时晋升至老年代 
      - 对象大小大于To Space可用内存时直接晋升
      - 如果 Survivor 区中相同年龄的所有对象大小的总和占比超过一半，则大于等于该年龄的对象直接晋升
   -  HandlePromotionFailure=true（默认）：空间分配担保，在发生Minor GC之前，检查**老年代最大可用连续空间是否大于新生代所有对象的总空间**，如果大于，则此次Minor GC 是安全的，否则查看HandlePromotionFailure值，如果为false改为执行 Full GC，如果为true，继续检查**老年代最大可用空间是否大于历次晋升老年代对象的平均大小** 
      -  如果大于，执行Minor GC（仍有风险） 
      -  如果小于，执行Full GC 
      -  JDK7以后改为两次检验结果大于有一个成立就 Minor GC，否则Full GC。 
   -  【+用-不用】PrintGCDetails：显示 GC 细节信息(简略版去掉Details) 
   -  【+用-不用】PrintFlagsInitial：查看所有参数的默认初始值 
   -  【+用-不用】PrintFlagsFinal：查看所有参数的最终值 
   -  【+用-不用】UseTLAB：使用 TLAB 
   -  TLABWasteTargetPercent：设置 TLAB 占用 Eden 空间的百分比，默认1% 
   -  【+用-不用】DoEscapeAnalysis：打开逃逸分析（jdk7+默认打开） 
   -  【+用-不用】PrintEscapeAnalysis：查看逃逸分析的筛选结果 
      - 【Error: VM option 'PrintEscapeAnalysis' is notproduct and is available only in debug version of VM.】
   -  【+用-不用】EliminateAllocations：打开标量替换 
   -  MetaspaceSize=20.75M（默认）：设置元空间初始分配空间，建议设置一个较高的值，避免频繁Full GC 
   -  MaxMetaspaceSize：设置元空间最大空间（默认无限制） 
-  jps：查看当前运行中的进程 
-  jinfo 
   - -flag SurvivorRatio 进程id：查看某个进程的某个参数情况

##### 年轻代与老年代

- YoungGen 
   - Eden：几乎所有Java对象都是在这里被 new 出来的，绝大部分（80%）对象的销毁都在新生代进行了
   - survivor 0
   - survivor 1
- OldGen：大对象直接分配到老年代（所以要少创建大对象）

##### GC = Garbage Collection

频繁收集年轻代，较少收集老年代，几乎不动元空间。

- Young GC/Minor GC：对新生代GC。 
   - 在Eden区满时触发，Survivor区满时不触发。
   - 会引发STW，暂停其它用户的线程，直到GC结束才恢复。
- Old GC/Major GC：对老年代GC。 
   - 老年代空间不足时，会先尝试触发Minor GC，如果之后空间还不足，则触发 Major GC，如果还不足就报错：OOM
- Mixed GC：对新生代以及部分老年代GC。只有 G1 GC 会有这种行为，按照 region 小区域划分。
- Full GC：对 Java 整个堆和元空间GC，在开发中应尽量避免。 
   - 调用System.gc()时，系统建议执行Full GC，但不是必然执行
   - 老年代或元空间内存不足
   - 晋升对象大小大于老年代的可用内存

##### 为对象分配内存：TLAB（线程私有  ）

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/e8efe0c31c6f1f2b8d6e6990996efb8b.png)

尽管不是所有对象实例都能在 TLAB 中成功分配内存，但 JVM 确实将 TLAB 作为内存分配的首选。

对象分配优先级：TLAB>Eden区其他空间>老年代

##### 堆不是分配对象的唯一选择

逃逸分析（Escape Analysis）：可以有效减少 Java 程序中同步负载和内存堆分配压力的跨函数全局数据流分析算法。逃逸分析的基本行为就是分析对象动态作用域：当一个对象在方法中被定义，

- 在方法内部使用，则没有逃逸。——可能被优化成栈上分配。
- 被外部方法所引用，则发生逃逸（new 的对象实体在方法外被调用）

标量替换：用对多个标量的操作代替对聚合量的操作。

#### 程序计数器（每个线程拥有）

全称程序计数寄存器（Program Counter Register），也称为程序钩子。用来存储指向下一条指令的地址，由执行引擎读取下一条指令。它是唯一一个在JVM 规范中没有规定任何OOM异常的区域。它并非广义上所指的物理寄存器，而是对物理 PC 寄存器的一种抽象模拟。

#### 🌟虚拟机栈（每个线程拥有）——程序运行

栈帧（Stack Frame），一一对应执行的方法。

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/e0d3206cb0cc82b18754be31d2a1a51f.png)

-  🌟局部变量表 Local Variables 
-  🌟操作数栈 Operand Stack，表达式栈：32bit占一个深度（int），64bit占两个深度（double） 
-  动态链接 Dynamic Linking，指向运行时常量池的方法引用：在 Java 源文件被编译到字节码文件中时，所有的变量和方法引用都作为符号引用保存在 class 文件的常量池里。动态链接的作用就是为了将这些符号引用转换为调用方法的直接引用。 
-  方法返回地址 Return Address：方法正常退出（PC计数器的值，即该方法指令的下一条指令地址）或异常退出（查询异常表）的定义 
-  附加信息 
-  静态链接：编译期可知【早期绑定】 
   - 非虚方法：在编译期就确定了具体的调用版本，这个版本在运行时不可变 
      - invokestatic：static
      - invokespecial：private、final、实例构造器(`<init>` 方法)、父类方法
-  动态链接：编译期未知，运行期可知【晚期绑定】 
   - invokevitual：调用虚方法
   - invokeinterface：调用接口
   - invokedynamic：动态解析方法，然后执行（Lambda表达式的出现使得该指令可以直接生成）

Java 是静态语言，但 Lambda 表达式使它具备动态语言的特点。（invokedynamic）

在字节码文件中，构造器和方法等价。Java 中任何一个puts的方法其实都具备c++中虚函数的特征（多态：允许父类指针指向子类实例），除非用 final 修饰。

变量类型：

- 成员变量 
   - 类变量，prepare阶段默认赋值，initial阶段显式赋值
   - 实例变量，随着对象的创建，在堆空间中分配空间，进行赋值
- 局部变量：必须显式赋值，否则编译不通过

#### 🌟本地方法栈（每个线程拥有）

与 Java 外面的环境交互。

本地方法：一个 Java 程序调用非 Java 代码（比如C）的接口。

### Java 守护线程

- 虚拟机线程：JVM 达到安全点时出现。
- 周期任务线程
- GC 线程
- 编译线程：将字节码编译成本地代码
- 信号调度线程：接收信号


---

> 作者: 都将会  
> URL: https://leni.fun/jvm_draft_1/  

