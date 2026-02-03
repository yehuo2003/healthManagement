// 健康趋势预测模态框
import * as echarts from 'echarts';
import * as dataManager from '../data/index.js';
import * as healthTrendUtils from '../utils/healthTrendUtils.js';
import { healthMetricsConfig } from '../config/healthMetricsConfig.js';

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
 * 根据主题获取预测数据线条颜色
 * @returns {string} 线条颜色
 */
function getPredictionLineColor() {
    const theme = getCurrentTheme();
    return theme === 'dark' ? '#3498db' : '#2196F3';
}

/**
 * 根据主题获取预测数据区域颜色
 * @returns {Object} 线性渐变颜色配置
 */
function getPredictionAreaColor() {
    const theme = getCurrentTheme();
    const baseColor = theme === 'dark' ? '#3498db' : '#2196F3';
    
    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: `${baseColor}4D` }, // 30% opacity
        { offset: 1, color: `${baseColor}0D` }  // 5% opacity
    ]);
}

/**
 * 根据主题获取表格颜色
 * @returns {Object} 表格颜色配置
 */
function getTableColors() {
    const theme = getCurrentTheme();
    if (theme === 'dark') {
        return {
            textColor: '#e0e0e0',
            headerBg: '#2c3e50',
            headerText: '#e0e0e0',
            borderColor: '#3a3a5a'
        };
    } else {
        return {
            textColor: '#333',
            headerBg: '#f8f9fa',
            headerText: '#333',
            borderColor: '#e0e0e0'
        };
    }
}

// 全局变量
let trendChart = null;

/**
 * 创建健康趋势预测模态框
 * @returns {HTMLDivElement} 模态框元素
 */
