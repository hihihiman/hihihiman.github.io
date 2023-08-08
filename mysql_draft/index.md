# MySQL 杂记


<!--more-->

### 范式

- 1NF：消除重复数据，每一列都是原子的；所有属性都不能再分解为更基本的数据单位；
- 2NF：消除部分依赖，每一行都被主键唯一标识；**所有非主属性都依赖于关键属性**，所有列都依赖于任意一组候选关键字；
- 3NF：消除传递依赖，表中每一列只依赖主键而不是其他列；每一列都与任意候选关键字直接相关而不是间接相关；
- BCNF：消除主属性对于码的部分与传递函数依赖。


### MySQL 存储
独占模式：

1. 日志组文件：默认5M【ib_logfile0】【ib_logfile1】
2. 表结构文件：【*.frm】
3. 独占表空间文件：【*.ibd】
4. 字符集和排序规则文件：【db.opt】
5. binlog 二进制日志文件：记录主数据库服务器的 DDL 和 DML 操作 
   1. DDL：Data Define Language，数据定义语言，如 CREATE、ALTER、DROP
   2. DML：Data Manipulation Language，数据操作语言，如 INSERT、UPDATE、DELETE
6. 二进制日志索引文件：【master-bin.index】

共享模式： innodb_file_per_table = 1，数据都在 ibdata1

#### 12.1.5 MySQL 执行流程

1. 查询缓存：通过一个对**大小写敏感**的哈希查找实现的。
2. 解析器生成解析树：语法层面，验证关键字是否拼写正确、顺序正确、引号对应。
3. 预处理器优化解析树：逻辑层面，检查数据表和数据列是否存在，名字是否有歧义，验证权限
4. 查询优化器： 
   1. 最重要的一部分是关联查询优化；
   2. 用 `distinct` 和 `group by` 会产生临时中间表；
   3. 静态优化：“编译时优化”，不依赖于特别的数值，在第一次完成后就一直有效；
   4. 动态优化：“运行时优化”，和查询的上下文有关。
5. 查询执行引擎，结果存入查询缓存
6. 调用存储引擎接口

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678176643458-76e822c6-5894-41ca-8f3e-380f327ddb41.png)

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678176643399-75806048-c0a6-467d-9fd5-098b1c2e2326.png)

执行引擎的状态：

- sleep：线程正在等待客户端发送新请求；  
- query：正在执行查询或正在将结果发送给客户端；
- locked：mysql 服务器层，线程正在等待表锁；
- analying and statistics：线程正在收集存储引擎的统计信息，并声称**查询的执行计划**。
- copying to temp table：线程正在执行查询，并将结果复制到临时表中，一般为 GROUP BY 操作，要么是文件排序，或 UNION；
- on disk：将内存中的临时表放到磁盘上；
- sorting result：线程正在对结果集进行排序；
- sending data：线程在多个状态之间传递数据，或生成结果集，或向客户端返回数据。

执行顺序（并不绝对，比如在 select 筛选出找到的数据集）：

1. 关系结构：FROM，ON，JOIN
2. 筛选数据：WHERE，GROUP BY，HAVING，SELECT
3. 展示数据：ORDER BY，LIMIT

分组：

- WHERE 过滤行（在数据分组前），HAVING 过滤分组
- UNION 自动去除重复行，如果想返回所有，使用`UNION ALL`
- UNION 后的 `ORDER BY` 会排序所有结果

##### having和where的区别？

- WHERE 子句用来筛选 FROM 子句中指定的操作所产生的行。
- GROUP BY 子句用来分组 WHERE 子句的输出。
- HAVING 子句用来从分组的结果中筛选行。
- 优先级：where> 聚合语句(sum,min,max,avg,count) >having子句

##### LIMIT

`LIMIT a,b`：返回从行 a 开始的 b 行，a从0开始。

等同于：`LIMIT b OFFSET a`

##### REGEXP

在列值内匹配，头尾加上`^ $` 才与 `LIKE` 等价。

- |：表示 or
- [123]：匹配 1 或 2 或 3 ，可以写成[1-3]
- [^123]：匹配除了 1 或 2 或 3 之外的字符
- .：匹配任意字符
- ？:前一个字符出现 0 或 1 次
- {n}：出现 n 次
- ^：文本的开始
- $：文本的结尾
- [[:<:]]：词的开始
- [[:>:]]：词的结尾

##### 函数

Concat()：连接

LTrim()、RTrim()：去掉左边或右边的所有空格

Upper()、Lower()：转换大小写

Soundex()：返回类似发音的结果

