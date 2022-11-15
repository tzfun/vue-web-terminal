package test.beifengtz.terminal.demo.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import test.beifengtz.terminal.demo.Context;
import test.beifengtz.terminal.demo.entity.vo.SocketVO;

import javax.websocket.EncodeException;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;

/**
 * Description: websocket connect url ws://127.0.0.1:8080/ssh/eec87365-4551-4bc8-a708-e31e6684db5d
 *
 * Created in 14:35 2022/11/8
 *
 * @author beifengtz
 */
@ServerEndpoint(
        value = "/ssh/{socketKey}",
        encoders = {MsgEncoder.class},
        decoders = {MsgDecoder.class}
)
@Component
@Slf4j
public class WebsocketHandler {

    public static final SocketVO FLAG_CONNECT = SocketVO.system("connected");
    public static final SocketVO FLAG_FINISH = SocketVO.system("finish");

    private Session session;
    private String socketKey;

    @OnOpen
    public void onOpen(Session session, @PathParam("socketKey") String socketKey) throws IOException {
        this.session = session;
        if (Context.tryConnectWebsocket(socketKey, this)) {
            this.socketKey = socketKey;
            send(FLAG_CONNECT);
            log.debug("Open websocket connection '{}'", socketKey);
        } else {
            session.close();
            log.debug("Receive a connected websocket key '{}'", socketKey);
        }
    }

    @OnClose
    public void onClose() {
        if (socketKey != null) {
            Context.release(socketKey);
            log.debug("Closed websocket connection '{}'", socketKey);
        }
    }

    @OnError
    public void onError(Throwable error) {
        log.error("Websocket error '{}': {}", socketKey, error.getMessage(), error);
    }

    @OnMessage
    public void onMessage(SocketVO msg) throws IOException {
        if (FLAG_FINISH.equals(msg)) {
            session.close();
        } else {
            Context.onWebsocketMessage(socketKey, msg);
        }
    }

    public void close() {
        if (session != null) {
            try {
                session.close();
            } catch (IOException ignored) {
            }
        }
    }

    public void send(SocketVO vo) throws IOException {
        try {
            session.getBasicRemote().sendObject(vo);
        } catch (EncodeException e) {
            throw new IOException(e);
        }
    }

    public void sendSafely(SocketVO vo) {
        try {
            send(vo);
        } catch (IOException ignored) {
        }
    }

    public boolean isConnected() {
        return session.isOpen();
    }
}
