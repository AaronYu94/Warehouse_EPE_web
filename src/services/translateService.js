class TranslateService {
  constructor() {
    this.supportedLanguages = {
      'zh': '中文'
    };
  }

  // 获取支持的语言列表
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  // 清除缓存
  clearCache() {
    // 无缓存需要清除
  }

  // 检查网络连接
  async checkConnection() {
    return true; // 总是返回true，因为不需要网络
  }
}

export default new TranslateService(); 