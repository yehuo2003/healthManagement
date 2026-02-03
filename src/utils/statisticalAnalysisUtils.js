// 统计分析工具函数
import * as dataManager from '../data/index.js';

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
 * @param {Object} userInfo 用户信息，用于计算衍生指标
 * @returns {Object} 统计数据
 */
export function calculateMetricStats(data, metric, userInfo = {}) {
    const values = data
        .map(item => {
            // 尝试获取原始值
            let value = item[metric];
            
            // 如果值不存在或为null/undefined，尝试计算衍生指标
            if (!value || value === null || value === undefined) {
                // 根据指标类型计算衍生值
                switch (metric) {
                    case 'bmi':
                        if (item.weight && userInfo.height) {
                            value = dataManager.calculateBMI(item.weight, userInfo.height);
                        }
                        break;
                    case 'obesityDegree':
                        if (item.weight && userInfo.height && userInfo.gender) {
                            value = dataManager.calculateObesityDegree(item.weight, userInfo.height, userInfo.gender);
                        }
                        break;
                    case 'whr':
                        if (item.waist && item.hip) {
                            value = dataManager.calculateWHR(item.waist, item.hip);
                        }
                        break;
                    case 'bmr':
                        if (item.weight && userInfo.height && userInfo.age && userInfo.gender) {
                            value = dataManager.calculateBMR(item.weight, userInfo.height, userInfo.age, userInfo.gender);
                        }
                        break;
                    case 'muscleRate':
                        if (item.muscleMass && item.weight) {
                            value = dataManager.calculateMuscleRate(item.muscleMass, item.weight);
                        }
                        break;
                    case 'leanBodyMass':
                        if (item.weight && item.fatRate) {
                            value = dataManager.calculateLeanBodyMass(item.weight, item.fatRate);
                        }
                        break;
                    case 'fatMass':
                        if (item.weight && item.fatRate) {
                            value = dataManager.calculateFatMass(item.weight, item.fatRate);
                        }
                        break;
                }
            }
            
            // 尝试将值转换为浮点数
            const numValue = parseFloat(value);
            return isNaN(numValue) ? null : numValue;
        })
        .filter(value => value !== null && !isNaN(value));
    
    if (values.length === 0) {
        return {
            count: 0,
            average: 0,
            max: 0,
            min: 0,
            median: 0,
            sum: 0,
            standardDeviation: 0,
            range: 0
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
    
    // 计算极差
    const range = max - min;
    
    return {
        count: values.length,
        average: parseFloat(average.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        min: parseFloat(min.toFixed(2)),
        median: parseFloat(median.toFixed(2)),
        sum: parseFloat(sum.toFixed(2)),
        standardDeviation: parseFloat(standardDeviation.toFixed(2)),
        range: parseFloat(range.toFixed(2))
    };
}

/**
 * 计算月度统计数据
 * @param {Array} rawData 原始健康数据
 * @param {string} metric 指标名称
 * @param {Object} userInfo 用户信息
 * @returns {Array} 月度统计数据
 */
export function calculateMonthlyStats(rawData, metric, userInfo = {}) {
    const groupedData = groupDataByMonth(rawData);
    const monthlyStats = [];
    
    Object.entries(groupedData).forEach(([month, data]) => {
        const stats = calculateMetricStats(data, metric, userInfo);
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
 * @param {Object} userInfo 用户信息
 * @returns {Array} 季度统计数据
 */
export function calculateQuarterlyStats(rawData, metric, userInfo = {}) {
    const groupedData = groupDataByQuarter(rawData);
    const quarterlyStats = [];
    
    Object.entries(groupedData).forEach(([quarter, data]) => {
        const stats = calculateMetricStats(data, metric, userInfo);
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
 * @param {Object} userInfo 用户信息
 * @returns {Array} 年度统计数据
 */
export function calculateYearlyStats(rawData, metric, userInfo = {}) {
    const groupedData = groupDataByYear(rawData);
    const yearlyStats = [];
    
    Object.entries(groupedData).forEach(([year, data]) => {
        const stats = calculateMetricStats(data, metric, userInfo);
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
 * @param {Object} userInfo 用户信息
 * @returns {Array} 周平均变化率数据
 */
export function calculateWeeklyAverageChange(rawData, metric, userInfo = {}) {
    const groupedData = groupDataByWeek(rawData);
    const weeklyStats = [];
    
    // 计算每周的平均指标值
    Object.entries(groupedData).forEach(([week, data]) => {
        const stats = calculateMetricStats(data, metric, userInfo);
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
 * @param {Object} userInfo 用户信息
 * @returns {Array} 趋势数据
 */
export function calculateMetricTrend(rawData, metric, userInfo = {}) {
    const sortedData = [...rawData].sort((a, b) => new Date(a.date) - new Date(b.date));
    return sortedData.map(item => {
        // 尝试获取原始值
        let value = item[metric];
        
        // 如果值不存在或为null/undefined，尝试计算衍生指标
        if (!value || value === null || value === undefined) {
            // 根据指标类型计算衍生值
            switch (metric) {
                case 'bmi':
                    if (item.weight && userInfo.height) {
                        value = dataManager.calculateBMI(item.weight, userInfo.height);
                    }
                    break;
                case 'obesityDegree':
                    if (item.weight && userInfo.height && userInfo.gender) {
                        value = dataManager.calculateObesityDegree(item.weight, userInfo.height, userInfo.gender);
                    }
                    break;
                case 'whr':
                    if (item.waist && item.hip) {
                        value = dataManager.calculateWHR(item.waist, item.hip);
                    }
                    break;
                case 'bmr':
                    if (item.weight && userInfo.height && userInfo.age && userInfo.gender) {
                        value = dataManager.calculateBMR(item.weight, userInfo.height, userInfo.age, userInfo.gender);
                    }
                    break;
                case 'muscleRate':
                    if (item.muscleMass && item.weight) {
                        value = dataManager.calculateMuscleRate(item.muscleMass, item.weight);
                    }
                    break;
                case 'leanBodyMass':
                    if (item.weight && item.fatRate) {
                        value = dataManager.calculateLeanBodyMass(item.weight, item.fatRate);
                    }
                    break;
                case 'fatMass':
                    if (item.weight && item.fatRate) {
                        value = dataManager.calculateFatMass(item.weight, item.fatRate);
                    }
                    break;
            }
        }
        
        const numValue = parseFloat(value) || 0;
        return {
            date: item.date,
            value: numValue
        };
    }).filter(item => item.value !== 0);
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
 * @param {Object} userInfo 用户信息
 * @returns {Object} 波动分析结果
 */
export function analyzeDataVolatility(data, metric, userInfo = {}) {
    const stats = calculateMetricStats(data, metric, userInfo);
    
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
 * @param {string} customStartDate 自定义开始时间
 * @param {string} customEndDate 自定义结束时间
 * @param {Object} userInfo 用户信息
 * @returns {Object} 统计分析报告
 */
export function generateStatisticalReport(rawData, metric, timeRange, statType, customStartDate, customEndDate, userInfo = {}) {
    // 根据时间范围筛选数据
    let filteredData = rawData;
    if (timeRange !== 'all') {
        if (timeRange === 'custom' && customStartDate && customEndDate) {
            // 处理自定义时间范围
            const startTime = new Date(customStartDate);
            const endTime = new Date(customEndDate);
            // 设置结束时间为当天的23:59:59
            endTime.setHours(23, 59, 59, 999);
            filteredData = rawData.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= startTime && itemDate <= endTime;
            });
        } else {
            // 处理预设时间范围
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
    }
    
    // 生成统计数据
    let statsData = [];
    switch (statType) {
        case 'monthly':
            statsData = calculateMonthlyStats(filteredData, metric, userInfo);
            break;
        case 'quarterly':
            statsData = calculateQuarterlyStats(filteredData, metric, userInfo);
            break;
        case 'yearly':
            statsData = calculateYearlyStats(filteredData, metric, userInfo);
            break;
        case 'weekly':
            statsData = calculateWeeklyAverageChange(filteredData, metric, userInfo);
            break;
    }
    
    // 生成趋势数据
    const trendData = calculateMetricTrend(filteredData, metric, userInfo);
    
    // 分析趋势方向
    const trendAnalysis = analyzeTrendDirection(trendData);
    
    // 分析数据波动
    const volatilityAnalysis = analyzeDataVolatility(filteredData, metric, userInfo);
    
    return {
        metric: metric,
        timeRange: timeRange,
        statType: statType,
        statsData: statsData,
        trendData: trendData,
        totalStats: calculateMetricStats(filteredData, metric, userInfo),
        trendAnalysis: trendAnalysis,
        volatilityAnalysis: volatilityAnalysis
    };
}