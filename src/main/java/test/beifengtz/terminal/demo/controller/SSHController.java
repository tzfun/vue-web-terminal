package test.beifengtz.terminal.demo.controller;

import com.jcraft.jsch.JSch;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import test.beifengtz.terminal.demo.Context;
import test.beifengtz.terminal.demo.entity.vo.ResultVO;

/**
 * Description: TODO
 * <p>
 * Created in 14:42 2022/11/8
 *
 * @author beifengtz
 */
@RestController
@Slf4j
public class SSHController {
    private static final JSch JSCH = new JSch();

    @GetMapping("/ssh/shell")
    public ResultVO execCommand(@RequestParam String host,
                                @RequestParam String username,
                                @RequestParam String password,
                                @RequestParam(required = false, defaultValue = "22") int port) {
        try {
            Session session = newSSHSession(host, port, username, password);
            return ResultVO.builder().data(Context.create(session)).build();
        } catch (JSchException e) {
            return ResultVO.builder().code(-1).msg(e.getMessage()).build();
        }
    }

    private Session newSSHSession(String host, int port, String username, String password) throws JSchException {
        Session session = JSCH.getSession(username, host, port);
        session.setPassword(password);
        session.setConfig("StrictHostKeyChecking", "no");
        session.connect(5000);
        log.info("Create new ssh session: {}@{}:{}", username, host, port);
        return session;
    }
}
