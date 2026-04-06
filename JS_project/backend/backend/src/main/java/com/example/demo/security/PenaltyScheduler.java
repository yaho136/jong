package com.example.demo.security;

import com.example.demo.service.TodoService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PenaltyScheduler {

    private final TodoService todoService;

    @Scheduled(cron = "0 0 9 * * *")
    public void autoCheckPenalty() {
        System.out.println("--- [시스템] 오전 9시 정기 패널티 체크 및 지인 알림 시작 ---");

        todoService.checkExpiredTodos();
    }
}