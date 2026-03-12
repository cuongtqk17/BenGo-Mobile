export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
  exchangeRate: number;
}

export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  vi: {
    code: 'VND',
    symbol: '₫',
    locale: 'vi-VN',
    exchangeRate: 24000, // 1 USD = 24,000 VND
  },
  en: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    exchangeRate: 1, // Base currency
  },
  zh: {
    code: 'CNY',
    symbol: '¥',
    locale: 'zh-CN',
    exchangeRate: 7.2, // 1 USD = 7.2 CNY
  },
  ko: {
    code: 'KRW',
    symbol: '₩',
    locale: 'ko-KR',
    exchangeRate: 1300, // 1 USD = 1,300 KRW
  },
  th: {
    code: 'THB',
    symbol: '฿',
    locale: 'th-TH',
    exchangeRate: 35, // 1 USD = 35 THB
  },
};

export function convertFromVND(
  vndAmount: string | number,
  targetLanguage: string
): number {
  const numericAmount = typeof vndAmount === 'string' ? parseFloat(vndAmount) : vndAmount;
  
  const config = CURRENCY_CONFIGS[targetLanguage] || CURRENCY_CONFIGS.en;
  const vndConfig = CURRENCY_CONFIGS.vi;
  
  const usdAmount = numericAmount / vndConfig.exchangeRate;
  const targetAmount = usdAmount * config.exchangeRate;
  
  return targetAmount;
}

export function convertToVND(
  amount: string | number,
  sourceLanguage: string
): number {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  const config = CURRENCY_CONFIGS[sourceLanguage] || CURRENCY_CONFIGS.en;
  const vndConfig = CURRENCY_CONFIGS.vi;
  
  const usdAmount = numericAmount / config.exchangeRate;
  const vndAmount = usdAmount * vndConfig.exchangeRate;
  
  return Math.round(vndAmount);
}

export function formatCurrencyByLanguage(
  amount: string | number,
  language: string,
  options?: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const {
    showSymbol = true,
    minimumFractionDigits,
    maximumFractionDigits,
  } = options || {};

  // Convert from VND to target currency
  const convertedAmount = convertFromVND(amount, language);
  
  // Get currency config
  const config = CURRENCY_CONFIGS[language] || CURRENCY_CONFIGS.en;
  
  // Determine decimal places based on currency
  let minDecimals = minimumFractionDigits;
  let maxDecimals = maximumFractionDigits;
  
  if (minDecimals === undefined || maxDecimals === undefined) {
    // VND, KRW, JPY don't use decimals
    if (['VND', 'KRW', 'JPY'].includes(config.code)) {
      minDecimals = 0;
      maxDecimals = 0;
    } else {
      // USD, CNY, THB use 2 decimals
      minDecimals = 2;
      maxDecimals = 2;
    }
  }
  
  // Format using Intl.NumberFormat
  const formatter = new Intl.NumberFormat(config.locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: showSymbol ? config.code : undefined,
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });
  
  return formatter.format(convertedAmount);
}

export function getCurrencySymbol(language: string): string {
  const config = CURRENCY_CONFIGS[language] || CURRENCY_CONFIGS.en;
  return config.symbol;
}

export function getCurrencyCode(language: string): string {
  const config = CURRENCY_CONFIGS[language] || CURRENCY_CONFIGS.en;
  return config.code;
}
