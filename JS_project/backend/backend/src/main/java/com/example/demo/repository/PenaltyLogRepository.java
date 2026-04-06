package com.example.demo.repository;

import com.example.demo.entity.PenaltyLog;
import com.example.demo.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PenaltyLogRepository extends JpaRepository<PenaltyLog, Long> {
    List<PenaltyLog> findByUser(Users user);
}