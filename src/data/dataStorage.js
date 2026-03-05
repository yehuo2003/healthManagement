// 本地存储管理模块

const STORAGE_KEY = 'healthData';
const USER_INFO_KEY = 'userHealthInfo';
const HEALTH_GOALS_KEY = 'healthGoals';
const CUSTOM_METRICS_KEY = 'customMetrics';

/**
 * 从本地存储获取数据
 * @param {string} key 存储键
 * @returns {any} 存储的数据
 */
export function getFromStorage(key) {
    const storedData = localStorage.getItem(key);
    if (storedData) {
        try {
            return JSON.parse(storedData);
        } catch (error) {
            console.error('Failed to parse stored data:', error);
            return null;
        }
    }
    return null;
}

/**
 * 保存数据到本地存储
 * @param {string} key 存储键
 * @param {any} data 要存储的数据
 */
export function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save data to storage:', error);
    }
}

/**
 * 从本地存储删除数据
 * @param {string} key 存储键
 */
export function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Failed to remove data from storage:', error);
    }
}

/**
 * 清除所有本地存储数据
 */
export function clearStorage() {
    try {
        localStorage.clear();
    } catch (error) {
        console.error('Failed to clear storage:', error);
    }
}

/**
 * 获取健康数据
 * @returns {Array} 健康数据
 */
export function getHealthData() {
    return getFromStorage(STORAGE_KEY) || [];
}

/**
 * 保存健康数据
 * @param {Array} data 健康数据
 */
export function saveHealthData(data) {
    saveToStorage(STORAGE_KEY, data);
}

/**
 * 获取用户信息
 * @returns {Object} 用户信息
 */
export function getUserInfo() {
    return getFromStorage(USER_INFO_KEY) || {};
}

/**
 * 保存用户信息
 * @param {Object} userInfo 用户信息
 */
export function saveUserInfo(userInfo) {
    saveToStorage(USER_INFO_KEY, userInfo);
}

/**
 * 获取健康目标数据
 * @returns {Array} 健康目标数据
 */
export function getHealthGoals() {
    return getFromStorage(HEALTH_GOALS_KEY) || [];
}

/**
 * 保存健康目标数据
 * @param {Array} healthGoals 健康目标数据
 */
export function saveHealthGoals(healthGoals) {
    saveToStorage(HEALTH_GOALS_KEY, healthGoals);
}

/**
 * 获取自定义指标配置
 * @returns {Array} 自定义指标配置
 */
export function getCustomMetrics() {
    return getFromStorage(CUSTOM_METRICS_KEY) || [];
}

/**
 * 保存自定义指标配置
 * @param {Array} customMetrics 自定义指标配置
 */
export function saveCustomMetrics(customMetrics) {
    saveToStorage(CUSTOM_METRICS_KEY, customMetrics);
}

/**
 * 导出数据
 * @param {Array} rawData 原始数据
 */
export function exportData(rawData) {
    const dataStr = JSON.stringify(rawData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}
