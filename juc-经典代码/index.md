# 🚩JUC 经典代码


<!--more-->

```java
package juc;

import java.util.concurrent.*;

/**
 * 一个线程1,3,5,7；一个线程 2,4,6,8；合作输出 1,2,3,4,5,6,7,8
 * 核心思想：
 * 1. 使用synchronized关键字对lock对象进行同步
 * 2. 使用wait和notify方法实现线程之间的交替输出
 * 3. 输出的数字用 volatile 修饰，保证可见性
 */
public class AlternatePrinting {
    private static final Object lock = new Object();
    private static volatile int count = 1;

    public static void main(String[] args) {
        // 等价于newFixedThreadPool（2），但是阻塞队列上限不是 Integer.MAX_VALUE
        ExecutorService executorService = new ThreadPoolExecutor(2, 2, 0L, TimeUnit.MILLISECONDS,
                new LinkedBlockingQueue<>(1), new CustomThreadFactory());
        executorService.submit(new OddPrinter());
        executorService.submit(new EvenPrinter());
        executorService.shutdown();
    }

    static class CustomThreadFactory implements ThreadFactory {
        private static final String THREAD_NAME_PREFIX = "MyThread-";
        private int threadCount = 1;

        @Override
        public Thread newThread(Runnable r) {
            Thread thread = new Thread(r);
            thread.setName(THREAD_NAME_PREFIX + threadCount++);
            return thread;
        }
    }

    static class OddPrinter implements Runnable {
        @Override
        public void run() {
            while (count <= 8) {
                synchronized (lock) {
                    if (count % 2 != 0) {
                        System.out.println(count++ + " by " + Thread.currentThread().getName());
                        lock.notify();
                    } else {
                        try {
                            lock.wait();
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }
                }
            }
        }
    }

    static class EvenPrinter implements Runnable {
        @Override
        public void run() {
            while (count <= 8) {
                synchronized (lock) {
                    if (count % 2 == 0) {
                        System.out.println(count++ + " by " + Thread.currentThread().getName());
                        lock.notify();
                    } else {
                        try {
                            lock.wait();
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }
                }
            }
        }
    }
}
```

 以上代码由 ChatGPT 生成，经验证可以实现功能。


---

> 作者: 都将会  
> URL: https://leni.fun/juc-%E7%BB%8F%E5%85%B8%E4%BB%A3%E7%A0%81/  

