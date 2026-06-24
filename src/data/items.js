/**
 * Albion Online Item Identifier Registry
 * Image URL: https://render.albiononline.com/v1/item/{uniqueName}.png
 * Options: ?size=1-217  ?quality=1-5  Enchant: {uniqueName}@1 ~ @4
 */

export const RENDER_BASE = 'https://render.albiononline.com/v1/item';

export function itemIcon(uniqueName, { size = 64, quality = 1 } = {}) {
  return `${RENDER_BASE}/${uniqueName}.png?size=${size}&quality=${quality}`;
}

// ─── WEAPONS ────────────────────────────────────────────────────────────────

export const WEAPONS = {

  // Fire Staff
  fire: [
    { id: 'T8_MAIN_FIRESTAFF',           name: 'Fire Staff' },
    { id: 'T8_2H_FIRESTAFF',             name: 'Vendetta\'s Wrath' },
    { id: 'T8_2H_INFERNOSTAFF',          name: 'Infernal Staff' },
    { id: 'T8_MAIN_FIRESTAFF_KEEPER',    name: 'Wildfire Staff' },
    { id: 'T8_2H_FIRESTAFF_HELL',        name: 'Brimstone Staff' },
    { id: 'T8_2H_INFERNOSTAFF_MORGANA',  name: 'Blazing Staff' },
    { id: 'T8_2H_FIRE_RINGPAIR_AVALON',  name: 'Dawnsong' },
    { id: 'T8_MAIN_FIRESTAFF_CRYSTAL',   name: 'Crystal Fire Staff' },
  ],

  // Holy Staff
  holy: [
    { id: 'T8_2H_HOLYSTAFF',             name: 'Great Holy Staff' },
    { id: 'T8_MAIN_HOLYSTAFF',           name: 'Holy Staff' },
    { id: 'T8_2H_DIVINESTAFF',           name: 'Divine Staff' },
    { id: 'T8_MAIN_HOLYSTAFF_MORGANA',   name: 'Lifetouch Staff' },
    { id: 'T8_2H_HOLYSTAFF_HELL',        name: 'Fallen Staff' },
    { id: 'T8_2H_HOLYSTAFF_UNDEAD',      name: 'Redemption Staff' },
    { id: 'T8_MAIN_HOLYSTAFF_AVALON',    name: 'Hallowfall' },
    { id: 'T8_2H_HOLYSTAFF_CRYSTAL',     name: 'Crystal Great Holy Staff' },
  ],

  // Arcane Staff
  arcane: [
    { id: 'T8_MAIN_ARCANESTAFF',         name: 'Arcane Staff' },
    { id: 'T8_2H_ARCANESTAFF',           name: 'Great Arcane Staff' },
    { id: 'T8_2H_ENIGMATICSTAFF',        name: 'Enigmatic Staff' },
    { id: 'T8_MAIN_ARCANESTAFF_UNDEAD',  name: 'Witchwork Staff' },
    { id: 'T8_2H_ARCANESTAFF_HELL',      name: 'Occult Staff' },
    { id: 'T8_2H_ENIGMATICORB_MORGANA',  name: 'Malevolent Locus' },
    { id: 'T8_2H_ARCANE_RINGPAIR_AVALON',name: 'Evensong' },
    { id: 'T8_2H_ARCANESTAFF_CRYSTAL',   name: 'Crystal Great Arcane Staff' },
  ],

  // Frost Staff
  frost: [
    { id: 'T8_MAIN_FROSTSTAFF',          name: 'Frost Staff' },
    { id: 'T8_2H_GLACIALSTAFF',          name: 'Glacial Staff' },
    { id: 'T8_2H_FROSTSTAFF',            name: 'Great Frost Staff' },
    { id: 'T8_MAIN_FROSTSTAFF_KEEPER',   name: 'Hoarfrost Staff' },
    { id: 'T8_2H_ICEGAUNTLETS_HELL',     name: 'Icicle Staff' },
    { id: 'T8_2H_ICECRYSTAL_UNDEAD',     name: 'Permafrost Prism' },
    { id: 'T8_MAIN_FROSTSTAFF_AVALON',   name: 'Chillhowl' },
    { id: 'T8_2H_FROSTSTAFF_CRYSTAL',    name: 'Crystal Great Frost Staff' },
  ],

  // Cursed Staff
  cursed: [
    { id: 'T8_MAIN_CURSEDSTAFF',         name: 'Cursed Staff' },
    { id: 'T8_2H_DEMONICSTAFF',          name: 'Demonic Staff' },
    { id: 'T8_2H_CURSEDSTAFF',           name: 'Great Cursed Staff' },
    { id: 'T8_MAIN_CURSEDSTAFF_UNDEAD',  name: 'Lifecurse Staff' },
    { id: 'T8_2H_SKULLORB_HELL',         name: 'Cursed Skull' },
    { id: 'T8_2H_CURSEDSTAFF_MORGANA',   name: 'Damnation Staff' },
    { id: 'T8_MAIN_CURSEDSTAFF_AVALON',  name: 'Shadowcaller' },
    { id: 'T8_MAIN_CURSEDSTAFF_CRYSTAL', name: 'Crystal Cursed Staff' },
  ],

  // Nature Staff
  nature: [
    { id: 'T8_2H_NATURESTAFF',           name: 'Great Nature Staff' },
    { id: 'T8_2H_WILDSTAFF',             name: 'Wild Staff' },
    { id: 'T8_MAIN_NATURESTAFF',         name: 'Nature Staff' },
    { id: 'T8_MAIN_NATURESTAFF_KEEPER',  name: 'Druidic Staff' },
    { id: 'T8_2H_NATURESTAFF_HELL',      name: 'Blight Staff' },
    { id: 'T8_2H_NATURESTAFF_KEEPER',    name: 'Rampant Staff' },
    { id: 'T8_MAIN_NATURESTAFF_AVALON',  name: 'Ironroot Staff' },
    { id: 'T8_MAIN_NATURESTAFF_CRYSTAL', name: 'Crystal Nature Staff' },
  ],

  // Shapeshifter Staff
  shapeshifter: [
    { id: 'T8_2H_SHAPESHIFTER_SET1',     name: 'Prowling Staff' },
    { id: 'T8_2H_SHAPESHIFTER_SET2',     name: 'Rootbound Staff' },
    { id: 'T8_2H_SHAPESHIFTER_SET3',     name: 'Primal Staff' },
    { id: 'T8_2H_SHAPESHIFTER_MORGANA',  name: 'Bloodmoon Staff' },
    { id: 'T8_2H_SHAPESHIFTER_HELL',     name: 'Hellspawn Staff' },
    { id: 'T8_2H_SHAPESHIFTER_KEEPER',   name: 'Earthrune Staff' },
    { id: 'T8_2H_SHAPESHIFTER_AVALON',   name: 'Lightcaller' },
    { id: 'T8_2H_SHAPESHIFTER_CRYSTAL',  name: 'Crystal Shapeshifter Staff' },
  ],

  // Sword
  sword: [
    { id: 'T8_MAIN_SWORD',              name: 'Broadsword' },
    { id: 'T8_2H_CLAYMORE',             name: 'Claymore' },
    { id: 'T8_2H_DUALSWORD',            name: 'Dual Swords' },
    { id: 'T8_MAIN_SCIMITAR_MORGANA',   name: 'Clarent Blade' },
    { id: 'T8_2H_CLEAVER_HELL',         name: 'Carving Sword' },
    { id: 'T8_2H_DUALSCIMITAR_UNDEAD',  name: 'Galatine Pair' },
    { id: 'T8_2H_CLAYMORE_AVALON',      name: 'Kingmaker' },
    { id: 'T8_MAIN_SWORD_CRYSTAL',      name: 'Crystal Broadsword' },
  ],

  // Axe
  axe: [
    { id: 'T8_MAIN_AXE',               name: 'Battleaxe' },
    { id: 'T8_2H_AXE',                 name: 'The Hand of Khor' },
    { id: 'T8_2H_HALBERD',             name: 'Halberd' },
    { id: 'T8_2H_HALBERD_MORGANA',     name: 'Carrioncaller' },
    { id: 'T8_2H_SCYTHE_HELL',         name: 'Infernal Scythe' },
    { id: 'T8_2H_DUALAXE_KEEPER',      name: 'Bear Paws' },
    { id: 'T8_2H_AXE_AVALON',          name: 'Realmbreaker' },
    { id: 'T8_2H_SCYTHE_CRYSTAL',      name: 'Crystal Scythe' },
  ],

  // Mace
  mace: [
    { id: 'T8_MAIN_MACE',              name: 'Mace' },
    { id: 'T8_2H_MACE',               name: 'Heavy Mace' },
    { id: 'T8_2H_FLAIL',              name: 'Morning Star' },
    { id: 'T8_MAIN_ROCKMACE_KEEPER',   name: 'Bedrock Mace' },
    { id: 'T8_MAIN_MACE_HELL',         name: 'Incubus Mace' },
    { id: 'T8_2H_MACE_MORGANA',        name: 'Camlann Mace' },
    { id: 'T8_2H_DUALMACE_AVALON',     name: 'Oathkeepers' },
    { id: 'T8_MAIN_MACE_CRYSTAL',      name: 'Crystal Mace' },
  ],

  // Hammer
  hammer: [
    { id: 'T8_MAIN_HAMMER',            name: 'Hammer' },
    { id: 'T8_2H_HAMMER',             name: 'Great Hammer' },
    { id: 'T8_2H_POLEHAMMER',          name: 'Polehammer' },
    { id: 'T8_2H_HAMMER_UNDEAD',       name: 'Tombhammer' },
    { id: 'T8_2H_DUALHAMMER_HELL',     name: 'Forge Hammers' },
    { id: 'T8_2H_RAM_KEEPER',          name: 'Grovekeeper' },
    { id: 'T8_2H_HAMMER_AVALON',       name: 'Hand of Justice' },
    { id: 'T8_2H_HAMMER_CRYSTAL',      name: 'Crystal Great Hammer' },
  ],

  // Crossbow
  crossbow: [
    { id: 'T8_MAIN_1HCROSSBOW',        name: 'Light Crossbow' },
    { id: 'T8_2H_CROSSBOW',           name: 'Crossbow' },
    { id: 'T8_2H_CROSSBOWLARGE',       name: 'Heavy Crossbow' },
    { id: 'T8_2H_REPEATINGCROSSBOW_UNDEAD', name: 'Weeping Repeater' },
    { id: 'T8_2H_DUALCROSSBOW_HELL',   name: 'Boltcasters' },
    { id: 'T8_2H_CROSSBOWLARGE_MORGANA', name: 'Siegebow' },
    { id: 'T8_2H_CROSSBOW_CANNON_AVALON', name: 'Energy Shaper' },
    { id: 'T8_2H_DUALCROSSBOW_CRYSTAL', name: 'Crystal Boltcasters' },
  ],

  // Bow
  bow: [
    { id: 'T8_2H_BOW',               name: 'Bow' },
    { id: 'T8_2H_WARBOW',            name: 'Warbow' },
    { id: 'T8_2H_LONGBOW',           name: 'Longbow' },
    { id: 'T8_2H_LONGBOW_UNDEAD',    name: 'Whispering Bow' },
    { id: 'T8_2H_BOW_HELL',          name: 'Wailing Bow' },
    { id: 'T8_2H_BOW_KEEPER',        name: 'Bow of Badon' },
    { id: 'T8_2H_BOW_AVALON',        name: 'Mistpiercer' },
    { id: 'T8_2H_BOW_CRYSTAL',       name: 'Crystal Bow' },
  ],

  // Spear
  spear: [
    { id: 'T8_MAIN_SPEAR',           name: 'Spear' },
    { id: 'T8_2H_SPEAR',            name: 'Pike' },
    { id: 'T8_2H_GLAIVE',           name: 'Glaive' },
    { id: 'T8_MAIN_SPEAR_KEEPER',    name: 'Heron Spear' },
    { id: 'T8_2H_HARPOON_HELL',      name: 'Spirithunter' },
    { id: 'T8_2H_TRIDENT_UNDEAD',    name: 'Trinity Spear' },
    { id: 'T8_MAIN_SPEAR_LANCE_AVALON', name: 'Daybreaker' },
    { id: 'T8_2H_GLAIVE_CRYSTAL',    name: 'Crystal Glaive' },
  ],

  // Dagger
  dagger: [
    { id: 'T8_MAIN_DAGGER',          name: 'Dagger' },
    { id: 'T8_2H_DAGGERPAIR',        name: 'Dagger Pair' },
    { id: 'T8_2H_CLAWPAIR',         name: 'Claws' },
    { id: 'T8_MAIN_RAPIER_MORGANA',  name: 'Bloodletter' },
    { id: 'T8_MAIN_DAGGER_HELL',     name: 'Demonfang' },
    { id: 'T8_2H_DUALSICKLE_UNDEAD', name: 'Deathgivers' },
    { id: 'T8_2H_DAGGER_KATAR_AVALON', name: 'Bridled Fury' },
    { id: 'T8_2H_DAGGERPAIR_CRYSTAL',  name: 'Crystal Dagger Pair' },
  ],

  // Quarterstaff
  quarterstaff: [
    { id: 'T8_2H_QUARTERSTAFF',      name: 'Quarterstaff' },
    { id: 'T8_2H_IRONCLADEDSTAFF',   name: 'Iron-clad Staff' },
    { id: 'T8_2H_DOUBLEBLADEDSTAFF', name: 'Double Bladed Staff' },
    { id: 'T8_2H_COMBATSTAFF_MORGANA', name: 'Black Monk Stave' },
    { id: 'T8_2H_TWINSCYTHE_HELL',   name: 'Soulscythe' },
    { id: 'T8_2H_ROCKSTAFF_KEEPER',  name: 'Staff of Balance' },
    { id: 'T8_2H_QUARTERSTAFF_AVALON', name: 'Grailseeker' },
    { id: 'T8_2H_DOUBLEBLADEDSTAFF_CRYSTAL', name: 'Crystal Double Bladed Staff' },
  ],

  // War Gloves
  gloves: [
    { id: 'T8_2H_KNUCKLES_SET1',     name: 'Brawler Gloves' },
    { id: 'T8_2H_KNUCKLES_SET2',     name: 'Battle Bracers' },
    { id: 'T8_2H_KNUCKLES_SET3',     name: 'Spiked Gauntlets' },
    { id: 'T8_2H_KNUCKLES_KEEPER',   name: 'Ursine Maulers' },
    { id: 'T8_2H_KNUCKLES_HELL',     name: 'Hellfire Hands' },
    { id: 'T8_2H_KNUCKLES_MORGANA',  name: 'Ravenstrike Cestus' },
    { id: 'T8_2H_KNUCKLES_AVALON',   name: 'Fists of Avalon' },
    { id: 'T8_2H_KNUCKLES_CRYSTAL@2',name: 'Crystal War Gloves' },
  ],

  // Off-hand Shield
  shield: [
    { id: 'T8_OFF_SHIELD',           name: 'Shield' },
    { id: 'T8_OFF_TOWERSHIELD_UNDEAD', name: 'Sarcophagus' },
    { id: 'T8_OFF_SHIELD_HELL',      name: 'Caitiff Shield' },
    { id: 'T8_OFF_SPIKEDSHIELD_MORGANA', name: 'Facebreaker' },
    { id: 'T8_OFF_SHIELD_AVALON',    name: 'Astral Aegis' },
    { id: 'T8_OFF_SHIELD_KEEPER_ELDER',   name: "Elder's Unbreakable Ward" },
  ],

  // Torch (Off-hand)
  torch: [
    { id: 'T8_OFF_HORN_KEEPER',      name: 'Mistcaller' },
    { id: 'T8_OFF_JESTERCANE_HELL',  name: 'Leering Cane' },
    { id: 'T8_OFF_LAMP_UNDEAD',      name: 'Cryptcandle' },
    { id: 'T8_OFF_TALISMAN_AVALON',  name: 'Sacred Scepter' },
    { id: 'T8_OFF_TORCH_ELDER',          name: "Elder's Torch" },
    { id: 'T8_OFF_TORCH_MORGANA_ELDER',  name: "Elder's Blueflame Torch" },
  ],

  // Tome (Off-hand)
  tome: [
    { id: 'T8_OFF_BOOK',             name: 'Tome of Spells' },
    { id: 'T8_OFF_ORB_MORGANA',      name: 'Eye of Secrets' },
    { id: 'T8_OFF_DEMONSKULL_HELL',  name: 'Muisak' },
    { id: 'T8_OFF_TOTEM_KEEPER',     name: 'Taproot' },
    { id: 'T8_OFF_CENSER_AVALON',    name: 'Celestial Censer' },
    { id: 'T8_OFF_BOOK_UNDEAD_ELDER',    name: "Elder's Timelocked Grimoire" },
  ],
};

