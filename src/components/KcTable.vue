<template>
  <div class="kc-container">
    <h2>📦 SPGL 库存管理系统</h2>
    
    <el-card class="toolbar-card">
      <div class="toolbar-content">
        <!-- ✅ 新增搜索区域 -->
        <div class="search-area">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入商品名称搜索"
            clearable
            style="width: 250px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><RefreshLeft /></el-icon> 重置
          </el-button>
        </div>
        
        <div class="button-area">
          <el-button type="primary" @click="openDialog()">
            <el-icon><Plus /></el-icon> 新增商品
          </el-button>
          <el-button @click="loadData">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card class="table-card">

      
      <el-table :data="tableData" border style="width: 100%" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope">
            <span>¥{{ formatPrice(scope.row.price) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="create_time" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="openDialog(scope.row)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 弹窗表单保持不变 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '新增商品'" width="500px">
      <el-form :model="form" label-width="80px" :rules="rules" ref="formRef">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-input v-model="form.category" placeholder="请输入分类" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" :step="0.1" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Edit, Delete, Search, RefreshLeft } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

interface KcItem {
  id?: number | null
  name: string
  category: string
  price: number | string
  stock: number | string
  create_time?: string
}

// ✅ 新增搜索相关变量
const searchKeyword = ref('')

const tableData = ref<KcItem[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<KcItem>({
  id: null,
  name: '',
  category: '',
  price: 0,
  stock: 0
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请输入分类', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

const formatPrice = (price: number | string | null | undefined): string => {
  const num = Number(price) || 0
  return num.toFixed(2)
}

const api = window.electronAPI

onMounted(() => {
  loadData()
})

// ✅ 修改 loadData 支持搜索参数
const loadData = async () => {
  const params = searchKeyword.value ? { keyword: searchKeyword.value } : undefined
  const res = await api.kc.getList(params)
  if (res.success && res.data) {
    tableData.value = res.data
  } else {
    ElMessage.error('加载失败：' + res.message)
  }
}

// ✅ 新增搜索处理函数
const handleSearch = () => {
  loadData()
}

// ✅ 新增重置搜索函数
const resetSearch = () => {
  searchKeyword.value = ''
  loadData()
}

const openDialog = (row: KcItem | null = null) => {
  if (row) {
    isEdit.value = true
    form.id = row.id ?? null
    form.name = row.name || ''
    form.category = row.category || ''
    form.price = Number(row.price) || 0
    form.stock = Number(row.stock) || 0
  } else {
    isEdit.value = false
    form.id = null
    form.name = ''
    form.category = ''
    form.price = 0
    form.stock = 0
  }
  dialogVisible.value = true
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await api.kc.delete(id)
    if (res.success) {
      ElMessage.success('删除成功')
      loadData()
    } else {
      ElMessage.error('删除失败：' + res.message)
    }
  } catch {
    // 用户取消删除
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      const formData = {
        id: form.id,
        name: form.name,
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock)
      }
      
      const res = isEdit.value 
        ? await api.kc.update(formData) 
        : await api.kc.add(formData)
      
      if (res.success) {
        ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
        dialogVisible.value = false
        loadData()
      } else {
        ElMessage.error('操作失败：' + res.message)
      }
    }
  })
}
</script>

<style scoped>
.kc-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

h2 {
  color: #303133;
  margin-bottom: 20px;
}

.toolbar-card {
  margin-bottom: 20px;
}

.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.search-area {
  display: flex;
  gap: 10px;
  align-items: center;
}

.button-area {
  display: flex;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.search-tip {
  padding: 10px;
  background-color: #f0f9eb;
  border: 1px solid #e1f3d8;
  border-radius: 4px;
  margin-bottom: 10px;
  color: #67c23a;
}

.search-tip strong {
  color: #409eff;
}
</style>
