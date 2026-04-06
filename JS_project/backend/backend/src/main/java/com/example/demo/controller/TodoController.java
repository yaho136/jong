package com.example.demo.controller;

import com.example.demo.entity.Todo;
import com.example.demo.service.TodoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/todo")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5174")
public class TodoController {

    private final TodoService todoService;

    @GetMapping("/list")
    public ResponseEntity<List<Todo>> getTodoList(@RequestParam String email) {
        return ResponseEntity.ok(todoService.getTodoList(email));
    }

    @PostMapping("/add")
    public ResponseEntity<String> addTodo(@RequestParam String email, @RequestBody Todo todo) {
        todoService.addTodo(email, todo);
        return ResponseEntity.ok("퀘스트 추가 성공!");
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<String> completeTodo(@PathVariable Long id) {
        todoService.completeTodo(id);
        return ResponseEntity.ok("퀘스트 완료!");
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<String> updateTitle(@PathVariable Long id, @RequestBody Map<String, String> body) {
        todoService.updateTodoTitle(id, body.get("title"));
        return ResponseEntity.ok("제목 수정 성공!");
    }

    @GetMapping("/stats/weekly")
    public ResponseEntity<List<Map<String, Object>>> getWeeklyStats(@RequestParam String email) {
        return ResponseEntity.ok(todoService.getWeeklyStats(email));
    }
}