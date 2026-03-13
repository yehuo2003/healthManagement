// 本地存储管理模块

const STORAGE_KEY = 'healthData';
const USER_INFO_KEY = 'userHealthInfo';
const HEALTH_GOALS_KEY = 'healthGoals';
const CUSTOM_METRICS_KEY = 'customMetrics';
const BACKUP_SETTINGS_KEY = 'backupSettings';
const BACKUP_HISTORY_KEY = 'backupHistory';

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

/**
 * 导入数据
 * @param {Event} event 文件选择事件
 * @param {Function} recalculateAllDerivedMetrics 重新计算衍生指标函数
 * @param {Function} updateChart 更新图表函数
 * @param {Function} updateMetrics 更新指标函数
 * @param {Function} updateHealthSummary 更新健康摘要函数
 * @param {Function} saveData 保存数据函数
 * @param {Object} userInfo 用户信息
 * @param {Array} rawData 原始数据
 */
export function importData(event, recalculateAllDerivedMetrics, updateChart, updateMetrics, updateHealthSummary, saveData, userInfo, rawData) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                // 导入数据
                window.rawData = importedData;
                saveData();
                
                // 重新计算衍生指标
                recalculateAllDerivedMetrics();
                
                // 更新图表和指标
                updateChart();
                updateMetrics();
                updateHealthSummary();
                
                alert('数据导入成功');
            } else {
                alert('导入数据格式错误');
            }
        } catch (error) {
            console.error('Failed to import data:', error);
            alert('数据导入失败，请检查文件格式');
        }
    };
    reader.readAsText(file);
}

/**
 * 备份所有数据
 * @returns {Object} 备份数据
 */
export function backupAllData() {
    const backupData = {
        healthData: getHealthData(),
        userInfo: getUserInfo(),
        healthGoals: getHealthGoals(),
        customMetrics: getCustomMetrics(),
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    };
    
    // 保存到备份历史
    addBackupHistory(backupData);
    
    return backupData;
}

/**
 * 导出备份数据到文件
 */
export function exportBackup() {
    const backupData = backupAllData();
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * 从文件恢复备份数据
 * @param {Event} event 文件选择事件
 * @param {Function} recalculateAllDerivedMetrics 重新计算衍生指标函数
 * @param {Function} updateChart 更新图表函数
 * @param {Function} updateMetrics 更新指标函数
 * @param {Function} updateHealthSummary 更新健康摘要函数
 * @param {Function} saveData 保存数据函数
 * @param {Function} loadCustomMetrics 加载自定义指标函数
 */
export function restoreBackup(event, recalculateAllDerivedMetrics, updateChart, updateMetrics, updateHealthSummary, saveData, loadCustomMetrics) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            // 验证备份数据格式
            if (backupData.healthData && Array.isArray(backupData.healthData)) {
                // 恢复数据
                saveHealthData(backupData.healthData);
                if (backupData.userInfo) {
                    saveUserInfo(backupData.userInfo);
                }
                if (backupData.healthGoals) {
                    saveHealthGoals(backupData.healthGoals);
                }
                if (backupData.customMetrics) {
                    saveCustomMetrics(backupData.customMetrics);
                }
                
                // 更新全局变量
                window.rawData = backupData.healthData;
                window.userInfo = backupData.userInfo || {};
                window.healthGoals = backupData.healthGoals || [];
                window.customMetrics = backupData.customMetrics || [];
                
                // 重新计算衍生指标
                recalculateAllDerivedMetrics();
                
                // 加载自定义指标
                loadCustomMetrics();
                
                // 更新图表和指标
                updateChart();
                updateMetrics();
                updateHealthSummary();
                
                alert('数据恢复成功');
            } else {
                alert('备份文件格式错误');
            }
        } catch (error) {
            console.error('Failed to restore backup:', error);
            alert('数据恢复失败，请检查文件格式');
        }
    };
    reader.readAsText(file);
}

/**
 * 获取备份设置
 * @returns {Object} 备份设置
 */
export function getBackupSettings() {
    return getFromStorage(BACKUP_SETTINGS_KEY) || {
        enabled: false,
        frequency: 'weekly',
        lastBackup: null
    };
}

/**
 * 保存备份设置
 * @param {Object} settings 备份设置
 */
export function saveBackupSettings(settings) {
    saveToStorage(BACKUP_SETTINGS_KEY, settings);
}

/**
 * 获取备份历史
 * @returns {Array} 备份历史记录
 */
export function getBackupHistory() {
    return getFromStorage(BACKUP_HISTORY_KEY) || [];
}

/**
 * 添加备份历史记录
 * @param {Object} backupData 备份数据
 */
export function addBackupHistory(backupData) {
    const history = getBackupHistory();
    const historyItem = {
        id: Date.now().toString(),
        timestamp: backupData.timestamp,
        size: JSON.stringify(backupData).length
    };
    history.unshift(historyItem);
    
    // 只保留最近10条备份记录
    if (history.length > 10) {
        history.splice(10);
    }
    
    saveToStorage(BACKUP_HISTORY_KEY, history);
}

/**
 * 清理备份历史
 */
export function clearBackupHistory() {
    saveToStorage(BACKUP_HISTORY_KEY, []);
}

/**
 * 检查是否需要执行定时备份
 */
export function checkScheduledBackup() {
    const settings = getBackupSettings();
    if (!settings.enabled || !settings.lastBackup) return false;
    
    const lastBackup = new Date(settings.lastBackup);
    const now = new Date();
    const timeDiff = now - lastBackup;
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    
    if (settings.frequency === 'daily' && daysDiff >= 1) {
        return true;
    } else if (settings.frequency === 'weekly' && daysDiff >= 7) {
        return true;
    } else if (settings.frequency === 'monthly' && daysDiff >= 30) {
        return true;
    }
    
    return false;
}

/**
 * 执行定时备份
 */
export function performScheduledBackup() {
    const backupData = backupAllData();
    
    // 更新最后备份时间
    const settings = getBackupSettings();
    settings.lastBackup = new Date().toISOString();
    saveBackupSettings(settings);
    
    return backupData;
}
