# Spring 杂记


<!--more-->

### 9.1 Spring框架设计

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678178017589-db0b3ff8-fd1d-4a0c-9ad5-64526602af9e-20230808112106706.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/da275b8fb65615bc30866c6dc31908ee.png)

### 9.2 AOP 详解

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/a086068f2e236143a164d333ae19b5d0.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/2aa495b22915a84bfa83ac9983708d8b.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/7c345dc4d26f34b8e545c27178532530.png)

### 9.3 Bean 核心原理

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/23bd0bdafea41ec36550e3ea05ea0306.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/db87c217fd18d10f7efe9212bb1cf677.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/d5482ea1cff2340823f9d6e40b113673.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/1e299b831fd8724c5c3e6362f5b44b4e.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/1d59e8258e1d485463e4276c62616a1e.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/04cd9a32563bbfc6ab34a683bee0426d.png)

### 9.4 XML 配置原理

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/d232a9b8497562b1988de435d9ab0038.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/13aba359e8865b53a0445628efb2e21b.png)

### 10.1 Spring Boot 核心原理

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/78646cb0ec996fd7c0d5093891e220f0.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/69bde59bb602973481ef384d5f826e38.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/18a1be7be5daa56d642befb9cd094c6f.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/6a1fe796ed014844b1b61a3eb58aa91d.png)

### 10.2 ORM-Hibernate/MyBatis

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/7b8803eb32caf0683d2aac1bf2ca5998.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/c48a35a351224bd7c121ece86824428d.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/3f4a0456ba4a2013e8421566fdfaf736.png)

### 10.3 Spring 集成 ORM/JPA

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/4e14a0631c853c11f8153b66fd6093a2.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/e15ac9a1a2b86fdea986e740b9d321fb.png)

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/d6293bd5f36db71b283ec0c8411feb85.png)





------





### 容器接口与实现

#### BeanFactory

Spring 的核心容器，实际上控制反转、基本的依赖注入、直至 Bean 的生命周期的各种功能，都由它的实现类提供。

```plain
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) throws NoSuchFieldException, IllegalAccessException {
        ConfigurableApplicationContext context = SpringApplication.run(DemoApplication.class, args);
        // 单例存储在 singletonObjects
        Field singletonObjects = DefaultSingletonBeanRegistry.class.getDeclaredField("singletonObjects");
        singletonObjects.setAccessible(true);
        ConfigurableListableBeanFactory beanFactory = context.getBeanFactory();
        Map<String, Object> map = (Map<String, Object>) singletonObjects.get(beanFactory);
        map.forEach((k, v) -> {
            System.out.println("beanName:" + k + ",bean:" + v);
        });
    }
}
```

将常用后处理器添加到beanFactory

AnnotationConfigUtils.registerAnnotationConfigProcessors(beanFactory);

1. beanFactory 后处理器

- org.springframework.context.annotation.internal**Configuration**AnnotationProcessor：解析@Configuration、@Bean 

- - ConfigurationClassPostProcessor.class 可以解析 @ComponentScan @Bean @Import @ImportResource
  - MapperScannnerConfigurer.class 可以解析 @MapperScanner

```plain
beanFactory.getBeansOfType(BeanFactoryPostProcessor.class).values().forEach(beanFactoryPostProcessor -> {
            beanFactoryPostProcessor.postProcessBeanFactory(beanFactory);
        });
```

1. bean 后处理器

- org.springframework.context.annotation.internal**Autowired**AnnotationProcessor：在依赖注入阶段，解析@Autowired

- - 如果是 GenericApplicationContext，还需要 context.getDefaultListableBeanFactory().setAutowireCandidateResolver(new ContextAnnotationAutowireCandidateResolver()) 才能解析 @Value

- org.springframework.context.annotation.internal**Common**AnnotationProcessor：解析@Resource（依赖注入阶段）、@PostConstruct（实例化后，即初始化前）、@PreDestroy（销毁前）
- org.springframework.context.event.internalEventListenerProcessor
- org.springframework.context.event.internalEventListenerFactory

 beanFactory.getBeansOfType(BeanPostProcessor.class).values().forEach(beanFactory::addBeanPostProcessor);

- 另外，ConfigurationPropertiesBindingPostProcessor 用于解析 @ConfigurationProperties

单例对象默认在使用时才初始化，若要预先初始化单例对象：

beanFactory.preInstantiateSingletons();

综上，beanFactory不会主动做以下事情：

1. 不会主动调用 BeanFactory 后处理器

2. 不会主动添加 Bean 后处理器

3. 不会主动初始化单例

4. 不会解析 beanFactory、`${}`、#{}

   注：beanFactory.addEmbeddedValueResolver(new StandardEnvironment()::resolvePlaceholders) 是 ${} 的解析器

#### Q：同时添加 @Autowired 和@Resource注解？

Autowired默认按照类型匹配（通过beanFactory.doResolveDependency(...)方法），

有相同类型时再按照名称匹配，Resource默认按照名称匹配。

internal**Autowired**AnnotationProcessor默认优先级更高，所以Autowired生效，可以通过比较器来改变优先级（order越小优先级越高）。

#### ApplicationContext

继承了 BeanFactory，进行了扩展。

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/2023/08/08/0f4309baedea0c2977029446353689a6.png)

- MessageSource：国际化
- ResourcePatternResolver：资源通配符
- ApplicationEventPublisher：事件发布器（用于解耦）
- EnvironmentCapable：环境变量、配置信息

DispatcherServlet 称为前控制器，所有请求都先通过它。

### Aware 接口

是 spring 的内置功能

bean初始化优先级：

1. @PostConstruct
2. Aware
3. implements InitializingBean 重写方法
4. @Bean(initMethod = "")

bean销毁优先级：

1. @PreDestroy
2. Aware
3. implements DisposableBean 重写方法
4. @Bean(destroyMethod = "")

### Scope

1. singleton 单例：Q：单例中注入多例，多例都是同一个对象，需要推迟其他 scope bean 的获取（2种代理，2种非代理）

1. 1. 在注入目标前面加 @Lazy 生成代理对象（推荐）
   2. 在被注入类上添加 @Scope(value="prototype",proxyMode = ScopedProxyMode.TARGET_CLASS) 生成代理对象
   3. 声明 ObjectFactory<>，通过getObject() 来实现
   4. 注入 ApplicationContext，通过 context.getBean(Xxx.class)

1. prototype 原型
2. request 请求
3. session 会话：不同浏览器，不同会话
4. application 应用程序

#### Q：jdk>=9时，反射调用 jdk 中方法报 IllegalAccessException？

A1:重写toString()方法，不让它调用 jdk 中的方法

A2:添加参数--add-opens java.base/java.lang=ALL-UNNAMED


---

> 作者: 都将会  
> URL: https://leni.fun/spring_draft/  

