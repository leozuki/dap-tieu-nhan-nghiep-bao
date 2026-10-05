"""Gửi một yêu cầu image-to-video qua cổng /v1/video/generations, chờ xong rồi tải mp4. Khóa từ env SHOPAIKEY."""
import base64, json, os, sys, time, urllib.request, urllib.error

BASE = "https://api.shopaikey.com"
KEY = os.environ["SHOPAIKEY"]
img, prompt_file, out, model = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
prompt = open(prompt_file, encoding="utf-8").read()
data_url = "data:image/png;base64," + base64.b64encode(open(img, "rb").read()).decode()


def call(method, path, body=None):
    req = urllib.request.Request(BASE + path, method=method, headers={"Authorization": "Bearer " + KEY, "Content-Type": "application/json"},
                                 data=json.dumps(body).encode() if body is not None else None)
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, raw[:500]


VARIANTS = [
    ("/v1/video/generations", {"model": model, "prompt": prompt, "image": {"url": data_url}, "duration": 6, "resolution": "720p", "generate_audio": False}),
    ("/v1/video/generations", {"model": model, "prompt": prompt, "image": data_url, "duration": 6}),
    ("/v1/videos", {"model": model, "prompt": prompt, "image": {"url": data_url}, "duration": 6, "resolution": "720p"}),
    ("/v1/videos", {"model": model, "prompt": prompt, "input_reference": data_url, "seconds": "6"}),
]
tid = None
for path, body in VARIANTS:
    st, rep = call("POST", path, body)
    print("submit", path, sorted(body), st, json.dumps(rep, ensure_ascii=False)[:300])
    if st == 200 and isinstance(rep, dict):
        d = rep.get("data") if isinstance(rep.get("data"), dict) else rep
        tid = d.get("task_id") or d.get("id") or rep.get("task_id") or rep.get("id")
        poll = path
        break
if not tid:
    sys.exit(1)
print("task", tid, "via", poll)
t0 = time.time()
while time.time() - t0 < 900:
    time.sleep(10)
    st, rep = call("GET", f"{poll}/{tid}")
    s = json.dumps(rep, ensure_ascii=False)
    status = str((rep.get("status") or (rep.get("data") or {}).get("status") if isinstance(rep, dict) else "")).lower()
    print(int(time.time() - t0), "s", st, status, s[:200])
    if any(k in status for k in ("succe", "complete", "done", "finish")):
        def find_url(o):
            if isinstance(o, str) and o.startswith("http") and (".mp4" in o or "video" in o):
                return o
            if isinstance(o, dict):
                for v in o.values():
                    u = find_url(v)
                    if u:
                        return u
            if isinstance(o, list):
                for v in o:
                    u = find_url(v)
                    if u:
                        return u
        url = find_url(rep)
        print("url", url)
        if url:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "x"}), timeout=300) as r:
                open(out, "wb").write(r.read())
            print("saved", out, os.path.getsize(out))
        else:
            print(s[:2000])
        break
    if any(k in status for k in ("fail", "error", "cancel")):
        print(s[:2000])
        break
