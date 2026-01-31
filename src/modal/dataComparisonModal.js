// 健康数据比对模态框模块

// 导入数据管理模块
import * as dataManager from '../data/index.js';

/**
 * 打开健康数据比对模态框
 * @param {Function} toggleSettingsMenu 切换设置菜单的函数
 * @param {Function} initDateSelectors 初始化日期选择器的函数
 */
export function openDataComparisonModal(toggleSettingsMenu, initDateSelectors) {
    // 先关闭设置菜单
    toggleSettingsMenu();
    // 清空之前的比对结果
    document.getElementById('comparisonResult').innerHTML = '';
    // 初始化日期选择器
    if (typeof initDateSelectors === 'function') {
        initDateSelectors();
    }
    // 显示模态框
    document.getElementById('dataComparisonModal').style.display = 'block';
}

/**
 * 关闭健康数据比对模态框
 */
export function closeDataComparisonModal() {
    document.getElementById('dataComparisonModal').style.display = 'none';
}

/**
 * 初始化日期选择器
 * @param {Array} rawData 原始数据
 */
export function initDateSelectors(rawData) {
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

/**
 * 比较健康数据
 * @param {Array} rawData 原始数据
 * @param {Object} userInfo 用户信息
 * @param {Array} healthMetricsConfig 健康数据指标配置
 * @param {Object} levelColors 等级颜色映射
 */
export function compareHealthData(rawData, userInfo, healthMetricsConfig, levelColors) {
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
    const enhancedData1 = dataManager.calculateMissingMetrics(data1, userInfo);
    const enhancedData2 = dataManager.calculateMissingMetrics(data2, userInfo);
    
    // 确定哪个日期更早
    const isDate1Earlier = new Date(date1) < new Date(date2);
    const earlierData = isDate1Earlier ? enhancedData1 : enhancedData2;
    const laterData = isDate1Earlier ? enhancedData2 : enhancedData1;
    const earlierDate = isDate1Earlier ? date1 : date2;
    const laterDate = isDate1Earlier ? date2 : date1;
    
    // 生成比对结果表格
    generateComparisonTable(earlierData, laterData, earlierDate, laterDate, userInfo, healthMetricsConfig, levelColors);
}

/**
 * 生成比对结果表格
 * @param {Object} earlierData 较早日期的数据
 * @param {Object} laterData 较晚日期的数据
 * @param {string} earlierDate 较早的日期
 * @param {string} laterDate 较晚的日期
 * @param {Object} userInfo 用户信息
 * @param {Array} healthMetricsConfig 健康数据指标配置
 * @param {Object} levelColors 等级颜色映射
 */
export function generateComparisonTable(earlierData, laterData, earlierDate, laterDate, userInfo, healthMetricsConfig, levelColors) {
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
    
    // 生成表格HTML
    let tableHTML = `
        <div style="margin-bottom: 15px;">
            <h4>数据比对结果：${formatDate(earlierDate)} vs ${formatDate(laterDate)}</h4>
        </div>
        <table ${tableStyle}>
            <thead>
                <tr>
                    <th ${thStyle}>指标</th>
                    <th ${thStyle} colspan="2">数据(${formatDate(earlierDate)} - ${formatDate(laterDate)})</th>
                    <th ${thStyle}>变化</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // 遍历所有指标，生成表格行
    healthMetricsConfig.forEach(config => {
        const { key, label, unit, showChange } = config;
        
        // 获取两个日期的指标值
        const value1 = earlierData[key] !== undefined && earlierData[key] !== null ? earlierData[key] : '-';
        const value2 = laterData[key] !== undefined && laterData[key] !== null ? laterData[key] : '-';
        
        // 计算两个日期的指标风险等级
        let riskLevel1 = null;
        let riskLevel2 = null;
        
        // 根据指标类型计算风险等级
        if (key === 'weight') {
            riskLevel1 = dataManager.calculateWeightLevel(value1, userInfo.height, userInfo.gender);
            riskLevel2 = dataManager.calculateWeightLevel(value2, userInfo.height, userInfo.gender);
        } else if (key === 'fatRate') {
            riskLevel1 = dataManager.calculateFatRateLevel(value1, userInfo.gender);
            riskLevel2 = dataManager.calculateFatRateLevel(value2, userInfo.gender);
        } else if (key === 'bmi') {
            riskLevel1 = dataManager.calculateBMILevel(value1);
            riskLevel2 = dataManager.calculateBMILevel(value2);
        } else if (key === 'obesityDegree') {
            riskLevel1 = dataManager.calculateObesityDegreeLevel(value1);
            riskLevel2 = dataManager.calculateObesityDegreeLevel(value2);
        } else if (key === 'whr') {
            riskLevel1 = dataManager.calculateWHRLevel(value1, userInfo.gender);
            riskLevel2 = dataManager.calculateWHRLevel(value2, userInfo.gender);
        } else if (key === 'visceralFat') {
            riskLevel1 = dataManager.calculateVisceralFatLevel(value1);
            riskLevel2 = dataManager.calculateVisceralFatLevel(value2);
        } else if (key === 'systolic' || key === 'diastolic') {
            // 血压需要同时考虑收缩压和舒张压
            riskLevel1 = dataManager.calculateBloodPressureLevel(earlierData.systolic, earlierData.diastolic);
            riskLevel2 = dataManager.calculateBloodPressureLevel(laterData.systolic, laterData.diastolic);
        } else if (key === 'protein') {
            // 蛋白质风险等级计算
            riskLevel1 = dataManager.calculateProteinLevel(value1);
            riskLevel2 = dataManager.calculateProteinLevel(value2);
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
