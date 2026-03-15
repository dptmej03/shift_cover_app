알바 대타 관리 앱 개발 요청
프로젝트 개요

카페·음식점 등 소상공인 매장에서
사장님이 대타 근무를 요청하고 알바생이 승인/거절할 수 있는 앱을 개발해주세요.

현재는 카카오톡 단체방에서
“이번 주 토요일 18~22시 대타 가능?”
같은 메시지를 보내며 수동으로 관리하고 있습니다.

이 앱은 캘린더 기반 대타 요청 시스템을 제공하여
사장님과 알바생이 근무 대타를 효율적으로 관리할 수 있도록 합니다.

기술 스택 요구사항

Frontend

React Native (모바일 앱)

캘린더 UI 라이브러리 사용

Backend

Python FastAPI

REST API 구조

Database

PostgreSQL

Authentication

JWT 기반 로그인

Notification

Firebase Cloud Messaging (푸시 알림)

핵심 기능 요구사항
1. 사용자 관리

사용자 역할

Manager (사장님)

Employee (알바생)

기능

회원가입

로그인

매장 연결

2. 대타 요청 생성 (사장님)

사장님이

날짜

근무 시작시간

근무 종료시간

을 선택하여 대타 요청 생성

예

3월 20일
18:00 ~ 22:00
대타 요청

등록 시 알바생에게 알림 전송

3. 대타 요청 조회 (알바생)

알바생은 앱에서

대타 요청 목록 확인

캘린더에서 요청 확인

각 요청에 대해

신청

거절

선택 가능

4. 대타 신청

알바생이

대타 신청

버튼을 누르면

사장님에게 지원 알림 전송

5. 대타 승인

사장님은

지원한 알바생 목록 확인

한 명 선택하여 승인

승인되면 해당 근무는 확정 상태로 변경

6. 캘린더 기능

사용자는 캘린더에서

내 근무 일정

대타 요청

을 확인할 수 있어야 함

7. 알림 시스템

다음 이벤트 발생 시 알림 전송

대타 요청 생성

대타 신청 발생

승인 완료

거절

데이터 모델 요구사항
Users
user_id
name
role (manager / employee)
email
password
store_id
Stores
store_id
store_name
owner_id
ShiftRequests
request_id
store_id
date
start_time
end_time
status (open / closed)
created_by
Applications
application_id
request_id
employee_id
status (pending / accepted / rejected)
UI/UX 요구사항

밝은 테마

간단하고 직관적인 UI

모바일 중심 설계

사용 흐름

로그인
→ 대타 요청 확인
→ 신청
→ 승인
→ 캘린더 확인
개발 우선순위

1️⃣ Backend API 설계
2️⃣ Database 모델 구현
3️⃣ 대타 요청 시스템 구현
4️⃣ Frontend 기본 UI
5️⃣ 캘린더 기능
6️⃣ 푸시 알림

목표

카카오톡 단체방 대신 사용할 수 있는
간단한 알바 대타 관리 앱 MVP 개발