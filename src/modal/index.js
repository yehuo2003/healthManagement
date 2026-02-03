/*
 * @Author: LinZhuMing
 * @Date: 2026-01-31 14:49:58
 * @LastEditors: LinZhuMing
 * @LastEditTime: 2026-02-03 14:47:19
 * @FilePath: \healthManagement\src\modal\index.js
 * @Description: 
 * 
 */
// 模态框管理主模块

// 导入各个模态框模块
import { openPersonalInfoModal, closePersonalInfoModal } from './personalInfoModal.js';
import { openHealthDataModal, closeHealthDataModal } from './healthDataModal.js';
import { openDataComparisonModal, closeDataComparisonModal, compareHealthData, initDateSelectors } from './dataComparisonModal.js';
import { openStatisticalAnalysisModal, closeStatisticalAnalysisModal, performAnalysis, exportAnalysisResults } from './statisticalAnalysisModal.js';
import { createHealthTrendModal, showHealthTrendModal } from './healthTrendModal.js';

// 导出所有模态框相关的函数
export {
    openPersonalInfoModal,
    closePersonalInfoModal,
    openHealthDataModal,
    closeHealthDataModal,
    openDataComparisonModal,
    closeDataComparisonModal,
    compareHealthData,
    initDateSelectors,
    openStatisticalAnalysisModal,
    closeStatisticalAnalysisModal,
    performAnalysis,
    exportAnalysisResults,
    createHealthTrendModal,
    showHealthTrendModal
};
