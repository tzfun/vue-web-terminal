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
        System.out.print("\u0000\u0000\u0000\u0000\u0000");
        System.out.println("\347\273\251\346\225\210\350\200\203\346\240\270");
        System.out.println("\344\270\213\350\275\275");
    }
}
