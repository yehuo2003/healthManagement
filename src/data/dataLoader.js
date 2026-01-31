// 数据加载和保存模块

const STORAGE_KEY = 'healthData';
const USER_INFO_KEY = 'userHealthInfo';
const HEALTH_GOALS_KEY = 'healthGoals';

/**
 * 从JSON文件加载初始数据
 * @returns {Promise<Array>} 加载的数据
 */
export async function loadInitialData() {
    try {
        const response = await fetch('./static/data.json');
        const rawData = await response.json();
        // 保存到localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rawData));
        return rawData;
    } catch (error) {
        console.error('Failed to load initial data:', error);
        // 如果从JSON文件加载失败，尝试从localStorage加载
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        } else {
            return [];
        }
    }
}

/**
 * 保存数据到localStorage
 * @param {Array} data 要保存的数据
 */
export function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * 加载用户信息
 * @returns {Object} 用户信息
 */
export function loadUserInfo() {
    const storedUserInfo = localStorage.getItem(USER_INFO_KEY);
    if (storedUserInfo) {
        return JSON.parse(storedUserInfo);
    }
    return {};
}

/**
 * 保存用户信息
 * @param {Object} userInfo 用户信息
 */
export function saveUserInfo(userInfo) {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
}

/**
 * 加载健康目标数据
 * @returns {Array} 健康目标数据
 */
export function loadHealthGoals() {
    const storedGoals = localStorage.getItem(HEALTH_GOALS_KEY);
    if (storedGoals) {
        return JSON.parse(storedGoals);
    }
    return [];
}

/**
 * 保存健康目标数据
 * @param {Array} healthGoals 健康目标数据
 */
export function saveHealthGoals(healthGoals) {
    localStorage.setItem(HEALTH_GOALS_KEY, JSON.stringify(healthGoals));
}
