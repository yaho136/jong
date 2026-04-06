package com.example.demo.service;

import com.example.demo.entity.Todo;
import com.example.demo.entity.Users;
import com.example.demo.repository.TodoRepository;
import com.example.demo.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime; // 🌟 시간 설정을 위해 추가
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TodoService {

    private final TodoRepository todoRepository;
    private final UsersRepository usersRepository;
    private final UserService userService;

    // 1. 투두 리스트 조회
    public List<Todo> getTodoList(String email) {
        return todoRepository.findByUser_Email(email);
    }

    // 2. 투두 추가 (🌟 마감 시간 보정 로직 추가)
    @Transactional
    public void addTodo(String email, Todo todo) {
        Users user = usersRepository.findByEmail(email).orElseThrow();
        todo.setUser(user);
        todo.setCompleted(false);

        // ✅ 수정: 사용자가 날짜만 선택해 오더라도, 시간을 해당 날짜의 가장 마지막(23:59:59)으로 맞춥니다.
        // 이렇게 해야 23일 할 일을 24일 아침 9시에 체크할 수 있습니다.
        if (todo.getDeadline() != null) {
            todo.setDeadline(todo.getDeadline().with(LocalTime.MAX));
        }

        todoRepository.save(todo);
    }

    // 3. 투두 완료 처리 및 경험치 부여
    @Transactional
    public void completeTodo(Long id) {
        Todo todo = todoRepository.findById(id).orElseThrow();
        if (!todo.isCompleted()) {
            todo.setCompleted(true);
            userService.addExperience(todo.getUser(), 100);
            todoRepository.save(todo);
        }
    }

    // 4. 기한 지난 미완료 항목 처리 (🌟 매일 오전 9시에 호출됨)
    @Transactional
    public void checkExpiredTodos() {
        LocalDateTime now = LocalDateTime.now(); // 현재 시간 (오전 9시)

        // 완료되지 않은 투두만 가져오기
        List<Todo> unfinishedTodos = todoRepository.findByIsCompletedFalse();

        // ✅ 로직 설명:
        // 오전 9시 기준으로, 마감 시간(어제 밤 23:59:59)이 현재보다 이전인 항목들을 필터링합니다.
        List<Todo> expiredTodos = unfinishedTodos.stream()
                .filter(t -> t.getDeadline() != null && t.getDeadline().isBefore(now))
                .collect(Collectors.toList());

        if (expiredTodos.isEmpty()) {
            System.out.println("✅ [" + now + "] 패널티 부여할 항목 없음");
            return;
        }

        for (Todo todo : expiredTodos) {
            Users user = todo.getUser();

            // 1. 패널티 부여 (경험치 차감)
            userService.addExperience(user, -50);

            // 2. 지인들에게 "어제 완료하지 못한 퀘스트" 알림 발송
            userService.notifyFriendsOfFailure(user, todo.getTitle());

            // 3. 중복 처리 방지 (완료 상태로 변경하여 다음 날 다시 알림 가는 것 방지)
            todo.setCompleted(true);
            todoRepository.save(todo);

            System.out.println("🔔 [" + user.getNickname() + "]님의 어제자 실패 알림이 전송되었습니다.");
        }

        System.out.println("⚠️ [" + now + "] 총 " + expiredTodos.size() + "건의 실패 리포트 발송 완료");
    }

    // 5. 투두 수정
    @Transactional
    public void updateTodoTitle(Long id, String newTitle) {
        Todo todo = todoRepository.findById(id).orElseThrow();
        todo.setTitle(newTitle);
        todoRepository.save(todo);
    }
}