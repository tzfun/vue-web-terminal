<template>
  <terminal
      :name="name"
      :title="title"
      :init-log="initLog"
      @execCmd="onExecCmd"
      @onClick="onClick"
      @onKeydown="onKeydown"
      :context.sync="context"
      :dragConf="dragConf"
      :commandStore="cmdStore"
      show-header
      @initComplete="initComplete"
      style="position: fixed">
  </terminal>
<!--  <div>-->
<!--    <div class="form-container">-->
<!--      <p class="ssh-warn">-->
<!--        为了保障你的主机安全，请勿在此填写你的非测试服务器信息，本Demo仅供测试体验使用，当然本站不会主动记录这些信息，如若发生任何信息泄露后果自负！-->
<!--      </p>-->
<!--      <p class="ssh-notice">-->
<!--        若想体验插件实现效果，建议使用非生产环境的测试机，并且体验后立即修改登录密码，或者前往Github或Gitee下载本Demo的Web&Server源码，在本地编译运行后体验。-->
<!--      </p>-->
<!--      <form ref="sshForm" autocomplete="off" @submit.prevent="_connect">-->
<!--        <input class="ssh-input" type="text" v-model="ssh.host" placeholder="Host">-->
<!--        <input class="ssh-input" type="number" v-model="ssh.port" placeholder="Port(22)">-->
<!--        <input class="ssh-input" type="text" v-model="ssh.username" placeholder="Username">-->
<!--        <input class="ssh-input" type="password" v-model="ssh.password" placeholder="Password">-->
<!--        <div align="center">-->
<!--          <button type="submit" class="ssh-btn">Connect</button>-->
<!--        </div>-->
<!--      </form>-->
<!--    </div>-->
<!--  </div>-->
</template>

<script>
import SshTerminalJs from './SshTerminal.js'
export default SshTerminalJs
</script>

<style scoped>
.ssh-notice, .ssh-warn {
  font-size: 14px;
  text-indent: 2em;
}

.ssh-warn {
  color: brown;
}

.ssh-notice {
  color: #8b949e;
}

.form-container {
  width: 90%;
  margin-top: 50px;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  padding: 30px 15px;
  background: white;
  border-radius: 5px;
  box-shadow: 1px 1px 15px rgb(0 0 0 / 20%);
}

@media screen and (min-width: 768.1px) {
  .form-container {
    width: 400px;
  }
}

.ssh-input {
  width: calc(100% - 30px);
  height: 20px;
  line-height: 20px;
  margin: 15px 0;
  border-radius: 5px;
  border-color: rgba(0,0,0,.1);
  padding: 10px 15px;
  font-size: 16px;
  color: #3a4044;
}

.ssh-input::placeholder{
  color: #8b949e;
  font-size: 15px;
}

.ssh-input, .ssh-input:focus, .ssh-input:focus-within, .ssh-input:focus-visible {
  outline: none;
}

.ssh-btn {
  width: 300px;
  height: 50px;
  color: whitesmoke;
  background: #45a2d0;
  font-size: 20px;
  line-height: 50px;
  margin: 30px auto;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  outline: none;
}

.ssh-btn:hover {
  background: #2a92c5;
}
</style>