Date()：日期，格式为 `yyyy-mm-dd`

Time()：时间，格式为 `hh:mm:ss`

AVG()：求平均数，忽略列值为`null` 的行

count：计数，`count(*)`统计行数，包括 `null` 值；`count(column)` 忽略  `null` 值

##### count（）

- count（col）：统计有值的结果数，不包括`null`
- count（*）：统计结果集的行数

```
1. MyISAM 在 COUNT(*) 全表非常快
-- 优化前：要扫描全表
select count(*)
from world.city
where id >5;
-- 优化后：只扫描5行
select (select count(*) from world.city) - count(*)
from world.city
where id <= 5;

2. 用 count 也可以实现 sum
-- sum
select sum(if(color='blue',1,0)) as blue,sum(if(color='red',1,0)) as red
from items
-- count
select count(color = 'blue' or null) as blue,count(color='red' or null) as red
from items
```

##### Match+Against

```
# 结果无序
WHERE column LIKE '%word%'

# 结果有序
WHERE Match(column) Against('word')
```

`Match()` 指定被搜索的列，`Against()` 指定要使用的搜索表达式。

#### 12.1.6 数据结构

##### （1）整数类型

- tinyint：8位
- smallint：16位
- mediumint：24位
- int：32位
- bigint：64位

默认允许负值：-2(n-1) ~ 2(n-1)-1 ，添加 `unsigned` 属性不允许负值，范围为 0 ~ 2n-1

int(11)：不会限制值的合法范围，只会控制显示字符的个数。

IPv4地址用 `unsigned int` 来存储，因为它实际上是 32 位无符号整数，不是字符串，

-  `INET_ATON()` ：将一个字符串IP地址转换为一个32位的网络序列IP地址 
-  `INET_NTOA`：讲一个32位的网络序列IP地址转换为一个字符串IP地址 

##### （2）实数类型

- float：4 字节
- double：8 字节

##### （3）字符串类型

字符方式（有排序规则和字符集）/二进制方式（没有排序规则或字符集）

- varchar/varbinary：需要额外空间存储长度
- char/binary：会截断最后的空格。适合存储以下类型： 
   1. 短字符串
   2. 等长字符串（如 MD5 值）
   3. 经常变更的数据，因为不易产生碎片
- tinytext/tinyblob
- smalltext/smallblob
- text/blob
- mediumtext/mediumblob
- longtext/longblob

##### （4）🌟时间类型

- datetime：8 字节
- timestamp 时间戳：不容易产生歧义。4 字节，从1970年1月1日午夜（格林尼治标准时间）以来的秒数，智能表示从1970年到2038年，默认为 NOT NULL

#### 12.1.7 表设计原则

- 避免过度设计
- 使用小而简单的合适数据类型，尽量避免使用 NULL 值（除非必要）
- 尽量使用相同的数据类型存储相似或相关的值
- 注意可变长字符串
- 尽量使用整型定义标识列
- 小心使用 ENUM 和 SET，避免使用 BIT
- `alter table` 大部分情况下会锁表并重建整张表，可以在备机执行 alter 并在完成后把它切换为主库

### MySQL 配置优化

1. 连接请求的变量 
   1. max_connections
   2. back_log（缓存中尚未处理的连接数量）
   3. wait_timeout（非交互式连接）、 interactive_timeout（交互式连接）
2. 缓冲区变量 
   1. key_buffer_size
   2. query_cache_size（查询缓存，简称QC）
   3. max_connect_errors
   4. sort_buffer_size
   5. max_allowed_packet = 32M
   6. join_buffer_size = 2M
   7. thread_cache_size = 300
3. Innodb 相关变量 
   1. innodb_buffer_pool_size
   2. innodb_flush_log_at_trx_commit
   3. innodb_thread_concurrency = 0
   4. innodb_log_buffer_size
   5. innodb_log_file_size = 50M
   6. innodb_log_files_in_group = 3
   7. read_buffer_size = 1M
   8. read_rnd_buffer_size = 16M
   9. bulk_insert_buffer_size = 64M
   10. binary log

### 如何选择恰当数据类型？

明确、尽量小。

- char、varchar 的选择 
   - varchar适用的场景： 
      - 字符串列的最大长度比平均长度要大很多；
      - 字符串列的更新很少时，因为没有或很少有内存碎片问题；
      - 使用了UTF-8这样复杂的字符集，每个字符都使用不同的字节数进行存储；
   - char适用的场景： 
      - 列的长度为定值时适合适用，比如：MD5密文数据
