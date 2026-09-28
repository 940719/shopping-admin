import { defineStore } from 'pinia'

/** 商品背景渐变预设（管理后台编辑时可选） */
export const GOODS_BG_PRESETS = [
  'linear-gradient(135deg,#e6f7ff,#bae7ff)',
  'linear-gradient(135deg,#f0f5ff,#d6e4ff)',
  'linear-gradient(135deg,#fff7e6,#ffe7ba)',
  'linear-gradient(135deg,#fff0f6,#ffd6e7)',
  'linear-gradient(135deg,#fff1f0,#ffccc7)',
  'linear-gradient(135deg,#f6ffed,#d9f7be)',
  'linear-gradient(135deg,#f4f0ff,#efdbff)',
  'linear-gradient(135deg,#e6fffb,#b5f5ec)'
]

export const useGoodsStore = defineStore('goods', {
  state: () => ({
    goodsList: []
  })
})
