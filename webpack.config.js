// const webpack = require('webpack');
//
// module.exports = {
//     mode: 'development',
//     entry: `${__dirname}/src/index.js`,
//     output: {
//         path: `${__dirname}/build`,
//         publicPath: '/build/',
//         filename: 'bundle.js',
//     },
//
//     module: {
//         rules: [
//             { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
//         ],
//     },
//
//     plugins: process.argv.indexOf('-p') === -1 ? [] : [
//         new webpack.optimize.UglifyJsPlugin({
//             output: {
//                 comments: false,
//             },
//         }),
//     ],
// };

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const featureFolder = './client/features';
const PRODUCTION = process.env.NODE_ENV === 'production';
const {
    NODE_ENV, PORT, WEBPACK_DEV_SERVER_HOST, WEBPACK_DEV_SERVER_PORT,
} = process.env;

const entryDefinition = (entryFilePath) => {
    const definition = ['react-hot-loader/patch'];

    if (!PRODUCTION) {
        definition.push(`webpack-dev-server/client?http://${WEBPACK_DEV_SERVER_HOST}:${WEBPACK_DEV_SERVER_PORT}`);
        definition.push('webpack/hot/dev-server');
    }

    definition.push(entryFilePath);

    return definition;
};

const entries = {
    dashboard: entryDefinition(`${featureFolder}/dashboard/index.js`),
    header: entryDefinition(`${featureFolder}/header/index.js`),
    login: entryDefinition(`${featureFolder}/login/index.js`),
};

const plugins = [
    new ExtractTextPlugin({
        filename: '[name].css',
    }),
];

if (!PRODUCTION) {
    plugins.push(new webpack.NamedModulesPlugin());
    plugins.push(new webpack.HotModuleReplacementPlugin());
}

const config = {
    mode: NODE_ENV,
    devtool: 'inline-source-map',
    devServer: {
        contentBase: `${process.cwd()}/public`,
        hot: true,
        historyApiFallback: true,
        publicPath: '/features/',
        stats: { colors: true },
    },
    entry: entries,
    output: {
        path: `${__dirname}/public/features`,
        chunkFilename: '[name].bundle.js',
        filename: '[name].js',
        publicPath: PRODUCTION ? '/features/' : `http://localhost:${PORT}/features/`,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                include: [`${__dirname}/client`],
            },
            {
                test: /\.(overrides|variables$)/,
                issuer: /\.less$/,
            },
            {
                test: /\.less$/,
                include: [`${__dirname}/client`],
                use: PRODUCTION
                    ? ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            {
                                loader: 'css-loader',
                                options: { minimize: true, importLoaders: 1 },
                            },
                            'postcss-loader',
                            'less-loader',
                        ],
                    })
                    : [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: { sourceMap: true, importLoaders: 1 },
                        },
                        { loader: 'postcss-loader', options: { sourceMap: true } },
                        { loader: 'less-loader', options: { sourceMap: true } },
                    ],
            },
            {
                test: /\.(gif|svg|png|jpg)$/,
                use: 'url-loader?limit=100000',
            },
            {
                test: /\.(eot|woff2?|ttf)$/,
                use: 'url-loader?limit=3000',
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                        },
                    },
                ],
            },
        ],
    },
    plugins,
    resolve: {
        alias: {
            client: `${__dirname}/client`,
        },
    },
};

module.exports = config;