// ─── ARMOR — CHEST ──────────────────────────────────────────────────────────

export const ARMOR_CHEST = {
  cloth: [
    { id: 'T8_ARMOR_CLOTH_SET1',    name: 'Scholar Robe' },
    { id: 'T8_ARMOR_CLOTH_SET2',    name: 'Cleric Robe' },
    { id: 'T8_ARMOR_CLOTH_SET3',    name: 'Mage Robe' },
    { id: 'T8_ARMOR_CLOTH_KEEPER',  name: 'Druid Robe' },
    { id: 'T8_ARMOR_CLOTH_MORGANA', name: 'Cultist Robe' },
    { id: 'T8_ARMOR_CLOTH_HELL',    name: 'Fiend Robe' },
    { id: 'T8_ARMOR_CLOTH_FEY',     name: 'Feyscale Robe' },
    { id: 'T8_ARMOR_CLOTH_AVALON',  name: 'Robe of Purity' },
    { id: 'T8_ARMOR_CLOTH_ROYAL',   name: 'Royal Robe' },
  ],
  leather: [
    { id: 'T8_ARMOR_LEATHER_SET1',   name: 'Mercenary Jacket' },
    { id: 'T8_ARMOR_LEATHER_SET2',   name: 'Hunter Jacket' },
    { id: 'T8_ARMOR_LEATHER_SET3',   name: 'Assassin Jacket' },
    { id: 'T8_ARMOR_LEATHER_MORGANA',name: 'Stalker Jacket' },
    { id: 'T8_ARMOR_LEATHER_HELL',   name: 'Hellion Jacket' },
    { id: 'T8_ARMOR_LEATHER_FEY',    name: 'Mistwalker Jacket' },
    { id: 'T8_ARMOR_LEATHER_UNDEAD', name: 'Specter Jacket' },
    { id: 'T8_ARMOR_LEATHER_AVALON', name: 'Jacket of Tenacity' },
    { id: 'T8_ARMOR_LEATHER_ROYAL',  name: 'Royal Jacket' },
  ],
  plate: [
    { id: 'T8_ARMOR_PLATE_SET1',    name: 'Soldier Armor' },
    { id: 'T8_ARMOR_PLATE_SET2',    name: 'Knight Armor' },
    { id: 'T8_ARMOR_PLATE_SET3',    name: 'Guardian Armor' },
    { id: 'T8_ARMOR_PLATE_KEEPER',  name: 'Judicator Armor' },
    { id: 'T8_ARMOR_PLATE_HELL',    name: 'Demon Armor' },
    { id: 'T8_ARMOR_PLATE_FEY',     name: 'Duskweaver Armor' },
    { id: 'T8_ARMOR_PLATE_UNDEAD',  name: 'Graveguard Armor' },
    { id: 'T8_ARMOR_PLATE_AVALON',  name: 'Armor of Valor' },
    { id: 'T8_ARMOR_PLATE_ROYAL',   name: 'Royal Armor' },
  ],
};

