// 健康目标管理工具函数

/**
 * 计算健康目标的进度
 * @param {Object} goal 健康目标对象
 * @param {Array} rawData 原始健康数据
 * @param {Object} userInfo 用户信息
 * @returns {number} 目标完成进度百分比
 */
export function calculateGoalProgress(goal, rawData, userInfo) {
    // 获取最新的健康数据
    if (rawData.length === 0) return 0;
    
    const latestData = [...rawData].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    let currentValue = latestData[goal.metricType];
    
    // 如果是BMI，需要计算
    if (goal.metricType === 'bmi' && !currentValue && userInfo.height) {
        currentValue = calculateBMI(latestData.weight, userInfo.height);
    }
    
    if (!currentValue) return 0;
    
    const initialValue = goal.initialValue;
    const targetValue = goal.targetValue;
    
    let progress = 0;
    if (targetValue < initialValue) {
        // 目标值小于初始值（如减重）
        progress = Math.max(0, Math.min(100, ((initialValue - currentValue) / (initialValue - targetValue)) * 100));
    } else {
        // 目标值大于初始值（如增加肌肉量）
        progress = Math.max(0, Math.min(100, ((currentValue - initialValue) / (targetValue - initialValue)) * 100));
    }
    
    return progress;
}

/**
 * 更新健康目标的进度和状态
 * @param {Object} goal 健康目标对象
 * @param {Array} rawData 原始健康数据
 * @param {Object} userInfo 用户信息
 */
export function updateGoalProgress(goal, rawData, userInfo) {
    const progress = calculateGoalProgress(goal, rawData, userInfo);
    goal.progress = progress;
    goal.currentValue = getLatestMetricValue(goal.metricType, rawData, userInfo);
    
    // 更新状态
    if (progress >= 100) {
        goal.status = 'completed';
    } else if (new Date(goal.targetDate) < new Date()) {
        goal.status = 'failed';
    } else {
        goal.status = 'in_progress';
    }
}

/**
 * 获取最新的健康指标值
 * @param {string} metricType 指标类型
 * @param {Array} rawData 原始健康数据
 * @param {Object} userInfo 用户信息
 * @returns {number|null} 最新的指标值
 */
export function getLatestMetricValue(metricType, rawData, userInfo) {
    if (rawData.length === 0) return null;
    
    const latestData = [...rawData].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    let value = latestData[metricType];
    
    // 如果是BMI，需要计算
    if (metricType === 'bmi' && !value && userInfo.height) {
        value = calculateBMI(latestData.weight, userInfo.height);
    }
    
    return value;
}

/**
 * 添加健康目标
 * @param {Array} rawData 原始健康数据
 * @param {Array} healthGoals 健康目标数组
 * @param {Object} userInfo 用户信息
 * @param {Function} saveHealthGoals 保存健康目标的函数
 * @param {Function} updateGoalList 更新目标列表的函数
 */
export function addHealthGoal(rawData, healthGoals, userInfo, saveHealthGoals, updateGoalList) {
    const metricType = document.getElementById('goalMetricType').value;
    const targetValue = parseFloat(document.getElementById('goalTargetValue').value);
    const targetDate = document.getElementById('goalTargetDate').value;
    
    if (!metricType || isNaN(targetValue) || !targetDate) {
        alert('请填写完整的目标信息');
        return;
    }
    
    // 获取当前值作为初始值
    const initialValue = getLatestMetricValue(metricType, rawData, userInfo);
    if (!initialValue) {
        alert('暂无健康数据，请先录入健康数据');
        return;
    }
    
    // 验证目标值合理性
    if (metricType === 'weight' || metricType === 'fatRate' || metricType === 'waist') {
        if (targetValue >= initialValue) {
            if (!confirm('目标值大于当前值，确定要设置这个目标吗？')) {
                return;
            }
        }
    }
    
    const newGoal = {
        id: 'goal-' + Date.now(),
        metricType: metricType,
        targetValue: targetValue,
        currentValue: initialValue,
        initialValue: initialValue,
        targetDate: targetDate,
        createdAt: new Date().toISOString().split('T')[0],
        progress: 0,
        status: 'in_progress'
    };
    
    // 计算初始进度
    updateGoalProgress(newGoal, rawData, userInfo);
    
    healthGoals.push(newGoal);
    saveHealthGoals();
    updateGoalList();
    
    // 重置表单
    document.getElementById('goalTargetValue').value = '';
    document.getElementById('goalTargetDate').value = '';
    
    alert('目标设置成功！');
}

/**
 * 更新健康目标
 * @param {string} goalId 目标ID
 */
