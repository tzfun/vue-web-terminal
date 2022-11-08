package test.beifengtz.terminal.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;

@SpringBootApplication
@ServletComponentScan
public class VueWebTerminalDemoServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(VueWebTerminalDemoServerApplication.class, args);
	}

}
