
// 启用插件
fis.hook('relative');


// Global start
fis.match('**', {
    // domain: '.',
    useHash: false,
    // release: '$0',
    relative: true
});

// fis.match('::image', {
//     useHash: true
// });

fis.match('static/{app,lib,display}/**.js', {
    optimizer: fis.plugin('uglify-js') ,// js 压缩
});

fis.match('static/**.css', {
    optimizer: fis.plugin('clean-css') // css 压缩
});
