import { WEAPONS, ARMOR_HEAD, ARMOR_CHEST, ARMOR_SHOES, CAPES, FOOD, POTIONS } from '@/src/data/items'

type ItemList = { id: string; name: string }[]

// ── 로컬 아이콘 경로 맵 ────────────────────────────────────────────────────────
const pathMap: Record<string, string> = {}

const W = WEAPONS as Record<string, ItemList>
Object.entries(W).forEach(([cat, items]) => {
  items.forEach(item => { pathMap[item.id] = `/icons/weapons/${cat}/${item.id}.png` })
})

const AH = ARMOR_HEAD as Record<string, ItemList>
Object.entries(AH).forEach(([, items]) => {
  items.forEach(item => { pathMap[item.id] = `/icons/armor/head/${item.id}.png` })
})

const AC = ARMOR_CHEST as Record<string, ItemList>
Object.entries(AC).forEach(([, items]) => {
  items.forEach(item => { pathMap[item.id] = `/icons/armor/chest/${item.id}.png` })
})

const AS = ARMOR_SHOES as Record<string, ItemList>
Object.entries(AS).forEach(([, items]) => {
  items.forEach(item => { pathMap[item.id] = `/icons/armor/shoes/${item.id}.png` })
})

;(CAPES as ItemList).forEach(item => { pathMap[item.id] = `/icons/capes/${item.id}.png` })
;(FOOD as ItemList).forEach(item => { pathMap[item.id] = `/icons/food/${item.id}.png` })
;(POTIONS as ItemList).forEach(item => { pathMap[item.id] = `/icons/potions/${item.id}.png` })

// 로컬 경로 우선, 없으면 렌더 API fallback
export function getIconUrl(itemId: string): string {
  return pathMap[itemId] ?? `https://render.albiononline.com/v1/item/${itemId}.png?size=64`
}

// ── 양손 무기 감지 ────────────────────────────────────────────────────────────
// ID에 _2H_ 포함 = 양손 (MAIN = 한손, OFF = 보조 전용)
export function isTwoHanded(weaponId: string | undefined): boolean {
  if (!weaponId) return false
  return weaponId.includes('_2H_')
}
