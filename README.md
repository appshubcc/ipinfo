# Free IP-API & Geodata powered by Cloudflare Workers

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/appshubcc/ipinfo)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

基于 Cloudflare 边缘网络构建的轻量、极速的公网 IP 及地理位置查询服务。

无需搭建服务器、无需 GeoIP 数据库、无调用限额、无额外隐私困扰的第三方收费 API。只需 Fork 本项目，即可在 1 分钟内拥有一个免费每日 100000 次请求的专属 IP-API，使用案例：[Bettbox](https://github.com/appshubcc/Bettbox) - 首页网络检测Widget。（现已更改为第三方 API ）

Demo（仅作为演示使用，勿用于生产环境）：

https://ipinfo-preview-no-production-environment.appshub.cc/

https://ipinfo-preview-no-production-environment.appshub.cc/json

---

## ✨ 核心特性

- **低延迟**：依托 Cloudflare Anycast 全球边缘节点就近响应，冷启动时间以毫秒级计。
- **零依赖**：原生纯 JavaScript 实现，直接解析 Cloudflare 边缘标头与 `request.cf` 元数据。
- **原生 Emoji**：自动根据 ISO 国家代码计算 Unicode 偏移，无额外图片资源开销。
- **命令行**：自动检测 `curl` / `wget`，默认纯文本输出并追加换行符，终端体验干净利落。
- **全功能**：内置完整的跨域支持与预检（`OPTIONS`）处理与IP信息显示，前端应用无缝对接。

---

## 🚀 1 分钟快速部署你自己的 API

你可以选择以下任意一种方式将本项目部署到你的 Cloudflare 账户：

### 方案 A：一键快速部署（推荐）

点击下方部署按钮，按照引导授权 GitHub 并绑定 Cloudflare 账号，系统将自动 Fork 本仓库并完成首次部署上线：

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/appshubcc/ipinfo)

---

### 方案 B：Fork 本仓库并关联 Cloudflare（用于后续可能的更新）

1. 点击本页面右上角的 **Fork** 按钮，将本项目 Fork 到你的个人账号下。
2. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)。
3. 导航至 **Workers & Pages > Create application**，选择 **Pages / Workers** 中的 **Connect to Git**。
4. 选中你刚才 Fork 的 `ipinfo` 仓库并点击部署。
5. 部署成功后，Cloudflare 会为你分配一个 `*.workers.dev` 访问域名；你也可以在 **Triggers / Custom Domains** 中绑定你自己的独立域名。
6. 后续当上游仓库有更新时，在 GitHub 上点击 **Sync Fork** 即可自动触发边缘部署。

---

## API 调用说明

### 1. 获取公网 IP（纯文本）

适合脚本、CI/CD 流程、定时任务或终端自动化。

* **Endpoint**: `/`
* **Method**: `GET`
* **Response**: `text/plain`

```bash
curl https://your-domain.workers.dev

```

**返回内容**：

```text
104.28.192.1

```

---

### 2. 获取完整地理位置与网络信息（JSON）

适合前端面板、客户端网络状态监测、节点探测等场景。

* **Endpoint**: `/json`（或通过 Query 参数 `?format=json`，或携带 Header `Accept: application/json`）
* **Method**: `GET`
* **Response**: `application/json`

```bash
curl https://your-domain.workers.dev/json
```

**返回内容**：

```json
{
  "ip": "104.28.192.1",
  "flag": "🇺🇸",
  "country": "US",
  "countryRegion": "CA",
  "city": "San Jose",
  "region": "SJC",
  "latitude": "37.33820",
  "longitude": "-121.88630",
  "asn": "AS13335",
  "asOrganization": "CLOUDFLARENET"
}

```

#### 字段解释

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `ip` | String | 客户端公网 IPv4 或 IPv6 地址 |
| `flag` | String | 国家对应的 Emoji 国旗图标 |
| `country` | String | ISO 3166-1 alpha-2 两位国家简码 |
| `countryRegion` | String | 省份 / 州级行政区简码 |
| `city` | String | 客户端所属城市名称 |
| `region` | String | 承接该请求的 Cloudflare 边缘数据中心机场代号（Colo） |
| `latitude` | String | 估计纬度 |
| `longitude` | String | 估计经度 |
| `asn` | String | 自治系统编号（ASN） |
| `asOrganization` | String | ASN 归属组织/运营商名称 |

*注：响应头中同时附带 `x-client-ip: <IP>`，前端可直接从 Header 提取 IP。*

---

## 代码集成示例

### JavaScript (Fetch API)

```javascript
fetch("[https://your-domain.workers.dev/json")
  .then((res) => res.json())
  .then((data) => {
    console.log(`当前 IP: ${data.ip} (${data.flag} ${data.country} - ${data.city})`);
  });

```

### Dart / Flutter

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> fetchIpInfo() async {
  final response = await http.get(Uri.parse('https://your-domain.workers.dev/json'));
  if (response.statusCode == 200) {
    final Map<String, dynamic> data = jsonDecode(response.body);
    print('IP: ${data['ip']} | Colo: ${data['region']} \vert{} Org:${data['asOrganization']}');
  }
}

```

---

## 📄 开源许可证

本项目基于 [MIT License](https://www.google.com/search?q=LICENSE&utm_source=gemini) 协议发布，可自由 Fork、修改部署。

```

```
