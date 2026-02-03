// 健康趋势预测模态框
import * as echarts from 'echarts';
import * as dataManager from '../data/index.js';
import * as healthTrendUtils from '../utils/healthTrendUtils.js';
import { healthMetricsConfig } from '../config/healthMetricsConfig.js';

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
                color: '#2196F3',
                opacity: 0.7
            },
            lineStyle: {
                width: 2,
                type: 'dashed'
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(33, 150, 243, 0.3)' },
                    { offset: 1, color: 'rgba(33, 150, 243, 0.05)' }
                ])
            }
        });
    }
    
    // 图表配置
    const option = {
        title: {
            text: `${metricLabel}趋势预测`,
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
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
            bottom: 0
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
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: `${metricLabel}${metricUnit ? ' (' + metricUnit + ')' : ''}`
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
