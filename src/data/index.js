// 数据管理主模块

import * as dataLoader from './dataLoader.js';
import * as dataCalculator from './dataCalculator.js';
import * as dataStorage from './dataStorage.js';

// 导出所有数据管理相关功能
export {
    // 数据加载和保存
    dataLoader,
    // 数据计算和衍生指标
    dataCalculator,
    // 本地存储管理
    dataStorage
};

// 直接导出常用函数
export * from './dataLoader.js';
export * from './dataCalculator.js';
export * from './dataStorage.js';

/**
 * 初始化数据
 * @returns {Promise<Object>} 初始化后的数据
 */
export async function initData() {
    // 加载用户基础信息
    const userInfo = dataLoader.loadUserInfo();

    // 加载健康目标数据
    const healthGoals = dataLoader.loadHealthGoals();

    // 从JSON文件加载最新数据，确保用户修改后能看到更新
    let rawData = [];
    try {
        rawData = await dataLoader.loadInitialData();
    } catch (error) {
        console.error('Failed to load initial data:', error);
        // 如果从JSON文件加载失败，尝试从localStorage加载
        rawData = dataStorage.getHealthData();
    }

    return {
        rawData,
        userInfo,
        healthGoals
    };
}
