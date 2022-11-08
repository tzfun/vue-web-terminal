package test.beifengtz.terminal.demo.ssh;

/**
 * Description: TODO
 *
 * Created in 17:34 2022/11/8
 *
 * @author beifengtz
 */
public enum SSHSignal {
    SIGHUP(1),      //  终止进程，挂起
    SIGINT(2),      //  键盘输入中断命令，一般是CTRL+C
    SIGQUIT(3),     //  键盘输入退出命令，一般是CTRL+\
    SIGILL(4),      //  非法指令
    SIGTRAP(5),     //  trap指令发出，一般调试用
    SIGABRT(6),     //  abort(3)发出的终止信号
    SIGBUS(7),      //  非法地址
    SIGFPE(8),      //  浮点数异常
    SIGKILL(9),     //  立即停止进程，不能捕获，不能忽略
    SIGUSR1(10),    //  用户自定义信号1
    SIGSEGV(11),    //  无效内存引用
    SIGUSR2(12),    //  用户自定义信号2
    SIGPIPE(13),    //  管道不能访问
    SIGALRM(14),    //  时钟信号，alrm(2)发出的终止信号
    SIGTERM(15),    //  终止信号，进程会先关闭正在运行的任务或打开的文件再终止，有时间进程在有运行的任务而忽略此信号。不能捕捉
    SIGSTKFLT(16),  //  处理器栈错误
    SIGCHLD(17),    //  子进程结束时，父进程收到的信号
    SIGCONT(18),    //  让终止的进程继续执行
    SIGSTOP(19),    //  停止进程，不能忽略，不能捕获
    SIGSTP(20),     //  停止进程，一般是CTRL+Z
    SIGTTIN(21),    //  后台进程从终端读数据
    SIGTTOU(22),    //  后台进程从终端写数据
    SIGURG(23),     //  紧急数组是否到达socket
    SIGXCPU(24),    //  超出CPU占用资源限制
    SIGXFSZ(25),    //  超出文件大小资源限制
    SIGVTALRM(26),  //  虚拟时钟信号，类似于SIGALRM，但计算的是进程占用的时间
    SIGPROF(27),    //  类似与SIGALRM，但计算的是进程占用CPU的时间
    SIGWINCH(28),   //  窗口大小改变发出的信号
    SIGIO(29),      //  文件描述符准备就绪，可以输入/输出操作了
    SIGPWR(30),     //  电源失败
    SIGSYS(31),     //  非法系统调用
    ;
    private final int seq;

    SSHSignal(int seq) {
        this.seq = seq;
    }

    public int getSeq() {
        return seq;
    }

    @Override
    public String toString() {
        return String.valueOf(seq);
    }

}