- text/blob/clob 的使用问题？ 
   - text 只能保存字符数据，比如一遍文章或日记；
   - clob指代的是字符大对象，通常用来存储大量的文本数据，即存储字符数据；
   - blob指代的是二进制大对象，用于存储二进制数据或文件，常常为图片或音频。
- 数值的精度问题？ 
   - decimal的存储结果没有精度丢失问题。因为decimal内部以字符形式存储小数，属于准确存储。而float和 double等则属于浮点数数字存储，所以没有办法做到准确，只能尽可能近似。
- 是否使用外键 
   - 外键提供的几种在更新和删除时的不同行为都可以帮助我们保证数据库中数据的一致性和引用合法性，但是外键的使用也需要数据库承担额外的开销，在大多数服务都可以水平扩容的今天，高并发场景中使用外键确实会影响服务的吞吐量上限。
   - 如果不使用外键牺牲了数据库中数据的一致性，但是却能够减少数据库的负载；如果使用外键保证了数据库中数据的一致性，也将全部的计算任务全部交给了数据库。
   #### 

### 数据库碎片问题？
查看碎片是否产生：
```
show table status from table_name\G;
```

清理办法：
MyISAM：
```
optimize table 表名；
# （OPTIMIZE 可以整理数据文件,并重排索引）
```

Innodb：
```
# 1.  重建表存储引擎，重新组织数据
ALTER TABLE tablename ENGINE=InnoDB;
# 2.  进行一次数据的导入导出
```
#### 

### OLTP 和 OLAP

OLTP = online transaction processing 在线事务处理

OLAP = online analytic processing 在线分析处理

ETL = Extract-Transform-Load，提取-转换-加载

| 属性 | OLTP | OLAP |
| --- | --- | --- |
| 读 | 基于key，每次查询返回少量记录 | 对大量记录进行汇总 |
| 写 | 随机访问，低延迟写入 | 批量导入（ETL）或事件流 |
| 使用场景 | 终端用户，通过网络应用程序 | 内部分析师，支持决策 |
| 数据表征 | 最新的数据状态 | 随着时间变化的所有事件历史 |
| 数据规模 | GB到TB | TB到PB |


### 锁
加锁情况列举

- `select`：一致性读，读快照，仅当 `serializable` 隔离级别才上临键锁或索引记录锁。
- `update`：排他临键锁或索引记录锁。当修改聚集索引记录时，将对二级索引记录进行隐式锁定，对受影响的二级索引记录设置共享锁。
- `delete`：排他临键锁或索引记录锁。
- `insert`：插入意向间隙锁+对插入的行设置排他锁，仅索引记录锁，没有间隙锁，不会阻止其他会话插入新行到前面的间隙中。如果键重复，则在重复的索引记录上设置一个共享锁，遇到排他锁有死锁风险。 
   - `insert ... on duplicate key update`：键重复时设置排他锁

表级锁（MyISAM）：

- intention lock：意向锁，表明当前事务稍后要对表中的行进行哪种类型的锁定
- IX 锁：排他意向锁
- IS 锁：共享意向锁
- auto-inc lock：自增锁，`innodb_autoin_lock_mode` 可以控制是否打开自增锁 
   - 开启：保证自增序列
   - 关闭：insert 操作高并发

X锁与任何锁都冲突，IX锁与S锁冲突，其他锁之间是兼容的。

| 锁类型的兼容性 | X | IX | S | IS |
| --- | --- | --- | --- | --- |
| X | 冲突 | 冲突 | 冲突 | 冲突 |
| IX | 冲突 | 兼容 | 冲突 | 兼容 |
| S | 冲突 | 冲突 | 兼容 | 兼容 |
| IS | 冲突 | 兼容 | 兼容 | 兼容 |


行级锁（InnoDB）：

- 记录锁 record lock：始终锁定索引记录，即使没有定义索引的表也是如此。
- 间隙锁 gap lock： 
   - 对索引记录前后的间隙进行锁定。“纯抑制性的”，唯一目的是阻止其他事务在间隙中插入，不同事务可以在同一个间隙上持有冲突锁。
   - `RC`隔离级别会显式禁用间隙锁。在 WHERE 条件计算完成后, 会⽴即释放不匹配⾏的记录锁。 对于 UPDATE 语句, InnoDB执⾏“半⼀致性读(semi-consistent)”, 将最新的提交版本返回给MySQL, 以便MySQL确定该⾏是否与 UPDATE 的  WHERE 条件匹配。
   - 间隙锁在搜索和索引扫描时会被禁⽤, 只⽤于外键约束检查和重复键检查。
