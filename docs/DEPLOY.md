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

File mẫu: `deploy/nginx-ui/vehicle.hoha.dev.conf`. Tên menu dưới đây có thể khác đôi chút tùy phiên bản Nginx UI — tôi chưa đối chiếu với bản bạn đang chạy.

### 5.1 Chọn địa chỉ upstream

`proxy_pass` phải trỏ tới chỗ nginx của Nginx UI thật sự gọi được:

| Nginx UI chạy thế nào | Upstream | Việc cần làm thêm |
|---|---|---|
| Cài trên host, hoặc container `network_mode: host` | `127.0.0.1:6666` | Không có. Dùng nguyên file mẫu. |
| Container Docker thường (bridge, ví dụ `uozi/nginx-ui` map `80:80`, `443:443`) | `vehicle-viewer:80` | Nối container Nginx UI vào network của app: `docker network connect vehicle-viewer_default <tên-container-nginx-ui>`. Trong đó `127.0.0.1` là chính container Nginx UI, nên file mẫu sẽ trả 502. |

Với trường hợp container: `docker compose down` xóa network `vehicle-viewer_default` và mất kết nối ở trên; pipeline chỉ dùng `up` nên không bị. Nếu từng chạy `down`, chạy lại lệnh `docker network connect`.

### 5.2 Tạo site (HTTP trước)

1. *Sites → Sites List → Add Site*, tên `vehicle.hoha.dev`.
2. Chuyển sang chế độ sửa code (Advanced / Code Editor), dán **phần chưa comment** của file mẫu (block `upstream` + `server` port 80), sửa upstream theo bảng 5.1 nếu cần.
3. Save → **Enable**. Nginx UI chạy `nginx -t` rồi reload; nếu báo lỗi cú pháp thì không có gì bị áp dụng.
4. Kiểm tra: `curl -I http://vehicle.hoha.dev/` → `200`.

### 5.3 Cấp chứng chỉ Let's Encrypt

1. Mở lại site → bật HTTPS / thêm server `listen 443 ssl` → bật **Encrypt with Let's Encrypt** (HTTP-01).
2. Nginx UI tự thêm `location /.well-known/acme-challenge` proxy về port challenge của nó (mặc định `9180`, theo https://nginxui.com/guide/config-cert.html). Đừng xóa location này: nó cần cho lần gia hạn tự động (mặc định khi còn ≤ 30 ngày).
3. Cấp xong, trang *Certificates* hiện đường dẫn `ssl_certificate` / `ssl_certificate_key`. Đặt đúng hai đường dẫn đó vào block `server` 443 (phần comment trong file mẫu), đổi `location /` của block 80 thành `return 301 https://$host$request_uri;`, Save.

Nếu DNS đi qua Cloudflare với proxy bật (mây cam) mà cấp chứng chỉ lỗi, chuyển bản ghi sang *DNS only* để cấp, bật proxy lại sau đó và đặt SSL mode **Full (strict)**.

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
- File Nginx UI mẫu (đã bỏ comment, chứng chỉ tự ký): `nginx -t` pass; proxy qua HTTPS/HTTP2 tới container trả 200 và 206 cho audio.

Chưa kiểm tra:

- Jenkins thật (chưa chạy `Jenkinsfile` trên Jenkins nào), GitHub webhook.
- Nginx UI thật: tên menu, vị trí file chứng chỉ, cách nó chèn location ACME.
- Cấp chứng chỉ Let's Encrypt thật cho `vehicle.hoha.dev`, DNS.
- `docker compose` plugin trên Linux (máy dev dùng bản standalone).
- iPad/Safari thật qua domain.
