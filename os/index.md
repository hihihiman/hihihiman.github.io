# 🚩OS - 操作系统




### 进程间通信的方式有哪几种？

1. 无名管道( pipe )：父子进程通信
2. 高级管道(popen)：将另一个程序当做一个新的进程在当前程序进程中启动，则它算是当前程序的子进程
3. 有名管道 (named pipe)：它允许无亲缘关系进程间的通信
4. 消息队列( message queue )：克服了信号传递信息少、管道只能承载无格式字节流以及缓冲区大小受限等缺点。
5. 信号量( semophore )：作为一种锁机制
6. 信号 ( sinal )：用于通知接收进程某个事件已经发生
7. 共享内存( shared memory )：映射一段能被其他进程所访问的内存，这段共享内存由一个进程创建，但多个进程都可以访问
8. 套接字( socket )：可用于不同机器间的进程通信

<!--more-->

### 用户态和核心态的区别？

Linux系统仅采用ring 0 和 ring 3 这2个权限:

- ring 0 权限最高，可以使用所有 C P U 指令集
- ring 3 权限最低，仅能使用常规 C P U 指令集，不能使用操作硬件资源的 C P U 指令集，比如 I O 读写、网卡访问、申请内存都不行。

用户态与内核态的概念就是C P U 指令集权限的区别，进程中要读写 I O，必然会用到 ring 0 级别的 C P U 指令集，而此时 C P U 的指令集操作权限只有 ring 3，为了可以操作ring 0 级别的 C P U 指令集， C P U 切换指令集操作权限级别为 ring 0，C P U再执行相应的ring 0 级别的 C P U 指令集（内核代码），执行的内核代码会使用当前进程的内核栈。


---

> 作者: 都将会  
> URL: https://leni.fun/os/  
