// 추후 Google Analytics (Firebase) 연동을 위한 래퍼 파일입니다.
// Expo Go 앱에서는 기본적으로 네이티브 Firebase 모듈이 호환되지 않으므로,
// 실제 배포 전까지 터미널 로그로 분석 데이터(이벤트)를 확인하도록 임시 구성했습니다.

/**
 * 사용자 이벤트를 기록합니다 (예: '로그인', '대타신청', '화면이동')
 * @param {string} eventName 이벤트 이름 (예: 'login', 'apply_shift')
 * @param {object} params 함께 전송할 추가 데이터
 */
export const logEvent = async (eventName, params = {}) => {
  // TODO: 실제 앱 빌드 시 아래 주석 해제하여 Firebase 적용
  // import analytics from '@react-native-firebase/analytics';
  // await analytics().logEvent(eventName, params);
  
  console.log(`\n📊 [Google Analytics 로그] 이벤트 발생: ${eventName}`);
  if (Object.keys(params).length > 0) {
    console.log(`   ㄴ 데이터:`, JSON.stringify(params, null, 2));
  }
};

/**
 * 현재 로그인한 사용자의 ID를 설정하여 누구의 행동인지 추적합니다.
 * @param {string} userId 사용자의 고유 ID
 */
export const setUserId = async (userId) => {
  // await analytics().setUserId(String(userId));
  console.log(`\n📊 [Google Analytics 로그] 사용자 식별: UID ${userId}`);
};

/**
 * 현재 로그인한 사용자의 속성(예: 사장님/알바생)을 설정합니다.
 */
export const setUserProperties = async (properties) => {
  // await analytics().setUserProperties(properties);
  console.log(`\n📊 [Google Analytics 로그] 사용자 속성 설정:`, properties);
};
