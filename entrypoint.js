const { execSync } = require('child_process');
const fs = require('fs');

envParser({
  repoOrg: {
    usage: 'Repo Org',
    env: 'INPUT_REPO_ORG,GITHUB_REPOSITORY_OWNER,PLUGIN_REPO_ORG,DRONE_REPO_OWNER'
  },
  repoName: {
    usage: 'Repo Name',
    env: 'INPUT_REPO_NAME,GITHUB_REPOSITORY,PLUGIN_REPO_NAME,DRONE_REPO_NAME',
  },
  starCount: {
    usage: 'Star Count',
    env: 'INPUT_STAR_COUNT,PLUGIN_STAR_COUNT',
    def: 100,
  },
  duration: {
    usage: 'Duration (seconds)',
    env: 'INPUT_DURATION,PLUGIN_DURATION',
    def: 15
  }
})(repoProps => {
  repoProps.repoName = repoProps.repoName.split('/').reverse()[0];

  fs.writeFileSync('./input-props.json', JSON.stringify(repoProps));

  execSync('npm run build -- --props="./input-props.json"');
});

function envParser(configs) {
  const ret = {};
  for (const configName in configs) {
    const { env, def } = configs[configName];
    if (def !== undefined) {
      ret[configName] = typeof def === 'function' ? def() : def;
    }
    env.split(/\s*,\s*/).some(envar => {
      if (process.env.hasOwnProperty(envar)) {
        ret[configName] = process.env[envar];
        return true;
      }
      return false;
    });
  }
  return fn => fn(ret);
}