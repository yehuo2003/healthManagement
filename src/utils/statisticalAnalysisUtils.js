// 统计分析工具函数

/**
 * 按月份分组数据
 * @param {Array} rawData 原始健康数据
 * @returns {Object} 按月份分组的数据
 */
export function groupDataByMonth(rawData) {
    const groupedData = {};
    
    rawData.forEach(item => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!groupedData[monthKey]) {
            groupedData[monthKey] = [];
        }
        
        groupedData[monthKey].push(item);
    });
    
    return groupedData;
}

/**
 * 按季度分组数据
 * @param {Array} rawData 原始健康数据
 * @returns {Object} 按季度分组的数据
 */
export function groupDataByQuarter(rawData) {
    const groupedData = {};
    
    rawData.forEach(item => {
        const date = new Date(item.date);
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        const quarterKey = `${date.getFullYear()}-Q${quarter}`;
        
        if (!groupedData[quarterKey]) {
            groupedData[quarterKey] = [];
        }
        
        groupedData[quarterKey].push(item);
    });
    
    return groupedData;
}

/**
 * 按年度分组数据
 * @param {Array} rawData 原始健康数据
 * @returns {Object} 按年度分组的数据
 */
export function groupDataByYear(rawData) {
    const groupedData = {};
    
    rawData.forEach(item => {
        const date = new Date(item.date);
        const yearKey = `${date.getFullYear()}`;
        
        if (!groupedData[yearKey]) {
            groupedData[yearKey] = [];
        }
        
        groupedData[yearKey].push(item);
    });
    
    return groupedData;
}

/**
 * 按周分组数据
 * @param {Array} rawData 原始健康数据
 * @returns {Object} 按周分组的数据
 */
export function groupDataByWeek(rawData) {
    const groupedData = {};
    
    rawData.forEach(item => {
        const date = new Date(item.date);
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        const weekKey = `${date.getFullYear()}-W${weekNumber}`;
        
        if (!groupedData[weekKey]) {
            groupedData[weekKey] = [];
        }
        
        groupedData[weekKey].push(item);
    });
    
    return groupedData;
}

/**
 * 计算单个指标的统计数据
 * @param {Array} data 数据数组
 * @param {string} metric 指标名称
 * @returns {Object} 统计数据
 */
