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

    // 1. 투두 리스트 조회
    @GetMapping("/list")
    public ResponseEntity<List<Todo>> getTodoList(@RequestParam String email) {
        return ResponseEntity.ok(todoService.getTodoList(email));
    }

    // 2. 투두 추가
    @PostMapping("/add")
    public ResponseEntity<String> addTodo(@RequestParam String email, @RequestBody Todo todo) {
        todoService.addTodo(email, todo);
        return ResponseEntity.ok("퀘스트 추가 성공!");
    }

    // 3. 투두 완료 (경험치 지급 포함)
    @PutMapping("/{id}/complete")
    public ResponseEntity<String> completeTodo(@PathVariable Long id) {
        todoService.completeTodo(id);
        return ResponseEntity.ok("퀘스트 완료!");
    }

    // 4. 투두 제목 수정
    @PutMapping("/{id}/update")
    public ResponseEntity<String> updateTitle(@PathVariable Long id, @RequestBody Map<String, String> body) {
        todoService.updateTodoTitle(id, body.get("title"));
        return ResponseEntity.ok("제목 수정 성공!");
    }
}
// 🌟 파일은 여기서 끝납니다. 이 아래에 어떤 코드도 있어서는 안 됩니다!