const fs = require('fs')
const path = require('path')
const Parser = require("./parser");
/**
 * 生成bundle文件辅助理解：

(function(graph) {
  function require(moduleId) {
    function localRequire(relativePath) {      
      return require(graph[moduleId].dependecies[relativePath]) 
    }   
    var exports = {}    
    ;(function(require, exports, code) {      
      eval(code)    
    })(localRequire, exports, graph[moduleId].code)    
    return exports  
  }  
  require('./src/index.js')
})({  
  './src/index.js': {    
    dependecies: { './hello.js': './src/hello.js' },    
    code: '"use strict";\n\nvar _hello = require("./hello.js");\n\ndocument.write((0, _hello.say)("webpack"));'  
  },  
  './src/hello.js': {    
    dependecies: {},    
    code:      '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.say = say;\n\nfunction say(name) {\n  return "hello ".concat(name);\n}'  
  }
})

 */
class Compiler {
  constructor(options){
    const { entry, output } = options;
    this.entry = entry;
    this.output = output;
    this.modules = []
  }
  run(){
    const info = this.build(this.entry);
    this.modules.push(info);
    // for保证modules新增值能够遍历到
    for(let i=0;i<this.modules.length;i++){
      const { dependecies } = this.modules[i];
      if(dependecies){
        for (const dependency in dependecies) {
          this.modules.push(this.build(dependecies[dependency]));
        }
      }
    }
    const dependencyGraph = this.modules.reduce(
      (graph, item) => ({
        ...graph,
        [item.filename]: {
          dependecies: item.dependecies,
          code: item.code
        }
      }),
      {}
    );
    this.generate(dependencyGraph);
  }
  build(filename){
    const { getAst, getDependecies, getCode } = Parser;
    const ast = getAst(filename);
    const dependecies = getDependecies(ast, filename);
    const code = getCode(ast);
    return {
      filename,
      dependecies,
      code
    }
  }
  generate(code){
    const filePath = path.join(this.output.path, this.output.filename);
    const bundle = `
    (function(graph){
      function require(moduleId){ 
        function localRequire(relativePath){
          return require(graph[moduleId].dependecies[relativePath])
        }
        var exports = {};
        (function(require,exports,code){
          eval(code)
        })(localRequire,exports,graph[moduleId].code);
        return exports;
      }
      require('${this.entry}')
    })(${JSON.stringify(code)})`;
    fs.writeFileSync(filePath, bundle, "utf-8");
  }
}

module.exports = Compiler;

