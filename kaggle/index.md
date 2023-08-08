# Kaggle


<!--more-->

## 导学

### 赛题

- 结构化(>50%)： 规整，纬度固定
- 自然语言
- 语音识别
- 计算机视觉
### 时间轴

- entry deadline： 最晚参赛时间
- team merger deadline： 最晚组队时间
- final submission deadline： 最终提交截止时间

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678173503964-0fa4780e-1e17-4d40-ab7a-e9b0521111a3.png)
## 结构化
### 树模型
适用场景： 类别字段较多、聚合特征较多
#### XGBoost(2015)
https：//xgboost.readthedocs.io/en/latest

- 优点：提出时间较早的高阶树模型，精度较好
- 缺点：训练时间较长，对类别特征支持不友好
- 接口：sklearn接口和原生接口
#### LighGBM(2018)
https：//lightgbm.readthedocs.io/en/latest

- 优点：对节点分裂进行改进，速度有一定提升
- 缺点：加入了随机性，精度和稳定性有所下降
- 接口：sklearn接口和原生接口
#### CatBoost(2019)
https：//catboost.ai/

- 优点：支持类别和字符串分裂
- 缺点：容易过拟合
- 接口：sklearn接口和原生接口
### 数据集Dataset
training set
test set：一般不能用来训练；可能分为AB榜单
validation set
只要有反馈，就有过拟合

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678173503997-92e580cd-7849-46b8-ac79-bcf5b6f8d5c1.png)

### 模型集成
![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678173504119-270cdb5d-ed0f-475b-8a05-7f596fe4c771.png)

- vote 投票
- blend 加权
- stacking 交叉验证中对模型进行多折训练
#### 深度学习模型集成

- dropout 随机删减网络结构
- snapshot 集成多个局部最优

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678173504125-64249aed-8f28-4b38-9477-6cd7fb26c1e3.png)
### 特征工程
决定了模型的精度上限
#### 类别特征

- Onehot：one-of-k，100、010、001 增加数据维度，一般适用于取值个数小于10
- LabelEncoder：标号，不增加维度，默认字典顺序
- Ordinal Encoding：可以手动给定编号
- BinaryEncoder：二进制编码（压缩版 Onehot）
- Frequency/Count Encoding：计数（训练集和测试集取值需要一致）
- Mean/Target Encoding：帮助模型快速收敛，但很容易过拟合
#### 数值特征
容易出现异常值和离群点

- Round：取整（防止模型去学习细枝末节的规律）
- Box/Bins：分类
#### 日期字段
需要特殊处理（登录日志、消费时间）

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678173504136-69599bfb-6ae0-4218-a87e-3d381e7f6338.png)

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678173505071-614951d5-1273-4d82-a321-d0376d775c71.png)





---

> 作者: 都将会  
> URL: https://leni.fun/kaggle/  

