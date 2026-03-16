<template>
  <n-layout>
    <n-layout-header bordered>
      <n-page-header>
        <template #title>成就系统</template>
        <template #subtitle>
          <n-space align="center">
            <span>总进度: {{ completedCount }} / {{ totalAchievements }}</span>
            <n-progress
              type="line"
              :percentage="totalProgress"
              :color="'#18a058'"
              :height="12"
              :border-radius="6"
              style="width: 200px"
              :show-indicator="true"
            />
          </n-space>
        </template>
      </n-page-header>
    </n-layout-header>
    <n-layout-content>
      <n-card :bordered="false">
        <n-tabs type="line">
          <n-tab-pane
            v-for="category in achievementCategories"
            :key="category.key"
            :name="category.key"
            :tab="category.name"
          >
            <n-space vertical>
              <n-grid :cols="2" :x-gap="12" :y-gap="8">
                <n-grid-item v-for="achievement in category.achievements" :key="achievement.id">
                  <n-card
                    :class="{ completed: isAchievementCompleted(achievement.id) }"
                    size="small"
                    hoverable
                    @click="showAchievementDetails(achievement)"
                  >
                    <template #header>
                      <n-space justify="space-between" align="center">
                        <span>{{ achievement.name }}</span>
                        <n-tag :type="isAchievementCompleted(achievement.id) ? 'success' : 'default'">
                          {{ isAchievementCompleted(achievement.id) ? '已完成' : '未完成' }}
                        </n-tag>
                      </n-space>
                    </template>
                    <p>{{ achievement.description }}</p>
                    <div v-if="isAchievementCompleted(achievement.id)" class="unlock-time">
                      解锁时间: {{ formatTime(getUnlockTime(achievement.id)) }}
                    </div>
                    <n-progress
                      type="line"
                      :percentage="getProgress(achievement)"
                      :color="isAchievementCompleted(achievement.id) ? '#18a058' : '#2080f0'"
                      :height="8"
                      :border-radius="4"
                      :show-indicator="true"
                    />
                  </n-card>
                </n-grid-item>
              </n-grid>
            </n-space>
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </n-layout-content>
  </n-layout>
</template>

<script setup>
  import { usePlayerStore } from '../stores/player'
  import { achievements, getAchievementProgress } from '../plugins/achievements'
  import { ref, onMounted, computed } from 'vue'
  import { useMessage } from 'naive-ui'
  import { checkAchievements } from '../plugins/achievements'

  const playerStore = usePlayerStore()
  const message = useMessage()

  // 检查成就完成情况
  onMounted(() => {
    const newlyCompletedAchievements = checkAchievements(playerStore)
    // 显示新完成的成就
    newlyCompletedAchievements.forEach(achievement => {
      message.success(`恭喜解锁新成就：${achievement.name}！\n\n${achievement.description}`, { duration: 3000 })
    })
  })

  // 统计属性
  const totalAchievements = computed(() => {
    return Object.values(achievements).reduce((sum, category) => sum + category.length, 0)
  })

  const completedCount = computed(() => {
    return playerStore.completedAchievements?.length || 0
  })

  const totalProgress = computed(() => {
    if (totalAchievements.value === 0) return 0
    return Math.floor((completedCount.value / totalAchievements.value) * 100)
  })

  // 获取分类进度
  const getCategoryProgress = (categoryKey) => {
    const categoryAchievements = achievements[categoryKey] || []
    if (categoryAchievements.length === 0) return { count: 0, total: 0 }
    const count = categoryAchievements.filter(a => isAchievementCompleted(a.id)).length
    return { count, total: categoryAchievements.length }
  }

  // 获取所有成就类别
  const achievementCategories = computed(() => {
    return Object.entries(achievements).map(([key, value]) => {
      const progress = getCategoryProgress(key)
      return {
        key,
        name: `${getCategoryName(key)} (${progress.count}/${progress.total})`,
        achievements: value
      }
    })
  })

  // 获取解锁时间
  const getUnlockTime = (achievementId) => {
    return playerStore.achievementUnlockTimes?.[achievementId]
  }

  // 格式化时间
  const formatTime = (timestamp) => {
    if (!timestamp) return '早期已解锁'
    const date = new Date(timestamp)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d} ${h}:${min}`
  }

  // 获取成就类别名称
  const getCategoryName = category => {
    const categoryNames = {
      equipment: '装备成就',
      dungeon_explore: '秘境探索',
      dungeon_combat: '秘境战斗',
      cultivation: '修炼成就',
      breakthrough: '突破成就',
      exploration: '探索成就',
      collection: '收集成就',
      resources: '资源成就',
      alchemy: '炼丹成就'
    }
    return categoryNames[category] || '其他成就'
  }

  // 检查成就是否完成
  const isAchievementCompleted = achievementId => {
    return playerStore.completedAchievements?.includes(achievementId) || false
  }

  // 显示成就详情
  const showAchievementDetails = achievement => {
    let rewardText = '奖励：'
    if (achievement.reward) {
      if (achievement.reward.spirit) rewardText += `\n${achievement.reward.spirit} 灵力`
      if (achievement.reward.spiritRate)
        rewardText += `\n${(achievement.reward.spiritRate * 100 - 100).toFixed(0)}% 灵力获取提升`
      if (achievement.reward.herbRate)
        rewardText += `\n${(achievement.reward.herbRate * 100 - 100).toFixed(0)}% 灵草获取提升`
      if (achievement.reward.alchemyRate)
        rewardText += `\n${(achievement.reward.alchemyRate * 100 - 100).toFixed(0)}% 炼丹成功率提升`
      if (achievement.reward.luck) rewardText += `\n${(achievement.reward.luck * 100 - 100).toFixed(0)}% 幸运提升`
    }
    message.info(`${achievement.name}\n\n${achievement.description}\n\n${rewardText}`, { duration: 5000 })
  }

  // 获取成就进度
  const getProgress = achievement => {
    try {
      const isCompleted = isAchievementCompleted(achievement.id)
      if (isCompleted) return 100
      
      const progress = getAchievementProgress(playerStore, achievement)
      let displayProgress = Number.isFinite(progress) ? Math.max(0, Math.floor(progress)) : 0
      return Math.min(99, displayProgress)
    } catch (error) {
      console.error('成就进度报错:', error)
      return 0
    }
  }
</script>

<style scoped>
  .completed {
    background-color: rgba(24, 160, 88, 0.1);
  }
  .unlock-time {
    font-size: 12px;
    color: #888;
    margin-top: 4px;
    margin-bottom: 8px;
  }
</style>
