# 🚩Tomcat




### Tomcat 定义

Tomcat = HTTP 服务器 + Servlet 容器，是一个Web容器

<!--more-->

- HTTP服务器：处理HTTP请求并响应结果
- Servlet容器：将请求转发到具体的Servlet，用来加载和管理业务类

### 访问url的过程
![image.png](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681882713965-53e49ffb-272c-4ab4-9b71-4ae56f85f331.png)

### Servlet
Servlet指的是任何**实现了 Servlet 接口**的类，主要用于处理客户端传来的 HTTP 请求，并返回一个响应。
```java
// 几乎所有的Java Web 框架（如Spring） 都是基于Servlet的封装
public interface Servlet {
    void init(ServletConfig config) throws ServletException;

    ServletConfig getServletConfig();

    // 实现业务逻辑
    void service(ServletRequest req,ServletRespons res) throws ServletException, IOException;
    
    String getServletInfo();

    void destroy();
}
```
![image.png](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681882795916-dbfffa70-fca4-43df-b14b-5c42a7f1eb00.png)
### Tomcat 总体架构
Tomcat 要实现2个核心功能：

1. **处理 Socket 连接**，转化 字节流->Request->Response->字节流
2. 加载和管理Servlet，**处理 Request请求**

![image.png](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681882903482-1a80224e-9fcc-49a0-ae7e-a2a022ef184d.png)

连接器的作用：对Servlet容器通过`ProtocalHandler`屏蔽了协议和IO模型，使得容器获取到的都是一个标准的`ServletRequest`对象
连接器的3个高内聚的功能：`Endpoint``Processo``Adapter`
`Endpoint `：网络通信 socket（TCP/IP）
⬇️字节流⬇️ 
`Processor`：应用层协议解析（HTTP)
⬇️Tomcat Request⬇️
`Adapter`：适配器模式转化 request 和 response
⬇️ServletRequest⬇️
`容器`

![image.png](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681883038066-169662d7-720e-4f85-b23d-b1567f732618.png)

Tomcat中有4种容器，它们是父子关系，从大到小如下：

- Engine：引擎
- Host：虚拟主机/站点【域名】
- Context：Web应用程序【Web应用路径】
- Wrapper： Servlet【Servlet映射的路径】，与一个url请求相对应

![image.png](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681883119278-78eccfdc-fe58-4ff7-8b1d-9b5c24f297ec.png)

Mapper组件：将用户请求的URL定位到一个Servlet，组件中保存了容器组件与访问路径的映射关系

![image.png](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681883284797-418f7499-5cba-424d-95a3-1254fc3f397a.png)



### Java 类加载器

- 引导类加载器 bootstrap：只有它是C++编写，只加载包名为 java、javax、sun等开头的核心类库
   - JAVA_HOME/jre/lib
- 扩展类加载器 ExtClassLoader：派生于 ClassLoader 类
   - JAVA_HOME/jre/lib/ext
- 应用类加载器 AppClassLoader
   - CLASSPATH 或 java.class.path

当解析一个类型到另一个类型的引用的时候，JVM 需要保证这两个类型的类加载器是相同的。
#### 类加载过程

1. **加载 Loading**：.class 文件 -> 类的二进制字节流，生成一个代表这个类的`java.lang.Class` 对象，作为方法区这个类的数据访问入口。
2. **链接 Linking**： 
   1. **验证 Verify**：保证被加载类的正确性，不会危害虚拟机本身。（以 CAFEBABE 开头）
   2. **准备 Prepare**：为变量分配初始值（零），不包括`final static` 修饰的常量，它在编译时就显式初始化了，也不包括实例变量分配初始化，它和对象一起分配到堆中【给类变量默认赋值】
   3. **解析 Resolve**：符号引用 -> 直接引用
3. **初始化 Initialization**：执行类构造器方法`<clinit>()` ，【给类变量显式赋值，即静态代码块赋值】
   1. 口诀：父静子静（初始化），父代父构，子代子构
4. 使用：JVM 从入口方法开始执行
5. 卸载：销毁 class 对象
###  🌟 双亲委派机制
双亲委派机制：加载某个类时，优先交给上级类加载器加载。父类加载器无法完成加载才会还给子类去加载，例如**自定义的String类永远无法执行**，保证了系统的安全性，这就是沙箱安全机制。

- **避免类的重复加载**
- 保护程序安全，**防止核心API被随意篡改**
#### Tomcat 打破双亲委派机制？
目的：优先加载 Web 应用目录下的类。
原因：若使用JVM默认的AppClassLoader加载Web应用，**AppClassLoader只能加载一个Servlet类**，在**加载第二个同名Servlet类**时，AppClassLoader会返回第一个Servlet类的Class实例。 因为在AppClassLoader眼里，同名Servlet类只能被加载一次。
方法：继承ClassLoader抽象类，并重写它的loadClass方法。（因为ClassLoader的默认实现是双亲委派）
Tomcat 类加载器的层次结构

![image.png](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681883413887-b4020d10-83af-40f4-aca1-9ff377bf1068-20230808153736445.png)



1. Web应用之间的类如何隔离？

自定义 `WebAppClassLoader` 类加载器，为每个Web应用创建一个实例。

2. Web应用之间的类如何共享库类？

设计 `SharedClassLoader` 类加载器作为 `WebAppClassLoader` 类加载器的父类，专门来加载 Web 应用之间共享的类，子类加载不到的类会委托父加载器去加载。

3. Tomcat本身的类与Web应用的类如何隔离？

设计 `CatalinaClassLoader` 类加载器，专门加载 Tomcat 自身的类。

4. Tomcat本身的类与Web应用的类如何隔共享数据？

同理，设计 `CommonClassLoader` 作为`CatalinaClassLoader` 和`SharedClassLoader` 的父类。



---

> 作者: 都将会  
> URL: https://leni.fun/tomcat/  

