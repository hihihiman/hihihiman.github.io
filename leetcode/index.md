# LeetCode 大全


<!--more-->

## 数组

### [560]和为K的子数组.java
给定一个整数数组和一个整数 k，你需要找到该数组中和为 k 的连续的子数组的个数。 
#### 思路
采用空间换时间策略，用 map 记录前序和。
#### 代码
```
class Solution {
    public int subarraySum(int[] nums, int k) {
        int count = 0, sum = 0;
        Map<Integer, Integer> map = new HashMap<>() {{
            put(0, 1);
        }};
        for (int num : nums) {
            sum += num;
            count += map.getOrDefault(sum - k, 0);
            map.put(sum, map.getOrDefault(sum, 0) + 1);
        }
        return count;
    }
}
```
#### 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)
### [304]二维区域和检索 - 矩阵不可变.java
给定一个二维矩阵 matrix，以下类型的多个请求： 计算其子矩形范围内元素的总和，该子矩阵的左上角为 (row1, col1) ，右下角为 (row2, col2) 。 实现 NumMatrix 类： NumMatrix(int matrix) 给定整数矩阵 matrix 进行初始化 int sumRegion(int row1, int col1, int row2, int col2) 返回左上角 (row1, col1) 、右下角(row2, col2) 的子矩阵的元素总和。 
#### 思路

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678170411113-7f651353-6ab8-49d3-8b5e-a87f18216a68.png)

#### 代码
```
class NumMatrix {

    // 存储左上角区域和
    private int[][] preSum;

    public NumMatrix(int[][] matrix) {
        int m = matrix.length;
        int n = matrix[0].length;
        preSum = new int[m][n];
        preSum[0][0] = matrix[0][0];
        for (int i = 1; i < m; i++) {
            preSum[i][0] = preSum[i - 1][0] + matrix[i][0];
        }
        for (int i = 1; i < n; i++) {
            preSum[0][i] = preSum[0][i - 1] + matrix[0][i];
        }
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                preSum[i][j] = matrix[i][j] + preSum[i - 1][j] + preSum[i][j - 1] - preSum[i - 1][j - 1];
            }
        }
    }

    public int sumRegion(int row1, int col1, int row2, int col2) {
        int leftCol = (col1 == 0) ? 0 : preSum[row2][col1 - 1];
        int upRow = (row1 == 0) ? 0 : preSum[row1 - 1][col2];
        int leftUpArea = (row1 == 0 || col1 == 0) ? 0 : preSum[row1 - 1][col1 - 1];
        return preSum[row2][col2] - leftCol - upRow + leftUpArea;
    }
}
```
#### 复杂度

- 时间复杂度：O(n^2)
- 空间复杂度：O(n^2)
### [1094]拼车.java
假设你是一位顺风车司机，车上最初有 capacity 个空座位可以用来载客。由于道路的限制，车 只能 向一个方向行驶（也就是说，不允许掉头或改变方向，你可以将其想象为一个向量）。 
这儿有一份乘客行程计划表 trips，其中 trips[i] = [num_passengers, start_location, end_location] 包含了第 i 组乘客的行程信息： 

1. 必须接送的乘客数量； 
2. 乘客的上车地点； 
3. 以及乘客的下车地点。 

这些给出的地点位置是从你的 初始 出发位置向前行驶到这些地点所需的距离（它们一定在你的行驶方向上）。 请你根据给出的行程计划表和车子的座位数，来判断你的车是否可以顺利完成接送所有乘客的任务（当且仅当你可以在所有给定的行程中接送所有乘客时，返回 true，否则请返回 false）。
#### 思路
利用差分数组，上车加乘客数，下车减乘客数，最后遍历一次检验是否有超载情况。
#### 代码
```
class Solution {
    public boolean carPooling(int[][] trips, int capacity) {
        // 差分数组
        int[] diff = new int[1001];
        // 统计每一站净上车人数
        for (int[] trip : trips) {
            int passengers = trip[0];
            int start = trip[1];
            int end = trip[2];
            diff[start] += passengers;
            diff[end] -= passengers;
        }
        // 排查是否有超载情况
        int cur = 0;
        for (int i : diff) {
            cur += i;
            if (cur > capacity) {
                return false;
            }
        }
        return true;
    }
}
```
#### 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)
### [1109]航班预订统计.java
这里有 n 个航班，它们分别从 1 到 n 进行编号。 
有一份航班预订表 bookings ，表中第 i 条预订记录 bookings[i] = [firsti, lasti, seatsi] 意味着在从 firsti 到 lasti （包含 firsti 和 lasti ）的 每个航班 上预订了 seatsi 个座位。 请你返回一个长度为 n 的数组 answer，其中 answer[i] 是航班 i 上预订的座位总数。 
#### 思路
利用差分数组，根据每一条数据，在 first 处加座位数，在 last +1 处减座位数，最后遍历累加得到 answer 数组。
#### 代码
```
class Solution {
    public int[] corpFlightBookings(int[][] bookings, int n) {
        int[] diff = new int[n];
        int[] answer = new int[n];
        for (int[] booking : bookings) {
            int first = booking[0];
            int last = booking[1];
            int seats = booking[2];
            diff[first - 1] += seats;
            if (last < n) {
                // 实际上是 last+1-1
                // +1 是因为座位在下一站才腾出来
                // -1 是因为航班从 1 开始编号，而数组从 0 开始编号
                diff[last] -= seats;
            }
        }
        answer[0] = diff[0];
        for (int i = 1; i < n; i++) {
            answer[i] = answer[i - 1] + diff[i];
        }
        return answer;
    }
}
```
#### 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)
### 二分搜索模板
```
int binary_search(int[] nums, int target) {
    int left = 0, right = nums.length - 1; 
    while(left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] < target) {
            left = mid + 1;
        } else if (nums[mid] > target) {
            right = mid - 1; 
        } else if(nums[mid] == target) {
            // 直接返回
            return mid;
        }
    }
    // 直接返回
    return -1;
}
```
#### 寻找左边界
```
int left_bound(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] < target) {
            left = mid + 1;
        } else if (nums[mid] > target) {
            right = mid - 1;
        } else if (nums[mid] == target) {
            // 别返回，锁定左侧边界
            right = mid - 1;
        }
    }
    // 最后要检查 left 越界的情况
    if (left >= nums.length || nums[left] != target)
        return -1;
    return left;
}
```
#### 寻找右边界
```
int right_bound(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] < target) {
            left = mid + 1;
        } else if (nums[mid] > target) {
            right = mid - 1;
        } else if (nums[mid] == target) {
            // 别返回，锁定右侧边界
            left = mid + 1;
        }
    }
    // 最后要检查 right 越界的情况
    if (right < 0 || nums[right] != target)
        return -1;
    return right;
}
```
### [875]爱吃香蕉的珂珂.java
珂珂喜欢吃香蕉。这里有 N 堆香蕉，第 i 堆中有 piles[i] 根香蕉。警卫已经离开了，将在 H 小时后回来。 
珂珂可以决定她吃香蕉的速度 K （单位：根/小时）。每个小时，她将会选择一堆香蕉，从中吃掉 K 根。如果这堆香蕉少于 K 根，她将吃掉这堆的所有香蕉，然后这一小时内不会再吃更多的香蕉。 
珂珂喜欢慢慢吃，但仍然想在警卫回来前吃掉所有的香蕉。 
返回她可以在 H 小时内吃掉所有香蕉的最小速度 K（K 为整数）。 
#### 思路

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678170411127-fedcc0bc-d184-49af-a975-d2b1e05ecf59.png)

1. 以速度为自变量，花费时间为应变量，构造函数，定义域在 [1,10^9]
2. 所求为最小速度，转换为寻找左边界
3. 花费时间过长，应当加大速度，扩大 left 边界；花费时间相等或足够小，不直接返回，而是缩小 right 边界
4. 退出循环前，left==right && f(piles,mid)==h ， 此时位于左边界，right = mid -1 后退出循环，因此最终返回 left
#### 代码
```
class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int left = 1, right = 1000000000;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (f(piles, mid) > h) {
                left = mid + 1;
            } else {
                // 别返回，锁定左侧边界
                right = mid - 1;
            }
        }
        return left;
    }

    private int f(int[] piles, int v) {
        int hours = 0;
        for (int pile : piles) {
            hours += pile / v;
            if (pile % v > 0) {
                hours++;
            }
        }
        return hours;
    }
}
```
#### 复杂度

- 时间复杂度：O(nlogn)
- 空间复杂度：O(1)
### [1011]在 D 天内送达包裹的能力.java
传送带上的包裹必须在 D 天内从一个港口运送到另一个港口。 
传送带上的第 i 个包裹的重量为 weights[i]。每一天，我们都会按给出重量的顺序往传送带上装载包裹。我们装载的重量不会超过船的最大运载重量。 
返回能在 D 天内将传送带上的所有包裹送达的船的最低运载能力。 
#### 思路

