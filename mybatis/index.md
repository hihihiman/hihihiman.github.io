# 🚩MyBatis 面试题


### #{}和${}的区别是什么？ 

<!--more-->

#{}是预编译处理，`${}`是字符串替换。 
Mybatis 在处理#{}时，会将 sql 中的#{}替换为?号，调用 
PreparedStatement 的set 方法来赋值； 
Mybatis 在处理${}时，就是把${}替换成变量的值。使用#{}可以有效的防止 SQL 注入，提高系统安全性。 

#### 使用 ${} 的情况

1. 当sql中表名是从参数中取的情况
2. order by排序语句中，因为order by 后边必须跟字段名，这个字段名不能带引号，如果带引号会被识别会字符串，而不是字段。

![image.png](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1682660700954-676f648e-e5a5-459b-bdb8-717329e799d5-20230808150808442.png)

![image.png](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1682660744867-3de42071-1bfa-4f98-824f-5854928a0f3a.png)



### Mybatis 是如何进行分页的？分页插件的原理是什么？ 
Mybatis 使用 **RowBounds 对象**进行分页，它是**针对 ResultSet 结果集**执行的**内存分页**，而非物理分页。可以在 sql 内直接书写带有物理分页的参数来完成物理分页功能，也可以使用分页插件来完成物理分页。 
分页插件的基本原理是使用 Mybatis 提供的插件接口，实现自定义插件，在插件的拦截方法内拦截待执行的 sql，然后重写 sql，根据 dialect 方言，添加对应的物理分页语句和物理分页参数。 

### Mybatis 的一级、二级缓存？
基于 **PerpetualCache**，本质是一个 HashMap。

1. 一级缓存（默认开启）: 存储作用域为 **Session**，当 Session flush 或 close 时清空
2. 二级缓存（默认关闭）：存储作用域为** Mapper(Namespace)**
   1. **需要实现 serializable 接口**
   2. 只有**会话提交或关闭**后，一级缓存中的数据才会转移到二级缓存中
3. C/U/D 操作后，该作用域下所有 select 中的缓存将被 clear。 

### MyBatis 执行流程？

1. 读取配置文件
2. SqlSession**Factory**：唯一的**会话工厂**
3. SqlSession：多个会话
4. **Executor：执行器，执行数据库操作并维护缓存**
5. MappedStatement：是 Executor 接口中的参数，封装了映射信息，**接收入参，返回出参**

### MyBatis 开启延迟加载
lazyLoadingEnabled = true（默认false），原理：

1. 使用 **CGLIB 创建目标对象的代理对象**
2. 调用目标方法时，**进入拦截器 invoke 方法，若目标方法为 null，执行 SQL**
3. 重新调用

### Java 对象与 MySQL 对象如何映射？
MyBatis 默认使用 JDBC 的预编译语句来执行 SQL 语句。在将 String 类型的参数传递给 SQL 语句时，MyBatis 会自动将其转换为 VARCHAR 类型。
#### 自定义类型转换 - 实现 TypeHandler 接口


---

> 作者: 都将会  
> URL: https://leni.fun/mybatis/  

