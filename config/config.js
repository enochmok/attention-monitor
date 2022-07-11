const config = {
    production: {
        SECRET: process.env.SECRET,
        DATABASE: process.env.MONGODB_URI
    },
    default: {
        SECRET: 'mysecretkey',
        DATABASE: 'mongodb://192.168.2.113:27017/attentionmonitordb' //MongoDB URL HERE
    }
}


exports.get = function get(env) {
    return config[env] || config.default
}