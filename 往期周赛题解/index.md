# 往期周赛与笔试题解


<!--more-->

### 20230709

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1688875229460-0771c2a7-0c8a-4753-a778-6a1ca4ad9e05.png)

```java
class Solution {
    public static int maximumJumps(int[] nums, int target) {
        int len = nums.length;
        int[] dp = new int[len];
        for (int i = 1; i < len; i++) {
            for (int j = 0; j < i; j++) {
                if (Math.abs(nums[j] - nums[i]) <= target){
                    if (dp[j] == 0 && j != 0) continue;
                    dp[i] = Math.max(dp[i], dp[j] + 1);
                }
            }
        }
        return dp[len - 1] == 0 ? -1 : dp[len - 1];
    }
}
```



![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1688875278575-cb8d964e-5bc7-47f2-92f3-d8a07c3ea0ed.png)

```java
class Solution {
    public int maxNonDecreasingLength(int[] nums1, int[] nums2) {
        int n = nums1.length;

        // dp1[i] 表示以 nums1[i] 结尾的最长非递减子数组长度
        // dp2[i] 表示以 nums2[i] 结尾的最长非递减子数组长度
        int[] dp1 = new int[n], dp2 = new int[n];
        Arrays.fill(dp1, 1);
        Arrays.fill(dp2, 1);

        for (int i = 1; i < n; i++) {
            if (nums1[i] >= nums1[i - 1]) {
                dp1[i] = Math.max(dp1[i], dp1[i - 1] + 1);
            }

            if (nums1[i] >= nums2[i - 1]) {
                dp1[i] = Math.max(dp1[i], dp2[i - 1] + 1);
            }

            if (nums2[i] >= nums2[i - 1]) {
                dp2[i] = Math.max(dp2[i], dp2[i - 1] + 1);
            }

            if (nums2[i] >= nums1[i - 1]) {
                dp2[i] = Math.max(dp2[i], dp1[i - 1] + 1);
            }
        }

        int max1 = IntStream.of(dp1).max().getAsInt();
        int max2 = IntStream.of(dp2).max().getAsInt();
        return Math.max(max1, max2);
    }
}
```

### 20230716

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1689477211608-7d119c86-ebe3-43a4-a895-522325201fb8.png)

```java
class Solution {
    public int maximumBeauty(int[] nums, int k) {
        Arrays.sort(nums);
        int res = 0;
        for (int l = 0, r = 0; r < nums.length; r++) {
            while (nums[r] > nums[l] + 2 * k) {
                l++;
            }
            res = Math.max(res, r - l + 1);
        }
        return res;
    }
}
```

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1689477244388-1bcd3d23-12ee-46eb-b71d-6d8d8887d93a.png)

```java
public static int minimumIndex(List<Integer> nums) {
        Map<Integer, Integer> map = new HashMap<>();
        int max = nums.get(0);
        int count = 1;

        //初始化map,以及找出出现最多的元素max，以及它出现的次数count
        for (int i = 0; i < nums.size(); ++i) {
            map.put(nums.get(i), map.get(nums.get(i)) != null ? map.get(nums.get(i)) + 1 : 1);
        }
        for (int i : map.keySet()) {
            if (map.get(i) > count) {
                max = i;
                count = map.get(i);
            }
        }

        //不在需要记录右边的，因为count_r=count-countL
        int countL = 0;
        for (int i = 0; i < nums.size() - 1; ++i) {
            //如果变动了max
            if (nums.get(i) == max) {
                countL++;
            }

            //判断两边是否有支配元素且相同
            if (2 * countL > i + 1 && 2 * (count - countL) > nums.size() - i - 1) {
                return i;
            }

        }
        return -1;
    }
```

### 20230722

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1690038723224-aba3a7d8-5f52-4f43-b619-408f13cb6b0d-20230808161312974.png)

```java
class Solution {
    public long maxScore(int[] nums, int x) {
        int n = nums.length;
        long even = -x, odd = -x;
        if (nums[0] % 2 == 0) even = nums[0];
        else odd = nums[0];
        for (int i = 1; i < n; ++i) {
            if (nums[i] % 2 == 0) even = Math.max(even, odd - x) + nums[i];
            else odd = Math.max(odd, even - x) + nums[i];
        }
        return Math.max(even, odd);
    }
}
```

![img](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1690038828416-46da0e5a-f4ed-443b-8a44-787892963cac-20230808161319760.png)

```java
public static final int MOD = (int) (1e9 + 7);
public static int numberOfWays(int n, int x) {
        List<Integer> nums = new ArrayList<>();// 所有可能的x的幂
        for (int i = 1; Math.pow(i, x) <= n; i++) {
            nums.add((int) Math.pow(i, x));
        }
        // 01背包问题，不可重复
        int[] dp = new int[n + 1];
        // 选择某个数本身
        dp[0] = 1;
        for (int i = 0; i < nums.size(); i++) {
            for (int j = n; j >= nums.get(i); j--) {
                // 加到 dp[0] 为止
                dp[j] = (dp[j] + dp[j - nums.get(i)]) % MOD;
            }
        }
        return dp[n];
    }
```

### xhs：统计词频 > 3的词语，按照词频倒序，相同词频按字典序输出词汇。

```java
import java.util.*;

public class TreeMapWordFrequencyExample {
    public static void main(String[] args) {
        // 创建一个TreeMap对象，并使用自定义的Comparator进行排序
        TreeMap<String, Integer> wordFrequencyMap = new TreeMap<>(new Comparator<String>() {
            @Override
            public int compare(String word1, String word2) {
                // 词频倒序
                int frequencyCompare = wordFrequencyMap.get(word2).compareTo(wordFrequencyMap.get(word1));
                if (frequencyCompare == 0) {
                    // 字典序升序
                    return word1.compareTo(word2);
                } else {
                    return frequencyCompare;
                }
            }
        });
        // 假设有一些单词
        List<String> words = Arrays.asList("apple", "banana", "apple", "orange", "banana", "apple", "grape", "banana", "grape", "grape");
        // 统计单词的词频
        for (String word : words) {
            wordFrequencyMap.put(word, wordFrequencyMap.getOrDefault(word, 0) + 1);
        }
        // 输出词频大于3的单词，并按照词频倒序输出
        for (Map.Entry<String, Integer> entry : wordFrequencyMap.entrySet()) {
            if (entry.getValue() > 3) {
                System.out.println(entry.getKey() + ": " + entry.getValue());
            }
        }
    }
}
```



以后的题解会单独发在 `TAG = 周赛与笔试` 中。


---

> 作者: 都将会  
> URL: https://leni.fun/%E5%BE%80%E6%9C%9F%E5%91%A8%E8%B5%9B%E9%A2%98%E8%A7%A3/  

