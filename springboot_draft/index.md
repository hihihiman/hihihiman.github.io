# SpringBoot 杂记


<!--more-->

## 配置

### 包扫描

```
com
  +- example
    +- myproject
      +- Application.java
      |
      +- domain
      |  +- Customer.java
      |  +- CustomerRepository.java
      |
      +- service
      |  +- CustomerService.java
      |
    +- web
    |  +- CustomerController.java
    |
```

1. [@ComponentScan ](/ComponentScan ) 

```java
@SpringBootApplication
@ComponentScan(basePackages="com.example")
public class Bootstrap {    
  public static void main(String[] args) {
    SpringApplication.run(Bootstrap.class, args);   
  }
}
```

2. [@Bean ](/Bean ) 

```java
@SpringBootApplication
public class Bootstrap {
    public static void main(String[] args) {
        SpringApplication.run(Bootstrap.class, args);
    }
    @Bean
    public CustomerController customerController() {
        return new CustomerController();
    }
}
```

### YAML  /ˈjæməl/

```yaml
spring:  
  jpa:    
    databaseplatform: mysql    
    database-platform: mysql    
    databasePlatform: mysql    
    database_platform: mysql
    # 以上等价
```

**推荐使用全小写配合**`**-**`**分隔符的方式来配置**，比如：`spring.jpa.database-platform=mysql`

### List、Map类型

```yaml
spring:
  my-example1:
  	key: value
    url:      
      - http://example.com      
      - http://spring.io
      
  my-example2:
    url: http://example.com, http://spring.io
    '[key.me]': value
```

**如果Map类型的key包含非字母数字和**`**-**`**的字符，需要用**`**[]**`**括起来**

### 随机数

```properties
# 随机字符串
com.didispace.blog.value=${random.value}
# 随机int
com.didispace.blog.number=${random.int}
# 随机long
com.didispace.blog.bignumber=${random.long}
# 10以内的随机数
com.didispace.blog.test1=${random.int(10)}
# 10-20的随机数
com.didispace.blog.test2=${random.int[10,20]}
```

### 命令行参数

`java -jar xxx.jar --server.port=8888`

等价于我们在`application.properties`中添加属性`server.port=8888`

### 多环境配置

- `application-dev.properties`：开发环境
- `application-test.properties`：测试环境
- `application-prod.properties`：生产环境

通过`spring.profiles.active`属性来配置（如：`spring.profiles.active=test`）

### 绑定 API

假设在propertes配置中有这样一个配置：`com.didispace.foo=bar`

我们为它创建对应的配置类：

```java
@Data
@ConfigurationProperties(prefix = "com.didispace")
public class FooProperties {

    private String foo;

}
```

接下来，通过最新的`Binder`就可以这样来拿配置信息了：

```java
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        ApplicationContext context = SpringApplication.run(Application.class, args);
        Binder binder = Binder.get(context.getEnvironment());

        // 绑定简单配置
        FooProperties foo = binder.bind("com.didispace", Bindable.of(FooProperties.class)).get();
        System.out.println(foo.getFoo());
    }
}
```

## 关系型数据库

Spring Boot提供自动配置的嵌入式数据库有H2、HSQL、Derby，你不需要提供任何连接配置就能使用。

### JPA = Java Persistence API

**通过解析方法名创建查询**

### JTA = Java Transaction API

JTA事务比JDBC事务更强大。一个JTA事务可以有多个参与者，而一个JDBC事务则被限定在一个单一的数据库连接。所以，当我们在同时操作多个数据库的时候，使用JTA事务就可以弥补JDBC事务的不足。

### 单元测试

- 插入一条name=AAA，age=20的记录，然后根据name=AAA查询，并判断age是否为20
- 测试结束回滚数据，保证测试单元每次运行的数据环境独立

```java
@Slf4j
@RunWith(SpringRunner.class)
@SpringBootTest
public class Chapter35ApplicationTests {

    @Autowired
    private UserMapper userMapper;

    @Test
    @Rollback
    public void test() throws Exception {
        userMapper.insert("AAA", 20);
        User u = userMapper.findByName("AAA");
        Assert.assertEquals(20, u.getAge().intValue());
    }

}
```

通常我们单元测试为了保证每个测试之间的数据独立，会使用`@Rollback`注解让每个单元测试都能在结束时回滚。而真正在开发业务逻辑时，我们通常在service层接口中使用`@Transactional`来对各个业务逻辑进行事务管理的配置。

#### @Transactional注解不生效？

1.  注解修饰的函数中`catch`了异常，并没有往方法外抛。 
2.  `@Transactional`注解修饰的函数不是`public`类型 
3.  对应数据库使用的存储引擎不支持事务，比如：MyISAM。 
4.  数据源没有配置事务管理器 

### 事务隔离级别

隔离级别是指若干个并发的事务之间的隔离程度，与我们开发时候主要相关的场景包括：脏读取、重复读、幻读。

我们可以看`org.springframework.transaction.annotation.Isolation`枚举类中定义了五个表示隔离级别的值：

```java
public enum Isolation {
    DEFAULT(-1),
    READ_UNCOMMITTED(1),
    READ_COMMITTED(2),
    REPEATABLE_READ(4),
    SERIALIZABLE(8);
}
```

- `DEFAULT`：这是默认值，表示使用底层数据库的默认隔离级别。对大部分数据库而言，通常这值就是：`READ_COMMITTED`。
- `READ_UNCOMMITTED`：该隔离级别表示一个事务可以读取另一个事务修改但还没有提交的数据。该级别不能防止脏读和不可重复读，因此很少使用该隔离级别。
- `READ_COMMITTED`：该隔离级别表示一个事务只能读取另一个事务已经提交的数据。该级别可以防止脏读，这也是大多数情况下的推荐值。
- `REPEATABLE_READ`：该隔离级别表示一个事务在整个过程中可以多次重复执行某个查询，并且每次返回的记录都相同。即使在多次查询之间有新增的数据满足该查询，这些新增的记录也会被忽略。该级别可以防止脏读和不可重复读。
- `SERIALIZABLE`：所有的事务依次逐个执行，这样事务之间就完全不可能产生干扰，也就是说，该级别可以防止脏读、不可重复读以及幻读。但是这将严重影响程序的性能。通常情况下也不会用到该级别。

指定方法：通过使用`isolation`属性设置，例如：

```java
@Transactional(isolation = Isolation.DEFAULT)
```