1. 以承载量为自变量，花费天数为应变量，构造函数，承载量下限为最大的那个包裹的重量，上限为所有包裹加起来的重量。
2. 所求为最小承载量，转换为寻找左边界
3. 花费时间过长，应当加大承载量，扩大 left 边界；花费时间相等或足够小，不直接返回，而是缩小 right 边界
4. 退出循环前，left==right && f(weights,mid)==days ， 此时位于左边界，right = mid -1 后退出循环，因此最终返回 left
#### 代码
```
class Solution {
    public int shipWithinDays(int[] weights, int days) {
        int left = 1, right = 1;
        for (int weight : weights) {
            if (weight > left) {
                left = weight;
            }
            right += weight;
        }
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (f(weights, mid) > days) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return left;
    }

    private int f(int[] weights, int capacity) {
        int days = 1;
        int todayCapacity = capacity;
        for (int weight : weights) {
            if (weight > todayCapacity) {
                // 今天不够装了，明天一来就装这个包裹
                days++;
                todayCapacity = capacity - weight;
            } else {
                // 今天装下这个包裹没问题
                todayCapacity -= weight;
            }
        }
        return days;
    }
}
```
#### 复杂度

- 时间复杂度：O(nlogn)
- 空间复杂度：O(1)
### 下一个更大元素（循环搜索）
```
class Solution {
    public int[] nextGreaterElements(int[] nums) {
        int[] res = new int[nums.length];
        Stack<Integer> stack = new Stack<>();
        // 从后往前遍历
        for (int i = nums.length - 1; i >= 0; i--) {
            while (!stack.isEmpty() && nums[i] >= stack.peek()) {
                // 栈顶元素即将被 nums[i] 挡住
                stack.pop();
            }
            if (stack.isEmpty()) {
                res[i] = -1;
                // 后面找不到了，去前面找找看
                for (int j = 0; j < i; j++) {
                    if (nums[j] > nums[i]) {
                        res[i] = nums[j];
                        break;
                    }
                }
            } else {
                res[i] = stack.peek();
            }
            stack.push(nums[i]);
        }
        return res;
    }
}
```
### 搜索二维矩阵
编写一个高效的算法来判断 m x n 矩阵中，是否存在一个目标值。该矩阵具有如下特性：
每行中的整数从左到右按升序排列。每行的第一个整数大于前一行的最后一个整数。
```
class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
       int m = matrix.length, n = matrix[0].length;
        int low = 0, high = m * n - 1;
        while (low <= high) {
            int mid = (high - low) / 2 + low;
            int x = matrix[mid / n][mid % n];
            if (x < target) {
                low = mid + 1;
            } else if (x > target) {
                high = mid - 1;
            } else {
                return true;
            }
        }
        return false;
    }
}
```
### 折线图的最少线段数
给你一个二维整数数组 stockPrices ，其中 stockPrices[i] = [dayi, pricei] 表示股票在 dayi 的价格为 pricei 。折线图 是一个二维平面上的若干个点组成的图，横坐标表示日期，纵坐标表示价格，折线图由相邻的点连接而成。比方说下图是一个例子：



![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678170411156-8e60abf8-6e72-4111-bbd9-c56150fa0f6a.png)

请你返回要表示一个折线图所需要的 最少线段数 。

```
class Solution {
    public int minimumLines(int[][] stockPrices) {
        if (stockPrices.length <= 1) {
            return 0;
        }
        Arrays.sort(stockPrices, (a, b) -> {
            if (a[0] == b[0]) {
                return a[1] - b[1];
            } else {
                return a[0] - b[0];
            }
        });
        int count = 1;
        String k = getK(stockPrices[1][1] - stockPrices[0][1], stockPrices[1][0] - stockPrices[0][0]);
        for (int i = 2; i < stockPrices.length; i++) {
            int dy = stockPrices[i][1] - stockPrices[i - 1][1];
            int dx = stockPrices[i][0] - stockPrices[i - 1][0];
            if (dy == 0 && dx == 0) {
                continue;
            }
            String tempK = getK(dy, dx);
            if (!k.equals(tempK)) {
                count++;
                k = tempK;
            }
        }
        return count;
    }

    private String getK(int dy, int dx) {
        if (dx == 0) {
            return "wx";
        }
        //二者最大公约数，将两数化为最简，方便比较
        int gcd = gcd(Math.abs(dy), Math.abs(dx));
        dy /= gcd;
        dx /= gcd;
        return dy + "/" + dx;
    }

    /**
     * 求最大公约数
     *
     * @param a
     * @param b
     * @return
     */
    private int gcd(int a, int b) {
        if (b != 0) {
            return gcd(b, a % b);
        }
        return a;
    }
}
```
### 三数之和
给你一个包含 n 个整数的数组 nums，判断 nums 中是否存在三个元素 a，b，c ，使得 a + b + c = 0 ？请你找出所有和为 0 且不重复的三元组。
#### 代码（双指针）
```
class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        if (nums == null || nums.length < 3) {
            return res;
        }
        Arrays.sort(nums);
        for (int i = 0; i < nums.length - 2; i++) {
            //减枝
            if (nums[i] > 0) {
                break;
            }
            //去重
            if (i > 0 && nums[i] == nums[i - 1]) {
                continue;
            }
            //后两数之和等于第一个数的相反数
            int target = -nums[i];
            int left = i + 1, right = nums.length - 1;
            while (left < right) {
                if (nums[left] + nums[right] == target) {
                    res.add(Arrays.asList(nums[i], nums[left++], nums[right--]));
                    while (left < right && nums[left] == nums[left - 1]) {
                        left++;
                    }
                    while (left < right && nums[right] == nums[right + 1]) {
                        right--;
                    }
                } else if (nums[left] + nums[right] < target) {
                    left++;
                } else {
                    right--;
                }
            }
        }
        return res;
    }
}
```
#### 复杂度

- 时间复杂度：O(n^2)
- 空间复杂度：$$
\begin{cases} O(logn)，不允许改变参数\\ O(1)，允许改变参数 \end{cases}
$$

