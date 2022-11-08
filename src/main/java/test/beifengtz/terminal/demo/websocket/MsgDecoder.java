package test.beifengtz.terminal.demo.websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.json.JsonMapper;
import test.beifengtz.terminal.demo.entity.vo.SocketVO;
import test.beifengtz.terminal.demo.entity.vo.SocketVO;

import javax.websocket.DecodeException;
import javax.websocket.Decoder;
import javax.websocket.EndpointConfig;

/**
 * Description: TODO
 *
 * Created in 15:22 2022/11/8
 *
 * @author beifengtz
 */
public class MsgDecoder implements Decoder.Text<SocketVO> {

    @Override
    public SocketVO decode(String s) throws DecodeException {
        try {
            return new JsonMapper().readValue(s, SocketVO.class);
        } catch (JsonProcessingException e) {
            throw new DecodeException(s, e.getMessage(), e);
        }
    }

    @Override
    public boolean willDecode(String s) {
        return s.startsWith("{");
    }

    @Override
    public void init(EndpointConfig endpointConfig) {

    }

    @Override
    public void destroy() {

    }
}
