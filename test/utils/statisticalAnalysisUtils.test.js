// 测试统计分析工具模块
import * as statisticalAnalysisUtils from '../../src/utils/statisticalAnalysisUtils.js';

// 模拟数据
const mockRawData = [
    { date: '2026-01-01', weight: 140, fatRate: 25, muscleMass: 50 },
    { date: '2026-01-15', weight: 138, fatRate: 24, muscleMass: 51 },
    { date: '2026-02-01', weight: 136, fatRate: 23, muscleMass: 52 },
    { date: '2026-02-15', weight: 134, fatRate: 22, muscleMass: 53 },
    { date: '2026-03-01', weight: 132, fatRate: 21, muscleMass: 54 },
    { date: '2026-03-15', weight: 130, fatRate: 20, muscleMass: 55 }
];

// 模拟空数据
const emptyRawData = [];

describe('统计分析工具模块测试', () => {
    beforeEach(() => {
        // 重置所有模拟函数
        jest.clearAllMocks();
    });

    describe('groupDataByMonth', () => {
        test('应该按月份分组数据', () => {
            const result = statisticalAnalysisUtils.groupDataByMonth(mockRawData);
            
            expect(result).toHaveProperty('2026-01');
            expect(result).toHaveProperty('2026-02');
            expect(result).toHaveProperty('2026-03');
            expect(result['2026-01'].length).toBe(2);
            expect(result['2026-02'].length).toBe(2);
            expect(result['2026-03'].length).toBe(2);
        });

        test('当数据为空时应该返回空对象', () => {
            const result = statisticalAnalysisUtils.groupDataByMonth(emptyRawData);
            expect(Object.keys(result).length).toBe(0);
        });
    });

    describe('groupDataByQuarter', () => {
        test('应该按季度分组数据', () => {
            const result = statisticalAnalysisUtils.groupDataByQuarter(mockRawData);
            
            expect(result).toHaveProperty('2026-Q1');
            expect(result['2026-Q1'].length).toBe(6);
        });

        test('当数据为空时应该返回空对象', () => {
            const result = statisticalAnalysisUtils.groupDataByQuarter(emptyRawData);
            expect(Object.keys(result).length).toBe(0);
        });
    });

    describe('groupDataByYear', () => {
        test('应该按年度分组数据', () => {
            const result = statisticalAnalysisUtils.groupDataByYear(mockRawData);
            
            expect(result).toHaveProperty('2026');
            expect(result['2026'].length).toBe(6);
        });

        test('当数据为空时应该返回空对象', () => {
            const result = statisticalAnalysisUtils.groupDataByYear(emptyRawData);
            expect(Object.keys(result).length).toBe(0);
        });
    });

    describe('groupDataByWeek', () => {
        test('应该按周分组数据', () => {
            const result = statisticalAnalysisUtils.groupDataByWeek(mockRawData);
            expect(Object.keys(result).length).toBeGreaterThan(0);
        });

        test('当数据为空时应该返回空对象', () => {
            const result = statisticalAnalysisUtils.groupDataByWeek(emptyRawData);
            expect(Object.keys(result).length).toBe(0);
        });
    });

    describe('calculateMetricStats', () => {
        test('应该计算单个指标的统计数据', () => {
            const result = statisticalAnalysisUtils.calculateMetricStats(mockRawData, 'weight');
            
            expect(result).toHaveProperty('count');
            expect(result).toHaveProperty('average');
            expect(result).toHaveProperty('max');
            expect(result).toHaveProperty('min');
            expect(result).toHaveProperty('median');
            expect(result).toHaveProperty('sum');
            expect(result).toHaveProperty('standardDeviation');
            
            expect(result.count).toBe(6);
            expect(result.max).toBe(140);
            expect(result.min).toBe(130);
            expect(result.average).toBeCloseTo(135, 1);
        });

        test('当数据为空时应该返回默认值', () => {
            const result = statisticalAnalysisUtils.calculateMetricStats(emptyRawData, 'weight');
            
            expect(result.count).toBe(0);
            expect(result.average).toBe(0);
            expect(result.max).toBe(0);
            expect(result.min).toBe(0);
            expect(result.median).toBe(0);
            expect(result.sum).toBe(0);
            expect(result.standardDeviation).toBe(0);
        });

        test('当指标数据不完整时应该过滤掉无效值', () => {
            const incompleteData = [
                { date: '2026-01-01', weight: 140 },
                { date: '2026-01-15', weight: null },
                { date: '2026-02-01', weight: 136 }
            ];
            const result = statisticalAnalysisUtils.calculateMetricStats(incompleteData, 'weight');
            
            expect(result.count).toBe(2);
            expect(result.average).toBe(138);
        });
    });

    describe('calculateMonthlyStats', () => {
        test('应该计算月度统计数据', () => {
            const result = statisticalAnalysisUtils.calculateMonthlyStats(mockRawData, 'weight');
            
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(3);
            expect(result[0]).toHaveProperty('period');
            expect(result[0]).toHaveProperty('average');
            expect(result[0]).toHaveProperty('max');
            expect(result[0]).toHaveProperty('min');
        });

        test('当数据为空时应该返回空数组', () => {
            const result = statisticalAnalysisUtils.calculateMonthlyStats(emptyRawData, 'weight');
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });
    });

    describe('calculateQuarterlyStats', () => {
        test('应该计算季度统计数据', () => {
            const result = statisticalAnalysisUtils.calculateQuarterlyStats(mockRawData, 'weight');
            
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(1);
            expect(result[0]).toHaveProperty('period');
            expect(result[0]).toHaveProperty('average');
        });

        test('当数据为空时应该返回空数组', () => {
            const result = statisticalAnalysisUtils.calculateQuarterlyStats(emptyRawData, 'weight');
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });
    });

    describe('calculateYearlyStats', () => {
        test('应该计算年度统计数据', () => {
            const result = statisticalAnalysisUtils.calculateYearlyStats(mockRawData, 'weight');
            
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(1);
            expect(result[0]).toHaveProperty('period');
            expect(result[0]).toHaveProperty('average');
        });

        test('当数据为空时应该返回空数组', () => {
            const result = statisticalAnalysisUtils.calculateYearlyStats(emptyRawData, 'weight');
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });
    });

    describe('calculateWeeklyAverageChange', () => {
        test('应该计算周平均变化率', () => {
            const result = statisticalAnalysisUtils.calculateWeeklyAverageChange(mockRawData, 'weight');
            
            expect(Array.isArray(result)).toBe(true);
            if (result.length > 0) {
                expect(result[0]).toHaveProperty('period');
                expect(result[0]).toHaveProperty('prevValue');
                expect(result[0]).toHaveProperty('currentValue');
                expect(result[0]).toHaveProperty('change');
                expect(result[0]).toHaveProperty('changeRate');
            }
        });

        test('当数据为空时应该返回空数组', () => {
            const result = statisticalAnalysisUtils.calculateWeeklyAverageChange(emptyRawData, 'weight');
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });
    });

    describe('calculateMetricTrend', () => {
        test('应该计算指标趋势', () => {
            const result = statisticalAnalysisUtils.calculateMetricTrend(mockRawData, 'weight');
            
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(6);
            expect(result[0]).toHaveProperty('date');
            expect(result[0]).toHaveProperty('value');
        });

        test('当数据为空时应该返回空数组', () => {
            const result = statisticalAnalysisUtils.calculateMetricTrend(emptyRawData, 'weight');
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });
    });

    describe('analyzeTrendDirection', () => {
        test('应该分析指标趋势方向', () => {
            const trendData = statisticalAnalysisUtils.calculateMetricTrend(mockRawData, 'weight');
            const result = statisticalAnalysisUtils.analyzeTrendDirection(trendData);
            
            expect(result).toHaveProperty('direction');
            expect(result).toHaveProperty('strength');
            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('change');
            expect(result).toHaveProperty('percentChange');
            
            // 验证趋势方向为下降
            expect(result.direction).toBe('decreasing');
            expect(result.change).toBeLessThan(0);
        });

        test('当数据不足时应该返回数据不足的提示', () => {
            const insufficientData = [{ date: '2026-01-01', value: 140 }];
            const result = statisticalAnalysisUtils.analyzeTrendDirection(insufficientData);
            
            expect(result.direction).toBe('insufficient_data');
            expect(result.message).toBe('数据不足，无法分析趋势');
        });

        test('当数据稳定时应该返回稳定的提示', () => {
            const stableData = [
                { date: '2026-01-01', value: 140 },
                { date: '2026-01-15', value: 140.5 },
                { date: '2026-02-01', value: 140.2 }
            ];
            const result = statisticalAnalysisUtils.analyzeTrendDirection(stableData);
            
            expect(result.direction).toBe('stable');
            expect(result.message).toBe('指标基本稳定');
        });

        test('当数据上升时应该返回上升的提示', () => {
            const increasingData = [
                { date: '2026-01-01', value: 130 },
                { date: '2026-01-15', value: 132 },
                { date: '2026-02-01', value: 134 }
            ];
            const result = statisticalAnalysisUtils.analyzeTrendDirection(increasingData);
            
            expect(result.direction).toBe('increasing');
            expect(result.change).toBeGreaterThan(0);
        });
    });

    describe('analyzeDataVolatility', () => {
        test('应该分析数据波动', () => {
            const result = statisticalAnalysisUtils.analyzeDataVolatility(mockRawData, 'weight');
            
            expect(result).toHaveProperty('volatility');
            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('standardDeviation');
        });

        test('当数据不足时应该返回数据不足的提示', () => {
            const insufficientData = [{ date: '2026-01-01', weight: 140 }];
            const result = statisticalAnalysisUtils.analyzeDataVolatility(insufficientData, 'weight');
            
            expect(result.volatility).toBe(0);
            expect(result.message).toBe('数据不足，无法分析波动');
        });
    });

    describe('generateStatisticalReport', () => {
        test('应该生成统计分析报告', () => {
            const result = statisticalAnalysisUtils.generateStatisticalReport(
                mockRawData, 
                'weight', 
                'all', 
                'monthly'
            );
            
            expect(result).toHaveProperty('metric');
            expect(result).toHaveProperty('timeRange');
            expect(result).toHaveProperty('statType');
            expect(result).toHaveProperty('statsData');
            expect(result).toHaveProperty('trendData');
            expect(result).toHaveProperty('totalStats');
            expect(result).toHaveProperty('trendAnalysis');
            expect(result).toHaveProperty('volatilityAnalysis');
            
            expect(result.metric).toBe('weight');
            expect(result.timeRange).toBe('all');
            expect(result.statType).toBe('monthly');
            expect(Array.isArray(result.statsData)).toBe(true);
            expect(Array.isArray(result.trendData)).toBe(true);
        });

        test('当数据为空时应该返回包含空数据的报告', () => {
            const result = statisticalAnalysisUtils.generateStatisticalReport(
                emptyRawData, 
                'weight', 
                'all', 
                'monthly'
            );
            
            expect(result).toHaveProperty('metric');
            expect(result).toHaveProperty('timeRange');
            expect(result).toHaveProperty('statType');
            expect(result).toHaveProperty('statsData');
            expect(result).toHaveProperty('trendData');
            expect(result).toHaveProperty('totalStats');
            expect(result).toHaveProperty('trendAnalysis');
            expect(result).toHaveProperty('volatilityAnalysis');
            
            expect(Array.isArray(result.statsData)).toBe(true);
            expect(Array.isArray(result.trendData)).toBe(true);
            expect(result.totalStats.count).toBe(0);
        });

        test('应该支持不同的时间范围', () => {
            const result = statisticalAnalysisUtils.generateStatisticalReport(
                mockRawData, 
                'weight', 
                '3months', 
                'monthly'
            );
            
            expect(result.timeRange).toBe('3months');
        });

        test('应该支持不同的统计类型', () => {
            const result = statisticalAnalysisUtils.generateStatisticalReport(
                mockRawData, 
                'weight', 
                'all', 
                'quarterly'
            );
            
            expect(result.statType).toBe('quarterly');
        });
    });
});
