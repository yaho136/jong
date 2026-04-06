package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String nickname;

    // 🌟 레벨 필드 추가 (기본값 1레벨)
    @Column(nullable = false)
    private int level = 1;

    // 🌟 경험치 필드 (이미 잘 있으시네요!)
    @Column(nullable = false)
    private int experience = 0;

    private String verificationCode;

    // 변수명과 DB 컬럼명을 명확히 일치시킵니다.
    @Column(name = "is_verified", nullable = false)
    private boolean isVerified = false;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Friend> friends = new ArrayList<>();
}