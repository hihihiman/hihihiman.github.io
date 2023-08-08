# MySQL 50 题


<!--more-->

### 数据源

```sql
-- 创建数据库exercise
create database exercise;

-- 使用数据库exercise
use exercise;

-- 创建学生表student
create table student
(Sno  varchar(10) not null,
      Sname varchar(10)        ,
      Sage  date               ,
      Ssex  varchar(10)        ,
      primary key (Sno));
start transaction;
insert into student values ('01', '赵雷', '1990-01-01', '男');
insert into student values ('02', '钱电', '1990-12-21', '男');
insert into student values ('03', '孙风', '1990-05-20', '男');
insert into student values ('04', '李云', '1990-08-06', '男');
insert into student values ('05', '周梅', '1991-12-01', '女');
insert into student values ('06', '吴兰', '1992-03-01', '女');
insert into student values ('07', '郑竹', '1989-07-01', '女');
insert into student values ('08', '王菊', '1990-01-20', '女');
commit;

-- 创建科目表course
create table course
(Cno varchar(10)  not null,
 Cname varchar(10)     ,
 Tno  varchar(10)      ,
 primary key (Cno));
start transaction;
insert into course values ('01', '语文', '02');
insert into course values ('02', '数学', '01');
insert into course values ('03', '英语', '03');
commit;

-- 创建教师表teacher
create table teacher
(Tno varchar(10)   not null,
 Tname varchar(10)  ,
 primary key (Tno));
strat transaction;
insert into teacher values ('01', '张三');
insert into teacher values ('02', '李四');
insert into teacher values ('03', '王五');
commit;

-- 创建成绩表 sc
create table sc 
(Sno varchar (10)    ,
 Cno varchar (10)    ,
 score decimal(18,1),
 primary key (Sno, Cno));
start transaction;
insert into SC values('01' , '01' , 80);
insert into SC values('01' , '02' , 90);
insert into SC values('01' , '03' , 99);
insert into SC values('02' , '01' , 70);
insert into SC values('02' , '02' , 60);
insert into SC values('02' , '03' , 80);
insert into SC values('03' , '01' , 80);
insert into SC values('03' , '02' , 80);
insert into SC values('03' , '03' , 80);
insert into SC values('04' , '01' , 50);
insert into SC values('04' , '02' , 30);
insert into SC values('04' , '03' , 20);
insert into SC values('05' , '01' , 76);
insert into SC values('05' , '02' , 87);
insert into SC values('06' , '01' , 31);
insert into SC values('06' , '03' , 34);
insert into SC values('07' , '02' , 89);
insert into SC values('07' , '03' , 98);
commit;
```

### 问题
- 1. 查询课程编号 01 比 02 高的学生的学号和姓名
- 3. 查询所有学生的学号、姓名、选课数和总成绩
- 5. 查询[没]学过'张三'老师课的学生的学号、姓名
- 6. 查询学过'张三'老师[所有课]的学生的学号、姓名
- 10. 查询没有学全所有课的学生的学号、姓名
- 12. 查询和'01'号同学所学课程完全相同的其他同学的学号
- 17. 按平均成绩从高到低显示所有学生的所有课程的成绩以及平均成绩
- 18. 查询各科成绩最高分、最低分、平均分，展示：课程号、课程名、最高分、最低分、平均分、及格率、中等率、优良率、优秀率
- 19. 按各科成绩排序，并显示排名 80 85 85 90
- 22. 查询所有课程的成绩第 2 名到第 3 名的学生信息和该课程成绩
- 23. 使用分段(100-85,85-70,70-60,<60)来统计各科成绩，分别统计各分段人数，课程 id 和课程名称
- 24. 查询学生的平均成绩及其名次
- 27. 查询出只有两门课程的全部学生的学号和姓名
- 28. 查询男女生人数
- 31. 查询 1990 年出生的学生名单
- 35. 查询所有学生的课程和分数情况
- 40. 查询选修张三老师所教课程的学生中最高的学生的姓名和成绩
- 41. 查询所有课程成绩相同的学生的学号、课程号、成绩
- 45. 查询选修了全部课程的学生信息
- 46. 查询各学生的年龄
- 48. 查询下周过生日的学生
- 50. 查询下个月过生日的学生

