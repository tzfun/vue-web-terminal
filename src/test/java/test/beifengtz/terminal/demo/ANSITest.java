package test.beifengtz.terminal.demo;

/**
 * Description: TODO
 * <p>
 * Created in 9:53 2022/11/16
 *
 * @author beifengtz
 */
public class ANSITest {
    public static void main(String[] args) {
        System.out.print("\u001b[0m\u001b[01;34mansible\u001b[0m  \u001b[01;34m'creates=.'\u001b[0m\r\n");
        System.out.print("\u001b[1B\n");
        System.out.print("\u001b[15Casd\n");

        //  2 up
        System.out.print("\u001b[?25l\u001b[1;29r\u001b[m\u001b[38;5;231m\u001b[48;5;236m\u001b[1;1H\u001b[L\u001b[1;30r\u001b[1;1H\u001b[38;5;226m  1 \u001b[?25h");
        //  29 down
        System.out.print("\u001b[?25l\u001b[1;29r\u001b[29;1H\r\n\u001b[1;30r\u001b[29;1H\u001b[38;5;226m 30 \u001b[?25h");
        System.out.print("\u001b[0m\n");
        System.out.print("Applications\t\tPersonal\t\t\tSunlogin Files\t\t\tjava_error_in_idea.hprof\n" +
                "Desktop\t\t\t\tPictures\t\t\tWeChatProjects\t\t\tjava_error_in_idea_24772.log\n" +
                "Documents\t\t\tPostman\t\t\t\tapp\t\t\t\tjbr_err_pid24772.log\n" +
                "Downloads\t\t\tProgram\t\t\t\tdata\t\t\t\tlogs\n" +
                "Library\t\t\t\tPublic\t\t\t\tdump.rdb\t\t\tsensors\n" +
                "Movies\t\t\t\tServerDump\t\t\tenv\t\t\t\tservers\n" +
                "Music\t\t\t\tSoftware Package\t\tgo\n");
    }
}
