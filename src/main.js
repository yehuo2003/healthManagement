import * as echarts from 'echarts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
    // 先关闭设置菜单
    toggleSettingsMenu();
    document.getElementById('personalInfoModal').style.display = 'block';
};

window.closePersonalInfoModal = function() {
    document.getElementById('personalInfoModal').style.display = 'none';
};

window.openHealthDataModal = function() {
    // 先关闭设置菜单
    toggleSettingsMenu();
    document.getElementById('healthDataModal').style.display = 'block';
};

window.closeHealthDataModal = function() {
    document.getElementById('healthDataModal').style.display = 'none';
};

window.openDataComparisonModal = function() {
    // 先关闭设置菜单
    toggleSettingsMenu();
    // 清空之前的比对结果
    document.getElementById('comparisonResult').innerHTML = '';
    // 初始化日期选择器
    initDateSelectors();
    // 显示模态框
    document.getElementById('dataComparisonModal').style.display = 'block';
};

window.closeDataComparisonModal = function() {
    document.getElementById('dataComparisonModal').style.display = 'none';
};

window.openHealthGoalModal = function() {
    // 先关闭设置菜单
    toggleSettingsMenu();
    // 更新目标列表
    updateGoalList();
    document.getElementById('healthGoalModal').style.display = 'block';
};

window.closeHealthGoalModal = function() {
    document.getElementById('healthGoalModal').style.display = 'none';
};

// 数据管理
let rawData = [];
let userInfo = {};
let healthGoals = [];
let currentMetrics = ['weight', 'fatRate'];
const STORAGE_KEY = 'healthData';
const USER_INFO_KEY = 'userHealthInfo';
const HEALTH_GOALS_KEY = 'healthGoals';

// 定义等级颜色映射
const levelColors = {
    // BMI等级
    '偏瘦': '#f39c12', // 黄色
    '正常': '#27ae60', // 绿色
    '超重': '#f39c12', // 黄色
    '肥胖': '#e74c3c', // 红色
    
    // 血压等级
    '正常': '#27ae60', // 绿色
    '高血压前期': '#f39c12', // 黄色
    '高血压1级': '#e74c3c', // 红色
    '高血压2级': '#c0392b', // 深红色
    
    // 腰臀比等级
    '正常': '#27ae60', // 绿色
    '中心性肥胖': '#e74c3c', // 红色
    
    // 内脏脂肪等级
    '正常': '#27ae60', // 绿色
    '偏高': '#f39c12', // 黄色
    '肥胖': '#e74c3c', // 红色
    
    // 肥胖度等级
    '消瘦': '#7f8c8d', // 灰色
    '偏瘦': '#f39c12', // 黄色
    '标准': '#27ae60', // 绿色
    '偏胖': '#f39c12', // 黄色
    '肥胖': '#e74c3c', // 红色
    '重度': '#c0392b', // 深红色
    
    // 蛋白质等级
    '不足': '#e74c3c', // 红色
    '标准': '#27ae60', // 绿色
    '优': '#3498db' // 蓝色
};

// 初始化数据
async function initData() {
    // 加载用户基础信息
    const storedUserInfo = localStorage.getItem(USER_INFO_KEY);
    if (storedUserInfo) {
        userInfo = JSON.parse(storedUserInfo);
        // 填充到表单
        const userHeight = document.getElementById('userHeight');
        const userAge = document.getElementById('userAge');
        const userGender = document.getElementById('userGender');
        const userActivityLevel = document.getElementById('userActivityLevel');
        
        if (userHeight) userHeight.value = userInfo.height || '';
        if (userAge) userAge.value = userInfo.age || '';
        if (userGender) userGender.value = userInfo.gender || 'male';
        if (userActivityLevel) userActivityLevel.value = userInfo.activityLevel || '1.2';
    }

    // 加载健康目标数据
    const storedGoals = localStorage.getItem(HEALTH_GOALS_KEY);
    if (storedGoals) {
        healthGoals = JSON.parse(storedGoals);
    }

    // 从JSON文件加载最新数据，确保用户修改后能看到更新
    try {
        const response = await fetch('./data.json');
        rawData = await response.json();
        // 保存到localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rawData));
    } catch (error) {
        console.error('Failed to load initial data:', error);
        // 如果从JSON文件加载失败，尝试从localStorage加载
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            rawData = JSON.parse(storedData);
        } else {
            rawData = [];
        }
    }
    
    // 渲染指标选择器
    renderMetricSelector();
    
    // 更新图表和指标
    updateChart();
    updateMetrics();
    updateHealthSummary();
    
    // 初始化图表点击事件
    addChartClickEvent();
}

// 保存数据到localStorage
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rawData));
}

// 保存用户基础信息
function saveUserInfo() {
    const height = parseFloat(document.getElementById('userHeight').value);
    const age = parseInt(document.getElementById('userAge').value);
    const gender = document.getElementById('userGender').value;
    const activityLevel = parseFloat(document.getElementById('userActivityLevel').value);

    if (isNaN(height) || isNaN(age)) {
        alert('请填写有效的身高和年龄');
        return;
    }

    userInfo = { height, age, gender, activityLevel };
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    
    // 重新计算所有数据的衍生指标
    recalculateAllDerivedMetrics();
    
    // 更新图表和指标
    updateChart();
    updateMetrics();
    updateHealthSummary();
    
    alert('基础信息保存成功，所有衍生指标已重新计算');
}

// 重新计算所有数据的衍生指标
function recalculateAllDerivedMetrics() {
    // 遍历所有数据点，重新计算衍生指标
    rawData = rawData.map(item => {
        const enhancedItem = { ...item };
        
        // 重新计算所有衍生指标
        enhancedItem.bmi = calculateBMI(enhancedItem.weight, userInfo.height);
        enhancedItem.bmr = calculateBMR(enhancedItem.weight, userInfo.height, userInfo.age, userInfo.gender);
        enhancedItem.bmr = enhancedItem.bmr ? Math.round(enhancedItem.bmr) : null;
        enhancedItem.whr = calculateWHR(enhancedItem.waist, enhancedItem.hip);
        enhancedItem.muscleRate = calculateMuscleRate(enhancedItem.muscleMass, enhancedItem.weight);
        enhancedItem.leanBodyMass = calculateLeanBodyMass(enhancedItem.weight, enhancedItem.fatRate);
        enhancedItem.fatMass = calculateFatMass(enhancedItem.weight, enhancedItem.fatRate);
        enhancedItem.tdee = calculateTDEE(enhancedItem.bmr, userInfo.activityLevel);
        // 添加肥胖度计算
        enhancedItem.obesityDegree = calculateObesityDegree(enhancedItem.weight, userInfo.height, userInfo.gender);
        
        return enhancedItem;
    });
    
    // 保存更新后的数据到localStorage
    saveData();
}

// 计算BMI
function calculateBMI(weight, height) {
    if (!weight || !height) return null;
    const weightKg = weight / 2; // 转换为千克
    const heightM = height / 100; // 转换为米
    return (weightKg / (heightM * heightM)).toFixed(1);
}

// 计算基础代谢率(BMR) - 使用Mifflin-St Jeor公式
function calculateBMR(weight, height, age, gender) {
    if (!weight || !height || !age || !gender) return null;
    const weightKg = weight / 2; // 转换为千克
    const heightCm = height; // 身高已经是厘米
    
    if (gender === 'male') {
        return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
        return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }
}

// 计算每日总能量消耗(TDEE) = BMR * 活动水平系数
function calculateTDEE(bmr, activityLevel) {
    if (!bmr || !activityLevel) return null;
    return Math.round(bmr * activityLevel);
}

// 计算腰臀比
function calculateWHR(waist, hip) {
    if (!waist || !hip) return null;
    return (waist / hip).toFixed(2);
}

// 计算瘦体重（去脂体重）
function calculateLeanBodyMass(weight, fatRate) {
    if (!weight || !fatRate) return null;
    return (weight * (1 - fatRate / 100)).toFixed(1);
}

// 计算脂肪重量
function calculateFatMass(weight, fatRate) {
    if (!weight || !fatRate) return null;
    return (weight * (fatRate / 100)).toFixed(1);
}

// 计算肌肉率
function calculateMuscleRate(muscleMass, weight) {
    if (!muscleMass || !weight) return null;
    return ((muscleMass * 2 / weight) * 100).toFixed(1); // 转换为斤计算
}

// 计算理想体重
function calculateIdealWeight(height, gender) {
    if (!height || !gender) return null;
    let idealWeightKg;
    if (gender === 'male') {
        idealWeightKg = (height - 80) * 0.7;
    } else {
        idealWeightKg = (height - 70) * 0.6;
    }
    return (idealWeightKg * 2).toFixed(1); // 转换为斤
}

// 计算血压风险等级
function calculateBloodPressureLevel(systolic, diastolic) {
    if (!systolic || !diastolic) return 'N/A';
    if (systolic < 120 && diastolic < 80) return '正常';
    if (systolic >= 120 && systolic <= 139 || diastolic >= 80 && diastolic <= 89) return '高血压前期';
    if (systolic >= 140 && systolic <= 159 || diastolic >= 90 && diastolic <= 99) return '高血压1级';
    return '高血压2级';
}

