package com.example.demo.service;

import com.example.demo.entity.Todo;
import com.example.demo.entity.Users;
import com.example.demo.repository.TodoRepository;
import com.example.demo.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TodoService {

    private final TodoRepository todoRepository;
    private final UsersRepository usersRepository;
    private final UserService userService;

    // 1. 리스트 조회
    public List<Todo> getTodoList(String email) {
        return todoRepository.findByUser_Email(email);
    }

    // 2. 퀘스트 추가
    @Transactional
    public void addTodo(String email, Todo todo) {
        Users user = usersRepository.findByEmail(email).orElseThrow();
        todo.setUser(user);
        todo.setCompleted(false);
        if (todo.getDeadline() != null) {
            todo.setDeadline(todo.getDeadline().with(LocalTime.MAX));
        }
        todoRepository.save(todo);
    }

    // 3. 퀘스트 완료
    @Transactional
    public void completeTodo(Long id) {
        Todo todo = todoRepository.findById(id).orElseThrow();
        if (!todo.isCompleted()) {
            todo.setCompleted(true);
            userService.addExperience(todo.getUser(), 100);
            todoRepository.save(todo);
        }
    }

    // 🌟 4. [복구됨] 기한 지난 미완료 항목 처리 (스케줄러용)
    @Transactional
    public void checkExpiredTodos() {
        LocalDateTime now = LocalDateTime.now();
        List<Todo> unfinishedTodos = todoRepository.findByIsCompletedFalse();

        List<Todo> expiredTodos = unfinishedTodos.stream()
                .filter(t -> t.getDeadline() != null && t.getDeadline().isBefore(now))
                .collect(Collectors.toList());

        if (expiredTodos.isEmpty()) return;

        for (Todo todo : expiredTodos) {
            Users user = todo.getUser();
            userService.addExperience(user, -50); // 패널티
            userService.notifyFriendsOfFailure(user, todo.getTitle()); // 고자질 알림
            todo.setCompleted(true);
            todo.setPenalized(true); // 🌟 통계에서 '실패'로 잡기 위해 true 설정
            todoRepository.save(todo);
        }
    }

    // 🌟 5. [신규] 주간 통계 데이터 계산 (차트용)
    public List<Map<String, Object>> getWeeklyStats(String email) {
        LocalDateTime start = LocalDateTime.now().minusDays(6).with(LocalTime.MIN);
        LocalDateTime end = LocalDateTime.now().with(LocalTime.MAX);

        List<Todo> weeklyTodos = todoRepository.findByUser_EmailAndDeadlineBetween(email, start, end);
        List<Map<String, Object>> stats = new ArrayList<>();

        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            long success = weeklyTodos.stream()
                    .filter(t -> t.getDeadline().toLocalDate().equals(date) && t.isCompleted() && !t.isPenalized())
                    .count();
            long fail = weeklyTodos.stream()
                    .filter(t -> t.getDeadline().toLocalDate().equals(date) && t.isPenalized())
                    .count();

            Map<String, Object> dayData = new HashMap<>();
            dayData.put("name", date.getMonthValue() + "/" + date.getDayOfMonth());
            dayData.put("성공", success);
            dayData.put("실패", fail);
            stats.add(dayData);
        }
        return stats;
    }

    @Transactional
    public void updateTodoTitle(Long id, String newTitle) {
        Todo todo = todoRepository.findById(id).orElseThrow();
        todo.setTitle(newTitle);
        todoRepository.save(todo);
    }
}