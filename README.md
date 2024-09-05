# Pre-requisites

-   Install [Node.js](https://nodejs.org/en/) version 20.15.1

# Getting started

-   Clone the repository

```
git clone  <git lab template url> <project_name>
```

-   Install dependencies

```
cd frontend
npm install
```

-   Build and run the project

```
npm start
```

Navigate to Application

main.js - Electron의 메인 프로세스 로직을 포함  
menu.js - Electron 메뉴 설정 관련 로직을 포함  
gitService.js - Git 브랜치 목록을 가져오고, diff 파일을 생성하는 로직을 포함 
dialog.js - 프로젝트 경로 설정 다이얼로그 로직을 포함  
preload.js - Electron의 preload 스크립트를 포함  
renderer.js - 프론트엔드 관련 로직을 포함  
