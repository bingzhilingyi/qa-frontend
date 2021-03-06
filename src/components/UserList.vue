<style scoped>	
</style>

<template>
    <div>
        <Input v-model="searchValue" :placeholder="placeholder" size='large'>
            <Button slot="prepend" @click="gotoUserAdd" :style="{borderRight:'1px solid rgb(221, 222, 225)'}">点我添加新用户</Button>
            <Select v-model="searchType" slot="prepend" style="width: 150px">
                <Option value="account">账号或姓名</Option>
                <Option value="group">角色</Option>
            </Select>
            <Button slot="append" icon="ios-search" @click="searchUser"></Button>
        </Input>
        <br>
        <Table :columns="userColumn" :data="userData" :loading="isLoading" stripe border></Table>
        <br>
        <div style="float: right;">
            <Page :total="totalElements" :current="currentPage" :page-size="pageSize" @on-change="changePage" show-total show-elevator size="small"></Page>
        </div>
        <!-- 删除用户的提示框 -->
        <Modal v-model="showDeleteWarn" width="360">
            <p slot="header" style="color:#f60;text-align:center">
                <Icon type="information-circled"></Icon>
                <span>删除提醒</span>
            </p>
            <div style="text-align:center">
                <p>用户删除将无法恢复！</p>
                <p>您确定要删除该用户吗?</p>
            </div>
            <div slot="footer">
                <Button type="error" size="large" long  @click="remove(rowIndex)">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import servicePaths from '../router/path'
    import store from '../store/UserList-store'
    // 在单独构建的版本中辅助函数为 Vuex.mapState
    import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
	export default {
        store,
		data(){
			return {
                ...servicePaths(),
                searchValue: '', //查询条件
                userColumn : [
                    {
                        title: 'ID',
                        key: 'userId'
                    },
                    {
                        title: '账号',
                        key: 'userAccount'
                    },
                    {
                        title: '姓名',
                        key: 'userName'
                    },
                    {
                        title: '邮箱',
                        key: 'userEmail'
                    },
                    {
                        title: '电话',
                        key: 'userPhone'
                    },
                    {
                        title: 'ldap账号',
                        key: 'userLdap'
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 150,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.editUser(params.index)
                                        }
                                    }
                                }, '编辑'),
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            //显示确认删除窗口
                                            this.setShowDeleteWarn(true);
                                            //设置当前数据行
                                            this.setRowIndex(params.index);
                                        }
                                    }
                                }, '删除')
                            ])
                        }
                    }
                ],
                //表格内容定义
                userData: [],
			}
        },
        computed:{
            //vuex state map
			...mapState([
                'historyValue', //上一次查询条件
                'totalElements', //总条目数
                'currentPage', //当前页
                'pageSize', //每页大小
                'isLoading',  //是否正在查询
                'rowIndex', //正在操作的表格行数
                'placeholder' //输入框提示
            ]),
            //vuex getter map
			...mapGetters([
            ]),
            showDeleteWarn:{
                get () {
                    return this.$store.state.showDeleteWarn
                },
                set (value) {
                    this.$store.commit('setShowDeleteWarn', value)
                }
            },
            searchType:{
                get () {
                    return this.$store.state.searchType
                },
                set (value) {
                    this.$store.commit('setSearchType', value)
                }
            }
        },
		props:['token'],
        methods:{
            //vuex mutations map
            ...mapMutations([
                'setLoading', //设置是否在加载
                'setHistoryValue', //设置历史查询数据
                'setTotalElements', //设置总条目数
                'setCurrentPage', //设置当前页
                'setPageSize', //设置每页大小
                'setShowDeleteWarn', //设置是否显示删除框
                'setRowIndex'  //当前转中行
            ]),
            //查询方法
            searchUser(){
                //表格设置为加载中
                this.setLoading(true);
                this.$axios({
                    url:`${this.userServicePath}/user/findPagedByAccountOrName`,
                    method:'get',
                    params:{
                        account:this.searchValue, //查询条件
                        page:this.currentPage-1, //实际页从0开始，所以要-1
                        size:this.pageSize, //每页大小
                        searchType:this.searchType, //查询方式
                        token:this.token
                    }
                }).then((response)=>{
                    var data = response.data;
                    //返回success，登录成功
                    if(data.status==='success'){
                        //接收数据
                        this.userData = data.content;
                        //更新总条目
                        this.setTotalElements(data.totalElements)
                    }else{
                        this.$Notice.error({
                            title: '查询失败',
                            desc: data.message
                        });
                    }
                    //表格设置为未加载
                    this.setLoading(false);
                }).catch((err)=>{
                    this.$Notice.error({
                        title: '查询出现异常',
                        desc: ''
                    });
                    //表格设置为未加载
                    this.setLoading(false);
                })
            },
            //翻页方法
            changePage(p){
                this.setCurrentPage(p);
                this.searchUser();
            },
            //跳到用户编辑页
            editUser (index) {
                //触发切换菜单事件，把菜单切换到用户编辑
                this.$emit('changeMenu','userEdit');
                //获取userid
                var userid = this.userData[index].userId;
                //导航到用户编辑页，传需要编辑的userid
                this.$router.push({name:`userEdit`,params:{token:this.token,userId:userid}});
            },
            //删除用户
            remove (index) {
                var id = this.userData[index].userId;
                
                this.$axios({
                    url:`${this.userServicePath}/user/delete/${id}`,
                    method:'post',
                    data:this.$qs.stringify({
                        token:this.token,
                        _method: 'DELETE'
                    })
                }).then((response)=>{
                    let data = response.data;
                    //返回success，删除成功
                    if(data.status==='success'){
                        this.$Notice.success({
                            title: '删除成功',
                            desc: '用户已成功删除'
                        });
                        //总数减一
                        this.setTotalElements(this.totalElements-1);
                        //把这行数据删掉
                        this.userData.splice(index, 1);
                    }else{
                        this.$Notice.error({
                            title: '删除失败',
                            desc: data.message
                        });
                    }
                    //隐藏删除提示窗口
                    this.setShowDeleteWarn(false)
                }).catch((err)=>{
                    this.$Notice.error({
                        title: '删除出现异常',
                        desc: ''
                    });
                    //隐藏删除提示窗口
                    this.setShowDeleteWarn(false)
                });
            },
            //跳转到添加新用户
            gotoUserAdd(){
                //触发切换菜单事件，把菜单切换到用户编辑
                this.$emit('changeMenu','userEdit');
                //导航到新增用户
                this.$router.push({name:`userEdit`,params:{token:this.token,userId:'new'}});
            }
        }
	}
</script>

