package test.beifengtz.terminal.demo.io;


import test.beifengtz.terminal.demo.entity.vo.SocketVO;
import test.beifengtz.terminal.demo.websocket.WebsocketHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;

/**
 * Description: TODO
 * <p>
 * Created in 10:43 2022/11/15
 *
 * @author beifengtz
 */
public class BridgeOutputStream extends OutputStream {

    private final byte[] buf;
    private int count;
    private final Charset charset;
    private final Set<WebsocketHandler> listeners = new HashSet<>();

    public BridgeOutputStream(int size) {
        this(StandardCharsets.UTF_8, size);
    }

    public BridgeOutputStream(Charset charset, int size) {
        buf = new byte[size];
        this.charset = charset;
    }

    public BridgeOutputStream registerListener(WebsocketHandler websocket) {
        listeners.add(websocket);
        return this;
    }

    @Override
    public synchronized void write(int b) throws IOException {
        if (count >= buf.length) {
            flush();
        }
        buf[count++] = (byte) b;
    }

    @Override
    public synchronized void write(byte b[], int off, int len) throws IOException {
        if (len >= buf.length) {
            flush();
            return;
        }
        if (len > buf.length - count) {
            flush();
        }
        System.arraycopy(b, off, buf, count, len);
        count += len;
    }

    @Override
    public synchronized void flush() throws IOException {
        if (count > 0) {
            String content = new String(buf, 0, count, charset);
            for (WebsocketHandler ws : listeners) {
                ws.send(SocketVO.sshResponse(content));
            }
            count = 0;
        }
    }
}
