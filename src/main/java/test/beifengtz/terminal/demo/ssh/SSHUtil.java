package test.beifengtz.terminal.demo.ssh;

import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;
import lombok.extern.slf4j.Slf4j;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

/**
 * Description: TODO
 *
 * Created in 17:58 2022/11/7
 *
 * @author beifengtz
 */
@Slf4j
public class SSHUtil {

    private static final JSch JSCH = new JSch();

    public static Session getSession(String host, String username, String password) throws JSchException {
        return getSession(host, 22, username, password);
    }

    public static Session getSession(String host, int port, String username, String password) throws JSchException {
        Session session = JSCH.getSession(username, host, port);
        session.setPassword(password);
        session.setConfig("StrictHostKeyChecking", "no");
        session.connect(5000);
        log.info("Create new ssh session: {}@{}:{}", username, host, port);
        return session;
    }

    public static void main(String[] args) throws Exception {
        Session session = null;
        ChannelExec channel = null;

        try {
            session = getSession("192.168.0.148", 22, "beifengtz", "1246886075");

            channel = (ChannelExec) session.openChannel("exec");
            channel.setCommand("ls");
            ByteArrayOutputStream responseStream = new ByteArrayOutputStream();
            channel.setOutputStream(responseStream);
            channel.connect();

            while (channel.isConnected()) {
                Thread.sleep(100);
            }

            String responseString = responseStream.toString(StandardCharsets.UTF_8);
            System.out.println(responseString);
        } finally {
            if (session != null) {
                session.disconnect();
            }
            if (channel != null) {
                channel.disconnect();
            }
        }
    }
}
