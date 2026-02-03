// 健康报告生成工具函数

/**
 * 获取当前主题的文本颜色
 * @returns {string} 当前主题的文本颜色
 */
function getThemeTextColor() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    return theme === 'dark' ? '#e0e0e0' : '#2c3e50';
}

/**
 * 获取当前主题的背景颜色
 * @returns {string} 当前主题的背景颜色
 */
function getThemeBgColor() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    return theme === 'dark' ? '#1e1e3f' : '#f8f9fa';
}

/**
 * 获取当前主题的边框颜色
 * @returns {string} 当前主题的边框颜色
 */
function getThemeBorderColor() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    return theme === 'dark' ? '#3a3a5a' : '#e0e0e0';
}

/**
 * 获取当前主题的次要文本颜色
 * @returns {string} 当前主题的次要文本颜色
 */
function getThemeSecondaryTextColor() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    return theme === 'dark' ? '#b0b0b0' : '#7f8c8d';
}

/**
 * 计算指定时间范围内的健康数据趋势
 * @param {Array} rawData 原始健康数据
 * @param {string} timeRange 时间范围
 * @returns {Object} 趋势数据
 */
export function calculateTrends(rawData, timeRange) {
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
        muscleMass: calculateMetricTrend(filteredData, 'muscleMass'),
        waterRate: calculateMetricTrend(filteredData, 'waterRate'),
        protein: calculateMetricTrend(filteredData, 'protein'),
        visceralFat: calculateMetricTrend(filteredData, 'visceralFat'),
        waist: calculateMetricTrend(filteredData, 'waist'),
        hip: calculateMetricTrend(filteredData, 'hip')
    };
    
    return trends;
}

/**
 * 计算单个指标的趋势
 * @param {Array} data 筛选后的数据
 * @param {string} metric 指标名称
 * @returns {Object} 指标趋势数据
 */
