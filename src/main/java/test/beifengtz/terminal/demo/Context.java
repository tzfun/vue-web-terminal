package test.beifengtz.terminal.demo;

import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;
import lombok.extern.slf4j.Slf4j;
import test.beifengtz.terminal.demo.entity.vo.SocketVO;
import test.beifengtz.terminal.demo.ssh.SSHSignal;
import test.beifengtz.terminal.demo.websocket.WebsocketHandler;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Description: TODO
 *
 * Created in 14:35 2022/11/8
 *
 * @author beifengtz
 */
@Slf4j
public class Context {
    private static final Map<String, Context> CONTEXT_POOL = new ConcurrentHashMap<>(2);

    private final AtomicReference<WebsocketHandler> websocket = new AtomicReference<>(null);
    private final AtomicReference<Session> sshSession = new AtomicReference<>(null);
    private final AtomicBoolean executing = new AtomicBoolean(false);
    private final AtomicReference<ChannelExec> channel = new AtomicReference<>(null);
    private InputStream in;
    private OutputStream out;
    private InputStream err;

    static {
        Executors.newSingleThreadScheduledExecutor().scheduleWithFixedDelay(() -> {
            Iterator<Entry<String, Context>> it = CONTEXT_POOL.entrySet().iterator();
            while (it.hasNext()) {
                Entry<String, Context> entry = it.next();
                Context ctx = entry.getValue();
                if (ctx.sshSession.get() != null && ctx.websocket.get() != null
                        && ctx.websocket.get().isConnected() && !ctx.sshSession.get().isConnected()) {
                    ctx.websocket.get().send(SocketVO.sshExist());
                    ctx.websocket.get().close();
                    log.info("SSH session closed by demon check: '{}'", entry.getKey());
                    it.remove();
                }
            }
        }, 5, 1, TimeUnit.SECONDS);
    }

    Context(Session sshSession) {
        this.sshSession.set(sshSession);
    }

    public static String create(Session sshSession) {
        Context ctx = new Context(sshSession);
        String key = UUID.randomUUID().toString();
        CONTEXT_POOL.put(key, ctx);
        return key;
    }

    public static boolean tryConnectWebsocket(String key, WebsocketHandler websocket) {
        Context context = CONTEXT_POOL.get(key);
        boolean pass = context != null && context.websocket.get() == null;
        if (pass) {
            context.websocket.set(websocket);
        }
        return pass;
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

    public static void onWebsocketMessage(String socketKey, SocketVO msg) throws IOException {
        Context context = CONTEXT_POOL.get(socketKey);
        if (context != null) {
            String command = msg.getContent().toString();
            if (context.executing.get()) {
                if (command.startsWith("signal:")) {
                    try {
                        context.channel.get().sendSignal(SSHSignal.valueOf(command.substring(7)).toString());
                    } catch (Exception e) {
                        context.websocket.get().send(SocketVO.sshError(e.getMessage()));
                    }
                } else {
                    context.out.write(command.getBytes(StandardCharsets.UTF_8));
                    context.out.flush();
                }
            } else {
                context.exec(command);
            }
        }
    }

    public void exec(String cmd) {
        executing.set(true);
        try {
            ChannelExec ch = (ChannelExec) sshSession.get().openChannel("exec");
            channel.set(ch);
            ch.setInputStream(new ByteArrayInputStream(new byte[1024]));
            ch.setOutputStream(new ByteArrayOutputStream());
            ch.setErrStream(new ByteArrayOutputStream(), true);
            ch.setCommand(cmd);
            ch.connect();

            in = ch.getInputStream();
            out = ch.getOutputStream();
            err = ch.getErrStream();
        } catch (JSchException | IOException e) {
            if (channel.get() != null) {
                channel.get().disconnect();
            }
            websocket.get().send(SocketVO.sshError(e.getMessage()));
            executing.set(false);
            return;
        }

        new Thread(() -> {
            byte[] tmp = new byte[1024];
            try {
                while (channel.get() != null && websocket.get() != null) {
                    while (err.available() > 0 && websocket.get() != null) {
                        int i = err.read(tmp, 0, 1024);
                        if (i < 0) break;
                        websocket.get().send(SocketVO.sshError(new String(tmp, 0, i, StandardCharsets.UTF_8)));
                    }
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
                    websocket.get().send(SocketVO.sshError(e.getMessage()));
                }
            }

            if (channel.get() != null) {
                channel.get().disconnect();
                channel.set(null);
            }
            executing.set(false);
        }).start();
    }
}