### 传播行为

所谓事务的传播行为是指，如果在开始当前事务之前，一个事务上下文已经存在，此时有若干选项可以指定一个事务性方法的执行行为。

我们可以看`org.springframework.transaction.annotation.Propagation`枚举类中定义了6个表示传播行为的枚举值：

```java
public enum Propagation {
    REQUIRED(0),
    SUPPORTS(1),
    MANDATORY(2),
    REQUIRES_NEW(3),
    NOT_SUPPORTED(4),
    NEVER(5),
    NESTED(6);
}
```

- `REQUIRED`：如果当前存在事务，则加入该事务；如果当前没有事务，则创建一个新的事务。
- `SUPPORTS`：如果当前存在事务，则加入该事务；如果当前没有事务，则以非事务的方式继续运行。
- `MANDATORY`：如果当前存在事务，则加入该事务；如果当前没有事务，则抛出异常。
- `REQUIRES_NEW`：创建一个新的事务，如果当前存在事务，则把当前事务挂起。
- `NOT_SUPPORTED`：以非事务方式运行，如果当前存在事务，则把当前事务挂起。
- `NEVER`：以非事务方式运行，如果当前存在事务，则抛出异常。
- `NESTED`：如果当前存在事务，则创建一个事务作为当前事务的嵌套事务来运行；如果当前没有事务，则该取值等价于`REQUIRED`。

指定方法：通过使用`propagation`属性设置，例如：

```java
@Transactional(propagation = Propagation.REQUIRED)
```

### Flyway

Flyway是一个简单开源数据库版本控制器（约定大于配置），主要提供migrate、clean、info、validate、baseline、repair等命令。它支持SQL（PL/SQL、T-SQL）方式和Java方式，支持命令行客户端等，还提供一系列的插件支持（Maven、Gradle、SBT、ANT等）。