export function calculateMetricTrend(data, metric) {
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

/**
 * 基于风险等级生成健康建议
 * @param {Object} riskLevels 风险等级对象
 * @returns {Array} 健康建议数组
 */
export function generateHealthAdvice(riskLevels) {
    const advice = [];
    
    // 基于风险等级生成建议
    if (riskLevels.bmi === '肥胖' || riskLevels.bmi === '超重' || riskLevels.bmi === '偏胖' || riskLevels.bmi === '重度') {
        advice.push('建议控制饮食，减少高热量食物摄入，增加运动量');
    }
    
    if (riskLevels.fatRate === '肥胖' || riskLevels.fatRate === '超重' || riskLevels.fatRate === '偏高' || riskLevels.fatRate === '超高') {
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

/**
 * 计算身体得分
 * @param {Object} riskLevels 风险等级对象
 * @returns {Object} 身体得分对象，包含得分和等级
 */
function calculateBodyScore(riskLevels) {
    // 定义等级得分映射
    const levelScores = {
        '消瘦': 60,
        '偏瘦': 70,
        '标准': 100,
        '正常': 100,
        '偏胖': 70,
        '偏高': 70,
        '肥胖': 50,
        '超高': 40,
        '重度': 30
    };
    
    // 计算各项指标的得分
    const scores = [];
    for (const [key, level] of Object.entries(riskLevels)) {
        if (level && level !== 'N/A') {
            scores.push(levelScores[level] || 50);
        }
    }
    
    // 计算平均得分
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
    
    // 确定得分等级和颜色
    let scoreLevel = '';
    let scoreColor = '';
    
    if (averageScore >= 90) {
        scoreLevel = '优秀';
        scoreColor = '#27ae60'; // 绿色
    } else if (averageScore >= 75) {
        scoreLevel = '良好';
        scoreColor = '#3498db'; // 蓝色
    } else if (averageScore >= 60) {
        scoreLevel = '一般';
        scoreColor = '#f39c12'; // 黄色
    } else {
        scoreLevel = '需要改善';
        scoreColor = '#e74c3c'; // 红色
    }
    
    return {
        score: averageScore,
        level: scoreLevel,
        color: scoreColor
    };
}

/**
 * 生成健康报告数据
 * @param {string} reportType 报告类型
 * @param {string} timeRange 时间范围
 * @param {Array} rawData 原始健康数据
 * @param {Object} userInfo 用户信息
 * @param {Array} healthGoals 健康目标数组
 * @param {Object} calculateBMILevel 计算BMI等级的函数
 * @param {Object} calculateFatRateLevel 计算体脂率等级的函数
 * @param {Object} calculateWeightLevel 计算体重等级的函数
 * @param {Object} calculateVisceralFatLevel 计算内脏脂肪等级的函数
 * @param {Object} calculateBMI 计算BMI的函数
 * @returns {Object} 报告数据
 */
export function generateReportData(reportType, timeRange, rawData, userInfo, healthGoals, calculateBMILevel, calculateFatRateLevel, calculateWeightLevel, calculateVisceralFatLevel, calculateBMI) {
    const trends = calculateTrends(rawData, timeRange);
    const latestData = [...rawData].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    
    // 确保BMI值存在
    if (!latestData.bmi && latestData.weight && userInfo.height) {
        latestData.bmi = calculateBMI(latestData.weight, userInfo.height);
    }
    
    // 计算具体的时间范围
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
    
    // 计算时间范围的开始和结束日期
    let startDate = '';
    let endDate = '';
    if (filteredData.length > 0) {
        const sortedData = [...filteredData].sort((a, b) => new Date(a.date) - new Date(b.date));
        startDate = sortedData[0].date;
        endDate = sortedData[sortedData.length - 1].date;
    }
    
    const riskLevels = {
        bmi: calculateBMILevel(latestData.bmi || calculateBMI(latestData.weight, userInfo.height)),
        fatRate: calculateFatRateLevel(latestData.fatRate, userInfo.gender),
        weight: calculateWeightLevel(latestData.weight, userInfo.height, userInfo.gender),
        visceralFat: calculateVisceralFatLevel(latestData.visceralFat)
    };
    
    // 计算身体得分
    const bodyScore = calculateBodyScore(riskLevels);
    
    const healthAdvice = generateHealthAdvice(riskLevels);
    
    return {
        reportType: reportType,
        timeRange: timeRange,
        startDate: startDate,
        endDate: endDate,
        generatedAt: new Date().toISOString(),
        userInfo: userInfo,
        latestData: latestData,
        trends: trends,
        riskLevels: riskLevels,
        healthAdvice: healthAdvice,
        goals: healthGoals,
        bodyScore: bodyScore
    };
}

/**
 * 生成健康报告HTML
 * @param {Object} reportData 报告数据
 * @returns {string} 报告HTML
 */
export function generateReportHTML(reportData) {
    let html = '';
    
    // 报告头部
    html += renderReportHeader(reportData);
    
    // 身体得分
    html += renderBodyScore(reportData.bodyScore);
    
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

/**
 * 渲染报告头部
 * @param {Object} reportData 报告数据
 * @returns {string} 头部HTML
 */
function renderReportHeader(reportData) {
    const formattedDate = new Date(reportData.generatedAt).toLocaleDateString('zh-CN');
    const reportTypes = {
        'comprehensive': '综合健康报告',
        'weight': '体重管理报告',
        'fat': '体脂管理报告'
    };
    
    return `
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #3498db; margin-bottom: 30px;">
            <h2 style="margin: 0; color: ${getThemeTextColor()};">${reportTypes[reportData.reportType]}</h2>
            <p style="margin: 10px 0; color: ${getThemeSecondaryTextColor()};">生成日期：${formattedDate}</p>
            ${reportData.userInfo.name ? `<p style="margin: 5px 0; color: ${getThemeSecondaryTextColor()};">姓名：${reportData.userInfo.name}</p>` : ''}
            ${reportData.userInfo.age ? `<p style="margin: 5px 0; color: ${getThemeSecondaryTextColor()};">年龄：${reportData.userInfo.age}岁</p>` : ''}
            ${reportData.userInfo.gender ? `<p style="margin: 5px 0; color: ${getThemeSecondaryTextColor()};">性别：${reportData.userInfo.gender === 'male' ? '男' : '女'}</p>` : ''}
        </div>
    `;
}

/**
 * 渲染身体得分
 * @param {Object} bodyScore 身体得分对象
 * @returns {string} 身体得分HTML
 */
function renderBodyScore(bodyScore) {
    if (!bodyScore) return '';
    
    return `
        <div style="margin-bottom: 30px; text-align: center;">
            <h3 style="color: ${getThemeTextColor()}; margin-bottom: 20px;">身体得分</h3>
            <div style="background: ${getThemeBgColor()}; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); border: 1px solid ${getThemeBorderColor()};">
                <div style="font-size: 48px; font-weight: bold; margin: 0; color: ${bodyScore.color};">${bodyScore.score}</div>
                <div style="font-size: 20px; margin: 10px 0 0 0; color: ${bodyScore.color};">${bodyScore.level}</div>
            </div>
        </div>
    `;
}

/**
 * 渲染数据概览
 * @param {Object} reportData 报告数据
 * @returns {string} 概览HTML
 */
function renderDataOverview(reportData) {
    const latestData = reportData.latestData;
    const riskLevels = reportData.riskLevels;
    
    // 定义等级颜色映射
    const levelColors = {
        '偏瘦': '#3498db', // 蓝色
        '标准': '#27ae60', // 绿色
        '偏高': '#f39c12', // 黄色
        '超高': '#e74c3c', // 红色
        '消瘦': '#7f8c8d', // 灰色
        '正常': '#27ae60', // 绿色
        '偏胖': '#f39c12', // 黄色
        '肥胖': '#e74c3c', // 红色
        '重度': '#c0392b', // 深红色
        '不足': '#e74c3c', // 红色
        '优': '#3498db' // 蓝色
    };
    
    // 准备所有指标
    const metrics = [
        { key: 'weight', label: '体重', unit: '斤', value: latestData.weight, level: riskLevels.weight },
        { key: 'fatRate', label: '体脂率', unit: '%', value: latestData.fatRate, level: riskLevels.fatRate },
        { key: 'bmi', label: 'BMI', unit: '', value: latestData.bmi, level: riskLevels.bmi },
        { key: 'muscleMass', label: '肌肉量', unit: 'kg', value: latestData.muscleMass },
        { key: 'waterRate', label: '水分率', unit: '%', value: latestData.waterRate },
        { key: 'protein', label: '蛋白质', unit: '%', value: latestData.protein },
        { key: 'visceralFat', label: '内脏脂肪', unit: '', value: latestData.visceralFat, level: riskLevels.visceralFat },
        { key: 'boneMass', label: '骨量', unit: 'kg', value: latestData.boneMass },
        { key: 'waist', label: '腰围', unit: 'cm', value: latestData.waist },
        { key: 'hip', label: '臀围', unit: 'cm', value: latestData.hip },
        { key: 'systolic', label: '收缩压', unit: 'mmHg', value: latestData.systolic },
        { key: 'diastolic', label: '舒张压', unit: 'mmHg', value: latestData.diastolic },
        { key: 'heartRate', label: '心率', unit: '次/分', value: latestData.heartRate }
    ];
    
    // 过滤出有值的指标
    const validMetrics = metrics.filter(metric => metric.value !== undefined && metric.value !== null);
    
    return `
        <div style="margin-bottom: 30px;">
            <h3 style="color: ${getThemeTextColor()}; margin-bottom: 20px;">数据概览</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                ${validMetrics.map(metric => {
                    const level = metric.level;
                    const valueColor = level ? (levelColors[level] || getThemeTextColor()) : getThemeTextColor();
                    return `
                        <div style="background: ${getThemeBgColor()}; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid ${getThemeBorderColor()};">
                            <h4 style="margin: 0 0 10px 0; color: #3498db;">${metric.label}</h4>
                            <p style="font-size: 24px; font-weight: bold; margin: 0; color: ${valueColor};">${metric.value}${metric.unit}</p>
                            ${level ? `<p style="font-size: 14px; margin: 5px 0 0 0; color: ${valueColor};">${level}</p>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

/**
 * 渲染趋势分析
 * @param {Object} reportData 报告数据
 * @returns {string} 趋势分析HTML
 */
function renderTrendAnalysis(reportData) {
    const trends = reportData.trends;
    const startDate = reportData.startDate;
    const endDate = reportData.endDate;
    
    // 格式化日期为中文格式
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
    }
    
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    
    // 准备趋势分析项
    const trendItems = [
        { key: 'weight', label: '体重', unit: '斤', trends: trends.weight },
        { key: 'fatRate', label: '体脂率', unit: '%', trends: trends.fatRate },
        { key: 'muscleMass', label: '肌肉量', unit: 'kg', trends: trends.muscleMass },
        { key: 'waterRate', label: '水分率', unit: '%', trends: trends.waterRate },
        { key: 'protein', label: '蛋白质', unit: '%', trends: trends.protein },
        { key: 'visceralFat', label: '内脏脂肪', unit: '', trends: trends.visceralFat },
        { key: 'waist', label: '腰围', unit: 'cm', trends: trends.waist },
        { key: 'hip', label: '臀围', unit: 'cm', trends: trends.hip }
    ];
    
    // 过滤出有有效数据的趋势项
    const validTrendItems = trendItems.filter(item => item.trends.data.length > 0 && item.trends.start !== 0);
    
    return `
        <div style="margin-bottom: 30px;">
            <h3 style="color: ${getThemeTextColor()}; margin-bottom: 20px;">趋势分析</h3>
            <div style="background: ${getThemeBgColor()}; padding: 20px; border-radius: 8px; border: 1px solid ${getThemeBorderColor()};">
                <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid ${getThemeBorderColor()};">
                    <h4 style="margin: 0; color: #3498db;">分析时间范围</h4>
                    <p style="margin: 5px 0 0 0; color: ${getThemeTextColor()};">${formattedStartDate} - ${formattedEndDate}</p>
                </div>
                ${validTrendItems.map((item, index) => `
                    <div style="margin-bottom: ${index < validTrendItems.length - 1 ? '20px' : '0'};">
                        <h4 style="margin: 0 0 10px 0; color: #3498db;">${item.label}变化趋势</h4>
                        <p style="color: ${getThemeTextColor()};">从 ${item.trends.start}${item.unit} 到 ${item.trends.end}${item.unit}，${item.trends.change > 0 ? '增加了' : '减少了'} ${Math.abs(item.trends.change).toFixed(1)} ${item.unit}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * 渲染风险评估
 * @param {Object} reportData 报告数据
 * @returns {string} 风险评估HTML
 */
function renderRiskAssessment(reportData) {
    const riskLevels = reportData.riskLevels;
    
    // 定义等级颜色映射
    const levelColors = {
        '偏瘦': '#f39c12',
        '正常': '#27ae60',
        '超重': '#f39c12',
        '肥胖': '#e74c3c',
        '偏高': '#f39c12',
        '中心性肥胖': '#e74c3c',
        '消瘦': '#7f8c8d',
        '标准': '#27ae60',
        '偏胖': '#f39c12',
        '重度': '#c0392b',
        '不足': '#e74c3c',
        '优': '#3498db'
    };
    
    return `
        <div style="margin-bottom: 30px;">
            <h3 style="color: ${getThemeTextColor()}; margin-bottom: 20px;">风险评估</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div style="background: ${getThemeBgColor()}; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid ${getThemeBorderColor()};">
                    <h4 style="margin: 0 0 10px 0; color: #3498db;">BMI等级</h4>
                    <p style="font-size: 18px; font-weight: bold; margin: 0; color: ${levelColors[riskLevels.bmi] || getThemeTextColor()};">${riskLevels.bmi}</p>
                </div>
                <div style="background: ${getThemeBgColor()}; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid ${getThemeBorderColor()};">
                    <h4 style="margin: 0 0 10px 0; color: #3498db;">体脂率等级</h4>
                    <p style="font-size: 18px; font-weight: bold; margin: 0; color: ${levelColors[riskLevels.fatRate] || getThemeTextColor()};">${riskLevels.fatRate}</p>
                </div>
                <div style="background: ${getThemeBgColor()}; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid ${getThemeBorderColor()};">
                    <h4 style="margin: 0 0 10px 0; color: #3498db;">体重等级</h4>
                    <p style="font-size: 18px; font-weight: bold; margin: 0; color: ${levelColors[riskLevels.weight] || getThemeTextColor()};">${riskLevels.weight}</p>
                </div>
                <div style="background: ${getThemeBgColor()}; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid ${getThemeBorderColor()};">
                    <h4 style="margin: 0 0 10px 0; color: #3498db;">内脏脂肪等级</h4>
                    <p style="font-size: 18px; font-weight: bold; margin: 0; color: ${levelColors[riskLevels.visceralFat] || getThemeTextColor()};">${riskLevels.visceralFat}</p>
                </div>
            </div>
        </div>
    `;
}

/**
 * 渲染健康建议
 * @param {Object} reportData 报告数据
 * @returns {string} 健康建议HTML
 */
function renderHealthAdvice(reportData) {
    const healthAdvice = reportData.healthAdvice;
    
    return `
        <div style="margin-bottom: 30px;">
            <h3 style="color: ${getThemeTextColor()}; margin-bottom: 20px;">健康建议</h3>
            <div style="background: ${getThemeBgColor()}; padding: 20px; border-radius: 8px; border: 1px solid ${getThemeBorderColor()};">
                <ul style="margin: 0; padding-left: 20px; color: ${getThemeTextColor()};">
                    ${healthAdvice.map(advice => `<li style="margin-bottom: 10px;">${advice}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

/**
 * 渲染目标跟踪
 * @param {Object} reportData 报告数据
 * @returns {string} 目标跟踪HTML
 */
function renderGoalTracking(reportData) {
    const goals = reportData.goals;
    
    return `
        <div style="margin-bottom: 30px;">
            <h3 style="color: ${getThemeTextColor()}; margin-bottom: 20px;">目标跟踪</h3>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                ${goals.map(goal => {
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
                    
                    return `
                        <div style="background: ${getThemeBgColor()}; padding: 15px; border-radius: 8px; border-left: 4px solid ${statusColor}; border: 1px solid ${getThemeBorderColor()};">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <h4 style="margin: 0; color: ${getThemeTextColor()};">${metricName}目标</h4>
                                    <p style="margin: 5px 0; color: ${getThemeSecondaryTextColor()};">从 ${goal.initialValue}${unit} 到 ${goal.targetValue}${unit}</p>
                                    <p style="margin: 5px 0; color: ${getThemeSecondaryTextColor()};">目标日期：${formatDate(goal.targetDate)}</p>
                                </div>
                                <span style="padding: 3px 8px; border-radius: 12px; background: ${statusColor}; color: white;">
                                    ${getGoalStatusText(goal.status)}
                                </span>
                            </div>
                            <div style="margin-top: 10px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span style="font-size: 14px; color: ${getThemeSecondaryTextColor()};">完成进度</span>
                                    <span style="font-size: 14px; font-weight: bold; color: ${statusColor};">${goal.progress.toFixed(1)}%</span>
                                </div>
                                <div style="height: 10px; background: ${getThemeBorderColor()}; border-radius: 5px; overflow: hidden;">
                                    <div style="height: 100%; width: ${goal.progress}%; background: ${statusColor}; border-radius: 5px;"></div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

/**
 * 渲染报告尾部
 * @returns {string} 尾部HTML
 */
function renderReportFooter() {
    return `
        <div style="text-align: center; padding: 20px 0; border-top: 2px solid #3498db; margin-top: 30px;">
            <p style="margin: 0; color: ${getThemeSecondaryTextColor()};">健康报告生成时间：${new Date().toLocaleString('zh-CN')}</p>
            <p style="margin: 5px 0; color: ${getThemeSecondaryTextColor()};">本报告仅供参考，不构成医疗建议</p>
        </div>
    `;
}

/**
 * 获取目标状态文本
 * @param {string} status 状态值
 * @returns {string} 状态文本
 */
function getGoalStatusText(status) {
    switch (status) {
        case 'completed': return '已完成';
        case 'failed': return '已失败';
        case 'in_progress': return '进行中';
        default: return '未知';
    }
}
