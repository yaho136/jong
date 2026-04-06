import axios from 'axios';

// 백엔드 서버(Spring Boot)와 통신하기 위한 기본 설정
const api = axios.create({
  baseURL: 'http://localhost:8080', // 우리가 띄운 스프링 부트 주소
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;