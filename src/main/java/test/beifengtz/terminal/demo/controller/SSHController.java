package test.beifengtz.terminal.demo.controller;

import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import test.beifengtz.terminal.demo.Context;
import test.beifengtz.terminal.demo.entity.vo.ResultVO;
import test.beifengtz.terminal.demo.ssh.SSHUtil;

/**
 * Description: TODO
 *
 * Created in 14:42 2022/11/8
 *
 * @author beifengtz
 */
@RestController
public class SSHController {
    @GetMapping("/ssh/account_login")
    public ResultVO loginByAccount(@RequestParam String host,
                                   @RequestParam String username,
                                   @RequestParam String password,
                                   @RequestParam(required = false, defaultValue = "22") int port) {
        try {
            Session session = SSHUtil.getSession(host, port, username, password);
            return ResultVO.builder().data(Context.create(session)).build();
        } catch (JSchException e) {
            return ResultVO.builder().code(-1).msg(e.getMessage()).build();
        }
    }
}
