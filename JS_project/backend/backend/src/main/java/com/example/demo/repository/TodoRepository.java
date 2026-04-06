package com.example.demo.repository;

import com.example.demo.entity.Todo;
import com.example.demo.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {

    // 1. 이메일로 사용자의 투두 리스트 조회
    List<Todo> findByUser_Email(String email);

    // 2. 유저 객체로 투두 리스트 조회
    List<Todo> findByUser(Users user);

    // 3. 완료되지 않은 항목 조회 ✅ 수정됨
    List<Todo> findByIsCompletedFalse();

    // 4. 기한이 지났고 미완료된 항목 조회 ✅ 수정됨
    List<Todo> findByDeadlineBeforeAndIsCompletedFalse(LocalDateTime now);

    // 5. 주간 그래프
    List<Todo> findByUser_EmailAndDeadlineBetween(String email, LocalDateTime start, LocalDateTime end);
}