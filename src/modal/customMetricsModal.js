// 自定义指标管理模态框模块

import * as dataManager from '../data/index.js';

/**
 * 打开自定义指标管理模态框
 * @param {Function} toggleSettingsMenu 切换设置菜单的函数
 */
export function openCustomMetricsModal(toggleSettingsMenu) {
    // 先关闭设置菜单
    toggleSettingsMenu();
    document.getElementById('customMetricsModal').style.display = 'block';
    // 更新自定义指标列表
    updateCustomMetricsList();
}

/**
 * 关闭自定义指标管理模态框
 */
export function closeCustomMetricsModal() {
    document.getElementById('customMetricsModal').style.display = 'none';
    // 重置表单
    document.getElementById('customMetricForm').reset();
    document.getElementById('editMetricId').value = '';
}

/**
 * 更新自定义指标列表
 */
export function updateCustomMetricsList() {
    const customMetrics = dataManager.getCustomMetrics();
    const metricsList = document.getElementById('customMetricsList');
    
    if (metricsList) {
        if (customMetrics.length === 0) {
            metricsList.innerHTML = '<div class="empty-state">暂无自定义指标</div>';
        } else {
            metricsList.innerHTML = customMetrics.map(metric => `
                <div class="custom-metric-item">
                    <div class="metric-info">
                        <div class="metric-name">${metric.label}</div>
                        <div class="metric-unit">${metric.unit}</div>
                    </div>
                    <div class="metric-actions">
                        <button class="edit-btn" onclick="editCustomMetric('${metric.key}')">编辑</button>
                        <button class="delete-btn" onclick="deleteCustomMetric('${metric.key}')">删除</button>
                    </div>
                </div>
            `).join('');
        }
    }
}

/**
 * 添加或更新自定义指标
 * @param {Function} updateMetrics 更新指标卡片的函数
 * @param {Function} updateChart 更新图表的函数
 */
export function saveCustomMetric(updateMetrics, updateChart) {
    const metricId = document.getElementById('editMetricId').value;
    const label = document.getElementById('metricLabel').value;
    const unit = document.getElementById('metricUnit').value;
    const showChange = document.getElementById('metricShowChange').checked;
    const color = document.getElementById('metricColor').value;
    
    if (!label) {
        alert('请输入指标名称');
        return;
    }
    
    // 生成唯一标识符
    const key = metricId || `custom_${Date.now()}`;
    
    const customMetrics = dataManager.getCustomMetrics();
    
    if (metricId) {
        // 更新现有指标
        const index = customMetrics.findIndex(m => m.key === metricId);
        if (index !== -1) {
            customMetrics[index] = {
                key,
                label,
                unit,
                showChange,
                color
            };
        }
    } else {
        // 添加新指标
        customMetrics.push({
            key,
            label,
            unit,
            showChange,
            color
        });
    }
    
    // 保存自定义指标
    dataManager.saveCustomMetrics(customMetrics);
    
    // 更新指标列表
    updateCustomMetricsList();
    
    // 重置表单
    document.getElementById('customMetricForm').reset();
    document.getElementById('editMetricId').value = '';
    
    // 更新指标卡片和图表
    if (updateMetrics) updateMetrics();
    if (updateChart) updateChart();
    
    alert('自定义指标保存成功');
}

/**
 * 编辑自定义指标
 * @param {string} metricKey 指标键
 */
export function editCustomMetric(metricKey) {
    const customMetrics = dataManager.getCustomMetrics();
    const metric = customMetrics.find(m => m.key === metricKey);
    
    if (metric) {
        document.getElementById('editMetricId').value = metric.key;
        document.getElementById('metricLabel').value = metric.label;
        document.getElementById('metricUnit').value = metric.unit;
        document.getElementById('metricShowChange').checked = metric.showChange;
        document.getElementById('metricColor').value = metric.color;
    }
}

/**
 * 删除自定义指标
 * @param {string} metricKey 指标键
 * @param {Function} updateMetrics 更新指标卡片的函数
 * @param {Function} updateChart 更新图表的函数
 */
export function deleteCustomMetric(metricKey, updateMetrics, updateChart) {
    if (confirm('确定要删除这个自定义指标吗？')) {
        const customMetrics = dataManager.getCustomMetrics();
        const updatedMetrics = customMetrics.filter(m => m.key !== metricKey);
        
        // 保存更新后的自定义指标
        dataManager.saveCustomMetrics(updatedMetrics);
        
        // 更新指标列表
        updateCustomMetricsList();
        
        // 更新指标卡片和图表
        if (updateMetrics) updateMetrics();
        if (updateChart) updateChart();
        
        alert('自定义指标删除成功');
    }
}