- 临键锁 = 记录锁 + 间隙锁（记录之前的间隙）next-key lock
- 插入意向锁 insert intention lock
- 谓词锁：空间索引使用，对包含 MBR（minimum bounding rectangle, 最⼩边界矩形）的索引强制执⾏⼀致性读，其他事务不能插入或修改。

死锁：

- 循环等待
- 互斥
- 请求和保持
- 不可剥夺

减少死锁：

-  优先使用事务 
-  让执行 `insert` 或 `update` 的事务足够小 
-  为 `update` 相关的列创建索引，也可以使用`explain select` 来确定默认使用哪个索引 
-  用查看最近发生的死锁：`show engine innodb status` 
-  打印死锁相关信息：`innodb_print_all_deadlocks` 选项 
-  如果经常发生死锁，使用 `Read Committed` 隔离级别，这样同一事务中的每次一致性读，都是从自己的新快照中读取 
-  实在不行，使用 `LOCK TABLES` 语句，表级锁可以防止其他会话对这张表进行并发更新 
```
SET autocommit=0;
LOCK TABLES t1 WRITE, t2 READ;
... do something with tables t1 and t2 here ...
COMMIT;
UNLOCK TABLES;
```


禁用死锁检测：`innodb_deadlock_detect` 选项

超时事务回滚：`innodb_lock_wait_timeout` 选项


### 14.1 MySQL 主从复制

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678176644083-93d202ba-03e4-4d07-9918-90e1d988a643.png)

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678176644113-79c883ea-58bf-47a6-a1c4-abc0d312027c.png)

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678176644611-bb9a588c-ea5c-4f24-90fc-2ae435f995be.png)

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678176644678-6ba0c10c-f1e7-44ec-a9e4-74b7f056c4aa.png)

主从复制的局限性：

1. 主从延迟问题
2. 应用侧需要配合读写分离框架
3. 不解决高可用问题

### 14.2  MySQL 高可用

#### 14.2.1 高可用

更少的不可服务时间

1年 = 365天 = 8760小时

99 -> 8760*1% = 87.6 小时

99.9 -> 8.76小时

99.99 -> 0.876 小时 = 52.6分钟

99.999 -> 5.26分钟

#### 14.2.2 MGR：MySQL Group Replication

特点：

1. 高一致性：基于 Paxos 协议实现组复制
2. 高容错性：自动检测机制，内置防脑裂保护机制
3. 高扩展性：节点的增加与移除会自动更新组成员信息，新节点加入后，自动从其他节点同步增量数据，直到与其他节点数据一致
4. 高灵活性：提供单主模式（宕机后能自动选主，在主节点进行写入）和多主模式（支持多节点写入）

搭配中间件：

1. MySQL Shell：配置管理 InnoDB Cluster
2. MySQL Router：提供负载均衡和应用连接的故障转移
3. orchestrator：高可用和复制拓扑管理工具，两种部署方式： 
   1. 一致性由 raft 协议保证，数据库之间不通信
   2. 一致性由数据库集群保证，数据库结点之间通信

### 15.0 数据库拆分

分库分表的选择：如果数据本身的读写压力较大，磁盘IO成为瓶颈，选择**分库**，使用不同磁盘可以并行提升整个集群的并行数据处理能力；相反，选择**分表**，减少单表操作的时间。

单机 MySQL 的技术演进

- 读写压力：多机集群，主从复制
- 高可用性：故障转移：MHA（Master High Availability）/MGR/Orchestrator
- 容量问题：数据库拆分，分库分表
- 一致性问题：分布式事务，XA/柔性事务
- 全部数据：数据复制，主从复制、备份与高可用
- 业务分类数据：垂直分库分表，分布式服务化、微服务
- 任意数据：水平分库分表，分布式结构、任意扩容

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678176644910-22c15d9f-7015-474a-9df1-5c20150509c2.png)

### 15.1 垂直拆分

优点：

1. 单表变小，便于管理和维护
2. 提升性能
3. 数据复杂度降低
4. 作为微服务改造的基础

缺点：

1. 库变多，管理复杂
2. 对业务系统有较强的侵入性
3. 改造过程复杂，容易出故障
4. 拆分有限度

做法：

1. 梳理拆分范围和影响范围
2. 评估影响到的服务
3. 准备新的数据库集群复制数据
4. 修改系统配置，发布新版上线

### 15.2 水平拆分

优点：

1. 解决容量问题
2. 对系统影响小
3. 部分提升性能和稳定性

缺点：

1. 集群规模大，管理复杂
2. 复杂SQL支持问题
3. 数据迁移问题
4. 一致性问题

