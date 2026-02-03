// 统计分析模态框模块

import * as statisticalAnalysisUtils from '../utils/statisticalAnalysisUtils.js';
import * as chartManager from '../chart/index.js';
import { healthMetricsConfig, chartMetrics } from '../config/index.js';

// 全局变量
let analysisChart = null;

/**
 * 打开统计分析模态框
 * @param {Function} closeDropdown 关闭下拉菜单的函数
 */
export function openStatisticalAnalysisModal(closeDropdown) {
    if (closeDropdown) {
        closeDropdown();
    }
    
    const modal = document.getElementById('statisticalAnalysisModal');
    if (modal) {
        modal.style.display = 'block';
        // 初始化表单
        initAnalysisForm();
    }
}

/**
 * 关闭统计分析模态框
 */
export function closeStatisticalAnalysisModal() {
    const modal = document.getElementById('statisticalAnalysisModal');
    if (modal) {
        modal.style.display = 'none';
        // 销毁图表实例
        if (analysisChart) {
            analysisChart.dispose();
            analysisChart = null;
        }
        // 隐藏导出按钮
        const exportButtons = document.getElementById('analysisExportButtons');
        if (exportButtons) {
            exportButtons.style.display = 'none';
        }
    }
}

/**
 * 初始化分析表单
 */
function initAnalysisForm() {
    // 清空结果区域
    document.getElementById('analysisResults').innerHTML = '';
    document.getElementById('analysisChart').innerHTML = '';
    
    // 添加时间范围选择事件监听器
    const timeRangeSelect = document.getElementById('analysisTimeRange');
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', function() {
            const customDateRange = document.getElementById('customDateRange');
            if (customDateRange) {
                if (this.value === 'custom') {
                    customDateRange.style.display = 'flex';
                } else {
                    customDateRange.style.display = 'none';
                }
            }
        });
    }
    
    // 添加表单提交事件
    const analysisForm = document.getElementById('analysisForm');
    if (analysisForm) {
        analysisForm.onsubmit = function(e) {
            e.preventDefault();
            performAnalysis();
        };
    }
}

/**
 * 执行统计分析
 */
export function performAnalysis() {
    const metric = document.getElementById('analysisMetric').value;
    const timeRange = document.getElementById('analysisTimeRange').value;
    const statType = document.getElementById('analysisStatType').value;
    
    // 获取全局数据
    const rawData = window.rawData || [];
    const userInfo = window.userInfo || {};
    
    if (rawData.length === 0) {
        alert('暂无健康数据可分析');
        return;
    }
    
    // 处理自定义时间范围
    let customStartDate = null;
    let customEndDate = null;
    
    if (timeRange === 'custom') {
        customStartDate = document.getElementById('customStartDate').value;
        customEndDate = document.getElementById('customEndDate').value;
        
        if (!customStartDate || !customEndDate) {
            alert('请选择开始时间和结束时间');
            return;
        }
        
        if (new Date(customStartDate) > new Date(customEndDate)) {
            alert('开始时间不能晚于结束时间');
            return;
        }
    }
    
    // 生成统计分析报告
    const report = statisticalAnalysisUtils.generateStatisticalReport(
        rawData, 
        metric, 
        timeRange, 
        statType,
        customStartDate,
        customEndDate,
        userInfo
    );
    
    // 显示分析结果
    displayAnalysisResults(report, metric);
    
    // 显示分析图表
    displayAnalysisChart(report, metric);
    
    // 显示导出按钮
    const exportButtons = document.getElementById('analysisExportButtons');
    if (exportButtons) {
        exportButtons.style.display = 'flex';
    }
}

/**
 * 显示分析结果
 * @param {Object} report 分析报告
 * @param {string} metric 指标名称
 */
