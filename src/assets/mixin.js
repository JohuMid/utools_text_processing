export default {
  methods:{
    putDb(obj){
      obj = obj._rev?{_id: obj._id, data: obj.data, _rev:obj._rev}:{_id: obj._id, data: obj.data}
      // eslint-disable-next-line no-undef
      utools.db.put(obj)
    },
    getDb(str){
      // eslint-disable-next-line no-undef
      return utools.db.get(str)?utools.db.get(str).data:null
    },
    getRev(str){
      // eslint-disable-next-line no-undef
      return utools.db.get(str)?utools.db.get(str)._rev:null
    },
    putRevDb(str,data){
      this.putDb({
        _id: str,
        data: data,
        _rev: this.getRev(str)
      })
    },
    setFunc(row){
      // eslint-disable-next-line no-undef
      utools.setFeature({
        "code": row.id,
        "explain": row.name,
        "cmds": [
          {
            "type": "regex",
            "label": row.name,
            "match": "/.*?/",
            "minNum": 1
          }
        ]
      })
    },
    removeFunc(row){
      // eslint-disable-next-line no-undef
      utools.removeFeature(row.id)
    },
    hideWindow(){
      // eslint-disable-next-line no-undef
      utools.hideMainWindow()
    },
    exitPlugin(){
      // eslint-disable-next-line no-undef
      utools.outPlugin()
    },
    setHeight(num){
      // eslint-disable-next-line no-undef
      utools.setExpendHeight(num)
    },
    showNote(str) {
      // eslint-disable-next-line no-undef
      utools.showNotification(str)
    },
    utoolsCopy(str){
      // eslint-disable-next-line no-undef
      utools.copyText(str)
    },
    utoolsPaste(){
      if (this.diffOs()){
        // macos 模拟粘贴
        // eslint-disable-next-line no-undef
        utools.simulateKeyboardTap('v', 'command')
      } else {
        // windows linux 模拟粘贴
        // eslint-disable-next-line no-undef
        utools.simulateKeyboardTap('v', 'ctrl')
      }
    },
    diffOs(){
      // eslint-disable-next-line no-undef
      return !!utools.isMacOs();
    }

  }
}
