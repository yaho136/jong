package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore; // 🌟 이 임포트가 반드시 필요합니다!
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
public class Friend {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email; // 지인의 이메일 주소

    // 🌟 추가: 내가 지정한 지인의 이름
    private String friendNickname;

    // 🔥 [해결] @JsonIgnore를 추가하여 JSON 변환 시 무한 루프를 방지합니다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore // 🌟 이 필드는 JSON 결과에 포함하지 않음으로써 순환 참조를 끊습니다.
    private Users user;
}