### 颜色分类（荷兰国旗问题）
给定一个包含红色、白色和蓝色，一共 n 个元素的数组，原地对它们进行排序，使得相同颜色的元素相邻，并按照红色、白色、蓝色顺序排列。 此题中，我们使用整数 0、 1 和 2 分别表示红色、白色和蓝色。 
#### 代码
```
class Solution {
    public void sortColors(int[] nums) {
        int left = 0, right = nums.length - 1;
        for (int i = 0; i <= right; i++) {
            if (nums[i] == 0) {
                //i把0给了left，left只可能把0给i
                swap(nums, left++, i);
            } else if (nums[i] == 2) {
                //i把2给了right，right可能把0或1给i，所以i不能立刻自增
                swap(nums, right--, i--);
            }
        }
    }
    private void swap(int[] nums, int index1, int index2) {
        int a = nums[index1];
        nums[index1] = nums[index2];
        nums[index2] = a;
    }
}
```
#### 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(1)
### [31]下一个排列.java
//整数数组的一个 排列 就是将其所有成员以序列或线性顺序排列。 //// // 例如，arr = [1,2,3] ，以下这些都可以视作 arr 的排列：[1,2,3]、[1,3,2]、[3,1,2]、[2,3,1] 。 // //// 整数数组的 下一个排列 是指其整数的下一个字典序更大的排列。更正式地，如果数组的所有排列根据其字典顺序从小到大排列在一个容器中，那么数组的 下一个排列 就是在这个有序容器中排在它后面的那个排列。如果不存在下一个更大的排列，那么这个数组必须重排为字典序最小的排列（即，其元素按升序排列）。 //// // 例如，arr = [1,2,3] 的下一个排列是 [1,3,2] 。 // 类似地，arr = [2,3,1] 的下一个排列是 [3,1,2] 。 // 而 arr = [3,2,1] 的下一个排列是 [1,2,3] ，因为 [3,2,1] 不存在一个字典序更大的排列。 // //// 给你一个整数数组 nums ，找出 nums 的下一个排列。 //// 必须 原地 修改，只允许使用额外常数空间。 
```
class Solution {
    public void nextPermutation(int[] nums) {
        int len = nums.length;
        int i = len - 2;
        // 从后往前找到第一个升序的数字
        while (i >= 0 && nums[i] >= nums[i + 1]) {
            i--;
        }
        // 如果找不到，则说明是最小的排列，需要重排
        if (i >= 0) {
            int j = len - 1;
            // 从后往前找到第一个比i大的数字
            while (nums[i] >= nums[j]) {
                j--;
            }
            // 交换i和j
            swap(nums, i, j);
        }
        // 反转后面的数字:从降序变成升序
        reverse(nums, i + 1);
    }

    public void swap(int[] nums, int i, int j) {
        int temp = nums[i];
        nums[i] = nums[j];
        nums[j] = temp;
    }

    public void reverse(int[] nums, int start) {
        int len = nums.length;
        int i = start, j = len - 1;
        while (i < j) {
            swap(nums, i++, j--);
        }
    }
}
```
### [200]岛屿数量.java
给你一个由 '1'（陆地）和 '0'（水）组成的的二维网格，请你计算网格中岛屿的数量。 
岛屿总是被水包围，并且每座岛屿只能由水平方向和/或竖直方向上相邻的陆地连接形成。 
此外，你可以假设该网格的四条边均被水包围。 
```
class Solution {
    public int numIslands(char[][] grid) {
        int count = 0;
        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < grid[i].length; j++) {
                if (grid[i][j] == '1') {
                    count++;
                    callBFS(grid, i, j);
                }
            }
        }
        return count;
    }
    private void callBFS(char[][] grid, int i, int j) {
        if (i < 0 || i >= grid.length || j < 0 || j >= grid[i].length || grid[i][j] == '0') {
            return;
        }
        grid[i][j] = '0';
        callBFS(grid, i + 1, j);
        callBFS(grid, i - 1, j);
        callBFS(grid, i, j + 1);
        callBFS(grid, i, j - 1);
    }
}
```
### [695]岛屿的最大面积.java
//给你一个大小为 m x n 的二进制矩阵 grid 。 //// 岛屿 是由一些相邻的 1 (代表土地) 构成的组合，这里的「相邻」要求两个 1 必须在 水平或者竖直的四个方向上 相邻。你可以假设 grid 的四个边缘都//被 0（代表水）包围着。 //// 岛屿的面积是岛上值为 1 的单元格的数目。 //// 计算并返回 grid 中最大的岛屿面积。如果没有岛屿，则返回面积为 0 。 
```
class Solution {
    boolean visited[][];

    public int maxAreaOfIsland(int[][] grid) {
        int res = 0;
        int rows = grid.length;
        int cols = grid[0].length;
        visited = new boolean[rows][cols];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                res = Math.max(res, area(i, j, grid));
            }
        }
        return res;
    }

    public int area(int row, int column, int[][] grid) {
        if (row < 0 || row >= grid.length || column < 0 || column >= grid[row].length || visited[row][column] || grid[row][column] == 0) {
            return 0;
        }
        visited[row][column] = true;
        return 1 + area(row + 1, column, grid) + area(row - 1, column, grid) + area(row, column + 1, grid) + area(row, column - 1, grid);
    }
}
```
### [79]单词搜索.java
//给定一个 m x n 二维字符网格 board 和一个字符串单词 word 。如果 word 存在于网格中，返回 true ；否则，返回 false 。 //// 单词必须按照字母顺序，通过相邻的单元格内的字母构成，其中“相邻”单元格是那些水平相邻或垂直相邻的单元格。同一个单元格内的字母不允许被重复使用。 
```
class Solution {
    boolean[][] visited;

    public boolean exist(char[][] board, String word) {
        final int rows = board.length;
        final int cols = board[0].length;
        visited = new boolean[rows][cols];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (dfs(board, word, 0, i, j)) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean dfs(char[][] board, String word, int index, int i, int j) {
        if (index == word.length()) {
            return true;
        }
        if (i < 0 || i >= board.length || j < 0 || j >= board[0].length || visited[i][j] || board[i][j] != word.charAt(index)) {
            return false;
        }
        visited[i][j] = true;
        boolean res = dfs(board, word, index + 1, i + 1, j) ||
                dfs(board, word, index + 1, i - 1, j) ||
                dfs(board, word, index + 1, i, j + 1) ||
                dfs(board, word, index + 1, i, j - 1);
        visited[i][j] = false;
        return res;
    }
}
```
## 链表
### [21]合并两个有序链表.java
```
class Solution {
    // 非递归
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        // 伪头结点
        ListNode dummyHead = new ListNode(-1);
        ListNode cur = dummyHead;
        while (l1 != null && l2 != null) {
            if (l1.val < l2.val) {
                cur.next = l1;
                l1 = l1.next;
            } else {
                cur.next = l2;
                l2 = l2.next;
            }
            cur = cur.next;
        }
        // 剩余部分
        cur.next = l1 == null ? l2 : l1;
        return dummyHead.next;
    }
}
```
### 反转链表
给你单链表的头节点 head ，请你反转链表，并返回反转后的链表。
#### 代码
```
class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode pre = null, cur = head, next;
        while (cur != null) {
            next = cur.next;
            cur.next = pre;
            pre = cur;
            cur = next;
        }
        //cur==null 退出循环，pre此时指向之前的尾节点，现在的头节点。
        return pre;
    }
}
```
#### 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(1)
### [92]反转链表 II.java
给你单链表的头指针 head 和两个整数 left 和 right ，其中 left <= right 。请你反转从位置 left 到位置 right 的链表节点，返回 反转后的链表 。

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678170411124-37817cc4-f93a-4f64-b78a-adb86f244a97.png)
```
class Solution {
    public ListNode reverseBetween(ListNode head, int left, int right) {
        // 因为头节点有可能发生变化，使用虚拟头节点可以避免复杂的分类讨论
        ListNode dummyNode = new ListNode(-1, head);
        ListNode pre = dummyNode;
        // 第 1 步：从虚拟头节点走 left - 1 步，来到 left 节点的前一个节点
        // 建议写在 for 循环里，语义清晰
        for (int i = 0; i < left - 1; i++) {
            pre = pre.next;
        }

        // 第 2 步：从 pre 再走 right - left + 1 步，来到 right 节点
        ListNode rightNode = pre;
        for (int i = 0; i < right - left + 1; i++) {
            rightNode = rightNode.next;
        }

        // 第 3 步：切断出一个子链表（截取链表）
        ListNode leftNode = pre.next;
        ListNode curr = rightNode.next;

        // 注意：切断链接
        pre.next = null;
        rightNode.next = null;

        // 第 4 步：同第 206 题，反转链表的子区间
        reverseLinkedList(leftNode);

        // 第 5 步：接回到原来的链表中
        pre.next = rightNode;
        leftNode.next = curr;
        return dummyNode.next;
    }

    private void reverseLinkedList(ListNode head) {
        // 也可以使用递归反转一个链表
        ListNode pre = null;
        ListNode cur = head;

        while (cur != null) {
            ListNode next = cur.next;
            cur.next = pre;
            pre = cur;
            cur = next;
        }
    }
}
```
### [142]环形链表 II.java
给定一个链表，返回链表开始入环的第一个节点。 如果链表无环，则返回 null。 
为了表示给定链表中的环，我们使用整数 pos 来表示链表尾连接到链表中的位置（索引从 0 开始）。 如果 pos 是 -1，则在该链表中没有环。注意，pos 仅仅是用于标识环的情况，并不会作为参数传递到函数中。 
说明：不允许修改给定的链表。 
#### 思路

![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/1678170411124-b781a2aa-205c-4c14-bf70-b19a147f3163.png)

如图所示，先分析第一次相遇：
slow 走过距离：a+b
fast 走过距离：a+b+n(b+c)
又因为 fast 速度是 slow 的 2 倍，得：2(a+b) = a+b+n(b+c)
化简得：a=(n-1)(b+c)+c
这时，让 fast 指针回到起点，slow 指针留在原地，它们同时以相同速度运动 c 的距离，慢指针到达交点处，快指针距离交点距离是环长的整数倍，由于我们不知道 c 的大小，只能让快慢指针继续保持相同速度向前走，直到第二次相遇，相遇点必是交点。

