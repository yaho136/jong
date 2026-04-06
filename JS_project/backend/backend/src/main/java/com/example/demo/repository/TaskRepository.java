package com.example.demo.repository;

import com.example.demo.entity.Task;
import com.example.demo.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUser(Users user);
}