// ─── ARMOR — HEAD ───────────────────────────────────────────────────────────

export const ARMOR_HEAD = {
  cloth: [
    { id: 'T8_HEAD_CLOTH_SET1',    name: 'Scholar Cowl' },
    { id: 'T8_HEAD_CLOTH_SET2',    name: 'Cleric Cowl' },
    { id: 'T8_HEAD_CLOTH_SET3',    name: 'Mage Cowl' },
    { id: 'T8_HEAD_CLOTH_KEEPER',  name: 'Druid Cowl' },
    { id: 'T8_HEAD_CLOTH_MORGANA', name: 'Cultist Cowl' },
    { id: 'T8_HEAD_CLOTH_HELL',    name: 'Fiend Cowl' },
    { id: 'T8_HEAD_CLOTH_FEY',     name: 'Feyscale Hat' },
    { id: 'T8_HEAD_CLOTH_AVALON',  name: 'Cowl of Purity' },
    { id: 'T8_HEAD_CLOTH_ROYAL',   name: 'Royal Cowl' },
  ],
  leather: [
    { id: 'T8_HEAD_LEATHER_SET1',   name: 'Mercenary Hood' },
    { id: 'T8_HEAD_LEATHER_SET2',   name: 'Hunter Hood' },
    { id: 'T8_HEAD_LEATHER_SET3',   name: 'Assassin Hood' },
    { id: 'T8_HEAD_LEATHER_MORGANA',name: 'Stalker Hood' },
    { id: 'T8_HEAD_LEATHER_HELL',   name: 'Hellion Hood' },
    { id: 'T8_HEAD_LEATHER_FEY',    name: 'Mistwalker Hood' },
    { id: 'T8_HEAD_LEATHER_UNDEAD', name: 'Specter Hood' },
    { id: 'T8_HEAD_LEATHER_AVALON', name: 'Hood of Tenacity' },
    { id: 'T8_HEAD_LEATHER_ROYAL',  name: 'Royal Hood' },
  ],
  plate: [
    { id: 'T8_HEAD_PLATE_SET1',    name: 'Soldier Helmet' },
    { id: 'T8_HEAD_PLATE_SET2',    name: 'Knight Helmet' },
    { id: 'T8_HEAD_PLATE_SET3',    name: 'Guardian Helmet' },
    { id: 'T8_HEAD_PLATE_KEEPER',  name: 'Judicator Helmet' },
    { id: 'T8_HEAD_PLATE_HELL',    name: 'Demon Helmet' },
    { id: 'T8_HEAD_PLATE_FEY',     name: 'Duskweaver Helmet' },
    { id: 'T8_HEAD_PLATE_UNDEAD',  name: 'Graveguard Helmet' },
    { id: 'T8_HEAD_PLATE_AVALON',  name: 'Helmet of Valor' },
    { id: 'T8_HEAD_PLATE_ROYAL',   name: 'Royal Helmet' },
  ],
};

