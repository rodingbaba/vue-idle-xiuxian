<template>
  <n-layout>
    <n-layout-header bordered>
      <n-page-header>
        <template #title>背包</template>
      </n-page-header>
    </n-layout-header>
    <n-layout-content>
      <n-card :bordered="false">
        <n-tabs type="line">
          <n-tab-pane name="equipment" tab="装备">
            <n-grid :cols="2" :x-gap="12" :y-gap="8">
              <n-grid-item v-for="(name, type) in equipmentTypes" :key="type">
                <n-card hoverable @click="showEquipmentList(type)">
                  <template #header>
                    <n-space justify="space-between">
                      <span>{{ name }}</span>
                      <n-button
                        size="small"
                        type="error"
                        @click.stop="unequipItem(type)"
                        v-if="playerStore.equippedArtifacts[type]"
                      >
                        卸下
                      </n-button>
                    </n-space>
                  </template>
                  <p v-if="playerStore.equippedArtifacts[type]">
                    {{ playerStore.equippedArtifacts[type].name }}
                  </p>
                  <p v-else>未装备</p>
                  <template #footer>
                    <n-space justify="space-between">
                      <span>{{ name }}</span>
                      <n-button
                        size="small"
                        type="info"
                        @click.stop="showEquipmentDetails(playerStore.equippedArtifacts[type])"
                        v-if="playerStore.equippedArtifacts[type]"
                      >
                        详细
                      </n-button>
                    </n-space>
                  </template>
                </n-card>
              </n-grid-item>
            </n-grid>
          </n-tab-pane>
          <n-tab-pane name="herbs" tab="灵草">
            <n-grid :cols="2" :x-gap="12" :y-gap="8" v-if="groupedHerbs.length">
              <n-grid-item v-for="herb in groupedHerbs" :key="`${herb.id}_${herb.quality}`">
                <n-card hoverable>
                  <template #header>
                    <n-space justify="space-between">
                      <n-space align="center">
                        <span>{{ herb.name }}</span>
                        <n-tag size="small" :type="herbQualityMap[herb.quality]?.type || 'default'">
                          {{ herbQualityMap[herb.quality]?.name || '未知' }}
                        </n-tag>
                      </n-space>
                      <span>数量: {{ herb.count }}</span>
                    </n-space>
                  </template>
                  <p>{{ herb.description }}</p>
                  <template #footer>
                    <n-space justify="end">
                      <n-button size="small" type="primary" @click="openHerbModal('consume', herb)">炼化修为</n-button>
                      <n-button size="small" type="warning" @click="openHerbModal('sell', herb)">出售换石</n-button>
                    </n-space>
                  </template>
                </n-card>
              </n-grid-item>
            </n-grid>
            <n-empty v-else />
          </n-tab-pane>
          <n-tab-pane name="pills" tab="丹药">
            <n-grid :cols="2" :x-gap="12" :y-gap="8" v-if="groupedPills.length">
              <n-grid-item v-for="pill in groupedPills" :key="pill.id">
                <n-card hoverable>
                  <template #header>
                    <n-space justify="space-between">
                      <n-space align="center">
                        <span>{{ pill.name }}</span>
                        <n-tag size="small" :type="herbQualityMap[pill.quality]?.type || 'default'" v-if="pill.quality">
                          {{ herbQualityMap[pill.quality]?.name || '未知' }}
                        </n-tag>
                      </n-space>
                      <n-space align="center">
                        <span>数量: {{ pill.count }}</span>
                        <n-button size="small" type="primary" @click="usePill(pill)">服用</n-button>
                      </n-space>
                    </n-space>
                  </template>
                  <p>{{ pill.description }}</p>
                </n-card>
              </n-grid-item>
            </n-grid>
            <n-empty v-else />
          </n-tab-pane>
          <n-tab-pane name="formulas" tab="丹方">
            <n-tabs type="segment">
              <n-tab-pane name="complete" tab="完整丹方">
                <n-grid :cols="2" :x-gap="12" :y-gap="8" v-if="groupedFormulas.complete.length">
                  <n-grid-item v-for="formula in groupedFormulas.complete" :key="formula.id">
                    <n-card hoverable>
                      <template #header>
                        <n-space justify="space-between">
                          <span>{{ formula.name }}</span>
                          <n-space>
                            <n-tag type="success" size="small">完整</n-tag>
                            <n-tag type="info" size="small">{{ pillGrades[formula.grade].name }}</n-tag>
                            <n-tag type="warning" size="small">{{ pillTypes[formula.type].name }}</n-tag>
                          </n-space>
                        </n-space>
                      </template>
                      <p>{{ formula.description }}</p>
                    </n-card>
                  </n-grid-item>
                </n-grid>
                <n-empty v-else />
              </n-tab-pane>
              <n-tab-pane name="incomplete" tab="残缺丹方">
                <n-grid :cols="2" :x-gap="12" :y-gap="8" v-if="groupedFormulas.incomplete.length">
                  <n-grid-item v-for="formula in groupedFormulas.incomplete" :key="formula.id">
                    <n-card hoverable>
                      <template #header>
                        <n-space justify="space-between">
                          <span>{{ formula.name }}</span>
                          <n-space>
                            <n-tag type="warning" size="small">残缺</n-tag>
                            <n-tag type="info" size="small">{{ pillGrades[formula.grade].name }}</n-tag>
                            <n-tag type="warning" size="small">{{ pillTypes[formula.type].name }}</n-tag>
                          </n-space>
                        </n-space>
                      </template>
                      <p>{{ formula.description }}</p>
                      <n-progress
                        type="line"
                        :percentage="Number(((formula.fragments / formula.fragmentsNeeded) * 100).toFixed(2))"
                        :show-indicator="true"
                        indicator-placement="inside"
                      >
                        收集进度: {{ formula.fragments }}/{{ formula.fragmentsNeeded }}
                      </n-progress>
                    </n-card>
                  </n-grid-item>
                </n-grid>
                <n-empty v-else />
              </n-tab-pane>
            </n-tabs>
          </n-tab-pane>
          <n-tab-pane name="pets" tab="灵宠">
            <n-space style="margin-bottom: 16px">
              <n-select
                v-model:value="selectedRarityToRelease"
                :options="options"
                placeholder="选择放生品阶"
                style="width: 150px"
              />
              <n-button
                @click="showBatchReleaseConfirm = true"
                :disabled="!playerStore.items.filter(item => item.type === 'pet').length"
              >
                一键放生
              </n-button>
            </n-space>
            <n-modal v-model:show="showBatchReleaseConfirm" preset="dialog" title="批量放生确认" style="width: 600px">
              <p>
                确定要放生{{
                  selectedRarityToRelease === 'all' ? '所有' : petRarities[selectedRarityToRelease].name
                }}品阶的未出战灵宠吗？此操作不可撤销。
              </p>
              <n-space justify="end" style="margin-top: 16px">
                <n-button size="small" @click="showBatchReleaseConfirm = false">取消</n-button>
                <n-button size="small" type="error" @click="batchReleasePets">确认放生</n-button>
              </n-space>
            </n-modal>
            <n-pagination
              v-if="filteredPets.length > 12"
              v-model:page="currentPage"
              :page-size="pageSize"
              :item-count="filteredPets.length"
              @update:page-size="onPageSizeChange"
              :page-slot="7"
            />
            <n-grid v-if="displayPets.length" :cols="2" :x-gap="12" :y-gap="8" style="margin-top: 16px">
              <n-grid-item v-for="pet in displayPets" :key="pet.id">
                <n-card hoverable>
                  <template #header>
                    <n-space justify="space-between">
                      <span>{{ pet.name }}</span>
                      <n-button size="small" type="primary" @click="useItem(pet)">
                        {{ playerStore.activePet?.id === pet.id ? '召回' : '出战' }}
                      </n-button>
                    </n-space>
                  </template>
                  <p>{{ pet.description }}</p>
                  <n-space vertical>
                    <n-tag :style="{ color: petRarities[pet.rarity].color }">
                      {{ petRarities[pet.rarity].name }}
                    </n-tag>
                    <n-space justify="space-between">
                      <n-text>等级: {{ pet.level || 1 }}</n-text>
                      <n-text>星级: {{ pet.star || 0 }}</n-text>
                      <n-button size="small" @click="showPetDetails(pet)">详情</n-button>
                    </n-space>
                  </n-space>
                </n-card>
              </n-grid-item>
            </n-grid>
            <n-empty v-else />
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </n-layout-content>
  </n-layout>

  <n-modal v-model:show="showHerbModal" preset="dialog" :title="herbModalType === 'sell' ? '出售灵草' : '炼化灵草'" style="width: 400px">
    <n-space vertical>
      <n-alert :type="herbModalType === 'sell' ? 'warning' : 'info'" :show-icon="false">
        {{ herbModalType === 'sell' ? '将灵草卖给商铺换取大量灵石。' : '生吞炼化灵草，虽不如炼成丹药效果好，但能快速增加大量修为。' }}
      </n-alert>
      <n-space justify="space-between" align="center">
        <span>操作数量 (拥有: {{ selectedHerb?.count }})</span>
        <n-button size="small" @click="herbActionCount = selectedHerb?.count">最大</n-button>
      </n-space>
      <n-slider v-model:value="herbActionCount" :min="1" :max="selectedHerb?.count" :step="1" />
      <n-input-number v-model:value="herbActionCount" :min="1" :max="selectedHerb?.count" />
      
      <n-statistic v-if="herbModalType === 'sell'" label="预计获得灵石" :value="(selectedHerb?.value || 10) * herbActionCount * 5" />
      <n-statistic v-if="herbModalType === 'consume'" label="预计获得修为" :value="(selectedHerb?.value || 10) * herbActionCount * (playerStore.level * 5)" />
    </n-space>
    <template #action>
      <n-button type="primary" @click="confirmHerbAction">确认{{ herbModalType === 'sell' ? '出售' : '炼化' }}</n-button>
    </template>
  </n-modal>
  
  <n-modal v-model:show="showPetModal" preset="dialog" title="灵宠详情" style="width: 600px">
    <template v-if="selectedPet">
      <n-descriptions bordered>
        <n-descriptions-item label="名称">{{ selectedPet.name }}</n-descriptions-item>
        <n-descriptions-item label="品质">
          <n-tag :style="{ color: petRarities[selectedPet.rarity].color }">
            {{ petRarities[selectedPet.rarity].name }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="等级">{{ selectedPet.level || 1 }}</n-descriptions-item>
        <n-descriptions-item label="星级">{{ selectedPet.star || 0 }}</n-descriptions-item>
        <n-descriptions-item label="境界">{{ Math.floor((selectedPet.star || 0) / 5) }}阶</n-descriptions-item>
      </n-descriptions>
      <n-divider>属性加成</n-divider>
      <n-descriptions bordered>
        <n-descriptions-item label="攻击加成">+{{ (getPetBonus(selectedPet).attack * 100).toFixed(1) }}%</n-descriptions-item>
        <n-descriptions-item label="防御加成">+{{ (getPetBonus(selectedPet).defense * 100).toFixed(1) }}%</n-descriptions-item>
        <n-descriptions-item label="生命加成">+{{ (getPetBonus(selectedPet).health * 100).toFixed(1) }}%</n-descriptions-item>
      </n-descriptions>
      <n-divider>操作</n-divider>
      <n-space vertical>
        <n-space justify="space-between">
          <span>升级（消耗{{ getUpgradeCost(selectedPet) }} / {{ playerStore.petEssence }}灵宠精华）</span>
          <n-button size="small" type="primary" @click="upgradePet(selectedPet)" :disabled="!canUpgrade(selectedPet)">升级</n-button>
        </n-space>
        <n-space justify="space-between">
          <span>升星（需要相同品质和名字的灵宠）</span>
          <n-select v-model:value="selectedFoodPet" :options="getAvailableFoodPets(selectedPet)" placeholder="选择升星材料" style="width: 200px" />
          <n-button size="small" type="warning" @click="evolvePet(selectedPet)" :disabled="!selectedFoodPet">升星</n-button>
        </n-space>
        <n-space justify="space-between">
          <span>放生灵宠（不会返还已消耗的道具）</span>
          <n-button size="small" type="error" @click="confirmReleasePet(selectedPet)">放生灵宠</n-button>
        </n-space>
      </n-space>
    </template>
  </n-modal>
  
  <n-modal v-model:show="showReleaseConfirm" preset="dialog" title="灵宠放生" style="width: 600px">
    <template v-if="petToRelease">
      <p>确定要放生 {{ petToRelease.name }} 吗？此操作不可撤销。</p>
      <n-space justify="end" style="margin-top: 16px">
        <n-button size="small" @click="cancelReleasePet">取消</n-button>
        <n-button size="small" type="error" @click="releasePet">确认放生</n-button>
      </n-space>
    </template>
  </n-modal>

  <n-modal v-model:show="showEquipmentModal" preset="dialog" :title="`${equipmentTypes[selectedEquipmentType]}列表`" style="width: 800px">
    <n-space vertical>
      <n-space justify="space-between">
        <n-select v-model:value="selectedQuality" :options="qualityOptions" style="width: 150px" />
        <n-button type="warning" :disabled="equipmentList.length === 0" @click="batchSellEquipments">一键卖出</n-button>
      </n-space>
      <n-pagination v-model:page="currentEquipmentPage" :page-size="equipmentPageSize" :item-count="filteredEquipmentList.length" v-if="equipmentList.length > 8" @update:page-size="onEquipmentPageSizeChange" :page-slot="7" />
      <n-grid :cols="2" :x-gap="12" :y-gap="8" v-if="equipmentList.length">
        <n-grid-item v-for="equipment in equipmentList" :key="equipment.id" @click="showEquipmentDetails(equipment)">
          <n-card hoverable>
            <template #header>
              <n-space justify="space-between">
                <span>{{ equipment.name }}</span>
                <n-button size="small" type="warning" @click.stop="sellEquipment(equipment)">卖出</n-button>
              </n-space>
            </template>
            <n-space vertical>
              <n-tag :style="{ color: equipment.qualityInfo.color }">{{ equipment.qualityInfo.name }}</n-tag>
              <n-text>境界要求：{{ getRealmName(equipment.requiredRealm).name }}</n-text>
            </n-space>
          </n-card>
        </n-grid-item>
      </n-grid>
      <n-empty description="没有任何装备" v-else></n-empty>
    </n-space>
  </n-modal>

  <n-modal v-model:show="showEquipmentDetailModal" preset="dialog" :title="selectedEquipment?.name || '装备详情'" style="width: 700px">
    <n-grid :cols="currentEquipped && currentEquipped.id !== selectedEquipment?.id ? 2 : 1" :x-gap="16">
      
      <n-grid-item v-if="currentEquipped && currentEquipped.id !== selectedEquipment?.id">
        <n-divider style="margin-top: 0">当前装备: {{ currentEquipped.name }}</n-divider>
        <n-descriptions bordered :column="1" size="small">
          <n-descriptions-item label="品质">
            <span :style="{ color: currentEquipped.qualityInfo.color }">{{ currentEquipped.qualityInfo.name }}</span>
          </n-descriptions-item>
          <n-descriptions-item label="类型">{{ equipmentTypes[currentEquipped.type] }}</n-descriptions-item>
          <n-descriptions-item label="强化等级">+{{ currentEquipped.enhanceLevel || 0 }}</n-descriptions-item>
          <template v-if="currentEquipped.stats">
            <n-descriptions-item v-for="(value, stat) in currentEquipped.stats" :key="stat" :label="getStatName(stat)">
              {{ formatStatValue(stat, value) }}
            </n-descriptions-item>
          </template>
        </n-descriptions>
      </n-grid-item>

      <n-grid-item>
        <n-divider style="margin-top: 0">
          {{ currentEquipped && currentEquipped.id !== selectedEquipment?.id ? '新装备属性' : '装备属性' }}
        </n-divider>
        <n-descriptions bordered :column="1" size="small">
          <n-descriptions-item label="品质">
            <span :style="{ color: selectedEquipment?.qualityInfo.color }">{{ selectedEquipment?.qualityInfo.name }}</span>
          </n-descriptions-item>
          <n-descriptions-item label="类型">{{ equipmentTypes[selectedEquipment?.type] }}</n-descriptions-item>
          <n-descriptions-item label="强化等级">+{{ selectedEquipment?.enhanceLevel || 0 }}</n-descriptions-item>
          <template v-if="selectedEquipment?.stats">
            <n-descriptions-item v-for="(value, stat) in selectedEquipment.stats" :key="stat" :label="getStatName(stat)">
              <n-space align="center" :size="4">
                <span>{{ formatStatValue(stat, value) }}</span>
                <template v-if="getStatDiff(stat, value)">
                  <n-text :type="getStatDiff(stat, value).isPositive ? 'success' : 'error'">
                    ({{ getStatDiff(stat, value).isPositive ? '↑' : '↓' }} {{ formatStatValue(stat, Math.abs(getStatDiff(stat, value).value)) }})
                  </n-text>
                </template>
              </n-space>
            </n-descriptions-item>
          </template>
        </n-descriptions>
      </n-grid-item>
    </n-grid>

    <template #action>
      <n-space justify="space-between" style="width: 100%">
        <n-space>
          <n-button type="primary" @click="showEnhanceConfirm = true" :disabled="(selectedEquipment?.enhanceLevel || 0) >= 100">强化</n-button>
          <n-button type="info" :disabled="playerStore.refinementStones === 0" @click="handleReforgeEquipment">洗练</n-button>
        </n-space>
        <n-space>
          <n-button @click="equipItem(selectedEquipment)" :disabled="playerStore.level < selectedEquipment?.requiredRealm" v-if="selectedEquipment?.id != playerStore.equippedArtifacts[selectedEquipment?.slot || selectedEquipment?.type]?.id">装备</n-button>
          <n-button @click="unequipItem(selectedEquipment?.slot || selectedEquipment?.type)" :disabled="playerStore.level < selectedEquipment?.requiredRealm" v-else>卸下</n-button>
          <n-button type="error" @click="sellEquipment(selectedEquipment)" v-if="selectedEquipment?.id != playerStore.equippedArtifacts[selectedEquipment?.slot || selectedEquipment?.type]?.id">出售</n-button>
        </n-space>
      </n-space>
    </template>
  </n-modal>

  <n-modal v-model:show="showEnhanceConfirm" preset="dialog" title="装备强化">
    <n-space vertical>
      <p>是否消耗 {{ ((selectedEquipment?.enhanceLevel || 0) + 1) * 10 }} 强化石？</p>
      <p>当前：{{ playerStore.reinforceStones }}</p>
    </n-space>
    <template #action>
      <n-button type="primary" @click="handleEnhanceEquipment" :disabled="playerStore.reinforceStones < ((selectedEquipment?.enhanceLevel || 0) + 1) * 10">确认强化</n-button>
    </template>
  </n-modal>
  
  <n-modal v-model:show="showReforgeConfirm" preset="dialog" title="洗练结果确认">
    <template #action>
      <n-button type="primary" @click="confirmReforgeResult(true)">确认新属性</n-button>
      <n-button @click="confirmReforgeResult(false)">保留原属性</n-button>
    </template>
  </n-modal>
</template>

<script setup>
  import { usePlayerStore } from '../stores/player'
  import { ref, computed } from 'vue'
  import { useMessage } from 'naive-ui'
  import { getStatName, formatStatValue } from '../plugins/stats'
  import { getRealmName } from '../plugins/realm'
  import { pillRecipes, pillGrades, pillTypes, calculatePillEffect } from '../plugins/pills'
  import { enhanceEquipment, reforgeEquipment } from '../plugins/equipment'

  const currentPage = ref(1)
  const pageSize = ref(12)
  const playerStore = usePlayerStore()
  const message = useMessage()

  // ================= 新增：灵草操作逻辑 =================
  const showHerbModal = ref(false)
  const herbModalType = ref('sell') 
  const selectedHerb = ref(null)
  const herbActionCount = ref(1)

  const herbQualityMap = {
    common: { name: '普通', type: 'default' },
    uncommon: { name: '优质', type: 'info' },
    rare: { name: '稀有', type: 'success' },
    epic: { name: '极品', type: 'warning' },
    legendary: { name: '仙品', type: 'error' }
  }

  const openHerbModal = (type, herb) => {
    herbModalType.value = type
    selectedHerb.value = herb
    herbActionCount.value = 1
    showHerbModal.value = true
  }

  const confirmHerbAction = () => {
    if (!selectedHerb.value) return
    let result;
    if (herbModalType.value === 'sell') {
      result = playerStore.sellHerb(selectedHerb.value.id, selectedHerb.value.quality, herbActionCount.value)
    } else {
      result = playerStore.consumeHerb(selectedHerb.value.id, selectedHerb.value.quality, herbActionCount.value)
    }
    
    if (result.success) {
      message.success(result.message)
      showHerbModal.value = false
    } else {
      message.error(result.message)
    }
  }
  // ====================================================

  const selectedRarityToRelease = ref('all')
  const filteredPets = computed(() => {
    const pets = playerStore.items.filter(item => item.type === 'pet')
    if (selectedRarityToRelease.value === 'all') return pets
    return pets.filter(pet => pet.rarity === selectedRarityToRelease.value)
  })
  const displayPets = computed(() => filteredPets.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value))
  const onPageSizeChange = size => { pageSize.value = size; currentPage.value = 1 }

  const usePill = pill => {
    const result = playerStore.usePill(pill)
    if (result.success) message.success(result.message)
    else message.error(result.message)
  }

  const petRarities = {
    divine: { name: '神品', color: '#FF0000', probability: 0.02, essenceBonus: 50 },
    celestial: { name: '仙品', color: '#FFD700', probability: 0.08, essenceBonus: 30 },
    mystic: { name: '玄品', color: '#9932CC', probability: 0.15, essenceBonus: 20 },
    spiritual: { name: '灵品', color: '#1E90FF', probability: 0.25, essenceBonus: 10 },
    mortal: { name: '凡品', color: '#32CD32', probability: 0.5, essenceBonus: 5 }
  }

  const showPetModal = ref(false)
  const selectedPet = ref(null)
  const selectedFoodPet = ref(null)
  const showReleaseConfirm = ref(false)
  const showBatchReleaseConfirm = ref(false)
  const petToRelease = ref(null)

  const confirmReleasePet = pet => { petToRelease.value = pet; showReleaseConfirm.value = true }
  const cancelReleasePet = () => { petToRelease.value = null; showReleaseConfirm.value = false }
  
  const releasePet = () => {
    if (petToRelease.value) {
      if (playerStore.activePet?.id === petToRelease.value.id) playerStore.activePet = null
      const index = playerStore.items.findIndex(item => item.id === petToRelease.value.id)
      if (index > -1) {
        playerStore.items.splice(index, 1)
        playerStore.saveData(true)
        message.success('已放生灵宠')
      }
      showReleaseConfirm.value = false
      showPetModal.value = false
    }
  }

  const batchReleasePets = () => {
    playerStore.items = playerStore.items.filter(item => item.type !== 'pet' || item.id === playerStore.activePet?.id || (selectedRarityToRelease.value !== 'all' && item.rarity !== selectedRarityToRelease.value))
    showBatchReleaseConfirm.value = false
    message.success('一键放生成功')
  }

  const showPetDetails = pet => { selectedPet.value = pet; selectedFoodPet.value = null; showPetModal.value = true }
  const getPetBonus = pet => {
    if (!pet) return { attack: 0, defense: 0, health: 0 }
    const baseBonus = { divine: 0.5, celestial: 0.3, mystic: 0.2, spiritual: 0.1, mortal: 0.05 }[pet.rarity] || 0.05
    const finalBonus = baseBonus + (pet.star || 0) * ({ divine: 0.1, celestial: 0.08, mystic: 0.06, spiritual: 0.04, mortal: 0.02 }[pet.rarity] || 0.02) + Math.floor((pet.star || 0) / 5) * (baseBonus * 0.5)
    return { attack: finalBonus, defense: finalBonus, health: finalBonus }
  }
  const getUpgradeCost = pet => (pet.level || 1) * 10
  const canUpgrade = pet => playerStore.petEssence >= getUpgradeCost(pet)
  const getAvailableFoodPets = pet => !pet ? [] : playerStore.items.filter(item => item.type === 'pet' && item.id !== pet.id && item.star === pet.star && item.rarity === pet.rarity && item.name === pet.name).map(item => ({ label: `${item.name} (${item.level || 1}级)`, value: item.id }))
  
  const upgradePet = pet => {
    const result = playerStore.upgradePet(pet, getUpgradeCost(pet))
    result.success ? message.success(result.message) : message.error(result.message)
  }
  const evolvePet = pet => {
    if (!selectedFoodPet.value) return message.error('请选择升星材料')
    const foodPet = playerStore.items.find(item => item.id === selectedFoodPet.value)
    if (!foodPet) return message.error('材料不存在')
    const result = playerStore.evolvePet(pet, foodPet)
    if (result.success) { message.success(result.message); showPetModal.value = false } else message.error(result.message)
  }

  const equipmentTypes = { weapon: '武器', head: '头部', body: '衣服', legs: '裤子', feet: '鞋子', shoulder: '肩甲', hands: '手套', wrist: '护腕', necklace: '项链', ring1: '戒指1', ring2: '戒指2', belt: '腰带', artifact: '法宝' }
  const selectedType = ref('')
  const showEquipmentList = type => { selectedType.value = type; selectedEquipmentType.value = type; showEquipmentModal.value = true }
  const unequipItem = slot => { playerStore.unequipArtifact(slot) ? message.success('卸下成功') : message.error('卸下失败') }

  const showEquipmentModal = ref(false)
  const selectedEquipmentType = ref('')
  const selectedQuality = ref('all')
  const currentEquipmentPage = ref(1)
  const equipmentPageSize = ref(8)
  
  const qualityOptions = computed(() => { return [{ label: '全部品质', value: 'all' }, { label: '仙品', value: 'mythic' }, { label: '极品', value: 'legendary' }, { label: '上品', value: 'epic' }, { label: '中品', value: 'rare' }, { label: '下品', value: 'uncommon' }, { label: '凡品', value: 'common' }] })
  const filteredEquipmentList = computed(() => playerStore.items.filter(item => item.type === selectedEquipmentType.value && (selectedQuality.value === 'all' || item.quality === selectedQuality.value)))
  const equipmentList = computed(() => filteredEquipmentList.value.slice((currentEquipmentPage.value - 1) * equipmentPageSize.value, currentEquipmentPage.value * equipmentPageSize.value))
  const onEquipmentPageSizeChange = size => { equipmentPageSize.value = size; currentEquipmentPage.value = 1 }

  const batchSellEquipments = async () => {
    const result = await playerStore.batchSellEquipments(selectedQuality.value === 'all' ? null : selectedQuality.value, selectedEquipmentType.value)
    result.success ? message.success(result.message) : message.error('批量卖出失败')
  }
  const sellEquipment = async equipment => {
    const result = await playerStore.sellEquipment(equipment)
    if (result.success) { message.success(result.message); showEquipmentDetailModal.value = false } else message.error('卖出失败')
  }

  // ================= 新增：装备对比逻辑 =================
  const showEquipmentDetailModal = ref(false)
  const selectedEquipment = ref(null)

  // 获取当前角色同一部位已装备的物品
  const currentEquipped = computed(() => {
    if (!selectedEquipment.value) return null
    // 兼容取槽位或类型字段
    const slot = selectedEquipment.value.slot || selectedEquipment.value.type
    return playerStore.equippedArtifacts[slot]
  })

  // 计算与当前装备的属性差值
  const getStatDiff = (stat, newValue) => {
    // 如果没有装备，或者正在查看的装备就是身上的装备，则不需要对比
    if (!currentEquipped.value || currentEquipped.value.id === selectedEquipment.value?.id) return null
    
    // 获取旧装备对应属性的值（如果没有这个属性则视为0）
    const oldValue = currentEquipped.value.stats?.[stat] || 0
    const diff = newValue - oldValue
    
    // 如果属性没有变化，则返回 null
    if (diff === 0) return null
    
    return {
      isPositive: diff > 0,
      value: diff
    }
  }

  const showEquipmentDetails = equipment => { selectedEquipment.value = equipment; showEquipmentDetailModal.value = true }
  // ====================================================

  const showEnhanceConfirm = ref(false)
  const handleEnhanceEquipment = () => {
    const result = enhanceEquipment(selectedEquipment.value, playerStore.reinforceStones)
    if (result.success) { playerStore.reinforceStones -= result.cost; selectedEquipment.value.stats = result.newStats; selectedEquipment.value.enhanceLevel = result.newLevel; message.success('强化成功'); playerStore.saveData(true) } else message.error('强化失败')
  }

  const showReforgeConfirm = ref(false)
  const reforgeResult = ref(null)
  const handleReforgeEquipment = () => {
    const result = reforgeEquipment(selectedEquipment.value, playerStore.refinementStones, false)
    if (result.success) { playerStore.refinementStones -= result.cost; reforgeResult.value = result; showReforgeConfirm.value = true } else message.error('洗练失败')
  }
  const confirmReforgeResult = confirm => {
    if (confirm) { selectedEquipment.value.stats = reforgeResult.value.newStats; message.success('已确认') }
    showReforgeConfirm.value = false; playerStore.saveData(true)
  }

  const equipItem = equipment => {
    const result = playerStore.equipArtifact(equipment, equipment.type)
    if (result.success) { message.success(result.message); showEquipmentModal.value = false; showEquipmentDetailModal.value = false } else message.error('装备失败')
  }

  const groupedHerbs = computed(() => {
    const groups = {}
    playerStore.herbs.forEach(herb => {
      const key = `${herb.id}_${herb.quality}`
      if (!groups[key]) {
        groups[key] = { ...herb, count: herb.count || 1 }
      } else {
        groups[key].count += (herb.count || 1)
      }
    })
    return Object.values(groups)
  })

  const groupedFormulas = computed(() => {
    const complete = playerStore.pillRecipes.map(recipeId => pillRecipes.find(r => r.id === recipeId)).filter(Boolean).map(r => ({ ...r, isComplete: true }))
    const incomplete = Object.entries(playerStore.pillFragments).map(([recipeId, fragments]) => {
      const r = pillRecipes.find(r => r.id === recipeId)
      return r ? { ...r, isComplete: false, fragments, fragmentsNeeded: r.fragmentsNeeded } : null
    }).filter(Boolean)
    return { complete, incomplete }
  })

  const groupedPills = computed(() => {
    const groups = {}
    playerStore.items.filter(item => item.type === 'pill').forEach(pill => {
      if (!groups[pill.name]) {
        groups[pill.name] = { ...pill, count: pill.count || 1 }
      } else {
        groups[pill.name].count += (pill.count || 1)
      }
    })
    return Object.values(groups)
  })

  const useItem = item => {
    if (item.type === 'pet') {
      const result = playerStore.usePet(item)
      result.success ? message.success(result.message) : message.error('操作失败')
    }
  }

  const options = [{ label: '全部品阶', value: 'all' }, { label: '神品', value: 'divine' }, { label: '仙品', value: 'celestial' }, { label: '玄品', value: 'mystic' }, { label: '灵品', value: 'spiritual' }, { label: '凡品', value: 'mortal' }]
</script>

<style scoped>
  .n-card { cursor: pointer; }
</style>