官方网站：[https://flywaydb.org/](https://flywaydb.org/)

### Mybatis

#### 使用[@Param ](/Param ) 

在之前的整合示例中我们已经使用了这种最简单的传参方式，如下：

```java
@Insert("INSERT INTO USER(NAME, AGE) VALUES(#{name}, #{age})")
int insert(@Param("name") String name, @Param("age") Integer age);
```

这种方式很好理解，`@Param`中定义的`name`对应了SQL中的`#{name}`，`age`对应了SQL中的`#{age}`。

#### 使用Map

如下代码，通过`Map<String, Object>`对象来作为传递参数的容器：

```
@Insert("INSERT INTO USER(NAME, AGE) VALUES(#{name,jdbcType=VARCHAR}, #{age,jdbcType=INTEGER})")
int insertByMap(Map<String, Object> map);
```

对于Insert语句中需要的参数，我们只需要在map中填入同名的内容即可，具体如下面代码所示：

```java
Map<String, Object> map = new HashMap<>();
map.put("name", "CCC");
map.put("age", 40);
userMapper.insertByMap(map);
```

#### 包扫描

```java
@MapperScan("com.didispace.chapter36.mapper")
```

### Lombok

1. `Val`可以将变量申明是final类型。

```java
public   static void main(String[] args) {

    val setVar = new HashSet<String>();
    val listsVar = new   ArrayList<String>();
    val mapVar = new HashMap<String,   String>();

    //=>上面代码相当于如下：
    final Set<String> setVar2 = new   HashSet<>();
    final List<String> listsVar2 = new   ArrayList<>();
    final Map<String, String> maps2 =   new HashMap<>();

}
```

2. `@NonNull`注解能够为方法或构造函数的参数提供非空检查。

```java
public void notNullExample(@NonNull String string) {
    //方法内的代码
}

//=>上面代码相当于如下：

public void notNullExample(String string) {
    if (string != null) {
        //方法内的代码相当于如下：
    } else {
        throw new NullPointerException("null");
    }
}
```

3. `@Cleanup`注解能够自动释放资源。

```
public   void jedisExample(String[] args) {
    try {
        @Cleanup Jedis jedis =   redisService.getJedis();
    } catch (Exception ex) {
        logger.error(“Jedis异常:”,ex)
    }

    //=>上面代码相当于如下：
    Jedis jedis= null;
    try {
        jedis = redisService.getJedis();
    } catch (Exception e) {
        logger.error(“Jedis异常:”,ex)
    } finally {
        if (jedis != null) {
            try {
                jedis.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
```

4. `@Synchronized`注解类似Java中的Synchronized 关键字，但是可以隐藏同步锁。

```java
public class SynchronizedExample { 

 private final Object readLock = new   Object(); 

 @Synchronized 
 public static void hello() { 
     System.out.println("world");   
 } 

 @Synchronized("readLock") 
 public void foo() { 
   System.out.println("bar"); 
 } 

//上面代码相当于如下：

 public class SynchronizedExample { 

  private static final Object $LOCK = new   Object[0]; 
  private final Object readLock = new   Object(); 

  public static void hello() { 
    synchronized($LOCK) { 
      System.out.println("world"); 
    } 
  }   

  public void foo() { 
    synchronized(readLock) { 
        System.out.println("bar");   
    } 
  } 

}
```

### PostgreSQL

PostgreSQL是一种特性非常齐全的自由软件的对象-关系型数据库管理系统（ORDBMS），是以加州大学计算机系开发的POSTGRES，4.2版本为基础的对象关系型数据库管理系统。

- 支持存储一些特殊的数据类型，比如：array、json、jsonb
- 对地理信息的存储与处理有更好的支持，所以它可以成为一个空间数据库，更好的管理数据测量和几何拓扑分析
- 可以快速构建REST API，通过PostgREST可以方便的为任何PostgreSQL数据库提供RESTful API的服务
- 支持树状结构，可以更方便的处理具备此类特性的数据存储
- 外部数据源支持，可以把MySQL、Oracle、CSV、Hadoop等当成自己数据库中的表来进行查询
- 对索引的支持更强，PostgreSQL支持 B-树、哈希、R-树和 Gist 索引。而MySQL取决于存储引擎。MyISAM：BTREE，InnoDB：BTREE。
- 事务隔离更好，MySQL 的事务隔离级别repeatable read并不能阻止常见的并发更新，得加锁才可以，但悲观锁会影响性能，手动实现乐观锁又复杂。而 PostgreSQL 的列里有隐藏的乐观锁 version 字段，默认的 repeatable read 级别就能保证并发更新的正确性，并且又有乐观锁的性能。
- 时间精度更高，可以精确到秒以下
- 字符支持更好，MySQL里需要utf8mb4才能显示emoji，PostgreSQL没这个坑
- 存储方式支持更大的数据量，PostgreSQL主表采用堆表存放，MySQL采用索引组织表，能够支持比MySQL更大的数据量。
- 序列支持更好，MySQL不支持多个表从同一个序列中取id，而PostgreSQL可以
- 增加列更简单，MySQL表增加列，基本上是重建表和索引，会花很长时间。PostgreSQL表增加列，只是在数据字典中增加表定义，不会重建表。

## 缓存 NoSQL

### 引入缓存

第一步：在`pom.xml`中引入cache依赖，添加如下内容：

```java
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
```

第二步：在Spring Boot主类中增加`@EnableCaching`注解开启缓存功能，如下：

```java
@EnableCaching
@SpringBootApplication
public class Chapter51Application {

	public static void main(String[] args) {
		SpringApplication.run(Chapter51Application.class, args);
	}

}
```

第三步：在数据访问接口中，增加缓存配置注解，如：

```java
@CacheConfig(cacheNames = "users")
public interface UserRepository extends JpaRepository<User, Long> {

    @Cacheable
    User findByName(String name);

}
```

### Redis

发布订阅模式比观察者模式多了一个中间层。

### MongoDB

MongoDB是一个基于分布式文件存储的数据库，它是一个介于关系数据库和非关系数据库之间的产品，其主要目标是在键/值存储方式（提供了高性能和高度伸缩性）和传统的RDBMS系统（具有丰富的功能）之间架起一座桥梁，它集两者的优势于一身。

MongoDB支持的数据结构非常松散，是类似json的bson格式，因此可以存储比较复杂的数据类型，也因为他的存储格式也使得它所存储的数据在Nodejs程序应用中使用非常流畅。

较常见的，我们可以直接用MongoDB来存储键值对类型的数据，如：验证码、Session等；由于MongoDB的横向扩展能力，也可以用来存储数据规模会在未来变的非常巨大的数据，如：日志、评论等；由于MongoDB存储数据的弱类型，也可以用来存储一些多变json数据，如：与外系统交互时经常变化的JSON报文。而对于一些对数据有复杂的高事务性要求的操作，如：账户交易等就不适合使用MongoDB来存储。

### LDAP = Lightweight Directory Access Protocol

轻量级目录访问协议是实现提供被称为目录服务的信息服务。目录服务是一种特殊的数据库系统，其专门针对读取，浏览和搜索操作进行了特定的优化。目录一般用来包含描述性的，基于属性的信息并支持精细复杂的过滤能力。目录一般不支持通用数据库针对大量更新操作操作需要的复杂的事务管理或回卷策略。而目录服务的更新则一般都非常简单。这种目录可以存储包括个人信息、web链结、jpeg图像等各种信息。为了访问存储在目录中的信息，就需要使用运行在TCP/IP 之上的访问协议—LDAP。

- o：organization（组织-公司）
- ou：organization unit（组织单元-部门）
- c：countryName（国家）
- dc：domainComponent（域名）
- sn：surname（姓氏）
- cn：common name（常用名称）

### 时序数据库InfluxDB

时间序列数据库主要用于指处理带时间标签（按照时间的顺序变化，即时间序列化）的数据，带时间标签的数据也称为时间序列数据。
时间序列数据主要由电力行业、化工行业等各类型实时监测、检查与分析设备所采集、产生的数据，这些工业数据的典型特点是：产生频率快（每一个监测点一秒钟内可产生多条数据）、严重依赖于采集时间（每一条数据均要求对应唯一的时间）、测点多信息量大（常规的实时监测系统均有成千上万的监测点，监测点每秒钟都产生数据，每天产生几十GB的数据量）

几个重要名词：

- database：数据库
- measurement：类似于关系数据库中的table（表）
- points：类似于关系数据库中的row（一行数据） 
   - time：时间戳
   - fields：记录的值
   - tags：索引的属性

## Web 开发

### Thymeleaf

它是一个XML/XHTML/HTML5模板引擎，可用于Web与非Web环境中的应用开发。它是一个开源的Java库，基于Apache License 2.0许可，由Daniel Fernández创建，该作者还是Java加密库Jasypt的作者。

Thymeleaf提供了一个用于整合Spring MVC的可选模块，在应用开发中，你可以使用Thymeleaf来完全代替JSP或其他模板引擎，如Velocity、FreeMarker等。Thymeleaf的主要目标在于提供一种可被浏览器正确显示的、格式良好的模板创建方式，因此也可以用作静态建模。你可以使用它创建经过验证的XML与HTML模板。相对于编写逻辑或代码，开发者只需将标签属性添加到模板中即可。接下来，这些标签属性就会在DOM（文档对象模型）上执行预先制定好的逻辑。

### 单元测试

入门例子

```java
@SpringBootTest
public class Chapter11ApplicationTests {

    private MockMvc mvc;

    @Before
    public void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new HelloController()).build();
    }

    @Test
    public void getHello() throws Exception {
        mvc.perform(MockMvcRequestBuilders.get("/hello").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string(equalTo("Hello World")));
    }

}
```

对于文件上传接口，本质上还是http请求的处理，所以MockMvc依然逃不掉，就是上传内容发生了改变，我们只需要去找一下文件上传的模拟对象是哪个，就可以轻松完成这个任务。具体写法如下：

```java
@SpringBootTest(classes = Chapter43Application.class)
public class FileTest {

    @Autowired
    protected WebApplicationContext context;
    protected MockMvc mvc;

    @BeforeEach
    public void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    public void uploadFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "hello.txt",
                MediaType.TEXT_PLAIN_VALUE,
                "Hello, World!".getBytes()
        );

        final MvcResult result = mvc.perform(
                MockMvcRequestBuilders
                        .multipart("/upload")
                        .file(file))
                .andDo(print())
                .andExpect(status().isOk())
                .andReturn();
    }

}
```

可以看到MockMvc的测试主体是不变的，无非就是请求类型和请求内容发生了改变。

### 定时任务

#### Springboot自带的[@Scheduled ](/Scheduled ) 

- 在Spring Boot的主类中加入`@EnableScheduling`注解，启用定时任务的配置

```java
@SpringBootApplication
@EnableScheduling
public class Application {
	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
}
```

- 创建定时任务实现类

```java
@Component
public class ScheduledTasks {
    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm:ss");
    @Scheduled(fixedRate = 5000)
    public void reportCurrentTime() {
        log.info("现在时间：" + dateFormat.format(new Date()));
    }
}
```

这种模式实现的定时任务缺少在集群环境下的协调机制。解决这样问题的方式很多种，比较通用的就是采用**分布式锁**的方式，让同类任务之前的时候以分布式锁的方式来控制执行顺序，比如：使用Redis、Zookeeper等具备分布式锁功能的中间件配合就能很好的帮助我们来协调这类任务在集群模式下的执行规则。

#### 

#### Elastic Job

Elastic Job的前生是当当开源的一款分布式任务调度框架，而目前已经加入到了Apache基金会。

1. `pom.xml`中添加elasticjob-lite的starter

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.shardingsphere.elasticjob</groupId>
        <artifactId>elasticjob-lite-spring-boot-starter</artifactId>
        <version>3.0.0</version>
    </dependency>

    // ...
</dependencies>
```

2. 创建一个简单任务

```java
@Slf4j
@Service
public class MySimpleJob implements SimpleJob {

    @Override
    public void execute(ShardingContext context) {
        log.info("MySimpleJob start : didispace.com {}", System.currentTimeMillis());
    }

}
```

3. 编辑配置文件 (properties)

```properties
elasticjob.reg-center.server-lists=localhost:2181
elasticjob.reg-center.namespace=${spring.application.name}

elasticjob.jobs.my-simple-job.elastic-job-class=com.didispace.chapter72.MySimpleJob
elasticjob.jobs.my-simple-job.cron=0/5 * * * * ?
elasticjob.jobs.my-simple-job.sharding-total-count=1
```

这里主要有两个部分：

第一部分：`elasticjob.reg-center`开头的，主要配置elastic job的注册中心和namespace

第二部分：任务配置，以`elasticjob.jobs`开头，这里的`my-simple-job`是任务的名称，根据你的喜好命名即可，但不要重复。任务的下的配置`elastic-job-class`是任务的实现类，`cron`是执行规则表达式，`sharding-total-count`是任务分片的总数。我们可以通过这个参数来把任务切分，实现并行处理。由于我们设置了分片总数为1，所以这个任务启动之后，只会有一个实例接管执行。这样就避免了多个进行同时重复的执行相同逻辑而产生问题的情况。同时，这样也支持了任务执行的高可用。

在整个实现过程中，我们并没有自己手工的去编写任何的分布式锁等代码去实现任务调度逻辑，只需要关注任务逻辑本身，然后通过配置分片的方式来控制任务的分割，就可以轻松的实现分布式集群环境下的定时任务管理了。

### 异步任务

为了让@Async注解能够生效，需要在Spring Boot的主程序中配置[@EnableAsync ](/EnableAsync ) 

[@Async ](/Async ) 所修饰的函数不要定义为static类型，这样异步调用不会生效 

#### 异步回调

```java
@Test
public void test() throws Exception {
    long start = System.currentTimeMillis();

    CompletableFuture<String> task1 = asyncTasks.doTaskOne();
    CompletableFuture<String> task2 = asyncTasks.doTaskTwo();
    CompletableFuture<String> task3 = asyncTasks.doTaskThree();

    CompletableFuture.allOf(task1, task2, task3).join();

    long end = System.currentTimeMillis();

    log.info("任务全部完成，总耗时：" + (end - start) + "毫秒");
}
```

#### 默认线程池参数

- `spring.task.execution.pool.core-size`：线程池创建时的初始化线程数，默认为8
- `spring.task.execution.pool.max-size`：线程池的最大线程数，默认为int最大值
- `spring.task.execution.pool.queue-capacity`：用来缓冲执行任务的队列，默认为int最大值
- `spring.task.execution.pool.keep-alive`：线程终止前允许保持空闲的时间
- `spring.task.execution.pool.allow-core-thread-timeout`：是否允许核心线程超时
- `spring.task.execution.shutdown.await-termination`：是否等待剩余任务完成后才关闭应用
- `spring.task.execution.shutdown.await-termination-period`：等待剩余任务完成的最大时间
- `spring.task.execution.thread-name-prefix`：线程名的前缀，设置好了之后可以方便我们在日志中查看处理任务所在的线程池

#### 线程池隔离

**第一步**：初始化多个线程池，比如下面这样：

```java
@EnableAsync
@Configuration
public class TaskPoolConfig {

    @Bean
    public Executor taskExecutor1() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(2);
        executor.setQueueCapacity(10);
        executor.setKeepAliveSeconds(60);
        executor.setThreadNamePrefix("executor-1-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        return executor;
    }

    @Bean
    public Executor taskExecutor2() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(2);
        executor.setQueueCapacity(10);
        executor.setKeepAliveSeconds(60);
        executor.setThreadNamePrefix("executor-2-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        return executor;
    }
}
```

注意：这里特地用`executor.setThreadNamePrefix`设置了线程名的前缀，这样可以方便观察后面具体执行的顺序。

**第二步**：创建异步任务，并指定要使用的线程池名称

```java
@Slf4j
@Component
public class AsyncTasks {

    public static Random random = new Random();

    @Async("taskExecutor1")
    public CompletableFuture<String> doTaskOne(String taskNo) throws Exception {
        log.info("开始任务：{}", taskNo);
        long start = System.currentTimeMillis();
        Thread.sleep(random.nextInt(10000));
        long end = System.currentTimeMillis();
        log.info("完成任务：{}，耗时：{} 毫秒", taskNo, end - start);
        return CompletableFuture.completedFuture("任务完成");
    }

    @Async("taskExecutor2")
    public CompletableFuture<String> doTaskTwo(String taskNo) throws Exception {
        log.info("开始任务：{}", taskNo);
        long start = System.currentTimeMillis();
        Thread.sleep(random.nextInt(10000));
        long end = System.currentTimeMillis();
        log.info("完成任务：{}，耗时：{} 毫秒", taskNo, end - start);
        return CompletableFuture.completedFuture("任务完成");
    }

}
```

这里`@Async`注解中定义的`taskExecutor1`和`taskExecutor2`就是线程池的名字。由于在第一步中，我们没有具体写两个线程池Bean的名称，所以默认会使用方法名，也就是`taskExecutor1`和`taskExecutor2`。

#### 线程池的拒绝策略

- AbortPolicy策略：默认策略，如果线程池队列满了丢掉这个任务并且抛出RejectedExecutionException异常。
- DiscardPolicy策略：如果线程池队列满了，会直接丢掉这个任务并且不会有任何异常。
- DiscardOldestPolicy策略：如果队列满了，会将最早进入队列的任务删掉腾出空间，再尝试加入队列。
- CallerRunsPolicy策略：如果添加到线程池失败，那么主线程会自己去执行该任务，不会等待线程池中的线程去执行。

而如果你要自定义一个拒绝策略，那么可以这样写：

```java
executor.setRejectedExecutionHandler(new RejectedExecutionHandler() {
    @Override
    public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
        // 拒绝策略的逻辑
    }
});
```

当然如果你喜欢用Lamba表达式，也可以这样写：

```java
executor.setRejectedExecutionHandler((r, executor1) -> {
    // 拒绝策略的逻辑
});
```

## Spring

- 简化数据访问的Spring Data
- 提供批处理能力的Spring Batch
- 用于保护应用安全的Spring Security

---

## 自动装配原理
### 主启动器
@SpringBootApplication

- @SpringBootConfiguration
   - @Configuration
      - @Component
- @EnableAutoConfiguration 自动导入包🌟
   - @AutoConfigurationPackage
      - @Import(AutoConfigurationPackages.Registrar.class)
   - @Import(AutoConfigurationImportSelector.class) 自动注册包
      - getAutoConfigurationEntry(...) 获取自动配置的实体
      - org.springframework.boot:springboot-auto-configure/META-INF/spring.factories所有的自动配置类都在这里🌟
         - XXXAutoConfiguration：向容器中自动配置组件
         - xxxProperties：自动配置类，装配配置文件中自定义的一些内容
      - @ConditionalOnXXX 选择性生效
- @ComponentScan 扫描当前主启动类同级的包

结论：SpringBoot所有的自动配置都在启动的时候扫描并加载，只有导入对应的 start ，通过启动器自动装配才会生效。xxxConfiguration 是用于扩展的。
### 实体类映射 yaml
```
@Component
@ConfigurationProperties(prefix = "spring.datasource")
```
松散绑定：last-name可以映射为 lastName
在yml中能配置的文件，都存在xxxProperties文件，在对应的xxxAutoConfiguration存在默认值
### 静态资源

- localhost:8080/webjars/xxx
- localhost:8080/xxx resources>static(默认)>public
### Thymeleaf
简单的表达：

- 变量表达式： ${...}
- 选择变量表达式： *{...}
```
<div th:object="${session.user}">
    <p>Name: <span th:text="*{firstName}">Sebastian</span>.</p>
    <p>Surname: <span th:text="*{lastName}">Pepper</span>.</p>
    <p>Nationality: <span th:text="*{nationality}">Saturn</span>.</p>
  </div>