// 计算BMI风险等级
function calculateBMILevel(bmi) {
    if (!bmi) return 'N/A';
    const bmiNum = parseFloat(bmi);
    if (bmiNum < 18.5) return '偏瘦';
    if (bmiNum >= 18.5 && bmiNum <= 23.9) return '正常';
    if (bmiNum >= 24.0 && bmiNum <= 27.9) return '超重';
    return '肥胖';
}

// 计算腰臀比风险等级
function calculateWHRLevel(whr, gender) {
    if (!whr || !gender) return 'N/A';
    const whrNum = parseFloat(whr);
    if (gender === 'male' && whrNum < 0.90 || gender === 'female' && whrNum < 0.85) return '正常';
    return '中心性肥胖';
}

// 计算内脏脂肪风险等级
function calculateVisceralFatLevel(visceralFat) {
    if (!visceralFat) return 'N/A';
    if (visceralFat < 10) return '正常';
    if (visceralFat >= 10 && visceralFat <= 14) return '偏高';
    return '肥胖';
}

// 计算体重风险等级
function calculateWeightLevel(weight, height, gender) {
    if (!weight || !height || !gender) return 'N/A';
    
    // 计算BMI来判断体重是否正常
    const bmi = calculateBMI(weight, height);
    if (!bmi) return 'N/A';
    
    return calculateBMILevel(bmi);
}

// 计算体脂率风险等级
function calculateFatRateLevel(fatRate, gender) {
    if (!fatRate || !gender) return 'N/A';
    
    const fatRateNum = parseFloat(fatRate);
    
    // 体脂率正常范围参考值
    if (gender === 'male') {
        if (fatRateNum < 10) return '偏瘦';
        if (fatRateNum >= 10 && fatRateNum <= 20) return '正常';
        if (fatRateNum > 20 && fatRateNum <= 25) return '超重';
        return '肥胖';
    } else {
        if (fatRateNum < 15) return '偏瘦';
        if (fatRateNum >= 15 && fatRateNum <= 25) return '正常';
        if (fatRateNum > 25 && fatRateNum <= 30) return '超重';
        return '肥胖';
    }
}

// 计算肥胖度
function calculateObesityDegree(actualWeight, height, gender) {
    if (!actualWeight || !height || !gender) return null;
    
    // 获取理想体重
    const idealWeight = calculateIdealWeight(height, gender);
    if (!idealWeight) return null;
    
    // 计算肥胖度：(实际体重 - 理想体重) / 理想体重 * 100%
    const actualWeightNum = parseFloat(actualWeight);
    const idealWeightNum = parseFloat(idealWeight);
    
    if (idealWeightNum === 0) return null;
    
    const obesityDegree = ((actualWeightNum - idealWeightNum) / idealWeightNum) * 100;
    return obesityDegree.toFixed(1);
}

// 计算肥胖度风险等级
function calculateObesityDegreeLevel(obesityDegree) {
    if (!obesityDegree) return 'N/A';
    
    const degreeNum = parseFloat(obesityDegree);
    
    if (degreeNum < -20.0) return '消瘦';
    if (degreeNum >= -20.0 && degreeNum < -10.0) return '偏瘦';
    if (degreeNum >= -10.0 && degreeNum <= 10.0) return '标准';
    if (degreeNum > 10.0 && degreeNum <= 20.0) return '偏胖';
    if (degreeNum > 20.0 && degreeNum <= 50.0) return '肥胖';
    return '重度';
}

// 计算蛋白质风险等级
function calculateProteinLevel(protein) {
    if (!protein) return 'N/A';
    
    const proteinNum = parseFloat(protein);
    
    if (proteinNum < 16.0) return '不足';
    if (proteinNum >= 16.0 && proteinNum <= 20.0) return '标准';
    return '优';
}