// ─── ARMOR — SHOES ──────────────────────────────────────────────────────────

export const ARMOR_SHOES = {
  cloth: [
    { id: 'T8_SHOES_CLOTH_SET1',    name: 'Scholar Sandals' },
    { id: 'T8_SHOES_CLOTH_SET2',    name: 'Cleric Sandals' },
    { id: 'T8_SHOES_CLOTH_SET3',    name: 'Mage Sandals' },
    { id: 'T8_SHOES_CLOTH_KEEPER',  name: 'Druid Sandals' },
    { id: 'T8_SHOES_CLOTH_MORGANA', name: 'Cultist Sandals' },
    { id: 'T8_SHOES_CLOTH_HELL',    name: 'Fiend Sandals' },
    { id: 'T8_SHOES_CLOTH_FEY',     name: 'Feyscale Sandals' },
    { id: 'T8_SHOES_CLOTH_AVALON',  name: 'Sandals of Purity' },
    { id: 'T8_SHOES_CLOTH_ROYAL',   name: 'Royal Sandals' },
  ],
  leather: [
    { id: 'T8_SHOES_LEATHER_SET1',   name: 'Mercenary Shoes' },
    { id: 'T8_SHOES_LEATHER_SET2',   name: 'Hunter Shoes' },
    { id: 'T8_SHOES_LEATHER_SET3',   name: 'Assassin Shoes' },
    { id: 'T8_SHOES_LEATHER_MORGANA',name: 'Stalker Shoes' },
    { id: 'T8_SHOES_LEATHER_HELL',   name: 'Hellion Shoes' },
    { id: 'T8_SHOES_LEATHER_FEY',    name: 'Mistwalker Shoes' },
    { id: 'T8_SHOES_LEATHER_UNDEAD', name: 'Specter Shoes' },
    { id: 'T8_SHOES_LEATHER_AVALON', name: 'Shoes of Tenacity' },
    { id: 'T8_SHOES_LEATHER_ROYAL',  name: 'Royal Shoes' },
  ],
  plate: [
    { id: 'T8_SHOES_PLATE_SET1',    name: 'Soldier Boots' },
    { id: 'T8_SHOES_PLATE_SET2',    name: 'Knight Boots' },
    { id: 'T8_SHOES_PLATE_SET3',    name: 'Guardian Boots' },
    { id: 'T8_SHOES_PLATE_KEEPER',  name: 'Judicator Boots' },
    { id: 'T8_SHOES_PLATE_HELL',    name: 'Demon Boots' },
    { id: 'T8_SHOES_PLATE_FEY',     name: 'Duskweaver Boots' },
    { id: 'T8_SHOES_PLATE_UNDEAD',  name: 'Graveguard Boots' },
    { id: 'T8_SHOES_PLATE_AVALON',  name: 'Boots of Valor' },
    { id: 'T8_SHOES_PLATE_ROYAL',   name: 'Royal Boots' },
  ],
};

