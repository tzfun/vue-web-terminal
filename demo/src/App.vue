<template>
  <div id="app">
    <div class="terminal-container" v-if="showLocal || showSsh">
      <LocalTerminal v-if="showLocal" @onClose="showLocal = false; localInitCmd = null" :init-cmd="localInitCmd">
      </LocalTerminal>

      <SshTerminal v-if="showSsh" @onClose="showSsh = false"></SshTerminal>
    </div>
    <div v-else>
      <div>
        <img src="/logo.svg" class="logo" alt="terminal-logo">
        <h1 class="title">vue-web-terminal</h1>
        <p class="des">A lightweight, powerful and highly extensible web page emulation command line terminal plugin.
        </p>
        <p class="des">一个轻量、功能强大、拓展性高的网页仿真命令行终端插件。</p>

        <div align="center" style="margin: 30px 0">
          <a href='https://gitee.com/tzfun/vue-web-terminal' style="margin-left: -30px;">
            <img src='https://gitee.com/tzfun/vue-web-terminal/widgets/widget_6.svg' alt='Fork me on Gitee' /></a>

          <a href="https://github.com/tzfun/vue-web-terminal" class="github-corner" aria-label="View source on GitHub">
            <svg width="80" height="80" viewBox="0 0 250 250" class="github-cat" aria-hidden="true">
              <path
                d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
                fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path>
              <path
                d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
                fill="currentColor" class="octo-body"></path>
            </svg>
            <span class="github-tag">Fork me on GitHub</span>
          </a>
        </div>
      </div>
      <div class="btn-box">
        <button v-show="!showLocal && !showSsh" @click="showLocal = true" class="btn btn-local">Get Started →</button>
        <!--        <button v-show="!showLocal && !showSsh" @click="showSsh=true" class="btn">SSH Demo</button>-->
      </div>
    </div>

  </div>
</template>

<script>
import AppJs from './App.js';

export default AppJs;
</script>

<style scoped>
h1,
p {
  text-align: center;
}

.des {
  left: 0;
  right: 0;
  margin: 15px auto;
  font-weight: 300;
}

.btn-box {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: auto;
  left: 0;
  right: 0;
  height: 100px;
  padding-bottom: 100px;
}

.btn {
  margin: 15px;
  padding: 0.5em 1.5em;
  font-size: 1.2em;
  border-radius: 5px;
  border: none;
  box-shadow: 1px 1px 15px rgb(0 0 0 / 20%);
  transition: background-color .1s ease;
  box-sizing: border-box;
  cursor: pointer;
  font-weight: bold;
}

.btn-local {
  color: #ffffff;
  background-color: #3eaf7c;
  border-color: rgba(240, 246, 252, 0.1);
  box-shadow: 0 0 transparent, 0 0 transparent;
  border-bottom: 1px solid #389d70;
}

.btn-local:hover {
  background-color: #4abf8a;
}

.terminal-container {
  position: fixed;
  z-index: 100;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.logo {
  width: 300px;
  height: 250px;
  position: relative;
  left: 50%;
  right: 0;
  margin-left: -150px;
  margin-top: 150px;
}

.title {
  margin-bottom: 50px;
  color: #2c3e50;
  font-size: 2.5em;
}

.des {
  color: #6a8bad;
  font-size: 22px;
}

@media screen and (max-width: 768px) {
  .btn-box {
    width: 100%;
  }

  .title {
    font-size: 2em;
  }

  .des {
    width: 95%;
    font-size: 1em;
  }

  .logo {
    width: 200px;
    height: 170px;
    margin: 50px 0 20px -100px;
  }
}

@media screen and (max-width: 960px) and (min-width: 768.1px) {
  .des {
    width: 70%;
  }

  .title {
    margin: 80px 0
  }

  .logo {
    margin-top: 50px;
  }
}

@media screen and (max-width: 1200px) and (min-width: 960.1px) {
  .des {
    width: 100%;
  }

  .logo {
    margin-top: 80px;
  }
}

@media screen and (min-width: 1200.1px) {
  .logo {
    margin-top: 150px;
  }
}
</style>

<style>
body,
html,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  font-family: Menlo, Consolas, monospace;
  overflow: auto;
}

/* github link style */
.github-corner {
  display: inline-block;
  position: relative;
  width: 150px;
}

.github-corner:hover .octo-arm {
  animation: octocat-wave 560ms ease-in-out
}

@keyframes octocat-wave {

  0%,
  100% {
    transform: rotate(0)
  }

  20%,
  60% {
    transform: rotate(-25deg)
  }

  40%,
  80% {
    transform: rotate(10deg)
  }
}

@media (max-width: 500px) {
  .github-corner:hover .octo-arm {
    animation: none
  }

  .github-corner .octo-arm {
    animation: octocat-wave 560ms ease-in-out
  }
}

.github-cat {
  fill: #151513;
  color: #151513;
  border: 0;
  transform: rotateZ(315deg);
  position: absolute;
  left: 0px;
  top: -42px;
}

.github-tag {
  display: inline-block;
  position: absolute;
  width: 130px;
  font-size: 10px;
  font-weight: 400;
  top: -26px;
  left: 70px;
  background-color: white;
  color: #151515;
  border: 1px solid #cfced1;
  padding: 2px;
  border-left: none;
  z-index: 1;
  font-family: monospace;
  height: 16px;
  line-height: 16px;
  border-radius: 2px;
}

.github-tag:hover {
  color: #2396a6;
}

.github-tag:after {
  content: '';
  width: 15px;
  height: 15px;
  position: absolute;
  left: -8px;
  top: 2px;
  z-index: -1;
  transform: rotateZ(45deg);
  border: 1px solid #cfced1;
  background-color: white;
  border-radius: 3px;
  border-right: none;
  border-top: none;
}
</style>
