"""
tts_server.py — 持久 Kokoro TTS 本地 server
Kokoro 只載入一次，後續每個字 1-2 秒內生成

啟動方式：
  python scripts/tts_server.py

Express /api/tts/ 會轉發到 http://localhost:5001/tts/:word
"""
import sys, io, re
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import unquote

# ── 設定 ──────────────────────────────────────────
PORT       = 5001
VOICE_ID   = "am_michael"
SPEED      = 0.95
TARGET_DB  = -16.0
OUT_DIR    = Path(__file__).parent.parent / "public" / "audio" / "words"

# ── 啟動時載入 Kokoro（只跑一次）──────────────────
import numpy as np, soundfile as sf
from pydub import AudioSegment
from kokoro import KPipeline

print(f"[TTS Server] Loading Kokoro ({VOICE_ID})...")
_pipeline = KPipeline(lang_code='a')
print(f"[TTS Server] Ready on http://localhost:{PORT}")

def sanitize(word: str) -> str:
    return re.sub(r"[^a-z0-9_'-]", "", word.lower().replace(" ", "_"))

def generate_mp3(word: str, out_path: Path) -> bool:
    try:
        segs = [a for _, _, a in _pipeline(f"{word}.", voice=VOICE_ID, speed=SPEED)]
        if not segs:
            return False
        wav = np.concatenate(segs)
        tmp = out_path.with_suffix(".tmp.wav")
        sf.write(str(tmp), wav, 24000)
        audio = AudioSegment.from_wav(str(tmp))
        audio.apply_gain(TARGET_DB - audio.dBFS).export(str(out_path), format="mp3", bitrate="96k")
        tmp.unlink(missing_ok=True)
        return True
    except Exception as e:
        print(f"[TTS Server] Generate failed: {word} — {e}")
        return False

class TTSHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # 靜默 access log

    def do_GET(self):
        # 路徑：/tts/<word>
        if not self.path.startswith("/tts/"):
            self.send_response(404); self.end_headers(); return

        word = unquote(self.path[5:]).strip()[:80]
        filename = sanitize(word)
        if not filename:
            self.send_response(400); self.end_headers(); return

        mp3 = OUT_DIR / f"{filename}.mp3"
        OUT_DIR.mkdir(parents=True, exist_ok=True)

        # 已有檔案直接回傳
        if not mp3.exists():
            print(f"[TTS Server] Generating: {word}")
            ok = generate_mp3(word, mp3)
            if not ok:
                self.send_response(503); self.end_headers(); return

        data = mp3.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", "audio/mpeg")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

if __name__ == "__main__":
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with HTTPServer(("127.0.0.1", PORT), TTSHandler) as httpd:
        httpd.serve_forever()
