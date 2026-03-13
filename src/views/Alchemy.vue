<template>
  <n-card title="丹药炼制">
    <n-space vertical>
      <template v-if="unlockedRecipes.length > 0">
        <n-divider>丹方选择</n-divider>
        <n-grid :cols="2" :x-gap="12">
          <n-grid-item v-for="recipe in unlockedRecipes" :key="recipe.id">
            <n-card :title="recipe.name" size="small">
              <n-space vertical>
                <n-text depth="3">{{ recipe.description }}</n-text>
                <n-space>
                  <n-tag type="info">{{ pillGrades[recipe.grade].name }}</n-tag>
                  <n-tag type="warning">{{ pillTypes[recipe.type].name }}</n-tag>
                </n-space>
                <n-button
                  @click="selectRecipe(recipe)"
                  block
                  :type="selectedRecipe?.id === recipe.id ? 'primary' : 'default'"
                >
                  {{ selectedRecipe?.id === recipe.id ? '已选择' : '选择' }}
                </n-button>
              </n-space>
            </n-card>
          </n-grid-item>
        </n-grid>
      </template>
      <n-space vertical v-else>
        <n-empty description="暂未掌握任何丹方" />
      </n-space>
      <template v-if="selectedRecipe">
        <n-divider>材料需求</n-divider>
        <n-list>
          <n-list-item v-for="material in selectedRecipe.materials" :key="material.herb">
            <n-space justify="space-between">
              <n-space>
                <span>{{ getHerbName(material.herb) }}</span>
                <n-tag size="small">需要数量: {{ material.count }}</n-tag>
              </n-space>
              <n-tag
                :type="isMaterialEnough(material) ? 'success' : 'warning'"
              >
                拥有: {{ getMaterialStatus(material) }}
              </n-tag>
            </n-space>
          </n-list-item>
        </n-list>
      </template>
      <template v-if="selectedRecipe">
        <n-divider>效果预览</n-divider>
        <n-descriptions bordered :column="2">
          <n-descriptions-item label="丹药介绍">
            {{ selectedRecipe.description }}
          </n-descriptions-item>
          <n-descriptions-item label="效果数值">+{{ (currentEffect.value * 100).toFixed(1) }}%</n-descriptions-item>
          <n-descriptions-item label="持续时间">{{ Math.floor(currentEffect.duration / 60) }}分钟</n-descriptions-item>
          <n-descriptions-item label="成功率">{{ (currentEffect.successRate * 100).toFixed(1) }}%</n-descriptions-item>
        </n-descriptions>
      </template>
      <n-button
        class="craft-button"
        type="primary"
        block
        v-if="selectedRecipe"
        :disabled="!selectedRecipe || !checkMaterials(selectedRecipe)"
        @click="craftPill"
      >
        {{ !checkMaterials(selectedRecipe) ? '材料不足' : '开始炼制' }}
      </n-button>
    </n-space>
    <log-panel v-if="selectedRecipe" ref="logRef" title="炼丹日志" />
  </n-card>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { usePlayerStore } from '../stores/player'
  import { pillRecipes, pillGrades, pillTypes, calculatePillEffect } from '../plugins/pills'
  import { herbs } from '../plugins/herbs'
  import LogPanel from '../components/LogPanel.vue'

  const playerStore = usePlayerStore()
  const logRef = ref(null)
  const selectedRecipe = ref(null)

  const unlockedRecipes = computed(() => {
    return pillRecipes.filter(recipe => playerStore.pillRecipes.includes(recipe.id))
  })

  const selectRecipe = recipe => {
    selectedRecipe.value = recipe
  }

  // 【修改点】：基于 count 堆叠计算灵草是否充足
  const checkMaterials = recipe => {
    if (!recipe) return false
    return recipe.materials.every(material => {
      const totalCount = playerStore.herbs
        .filter(h => h.id === material.herb)
        .reduce((sum, h) => sum + (h.count || 1), 0)
      return totalCount >= material.count
    })
  }
  
  const isMaterialEnough = material => {
      const totalCount = playerStore.herbs
        .filter(h => h.id === material.herb)
        .reduce((sum, h) => sum + (h.count || 1), 0)
      return totalCount >= material.count
  }

  const getMaterialStatus = material => {
    const totalCount = playerStore.herbs
        .filter(h => h.id === material.herb)
        .reduce((sum, h) => sum + (h.count || 1), 0)
    return `${totalCount}/${material.count}`
  }

  const getHerbName = herbId => {
    const herb = herbs.find(h => h.id === herbId)
    return herb ? herb.name : herbId
  }

  const currentEffect = computed(() => {
    if (!selectedRecipe.value) return null
    return calculatePillEffect(selectedRecipe.value, playerStore.level)
  })

  const craftPill = () => {
    if (!selectedRecipe.value) return
    const result = playerStore.craftPill(selectedRecipe.value.id)
    if (result.success) {
      logRef.value?.addLog('success', '炼制成功！')
      const btn = document.querySelector('.craft-button')
      if (btn) {
        btn.classList.add('success-animation')
        setTimeout(() => btn.classList.remove('success-animation'), 1000)
      }
    } else {
      logRef.value?.addLog('error', `炼制失败：${result.message}`)
      const btn = document.querySelector('.craft-button')
      if (btn) {
        btn.classList.add('fail-animation')
        setTimeout(() => btn.classList.remove('fail-animation'), 1000)
      }
    }
  }
</script>

<style scoped>
  .n-space { width: 100%; }
  .n-button { margin-bottom: 12px; }
  .n-collapse { margin-top: 12px; }
  .craft-button { position: relative; overflow: hidden; }

  @keyframes success-ripple {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(4); opacity: 0; }
  }

  @keyframes fail-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }

  .success-animation::after {
    content: ''; position: absolute; top: 50%; left: 50%; width: 20px; height: 20px;
    background: rgba(0, 255, 0, 0.3); border-radius: 50%; transform: translate(-50%, -50%);
    animation: success-ripple 1s ease-out;
  }

  .fail-animation { animation: fail-shake 0.5s ease-in-out; }
</style>