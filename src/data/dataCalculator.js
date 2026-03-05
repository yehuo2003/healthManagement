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

/**
 * 计算血压风险等级
 * @param {number} systolic 收缩压
 * @param {number} diastolic 舒张压
 * @returns {string} 血压风险等级
 */
export function calculateBloodPressureLevel(systolic, diastolic) {
    if (!systolic || !diastolic) return 'N/A';
    if (systolic < 120 && diastolic < 80) return '正常';
    if (systolic >= 120 && systolic <= 139 || diastolic >= 80 && diastolic <= 89) return '高血压前期';
    if (systolic >= 140 && systolic <= 159 || diastolic >= 90 && diastolic <= 99) return '高血压1级';
    return '高血压2级';
}

/**
 * 计算BMI风险等级
 * @param {number|string} bmi BMI值
 * @returns {string} BMI风险等级
 */
export function calculateBMILevel(bmi) {
    if (!bmi) return 'N/A';
    const bmiNum = parseFloat(bmi);
    if (bmiNum < 18.5) return '偏瘦';
    if (bmiNum >= 18.5 && bmiNum < 24) return '正常';
    if (bmiNum >= 24 && bmiNum < 28) return '超重';
    return '肥胖';
}

/**
 * 计算腰臀比风险等级
 * @param {number|string} whr 腰臀比
 * @param {string} gender 性别
 * @returns {string} 腰臀比风险等级
 */
export function calculateWHRLevel(whr, gender) {
    if (!whr || !gender) return 'N/A';
    const whrNum = parseFloat(whr);
    if (gender === 'male' && whrNum < 0.90 || gender === 'female' && whrNum < 0.85) return '正常';
    return '中心性肥胖';
}

/**
 * 计算内脏脂肪风险等级
 * @param {number} visceralFat 内脏脂肪等级
 * @returns {string} 内脏脂肪风险等级
 */
export function calculateVisceralFatLevel(visceralFat) {
    if (!visceralFat) return 'N/A';
    if (visceralFat < 10) return '正常';
    if (visceralFat >= 10 && visceralFat <= 14) return '偏高';
    return '肥胖';
}

/**
 * 计算体重风险等级
 * @param {number} weight 体重（斤）
 * @param {number} height 身高（厘米）
 * @param {string} gender 性别
 * @returns {string} 体重风险等级
 */
export function calculateWeightLevel(weight, height, gender) {
    if (!weight || !height || !gender) return 'N/A';
    
    // 计算BMI来判断体重是否正常
    const bmi = calculateBMI(weight, height);
    if (!bmi) return 'N/A';
    
    return calculateBMILevel(bmi);
}

/**
 * 计算体脂率风险等级
 * @param {number|string} fatRate 体脂率（%）
 * @param {string} gender 性别
 * @returns {string} 体脂率风险等级
 */
export function calculateFatRateLevel(fatRate, gender) {
    if (!fatRate || !gender) return 'N/A';
    
    const fatRateNum = parseFloat(fatRate);
    
    // 根据性别判断体脂率等级
    if (gender === 'male') {
        if (fatRateNum < 10) return '偏瘦';
        if (fatRateNum >= 10 && fatRateNum < 20) return '正常';
        if (fatRateNum >= 20 && fatRateNum < 25) return '超重';
        return '肥胖';
    } else {
        if (fatRateNum < 15) return '偏瘦';
        if (fatRateNum >= 15 && fatRateNum < 25) return '正常';
        if (fatRateNum >= 25 && fatRateNum < 30) return '超重';
        return '肥胖';
    }
}

/**
 * 计算肥胖度风险等级
 * @param {number|string} obesityDegree 肥胖度（%）
 * @returns {string} 肥胖度风险等级
 */
export function calculateObesityDegreeLevel(obesityDegree) {
    if (!obesityDegree) return 'N/A';
    
    const degreeNum = parseFloat(obesityDegree);
    
    if (degreeNum < -20.0) return '消瘦';
    if (degreeNum >= -20.0 && degreeNum < -10.0) return '偏瘦';
    if (degreeNum >= -10.0 && degreeNum <= 10.0) return '标准';
    if (degreeNum > 10.0 && degreeNum <= 20.0) return '偏胖';
    if (degreeNum > 20.0 && degreeNum <= 50.0) return '肥胖';
    return '重度';
}

/**
 * 计算蛋白质风险等级
 * @param {number|string} protein 蛋白质（%）
 * @returns {string} 蛋白质风险等级
 */
export function calculateProteinLevel(protein) {
    if (!protein) return 'N/A';
    
    const proteinNum = parseFloat(protein);
    
    if (proteinNum < 16.0) return '不足';
    if (proteinNum >= 16.0 && proteinNum <= 20.0) return '标准';
    return '优';
}

/**
 * 计算健康状态评分
 * @param {Object} dataItem 健康数据项
 * @param {Object} userInfo 用户信息
 * @returns {Object} 健康状态评分结果
 */
