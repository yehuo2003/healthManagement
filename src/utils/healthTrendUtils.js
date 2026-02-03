// 健康趋势预测工具函数

/**
 * 线性回归算法 - 计算趋势线
 * @param {Array} data 历史数据点 [{date, value}, ...]
 * @returns {Object} 回归方程参数 {slope, intercept, rSquared}
 */
export function linearRegression(data) {
    if (data.length < 2) {
        return { slope: 0, intercept: 0, rSquared: 0 };
    }
    
    const n = data.length;
    
    // 使用实际日期差值作为x值，而不是数据点索引
    const firstDate = new Date(data[0].date);
    const xValues = data.map(item => {
        const currentDate = new Date(item.date);
        return (currentDate - firstDate) / (1000 * 60 * 60 * 24); // 转换为天数
    });
    
    const yValues = data.map(item => item.value);
    
    // 计算平均值
    const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
    const yMean = yValues.reduce((sum, y) => sum + y, 0) / n;
    
    // 计算斜率 (slope) 和截距 (intercept)
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
        numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
        denominator += Math.pow(xValues[i] - xMean, 2);
    }
    
    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = yMean - slope * xMean;
    
    // 计算决定系数 R² (拟合度)
    let totalSumSquares = 0;
    let residualSumSquares = 0;
    
    for (let i = 0; i < n; i++) {
        totalSumSquares += Math.pow(yValues[i] - yMean, 2);
        const predictedY = slope * xValues[i] + intercept;
        residualSumSquares += Math.pow(yValues[i] - predictedY, 2);
    }
    
    const rSquared = totalSumSquares === 0 ? 0 : 1 - (residualSumSquares / totalSumSquares);
    
    return { slope, intercept, rSquared };
}

/**
 * 移动平均算法 - 平滑数据
 * @param {Array} data 历史数据点 [{date, value}, ...]
 * @param {number} windowSize 窗口大小
 * @returns {Array} 平滑后的数据点
 */
export function movingAverage(data, windowSize = 3) {
    if (data.length < windowSize) {
        return data;
    }
    
    const result = [];
    
    for (let i = 0; i < data.length; i++) {
        if (i < windowSize - 1) {
            // 前几个点使用实际值
            result.push({ ...data[i] });
        } else {
            // 计算移动平均值
            let sum = 0;
            for (let j = i - windowSize + 1; j <= i; j++) {
                sum += data[j].value;
            }
            const avg = sum / windowSize;
            result.push({ ...data[i], value: avg });
        }
    }
    
    return result;
}

/**
 * 生成未来预测数据点
 * @param {Array} historicalData 历史数据点 [{date, value}, ...]
 * @param {number} predictionDays 预测天数
 * @param {Object} regressionResult 回归方程参数
 * @returns {Array} 预测数据点 [{date, value, isPredicted: true}, ...]
 */
export function generatePredictionPoints(historicalData, predictionDays, regressionResult) {
    if (historicalData.length === 0) {
        return [];
    }
    
    const { slope, intercept } = regressionResult;
    const predictions = [];
    const lastDate = new Date(historicalData[historicalData.length - 1].date);
    
    // 计算最后一个历史数据点的x值（天数）
    const firstDate = new Date(historicalData[0].date);
    const lastXValue = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
    
    // 生成预测数据点
    for (let i = 1; i <= predictionDays; i++) {
        const predictionDate = new Date(lastDate);
        predictionDate.setDate(predictionDate.getDate() + i);
        
        // 计算预测日期的x值（天数）
        const predictedXValue = lastXValue + i;
        const predictedValue = slope * predictedXValue + intercept;
        
        predictions.push({
            date: predictionDate.toISOString().split('T')[0],
            value: parseFloat(predictedValue.toFixed(2)),
            isPredicted: true
        });
    }
    
    return predictions;
}

/**
 * 预测健康指标趋势
 * @param {Array} rawData 原始健康数据
 * @param {string} metric 指标名称
 * @param {number} predictionDays 预测天数
 * @param {Object} userInfo 用户信息，用于计算衍生指标
 * @returns {Object} 预测结果
 */
