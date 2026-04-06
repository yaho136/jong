package com.example.demo.repository;

import com.example.demo.entity.Todo;
import com.example.demo.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {

    List<Todo> findByUser_Email(String email);

    List<Todo> findByUser(Users user);

    List<Todo> findByIsCompletedFalse();

    List<Todo> findByDeadlineBeforeAndIsCompletedFalse(LocalDateTime now);

    List<Todo> findByUser_EmailAndDeadlineBetween(String email, LocalDateTime start, LocalDateTime end);
}