```

- 消息表达： #{...}
   - [[#{login.btn}]]
   - i18n配置页面国际化
      - i18n = internationalization
      - k8s = kubernetes
- 链接 URL 表达式： @{...}
   - 所有页面的静态资源都需要使用 thymeleaf 接管
- 片段表达式： ~{...}
```
<div th:replace="~{dashboard::topbar}"></div>
<div th:insert="~{dashboard::sidebar(active='list.html')}"></div>
```
其他示例：
```
<p th:if="${not #strings.isEmpty(msg)}">123</p>
<tr th:each="emp:${emps}">
  <td th:text="${emp.getId()}"/>
  <td>[[${emp.getLastName()}]]</td>
  <td th:text="${emp.getGender()==0?'女':'男'}"/>
  <td th:text="${#dates.format(emp.getBirth(),'yyyy-MM-dd')}"/>
  <td>
    <button class="btn btn-sm btn-primary">编辑</button>
    <button class="btn btn-sm btn-danger">删除</button>
  </td>
</tr>
```
### 其他
软件开发：

1. 前端
2. 设计数据库
3. 接口对接：json、对象
4. 前后端联调

开发要求：

1. 有一套自己熟悉的后台模板（推荐x-admin）
2. 前端界面：至少自己通过前端框架，组合出来一个网站页面
   1. index
   2. about
   3. blog
   4. post
   5. user
3. 让这个网站能独立运行
## SpringSecurity
SecurityConfig.java
```
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    /**
     * 认证
     * 在 Spring Security 5.0+ 新增了加密方法，必须使用，否则报错： There is no PasswordEncoder mapped for the id "null"
     */
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.inMemoryAuthentication().passwordEncoder(new BCryptPasswordEncoder())
                .withUser("josh").password(new BCryptPasswordEncoder().encode("josh")).roles("vip2", "vip3")
                .and()
                .withUser("root").password(new BCryptPasswordEncoder().encode("123456")).roles("vip1", "vip2", "vip3")
                .and()
                .withUser("guest").password(new BCryptPasswordEncoder().encode("123456")).roles("vip1");
    }

    /**
     * 授权
     */
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
                // 首页所有人可以访问
                .antMatchers("/").permitAll()
                // 功能页有权限的人才能访问
                .antMatchers("/level1/**").hasRole("vip1")
                .antMatchers("/level2/**").hasRole("vip2")
                .antMatchers("/level3/**").hasRole("vip3")
                .and()
                // 没有权限跳转登录页面
                .formLogin().loginPage("/toLogin").loginProcessingUrl("/login")
                .usernameParameter("user").passwordParameter("pwd")
                .and()
                // 开启注销功能
                .logout().logoutSuccessUrl("/")
                .and()
                // 开启记住我功能 cookie 默认保存两周
                .rememberMe().rememberMeParameter("remember")
                .and()
                //关闭 csrf 跨站请求脚本攻击
                .csrf().disable();
    }
}
```
## Shiro
Tutorial.java
```
public class Tutorial {

