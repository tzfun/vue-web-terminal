import { sshLogin } from '@@/common/service'
import { isEmpty } from '@@/common/util'
import Terminal from 'vue-web-terminal'

export default {
  name: 'SshTerminal',
  components: { Terminal },
  data() {
    return {
      name: 'ssh-terminal',
      title: 'SSH Client',
      context: '/vue-web-terminal',
      initLog: [
        {
          class: 'warning',
          content: '为了保障你的主机安全，请勿在此填写你的非测试服务器信息，本Demo仅供测试体验使用，当然本站不会主动记录这些信息，如若发生任何信息泄露后果自负！',
        },
        {
          class: 'system',
          content: '若想体验插件实现效果，建议使用非生产环境的测试机，并且体验后立即修改登录密码，或者前往Github或Gitee下载本Demo的Web&Server源码，在本地编译运行后体验。',
        },
      ],
      cmdStore: [
        {
          key: 'ssh',
          group: 'ssh',
          usage: 'ssh [username@host:port]',
          description: 'ssh client',
        },
      ],
      dragConf: {
        width: 700,
        height: 500,
      },
      ssh: {
        host: '',
        port: 22,
        username: '',
        password: '',
      },
      asker: null,
      keydownListener: null,
    }
  },
  mounted() {
    this.keydownListener = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        if (this.asker != null) {
          Terminal.$api.pushMessage(this.name, { content: '^C' })
          this.asker.finish()
          this.asker = null
          e.preventDefault()
        }
      }
    }
    window.addEventListener('keydown', this.keydownListener)
    const width = document.body.clientWidth
    if (width < 960) {
      this.dragConf = null
    }
    else if (width >= 960 && width < 1264) {
      this.dragConf.width = '80%'
      this.dragConf.height = '80%'
    }
    else if (width >= 1264) {
      this.dragConf.width = '60%'
      this.dragConf.height = '65%'
    }
  },
  destroyed() {
    window.removeEventListener('keydown', this.keydownListener)
  },
  methods: {
    onExecCmd(key, command, success, failed) {
      if (key === 'ssh') {
        Object.assign(this.$data.ssh, this.$options.data().ssh)
        const args = command.split(' ')
        const asker = new Terminal.$Ask()
        success(asker)
        this.asker = asker
        const askPassword = {
          question: 'Input ssh login password: ',
          autoReview: true,
          isPassword: true,
          callback: (value) => {
            this.ssh.password = value
            sshLogin(this.ssh).then((r) => {
              Terminal.$api.pushMessage(this.name, { content: r })
            }).catch((e) => {
              Terminal.$api.pushMessage(this.name, {
                class: 'error',
                content: `ssh connect failed: ${e.message}`,
              })
            }).finally(() => {
              this.asker = null
              asker.finish()
            })
          },
        }
        if (isEmpty(args[1])) {
          const askUsername = {
            question: 'Input ssh login username: ',
            autoReview: true,
            callback: (value) => {
              if (isEmpty(value)) {
                Terminal.$api.pushMessage(this.name, {
                  content: '<span style="color:red;">Username can not be empty.</span>',
                })
                asker.ask(askUsername)
              }
              else {
                this.ssh.username = value
                asker.ask(askPassword)
              }
            },
          }

          const askPort = {
            question: 'Input ssh port(default is 22): ',
            autoReview: true,
            callback: (value) => {
              if (!isEmpty(value))
                this.ssh.port = value

              asker.ask(askUsername)
            },
          }

          const askHost = {
            question: 'Input ssh login host(example 127.0.0.1): ',
            autoReview: true,
            callback: (value) => {
              if (isEmpty(value)) {
                Terminal.$api.pushMessage(this.name, {
                  content: '<span style="color:red;">Host can not be empty.</span>',
                })
                asker.ask(askHost)
              }
              else {
                this.ssh.host = value
                asker.ask(askPort)
              }
            },
          }
          asker.ask(askHost)
        }
        else {
          let split = args[1].split('@')
          this.ssh.username = split[0]
          split = split[1].split(':')
          this.ssh.host = split[0]
          if (!isEmpty(split[1]))
            this.ssh.port = split[1]

          asker.ask(askPassword)
        }
      }
      else {
        failed('Unknown command')
      }
    },
    onClick(key) {
      if (key === 'close')
        this.$emit('onClose')
    },
    initComplete() {
      Terminal.$api.execute(this.name, 'ssh')
    },
  },
}
