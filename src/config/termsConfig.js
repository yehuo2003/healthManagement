// 术语库配置文件

/**
 * 日期格式化函数
 * @param {string} dateStr 日期字符串
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
}

/**
 * 体重变化术语库
 */
export const weightChangeTerms = {
    significantLoss: [
        '成功减重', '取得了显著的减重效果', '减重成效明显', '减重表现出色'
    ],
    slightLoss: [
        '体重略有下降', '体重呈现下降趋势', '减重进展平稳', '体重缓慢下降'
    ],
    significantGain: [
        '体重有所增加', '体重呈现上升趋势', '体重有所上涨', '体重上升明显'
    ],
    slightGain: [
        '体重略有上升', '体重小幅增加', '体重缓慢上升', '体重稍有增加'
    ],
    stable: [
        '体重保持稳定', '体重变化不大', '体重维持在稳定水平', '体重基本不变'
    ]
};

/**
 * 体脂率变化术语库
 */
export const fatRateTerms = {
    significantLoss: [
        '体脂率明显下降', '体脂率降低显著', '体脂率减少明显', '体脂率下降较快'
    ],
    slightLoss: [
        '体脂率略有下降', '体脂率缓慢降低', '体脂率呈现下降趋势', '体脂率小幅减少'
    ],
    significantGain: [
        '体脂率有所上升', '体脂率呈现上升趋势', '体脂率增加明显', '体脂率上升较快'
    ],
    slightGain: [
        '体脂率略有上升', '体脂率小幅增加', '体脂率缓慢上升', '体脂率稍有增加'
    ],
    stable: [
        '体脂率保持稳定', '体脂率变化不大', '体脂率维持在稳定水平', '体脂率基本不变'
    ]
};

/**
 * 趋势术语库
 */
export const trendTerms = {
    accelerating: [
        '减重速度加快', '减重趋势明显增强', '减重势头良好', '减重效果进一步提升'
    ],
    decelerating: [
        '减重速度放缓', '减重趋势有所减弱', '减重进展趋于平稳', '减重效果逐渐稳定'
    ],
    stable: [
        '减重过程保持稳定', '减重趋势平稳', '减重进展持续稳定', '减重效果维持稳定'
    ]
};