#### 代码
```
public class Solution {
    public ListNode detectCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                break;
            }
        }
        //无环
        if (fast == null || fast.next == null) {
            return null;
        }
        fast = head;
        while (fast != slow) {
            slow = slow.next;
            fast = fast.next;
        }
        return fast;
    }
}
```
#### 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(1)
### [86]分隔链表.java
//给你一个链表的头节点 head 和一个特定值 x ，请你对链表进行分隔，使得所有 小于 x 的节点都出现在 大于或等于 x 的节点之前。 //// 你应当 保留 两个分区中每个节点的初始相对位置。 //// //// 示例 1： //// //输入：head = [1,4,3,2,5,2], x = 3//输出：[1,2,2,4,3,5]
```
class Solution {
    public ListNode partition(ListNode head, int x) {
        ListNode left = new ListNode(0);
        ListNode right = new ListNode(0);
        ListNode l = left;
        ListNode r = right;
        while (head != null) {
            if (head.val < x) {
                l.next = head;
                l = l.next;
            } else {
                r.next = head;
                r = r.next;
            }
            head = head.next;
        }
        l.next = right.next;
        r.next = null;
        return left.next;
    }
}
```
### [148]排序链表.java
给你链表的头结点 head ，请将其按 升序 排列并返回 排序后的链表 。 
```
class Solution {
    public ListNode sortList(ListNode head) {
        if (head == null || head.next == null) return head;
        ListNode slow = head, fast = head.next;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        ListNode right = sortList(slow.next);
        slow.next = null;
        ListNode left = sortList(head);
        return merge(left, right);
    }

    private ListNode merge(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0);
        ListNode cur = dummy;
        while (l1 != null && l2 != null) {
            if (l1.val < l2.val) {
                cur.next = l1;
                l1 = l1.next;
            } else {
                cur.next = l2;
                l2 = l2.next;
            }
            cur = cur.next;
        }
        cur.next = l1 == null ? l2 : l1;
        return dummy.next;
    }
}
```
### [2]两数相加.java
//给你两个 非空 的链表，表示两个非负的整数。它们每位数字都是按照 逆序 的方式存储的，并且每个节点只能存储 一位 数字。 //// 请你将两个数相加，并以相同形式返回一个表示和的链表。 //// 你可以假设除了数字 0 之外，这两个数都不会以 0 开头。 //// //// 示例 1： //// //输入：l1 = [2,4,3], l2 = [5,6,4]//输出：[7,0,8]//解释：342 + 465 = 807.
```
class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummyHead = new ListNode(0);
        ListNode cur = dummyHead;
        int carry = 0;
        while (l1 != null || l2 != null) {
            int x = l1 == null ? 0 : l1.val;
            int y = l2 == null ? 0 : l2.val;
            int sum = x + y + carry;
            carry = sum / 10;
            cur.next = new ListNode(sum % 10);
            cur = cur.next;
            if (l1 != null) l1 = l1.next;
            if (l2 != null) l2 = l2.next;
        }
        if (carry > 0) {
            cur.next = new ListNode(carry);
        }
        return dummyHead.next;
    }
}
```
### [143]重排链表.java
//给定一个单链表 L 的头节点 head ，单链表 L 表示为： //// //L0 → L1 → … → Ln - 1 → Ln// //// 请将其重新排列后变为： //// //L0 → Ln → L1 → Ln - 1 → L2 → Ln - 2 → … //// 不能只是单纯的改变节点内部的值，而是需要实际的进行节点交换。 
```
class Solution {
    public void reorderList(ListNode head) {
        if (head == null || head.next == null) {
            return;
        }
        ListNode l1 = head;
        ListNode slow = head, fast = head, prev = null;
        while (fast != null && fast.next != null) {
            prev = slow;
            slow = slow.next;
            fast = fast.next.next;
        }
        prev.next = null;
        ListNode l2 = slow;
        l2 = reverse(l2);
        l1 = merge(l1, l2);
    }

    private ListNode reverse(ListNode head) {
        ListNode prev = null;
        ListNode curNode = head;
        while (curNode != null) {
            ListNode nextNode = curNode.next;
            curNode.next = prev;
            prev = curNode;
            curNode = nextNode;
        }
        return prev;
    }

    private ListNode merge(ListNode l1, ListNode l2) {
        ListNode dummyHead = new ListNode(-1);
        ListNode curNode = dummyHead;
        while (l1 != null && l2 != null) {
            curNode.next = l1;
            curNode = curNode.next;
            l1 = l1.next;
            curNode.next = l2;
            curNode = curNode.next;
            l2 = l2.next;
        }
        curNode.next = l1 == null ? l2 : l1;
        return dummyHead.next;
    }

}
```
## 二叉树
快速排序就是个二叉树的前序遍历，归并排序就是个二叉树的后序遍历。
### 递归框架
```
/* 二叉树遍历框架 */
void traverse(TreeNode root) {
    // 前序遍历
    traverse(root.left)
    // 中序遍历
    traverse(root.right)
    // 后序遍历
}
```
### 快速排序
```
void sort(int[] nums, int lo, int hi) {
    /****** 前序遍历位置 ******/
    // 通过交换元素构建分界点 p
    int p = partition(nums, lo, hi);
    /************************/

    sort(nums, lo, p - 1);
    sort(nums, p + 1, hi);
}
```
### 归并排序
```
void sort(int[] nums, int lo, int hi) {
    int mid = (lo + hi) / 2;
    sort(nums, lo, mid);
    sort(nums, mid + 1, hi);

    /****** 后序遍历位置 ******/
    // 合并两个排好序的子数组
    merge(nums, lo, mid, hi);
    /************************/
}
```
可以说，只要涉及递归，都可以抽象成二叉树的问题。
### 中序遍历二叉树
```java
class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> res = new LinkedList<>();
        Deque<TreeNode> stack = new LinkedList<>();
        for (TreeNode cur = root; cur != null || !stack.isEmpty(); cur = cur.right) {
            // 一直下到最左
            while (cur != null) {
                stack.push(cur);
                cur = cur.left;
            }
            cur = stack.pop();// 每次出栈的就是中序遍历顺序的节点，然后在以下进行对应操作
            res.add(cur.val);
            // 最后向右一步
        }
        return res;
    }
}
```
### [105]从前序与中序遍历序列构造二叉树.java
```java
class Solution {
    public TreeNode buildTree(int[] preorder, int[] inorder) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < inorder.length; i++) {
            map.put(inorder[i], i);
        }
        return buildTreeHelper(preorder, 0, preorder.length, inorder, 0, inorder.length, map);
    }

    /**
* 指针左闭右开
*
* @param preorder
* @param p_start
* @param p_end
* @param inorder
* @param i_start
* @param i_end
* @param map
* @return
*/
    private TreeNode buildTreeHelper(int[] preorder, int p_start, int p_end, int[] inorder, int i_start, int i_end,
                                     HashMap<Integer, Integer> map) {
        if (p_start == p_end) {
            return null;
        }
        int root_val = preorder[p_start];
        TreeNode root = new TreeNode(root_val);
        int i_root_index = map.get(root_val);
        int leftNum = i_root_index - i_start;
        // preorder 分为 [p_start + 1,p_start + leftNum + 1) 和 [p_start + leftNum + 1, p_end]，前序根结点在左边
        // inorder 分为 [i_start,i_root_index) 和 [i_root_index + 1,i_end)，少一个根结点
        root.left = buildTreeHelper(preorder, p_start + 1, p_start + leftNum + 1, inorder, i_start, i_root_index, map);
        root.right = buildTreeHelper(preorder, p_start + 1 + leftNum, p_end, inorder, i_root_index + 1, i_end, map);
        return root;
    }
```
### [114]二叉树展开为链表.java
给你二叉树的根结点 root ，请你将它展开为一个单链表： 
展开后的单链表应该同样使用 TreeNode ，其中 right 子指针指向链表中下一个结点，而左子指针始终为 null 。 
展开后的单链表应该与二叉树 先序遍历 顺序相同。
#### 思路

1. 把每个节点的左子树插入到该节点与右子树之间；
2. 应用后序递归框架（左、右、根）。
#### 代码
```
class Solution {
    public void flatten(TreeNode root) {
        // 1. 叶子节点
        if (root == null) return;

        // 2. 递归 flatten
        TreeNode left = root.left;
        TreeNode right = root.right;
        flatten(left);
        flatten(right);

        // 3. 拼左
        root.left = null;
        root.right = left;

        // 4. 拼右
        TreeNode p = root;
        while (p.right != null) {
            p = p.right;
        }
        p.right = right;
    }
}
```
#### 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(1)
### [116]填充每个节点的下一个右侧节点指针.java
给定一个 完美二叉树 ，其所有叶子节点都在同一层，每个父节点都有两个子节点。
#### 思路

1. 把每个节点的左子树指向右子树；
2. 值得注意的是，左子树的右子树也要指向右子树的左子树；
3. 应用前序递归框架（根、左、右）。
#### 代码
```
class Solution {
    public Node connect(Node root) {
        if (root == null) {
            return null;
        }
        connect(root.left, root.right);
        return root;
    }

    private void connect(Node left, Node right) {
        if (left == null || right == null) {
            return;
        }
        left.next = right;
        // 四个点，三个指向
        connect(left.left, left.right);
        connect(left.right, right.left);
        connect(right.left, right.right);
    }
}
```
#### 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(1)
### [701]二叉搜索树中的插入操作.java
给定二叉搜索树（BST）的根节点和要插入树中的值，将值插入二叉搜索树。 返回插入后二叉搜索树的根节点。 输入数据 保证 ，新值和原始二叉搜索树中的任意节点值都不同
#### 思路
这题的关键在于重置 **搜索路径** 上节点的左或右子树，如果不为空，则递归；如果为空，直接 new 一个新节点，这个节点不需要做任何处理，它是会被上一次递归所指向的。
#### 代码
```
class Solution {
    public TreeNode insertIntoBST(TreeNode root, int val) {
        if (root == null) {
            return new TreeNode(val);
        }
        if (val > root.val) {
            root.right = insertIntoBST(root.right, val);
        } else {
            root.left = insertIntoBST(root.left, val);
        }
        return root;
    }
}
```
#### 复杂度

- 时间复杂度：平均情况 O(logn)，最坏情况 O(n)
- 空间复杂度：平均情况 O(logn)，最坏情况 O(n)
### [450]删除二叉搜索树中的节点.java
给定一个二叉搜索树的根节点 root 和一个值 key，删除二叉搜索树中的 key 对应的节点，并保证二叉搜索树的性质不变。返回二叉搜索树（有可能被更新）的根节点的引用。 
#### 思路