    private static final transient Logger log = LoggerFactory.getLogger(Tutorial.class);

    public static void main(String[] args) {
        log.info("My First Apache Shiro Application");

        Factory<SecurityManager> factory = new IniSecurityManagerFactory("classpath:shiro.ini");
        SecurityManager securityManager = factory.getInstance();
        SecurityUtils.setSecurityManager(securityManager);

        /**
         * 1、获取当前用户对象
         */
        Subject currentUser = SecurityUtils.getSubject();

        /**
         * 2、 通过当前用户拿到 session 并对其操作
         */
        Session session = currentUser.getSession();
        session.setAttribute("someKey", "aValue");
        String value = (String) session.getAttribute("someKey");

        /**
         * 3、 判断当前的用户是否被认证
         */
        final boolean authenticated = currentUser.isAuthenticated();
        
        /**
         * 4、 用户信息
         */
        final Object principal = currentUser.getPrincipal();
   
        /**
         * 5、 测试角色
         */
        final boolean schwartz = currentUser.hasRole("schwartz");
      
        /**
         * 6-1、 测试权限 - 粗力度
         */
        final boolean permitted = currentUser.isPermitted("lightsaber:wield");

        /**
         * 6-2、 测试权限 - 细力度
         */
        final boolean permitted2 = currentUser.isPermitted("winnebago:drive:eagle5");
       
        /**
         * 7、 注销
         */
        currentUser.logout();
        System.exit(0);
    }
}
```
Shiro 三大对象：

- Subject：用户
- SecurityManager：管理所有用户
- Realm：连接数据

ShiroConfig.java
```
@Configuration
public class ShiroConfig {
    // 1、创建 realm 对象，需要自定义
    @Bean(name = "userRealm")
    public UserRealm userRealm() {
        return new UserRealm();
    }


