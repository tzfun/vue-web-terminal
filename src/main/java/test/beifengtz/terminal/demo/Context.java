package test.beifengtz.terminal.demo;

import com.jcraft.jsch.ChannelShell;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;
import lombok.extern.slf4j.Slf4j;
import test.beifengtz.terminal.demo.entity.vo.SocketVO;
import test.beifengtz.terminal.demo.io.BridgeOutputStream;
import test.beifengtz.terminal.demo.websocket.WebsocketHandler;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Description: TODO
 * <p>
 * Created in 14:35 2022/11/8
 *
 * @author beifengtz
 */
@Slf4j
public class Context {
    private static final Map<String, Context> CONTEXT_POOL = new ConcurrentHashMap<>(2);

    private final AtomicReference<WebsocketHandler> websocket = new AtomicReference<>(null);
    private final AtomicReference<Session> sshSession = new AtomicReference<>(null);
    private final AtomicReference<ChannelShell> channel = new AtomicReference<>(null);
    private final long createTime;
    private InputStream in;
    private OutputStream out;

    static {
        Executors.newSingleThreadScheduledExecutor().scheduleWithFixedDelay(() -> {
            Iterator<Entry<String, Context>> it = CONTEXT_POOL.entrySet().iterator();
            long now = System.currentTimeMillis();
            while (it.hasNext()) {
                Entry<String, Context> entry = it.next();
                Context ctx = entry.getValue();
                if (ctx.sshSession.get() != null && ctx.websocket.get() != null
                        && ctx.websocket.get().isConnected() && !ctx.sshSession.get().isConnected()) {
                    ctx.websocket.get().sendSafely(SocketVO.sshExist());
                    ctx.websocket.get().close();
                    log.info("SSH session closed by demon check: '{}'", entry.getKey());
                    it.remove();
                }
                if (ctx.websocket.get() == null && now - ctx.createTime > TimeUnit.MINUTES.toMillis(1)) {
                    log.info("Context removed by idle timeout: '{}'", entry.getKey());
                    it.remove();
                }
            }
        }, 5, 1, TimeUnit.SECONDS);
    }

    Context(Session sshSession) {
        createTime = System.currentTimeMillis();
        this.sshSession.set(sshSession);
    }

    public static String create(Session sshSession) {
        Context ctx = new Context(sshSession);
        String key = UUID.randomUUID().toString();
        CONTEXT_POOL.put(key, ctx);
        return key;
    }

    public static boolean tryConnectWebsocket(String key, WebsocketHandler websocket) throws IOException {
        Context context = CONTEXT_POOL.get(key);
        boolean pass = context != null && context.websocket.get() == null;
        if (pass) {
            context.websocket.set(websocket);
            context.connectShell(websocket);
        }
        return pass;
    }

    private void connectShell(WebsocketHandler ws) throws IOException {
        try {
            ChannelShell ch = (ChannelShell) sshSession.get().openChannel("shell");
            channel.set(ch);
            ch.setPty(true);
            ch.setPtyType("xterm-256color");
            ch.connect();

            in = ch.getInputStream();
            BridgeOutputStream bridgeOs = new BridgeOutputStream(2048).registerListener(ws);
            ch.setOutputStream(bridgeOs);

            out = ch.getOutputStream();

            new Thread(() -> {
                byte[] tmp = new byte[1024];
                try {
                    while (channel.get() != null && websocket.get() != null) {
                        while (in.available() > 0 && websocket.get() != null) {
                            int i = in.read(tmp, 0, 1024);
                            if (i < 0) break;
                            websocket.get().send(SocketVO.sshResponse(new String(tmp, 0, i, StandardCharsets.UTF_8)));
                        }
                        if (channel.get() == null || websocket.get() == null) {
                            break;
                        }
                        if (channel.get().isClosed()) {
                            if (in.available() > 0) continue;
                            websocket.get().send(SocketVO.sshFinish(channel.get().getExitStatus()));
                            break;
                        }
                        try {
                            Thread.sleep(100);
                        } catch (Exception ignored) {
                        }
                    }
                } catch (IOException e) {
                    if (websocket.get() != null) {
                        websocket.get().sendSafely(SocketVO.sshError(e.getMessage()));
                    }
                }

                if (channel.get() != null) {
                    channel.get().disconnect();
                    channel.set(null);
                }
            }).start();

        } catch (JSchException | IOException e) {
            if (channel.get() != null) {
                channel.get().disconnect();
            }
            websocket.get().send(SocketVO.sshError(e.getMessage()));
        }
    }

    public void setPtySize(int col, int row, int wp, int hp) {
        if (channel.get() != null) {
            channel.get().setPtySize(col, row, wp, hp);
        }
    }

    public static void release(String key) {
        Context context = CONTEXT_POOL.remove(key);
        if (context != null) {
            context.websocket.set(null);
            if (context.channel.get() != null) {
                context.channel.get().disconnect();
                context.channel.set(null);
            }
            context.sshSession.get().disconnect();
            context.sshSession.set(null);
        }
        log.info("SSH session closed by websocket close: '{}'", key);
    }

    @SuppressWarnings("unchecked")
    public static void onWebsocketMessage(String socketKey, SocketVO msg) throws IOException {
        Context context = CONTEXT_POOL.get(socketKey);
        if (context != null) {
            if (msg.getType() == 5) {
                List<Integer> arg = (List<Integer>) msg.getContent();
                context.setPtySize(arg.get(0), arg.get(1), arg.get(2), arg.get(3));
            } else {
                String command = msg.getContent().toString();
                if (command.startsWith("ascii:")) {
                    try {
                        String[] ascii = command.substring(6).split(",");
                        for (String s : ascii) {
                            context.out.write(Integer.parseInt(s));
                        }
                        context.out.flush();
                    } catch (Exception e) {
                        context.websocket.get().send(SocketVO.sshError(e.getMessage()));
                    }
                } else {
                    context.out.write(command.getBytes(StandardCharsets.UTF_8));
                    context.out.flush();
                }
            }
        }
    }
}
