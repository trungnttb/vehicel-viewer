# Triển khai Gara tí hon lên vehicle.hoha.dev

## Luồng tổng quát

```
git push main
  → GitHub webhook → Jenkins (chạy trên chính server deploy)
  → docker compose build        # trong Dockerfile: npm ci → npm test → vite build → image nginx
  → deploy/deploy.sh <build số> # up container, chờ healthcheck, lỗi thì quay về image trước
  → container vehicle-viewer lắng nghe 127.0.0.1:6666
  → Nginx UI (reverse proxy, HTTPS) → https://vehicle.hoha.dev
```

| File | Vai trò |
|---|---|
| `Dockerfile` | Build 2 bước: Node 24 chạy test + build, nginx 1.29 phục vụ `dist/`. Test hỏng thì không ra image. |
| `deploy/nginx/default.conf` | nginx **bên trong** container: cache `assets/` 1 năm (tên file có hash), `index.html` luôn revalidate, `audio/` 1 ngày, `/healthz`. |
| `docker-compose.yml` | Service `web`, image `vehicle-viewer:${IMAGE_TAG}`, map `127.0.0.1:6666 → 80`. |
| `deploy/deploy.sh` | Up image đã build, chờ `healthy` tối đa 60s, không đạt thì up lại image trước và trả exit 1; giữ 3 image gần nhất. |
| `Jenkinsfile` | Check tooling → build (có test) → deploy. |
| `deploy/nginx-ui/vehicle.hoha.dev.conf` | Cấu hình site dán vào Nginx UI. |

Port 6666 chỉ bind vào `127.0.0.1`, nên từ Internet không truy cập thẳng được; mọi request phải đi qua Nginx UI. Lưu ý: port Docker publish **không** đi qua rule của `ufw`, nên đừng đổi sang `0.0.0.0` chỉ để tiện.

## 1. Chuẩn bị server

- Ubuntu/Debian, mở port 80 và 443.
- Docker Engine **25 trở lên** (Dockerfile dùng `HEALTHCHECK --start-interval`) và compose plugin (`docker compose version` phải chạy được). Cài theo https://docs.docker.com/engine/install/.
- DNS: bản ghi `A` `vehicle.hoha.dev` → IP public của server. Kiểm tra: `dig +short vehicle.hoha.dev`.

Chạy tay một lần để chắc server build được, trước khi đụng tới Jenkins:

```bash
git clone https://github.com/trungnttb/vehicel-viewer.git && cd vehicel-viewer
IMAGE_TAG=manual docker compose build
sh deploy/deploy.sh manual
curl -I http://127.0.0.1:6666/          # 200, Cache-Control: no-cache
```

## 2. Cài Jenkins (LTS, cài thẳng trên host)

Cài trên host thay vì chạy Jenkins trong container: Jenkins gọi được `docker` của host luôn, không phải mount docker socket và cài Docker CLI vào image Jenkins.

Lệnh lấy từ https://www.jenkins.io/doc/book/installing/linux/ (đọc ngày 2026-09-16; key repo hiện là `jenkins.io-2026.key` — nếu `apt update` báo lỗi chữ ký thì xem lại trang đó, key có thể đã đổi):

```bash
sudo apt update
sudo apt install fontconfig openjdk-21-jre

sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key
echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install jenkins

sudo systemctl enable --now jenkins
```

Cho user `jenkins` dùng Docker, rồi restart để group mới có hiệu lực:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
sudo -u jenkins docker compose version   # phải in ra version, không báo permission denied
```

> Thành viên group `docker` có quyền tương đương root trên host. Chấp nhận được khi Jenkins chỉ phục vụ repo của bạn; đừng cho người khác tạo job tùy ý trên Jenkins này.

### Mở giao diện Jenkins

Jenkins mặc định nghe port 8080. Không mở 8080 ra Internet; chọn một trong hai cách:

- **Qua Nginx UI** (cần khi dùng GitHub webhook): tạo thêm site, ví dụ `jenkins.hoha.dev`, proxy tới `http://127.0.0.1:8080`, bật HTTPS giống bước 5. Sau đó vào *Manage Jenkins → System → Jenkins URL* đặt `https://jenkins.hoha.dev/`.
- **SSH tunnel** (không public Jenkins): `ssh -L 8080:127.0.0.1:8080 user@server`, mở `http://localhost:8080`.