export function calculateMetricStats(data, metric) {
    const values = data
        .map(item => parseFloat(item[metric]))
        .filter(value => !isNaN(value));
    
    if (values.length === 0) {
        return {
            count: 0,
            average: 0,
            max: 0,
            min: 0,
            median: 0,
            sum: 0,
            standardDeviation: 0
        };
    }
    
    const sortedValues = [...values].sort((a, b) => a - b);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const median = sortedValues.length % 2 === 0
        ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
        : sortedValues[Math.floor(sortedValues.length / 2)];
    
    // 计算标准差
    const squaredDifferences = values.map(value => Math.pow(value - average, 2));
    const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    return {
        count: values.length,
        average: parseFloat(average.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        min: parseFloat(min.toFixed(2)),
        median: parseFloat(median.toFixed(2)),
        sum: parseFloat(sum.toFixed(2)),
        standardDeviation: parseFloat(standardDeviation.toFixed(2))
    };
}

/**
 * 计算月度统计数据
 * @param {Array} rawData 原始健康数据
 * @param {string} metric 指标名称
 * @returns {Array} 月度统计数据
 */
export function calculateMonthlyStats(rawData, metric) {
    const groupedData = groupDataByMonth(rawData);
    const monthlyStats = [];
    
    Object.entries(groupedData).forEach(([month, data]) => {
        const stats = calculateMetricStats(data, metric);
        monthlyStats.push({
            period: month,
            ...stats
        });
    });
    
    // 按月份排序
    return monthlyStats.sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * 计算季度统计数据
 * @param {Array} rawData 原始健康数据
 * @param {string} metric 指标名称
 * @returns {Array} 季度统计数据
 */
export function calculateQuarterlyStats(rawData, metric) {
    const groupedData = groupDataByQuarter(rawData);
    const quarterlyStats = [];
    
    Object.entries(groupedData).forEach(([quarter, data]) => {
        const stats = calculateMetricStats(data, metric);
        quarterlyStats.push({
            period: quarter,
            ...stats
        });
    });
    
    // 按季度排序
    return quarterlyStats.sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * 计算年度统计数据
 * @param {Array} rawData 原始健康数据
 * @param {string} metric 指标名称
 * @returns {Array} 年度统计数据
 */
export function calculateYearlyStats(rawData, metric) {
    const groupedData = groupDataByYear(rawData);
    const yearlyStats = [];
    
    Object.entries(groupedData).forEach(([year, data]) => {
        const stats = calculateMetricStats(data, metric);
        yearlyStats.push({
            period: year,
            ...stats
        });
    });
    
    // 按年度排序
    return yearlyStats.sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * 计算周平均变化率
 * @param {Array} rawData 原始健康数据
 * @param {string} metric 指标名称
 * @returns {Array} 周平均变化率数据
 */
export function calculateWeeklyAverageChange(rawData, metric) {
    const groupedData = groupDataByWeek(rawData);
    const weeklyStats = [];
    
    // 计算每周的平均指标值
    Object.entries(groupedData).forEach(([week, data]) => {
        const stats = calculateMetricStats(data, metric);
        weeklyStats.push({
            period: week,
            average: stats.average
        });
    });
    
    // 按周排序
    weeklyStats.sort((a, b) => a.period.localeCompare(b.period));
    
    // 计算周平均变化率
    const weeklyChanges = [];
    for (let i = 1; i < weeklyStats.length; i++) {
        const prevWeek = weeklyStats[i - 1];
        const currentWeek = weeklyStats[i];
        const change = currentWeek.average - prevWeek.average;
        const changeRate = prevWeek.average !== 0 ? (change / prevWeek.average) * 100 : 0;
        
        weeklyChanges.push({
            period: currentWeek.period,
            prevValue: prevWeek.average,
            currentValue: currentWeek.average,
            change: parseFloat(change.toFixed(2)),
            changeRate: parseFloat(changeRate.toFixed(2))
        });
    }
    
    return weeklyChanges;
}

/**
 * 计算指标趋势
 * @param {Array} rawData 原始健康数据
 * @param {string} metric 指标名称
 * @returns {Array} 趋势数据
 */
export function calculateMetricTrend(rawData, metric) {
    const sortedData = [...rawData].sort((a, b) => new Date(a.date) - new Date(b.date));
    return sortedData.map(item => ({
        date: item.date,
        value: parseFloat(item[metric]) || 0
    })).filter(item => item.value !== 0);
}

/**
 * 分析指标趋势方向
 * @param {Array} trendData 趋势数据
 * @returns {Object} 趋势方向分析结果
 */
export function analyzeTrendDirection(trendData) {
    if (trendData.length < 2) {
        return {
            direction: 'insufficient_data',
            strength: 0,
            message: '数据不足，无法分析趋势'
        };
    }
    
    const firstValue = trendData[0].value;
    const lastValue = trendData[trendData.length - 1].value;
    const change = lastValue - firstValue;
    const percentChange = firstValue !== 0 ? (change / firstValue) * 100 : 0;
    
    let direction, strength, message;
    
    if (Math.abs(percentChange) < 1) {
        direction = 'stable';
        strength = 0;
        message = '指标基本稳定';
    } else if (change < 0) {
        direction = 'decreasing';
        strength = Math.abs(percentChange) / 10; // 转换为0-10的强度值
        message = `指标呈下降趋势，变化率: ${percentChange.toFixed(1)}%`;
    } else {
        direction = 'increasing';
        strength = percentChange / 10;
        message = `指标呈上升趋势，变化率: ${percentChange.toFixed(1)}%`;
    }
    
    return {
        direction,
        strength: Math.min(Math.abs(strength), 10), // 限制强度在0-10之间
        message,
        change: parseFloat(change.toFixed(2)),
        percentChange: parseFloat(percentChange.toFixed(2))
    };
}

/**
 * 分析数据波动
 * @param {Array} data 数据数组
 * @param {string} metric 指标名称
 * @returns {Object} 波动分析结果
 */
export function analyzeDataVolatility(data, metric) {
    const stats = calculateMetricStats(data, metric);
    
    if (stats.count < 2) {
        return {
            volatility: 0,
            message: '数据不足，无法分析波动'
        };
    }
    
    // 使用标准差与平均值的比率来衡量波动
    const volatility = stats.average !== 0 ? (stats.standardDeviation / stats.average) * 100 : 0;
    
    let message;
    if (volatility < 1) {
        message = '数据波动很小，指标稳定';
    } else if (volatility < 5) {
        message = '数据有轻微波动';
    } else if (volatility < 10) {
        message = '数据波动中等';
    } else {
        message = '数据波动较大';
    }
    
    return {
        volatility: parseFloat(volatility.toFixed(2)),
        message,
        standardDeviation: stats.standardDeviation
    };
}

/**
 * 生成统计分析报告
 * @param {Array} rawData 原始健康数据
 * @param {string} metric 指标名称
 * @param {string} timeRange 时间范围
 * @param {string} statType 统计类型
 * @returns {Object} 统计分析报告
 */
export function generateStatisticalReport(rawData, metric, timeRange, statType) {
    // 根据时间范围筛选数据
    let filteredData = rawData;
    if (timeRange !== 'all') {
        const now = new Date();
        let months = 0;
        switch (timeRange) {
            case '3months': months = 3; break;
            case '6months': months = 6; break;
            case '1year': months = 12; break;
        }
        const startTime = new Date(now.setMonth(now.getMonth() - months));
        filteredData = rawData.filter(item => new Date(item.date) >= startTime);
    }
    
    // 生成统计数据
    let statsData = [];
    switch (statType) {
        case 'monthly':
            statsData = calculateMonthlyStats(filteredData, metric);
            break;
        case 'quarterly':
            statsData = calculateQuarterlyStats(filteredData, metric);
            break;
        case 'yearly':
            statsData = calculateYearlyStats(filteredData, metric);
            break;
        case 'weekly':
            statsData = calculateWeeklyAverageChange(filteredData, metric);
            break;
    }
    
    // 生成趋势数据
    const trendData = calculateMetricTrend(filteredData, metric);
    
    // 分析趋势方向
    const trendAnalysis = analyzeTrendDirection(trendData);
    
    // 分析数据波动
    const volatilityAnalysis = analyzeDataVolatility(filteredData, metric);
    
    return {
        metric: metric,
        timeRange: timeRange,
        statType: statType,
        statsData: statsData,
        trendData: trendData,
        totalStats: calculateMetricStats(filteredData, metric),
        trendAnalysis: trendAnalysis,
        volatilityAnalysis: volatilityAnalysis
    };
}