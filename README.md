# 조용한 방 — 음악 플레이어

Render에서 Node.js로 실행하고, 모바일과 데스크톱 Chrome에서 PWA로 설치할 수 있는 음악 플레이어입니다.

## 음악 넣기

1. 저장소에 `public/music` 폴더를 만들고 사용 권한이 있는 MP3 파일을 넣습니다.
2. `tracks.json`에서 제목, 아티스트, 음원 경로를 수정합니다. 예: `"src": "/music/my-song.mp3"`
3. GitHub에 push하면 Render가 자동 배포합니다.

## GitHub와 Render 배포

1. 이 폴더를 새 GitHub 저장소에 push합니다.
2. Render 대시보드에서 **New → Blueprint**를 선택하고 저장소를 연결합니다.
3. `render.yaml`의 설정으로 웹 서비스가 생성됩니다. Render가 배포를 마치면 제공된 HTTPS 주소로 접속합니다.
4. 이후 GitHub 기본 브랜치에 push하면 Render가 다시 배포합니다.

수동으로 서비스 생성 시 Runtime은 Node, Build Command는 `npm install`, Start Command는 `npm start`로 지정합니다.

## Chrome에서 앱으로 설치

사이트는 HTTPS에서 PWA 설치를 지원합니다. 데스크톱 Chrome은 주소창의 설치 아이콘 또는 메뉴의 **앱 설치**를 사용합니다. Android Chrome은 **앱 설치** 또는 **홈 화면에 추가** 메뉴를 사용할 수 있습니다. iPhone/iPad Chrome은 iOS 제한으로 Chrome 내부 설치 대신 Safari의 공유 메뉴에서 **홈 화면에 추가**를 사용해야 할 수 있습니다.

## 헤드폰 연결 확인의 한계

페이지는 브라우저가 노출하는 오디오 출력 기기 이름을 확인하고, 이름에 headphone/headset/earphone/이어폰/헤드폰 등이 있는 기기가 있을 때만 재생을 허용합니다. 출력 이름이 숨겨진 환경이나 이름이 일반적으로 표시되는 Bluetooth 기기는 차단되거나 잘못 판별될 수 있습니다. 웹 브라우저는 모든 컴퓨터와 휴대폰에서 실제 귀에 착용했는지 또는 스피커가 물리적으로 꺼져 있는지를 보장해서 확인할 수 없습니다. 따라서 이는 브라우저가 제공하는 기기 목록에 대한 최선의 확인이며, 하드웨어 수준의 완전한 차단 기능은 아닙니다.

`setSinkId`를 지원하는 데스크톱 Chrome에서는 출력 기기 선택도 표시됩니다. 모바일 브라우저는 이 기능을 지원하지 않을 수 있습니다.
