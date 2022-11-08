package test.beifengtz.terminal.demo.websocket;

import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.json.JsonMapper;
import test.beifengtz.terminal.demo.entity.vo.SocketVO;

import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

/**
 * Description: TODO
 *
 * Created in 15:20 2022/11/8
 *
 * @author beifengtz
 */
public class MsgEncoder implements Encoder.Text<SocketVO> {

    @Override
    public String encode(SocketVO object) throws EncodeException {
        try {
            return new JsonMapper().setDefaultPropertyInclusion(Include.NON_NULL).writeValueAsString(object);
        } catch (JsonProcessingException e) {
            throw new EncodeException(object, e.getMessage());
        }
    }

    @Override
    public void init(EndpointConfig endpointConfig) {

    }

    @Override
    public void destroy() {

    }
}
