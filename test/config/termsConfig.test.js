// 测试术语配置模块
import { weightChangeTerms, fatRateTerms, trendTerms, formatDate } from '../../src/config/termsConfig.js';

describe('术语配置模块测试', () => {
    describe('weightChangeTerms', () => {
        test('应该包含所有必要的术语类别', () => {
            expect(weightChangeTerms).toHaveProperty('significantLoss');
            expect(weightChangeTerms).toHaveProperty('slightLoss');
            expect(weightChangeTerms).toHaveProperty('stable');
            expect(weightChangeTerms).toHaveProperty('slightGain');
            expect(weightChangeTerms).toHaveProperty('significantGain');
        });

        test('每个术语类别应该是一个数组', () => {
            expect(Array.isArray(weightChangeTerms.significantLoss)).toBe(true);
            expect(Array.isArray(weightChangeTerms.slightLoss)).toBe(true);
            expect(Array.isArray(weightChangeTerms.stable)).toBe(true);
            expect(Array.isArray(weightChangeTerms.slightGain)).toBe(true);
            expect(Array.isArray(weightChangeTerms.significantGain)).toBe(true);
        });

        test('每个术语类别数组应该包含至少一个术语', () => {
            expect(weightChangeTerms.significantLoss.length).toBeGreaterThan(0);
            expect(weightChangeTerms.slightLoss.length).toBeGreaterThan(0);
            expect(weightChangeTerms.stable.length).toBeGreaterThan(0);
            expect(weightChangeTerms.slightGain.length).toBeGreaterThan(0);
            expect(weightChangeTerms.significantGain.length).toBeGreaterThan(0);
        });
    });

    describe('fatRateTerms', () => {
        test('应该包含所有必要的术语类别', () => {
            expect(fatRateTerms).toHaveProperty('significantLoss');
            expect(fatRateTerms).toHaveProperty('slightLoss');
            expect(fatRateTerms).toHaveProperty('stable');
            expect(fatRateTerms).toHaveProperty('slightGain');
            expect(fatRateTerms).toHaveProperty('significantGain');
        });

        test('每个术语类别应该是一个数组', () => {
            expect(Array.isArray(fatRateTerms.significantLoss)).toBe(true);
            expect(Array.isArray(fatRateTerms.slightLoss)).toBe(true);
            expect(Array.isArray(fatRateTerms.stable)).toBe(true);
            expect(Array.isArray(fatRateTerms.slightGain)).toBe(true);
            expect(Array.isArray(fatRateTerms.significantGain)).toBe(true);
        });

        test('每个术语类别数组应该包含至少一个术语', () => {
            expect(fatRateTerms.significantLoss.length).toBeGreaterThan(0);
            expect(fatRateTerms.slightLoss.length).toBeGreaterThan(0);
            expect(fatRateTerms.stable.length).toBeGreaterThan(0);
            expect(fatRateTerms.slightGain.length).toBeGreaterThan(0);
            expect(fatRateTerms.significantGain.length).toBeGreaterThan(0);
        });
    });

    describe('trendTerms', () => {
        test('应该包含所有必要的术语类别', () => {
            expect(trendTerms).toHaveProperty('accelerating');
            expect(trendTerms).toHaveProperty('decelerating');
            expect(trendTerms).toHaveProperty('stable');
        });

        test('每个术语类别应该是一个数组', () => {
            expect(Array.isArray(trendTerms.accelerating)).toBe(true);
            expect(Array.isArray(trendTerms.decelerating)).toBe(true);
            expect(Array.isArray(trendTerms.stable)).toBe(true);
        });

        test('每个术语类别数组应该包含至少一个术语', () => {
            expect(trendTerms.accelerating.length).toBeGreaterThan(0);
            expect(trendTerms.decelerating.length).toBeGreaterThan(0);
            expect(trendTerms.stable.length).toBeGreaterThan(0);
        });
    });

    describe('formatDate', () => {
        test('应该正确格式化日期', () => {
            const testDate = '2026-01-31';
            const formattedDate = formatDate(testDate);
            expect(typeof formattedDate).toBe('string');
            expect(formattedDate).toContain('2026年');
            expect(formattedDate).toContain('1月');
            expect(formattedDate).toContain('31日');
        });

        test('应该处理无效日期', () => {
            const testDate = 'invalid-date';
            const formattedDate = formatDate(testDate);
            expect(typeof formattedDate).toBe('string');
        });
    });
});
