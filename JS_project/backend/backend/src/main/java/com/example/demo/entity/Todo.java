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

    private String title;
    private LocalDateTime deadline;
    private boolean isCompleted;
    private boolean penalized;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;
}