// 模态框控制函数
function openModal() {
    document.getElementById('dailyMetricsModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('dailyMetricsModal').style.display = 'none';
}

// 健康数据指标配置
const healthMetricsConfig = [
    { key: 'date', label: '日期', unit: '', showChange: false },
    { key: 'weight', label: '体重', unit: '斤', showChange: true },
    { key: 'fatRate', label: '体脂率', unit: '%', showChange: true },
    { key: 'bmi', label: 'BMI', unit: '', showChange: true },
    { key: 'obesityDegree', label: '肥胖度', unit: '%', showChange: true },
    { key: 'fatMass', label: '脂肪重量', unit: '斤', showChange: true },
    { key: 'leanBodyMass', label: '瘦体重', unit: '斤', showChange: true },
    { key: 'bmr', label: '基础代谢率', unit: '大卡', showChange: true },
    { key: 'tdee', label: '每日总消耗', unit: '大卡', showChange: true },
    { key: 'muscleMass', label: '肌肉量', unit: 'kg', showChange: true },
    { key: 'waterRate', label: '水分率', unit: '%', showChange: true },
    { key: 'protein', label: '蛋白质', unit: '%', showChange: true },
    { key: 'boneMass', label: '骨量', unit: 'kg', showChange: true },
    { key: 'visceralFat', label: '内脏脂肪', unit: '', showChange: true },
    { key: 'muscleRate', label: '肌肉率', unit: '%', showChange: true },
    { key: 'waist', label: '腰围', unit: 'cm', showChange: true },
    { key: 'hip', label: '臀围', unit: 'cm', showChange: true },
    { key: 'systolic', label: '收缩压', unit: 'mmHg', showChange: true },
    { key: 'diastolic', label: '舒张压', unit: 'mmHg', showChange: true },
    { key: 'heartRate', label: '静息心率', unit: '次/分', showChange: true },
    { key: 'whr', label: '腰臀比', unit: '', showChange: true },
];

// 健康数据比对功能
function compareHealthData() {
    // 获取用户选择的日期
    const date1 = document.getElementById('date1').value;
    const date2 = document.getElementById('date2').value;
    
    // 验证日期选择
    if (!date1 || !date2) {
        alert('请选择两个日期进行比对');
        return;
    }
    
    if (date1 === date2) {
        alert('请选择不同的日期进行比对');
        return;
    }
    
    // 查找对应日期的数据
    const data1 = rawData.find(item => item.date === date1);
    const data2 = rawData.find(item => item.date === date2);
    
    if (!data1 || !data2) {
        alert('找不到所选日期的数据');
        return;
    }
    
    // 确保所有衍生指标都已计算
    const enhancedData1 = calculateMissingMetrics(data1);
    const enhancedData2 = calculateMissingMetrics(data2);
    
    // 确定哪个日期更早
    const isDate1Earlier = new Date(date1) < new Date(date2);
    const earlierData = isDate1Earlier ? enhancedData1 : enhancedData2;
    const laterData = isDate1Earlier ? enhancedData2 : enhancedData1;
    const earlierDate = isDate1Earlier ? date1 : date2;
    const laterDate = isDate1Earlier ? date2 : date1;
    
    // 生成比对结果表格
    generateComparisonTable(earlierData, laterData, earlierDate, laterDate);
}

// 计算缺失的衍生指标
function calculateMissingMetrics(dataItem) {
    const enhancedItem = { ...dataItem };
    
    // 计算BMI（如果缺失）
    if (!enhancedItem.bmi && userInfo.height) {
        enhancedItem.bmi = calculateBMI(enhancedItem.weight, userInfo.height);
    }
    
    // 计算BMR（如果缺失）
    if (!enhancedItem.bmr && userInfo.height && userInfo.age && userInfo.gender) {
        enhancedItem.bmr = calculateBMR(enhancedItem.weight, userInfo.height, userInfo.age, userInfo.gender);
        enhancedItem.bmr = enhancedItem.bmr ? Math.round(enhancedItem.bmr) : null;
    }
    
    // 计算TDEE（如果缺失）
    if (!enhancedItem.tdee && enhancedItem.bmr && userInfo.activityLevel) {
        enhancedItem.tdee = calculateTDEE(enhancedItem.bmr, userInfo.activityLevel);
    }
    
    // 计算腰臀比（如果缺失）
    if (!enhancedItem.whr && enhancedItem.waist && enhancedItem.hip) {
        enhancedItem.whr = calculateWHR(enhancedItem.waist, enhancedItem.hip);
    }
    
    // 计算肌肉率（如果缺失）
    if (!enhancedItem.muscleRate && enhancedItem.muscleMass && enhancedItem.weight) {
        enhancedItem.muscleRate = calculateMuscleRate(enhancedItem.muscleMass, enhancedItem.weight);
    }
    
    // 计算瘦体重（如果缺失）
    if (!enhancedItem.leanBodyMass && enhancedItem.weight && enhancedItem.fatRate) {
        enhancedItem.leanBodyMass = calculateLeanBodyMass(enhancedItem.weight, enhancedItem.fatRate);
    }
    
    // 计算脂肪重量（如果缺失）
    if (!enhancedItem.fatMass && enhancedItem.weight && enhancedItem.fatRate) {
        enhancedItem.fatMass = calculateFatMass(enhancedItem.weight, enhancedItem.fatRate);
    }
    
    // 计算肥胖度（如果缺失）
    if (!enhancedItem.obesityDegree && userInfo.height && userInfo.gender) {
        enhancedItem.obesityDegree = calculateObesityDegree(enhancedItem.weight, userInfo.height, userInfo.gender);
    }
    
    return enhancedItem;
}

// 生成比对结果表格
function generateComparisonTable(data1, data2, date1, date2) {
    const resultContainer = document.getElementById('comparisonResult');
    
    // 表格样式
    const tableStyle = `
        style="
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 14px;
        "
    `;
    
    const thStyle = `
        style="
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        "
    `;
    
    const tdStyle = `
        style="
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: center;
        "
    `;
    
    // 格式化日期显示
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}年${month}月${day}日`;
    };
    
    // 定义等级颜色映射
    const levelColors = {
        // BMI等级
        '偏瘦': '#f39c12', // 黄色
        '正常': '#27ae60', // 绿色
        '超重': '#f39c12', // 黄色
        '肥胖': '#e74c3c', // 红色
        
        // 血压等级
        '正常': '#27ae60', // 绿色
        '高血压前期': '#f39c12', // 黄色
        '高血压1级': '#e74c3c', // 红色
        '高血压2级': '#c0392b', // 深红色
        
        // 腰臀比等级
        '正常': '#27ae60', // 绿色
        '中心性肥胖': '#e74c3c', // 红色
        
        // 内脏脂肪等级
        '正常': '#27ae60', // 绿色
        '偏高': '#f39c12', // 黄色
        '肥胖': '#e74c3c', // 红色
        
        // 肥胖度等级
        '消瘦': '#7f8c8d', // 灰色
        '偏瘦': '#f39c12', // 黄色
        '标准': '#27ae60', // 绿色
        '偏胖': '#f39c12', // 黄色
        '肥胖': '#e74c3c', // 红色
        '重度': '#c0392b', // 深红色
        
        // 蛋白质等级
        '不足': '#e74c3c', // 红色
        '标准': '#27ae60', // 绿色
        '优': '#3498db' // 蓝色
    };
    
    // 生成表格HTML
    let tableHTML = `
        <div style="margin-bottom: 15px;">
            <h4>数据比对结果：${formatDate(date1)} vs ${formatDate(date2)}</h4>
        </div>
        <table ${tableStyle}>
            <thead>
                <tr>
                    <th ${thStyle}>指标</th>
                    <th ${thStyle} colspan="2">数据(${formatDate(date1)} - ${formatDate(date2)})</th>
                    <th ${thStyle}>变化</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // 遍历所有指标，生成表格行
    healthMetricsConfig.forEach(config => {
        const { key, label, unit, showChange } = config;
        
        // 获取两个日期的指标值
        const value1 = data1[key] !== undefined && data1[key] !== null ? data1[key] : '-';
        const value2 = data2[key] !== undefined && data2[key] !== null ? data2[key] : '-';
        
        // 计算两个日期的指标风险等级
        let riskLevel1 = null;
        let riskLevel2 = null;
        
        // 根据指标类型计算风险等级
        if (key === 'weight') {
            riskLevel1 = calculateWeightLevel(value1, userInfo.height, userInfo.gender);
            riskLevel2 = calculateWeightLevel(value2, userInfo.height, userInfo.gender);
        } else if (key === 'fatRate') {
            riskLevel1 = calculateFatRateLevel(value1, userInfo.gender);
            riskLevel2 = calculateFatRateLevel(value2, userInfo.gender);
        } else if (key === 'bmi') {
            riskLevel1 = calculateBMILevel(value1);
            riskLevel2 = calculateBMILevel(value2);
        } else if (key === 'obesityDegree') {
            riskLevel1 = calculateObesityDegreeLevel(value1);
            riskLevel2 = calculateObesityDegreeLevel(value2);
        } else if (key === 'whr') {
            riskLevel1 = calculateWHRLevel(value1, userInfo.gender);
            riskLevel2 = calculateWHRLevel(value2, userInfo.gender);
        } else if (key === 'visceralFat') {
            riskLevel1 = calculateVisceralFatLevel(value1);
            riskLevel2 = calculateVisceralFatLevel(value2);
        } else if (key === 'systolic' || key === 'diastolic') {
            // 血压需要同时考虑收缩压和舒张压
            riskLevel1 = calculateBloodPressureLevel(data1.systolic, data1.diastolic);
            riskLevel2 = calculateBloodPressureLevel(data2.systolic, data2.diastolic);
        } else if (key === 'protein') {
            // 蛋白质风险等级计算
            riskLevel1 = calculateProteinLevel(value1);
            riskLevel2 = calculateProteinLevel(value2);
        }
        
        // 获取风险等级对应的颜色
        const getValueColor = (riskLevel, value) => {
            if (value === '-' || !riskLevel || riskLevel === 'N/A') {
                return '#2c3e50'; // 默认颜色
            }
            return levelColors[riskLevel] || '#2c3e50';
        };
        
        // 获取颜色
        const color1 = getValueColor(riskLevel1, value1);
        const color2 = getValueColor(riskLevel2, value2);
        
        // 计算变化
        let changeHTML = '';
        if (showChange && value1 !== '-' && value2 !== '-') {
            const diff = parseFloat(value2) - parseFloat(value1);
            const absDiff = Math.abs(diff).toFixed(1);
            
            if (diff > 0) {
                // 上涨
                changeHTML = `<span style="color: red; font-weight: bold;">+${absDiff} ${unit} <span style="font-size: 16px;">↑</span></span>`;
            } else if (diff < 0) {
                // 下降
                changeHTML = `<span style="color: green; font-weight: bold;">${absDiff} ${unit} <span style="font-size: 16px;">↓</span></span>`;
            } else {
                // 无变化
                changeHTML = '<span style="color: #6c757d;">无变化</span>';
            }
        } else if (showChange) {
            changeHTML = '-';
        }
        
        // 生成指标行，将颜色样式应用到span元素上
        tableHTML += `
            <tr>
                <td ${tdStyle} style="text-align: left; font-weight: 500;">${label}</td>
                <td ${tdStyle}>
                    <span style="color: ${color1}; font-weight: 700;">${value1} ${unit}</span>
                </td>
                <td ${tdStyle}>
                    <span style="color: ${color2}; font-weight: 700;">${value2} ${unit}</span>
                </td>
                <td ${tdStyle}>${changeHTML}</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    // 显示表格
    resultContainer.innerHTML = tableHTML;
}

// 个人基础信息模态框控制
function openPersonalInfoModal() {
    // 先关闭设置菜单
    toggleSettingsMenu();
    document.getElementById('personalInfoModal').style.display = 'block';
}

function closePersonalInfoModal() {
    document.getElementById('personalInfoModal').style.display = 'none';
}

// 健康数据录入模态框控制
function openHealthDataModal() {
    // 先关闭设置菜单
    toggleSettingsMenu();
    document.getElementById('healthDataModal').style.display = 'block';
}

function closeHealthDataModal() {
    document.getElementById('healthDataModal').style.display = 'none';
}

// 健康数据比对模态框控制
function openDataComparisonModal() {
    // 先关闭设置菜单
    toggleSettingsMenu();
    // 清空之前的比对结果
    document.getElementById('comparisonResult').innerHTML = '';
    // 初始化日期选择器
    initDateSelectors();
    // 显示模态框
    document.getElementById('dataComparisonModal').style.display = 'block';
}

function closeDataComparisonModal() {
    document.getElementById('dataComparisonModal').style.display = 'none';
}

// 初始化日期选择器
function initDateSelectors() {
    const date1Select = document.getElementById('date1');
    const date2Select = document.getElementById('date2');
    
    // 清空现有选项
    date1Select.innerHTML = '';
    date2Select.innerHTML = '';
    
    // 检查是否有数据
    if (rawData.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '暂无数据';
        date1Select.appendChild(option);
        date2Select.appendChild(option.cloneNode(true));
        return;
    }
    
    // 按日期排序，最新的日期在前面
    const sortedData = [...rawData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 添加空选项
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '请选择日期';
    date1Select.appendChild(emptyOption);
    date2Select.appendChild(emptyOption.cloneNode(true));
    
    // 添加日期选项
    sortedData.forEach(item => {
        const option1 = document.createElement('option');
        option1.value = item.date;
        option1.textContent = item.date;
        date1Select.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = item.date;
        option2.textContent = item.date;
        date2Select.appendChild(option2);
    });
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

// 健康目标管理相关函数
function openHealthGoalModal() {
    // 先关闭设置菜单
    toggleSettingsMenu();
    // 更新目标列表
    updateGoalList();
    document.getElementById('healthGoalModal').style.display = 'block';
}

function closeHealthGoalModal() {
    document.getElementById('healthGoalModal').style.display = 'none';
}

function saveHealthGoals() {
    localStorage.setItem(HEALTH_GOALS_KEY, JSON.stringify(healthGoals));
}

function calculateGoalProgress(goal) {
    // 获取最新的健康数据
    if (rawData.length === 0) return 0;
    
    const latestData = [...rawData].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    let currentValue = latestData[goal.metricType];
    
    // 如果是BMI，需要计算
    if (goal.metricType === 'bmi' && !currentValue && userInfo.height) {
        currentValue = calculateBMI(latestData.weight, userInfo.height);
    }
    
    if (!currentValue) return 0;
    
    const initialValue = goal.initialValue;
    const targetValue = goal.targetValue;
    
    let progress = 0;
    if (targetValue < initialValue) {
        // 目标值小于初始值（如减重）
        progress = Math.max(0, Math.min(100, ((initialValue - currentValue) / (initialValue - targetValue)) * 100));
    } else {
        // 目标值大于初始值（如增加肌肉量）
        progress = Math.max(0, Math.min(100, ((currentValue - initialValue) / (targetValue - initialValue)) * 100));
    }
    
    return progress;
}

function updateGoalProgress(goal) {
    const progress = calculateGoalProgress(goal);
    goal.progress = progress;
    goal.currentValue = getLatestMetricValue(goal.metricType);
    
    // 更新状态
    if (progress >= 100) {
        goal.status = 'completed';
    } else if (new Date(goal.targetDate) < new Date()) {
        goal.status = 'failed';
    } else {
        goal.status = 'in_progress';
    }
}

function getLatestMetricValue(metricType) {
    if (rawData.length === 0) return null;
    
    const latestData = [...rawData].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    let value = latestData[metricType];
    
    // 如果是BMI，需要计算
    if (metricType === 'bmi' && !value && userInfo.height) {
        value = calculateBMI(latestData.weight, userInfo.height);
    }
    
    return value;
}

function addHealthGoal() {
    const metricType = document.getElementById('goalMetricType').value;
    const targetValue = parseFloat(document.getElementById('goalTargetValue').value);
    const targetDate = document.getElementById('goalTargetDate').value;
    
    if (!metricType || isNaN(targetValue) || !targetDate) {
        alert('请填写完整的目标信息');
        return;
    }
    
    // 获取当前值作为初始值
    const initialValue = getLatestMetricValue(metricType);
    if (!initialValue) {
        alert('暂无健康数据，请先录入健康数据');
        return;
    }
    
    // 验证目标值合理性
    if (metricType === 'weight' || metricType === 'fatRate' || metricType === 'waist') {
        if (targetValue >= initialValue) {
            if (!confirm('目标值大于当前值，确定要设置这个目标吗？')) {
                return;
            }
        }
    }
    
    const newGoal = {
        id: 'goal-' + Date.now(),
        metricType: metricType,
        targetValue: targetValue,
        currentValue: initialValue,
        initialValue: initialValue,
        targetDate: targetDate,
        createdAt: new Date().toISOString().split('T')[0],
        progress: 0,
        status: 'in_progress'
    };
    
    // 计算初始进度
    updateGoalProgress(newGoal);
    
    healthGoals.push(newGoal);
    saveHealthGoals();
    updateGoalList();
    
    // 重置表单
    document.getElementById('goalTargetValue').value = '';
    document.getElementById('goalTargetDate').value = '';
    
    alert('目标设置成功！');
}

function updateHealthGoal(goalId) {
    // 这里可以实现编辑目标的功能
    alert('编辑功能待实现');
}

function deleteHealthGoal(goalId) {
    if (confirm('确定要删除这个目标吗？')) {
        healthGoals = healthGoals.filter(goal => goal.id !== goalId);
        saveHealthGoals();
        updateGoalList();
        alert('目标删除成功！');
    }
}

function updateGoalList() {
    const goalListContainer = document.getElementById('goalList');
    
    if (healthGoals.length === 0) {
        goalListContainer.innerHTML = '<div style="text-align: center; color: #7f8c8d; padding: 20px;">暂无设置的目标</div>';
        return;
    }
    
    // 更新所有目标的进度
    healthGoals.forEach(goal => updateGoalProgress(goal));
    saveHealthGoals();
    
    let html = '';
    healthGoals.forEach(goal => {
        // 获取指标名称
        const metricNames = {
            'weight': '体重',
            'fatRate': '体脂率',
            'bmi': 'BMI',
            'waist': '腰围',
            'muscleMass': '肌肉量'
        };
        
        const metricName = metricNames[goal.metricType] || goal.metricType;
        const unit = goal.metricType === 'weight' ? '斤' : 
                     goal.metricType === 'fatRate' ? '%' : 
                     goal.metricType === 'waist' ? 'cm' : 
                     goal.metricType === 'muscleMass' ? 'kg' : '';
        
        // 获取状态颜色
        let statusColor = '#3498db'; // 进行中
        if (goal.status === 'completed') {
            statusColor = '#27ae60'; // 已完成
        } else if (goal.status === 'failed') {
            statusColor = '#e74c3c'; // 已失败
        }
        
        // 格式化日期
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
        };
        
        html += `
            <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 15px; border-left: 4px solid ${statusColor};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <div>
                        <h5 style="margin: 0; color: #2c3e50;">${metricName}目标</h5>
                        <p style="margin: 5px 0; color: #7f8c8d;">从 ${goal.initialValue}${unit} 到 ${goal.targetValue}${unit}</p>
                        <p style="margin: 5px 0; color: #7f8c8d;">目标日期：${formatDate(goal.targetDate)}</p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="updateHealthGoal('${goal.id}')" style="padding: 5px 10px; background: #f39c12; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">编辑</button>
                        <button onclick="deleteHealthGoal('${goal.id}')" style="padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">删除</button>
                    </div>
                </div>
                <div style="margin-top: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="font-size: 14px; color: #7f8c8d;">完成进度</span>
                        <span style="font-size: 14px; font-weight: bold; color: ${statusColor};">${goal.progress.toFixed(1)}%</span>
                    </div>
                    <div style="height: 10px; background: #ecf0f1; border-radius: 5px; overflow: hidden;">
                        <div style="height: 100%; width: ${goal.progress}%; background: ${statusColor}; border-radius: 5px; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                <div style="margin-top: 10px; font-size: 14px;">
                    <span style="padding: 3px 8px; border-radius: 12px; background: ${statusColor}; color: white;">
                        ${goal.status === 'in_progress' ? '进行中' : goal.status === 'completed' ? '已完成' : '已失败'}
                    </span>
                </div>
            </div>
        `;
    });
    
    goalListContainer.innerHTML = html;
}

function getGoalStatusText(status) {
    switch (status) {
        case 'completed': return '已完成';
        case 'failed': return '已失败';
        case 'in_progress': return '进行中';
        default: return '未知';
    }
}

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

// 全局函数定义
window.compareHealthData = function() {
    // 获取用户选择的日期
    const date1 = document.getElementById('date1').value;
    const date2 = document.getElementById('date2').value;
    
    // 验证日期选择
    if (!date1 || !date2) {
        alert('请选择两个日期进行比对');
        return;
    }
    
    if (date1 === date2) {
        alert('请选择不同的日期进行比对');
        return;
    }
    
    // 查找对应日期的数据
    const data1 = rawData.find(item => item.date === date1);
    const data2 = rawData.find(item => item.date === date2);
    
    if (!data1 || !data2) {
        alert('找不到所选日期的数据');
        return;
    }
    
    // 确保所有衍生指标都已计算
    const enhancedData1 = calculateMissingMetrics(data1);
    const enhancedData2 = calculateMissingMetrics(data2);
    
    // 确定哪个日期更早
    const isDate1Earlier = new Date(date1) < new Date(date2);
    const earlierData = isDate1Earlier ? enhancedData1 : enhancedData2;
    const laterData = isDate1Earlier ? enhancedData2 : enhancedData1;
    const earlierDate = isDate1Earlier ? date1 : date2;
    const laterDate = isDate1Earlier ? date2 : date1;
    
    // 生成比对结果表格
    generateComparisonTable(earlierData, laterData, earlierDate, laterDate);
};

window.saveUserInfo = function() {
    const height = parseFloat(document.getElementById('userHeight').value);
    const age = parseInt(document.getElementById('userAge').value);
    const gender = document.getElementById('userGender').value;
    const activityLevel = parseFloat(document.getElementById('userActivityLevel').value);

    if (isNaN(height) || isNaN(age)) {
        alert('请填写有效的身高和年龄');
        return;
    }

    userInfo = { height, age, gender, activityLevel };
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    
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
    const dataStr = JSON.stringify(rawData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
};

window.importData = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                rawData = importedData;
                saveData();
                recalculateAllDerivedMetrics();
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
};

// 健康目标管理相关函数
window.addHealthGoal = function() {
    const metricType = document.getElementById('goalMetricType').value;
    const targetValue = parseFloat(document.getElementById('goalTargetValue').value);
    const targetDate = document.getElementById('goalTargetDate').value;
    
    if (!metricType || isNaN(targetValue) || !targetDate) {
        alert('请填写完整的目标信息');
        return;
    }
    
    // 获取当前值作为初始值
    const initialValue = getLatestMetricValue(metricType);
    if (!initialValue) {
        alert('暂无健康数据，请先录入健康数据');
        return;
    }
    
    // 验证目标值合理性
    if (metricType === 'weight' || metricType === 'fatRate' || metricType === 'waist') {
        if (targetValue >= initialValue) {
            if (!confirm('目标值大于当前值，确定要设置这个目标吗？')) {
                return;
            }
        }
    }
    
    const newGoal = {
        id: 'goal-' + Date.now(),
        metricType: metricType,
        targetValue: targetValue,
        currentValue: initialValue,
        initialValue: initialValue,
        targetDate: targetDate,
        createdAt: new Date().toISOString().split('T')[0],
        progress: 0,
        status: 'in_progress'
    };
    
    // 计算初始进度
    updateGoalProgress(newGoal);
    
    healthGoals.push(newGoal);
    saveHealthGoals();
    updateGoalList();
    
    // 重置表单
    document.getElementById('goalTargetValue').value = '';
    document.getElementById('goalTargetDate').value = '';
    
    alert('目标设置成功！');
};

function calculateTrends(timeRange) {
    // 筛选指定时间范围内的数据
    let filteredData = rawData;
    if (timeRange !== 'all') {
        const now = new Date();
        let months = 0;
        switch (timeRange) {
            case '1month': months = 1; break;
            case '3months': months = 3; break;
            case '6months': months = 6; break;
            case '1year': months = 12; break;
        }
        const startTime = new Date(now.setMonth(now.getMonth() - months));
        filteredData = rawData.filter(item => new Date(item.date) >= startTime);
    }
    
    // 计算各项指标的变化趋势
    const trends = {
        weight: calculateMetricTrend(filteredData, 'weight'),
        fatRate: calculateMetricTrend(filteredData, 'fatRate'),
        muscleMass: calculateMetricTrend(filteredData, 'muscleMass')
    };
    
    return trends;
}

function calculateMetricTrend(data, metric) {
    if (data.length === 0) return { start: 0, end: 0, change: 0, trend: 'stable' };
    
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    const startValue = sortedData[0][metric] || 0;
    const endValue = sortedData[sortedData.length - 1][metric] || 0;
    const change = endValue - startValue;
    
    let trend = 'stable';
    if (change > 0) trend = 'increasing';
    if (change < 0) trend = 'decreasing';
    
    return {
        start: startValue,
        end: endValue,
        change: change,
        trend: trend,
        data: sortedData.map(item => ({
            date: item.date,
            value: item[metric] || 0
        }))
    };
}

function generateHealthAdvice(riskLevels) {
    const advice = [];
    
    // 基于风险等级生成建议
    if (riskLevels.bmi === '肥胖' || riskLevels.bmi === '超重') {
        advice.push('建议控制饮食，减少高热量食物摄入，增加运动量');
    }
    
    if (riskLevels.fatRate === '肥胖' || riskLevels.fatRate === '超重') {
        advice.push('建议增加有氧运动，如跑步、游泳等，减少脂肪堆积');
    }
    
    if (riskLevels.visceralFat === '肥胖' || riskLevels.visceralFat === '偏高') {
        advice.push('建议减少腹部脂肪，增加核心训练，改善内脏脂肪水平');
    }
    
    // 添加通用建议
    advice.push('保持充足的睡眠，建议每天睡眠7-8小时');
    advice.push('保持水分摄入，建议每天饮水2000ml以上');
    advice.push('定期测量健康数据，及时调整健康管理计划');
    
    return advice;
}

function generateReportData(reportType, timeRange) {
    const trends = calculateTrends(timeRange);
    const latestData = [...rawData].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const riskLevels = {
        bmi: calculateBMILevel(latestData.bmi || calculateBMI(latestData.weight, userInfo.height)),
        fatRate: calculateFatRateLevel(latestData.fatRate, userInfo.gender),
        weight: calculateWeightLevel(latestData.weight, userInfo.height, userInfo.gender),
        visceralFat: calculateVisceralFatLevel(latestData.visceralFat)
    };
    const healthAdvice = generateHealthAdvice(riskLevels);
    
    return {
        reportType: reportType,
        timeRange: timeRange,
        generatedAt: new Date().toISOString(),
        userInfo: userInfo,
        latestData: latestData,
        trends: trends,
        riskLevels: riskLevels,
        healthAdvice: healthAdvice,
        goals: healthGoals
    };
}

function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const timeRange = document.getElementById('reportTimeRange').value;
    
    const reportData = generateReportData(reportType, timeRange);
    const reportHTML = generateReportHTML(reportData);
    
    document.getElementById('reportPreview').innerHTML = reportHTML;
}

function generateReportHTML(reportData) {
    let html = '';
    
    // 报告头部
    html += renderReportHeader(reportData);
    
    // 数据概览
    html += renderDataOverview(reportData);
    
    // 趋势分析
    html += renderTrendAnalysis(reportData);
    
    // 风险评估
    html += renderRiskAssessment(reportData);
    
    // 健康建议
    html += renderHealthAdvice(reportData);
    
    // 目标跟踪
    if (reportData.goals && reportData.goals.length > 0) {
        html += renderGoalTracking(reportData);
    }
    
    // 报告尾部
    html += renderReportFooter();
    
    return html;
}

function renderReportHeader(reportData) {
    const formattedDate = new Date(reportData.generatedAt).toLocaleDateString('zh-CN');
    const reportTypes = {
        'comprehensive': '综合健康报告',
        'weight': '体重管理报告',
        'fat': '体脂管理报告'
    };
    
    return `
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #3498db; margin-bottom: 30px;">
            <h2 style="margin: 0; color: #2c3e50;">${reportTypes[reportData.reportType]}</h2>
            <p style="margin: 10px 0; color: #7f8c8d;">生成日期：${formattedDate}</p>
            ${reportData.userInfo.name ? `<p style="margin: 5px 0; color: #7f8c8d;">姓名：${reportData.userInfo.name}</p>` : ''}
            ${reportData.userInfo.age ? `<p style="margin: 5px 0; color: #7f8c8d;">年龄：${reportData.userInfo.age}岁</p>` : ''}
            ${reportData.userInfo.gender ? `<p style="margin: 5px 0; color: #7f8c8d;">性别：${reportData.userInfo.gender === 'male' ? '男' : '女'}</p>` : ''}
        </div>
    `;
}

function renderDataOverview(reportData) {
    const latest = reportData.latestData;
    if (!latest) return '';
    
    return `
        <div style="margin-bottom: 30px;">
            <h3 style="color: #2c3e50; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">数据概览</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                ${latest.weight ? `
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                        <h4 style="margin: 0 0 10px 0; color: #7f8c8d;">体重</h4>
                        <p style="margin: 0; font-size: 24px; font-weight: bold; color: #2c3e50;">${latest.weight} 斤</p>
                    </div>
                ` : ''}
                ${latest.fatRate ? `
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                        <h4 style="margin: 0 0 10px 0; color: #7f8c8d;">体脂率</h4>
                        <p style="margin: 0; font-size: 24px; font-weight: bold; color: #2c3e50;">${latest.fatRate}%</p>
                    </div>
                ` : ''}
                ${(latest.bmi || calculateBMI(latest.weight, userInfo.height)) ? `
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                        <h4 style="margin: 0 0 10px 0; color: #7f8c8d;">BMI</h4>
                        <p style="margin: 0; font-size: 24px; font-weight: bold; color: #2c3e50;">${latest.bmi || calculateBMI(latest.weight, userInfo.height)}</p>
                    </div>
                ` : ''}
                ${latest.muscleMass ? `
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                        <h4 style="margin: 0 0 10px 0; color: #7f8c8d;">肌肉量</h4>
                        <p style="margin: 0; font-size: 24px; font-weight: bold; color: #2c3e50;">${latest.muscleMass} kg</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderTrendAnalysis(reportData) {
    const trends = reportData.trends;
    
    return `
        <div style="margin-bottom: 30px;">
            <h3 style="color: #2c3e50; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">趋势分析</h3>
            <div style="margin-top: 20px;">
                ${trends.weight.data.length > 0 ? `
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #34495e;">体重变化趋势</h4>
                        <div id="weightTrendChart" style="height: 300px;"></div>
                    </div>
                ` : ''}
                ${trends.fatRate.data.length > 0 ? `
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #34495e;">体脂率变化趋势</h4>
                        <div id="fatRateTrendChart" style="height: 300px;"></div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderRiskAssessment(reportData) {
    const riskLevels = reportData.riskLevels;
    
    return `
        <div style="margin-bottom: 30px;">
            <h3 style="color: #2c3e50; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">风险评估</h3>
            <div style="margin-top: 15px;">
                ${Object.entries(riskLevels).map(([key, level]) => {
                    const labels = {
                        bmi: 'BMI',
                        fatRate: '体脂率',
                        weight: '体重',
                        visceralFat: '内脏脂肪'
                    };
                    
                    let color = '#27ae60'; // 正常
                    if (level === '肥胖' || level === '高血压2级' || level === '中心性肥胖') {
                        color = '#e74c3c'; // 危险
                    } else if (level === '超重' || level === '高血压1级' || level === '偏高') {
                        color = '#f39c12'; // 警告
                    }
                    
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #f0f0f0;">
                            <span style="font-weight: 500;">${labels[key] || key}</span>
                            <span style="padding: 3px 10px; border-radius: 12px; background: ${color}; color: white;">${level}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function renderHealthAdvice(reportData) {
    const advice = reportData.healthAdvice;
    
    return `
        <div style="margin-bottom: 30px;">
            <h3 style="color: #2c3e50; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">健康建议</h3>
            <ul style="margin-top: 15px; padding-left: 20px;">
                ${advice.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
            </ul>
        </div>
    `;
}

function renderGoalTracking(reportData) {
    const goals = reportData.goals;
    
    return `
        <div style="margin-bottom: 30px;">
            <h3 style="color: #2c3e50; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">目标跟踪</h3>
            <div style="margin-top: 15px;">
                ${goals.map(goal => {
                    const metricNames = {
                        'weight': '体重',
                        'fatRate': '体脂率',
                        'bmi': 'BMI',
                        'waist': '腰围',
                        'muscleMass': '肌肉量'
                    };
                    
                    const unit = goal.metricType === 'weight' ? '斤' : 
                                 goal.metricType === 'fatRate' ? '%' : 
                                 goal.metricType === 'waist' ? 'cm' : 
                                 goal.metricType === 'muscleMass' ? 'kg' : '';
                    
                    return `
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <h4 style="margin: 0; color: #34495e;">${metricNames[goal.metricType]}目标</h4>
                                <span style="padding: 3px 8px; border-radius: 12px; background: ${goal.status === 'completed' ? '#27ae60' : goal.status === 'failed' ? '#e74c3c' : '#3498db'}; color: white;">
                                    ${goal.status === 'completed' ? '已完成' : goal.status === 'failed' ? '已失败' : '进行中'}
                                </span>
                            </div>
                            <div style="margin-bottom: 10px;">
                                <span>目标：从 ${goal.initialValue}${unit} 到 ${goal.targetValue}${unit}</span>
                            </div>
                            <div style="margin-bottom: 5px;">
                                <div style="display: flex; justify-content: space-between;">
                                    <span>完成进度</span>
                                    <span>${goal.progress.toFixed(1)}%</span>
                                </div>
                                <div style="height: 8px; background: #ecf0f1; border-radius: 4px; overflow: hidden;">
                                    <div style="height: 100%; width: ${goal.progress}%; background: ${goal.status === 'completed' ? '#27ae60' : goal.status === 'failed' ? '#e74c3c' : '#3498db'}; border-radius: 4px;"></div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function renderReportFooter() {
    return `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #7f8c8d; font-size: 14px;">
            <p>数据来源：健康管理系统</p>
            <p>生成时间：${new Date().toLocaleString('zh-CN')}</p>
            <p style="margin-top: 10px;">免责声明：本报告仅供参考，不构成医疗建议</p>
        </div>
    `;
}

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

function copyToClipboard() {
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
        canvas.toBlob(blob => {
            try {
                navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': blob
                    })
                ]).then(() => {
                    alert('报告已复制到剪贴板');
                }).catch(err => {
                    console.error('复制失败:', err);
                    alert('复制失败，请手动截图');
                });
            } catch (e) {
                alert('您的浏览器不支持此功能，请手动截图');
            }
        });
    });
}

// 当前显示的日期索引
let currentDateIndex = -1;

// 显示当日指标
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
        bmi = calculateBMI(dailyData.weight, userInfo.height);
    }

    // 手动计算BMR（因为原始数据中可能没有）
    let bmr = dailyData.bmr;
    if (!bmr && userInfo.height && userInfo.age && userInfo.gender) {
        bmr = calculateBMR(dailyData.weight, userInfo.height, userInfo.age, userInfo.gender);
        bmr = bmr ? Math.round(bmr) : null;
    }
    
    // 计算TDEE
    let tdee = null;
    if (bmr && userInfo.activityLevel) {
        tdee = calculateTDEE(bmr, userInfo.activityLevel);
    }

    // 计算衍生指标，优先使用已有值，否则重新计算
    let whr = dailyData.whr;
    if (!whr && dailyData.waist && dailyData.hip) {
        whr = calculateWHR(dailyData.waist, dailyData.hip);
    }

    let muscleRate = dailyData.muscleRate;
    if (!muscleRate && dailyData.muscleMass && dailyData.weight) {
        muscleRate = calculateMuscleRate(dailyData.muscleMass, dailyData.weight);
    }

    let leanBodyMass = dailyData.leanBodyMass;
    if (!leanBodyMass && dailyData.weight && dailyData.fatRate) {
        leanBodyMass = calculateLeanBodyMass(dailyData.weight, dailyData.fatRate);
    }

    let fatMass = dailyData.fatMass;
    if (!fatMass && dailyData.weight && dailyData.fatRate) {
        fatMass = calculateFatMass(dailyData.weight, dailyData.fatRate);
    }

    let obesityDegree = dailyData.obesityDegree;
    if (!obesityDegree && userInfo.height && userInfo.gender) {
        obesityDegree = calculateObesityDegree(dailyData.weight, userInfo.height, userInfo.gender);
    }

    // 计算各项指标的风险等级
    const bmiLevel = calculateBMILevel(bmi);
    const fatRateLevel = calculateFatRateLevel(dailyData.fatRate, userInfo.gender);
    const whrLevel = calculateWHRLevel(whr, userInfo.gender);
    const visceralFatLevel = calculateVisceralFatLevel(dailyData.visceralFat);
    const obesityDegreeLevel = calculateObesityDegreeLevel(obesityDegree);
    const proteinLevel = calculateProteinLevel(dailyData.protein);

    // 生成健康指标配置
    const metricsConfig = [
        { key: 'date', label: '日期', value: dailyData.date, unit: '', level: null },
        { key: 'weight', label: '体重', value: dailyData.weight, unit: '斤', level: null },
        { key: 'fatRate', label: '体脂率', value: dailyData.fatRate, unit: '%', level: fatRateLevel },
        { key: 'bmi', label: 'BMI', value: bmi, unit: '', level: bmiLevel },
        { key: 'obesityDegree', label: '肥胖度', value: obesityDegree, unit: '%', level: obesityDegreeLevel },
        { key: 'fatMass', label: '脂肪重量', value: fatMass, unit: '斤', level: null },
        { key: 'leanBodyMass', label: '瘦体重', value: leanBodyMass, unit: '斤', level: null },
        { key: 'bmr', label: '基础代谢率', value: bmr, unit: '大卡', level: null },
        { key: 'tdee', label: '每日总消耗', value: tdee, unit: '大卡', level: null },
        { key: 'muscleMass', label: '肌肉量', value: dailyData.muscleMass, unit: 'kg', level: null },
        { key: 'waterRate', label: '水分率', value: dailyData.waterRate, unit: '%', level: null },
        { key: 'protein', label: '蛋白质', value: dailyData.protein, unit: '%', level: proteinLevel },
        { key: 'boneMass', label: '骨量', value: dailyData.boneMass, unit: 'kg', level: null },
        { key: 'visceralFat', label: '内脏脂肪', value: dailyData.visceralFat, unit: '', level: visceralFatLevel },
        { key: 'muscleRate', label: '肌肉率', value: muscleRate, unit: '%', level: null },
        { key: 'waist', label: '腰围', value: dailyData.waist, unit: 'cm', level: null },
        { key: 'hip', label: '臀围', value: dailyData.hip, unit: 'cm', level: null },
        { key: 'systolic', label: '收缩压', value: dailyData.systolic, unit: 'mmHg', level: null },
        { key: 'diastolic', label: '舒张压', value: dailyData.diastolic, unit: 'mmHg', level: null },
        { key: 'heartRate', label: '静息心率', value: dailyData.heartRate, unit: '次/分', level: null },
        { key: 'whr', label: '腰臀比', value: whr, unit: '', level: whrLevel }
    ];

    // 生成模态框内容
    const modalBody = document.getElementById('modalBody');
    let html = `<h3>${dailyData.date}</h3><div class="metrics-grid">`;
    
    metricsConfig.forEach(metric => {
        let levelColor = '#2c3e50';
        if (metric.level) {
            levelColor = levelColors[metric.level] || '#2c3e50';
        }
        
        html += `
            <div>
                <h4>${metric.label}</h4>
                <div class="value" style="color: ${levelColor};">${metric.value || '-'}</div>
                ${metric.level ? `<div class="level">${metric.level}</div>` : ''}
            </div>
        `;
    });
    
    html += '</div>';
    modalBody.innerHTML = html;
    
    // 打开模态框
    openModal();
}

// 导航每日数据
function navigateDailyData(direction) {
    if (rawData.length === 0) return;
    
    currentDateIndex += direction;
    if (currentDateIndex < 0) currentDateIndex = 0;
    if (currentDateIndex >= rawData.length) currentDateIndex = rawData.length - 1;
    
    const currentData = rawData[currentDateIndex];
    showDailyMetrics(currentData.date);
}

// 更新箭头显示状态
function updateArrowVisibility() {
    const prevArrow = document.getElementById('prevArrow');
    const nextArrow = document.getElementById('nextArrow');
    
    if (currentDateIndex <= 0) {
        prevArrow.classList.add('hidden');
    } else {
        prevArrow.classList.remove('hidden');
    }
    
    if (currentDateIndex >= rawData.length - 1) {
        nextArrow.classList.add('hidden');
    } else {
        nextArrow.classList.remove('hidden');
    }
}

// 添加或更新健康数据
function addData() {
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
}

// 导出数据
function exportData() {
    const dataStr = JSON.stringify(rawData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// 导入数据
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                rawData = importedData;
                saveData();
                recalculateAllDerivedMetrics();
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

// 全局图表实例
let myChart = null;

// 图表指标配置
const chartMetrics = [
    { key: 'weight', name: '体重(斤)', unit: '斤', color: '#5470C6', yAxisIndex: 0 },
    { key: 'fatRate', name: '体脂率(%)', unit: '%', color: '#91CC75', yAxisIndex: 1 },
    { key: 'bmi', name: 'BMI', unit: '', color: '#fac858', yAxisIndex: 0 },
    { key: 'muscleRate', name: '肌肉率(%)', unit: '%', color: '#ee6666', yAxisIndex: 1 },
    { key: 'waterRate', name: '水分率(%)', unit: '%', color: '#73c0de', yAxisIndex: 1 },
    { key: 'obesityDegree', name: '肥胖度(%)', unit: '%', color: '#9b59b6', yAxisIndex: 1 },
    { key: 'visceralFat', name: '内脏脂肪', unit: '', color: '#3ba272', yAxisIndex: 0 },
    { key: 'protein', name: '蛋白质(%)', unit: '%', color: '#fc8452', yAxisIndex: 1 }
];

// 更新图表
function updateChart() {
    const chartDom = document.getElementById('chart');
    if (!chartDom) return;
    
    // 初始化或获取图表实例
    if (!myChart) {
        myChart = echarts.init(chartDom);
    }
    
    // 准备数据
    const sortedData = [...rawData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const dates = sortedData.map(item => item.date);
    
    // 动态计算缺失的指标数据
    const enhancedData = sortedData.map(item => {
        const enhancedItem = { ...item };
        
        // 计算BMI（如果缺失）
        if (!enhancedItem.bmi && userInfo.height) {
            enhancedItem.bmi = calculateBMI(enhancedItem.weight, userInfo.height);
        }
        
        // 计算肌肉率（如果缺失）
        if (!enhancedItem.muscleRate && enhancedItem.muscleMass && enhancedItem.weight) {
            enhancedItem.muscleRate = calculateMuscleRate(enhancedItem.muscleMass, enhancedItem.weight);
        }
        
        // 计算肥胖度（如果缺失）
        if (!enhancedItem.obesityDegree && userInfo.height && userInfo.gender) {
            enhancedItem.obesityDegree = calculateObesityDegree(enhancedItem.weight, userInfo.height, userInfo.gender);
        }
        
        return enhancedItem;
    });
    
    // 生成系列数据
    const series = currentMetrics.map(metricKey => {
        const metric = chartMetrics.find(m => m.key === metricKey);
        const data = enhancedData.map(item => item[metricKey] || null);
        return {
            name: metric.name,
            type: 'line',
            smooth: true,
            data: data,
            yAxisIndex: metric.yAxisIndex,
            lineStyle: {
                width: 3,
                color: metric.color
            },
            itemStyle: {
                color: metric.color,
                emphasis: {
                    focus: 'series'
                }
            },
            areaStyle: metric.yAxisIndex === 0 ? {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0,
                        color: `${metric.color}80`
                    }, {
                        offset: 1,
                        color: `${metric.color}20`
                    }]
                }
            } : undefined,
            clickable: true
        };
    });
    
    // 计算Y轴范围
    const yAxis0Data = enhancedData.map(item => {
        return currentMetrics
            .filter(key => chartMetrics.find(m => m.key === key).yAxisIndex === 0)
            .map(key => item[key])
            .filter(val => val !== null);
    }).flat();

    const yAxis1Data = enhancedData.map(item => {
        return currentMetrics
            .filter(key => chartMetrics.find(m => m.key === key).yAxisIndex === 1)
            .map(key => item[key])
            .filter(val => val !== null);
    }).flat();
    
    const option = {
        title: {
            text: '健康数据变化趋势',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            }
        },
        legend: {
            data: series.map(s => s.name),
            bottom: 0,
            selectedMode: 'multiple',
            show: false
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dates,
            axisLabel: {
                rotate: 0
            }
        },
        yAxis: [
            {
                type: 'value',
                name: series.find(s => s.yAxisIndex === 0)?.name || '数值',
                min: yAxis0Data.length > 0 ? Math.min(...yAxis0Data) - 5 : 0,
                max: yAxis0Data.length > 0 ? Math.max(...yAxis0Data) + 5 : 100,
                position: 'left',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: series.find(s => s.yAxisIndex === 0)?.lineStyle.color || '#5470C6'
                    }
                },
                axisLabel: {
                    formatter: '{value}'
                }
            },
            {
                type: 'value',
                name: series.find(s => s.yAxisIndex === 1)?.name || '百分比(%)',
                min: yAxis1Data.length > 0 ? Math.min(...yAxis1Data) - 5 : 0,
                max: yAxis1Data.length > 0 ? Math.max(...yAxis1Data) + 5 : 100,
                position: 'right',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: series.find(s => s.yAxisIndex === 1)?.lineStyle.color || '#91CC75'
                    }
                },
                axisLabel: {
                    formatter: '{value}'
                }
            }
        ],
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
                zoomLock: false
            },
            {
                type: 'slider',
                start: 0,
                end: 100,
                bottom: 0
            }
        ],
        series: series,
        emphasis: {
            focus: 'series'
        }
    };
    
    // 渲染图表，使用notMerge: true确保完全替换旧配置
    option && myChart.setOption(option, true);
    
    // 重新添加图表点击事件，确保图表更新后事件仍然有效
    addChartClickEvent();
    
    // 响应式
    window.addEventListener('resize', function() {
        if (myChart) {
            myChart.resize();
        }
    });
}

