// 备份管理模态框模块

import * as dataManager from '../data/index.js';

/**
 * 打开备份管理模态框
 * @param {Function} closeSettingsMenu 关闭设置菜单的函数
 */
export function openBackupModal(closeSettingsMenu) {
    if (closeSettingsMenu) {
        closeSettingsMenu();
    }
    
    const modal = document.getElementById('backupModal');
    if (modal) {
        modal.style.display = 'block';
        
        // 加载备份设置
        loadBackupSettings();
        
        // 加载备份历史
        loadBackupHistory();
    }
}

/**
 * 关闭备份管理模态框
 */
export function closeBackupModal() {
    const modal = document.getElementById('backupModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * 加载备份设置
 */
function loadBackupSettings() {
    const settings = dataManager.getBackupSettings();
    
    const enabledCheckbox = document.getElementById('backupEnabled');
    const frequencySelect = document.getElementById('backupFrequency');
    const lastBackupInfo = document.getElementById('lastBackupInfo');
    
    if (enabledCheckbox) {
        enabledCheckbox.checked = settings.enabled;
    }
    
    if (frequencySelect) {
        frequencySelect.value = settings.frequency || 'weekly';
    }
    
    if (lastBackupInfo) {
        if (settings.lastBackup) {
            lastBackupInfo.textContent = `上次备份: ${new Date(settings.lastBackup).toLocaleString()}`;
        } else {
            lastBackupInfo.textContent = '从未备份';
        }
    }
}

/**
 * 加载备份历史
 */
function loadBackupHistory() {
    const history = dataManager.getBackupHistory();
    const historyContainer = document.getElementById('backupHistory');
    
    if (historyContainer) {
        if (history.length === 0) {
            historyContainer.innerHTML = '<p>暂无备份记录</p>';
        } else {
            let historyHTML = '<table style="width: 100%; border-collapse: collapse;">';
            historyHTML += '<tr><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">时间</th><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">大小</th></tr>';
            
            history.forEach(item => {
                const date = new Date(item.timestamp).toLocaleString();
                const size = (item.size / 1024).toFixed(2);
                historyHTML += `<tr><td style="border: 1px solid #ddd; padding: 8px;">${date}</td><td style="border: 1px solid #ddd; padding: 8px;">${size} KB</td></tr>`;
            });
            
            historyHTML += '</table>';
            historyContainer.innerHTML = historyHTML;
        }
    }
}

/**
 * 保存备份设置
 */
export function saveBackupSettings() {
    const enabledCheckbox = document.getElementById('backupEnabled');
    const frequencySelect = document.getElementById('backupFrequency');
    
    if (enabledCheckbox && frequencySelect) {
        const settings = {
            enabled: enabledCheckbox.checked,
            frequency: frequencySelect.value,
            lastBackup: dataManager.getBackupSettings().lastBackup
        };
        
        dataManager.saveBackupSettings(settings);
        alert('备份设置保存成功');
    }
}

/**
 * 执行手动备份
 */
export function performManualBackup() {
    dataManager.exportBackup();
}

/**
 * 清理备份历史
 */
export function clearBackupHistory() {
    if (confirm('确定要清理所有备份历史记录吗？')) {
        dataManager.clearBackupHistory();
        loadBackupHistory();
        alert('备份历史已清理');
    }
}

/**
 * 触发文件选择对话框
 */
export function triggerFileInput() {
    const fileInput = document.getElementById('backupFileInput');
    if (fileInput) {
        fileInput.click();
    }
}

/**
 * 处理备份文件选择
 * @param {Event} event 文件选择事件
 * @param {Function} recalculateAllDerivedMetrics 重新计算衍生指标函数
 * @param {Function} updateChart 更新图表函数
 * @param {Function} updateMetrics 更新指标函数
 * @param {Function} updateHealthSummary 更新健康摘要函数
 * @param {Function} saveData 保存数据函数
 * @param {Function} loadCustomMetrics 加载自定义指标函数
 */
export function handleBackupFileSelect(event, recalculateAllDerivedMetrics, updateChart, updateMetrics, updateHealthSummary, saveData, loadCustomMetrics) {
    dataManager.restoreBackup(event, recalculateAllDerivedMetrics, updateChart, updateMetrics, updateHealthSummary, saveData, loadCustomMetrics);
    
    // 重置文件输入
    const fileInput = document.getElementById('backupFileInput');
    if (fileInput) {
        fileInput.value = '';
    }
}

/**
 * 初始化备份模态框
 * @param {Function} recalculateAllDerivedMetrics 重新计算衍生指标函数
 * @param {Function} updateChart 更新图表函数
 * @param {Function} updateMetrics 更新指标函数
 * @param {Function} updateHealthSummary 更新健康摘要函数
 * @param {Function} saveData 保存数据函数
 * @param {Function} loadCustomMetrics 加载自定义指标函数
 */
export function initBackupModal(recalculateAllDerivedMetrics, updateChart, updateMetrics, updateHealthSummary, saveData, loadCustomMetrics) {
    // 添加文件选择事件监听器
    const fileInput = document.getElementById('backupFileInput');
    if (fileInput) {
        fileInput.onchange = function(event) {
            handleBackupFileSelect(event, recalculateAllDerivedMetrics, updateChart, updateMetrics, updateHealthSummary, saveData, loadCustomMetrics);
        };
    }
    
    // 检查定时备份
    checkScheduledBackup();
}

/**
 * 检查定时备份
 */
function checkScheduledBackup() {
    if (dataManager.checkScheduledBackup()) {
        if (confirm('检测到需要执行定时备份，是否立即执行？')) {
            dataManager.performScheduledBackup();
            alert('定时备份已完成');
        }
    }
}
