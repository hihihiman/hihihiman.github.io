# 🚩MySQL


<!--more-->

![image.png](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1681975245174-4b0669a4-d72e-4d09-aca5-d4df06397181.png)

### MySQL 中的锁

InnoDB 引擎加锁的本质是锁住索引记录（可以理解为 B+树的叶子节点）。在可重复读 RR 的隔离级别下，

- 一般都加临键锁，左开右闭 （防止幻读）
- 上界无穷间隙锁
- 唯一索引等值查询记录锁

### Innodb 和 MyISAM 的区别？

1. innodb 支持事务和外键
2. innodb 默认表锁，使用索引检索条件时是行锁，而 myisam 是表锁（每次更新增加删除都会锁住表）
3. innodb 和 myisam 的索引都是基于 b+树，但 innodb 的 b+树的叶子节点是存放数据的，**myisam 的 b+树的叶子节点是存放指针的**
4. **innodb 是聚簇索引，必须要有主键，一定会基于主键查询，但是辅助索引就会查询两次，myisam 是非聚簇索引，索引和数据是分离的，索引里保存的是数据地址的指针，主键索引和辅助索引是分开的。**
5. innodb 不存储表的行数，所以 select count( _ )的时候会全表查询，而 myisam 会存放表的行数，select count(_）的时候会查的很快。
6. **MyISAM 存储限制 256TB，更适合低并发、弱一致性场景；Innodb 存储限制 64TB，更适合高并发、更新频繁的场景。**

### 结构化查询语言的 6 个部分

- DDL：Data Define Language，数据定义语言，如 CREATE、ALTER、DROP
- DML：Data Manipulation Language，数据操作语言，如 INSERT、UPDATE、DELETE
- DQL：Data Query Language，数据查询语言，如 SELECT、WHERE、ORDER BY、GROUP BY、HAVING
- TCL：Transactional Control Language，事务控制语言，确保 DML 影响的所有行及时得以更新，如 COMMIT、SAVEPOINT、ROLLBACK
- DCL：Data Control Language，数据控制语言，实现权限控制，如 GRANT、REVOKE
- CCL：Cursor Control Language，指针控制语言，如 DECLARE CURSOR、FETCH INTO、UPDATE WHERE CURRENT

### binlog 、redolog 和 undolog 的区别？

- binlog： 所有引擎**增量记录逻辑日志（二进制）**
  - 数据库还原
  - 主从同步（Canal 类中间件本质是把自己伪装成从节点）：
    - 主库提交，将 DDL 与 DML 数据写入 binlog；
    - 从库将主库的 binlog 写入自己的中继日志 **relay log**
    - 从库执行 relay log 中的事件
  - `sync_binlog = 0`：写入 page cache 就算成功（默认）
  - `sync_binlog = N`：每提交 N 次就刷新到磁盘，N 越小性能越差。
- redolog：InnoDB **循环记录物理日志**（某个页的修改），大小固定，写到结尾时，会回到开头循环写日志，保证了持久性。
  - 先更新 buffer pool，再写 redo log，等事务结束后刷盘到磁盘
  - 顺序写，性能优于随机写
- undolog： 记录逻辑相反操作逻辑日志，用于回滚
  - delete：记录主键逻辑删除
  - insert：记录主键
  - update
    - 没有更新主键：主键+原值
    - 更新主键：delete+insert

#### 事务执行过程

![image.png](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1691041539662-bce37b97-6a2f-4a4f-9de9-89cb088faa79-20230808082056219.png)

宕机情形：

- 在 redo log 刷新到磁盘（事务提交）之前，都是回滚 undo log。
- 如果在 redo log 已经刷新到磁盘，在 MySQL 重启之后就会回放这个 redo log，以纠正数据库里的数据。

### 分库分表 - sharding-sphere 中间件

- 水平分库：应对大数据，对性能要求不同的数据进行分库 `sync_binlog = 0/1`
- 垂直分库：根据业务进行拆分微服务
- **垂直分表：冷热数据分离（零零播项目中的 user、streamer、owner）**

### 索引分类

- 聚簇/非聚簇：叶子节点是否存储行数据
- 覆盖索引：索引包含某次查询的所有列
- 唯一索引 unique：可以为空，但最多一个空
- 主键索引 primary key：不能为空
- 前缀索引：可以选择在 varchar(128)的列上选择前 32 个字符作为索引
- 联合索引：最左匹配原则
- 全文索引 full text ：支持文本模糊查询用于 char、varchar、text
- 哈希索引：Innodb 和 MyISAM 都不适用

### 如何使用慢 SQL 优化？

```sql
# 开启慢查询日志
SET GLOBAL slow_query_log = 'ON';
# 蛮查询日志存放位置
SET GLOBAL slow_query_log_file = 'var/lib/mysql/slow_query.log'
# 未被索引的记录
SET GLOBAL log_queries_not_using_indexes = 'ON';
# 慢查询阈值（秒）
SET SESSION long_query_time = 1;
# 慢查询记录扫描行数阈值
SET SESSION min_examined_row_limit = 100;
```

找到慢 SQL 之后，用 `EXPLAIN` 命令分析：

1. possible_key：可能用到的索引
2. key：实际命中的索引
3. key_len：索引占用的大小
4. rows：扫描的行数
5. filtered：所需数据占 rows 的比例
6. extra：额外的优化建议
   1. Using where；Using Index 用到索引，不用回表
   2. Using index** condition** 用到索引，需要**回表**
7. type：性能从好到差
   1. system：mysql 自带的表
   2. const：根据主键查询
   3. eq_ref：主键索引/唯一索引
   4. ref：索引查询
   5. range：范围查询
   6. index：索引树扫描
   7. all：全盘扫描

#### 选择索引列

1. 数据量大、查询频繁的表，涉及 where、orderby、groupby 频繁的字段
2. 区分度高的字段建立唯一索引或放在左边
3. 字符串类型优先使用前缀索引，占用空间更小
4. `not null` 约束

#### 不选择索引情况

1. 被频繁更新的字段
2. 长期未使用的索引：sys 库的`schema_unused_indexes`视图

### 索引失效情况？

1. 没有覆盖索引，如 select \*
2. 联合索引未遵循最左前缀原则
   1. Mysql 从左到右的使用索引中的字段，一个查询可以只使用索引中的一部份，但只能是最左侧部分
   2. 例如索引是 key index （a,b,c）。 可以支持 a 、a,b 、a,b,c 3 种组合进行查找，但不支持 b,c 进行查找。
3. 范围查询右边的列会失效，范围过大也会导致全表扫描
4. 在索引列上运算操作
   1. 如果查询中必须使用函数或表达式，而且这些函数或表达式无法使用索引加速查询，那么可以考虑使用计算列（Computed Column）来加速查询。计算列是一种特殊的列，它的值是通过计算得到的，而不是直接存储在表中。在 MySQL 中，可以使用虚拟列（Virtual Column）或存储列（Stored Column）来实现计算列。虚拟列是一种只存在于查询结果中的计算列，它不会在表中存储任何数据。虚拟列可以使用表达式来计算，例如：`ALTER TABLE table ADD COLUMN virtual_col INT AS (YEAR(date_col)) VIRTUAL;`
5. like '%abc'
6. or 的前后条件中有一个列没有索引，涉及的索引也失效
7. in()查询时，应该尽可能减少值列表的长度，避免查询转化成过长的 OR 子句，以及避免在查询中使用 NULL 值。

### 🌟 什么是聚簇索引？

> 每个表在 MySQL 中对应着一个聚簇索引和多个辅助索引，每个索引都对应一个独立的 B+ 树。每个 B+ 树索引都包含了相应索引类型的所有索引键值，但并不是一个单独的 B+ 树索引包含了所有的索引键值。所以，可以说在 MySQL 中，每个表对应多棵 B+ 树索引。

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678155173320-852872be-de47-4708-bcdb-0b3afdf3ccf8-20230808082056230.jpeg)

