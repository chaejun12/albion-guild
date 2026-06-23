# 알비온 길드 컴프 시트 — 제작 계획서

---

## 1. 핵심 데이터 구조

```
Sheet → Party[] → RoleSlot[]
                     ├ Build { weapon, head, armor, shoes, cape, offhand, food, potion }
                     ├ minIP
                     └ Player[] { discordId, nickname, currentIP, ctaStatus }
```

---

## 2. 권한 체계 (Discord OAuth2)

| 권한 | 디스코드 역할 | 가능 기능 |
|------|------------|---------|
| **Admin** | 운영진 역할 | 시트 생성·수정·삭제·복제·공유, 역할군·빌드 편집 |
| **Officer** | 파티장 역할 | 플레이어 강제 배치·제거, CTA 시작 |
| **Member** | 서버 인증 멤버 | 슬롯 신청·취소, CTA 출석 응답 |
| **Guest** | 비로그인 | 공개 시트 조회 전용 |

로그인 흐름: Discord OAuth2 → 서버 멤버십 확인 → 역할 매핑 → 세션 발급

---

## 3. 시트 관리 (Admin 전용)

메인 화면에 시트 카드 목록 표시 (이름 / 설명 / 공개여부 / 인원현황).

```
시트명    : [브림스톤 메인컴프]
설명      : [100인 CTA용      ]
공개 여부 : ◉ 공개  ○ 비공개
```

기능: 생성 / 수정 / 복제 / 삭제 / 공유 (카드 우클릭 메뉴)

---

## 4. 공유 시스템

```
[공유] → 링크 생성: https://xxxx.com/sheet/abcd1234
권한: ◉ 읽기 전용  ○ 수정 가능  ○ 관리자
```

비공개 시트는 Discord 로그인 + 서버 멤버만 접근.

---

## 5. 파티 시스템

- `+ 파티 추가` 버튼으로 동적 생성 (기존 1파티/2파티 고정 방식 탈피)
- 파티명 설정 가능: 메인클랩 / 백라인 / 탱커팀 / 봄스쿼드 등
- 파티별 색상 라벨 (기존 UI 컬러 바 유지)

---

## 6. 역할 슬롯 시스템

Admin이 `+ 역할군 추가` 로 자유 구성. 고정 목록 없음.

슬롯 생성 입력:
```
역할명: [딜러]   인원수: [8]   무기군: [화염 지팡이 ▾] → [브림스톤 ▾]
```

기본 예시: 콜러×1 / 디펜탱×2 / 클랩탱×2 / 딜러×8 / 힐러×2 / 서포터×2 / 봄스쿼드×4

---

## 7. 무기 DB

| 계열 | 무기 (예시) |
|------|-----------|
| Fire Staff | Brimstone, Wildfire, Infernal, Blazing |
| Holy Staff | Fallen Staff, Hallowfall, Lifetouch |
| Bow | Longbow, Wailing Bow, Bow of Badon |
| Crossbow | Siegebow, Weeping Repeater |
| Mace | One-Handed Mace, Grovekeeper, Morning Star |
| Hammer | Tombhammer, Great Hammer |
| Arcane | Locus, Malevolent Locus |

전체: Fire / Holy / Arcane / Frost / Cursed / Nature / Mace / Hammer / Sword / Axe / Bow / Crossbow / Spear / Dagger / Quarterstaff / War Gloves / Shapeshifter / Shield / Torch / Tome

---

## 8. 빌드 템플릿

역할 슬롯에 빌드 1개 고정. 마우스 오버 시 팝업 표시 (알비온2.PNG 장비창 재현).

```
무기: Brimstone Staff  머리: Scholar Cowl   갑옷: Cleric Robe
신발: Royal Sandals    망토: Martlock Cape  보조: Mistcaller
음식: Pork Omelette    포션: Resistance Potion
```

---

## 9. 플레이어 배치

**Member:** 빈 슬롯 클릭 → 신청(Discord 닉네임 자동) / 내 슬롯 우클릭 → 취소

**Admin/Officer:** 슬롯 클릭 → 닉네임 직접 입력 OR 길드원 목록 검색 (알비온4.PNG 모달 유지)  
배치된 슬롯 우클릭 → 제거 / 이동

---

## 10. 스펙 체크

신청 시 본인 작수(IP)를 직접 입력. 별도 검증 없이 슬롯에 표시만 함.

```
빈 슬롯 클릭 → 닉네임 + 현재 작수 입력 → 등록
  DarkAngelAgnus   850
  GuildMember02    630
```

---

## 11. 통계 패널 (우측 고정)

```
총 인원  84 / 100

역할별                  무기별 (상위 5)
  탱커    12              브림스톤    12
  딜러    46              시즈보우     8
  힐러    14              퍼마프로스트  5
  서포터  12              폴른         4
```

---

## 12. CTA 체크인

Admin/Officer가 CTA 시작 → 플레이어 응답.

```
[참석] [불참] [늦참]

참석  82명  82%  ████████████████
불참  11명  11%  ███
늦참   4명   4%  █
미응답  3명
```

선택 구현: Discord Bot DM으로 출석 알림 발송.

---

## 13. 기술 스택

| 영역 | 선택 |
|------|------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend/DB | Supabase (PostgreSQL) |
| 인증 | Discord OAuth2 (NextAuth.js) |
| 배포 | Vercel |

---

## 14. 구현 우선순위

| Phase | 기능 |
|-------|------|
| 1 | Discord 로그인, 권한 체계, 시트 CRUD |
| 2 | 파티·역할슬롯 편집, 무기 DB, 빌드 템플릿 |
| 3 | 플레이어 배치, 스펙 체크, 통계 패널 |
| 4 | CTA 체크인, 공유 링크, Discord DM 알림 |
