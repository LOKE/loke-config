# LOKE Config

Convention based configuration module using YAML for Node apps.

## Paths

The configuration exposed will be created from the following paths (settings in paths higher on the list will override those lower on the list):

- {app_path}/config.yml
- {app_path}/config/config.yml
- /private/etc/{app_name}/config.yml
- /etc/{app_name}/config.yml
- {app_path}/config/defaults.yml

However, if the process has a `--config [filename]` argument, then that file will be used instead.

The `defaults.yml` file is required, and all configuration keys must have a value listed in the `defaults.yml`.

## YAML

Config files are defined using YAML. See http://yaml.org/

## How to Use

Example defaults.yml:
```yaml
server:
  hostname: www.myapp.com
  port: 80
```

```js
var config = require('loke-config').create('myapp');

var hostname = config.get('server.hostname');
var port = config.get('server.port');

console.log(hostname); // www.myapp.com
console.log(port); // 80
```