Lần đầu vào: lấy mật khẩu bằng `sudo cat /var/lib/jenkins/secrets/initialAdminPassword` → *Install suggested plugins* → tạo tài khoản admin.

### Plugin cần có

*Manage Jenkins → Plugins → Installed*, kiểm tra có: **Pipeline**, **Git**, **GitHub** (plugin `github`, cung cấp trigger `githubPush()`). Thiếu cái nào thì cài ở tab *Available*.

## 3. Tạo job

1. *New Item* → tên `vehicle-viewer` → **Pipeline** → OK.
2. *Triggers*: tick **GitHub hook trigger for GITScm polling**.
3. *Pipeline*:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**, Repository URL: `https://github.com/trungnttb/vehicel-viewer.git`
   - Credentials: để trống nếu repo public; repo private thì thêm *Username with password* với username GitHub + Personal Access Token (quyền *Contents: Read-only*).
   - Branch Specifier: `*/main`
   - Script Path: `Jenkinsfile`
4. Save → **Build Now** một lần bằng tay. Lần chạy đầu cũng là lúc Jenkins đăng ký trigger `githubPush()` khai báo trong Jenkinsfile.

Build thành công thì console cuối có `Deployed vehicle-viewer:<số build>`.

## 4. GitHub webhook

Repo GitHub → *Settings → Webhooks → Add webhook*:

- Payload URL: `https://jenkins.hoha.dev/github-webhook/` (giữ dấu `/` cuối)
- Content type: `application/json`
- Event: *Just the push event*

Sau khi lưu, tab *Recent Deliveries* phải có response 200.

**Jenkins không public ra Internet** (dùng SSH tunnel) thì webhook không tới được. Khi đó sửa `Jenkinsfile`, thay `githubPush()` bằng `pollSCM('H/5 * * * *')`: Jenkins tự kiểm tra repo mỗi 5 phút, có commit mới mới build.

## 5. Cấu hình Nginx UI cho vehicle.hoha.dev

Dự án có **hai** file cấu hình nginx, đừng nhầm:

| File | Chạy ở đâu | Có cần sửa không |
|---|---|---|
| `deploy/nginx/default.conf` | nginx **bên trong** container app, nghe port 80 của container | Không. Được copy vào image lúc build. |
| `deploy/nginx-ui/vehicle.hoha.dev.conf` | nginx do **Nginx UI** quản lý trên server, nghe 80/443 public, chuyển request về container | Có. Dán vào Nginx UI theo các bước dưới. |

Request đi như sau:

```
Trình duyệt ──https──▶ Nginx UI (443, vehicle.hoha.dev) ──http──▶ 127.0.0.1:6666 ──▶ container nginx (80) ──▶ dist/
```

Tên menu Nginx UI dưới đây có thể khác đôi chút tùy phiên bản — tôi chưa đối chiếu với bản bạn đang chạy.

### 5.1 Chọn địa chỉ upstream

Dòng `server ...;` trong block `upstream vehicle_viewer` phải là địa chỉ mà nginx của Nginx UI gọi được:

| Nginx UI chạy thế nào | Dòng upstream | Việc cần làm thêm |
|---|---|---|
| Cài trên host, hoặc container `network_mode: host` | `server 127.0.0.1:6666;` | Không có. |
| Container Docker thường (bridge, ví dụ `uozi/nginx-ui` map `80:80`, `443:443`) | `server vehicle-viewer:80;` | `docker network connect vehicle-viewer_default <tên-container-nginx-ui>`. Trong container này `127.0.0.1` là chính Nginx UI, để `127.0.0.1:6666` sẽ trả 502. |

Với trường hợp container: `docker compose down` xóa network `vehicle-viewer_default` và mất kết nối ở trên; pipeline chỉ dùng `up` nên không bị. Nếu từng chạy `down`, chạy lại lệnh `docker network connect`.

Mọi config bên dưới viết cho trường hợp cài trên host. Trường hợp container chỉ đổi đúng dòng upstream.

### 5.2 Bước 1 — site HTTP (chưa có chứng chỉ)

1. *Sites → Sites List → Add Site*, tên `vehicle.hoha.dev`.
2. Chuyển sang chế độ sửa code (Advanced / Code Editor), xóa nội dung mặc định, dán nguyên đoạn này:

```nginx
upstream vehicle_viewer {
    server 127.0.0.1:6666;          # container Nginx UI: server vehicle-viewer:80;
    keepalive 16;
}

server {
    listen 80;
    listen [::]:80;
    server_name vehicle.hoha.dev;

    # Let's Encrypt gọi vào đây để xác minh domain; 9180 là port challenge mặc định của Nginx UI.
    location /.well-known/acme-challenge {
        proxy_set_header Host $host;
        proxy_pass http://127.0.0.1:9180;
    }

    location / {
        proxy_pass http://vehicle_viewer;
        proxy_http_version 1.1;
        proxy_set_header Connection "";          # giữ keepalive tới upstream
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. Save → **Enable**. Nginx UI chạy `nginx -t` rồi reload; báo lỗi cú pháp thì config không được áp dụng.
4. Kiểm tra: `curl -I http://vehicle.hoha.dev/` → `200`.

Giải thích từng phần:

| Dòng | Tác dụng |
|---|---|
| `upstream vehicle_viewer` + `keepalive 16` | Giữ tối đa 16 kết nối mở sẵn tới container, không phải mở kết nối TCP mới cho mỗi file JS/audio. Cần đi cùng `proxy_http_version 1.1` và `Connection ""`. |
| `server_name vehicle.hoha.dev` | Chỉ request có Host này mới vào site. Domain khác trỏ cùng IP không bị phục vụ app. |
| `location /.well-known/acme-challenge` | Chuyển request xác minh domain cho Nginx UI. Nếu Nginx UI tự chèn một block tương tự khi cấp chứng chỉ thì giữ một block, xóa bản trùng (trùng location → `nginx -t` lỗi). |
| `proxy_set_header Host $host` | Container nhận đúng Host gốc. |
| `X-Real-IP`, `X-Forwarded-For` | Log trong container thấy IP thật của người dùng thay vì IP của proxy. |
| `X-Forwarded-Proto` | Cho container biết request gốc là http hay https. |

### 5.3 Bước 2 — cấp chứng chỉ Let's Encrypt

1. Mở lại site → bật **Encrypt with Let's Encrypt** (HTTP-01) cho `vehicle.hoha.dev`.
2. Chờ báo thành công. Vào *Certificates*, ghi lại hai đường dẫn: file certificate (fullchain) và file private key.
3. Nếu lỗi: kiểm tra `dig +short vehicle.hoha.dev` ra đúng IP server, port 80 mở từ Internet, `curl -i http://vehicle.hoha.dev/.well-known/acme-challenge/test` không được trả về trang HTML của app (trả HTML của app nghĩa là request chưa đi vào location challenge).

Nếu DNS đi qua Cloudflare với proxy bật (mây cam) mà cấp chứng chỉ lỗi, chuyển bản ghi sang *DNS only* để cấp, bật proxy lại sau đó và đặt SSL mode **Full (strict)**.

### 5.4 Bước 3 — config cuối cùng (HTTPS + redirect)

Thay toàn bộ nội dung site bằng đoạn dưới (cũng là nội dung file `deploy/nginx-ui/vehicle.hoha.dev.conf`). **Sửa hai dòng `ssl_certificate` / `ssl_certificate_key`** thành đúng đường dẫn đã ghi ở bước 2 — đường dẫn trong mẫu chỉ là ví dụ, để nguyên thì `nginx -t` báo không tìm thấy file.

