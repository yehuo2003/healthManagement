import * as echarts from 'echarts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// 导入数据管理模块
import * as dataManager from './data/index.js';

// 导入图表模块
import * as chartManager from './chart/index.js';

// 导入模态框模块
import * as modalManager from './modal/index.js';

// 导入工具函数模块
import * as healthGoalUtils from './utils/healthGoalUtils.js';
import * as healthReportUtils from './utils/healthReportUtils.js';

// 导入配置模块
import { healthMetricsConfig, levelColors, chartMetrics, STORAGE_KEY, USER_INFO_KEY, HEALTH_GOALS_KEY, formatDate, weightChangeTerms, fatRateTerms, trendTerms } from './config/index.js';

// 全局变量
let rawData = [];
let userInfo = {};
let healthGoals = [];
let currentMetrics = ['weight', 'fatRate'];
let myChart = null;

// 全局函数定义，确保在页面加载时就可用
window.toggleSettingsMenu = function() {
    const dropdown = document.getElementById('settingsDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
};

window.toggleMetric = function(metricKey, isChecked) {
    if (isChecked) {
        if (!currentMetrics.includes(metricKey)) {
            currentMetrics.push(metricKey);
        }
    } else {
        currentMetrics = currentMetrics.filter(key => key !== metricKey);
        // 确保至少有一个指标被选中
        if (currentMetrics.length === 0) {
            currentMetrics.push('weight');
            // 确保复选框状态一致
            const checkbox = document.querySelector(`input[value="weight"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        }
    }
    // 更新图表
    updateChart();
};

// 模态框控制函数
window.openPersonalInfoModal = function() {
    modalManager.openPersonalInfoModal(toggleSettingsMenu);
};

window.closePersonalInfoModal = function() {
    modalManager.closePersonalInfoModal();
};

window.openHealthDataModal = function() {
    modalManager.openHealthDataModal(toggleSettingsMenu);
};

window.closeHealthDataModal = function() {
    modalManager.closeHealthDataModal();
};

window.openDataComparisonModal = function() {
    modalManager.openDataComparisonModal(toggleSettingsMenu, initDateSelectors);
};

window.closeDataComparisonModal = function() {
    modalManager.closeDataComparisonModal();
};

window.openHealthGoalModal = function() {
    // 先关闭设置菜单
    toggleSettingsMenu();
    // 更新目标列表
    updateGoalList();
    document.getElementById('healthGoalModal').style.display = 'block';
    
    // 添加指标类型选择事件监听器，自动填充目标值
    const metricTypeSelect = document.getElementById('goalMetricType');
    if (metricTypeSelect) {
        // 移除现有的事件监听器，避免重复添加
        metricTypeSelect.onchange = null;
        
        // 添加新的事件监听器
        metricTypeSelect.onchange = function() {
            const metricType = this.value;
            // 获取最新的健康数据
            if (rawData.length === 0) return;
            
            const latestData = [...rawData].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            let currentValue = latestData[metricType];
            
            // 如果是BMI，需要计算
            if (metricType === 'bmi' && !currentValue && userInfo.height) {
                currentValue = dataManager.calculateBMI(latestData.weight, userInfo.height);
            }
            
            // 填充目标值输入框
            if (currentValue) {
                document.getElementById('goalTargetValue').value = currentValue;
            }
        };
        
        // 触发一次change事件，填充当前选择的指标值
        metricTypeSelect.dispatchEvent(new Event('change'));
    }
};

window.closeHealthGoalModal = function() {
    document.getElementById('healthGoalModal').style.display = 'none';
};

// 健康报告相关函数
window.openHealthReportModal = function() {
    toggleSettingsMenu();
    const modal = document.getElementById('healthReportModal');
    if (modal) {
        modal.style.display = 'block';
    }
};

window.closeHealthReportModal = function() {
    const modal = document.getElementById('healthReportModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// 健康数据比对相关函数
window.compareHealthData = function() {
    modalManager.compareHealthData(rawData, userInfo, healthMetricsConfig, levelColors);
};

// 根据出生年月日计算年龄
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

// 个人基础信息相关函数
window.saveUserInfo = function() {
    const height = parseFloat(document.getElementById('userHeight').value);
    const birthdate = document.getElementById('userBirthdate').value;
    const gender = document.getElementById('userGender').value;
    const activityLevel = parseFloat(document.getElementById('userActivityLevel').value);

    if (isNaN(height) || !birthdate) {
        alert('请填写有效的身高和出生年月日');
        return;
    }

    const age = calculateAge(birthdate);
    
    userInfo = { height, age, birthdate, gender, activityLevel };
    dataManager.saveUserInfo(userInfo);
    
    // 重新计算所有数据的衍生指标
    recalculateAllDerivedMetrics();
    
    // 更新图表和指标
    updateChart();
    updateMetrics();
    updateHealthSummary();
    
    alert('基础信息保存成功，所有衍生指标已重新计算');
};

// 健康数据录入相关函数
window.addData = function() {
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
    recalculateAllDerivedMetrics();
    
    // 更新图表和指标
    updateChart();
    updateMetrics();
    updateHealthSummary();
    
    alert('数据保存成功');
};

window.exportData = function() {
    dataManager.exportData(rawData);
};

window.importData = function(event) {
    dataManager.importData(event, recalculateAllDerivedMetrics, updateChart, updateMetrics, updateHealthSummary, saveData, userInfo, rawData);
};

// 健康目标管理相关函数
window.addHealthGoal = function() {
    healthGoalUtils.addHealthGoal(rawData, healthGoals, userInfo, saveHealthGoals, updateGoalList);
};

window.updateHealthGoal = function(goalId) {
    healthGoalUtils.updateHealthGoal(goalId);
};

window.deleteHealthGoal = function(goalId) {
    healthGoalUtils.deleteHealthGoal(goalId, healthGoals, saveHealthGoals, updateGoalList);
};

// 初始化数据
async function initData() {
    // 加载用户基础信息
    userInfo = dataManager.getUserInfo();
    
    // 加载健康目标数据
    healthGoals = dataManager.getHealthGoals();

    // 从JSON文件加载最新数据，确保用户修改后能看到更新
    try {
        rawData = await dataManager.loadInitialData();
        // 保存到localStorage
        dataManager.saveData(rawData);
    } catch (error) {
        console.error('Failed to load initial data:', error);
        // 如果从JSON文件加载失败，尝试从localStorage加载
        rawData = dataManager.getHealthData();
    }
    
    // 渲染指标选择器
    renderMetricSelector();
    
    // 更新图表和指标
    updateChart();
    updateMetrics();
    updateHealthSummary();
    
    // 初始化图表点击事件
    addChartClickEvent();
    // 初始化图表缩放事件
    addChartZoomEvent();
}

// 保存数据到localStorage
function saveData() {
    dataManager.saveData(rawData);
}

// 保存健康目标
function saveHealthGoals() {
    localStorage.setItem(HEALTH_GOALS_KEY, JSON.stringify(healthGoals));
}

// 重新计算所有数据的衍生指标
function recalculateAllDerivedMetrics() {
    rawData = dataManager.recalculateAllDerivedMetrics(rawData, userInfo);
    // 保存更新后的数据到localStorage
    saveData();
}

// 计算缺失的衍生指标
function calculateMissingMetrics(dataItem) {
    return dataManager.calculateMissingMetrics(dataItem, userInfo);
}

// 初始化日期选择器
function initDateSelectors() {
    modalManager.initDateSelectors(rawData);
}

// 渲染指标选择器
function renderMetricSelector() {
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'summary';
    selectorContainer.innerHTML = `
        <h3>图表指标选择</h3>
        <div class="metric-selector" style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${chartMetrics.map(metric => `
                <label style="display: flex; align-items: center; gap: 5px; padding: 8px 12px; background: ${currentMetrics.includes(metric.key) ? metric.color : '#ecf0f1'}; color: ${currentMetrics.includes(metric.key) ? 'white' : '#333'}; border-radius: 20px; cursor: pointer; transition: all 0.3s;">
                    <input type="checkbox" name="metric" value="${metric.key}" ${currentMetrics.includes(metric.key) ? 'checked' : ''} onchange="toggleMetric('${metric.key}', this.checked)" style="margin: 0;">
                    <span>${metric.name}</span>
                </label>
            `).join('')}
        </div>
    `;
    
    // 插入到图表容器之前
    const chartContainer = document.getElementById('chart');
    if (chartContainer) {
        chartContainer.parentNode.insertBefore(selectorContainer, chartContainer);
    }
}

// 更新图表
function updateChart() {
    myChart = chartManager.updateChart(myChart, rawData, currentMetrics, chartMetrics, userInfo, dataManager.calculateMissingMetrics);
}

// 添加图表点击事件
function addChartClickEvent() {
    chartManager.addChartClickEvent(myChart, showDailyMetrics, rawData);
}

// 添加图表缩放事件
function addChartZoomEvent() {
    chartManager.addChartZoomEvent(myChart, updateMetricsByZoom, updateHealthSummaryByZoom);
}

// 根据图表缩放更新指标卡片
function updateMetricsByZoom() {
    if (!myChart) return;
    
    // 获取图表当前的缩放范围
    const option = myChart.getOption();
    if (!option || !option.dataZoom || !option.dataZoom[0]) return;
    
    const dataZoom = option.dataZoom[0];
    const start = dataZoom.start;
    const end = dataZoom.end;
    
    // 根据缩放范围筛选数据
    const filteredData = getFilteredDataByZoom(start, end);
    
    // 更新指标卡片
    updateMetricsForPeriod(filteredData);
}

// 根据图表缩放更新健康分析摘要
function updateHealthSummaryByZoom() {
    if (!myChart) return;
    
    // 获取图表当前的缩放范围
    const option = myChart.getOption();
    if (!option || !option.dataZoom || !option.dataZoom[0]) return;
    
    const dataZoom = option.dataZoom[0];
    const start = dataZoom.start;
    const end = dataZoom.end;
    
    // 根据缩放范围筛选数据
    const filteredData = getFilteredDataByZoom(start, end);
    
    // 更新健康分析摘要
    updateHealthSummaryForPeriod(filteredData);
}

// 根据图表缩放范围筛选数据
function getFilteredDataByZoom(start, end) {
    if (!myChart) return rawData;
    
    // 获取图表当前的所有数据点
    const option = myChart.getOption();
    if (!option || !option.xAxis || !option.xAxis[0] || !option.xAxis[0].data) return rawData;
    
    const allDates = option.xAxis[0].data;
    const startIndex = Math.floor((start / 100) * (allDates.length - 1));
    const endIndex = Math.floor((end / 100) * (allDates.length - 1));
    
    // 获取缩放范围内的日期
    const zoomedDates = allDates.slice(startIndex, endIndex + 1);
    
    // 根据日期筛选数据
    return rawData.filter(item => zoomedDates.includes(item.date));
}

// 当前显示的日期索引
let currentDateIndex = -1;

// 显示每日健康数据
function showDailyMetrics(date) {
    // 查找当日数据的索引
    currentDateIndex = rawData.findIndex(item => item.date === date);
    if (currentDateIndex === -1) {
        return;
    }
    
    const dailyData = rawData[currentDateIndex];
    
    // 更新箭头显示状态
    updateArrowVisibility();

    // 手动计算BMI（因为原始数据中可能没有）
    let bmi = dailyData.bmi;
    if (!bmi && userInfo.height) {
        bmi = dataManager.calculateBMI(dailyData.weight, userInfo.height);
    }

    // 手动计算BMR（因为原始数据中可能没有）
    let bmr = dailyData.bmr;
    if (!bmr && userInfo.height && userInfo.age && userInfo.gender) {
        bmr = dataManager.calculateBMR(dailyData.weight, userInfo.height, userInfo.age, userInfo.gender);
        bmr = bmr ? Math.round(bmr) : null;
    }
    
    // 计算TDEE
    let tdee = null;
    if (bmr && userInfo.activityLevel) {
        tdee = dataManager.calculateTDEE(bmr, userInfo.activityLevel);
    }

    // 计算衍生指标，优先使用已有值，否则重新计算
    const leanBodyMass = dailyData.leanBodyMass || dataManager.calculateLeanBodyMass(dailyData.weight, dailyData.fatRate);
    const fatMass = dailyData.fatMass || dataManager.calculateFatMass(dailyData.weight, dailyData.fatRate);
    const muscleRate = dailyData.muscleRate || dataManager.calculateMuscleRate(dailyData.muscleMass, dailyData.weight);
    const idealWeight = dataManager.calculateIdealWeight(userInfo.height, userInfo.gender);
    // 计算肥胖度
    const obesityDegree = dailyData.obesityDegree || dataManager.calculateObesityDegree(dailyData.weight, userInfo.height, userInfo.gender);
    // 计算肥胖度风险等级
    const obesityDegreeLevel = dataManager.calculateObesityDegreeLevel(obesityDegree);
    
    const bloodPressureLevel = dataManager.calculateBloodPressureLevel(dailyData.systolic, dailyData.diastolic);
    const bmiLevel = dataManager.calculateBMILevel(bmi);
    const whrLevel = dataManager.calculateWHRLevel(dailyData.whr, userInfo.gender);
    const visceralFatLevel = dataManager.calculateVisceralFatLevel(dailyData.visceralFat);
    
    // 计算体重、体脂率等指标的风险等级
    const weightLevel = dataManager.calculateWeightLevel(dailyData.weight, userInfo.height, userInfo.gender);
    const fatRateLevel = dataManager.calculateFatRateLevel(dailyData.fatRate, userInfo.gender);
    const proteinLevel = dataManager.calculateProteinLevel(dailyData.protein);

    // 定义指标风险等级映射，用于直接为数值添加颜色
    const metricRiskLevels = {
        '体重': weightLevel,
        '体脂率': fatRateLevel,
        'BMI': bmiLevel,
        '内脏脂肪': visceralFatLevel,
        '腰臀比': whrLevel,
        '收缩压': bloodPressureLevel,
        '舒张压': bloodPressureLevel,
        '肥胖度': obesityDegreeLevel,
        '蛋白质': proteinLevel
    };
    
    // 准备所有指标，用"-"占位
    const allMetrics = [
        // 基础指标
        { label: '日期', value: date },
        { label: '体重', value: dailyData.weight ? `${dailyData.weight} 斤` : '-' },
        { label: '体脂率', value: dailyData.fatRate ? `${dailyData.fatRate}%` : '-' },
        { label: '肌肉量', value: dailyData.muscleMass !== undefined && dailyData.muscleMass !== null ? `${dailyData.muscleMass} kg` : '-' },
        { label: '水分率', value: dailyData.waterRate !== undefined && dailyData.waterRate !== null ? `${dailyData.waterRate}%` : '-' },
        { label: '蛋白质', value: dailyData.protein !== undefined && dailyData.protein !== null ? `${dailyData.protein}%` : '-' },
        { label: '骨量', value: dailyData.boneMass !== undefined && dailyData.boneMass !== null ? `${dailyData.boneMass} kg` : '-' },
        { label: '内脏脂肪', value: dailyData.visceralFat !== undefined && dailyData.visceralFat !== null ? dailyData.visceralFat : '-' },
        { label: '腰围', value: dailyData.waist !== undefined && dailyData.waist !== null ? `${dailyData.waist} cm` : '-' },
        { label: '臀围', value: dailyData.hip !== undefined && dailyData.hip !== null ? `${dailyData.hip} cm` : '-' },
        { label: '收缩压', value: dailyData.systolic !== undefined && dailyData.systolic !== null ? `${dailyData.systolic} mmHg` : '-' },
        { label: '舒张压', value: dailyData.diastolic !== undefined && dailyData.diastolic !== null ? `${dailyData.diastolic} mmHg` : '-' },
        { label: '静息心率', value: dailyData.heartRate !== undefined && dailyData.heartRate !== null ? `${dailyData.heartRate} 次/分` : '-' },
        
        // 自动计算指标
        { label: 'BMI', value: bmi ? bmi : '-' },
        { label: '基础代谢率', value: bmr ? `${bmr} 大卡` : '-' },
        { label: '每日总消耗(TDEE)', value: tdee ? `${tdee} 大卡` : '-' },
        { label: '腰臀比', value: dailyData.whr !== undefined && dailyData.whr !== null ? dailyData.whr : '-' },
        
        // 衍生指标
        { label: '瘦体重', value: leanBodyMass ? `${leanBodyMass} 斤` : '-' },
        { label: '脂肪重量', value: fatMass ? `${fatMass} 斤` : '-' },
        { label: '肌肉率', value: muscleRate ? `${muscleRate}%` : '-' },
        { label: '理想体重', value: idealWeight ? `${idealWeight} 斤` : '-' },
        { label: '肥胖度', value: obesityDegree ? `${obesityDegree}%` : '-' },
        { label: 'BMI等级', value: bmiLevel && bmiLevel !== 'N/A' ? bmiLevel : '-', isLevel: true },
        { label: '肥胖度等级', value: obesityDegreeLevel && obesityDegreeLevel !== 'N/A' ? obesityDegreeLevel : '-', isLevel: true },
        { label: '血压等级', value: bloodPressureLevel && bloodPressureLevel !== 'N/A' ? bloodPressureLevel : '-', isLevel: true },
        { label: '腰臀比等级', value: whrLevel && whrLevel !== 'N/A' ? whrLevel : '-', isLevel: true },
        { label: '内脏脂肪等级', value: visceralFatLevel && visceralFatLevel !== 'N/A' ? visceralFatLevel : '-', isLevel: true },
        { label: '蛋白质等级', value: proteinLevel && proteinLevel !== 'N/A' ? proteinLevel : '-', isLevel: true }
    ];

    // 更新模态框标题
    const modalTitle = document.getElementById('modalTitle');
    modalTitle.textContent = `${date} 健康数据`;
    
    // 生成指标网格HTML
    let metricsHTML = '<div class="metrics-grid">';
    
    allMetrics.forEach(metric => {
        // 根据是否为等级指标和等级值获取颜色
        let valueColor = '#2c3e50'; // 默认颜色
        if (metric.isLevel && metric.value !== '-') {
            valueColor = levelColors[metric.value] || '#2c3e50';
        } else {
            // 检查是否是需要根据风险等级着色的数值指标
            const riskLevel = metricRiskLevels[metric.label];
            if (riskLevel && riskLevel !== 'N/A' && metric.value !== '-') {
                valueColor = levelColors[riskLevel] || '#2c3e50';
            }
        }
        
        metricsHTML += `
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 14px; color: #7f8c8d;">${metric.label}</span>
                    <span style="font-size: 18px; font-weight: 700; color: ${valueColor};">${metric.value}</span>
                </div>
            </div>
        `;
    });
    
    metricsHTML += '</div>';
    
    // 更新模态框内容
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = metricsHTML;
    
    // 打开模态框
    openModal();
}

// 更新箭头显示状态
function updateArrowVisibility() {
    const prevArrow = document.getElementById('prevArrow');
    const nextArrow = document.getElementById('nextArrow');
    
    // 如果是第一天，隐藏左箭头
    if (currentDateIndex === 0) {
        prevArrow.classList.add('hidden');
    } else {
        prevArrow.classList.remove('hidden');
    }
    
    // 如果是最后一天，隐藏右箭头
    if (currentDateIndex === rawData.length - 1) {
        nextArrow.classList.add('hidden');
    } else {
        nextArrow.classList.remove('hidden');
    }
}

// 导航每日数据
window.navigateDailyData = function(direction) {
    if (currentDateIndex === -1) return;
    
    const newIndex = currentDateIndex + direction;
    if (newIndex >= 0 && newIndex < rawData.length) {
        const newDate = rawData[newIndex].date;
        showDailyMetrics(newDate);
    }
};



// 生成健康分析摘要内容
function generateHealthSummaryText(firstData, lastData) {
    // 计算体重变化和体脂率变化
    const weightChange = lastData.weight - firstData.weight;
    const fatRateChange = (lastData.fatRate && firstData.fatRate) ? (lastData.fatRate - firstData.fatRate) : null;
    const weightChangePercent = ((weightChange / firstData.weight) * 100).toFixed(1);
    
    // 选择合适的术语
    let weightTerm, fatRateTerm, trendTerm;
    
    // 体重变化术语选择
    if (Math.abs(parseFloat(weightChangePercent)) > 5) {
        weightTerm = weightChange < 0 ? 
            weightChangeTerms.significantLoss[Math.floor(Math.random() * weightChangeTerms.significantLoss.length)] :
            weightChangeTerms.significantGain[Math.floor(Math.random() * weightChangeTerms.significantGain.length)];
    } else if (Math.abs(parseFloat(weightChangePercent)) > 1) {
        weightTerm = weightChange < 0 ? 
            weightChangeTerms.slightLoss[Math.floor(Math.random() * weightChangeTerms.slightLoss.length)] :
            weightChangeTerms.slightGain[Math.floor(Math.random() * weightChangeTerms.slightGain.length)];
    } else {
        weightTerm = weightChangeTerms.stable[Math.floor(Math.random() * weightChangeTerms.stable.length)];
    }
    
    // 体脂率变化术语选择
    if (fatRateChange !== null) {
        const fatRateChangePercent = ((fatRateChange / firstData.fatRate) * 100).toFixed(1);
        if (Math.abs(parseFloat(fatRateChangePercent)) > 5) {
            fatRateTerm = fatRateChange < 0 ? 
                fatRateTerms.significantLoss[Math.floor(Math.random() * fatRateTerms.significantLoss.length)] :
                fatRateTerms.significantGain[Math.floor(Math.random() * fatRateTerms.significantGain.length)];
        } else if (Math.abs(parseFloat(fatRateChangePercent)) > 1) {
            fatRateTerm = fatRateChange < 0 ? 
                fatRateTerms.slightLoss[Math.floor(Math.random() * fatRateTerms.slightLoss.length)] :
                fatRateTerms.slightGain[Math.floor(Math.random() * fatRateTerms.slightGain.length)];
        } else {
            fatRateTerm = fatRateTerms.stable[Math.floor(Math.random() * fatRateTerms.stable.length)];
        }
    } else {
        fatRateTerm = '体脂率数据不完整';
    }
    
    // 趋势术语选择
    trendTerm = trendTerms.stable[Math.floor(Math.random() * trendTerms.stable.length)];
    
    // 生成摘要内容
    let summaryText = `<p>根据您的体重变化数据，从${formatDate(firstData.date)}至${formatDate(lastData.date)}，您的体重${weightTerm}`;
    
    if (Math.abs(weightChange) > 0.1) {
        summaryText += `，${weightChange > 0 ? '增加' : '下降'}了${Math.abs(weightChange).toFixed(1)}斤`;
    }
    
    summaryText += `。`;
    
    if (fatRateChange !== null && Math.abs(fatRateChange) > 0.1) {
        summaryText += ` 同时，您的${fatRateTerm}，从${firstData.fatRate}%${fatRateChange > 0 ? '上升' : '下降'}到${lastData.fatRate}%`;
    }
    
    summaryText += `</p>`;
    
    // 添加第二条摘要
    summaryText += `<p>您的${trendTerm}。`;
    
    // 根据情况添加建议
    if (weightChange < 0 && fatRateChange && fatRateChange < 0) {
        summaryText += ` 这是一个非常积极的趋势，建议继续保持当前的健康管理方式。`;
    } else if (weightChange < 0 && fatRateChange && fatRateChange > 0) {
        summaryText += ` 值得注意的是，体脂率有所上升，建议适当增加力量训练，以提高肌肉比例。`;
    } else if (weightChange > 0) {
        summaryText += ` 建议关注饮食结构和运动习惯，保持健康的生活方式。`;
    } else {
        summaryText += ` 建议继续保持良好的健康管理习惯。`;
    }
    
    summaryText += `</p>`;
    
    return summaryText;
}

// 更新健康分析摘要
function updateHealthSummary() {
    if (rawData.length === 0) return;
    
    // 按日期排序
    const sortedData = [...rawData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstData = sortedData[0];
    const lastData = sortedData[sortedData.length - 1];
    
    // 生成摘要内容
    const summaryText = generateHealthSummaryText(firstData, lastData);
    
    // 找到图表元素之后的 summary 元素，并更新其内容
    const chartElement = document.getElementById('chart');
    if (chartElement) {
        // 查找chart元素所在的容器
        const parentElement = chartElement.parentElement;
        
        // 查找健康分析摘要容器 - 它应该是chart之后的第一个summary元素
        let summarySection = null;
        const siblings = parentElement.children;
        
        // 遍历所有子元素，找到chart之后的第一个summary
        let foundChart = false;
        for (let i = 0; i < siblings.length; i++) {
            if (siblings[i] === chartElement) {
                foundChart = true;
            } else if (foundChart && siblings[i].classList.contains('summary')) {
                summarySection = siblings[i];
                break;
            }
        }
        
        // 如果找到，更新内容
        if (summarySection) {
            // 直接替换整个内容，确保完全更新
            summarySection.innerHTML = `<h3>健康分析摘要</h3>${summaryText}`;
        }
    }
}

// 根据时间范围更新图表和相关数据
function updateChartByPeriod(period) {
    // 获取原始数据的副本
    let filteredData = [...rawData];
    
    // 根据时间范围筛选数据
    if (period !== 'all') {
        const now = new Date();
        filteredData = rawData.filter(item => {
            const itemDate = new Date(item.date);
            const timeDiff = now - itemDate;
            const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            
            if (period === '3months') {
                return daysDiff <= 90; // 近3个月
            } else if (period === '1month') {
                return daysDiff <= 30; // 近1个月
            }
            return true;
        });
    }
    
    // 更新图表
    myChart = chartManager.updateChart(myChart, filteredData, currentMetrics, chartMetrics, userInfo, dataManager.calculateMissingMetrics);
    
    // 更新指标卡片
    updateMetricsForPeriod(filteredData);
    
    // 更新健康分析摘要
    updateHealthSummaryForPeriod(filteredData);
}

// 更新指标卡片
function updateMetricsForPeriod(data) {
    if (data.length === 0) return;
    
    // 按日期排序
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstData = sortedData[0];
    const lastData = sortedData[sortedData.length - 1];
    
    // 计算体重变化
    const weightChange = lastData.weight - firstData.weight;
    const weightChangePercent = ((weightChange / firstData.weight) * 100).toFixed(1);
    
    // 计算体脂率变化
    const fatRateChange = (lastData.fatRate || 0) - (firstData.fatRate || 0);
    
    // 更新指标卡片
    const metricsContainer = document.querySelector('.metrics');
    if (metricsContainer) {
        metricsContainer.innerHTML = `
            <div class="metric-card">
                <h4>初始体重</h4>
                <div class="value">${firstData.weight.toFixed(1)} 斤</div>
                <div class="change">${firstData.date}</div>
            </div>
            <div class="metric-card">
                <h4>当前体重</h4>
                <div class="value">${lastData.weight.toFixed(1)} 斤</div>
                <div class="change">${lastData.date}</div>
            </div>
            <div class="metric-card">
                <h4>体重变化</h4>
                <div class="value ${weightChange < 0 ? 'positive' : 'negative'}">${weightChange.toFixed(1)} 斤</div>
                <div class="change ${weightChange < 0 ? 'positive' : 'negative'}">${weightChange < 0 ? '↓' : '↑'} ${Math.abs(weightChangePercent)}%</div>
            </div>
            <div class="metric-card">
                <h4>体脂率变化</h4>
                <div class="value ${fatRateChange < 0 ? 'positive' : 'negative'}">${(firstData.fatRate || 0).toFixed(1)}% → ${(lastData.fatRate || 0).toFixed(1)}%</div>
                <div class="change ${fatRateChange < 0 ? 'positive' : 'negative'}">${fatRateChange < 0 ? '↓' : '↑'} ${Math.abs(fatRateChange).toFixed(1)}%</div>
            </div>
        `;
    }
    
    // 更新时间范围显示
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) {
        subtitle.textContent = `${firstData.date} - ${lastData.date}`;
    }
}

// 更新指标卡片
function updateMetrics() {
    if (rawData.length === 0) return;
    updateMetricsForPeriod(rawData);
}

// 根据时间范围更新健康分析摘要
function updateHealthSummaryForPeriod(filteredData) {
    if (filteredData.length === 0) return;
    
    // 按日期排序
    const sortedData = [...filteredData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstData = sortedData[0];
    const lastData = sortedData[sortedData.length - 1];
    
    // 生成摘要内容
    const summaryText = generateHealthSummaryText(firstData, lastData);
    
    // 找到图表元素之后的 summary 元素，并更新其内容
    const chartElement = document.getElementById('chart');
    if (chartElement) {
        // 查找chart元素所在的容器
        const parentElement = chartElement.parentElement;
        
        // 查找健康分析摘要容器 - 它应该是chart之后的第一个summary元素
        let summarySection = null;
        const siblings = parentElement.children;
        
        // 遍历所有子元素，找到chart之后的第一个summary
        let foundChart = false;
        for (let i = 0; i < siblings.length; i++) {
            if (siblings[i] === chartElement) {
                foundChart = true;
            } else if (foundChart && siblings[i].classList.contains('summary')) {
                summarySection = siblings[i];
                break;
            }
        }
        
        // 如果找到，更新内容
        if (summarySection) {
            // 直接替换整个内容，确保完全更新
            summarySection.innerHTML = `<h3>健康分析摘要</h3>${summaryText}`;
        }
    }
}

// 模态框控制函数
window.openModal = function() {
    document.getElementById('dailyMetricsModal').style.display = 'block';
};

window.closeModal = function() {
    document.getElementById('dailyMetricsModal').style.display = 'none';
};

// 更新目标列表
function updateGoalList() {
    healthGoalUtils.updateGoalList(healthGoals, rawData, userInfo, saveHealthGoals);
}

// 健康报告生成函数
function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const timeRange = document.getElementById('reportTimeRange').value;
    
    const reportData = healthReportUtils.generateReportData(
        reportType, 
        timeRange, 
        rawData, 
        userInfo, 
        healthGoals,
        dataManager.calculateBMILevel,
        dataManager.calculateFatRateLevel,
        dataManager.calculateWeightLevel,
        dataManager.calculateVisceralFatLevel,
        dataManager.calculateBMI
    );
    const reportHTML = healthReportUtils.generateReportHTML(reportData);
    
    document.getElementById('reportPreview').innerHTML = reportHTML;
    
    // 显示导出按钮
    const exportButtons = document.getElementById('exportButtons');
    if (exportButtons) {
        exportButtons.style.display = 'flex';
    }
}

// 导出为图片
function exportAsImage() {
    const reportElement = document.getElementById('reportPreview');
    if (!reportElement || reportElement.innerHTML.includes('点击"生成报告"按钮生成报告预览')) {
        alert('请先生成报告');
        return;
    }
    
    html2canvas(reportElement, {
        scale: 2, // 提高清晰度
        useCORS: true, // 允许加载跨域图片
        logging: false
    }).then(canvas => {
        // 创建下载链接
        const link = document.createElement('a');
        link.download = `健康报告_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

// 导出为PDF
function exportAsPDF() {
    const reportElement = document.getElementById('reportPreview');
    if (!reportElement || reportElement.innerHTML.includes('点击"生成报告"按钮生成报告预览')) {
        alert('请先生成报告');
        return;
    }
    
    html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        pdf.save(`健康报告_${new Date().toISOString().split('T')[0]}.pdf`);
    });
}



// 暴露导出函数到全局
window.exportAsImage = exportAsImage;
window.exportAsPDF = exportAsPDF;
window.generateReport = generateReport;

// 初始化页面
window.onload = function() {
    initData();
    
    // 添加时间范围按钮事件
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有按钮的active类
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            // 添加当前按钮的active类
            this.classList.add('active');
            
            // 获取时间范围
            const period = this.getAttribute('data-period');
            
            // 根据时间范围更新图表和相关数据
            updateChartByPeriod(period);
        });
    });
};

// 点击页面其他地方关闭下拉菜单
window.onclick = function(event) {
    // 检查点击的元素是否在设置按钮内部
    let isClickInsideSettings = false;
    let currentElement = event.target;
    while (currentElement) {
        if (currentElement.classList && currentElement.classList.contains('settings-button')) {
            isClickInsideSettings = true;
            break;
        }
        currentElement = currentElement.parentElement;
    }
    
    if (!isClickInsideSettings) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
};
