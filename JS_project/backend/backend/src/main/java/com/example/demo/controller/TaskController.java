package com.example.demo.controller;

import com.example.demo.entity.Task;
import com.example.demo.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/task")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;

    @PostMapping("/add")
    public String addMemo(@RequestParam String email, @RequestParam String content) {
        return taskService.addMemo(email, content);
    }

    @GetMapping("/list")
    public List<Task> getMemos(@RequestParam String email) {
        return taskService.getMemos(email);
    }

    @DeleteMapping("/{id}")
    public String deleteMemo(@PathVariable Long id) {
        taskService.deleteMemo(id);
        return "메모가 삭제되었습니다.";
    }
}