- 聚簇索引：叶子节点保存了行数据，有且只有一个聚簇索引。
  - 主键 pk > 唯一索引 unique > 自动生成 row_id
- 非聚簇索引：叶子节点关联主键，指向了数据的对应行，若没有覆盖索引则需要回表走聚簇索引。

聚簇索引的优点：

1. 由于行数据和叶子节点存储在一起，同一页中会有多条行数据，访问同一数据页不同行记录时，已经把页加载到了 Buffer 中，再次访问的时候，会在内存中完成访问，不必访问磁盘。这样主键和行数据是一起被载入内存的，找到叶子节点就可以立刻将行数据返回了，如果按照主键 Id 来组织数据，获得数据更快。
2. 辅助索引使用主键作为"指针"而不是使用地址值作为指针的好处是，减少了当出现行移动或者数据页分裂时辅助索引的维护工作，使用主键值当作指针会让辅助索引占用更多的空间，换来的好处是 InnoDB 在移动行时无须更新辅助索引中的这个"指针"。也就是说行的位置（实现中通过 16K 的 Page 来定位）会随着数据库里数据的修改而发生变化（前面的 B+树节点分裂以及 Page 的分裂），使用聚簇索引就可以保证不管这个主键 B+树的节点如何变化，辅助索引树都不受影响。
3. 聚簇索引适合用在排序的场合，非聚簇索引不适合
4. 取出一定范围数据的时候，使用用聚簇索引
5. 二级索引需要两次索引查找，而不是一次才能取到数据，因为存储引擎第一次需要通过二级索引找到索引的叶子节点，从而找到数据的主键，然后在聚簇索引中用主键再次查找索引，再找到数据
6. 可以把相关数据保存在一起。例如实现电子邮箱时，可以根据用户 ID 来聚集数据，这样只需要从磁盘读取少数的数据页就能获取某个用户的全部邮件。如果没有使用聚簇索引，则每封邮件都可能导致一次磁盘 I/O。

