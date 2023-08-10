# 🚩Design Pattern - 设计模式


<!--more-->

### Principle 原则 x 6

1. Open Close 开闭原则：对扩展开放，对修改关闭（通过接口和抽象类）
2. Liskov Substitution 里氏代换：子类可替换父类
3. Dependence Inversion 依赖倒转：针对接口编程，依赖于抽象而非具体
4. Interface Segregation 接口隔离： 多个隔离的接口优于单个接口，以解耦合
5. Demeter 迪米特：最少知道原则，实体间减少相互作用，模块独立
6. Composite Reuse 合成复用：用聚合，而非继承。

### Create 创建型 x 5
| **Singleton** | 6种 |
| --- | --- |
| Prototype | 克隆大对象 |
| Builder | 内部结构复杂，关注顺序 |
| Factory | 日志、数据库 |
| Abstract Factory | 多个产品族（换皮肤） |

### Structure 结构型 x 7
| Adapter 适配器 | 补救措施 |
| --- | --- |
| Bridge 桥接 | 扩展两个独立变化的维度 |
| Composite 组合 | 部分-整体 |
| **Decorator 装饰器** | 不增加子类来扩展类 |
| Facade 外观 | 隐藏系统复杂性，违背开闭原则 |
| Flyweight 享元 | 不可分辨的大量对象 |
| Proxy 代理 | 创建具有原对象的新对象
和适配器模式的区别：适配器模式主要改变所考虑对象的接口，而代理模式不能改变所代理类的接口。 2、和装饰器模式的区别：装饰器模式为了增强功能，而代理模式是为了加以控制。 |

### Behavior 行为型 x 11
| Chain of Responsibility 责任链 | 多个对象同时处理一个请求 |
| --- | --- |
| Command 命令 | 可支持撤销、恢复操作 |
| Interpreter 解释器 | 高频、特定类型的问题 |
| Iterator 迭代器 | 顺序访问聚合对象 |
| Mediator 中介者 | 1对n的网状结构->1对1的星形结构 |
| Memento 备忘录 | 
1. 为满足迪米特原则，需要一个管理备忘录的类
2. 原型模式+备忘录模式，可节约内存
3. 常用于实现撤销和重做功能，也可以用于实现数据快照、事务管理等应用场景
 |
    | Observer 观察者 | 某对象通知其他对象 |
    | State 状态 | 行为随状态而改变，替代 if...else... 语句 |
    | Strategy 策略 | 动态在多种行为中选择一种 |
    | Template 模板 | 抽离通用方法，加final修饰 |
    | Visitor 访问者 | 违反迪米特、依赖倒转原则
    SimpleFileVisitor |

### 工厂（创建）+策略（行为）模式
使用场景：多种方式登录、多种付款方式、阶梯计算
```
types: # key:请求参数
	account: accountGranter # 类名首字母改小写
	sms: smsGranter
	we_chat: weChatGranter
```
```java
@Component
public class WeChatGranter implements UserGranter{
    @Override
    public LoginResp login(LoginReq loginReq){
        // to do
        return new LoginResp();
    }
}
@Component
public class UserLoginFactory implements ApplicationContextAware{
	private static Map<String, UserGranter> granterPool = new ConcurrentHashMap<>();
    @Override
    public void setApplicationContext(ApplicationContext application){
        // 获取容器中的 bean 对象
        loginTypeConfig.getTypes().forEach((k,v)->{
            granterPool.put(k,(UserGranter) application.getBean(b));
        });
    }
    // 对外开放
    public UserGranter getGranter(String grantType){
        return granterPool.get(grantType); 
    }
}
```
### 单点登录 SSO = Single Sign On
一次登录，访问所有信任的应用系统。

1. 集成认证中心到应用系统中，如 spring-security-oauth2
2. 在认证中心中配置应用系统的信息，包括**应用名称、域名、回调地址**，同时为用户分配唯一 id
3. 集成认证中心提供的 SDK 或库
4. 用户未登录时，重定向（redirect）到认证中心进行登录，验证完身份重定向回应用系统，在 URL 参数中携带用户的身份标识符
5. 记录用户登录状态于 Session 中
### 管道+过滤器模式（Channel+Filter）
所有的复杂处理，都可以抽象为管道+过滤器模式（Channel+Filter），用于服务的过滤

- 实现额外的增强处理，如AOP
- 中断当前处理流程，返回特定数据


---

> 作者: 都将会  
> URL: https://leni.fun/design-pattern/  

