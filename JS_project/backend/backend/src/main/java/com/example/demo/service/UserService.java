package com.example.demo.service;

import com.example.demo.entity.Users;
import com.example.demo.entity.Friend;
import com.example.demo.repository.UsersRepository;
import com.example.demo.repository.FriendRepository;
import com.example.demo.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UsersRepository usersRepository;
    private final FriendRepository friendRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JavaMailSender mailSender;

    @Transactional
    public String join(Users user) {
        if (usersRepository.findByEmail(user.getEmail()).isPresent()) return "이미 존재하는 이메일입니다.";
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        String code = String.format("%06d", new Random().nextInt(1000000));
        user.setVerificationCode(code);
        user.setVerified(false);
        user.setExperience(0);
        user.setLevel(1);
        usersRepository.save(user);
        try { sendVerificationEmail(user.getEmail(), code); } catch (Exception e) {}
        return "회원가입 성공!";
    }

    private void sendVerificationEmail(String email, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("회원가입 인증번호");
        message.setText("인증번호: " + code);
        mailSender.send(message);
    }

    @Transactional
    public boolean verifyCode(String email, String code) {
        Users user = usersRepository.findByEmail(email).orElseThrow();
        if (user.getVerificationCode() != null && user.getVerificationCode().equals(code)) {
            user.setVerified(true);
            user.setVerificationCode(null);
            return true;
        }
        return false;
    }

    public String login(String email, String password) {
        Users user = usersRepository.findByEmail(email).orElseThrow();
        if (!user.isVerified()) return "이메일 인증 미완료";
        if (!passwordEncoder.matches(password, user.getPassword())) return "비번 불일치";
        return jwtTokenProvider.createToken(user.getEmail());
    }

    public Users getUserInfo(String email) {
        return usersRepository.findByEmail(email).orElse(null);
    }

    public List<Users> getGlobalRanking() {
        return usersRepository.findAllByOrderByLevelDescExperienceDesc().stream()
                .limit(10).collect(Collectors.toList());
    }

    @Transactional
    public void addExperience(Users user, int amount) {
        int currentXp = user.getExperience() + amount;
        int currentLevel = user.getLevel();
        if (currentXp < 0) currentXp = 0;
        while (true) {
            int requiredXp = 100 + (currentLevel - 1) * 62;
            if (currentXp >= requiredXp) {
                currentXp -= requiredXp;
                currentLevel++;
            } else { break; }
        }
        user.setExperience(currentXp);
        user.setLevel(currentLevel);
        usersRepository.save(user);
    }

    @Transactional
    public String addFriend(String email, String friendEmail, String nickname) {
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        boolean isAlreadyFriend = friendRepository.findByUser(user).stream()
                .anyMatch(f -> f.getEmail().equals(friendEmail));
        if (isAlreadyFriend) return "이미 추가된 지인입니다.";

        Friend friend = new Friend();
        friend.setUser(user);
        friend.setEmail(friendEmail);
        friend.setFriendNickname(nickname);

        friendRepository.save(friend);
        return nickname + "님이 지인으로 추가되었습니다.";
    }

    public List<Friend> getFriendList(String email) {
        Users user = usersRepository.findByEmail(email).orElseThrow();
        return friendRepository.findByUser(user);
    }

    @Transactional
    public String deleteFriend(Long id) {
        friendRepository.deleteById(id);
        return "지인 삭제 완료";
    }

    // 🌟 [추가] 지인들에게 실패 알림 메일을 발송하는 메서드
    public void notifyFriendsOfFailure(Users user, String todoTitle) {
        List<Friend> friends = friendRepository.findByUser(user);
        if (friends.isEmpty()) return;

        for (Friend friend : friends) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(friend.getEmail());
                message.setSubject("[⚠️ 퀘스트 실패 알림] " + user.getNickname() + "님이 약속을 어겼습니다!");
                message.setText(
                        friend.getFriendNickname() + "님, 안녕하세요.\n\n" +
                                "당신의 지인 [" + user.getNickname() + "]님이 등록했던 퀘스트\n" +
                                "[" + todoTitle + "]를 기한 내에 완료하지 못했습니다.\n\n" +
                                "현준님의 캐릭터 경험치가 차감되었으니, 따끔한 응원 한마디 부탁드립니다! 🔥"
                );
                mailSender.send(message);
                System.out.println("지인 [" + friend.getFriendNickname() + "]에게 알림 메일 발송 완료");
            } catch (Exception e) {
                System.err.println("메일 발송 실패: " + e.getMessage());
            }
        }
    }
}