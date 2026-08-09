// functions/audio/[key].js
// /audio/* 요청을 public/ 정적 자산(env.ASSETS)에서 읽어
// HTTP Range 요청을 처리해 206 Partial Content로 서빙.
//
// Cloudflare Pages의 정적 서빙은 Range를 미지원(200 전체 응답)이라
// <audio>의 시크(시간 조정)가 동작하지 않음 → 함수에서 Range를 처리.

const MIME = {
	".m4a": "audio/mp4",
	".mp3": "audio/mpeg",
	".opus": "audio/ogg",
	".ogg": "audio/ogg",
	".wav": "audio/wav",
};

const EXT = (key) => key.slice(key.lastIndexOf("."));

export async function onRequestGet(context) {
	const { request, env } = context;
	const key = context.params.key; // 예: "bow.m4a"

	// 정적 자산(public/)에서 원본을 통째로 읽음 (파일이 25MiB 이하라 가능)
	const asset = await env.ASSETS.fetch(new URL(`/${key}`, request.url));
	if (!asset.ok) {
		return new Response("not found", { status: 404 });
	}

	const body = new Uint8Array(await asset.arrayBuffer());
	const size = body.byteLength;
	const type =
		MIME[EXT(key)] || asset.headers.get("Content-Type") || "application/octet-stream";

	const headers = {
		"Content-Type": type,
		"Accept-Ranges": "bytes",
		"Cache-Control": "public, max-age=31536000, immutable",
		// 엣지 캐시가 Range 헤더별로 응답을 구분하도록 — 첫 요청의 206이
		// 캐시되어 다른 오프셋 시크 요청에 잘못 서빙되는 것 방지
		"Vary": "Range",
	};

	const range = request.headers.get("Range");
	if (!range) {
		return new Response(body, {
			headers: { ...headers, "Content-Length": String(size) },
		});
	}

	// Range: bytes=start-end | bytes=start- | bytes=-suffix (다중 범위는 첫 범위만 처리)
	const m = range.match(/bytes=(\d*)-(\d*)/);
	let start;
	let end;
	if (m && m[1] === "" && m[2] !== "") {
		// 접미사 범위 (bytes=-512): 마지막 N바이트
		const suffix = parseInt(m[2], 10);
		start = Math.max(0, size - suffix);
		end = size - 1;
	} else if (m && m[1] !== "") {
		start = parseInt(m[1], 10);
		end = m[2] !== "" ? parseInt(m[2], 10) : size - 1;
	} else {
		start = 0;
		end = size - 1;
	}

	if (start >= size || start > end) {
		return new Response(null, {
			status: 416,
			headers: { "Content-Range": `bytes */${size}` },
		});
	}

	const chunk = body.slice(start, end + 1);
	return new Response(chunk, {
		status: 206,
		headers: {
			...headers,
			"Content-Range": `bytes ${start}-${end}/${size}`,
			"Content-Length": String(chunk.byteLength),
		},
	});
}
