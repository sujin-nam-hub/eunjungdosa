# 🐱 은정도사 웹사이트 (내가 비용 전부 부담 버전)

방문자는 **API 키 없이** 그냥 버튼만 누르면 AI 풀이가 나오고, **비용은 사이트 주인(나)의 API 키로 전부 결제**되는 구조예요.
API 키는 브라우저에 절대 노출되지 않고 **서버(백엔드)에만** 저장됩니다.

```
은정도사-web/
├─ index.html      ← 앱 화면 (방문자용, 키 입력창 없음)
├─ api/ai.js       ← 백엔드 함수 (내 API 키로 Claude 호출 + 사용량 제한)
├─ vercel.json
└─ README.md (이 파일)
```

---

## 🚀 배포 방법 (Vercel · 무료)

### 준비물
- GitHub 계정 (없으면 github.com 가입)
- Vercel 계정 (vercel.com → GitHub로 로그인)
- Anthropic API 키 (`sk-ant-...`, console.anthropic.com 에서 발급 + 크레딧 충전)

### 1단계 — 코드 올리기
가장 쉬운 방법 두 가지 중 하나:

**(A) GitHub에 업로드 후 Vercel 연결 (추천)**
1. github.com 에서 새 저장소(repository) 생성 → 이 `은정도사-web` 폴더의 파일들을 업로드
2. vercel.com → **Add New → Project** → 방금 만든 저장소 선택 → **Import**

**(B) Vercel CLI 사용 (터미널)**
```bash
npm i -g vercel
cd 은정도사-web
vercel
```

### 2단계 — API 키를 서버 환경변수로 등록 ⭐ (제일 중요)
Vercel 프로젝트 → **Settings → Environment Variables** 에서:
- **Name**: `ANTHROPIC_API_KEY`
- **Value**: 내 키 `sk-ant-...`
- 저장 후 **재배포(Redeploy)**

> ⚠️ 이 키는 서버에만 있고 방문자에게 절대 안 보여요. `index.html` 어디에도 키를 넣지 마세요.

### 3단계 — 접속
배포가 끝나면 `https://내프로젝트.vercel.app` 주소가 나와요. 폰·PC 어디서든 접속해서 AI 풀이/챗봇이 되는지 확인!

---

## 💸 비용 폭탄 막기 (꼭 설정하세요)

방문자가 많이 쓰면 **내 카드에서 결제**되므로, 상한선을 반드시 걸어두세요.

1. **Anthropic Console 지출 한도 (제일 확실)**
   console.anthropic.com → **Billing → Usage limits** 에서 **월 지출 한도**를 걸어두면, 그 이상은 절대 청구되지 않아요. (예: 월 $10)
   또는 **크레딧만 선불 충전**하고 자동충전을 꺼두면, 충전액을 다 쓰면 그냥 멈춰요.

2. **코드에 내장된 보호장치** (`api/ai.js` 상단에서 숫자만 바꾸면 됨)
   - `MAX_PER_IP = 20` → 한 사람(IP)이 1시간에 최대 20번
   - `MAX_TOKENS_CAP = 1600` → 답변 1건당 토큰 상한(1건당 비용 상한)

**대략 비용 감**: 사주 풀이 1회 ≈ 25~40원, 챗봇 답변 1회 ≈ 1~2원.
월 $10(약 1.4만원)이면 사주 풀이 300~500회 정도예요.

---

## 🔧 참고
- 모델은 `claude-sonnet-5`를 사용합니다. 더 저렴하게 하려면 `api/ai.js`의 model을 `claude-haiku-4-5`로 바꾸면 되지만 풀이 품질은 조금 낮아져요.
- 이미지 저장·복사·인쇄·입력 자동저장 등 나머지 기능은 그대로 동작합니다.
- 재미로 보는 콘텐츠임을 앱 안내에 유지하는 걸 권장해요. 🐾
