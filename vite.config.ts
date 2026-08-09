import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 로컬 dev에는 Pages Functions(env.ASSETS)가 없으므로 배포 사이트로 프록시
const audioProxyTarget = "https://jts-prayer.pages.dev";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			// /audio/* (Pages Function Range 서빙)를 배포 사이트로 위임
			"/audio": audioProxyTarget,
		},
	},
	preview: {
		proxy: {
			"/audio": audioProxyTarget,
		},
	},
});
