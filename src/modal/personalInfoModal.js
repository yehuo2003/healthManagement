// 个人基础信息模态框模块

/**
 * 打开个人基础信息模态框
 * @param {Function} toggleSettingsMenu 切换设置菜单的函数
 */
export function openPersonalInfoModal(toggleSettingsMenu) {
    // 先关闭设置菜单
    toggleSettingsMenu();
    document.getElementById('personalInfoModal').style.display = 'block';
}

/**
 * 关闭个人基础信息模态框
 */
export function closePersonalInfoModal() {
    document.getElementById('personalInfoModal').style.display = 'none';
}

/**
 * 保存个人基础信息
 * @param {Function} recalculateAllDerivedMetrics 重新计算所有衍生指标的函数
 * @param {Function} updateChart 更新图表的函数
 * @param {Function} updateMetrics 更新指标卡片的函数
 * @param {Function} updateHealthSummary 更新健康分析摘要的函数
 * @param {Function} saveUserInfo 保存用户信息的函数
 * @param {Object} userInfo 用户信息
 */
export function saveUserInfo(recalculateAllDerivedMetrics, updateChart, updateMetrics, updateHealthSummary, saveUserInfoToStorage) {
    const height = parseFloat(document.getElementById('userHeight').value);
    const age = parseInt(document.getElementById('userAge').value);
    const gender = document.getElementById('userGender').value;
    const activityLevel = parseFloat(document.getElementById('userActivityLevel').value);

    if (isNaN(height) || isNaN(age)) {
        alert('请填写有效的身高和年龄');
        return;
    }

    const userInfo = { height, age, gender, activityLevel };
    saveUserInfoToStorage(userInfo);
    
    // 重新计算所有数据的衍生指标
    recalculateAllDerivedMetrics(userInfo);
    
    // 更新图表和指标
    updateChart();
    updateMetrics();
    updateHealthSummary();
    
    alert('基础信息保存成功，所有衍生指标已重新计算');
}
