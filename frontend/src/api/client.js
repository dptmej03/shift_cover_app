import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 개발 환경: 로컬 PC의 IP로 변경하세요
// Expo Go + 실기기 사용 시: 'http://192.168.x.x:8000'
// 에뮬레이터 사용 시(Android): 'http://10.0.2.2:8000'
export const BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터: JWT 토큰 자동 첨부
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || '오류가 발생했습니다.';
    return Promise.reject(new Error(message));
  }
);

export default api;
