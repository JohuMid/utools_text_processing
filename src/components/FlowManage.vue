<template>
    <div>
        <el-table
                :data="processFlow"
                style="width: 100%">
            <el-table-column
                    prop="name"
                    label="流程列表"
            >
            </el-table-column>
            <el-table-column
                    label="加入超级面板"
            >
                <template slot-scope="scope">
                    <el-switch
                            v-model="scope.row.isAddPanel"
                            active-color="#13ce66"
                            inactive-color="#cccccc"
                            @change="changePanelActive($event,scope.row)"
                    >
                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column
                    label="操作模式"
            >
                <template slot-scope="scope">
                    <el-select size="mini" v-model="scope.row.operateMode" @change="changeOperateMode($event,scope.row)" placeholder="请选择操作模式">
                        <el-option
                                v-for="item in operateModeOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                        </el-option>
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column
                    label="流程函数"
            >
                <template slot-scope="scope">
                    {{scope.row.main}}
                </template>
            </el-table-column>
            <el-table-column
                    width="130px"
                    align="right">
                <template slot="header">
                    <el-button size="mini" @click="addProcessFlow()">添加流程</el-button>
                </template>
                <template slot-scope="scope">
                    <el-button size="mini"  icon="el-icon-edit" circle title="编辑流程"
                               @click="handleFlowEdit(scope.$index, scope.row)"
                    ></el-button>
                    <el-popconfirm
                            style="margin-left: 10px;"
                            title="删除后不可恢复，确定删除吗？"
                            @confirm="handleFlowDelete(scope.$index, scope.row)"
                    >
                        <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete" circle  title="删除流程"
                        ></el-button>
                    </el-popconfirm>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import Mixin from '../assets/mixin'
  export default {
    name: "FlowManage",
    mixins: [Mixin],
    data(){
      return{
        processFlow:[],
        operateModeOptions:[
          {label:'复制文本',value:'0'},
          {label:'替换文本',value:'1'},
        ]
      }
    },
    mounted() {
      if (this.$route.query.initPluginReady){
        this.initProcessFlow()
      }
      // eslint-disable-next-line no-undef
      utools.onPluginReady(() => {
        console.log('插件装配完成，已准备好')
        this.initProcessFlow()
      })
      // eslint-disable-next-line no-undef
      utools.onPluginEnter(({code, type, payload}) => {
        console.log('用户进入插件', code, type, payload)
        if (type === 'regex'){
          let processFlow = this.getDb('process_flow')
          this.$router.push({
            name: 'FlowEdit',
            query: {payload:payload,...processFlow.filter(value=>{if (value.id === code){return value}})[0]}
          })
        } else if (type === 'text') {
          this.initProcessFlow()
        }
      })
    },
    methods:{
      initProcessFlow(){
        console.log(this.getDb('process_flow'));
        if (!this.getDb('process_flow')){
          this.putDb({
            _id: "process_flow",
            data: [{id:'23435fdgs23455342',name:'测试流程',main:['replaceSpace','allUpper'],isAddPanel:false,operateMode:'0'}]
          })
        } else {
          this.fixData()
        }
        this.processFlow = this.getDb('process_flow')
      },
      fixData(){
        let newProcessFlow = this.getDb('process_flow')
        newProcessFlow.map((value,index)=>{
          if (!value.operateMode){
            newProcessFlow[index].operateMode = '0'
          }
        })
        this.putRevDb("process_flow",newProcessFlow)
      },
      changePanelActive(flag,row){
        if (flag){
          this.setFunc(row)
        } else {
          this.removeFunc(row)
        }
        let newProcessFlow = this.getDb('process_flow')
        newProcessFlow.map((value,index)=>{
          if (value.id === row.id){
            newProcessFlow[index].isAddPanel = flag
          }
        })
        this.putRevDb("process_flow",newProcessFlow)
      },
      changeOperateMode(flag,row){
        console.log(flag, row);
        let newProcessFlow = this.getDb('process_flow')
        newProcessFlow.map((value,index)=>{
          if (value.id === row.id){
            newProcessFlow[index].operateMode = flag
          }
        })
        this.putRevDb("process_flow",newProcessFlow)
      },
      addProcessFlow(){
        this.$router.push({
          name: 'FlowEdit'
        })
      },
      handleFlowEdit(index,row){
        this.$router.push({
          name: 'FlowEdit',
          query: row
        })
      },
      handleFlowDelete(index,row){
        this.processFlow.splice(index, 1)
        this.putRevDb("process_flow",this.processFlow)
        this.removeFunc(row)
      }
    }
  }
</script>

<style scoped>

</style>
