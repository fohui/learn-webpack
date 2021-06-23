# learn-webpack
[webpack打包原理 ? 看完这篇你就懂了 !](https://juejin.cn/post/6844904038543130637#heading-11): 简易webpack实现，实现了完整打包过程，但未实现webpcak插件机制

## 简易webpack 运行流程

1. 收集webpack配置，初始化Compiler对象，执行Compiler.run()开始编译；
2. run()阶段进行webpack编译处理：
    1. 从entry指定的文件模块开始，收集该模块依赖列表，进而收集依赖的依赖信息；
    2. 生成dependencyGraph对象，保存着所有模块对应的依赖和源码；
    3. 最后调用generate()，生成最终bundle文件；
3. getDependecies()会遍历模块AST，根据ImportDeclaration找出依赖信息；
4. generate()会require所有的模块，并打包为最终的bundle文件：
    1. 首先自定义require()，并先require入口文件；
    2. eval()方法执行模块源码，源码中会使用到exports、require，需要传入其中；
    3. 自定义require()的exports能够收集所有模块的导出变量，保证所有模块正确执行；
    4. 最终，通过fs.writeFileSync写入文件。
