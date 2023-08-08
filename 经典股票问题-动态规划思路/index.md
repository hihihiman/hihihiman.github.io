# 🚩经典股票问题 - 动态规划思路




给定一个数组 prices ，它的第 i 个元素 prices[i] 表示一支给定股票第 i 天的价格。设计一个算法来计算你所能获取的最大利润。返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 0 。

#### lv1. 你只能选择 某一天 买入这只股票，并选择在 未来的某一个不同的日子 卖出该股票。

<!--more-->

```java
class Solution {
    public int maxProfit(int[] prices) {
        int res = 0;
        int min = Integer.MAX_VALUE;
        for (int price : prices) {
            if (price <= min) {
                min = Math.min(min, price);
            } else {
                res = Math.max(res, price - min);
            }
        }
        return res;
    }
}
```

#### lv2. 在每一天，你可以决定是否购买和/或出售股票。你在任何时候 **最多** 只能持有 **一股** 股票。你也可以先购买，然后在 **同一天** 出售。

```java
class Solution {
    public int maxProfit(int[] prices) {
        if (prices.length < 2) {
            return 0;
        }
        int res = 0;
        int pre = prices[0];
        for (int i = 1; i < prices.length; i++) {
            int cur = prices[i];
            if (cur > pre) {
                res += cur - pre;
            }
            pre = cur;
        }
        return res;
    }
}
```

#### lv3. 每次交易（买入+卖出）需要交手续费

```java
class Solution {
    public int maxProfit(int[] prices, int fee) {
        int n = prices.length;
        int[][] dp = new int[n][2];
        // 0 不持有  1 持有
        dp[0][0] = 0;
        dp[0][1] = -prices[0];
        for (int i = 1; i < n; i++) {
            // i-1 昨天
            dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][1] + prices[i] - fee);
            dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] - prices[i]);
        }
        return dp[n - 1][0];
    }
}
```

#### lv4.  不限次数，但含冷冻期：卖出股票后，你无法在第二天买入股票 (即冷冻期为 1 天)。

```java
class Solution {
    public int maxProfit(int[] prices) {
        int n = prices.length;
        if (n <= 1) return 0;
        // 0 不持有，不在冷冻期
        // 1 持有
        // 2 不持有，在冷冻期 - 昨天一定持有，且今天要卖
        int[][] dp = new int[n][3];
        dp[0][0] = 0;
        dp[0][1] = -prices[0];
        dp[0][2] = 0;
        for (int i = 1; i < n; i++) {//从[1]...[n-1]
            dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][2]);
            dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] - prices[i]);
            dp[i][2] = dp[i - 1][1] + prices[i];
        }
        return Math.max(dp[n - 1][0], dp[n - 1][2]);
    }
}
```



#### lv5. 最多可以完成 **两笔** 交易，不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）

```java
class Solution {
    public int maxProfit(int[] prices) {
        if (prices.length < 2) {
            return 0;
        }
        int n = prices.length;
        int[][] dp = new int[n][5];
        // 0 没有任何买卖
        // 1 买入第一次
        dp[0][1] = -prices[0];
        // 2 卖出第一次
        // 3 买入第二次
        dp[0][3] = -prices[0];
        // 4 卖出第二次
        for (int i = 1; i < n; i++) {
            // i-1 表示昨天
            // 买入花钱，所以是 -price[i]
            dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] - prices[i]);
            // 卖出得钱，所以是 +price[i]
            dp[i][2] = Math.max(dp[i - 1][2], dp[i - 1][1] + prices[i]);
            dp[i][3] = Math.max(dp[i - 1][3], dp[i - 1][2] - prices[i]);
            dp[i][4] = Math.max(dp[i - 1][4], dp[i - 1][3] + prices[i]);
        }
        // 最后一天的第二次卖出
        return dp[n - 1][4];
    }
}
```

#### lv6. 你最多可以完成 k 笔交易。也就是说，你最多可以买 k 次，卖 k 次，你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

```java
class Solution {
    public int maxProfit(int k, int[] prices) {
        int len = prices.length;
        if (len < 2) {
            return 0;
        }
        // 0 未买入
        // k+1 第 k 次买入 - 奇数
        // k+2 第 k 次卖出 - 偶数
        int[][] dp = new int[len][2 * k + 1];
        // 每个时刻第一次买入的初始情况
        for (int i = 0; i < k; i++) {
            dp[0][2 * i + 1] = -prices[0];
        }
        for (int i = 1; i < len; i++) {
            // i-1 表示昨天
            for (int j = 1; j <= 2 * k; j++) {
                if ((j & 1) == 1) {
                    // 当天考虑买入
                    // 不买，延续昨天的
                    // 买，要在昨天不持有的基础上买
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - 1] - prices[i]);
                } else {
                    // 当天考虑卖出
                    // 不卖，延续昨天的
                    // 卖，要在昨天持有的基础上卖
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - 1] + prices[i]);
                }
            }
        }
        return dp[len - 1][2 * k];
    }
}
```

#### 

#### lv999. 限制K笔交易，冷冻期1天，有手续费？


---

> 作者: 都将会  
> URL: https://leni.fun/%E7%BB%8F%E5%85%B8%E8%82%A1%E7%A5%A8%E9%97%AE%E9%A2%98-%E5%8A%A8%E6%80%81%E8%A7%84%E5%88%92%E6%80%9D%E8%B7%AF/  

