// 测试健康目标工具模块
import { addHealthGoal, updateHealthGoal, deleteHealthGoal, updateGoalList } from '../../src/utils/healthGoalUtils.js';

// 模拟 DOM 元素
const mockDOM = {
    'goalMetricType': { value: 'weight' },
    'goalTargetValue': { value: '130' },
    'goalTargetDate': { value: '2026-06-30' },
    'goalId': { value: '1' },
    'goalList': {
        innerHTML: '',
        appendChild: jest.fn()
    }
};

// 模拟 localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};

// 模拟 document 对象
global.document = {
    getElementById: jest.fn((id) => mockDOM[id]),
    createElement: jest.fn(() => ({
        className: '',
        innerHTML: '',
        appendChild: jest.fn()
    })),
    querySelector: jest.fn((selector) => {
        if (selector === '.goal-list') {
            return {
                innerHTML: '',
                appendChild: jest.fn()
            };
        }
        return null;
    })
};

// 模拟 localStorage
global.localStorage = mockLocalStorage;

// 模拟 alert 函数
global.alert = jest.fn();

// 模拟 confirm 函数
global.confirm = jest.fn(() => true);

describe('健康目标工具模块测试', () => {
    beforeEach(() => {
        // 重置所有模拟函数
        jest.clearAllMocks();
    });

    describe('addHealthGoal', () => {
        test('应该添加新的健康目标', () => {
            const rawData = [{ weight: 140, date: '2026-01-01' }];
            const healthGoals = [];
            const userInfo = { height: 175, gender: 'male' };
            const saveHealthGoals = jest.fn();
            const updateGoalList = jest.fn();

            // 调用函数
            addHealthGoal(rawData, healthGoals, userInfo, saveHealthGoals, updateGoalList);

            // 验证函数调用
            expect(updateGoalList).toHaveBeenCalled();
        });

        test('当健康数据为空时应该提示用户', () => {
            const rawData = [];
            const healthGoals = [];
            const userInfo = { height: 175, gender: 'male' };
            const saveHealthGoals = jest.fn();
            const updateGoalList = jest.fn();

            // 调用函数
            addHealthGoal(rawData, healthGoals, userInfo, saveHealthGoals, updateGoalList);

            // 验证函数调用
            expect(alert).toHaveBeenCalledWith('请填写完整的目标信息');
            expect(updateGoalList).not.toHaveBeenCalled();
        });
    });

    describe('updateHealthGoal', () => {
        test('应该更新健康目标', () => {
            const goalId = '1';

            // 调用函数
            updateHealthGoal(goalId);

            // 验证函数调用
            expect(alert).toHaveBeenCalledWith('编辑功能待实现');
        });
    });

    describe('deleteHealthGoal', () => {
        test('应该删除健康目标', () => {
            const goalId = '1';
            const healthGoals = [{ id: '1', metricType: 'weight', targetValue: 130 }];
            const saveHealthGoals = jest.fn();
            const updateGoalList = jest.fn();

            // 调用函数
            deleteHealthGoal(goalId, healthGoals, saveHealthGoals, updateGoalList);

            // 验证函数调用
            expect(saveHealthGoals).toHaveBeenCalled();
            expect(updateGoalList).toHaveBeenCalled();
        });
    });

    describe('updateGoalList', () => {
        test('应该更新目标列表', () => {
            const healthGoals = [{ id: '1', metricType: 'weight', targetValue: 130, initialValue: 140, targetDate: '2026-06-30' }];
            const rawData = [{ weight: 140, date: '2026-01-01' }];
            const userInfo = { height: 175, gender: 'male' };
            const saveHealthGoals = jest.fn();

            // 调用函数
            updateGoalList(healthGoals, rawData, userInfo, saveHealthGoals);

            // 验证函数调用
            expect(document.getElementById).toHaveBeenCalledWith('goalList');
        });
    });
});