function displayAnalysisResults(report, metric) {
    const resultsContainer = document.getElementById('analysisResults');
    if (!resultsContainer) return;
    
    // 获取指标配置信息
    const metricConfig = healthMetricsConfig.find(config => config.key === metric) || {
        label: metric,
        unit: ''
    };
    
    // 生成结果HTML
    let resultsHTML = `
        <h3>统计分析结果</h3>
        <div class="analysis-summary">
            <div class="summary-item">
                <span class="label">分析指标：</span>
                <span class="value">${metricConfig.label}</span>
            </div>
            <div class="summary-item">
                <span class="label">时间范围：</span>
                <span class="value">${getTimeRangeText(report.timeRange)}</span>
            </div>
            <div class="summary-item">
                <span class="label">统计类型：</span>
                <span class="value">${getStatTypeText(report.statType)}</span>
            </div>
        </div>
        
        <div class="stats-section">
            <h4>总体统计数据</h4>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">样本数</span>
                    <span class="stat-value">${report.totalStats.count}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">平均值</span>
                    <span class="stat-value">${report.totalStats.average} ${metricConfig.unit}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">最大值</span>
                    <span class="stat-value">${report.totalStats.max} ${metricConfig.unit}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">最小值</span>
                    <span class="stat-value">${report.totalStats.min} ${metricConfig.unit}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">中位数</span>
                    <span class="stat-value">${report.totalStats.median} ${metricConfig.unit}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">标准差</span>
                    <span class="stat-value">${report.totalStats.standardDeviation}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">极差</span>
                    <span class="stat-value">${report.totalStats.range} ${metricConfig.unit}</span>
                </div>
            </div>
        </div>
        
        <div class="analysis-section">
            <h4>趋势分析</h4>
            <div class="analysis-item">
                <span class="analysis-label">趋势方向：</span>
                <span class="analysis-value">${report.trendAnalysis.message}</span>
            </div>
        </div>
        
        <div class="analysis-section">
            <h4>波动分析</h4>
            <div class="analysis-item">
                <span class="analysis-label">数据波动：</span>
                <span class="analysis-value">${report.volatilityAnalysis.message}</span>
            </div>
        </div>
    `;
    
    // 添加详细统计数据
    if (report.statsData.length > 0) {
        resultsHTML += `
            <div class="detailed-stats-section">
                <h4>详细统计数据</h4>
                <div class="detailed-stats-table">
                    <table>
                        <thead>
                            <tr>
                                <th>周期</th>
                                ${report.statType === 'weekly' ? '<th>前值</th><th>当前值</th><th>变化</th><th>变化率</th>' : '<th>平均值</th><th>最大值</th><th>最小值</th><th>标准差</th><th>极差</th>'}
                            </tr>
                        </thead>
                        <tbody>
                            ${report.statsData.map(item => `
                                <tr>
                                    <td>${item.period}</td>
                                    ${report.statType === 'weekly' ? 
                                        `<td>${item.prevValue} ${metricConfig.unit}</td>
                                        <td>${item.currentValue} ${metricConfig.unit}</td>
                                        <td class="${item.change < 0 ? 'positive' : 'negative'}">${item.change} ${metricConfig.unit}</td>
                                        <td class="${item.changeRate < 0 ? 'positive' : 'negative'}">${item.changeRate}%</td>` : 
                                        `<td>${item.average} ${metricConfig.unit}</td>
                                        <td>${item.max} ${metricConfig.unit}</td>
                                        <td>${item.min} ${metricConfig.unit}</td>
                                        <td>${item.standardDeviation || 0}</td>
                                        <td>${item.range || 0} ${metricConfig.unit}</td>`
                                    }
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    resultsContainer.innerHTML = resultsHTML;
}

/**
 * 显示分析图表
 * @param {Object} report 分析报告
 * @param {string} metric 指标名称
 */
function displayAnalysisChart(report, metric) {
    const chartContainer = document.getElementById('analysisChart');
    if (!chartContainer) return;
    
    // 获取指标配置信息
    const metricConfig = healthMetricsConfig.find(config => config.key === metric) || {
        label: metric,
        unit: ''
    };
    
    // 销毁之前的图表实例
    if (analysisChart) {
        analysisChart.dispose();
        analysisChart = null;
    }
    
    // 准备图表数据
    const chartData = {
        dates: report.trendData.map(item => item.date),
        values: report.trendData.map(item => item.value)
    };
    
    // 初始化图表
    analysisChart = chartManager.createAnalysisChart(
        chartContainer, 
        chartData, 
        metricConfig.label, 
        metricConfig.unit
    );
}

/**
 * 获取时间范围文本
 * @param {string} timeRange 时间范围值
 * @returns {string} 时间范围文本
 */
function getTimeRangeText(timeRange) {
    const timeRangeMap = {
        'all': '全部时间',
        '3months': '近3个月',
        '6months': '近6个月',
        '1year': '近1年'
    };
    
    if (timeRange === 'custom') {
        const customStartDate = document.getElementById('customStartDate').value;
        const customEndDate = document.getElementById('customEndDate').value;
        if (customStartDate && customEndDate) {
            return `${customStartDate} 至 ${customEndDate}`;
        } else {
            return '自定义时间范围';
        }
    }
    
    return timeRangeMap[timeRange] || timeRange;
}

/**
 * 获取统计类型文本
 * @param {string} statType 统计类型值
 * @returns {string} 统计类型文本
 */
function getStatTypeText(statType) {
    const statTypeMap = {
        'monthly': '月度统计',
        'quarterly': '季度统计',
        'yearly': '年度统计',
        'weekly': '周平均变化率'
    };
    return statTypeMap[statType] || statType;
}

/**
 * 导出分析结果
 */
export function exportAnalysisResults() {
    const resultsContainer = document.getElementById('analysisResults');
    if (!resultsContainer || resultsContainer.innerHTML.trim() === '') {
        alert('暂无分析结果可导出');
        return;
    }
    
    // 这里可以添加导出为图片或PDF的功能
    // 类似于健康报告的导出功能
    alert('导出功能开发中');
}

// 暴露函数到全局
export default {
    openStatisticalAnalysisModal,
    closeStatisticalAnalysisModal,
    performAnalysis,
    exportAnalysisResults
};