export function predictHealthTrend(rawData, metric, predictionDays = 30, userInfo = {}) {
    // 处理数据 - 对于衍生指标，不直接过滤，而是尝试计算
    const processedData = rawData
        .map(item => {
            let value = item[metric];
            
            // 尝试计算衍生指标
            if (!value && userInfo) {
                switch (metric) {
                    case 'bmi':
                        if (item.weight && userInfo.height) {
                            value = (item.weight / 2) / Math.pow(userInfo.height / 100, 2);
                        }
                        break;
                    case 'obesityDegree':
                        if (item.weight && userInfo.height && userInfo.gender) {
                            const idealWeightKg = userInfo.gender === 'male' 
                                ? (userInfo.height - 80) * 0.7 
                                : (userInfo.height - 70) * 0.6;
                            const idealWeight = idealWeightKg * 2;
                            value = ((item.weight - idealWeight) / idealWeight) * 100;
                        }
                        break;
                    case 'whr':
                        if (item.waist && item.hip) {
                            value = item.waist / item.hip;
                        }
                        break;
                    case 'muscleRate':
                        if (item.muscleMass && item.weight) {
                            // 肌肉率 = (肌肉量 / 体重) * 100
                            value = (item.muscleMass / (item.weight / 2)) * 100;
                        }
                        break;
                }
            }
            
            return {
                date: item.date,
                value: parseFloat(value) || 0
            };
        })
        .filter(item => item.value !== 0) // 只过滤掉计算后仍然为0的值
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (processedData.length < 2) {
        return {
            historicalData: processedData,
            predictedData: [],
            regressionResult: { slope: 0, intercept: 0, rSquared: 0 },
            trendAnalysis: {
                direction: 'insufficient_data',
                strength: 0,
                message: '数据不足，无法预测趋势'
            }
        };
    }
    
    // 使用最近的数据点（最多10个）来计算趋势，更好地捕捉最近的变化
    const recentData = processedData.slice(-Math.min(10, processedData.length));
    
    // 使用移动平均平滑数据，减少噪声影响
    const smoothedData = movingAverage(recentData, 3);
    
    // 计算线性回归
    const regressionResult = linearRegression(smoothedData);
    
    // 生成预测数据
    const predictedData = generatePredictionPoints(smoothedData, predictionDays, regressionResult);
    
    // 分析趋势
    const trendAnalysis = analyzePredictionTrend(regressionResult, processedData, predictedData);
    
    return {
        historicalData: processedData,
        predictedData: predictedData,
        regressionResult: regressionResult,
        trendAnalysis: trendAnalysis
    };
}

/**
 * 分析预测趋势
 * @param {Object} regressionResult 回归方程参数
 * @param {Array} historicalData 历史数据
 * @param {Array} predictedData 预测数据
 * @returns {Object} 趋势分析结果
 */
export function analyzePredictionTrend(regressionResult, historicalData, predictedData) {
    const { slope, rSquared } = regressionResult;
    
    if (historicalData.length === 0) {
        return {
            direction: 'insufficient_data',
            strength: 0,
            message: '数据不足，无法分析趋势',
            predictedValue: null
        };
    }
    
    let direction, strength, message;
    
    // 分析趋势方向
    if (Math.abs(slope) < 0.001) {
        direction = 'stable';
        message = '指标预计保持稳定';
    } else if (slope < 0) {
        direction = 'decreasing';
        message = '指标预计呈下降趋势';
    } else {
        direction = 'increasing';
        message = '指标预计呈上升趋势';
    }
    
    // 分析趋势强度 (基于斜率和R²)
    const slopeMagnitude = Math.abs(slope);
    const normalizedStrength = Math.min(slopeMagnitude * 100, 10) * rSquared;
    strength = parseFloat(normalizedStrength.toFixed(2));
    
    // 分析预测变化范围
    let predictedValue = null;
    if (predictedData.length > 0) {
        const lastHistoricalValue = historicalData[historicalData.length - 1].value;
        const lastPredictedValue = predictedData[predictedData.length - 1].value;
        const predictedChange = lastPredictedValue - lastHistoricalValue;
        const percentChange = lastHistoricalValue !== 0 
            ? (predictedChange / lastHistoricalValue) * 100 
            : 0;
        
        message += `，预计${predictedData.length}天内变化${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;
        
        // 保存预测值
        predictedValue = parseFloat(lastPredictedValue.toFixed(2));
    }
    
    return {
        direction,
        strength,
        message,
        rSquared: parseFloat(rSquared.toFixed(3)),
        predictedValue: predictedValue
    };
}

/**
 * 获取趋势预测建议
 * @param {Object} trendAnalysis 趋势分析结果
 * @param {string} metric 指标名称
 * @returns {string} 趋势预测建议
 */
export function getTrendPredictionAdvice(trendAnalysis, metric) {
    const { direction, message } = trendAnalysis;
    
    const adviceMap = {
        weight: {
            decreasing: '体重呈下降趋势，建议保持健康的饮食和运动习惯',
            increasing: '体重呈上升趋势，建议注意饮食控制和增加运动量',
            stable: '体重保持稳定，建议维持当前的生活方式'
        },
        fatRate: {
            decreasing: '体脂率呈下降趋势，建议继续保持健康的生活方式',
            increasing: '体脂率呈上升趋势，建议增加有氧运动和控制饮食',
            stable: '体脂率保持稳定，建议维持当前的锻炼计划'
        },
        bmi: {
            decreasing: 'BMI呈下降趋势，建议继续保持健康的生活方式',
            increasing: 'BMI呈上升趋势，建议注意饮食和增加运动量',
            stable: 'BMI保持稳定，建议维持当前的生活习惯'
        },
        default: {
            decreasing: '指标呈下降趋势，建议关注变化原因',
            increasing: '指标呈上升趋势，建议关注变化原因',
            stable: '指标保持稳定，建议维持当前的生活方式'
        }
    };
    
    const metricAdvice = adviceMap[metric] || adviceMap.default;
    return `${message}。${metricAdvice[direction] || metricAdvice.default}`;
}
