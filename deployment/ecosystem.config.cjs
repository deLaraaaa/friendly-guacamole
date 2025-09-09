module.exports = {
  apps: [{
    name: 'friendly-guacamole-preprod',
    script: 'index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'preproduction',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
