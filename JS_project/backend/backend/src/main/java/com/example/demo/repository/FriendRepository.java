package com.example.demo.repository;

import com.example.demo.entity.Friend;
import com.example.demo.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FriendRepository extends JpaRepository<Friend, Long> {
    List<Friend> findByUser(Users user);
}