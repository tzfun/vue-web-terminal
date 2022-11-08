package test.beifengtz.terminal.demo.entity.vo;

import lombok.Builder;
import lombok.Data;

/**
 * Description: TODO
 *
 * Created in 14:43 2022/11/8
 *
 * @author beifengtz
 */
@Data
@Builder
public class ResultVO {
    private int code;
    private String msg = "ok";
    private Object data;
}