1. 首先，查找和删除这两步不能分开，因为删除还需要用到删除节点的上一个节点。
2. 找到元素后，如果删除节点左右子树有空着的，只需要把另一棵子树移到当前位置即可，直接返回，这个节点不需要做任何处理，它是会被上一次递归所指向的。
3. 最复杂的是要删除的节点左右子树都不为空的情况，可以用一个小技巧：找到要删除节点的下一个更大节点，它的位置在其右子树的最左叶子节点，设为 p 节点，用 p 节点的值覆盖要删除的节点的值，这时 p 节点的值出现了 2 次，然后转而去右子树删除 p 节点的值。
#### 代码
```
class Solution {
    public TreeNode deleteNode(TreeNode root, int key) {
        if (root == null) {
            return null;
        } else if (root.val == key) {
            if (root.left == null || root.right == null) {
                return root.left == null ? root.right : root.left;
            } else {
                // 把右子树最左结点移到当前位置
                TreeNode p = root.right;
                while (p.left != null) {
                    p = p.left;
                }
                // 把要删除的值先覆盖，此时这个值出现 2 次， 去右子树删除多余的节点
                root.val = p.val;
                root.right = deleteNode(root.right, p.val);
            }
        } else if (root.val < key) {
            root.right = deleteNode(root.right, key);
        } else if (root.val > key) {
            root.left = deleteNode(root.left, key);
        }
        return root;
    }
}
```
#### 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)
### [102]二叉树的层序遍历.java
给你一个二叉树，请你返回其按 层序遍历 得到的节点值。 （即逐层地，从左到右访问所有节点）。 
#### 思路

1. 构建一个队列，初始化时将根结点入队；
2. 每个节点出队时，将它的子节点按先左后右的顺序入队；
3. 只要队列非空就重复以上步骤。
#### 代码
```
class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> res = new LinkedList<>();
        if (root == null) {
            return res;
        }
        Queue<TreeNode> q = new LinkedList<>(); // 核心数据结构
        q.offer(root); // 将起点加入队列
        while (!q.isEmpty()) {
            int size = q.size();
            List<Integer> row = new LinkedList<>();
            for (int i = 0; i < size; i++) {
                TreeNode cur = q.poll();
                row.add(cur.val);
                if (cur.left != null) {
                    q.offer(cur.left);
                }
                if (cur.right != null) {
                    q.offer(cur.right);
                }
            }
            res.add(row);
        }
        return res;
    }
}
```
#### 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)
### [752]打开转盘锁.java
你有一个带有四个圆形拨轮的转盘锁。每个拨轮都有10个数字： '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'。每个拨轮可以自由旋转：例如把 '9' 变为 '0'，'0' 变为 '9' 。每次旋转都只能旋转一个拨轮的一位数字。 
锁的初始数字为 '0000' ，一个代表四个拨轮的数字的字符串。 
列表 deadends 包含了一组死亡数字，一旦拨轮的数字和列表里的任何一个元素相同，这个锁将会被永久锁定，无法再被旋转。 
字符串 target 代表可以解锁的数字，你需要给出解锁需要的最小旋转次数，如果无论如何不能解锁，返回 -1 。 
#### 思路

1. 运用 BFS 框架，构建一个队列，每当一个字符串出队，就将改变 4 个密码位的 8 种情况入队，每判断一层，计数自增，当出队值等于目标值时返回计数，否则最终返回 -1；
2. 针对字符串中的某一位操作，可以抽一个方法出来；
3. 题目还给了一组死亡数字，当出队字符串包含其中时，就跳过，说明走到了死胡同；
4. 当出队的字符串不是最终目标时，就把它加入死亡数字，这样可以防止重复访问，走入死循环。
#### 代码
```
class Solution {
    public int openLock(String[] deadends, String target) {
        Queue<String> q = new LinkedList<>();
        Set<String> set = new HashSet<>();
        for (String deadend : deadends) {
            set.add(deadend);
        }
        q.offer("0000");
        int count = 0;
        while (!q.isEmpty()) {
            int size = q.size();
            for (int i = 0; i < size; i++) {
                String cur = q.poll();
                if (cur.equals(target)) {
                    return count;
                }
                if (set.contains(cur)) {
                    continue;
                }
                set.add(cur);
                for (int j = 0; j < 4; j++) {
                    q.offer(operateOne(cur, j, 1));
                    q.offer(operateOne(cur, j, -1));
                }
            }
            count++;
        }
        return -1;
    }

    /**
     * 改变字符串中的某一位
     *
     * @param s      字符串
     * @param index  哪一位
     * @param change 改变多少 （对于转盘锁只能传入 +1 或 -1）
     * @return
     */
    private String operateOne(String s, int index, int change) {
        char[] ch = s.toCharArray();
        if (ch[index] == '9' && change == 1) {
            ch[index] = '0';
        } else if (ch[index] == '0' && change == -1) {
            ch[index] = '9';
        } else {
            ch[index] += change;
        }
        return new String(ch);
    }
}
```
#### 复杂度
因为数字的进制、转盘的位数都是常数，

- 时间复杂度：O(deadends.length)
- 空间复杂度：O(deadends.length)
### [662]二叉树最大宽度.java
//给定一个二叉树，编写一个函数来获取这个树的最大宽度。树的宽度是所有层中的最大宽度。这个二叉树与满二叉树（full binary tree）结构相同，但一些节点为空。 //// 每一层的宽度被定义为两个端点（该层最左和最右的非空节点，两端点间的null节点也计入长度）之间的长度。 //// 示例 1: //// //输入: //// 1// / \// 3 2// / \ \// 5 3 9 ////输出: 4//解释: 最大值出现在树的第 3 层，宽度为 4 (5,3,null,9)。
```
class Solution {
    int maxWidth;
    Map<Integer, Integer> leftmostPositions;

    public int widthOfBinaryTree(TreeNode root) {
        maxWidth = 0;
        leftmostPositions = new HashMap<>();
        getWidth(root, 0, 0);
        return maxWidth;
    }

    private void getWidth(TreeNode node, int depth, int position) {
        if (node == null) return;
        // 不存在该层，则初始化
        leftmostPositions.computeIfAbsent(depth, key -> position);
        maxWidth = Math.max(maxWidth, position - leftmostPositions.get(depth) + 1);
        // 当前节点的左右边界
        getWidth(node.left, depth + 1, position * 2);
        getWidth(node.right, depth + 1, position * 2 + 1);
    }
}
```
### [199]二叉树的右视图.java
给定一个二叉树的 根节点 root，想象自己站在它的右侧，按照从顶部到底部的顺序，返回从右侧所能看到的节点值。 
```
class Solution {
    public List<Integer> rightSideView(TreeNode root) {
        List<Integer> result = new LinkedList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                TreeNode currentNode = queue.poll();
                if (i == 0) result.add(currentNode.val);
              // 入队：先右后左；否则就取 i == size -1 也可以
                if (currentNode.right != null) queue.offer(currentNode.right);
                if (currentNode.left != null) queue.offer(currentNode.left);
            }
        }
        return result;
    }
}
```
### [236]二叉树的最近公共祖先.java
```java
class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) {
            return root;
        }
        TreeNode left = lowestCommonAncestor(root.left, p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);
        if (left == null) {
            return right;
        }
        if (right == null) {
            return left;
        }
        return root;
    }
}
```
## 滑动窗口
### 模版
```
/* 滑动窗口算法框架 */
    void slidingWindow(String s, String t) {
        Map<Character, Integer> need = new HashMap<>();
        Map<Character, Integer> window = new HashMap<>();
        for (int i = 0; i < t.length(); i++) {
            char c = t.charAt(i);
            need.put(c, need.getOrDefault(c, 0) + 1);
        }
        int left = 0, right = 0;
        int valid = 0;
        while (right < s.length()) {
            // c 是将移入窗口的字符
            char c = s.charAt(right++);
            // todo 进行窗口内数据的一系列更新

            // todo 判断左侧窗口是否要收缩
            while (window need shrink) {
                // d 是将移出窗口的字符
                char d = s.charAt(left++);
                // todo 进行窗口内数据的一系列更新
            }
        }
    }
```

- right：寻找可行解
- left：试探最优解
### [3]无重复字符的最长子串.java
给定一个字符串 s ，请你找出其中不含有重复字符的 最长子串 的长度。 
#### 思路

