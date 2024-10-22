# encoding=utf8

import subprocess
import platform

NPM_REPOSITORY="https://registry.npmjs.org"
NPM_REPOSITORY_MIRROR="https://registry.npmmirror.com"
NODE_VERSION = 18
ENCODING = "gbk" if platform.system().lower() == 'windows' else 'utf-8'

def execute(command, with_result = False,encoding = ENCODING):
    print(f"[calling]: {command}")
    if with_result:
        p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, encoding=encoding)
        stdout,stderr = p.communicate()
        if p.returncode == 0:
            return stdout
        else:
            raise Exception(f"exit with {p.returncode}, stderr: {stderr}")
    else:
        returncode = subprocess.call(command, shell=True, encoding=encoding)
        if returncode != 0:
            raise Exception(f"exit with {returncode}")

if __name__ == '__main__':
    registry = execute(f'npm config get registry', with_result=True)
    node_version = execute(f'node -v', with_result=True)
    if not node_version.startswith(f'v{NODE_VERSION}'):
        raise Exception(f'Node version must be {NODE_VERSION}')
    try:
        execute(f'pnpm install')
        execute(f'pnpm run build')
        execute(f'npm config set registry {NPM_REPOSITORY}')
        execute(f'npm publish')
    finally:
        execute(f'npm config set registry {registry}')
