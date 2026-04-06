package com.example.demo.service;

import com.example.demo.entity.Task;
import com.example.demo.entity.Users;
import com.example.demo.repository.TaskRepository;
import com.example.demo.repository.UsersRepository; // 👈 1. UserRepository 대신 UsersRepository!
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final UsersRepository usersRepository; // 👈 2. 여기도 s가 붙은 이름으로 변경

    // 메모 추가 (패널티 없음)
    public String addMemo(String email, String content) {
        // 3. usersRepository를 사용하여 유저를 찾습니다.
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        Task task = new Task();
        task.setContent(content);
        task.setUser(user);
        taskRepository.save(task);
        return "메모가 저장되었습니다.";
    }

    // 메모 목록 조회
    public List<Task> getMemos(String email) {
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        return taskRepository.findByUser(user);
    }

    // 메모 삭제
    public void deleteMemo(Long id) {
        taskRepository.deleteById(id);
    }
}