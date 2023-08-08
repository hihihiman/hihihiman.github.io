# 🚩ElasticSearch




### 技术选型

mongodb：增删改查
es：大数据搜索
lucene：分布式搜索

### 倒排索引
根据分词找到文档id，根据文档id找到文档。
索引：帮助快速搜索，以数据结构为载体，以文件的形式落地。

1. 切词：word segmentation
2. 规范化：normalization
3. 去重：distinct
4. 字典序：sorted

<!--more-->

### 日志采集 ELK

- LogStash 筛选
- ElasticSearch 存储
- Kibana 可视化

### 1. Elasticsearch 和传统数据库有什么区别？
传统数据库通常是关系型数据库，而 Elasticsearch 是一个非关系型数据库。传统数据库主要用于存储结构化数据，而 Elasticsearch 主要用于存储非结构化数据。传统数据库的查询通常是基于 SQL 的，而 Elasticsearch 的查询是基于 JSON 的。
### 2. Elasticsearch 的数据结构是怎样的？
Elasticsearch 的数据结构是基于文档和索引的。每个文档代表一个数据实体，每个索引代表一个数据集合。每个文档可以包含多个字段，每个字段可以是不同的数据类型，例如文本、数字、日期等等。
### 3. Elasticsearch 的查询语言是什么？
Elasticsearch 的查询语言是基于 JSON 的查询语言。它可以使用各种查询类型，例如 match、term、range、bool 等等，来实现各种复杂的查询操作。
### 4. 相关代码
```java
// 创建一个 Elasticsearch 客户端对象
RestHighLevelClient client = new RestHighLevelClient(
    RestClient.builder(new HttpHost("localhost", 9200, "http"))
);

// 执行一个聚合操作
SearchRequest request = new SearchRequest("my_index");
SearchSourceBuilder builder = new SearchSourceBuilder();
builder.aggregation(AggregationBuilders.terms("by_user").field("user"));
request.source(builder);
SearchResponse response = client.search(request, RequestOptions.DEFAULT);

// 解析聚合结果
Terms byUser = response.getAggregations().get("by_user");
for (Terms.Bucket bucket : byUser.getBuckets()) {
    String user = bucket.getKeyAsString();
    long count = bucket.getDocCount();
    System.out.println(user + ": " + count);
}
// ------------------------------------------------------------------

// 构建一个查询条件
SearchRequest request = new SearchRequest("my_index");
SearchSourceBuilder builder = new SearchSourceBuilder();
builder.query(QueryBuilders.matchQuery("message", "hello"));
request.source(builder);

// 执行查询操作
SearchResponse response = client.search(request, RequestOptions.DEFAULT);

// 解析查询结果
SearchHits hits = response.getHits();
for (SearchHit hit : hits) {
    String id = hit.getId();
    String message = hit.getSourceAsMap().get("message").toString();
    System.out.println(id + ": " + message);
}

// 关闭 Elasticsearch 客户端对象
client.close();
```

- 创建一个 Elasticsearch 客户端对象 RestHighLevelClient
- 创建索引 CreateIndexRequest
- 添加一个文档 IndexRequest
- 更新一个文档 UpdateRequest
- 删除一个文档 DeleteRequest
- 搜索文档 SearchRequest
   - 查询条件 SearchSourceBuilder
   - 查询结果 SearchHits


---

> 作者: 都将会  
> URL: https://leni.fun/elasticsearch/  

