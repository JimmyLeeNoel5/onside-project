package com.onside_app.onside;

import com.onside_app.onside.config.CorsProperties;
import com.onside_app.onside.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({JwtProperties.class, CorsProperties.class})
public class OnsideApplication {

	public static void main(String[] args) {
		SpringApplication.run(OnsideApplication.class, args);
	}

}
