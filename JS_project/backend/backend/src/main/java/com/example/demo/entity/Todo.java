package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Todo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;          // 할 일 제목
    private LocalDateTime deadline; // 마감 기한
    private boolean isCompleted;   // 완료 여부
    private boolean penalized;     // 패널티 처리 여부

    @ManyToOne
    @JoinColumn(name = "user_id") // DB 테이블의 외래키 컬럼명
    private Users user;            // 이 할 일을 등록한 사용자
}