// 添加图表点击事件
function addChartClickEvent() {
    if (!myChart) return;
    
    // 移除之前的所有事件监听，确保没有冲突
    myChart.off('click');
    myChart.off('dataZoom');
    
    // 添加ECharts原生点击事件
    myChart.on('click', function(params) {
        // 确保params有name属性
        if (params && params.name) {
            const date = params.name;
            showDailyMetrics(date);
        }
    });
    
    // 添加dataZoom事件监听，当用户调整数据缩放时更新所有相关内容
    myChart.on('dataZoom', function(params) {
        updateTimeRange();
        updateMetrics();
        updateHealthSummary();
    });
}

// 更新指标卡片
function updateMetrics() {
    if (rawData.length === 0) return;
    
    // 获取当前显示的数据范围
    let startIndex = 0;
    let endIndex = rawData.length - 1;
    
    try {
        // 获取当前图表的dataZoom配置，以确定当前显示的数据范围
        if (myChart) {
            const option = myChart.getOption();
            
            // 查找slider类型的dataZoom，这是用户实际操作的滑块
            const dataZoom = option.dataZoom && option.dataZoom.find(dz => dz.type === 'slider');
            
            if (dataZoom && dataZoom.start !== undefined && dataZoom.end !== undefined) {
                const startPercent = dataZoom.start / 100;
                const endPercent = dataZoom.end / 100;
                
                startIndex = Math.round(startPercent * (rawData.length - 1));
                endIndex = Math.round(endPercent * (rawData.length - 1));
            }
        }
    } catch (error) {
        // 如果获取图表配置失败，使用默认的整个数据集范围
    }
    
    // 按日期排序
    const sortedData = [...rawData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const initialData = sortedData[startIndex];
    const latestData = sortedData[endIndex];
    
    // 更新初始体重
    const initialWeightCard = document.querySelector('.metric-card:nth-child(1)');
    if (initialWeightCard) {
        initialWeightCard.querySelector('.value').textContent = initialData.weight + ' 斤';
        initialWeightCard.querySelector('.change').textContent = initialData.date;
    }
    
    // 更新当前体重
    const currentWeightCard = document.querySelector('.metric-card:nth-child(2)');
    if (currentWeightCard) {
        currentWeightCard.querySelector('.value').textContent = latestData.weight + ' 斤';
        currentWeightCard.querySelector('.change').textContent = latestData.date;
    }
    
    // 更新体重变化
    const weightChange = latestData.weight - initialData.weight;
    const weightChangePercent = ((weightChange / initialData.weight) * 100).toFixed(1);
    const weightChangeElement = document.querySelector('.metric-card:nth-child(3)');
    if (weightChangeElement) {
        weightChangeElement.querySelector('.value').textContent = (weightChange >= 0 ? '+' : '') + weightChange.toFixed(1) + ' 斤';
        weightChangeElement.querySelector('.change').textContent = (weightChange >= 0 ? '↑' : '↓') + ' ' + Math.abs(weightChangePercent) + '%';
        weightChangeElement.querySelector('.change').className = 'change ' + (weightChange >= 0 ? 'negative' : 'positive');
    }
    
    // 更新体脂率变化
    const initialFatRate = initialData.fatRate || 0;
    const latestFatRate = latestData.fatRate || 0;
    const fatRateChange = latestFatRate - initialFatRate;
    const fatRateChangeElement = document.querySelector('.metric-card:nth-child(4)');
    if (fatRateChangeElement) {
        fatRateChangeElement.querySelector('.value').textContent = initialFatRate + '% → ' + latestFatRate + '%';
        fatRateChangeElement.querySelector('.change').textContent = (fatRateChange >= 0 ? '↑' : '↓') + ' ' + Math.abs(fatRateChange) + '%';
        fatRateChangeElement.querySelector('.change').className = 'change ' + (fatRateChange >= 0 ? 'negative' : 'positive');
    }
    
    // 更新时间范围
    updateTimeRange();
    
    // 更新健康分析摘要
    updateHealthSummary();
}

// 更新健康分析摘要
function updateHealthSummary() {
    if (rawData.length === 0) return;
    
    // 获取当前显示的数据范围
    let startIndex = 0;
    let endIndex = rawData.length - 1;
    
    try {
        // 获取当前图表的dataZoom配置，以确定当前显示的数据范围
        if (myChart) {
            const option = myChart.getOption();
            
            // 查找slider类型的dataZoom，这是用户实际操作的滑块
            const dataZoom = option.dataZoom && option.dataZoom.find(dz => dz.type === 'slider');
            
            if (dataZoom && dataZoom.start !== undefined && dataZoom.end !== undefined) {
                const startPercent = dataZoom.start / 100;
                const endPercent = dataZoom.end / 100;
                
                startIndex = Math.round(startPercent * (rawData.length - 1));
                endIndex = Math.round(endPercent * (rawData.length - 1));
            }
        }
    } catch (error) {
        // 如果获取图表配置失败，使用默认的整个数据集范围
    }
    
    // 按日期排序
    const sortedData = [...rawData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const initialData = sortedData[startIndex];
    const latestData = sortedData[endIndex];
    
    const weightChange = latestData.weight - initialData.weight;
    const fatRateChange = (latestData.fatRate || 0) - (initialData.fatRate || 0);
    
    let summaryText = `根据您的体重变化数据，从${initialData.date}至${latestData.date}，`;
    if (weightChange < 0) {
        summaryText += `您成功减重${Math.abs(weightChange).toFixed(1)}斤，`;
    } else if (weightChange > 0) {
        summaryText += `您的体重增加了${weightChange.toFixed(1)}斤，`;
    } else {
        summaryText += `您的体重保持稳定，`;
    }
    
    if (fatRateChange < 0) {
        summaryText += `体脂率从${initialData.fatRate}%下降到${latestData.fatRate}%。`;
    } else if (fatRateChange > 0) {
        summaryText += `体脂率从${initialData.fatRate}%上升到${latestData.fatRate}%。`;
    } else {
        summaryText += `体脂率保持在${initialData.fatRate}%。`;
    }
    
    summaryText += '\n\n';
    
    if (weightChange < 0) {
        summaryText += '这是一个非常显著的成就！';
    } else if (weightChange > 0) {
        summaryText += '建议适当控制饮食，增加运动量。';
    } else {
        summaryText += '继续保持良好的生活习惯。';
    }
    
    summaryText += '\n\n';
    
    // 根据数据波动动态生成健康建议
    if (weightChange < 0) {
        if (Math.abs(weightChange) > 10) {
            summaryText += '您的减重过程显示出显著的下降趋势，这是一个非常好的开始！';
        } else {
            summaryText += '您的体重有所下降，继续保持良好的生活习惯！';
        }
        
        if (fatRateChange < 0) {
            summaryText += '同时体脂率也在下降，说明您的身体成分正在改善。';
        } else if (fatRateChange > 0) {
            summaryText += '但体脂率有所上升，建议增加力量训练，以提高肌肉比例。';
        } else {
            summaryText += '体脂率保持稳定，建议继续保持当前的运动和饮食计划。';
        }
    } else if (weightChange > 0) {
        summaryText += '您的体重有所上升，建议适当控制饮食，增加运动量。';
        
        if (fatRateChange > 0) {
            summaryText += '同时体脂率也在上升，建议减少高热量食物摄入，增加有氧运动。';
        } else if (fatRateChange < 0) {
            summaryText += '但体脂率有所下降，说明您可能增加了肌肉量，这是一个好现象。';
        }
    } else {
        summaryText += '您的体重保持稳定，继续保持良好的生活习惯！';
        
        if (fatRateChange < 0) {
            summaryText += '同时体脂率在下降，说明您的身体成分正在改善。';
        } else if (fatRateChange > 0) {
            summaryText += '但体脂率有所上升，建议增加运动量，控制饮食。';
        }
    }
    
    summaryText += '\n\n建议在后续减重计划中增加力量训练，以提高肌肉比例，进一步改善身体成分。保持充足的睡眠，建议每天睡眠7-8小时，保持水分摄入，建议每天饮水2000ml以上。';
    
    document.querySelector('.summary p').textContent = summaryText;
}

// 更新时间范围
function updateTimeRange() {
    if (rawData.length === 0) return;
    
    try {
        // 获取当前图表的dataZoom配置
        if (!myChart) return;
        
        const option = myChart.getOption();
        const dataZoom = option.dataZoom && option.dataZoom[0];
        
        let startIndex = 0;
        let endIndex = rawData.length - 1;
        
        // 如果有dataZoom配置，计算当前显示的数据范围
        if (dataZoom && dataZoom.start !== undefined && dataZoom.end !== undefined) {
            const startPercent = dataZoom.start / 100;
            const endPercent = dataZoom.end / 100;
            
            startIndex = Math.round(startPercent * (rawData.length - 1));
            endIndex = Math.round(endPercent * (rawData.length - 1));
        }
        
        // 获取当前显示的数据范围
        const firstData = rawData[startIndex];
        const lastData = rawData[endIndex];
        
        // 格式化日期显示
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${year}年${month}月${day}日`;
        };
        
        // 更新副标题的时间范围
        const subtitle = document.querySelector('.subtitle');
        subtitle.textContent = `${formatDate(firstData.date)} - ${formatDate(lastData.date)}`;
    } catch (error) {
        console.error('Error updating time range:', error);
        // 如果获取图表配置失败，使用默认的整个数据集范围
        if (rawData.length > 0) {
            const firstData = rawData[0];
            const lastData = rawData[rawData.length - 1];
            
            const formatDate = (dateStr) => {
                const date = new Date(dateStr);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                return `${year}年${month}月${day}日`;
            };
            
            const subtitle = document.querySelector('.subtitle');
            subtitle.textContent = `${formatDate(firstData.date)} - ${formatDate(lastData.date)}`;
        }
    }
}

// 初始化
function initApp() {
    initData();
    
    // 添加时间范围按钮点击事件
    const periodBtns = document.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有按钮的active类
            periodBtns.forEach(b => b.classList.remove('active'));
            // 添加当前按钮的active类
            this.classList.add('active');
            
            // 根据时间范围筛选数据的逻辑
            const period = this.dataset.period;
            console.log('Selected period:', period);
            
            let startIndex = 0;
            
            if (period === '3months') {
                // 显示最近3个月的数据
                startIndex = Math.max(0, rawData.length - 90);
            } else if (period === '1month') {
                // 显示最近1个月的数据
                startIndex = Math.max(0, rawData.length - 30);
            }
            
            // 更新数据缩放
            if (myChart) {
                myChart.setOption({
                    dataZoom: [
                        {
                            type: 'inside',
                            start: (startIndex / rawData.length) * 100,
                            end: 100
                        },
                        {
                            type: 'slider',
                            start: (startIndex / rawData.length) * 100,
                            end: 100,
                            bottom: 0
                        }
                    ]
                });
                
                // 更新时间范围显示和指标卡片
                updateTimeRange();
                updateMetrics();
                updateHealthSummary();
            }
        });
    });
}

initApp();

// 点击页面其他地方关闭下拉菜单
window.onclick = function(event) {
    if (!event.target.closest('.settings-menu')) {
        const dropdowns = document.getElementsByClassName('dropdown-content');
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
    
    // 点击模态框外部关闭模态框
    if (event.target.classList.contains('modal')) {
        // 关闭所有模态框
        closeModal();
        closePersonalInfoModal();
        closeHealthDataModal();
        closeDataComparisonModal();
        closeHealthGoalModal();
        closeHealthReportModal();
    }
};