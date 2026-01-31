// 健康数据录入模态框模块

/**
 * 打开健康数据录入模态框
 * @param {Function} toggleSettingsMenu 切换设置菜单的函数
 */
export function openHealthDataModal(toggleSettingsMenu) {
    // 先关闭设置菜单
    toggleSettingsMenu();
    document.getElementById('healthDataModal').style.display = 'block';
}

/**
 * 关闭健康数据录入模态框
 */
export function closeHealthDataModal() {
    document.getElementById('healthDataModal').style.display = 'none';
}

/**
 * 添加或更新健康数据
 * @param {Array} rawData 原始数据
 * @param {Function} recalculateAllDerivedMetrics 重新计算所有衍生指标的函数
 * @param {Function} updateChart 更新图表的函数
 * @param {Function} updateMetrics 更新指标卡片的函数
 * @param {Function} updateHealthSummary 更新健康分析摘要的函数
 * @param {Function} saveData 保存数据的函数
 * @param {Object} userInfo 用户信息
 */
export function addData(rawData, recalculateAllDerivedMetrics, updateChart, updateMetrics, updateHealthSummary, saveData, userInfo) {
    const date = document.getElementById('inputDate').value;
    const weight = parseFloat(document.getElementById('inputWeight').value);
    const fatRate = parseFloat(document.getElementById('inputFatRate').value);
    const muscleMass = parseFloat(document.getElementById('inputMuscleMass').value);
    const waterRate = parseFloat(document.getElementById('inputWaterRate').value);
    const protein = parseFloat(document.getElementById('inputProtein').value);
    const visceralFat = parseFloat(document.getElementById('inputVisceralFat').value);
    const boneMass = parseFloat(document.getElementById('inputBoneMass').value);
    const waist = parseFloat(document.getElementById('inputWaist').value);
    const hip = parseFloat(document.getElementById('inputHip').value);
    const systolic = parseFloat(document.getElementById('inputSystolic').value);
    const diastolic = parseFloat(document.getElementById('inputDiastolic').value);
    const heartRate = parseFloat(document.getElementById('inputHeartRate').value);
    
    if (!date || isNaN(weight)) {
        alert('请填写日期和体重');
        return;
    }
    
    const newData = {
        date: date,
        weight: weight,
        fatRate: fatRate || null,
        muscleMass: muscleMass || null,
        waterRate: waterRate || null,
        protein: protein || null,
        visceralFat: visceralFat || null,
        boneMass: boneMass || null,
        waist: waist || null,
        hip: hip || null,
        systolic: systolic || null,
        diastolic: diastolic || null,
        heartRate: heartRate || null
    };
    
    // 检查是否已存在该日期的数据
    const existingIndex = rawData.findIndex(item => item.date === date);
    if (existingIndex >= 0) {
        // 更新现有数据
        rawData[existingIndex] = newData;
    } else {
        // 添加新数据
        rawData.push(newData);
    }
    
    // 重新计算衍生指标
    recalculateAllDerivedMetrics(userInfo);
    
    // 更新图表和指标
    updateChart();
    updateMetrics();
    updateHealthSummary();
    
    // 保存数据
    saveData(rawData);
    
    alert('数据保存成功');
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
 * @param {Event} event 事件对象
 * @param {Function} recalculateAllDerivedMetrics 重新计算所有衍生指标的函数
 * @param {Function} updateChart 更新图表的函数
 * @param {Function} updateMetrics 更新指标卡片的函数
 * @param {Function} updateHealthSummary 更新健康分析摘要的函数
 * @param {Function} saveData 保存数据的函数
 * @param {Object} userInfo 用户信息
 * @param {Array} rawData 原始数据引用
 */
export function importData(event, recalculateAllDerivedMetrics, updateChart, updateMetrics, updateHealthSummary, saveData, userInfo, rawData) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                // 更新原始数据
                rawData.splice(0, rawData.length, ...importedData);
                saveData(rawData);
                recalculateAllDerivedMetrics(userInfo);
                updateChart();
                updateMetrics();
                updateHealthSummary();
                alert('数据导入成功');
            } else {
                alert('导入的数据格式不正确');
            }
        } catch (error) {
            alert('导入数据失败：' + error.message);
        }
    };
    reader.readAsText(file);
    
    // 重置文件输入
    event.target.value = '';
}
