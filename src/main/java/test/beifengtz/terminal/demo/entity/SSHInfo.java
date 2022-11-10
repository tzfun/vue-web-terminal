package test.beifengtz.terminal.demo.entity;

import com.jcraft.jsch.UIKeyboardInteractive;
import com.jcraft.jsch.UserInfo;

/**
 * Description: TODO
 *
 * Created in 9:33 2022/11/10
 *
 * @author beifengtz
 */
public abstract class SSHInfo implements UserInfo, UIKeyboardInteractive {
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