// ─── CAPES ──────────────────────────────────────────────────────────────────

export const CAPES = [
  { id: 'T8_CAPEITEM_FW_MARTLOCK',    name: 'Martlock Cape' },
  { id: 'T8_CAPEITEM_FW_THETFORD',    name: 'Thetford Cape' },
  { id: 'T8_CAPEITEM_FW_FORTSTERLING',name: 'Fort Sterling Cape' },
  { id: 'T8_CAPEITEM_FW_BRIDGEWATCH', name: 'Bridgewatch Cape' },
  { id: 'T8_CAPEITEM_FW_LYMHURST',    name: 'Lymhurst Cape' },
  { id: 'T8_CAPEITEM_FW_CAERLEON',    name: 'Caerleon Cape' },
  { id: 'T8_CAPEITEM_AVALON',         name: 'Avalonian Cape' },
  { id: 'T8_CAPEITEM_UNDEAD',         name: 'Undead Cape' },
  { id: 'T8_CAPEITEM_KEEPER',         name: 'Keeper Cape' },
  { id: 'T8_CAPEITEM_DEMON',          name: 'Demon Cape' },
  { id: 'T8_CAPEITEM_MORGANA',        name: 'Morgana Cape' },
  { id: 'T8_CAPEITEM_HERETIC',        name: 'Heretic Cape' },
  { id: 'T8_CAPEITEM_SMUGGLER',       name: "Smuggler's Cape" },
  { id: 'T8_CAPEITEM_FW_BRECILIEN',   name: 'Brecilien Cape' },
];

