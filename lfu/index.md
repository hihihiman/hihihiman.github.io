# LFU


<!--more-->

## [460]LFU 缓存.java

请你为 最不经常使用（LFU）缓存算法设计并实现数据结构。 实现 LFUCache 类： LFUCache(int capacity) - 用数据结构的容量 capacity 初始化对象 

- int get(int key) - 如果键存在于缓存中，则获取键的值，否则返回 -1。
- void put(int key, int value) - 如果键已存在，则变更其值；如果键不存在，请插入键值对。当缓存达到其容量时，则应该在插入新项之前，使最不经常使用的项无效。在此问题中，当存在平局（即两个或更多个键具有相同使用频率）时，应该去除 最近最久未使用 的键。 

注意「项的使用次数」就是自插入该项以来对其调用 get 和 put 函数的次数之和。使用次数会在对应项被移除后置为 0 。 

为了确定最不常使用的键，可以为缓存中的每个键维护一个 使用计数器 。使用计数最小的键是最久未使用的键。 

当一个键首次插入到缓存中时，它的使用计数器被设置为 1 (由于 put 操作)。对缓存中的键执行 get 或 put 操作，使用计数器的值将会递增。 

### 思路

1. 需要 3 个 Map 来实现三对映射关系其中，一个 key 可能对应多个频率，在 Java 语言中可以使用 **LinkedHashSet**；

1. 1. key -> value 键映射值，
   2. key -> freq 键映射频率，
   3. freq -> key 频率映射键，

1. LFU 的核心在于要同步更新三个 map，所以细节的把握非常重要；
2. get 方法根据 key 去 key-value 的 Map 中找，并增加该 key 的频率；
3. put 方法需要考虑缓存大小超出给定容量的情况，若 key 是第一次出现，则需要淘汰一个频率最小的 key，并添加新的 key-value 对；若原本就存在 key，则更新它的 value，并自增它的频率。

### 代码

```java
class LFUCache {
    // key 到 val 的映射，我们后文称为 KV 表
    HashMap<Integer, Integer> keyToVal;
    // key 到 freq 的映射，我们后文称为 KF 表
    HashMap<Integer, Integer> keyToFreq;
    // freq 到 key 列表的映射，我们后文称为 FK 表
    HashMap<Integer, LinkedHashSet<Integer>> freqToKeys;
    // 记录最小的频次
    int minFreq;
    // 记录 LFU 缓存的最大容量
    int capacity;

    public LFUCache(int capacity) {
        keyToVal = new HashMap<>();
        keyToFreq = new HashMap<>();
        freqToKeys = new HashMap<>();
        this.capacity = capacity;
        this.minFreq = 0;
    }

    public int get(int key) {
        if (!keyToVal.containsKey(key)) {
            return -1;
        }
        increaseFreq(key);
        return keyToVal.get(key);
    }
    
    public void put(int key, int value) {
        if (this.capacity <= 0) {
            return;
        }

        /* 若 key 已存在，修改对应的 val 即可 */
        if (keyToVal.containsKey(key)) {
            keyToVal.put(key, value);
            // key 对应的 freq 加一
            increaseFreq(key);
            return;
        }

        /* key 不存在，需要插入 */
        /* 容量已满的话需要淘汰一个 freq 最小的 key */
        if (this.capacity <= keyToVal.size()) {
            removeMinFreqKey();
        }

        /* 插入 key 和 val，对应的 freq 为 1 */
        // 插入 KV 表
        keyToVal.put(key, value);
        // 插入 KF 表
        keyToFreq.put(key, 1);
        // 插入 FK 表
        freqToKeys.putIfAbsent(1, new LinkedHashSet<>());
        freqToKeys.get(1).add(key);
        // 插入新 key 后最小的 freq 肯定是 1
        this.minFreq = 1;
    }

    private void increaseFreq(int key) {
        int freq = keyToFreq.get(key);
        /* 更新 KF 表 */
        keyToFreq.put(key, freq + 1);
        /* 更新 FK 表 */
        // 将 key 从 freq 对应的列表中删除
        freqToKeys.get(freq).remove(key);
        // 将 key 加入 freq + 1 对应的列表中
        freqToKeys.putIfAbsent(freq + 1, new LinkedHashSet<>());
        freqToKeys.get(freq + 1).add(key);
        // 如果 freq 对应的列表空了，移除这个 freq
        if (freqToKeys.get(freq).isEmpty()) {
            freqToKeys.remove(freq);
            // 如果这个 freq 恰好是 minFreq，更新 minFreq
            if (freq == this.minFreq) {
                this.minFreq++;
            }
        }
    }

    private void removeMinFreqKey() {
        // freq 最小的 key 列表
        LinkedHashSet<Integer> keyList = freqToKeys.get(this.minFreq);
        // 其中最先被插入的那个 key 就是该被淘汰的 key
        int deletedKey = keyList.iterator().next();
        /* 更新 FK 表 */
        keyList.remove(deletedKey);
        if (keyList.isEmpty()) {
            freqToKeys.remove(this.minFreq);
            // 问：这里需要更新 minFreq 的值吗？
        }
        /* 更新 KV 表 */
        keyToVal.remove(deletedKey);
        /* 更新 KF 表 */
        keyToFreq.remove(deletedKey);
    }
}
```

### 复杂度

- 时间复杂度：O(1)
- 空间复杂度：O(capacity)

### 调试代码