```nginx
upstream vehicle_viewer {
    server 127.0.0.1:6666;          # container Nginx UI: server vehicle-viewer:80;
    keepalive 16;
}

# HTTP: chỉ phục vụ xác minh Let's Encrypt (cần cho gia hạn tự động), còn lại chuyển sang HTTPS.
server {
    listen 80;
    listen [::]:80;
    server_name vehicle.hoha.dev;

    location /.well-known/acme-challenge {
        proxy_set_header Host $host;
        proxy_pass http://127.0.0.1:9180;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name vehicle.hoha.dev;

    # Thay bằng đường dẫn trên trang Certificates của Nginx UI.
    ssl_certificate     /etc/nginx/ssl/vehicle.hoha.dev/fullchain.cer;
    ssl_certificate_key /etc/nginx/ssl/vehicle.hoha.dev/private.key;

    add_header Strict-Transport-Security "max-age=31536000" always;

    # App tĩnh, không có endpoint upload.
    client_max_body_size 1m;

    location / {
        proxy_pass http://vehicle_viewer;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

Khác với bước 1:

| Thay đổi | Tác dụng |
|---|---|
| Block 80: `location /` thành `return 301 https://...` | Ai gõ `http://` đều được chuyển sang `https://`. Location ACME vẫn giữ để Nginx UI gia hạn chứng chỉ (mặc định khi còn ≤ 30 ngày) mà không bị redirect. |
| Block 443 với `ssl_certificate*` | Nginx UI giải mã TLS; container phía sau chỉ nhận HTTP thường. |
| `http2 on` | Tải song song JS, CSS, 20 file audio qua một kết nối. Cần nginx ≥ 1.25.1; bản cũ hơn thì xóa dòng này và viết `listen 443 ssl http2;`. |
| `Strict-Transport-Security` | Trình duyệt nhớ 1 năm là domain này chỉ dùng HTTPS. Chỉ bật khi HTTPS đã chạy ổn: bật rồi mà chứng chỉ hỏng thì Safari không cho người dùng bỏ qua cảnh báo. |
| `X-Forwarded-Proto https` | Ghi cố định vì block này chỉ nhận HTTPS. |

Save → kiểm tra theo mục 6.

## 6. Kiểm tra sau khi deploy

```bash
curl -I https://vehicle.hoha.dev/                         # 200, Cache-Control: no-cache
curl -I http://vehicle.hoha.dev/                          # 301 → https
curl -s https://vehicle.hoha.dev/healthz                  # ok
curl -s -r 0-99 -o /dev/null -w '%{http_code}\n' \
  https://vehicle.hoha.dev/audio/vi/wheels.m4a            # 206: Safari cần Range request để phát audio
docker ps --filter name=vehicle-viewer                    # (healthy)
```

Rồi mở trên iPad thật (Safari, cầm ngang): chọn xe → xoay/zoom → tách bộ phận → chạm nghe tên → ráp lại. Kiểm tra trên desktop không thay được bước này.

## 7. Rollback bằng tay

`deploy.sh` giữ 3 image đánh số theo build Jenkins gần nhất:

```bash
docker images vehicle-viewer                        # xem các tag còn giữ
cd /var/lib/jenkins/workspace/vehicle-viewer
IMAGE_TAG=41 docker compose up -d --no-build
```

Build Jenkins tiếp theo sẽ deploy lại bản mới nhất trên `main`; muốn giữ bản cũ lâu dài thì revert commit.

## Đã kiểm tra / chưa kiểm tra

Đã chạy trên máy dev (macOS, OrbStack, Docker 29.4, `docker-compose` standalone thay cho plugin):

- Build image không cache: 5/5 test pass trong bước build, `vite build` thành công.
- Container lên `healthy`; `/`, `/healthz`, file JS (gzip, cache 1 năm), `/audio/vi/*.m4a` (`audio/x-m4a`, Range → 206) trả đúng; asset không tồn tại → 404.
- `deploy.sh`: deploy 101 → 102 thành công; image 103 có healthcheck luôn lỗi → quay về 102, exit 1, app vẫn trả 200.
- Hai config ở mục 5.2 và 5.4 (chép thẳng từ file này, chứng chỉ tự ký): `nginx -t` pass. Chạy config 5.4 với nginx thường, upstream `vehicle-viewer:80`: `http://…/xe` → 301 sang `https://vehicle.hoha.dev/xe`; `/.well-known/acme-challenge/test` → 502 (được chuyển tới port 9180, không bị redirect; 502 vì máy dev không có gì nghe port đó); HTTPS → HTTP/2 200 kèm `strict-transport-security`; audio Range → 206.

Chưa kiểm tra:

- Jenkins thật (chưa chạy `Jenkinsfile` trên Jenkins nào), GitHub webhook.
- Nginx UI thật: tên menu, đường dẫn file chứng chỉ, Nginx UI có tự chèn location ACME trùng với block trong mục 5.2 hay không.
- Cấp chứng chỉ Let's Encrypt thật cho `vehicle.hoha.dev`, DNS.
- `docker compose` plugin trên Linux (máy dev dùng bản standalone).
- iPad/Safari thật qua domain.
