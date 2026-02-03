// 健康趋势预测工具函数测试
import * as healthTrendUtils from '../../src/utils/healthTrendUtils.js';

describe('健康趋势预测工具函数', () => {
    // 测试数据
    const mockHistoricalData = [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-08', value: 98 },
        { date: '2024-01-15', value: 96 },
        { date: '2024-01-22', value: 94 },
        { date: '2024-01-29', value: 92 }
    ];
    
    describe('linearRegression 函数', () => {
        test('应该正确计算线性回归参数', () => {
            const result = healthTrendUtils.linearRegression(mockHistoricalData);
            
            expect(result).toHaveProperty('slope');
            expect(result).toHaveProperty('intercept');
            expect(result).toHaveProperty('rSquared');
            
            // 对于递减的数据，斜率应该为负
            expect(result.slope).toBeLessThan(0);
            // 截距应该接近第一个数据点的值
            expect(result.intercept).toBeCloseTo(100, 0);
            // 拟合度应该接近1（因为是完美的线性关系）
            expect(result.rSquared).toBeCloseTo(1, 2);
        });
        
        test('数据不足时应该返回默认值', () => {
            const result = healthTrendUtils.linearRegression([]);
            expect(result).toEqual({ slope: 0, intercept: 0, rSquared: 0 });
            
            const singleData = [{ date: '2024-01-01', value: 100 }];
            const resultSingle = healthTrendUtils.linearRegression(singleData);
            expect(resultSingle).toEqual({ slope: 0, intercept: 0, rSquared: 0 });
        });
    });
    
    describe('movingAverage 函数', () => {
        test('应该正确计算移动平均值', () => {
            const result = healthTrendUtils.movingAverage(mockHistoricalData, 3);
            
            expect(result).toHaveLength(mockHistoricalData.length);
            
            // 前两个点应该保持不变
            expect(result[0].value).toBe(100);
            expect(result[1].value).toBe(98);
            
            // 第三个点应该是前三个点的平均值
            expect(result[2].value).toBeCloseTo((100 + 98 + 96) / 3, 2);
            
            // 第四个点应该是第二、三、四个点的平均值
            expect(result[3].value).toBeCloseTo((98 + 96 + 94) / 3, 2);
        });
        
        test('数据不足时应该返回原始数据', () => {
            const singleData = [{ date: '2024-01-01', value: 100 }];
            const result = healthTrendUtils.movingAverage(singleData, 3);
            expect(result).toEqual(singleData);
        });
    });
    
    describe('generatePredictionPoints 函数', () => {
        test('应该正确生成预测数据点', () => {
            const regressionResult = { slope: -2, intercept: 100 };
            const result = healthTrendUtils.generatePredictionPoints(mockHistoricalData, 3, regressionResult);
            
            expect(result).toHaveLength(3);
            expect(result[0].isPredicted).toBe(true);
            expect(result[1].isPredicted).toBe(true);
            expect(result[2].isPredicted).toBe(true);
            
            // 预测值应该基于回归方程
            expect(result[0].value).toBeCloseTo(90, 2); // 5th index: 100 + (-2) * 5
            expect(result[1].value).toBeCloseTo(88, 2); // 6th index: 100 + (-2) * 6
            expect(result[2].value).toBeCloseTo(86, 2); // 7th index: 100 + (-2) * 7
        });
        
        test('历史数据为空时应该返回空数组', () => {
            const regressionResult = { slope: -2, intercept: 100 };
            const result = healthTrendUtils.generatePredictionPoints([], 3, regressionResult);
            expect(result).toEqual([]);
        });
    });
    
    describe('predictHealthTrend 函数', () => {
        test('应该正确预测健康趋势', () => {
            const mockRawData = mockHistoricalData.map(item => ({
                date: item.date,
                weight: item.value
            }));
            
            const result = healthTrendUtils.predictHealthTrend(mockRawData, 'weight', 3);
            
            expect(result).toHaveProperty('historicalData');
            expect(result).toHaveProperty('predictedData');
            expect(result).toHaveProperty('regressionResult');
            expect(result).toHaveProperty('trendAnalysis');
            
            expect(result.historicalData).toHaveLength(mockRawData.length);
            expect(result.predictedData).toHaveLength(3);
            expect(result.trendAnalysis).toHaveProperty('direction');
            expect(result.trendAnalysis).toHaveProperty('strength');
            expect(result.trendAnalysis).toHaveProperty('message');
        });
        
        test('数据不足时应该返回合适的结果', () => {
            const mockRawData = [{ date: '2024-01-01', weight: 100 }];
            const result = healthTrendUtils.predictHealthTrend(mockRawData, 'weight', 3);
            
            expect(result.historicalData).toHaveLength(1);
            expect(result.predictedData).toEqual([]);
            expect(result.trendAnalysis.direction).toBe('insufficient_data');
        });
    });
    
    describe('analyzePredictionTrend 函数', () => {
        test('应该正确分析预测趋势', () => {
            const regressionResult = { slope: -0.5, rSquared: 0.95 };
            const result = healthTrendUtils.analyzePredictionTrend(
                regressionResult, 
                mockHistoricalData, 
                [{ date: '2024-02-05', value: 90, isPredicted: true }]
            );
            
            expect(result).toHaveProperty('direction');
            expect(result).toHaveProperty('strength');
            expect(result).toHaveProperty('message');
            expect(result.direction).toBe('decreasing');
            expect(result.strength).toBeGreaterThan(0);
        });
        
        test('数据不足时应该返回合适的结果', () => {
            const regressionResult = { slope: -0.5, rSquared: 0.95 };
            const result = healthTrendUtils.analyzePredictionTrend(regressionResult, [], []);
            
            expect(result.direction).toBe('insufficient_data');
            expect(result.strength).toBe(0);
        });
    });
    
    describe('getTrendPredictionAdvice 函数', () => {
        test('应该根据趋势分析结果返回合适的建议', () => {
            const trendAnalysis = {
                direction: 'decreasing',
                message: '体重呈下降趋势'
            };
            
            const advice = healthTrendUtils.getTrendPredictionAdvice(trendAnalysis, 'weight');
            expect(typeof advice).toBe('string');
            expect(advice).toContain('体重呈下降趋势');
            expect(advice).toContain('建议保持健康的饮食和运动习惯');
        });
        
        test('应该为未知指标返回默认建议', () => {
            const trendAnalysis = {
                direction: 'increasing',
                message: '指标呈上升趋势'
            };
            
            const advice = healthTrendUtils.getTrendPredictionAdvice(trendAnalysis, 'unknownMetric');
            expect(typeof advice).toBe('string');
            expect(advice).toContain('指标呈上升趋势');
            expect(advice).toContain('建议关注变化原因');
        });
    });
});