    //2、 DefaultWebSecurityManager
    @Bean(name = "defaultWebSecurityManager")
    public DefaultWebSecurityManager getDefaultWebSecurityManager(@Qualifier("userRealm") UserRealm userRealm) {
        DefaultWebSecurityManager defaultWebSecurityManager = new DefaultWebSecurityManager();
        // 关联 userRealm
        defaultWebSecurityManager.setRealm(userRealm);
        return defaultWebSecurityManager;
    }

    //3、 ShiroFilterFactoryBean
    @Bean
    public ShiroFilterFactoryBean getShiroFilterFactoryBean(@Qualifier("defaultWebSecurityManager") DefaultWebSecurityManager defaultWebSecurityManager) {
        ShiroFilterFactoryBean bean = new ShiroFilterFactoryBean();
        //   设置安全管理器
        bean.setSecurityManager(defaultWebSecurityManager);

        // 添加 Shiro 的内置过滤器
        /**
         * anon：无需认证就可以访问
         * authc：必须认证才能访问
         * user：必须拥有"记住我"功能才能访问
         * perms：必须拥有对某个资源对权限才能访问
         * role：必须拥有某个角色权限才能访问
         */

        Map<String ,String > filterChainDefinitionMap = new HashMap<>();
        filterChainDefinitionMap.put("/userList","authc");
        filterChainDefinitionMap.put("/user/add","perms[user:add");
        bean.setFilterChainDefinitionMap(filterChainDefinitionMap);

        // 登录对请求
        bean.setLoginUrl("/toLogin");
        // 未授权页面
        bean.setUnauthorizedUrl("/noauth");

        return bean;
    }

    // 4. 整合 shiro 和 thymeleaf
    @Bean
    public ShiroDialect getShiroDialect(){
        return new ShiroDialect();
    }
}
```
UserRealm
```
public class UserRealm extends AuthorizingRealm {

    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
        System.out.println("执行了授权=======》doGetAuthorizationInfo");
        final SimpleAuthorizationInfo info = new SimpleAuthorizationInfo();
        info.addStringPermission("user:add");

        final String permission = (String) SecurityUtils.getSubject().getPrincipal();
        info.addStringPermission(permission);
        return info ;
    }

    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {
        System.out.println("执行了认证=======》Override");

        String name = "root";
        String permission = "user:add";
        String password = "123456";

        Subject subject = SecurityUtils.getSubject();
        Session session = subject.getSession();
        session.setAttribute("name",name);

        UsernamePasswordToken usernamePasswordToken = (UsernamePasswordToken)token;
        if (!usernamePasswordToken.getUsername().equals(name)){
            // 自动抛出异常
            return null;
        }
        // 密码认证 shiro 自动做
        return new SimpleAuthenticationInfo(permission,password,"");
    }
}
```
## Swagger2
SwaggerConfig.java
```
@Configuration
@EnableSwagger2
public class SwaggerConfig {


    @Bean
    public Docket docket(Environment environment) {
        // 设置要显示的 Swagger 环境 
        Profiles profiles = Profiles.of("dev", "test");
        // 获取项目的环境
        final boolean flag = environment.acceptsProfiles(profiles);
        1
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .groupName("A")
                .enable(flag)
                .select()
                // basePackage：指定要扫描的包
                .apis(RequestHandlerSelectors.basePackage("edu.zjut.demospringboot.controller"))
                // withMethodAnnotation：只扫描限定方法注解
                .apis(RequestHandlerSelectors.withMethodAnnotation(RestController.class))
                // ant：只扫描指定路由路径
                .paths(PathSelectors.ant("/hello/**"))
                .build();
    }

    @Bean
    public Docket docket2(Environment environment) {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .groupName("B");
    }

    @Bean
    public Docket docket3(Environment environment) {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .groupName("C");
    }

    private ApiInfo apiInfo() {
        return new ApiInfo(
                "xxxxAPI文档",
                "文档描述",
                "v1.0",
                "zjut",
                new Contact("josh", "", "dujianghui537885@163.com"),
                "Apach 2.0",
                "http://www.apache.org/licenses/LICENSE-2.0",
                new ArrayList<>());
    }
}
```
注意：在正式发布的时候，关闭Swagger！
## 邮件发送
```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```
```
@Autowired
private JavaMailSenderImpl mailSender;

/**
 * 简单邮件发送
 */
@Test
void simpleMailMessage() {

    SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
    simpleMailMessage.setSubject("你好呀～");
    simpleMailMessage.setText("测试一下邮箱");
    simpleMailMessage.setTo("2869314652@qq.com");
    simpleMailMessage.setFrom("2869314652@qq.com");
    mailSender.send(simpleMailMessage);
}

/**
 * 复杂邮件发送
 * @throws MessagingException
 */