export function updateHealthGoal(goalId) {
    // 这里可以实现编辑目标的功能
    alert('编辑功能待实现');
}

/**
 * 删除健康目标
 * @param {string} goalId 目标ID
 * @param {Array} healthGoals 健康目标数组
 * @param {Function} saveHealthGoals 保存健康目标的函数
 * @param {Function} updateGoalList 更新目标列表的函数
 */
export function deleteHealthGoal(goalId, healthGoals, saveHealthGoals, updateGoalList) {
    if (confirm('确定要删除这个目标吗？')) {
        healthGoals = healthGoals.filter(goal => goal.id !== goalId);
        saveHealthGoals();
        updateGoalList();
        alert('目标删除成功！');
    }
}

/**
 * 更新目标列表显示
 * @param {Array} healthGoals 健康目标数组
 * @param {Array} rawData 原始健康数据
 * @param {Object} userInfo 用户信息
 * @param {Function} saveHealthGoals 保存健康目标的函数
 */
export function updateGoalList(healthGoals, rawData, userInfo, saveHealthGoals) {
    const goalListContainer = document.getElementById('goalList');
    
    if (healthGoals.length === 0) {
        goalListContainer.innerHTML = '<div style="text-align: center; color: #7f8c8d; padding: 20px;">暂无设置的目标</div>';
        return;
    }
    
    // 更新所有目标的进度
    healthGoals.forEach(goal => updateGoalProgress(goal, rawData, userInfo));
    saveHealthGoals();
    
    let html = '';
    healthGoals.forEach(goal => {
        // 获取指标名称
        const metricNames = {
            'weight': '体重',
            'fatRate': '体脂率',
            'bmi': 'BMI',
            'waist': '腰围',
            'muscleMass': '肌肉量'
        };
        
        const metricName = metricNames[goal.metricType] || goal.metricType;
        const unit = goal.metricType === 'weight' ? '斤' : 
                     goal.metricType === 'fatRate' ? '%' : 
                     goal.metricType === 'waist' ? 'cm' : 
                     goal.metricType === 'muscleMass' ? 'kg' : '';
        
        // 获取状态颜色
        let statusColor = '#3498db'; // 进行中
        if (goal.status === 'completed') {
            statusColor = '#27ae60'; // 已完成
        } else if (goal.status === 'failed') {
            statusColor = '#e74c3c'; // 已失败
        }
        
        // 格式化日期
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
        };
        
        html += `
            <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 15px; border-left: 4px solid ${statusColor};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <div>
                        <h5 style="margin: 0; color: #2c3e50;">${metricName}目标</h5>
                        <p style="margin: 5px 0; color: #7f8c8d;">从 ${goal.initialValue}${unit} 到 ${goal.targetValue}${unit}</p>
                        <p style="margin: 5px 0; color: #7f8c8d;">目标日期：${formatDate(goal.targetDate)}</p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="updateHealthGoal('${goal.id}')" style="padding: 5px 10px; background: #f39c12; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">编辑</button>
                        <button onclick="deleteHealthGoal('${goal.id}')" style="padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">删除</button>
                    </div>
                </div>
                <div style="margin-top: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="font-size: 14px; color: #7f8c8d;">完成进度</span>
                        <span style="font-size: 14px; font-weight: bold; color: ${statusColor};">${goal.progress.toFixed(1)}%</span>
                    </div>
                    <div style="height: 10px; background: #ecf0f1; border-radius: 5px; overflow: hidden;">
                        <div style="height: 100%; width: ${goal.progress}%; background: ${statusColor}; border-radius: 5px; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                <div style="margin-top: 10px; font-size: 14px;">
                    <span style="padding: 3px 8px; border-radius: 12px; background: ${statusColor}; color: white;">
                        ${getGoalStatusText(goal.status)}
                    </span>
                </div>
            </div>
        `;
    });
    
    goalListContainer.innerHTML = html;
}

/**
 * 获取目标状态文本
 * @param {string} status 状态值
 * @returns {string} 状态文本
 */
export function getGoalStatusText(status) {
    switch (status) {
        case 'completed': return '已完成';
        case 'failed': return '已失败';
        case 'in_progress': return '进行中';
        default: return '未知';
    }
}

/**
 * 计算BMI
 * @param {number} weight 体重（斤）
 * @param {number} height 身高（厘米）
 * @returns {string|null} BMI值
 */
function calculateBMI(weight, height) {
    if (!weight || !height) return null;
    const weightKg = weight / 2; // 转换为千克
    const heightM = height / 100; // 转换为米
    return (weightKg / (heightM * heightM)).toFixed(1);
}
