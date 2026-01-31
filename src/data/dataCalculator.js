// 数据计算和衍生指标模块

/**
 * 计算BMI（体重指数）
 * @param {number} weight 体重（斤）
 * @param {number} height 身高（厘米）
 * @returns {string|null} BMI值，保留一位小数
 */
export function calculateBMI(weight, height) {
    if (!weight || !height) return null;
    const weightKg = weight / 2; // 转换为千克
    const heightM = height / 100; // 转换为米
    return (weightKg / (heightM * heightM)).toFixed(1);
}

/**
 * 计算基础代谢率(BMR) - 使用Mifflin-St Jeor公式
 * @param {number} weight 体重（斤）
 * @param {number} height 身高（厘米）
 * @param {number} age 年龄
 * @param {string} gender 性别
 * @returns {number|null} BMR值
 */
export function calculateBMR(weight, height, age, gender) {
    if (!weight || !height || !age || !gender) return null;
    const weightKg = weight / 2; // 转换为千克
    const heightCm = height; // 身高已经是厘米
    
    if (gender === 'male') {
        return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
        return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }
}

/**
 * 计算每日总能量消耗(TDEE) = BMR * 活动水平系数
 * @param {number} bmr 基础代谢率
 * @param {number} activityLevel 活动水平系数
 * @returns {number|null} TDEE值
 */
export function calculateTDEE(bmr, activityLevel) {
    if (!bmr || !activityLevel) return null;
    return Math.round(bmr * activityLevel);
}

/**
 * 计算腰臀比
 * @param {number} waist 腰围（厘米）
 * @param {number} hip 臀围（厘米）
 * @returns {string|null} 腰臀比，保留两位小数
 */
export function calculateWHR(waist, hip) {
    if (!waist || !hip) return null;
    return (waist / hip).toFixed(2);
}

/**
 * 计算瘦体重（去脂体重）
 * @param {number} weight 体重（斤）
 * @param {number} fatRate 体脂率（%）
 * @returns {string|null} 瘦体重，保留一位小数
 */
export function calculateLeanBodyMass(weight, fatRate) {
    if (!weight || !fatRate) return null;
    return (weight * (1 - fatRate / 100)).toFixed(1);
}

/**
 * 计算脂肪重量
 * @param {number} weight 体重（斤）
 * @param {number} fatRate 体脂率（%）
 * @returns {string|null} 脂肪重量，保留一位小数
 */
export function calculateFatMass(weight, fatRate) {
    if (!weight || !fatRate) return null;
    return (weight * (fatRate / 100)).toFixed(1);
}

/**
 * 计算肌肉率
 * @param {number} muscleMass 肌肉量（kg）
 * @param {number} weight 体重（斤）
 * @returns {string|null} 肌肉率，保留一位小数
 */
export function calculateMuscleRate(muscleMass, weight) {
    if (!muscleMass || !weight) return null;
    return ((muscleMass * 2 / weight) * 100).toFixed(1); // 转换为斤计算
}

/**
 * 计算理想体重
 * @param {number} height 身高（厘米）
 * @param {string} gender 性别
 * @returns {string|null} 理想体重，保留一位小数
 */
export function calculateIdealWeight(height, gender) {
    if (!height || !gender) return null;
    let idealWeightKg;
    if (gender === 'male') {
        idealWeightKg = (height - 80) * 0.7;
    } else {
        idealWeightKg = (height - 70) * 0.6;
    }
    return (idealWeightKg * 2).toFixed(1); // 转换为斤
}

/**
 * 计算肥胖度
 * @param {number} actualWeight 实际体重（斤）
 * @param {number} height 身高（厘米）
 * @param {string} gender 性别
 * @returns {string|null} 肥胖度，保留一位小数
 */
export function calculateObesityDegree(actualWeight, height, gender) {
    if (!actualWeight || !height || !gender) return null;
    
    // 计算理想体重
    const idealWeight = calculateIdealWeight(height, gender);
    if (!idealWeight) return null;
    
    // 计算肥胖度：(实际体重 - 理想体重) / 理想体重 * 100%
    const actualWeightNum = parseFloat(actualWeight);
    const idealWeightNum = parseFloat(idealWeight);
    
    if (idealWeightNum === 0) return null;
    
    const obesityDegree = ((actualWeightNum - idealWeightNum) / idealWeightNum) * 100;
    return obesityDegree.toFixed(1);
}

