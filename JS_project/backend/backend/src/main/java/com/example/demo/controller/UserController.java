package com.example.demo.controller;

import com.example.demo.entity.Users;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map; // 🌟 Map 사용을 위해 추가

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
// 🌟 리액트 포트(5173) 허용 확인 완료
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class UserController {

    private final UserService userService;

    // 1. 회원가입 (기존과 동일)
    @PostMapping("/join")
    public String join(@RequestBody Users user) {
        return userService.join(user);
    }

    // 2. 로그인 (🌟 @RequestBody Map으로 수정 - 400 에러 해결 핵심)
    @PostMapping("/login")
    public String login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        System.out.println("로그인 시도 이메일: " + email); // 로그 확인용
        return userService.login(email, password);
    }

    // 3. 이메일 인증 확인 (🌟 @RequestBody Map으로 수정)
    @PostMapping("/verify")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> verifyData) {
        String email = verifyData.get("email");
        String code = verifyData.get("code");

        boolean isVerified = userService.verifyCode(email, code);
        return isVerified ? ResponseEntity.ok("인증 성공") : ResponseEntity.badRequest().body("인증번호 불일치");
    }

    // 4. 내 정보 조회 (GET 방식은 @RequestParam 유지)
    @GetMapping("/info")
    public ResponseEntity<Users> getUserInfo(@RequestParam String email) {
        Users user = userService.getUserInfo(email);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    // 5. 명예의 전당 (랭킹) 조회
    @GetMapping("/ranking")
    public ResponseEntity<List<Users>> getRanking() {
        return ResponseEntity.ok(userService.getGlobalRanking());
    }

    // 6. 지인 추가 (🌟 @RequestBody Map으로 수정)
    @PostMapping("/friend/add")
    public ResponseEntity<?> addFriend(@RequestBody Map<String, String> friendData) {
        try {
            String email = friendData.get("email");
            String friendEmail = friendData.get("friendEmail");
            String nickname = friendData.get("nickname");

            String result = userService.addFriend(email, friendEmail, nickname);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 7. 지인 목록 조회 (GET 방식은 @RequestParam 유지)
    @GetMapping("/friend/list")
    public ResponseEntity<?> getFriendList(@RequestParam String email) {
        try {
            return ResponseEntity.ok(userService.getFriendList(email));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("목록 조회 실패");
        }
    }

    // 8. 지인 삭제 (기존과 동일)
    @DeleteMapping("/friend/{id}")
    public ResponseEntity<?> deleteFriend(@PathVariable Long id) {
        return ResponseEntity.ok(userService.deleteFriend(id));
    }
}