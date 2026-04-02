// scripts/build-electron.js

import { execSync } from 'child_process'
import { rmSync, existsSync } from 'fs'
import { join } from 'path'

const env = {
  ...process.env,
  CSC_LINK: '',
  CSC_KEY_PASSWORD: '',
  GH_TOKEN: '',
  ELECTRON_BUILDER_ALLOW_UNSAFE_RESOLVE_DEPENDENCIES: 'true',
  npm_config_arch: 'x64',
  npm_config_target_arch: 'x64',
}

const rootDir = process.cwd()
const releaseDir = join(rootDir, 'release')

console.log('🚀 开始打包 Electron 应用...\n')

// 1. 清理旧的 release 目录
if (existsSync(releaseDir)) {
  console.log('🗑️  清理旧的 release 目录...')
  rmSync(releaseDir, { recursive: true })
}

// 2. 构建前端代码
console.log('🔨 构建前端代码...')
try {
  execSync('npm run build', { stdio: 'inherit' })
} catch (e) {
  console.error('❌ 前端构建失败')
  process.exit(1)
}

// 3. 执行 electron-builder 打包
console.log('\n📦 执行打包...')
try {
  execSync('npx electron-builder --win --x64 --publish=never', { stdio: 'inherit' })
} catch (e) {
  console.error('❌ 打包失败')
  process.exit(1)
}

// 4. 完成
console.log('\n✅ 打包完成！')
console.log('📁 安装包位置：release/')

// 列出生成的文件
import { readdirSync } from 'fs'
const files = readdirSync(releaseDir)
files.forEach(file => {
  console.log(`   - ${file}`)
})
