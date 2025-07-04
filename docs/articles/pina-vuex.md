# Pinia 与 Vuex 对比指南

## 1. 核心概念对比

| 特性                | Vuex                          | Pinia                         |
|---------------------|-------------------------------|-------------------------------|
| **状态存储**         | 单一 Store 包含 modules       | 多个独立 Store                |
| **TypeScript 支持** | 需要额外类型定义              | 原生完美支持                  |
| **API 风格**        | 基于选项式 API                | 基于组合式 API                |
| **体积**            | 较大 (3.4KB gzipped)          | 更小 (1.5KB gzipped)          |
| **开发体验**        | 需要 mutations/actions 分离   | 直接修改状态                  |

## 2. Vuex 基础使用

### 2.1 安装与配置

```bash
npm install vuex@next
```

```js
// store/index.js
import { createStore } from 'vuex'

export default createStore({
  state: () => ({
    count: 0
  }),
  mutations: {
    increment(state) {
      state.count++
    }
  },
  actions: {
    asyncIncrement({ commit }) {
      setTimeout(() => commit('increment'), 1000)
    }
  },
  getters: {
    doubleCount: state => state.count * 2
  }
})
```

### 2.2 组件中使用

```vue
<script>
import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState(['count']),
    ...mapGetters(['doubleCount'])
  },
  methods: {
    ...mapActions(['asyncIncrement'])
  }
}
</script>
```

## 3. Pinia 基础使用

### 3.1 安装与配置

```bash
npm install pinia
```

```js
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    },
    async asyncIncrement() {
      setTimeout(() => this.increment(), 1000)
    }
  },
  getters: {
    doubleCount: (state) => state.count * 2
  }
})
```

### 3.2 组件中使用

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
</script>

<template>
  <div>{{ counter.count }}</div>
  <div>{{ counter.doubleCount }}</div>
  <button @click="counter.increment()">+</button>
</template>
```

## 4. 核心差异详解

### 4.1 状态修改方式

**Vuex**:
```js
// 必须通过 mutation
this.$store.commit('increment')

// 异步操作通过 action
this.$store.dispatch('asyncIncrement')
```

**Pinia**:
```js
// 直接修改
counter.count++

// 或通过 action
counter.increment()
```

### 4.2 模块化方案

**Vuex modules**:
```js
const moduleA = {
  namespaced: true,
  state: () => ({ /* ... */ }),
  mutations: { /* ... */ }
}

const store = createStore({
  modules: { a: moduleA }
})
```

**Pinia stores**:
```js
// 直接创建多个 store
export const useUserStore = defineStore('user', { /* ... */ })
export const useProductStore = defineStore('product', { /* ... */ })
```

## 5. 迁移指南（Vuex → Pinia）

### 5.1 步骤示例

1. 安装 Pinia：
   ```bash
   npm install pinia
   ```

2. 转换 store 结构：
   ```js
   // 原Vuex
   state => Pinia的state
   mutations => 直接改为actions
   actions => 保持为actions
   getters => 保持为getters
   ```

3. 更新组件引用：
   ```diff
   - import { mapState } from 'vuex'
   + import { useStore } from '@/stores/store'
   ```

### 5.2 代码转换示例

**Vuex**:
```js
// store/modules/user.js
export default {
  namespaced: true,
  state: { name: '' },
  mutations: {
    setName(state, payload) {
      state.name = payload
    }
  },
  actions: {
    async fetchUser({ commit }, userId) {
      const user = await api.getUser(userId)
      commit('setName', user.name)
    }
  }
}
```

**转换为 Pinia**:
```js
// stores/user.js
export const useUserStore = defineStore('user', {
  state: () => ({ name: '' }),
  actions: {
    setName(name) {
      this.name = name
    },
    async fetchUser(userId) {
      const user = await api.getUser(userId)
      this.setName(user.name)
    }
  }
})
```

## 6. 高级特性对比

### 6.1 插件系统

**Vuex plugin**:
```js
const myPlugin = (store) => {
  store.subscribe((mutation, state) => {
    console.log(mutation.type)
  })
}

const store = createStore({
  // ...
  plugins: [myPlugin]
})
```

**Pinia plugin**:
```js
const piniaPlugin = ({ store }) => {
  store.$subscribe((mutation, state) => {
    console.log(mutation.type)
  })
}

const pinia = createPinia()
pinia.use(piniaPlugin)
```

### 6.2 服务端渲染 (SSR)

**Vuex**:
```js
// 在服务端需要手动避免状态污染
export function createStore() {
  return createStore({ /* ... */ })
}
```

**Pinia**:
```js
// 自动支持SSR
export function createApp() {
  const pinia = createPinia()
  const app = createApp(App)
  app.use(pinia)
  return { app, pinia }
}
```

## 7. 性能对比

| 场景               | Vuex 表现       | Pinia 表现      |
|--------------------|----------------|----------------|
| 小型应用           | 稍重           | 更轻量         |
| 大型应用           | 模块化复杂      | 天然模块化     |
| TypeScript 项目    | 需要额外配置    | 完美支持       |
| 热更新效率         | 较慢           | 更快           |

## 8. 何时选择哪个？

**选择 Vuex 当**：
- 维护现有 Vuex 项目
- 需要严格的 mutation 变更跟踪
- 项目已深度集成 Vuex 插件生态

**选择 Pinia 当**：
- 新项目启动
- 需要更好的 TypeScript 支持
- 想要更简单的 API 和更小的体积
- 使用 Vue 3 的组合式 API

## 9. 最佳实践

### 9.1 Pinia 推荐模式

```ts
// stores/user.ts
import { defineStore } from 'pinia'

interface UserState {
  name: string
  age: number
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    name: '',
    age: 0
  }),
  getters: {
    isAdult(): boolean {
      return this.age >= 18
    }
  },
  actions: {
    async fetchUser(id: string) {
      const user = await api.fetchUser(id)
      this.$patch(user)
    }
  }
})
```

### 9.2 组合 Store

```ts
// stores/root.ts
import { useUserStore } from './user'
import { useCartStore } from './cart'

export function useStore() {
  return {
    user: useUserStore(),
    cart: useCartStore()
  }
}

// 组件中使用
const { user, cart } = useStore()
```

## 10. 常见问题解答

**Q: Pinia 能完全替代 Vuex 吗？**
A: 对于大多数新项目可以，但需要严格状态变更追踪的场景可能仍需 Vuex

**Q: 如何调试 Pinia？**
A: 使用 [Vue DevTools](https://devtools.vuejs.org/) 完美支持

**Q: 两者能共存吗？**
A: 技术上可以但不推荐，会增加复杂度

**Q: Pinia 的持久化方案？**
A: 使用 [pinia-plugin-persistedstate](https://github.com/prazdevs/pinia-plugin-persistedstate)

```bash
npm install pinia-plugin-persistedstate
```

```js
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
```