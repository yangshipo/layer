/*!

 @Name：layer mobile v1.8 弹层组件移动版
 @Author：贤心
 @Site：http://layer.layui.com/mobie/
 @License：LGPL
    
 */

;!function(win){
"use strict";

var doc = document, query = 'querySelectorAll', claname = 'getElementsByClassName', S = function(s){
  return doc[query](s);
};

//默认配置
var config = {
   type: 0,
   shade: true,
   shadeClose: true,
   fixed: true,
   anim: true
};

var ready = {
  extend: function(obj){
    var newobj = JSON.parse(JSON.stringify(config));
    for(var i in obj){
      console.log(i);
      newobj[i] = obj[i];
    }
    console.log(newobj);
    return newobj;
  }, 
  timer: {}, end: {}
};

//点触事件
ready.touch = function(elem, fn){
  var move;
  if(!/Android|iPhone|SymbianOS|Windows Phone|iPad|iPod/.test(navigator.userAgent)){
    return elem.addEventListener('click', function(e){
      fn.call(this, e);
    }, false);
  }
  elem.addEventListener('touchmove', function(){
    move = true;
  }, false);
  elem.addEventListener('touchend', function(e){
    e.preventDefault();
    move || fn.call(this, e);
    move = false;
  }, false); 
};

var index = 0, classs = ['layermbox'], Layer = function(options){
  var that = this;

  console.log(typeof  options);

  //生成配置对象；如何解决配置与默认配置中重合的部分？循环部分的i为key。
  that.config = ready.extend(options);

  //有了配置以后就可以根据配置进行显示了
  that.view();
};

Layer.prototype.view = function(){
  var that = this, config = that.config, layerbox = doc.createElement('div');

  that.id = layerbox.id = classs[0] + index;
  layerbox.setAttribute('class', classs[0] + ' ' + classs[0]+(config.type || 0));
  layerbox.setAttribute('index', index);

  var title = (function(){
    var titype = typeof config.title === 'object';
    return config.title
    ? '<h3 style="'+ (titype ? config.title[1] : '') +'">'+ (titype ? config.title[0] : config.title)  +'</h3><button class="layermend"></button>'
    : '';
  }());
  
  var button = (function(){
    var btns = (config.btn || []).length, btndom;
    if(btns === 0 || !config.btn){
      return '';
    }
    btndom = '<span type="1">'+ config.btn[0] +'</span>'
    if(btns === 2){
      btndom = '<span type="0">'+ config.btn[1] +'</span>' + btndom;
    }
    return '<div class="layermbtn">'+ btndom + '</div>';
  }());
  
  if(!config.fixed){
    config.top = config.hasOwnProperty('top') ?  config.top : 100;
    config.style = config.style || '';
    config.style += ' top:'+ ( doc.body.scrollTop + config.top) + 'px';
  }
  
  if(config.type === 2){
    config.content = '<i></i><i class="laymloadtwo"></i><i></i>';
  }
  
  layerbox.innerHTML = (config.shade ? '<div '+ (typeof config.shade === 'string' ? 'style="'+ config.shade +'"' : '') +' class="laymshade"></div>' : '')
  +'<div class="layermmain" '+ (!config.fixed ? 'style="position:static;"' : '') +'>'
    +'<div class="section">'
      +'<div class="layermchild '+ (config.className ? config.className : '') +' '+ ((!config.type && !config.shade) ? 'layermborder ' : '') + (config.anim ? 'layermanim' : '') +'" ' + ( config.style ? 'style="'+config.style+'"' : '' ) +'>'
        + title
        +'<div class="layermcont">'+ config.content +'</div>'
        + button
      +'</div>'
    +'</div>'
  +'</div>';
  
  if(!config.type || config.type === 2){
    var dialogs = doc[claname](classs[0] + config.type), dialen = dialogs.length;
    if(dialen >= 1){
      layer.close(dialogs[0].getAttribute('index'))
    }
  }
  
  document.body.appendChild(layerbox);
  var elem = that.elem = S('#'+that.id)[0];
  config.success && config.success(elem);
  
  that.index = index++;
  that.action(config, elem);
};

Layer.prototype.action = function(config, elem){
  var that = this;
  
  //自动关闭
  if(config.time){
    ready.timer[that.index] = setTimeout(function(){
      layer.close(that.index);
    }, config.time*1000);
  }
  
  //关闭按钮
  if(config.title){
    var end = elem[claname]('layermend')[0], endfn = function(){
      config.cancel && config.cancel();
      layer.close(that.index);
    };
    ready.touch(end, endfn);
  }
  
  //确认取消
  var btn = function(){
    var type = this.getAttribute('type');
    if(type == 0){
      config.no && config.no();
      layer.close(that.index);
    } else {
      config.yes ? config.yes(that.index) : layer.close(that.index);
    }
  };
  if(config.btn){
    var btns = elem[claname]('layermbtn')[0].children, btnlen = btns.length;
    for(var ii = 0; ii < btnlen; ii++){
      ready.touch(btns[ii], btn);
    }
  }
  
  //点遮罩关闭
  if(config.shade && config.shadeClose){
    var shade = elem[claname]('laymshade')[0];
    ready.touch(shade, function(){
      layer.close(that.index, config.end);
    });
  }

  config.end && (ready.end[that.index] = config.end);
};

win.layer = {
  v: '1.8',
  index: index,
  
  //核心方法
  open: function(options){
    var o = new Layer(options || {});
    return o.index;
  },
  
  close: function(index){
    var ibox = S('#'+classs[0]+index)[0];
    if(!ibox) return;
    ibox.innerHTML = '';
    doc.body.removeChild(ibox);
    clearTimeout(ready.timer[index]);
    delete ready.timer[index];
    typeof ready.end[index] === 'function' && ready.end[index]();
    delete ready.end[index]; 
  },
  
  //关闭所有layer层
  closeAll: function(){
    var boxs = doc[claname](classs[0]);
    for(var i = 0, len = boxs.length; i < len; i++){
      layer.close((boxs[0].getAttribute('index')|0));
    }
  }
};



//这个js加载完以后，首先执行这里。
'function' == typeof define ? define(function() {
  return layer;
}) : function(){

  //这一句是干什么的?获取当前Javascript脚本文件的路径，在特定场景下可能需要，比如写模块加载器。
  var js = document.scripts, script = js[js.length - 1], jsPath = script.src;

  var path = jsPath.substring(0, jsPath.lastIndexOf("/") + 1);
  // console.log(path);

  //如果合并方式，则需要单独引入layer.css
  if(script.getAttribute('merge')) return; 

  //在document的头部引入css文件
  document.head.appendChild(function(){
    var link = doc.createElement('link');
    link.href = path + 'need/layer.css';
    link.type = 'text/css';
    link.rel = 'styleSheet'
    link.id = 'layermcss';
    return link;
  }());
  
}();

}(window);

/**
 * 执行过程：
 * 1、首先修改document,在里面添加css的链接，(使用了简单的加载器)。
 * 2、调用open()方法，通过调用Layer()的构造方法，实例化对象。
 * 3、Layer()构造方法内完成：生成配置对象；根据配置进行显示
 * 4、this.view()根据配置进行显示（注意view是公共方法）：
 *
 * 5、action()待命，根据用户的后续操作调用相应的函数。
 *      首先判断是否配置了该操作，如果有，再根据touch事件或者settimeout来执行操作。
 * 6、通过win.layer将layer绑定到window从而向外部公开api.
 */

/**
 * 疑问？
 * 1、that = this
 * 2、prototype如何解决多个弹框的继承问题？
 * 3、向外部公开api是通过绑定到window上面，为什么不是var Layer ={}；那样在外面不是照样可以用？
 */

/**
 * 1、大致读框架----完成
 * 2、view---------
 * 3、action-------
 * 4、解决疑问------
 * 5、总结---------
 */