package com.example.demo.repository;

import com.example.demo.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {

    // 1. 이메일로 유저 찾기 (로그인 시 사용)
    Optional<Users> findByEmail(String email);

    // 🌟 2. 진짜 랭킹 시스템을 위한 정렬 메서드 (수정됨!)
    // Level 내림차순(Desc) -> Experience 내림차순(Desc) 순서로 정렬합니다.
    List<Users> findAllByOrderByLevelDescExperienceDesc();
}