export function createHealthTrendModal() {
    const modal = document.createElement('div');
    modal.id = 'healthTrendModal';
    modal.className = 'modal';
    modal.style.display = 'none';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>健康趋势预测</h3>
                <button class="close-button">&times;</button>
            </div>
            <div class="modal-body">
                <div class="trend-controls">
                    <div class="form-group">
                        <label for="trend-metric">选择指标：</label>
                        <select id="trend-metric">
                            ${healthMetricsConfig
                                .filter(metric => metric.showChange)
                                .map(metric => `<option value="${metric.key}">${metric.label}</option>`)
                                .join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="trend-days">预测天数：</label>
                        <input type="number" id="trend-days" min="7" max="90" value="30">
                    </div>
                    <button id="calculate-trend" class="btn btn-primary">计算趋势</button>
                </div>
                
                <div id="trend-result" class="trend-result" style="display: none;">
                    <div class="trend-analysis">
                        <h3>趋势分析</h3>
                        <div id="trend-message" class="trend-message"></div>
                        <div id="trend-strength" class="trend-strength"></div>
                        <div id="trend-advice" class="trend-advice"></div>
                    </div>
                    
                    <div class="trend-chart-container">
                        <h3>趋势图表</h3>
                        <div id="trend-chart" style="width: 100%; height: 400px;"></div>
                    </div>
                    
                    <div class="trend-data">
                        <h3>预测数据</h3>
                        <div class="data-table-container">
                            <table id="trend-data-table" class="data-table">
                                <thead>
                                    <tr>
                                        <th>日期</th>
                                        <th id="trend-value-header">预测值</th>
                                        <th>类型</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 绑定事件
    bindTrendModalEvents(modal);
    
    return modal;
}

/**
 * 绑定趋势预测模态框事件
 * @param {HTMLDivElement} modal 模态框元素
 */
function bindTrendModalEvents(modal) {
    const closeBtn = modal.querySelector('.close-button');
    const calculateBtn = modal.querySelector('#calculate-trend');
    
    // 关闭模态框
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // 计算趋势
    calculateBtn.addEventListener('click', async () => {
        const metricSelect = document.getElementById('trend-metric');
        const daysInput = document.getElementById('trend-days');
        const resultDiv = document.getElementById('trend-result');
        
        const metric = metricSelect.value;
        const predictionDays = parseInt(daysInput.value);
        
        if (isNaN(predictionDays) || predictionDays < 7 || predictionDays > 90) {
            alert('预测天数必须在7-90天之间');
            return;
        }
        
        // 显示加载状态
        resultDiv.style.display = 'none';
        calculateBtn.textContent = '计算中...';
        calculateBtn.disabled = true;
        
        try {
            // 获取数据
            const healthData = dataManager.getHealthData();
            const userInfo = dataManager.getUserInfo();
            
            // 预测趋势
            const predictionResult = healthTrendUtils.predictHealthTrend(
                healthData,
                metric,
                predictionDays,
                userInfo
            );
            
            // 显示结果
            displayTrendResult(predictionResult, metric);
            
            // 显示结果区域
            resultDiv.style.display = 'block';
        } catch (error) {
            console.error('计算趋势失败:', error);
            alert('计算趋势失败，请重试');
        } finally {
            calculateBtn.textContent = '计算趋势';
            calculateBtn.disabled = false;
        }
    });
}

/**
 * 显示趋势预测结果
 * @param {Object} predictionResult 预测结果
 * @param {string} metric 指标名称
 */
function displayTrendResult(predictionResult, metric) {
    const { historicalData, predictedData, trendAnalysis } = predictionResult;
    const metricConfig = healthMetricsConfig.find(m => m.key === metric);
    const metricLabel = metricConfig ? metricConfig.label : metric;
    const metricUnit = metricConfig ? metricConfig.unit : '';
    
    // 更新表头
    const valueHeader = document.getElementById('trend-value-header');
    valueHeader.textContent = `${metricLabel}${metricUnit ? ' (' + metricUnit + ')' : ''}`;
    
    // 显示趋势分析
    const trendMessage = document.getElementById('trend-message');
    const trendStrength = document.getElementById('trend-strength');
    const trendAdvice = document.getElementById('trend-advice');
    
    // 构建包含预测结果的消息
    let message = trendAnalysis.message;
    if (trendAnalysis.predictedValue !== null) {
        message += `，预计${predictedData.length}天后的${metricLabel}为${trendAnalysis.predictedValue}${metricUnit}`;
    }
    
    trendMessage.textContent = message;
    trendStrength.textContent = `趋势强度: ${trendAnalysis.strength.toFixed(1)}/10 (R²: ${trendAnalysis.rSquared})`;
    
    // 获取趋势建议
    const advice = healthTrendUtils.getTrendPredictionAdvice(trendAnalysis, metric);
    trendAdvice.textContent = `建议: ${advice}`;
    
    // 显示数据表格 - 只显示预测数据
    const tableBody = document.querySelector('#trend-data-table tbody');
    tableBody.innerHTML = '';
    
    // 添加预测数据
    predictedData.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'predicted-data';
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.value.toFixed(2)}${metricUnit}</td>
            <td>预测数据</td>
        `;
        tableBody.appendChild(row);
    });
    
    // 绘制趋势图表 - 只显示预测数据
    renderTrendChart([], predictedData, metricLabel, metricUnit);
}

/**
 * 渲染趋势图表
 * @param {Array} historicalData 历史数据
 * @param {Array} predictedData 预测数据
 * @param {string} metricLabel 指标名称
 * @param {string} metricUnit 指标单位
 */
function renderTrendChart(historicalData, predictedData, metricLabel, metricUnit) {
    const chartContainer = document.getElementById('trend-chart');
    if (!chartContainer) return;
    
    // 销毁之前的图表实例
    if (trendChart) {
        trendChart.dispose();
        trendChart = null;
    }
    
    // 清理容器
    chartContainer.innerHTML = '';
    
    // 获取主题配置
    const themeConfig = getChartThemeConfig();
    const predictionLineColor = getPredictionLineColor();
    const predictionAreaColor = getPredictionAreaColor();
    
    // 准备数据 - 只使用预测数据
    const dates = predictedData.map(item => item.date);
    const series = [];
    
    // 添加预测数据系列
    if (predictedData.length > 0) {
        series.push({
            name: '预测数据',
            type: 'line',
            data: predictedData.map(item => item.value),
            itemStyle: {
                color: predictionLineColor,
                opacity: 0.7
            },
            lineStyle: {
                width: 2,
                type: 'dashed',
                color: predictionLineColor
            },
            areaStyle: {
                color: predictionAreaColor
            }
        });
    }
    
    // 图表配置
    const option = {
        title: {
            text: `${metricLabel}趋势预测`,
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
            },
            formatter: function(params) {
                if (!params || params.length === 0) return '';
                
                let result = params[0].name + '<br/>';
                params.forEach(item => {
                    // 检查item.value是否存在且是数字
                    if (item.value !== null && item.value !== undefined && typeof item.value === 'number') {
                        result += `${item.marker}${item.seriesName}: ${item.value.toFixed(2)}${metricUnit}<br/>`;
                    } else {
                        result += `${item.marker}${item.seriesName}: 无数据${metricUnit}<br/>`;
                    }
                });
                return result;
            }
        },
        legend: {
            data: ['预测数据'],
            bottom: 0,
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
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dates,
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
            name: `${metricLabel}${metricUnit ? ' (' + metricUnit + ')' : ''}`,
            nameTextStyle: {
                color: themeConfig.textColor
            },
            axisLabel: {
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
        series: series
    };
    
    // 初始化新的图表实例
    trendChart = echarts.init(chartContainer);
    
    // 检查图表实例是否存在
    if (trendChart) {
        trendChart.setOption(option);
        
        // 确保图表正确适应容器大小
        setTimeout(() => {
            if (trendChart) {
                trendChart.resize();
            }
        }, 100);
        
        // 响应式调整 - 使用防抖函数避免频繁调用
        let resizeTimer;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (trendChart) {
                    trendChart.resize();
                }
            }, 100);
        };
        
        // 先移除旧的事件监听器，避免重复绑定
        window.removeEventListener('resize', handleResize);
        window.addEventListener('resize', handleResize);
    }
    
    // 更新表格样式以适应主题
    updateTableTheme();
}

/**
 * 更新表格样式以适应主题
 */
function updateTableTheme() {
    const table = document.getElementById('trend-data-table');
    if (!table) return;
    
    const tableColors = getTableColors();
    
    // 更新表格样式
    table.style.color = tableColors.textColor;
    table.style.borderColor = tableColors.borderColor;
    
    // 更新表头样式
    const headers = table.querySelectorAll('th');
    headers.forEach(header => {
        header.style.backgroundColor = tableColors.headerBg;
        header.style.color = tableColors.headerText;
        header.style.borderColor = tableColors.borderColor;
    });
    
    // 更新表格行样式
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
            cell.style.borderColor = tableColors.borderColor;
        });
    });
}

/**
 * 显示健康趋势预测模态框
 */
export function showHealthTrendModal() {
    const modal = document.getElementById('healthTrendModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * 更新健康趋势预测图表的主题
 */
export function updateTrendChartTheme() {
    // 如果图表实例存在，销毁并重新创建
    if (trendChart) {
        trendChart.dispose();
        trendChart = null;
    }
    
    // 如果模态框中的图表容器存在，重新初始化图表
    const chartContainer = document.getElementById('trend-chart');
    if (chartContainer) {
        // 尝试获取当前显示的预测数据
        const resultDiv = document.getElementById('trend-result');
        if (resultDiv && resultDiv.style.display !== 'none') {
            // 重新渲染图表（如果有数据）
            // 这里需要重新获取数据并渲染，或者在显示结果时保存数据
            // 由于数据可能已经不存在，我们只需要确保图表容器被清理
            chartContainer.innerHTML = '';
        }
    }
    
    // 更新表格主题
    updateTableTheme();
}
