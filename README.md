# LOKE Config

Convention based configuration module using YAML for Node apps.

## Paths

The configuration exposed will be created from the following paths (settings in paths higher on the list will override those lower on the list):

- {app_path}/config.yml
- {app_path}/config/config.yml
- /private/etc/{app_name}/config.yml
- /etc/{app_name}/config.yml
- {app_path}/config/defaults.yml

## YAML

Config files are defined using YAML. See http://yaml.org/
