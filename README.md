# BeatCraft

간단한 Song Maker 스타일 웹 앱입니다.

## 시작하기

1. 패키지 설치

```bash
npm install
```

2. 개발 모드 실행

```bash
npm run dev
```

3. 프론트엔드만 빌드 감시

```bash
npm run watch:frontend
```

4. 정적 빌드 후 서버 실행

```bash
npm run build
npm start
```

3. 빌드 후 실행

```bash
npm run build
npm start
```

## 서버 및 클라이언트 실행 방법

- `npm run dev` - 개발 모드로 서버와 프론트엔드 감시를 동시에 실행합니다.
- `npm run watch:frontend` - 프론트엔드 코드만 실시간으로 컴파일합니다.
- `npm run build` - 서버와 프론트엔드를 모두 빌드합니다.
- `npm start` - 빌드된 서버를 실행합니다.

서버는 `public/` 폴더를 정적 파일로 제공하므로, `npm run dev` 실행 후 브라우저에서 `http://localhost:3000`을 여세요.

## 프로젝트 구조

- `src/server.ts` - Express로 정적 파일을 제공하는 백엔드 서버
- `frontend/app.ts` - 웹 브라우저에서 작동하는 간단한 시퀀서 로직
- `public/index.html` - 앱 진입점
- `public/style.css` - 화면 스타일
