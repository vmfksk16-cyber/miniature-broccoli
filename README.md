# 스마트 농장 운영 대시보드

작물 레시피 관리, 재고 관리, 판매 프로젝트 진행률, 생산 일정(간트차트)을 한 화면에서 관리하는 웹 대시보드입니다.

## 핵심 안내 (Windows CMD)

`/workspace/miniature-broccoli`는 **컨테이너 내부 경로**라서, 일반 Windows CMD에는 없습니다.
즉, 실행이 안 되는 이유는 README 문장 때문이 아니라 **내 PC에 있는 실제 프로젝트 폴더로 이동하지 않아서**입니다.

## 로컬 실행 (Windows CMD)

### 1) 프로젝트 폴더 찾기

탐색기에서 `miniature-broccoli` 폴더를 찾은 뒤, 주소창 경로를 복사하세요.

예시:
- `C:\Users\<사용자명>\Downloads\miniature-broccoli`
- `D:\dev\miniature-broccoli`

### 2) CMD에서 해당 경로로 이동

```cmd
cd /d C:\Users\<사용자명>\Downloads\miniature-broccoli
```

> `cd /d`를 쓰면 드라이브가 달라도 한 번에 이동됩니다.

### 3) 프로젝트 루트 확인

```cmd
dir
```

아래 파일이 보이면 정상 위치입니다.
- `package.json`
- `index.html`
- `server.js`

### 4) 서버 실행

```cmd
npm start
```

브라우저 접속: `http://localhost:4173`

### 5) 포트 충돌 시

```cmd
set PORT=4174 && npm start
```

브라우저 접속: `http://localhost:4174`

## 대안 실행 (Python)

```cmd
python -m http.server 4173
```

브라우저 접속: `http://localhost:4173`
