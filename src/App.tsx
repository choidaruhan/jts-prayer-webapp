import { useRef, useState } from "react";
import "./App.css";

type Screen = "start" | "player";

type Track = "bow" | "cheonil";

const TRACKS: Record<Track, { src: string; title: string }> = {
	bow: { src: "/bow.m4a", title: "절하기" },
	cheonil: { src: "/cheonil.m4a", title: "천일결사" },
};

function formatTime(sec: number): string {
	if (!Number.isFinite(sec) || sec < 0) return "--:--";
	const m = Math.floor(sec / 60);
	const s = Math.floor(sec % 60);
	return `${m}:${s.toString().padStart(2, "0")}`;
}

function PlayIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			width="36"
			height="36"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M8 5.14v13.72a1 1 0 0 0 1.52.86l11.2-6.86a1 1 0 0 0 0-1.72L9.52 4.28A1 1 0 0 0 8 5.14Z" />
		</svg>
	);
}

function PauseIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			width="36"
			height="36"
			fill="currentColor"
			aria-hidden="true"
		>
			<rect x="6" y="4" width="4.5" height="16" rx="1" />
			<rect x="13.5" y="4" width="4.5" height="16" rx="1" />
		</svg>
	);
}

function App() {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [screen, setScreen] = useState<Screen>("start");
	const [track, setTrack] = useState<Track>("bow");
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState<number>(NaN); // NaN = 아직 모름

	// 시작 화면 → 플레이어 전환 (버튼 클릭 제스처 안에서 재생 → iOS 호환)
	const startPrayer = (t: Track) => {
		const audio = audioRef.current;
		setTrack(t);
		setCurrentTime(0);
		setDuration(NaN); // 트랙 변경 시 길이 리셋
		if (audio) {
			audio.src = TRACKS[t].src; // 렌더 반영보다 먼저 교체
			audio.currentTime = 0;
			void audio.play().catch(() => {});
			setIsPlaying(true);
		}
		setScreen("player");
	};

	const togglePlay = () => {
		const audio = audioRef.current;
		if (!audio) return;
		if (audio.paused) {
			void audio.play().catch(() => {});
			setIsPlaying(true);
		} else {
			audio.pause();
			setIsPlaying(false);
		}
	};

	const seek = (value: number) => {
		const audio = audioRef.current;
		if (!audio) return;
		audio.currentTime = value;
		setCurrentTime(value);
	};

	const goBack = () => {
		audioRef.current?.pause();
		setIsPlaying(false);
		setCurrentTime(0);
		setScreen("start");
	};

	const progressPercent =
		Number.isFinite(duration) && duration > 0
			? Math.min(100, (currentTime / duration) * 100)
			: 0;

	return (
		<>
			{/* 두 화면에서 공유하는 단일 오디오 요소 (전환 시 리마운트 방지) */}
			{/* src prop 없음 — React가 재렌더링 시 src를 재설정하면
				로드가 재시작되어 play()가 중단되므로, src는 명령형으로만 관리 */}
			<audio
				ref={audioRef}
				preload="auto"
				onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
				onLoadedMetadata={(e) => {
					const d = e.currentTarget.duration;
					if (Number.isFinite(d)) setDuration(d);
				}}
				onDurationChange={(e) => {
					const d = e.currentTarget.duration;
					if (Number.isFinite(d)) setDuration(d);
				}}
				onEnded={() => setIsPlaying(false)}
			/>

			{screen === "start" ? (
				<main className="prayer-room">
					<h1 className="title">기도</h1>
					<p className="subtitle">기도를 선택하면 음원이 재생됩니다</p>

					<div className="track-list">
						<button
							type="button"
							className="bow-btn"
							onClick={() => startPrayer("bow")}
						>
							절하기
						</button>
						<button
							type="button"
							className="bow-btn"
							onClick={() => startPrayer("cheonil")}
						>
							천일결사
						</button>
					</div>
				</main>
			) : (
				<main className="prayer-room player-screen">
					<p className="player-label">지금 재생 중</p>
					<h1 className="player-title">{TRACKS[track].title}</h1>

					<button
						type="button"
						className="player-btn"
						onClick={togglePlay}
						aria-label={isPlaying ? "일시정지" : "재생"}
					>
						{isPlaying ? <PauseIcon /> : <PlayIcon />}
					</button>

					<div className="player-progress">
						<input
							type="range"
							className="progress-bar"
							min={0}
							max={Number.isFinite(duration) ? duration : 0}
							step={0.1}
							value={currentTime}
							onChange={(e) => seek(Number(e.target.value))}
							style={{
								background: `linear-gradient(to right, var(--accent) ${progressPercent}%, #e2ddd4 ${progressPercent}%)`,
							}}
							aria-label="재생 위치"
						/>
						<div className="player-time">
							<span>{formatTime(currentTime)}</span>
							<span>{formatTime(duration)}</span>
						</div>
					</div>

					<button type="button" className="player-back" onClick={goBack}>
						처음으로
					</button>
				</main>
			)}
		</>
	);
}

export default App;
