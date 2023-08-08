# 🚩Spring




### 🌟AOP（Aspect Oriented Programming）面向切面编程

<!--more-->

作用：在不惊动原始设计的基础上为其进行功能**增强**。（无侵入式）
#### AOP 基本概念
在 pom.xml 中导入 aspectjweaver ，配置 @EnableAspectJAutoProxy

-  连接点（JoinPoint）：方法【可利用的机会】 
-  切入点（PointCut）：是连接点的子集，要追加功能的方法 【解决了切面编程中的 Where 问题，让程序可以知道哪些机会点可以应用某个切面动作】
   - [@Pointcut("execution(void ](/Pointcut() com.dao.xxxDao.update())") 修饰的方法 pt() 
-  通知（Advice）：有共性的功能 【明确了切面编程中的 What，也就是做什么；同时通过指定 Before、After 或者 Around，定义了 When，也就是什么时候做。】
   -  @Before("pt()") 
      - 形参：JoinPoint
   -  @After("pt()") 
   -  @Around  ("pt()") public void around(**ProceedingJoinPoint** pjp) throws Throwable{ pjp.proceed();} （重点，常用） 
      -  形参：ProceedingJoinPoint（必须放在参数的第一位） 
      -  要注意返回值和原始方法一致。 
      -  如果不执行pjp.proceed()，可以实现对原始方法的隔离（权限校验） 
```java
@Component
@Aspect
public class ProjectAdvice{
  @Pointcut("execution(* com.edu.zjut.service.*Service.*(..))")
  private void servicePt(){}
  
  @Around("ProjectAdvice.servicePt()")
  public void runSpeed(ProceedingJoinPoint pjp) throws Throwable{
    Signature signature = pjp.getSignature();
    String className = signature.getDeclaringTypeNmae();
    String methodName = signature.getName();
    long start = System.currentTimeMillis();
    for(int i=0;i<10000;i++){
      pjp.proceed();
    }
    long end = System.currentTimeMillis();
    System.out.println("业务层接口万次执行"+ className + "." + methodName + "------>" + (end-start)+"ms");
  }
}
```

   -  AfterReturning("pt()") 只有不抛异常才运行 
   -  AfterThrowing("pt()")只有抛异常才运行 
-  切面（Aspect）：通知和切入点的联系（多对多） 
-  通知类：定义通知的类 
   - [@Aspect ](/Aspect ) 
#### AOP 工作流程
AOP的本质是**代理模式**

1. Spring容器启动
2. 读取切面中配置的切入点
3. 初始化bean，若类中方法匹配到切入点，则创建**代理对象**
4. 获取bean执行方法
#### 切入点表达式
标准格式：`execution(返回值 包.类.接口（推荐）/实现类.方法())`
通配符：`*`匹配任意符号，`..匹配多个连续的任意符号，如：`execution(_ _.._Service+._(..))`匹配业务层所有接口
书写技巧：

1. 所有类命名需规范，否则以下失效
2. 描述切入点通常描述接口，而不描述实现类
3. 增删改类使用精准类型加速匹配，查询类使用*通配快速描述
4. 方法名以动词进行精准匹配
5. 包名书写尽量不使用 .. 匹配，效率太低，常用 * 做单个包描述匹配
6. 不使用异常作为匹配规则
### 什么是动态代理？
动态代理是一种方便运行时动态构建代理、动态处理代理方法调用的机制，很多场景都是利用类似机制做到的，比如用来包装 RPC 调用、面向切面的编程（AOP），有两种实现：

- **JDK：实现接口**，运用反射。如果目标对象实现了至少一个接口，Spring AOP将使用JDK动态代理来生成代理对象。代理对象实现了与目标对象相同的接口，并在方法调用前后织入切面逻辑。JDK动态代理是通过java.lang.reflect.Proxy类和java.lang.reflect.InvocationHandler接口实现的。
- **cglib：修改字节码**，生成子类。如果目标对象没有实现任何接口，Spring AOP将使用CGLIB库生成代理对象。CGLIB代理通过继承目标对象的子类来生成代理对象，然后在子类中织入切面逻辑。CGLIB代理可以处理没有接口的目标对象。
   - 基于 **ASM，可以直接产生二进制 class 文件**，也可以在类被加载入 Java 虚拟机之前动态改变类行为
### Spring 事务

- 编程式：TransactionTemplate 对业务有侵入性，少用。
- 声明式：@EnableTransactionManagement + @TranSactional
   - 通过 AOP 将事务处理的功能编织到拦截的方法中（方法前开启事务，方法后酌情回滚）
#### 事务失效场景

1. 异常捕获 => 在 catch 中 throw 异常
2. 抛出检查异常 => 指定 rollbackfor，因为默认只回滚非检查异常
3. 非 public 方法
### 循环依赖如何解决？三级缓存 or @lazy
三级缓存只能解决初始化过程中的循环依赖：

- 一级 singletonObjects：单例池，存放已初始化完成的 bean
- 二级 earlySingletonObjects：存放生命周期未走完的 bean
- 三级 singletonFactories：对象工厂，用来创建对象

对于构造方法中的循环依赖，采用 @lazy 进行懒加载
### Spring Cloud 是如何调用的？

1.  RestTemplate方式调用 
   1. 注入 RestTemplate 的bean，添加@Bean注解
   2. 调用 `.getForObject()` 或 `.postForObject()` 方法
2.  Feign方式调用 
   1.  添加 pom 依赖 
   2.  启动类添加 [@EnableFeignClients ](/EnableFeignClients ) 注解  
   3.  写接口： 
```java
@FeignClient("userservice")
public interface UserClient{
  @GetMapping("/user/{id}")
  User findById(@PathVariable("id") Long id);
}
```

   4.  使用 FeignClient 中定义的方法取代 RestTemplate（并集成了 ribbon，实现了负载均衡）
      IRule 接口决定负载均衡策略，并选择某个服务： 
      1. **ZoneAvoidanceRule**（默认）：对Zone区域内多个服务轮询，zone值可配置
      2. RoundRobinRule：轮询
      3. WeightedResponseTimeRule：服务响应时间越长，服务器权重就越小，概率就越低
      4. RandomRule：随机
### SpringMVC 执行流程？
与 DispatcherServlet（前端控制器） 依次交互的有：

- HandlerMapping （处理器映射器）：找到类名#方法名
- HandlerAdaptor（适配器）：处理参数、返回值
- ViewResolver（视图解析器，用于 JSP）：逻辑视图 -> 视图

对于前后端分离项目，在方法上添加 @ResponseBody，通过 HttpMessageConverter 响应 JSON 数据
@RestController = @Controller + @ResponseBody

### JWT
#### JWT 数据结构？

- head
- payload
   - 用户信息
   - 加密信息
   - 过期时间
- signature
#### JWT 和 token 的区别？
token 需要查数据库，JWT 不需要。
#### security和jwt怎么融合？

- 认证：主要 jwt 的 token 实现
- 鉴权：springSecurity实现，RBAC = Role-Based Access Control
#### 从cookie到jwt解决了什么？

1. 可以转化为 json 串，可读性强；
2. RESTful 设计原则，避免在服务端保存会话状态，降低了服务器端的负担；
3. 签名机制，安全性强。
#### token 泄露怎么处理？
采用非对称加密：给前端一个公钥，加密数据传到后台，用私钥解密后处理数据。
### Springboot的自动装配原理？
#### @SpringbootApplication

- @SpringBootConfiguration 声明当前类为配置类
- @ComponentScan 组件扫描
- @EnableAutoConfiguration 自动化配置
   - @Import 读取了项目和项目引用的 jar 包，位于 classpath 路径下 META-INF/spring.factories 文件
   - @ConditionalOnClass 有则加载
#### 注入方式
对于引用类型：

1. 按类型 byType（推荐）：[**@Autowired **](/Autowired )** ** 使用的是暴力反射，不需要 setter方法
2. 按名称 byName（变量名与配置耦合，不推荐） 
   1. [@Autowired ](/Autowired ) + @Qualifier("beanName ") 
   2. @Resource("名称")
3. 按构造方法（不常用）

对于简单属性：使用 @Value("xxx")注入，可以来自外部 property，写法：`@Value("${name}")`
加载外部properties 使用 @PropertySource("classpath:jdbc.properties")，不可以使用星号`*`


### 谈谈Spring Bean的生命周期和作用域？
#### 生命周期

1. 实例化（Instantiation）：在这个阶段，Spring 会使用配置元数据（XML、注解或Java配置）来创建 Bean 的实例。这通常是通过调用构造函数来完成的。
2. 属性赋值（Population）：在实例化之后，Spring 将会通过依赖注入（Dependency Injection）或属性赋值的方式来设置 Bean 的属性和依赖。这可以通过 setter 方法注入或使用字段注入来实现。
3. 初始化（Initialization）：在属性赋值完成后，Spring 将会调用 Bean 的初始化回调方法（如果有的话）。开发者可以在 Bean 中定义初始化方法，使用 @PostConstruct 注解或实现 InitializingBean 接口来指定初始化逻辑。
4. 使用（In Use）：在初始化完成后，Bean 可以被正常使用。此时，Bean 处于活动状态，可以被其他组件或者应用程序使用。
5. 销毁（Destruction）：当应用程序关闭或者不再需要某个 Bean 时，Spring 会调用销毁回调方法来进行资源释放或清理操作。开发者可以在 Bean 中定义销毁方法，使用 @PreDestroy 注解或实现 DisposableBean 接口来指定销毁逻辑。

使用模版方法设计模式实现：

1. 实例化 Bean：首先，Spring会实例化 Bean，即创建 Bean 的对象。
2. Aware接口回调：如果 Bean 实现了任何 Aware 接口（例如 BeanNameAware、BeanFactoryAware、ApplicationContextAware），在实例化之后但在属性赋值之前，Spring会调用相应的 Aware 接口回调方法，将相关的引用或资源传递给 Bean。
3. 属性赋值：在 Aware 接口回调之后，Spring会进行属性赋值（依赖注入），将配置或注入的属性值设置到 Bean 中。
4. BeanPostProcessor前置处理：在属性赋值之后，Spring会调用所有注册的 BeanPostProcessor 的 postProcessBeforeInitialization 方法，允许开发者在 Bean 的初始化之前进行自定义处理。
5. 初始化方法调用：如果 Bean 定义了初始化方法（例如通过 @PostConstruct 注解或实现 InitializingBean 接口），在前置处理之后，Spring会调用初始化方法。
6. BeanPostProcessor后置处理：在初始化方法调用之后，Spring会再次调用所有注册的 BeanPostProcessor 的 postProcessAfterInitialization 方法，允许开发者在 Bean 的初始化之后进行自定义处理。
7. Bean 可用：此时，Bean已经完成了初始化过程，可以正常使用。
#### 五个作用域
其中最基础的有下面两种：

1. Singleton，这是 Spring 的默认作用域，也就是为每个 IOC 容器创建唯一的一个 Bean 实例。【适合无状态】
2. Prototype，针对每个 getBean 请求，容器都会单独创建一个 Bean 实例。【适合有状态】

如果是 Web 容器：

1. Request，为每个 HTTP 请求创建单独的 Bean 实例。
2. Session，很显然 Bean 实例的作用域是 Session 范围。
3. GlobalSession，用于 Portlet 容器，因为每个 Portlet 有单独的 Session，GlobalSession 提供一个全局性的 HTTP Session。
### IoC（Inversion of Control）控制反转
使用对象时，不再通过 new 产生对象，创建控制权由程序转移到**外部**的IoC容器（ApplicationContext，接口）
bean 之间的依赖注入方式

1. setter注入（建议）：更加灵活，可以在对象创建以后动态更改依赖关系
2. 构造方法注入：一旦创建完成，依赖关系就不能再改变

### Q：拦截器（Interceptor）与过滤器（Filter）的区别？

A：

- 归属不同：Filter属于Servlet技术，Interceptor属于SpringMVC技术
- 拦截内容不同：Filter对所有访问进行增强，Interceptor仅针对SpringMVC的访问进行增强

#### 执行流程

1. preHandle（return true 才走下一步，false结束）
2. controller
3. postHandle
4. AfterCompletion

#### 拦截器（Interceptor）

是一种动态拦截方法调用的机制，作用：

1. 在指定的方法调用前后执行预先设定的代码
2. 组织原始方法的执行

```java
// preHandle 方法中可以根据返回值决定是否继续执行方法
// 并且可以通过反射拿到拦截方法，进行更多操作
HandlerMethod hm = (HandlerMethod) handler;
hm.getMethod();
```

#### 拦截器链

preHandle在前的拦截器，postHandle 和 afterCompletion 在后。

- 123 都为 true：pre 123 -> controller -> post 321 -> after 321
- 12 true 3 false：pre12 -> after 21
- 13 true 2 false： pre1  -> after 1
- 23 true 1 false：都不执行

### 全局异常处理

表现层通过AOP处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(value = Exception.class)
    public CommonResult handleUnknownException(Exception e) {
        return CommonResult.failed(ResultCode.UNKN0OWN_FAILED,"系统繁忙，请稍后再试！");
    }
}
```

- 业务异常：提醒用户规范操作
- 系统异常：安抚用户，通知运维，记录日志

### REST风格（Representational State Transfer）表现形式状态转换

资源名称采用复数，如users、books

- GET：查询
- POST：新增
- PUT：修改
- DELETE：删除

### Q：如何避免Spring加载SpringMVC已加载的Controller？

A：加载Spring控制的bean的时候，排除掉SpringMVC控制的bean。

1. `@ComponentScan(value = "edu.zjut",excludeFilters=@ComponentScan.Filter(type=FilterType.ANNOTATION,classes=Controller.class))`按照注解排除
2. `@ComponentScan({"edu.zjut.service","edu.zjut.dao"})`
3. 不区分Spring和SpringMVC的环境，都加载

### 参数传递

- @RequestParam("xxx")：请求参数和形参不同时需配置，不写的话默认取相同。
- [@RequestParam ]() 修饰 List 就可以实现集合传参。 
- 参数对象中有对象时采用 `address.city=beijing` 这种形式。
- @RequestBody：设置controller方法返回值为响应体。传字符串（json）用 

- - HttpMessageConverter

- 日期参数：接收可以用 Date 接，加上 [@DateTimeFormat(pattern ]() = "yyyy-MM-dd") 
- [@PathVariable ]() 从路径中取值 

### SpringMVC

基于 Java 实现 MVC 模型的轻量级 web 框架。

后端服务器：

- 表现层：SpringMVC（取代 Servlet），封装数据（code、msg、data），用postman测试
- 业务层：Spring，用JUnit测试 

- - @RunWith(SpringJUnit4ClassRunner.class)
  - [@ContextConfiguration(classes ]() = SpringConfig.class) 

- 数据层：Mybatis

返回 json 数据，需要加 [@ResponseBody ]() 注解。 

### 🌟Q：如何保证无论转账是否成功都记录日志留痕？

A：日志对应的事务不要加入转账的事务中，在插入日志的方法上加上 `@Transactional(propagation = Propagation.REQUIRES_NEW)`

事务传播行为：作为协调员，

- REQUIRED（默认）：事务管理员有事务就加入，没事务就新建
- REQUIRED_NEW：无论如何都新建事务
- SUPPORTS：事务管理员有事务就加入，没有就算了
- NOT_SUPPORTS：无乱如何都不支持事务
- MANDATORY：事务管理员有事务就加入，没有就报错
- NEVER：事务管理员没事务没关系，有事务就报错
- NESTED：设置 savePoint


---

> 作者: 都将会  
> URL: https://leni.fun/spring/  

