package test.beifengtz.terminal.demo;

/**
 * English see <a href="https://misc.flogisoft.com/bash/tip_colors_and_formatting">https://misc.flogisoft.com/bash/tip_colors_and_formatting</a>
 * <p/>
 * Chinese see <a href="https://blog.csdn.net/RadiantJeral/article/details/105456642">https://blog.csdn.net/RadiantJeral/article/details/105456642</a>
 * Created in 10:57 2022/11/10
 *
 * @author beifengtz
 */
public class StdTest {
    public static void main(String[] args) throws Exception {
        new StdTest().testPrint();
    }

    public void testPrint() throws Exception {
        System.out.println("\u001B\rR\r");
        System.out.print("\u001B[33m\r99% [Working]\u001B[0m\r \r\rReading package lists... 0%\r\rReading package lists... 0%\r\rReading package lists... 0%\r\rReading package lists... 1%\r\rReading package lists... 2%\r\rReading package lists... 3%\r\rReading package lists... 4%\r\rReading package lists... 5%\r");
        System.out.print("\r \rHit:3 http://security.debian.org/debian-security buster/updates InRelease\r\n\u001B[33m\r \r0% [Connecting to archive.ubuntu.com (185.125.190.36)]\u001B[0m");
        System.out.print("\u001B[33m\r \r0% [Waiting for headers]\u001B[0m\r \rIgn:4 http://archive.ubuntu.com/ubuntu trusty InRelease\r\n\u001B[33m\r \r0% [Working]\u001B[0m");
        System.out.print("\u001B[33m\r0% [5 Release 19.2 kB/58.5 kB 33%]\u001B[0m");
        System.out.print("\u001B[33m\r \r0% [Working]\u001B[0m");
        System.out.print("\u001B[33m\r0% [Waiting for headers]\u001B[0m\r \rGet:5 http://archive.ubuntu.com/ubuntu trusty Release [58.5 kB]\r\n\u001B[33m\r0% [5 Release 7509 B/58.5 kB 13%]\u001B[0m");
        System.out.print("\rR\r");
        System.out.print("\rReading package lists... 7%\r");
        System.out.print("\rReading package lists... 8%\r");
        System.out.print("\rReading package lists... 9%\r");
        System.out.print("\rReading package lists... 10%\r");
        System.out.print("\rReading package lists... 11%\r");
        System.out.print("\rReading package lists... 12%\r");
        System.out.print("\rReading package lists... 13%\r");
        System.out.print("\rReading package lists... 14%\r");
        System.out.print("\rReading package lists... 15%\r");
        System.out.print("\rReading package lists... 16%\r");
        System.out.print("\rReading package lists... 17%\r");
        System.out.print("\rReading package lists... 18%\r");
        System.out.print("\rReading package lists... 19%\r");
        System.out.print("\rReading package lists... 20%\r");
        System.out.print("\rReading package lists... 21%\r");
        System.out.print("\rReading package lists... 22%\r\rReading package lists... 23%\r\rReading package lists... 24%\r\rReading package lists... 25%\r\rReading package lists... 26%\r\rReading package lists... 27%\r\rReading package lists... 28%\r\rReading package lists... 29%\r\rReading package lists... 30%\r\rReading package lists... 31%\r\rReading package lists... 32%\r\rReading package lists... 33%\r\rReading package lists... 34%\r\rReading package lists... 35%\r\rReading package lists... 36%\r\rReading package lists... Done\r\r\n");
    }
}
