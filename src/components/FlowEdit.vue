<template>
    <div class="flow-edit">
        <el-row style="margin-bottom: 20px;border-bottom: 1px solid rgba(184, 173, 173, 0.43)">
            <el-col :span="16">
                <el-form label-position="left" label-width="80px">
                    <el-form-item label="流程名" required>
                        <el-input size="mini" v-model="processFlowName"></el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="8" align="center" style="margin-top: 6px;">
                <el-button v-show="!isEditFlow" type="primary" size="mini" @click="addFlowOrEdit(true)" round>添加流程</el-button>
                <el-button v-show="isEditFlow" type="primary" size="mini" @click="addFlowOrEdit(false)" round>修改流程</el-button>
                <el-button size="mini" @click="backFlow" round>返回列表</el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="8">
                <div class="process-node">
                        <el-table
                                :data="processNode"
                                style="width: 100%">
                            <el-table-column
                                    prop="name"
                                    label="操作列表"
                            >
                                <template slot-scope="scope">
                                    <span :title="scope.row.describe">{{scope.row.name}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    width="130px"
                                    align="right">
                                <template slot="header">
                                    <el-button type="text" size="mini" @click="addProcessToFlow">添加操作</el-button>
                                </template>
                                <template slot-scope="scope">
                                    <el-button size="mini"  icon="el-icon-edit" circle  title="编辑操作"
                                               @click="handleEdit(scope.$index, scope.row)"
                                    ></el-button>
                                    <el-button size="mini" type="primary" icon="el-icon-plus" circle title="添加操作到流程"
                                               @click="handleAdd(scope.$index, scope.row)"
                                    ></el-button>
                                    <el-popconfirm
                                            style="margin-left: 10px;"
                                            title="删除后不可恢复，确定删除吗？"
                                            @confirm="handleDelete(scope.$index, scope.row)"
                                    >
                                        <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete" circle title="删除操作"
                                        ></el-button>
                                    </el-popconfirm>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
            </el-col>
            <el-col :span="8">
                <div class="process-flow">
                    <el-timeline :reverse="false">
                        <el-timeline-item timestamp="要处理的文本">输入文本</el-timeline-item>
                        <el-timeline-item
                                v-for="(item,index) in processFlowTime"
                                :key="index"
                        >
                            {{item.name +'（步骤'+ (index+1) + '）'}}
                            <el-link type="danger" @click="deleteFlowNode(index)">删除</el-link>
                        </el-timeline-item>
                    </el-timeline>
                </div>
            </el-col>
            <el-col :span="8">
                <div class="process-text">
                    <el-form label-position="top" ref="form" label-width="80px">
                        <el-form-item label="文本输入">
                            <el-input
                                    ref="original_text"
                                    type="textarea"
                                    placeholder="请输入内容"
                                    v-model="originalStr"
                                    @input="runCode"
                            >
                            </el-input>
                        </el-form-item>
                        <el-form-item label="文本输出">
                            <el-button type="text" style="position: absolute;right: 0;top: -40px;z-index: 9" @click="copyOutput">复制</el-button>
                            <el-input
                                    :disabled="true"
                                    type="textarea"
                                    placeholder="输出内容"
                                    v-model="outputStr"
                            >
                            </el-input>
                        </el-form-item>
                        <el-form-item label="匹配模式">
                            <el-tooltip effect="light" placement="top">
                                <div slot="content">匹配模式用于限制流程的触发条件，符合条件的文本才会展示此流程。<br/>注意: 正则表达式存如果在斜杠 "\" 需要多加一个，"\\"。<br/>注意：“任意匹配的正则” 会被 uTools 忽视，如果要任意匹配直接选择任意匹配即可。<br/>PS：正则匹配可以去 <span style="font-weight: bold">正则编辑器</span> 插件调试好正则表达式后填入。</div>
                                <i class="el-icon-info" style="position: absolute;left: 60px;top: -37px;z-index: 9"></i>
                            </el-tooltip>
                            <el-select v-model="matchingPattern" placeholder="请选择匹配模式" size="mini" style="width: 100%;">
                                <el-option
                                        v-for="item in matchingOptions"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                                </el-option>
                            </el-select>
                            <el-input
                                    v-show="matchingPattern === 'regex'"
                                    size="mini"
                                    placeholder="输入正则表达式"
                                    v-model="regexStr"
                            >
                            </el-input>
                        </el-form-item>
                    </el-form>
                    <span style="color: #F56C6C">{{errMsg}}</span>
                </div>
            </el-col>
        </el-row>

        <el-dialog
                :title="codeTitle + '（编写代码逻辑对输入参数 middleStr 进行操作并 return 出结果即可）'"
                :visible.sync="codeDialogVisible"
                :before-close="handleClose"
                width="100%"
        >
            <el-form :model="processForm" :rules="processRules" ref="processForm" label-width="100px">
                <div v-show="!isProcessEdit">
                    <el-form-item label="操作名称" prop="processName">
                        <el-input size="mini" v-model="processForm.processName"></el-input>
                    </el-form-item>
                    <el-form-item label="操作描述" prop="processDescribe">
                        <el-input size="mini" v-model="processForm.processDescribe"></el-input>
                    </el-form-item>
                    <el-form-item label="操作主函数" prop="processMain">
                        <el-input size="mini" v-model="processForm.processMain"></el-input>
                    </el-form-item>
                </div>
                <codemirror
                        ref="mycode"
                        :value="curCode"
                        :options="cmOptions"
                        @input="onCmCodeChange"
                        class="code">
                </codemirror>
                <p style="color: #F56C6C">{{testErrMsg}}</p>
                <el-button type="primary" size="mini" v-show="isProcessEdit" @click="saveCode">保 存</el-button>
                <el-button type="primary" size="mini" v-show="!isProcessEdit" @click="addProcess('processForm')">添 加</el-button>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
  import { codemirror } from 'vue-codemirror'
  import "codemirror/theme/ambiance.css";
  import { v4 as uuidv4 } from 'uuid';
  import Mixin from "../assets/mixin";
  require("codemirror/mode/javascript/javascript");
  export default {
    name: "FlowEdit",
    mixins: [Mixin],
    data(){
      const englishReg = /[^a-zA-Z]+/
      let validatePass = (rule, value, callback) => {
        if (value === ''){
          callback(new Error('请输入全英文的函数名'));
        } else if (englishReg.test(value)){
          callback(new Error('请输入全英文的函数名'));
        } else {
          callback();
        }
      }
      return{
        processFlowName:'',
        processNode:[],
        processFlowTime: [],
        originalStr:'johu    test    plugin   12345',
        outputStr:'',
        regexStr:'//',
        matchingPattern: 'over',
        matchingOptions:[
          {label:'任意匹配', value: 'over'},
          {label:'正则匹配', value: 'regex'}
        ],
        codeDialogVisible: false,
        cmOptions:{
          value:'',
          mode:"text/javascript",
          theme: "ambiance",
          readOnly:false,
        },
        curCode:'',
        codeTitle:'',
        errMsg:'',
        testErrMsg:'',
        processForm:{
          processName:'',
          processDescribe:'',
          processMain:''
        },
        currentEdit:0,
        processRules:{
          processName:[
            { required: true, message: '请输入操作名称', trigger: 'blur' },
            { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
          ],
          processDescribe:[
            { required: true, message: '请输入操作描述', trigger: 'blur' },
            { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
          ],
          processMain:[
            { required: true, validator: validatePass, trigger: 'blur' },
          ]
        },
        isProcessEdit: true,
        isEditFlow: false,
        processFlowId: '',
        dealSuccess: false
      }
    },
    watch:{
      originalStr:{
        handler(){
          if (this.processFlowTime.length === 0){
            this.outputStr = this.originalStr
          }
        }
      }
    },
    mounted() {
      if (!this.getDb('process_node')){
          this.putDb({
            _id: "process_node",
            data: [
              {name:'去除空格',main:'replaceSpace',code:'return middleStr.replace(/ /g, \'\')',describe:'去除文本中的所有空格'},
              {name:'去除换行',main:'replaceWrap',code:'return middleStr.replace(/\\n/g,\'\')',describe:'去除文本中的所有换行'},
              {name:'全大写',main:'allUpper',code:'return middleStr.toLocaleUpperCase()',describe:'文本中所有英文字母全大写'},
              {name:'文本反转',main:'reverse',code:'return middleStr.split(\'\').reverse().join(\'\')',describe:'文本中所有字符反转'},
            ]
          })
        }
        this.processNode = this.getDb('process_node')
        this.outputStr = this.originalStr
      console.log(this.$route.query);
      if (this.$route.query.name){
          this.processFlowName = this.$route.query.name
          this.processFlowId = this.$route.query.id
          if (this.$route.query.matchMode === 'over' || !this.$route.query.matchMode) {
            this.matchingPattern = 'over'
          } else{
            this.matchingPattern = 'regex'
            this.regexStr = this.$route.query.matchMode
          }
          this.isEditFlow = true
          let mainArr = this.$route.query.main
          let mainLen = mainArr.length
          let processNodeLen = this.processNode.length
          for (let i=0;i<mainLen;i++){
            for (let j =0;j<processNodeLen;j++){
              if (mainArr[i] === this.processNode[j].main){
                this.processFlowTime.push(this.processNode[j])
              }
            }
          }
          if (this.$route.query.payload){
            this.originalStr = this.$route.query.payload
          }
          this.runCode()
          if (this.$route.query.payload){
            if (this.dealSuccess){
              this.hideWindow()
              this.chooseMode()
              this.showNote('文本处理完成')
              this.exitPlugin()
            } else {
              this.showNote('文本处理流程有误')
            }
          }
        } else {
          this.isEditFlow = false
        }
      // eslint-disable-next-line no-undef
      utools.onPluginOut(() => {
        this.$router.push({
          name: 'FlowManage'
        })
      })
    },
    components:{
      codemirror
    },
    methods:{
      chooseMode(){
        this.copyOutput()
        if (this.$route.query.operateMode === '1'){
          this.utoolsPaste()
        }
      },
      handleAdd(index){
        if (this.processFlowTime.length < 10){
          this.processFlowTime.push(this.processNode[index])
        } else {
          this.$message({
            message: '只能加10个操作，不能再多了',
            type: 'warning'
          })
        }
        this.runCode()
      },
      handleDelete(index,row){
        console.log(index, row);
        this.processNode.splice(index, 1)
        this.saveProcessNode()
      },
      addProcessToFlow(){
        this.isProcessEdit = false
        this.codeDialogVisible = true
        this.codeTitle = '添加操作'
        this.curCode = 'return '
      },
      handleEdit(index,row){
        this.currentEdit = index
        this.isProcessEdit = true
        this.codeDialogVisible = true
        this.codeTitle = row.name
        this.curCode = this.processNode[index].code
      },
      deleteFlowNode(index){
        this.processFlowTime.splice(index,1)
        this.runCode()
        if (this.processFlowTime.length === 0){
          this.outputStr = this.originalStr
        }
      },
      copyOutput(){
        this.utoolsCopy(this.outputStr)
        this.$message({
          message: '复制成功',
          type: 'success'
        })
      },
      addFlowOrEdit(flag){
        if (this.processFlowName === '') {
          this.$message({
            message: '请填写流程名',
            type: 'warning'
          })
        }else if (this.processFlowTime.length === 0){
          this.$message({
            message: '至少添加一个操作',
            type: 'warning'
          })
        } else if (!this.dealSuccess){
          this.$message({
            message: '流程处理错误，查看错误信息并修改',
            type: 'warning'
          })
        } else if (this.matchingPattern === 'regex' && (this.regexStr.length === 0 || this.regexStr === 'over')){
          this.$message({
            message: '填写正确的正则表达式',
            type: 'warning'
          })
        } else {
          let processNodeArr = []
          this.processFlowTime.map((value)=>{
            processNodeArr.push(value.main)
          })
          let newProcessFlow = this.getDb('process_flow')
          if (flag){
            // 添加流程
            newProcessFlow.push({
              id: uuidv4(),
              name: this.processFlowName,
              main: processNodeArr,
              isAddPanel: false,
              operateMode: '0',
              matchMode: this.matchingPattern === 'over' ? 'over' : this.regexStr
            })
            this.putRevDb("process_flow",newProcessFlow)
            this.$message({
              message: '添加流程成功',
              type: 'success'
            })
          } else {
            // 编辑流程
            newProcessFlow = newProcessFlow.filter(item => item.id!==this.processFlowId)
            newProcessFlow.push({
              id: this.$route.query.id,
              name: this.processFlowName,
              main: processNodeArr,
              isAddPanel: this.$route.query.isAddPanel,
              operateMode: this.$route.query.operateMode,
              matchMode: this.matchingPattern === 'over' ? 'over' : this.regexStr
            })
            this.putRevDb("process_flow",newProcessFlow)
            if (this.$route.query.isAddPanel){
              this.removeFunc(this.$route.query)
              if (this.matchingPattern === 'over') {
                this.setFunc({
                  id:this.$route.query.id,
                  name:this.processFlowName
                })
              } else {
                this.setRegexFunc({
                  id:this.$route.query.id,
                  name:this.processFlowName,
                  matchMode:this.regexStr
                })
              }

            }
            this.$message({
              message: '编辑流程成功',
              type: 'success'
            })
          }
          this.$router.push({
            name: 'FlowManage',
            query:{initPluginReady:true}
          })
        }
      },
      backFlow(){
        this.$router.push({
          name: 'FlowManage',
          query:{initPluginReady:true}
        })
      },
      handleClose(done){
        this.processForm.processName=''
        this.processForm.processDescribe=''
        this.processForm.processMain=''
        this.testErrMsg = ''
        this.curCode = ''
        if (done){
          done();
        }
      },
      saveCode(){
        let testCode = `middleStr = `+this.processNode[this.currentEdit].main + `(middleStr); function ` + this.processNode[this.currentEdit].main + `(middleStr){`+this.curCode+`};return middleStr;`
        if (this.testCode(testCode)){
          this.$message({
            message: '修改成功',
            type: 'success'
          })
          this.processNode[this.currentEdit].code = this.curCode
          this.processFlowTime.map((value)=>{
            if (value.main === this.processNode[this.currentEdit].main){
              value.code = this.curCode
            }
          })
          this.runCode()
          this.saveProcessNode()
          this.handleClose()
        } else {
          this.$message({
            message: '代码测试错误，请查看报错信息并修改',
            type: 'error'
          })
        }
      },
      addProcess(formName){
        this.$refs[formName].validate((valid) => {
          if (valid) {
            let testCode = `middleStr = `+this.processForm.processMain + `(middleStr); function ` + this.processForm.processMain + `(middleStr){`+this.curCode+`};return middleStr;`
            const data = this.getDb("process_node")
            let count = 0
            data.map((value)=>{
              if (this.processForm.processMain === value.main){
                count++
              }
            })
            if (count !== 0){
              this.$message({
                message: '操作主函数名不能重复!',
                type: 'warning'
              })
            } else {
              if (this.testCode(testCode)){
                this.$message({
                  message: '添加成功',
                  type: 'success'
                })
                this.processNode.push({
                  name:this.processForm.processName,
                  describe:this.processForm.processDescribe,
                  main:this.processForm.processMain,
                  code: this.curCode
                })
                this.saveProcessNode()
                this.handleClose()
              } else {
                this.$message({
                  message: '代码测试错误，请查看报错信息并修改',
                  type: 'error'
                })
              }
            }
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      saveProcessNode(){
        this.putRevDb("process_node",this.processNode)
        this.codeDialogVisible = false
      },
      onCmCodeChange(newCode){
        this.curCode = newCode
      },
      testCode(testCode){
        console.log(testCode);
        this.testErrMsg = ''
        try {
          const result = new Function('middleStr', testCode);
          result('{"author":"johu"}')
          return true
        } catch (e) {
          this.testErrMsg = e.toString()
          console.log(e.toString());
          return false
        }
      },
      runCode(){
        this.errMsg = ''
        this.dealSuccess = false
        let code = ''
        this.processFlowTime.map((value,index)=>{
          code += `middleStr = `+value.main + `(middleStr); function ` + value.main + `(middleStr){`+value.code+`};`
          if (index === this.processFlowTime.length - 1){
            code += 'return middleStr;'
          }
        })
        // console.log(code);
        try{
          const result = new Function('middleStr', code);
          this.outputStr = (result(this.originalStr));
          this.dealSuccess = true
        }catch(e){
          this.errMsg = e.toString()
          this.dealSuccess = false
          console.log(e.toString());
        }
      }
    }
  }
</script>

<style scoped>
    .flow-edit{
        width: 100%;
        height: 100%;
    }
.process-node{
    height: 100%;
    overflow-y: auto;
    box-sizing: border-box;
    padding-right: 10px;
}
    .process-flow{
        height: 100%;
        overflow-y: auto;
        box-sizing: border-box;
        padding-top: 15px;
    }

    .process-text{
        height: 100%;
        overflow-y: auto;
        padding-left: 10px;
        box-sizing: border-box;
    }
</style>
