// 健康数据指标配置

/**
 * 健康数据指标配置
 * 包含所有健康指标的定义、标签、单位等信息
 */
export const healthMetricsConfig = [
    { key: 'date', label: '日期', unit: '', showChange: false },
    { key: 'weight', label: '体重', unit: '斤', showChange: true },
    { key: 'fatRate', label: '体脂率', unit: '%', showChange: true },
    { key: 'bmi', label: 'BMI', unit: '', showChange: true },
    { key: 'obesityDegree', label: '肥胖度', unit: '%', showChange: true },
    { key: 'fatMass', label: '脂肪重量', unit: '斤', showChange: true },
    { key: 'leanBodyMass', label: '瘦体重', unit: '斤', showChange: true },
    { key: 'bmr', label: '基础代谢率', unit: '大卡', showChange: true },
    { key: 'tdee', label: '每日总消耗', unit: '大卡', showChange: true },
    { key: 'muscleMass', label: '肌肉量', unit: 'kg', showChange: true },
    { key: 'waterRate', label: '水分率', unit: '%', showChange: true },
    { key: 'protein', label: '蛋白质', unit: '%', showChange: true },
    { key: 'boneMass', label: '骨量', unit: 'kg', showChange: true },
    { key: 'visceralFat', label: '内脏脂肪', unit: '', showChange: true },
    { key: 'muscleRate', label: '肌肉率', unit: '%', showChange: true },
    { key: 'waist', label: '腰围', unit: 'cm', showChange: true },
    { key: 'hip', label: '臀围', unit: 'cm', showChange: true },
    { key: 'systolic', label: '收缩压', unit: 'mmHg', showChange: true },
    { key: 'diastolic', label: '舒张压', unit: 'mmHg', showChange: true },
    { key: 'heartRate', label: '静息心率', unit: '次/分', showChange: true },
    { key: 'whr', label: '腰臀比', unit: '', showChange: true },
];
