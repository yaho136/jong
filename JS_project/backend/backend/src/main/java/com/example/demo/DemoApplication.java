package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling; // 🌟 스케줄러를 위해 필수!

@SpringBootApplication
@EnableScheduling // 🌟 이 어노테이션이 있어야 자정에 패널티가 작동합니다.
public class DemoApplication {

	public static void main(String[] args) {
		// 기존 코드의 괄호 에러를 수정한 부분입니다.
		SpringApplication.run(DemoApplication.class, args);
	}

}