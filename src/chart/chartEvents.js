/*
 * @Author: LinZhuMing
 * @Date: 2026-01-31 14:31:14
 * @LastEditors: LinZhuMing
 * @LastEditTime: 2026-01-31 15:58:13
 * @FilePath: \healthManagement\src\chart\chartEvents.js
 * @Description: 
 * 
 */
// 图表事件处理模块

/**
 * 添加图表点击事件
 * @param {Object} myChart 图表实例
 * @param {Function} showDailyMetrics 显示每日健康数据的函数
 */
export function addChartClickEvent(myChart, showDailyMetrics, rawData) {
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
    
    // 添加DOM点击事件作为备选方案
    const chartDom = myChart.getDom();
    if (chartDom) {
        // 先移除之前可能存在的点击事件
        chartDom.removeEventListener('click', handleChartDomClick);
        
        // 定义点击事件处理函数
        function handleChartDomClick(e) {
            // 使用ECharts API从点击位置获取数据
            try {
                // 获取点击位置相对于图表容器的坐标
                const rect = chartDom.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // 使用ECharts的convertFromPixel方法获取数据坐标
                const pointInPixel = [x, y];
                const pointInGrid = myChart.convertFromPixel('grid', pointInPixel);
                
                // 获取对应的日期索引
                if (pointInGrid && pointInGrid[0] !== null && pointInGrid[0] !== undefined && rawData) {
                    const dataIndex = Math.round(pointInGrid[0]);
                    
                    // 确保索引在有效范围内
                    if (dataIndex >= 0 && dataIndex < rawData.length) {
                        const date = rawData[dataIndex].date;
                        showDailyMetrics(date);
                    }
                }
            } catch (error) {
                // 忽略错误，不影响用户体验
            }
        }
        
        // 添加DOM点击事件
        chartDom.addEventListener('click', handleChartDomClick);
    }
}

/**
 * 添加图表缩放事件
 * @param {Object} myChart 图表实例
 * @param {Function} updateMetrics 更新指标卡片的函数
 * @param {Function} updateHealthSummary 更新健康分析摘要的函数
 */
export function addChartZoomEvent(myChart, updateMetrics, updateHealthSummary) {
    if (!myChart) return;
    
    // 移除之前的dataZoom事件监听
    myChart.off('dataZoom');
    
    // 添加dataZoom事件监听，当用户调整数据缩放时更新所有相关内容
    myChart.on('dataZoom', function(params) {
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
export function addAllChartEvents(myChart, eventHandlers, rawData) {
    const {
        showDailyMetrics,
        updateTimeRange,
        updateMetrics,
        updateHealthSummary
    } = eventHandlers;
    
    addChartClickEvent(myChart, showDailyMetrics, rawData);
    addChartZoomEvent(myChart, updateTimeRange, updateMetrics, updateHealthSummary);
    addChartResizeEvent(myChart);
}