export function calculateHealthScore(dataItem, userInfo) {
    if (!dataItem) return { score: 0, level: 'N/A', breakdown: {} };
    
    // 各项指标的权重
    const weights = {
        bmi: 0.25,           // BMI权重最高
        bloodPressure: 0.20,  // 血压权重次之
        fatRate: 0.15,        // 体脂率
        visceralFat: 0.10,     // 内脏脂肪
        whr: 0.10,             // 腰臀比
        muscleRate: 0.05,      // 肌肉率
        protein: 0.05,         // 蛋白质
        obesityDegree: 0.10    // 肥胖度
    };
    
    // 初始化各项指标分数
    const scores = {
        bmi: 0,
        bloodPressure: 0,
        fatRate: 0,
        visceralFat: 0,
        whr: 0,
        muscleRate: 0,
        protein: 0,
        obesityDegree: 0
    };
    
    // 计算BMI分数
    if (dataItem.bmi) {
        const bmiLevel = calculateBMILevel(dataItem.bmi);
        scores.bmi = calculateLevelScore(bmiLevel);
    }
    
    // 计算血压分数
    if (dataItem.systolic && dataItem.diastolic) {
        const bpLevel = calculateBloodPressureLevel(dataItem.systolic, dataItem.diastolic);
        scores.bloodPressure = calculateLevelScore(bpLevel);
    }
    
    // 计算体脂率分数
    if (dataItem.fatRate && userInfo.gender) {
        const fatRateLevel = calculateFatRateLevel(dataItem.fatRate, userInfo.gender);
        scores.fatRate = calculateLevelScore(fatRateLevel);
    }
    
    // 计算内脏脂肪分数
    if (dataItem.visceralFat) {
        const visceralFatLevel = calculateVisceralFatLevel(dataItem.visceralFat);
        scores.visceralFat = calculateLevelScore(visceralFatLevel);
    }
    
    // 计算腰臀比分数
    if (dataItem.whr && userInfo.gender) {
        const whrLevel = calculateWHRLevel(dataItem.whr, userInfo.gender);
        scores.whr = calculateLevelScore(whrLevel);
    }
    
    // 计算肌肉率分数（简化计算，假设肌肉率在30-40%之间为正常）
    if (dataItem.muscleRate) {
        const muscleRateNum = parseFloat(dataItem.muscleRate);
        if (muscleRateNum >= 30 && muscleRateNum <= 40) {
            scores.muscleRate = 100;
        } else if (muscleRateNum >= 25 && muscleRateNum < 30 || muscleRateNum > 40 && muscleRateNum <= 45) {
            scores.muscleRate = 80;
        } else if (muscleRateNum >= 20 && muscleRateNum < 25 || muscleRateNum > 45 && muscleRateNum <= 50) {
            scores.muscleRate = 60;
        } else {
            scores.muscleRate = 40;
        }
    }
    
    // 计算蛋白质分数
    if (dataItem.protein) {
        const proteinLevel = calculateProteinLevel(dataItem.protein);
        scores.protein = calculateLevelScore(proteinLevel);
    }
    
    // 计算肥胖度分数
    if (dataItem.obesityDegree) {
        const obesityLevel = calculateObesityDegreeLevel(dataItem.obesityDegree);
        scores.obesityDegree = calculateLevelScore(obesityLevel);
    }
    
    // 计算加权平均分
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.keys(weights).forEach(key => {
        if (scores[key] > 0) {
            totalScore += scores[key] * weights[key];
            totalWeight += weights[key];
        }
    });
    
    // 处理所有指标都缺失的情况
    if (totalWeight === 0) {
        return { score: 0, level: 'N/A', breakdown: scores };
    }
    
    // 计算最终评分（0-100分）
    const finalScore = Math.round((totalScore / totalWeight));
    const healthLevel = calculateHealthStatusLevel(finalScore);
    
    return { score: finalScore, level: healthLevel, breakdown: scores };
}

/**
 * 根据风险等级计算分数
 * @param {string} level 风险等级
 * @returns {number} 分数（0-100）
 */
function calculateLevelScore(level) {
    switch (level) {
        case '正常':
        case '标准':
        case '优':
            return 100;
        case '高血压前期':
        case '偏瘦':
        case '偏高':
            return 80;
        case '高血压1级':
        case '超重':
        case '偏胖':
        case '不足':
            return 60;
        case '高血压2级':
        case '肥胖':
        case '中心性肥胖':
        case '消瘦':
            return 40;
        case '重度':
            return 20;
        default:
            return 0;
    }
}

/**
 * 计算健康状态等级
 * @param {number} score 健康评分
 * @returns {string} 健康状态等级
 */
export function calculateHealthStatusLevel(score) {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '一般';
    if (score >= 60) return '需改善';
    return '较差';
}
