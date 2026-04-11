package com.healtrack.hmsbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.sql.init.SqlInitializationAutoConfiguration;

@SpringBootApplication(exclude = {
    DataSourceAutoConfiguration.class,       // We provide our own DataSource in DataSourceConfig.java
    SqlInitializationAutoConfiguration.class  // Prevents SQL init errors at startup
})
public class HmsBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(HmsBackendApplication.class, args);
    }
}
