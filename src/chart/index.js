/*
 * @Author: LinZhuMing
 * @Date: 2026-01-31 14:31:34
 * @LastEditors: LinZhuMing
 * @LastEditTime: 2026-02-02 17:04:24
 * @FilePath: \healthManagement\src\chart\index.js
 * @Description: 
 * 
 */
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
    
    // 返回图表实例
    return myChart;
}

/**
 * 创建分析图表
 * @param {HTMLElement} chartContainer 图表容器
 * @param {Object} chartData 图表数据
 * @param {string} metricName 指标名称
 * @param {string} unit 单位
 * @returns {Object} 图表实例
 */
export function createAnalysisChart(chartContainer, chartData, metricName, unit) {
    if (!chartContainer) return null;
    
    const analysisChart = echarts.init(chartContainer);
    
    // 获取当前主题
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    
    // 根据主题获取颜色配置
    const themeConfig = theme === 'dark' ? {
        textColor: '#e0e0e0',
        axisLineColor: '#3a3a5a',
        splitLineColor: 'rgba(255, 255, 255, 0.1)',
        tooltipBgColor: 'rgba(26, 26, 46, 0.9)',
        tooltipBorderColor: '#3a3a5a',
        lineColor: '#3498db',
        areaColor1: 'rgba(52, 152, 219, 0.3)',
        areaColor2: 'rgba(52, 152, 219, 0.1)'
    } : {
        textColor: '#333',
        axisLineColor: '#e0e0e0',
        splitLineColor: 'rgba(0, 0, 0, 0.1)',
        tooltipBgColor: 'rgba(255, 255, 255, 0.9)',
        tooltipBorderColor: '#e0e0e0',
        lineColor: '#4CAF50',
        areaColor1: 'rgba(76, 175, 80, 0.3)',
        areaColor2: 'rgba(76, 175, 80, 0.1)'
    };
    
    const option = {
        title: {
            text: `${metricName}趋势分析`,
            left: 'center',
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold',
                color: themeConfig.textColor
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                return `${params[0].name}<br/>${metricName}: ${params[0].value} ${unit}`;
            },
            backgroundColor: themeConfig.tooltipBgColor,
            borderColor: themeConfig.tooltipBorderColor,
            textStyle: {
                color: themeConfig.textColor
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: chartData.dates,
            axisLabel: {
                rotate: 45,
                color: themeConfig.textColor
            },
            axisLine: {
                lineStyle: {
                    color: themeConfig.axisLineColor
                }
            },
            splitLine: {
                lineStyle: {
                    color: themeConfig.splitLineColor
                }
            }
        },
        yAxis: {
            type: 'value',
            name: `${metricName} (${unit})`,
            axisLabel: {
                formatter: `{value} ${unit}`,
                color: themeConfig.textColor
            },
            axisLine: {
                lineStyle: {
                    color: themeConfig.axisLineColor
                }
            },
            splitLine: {
                lineStyle: {
                    color: themeConfig.splitLineColor
                }
            }
        },
        series: [
            {
                name: metricName,
                type: 'line',
                data: chartData.values,
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: {
                    width: 2,
                    color: themeConfig.lineColor
                },
                itemStyle: {
                    color: themeConfig.lineColor
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: themeConfig.areaColor1
                        },
                        {
                            offset: 1,
                            color: themeConfig.areaColor2
                        }
                    ])
                }
            }
        ]
    };
    
    analysisChart.setOption(option);
    
    // 响应式调整
    window.addEventListener('resize', function() {
        analysisChart.resize();
    });
    
    return analysisChart;
}


