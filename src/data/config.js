const conf = {
    menu() {
        return [{
                key: 'userManager',
                iconType: 'android-contact',
                label: '权限管理',
                child: [
                    { key: 'userList', label: '用户管理' },
                    // { key: 'userEdit', label: '用户编辑' },
                    { key: 'groupList', label: '角色管理' },
                    // { key: 'groupEdit', label: '权限组编辑' },
                ]
            },
            {
                key: 'knowledgeManager',
                iconType: 'ios-keypad',
                label: '知识页管理',
                child: [
                    { key: 'tree', label: '知识页' },
                ]
            },
            {
                key: 'clientTest',
                iconType: 'bug',
                label: '客户端测试',
                child: [
                    { key: 'client', label: '客户端' },
                ]
            },
            {
                key: 'dataVisualization',
                iconType: 'podium',
                label: '数据可视化',
                child: [
                    { key: 'dataVisualization', label: '可视化' },
                ]
            },
            {
                key: 'report',
                iconType: 'podium',
                label: '报表',
                child: [
                    { key: 'NoResultReport', label: '无结果查询历史' },
                ]
            }
        ]
    }
}

export default conf;