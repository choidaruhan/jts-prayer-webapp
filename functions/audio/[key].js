// Pages Functions: /audio/* 요청을 R2에서 Range 처리해 서빙
// (Pages 정적 서빙은 Range 미지원 → 함수로 206 응답 처리)

const MIME = {
  ".opus": "audio/ogg",
  ".m4a": "audio/mp4",
  ".mp3": "audio/mpeg",
};

const EXT = (key) => key.slice(key.lastIndexOf("."));

export async function onRequestGet(context) {
  const { request, env } = context;
  const key = context.params.key; // "bow.opus"

  const obj = await env.AUDIO.get(key);
  if (!obj) return new Response("not found", { status: 404 });

  const size = obj.size;
  const type = MIME[EXT(key)] || "application/octet-stream";
  const headers = {
    "Content-Type": type,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  const range = request.headers.get("Range");
  if (range) {
    const m = range.match(/bytes=(\d*)-(\d*)/);
    let start;
    let end;
    if (m && m[1] === "" && m[2] !== "") {
      // 접미사 범위 (bytes=-512): 마지막 N바이트 — Ogg 길이 스캔에 필수
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
    const ranged = await env.AUDIO.get(key, {
      range: { offset: start, length: end - start + 1 },
    });
    const data = await ranged.arrayBuffer();
    return new Response(data, {
      status: 206,
      headers: {
        ...headers,
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Content-Length": String(data.byteLength),
      },
    });
  }

  const data = await obj.arrayBuffer();
  return new Response(data, {
    headers: { ...headers, "Content-Length": String(size) },
  });
}
