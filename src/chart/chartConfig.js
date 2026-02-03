// 图表配置模块

/**
 * 获取当前主题
 * @returns {string} 当前主题名称
 */
function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
}

/**
 * 根据主题获取图表颜色配置
 * @returns {Object} 图表颜色配置
 */
function getChartThemeConfig() {
    const theme = getCurrentTheme();
    
    if (theme === 'dark') {
        return {
            textColor: '#e0e0e0',
            axisLineColor: '#3a3a5a',
            splitLineColor: 'rgba(255, 255, 255, 0.1)',
            tooltipBgColor: 'rgba(26, 26, 46, 0.9)',
            tooltipBorderColor: '#3a3a5a',
            dataZoomBgColor: 'rgba(26, 26, 46, 0.5)',
            dataZoomFillerColor: 'rgba(52, 152, 219, 0.3)',
            dataZoomHandleColor: '#3498db'
        };
    } else {
        // 浅色主题
        return {
            textColor: '#333',
            axisLineColor: '#e0e0e0',
            splitLineColor: 'rgba(0, 0, 0, 0.1)',
            tooltipBgColor: 'rgba(255, 255, 255, 0.9)',
            tooltipBorderColor: '#e0e0e0',
            dataZoomBgColor: 'rgba(0, 0, 0, 0.05)',
            dataZoomFillerColor: 'rgba(52, 152, 219, 0.2)',
            dataZoomHandleColor: '#3498db'
        };
    }
}

/**
 * 生成图表配置选项
 * @param {Array} series 系列数据
 * @param {Array} dates 日期数据
 * @param {Array} yAxis0Data y轴0数据
 * @param {Array} yAxis1Data y轴1数据
 * @returns {Object} 图表配置选项
 */
export function generateChartOption(series, dates, yAxis0Data, yAxis1Data) {
    const themeConfig = getChartThemeConfig();
    
    return {
        title: {
            text: '健康数据变化趋势',
            left: 'center',
            textStyle: {
                color: themeConfig.textColor
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: themeConfig.tooltipBgColor,
                    borderColor: themeConfig.tooltipBorderColor,
                    color: themeConfig.textColor
                }
            },
            backgroundColor: themeConfig.tooltipBgColor,
            borderColor: themeConfig.tooltipBorderColor,
            textStyle: {
                color: themeConfig.textColor
            }
        },
        legend: {
            data: series.map(s => s.name),
            bottom: 0,
            selectedMode: 'multiple',
            show: false,
            textStyle: {
                color: themeConfig.textColor
            }
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
            },
            iconStyle: {
                borderColor: themeConfig.textColor
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dates,
            axisLabel: {
                rotate: 0,
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
                    formatter: '{value}',
                    color: themeConfig.textColor
                },
                splitLine: {
                    lineStyle: {
                        color: themeConfig.splitLineColor
                    }
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
                    formatter: '{value}',
                    color: themeConfig.textColor
                },
                splitLine: {
                    show: false
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
                bottom: 0,
                backgroundColor: themeConfig.dataZoomBgColor,
                fillerColor: themeConfig.dataZoomFillerColor,
                borderColor: themeConfig.axisLineColor,
                handleStyle: {
                    color: themeConfig.dataZoomHandleColor
                },
                textStyle: {
                    color: themeConfig.textColor
                }
            }
        ],
        series: series,
        emphasis: {
            focus: 'series'
        }
    };
}

/**
 * 生成图表系列数据
 * @param {Array} enhancedData 增强后的数据
 * @param {Array} currentMetrics 当前选中的指标
 * @param {Array} chartMetrics 图表指标配置
 * @returns {Array} 系列数据
 */
export function generateSeries(enhancedData, currentMetrics, chartMetrics) {
    return currentMetrics.map(metricKey => {
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
}

/**
 * 生成Y轴数据
 * @param {Array} enhancedData 增强后的数据
 * @param {Array} currentMetrics 当前选中的指标
 * @param {Array} chartMetrics 图表指标配置
 * @returns {Object} Y轴数据
 */
export function generateYAxisData(enhancedData, currentMetrics, chartMetrics) {
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

    return {
        yAxis0Data,
        yAxis1Data
    };
}
