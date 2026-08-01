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

## 음원 구성 (Opus 우선 + AAC 폴백)

| 트랙 | Opus (우선) | AAC (폴백) | 원본 백업 |
| --- | --- | --- | --- |
| 절하기 | `public/bow.opus` (23.4MB) | `public/bow.m4a` (21.9MB) | `bow-original-86MB.mp3` |
| 천일결사 | `public/cheonil.opus` (14.3MB) | `public/cheonil.m4a` (14.2MB) | `cheonil-original-46MB.mp3` |

- **Opus**: 유튜브·스포티파이 표준 코덱, 같은 비트레이트에서 최고 품질 (Chrome/Edge/Firefox/iOS 18.4+)
- **AAC 폴백**: 데스크톱 사파리 등 Opus 미지원 브라우저용 — 앱이 `canPlayType`으로 자동 감지
- 백업 파일 2개는 git 제외, 배포 안 됨

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
