hexo.extend.filter.register('theme_inject', function (injects) {

    // 页面加载动画  
    injects.bodyBegin.file('loader', 'source/html/loader.html');
    // ai对话页面 
    injects.bodyEnd.file('chat', 'source/html/chat.html');

});

//主页添加樱花特效
hexo.extend.injector.register('body_end', '<script type="text/javascript" src="https://catpaws.top/blog-resource/js/sakura.js"></script>', 'home');


//添加页面纸张效果
// hexo.extend.injector.register("body_begin", `<div id="wrapper"></div>`);