### 🌟SQL 优化经验？

1. 避免 select \*，主查询聚簇索引，子查询覆盖索引
2. **用 union all **代替 union（去重、排序消耗性能）
3. where 语句中不使用表达式，防止索引失效
4. 能**用 inner join**（优先以小表驱动大表） 就不用 left/right join。
5. 将 HAVING 中部分条件提前到 WHERE 里
6. 用 EXPLAIN 返回的预估行数

```
SELECT rows FROM (EXPLAIN SELECT * FROM xxx WHERE uid = 123) a;
```

7. 将 RR 降低为 RC，避免临键锁引发死锁，提高性能。
   1. 可以通过缓存第一次数据，来避免第二次查询，来保证几乎全部事务内部对某一数据都只读取一次
   2. 可以单独指定 Session 或者事务的隔离级别。

### 🌟 并发事务问题

#### 隔离级别

- 脏读：读到其他事务未提交的数据
- 不可重复读：同一事务内，先后读取的数据不同，因为其他事务 update 或 delete 会影响结果集。
- 幻读：同一事务内，先后读取的 count 不同。例如，查询时没有某 id，插入时 id 已存在。
  - 原因：加锁后，不锁定间隙，其他事务可以 INSERT，导致相同的查询在不同的时间得到不同的结果。
  - 解决方案：使用**临键锁**，对于使用了唯一索引等唯一查询条件，InnoDB 只锁定索引记录，不锁定间隙；对于其他查询条件，InnoDB 会**锁定扫描到的索引范围**，通过临键锁来阻止其他会话在这个范围中插入新值。
- RU 读未提交：脏读、不可重复读、幻读都会出现
- RC 读已提交：解决脏读，每一次快照读时生成** ReadView 读取自己的新快照**
  - 多数数据库默认
  - 仅支持基于行的 bin log
  - 当一个事务启动时，数据库会为该事务创建一个版本链，该版本链包含了数据库中所有数据对象的所有版本。当事务读取数据时，数据库会根据事务的启动时间戳选择相应的版本，并且在版本链中添加一个新的版本，以保证该事务所读取的数据不会被其他事务修改。
