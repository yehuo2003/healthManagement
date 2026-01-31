// 图表事件处理模块

/**
 * 添加图表点击事件
 * @param {Object} myChart 图表实例
 * @param {Function} showDailyMetrics 显示每日健康数据的函数
 */
export function addChartClickEvent(myChart, showDailyMetrics) {
    if (!myChart) return;
    
    // 移除之前的所有事件监听，确保没有冲突
    myChart.off('click');
    myChart.off('dataZoom');
    
    // 添加ECharts原生点击事件
    myChart.on('click', function(params) {
        // 确保params有name属性
        if (params && params.name) {
            const date = params.name;
            showDailyMetrics(date);
        }
    });
}

/**
 * 添加图表缩放事件
 * @param {Object} myChart 图表实例
 * @param {Function} updateTimeRange 更新时间范围的函数
 * @param {Function} updateMetrics 更新指标卡片的函数
 * @param {Function} updateHealthSummary 更新健康分析摘要的函数
 */
export function addChartZoomEvent(myChart, updateTimeRange, updateMetrics, updateHealthSummary) {
    if (!myChart) return;
    
    // 添加dataZoom事件监听，当用户调整数据缩放时更新所有相关内容
    myChart.on('dataZoom', function(params) {
        updateTimeRange();
        updateMetrics();
        updateHealthSummary();
    });
}

/**
 * 添加图表响应式事件
 * @param {Object} myChart 图表实例
 */
export function addChartResizeEvent(myChart) {
    // 响应式
    window.addEventListener('resize', function() {
        if (myChart) {
            myChart.resize();
        }
    });
}

/**
 * 添加所有图表事件
 * @param {Object} myChart 图表实例
 * @param {Object} eventHandlers 事件处理函数
 */
export function addAllChartEvents(myChart, eventHandlers) {
    const {
        showDailyMetrics,
        updateTimeRange,
        updateMetrics,
        updateHealthSummary
    } = eventHandlers;
    
    addChartClickEvent(myChart, showDailyMetrics);
    addChartZoomEvent(myChart, updateTimeRange, updateMetrics, updateHealthSummary);
    addChartResizeEvent(myChart);
}
