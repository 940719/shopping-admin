/** 判断一个值是否为图片 URL（http/https 或 /uploads 开头），否则视为 emoji 字符 */
export const isImgUrl = (v) =>
  !!v && (/^https?:\/\//i.test(v) || v.startsWith('/uploads/'));
