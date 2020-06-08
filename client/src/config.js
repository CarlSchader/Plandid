module.exports = {
    port: 8000,
    url: 'http://localhost:8000',
    clientBuildPath: require('path').join(__dirname, 'client', 'build'),
    indexHTMLPath: require('path').join(__dirname, 'client', 'build', 'index.html')
};