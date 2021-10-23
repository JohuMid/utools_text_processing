const electron = require('electron')
// const {NodeVM} = require('vm2');

// 获取用户选中的文字
window.getSelectText = () => {
  let ctlKey = utools.isMacOs() ? 'command' : 'control'
  utools.simulateKeyboardTap('c', ctlKey);
  return electron.clipboard.readText()
}

/*window.runCodeInVm = (cmd) => {
  const vm = createNodeVM()
  try {
    return vm.run(cmd);
  } catch (e) {
    console.log('Error: ',e)
  }
};

let createNodeVM = () => {
  return new NodeVM({
    require: {
      external: true,
      builtin: ["*"],
    },
    console: 'redirect',
    env: process.env,
  })
}*/
