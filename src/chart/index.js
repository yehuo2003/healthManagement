// 图表管理主模块

import * as echarts from 'echarts';
import * as chartConfig from './chartConfig.js';
import * as chartEvents from './chartEvents.js';
import { calculateBMI, calculateMuscleRate, calculateObesityDegree } from '../data/dataCalculator.js';

// 导出所有图表相关功能
export {
    // 图表配置
    chartConfig,
    // 图表事件处理
    chartEvents
};

// 直接导出常用函数
export * from './chartConfig.js';
export * from './chartEvents.js';

/**
 * 初始化图表
 * @param {string} chartId 图表容器ID
 * @returns {Object} 图表实例
 */
export function initChart(chartId) {
    const chartDom = document.getElementById(chartId);
    if (!chartDom) return null;
    
    return echarts.init(chartDom);
}

/**
 * 更新图表
 * @param {Object} myChart 图表实例
 * @param {Array} rawData 原始数据
 * @param {Array} currentMetrics 当前选中的指标
 * @param {Array} chartMetrics 图表指标配置
 * @param {Object} userInfo 用户信息
 * @param {Function} calculateMissingMetrics 计算缺失衍生指标的函数
 */
export function updateChart(myChart, rawData, currentMetrics, chartMetrics, userInfo, calculateMissingMetrics) {
    const chartDom = document.getElementById('chart');
    if (!chartDom) return;
    
    // 初始化或获取图表实例
    if (!myChart) {
        myChart = initChart('chart');
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
    const series = chartConfig.generateSeries(enhancedData, currentMetrics, chartMetrics);
    
    // 生成Y轴数据
    const { yAxis0Data, yAxis1Data } = chartConfig.generateYAxisData(enhancedData, currentMetrics, chartMetrics);
    
    // 生成图表配置
    const option = chartConfig.generateChartOption(series, dates, yAxis0Data, yAxis1Data);
    
    // 渲染图表，使用notMerge: true确保完全替换旧配置
    option && myChart.setOption(option, true);
}