数据的分类管理：

| 时间 | 标签 | 存储 |
| --- | --- | --- |
| 一周内下单但未支付 | 热数据 | 数据库和内存 |
| 三个月内 | 温数据 | 数据库，提供查询操作 |
| 三个月到三年 | 冷数据 | 从数据库删除，归档到便宜的磁盘，用压缩方式（tokuDB引擎）存储，邮件查询 |
| 三年以上 | 冰数据 | 备份到磁盘介质，不提供任何查询操作 |


### 16.1 分布式事务

强一致：XA

弱一致：

1. 不用事务，业务侧补偿冲正
2. 柔性事务，保证最终一致性

### 16.2 XA 分布式事务

又叫两阶段事务（2PC）

| 主流开源XA解决方案 | Atomikos | narayana | seata |
| --- | --- | --- | --- |
| TM | 去中心化，高性能 | 去中心化，高性能 | 中心化，低性能，bug多 |
| 日志存储 | **仅文件** | **文件，数据库** | 文件，数据库 |
| 扩展性 | 好 | 中 | 中 |
| 事务恢复 | **仅单机事务恢复** | **支持集群模式恢复** | 问题多 |
| XA实现 | 标准 | 标准 | 非标准 |


### 16.3 BASE 柔性事务：

对于互联网应用而言，随着访问量和数据量的激增，传统的单体架构模式将无法满足业务的高速发展。这时，开发者需要把单体应用拆分为多个独立的小应用，把单个数据库按照分片规则拆分为多个库和多个表。

数据拆分后，如何在多个数据库节点间保证本地事务的ACID特性则成为一个技术难题，并且由此而衍生出了CAP和BASE经典理论。

CAP理论指出，对于分布式的应用而言，不可能同时满足C（一致性），A（可用性），P（分区容错性），由于网络分区是分布式应用的基本要素，因此开发者需要在C和A上做出平衡。

由于C和A互斥性，其权衡的结果就是BASE理论。

对于大部分的分布式应用而言，只要数据在规定的时间内达到最终一致性即可。我们可以把符合传统的ACID叫做刚性事务，把满足BASE理论的最终一致性事务叫做柔性事务。

一味的追求强一致性，并非最佳方案。对于分布式应用来说，刚柔并济是更加合理的设计方案，即在本地服务中采用强一致事务，在跨系统调用中采用最终一致性。如何权衡系统的性能与一致性，是十分考验架构师与开发者的设计功力的。

![image.png](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678176645430-65382e1a-e0ae-4cf0-a73a-bba36f6e0f4f.png)

本地事务 -> XA(2PC) -> BASE

|  | 本地事务 | 2PC、3PC事务 | 柔性事务BASE |
| --- | --- | --- | --- |
| 业务改造 | - | - | 实现相关接口 |
| 一致性 | 不支持 | 支持 | 最终一致 |
| 隔离型 | 不支持 | 支持 | 业务方保证 |
| 并发性能 | 无影响 | 严重衰退 | 略微衰退 |
| 适合场景 | 业务方处理不一致 | 短事务&低并发 | 长事务&高并发 |


BASE：

- 基本可用（Basically Available）：分布式事务参与方不一定同时在线
- 柔性状态（Soft state）：允许系统更新有一定延时
- 最终一致性（Eventually consistent）：消息传递方式保证系统最终一致性

ACID 是在资源层面隔离事务，BASE 是在业务逻辑层面实现互斥。BASE通过放宽强一致性要求，来换取系统吞吐量的提升。

BASE 柔性事务常见模式：

1. TCC：通过手动补偿处理
2. AT：通过自动补偿处理

### 16.4 TCC/AT 以及相关框架

TCC 模式：对业务的侵入强，改造的难度大。

1. Try 准备：尝试执行业务，完成所有业务检查（一致性），预留业务资源（准隔离性）；
2. Confirm 确认：执行业务逻辑，只使用Try阶段预留的业务资源，操作满足幂等性，保证事务能且只能成功一次；
3. Cancel 取消：释放 Try 阶段预留的业务资源，操作也满足幂等性。

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678176645459-e18ccad1-4c78-4aec-b85d-ce633f747022.png)

TCC需要注意的几个问题：

1. 允许空回滚
2. 防悬挂控制
3. 幂等设计

AT模式：两阶段提交，自动生成反向SQL

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678176645562-8131274c-5e5e-4177-919c-b45a2ff958cf.jpeg)



---

> 作者: 都将会  
> URL: https://leni.fun/mysql_draft/  

