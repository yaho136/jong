컴퓨터공학종합설계

이미피케이션 기반의 미루기 방지 관리 서비스 - 최종 보고서

2019212973 정현준



1. 실험의 목적과 범위
   1.1 목적
   사회적 책임감을 통한 실행력 강화: 단순히 개인적인 약속을 넘어, 약속 불이행 시 지인에게 실패 사실이 통보되는 '사회적 압박(Social Pressure)' 기법을 도입하여 할 일 완수율을 극대화합니다.

성취의 시각화 및 게임화(Gamification): 할 일 완수 시 경험치 획득 및 레벨업 시스템을 통해 사용자에게 RPG 게임과 같은 성취감을 제공합니다.

부정적 패널티의 활용: 보상에만 집중하는 기존 앱들과 달리, '고자질 메일'이라는 강력한 패널티를 통해 마감 기한 엄수에 대한 강제성을 부여합니다.

1.2 범위
포함 내용: 사용자 인증(JWT), 퀘스트 CRUD, 지인(감시자) 관리 시스템, 스케줄러 기반 자동 패널티 산출, 구글 SMTP 연동 메일 발송, 주간 통계 시각화 및 실시간 랭킹.

불포함 내용: 모바일 앱(네이티브) 버전, 실시간 채팅 기능, 소셜 미디어(OAuth 2.0) 연동 로그인.



2. 분석 (기능 목록 및 유스케이스)
   2.1 주요 기능 목록
   회원 관리: 회원가입, 로그인(JWT), 비밀번호 암호화(BCrypt).

퀘스트 관리: 날짜별 할 일 등록, 수정, 완료 처리 및 달력 시각화.

감시자 시스템: 실패 알림을 받을 지인의 이메일 및 닉네임 등록/관리.

자동화 엔진: 매일 오전 09:00 미완료 퀘스트 검증 및 경험치 차감, 고자질 메일 발송.

데이터 시각화: 최근 7일간의 성공/실패 데이터를 차트로 출력.

유스케이스명,액터,설명
퀘스트 수락,사용자,특정 날짜에 수행할 목표를 등록하고 달력에 표시함.
지인 소환,사용자,본인의 실패를 감시할 지인의 정보를 등록함.
패널티 수행,시스템,기한 만료 시 자동으로 경험치를 깎고 지인에게 메일을 보냄.
명예의 전당,사용자,전체 사용자 중 본인의 레벨 순위를 실시간으로 확인함.



3. 설계 (구조 및 알고리즘)
   3.1 클래스 다이어그램 (Class Diagram)
   User: 사용자 정보(이메일, 비밀번호, 레벨, 경험치 등) 관리.

Todo: 퀘스트 정보(제목, 마감 기한, 완료 여부) 관리.

Friend: 감시자 정보(지인 닉네임, 지인 이메일) 및 사용자 간의 매핑.

3.2 순서 다이어그램 (Sequence Diagram: 패널티 로직)
Scheduler: 매일 09:00 로직 트리거.

Database: deadline < NOW 및 completed = false인 데이터 조회.

Penalty Logic: 해당 사용자의 experience 차감 및 level 갱신.

Mail Service: 등록된 Friend 리스트의 이메일로 실패 알림 발송.



슈도 코드 (패널티 검증 알고리즘)

FUNCTION check_daily_penalty():
expired_todos = DB.find_uncompleted_todos_past_deadline()
FOR EACH todo IN expired_todos:
target_user = todo.user
target_user.experience -= PENALTY_POINT
DB.save(target_user)

        watchers = DB.find_friends_by_user(target_user)
        FOR EACH friend IN watchers:
            EmailService.send_snitch_mail(friend.email, target_user.nickname, todo.title)


4. 구현 (구현 환경 및 기술)

4.1 구현 환경

구분,내용
개발 OS / IDE,"Windows 11 / IntelliJ IDEA, VS Code"
서버 구조,클라이언트-서버 (REST API) 아키텍처
백엔드,"Java 17, Spring Boot 3.x, Spring Data JPA"
프론트엔드,"React, Axios, Recharts, React-Calendar"
데이터베이스,MariaDB (RDBMS)
인증/보안,"Spring Security, JWT, BCrypt"

4.2 주요 API 연동
Spring Task Scheduling: 백그라운드 자동화 작업 수행.

JavaMailSender: 구글 SMTP 서버 연동을 통한 실시간 메일 전송.



5. 실험 (테스트 데이터 및 결과)

   5.1 테스트 시나리오 및 결과

테스트 항목,테스트 데이터,예상 결과,결과
회원 보안,"비밀번호 ""pw123""",DB 내 해시값 저장 확인,Pass
기한 검증,마감 2026-04-06 (미완료),04-07 09:00 패널티 부여,Pass
알림 발송,실제 이메일 계정 등록,지인 메일함에 알림 도착 확인,Pass
레벨업,경험치 100 이상 획득,레벨 1 → 2 상승 및 모달 출력,Pass


6. 결론 (작업 결과 설명)
   본 프로젝트는 **'사회적 압박'**이라는 독창적인 기제를 기술적으로 구현하여, 
   현대인의 미루기 습관을 교정할 수 있는 실질적인 솔루션을 제시하였습니다.

   성과: 안정적인 JWT 인증 기반의 보안 시스템을 구축하였으며, 
   Spring Scheduler와 이메일 API를 연동하여 사람의 개입 없는 자동화된 패널티 시스템을 완성하였습니다.

   의의: 단순한 데이터 관리를 넘어, 실제 외부 통신 서비스와의 통합을 통해 서비스의 가용성과 신뢰성을 
   확보한 풀스택 프로젝트로서의 결과물을 도출하였습니다
