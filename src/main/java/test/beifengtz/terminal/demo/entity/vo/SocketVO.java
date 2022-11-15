package test.beifengtz.terminal.demo.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Description: TODO
 *
 * Created in 15:10 2022/11/8
 *
 * @author beifengtz
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class SocketVO {

    /**
     * 0 - 系统消息
     * 1 - SSH响应消息
     * 2 - SSH异常消息
     * 3 - SSH执行结束消息
     * 4 - SSH断开连接
     * 5 - 设置窗口大小
     */
    private int type = 0;
    private Object content;

    public static SocketVO system(Object content) {
        return new SocketVO(0, content);
    }

    public static SocketVO sshResponse(Object content) {
        return new SocketVO(1, content);
    }

    public static SocketVO sshError(Object content) {
        return new SocketVO(2, content);
    }

    public static SocketVO sshFinish(Object content) {
        return new SocketVO(3, content);
    }

    public static SocketVO sshExist() {
        return new SocketVO(4, null);
    }
}