- right：寻找可行解：只要无重复字符就前进，一旦出现重复字符就停止，记录坐标
- left：试探最优解：出现重复字符时前进，直到重复字符消失
#### 代码
```java
class Solution {
    public int lengthOfLongestSubstring(String s) {
        if (s.length() == 0) {
            return 0;
        }
        Map<Character, Integer> map = new HashMap<>();
        int left = 0, right = 0;
        int res = 1;
        while (right < s.length()) {
            // c 是将移入窗口的字符，右移窗口
            char c = s.charAt(right++);
            // 进行窗口内数据的一系列更新
            map.put(c, map.getOrDefault(c, 0) + 1);
            //  判断左侧窗口是否要收缩
            while (map.get(c) > 1) {
                // d 是将移出窗口的字符，左移窗口
                char d = s.charAt(left++);
                // 进行窗口内数据的一系列更新
                map.put(d, map.get(d) - 1);
            }
            res = Math.max(res, right - left);
        }
        return res;
    }
}
```
#### 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)
### [438]找到字符串中所有字母异位词.java
给定两个字符串 s 和 p，找到 s 中所有 p 的 异位词 的子串，返回这些子串的起始索引。不考虑答案输出的顺序。 
异位词 指字母相同，但排列不同的字符串。 
#### 思路
当窗口大小等于 p 的长度时，左右指针同时前进，寻找可行解。
#### 代码
```
class Solution {
    public List<Integer> findAnagrams(String s, String p) {
        List<Integer> res = new ArrayList<>();
        Map<Character, Integer> need = new HashMap<>();
        Map<Character, Integer> window = new HashMap<>();
        for (int i = 0; i < p.length(); i++) {
            char c = p.charAt(i);
            need.put(c, need.getOrDefault(c, 0) + 1);
        }
        int left = 0, right = 0;
        int valid = 0;
        while (right < s.length()) {
            // c 是将移入窗口的字符
            char c = s.charAt(right++);
            // 进行窗口内数据的一系列更新
            if (need.containsKey(c)) {
                window.put(c, window.getOrDefault(c, 0) + 1);
                if (window.get(c).equals(need.get(c))) {
                    valid++;
                }
            }

            // 判断左侧窗口是否要收缩
            if (right - left == p.length()) {
                if (valid == need.size()) {
                    res.add(left);
                }
                // d 是将移出窗口的字符
                char d = s.charAt(left++);
                // 进行窗口内数据的一系列更新
                if (need.containsKey(d)) {
                    if (window.get(d).equals(need.get(d))) {
                        valid--;
                    }
                    window.put(d, window.get(d) - 1);
                }
            }
        }
        return res;
    }
}
```
#### 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)
## 回溯
### [46]全排列.java
给定一个不含重复数字的数组 nums ，返回其 所有可能的全排列 。你可以 按任意顺序 返回答案。 
#### 思路

1. 定义结果集为全局变量；
2. 核心是写出回溯函数，明确增添结果、退出递归的时机，向每一种可能的情况迈出一小步，进入下一次回溯，在最后还要归位；
3. 正确的结果集：路径长度达到数字长度；
4. 筛选条件：数字在路径中没有出现过；
5. 对算法进行适当的剪枝，提高时间效率。
#### 代码
```
class Solution {
    // 结果集
    private List<List<Integer>> res = new ArrayList<>();

    public List<List<Integer>> permute(int[] nums) {
				// add、remove 不会影响new ArrayList 的浅拷贝
        backTrack(nums, new LinkedList<>());
        return res;
    }

    private void backTrack(int[] nums, LinkedList<Integer> path) {
        // 增添结果、退出递归
        if (path.size() == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            // 筛选
            if (path.contains(nums[i])) {
                continue;
            }
            // 试探步
            path.addLast(nums[i]);
            // 回溯
            backTrack(nums, path);
            // 归位
            path.removeLast();
        }
    }
}
```
#### 复杂度

- 时间复杂度：O(n*n!)
- 空间复杂度：O(n)
### [51]N 皇后.java
n 皇后问题 研究的是如何将 n 个皇后放置在 n×n 的棋盘上，并且使皇后彼此之间不能相互攻击。 
给你一个整数 n ，返回所有不同的 n 皇后问题 的解决方案。 
每一种解法包含一个不同的 n 皇后问题 的棋子放置方案，该方案中 'Q' 和 '.' 分别代表了皇后和空位。 
#### 思路

1. 定义结果集为全局变量；
2. 核心是写出回溯函数，明确增添结果、退出递归的时机，向每一种通过筛选的情况迈出一小步，进入下一次回溯，在最后还要归位；
3. 正确的结果集：第 8 行皇后符合要求；
4. 筛选条件：任意两皇后不在同一行、同一列或同一斜线；
5. 对算法进行适当的剪枝，提高时间效率。
#### 代码
```
class Solution {
    // 结果集
    private List<List<String>> res = new ArrayList<>();

    public List<List<String>> solveNQueens(int n) {
        // 初始化棋盘
        char[][] board = new char[n][n];
        for (char[] line : board) {
            Arrays.fill(line, '.');
        }
        backTrack(board, 0);
        return res;
    }

    private void backTrack(char[][] board, int row) {
        // 增添结果、退出递归
        if (row == board.length) {
            List<String> list = new ArrayList<>();
            for (char[] c : board) {
                list.add(String.copyValueOf(c));
            }
            res.add(list);
            return;
        }
        for (int col = 0; col < board[row].length; col++) {
            // 筛选
            if (!isValid(board, row, col)) {
                continue;
            }
            // 试探步
            board[row][col] = 'Q';
            // 回溯
            backTrack(board, row + 1);
            // 归位
            board[row][col] = '.';
        }
    }

    private boolean isValid(char[][] board, int row, int col) {
        int n = board.length;
        // 检查列是否有皇后冲突
        for (int i = 0; i < n; i++) {
            if (board[i][col] == 'Q') {
                return false;
            }
        }

        // 检查右上方是否有皇后冲突
        for (int i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
            if (board[i][j] == 'Q') {
                return false;
            }
        }

        // 检查左上方是否有皇后冲突
        for (int i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
            if (board[i][j] == 'Q') {
                return false;
            }
        }
        return true;
    }
}
```
#### 复杂度

- 时间复杂度：O(n!)
- 空间复杂度：O(n)
### [22]括号生成.java
数字 n 代表生成括号的对数，请你设计一个函数，用于能够生成所有可能的并且 有效的 括号组合。 
有效括号组合需满足：左括号必须以正确的顺序闭合。 
#### 思路

1. 以左右括号剩余数为筛选、判断的标准；
2. 正确的结果集：左右括号剩余数都为 0；
3. 筛选条件：左右括号剩余数都为非负数，且右括号剩余数不小于左括号剩余数；
#### 代码
```
class Solution {
    // 结果集
    List<String> res = new LinkedList<>();

    public List<String> generateParenthesis(int n) {
        String curStr = "";
        // 结果演进的起点是空字符串，左右各有n个括号
        backtrack(curStr, n, n);
        return res;
    }

    /**
     * 回溯法
     *
     * @param str   路径
     * @param left  左括号剩余数
     * @param right 右括号剩余数
     */
    private void backtrack(String str, int left, int right) {
        //边界条件 base case
        if (left == 0 && right == 0) {
            res.add(str);
            return;
        }
        //减枝：左括号数必须大于等于右括号
        if (left < 0 || right < 0 || left > right) {
            return;
        }
        if (left > 0) {
            backtrack(str + "(", left - 1, right);
        }
        if (right > 0) {
            backtrack(str + ")", left, right - 1);
        }
    }
}
```
#### 复杂度

- 时间复杂度： O(C_{2n}^n) 
- 空间复杂度：O(1)
### 039 组合总和
给定一个无重复元素的数组 candidates 和一个目标数 target ，找出 candidates 中所有可以使数字和为 target 的组合。 candidates 中的数字可以无限制重复被选取。 
#### 代码
```
class Solution {
    // 结果集
    List<List<Integer>> res = new ArrayList<>();

    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        if (candidates == null || candidates.length == 0) {
            return res;
        }
        Arrays.sort(candidates);
        backTrack(new ArrayList<>(), 0, 0, candidates, target);
        return res;
    }

    private void backTrack(List<Integer> path, int sum, int idx, int[] candidates, int target) {
        // base case
        if (sum == target) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = idx; i < candidates.length; i++) {
            // 减枝
            if (sum + candidates[i] > target) {
                break;
            }
            path.add(candidates[i]);
            backTrack(path, sum + candidates[i], i, candidates, target);
            path.remove(path.size() - 1);
        }
    }
}
```
#### 复杂度

- 时间复杂度：O(n*2^n)实际运行情况远远小于这个上界可表示为 O(S)，其中 S 为所有可行解的长度之和
- 空间复杂度：O(target)
### 040 组合总和Ⅱ
在 039 组合总和 的基础上，每个数字在每个组合中只能使用一次
#### 代码
```
class Solution {
    // 结果集
    Set<List<Integer>> res = new HashSet<>();

    public List<List<Integer>> combinationSum2(int[] candidates, int target) {
        if (candidates == null || candidates.length == 0) {
            return new ArrayList<>(res);
        }
        Arrays.sort(candidates);
        backTrack(new ArrayList<>(), 0, 0, candidates, target);
        // 返回值类型需要 Set 转 List
        return new ArrayList<>(res);
    }

    private void backTrack(List<Integer> path, int sum, int idx, int[] candidates, int target) {
        // base case
        if (sum == target) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = idx; i < candidates.length; i++) {
            // 减枝
            if (sum + candidates[i] > target) {
                break;
            }
            path.add(candidates[i]);
            //回溯时用过的数字不能再用
            backTrack(path, sum + candidates[i], i + 1, candidates, target);
            path.remove(path.size() - 1);
        }
    }
}
```
#### 复杂度