// ─── FOOD ───────────────────────────────────────────────────────────────────

export const FOOD = [
  // Soup
  { id: 'T5_MEAL_SOUP',             name: 'Soup' },
  // Omelette (Energy Regen)
  { id: 'T7_MEAL_OMELETTE',         name: 'Pork Omelette' },
  { id: 'T7_MEAL_OMELETTE@1',       name: 'Pork Omelette .1' },
  { id: 'T7_MEAL_OMELETTE@2',       name: 'Pork Omelette .2' },
  { id: 'T7_MEAL_OMELETTE@3',       name: 'Pork Omelette .3' },
  { id: 'T7_MEAL_OMELETTE_FISH',    name: 'Fish Omelette' },
  { id: 'T7_MEAL_OMELETTE_FISH@1',  name: 'Fish Omelette .1' },
  { id: 'T7_MEAL_OMELETTE_FISH@2',  name: 'Fish Omelette .2' },
  { id: 'T7_MEAL_OMELETTE_FISH@3',  name: 'Fish Omelette .3' },
  // Stew (HP Regen)
  { id: 'T8_MEAL_STEW',             name: 'Beef Stew' },
  { id: 'T8_MEAL_STEW@1',           name: 'Beef Stew .1' },
  { id: 'T8_MEAL_STEW@2',           name: 'Beef Stew .2' },
  { id: 'T8_MEAL_STEW@3',           name: 'Beef Stew .3' },
  { id: 'T8_MEAL_STEW_AVALON',      name: 'Avalonian Beef Stew' },
  { id: 'T8_MEAL_STEW_AVALON@1',    name: 'Avalonian Beef Stew .1' },
  { id: 'T8_MEAL_STEW_AVALON@2',    name: 'Avalonian Beef Stew .2' },
  { id: 'T8_MEAL_STEW_AVALON@3',    name: 'Avalonian Beef Stew .3' },
  { id: 'T8_MEAL_STEW_FISH',        name: 'Deadwater Eel Stew' },
  { id: 'T8_MEAL_STEW_FISH@1',      name: 'Deadwater Eel Stew .1' },
  { id: 'T8_MEAL_STEW_FISH@2',      name: 'Deadwater Eel Stew .2' },
  { id: 'T8_MEAL_STEW_FISH@3',      name: 'Deadwater Eel Stew .3' },
  // Sandwich (Max HP)
  { id: 'T8_MEAL_SANDWICH',         name: 'Beef Sandwich' },
  { id: 'T8_MEAL_SANDWICH@1',       name: 'Beef Sandwich .1' },
  { id: 'T8_MEAL_SANDWICH@2',       name: 'Beef Sandwich .2' },
  { id: 'T8_MEAL_SANDWICH@3',       name: 'Beef Sandwich .3' },
  { id: 'T8_MEAL_SANDWICH_AVALON',  name: 'Avalonian Beef Sandwich' },
  { id: 'T8_MEAL_SANDWICH_AVALON@1',name: 'Avalonian Beef Sandwich .1' },
  { id: 'T8_MEAL_SANDWICH_AVALON@2',name: 'Avalonian Beef Sandwich .2' },
  { id: 'T8_MEAL_SANDWICH_AVALON@3',name: 'Avalonian Beef Sandwich .3' },
  { id: 'T8_MEAL_SANDWICH_FISH',    name: 'Thunderfall Lurcher Sandwich' },
  { id: 'T8_MEAL_SANDWICH_FISH@1',  name: 'Thunderfall Lurcher Sandwich .1' },
  { id: 'T8_MEAL_SANDWICH_FISH@2',  name: 'Thunderfall Lurcher Sandwich .2' },
  { id: 'T8_MEAL_SANDWICH_FISH@3',  name: 'Thunderfall Lurcher Sandwich .3' },
  // Roast (Move Speed)
  { id: 'T7_MEAL_ROAST',            name: 'Roast Pork' },
  { id: 'T7_MEAL_ROAST@1',          name: 'Roast Pork .1' },
  { id: 'T7_MEAL_ROAST@2',          name: 'Roast Pork .2' },
  { id: 'T7_MEAL_ROAST@3',          name: 'Roast Pork .3' },
];

