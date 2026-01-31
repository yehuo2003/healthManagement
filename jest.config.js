// Jest 配置文件
export default {
    // 启用 ES 模块支持
    transform: {
        '^.+\\.m?js$': 'babel-jest'
    },
    // 配置模块名称映射
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    // 配置测试文件扩展名
    testMatch: [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[tj]s?(x)'
    ],
    // 配置模块路径解析
    moduleDirectories: ['node_modules', 'src'],
    // 配置是否显示覆盖报告
    collectCoverage: false
};