@Test
void mimeMessage() throws MessagingException {
    final MimeMessage mimeMessage = mailSender.createMimeMessage();
    final MimeMessageHelper helper = new MimeMessageHelper(mimeMessage,true);
    helper.setSubject("你好呀～plus");
    helper.setText("<p style='color:red'>测试一下邮箱</p>",true);
    helper.setTo("2869314652@qq.com");
    helper.setFrom("2869314652@qq.com");
    mailSender.send(mimeMessage);
}
```
## 任务调度

- TaskScheduler：任务调度者
- TaskExecutor：任务执行者
- EnableScheduling：开启定时功能的注解
- Scheduled：什么时候执行
- Cron 表达式
```
@Service
public class ScheduledService {
    // 秒 分 时 日 月 周 年
    @Scheduled(cron = "0/3 * * * * ?")
    public void hello(){
        System.out.println("Scheduled.......");
    }
}
```
## Redis
底层从 jedis 变为 lettuce
jedis：采用的直连，不安全，除非使用 jedis pool 线程池，类似 BIO
lettuce：采用 netty，实例可以在多个线程中共享，安全，可以减少线程数据，类似 NIO
pom.xml
```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```
application.yml
```
spring:
  redis:
    host: 127.0.0.1
    port: 6379
```
所有 pojo 都要序列化 implements Serializable，否则就得通过以下方法序列化
```
// 序列化
final String jsonUser = new ObjectMapper().writeValueAsString(user);
```
配置RedisTemplate
```
@Configuration
public class RedisConfig {
    @Bean
    @SuppressWarnings("all")
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate();
        template.setConnectionFactory(redisConnectionFactory);

        // key、hash 的 key 都采用 String 的序列化方式
        StringRedisSerializer stringRedisSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringRedisSerializer);
        template.setHashKeySerializer(stringRedisSerializer);

        // value、hash 的 value 都采用 json 的序列化方式
        Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer<>(Object.class);
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        objectMapper.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
        jackson2JsonRedisSerializer.setObjectMapper(objectMapper);
        template.setValueSerializer(jackson2JsonRedisSerializer);
        template.setHashValueSerializer(jackson2JsonRedisSerializer);

        template.afterPropertiesSet();

        return template;
    }
}
```
RedisUtil.java
```
package edu.zjut.demospingboot.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * 操作 Redis 的工具类
 * @author dujianghui-zjut
 * @date 2021/12/6 09:01
 * @email dujianghui537885@163.com
 */
@Component
public class RedisUtil {
    @Autowired
    private RedisTemplate<String,Object> redisTemplate;

