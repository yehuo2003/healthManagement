// 测试数据计算模块
import {
    calculateBMI,
    calculateBMR,
    calculateTDEE,
    calculateWHR,
    calculateLeanBodyMass,
    calculateFatMass,
    calculateMuscleRate,
    calculateIdealWeight,
    calculateObesityDegree,
    recalculateAllDerivedMetrics,
    calculateMissingMetrics,
    calculateBloodPressureLevel,
    calculateBMILevel,
    calculateWHRLevel,
    calculateVisceralFatLevel,
    calculateWeightLevel,
    calculateFatRateLevel,
    calculateObesityDegreeLevel,
    calculateProteinLevel
} from '../../src/data/dataCalculator.js';

// 模拟用户信息
const mockUserInfo = {
    height: 175, // 厘米
    age: 30,
    gender: 'male',
    activityLevel: 1.55 // 中等活动水平
};

// 模拟数据项
const mockDataItem = {
    weight: 140, // 斤
    fatRate: 20, // %
    muscleMass: 50, // kg
    waist: 85, // 厘米
    hip: 95, // 厘米
    systolic: 120, // mmHg
    diastolic: 80 // mmHg
};

describe('数据计算模块测试', () => {
    describe('calculateBMI', () => {
        test('应该正确计算BMI值', () => {
            // 体重140斤，身高175厘米
            // 140斤 = 70公斤
            // 175厘米 = 1.75米
            // BMI = 70 / (1.75^2) = 70 / 3.0625 = 22.86
            expect(calculateBMI(140, 175)).toBe('22.9');
        });

        test('当缺少参数时应该返回null', () => {
            expect(calculateBMI(null, 175)).toBeNull();
            expect(calculateBMI(140, null)).toBeNull();
            expect(calculateBMI(null, null)).toBeNull();
        });
    });

    describe('calculateBMR', () => {
        test('应该正确计算男性BMR', () => {
            // 体重140斤 = 70公斤
            // 身高175厘米
            // 年龄30岁
            // 男性BMR = 10*70 + 6.25*175 - 5*30 + 5 = 700 + 1093.75 - 150 + 5 = 1648.75
            expect(calculateBMR(140, 175, 30, 'male')).toBeCloseTo(1648.75, 0);
        });

        test('应该正确计算女性BMR', () => {
            // 体重120斤 = 60公斤
            // 身高160厘米
            // 年龄25岁
            // 女性BMR = 10*60 + 6.25*160 - 5*25 - 161 = 600 + 1000 - 125 - 161 = 1314
            expect(calculateBMR(120, 160, 25, 'female')).toBeCloseTo(1314, 0);
        });

        test('当缺少参数时应该返回null', () => {
            expect(calculateBMR(null, 175, 30, 'male')).toBeNull();
            expect(calculateBMR(140, null, 30, 'male')).toBeNull();
            expect(calculateBMR(140, 175, null, 'male')).toBeNull();
            expect(calculateBMR(140, 175, 30, null)).toBeNull();
        });
    });

    describe('calculateTDEE', () => {
        test('应该正确计算TDEE', () => {
            // BMR = 1600
            // 活动水平系数 = 1.55
            // TDEE = 1600 * 1.55 = 2480
            expect(calculateTDEE(1600, 1.55)).toBe(2480);
        });

        test('当缺少参数时应该返回null', () => {
            expect(calculateTDEE(null, 1.55)).toBeNull();
            expect(calculateTDEE(1600, null)).toBeNull();
        });
    });

    describe('calculateWHR', () => {
        test('应该正确计算腰臀比', () => {
            // 腰围85厘米，臀围95厘米
            // WHR = 85 / 95 = 0.8947
            expect(calculateWHR(85, 95)).toBe('0.89');
        });

        test('当缺少参数时应该返回null', () => {
            expect(calculateWHR(null, 95)).toBeNull();
            expect(calculateWHR(85, null)).toBeNull();
        });
    });

    describe('calculateLeanBodyMass', () => {
        test('应该正确计算瘦体重', () => {
            // 体重140斤，体脂率20%
            // 瘦体重 = 140 * (1 - 20/100) = 140 * 0.8 = 112斤
            expect(calculateLeanBodyMass(140, 20)).toBe('112.0');
        });

        test('当缺少参数时应该返回null', () => {
            expect(calculateLeanBodyMass(null, 20)).toBeNull();
            expect(calculateLeanBodyMass(140, null)).toBeNull();
        });
    });

    describe('calculateFatMass', () => {
        test('应该正确计算脂肪重量', () => {
            // 体重140斤，体脂率20%
            // 脂肪重量 = 140 * (20/100) = 140 * 0.2 = 28斤
            expect(calculateFatMass(140, 20)).toBe('28.0');
        });

        test('当缺少参数时应该返回null', () => {
            expect(calculateFatMass(null, 20)).toBeNull();
            expect(calculateFatMass(140, null)).toBeNull();
        });
    });

    describe('calculateMuscleRate', () => {
        test('应该正确计算肌肉率', () => {
            // 肌肉量50公斤，体重140斤
            // 肌肉率 = (50 * 2 / 140) * 100 = (100 / 140) * 100 = 71.428%
            expect(calculateMuscleRate(50, 140)).toBe('71.4');
        });

        test('当缺少参数时应该返回null', () => {
            expect(calculateMuscleRate(null, 140)).toBeNull();
            expect(calculateMuscleRate(50, null)).toBeNull();
        });
    });

    describe('calculateIdealWeight', () => {
        test('应该正确计算男性理想体重', () => {
            // 身高175厘米
            // 男性理想体重 = (175 - 80) * 0.7 = 95 * 0.7 = 66.5公斤 = 133斤
            expect(calculateIdealWeight(175, 'male')).toBe('133.0');
        });

        test('应该正确计算女性理想体重', () => {
            // 身高160厘米
            // 女性理想体重 = (160 - 70) * 0.6 = 90 * 0.6 = 54公斤 = 108斤
            expect(calculateIdealWeight(160, 'female')).toBe('108.0');
        });

        test('当缺少参数时应该返回null', () => {
            expect(calculateIdealWeight(null, 'male')).toBeNull();
            expect(calculateIdealWeight(175, null)).toBeNull();
        });
    });

    describe('calculateObesityDegree', () => {
        test('应该正确计算肥胖度', () => {
            // 实际体重140斤，身高175厘米，性别男
            // 理想体重 = (175 - 80) * 0.7 * 2 = 133斤
            // 肥胖度 = (140 - 133) / 133 * 100 = 7 / 133 * 100 = 5.263%
            expect(calculateObesityDegree(140, 175, 'male')).toBe('5.3');
        });

        test('当缺少参数时应该返回null', () => {
            expect(calculateObesityDegree(null, 175, 'male')).toBeNull();
            expect(calculateObesityDegree(140, null, 'male')).toBeNull();
            expect(calculateObesityDegree(140, 175, null)).toBeNull();
        });
    });

    describe('calculateBloodPressureLevel', () => {
        test('应该正确计算血压等级', () => {
            expect(calculateBloodPressureLevel(110, 70)).toBe('正常');
            expect(calculateBloodPressureLevel(130, 85)).toBe('高血压前期');
            expect(calculateBloodPressureLevel(150, 95)).toBe('高血压1级');
            expect(calculateBloodPressureLevel(180, 110)).toBe('高血压2级');
        });

        test('当缺少参数时应该返回N/A', () => {
            expect(calculateBloodPressureLevel(null, 80)).toBe('N/A');
            expect(calculateBloodPressureLevel(120, null)).toBe('N/A');
        });
    });

    describe('calculateBMILevel', () => {
        test('应该正确计算BMI等级', () => {
            expect(calculateBMILevel(17)).toBe('偏瘦');
            expect(calculateBMILevel(22)).toBe('正常');
            expect(calculateBMILevel(26)).toBe('超重');
            expect(calculateBMILevel(30)).toBe('肥胖');
        });

        test('当缺少参数时应该返回N/A', () => {
            expect(calculateBMILevel(null)).toBe('N/A');
        });
    });

    describe('calculateWHRLevel', () => {
        test('应该正确计算腰臀比等级', () => {
            // 男性
            expect(calculateWHRLevel(0.85, 'male')).toBe('正常');
            expect(calculateWHRLevel(0.95, 'male')).toBe('中心性肥胖');
            // 女性
            expect(calculateWHRLevel(0.80, 'female')).toBe('正常');
            expect(calculateWHRLevel(0.90, 'female')).toBe('中心性肥胖');
        });

        test('当缺少参数时应该返回N/A', () => {
            expect(calculateWHRLevel(null, 'male')).toBe('N/A');
            expect(calculateWHRLevel(0.85, null)).toBe('N/A');
        });
    });

    describe('calculateVisceralFatLevel', () => {
        test('应该正确计算内脏脂肪等级', () => {
            expect(calculateVisceralFatLevel(8)).toBe('正常');
            expect(calculateVisceralFatLevel(12)).toBe('偏高');
            expect(calculateVisceralFatLevel(16)).toBe('肥胖');
        });

        test('当缺少参数时应该返回N/A', () => {
            expect(calculateVisceralFatLevel(null)).toBe('N/A');
        });
    });

    describe('calculateWeightLevel', () => {
        test('应该正确计算体重等级', () => {
            // 体重140斤，身高175厘米，性别男
            // BMI = 22.9，正常
            expect(calculateWeightLevel(140, 175, 'male')).toBe('正常');
        });

        test('当缺少参数时应该返回N/A', () => {
            expect(calculateWeightLevel(null, 175, 'male')).toBe('N/A');
            expect(calculateWeightLevel(140, null, 'male')).toBe('N/A');
            expect(calculateWeightLevel(140, 175, null)).toBe('N/A');
        });
    });

    describe('calculateFatRateLevel', () => {
        test('应该正确计算体脂率等级', () => {
            // 男性
            expect(calculateFatRateLevel(8, 'male')).toBe('偏瘦');
            expect(calculateFatRateLevel(15, 'male')).toBe('正常');
            expect(calculateFatRateLevel(22, 'male')).toBe('超重');
            expect(calculateFatRateLevel(28, 'male')).toBe('肥胖');
            // 女性
            expect(calculateFatRateLevel(12, 'female')).toBe('偏瘦');
            expect(calculateFatRateLevel(20, 'female')).toBe('正常');
            expect(calculateFatRateLevel(28, 'female')).toBe('超重');
            expect(calculateFatRateLevel(32, 'female')).toBe('肥胖');
        });

        test('当缺少参数时应该返回N/A', () => {
            expect(calculateFatRateLevel(null, 'male')).toBe('N/A');
            expect(calculateFatRateLevel(15, null)).toBe('N/A');
        });
    });

    describe('calculateObesityDegreeLevel', () => {
        test('应该正确计算肥胖度等级', () => {
            expect(calculateObesityDegreeLevel(-25)).toBe('消瘦');
            expect(calculateObesityDegreeLevel(-15)).toBe('偏瘦');
            expect(calculateObesityDegreeLevel(5)).toBe('标准');
            expect(calculateObesityDegreeLevel(15)).toBe('偏胖');
            expect(calculateObesityDegreeLevel(30)).toBe('肥胖');
            expect(calculateObesityDegreeLevel(60)).toBe('重度');
        });

        test('当缺少参数时应该返回N/A', () => {
            expect(calculateObesityDegreeLevel(null)).toBe('N/A');
        });
    });

    describe('calculateProteinLevel', () => {
        test('应该正确计算蛋白质等级', () => {
            expect(calculateProteinLevel(14)).toBe('不足');
            expect(calculateProteinLevel(18)).toBe('标准');
            expect(calculateProteinLevel(22)).toBe('优');
        });

        test('当缺少参数时应该返回N/A', () => {
            expect(calculateProteinLevel(null)).toBe('N/A');
        });
    });

    describe('calculateMissingMetrics', () => {
        test('应该正确计算缺失的衍生指标', () => {
            const dataItem = {
                weight: 140,
                fatRate: 20,
                muscleMass: 50,
                waist: 85,
                hip: 95
            };

            const enhancedItem = calculateMissingMetrics(dataItem, mockUserInfo);

            expect(enhancedItem.bmi).toBeDefined();
            expect(enhancedItem.bmr).toBeDefined();
            expect(enhancedItem.whr).toBeDefined();
            expect(enhancedItem.muscleRate).toBeDefined();
            expect(enhancedItem.leanBodyMass).toBeDefined();
            expect(enhancedItem.fatMass).toBeDefined();
            expect(enhancedItem.obesityDegree).toBeDefined();
        });
    });

    describe('recalculateAllDerivedMetrics', () => {
        test('应该正确重新计算所有衍生指标', () => {
            const rawData = [
                {
                    date: '2026-01-01',
                    weight: 140,
                    fatRate: 20,
                    muscleMass: 50,
                    waist: 85,
                    hip: 95
                }
            ];

            const enhancedData = recalculateAllDerivedMetrics(rawData, mockUserInfo);

            expect(enhancedData).toHaveLength(1);
            expect(enhancedData[0].bmi).toBeDefined();
            expect(enhancedData[0].bmr).toBeDefined();
            expect(enhancedData[0].whr).toBeDefined();
            expect(enhancedData[0].muscleRate).toBeDefined();
            expect(enhancedData[0].leanBodyMass).toBeDefined();
            expect(enhancedData[0].fatMass).toBeDefined();
            expect(enhancedData[0].obesityDegree).toBeDefined();
        });
    });
});