- 时间复杂度：O(n*2^n)实际运行情况远远小于这个上界可表示为 O(S)，其中 S 为所有可行解的长度之和
- 空间复杂度：O(target)
### 046 全排列
给定一个不含重复数字的数组 nums ，返回其 **所有可能的全排列** 。你可以 **按任意顺序** 返回答案。
#### 代码
```
class Solution {
    // 结果集
    List<List<Integer>> res = new ArrayList<>();

    public List<List<Integer>> permute(int[] nums) {
        backTrack(nums, new LinkedList<>());
        return res;
    }

    private void backTrack(int[] nums, LinkedList<Integer> path) {
        // 减枝
        if (path.size() == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            // 筛选
            if (path.contains(nums[i])) {
                continue;
            }
            path.addLast(nums[i]);
            backTrack(nums, path);
            path.removeLast();
        }
    }
}
```
#### 复杂度

- 时间复杂度：O(n*n!)
- 空间复杂度：O(n)
### 047 全排列Ⅱ
在 046 全排列 的基础上，nums可包含重复数字
#### 代码
```
class Solution {
    // 结果集
    Set<List<Integer>> res = new HashSet<>();

    public List<List<Integer>> permuteUnique(int[] nums) {
        backTrack(nums, new LinkedList<>(), new boolean[nums.length]);
        return new ArrayList<>(res);
    }

    private void backTrack(int[] nums, LinkedList<Integer> path, boolean[] used) {
        // 减枝
        if (path.size() == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            // 筛选
            if (used[i]) {
                continue;
            }
            path.addLast(nums[i]);
            used[i] = true;
            backTrack(nums, path, used);
            path.removeLast();
            used[i] = false;
        }
    }
}
```
#### 复杂度

- 时间复杂度：O(n*n!)
- 空间复杂度：O(n)
## 动态规划
### [322]零钱兑换.java
给你一个整数数组 coins ，表示不同面额的硬币；以及一个整数 amount ，表示总金额。 
计算并返回可以凑成总金额所需的 最少的硬币个数 。如果没有任何一种硬币组合能组成总金额，返回 -1 。 
你可以认为每种硬币的数量是无限的。 
#### 思路

1. 自底向上考虑，要凑到 i 元钱有 dp[i] 种情况，新建 dp 数组；
2. 初始值：dp[0] = 0;
3. 状态转移方程：dp[i] = min(dp[i], 1 + dp[i - coin]);
4. 返回值：dp[amount];
5. 剪枝：硬币金额大于目标金额。
#### 代码
```
class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int i = 0; i <= amount; i++) {
            // 要凑到 i 元钱有 dp[i] 种情况
            for (int coin : coins) {
                if (coin > i) {
                    continue;
                }
                dp[i] = Math.min(dp[i], 1 + dp[i - coin]);
            }
        }
        return (dp[amount] == amount + 1) ? -1 : dp[amount];
    }
}
```
#### 复杂度

- 时间复杂度：O(n^2)
- 空间复杂度：O(n)
### [53]最大子序和.java
给定一个整数数组 nums ，找到一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。 
#### 思路
因为，某一位的最大子序和无非两种情况

1. 继续累加前一个数的最大子序和
2. 从当前数字重新累加

所以，得到状态转移方程：
f(i)=max({f(i−1)+nums[i],nums[i]})
#### 代码
```
class Solution {
    public int maxSubArray(int[] nums) {
        int pre = 0, maxAns = nums[0];
        for (int x : nums) {
            pre = Math.max(pre + x, x);
            maxAns = Math.max(maxAns, pre);
        }
        return maxAns;
    }
}

class Solution {
    public int maxSubArray(int[] nums) {
        int left = 0, right = 0, sum = 0, res = Integer.MIN_VALUE;
        while (right < nums.length) {
            sum += nums[right++];
            while (sum < 0) {
                // d 是将移出窗口的字符
                sum -= nums[left++];
            }
            res = Math.max(sum, res);
        }
        int negative = Integer.MIN_VALUE;
        for (int num : nums) {
            negative = Math.max(num, negative);
        }
        return negative < 0 ? negative : res;
    }
}
```
#### 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(1)
### [300]最长递增子序列.java
给你一个整数数组 nums ，找到其中最长严格递增子序列的长度。 
子序列是由数组派生而来的序列，删除（或不删除）数组中的元素而不改变其余元素的顺序。例如，[3,6,2,7] 是数组 [0,3,1,6,2,2,7] 的子序列。 
#### 思路
因为，某一位的最大子序长度无非两种情况

1. 先在前面找出比当前数字更小的数字，找一个长度最长的自增 1 作为当前的最大自序长度
2. 从当前数字重新累加（可以让初始化长度为1）
#### 代码
```
class Solution {
    public int lengthOfLIS(int[] nums) {
        final int n = nums.length;
        int[] dp = new int[n];
        // base case：dp 数组全都初始化为 1
        Arrays.fill(dp, 1);
        int res = 0;
        for (int i = 0; i < n; i++) {
            // 在前面找比当前数字更小的数字，以满足递增子序列的要求。
            int cur = nums[i];
            for (int j = 0; j < i; j++) {
                if (nums[j] < cur)
                    dp[i] = Math.max(dp[i], dp[j] + 1);
            }
            // 更新最大值作为返回结果
            res = Math.max(res, dp[i]);
        }
        return res;
    }
}
```
#### 复杂度

- 时间复杂度：O(n^2)
- 空间复杂度：O(n)
## 栈和队列
### [225]用队列实现栈.java
请你仅使用两个队列实现一个后入先出（LIFO）的栈，并支持普通栈的全部四种操作（push、top、pop 和 empty）。 
#### 思路

1. 用一个全局变量记录栈顶。
2. 入栈、判空不做处理
3. 额外处理出栈的 pop 操作，把队列中前 n-1 个元素出队再入队，返回末尾元素。
#### 代码
```
class MyStack {

    Queue<Integer> queue;
    int top;

    /**
     * Initialize your data structure here.
     */
    public MyStack() {
        queue = new LinkedList<>();
        top = 0;
    }

    /**
     * Push element x onto stack.
     */
    public void push(int x) {
        queue.offer(x);
        top = x;
    }

    /**
     * Removes the element on top of the stack and returns that element.
     */
    public int pop() {
        int size = queue.size();
        for (int i = 0; i < size - 1; i++) {
            top = queue.peek();
            queue.offer(queue.poll());
        }
        return queue.poll();
    }

    /**
     * Get the top element.
     */
    public int top() {
        return top;
    }

    /**
     * Returns whether the stack is empty.
     */
    public boolean empty() {
        return queue.isEmpty();
    }
}
```
### [232]用栈实现队列.java
请你仅使用两个栈实现先入先出队列。队列应当支持一般队列支持的所有操作（push、pop、peek、empty）
#### 思路

1. 建立 2 个栈，元素先入 s1，再入 s2，这样 s2 的栈顶就相当于队尾了。
2. 把关键操作放在 peek 处，在 pop 之前，先调用 peek ，就能确保不会出错了。
#### 代码
```
class MyQueue {

    private Stack<Integer> s1, s2;

    /**
     * Initialize your data structure here.
     */
    public MyQueue() {
        s1 = new Stack<>();
        s2 = new Stack<>();
    }

    /**
     * Push element x to the back of queue.
     */
    public void push(int x) {
        s1.push(x);
    }

    /**
     * Removes the element from in front of queue and returns that element.
     */
    public int pop() {
        // 将 s1 元素转移至 s2
        peek();
        return s2.pop();
    }

    /**
     * Get the front element.
     */
    public int peek() {
        if (s2.isEmpty()) {
            while (!s1.isEmpty()) {
                s2.push(s1.pop());
            }
        }
        return s2.peek();
    }

    /**
     * Returns whether the queue is empty.
     */
    public boolean empty() {
        return s1.isEmpty() && s2.isEmpty();
    }
}
```
### [496]下一个更大元素 I.java
给你两个 没有重复元素 的数组 nums1 和 nums2 ，其中nums1 是 nums2 的子集。 
请你找出 nums1 中每个元素在 nums2 中的下一个比其大的值。 
nums1 中数字 x 的下一个更大元素是指 x 在 nums2 中对应位置的右边的第一个比 x 大的元素。如果不存在，对应位置输出 -1 。
#### 思路

1. 从后往前遍历 nums2，用栈记录右侧大于当前数字的值；
2. 以当前数字为 key，下一个更大元素为 value，建立一个 HashMap 存储；
3. 遍历 nums1 ,获取每一个 key 的 value。
#### 代码
```
class Solution {
    public int[] nextGreaterElement(int[] nums1, int[] nums2) {
        Map<Integer, Integer> map = new HashMap<>();
        Stack<Integer> stack = new Stack<>();
        // 从后往前遍历
        for (int i = nums2.length - 1; i >= 0; i--) {
            while (!stack.isEmpty() && nums2[i] >= stack.peek()) {
                // 栈顶元素即将被 nums2[i] 挡住
                stack.pop();
            }
            int nextGreaterNum = stack.isEmpty() ? -1 : stack.peek();
            map.put(nums2[i], nextGreaterNum);
            stack.push(nums2[i]);
        }
        int[] res = new int[nums1.length];
        for (int i = 0; i < nums1.length; i++) {
            res[i] = map.get(nums1[i]);
        }
        return res;
    }
}
```
#### 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)
### [503]下一个更大元素 II.java
给定一个循环数组（最后一个元素的下一个元素是数组的第一个元素），输出每个元素的下一个更大元素。数字 x 的下一个更大的元素是按数组遍历顺序，这个数字之后的第一个比它更大的数，这意味着你应该循环地搜索它的下一个更大的数。如果不存在，则输出 -1。
#### 思路

