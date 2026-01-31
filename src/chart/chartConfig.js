// 图表配置模块

/**
 * 生成图表配置选项
 * @param {Array} series 系列数据
 * @param {Array} dates 日期数据
 * @param {Array} yAxis0Data y轴0数据
 * @param {Array} yAxis1Data y轴1数据
 * @returns {Object} 图表配置选项
 */
export function generateChartOption(series, dates, yAxis0Data, yAxis1Data) {
    return {
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
