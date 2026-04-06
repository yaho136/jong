package com.example.demo.repository;

import com.example.demo.entity.Character;
import com.example.demo.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CharacterRepository extends JpaRepository<Character, Long> {
    Optional<Character> findByUser(Users user);
}