/**
 * 重新计算所有数据的衍生指标
 * @param {Array} rawData 原始数据
 * @param {Object} userInfo 用户信息
 * @returns {Array} 增强后的数据
 */
export function recalculateAllDerivedMetrics(rawData, userInfo) {
    // 遍历所有数据点，重新计算衍生指标
    return rawData.map(item => {
        const enhancedItem = { ...item };
        
        // 重新计算所有衍生指标
        enhancedItem.bmi = calculateBMI(enhancedItem.weight, userInfo.height);
        enhancedItem.bmr = calculateBMR(enhancedItem.weight, userInfo.height, userInfo.age, userInfo.gender);
        enhancedItem.bmr = enhancedItem.bmr ? Math.round(enhancedItem.bmr) : null;
        enhancedItem.whr = calculateWHR(enhancedItem.waist, enhancedItem.hip);
        enhancedItem.muscleRate = calculateMuscleRate(enhancedItem.muscleMass, enhancedItem.weight);
        enhancedItem.leanBodyMass = calculateLeanBodyMass(enhancedItem.weight, enhancedItem.fatRate);
        enhancedItem.fatMass = calculateFatMass(enhancedItem.weight, enhancedItem.fatRate);
        enhancedItem.tdee = calculateTDEE(enhancedItem.bmr, userInfo.activityLevel);
        // 添加肥胖度计算
        enhancedItem.obesityDegree = calculateObesityDegree(enhancedItem.weight, userInfo.height, userInfo.gender);
        
        return enhancedItem;
    });
}

/**
 * 计算缺失的衍生指标
 * @param {Object} dataItem 数据项
 * @param {Object} userInfo 用户信息
 * @returns {Object} 增强后的数据项
 */
export function calculateMissingMetrics(dataItem, userInfo) {
    const enhancedItem = { ...dataItem };
    
    // 计算BMI（如果缺失）
    if (!enhancedItem.bmi && userInfo.height) {
        enhancedItem.bmi = calculateBMI(enhancedItem.weight, userInfo.height);
    }
    
    // 计算BMR（如果缺失）
    if (!enhancedItem.bmr && userInfo.height && userInfo.age && userInfo.gender) {
        enhancedItem.bmr = calculateBMR(enhancedItem.weight, userInfo.height, userInfo.age, userInfo.gender);
        enhancedItem.bmr = enhancedItem.bmr ? Math.round(enhancedItem.bmr) : null;
    }
    
    // 计算TDEE（如果缺失）
    if (!enhancedItem.tdee && enhancedItem.bmr && userInfo.activityLevel) {
        enhancedItem.tdee = calculateTDEE(enhancedItem.bmr, userInfo.activityLevel);
    }
    
    // 计算腰臀比（如果缺失）
    if (!enhancedItem.whr && enhancedItem.waist && enhancedItem.hip) {
        enhancedItem.whr = calculateWHR(enhancedItem.waist, enhancedItem.hip);
    }
    
    // 计算肌肉率（如果缺失）
    if (!enhancedItem.muscleRate && enhancedItem.muscleMass && enhancedItem.weight) {
        enhancedItem.muscleRate = calculateMuscleRate(enhancedItem.muscleMass, enhancedItem.weight);
    }
    
    // 计算瘦体重（如果缺失）
    if (!enhancedItem.leanBodyMass && enhancedItem.weight && enhancedItem.fatRate) {
        enhancedItem.leanBodyMass = calculateLeanBodyMass(enhancedItem.weight, enhancedItem.fatRate);
    }
    
    // 计算脂肪重量（如果缺失）
    if (!enhancedItem.fatMass && enhancedItem.weight && enhancedItem.fatRate) {
        enhancedItem.fatMass = calculateFatMass(enhancedItem.weight, enhancedItem.fatRate);
    }
    
    // 计算肥胖度（如果缺失）
    if (!enhancedItem.obesityDegree && userInfo.height && userInfo.gender) {
        enhancedItem.obesityDegree = calculateObesityDegree(enhancedItem.weight, userInfo.height, userInfo.gender);
    }
    
    return enhancedItem;
}
