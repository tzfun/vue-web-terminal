import os

obj_name = 'vue-web-terminal'

if os.path.exists('lib/demo.html'):
    os.remove('lib/demo.html')
    print('removed demo.html')

if os.path.exists('lib/' + obj_name + '.common.js'):
    os.remove('lib/' + obj_name + '.common.js')
    print('removed ' + obj_name + 'common.js')

if os.path.exists('lib/' + obj_name + '.umd.js'):
    os.remove('lib/' + obj_name + '.umd.js')
    print('removed ' + obj_name + 'umd.js')

if os.path.exists('lib/' + obj_name + '.umd.min.js'):
    os.rename('lib/' + obj_name + '.umd.min.js', 'lib/' + obj_name + '.js')
    print('renamed js to ' + obj_name + '.js')