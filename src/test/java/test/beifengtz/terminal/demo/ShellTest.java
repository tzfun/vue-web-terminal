package test.beifengtz.terminal.demo;

import com.jcraft.jsch.Channel;
import com.jcraft.jsch.ChannelShell;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import com.jcraft.jsch.UIKeyboardInteractive;
import com.jcraft.jsch.UserInfo;
import org.junit.jupiter.api.Test;

import javax.swing.*;
import java.io.FilterInputStream;
import java.io.IOException;

/**
 * Description: TODO
 *
 * Created in 9:36 2022/11/8
 *
 * @author beifengtz
 */
public class ShellTest {
    public static void main(String[] args) {

        try {
            JSch jsch = new JSch();

            //jsch.setKnownHosts("/home/foo/.ssh/known_hosts");

            Session session = jsch.getSession("beifengtz", "192.168.0.148", 22);

            String passwd = JOptionPane.showInputDialog("Enter password");
            session.setPassword(passwd);

            session.setUserInfo(new MyUserInfo() {});

            // It must not be recommended, but if you want to skip host-key check,
            // invoke following,
            session.setConfig("StrictHostKeyChecking", "no");

            session.connect(30000);   // making a connection with timeout.

            Channel channel = session.openChannel("direct-tcpip");

            // Enable agent-forwarding.
//            ((ChannelShell) channel).setAgentForwarding(true);

            channel.setInputStream(System.in);

            channel.setOutputStream(System.out);

            //channel.connect();
            channel.connect(3 * 1000);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static abstract class MyUserInfo
            implements UserInfo, UIKeyboardInteractive {
        public String getPassword() {
            return null;
        }

        public boolean promptYesNo(String str) {
            return true;
        }

        public String getPassphrase() {
            return null;
        }

        public boolean promptPassphrase(String message) {
            return false;
        }

        public boolean promptPassword(String message) {
            return false;
        }

        public void showMessage(String message) {
        }

        public String[] promptKeyboardInteractive(String destination,
                                                  String name,
                                                  String instruction,
                                                  String[] prompt,
                                                  boolean[] echo) {
            return null;
        }
    }
}
