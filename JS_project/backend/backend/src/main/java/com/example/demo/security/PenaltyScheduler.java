package com.example.demo.security;

import com.example.demo.service.TodoService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PenaltyScheduler {

    private final TodoService todoService;

    /**
     * ✅ 수정: 매일 아침 9시에 실행 (초 분 시 일 월 요일)
     * 어제까지 끝내야 했던 미완료 투두들을 일괄 체크해서 지인에게 알림을 보냅니다.
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void autoCheckPenalty() {
        System.out.println("--- [시스템] 오전 9시 정기 패널티 체크 및 지인 알림 시작 ---");

        // TodoService에서 기한 만료 체크 및 지인 알림까지 처리
        todoService.checkExpiredTodos();
    }
}