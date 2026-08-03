# 기도 (Prayer App)

절하기 버튼을 누르면 음원이 재생되는 간단한 기도 웹사이트.

## 기술 스택

- **Vite + React + TypeScript**
- **Cloudflare Pages** 배포

## 로컬 실행

```bash
npm install
npm run dev
```

## 음원 구성 (public/ 단순 서빙)

| 트랙 | 파일 | 원본 백업 |
| --- | --- | --- |
| 절하기 | `public/bow.m4a` (21.9MB) | `bow-original-86MB.mp3` |
| 천일결사 | `public/cheonil.m4a` (14.2MB) | `cheonil-original-46MB.mp3` |

- **AAC(.m4a) 모노 48kbps 단일 포맷** — 헤더에 길이가 있어 Range 미지원 서버에서도
  길이 표시·재생이 동작 (Cloudflare Pages는 HTTP Range 미지원)
- 음원 교체: 파일만 교체 후 배포 (`npm run build && npx wrangler pages deploy dist`)
- 25MiB 파일 제한 주의: 60분 음원은 모노 48kbps 이하로 압축
  `ffmpeg -i 원본 -ac 1 -c:a aac -b:a 48k -movflags +faststart 출력.m4a`
- 백업 파일 2개는 git 제외, 배포 안 됨

> 참고: 이전에는 R2 + Pages Functions로 Range 스트리밍을 구성했으나
> 단순화를 위해 폴백(public/)으로 전환. 사파리/iOS에서 탐색(시크)이
> 제한될 수 있으나 재생·길이 표시는 정상.

> ⚠️ Cloudflare Pages는 **파일당 25MiB 제한**이 있습니다. 음원 교체 시 25MiB 이하로 압축:
>
> ```
> Opus: ffmpeg -i 원본 -ac 1 -c:a libopus -b:a 48k -application audio 출력.opus
> AAC:  ffmpeg -i 원본 -ac 1 -c:a aac -b:a 48k -movflags +faststart 출력.m4a
> ```

## 배포 (Cloudflare Pages)

### 방법 A — Git 연동 (권장)

1. 이 저장소를 GitHub에 push
2. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 저장소 선택 후 빌드 설정:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. 저장 후 push할 때마다 자동 배포

### 방법 B — CLI (wrangler)

```bash
npm run build
npx wrangler pages deploy dist --project-name prayer-app
```
