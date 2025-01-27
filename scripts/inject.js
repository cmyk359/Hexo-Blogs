hexo.extend.filter.register('theme_inject', function(injects) {

    // 页面加载动画  
    injects.bodyBegin.file('loader', 'source/html/loader.html');
  
    });

hexo.extend.injector.register('body_end', '<script type="text/javascript" src="https://catpaws.top/blog-resource/js/sakura.js"></script>', 'home');