- RR 可重复读：解决不可重复读，**仅第一次生成 ReadView 的活跃事务 m_ids，后续复用（一致性快照）**
  - **聚簇索引更新 = 替换，非聚簇索引更新 = 删除+新建**
  - MVCC = multiple version concurrent control 多版本并发控制
    - 目的：高并发场景下，锁的性能差，MVCC 可以避免读写阻塞
    - **DB_ROW_ID：隐藏列**
    - **DB_ROLL_PIR：回滚指针**，指向这条记录的上一版本
      - 版本链存储在 undo log 中
    - **DB_TRX_ID：最近修改的事务 id**
  - **理论上 RR 存在幻读，但 MySQL 临键锁 next key lock 解决了幻读问题**
  - **问：如何保证 REPEATABLE READ 级别绝对不产⽣幻读？**
    - **答**：在 SQL 中加⼊** for update (排他锁) 或 lock in share mode (共享锁)**语句实现。就是锁住了可能造成幻读的数据，阻⽌数据的写⼊操作。
- Serializable 串行化
  - 加锁读：在每一行数据上都加锁，导致大量的超时和锁争用的问题，只有在非常需要确保数据一致性并且可以接受没有并发的情况下，才考虑采用该级别

#### 事务特性

- Atomic 原子性
  - 一个事务要么全部提交，要么全部回滚
  - 通过 **undo log 记录逻辑日志**，回滚时通过逆操作来恢复
    - 保存位置：system tablespace(mysql5.7) 或 undo tablespaces(mysql8.0)
- Consistent 一致性
  - 事务总是由一种状态转换为另一种状态，而不会停留在执行中的某个状态
  - A、I、D 同时作用，保证了 C（一致性）
- Isolate 隔离性
  - **读写隔离：MVCC，undo log 版本链（从最新记录依次指向最旧记录的链表），ReadView 在 RC 和 RR 的不同**
  - 写写隔离：锁
- Ddurable 持久性
  - 事务只要提交了，那么数据库中的数据也永久的发生了变化
  - 通过 **redo log 增量**记录数据页的**物理**变化，**服务宕机时用来同步数据，先写日志，再写磁盘**
  - 日志文件：【ib_logfile0】【ib_logfile1】
  - 日志缓冲：innodb_logh_buffer_size
  - 强刷：fsync()

### delete/truncate/drop 的区别？

- DELETE 删除表中的行，不删除表本身
  - 项目中一般使用逻辑删除，增加 deleted 字段
- TRUNCATE 删除表，再创建一个空表
  - 初始化数据
- DROP 删除表

### 数据迁移

```java
mysqldump -u root -p db_name > 'Desktop/test.sql'
```

1. 加快导入速度

- 关闭唯一性检查
- 开启 extended-insert 将多行合并为一个 INSERT 语句
- 关闭 binlog，迁移后再开启
- 调整 redolog 时机

2. 数据校验
   1. 先读 binlog，不一致再读源表，以源表为准。
   2. 先读从库，不一致再读主库，以主库为准。
3. 增量同步数据

- 时间戳
- binlog

### 难点

Situation：出现离职人员被企业微信机器人 at 的问题
Action-Wrong：在触发机器人消息的时候查询人员最新状态是否离职，离职则不 at【治标不治本】
Task：用户登录以后需要更新几个字段的数据，如果存在则更新，不存在则插入，最新数据来自于其他部门员工账户中心的微服务，（经过适配器设计模式，有些字段需要转化，有些字段直接复制，比如离职时间为 null 代表未离职，更新为 0），信息需要通过用户 id 查询，一个接口只能查询 100 条。
Action-Wrong：会有死锁的可能性：并发+业务耗时 = **两个临键锁发生死锁**

```sql
BEGIN;
// for update 为悲观锁
SELECT * FROM biz WHERE id = ? FOR UPDATE
// 中间有很多业务操作
INSERT INTO biz(id, data) VALUE(?, ?);
COMMIT;
```

Action：

1. ✓ 不管有没有数据，直接插入，规避死锁。
2. 调整隔离级别为 RC（影响太大）
3. **乐观锁**（数据库的 CAS 操作，引入 version 列，或者使用 update_time 来确保数据没有发生变更）

Result
解决了问题，同时杜绝了死锁的发生，如果使用乐观锁还能提升性能。


---

> 作者: 都将会  
> URL: https://leni.fun/mysql/  