    /**
     * 指定缓存失效时间
     * @param key 键
     * @param time 时间
     * @return
     */
    public boolean expire(String key,long time){
        try{
            if (time>0){
                redisTemplate.expire(key,time, TimeUnit.SECONDS);
            }
            return true;
        }catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 根据 key 获取过期时间
     * @param key 不能为null
     * @return 时间（秒），返回 0 表示永久有效
     */
    public long getExpire(String key){
        return redisTemplate.getExpire(key,TimeUnit.SECONDS);
    }

    /**
     * 判断 key 是否存在
     * @param key 键
     * @return true 存在 false 不存在
     */
    public boolean hasKey(String key){
        try{
            return redisTemplate.hasKey(key);
        } catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 普通缓存获取
     * @param key 键
     * @return 值
     */
    public Object get(String key){
        return key==null?null:redisTemplate.opsForValue().get(key);
    }

    /**
     * 普通缓存放入
     * @param key 键
     * @param value 值
     * @return true 成功 false失败
     */
    public boolean set(String key,Object value){
        try{
            redisTemplate.opsForValue().set(key,value);
            return true;
        }catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }
    /**
     * 普通缓存放入并设置时间
     * @param key 键
     * @param value 值
     * @param time 时间（秒） time要大于0 否则讲设置无限期
     * @return true 成功 false失败
     */
    public boolean set(String key,Object value,long time){
        try{
            if (time>0){
                redisTemplate.opsForValue().set(key,value,time,TimeUnit.SECONDS);
            }else {
                set(key,value);
            }
            return true;
        }catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 递增
     * @param key 键
     * @param delta 要增加几（大于0）
     * @return
     */
    public long incr(String key,long delta){
        if (delta<0){
            throw new RuntimeException("递增因子必须大于0");
        }
        return redisTemplate.opsForValue().increment(key,delta);
    }

    /**
     * 递增
     * @param key 键
     * @param delta 要减少几（小于0）
     * @return
     */
    public long desr(String key,long delta){
        if (delta>0){
            throw new RuntimeException("递减因子必须小于0");
        }
        return redisTemplate.opsForValue().increment(key,-delta);
    }

    /**
     * HashGet
     * @param key 键 notnull
     * @param item 项 notnull
     * @return
     */
    public Object hget(String key,String item){
        return redisTemplate.opsForHash().get(key,item);
    }

    /**
     * 获取 hashKey 对应的所有键值
     * @param key 键
     * @return 对应的多个键值
     */
    public Map<Object,Object> hmget(String key){
        return redisTemplate.opsForHash().entries(key);
    }

    /**
     * HashSet
     * @param key 键
     * @param map 对应多个键值
     * @return
     */
    public boolean hmset(String key,Map<String,Object> map){
        try{
            redisTemplate.opsForHash().putAll(key,map);
            return true;
        }catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }

    /**
     * HashSet 并设置时间
     * @param key 键
     * @param map 对应多个键值
     * @param time 时间（秒）
     * @return true 成功  false 失败
     */
    public boolean hmset(String key,Map<String,Object> map,long time){
        try{
            redisTemplate.opsForHash().putAll(key,map);
            if (time>0){
                expire(key,time);
            }
            return true;
        }catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 向一张 hash 表中放入数据，如果不存在将创建
     * @param key 键
     * @param item 项
     * @param value 值
     * @return true 成功  false 失败
     */
    public boolean hset(String key,String item,Object value){
        try{
            redisTemplate.opsForHash().put(key,item,value);
            return true;
        }catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 向一张 hash 表中放入数据，如果不存在将创建，并设置时间
     * @param key 键
     * @param item 项
     * @param value 值
     * @param time 时间（秒），如果已存在的 hash 表有时间，这里将会替换原有时间
     * @return
     */
    public boolean hset(String key,String item,Object value,long time){
        try{
            redisTemplate.opsForHash().put(key,item,value);
            if (time>0){
                expire(key,time);
            }
            return true;
        }catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 删除 hash 表中的值
     * @param key 键 notnull
     * @param item 项 notnull
     */
    public void hdel(String key,Object... item){
        redisTemplate.opsForHash().delete(key,item);
    }


    /**
     * 判断 hash 表中是否有该项的值
     * @param key 键 notnull
     * @param item 项 notnull
     * @return true 存在  false 不存在
     */
    public boolean hHasKey(String key,String item){
        return redisTemplate.opsForHash().hasKey(key,item);
    }

    /**
     * hash 递增，如果不存在就会创建一个，并把新增后的值返回
     * @param key 键
     * @param item 项
     * @param by 要增加几（大于0）
     * @return
     */
    public double hincr(String key,String item,double by){
        return redisTemplate.opsForHash().increment(key,item,by);
    }

    /**
     * hash 递减，如果不存在就会创建一个，并把新增后的值返回
     * @param key 键
     * @param item 项
     * @param by 要增加几（大于0）
     * @return
     */
    public double hdecr(String key,String item,double by){
        return redisTemplate.opsForHash().increment(key,item,-by);
    }

    /**
     * 根据 key 获取 Set 中的所有值
     * @param key 键
     * @return
     */
    public Set<Object> sGet(String key){
        try{
            return redisTemplate.opsForSet().members(key);
        }catch (Exception e){
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 根据 value，从一个 set 中查询，是否存在
     * @param key 键
     * @param value 值
     * @return true 存在  false 不存在
     */
    public boolean sHasKey(String key,Object value){
        try{
            return redisTemplate.opsForSet().isMember(key,value);
        }catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 将数据放入 set 缓存
     * @param key 键
     * @param values 值 可以是多个
     * @return 成功个数
     */
    public long sSet(String key,Object... values){
        try{
            return redisTemplate.opsForSet().add(key,values);
        } catch (Exception e){
            e.printStackTrace();
            return 0;
        }
    }
    /**
     * 将数据放入 set 缓存，并设置时间
     * @param key 键
     * @param time 时间（秒）
     * @param values 值 可以是多个
     * @return 成功个数
     */
    public long sSetAndTime(String key,long time,Object... values){
        try{
            final Long count = redisTemplate.opsForSet().add(key, values);
            if (time>0){
                expire(key,time);
            }
            return count;
        } catch (Exception e){
            e.printStackTrace();
            return 0;
        }
    }

    /**
     * 获取 set 缓存的长度
     * @param key 键
     * @return
     */
    public long sGetSetSize(String key){
        try{
            return redisTemplate.opsForSet().size(key);
        }catch (Exception e){
            e.printStackTrace();
            return 0;
        }
    }

    /**
     * 移除值为 value 的
     * @param key 键
     * @param values 值，可以是多个
     * @return 移除的个数
     */
    public long setRemove(String key,Object... values){
        try {
            return redisTemplate.opsForSet().remove(key, values);
        }catch (Exception e){
            e.printStackTrace();
            return 0;
        }
    }

    /**
     * 获取 list 缓存的内容
     * @param key 键
     * @param start 开始
     * @param end 结束，0 到 -1 表示所有值
     * @return
     */
    public List<Object> lGet(String key,long start,long end){
        try{
            return redisTemplate.opsForList().range(key,start,end);
        }catch (Exception e){
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 获取 list 缓存的长度
     * @param key 键
     * @return
     */
    public long lGetlistSize(String key){
        try {
            return redisTemplate.opsForList().size(key);
        }catch (Exception e){
            e.printStackTrace();
            return 0;
        }
    }

    /**
     * 通过索引获取 list 中的值
     * @param key 键
     * @param index 索引，index>=0时，0 表头，1 第二个元素；index<0时，-1 表尾，-2 倒数第二个元素。
     * @return
     */
    public Object lGetIndex(String key,long index){
        try{
            return redisTemplate.opsForList().index(key,index);
        }catch (Exception e){
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 将 list 放入缓存
     * @param key 键
     * @param value 值
     * @return
     */
    public boolean lSet(String key,Object value){
        try{
            redisTemplate.opsForList().rightPush(key,value);
            return true;
        }catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 将 list 放入缓存
     * @param key 键
     * @param value 值
     * @return
     */
    public boolean lSet(String key,List<Object> value){
        try{
            redisTemplate.opsForList().rightPushAll(key,value);
            return true;
        }catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 将 list 放入缓存，并设置时间
     * @param key 键
     * @param value 值
     * @param time 时间（秒）
     * @return
     */
    public boolean lSet(String key,Object value,long time){
        try{
            redisTemplate.opsForList().rightPush(key,value);
            if (time>0){
                expire(key,time);
            }
            return true;
        }catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }
    /**
     * 将 list 放入缓存，并设置时间
     * @param key 键
     * @param value 值
     * @param time 时间（秒）
     * @return
     */
    public boolean lSet(String key,List<Object> value,long time){
        try{
            redisTemplate.opsForList().rightPushAll(key,value);
            if (time>0){
                expire(key,time);
            }
            return true;
        }catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 根据索引修改 list 中的某条数据
     * @param key 键
     * @param index 索引
     * @param value 值
     * @return
     */
    public boolean lUpdateIndex(String key,long index,Object value){
        try{
            redisTemplate.opsForList().set(key,index,value);
            return true;
        }catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 移除 N 个值为 value
     * @param key 键
     * @param count 移除多少个
     * @param value 值
     * @return 移除的个数
     */
    public long lRemove(String key,long count,Object value){
        try{
            return redisTemplate.opsForList().remove(key,count,value);
        }catch (Exception e){
            e.printStackTrace();
            return 0;
        }
    }
}
```
## 分布式开发：Dubbo（RPC）+zookeeper
![](https://cdn.nlark.com/yuque/0/2023/png/12535165/1678177961750-8f51ad05-9dec-4b15-9340-255f20fff21e.png#averageHue=%23fdfdfc&clientId=u39b15dc3-969b-4&from=paste&id=u0f559581&originHeight=1854&originWidth=2602&originalType=url&ratio=2&rotation=0&showTitle=false&status=done&style=none&taskId=u03086bd9-be00-4f39-a991-547df99f064&title=)

- Registry 注册中心
- Monitor 监控中心：Dubbo

四个问题：

1. API 网关，服务路由
2. HTTP、RPC 框架，异步调用
3. 服务注册与发现，高可用
4. 熔断机制，服务降级
### Spring Cloud Netflix（2018年停止维护）

- Eureka：服务注册与发现
- Hystrix：熔断机制
### Apache Dubbo + zookeeper

- Dubbo：高性能的基于 Java 实现的 RPC 通信框架
- Zookeeper：管理 Hadoop、Hive
### Springcloud Alibaba
一站式解决方案
### Server Mesh+istio
服务网格


---

> 作者: 都将会  
> URL: https://leni.fun/springboot_draft/  