```java
import org.apache.commons.lang.StringUtils;
import java.util.*;
import java.util.concurrent.TimeUnit;

public class Demo {
    public static void main(String[] args) throws InterruptedException {
        Scanner scanner = new Scanner(System.in);
        LFUCache lfuCache = new LFUCache(5) {{
            put(1);
            put(2);
            put(3);
            put(4);
            put(0);
        }};
        for (int i = 0; i < 10; i++) {
            int nextInt = new Random().nextInt(5);
            System.out.println("random visit = " + nextInt);
            TimeUnit.SECONDS.sleep(1);
            lfuCache.get(nextInt);
            lfuCache.look();
        }
        for (int i = 5; i < 10; i++) {
            System.out.println("new key = " + i);
            lfuCache.put(i);
        }
    }

    static class LFUCache {
        // key 到 val 的映射，我们后文称为 KV 表
        HashMap<Integer, Integer> keyToVal;
        // key 到 freq 的映射，我们后文称为 KF 表
        HashMap<Integer, Integer> keyToFreq;
        // freq 到 key 列表的映射，我们后文称为 FK 表
        HashMap<Integer, LinkedHashSet<Integer>> freqToKeys;
        // 记录最小的频次
        int minFreq;
        // 记录 LFU 缓存的最大容量
        int capacity;

        public LFUCache(int capacity) {
            keyToVal = new HashMap<>();
            keyToFreq = new HashMap<>();
            freqToKeys = new HashMap<>();
            this.capacity = capacity;
            this.minFreq = 0;
        }

        public int get(int key) {
            if (!keyToVal.containsKey(key)) {
                return -1;
            }
            increaseFreq(key);
            return keyToVal.get(key);
        }

        public void put(int key) {
            put(key, key * 10);
        }

        public void put(int key, int value) {
            if (this.capacity <= 0) {
                return;
            }

            /* 若 key 已存在，修改对应的 val 即可 */
            if (keyToVal.containsKey(key)) {
                keyToVal.put(key, value);
                // key 对应的 freq 加一
                increaseFreq(key);
                return;
            }

            /* key 不存在，需要插入 */
            /* 容量已满的话需要淘汰一个 freq 最小的 key */
            if (this.capacity <= keyToVal.size()) {
                removeMinFreqKey();
            }

            /* 插入 key 和 val，对应的 freq 为 1 */
            // 插入 KV 表
            keyToVal.put(key, value);
            // 插入 KF 表
            keyToFreq.put(key, 1);
            // 插入 FK 表
            freqToKeys.putIfAbsent(1, new LinkedHashSet<>());
            freqToKeys.get(1).add(key);
            // 插入新 key 后最小的 freq 肯定是 1
            this.minFreq = 1;
            look();
        }

        // kf,fk 的更新
        private void increaseFreq(int key) {
            int freq = keyToFreq.get(key);
            /* 更新 KF 表 */
            keyToFreq.put(key, freq + 1);
            /* 更新 FK 表 */
            // 将 key 从 freq 对应的列表中删除
            freqToKeys.get(freq).remove(key);
            // 将 key 加入 freq + 1 对应的列表中
            freqToKeys.putIfAbsent(freq + 1, new LinkedHashSet<>());
            freqToKeys.get(freq + 1).add(key);
            // 如果 freq 对应的列表空了，移除这个 freq
            if (freqToKeys.get(freq).isEmpty()) {
                freqToKeys.remove(freq);
                // 如果这个 freq 恰好是 minFreq，更新 minFreq
                if (freq == this.minFreq) {
                    this.minFreq++;
                }
            }
        }

        private void removeMinFreqKey() {
            // freq 最小的 key 列表
            LinkedHashSet<Integer> keyList = freqToKeys.get(this.minFreq);
            // 其中最先被插入的那个 key 就是该被淘汰的 key
            int deletedKey = keyList.iterator().next();
            /* 更新 FK 表 */
            keyList.remove(deletedKey);
            if (keyList.isEmpty()) {
                freqToKeys.remove(this.minFreq);
                System.out.println("问：这里需要更新 minFreq 的值吗？");
                // Q：这里需要更新 minFreq 的值吗？
                // A: 不需要，因为执行完该方法后，minFreq 会被赋值为1
            }
            /* 更新 KV 表 */
            keyToVal.remove(deletedKey);
            /* 更新 KF 表 */
            keyToFreq.remove(deletedKey);
        }

        public void look() {
            System.out.println("capacity = " + capacity);
            System.out.println("minFreq = " + minFreq);
            System.out.print("-----kv------");
            Iterator<Integer> iterator = keyToVal.keySet().iterator();
            while (iterator.hasNext()) {
                Integer k = iterator.next();
                System.out.print(k + "," + keyToVal.get(k) + ";   ");
            }
            System.out.println();
            System.out.print("-----kf------");
            Iterator<Integer> iterator2 = keyToFreq.keySet().iterator();
            while (iterator2.hasNext()) {
                Integer k = iterator2.next();
                System.out.print(k + "," + keyToFreq.get(k) + ";   ");
            }
            System.out.println();
            System.out.print("-----fk------");
            Iterator<Integer> iterator3 = freqToKeys.keySet().iterator();
            while (iterator3.hasNext()) {
                Integer k = iterator3.next();
                System.out.print(k + ",[" + StringUtils.join(freqToKeys.get(k), ",") + "];      ");
            }
            System.out.println();
            System.out.println("==================");
        }
    }
}
```


---

> 作者: 都将会  
> URL: https://leni.fun/lfu/  

