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

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void handleUnfinishedTodos() {
        LocalDateTime now = LocalDateTime.now();

        List<Todo> expiredTodos = todoRepository.findByIsCompletedFalse();

        int penaltyCount = 0;

        for (Todo todo : expiredTodos) {

            if (todo.getDeadline() != null && todo.getDeadline().isBefore(now)) {
                Users user = todo.getUser();

                if (user != null) {
                    System.out.println("⏰ [패널티 발생] 유저: " + user.getNickname() +
                            " / 퀘스트: " + todo.getTitle() + " / 기한 초과!");


                    userService.addExperience(user, -50);

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