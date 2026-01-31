/*
 * @Author: LinZhuMing
 * @Date: 2026-01-31 14:32:20
 * @LastEditors: LinZhuMing
 * @LastEditTime: 2026-01-31 16:12:57
 * @FilePath: \healthManagement\src\modal\personalInfoModal.js
 * @Description: 
 * 
 */
// 个人基础信息模态框模块

/**
 * 打开个人基础信息模态框
 * @param {Function} toggleSettingsMenu 切换设置菜单的函数
 */
export function openPersonalInfoModal(toggleSettingsMenu) {
    // 先关闭设置菜单
    toggleSettingsMenu();
    document.getElementById('personalInfoModal').style.display = 'block';
    
    // 加载并填充个人基础信息
    loadPersonalInfo();
}

/**
 * 加载个人基础信息到模态框
 */
function loadPersonalInfo() {
    // 从localStorage加载用户基础信息
    const storedUserInfo = localStorage.getItem('userHealthInfo');
    if (storedUserInfo) {
        try {
            const userInfo = JSON.parse(storedUserInfo);
            // 填充到表单
            if (userInfo.height) {
                document.getElementById('userHeight').value = userInfo.height;
            }
            if (userInfo.birthdate) {
                document.getElementById('userBirthdate').value = userInfo.birthdate;
            }
            if (userInfo.gender) {
                document.getElementById('userGender').value = userInfo.gender;
            }
            if (userInfo.activityLevel) {
                document.getElementById('userActivityLevel').value = userInfo.activityLevel;
            }
        } catch (error) {
            console.error('Failed to load user info:', error);
        }
    }
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
/**
 * 根据出生年月日计算年龄
 * @param {string} birthdate 出生年月日
 * @returns {number} 年龄
 */
function calculateAge(birthdate) {
    if (!birthdate) return 0;
    
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

export function saveUserInfo(recalculateAllDerivedMetrics, updateChart, updateMetrics, updateHealthSummary, saveUserInfoToStorage) {
    const height = parseFloat(document.getElementById('userHeight').value);
    const birthdate = document.getElementById('userBirthdate').value;
    const gender = document.getElementById('userGender').value;
    const activityLevel = parseFloat(document.getElementById('userActivityLevel').value);

    if (isNaN(height) || !birthdate) {
        alert('请填写有效的身高和出生年月日');
        return;
    }

    const age = calculateAge(birthdate);
    const userInfo = { height, age, birthdate, gender, activityLevel };
    saveUserInfoToStorage(userInfo);
    
    // 重新计算所有数据的衍生指标
    recalculateAllDerivedMetrics(userInfo);
    
    // 更新图表和指标
    updateChart();
    updateMetrics();
    updateHealthSummary();
    
    alert('基础信息保存成功，所有衍生指标已重新计算');
}