1. 从后往前遍历 nums，用栈记录右侧大于当前数字的值
2. 因为数组是循环数组，所以在赋值 -1 时还要去坐标左边找找，如果还找不到更大元素，那么就返回 -1，否则就返回第一个更大元素。
#### 代码
```
class Solution {
    public int[] nextGreaterElements(int[] nums) {
        int[] res = new int[nums.length];
        Stack<Integer> stack = new Stack<>();
        // 从后往前遍历
        for (int i = nums.length - 1; i >= 0; i--) {
            while (!stack.isEmpty() && nums[i] >= stack.peek()) {
                // 栈顶元素即将被 nums[i] 挡住
                stack.pop();
            }
            if (stack.isEmpty()) {
                res[i] = -1;
                // 后面找不到了，去前面找找看
                for (int j = 0; j < i; j++) {
                    if (nums[j] > nums[i]) {
                        res[i] = nums[j];
                        break;
                    }
                }
            } else {
                res[i] = stack.peek();
            }
            stack.push(nums[i]);
        }
        return res;
    }
}

class Solution {
    public int[] nextGreaterElements(int[] nums) {
        int n = nums.length;
        int[] res = new int[n];
        Arrays.fill(res, -1);
        // 单调栈中存放下标
        Stack<Integer> stack = new Stack<>();
        for (int i = 0; i < n * 2; i++) {
            while (!stack.isEmpty() && nums[stack.peek()] < nums[i % n]) {
                // 出栈的值的下一个更大元素即为 nums[i]
                res[stack.pop()] = nums[i % n];
            }
            if (i < n) {
                stack.push(i);
            }
        }
        return res;
    }
}
```
#### 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)
### [1047]删除字符串中的所有相邻重复项.java
//给出由小写字母组成的字符串 S，重复项删除操作会选择两个相邻且相同的字母，并删除它们。 //// 在 S 上反复执行重复项删除操作，直到无法继续删除。 //// 在完成所有重复项删除操作后返回最终的字符串。答案保证唯一。 //// //// 示例： //// 输入："abbaca"//输出："ca"//解释：//例如，在 "abbaca" 中，我们可以删除 "bb" 由于两字母相邻且相同，这是此时唯一可以执行删除操作的重复项。之后我们得到字符串 "aaca"，其中又//只有 "aa" 可以执行重复项删除操作，所以最后的字符串为 "ca"。
```
class Solution {
    public String removeDuplicates(String s) {
        char[] stack = new char[s.length()];
        int index = 0;
        for (char currentChar : s.toCharArray()) {
            if (index > 0 && stack[index - 1] == currentChar) {
                index--;
            } else {
                stack[index++] = currentChar;
            }
        }
        return new String(stack, 0, index);
    }
}
```
## 其他
### 并查集（Union-Find）算法：[990]等式方程的可满足性.java
给定一个由表示变量之间关系的字符串方程组成的数组，每个字符串方程 equations[i] 的长度为 4，并采用两种不同的形式之一："a==b" 或 "a!=b"。在这里，a 和 b 是小写字母（不一定不同），表示单字母变量名。 
只有当可以将整数分配给变量名，以便满足所有给定的方程时才返回 true，否则返回 false。 
#### 思路

1. 将方程分成等式和不等式两类；
2. 初始化「图」；
3. 根据等式连接两两节点；
4. 判断不等式是否成立。
#### 代码
```
class Solution {
    // 节点 x 的节点是 parent[x]
    private int[] parent;
    // 新增一个数组记录树的“重量”
    private int[] size;

    public boolean equationsPossible(String[] equations) {
        // 1. 将方程分成等式和不等式两类
        List<String> equals = new LinkedList<>();
        List<String> unEquals = new LinkedList<>();
        for (String equation : equations) {
            char c = equation.charAt(1);
            if (c == '=') {
                equals.add(equation);
            } else if (c == '!') {
                unEquals.add(equation);
            }
        }
        // 2. 初始化「图」
        parent = new int[26];
        size = new int[26];
        for (int i = 0; i < 26; i++) {
            // 父节点指针初始指向自己
            parent[i] = i;
            // 重量应该初始化 1
            size[i] = 1;
        }
        // 3. 根据等式连接两两节点
        for (String equal : equals) {
            int a = equal.charAt(0) - 'a';
            int b = equal.charAt(3) - 'a';
            union(a, b);
        }
        // 4. 判断不等式是否成立
        for (String unEqual : unEquals) {
            int a = unEqual.charAt(0) - 'a';
            int b = unEqual.charAt(3) - 'a';
            int rootA = find(a);
            int rootB = find(b);
            if (rootA == rootB) {
                return false;
            }
        }
        return true;
    }

    /* 将 p 和 q 连接 */
    private void union(int p, int q) {
        int rootP = find(p);
        int rootQ = find(q);
        if (rootP == rootQ) {
            // 二者已连接
            return;
        }
        // 将两棵树合并为一棵，小树接到大树下面
        if (size[rootP] > size[rootQ]) {
            parent[rootQ] = rootP;
            size[rootP] += size[rootQ];
        } else {
            parent[rootP] = rootQ;
            size[rootQ] += size[rootP];
        }
    }

    /* 返回某个节点 x 的根节点 */
    private int find(int x) {
        // 根节点的 parent[x] == x
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
}
```
#### 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)
### [146]LRU 缓存机制.java
运用你所掌握的数据结构，设计和实现一个 LRU (最近最少使用) 缓存机制 。 
实现 LRUCache 类： 

- LRUCache(int capacity) 以正整数作为容量 capacity 初始化 LRU 缓存 
- int get(int key) 如果关键字 key 存在于缓存中，则返回关键字的值，否则返回 -1 。 
- void put(int key, int value) 如果关键字已经存在，则变更其数据值；如果关键字不存在，则插入该组「关键字-值」。当缓存容量达到上限时，它应该在写入新数据之前删除最久未使用的数据值，从而为新的数据值留出空间。 
#### 思路

1. 需要一个有时序的 Map 来实现算法，在 Java 语言中可以使用 **LinkedHashMap**；
2. LRU 的核心是 makeRecently 方法，它把一对 key-value 放到最新的位置，也就是链表的队尾。
3. get 方法直接去 Map 中找，并调用 makeRecently 方法；
4. put 方法需要考虑缓存大小超出给定容量的情况，若 key 是第一次出现，则需要删除**最久未使用**的 key-value 对，并添加新的 key-value 对；若原本就存在 key，则更新它的 value，并调用 makeRecently 方法。
#### 代码
```
class LRUCache {
    int capacity;
    LinkedHashMap<Integer, Integer> cache;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        cache = new LinkedHashMap<>();
    }

    public int get(int key) {
        if (!cache.containsKey(key)) {
            return -1;
        }
        return makeRecently(key);
    }

    public void put(int key, int value) {
        // 容量已满，需要移除
        if (cache.size() == capacity && !cache.containsKey(key)) {
            int oldestKey = cache.keySet().iterator().next();
            cache.remove(oldestKey);
        }
        cache.put(key, value);
        makeRecently(key);
    }

    private int makeRecently(int key) {
        int val = cache.get(key);
        // 删除 key，重新插入到队尾
        cache.remove(key);
        cache.put(key, val);
        return val;
    }
}
```
#### 复杂度

- 时间复杂度：O(1)
- 空间复杂度：O(capacity)
### 050 Pow(x,n)
#### int转换为long
Java 代码中 int32 变量 n \in [-2147483648, 2147483647]，因此当 n = -2147483648 时执行 n = -n会因越界而赋值出错。解决方法是先将 n 存入 long 变量 b ，后面用 b 操作即可。
#### 代码（迭代）
```
class Solution {
    public double myPow(double x, int n) {
        if (x == 0.0f) return 0.0d;
        //防止n=-n赋值越界
        long b = n;
        // n=0情况返回1
        double res = 1.0;
        if (b < 0) {
            x = 1 / x;
            b = -b;
        }
        while (b > 0) {
            if ((b & 1) == 1) {
                //奇数
                res *= x;
            }
            x *= x;
            //按位右移，相当于除以2
            b >>= 1;
        }
        return res;
    }
}
```
#### 复杂度

- 时间复杂度：O(logn)
- 空间复杂度：O(1)





---

> 作者: 都将会  
> URL: https://leni.fun/leetcode/  