### 答案
```sql
-- 1. 查询课程编号 01 比 02 高的学生的学号和姓名
select a.s_id '学号', c.s_name '姓名'
from (select s_id, s_score 's01'
      from Score
      where c_id = '01') a
         inner join
     (select s_id, s_score 's02'
      from Score
      where c_id = '02') b
     on a.s_id = b.s_id
         inner join Student as c on c.s_id = a.s_id
where s01 > s02;

-- 3. 查询所有学生的学号、姓名、选课数和总成绩
select a.s_id '学号', a.s_name '姓名', sum(ifnull(b.s_score, 0)) '总成绩', count(b.c_id) '选课数'
from Student as a
         left join Score b on a.s_id = b.s_id
group by a.s_id, a.s_name;

-- 5. 查询[没]学过'张三'老师课的学生的学号、姓名
select s_id '学号', s_name '姓名'
from Student
where s_id not in (select s_id
                   from Score
                   where c_id = (select c_id
                                 from Course
                                 where t_id = (select t_id
                                               from Teacher
                                               where t_name = '张三')));
select s_id '学号', s_name '姓名'
from Student
where s_id not in (select s_id
                   from Score as s
                            inner join Course as c on s.c_id = c.c_id
                            inner join Teacher t on c.t_id = t.t_id
                   where t.t_name = '张三');

-- 6. 查询学过'张三'老师[所有课]的学生的学号、姓名
select s.s_id '学号', s.s_name '姓名'
from Student as s
         inner join Score s2 on s.s_id = s2.s_id
         inner join Course c on s2.c_id = c.c_id
         inner join Teacher t on c.t_id = t.t_id
where t.t_name = '张三'
group by s.s_id
having count(*) = (select count(*)
                   from Course c
                            inner join Teacher t on c.t_id = t.t_id
                   where t_name = '张三'
                   group by t.t_id, t.t_name);


-- 10. 查询没有学全所有课的学生的学号、姓名
select s.s_id '学号', s.s_name '姓名'
from Student as s
         left join Score s2 on s.s_id = s2.s_id
group by s.s_id
having count(distinct c_id) < (select count(distinct c_id)
                               from Course);

-- 12. 查询和'01'号同学所学课程完全相同的其他同学的学号
select distinct s.s_id '学号', s.s_name '姓名'
from Student as s
         inner join Score s2 on s.s_id = s2.s_id
-- 去除选了 01 学生所学课程之外课程的学生
where s2.s_id not in
      (select s_id
       from Score
       where c_id not in (select c_id
                          from Score
                          where s_id = '01'))
  and s.s_id != '01'
group by s.s_id, s.s_name
having count(distinct c_id) = (select count(*)
                               from Score
                               where s_id = '01');

-- 17. 按平均成绩从高到低显示所有学生的所有课程的成绩以及平均成绩
select distinct s.s_id     '学号',
                st.s_name  '姓名',
                c_01_score '语文',
                c_02_score '数学',
                c_03_score '英语',
                c_04_score '奥数',
                avg_score  '平均成绩'
from Score s
         inner join (select s_id,
                            max(case when c_id = '01' then s_score end) 'c_01_score',
                            max(case when c_id = '02' then s_score end) 'c_02_score',
                            max(case when c_id = '03' then s_score end) 'c_03_score',
                            max(case when c_id = '04' then s_score end) 'c_04_score',
                            avg(s_score)                                'avg_score'
                     from Score
                     group by s_id) s2 on s.s_id = s2.s_id
         inner join Student st on s.s_id = st.s_id
order by avg_score desc;

-- 18. 查询各科成绩最高分、最低分、平均分，展示：课程号、课程名、最高分、最低分、平均分、及格率、中等率、优良率、优秀率
select sc.c_id                                                              '课程号',
       c.c_name                                                             '课程名',
       max(sc.s_score)                                                      'max',
       min(sc.s_score)                                                      'min',
       avg(sc.s_score)                                                      'avg',
       sum(IF(sc.s_score >= 60, 1, 0)) / count(sc.s_id)                     '及格率',
       sum(IF(sc.s_score >= 70 and sc.s_score < 80, 1, 0)) / count(sc.s_id) '中等率',
       sum(IF(sc.s_score >= 80 and sc.s_score < 90, 1, 0)) / count(sc.s_id) '优良率',
       sum(IF(sc.s_score >= 90, 1, 0)) / count(sc.s_id)                     '优秀率'
from Score sc
         inner join Course c on sc.c_id = c.c_id
group by sc.c_id;

-- 19. 按各科成绩排序，并显示排名 80 85 85 90
-- MySQL 8.0 窗口函数：不会改变记录条数
-- row_number() 排序不会重复 1 2 3 4 没有并列
-- dense_rank() 有并列，1 2 2 3 最后一名不一定等于总人数
-- rank() 有并列， 1 2 2 4 月考排名
select *,
       rank() over (partition by c_id order by s_score desc)       'rank',
       dense_rank() over (partition by c_id order by s_score desc) 'dense_rank',
       row_number() over (partition by c_id order by s_score desc) 'row_number'
from Score;
# where c_id ='01';

-- 测试最左匹配原则
CREATE INDEX idx_test2
    ON Student (s_birth, s_name, s_sex);
explain
select s_name
from Student
where s_birth = '12345'
#     and s_name = '赵雷'
  and s_sex = '男';

-- 22. 查询所有课程的成绩第 2 名到第 3 名的学生信息和该课程成绩
-- row_number() 排序不会重复 1 2 3 4 没有并列 (见 19 题)
select *
from (select sc.c_id                                                        '课程号',
             C.c_name                                                       '课程',
             sc.s_score                                                     '分数',
             row_number() over (partition by sc.c_id order by s_score desc) 'sort',
             st.*
      from Score sc
               inner join Student st on sc.s_id = st.s_id
               join Course C on sc.c_id = C.c_id) a
where sort in (2, 3);

-- 23. 使用分段(100-85,85-70,70-60,<60)来统计各科成绩，分别统计各分段人数，课程 id 和课程名称
select c.c_id                                               '课程 id',
       c.c_name                                             '课程名称',
       sum(IF(sc.s_score <= 100 and sc.s_score > 85, 1, 0)) '100-85',
       sum(IF(sc.s_score <= 85 and sc.s_score > 70, 1, 0))  '85-70',
       sum(IF(sc.s_score <= 70 and sc.s_score > 60, 1, 0))  '70-60',
       sum(IF(sc.s_score < 60, 1, 0))                       '<60'
from score as sc
         inner join Course c on sc.c_id = c.c_id
group by c.c_id, c.c_name;

-- 24. 查询学生的平均成绩及其名次
-- 可以没有 partition by
select s.s_id '学号', st.s_name '姓名', avg(s_score) '平均分', rank() over (order by avg(s.s_score) desc) 'rank'
from Score s
         join Student st on s.s_id = st.s_id
group by s.s_id;

-- 27. 查询出只有两门课程的全部学生的学号和姓名
select s_id '学号', s_name '姓名'
from Student
where s_id in (select s.s_id
               from Score s
               group by s.s_id
               having count(distinct s.c_id) = 2);

-- 28. 查询男女生人数
-- 两行
select s_sex, count(s_sex)
from Student
group by s_sex;
-- 列转行，同一行展示
select sum(if(s_sex = '男', 1, 0)) '男生数', sum(if(s_sex = '女', 1, 0)) '女生数'
from Student;

-- 31. 查询 1990 年出生的学生名单
-- 日期 varchar 存储时（不推荐）
select *
from Student
where s_birth like '1990%';
-- year() 函数，兼容多种格式:
-- YYYY-MM-DD
-- YYYYMMDD
-- YYYY/MM/DD
-- YYMMDD
select *
from Student
where year(s_birth) = 1990;

-- 35. 查询所有学生的课程和分数情况
select s.s_id                                      '学号',
       s2.s_name                                   '姓名',
       max(if(c.c_name = '数学', s.s_score, null)) '数学成绩',
       max(if(c.c_name = '语文', s.s_score, null)) '语文成绩',
       max(if(c.c_name = '英语', s.s_score, null)) '英语成绩',
       max(if(c.c_name = '奥数', s.s_score, null)) '奥数成绩'
from Score s
         inner join Course c on s.c_id = c.c_id
         inner join Student s2 on s.s_id = s2.s_id
group by s.s_id, s2.s_name;

-- 40. 查询选修张三老师所教课程的学生中最高的学生的姓名和成绩
explain
select *
from (select sc.c_id                                                  '课程号',
             c.c_name                                                 '课程名',
             sc.s_score                                               '成绩',
             st.s_id                                                  '学号',
             st.s_name                                                '姓名',
             rank() over (partition by sc.c_id order by s_score desc) 'rank'
      from Score sc
               inner join Course c on sc.c_id = c.c_id
               inner join Student st on sc.s_id = st.s_id
               inner join Teacher t on c.t_id = t.t_id
      where t.t_name = '张三') a
where `rank` = 1;

-- 41. 查询所有课程成绩相同的学生的学号、课程号、成绩
select s_id '学号', c_id '课程号', s_score '成绩'
from Score
where s_id =
      (select a.s_id as_id
       from (select s_id, s_score, count(*) count
             from Score
             group by s_id, s_score) a
       where count > 1);

-- 45. 查询选修了全部课程的学生信息
select *
from Student
where s_id = (select s_id
              from Score
              group by s_id
              having count(distinct c_id) = (select count(*) from Course));

-- 46. 查询各学生的年龄
-- datediff（a,b）两个时间相差几天
-- round 四舍五入取整
-- floor 向下取整
select s_id, s_name, s_birth, floor(DATEDIFF(now(), s_birth) / 365)
from Student;

-- 48. 查询下周过生日的学生
select *, week('1990-05-20', 1), week('2019-05-20', 1), concat(year(now()), substring(s_birth, 5, 6))
from Student
-- week函数对于不同年份会有一点问题
# where week(s_birth,1) = week(now(),1)+1
where week(now(), 1) + 1 = week(concat(year(now()), substring(s_birth, 5, 6)), 1);

-- 50. 查询下个月过生日的学生
select *
from Student
# where month(s_birth) = if(month(now()) = 12, 1, month(now()) + 1)
where month(s_birth) = month(date_add(now(),interval 1 month ));
```


---

> 作者: 都将会  
> URL: https://leni.fun/mysql-50-%E9%A2%98/  

