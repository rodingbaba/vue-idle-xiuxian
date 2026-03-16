import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import { GameDB } from './db'
import { pillRecipes, tryCreatePill, calculatePillEffect } from '../plugins/pills'
import { encryptData, decryptData, validateData } from '../plugins/crypto'
import { getRealmName, getRealmLength } from '../plugins/realm'

let saveTimeout = null;

export const usePlayerStore = defineStore('player', {
  state: () => ({
    isNewPlayer: true,
    isGMMode: false,
    isDarkMode: localStorage.getItem('darkMode') === 'true',
    activePet: null,
    petEssence: 0,
    petConfig: {
      rarityMap: {
        divine: { name: '神品', color: '#FF0000', probability: 0.02, essenceBonus: 50 },
        celestial: { name: '仙品', color: '#FFD700', probability: 0.08, essenceBonus: 30 },
        mystic: { name: '玄品', color: '#9932CC', probability: 0.15, essenceBonus: 20 },
        spiritual: { name: '灵品', color: '#1E90FF', probability: 0.25, essenceBonus: 10 },
        mortal: { name: '凡品', color: '#32CD32', probability: 0.5, essenceBonus: 5 }
      }
    },
    name: '无名修士',
    nameChangeCount: 0,
    level: 1,
    realm: '练气期一层',
    cultivation: 0,
    maxCultivation: 100,
    spirit: 0,
    spiritRate: 1,
    luck: 1,
    cultivationRate: 1,
    herbRate: 1,
    alchemyRate: 1,
    pills: [],
    pillFragments: {},
    pillRecipes: [],
    activeEffects: [],
    pillsCrafted: 0,
    pillsConsumed: 0,
    baseAttributes: { attack: 10, health: 100, defense: 5, speed: 10 },
    combatAttributes: { critRate: 0, comboRate: 0, counterRate: 0, stunRate: 0, dodgeRate: 0, vampireRate: 0 },
    combatResistance: { critResist: 0, comboResist: 0, counterResist: 0, stunResist: 0, dodgeResist: 0, vampireResist: 0 },
    specialAttributes: { healBoost: 0, critDamageBoost: 0, critDamageReduce: 0, finalDamageBoost: 0, finalDamageReduce: 0, combatBoost: 0, resistanceBoost: 0 },
    spiritStones: 0,
    reinforceStones: 0,
    refinementStones: 0,
    herbs: [], // 灵草堆叠数组 [{ id, quality, count, ... }]
    items: [], // 物品堆叠数组
    artifacts: [],
    equippedArtifacts: {
      weapon: null, head: null, body: null, legs: null, feet: null, shoulder: null,
      hands: null, wrist: null, necklace: null, ring1: null, ring2: null, belt: null, artifact: null
    },
    artifactBonuses: {
      attack: 0, health: 0, defense: 0, speed: 0,
      critRate: 0, comboRate: 0, counterRate: 0, stunRate: 0, dodgeRate: 0, vampireRate: 0,
      critResist: 0, comboResist: 0, counterResist: 0, stunResist: 0, dodgeResist: 0, vampireResist: 0,
      healBoost: 0, critDamageBoost: 0, critDamageReduce: 0, finalDamageBoost: 0, finalDamageReduce: 0, combatBoost: 0, resistanceBoost: 0,
      cultivationRate: 1, spiritRate: 1
    },
    totalCultivationTime: 0, breakthroughCount: 0, explorationCount: 0, itemsFound: 0, eventTriggered: 0, unlockedPillRecipes: 0,
    dungeonDifficulty: 1, dungeonHighestFloor: 0, dungeonHighestFloor_2: 0, dungeonHighestFloor_5: 0, dungeonHighestFloor_10: 0, dungeonHighestFloor_100: 0,
    dungeonLastFailedFloor: 0, dungeonTotalRuns: 0, dungeonBossKills: 0, dungeonEliteKills: 0, dungeonTotalKills: 0, dungeonDeathCount: 0, dungeonTotalRewards: 0,
    autoSellQualities: [], autoReleaseRarities: [],
    wishlistEnabled: false, selectedWishEquipQuality: null, selectedWishPetRarity: null,
    unlockedRealms: ['练气一层'], unlockedLocations: ['新手村'], unlockedSkills: [], completedAchievements: [],
    achievementUnlockTimes: {}
  }),
  getters: {
    getPetBonus() {
      if (!this.activePet)
        return {
          attack: 0, defense: 0, health: 0,
          critRate: 0, comboRate: 0, counterRate: 0, stunRate: 0, dodgeRate: 0, vampireRate: 0,
          critResist: 0, comboResist: 0, counterResist: 0, stunResist: 0, dodgeResist: 0, vampireResist: 0,
          healBoost: 0, critDamageBoost: 0, critDamageReduce: 0, finalDamageBoost: 0, finalDamageReduce: 0, combatBoost: 0, resistanceBoost: 0
        }
      const qualityBonusMap = { divine: 0.15, celestial: 0.12, mystic: 0.09, spiritual: 0.06, mortal: 0.03 }
      const starBonusPerQuality = { divine: 0.02, celestial: 0.01, mystic: 0.01, spiritual: 0.01, mortal: 0.01 }
      const baseBonus = qualityBonusMap[this.activePet.rarity] || 0
      const starBonus = (this.activePet.star || 0) * (starBonusPerQuality[this.activePet.rarity] || 0)
      const levelBonus = ((this.activePet.level || 1) - 1) * (baseBonus * 0.1)
      const totalBonus = baseBonus + starBonus + levelBonus
      const phase = Math.floor((this.activePet.star || 0) / 5)
      const phaseBonus = phase * (baseBonus * 0.5)
      const finalBonus = totalBonus + phaseBonus
      const combatBonus = finalBonus * 0.5
      return {
        attack: finalBonus, defense: finalBonus, health: finalBonus,
        critRate: combatBonus, comboRate: combatBonus, counterRate: combatBonus, stunRate: combatBonus, dodgeRate: combatBonus, vampireRate: combatBonus,
        critResist: combatBonus, comboResist: combatBonus, counterResist: combatBonus, stunResist: combatBonus, dodgeResist: combatBonus, vampireResist: combatBonus,
        healBoost: combatBonus, critDamageBoost: combatBonus, critDamageReduce: combatBonus, finalDamageBoost: combatBonus, finalDamageReduce: combatBonus, combatBoost: combatBonus, resistanceBoost: combatBonus
      }
    }
  },
  actions: {
    updateHtmlDarkMode(isDarkMode) {
      const htmlEl = document.documentElement
      if (isDarkMode) htmlEl.classList.add('dark')
      else htmlEl.classList.remove('dark')
    },
    async initializePlayer() {
      try {
        const savedData = await GameDB.getData('playerData')
        if (savedData) {
          const decryptedData = decryptData(savedData)
          if (decryptedData && validateData(decryptedData)) {
            const stackedHerbs = [];
            (decryptedData.herbs || []).forEach(h => {
              if (!h) return;
              const exist = stackedHerbs.find(x => x.id === h.id && x.quality === h.quality);
              if (exist) { exist.count = (exist.count || 1) + (h.count || 1); }
              else { stackedHerbs.push({ ...h, count: h.count || 1 }); }
            });
            decryptedData.herbs = stackedHerbs;

            const stackedItems = [];
            (decryptedData.items || []).forEach(item => {
              if (!item) return;
              if (item.type === 'pill') {
                const exist = stackedItems.find(x => x.type === 'pill' && x.name === item.name);
                if (exist) { exist.count = (exist.count || 1) + (item.count || 1); }
                else { stackedItems.push({ ...item, count: item.count || 1 }); }
              } else {
                stackedItems.push(item);
              }
            });
            decryptedData.items = stackedItems;

            Object.assign(this.$state, decryptedData)
          } else {
            console.error('存档数据验证失败，使用初始数据')
          }
        }
      } catch (error) {
        console.error('加载存档失败:', error)
      }
      this.isDarkMode = localStorage.getItem('darkMode') === 'true'
      this.updateHtmlDarkMode(this.isDarkMode)
    },
    toggle() {
      this.isDarkMode = !this.isDarkMode
      localStorage.setItem('darkMode', this.isDarkMode)
      this.updateHtmlDarkMode(this.isDarkMode)
      this.saveData(true)
    },

    async saveData(immediate = false) {
      if (immediate) {
        if (saveTimeout) clearTimeout(saveTimeout)
        await this._performSave()
        return
      }
      if (saveTimeout) clearTimeout(saveTimeout)
      saveTimeout = setTimeout(async () => {
        await this._performSave()
      }, 5000)
    },

    async _performSave() {
      try {
        if (this.items) {
          const keepItems = [];
          this.items.forEach(item => {
            const isUselessPet = item.type === 'pet' && (!this.activePet || this.activePet.id !== item.id) && ['mortal', 'spiritual'].includes(item.rarity);
            if (isUselessPet) { this.petEssence += 10; }
            else { keepItems.push(item); }
          });
          this.items = keepItems;
        }

        const rawState = JSON.parse(JSON.stringify(this.$state))
        const encryptedData = encryptData(rawState)
        if (encryptedData) { await GameDB.setData('playerData', encryptedData) }
      } catch (error) {
        console.error('数据保存失败:', error)
      }
    },

    async exportData() {
      try { return await GameDB.getData('playerData') } catch (error) { throw error }
    },
    async importData(encryptedData) {
      try {
        await GameDB.setData('playerData', encryptedData)
        this.$reset()
        await this.initializePlayer()
      } catch (error) { throw error }
    },
    async clearData() {
      try { await GameDB.setData('playerData', null) } catch (error) { throw error }
    },
    gainSpirit(amount) {
      this.spirit += amount * this.spiritRate
      this.saveData()
    },
    cultivate(amount) {
      const numAmount = Number(String(amount).replace(/[^0-9.-]/g, '')) || 0
      this.cultivation = Number(String(this.cultivation).replace(/[^0-9.-]/g, '')) || 0
      this.cultivation += numAmount
      this.totalCultivationTime += 1
      if (this.cultivation >= this.maxCultivation) this.tryBreakthrough()
      this.saveData()
    },
    tryBreakthrough() {
      const realmsLength = getRealmLength()
      if (this.level < realmsLength) {
        const nextRealm = getRealmName(this.level)
        this.level += 1
        this.realm = nextRealm.name
        this.maxCultivation = nextRealm.maxCultivation
        this.cultivation = 0
        this.breakthroughCount += 1
        if (!this.unlockedRealms.includes(nextRealm.name)) this.unlockedRealms.push(nextRealm.name)
        this.spirit += 100 * this.level
        this.spiritRate *= 1.2
        this.saveData()
        return true
      }
      return false
    },

    gainItem(item) {
      if (item.type === 'equipment' && this.autoSellQualities && this.autoSellQualities.includes(item.quality)) {
        const stoneReward = item.quality === 'mortal' ? 1 : (item.quality === 'spiritual' ? 2 : 5);
        this.reinforceStones += stoneReward;
      } else if (item.type === 'pet' && this.autoReleaseRarities && this.autoReleaseRarities.includes(item.rarity)) {
        this.petEssence += 10;
      } else if (item.type === 'pill') {
        const exist = this.items.find(i => i.type === 'pill' && i.name === item.name);
        if (exist) exist.count = (exist.count || 1) + (item.count || 1);
        else this.items.push(markRaw({ ...item, count: item.count || 1 }));
      } else {
        this.items.push(markRaw(item));
      }
      this.itemsFound++;
      this.saveData();
    },

    // ==========================================
    // 【新增功能】：出售灵草与炼化灵草
    // ==========================================
    sellHerb(herbId, quality, count) {
      const index = this.herbs.findIndex(h => h.id === herbId && h.quality === quality);
      if (index > -1 && this.herbs[index].count >= count) {
        const herb = this.herbs[index];
        // 灵石收益 = 灵草基础价值 * 数量 * 适当放大倍率
        const stoneValue = (herb.value || 10) * count * 5;
        this.spiritStones += stoneValue;
        this.herbs[index].count -= count;
        if (this.herbs[index].count <= 0) this.herbs.splice(index, 1);
        this.saveData(true);
        return { success: true, message: `成功出售，获得${stoneValue}灵石` };
      }
      return { success: false, message: '灵草数量不足' };
    },

    consumeHerb(herbId, quality, count) {
      const index = this.herbs.findIndex(h => h.id === herbId && h.quality === quality);
      if (index > -1 && this.herbs[index].count >= count) {
        const herb = this.herbs[index];
        // 修为收益 = 灵草基础价值 * 数量 * 当前境界等级 (境界越高吸收能力越强)
        const gain = (herb.value || 10) * count * (this.level * 5);
        this.cultivate(gain);
        this.herbs[index].count -= count;
        if (this.herbs[index].count <= 0) this.herbs.splice(index, 1);
        this.saveData(true);
        return { success: true, message: `炼化成功，获得${gain}点修为` };
      }
      return { success: false, message: '灵草数量不足' };
    },
    // ==========================================

    async sellEquipment(equipment) {
      const index = this.items.findIndex(i => i.id === equipment.id)
      if (index === -1) return { success: false, message: '装备不存在' }
      return new Promise(resolve => {
        const worker = new Worker(new URL('../workers/equipment.js', import.meta.url))
        worker.onmessage = e => {
          const { stoneAmount, itemId } = e.data
          this.reinforceStones += stoneAmount
          const index = this.items.findIndex(i => i.id === itemId)
          if (index > -1) this.items.splice(index, 1)
          this.saveData(true)
          worker.terminate()
          resolve({ success: true, message: `成功卖出装备，获得${stoneAmount}个强化石` })
        }
        worker.postMessage({ type: 'single', equipment: { id: equipment.id, quality: equipment.quality } })
      })
    },
    async batchSellEquipments(quality = null, equipmentType = null) {
      return new Promise(resolve => {
        const worker = new Worker(new URL('../workers/equipment.js', import.meta.url))
        worker.onmessage = e => {
          const { totalStones, itemsToRemove, count } = e.data
          this.reinforceStones += totalStones
          this.items = this.items.filter(item => !itemsToRemove.includes(item.id))
          this.saveData(true)
          worker.terminate()
          resolve({ success: true, message: `成功卖出${count}件装备，获得${totalStones}个强化石` })
        }
        const itemsToSell = this.items
          .filter(item => item && item.type !== 'pill' && item.type !== 'pet')
          .filter(item => (!equipmentType || item.type === equipmentType) && (!quality || item.quality === quality))
          .map(item => ({ id: item.id, type: item.type, quality: item.quality }))
        worker.postMessage({ type: 'batch', items: JSON.parse(JSON.stringify(itemsToSell)), quality, equipmentType })
      })
    },

    usePill(pill) {
      const index = this.items.findIndex(i => i.type === 'pill' && i.name === pill.name)
      if (index > -1) {
        const now = Date.now()
        this.activeEffects.push({
          ...pill.effect,
          startTime: now,
          endTime: now + pill.effect.duration * 1000
        })

        if (this.items[index].count > 1) {
          this.items[index].count--;
        } else {
          this.items.splice(index, 1)
        }

        this.pillsConsumed++
        this.activeEffects = this.activeEffects.filter(effect => effect.endTime > now)
        this.saveData(true)
        return { success: true, message: '使用丹药成功' }
      }
      return { success: false, message: '丹药不足' }
    },

    usePet(pet) {
      if (!this.activePet) return this.deployPet(pet)
      if (this.activePet.id === pet.id) return this.recallPet()
      this.recallPet()
      return this.deployPet(pet)
    },
    recallPet() {
      if (!this.activePet) return { success: false, message: '当前没有出战的灵宠' }
      this.resetPetBonuses()
      this.activePet = null
      this.saveData(true)
      return { success: true, message: '召回成功' }
    },
    deployPet(pet) {
      if (this.activePet) this.recallPet()
      this.activePet = pet
      this.applyPetBonuses()
      this.saveData(true)
      return { success: true, message: '出战成功' }
    },
    resetPetBonuses() {
      const pb = this.activePet.combatAttributes
      this.baseAttributes.attack -= pb.attack
      this.baseAttributes.defense -= pb.defense
      this.baseAttributes.health -= pb.health
      this.baseAttributes.speed -= pb.speed
      Object.keys(this.combatAttributes).forEach(k => this.combatAttributes[k] -= (pb[k] || 0))
      Object.keys(this.combatResistance).forEach(k => this.combatResistance[k] -= (pb[k] || 0))
      Object.keys(this.specialAttributes).forEach(k => this.specialAttributes[k] -= (pb[k] || 0))
    },
    applyPetBonuses() {
      if (!this.activePet) return
      const pb = this.activePet.combatAttributes
      this.baseAttributes.attack += pb.attack
      this.baseAttributes.defense += pb.defense
      this.baseAttributes.health += pb.health
      this.baseAttributes.speed += pb.speed
      Object.keys(this.combatAttributes).forEach(k => this.combatAttributes[k] += (pb[k] || 0))
      Object.keys(this.combatResistance).forEach(k => this.combatResistance[k] += (pb[k] || 0))
      Object.keys(this.specialAttributes).forEach(k => this.specialAttributes[k] += (pb[k] || 0))
    },
    equipArtifact(artifact, slot) {
      if (artifact.requiredRealm && this.level < artifact.requiredRealm) return { success: false, message: '境界不足' }
      if (this.equippedArtifacts[slot]) this.unequipArtifact(slot)
      const index = this.items.findIndex(item => item.id === artifact.id)
      if (index !== -1) this.items.splice(index, 1)
      this.equippedArtifacts[slot] = artifact
      if (artifact.stats) {
        Object.entries(artifact.stats).forEach(([key, value]) => {
          if (this.artifactBonuses[key] !== undefined) {
            this.artifactBonuses[key] += value
            if (key in this.baseAttributes) this.baseAttributes[key] += value
            else if (key in this.combatAttributes) this.combatAttributes[key] = Math.min(1, this.combatAttributes[key] + value)
            else if (key in this.combatResistance) this.combatResistance[key] = Math.min(1, this.combatResistance[key] + value)
            else if (key in this.specialAttributes) this.specialAttributes[key] += value
          }
        })
      }
      this.saveData(true)
      return { success: true, message: '装备成功' }
    },
    unequipArtifact(slot) {
      const artifact = this.equippedArtifacts[slot]
      if (artifact) {
        if (artifact.stats) {
          Object.entries(artifact.stats).forEach(([key, value]) => {
            if (this.artifactBonuses[key] !== undefined) {
              this.artifactBonuses[key] -= value
              if (key in this.baseAttributes) this.baseAttributes[key] -= value
              else if (key in this.combatAttributes) this.combatAttributes[key] = Math.max(0, this.combatAttributes[key] - value)
              else if (key in this.combatResistance) this.combatResistance[key] = Math.max(0, this.combatResistance[key] - value)
              else if (key in this.specialAttributes) this.specialAttributes[key] -= value
            }
          })
        }
        this.items.push(markRaw(artifact))
        this.equippedArtifacts[slot] = null
        this.saveData(true)
        return true
      }
      return false
    },
    getArtifactBonus(type) { return this.artifactBonuses[type] || 1 },
    gainPillFragment(recipeId) {
      if (!this.pillFragments[recipeId]) this.pillFragments[recipeId] = 0
      this.pillFragments[recipeId]++
      const recipe = pillRecipes.find(r => r.id === recipeId)
      if (recipe && this.pillFragments[recipeId] >= recipe.fragmentsNeeded) {
        this.pillFragments[recipeId] -= recipe.fragmentsNeeded
        if (!this.pillRecipes.includes(recipeId)) {
          this.pillRecipes.push(recipeId)
          this.unlockedPillRecipes++
        }
      }
      this.saveData()
    },

    craftPill(recipeId) {
      const recipe = pillRecipes.find(r => r.id === recipeId)
      if (!recipe || !this.pillRecipes.includes(recipeId)) return { success: false, message: '未掌握丹方' }

      const fragments = this.pillFragments[recipeId] || 0

      for (const material of recipe.materials) {
        const totalCount = this.herbs.filter(h => h.id === material.herb).reduce((sum, h) => sum + (h.count || 1), 0)
        if (totalCount < material.count) return { success: false, message: '材料不足' }
      }

      const grade = pillRecipes.find(r => r.id === recipeId)?.grade;
      const successRate = grade === 'grade1' ? 0.9 : 0.5;

      if (Math.random() <= 0.9 * this.luck * this.alchemyRate) {
        recipe.materials.forEach(material => {
          let needed = material.count;
          for (let i = this.herbs.length - 1; i >= 0; i--) {
            if (this.herbs[i].id === material.herb) {
              if (this.herbs[i].count > needed) {
                this.herbs[i].count -= needed;
                needed = 0;
                break;
              } else {
                needed -= (this.herbs[i].count || 1);
                this.herbs.splice(i, 1);
              }
            }
          }
        })

        const effect = calculatePillEffect(recipe, this.level)
        
        // 丹药品质判定 (普通 70%, 优质 20%, 极品 8%, 仙品 2%)
        const qRand = Math.random()
        let pillQuality = 'common'
        let effectMultiplier = 1
        
        if (qRand > 0.98) {
          pillQuality = 'mythic'
          effectMultiplier = 2.0
          this.highQualityPillsCrafted = (this.highQualityPillsCrafted || 0) + 1
        } else if (qRand > 0.90) {
          pillQuality = 'epic'
          effectMultiplier = 1.5
        } else if (qRand > 0.70) {
          pillQuality = 'rare'
          effectMultiplier = 1.2
        }

        const finalEffect = { ...effect, value: Number((effect.value * effectMultiplier).toFixed(2)) }
        const qualityNameMap = { common: '', rare: '优质', epic: '极品', mythic: '仙品' }
        const prefix = qualityNameMap[pillQuality]
        const finalName = prefix ? `${prefix}·${recipe.name}` : recipe.name

        const existPill = this.items.find(i => i.type === 'pill' && i.name === finalName)
        if (existPill) {
          existPill.count = (existPill.count || 1) + 1;
        } else {
          this.items.push(markRaw({
            id: recipe.id,
            name: finalName,
            description: recipe.description,
            type: 'pill',
            quality: pillQuality,
            effect: finalEffect,
            count: 1
          }))
        }
        this.pillsCrafted++
        this.saveData(true)
        return { success: true, message: '炼制成功', pillName: finalName }
      }
      return { success: false, message: '炼制失败' }
    },
    useItem(item) {
      if (item.type === 'pill') return this.usePill(item)
      if (item.type === 'pet') return this.usePet(item)
      return { success: false, message: '无法使用' }
    },
    getActiveEffects() {
      return this.activeEffects.filter(effect => effect.endTime > Date.now())
    },
    addEquipment(equipment) {
      this.items.push(markRaw(equipment))
      this.saveData()
    },
    upgradePet(pet, essenceCount) {
      if (this.petEssence < essenceCount) return { success: false, message: '精华不足' }
      this.petEssence -= essenceCount
      const petIndex = this.items.findIndex(item => item.id === pet.id)
      if (petIndex > -1) {
        const cp = this.items[petIndex]
        cp.level = (cp.level || 1) + 1
        const qm = { divine: 2.0, celestial: 1.8, mystic: 1.6, spiritual: 1.4, mortal: 1.2 }[cp.rarity] || 1.2
        cp.combatAttributes = {
          attack: Math.floor(cp.combatAttributes.attack * (1 + 0.01 * qm)),
          health: Math.floor(cp.combatAttributes.health * (1 + 0.01 * qm)),
          defense: Math.floor(cp.combatAttributes.defense * (1 + 0.01 * qm)),
          speed: Math.floor(cp.combatAttributes.speed * (1 + 0.01 * qm)),
          critRate: cp.combatAttributes.critRate + 0.01 * qm, comboRate: cp.combatAttributes.comboRate + 0.01 * qm,
          counterRate: cp.combatAttributes.counterRate + 0.01 * qm, stunRate: cp.combatAttributes.stunRate + 0.01 * qm,
          dodgeRate: cp.combatAttributes.dodgeRate + 0.01 * qm, vampireRate: cp.combatAttributes.vampireRate + 0.01 * qm,
          critResist: cp.combatAttributes.critResist + 0.01 * qm, comboResist: cp.combatAttributes.comboResist + 0.01 * qm,
          counterResist: cp.combatAttributes.counterResist + 0.01 * qm, stunResist: cp.combatAttributes.stunResist + 0.01 * qm,
          dodgeResist: cp.combatAttributes.dodgeResist + 0.01 * qm, vampireResist: cp.combatAttributes.vampireResist + 0.01 * qm,
          healBoost: cp.combatAttributes.healBoost + 0.01 * qm, critDamageBoost: cp.combatAttributes.critDamageBoost + 0.01 * qm,
          critDamageReduce: cp.combatAttributes.critDamageReduce + 0.01 * qm, finalDamageBoost: cp.combatAttributes.finalDamageBoost + 0.01 * qm,
          finalDamageReduce: cp.combatAttributes.finalDamageReduce + 0.01 * qm, combatBoost: cp.combatAttributes.combatBoost + 0.01 * qm,
          resistanceBoost: cp.combatAttributes.resistanceBoost + 0.01 * qm
        }
        if (this.activePet && this.activePet.id === pet.id) this.applyPetBonuses()
      }
      this.saveData(true)
      return { success: true, message: '升级成功' }
    },
    evolvePet(pet, foodPet) {
      if (pet.rarity != foodPet.rarity || pet.name != foodPet.name) return { success: false, message: '材料不符' }
      const petIndex = this.items.findIndex(item => item.id === pet.id)
      const foodPetIndex = this.items.findIndex(item => item.id === foodPet.id)
      if (petIndex > -1 && foodPetIndex > -1) {
        this.petEssence += (foodPet.level - 1) * 10
        this.items.splice(foodPetIndex, 1)
        this.items[petIndex].star = (this.items[petIndex].star || 0) + 1
        this.saveData(true)
        return { success: true, message: '升星成功' }
      }
      return { success: false, message: '升星失败' }
    }
  }
})