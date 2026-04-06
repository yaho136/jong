package com.example.demo.service;

import com.example.demo.entity.Todo;
import com.example.demo.entity.Users;
import com.example.demo.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TodoScheduler {

    private final TodoRepository todoRepository;
    private final UserService userService;

    /**
     * [스케줄러 설정]
     * cron = "0 * * * * *" : 매 1분마다 실행 (테스트용으로 적합)
     * cron = "0 0 0 * * *" : 매일 자정에 실행 (실제 서비스용)
     */
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void handleUnfinishedTodos() {
        LocalDateTime now = LocalDateTime.now();

        // 1. 아직 완료되지 않은 모든 할 일(Todo)을 가져옵니다.
        // 🌟 TodoRepository에 findByIsCompletedFalse()가 선언되어 있어야 합니다.
        List<Todo> expiredTodos = todoRepository.findByIsCompletedFalse();

        int penaltyCount = 0;

        for (Todo todo : expiredTodos) {
            // 2. 마감기한(Deadline)이 존재하고, 현재 시간보다 과거인지(기한이 지났는지) 확인
            if (todo.getDeadline() != null && todo.getDeadline().isBefore(now)) {
                Users user = todo.getUser();

                if (user != null) {
                    // 로그 출력 (콘솔에서 확인 가능)
                    System.out.println("⏰ [패널티 발생] 유저: " + user.getNickname() +
                            " / 퀘스트: " + todo.getTitle() + " / 기한 초과!");

                    // 🌟 [핵심 수정] 기존 에러 났던 메서드 대신 UserService의 addExperience를 호출
                    // 패널티로 경험치 -50을 부여합니다.
                    userService.addExperience(user, -50);

                    // 3. 패널티 중복 방지를 위한 처리
                    // 패널티를 이미 받았으므로 해당 퀘스트를 강제로 완료 처리하거나
                    // 별도의 플래그(isPenalized 등)가 있다면 그것을 true로 바꿉니다.
                    todo.setCompleted(true);
                    todoRepository.save(todo);

                    penaltyCount++;
                }
            }
        }

        if (penaltyCount > 0) {
            System.out.println("✅ 총 " + penaltyCount + "건의 기한 초과 퀘스트에 패널티를 부여했습니다.");
        }
    }
}