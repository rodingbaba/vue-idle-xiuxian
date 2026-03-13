// 地点配置
export const locations = [
  // 1. 练气期地点 (minLevel: 1, 最大修为 900)
  {
    id: 'newbie_village',
    name: '新手村',
    description: '灵气稀薄的凡人聚集地，适合初入修仙之道的修士。',
    minLevel: 1,
    spiritCost: 50,
    rewards: [
      { type: 'spirit_stone', chance: 0.3, amount: [1, 3] },
      { type: 'herb', chance: 0.3, amount: [1, 2] },
      { type: 'cultivation', chance: 0.2, amount: [5, 10] },
      { type: 'pill_fragment', chance: 0.2, amount: [1, 1] }
    ]
  },
  // 2. 筑基期地点 (minLevel: 10, 最大修为 2600)
  {
    id: 'celestial_mountain',
    name: '天阙峰',
    description: '云雾缭绕的仙山，传说是远古仙人讲道之地。',
    minLevel: 10,
    spiritCost: 800,
    rewards: [
      { type: 'spirit_stone', chance: 0.25, amount: [15, 30] },
      { type: 'herb', chance: 0.3, amount: [5, 10] },
      { type: 'cultivation', chance: 0.25, amount: [60, 120] },
      { type: 'pill_fragment', chance: 0.2, amount: [2, 4] }
    ]
  },
  // 3. 金丹期地点 (minLevel: 19, 最大修为 7000)
  {
    id: 'phoenix_valley',
    name: '凤凰谷',
    description: '常年被火焰环绕的神秘山谷，据说有凤凰遗留的道韵。',
    minLevel: 19,
    spiritCost: 4000,
    rewards: [
      { type: 'spirit_stone', chance: 0.25, amount: [80, 150] },
      { type: 'herb', chance: 0.3, amount: [15, 25] },
      { type: 'cultivation', chance: 0.25, amount: [200, 400] },
      { type: 'pill_fragment', chance: 0.2, amount: [4, 8] }
    ]
  },
  // 4. 元婴期地点 (minLevel: 28, 最大修为 16000)
  {
    id: 'dragon_abyss',
    name: '龙渊',
    description: '深不见底的神秘深渊，蕴含远古真龙的气息。',
    minLevel: 28,
    spiritCost: 20000,
    rewards: [
      { type: 'spirit_stone', chance: 0.25, amount: [400, 800] },
      { type: 'herb', chance: 0.3, amount: [30, 50] },
      { type: 'cultivation', chance: 0.25, amount: [800, 1600] },
      { type: 'pill_fragment', chance: 0.2, amount: [6, 12] }
    ]
  },
  // 5. 化神期地点 (minLevel: 37, 最大修为 35000)
  {
    id: 'ancient_ruins',
    name: '古神遗迹',
    description: '上古神明交战留下的废墟，危机四伏但机缘无数。',
    minLevel: 37,
    spiritCost: 80000,
    rewards: [
      { type: 'spirit_stone', chance: 0.25, amount: [1200, 2400] },
      { type: 'herb', chance: 0.3, amount: [40, 80] },
      { type: 'cultivation', chance: 0.25, amount: [2500, 5000] },
      { type: 'pill_fragment', chance: 0.2, amount: [8, 15] }
    ]
  },
  // 6. 返虚期地点 (minLevel: 46, 最大修为 80000)
  {
    id: 'void_rift',
    name: '虚空裂隙',
    description: '空间破碎之地，稍有不慎便会被卷入虚空乱流。',
    minLevel: 46,
    spiritCost: 250000,
    rewards: [
      { type: 'spirit_stone', chance: 0.25, amount: [4000, 8000] },
      { type: 'herb', chance: 0.3, amount: [80, 150] },
      { type: 'cultivation', chance: 0.25, amount: [8000, 15000] },
      { type: 'pill_fragment', chance: 0.2, amount: [15, 30] }
    ]
  },
  // 7. 合体期地点 (minLevel: 55, 最大修为 170000)
  {
    id: 'yin_yang_realm',
    name: '阴阳幻境',
    description: '天地阴阳交汇之处，极易让人迷失自我。',
    minLevel: 55,
    spiritCost: 800000,
    rewards: [
      { type: 'spirit_stone', chance: 0.25, amount: [15000, 30000] },
      { type: 'herb', chance: 0.3, amount: [150, 300] },
      { type: 'cultivation', chance: 0.25, amount: [25000, 50000] },
      { type: 'pill_fragment', chance: 0.2, amount: [30, 60] }
    ]
  },
  // 8. 大乘期地点 (minLevel: 64, 最大修为 450000)
  {
    id: 'star_river',
    name: '星河秘境',
    description: '位于九天之上的璀璨星河，蕴含天地本源之力。',
    minLevel: 64,
    spiritCost: 2500000,
    rewards: [
      { type: 'spirit_stone', chance: 0.25, amount: [50000, 100000] },
      { type: 'herb', chance: 0.3, amount: [300, 600] },
      { type: 'cultivation', chance: 0.25, amount: [80000, 160000] },
      { type: 'pill_fragment', chance: 0.2, amount: [60, 120] }
    ]
  },
  // 9. 渡劫期地点 (minLevel: 73, 最大修为 900000)
  {
    id: 'thunder_forbidden',
    name: '雷罚禁地',
    description: '天道降下雷罚之地，是渡劫期大能淬炼仙躯的最佳场所。',
    minLevel: 73,
    spiritCost: 8000000,
    rewards: [
      { type: 'spirit_stone', chance: 0.25, amount: [150000, 300000] },
      { type: 'herb', chance: 0.3, amount: [600, 1200] },
      { type: 'cultivation', chance: 0.25, amount: [250000, 500000] },
      { type: 'pill_fragment', chance: 0.2, amount: [120, 250] }
    ]
  },
  // 10. 仙人境地点 (minLevel: 82, 最大修为 2600000)
  {
    id: 'ascension_pool',
    name: '升仙池',
    description: '洗去凡尘之气的化仙池，池水全由仙气液化而成。',
    minLevel: 82,
    spiritCost: 25000000,
    rewards: [
      { type: 'spirit_stone', chance: 0.25, amount: [500000, 1000000] },
      { type: 'herb', chance: 0.3, amount: [1200, 2500] },
      { type: 'cultivation', chance: 0.25, amount: [800000, 1500000] },
      { type: 'pill_fragment', chance: 0.2, amount: [250, 500] }
    ]
  },
  // 11. 真仙境地点 (minLevel: 91, 最大修为 7000000)
  {
    id: 'true_spirit_world',
    name: '真灵界',
    description: '真仙界的一处碎片，栖息着强大的远古真灵。',
    minLevel: 91,
    spiritCost: 80000000,
    rewards: [
      { type: 'spirit_stone', chance: 0.25, amount: [1500000, 3000000] },
      { type: 'herb', chance: 0.3, amount: [2500, 5000] },
      { type: 'cultivation', chance: 0.25, amount: [2500000, 5000000] },
      { type: 'pill_fragment', chance: 0.2, amount: [500, 1000] }
    ]
  },
  // 12. 金仙境地点 (minLevel: 100, 最大修为 16000000)
  {
    id: 'nine_heavens',
    name: '九重天',
    description: '仙界的权力中心外围，到处都是金仙级别的洞府。',
    minLevel: 100,
    spiritCost: 250000000,
    rewards: [
      { type: 'spirit_stone', chance: 0.25, amount: [5000000, 10000000] },
      { type: 'herb', chance: 0.3, amount: [5000, 10000] },
      { type: 'cultivation', chance: 0.25, amount: [8000000, 15000000] },
      { type: 'pill_fragment', chance: 0.2, amount: [1000, 2000] }
    ]
  },
  // 13. 太乙境地点 (minLevel: 109, 最大修为 52000000)
  {
    id: 'taiyi_domain',
    name: '太乙仙域',
    description: '太乙玉仙掌控的庞大星域，蕴含大道的碎片。',
    minLevel: 109,
    spiritCost: 800000000,
    rewards: [
      { type: 'spirit_stone', chance: 0.25, amount: [15000000, 30000000] },
      { type: 'herb', chance: 0.3, amount: [10000, 20000] },
      { type: 'cultivation', chance: 0.25, amount: [25000000, 50000000] },
      { type: 'pill_fragment', chance: 0.2, amount: [2000, 4000] }
    ]
  },
  // 14. 大罗境地点 (minLevel: 118, 最大修为 140000000)
  {
    id: 'daluo_heaven',
    name: '大罗天',
    description: '诸天万界的顶点，唯有大罗金仙方可踏足的永恒之地。',
    minLevel: 118,
    spiritCost: 2500000000,
    rewards: [
      { type: 'spirit_stone', chance: 0.25, amount: [50000000, 100000000] },
      { type: 'herb', chance: 0.3, amount: [20000, 40000] },
      { type: 'cultivation', chance: 0.25, amount: [80000000, 150000000] },
      { type: 'pill_fragment', chance: 0.2, amount: [4000, 8000] }
    ]
  }
]

// 计算实际获取概率（考虑幸运值）
export const calculateRewardChance = (baseChance, luck = 1) => {
  return Math.min(baseChance * luck, 1) // 确保概率不超过100%
}