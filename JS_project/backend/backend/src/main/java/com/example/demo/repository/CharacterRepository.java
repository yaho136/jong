package com.example.demo.repository;

import com.example.demo.entity.Character;
import com.example.demo.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CharacterRepository extends JpaRepository<Character, Long> {
    // 유저 객체를 이용해 캐릭터 정보를 찾는 메서드 (반드시 필요!)
    Optional<Character> findByUser(Users user);
}