// ─── POTIONS ────────────────────────────────────────────────────────────────

export const POTIONS = [
  { id: 'T7_POTION_REVIVE',         name: 'Major Gigantify Potion' },
  { id: 'T5_POTION_REVIVE',         name: 'Gigantify Potion' },
  { id: 'T6_POTION_HEAL',           name: 'Major Healing Potion' },
  { id: 'T4_POTION_HEAL',           name: 'Healing Potion' },
  { id: 'T6_POTION_ENERGY',         name: 'Major Energy Potion' },
  { id: 'T4_POTION_ENERGY',         name: 'Energy Potion' },
  { id: 'T7_POTION_STONESKIN',       name: 'Major Resistance Potion' },
  { id: 'T5_POTION_STONESKIN',       name: 'Resistance Potion' },
  { id: 'T8_POTION_COOLDOWN',       name: 'Major Poison Potion' },
  { id: 'T8_POTION_CLEANSE',        name: 'Invisibility Potion' },
];

// ─── ALL ITEMS FLAT LIST ─────────────────────────────────────────────────────

export function getAllItems() {
  const all = [];
  Object.values(WEAPONS).forEach(arr => all.push(...arr));
  Object.values(ARMOR_CHEST).forEach(arr => all.push(...arr));
  Object.values(ARMOR_HEAD).forEach(arr => all.push(...arr));
  Object.values(ARMOR_SHOES).forEach(arr => all.push(...arr));
  all.push(...CAPES, ...FOOD, ...POTIONS);
  return all;
}
