// 模态框管理主模块

// 导入各个模态框模块
import { openPersonalInfoModal, closePersonalInfoModal } from './personalInfoModal.js';
import { openHealthDataModal, closeHealthDataModal } from './healthDataModal.js';
import { openDataComparisonModal, closeDataComparisonModal, compareHealthData, initDateSelectors } from './dataComparisonModal.js';

// 导出所有模态框相关的函数
export {
    openPersonalInfoModal,
    closePersonalInfoModal,
    openHealthDataModal,
    closeHealthDataModal,
    openDataComparisonModal,
    closeDataComparisonModal,
    compareHealthData,
    initDateSelectors
};
